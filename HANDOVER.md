# HANDOVER - Bờm Workspace 👻

> Cập nhật: 2026-02-16

## Tổng quan

**Bờm** là AI agent nói tiếng Việt, chạy trên nền tảng [OpenClaw](https://github.com/openclaw/openclaw).
Workspace này chứa toàn bộ hệ sinh thái: identity, memory, UI, fork Việt hóa, và các dự án demo Vibecode.

**Repo:** `clawd` (local workspace — không phải public repo riêng lẻ)

> Chi tiết đầy đủ: xem `HANDOVER-FULL.md` (1300+ dòng, mọi RPC, kiến trúc, flow)

---

## Trạng thái hiện tại

| Thành phần | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| Bờm Identity | ✅ Hoàn tất | SOUL, IDENTITY, AGENTS, memory system |
| bom-control-ui | ✅ Production-ready | 128 source files, 25k LOC, 443 tests (34 files), 0 failures |
| copilot plugin | ✅ Hoạt động | 23 RPC handlers (projects/deploy/preview), gateway integration |
| openclaw-vietnam | ✅ v2026.2.6 | Fork Việt hóa, Vibecode tools |
| CI/CD | ✅ GitHub Actions | Test + Build pipeline (ci.yml + pr-check.yml) |
| apple-showcase | ✅ Demo | Next.js Apple-style product showcase |
| projects/ (3 demo) | ✅ Demo | Vibecode output: finance, blog, store |

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
├── .github/workflows/          # CI/CD (ci.yml, pr-check.yml)
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
├── openclaw-src/               # Fork reference (Copilot plugin source)
│   ├── extensions/copilot/     # 23 RPC handlers → VAT scripts
│   └── src/gateway/            # Auth scope sets (READ/WRITE methods)
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
- `.github/workflows/` — CI/CD
- `memory/` — daily logs
- `canvas/`

**Gitignored (chỉ local):**
- `openclaw-src/` — fork repo (có .git riêng)
- `openclaw-vietnam/` — fork (có .git riêng)
- `apple-showcase/` — Next.js demo
- `projects/` — Vibecode demo outputs
- `skills/` — symlinks
- `node_modules/`, `.env*`, `**/auth-profiles.json`, playwright artifacts

---

## Dự án chi tiết

### 1. bom-control-ui (Main Project)

**Mục đích:** Giao diện web điều khiển OpenClaw Gateway bằng tiếng Việt.

**Stack:** LitElement + TypeScript + Vite + Vanilla CSS

**Tính năng:**
- Chat trực tiếp với AI (Anthropic, OpenAI, Google)
- API Key Banner — nhập key trên composer, lưu vào gateway qua RPC
- Auto-reconnect WebSocket (GatewayBrowserClient handles)
- Song ngữ Việt/Anh (i18n — 1300+ strings mỗi ngôn ngữ)
- Split panel layout (Claude-style) + resizable divider
- Device auth (Ed25519) + session key management
- Refined minimal UI: 2-group sidebar (Core + Admin), flat monochrome bg, bar indicators
- **Session UX** — card/table views, inline editing, quick-resume switcher
- **Memory System** — UserFact store, LLM extraction, category filter, search, chat indicator
- **Device Guard** — pairing approval, token lifecycle, audit timeline, status badges
- **Skill System** — catalog browser, filter/search, settings panel (JSON Schema → form), env vars
- **Agent Tabs** — multi-agent tab bar, unread tracking, agent preset picker
- **Voice Input** — Web Speech API, TTS, Vietnamese voice detection
- **Copilot** — Projects registry, Deploy workflow (streaming logs), Preview management
- **Mobile** — responsive layout, touch targets, input font sizes
- **CI/CD** — GitHub Actions (test + build), vendor chunking, lazy view loading

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
11d843b Handover v2.0: update status with Copilot plugin + Phase C+D
1fe34bf Add handover docs and gitignore playwright artifacts
f3e8d5c Phase C+D: Copilot UI views + gateway RPC integration
b08dd9a Phase 2: Agent tabs, voice input, split view
09b0957 Fix session switcher dropdown: sync CSS with HTML class names
6b02c72 Mobile responsive: touch targets, input font sizes, component layouts
55321ae Bundle optimization: vendor chunks + lazy view loading
0fc999b Sync pnpm-lock.yaml with package.json
0893c30 Add CI/CD pipeline and update handover docs
e4b8e46 Bom Ecosystem Feb 2026: Session UX, Memory, Device Guard, Skill System
a14b2a1 Refined minimal UI: simplify sidebar to 2 groups, flatten bg, modernize styles
f213410 Add design skills suite: frontend-design, theme-factory, canvas-design
19a76cd Add README with Vibecode Kit methodology and Vietnamese-first focus
a57431f Harden .gitignore and remove personal info before public release
6189025 Redesign API key input: dedicated banner + fix WebSocket reconnect
db608e1 Initial commit: Bờm workspace + Control UI
```

---

## Feb 2026 Development Cycle (Hoàn tất)

8 feature tracks, 12 phases, 128 source files, ~25k LOC, 443 UI tests (34 files), 0 failures.

| Feature | Trạng thái | Highlights |
|---------|-----------|------------|
| Session UX | ✅ | Card/table views, session switcher, inline editing, token tracking |
| Memory System | ✅ | UserFact CRUD, LLM extraction, category filter, search, chat indicator |
| Device Guard | ✅ | 10/10 gaps filled — pairing, tokens, audit, CORS, IP, scopes |
| Skill System | ✅ | `skills.catalog` + `skills.configSchema` RPCs, catalog UI, settings panel |
| Agent Tabs + Split View | ✅ | Multi-agent tabs, unread tracking, dual-pane, resizable divider |
| Voice Input | ✅ | Speech recognition, TTS, Vietnamese voice support |
| Copilot Plugin | ✅ | 23 RPC handlers (gateway), Projects/Deploy/Preview UI views |
| Mobile + CI/CD | ✅ | Responsive layout, vendor chunks, GitHub Actions pipeline |

## Việc cần làm (TODO)

### bom-control-ui
- [ ] E2E tests tích hợp CI (Playwright screenshot baselines đã có)
- [ ] Performance profiling & optimization
- [ ] Accessibility (a11y) audit
- [ ] PWA support (service worker, offline mode)

### Copilot Plugin
- [ ] Unit tests cho handler files (projects, deploy, preview)
- [ ] VAT scripts validation (check scripts exist on startup)
- [ ] Retry logic cho script bridge (transient failures)

### Workspace
- [ ] Thêm project types cho Vibecode skill (landing, saas, dashboard)
- [ ] Điền thêm TOOLS.md (machines, SSH, preferences)

### openclaw-vietnam
- [ ] Theo dõi upstream releases
- [ ] Đồng bộ build system (tsc vs tsdown)

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
