# HANDOVER - BỜM Control UI

> Cập nhật: 2026-02-06 12:00

## Tổng quan dự án

**BỜM Control UI** — Giao diện điều khiển tiếng Việt cho OpenClaw Gateway.
Viết bằng LitElement + TypeScript + Vite. Xây dựng bằng Vibecode Kit.

## Trạng thái hiện tại: ✅ HOẠT ĐỘNG — SẴN SÀNG PUBLIC

- Kết nối Gateway: **OK** (auto-reconnect)
- Device Auth: **OK**
- Chat: **OK** (gửi/nhận tin nhắn, markdown rendering)
- API Key: **OK** (banner trên composer, lưu trực tiếp vào gateway)
- UI tiếng Việt: **OK** (song ngữ Việt/Anh)
- Icons: **OK** (outline style)
- Split Panel Layout: **OK** (Claude-style)
- Bảo mật: **OK** (không có secrets trong repo, .gitignore đầy đủ)

## Commits

```
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
│   ├── app.ts                # Main LitElement component
│   ├── app-render.ts         # Render delegation + prop wiring
│   ├── app-view-state.ts     # AppViewState type definition
│   ├── app-gateway.ts        # connectGateway() — creates WS clients
│   ├── app-chat.ts           # Chat message handling
│   ├── gateway.ts            # GatewayBrowserClient (WS + auto-reconnect)
│   ├── storage.ts            # LocalStorage + gateway URL detection
│   ├── icons.ts              # SVG icons (Lucide-style)
│   ├── i18n/                 # vi.ts, en.ts
│   ├── views/
│   │   └── chat.ts           # Chat view: model selector, composer, API key banner
│   ├── chat/
│   │   └── grouped-render.ts # Message grouping + rendering
│   └── connection/
│       └── connection-manager.ts  # UI state tracker for connection
└── styles/
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

## Việc cần làm tiếp (TODO)

- [ ] Test edge cases: offline, token expired, invalid API key feedback
- [ ] Unit tests cho device-auth.ts
- [ ] Optimize bundle size
- [ ] Mobile responsive testing
- [ ] Thêm project types cho Vibecode skill (landing, saas, dashboard)

---

**Khi quay lại:** Yêu cầu "đọc HANDOVER.md để tiếp tục"
