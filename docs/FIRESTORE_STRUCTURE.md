# FIRESTORE_STRUCTURE.md — Thiết kế Collections

**Chỉ thiết kế cấu trúc, không viết dữ liệu.** Toàn bộ tên field dưới đây là **khái niệm** (conceptual field), không phải schema triển khai — không có kiểu dữ liệu chi tiết, không có index, không có dữ liệu mẫu.

## 1. Nguyên tắc tổ chức — mở rộng trên nền đã có

`packages/database/src/firestore/collections.ts` đã xác lập **Organization là gốc cách ly dữ liệu** (tenant root). Toàn bộ collection nghiệp vụ mới (từ 7 module Data Flow Stage 3) đặt làm **subcollection trực tiếp của `organizations/{orgId}`**, đặt tên theo quy ước `{module}_{entity_so_nhieu}` để dễ phân biệt khi liệt kê (Firestore không có khái niệm "thư mục", đây là quy ước đặt tên, không phải cấu trúc vật lý):

```
organizations/{orgId}/
   ├── branches/{branchId}                    ← đã có
   │      └── departments/{departmentId}      ← đã có
   ├── roles/{roleId}                          ← đã có
   ├── members/{uid}                           ← đã có
   ├── crm_*                                   ← MỚI (Stage 4)
   ├── production_*                            ← MỚI
   ├── warehouse_*                              ← MỚI
   ├── logistics_*                              ← MỚI
   ├── finance_*                                ← MỚI
   ├── hr_*                                      ← MỚI (dự kiến, module gốc chưa có UI)
   └── ai_*                                      ← MỚI
```

## 2. Collection: CRM & Sales (`crm_*`) — dịch vụ dùng chung (đã chốt)

**Quyết định của người điều hành dự án**: CRM **không** phải dữ liệu riêng của 1 module nghiệp vụ — đây là **dịch vụ dùng chung** (shared service), phục vụ mọi module cần thông tin khách hàng/lead/cơ hội/hợp đồng: Business OS tạo Lead/Quote, Warehouse tra `crm_customers` khi xuất kho theo đơn, Finance tra `crm_sales_orders`/`crm_contracts` khi xuất hoá đơn, Production tra `crm_sales_orders` để lập kế hoạch. Về mặt cấu trúc Firestore, điều này **không đổi cách đặt subcollection** (`crm_*` vẫn nested dưới `organizations/{orgId}`, đúng nguyên tắc cách ly ở mục 1) — chỉ xác nhận rõ **quyền truy cập** (`Permission.resource = "crm"`) nên cấp cho nhiều Role/module khác nhau ở mức `view` tối thiểu, không giới hạn riêng cho 1 nhóm nghiệp vụ như tên gọi "CRM module" có thể gây hiểu lầm. Ở tầng Hosting, hệ quả tương ứng là CRM không có Hosting site/domain riêng — xem `HOSTING_STRUCTURE.md` mục 1.

| Collection | Mục đích | Field khái niệm chính | Tham chiếu tới |
|---|---|---|---|
| `crm_customers` | Khách hàng | name, taxCode, contactInfo, status | — (gốc, không tham chiếu) |
| `crm_leads` | Lead (khách tiềm năng) | source, status, assignedTo (uid) | `crm_customers` (nếu đã là khách cũ) |
| `crm_opportunities` | Cơ hội bán hàng (Pipeline) | leadId, stage, estimatedValue | `crm_leads` |
| `crm_quotes` | Báo giá | opportunityId, items[], validUntil, status | `crm_opportunities` |
| `crm_sales_orders` | Đơn hàng | quoteId, customerId, status, totalAmount | `crm_quotes`, `crm_customers` |
| `crm_contracts` | Hợp đồng | salesOrderId, signedDate, expiryDate, fileRef (Storage) | `crm_sales_orders` |

## 3. Collection: Production (`production_*`)

