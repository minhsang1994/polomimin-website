# HOSTING_STRUCTURE.md — Thiết kế Firebase Hosting

## 1. Đối chiếu với `packages/core/src/constants/modules.ts`

16 module đã có `slug` + `devPort` xác định — Hosting Stage 4 dùng chính xác 16 slug này làm tên **Firebase Hosting Site** (multi-site trong 1 project), không đặt tên mới:

| Slug | Cổng Dev | Trạng thái `implemented` |
|---|---|---|
| `dashboard` | 3000 | ✅ true |
| `admin` | 3001 | ✅ true |
| `training-center` | 3002 | ⚪ false |
| `ai-center` | 3003 | ⚪ false |
| `business-os` | 3004 | ⚪ false |
| `factory-os` | 3005 | ⚪ false |
| `marketplace` | 3006 | ⚪ false |
| `marketing` | 3007 | ⚪ false |
| `crm` | 3008 | ⚪ false |
| `warehouse` | 3009 | ⚪ false |
| `production` | 3010 | ⚪ false |
| `finance` | 3011 | ⚪ false |
| `affiliate` | 3012 | ⚪ false |
| `automation` | 3013 | ⚪ false |
| `community` | 3014 | ⚪ false |
| `documents` | 3015 | ⚪ false |

**Quyết định của người điều hành dự án (đã chốt, thay thế đề xuất ban đầu ở mục này)**: `crm` **không** là 1 Hosting Site/module riêng theo nghĩa "1 module trong 16 module nghiệp vụ" — CRM là **dịch vụ dùng chung** (shared service), phục vụ tất cả module cần dữ liệu khách hàng/lead/cơ hội (Business OS, Warehouse khi tạo đơn, Finance khi xuất hoá đơn...). Điều này khớp với thiết kế Firestore đã có sẵn ở `FIRESTORE_STRUCTURE.md` mục 2 (`crm_*` nested dưới `organizations/{orgId}`, được nhiều module khác tham chiếu tới qua `customerId`/`leadId`) — chỉ khác ở tầng Hosting: CRM không có subdomain riêng, được truy cập qua domain hợp nhất `app.mimin.vn` (xem mục 3).

Cũng xác nhận lại khoảng trống đã nêu ở Stage 3: **không có slug `hr` hay `logistics`** trong `packages/core` — nhất quán với khoảng trống đã ghi nhận ở `SYSTEM_ARCHITECTURE.md` (Stage 3).

## 2. Cấu trúc 3 môi trường

| Môi trường | Firebase Project | Mục đích | Ai được truy cập |
|---|---|---|---|
| **Production** | `mimin-platform-prod` | Dữ liệu thật, người dùng thật | Toàn bộ nhân viên MIMIN JSC + khách hàng (Marketplace, khi triển khai) |
| **Staging** | `mimin-platform-staging` | Kiểm thử trước khi phát hành, dữ liệu giống thật (đã ẩn danh/giả lập) | Đội QA nội bộ, không public |
| **Development** | `mimin-platform-dev` | Lập trình viên phát triển tính năng mới, CI chạy test | Đội phát triển, có thể xoá/reset dữ liệu bất kỳ lúc nào |

## 3. Cấu trúc Domain (đã chốt theo quyết định người điều hành dự án)

Thay cho phương án "mỗi module 1 subdomain riêng" (16 subdomain), kiến trúc domain thật **hợp nhất phần lớn module dưới 1 domain chính**, chỉ tách subdomain riêng cho số ít dịch vụ có lý do đặc thù:

```
Production:
   app.mimin.vn        → Domain hợp nhất — Dashboard + Business OS + CRM (dùng chung) +
                          Warehouse + Production + Finance + Marketing + Marketplace +
                          Affiliate + Automation + Community + Documents
                          (path-based routing, VD app.mimin.vn/warehouse, app.mimin.vn/finance —
                          mỗi path map tới 1 Hosting site/target riêng qua firebase.json rewrites,
                          xem mục 5)
   academy.mimin.vn     → Hosting site "training-center" (tách riêng — thương hiệu học viện riêng)
   factory.mimin.vn     → Hosting site "factory-os" (tách riêng — người dùng hiện trường, ít liên quan UI văn phòng)
   admin.mimin.vn       → Hosting site "admin" (tách riêng — quản trị hệ thống, không lẫn với app nghiệp vụ)
   api.mimin.vn         → Cloud Functions API Gateway (không phải Hosting site — điểm vào cho
                          aiGatewayProxy, webhookShippingCarrier, webhookPaymentGateway...,
                          xem FUNCTIONS_PLAN.md)

Staging:
   staging.app.mimin.vn, staging.academy.mimin.vn, staging.factory.mimin.vn,
   staging.admin.mimin.vn, staging.api.mimin.vn

Development:
   Không cần custom domain — dùng domain mặc định Firebase:
   {project-id}--{site-name}.web.app
```

