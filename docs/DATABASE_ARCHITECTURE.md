# DATABASE_ARCHITECTURE.md — Kiến trúc Database Thật (Stage 5)

Stage 5 thiết kế **Core Database** thật cho MIMIN Platform: 92 Firestore collection trải trên 11 domain nghiệp vụ, cộng với các collection nền tảng đã có (`organizations`, `branches`, `departments`, `members` — `packages/database/src/firestore/collections.ts`). **Đã đóng băng (freeze) theo Xác nhận Stage 5** — 10 quyết định kiến trúc đã chốt, xem `DATABASE_REVIEW.md` mục 7. Đây là điểm vào chính (master overview); chi tiết từng mảng nằm ở 7 tài liệu chuyên biệt cùng thư mục `docs/`.

**Ràng buộc không đổi**: chỉ thiết kế cấu trúc Collection — không viết code, không tạo Firestore project thật, không tạo dữ liệu mẫu, không viết API/Business Logic.

**Nguyên tắc đa ngành (quyết định #10)**: Database này phục vụ **đa ngành**, không thiết kế riêng cho ngành may/dệt (Garment) — ngành may chỉ là 1 module/cấu hình cụ thể (VD 1 giá trị `attributes` trong `product_variants`, 1 `workCenter` trong Factory). Không có field/collection nào hard-code thuật ngữ ngành may.

## 1. Phạm vi 11 Domain

| # | Domain | Số collection | Resource chính (`Permission.resource`) | `workspaceId` mặc định |
|---|---|---|---|---|
| A | CORE | 11 | `user`, `organization`, `role`, `permission`, `setting`, `notification`, `activity_log`, `file`, `ai-center` | `admin` (trừ `users`/`roles`/`permissions`) |
| B | CRM | 9 | `crm` | `business` |
| C | SALES | 10 | `business-os` | `business` |
| D | WAREHOUSE | 7 | `warehouse` | `warehouse` |
| E | FACTORY | 10 *(+2: `mrp_results`, `production_reports`)* | `production`, `factory-os` | `factory` |
| F | HR | 7 | `hr` *(gap — chưa có module chính thức, xem `DATABASE_REVIEW.md` mục 4.9)* | `business` *(không có workspace `hr` riêng trong 8 loại đã chốt)* |
| G | FINANCE | 9 *(+3: `invoices`, `ledger_entries`, `fixed_assets`)* | `finance` | `finance` |
| H | ACADEMY | 7 | `training-center` | `academy` |
| I | AI | 11 *(+4: `ai_insights`, `ai_forecasts`, `ai_recommendations`, `ai_memories`)* | `ai-center`, `automation` | `ai` |
| J | SYSTEM | 7 | dùng chung nền tảng, không gắn 1 module | *(không có — catalog toàn nền tảng)* |
| K | **LOGISTICS** *(domain mới)* | 4 *(`shipments`, `delivery_orders`, `tracking`, `carriers`)* | `logistics` *(mới, chưa có module chính thức)* | `warehouse` |
| | **Tổng** | **92** | | |

Domain `marketing` (1 trong 8 `workspaces.type`) **chưa có domain/collection nghiệp vụ riêng** ở Stage 5 — workspace tồn tại sẵn sàng nhưng chưa có bảng dữ liệu gắn vào, xem `DATABASE_REVIEW.md` mục 4.11.

Danh sách đầy đủ field/quan hệ/index/quyền/module từng collection: [COLLECTIONS.md](COLLECTIONS.md).

## 2. Quyết định kiến trúc trung tâm: Collection phẳng (flat) + `organizationId` + `workspaceId` + `branchId`

### 2.1. Vấn đề

`FIRESTORE_STRUCTURE.md` (Stage 4) từng thiết kế collection nghiệp vụ **nested** dưới `organizations/{orgId}/crm_leads`, `organizations/{orgId}/production_plans`... Stage 5 nhận danh sách tên collection **phẳng, không tiền tố module** (`leads`, `production_orders`...) — nếu giữ nguyên nested, tên phải là `organizations/{orgId}/leads` (được), nhưng với **79 collection** việc quản lý sub-collection dưới 1 document cha sẽ:
- Khó viết Cloud Function generic xử lý nhiều loại document cùng lúc (phải biết trước `orgId` để build path).
- Không hỗ trợ Collection Group Query hiệu quả bằng flat + field lọc khi cần thống kê xuyên Organization (báo cáo nền tảng, `super_admin`).
- Không khớp với danh sách tên "phẳng" mà Stage 5 yêu cầu.

### 2.2. Quyết định — **đã chốt (Xác nhận Stage 5, quyết định #2 và #4)**

Toàn bộ **92 collection Stage 5 là top-level (phẳng)**, mỗi document mang **3 field cách ly theo tầng**: `organizationId` (bắt buộc) → `workspaceId` (bắt buộc, 1 trong 8 loại cố định) → `branchId` (tuỳ chọn, chỉ khi gắn 1 chi nhánh vật lý cụ thể) — xem `FIELD_STANDARD.md` mục 3. Đây là mô hình **"Silo nông" (shallow multi-tenancy)**: cách ly bằng field thay vì bằng đường dẫn. **Không dùng nested collection cho nghiệp vụ chính** — subcollection chỉ dùng khi thật sự cần dữ liệu phụ thuộc chặt vòng đời document cha và không cần query độc lập xuyên tài liệu cha (VD `activity_logs` riêng theo 1 entity cụ thể, `comments`/`chat messages` gắn 1 hội thoại — hiện Stage 5 chưa có nhu cầu này nên chưa mở subcollection nào ngoài scaffold cũ, xem mục 2.3).

Hệ quả bảo mật quan trọng (phải xử lý đúng, xem `SECURITY_PLAN.md` mục 1): Organization Isolation **không còn tự nhiên từ cấu trúc path** như Stage 4 — phải kiểm tra tường minh `organizationId` trong Security Rules cho **cả `create` lẫn `read`/`update`**.

### 2.3. Ngoại lệ giữ nguyên nested (không đổi) — `roles` đã quyết định chuyển sang flat

`organizations`, `organizations/{orgId}/branches`, `.../departments`, `organizations/{orgId}/members` **giữ nguyên cấu trúc đã code** (`packages/database`) — đây là nhóm "cấu trúc tổ chức" (org chart), bản chất phân cấp thật (chi nhánh thuộc công ty), không phải dữ liệu nghiệp vụ phát sinh liên tục, và **đã có code chạy thật** nên không di chuyển để tránh phá vỡ scaffold hiện có.

`roles` và `permissions` **đã chốt là top-level, dùng chung** (Xác nhận Stage 5, quyết định #3) — không còn là "trường hợp trung gian" như bản nháp đầu Stage 5. Document ID dùng Auto-ID thống nhất (không dùng slug làm ID — quyết định #9), xem `ID_STANDARD.md` mục 2 và `COLLECTIONS.md` mục A.4/A.5. Đây là **thay đổi có ảnh hưởng tới code đã viết** (`packages/database/src/repositories/roles.ts`, `firestore/collections.ts` hiện định nghĩa `rolesCol(orgId)` nested) — cần cập nhật khi triển khai code thật (ghi nhận ở `DATABASE_REVIEW.md` mục 4.10, không tự động thực hiện ở Stage 5 vì Stage 5 chỉ thiết kế, không viết code).

## 3. Đa dự án Firebase — không đổi so với Stage 4

Vẫn dùng chiến lược 3 project (`mimin-platform-prod/staging/dev`) đã chốt ở `FIREBASE_ARCHITECTURE.md` mục 1 — Stage 5 không thiết kế lại, mọi collection ở đây tồn tại giống nhau về **cấu trúc** trên cả 3 project (khác nhau về **dữ liệu**).

## 4. Sơ đồ phân lớp tổng thể

```
┌───────────────────────────────────────────────────────────┐
│  Firebase Authentication                                   │
│  custom claims: { platformRole?, activeOrgId, roles{} }     │
└───────────────────────────┬───────────────────────────────┘
                             ▼
┌───────────────────────────────────────────────────────────┐
│  Firestore — 79 collection phẳng (Stage 5) +                │
│  organizations/branches/departments/members (đã có, nested) │
│  ────────────────────────────────────────────────────────── │
│  CORE → CRM → SALES → WAREHOUSE → FACTORY  (trục chính)      │
│         ↘ FINANCE   (thu/chi, công nợ, thuế)                 │
│  HR · ACADEMY · AI · SYSTEM  (domain phụ trợ)                │
└───────────────────────────┬───────────────────────────────┘
                             ▼
┌───────────────────────────────────────────────────────────┐
│  Cloud Functions (FUNCTIONS_PLAN.md, Stage 4)                │
│  — điểm nối Business Logic thật (Stage 5 KHÔNG thiết kế)     │
└───────────────────────────────────────────────────────────┘
```

## 5. Đối chiếu với Stage 3/Stage 4 (tính liên tục)

Toàn bộ entity đã thiết kế ở `DATA_FLOW.md` (Stage 3) và collection ở `FIRESTORE_STRUCTURE.md` (Stage 4) được đối chiếu từng dòng sang tên collection Stage 5 tại [COLLECTION_RELATIONSHIP.md](COLLECTION_RELATIONSHIP.md) mục 9 — phần lớn khớp 1-1 (đổi tên), một số **gộp lại** (VD `StockIn/Out/Transfer` → `inventory_transactions`). Toàn bộ gap từng ghi nhận ở bản nháp đầu Stage 5 (Logistics, Journal Entry/General Ledger, Invoice riêng, Fixed Asset, MRP Result, AI Insight/Forecast/Recommendation) **đã được bổ sung đầy đủ** theo Xác nhận Stage 5 (quyết định #5/#6/#7/#8) — chi tiết tại `DATABASE_REVIEW.md` mục 4 (nay đánh dấu ✅ đã giải quyết, chỉ còn vài điểm diễn giải nhỏ, không còn là gap thiếu collection).

## 6. Tham chiếu

- Danh mục 79 collection chi tiết: [COLLECTIONS.md](COLLECTIONS.md)
- Quy ước field: [FIELD_STANDARD.md](FIELD_STANDARD.md)
- Quy ước Document ID: [ID_STANDARD.md](ID_STANDARD.md)
- Sơ đồ quan hệ: [COLLECTION_RELATIONSHIP.md](COLLECTION_RELATIONSHIP.md)
- Kế hoạch Index: [INDEX_PLAN.md](INDEX_PLAN.md)
- Kế hoạch bảo mật: [SECURITY_PLAN.md](SECURITY_PLAN.md)
- Kiến trúc Firebase tổng thể (Stage 4): [FIREBASE_ARCHITECTURE.md](FIREBASE_ARCHITECTURE.md)
