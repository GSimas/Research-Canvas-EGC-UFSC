import type { ResearchProject } from "./models/project";

export type CheckStatus = "complete" | "attention" | "review" | "empty";
export interface CoherenceCheck {
  id: string;
  title: string;
  status: CheckStatus;
  message: string;
  relation: string;
}

const stopwords = new Set(["para", "como", "com", "uma", "das", "dos", "que", "por", "seu", "sua", "de", "do", "da", "em", "e", "a", "o", "as", "os", "um"]);
const tokens = (text: string) =>
  new Set(text.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 3 && !stopwords.has(word)));
const overlap = (a: string, b: string) => [...tokens(a)].filter((word) => tokens(b).has(word));

export function runCoherence(project: ResearchProject): CoherenceCheck[] {
  const question = project.context.researchQuestion || project.context.researchProblem || project.context.hypotheses.map((item) => item.text).join(" ");
  const objective = project.purpose.generalObjective;
  const constructs = project.context.constructs.map((item) => `${item.name} ${item.definition}`).join(" ");
  const objectives = project.purpose.specificObjectives.map((item) => item.text).join(" ");
  const methods = project.approach.methods.map((item) => item.name).join(" ");
  const procedureVerbs = /^(realizar|aplicar|coletar|entrevistar|revisar|levantar|executar|tabular)\b/i;
  const actionVerb = /^(analisar|avaliar|compreender|desenvolver|identificar|investigar|propor|caracterizar|explicar|verificar|validar|sistematizar|mapear|elaborar)\b/i;
  const checks: CoherenceCheck[] = [];

  checks.push(!question || !objective ? {
    id: "question-objective", title: "Pergunta ↔ objetivo geral", status: "empty", relation: "Contexto → Propósito", message: "Preencha a pergunta/problema e o objetivo geral para tornar esta relação visível.",
  } : overlap(question, objective).length ? {
    id: "question-objective", title: "Pergunta ↔ objetivo geral", status: "complete", relation: "Contexto → Propósito", message: `Há termos compartilhados: ${overlap(question, objective).slice(0, 4).join(", ")}.`,
  } : {
    id: "question-objective", title: "Pergunta ↔ objetivo geral", status: "review", relation: "Contexto → Propósito", message: "Vale revisar: a formulação da pergunta e do objetivo geral parece usar vocabulários pouco conectados.",
  });

  checks.push(project.purpose.specificObjectives.length ? {
    id: "objective-specific", title: "Objetivo geral ↔ específicos", status: "complete", relation: "Propósito", message: `${project.purpose.specificObjectives.length} metas parciais foram cadastradas.`,
  } : {
    id: "objective-specific", title: "Objetivo geral ↔ específicos", status: "empty", relation: "Propósito", message: "Ainda não há objetivos específicos cadastrados.",
  });

  const procedural = project.purpose.specificObjectives.filter((item) => procedureVerbs.test(item.text.trim()));
  checks.push(procedural.length ? {
    id: "specific-result", title: "Objetivos como resultados", status: "attention", relation: "Propósito → Planejamento", message: "Pergunta para reflexão: um ou mais objetivos podem estar descrevendo atividades metodológicas. Eles expressam resultados parciais?",
  } : {
    id: "specific-result", title: "Objetivos como resultados", status: project.purpose.specificObjectives.length ? "complete" : "empty", relation: "Propósito", message: project.purpose.specificObjectives.length ? "Os objetivos não começam com verbos tipicamente procedimentais." : "Cadastre objetivos específicos para aplicar esta heurística.",
  });

  checks.push(!constructs ? {
    id: "construct-question", title: "Construtos ↔ formulação", status: "empty", relation: "Contexto", message: "Nenhum construto foi cadastrado.",
  } : overlap(constructs, `${question} ${objective} ${objectives}`).length ? {
    id: "construct-question", title: "Construtos ↔ pesquisa", status: "complete", relation: "Contexto → Propósito", message: "Os construtos compartilham termos com a pergunta e/ou os objetivos.",
  } : {
    id: "construct-question", title: "Construtos ↔ pesquisa", status: "review", relation: "Contexto → Propósito", message: "Vale revisar: nenhum construto parece relacionado por termos comuns à pergunta ou aos objetivos.",
  });

  checks.push(project.purpose.delimitations.length ? {
    id: "scope", title: "Escopo e recortes", status: "complete", relation: "Propósito", message: `${project.purpose.delimitations.length} delimitação(ões) tornam o recorte explícito.`,
  } : {
    id: "scope", title: "Escopo e recortes", status: "attention", relation: "Propósito", message: "Pergunta para reflexão: quais recortes geográficos, temporais, populacionais ou tecnológicos tornam a pesquisa viável?",
  });

  const propositional = /\b(propor|desenvolver|elaborar|construir|criar)\b/i.test(objective);
  checks.push(!methods ? {
    id: "methods", title: "Objetivos ↔ métodos", status: "empty", relation: "Propósito → Abordagem", message: "Nenhum método, técnica ou instrumento foi cadastrado.",
  } : propositional && !/design|dsr|desenvolvimento|projeto|valida/i.test(`${methods} ${project.approach.mainApproach}`) ? {
    id: "methods", title: "Proposição ↔ percurso metodológico", status: "attention", relation: "Propósito → Abordagem", message: "Vale revisar: o objetivo indica desenvolvimento ou proposição, mas a estratégia de construção e validação ainda não está explícita.",
  } : {
    id: "methods", title: "Objetivos ↔ métodos", status: "complete", relation: "Propósito → Abordagem", message: `${project.approach.methods.length} item(ns) metodológico(s) foram cadastrados.`,
  });

  checks.push(!objective ? {
    id: "general-verb", title: "Verbo do objetivo geral", status: "empty", relation: "Propósito", message: "Preencha o objetivo geral.",
  } : actionVerb.test(objective.trim()) ? {
    id: "general-verb", title: "Verbo do objetivo geral", status: "complete", relation: "Propósito", message: "O objetivo geral inicia com um verbo de ação reconhecido pela heurística.",
  } : {
    id: "general-verb", title: "Verbo do objetivo geral", status: "attention", relation: "Propósito", message: "Vale revisar: explicite a meta maior com um verbo de ação claro.",
  });

  return checks;
}

