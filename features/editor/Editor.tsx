import { useState } from "react";
import { Brand } from "../../components/Brand";
import { calculateIndicators } from "../../domain/coherence";
import type { ResearchProject } from "../../domain/models/project";
import { CanvasView } from "../canvas/CanvasView";
import { CoherenceView } from "../coherence/CoherenceView";
import { PresentationView } from "../presentation/PresentationView";
import { exportCanvasJpg, exportCanvasPdf, exportCanvasPptx } from "../../services/export/exporters";
import { ApproachSection, ContextSection, ExportSection, IdentificationSection, PlanningSection, PurposeSection } from "./EditorSections";

export type EditorMode = "project" | "canvas" | "coherence" | "presentation" | "export";
export type EditorStep = "identification" | "context" | "purpose" | "approach" | "planning" | "review" | "export";

const steps: Array<{ id: EditorStep; label: string }> = [
  { id: "identification", label: "Identificação" }, { id: "context", label: "Contexto" }, { id: "purpose", label: "Propósito" }, { id: "approach", label: "Abordagem" }, { id: "planning", label: "Planejamento" }, { id: "review", label: "Revisão" }, { id: "export", label: "Exportação" },
];

export function Editor({ project, onChange, onBack, saveState, onSnapshot }: { project: ResearchProject; onChange: (project: ResearchProject) => void; onBack: () => void; saveState: "saving" | "saved" | "error"; onSnapshot: () => void }) {
  const [mode, setMode] = useState<EditorMode>("project");
  const [step, setStep] = useState<EditorStep>("context");
  const indicators = calculateIndicators(project);
  const navigateStep = (target: string) => { setMode("project"); setStep(target as EditorStep); };
  const completed = (target: EditorStep) => {
    if (target === "identification") return Boolean(project.identification.student && project.identification.provisionalTitle);
    if (target === "context") return Boolean(project.context.problematic && (project.context.researchQuestion || project.context.researchProblem) && project.context.constructs.length);
    if (target === "purpose") return Boolean(project.purpose.generalObjective && project.purpose.specificObjectives.length);
    if (target === "approach") return Boolean(project.approach.worldview && project.approach.methods.length);
    if (target === "planning") return Boolean(project.planning.procedures.length);
    return target === "review" ? indicators.reviewCount === 0 : false;
  };
  return (
    <main className="editor-shell">
      <header className="editor-topbar">
        <button type="button" className="brand-button" onClick={onBack} aria-label="Voltar aos projetos"><Brand /></button>
        <nav className="mode-nav" aria-label="Modos do projeto">
          {[{ id: "project", label: "Projeto" }, { id: "canvas", label: "Canvas" }, { id: "coherence", label: "Coerência" }, { id: "presentation", label: "Apresentação" }, { id: "export", label: "Exportar" }].map((item) => <button type="button" className={mode === item.id ? "active" : ""} key={item.id} onClick={() => setMode(item.id as EditorMode)}>{item.label}{item.id === "coherence" && indicators.reviewCount > 0 && <span>{indicators.reviewCount}</span>}</button>)}
        </nav>
        <div className={`save-state save-state--${saveState}`}><i />{saveState === "saving" ? "Salvando…" : saveState === "error" ? "Falha ao salvar" : "Salvo localmente"}</div>
      </header>
      <div className={`editor-layout ${mode !== "project" ? "editor-layout--wide" : ""}`}>
        {mode === "project" && <aside className="step-sidebar"><button type="button" className="back-link" onClick={onBack}>← Todos os projetos</button><div className="step-sidebar__project"><small>Projeto atual</small><strong>{project.identification.provisionalTitle}</strong><span>{indicators.completion}% preenchido</span><div><i style={{ width: `${indicators.completion}%` }} /></div></div><nav aria-label="Etapas do editor">{steps.map((item, index) => <button type="button" className={`${step === item.id ? "active" : ""} ${completed(item.id) ? "complete" : ""}`} key={item.id} onClick={() => setStep(item.id)}><span>{completed(item.id) ? "✓" : index + 1}</span><strong>{item.label}</strong>{item.id === "review" && indicators.reviewCount > 0 && <em>{indicators.reviewCount}</em>}</button>)}</nav><div className="sidebar-help"><strong>Precisa de contexto?</strong><p>Abra “Entenda este campo” em cada seção.</p></div></aside>}
        <section className="editor-main">
          {mode === "project" && <EditorStepContent step={step} project={project} onChange={onChange} onStep={setStep} onSnapshot={onSnapshot} />}
          {mode === "canvas" && <div className="canvas-mode"><header className="mode-heading"><div><span className="eyebrow">Visão integral</span><h1>Canvas da pesquisa</h1><p>Uma síntese editorial do mesmo modelo de dados utilizado pelo editor.</p></div><CanvasExportActions project={project} /></header><div className="canvas-stage"><CanvasView project={project} /></div></div>}
          {mode === "coherence" && <CoherenceView project={project} onEdit={navigateStep} />}
          {mode === "presentation" && <PresentationView project={project} />}
          {mode === "export" && <ExportSection project={project} onSnapshot={onSnapshot} />}
        </section>
      </div>
    </main>
  );
}

function CanvasExportActions({ project }: { project: ResearchProject }) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const execute = async (label: string, action: () => Promise<void>) => {
    setExporting(label);
    setError("");
    try { await action(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível gerar o arquivo."); } finally { setExporting(null); }
  };
  return <div className="canvas-export-actions"><div><button type="button" className="button button--secondary" disabled={Boolean(exporting)} onClick={() => execute("jpg", () => exportCanvasJpg(project))}>{exporting === "jpg" ? "Gerando…" : "Baixar JPG"}</button><button type="button" className="button button--secondary" disabled={Boolean(exporting)} onClick={() => execute("pptx", () => exportCanvasPptx(project))}>{exporting === "pptx" ? "Gerando…" : "Baixar PPTX"}</button><button type="button" className="button button--primary" disabled={Boolean(exporting)} onClick={() => execute("pdf", () => exportCanvasPdf(project))}>{exporting === "pdf" ? "Gerando…" : "Baixar PDF"}</button><button type="button" className="button button--secondary" onClick={() => document.getElementById("print-canvas")?.requestFullscreen?.()}>Tela cheia</button></div>{error && <p role="alert">{error}</p>}</div>;
}

function EditorStepContent({ step, project, onChange, onStep, onSnapshot }: { step: EditorStep; project: ResearchProject; onChange: (project: ResearchProject) => void; onStep: (step: EditorStep) => void; onSnapshot: () => void }) {
  const next: Record<EditorStep, EditorStep | null> = { identification: "context", context: "purpose", purpose: "approach", approach: "planning", planning: "review", review: "export", export: null };
  const content = step === "identification" ? <IdentificationSection project={project} onChange={onChange} /> : step === "context" ? <ContextSection project={project} onChange={onChange} /> : step === "purpose" ? <PurposeSection project={project} onChange={onChange} /> : step === "approach" ? <ApproachSection project={project} onChange={onChange} /> : step === "planning" ? <PlanningSection project={project} onChange={onChange} /> : step === "review" ? <CoherenceView project={project} onEdit={(target) => onStep(target as EditorStep)} /> : <ExportSection project={project} onSnapshot={onSnapshot} />;
  return (
    <div className="editor-step">
      {content}
      {step !== "review" && step !== "export" && <footer className="editor-step__footer"><span>As alterações são salvas automaticamente.</span>{next[step] && <button type="button" className="button button--primary" onClick={() => onStep(next[step]!)}>Salvar e continuar →</button>}</footer>}
    </div>
  );
}
