import { calculateIndicators, runCoherence, type CheckStatus } from "../../domain/coherence";
import type { ResearchProject } from "../../domain/models/project";

const statusLabel: Record<CheckStatus, string> = { complete: "Completo", attention: "Atenção", review: "Revisar", empty: "Não preenchido" };

export function IndicatorPanel({ project }: { project: ResearchProject }) {
  const indicators = calculateIndicators(project);
  const entries = [
    ["Preenchimento", indicators.completion], ["Estrutura", indicators.structure], ["Coerência", indicators.coherence], ["Método", indicators.method], ["Delimitação", indicators.delimitation],
  ] as const;
  return (
    <div className="indicator-grid">{entries.map(([label, value]) => <div className="indicator" key={label}><div className="indicator__ring" style={{ "--value": value } as React.CSSProperties}><strong>{value}%</strong></div><span>{label}</span></div>)}</div>
  );
}

export function CoherenceView({ project, onEdit }: { project: ResearchProject; onEdit: (step: string) => void }) {
  const checks = runCoherence(project);
  const indicators = calculateIndicators(project);
  return (
    <div className="coherence-view">
      <header className="mode-heading"><div><span className="eyebrow">Revisão orientativa</span><h1>Coerência da pesquisa</h1><p>Relações detectadas por regras simples. Use os sinais como perguntas para reflexão, não como avaliação acadêmica.</p></div><div className="coherence-summary"><strong>{indicators.coherence}%</strong><span>{indicators.reviewCount ? `${indicators.reviewCount} pontos para revisão` : "Sem alertas heurísticos"}</span></div></header>
      <IndicatorPanel project={project} />
      <section className="coherence-layout">
        <div className="checks"><h2>Relações analisadas</h2>{checks.map((check) => <article className={`check check--${check.status}`} key={check.id}><span className="check__icon">{check.status === "complete" ? "✓" : check.status === "empty" ? "○" : "!"}</span><div><div className="check__heading"><h3>{check.title}</h3><span>{statusLabel[check.status]}</span></div><small>{check.relation}</small><p>{check.message}</p></div></article>)}</div>
        <aside className="coherence-side"><h2>Leitura do resultado</h2><p>O sistema procura preenchimento, vínculos explícitos e termos compartilhados. Ele não compreende mérito científico, originalidade ou adequação epistemológica.</p><button type="button" className="button button--secondary" onClick={() => onEdit("context")}>Revisar Contexto</button><button type="button" className="button button--secondary" onClick={() => onEdit("purpose")}>Revisar Propósito</button><button type="button" className="button button--secondary" onClick={() => onEdit("approach")}>Revisar Abordagem</button></aside>
      </section>
      <AlignmentMap project={project} />
    </div>
  );
}

export function AlignmentMap({ project }: { project: ResearchProject }) {
  const question = project.context.researchQuestion || project.context.researchProblem || project.context.hypotheses[0]?.text;
  const nodes = [
    { label: "Problemática", value: project.context.problematic },
    { label: "Pergunta", value: question },
    { label: "Objetivo geral", value: project.purpose.generalObjective },
    { label: "Objetivos específicos", value: project.purpose.specificObjectives.map((item) => item.text).join(" · ") },
    { label: "Métodos", value: project.approach.methods.map((item) => item.name).join(" · ") },
    { label: "Resultados", value: project.planning.procedures.map((item) => item.expectedResult).filter(Boolean).join(" · ") },
  ];
  return (
    <section className="alignment"><header><div><span className="eyebrow">Mapa de alinhamento</span><h2>Da problemática aos resultados</h2></div><div className="alignment__legend"><span><i className="related" /> Relacionado</span><span><i className="partial" /> Relação incompleta</span><span><i className="missing" /> Sem relação</span></div></header><div className="alignment__flow">{nodes.map((node, index) => <div className="alignment__segment" key={node.label}><article className={node.value ? "has-value" : "is-empty"}><span>{String(index + 1).padStart(2, "0")}</span><h3>{node.label}</h3><p>{node.value ? (node.value.length > 150 ? `${node.value.slice(0, 150)}…` : node.value) : "Não preenchido"}</p></article>{index < nodes.length - 1 && <b className={node.value && nodes[index + 1].value ? "related" : node.value || nodes[index + 1].value ? "partial" : "missing"}>→</b>}</div>)}</div></section>
  );
}
