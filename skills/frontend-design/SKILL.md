---
name: frontend-design
description: "Thiết kế frontend chất lượng cao. Dual mode: Internal (LitElement Control UI) + External (React/Next.js/general web)."
metadata:
  {
    "openclaw":
      {
        "emoji": "🎨",
        "skillKey": "frontend-design",
        "userInvocable": true,
      },
  }
invocation:
  userInvocable: true
  disableModelInvocation: false
---

# Frontend Design Skill

Thiết kế frontend với chất lượng cao, có chủ đích. Không generic, không AI-slop.

## Mode Detection

This skill operates in two modes based on context:

| Signal | Mode | Framework |
|--------|------|-----------|
| Control UI, dashboard view, gateway, LitElement | **Internal** | LitElement + CSS vars |
| Landing page, new web app, React, Next.js, Vue | **External** | React/Next.js/vanilla |
| Ambiguous | Ask user | — |

---

## 1. Design Thinking (Both Modes)

Before writing any CSS or markup, answer these questions:

### Purpose
- What is this interface trying to accomplish?
- What action should the user take?
- What information hierarchy exists?

### Tone
- Is this playful or serious? Dense or spacious?
- What emotions should the interface evoke?
- How does this fit the brand personality?

### Constraints
- Screen size / responsive requirements?
- Performance budget? (animations, images, fonts)
- Accessibility requirements?

### Differentiation
- What makes this NOT look like a generic template?
- What is the ONE detail that makes this memorable?
- Where can we add craft without adding complexity?

---

## 2. Internal Mode: Control UI (LitElement)

When building for the OpenClaw Control UI dashboard.

### Quick Reference

**Design system:** See `references/control-ui-design-system.md` for complete CSS variables, component classes, and animation catalog.

**Component patterns:** See `references/litelement-patterns.md` for view functions, html templates, event binding, and state management.

### Core Principles

