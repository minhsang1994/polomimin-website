# PROJECT_STRUCTURE.md

## 1. Vị trí trong monorepo

Prototype HTML tĩnh (`pages/` + `assets/`) là **một nhánh song song, độc lập** với hệ thống Next.js (`apps/dashboard`, `apps/admin`, `packages/*`) đã mô tả trong `CLAUDE.md` gốc. Đây là công cụ khám phá UI/UX nhanh (Prototype), **không phải** mã nguồn sẽ chạy production trực tiếp — khi bước sang Product Architecture, các màn hình đã đóng băng ở đây sẽ được dùng làm **tài liệu tham chiếu thiết kế** để build lại bằng React/Next.js + dữ liệu thật trong `apps/*`.

```
MIMIN Platform/
├── apps/                    # Next.js Core Platform thật (Dashboard, Admin) — KHÔNG thuộc phạm vi tài liệu này
├── packages/                 # Shared packages Next.js — KHÔNG thuộc phạm vi tài liệu này
├── pages/                     # ★ 199 file HTML prototype tĩnh (phạm vi tài liệu này)
├── assets/                    # ★ CSS/JS dùng chung cho pages/ (phạm vi tài liệu này)
│   ├── css/
│   │   ├── main.css                 # Token + Shell chung (805 dòng)
│   │   ├── business-layout.css       # Business OS + Finance OS tái dùng (645 dòng)
│   │   ├── factory-layout.css        # Factory OS (342 dòng)
│   │   ├── warehouse-layout.css      # Warehouse OS (264 dòng)
│   │   └── agent-layout.css          # AI Agents (756 dòng)
│   ├── js/
│   │   ├── main.js                   # MiminShell — shell chung (309 dòng)
│   │   ├── business-layout.js        # MiminBiz (314 dòng)
│   │   ├── factory-layout.js         # MiminFac (355 dòng)
│   │   ├── warehouse-layout.js       # MiminWH (365 dòng)
│   │   └── agent-layout.js           # MiminAgentLayout (234 dòng)
│   ├── icons/                        # Khai báo trong CLAUDE.md ban đầu — hiện KHÔNG dùng (icon = emoji, xem ICON_GUIDELINE.md); thư mục trống hoặc dự phòng
│   ├── images/                       # Dự phòng, chưa có ảnh thật (prototype dùng emoji/placeholder CSS)
│   └── fonts/                        # Dự phòng — font thật tải qua Google Fonts CDN, không host cục bộ
├── docs/                       # ★ Tài liệu Design System (14 file, xem danh sách bên dưới) + docs/adr, docs/architecture (thuộc phần Next.js, không đụng tới)
├── REVIEW_REPORT.md            # Báo cáo review đợt đầu (1–79)
├── FACTORY_REVIEW_REPORT.md     # Báo cáo review Factory OS (102–141)
├── WAREHOUSE_REVIEW_REPORT.md   # Báo cáo review Warehouse OS (142–171)
├── FINANCE_REVIEW_REPORT.md     # Báo cáo review Finance OS (172–201)
└── UI_FREEZE_REPORT.md          # ★ Báo cáo tổng kết UI Freeze (tài liệu này tạo ra)
```

## 2. Quy ước đánh số file (`pages/NNN_ten.html`)

| Dải số | Module | Số file thực tế | Ghi chú |
|---|---|---|---|
| 01–10 | Core Platform (Auth, Home, Settings, Search) | 10 | |
| 11–20 | Academy / Training Center | 10 | |
| 21–41 | AI Center / AI Studio (2 thế hệ công cụ AI) | 20 (thiếu số 39) | Số 39 bị bỏ qua ngay từ đầu — không rõ lý do lịch sử, không ảnh hưởng chức năng |
| 42–69 | AI Agents (dashboard hub + 24 persona + marketplace + settings) | 28 | |
| 70–101 | Business OS / CRM | 31 (thiếu số 99) | Số 99 bị bỏ qua tương tự số 39 |
| 102–141 | Factory OS | 39 | Đủ toàn bộ dải, không thiếu số |
| 142–171 | Warehouse OS | 30 | Đủ toàn bộ dải |
| 172–201 | Finance & Accounting OS | 30 | Đủ toàn bộ dải |
| **Tổng** | | **199/201** | Chênh lệch 2 do số 39 và 99 vốn không tồn tại từ trước khi tài liệu này được lập |

