/**
 * Email Classifier
 * Uses cheap model (Haiku/Flash) for classification
 */

import { extract } from "../utils/llm-client.js";
import type {
  Email,
  EmailClassification,
  EmailPriority,
  EmailCategory,
  ReplyType,
} from "./types.js";

// ── CLASSIFICATION RULES (No LLM needed) ───────────────────

const SPAM_INDICATORS = [
  /unsubscribe/i,
  /click here to/i,
  /limited time offer/i,
  /act now/i,
  /you've won/i,
  /congratulations!/i,
  /no-?reply@/i,
];

const NEWSLETTER_INDICATORS = [
  /newsletter/i,
  /weekly digest/i,
  /daily update/i,
  /subscription/i,
  /view in browser/i,
];

const MEETING_INDICATORS = [
  /calendar invite/i,
  /meeting request/i,
  /join.*meeting/i,
  /zoom\.us/i,
  /meet\.google/i,
  /teams\.microsoft/i,
];

const AUTOMATED_SENDERS = [
  /noreply@/i,
  /no-reply@/i,
  /notifications@/i,
  /alerts@/i,
  /automated@/i,
  /system@/i,
];

/**
 * Quick rules-based pre-classification (FREE - no tokens)
 */
export function preClassify(
  email: Email,
): Partial<EmailClassification> | null {
  const content = `${email.subject} ${email.body}`;
  const senderEmail = email.from.email.toLowerCase();

  if (AUTOMATED_SENDERS.some((r) => r.test(senderEmail))) {
    return {
      category: "automated",
      priority: "low",
      replyType: "none",
      confidence: 0.95,
    };
  }

  const spamScore = SPAM_INDICATORS.filter((r) => r.test(content)).length;
  if (spamScore >= 2) {
    return {
      category: "spam",
      priority: "low",
      replyType: "none",
      confidence: 0.9,
    };
  }

  if (NEWSLETTER_INDICATORS.some((r) => r.test(content))) {
    return {
      category: "newsletter",
      priority: "low",
      replyType: "none",
      confidence: 0.9,
    };
  }

  if (MEETING_INDICATORS.some((r) => r.test(content))) {
    return {
      category: "meeting",
      priority: "normal",
      replyType: "quick",
      confidence: 0.85,
    };
  }

  return null;
}

// ── LLM CLASSIFICATION ─────────────────────────────────────

/**
 * Full LLM classification (uses cheap model)
 */
export async function classifyEmail(
  userId: string,
  email: Email,
): Promise<EmailClassification> {
  const preResult = preClassify(email);

  if (preResult && preResult.confidence && preResult.confidence > 0.85) {
    return {
      priority: preResult.priority || "normal",
      category: preResult.category || "fyi",
      replyType: preResult.replyType || "none",
      summary: `${email.subject} from ${email.from.name}`,
      confidence: preResult.confidence,
    };
  }

  const emailContent = `
From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Date: ${email.date}

${email.body.substring(0, 2000)}${email.body.length > 2000 ? "..." : ""}
`;

  const result = await extract<{
    priority: EmailPriority;
    category: EmailCategory;
    replyType: ReplyType;
    summary: string;
    actionItems?: string[];
    suggestedLabels?: string[];
  }>(
    userId,
    emailContent,
    `{
  "priority": "urgent|high|normal|low",
  "category": "action_required|fyi|meeting|newsletter|spam|personal|automated",
  "replyType": "none|quick|detailed|forward|delegate",
  "summary": "1-2 sentence summary",
  "actionItems": ["action 1", "action 2"],
  "suggestedLabels": ["label1", "label2"]
}`,
    "Classify this email. Consider sender, subject, and content.",
  );

  return {
    ...result,
    confidence: 0.8,
  };
}

/**
 * Batch classify multiple emails (parallel, optimized)
 */
export async function classifyEmails(
  userId: string,
  emails: Email[],
): Promise<Map<string, EmailClassification>> {
  const results = new Map<string, EmailClassification>();

  const needLLM: Email[] = [];

  for (const email of emails) {
    const preResult = preClassify(email);

    if (preResult && preResult.confidence && preResult.confidence > 0.85) {
      results.set(email.id, {
        priority: preResult.priority || "normal",
        category: preResult.category || "fyi",
        replyType: preResult.replyType || "none",
        summary: email.subject,
        confidence: preResult.confidence,
      });
    } else {
      needLLM.push(email);
    }
  }

  const llmResults = await Promise.all(
    needLLM.map((email) => classifyEmail(userId, email)),
  );

  needLLM.forEach((email, i) => {
    results.set(email.id, llmResults[i]);
  });

  return results;
}
