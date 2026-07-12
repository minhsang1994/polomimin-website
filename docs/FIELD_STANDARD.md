# FIELD_STANDARD.md — Chuẩn Field cho Firestore Collections

Stage 5 thiết kế **Core Database** thật cho MIMIN Platform — 79 collection nghiệp vụ mới (10 nhóm domain) cộng với các collection nền tảng đã có (`organizations`, `branches`, `departments`, `members` — xem `packages/database/src/firestore/collections.ts`). Tài liệu này chốt quy ước field dùng **nhất quán cho toàn bộ 79+ collection**, tránh mỗi collection tự đặt quy ước riêng.

## 1. Quy ước đặt tên field

- **camelCase** cho mọi field (VD `customerId`, `totalAmount`, `createdAt`) — nhất quán với code TypeScript hiện có (`packages/database/src/types.ts` dùng `ownerUid`, `organizationId`, `createdAt`...).
- Field tham chiếu tới 1 document khác (khoá ngoại): `<tenEntitySoIt>Id` (VD `customerId`, `productId`, `warehouseId`).
- Field tham chiếu tới nhiều document: `<tenEntitySoNhieu>Ids` (mảng string, VD `productIds`, `departmentIds`) — chỉ dùng khi số lượng tham chiếu nhỏ (< 100), nếu lớn hơn phải mô hình hoá bằng **collection quan hệ riêng** (VD `order_items` thay vì mảng `productIds` trong `orders`).
- Field enum trạng thái: luôn tên là `status` (string), giá trị viết `snake_case` bên trong (VD `"pending_approval"`, `"in_progress"`) để phân biệt trực quan với tên field camelCase.
- Field tiền tệ: `<ten>Amount` (number) đi kèm bắt buộc field `currency` (string, mã ISO 4217, FK tới `currencies`) ở cùng document hoặc ở document cha nếu toàn bộ tiền trong 1 document dùng chung 1 loại tiền.
- Field số lượng: `quantity` (number), field đơn vị tính đi kèm: `unit` (string, VD "cái", "kg", "mét").

## 2. Kiểu dữ liệu chuẩn

| Kiểu | Dùng cho | Ghi chú |
|---|---|---|
| `string` | Tên, mô tả, id tham chiếu, enum trạng thái | |
| `number` | Số lượng, tiền, thời gian | Không dùng kiểu `Timestamp` của Firestore cho các mốc thời gian nghiệp vụ — dùng `number` (Unix epoch mili-giây), **nhất quán với `createdAt: number` đã có sẵn** trong `packages/database/src/types.ts` (`Organization`, `Branch`, `Department`, `Role`, `Membership` đều dùng `number`) |
| `boolean` | Cờ bật/tắt, soft-delete (`isDeleted`), cờ mặc định (`isDefault`) | |
| `array<string>` | Danh sách id tham chiếu ngắn, tag, mảng ảnh (`imageUrls`) | |
| `map` (object lồng) | Nhóm field liên quan chặt, không cần query riêng (VD `address: { street, city, province }`) | Chỉ dùng khi **không cần** filter/sort theo field con; nếu cần query field con, tách field phẳng ở document cha thay vì lồng |
| `reference` (string, không dùng `DocumentReference` của Firestore) | Mọi khoá ngoại | Lưu dưới dạng `string` (giá trị = document ID của collection đích), không dùng kiểu `DocumentReference` gốc của Firestore — lý do: dễ serialize qua JSON/REST, dễ dùng lại giữa Admin SDK và Client SDK, khớp với cách `packages/database` hiện đang thao tác (so sánh string id) |

## 3. Field bắt buộc trên mọi collection theo tenant (multi-tenant) — **đã chốt (Xác nhận Stage 5, quyết định #2)**

