/**
 * Research Assistant Workflow
 * Main entry point
 */

import { cache as optimizerCache } from "bom-optimizer";
import { createPlan } from "./planner.js";
import {
  searchAndProcess,
  setSearchProvider as setSearcher,
} from "./searcher.js";
import { synthesizeAnswer, generateFollowUps } from "./synthesizer.js";
import type {
  ResearchQuery,
  StructuredAnswer,
  ResearchOptions,
} from "./types.js";
import type { WorkflowResult } from "../types.js";

// ── RESEARCH WORKFLOW ───────────────────────────────────────

export interface ResearchResult {
  answer: StructuredAnswer;
  plan: {
    mainQuestion: string;
    subQuestions: string[];
    searchQueries: string[];
    estimatedComplexity: "simple" | "moderate" | "complex";
  };
  followUpQuestions?: string[];
}

/**
 * Full research workflow
 */
export async function research(
  userId: string,
  query: ResearchQuery,
  options: ResearchOptions = {},
): Promise<WorkflowResult<ResearchResult>> {
  const startTime = Date.now();
  let cacheHits = 0;

  const { depth = "standard", includeRelated = true } = options;

  // Check cache for similar questions
  const cached = await optimizerCache.get(query.question, {
    allowSemantic: true,
  });

  if (
    cached &&
    cached.type === "semantic" &&
    cached.similarity &&
    cached.similarity > 0.92
  ) {
    cacheHits++;

    try {
      const cachedAnswer = JSON.parse(
        cached.entry.response,
      ) as StructuredAnswer;

      return {
        success: true,
        data: {
          answer: cachedAnswer,
          plan: {
            mainQuestion: query.question,
            subQuestions: [],
            searchQueries: [],
            estimatedComplexity: "simple",
          },
        },
        metrics: {
          totalTokens: 0,
          totalCost: 0,
          savedTokens:
            cached.entry.tokens.input + cached.entry.tokens.output,
          savedCost: cached.entry.cost,
          cacheHits: 1,
          steps: 0,
          duration: Date.now() - startTime,
        },
      };
    } catch {
      // Cache parse failed, continue with fresh research
    }
  }

  try {
    // Step 1: Create research plan
    const plan = await createPlan(userId, query);

    // Step 2: Execute searches
    const sources =
      plan.searchQueries.length > 0
        ? await searchAndProcess(userId, plan.searchQueries, {
            maxResultsPerQuery: depth === "deep" ? 7 : 5,
            maxTotal: depth === "deep" ? 15 : 10,
          })
        : [];

    // Step 3: Synthesize answer
    const answer = await synthesizeAnswer(userId, plan, sources, options);

    // Step 4: Generate follow-ups (optional)
    let followUpQuestions: string[] | undefined;
    if (includeRelated && depth !== "quick") {
      followUpQuestions = await generateFollowUps(
        userId,
        query.question,
        answer,
      );
    }

    // Cache the answer for future similar questions
    await optimizerCache.set(query.question, JSON.stringify(answer), {
      model: "research-assistant",
      inputTokens: query.question.length / 4,
      outputTokens: JSON.stringify(answer).length / 4,
      cost: 0,
      enableSemantic: true,
    });

    return {
      success: true,
      data: {
        answer,
        plan,
        followUpQuestions,
      },
      metrics: {
        totalTokens: 0,
        totalCost: 0,
        savedTokens: cacheHits * 500,
        savedCost: cacheHits * 0.002,
        cacheHits,
        steps: includeRelated ? 4 : 3,
        duration: Date.now() - startTime,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      metrics: {
        totalTokens: 0,
        totalCost: 0,
        savedTokens: 0,
        savedCost: 0,
        cacheHits,
        steps: 0,
        duration: Date.now() - startTime,
      },
    };
  }
}

/**
 * Quick answer (no search, uses LLM knowledge)
 */
export async function quickAnswer(
  userId: string,
  question: string,
): Promise<WorkflowResult<StructuredAnswer>> {
  const result = await research(
    userId,
    { question },
    {
      depth: "quick",
      format: "summary",
      includeRelated: false,
    },
  );

  if (result.success && result.data) {
    return {
      ...result,
      data: result.data.answer,
    };
  }

  return {
    success: false,
    error: result.error,
    metrics: result.metrics,
  };
}

export * from "./types.js";
export { setSearcher as setSearchProvider };
