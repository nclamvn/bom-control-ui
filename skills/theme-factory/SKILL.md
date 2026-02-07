---
name: theme-factory
description: "Bộ theme chuyên nghiệp cho UI và tài liệu. 12 themes bao gồm OpenClaw Dark/Light."
metadata:
  {
    "openclaw":
      {
        "emoji": "🎭",
        "skillKey": "theme-factory",
        "userInvocable": true,
      },
  }
invocation:
  userInvocable: true
  disableModelInvocation: false
---

# Theme Factory Skill

Áp dụng theme chuyên nghiệp cho UI components, slides, PDFs, và web apps.

## Commands

| Command | Mô tả |
|---------|-------|
| `/theme-factory` | Liệt kê themes có sẵn |
| `/theme-factory [name]` | Áp dụng theme cụ thể |
| `/theme-factory preview` | Xem preview tất cả themes |

---

## Available Themes

### Project Themes (Dự án)

#### 1. OpenClaw Dark

Tema mặc định của Control UI. Dark background, red accent, teal secondary.

```css
--bg: #121212;
--bg-elevated: #1e1e1e;
--card: #1a1a1a;
--text: #e4e4e7;
--text-strong: #fafafa;
--border: #27272a;
--accent: #ff5c5c;
--accent-2: #14b8a6;
--ok: #22c55e;
--warn: #f59e0b;
--danger: #ef4444;
--info: #3b82f6;
```

**Fonts**: Space Grotesk (body), JetBrains Mono (code)
**Personality**: Technical, focused, compact. Red accent = urgency/action.

#### 2. OpenClaw Light

Light variant of the Control UI theme.

```css
--bg: #fafafa;
--bg-elevated: #ffffff;
--card: #ffffff;
--text: #3f3f46;
--text-strong: #18181b;
--border: #e4e4e7;
--accent: #dc2626;
--accent-2: #0d9488;
```

**Personality**: Clean, professional, high-contrast for daylight use.

---

### General Themes (Đa dụng)

#### 3. Ocean Depths

Deep blues with aqua highlights. Professional and calm.

```
Background: #0a1628 → #0f2847
Text: #e2e8f0
Accent: #22d3ee (cyan)
Secondary: #3b82f6 (blue)
```

**Best for**: Corporate dashboards, data visualization, SaaS.

#### 4. Sunset Boulevard

Warm oranges and purples. Creative and energetic.

```
Background: #1a0a2e → #2d1b4e
Text: #fef3c7
Accent: #f97316 (orange)
Secondary: #a855f7 (purple)
```

**Best for**: Creative portfolios, entertainment, marketing.

#### 5. Forest Canopy

Rich greens with earth tones. Natural and trustworthy.

```
Background: #0a1a0f → #132a1a
Text: #d4e7d0
Accent: #22c55e (green)
Secondary: #a3e635 (lime)
```

**Best for**: Sustainability, health, education, finance.

#### 6. Arctic Aurora

Cool whites with neon accents. Futuristic and clean.

```
Background: #f8fafc → #f1f5f9
Text: #1e293b
Accent: #8b5cf6 (violet)
Secondary: #06b6d4 (cyan)
```

**Best for**: Tech products, AI/ML, modern SaaS landing pages.

#### 7. Midnight Gold

Dark surfaces with warm gold accents. Premium and luxurious.

```
Background: #0c0a09 → #1c1917
Text: #e7e5e4
Accent: #eab308 (gold)
Secondary: #d97706 (amber)
```

**Best for**: Luxury brands, financial services, premium dashboards.

#### 8. Cherry Blossom

Soft pinks with warm neutrals. Gentle and approachable.

```
Background: #fff1f2 → #ffe4e6
Text: #4c0519
Accent: #f43f5e (rose)
Secondary: #ec4899 (pink)
```

**Best for**: Consumer apps, wellness, social platforms.

#### 9. Volcanic Slate

Dark grays with fiery orange. Bold and industrial.

```
Background: #18181b → #27272a
Text: #d4d4d8
Accent: #ef4444 (red)
Secondary: #f97316 (orange)
```

**Best for**: Developer tools, gaming, bold brand statements.

#### 10. Cyber Neon

Pure black with bright neon. High-contrast and striking.

```
Background: #000000 → #0a0a0a
Text: #00ff88
Accent: #00ff88 (neon green)
Secondary: #ff0080 (neon pink)
```

**Best for**: Terminal/hacker aesthetics, gaming, cyber-themed.

#### 11. Sandstone

Warm beige with terracotta accents. Organic and readable.

```
Background: #faf7f2 → #f5f0e8
Text: #44403c
Accent: #c2410c (terracotta)
Secondary: #b45309 (amber)
```

**Best for**: Documentation, blogs, editorial, long-form content.

#### 12. Deep Space

Nearly-black with cool purple glow. Immersive and focused.

```
Background: #030014 → #0a0520
Text: #c4b5fd
Accent: #7c3aed (violet)
Secondary: #6366f1 (indigo)
```

**Best for**: Creative tools, music apps, immersive experiences.

---

## How to Apply Themes

### For Control UI (LitElement)

Map theme values to the existing CSS variable system:

```css
:root {
  --bg: [theme.background];
  --text: [theme.text];
  --accent: [theme.accent];
  /* ... map all variables */
}
```

Only override variables — never hardcode colors in component CSS.

### For Web Apps (React/Next.js)

Create a theme object and apply via CSS custom properties or a theme provider:

```typescript
const theme = {
  colors: {
    background: "#0a1628",
    text: "#e2e8f0",
    accent: "#22d3ee",
    secondary: "#3b82f6",
  },
  fonts: {
    body: "Inter, sans-serif",
    code: "JetBrains Mono, monospace",
  },
};
```

### For PDFs / Slides

Apply theme colors to:
- Background fills
- Text colors
- Accent bars, borders, highlights
- Chart/graph color palettes

### For Canvas Art

Use theme as the base palette, extending with lighter/darker variations as needed for depth and contrast.

---

## Creating Custom Themes

A well-designed theme needs:

1. **Background scale** — 3-4 shades (base, elevated, hover, card)
2. **Text scale** — 3 levels (body, strong, muted)
3. **Border scale** — 2-3 levels (subtle, default, strong)
4. **Accent** — primary action color + hover variant
5. **Semantic** — success (green), warning (amber), error (red), info (blue)
6. **Font pairing** — body + mono minimum

### Contrast Rules

- Body text on background: minimum 4.5:1 (WCAG AA)
- Large text on background: minimum 3:1
- Interactive elements: must have visible focus state
- Accent on background: minimum 3:1

### Testing

After applying a theme, verify:
- [ ] All text is readable
- [ ] Buttons and links are visible
- [ ] Status colors (ok/warn/danger) are distinguishable
- [ ] Focus states are visible
- [ ] Works at different screen brightnesses
