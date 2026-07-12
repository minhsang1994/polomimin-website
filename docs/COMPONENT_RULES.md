# COMPONENT_RULES.md

Quy tắc quản trị (governance rules) rút ra từ việc khảo sát cách 199 file HTML thực sự được xây dựng — không phải quy tắc lý thuyết, mà là **pattern đã được áp dụng nhất quán** qua các Sprint/Phase trước (Business OS, Factory OS, Warehouse OS, Finance OS), nay được ghi lại chính thức để không bị phá vỡ khi bước sang Product Architecture.

## 1. Nguyên tắc "1 trang = 1 chức năng"

Mọi Sprint/Phase đều yêu cầu và tuân thủ: **mỗi file HTML chỉ phục vụ đúng 1 tác vụ nghiệp vụ**, không gộp nhiều màn hình vào 1 trang. VD: Nhập kho (`147`) và Xuất kho (`148`) là 2 file riêng dù chung 1 luồng nghiệp vụ tồn kho.

## 2. Bộ khung bắt buộc (Shell Checklist)

Mọi trang thuộc thế hệ 2 (161/199 file) **phải có đủ**: Header, Sidebar, Breadcrumb, Toast Container, Drawer, Footer. Đây là phần không bao giờ được lược bỏ.

## 3. Ngoại lệ có chủ đích: khi nào KHÔNG cần FAB/Modal

Không phải trang nào cũng cần FAB hoặc Modal — quy tắc đã áp dụng nhất quán và được ghi trong từng `*_REVIEW_REPORT.md` của mỗi module:

| Loại trang | Có FAB? | Có Modal? | Lý do |
|---|---|---|---|
| Danh sách bản ghi có thể tạo mới | ✅ | ✅ | Có hành động "tạo mới" + "xem chi tiết" |
| Feed cảnh báo hệ thống tự sinh (VD `155_inventory_alert`) | ❌ | ✅ | Không có khái niệm "tạo cảnh báo thủ công" |
| Feed gợi ý AI (VD `167_ai_inventory`, `195_ai_finance`) | ❌ | ❌ | Hành động chính ("Áp dụng") nằm ngay trên thẻ |
| Trang phân tích thuần (chỉ chart, VD `196_finance_analytics`) | ❌ | ❌ | Không có bản ghi để tạo mới/xem chi tiết |
| Nhật ký lịch sử chỉ đọc (VD `198_finance_history`, `166_stock_history`) | ❌ | ❌ | Mỗi dòng đã tự giải thích đủ trong Timeline |
| Trang chủ/hub điều hướng (VD `141`, `171`, `201`) | ❌ | ❌ | Không có hành động tạo mới |

**Quy tắc quyết định**: chỉ bỏ FAB/Modal khi trang **không có khái niệm "bản ghi có thể tạo mới hoặc xem chi tiết"** — không phải tuỳ tiện lược bỏ để đỡ code.

## 4. Quy tắc Search + Filter + Table/Grid

Mọi trang danh sách bắt buộc có tổ hợp: 1 ô tìm kiếm (lọc theo field cụ thể qua `filterRows`) + 0..n nút filter dạng chip (lọc theo nhóm/trạng thái) + Table hoặc Grid (hoặc cả hai với view-toggle) + Pagination + Empty State. Thiếu bất kỳ phần nào trong tổ hợp này với 1 trang danh sách chuẩn được xem là lỗi cần sửa (đã áp dụng triệt để qua các đợt review trước).

## 5. Quy tắc Modal — không tạo Dialog riêng

Không có component "Dialog" tách biệt khỏi "Modal" trong toàn bộ 199 file (xem COMPONENT_LIBRARY.md mục 13). Quy ước hiện tại:
- **Modal chi tiết**: có mảng `rows` (`label`/`value`) hiển thị thông tin bản ghi.
- **Modal xác nhận**: chỉ có `bodyHtml` 1 đoạn text ngắn + 2 nút Huỷ/Xác nhận (dùng cho "Lưu cấu hình", "Xoá", v.v.).

