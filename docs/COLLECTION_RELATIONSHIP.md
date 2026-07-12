# COLLECTION_RELATIONSHIP.md — Sơ đồ quan hệ giữa các Collection

## 1. Nguyên tắc tham chiếu

- Mọi quan hệ giữa 2 collection là **field string chứa Document ID** (`<entity>Id`), **không dùng** kiểu `DocumentReference` gốc và **không lồng subcollection sâu** cho dữ liệu nghiệp vụ (khác với `organizations/branches/departments/members` — nested, đã có sẵn, giữ nguyên vì bản chất phân cấp thật: chi nhánh thuộc công ty, phòng ban thuộc chi nhánh).
- Quan hệ N-N thực sự (ít gặp trong danh sách Stage 5) mô hình hoá bằng **collection trung gian** (VD `order_items` nối `orders`×`products`), không dùng mảng ID 2 chiều.
- Quan hệ đa hình (1 field trỏ tới nhiều loại collection khác nhau, VD `activity_logs.targetId`) luôn đi kèm 1 field phụ nêu rõ collection đích (`targetCollection`/`refCollection`) — không suy đoán ngầm.

## 2. Sơ đồ quan hệ CORE — 3 tầng cách ly (Xác nhận Stage 5, quyết định #1/#2)

```
organizations (tầng 1: công ty)
   └── workspaces (tầng 2: mảng nghiệp vụ — 8 loại cố định:
        │           business/academy/factory/warehouse/finance/marketing/ai/admin)
        └── branches (tầng 3, đã có, nested) ── departments (đã có, nested)

Mọi collection nghiệp vụ (B–K) mang CẢ 3 field: organizationId + workspaceId + branchId (nếu áp dụng)
— không phải path lồng nhau, đây là 3 field độc lập trên 1 document phẳng (xem FIELD_STANDARD.md mục 3).
```

```
organizations ──┬── workspaces
                ├── branches (đã có) ── departments (đã có)
                ├── roles ── members (đã có, qua roleId — nay là Auto-ID thật, xem ID_STANDARD.md mục 2)
                ├── settings (scopeId)
                ├── files
                ├── tokens (1-1)
                └── ai_agents

users ──┬── members (đã có, N tổ chức)
        ├── notifications (recipientUid)
        ├── activity_logs (actorUid)
        ├── ai_history (uid)
        └── employees (uid, tuỳ chọn)

roles.permissions[] ⇢ permissions (tham chiếu theo GIÁ TRỊ resource+action, không phải FK Document ID)
```

## 3. Chuỗi nghiệp vụ CRM → SALES → WAREHOUSE → FACTORY (trục chính, nối tiếp `BUSINESS_FLOW.md` Stage 3)

```
leads ──(convertedCustomerId)──► customers ──┬── customer_contacts
                                              ├── customer_groups ── price_lists
                                              ├── opportunities ── quotations
                                              └── contracts

quotations ──► orders ──┬── order_items ──► products ──┬── product_categories
                         │                              ├── product_variants
                         │                              └── product_images
                         ├── contracts (1-1 tuỳ chọn)
                         ├── payments / receipts / returns
                         └── production_orders (khi cần sản xuất theo đơn)

production_orders ──┬── production_steps ──┬── work_centers
                     │                      └── machines
                     ├── bom ──► materials
                     ├── mrp_results ──► bom + materials (nhu cầu vật tư đã tính)
                     ├── quality_checks
                     ├── packing ──► inventory_transactions ──► inventory
                     └── production_reports (tổng hợp theo kỳ, đọc từ production_orders/quality_checks)
                                                                     │
warehouses ──┬── locations                                          │
             └── inventory ◄────────────────────────────────────────┘
                     ▲
transfer_orders ─────┘ (chuyển kho, cũng ghi inventory_transactions)

stock_adjustments / stock_counts ──► inventory_transactions ──► inventory

inventory ──► shipments (domain LOGISTICS, mục 4a) khi xuất hàng giao khách
```

