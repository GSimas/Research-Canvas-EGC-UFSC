import type { ResearchProject } from "../../domain/models/project";

export interface AISuggestion {
  id: string;
  target: string;
  title: string;
  rationale: string;
  proposedText?: string;
}

export interface AIService {
  analyzeCoherence(project: ResearchProject): Promise<AISuggestion[]>;
  suggestGuidingQuestions(project: ResearchProject, section: string): Promise<string[]>;
  reviewObjective(project: ResearchProject, objectiveId?: string): Promise<AISuggestion[]>;
  identifyConstructs(project: ResearchProject): Promise<AISuggestion[]>;
}

export class UnavailableAIService implements AIService {
  private unavailable(): never {
    throw new Error("O serviço de IA não está habilitado neste MVP.");
  }
  analyzeCoherence(): Promise<AISuggestion[]> { return Promise.reject(this.unavailable()); }
  suggestGuidingQuestions(): Promise<string[]> { return Promise.reject(this.unavailable()); }
  reviewObjective(): Promise<AISuggestion[]> { return Promise.reject(this.unavailable()); }
  identifyConstructs(): Promise<AISuggestion[]> { return Promise.reject(this.unavailable()); }
}
