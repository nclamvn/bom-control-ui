/**
 * Summary Merger
 * Merges key points from multiple sources
 */

import { extract } from "../utils/llm-client.js";
import type { KeyPoint, SynthesisOutline } from "./types.js";

// ── MERGING ─────────────────────────────────────────────────

/**
 * Deduplicate and organize key points
 */
export async function mergeKeyPoints(
  userId: string,
  allPoints: KeyPoint[],
  topic: string,
): Promise<{
  mergedPoints: KeyPoint[];
  themes: string[];
}> {
  const pointsText = allPoints
    .map((p) => `[${p.source}] ${p.point}`)
    .join("\n");

  const result = await extract<{
    mergedPoints: Array<{
      point: string;
      sources: string[];
      importance: "high" | "medium" | "low";
    }>;
    themes: string[];
  }>(
    userId,
    `Topic: ${topic}\n\nAll points:\n${pointsText}`,
    `{
  "mergedPoints": [
    {
      "point": "Merged/deduplicated point",
      "sources": ["source1", "source2"],
      "importance": "high|medium|low"
    }
  ],
  "themes": ["Theme 1", "Theme 2"]
}`,
    "Merge similar points, remove duplicates, and identify major themes. Preserve source attribution.",
  );

  const mergedPoints = result.mergedPoints.map((p) => ({
    point: p.point,
    source: p.sources.join(", "),
    importance: p.importance,
  }));

  return {
    mergedPoints,
    themes: result.themes,
  };
}

/**
 * Create document outline
 */
export async function createOutline(
  userId: string,
  mergedPoints: KeyPoint[],
  themes: string[],
  options: {
    title?: string;
    style?: string;
    targetLength?: string;
  } = {},
): Promise<SynthesisOutline> {
  const pointsText = mergedPoints
    .map((p) => `- ${p.point} (${p.importance})`)
    .join("\n");

  const result = await extract<SynthesisOutline>(
    userId,
    `Themes: ${themes.join(", ")}\n\nKey points:\n${pointsText}`,
    `{
  "title": "Document title",
  "sections": [
    {
      "heading": "Section heading",
      "keyPoints": ["point 1", "point 2"],
      "sourcesNeeded": ["source1"]
    }
  ]
}`,
    `Create a document outline. Style: ${options.style || "professional"}. Length: ${options.targetLength || "standard"}.`,
  );

  if (options.title) {
    result.title = options.title;
  }

  return result;
}
