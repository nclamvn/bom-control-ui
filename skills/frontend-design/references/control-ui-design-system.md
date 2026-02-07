# Control UI Design System Reference

Complete CSS variable reference extracted from `bom-control-ui/src/styles/`.

## Color Variables

### Dark Theme (Default)

```css
/* Backgrounds */
--bg: #121212;
--bg-accent: #161616;
--bg-elevated: #1e1e1e;
--bg-hover: #2a2a2a;
--panel: #121212;
--panel-strong: #1e1e1e;

/* Text */
--text: #e4e4e7;
--text-strong: #fafafa;
--muted: #71717a;
--muted-strong: #52525b;

/* Borders */
--border: #27272a;
--border-strong: #3f3f46;
--border-hover: #52525b;

/* Accent - Signature Red */
--accent: #ff5c5c;
--accent-hover: #ff7070;
--accent-subtle: rgba(255, 92, 92, 0.15);
--accent-glow: rgba(255, 92, 92, 0.25);

/* Card / Surface */
--card: #1a1a1a;
--popover: #1a1a1a;
--secondary: #1e1e1e;

/* Semantic Colors */
--ok: #22c55e;
--warn: #f59e0b;
--danger: #ef4444;
--info: #3b82f6;

/* Secondary Accent */
--accent-2: #14b8a6;
```

### Light Theme

```css
--bg: #fafafa;
--bg-elevated: #ffffff;
--bg-hover: #f0f0f0;
--text: #3f3f46;
--text-strong: #18181b;
--border: #e4e4e7;
--border-strong: #d4d4d8;
--accent: #dc2626;
```

## Typography

```css
--font-body: "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-display: "Space Grotesk";
--mono: "JetBrains Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

## Spacing & Radius

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

## Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.03);
--shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.03);
--shadow-xl: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03);
--shadow-accent: 0 4px 14px rgba(255, 92, 92, 0.25);
```

## Timing & Easing

```css
--duration-instant: 50ms;
--duration-fast: 100ms;
--duration-normal: 150ms;
--duration-medium: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;

--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-overlay: 300;
--z-modal: 400;
--z-popover: 500;
--z-tooltip: 600;
--z-toast: 700;
--z-max: 9999;
```

## Layout Variables

```css
--sidebar-width: 200px;
--sidebar-collapsed: 52px;
--header-height: 52px;
```

## Animation Keyframes

### Entrances

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
```

### Exits

```css
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fadeOutUp {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-8px); opacity: 0; }
}

@keyframes scaleOut {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.95); opacity: 0; }
}

@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(16px); opacity: 0; }
}
```

### Status & Loading

```css
@keyframes statusPulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes breathe {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}
```

### Attention

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}
```

## Component Classes

### Card

```css
.card {
  position: relative;
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
}

.card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}

.card--interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card--selected {
  border-color: var(--accent);
  box-shadow: var(--shadow-accent);
}
```

### Button

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--duration-fast), background var(--duration-fast);
}

.btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

.btn.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

.btn.primary:hover {
  background: var(--accent-hover);
  box-shadow: var(--shadow-md), 0 0 20px var(--accent-glow);
}
```

### Pill / Badge

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--secondary);
  font-size: 11px;
  font-weight: 500;
}

.pill.ok { border-color: var(--ok-subtle); background: var(--ok-subtle); color: var(--ok); }
.pill.danger { border-color: var(--danger-subtle); background: var(--danger-subtle); color: var(--danger); }
```

### Status Badge

```css
.status-badge { display: inline-flex; align-items: center; gap: 6px; }

.status-badge__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-badge__dot.online {
  background: var(--ok);
  animation: statusPulse 2s infinite;
}

.status-badge__dot.connecting {
  background: var(--warn);
  animation: pulse-subtle 1s infinite;
}
```

### Form Field

```css
.field { display: grid; gap: 4px; }

.field input, .field textarea, .field select {
  border: 1px solid var(--input);
  background: var(--card);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  font-size: 12px;
  outline: none;
  transition: border-color var(--duration-fast);
}

.field input:focus { border-color: var(--border-hover); }
```

### Empty State

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-state__icon {
  width: 64px; height: 64px;
  background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  margin-bottom: 20px;
}

.empty-state__action {
  padding: 10px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
}

.empty-state__action:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-accent);
}
```

### Skeleton Loader

```css
.skeleton {
  background: linear-gradient(90deg, var(--bg-accent) 0%, var(--bg-hover) 50%, var(--bg-accent) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.skeleton--text { height: 1em; width: 100%; }
.skeleton--avatar { width: 40px; height: 40px; border-radius: var(--radius-full); }
.skeleton--card { height: 100px; border-radius: var(--radius-lg); }
```

### Toggle Switch

```css
.cfg-toggle__track {
  width: 32px; height: 18px;
  background: var(--border-strong);
  border-radius: 9px;
  position: relative;
  transition: background 0.15s ease;
}

.cfg-toggle__track::after {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 14px; height: 14px;
  background: white;
  border-radius: 50%;
  transition: transform 0.15s ease;
}

.cfg-toggle input:checked + .cfg-toggle__track { background: var(--ok); }
.cfg-toggle input:checked + .cfg-toggle__track::after { transform: translateX(14px); }
```

### Tab

```css
.config-tab {
  padding: 6px 10px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.1s ease;
}

.config-tab:hover { color: var(--text); }
.config-tab.active { color: var(--text-strong); border-bottom-color: var(--accent); }
```

### Chat Bubble

```css
.chat-bubble {
  border: 1px solid transparent;
  background: var(--card);
  border-radius: var(--radius-lg);
  padding: 10px 14px;
}

.chat-line.user .chat-bubble { background: var(--accent-subtle); }
.chat-line.assistant .chat-bubble { background: var(--secondary); }
```

## Shell Layout

```css
.shell {
  height: 100vh;
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  grid-template-rows: var(--header-height) 1fr;
  grid-template-areas:
    "topbar topbar"
    "nav content";
}

.shell--nav-collapsed { grid-template-columns: 52px minmax(0, 1fr); }
.shell--chat-focus { grid-template-columns: 0px minmax(0, 1fr); }
```
