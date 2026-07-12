# MARKETPLACE.md — Kiến trúc Tổng thể Marketplace (Stage 12)

Stage 12 cho phép Organization **duyệt và cài đặt** 7 loại vật phẩm sẵn có vào Workspace của mình — biến các thiết kế "dùng chung" đã rải rác từ Stage 5-11 (`isShared`, `organizationId: null`, Plugin Manifest...) thành 1 trải nghiệm duyệt/cài thống nhất.

**Ràng buộc không đổi**: chỉ thiết kế kiến trúc — không viết code, không gọi API/Firebase thật, không viết Business Logic.

## 1. 7 loại vật phẩm — nguồn dữ liệu (không tạo collection catalog riêng)

Theo đúng kỷ luật đã áp dụng nhất quán từ Stage 9 (không thêm collection Firestore mới khi có thể tránh), Marketplace **không phải 1 collection catalog riêng** — nó là 1 **view tổng hợp (federated view)** đọc trực tiếp từ các collection "dùng chung" đã có sẵn quy ước riêng:

| Loại vật phẩm | Nguồn dữ liệu | Quy ước "có thể chia sẻ" đã có/đề xuất |
|---|---|---|
| AI Agents | `ai_agents` (Stage 5) | `organizationId == null` (đã có sẵn từ Stage 5 — "dùng chung nếu null") |
| Workflow | `workflows` (Stage 5) | **Đề xuất bổ sung field** `isTemplate: boolean` (mở rộng field, không phải collection mới — mirror đúng cách `prompts.isShared` đã làm) |
| Theme | `themes` (Stage 5, SYSTEM) | Đã platform-wide theo thiết kế gốc (không organizationId/workspaceId) |
| Plugin | `PluginManifest` (Stage 11) | Xem mục 5 — điểm còn cần xác nhận nơi lưu trữ catalog Manifest |
| Template | `prompts` (Loại văn bản) hoặc `pages`/`components` (Loại UI, Stage 5 SYSTEM) | Tuỳ loại Template — xem mục 2 |
| Prompt | `prompts` (Stage 5) | `isShared == true` (đã có sẵn từ Stage 5) |
| Dashboard | `pages` + `components` (Stage 5, SYSTEM) | Đã platform-wide theo thiết kế gốc |

## 2. "Template" — loại đa hình (không phải 1 collection duy nhất)

"Template" trong yêu cầu Stage 12 không tương ứng 1 collection cụ thể — nó là **khái niệm chung cho blueprint tái sử dụng**, cụ thể hoá thành 1 trong 2 dạng khi hiển thị trên Marketplace:
- **Template văn bản** (mẫu báo giá, mẫu hợp đồng, mẫu email...) → thực chất là 1 `prompts` (`isShared: true`) — không phân biệt kỹ thuật với loại "Prompt" ở bảng mục 1, chỉ khác **cách hiển thị/phân loại trên UI Marketplace** (gắn tag "Template" thay vì "Prompt" tuỳ ngữ cảnh dùng).
- **Template giao diện** (mẫu Dashboard, mẫu trang giới thiệu) → `pages`/`components` — trùng nguồn với loại "Dashboard" ở bảng mục 1.

## 3. Sơ đồ luồng chính (khớp ví dụ yêu cầu)

```
Marketplace (duyệt danh sách, federated view mục 1)
   ↓  chọn 1 AI Agent (ví dụ)
AI Agent (xem chi tiết — mô tả, moduleSlug, ảnh xem trước nếu có)
   ↓  bấm "Install"
Install (INSTALL_ENGINE.md — sao chép blueprint thành document mới, scoped đúng
         organizationId/workspaceId đang chọn — KHÔNG chia sẻ tham chiếu ngược
         về bản gốc, xem lý do ở INSTALL_ENGINE.md mục 1)
   ↓
Workspace (vật phẩm giờ thuộc về đúng 1 Workspace cụ thể trong Organization)
   ↓
Ready (sẵn sàng dùng — AI Agent xuất hiện trong danh sách `ai_agents` của
       Organization, có thể gọi qua AI Gateway (Stage 7) như agent tự tạo)
```

## 4. Nguyên tắc: Install = SAO CHÉP, không phải THAM CHIẾU

Khác với cách `isShared: true`/`organizationId: null` hiện có (Organization "mượn dùng" bản gốc mà không sở hữu), **Install luôn tạo 1 bản sao mới** thuộc về Organization/Workspace đích (`INSTALL_ENGINE.md` mục 1). Lý do:
- Organization có thể **tuỳ chỉnh** sau khi cài (VD sửa `systemPrompt` của AI Agent đã cài) mà không ảnh hưởng tới bản gốc trên Marketplace hay Organization khác cũng đã cài cùng 1 vật phẩm.
- Nếu Marketplace cập nhật phiên bản mới của 1 vật phẩm, Organization đã cài **không tự động bị thay đổi** — tương tự nguyên tắc Prompt Version (`PROMPT_ENGINE.md` Stage 7 mục 4: không ghi đè, giữ bản đã dùng).

## 5. Điểm cần xác nhận — nơi lưu Plugin Manifest Catalog

Khác 6 loại còn lại (đều có sẵn quy ước "dùng chung" trong Stage 5), **Plugin Manifest** (Stage 11) chưa có nơi lưu trữ dạng danh mục duyệt được — bản thân `PluginManifest` là dữ liệu tĩnh (JSON), không phải 1 document nghiệp vụ theo mẫu `TenantScopedDocument`. Đề xuất 2 phương án (không tự chọn thay người điều hành, ghi nhận để xác nhận sau):
- (a) Lưu Manifest dưới dạng 1 `files` (Stage 5, CORE domain) — Manifest chỉ là 1 file JSON, tái sử dụng đúng collection đã có, `category` mở rộng thêm giá trị `"plugin_manifest"`.
- (b) Lưu trong 1 hệ thống catalog riêng ngoài Firestore (VD registry dạng Git, giống cách VSCode Marketplace/npm hoạt động) — MIMIN chỉ lưu **con trỏ** (URL) tới Manifest, không lưu nội dung.

`PLUGIN_STORE.md` (Stage 12) tạm dùng phương án (a) làm giả định thiết kế xuyên suốt (đơn giản hơn, nhất quán cách MIMIN đã xử lý file khác) — cần xác nhận lại khi triển khai thật.

## 6. Tham chiếu

- Luồng cài đặt chi tiết theo từng loại: [INSTALL_ENGINE.md](INSTALL_ENGINE.md)
- Gian hàng Plugin riêng: [PLUGIN_STORE.md](PLUGIN_STORE.md)
- Nguồn dữ liệu AI Agent/Prompt/Theme: [COLLECTIONS.md](COLLECTIONS.md) (Stage 5)
- Plugin Manifest gốc: [PLUGIN_SYSTEM.md](PLUGIN_SYSTEM.md) mục 3 (Stage 11)
