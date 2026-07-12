# MCP_ARCHITECTURE.md — Kiến trúc Tổng thể MCP Server (Stage 10)

Stage 10 thiết kế **MCP Server** — "trái tim để AI điều khiển MIMIN Platform": cho phép 1 AI Client chuẩn MCP (VD Claude Desktop, Claude Code, hoặc bất kỳ client hỗ trợ Model Context Protocol nào) kết nối trực tiếp vào MIMIN, gọi đúng hạ tầng Tool/Action đã thiết kế ở Stage 8-9, thao tác dữ liệu thật qua Firebase (Stage 5-6).

**Ràng buộc không đổi (kế thừa toàn bộ session)**: chỉ thiết kế kiến trúc — không viết code, không gọi API/Firebase thật, không viết Business Logic, không tạo Automation/kết nối thật.

## 1. Luồng tổng thể (5 tầng)

```
Claude (hoặc AI Client chuẩn MCP bất kỳ)
   │  gửi request theo giao thức MCP (JSON-RPC qua stdio hoặc HTTP/SSE)
   ▼
MCP  ── giao thức chuẩn (Model Context Protocol) — không phải code MIMIN, là tầng
        giao tiếp client↔server dùng chung toàn ngành, MIMIN chỉ triển khai 2 vai:
        MCP Server (expose Tool ra ngoài) và (tuỳ chọn) MCP Client (gọi MCP Server khác)
   ▼
Tool  ── chính là Tool Registry (Stage 8) + Action Registry (Stage 9) đã thiết kế —
         MCP KHÔNG định nghĩa lại Tool, chỉ "phơi bày" (expose) Tool đã có ra ngoài
         qua giao thức chuẩn
   ▼
Firebase  ── packages/database generic helper (Stage 6) — Tool/Action đọc/ghi
             Firestore đúng như đã thiết kế, không đổi cách truy cập dữ liệu
   ▼
MIMIN  ── kết quả cuối cùng: dữ liệu thật/đề xuất thật/hành động thật (qua Approval
          Engine, Stage 9) trên chính nền tảng MIMIN
```

**Nguyên tắc quan trọng nhất**: MCP Server **không phải hạ tầng AI mới** — nó là **1 cổng vào bổ sung** (bên cạnh AI Gateway nội bộ, Stage 7) cho cùng 1 Tool Registry/Action Registry đã thiết kế. Một Tool chỉ cần định nghĩa **1 lần duy nhất** (`TOOL_REGISTRY.md` Stage 8) và tự động khả dụng cho cả AI Agent nội bộ (qua AI Gateway) lẫn AI Client bên ngoài (qua MCP Server) — không định nghĩa 2 lần, không có 2 nguồn sự thật.

## 2. So sánh 2 cổng vào AI hiện có

| | AI Gateway (Stage 7) | MCP Server (Stage 10) |
|---|---|---|
| Ai gọi vào | AI Agent nội bộ MIMIN (`ai_agents`, 24 persona — `AI_FLOW.md` Stage 3) | AI Client bên ngoài chuẩn MCP (Claude Desktop, Claude Code, IDE...) |
| Giao thức | Nội bộ — HTML/App → AI Service Layer → Cloud Function `aiGatewayProxy` | Chuẩn mở MCP (JSON-RPC) — bất kỳ client tuân thủ chuẩn đều kết nối được |
| Model AI dùng | MIMIN tự chọn qua Model Router (`MODEL_ROUTER.md` Stage 7) | Do chính AI Client quyết định (VD Claude tự vận hành, MIMIN không chọn hộ) |
| Tool khả dụng | Tool Registry + Action Registry, lọc theo `allowedTools` của agent | Tool Registry + Action Registry, lọc theo quyền của **phiên MCP** (`MCP_SECURITY.md` mục 2) |
| Dùng khi nào | Chatbot/Agent trong UI MIMIN (`ai-center`, các trang có AI Float) | Người vận hành dùng Claude Desktop/Claude Code để "nói chuyện" trực tiếp với dữ liệu MIMIN, không cần mở UI |

Cả 2 cổng **dùng chung** Tool Registry (Stage 8), Action Registry (Stage 9), Permission/RBAC (Stage 4-5), và `packages/database` (Stage 6) — khác nhau ở **ai gọi vào** và **giao thức**, không khác nhau ở **dữ liệu/hành động khả dụng**.

## 3. Vai trò MCP Server vs MCP Client trong MIMIN

MIMIN đóng **2 vai** tuỳ tình huống (chi tiết `MCP_SERVER.md`/`MCP_CLIENT.md`):

```
Vai 1 — MIMIN là MCP SERVER:
   Claude Desktop/Claude Code (MCP Client) ──► MIMIN MCP Server ──► Tool/Action Registry
   (Người vận hành mở Claude, hỏi "đơn hàng SO-xxx có giao kịp không?" — Claude gọi
    thẳng vào MIMIN qua MCP, không cần mở trình duyệt)

Vai 2 — MIMIN là MCP CLIENT:
   MIMIN AI Gateway (MCP Client) ──► MCP Server của bên thứ 3 (VD 1 dịch vụ ngoài
   có expose MCP Server riêng) ──► dữ liệu/công cụ bên ngoài
   (Tận dụng hệ sinh thái MCP đang phát triển — không phải tự viết adapter cho
    mọi dịch vụ ngoài, nếu dịch vụ đó đã có sẵn MCP Server chuẩn)
```

Vai 2 liên hệ trực tiếp tới Stage 11 (Plugin System) — 1 Plugin tích hợp bên thứ 3 (TikTok/Shopee/Facebook/Google) **có thể** triển khai bằng cách MIMIN đóng vai MCP Client gọi MCP Server của chính bên đó (nếu có), thay vì viết Webhook/API adapter riêng — xem `PLUGIN_SYSTEM.md` mục 5.

## 4. Ánh xạ 10 thành phần yêu cầu vào 5 tài liệu

| Thành phần yêu cầu | Tài liệu |
|---|---|
| MCP Server | [MCP_SERVER.md](MCP_SERVER.md) |
| Session | [MCP_SERVER.md](MCP_SERVER.md) mục 2 |
| Context | [MCP_SERVER.md](MCP_SERVER.md) mục 3 |
| MCP Client | [MCP_CLIENT.md](MCP_CLIENT.md) |
| Multi Workspace | [MCP_CLIENT.md](MCP_CLIENT.md) mục 3 |
| Tool Registry (bản MCP) | [MCP_TOOL_REGISTRY.md](MCP_TOOL_REGISTRY.md) mục 1 |
| Tool Permission | [MCP_TOOL_REGISTRY.md](MCP_TOOL_REGISTRY.md) mục 2 |
| Authentication | [MCP_SECURITY.md](MCP_SECURITY.md) mục 1 |
| Logging | [MCP_SECURITY.md](MCP_SECURITY.md) mục 2 |
| Monitoring | [MCP_SECURITY.md](MCP_SECURITY.md) mục 3 |

## 5. Tham chiếu

- Tool Registry/Tool Calling gốc: [TOOL_REGISTRY.md](TOOL_REGISTRY.md), [TOOL_CALLING.md](TOOL_CALLING.md) (Stage 8)
- Action Registry gốc: [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md) mục 2 (Stage 9)
- AI Gateway gốc: [AI_GATEWAY.md](AI_GATEWAY.md) (Stage 7)
- RBAC/Permission gốc: [AUTHENTICATION.md](AUTHENTICATION.md), [SECURITY_PLAN.md](SECURITY_PLAN.md) (Stage 4-5)
- `packages/database` generic helper: Stage 6
