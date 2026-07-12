# AUTHENTICATION.md — Thiết kế Firebase Authentication

## 1. Phương thức đăng nhập (Sign-in Providers)

| Provider | Dùng cho | Ưu tiên triển khai |
|---|---|---|
| **Email/Password** | Nhân viên nội bộ (Sales, Kế toán, Quản lý Kho...) — đã có UI thật (`03_login.html`, `04_register.html`, `05_forgot_password.html`) | Cao — provider chính |
| **Google** | Đăng nhập nhanh cho nhân viên dùng Google Workspace nội bộ, đối tác | Cao — đã có nút "Đăng nhập Google" trên UI login theo CLAUDE.md |
| **Phone (SMS OTP)** | Xác thực 2 lớp (2FA) cho hành động quan trọng (duyệt thanh toán lớn — xem `WORKFLOW.md` mục A.3), hoặc đăng nhập cho vai trò hiện trường (công nhân, nhân viên giao hàng) ít dùng email | Trung bình |
| **Facebook** | Khách hàng/đối tác bên ngoài đăng nhập vào Marketplace, Community (module tương lai) | Thấp — chỉ cần khi Marketplace/Community triển khai |
| **Apple** | Bắt buộc về mặt chính sách nếu có app iOS trong tương lai (Apple yêu cầu có Apple Sign-In nếu có Google/Facebook Sign-In trên iOS) | Thấp — chưa cần thiết khi chưa có app di động |
| **Anonymous** | Khách vãng lai dùng thử Marketplace/Community trước khi tạo tài khoản thật; demo Prototype cho khách hàng tiềm năng dùng thử nền tảng | Thấp — nâng cấp lên Email/Google khi khách quyết định đăng ký thật (Firebase hỗ trợ "link" anonymous account → account thật) |

**Nguyên tắc phân tầng**: Email/Password + Google phục vụ **người dùng nội bộ** (nhân viên MIMIN JSC) — đây là nhóm chính của cả 6 module nghiệp vụ. Phone/Facebook/Apple/Anonymous phục vụ **người dùng bên ngoài** (khách hàng Marketplace, đối tác) — nhóm này hiện ngoài phạm vi 7 module Data Flow (Stage 3) đã thiết kế, chỉ cần kích hoạt khi module Marketplace/Community/Community thật sự triển khai.

## 2. Vai trò (Role) — bộ Role chính thức (đã chốt bởi người điều hành dự án)

`packages/database/src/types.ts` đã định nghĩa `Role { permissions: Permission[] }` với `Permission = { resource, action }`. Bộ Role mặc định nên khởi tạo cho mỗi Organization mới **thay thế hoàn toàn** đề xuất persona-based ban đầu (đã lưu lại bên dưới mục 2.1 để tham chiếu lịch sử) bằng 1 hệ phân cấp chung, áp dụng nhất quán cho mọi module:

| Role (chính thức) | Cấp độ | Ý nghĩa | Resource/Action điển hình |
|---|---|---|---|
| `super_admin` | Nền tảng (vượt trên Organization) | Toàn quyền trên **mọi** Organization — dùng cho đội vận hành nền tảng MIMIN, không gắn với 1 doanh nghiệp khách hàng cụ thể | Mọi resource, action `manage`, không giới hạn `organizationId` |
| `owner` | Organization | Toàn quyền trong phạm vi 1 Organization (người tạo/sở hữu công ty trên nền tảng) | Mọi resource: `manage`, gồm cả `organization`/`role`/`member` |
| `admin` | Organization | Quản trị vận hành nội bộ, dưới `owner` | Hầu hết resource: `manage`, trừ các thao tác nhạy cảm nhất (xoá Organization, đổi `owner`) |
| `manager` | Branch/Department | Quản lý 1 đơn vị (chi nhánh/phòng ban), phê duyệt trong phạm vi phụ trách | Resource thuộc phòng ban: `manage`; resource khác: `view` |
| `leader` | Nhóm/Tổ | Điều phối trực tiếp 1 nhóm nhỏ, không có quyền cấu hình module | Resource thuộc nhóm: `create`/`update`; không có `delete`/`manage` |
| `staff` | Cá nhân | Nhân viên tác nghiệp hàng ngày | Resource được giao: `create`/`update`; không `delete` |
| `partner` | Ngoài tổ chức (B2B) | Đối tác kinh doanh (nhà phân phối, đại lý) truy cập giới hạn (VD Marketplace, đơn hàng liên quan tới họ) | Resource liên quan: `view`, đôi khi `create` (đặt đơn) |
| `customer` | Ngoài tổ chức | Khách hàng cuối dùng Marketplace/Community | Resource công khai + dữ liệu của chính họ: `view`/`create` (đơn hàng, phản hồi) |
| `supplier` | Ngoài tổ chức | Nhà cung cấp — cập nhật trạng thái đơn mua/giao hàng | `production_purchase_requests`, `logistics_shipments` liên quan: `view`/`update` giới hạn |
| `guest` | Ngoài tổ chức | Chưa xác thực đầy đủ/dùng thử (đi cùng Anonymous provider, xem mục 1) | Chỉ `view` nội dung công khai (demo, trang giới thiệu) |

