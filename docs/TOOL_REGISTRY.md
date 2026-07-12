# TOOL_REGISTRY.md — Danh mục Tool chuẩn (9 Domain)

Danh mục đầy đủ Tool khả dụng trên nền tảng — mỗi Tool theo đúng khuôn mẫu `ToolDefinition` ở `TOOL_CALLING.md` mục 1. Toàn bộ Tool ở đây là **READ-ONLY** (nguyên tắc bao trùm, `AI_TOOL_ARCHITECTURE.md` mục 3) và **bắt buộc nhận `organizationId`** (không lặp lại trong `inputSchema` từng Tool bên dưới, ngầm định mọi Tool).

## A. Orders

### `getOrderDetails`
- **description**: Lấy chi tiết 1 đơn hàng (sản phẩm, số lượng, hạn giao, trạng thái)
- **inputSchema**: `{ orderId: string }`
- **outputSchema**: `{ orderCode, customerId, dueDate, status, items: array<{ productId, sku, quantity }> }`
- **requiredPermission**: `{ resource: "business-os", action: "view" }`
- **sourceCollections**: `orders`, `order_items`

### `listOrdersByStatus`
- **description**: Liệt kê đơn hàng theo trạng thái (VD tất cả đơn "pending_approval")
- **inputSchema**: `{ status: string, fromDate?: number, toDate?: number }`
- **outputSchema**: `array<{ orderId, orderCode, customerId, status, dueDate }>`
- **requiredPermission**: `{ resource: "business-os", action: "view" }`
- **sourceCollections**: `orders`

### `checkOrderTimeline`
- **description**: Kiểm tra 1 đơn hàng có nguy cơ trễ hạn theo tiến độ sản xuất/giao vận không
- **inputSchema**: `{ orderId: string }`
- **outputSchema**: `{ dueDate, productionStatus, estimatedShipDate, isAtRisk: boolean }`
- **requiredPermission**: `{ resource: "business-os", action: "view" }`
- **sourceCollections**: `orders`, `production_orders`, `shipments`

## B. Customers

### `getCustomerProfile`
- **description**: Lấy hồ sơ khách hàng (nhóm, người liên hệ, trạng thái)
- **inputSchema**: `{ customerId: string }`
- **outputSchema**: `{ name, taxCode, customerGroupId, status, contacts: array<{ name, phone, email }> }`
- **requiredPermission**: `{ resource: "crm", action: "view" }`
- **sourceCollections**: `customers`, `customer_contacts`

### `getCustomerDebtStatus`
- **description**: Kiểm tra công nợ hiện tại của 1 khách hàng
- **inputSchema**: `{ customerId: string }`
- **outputSchema**: `{ totalReceivable, overdueAmount, invoices: array<{ invoiceCode, dueDate, amount, status }> }`
- **requiredPermission**: `{ resource: "finance", action: "view" }`
- **sourceCollections**: `debts`, `invoices`

### `findStaleLeads`
- **description**: Tìm Lead lâu chưa được chăm sóc (quá N ngày không cập nhật)
- **inputSchema**: `{ daysSinceLastContact: number }`
- **outputSchema**: `array<{ leadId, source, assignedTo, lastUpdatedAt }>`
- **requiredPermission**: `{ resource: "crm", action: "view" }`
- **sourceCollections**: `leads`

## C. Products

### `getProductDetails`
- **description**: Lấy chi tiết sản phẩm (biến thể, giá, danh mục)
- **inputSchema**: `{ productId: string }`
- **outputSchema**: `{ sku, name, categoryId, basePrice, currency, variants: array<{ sku, attributes }> }`
- **requiredPermission**: `{ resource: "business-os", action: "view" }`
- **sourceCollections**: `products`, `product_variants`, `product_categories`

