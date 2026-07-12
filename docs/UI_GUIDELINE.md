# UI_GUIDELINE.md

Quy chuẩn UI thực dụng (practical) cho toàn bộ MIMIN Platform — dùng khi tạo/sửa bất kỳ màn hình nào từ nay về sau. Đây là bản tóm lược thao tác nhanh; chi tiết lý do và số liệu đầy đủ nằm ở các file chuyên biệt được liên kết trong từng mục.

## 1. Khoảng cách (Spacing)

- Dùng thang: `4 / 8 / 16 / 24 / 32 / 48px` (`--spacing-xs` → `--spacing-2xl`). **Không tự ý dùng số lẻ** (VD `18px`, `22px`) cho khoảng cách bố cục — số lẻ chỉ chấp nhận cho kích thước phần tử cụ thể (icon, avatar), không dùng cho `gap`/`margin`/`padding` giữa các khối.
- Padding trang chính (`.m-main`): `24px 32px 48px` — không đổi giữa các module.
- Gap giữa card trong 1 grid: `16px` cố định.

## 2. Màu sắc

- Không hard-code hex trong trang mới — luôn dùng `var(--token)` từ [DESIGN_TOKENS.md](DESIGN_TOKENS.md).
- Màu trạng thái chỉ dùng đúng 6 lựa chọn: `green/amber/red/blue/gray/purple` — không tự chế thêm màu badge mới.
- Agent accent color (`--agent-color`) chỉ áp dụng cục bộ trong phạm vi 1 trang Agent, không rò rỉ ra ngoài phạm vi đó (không set lên `:root` toàn cục).
- Trước khi gán màu accent mới cho 1 persona/thực thể, **kiểm tra bảng đã cấp phát** ở [COLOR_SYSTEM.md](COLOR_SYSTEM.md) mục 4 để tránh trùng lặp (đã phát hiện 1 cặp trùng: HR Agent/Video Agent).

## 3. Icon

- Chỉ dùng **Emoji Unicode**, không thêm icon font/SVG library mới (xem lý do tại [ICON_GUIDELINE.md](ICON_GUIDELINE.md)).
- Icon trang trí thuần → `aria-hidden="true"`. Icon là nút không có text → bắt buộc `aria-label`.
- Tra bảng ngữ nghĩa trước khi chọn icon mới cho 1 khái niệm đã có icon chuẩn (VD "kho vải" đã dùng cả 🧵 lẫn 🧶 — chọn 1 và dùng nhất quán).

## 4. Font

- `Inter` duy nhất cho toàn bộ nội dung; `Courier New` chỉ cho khối code.
- Thang cỡ chữ: dùng đúng các mốc đã liệt kê ở [TYPOGRAPHY.md](TYPOGRAPHY.md) mục 2 — không tự chọn cỡ chữ mới nằm ngoài thang.
- Tiêu đề cấp 1 trang: `24px/700` (chuẩn thế hệ 2, dùng `bph-title`/`fph-title`/`wph-title`/`biz-page-header`).

## 5. Animation

- Thời lượng 0.15–0.4s cho tương tác, loop dài hơn (1.2–1.4s) chỉ cho trạng thái "đang chờ" (typing, pulse).
- Danh sách/card nhiều phần tử: dùng stagger `animation-delay: i * 0.05s`.
- Không thêm keyframe trùng logic mới — kiểm tra [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) mục 2 trước, tái sử dụng `bizCardIn`/`bizModalIn`/`bizRowIn`/`bizFadeTab` (namespace `biz-` đang được xem là ứng viên hợp nhất chính) thay vì tạo bản sao thứ 5.

## 6. Responsive

- 3 breakpoint duy nhất: `480 / 768 / 900px`. Không thêm breakpoint mới trừ khi có lý do rất cụ thể.
- Bảng dữ liệu nhiều cột → cho phép cuộn ngang (`overflow-x: auto` trên wrapper), không ép co chữ nhỏ tới mức khó đọc.
- Sidebar luôn chuyển sang overlay ở ≤768px — không làm sidebar "co hẹp còn icon" (mini-sidebar) vì pattern này chưa tồn tại trong hệ thống, tránh tạo biến thể mới không cần thiết.

## 7. Naming Convention

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Tên file HTML | `NNN_snake_case.html` (số thứ tự 3 chữ số + mô tả) | `172_finance_dashboard.html` |
| CSS class (component module) | `{prefix}-{ten-thanh-phan}` | `.wh-stat-card`, `.biz-kanban-col` |
| CSS class (con trong component) | viết tắt 2–3 ký tự + `-{thuoc-tinh}` | `.wsc-value`, `.bph-title`, `.kc-sub` |
| JS namespace module | `Mimin{TenModule}` | `MiminShell`, `MiminBiz`, `MiminFac`, `MiminWH`, `MiminAgentLayout` |
| ID phần tử JS thao tác | camelCase | `statGrid`, `quickAddBtn`, `expenseDonut` |
| Biến dữ liệu mẫu (const) | UPPER_SNAKE_CASE | `NAV_ITEMS`, `STATS`, `PAYMENTS` |

Quy ước này được tuân thủ rất nhất quán (>95% các file khảo sát) — ngoại lệ duy nhất đáng chú ý là `agent-layout.css` dùng class **không prefix** (`.kpi-card`, `.tab-content`) thay vì `.agent-kpi-card` — khác biệt có chủ đích được ghi chú ngay trong file, không phải lỗi vô tình.

## 8. Accessibility

- `aria-label` cho mọi nút icon-only.
- `role="dialog"` + `aria-modal="true"` cho Modal/Drawer.
- `role="menuitem"` cho từng mục Sidebar Nav.
- Đóng overlay bằng phím `Escape` — bắt buộc với Modal, Drawer, Notification Popover.
- Focus ring rõ ràng khi tab bằng bàn phím (input focus có `box-shadow` ring 4px).

## 9. Layout

- Không đặt `max-width` giới hạn `.m-main` — nội dung giãn hết chiều rộng khả dụng (chấp nhận được ở giai đoạn Prototype, cân nhắc giới hạn `1600px` khi lên Product thật cho màn hình rất rộng).
- Page Header luôn ở đầu nội dung chính (ngay sau Breadcrumb), theo công thức: tiêu đề + phụ đề bên trái, nút hành động bên phải (`flex-wrap` khi hẹp).
- Không nhồi quá 4 Stat Card/hàng (giữ đúng lưới `repeat(4,1fr)`).

## 10. Khi thêm trang HTML mới (checklist nhanh)

1. Xác định module → chọn đúng `*-layout.css/js` để tái dùng (không tạo mới trừ khi thực sự cần component chưa có).
2. Copy khung Sidebar/Header/Notif/Drawer/Toast nguyên vẹn từ 1 trang cùng module.
3. Cập nhật `NAV_ITEMS` giống hệt các trang khác trong module, chỉ đổi `active`.
4. Bảo đảm đủ tổ hợp Search + Filter + Table/Grid + Pagination + Empty State (trừ khi thuộc nhóm ngoại lệ tại COMPONENT_RULES.md mục 3).
5. Thêm FAB (+ `.stacked` nếu có AI Float) trừ khi thuộc nhóm ngoại lệ.
6. Kiểm tra: `node --check` cú pháp JS trích xuất, cân bằng thẻ `div`, không trùng `id`, không trùng nội dung (md5) với file khác.
