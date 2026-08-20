"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { About, Landing } from "../features/landing/Landing";
import { Dashboard } from "../features/projects/Dashboard";
import { Editor } from "../features/editor/Editor";
import { CanvasView } from "../features/canvas/CanvasView";
import { createDemoProject, createEmptyProject, uid, type ResearchProject } from "../domain/models/project";
import { projectStorage } from "../services/storage/indexedDb";
import { exportCanvasJpg, exportCanvasPdf, exportCanvasPptx, exportPresentationPdf, exportProjectBackup, exportProjectPptx, exportProjectsBackup, parseProjectBackups, type ProjectArtifact } from "../services/export/exporters";

type AppView = "landing" | "about" | "dashboard" | "editor";

export default function Home() {
  const [view, setView] = useState<AppView>("landing");
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [current, setCurrent] = useState<ResearchProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"saving" | "saved" | "error">("saved");
  const [toast, setToast] = useState<string | null>(null);
  const [captureProject, setCaptureProject] = useState<ResearchProject | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      let items = await projectStorage.list();
      if (items.length === 0 && localStorage.getItem("research-canvas-demo-seeded") !== "1") {
        const demo = createDemoProject();
        await projectStorage.save(demo);
        localStorage.setItem("research-canvas-demo-seeded", "1");
        items = [demo];
      }
      setProjects(items);
    } catch (error) {
      console.error(error);
      notify("Não foi possível abrir o armazenamento local.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { const timer = setTimeout(() => void loadProjects(), 0); return () => clearTimeout(timer); }, [loadProjects]);
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const saveProject = (project: ResearchProject) => {
    const next = { ...project, updatedAt: new Date().toISOString(), status: project.status === "Rascunho" ? "Em desenvolvimento" as const : project.status };
    setCurrent(next);
    setProjects((items) => items.map((item) => item.id === next.id ? next : item));
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try { await projectStorage.save(next); setSaveState("saved"); }
      catch (error) { console.error(error); setSaveState("error"); }
    }, 650);
  };

  const createProject = async () => {
    const project = createEmptyProject();
    await projectStorage.save(project);
    setProjects((items) => [...items, project]);
    setCurrent(project);
    setView("editor");
    notify("Novo Canvas criado.");
  };

  const openProject = async (id: string) => {
    const project = projects.find((item) => item.id === id) ?? await projectStorage.get(id);
    if (!project) return notify("Projeto não encontrado.");
    setCurrent(project);
    setView("editor");
  };

  const duplicateProject = async (project: ResearchProject) => {
    const now = new Date().toISOString();
    const copy = structuredClone(project);
    copy.id = uid(); copy.createdAt = now; copy.updatedAt = now; copy.isDemo = false;
    copy.identification.provisionalTitle = `${project.identification.provisionalTitle} — cópia`;
    copy.snapshots = [];
    await projectStorage.save(copy);
    setProjects((items) => [...items, copy]);
    notify("Projeto duplicado.");
  };

  const renameProject = async (project: ResearchProject, title: string) => {
    const next = { ...project, updatedAt: new Date().toISOString(), identification: { ...project.identification, provisionalTitle: title } };
    await projectStorage.save(next);
    setProjects((items) => items.map((item) => item.id === next.id ? next : item));
    notify("Projeto renomeado.");
  };

  const deleteProject = async (project: ResearchProject) => {
    if (!confirm(`Excluir “${project.identification.provisionalTitle}”? Esta ação remove os dados locais deste navegador.`)) return;
    await projectStorage.remove(project.id);
    setProjects((items) => items.filter((item) => item.id !== project.id));
    notify("Projeto excluído.");
  };

  const importBackups = async (files: File[]) => {
    try {
      const imported = await parseProjectBackups(files);
      const ids = new Set(projects.map((item) => item.id));
      imported.forEach((project) => { while (ids.has(project.id)) project.id = uid(); ids.add(project.id); });
      await Promise.all(imported.map((project) => projectStorage.save(project)));
      setProjects((items) => [...items, ...imported]);
      notify(`${imported.length} projeto${imported.length > 1 ? "s" : ""} importado${imported.length > 1 ? "s" : ""} com sucesso.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível importar os backups.");
    }
  };

  const exportArtifact = async (project: ResearchProject, artifact: ProjectArtifact) => {
    setCaptureProject(project);
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    try {
      if (artifact === "canvas-jpg") await exportCanvasJpg(project, "dashboard-canvas-capture");
      if (artifact === "canvas-pdf") await exportCanvasPdf(project, "dashboard-canvas-capture");
      if (artifact === "canvas-pptx") await exportCanvasPptx(project, "dashboard-canvas-capture");
      if (artifact === "presentation-pdf") await exportPresentationPdf(project, "dashboard-canvas-capture");
      if (artifact === "presentation-pptx") await exportProjectPptx(project);
      notify("Arquivo gerado com sucesso.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Não foi possível gerar o arquivo.");
    } finally {
      setCaptureProject(null);
    }
  };

  const createSnapshot = () => {
    if (!current) return;
    const copy = structuredClone(current);
    const { snapshots: _ignored, ...data } = copy;
    void _ignored;
    const snapshot = { id: uid(), label: current.versionLabel, createdAt: new Date().toISOString(), data };
    saveProject({ ...current, snapshots: [...current.snapshots, snapshot] });
    notify("Snapshot criado no projeto.");
  };

  const closeEditor = () => {
    if (!current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    void projectStorage.save(current).then(async () => {
      setProjects(await projectStorage.list());
      setView("dashboard");
      setCurrent(null);
      setSaveState("saved");
    }).catch(() => notify("Não foi possível concluir o salvamento."));
  };

  if (loading) return <main className="loading-screen"><div className="loading-mark"><i /><i /><i /><i /></div><strong>Research Canvas EGC</strong><span>Preparando sua área de trabalho…</span></main>;

  return <>{view === "landing" && <Landing onCreate={() => void createProject()} onOpen={() => setView("dashboard")} onAbout={() => setView("about")} />}{view === "about" && <About onBack={() => setView("landing")} onCreate={() => void createProject()} />}{view === "dashboard" && <Dashboard projects={projects} onOpen={(id) => void openProject(id)} onCreate={() => void createProject()} onDuplicate={(project) => void duplicateProject(project)} onRename={(project, title) => void renameProject(project, title)} onDelete={(project) => void deleteProject(project)} onExport={exportProjectBackup} onExportBatch={exportProjectsBackup} onArtifact={(project, artifact) => void exportArtifact(project, artifact)} onImport={(files) => void importBackups(files)} onHome={() => setView("landing")} />}{view === "editor" && current && <Editor project={current} onChange={saveProject} saveState={saveState} onSnapshot={createSnapshot} onBack={closeEditor} />}{captureProject && <div className="dashboard-export-capture" aria-hidden="true"><CanvasView project={captureProject} elementId="dashboard-canvas-capture" /></div>}{toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}</>;
}
