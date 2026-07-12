# SECURITY_PLAN.md — Kế hoạch Quyền truy cập theo Collection

**Chỉ thiết kế nguyên tắc/khái niệm** — nối tiếp `docs/SECURITY_RULES.md` (Stage 4), điều chỉnh cho đúng cấu trúc **collection phẳng (top-level) + field `organizationId`** đã chọn ở Stage 5 (khác ví dụ nested `organizations/{orgId}/crm_leads/{leadId}` minh hoạ ở Stage 4). Không viết `.rules` thật, không deploy.

## 1. Điều chỉnh 4 lớp kiểm tra cho collection phẳng

Stage 4 (`SECURITY_RULES.md` mục 1-3) định nghĩa 4 lớp kiểm tra trên đường dẫn nested `organizations/{orgId}/...`. Với 79 collection Stage 5 là **top-level**, Organization Isolation không còn tự nhiên nằm trong path — phải kiểm tra qua field `resource.data.organizationId`:

```
// Minh hoạ khái niệm — không phải cú pháp rule thật để deploy
// Custom claims: { platformRole?: "super_admin", activeOrgId, roles: { [orgId]: roleId } }
// roleId ở đây là Firestore Auto-ID THẬT của document trong collection `roles` (top-level,
// dùng chung — Xác nhận Stage 5 quyết định #3/#9), KHÔNG còn là roleSlug như bản nháp trước.
function hasAccess(orgId) {
  return request.auth.token.platformRole == "super_admin" ||
         request.auth.token.roles[orgId] != null;
}
function hasPermission(orgId, resourceName, action) {
  let roleId = request.auth.token.roles[orgId];
  let role = get(/databases/$(database)/documents/roles/$(roleId)).data;
  return request.auth.token.platformRole == "super_admin" ||
         (role.organizationId == orgId &&
          (role.permissions.hasAny([{resource: resourceName, action: action}]) ||
           role.permissions.hasAny([{resource: resourceName, action: "manage"}])));
}

match /customers/{customerId} {
  allow read:   if hasAccess(resource.data.organizationId) &&
                   hasPermission(resource.data.organizationId, "crm", "view");
  allow create: if hasAccess(request.resource.data.organizationId) &&
                   hasPermission(request.resource.data.organizationId, "crm", "create");
  allow update, delete: if hasAccess(resource.data.organizationId) &&
                   hasPermission(resource.data.organizationId, "crm", "update");
}
```

Trường `workspaceId`/`branchId` (nếu áp dụng — xem `FIELD_STANDARD.md` mục 3) **không** thêm 1 lớp kiểm tra Permission riêng — chỉ dùng để **lọc phạm vi dữ liệu ở tầng UI/Query** (VD user chỉ thấy dữ liệu của workspace/branch mình đang chọn), quyền hạn thật vẫn quyết định bởi `organizationId` + Role/Permission như trên. Nếu sau này cần phân quyền mịn theo workspace (VD 1 user chỉ được vào workspace `finance`, không được vào `factory`), bổ sung field `workspaceIds: string[]` vào `members`/`roles` — chưa cần ở Stage 5.

**Điểm khác biệt quan trọng so với Stage 4**: `create` phải kiểm tra `request.resource.data.organizationId` (dữ liệu đang được ghi), còn `read`/`update`/`delete` kiểm tra `resource.data.organizationId` (dữ liệu đã tồn tại) — để chặn user "ghi lụi" 1 document gán `organizationId` của tổ chức khác (tấn công chèn dữ liệu chéo tenant — rủi ro **chỉ phát sinh** với thiết kế phẳng, không có ở thiết kế nested Stage 4, nên đây là điểm bảo mật **bắt buộc** phải làm đúng khi chuyển sang flat).

## 2. Ma trận quyền theo Role (nội bộ) × Domain

`view` = đọc, `write` = tạo/sửa trong phạm vi được giao, `manage` = toàn quyền domain (gồm xoá, cấu hình).