## 4. Chuỗi nghiệp vụ FINANCE (nối tiếp `orders`/`payroll`/`expenses`)

```
orders ──► invoices ──┬── receipts (thanh toán từng phần) ──► cashbooks
                       └── debts (nếu chưa thanh toán đủ)
suppliers/employees ──► payments ──► cashbooks
payments + receipts ──► debts (agingBucket theo type receivable/payable)
expenses / revenues ──► ledger_entries ──► accounts (chart of accounts)
invoices / payments / receipts / payroll ──► ledger_entries (mỗi chứng từ phát sinh 1 bút toán)
fixed_assets ──► ledger_entries (khấu hao định kỳ)
payroll ──► payments (purpose=payroll) ──► employees
taxes ── (tổng hợp độc lập từ orders/payroll/expenses, ngoài phạm vi tính toán Stage 5)
```

## 4a. Chuỗi nghiệp vụ LOGISTICS *(Domain mới — Xác nhận Stage 5, quyết định #7)*

```
orders ──► shipments ──┬── tracking (nhật ký trạng thái, append-only, qua webhook)
                        └── delivery_orders (phiếu giao hàng, gộp N shipments)
carriers ──► shipments (đơn vị vận chuyển phụ trách)
warehouses ──► shipments (kho xuất hàng)
```

## 5. Chuỗi nghiệp vụ HR

```
employees ──(departmentId)──► departments (đã có, nested)
employees ──┬── attendance
             ├── leave_requests
             ├── payroll
             ├── kpi
             └── training ──(courseId, tuỳ chọn)──► courses (Academy)
```

## 6. Chuỗi nghiệp vụ ACADEMY

```
courses ──┬── chapters ──► lessons ──► quizzes
          ├── students ◄── users (uid)
          ├── assignments
          └── certificates ◄── students
```

## 7. Chuỗi nghiệp vụ AI

```
ai_agents ──┬── ai_history ◄── users (uid)
             ├── prompts
             ├── ai_memories ◄── users (uid) — bộ nhớ dài hạn, khác ai_history (lịch sử thô)
             └── usage_logs ◄── models

workflows ──► automation (log thực thi)
knowledge ──► files (sourceFileId)

Bất kỳ module nghiệp vụ nào (CRM/SALES/WAREHOUSE/FACTORY/FINANCE...) ──► ai_insights
                                                                          └──► ai_recommendations
ai_insights/ai_forecasts đọc dữ liệu lịch sử từ mọi domain qua sourceCollection/sourceId (đa hình,
không FK cứng) — đây là điểm khác biệt của domain AI: không sở hữu dữ liệu nghiệp vụ, chỉ SINH RA
kết quả phân tích tham chiếu ngược lại dữ liệu nghiệp vụ.
```

## 8. Bảng tổng hợp toàn bộ khoá ngoại (FK) theo domain

