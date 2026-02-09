# HANDOVER - Bờm Workspace 👻

> Cập nhật: 2026-02-09

## Tổng quan

**Bờm** là AI agent nói tiếng Việt, chạy trên nền tảng [OpenClaw](https://github.com/openclaw/openclaw).
Workspace này chứa toàn bộ hệ sinh thái: identity, memory, UI, fork Việt hóa, và các dự án demo Vibecode.

**Repo:** `clawd` (local workspace — không phải public repo riêng lẻ)

---

## Trạng thái hiện tại

| Thành phần | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| Bờm Identity | ✅ Hoàn tất | SOUL, IDENTITY, AGENTS, memory system |
| bom-control-ui | ✅ Hoạt động | Chat UI, API key, auto-reconnect |
| openclaw-vietnam | ✅ Hoàn tất | Fork Việt hóa, Vibecode tools |
| apple-showcase | ✅ Demo | Next.js Apple-style product showcase |
| projects/ (3 demo) | ✅ Demo | Vibecode output: finance, blog, store |
| Vibecode skill | ✅ Linked | Symlink từ openclaw-vietnam |

---

## Kiến trúc workspace

```
clawd/                          ← Root workspace
├── IDENTITY.md                 # Tên: Bờm 👻, vibe, emoji
├── SOUL.md                     # Tính cách, giọng nói, boundaries
├── AGENTS.md                   # Hướng dẫn vận hành cho AI agent
├── USER.md                     # Thông tin người dùng (template)
├── MEMORY.md                   # Bộ nhớ dài hạn (chỉ main session)
├── HEARTBEAT.md                # Periodic check checklist
├── BOOT.md                     # Gateway startup tasks
├── TOOLS.md                    # Local environment notes
├── README.md                   # Public-facing intro
├── HANDOVER.md                 # ← File này
├── .gitignore                  # Bảo vệ secrets + untracked dirs
│
├── memory/                     # Daily logs (YYYY-MM-DD.md)
│   └── 2026-01-31.md           # First boot log
│
├── canvas/                     # UI files cho node displays
│   └── index.html
│
├── bom-control-ui/             # 🔥 Main project — Control UI
│   ├── HANDOVER.md             # Chi tiết handover cho UI
│   └── src/                    # LitElement + Vite + TypeScript
│
├── openclaw-vietnam/           # Fork Việt hóa OpenClaw
│   ├── HANDOVER.md             # Chi tiết handover cho fork
│   └── skills/vibecode-build/  # Vibecode skill source
│
├── openclaw-src/               # OpenClaw upstream source (reference)
│
├── apple-showcase/             # Next.js Apple product demo
│   └── src/app/                # App Router, components
│
├── projects/                   # Vibecode demo outputs
│   ├── finance-dashboard/      # React + Vite finance dashboard
│   ├── tech-blog/              # React + Vite tech blog
│   └── xiaomi-store/           # React + Vite Xiaomi store clone
│
└── skills/                     # Workspace skills
    └── vibecode-build → ...    # Symlink → openclaw-vietnam/skills/
```

### Git tracking

**Tracked (trong repo):**
- Workspace files: IDENTITY, SOUL, AGENTS, USER, MEMORY, README, etc.
- `bom-control-ui/` — toàn bộ Control UI source
- `memory/` — daily logs
- `canvas/`

**Gitignored (chỉ local):**
- `openclaw-src/` — upstream reference (có .git riêng)
- `openclaw-vietnam/` — fork (có .git riêng)
- `apple-showcase/` — Next.js demo
- `projects/` — Vibecode demo outputs
- `skills/` — symlinks
- `node_modules/`, `.env*`, `**/auth-profiles.json`

---

## Dự án chi tiết

### 1. bom-control-ui (Main Project)

**Mục đích:** Giao diện web điều khiển OpenClaw Gateway bằng tiếng Việt.

**Stack:** LitElement + TypeScript + Vite + Vanilla CSS

**Tính năng:**
- Chat trực tiếp với AI (Anthropic, OpenAI, Google)
- API Key Banner — nhập key trên composer, lưu vào gateway qua RPC
- Auto-reconnect WebSocket (GatewayBrowserClient handles)
- Song ngữ Việt/Anh (i18n)
- Split panel layout (Claude-style)
- Device auth + session key management
- Refined minimal UI: 2-group sidebar (Core + Admin), flat monochrome bg, bar indicators

**Cách chạy:**
```bash
# 1. Chạy Gateway
openclaw gateway

# 2. Dev server
cd bom-control-ui && pnpm dev

# 3. Browser
http://localhost:3334
```

**Chi tiết:** xem `bom-control-ui/HANDOVER.md`

### 2. openclaw-vietnam (Fork Việt hóa)

**Mục đích:** Bản fork OpenClaw đã Việt hóa, giản lược, tích hợp Vibecode.

**Thay đổi chính:**
- Việt hóa hoàn toàn (song ngữ VI/EN)
- Navigation giảm từ 11 → 7 sidebar tabs (4 ẩn, truy cập qua ⌘K)
- Update indicator (tự check upstream releases)
- Vibecode methodology + tools

**Repo upstream:** `https://github.com/openclaw/openclaw`

**Chi tiết:** xem `openclaw-vietnam/HANDOVER.md`

### 3. apple-showcase (Demo)

**Mục đích:** Demo Next.js — Apple-style product showcase page.

**Stack:** Next.js + TypeScript + Tailwind CSS

**Components:** Hero, ProductShowcase, ProductCard, FeatureSection, EcosystemSection, Header, Footer

**Chạy:** `cd apple-showcase && npm run dev` → `http://localhost:3000`

### 4. projects/ (Vibecode Demos)

Ba dự án demo được tạo bằng Vibecode workflow:

| Project | Stack | Mô tả |
|---------|-------|-------|
| finance-dashboard | React + Vite | Dashboard tài chính |
| tech-blog | React + Vite | Blog công nghệ |
| xiaomi-store | React + Vite | Clone Xiaomi Store |

Mỗi project chạy: `npm install && npm run dev`

---

## Vibecode Kit

Phương pháp chia vai giữa hai Claude:

```
Claude Chat (Architect)  →  Blueprint.json  →  Claude Code (Builder)
    THINK mode                                    EXECUTE mode
    claude.ai                                     Terminal/CLI
```

**Tại sao tách?** System prompt khác biệt giữa Chat vs Code. Gộp vai = role-play kém hiệu quả.

**Quy trình:**
1. Mô tả ý tưởng trên claude.ai → nhận Blueprint.json
2. Paste Blueprint vào Claude Code → build
3. Verify chất lượng

**Tools:** (trong `openclaw-vietnam/vibecode/tools/`)
- `verify-blueprint.ts` — URL verification
- `validate-blueprint.ts` — Schema validation
- `qa-check.ts` — Post-build QA

---

## Workspace Files (AI Agent System)

Hệ thống files cho AI agent persistence:

| File | Mục đích | Khi nào đọc |
|------|----------|-------------|
| `SOUL.md` | Tính cách, boundaries | Mỗi session |
| `IDENTITY.md` | Tên (Bờm), emoji (👻), vibe | Mỗi session |
| `USER.md` | Thông tin người dùng | Mỗi session |
| `AGENTS.md` | Hướng dẫn vận hành đầy đủ | Mỗi session |
| `MEMORY.md` | Bộ nhớ dài hạn (curated) | Chỉ main session |
| `memory/YYYY-MM-DD.md` | Daily logs | Mỗi session (hôm nay + hôm qua) |
| `HEARTBEAT.md` | Periodic checks | Khi nhận heartbeat |
| `BOOT.md` | Gateway startup tasks | Khi gateway start |
| `TOOLS.md` | Local env notes | Khi cần |

**Memory flow:**
- Daily logs (`memory/`) = raw notes, append-only
- `MEMORY.md` = curated wisdom, distilled từ daily logs
- `MEMORY.md` chỉ load trong main session (bảo mật)

---

## Kiến thức kỹ thuật quan trọng

### Gateway Communication
- WebSocket: `ws://127.0.0.1:18789`
- Vite dev server: port 3334 với proxy đến gateway
- RPC pattern: `client.request("method", params)`
  - `auth.profiles.set` — lưu API key
  - `chat.send` — gửi tin nhắn

### WebSocket Gotchas
- **`WebSocket.close()` là async** — `stop()` set `ws = null` nhưng `onclose` fire sau
- **Stale callbacks** — guard bằng `if (host.client !== client) return;`
- **Single reconnect** — chỉ `GatewayBrowserClient.scheduleReconnect()`, KHÔNG có `ConnectionManager.scheduleRetry()`

### LitElement Patterns
- `app.ts` (OpenClawApp) = main component, giữ `@state()` reactive props
- `app-render.ts` = render delegation, wire props xuống views
- `AppViewState` type có gap — không cover hết methods, nhưng runtime OK
- Pre-existing TS errors trong `app-render.ts`, `app-render.helpers.ts` — không phải lỗi mới

---

## Commits (main branch)

```
234e40a Update HANDOVER.md with refined minimal UI changes
a14b2a1 Refined minimal UI: simplify sidebar to 2 groups, flatten bg, modernize styles
f213410 Add design skills suite: frontend-design, theme-factory, canvas-design
2a18956 Update HANDOVER.md with latest changes and project status
19a76cd Add README with Vibecode Kit methodology and Vietnamese-first focus
a57431f Harden .gitignore and remove personal info before public release
6189025 Redesign API key input: dedicated banner + fix WebSocket reconnect
db608e1 Initial commit: Bờm workspace + Control UI
```

---

## Việc cần làm (TODO)

### bom-control-ui
- [ ] Test edge cases: offline, token expired, invalid API key feedback
- [ ] Unit tests cho device-auth.ts
- [ ] Optimize bundle size
- [ ] Mobile responsive testing

### Workspace
- [ ] Thêm project types cho Vibecode skill (landing, saas, dashboard)
- [ ] Điền thêm TOOLS.md (machines, SSH, preferences)
- [ ] Tạo thêm daily memory logs
- [ ] Cấu hình BOOT.md cho gateway startup tasks

### openclaw-vietnam
- [ ] Theo dõi upstream releases
- [ ] Test update indicator với version mới

---

## Quick Start — Cho người mới

```bash
# 1. Clone workspace
git clone <repo-url> clawd
cd clawd

# 2. Đọc context
# → HANDOVER.md (file này)
# → bom-control-ui/HANDOVER.md (chi tiết UI)
# → README.md (public intro)

# 3. Chạy Control UI
cd bom-control-ui
pnpm install
pnpm dev
# → http://localhost:3334

# 4. Cần OpenClaw Gateway
openclaw gateway
```

---

## Checklist debug

1. [ ] Gateway chạy? `lsof -i :18789`
2. [ ] Dev server đúng port? `http://localhost:3334`
3. [ ] Console errors trong browser?
4. [ ] API key hợp lệ? `cat ~/.openclaw/agents/main/agent/auth-profiles.json`
5. [ ] Clear localStorage nếu lỗi signature

---

**Khi quay lại:** Đọc file này → đọc `bom-control-ui/HANDOVER.md` → bắt đầu làm việc.
