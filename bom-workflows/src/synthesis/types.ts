/**
 * Document Synthesis Types
 */

export interface SourceDocument {
  id: string;
  name: string;
  content: string;
  type: "file" | "url" | "text" | "drive";
  metadata?: {
    author?: string;
    date?: string;
    url?: string;
  };
}

export interface KeyPoint {
  point: string;
  source: string;
  importance: "high" | "medium" | "low";
  quotes?: string[];
}

export interface ResearchGap {
  topic: string;
  question: string;
  suggestedSources?: string[];
}

export interface SynthesisOutline {
  title: string;
  sections: Array<{
    heading: string;
    keyPoints: string[];
    sourcesNeeded: string[];
  }>;
}

export interface SynthesizedDocument {
  title: string;
  summary: string;
  content: string;
  sections: Array<{
    heading: string;
    content: string;
    sources: string[];
  }>;
  bibliography: Array<{
    id: string;
    citation: string;
  }>;
  metadata: {
    wordCount: number;
    sourceCount: number;
    generatedAt: string;
  };
}

export interface SynthesisOptions {
  style?: "academic" | "business" | "casual" | "technical";
  targetLength?: "brief" | "standard" | "comprehensive";
  includeResearch?: boolean;
  language?: string;
  audience?: string;
}
