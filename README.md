# Research Canvas EGC

Aplicação web local para estruturar, visualizar, revisar e comunicar projetos de tese e dissertação no Programa de Pós-Graduação em Engenharia, Gestão e Mídia do Conhecimento (PPGEGC/UFSC).

O produto parte de um princípio: o Canvas não é um formulário isolado, mas uma superfície para observar relações entre problemática, pergunta, construtos, objetivos, escopo, abordagem, método, procedimentos, resultados e planejamento.

## Finalidade

- apoiar o estudante na formulação progressiva do projeto;
- preservar a terminologia e a lógica conceitual do Canvas T/D EGC;
- visualizar o Canvas completo a partir de dados estruturados;
- apresentar perguntas orientativas sobre coerência, sem emitir julgamento acadêmico;
- gerar artefatos para orientação, seminários, painéis e bancas;
- manter os dados no navegador nesta primeira versão.

## Stack

- React 19 e TypeScript;
- Next.js 16 com Vinext/Vite para o ambiente do ChatGPT Work;
- CSS responsivo e tokens institucionais próprios;
- IndexedDB nativo para persistência;
- PptxGenJS para PowerPoint com objetos editáveis;
- jsPDF e html-to-image para PDFs e imagens gerados diretamente;
- JSON versionado para backup e migração futura.

## Como executar

Requisitos: Node.js 22.13 ou superior.

```bash
npm install
npm run dev
```

Abra o endereço informado pelo Vite no terminal. O projeto demonstrativo é criado apenas na primeira utilização. Depois de removido, não volta a ser recriado automaticamente.

## Como gerar build

```bash
npm run build
npm run verify:hostinger
```

Validações adicionais:

```bash
npm run lint
npm test
```

## Estrutura de pastas

```text
app/                  entrada, metadados e estilos globais
components/           marca e controles reutilizáveis
config/               identidade, taxonomias, Canvas e ajuda contextual
domain/               modelo acadêmico e regras de coerência
features/
  landing/            tela inicial e página institucional
  projects/           dashboard e operações locais
  editor/             editor guiado e seções acadêmicas
  canvas/             representação visual integral
  coherence/          indicadores, regras e mapa de alinhamento
  presentation/       painel científico no padrão institucional
services/
  storage/            repositório IndexedDB
  export/             JSON, JPG, PDF e PPTX
  ai/                 contrato para integração futura, sem IA simulada
public/brand/          assets institucionais fornecidos no projeto
```

## Modelo de dados

`ResearchProject` é a fonte única dos modos Editor, Canvas, Coerência e Apresentação. O modelo separa:

- identificação;
- Contexto: problemática, formulação, pressupostos, hipóteses, construtos e aderência;
- Propósito: objetivo geral, objetivos específicos, escopo, delimitações, limitações e fora do escopo;
- Abordagem: visão de mundo, paradigmas, classificação, justificativa e itens metodológicos;
- Planejamento: procedimentos, cronograma e trajetória acadêmica;
- relações, comentários futuros, snapshots e versão.

Construtos, objetivos, métodos, procedimentos e atividades são objetos identificáveis. Isso permite relacionamentos explícitos e futura vinculação de comentários.

## Persistência

O repositório em `services/storage/indexedDb.ts` isola IndexedDB da interface. O editor aplica autosave com debounce, atualiza `updatedAt` e preserva o projeto ao recarregar o navegador. Preferências simples, como a criação única do exemplo didático, utilizam `localStorage`.

Para migrar a um backend, implemente outro repositório com as mesmas operações (`list`, `get`, `save`, `remove`) e substitua a composição no nível da aplicação.

## Exportação

- **PDF:** Canvas paisagem, resumo estruturado e apresentação são gerados e baixados diretamente, sem diálogo de impressão.
- **JPG:** a aba Canvas gera uma imagem de alta resolução da superfície completa.
- **PPTX:** a apresentação segue o padrão visual do Painel Científico fornecido, com textos e formas editáveis e tipografia adaptada à densidade de cada slide. O PPTX do Canvas incorpora a mesma renderização usada no JPG para manter equivalência visual exata.
- **Backup:** JSON individual no formato `{ schemaVersion: "1.0", exportedAt, project }` ou lote no formato `{ schemaVersion: "1.0", kind: "project-batch", exportedAt, projects }`. A área de trabalho aceita vários arquivos JSON de uma vez, permite selecionar projetos e exportar um lote consolidado.
- **Ações rápidas:** o menu contextual de cada projeto exporta Canvas em JPG/PDF/PPTX e apresentação em PDF/PPTX sem precisar abrir o editor.
- **Snapshots:** versões manuais ficam dentro do projeto local e também são preservadas no backup.

