import type { ResearchProject } from "../../domain/models/project";

export type ProjectArtifact = "canvas-jpg" | "canvas-pdf" | "canvas-pptx" | "presentation-pdf" | "presentation-pptx";

const COLORS = {
  navy: "082C4C", blue: "006DB7", teal: "00877C", green: "00A56A", magenta: "B0003A",
  red: "C40018", orange: "F47B20", yellow: "F5B51B", ink: "172235", muted: "8B9299",
  white: "FFFFFF",
};

function safeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "research-canvas";
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

async function canvasImage(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("A visualização do Canvas não está disponível para exportação.");
  await document.fonts?.ready;
  const { toJpeg } = await import("html-to-image");
  return toJpeg(element, { backgroundColor: "#ffffff", cacheBust: true, pixelRatio: 2, quality: 0.96 });
}

async function imageData(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Não foi possível carregar ${path}.`);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function exportProjectBackup(project: ResearchProject) {
  const payload = JSON.stringify({ schemaVersion: "1.0", exportedAt: new Date().toISOString(), project }, null, 2);
  download(new Blob([payload], { type: "application/json" }), `${safeName(project.identification.provisionalTitle)}.research-canvas.json`);
}

export function exportProjectsBackup(projects: ResearchProject[]) {
  if (!projects.length) throw new Error("Selecione ao menos um projeto para exportar.");
  const payload = JSON.stringify({ schemaVersion: "1.0", kind: "project-batch", exportedAt: new Date().toISOString(), projects }, null, 2);
  download(new Blob([payload], { type: "application/json" }), `research-canvas-egc-${projects.length}-projetos.json`);
}

function isProject(value: unknown): value is ResearchProject {
  if (!value || typeof value !== "object") return false;
  const project = value as Partial<ResearchProject>;
  return Boolean(project.id && project.identification && project.context && project.purpose && project.approach && project.planning);
}

export async function parseProjectBackup(file: File): Promise<ResearchProject> {
  const projects = await parseProjectBackups([file]);
  if (projects.length !== 1) {
    throw new Error("Este arquivo contém vários projetos. Use a importação em lote.");
  }
  return projects[0];
}

export async function parseProjectBackups(files: File[]): Promise<ResearchProject[]> {
  const projects: ResearchProject[] = [];
  for (const file of files) {
    const parsed = JSON.parse(await file.text()) as { schemaVersion?: string; project?: unknown; projects?: unknown[] } | unknown[];
    const schemaVersion = Array.isArray(parsed) ? "1.0" : parsed.schemaVersion;
    const candidates = Array.isArray(parsed) ? parsed : parsed.projects ?? (parsed.project ? [parsed.project] : []);
    if (schemaVersion !== "1.0" || !Array.isArray(candidates) || !candidates.every(isProject)) {
      throw new Error(`O arquivo “${file.name}” não é um backup compatível do Research Canvas EGC.`);
    }
    projects.push(...candidates.map((project) => ({ ...project, updatedAt: new Date().toISOString(), isDemo: false })));
  }
  if (!projects.length) {
    throw new Error("Este arquivo não é um backup compatível do Research Canvas EGC.");
  }
  return projects;
}

export async function exportCanvasJpg(project: ResearchProject, elementId = "print-canvas") {
  downloadDataUrl(await canvasImage(elementId), `${safeName(project.identification.provisionalTitle)}-canvas.jpg`);
}

export async function exportCanvasPdf(project: ResearchProject, elementId = "print-canvas") {
  const [{ jsPDF }, dataUrl] = await Promise.all([import("jspdf"), canvasImage(elementId)]);
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const image = pdf.getImageProperties(dataUrl);
  const ratio = Math.min((pageWidth - 12) / image.width, (pageHeight - 12) / image.height);
  const width = image.width * ratio;
  const height = image.height * ratio;
  pdf.addImage(dataUrl, "JPEG", (pageWidth - width) / 2, (pageHeight - height) / 2, width, height, undefined, "FAST");
  pdf.save(`${safeName(project.identification.provisionalTitle)}-canvas.pdf`);
}

type PdfDocument = InstanceType<(typeof import("jspdf"))["jsPDF"]>;

function setPdfColor(pdf: PdfDocument, hex: string, fill = false) {
  const rgb = hex.match(/.{2}/g)?.map((value) => Number.parseInt(value, 16)) ?? [0, 0, 0];
  if (fill) pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
  else pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function addPdfChrome(pdf: PdfDocument, section: string, page: number, total: number, tone: string, project: ResearchProject) {
  const width = pdf.internal.pageSize.getWidth();
  setPdfColor(pdf, COLORS.orange, true); pdf.rect(0, 0, 3, 20, "F");
  setPdfColor(pdf, COLORS.yellow, true); pdf.rect(0, 20, 3, 34, "F");
  setPdfColor(pdf, COLORS.blue, true); pdf.rect(0, 54, 3, 35, "F");
  setPdfColor(pdf, COLORS.orange); pdf.setLineWidth(0.7); pdf.roundedRect(7, 5, 34, 7, 3.5, 3.5, "S");
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); setPdfColor(pdf, "767676"); pdf.text("Painel Científico", 11, 10);
  pdf.setFontSize(17); setPdfColor(pdf, tone); pdf.text(section.toUpperCase(), 47, 11);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); setPdfColor(pdf, "777777");
  pdf.text(`${project.identification.year} ${project.identification.course.toUpperCase()}   ${project.identification.concentrationArea || "PPGEGC"}`, 22, 17);
  pdf.setDrawColor(225, 225, 225); pdf.setLineWidth(0.3); pdf.line(5, 20, width - 5, 20);
  pdf.setFontSize(6); setPdfColor(pdf, "8A8A8A"); pdf.text("Research Canvas EGC · PPGEGC / UFSC", 8, pdf.internal.pageSize.getHeight() - 4);
  pdf.text(`${page} / ${total}`, width - 8, pdf.internal.pageSize.getHeight() - 4, { align: "right" });
}

function addPdfBody(pdf: PdfDocument, title: string, body: string, tone: string) {
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(13); setPdfColor(pdf, tone); pdf.text(title, 10, 31);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(12); setPdfColor(pdf, COLORS.ink);
  const lines = pdf.splitTextToSize(body || "Seção ainda não preenchida.", 235);
  pdf.text(lines, 50, 41, { baseline: "top", lineHeightFactor: 1.35 });
}

function presentationPages(project: ResearchProject) {
  const formulation = [project.context.researchQuestion, project.context.researchProblem, ...project.context.hypotheses.map((item) => item.text)].filter(Boolean).join("\n\n");
  return [
    { section: "Pesquisa", tone: COLORS.blue, title: project.identification.provisionalTitle, body: `${project.identification.student || "Estudante"}\n${project.identification.course} · ${project.identification.concentrationArea || "PPGEGC"}\nOrientação: ${project.identification.advisor || "a definir"}` },
    { section: "Contexto", tone: COLORS.blue, title: "Problemática", body: project.context.problematic },
    { section: "Contexto", tone: COLORS.blue, title: "Problema de pesquisa", body: formulation },
    { section: "Contexto", tone: COLORS.blue, title: "Construtos e aderência ao EGC", body: `${project.context.constructs.map((item) => `• ${item.name}`).join("\n")}\n\n${project.context.egcAlignment}` },
    { section: "Propósito", tone: COLORS.red, title: "Objetivos", body: `OBJETIVO GERAL\n${project.purpose.generalObjective}\n\nOBJETIVOS ESPECÍFICOS\n${project.purpose.specificObjectives.map((item, index) => `${index + 1}. ${item.text}`).join("\n")}` },
    { section: "Propósito", tone: COLORS.red, title: "Limitações e delimitações", body: `ESCOPO\n${project.purpose.scope}\n\nDELIMITAÇÕES\n${project.purpose.delimitations.map((item) => `• ${item.text}`).join("\n")}\n\nLIMITAÇÕES\n${project.purpose.limitations.map((item) => `• ${item.text}`).join("\n")}` },
    { section: "Abordagem", tone: COLORS.green, title: "Visão de mundo e classificação", body: `${project.approach.worldview}\n\n${[...project.approach.paradigms, ...project.approach.classifications].map((item) => `• ${item}`).join("\n")}` },
    { section: "Abordagem", tone: COLORS.green, title: "Método", body: `${project.approach.mainApproach}\n\n${project.approach.methods.map((item) => `• ${item.category}: ${item.name}${item.description ? ` - ${item.description}` : ""}`).join("\n")}` },
    { section: "Planejamento", tone: COLORS.navy, title: "Planejamento", body: `${project.planning.procedures.map((item, index) => `${index + 1}. ${item.title} - ${item.expectedResult || "resultado a definir"}`).join("\n")}\n\nCRONOGRAMA\n${project.planning.schedule.map((item) => `• ${item.name}: ${item.start || "?"} a ${item.end || "?"} · ${item.status}`).join("\n")}` },
  ];
}

export async function exportPresentationPdf(project: ResearchProject, canvasElementId = "export-canvas-capture") {
  const { jsPDF } = await import("jspdf");
  const pages = presentationPages(project);
  const total = pages.length + 1;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  pages.forEach((page, index) => {
    if (index) pdf.addPage("a4", "landscape");
    addPdfChrome(pdf, page.section, index + 1, total, page.tone, project);
    addPdfBody(pdf, page.title, page.body, page.tone);
  });
  pdf.addPage("a4", "landscape");
  addPdfChrome(pdf, "Síntese", total, total, COLORS.navy, project);
  const imageUrl = await canvasImage(canvasElementId);
  const image = pdf.getImageProperties(imageUrl);
  const ratio = Math.min(274 / image.width, 165 / image.height);
  pdf.addImage(imageUrl, "JPEG", 12, 25, image.width * ratio, image.height * ratio, undefined, "FAST");
  pdf.save(`${safeName(project.identification.provisionalTitle)}-apresentacao.pdf`);
}

export async function exportSummaryPdf(project: ResearchProject) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const margin = 18;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  let y = 20;
  const ensure = (needed: number) => { if (y + needed > 278) { pdf.addPage(); y = 20; } };
  const heading = (text: string, level = 1) => { ensure(level === 1 ? 18 : 12); pdf.setFont("helvetica", "bold"); pdf.setFontSize(level === 1 ? 16 : 11); setPdfColor(pdf, level === 1 ? COLORS.blue : COLORS.ink); pdf.text(text, margin, y); y += level === 1 ? 9 : 6; };
  const paragraph = (text: string) => { const lines = pdf.splitTextToSize(text || "Não preenchido.", width); ensure(lines.length * 5 + 5); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5); setPdfColor(pdf, COLORS.ink); pdf.text(lines, margin, y, { lineHeightFactor: 1.35 }); y += lines.length * 4.6 + 5; };
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); setPdfColor(pdf, COLORS.blue); pdf.text("RESEARCH CANVAS EGC · PPGEGC / UFSC", margin, y); y += 10;
  pdf.setFontSize(20); setPdfColor(pdf, COLORS.ink); pdf.text(pdf.splitTextToSize(project.identification.provisionalTitle, width), margin, y); y += 18;
  paragraph(`${project.identification.student} · ${project.identification.course} · ${project.identification.concentrationArea || "Área a definir"}\nLinha: ${project.identification.researchLine || "a definir"}\nOrientação: ${project.identification.advisor || "a definir"}`);
  heading("Contexto"); heading("Problemática", 2); paragraph(project.context.problematic); heading("Formulação da pesquisa", 2); paragraph(project.context.researchQuestion || project.context.researchProblem || project.context.hypotheses.map((item) => item.text).join("\n")); heading("Construtos", 2); paragraph(project.context.constructs.map((item) => `${item.name}: ${item.definition}`).join("\n\n")); heading("Aderência ao EGC", 2); paragraph(project.context.egcAlignment);
  heading("Propósito"); heading("Objetivo geral", 2); paragraph(project.purpose.generalObjective); heading("Objetivos específicos", 2); paragraph(project.purpose.specificObjectives.map((item, index) => `${index + 1}. ${item.text}`).join("\n")); heading("Escopo e recortes", 2); paragraph(`${project.purpose.scope}\n\nDelimitações:\n${project.purpose.delimitations.map((item) => `• ${item.text}`).join("\n")}\n\nLimitações:\n${project.purpose.limitations.map((item) => `• ${item.text}`).join("\n")}`);
  heading("Abordagem"); paragraph(`${project.approach.worldview}\n\nClassificação: ${project.approach.classifications.join(" · ")}\n\nMétodo: ${project.approach.mainApproach}\n${project.approach.methods.map((item) => `${item.category}: ${item.name}`).join("\n")}`);
  heading("Planejamento"); paragraph(project.planning.procedures.map((item, index) => `${index + 1}. ${item.title}: ${item.expectedResult}`).join("\n"));
  ensure(25); pdf.setDrawColor(215, 224, 232); pdf.line(margin, y, margin + width, y); y += 7; pdf.setFontSize(7.5); setPdfColor(pdf, COLORS.muted); pdf.text(pdf.splitTextToSize("Documento gerado pelo Research Canvas EGC. Os indicadores da plataforma são orientativos e não substituem a avaliação acadêmica.", width), margin, y);
  pdf.save(`${safeName(project.identification.provisionalTitle)}-resumo-estruturado.pdf`);
}

function adaptivePptFontSize(text: string) {
  const length = text.trim().length;
  if (length > 1500) return 14;
  if (length > 1050) return 16;
  if (length > 720) return 19;
  if (length > 440) return 22;
  if (length > 240) return 25;
  return 29;
}

async function createPptx(project: ResearchProject) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  type Slide = ReturnType<typeof pptx.addSlide>;
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Research Canvas EGC — PPGEGC/UFSC";
  pptx.subject = "Painel científico estruturado";
  pptx.title = project.identification.provisionalTitle;
  pptx.company = "PPGEGC / UFSC";
  pptx.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };
  const [ufscLogo, egcLogo] = await Promise.all([imageData("/brand/ufsc.png"), imageData("/brand/egc.png")]);

  const addChrome = (slide: Slide, section: string, number: number, tone: string) => {
    slide.background = { color: COLORS.white };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.08, h: 1.1, fill: { color: COLORS.orange }, line: { color: COLORS.orange } });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 1.1, w: 0.08, h: 1.9, fill: { color: COLORS.yellow }, line: { color: COLORS.yellow } });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 3, w: 0.08, h: 2, fill: { color: COLORS.blue }, line: { color: COLORS.blue } });
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.27, y: 0.17, w: 2.1, h: 0.38, rectRadius: 0.08, fill: { color: COLORS.white, transparency: 100 }, line: { color: COLORS.orange, width: 2 } });
    slide.addText("Painel Científico", { x: 0.43, y: 0.25, w: 1.8, h: 0.18, fontSize: 14, bold: true, color: "777777", margin: 0, align: "center" });
    slide.addText(section.toUpperCase(), { x: 2.62, y: 0.16, w: 5.3, h: 0.38, fontSize: 22, bold: true, color: tone, margin: 0 });
    slide.addText(`${project.identification.year} ${project.identification.course.toUpperCase()}    ${project.identification.concentrationArea || "PPGEGC"}`, { x: 1.8, y: 0.62, w: 5.4, h: 0.18, fontSize: 7.5, color: "777777", margin: 0 });
    slide.addImage({ data: ufscLogo, x: 11.95, y: 0.11, w: 1.12, h: 0.48 });
    slide.addImage({ data: egcLogo, x: 0.23, y: 6.98, w: 1.06, h: 0.4 });
    slide.addText("Research Canvas EGC · instrumento de apoio à estruturação e reflexão sobre projetos de pesquisa", { x: 1.7, y: 7.12, w: 7.5, h: 0.12, fontSize: 4.8, color: "858585", margin: 0 });
    slide.addText(`${number}`, { x: 12.55, y: 7.1, w: 0.35, h: 0.12, fontSize: 6, color: "858585", align: "right", margin: 0 });
  };
  const addRail = (slide: Slide, items: string[], active: number) => items.forEach((item, index) => slide.addText(item, { x: 0.3, y: 1.18 + index * 0.34, w: 2.25, h: 0.25, fontSize: 10.5, bold: index === active, color: index === active ? "202020" : "D0D0D0", margin: 0 }));
  const addBody = (slide: Slide, body: string) => slide.addText(body || "Seção ainda não preenchida.", { x: 4.35, y: 1.2, w: 8.25, h: 5.45, fontSize: adaptivePptFontSize(body), color: COLORS.ink, margin: 0.06, valign: "middle", fit: "shrink", breakLine: false, paraSpaceAfter: 8 });

  const addCanvas = (slide: Slide) => {
    const areas = [
      { title: "CONTEXTO", color: COLORS.teal, x: 0.35, body: `PROBLEMÁTICA\n${project.context.problematic}\n\nPERGUNTA / PROBLEMA\n${project.context.researchQuestion || project.context.researchProblem}\n\nCONSTRUTOS\n${project.context.constructs.map((item) => item.name).join(" · ")}` },
      { title: "PROPÓSITO", color: COLORS.blue, x: 4.66, body: `OBJETIVO GERAL\n${project.purpose.generalObjective}\n\nOBJETIVOS ESPECÍFICOS\n${project.purpose.specificObjectives.map((item, index) => `${index + 1}. ${item.text}`).join("\n")}\n\nESCOPO\n${project.purpose.scope}` },
      { title: "ABORDAGEM", color: COLORS.magenta, x: 8.97, body: `VISÃO DE MUNDO\n${project.approach.worldview}\n\nCLASSIFICAÇÃO\n${project.approach.classifications.join(" · ")}\n\nMÉTODO\n${project.approach.mainApproach}` },
    ];
    areas.forEach((area) => {
      slide.addShape(pptx.ShapeType.roundRect, { x: area.x, y: 0.62, w: 4.02, h: 5.75, rectRadius: 0.04, fill: { color: "FBFCFD" }, line: { color: area.color, width: 1.2 } });
      slide.addShape(pptx.ShapeType.rect, { x: area.x, y: 0.62, w: 4.02, h: 0.48, fill: { color: area.color }, line: { color: area.color } });
      slide.addText(area.title, { x: area.x + 0.15, y: 0.76, w: 3.72, h: 0.2, fontSize: 11, bold: true, color: COLORS.white, align: "center", margin: 0 });
      slide.addText(area.body || "Preencha esta seção", { x: area.x + 0.18, y: 1.25, w: 3.66, h: 4.85, fontSize: 10.5, color: COLORS.ink, margin: 0.04, valign: "top", fit: "shrink" });
    });
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.35, y: 6.52, w: 12.64, h: 0.62, rectRadius: 0.04, fill: { color: "EAF0F5" }, line: { color: COLORS.navy } });
    slide.addText(`PLANEJAMENTO  ·  ${project.planning.procedures.map((item) => item.title).join("  →  ") || "Procedimentos a preencher"}`, { x: 0.6, y: 6.73, w: 12.14, h: 0.2, fontSize: 9.5, bold: true, color: COLORS.navy, align: "center", margin: 0, fit: "shrink" });
  };

  const pages = presentationPages(project);
  let slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.32, y: 0.18, w: 2.15, h: 0.38, rectRadius: 0.08, fill: { color: COLORS.white, transparency: 100 }, line: { color: COLORS.orange, width: 2 } });
  slide.addText("Painel Científico", { x: 0.48, y: 0.26, w: 1.82, h: 0.18, fontSize: 14, bold: true, color: "777777", margin: 0, align: "center" });
  slide.addText(`${project.identification.year} ${project.identification.course.toUpperCase()}    ${project.identification.concentrationArea || "PPGEGC"}`, { x: 1.8, y: 0.64, w: 5.4, h: 0.18, fontSize: 7.5, color: "777777", margin: 0 });
  slide.addImage({ data: ufscLogo, x: 11.95, y: 0.11, w: 1.12, h: 0.48 });
  slide.addImage({ data: egcLogo, x: 0.25, y: 6.98, w: 1.06, h: 0.4 });
  slide.addText(project.identification.provisionalTitle, { x: 2.15, y: 2.3, w: 9, h: 1.35, fontSize: project.identification.provisionalTitle.length > 120 ? 25 : project.identification.provisionalTitle.length > 75 ? 30 : 36, bold: true, color: COLORS.blue, align: "center", valign: "middle", margin: 0, fit: "shrink" });
  slide.addText(`${project.identification.student || "Estudante"}\n${project.identification.advisor ? `Prof. ${project.identification.advisor}` : "Orientação a definir"}`, { x: 2.8, y: 3.95, w: 7.7, h: 0.85, fontSize: 17, color: "555555", align: "center", margin: 0, fit: "shrink" });
  slide.addText("1", { x: 12.55, y: 7.1, w: 0.35, h: 0.12, fontSize: 6, color: "858585", align: "right", margin: 0 });

  const rails: Record<string, string[]> = {
    Contexto: ["Problemática", "Problema de pesquisa", "Construtos", "Aderência ao EGC"],
    Propósito: ["Objetivo Geral", "Objetivos Específicos", "Limitações e Delimitações"],
    Abordagem: ["Visão de Mundo", "Classificação da Pesquisa", "Método"],
    Planejamento: ["Procedimentos", "Cronograma", "Trajetória acadêmica"],
  };
  const activeFor = (title: string) => title.includes("Problemática") ? 0 : title.includes("Problema") ? 1 : title.includes("Construtos") ? 2 : title.includes("Objetivos") ? 0 : title.includes("Limitações") ? 2 : title.includes("Visão") ? 0 : title.includes("Método") ? 2 : 0;
  pages.slice(1).forEach((page, index) => {
    slide = pptx.addSlide(); addChrome(slide, page.section, index + 2, page.tone); addRail(slide, rails[page.section] ?? [page.title], activeFor(page.title)); addBody(slide, page.body);
  });
  slide = pptx.addSlide(); slide.background = { color: COLORS.white }; addCanvas(slide);
  await pptx.writeFile({ fileName: `${safeName(project.identification.provisionalTitle)}-painel-cientifico.pptx` });
}

export async function exportCanvasPptx(project: ResearchProject, elementId = "print-canvas") {
  const [dataUrl, { default: PptxGenJS }] = await Promise.all([canvasImage(elementId), import("pptxgenjs")]);
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = dataUrl;
  });
  const pptx = new PptxGenJS();
  const width = 13.333;
  const height = width * dimensions.height / dimensions.width;
  pptx.defineLayout({ name: "RESEARCH_CANVAS_EXACT", width, height });
  pptx.layout = "RESEARCH_CANVAS_EXACT";
  pptx.author = "Research Canvas EGC — PPGEGC/UFSC";
  pptx.title = `${project.identification.provisionalTitle} — Canvas`;
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  slide.addImage({ data: dataUrl, x: 0, y: 0, w: width, h: height });
  await pptx.writeFile({ fileName: `${safeName(project.identification.provisionalTitle)}-canvas.pptx` });
}

export async function exportProjectPptx(project: ResearchProject) {
  return createPptx(project);
}
