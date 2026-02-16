/**
 * Answer Synthesizer
 * Generates structured answers from research
 */

import { complete } from "../utils/llm-client.js";
import { extract } from "../utils/llm-client.js";
import type {
  ResearchPlan,
  SourceInfo,
  StructuredAnswer,
  ResearchOptions,
} from "./types.js";

// ── SYNTHESIS ───────────────────────────────────────────────

/**
 * Synthesize answer from sources
 */
export async function synthesizeAnswer(
  userId: string,
  plan: ResearchPlan,
  sources: SourceInfo[],
  options: ResearchOptions = {},
): Promise<StructuredAnswer> {
  const { format = "detailed", depth = "standard" } = options;

  const sourceContext = sources
    .slice(0, 5)
    .map((s, i) => `[${i + 1}] ${s.title}\n${s.snippet}`)
    .join("\n\n");

  // Simple questions: direct answer
  if (plan.estimatedComplexity === "simple" && format === "summary") {
    const response = await complete({
      userId,
      prompt: `Answer this question concisely based on the provided sources.

Question: ${plan.mainQuestion}

Sources:
${sourceContext}

Provide a direct, 1-2 sentence answer.`,
      taskType: "extraction",
      maxTokens: 150,
    });

    return {
      summary: response.content.trim(),
      details: [],
      keyFacts: [],
      sources: sources
        .slice(0, 3)
        .map((s) => ({ title: s.title, url: s.url })),
      metadata: {
        questionType: "simple",
        complexity: "simple",
        confidence: sources.length > 0 ? 0.8 : 0.5,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  // Complex questions: structured answer
  const structuredPrompt = `Answer this research question comprehensively.

MAIN QUESTION: ${plan.mainQuestion}

${
  plan.subQuestions.length > 0
    ? `SUB-QUESTIONS TO ADDRESS:\n${plan.subQuestions.map((q) => `- ${q}`).join("\n")}\n\n`
    : ""
}

SOURCES:
${sourceContext}

Provide a structured answer as JSON:
{
  "summary": "2-3 sentence executive summary",
  "details": [
    {
      "heading": "Aspect 1",
      "content": "Detailed explanation",
      "sourceNumbers": [1, 2]
    }
  ],
  "keyFacts": ["Fact 1", "Fact 2", "Fact 3"],
  "caveats": ["Limitation or caveat if any"],
  "confidence": 0.0-1.0
}`;

  const response = await complete({
    userId,
    prompt: structuredPrompt,
    taskType: "analysis",
    maxTokens:
      depth === "deep" ? 1500 : depth === "quick" ? 500 : 1000,
  });

  let parsed;
  try {
    let jsonStr = response.content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr
        .replace(/```json?\n?/g, "")
        .replace(/```$/g, "");
    }
    parsed = JSON.parse(jsonStr);
  } catch {
    parsed = {
      summary: response.content.trim(),
      details: [],
      keyFacts: [],
      confidence: 0.6,
    };
  }

  return {
    summary: parsed.summary,
    details: (parsed.details || []).map((d: any) => ({
      heading: d.heading,
      content: d.content,
      sources: (d.sourceNumbers || [])
        .map((n: number) => sources[n - 1]?.url)
        .filter(Boolean),
    })),
    keyFacts: parsed.keyFacts || [],
    caveats: parsed.caveats,
    sources: sources
      .slice(0, 5)
      .map((s) => ({ title: s.title, url: s.url })),
    metadata: {
      questionType:
        plan.estimatedComplexity === "simple" ? "factual" : "analytical",
      complexity: plan.estimatedComplexity,
      confidence:
        parsed.confidence || (sources.length > 2 ? 0.7 : 0.5),
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Generate follow-up questions
 */
export async function generateFollowUps(
  userId: string,
  question: string,
  answer: StructuredAnswer,
): Promise<string[]> {
  const result = await extract<{ questions: string[] }>(
    userId,
    `Original question: ${question}\n\nAnswer summary: ${answer.summary}`,
    '{ "questions": ["Follow-up 1", "Follow-up 2", "Follow-up 3"] }',
    "Generate 3 natural follow-up questions someone might ask after receiving this answer.",
  );

  return result.questions.slice(0, 3);
}
