# HANDOVER - BỜM Control UI

> Cập nhật: 2026-02-16

## Tổng quan dự án

**BỜM Control UI** — Giao diện điều khiển tiếng Việt cho OpenClaw Gateway.
Viết bằng LitElement + TypeScript + Vite. Xây dựng bằng Vibecode Kit.

## Trạng thái hiện tại: ✅ PRODUCTION-READY

- Kết nối Gateway: **OK** (auto-reconnect, Ed25519 device auth)
- Chat: **OK** (gửi/nhận, markdown, session switcher, memory indicator)
- API Key: **OK** (banner trên composer, lưu trực tiếp vào gateway)
- Sessions: **OK** (card/table views, inline editing, quick-resume)
- Memory: **OK** (UserFact CRUD, LLM extraction, category filter, search)
- Skills: **OK** (catalog browser, settings panel, env vars, install/toggle)
- Device Guard: **OK** (pairing, token lifecycle, audit trail, status badges)
- Agent Tabs: **OK** (multi-agent, unread tracking, split view, resizable divider)
- Voice: **OK** (speech recognition, TTS, Vietnamese voice detection)
- Copilot: **OK** (projects registry, deploy workflow + streaming logs, preview management)
- Mobile: **OK** (responsive layout, touch targets, input font sizes)
- UI tiếng Việt: **OK** (song ngữ Việt/Anh — 1300+ strings mỗi ngôn ngữ)
- CI/CD: **OK** (GitHub Actions — test + build, vendor chunking)
- Tests: **443 tests** (34 files), **0 failures**
- Source: **128 files**, **~25k LOC**

## Commits

```
11d843b Handover v2.0: update status with Copilot plugin + Phase C+D
f3e8d5c Phase C+D: Copilot UI views + gateway RPC integration
b08dd9a Phase 2: Agent tabs, voice input, split view
09b0957 Fix session switcher dropdown: sync CSS with HTML class names
6b02c72 Mobile responsive: touch targets, input font sizes, component layouts
55321ae Bundle optimization: vendor chunks + lazy view loading
0893c30 Add CI/CD pipeline and update handover docs
e4b8e46 Bom Ecosystem Feb 2026: Session UX, Memory, Device Guard, Skill System
a14b2a1 Refined minimal UI: simplify sidebar to 2 groups, flatten bg, modernize styles
f213410 Add design skills suite: frontend-design, theme-factory, canvas-design
a57431f Harden .gitignore and remove personal info before public release
6189025 Redesign API key input: dedicated banner + fix WebSocket reconnect
db608e1 Initial commit: Bờm workspace + Control UI
```

## Thay đổi quan trọng (2026-02-06)

### 1. Redesign API Key Input Flow

**Vấn đề cũ:**
- API key input chôn trong model selector dropdown — khó tìm
- Toggle "Tạm" vs "Cố định" vô dụng — gateway không đọc key từ client
- Không có hướng dẫn cho người mới — nhận response rỗng

**Giải pháp:**
- **Xóa** API key section khỏi model selector dropdown
- **Thêm** `renderApiKeyBanner()` — banner chuyên dụng nằm trên composer
- Banner **tự hiện** khi chưa có API key + chưa có tin nhắn (first-time)
- Luôn lưu qua `auth.profiles.set` RPC — không còn temp/perm toggle
- **Thêm** nút key icon trên composer toolbar để toggle banner

**Files:**
| File | Thay đổi |
|------|----------|
| `views/chat.ts` | Xóa API key section từ dropdown; thêm `renderApiKeyBanner()`; thêm key button |
| `app-render.ts` | Đơn giản hóa `onSaveApiKey` (luôn permanent); thêm toggle props |
| `app-view-state.ts` | `chatApiKeySaveMode` → `chatApiKeyInputOpen` |
| `app.ts` | Tương tự state change |
| `i18n/en.ts` + `vi.ts` | Xóa temp/perm strings; thêm banner strings |
| `styles/chat/composer.css` | Xóa save-mode CSS; thêm `.api-key-banner` styles |
| `icons.ts` | Thêm Lucide `key` icon |

### 2. Fix WebSocket Reconnect Race Conditions

**Stale callback bug:**
- `connectGateway()` stop client cũ → `onclose` fire async → ghi đè state client mới
- Fix: guard `if (host.client !== client) return;` trong mọi callback