## Motor de coerência

`domain/coherence.ts` implementa regras determinísticas e não bloqueantes:

- presença e vocabulário compartilhado entre pergunta e objetivo geral;
- existência de objetivos específicos;
- sinalização de objetivos que começam com verbos tipicamente procedimentais;
- relação lexical entre construtos, pergunta e objetivos;
- presença de escopo e delimitações;
- existência de métodos e procedimentos;
- atenção a objetivos propositivos sem estratégia explícita de desenvolvimento/validação;
- presença de verbo de ação no objetivo geral.

Os resultados usam “Completo”, “Atenção”, “Revisar” e “Não preenchido”. Nenhuma regra afirma que a pesquisa está certa ou errada.

## Configuração institucional

Textos e opções mutáveis estão centralizados em:

- `config/institution.ts`: nome, áreas, linhas, aviso acadêmico e ajuda;
- `config/canvas.ts`: macroáreas, ordem, cores e seções;
- `classificationConfig` e `paradigmSuggestions`: opções configuráveis.

A arquitetura é EGC-first, mas não EGC-only: outra instituição pode fornecer uma configuração, conteúdo de ajuda e identidade próprios sem alterar o domínio central.

## Limitações do MVP

- não há autenticação, backend remoto ou sincronização entre dispositivos;
- colaboração e comentários de orientadores estão apenas modelados para evolução futura;
- o motor de coerência utiliza heurísticas lexicais e regras explícitas, não análise semântica;
- PDFs e JPGs preservam a aparência do Canvas por captura local da superfície renderizada; conteúdos muito extensos permanecem condensados como na tela;
- o PPTX da apresentação prioriza editabilidade e pode apresentar pequenas diferenças tipográficas entre sistemas; o PPTX do Canvas prioriza fidelidade visual e usa a renderização do próprio Canvas como imagem;
- áreas e linhas institucionais devem ser revisadas pela governança do Programa antes de publicação oficial.

## Como continuar o desenvolvimento

1. trate `ResearchProject` como contrato de domínio e adicione migrações ao alterar `schemaVersion`;
2. mantenha regras acadêmicas em `domain/`, sem acoplá-las aos componentes;
3. acrescente novas taxonomias em configuração, não em formulários;
4. implemente repositórios remotos atrás da interface de armazenamento;
5. conecte comentários a `targetType` e `targetId` dos objetos existentes;
6. implemente o contrato `AIService` somente quando houver serviço real e indicação clara de origem das sugestões;
7. preserve o aviso de caráter orientativo em qualquer nova análise.

## Roadmap

### MVP — atual

- editor guiado;
- Canvas integral e prévia viva;
- armazenamento local e autosave;
- coerência baseada em regras;
- mapa de alinhamento;
- apresentação;
- PDF, PPTX e backup JSON;
- snapshots manuais.

### V2

- autenticação;
- backend e projetos na nuvem;
- compartilhamento;
- histórico detalhado e migração de schema.

### V3

- perfis de orientadores;
- comentários ancorados em campos e objetos;
- revisão, resolução e permissões.

### V4

- IA como assistência acadêmica identificada;
- análise semântica;
- apoio a referências e revisão;
- simulação de questionamentos de banca.

### V5

- plataforma multi-programa;
- editor de templates institucionais;
- analytics orientados à melhoria do processo;
- integrações acadêmicas.

## Aviso acadêmico

O Research Canvas EGC é um instrumento de apoio à estruturação e reflexão sobre projetos de pesquisa. Indicadores e recomendações apresentados pela plataforma possuem caráter orientativo e não substituem a avaliação do orientador, do Programa ou de bancas acadêmicas.
