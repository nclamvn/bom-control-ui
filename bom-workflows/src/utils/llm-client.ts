/**
 * Optimized LLM Client
 * Wraps all LLM calls with optimization
 */

import {
  optimizeRequest,
  recordRequest,
  createTracker,
  createWorkflow,
  resumeWorkflow,
  type Workflow,
} from "bom-optimizer";
import type { LLMRequest, LLMResponse } from "../types.js";

// ── LLM PROVIDER INTERFACE ─────────────────────────────────

export interface LLMProvider {
  complete(request: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
    temperature?: number;
  }): Promise<{
    content: string;
    usage: { inputTokens: number; outputTokens: number };
  }>;
}

// Default provider
let provider: LLMProvider | null = null;

export function setProvider(p: LLMProvider): void {
  provider = p;
}

// ── OPTIMIZED COMPLETION ────────────────────────────────────

export async function complete(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now();

  // 1. Pre-request optimization (cache check + routing)
  const optimization = await optimizeRequest({
    userId: request.userId,
    prompt: request.prompt,
    systemPrompt: request.systemPrompt,
    forceModel: request.model,
    allowCache: true,
    allowSemantic: true,
  });

  // 2. Cache hit → return immediately (FREE)
  if (optimization.shouldSkip && optimization.cachedResponse) {
    return {
      content: optimization.cachedResponse,
      model: optimization.routingDecision.selectedModel.id,
      usage: { inputTokens: 0, outputTokens: 0 },
      cached: true,
      cost: 0,
    };
  }

  // 3. Select model from routing decision
  const selectedModel = optimization.routingDecision.selectedModel;

  // 4. Make LLM call
  if (!provider) {
    throw new Error("LLM provider not configured. Call setProvider() first.");
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (request.systemPrompt) {
    messages.push({ role: "system", content: request.systemPrompt });
  }
  messages.push({ role: "user", content: request.prompt });

  const response = await provider.complete({
    model: selectedModel.id,
    messages,
    maxTokens: request.maxTokens,
    temperature: request.temperature,
  });

  // 5. Calculate cost
  const cost =
    (response.usage.inputTokens / 1000) * selectedModel.inputCostPer1k +
    (response.usage.outputTokens / 1000) * selectedModel.outputCostPer1k;

  // 6. Record for caching & tracking
  await recordRequest(request.userId, request.prompt, response.content, {
    systemPrompt: request.systemPrompt,
    model: selectedModel.id,
    inputTokens: response.usage.inputTokens,
    outputTokens: response.usage.outputTokens,
    latencyMs: Date.now() - startTime,
    taskType: request.taskType as any,
    baselineCost: optimization.routingDecision.estimatedCost * 2,
  });

  return {
    content: response.content,
    model: selectedModel.id,
    usage: response.usage,
    cached: false,
    cost,
  };
}

// ── BATCH COMPLETION ────────────────────────────────────────

export async function completeBatch(
  requests: LLMRequest[],
  options: { concurrency?: number } = {},
): Promise<LLMResponse[]> {
  const { concurrency = 3 } = options;
  const results: LLMResponse[] = [];

  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(complete));
    results.push(...batchResults);
  }

  return results;
}

// ── WORKFLOW HELPERS ────────────────────────────────────────

export function startWorkflow(
  userId: string,
  name: string,
  steps: Array<{ name: string; input?: unknown }>,
): Workflow {
  return createWorkflow(userId, name, steps);
}

export function continueWorkflow(workflowId: string): Workflow | null {
  return resumeWorkflow(workflowId);
}

// ── QUICK CLASSIFICATION ────────────────────────────────────

export async function classify<T extends string>(
  userId: string,
  content: string,
  categories: T[],
  context?: string,
): Promise<{ category: T; confidence: number }> {
  const prompt = `Classify the following content into exactly one category.

Categories: ${categories.join(", ")}

${context ? `Context: ${context}\n\n` : ""}Content:
${content}

Respond with JSON only: {"category": "<category>", "confidence": <0-1>}`;

  const response = await complete({
    userId,
    prompt,
    taskType: "classification",
    temperature: 0,
    maxTokens: 50,
  });

  try {
    const result = JSON.parse(response.content);
    return {
      category: result.category as T,
      confidence: result.confidence || 0.8,
    };
  } catch {
    const found = categories.find((c) =>
      response.content.toLowerCase().includes(c.toLowerCase()),
    );
    return { category: found || categories[0], confidence: 0.5 };
  }
}

// ── QUICK EXTRACTION ────────────────────────────────────────

export async function extract<T>(
  userId: string,
  content: string,
  schema: string,
  instructions?: string,
): Promise<T> {
  const prompt = `Extract structured data from the following content.

${instructions ? `Instructions: ${instructions}\n\n` : ""}Expected output format (JSON):
${schema}

Content:
${content}

Respond with valid JSON only, no explanation.`;

  const response = await complete({
    userId,
    prompt,
    taskType: "extraction",
    temperature: 0,
    maxTokens: 1000,
  });

  let cleaned = response.content.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  return JSON.parse(cleaned.trim()) as T;
}
