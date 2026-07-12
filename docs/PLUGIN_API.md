# PLUGIN_API.md — Bề mặt API dành cho Plugin

Đây là **toàn bộ** những gì code Plugin được phép gọi — 1 tập con hẹp, có kiểm soát, của năng lực MIMIN (khác `packages/database` generic helper nội bộ — Stage 6 — vốn không giới hạn cho code lõi). Nếu 1 thao tác không nằm trong danh sách dưới đây, Plugin **không thể thực hiện được**, dù có cố viết code thế nào.

## 1. Nhóm API Dữ liệu (Data API)

| Hàm (khái niệm) | Tương đương nội bộ | Giới hạn |
|---|---|---|
| `plugin.data.read(collectionName, scope, filter)` | `listScoped`/`getScopedDoc` (Stage 6) | Chỉ đọc được collection nằm trong `requiredPermissions` đã khai báo (`PLUGIN_SYSTEM.md` mục 3/6) — `organizationId` luôn tự động tiêm từ `context` (mục 2 `PLUGIN_SDK.md`), Plugin không tự truyền |
| `plugin.data.write(collectionName, data)` | `createScopedDoc`/`updateScopedDoc` (Stage 6) | Chỉ ghi được vào collection có `action: "create"/"update"` trong `requiredPermissions`; luôn phải qua Action Registry nếu `requiresApproval = true` (không có đường tắt ghi thẳng bỏ qua Approval Engine) |

## 2. Nhóm API Đăng ký (Registration API)

| Hàm (khái niệm) | Dùng khi nào |
|---|---|
| `plugin.register.tool(toolDefinition)` | Trong `onEnable` (`PLUGIN_SDK.md` mục 2) — thêm Tool mới vào Tool Registry (Stage 8) |
| `plugin.register.action(actionDefinition)` | Tương tự, thêm Action vào Action Registry (Stage 9) |
| `plugin.register.workflow(workflowTemplate)` | Cài sẵn 1 Workflow mẫu (Stage 9) cho Organization, `isActive` mặc định `false` — Owner/Admin tự bật |
| `plugin.register.menuItem(menuItem)` | Thêm mục điều hướng mới (`menus`, Stage 5 SYSTEM) |
| `plugin.unregister.*` | Gọi trong `onDisable`/`onUninstall` — gỡ đúng những gì đã đăng ký, không hơn không kém |

## 3. Nhóm API Thông báo & Workflow (Notification/Workflow API)

| Hàm (khái niệm) | Tương đương nội bộ |
|---|---|
| `plugin.notify(request)` | `NotificationRequest` (`NOTIFICATION_ENGINE.md` mục 3, Stage 9) — Plugin gửi thông báo qua đúng 8 kênh đã thiết kế, không tự viết tích hợp Slack/Email riêng |
| `plugin.triggerWorkflow(workflowId, context)` | Kích hoạt 1 Workflow đã cài (`trigger.type = "event"`, `AUTOMATION_ENGINE.md` mục 1) — Plugin không tự chạy logic nhiều bước riêng, phải đi qua Workflow Engine (Stage 9) để mọi bước đều được ghi log/audit thống nhất |

## 4. Nhóm API Tích hợp ngoài (External Integration API) — chỉ nhóm Plugin Tích hợp

| Hàm (khái niệm) | Dùng khi nào |
|---|---|
| `plugin.webhook.registerEndpoint(config)` | Khai báo 1 Incoming Webhook Endpoint mới (`WEBHOOK_ENGINE.md` mục 1, Stage 9) — VD Shopee Plugin đăng ký endpoint nhận sự kiện đơn hàng mới |
| `plugin.mcp.connect(mcpServerConfig)` | Nếu Plugin dùng cơ chế MCP Client (`MCP_CLIENT.md` mục 4, Stage 10) để gọi MCP Server của bên thứ 3 |

## 5. Những gì Plugin KHÔNG BAO GIỜ được gọi trực tiếp

- `packages/database` generic helper nội bộ (Stage 6) — chỉ qua `plugin.data.*` (mục 1).
- `packages/auth`/custom claims — Plugin không tự đọc/sửa quyền của bất kỳ ai.
- Firestore Security Rules/Admin SDK — không có "chế độ nâng cao" cho Plugin.
- Bất kỳ collection nào ngoài `requiredPermissions` đã khai báo — kể cả khi kỹ thuật có thể gọi được, tầng kiểm tra quyền (giống `TOOL_SECURITY.md` Stage 8 mục 1) vẫn chặn ở runtime, không chỉ chặn ở bước duyệt cài đặt.

## 6. Tham chiếu

- Plugin SDK/Lifecycle: [PLUGIN_SDK.md](PLUGIN_SDK.md)
- Permission Plugin xin trước khi cài: [PLUGIN_SYSTEM.md](PLUGIN_SYSTEM.md) mục 6
- Generic helper nội bộ (Plugin KHÔNG được gọi thẳng): Stage 6
- Notification/Workflow gốc: [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md), [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md) (Stage 9)
