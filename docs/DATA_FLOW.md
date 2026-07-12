# DATA_FLOW.md — Luồng Dữ liệu Kỹ thuật (Entity-level)

Tài liệu này mô tả **dữ liệu (entity/thực thể) di chuyển thế nào** giữa các module — khác với `BUSINESS_FLOW.md` (mô tả quy trình nghiệp vụ ở mức con người/quyết định), `DATA_FLOW.md` tập trung vào **entity, trạng thái (state), và hướng truyền dữ liệu**. Đây vẫn là tài liệu kiến trúc thuần khái niệm — **không thiết kế bảng/cột database**, không có khoá chính/khoá ngoại thật, chỉ mô tả quan hệ logic.

## 1. Nguyên tắc mô hình hoá

- Mỗi **Entity** (thực thể) là 1 "đối tượng nghiệp vụ" đã có mock data tương ứng trong prototype (VD: `Lead`, `SalesOrder`, `Invoice`).
- Mỗi Entity có **vòng đời trạng thái** (state machine) riêng — trạng thái đổi khi entity di chuyển qua module khác.
- **Mũi tên `→`** nghĩa là "sinh ra/kích hoạt", **mũi tên `⇢`** nghĩa là "tham chiếu tới, không sở hữu" (read-only reference sang entity ở module khác).

## 2. Bản đồ Entity theo Module

### 2.1. CRM & Sales

| Entity | Trạng thái (vòng đời) | Sinh ra từ | Tiêu thụ bởi |
|---|---|---|---|
| `Customer` | Mới → Đang hoạt động → Ngừng hợp tác | Ghi nhận thủ công (`71`) | Toàn bộ module khác (⇢ tham chiếu) |
| `Lead` | Mới → Đang tiếp cận → Đủ điều kiện/Loại bỏ | Marketing/Sales nhập (`90`) | `Opportunity` |
| `Opportunity` | Mở → Đang đàm phán → Chốt thắng/Thua | Từ `Lead` đủ điều kiện (`91`, `92`) | `Quote` |
| `Quote` (Báo giá) | Nháp → Đã gửi → Được duyệt/Từ chối | Từ `Opportunity` + `PriceList` (`78`, `79`) | `SalesOrder` |
| `SalesOrder` | Nháp → Xác nhận → Đang xử lý → Hoàn tất | Khách chấp nhận `Quote` (`80`, `81`) | `ProductionPlan`, `Invoice` |
| `Contract` | Nháp → Đã ký → Còn hiệu lực → Hết hạn | Song song với `SalesOrder` (`86`) | Điều kiện tiên quyết cho `ProductionPlan` |

### 2.2. Production

| Entity | Trạng thái | Sinh ra từ | Tiêu thụ bởi |
|---|---|---|---|
| `ProductionPlan` | Nháp → Đã duyệt → Đang chạy → Hoàn tất | `SalesOrder` đã xác nhận (`103`) | `MRPResult` |
| `MRPResult` | Tính toán → Đã chốt | `ProductionPlan` (`104`) | `MaterialRequest`, `PurchaseRequest` |
| `MaterialRequest` | Yêu cầu → Đã cấp phát | `MRPResult` thiếu hụt tồn kho (`129`) | `Warehouse.StockOut` (NVL) |
| `PurchaseRequest` | Đề nghị → Đã duyệt → Đã mua | `MRPResult` thiếu hụt cần mua ngoài (`130`) | `Warehouse.StockIn` (NVL mới) |
| `WorkOrder` (Dệt/Nhuộm/Cắt/May/...) | Chờ → Đang chạy → Hoàn tất → QC | Tuần tự theo `ProductionPlan` (`106`–`118`) | `WorkOrder` kế tiếp (chuỗi) |
| `QCResult` | Đạt/Không đạt/Chờ tái kiểm | `WorkOrder` công đoạn QC (`117`) | `FinishedGoods` (nếu đạt) hoặc `WasteRecord` (nếu loại) |
| `FinishedGoods` | Nhập kho → Sẵn sàng xuất | `QCResult` đạt + Đóng gói (`118`, `119`) | `Warehouse.Inventory` |

### 2.3. Warehouse