Cả 2 dùng chung 1 hàm `openModal()`/1 bộ CSS — chỉ khác nội dung truyền vào. Khi chuẩn hoá thành component thật, nên tách rõ 2 biến thể (`type: 'detail' | 'confirm'`) thay vì để ngầm định qua nội dung.

## 6. Quy tắc FAB `.stacked`

Khi 1 trang có cả AI Float Button lẫn Quick-add FAB, FAB **bắt buộc** thêm class `stacked` (hoặc dựa vào selector `~` tự động) để tránh chồng lấp vị trí góc dưới phải. Vi phạm quy tắc này (thiếu `.stacked`) từng bị phát hiện và sửa ở `154_batch_management.html` trong đợt review Warehouse OS.

## 7. Quy tắc liên kết chéo module (Cross-module Links)

Từ Warehouse OS (142+) trở đi, mọi liên kết sang module khác phải phân biệt rõ:
- **Module đã có trang thật** → dùng `<a href="...">` thật, không dùng `href="#"` giả.
- **Module chưa có UI thật** (AI Center studio nâng cao, Marketplace) → `href="#"` + `MiminShell.showToast('🚧 ... đang được xây dựng')`.

Business OS và Factory OS (70–141, xây trước khi quy ước này hình thành) **không có** khối liên kết chéo module — đây là khoảng trống nhất quán cần bổ sung nếu muốn đồng bộ trải nghiệm toàn nền tảng (xem UI_FREEZE_REPORT.md).

## 8. Quy tắc đặt tên NAV_ITEMS

Mảng `NAV_ITEMS` (icon/label/href/active/badge) của mọi trang trong **cùng 1 module phải giống hệt nhau** (chỉ khác `active: true/false` theo trang đang mở). Đây là quy tắc đã được xác minh 100% qua toàn bộ 4 module Sprint gần nhất (Business/Factory/Warehouse/Finance OS) bằng kiểm thử href resolve + component-matrix mỗi đợt review.

## 9. Quy tắc dữ liệu mẫu (Demo Data)

Không có dữ liệu thật — toàn bộ là mock JS array khai báo ngay trong `<script>` của từng trang. Không dùng `fetch()`/API/LocalStorage để lưu trạng thái lâu dài (trừ `localStorage.mimin-theme` cho dark mode, là ngoại lệ hợp lý duy nhất). Không có Backend/Database/Firebase ở bất kỳ file nào — đúng như phạm vi Prototype đã cam kết.

## 10. Quy tắc mở rộng Shared Layout thay vì tạo mới

Khi 1 module cần component mà layout CSS/JS hiện có (`business-/factory-/warehouse-/agent-layout`) chưa hỗ trợ, quy tắc đã áp dụng ở Phase 7 (Finance OS) là **mở rộng file layout đã tồn tại gần nhất về mặt nghiệp vụ** (Finance OS tái dùng `business-layout.css/js` vì cùng nhóm "vận hành doanh nghiệp"), thay vì tạo file `finance-layout.css/js` mới. Đây là tiền lệ quan trọng: `business-layout.css` sau khi được Finance OS mở rộng đã đạt 645 dòng — đứng thứ 2 trong 4 file layout, chỉ sau `agent-layout.css` (756 dòng, do phải gánh cả bộ Chat/Tasks/Knowledge/History cho 24 persona AI Agent). `factory-layout.css` (342 dòng) và `warehouse-layout.css` (264 dòng) nhỏ hơn vì mỗi file chỉ phục vụ đúng 1 module gốc, không bị dùng chung lần 2.

## 11. Quy tắc Accessibility tối thiểu

- Mọi icon-only button phải có `aria-label` hoặc `title`.
- Mọi icon thuần trang trí phải có `aria-hidden="true"`.
- Mọi tooltip-trigger phải có `tabindex="0"` để dùng được bằng bàn phím.
- Modal/Drawer phải đóng được bằng phím `Escape`.

Toàn bộ 4 quy tắc trên đã được tuân thủ nhất quán trong khảo sát mẫu — không phát hiện vi phạm ở các trang đã kiểm tra trực tiếp.
