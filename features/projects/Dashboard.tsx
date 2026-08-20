import { useMemo, useRef, useState } from "react";
import { Brand } from "../../components/Brand";
import { calculateIndicators } from "../../domain/coherence";
import type { ResearchProject } from "../../domain/models/project";
import type { ProjectArtifact } from "../../services/export/exporters";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function Dashboard({ projects, onOpen, onCreate, onDuplicate, onRename, onDelete, onExport, onExportBatch, onArtifact, onImport, onHome }: {
  projects: ResearchProject[];
  onOpen: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (project: ResearchProject) => void;
  onRename: (project: ResearchProject, title: string) => void;
  onDelete: (project: ResearchProject) => void;
  onExport: (project: ResearchProject) => void;
  onExportBatch: (projects: ResearchProject[]) => void;
  onArtifact: (project: ResearchProject, artifact: ProjectArtifact) => void;
  onImport: (files: File[]) => void;
  onHome: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const filtered = useMemo(() => projects.filter((project) => `${project.identification.provisionalTitle} ${project.identification.student}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [projects, query]);
  const selectedProjects = projects.filter((project) => selected.has(project.id));
  const allVisibleSelected = filtered.length > 0 && filtered.every((project) => selected.has(project.id));
  const toggle = (id: string) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleAllVisible = () => setSelected((current) => {
    const next = new Set(current);
    if (allVisibleSelected) filtered.forEach((project) => next.delete(project.id));
    else filtered.forEach((project) => next.add(project.id));
    return next;
  });
  return (
    <main className="dashboard">
      <header className="app-topbar">
        <button type="button" className="brand-button" onClick={onHome}><Brand /></button>
        <div className="topbar-actions"><button type="button" className="button button--ghost" onClick={() => fileRef.current?.click()}>Importar projetos</button><button type="button" className="button button--primary" onClick={onCreate}>+ Novo Canvas</button></div>
        <input ref={fileRef} type="file" hidden multiple accept="application/json,.json" onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) onImport(files); event.currentTarget.value = ""; }} />
      </header>
      <section className="dashboard__content">
        <div className="dashboard__heading"><div><span className="eyebrow">Área de trabalho local</span><h1>Seus projetos de pesquisa</h1><p>Selecione, exporte em lote ou abra um Canvas para continuar a pesquisa.</p></div><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por título ou estudante" aria-label="Buscar projetos" /></label></div>
        {projects.length > 0 && <div className="batch-toolbar"><label><input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} /><span>{allVisibleSelected ? "Desmarcar visíveis" : "Selecionar visíveis"}</span></label><div><span>{selected.size ? `${selected.size} selecionado${selected.size > 1 ? "s" : ""}` : "Selecione projetos para ações em lote"}</span><button type="button" className="button button--secondary" disabled={!selectedProjects.length} onClick={() => onExportBatch(selectedProjects)}>Exportar selecionados</button><button type="button" className="button button--secondary" onClick={() => onExportBatch(projects)}>Exportar todos</button><button type="button" className="button button--secondary" onClick={() => fileRef.current?.click()}>Importar em lote</button></div></div>}
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state__canvas"><i /><i /><i /><i /></div><h2>{projects.length ? "Nenhum projeto encontrado" : "Seu primeiro Canvas começa aqui"}</h2><p>{projects.length ? "Tente buscar por outro título ou estudante." : "Crie um projeto estruturado ou importe um ou vários backups JSON."}</p><button type="button" className="button button--primary" onClick={onCreate}>Criar novo Canvas</button></div>
        ) : (
          <div className="project-grid">
            {filtered.map((project) => {
              const indicators = calculateIndicators(project);
              return (
                <article className={`project-card ${selected.has(project.id) ? "project-card--selected" : ""}`} key={project.id}>
                  <header><label className="project-select"><input type="checkbox" checked={selected.has(project.id)} onChange={() => toggle(project.id)} /><span className="sr-only">Selecionar {project.identification.provisionalTitle}</span></label><span className={`status status--${project.status.toLowerCase().replaceAll(" ", "-")}`}>{project.isDemo ? "Exemplo" : project.status}</span><ProjectMenu project={project} onDuplicate={onDuplicate} onRename={onRename} onDelete={onDelete} onExport={onExport} onArtifact={onArtifact} /></header>
                  <button type="button" className="project-card__main" onClick={() => onOpen(project.id)}>
                    <div className="project-card__glyph" aria-hidden="true"><span /><span /><span /></div>
                    <h2>{project.identification.provisionalTitle}</h2>
                    <p>{project.identification.student || "Estudante não informado"}</p>
                    <dl><div><dt>Curso</dt><dd>{project.identification.course}</dd></div><div><dt>Área</dt><dd>{project.identification.concentrationArea || "A definir"}</dd></div></dl>
                    <div className="progress-line"><span style={{ width: `${indicators.completion}%` }} /><small>{indicators.completion}% preenchido</small></div>
                  </button>
                  <footer><span>Alterado em {formatDate(project.updatedAt)}</span><button type="button" onClick={() => onOpen(project.id)}>Abrir <b>→</b></button></footer>
                </article>
              );
            })}
            <button type="button" className="new-project-card" onClick={onCreate}><span>+</span><strong>Novo Canvas</strong><small>Iniciar uma estrutura de pesquisa</small></button>
          </div>
        )}
      </section>
    </main>
  );
}

function ProjectMenu({ project, onDuplicate, onRename, onDelete, onExport, onArtifact }: { project: ResearchProject; onDuplicate: (p: ResearchProject) => void; onRename: (p: ResearchProject, title: string) => void; onDelete: (p: ResearchProject) => void; onExport: (p: ResearchProject) => void; onArtifact: (p: ResearchProject, artifact: ProjectArtifact) => void }) {
  return (
    <details className="project-menu">
      <summary aria-label="Ações do projeto">•••</summary>
      <div>
        <button type="button" onClick={() => { const title = prompt("Novo título", project.identification.provisionalTitle); if (title?.trim()) onRename(project, title.trim()); }}>Renomear</button>
        <button type="button" onClick={() => onDuplicate(project)}>Duplicar</button>
        <span>Canvas</span>
        <button type="button" onClick={() => onArtifact(project, "canvas-jpg")}>Exportar Canvas em JPG</button>
        <button type="button" onClick={() => onArtifact(project, "canvas-pdf")}>Exportar Canvas em PDF</button>
        <button type="button" onClick={() => onArtifact(project, "canvas-pptx")}>Exportar Canvas em PPTX</button>
        <span>Apresentação</span>
        <button type="button" onClick={() => onArtifact(project, "presentation-pdf")}>Exportar apresentação em PDF</button>
        <button type="button" onClick={() => onArtifact(project, "presentation-pptx")}>Exportar apresentação em PPTX</button>
        <span>Dados</span>
        <button type="button" onClick={() => onExport(project)}>Exportar backup JSON</button>
        <button type="button" className="danger" onClick={() => onDelete(project)}>Excluir</button>
      </div>
    </details>
  );
}