| Collection | Mục đích | Field khái niệm chính | Tham chiếu tới |
|---|---|---|---|
| `production_plans` | Kế hoạch sản xuất | salesOrderId, startDate, endDate, status | `crm_sales_orders` |
| `production_mrp_results` | Kết quả tính MRP | planId, materialNeeds[] | `production_plans` |
| `production_material_requests` | Yêu cầu vật tư | mrpResultId, status | `production_mrp_results` |
| `production_purchase_requests` | Đề nghị mua hàng | mrpResultId, supplierId, status | `production_mrp_results` |
| `production_work_orders` | Công đoạn SX (Dệt/Nhuộm/Cắt/May...) | planId, stage (enum), status, machineId, workerId | `production_plans` |
| `production_qc_results` | Kết quả QC | workOrderId, result (đạt/không đạt), inspector | `production_work_orders` |
| `production_finished_goods` | Thành phẩm nhập kho | planId, qcResultId, quantity | `production_qc_results` |
| `production_machines` | Danh mục máy móc | name, type, status | — |
| `production_workers` | Danh mục công nhân | name, shiftId | `hr_employees` (khi HR có thật) |
| `production_waste_records` | Hao hụt | workOrderId, quantity, reason | `production_work_orders` |

## 4. Collection: Warehouse (`warehouse_*`)

| Collection | Mục đích | Field khái niệm chính | Tham chiếu tới |
|---|---|---|---|
| `warehouse_inventory_items` | Tồn kho hiện tại (NVL/Vải/Phụ liệu/Thành phẩm) | sku, category, quantity, location, batchId | `production_finished_goods` (nếu là thành phẩm) |
| `warehouse_batches` | Lô/Lot (FIFO/FEFO) | itemSku, expiryDate, receivedDate | `warehouse_inventory_items` |
| `warehouse_stock_movements` | Nhật ký nhập/xuất/chuyển kho (gộp 3 loại bằng field `type`) | type (in/out/transfer), itemSku, quantity, refDoc | `production_purchase_requests` hoặc `crm_sales_orders` |
| `warehouse_cycle_counts` | Phiếu kiểm kê | scheduledDate, status, discrepancies[] | `warehouse_inventory_items` |
| `warehouse_locations` | Vị trí lưu kho (khu/kệ) | zone, capacity | — |

## 5. Collection: Logistics (`logistics_*`)

> Theo `MODULE_FLOW.md` Stage 3, Logistics hiện là tập con nghiệp vụ của Warehouse — nhưng ở tầng dữ liệu, tách riêng collection để dễ mở rộng thành module UI độc lập sau này mà không cần di chuyển dữ liệu.

| Collection | Mục đích | Field khái niệm chính | Tham chiếu tới |
|---|---|---|---|
| `logistics_pick_lists` | Danh sách lấy hàng | salesOrderId, status, assignedTo | `crm_sales_orders`, `warehouse_stock_movements` |
| `logistics_packing_tasks` | Đóng gói | pickListId, status | `logistics_pick_lists` |
| `logistics_shipments` | Vận đơn | packingTaskId, carrier, trackingCode, status | `logistics_packing_tasks` |
| `logistics_return_goods` | Hàng trả | shipmentId, reason, status | `logistics_shipments` |

## 6. Collection: Finance (`finance_*`)

| Collection | Mục đích | Field khái niệm chính | Tham chiếu tới |
|---|---|---|---|
| `finance_invoices` | Hoá đơn | salesOrderId, shipmentId, amount, status | `crm_sales_orders`, `logistics_shipments` |
| `finance_receipts` | Phiếu thu | invoiceId, amount, method | `finance_invoices` |
| `finance_payments` | Phiếu chi | purchaseRequestId hoặc payrollRunId, amount, status | `production_purchase_requests`, `hr_payroll_runs` |
| `finance_accounts_receivable` | Công nợ phải thu (view tổng hợp, có thể là collection tính toán định kỳ) | customerId, agingBucket, amount | `finance_invoices` |
| `finance_accounts_payable` | Công nợ phải trả | supplierId, agingBucket, amount | `finance_payments` |
| `finance_journal_entries` | Bút toán | debitAccount, creditAccount, amount, sourceRef | Bất kỳ collection nào phát sinh giao dịch |
| `finance_general_ledger` | Sổ cái (tổng hợp theo tài khoản) | accountCode, balance | `finance_journal_entries` |
| `finance_fixed_assets` | Tài sản cố định | name, cost, usefulLifeMonths | — |
| `finance_depreciation_schedules` | Khấu hao | assetId, period, amount | `finance_fixed_assets` |
| `finance_budgets` | Ngân sách | departmentId, period, allocatedAmount | `departments` |
| `finance_tax_records` | Nghĩa vụ thuế | type, period, dueDate, status | — |

