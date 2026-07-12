# COMPONENT_LIBRARY.md

Danh mục toàn bộ component đang tồn tại thật trong 199 file HTML (đã xác minh bằng khảo sát mã nguồn, không suy diễn). Mỗi component ghi rõ: Chức năng, Cấu trúc, Khi nào dùng, Quy tắc dùng, và **số trang thực tế sử dụng** (để phân biệt component lõi dùng khắp nơi với component hiếm/chỉ 1 nơi dùng).

## 1. Header (`.m-header`)
- **Chức năng**: Thanh trên cùng cố định — tìm kiếm toàn cục, chuyển theme, thông báo, avatar mở hồ sơ.
- **Cấu trúc**: `menu-toggle` (hamburger, ẩn desktop) → `search-box` (icon + input + shortcut ⌘K) → `actions` (theme/notif/divider/avatar).
- **Khi nào dùng**: Mọi trang trong route đã đăng nhập (không dùng ở Login/Register/Forgot Password).
- **Quy tắc**: Luôn `sticky top:0`, `z-index: 50`; input search phải có `placeholder` và phím tắt `⌘K` (wire sẵn trong `MiminShell.init`).
- **Số trang dùng**: 199/199 trừ 3 trang xác thực (Login/Register/Forgot Password) và các trang dùng layout khác biệt.

## 2. Sidebar (`.m-sidebar`)
- **Chức năng**: Điều hướng chính, danh sách module/trang trong module hiện tại.
- **Cấu trúc**: `m-sidebar-brand` (logo) → `m-sidebar-nav` (`<ul>` render bằng JS từ `NAV_ITEMS`) → `m-sidebar-footer` (avatar + tên + vai trò + nút đăng xuất).
- **Khi nào dùng**: Mọi trang có shell đầy đủ.
- **Quy tắc**: `width: 280px` cố định desktop, `NAV_ITEMS` phải cùng danh sách 1 module trên mọi trang con của module đó (đã xác nhận qua review từng Sprint/Phase); mục đang mở phải có `active: true`.

## 3. Breadcrumb (`.breadcrumb`)
- **Chức năng**: Định vị vị trí trang trong cây điều hướng.
- **Cấu trúc**: `<a>` (cấp cha, có thể nhiều cấp) → `.separator` (›) → `.current` (trang hiện tại, không phải link).
- **Khi nào dùng**: Mọi trang trừ trang Dashboard gốc của module (dashboard chỉ hiện `.current` không có link cha, vì đó là gốc điều hướng của module).
- **Quy tắc**: Trang con sâu (VD `191_depreciation.html`) có 2 cấp cha (`Finance Dashboard › Tài sản cố định › Khấu hao`).

## 4. Dashboard/Stat/KPI Card (`.biz-stat-card` / `.fac-stat-card` / `.wh-stat-card` / `.kpi-card`)
- **Chức năng**: Hiển thị 1 chỉ số tổng quan kèm xu hướng tăng/giảm.
- **Cấu trúc**: `*-top` (icon box + change badge ▲/▼) → `*-value` (số lớn) → `*-label` (mô tả).
- **Khi nào dùng**: Đầu mọi trang Dashboard/danh sách (thường 4 thẻ/hàng).
- **Quy tắc**: Render bằng `renderStatCards(STATS)`/`renderKpis(KPIS)`, `change` rỗng (`''`) nếu chỉ số không có xu hướng so sánh (không hiện badge).
- **Số trang dùng**: ~140+ trang (hầu hết trang danh sách/dashboard của Business/Factory/Warehouse/Finance OS + Agent).

## 5. Chart Card (Bar Chart / Donut Chart)
- **Chức năng**: Trực quan hoá xu hướng theo thời gian (bar) hoặc cơ cấu tỷ trọng (donut).
- **Cấu trúc**: Bar: `bar-col` lặp lại, chiều cao `%` theo giá trị/max. Donut: `<svg>` với `background: conic-gradient()` tính từ dữ liệu + `*-legend` liệt kê nhãn màu.
- **Khi nào dùng**: Trang Dashboard, Analytics, Reports — không dùng thư viện chart ngoài (Chart.js...), tự vẽ bằng CSS/SVG thuần.
- **Quy tắc**: Donut luôn có legend đi kèm (không hiển thị số liệu chỉ bằng màu); Bar chart hỗ trợ class màu `green/amber/red` cho cột đặc biệt.
- **Số trang dùng**: Bar chart ~20 trang; Donut ~5 trang (chi phí, tài sản, doanh thu theo cơ cấu).

