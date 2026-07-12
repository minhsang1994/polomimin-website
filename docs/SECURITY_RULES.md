# SECURITY_RULES.md — Thiết kế Quy tắc Bảo mật

**Chỉ thiết kế nguyên tắc/khái niệm.** Các đoạn "minh hoạ" dưới đây viết theo cú pháp gần giống Firestore/Storage Rules để **diễn đạt ý tưởng cho dễ hiểu**, không phải file `.rules` thật để deploy — không tạo `firestore.rules`/`storage.rules` thật ở bước này.

## 1. Nguyên tắc nền tảng — 4 lớp kiểm tra

Mọi request (Firestore/Storage) đi qua đúng 4 lớp kiểm tra theo thứ tự, thiếu 1 lớp là chặn:

```
1. Authentication  — request.auth != null (đã đăng nhập)
2. Organization Isolation — dữ liệu request thuộc đúng activeOrgId của user
3. Role           — user có Role hợp lệ trong Organization đó
4. Permission     — Role đó có Permission { resource, action } phù hợp thao tác đang thực hiện
```

## 2. Authentication Rules (khái niệm)

```
match /organizations/{orgId}/{document=**} {
  allow read, write: if request.auth != null;
}
```

Không cho phép bất kỳ truy cập nào (kể cả `read`) nếu chưa đăng nhập — khác với nhiều app public-read, MIMIN Platform là hệ thống nội bộ doanh nghiệp nên **mặc định chặn toàn bộ truy cập ẩn danh** trừ khi rule cụ thể hơn mở lại (VD Anonymous provider dùng cho Marketplace demo — xem `AUTHENTICATION.md` mục 1 — sẽ có rule mở riêng, phạm vi hẹp, không nằm trong `organizations/*`).

## 3. Organization Isolation Rules (khái niệm)

Đây là lớp bảo mật **quan trọng nhất** của toàn bộ kiến trúc multi-tenant — dựa trên custom claim `activeOrgId` đã thiết kế ở `AUTHENTICATION.md` mục 3:

```
match /organizations/{orgId}/{document=**} {
  allow read, write: if request.auth.token.roles[orgId] != null;
}
```

Diễn giải: user chỉ được đọc/ghi dữ liệu của `{orgId}` nếu trong custom claim `roles` có key đúng bằng `orgId` đó (nghĩa là user có `Membership` hợp lệ tại Organization này) — **không dựa vào `activeOrgId` để chặn** (vì `activeOrgId` chỉ là "đang xem cái nào trên UI", không phải quyền truy cập thật), mà dựa vào việc `orgId` có tồn tại trong map `roles` hay không. Đây là điểm minh hoạ quan trọng cần nhớ khi triển khai thật: **Organization Isolation không tin URL/param client gửi lên, mà tin token đã ký của Firebase Auth.**

## 4. Role & Permission Rules (khái niệm)

Nối tiếp lớp 3, cần biết Role đó có Permission gì. Vì `Role.permissions[]` là mảng lưu trong Firestore document (`organizations/{orgId}/roles/{roleId}`), không nằm trong custom claim (custom claim có giới hạn dung lượng 1000 byte, không thể nhét toàn bộ Permission list) — nên rules cần đọc thêm document Role tương ứng bằng hàm `get()`:

```
function hasPermission(orgId, resource, action) {
  let roleId = request.auth.token.roles[orgId]; // đây là roleId đã gán, không phải role name — xem ghi chú mục 5
  let role = get(/databases/$(database)/documents/organizations/$(orgId)/roles/$(roleId)).data;
  return role.permissions.hasAny([{resource: resource, action: action}])
      || role.permissions.hasAny([{resource: resource, action: "manage"}]);
}

match /organizations/{orgId}/crm_leads/{leadId} {
  allow read:   if hasPermission(orgId, "crm", "view");
  allow create: if hasPermission(orgId, "crm", "create");
  allow update: if hasPermission(orgId, "crm", "update");
  allow delete: if hasPermission(orgId, "crm", "delete");
}
```

`manage` luôn được coi là bao hàm 4 action còn lại (đúng ngữ nghĩa đã định nghĩa ở `AUTHENTICATION.md` mục 5).

## 5. Điểm cần thống nhất trước khi code thật (ghi chú mở)

