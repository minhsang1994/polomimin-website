# DESIGN_TOKENS.md

Nguồn sự thật duy nhất (single source of truth) cho toàn bộ giá trị thiết kế nguyên tử (atomic values) dùng trong 199 file HTML (`pages/001`–`201`). Tất cả token được định nghĩa dưới dạng CSS Custom Properties trong `assets/css/main.css` (`:root`), và được kế thừa nguyên vẹn bởi 4 file layout theo module (`business-layout.css`, `factory-layout.css`, `warehouse-layout.css`, `agent-layout.css`) — không file nào trong số đó định nghĩa lại token, chỉ tiêu thụ qua `var(--token)`.

> Áp dụng cho 161/199 file (thế hệ 2, xem [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)). 38 file thế hệ 1 (`01`–`38`) khai báo cùng một bộ giá trị số nhưng lặp lại thủ công trong `<style>` riêng — xem mục "Ghi chú thế hệ 1" bên dưới.

## 1. Màu sắc (Color Tokens)

| Token | Giá trị (Light) | Giá trị (Dark override) |
|---|---|---|
| `--primary` | `#1E3A8A` | *(không đổi)* |
| `--primary-dark` | `#172554` | *(không đổi)* |
| `--primary-light` | `#3B82F6` | *(không đổi)* |
| `--primary-gradient` | `linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%)` | *(không đổi)* |
| `--teal` | `#14B8A6` | *(không đổi)* |
| `--teal-light` | `#5EEAD4` | *(không đổi)* |
| `--bg-body` | `#F1F5F9` | `#0F172A` |
| `--bg-surface` | `#FFFFFF` | `#1E293B` |
| `--bg-sidebar` | `#FFFFFF` | `#0F172A` |
| `--bg-input` | `#F8FAFC` | `#1E293B` |
| `--bg-hover` | `#F1F5F9` | `#1E293B` |
| `--text-primary` | `#0F172A` | `#F1F5F9` |
| `--text-secondary` | `#475569` | `#94A3B8` |
| `--text-light` | `#94A3B8` | `#64748B` |
| `--text-white` | `#FFFFFF` | *(không đổi)* |
| `--border-color` | `#E2E8F0` | `#1E293B` |

Xem chi tiết ý nghĩa và bảng màu ngữ nghĩa (semantic status) tại [COLOR_SYSTEM.md](COLOR_SYSTEM.md).

## 2. Shadow

| Token | Giá trị (Light) | Giá trị (Dark) |
|---|---|---|
| `--shadow-sm` | `0 1px 2px 0 rgba(0,0,0,.03)` | `0 1px 2px 0 rgba(0,0,0,.3)` |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,.06)` | `0 4px 16px rgba(0,0,0,.4)` |
| `--shadow-lg` | `0 10px 25px rgba(0,0,0,.08)` | `0 10px 25px rgba(0,0,0,.5)` |
| `--shadow-xl` | `0 20px 30px rgba(0,0,0,.10)` | `0 20px 30px rgba(0,0,0,.6)` |
| `--shadow-card` | `0 8px 48px rgba(0,0,0,.06), 0 2px 12px rgba(0,0,0,.02)` | `0 8px 48px rgba(0,0,0,.4), 0 2px 12px rgba(0,0,0,.2)` |

## 3. Border Radius

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--radius-sm` | `6px` | icon nhỏ, nút phụ, badge nhỏ |
| `--radius-md` | `12px` | card, input, button, modal row, table wrap |
| `--radius-lg` | `16px` | modal, tabs wrap, hero, calendar wrap, kanban col |
| `--radius-xl` | `20px` | *(khai báo sẵn, hiện chưa được dùng nhiều — xem UI_FREEZE_REPORT mục "chưa thống nhất")* |
| `--radius-full` | `9999px` | pill button, badge, avatar tròn, toggle switch, FAB |

## 4. Spacing Scale

| Token | Giá trị |
|---|---|
| `--spacing-xs` | `4px` |
| `--spacing-sm` | `8px` |
| `--spacing-md` | `16px` |
| `--spacing-lg` | `24px` |
| `--spacing-xl` | `32px` |
| `--spacing-2xl` | `48px` |

Quy tắc sử dụng: `--spacing-md` (16px) là đơn vị gap phổ biến nhất giữa các khối (toolbar, stat-grid, kanban). `--spacing-lg`/`--spacing-xl` dùng cho padding trang (`.m-main { padding: 24px 32px 48px }`) và khoảng cách giữa section lớn.

## 5. Layout Constants

| Token | Giá trị |
|---|---|
| `--sidebar-width` | `280px` (→ `0px` khi responsive < 768px, sidebar chuyển sang `position: fixed` overlay) |
| `--header-height` | `72px` |

## 6. Bảng tổng hợp token theo prefix module

Mỗi "layout thế hệ 2" định nghĩa **class riêng theo prefix** nhưng **giá trị token dùng chung 100%** từ `main.css`. Đây là điểm mạnh (giá trị nhất quán tuyệt đối) nhưng cũng là điểm trùng lặp CSS cần refactor (xem [UI_FREEZE_REPORT.md](../UI_FREEZE_REPORT.md)).

| Prefix | File | Áp dụng cho trang |
|---|---|---|
| `biz-` | `business-layout.css` | 70–101 (Business OS/CRM), 172–201 (Finance OS, tái sử dụng) |
| `fac-` | `factory-layout.css` | 102–141 (Factory OS) |
| `wh-` | `warehouse-layout.css` | 142–171 (Warehouse OS) |
| *(không prefix, class riêng)* | `agent-layout.css` | 42–69 (AI Agents) |
| *(không prefix, class chuẩn)* | `main.css` | Toàn bộ 161 file thế hệ 2 (shell: sidebar/header/notif/drawer/toast) |

## 7. Ghi chú thế hệ 1 (file 01–38)

38 file đầu tiên (`01_home_platform.html` → `38_ai_marketplace.html`) không link `assets/css/main.css` mà khai báo lại toàn bộ khối `:root { ... }` bên trong thẻ `<style>` của từng trang. Đã đối chiếu: **giá trị số giống hệt bảng trên** (đã xác nhận qua so sánh trực tiếp khi chuẩn hóa các trang 17/18/27/28 ở phiên làm việc trước) — nghĩa là **token nhất quán tuyệt đối trên toàn bộ 199 file**, chỉ khác cơ chế khai báo (inline vs shared file). Đây là nợ kỹ thuật cần dọn khi bước sang Database Architecture, không phải lỗi thiết kế.