**Dual reconnect bug:**
- `GatewayBrowserClient.scheduleReconnect()` VÀ `ConnectionManager.scheduleRetry()` cùng chạy
- ConnectionManager kill client đang reconnect giữa chừng
- Fix: xóa `scheduleRetry()` khỏi ConnectionManager, để GatewayBrowserClient xử lý

**Files:** `app-gateway.ts`, `connection-manager.ts`, `storage.ts`

### 3. Security Hardening cho Public Release

- `.gitignore`: thêm `openclaw-src/`, `openclaw-vietnam/`, `apple-showcase/`, `projects/`, `skills/`, `**/auth-profiles.json`
- `bom-control-ui/.gitignore`: thêm `.env`, `.env.*`
- `USER.md` + `memory/`: xóa tên cá nhân, thay bằng placeholder

### 4. README

- Root `README.md`: giới thiệu Bờm, Vibecode Kit methodology, tiếng Việt first
- `bom-control-ui/README.md`: chi tiết tech stack, setup, features

### 5. Feb 2026 — Session UX, Memory, Device Guard, Skill System

**Scope:** 53 files, +6414 lines, 4 feature tracks, 10 phases.

#### 5a. Session UX

Quản lý sessions trực quan — dual view (table/cards), inline editing, quick-resume.

**Files:**
| File | Mô tả |
|------|-------|
| `views/sessions.ts` | Main view: table + cards, filter, inline editing |
| `components/session-card.ts` | Card component: metadata, resume/rename/delete |
| `components/session-switcher.ts` | Dropdown trong chat header — 5 sessions gần nhất |
| `controllers/sessions.ts` | State + RPC calls |

**RPC:** `sessions.list`, `sessions.patch`, `sessions.delete`

**Types:** `GatewaySessionRow`, `SessionsListResult`, `SessionsPatchResult`

**Key features:**
- Table view: sortable columns, inline edit (label, thinking/verbose/reasoning levels)
- Card view: visual grid với session metadata
- Provider-aware thinking: binary (z.ai) vs granular (other providers)
- Session switcher: chat header dropdown, quick-resume
- Token tracking: input/output/total per session
- Filter: activeMinutes, limit, includeGlobal, includeUnknown

#### 5b. Memory System

UserFact store với LLM extraction, category filter, search, và context indicator trong chat.

**Files:**
| File | Mô tả |
|------|-------|
| `controllers/memory.ts` | Dual controller: memory CRUD + indicator state |
| `views/memory-view.ts` | Main view: category tabs, search, fact list |
| `components/memory-chip.ts` | Fact card: edit/verify/delete, confidence dots |
| `components/memory-indicator.ts` | Chat header: active memory count, expand panel |

**RPC:** `memory.list`, `memory.search`, `memory.update`, `memory.delete`, `memory.extract`, `memory.getActiveContext`

**Types:** `MemoryCategory` (identity/preference/project/relationship/skill/fact), `UserFact`

**Key features:**
- Category filter: 7 categories (all + 6 specific)
- Confidence: 1-4 dots (≥0.9=4, ≥0.7=3, ≥0.5=2, else 1)
- Inline editing: textarea, save back via `memory.update`
- Verification: toggle verified badge (green/gray)
- LLM extraction: "Extract from session" button → `memory.extract`
- Memory indicator: chat header shows active fact count, expandable panel shows injected facts
- Full-text search: `memory.search` RPC

#### 5c. Device Guard

Token lifecycle, pairing approval, audit timeline — 10/10 security gaps filled.

**Files:**
| File | Mô tả |
|------|-------|
| `controllers/devices.ts` | Pairing + token management logic |
| `components/device-status-badge.ts` | Status badge: active/expiring/expired/revoked/pending |
| `components/audit-timeline.ts` | Event timeline: auth, token ops, violations |
| `views/nodes.ts` (`renderDevices()`) | Device section trong Nodes tab |

**RPC:** `device.pair.list`, `device.pair.approve`, `device.pair.reject`, `device.token.rotate`, `device.token.revoke`, `audit.list`

**Types:** `DeviceTokenSummary`, `PendingDevice`, `PairedDevice`, `DevicePairingList`, `DeviceStatus`, `AuditEntry`

**Key features:**
- Pending pairing: approve/reject buttons, role/IP display
- Token lifecycle: rotate (copies to clipboard, auto-stores current device), revoke (clears localStorage)
- Status badges: active (green), expiring <7d (yellow), expired (red), revoked (gray)
- Audit timeline: emoji-coded events (auth, token ops, security violations), pagination (10/page)
- All 10 gaps: pairing approval, token rotation, revocation, audit logging, IP tracking, scope validation, expiry tracking, role-based access, CORS, rate limiting