export function calculateIndicators(project: ResearchProject) {
  const core = [
    project.identification.provisionalTitle, project.identification.student,
    project.context.problematic, project.context.researchQuestion || project.context.researchProblem,
    project.context.egcAlignment, project.purpose.generalObjective, project.purpose.scope,
    project.approach.worldview, project.approach.mainApproach,
  ];
  const filled = core.filter(Boolean).length + Math.min(project.context.constructs.length, 2) + Math.min(project.purpose.specificObjectives.length, 3) + Math.min(project.approach.methods.length, 2) + Math.min(project.planning.procedures.length, 2);
  const total = core.length + 2 + 3 + 2 + 2;
  const checks = runCoherence(project);
  const positive = checks.filter((check) => check.status === "complete").length;
  return {
    completion: Math.round((filled / total) * 100),
    structure: Math.round(((project.purpose.specificObjectives.length > 0 ? 1 : 0) + (project.context.constructs.length > 0 ? 1 : 0) + (project.approach.methods.length > 0 ? 1 : 0) + (project.planning.procedures.length > 0 ? 1 : 0)) / 4 * 100),
    coherence: Math.round((positive / checks.length) * 100),
    method: project.approach.methods.length && project.planning.procedures.length ? 100 : project.approach.methods.length ? 60 : 0,
    delimitation: Math.min(100, (project.purpose.scope ? 35 : 0) + Math.min(project.purpose.delimitations.length * 20, 40) + (project.purpose.outOfScope.length ? 25 : 0)),
    reviewCount: checks.filter((check) => check.status === "attention" || check.status === "review").length,
  };
}
