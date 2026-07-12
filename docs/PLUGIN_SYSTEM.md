# PLUGIN_SYSTEM.md — Kiến trúc Tổng thể Plugin System (Stage 11)

Stage 11 biến MIMIN thành **nền tảng mở rộng được** — 1 Plugin là 1 gói đóng gói có thể **thêm** Tool (Stage 8)/Action (Stage 9)/Workflow (Stage 9)/AI Agent (Stage 5)/Menu (Stage 5, SYSTEM) vào 1 Organization mà **không cần sửa code lõi MIMIN**.

**Ràng buộc không đổi**: chỉ thiết kế kiến trúc — không viết code, không gọi API/Firebase thật, không viết Business Logic.

## 1. Plugin là gì trong bối cảnh MIMIN

1 Plugin **không phải** 1 module trong 16 module chính thức (`MODULES[]`, `packages/core`) — Plugin là đơn vị **cài thêm được, theo yêu cầu**, khác biệt căn bản: module chính thức do đội MIMIN phát triển/deploy, Plugin có thể do bên thứ 3 phát triển và Organization tự chọn cài hay không (giống mô hình Extension của Chrome/VSCode, hay App của Slack).

## 2. 3 nhóm Plugin (theo ví dụ yêu cầu)

| Nhóm | Ví dụ | Plugin làm gì |
|---|---|---|
| **Mở rộng Module nội bộ** | CRM Plugin, Factory Plugin | Thêm Tool/Workflow/Menu chuyên sâu hơn cho 1 module đã có sẵn (VD CRM Plugin thêm kịch bản chấm điểm Lead tự động — mà module CRM gốc chưa có sẵn) |
| **Tích hợp nền tảng ngoài** | TikTok/Shopee/Facebook/Google Plugin | Kết nối API bên thứ 3 — đồng bộ đơn hàng Shopee vào `orders`, đồng bộ quảng cáo Facebook/Google Ads vào báo cáo Marketing — dùng Webhook Engine (Stage 9) hoặc MCP Client (Stage 10 mục 4) làm cơ chế giao tiếp |
| **Mở rộng theo chiều dọc (Vertical)** | ERP Plugin, Accounting Plugin, AI Plugin | Bổ sung tính năng chuyên ngành sâu (VD kết nối phần mềm kế toán MISA/Fast có sẵn của khách hàng, thay vì dùng `finance` gốc của MIMIN) hoặc bổ sung AI Agent persona mới (AI Plugin) |

## 3. Plugin Manifest

Mọi Plugin bắt buộc có 1 tệp khai báo (không phải code) mô tả plugin trước khi cài:

```
PluginManifest {
  pluginId: string            // duy nhất toàn Marketplace (Stage 12), VD "mimin.shopee-connector"
  name: string
  version: string             // semver, VD "1.2.0"
  publisher: string           // MIMIN chính thức hay bên thứ 3
  category: "module_extension" | "external_integration" | "vertical_extension"
  description: string
  requiredPermissions: array<{ resource, action }>   // xin quyền TRƯỚC khi cài (mục 5)
  contributes: {                                      // Plugin "đóng góp" gì vào hệ thống
      tools?: array<ToolDefinition>                   // đăng ký thêm Tool (Stage 8)
      actions?: array<ActionDefinition>                // đăng ký thêm Action (Stage 9)
      workflows?: array<WorkflowTemplate>               // Workflow mẫu cài sẵn (Stage 9)
      aiAgents?: array<AiAgentTemplate>                  // AI Agent persona mới (Stage 5 ai_agents)
      menuItems?: array<MenuItem>                        // mục menu mới (Stage 5 SYSTEM menus)
  }
  externalConnections?: array<{ type: "webhook" | "mcp_client", config }>  // nếu là nhóm Tích hợp ngoài
}
```

`pluginId` là khoá định danh xuyên suốt — không phải Document ID Firestore (theo đúng nguyên tắc Business Code tách biệt Document ID, `ID_STANDARD.md` Stage 5 mục 3).

## 4. Plugin Lifecycle

