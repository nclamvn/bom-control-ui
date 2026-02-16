/**
 * Document Synthesis Workflow
 * Main entry point
 */

import { createWorkflow, resumeWorkflow, type Workflow } from "bom-optimizer";
import {
  extractFromMultiple,
  identifyGaps,
} from "./extractor.js";
import { mergeKeyPoints, createOutline } from "./merger.js";
import { researchGaps, setSearchProvider } from "./researcher.js";
import { writeDocument, polishDocument } from "./writer.js";
import type {
  SourceDocument,
  KeyPoint,
  SynthesisOutline,
  SynthesizedDocument,
  SynthesisOptions,
} from "./types.js";
import type { WorkflowResult } from "../types.js";

// ── SYNTHESIS WORKFLOW ──────────────────────────────────────

export interface SynthesizeInput {
  sources: SourceDocument[];
  topic?: string;
  title?: string;
  options?: SynthesisOptions;
}

/**
 * Full document synthesis workflow with checkpoints
 */
export async function synthesize(
  userId: string,
  input: SynthesizeInput,
  existingWorkflowId?: string,
): Promise<WorkflowResult<SynthesizedDocument>> {
  const startTime = Date.now();
  const totalTokens = 0;
  const totalCost = 0;
  let cacheHits = 0;

  const { sources, topic, title, options = {} } = input;
  const documentTitle = title || topic || "Synthesized Document";

  // Create or resume workflow
  let workflow: Workflow;

  if (existingWorkflowId) {
    const resumed = resumeWorkflow(existingWorkflowId);
    if (resumed) {
      workflow = resumed;
    } else {
      workflow = createWorkflow(userId, "Document Synthesis", [
        { name: "Extract key points", input: sources },
        { name: "Merge and deduplicate" },
        { name: "Identify gaps" },
        { name: "Research gaps" },
        { name: "Create outline" },
        { name: "Write sections" },
        { name: "Polish document" },
      ]);
    }
  } else {
    workflow = createWorkflow(userId, "Document Synthesis", [
      { name: "Extract key points", input: sources },
      { name: "Merge and deduplicate" },
      { name: "Identify gaps" },
      { name: "Research gaps" },
      { name: "Create outline" },
      { name: "Write sections" },
      { name: "Polish document" },
    ]);
  }

  try {
    let allKeyPoints: KeyPoint[] = [];
    let mergedPoints: KeyPoint[] = [];
    let themes: string[] = [];
    let gaps: Array<{
      gap: string;
      question: string;
      searchQuery: string;
    }> = [];
    let researchResults = new Map<string, string>();
    let outline: SynthesisOutline | null = null;
    let document: SynthesizedDocument | null = null;

    // Step 1: Extract key points
    if (workflow.currentStep?.name === "Extract key points") {
      workflow.startStep();
      const extraction = await extractFromMultiple(userId, sources);
      for (const points of extraction.values()) {
        allKeyPoints.push(...points);
      }
      workflow.completeStep(allKeyPoints);
    } else if (workflow.getStepOutput(0)) {
      allKeyPoints = workflow.getStepOutput(0) as KeyPoint[];
    }

    // Step 2: Merge and deduplicate
    if (workflow.currentStep?.name === "Merge and deduplicate") {
      workflow.startStep();
      const mergeResult = await mergeKeyPoints(
        userId,
        allKeyPoints,
        topic || documentTitle,
      );
      mergedPoints = mergeResult.mergedPoints;
      themes = mergeResult.themes;
      workflow.completeStep({ mergedPoints, themes });
    } else if (workflow.getStepOutput(1)) {
      const step1 = workflow.getStepOutput(1) as {
        mergedPoints: KeyPoint[];
        themes: string[];
      };
      mergedPoints = step1.mergedPoints;
      themes = step1.themes;
    }

    // Step 3: Identify gaps
    if (workflow.currentStep?.name === "Identify gaps") {
      workflow.startStep();
      if (options.includeResearch !== false) {
        gaps = await identifyGaps(
          userId,
          mergedPoints,
          topic || documentTitle,
        );
      }
      workflow.completeStep(gaps);
    } else if (workflow.getStepOutput(2)) {
      gaps = workflow.getStepOutput(2) as typeof gaps;
    }

    // Step 4: Research gaps
    if (workflow.currentStep?.name === "Research gaps") {
      workflow.startStep();
      if (gaps.length > 0 && options.includeResearch !== false) {
        const research = await researchGaps(userId, gaps.slice(0, 3));
        for (const [gap, result] of research) {
          researchResults.set(gap, result.findings);
        }
      }
      workflow.completeStep(Object.fromEntries(researchResults));
    } else if (workflow.getStepOutput(3)) {
      const step3 = workflow.getStepOutput(3) as Record<string, string>;
      researchResults = new Map(Object.entries(step3));
    }

    // Step 5: Create outline
    if (workflow.currentStep?.name === "Create outline") {
      workflow.startStep();
      outline = await createOutline(userId, mergedPoints, themes, {
        title: documentTitle,
        style: options.style,
        targetLength: options.targetLength,
      });
      workflow.completeStep(outline);
    } else if (workflow.getStepOutput(4)) {
      outline = workflow.getStepOutput(4) as SynthesisOutline;
    }

    // Step 6: Write sections
    if (workflow.currentStep?.name === "Write sections") {
      workflow.startStep();
      document = await writeDocument(
        userId,
        outline!,
        researchResults,
        options,
      );
      workflow.completeStep(document);
    } else if (workflow.getStepOutput(5)) {
      document = workflow.getStepOutput(5) as SynthesizedDocument;
    }

    // Step 7: Polish
    if (workflow.currentStep?.name === "Polish document") {
      workflow.startStep();
      document = await polishDocument(userId, document!);
      workflow.completeStep(document);
    } else if (workflow.getStepOutput(6)) {
      document = workflow.getStepOutput(6) as SynthesizedDocument;
    }

    return {
      success: true,
      data: document!,
      metrics: {
        totalTokens,
        totalCost,
        savedTokens: cacheHits * 1000,
        savedCost: cacheHits * 0.005,
        cacheHits,
        steps: 7,
        duration: Date.now() - startTime,
      },
    };
  } catch (error: any) {
    workflow.failStep(error.message);

    return {
      success: false,
      error: error.message,
      metrics: {
        totalTokens,
        totalCost,
        savedTokens: 0,
        savedCost: 0,
        cacheHits,
        steps: workflow.completedSteps.length,
        duration: Date.now() - startTime,
      },
    };
  }
}

/**
 * Quick synthesis (no research, fewer steps)
 */
export async function quickSynthesize(
  userId: string,
  sources: SourceDocument[],
  title?: string,
): Promise<WorkflowResult<SynthesizedDocument>> {
  return synthesize(userId, {
    sources,
    title,
    options: {
      includeResearch: false,
      targetLength: "brief",
    },
  });
}

export * from "./types.js";
export { setSearchProvider };
