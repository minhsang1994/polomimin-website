# TYPOGRAPHY.md

## 1. Font Family

**100% các file (199/199) dùng một font duy nhất: [Inter](https://fonts.google.com/specimen/Inter)** (Google Fonts), không có ngoại lệ về font chữ nội dung. Đây là điểm nhất quán tuyệt đối của toàn bộ prototype.

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

Ngoại lệ duy nhất: `31_ai_code.html` (AI Coding) dùng thêm `'Courier New', monospace` cục bộ cho khối hiển thị code — hợp lý về mặt UX (code cần font đơn cách), không phải lỗi.

### 1.1. Điểm chưa thống nhất: URL Google Fonts

Có **2 biến thể URL import** khác nhau đang tồn tại song song:

| Biến thể | Weight khai báo | Dùng ở |
|---|---|---|
| A | `400;500;600;700;800;900` (có 900/black) | Một phần các trang (VD nhóm AI Agent, AI Studio) |
| B | `400;500;600;700;800` (không có 900) | Phần còn lại (VD nhóm Business/Factory/Warehouse/Finance OS) |

→ Không gây lỗi hiển thị (trình duyệt vẫn tải đúng font khi cần), nhưng nên hợp nhất về **1 URL chuẩn duy nhất** (khuyến nghị giữ bản có `900` để không giới hạn khả năng dùng weight đậm nhất trong tương lai — xem đề xuất ở UI_FREEZE_REPORT.md).

## 2. Typography Scale

Thang kích thước chữ được suy ra từ khảo sát toàn bộ `main.css` + 4 file layout (không có biến CSS riêng cho font-size — toàn bộ khai báo trực tiếp bằng con số `px`, đây là khoảng trống token hoá, xem mục 4):

| Kích thước | Dùng cho |
|---|---|
| `26px` / `700` | `.page-title` (tiêu đề trang cấp 1, thế hệ 1) |
| `24px` / `700` | `bph-title`/`fph-title`/`wph-title` (tiêu đề trang cấp 1, thế hệ 2 — page header) |
| `22px` / `700` | `.m-sidebar-brand .logo-text`; `.page-title` responsive (≤768px) |
| `21px` / `700` | `.agent-hero .agent-name` |
| `20px` / `700` | `.m-drawer .drawer-name`; modal title lớn |
| `17px` / `700` | `.bm-title`/`.fm-title`/`.wm-title` (tiêu đề Modal) |
| `16px` / `600` | `h3` trong empty-state; card title lớn |
| `15px` / `700` | `.dgc-title`/`.wgc-title` (Data Grid Card title); `.cal-title` |
| `14px` / `500–700` | Body text mặc định, nav item, button label, input |
| `13px` / `400–700` | Sub-label, breadcrumb, filter chip, badge lớn |
| `12px` / `600–700` | Table header (uppercase), stat-change badge, cell-sub |
| `11px` / `600–700` | Nav badge, bar-chart label, notif time, cd-event (calendar) |
| `10px` / — | Sort-arrow icon, info-icon tooltip trigger |

### 2.1. Font Weight

| Weight | Dùng cho |
|---|---|
| `800` | Số liệu lớn (stat-card value dùng `700`, không phải `800` — `800` chủ yếu dùng ở logo-icon ký tự "M") |
| `700` | Heading, tiêu đề trang, title card, giá trị KPI |
| `600` | Button, badge, nav active, label form |
| `500` | Nav item mặc định, placeholder nhấn, filter chip |
| `400` | Body text thường |

## 3. Line Height & Letter Spacing

Không khai báo `line-height` tường minh ở phần lớn text ngắn (button/badge/label — mặc định trình duyệt là đủ). Text dài có khai báo riêng lẻ theo từng trang (VD `1.6`–`1.8` cho mô tả/description) — **không có token `--line-height-*` dùng chung**, đây là khoảng trống cần bổ sung nếu chuẩn hoá component library thật sự.

`letter-spacing: -0.3px` dùng cho `.page-title` (thắt chữ tiêu đề lớn); `letter-spacing: 0.3px` (dương, giãn chữ) dùng cho table header viết hoa (`text-transform: uppercase`) — đúng nguyên tắc typographic (chữ hoa cần giãn nhẹ để dễ đọc).

## 4. Đề xuất chuẩn hoá

1. Trích xuất thang kích thước ở mục 2 thành token chính thức: `--text-xs` (11px) → `--text-3xl` (26px), áp dụng vào `main.css` để tránh hard-code số `px` rải rác trên hàng trăm rule.
2. Hợp nhất 2 biến thể URL Google Fonts về 1 URL duy nhất (khuyến nghị bản có weight 900).
3. Thêm `--line-height-tight` (1.2, cho heading) / `--line-height-normal` (1.6, cho description) làm token dùng chung.