**Nguyên tắc phân cấp**: `super_admin` > `owner` > `admin` > `manager` > `leader` > `staff` cho nhóm **nội bộ** tổ chức; `partner`/`customer`/`supplier`/`guest` là 4 vai trò **bên ngoài** tổ chức, quyền luôn giới hạn ở dữ liệu liên quan trực tiếp tới họ (không bao giờ có quyền `manage` cấp module).

### 2.1. Bảng ánh xạ persona Stage 3 → Role chính thức (tham chiếu, không còn là bảng Role gốc)

Bảng dưới đây giữ lại liên kết với persona đã dùng ở `USER_FLOW.md` (Stage 3), nay ánh xạ sang Role chính thức ở mục 2 thay vì dùng tên role riêng theo module:

| Persona Stage 3 | Role chính thức tương ứng | Ghi chú phạm vi |
|---|---|---|
| Hồ Minh Sang — Founder & CEO | `owner` | Toàn quyền Organization "MIMIN JSC" |
| Trần Văn Bình — Giám đốc Nhà máy | `manager` (phòng ban Factory) | `factory-os`: quyền quản lý; `warehouse`: `view` NVL |
| Lý Thị Phượng — Quản lý Kho | `manager` (phòng ban Warehouse) | `warehouse`: quyền quản lý; CRM: `view` |
| Đặng Thu Hà — Kế toán trưởng | `manager` (phòng ban Finance), có thể nâng `admin` nếu kiêm vận hành nền tảng | `finance`: quyền quản lý |
| Nhân viên Sales (suy luận) | `staff` | `crm`: `create`/`update` |
| Nhân viên Picking/Đóng gói | `staff` | `warehouse`: `update` giới hạn |
| Kế toán tổng hợp | `staff` hoặc `leader` tuỳ hạn mức phê duyệt | `finance`: `create`/`update` |
| "Xem báo cáo (Ban lãnh đạo)" | `leader` hoặc `manager` với action chỉ `view` trên mọi resource (cấu hình Permission riêng, không phải Role riêng) | Mọi resource: `view` |

**Ghi chú quan trọng (không đổi)**: `Permission.resource` trong code hiện tại dùng `MODULES.map(m => m.slug)` — quyền được cấp **theo cả module** (VD `finance`, `warehouse`), không theo từng entity con. Role chính thức ở mục 2 quyết định **cấp bậc** (owner/admin/manager/leader/staff hay partner/customer/supplier/guest); `Permission[]` gắn trên từng `Role` document quyết định **resource cụ thể nào** trong phạm vi cấp bậc đó — 2 tầng độc lập, không trộn lẫn.

## 3. Organization & Workspace — mô hình đa tổ chức (Multi-tenancy)

Đã có sẵn trong `packages/database/src/types.ts`:

```
Organization (1 công ty, VD "MIMIN JSC")
   └── Branch (1 chi nhánh, VD "Xưởng May 1 - Bình Dương")
         └── Department (1 phòng ban, VD "Kế toán", "Sản xuất")
   └── Role (vai trò, thuộc về Organization, dùng chung mọi Branch)
   └── Membership (1 user thuộc Organization, có thể gắn Branch + Department cụ thể)
```

