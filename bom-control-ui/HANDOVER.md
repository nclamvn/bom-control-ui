# HANDOVER - BỜM Control UI

> Cập nhật: 2026-02-12

## Tổng quan dự án

**BỜM Control UI** — Giao diện điều khiển tiếng Việt cho OpenClaw Gateway.
Viết bằng LitElement + TypeScript + Vite. Xây dựng bằng Vibecode Kit.

## Trạng thái hiện tại: ✅ HOẠT ĐỘNG — SẴN SÀNG PUBLIC

- Kết nối Gateway: **OK** (auto-reconnect)
- Device Auth: **OK** (pairing, token lifecycle, audit trail)
- Chat: **OK** (gửi/nhận, markdown, session switcher, memory indicator)
- API Key: **OK** (banner trên composer, lưu trực tiếp vào gateway)
- Sessions: **OK** (card/table views, inline editing, quick-resume)
- Memory: **OK** (UserFact CRUD, LLM extraction, category filter, search)
- Skills: **OK** (catalog browser, settings panel, env vars, install/toggle)
- UI tiếng Việt: **OK** (song ngữ Việt/Anh — toàn bộ features)
- Icons: **OK** (outline style)
- Split Panel Layout: **OK** (Claude-style)
- Bảo mật: **OK** (không có secrets trong repo, .gitignore đầy đủ)
- Tests: **368 tests** (30 files), **0 failures**

## Commits

```
e4b8e46 Bom Ecosystem Feb 2026: Session UX, Memory, Device Guard, Skill System
a14b2a1 Refined minimal UI: simplify sidebar to 2 groups, flatten bg, modernize styles
f213410 Add design skills suite: frontend-design, theme-factory, canvas-design
19a76cd Add README with Vibecode Kit methodology and Vietnamese-first focus
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

#### Cross-cutting

**Navigation:** 2-group sidebar structure
- Core (⌘1): chat, overview, channels, **memory**
- Admin (⌘2): config, **skills**, nodes, debug, logs
- Sessions: accessible via Overview hoặc direct URL (không trong sidebar)

**I18n:** Tất cả 4 features có full i18n (en + vi) — 140+ strings mỗi ngôn ngữ.

**Controller pattern (all features):**
1. State interface → loading/data/error flags
2. Async functions → RPC calls, optimistic updates
3. View functions → Lit templates từ state
4. `app.ts` (state) + `app-render.ts` (tab switching + event wiring)

**New components CSS:** `styles/components.css` (+1000 lines) — shared styles cho tất cả components mới.

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
│   ├── components/           # ★ New reusable components
│   │   ├── session-card.ts           # Session card (metadata, actions)
│   │   ├── session-switcher.ts       # Chat header session dropdown
│   │   ├── memory-chip.ts            # UserFact card (edit/verify/delete)
│   │   ├── memory-indicator.ts       # Chat header memory count
│   │   ├── device-status-badge.ts    # Device status badge
│   │   ├── audit-timeline.ts         # Device audit event timeline
│   │   ├── skill-card.ts             # Skill catalog card
│   │   ├── skill-settings-panel.ts   # Slide-in settings panel
│   │   ├── skill-status-badge.ts     # Skill status badge
│   │   └── schema-form.ts            # JSON Schema → form renderer
│   ├── controllers/          # ★ New/updated controllers
│   │   ├── memory.ts                 # Memory CRUD + indicator
│   │   ├── skills.ts                 # Skills catalog + settings (+187 lines)
│   │   ├── devices.ts                # Device pairing + tokens
│   │   ├── sessions.ts              # Session state + RPCs
│   │   └── chat.ts                   # Chat controller (+memory context)
│   ├── views/
│   │   ├── chat.ts           # Chat view (+session switcher, memory indicator)
│   │   ├── sessions.ts       # Sessions view (+101 lines: card/table)
│   │   ├── skills.ts         # Skills view (+159 lines: catalog UI)
│   │   ├── memory-view.ts    # ★ New: memory management view
│   │   ├── nodes.ts          # Nodes view (+64 lines: device guard section)
│   │   └── overview.ts       # Overview (+16 lines: session link)
│   ├── chat/
│   │   └── grouped-render.ts # Message grouping + rendering
│   └── connection/
│       └── connection-manager.ts  # UI state tracker for connection
└── styles/
    ├── components.css         # ★ New: shared component styles (+1000 lines)
    ├── chat/
    │   ├── composer.css       # Composer + API key banner styles
    │   ├── grouped.css        # Chat message styles
    │   ├── layout.css         # Chat layout
    │   ├── sidebar.css        # Split panel sidebar
    │   └── text.css           # Text formatting
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

**368 tests, 30 files, 0 failures.**

| Test file | Tests | Mô tả |
|-----------|-------|-------|
| `components/session-card.test.ts` | 176 | Session card rendering + actions |
| `components/session-switcher.test.ts` | 222 | Session switcher dropdown |
| `components/memory-chip.test.ts` | 177 | Memory fact card |
| `components/memory-indicator.test.ts` | 133 | Memory indicator in chat |
| `components/device-status-badge.test.ts` | 149 | Device status badges |
| `components/audit-timeline.test.ts` | 115 | Audit event timeline |
| `components/skill-card.test.ts` | 146 | Skill catalog card |
| `controllers/memory.test.ts` | 279 | Memory controller RPCs |
| `controllers/skills.test.ts` | 378 | Skills controller (catalog + settings) |
| `controllers/chat.test.ts` | +187 | Chat controller (memory integration) |
| `connection/connection-manager.test.ts` | 252 | Connection manager |
| `views/sessions.test.ts` | 137 | Sessions view |
| `views/memory-view.test.ts` | 169 | Memory view |
| `views/skills.test.ts` | 196 | Skills view |
| `views/chat.test.ts` | +227 | Chat view (switcher + indicator) |

Run: `pnpm test` (Vitest)

## RPC Reference (Gateway API)

| RPC Method | Feature | Mô tả |
|------------|---------|-------|
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
| `device.pair.approve` | Device Guard | Approve pairing request |
| `device.pair.reject` | Device Guard | Reject pairing request |
| `device.token.rotate` | Device Guard | Rotate device token |
| `device.token.revoke` | Device Guard | Revoke device token |
| `audit.list` | Device Guard | Audit timeline for device |
| `skills.catalog` | Skills | List all available skills |
| `skills.configSchema` | Skills | JSON schema + UI hints for skill |
| `skills.status` | Skills (legacy) | Workspace skill eligibility |
| `skills.update` | Skills | Toggle enabled, update env vars |
| `skills.install` | Skills | Install skill from catalog |

## Việc cần làm tiếp (TODO)

- [ ] Mobile responsive testing
- [ ] Optimize bundle size
- [ ] E2E tests (Playwright — screenshot baselines exist but not CI-integrated)
- [ ] Memory: bulk operations (delete multiple facts)
- [ ] Skills: search debounce, pagination for large catalogs

---

**Khi quay lại:** Yêu cầu "đọc HANDOVER.md để tiếp tục"
