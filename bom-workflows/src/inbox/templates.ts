/**
 * Email Reply Templates
 */

export const REPLY_TEMPLATES = {
  acknowledge: {
    formal:
      "Thank you for your email. I have received it and will review the contents carefully. I will respond with a more detailed reply within [timeframe].",
    professional:
      "Thanks for reaching out. I've noted your message and will get back to you shortly.",
    casual:
      "Got it, thanks! I'll take a look and get back to you soon.",
  },

  meeting: {
    accept:
      "Thank you for the invitation. I confirm my attendance and look forward to the meeting.",
    decline:
      "Thank you for thinking of me. Unfortunately, I have a prior commitment at that time. Would [alternative time] work instead?",
    tentative:
      "Thank you for the invite. I may have a conflict but will do my best to attend. I'll confirm as soon as possible.",
  },

  request: {
    willProvide:
      "Thank you for your request. I will gather the necessary information and send it over by [deadline].",
    needMore:
      "Thank you for reaching out. To better assist you, could you please provide more details about [specific aspect]?",
    redirect:
      "Thank you for contacting me. For this matter, [colleague name] would be better positioned to help. I'm copying them on this email.",
  },

  followup: {
    checking:
      "I wanted to follow up on my previous email regarding [topic]. Please let me know if you need any additional information.",
    reminder:
      "This is a gentle reminder about [topic]. Please let me know if you have any questions.",
    update:
      "I wanted to provide a quick update on [topic]. [Update details]",
  },

  closings: {
    formal: "Best regards,",
    professional: "Best,",
    friendly: "Thanks!",
    casual: "Cheers,",
  },
} as const;

type TemplateCategory = keyof typeof REPLY_TEMPLATES;

/**
 * Get template by category and tone
 */
export function getTemplate(
  category: TemplateCategory,
  subcategory: string,
  tone: "formal" | "professional" | "casual" = "professional",
): string | null {
  const templates = REPLY_TEMPLATES[category];
  if (!templates) return null;

  const tmpl = (templates as Record<string, unknown>)[subcategory];
  if (!tmpl) return null;

  if (typeof tmpl === "string") return tmpl;
  if (typeof tmpl === "object" && tmpl !== null) {
    return (
      (tmpl as Record<string, string>)[tone] ||
      (tmpl as Record<string, string>).professional ||
      null
    );
  }
  return null;
}
