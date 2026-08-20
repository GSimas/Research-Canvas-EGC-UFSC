export type Course = "Mestrado" | "Doutorado";
export type ResearchFormulation =
  | "question"
  | "problem"
  | "hypotheses"
  | "question-hypotheses";
export type ProjectStatus = "Rascunho" | "Em desenvolvimento" | "Em revisão";

export interface NamedItem {
  id: string;
  text: string;
}

export interface Construct {
  id: string;
  name: string;
  definition: string;
  authors: string;
  year: string;
  reference: string;
  role: string;
  notes: string;
}

export interface Method {
  id: string;
  name: string;
  category: "Método" | "Técnica" | "Instrumento" | "Coleta" | "Análise";
  description: string;
  reference: string;
}

export interface Procedure {
  id: string;
  title: string;
  description: string;
  objectiveId: string;
  methodId: string;
  expectedResult: string;
}

export interface ScheduleItem {
  id: string;
  name: string;
  start: string;
  end: string;
  status: "Planejada" | "Em andamento" | "Concluída";
}

export interface AcademicTrajectory {
  disciplines: string;
  completedPublications: string;
  plannedPublications: string;
  projects: string;
  academicActivities: string;
  qualification: string;
  development: string;
  defense: string;
}

export interface CommentAnchor {
  id: string;
  projectId: string;
  targetType: "project" | "section" | "field" | "construct" | "objective" | "method" | "version";
  targetId: string;
  author: string;
  text: string;
  createdAt: string;
  resolvedAt?: string;
  status: "open" | "resolved";
}

export interface ProjectSnapshot {
  id: string;
  label: string;
  createdAt: string;
  data: Omit<ResearchProject, "snapshots">;
}

