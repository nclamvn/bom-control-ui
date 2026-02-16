/**
 * Prompt Templates
 * Reusable, parameterized prompts for consistent results
 */

// ── TEMPLATE ENGINE ─────────────────────────────────────────

export function template(
  templateStr: string,
  params: Record<string, string | number | boolean | undefined>,
): string {
  let result = templateStr;

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }
  }

  // Remove unfilled optional placeholders
  result = result.replace(/\{\{[^}]+\}\}/g, "");

  return result.trim();
}

// ── COMMON TEMPLATES ────────────────────────────────────────

export const TEMPLATES = {
  classify: `Classify this {{contentType}} into one category: {{categories}}.

{{content}}

Respond with JSON: {"category": "<category>", "confidence": <0-1>}`,

  summarize: `Summarize the following {{contentType}} in {{length}} ({{style}} style).

{{content}}

Summary:`,

  extractKeyPoints: `Extract the {{count}} most important points from this {{contentType}}.

{{content}}

Format as a numbered list.`,

  draft: `Write a {{tone}} {{contentType}} about {{topic}}.

{{context}}

Requirements:
- Length: {{length}}
- Audience: {{audience}}
{{additionalRequirements}}`,

  improve: `Improve this {{contentType}} for {{goal}}.

Original:
{{content}}

Focus on: {{focusAreas}}

Improved version:`,

  translate: `Translate the following to {{targetLanguage}}, maintaining {{style}} tone.

{{content}}

Translation:`,

  answer: `Answer this question based on the provided context.

Question: {{question}}

Context:
{{context}}

{{instructions}}

Answer:`,
};

// ── TEMPLATE HELPERS ────────────────────────────────────────

export function classifyPrompt(
  content: string,
  categories: string[],
  contentType = "content",
): string {
  return template(TEMPLATES.classify, {
    content,
    categories: categories.join(", "),
    contentType,
  });
}

export function summarizePrompt(
  content: string,
  options: { length?: string; style?: string; contentType?: string } = {},
): string {
  return template(TEMPLATES.summarize, {
    content,
    length: options.length || "2-3 sentences",
    style: options.style || "concise",
    contentType: options.contentType || "content",
  });
}

export function extractPrompt(
  content: string,
  count: number = 5,
  contentType = "content",
): string {
  return template(TEMPLATES.extractKeyPoints, {
    content,
    count: String(count),
    contentType,
  });
}
