/**
 * Key Point Extractor
 * Extracts key points from source documents
 */

import { extract } from "../utils/llm-client.js";
import type { SourceDocument, KeyPoint } from "./types.js";

// ── EXTRACTION ──────────────────────────────────────────────

/**
 * Extract key points from a single document
 */
export async function extractKeyPoints(
  userId: string,
  document: SourceDocument,
  maxPoints: number = 10,
): Promise<KeyPoint[]> {
  const content =
    document.content.length > 10000
      ? document.content.substring(0, 10000) + "\n\n[Content truncated...]"
      : document.content;

  const result = await extract<{
    points: Array<{
      point: string;
      importance: "high" | "medium" | "low";
      quote?: string;
    }>;
  }>(
    userId,
    content,
    `{
  "points": [
    {
      "point": "Key point description",
      "importance": "high|medium|low",
      "quote": "Direct quote from source (optional)"
    }
  ]
}`,
    `Extract the ${maxPoints} most important points from this document.
Focus on facts, insights, and actionable information.
Rate importance based on relevance and uniqueness.`,
  );

  return result.points.map((p) => ({
    point: p.point,
    source: document.id,
    importance: p.importance,
    quotes: p.quote ? [p.quote] : undefined,
  }));
}

/**
 * Extract key points from multiple documents (parallel)
 */
export async function extractFromMultiple(
  userId: string,
  documents: SourceDocument[],
  pointsPerDoc: number = 7,
): Promise<Map<string, KeyPoint[]>> {
  const results = new Map<string, KeyPoint[]>();

  const extractions = await Promise.all(
    documents.map((doc) => extractKeyPoints(userId, doc, pointsPerDoc)),
  );

  documents.forEach((doc, i) => {
    results.set(doc.id, extractions[i]);
  });

  return results;
}

/**
 * Identify gaps and missing information
 */
export async function identifyGaps(
  userId: string,
  keyPoints: KeyPoint[],
  topic: string,
): Promise<
  Array<{
    gap: string;
    question: string;
    searchQuery: string;
  }>
> {
  const pointsSummary = keyPoints
    .map((p) => `- ${p.point} (${p.importance})`)
    .join("\n");

  const result = await extract<{
    gaps: Array<{
      gap: string;
      question: string;
      searchQuery: string;
    }>;
  }>(
    userId,
    `Topic: ${topic}\n\nExisting information:\n${pointsSummary}`,
    `{
  "gaps": [
    {
      "gap": "Missing information area",
      "question": "Question to answer",
      "searchQuery": "Search query to find information"
    }
  ]
}`,
    "Identify information gaps. What important aspects are missing? What questions remain unanswered?",
  );

  return result.gaps;
}
