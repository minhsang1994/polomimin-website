# PLUGIN_SDK.md — Thiết kế Plugin SDK

Plugin SDK là bộ công cụ 1 lập trình viên (nội bộ MIMIN hoặc bên thứ 3) dùng để **viết** 1 Plugin — đề xuất `packages/plugin-sdk` (workspace package mới, chỉ thiết kế, chưa tạo).

## 1. Cấu trúc 1 Plugin (thư mục nguồn, trước khi đóng gói)

```
my-plugin/
├── manifest.json        # đúng PluginManifest schema — PLUGIN_SYSTEM.md mục 3
├── src/
│   ├── tools/            # định nghĩa Tool mới (nếu contributes.tools khai báo)
│   ├── actions/          # định nghĩa Action mới (nếu contributes.actions khai báo)
│   ├── workflows/         # Workflow mẫu (nếu contributes.workflows khai báo)
│   ├── agents/             # AI Agent persona mới (nếu contributes.aiAgents khai báo)
│   └── lifecycle.ts         # 4 hook vòng đời (mục 2)
└── README.md
```

## 2. Lifecycle Hooks

Mỗi Plugin implement (khái niệm, không phải code thật) đúng 4 hook tương ứng `Plugin Lifecycle` (`PLUGIN_SYSTEM.md` mục 4):

| Hook | Gọi khi nào | Việc điển hình |
|---|---|---|
| `onInstall(context)` | Ngay sau "Installing", trước khi chuyển "Installed, Disabled" | Kiểm tra điều kiện tiên quyết (VD Plugin CRM cần module `crm` đã bật), chuẩn bị cấu hình mặc định |
| `onEnable(context)` | Khi Owner/Admin bật Plugin | Đăng ký chính thức `tools`/`actions`/`workflows`/`aiAgents`/`menuItems` vào Registry tương ứng (Tool Registry Stage 8, Action Registry Stage 9, `ai_agents`/`menus` Stage 5) |
| `onDisable(context)` | Khi tạm tắt | Gỡ đăng ký khỏi Registry (Tool/Action không còn khả dụng), KHÔNG xoá dữ liệu đã tạo |
| `onUninstall(context)` | Khi gỡ hẳn | Dọn dẹp toàn bộ đăng ký, không đụng tới dữ liệu nghiệp vụ đã phát sinh (`PLUGIN_SYSTEM.md` mục 4, nhánh Uninstalled) |

`context` truyền vào mỗi hook mang `{ organizationId, installedBy: uid, pluginConfig }` — Plugin luôn biết đang chạy trong phạm vi Organization nào, không có Plugin nào chạy "xuyên Organization" (nhất quán Organization Isolation xuyên suốt mọi Stage trước).

## 3. Đăng ký Tool/Action mới — dùng đúng khuôn mẫu đã có

Plugin **không tự nghĩ ra định dạng riêng** để khai báo Tool/Action — dùng lại chính xác `ToolDefinition` (`TOOL_CALLING.md` Stage 8 mục 1) và `ActionDefinition` (`AUTOMATION_ENGINE.md` Stage 9 mục 2). Khi `onEnable` chạy, SDK gọi 1 hàm đăng ký chung (khái niệm `registerTool(toolDefinition)`/`registerAction(actionDefinition)`) — Tool/Action do Plugin đóng góp **sau khi đăng ký, không khác gì** Tool/Action có sẵn của MIMIN về mặt vận hành (cùng đi qua Tool Permission, Tool Routing, Audit Logging đã thiết kế ở Stage 8-9) — đây là điểm quan trọng: **Plugin không tạo hệ Tool/Action song song**, nó chỉ **thêm entry vào đúng 1 Registry duy nhất**.

## 4. Sandbox — giới hạn những gì code Plugin được làm

Vì Plugin có thể do bên thứ 3 viết (nhóm Tích hợp ngoài, `PLUGIN_SYSTEM.md` mục 2), code Plugin **không được** chạy với toàn quyền như code lõi MIMIN:

| Giới hạn | Lý do |
|---|---|
| Chỉ được gọi qua `PLUGIN_API.md` (bề mặt API hẹp, không phải toàn bộ `packages/database`) | Ngăn Plugin đọc/ghi collection ngoài phạm vi `requiredPermissions` đã khai báo và được duyệt (`PLUGIN_SYSTEM.md` mục 6) |
| Không được import trực tiếp `packages/auth`/`packages/database` nội bộ | Tránh Plugin tự ý bypass RBAC — mọi thao tác đều qua lớp trung gian đã kiểm tra quyền sẵn |
| Giới hạn thời gian thực thi mỗi hook (timeout) | Tránh 1 Plugin lỗi/vô hạn vòng lặp làm treo toàn bộ quá trình Install/Enable của Organization |
| Không được gọi Cloud Function khác ngoài của chính mình | Cách ly — lỗi ở Plugin A không ảnh hưởng Plugin B hay hạ tầng lõi |

## 5. Tham chiếu

- Plugin Manifest/Lifecycle tổng thể: [PLUGIN_SYSTEM.md](PLUGIN_SYSTEM.md)
- Bề mặt API Plugin được gọi: [PLUGIN_API.md](PLUGIN_API.md)
- Tool/Action Definition gốc: [TOOL_CALLING.md](TOOL_CALLING.md) mục 1 (Stage 8), [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md) mục 2 (Stage 9)
