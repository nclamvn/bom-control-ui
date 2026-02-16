/**
 * Smart Inbox Types
 */

export type EmailPriority = "urgent" | "high" | "normal" | "low";
export type EmailCategory =
  | "action_required"
  | "fyi"
  | "meeting"
  | "newsletter"
  | "spam"
  | "personal"
  | "automated";

export type ReplyType = "none" | "quick" | "detailed" | "forward" | "delegate";

export interface Email {
  id: string;
  from: { name: string; email: string };
  to: Array<{ name: string; email: string }>;
  cc?: Array<{ name: string; email: string }>;
  subject: string;
  body: string;
  date: string;
  threadId?: string;
  attachments?: Array<{ name: string; type: string; size: number }>;
}

export interface EmailClassification {
  priority: EmailPriority;
  category: EmailCategory;
  replyType: ReplyType;
  summary: string;
  actionItems?: string[];
  suggestedLabels?: string[];
  confidence: number;
}

export interface DraftReply {
  subject: string;
  body: string;
  tone: string;
  suggestedEdits?: string[];
}

export interface InboxResult {
  email: Email;
  classification: EmailClassification;
  draft?: DraftReply;
  skipped: boolean;
  skipReason?: string;
}