| Collection (nguồn) | Field FK | Collection đích |
|---|---|---|
| `workspaces` | organizationId | `organizations` |
| `roles` | organizationId | `organizations` |
| `members` (đã có) | roleId | `roles` |
| `settings` | scopeId | `organizations` / `workspaces` / `users` (tuỳ `scopeType`) |
| `notifications` | recipientUid | `users` |
| `activity_logs` | targetId + targetCollection | đa hình (bất kỳ) |
| `files` | uploadedBy | `users` |
| `ai_agents` | moduleSlug | `MODULES` (code, không phải Firestore) |
| `ai_history` | agentId, uid | `ai_agents`, `users` |
| `customers` | customerGroupId, assignedTo | `customer_groups`, `users` |
| `customer_contacts` | customerId | `customers` |
| `supplier_contacts` | supplierId | `suppliers` |
| `leads` | assignedTo, convertedCustomerId | `users`, `customers` |
| `opportunities` | leadId / customerId | `leads` / `customers` |
| `price_lists` | customerGroupId, items[].productId | `customer_groups`, `products` |
| `contracts` | customerId, salesOrderId, fileRef | `customers`, `orders`, `files` |
| `product_categories` | parentCategoryId | `product_categories` (self) |
| `product_variants` | productId | `products` |
| `product_images` | productId / variantId | `products` / `product_variants` |
| `orders` | customerId, quotationId | `customers`, `quotations` |
| `order_items` | orderId, productId / variantId | `orders`, `products` / `product_variants` |
| `quotations` | customerId / opportunityId | `customers` / `opportunities` |
| `payments` | payeeId | `suppliers` / `employees` (tuỳ `purpose`) |
| `receipts` | orderId, payerId | `orders`, `customers` |
| `returns` | orderId | `orders` |
| `inventory` | warehouseId, locationId, productId | `warehouses`, `locations`, `products` |
| `inventory_transactions` | refId + refCollection | đa hình (`orders`/`production_orders`/`transfer_orders`/`stock_adjustments`) |
| `stock_adjustments` | warehouseId | `warehouses` |
| `stock_counts` | warehouseId | `warehouses` |
| `transfer_orders` | fromWarehouseId, toWarehouseId | `warehouses` |
| `locations` | warehouseId | `warehouses` |
| `production_orders` | orderId | `orders` |
| `production_steps` | productionOrderId, workCenterId, machineId | `production_orders`, `work_centers`, `machines` |
| `bom` | productId, items[].materialId | `products`, `materials` |
| `machines` | workCenterId | `work_centers` |
| `quality_checks` | productionOrderId / productionStepId | `production_orders` / `production_steps` |
| `packing` | productionOrderId | `production_orders` |
| `employees` | uid, departmentId | `users`, `departments` (đã có) |
| `attendance` | employeeId | `employees` |
| `leave_requests` | employeeId | `employees` |
| `payroll` | employeeId | `employees` |
| `kpi` | employeeId | `employees` |
| `training` | employeeId, courseId | `employees`, `courses` |
| `expenses` | departmentId, paymentId | `departments`, `payments` |
| `revenues` | refId + refCollection | đa hình (VD `orders`) |
| `accounts` | parentAccountId | `accounts` (self) |
| `debts` | partyId, invoiceId | `customers` / `suppliers` (tuỳ `partyType`), `invoices` |
| `invoices` | orderId, customerId, fileRef | `orders`, `customers`, `files` |
| `ledger_entries` | debitAccountId, creditAccountId, sourceId + sourceCollection | `accounts` (×2), đa hình (`invoices`/`payments`/`receipts`/`payroll`...) |
| `fixed_assets` | — | (gốc, sinh `ledger_entries` khi khấu hao) |
| `mrp_results` | productionOrderId, bomId, materialNeeds[].materialId | `production_orders`, `bom`, `materials` |
| `production_reports` | workCenterId | `work_centers` |
| `shipments` | orderId, warehouseId, carrierId | `orders`, `warehouses`, `carriers` |
| `delivery_orders` | shipmentIds | `shipments` |
| `tracking` | shipmentId | `shipments` |
| `carriers` | — | (gốc) |
| `ai_insights` | sourceId + sourceCollection | đa hình (bất kỳ collection nghiệp vụ nào) |
| `ai_forecasts` | — | (tính toán từ dữ liệu lịch sử, không FK cứng) |
| `ai_recommendations` | insightId, targetId + targetCollection | `ai_insights`, đa hình |
| `ai_memories` | agentId, uid | `ai_agents`, `users` |
| `chapters` | courseId | `courses` |
| `lessons` | chapterId, courseId | `chapters`, `courses` |
| `quizzes` | lessonId / chapterId | `lessons` / `chapters` |
| `assignments` | courseId | `courses` |
| `students` | uid, courseId | `users`, `courses` |
| `certificates` | uid, courseId, fileId | `users`, `courses`, `files` |
| `prompts` | agentId | `ai_agents` |
| `knowledge` | sourceFileId | `files` |
| `workflows` | — | (định nghĩa gốc, không FK ra ngoài) |
| `automation` | workflowId | `workflows` |
| `usage_logs` | agentId / modelSlug, uid | `ai_agents` / `models`, `users` |
| `tokens` | organizationId (= Document ID) | `organizations` |
| `pages` | contentBlocks[].componentId | `components` |
| `menus` | parentMenuId, moduleSlug | `menus` (self), `MODULES` (code) |
| `countries` | currencyCode | `currencies` |
| `users` | defaultOrganizationId, locale | `organizations`, `languages` |