#### 5d. Skill System

Catalog browser với filter/search, settings panel (JSON Schema → form), env vars editor.

**Files:**
| File | Mô tả |
|------|-------|
| `controllers/skills.ts` | Controller: legacy skills.status + new catalog/settings |
| `views/skills.ts` | Dual view: catalog (top) + workspace skills (bottom) |
| `components/skill-card.ts` | Card: name, kind, status, install/enable/settings |
| `components/skill-settings-panel.ts` | Slide-in panel: schema form + env vars |
| `components/schema-form.ts` | Dynamic form: JSON Schema → interactive inputs |
| `components/skill-status-badge.ts` | Status badge with color coding |

**RPC:** `skills.status` (legacy), `skills.catalog` (new), `skills.configSchema` (new), `skills.update`, `skills.install`

**Types:** `SkillCatalogKind`, `SkillCatalogStatus`, `SkillCatalogEntry`

**Key features:**
- Unified catalog: bundled + workspace + global + config sources
- Filter by kind: all, installed, channel, tool, service, memory, provider, skill
- Full-text search: name, description, ID
- Status badges: active (green), disabled (gray), needsConfig (yellow), error (red), notInstalled (blue)
- Settings panel (slide-in right):
  - Schema-driven forms: text, password, number, boolean, enum, array, object
  - UI hints: labels, help text, placeholders, ordering, sensitive masking
  - Env var editor: key-value pairs, add/remove, secrets support
- One-click install for not-installed skills
- Legacy compatibility: workspace skills section preserved

### 6. Phase 2 — Agent Tabs, Voice Input, Split View

Multi-agent support với tabs, voice input, và split view.

**Files:**
| File | Mô tả |
|------|-------|
| `components/agent-tabs.ts` | Tab bar: multi-agent switching, unread tracking |
| `components/split-view.ts` | Dual-pane chat layout |
| `controllers/agent-tabs.ts` | Tab management: create, close, focus, unread |
| `controllers/voice.ts` | Speech recognition + TTS + Vietnamese voice detection |
| `speech.d.ts` | Web Speech API type definitions |

**Tests:**
| File | Mô tả |
|------|-------|
| `components/agent-tabs.test.ts` | 162 lines — tab bar rendering + actions |
| `components/split-view.test.ts` | 90 lines — split view layout |
| `controllers/agent-tabs.test.ts` | 235 lines — tab state management |
| `controllers/voice.test.ts` | 502 lines — speech/TTS logic |

**Key features:**
- Agent tabs: create, close, switch, unread indicators (per tab)
- Split view: dual-pane, resizable divider, focus pane tracking
- Voice: Web Speech API recognition, TTS for AI responses, Vietnamese voice detection
- Voice modes: idle, listening, speaking, error
- Agent presets: pick from available agents

### 7. Phase C+D — Copilot Plugin + UI Views

Full deploy/preview workflow with gateway RPC integration.

**Gateway (openclaw-src/extensions/copilot/):**
| File | Mô tả |
|------|-------|
| `index.ts` | Plugin entry: 23 RPC handler registrations |
| `script-bridge.ts` | `executeScript()` + `executeScriptStream()` → VAT bash |
| `projects.ts` | 8 handlers: list/get/scan/archive/unarchive/remove/touch/rescan |
| `deploy.ts` | 8 handlers: precheck/start/cancel/history/logs/rollback/status/healthCheck |
| `preview.ts` | 5 handlers: list/create/promote/delete/clean |
| `system.ts` | 2 handlers: health/fix |

**UI Files:**
| File | Mô tả |
|------|-------|
| `controllers/deploys.ts` | Deploy state, project/deploy/preview RPC calls (246 lines) |
| `controllers/projects.ts` | Project operations thin shim (16 lines) |
| `views/projects-view.ts` | Project registry: scan, archive, touch (135 lines) |
| `views/deploy-view.ts` | Deploy workflow: precheck, start, streaming logs (196 lines) |
| `views/preview-view.ts` | Preview management: create, promote, delete (216 lines) |
| `components/terminal-output.ts` | Deploy log terminal display (52 lines) |
| `components/file-diff-viewer.ts` | File diff display (50 lines) |