## 6. Data Table (`.data-table` / `.biz-table` / `.fac-table` / `.wh-table`)
- **Chức năng**: Danh sách dữ liệu dạng bảng, hỗ trợ sort, hành động theo dòng, badge trạng thái.
- **Cấu trúc**: `thead` (cột uppercase, click để sort) → `tbody` (row hover, animation vào tuần tự) → cột `.num` căn phải, `.wrap` cho phép xuống dòng.
- **Khi nào dùng**: Component chính cho mọi danh sách bản ghi có ≥ 4 thuộc tính hiển thị.
- **Quy tắc**: Luôn đi kèm Empty State (`emptyEl`) khi danh sách rỗng; luôn có Pagination nếu > `PAGE_SIZE` bản ghi; row click thường mở Modal chi tiết.
- **Số trang dùng**: ~120 trang — component được dùng nhiều nhất trong toàn bộ hệ thống.

## 7. Data Grid (`.data-grid` / `.wh-data-grid` / `.agents-grid` / `.knowledge-grid`)
- **Chức năng**: Danh sách dạng thẻ (card) thay vì bảng — phù hợp dữ liệu có ảnh/icon đại diện mạnh.
- **Cấu trúc**: `grid-template-columns: repeat(auto-fill, minmax(Npx, 1fr))`, mỗi card có icon + title + sub + footer.
- **Khi nào dùng**: Khi bản ghi cần "duyệt trực quan" (tài khoản ngân hàng, tài sản cố định, tài liệu agent) hoặc làm chế độ xem thay thế cho Table (`initViewToggle`).
- **Quy tắc**: Nếu trang có cả Table lẫn Grid, phải có `view-toggle` (2 nút ☰/▦) chuyển đổi, không hiển thị đồng thời.
- **Số trang dùng**: ~15 trang dùng độc lập hoặc kèm view-toggle.

## 8. Kanban Board (`.biz-kanban` / `.fac-kanban` / `.wh-kanban`)
- **Chức năng**: Hiển thị bản ghi theo cột trạng thái (quy trình phê duyệt, picking, chuyển kho).
- **Cấu trúc**: Hàng cột ngang cuộn được (`overflow-x: auto`), mỗi cột có header (tên + đếm số lượng) + danh sách card.
- **Khi nào dùng**: Khi nghiệp vụ có quy trình nhiều bước tuần tự rõ ràng (Nháp→Chờ duyệt→Đã duyệt→Hoàn tất).
- **Quy tắc**: Nhóm dữ liệu qua `groupBy` field, mỗi card click mở Modal chi tiết.
- **Số trang dùng**: 9 trang (VD `149_stock_transfer`, `160_picking`, `187_payment_management`, `197_finance_workflow`).

## 9. Timeline (`.biz-timeline` / `.fac-timeline` / `.wh-timeline` / `.mini-timeline`)
- **Chức năng**: Nhật ký hoạt động/lịch sử theo trình tự thời gian.
- **Cấu trúc**: Đường dọc (`::before`) + node tròn mỗi mục (`.done`/`.pending` đổi màu) + tiêu đề/mô tả/thời gian.
- **Khi nào dùng**: Trang lịch sử/audit log (đọc-only, thường **không có FAB/Modal** — xem [COMPONENT_RULES.md](COMPONENT_RULES.md)).
- **Quy tắc**: Không phân trang bằng cách tải thêm vô hạn — vẫn dùng `Pagination` chuẩn để giới hạn số mục hiển thị mỗi trang.
- **Số trang dùng**: 11 trang (lịch sử/SOP/workflow từng module + mini-timeline trong Agent History tab).

## 10. Calendar (`.fac-cal-wrap` / `.wh-cal-wrap`)
- **Chức năng**: Lịch tháng đầy đủ, sự kiện theo ngày.
- **Cấu trúc**: `cal-nav` (điều hướng tháng) → `cal-weekdays` → `cal-days` (grid 7 cột, ô `.other-month`/`.today`, sự kiện màu theo loại).
- **Khi nào dùng**: Khi dữ liệu gắn với ngày cụ thể và cần nhìn tổng quan theo tháng (lịch sản xuất, lịch giao hàng).
- **Quy tắc**: Chỉ dùng khi thực sự cần góc nhìn theo tháng — **không phải mọi trang "lịch trình" đều cần Calendar** (đa số dùng Table với cột ngày là đủ).
- **Số trang dùng thực tế**: chỉ 3/199 trang (`96_calendar.html`, `122_production_schedule.html`, `159_delivery_schedule.html`) — là component **hiếm dùng nhất** trong nhóm "hiển thị theo thời gian", dù CSS đã được nhân bản đủ ở cả `factory-layout.css` lẫn `warehouse-layout.css`.

