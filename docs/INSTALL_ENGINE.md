# INSTALL_ENGINE.md — Thiết kế Install Engine

Install Engine thực thi bước "Install" trong sơ đồ `MARKETPLACE.md` mục 3 — nhận 1 vật phẩm Marketplace + đích đến (Organization/Workspace), tạo ra 1 bản sao hoạt động được, gắn đúng phạm vi tenant.

## 1. Quy tắc chung: Sao chép (Copy-on-Install)

Nhắc lại nguyên tắc `MARKETPLACE.md` mục 4 — mọi loại vật phẩm khi cài đều tạo **document mới**, không tham chiếu ngược bản gốc:

```
InstallRequest {
  marketplaceItemType: "ai_agent" | "workflow" | "theme" | "plugin" | "template" | "prompt" | "dashboard"
  sourceItemId: string          // id bản gốc trên Marketplace (federated view, MARKETPLACE.md mục 1)
  targetOrganizationId: string
  targetWorkspaceId: string
  installedBy: string           // uid
}
```

## 2. Luồng cài đặt theo từng loại (7 nhánh cụ thể)

| Loại | Việc Install Engine làm |
|---|---|
| **AI Agent** | Đọc `ai_agents/{sourceItemId}` (bản gốc, `organizationId == null`) → tạo `ai_agents` document mới với `organizationId = targetOrganizationId`, copy nguyên `systemPrompt`/`moduleSlug`, `isActive = true` |
| **Workflow** | Đọc `workflows/{sourceItemId}` (`isTemplate == true` — field đề xuất, `MARKETPLACE.md` mục 1) → tạo `workflows` mới với `organizationId`/`workspaceId` đích, `isActive = false` mặc định (an toàn — Owner/Admin tự bật, nhất quán nguyên tắc "deny by default" đã dùng xuyên suốt từ `TOOL_SECURITY.md` Stage 8) |
| **Theme** | Đọc `themes/{sourceItemId}` (bản mặc định nền tảng) → tạo `themes` mới gắn `organizationId` đích, cho phép Organization tự chỉnh `primaryColor`/`logoFileId` sau đó |
| **Plugin** | Kích hoạt **Plugin Lifecycle** (`PLUGIN_SYSTEM.md` mục 4) — không phải "sao chép document" như 6 loại còn lại, mà là chuỗi `Installing → Installed, Disabled` — xem mục 3 (khác biệt cần nêu rõ) |
| **Template** | Tuỳ dạng con (`MARKETPLACE.md` mục 2): Template văn bản đi theo nhánh "Prompt", Template giao diện đi theo nhánh "Dashboard" |
| **Prompt** | Đọc `prompts/{sourceItemId}` (`isShared == true`) → tạo `prompts` mới gắn `organizationId` đích, `version = 1`, `isActive = true`, `isShared = false` (bản sao riêng, không tự động lại là "dùng chung") |
| **Dashboard** | Đọc `pages/{sourceItemId}` + `components` liên quan → tạo `pages` mới (nếu kiến trúc SYSTEM cho phép bản sao theo Organization — xem ghi chú mở `MARKETPLACE.md` mục 1, cột Dashboard) |

## 3. Trường hợp đặc biệt: Plugin không "sao chép", mà "kích hoạt vòng đời"

6 loại còn lại là **dữ liệu tĩnh** (copy xong là dùng được ngay). Plugin khác biệt vì nó có **hành vi** (Lifecycle Hooks, `PLUGIN_SDK.md` mục 2) cần chạy đúng thứ tự:

```
Install Engine nhận InstallRequest { marketplaceItemType: "plugin", sourceItemId }
   → Tải PluginManifest (nguồn theo phương án đã chọn — MARKETPLACE.md mục 5)
   → Hiển thị requiredPermissions cho installedBy xác nhận (PLUGIN_SYSTEM.md mục 6)
   → Xác nhận xong → gọi hook onInstall(context) (PLUGIN_SDK.md mục 2)
   → Trạng thái "Installed, Disabled" — CHƯA "Ready" như 6 loại kia
   → Owner/Admin phải chủ động "Enable" thêm 1 bước nữa (PLUGIN_SYSTEM.md mục 4)
     mới thực sự Ready — vì Plugin có thể đóng góp Tool/Action có quyền ghi
     dữ liệu (Stage 9 Action Registry), cần bước xác nhận tách biệt rõ ràng
     hơn 6 loại vật phẩm thụ động còn lại
```

## 4. Gắn vào Workspace — nhắc lại field bắt buộc

Mọi document mới tạo ở mục 2 đều tuân thủ `FIELD_STANDARD.md` (Stage 5) mục 3 — `organizationId`/`workspaceId` bắt buộc theo đúng `targetOrganizationId`/`targetWorkspaceId` của `InstallRequest`, `createdBy = installedBy`. Install Engine **không tự suy đoán** Workspace đích nếu `InstallRequest` không chỉ định rõ — người dùng luôn phải xác nhận "cài vào Workspace nào" trước khi bấm Install cuối cùng (đặc biệt quan trọng với Organization có nhiều Workspace — `COLLECTIONS.md` Stage 5 mục A.3).

## 5. Ghi log

Mỗi lượt Install ghi 1 `activity_logs` (Stage 5) — `{ actorUid: installedBy, action: "marketplace_install", targetCollection, targetId: <document mới tạo>, metadata: { marketplaceItemType, sourceItemId } }` — tái sử dụng đúng audit log chung, nhất quán cách Stage 8-10 đã ghi log Tool/MCP.

## 6. Tham chiếu

- Sơ đồ tổng thể + nguyên tắc Sao chép: [MARKETPLACE.md](MARKETPLACE.md)
- Plugin Lifecycle chi tiết: [PLUGIN_SYSTEM.md](PLUGIN_SYSTEM.md) mục 4, [PLUGIN_SDK.md](PLUGIN_SDK.md) mục 2
- Field bắt buộc: [FIELD_STANDARD.md](FIELD_STANDARD.md) mục 3 (Stage 5)