```
Discovered (xuất hiện trên Marketplace, Stage 12 — chưa cài)
   │  Organization bấm "Install"
   ▼
Installing (đang xử lý — kiểm tra requiredPermissions, tải Manifest)
   │
   ▼
Installed, Disabled (đã cài nhưng CHƯA bật — mặc định an toàn, không tự động
   │                  chạy ngay khi vừa cài, đúng nguyên tắc "deny by default"
   │                  đã áp dụng ở TOOL_SECURITY.md Stage 8 mục 2)
   │  Owner/Admin xác nhận bật + cấp quyền yêu cầu
   ▼
Enabled (Tool/Action/Workflow/AI Agent/Menu trong `contributes` chính thức có
   │      hiệu lực trong Organization)
   │
   ├──► Disabled (tạm tắt — Tool/Action ẩn đi, không xoá cấu hình)
   │
   ├──► Updating (khi có version Manifest mới — cần xác nhận lại Permission
   │              nếu version mới xin thêm quyền)
   │
   └──► Uninstalled (gỡ hẳn — xoá mọi Tool/Action/Workflow/Menu đã đăng ký,
                      KHÔNG xoá dữ liệu nghiệp vụ Plugin đã tạo ra trước đó,
                      VD đơn hàng đồng bộ từ Shopee vẫn còn trong `orders`)
```

## 5. Tích hợp bên ngoài — 2 cơ chế khả dụng

Nhóm "Tích hợp nền tảng ngoài" (TikTok/Shopee/Facebook/Google) chọn 1 trong 2 cơ chế đã có sẵn, không phát minh cơ chế thứ 3:

| Cơ chế | Dùng khi |
|---|---|
| **Webhook** (`WEBHOOK_ENGINE.md`, Stage 9) | Nền tảng ngoài hỗ trợ gọi Webhook (hầu hết Shopee/TikTok Shop/Facebook đều có Webhook sự kiện) — Plugin khai báo `externalConnections: [{ type: "webhook", config: { sourceSystem, webhookEndpointId } }]` |
| **MCP Client** (`MCP_CLIENT.md` mục 4, Stage 10) | Nền tảng ngoài đã tự công bố MCP Server chuẩn (hiếm hơn ở giai đoạn hiện tại, nhưng là hướng tương lai khi hệ sinh thái MCP phát triển) |

## 6. Permission — Plugin xin quyền như 1 "app ngoài" xin OAuth

`requiredPermissions` (mục 3) hiển thị cho `owner`/`admin` xem **trước khi** bấm "Enable" (mục 4) — dùng đúng `Permission { resource, action }` đã có (không tạo hệ quyền riêng cho Plugin, nhất quán triết lý xuyên suốt từ Stage 4 tới Stage 10). Plugin **không bao giờ** tự động có quyền vượt quá những gì `requiredPermissions` đã khai báo và được xác nhận — nếu Plugin cố gọi Tool/Action ngoài phạm vi đã xin quyền, bị chặn giống hệt cơ chế `TOOL_SECURITY.md` Stage 8 mục 1 (RBAC không có ngoại lệ cho Plugin).

## 7. Marketplace Support

Plugin là 1 trong 7 loại vật phẩm Marketplace (`MARKETPLACE.md` Stage 12 mục 1) — `PluginManifest` (mục 3) chính là dữ liệu hiển thị trên trang chi tiết Plugin ở Marketplace, và Plugin Lifecycle (mục 4) chính là quy trình chạy phía sau nút "Install" của Marketplace (`INSTALL_ENGINE.md` Stage 12 mục 2). Stage 11 không thiết kế lại UI/luồng duyệt Marketplace — chỉ đảm bảo Plugin có đủ dữ liệu (Manifest) để Marketplace tiêu thụ.

## 8. Tham chiếu

- Plugin SDK (dành cho lập trình viên viết Plugin): [PLUGIN_SDK.md](PLUGIN_SDK.md)
- API bề mặt Plugin được gọi: [PLUGIN_API.md](PLUGIN_API.md)
- Tool/Action Registry gốc: [TOOL_REGISTRY.md](TOOL_REGISTRY.md) (Stage 8), [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md) mục 2 (Stage 9)
- Webhook/MCP Client: [WEBHOOK_ENGINE.md](WEBHOOK_ENGINE.md) (Stage 9), [MCP_CLIENT.md](MCP_CLIENT.md) mục 4 (Stage 10)
- Marketplace: [MARKETPLACE.md](MARKETPLACE.md) (Stage 12)