| Entity | Trạng thái | Sinh ra từ | Tiêu thụ bởi |
|---|---|---|---|
| `InventoryItem` (NVL/Vải/Phụ liệu/Thành phẩm) | Còn hàng → Sắp hết → Hết hàng | `StockIn` hoặc `FinishedGoods` từ Production (`143`–`146`) | `StockOut`, `CycleCount` |
| `StockIn` (Phiếu nhập) | Nháp → Đã nhập | `PurchaseRequest` hoàn tất hoặc `FinishedGoods` từ Production (`147`) | Cộng vào `InventoryItem` |
| `StockOut` (Phiếu xuất) | Nháp → Đã xuất | `MaterialRequest` (Production) hoặc `SalesOrder` (Logistics) (`148`) | Trừ khỏi `InventoryItem`; kích hoạt `Shipment` |
| `StockTransfer` | Đang chuyển → Đã nhận | Điều phối nội bộ giữa các kho (`149`) | Cập nhật vị trí `InventoryItem` |
| `CycleCount` (Kiểm kê) | Đang kiểm → Đã đối soát → Có chênh lệch | Định kỳ hoặc đột xuất (`151`) | `StockAdjustment` (`150`) |
| `Batch/Lot` | Còn hạn → Sắp hết hạn → Hết hạn | Gắn với `InventoryItem` nhập theo lô (`154`) | FIFO/FEFO logic khi `StockOut` |

### 2.4. Logistics

| Entity | Trạng thái | Sinh ra từ | Tiêu thụ bởi |
|---|---|---|---|
| `PickList` | Chờ lấy hàng → Đang lấy → Hoàn tất | `StockOut` liên kết `SalesOrder` (`160`) | `PackingTask` |
| `PackingTask` | Chờ đóng gói → Đang đóng → Hoàn tất | `PickList` hoàn tất (`161`) | `Shipment` |
| `Shipment` (Vận đơn) | Chờ vận chuyển → Đang giao → Đã giao/Giao lại | `PackingTask` hoàn tất (`162`) | `Invoice` (xác nhận giao để xuất hoá đơn), `DeliverySchedule` |
| `ReturnGoods` (Hàng trả) | Yêu cầu trả → Đã nhận lại → Đã hoàn tiền | Khách trả hàng sau `Shipment` (`163`) | `InventoryItem` (nhập lại), `Finance.CreditNote` |

### 2.5. Finance

| Entity | Trạng thái | Sinh ra từ | Tiêu thụ bởi |
|---|---|---|---|
| `Invoice` (Hoá đơn) | Nháp → Đã xuất → Đã thanh toán/Quá hạn | `SalesOrder` + `Shipment` xác nhận giao (`186`) | `Receipt`, `AccountsReceivable` |
| `Receipt` (Phiếu thu) | Nháp → Đã thu | Khách thanh toán `Invoice` (`188`) | Giảm `AccountsReceivable`, cộng `CashAccount` |
| `Payment` (Phiếu chi) | Yêu cầu → Đã duyệt → Đã chi | `PurchaseOrder`/`Expense`/`Salary` cần thanh toán (`187`) | Giảm `CashAccount`/`BankAccount`, giảm `AccountsPayable` |
| `AccountsReceivable` / `AccountsPayable` | Còn nợ → Quá hạn → Đã tất toán | Chênh lệch `Invoice`/`PurchaseOrder` chưa thanh toán (`175`, `176`) | `CashFlow`, `AgingReport` |
| `JournalEntry` (Bút toán) | Nháp → Đã duyệt | Mọi giao dịch tài chính phát sinh (`193`) | `GeneralLedger` |
| `GeneralLedger` (Sổ cái) | Cộng dồn liên tục | Tổng hợp `JournalEntry` (`192`) | `BalanceSheet`, `ProfitLoss`, `CashFlowStatement` |
| `FixedAsset` | Đang dùng → Đã khấu hao hết → Thanh lý | Mua sắm ghi nhận (`190`) | `Depreciation` (`191`) → `JournalEntry` |

### 2.6. HR *(khoảng trống — entity dự kiến, chưa có prototype)*

| Entity dự kiến | Trạng thái dự kiến | Ghi chú |
|---|---|---|
| `Employee` | Đang làm việc → Nghỉ việc | Chưa có màn hình quản lý nhân viên tổng thể (chỉ có `124_worker_management.html` phạm vi hẹp trong Factory OS) |
| `Timesheet` (Chấm công) | Chưa chốt → Đã chốt | Chưa có prototype |
| `PayrollRun` (Bảng lương) | Đang tính → Đã chi trả | Có 1 phần tại `189_salary_payment.html` (Finance OS, chỉ góc nhìn chi tiền, thiếu góc nhìn tính lương từ chấm công/KPI) |
| `KPIRecord` | Đang đánh giá → Đã chốt | Chưa có prototype |
| `TrainingRecord` | Đăng ký → Hoàn thành → Cấp chứng chỉ | Có tại Academy (`11`–`20`) nhưng thiết kế cho đào tạo chung, chưa gắn với `Employee`/`KPIRecord` |

