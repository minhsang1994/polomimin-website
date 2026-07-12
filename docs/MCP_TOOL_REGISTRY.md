# MCP_TOOL_REGISTRY.md — Tool Registry & Tool Permission qua MCP

Tài liệu này chỉ đặc tả **lớp dịch (adapter)** giữa Tool Registry/Action Registry nội bộ (Stage 8-9) và định dạng MCP chuẩn — **không định nghĩa lại** bất kỳ Tool nào (danh mục Tool vẫn là `TOOL_REGISTRY.md`, không có Tool "riêng cho MCP").

## 1. Dịch `ToolDefinition` (Stage 8) sang MCP Tool Schema

MCP yêu cầu mỗi Tool công bố theo JSON Schema chuẩn. Bảng dịch trực tiếp, không mất thông tin:

| `ToolDefinition` (Stage 8, `TOOL_CALLING.md` mục 1) | MCP Tool Schema |
|---|---|
| `name` | `name` |
| `description` | `description` |
| `inputSchema` | `inputSchema` (dịch kiểu dữ liệu nội bộ `string/number/boolean/array/map` sang JSON Schema type tương ứng) |
| `outputSchema` | Không có trường MCP chuẩn tương đương — mô tả thêm trong `description` hoặc trả qua nội dung response mẫu |
| `requiredPermission` | **Không phơi ra ngoài** cho Client thấy — chỉ dùng nội bộ để Server tự lọc danh sách trả về (mục 2), Client không cần biết chi tiết Permission, chỉ thấy Tool nào **có mặt hay không** trong danh sách |
| `sourceCollections` | Không phơi ra ngoài (chi tiết triển khai nội bộ, không phải hợp đồng với Client) |
| `isEnabled` | Tool `isEnabled=false` không xuất hiện trong `listTools` (ẩn hẳn, không trả về ở trạng thái "disabled") |

Action Registry (Stage 9, `AUTOMATION_ENGINE.md` mục 2) dịch tương tự, thêm 1 điểm khác biệt: `ActionDefinition.requiresApproval = true` được phản ánh rõ trong `description` MCP (VD tự động thêm hậu tố "— hành động này sẽ tạo 1 đề xuất chờ duyệt, KHÔNG thực thi ngay") để Model (Claude) hiểu đúng kỳ vọng, tránh trả lời sai kiểu "đã thực hiện xong" khi thực chất mới là đề xuất.

## 2. Tool Permission — lọc danh sách theo phiên (không đổi cơ chế, chỉ đổi điểm áp dụng)

Khi Client gọi `listTools` (`MCP_CLIENT.md` mục 2, bước 3), Server trả về **danh sách đã lọc sẵn** theo đúng 2 lớp lọc đã có (`TOOL_CALLING.md` Stage 8 mục 3 — Tool Routing, và `TOOL_SECURITY.md` mục 1/2 — Permission + whitelist), áp dụng cho `McpSession` hiện tại thay vì cho 1 `agentId` nội bộ:

```
Danh sách Tool trả cho MCP Client
   = Tool có requiredPermission mà uid (McpSession.authenticatedUid) ĐANG CÓ
     trong Organization/Workspace hiện tại (McpSession.activeOrganizationId/
     activeWorkspaceId)
   − Tool bị tắt (isEnabled = false)
```

**Không có whitelist riêng theo "MCP Agent"** như whitelist theo `agentId` nội bộ (`TOOL_SECURITY.md` mục 2) — vì phiên MCP đại diện trực tiếp 1 **con người thật** (`authenticatedUid`) đã đăng nhập, không phải 1 AI Agent persona giả lập — nên chỉ cần lọc theo RBAC của chính người đó là đủ, không cần thêm 1 tầng whitelist Agent phía trên.

## 3. Cập nhật động khi Tool Registry đổi

Registry (`TOOL_REGISTRY.md`) và Action Registry (`AUTOMATION_ENGINE.md` mục 2) có thể thay đổi theo thời gian (thêm Tool mới, tắt Tool cũ, hoặc do cài Plugin mới — Stage 11 bổ sung Tool động). MCP Server hỗ trợ cơ chế MCP chuẩn `notifications/tools/list_changed` — báo cho Client biết cần gọi lại `listTools` để cập nhật danh sách, thay vì Client phải tự đoán/polling liên tục.

## 4. Tham chiếu

- Danh mục Tool gốc: [TOOL_REGISTRY.md](TOOL_REGISTRY.md) (Stage 8)
- Action Registry gốc: [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md) mục 2 (Stage 9)
- Permission/Whitelist gốc: [TOOL_SECURITY.md](TOOL_SECURITY.md) mục 1/2 (Stage 8)
- Session mang `activeOrganizationId`/`activeWorkspaceId`: [MCP_SERVER.md](MCP_SERVER.md) mục 2