**"Workspace"** trong yêu cầu Stage 4 = chính là **Organization** trong code hiện có (không cần thêm khái niệm mới) — 1 user có thể có nhiều `Membership` ở nhiều `Organization` khác nhau (đã có `membersGroup()` — collection group query tìm mọi `Membership` của 1 `uid` xuyên suốt mọi Organization), tương tự mô hình "workspace switcher" phổ biến (Slack, Notion): user đăng nhập 1 lần, chọn Organization đang làm việc, toàn bộ Firestore/Storage query sau đó lọc theo `organizationId` đang chọn.

**Ánh xạ tới Custom Claims (Firebase Auth)**:

```
Firebase Auth ID Token custom claims (minh hoạ khái niệm, không phải code thật):
{
  "activeOrgId": "org_mimin_jsc",
  "roles": {
    "org_mimin_jsc": "owner",
    "org_doi_tac_abc": "leader"
  }
}
```

Custom claims được Cloud Function cập nhật mỗi khi `Membership` thay đổi (xem `FUNCTIONS_PLAN.md` mục Automation) — giúp Security Rules đọc quyền trực tiếp từ token thay vì phải query thêm Firestore mỗi lần kiểm tra quyền (tối ưu hiệu năng rules, xem `SECURITY_RULES.md`).

## 4. Sơ đồ luồng đăng nhập (Authentication Flow)

```
Người dùng mở 1 trong 16 app (VD Warehouse OS)
        │
        ▼
Chưa đăng nhập? → Redirect /login (packages/auth RequireAuth)
        │
        ▼
Chọn phương thức: Email/Password | Google | Phone OTP
        │
        ▼
Firebase Auth xác thực → trả về ID Token + uid
        │
        ▼
Đọc custom claims (activeOrgId, roles) — nếu chưa có claims (user mới)
        │
        ├──[user mới, chưa có Membership nào]──→ Luồng "Tạo Organization mới" hoặc "Được mời vào Organization"
        │
        └──[đã có Membership]──→ Query Membership + Role tương ứng activeOrgId
                                        │
                                        ▼
                          packages/rbac RBACProvider nạp Permission[] vào Context
                                        │
                                        ▼
                          RequireAuth + RBAC Guard cho phép/chặn từng route theo Permission
```

## 5. Permission — chi tiết action theo CRUD + manage

`PermissionAction = "view" | "create" | "update" | "delete" | "manage"` (đã định nghĩa sẵn trong code). Quy tắc suy luận:

| Action | Ý nghĩa | Ví dụ áp dụng theo Approval Flow (Stage 3 WORKFLOW.md) |
|---|---|---|
| `view` | Chỉ đọc | `leader`/`manager` xem `194_financial_reports.html` với Permission chỉ `view` |
| `create` | Tạo mới bản ghi | `staff` (CRM) tạo `Lead`/`Quote` |
| `update` | Sửa bản ghi đã có | `staff` (Warehouse) cập nhật trạng thái `PickList` |
| `delete` | Xoá bản ghi | Giới hạn ở `manager` trở lên (VD chỉ `manager` phòng Warehouse xoá được `StockAdjustment` sai) |
| `manage` | Bao hàm toàn bộ 4 action trên + cấu hình module (VD sửa `200_finance_settings.html`) | Chỉ `owner`/`admin`, hoặc `manager` phụ trách đúng phòng ban (VD `finance`) |

`manage` cũng là điều kiện để vượt qua **Approval Gate** ở mức cao nhất (VD GATE 8 Duyệt thanh toán ở `WORKFLOW.md` — chỉ role có `finance: manage` mới duyệt được khoản vượt hạn mức).

## 6. Tham chiếu

- Vai trò chi tiết theo màn hình: [USER_FLOW.md](USER_FLOW.md) (Stage 3)
- Cấu trúc Firestore của Organization/Role/Membership: [FIRESTORE_STRUCTURE.md](FIRESTORE_STRUCTURE.md)
- Cách Security Rules dùng custom claims: [SECURITY_RULES.md](SECURITY_RULES.md)
- Cloud Function đồng bộ custom claims: [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md) mục Automation
