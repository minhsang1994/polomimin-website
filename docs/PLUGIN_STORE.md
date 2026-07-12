# PLUGIN_STORE.md — Gian hàng Plugin (Plugin Store)

Plugin Store là **khu vực riêng** trong Marketplace (`MARKETPLACE.md`) chuyên cho loại vật phẩm Plugin (`PLUGIN_SYSTEM.md`, Stage 11) — tách tài liệu riêng vì Plugin có vòng đời phức tạp hơn 6 loại còn lại (Manifest, Permission xin trước, Lifecycle nhiều bước — `INSTALL_ENGINE.md` mục 3), cần giao diện/quy trình duyệt riêng.

## 1. Khác biệt Plugin Store vs Marketplace chung

| | Marketplace chung (6 loại) | Plugin Store |
|---|---|---|
| Nội dung | Dữ liệu tĩnh (AI Agent/Workflow/Theme/Template/Prompt/Dashboard) | Gói có hành vi (code Plugin, tuy Stage 11 không viết code thật) |
| Bấm Install là xong? | ✅ Đúng — Ready ngay | ❌ Cần thêm bước Enable + xác nhận Permission (`INSTALL_ENGINE.md` mục 3) |
| Ai xuất bản được | Chủ yếu MIMIN chính thức cung cấp | Cả MIMIN lẫn bên thứ 3 (nhóm Tích hợp ngoài — `PLUGIN_SYSTEM.md` mục 2) |
| Cần kiểm duyệt trước khi lên gian hàng? | Không bắt buộc | **Có** — xem mục 2 |

## 2. Quy trình xuất bản (Publish) — chỉ áp dụng Plugin

Vì Plugin có thể do bên thứ 3 viết và có quyền truy cập dữ liệu thật (qua `PLUGIN_API.md`, Stage 11), Plugin Store cần 1 bước **kiểm duyệt** trước khi hiển thị công khai — khác 6 loại vật phẩm còn lại (không cần bước này vì bản chất chỉ là dữ liệu, không có hành vi thực thi):

```
Nhà phát triển nộp PluginManifest + mã nguồn (theo PLUGIN_SDK.md)
   ↓
Kiểm duyệt (thủ công, đội vận hành MIMIN — ngoài phạm vi thiết kế kỹ thuật):
   - requiredPermissions có hợp lý với mô tả chức năng không?
   - externalConnections (Webhook/MCP Client) trỏ tới domain đáng tin cậy không?
   ↓ Đạt
Publish — Manifest được lưu vào nơi lưu trữ đã chọn (MARKETPLACE.md mục 5)
   ↓
Xuất hiện trên Plugin Store — Organization khác có thể thấy và Install
```

## 3. Danh mục hiển thị (Listing)

Mỗi Plugin trên gian hàng hiển thị trực tiếp từ `PluginManifest` (`PLUGIN_SYSTEM.md` mục 3) — không có field hiển thị riêng nào phát sinh thêm:

| Field hiển thị | Nguồn |
|---|---|
| Tên, mô tả, publisher | `manifest.name`/`description`/`publisher` |
| Nhóm (Module Extension / External Integration / Vertical) | `manifest.category` |
| Quyền yêu cầu (hiển thị TRƯỚC khi cài, minh bạch) | `manifest.requiredPermissions` |
| Phiên bản | `manifest.version` |

## 4. Cập nhật Plugin đã cài (Update)

Khi publisher phát hành `version` mới:
```
Nếu requiredPermissions KHÔNG đổi → cập nhật tự động (hoặc thông báo, tuỳ cấu
   hình Organization), giữ nguyên trạng thái Enable/Disable hiện tại
Nếu requiredPermissions CÓ thêm quyền mới → PHẢI dừng lại chờ Owner/Admin
   xác nhận lại (giống lần Install đầu tiên, PLUGIN_SYSTEM.md mục 4, nhánh
   "Updating") — không tự động cấp thêm quyền dù chỉ là update version nhỏ
```

## 5. Tham chiếu

- Plugin System tổng thể (Manifest/Lifecycle/Permission): [PLUGIN_SYSTEM.md](PLUGIN_SYSTEM.md) (Stage 11)
- Luồng Install riêng cho Plugin: [INSTALL_ENGINE.md](INSTALL_ENGINE.md) mục 3
- Marketplace tổng thể (6 loại còn lại): [MARKETPLACE.md](MARKETPLACE.md)
