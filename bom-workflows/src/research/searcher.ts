/**
 * Search Integration
 * Handles web search and result processing
 */

import type { SourceInfo } from "./types.js";

// ── SEARCH PROVIDER ─────────────────────────────────────────

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchProvider {
  search(
    query: string,
    options?: { maxResults?: number },
  ): Promise<SearchResult[]>;
}

let searchProvider: SearchProvider | null = null;

export function setSearchProvider(provider: SearchProvider): void {
  searchProvider = provider;
}

// ── SEARCH & PROCESS ────────────────────────────────────────

/**
 * Execute search and process results
 */
export async function searchAndProcess(
  _userId: string,
  queries: string[],
  options: { maxResultsPerQuery?: number; maxTotal?: number } = {},
): Promise<SourceInfo[]> {
  const { maxResultsPerQuery = 5, maxTotal = 10 } = options;

  if (!searchProvider) {
    console.warn("No search provider configured");
    return [];
  }

  const allResults: SearchResult[] = [];

  for (const query of queries) {
    try {
      const results = await searchProvider.search(query, {
        maxResults: maxResultsPerQuery,
      });
      allResults.push(...results);
    } catch (error) {
      console.warn(`Search failed for "${query}":`, error);
    }
  }

  // Deduplicate by URL
  const uniqueResults = Array.from(
    new Map(allResults.map((r) => [r.url, r])).values(),
  );

  // Score and rank
  const scored = scoreResults(uniqueResults, queries.join(" "));

  return scored.slice(0, maxTotal);
}

/**
 * Score results for relevance
 */
function scoreResults(
  results: SearchResult[],
  query: string,
): SourceInfo[] {
  if (results.length === 0) return [];

  return results
    .map((r) => {
      const queryWords = query.toLowerCase().split(/\s+/);
      const titleLower = r.title.toLowerCase();
      const snippetLower = r.snippet.toLowerCase();

      let matchCount = 0;
      for (const word of queryWords) {
        if (word.length > 3) {
          if (titleLower.includes(word)) matchCount += 2;
          if (snippetLower.includes(word)) matchCount += 1;
        }
      }

      const relevance = Math.min(matchCount / (queryWords.length * 2), 1);
      const credibility = assessCredibility(r.url);

      return {
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        relevance,
        credibility,
      };
    })
    .sort((a, b) => {
      const scoreA =
        a.relevance *
        (a.credibility === "high"
          ? 1.2
          : a.credibility === "medium"
            ? 1
            : 0.8);
      const scoreB =
        b.relevance *
        (b.credibility === "high"
          ? 1.2
          : b.credibility === "medium"
            ? 1
            : 0.8);
      return scoreB - scoreA;
    });
}

/**
 * Assess source credibility
 */
function assessCredibility(
  url: string,
): "high" | "medium" | "low" | "unknown" {
  let domain: string;
  try {
    domain = new URL(url).hostname.toLowerCase();
  } catch {
    return "unknown";
  }

  const highCredibility = [
    ".gov",
    ".edu",
    "wikipedia.org",
    "nature.com",
    "sciencedirect.com",
    "who.int",
    "nih.gov",
    "cdc.gov",
    "bbc.com",
    "reuters.com",
    "apnews.com",
  ];

  if (highCredibility.some((d) => domain.includes(d))) {
    return "high";
  }

  const mediumCredibility = [
    "medium.com",
    "stackoverflow.com",
    "github.com",
    "docs.google.com",
    "nytimes.com",
    "theguardian.com",
    "forbes.com",
    "wired.com",
  ];

  if (mediumCredibility.some((d) => domain.includes(d))) {
    return "medium";
  }

  const lowCredibility = [
    "blogspot",
    "wordpress.com",
    "tumblr.com",
    "reddit.com",
  ];

  if (lowCredibility.some((d) => domain.includes(d))) {
    return "low";
  }

  return "unknown";
}
