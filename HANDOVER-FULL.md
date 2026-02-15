# TÀI LIỆU CHUYỂN GIAO DỰ ÁN — Bờm Workspace 👻

> Ngày tạo: 2026-02-15
> Phiên bản: 1.0
> Người tạo: AI Agent (Claude Code)

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc tổng thể](#2-kiến-trúc-tổng-thể)
3. [Cấu trúc thư mục chi tiết](#3-cấu-trúc-thư-mục-chi-tiết)
4. [bom-control-ui — Dự án chính](#4-bom-control-ui--dự-án-chính)
5. [Giao thức Gateway WebSocket](#5-giao-thức-gateway-websocket)
6. [Hệ thống i18n (Đa ngôn ngữ)](#6-hệ-thống-i18n-đa-ngôn-ngữ)
7. [Hệ thống Test](#7-hệ-thống-test)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [openclaw-vietnam — Fork Gateway](#9-openclaw-vietnam--fork-gateway)
10. [Các dự án Demo](#10-các-dự-án-demo)
11. [Hệ thống AI Agent (Workspace Files)](#11-hệ-thống-ai-agent-workspace-files)
12. [Các tính năng đã hoàn thành (Feb 2026)](#12-các-tính-năng-đã-hoàn-thành-feb-2026)
13. [Lỗi đã biết & Hạn chế](#13-lỗi-đã-biết--hạn-chế)
14. [Hướng dẫn chạy & Phát triển](#14-hướng-dẫn-chạy--phát-triển)
15. [Checklist Debug](#15-checklist-debug)
16. [TODO & Hướng phát triển tiếp](#16-todo--hướng-phát-triển-tiếp)
17. [Lịch sử Commit](#17-lịch-sử-commit)
18. [Phụ lục: Tham chiếu nhanh](#18-phụ-lục-tham-chiếu-nhanh)

---

## 1. TỔNG QUAN DỰ ÁN

### Bờm là gì?

**Bờm** là AI agent nói tiếng Việt, chạy trên nền tảng [OpenClaw](https://github.com/openclaw/openclaw). Workspace `clawd` chứa toàn bộ hệ sinh thái: giao diện điều khiển (Control UI), fork Việt hóa của OpenClaw, identity/personality files cho AI, và các dự án demo.

### Thành phần chính

| Thành phần | Vai trò | Trạng thái |
|-----------|---------|-----------|
| **bom-control-ui** | Giao diện web điều khiển Gateway | ✅ Production-ready (368 tests, 0 failures) |
| **openclaw-vietnam** | Fork Việt hóa OpenClaw Gateway | ✅ v2026.2.6 |
| **Workspace Files** | Identity, memory, personality cho AI | ✅ Hoàn tất |
| **Demo Projects** | 4 dự án demo (Next.js, React) | ✅ Demo |

### Stack công nghệ

| Layer | Công nghệ |
|-------|-----------|
| UI Framework | **LitElement 3.3.2** (Web Components) |
| Language | **TypeScript 5.8+** (strict mode) |
| Build Tool | **Vite 7.3.1** |
| Styling | **Vanilla CSS** (17 files, module-based) |
| Testing | **Vitest 4.0.18** + Playwright (browser tests) |
| Package Manager | **pnpm 10** |
| Node.js | **22+** |
| CI/CD | **GitHub Actions** |
| Gateway Protocol | **WebSocket** (JSON-RPC) |
| Auth | **Ed25519** device identity |

---

## 2. KIẾN TRÚC TỔNG THỂ

### Sơ đồ hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (User)                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │           bom-control-ui (LitElement)               │  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │  │
│  │  │ Chat View│  │ Sessions │  │ Config/Skills/    │  │  │
│  │  │          │  │ Memory   │  │ Devices/Debug/    │  │  │
│  │  │          │  │ Overview │  │ Logs/Nodes/Cron   │  │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │  │
│  │                       │                              │  │
│  │         ┌─────────────┴───────────────┐             │  │
│  │         │ GatewayBrowserClient         │             │  │
│  │         │ (WebSocket + JSON-RPC)       │             │  │
│  │         │ Auto-reconnect (800ms→15s)   │             │  │
│  │         └─────────────┬───────────────┘             │  │
│  └───────────────────────┼────────────────────────────┘  │
└──────────────────────────┼───────────────────────────────┘
                           │ ws://127.0.0.1:18789
                           ▼
              ┌────────────────────────┐
              │   OpenClaw Gateway      │
              │   (openclaw-vietnam)    │
              │                         │
              │  ┌──────────────────┐  │
              │  │ AI Agents        │  │
              │  │ (Anthropic,      │  │
              │  │  OpenAI, Google) │  │
              │  └──────────────────┘  │
              │  ┌──────────────────┐  │
              │  │ Channels         │  │
              │  │ (Telegram, Zalo, │  │
              │  │  Discord, Slack, │  │
              │  │  WhatsApp, etc.) │  │
              │  └──────────────────┘  │
              │  ┌──────────────────┐  │
              │  │ Extensions       │  │
              │  │ (Memory, LLM,    │  │
              │  │  Auth, etc.)     │  │
              │  └──────────────────┘  │
              └────────────────────────┘
```

### Luồng dữ liệu

```
1. User mở browser → http://localhost:3334
2. Vite dev server serve static files (hoặc dist/ khi production)
3. OpenClawApp (LitElement) mount
4. connectGateway() tạo GatewayBrowserClient
5. WebSocket connect → ws://127.0.0.1:18789
6. Gateway gửi connect.challenge → Client ký bằng Ed25519
7. Client gửi "connect" RPC → Gateway trả "hello-ok" + snapshot
8. UI render dựa trên snapshot (presence, health, sessions)
9. User gõ chat → "chat.send" RPC → Gateway xử lý AI → Event stream về
10. Realtime events: chat, presence, agent, cron, device.pair, exec.approval
```

---

## 3. CẤU TRÚC THƯ MỤC CHI TIẾT

```
clawd/                              ← Root workspace (Git tracked)
│
├── 📄 Workspace Files (AI Agent System)
│   ├── IDENTITY.md                 # Tên: Bờm 👻, vibe, emoji
│   ├── SOUL.md                     # Tính cách, giọng nói, boundaries (107 dòng)
│   ├── AGENTS.md                   # Hướng dẫn vận hành cho AI (243 dòng)
│   ├── USER.md                     # Thông tin người dùng (template)
│   ├── MEMORY.md                   # Bộ nhớ dài hạn (chỉ main session)
│   ├── HEARTBEAT.md                # Periodic check checklist
│   ├── BOOT.md                     # Gateway startup tasks
│   ├── TOOLS.md                    # Local environment notes
│   ├── README.md                   # Public-facing intro (96 dòng)
│   ├── HANDOVER.md                 # Tài liệu handover gốc (312 dòng)
│   └── HANDOVER-FULL.md            # ← Tài liệu này
│
├── 📁 memory/                      # Daily logs (YYYY-MM-DD.md)
│   ├── 2026-01-31.md               # First boot log
│   └── 2026-02-09.md               # Daily context log
│
├── 📁 .github/workflows/           # CI/CD
│   ├── ci.yml                      # Test + Build pipeline
│   └── pr-check.yml                # PR test-only pipeline
│
├── 📁 bom-control-ui/              # 🔥 DỰ ÁN CHÍNH — Control UI
│   ├── package.json                # Dependencies & scripts
│   ├── vite.config.ts              # Build config (vendor chunks, sourcemaps)
│   ├── tsconfig.json               # TypeScript strict mode, ES2022
│   ├── vitest.config.ts            # Browser testing (Playwright + Chromium)
│   ├── index.html                  # HTML entry point
│   ├── pnpm-lock.yaml              # Dependency lock
│   ├── public/                     # Static assets (favicon, logo)
│   ├── dist/                       # Build output (~3.5 MB)
│   └── src/                        # Source code (chi tiết ở mục 4)
│
├── 📁 openclaw-vietnam/            # Fork Việt hóa (có .git riêng)
│   ├── package.json                # Gateway dependencies (120+)
│   ├── src/                        # Gateway source code
│   ├── extensions/                 # 16 plugins
│   ├── apps/                       # iOS, Android, macOS apps
│   ├── docs/                       # Mintlify documentation
│   └── skills/vibecode-build/      # Vibecode skill source
│
├── 📁 openclaw-src/                # Upstream reference (không chỉnh sửa)
│
├── 📁 apple-showcase/              # Demo: Next.js Apple-style showcase
├── 📁 projects/                    # 3 demo projects (React + Vite)
│   ├── finance-dashboard/
│   ├── tech-blog/
│   └── xiaomi-store/
│
├── 📁 skills/                      # Workspace skills
│   ├── canvas-design/
│   ├── frontend-design/
│   ├── theme-factory/
│   └── vibecode-build → symlink    # → openclaw-vietnam/skills/
│
├── 📁 canvas/                      # UI node display files
└── .gitignore                      # Bảo vệ secrets + untracked dirs
```

### Quy tắc Git Tracking

**Tracked (trong repo `clawd`):**
- Tất cả workspace files (IDENTITY, SOUL, AGENTS, etc.)
- `bom-control-ui/` — toàn bộ source
- `memory/` — daily logs
- `.github/workflows/` — CI/CD
- `canvas/`

**Gitignored (chỉ có local):**
- `openclaw-vietnam/` — có repo Git riêng
- `openclaw-src/` — upstream reference
- `apple-showcase/`, `projects/` — demo apps
- `skills/` — symlinks
- `node_modules/`, `.env*`, `**/auth-profiles.json`

---

## 4. BOM-CONTROL-UI — DỰ ÁN CHÍNH

### 4.1 Tổng quan

Giao diện web điều khiển OpenClaw Gateway, song ngữ Việt/Anh, xây dựng bằng LitElement (Web Components).

### 4.2 Cấu trúc Source Code

```
src/
├── main.ts                         # Entry point — import CSS + mount <openclaw-app>
├── styles.css                      # Global stylesheet (import tất cả CSS modules)
├── speech.d.ts                     # Web Speech API type definitions
│
├── lib/                            # Thư viện tiện ích (4 files)
│   ├── client-info.ts              # Client name/mode constants
│   ├── device-auth.ts              # Ed25519 device auth payload builder
│   ├── reasoning-tags.ts           # AI reasoning tag parser
│   └── session-key.ts              # Session key utilities
│
├── styles/                         # CSS Modules (17 files)
│   ├── base.css                    # Reset, typography, CSS variables
│   ├── layout.css                  # Desktop layout (sidebar, main, panels)
│   ├── layout.mobile.css           # Mobile responsive overrides
│   ├── animations.css              # Transitions, keyframes
│   ├── components.css              # Shared component styles
│   ├── states.css                  # Loading, empty, error states
│   ├── utilities.css               # Utility classes
│   ├── connection.css              # Connection banner styles
│   ├── config.css                  # Config view styles
│   ├── chat.css                    # Legacy chat styles
│   └── chat/                       # Chat-specific CSS (7 files)
│       ├── layout.css              # Chat container layout
│       ├── sidebar.css             # Tool output sidebar
│       ├── composer.css            # Message input area
│       ├── text.css                # Message text styling
│       ├── tool-cards.css          # Tool call card styling
│       ├── grouped.css             # Grouped message bubbles
│       └── split-view.css          # Dual-pane chat layout
│
└── ui/                             # Application logic (~150 TS files)
    ├── [Core — chi tiết bên dưới]
    ├── controllers/                # State management (26+ files)
    ├── components/                 # LitElement components (27 files)
    ├── views/                      # Page views (40+ files)
    ├── chat/                       # Chat rendering (8 files)
    ├── connection/                 # WebSocket connection (2 files)
    ├── i18n/                       # Đa ngôn ngữ (3 files)
    ├── types/                      # TypeScript definitions
    └── data/                       # Embedded data
```

### 4.3 Kiến trúc Core Files

#### app.ts — OpenClawApp (LitElement root component)

File trung tâm (~643 dòng). Khai báo toàn bộ `@state()` reactive properties và delegate logic sang các module chuyên biệt.

```
OpenClawApp extends LitElement
│
├── @state() declarations (~100 reactive properties)
│   ├── Connection: connected, connectionState, hello, lastError
│   ├── Theme: theme, themeResolved
│   ├── Chat: chatMessages, chatMessage, chatLoading, chatStream, chatRunId
│   ├── Agent Tabs: agentTabs, focusedPane, sessionKey
│   ├── Voice: chatIsRecording, voiceMode, ttsEnabled
│   ├── Sessions: sessionsResult, sessionsLoading
│   ├── Memory: memoryFacts, memoryFilter, memorySearch
│   ├── Skills: skillsCatalog, skillsReport, skillsSettingsOpen
│   ├── Devices: devicesList, devicesLoading
│   ├── Config: configForm, configSchema, configSnapshot
│   ├── Channels: channelsSnapshot, whatsappLoginQrDataUrl
│   ├── Debug: debugStatus, debugHealth
│   ├── Logs: logsEntries, logsFilterText, logsAutoFollow
│   ├── Cron: cronJobs, cronStatus
│   └── UI: commandPaletteOpen, sidebarOpen, splitRatio
│
├── Lifecycle methods
│   ├── connectedCallback()    → handleConnected()
│   ├── firstUpdated()         → handleFirstUpdated()
│   ├── updated()              → handleUpdated()
│   ├── disconnectedCallback() → handleDisconnected()
│   └── render()               → renderApp(this)
│
└── Public methods (delegate to specialized modules)
    ├── connect()              → connectGateway()
    ├── setTab()               → setTab()
    ├── setTheme()             → setTheme()
    ├── handleSendChat()       → handleSendChat()
    ├── handleAbortChat()      → handleAbortChat()
    ├── applySettings()        → applySettings()
    └── [30+ more methods]
```

#### Cách module hóa hoạt động

OpenClawApp **KHÔNG** chứa logic trực tiếp. Mỗi concern được tách thành module riêng:

| Module | File | Vai trò |
|--------|------|---------|
| Render | `app-render.ts` | Template HTML (lit-html), wire props xuống views |
| Render Helpers | `app-render.helpers.ts` | Các hàm render phụ trợ |
| Gateway | `app-gateway.ts` | Kết nối WebSocket, xử lý events |
| Chat | `app-chat.ts` | Gửi tin nhắn, queue, abort |
| Settings | `app-settings.ts` | Theme, tab, config save/load |
| Lifecycle | `app-lifecycle.ts` | Mount/unmount, polling, URL sync |
| Events | `app-events.ts` | Event log management |
| Scroll | `app-scroll.ts` | Auto-scroll chat, logs export |
| Channels | `app-channels.ts` | WhatsApp, Nostr channel management |
| Polling | `app-polling.ts` | Background polling (nodes, debug, logs) |
| Tool Stream | `app-tool-stream.ts` | Realtime tool call display |
| Defaults | `app-defaults.ts` | Default state values |
| View State | `app-view-state.ts` | TypeScript type contract (~400 dòng) |

#### Controllers (State Management)

Controllers quản lý logic nghiệp vụ cho từng feature:

| Controller | File | Vai trò |
|-----------|------|---------|
| `chat.ts` | Chat state, history loading, event handling |
| `channels.ts` | Channel status loading |
| `sessions.ts` | Session list, CRUD |
| `memory.ts` | UserFact store, extraction, indicator |
| `skills.ts` | Skill catalog, config schema loading |
| `devices.ts` | Device pairing list |
| `nodes.ts` | Node cluster management |
| `config.ts` | Gateway config load/save |
| `voice.ts` | Speech recognition, TTS |
| `agent-tabs.ts` | Multi-agent tab management |
| `agents.ts` | Agent list loading |
| `presence.ts` | Online status tracking |
| `cron.ts` | Cron job management |
| `logs.ts` | Log file reading |
| `assistant-identity.ts` | AI assistant name/avatar |
| `exec-approval.ts` | Command execution approval queue |
| `exec-approvals.ts` | Approval rules management |

#### Components (LitElement Web Components)

Reusable UI components, mỗi component tự render:

| Component | File | Vai trò |
|-----------|------|---------|
| `connection-banner.ts` | Banner trạng thái kết nối |
| `memory-chip.ts` | Memory fact tag (edit/delete) |
| `memory-indicator.ts` | Memory badge trong chat header |
| `session-card.ts` | Session info card |
| `session-switcher.ts` | Dropdown đổi session |
| `agent-tabs.ts` | Tab bar cho multi-agent |
| `split-view.ts` | Dual-pane layout |
| `resizable-divider.ts` | Kéo resize panels |
| `skill-card.ts` | Skill info card |
| `skill-settings-panel.ts` | Skill config (JSON Schema → form) |
| `skill-status-badge.ts` | Skill trạng thái badge |
| `device-status-badge.ts` | Device auth status |
| `audit-timeline.ts` | Device audit log |
| `schema-form.ts` | JSON Schema → dynamic form |
| `empty-states.ts` | Empty state illustrations |
| `loading-states.ts` | Loading spinner/skeleton |
| `error-states.ts` | Error display |

#### Views (Page Modules)

Mỗi tab trong sidebar tương ứng với một view:

| View | File(s) | Vai trò |
|------|---------|---------|
| Chat | `chat.ts` | Giao diện chat chính |
| Overview | `overview.ts` | Dashboard tổng quan |
| Channels | `channels.ts` + 10 sub-views | Quản lý kênh chat |
| Sessions | `sessions.ts` | Quản lý sessions |
| Memory | `memory-view.ts` | UserFact management |
| Skills | `skills.ts` | Skill catalog & settings |
| Config | `config.ts` + 4 sub-views | Gateway configuration |
| Nodes | (in views/) | Cluster node management |
| Debug | `debug.ts` | Debug console, RPC tester |
| Logs | (in views/) | Log viewer |
| Cron | `cron.ts` | Scheduled jobs |
| Command Palette | `command-palette.ts` | ⌘K quick navigation |
| Setup Guide | `setup-guide.ts` | First-time setup wizard |

### 4.4 Build Configuration

#### vite.config.ts

```typescript
// Quan trọng:
- Base path: Env var OPENCLAW_CONTROL_UI_BASE_PATH hoặc "./"
- Sourcemaps: Luôn bật
- Vendor chunks: vendor-lit, vendor-markdown, vendor-crypto (code splitting)
- Dev server: port 5173, host: true, strictPort
- Dep optimization: lit/directives/repeat.js
```

#### tsconfig.json

```json
{
  "target": "ES2022",
  "module": "ESNext",
  "strict": true,
  "experimentalDecorators": true,      // Cho LitElement @customElement
  "useDefineForClassFields": false      // QUAN TRỌNG: Cần cho LitElement
}
```

> **Lưu ý:** `useDefineForClassFields: false` là BẮT BUỘC cho LitElement. Nếu đặt `true`, `@state()` decorators sẽ không hoạt động đúng.

#### Dependencies (package.json)

```json
{
  "dependencies": {
    "lit": "^3.3.2",              // UI framework
    "@noble/ed25519": "3.0.0",    // Device auth cryptography
    "dompurify": "^3.3.1",        // HTML sanitization (XSS prevention)
    "marked": "^17.0.1",          // Markdown → HTML rendering
    "vite": "7.3.1"               // Build tool
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "vitest": "4.0.18",                   // Test runner
    "@vitest/browser-playwright": "4.0.18", // Browser test adapter
    "playwright": "^1.58.1"               // Browser automation
  }
}
```

---

## 5. GIAO THỨC GATEWAY WEBSOCKET

### 5.1 Kết nối

```
URL: ws://127.0.0.1:18789
Protocol version: 3
```

### 5.2 Handshake Flow

```
1. Client → WebSocket.open → ws://127.0.0.1:18789
2. Gateway → Event: "connect.challenge" { nonce: "..." }
3. Client ký nonce bằng Ed25519 private key
4. Client → RPC: "connect" {
     minProtocol: 3,
     maxProtocol: 3,
     client: { id, version, platform, mode, instanceId },
     role: "operator",
     scopes: ["operator.admin", "operator.approvals", "operator.pairing"],
     device: { id, publicKey, signature, signedAt, nonce },
     auth: { token, password },
     userAgent, locale
   }
5. Gateway → Response: "hello-ok" {
     protocol: 3,
     features: { methods: [...], events: [...] },
     snapshot: { presence, health, sessionDefaults },
     auth: { deviceToken, role, scopes },
     policy: { tickIntervalMs }
   }
```

### 5.3 Frame Format

Tất cả messages là JSON:

**Request (Client → Gateway):**
```json
{
  "type": "req",
  "id": "uuid-v4",
  "method": "method.name",
  "params": { ... }
}
```

**Response (Gateway → Client):**
```json
{
  "type": "res",
  "id": "uuid-v4",            // Match request id
  "ok": true,
  "payload": { ... }
}
// Hoặc error:
{
  "type": "res",
  "id": "uuid-v4",
  "ok": false,
  "error": { "code": "...", "message": "..." }
}
```

**Event (Gateway → Client):**
```json
{
  "type": "event",
  "event": "event.name",
  "payload": { ... },
  "seq": 42,                  // Sequence number cho gap detection
  "stateVersion": { "presence": 1, "health": 2 }
}
```

### 5.4 RPC Methods (Client gọi)

| Method | Params | Mô tả |
|--------|--------|--------|
| `connect` | client info, auth, device | Handshake ban đầu |
| `chat.send` | message, sessionKey, attachments | Gửi tin nhắn chat |
| `chat.abort` | runId | Hủy chat đang chạy |
| `chat.history` | sessionKey, limit | Lấy lịch sử chat |
| `auth.profiles.set` | provider, key | Lưu API key |
| `config.get` | — | Lấy cấu hình gateway |
| `config.set` | config object | Lưu cấu hình |
| `config.schema` | — | Lấy JSON Schema cấu hình |
| `sessions.list` | filters | Danh sách sessions |
| `sessions.rename` | sessionKey, name | Đổi tên session |
| `sessions.delete` | sessionKey | Xóa session |
| `memory.list` | category, search | Danh sách UserFacts |
| `memory.update` | id, content | Cập nhật fact |
| `memory.delete` | id | Xóa fact |
| `memory.extract` | sessionKey | Trích xuất facts từ chat |
| `skills.catalog` | — | Danh sách tất cả skills |
| `skills.configSchema` | skillId | JSON Schema config của skill |
| `skills.getConfig` | skillId | Config hiện tại của skill |
| `skills.setConfig` | skillId, config | Lưu config skill |
| `skills.status` | — | Trạng thái các skills |
| `devices.list` | — | Danh sách devices đã pair |
| `devices.approve` | deviceId | Chấp nhận device pairing |
| `devices.reject` | deviceId | Từ chối device pairing |
| `devices.revoke` | deviceId | Thu hồi device access |
| `nodes.list` | — | Danh sách nodes trong cluster |
| `agents.list` | — | Danh sách agents |
| `cron.list` | — | Danh sách cron jobs |
| `cron.create` | job config | Tạo cron job |
| `cron.delete` | jobId | Xóa cron job |
| `cron.runs` | jobId | Lịch sử chạy cron |
| `status` | — | Trạng thái gateway |
| `health` | — | Health metrics |
| `logs.read` | file, cursor, limit | Đọc log files |
| `channels.status` | — | Trạng thái các kênh |
| `exec.approval.resolve` | id, decision | Phê duyệt/từ chối exec |
| `assistant.identity` | — | Thông tin assistant |

### 5.5 Events (Gateway push)

| Event | Payload | Mô tả |
|-------|---------|--------|
| `connect.challenge` | `{ nonce }` | Challenge cho device auth |
| `chat` | message, sessionKey, state, runId | Chat stream updates |
| `agent` | tool calls, progress | Agent activity |
| `presence` | `{ presence: [...] }` | Online users/devices |
| `cron` | — | Cron job triggered |
| `device.pair.requested` | — | New device pairing request |
| `device.pair.resolved` | — | Pairing approved/rejected |
| `exec.approval.requested` | id, command, expiresAtMs | Command needs approval |
| `exec.approval.resolved` | id, decision | Approval decided |

### 5.6 Auto-Reconnect

`GatewayBrowserClient` tự reconnect khi mất kết nối:

```
Backoff: 800ms → ×1.7 → max 15,000ms
Reset: Về 800ms sau connect thành công
Khi nào KHÔNG reconnect: Khi client.stop() được gọi (closed = true)
```

### 5.7 Gotchas quan trọng

1. **WebSocket.close() là async** — `stop()` đặt `this.ws = null` ngay lập tức, nhưng `onclose` callback fire sau đó. Luôn kiểm tra `if (host.client !== client) return;` trong mọi callback.

2. **Stale client callbacks** — Khi `connectGateway()` tạo client mới, `onclose` của client cũ vẫn fire. Nếu không guard, nó sẽ overwrite state của client mới.

3. **Single reconnect** — Chỉ `GatewayBrowserClient.scheduleReconnect()` xử lý reconnect. `ConnectionManager` KHÔNG tự retry. Nếu thêm retry ở ConnectionManager sẽ gây race condition (đã fix).

4. **Device auth cần Secure Context** — `crypto.subtle` chỉ có trên HTTPS hoặc localhost. Trên HTTP thường, skip device identity và fallback sang token-only auth.

---

## 6. HỆ THỐNG I18N (ĐA NGÔN NGỮ)

### 6.1 Cấu trúc

```
src/ui/i18n/
├── index.ts    # Setup: t(), setLanguage(), getLanguage()
├── vi.ts       # Tiếng Việt (1186 dòng) — PRIMARY
└── en.ts       # English (1185 dòng)
```

### 6.2 Cách sử dụng

```typescript
import { t } from "./i18n";

// Trong render:
html`<h1>${t().nav.chat}</h1>`
html`<p>${t().chat.sendMessage}</p>`

// Đổi ngôn ngữ:
import { setLanguage } from "./i18n";
setLanguage("en"); // hoặc "vi"
```

### 6.3 Translation Keys (cấu trúc)

```typescript
type Translations = {
  nav: {
    chat, overview, channels, instances, sessions, cronJobs,
    skills, nodes, config, debug, logs, memory, docs,
    core, admin,           // Group labels
    subtitles: { ... }     // Mô tả ngắn cho mỗi tab
  },
  chat: { ... },           // Chat UI strings
  channels: { ... },       // Channel management
  config: { ... },         // Configuration
  sessions: { ... },       // Session management
  memory: { ... },         // Memory system
  skills: { ... },         // Skill system
  devices: { ... },        // Device management
  // ... 1000+ total strings
}
```

### 6.4 Lưu ý khi thêm string mới

- Luôn thêm vào **CẢ HAI** file `en.ts` và `vi.ts`
- Type `Translations` được định nghĩa trong `vi.ts` (source of truth)
- `en.ts` cast `as unknown as Translations` (có thể thiếu keys mới)

---

## 7. HỆ THỐNG TEST

### 7.1 Tổng quan

- **Framework:** Vitest 4.0.18
- **Browser testing:** @vitest/browser-playwright + Chromium (headless)
- **Tổng:** 43 test files, 368 tests, 0 failures
- **Chạy:** `pnpm test` (trong `bom-control-ui/`)

### 7.2 Test Files

#### Unit Tests (`.test.ts`)

| File | Số tests | Mô tả |
|------|----------|--------|
| `controllers/chat.test.ts` | Nhiều | Chat state management |
| `controllers/config.test.ts` | Nhiều | Config load/save |
| `controllers/memory.test.ts` | Nhiều | Memory CRUD |
| `controllers/skills.test.ts` | Nhiều | Skill catalog |
| `controllers/agent-tabs.test.ts` | Nhiều | Multi-agent tabs |
| `controllers/voice.test.ts` | Nhiều | Voice/TTS |
| `connection/connection-manager.test.ts` | Nhiều | Connection state |
| `components/memory-chip.test.ts` | Nhiều | Memory chip component |
| `components/memory-indicator.test.ts` | Nhiều | Memory indicator |
| `components/session-card.test.ts` | Nhiều | Session card |
| `components/session-switcher.test.ts` | Nhiều | Session switcher |
| `components/split-view.test.ts` | Nhiều | Split view layout |
| `components/device-status-badge.test.ts` | Nhiều | Device badge |
| `components/audit-timeline.test.ts` | Nhiều | Audit timeline |
| `components/agent-tabs.test.ts` | Nhiều | Agent tab bar |
| `components/skill-card.test.ts` | Nhiều | Skill card |
| `views/chat.test.ts` | Nhiều | Chat view rendering |
| `views/sessions.test.ts` | Nhiều | Sessions view |
| `views/skills.test.ts` | Nhiều | Skills view |
| `views/memory-view.test.ts` | Nhiều | Memory view |
| `views/cron.test.ts` | Nhiều | Cron view |
| `views/navigation.test.ts` | Nhiều | Navigation routing |
| `chat/message-extract.test.ts` | Nhiều | Message text extraction |
| `chat/message-normalizer.test.ts` | Nhiều | Message normalization |
| `chat/tool-helpers.test.ts` | Nhiều | Tool call helpers |
| `markdown.test.ts` | Nhiều | Markdown rendering |
| `format.test.ts` | Nhiều | Formatting utilities |
| `uuid.test.ts` | Nhiều | UUID generation |
| `app-settings.test.ts` | Nhiều | App settings |

#### Browser Tests (`.browser.test.ts`)

| File | Mô tả |
|------|--------|
| `chat-markdown.browser.test.ts` | Markdown rendering trong browser thực |
| `config-form.browser.test.ts` | Config form rendering (có screenshots) |
| `focus-mode.browser.test.ts` | Chat focus mode (có screenshots) |
| `navigation.browser.test.ts` | URL routing (có screenshots) |

### 7.3 Vitest Configuration

```typescript
// vitest.config.ts
{
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
      headless: true,
    },
    include: ["src/**/*.test.ts"],
    ui: false,
  }
}
```

### 7.4 Chạy Tests

```bash
cd bom-control-ui

# Chạy tất cả tests
pnpm test

# Chạy test cụ thể
npx vitest run src/ui/controllers/chat.test.ts

# Chạy tests có watch mode
npx vitest --watch
```

---

## 8. CI/CD PIPELINE

### 8.1 GitHub Actions Workflows

#### ci.yml — Main Pipeline

```yaml
Triggers: push/PR to main, develop
Jobs:
  1. test:
     - Node 22, pnpm 10
     - Install dependencies (frozen lockfile)
     - Install Playwright Chromium
     - Run: pnpm test

  2. build (depends on test):
     - Install dependencies
     - Run: pnpm build
     - Upload dist/ artifact (7 ngày)
```

#### pr-check.yml — PR Only

```yaml
Triggers: PR opened/synchronize/reopened
Jobs:
  1. test:
     - Giống test job ở ci.yml
     - Không build, chỉ test
```

### 8.2 Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js         # Main bundle
│   ├── vendor-lit-[hash].js    # LitElement + lit-html
│   ├── vendor-markdown-[hash].js # marked + dompurify
│   ├── vendor-crypto-[hash].js # @noble/ed25519
│   ├── [lazy-loaded views].js  # Code-split view chunks
│   └── index-[hash].css        # All styles
├── favicon.ico, favicon-32.png, favicon.svg
├── apple-touch-icon.png
└── logo.png
```

**Tổng size:** ~3.5 MB (với sourcemaps)

---

## 9. OPENCLAW-VIETNAM — FORK GATEWAY

### 9.1 Tổng quan

Bản fork của [OpenClaw](https://github.com/openclaw/openclaw) đã Việt hóa, version `v2026.2.6`.

### 9.2 Thay đổi chính so với upstream

- Việt hóa hoàn toàn (song ngữ VI/EN)
- Navigation giảm từ 11 → 7 sidebar tabs (4 ẩn, truy cập qua ⌘K)
- Update indicator (tự check upstream releases)
- Vibecode methodology + tools tích hợp
- Build system: Upstream dùng `tsdown`, fork dùng `tsc`

### 9.3 Cấu trúc chính

```
openclaw-vietnam/
├── src/
│   ├── agents/           # AI agent implementations
│   ├── channels/         # 10+ messaging channels
│   ├── commands/         # Gateway command handlers
│   ├── config/           # Configuration system
│   ├── daemon/           # Background services
│   └── [70+ modules]
├── extensions/           # 16 plugins
│   ├── telegram/
│   ├── zalo/, zalouser/  # Vietnamese chat platforms
│   ├── memory-core/, memory-lancedb/
│   └── [others]
├── apps/
│   ├── android/          # Android app (Gradle)
│   ├── ios/              # iOS app (Xcodegen)
│   └── macos/            # macOS app (SwiftUI)
├── docs/                 # Mintlify documentation
└── skills/vibecode-build/ # Vibecode skill
```

### 9.4 Khi cần sync upstream

```bash
# Thêm upstream remote (nếu chưa có)
cd openclaw-vietnam
git remote add upstream https://github.com/openclaw/openclaw.git
git fetch upstream

# Cherry-pick commit cụ thể
git cherry-pick <commit-hash>
# Nếu conflict: --theirs cho CHANGELOG/package.json/pnpm-lock.yaml
# Nhưng source files có thể reference types/functions từ commits trung gian

# Sau cherry-pick, kiểm tra missing exports/types:
git checkout v2026.2.6 -- <file>  # để sync dependency files
```

### 9.5 Lưu ý quan trọng

- **Version scheme:** `v2026.M.D` (year.month.day)
- **Build:** Fork dùng `tsc` (đã restore trong package.json), upstream dùng `tsdown`
- **Pre-existing test failures:**
  - `catalog.test.ts` — msteams plugin đã bị xóa upstream
  - ~11 infra-level test file timeouts

---

## 10. CÁC DỰ ÁN DEMO

### 10.1 apple-showcase

| Thuộc tính | Giá trị |
|-----------|---------|
| Stack | Next.js 15 + React 19 + TypeScript + Tailwind CSS |
| Mục đích | Demo Apple-style product showcase |
| Chạy | `cd apple-showcase && npm run dev` → http://localhost:3000 |

### 10.2 projects/ (3 Vibecode Demos)

| Project | Stack | Mô tả |
|---------|-------|--------|
| finance-dashboard | React + Vite | Dashboard tài chính |
| tech-blog | React + Vite | Blog công nghệ |
| xiaomi-store | React + Vite | Clone Xiaomi Store |

Tất cả chạy: `npm install && npm run dev`

### 10.3 Vibecode Kit Methodology

Quy trình phát triển chia vai:

```
Claude Chat (Architect)  →  Blueprint.json  →  Claude Code (Builder)
    THINK mode                                     EXECUTE mode
    claude.ai                                      Terminal/CLI
```

**Tools:** (trong `openclaw-vietnam/vibecode/tools/`)
- `verify-blueprint.ts` — URL verification
- `validate-blueprint.ts` — Schema validation
- `qa-check.ts` — Post-build QA

---

## 11. HỆ THỐNG AI AGENT (WORKSPACE FILES)

### 11.1 Tổng quan

Bộ files cho AI agent persistence — cho phép AI "nhớ" context qua các phiên làm việc:

| File | Mục đích | Khi nào đọc |
|------|----------|-------------|
| `SOUL.md` | Tính cách, boundaries | Mỗi session |
| `IDENTITY.md` | Tên (Bờm 👻), vibe | Mỗi session |
| `USER.md` | Thông tin người dùng | Mỗi session |
| `AGENTS.md` | Hướng dẫn vận hành đầy đủ | Mỗi session |
| `MEMORY.md` | Bộ nhớ dài hạn (curated) | Chỉ main session |
| `memory/YYYY-MM-DD.md` | Daily logs | Mỗi session |
| `HEARTBEAT.md` | Periodic checks | Khi nhận heartbeat |
| `BOOT.md` | Gateway startup tasks | Khi gateway start |
| `TOOLS.md` | Local env notes | Khi cần |

### 11.2 Memory Flow

```
Daily logs (memory/)    →   Append-only, raw notes
       ↓ Distill
MEMORY.md               →   Curated wisdom, verified patterns
```

- `MEMORY.md` chỉ load trong main session (bảo mật)
- Daily logs load: hôm nay + hôm qua

---

## 12. CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH (FEB 2026)

### Development Cycle Stats

- **4 feature tracks, 10 phases**
- **53 files changed, +6414 lines**
- **368 UI tests (30 files), 0 failures**

### Feature Details

#### 1. Session UX
- Card view + table view cho sessions
- Session switcher dropdown (trong chat header)
- Inline editing (rename)
- Quick-resume từ recent sessions
- Token tracking & session analytics

#### 2. Memory System
- UserFact CRUD (create, read, update, delete)
- LLM extraction — tự động trích xuất facts từ chat
- Category filter (personal, preference, work, etc.)
- Full-text search
- Chat indicator — hiển thị facts liên quan trong chat header
- Memory view (standalone page)

#### 3. Device Guard (10/10 gaps filled)
- Device pairing approval flow
- Token lifecycle (issue, refresh, revoke)
- Audit timeline (visual history)
- Device status badges
- CORS protection
- IP tracking
- Scope-based access control
- Secure context detection (HTTPS vs HTTP)

#### 4. Skill System
- `skills.catalog` RPC — lấy danh sách skills từ gateway
- `skills.configSchema` RPC — JSON Schema cho skill config
- Catalog UI — browse, filter by kind, search
- Settings panel — JSON Schema → dynamic form
- Env var management cho skills
- Install/uninstall controls

#### 5. Agent Tabs + Split View (Phase 2)
- Multi-agent tab bar
- Unread message tracking per tab
- Split view (dual-pane chat)
- Resizable divider
- Agent preset picker

#### 6. Voice Input
- Speech recognition (Web Speech API)
- Text-to-speech for AI responses
- Vietnamese voice support detection
- Voice mode indicators (idle, listening, speaking)

#### 7. Mobile Responsive
- Touch targets optimization
- Input font sizes for mobile
- Component layout adjustments
- Responsive sidebar

---

## 13. LỖI ĐÃ BIẾT & HẠN CHẾ

### 13.1 Pre-existing TypeScript Errors

- `app-render.ts` và `app-render.helpers.ts` có TS errors do `AppViewState` type không cover hết methods
- Runtime hoạt động bình thường (actual object là `OpenClawApp` có đầy đủ methods)
- **Không phải lỗi mới** — đã tồn tại từ đầu

### 13.2 Gateway Test Failures

- `catalog.test.ts` — fail do msteams plugin đã bị xóa upstream
- ~11 test files timeout do infrastructure issues

### 13.3 Known Limitations

- E2E tests (Playwright screenshots) chưa tích hợp CI — baselines tồn tại nhưng chưa chạy automated
- Config form chưa validate tất cả edge cases
- Voice/TTS phụ thuộc browser support — không hoạt động trên mọi browser
- `AppViewState` type cần được mở rộng khi thêm methods mới vào `OpenClawApp`

---

## 14. HƯỚNG DẪN CHẠY & PHÁT TRIỂN

### 14.1 Yêu cầu hệ thống

- **Node.js:** 22+ (gateway), 18+ (UI)
- **pnpm:** 10+
- **OS:** macOS, Linux, Windows (WSL recommended)
- **Browser:** Chrome/Chromium (for development & tests)

### 14.2 Setup lần đầu

```bash
# 1. Clone workspace
git clone <repo-url> clawd
cd clawd

# 2. Đọc context
#    → HANDOVER-FULL.md (file này)
#    → README.md (public intro)

# 3. Install Control UI dependencies
cd bom-control-ui
pnpm install

# 4. Install Playwright (cho tests)
npx playwright install chromium
```

### 14.3 Chạy Development

```bash
# Terminal 1: Gateway (cần openclaw-vietnam)
cd openclaw-vietnam
pnpm gateway:dev
# Gateway chạy tại ws://127.0.0.1:18789

# Terminal 2: UI Dev Server
cd bom-control-ui
pnpm dev
# UI chạy tại http://localhost:5173
# (hoặc port 3334 nếu có proxy config)
```

### 14.4 Build Production

```bash
cd bom-control-ui
pnpm build
# Output: dist/

# Preview build:
pnpm preview
```

### 14.5 Chạy Tests

```bash
cd bom-control-ui

# Tất cả tests
pnpm test

# Test cụ thể
npx vitest run src/ui/controllers/chat.test.ts

# Watch mode
npx vitest --watch

# Với UI (browser)
npx vitest --ui
```

### 14.6 Quy trình phát triển feature mới

1. **Tạo branch** từ `main`
2. **Thêm controller** (nếu cần state management mới)
3. **Thêm component** (nếu cần UI component mới)
4. **Thêm view** (nếu là tab/page mới)
5. **Thêm i18n strings** vào CẢ `en.ts` VÀ `vi.ts`
6. **Viết tests** — unit tests cho controller, browser tests cho UI
7. **Update `AppViewState`** nếu thêm methods mới
8. **PR** → CI chạy tests + build → merge

### 14.7 Thêm RPC method mới

1. Xác định method name và params trong gateway source
2. Trong controller tương ứng, gọi `client.request("method.name", params)`
3. Xử lý response, cập nhật state
4. Test với Debug view (RPC tester)

---

## 15. CHECKLIST DEBUG

Khi gặp lỗi, kiểm tra theo thứ tự:

- [ ] **Gateway chạy?** → `lsof -i :18789` hoặc `curl http://localhost:18789`
- [ ] **Dev server đúng port?** → http://localhost:5173 (hoặc 3334)
- [ ] **Console errors?** → F12 → Console tab
- [ ] **WebSocket connected?** → Network tab → WS filter → kiểm tra messages
- [ ] **API key hợp lệ?** → `cat ~/.openclaw/agents/main/agent/auth-profiles.json`
- [ ] **Device auth lỗi?** → Clear localStorage → reload
- [ ] **Stale state?** → Hard reload (Ctrl+Shift+R)
- [ ] **Build lỗi?** → `pnpm build` → đọc error output
- [ ] **Test lỗi?** → `pnpm test` → check failed test name
- [ ] **TypeScript errors?** → Nhiều errors ở `app-render.ts` là pre-existing, không ảnh hưởng runtime

---

## 16. TODO & HƯỚNG PHÁT TRIỂN TIẾP

### bom-control-ui

- [ ] E2E tests tích hợp CI (Playwright screenshot baselines đã có)
- [ ] Performance profiling & optimization
- [ ] Accessibility (a11y) audit
- [ ] PWA support (service worker, offline mode)
- [ ] Notification system (browser notifications)
- [ ] Keyboard shortcuts documentation
- [ ] Dark/light theme polish

### Workspace

- [ ] Thêm project types cho Vibecode skill (landing, saas, dashboard)
- [ ] Điền thêm TOOLS.md (machines, SSH, preferences)
- [ ] Cấu hình BOOT.md cho gateway startup tasks

### openclaw-vietnam

- [ ] Theo dõi upstream releases
- [ ] Test update indicator với version mới
- [ ] Đồng bộ build system (tsc vs tsdown)

---

## 17. LỊCH SỬ COMMIT

```
b08dd9a Phase 2: Agent tabs, voice input, split view
09b0957 Fix session switcher dropdown: sync CSS with HTML class names
6b02c72 Mobile responsive: touch targets, input font sizes, component layouts
55321ae Bundle optimization: vendor chunks + lazy view loading
0fc999b Sync pnpm-lock.yaml with package.json
0893c30 Add CI/CD pipeline and update handover docs
e4b8e46 Bom Ecosystem Feb 2026: Session UX, Memory, Device Guard, Skill System
bc0ce7b Project x-ray: update HANDOVER.md and add memory log 2026-02-09
234e40a Update HANDOVER.md with refined minimal UI changes
a14b2a1 Refined minimal UI: simplify sidebar to 2 groups, flatten bg, modernize styles
513f8de Update HANDOVER.md
f213410 Add design skills suite: frontend-design, theme-factory, canvas-design
2a18956 Update HANDOVER.md with latest changes and project status
19a76cd Add README with Vibecode Kit methodology and Vietnamese-first focus
a57431f Harden .gitignore and remove personal info before public release
6189025 Redesign API key input: dedicated banner + fix WebSocket reconnect
db608e1 Initial commit: Bờm workspace + Control UI
```

---

## 18. PHỤ LỤC: THAM CHIẾU NHANH

### Key File Paths

| Mục đích | Đường dẫn |
|----------|-----------|
| Main app component | `bom-control-ui/src/ui/app.ts` |
| App render template | `bom-control-ui/src/ui/app-render.ts` |
| Gateway client | `bom-control-ui/src/ui/gateway.ts` |
| Gateway connection | `bom-control-ui/src/ui/app-gateway.ts` |
| Connection manager | `bom-control-ui/src/ui/connection/connection-manager.ts` |
| Navigation/routing | `bom-control-ui/src/ui/navigation.ts` |
| i18n setup | `bom-control-ui/src/ui/i18n/index.ts` |
| Vietnamese strings | `bom-control-ui/src/ui/i18n/vi.ts` |
| English strings | `bom-control-ui/src/ui/i18n/en.ts` |
| Type definitions | `bom-control-ui/src/ui/types/` |
| Build config | `bom-control-ui/vite.config.ts` |
| TS config | `bom-control-ui/tsconfig.json` |
| Test config | `bom-control-ui/vitest.config.ts` |
| CI pipeline | `.github/workflows/ci.yml` |
| Device auth | `bom-control-ui/src/lib/device-auth.ts` |
| CSS entry | `bom-control-ui/src/styles.css` |

### Lệnh thường dùng

```bash
# Development
cd bom-control-ui && pnpm dev       # Start dev server
cd bom-control-ui && pnpm build     # Production build
cd bom-control-ui && pnpm test      # Run all tests
cd bom-control-ui && pnpm preview   # Preview production build

# Gateway
cd openclaw-vietnam && pnpm gateway:dev    # Start gateway (dev mode)
openclaw gateway                           # Start gateway (installed)

# Debug
lsof -i :18789                      # Check gateway port
lsof -i :5173                       # Check dev server port
```

### Quan hệ giữa các repos

```
clawd (main workspace — tracked in git)
├── bom-control-ui/     ← Part of clawd repo
├── .github/workflows/  ← Part of clawd repo
│
├── openclaw-vietnam/   ← Separate git repo (gitignored)
│   └── upstream: https://github.com/openclaw/openclaw
│
└── openclaw-src/       ← Separate git repo (gitignored, reference only)
```

---

**Khi bắt đầu:**
1. Đọc file này từ đầu đến cuối
2. Setup môi trường (mục 14)
3. Chạy `pnpm test` để confirm tests pass
4. Chạy dev server + gateway để xem UI
5. Bắt đầu phát triển

**Liên hệ:** Tham khảo AGENTS.md và SOUL.md để hiểu personality & behavior guidelines của Bờm.
