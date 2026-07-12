# MCP_SECURITY.md — Authentication, Logging, Monitoring cho MCP

MCP Server mở ra **1 bề mặt tấn công mới** so với các cổng vào AI trước đó (Stage 7-9 chỉ phục vụ nội bộ MIMIN) — vì bây giờ bất kỳ AI Client bên ngoài nào tuân thủ chuẩn MCP đều **có thể cố kết nối tới**. Tài liệu này thiết kế riêng phần Authentication/Logging/Monitoring, dựa trên nền RBAC/Security đã có (Stage 4-5, 7-8), không phát minh hệ bảo mật riêng.

## 1. Authentication

MCP Client phải xác thực **trước khi** `initialize` thành công (không có chế độ ẩn danh):

| Phương thức | Dùng khi nào | Cơ chế |
|---|---|---|
| **API Key** | Kết nối máy chủ-máy chủ (VD MIMIN AI Gateway tự gọi ra MCP Server khác, hoặc tích hợp CI/script nội bộ) | Key cấp riêng theo `uid`+`organizationId`, lưu Secret Manager (không phải Firestore client đọc được — nhất quán `AI_SECURITY.md` Stage 7 mục 1) |
| **OAuth (Firebase Auth)** | Người dùng thật qua Claude Desktop/Claude Code | Luồng OAuth chuẩn trả về Firebase ID Token — Server xác thực token này đúng cách `packages/auth` đã làm (`getCustomClaims`, Stage 6) |

Sau khi xác thực thành công, Server tạo `McpSession` (`MCP_SERVER.md` mục 2) với `authenticatedUid` tương ứng — **không có khái niệm "session không gắn user"**, mọi hành động qua MCP đều truy vết được về đúng 1 con người/hệ thống cụ thể.

**Không dùng lại API Key Provider AI (OpenAI/Claude...) làm cơ chế xác thực MCP** — 2 khái niệm khác nhau: API key Provider AI dùng để MIMIN gọi model (`AI_PROVIDER.md` Stage 7 mục 4), còn Authentication ở đây là để **xác thực Client đang kết nối vào MIMIN**, không liên quan tới nhà cung cấp model nào.

## 2. Logging

Mọi lượt gọi qua MCP Server (`initialize`, `listTools`, `callTool`, `switchWorkspace`...) ghi vào `activity_logs`/`usage_logs` (Stage 5) — **tái sử dụng đúng collection audit đã có**, thêm 1 giá trị mới cho field `actorType` (đã có ở `activity_logs`, Stage 5): `"mcp_client"` (bên cạnh `user`/`system`/`ai` đã có) — phân biệt rõ hành động này tới từ 1 AI Client bên ngoài qua MCP, không phải từ UI MIMIN hay AI Agent nội bộ.

```
activity_logs entry (khi có lượt callTool qua MCP):
  actorUid: <McpSession.authenticatedUid>
  actorType: "mcp_client"
  action: "mcp_call_tool"
  targetCollection/targetId: <theo sourceCollections của Tool được gọi>
  metadata: { toolName, mcpSessionId, arguments (đã lọc field nhạy cảm nếu có) }
```

## 3. Monitoring

Nối tiếp Cost Control (`AI_SECURITY.md` Stage 7 mục 5) và Rate Limiting (`TOOL_SECURITY.md` Stage 8 mục 7) — MCP Server cần thêm các chỉ số giám sát riêng do đặc thù "kết nối dài" (session có thể mở nhiều giờ, khác request AI Gateway thường ngắn hạn):

| Chỉ số | Mục đích |
|---|---|
| Số `McpSession` đang mở đồng thời (theo Organization) | Phát hiện bất thường (VD 1 Organization đột nhiên có quá nhiều phiên mở cùng lúc — dấu hiệu rò rỉ credential) |
| Tỷ lệ `callTool` bị từ chối (denied) trên tổng số gọi | Giống chỉ số đã có ở `TOOL_SECURITY.md` mục 6, nay tách riêng theo `actorType = "mcp_client"` để so sánh với tỷ lệ từ chối của AI Agent nội bộ |
| Thời gian phản hồi trung bình mỗi Tool qua MCP | Phát hiện Tool nào chậm bất thường khi gọi qua MCP (khác AI Gateway nội bộ do thêm 1 tầng dịch giao thức, mục tiêu là tầng dịch này không làm chậm đáng kể) |
| Phiên bị ngắt kết nối bất thường (không qua bước đóng phiên chuẩn) | Dấu hiệu lỗi mạng/tấn công/Client bị crash — cần dọn `McpSession` mồ côi định kỳ |

Toàn bộ chỉ số trên tính từ dữ liệu đã ghi ở mục 2 (`activity_logs`/`usage_logs` lọc `actorType = "mcp_client"`) — **không cần hạ tầng giám sát riêng**, tái sử dụng đúng nguồn dữ liệu đã có, chỉ thêm góc nhìn báo cáo (Report Flow, Stage 3) riêng cho lưu lượng MCP.

## 4. Tham chiếu

- RBAC/Custom Claims gốc: [AUTHENTICATION.md](AUTHENTICATION.md) (Stage 4), `getCustomClaims` (Stage 6)
- Bảo mật API key Provider AI (khác Authentication MCP): [AI_PROVIDER.md](AI_PROVIDER.md) mục 4 (Stage 7)
- Audit logging gốc: [TOOL_SECURITY.md](TOOL_SECURITY.md) mục 6 (Stage 8), [COLLECTIONS.md](COLLECTIONS.md) mục A.8 (`activity_logs`)
- Session MCP: [MCP_SERVER.md](MCP_SERVER.md) mục 2
