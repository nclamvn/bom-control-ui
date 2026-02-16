/**
 * Reply Drafter
 * Generates draft replies based on classification
 */

import { complete } from "../utils/llm-client.js";
import type { Email, EmailClassification, DraftReply } from "./types.js";

// ── QUICK REPLIES (Template-based, no LLM) ─────────────────

const QUICK_REPLY_TEMPLATES: Record<string, string> = {
  acknowledge:
    "Thanks for your email. I'll review this and get back to you shortly.",
  meeting_accept: "Thanks for the invite. I'll be there.",
  meeting_decline:
    "Thanks for thinking of me, but I won't be able to make it. Let me know if there's another time that works.",
  received: "Got it, thanks!",
  will_do: "Will do. I'll follow up once complete.",
  noted: "Noted, thank you for letting me know.",
};

/**
 * Get quick reply if applicable (FREE - no tokens)
 */
export function getQuickReply(
  classification: EmailClassification,
): DraftReply | null {
  if (classification.replyType !== "quick") return null;

  if (classification.category === "meeting") {
    return {
      subject: "Re: Meeting",
      body: QUICK_REPLY_TEMPLATES.meeting_accept,
      tone: "professional",
    };
  }

  if (classification.category === "action_required") {
    if (classification.summary.toLowerCase().includes("confirm")) {
      return {
        subject: "Re: Confirmation",
        body: QUICK_REPLY_TEMPLATES.will_do,
        tone: "professional",
      };
    }
  }

  if (classification.category === "fyi") {
    return {
      subject: "Re: " + classification.summary.substring(0, 50),
      body: QUICK_REPLY_TEMPLATES.noted,
      tone: "professional",
    };
  }

  return null;
}

// ── LLM DRAFT GENERATION ───────────────────────────────────

interface DraftOptions {
  tone?: "formal" | "professional" | "friendly" | "casual";
  length?: "brief" | "medium" | "detailed";
  includeContext?: boolean;
  userContext?: string;
}

/**
 * Generate draft reply using LLM
 */
export async function draftReply(
  userId: string,
  email: Email,
  classification: EmailClassification,
  options: DraftOptions = {},
): Promise<DraftReply> {
  const {
    tone = "professional",
    length = "medium",
    userContext,
  } = options;

  const quickReply = getQuickReply(classification);
  if (quickReply && length === "brief") {
    return quickReply;
  }

  const lengthGuide = {
    brief: "2-3 sentences",
    medium: "1-2 paragraphs",
    detailed: "3-4 paragraphs",
  };

  const prompt = `Draft a reply to this email.

ORIGINAL EMAIL:
From: ${email.from.name} <${email.from.email}>
Subject: ${email.subject}
Date: ${email.date}

${email.body.substring(0, 3000)}

CONTEXT:
- Priority: ${classification.priority}
- Category: ${classification.category}
- Summary: ${classification.summary}
${classification.actionItems?.length ? `- Action items: ${classification.actionItems.join(", ")}` : ""}
${userContext ? `- About me: ${userContext}` : ""}

REQUIREMENTS:
- Tone: ${tone}
- Length: ${lengthGuide[length]}
- Address all action items if any
- Be helpful and clear

Generate the reply body only (no subject line, no greeting/signature unless necessary):`;

  const response = await complete({
    userId,
    prompt,
    taskType: "writing",
    temperature: 0.7,
    maxTokens: length === "brief" ? 200 : length === "detailed" ? 800 : 400,
  });

  const subject = email.subject.startsWith("Re:")
    ? email.subject
    : `Re: ${email.subject}`;

  return {
    subject,
    body: response.content.trim(),
    tone,
    suggestedEdits: classification.actionItems,
  };
}

/**
 * Improve existing draft
 */
export async function improveDraft(
  userId: string,
  currentDraft: string,
  feedback: string,
): Promise<string> {
  const prompt = `Improve this email draft based on the feedback.

CURRENT DRAFT:
${currentDraft}

FEEDBACK:
${feedback}

Improved draft:`;

  const response = await complete({
    userId,
    prompt,
    taskType: "editing",
    temperature: 0.5,
    maxTokens: 500,
  });

  return response.content.trim();
}