### 2.7. AI (Cross-cutting — không sở hữu entity riêng)

AI không sở hữu entity nghiệp vụ nào — nó **đọc (⇢)** entity từ mọi module khác và **sinh ra (→)** 3 loại entity riêng:

| Entity AI | Sinh ra từ | Tiêu thụ bởi |
|---|---|---|
| `Insight` | Phân tích dữ liệu bất kỳ module nào (VD tồn kho, công nợ) | Hiển thị qua AI Float Button / Insight Card ở chính module đó |
| `Forecast` | Dữ liệu lịch sử theo thời gian (VD `156_inventory_forecast.html`) | Cảnh báo sớm cho `MaterialRequest`, `PurchaseRequest` |
| `Recommendation` | Kết hợp `Insight` + `Forecast` + ngữ cảnh người dùng | Nút "Áp dụng" trên Insight Card (`167`, `195`, `132`) |

## 3. Sơ đồ luồng dữ liệu tổng thể (Cross-module Data Flow)

```
Customer ⇢──────────────────────────────────────────────────────┐
   │                                                              │
   ▼                                                              │
Lead → Opportunity → Quote → SalesOrder ────────┬───────────────►│
                                 │               │                │
                                 ▼               ▼                │
                            Contract      ProductionPlan          │
                                                 │                │
                                                 ▼                │
                              MRPResult → MaterialRequest/PurchaseRequest
                                                 │                │
                                                 ▼                │
                                   WorkOrder (×15 công đoạn)      │
                                                 │                │
                                                 ▼                │
                                          QCResult → FinishedGoods│
                                                 │                │
                                                 ▼                │
                                    InventoryItem (Warehouse)     │
                                                 │                │
                                                 ▼                │
                              StockOut → PickList → PackingTask   │
                                                 │                │
                                                 ▼                │
                                            Shipment ─────────────┘
                                                 │
                                                 ▼
                                    Invoice → Receipt → AccountsReceivable
                                                 │
                                                 ▼
                                    JournalEntry → GeneralLedger
                                                 │
                                                 ▼
                              BalanceSheet / ProfitLoss / CashFlowStatement

(AI đọc ⇢ mọi entity ở mọi bước trên, sinh ra Insight/Forecast/Recommendation)
```

## 4. Cơ chế đối chiếu chéo module (Cross-module Reconciliation)

Đây là điểm quan trọng nhất về mặt kỹ thuật: nhiều entity ở module sau **không tạo mới độc lập** mà **tham chiếu trực tiếp** entity đã tồn tại ở module trước, để đảm bảo tính toàn vẹn xuyên suốt:

| Entity tham chiếu | Tham chiếu tới | Mục đích đối chiếu |
|---|---|---|
| `ProductionPlan.orderId` | `SalesOrder.id` | Biết sản xuất cho đơn hàng nào |
| `StockOut.orderId` (Logistics) | `SalesOrder.id` | Xuất đúng số lượng/đúng khách hàng |
| `Invoice.orderId` | `SalesOrder.id` + `Shipment.id` | Chỉ xuất hoá đơn sau khi giao hàng xác nhận |
| `JournalEntry.sourceRef` | `Invoice.id` / `Payment.id` / `PayrollRun.id` | Truy vết mọi bút toán về đúng chứng từ gốc |
| `MaterialRequest.planId` | `ProductionPlan.id` | Biết vật tư xuất cho kế hoạch sản xuất nào |

**Hệ quả thiết kế cho Database Architecture (giai đoạn sau)**: mọi entity ở module hạ nguồn nên có ít nhất 1 trường tham chiếu (khoá ngoại) trỏ về entity gốc ở module thượng nguồn — đây là cơ sở quan trọng để thiết kế schema, dù tài liệu này không đi sâu vào cấu trúc bảng.

## 5. Tham chiếu

- Góc nhìn nghiệp vụ: [BUSINESS_FLOW.md](BUSINESS_FLOW.md)
- Ranh giới gọi module: [MODULE_FLOW.md](MODULE_FLOW.md)
- Chi tiết AI đọc/ghi entity: [AI_FLOW.md](AI_FLOW.md)
