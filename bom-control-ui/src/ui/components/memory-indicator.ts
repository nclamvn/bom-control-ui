import { html, nothing, type TemplateResult } from "lit";

import { t } from "../i18n";
import { icons } from "../icons";
import type { UserFact } from "../types";

export type MemoryIndicatorProps = {
  enabled: boolean;
  facts: UserFact[];
  totalFacts: number;
  expanded: boolean;
  connected: boolean;
  onToggle: () => void;
  onExpand: () => void;
};

export function renderMemoryIndicator(props: MemoryIndicatorProps): TemplateResult {
  const { enabled, facts, totalFacts, expanded, connected, onToggle, onExpand } = props;
  const count = facts.length;
  const mem = t().memory;

  if (!enabled) {
    return html`
      <span class="memory-indicator memory-indicator--off" title=${mem.indicatorOff}>
        <button
          class="btn btn--sm btn--icon memory-indicator__toggle"
          ?disabled=${!connected}
          @click=${onToggle}
          title=${mem.indicatorToggle}
        >
          ${icons.brain}
        </button>
        <span class="memory-indicator__label memory-indicator__label--off">${mem.indicatorOff}</span>
      </span>
    `;
  }

  if (totalFacts === 0) {
    return html`
      <span class="memory-indicator memory-indicator--empty" title=${mem.indicatorNone}>
        <button
          class="btn btn--sm btn--icon memory-indicator__toggle"
          ?disabled=${!connected}
          @click=${onToggle}
          title=${mem.indicatorToggle}
        >
          ${icons.brain}
        </button>
        <span class="memory-indicator__label">${mem.indicatorNone}</span>
      </span>
    `;
  }

  return html`
    <span class="memory-indicator memory-indicator--active">
      <button
        class="btn btn--sm btn--icon memory-indicator__toggle active"
        ?disabled=${!connected}
        @click=${onToggle}
        title=${mem.indicatorToggle}
      >
        ${icons.brain}
      </button>
      <button
        class="memory-indicator__badge"
        @click=${onExpand}
        title="${count} ${mem.indicatorActive}"
      >
        ${count}
      </button>
      ${expanded ? renderExpandedPanel(facts) : nothing}
    </span>
  `;
}

function renderExpandedPanel(facts: UserFact[]): TemplateResult {
  return html`
    <div class="memory-indicator__panel">
      <div class="memory-indicator__panel-header">
        ${icons.brain}
        <span>${t().memory.title}</span>
      </div>
      <ul class="memory-indicator__panel-list">
        ${facts.map(
          (fact) => html`
            <li class="memory-indicator__panel-item">
              <span class="memory-indicator__panel-category">${fact.category}</span>
              <span class="memory-indicator__panel-content">${fact.content}</span>
            </li>
          `,
        )}
      </ul>
    </div>
  `;
}
