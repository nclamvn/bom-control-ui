/**
 * Research Assistant Types
 */

export interface ResearchQuery {
  question: string;
  context?: string;
  constraints?: {
    maxSources?: number;
    preferredSources?: string[];
    excludeSources?: string[];
    language?: string;
    recency?: "any" | "recent" | "last_year" | "last_month";
  };
}

export interface ResearchPlan {
  mainQuestion: string;
  subQuestions: string[];
  searchQueries: string[];
  estimatedComplexity: "simple" | "moderate" | "complex";
}

export interface SourceInfo {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
  credibility: "high" | "medium" | "low" | "unknown";
}

export interface ResearchFindings {
  question: string;
  answer: string;
  confidence: number;
  sources: SourceInfo[];
  relatedQuestions?: string[];
}

export interface StructuredAnswer {
  summary: string;
  details: Array<{
    heading: string;
    content: string;
    sources: string[];
  }>;
  keyFacts: string[];
  caveats?: string[];
  sources: Array<{
    title: string;
    url: string;
  }>;
  metadata: {
    questionType: string;
    complexity: string;
    confidence: number;
    generatedAt: string;
  };
}

export interface ResearchOptions {
  depth?: "quick" | "standard" | "deep";
  format?: "summary" | "detailed" | "structured";
  includeRelated?: boolean;
  maxTokens?: number;
}
