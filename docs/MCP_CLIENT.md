# MCP_CLIENT.md — Thiết kế MCP Client

MCP Client là bên **khởi tạo kết nối** tới 1 MCP Server. MIMIN liên quan tới MCP Client theo 2 chiều: (a) **AI Client bên ngoài** (Claude Desktop, Claude Code...) đóng vai MCP Client kết nối **vào** MIMIN MCP Server (Stage 10 chính), và (b) **MIMIN tự đóng vai MCP Client** gọi ra MCP Server của bên thứ 3 (liên hệ Stage 11 Plugin System).

## 1. Cấu hình kết nối (chiều AI Client bên ngoài → MIMIN)

Client cấu hình kết nối tới MIMIN MCP Server tương tự cách Claude Desktop cấu hình bất kỳ MCP Server nào (chuẩn ngành, MIMIN không tự sáng tạo định dạng riêng):

```
{
  "mcpServers": {
    "mimin-platform": {
      "url": "https://<mcp-endpoint-that-thuoc-mimin>",
      "transport": "http-sse" | "stdio",
      "auth": { "type": "api_key" | "oauth", "token": "<xem MCP_SECURITY.md muc 1>" }
    }
  }
}
```

## 2. Vòng đời kết nối (Client Lifecycle)

```
1. Client đọc cấu hình (mục 1), mở kết nối tới MCP Server endpoint
2. Handshake "initialize" — Client gửi capability nó hỗ trợ, Server trả capability
   của mình (MCP_SERVER.md mục 4) — 2 bên thống nhất "nói chuyện" được gì
3. Client gọi "listTools" — nhận danh sách Tool khả dụng (đã lọc theo quyền của
   phiên — MCP_TOOL_REGISTRY.md mục 2), hiển thị cho Model (Claude) biết có
   thể dùng Tool gì
4. Model (bên trong Client) quyết định gọi 1 Tool → Client gửi "callTool" request
5. Server xử lý (MCP_SERVER.md), trả kết quả → Client đưa lại vào ngữ cảnh cho
   Model tiếp tục suy luận/trả lời
6. Lặp lại bước 4-5 nếu cần nhiều Tool (multi-tool orchestration — đã có ở
   TOOL_CALLING.md Stage 8 mục 5, không thiết kế lại)
7. Kết thúc phiên — Client đóng kết nối, Server dọn McpSession (MCP_SERVER.md mục 2)
```

## 3. Multi Workspace

1 phiên MCP Client có thể cần thao tác trên **nhiều Workspace khác nhau** trong cùng 1 Organization (8 loại workspace đã chốt — `COLLECTIONS.md` Stage 5 mục A.3) hoặc thậm chí **nhiều Organization** (nếu user có nhiều Membership — `use-current-role.ts` đã có từ trước Stage 5) mà không muốn ngắt kết nối lại mỗi lần đổi phạm vi làm việc:

```
Client gọi Tool đặc biệt "listAvailableWorkspaces" (meta-tool, không thuộc Tool
Registry nghiệp vụ Stage 8 — đây là Tool điều khiển phiên do MCP Server cung cấp
riêng) → trả danh sách { organizationId, organizationName, workspaceId, workspaceType }

Client gọi Tool "switchWorkspace" { organizationId, workspaceId }
   → Server cập nhật McpSession.activeOrganizationId/activeWorkspaceId
   → MỌI lượt gọi Tool SAU đó tự động dùng phạm vi mới — Model không cần tự
     truyền organizationId/workspaceId vào từng Tool call (đúng nguyên tắc
     Context ở MCP_SERVER.md mục 3 — Model không tự khai báo phạm vi tenant)
```

**Ràng buộc bảo mật**: `switchWorkspace` chỉ cho phép chuyển tới Organization/Workspace mà `authenticatedUid` (từ Authentication, `MCP_SECURITY.md` mục 1) thực sự có Membership — không cho phép "nhảy" sang Organization bất kỳ theo yêu cầu tự do của Model (kiểm tra lại đúng RBAC hiện có, không có ngoại lệ cho MCP).

## 4. Chiều ngược lại — MIMIN là MCP Client

Khi 1 Plugin (Stage 11) tích hợp dịch vụ ngoài đã có sẵn MCP Server riêng (VD giả định 1 dịch vụ Logistics ngoài công bố MCP Server chuẩn), MIMIN AI Gateway (Stage 7) có thể đóng vai MCP Client gọi thẳng dịch vụ đó — tái sử dụng đúng vòng đời mục 2 (initialize → listTools → callTool), khác biệt duy nhất là **bên khởi tạo kết nối đổi vai**: lúc này chính MIMIN Cloud Function là Client, dịch vụ ngoài là Server. Thiết kế chi tiết cách 1 Plugin khai báo MCP Server ngoài cần kết nối tới nằm ở `PLUGIN_SYSTEM.md` mục 5 (Stage 11), không lặp lại ở đây.

## 5. Tham chiếu

- Session/Context phía Server: [MCP_SERVER.md](MCP_SERVER.md) mục 2/3
- Multi-tool orchestration: [TOOL_CALLING.md](TOOL_CALLING.md) mục 5 (Stage 8)
- Plugin tích hợp bên ngoài qua MCP: [PLUGIN_SYSTEM.md](PLUGIN_SYSTEM.md) mục 5 (Stage 11)
- RBAC/Membership hiện có: [AUTHENTICATION.md](AUTHENTICATION.md) mục 3 (Stage 4)
