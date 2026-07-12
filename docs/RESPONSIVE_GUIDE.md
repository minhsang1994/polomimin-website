# RESPONSIVE_GUIDE.md

## 1. Breakpoints chính thức

Xác nhận nhất quán 100% trên `main.css` + 4 file layout module (`business-`, `factory-`, `warehouse-`, `agent-`):

| Breakpoint | Giá trị | Phạm vi áp dụng |
|---|---|---|
| Desktop | mặc định, không media query | ≥ 900px |
| Tablet | `@media (max-width: 900px)` | Thu gọn stat-grid từ 4 cột → 2 cột |
| Mobile lớn | `@media (max-width: 768px)` | Sidebar → overlay ẩn, bật hamburger menu |
| Mobile nhỏ | `@media (max-width: 480px)` | Thu gọn tiếp stat-grid → 2 cột hẹp, modal footer xếp dọc |

Không có breakpoint nào khác ngoài 3 mốc trên trong toàn bộ 199 file — đây là điểm nhất quán rất tốt, không phát hiện breakpoint "lạc loài" (VD 1024px, 640px) ở bất kỳ trang nào đã khảo sát.

## 2. Hành vi Sidebar (breakpoint 768px)

```css
@media (max-width: 768px) {
    :root { --sidebar-width: 0px; }
    .m-sidebar {
        transform: translateX(-100%);
        position: fixed;
        width: 280px;
        z-index: 150;
    }
    .m-sidebar.open { transform: translateX(0); }
    .m-header .menu-toggle { display: block; }
}
```

Quy tắc: sidebar chuyển từ `sticky` (đẩy nội dung) sang `fixed` overlay (đè lên nội dung) khi ≤768px. Nút hamburger (`.menu-toggle`, ẩn mặc định) xuất hiện. JS (`MiminShell.init`) tự wire: click hamburger → toggle class `.open`; click ra ngoài sidebar (khi màn hình ≤768px) → tự đóng; resize > 768px → tự đóng và reset `aria-expanded`.

## 3. Hành vi Stat/KPI Grid

| Breakpoint | Số cột |
|---|---|
| ≥ 900px | 4 cột (`repeat(4, 1fr)`) |
| 480–900px | 2 cột |
| ≤ 480px | 2 cột (giữ nguyên số cột, giảm gap 16px → 10px, giảm font value 26px → 20px) |

Áp dụng đồng nhất cho `biz-stat-grid`, `fac-stat-grid`, `wh-stat-grid`, `kpi-grid` (agent) — cùng 1 công thức, khác prefix.

## 4. Data Table & Data Grid

- `data-table`/`biz-table`/`fac-table`/`wh-table`: `min-width: 640px` (giảm còn `560px` ở ≤768px) + `overflow-x: auto` trên wrapper → cuộn ngang trên mobile thay vì vỡ layout. Đây là pattern chuẩn cho bảng dữ liệu dày cột trên màn hình nhỏ.
- `data-grid`/`wh-data-grid`/`agents-grid`/`knowledge-grid`: dùng `grid-template-columns: repeat(auto-fill, minmax(Npx, 1fr))` — tự động co giãn số cột theo bề rộng khả dụng, không cần media query riêng (kỹ thuật responsive "tự nhiên" qua CSS Grid).

## 5. FAB & AI Float (vị trí cố định góc dưới phải)

| Phần tử | Desktop | ≤768px |
|---|---|---|
| `.m-ai-float` | `bottom: 32px; right: 32px` | `bottom: 16px; right: 16px`, giảm padding/font |
| `.*-fab` (biz/fac/wh) | `bottom: 32px; right: 32px`, `56×56px` | `bottom: 16px; right: 16px`, `48×48px` |
| `.*-fab.stacked` (khi có cả AI Float + FAB) | `bottom: 100px` (đẩy FAB lên trên AI Float) | `bottom: 80px` |

Quy tắc `stacked`: khi 1 trang có cả AI Float button lẫn Quick-add FAB, FAB phải thêm class `stacked` (hoặc selector `.m-ai-float ~ .*-fab` tự động áp dụng) để không đè lên AI Float. Quy tắc này được tuân thủ nhất quán ở toàn bộ trang Business/Factory/Warehouse/Finance OS có cả 2 nút.

## 6. Modal & Drawer

- Modal (`biz-modal`/`fac-modal`/`wh-modal`): `max-width: 560px` (hoặc `760px` nếu `.wide`) trên desktop, full-width trừ `padding: 20px` của overlay trên mobile (không có media query riêng — modal tự co giãn nhờ `width: 100%` + `max-width`). Footer 2 nút xếp ngang → xếp dọc (`flex-direction: column`) ở ≤480px.
- Drawer (hồ sơ người dùng): `width: 420px` cố định trên desktop → `width: 100%` (toàn màn hình) ở ≤768px.

## 7. Notification Popover

`width: 360px`, `right: 80px` trên desktop → `width: 320px`, `right: 12px` ở ≤768px (né hamburger menu và mép màn hình).

## 8. Đề xuất chuẩn hoá

1. Không phát hiện lỗi responsive nghiêm trọng nào qua khảo sát cấu trúc CSS — 3 breakpoint được tuân thủ tuyệt đối. Khuyến nghị **kiểm thử thực tế trên trình duyệt thật** (Chrome DevTools responsive mode) cho toàn bộ 199 trang trước khi đóng băng UI vĩnh viễn, vì báo cáo này chỉ dựa trên phân tích tĩnh mã nguồn CSS/HTML, chưa render trực quan.
2. Cân nhắc thêm breakpoint `1280px`+ (large desktop) nếu tương lai có màn hình rất rộng cần giới hạn `max-width` cho nội dung chính (`.m-main`) — hiện tại `.m-main` không có `max-width`, nội dung sẽ giãn hết chiều rộng màn hình trên máy tính rất lớn.
