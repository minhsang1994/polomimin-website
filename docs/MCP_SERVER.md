# MCP_SERVER.md — Thiết kế MCP Server

MCP Server là điểm cuối MIMIN triển khai để **phơi bày** Tool Registry (Stage 8) + Action Registry (Stage 9) ra ngoài theo giao thức Model Context Protocol — cho phép AI Client chuẩn MCP kết nối và điều khiển MIMIN.

## 1. Vị trí triển khai

MCP Server là **1 tầng mỏng bọc quanh Cloud Function `aiGatewayProxy`** (đã đặt tên `FUNCTIONS_PLAN.md` Stage 4) — không phải hạ tầng chạy riêng biệt hoàn toàn tách khỏi Cloud Functions đã có, để tránh nhân đôi cơ chế xác thực/ghi log:

```
MCP Client ──(JSON-RPC qua HTTP/SSE)──► MCP Server endpoint (Cloud Function riêng,
                                          VD `mcpServerEndpoint`, đặt cạnh
                                          `aiGatewayProxy` — FUNCTIONS_PLAN.md)
                                              │
                                              ▼
                                    Dịch request MCP ──► gọi lại đúng Tool
                                    Registry/Action Registry (Stage 8/9) —
                                    KHÔNG viết logic Tool riêng cho MCP
```

**Transport**: 2 chế độ, tuỳ ngữ cảnh dùng:
- **stdio** — khi MCP Client chạy cục bộ cạnh máy người vận hành (VD Claude Desktop) và có thể spawn 1 tiến trình MCP Server cục bộ kết nối ngược về Cloud Function qua HTTP nội bộ (bản thân giao tiếp Client↔Server-cục-bộ là stdio, Server-cục-bộ↔MIMIN là HTTPS).
- **HTTP/SSE** — khi MCP Client kết nối thẳng qua mạng (không cần tiến trình trung gian cục bộ) — phù hợp Claude Code/tích hợp máy chủ-máy chủ.

## 2. Session

1 phiên kết nối MCP (từ lúc Client "initialize" tới lúc ngắt kết nối) mang trạng thái:

```
McpSession {
  sessionId: string
  authenticatedUid: string          // xác định qua Authentication (MCP_SECURITY.md mục 1)
  activeOrganizationId: string      // Organization đang thao tác trong phiên này
  activeWorkspaceId: string | null  // Workspace hiện tại (Multi Workspace — MCP_CLIENT.md mục 3)
  connectedAt: number
  lastActivityAt: number
  capabilities: { tools: boolean, resources: boolean, prompts: boolean }  // MCP capability negotiation
}
```

- Session **hết hạn** sau N phút không hoạt động (giống session HTTP thông thường) — không giữ kết nối treo vô thời hạn.
- Đổi `activeOrganizationId`/`activeWorkspaceId` giữa phiên **không cần ngắt kết nối lại** — Client gọi 1 "meta-tool" riêng (VD `switchWorkspace`) để cập nhật Session, các lượt gọi Tool sau đó tự dùng ngữ cảnh mới (`MCP_CLIENT.md` mục 3).

## 3. Context

Mỗi lượt gọi Tool qua MCP đều tiêm kèm **Context** — dữ liệu nền không do Model tự khai, giống hệt nguyên tắc `organizationId` không lấy từ `arguments` Model tự sinh đã chốt ở `TOOL_SECURITY.md` (Stage 8 mục 5):

```
ToolInvocationContext {
  organizationId: string     // luôn lấy từ McpSession.activeOrganizationId, KHÔNG từ arguments
  workspaceId: string | null // tương tự, từ McpSession.activeWorkspaceId
  uid: string                // từ McpSession.authenticatedUid
  source: "mcp"               // đánh dấu request tới từ MCP (phân biệt với AI Gateway nội bộ
                              // khi ghi usage_logs/activity_logs — MCP_SECURITY.md mục 2)
}
```

Context được Gateway (dùng lại đúng `aiGatewayProxy`, mục 1) hợp nhất với lời gọi Tool trước khi chuyển tiếp vào Tool Registry (Stage 8) — Tool Definition không cần biết request tới từ MCP hay từ AI Gateway nội bộ, giao diện gọi Tool giống hệt nhau (đúng nguyên tắc trừu tượng hoá đã áp dụng nhất quán từ `AI_PROVIDER.md` Stage 7).

## 4. Danh sách "capability" MCP Server công bố

Theo chuẩn MCP, Server công bố mình hỗ trợ gì khi Client "initialize":

| Capability | MIMIN hỗ trợ | Ánh xạ nội bộ |
|---|---|---|
| `tools` | ✅ | Tool Registry (Stage 8) + Action Registry (Stage 9) |
| `resources` | ✅ (chỉ đọc) | Cho phép Client "duyệt" dữ liệu dạng tài liệu tĩnh — VD Knowledge Base (Loại A, `KNOWLEDGE_ARCHITECTURE.md` Stage 7 mục 2) phơi ra dạng MCP Resource thay vì Tool |
| `prompts` | ✅ | Prompt Template dùng chung (`PROMPT_ENGINE.md` Stage 7, các `prompts.isShared = true`) phơi ra để Client tái sử dụng |

## 5. Tham chiếu

- Tool/Action Registry gốc: [TOOL_REGISTRY.md](TOOL_REGISTRY.md) (Stage 8), [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md) mục 2 (Stage 9)
- Cloud Function `aiGatewayProxy`: [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md) mục 3 (Stage 4)
- Authentication phiên MCP: [MCP_SECURITY.md](MCP_SECURITY.md) mục 1
- MCP Client & Multi Workspace: [MCP_CLIENT.md](MCP_CLIENT.md)