export interface ResearchProject {
  id: string;
  schemaVersion: "1.0";
  createdAt: string;
  updatedAt: string;
  versionLabel: string;
  status: ProjectStatus;
  isDemo?: boolean;
  identification: {
    student: string;
    provisionalTitle: string;
    advisor: string;
    coadvisor: string;
    course: Course;
    concentrationArea: string;
    researchLine: string;
    researchGroup: string;
    year: number;
    notes: string;
  };
  context: {
    problematic: string;
    formulation: ResearchFormulation;
    researchQuestion: string;
    researchProblem: string;
    hypotheses: NamedItem[];
    assumptions: NamedItem[];
    constructs: Construct[];
    egcAlignment: string;
  };
  purpose: {
    generalObjective: string;
    specificObjectives: NamedItem[];
    scope: string;
    delimitations: NamedItem[];
    limitations: NamedItem[];
    outOfScope: NamedItem[];
  };
  approach: {
    worldview: string;
    paradigms: string[];
    classifications: string[];
    classificationJustification: string;
    mainApproach: string;
    methods: Method[];
  };
  planning: {
    procedures: Procedure[];
    schedule: ScheduleItem[];
    trajectory: AcademicTrajectory;
  };
  relationships: Array<{
    id: string;
    sourceType: string;
    sourceId: string;
    targetType: string;
    targetId: string;
  }>;
  comments: CommentAnchor[];
  snapshots: ProjectSnapshot[];
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function createEmptyProject(): ResearchProject {
  const now = new Date().toISOString();
  return {
    id: uid(),
    schemaVersion: "1.0",
    createdAt: now,
    updatedAt: now,
    versionLabel: "Inicial",
    status: "Rascunho",
    identification: {
      student: "",
      provisionalTitle: "Projeto sem título",
      advisor: "",
      coadvisor: "",
      course: "Mestrado",
      concentrationArea: "",
      researchLine: "",
      researchGroup: "",
      year: new Date().getFullYear(),
      notes: "",
    },
    context: {
      problematic: "",
      formulation: "question",
      researchQuestion: "",
      researchProblem: "",
      hypotheses: [],
      assumptions: [],
      constructs: [],
      egcAlignment: "",
    },
    purpose: {
      generalObjective: "",
      specificObjectives: [],
      scope: "",
      delimitations: [],
      limitations: [],
      outOfScope: [],
    },
    approach: {
      worldview: "",
      paradigms: [],
      classifications: [],
      classificationJustification: "",
      mainApproach: "",
      methods: [],
    },
    planning: {
      procedures: [],
      schedule: [],
      trajectory: {
        disciplines: "",
        completedPublications: "",
        plannedPublications: "",
        projects: "",
        academicActivities: "",
        qualification: "",
        development: "",
        defense: "",
      },
    },
    relationships: [],
    comments: [],
    snapshots: [],
  };
}

export function createDemoProject(): ResearchProject {
  const project = createEmptyProject();
  const objective1 = { id: uid(), text: "Caracterizar os usos atuais da IA generativa em escolas públicas." };
  const objective2 = { id: uid(), text: "Identificar desafios institucionais para sua adoção responsável." };
  const objective3 = { id: uid(), text: "Elaborar e validar diretrizes de adoção institucional da IA." };
  const method = { id: uid(), name: "Design Science Research", category: "Método" as const, description: "Estrutura a proposição e a validação das diretrizes.", reference: "Hevner et al.; Peffers et al." };
  const now = new Date().toISOString();
  return {
    ...project,
    isDemo: true,
    status: "Em desenvolvimento",
    versionLabel: "Exemplo institucional",
    identification: {
      ...project.identification,
      student: "Projeto demonstrativo",
      provisionalTitle: "Diretrizes para adoção institucional da IA em escolas públicas",
      advisor: "Orientação a definir",
      course: "Doutorado",
      concentrationArea: "Gestão do Conhecimento",
      researchLine: "GC – Gestão do conhecimento organizacional",
      researchGroup: "Exemplo didático",
    },
    context: {
      ...project.context,
      problematic: "O uso crescente da IA generativa ocorre sem preparo institucional suficiente para orientar práticas pedagógicas, éticas e avaliativas. Escolas e docentes ainda carecem de formação, critérios e mecanismos de governança capazes de integrar a tecnologia aos objetivos educacionais.",
      formulation: "question-hypotheses",
      researchQuestion: "Como escolas públicas podem estruturar condições institucionais para a adoção responsável da IA generativa?",
      hypotheses: [{ id: uid(), text: "Formação docente, critérios de uso e governança favorecem melhor integração pedagógica da IA." }],
      assumptions: [{ id: uid(), text: "Tecnologias educacionais geram valor quando mediadas por objetivos pedagógicos e capacidades organizacionais." }],
      constructs: [
        { id: uid(), name: "Governança da IA", definition: "Arranjos de decisão, responsabilidade e controle do uso da IA.", authors: "Literatura de governança de IA", year: "2024", reference: "A definir na revisão", role: "Orienta critérios institucionais", notes: "" },
        { id: uid(), name: "Aprendizagem organizacional", definition: "Processos pelos quais a organização produz e incorpora aprendizagem.", authors: "Autores de referência", year: "", reference: "A definir", role: "Explica a incorporação institucional", notes: "" },
        { id: uid(), name: "Adoção de tecnologias educacionais", definition: "Processo sociotécnico de integração de tecnologias à prática educacional.", authors: "Autores de referência", year: "", reference: "A definir", role: "Delimita o fenômeno", notes: "" },
      ],
      egcAlignment: "Articula conhecimento, tecnologia, aprendizagem e organização para orientar a adoção institucional da IA, relacionando-se à Gestão do Conhecimento e à pesquisa interdisciplinar no PPGEGC.",
    },
    purpose: {
      generalObjective: "Propor diretrizes para a adoção institucional responsável da IA generativa em escolas públicas.",
      specificObjectives: [objective1, objective2, objective3],
      scope: "Integração institucional da IA generativa em escolas públicas de Ensino Médio.",
      delimitations: [
        { id: uid(), text: "Escolas públicas de Ensino Médio." },
        { id: uid(), text: "Foco em IA generativa e práticas pedagógicas, éticas e avaliativas." },
      ],
      limitations: [{ id: uid(), text: "Resultados dependem do acesso a gestores, docentes e documentos institucionais." }],
      outOfScope: [{ id: uid(), text: "Não medir impacto longitudinal no desempenho dos estudantes." }],
    },
    approach: {
      worldview: "Perspectiva sociotécnica e pragmática: a IA depende de mediação organizacional para gerar valor educacional.",
      paradigms: ["Pragmatismo", "Perspectiva sociotécnica"],
      classifications: ["Aplicada", "Qualitativa", "Exploratória", "Descritiva", "Propositiva", "Interdisciplinar"],
      classificationJustification: "A pesquisa busca compreender condições institucionais e produzir um artefato orientador aplicável ao contexto escolar.",
      mainApproach: "Design Science Research com revisão, análise documental, entrevistas e validação por especialistas.",
      methods: [
        method,
        { id: uid(), name: "Entrevistas semiestruturadas", category: "Coleta", description: "Com gestores e docentes.", reference: "Protocolo a definir" },
        { id: uid(), name: "Análise de conteúdo", category: "Análise", description: "Interpretação do corpus empírico.", reference: "Bardin" },
      ],
    },
    planning: {
      procedures: [
        { id: uid(), title: "Revisão e diagnóstico", description: "Consolidar literatura e evidências do contexto.", objectiveId: objective1.id, methodId: method.id, expectedResult: "Mapa dos usos e desafios atuais." },
        { id: uid(), title: "Desenvolvimento das diretrizes", description: "Projetar o artefato orientador.", objectiveId: objective3.id, methodId: method.id, expectedResult: "Versão inicial das diretrizes." },
        { id: uid(), title: "Validação", description: "Submeter as diretrizes à avaliação de especialistas.", objectiveId: objective3.id, methodId: method.id, expectedResult: "Diretrizes revisadas e validadas." },
      ],
      schedule: [
        { id: uid(), name: "Revisão de literatura", start: "2026-03", end: "2026-08", status: "Em andamento" },
        { id: uid(), name: "Coleta e análise", start: "2026-09", end: "2027-03", status: "Planejada" },
        { id: uid(), name: "Desenvolvimento e validação", start: "2027-04", end: "2027-10", status: "Planejada" },
      ],
      trajectory: {
        disciplines: "Fundamentos do EGC; Métodos de Pesquisa; Seminários de Pesquisa.",
        completedPublications: "Mapeamento inicial apresentado em seminário.",
        plannedPublications: "Revisão sistemática e artigo de avaliação das diretrizes.",
        projects: "Projeto sobre conhecimento e transformação digital na educação.",
        academicActivities: "Seminários, grupos de estudo e atividades de extensão.",
        qualification: "Prevista após diagnóstico e primeira versão do artefato.",
        development: "Iterações de projeto, avaliação e refinamento.",
        defense: "Defesa prevista após validação e consolidação da tese.",
      },
    },
    updatedAt: now,
  };
}
