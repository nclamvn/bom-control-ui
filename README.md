# Bờm 👻

**AI agent nói tiếng Việt** — xây dựng bằng Vibecode Kit trên nền tảng [OpenClaw](https://github.com/openclaw/openclaw).

> *"Con ma trong máy — ngơ ngơ mà biết việc."*

---

## Vibecode Kit

Dự án này được xây dựng bằng **Vibecode** — phương pháp chia vai giữa hai Claude để đạt chất lượng cao nhất:

```
┌─────────────────┐     Blueprint.json     ┌─────────────────┐
│  Claude Chat     │ ──────────────────────→│  Claude Code     │
│  (Architect)     │                        │  (Builder)       │
│                  │                        │                  │
│  Thiết kế        │                        │  Thực thi        │
│  Suy nghĩ sâu   │                        │  Build nhanh     │
│  claude.ai       │                        │  Terminal/CLI    │
└─────────────────┘                        └─────────────────┘
```

**Tại sao tách?** Claude Chat và Claude Code có system prompts khác biệt cơ bản. Gộp vai = role-playing trên prompt không phù hợp = chất lượng thấp. Vibecode khai thác sự khác biệt thay vì chống lại nó.

### Quy trình 3 bước

1. **Architect** — Mở [claude.ai](https://claude.ai), mô tả ý tưởng → nhận `Blueprint.json`
2. **Builder** — Paste Blueprint vào Claude Code → `/build execute`
3. **Verify** — `/build verify` → kiểm tra chất lượng

---

## Thành phần

### [bom-control-ui/](./bom-control-ui/)

Giao diện web điều khiển OpenClaw Gateway:

- **Chat** trực tiếp với AI (Anthropic, OpenAI, Google)
- **Tiếng Việt** — giao diện mặc định tiếng Việt, song ngữ Việt/Anh
- **API Key Banner** — nhập key ngay trên UI, lưu thẳng vào gateway
- **Quản lý kênh** — WhatsApp, Telegram, Discord, Nostr
- **Auto-reconnect** — tự kết nối lại WebSocket

Stack: LitElement + Vite + TypeScript + Vanilla CSS

### Workspace Files

| File | Mục đích |
|------|----------|
| `IDENTITY.md` | Nhân dạng Bờm — tên, vibe, emoji |
| `SOUL.md` | Tính cách, giọng nói, nguyên tắc |
| `AGENTS.md` | Hướng dẫn vận hành cho AI agent |
| `USER.md` | Thông tin người dùng (template) |
| `memory/` | Bộ nhớ liên phiên — Bờm nhớ qua các session |

---

## Tiếng Việt First

Bờm được thiết kế **ưu tiên tiếng Việt** từ đầu:

- Giao diện mặc định tiếng Việt
- AI personality nói tiếng Việt tự nhiên
- Toàn bộ quy trình phát triển bằng tiếng Việt
- Workspace docs song ngữ

Đây là một trong những dự án AI agent đầu tiên được xây dựng **bởi người Việt, cho người Việt**, sử dụng hoàn toàn Claude (Anthropic) với phương pháp Vibecode.

---

## Bắt đầu

```bash
git clone https://github.com/nclamvn/bom-control-ui.git
cd bom-control-ui/bom-control-ui

pnpm install
pnpm dev
```

Cần OpenClaw Gateway chạy tại `ws://127.0.0.1:18789`.

Chi tiết setup: xem [bom-control-ui/README.md](./bom-control-ui/README.md).

---

## Giấy phép

MIT License

---

**Bờm** 👻 — *Built with Vibecode Kit + Claude Code*
