/**
 * Research Planner
 * Breaks down questions and plans research
 */

import { extract } from "../utils/llm-client.js";
import type { ResearchQuery, ResearchPlan } from "./types.js";

// ── QUESTION ANALYSIS ───────────────────────────────────────

type QuestionType =
  | "factual"
  | "comparison"
  | "explanation"
  | "opinion"
  | "procedural"
  | "exploratory";

/**
 * Analyze question type
 */
export async function analyzeQuestion(
  _userId: string,
  question: string,
): Promise<{
  type: QuestionType;
  complexity: "simple" | "moderate" | "complex";
  needsSearch: boolean;
}> {
  // Quick pattern matching first (FREE)

  // Simple factual
  if (
    /^(what is|who is|when was|where is|how many|how much)\b/i.test(question)
  ) {
    return {
      type: "factual",
      complexity: "simple",
      needsSearch: !isCommonKnowledge(question),
    };
  }

  // Comparison
  if (
    /\bvs\.?\b|\bversus\b|\bcompare\b|\bdifference between\b/i.test(question)
  ) {
    return {
      type: "comparison",
      complexity: "moderate",
      needsSearch: true,
    };
  }

  // Procedural
  if (/^how (do|can|to|should)\b/i.test(question)) {
    return {
      type: "procedural",
      complexity: "moderate",
      needsSearch: true,
    };
  }

  // Explanation
  if (/^(why|how does|how do|explain)\b/i.test(question)) {
    return {
      type: "explanation",
      complexity: "moderate",
      needsSearch: true,
    };
  }

  // Opinion/recommendation
  if (/\b(best|recommend|should i|which one|better)\b/i.test(question)) {
    return {
      type: "opinion",
      complexity: "moderate",
      needsSearch: true,
    };
  }

  // Default: exploratory
  return {
    type: "exploratory",
    complexity: question.split(" ").length > 20 ? "complex" : "moderate",
    needsSearch: true,
  };
}

function isCommonKnowledge(question: string): boolean {
  const commonPatterns = [
    /what is (the )?capital of/i,
    /who (was|is) the (first|current) president/i,
    /when (was|did).*born/i,
    /how many (days|months|weeks) in/i,
  ];

  return commonPatterns.some((p) => p.test(question));
}

// ── RESEARCH PLANNING ───────────────────────────────────────

/**
 * Create research plan
 */
export async function createPlan(
  userId: string,
  query: ResearchQuery,
): Promise<ResearchPlan> {
  const analysis = await analyzeQuestion(userId, query.question);

  // Simple questions don't need complex plans
  if (analysis.complexity === "simple") {
    return {
      mainQuestion: query.question,
      subQuestions: [],
      searchQueries: analysis.needsSearch ? [query.question] : [],
      estimatedComplexity: "simple",
    };
  }

  // Complex questions need breakdown
  const result = await extract<{
    subQuestions: string[];
    searchQueries: string[];
  }>(
    userId,
    `Question: ${query.question}
${query.context ? `Context: ${query.context}` : ""}`,
    `{
  "subQuestions": ["Sub-question 1", "Sub-question 2"],
  "searchQueries": ["search query 1", "search query 2"]
}`,
    `Break this question into sub-questions that need to be answered.
Generate concise search queries (2-5 words each) to find relevant information.
Maximum 3 sub-questions and 4 search queries.`,
  );

  return {
    mainQuestion: query.question,
    subQuestions: result.subQuestions.slice(0, 3),
    searchQueries: result.searchQueries.slice(0, 4),
    estimatedComplexity: analysis.complexity,
  };
}
