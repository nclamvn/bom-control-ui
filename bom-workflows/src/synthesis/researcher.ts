/**
 * Gap Researcher
 * Finds additional information to fill gaps
 */

import { complete } from "../utils/llm-client.js";

// ── SEARCH PROVIDER ─────────────────────────────────────────

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchProvider {
  search(query: string): Promise<SearchResult[]>;
}

let searchProvider: SearchProvider | null = null;

export function setSearchProvider(provider: SearchProvider): void {
  searchProvider = provider;
}

// ── RESEARCH ────────────────────────────────────────────────

/**
 * Research a specific gap
 */
export async function researchGap(
  userId: string,
  gap: { gap: string; question: string; searchQuery: string },
): Promise<{
  findings: string;
  sources: Array<{ title: string; url: string }>;
  confidence: number;
}> {
  let searchResults: SearchResult[] = [];

  if (searchProvider) {
    try {
      searchResults = await searchProvider.search(gap.searchQuery);
    } catch (error) {
      console.warn("Search failed:", error);
    }
  }

  const context =
    searchResults.length > 0
      ? searchResults
          .map((r) => `[${r.title}]\n${r.snippet}\nURL: ${r.url}`)
          .join("\n\n")
      : "No external sources available. Use general knowledge.";

  const prompt = `Research question: ${gap.question}

Gap to fill: ${gap.gap}

Available information:
${context}

Provide:
1. A concise answer to the question
2. Key facts and data points
3. Confidence level (high/medium/low)

Format as JSON:
{
  "findings": "Synthesized answer",
  "keyFacts": ["fact 1", "fact 2"],
  "confidence": "high|medium|low"
}`;

  const response = await complete({
    userId,
    prompt,
    taskType: "analysis",
    maxTokens: 500,
  });

  let result;
  try {
    result = JSON.parse(response.content);
  } catch {
    result = {
      findings: response.content,
      keyFacts: [],
      confidence: "medium",
    };
  }

  return {
    findings: result.findings,
    sources: searchResults.slice(0, 3).map((r) => ({
      title: r.title,
      url: r.url,
    })),
    confidence:
      result.confidence === "high"
        ? 0.9
        : result.confidence === "low"
          ? 0.5
          : 0.7,
  };
}

/**
 * Research multiple gaps
 */
export async function researchGaps(
  userId: string,
  gaps: Array<{ gap: string; question: string; searchQuery: string }>,
): Promise<
  Map<
    string,
    {
      findings: string;
      sources: Array<{ title: string; url: string }>;
      confidence: number;
    }
  >
> {
  const results = new Map();

  for (const gap of gaps) {
    const research = await researchGap(userId, gap);
    results.set(gap.gap, research);
  }

  return results;
}
