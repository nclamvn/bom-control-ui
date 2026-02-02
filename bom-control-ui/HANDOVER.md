# HANDOVER - BỜM Control UI

> Cập nhật: 2026-02-01 19:30

## Tổng quan dự án

**BỜM Control UI** - Giao diện điều khiển cho OpenClaw Gateway, viết bằng Lit.js (Web Components) + TypeScript.

## Trạng thái hiện tại: ✅ HOẠT ĐỘNG

- Kết nối Gateway: **OK**
- Device Auth: **OK** (đã fix root cause)
- UI tiếng Việt: **OK** (có dấu)
- Icons: **OK** (outline style)
- Split Panel Layout: **OK** (Claude-style)

## Commits gần nhất

```
a13ff5e feat: Claude-style split panel layout
c3798da fix: device auth signature và connection issues
2f51d14 feat: Premium UI redesign with 4-section navigation
eafa3b6 Initial commit
```

## Các lỗi đã fix (2026-02-01)

### 1. "device signature invalid" (ROOT CAUSE)

**File:** `src/lib/device-auth.ts`

**Vấn đề:** `buildDeviceAuthPayload()` trả về object → `"[object Object]"` khi sign

**Fix:** Trả về pipe-delimited string:
```typescript
return "v1|deviceId|clientId|clientMode|role|scopes|signedAtMs|token"
```

### 2. WebSocket kết nối sai port

**File:** `src/ui/storage.ts`

**Vấn đề:** Dev server (5173) dùng làm gateway URL

**Fix:** Detect dev server, hardcode gateway port:
```typescript
if (isDevServer) return "ws://127.0.0.1:18789";
```

### 3. Icons không đúng style

**File:** `src/ui/icons.ts`

**Fix:** Thêm `fill="none" stroke="currentColor" stroke-width="2"`

### 4. Split Panel Layout (Claude-style)

**Files:**
- `src/ui/app.ts` - Auto-collapse nav khi mở sidebar
- `src/ui/app-render.ts` - Thêm class `shell--split-panel`
- `src/styles/layout.css` - CSS cho split-panel mode
- `src/styles/chat/sidebar.css` - CSS cho chat split container

**Tính năng:**
- Khi mở content panel → nav sidebar tự động collapse (chỉ icon)
- Màn hình chia đôi: Chat trái + Content phải
- Chat area căn giữa trong nửa trái
- Giống design của Claude.ai

## Cách chạy

```bash
# 1. Chạy Gateway (terminal 1)
openclaw gateway

# 2. Chạy dev server (terminal 2)
cd /Users/mac/clawd/bom-control-ui
npm run dev

# 3. Lấy token
openclaw dashboard --no-open

# 4. Mở browser
http://localhost:5173/?token=<TOKEN>
```

## Cấu trúc thư mục quan trọng

```
src/
├── lib/
│   ├── device-auth.ts      # Build auth payload (đã fix)
│   └── client-info.ts      # Client constants
├── ui/
│   ├── gateway.ts          # WebSocket client
│   ├── storage.ts          # LocalStorage + gateway URL (đã fix)
│   ├── device-identity.ts  # Ed25519 keypair management
│   ├── device-auth.ts      # Token storage
│   ├── icons.ts            # SVG icons (đã fix)
│   ├── i18n/               # Ngôn ngữ (vi.ts, en.ts)
│   ├── components/         # UI components
│   │   ├── connection-banner.ts
│   │   ├── loading-states.ts
│   │   └── error-states.ts
│   ├── connection/
│   │   └── connection-manager.ts
│   └── views/
│       └── setup-guide.ts
└── styles/
    ├── animations.css
    ├── connection.css
    └── states.css
```

## Reference code

Gateway auth implementation gốc:
```
/Users/mac/clawd/openclaw-src/src/gateway/device-auth.ts
```

## Checklist khi debug connection

1. [ ] Gateway đang chạy? `lsof -i :18789`
2. [ ] Có token? `openclaw dashboard --no-open`
3. [ ] Clear localStorage nếu lỗi signature
4. [ ] Check console log trong browser

## Việc cần làm tiếp (TODO)

- [ ] Test đầy đủ các tính năng UI
- [ ] Thêm unit tests cho device-auth.ts
- [ ] Kiểm tra edge cases (offline, token expired)
- [ ] Optimize bundle size

## Bảo mật

✅ Không có API key trong repo
✅ .gitignore đã cấu hình đúng

---

**Khi quay lại:** Yêu cầu "đọc HANDOVER.md để tiếp tục"
