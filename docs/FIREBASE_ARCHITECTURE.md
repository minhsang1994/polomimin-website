# FIREBASE_ARCHITECTURE.md — Kiến trúc Tổng thể Firebase Project

Stage 4 thiết kế kiến trúc Firebase cho MIMIN Platform — **thuần khái niệm**, không viết code, không kết nối project thật, không thiết kế UI/Business Logic. Tài liệu này là điểm vào chính (master overview); chi tiết từng mảng nằm ở 6 tài liệu chuyên biệt cùng thư mục `docs/`.

**Quan trọng — không thiết kế trên nền trống**: `packages/auth`, `packages/database`, `packages/rbac`, `packages/core` **đã có scaffolding thật** (kiến trúc thật, chưa nối project) từ trước. Toàn bộ Stage 4 được thiết kế **nhất quán và mở rộng trên nền đã có**, không thiết kế lại từ đầu:

| Package đã có | Đã scaffold gì |
|---|---|
| `packages/core/src/firebase/app.ts` | `getFirebaseApp()` — khởi tạo Firebase App singleton, đọc config từ 6 biến `NEXT_PUBLIC_FIREBASE_*` |
| `packages/core/src/constants/modules.ts` | `MODULES[]` — 16 module chính thức (slug, label, màu, cổng dev, trạng thái `implemented`) |
| `packages/auth/src/lib/firebase-auth.ts` | `getFirebaseAuth()` — Firebase Auth SDK thật |
| `packages/auth/src/context/auth-provider.tsx`, `require-auth.tsx` | React Context + route guard cho Auth |
| `packages/database/src/types.ts` | `Organization`, `Branch`, `Department`, `Role`, `Membership`, `Permission` — đã định nghĩa kiểu dữ liệu |
| `packages/database/src/firestore/collections.ts` | Đường dẫn Firestore thật: `organizations/{orgId}/branches/{branchId}/departments/{departmentId}`, `organizations/{orgId}/roles/{roleId}`, `organizations/{orgId}/members/{uid}` |
| `packages/database/src/repositories/*` | CRUD thật cho Organization/Branch/Department/Role/Membership (chưa chạy được vì chưa có project) |
| `packages/rbac` | Scaffold Context, chưa nối dữ liệu Role/Permission thật |

## 1. Chiến lược nhiều Firebase Project (Multi-project)

Theo yêu cầu thiết kế Hosting có Production/Development/Staging, khuyến nghị **3 Firebase Project vật lý riêng biệt** (không dùng 1 project rồi tự phân môi trường bằng flag) — đây là thực hành chuẩn của Firebase cho enterprise, đảm bảo cách ly hoàn toàn dữ liệu, Auth user, và rules giữa các môi trường:

| Project ID (đề xuất) | Môi trường | Mục đích |
|---|---|---|
| `mimin-platform-prod` | Production | Dữ liệu thật, khách hàng thật |
| `mimin-platform-staging` | Staging | Kiểm thử trước khi lên production, dữ liệu giống thật nhưng không phải thật |
| `mimin-platform-dev` | Development | Từng lập trình viên/CI thử nghiệm tự do, có thể xoá dữ liệu bất kỳ lúc nào |

Chi tiết tại [HOSTING_STRUCTURE.md](HOSTING_STRUCTURE.md).

## 2. Bản đồ 12 dịch vụ Firebase theo vai trò trong MIMIN Platform

| Dịch vụ | Vai trò trong MIMIN Platform | Tài liệu chi tiết |
|---|---|---|
| **Authentication** | Đăng nhập đa phương thức + gốc của RBAC (custom claims) | [AUTHENTICATION.md](AUTHENTICATION.md) |
| **Firestore** | Toàn bộ dữ liệu nghiệp vụ (Organization, Membership, và tương lai là entity của 7 module Data Flow) | [FIRESTORE_STRUCTURE.md](FIRESTORE_STRUCTURE.md) |
| **Storage** | File nhị phân: ảnh sản phẩm, hợp đồng PDF, hoá đơn, video đào tạo... | [STORAGE_STRUCTURE.md](STORAGE_STRUCTURE.md) |
| **Hosting** | Lưu trữ 16 Next.js app tĩnh/SSR (mỗi module 1 site) | [HOSTING_STRUCTURE.md](HOSTING_STRUCTURE.md) |
| **Cloud Functions** | Automation, Notification, AI Gateway, Webhook, Email — logic phía server | [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md) |
| **Firebase Extensions** | Tái sử dụng extension có sẵn thay vì tự viết (Trigger Email, Resize Images, Firestore→BigQuery) | Mục 3 bên dưới |
| **App Check** | Chặn truy cập Firestore/Storage/Functions từ client giả mạo (không phải app thật) | Mục 4 |
| **Remote Config** | Bật/tắt tính năng theo module mà không cần deploy lại (feature flag) | Mục 5 |
| **Analytics** | Theo dõi hành vi người dùng trên 16 app | Mục 6 |
| **Crashlytics** | Theo dõi lỗi runtime — chủ yếu áp dụng nếu có app di động sau này | Mục 6 |
| **Performance Monitoring** | Đo tốc độ tải trang/API theo từng module | Mục 6 |
| **Cloud Messaging (FCM)** | Đẩy thông báo — nối tiếp `WORKFLOW.md` Notification Flow đã thiết kế ở Stage 3 | [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md) mục Notification |

## 3. Firebase Extensions — đề xuất dùng thay vì tự viết Cloud Function

