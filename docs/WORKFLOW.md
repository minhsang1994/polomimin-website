# WORKFLOW.md — Approval Flow & Notification Flow

Tài liệu này gộp 2 luồng cơ chế (mechanics) cắt ngang toàn bộ hệ thống: **Approval Flow** (ai duyệt gì, khi nào) và **Notification Flow** (ai được báo khi nào). Cả 2 đều đã có khuôn mẫu UI cụ thể trong prototype — tài liệu này khái quát hoá thành quy tắc dùng chung.

---

## PHẦN A — APPROVAL FLOW

### A.1. Các điểm phê duyệt (Approval Gate) trong Master Business Flow

```
Lead → Opportunity → Quote ──[GATE 1: Duyệt báo giá]──→ SalesOrder
                                                              │
                                          [GATE 2: Xác nhận đơn hàng + Hợp đồng ký]
                                                              ▼
                                                     ProductionPlan
                                                              │
                                    [GATE 3: Duyệt kế hoạch sản xuất/MRP]
                                                              ▼
                                          PurchaseRequest ──[GATE 4: Duyệt mua hàng]──→ StockIn
                                                              │
                                    [GATE 5: Duyệt QC — đạt mới được nhập kho thành phẩm]
                                                              ▼
                                                       FinishedGoods
                                                              │
                                          StockOut ──[GATE 6: Duyệt xuất kho]──→ Shipment
                                                              │
                                          Invoice ──[GATE 7: Duyệt hoá đơn]──→ Receipt
                                                              │
                                    Payment ──[GATE 8: Duyệt thanh toán theo hạn mức]──→ JournalEntry
```

### A.2. Bằng chứng UI: Kanban Approval Pattern

Prototype đã hiện thực hoá Approval Flow qua **component Kanban** (xem `docs/COMPONENT_LIBRARY.md` mục 8) ở 4 trang, mỗi trang là 1 biến thể của cùng khuôn mẫu "cột trạng thái tuần tự":

| Trang | Các cột trạng thái | Module |
|---|---|---|
| `187_payment_management.html` | Chờ phê duyệt → Đã duyệt → Đang chi → Đã thanh toán | Finance (GATE 8) |
| `197_finance_workflow.html` | Nháp → Chờ duyệt → Đã duyệt → Đã thanh toán | Finance (tổng quát mọi loại chứng từ) |
| `149_stock_transfer.html` | Chờ chuyển → Đang chuyển → Hoàn tất | Warehouse (nội bộ, không cần duyệt cấp cao) |
| `160_picking.html` | Chờ lấy hàng → Đang lấy → Hoàn tất | Logistics (nội bộ) |

**Khuôn mẫu chung rút ra**: Approval Flow có 2 loại rõ rệt —
1. **Duyệt liên cấp** (cần người có thẩm quyền cao hơn xác nhận): `187`, `197` — luôn có cột "Chờ duyệt" tách biệt khỏi "Đang xử lý".
2. **Xác nhận tiến độ nội bộ** (không cần thẩm quyền, chỉ cần đúng người phụ trách đánh dấu hoàn thành bước): `149`, `160` — không có khái niệm "duyệt", chỉ có "tiến độ."

### A.3. Quy tắc hạn mức phê duyệt (Approval Threshold)

Đã có tiền lệ cụ thể tại `200_finance_settings.html` (tab "Hạn mức phê duyệt"):

| Vai trò | Hạn mức tự duyệt | Vượt hạn mức → chuyển cho |
|---|---|---|
| Kế toán tổng hợp | 200.000.000 ₫ | Kế toán trưởng |
| Kế toán trưởng | 500.000.000 ₫ | *(chưa định nghĩa cấp cao hơn — khoảng trống)* |

Đồng thời có tuỳ chọn "Yêu cầu 2 cấp phê duyệt cho khoản chi > 300 triệu ₫" — đây là mẫu **Approval Chain có điều kiện** (conditional multi-level approval), nên áp dụng làm chuẩn chung cho mọi GATE có giá trị tiền tệ lớn (GATE 4 mua hàng, GATE 8 thanh toán), không chỉ riêng Finance.

### A.4. Bảng tổng hợp 8 điểm phê duyệt

| Gate | Vai trò duyệt | Điều kiện vượt cấp | Trang tham chiếu |
|---|---|---|---|
| 1. Duyệt báo giá | Sales Manager | — | `78`, `79` |
| 2. Xác nhận đơn hàng | Sales Manager / CEO (đơn lớn) | Giá trị đơn hàng vượt hạn mức | `80`, `86` |
| 3. Duyệt kế hoạch sản xuất | Giám đốc Nhà máy | — | `103`, `104` |
| 4. Duyệt mua hàng | Giám đốc Nhà máy / Kế toán trưởng | Giá trị mua vượt hạn mức | `130` |
| 5. Duyệt QC | Trưởng ca QC | Không đạt → loại/tái kiểm | `117` |
| 6. Duyệt xuất kho | Quản lý Kho | — | `147`, `148` |
| 7. Duyệt hoá đơn | Kế toán trưởng | — | `186` |
| 8. Duyệt thanh toán | Kế toán tổng hợp / Kế toán trưởng | Theo hạn mức (`200_finance_settings.html`) | `187`, `197` |

