# BỜM Control UI

**Giao diện điều khiển tiếng Việt** cho [OpenClaw](https://github.com/openclaw/openclaw) Gateway — xây dựng hoàn toàn bằng Vibecode Kit.

> *"Con ma trong máy"* 👻 — Bờm là AI agent nói tiếng Việt, sống trong workspace của bạn.

---

## Vibecode Kit — Cách build này ra đời

Repo này được xây dựng bằng **Vibecode methodology** — một quy trình chia vai rõ ràng giữa hai Claude:

```
Claude Chat (Architect)  →  Blueprint.json  →  Claude Code (Builder)
      ↑                                              ↑
  THINK mode                                    EXECUTE mode
  Thiết kế, suy nghĩ sâu                       Thực thi nhanh, chính xác
```

**Tại sao không gộp?** Claude Chat và Claude Code có system prompts khác biệt cơ bản. Vibecode khai thác sự khác biệt này thay vì chống lại nó:

| Vai trò | Công cụ | Nhiệm vụ |
|---------|---------|-----------|
| **Architect** | Claude Chat (claude.ai) | Thiết kế Blueprint — cấu trúc, UI, logic |
| **Builder** | Claude Code (CLI) | Nhận Blueprint → build code hoàn chỉnh |

### Quy trình Vibecode

1. **Mở [claude.ai](https://claude.ai)** — mô tả ý tưởng, Claude Chat sẽ tạo `Blueprint.json`
2. **Quay lại Claude Code** — paste Blueprint, dùng `/build execute` để build
3. **Verify** — `/build verify` để kiểm tra chất lượng

Toàn bộ UI bạn thấy trong repo này — từ chat interface, model selector, API key banner, đến connection manager — đều được build theo quy trình này.

---

## Tính năng

- **Chat trực tiếp** với AI qua OpenClaw Gateway (Anthropic, OpenAI, Google)
- **Giao diện tiếng Việt** — UI song ngữ Việt/Anh, mặc định tiếng Việt
- **API Key Banner** — nhập API key ngay trên giao diện, lưu thẳng vào gateway
- **Quản lý kênh** — WhatsApp, Telegram, Discord, Nostr, v.v.
- **Theo dõi sessions** và agent instances
- **Cấu hình gateway** an toàn từ trình duyệt
- **Auto-reconnect** — tự kết nối lại khi mất kết nối WebSocket

---

## Cài đặt

```bash
git clone https://github.com/nclamvn/bom-control-ui.git
cd bom-control-ui/bom-control-ui

pnpm install
pnpm dev
```

Mở trình duyệt tại `http://localhost:3334`. Gateway cần chạy tại `ws://127.0.0.1:18789`.

## Build production

```bash
pnpm build
```

Output trong thư mục `dist/`.

## Yêu cầu

- Node.js 18+
- pnpm
- OpenClaw Gateway đang chạy (local hoặc remote)

---

## Cấu trúc dự án

```
bom-control-ui/
├── AGENTS.md              # Hướng dẫn cho AI agent (Bờm)
├── IDENTITY.md            # Nhân dạng Bờm 👻
├── SOUL.md                # Tính cách & nguyên tắc
├── USER.md                # Thông tin người dùng
├── memory/                # Bộ nhớ liên phiên
├── skills/
│   └── vibecode-build/    # Vibecode Kit skill
└── bom-control-ui/
    ├── src/
    │   ├── lib/           # Utilities (auth, session, device)
    │   ├── styles/        # CSS (chat, layout, components)
    │   └── ui/
    │       ├── i18n/      # Bản dịch (en.ts, vi.ts)
    │       ├── views/     # Chat, Config, Sessions views
    │       ├── chat/      # Chat rendering components
    │       └── connection/ # WebSocket connection manager
    ├── index.html
    └── vite.config.ts
```

---

## Công nghệ

| Stack | Chi tiết |
|-------|----------|
| **UI Framework** | [Lit](https://lit.dev/) (LitElement + lit-html) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Language** | TypeScript |
| **Styling** | Vanilla CSS (no framework) |
| **Markdown** | [Marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify) |
| **Crypto** | [@noble/ed25519](https://github.com/paulmillr/noble-ed25519) (device auth) |
| **Testing** | [Vitest](https://vitest.dev/) + Playwright |

---

## Tiếng Việt First

Bờm được thiết kế **ưu tiên tiếng Việt**:

- Giao diện mặc định hiển thị tiếng Việt
- Tất cả labels, messages, hints đều có bản dịch Việt
- AI agent personality nói tiếng Việt tự nhiên
- Hỗ trợ chuyển đổi Việt ↔ Anh

Đây là một trong những dự án AI agent đầu tiên được xây dựng **bởi người Việt, cho người Việt**, với toàn bộ quy trình phát triển bằng tiếng Việt.

---

## Bảo mật

- API keys được lưu trực tiếp vào gateway (`auth-profiles.json`), không qua server trung gian
- Không có dữ liệu nhạy cảm nào gửi đến bên thứ ba
- Tất cả xử lý chạy local trên máy của bạn
- WebSocket kết nối trực tiếp đến gateway local

---

## Giấy phép

MIT License

---

**BỜM** 👻 — *Ngơ ngơ mà biết việc*

Built with Vibecode Kit + Claude Code
