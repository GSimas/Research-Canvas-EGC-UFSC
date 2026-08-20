import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import type { ResearchProject } from "../../domain/models/project";
import { CanvasView } from "../canvas/CanvasView";

const sectionNav: Record<string, string[]> = {
  Contexto: ["Problemática", "Problema de pesquisa", "Construtos", "Aderência ao EGC"],
  Propósito: ["Objetivo Geral", "Objetivos Específicos", "Limitações e Delimitações"],
  Abordagem: ["Visão de Mundo", "Classificação da Pesquisa", "Método"],
  Planejamento: ["Procedimentos", "Cronograma", "Trajetória Acadêmica"],
  Síntese: ["Canvas completo"],
};

export function PresentationView({ project }: { project: ResearchProject }) {
  const [index, setIndex] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const formulation = [project.context.researchQuestion, project.context.researchProblem, ...project.context.hypotheses.map((item) => item.text)].filter(Boolean);
  const slides = [
    { title: project.identification.provisionalTitle, section: "Pesquisa", active: 0, density: project.identification.provisionalTitle.length, content: <div className="panel-title-slide"><h2>{project.identification.provisionalTitle}</h2><p>{project.identification.student || "Estudante"}</p><small>Orientação: {project.identification.advisor || "a definir"}</small></div> },
    { title: "Problemática", section: "Contexto", active: 0, density: project.context.problematic.length, content: <SlideText text={project.context.problematic} empty="Descreva os elementos factuais e a lacuna que tornam a questão investigável." /> },
    { title: "Problema de pesquisa", section: "Contexto", active: 1, density: formulation.join(" ").length, content: <div className="panel-list">{formulation.length ? formulation.map((item, itemIndex) => <p key={`${item}-${itemIndex}`}>{item}</p>) : <p className="placeholder">Formulação ainda não preenchida.</p>}</div> },
    { title: "Construtos", section: "Contexto", active: 2, density: project.context.constructs.map((item) => item.name).join(" ").length + project.context.egcAlignment.length, content: <div className="panel-list"><ul>{project.context.constructs.map((item) => <li key={item.id}>{item.name}</li>)}</ul><p className="panel-support"><strong>Aderência ao EGC:</strong> {project.context.egcAlignment || "preencha esta seção."}</p></div> },
    { title: "Objetivo Geral", section: "Propósito", active: 0, density: project.purpose.generalObjective.length, content: <SlideText text={project.purpose.generalObjective} empty="Preencha o objetivo geral." /> },
    { title: "Objetivos Específicos", section: "Propósito", active: 1, density: project.purpose.specificObjectives.map((item) => item.text).join(" ").length, content: <div className="panel-list"><ol>{project.purpose.specificObjectives.map((item) => <li key={item.id}>{item.text}</li>)}</ol></div> },
    { title: "Limitações e Delimitações", section: "Propósito", active: 2, density: Math.max(project.purpose.scope.length, project.purpose.delimitations.map((item) => item.text).join(" ").length, project.purpose.limitations.map((item) => item.text).join(" ").length) * 3, content: <div className="panel-columns"><div><strong>Escopo</strong><p>{project.purpose.scope || "—"}</p></div><div><strong>Delimitações</strong><ul>{project.purpose.delimitations.map((item) => <li key={item.id}>{item.text}</li>)}</ul></div><div><strong>Limitações</strong><ul>{project.purpose.limitations.map((item) => <li key={item.id}>{item.text}</li>)}</ul></div></div> },
    { title: "Visão de Mundo", section: "Abordagem", active: 0, density: project.approach.worldview.length + project.approach.paradigms.join(" ").length, content: <div className="panel-list"><p className="panel-large">Paradigma:<br />{project.approach.worldview || "a definir"}</p>{project.approach.paradigms.length > 0 && <ul>{project.approach.paradigms.map((item) => <li key={item}>{item}</li>)}</ul>}</div> },
    { title: "Classificação da Pesquisa", section: "Abordagem", active: 1, density: project.approach.classifications.join(" ").length + project.approach.classificationJustification.length, content: <div className="panel-list"><p className="panel-large">Abordagem:</p><ul>{project.approach.classifications.map((item) => <li key={item}>{item}</li>)}</ul><p className="panel-support">{project.approach.classificationJustification}</p></div> },
    { title: "Método", section: "Abordagem", active: 2, density: project.approach.mainApproach.length + project.approach.methods.map((item) => `${item.name} ${item.description}`).join(" ").length, content: <div className="panel-list"><p>{project.approach.mainApproach || "Percurso metodológico a preencher."}</p><ul>{project.approach.methods.map((item) => <li key={item.id}><strong>{item.name || item.category}</strong>{item.description ? ` — ${item.description}` : ""}</li>)}</ul></div> },
    { title: "Planejamento", section: "Planejamento", active: 0, density: project.planning.procedures.map((item) => `${item.title} ${item.expectedResult}`).join(" ").length + project.planning.schedule.map((item) => item.name).join(" ").length, content: <div className="panel-columns panel-columns--two"><div><strong>Procedimentos</strong><ol>{project.planning.procedures.map((item) => <li key={item.id}>{item.title} — {item.expectedResult}</li>)}</ol></div><div><strong>Cronograma</strong><ul>{project.planning.schedule.map((item) => <li key={item.id}>{item.name}<small>{item.start} → {item.end} · {item.status}</small></li>)}</ul></div></div> },
    { title: "Canvas completo", section: "Síntese", active: 0, density: 0, content: <div className="panel-canvas"><CanvasView project={project} compact elementId="presentation-canvas" /></div> },
  ];
  const slide = slides[index];
  const sectionClass = slide.section.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const textSize = slide.density > 1900 ? 0.66 : slide.density > 1350 ? 0.78 : slide.density > 950 ? 0.9 : slide.density > 650 ? 1.04 : slide.density > 420 ? 1.2 : slide.density > 230 ? 1.38 : 1.62;
  const typography = { "--panel-text-size": `${textSize}rem`, "--panel-fullscreen-size": `${textSize * 1.45}rem`, "--panel-title-size": `${Math.max(1.2, textSize * 1.08)}rem` } as CSSProperties;
  return (
    <div className="presentation-view">
      <header className="mode-heading"><div><span className="eyebrow">Modo apresentação</span><h1>Painel científico</h1><p>Layout institucional baseado no modelo de apresentação fornecido.</p></div><button type="button" className="button button--secondary" onClick={() => frameRef.current?.requestFullscreen?.()}>Tela cheia</button></header>
      <div className={`presentation-frame panel-theme panel-theme--${sectionClass}`} ref={frameRef} style={typography}>
        <div className="panel-stripe" aria-hidden="true"><i /><i /><i /></div>
        <header className="panel-header"><span className="panel-pill">Painel Científico</span>{index > 0 && <strong>{slide.section.toUpperCase()}</strong>}<Image src="/brand/ufsc.png" width={155} height={66} alt="UFSC" unoptimized /><small>{project.identification.year} {project.identification.course.toUpperCase()} &nbsp;&nbsp; {project.identification.concentrationArea || "PPGEGC"}</small></header>
        <div className={`panel-body ${index === 0 ? "panel-body--title" : ""}`}>
          {index > 0 && <aside>{(sectionNav[slide.section] || [slide.title]).map((item, itemIndex) => <span className={itemIndex === slide.active ? "active" : ""} key={item}>{item}</span>)}</aside>}
          <main><h1>{index === 0 ? "" : slide.title}</h1><div>{slide.content}</div></main>
        </div>
        <footer className="panel-footer"><Image src="/brand/egc.png" width={145} height={66} alt="EGC" unoptimized /><small>Research Canvas EGC · instrumento de apoio à estruturação e reflexão sobre projetos de pesquisa</small><span>{index + 1}</span></footer>
      </div>
      <div className="presentation-controls"><button type="button" className="button button--secondary" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>← Anterior</button><span>{index + 1} / {slides.length}</span><button type="button" className="button button--primary" disabled={index === slides.length - 1} onClick={() => setIndex((value) => value + 1)}>Próximo →</button></div>
    </div>
  );
}

function SlideText({ text, empty }: { text: string; empty: string }) {
  return <p className={text ? "panel-main-text" : "panel-main-text placeholder"}>{text || empty}</p>;
}