**CSS:**
| File | Mô tả |
|------|-------|
| `styles/projects.css` | Project cards + registry layout (114 lines) |
| `styles/deploy.css` | Deploy workflow + terminal styles (260 lines) |
| `styles/preview.css` | Preview cards + management (172 lines) |

**RPC Methods (copilot.*):**
- `copilot.projects.list/get/scan/archive/unarchive/remove/touch/rescan`
- `copilot.deploy.precheck/start/cancel/history/logs/rollback/status/healthCheck`
- `copilot.preview.list/create/promote/delete/clean`
- `copilot.system.health/fix`

**Events:** `copilot.deploy.log` (streaming), `copilot.deploy.complete`

**Authorization:** 7 read + 16 write methods added to gateway scope sets.

### 8. Mobile Responsive + Bundle Optimization + CI/CD

**Mobile:**
- Touch target optimization (min 44px)
- Input font sizes (prevent iOS zoom)
- Component layout adjustments for small screens
- Responsive sidebar collapse

**Bundle:**
- Vendor chunks: `vendor-lit`, `vendor-markdown`, `vendor-crypto`
- Lazy view loading (code splitting per view)
- Sourcemaps always enabled

**CI/CD (`.github/workflows/`):**
- `ci.yml`: push/PR → test → build → upload dist/ artifact (7 days)
- `pr-check.yml`: PR only → test (no build)
- Node 22, pnpm 10, Playwright Chromium

#### Cross-cutting

**Navigation:** 2-group sidebar + copilot tabs
- Core (⌘1): chat, overview, channels, **memory**
- Admin (⌘2): config, **skills**, nodes, debug, logs
- Copilot: **projects**, **deploy**, **preview** (new tabs)
- Sessions: accessible via Overview hoặc direct URL

**I18n:** Tất cả features có full i18n (en + vi) — 1300+ strings mỗi ngôn ngữ.

**Controller pattern (all features):**
1. State interface → loading/data/error flags
2. Async functions → RPC calls, optimistic updates
3. View functions → Lit templates từ state
4. `app.ts` (state) + `app-render.ts` (tab switching + event wiring)

**Component CSS:** `styles/components.css` (shared styles), `styles/projects.css`, `styles/deploy.css`, `styles/preview.css`.

---

## Cách chạy

```bash
# 1. Chạy Gateway (terminal 1)
openclaw gateway

# 2. Chạy dev server (terminal 2)
cd /Users/mac/clawd/bom-control-ui
pnpm dev

# 3. Mở browser
http://localhost:3334
```

Khi lần đầu mở — API key banner tự hiện. Nhập key → Lưu → Bắt đầu chat.

## Cấu trúc thư mục