### `getProductSalesTrend`
- **description**: Tổng hợp sản lượng bán ra của 1 sản phẩm theo kỳ (đọc/tổng hợp, không tính toán nghiệp vụ phức tạp)
- **inputSchema**: `{ productId: string, period: string }`
- **outputSchema**: `{ period, totalQuantitySold, totalRevenue }`
- **requiredPermission**: `{ resource: "business-os", action: "view" }`
- **sourceCollections**: `order_items`, `orders`

## D. Inventory

### `checkInventoryAvailability`
- **description**: Kiểm tra tồn kho khả dụng của 1 SKU
- **inputSchema**: `{ sku: string, warehouseId?: string }`
- **outputSchema**: `{ sku, quantityOnHand, quantityReserved, quantityAvailable }`
- **requiredPermission**: `{ resource: "warehouse", action: "view" }`
- **sourceCollections**: `inventory`

### `getLowStockItems`
- **description**: Liệt kê mặt hàng dưới ngưỡng tồn kho tối thiểu
- **inputSchema**: `{ warehouseId?: string }`
- **outputSchema**: `array<{ sku, quantityOnHand, reorderLevel }>`
- **requiredPermission**: `{ resource: "warehouse", action: "view" }`
- **sourceCollections**: `inventory`, `materials`

## E. Warehouse

### `getWarehouseUtilization`
- **description**: Mức sử dụng sức chứa của 1 kho
- **inputSchema**: `{ warehouseId: string }`
- **outputSchema**: `{ totalCapacity, usedCapacity, utilizationRate }`
- **requiredPermission**: `{ resource: "warehouse", action: "view" }`
- **sourceCollections**: `warehouses`, `locations`, `inventory`

### `getPendingTransfers`
- **description**: Liệt kê phiếu điều chuyển kho đang xử lý
- **inputSchema**: `{ warehouseId?: string }`
- **outputSchema**: `array<{ transferCode, fromWarehouseId, toWarehouseId, status }>`
- **requiredPermission**: `{ resource: "warehouse", action: "view" }`
- **sourceCollections**: `transfer_orders`

## F. Production

### `checkProductionCapacity`
- **description**: Kiểm tra khả năng sản xuất bù khi thiếu hàng (có lệnh SX chạy chưa, đủ NVL chưa)
- **inputSchema**: `{ productId: string, quantityNeeded: number }`
- **outputSchema**: `{ hasActiveProductionOrder: boolean, estimatedCompletionDate, missingMaterials: array<{ materialId, quantityShort }> }`
- **requiredPermission**: `{ resource: "production", action: "view" }`
- **sourceCollections**: `production_orders`, `mrp_results`, `bom`, `materials`, `inventory`

### `getProductionOrderStatus`
- **description**: Tiến độ 1 lệnh sản xuất cụ thể (công đoạn, QC)
- **inputSchema**: `{ productionOrderId: string }`
- **outputSchema**: `{ productionOrderCode, status, steps: array<{ name, status }>, lastQualityCheckResult }`
- **requiredPermission**: `{ resource: "production", action: "view" }`
- **sourceCollections**: `production_orders`, `production_steps`, `quality_checks`

## G. Finance

### `getInvoiceStatus`
- **description**: Trạng thái 1 hoá đơn (đã thu bao nhiêu, còn nợ bao nhiêu)
- **inputSchema**: `{ invoiceId: string }`
- **outputSchema**: `{ invoiceCode, amount, status, receipts: array<{ receiptCode, amount }>, remainingAmount }`
- **requiredPermission**: `{ resource: "finance", action: "view" }`
- **sourceCollections**: `invoices`, `receipts`

### `getOverdueDebts`
- **description**: Liệt kê công nợ quá hạn (phải thu hoặc phải trả)
- **inputSchema**: `{ type: "receivable" | "payable" }`
- **outputSchema**: `array<{ partyId, partyType, amount, dueDate, agingBucket }>`
- **requiredPermission**: `{ resource: "finance", action: "view" }`
- **sourceCollections**: `debts`