Danh sách chi tiết từng file: xem [HTML_INDEX.md](HTML_INDEX.md).

## 3. Hai thế hệ kiến trúc CSS/JS

| | Thế hệ 1 | Thế hệ 2 |
|---|---|---|
| Phạm vi file | `01`–`38` (38 file) | `40`–`201` (161 file) |
| Cơ chế CSS | Toàn bộ token + shell khai báo lại trong `<style>` mỗi trang | Link `assets/css/main.css` dùng chung |
| Cơ chế JS | Hàm shell (theme/toast/nav) viết lại trong `<script>` mỗi trang | Link `assets/js/main.js` (`MiminShell`) dùng chung |
| Component chuyên module | Không có (mỗi trang tự phối CSS riêng theo nhu cầu) | Có file `*-layout.css/js` riêng theo module (`business-/factory-/warehouse-/agent-`) |
| Giá trị token thực tế | **Giống hệt thế hệ 2** (đã đối chiếu trực tiếp, xem DESIGN_TOKENS.md mục 7) | Chuẩn |

Đây là nợ kỹ thuật lớn nhất về mặt cấu trúc: 38 file thế hệ 1 hoạt động đúng, nhìn giống hệt thế hệ 2, nhưng **không thể sửa 1 chỗ để áp dụng cho cả 38 file** — mọi thay đổi token/shell phải sửa thủ công từng file. Xem đề xuất xử lý tại [UI_FREEZE_REPORT.md](../UI_FREEZE_REPORT.md).

## 4. Assets chưa dùng đến

`assets/icons/`, `assets/images/`, `assets/fonts/` được khai báo trong `CLAUDE.md` như thư mục dự phòng nhưng **prototype hiện tại không cần** vì: icon dùng Emoji Unicode (không cần file icon riêng), ảnh minh hoạ dùng placeholder CSS/gradient thay vì ảnh thật, font tải trực tiếp qua Google Fonts CDN (không host cục bộ). Các thư mục này chỉ thực sự cần khi bước sang giai đoạn có dữ liệu ảnh/tài liệu thật.

## 5. Danh sách 14 tài liệu Design System (`docs/`)

| File | Nội dung |
|---|---|
| `DESIGN_SYSTEM.md` | Tổng hợp cấp cao — điểm vào chính |
| `DESIGN_TOKENS.md` | Giá trị token nguyên tử (màu, radius, shadow, spacing) |
| `COLOR_SYSTEM.md` | Bảng màu chi tiết, màu ngữ nghĩa, màu agent |
| `TYPOGRAPHY.md` | Font, thang cỡ chữ, weight |
| `ICON_GUIDELINE.md` | Hệ thống icon Emoji, quy tắc accessibility |
| `RESPONSIVE_GUIDE.md` | Breakpoint, hành vi sidebar/grid/modal responsive |
| `ANIMATION_GUIDE.md` | Keyframes, thời lượng, stagger pattern |
| `COMPONENT_LIBRARY.md` | 30 component: chức năng/cấu trúc/khi dùng/quy tắc |
| `COMPONENT_RULES.md` | Quy tắc quản trị (khi nào bỏ FAB/Modal, quy tắc liên module...) |
| `UI_GUIDELINE.md` | Quy chuẩn thao tác nhanh khi tạo/sửa trang |
| `PROJECT_STRUCTURE.md` | Tài liệu này |
| `HTML_INDEX.md` | Danh mục đầy đủ 199 file |
| `ROADMAP.md` | Tiến độ theo module |

*(File thứ 14, `UI_FREEZE_REPORT.md`, đặt ở gốc dự án theo đúng vị trí các báo cáo review trước đó — không đặt trong `docs/`.)*

## 6. Bổ sung Stage 4 — Kiến trúc Firebase (thiết kế, chưa triển khai)

Mục 1–5 ở trên mô tả nhánh **Prototype HTML tĩnh** (`pages/`, `assets/`) — không đổi, không bị ảnh hưởng bởi Stage 4. Mục này bổ sung vị trí của 8 tài liệu kiến trúc Firebase (Stage 4) trong cùng cấu trúc monorepo, và cấu trúc thư mục **dự kiến** khi bắt đầu viết code Firebase thật (ngoài phạm vi Stage 4 — chỉ liệt kê để định hướng, chưa tạo file nào trong nhóm này):

