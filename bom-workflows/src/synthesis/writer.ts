/**
 * Content Writer
 * Generates final document content
 */

import { complete } from "../utils/llm-client.js";
import type {
  SynthesisOutline,
  SynthesizedDocument,
  SynthesisOptions,
} from "./types.js";

// ── WRITING ─────────────────────────────────────────────────

/**
 * Write a single section
 */
export async function writeSection(
  userId: string,
  section: {
    heading: string;
    keyPoints: string[];
    sourcesNeeded: string[];
  },
  context: {
    documentTitle: string;
    previousSections?: string[];
    style: string;
    audience?: string;
  },
): Promise<{
  heading: string;
  content: string;
  sources: string[];
}> {
  const prompt = `Write a section for a document.

Document: ${context.documentTitle}
Section: ${section.heading}

Key points to cover:
${section.keyPoints.map((p) => `- ${p}`).join("\n")}

Sources to cite: ${section.sourcesNeeded.join(", ")}

Style: ${context.style}
${context.audience ? `Audience: ${context.audience}` : ""}

${
  context.previousSections?.length
    ? `Previous sections (for context):\n${context.previousSections.slice(-2).join("\n---\n")}\n\n`
    : ""
}

Write the section content only (no heading). Be informative and well-structured.`;

  const response = await complete({
    userId,
    prompt,
    taskType: "writing",
    temperature: 0.7,
    maxTokens: 1000,
  });

  return {
    heading: section.heading,
    content: response.content.trim(),
    sources: section.sourcesNeeded,
  };
}

/**
 * Write full document from outline
 */
export async function writeDocument(
  userId: string,
  outline: SynthesisOutline,
  additionalContent: Map<string, string>,
  options: SynthesisOptions = {},
): Promise<SynthesizedDocument> {
  const { style = "professional", audience } = options;

  const sections: Array<{
    heading: string;
    content: string;
    sources: string[];
  }> = [];

  for (const section of outline.sections) {
    const enhancedPoints = [...section.keyPoints];

    for (const [gap, findings] of additionalContent) {
      if (
        section.keyPoints.some((p) =>
          p.toLowerCase().includes(gap.toLowerCase().split(" ")[0]),
        )
      ) {
        enhancedPoints.push(findings);
      }
    }

    const written = await writeSection(
      userId,
      { ...section, keyPoints: enhancedPoints },
      {
        documentTitle: outline.title,
        previousSections: sections.map((s) => s.content),
        style,
        audience,
      },
    );

    sections.push(written);
  }

  // Generate summary
  const fullContent = sections
    .map((s) => `## ${s.heading}\n\n${s.content}`)
    .join("\n\n");

  const summaryResponse = await complete({
    userId,
    prompt: `Write a 2-3 sentence executive summary for this document:\n\n${fullContent.substring(0, 3000)}`,
    taskType: "summarization",
    maxTokens: 200,
  });

  // Build bibliography
  const allSources = new Set<string>();
  sections.forEach((s) => s.sources.forEach((src) => allSources.add(src)));

  const bibliography = Array.from(allSources).map((src, i) => ({
    id: `[${i + 1}]`,
    citation: src,
  }));

  const wordCount = fullContent.split(/\s+/).length;

  return {
    title: outline.title,
    summary: summaryResponse.content.trim(),
    content: fullContent,
    sections,
    bibliography,
    metadata: {
      wordCount,
      sourceCount: bibliography.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Polish/edit final document
 */
export async function polishDocument(
  userId: string,
  document: SynthesizedDocument,
  instructions?: string,
): Promise<SynthesizedDocument> {
  const prompt = `Polish and improve this document. Fix any grammar issues, improve flow, and enhance clarity.

${instructions ? `Special instructions: ${instructions}\n\n` : ""}

Document:
${document.content}

Return the improved content only.`;

  const response = await complete({
    userId,
    prompt,
    taskType: "editing",
    temperature: 0.3,
    maxTokens: Math.ceil(document.content.length / 3),
  });

  const polishedContent = response.content.trim();
  const sectionRegex = /## ([^\n]+)\n\n([\s\S]*?)(?=## |$)/g;
  const polishedSections: typeof document.sections = [];

  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(polishedContent)) !== null) {
    const m = match;
    const originalSection = document.sections.find(
      (s) => s.heading === m[1],
    );
    polishedSections.push({
      heading: m[1],
      content: m[2].trim(),
      sources: originalSection?.sources || [],
    });
  }

  return {
    ...document,
    content: polishedContent,
    sections:
      polishedSections.length > 0 ? polishedSections : document.sections,
  };
}
