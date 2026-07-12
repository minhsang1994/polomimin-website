# DESIGN_SYSTEM.md

Tài liệu tổng hợp Design System của MIMIN Platform prototype (`pages/001`–`201`), mốc "UI Freeze" chuyển từ giai đoạn Prototype sang Product Architecture. Đây là văn bản tham chiếu cấp cao nhất — chi tiết từng mảng được tách vào các file chuyên biệt trong cùng thư mục `docs/`:

- Giá trị nguyên tử: [DESIGN_TOKENS.md](DESIGN_TOKENS.md)
- Màu sắc: [COLOR_SYSTEM.md](COLOR_SYSTEM.md)
- Typography: [TYPOGRAPHY.md](TYPOGRAPHY.md)
- Icon: [ICON_GUIDELINE.md](ICON_GUIDELINE.md)
- Responsive: [RESPONSIVE_GUIDE.md](RESPONSIVE_GUIDE.md)
- Animation: [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md)
- Component chi tiết: [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md), quy tắc dùng: [COMPONENT_RULES.md](COMPONENT_RULES.md)
- Cấu trúc thư mục: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## 1. Màu chủ đạo

Primary `#1E3A8A` (indigo-900) + Teal `#14B8A6` làm accent phụ. Gradient thương hiệu: `linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%)`. Nền/chữ dựa hoàn toàn trên thang Slate. Bảng màu ngữ nghĩa (green/amber/red/blue/gray/purple) dùng cho badge/toast/chart, nhất quán tuyệt đối giữa các module. Chi tiết đầy đủ: [COLOR_SYSTEM.md](COLOR_SYSTEM.md).

## 2. Font

`Inter` (Google Fonts) — 100% các trang, không ngoại lệ nội dung chính. Thang kích thước 11px→26px, weight 400/500/600/700. Chi tiết: [TYPOGRAPHY.md](TYPOGRAPHY.md).

## 3. Typography Scale (tóm tắt)

`26/24/22/21/20/17/16/15/14/13/12/11/10px` — xem bảng đầy đủ và ánh xạ ngữ cảnh tại TYPOGRAPHY.md.

## 4. Border Radius

`--radius-sm 6px` · `--radius-md 12px` (mặc định cho card/input/button) · `--radius-lg 16px` (modal/tabs/hero) · `--radius-xl 20px` (khai báo nhưng chưa dùng) · `--radius-full 9999px` (pill/badge/avatar/FAB).

## 5. Shadow

`--shadow-sm` → `--shadow-xl` (4 cấp độ tăng dần) + `--shadow-card` riêng cho card nổi bật. Dark mode tăng alpha (0.3–0.6) thay vì đổi màu, giữ đúng nguyên tắc "shadow phải rõ hơn trên nền tối".

## 6. Grid

- **Stat/KPI Grid**: `repeat(4, 1fr)` desktop → 2 cột ở ≤900px.
- **Data Grid**: `repeat(auto-fill, minmax(220–230px, 1fr))` — tự co giãn, không cần media query.
- **Info Grid** (trang cấu hình/chi tiết): `repeat(auto-fit, minmax(220px, 1fr))`.
- **Calendar Grid**: `repeat(7, 1fr)` cố định (7 ngày/tuần).

## 7. Layout tổng thể (Shell)

```
┌─────────────┬──────────────────────────────────────┐
│             │  Header (72px, sticky, blur backdrop)  │
│  Sidebar    ├──────────────────────────────────────┤
│  280px      │  Breadcrumb                            │
│  sticky     │  Page Header (title + subtitle + CTA)  │
│             │  Stat/KPI Grid                         │
│             │  Toolbar (search + filter [+ toggle])  │
│             │  Nội dung chính (Table/Grid/Kanban/…)  │
│             │  Empty State (khi rỗng) / Pagination   │
│             │  Footer                                │
└─────────────┴──────────────────────────────────────┘
+ AI Float Button (góc dưới phải, cố định)
+ Quick-add FAB (góc dưới phải, cố định, .stacked nếu cùng tồn tại AI Float)
+ Notification Popover (ẩn/hiện từ Header)
+ User Drawer (trượt từ phải, toàn màn hình modal overlay)
+ Toast Container (trên cùng, giữa màn hình)
```