## 11. Gantt Chart (`.fac-gantt-wrap`)
- **Chức năng**: Thanh ngang thể hiện tiến độ/khoảng thời gian của nhiều hạng mục song song.
- **Cấu trúc**: `gantt-row` (label cố định trái + track + bar căn theo % thời gian).
- **Khi nào dùng**: Lập kế hoạch có nhiều công đoạn chạy song song, cần so sánh thời lượng trực quan.
- **Quy tắc**: Chỉ định nghĩa trong `factory-layout.css`/`factory-layout.js` — **không có ở business/warehouse/finance**.
- **Số trang dùng thực tế**: chỉ 1/199 trang (`103_production_planning.html`) — component **hiếm dùng nhất toàn hệ thống**, cân nhắc có thực sự cần giữ lại như 1 component chính thức hay xử lý như biến thể tại chỗ.

## 12. Modal (`.biz-modal` / `.fac-modal` / `.wh-modal`)
- **Chức năng**: Cửa sổ nổi hiển thị chi tiết bản ghi hoặc xác nhận hành động.
- **Cấu trúc**: `header` (title + subtitle + nút đóng) → `body` (danh sách `row: label/value` hoặc HTML tuỳ biến) → `footer` (nút Huỷ/Xác nhận).
- **Khi nào dùng**: Xem chi tiết khi click 1 dòng/thẻ, hoặc xác nhận hành động quan trọng (lưu cấu hình, xoá).
- **Quy tắc**: Luôn có nút đóng (✕) + đóng khi click ra ngoài overlay + đóng khi nhấn `Escape`. **Không có component "Dialog" tách biệt** — Modal đảm nhiệm cả 2 vai trò (chi tiết + xác nhận), xem ghi chú tại COMPONENT_RULES.md.
- **Số trang dùng**: ~150 trang.

## 13. Dialog
- **Trạng thái**: **Không tồn tại như component riêng biệt.** Mọi nhu cầu "hộp thoại xác nhận" (VD lưu cấu hình ở các trang `*_settings.html`) đều tái sử dụng chính component Modal ở mục 12, chỉ khác nội dung `bodyHtml` đơn giản hơn (1 câu xác nhận) thay vì danh sách `rows`. Ghi nhận đây là điểm cần làm rõ trong UI_FREEZE_REPORT: nên đặt tên tường minh 2 biến thể (`Modal.detail` / `Modal.confirm`) khi bước sang component hoá thật.

## 14. Toast (`.toast` / `.toast-container`)
- **Chức năng**: Thông báo ngắn, tự ẩn, không chặn thao tác.
- **Cấu trúc**: Container cố định giữa-trên màn hình, mỗi toast có icon + message + viền trái màu theo loại.
- **Khi nào dùng**: Phản hồi tức thời cho mọi hành động demo (lưu, xoá, điều hướng chưa xây dựng, v.v.).
- **Quy tắc**: Tự ẩn sau 3000ms (`setTimeout`), 4 loại (`error/success/warning/info`), gọi qua `MiminShell.showToast(message, type, icon)` — hàm dùng chung tuyệt đối cho toàn bộ 199 trang (không có bản sao theo module).
- **Số trang dùng**: 199/199.

## 15. Notification (Notification Popover, `.notif-popover`)
- **Chức năng**: Danh sách thông báo gần đây, mở từ icon 🔔 ở Header.
- **Cấu trúc**: `head` (tiêu đề + "Đánh dấu đã đọc") → `list` (tối đa 5 mục) → `foot` ("Xem tất cả").
- **Khi nào dùng**: Mọi trang có Header đầy đủ.
- **Quy tắc**: Dữ liệu `NOTIFICATIONS` luôn liên quan ngữ cảnh trang hiện tại (không dùng chung 1 danh sách tĩnh toàn cục).
- **Số trang dùng**: 199/199 (dùng chung `MiminShell.renderNotifPopover`).

## 16. FAB — Floating Action Button (`.biz-fab` / `.fac-fab` / `.wh-fab`)
- **Chức năng**: Hành động tạo nhanh bản ghi mới, luôn hiện ở góc dưới phải.
- **Khi nào dùng**: Trang danh sách có khái niệm "tạo mới" rõ ràng.
- **Quy tắc**: Thêm class `.stacked` khi trang cùng lúc có AI Float Button (tránh chồng lấp — xem RESPONSIVE_GUIDE.md mục 5). **Không dùng** ở trang thuần phân tích/lịch sử/hub (xem COMPONENT_RULES.md mục "Ngoại lệ có chủ đích").