```
src/
├── lib/
│   ├── device-auth.ts        # Build auth payload
│   ├── client-info.ts        # Client constants
│   ├── session-key.ts        # Session key management
│   └── reasoning-tags.ts     # Parse reasoning tags
├── ui/
│   ├── app.ts                # Main LitElement component (+43 lines: new state props)
│   ├── app-render.ts         # Render delegation + prop wiring (+124 lines: 4 features)
│   ├── app-render.helpers.ts # Render helpers (+72 lines: new feature helpers)
│   ├── app-view-state.ts     # AppViewState type (+37 lines: new state fields)
│   ├── app-gateway.ts        # connectGateway() — creates WS clients
│   ├── app-chat.ts           # Chat message handling (+memory indicator)
│   ├── app-settings.ts       # Settings persistence (+sessionsViewMode)
│   ├── gateway.ts            # GatewayBrowserClient (WS + auto-reconnect)
│   ├── storage.ts            # LocalStorage + gateway URL detection (+session prefs)
│   ├── icons.ts              # SVG icons (Lucide-style, +25 new icons)
│   ├── types.ts              # Gateway types (+34 lines: Session/Memory/Skill types)
│   ├── navigation.ts         # Tabs + routing (+memory tab)
│   ├── i18n/                 # vi.ts, en.ts (+140 strings each)
│   ├── components/           # Reusable components (20 files)
│   │   ├── session-card.ts           # Session card (metadata, actions)
│   │   ├── session-switcher.ts       # Chat header session dropdown
│   │   ├── memory-chip.ts            # UserFact card (edit/verify/delete)
│   │   ├── memory-indicator.ts       # Chat header memory count
│   │   ├── device-status-badge.ts    # Device status badge
│   │   ├── audit-timeline.ts         # Device audit event timeline
│   │   ├── skill-card.ts             # Skill catalog card
│   │   ├── skill-settings-panel.ts   # Slide-in settings panel
│   │   ├── skill-status-badge.ts     # Skill status badge
│   │   ├── schema-form.ts            # JSON Schema → form renderer
│   │   ├── agent-tabs.ts            # Multi-agent tab bar
│   │   ├── split-view.ts            # Dual-pane chat layout
│   │   ├── terminal-output.ts       # Deploy log terminal display
│   │   └── file-diff-viewer.ts      # File diff display
│   ├── controllers/          # State management (27 files)
│   │   ├── memory.ts                 # Memory CRUD + indicator
│   │   ├── skills.ts                 # Skills catalog + settings
│   │   ├── devices.ts                # Device pairing + tokens
│   │   ├── sessions.ts              # Session state + RPCs
│   │   ├── chat.ts                   # Chat controller (+memory context)
│   │   ├── agent-tabs.ts            # Multi-agent tab management
│   │   ├── voice.ts                 # Speech recognition + TTS
│   │   ├── deploys.ts               # Deploy state + project/deploy/preview RPCs
│   │   └── projects.ts              # Project operations (thin shim)
│   ├── views/
│   │   ├── chat.ts           # Chat view (+switcher, memory, voice, tabs)
│   │   ├── sessions.ts       # Sessions view (card/table)
│   │   ├── skills.ts         # Skills view (catalog UI)
│   │   ├── memory-view.ts    # Memory management view
│   │   ├── nodes.ts          # Nodes view (+device guard section)
│   │   ├── overview.ts       # Overview (+session link)
│   │   ├── projects-view.ts  # Project registry management
│   │   ├── deploy-view.ts    # Deploy workflow + streaming logs
│   │   └── preview-view.ts   # Preview environment management
│   ├── chat/
│   │   └── grouped-render.ts # Message grouping + rendering
│   └── connection/
│       └── connection-manager.ts  # UI state tracker for connection
└── styles/
    ├── components.css         # Shared component styles (1000+ lines)
    ├── projects.css           # Project registry styles (114 lines)
    ├── deploy.css             # Deploy workflow + terminal (260 lines)
    ├── preview.css            # Preview management (172 lines)
    ├── chat/
    │   ├── composer.css       # Composer + API key banner styles
    │   ├── grouped.css        # Chat message styles
    │   ├── layout.css         # Chat layout
    │   ├── sidebar.css        # Split panel sidebar
    │   ├── text.css           # Text formatting
    │   └── split-view.css     # Dual-pane chat layout
    ├── layout.css             # Main layout
    ├── layout.mobile.css      # Mobile responsive
    ├── connection.css         # Connection banner
    └── animations.css         # Animations
```

## Kiến thức quan trọng

### Gateway Communication
- WebSocket tại `ws://127.0.0.1:18789`
- Dev server (Vite) port 3334 với proxy đến gateway
- RPC: `client.request("method", params)` — e.g. `auth.profiles.set`, `chat.send`

### State Management
- `app.ts` (OpenClawApp) giữ toàn bộ `@state()` reactive properties
- `app-render.ts` wire props từ state xuống views
- `AppViewState` type không cover hết methods (pre-existing type gap) — runtime OK

### Gotchas
- **WebSocket.close() là async** — `stop()` set `this.ws = null` nhưng `onclose` fire sau
- **Pre-existing TS errors** trong `app-render.ts` và `app-render.helpers.ts` — đừng nhầm với lỗi mới
- **Gateway auth fallback** — thử key theo thứ tự trong `auth-profiles.json`, retry khi 401

## Checklist debug connection

1. [ ] Gateway đang chạy? `lsof -i :18789`
2. [ ] Dev server đúng port? `http://localhost:3334`
3. [ ] Console errors trong browser?
4. [ ] `auth-profiles.json` có key hợp lệ? `cat ~/.openclaw/agents/main/agent/auth-profiles.json`
5. [ ] Clear localStorage nếu lỗi signature

## Tests

**443 tests, 34 files, 0 failures.**