Cấu trúc này lặp lại đồng nhất ở **161/199 file** (thế hệ 2). 38 file thế hệ 1 dùng cấu trúc tương tự nhưng không phải lúc nào cũng có đủ Stat Grid/Toolbar (một số là form đơn giản như Login/Register).

## 8. Card

3 loại card chính, cùng công thức padding (`18–20px`), border `1px solid var(--border-color)`, radius `--radius-md`, hover nhấc lên + đổ bóng:

| Loại | Icon box | Nội dung |
|---|---|---|
| Stat/KPI Card | `36×36px`, bg `--bg-hover` | icon + change badge (▲/▼) + value lớn + label |
| Data Grid Card | `44×44px` | icon + title + sub + footer (status/meta) |
| Kanban Card | không icon box | title + sub, nằm trong cột theo trạng thái |

## 9. Button

| Loại | Style |
|---|---|
| Primary | `background: var(--primary-gradient)`, chữ trắng, `radius-md`, hover `scale(1.03)` |
| Outline | `border: 1px solid var(--border-color)`, nền trong suốt, hover `background: var(--bg-hover)` |
| FAB | tròn `56×56px` (48px mobile), gradient nền, hover `scale(1.08) rotate(90deg)` |

Mỗi module có class riêng (`btn-biz-primary`, `btn-fac-primary`, `btn-wh-primary`, `btn-agent-primary`) — **cùng 1 công thức CSS**, khác tên class.

## 10. Form / Input

Input dùng `background: var(--bg-input)`, `border: 1px solid var(--border-color)` → focus đổi `border-color: var(--primary-light)` + `box-shadow` ring `rgba(59,130,246,.08)`. Toggle switch dạng pill (`44×24px`) dùng cho mọi trang Settings.

## 11. Table

`data-table`/`biz-table`/`fac-table`/`wh-table`: header uppercase 12px, hàng có hover + animation vào tuần tự, cột số (`.num`) căn phải với `font-variant-numeric: tabular-nums`, hỗ trợ sort qua `<th>` click. Badge trạng thái (`status-badge`) nhúng trong cell.

## 12. Chart

Chart tối giản, tự vẽ bằng CSS/SVG, **không dùng thư viện chart (Chart.js/ECharts/Recharts)**:
- **Bar chart**: `div` cột cao theo `%` (JS tính từ giá trị max), có class màu `green/amber/red`.
- **Donut chart**: `<svg>` với `background: conic-gradient(...)` tính toán trực tiếp trong JS từ dữ liệu, không dùng `<path>` SVG thật.

## 13. Modal

Overlay full-screen (`backdrop-filter: blur(4px)`) + panel `max-width: 560px` (`760px` nếu `.wide`), có `header/body/footer` rõ ràng, animation scale+fade khi mở. 3 bản triển khai độc lập (biz/fac/wh) cùng công thức.

## 14. Navigation (Sidebar + Nav Item)

`m-sidebar` (280px, sticky) chứa brand + `ul.m-sidebar-nav` render bằng JS từ mảng `NAV_ITEMS` (`icon/label/href/active/badge`) + footer (avatar/tên/vai trò/logout). Active state: nền `--primary` + shadow. Badge số/text bên phải mỗi mục.

## 15. Dashboard Pattern

Mỗi module có 1 trang "Dashboard" mở đầu (`70`, `102`, `142`, `172`) theo công thức: Page Header → Stat Grid (4 KPI) → 1 Chart tổng quan → Toolbar + Table (dữ liệu gần đây) → Empty/Pagination. Mỗi module cũng có 1 trang "*_home" kết thúc (`141`, `171`, `201`) dạng hub: hero + grid liên kết tới toàn bộ trang con + khối "hệ sinh thái" liên kết chéo module khác.

## 16. Responsive Rules (tóm tắt)

3 breakpoint: `900px` (stat grid 4→2 cột), `768px` (sidebar → overlay + hamburger), `480px` (grid/modal footer thu gọn thêm). Chi tiết: [RESPONSIVE_GUIDE.md](RESPONSIVE_GUIDE.md).

## 17. Dark Mode

Kích hoạt qua `[data-theme="dark"]`, lưu `localStorage.mimin-theme`, toggle bằng nút 🌓/☀️ ở header. Đảo nền/chữ/border/shadow; giữ nguyên màu thương hiệu (primary/teal/agent-color) và màu ngữ nghĩa badge (chỉ đổi kênh alpha/nền tối tương ứng, không đổi hue).
