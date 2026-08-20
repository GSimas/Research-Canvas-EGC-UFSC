import type { ResearchProject } from "../../domain/models/project";

const shorten = (text: string, max = 330) => !text ? "Preencha esta seção" : text.length > max ? `${text.slice(0, max).trim()}…` : text;

function Cell({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return <section className={`canvas-cell ${className}`}><h3>{title}</h3><div>{children}</div></section>;
}

export function CanvasView({ project, compact = false, elementId = "print-canvas" }: { project: ResearchProject; compact?: boolean; elementId?: string }) {
  const formulation = [project.context.researchQuestion, project.context.researchProblem, ...project.context.hypotheses.map((item) => item.text)].filter(Boolean).join(" · ");
  return (
    <article className={`research-canvas ${compact ? "research-canvas--compact" : ""}`} id={elementId}>
      <header className="research-canvas__meta"><div><small>Research Canvas EGC</small><h2>{project.identification.provisionalTitle}</h2></div><dl><div><dt>Estudante</dt><dd>{project.identification.student || "—"}</dd></div><div><dt>Curso</dt><dd>{project.identification.course}</dd></div><div><dt>Área</dt><dd>{project.identification.concentrationArea || "—"}</dd></div></dl></header>
      <div className="canvas-quadrants">
        <section className="canvas-area canvas-area--context">
          <h2><span>01</span> Contexto</h2>
          <div className="canvas-area__grid canvas-area__grid--context">
            <Cell title="Problemática" className="span-2"><p>{shorten(project.context.problematic, 430)}</p></Cell>
            <Cell title="Questão / problema / hipóteses"><p>{shorten(formulation)}</p></Cell>
            <Cell title="Construtos"><ul className="canvas-tags">{project.context.constructs.length ? project.context.constructs.map((item) => <li key={item.id}>{item.name}</li>) : <li className="placeholder">Preencha esta seção</li>}</ul></Cell>
            <Cell title="Aderência ao EGC" className="span-2"><p>{shorten(project.context.egcAlignment, 360)}</p></Cell>
          </div>
        </section>
        <section className="canvas-area canvas-area--purpose">
          <h2><span>02</span> Propósito</h2>
          <div className="canvas-area__grid">
            <Cell title="Objetivo geral"><p>{shorten(project.purpose.generalObjective)}</p></Cell>
            <Cell title="Objetivos específicos"><ol>{project.purpose.specificObjectives.length ? project.purpose.specificObjectives.slice(0, 5).map((item) => <li key={item.id}>{shorten(item.text, 120)}</li>) : <li className="placeholder">Preencha esta seção</li>}</ol></Cell>
            <Cell title="Escopo, delimitações e limitações"><p><strong>Escopo:</strong> {shorten(project.purpose.scope, 130)}</p><ul>{project.purpose.delimitations.slice(0, 2).map((item) => <li key={item.id}>{shorten(item.text, 85)}</li>)}</ul></Cell>
          </div>
        </section>
        <section className="canvas-area canvas-area--approach">
          <h2><span>03</span> Abordagem</h2>
          <div className="canvas-area__grid">
            <Cell title="Visão de mundo / paradigmas"><p>{shorten(project.approach.worldview, 220)}</p><ul className="canvas-tags">{project.approach.paradigms.map((item) => <li key={item}>{item}</li>)}</ul></Cell>
            <Cell title="Classificação"><ul className="canvas-tags">{project.approach.classifications.length ? project.approach.classifications.map((item) => <li key={item}>{item}</li>) : <li className="placeholder">Preencha esta seção</li>}</ul></Cell>
            <Cell title="Método / metodologia"><p>{shorten(project.approach.mainApproach, 180)}</p><ul>{project.approach.methods.slice(0, 4).map((item) => <li key={item.id}>{item.name}</li>)}</ul></Cell>
          </div>
        </section>
      </div>
      <section className="canvas-area canvas-area--planning">
        <h2><span>04</span> Planejamento</h2>
        <div className="planning-strip"><Cell title="Procedimentos"><ol>{project.planning.procedures.length ? project.planning.procedures.slice(0, 4).map((item) => <li key={item.id}>{item.title}</li>) : <li className="placeholder">Preencha esta seção</li>}</ol></Cell><Cell title="Cronograma"><ul>{project.planning.schedule.length ? project.planning.schedule.slice(0, 4).map((item) => <li key={item.id}>{item.name} · {item.end || "a definir"}</li>) : <li className="placeholder">Preencha esta seção</li>}</ul></Cell><Cell title="Trajetória acadêmica"><p>{shorten([project.planning.trajectory.disciplines, project.planning.trajectory.qualification, project.planning.trajectory.defense].filter(Boolean).join(" · "), 220)}</p></Cell></div>
      </section>
      <footer className="research-canvas__footer">Instrumento de reflexão · Indicadores orientativos · PPGEGC / UFSC</footer>
    </article>
  );
}
