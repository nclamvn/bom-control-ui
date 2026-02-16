/**
 * Smart Inbox Workflow
 * Main entry point
 */

import { classifyEmail, classifyEmails, preClassify } from "./classifier.js";
import { draftReply, getQuickReply, improveDraft } from "./drafter.js";
import type {
  Email,
  EmailClassification,
  DraftReply,
  InboxResult,
} from "./types.js";
import type { WorkflowResult } from "../types.js";

// ── INBOX WORKFLOW ──────────────────────────────────────────

export interface InboxOptions {
  autoDraft?: boolean;
  skipCategories?: string[];
  draftTone?: "formal" | "professional" | "friendly" | "casual";
  userContext?: string;
}

/**
 * Process single email through inbox workflow
 */
export async function processEmail(
  userId: string,
  email: Email,
  options: InboxOptions = {},
): Promise<WorkflowResult<InboxResult>> {
  const startTime = Date.now();
  const totalTokens = 0;
  const totalCost = 0;
  let cacheHits = 0;

  const {
    autoDraft = true,
    skipCategories = ["spam", "newsletter"],
    draftTone = "professional",
    userContext,
  } = options;

  // Step 1: Classification
  const classification = await classifyEmail(userId, email);

  if (skipCategories.includes(classification.category)) {
    return {
      success: true,
      data: {
        email,
        classification,
        skipped: true,
        skipReason: `Category ${classification.category} is in skip list`,
      },
      metrics: {
        totalTokens,
        totalCost,
        savedTokens: 0,
        savedCost: 0,
        cacheHits,
        steps: 1,
        duration: Date.now() - startTime,
      },
    };
  }

  // Step 2: Draft reply if needed
  let draft: DraftReply | undefined;

  if (autoDraft && classification.replyType !== "none") {
    const quickReply = getQuickReply(classification);

    if (quickReply) {
      draft = quickReply;
      cacheHits++;
    } else {
      draft = await draftReply(userId, email, classification, {
        tone: draftTone,
        length:
          classification.replyType === "detailed" ? "detailed" : "medium",
        userContext,
      });
    }
  }

  return {
    success: true,
    data: {
      email,
      classification,
      draft,
      skipped: false,
    },
    metrics: {
      totalTokens,
      totalCost,
      savedTokens: cacheHits * 500,
      savedCost: cacheHits * 0.002,
      cacheHits,
      steps: draft ? 2 : 1,
      duration: Date.now() - startTime,
    },
  };
}

/**
 * Process multiple emails (batch, optimized)
 */
export async function processInbox(
  userId: string,
  emails: Email[],
  options: InboxOptions = {},
): Promise<WorkflowResult<InboxResult[]>> {
  const startTime = Date.now();
  const results: InboxResult[] = [];

  const totalTokens = 0;
  const totalCost = 0;
  let cacheHits = 0;

  const { skipCategories = ["spam", "newsletter"] } = options;

  // Step 1: Batch classify all emails
  const classifications = await classifyEmails(userId, emails);

  // Count rule-based classifications (free)
  for (const email of emails) {
    const pre = preClassify(email);
    if (pre?.confidence && pre.confidence > 0.85) {
      cacheHits++;
    }
  }

  // Step 2: Process each email
  for (const email of emails) {
    const classification = classifications.get(email.id)!;

    if (skipCategories.includes(classification.category)) {
      results.push({
        email,
        classification,
        skipped: true,
        skipReason: `Category ${classification.category} skipped`,
      });
      continue;
    }

    let draft: DraftReply | undefined;

    if (classification.replyType !== "none" && options.autoDraft !== false) {
      const quickReply = getQuickReply(classification);

      if (quickReply) {
        draft = quickReply;
        cacheHits++;
      } else if (
        classification.replyType === "detailed" ||
        classification.category === "action_required"
      ) {
        draft = await draftReply(userId, email, classification, {
          tone: options.draftTone,
          userContext: options.userContext,
        });
      }
    }

    results.push({
      email,
      classification,
      draft,
      skipped: false,
    });
  }

  return {
    success: true,
    data: results,
    metrics: {
      totalTokens,
      totalCost,
      savedTokens: cacheHits * 500,
      savedCost: cacheHits * 0.002,
      cacheHits,
      steps: 2,
      duration: Date.now() - startTime,
    },
  };
}

/**
 * Interactive draft improvement
 */
export async function refineDraft(
  userId: string,
  currentDraft: string,
  feedback: string,
): Promise<string> {
  return improveDraft(userId, currentDraft, feedback);
}

export * from "./types.js";