| Extension | Thay thế cho | Áp dụng ở |
|---|---|---|
| `Resize Images` | Cloud Function tự viết resize ảnh sản phẩm/avatar | Storage `products/`, `avatars/` |
| `Trigger Email` | Cloud Function tự viết gửi email | Email Flow (hoá đơn, xác nhận đơn hàng) — xem FUNCTIONS_PLAN.md |
| `Export Collections to BigQuery` | Cloud Function tự viết đồng bộ dữ liệu báo cáo | Nối tiếp `REPORT_FLOW.md` Stage 3 — dữ liệu Finance/Production dồn về BigQuery để phân tích sâu |
| `Firestore Text Search with Algolia` | Tự viết full-text search | Tìm kiếm khách hàng/sản phẩm/tài liệu (nối tiếp `10_search.html` đã có trong prototype) |

**Nguyên tắc**: ưu tiên Extension có sẵn cho tác vụ phổ biến (resize ảnh, gửi email, export dữ liệu) — chỉ tự viết Cloud Function cho logic đặc thù nghiệp vụ MIMIN (Automation/AI Gateway/Webhook, xem `FUNCTIONS_PLAN.md`).

## 4. App Check

Bảo vệ toàn bộ endpoint Firestore/Storage/Functions khỏi truy cập không qua ứng dụng thật (bot, scraping, gọi trực tiếप API key lộ ra ngoài):

| Nền tảng | Provider App Check |
|---|---|
| Web (16 Next.js app) | reCAPTCHA Enterprise (khuyến nghị) hoặc reCAPTCHA v3 |
| Mobile (nếu có sau này) | Play Integrity (Android) / App Attest (iOS) |

Áp dụng **bắt buộc** cho môi trường Production, **tuỳ chọn** (có thể tắt để dễ debug) ở Development.

## 5. Remote Config — Feature Flag theo Module

Vì `MODULES[]` đã có trường `implemented: boolean`, Remote Config nên dùng để **bật/tắt module ở tầng vận hành** mà không cần sửa code:

```
remote_config:
  module_enabled.training_center   = false   (chờ Roadmap bước sau)
  module_enabled.ai_center          = false
  module_enabled.business_os        = true
  module_enabled.factory_os         = false
  ...
  feature.ai_forecast_v2            = false  (bật thử nghiệm dần theo % người dùng)
  feature.approval_2fa              = true
```

Đây là cầu nối kỹ thuật cho đúng cột "Trạng thái" (🟢/⚪) đã liệt kê ở `CLAUDE.md` mục 6 — mỗi khi 1 module chuyển từ ⚪ Nền móng sang 🟢 Đang phát triển, chỉ cần đổi `module_enabled.<slug>` thay vì chờ deploy.

## 6. Analytics, Crashlytics, Performance Monitoring

| Dịch vụ | Phạm vi áp dụng | Ghi chú |
|---|---|---|
| Analytics | Cả 16 Web app (Google Analytics 4 for Firebase) | Theo dõi sự kiện theo Module Flow (VD event `sales_order_confirmed`, `invoice_paid`) — đặt tên event theo đúng entity ở `DATA_FLOW.md` Stage 3 để dữ liệu Analytics và Data Flow nói cùng 1 "ngôn ngữ" |
| Crashlytics | Chỉ áp dụng nếu MIMIN Platform có app di động (hiện chưa có trong CLAUDE.md/roadmap) | Ưu tiên thấp ở giai đoạn hiện tại |
| Performance Monitoring | Cả 16 Web app | Theo dõi tốc độ tải theo từng module — nối tiếp phát hiện ở `PERFORMANCE_REVIEW.md` (Stage 2) về chênh lệch tải trang giữa các thế hệ HTML, nay áp dụng cho app thật |

## 7. Sơ đồ tích hợp tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│  16 Next.js App (Hosting) — mỗi module 1 site                 │
│  packages/ui, packages/core, packages/auth (dùng chung)        │
└───────────────────────────┬─────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      ┌──────────────┐ ┌──────────┐ ┌──────────────┐
      │ Authentication│ │ Firestore │ │ Storage       │
      │ (custom claims│ │ (org data,│ │ (file nhị phân│
      │  = role/org)  │ │  entity)  │ │  theo module)  │
      └──────┬───────┘ └────┬─────┘ └──────┬───────┘
             │               │               │
             └───────────────┼───────────────┘
                              ▼
                    ┌──────────────────┐
                    │  Cloud Functions   │
                    │  Automation/       │
                    │  Notification/     │
                    │  AI Gateway/       │
                    │  Webhook/Email     │
                    └────────┬─────────┘
                              │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      Cloud Messaging   AI Agents (ngoài    Email/Webhook
      (đẩy thông báo)   Firebase, gọi qua    ra hệ thống ngoài
                         Cloud Functions)
```

App Check bảo vệ toàn bộ mũi tên đi vào Firestore/Storage/Functions. Remote Config + Analytics + Performance Monitoring quan sát xuyên suốt (không vẽ riêng để tránh rối sơ đồ).

## 8. Tham chiếu

- Auth chi tiết: [AUTHENTICATION.md](AUTHENTICATION.md)
- Cấu trúc dữ liệu: [FIRESTORE_STRUCTURE.md](FIRESTORE_STRUCTURE.md)
- File nhị phân: [STORAGE_STRUCTURE.md](STORAGE_STRUCTURE.md)
- Môi trường & domain: [HOSTING_STRUCTURE.md](HOSTING_STRUCTURE.md)
- Quy tắc bảo mật: [SECURITY_RULES.md](SECURITY_RULES.md)
- Server logic: [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md)
- Cấu trúc thư mục dự án tổng thể: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- Đối chiếu Data Flow Stage 3: [DATA_FLOW.md](DATA_FLOW.md), [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)