| Domain | `super_admin` | `owner` | `admin` | `manager` | `leader` | `staff` |
|---|---|---|---|---|---|---|
| CORE (users/roles/settings...) | manage (mọi org) | manage | manage (trừ xoá org) | view + write (phạm vi phòng ban) | view | view own |
| CRM | manage | manage | manage | manage (phòng Sales) | write | write (được giao) |
| SALES | manage | manage | manage | manage (phòng Sales) | write | write (được giao) |
| WAREHOUSE | manage | manage | manage | manage (kho phụ trách) | write | write (giới hạn nhập/xuất) |
| LOGISTICS *(mới)* | manage | manage | manage | manage (kho/giao vận phụ trách) | write | write (cập nhật vận đơn được giao) |
| FACTORY | manage | manage | manage | manage (xưởng phụ trách) | write | write (công đoạn được giao) |
| HR | manage | manage | manage | view + write (phòng ban mình) | view own | view own |
| FINANCE | manage | manage | manage | manage (Finance) | view | write (giới hạn, cần duyệt) |
| ACADEMY | manage | manage | manage | manage (giảng viên) | view | view + tiến độ cá nhân |
| AI | manage | manage | manage | manage (cấu hình agent) | view | write (dùng agent, tạo prompt) |
| SYSTEM | manage | view | manage (nếu được ủy quyền) | view | view | view |

`partner`/`customer`/`supplier`/`guest` (bên ngoài tổ chức) **không nằm trong ma trận trên** — quyền của 4 role này luôn giới hạn ở field liên kết trực tiếp tới chính họ (VD `supplier` chỉ `view`/`update` giới hạn trên `payments`/`transfer_orders` có `payeeId`/`supplierId` khớp uid của họ), không bao giờ có `manage` ở bất kỳ domain nào — xem ví dụ cụ thể ở `SECURITY_RULES.md` Stage 4 mục 7.

## 3. Quy tắc đặc biệt theo loại collection

| Loại collection | Quy tắc |
|---|---|
| **Append-only log** (`activity_logs`, `inventory_transactions`, `usage_logs`, `automation`) | `create` chỉ qua Cloud Function (Admin SDK, bỏ qua Security Rules) hoặc hệ thống; **không ai** được `update`/`delete` kể cả `super_admin` — toàn vẹn audit trail |
| **Sở hữu cá nhân** (`users/{uid}`, `notifications` với `recipientUid`, `students` với `uid`) | Chỉ chính chủ (`request.auth.uid == field`) `view`/`update` một phần field (không tự sửa `progressPercent` tuỳ ý ở `students` — field này chỉ Cloud Function cập nhật khi hoàn thành `quizzes`) |
| **Catalog nền tảng** (`models`, `languages`, `countries`, `currencies`, `permissions`) | Mọi người đã đăng nhập `view`; chỉ `super_admin` **nền tảng** (không phải `owner` từng Organization) `manage` |
| **Bất biến sau khi tạo** (`contracts.fileRef` trỏ `signed.pdf`, `certificates`) | `create` một lần, chặn cứng `update`/`delete` (kế thừa nguyên tắc `SECURITY_RULES.md` Stage 4 mục 6) |
| **Duyệt theo hạn mức** (`orders`, `payments`, `leave_requests`, `stock_adjustments`, `returns`) | `update` field `status` sang `approved` chỉ cho phép nếu Role có `manage` trên domain tương ứng — ánh xạ trực tiếp Approval Gate đã thiết kế ở `WORKFLOW.md` Stage 3 |

## 4. Trường hợp `super_admin` — vượt ranh giới Organization

`super_admin` là Role duy nhất **không bị chặn bởi Organization Isolation** (mục 1 `SECURITY_RULES.md` Stage 4) — dùng cho đội vận hành nền tảng MIMIN (không phải nhân sự khách hàng thuê nền tảng). Cần custom claim riêng biệt `platformRole: "super_admin"` (khác `roles[orgId]`) để Security Rules phân biệt rõ "toàn quyền 1 Organization" (`owner`) và "toàn quyền mọi Organization" (`super_admin`) — bổ sung so với Stage 4, ghi nhận là điểm cần thêm khi cấu hình custom claims thật (xem `DATABASE_REVIEW.md` mục 4.8).

## 5. App Check & Storage Rules

Không đổi so với Stage 4 (`FIREBASE_ARCHITECTURE.md` mục 4, `SECURITY_RULES.md` mục 6-8) — Stage 5 chỉ bổ sung quy tắc riêng cho Firestore collection mới, không thiết kế lại Storage/App Check.

## 6. Tham chiếu

- Quy tắc bảo mật gốc (4 lớp, Storage, App Check): [SECURITY_RULES.md](SECURITY_RULES.md) (Stage 4)
- Danh sách quyền truy cập từng collection cụ thể: [COLLECTIONS.md](COLLECTIONS.md)
- Bộ Role chính thức: [AUTHENTICATION.md](AUTHENTICATION.md) mục 2
