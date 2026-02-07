---
name: canvas-design
description: "Tạo visual art, illustrations, và design assets bằng code (SVG, Canvas API, PDF generation)."
metadata:
  {
    "openclaw":
      {
        "emoji": "🖼️",
        "skillKey": "canvas-design",
        "userInvocable": true,
      },
  }
invocation:
  userInvocable: true
  disableModelInvocation: false
---

# Canvas Design Skill

Tạo visual art và design assets bằng code — SVG, HTML Canvas API, hoặc PDF generation.

## Commands

| Command | Mô tả |
|---------|-------|
| `/canvas-design` | Hướng dẫn tạo visual art |
| `/canvas-design [description]` | Tạo art từ mô tả |

---

## What This Skill Does

Generates visual outputs using code-based approaches:

- **SVG** — Scalable vector graphics (logos, icons, illustrations, patterns)
- **HTML Canvas** — Raster graphics, generative art, data visualization
- **PDF** — Document layouts, certificates, reports with visual design
- **CSS Art** — Pure CSS illustrations and effects

This skill does NOT use AI image generation APIs. It creates visuals through code.

---

## Design Principles

### 1. Start with Composition

Before writing code, sketch the layout mentally:
- What is the focal point?
- What is the visual hierarchy? (size, color, position)
- What is the negative space doing?
- What is the overall shape/silhouette?

### 2. Color with Purpose

- Use a limited palette (3-5 colors)
- One dominant color, one accent, rest neutral
- Consider the `/theme-factory` themes for consistent palettes
- Test contrast for any text elements

### 3. Typography in Visuals

When text appears in visual output:
- **Space Grotesk** — clean, modern (project default)
- **JetBrains Mono** — code, technical content
- **System fonts** — fallback, maximum compatibility

Font files location: Check project's `public/fonts/` or use web-safe fonts.

### 4. Geometric Precision

- Align to a grid (4px or 8px increments)
- Use consistent stroke widths
- Maintain proportional scaling
- Round coordinates to whole pixels for crisp rendering

---

## SVG Patterns

### Basic Structure

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <!-- Gradients, filters, patterns -->
  </defs>
  <g id="background">
    <!-- Background elements -->
  </g>
  <g id="main">
    <!-- Primary content -->
  </g>
  <g id="foreground">
    <!-- Overlays, text -->
  </g>
</svg>
```

### Useful Techniques

**Gradients**:
```svg
<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stop-color="#121212"/>
  <stop offset="100%" stop-color="#1e1e1e"/>
</linearGradient>
```

**Glow effect**:
```svg
<filter id="glow">
  <feGaussianBlur stdDeviation="4" result="blur"/>
  <feMerge>
    <feMergeNode in="blur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

**Pattern fills**:
```svg
<pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
  <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/>
</pattern>
```

**Noise texture** (via `feTurbulence`):
```svg
<filter id="noise">
  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3"/>
  <feColorMatrix type="saturate" values="0"/>
</filter>
```

---

## HTML Canvas Patterns

### Setup

```javascript
const canvas = document.createElement("canvas");
canvas.width = 1600;
canvas.height = 900;
const ctx = canvas.getContext("2d");
```

### Generative Art Techniques

**Particle systems**:
```javascript
for (let i = 0; i < 200; i++) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const r = Math.random() * 3 + 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 92, 92, ${Math.random() * 0.5})`;
  ctx.fill();
}
```

**Flow fields**:
```javascript
function noise2D(x, y) {
  // Perlin or simplex noise
  return Math.sin(x * 0.01) * Math.cos(y * 0.01);
}

for (let x = 0; x < width; x += 10) {
  for (let y = 0; y < height; y += 10) {
    const angle = noise2D(x, y) * Math.PI * 2;
    // Draw line segment in angle direction
  }
}
```

**Radial compositions**:
```javascript
const cx = canvas.width / 2;
const cy = canvas.height / 2;
for (let i = 0; i < 36; i++) {
  const angle = (i / 36) * Math.PI * 2;
  const x = cx + Math.cos(angle) * 200;
  const y = cy + Math.sin(angle) * 200;
  // Draw element at (x, y)
}
```

---

## Output Formats

### Save as PNG

```javascript
const dataUrl = canvas.toDataURL("image/png");
// or use canvas.toBlob() for file writing
```

### Save as SVG

Write SVG string directly to a `.svg` file.

### Save as PDF

Use a library like `jspdf` or `pdfkit`:
```javascript
import { jsPDF } from "jspdf";
const doc = new jsPDF({ orientation: "landscape", unit: "px", format: [1600, 900] });
doc.addImage(canvas, "PNG", 0, 0, 1600, 900);
doc.save("output.pdf");
```

---

## Style Guidelines

### Do

- Use the project's color palette when creating project-related visuals
- Layer elements for depth (background → mid → foreground)
- Add subtle texture (noise, dots, grain) to flat surfaces
- Use consistent stroke weights throughout a piece
- Test output at target size (don't design at 4000px if output is 800px)

### Don't

- Overcomplicate — fewer elements with better placement beats clutter
- Use more than 5-6 colors without purpose
- Mix rounded and sharp corners randomly
- Add drop shadows to everything
- Ignore whitespace — it's a design element

### Integration with Theme Factory

Use `/theme-factory [name]` to get a color palette, then apply it to your canvas creation. This ensures visual consistency across all project outputs.