Kiến trúc Multi-Tenant giữ nguyên **3 tầng cách ly**: `organizationId` (công ty) → `workspaceId` (mảng nghiệp vụ: Business/Academy/Factory/Warehouse/Finance/Marketing/AI/Admin — xem `COLLECTIONS.md` mục A.3) → `branchId` (chi nhánh vật lý, nếu áp dụng). Trừ nhóm **SYSTEM** (catalog dùng chung toàn nền tảng — mục 5) và 2 ngoại lệ nêu dưới, mọi collection nghiệp vụ **bắt buộc** có:

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `organizationId` | string | ✅ | FK → `organizations/{orgId}` — cột cách ly dữ liệu chính, xem `DATABASE_ARCHITECTURE.md` mục 2 |
| `workspaceId` | string | ✅ | FK → `workspaces/{workspaceId}` — **bắt buộc**, xác định collection thuộc mảng nghiệp vụ nào (Business/Academy/Factory/Warehouse/Finance/Marketing/AI/Admin) |
| `branchId` | string \| null | tuỳ chọn (điền nếu áp dụng) | FK → `branches/{branchId}` (đã có, nested dưới `organizations`) — chỉ điền khi dữ liệu gắn với 1 chi nhánh vật lý cụ thể (VD `inventory`, `attendance`); bỏ null nếu là dữ liệu dùng chung toàn Organization (VD `price_lists`) |
| `createdAt` | number | ✅ | Unix epoch ms lúc tạo |
| `updatedAt` | number | ✅ | Unix epoch ms lần sửa cuối |
| `createdBy` | string | ✅ | uid Firebase Auth người tạo |
| `updatedBy` | string | tuỳ chọn | uid người sửa lần cuối (bỏ qua nếu = `createdBy`) |
| `isDeleted` | boolean | ✅ (mặc định `false`) | Soft-delete — không xoá cứng để giữ vết cho `activity_logs`/báo cáo lịch sử |
| `deletedAt` / `deletedBy` | number \| null / string \| null | tuỳ chọn | Chỉ điền khi `isDeleted = true` |

**2 ngoại lệ hợp lý với `workspaceId` bắt buộc** (không áp dụng máy móc "mọi dữ liệu" khi kiến trúc không hợp lý):
- `roles`, `permissions` — theo quyết định #3 (Xác nhận Stage 5), đây là dữ liệu **dùng chung toàn Organization**, áp dụng cho mọi workspace bên trong — có `organizationId` nhưng **không có** `workspaceId` (không thuộc riêng 1 workspace).
- `users` — hồ sơ định danh **toàn cục**, không thuộc 1 Organization/workspace cụ thể nào (1 user có thể ở nhiều Organization/workspace khác nhau) — không có cả `organizationId` lẫn `workspaceId`.

Các field trên **không lặp lại** trong bảng field riêng của từng collection ở `COLLECTIONS.md` (đã liệt kê 1 lần tại đây) — mỗi collection trong `COLLECTIONS.md` chỉ liệt kê field **đặc thù nghiệp vụ** của nó, cộng với ghi chú `workspaceId mặc định` ở đầu mỗi domain.

## 4. Field bắt buộc cho document dạng "sự kiện/log" (append-only)

Áp dụng cho `activity_logs`, `inventory_transactions`, `usage_logs`, `notifications`, `ai_history`: **không có** `updatedAt`/`isDeleted` (không sửa/xoá sau khi ghi — bất biến), chỉ có `createdAt` + `createdBy` (hoặc `actorId`/`actorType` nếu hành động do hệ thống/AI thực hiện thay vì người dùng).

## 5. Ngoại lệ: nhóm SYSTEM (catalog dùng chung, không thuộc 1 Organization)

`menus`, `pages`, `components`, `themes`, `languages`, `countries`, `currencies` **không có** `organizationId`/`workspaceId` — đây là dữ liệu cấu hình **toàn nền tảng**, dùng chung cho mọi Organization (tương tự `platform_config` đã nêu ở `FIRESTORE_STRUCTURE.md` Stage 4 mục 9). Các collection này vẫn có `createdAt`/`updatedAt`/`createdBy`/`isDeleted` như mục 3 (trừ `organizationId`/`workspaceId`).

## 6. Field danh mục dùng chung nhiều nơi (tránh trùng lặp enum)

- `status` của quy trình phê duyệt (đơn hàng, hợp đồng, phiếu chi...) dùng chung 1 tập giá trị chuẩn khi hợp lý: `draft → pending_approval → approved → rejected → cancelled` — ánh xạ trực tiếp Approval Flow đã thiết kế ở `WORKFLOW.md` (Stage 3).
- Địa chỉ (`address`) luôn là `map`: `{ street: string, ward: string, district: string, province: string, countryCode: string }`, `countryCode` FK → `countries`.
- Số điện thoại/email liên hệ nhóm trong `map contact`: `{ phone, email, zalo }` khi 1 entity có nhiều kênh liên hệ.

## 7. Tham chiếu

- Quy ước Document ID (khi nào auto-ID, khi nào ID xác định): [ID_STANDARD.md](ID_STANDARD.md)
- Danh sách đầy đủ field theo từng collection: [COLLECTIONS.md](COLLECTIONS.md)
- Field nào cần composite index: [INDEX_PLAN.md](INDEX_PLAN.md)