Mục 3 ở `AUTHENTICATION.md` minh hoạ custom claim `roles` ánh xạ `orgId → role name` (VD `"org_mimin_jsc": "owner"`), nhưng mục 4 ở đây cần `roleId` để `get()` đúng document Role. Hai cách hoà giải (quyết định khi viết code thật, không quyết ở Stage 4):
- (a) Đổi custom claim thành `orgId → roleId` (Firestore doc id) thay vì role *name*, rules `get()` trực tiếp; hoặc
- (b) Giữ role *name*, thêm 1 bước Cloud Function đồng bộ tạo Role document có **id trùng tên** (VD doc id = `"owner"`) để `get()` không cần bảng tra thêm.

Đề xuất (b) đơn giản hơn cho Organization mới (Role mặc định luôn có id cố định: `super_admin`, `owner`, `admin`, `manager`, `leader`, `staff`, `partner`, `customer`, `supplier`, `guest` — xem bộ Role chính thức ở `AUTHENTICATION.md` mục 2) — ghi nhận là quyết định kỹ thuật cho `FUNCTIONS_PLAN.md` mục Automation khi khởi tạo Organization mới.

## 6. Storage Rules (khái niệm) — theo Category ở STORAGE_STRUCTURE.md

```
match /organizations/{orgId}/{category}/{allPaths=**} {
  allow read:  if request.auth.token.roles[orgId] != null;
  allow write: if request.auth.token.roles[orgId] != null
               && request.resource.size < maxSizeFor(category)
               && request.resource.contentType.matches(allowedTypeFor(category));
}
```

`maxSizeFor`/`allowedTypeFor` tương ứng bảng giới hạn dung lượng/định dạng đã định nghĩa ở `STORAGE_STRUCTURE.md` mục 11 (minh hoạ khái niệm — hàm giả định, không phải cú pháp Storage Rules thật hỗ trợ hàm tự định nghĩa theo cách này, cần chuyển thành `if` lồng khi viết rule thật).

**Rule đặc biệt — Contracts bất biến** (đã nêu ở `STORAGE_STRUCTURE.md` mục 6): `signed.pdf` chỉ cho phép `create`, chặn `update`:

```
match /organizations/{orgId}/contracts/{contractId}/signed.pdf {
  allow create: if hasPermission(orgId, "crm", "manage");
  allow update, delete: if false; // bất biến sau khi tạo
}
```

## 7. Bảng tổng hợp theo Role — minh hoạ áp dụng thực tế

| Role | Ví dụ Rule áp dụng |
|---|---|
| `super_admin` | Bỏ qua kiểm tra `orgId` — có `manage` trên mọi resource của **mọi** Organization |
| `owner`/`admin` | Bỏ qua kiểm tra Permission chi tiết trong phạm vi 1 Organization — có `manage` trên mọi resource nên mọi `hasPermission()` trả `true` |
| `manager` (Finance) | Chỉ pass rule trên `organizations/{orgId}/finance_*` và Storage `invoices/`, `contracts/` (nếu được cấp thêm) |
| `staff` (Warehouse) | Chỉ pass `update` trên `warehouse_stock_movements`, không pass `delete` (theo mục 2 `AUTHENTICATION.md`) |
| `leader` (chỉ xem báo cáo) | Chỉ pass `read` trên mọi collection, mọi `write` đều bị chặn |
| `partner`/`customer`/`supplier` | Chỉ pass rule trên resource có `refId` khớp chính họ (VD `logistics_shipments.supplierId == request.auth.uid`), không bao giờ pass `manage` |
| `guest` | Chỉ pass `read` trên nội dung đánh dấu công khai (`isPublic == true`), chặn mọi `write` |

## 8. App Check — lớp bảo vệ bổ sung (không thay thế Auth Rules)

Theo `FIREBASE_ARCHITECTURE.md` mục 4, App Check chặn request không đến từ app thật (bot/script) **trước khi** request chạm tới Firestore/Storage Rules — 2 lớp độc lập, không thay thế nhau: App Check trả lời "request này có đến từ 1 trong 16 app thật không?", Rules trả lời "user này có quyền với dữ liệu này không?".

## 9. Tham chiếu

- Custom claims & Role definition: [AUTHENTICATION.md](AUTHENTICATION.md)
- Danh sách collection cần rule: [FIRESTORE_STRUCTURE.md](FIRESTORE_STRUCTURE.md)
- Danh sách category Storage cần rule: [STORAGE_STRUCTURE.md](STORAGE_STRUCTURE.md)
- Cloud Function đồng bộ Role/claims: [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md)