## 17. Pagination (`.pagination` / `.biz-pagination` / `.fac-pagination` / `.wh-pagination`)
- **Chức năng**: Phân trang danh sách dài.
- **Cấu trúc**: Nút "‹ Trước" — số trang (rút gọn bằng dấu `…` khi nhiều trang) — nút "Sau ›".
- **Khi nào dùng**: Mọi Data Table/Timeline có thể vượt quá `PAGE_SIZE` (thường 6).
- **Quy tắc**: Ẩn hoàn toàn nếu `totalPages <= 1` (không hiện thanh phân trang thừa).

## 18. Tabs (`.biz-detail-tabs` / `.fac-detail-tabs` / `.wh-detail-tabs` / `.agent-tabs`)
- **Chức năng**: Chia nội dung 1 trang thành nhiều nhóm xem được mà không cần điều hướng trang khác.
- **Cấu trúc**: Hàng nút tab (chỉ 1 `.active`) → nội dung tương ứng hiện/ẩn bằng class `.active`.
- **Khi nào dùng**: Trang Cấu hình (nhiều nhóm setting) hoặc trang chi tiết Agent (5 tab cố định: Dashboard/Chat/Tasks/Knowledge/History).
- **Quy tắc**: Agent luôn đúng 5 tab theo thứ tự cố định; trang Settings tuỳ biến số tab theo nhu cầu (2–4 tab).

## 19. Accordion
- **Trạng thái**: **Không tồn tại trong toàn bộ 199 file** (đã xác minh bằng grep, 0 kết quả). Chưa có nhu cầu nghiệp vụ nào dùng dạng "mở rộng/thu gọn từng mục" — Tabs và Data Table đã đủ đáp ứng các trường hợp hiện tại. Không nên thêm mới Accordion vào Component Library nếu chưa có yêu cầu cụ thể.

## 20. Tooltip (`.biz-tooltip-target` / `.fac-tooltip-target` / `.wh-tooltip-target`)
- **Chức năng**: Giải thích thêm khi hover/focus vào 1 icon nhỏ (thường là `i` info-icon).
- **Cấu trúc**: `target` (position relative) chứa `box` (ẩn mặc định, hiện khi hover/focus, có mũi tên trỏ xuống).
- **Khi nào dùng**: Cạnh tiêu đề cần giải thích công thức/quy tắc nghiệp vụ (VD "Giá thành = NVL + Nhân công + SXC").
- **Quy tắc**: Luôn dùng `tabindex="0"` trên target để hỗ trợ điều hướng bàn phím (`:focus-within` kích hoạt cùng `:hover`).

## 21. Empty State (`.biz-empty` / `.fac-empty` / `.wh-empty`)
- **Chức năng**: Thông báo thân thiện khi danh sách/kết quả tìm kiếm rỗng.
- **Cấu trúc**: Icon lớn (48px) + tiêu đề ngắn + mô tả gợi ý hành động.
- **Khi nào dùng**: Bắt buộc đi kèm mọi Table/Grid có thể rỗng do filter/search.
- **Quy tắc**: `display: none` mặc định, JS bật `flex` khi `rows.length === 0`.

## 22. Loading State (Skeleton, `.biz-skeleton-row`)
- **Chức năng dự kiến**: Placeholder nhấp nháy trong lúc chờ dữ liệu tải.
- **Trạng thái thực tế**: **Đã định nghĩa CSS trong `business-layout.css` nhưng 0/199 trang thực sự sử dụng** (không có trang nào render `.biz-skeleton-row` trong JS). Đây là CSS "chết" (dead code) — vì toàn bộ prototype dùng dữ liệu tĩnh nên không có độ trễ tải thật để cần hiển thị skeleton. Cần quyết định: xoá bỏ hoặc giữ lại để dùng khi nối dữ liệu thật (Database Architecture).

## 23. Error State / Success State
- **Trạng thái thực tế**: **Không tồn tại như 1 component trang riêng** (không có "trang lỗi 404/500" hay "trang xác nhận thành công" độc lập trong 199 file). Success/Error được xử lý hoàn toàn qua **Toast** (mục 14) và qua **status-badge** (màu green/red trong bảng dữ liệu) — không phải qua trang/màn hình chuyên biệt. Cần bổ sung khi bước sang Product Architecture nếu có yêu cầu trang lỗi hệ thống (404, 500, mất kết nối).

