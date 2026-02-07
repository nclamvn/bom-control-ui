# LitElement Patterns Reference

Component and rendering patterns used in the OpenClaw Control UI.

## Component Structure

### Main Component (app.ts)

```typescript
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("openclaw-app")
export class OpenClawApp extends LitElement {
  // Reactive state properties
  @state() connected: boolean = false;
  @state() tab: Tab = "overview";
  @state() theme: ResolvedTheme = { mode: "dark" };
  @state() settings: UiSettings = loadSettings();

  // Lifecycle
  connectedCallback() {
    super.connectedCallback();
    // Setup event listeners, load initial data
  }

  firstUpdated() {
    handleFirstUpdated(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Cleanup
  }

  // Delegate rendering to external function
  render() {
    return renderApp(this);
  }
}
```

### Key Pattern: Render Delegation

The main component delegates rendering to a separate file (`app-render.ts`). This keeps the component class focused on state and logic, while rendering lives in pure functions.

```typescript
// app-render.ts
import { html, TemplateResult } from "lit";

export function renderApp(state: AppViewState): TemplateResult {
  return html`
    <div class="shell ${state.tab === 'chat' ? 'shell--chat' : ''}">
      ${renderTopbar(state)}
      ${renderNav(state)}
      ${renderContent(state)}
    </div>
  `;
}
```

## View Function Pattern

Each section/view is a pure function that takes state and returns a TemplateResult:

```typescript
function renderOverview(state: AppViewState): TemplateResult {
  return html`
    <div class="overview">
      <h2 class="section-title">Overview</h2>
      ${state.nodes.length === 0
        ? renderEmptyState("No nodes connected")
        : state.nodes.map((node) => renderNodeCard(node, state))
      }
    </div>
  `;
}
```

### Benefits

- **Testable**: Pure functions, easy to unit test
- **Composable**: Small functions combine into larger views
- **Type-safe**: Each function declares its data needs via the state type

## HTML Templates

### Basic Template

```typescript
html`<div class="card">
  <span class="card__title">${item.name}</span>
  <span class="card__subtitle text-muted">${item.description}</span>
</div>`
```

### Conditional Rendering

```typescript
html`
  ${condition
    ? html`<div class="active">Active content</div>`
    : html`<div class="inactive">Fallback content</div>`
  }
`
```

### List Rendering

```typescript
html`
  <div class="list">
    ${items.map((item, i) => html`
      <div class="list-item" style="animation-delay: ${i * 30}ms">
        ${renderItem(item)}
      </div>
    `)}
  </div>
`
```

### Nothing (conditional omission)

```typescript
import { nothing } from "lit";

html`
  ${showBanner ? html`<div class="banner">Alert</div>` : nothing}
`
```

## Event Binding

### Click Events

```typescript
html`<button @click=${() => state.setTab("chat")}>Chat</button>`
```

### Event with Data

```typescript
html`<button @click=${(e: Event) => handleNodeClick(e, node, state)}>
  ${node.name}
</button>`
```

### Input Binding

```typescript
html`<input
  type="text"
  .value=${state.searchQuery}
  @input=${(e: InputEvent) => {
    state.searchQuery = (e.target as HTMLInputElement).value;
  }}
/>`
```

### Form Submit

```typescript
html`<form @submit=${(e: Event) => {
  e.preventDefault();
  handleSubmit(state);
}}>
  <!-- fields -->
  <button type="submit" class="btn primary">Save</button>
</form>`
```

## State Management

### @state() Decorator

Triggers re-render when value changes:

```typescript
@state() items: Item[] = [];
@state() loading: boolean = false;
@state() error: string | null = null;
```

### State Updates

Direct assignment triggers LitElement's reactive update cycle:

```typescript
// Simple update
this.loading = true;

// Array update (must create new reference)
this.items = [...this.items, newItem];

// Object update (must create new reference)
this.settings = { ...this.settings, theme: "dark" };
```

### Passing State to View Functions

The component instance (`this`) is cast to `AppViewState` type and passed to render functions:

```typescript
// In component
render() {
  return renderApp(this); // 'this' has all @state() properties
}

// In render function
export function renderApp(state: AppViewState) {
  // Access state.tab, state.connected, etc.
}
```

## CSS Integration

### Using Global Styles

The Control UI uses global CSS (not shadow DOM scoped). Styles from `styles/*.css` are available to all components:

```typescript
// No static styles needed — global CSS handles it
html`<div class="card card--interactive">
  <span class="pill ok">Online</span>
</div>`
```

### Inline Styles (when needed)

```typescript
html`<div style="
  animation-delay: ${index * 30}ms;
  grid-column: span ${item.wide ? 2 : 1};
">
  ${renderContent(item)}
</div>`
```

## Common Patterns

### Loading State

```typescript
function renderWithLoading(state: AppViewState): TemplateResult {
  if (state.loading) {
    return html`
      <div class="skeleton-group">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text" style="width: 60%"></div>
        <div class="skeleton skeleton--card"></div>
      </div>
    `;
  }
  return renderContent(state);
}
```

### Error State

```typescript
function renderError(message: string): TemplateResult {
  return html`
    <div class="empty-state">
      <div class="empty-state__icon" style="border-color: var(--danger-subtle)">
        <span style="font-size: 28px">!</span>
      </div>
      <p class="text-muted">${message}</p>
    </div>
  `;
}
```

### Connection-Aware Rendering

```typescript
function renderConnectionBanner(
  connectionState: ConnectionState,
  onRetry: () => void
): TemplateResult | typeof nothing {
  if (connectionState.status === "connected") return nothing;

  const isError = connectionState.status === "error";
  return html`
    <div class="connection-banner ${isError ? 'error' : 'warning'}">
      <span>${connectionState.message}</span>
      <button class="btn" @click=${onRetry}>Retry</button>
    </div>
  `;
}
```

### Staggered Animation

```typescript
html`
  <div class="card-grid">
    ${items.map((item, i) => html`
      <div class="card"
        style="animation: fadeInUp 0.25s var(--ease-out-expo) ${i * 30}ms backwards">
        ${renderItemCard(item)}
      </div>
    `)}
  </div>
`
```