## 7. Collection: HR (`hr_*`) — dự kiến, module gốc chưa có UI (xem Stage 3 khoảng trống)

| Collection | Mục đích | Field khái niệm chính | Tham chiếu tới |
|---|---|---|---|
| `hr_employees` | Hồ sơ nhân viên | uid (liên kết Firebase Auth), departmentId, position | `members` (Membership), `departments` |
| `hr_timesheets` | Chấm công | employeeId, date, checkIn, checkOut | `hr_employees` |
| `hr_payroll_runs` | Bảng lương | period, employeeId, grossAmount, netAmount | `hr_timesheets`, `hr_kpi_records` |
| `hr_kpi_records` | Đánh giá KPI | employeeId, period, score | `hr_employees` |
| `hr_training_records` | Đào tạo | employeeId, courseId, completionStatus | `hr_employees` (Academy course id ngoài phạm vi Firestore này nếu Academy là module riêng) |

## 8. Collection: AI (`ai_*`)

| Collection | Mục đích | Field khái niệm chính | Tham chiếu tới |
|---|---|---|---|
| `ai_insights` | Gợi ý AI đã sinh ra (nối tiếp `AI_FLOW.md`) | module, severity, message, sourceEntityRef | Bất kỳ entity nào ở module khác |
| `ai_forecasts` | Kết quả dự báo | module, metric, period, predictedValue | `ai_insights` |
| `ai_recommendations` | Đề xuất hành động cụ thể | insightId, actionType, targetEntityRef | `ai_insights` |
| `ai_agent_conversations` | Lịch sử hội thoại với AI Agent (nối tiếp `42`-`69` prototype) | agentSlug, uid, messages[] (hoặc subcollection `messages`) | `members` |

## 9. Bảng tổng hợp: Collection nào cách ly theo Organization?

**100% collection nghiệp vụ đều nested dưới `organizations/{orgId}`** — không có collection nghiệp vụ nào đặt ở top-level ngoài `organizations`. Đây là nguyên tắc cách ly dữ liệu tuyệt đối (xem `SECURITY_RULES.md` mục Organization Isolation), chỉ có 2 ngoại lệ ở top-level thật sự cần thiết:

| Collection top-level (ngoài `organizations`) | Lý do không nested |
|---|---|
| `organizations` (chính nó) | Gốc, không thể tự lồng vào chính nó |
| `platform_config` (mới, đề xuất) | Cấu hình toàn nền tảng không thuộc riêng 1 Organization nào (VD danh sách `MODULES[]` nếu cần đồng bộ động thay vì hard-code trong `packages/core`) |

## 10. Đối chiếu với Entity ở DATA_FLOW.md (Stage 3)

Toàn bộ Entity đã liệt kê ở `DATA_FLOW.md` mục 2 (`Lead`, `Opportunity`, `Quote`, `SalesOrder`, `Contract`, `ProductionPlan`, `MRPResult`, `WorkOrder`, `QCResult`, `FinishedGoods`, `InventoryItem`, `StockIn/Out/Transfer`, `CycleCount`, `Batch/Lot`, `PickList`, `PackingTask`, `Shipment`, `ReturnGoods`, `Invoice`, `Receipt`, `Payment`, `AccountsReceivable/Payable`, `JournalEntry`, `GeneralLedger`, `FixedAsset`, `Employee`, `Timesheet`, `PayrollRun`, `KPIRecord`, `TrainingRecord`, `Insight`, `Forecast`, `Recommendation`) đều đã có collection tương ứng ở tài liệu này — **không có entity nào ở Stage 3 bị bỏ sót** khi thiết kế Firestore Stage 4.

## 11. Tham chiếu

- Ý nghĩa nghiệp vụ từng entity: [DATA_FLOW.md](DATA_FLOW.md) (Stage 3)
- Quy tắc bảo mật theo collection: [SECURITY_RULES.md](SECURITY_RULES.md)
- Cloud Function nào ghi vào collection nào: [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md)