## 9. Đối chiếu với Entity đã thiết kế ở `DATA_FLOW.md` (Stage 3) và `FIRESTORE_STRUCTURE.md` (Stage 4)

| Entity Stage 3/4 | Collection Stage 5 tương ứng | Ghi chú đổi tên |
|---|---|---|
| `Lead` | `leads` | không đổi |
| `Opportunity` | `opportunities` | không đổi |
| `Quote` (Stage 3) / `crm_quotes` (Stage 4) | `quotations` | đổi tên |
| `SalesOrder` / `crm_sales_orders` | `orders` + `order_items` | tách 1-N thay vì 1 collection duy nhất |
| `Contract` / `crm_contracts` | `contracts` | không đổi |
| `ProductionPlan` / `production_plans` | `production_orders` | đổi tên |
| `WorkOrder` / `production_work_orders` | `production_steps` | đổi tên, gộp vào 1 lệnh sản xuất |
| `MRPResult` / `production_mrp_results` | `mrp_results` | ✅ đã bổ sung (Xác nhận Stage 5, quyết định #6) |
| `QCResult` / `production_qc_results` | `quality_checks` | đổi tên |
| `FinishedGoods` / `production_finished_goods` | gộp vào `packing` + `inventory` | gộp |
| `InventoryItem` / `warehouse_inventory_items` | `inventory` | đổi tên |
| `StockIn/Out/Transfer` / `warehouse_stock_movements` | `inventory_transactions` | đổi tên, gộp 3 loại bằng field `type` |
| `CycleCount` / `warehouse_cycle_counts` | `stock_counts` | đổi tên |
| `Batch/Lot` / `warehouse_batches` | gộp vào `inventory.batchId` | gộp (không tách collection riêng ở Stage 5) |
| `PickList`/`PackingTask`/`Shipment`/`ReturnGoods` (Logistics) | `shipments`/`delivery_orders`/`tracking`/`carriers` (domain K mới) | ✅ đã tách domain riêng (Xác nhận Stage 5, quyết định #7) — `PickList`/`PackingTask` chi tiết hơn được gộp vào `delivery_orders`, xem `DATABASE_REVIEW.md` mục 4.6 cho ghi chú gộp |
| `Invoice` / `finance_invoices` | `invoices` | ✅ đã bổ sung (Xác nhận Stage 5, quyết định #5) |
| `Receipt` / `finance_receipts` | `receipts` | không đổi |
| `Payment` / `finance_payments` | `payments` | không đổi |
| `AccountsReceivable/Payable` | `debts` (gộp bằng field `type`) | gộp |
| `JournalEntry`/`GeneralLedger` | `ledger_entries` | ✅ đã bổ sung (Xác nhận Stage 5, quyết định #5) |
| `FixedAsset`/`DepreciationSchedule` | `fixed_assets` (field `depreciationSchedule` nhúng) | ✅ đã bổ sung (Xác nhận Stage 5, quyết định #5) |
| `Employee`/`Timesheet`/`PayrollRun`/`KPIRecord`/`TrainingRecord` | `employees`/`attendance`/`payroll`/`kpi`/`training` | khớp đầy đủ |
| `Insight`/`Forecast`/`Recommendation` (AI) | `ai_insights`/`ai_forecasts`/`ai_recommendations` | ✅ đã bổ sung (Xác nhận Stage 5, quyết định #8) — thêm mới `ai_memories` (bộ nhớ dài hạn agent, không có ở Stage 3/4) |

## 10. Tham chiếu

- Chi tiết field từng collection: [COLLECTIONS.md](COLLECTIONS.md)
- Danh sách gap cần quyết định: [DATABASE_REVIEW.md](../DATABASE_REVIEW.md)
