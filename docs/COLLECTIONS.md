# COLLECTIONS.md — Danh mục 92 Collection theo 11 Domain

**Đã đóng băng theo Xác nhận Stage 5** (10 quyết định kiến trúc — xem `DATABASE_REVIEW.md` mục 7). So với bản nháp đầu Stage 5 (79 collection/10 domain): bổ sung `invoices`/`ledger_entries`/`fixed_assets` (Finance), `mrp_results`/`production_reports` (Factory), `ai_insights`/`ai_forecasts`/`ai_recommendations`/`ai_memories` (AI), và **Domain K — LOGISTICS** mới (`shipments`/`delivery_orders`/`tracking`/`carriers`) → tổng 92 collection.

Quy ước dùng chung, **không lặp lại trong từng collection**:
- Field bắt buộc mọi collection theo tenant (`organizationId`, `workspaceId` **bắt buộc**, `branchId` tuỳ chọn, `createdAt`, `updatedAt`, `createdBy`, `isDeleted`...): xem [FIELD_STANDARD.md](FIELD_STANDARD.md) mục 3.
- Mỗi domain có 1 **`workspaceId` mặc định** trong 8 workspace cố định (`business`/`academy`/`factory`/`warehouse`/`finance`/`marketing`/`ai`/`admin` — xem mục A.3) — ghi ngay dưới tiêu đề domain, không lặp lại ở từng collection.
- Chiến lược Document ID là **Auto-ID cho toàn bộ** (kể cả `roles`/`permissions`) — xem [ID_STANDARD.md](ID_STANDARD.md); Business Code (mã hiển thị) luôn là field riêng, không phải Document ID.
- "Quyền truy cập" nêu **resource string** dùng trong `Permission.resource` (`packages/database/src/types.ts`) + hành vi theo action (`view/create/update/delete/manage`) và Role liên quan (bộ Role chính thức — xem `AUTHENTICATION.md` mục 2). `super_admin`/`owner` luôn có `manage` bỏ qua kiểm tra chi tiết (xem `SECURITY_RULES.md` mục 4/7) — không lặp lại ở từng collection.
- "Module sử dụng" là slug thật trong `packages/core/src/constants/modules.ts`.
- **Nguyên tắc đa ngành (quyết định #10)**: không collection nào ở dưới đây thiết kế riêng cho ngành may/dệt — mọi field đặc thù ngành (VD thuộc tính `size`/`color` ở `product_variants`) nằm trong `map attributes` tự do, không hard-code tên ngành vào tên field/collection. Ngành may chỉ là 1 cấu hình `attributes` cụ thể trong hàng trăm khả năng.

---

## A. CORE COLLECTIONS

*`workspaceId` mặc định: `admin` (trừ `users`/`roles`/`permissions` — không có `workspaceId`, xem ngoại lệ ở `FIELD_STANDARD.md` mục 3; `notifications`/`activity_logs`/`files`/`ai_agents`/`ai_history` có thể mang `workspaceId` của ngữ cảnh phát sinh thay vì luôn là `admin`, ghi cụ thể ở từng collection nếu khác).*

### 1. `users`
- **Mục đích:** Hồ sơ toàn cục của 1 người dùng đã đăng nhập (Firebase Auth), độc lập với việc thuộc Organization nào — tách biệt với `members` (nested, gán Role theo từng Organization, đã có sẵn trong code).
- **Document ID:** `{uid}` (= Firebase Auth uid) — xem `ID_STANDARD.md` mục 1.
- **Field:**
  | Field | Kiểu | Mô tả |
  |---|---|---|
  | displayName | string | Tên hiển thị |
  | email | string | Đồng bộ từ Firebase Auth |
  | phone | string \| null | |
  | avatarUrl | string \| null | FK → `files` |
  | defaultOrganizationId | string \| null | FK → `organizations`, tổ chức mở mặc định lúc đăng nhập |
  | locale | string | FK → `languages` |
  | lastLoginAt | number | |
- **Quan hệ:** 1 `users` — N `organizations/{orgId}/members/{uid}` (đã có, nested); 1 `users` — N `ai_history`, `notifications`, `activity_logs` (qua uid).
- **Index cần thiết:** không cần composite (point-read theo uid).
- **Quyền truy cập:** user chỉ `view`/`update` document của chính mình (`request.auth.uid == uid`); `super_admin` nền tảng `view` toàn bộ.
- **Module sử dụng:** tất cả 16 module (Header avatar, `RequireAuth`, `packages/auth`).

### 2. `organizations`
- **Mục đích:** Tenant gốc (doanh nghiệp thuê nền tảng) — **đã tồn tại** trong `packages/database/src/types.ts`/`firestore/collections.ts`, liệt kê lại tại đây để COLLECTIONS.md là danh mục đầy đủ, không redesign.
- **Document ID:** Auto-ID.
- **Field:** `name`, `slug`, `ownerUid`, `plan` (string, gói dịch vụ — mới, chưa có trong code, đề xuất bổ sung).
- **Quan hệ:** 1 `organizations` — N `workspaces`, N `branches` (đã có), N mọi collection nghiệp vụ (qua `organizationId`).
- **Index cần thiết:** `slug` (unique lookup khi đăng ký subdomain).
- **Quyền truy cập:** resource `organization` — `owner`/`super_admin` `manage`; member `view` tổ chức mình thuộc về.
- **Module sử dụng:** tất cả.

### 3. `workspaces` — **đã chốt (Xác nhận Stage 5, quyết định #1)**
- **Mục đích:** Top-level collection riêng, đại diện cho **8 mảng nghiệp vụ cố định** trong 1 Organization — thay thế hoàn toàn cách hiểu "Workspace = Organization" ở `AUTHENTICATION.md` Stage 4 (đã lỗi thời, xem `DATABASE_REVIEW.md` mục 4.1). Mỗi Organization có tối đa 8 document `workspaces`, mỗi cái ứng với 1 trong 8 loại: **Business, Academy, Factory, Warehouse, Finance, Marketing, AI, Admin**. Đây là tầng cách ly dữ liệu **thứ 2** (sau `organizationId`, trước `branchId`) — không phải vị trí vật lý như `branches`.
- **Document ID:** Auto-ID (không dùng slug làm ID — theo quyết định #9, xem `ID_STANDARD.md` mục 1); mỗi document có field `type` để xác định 1 trong 8 loại cố định.
- **Field:**
  | Field | Kiểu | Mô tả |
  |---|---|---|
  | organizationId | string | FK → `organizations` |
  | type | string (enum) | 1 trong 8 giá trị cố định: `business`/`academy`/`factory`/`warehouse`/`finance`/`marketing`/`ai`/`admin` |
  | name | string | Tên hiển thị (VD "Vận hành Kinh doanh") |
  | isEnabled | boolean | Bật/tắt workspace (nếu Organization không dùng tới 1 mảng nào đó) |
- **Quan hệ:** N `workspaces` — 1 `organizations`; **mọi** collection nghiệp vụ (trừ `roles`/`permissions`/`users`/SYSTEM — xem `FIELD_STANDARD.md` mục 3) có `workspaceId` **bắt buộc**, trỏ về đúng 1 trong 8 workspace này theo domain (xem bảng ánh xạ domain → workspace ở mục A.3 bên dưới).
- **Index cần thiết:** (`organizationId`, `type`) unique — mỗi Organization chỉ có 1 document cho mỗi `type`.
- **Quyền truy cập:** resource `organization` — `owner`/`admin` `manage`; `manager` `view` workspace mình được gán qua `members`.
- **Module sử dụng:** tất cả (bộ lọc phạm vi dữ liệu ở mọi module).

**Bảng ánh xạ 8 `workspaces.type` ↔ Domain (mục B–K) ↔ Module thật (`packages/core/MODULES[]`):**

| `workspaces.type` | Domain COLLECTIONS.md áp dụng | Module thật liên quan |
|---|---|---|
| `business` | CRM, SALES, HR *(không có workspace HR riêng — xem `DATABASE_REVIEW.md` mục 4.9)*, LOGISTICS | `crm`, `business-os` |
| `academy` | ACADEMY | `training-center` |
| `factory` | FACTORY | `production`, `factory-os` |
| `warehouse` | WAREHOUSE | `warehouse` |
| `finance` | FINANCE | `finance` |
| `marketing` | *(chưa có domain/collection riêng ở Stage 5 — workspace tồn tại nhưng chưa có collection nghiệp vụ gắn `marketing`, xem `DATABASE_REVIEW.md` mục 4.11)* | `marketing` |
| `ai` | AI | `ai-center`, `automation` |
| `admin` | CORE, SYSTEM | `admin` |

### 4. `roles` — **đã chốt (Xác nhận Stage 5, quyết định #3 + #9)**
- **Mục đích:** Top-level collection **dùng chung** (không nested dưới `organizations/{orgId}/roles` như scaffold Stage 4 cũ) — định nghĩa vai trò + danh sách `Permission[]` được cấp trong 1 Organization. **Thay thế** đề xuất "ID = roleSlug" ở bản nháp Stage 5 đầu tiên — nay dùng Auto-ID thống nhất (xem `ID_STANDARD.md` mục 2).
- **Document ID:** Auto-ID.
- **Field:** `organizationId`, `slug` (string, VD `"owner"`/`"manager"` cho 10 vai trò chuẩn, dùng để hiển thị/tra cứu — không phải Document ID), `name`, `description`, `permissions` (array<map>`{resource, action}`), `isCustom` (boolean).
- **Quan hệ:** N `roles` — 1 `organizations`; 1 `roles` — N `members` (qua `roleId` = Auto-ID thật, lưu trong custom claims — xem `ID_STANDARD.md` mục 2).
- **Index cần thiết:** (`organizationId`, `slug`).
- **Quyền truy cập:** resource `role` — chỉ `owner`/`admin` `manage`; member `view` role của chính mình. **Không có `workspaceId`** — Role áp dụng xuyên suốt mọi workspace trong 1 Organization (xem `FIELD_STANDARD.md` mục 3 ngoại lệ).
- **Module sử dụng:** `admin` (màn hình cấu hình), tất cả module khác (đọc để kiểm tra quyền qua `usePermission`).

### 5. `permissions` *(catalog, khác với mảng `roles.permissions[]`)* — **đã chốt (Xác nhận Stage 5, quyết định #3)**
- **Mục đích:** Top-level collection **dùng chung toàn nền tảng** (không thuộc riêng 1 Organization) — danh mục **toàn bộ permission khả dụng** (resource × action) để dựng UI cấu hình Role ở Admin — **không phải nơi gán quyền thật** (gán quyền thật là `roles.permissions[]`). Không có `organizationId`/`workspaceId` (giống nhóm SYSTEM — catalog nền tảng).
- **Document ID:** `{resource}_{action}` (VD `finance_manage`) — ngoại lệ hợp lý so với nguyên tắc Auto-ID chung, xem lý do ở `ID_STANDARD.md` mục 2 (khoá tự nhiên của catalog tĩnh, không phải Business Code).
- **Field:** `resource` (string), `action` (enum `view/create/update/delete/manage`), `label` (string hiển thị), `group` (string, nhóm hiển thị UI).
- **Quan hệ:** được `roles.permissions[].resource`/`.action` tham chiếu **theo giá trị** (không phải FK cứng qua Document ID).
- **Index cần thiết:** `resource`.
- **Quyền truy cập:** mọi member đã đăng nhập `view`; chỉ `super_admin` nền tảng `manage` (thêm permission mới khi có module mới).
- **Module sử dụng:** `admin`.

### 6. `settings`
- **Mục đích:** Cấu hình theo phạm vi (Organization/Workspace/User) — feature flag nội bộ, ngưỡng phê duyệt (nối `WORKFLOW.md` Stage 3).
- **Document ID:** `{scopeType}_{scopeId}` (VD `organization_{orgId}`).
- **Field:** `scopeType` (enum `organization/workspace/user`), `scopeId`, `values` (map key-value tự do).
- **Quan hệ:** `scopeId` FK tới `organizations`/`workspaces`/`users` tương ứng `scopeType`.
- **Index cần thiết:** `scopeType`.
- **Quyền truy cập:** resource `setting` — `owner`/`admin` `manage` cấp Organization; user tự sửa cấp `user`.
- **Module sử dụng:** tất cả.

### 7. `notifications`
- **Mục đích:** Thông báo trong app cho từng user — nối tiếp Notification Flow (`WORKFLOW.md` Stage 3) và `dispatchNotification` (`FUNCTIONS_PLAN.md` Stage 4).
- **Document ID:** Auto-ID.
- **Field:** `organizationId`, `recipientUid`, `title`, `body`, `deepLink`, `isRead` (boolean), `channel` (enum `toast/popover/push`).
- **Quan hệ:** `recipientUid` FK `users`; sinh bởi Cloud Function `dispatchNotification`.
- **Index cần thiết:** (`recipientUid`, `createdAt` desc); (`recipientUid`, `isRead`).
- **Quyền truy cập:** resource `notification` — user chỉ `view`/`update` (đánh dấu đã đọc) thông báo có `recipientUid == auth.uid`.
- **Module sử dụng:** tất cả (Header notification bell).

### 8. `activity_logs`
- **Mục đích:** Nhật ký audit toàn hệ thống — append-only, không sửa/xoá (xem `FIELD_STANDARD.md` mục 4).
- **Document ID:** Auto-ID.
- **Field:** `organizationId`, `actorUid`, `actorType` (enum `user/system/ai`), `action` (string), `targetCollection` (string), `targetId` (string), `metadata` (map).
- **Quan hệ:** `targetCollection` + `targetId` là tham chiếu đa hình (polymorphic) tới bất kỳ document nào — không có FK cứng.
- **Index cần thiết:** (`organizationId`, `createdAt` desc); (`targetCollection`, `targetId`).
- **Quyền truy cập:** resource `activity_log` — `manager` trở lên `view` (phạm vi phòng ban); `owner`/`admin` `view` toàn bộ; không ai `update`/`delete`.
- **Module sử dụng:** `admin` (màn hình audit log); ghi ngầm bởi mọi module khác.

### 9. `files`
- **Mục đích:** Metadata file trong Firebase Storage (đường dẫn, loại, kích thước) — đi kèm `STORAGE_STRUCTURE.md` Stage 4, **không lưu binary** (binary ở Storage).
- **Document ID:** Auto-ID.
- **Field:** `organizationId`, `storagePath` (string, khớp `STORAGE_STRUCTURE.md`), `category` (enum 8 loại Stage 4), `mimeType`, `sizeBytes`, `uploadedBy`.
- **Quan hệ:** được tham chiếu bởi field `fileRef`/`avatarUrl`/`imageUrls` ở collection khác.
- **Index cần thiết:** (`organizationId`, `category`); `storagePath` (unique).
- **Quyền truy cập:** theo category — xem `STORAGE_STRUCTURE.md` + `SECURITY_RULES.md` mục 6.
- **Module sử dụng:** tất cả.

### 10. `ai_agents`
- **Mục đích:** Danh mục AI Agent (persona) khả dụng — nối tiếp 24 persona đã thiết kế ở `AI_FLOW.md` Stage 3.
- **Document ID:** Auto-ID (hoặc slug persona nếu cần tham chiếu ổn định).
- **Field:** `organizationId` (null nếu agent dùng chung nền tảng), `slug`, `name`, `description`, `moduleSlug` (FK `MODULES`), `systemPrompt` (text), `isActive`.
- **Quan hệ:** 1 `ai_agents` — N `ai_history`, N `prompts`.
- **Index cần thiết:** `moduleSlug`; `organizationId`.
- **Quyền truy cập:** resource `ai-center` — `view` mọi member; `manage` chỉ `owner`/`admin`.
- **Module sử dụng:** `ai-center` + module gắn với `moduleSlug`.

### 11. `ai_history`
- **Mục đích:** Lịch sử hội thoại/lượt gọi AI Agent — đổi tên từ `ai_agent_conversations` (Stage 4 `FIRESTORE_STRUCTURE.md`) cho khớp naming Stage 5.
- **Document ID:** Auto-ID.
- **Field:** `organizationId`, `agentId` (FK `ai_agents`), `uid`, `role` (enum `user/assistant`), `content` (text), `tokensUsed` (number).
- **Quan hệ:** N `ai_history` — 1 `ai_agents`; N `ai_history` — 1 `users`.
- **Index cần thiết:** (`agentId`, `uid`, `createdAt`); (`organizationId`, `createdAt` desc).
- **Quyền truy cập:** resource `ai-center` — user chỉ `view` hội thoại của chính mình; `owner`/`admin` `view` toàn bộ (giám sát).
- **Module sử dụng:** `ai-center`.

---

## B. CRM

*Resource mặc định: `crm`. `workspaceId` mặc định: `business`.*

### 12. `customers`
- **Mục đích:** Khách hàng (kế thừa `crm_customers` Stage 4).
- **Document ID:** Auto-ID.
- **Field:** `name`, `taxCode`, `customerGroupId` (FK `customer_groups`), `status` (enum `active/inactive`), `assignedTo` (uid).
- **Quan hệ:** N `customers` — 1 `customer_groups`; 1 `customers` — N `customer_contacts`, N `opportunities`, N `orders`, N `contracts`.
- **Index cần thiết:** (`organizationId`, `customerGroupId`); (`organizationId`, `assignedTo`).
- **Quyền truy cập:** `staff` (Sales) `create`/`update`; `manager` `delete`/`manage`.
- **Module sử dụng:** `crm`, `business-os`.

### 13. `customer_groups`
- **Mục đích:** Nhóm/phân khúc khách hàng (VIP, đại lý, lẻ) để áp `price_lists` riêng.
- **Document ID:** Auto-ID.
- **Field:** `name`, `discountRate` (number).
- **Quan hệ:** 1 `customer_groups` — N `customers`, N `price_lists`.
- **Index cần thiết:** `organizationId`.
- **Quyền truy cập:** `manager` `manage`; `staff` `view`.
- **Module sử dụng:** `crm`.

### 14. `customer_contacts`
- **Mục đích:** Người liên hệ cụ thể trong 1 khách hàng doanh nghiệp (1-N).
- **Document ID:** Auto-ID.
- **Field:** `customerId` (FK), `name`, `position`, `phone`, `email`, `isPrimary` (boolean).
- **Quan hệ:** N `customer_contacts` — 1 `customers`.
- **Index cần thiết:** `customerId`.
- **Quyền truy cập:** như `customers`.
- **Module sử dụng:** `crm`.

### 15. `suppliers`
- **Mục đích:** Nhà cung cấp NVL/dịch vụ.
- **Document ID:** Auto-ID.
- **Field:** `name`, `taxCode`, `category` (enum `material/service`), `status`.
- **Quan hệ:** 1 `suppliers` — N `supplier_contacts`; tham chiếu bởi `materials`, `transfer_orders` (nhập hàng), `payments`.
- **Index cần thiết:** `organizationId`.
- **Quyền truy cập:** `staff` (Mua hàng) `create`/`update`; `manager` `manage`.
- **Module sử dụng:** `crm`, `warehouse`, `production`.

### 16. `supplier_contacts`
- **Mục đích:** Người liên hệ cụ thể trong 1 nhà cung cấp.
- **Document ID:** Auto-ID.
- **Field:** `supplierId` (FK), `name`, `position`, `phone`, `email`.
- **Quan hệ:** N `supplier_contacts` — 1 `suppliers`.
- **Index cần thiết:** `supplierId`.
- **Quyền truy cập:** như `suppliers`.
- **Module sử dụng:** `crm`.

### 17. `leads`
- **Mục đích:** Khách tiềm năng (kế thừa `crm_leads` Stage 4).
- **Document ID:** Auto-ID.
- **Field:** `source`, `status` (enum `new/contacted/qualified/lost`), `assignedTo` (uid), `convertedCustomerId` (FK `customers`, null nếu chưa chuyển đổi).
- **Quan hệ:** N `leads` — 1 `users` (`assignedTo`); 1-1 `customers` khi chuyển đổi.
- **Index cần thiết:** (`organizationId`, `status`); (`assignedTo`).
- **Quyền truy cập:** `staff` `create`/`update`.
- **Module sử dụng:** `crm`.

### 18. `opportunities`
- **Mục đích:** Cơ hội bán hàng / Pipeline (kế thừa `crm_opportunities` Stage 4).
- **Document ID:** Auto-ID.
- **Field:** `leadId` hoặc `customerId` (FK), `stage` (enum theo pipeline), `estimatedValue`, `currency`, `expectedCloseDate`.
- **Quan hệ:** N `opportunities` — 1 `leads`/`customers`; 1 `opportunities` — N `quotations`.
- **Index cần thiết:** (`organizationId`, `stage`).
- **Quyền truy cập:** `staff` `create`/`update`.
- **Module sử dụng:** `crm`.

### 19. `price_lists`
- **Mục đích:** Bảng giá áp dụng theo `customer_group`/thời gian hiệu lực.
- **Document ID:** Auto-ID.
- **Field:** `name`, `customerGroupId` (FK, null = mặc định), `effectiveFrom`, `effectiveTo`, `items` (array<map>`{productId, price}` — tách sang collection riêng nếu > vài trăm dòng/bảng giá).
- **Quan hệ:** N `price_lists` — 1 `customer_groups`; `items[].productId` FK `products`.
- **Index cần thiết:** (`organizationId`, `customerGroupId`).
- **Quyền truy cập:** `manager` `manage`; `staff` `view`.
- **Module sử dụng:** `crm`, `business-os`.

### 20. `contracts`
- **Mục đích:** Hợp đồng (kế thừa `crm_contracts` Stage 4).
- **Document ID:** Auto-ID.
- **Field:** `contractNo`, `customerId` (FK), `salesOrderId` (FK `orders`), `signedDate`, `expiryDate`, `fileRef` (FK `files`), `status`.
- **Quan hệ:** N `contracts` — 1 `customers`; N `contracts` — 1 `orders`.
- **Index cần thiết:** (`organizationId`, `customerId`); (`status`, `expiryDate`) — cảnh báo sắp hết hạn.
- **Quyền truy cập:** `manager` `manage`; file `signed.pdf` bất biến sau khi tạo (`SECURITY_RULES.md` Stage 4 mục 6).
- **Module sử dụng:** `crm`.

---

## C. SALES

*Resource mặc định: `business-os` (không có slug "sales" riêng trong `MODULES[]` — Sales là chức năng con của Business OS, xem `DATABASE_REVIEW.md` mục 4.2). `workspaceId` mặc định: `business`.*

### 21. `products`
- **Mục đích:** Danh mục sản phẩm/dịch vụ bán ra.
- **Document ID:** Auto-ID.
- **Field:** `sku`, `name`, `categoryId` (FK `product_categories`), `unit`, `basePrice`, `currency`, `status` (enum `active/discontinued`).
- **Quan hệ:** 1 `products` — N `product_variants`, N `product_images`; N `products` — 1 `product_categories`.
- **Index cần thiết:** (`organizationId`, `categoryId`); `sku` (unique trong 1 Organization).
- **Quyền truy cập:** `manager` `manage`; `staff` `view`/`create`.
- **Module sử dụng:** `business-os`, `marketplace`, `crm` (báo giá).

### 22. `product_categories`
- **Mục đích:** Danh mục phân cấp sản phẩm (cây danh mục).
- **Document ID:** Auto-ID.
- **Field:** `name`, `parentCategoryId` (FK self, null = gốc).
- **Quan hệ:** self-referencing tree; 1 `product_categories` — N `products`.
- **Index cần thiết:** (`organizationId`, `parentCategoryId`).
- **Quyền truy cập:** `manager` `manage`.
- **Module sử dụng:** `business-os`, `marketplace`.

### 23. `product_variants`
- **Mục đích:** Biến thể sản phẩm (size/màu...).
- **Document ID:** Auto-ID.
- **Field:** `productId` (FK), `sku`, `attributes` (map, VD `{size, color}`), `priceAdjustment`.
- **Quan hệ:** N `product_variants` — 1 `products`.
- **Index cần thiết:** `productId`.
- **Quyền truy cập:** như `products`.
- **Module sử dụng:** `business-os`, `marketplace`.

### 24. `product_images`
- **Mục đích:** Ảnh sản phẩm/biến thể, thứ tự hiển thị.
- **Document ID:** Auto-ID.
- **Field:** `productId` hoặc `variantId` (FK), `fileId` (FK `files`), `sortOrder`.
- **Quan hệ:** N `product_images` — 1 `products`/`product_variants`.
- **Index cần thiết:** `productId`.
- **Quyền truy cập:** như `products`.
- **Module sử dụng:** `business-os`, `marketplace`.

### 25. `orders`
- **Mục đích:** Đơn bán hàng (gộp `crm_sales_orders` Stage 4 theo naming Stage 5).
- **Document ID:** Auto-ID (`orderNo` là field hiển thị — xem `ID_STANDARD.md` mục 3).
- **Field:** `orderNo`, `customerId` (FK), `quotationId` (FK, null), `status` (enum theo Approval Flow `WORKFLOW.md`), `totalAmount`, `currency`.
- **Quan hệ:** N `orders` — 1 `customers`; 1 `orders` — N `order_items`; N `orders` — 1 `quotations`; 1 `orders` — N `payments`/`receipts`/`returns`; 1-1 `contracts` (tuỳ chọn).
- **Index cần thiết:** (`organizationId`, `customerId`); (`organizationId`, `status`, `createdAt`).
- **Quyền truy cập:** `staff` `create`; duyệt đơn vượt hạn mức cần `manager`/`manage` (Approval Gate `WORKFLOW.md`).
- **Module sử dụng:** `business-os`, `crm`, `finance` (đối chiếu công nợ).

### 26. `order_items`
- **Mục đích:** Dòng chi tiết sản phẩm trong 1 đơn hàng.
- **Document ID:** Auto-ID.
- **Field:** `orderId` (FK), `productId` hoặc `variantId` (FK), `quantity`, `unitPrice`, `lineTotal`.
- **Quan hệ:** N `order_items` — 1 `orders`; N `order_items` — 1 `products`/`product_variants`.
- **Index cần thiết:** `orderId`.
- **Quyền truy cập:** như `orders`.
- **Module sử dụng:** `business-os`.

### 27. `quotations`
- **Mục đích:** Báo giá (đổi tên từ `crm_quotes` Stage 4).
- **Document ID:** Auto-ID.
- **Field:** `quotationNo`, `customerId` hoặc `opportunityId` (FK), `validUntil`, `status`.
- **Quan hệ:** N `quotations` — 1 `customers`/`opportunities`; 1-1 `orders` khi chuyển thành đơn.
- **Index cần thiết:** (`organizationId`, `customerId`).
- **Quyền truy cập:** `staff` `create`/`update`.
- **Module sử dụng:** `crm`, `business-os`.

### 28. `payments`
- **Mục đích:** Phiếu chi (tiền ra — trả NCC, lương, chi phí).
- **Document ID:** Auto-ID.
- **Field:** `paymentNo`, `purpose` (enum `supplier/payroll/expense`), `payeeId`, `amount`, `currency`, `method`, `status`.
- **Quan hệ:** N `payments` — 1 `suppliers`/`employees`/`expenses` (tuỳ `purpose`).
- **Index cần thiết:** (`organizationId`, `status`, `createdAt`).
- **Quyền truy cập:** resource `finance` — `staff` kế toán `create`; duyệt vượt hạn mức cần `manager`/`manage` (GATE Duyệt thanh toán `WORKFLOW.md`).
- **Module sử dụng:** `finance`, `business-os`.

### 29. `receipts`
- **Mục đích:** Phiếu thu (tiền vào — thu tiền khách hàng).
- **Document ID:** Auto-ID.
- **Field:** `receiptNo`, `orderId` (FK, tuỳ chọn), `payerId` (FK `customers`), `amount`, `currency`, `method`.
- **Quan hệ:** N `receipts` — 1 `orders`/`customers`.
- **Index cần thiết:** (`organizationId`, `orderId`).
- **Quyền truy cập:** resource `finance` — `staff` kế toán `create`.
- **Module sử dụng:** `finance`, `business-os`.

### 30. `returns`
- **Mục đích:** Hàng trả lại từ khách hàng.
- **Document ID:** Auto-ID.
- **Field:** `orderId` (FK), `reason`, `quantity`, `refundAmount`, `status`.
- **Quan hệ:** N `returns` — 1 `orders`.
- **Index cần thiết:** (`organizationId`, `orderId`, `status`).
- **Quyền truy cập:** `staff` `create`; `manager` duyệt hoàn tiền.
- **Module sử dụng:** `business-os`, `warehouse` (nhập lại kho), `finance` (hoàn tiền).

---

## D. WAREHOUSE

*Resource mặc định: `warehouse`. `workspaceId` mặc định: `warehouse`.*

### 31. `warehouses`
- **Mục đích:** Kho vật lý.
- **Document ID:** Auto-ID.
- **Field:** `name`, `branchId` (FK `branches`, đã có), `address` (map), `type` (enum `raw_material/finished_goods/mixed`).
- **Quan hệ:** 1 `warehouses` — N `locations`, N `inventory`.
- **Index cần thiết:** `organizationId`.
- **Quyền truy cập:** `manager` `manage`.
- **Module sử dụng:** `warehouse`.

### 32. `inventory`
- **Mục đích:** Số dư tồn kho hiện tại theo SKU × kho × vị trí (không phải nhật ký).
- **Document ID:** Auto-ID (hoặc `{warehouseId}_{sku}_{locationId}` xác định để tránh trùng số dư — khuyến nghị).
- **Field:** `warehouseId` (FK), `locationId` (FK), `productId` hoặc `variantId` (FK), `sku`, `quantityOnHand`, `quantityReserved`, `batchId` (nếu FIFO/FEFO).
- **Quan hệ:** N `inventory` — 1 `warehouses`/`locations`/`products`.
- **Index cần thiết:** (`organizationId`, `warehouseId`, `sku`); (`sku`).
- **Quyền truy cập:** `staff` kho `view`/`update` (nhập/xuất qua `inventory_transactions`, không sửa tay số dư).
- **Module sử dụng:** `warehouse`, `production`.

### 33. `inventory_transactions`
- **Mục đích:** Nhật ký nhập/xuất/chuyển/điều chỉnh (append-only) — nguồn dữ liệu để tính lại `inventory`.
- **Document ID:** Auto-ID.
- **Field:** `warehouseId`, `sku`, `type` (enum `in/out/transfer/adjustment`), `quantity`, `refCollection`, `refId` (tham chiếu đa hình tới `orders`/`production_orders`/`transfer_orders`/`stock_adjustments`).
- **Quan hệ:** đa hình qua `refCollection`+`refId`.
- **Index cần thiết:** (`organizationId`, `warehouseId`, `createdAt` desc); (`sku`, `createdAt`).
- **Quyền truy cập:** ghi tự động qua Cloud Function `onStockMovementWrite` (`FUNCTIONS_PLAN.md` Stage 4) — không ai `update`/`delete`.
- **Module sử dụng:** `warehouse`.

### 34. `stock_adjustments`
- **Mục đích:** Điều chỉnh tồn kho thủ công (hao hụt, sai lệch kiểm kê).
- **Document ID:** Auto-ID.
- **Field:** `warehouseId`, `sku`, `quantityDelta`, `reason`, `approvedBy`, `status`.
- **Quan hệ:** sinh 1 `inventory_transactions` tương ứng khi `status = approved`.
- **Index cần thiết:** (`organizationId`, `status`).
- **Quyền truy cập:** `staff` `create`; `manager` duyệt (`manage`).
- **Module sử dụng:** `warehouse`.

### 35. `stock_counts`
- **Mục đích:** Đợt kiểm kê định kỳ.
- **Document ID:** Auto-ID.
- **Field:** `warehouseId`, `scheduledDate`, `status`, `discrepancies` (array<map>`{sku, expected, actual}`).
- **Quan hệ:** N `stock_counts` — 1 `warehouses`; chênh lệch phát sinh `stock_adjustments`.
- **Index cần thiết:** (`organizationId`, `warehouseId`, `status`).
- **Quyền truy cập:** `staff` `create`/`update`; `manager` `manage`.
- **Module sử dụng:** `warehouse`.

### 36. `transfer_orders`
- **Mục đích:** Điều chuyển hàng giữa 2 kho/chi nhánh.
- **Document ID:** Auto-ID.
- **Field:** `transferNo`, `fromWarehouseId`, `toWarehouseId`, `status`.
- **Quan hệ:** N `transfer_orders` — 1 `warehouses` (2 chiều); sinh `inventory_transactions` type `transfer`.
- **Index cần thiết:** (`organizationId`, `fromWarehouseId`); (`toWarehouseId`, `status`).
- **Quyền truy cập:** `staff` `create`; `manager` duyệt.
- **Module sử dụng:** `warehouse`.

### 37. `locations`
- **Mục đích:** Vị trí lưu trữ cụ thể trong 1 kho (khu/kệ/tầng).
- **Document ID:** Auto-ID.
- **Field:** `warehouseId` (FK), `code` (VD `"A-01-03"`), `capacity`.
- **Quan hệ:** N `locations` — 1 `warehouses`.
- **Index cần thiết:** `warehouseId`.
- **Quyền truy cập:** `manager` `manage`.
- **Module sử dụng:** `warehouse`.

---

## E. FACTORY

*Resource mặc định: `production` (kế hoạch/công đoạn/QC/đóng gói) hoặc `factory-os` (thiết bị/nhà máy) — ghi chú riêng từng collection. `workspaceId` mặc định: `factory`.*

### 38. `production_orders`
- **Mục đích:** Lệnh sản xuất (gộp `production_plans` Stage 4 theo naming Stage 5).
- **Document ID:** Auto-ID.
- **Field:** `productionOrderNo`, `orderId` (FK `orders`, null nếu sản xuất tồn kho), `productId`, `quantityPlanned`, `quantityActual`, `startDate`, `endDate`, `status`.
- **Quan hệ:** 1 `production_orders` — N `production_steps`, N `quality_checks`, N `packing`; N `production_orders` — 1 `orders`.
- **Index cần thiết:** (`organizationId`, `status`); (`orderId`).
- **Quyền truy cập:** resource `production` — `manager` `create`/`manage`.
- **Module sử dụng:** `production`.

### 39. `production_steps`
- **Mục đích:** Công đoạn cụ thể trong 1 lệnh sản xuất (Dệt/Nhuộm/Cắt/May...).
- **Document ID:** Auto-ID.
- **Field:** `productionOrderId` (FK), `sequence` (number), `name`, `workCenterId` (FK), `machineId` (FK), `assignedTo` (uid), `status`, `startedAt`, `finishedAt`.
- **Quan hệ:** N `production_steps` — 1 `production_orders`; N — 1 `work_centers`/`machines`.
- **Index cần thiết:** (`productionOrderId`, `sequence`).
- **Quyền truy cập:** resource `production` — `staff` (công nhân/tổ trưởng) `update` trạng thái công đoạn được giao.
- **Module sử dụng:** `production`.

### 40. `bom`
- **Mục đích:** Bill of Materials — định mức NVL cho 1 sản phẩm.
- **Document ID:** Auto-ID.
- **Field:** `productId` (FK), `items` (array<map>`{materialId, quantityPerUnit, unit}`), `version`.
- **Quan hệ:** N `bom` — 1 `products`; `items[].materialId` FK `materials`.
- **Index cần thiết:** (`organizationId`, `productId`).
- **Quyền truy cập:** resource `production` — `manager` `manage`.
- **Module sử dụng:** `production`.

### 41. `materials`
- **Mục đích:** NVL/phụ liệu dùng trong sản xuất.
- **Document ID:** Auto-ID.
- **Field:** `sku`, `name`, `unit`, `category`, `reorderLevel`.
- **Quan hệ:** tham chiếu bởi `bom.items[].materialId`; liên kết `inventory.sku`.
- **Index cần thiết:** `organizationId`.
- **Quyền truy cập:** resource `production` — `manager` `manage`.
- **Module sử dụng:** `production`, `warehouse`.

### 42. `machines`
- **Mục đích:** Danh mục máy móc.
- **Document ID:** Auto-ID.
- **Field:** `name`, `type`, `workCenterId` (FK), `status` (enum `running/idle/maintenance`).
- **Quan hệ:** N `machines` — 1 `work_centers`; tham chiếu bởi `production_steps.machineId`.
- **Index cần thiết:** (`organizationId`, `workCenterId`).
- **Quyền truy cập:** resource `factory-os` — `manager` `manage`.
- **Module sử dụng:** `factory-os`.

### 43. `work_centers`
- **Mục đích:** Tổ/khu vực sản xuất (nhóm máy + người).
- **Document ID:** Auto-ID.
- **Field:** `name`, `branchId` (FK), `capacityPerShift`.
- **Quan hệ:** 1 `work_centers` — N `machines`, N `production_steps`.
- **Index cần thiết:** `organizationId`.
- **Quyền truy cập:** resource `factory-os` — `manager` `manage`.
- **Module sử dụng:** `factory-os`.

### 44. `quality_checks`
- **Mục đích:** Kết quả QC (kế thừa `production_qc_results` Stage 4).
- **Document ID:** Auto-ID.
- **Field:** `productionOrderId` hoặc `productionStepId` (FK), `result` (enum `pass/fail`), `inspector` (uid), `defects` (array<map>).
- **Quan hệ:** N `quality_checks` — 1 `production_orders`/`production_steps`.
- **Index cần thiết:** (`productionOrderId`); (`organizationId`, `result`, `createdAt`).
- **Quyền truy cập:** resource `production` — `staff` QC `create`.
- **Module sử dụng:** `production`.

### 45. `packing`
- **Mục đích:** Đóng gói thành phẩm trước khi nhập kho/giao hàng.
- **Document ID:** Auto-ID.
- **Field:** `productionOrderId` (FK), `quantity`, `packagingType`, `status`.
- **Quan hệ:** N `packing` — 1 `production_orders`; kết quả nhập vào `inventory` qua `inventory_transactions`.
- **Index cần thiết:** `productionOrderId`.
- **Quyền truy cập:** resource `production` — `staff` `create`/`update`.
- **Module sử dụng:** `production`, `warehouse`.

### 45a. `mrp_results` *(mới — Xác nhận Stage 5, quyết định #6)*
- **Mục đích:** Kết quả tính toán MRP (Material Requirements Planning) cho 1 lệnh sản xuất cụ thể — nhu cầu vật tư đã tính, khớp lại vai trò của `production_mrp_results` (Stage 4) từng bị thiếu ở bản nháp Stage 5 đầu tiên (đã ghi nhận là gap ở `DATABASE_REVIEW.md` mục 4.5, nay bổ sung).
- **Document ID:** Auto-ID.
- **Field:** `productionOrderId` (FK), `bomId` (FK `bom`), `materialNeeds` (array<map>`{materialId, quantityNeeded, quantityAvailable, quantityToPurchase}`), `calculatedAt`.
- **Quan hệ:** N `mrp_results` — 1 `production_orders`; N `mrp_results` — 1 `bom`; `materialNeeds[].materialId` FK `materials`.
- **Index cần thiết:** (`organizationId`, `productionOrderId`).
- **Quyền truy cập:** resource `production` — `manager` `manage`; sinh ra khi `production_orders` được lập kế hoạch.
- **Module sử dụng:** `production`.

### 45b. `production_reports` *(mới — Xác nhận Stage 5, quyết định #6)*
- **Mục đích:** Báo cáo tổng hợp sản xuất theo kỳ (sản lượng, tỷ lệ lỗi, hiệu suất máy/công đoạn) — tầng tổng hợp phía trên `production_orders`/`production_steps`/`quality_checks`, phục vụ Report Flow (`REPORT_FLOW.md` Stage 3).
- **Document ID:** Auto-ID.
- **Field:** `period` (string `YYYY-MM` hoặc `YYYY-Www`), `workCenterId` (FK, tuỳ chọn — báo cáo theo tổ hoặc toàn nhà máy nếu bỏ trống), `totalOutputQty`, `defectRate` (number %), `machineUtilizationRate` (number %).
- **Quan hệ:** N `production_reports` — 1 `work_centers` (tuỳ chọn); tổng hợp từ `production_orders`/`quality_checks` trong kỳ (tính toán, không FK cứng).
- **Index cần thiết:** (`organizationId`, `period`); (`workCenterId`, `period`).
- **Quyền truy cập:** resource `production` — `manager` `view`; sinh tự động (Cloud Function tổng hợp định kỳ).
- **Module sử dụng:** `production`.

---

## F. HR

*Resource mặc định: `hr` (**gap đã biết** — chưa có module chính thức `apps/hr` trong `MODULES[]`, kế thừa khoảng trống đã nêu ở `SYSTEM_ARCHITECTURE.md` Stage 3 và `HOSTING_STRUCTURE.md` Stage 4; các collection dưới đây vẫn thiết kế đầy đủ để sẵn sàng khi HR trở thành module chính thức). `workspaceId` mặc định: `business` (không có workspace `hr` riêng trong 8 loại đã chốt — xem `DATABASE_REVIEW.md` mục 4.9).*

### 46. `employees`
- **Mục đích:** Hồ sơ nhân sự đầy đủ (hợp đồng lao động, lương cơ bản) — khác `members` (chỉ là gán Role/RBAC).
- **Document ID:** Auto-ID.
- **Field:** `uid` (FK `users`, null nếu nhân viên chưa có tài khoản đăng nhập, VD công nhân), `departmentId` (FK `departments`, đã có nested), `position`, `contractType` (enum `fulltime/parttime/seasonal`), `baseSalary`, `startDate`.
- **Quan hệ:** N `employees` — 1 `departments`; 1 `employees` — N `attendance`, `leave_requests`, `payroll`, `kpi`, `training`.
- **Index cần thiết:** (`organizationId`, `departmentId`).
- **Quyền truy cập:** `manager` (phòng ban) `view`/`update` nhân viên phòng mình; `owner`/`admin` toàn bộ.
- **Module sử dụng:** (chưa có module chính thức — tạm thuộc `admin`/`business-os` cho tới khi có `apps/hr`).

### 47. `departments`
- **Mục đích:** Phòng ban — **đã tồn tại** (`organizations/{orgId}/branches/{branchId}/departments/{departmentId}`, nested). Stage 5 **không tạo lại**, các collection HR khác chỉ tham chiếu `departmentId` sẵn có.
- **Document ID:** đã có (nested).
- **Field:** đã có (`name`, `organizationId`, `branchId`, `createdAt`).
- **Quan hệ:** 1 `departments` — N `employees`.
- **Index cần thiết:** không đổi.
- **Quyền truy cập:** không đổi (`SECURITY_RULES.md` hiện có).
- **Module sử dụng:** `admin`.

### 48. `attendance`
- **Mục đích:** Chấm công.
- **Document ID:** Auto-ID.
- **Field:** `employeeId` (FK), `date`, `checkInAt`, `checkOutAt`, `method` (enum `manual/biometric`).
- **Quan hệ:** N `attendance` — 1 `employees`.
- **Index cần thiết:** (`employeeId`, `date`).
- **Quyền truy cập:** nhân viên tự `view` của mình; `manager` `view`/`update` cả phòng.
- **Module sử dụng:** (chưa có module chính thức).

### 49. `leave_requests`
- **Mục đích:** Đơn nghỉ phép.
- **Document ID:** Auto-ID.
- **Field:** `employeeId` (FK), `type` (enum `annual/sick/unpaid`), `startDate`, `endDate`, `status`, `approvedBy`.
- **Quan hệ:** N `leave_requests` — 1 `employees`.
- **Index cần thiết:** (`organizationId`, `status`); (`employeeId`).
- **Quyền truy cập:** nhân viên `create`; `manager` duyệt (Approval Gate).
- **Module sử dụng:** (chưa có module chính thức).

### 50. `payroll`
- **Mục đích:** Bảng lương theo kỳ.
- **Document ID:** Auto-ID.
- **Field:** `employeeId` (FK), `period` (string `YYYY-MM`), `grossAmount`, `deductions` (array<map>), `netAmount`, `status`.
- **Quan hệ:** N `payroll` — 1 `employees`; sinh `payments` (purpose `payroll`) khi chi trả.
- **Index cần thiết:** (`organizationId`, `period`); (`employeeId`, `period`).
- **Quyền truy cập:** resource `hr`/`finance` — chỉ kế toán lương (`manager` Finance) `manage`.
- **Module sử dụng:** `finance`.

### 51. `kpi`
- **Mục đích:** Đánh giá hiệu suất nhân viên theo kỳ.
- **Document ID:** Auto-ID.
- **Field:** `employeeId` (FK), `period`, `criteria` (array<map>`{name, score, weight}`), `totalScore`.
- **Quan hệ:** N `kpi` — 1 `employees`.
- **Index cần thiết:** (`employeeId`, `period`).
- **Quyền truy cập:** `manager` `create`/`manage`; nhân viên `view` của mình.
- **Module sử dụng:** (chưa có module chính thức).

### 52. `training` *(HR)*
- **Mục đích:** Đào tạo nội bộ nhân viên — khác `courses`/`students` (Academy, hướng tới khách hàng/đối tác); có thể tham chiếu `courseId` sang Academy nếu dùng chung nội dung.
- **Document ID:** Auto-ID.
- **Field:** `employeeId` (FK), `courseId` (FK `courses`, tuỳ chọn), `title`, `completionStatus`, `completedAt`.
- **Quan hệ:** N `training` — 1 `employees`; N `training` — 1 `courses` (tuỳ chọn).
- **Index cần thiết:** (`employeeId`, `completionStatus`).
- **Quyền truy cập:** nhân viên tự cập nhật tiến độ; `manager` `view` cả phòng.
- **Module sử dụng:** (chưa có module chính thức), `training-center` (khi dùng chung nội dung).

---

## G. FINANCE

*Resource mặc định: `finance`. `workspaceId` mặc định: `finance`. Bổ sung Stage 5 (Xác nhận, quyết định #5): `invoices`, `ledger_entries`, `fixed_assets`.*

### 53. `expenses`
- **Mục đích:** Chi phí phát sinh.
- **Document ID:** Auto-ID.
- **Field:** `category` (enum), `amount`, `currency`, `departmentId` (FK), `paymentId` (FK `payments`, tuỳ chọn), `status`.
- **Quan hệ:** N `expenses` — 1 `departments`; N `expenses` — 1 `payments`.
- **Index cần thiết:** (`organizationId`, `category`, `createdAt`).
- **Quyền truy cập:** `staff` kế toán `create`; `manager` duyệt.
- **Module sử dụng:** `finance`.

### 54. `revenues`
- **Mục đích:** Doanh thu ghi nhận (tự động từ `orders`/`receipts` hoặc nguồn khác).
- **Document ID:** Auto-ID.
- **Field:** `source` (enum `sales/other`), `amount`, `currency`, `refCollection`, `refId` (tham chiếu đa hình, VD `orders`).
- **Quan hệ:** đa hình qua `refCollection`+`refId`.
- **Index cần thiết:** (`organizationId`, `source`, `createdAt`).
- **Quyền truy cập:** ghi tự động (Cloud Function) hoặc `staff` kế toán `create` thủ công.
- **Module sử dụng:** `finance`.

### 55. `accounts`
- **Mục đích:** Hệ thống tài khoản kế toán (chart of accounts) — khác `ledger_entries` (mục 58b, đó là **bút toán/giao dịch thật**, đây là **danh mục tài khoản tĩnh**).
- **Document ID:** Auto-ID.
- **Field:** `code` (VD `"131"`), `name`, `type` (enum `asset/liability/equity/revenue/expense`), `parentAccountId` (FK self).
- **Quan hệ:** self-referencing tree; tham chiếu bởi `ledger_entries.debitAccountId`/`creditAccountId`.
- **Index cần thiết:** (`organizationId`, `code`) unique.
- **Quyền truy cập:** chỉ `manager` Finance (`chief_accountant` tương đương) `manage`.
- **Module sử dụng:** `finance`.

### 56. `cashbooks`
- **Mục đích:** Sổ quỹ tiền mặt/ngân hàng theo từng quỹ.
- **Document ID:** Auto-ID.
- **Field:** `name`, `type` (enum `cash/bank`), `currentBalance`, `currency`.
- **Quan hệ:** 1 `cashbooks` — N `payments`/`receipts` (qua field `cashbookId` ở 2 collection đó).
- **Index cần thiết:** `organizationId`.
- **Quyền truy cập:** `manager` Finance `manage`.
- **Module sử dụng:** `finance`.

### 57. `debts`
- **Mục đích:** Công nợ (gộp phải thu + phải trả, phân biệt bằng `type`) — kế thừa `finance_accounts_receivable`/`payable` Stage 4.
- **Document ID:** Auto-ID.
- **Field:** `type` (enum `receivable/payable`), `partyType` (enum `customer/supplier`), `partyId`, `invoiceId` (FK `invoices`, tuỳ chọn — công nợ phát sinh từ hoá đơn), `amount`, `dueDate`, `agingBucket`, `status`.
- **Quan hệ:** `partyId` FK `customers`/`suppliers` tuỳ `partyType`; `invoiceId` FK `invoices`.
- **Index cần thiết:** (`organizationId`, `type`, `status`); (`partyId`).
- **Quyền truy cập:** `staff` kế toán `view`; `manager` `manage`.
- **Module sử dụng:** `finance`.

### 58. `taxes`
- **Mục đích:** Nghĩa vụ thuế.
- **Document ID:** Auto-ID.
- **Field:** `type` (enum `VAT/CIT/PIT`), `period`, `amount`, `dueDate`, `status`.
- **Quan hệ:** độc lập, tổng hợp từ `orders`/`payroll`/`expenses` (ngoài phạm vi tính toán Stage 5).
- **Index cần thiết:** (`organizationId`, `period`, `status`).
- **Quyền truy cập:** chỉ `manager` Finance `manage`.
- **Module sử dụng:** `finance`.

### 58a. `invoices` *(mới — Xác nhận Stage 5, quyết định #5)*
- **Mục đích:** Hoá đơn chính thức (khác `orders` — 1 `orders` có thể có 0 hoặc nhiều `invoices` tuỳ thời điểm xuất hoá đơn; khác `receipts` — hoá đơn là chứng từ ghi nhận nghĩa vụ, phiếu thu là chứng từ đã thu tiền). Khớp lại vai trò `finance_invoices` (Stage 4) từng bị thiếu ở bản nháp Stage 5 đầu tiên.
- **Document ID:** Auto-ID (`invoiceCode` là field hiển thị — xem `ID_STANDARD.md` mục 3).
- **Field:** `invoiceCode`, `orderId` (FK `orders`), `customerId` (FK `customers`), `amount`, `currency`, `taxAmount`, `dueDate`, `status` (enum `draft/issued/paid/overdue/cancelled`), `fileRef` (FK `files`, bản PDF hoá đơn điện tử).
- **Quan hệ:** N `invoices` — 1 `orders`/`customers`; 1 `invoices` — N `receipts` (thanh toán từng phần); 1 `invoices` — N `debts` (nếu chưa thanh toán đủ).
- **Index cần thiết:** (`organizationId`, `customerId`); (`organizationId`, `status`, `dueDate`).
- **Quyền truy cập:** `staff` kế toán `create`; `manager` `manage` (huỷ/điều chỉnh).
- **Module sử dụng:** `finance`, `business-os`.

### 58b. `ledger_entries` *(mới — Xác nhận Stage 5, quyết định #5)*
- **Mục đích:** Bút toán sổ cái (double-entry) — khác `accounts` (danh mục tài khoản tĩnh); đây là **giao dịch ghi nhận thật** theo từng tài khoản, khớp lại vai trò `finance_journal_entries`/`finance_general_ledger` (Stage 4) từng bị thiếu ở bản nháp Stage 5 đầu tiên.
- **Document ID:** Auto-ID.
- **Field:** `debitAccountId` (FK `accounts`), `creditAccountId` (FK `accounts`), `amount`, `currency`, `description`, `sourceCollection`, `sourceId` (tham chiếu đa hình tới chứng từ gốc — `invoices`/`payments`/`receipts`/`payroll`...), `postedAt`.
- **Quan hệ:** N `ledger_entries` — 2 `accounts` (nợ + có); đa hình qua `sourceCollection`+`sourceId` tới chứng từ phát sinh.
- **Index cần thiết:** (`organizationId`, `debitAccountId`, `postedAt`); (`organizationId`, `creditAccountId`, `postedAt`); (`sourceCollection`, `sourceId`).
- **Quyền truy cập:** resource `finance` — chỉ hệ thống (Cloud Function) hoặc `manager` Finance `create`; **không ai** `update`/`delete` (append-only, giống `activity_logs` — xem `FIELD_STANDARD.md` mục 4).
- **Module sử dụng:** `finance`.

### 58c. `fixed_assets` *(mới — Xác nhận Stage 5, quyết định #5)*
- **Mục đích:** Tài sản cố định + lịch khấu hao — khớp lại vai trò `finance_fixed_assets`/`finance_depreciation_schedules` (Stage 4) từng bị thiếu ở bản nháp Stage 5 đầu tiên.
- **Document ID:** Auto-ID.
- **Field:** `name`, `cost`, `currency`, `usefulLifeMonths`, `depreciationMethod` (enum `straight_line/declining_balance`), `depreciationSchedule` (array<map>`{period, amount, accumulatedAmount}`), `status` (enum `in_use/disposed`).
- **Quan hệ:** khấu hao định kỳ sinh `ledger_entries` (ghi nhận chi phí khấu hao).
- **Index cần thiết:** (`organizationId`, `status`).
- **Quyền truy cập:** chỉ `manager` Finance `manage`.
- **Module sử dụng:** `finance`.

---

## H. ACADEMY

*Resource mặc định: `training-center`. `workspaceId` mặc định: `academy`.*

### 59. `courses`
- **Mục đích:** Khoá học.
- **Document ID:** Auto-ID.
- **Field:** `title`, `description`, `categorySlug`, `level` (enum `beginner/intermediate/advanced`), `instructorUid`, `isPublished`.
- **Quan hệ:** 1 `courses` — N `chapters`, N `students` (ghi danh), N `certificates`.
- **Index cần thiết:** (`organizationId`, `isPublished`).
- **Quyền truy cập:** `manager`/giảng viên `manage`; mọi member `view` khoá đã publish.
- **Module sử dụng:** `training-center`.

### 60. `chapters`
- **Mục đích:** Nhóm bài học trong 1 khoá.
- **Document ID:** Auto-ID.
- **Field:** `courseId` (FK), `title`, `sortOrder`.
- **Quan hệ:** N `chapters` — 1 `courses`; 1 `chapters` — N `lessons`.
- **Index cần thiết:** (`courseId`, `sortOrder`).
- **Quyền truy cập:** như `courses`.
- **Module sử dụng:** `training-center`.

### 61. `lessons`
- **Mục đích:** Bài học cụ thể (video/tài liệu).
- **Document ID:** Auto-ID.
- **Field:** `chapterId` (FK), `courseId` (FK, denormalize để query nhanh), `title`, `contentType` (enum `video/document/quiz`), `fileId` (FK `files`), `durationSec`.
- **Quan hệ:** N `lessons` — 1 `chapters`; 1 `lessons` — N `quizzes` (tuỳ chọn).
- **Index cần thiết:** (`chapterId`, `sortOrder`).
- **Quyền truy cập:** như `courses`.
- **Module sử dụng:** `training-center`.

### 62. `quizzes`
- **Mục đích:** Bài kiểm tra gắn với `lesson`/`chapter`.
- **Document ID:** Auto-ID.
- **Field:** `lessonId` hoặc `chapterId` (FK), `questions` (array<map>`{question, options, correctIndex}`), `passScore`.
- **Quan hệ:** N `quizzes` — 1 `lessons`/`chapters`.
- **Index cần thiết:** `lessonId`.
- **Quyền truy cập:** như `courses`.
- **Module sử dụng:** `training-center`.

### 63. `assignments`
- **Mục đích:** Bài tập cần nộp (khác `quizzes` — cần chấm thủ công).
- **Document ID:** Auto-ID.
- **Field:** `courseId` (FK), `title`, `dueDate`, `maxScore`.
- **Quan hệ:** N `assignments` — 1 `courses`; tiến độ nộp bài lưu ở `students.progressPercent`/field riêng (không tách collection nộp bài ở Stage 5 — xem `DATABASE_REVIEW.md` mục 4.4 nếu cần mở rộng sau).
- **Index cần thiết:** (`courseId`, `dueDate`).
- **Quyền truy cập:** giảng viên `manage`; học viên `view`.
- **Module sử dụng:** `training-center`.

### 64. `students`
- **Mục đích:** Hồ sơ ghi danh + tiến độ học.
- **Document ID:** Auto-ID (hoặc `{uid}_{courseId}` xác định để tránh ghi danh trùng).
- **Field:** `uid` (FK `users`), `courseId` (FK), `progressPercent`, `enrolledAt`, `completedAt`.
- **Quan hệ:** N `students` — 1 `users`; N `students` — 1 `courses`.
- **Index cần thiết:** (`courseId`, `uid`); (`uid`).
- **Quyền truy cập:** học viên `view`/`update` tiến độ của chính mình; giảng viên `view` cả lớp.
- **Module sử dụng:** `training-center`.

### 65. `certificates`
- **Mục đích:** Chứng chỉ cấp sau khi hoàn thành khoá.
- **Document ID:** Auto-ID.
- **Field:** `uid`, `courseId` (FK), `certificateNo`, `issuedAt`, `fileId` (FK `files`, bản PDF).
- **Quan hệ:** N `certificates` — 1 `students`(qua `uid`+`courseId`).
- **Index cần thiết:** (`uid`, `courseId`).
- **Quyền truy cập:** hệ thống tự sinh khi `students.progressPercent = 100`; học viên chỉ `view`.
- **Module sử dụng:** `training-center`.

---

## I. AI

*Resource mặc định: `ai-center` (riêng `workflows`/`automation` dùng chung `automation`). `workspaceId` mặc định: `ai`. Bổ sung Stage 5 (Xác nhận, quyết định #8): `ai_insights`, `ai_forecasts`, `ai_recommendations`, `ai_memories`.*

### 66. `prompts`
- **Mục đích:** Thư viện prompt mẫu cho AI Agent.
- **Document ID:** Auto-ID.
- **Field:** `agentId` (FK `ai_agents`, tuỳ chọn), `title`, `content` (text), `variables` (array<string>), `isShared` (boolean).
- **Quan hệ:** N `prompts` — 1 `ai_agents`.
- **Index cần thiết:** (`organizationId`, `agentId`).
- **Quyền truy cập:** `staff` `create`; `isShared=true` thì mọi member `view`.
- **Module sử dụng:** `ai-center`.

### 67. `knowledge`
- **Mục đích:** Cơ sở tri thức (RAG) — tài liệu/đoạn văn bản AI dùng để trả lời.
- **Document ID:** Auto-ID.
- **Field:** `title`, `sourceFileId` (FK `files`), `content` (text, hoặc tách `chunks` ở collection con nếu tài liệu lớn), `embeddingRef` (string, trỏ tới vector store **ngoài Firestore** — Firestore không tối ưu cho vector search, chỉ lưu con trỏ tham chiếu).
- **Quan hệ:** N `knowledge` — 1 `files`.
- **Index cần thiết:** `organizationId`.
- **Quyền truy cập:** `manager`/`admin` `manage`; AI Gateway (Cloud Function) `view`.
- **Module sử dụng:** `ai-center`.

### 68. `workflows`
- **Mục đích:** Định nghĩa quy trình tự động hoá (workflow engine).
- **Document ID:** Auto-ID.
- **Field:** `name`, `trigger` (map `{type, config}`), `steps` (array<map>`{action, config}`), `isActive`.
- **Quan hệ:** 1 `workflows` — N `automation` (log thực thi).
- **Index cần thiết:** (`organizationId`, `isActive`).
- **Quyền truy cập:** resource `automation` — `manager`/`admin` `manage`.
- **Module sử dụng:** `automation`.

### 69. `automation`
- **Mục đích:** Nhật ký thực thi (instance) của 1 `workflows` — phân biệt định nghĩa (workflows) và lượt chạy cụ thể (automation).
- **Document ID:** Auto-ID.
- **Field:** `workflowId` (FK), `status` (enum `running/success/failed`), `startedAt`, `finishedAt`, `log` (text).
- **Quan hệ:** N `automation` — 1 `workflows`.
- **Index cần thiết:** (`workflowId`, `createdAt` desc).
- **Quyền truy cập:** resource `automation` — ghi tự động; `manager` `view`.
- **Module sử dụng:** `automation`.

### 70. `models`
- **Mục đích:** Danh mục model AI khả dụng (GPT-4o, Gemini...) — catalog nền tảng, **không có `organizationId`** (dùng chung mọi Organization).
- **Document ID:** `{modelSlug}` (VD `gpt-4o`).
- **Field:** `provider`, `contextWindow`, `costPerInputToken`, `costPerOutputToken`, `isEnabled`.
- **Quan hệ:** tham chiếu bởi `usage_logs.modelSlug`.
- **Index cần thiết:** `provider`.
- **Quyền truy cập:** mọi member `view`; chỉ `super_admin` nền tảng `manage`.
- **Module sử dụng:** `ai-center`.

### 71. `tokens`
- **Mục đích:** Hạn mức/số dư token AI được cấp cho 1 Organization (gắn gói dịch vụ).
- **Document ID:** `{organizationId}` (1-1 với Organization).
- **Field:** `monthlyQuota`, `usedThisMonth`, `resetAt`.
- **Quan hệ:** 1-1 `organizations`.
- **Index cần thiết:** không cần (point-read).
- **Quyền truy cập:** `owner`/`admin` `view`; chỉ Cloud Function `update` số đã dùng.
- **Module sử dụng:** `ai-center`.

### 72. `usage_logs`
- **Mục đích:** Nhật ký từng lượt gọi AI để đo chi phí/hiệu năng — khác `ai_history` (nội dung hội thoại).
- **Document ID:** Auto-ID.
- **Field:** `organizationId`, `agentId` hoặc `modelSlug`, `uid`, `tokensInput`, `tokensOutput`, `latencyMs`, `costAmount`.
- **Quan hệ:** N `usage_logs` — 1 `ai_agents`/`models`/`users`.
- **Index cần thiết:** (`organizationId`, `createdAt` desc).
- **Quyền truy cập:** ghi tự động; `owner`/`admin` `view` (giám sát chi phí).
- **Module sử dụng:** `ai-center`.

### 72a. `ai_insights` *(mới — Xác nhận Stage 5, quyết định #8)*
- **Mục đích:** Gợi ý/cảnh báo do AI sinh ra từ dữ liệu nghiệp vụ (khác `usage_logs`/`ai_history` — 2 collection đó thiên về vận hành hạ tầng AI; đây là **kết quả phân tích nghiệp vụ**). Khớp lại vai trò `ai_insights` (Stage 4 `FIRESTORE_STRUCTURE.md`) từng bị thiếu ở bản nháp Stage 5 đầu tiên.
- **Document ID:** Auto-ID.
- **Field:** `sourceModule` (FK `MODULES`, VD `"warehouse"`), `sourceCollection`, `sourceId` (tham chiếu đa hình tới entity liên quan, VD 1 `inventory` sắp hết hàng), `severity` (enum `info/warning/critical`), `message`, `isRead` (boolean), `isDismissed` (boolean).
- **Quan hệ:** đa hình qua `sourceCollection`+`sourceId` tới bất kỳ entity nghiệp vụ nào; 1 `ai_insights` — N `ai_recommendations`.
- **Index cần thiết:** (`organizationId`, `sourceModule`, `createdAt` desc); (`organizationId`, `severity`).
- **Quyền truy cập:** resource `ai-center` — sinh tự động (Cloud Function/AI Gateway); `manager`/`leader` phụ trách module liên quan `view`.
- **Module sử dụng:** `ai-center` + module tương ứng `sourceModule`.

### 72b. `ai_forecasts` *(mới — Xác nhận Stage 5, quyết định #8)*
- **Mục đích:** Kết quả dự báo (nhu cầu, tồn kho, doanh thu...) do AI tính toán theo kỳ.
- **Document ID:** Auto-ID.
- **Field:** `sourceModule`, `metric` (string, VD `"demand_forecast"`), `period`, `predictedValue`, `confidenceScore` (number 0-1), `actualValue` (number, điền sau để đối chiếu độ chính xác).
- **Quan hệ:** không FK cứng — tổng hợp từ dữ liệu lịch sử nhiều collection theo `sourceModule`.
- **Index cần thiết:** (`organizationId`, `sourceModule`, `period`).
- **Quyền truy cập:** resource `ai-center` — sinh tự động; `manager` `view`.
- **Module sử dụng:** `ai-center` + module tương ứng.

### 72c. `ai_recommendations` *(mới — Xác nhận Stage 5, quyết định #8)*
- **Mục đích:** Đề xuất hành động cụ thể đi kèm 1 `ai_insights` (VD "Tạo Purchase Request cho NVL X").
- **Document ID:** Auto-ID.
- **Field:** `insightId` (FK `ai_insights`), `actionType` (string), `targetCollection`, `targetId` (đa hình — entity nên tạo/sửa), `status` (enum `pending/accepted/dismissed`).
- **Quan hệ:** N `ai_recommendations` — 1 `ai_insights`; đa hình qua `targetCollection`+`targetId`.
- **Index cần thiết:** (`organizationId`, `status`); (`insightId`).
- **Quyền truy cập:** resource `ai-center` — `manager`/`leader` `update` (accept/dismiss).
- **Module sử dụng:** `ai-center` + module tương ứng.

### 72d. `ai_memories` *(mới — Xác nhận Stage 5, quyết định #8)*
- **Mục đích:** Bộ nhớ dài hạn của AI Agent theo từng user/tổ chức (khác `ai_history` — lịch sử hội thoại thô; `ai_memories` là thông tin đã **chắt lọc** để agent "nhớ" giữa các phiên chat khác nhau, VD "user X thường hỏi về báo cáo tồn kho cuối tháng").
- **Document ID:** Auto-ID.
- **Field:** `agentId` (FK `ai_agents`), `uid`, `memoryType` (enum `preference/fact/summary`), `content` (text), `lastUsedAt`, `expiresAt` (number \| null).
- **Quan hệ:** N `ai_memories` — 1 `ai_agents`/`users`.
- **Index cần thiết:** (`agentId`, `uid`, `lastUsedAt` desc).
- **Quyền truy cập:** resource `ai-center` — user chỉ `view` bộ nhớ của chính mình; hệ thống (AI Gateway) `create`/`update`.
- **Module sử dụng:** `ai-center`.

---

## J. SYSTEM

*Catalog dùng chung toàn nền tảng — **không có** `organizationId`/`workspaceId` (xem `FIELD_STANDARD.md` mục 5).*

### 73. `menus`
- **Mục đích:** Cấu trúc menu điều hướng cấu hình động (thay vì hard-code `MODULES[]`) — nối tiếp `platform_config` đề xuất ở `FIRESTORE_STRUCTURE.md` Stage 4 mục 9.
- **Document ID:** Auto-ID.
- **Field:** `slug`, `label`, `icon`, `parentMenuId` (FK self), `sortOrder`, `moduleSlug` (FK `MODULES`), `isEnabled`.
- **Quan hệ:** self-referencing tree.
- **Index cần thiết:** (`parentMenuId`, `sortOrder`).
- **Quyền truy cập:** chỉ `super_admin` nền tảng `manage`; mọi member `view`.
- **Module sử dụng:** `admin` (quản lý), tất cả (tiêu thụ).

### 74. `pages`
- **Mục đích:** Trang nội dung tĩnh chỉnh sửa được qua Admin (CMS-lite — VD trang giới thiệu Marketplace, điều khoản dịch vụ).
- **Document ID:** Auto-ID.
- **Field:** `slug` (unique), `title`, `contentBlocks` (array<map>, tham chiếu `components`), `isPublished`.
- **Quan hệ:** N `pages` — N `components`.
- **Index cần thiết:** `slug` (unique).
- **Quyền truy cập:** `super_admin`/`admin` `manage`; công khai `view` nếu `isPublished`.
- **Module sử dụng:** `admin`, `marketplace`.

### 75. `components`
- **Mục đích:** Thư viện component cấu hình được (banner, block nội dung) dùng lại trên nhiều `pages`.
- **Document ID:** Auto-ID.
- **Field:** `type`, `config` (map), `name`.
- **Quan hệ:** N `components` — N `pages`.
- **Index cần thiết:** `type`.
- **Quyền truy cập:** `super_admin`/`admin` `manage`.
- **Module sử dụng:** `admin`.

### 76. `themes`
- **Mục đích:** Cấu hình theme hiển thị tuỳ biến (ngoài `packages/ui/src/styles/theme.css` cố định) — **hiện chưa có UI dùng** (theme hiện tại là neutral cố định theo CLAUDE.md mục 2), collection này ở dạng sẵn sàng cho tương lai.
- **Document ID:** `{organizationId}` (null/`"default"` = theme mặc định toàn nền tảng).
- **Field:** `primaryColor`, `logoFileId` (FK `files`).
- **Quan hệ:** 1-1 `organizations` (tuỳ chọn).
- **Index cần thiết:** không cần.
- **Quyền truy cập:** `owner`/`admin` `manage` (khi tính năng này được bật).
- **Module sử dụng:** chưa module nào dùng (dự phòng).

### 77. `languages`
- **Mục đích:** Danh mục ngôn ngữ hỗ trợ.
- **Document ID:** mã IETF (VD `vi`, `en`).
- **Field:** `name`, `nativeName`, `isDefault`.
- **Quan hệ:** tham chiếu bởi `users.locale`.
- **Index cần thiết:** không cần (danh mục nhỏ, đọc toàn bộ).
- **Quyền truy cập:** mọi người `view`; chỉ `super_admin` `manage`.
- **Module sử dụng:** tất cả.

### 78. `countries`
- **Mục đích:** Danh mục quốc gia (dùng cho field `address.countryCode`).
- **Document ID:** mã ISO alpha-2 (VD `VN`).
- **Field:** `name`, `dialCode`, `currencyCode` (FK `currencies`).
- **Quan hệ:** tham chiếu bởi mọi field `address`.
- **Index cần thiết:** không cần.
- **Quyền truy cập:** mọi người `view`; chỉ `super_admin` `manage`.
- **Module sử dụng:** tất cả.

### 79. `currencies`
- **Mục đích:** Danh mục tiền tệ (dùng cho mọi field `currency`).
- **Document ID:** mã ISO 4217 (VD `VND`).
- **Field:** `name`, `symbol`, `decimalDigits`.
- **Quan hệ:** tham chiếu bởi mọi field tiền tệ (`orders`, `payments`, `expenses`...).
- **Index cần thiết:** không cần.
- **Quyền truy cập:** mọi người `view`; chỉ `super_admin` `manage`.
- **Module sử dụng:** tất cả.

---

## K. LOGISTICS *(Domain mới — Xác nhận Stage 5, quyết định #7)*

*Resource mặc định: `logistics` (mới — chưa có slug module riêng trong `MODULES[]`, tạm thuộc phạm vi `warehouse`/`business-os` cho tới khi có module chính thức, xem `DATABASE_REVIEW.md` mục 4.6). `workspaceId` mặc định: `warehouse`.*

Domain này giải quyết dứt điểm khoảng trống "Logistics là tập con của Warehouse, chưa tách UI/dữ liệu riêng" đã nêu liên tục từ Stage 3 (`SYSTEM_ARCHITECTURE.md`) tới Stage 4 (`HOSTING_STRUCTURE.md`) — nay có 4 collection riêng, tách khỏi domain D (WAREHOUSE).

### 80. `shipments`
- **Mục đích:** Vận đơn giao hàng ra ngoài (từ kho tới khách hàng).
- **Document ID:** Auto-ID (`shipmentCode` là field hiển thị).
- **Field:** `shipmentCode`, `orderId` (FK `orders`), `warehouseId` (FK `warehouses`), `carrierId` (FK `carriers`), `status` (enum `pending/picked_up/in_transit/delivered/failed`), `estimatedDeliveryDate`.
- **Quan hệ:** N `shipments` — 1 `orders`/`warehouses`/`carriers`; 1 `shipments` — N `tracking`; 1 `shipments` — 1 `delivery_orders` (tuỳ chọn, khi cần phiếu giao hàng riêng).
- **Index cần thiết:** (`organizationId`, `orderId`); (`organizationId`, `status`, `estimatedDeliveryDate`).
- **Quyền truy cập:** `staff` kho/giao vận `create`/`update`.
- **Module sử dụng:** `warehouse`, `business-os`.

### 81. `delivery_orders`
- **Mục đích:** Phiếu giao hàng cụ thể (chứng từ giao nhận, có thể gộp nhiều `shipments` nếu giao cùng chuyến).
- **Document ID:** Auto-ID (`deliveryCode` là field hiển thị).
- **Field:** `deliveryCode`, `shipmentIds` (array<string>, FK `shipments`), `driverName`, `vehicleNo`, `signedByName`, `signedAt`, `status`.
- **Quan hệ:** N `delivery_orders` — N `shipments` (qua `shipmentIds`, số lượng nhỏ nên dùng mảng thay vì collection trung gian).
- **Index cần thiết:** (`organizationId`, `status`).
- **Quyền truy cập:** `staff` giao vận `create`/`update`.
- **Module sử dụng:** `warehouse`.

### 82. `tracking`
- **Mục đích:** Nhật ký cập nhật trạng thái vận đơn theo thời gian thực (append-only) — nhận từ `webhookShippingCarrier` (`FUNCTIONS_PLAN.md` Stage 4).
- **Document ID:** Auto-ID.
- **Field:** `shipmentId` (FK), `status`, `location` (string, tuỳ chọn), `note`, `occurredAt`.
- **Quan hệ:** N `tracking` — 1 `shipments`.
- **Index cần thiết:** (`shipmentId`, `occurredAt` desc).
- **Quyền truy cập:** ghi tự động qua webhook; mọi member liên quan `view`; không ai `update`/`delete` (append-only).
- **Module sử dụng:** `warehouse`.

### 83. `carriers`
- **Mục đích:** Danh mục đơn vị vận chuyển (nội bộ hoặc đối tác thứ 3 — GHTK/GHN/Viettel Post...).
- **Document ID:** Auto-ID.
- **Field:** `name`, `type` (enum `internal/third_party`), `contactInfo` (map), `apiConfig` (map, cấu hình tích hợp API nếu có — không lưu secret key trực tiếp, chỉ tham chiếu tới nơi lưu secret an toàn).
- **Quan hệ:** 1 `carriers` — N `shipments`.
- **Index cần thiết:** (`organizationId`, `type`).
- **Quyền truy cập:** `manager` `manage`.
- **Module sử dụng:** `warehouse`.

---

## Tham chiếu

- Quy ước field chung: [FIELD_STANDARD.md](FIELD_STANDARD.md)
- Quy ước Document ID: [ID_STANDARD.md](ID_STANDARD.md)
- Sơ đồ quan hệ đầy đủ: [COLLECTION_RELATIONSHIP.md](COLLECTION_RELATIONSHIP.md)
- Chi tiết composite index: [INDEX_PLAN.md](INDEX_PLAN.md)
- Chi tiết quyền truy cập: [SECURITY_PLAN.md](SECURITY_PLAN.md)