```
MIMIN Platform/
├── apps/                          # Next.js Core Platform thật — không đổi
├── packages/                       # Shared packages — không đổi
│   ├── auth/                       # ĐÃ CÓ scaffold — Stage 4 thiết kế mở rộng (custom claims, RBAC)
│   ├── database/                    # ĐÃ CÓ scaffold — Stage 4 thiết kế mở rộng (collection mới theo module)
│   └── rbac/                        # ĐÃ CÓ scaffold — Stage 4 tham chiếu (chưa nối dữ liệu thật)
├── pages/ + assets/                 # Prototype HTML — không đổi (mục 1–5)
├── docs/
│   ├── (14 file Design System — mục 5, không đổi)
│   ├── (8 file Data Flow Stage 3: BUSINESS_FLOW.md, DATA_FLOW.md, MODULE_FLOW.md,
│   │    USER_FLOW.md, AI_FLOW.md, REPORT_FLOW.md, WORKFLOW.md, SYSTEM_ARCHITECTURE.md)
│   └── ★ 8 file Firebase Architecture Stage 4 (tài liệu này thuộc nhóm này):
│         ├── FIREBASE_ARCHITECTURE.md   # Điểm vào chính — tổng quan 12 dịch vụ
│         ├── AUTHENTICATION.md           # Provider, Role, Organization/Workspace, Permission
│         ├── FIRESTORE_STRUCTURE.md      # Toàn bộ collection theo module (chưa có dữ liệu)
│         ├── STORAGE_STRUCTURE.md        # 8 category file nhị phân + quy ước đường dẫn
│         ├── HOSTING_STRUCTURE.md        # 3 môi trường + multi-site + custom domain
│         ├── SECURITY_RULES.md           # 4 lớp kiểm tra bảo mật (khái niệm)
│         ├── FUNCTIONS_PLAN.md           # Danh sách Cloud Function theo 5 nhóm
│         └── PROJECT_STRUCTURE.md        # Tài liệu này (đã cập nhật mục 6 này)
├── FIREBASE_REVIEW.md               # ★ Báo cáo tổng kết Stage 4 (gốc dự án, cùng vị trí UI_FREEZE_REPORT.md/DATA_FLOW_REVIEW.md)
└── (REVIEW_REPORT.md, ...DATA_FLOW_REVIEW.md — các báo cáo review trước, không đổi)
```

### 6.1. Cấu trúc thư mục dự kiến khi triển khai Firebase thật (tham khảo, chưa tạo)

```
MIMIN Platform/
├── firebase.json          # Cấu hình multi-site Hosting + rules path + functions source
├── .firebaserc             # Khai báo alias 3 project (prod/staging/dev) — xem HOSTING_STRUCTURE.md mục 2
├── firestore.rules          # Hiện thực hoá SECURITY_RULES.md mục 2–5
├── storage.rules             # Hiện thực hoá SECURITY_RULES.md mục 6
├── firestore.indexes.json     # Index composite (chưa cần thiết kế ở Stage 4 — không có truy vấn thật)
└── functions/                  # Hiện thực hoá FUNCTIONS_PLAN.md — package Node riêng, KHÔNG viết ở Stage 4
    └── src/
        ├── automation/
        ├── notification/
        ├── ai-gateway/
        ├── webhook/
        └── email/
```

**Nhắc lại ranh giới Stage 4**: toàn bộ mục 6 chỉ mô tả **vị trí tài liệu** và **cấu trúc dự kiến** — không có file `firebase.json`, `.firebaserc`, `*.rules`, hay thư mục `functions/` nào được tạo trong Stage 4 này, đúng ràng buộc "Không viết Code. Không kết nối Firebase. Chỉ thiết kế kiến trúc."

### 6.2. Tham chiếu

- Tổng quan kiến trúc Firebase: [FIREBASE_ARCHITECTURE.md](FIREBASE_ARCHITECTURE.md)
- Báo cáo tự soát Stage 4: [FIREBASE_REVIEW.md](../FIREBASE_REVIEW.md)