| Test file | Lines | Mô tả |
|-----------|-------|-------|
| `components/session-card.test.ts` | 176 | Session card rendering + actions |
| `components/session-switcher.test.ts` | 222 | Session switcher dropdown |
| `components/memory-chip.test.ts` | 177 | Memory fact card |
| `components/memory-indicator.test.ts` | 133 | Memory indicator in chat |
| `components/device-status-badge.test.ts` | 149 | Device status badges |
| `components/audit-timeline.test.ts` | 115 | Audit event timeline |
| `components/skill-card.test.ts` | 146 | Skill catalog card |
| `components/agent-tabs.test.ts` | 162 | Agent tab bar |
| `components/split-view.test.ts` | 90 | Split view layout |
| `controllers/memory.test.ts` | 279 | Memory controller RPCs |
| `controllers/skills.test.ts` | 378 | Skills controller (catalog + settings) |
| `controllers/chat.test.ts` | 187+ | Chat controller (memory integration) |
| `controllers/agent-tabs.test.ts` | 235 | Agent tab management |
| `controllers/voice.test.ts` | 502 | Voice/TTS logic |
| `connection/connection-manager.test.ts` | 252 | Connection manager |
| `views/sessions.test.ts` | 137 | Sessions view |
| `views/memory-view.test.ts` | 169 | Memory view |
| `views/skills.test.ts` | 196 | Skills view |
| `views/chat.test.ts` | 227+ | Chat view (switcher + indicator) |
| `views/navigation.test.ts` | — | Navigation routing |
| `chat/message-extract.test.ts` | — | Message text extraction |
| `chat/message-normalizer.test.ts` | — | Message normalization |
| `chat/tool-helpers.test.ts` | — | Tool call helpers |
| `markdown.test.ts` | — | Markdown rendering |
| `format.test.ts` | — | Formatting utilities |
| `uuid.test.ts` | — | UUID generation |
| `app-settings.test.ts` | — | App settings |
| Browser tests (4 files) | — | Markdown, config form, focus mode, navigation |

Run: `pnpm test` (Vitest + Playwright Chromium, headless)

## RPC Reference (Gateway API)

| RPC Method | Feature | Mô tả |
|------------|---------|-------|
| `connect` | Auth | Handshake (client info, device auth, scopes) |
| `chat.send` | Chat | Gửi tin nhắn chat |
| `chat.abort` | Chat | Hủy chat đang chạy |
| `chat.history` | Chat | Lấy lịch sử chat |
| `auth.profiles.set` | Auth | Lưu API key |
| `config.get/set/schema` | Config | Cấu hình gateway |
| `sessions.list` | Sessions | List sessions with filters |
| `sessions.patch` | Sessions | Update session (label, levels) |
| `sessions.delete` | Sessions | Delete session + transcript |
| `memory.list` | Memory | List all UserFacts |
| `memory.search` | Memory | Full-text search facts |
| `memory.update` | Memory | Update fact content/verified |
| `memory.delete` | Memory | Delete a fact |
| `memory.extract` | Memory | LLM-extract facts from session |
| `memory.getActiveContext` | Memory | Facts active for current session |
| `device.pair.list` | Device Guard | List pending + paired devices |
| `device.pair.approve/reject` | Device Guard | Approve/reject pairing |
| `device.token.rotate/revoke` | Device Guard | Token lifecycle |
| `audit.list` | Device Guard | Audit timeline for device |
| `skills.catalog` | Skills | List all available skills |
| `skills.configSchema` | Skills | JSON schema + UI hints for skill |
| `skills.status` | Skills (legacy) | Workspace skill eligibility |
| `skills.update/install` | Skills | Toggle/install skill |
| `copilot.projects.*` | Copilot | 8 methods: list/get/scan/archive/unarchive/remove/touch/rescan |
| `copilot.deploy.*` | Copilot | 8 methods: precheck/start/cancel/history/logs/rollback/status/healthCheck |
| `copilot.preview.*` | Copilot | 5 methods: list/create/promote/delete/clean |
| `copilot.system.*` | Copilot | 2 methods: health/fix |
| `agents.list` | Agents | List available agents |
| `nodes.list` | Nodes | List cluster nodes |
| `channels.status` | Channels | Channel status |
| `cron.list/create/delete/runs` | Cron | Cron job management |
| `status/health` | System | Gateway status + health |
| `logs.read` | Logs | Read log files |

## Việc cần làm tiếp (TODO)

- [ ] E2E tests tích hợp CI (Playwright screenshot baselines đã có)
- [ ] Performance profiling & optimization
- [ ] Accessibility (a11y) audit
- [ ] PWA support (service worker, offline mode)
- [ ] Memory: bulk operations (delete multiple facts)
- [ ] Skills: search debounce, pagination for large catalogs
- [ ] Copilot: unit tests cho handler files

---

**Khi quay lại:** Yêu cầu "đọc HANDOVER.md để tiếp tục"
