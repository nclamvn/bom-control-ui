/**
 * Shared Types for Workflows
 */

// ── WORKFLOW RESULT ─────────────────────────────────────────

export interface WorkflowResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metrics: {
    totalTokens: number;
    totalCost: number;
    savedTokens: number;
    savedCost: number;
    cacheHits: number;
    steps: number;
    duration: number;
  };
}

// ── LLM TYPES ───────────────────────────────────────────────

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  userId: string;
  taskType?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  cached: boolean;
  cost: number;
}

// ── WORKFLOW CONTEXT ────────────────────────────────────────

export interface WorkflowContext {
  userId: string;
  workflowId: string;
  startedAt: number;
  metadata?: Record<string, unknown>;
}

// ── HUMAN REVIEW ────────────────────────────────────────────

export interface ReviewRequest<T = unknown> {
  type: "approve" | "edit" | "reject";
  data: T;
  message: string;
  options?: string[];
}

export interface ReviewResponse<T = unknown> {
  action: "approve" | "edit" | "reject";
  editedData?: T;
  feedback?: string;
}
