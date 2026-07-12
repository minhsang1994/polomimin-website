# ID_STANDARD.md — Chuẩn Document ID

## 1. Nguyên tắc chọn Document ID — **đã chốt (Xác nhận Stage 5, quyết định #9)**

**Nguyên tắc chung, áp dụng cho toàn bộ 92 collection nghiệp vụ (kể cả `roles`/`permissions`): giữ Firestore Auto-ID.** Mọi mã hiển thị cho người dùng hoặc dùng để tra cứu ổn định (số đơn hàng, số hoá đơn, mã khách hàng...) là **field riêng** (Business Code — xem mục 3), **không** dùng làm Document ID — kể cả khi mã đó trông "cố định" (VD slug vai trò `owner`/`manager`). Lý do: giữ 1 quy tắc ID duy nhất, dễ dự đoán, tránh phải xử lý ngoại lệ khi Business Code cần đổi định dạng sau này.

| Kiểu ID | Khi nào dùng | Ví dụ |
|---|---|---|
| **Auto-ID** (Firestore tự sinh, 20 ký tự) | **Mặc định cho toàn bộ 92 collection nghiệp vụ** — `customers`, `orders`, `production_orders`, `roles`, `permissions`, `workspaces`... | `customers/{autoId}`, `orders/{autoId}`, `roles/{autoId}` |
| **ID xác định = uid Firebase Auth** | Duy nhất 1 ngoại lệ: `users` — đại diện 1-1 cho 1 tài khoản Firebase Auth đã tồn tại sẵn uid, dùng lại uid làm Document ID để tránh phải lưu thêm 1 tầng tra cứu | `users/{uid}` |
| **ID xác định = mã chuẩn quốc tế** | Catalog **SYSTEM** dùng chuẩn quốc tế có sẵn (không phải "Business Code" nghiệp vụ tự sinh — không thuộc phạm vi quyết định #9) | `countries/{isoAlpha2}`, `currencies/{isoCode}`, `languages/{ietfTag}` |
| **ID xác định = tên tổ hợp cha-con** | Catalog nội bộ nhỏ cần khoá duy nhất tự nhiên, không phải dữ liệu nghiệp vụ phát sinh liên tục | `permissions` là ngoại lệ nhỏ — xem ghi chú mục 2 |

**Quy tắc chung**: không dùng số thứ tự tự tăng (auto-increment) làm Document ID — Firestore không hỗ trợ tốt (race condition khi nhiều client ghi đồng thời).

## 2. `roles` và `permissions` — Auto-ID + field `slug`/`resource`+`action` để tra cứu

Theo quyết định #9, `roles` **không còn dùng slug làm Document ID** như đề xuất trước đó — chuyển về Auto-ID như mọi collection khác. Để Security Rules vẫn tra cứu được đúng Role của 1 vai trò chuẩn mà không cần biết trước Auto-ID, mỗi document `roles/{autoId}` có thêm field `slug` (string, VD `"owner"`, `"manager"`) — **không unique tuyệt đối theo Firestore** (Firestore không ép unique ngoài Document ID) nhưng unique theo quy ước ứng dụng trong phạm vi 1 `organizationId`.

Hệ quả cho custom claims (Firebase Auth) — **cập nhật lại so với `AUTHENTICATION.md`/`SECURITY_RULES.md` Stage 4**: custom claims nên lưu trực tiếp **`roleId` (Auto-ID thật)**, không lưu `roleSlug`, để Security Rules `get(/roles/{roleId})` là point-read trực tiếp (nhanh, không cần query `where("slug","==",...)`). Cloud Function `onMembershipWrite`/`onOrganizationCreate` (`FUNCTIONS_PLAN.md` Stage 4) chịu trách nhiệm ghi đúng `roleId` (Auto-ID) vào claims khi tạo Organization/gán Membership — xem cập nhật ở `SECURITY_PLAN.md` mục 1.

`permissions` (catalog định nghĩa resource×action, không phải bảng gán quyền) vẫn dùng Document ID dạng `{resource}_{action}` (VD `finance_manage`) — đây được coi là **khoá tự nhiên của 1 catalog tĩnh** (tương tự `countries`/`currencies`), không phải "Business Code" theo nghĩa mã nghiệp vụ tự sinh tăng dần mà quyết định #9 muốn tách khỏi Document ID; số lượng permission cố định theo `RESOURCES` × 5 action, không phát sinh liên tục như đơn hàng/hoá đơn.

## 3. Mã nghiệp vụ hiển thị (Business Code) — luôn là field, không phải Document ID

Áp dụng rộng cho mọi entity nghiệp vụ chính (không chỉ nhóm SALES/CRM như bản nháp trước) — mẫu `{PREFIX}-{YYYYMM}-{seq}` cho chứng từ phát sinh theo thời gian, mẫu `{PREFIX}-{seq}` cho danh mục (khách hàng/sản phẩm) không gắn theo tháng:

| Collection | Field mã hiển thị | Định dạng đề xuất |
|---|---|---|
| `customers` | `customerCode` | `CUS-{seq}` |
| `suppliers` | `supplierCode` | `SUP-{seq}` |
| `products` | `productCode` | `PRD-{seq}` |
| `orders` | `orderCode` | `SO-{YYYYMM}-{seq}` |
| `quotations` | `quotationCode` | `QT-{YYYYMM}-{seq}` |
| `contracts` | `contractCode` | `CT-{YYYYMM}-{seq}` |
| `payments` / `receipts` | `paymentCode` / `receiptCode` | `PM-{YYYYMM}-{seq}` / `RC-{YYYYMM}-{seq}` |
| `invoices` *(mới)* | `invoiceCode` | `INV-{YYYYMM}-{seq}` |
| `production_orders` | `productionOrderCode` | `PO-{YYYYMM}-{seq}` |
| `transfer_orders` | `transferCode` | `TR-{YYYYMM}-{seq}` |
| `shipments` *(mới, Logistics)* | `shipmentCode` | `SH-{YYYYMM}-{seq}` |
| `delivery_orders` *(mới, Logistics)* | `deliveryCode` | `DO-{YYYYMM}-{seq}` |
| `employees` | `employeeCode` | `EMP-{seq}` |
| `certificates` | (đã có `certificateNo`, đổi tên `certificateCode` cho nhất quán) | `CERT-{seq}` |

Tất cả `{seq}` sinh bởi Cloud Function counter (nối tiếp `FUNCTIONS_PLAN.md` Stage 4 nhóm Automation) — **không sinh ở client** (tránh trùng số khi nhiều client tạo đồng thời). Lý do tách biệt Document ID và Business Code: mã nghiệp vụ có thể cần đổi định dạng theo năm tài chính/theo yêu cầu kế toán mà **không được phép đổi Document ID** (Document ID là khoá bất biến mọi nơi khác đang tham chiếu tới).

## 4. Bảng tổng hợp chiến lược ID theo từng domain (đại diện — xem chi tiết từng collection ở `COLLECTIONS.md`)

| Nhóm | Chiến lược ID |
|---|---|
| CORE | `users/{uid}` (ngoại lệ duy nhất); `roles`, `permissions`, `workspaces`, `organizations`, còn lại: Auto-ID |
| CRM, SALES, WAREHOUSE, FACTORY, HR, FINANCE, ACADEMY, AI, LOGISTICS | Auto-ID cho toàn bộ, không ngoại lệ |
| SYSTEM | `countries/{isoAlpha2}`, `currencies/{isoCode}`, `languages/{ietfTag}` dùng mã chuẩn quốc tế (không phải Business Code, xem mục 1); `models/{modelSlug}`, `menus`/`pages`/`components`/`themes` dùng Auto-ID |

## 5. Tham chiếu

- Field chuẩn đi kèm mọi Document: [FIELD_STANDARD.md](FIELD_STANDARD.md)
- Danh sách đầy đủ 92 collection + ID cụ thể từng cái: [COLLECTIONS.md](COLLECTIONS.md)
- Cách Security Rules dùng `roleId` (Auto-ID) từ custom claims: [SECURITY_PLAN.md](SECURITY_PLAN.md) mục 1