---

## PHẦN B — NOTIFICATION FLOW

### B.1. Cơ chế thông báo đã có trong Prototype

3 kênh thông báo độc lập, dùng chung `MiminShell` (`assets/js/main.js`):

| Kênh | Component | Đặc điểm | Dùng khi nào |
|---|---|---|---|
| **Toast** | `.toast-container` | Tự ẩn sau 3s, không chặn thao tác | Phản hồi tức thời sau 1 hành động (lưu, xoá, điều hướng) |
| **Notification Popover** | `.notif-popover` (icon 🔔 ở Header) | Danh sách tối đa 5 mục gần nhất, có "Đánh dấu đã đọc" | Sự kiện cần người dùng biết nhưng không cần phản hồi ngay |
| **AI Float Button** | `.m-ai-float` | Luôn hiển thị 1 gợi ý AI nổi bật nhất, click để xem chi tiết | Insight/cảnh báo AI quan trọng nhất tại thời điểm hiện tại |

### B.2. Sơ đồ luồng thông báo theo sự kiện nghiệp vụ

```
Sự kiện nghiệp vụ (VD: SalesOrder được xác nhận)
        │
        ▼
   AI Gateway / Module Logic ghi nhận sự kiện
        │
        ├──→ Toast tức thời cho người vừa thao tác ("✅ Đã xác nhận đơn hàng")
        │
        ├──→ Notification Popover cho vai trò liên quan ở module kế tiếp
        │      (VD: Giám đốc Nhà máy nhận thông báo "Đơn hàng mới cần lập kế hoạch")
        │
        └──→ AI Float Button cập nhật nếu sự kiện đủ quan trọng
               (VD: "🧠 AI Insight: Đơn hàng lớn vừa vào, kiểm tra tồn kho NVL trước khi nhận")
```

### B.3. Bảng ánh xạ Sự kiện → Kênh thông báo → Vai trò nhận

| Sự kiện | Toast (người thao tác) | Notification (vai trò liên quan) | Ví dụ trang |
|---|---|---|---|
| Đơn hàng xác nhận | Sales: "Đã xác nhận đơn hàng" | Giám đốc Nhà máy: "Đơn hàng mới cần lập kế hoạch" | `80` → `102` |
| Tồn kho NVL sắp hết | — | Quản lý Kho + Giám đốc Nhà máy: "🧶 2 mã tem nhãn sắp hết hàng" | `143`, `155` |
| Công nợ quá hạn | — | Kế toán trưởng: "3 khách hàng nợ quá hạn trên 90 ngày" | `175`, `195` |
| Chứng từ chờ duyệt quá hạn | — | Kế toán trưởng: "2 bút toán chưa được duyệt quá 24 giờ" | `193`, `198` |
| Hoàn tất giao hàng | Logistics: "Đã giao hàng thành công" | Kế toán trưởng: "Hoá đơn sẵn sàng xuất" | `162` → `186` |
| Cảnh báo máy móc/QC | — | Giám đốc Nhà máy: "Cảnh báo máy cắt #3" | `133` |

### B.4. Nguyên tắc thiết kế Notification Flow

1. **Toast luôn là bắt buộc** sau mọi hành động ghi (create/update/delete) — người thao tác phải luôn nhận phản hồi tức thời, không được để họ đoán hành động có thành công hay không.
2. **Notification Popover chỉ gửi tới vai trò khác với người gây ra sự kiện** — không thông báo lại cho chính người vừa thao tác (đã có Toast rồi, tránh trùng lặp).
3. **AI Float Button chỉ hiển thị 1 gợi ý quan trọng nhất tại 1 thời điểm** — không phải danh sách, tránh gây nhiễu (đã đúng theo thiết kế prototype: mỗi trang chỉ 1 `aiFloatMessage`).
4. **Thông báo phải mang tính hành động (actionable)** — không chỉ báo "có gì đó xảy ra" mà nêu rõ cần làm gì tiếp theo (VD "cần lập kế hoạch" chứ không chỉ "có đơn hàng mới").

## Tham chiếu

- Entity nào kích hoạt Approval Gate nào: [DATA_FLOW.md](DATA_FLOW.md) mục 4
- Vai trò nào nhận thông báo: [USER_FLOW.md](USER_FLOW.md)
- AI sinh insight cần thông báo: [AI_FLOW.md](AI_FLOW.md)