### `getCashflowSummary`
- **description**: Tổng hợp thu/chi theo kỳ từ sổ quỹ
- **inputSchema**: `{ period: string }`
- **outputSchema**: `{ totalInflow, totalOutflow, netCashflow }`
- **requiredPermission**: `{ resource: "finance", action: "view" }`
- **sourceCollections**: `cashbooks`, `payments`, `receipts`

## H. HR

### `getEmployeeProfile`
- **description**: Hồ sơ nhân viên (phòng ban, vị trí, loại hợp đồng)
- **inputSchema**: `{ employeeId: string }`
- **outputSchema**: `{ employeeCode, departmentId, position, contractType }`
- **requiredPermission**: `{ resource: "hr", action: "view" }`
- **sourceCollections**: `employees`

### `findExpiringContracts`
- **description**: Tìm nhân viên sắp hết hạn hợp đồng lao động
- **inputSchema**: `{ withinDays: number }`
- **outputSchema**: `array<{ employeeId, employeeCode, contractEndDate }>`
- **requiredPermission**: `{ resource: "hr", action: "view" }`
- **sourceCollections**: `employees`

### `getPayrollSummary`
- **description**: Tổng hợp bảng lương theo kỳ
- **inputSchema**: `{ period: string, departmentId?: string }`
- **outputSchema**: `{ period, totalGrossAmount, totalNetAmount, employeeCount }`
- **requiredPermission**: `{ resource: "hr", action: "view" }`
- **sourceCollections**: `payroll`

## I. AI Knowledge

### `searchKnowledgeBase`
- **description**: Tìm kiếm ngữ nghĩa (semantic search) trong SOP/Company Docs — **duy nhất Tool thuộc Loại A** (RAG tĩnh, không phải dữ liệu sống — xem `KNOWLEDGE_ARCHITECTURE.md` mục 1); các Tool còn lại trong Registry đều Loại B
- **inputSchema**: `{ query: string, topK?: number }`
- **outputSchema**: `array<{ knowledgeId, title, excerpt, relevanceScore }>`
- **requiredPermission**: `{ resource: "ai-center", action: "view" }`
- **sourceCollections**: `knowledge` (+ Vector Store ngoài Firestore, xem `KNOWLEDGE_ARCHITECTURE.md` mục 2)

### `getAgentMemory`
- **description**: Lấy Long/Business/User Memory liên quan tới 1 agent+user (xem `MEMORY_ARCHITECTURE.md`)
- **inputSchema**: `{ agentId: string, scope: "user" | "organization" }`
- **outputSchema**: `array<{ memoryType, content, lastUsedAt }>`
- **requiredPermission**: `{ resource: "ai-center", action: "view" }`
- **sourceCollections**: `ai_memories`

## Bảng tổng hợp (22 Tool, 9 domain)

| Domain | Số Tool | Resource Permission |
|---|---|---|
| Orders | 3 | `business-os` |
| Customers | 3 | `crm`, `finance` |
| Products | 2 | `business-os` |
| Inventory | 2 | `warehouse` |
| Warehouse | 2 | `warehouse` |
| Production | 2 | `production` |
| Finance | 3 | `finance` |
| HR | 3 | `hr` |
| AI Knowledge | 2 | `ai-center` |

Registry **mở rộng được** — thêm Tool mới chỉ cần thêm 1 entry theo đúng khuôn mẫu `ToolDefinition`, không cần đổi `TOOL_CALLING.md`/`AI_TOOL_ARCHITECTURE.md`/`TOOL_SECURITY.md`.

## Tham chiếu

- Khuôn mẫu Tool Definition: [TOOL_CALLING.md](TOOL_CALLING.md) mục 1
- Vòng đời gọi Tool: [TOOL_CALLING.md](TOOL_CALLING.md) mục 2
- Quyền/bảo mật: [TOOL_SECURITY.md](TOOL_SECURITY.md)
- Collection nguồn: [COLLECTIONS.md](COLLECTIONS.md)