**Vì sao không phải 1 subdomain/module**: người điều hành dự án xác nhận phần lớn module nghiệp vụ (Business OS, CRM, Warehouse, Production, Finance, Marketing, Marketplace, Affiliate, Automation, Community, Documents) nên xuất hiện với người dùng nội bộ như **1 sản phẩm hợp nhất** (`app.mimin.vn`), chỉ 3 dịch vụ có lý do tách domain riêng: **Academy** (thương hiệu đào tạo hướng ra ngoài, có thể có học viên/đối tác ngoài công ty), **Factory** (người dùng hiện trường nhà máy, thiết bị riêng, không cần chung trải nghiệm văn phòng), **Admin** (ranh giới bảo mật/quản trị nên tách biệt rõ khỏi app nghiệp vụ hàng ngày). `api.mimin.vn` là bổ sung mới so với thiết kế ban đầu — domain riêng cho Cloud Functions (mục 4 `FIREBASE_ARCHITECTURE.md`), giúp phân biệt rõ "gọi API/Webhook" và "mở app trong trình duyệt".

**Hệ quả với `AI Center`**: `ai-center` không có subdomain riêng (`ai.mimin.vn` đã bỏ) — nằm trong `app.mimin.vn` cùng nhóm với các module hợp nhất, người dùng truy cập qua path (VD `app.mimin.vn/ai-center`).

## 4. Ánh xạ Hosting Site ↔ Next.js App (`apps/*`)

Theo kiến trúc Core Platform (`docs/adr/0003-core-platform-architecture.md`), mỗi module là **1 Next.js app/deployment độc lập** — mỗi app tương ứng đúng 1 Firebase Hosting Site:

```
apps/dashboard/         → firebase hosting site: dashboard
apps/admin/             → firebase hosting site: admin
apps/business-os/       → firebase hosting site: business-os   (chưa tồn tại — chờ Roadmap)
apps/factory-os/        → firebase hosting site: factory-os     (chưa tồn tại)
... (tương tự các app khác theo Roadmap CLAUDE.md mục 8)
```

Next.js 15 trên Firebase Hosting cần **Firebase Hosting + Cloud Functions/Cloud Run integration** (Web Frameworks support) nếu dùng SSR/API Routes — không phải static export thuần, vì Core Platform dùng App Router + có thể cần server component. Đây là điểm kỹ thuật cần xác nhận khi triển khai thật (Stage 5, ngoài phạm vi Stage 4).

## 5. Multi-site Configuration (khái niệm `firebase.json`, minh hoạ — không phải file thật)

Mỗi module vẫn giữ **1 Hosting site riêng** (deploy độc lập, đúng CLAUDE.md mục 7) — thay đổi so với thiết kế ban đầu chỉ nằm ở tầng **domain/DNS** (mục 3): nhiều site cùng đứng sau 1 domain `app.mimin.vn` qua path rewrites, thay vì mỗi site có domain riêng:

```
"hosting": [
  { "target": "dashboard", "public": "apps/dashboard/out", ... },
  { "target": "admin", "public": "apps/admin/out", ... },
  { "target": "business-os", "public": "apps/business-os/out", ... },
  { "target": "crm", "public": "apps/crm/out", ... },
  { "target": "training-center", "public": "apps/training-center/out", ... },
  { "target": "factory-os", "public": "apps/factory-os/out", ... },
  ... (16 entries, mỗi app 1 target — không đổi số lượng site)
]

// Domain "app.mimin.vn" định tuyến theo path tới từng target (minh hoạ ý tưởng):
"hosting": {
  "site": "app-gateway",
  "rewrites": [
    { "source": "/business-os/**", "run": { "serviceId": "business-os" } },
    { "source": "/crm/**", "run": { "serviceId": "crm" } },
    { "source": "/warehouse/**", "run": { "serviceId": "warehouse" } },
    { "source": "/finance/**", "run": { "serviceId": "finance" } },
    { "source": "/**", "run": { "serviceId": "dashboard" } }
  ]
}
```

Mỗi `target` vẫn ánh xạ 1 Hosting Site riêng trong cùng 1 Firebase Project — cho phép deploy độc lập từng app (`firebase deploy --only hosting:dashboard`) mà không ảnh hưởng các app còn lại, đúng nguyên tắc "mỗi module 1 đơn vị triển khai độc lập" đã quyết định ở CLAUDE.md mục 7. `academy` (training-center), `factory-os`, `admin` là 3 target **không** đi qua rewrite hợp nhất — chúng gắn domain riêng trực tiếp (`academy.mimin.vn`, `factory.mimin.vn`, `admin.mimin.vn`).

## 6. Quy trình Deploy theo môi trường (CI/CD, khái niệm)

```
Nhánh Git "develop"  → auto-deploy → mimin-platform-dev
Nhánh Git "staging"  → auto-deploy (sau khi QA duyệt PR) → mimin-platform-staging
Nhánh Git "main"     → deploy thủ công/duyệt release → mimin-platform-prod
```

`.github/workflows/` (hiện là placeholder theo CLAUDE.md mục 9) sẽ là nơi hiện thực hoá quy trình này ở giai đoạn viết code thật — Stage 4 chỉ xác định **chiến lược**, không viết pipeline YAML.

## 7. Tham chiếu

- Danh sách 16 module & trạng thái: `packages/core/src/constants/modules.ts`, `CLAUDE.md` mục 6
- Cách mỗi Hosting Site kết nối Firestore/Storage cùng Organization: [FIRESTORE_STRUCTURE.md](FIRESTORE_STRUCTURE.md)
- Chiến lược 3 Firebase Project: [FIREBASE_ARCHITECTURE.md](FIREBASE_ARCHITECTURE.md) mục 1