1. **Dark-first**: Default theme is dark (#121212). Light theme supported via CSS vars
2. **Compact density**: Small fonts (10-14px), tight padding (4-8-12-16px grid)
3. **Accent red**: `var(--accent)` = #ff5c5c. Use sparingly for primary actions and active states
4. **Secondary teal**: `var(--accent-2)` = #14b8a6. For secondary highlights
5. **Motion budget**: 100-300ms with `var(--ease-out-expo)` for entrances
6. **Border-first depth**: Cards use `border: 1px solid var(--border)` over heavy shadows

### Typography

```css
--font-body: "Space Grotesk", -apple-system, sans-serif;
--mono: "JetBrains Mono", monospace;
```

- Body text: 12-13px Space Grotesk
- Labels/badges: 10-11px, font-weight 500
- Headings: 14-16px, font-weight 600
- Code: 12px JetBrains Mono

### Color Usage

| Purpose | Variable | Value |
|---------|----------|-------|
| Primary action | `--accent` | #ff5c5c |
| Hover state | `--accent-hover` | #ff7070 |
| Subtle highlight | `--accent-subtle` | rgba(255, 92, 92, 0.15) |
| Success | `--ok` | #22c55e |
| Warning | `--warn` | #f59e0b |
| Error | `--danger` | #ef4444 |
| Info | `--info` | #3b82f6 |
| Secondary | `--accent-2` | #14b8a6 |

### Component Patterns

**Cards**: Border + subtle shadow, hover lifts border-color
```css
border: 1px solid var(--border);
background: var(--card);
border-radius: var(--radius-lg); /* 12px */
```

**Buttons**: Inline-flex, small (11px), transition on hover
```css
.btn { border: 1px solid var(--border); background: var(--bg-elevated); }
.btn.primary { background: var(--accent); color: white; }
```

**Status dots**: 8px circles with statusPulse animation for online state

**Pills/badges**: `border-radius: var(--radius-full)`, semantic colors

**Empty states**: Centered flex column, 64px icon container, accent CTA button

### Animation Guidelines

Use animations from `animations.css`:

| Animation | Use For | Duration |
|-----------|---------|----------|
| `fadeIn` | General entrance | 150-200ms |
| `fadeInUp` | Cards, list items | 200-250ms |
| `scaleIn` | Modals, popovers | 200ms |
| `popIn` | Notifications, badges | 300ms |
| `shimmer` | Skeleton loaders | 1.5s infinite |
| `statusPulse` | Online indicators | 2s infinite |
| `pulse-subtle` | Connecting state | 1s infinite |

**Staggering**: Use `animation-delay` with `calc(var(--i) * 30ms)` for list items.

**Reduced motion**: Always respect `@media (prefers-reduced-motion: reduce)`.

### Layout

Grid-based shell layout:
```
┌────────────────────────────┐
│         topbar (52px)      │
├──────┬─────────────────────┤
│ nav  │     content          │
│200px │     padding: 16px    │
│      │     20px 32px        │
└──────┴─────────────────────┘
```

Nav collapses to 52px. Chat focus mode hides nav entirely.

---

## 3. External Mode: General Web

When building new web apps, landing pages, or non-LitElement projects.

### Typography

Choose fonts with intention. Defaults that work:
- **Display**: Inter, Satoshi, or Space Grotesk
- **Body**: System stack or Inter
- **Mono**: JetBrains Mono or Fira Code

**Scale**: Use a modular scale (1.25 ratio). Don't use more than 4-5 distinct sizes.

**Line height**: 1.4-1.6 for body, 1.1-1.2 for headings, 1.7-1.8 for long-form.

### Color

Build a palette with purpose:
- **1 primary action color** — buttons, links, CTAs
- **1 neutral scale** — text, backgrounds, borders (8-10 shades)
- **Semantic colors** — success (green), warning (amber), error (red), info (blue)
- **1-2 accent colors** — sparingly, for differentiation

**Dark mode**: Don't just invert. Dark backgrounds need lighter borders, reduced shadow opacity, and slightly desaturated colors.

### Spatial Composition

- **8px base grid** — all spacing in multiples of 8 (4px for tight UI)
- **Consistent gaps** — pick 3-4 spacing values and reuse them
- **Breathing room** — generous padding on sections (64-128px vertical)
- **Max-width** — content rarely needs more than 1200px
- **Alignment** — everything should align to something

### Motion

- **Entrances**: 150-300ms, ease-out
- **Exits**: 100-200ms, ease-in
- **Hover**: 100-150ms, ease
- **Page transitions**: 200-400ms

**Rule**: If you can't explain why something animates, remove the animation.

### Backgrounds

Avoid flat solid colors. Options:
- Subtle gradients (2-3 stops, low contrast)
- Noise texture overlay (opacity 0.02-0.05)
- Dot/grid pattern (very subtle)
- Radial glow behind hero content

**Never**: Mesh gradients with 5+ colors, parallax on everything, video backgrounds without purpose.

### Component Guidelines

**Buttons**: Max 2-3 variants (primary, secondary, ghost). Consistent padding ratio (1:2 vertical:horizontal).

**Cards**: Pick ONE depth method (shadow OR border, not both heavy). Consistent radius.

**Forms**: Visible labels (not just placeholders). Clear focus states. Inline validation.

**Navigation**: Maximum 7 top-level items. Active state must be obvious.

### Responsive

- Mobile-first CSS
- Breakpoints: 640, 768, 1024, 1280px
- Don't hide content on mobile — restructure it
- Touch targets minimum 44x44px
- Test at 320px width minimum

---

## 4. Vibecode Integration

This skill complements the `/build` workflow:

```
Architect (Claude Chat) → Blueprint.json → Builder (Claude Code)
                              ↓
                    design.colors → CSS vars
                    design.fonts → font-family
                    design.spacing → gap/padding
```

When executing a Blueprint:
1. Map `design.colors.primary` → `--accent` or primary color variable
2. Map `design.colors.background` → `--bg`
3. Map `design.fonts.heading` → heading font-family
4. Apply design tokens consistently across ALL components
5. Use this skill's guidelines to fill gaps the Blueprint doesn't specify

---

## 5. Anti-Slop Rules

### Never Do

- Generic hero sections with stock gradient backgrounds
- "Built with AI" aesthetic — rounded everything, pastel gradients, generic icons
- Placeholder content that says "Lorem ipsum" in production
- More than 2 fonts on a page
- Box shadows AND borders AND gradients on the same element
- Animations on every element
- "Glassmorphism" or "Neumorphism" without clear purpose
- Generic testimonial carousels
- Hamburger menus on desktop
- Infinite scroll without clear navigation

### Always Do

- Test with real content (or realistic content)
- Check contrast ratios (WCAG AA minimum)
- Verify hover/focus/active states exist
- Ensure loading states are designed (not just spinners)
- Make empty states helpful (not just "No data")
- Use semantic HTML elements
- Include keyboard navigation
- Test at smallest supported viewport

### Internal Mode Additions

- Use existing CSS variables — don't create new color values
- Follow the 4px spacing grid
- Match existing component density (compact, not spacious)
- Animations from `animations.css` — don't add new @keyframes unless necessary
- Dark theme first — light theme vars handle the flip automatically
