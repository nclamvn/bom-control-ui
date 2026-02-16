/**
 * Bom Workflows - Main Exports
 */

// Utilities
export {
  complete,
  completeBatch,
  classify,
  extract,
  setProvider,
  type LLMProvider,
} from "./utils/llm-client.js";
export { template, TEMPLATES } from "./utils/templates.js";

// Smart Inbox
export {
  processEmail,
  processInbox,
  refineDraft,
  type Email,
  type EmailClassification,
  type DraftReply,
  type InboxResult,
  type InboxOptions,
} from "./inbox/index.js";

// Document Synthesis
export {
  synthesize,
  quickSynthesize,
  setSearchProvider as setSynthesisSearchProvider,
  type SourceDocument,
  type SynthesizedDocument,
  type SynthesisOptions,
} from "./synthesis/index.js";

// Research Assistant
export {
  research,
  quickAnswer,
  setSearchProvider as setResearchSearchProvider,
  type ResearchQuery,
  type StructuredAnswer,
  type ResearchOptions,
} from "./research/index.js";

// Types
export type {
  WorkflowResult,
  LLMRequest,
  LLMResponse,
  WorkflowContext,
} from "./types.js";
