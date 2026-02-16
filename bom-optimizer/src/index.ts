/**
 * Token Optimization Engine - Main Exports
 */

// Router
export { SmartRouter, router, routeRequest } from "./router/index.js";
export { classifyTask, quickClassify } from "./router/classifier.js";
export { compressContext, compressAndMerge } from "./router/compressor.js";

// Cache
export { CacheManager, cache, exactCache, semanticCache } from "./cache/index.js";

// Checkpoint
export {
  Workflow,
  createWorkflow,
  resumeWorkflow,
  getResumableWorkflows,
  deleteWorkflow,
} from "./checkpoint/index.js";

// Tracker
export { CostTracker, createTracker, metricsStore, reporter } from "./tracker/index.js";

// Middleware
export { createOptimizationMiddleware } from "./middleware/optimization-middleware.js";

// Config
export {
  MODELS,
  TASK_MODEL_MAP,
  DEFAULT_CACHE_CONFIG,
  DEFAULT_COST_LIMITS,
} from "./config.js";

// Types
export * from "./types.js";

// ── CONVENIENCE WRAPPER ─────────────────────────────────────

import { router } from "./router/index.js";
import { cache } from "./cache/index.js";
import { createTracker } from "./tracker/index.js";
import type { TaskType } from "./types.js";

export interface OptimizeOptions {
  userId: string;
  prompt: string;
  systemPrompt?: string;
  forceModel?: string;
  allowCache?: boolean;
  allowSemantic?: boolean;
}

/**
 * Main optimization function — call before making LLM request
 */
export async function optimizeRequest(options: OptimizeOptions): Promise<{
  shouldSkip: boolean;
  cachedResponse?: string;
  cacheType?: "exact" | "semantic";
  routingDecision: ReturnType<typeof router.route>;
}> {
  const {
    userId: _userId,
    prompt,
    systemPrompt,
    forceModel,
    allowCache = true,
    allowSemantic = true,
  } = options;

  if (allowCache) {
    const cached = await cache.get(prompt, { systemPrompt, allowSemantic });
    if (cached) {
      return {
        shouldSkip: true,
        cachedResponse: cached.entry.response,
        cacheType: cached.type,
        routingDecision: router.route(prompt, { systemPrompt, forceModel }),
      };
    }
  }

  return {
    shouldSkip: false,
    routingDecision: router.route(prompt, { systemPrompt, forceModel }),
  };
}

/**
 * Record completed request — call after LLM response
 */
export async function recordRequest(
  userId: string,
  prompt: string,
  response: string,
  metrics: {
    systemPrompt?: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    taskType?: TaskType;
    cacheHit?: boolean;
    baselineCost?: number;
  },
): Promise<void> {
  await cache.set(prompt, response, {
    systemPrompt: metrics.systemPrompt,
    model: metrics.model,
    inputTokens: metrics.inputTokens,
    outputTokens: metrics.outputTokens,
    cost: 0,
    enableSemantic: true,
  });

  const tracker = createTracker(userId);
  tracker.record({
    model: metrics.model,
    taskType: metrics.taskType,
    inputTokens: metrics.inputTokens,
    outputTokens: metrics.outputTokens,
    latencyMs: metrics.latencyMs,
    cacheHit: metrics.cacheHit,
    baselineCost: metrics.baselineCost,
  });
}