## 24. Progress Bar (`.biz-progress` / `.fac-progress` / `.wh-progress`)
- **Chức năng**: Thanh hiển thị % hoàn thành/sử dụng (ngân sách, công suất máy, khấu hao).
- **Cấu trúc**: Track nền `--bg-hover` + fill co giãn `width: %` theo màu trạng thái.
- **Khi nào dùng**: Khi cần so sánh trực quan "đã dùng bao nhiêu / tổng bao nhiêu" ngay trong 1 dòng bảng (không cần mở riêng biểu đồ).

## 25. Toggle Switch (`.biz-toggle` / `.fac-toggle` / `.wh-toggle`)
- **Chức năng**: Bật/tắt 1 tuỳ chọn nhị phân.
- **Khi nào dùng**: Trang Cấu hình (`*_settings.html`) — mọi tuỳ chọn bật/tắt đều dùng component này, không dùng checkbox thô.

## 26. AI Insight Card (`.ai-insight-card` / `.biz-insight-card`)
- **Chức năng**: Thẻ gợi ý/cảnh báo do "AI" sinh ra, có nút hành động "Áp dụng".
- **Khi nào dùng**: Trang `*_ai_*.html` dạng feed gợi ý — các trang này **không có FAB/Modal** vì hành động chính nằm ngay trên thẻ.
- **Điểm trùng lặp đã xác minh trực tiếp**: cùng 1 component xuất hiện dưới **3 hình thức khác nhau**:
  - `132_factory_dashboard_ai.html` — định nghĩa `.ai-insight-card` trong `<style>` inline riêng của trang (5 dòng CSS).
  - `167_ai_inventory.html` — định nghĩa lại **y hệt từng ký tự** khối `<style>` `.ai-insight-card` ở trên (copy-paste giữa 2 module khác nhau, Factory OS và Warehouse OS).
  - `195_ai_finance.html` — dùng `.biz-insight-card` (được thêm chính thức vào `business-layout.css` ở Phase 7), không trùng tên với 2 file kia dù cùng chức năng/giao diện.
- **Kết luận**: 3 trang, 3 cách triển khai cho cùng 1 component — ứng viên hàng đầu để hợp nhất thành `main.css` khi chuẩn hoá.

## 27. Barcode / QR Placeholder (`.wh-barcode` / `.wh-qr`)
- **Chức năng**: Hình minh hoạ mã vạch/QR (giả lập bằng CSS, không phải mã thật).
- **Cấu trúc**: Barcode: dãy `<span>` độ rộng ngẫu nhiên có trọng số theo seed chuỗi. QR: lưới `7×7` ô bật/tắt theo seed.
- **Khi nào dùng**: Duy nhất tại `152_barcode_center.html` (Warehouse OS).
- **Quy tắc**: Seed nên là mã SKU/mã lô để hình ảnh nhất quán mỗi lần render lại (không đổi ngẫu nhiên mỗi lần load).

## 28. Cross-module Quick Link Chip (`.wh-cross-links` / `.wh-cross-chip`)
- **Chức năng**: Điều hướng nhanh sang trang liên quan ở module khác (Business OS ↔ Factory OS ↔ Warehouse OS ↔ Finance OS).
- **Quy tắc**: `href` thật khi trang đích đã tồn tại; `.disabled` + `href="#"` + toast "đang được xây dựng" khi module đích (AI Center, Marketplace) chưa có UI thật. Đây là quy ước quan trọng, áp dụng nhất quán từ Warehouse OS trở đi (142+) — Business OS/Factory OS (70–141) không có khối này vì được xây trước khi quy ước này hình thành.

## 29. Drawer — Hồ sơ người dùng (`.m-drawer-overlay` / `.m-drawer`)
- **Chức năng**: Xem nhanh thông tin tài khoản đang đăng nhập.
- **Khi nào dùng**: Mở từ avatar ở Header, có ở mọi trang shell đầy đủ.
- **Quy tắc**: Trượt từ phải, đóng khi click nền/`Escape`/nút ✕ — hành vi giống Modal nhưng là component riêng (không tái dùng Modal vì layout khác: full-height, không có footer 2 nút).

## 30. Agent Chat / Tasks / Knowledge / History (agent-layout.js)
- **Chức năng**: Bộ 4 tab nội dung riêng cho trang Agent — mô phỏng hội thoại AI, danh sách việc cần làm, tài liệu tham khảo, và lịch sử hoạt động rút gọn.
- **Khi nào dùng**: Chỉ 42–69 (AI Agents) — không tái sử dụng ở module khác vì gắn chặt với khái niệm "trợ lý AI cá nhân hoá".
- **Quy tắc**: 5-tab cố định (Dashboard/Chat/Tasks/Knowledge/History), `initTabs()` tự wire, nút "Bắt đầu trò chuyện" ở tab Dashboard nhảy sang tab Chat qua `#goChatBtn`.
