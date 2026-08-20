export const institutionConfig = {
  shortName: "PPGEGC / UFSC",
  productName: "Research Canvas EGC",
  institution: "Universidade Federal de Santa Catarina",
  program: "Programa de Pós-Graduação em Engenharia, Gestão e Mídia do Conhecimento",
  tagline: "Estruture, alinhe e comunique sua pesquisa.",
  concentrationAreas: ["Engenharia do Conhecimento", "Gestão do Conhecimento", "Mídia do Conhecimento"],
  researchLines: [
    {
      area: "Engenharia do Conhecimento",
      label: "EC – Teoria e Prática em Engenharia do Conhecimento",
      description: "Aborda metodologias e tecnologias da Engenharia do Conhecimento e da Inteligência Computacional e suas relações com a gestão e com a mídia do conhecimento.",
    },
    {
      area: "Engenharia do Conhecimento",
      label: "EC – Engenharia do Conhecimento Aplicada às Organizações",
      description: "Aborda a concepção, desenvolvimento e implantação de soluções da Engenharia do Conhecimento em organizações públicas e privadas.",
    },
    {
      area: "Engenharia do Conhecimento",
      label: "EC – Modelagem e Representação do Conhecimento",
      description: "Estuda abordagens da Engenharia do Conhecimento para a modelagem e representação do conhecimento.",
    },
    {
      area: "Gestão do Conhecimento",
      label: "GC – Teoria e Prática em Gestão do Conhecimento",
      description: "Aborda a teoria e a prática da gestão do conhecimento e suas relações com a engenharia e com as mídias do conhecimento envolvendo pesquisas que tratam o planejamento e alinhamento coletivo do conhecimento por diferentes dimensões de análise, seja individual, de grupo, organizacional, inter organizacional ou em rede.",
    },
    {
      area: "Gestão do Conhecimento",
      label: "GC – Gestão do conhecimento organizacional",
      description: "Aborda os estudos teóricos e práticos sobre a utilização do conhecimento como fator de produção estratégico no gerenciamento de negócios relacionados à economia do conhecimento. Suas pesquisas relacionam-se aos elementos determinantes na gestão do conhecimento organizacional como, por exemplo, o processo de aprendizagem organizacional e seus sub processos de criação do conhecimento (identificação, integração, socialização, retenção-descarte, inovação, memória, propriedade, evolução e governança do conhecimento).",
    },
    {
      area: "Gestão do Conhecimento",
      label: "GC – Empreendedorismo, Inovação e Sustentabilidade",
      description: "Estuda as metodologias, técnicas e ferramentas de gestão do conhecimento aplicadas à promoção do empreendedorismo, inovação e da sustentabilidade organizacional. Investiga o perfil dos indivíduos empreendedores, a governança ambiental e as redes de inovação; para tanto, propõe estudos nos quais os processos de criação e aplicação do conhecimento são determinantes para a implantação das mudanças exigidas pela economia do conhecimento.",
    },
    {
      area: "Mídia do Conhecimento",
      label: "MC – Teoria e Prática em Mídia do Conhecimento",
      description: "Visa a construção, comunicação, preservação e difusão do conhecimento e suas relações com a engenharia e a gestão do conhecimento.",
    },
    {
      area: "Mídia do Conhecimento",
      label: "MC – Mídia e Disseminação do Conhecimento",
      description: "Esta linha de pesquisa trata da captação, produção e difusão da informação baseada em meios tecnológicos. Realiza uma reflexão e análise das implicações sociais da crescente dependência da sociedade em meios tecnológicos de comunicação.",
    },
    {
      area: "Mídia do Conhecimento",
      label: "MC – Mídia e Conhecimento na Educação",
      description: "Dentro desta linha de pesquisa se encontram todos os trabalhos direcionados a maximizar a eficiência do processo de ensino sob a utilização de meios tecnológicos. Esta linha trata da aplicação das ciências da computação, comunicação, e ciências cognitivas na construção do conhecimento, resolução de problemas, planejamento, educação e treinamento, com especial foco em facilitar a colaboração, e a educação à distância, e a educação baseada em tecnologias multimídia. Esta Linha de Pesquisa teve a sua origem na linha Tecnologia Educacional do Programa de Pós-graduação em Engenharia de Produção.",
    },
  ],
  disclaimer: "O Research Canvas EGC é um instrumento de apoio à estruturação e reflexão sobre projetos de pesquisa. Indicadores e recomendações apresentados pela plataforma possuem caráter orientativo e não substituem a avaliação do orientador, do Programa ou de bancas acadêmicas.",
} as const;

export const classificationConfig = [
  "Científica", "Tecnológica", "Básica", "Aplicada", "Qualitativa", "Quantitativa",
  "Métodos mistos", "Exploratória", "Descritiva", "Explicativa", "Propositiva",
  "Interdisciplinar", "Multidisciplinar", "Transdisciplinar",
];

export const paradigmSuggestions = [
  "Positivismo", "Interpretativismo", "Pragmatismo", "Teoria crítica", "Construtivismo", "Perspectiva sociotécnica",
];

export const helpContent = {
  problematic: {
    title: "Da temática à questão investigável",
    questions: [
      "Que fenômeno ou situação motiva a pesquisa?",
      "Que fatos, autores, trabalhos anteriores ou indicadores sustentam essa problemática?",
      "Que lacuna científica, tecnológica ou prática pode ser identificada?",
      "Por que a questão merece investigação?",
      "Como o interesse inicial se transforma em uma pergunta investigável?",
    ],
  },
  alignment: {
    title: "Aderência ao EGC",
    questions: [
      "Como o trabalho se relaciona com o conhecimento?",
      "Com que área de concentração e linha de pesquisa se relaciona?",
      "O que já foi feito no EGC sobre o tema?",
      "Em que a proposta se diferencia ou avança?",
    ],
  },
  objectives: {
    title: "Objetivos como resultados",
    questions: [
      "O objetivo geral responde à pergunta ou enfrenta o problema?",
      "Os objetivos específicos são metas parciais?",
      "Eles foram diferenciados de procedimentos metodológicos?",
    ],
  },
  approach: {
    title: "Abordagem e percurso",
    questions: [
      "Qual visão de mundo sustenta a investigação?",
      "A intenção é analisar, explicar, intervir ou propor?",
      "Que métodos conhecidos fundamentam o percurso?",
      "Como pesquisas anteriores abordaram o mesmo tema?",
    ],
  },
} as const;
