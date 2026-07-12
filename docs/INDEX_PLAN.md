# INDEX_PLAN.md — Kế hoạch Index cho Firestore

## 1. Nguyên tắc chỉ mục Firestore

- Firestore tự tạo **single-field index** cho mọi field (trừ khi khai báo ngoại lệ) — đủ cho các câu query `where("field", "==", x)` đơn lẻ hoặc `orderBy("field")` đơn lẻ.
- **Composite index** (khai báo thủ công trong `firestore.indexes.json` — chưa tạo ở Stage 5, chỉ liệt kê kế hoạch) chỉ cần khi:
  1. `where` nhiều field cùng lúc (VD `where("organizationId","==",x).where("status","==",y)`), hoặc
  2. `where` 1 field + `orderBy` 1 field khác (VD `where("recipientUid","==",uid).orderBy("createdAt","desc")`).
- Mọi collection theo tenant **luôn có `organizationId` là field đầu tiên** trong mọi composite index (cách ly dữ liệu + hiệu năng lọc theo tenant trước tiên) — ngoại lệ: field định danh 1-1 (VD `employeeId`, `orderId`) khi query luôn giới hạn trong phạm vi 1 entity cha, không cần lặp lại `organizationId`.
- Giới hạn cần lưu ý: Firestore giới hạn **200 composite index/project** — vì Stage 5 có 79 collection, index plan dưới đây **chỉ khai báo composite index cho query đã biết trước** (từ `COLLECTIONS.md`), không tạo composite "phòng hờ" cho mọi tổ hợp field có thể có.

## 2. Bảng tổng hợp Composite Index cần tạo (theo domain)

### CORE
| Collection | Composite Index |
|---|---|
| `notifications` | (`recipientUid` asc, `createdAt` desc); (`recipientUid` asc, `isRead` asc) |
| `activity_logs` | (`organizationId` asc, `createdAt` desc); (`targetCollection` asc, `targetId` asc) |
| `files` | (`organizationId` asc, `category` asc) |
| `ai_agents` | (`moduleSlug` asc); (`organizationId` asc) |
| `ai_history` | (`agentId` asc, `uid` asc, `createdAt` asc); (`organizationId` asc, `createdAt` desc) |
| `roles`, `workspaces`, `settings` | (`organizationId` asc) — single-field, Firestore tự tạo, không cần khai composite |

### CRM
| Collection | Composite Index |
|---|---|
| `customers` | (`organizationId` asc, `customerGroupId` asc); (`organizationId` asc, `assignedTo` asc) |
| `leads` | (`organizationId` asc, `status` asc); (`assignedTo` asc, `status` asc) |
| `opportunities` | (`organizationId` asc, `stage` asc) |
| `contracts` | (`organizationId` asc, `customerId` asc); (`status` asc, `expiryDate` asc) — phục vụ cảnh báo hợp đồng sắp hết hạn |
| `price_lists` | (`organizationId` asc, `customerGroupId` asc) |

### SALES
| Collection | Composite Index |
|---|---|
| `products` | (`organizationId` asc, `categoryId` asc) |
| `orders` | (`organizationId` asc, `customerId` asc); (`organizationId` asc, `status` asc, `createdAt` desc) |
| `quotations` | (`organizationId` asc, `customerId` asc) |
| `payments` | (`organizationId` asc, `status` asc, `createdAt` desc) |
| `receipts` | (`organizationId` asc, `orderId` asc) |
| `returns` | (`organizationId` asc, `orderId` asc, `status` asc) |

### WAREHOUSE
| Collection | Composite Index |
|---|---|
| `inventory` | (`organizationId` asc, `warehouseId` asc, `sku` asc) |
| `inventory_transactions` | (`organizationId` asc, `warehouseId` asc, `createdAt` desc); (`sku` asc, `createdAt` desc) |
| `stock_adjustments` | (`organizationId` asc, `status` asc) |
| `stock_counts` | (`organizationId` asc, `warehouseId` asc, `status` asc) |
| `transfer_orders` | (`organizationId` asc, `fromWarehouseId` asc); (`toWarehouseId` asc, `status` asc) |

### FACTORY
| Collection | Composite Index |
|---|---|
| `production_orders` | (`organizationId` asc, `status` asc) |
| `production_steps` | (`productionOrderId` asc, `sequence` asc) |
| `bom` | (`organizationId` asc, `productId` asc) |
| `machines` | (`organizationId` asc, `workCenterId` asc) |
| `quality_checks` | (`organizationId` asc, `result` asc, `createdAt` desc) |
| `mrp_results` *(mới)* | (`organizationId` asc, `productionOrderId` asc) |
| `production_reports` *(mới)* | (`organizationId` asc, `period` asc); (`workCenterId` asc, `period` asc) |

### HR
| Collection | Composite Index |
|---|---|
| `employees` | (`organizationId` asc, `departmentId` asc) |
| `attendance` | (`employeeId` asc, `date` asc) |
| `leave_requests` | (`organizationId` asc, `status` asc) |
| `payroll` | (`organizationId` asc, `period` asc); (`employeeId` asc, `period` asc) |
| `kpi` | (`employeeId` asc, `period` asc) |
| `training` | (`employeeId` asc, `completionStatus` asc) |

### FINANCE
| Collection | Composite Index |
|---|---|
| `expenses` | (`organizationId` asc, `category` asc, `createdAt` desc) |
| `revenues` | (`organizationId` asc, `source` asc, `createdAt` desc) |
| `accounts` | (`organizationId` asc, `code` asc) — unique lookup |
| `debts` | (`organizationId` asc, `type` asc, `status` asc) |
| `taxes` | (`organizationId` asc, `period` asc, `status` asc) |
| `invoices` *(mới)* | (`organizationId` asc, `customerId` asc); (`organizationId` asc, `status` asc, `dueDate` asc) |
| `ledger_entries` *(mới)* | (`organizationId` asc, `debitAccountId` asc, `postedAt` desc); (`organizationId` asc, `creditAccountId` asc, `postedAt` desc); (`sourceCollection` asc, `sourceId` asc) |
| `fixed_assets` *(mới)* | (`organizationId` asc, `status` asc) |

### ACADEMY
| Collection | Composite Index |
|---|---|
| `courses` | (`organizationId` asc, `isPublished` asc) |
| `chapters`, `lessons` | (`courseId`/`chapterId` asc, `sortOrder` asc) |
| `students` | (`courseId` asc, `uid` asc) |
| `certificates` | (`uid` asc, `courseId` asc) |

### AI
| Collection | Composite Index |
|---|---|
| `usage_logs` | (`organizationId` asc, `createdAt` desc) |
| `automation` | (`workflowId` asc, `createdAt` desc) |
| `workflows` | (`organizationId` asc, `isActive` asc) |
| `ai_insights` *(mới)* | (`organizationId` asc, `sourceModule` asc, `createdAt` desc); (`organizationId` asc, `severity` asc) |
| `ai_forecasts` *(mới)* | (`organizationId` asc, `sourceModule` asc, `period` asc) |
| `ai_recommendations` *(mới)* | (`organizationId` asc, `status` asc); (`insightId` asc) |
| `ai_memories` *(mới)* | (`agentId` asc, `uid` asc, `lastUsedAt` desc) |

### SYSTEM
Không cần composite index — danh mục nhỏ, đọc toàn bộ hoặc lookup theo Document ID trực tiếp (`pages.slug`, `countries`/`currencies`/`languages` theo mã ISO).

### LOGISTICS *(Domain mới)*
| Collection | Composite Index |
|---|---|
| `shipments` | (`organizationId` asc, `orderId` asc); (`organizationId` asc, `status` asc, `estimatedDeliveryDate` asc) |
| `delivery_orders` | (`organizationId` asc, `status` asc) |
| `tracking` | (`shipmentId` asc, `occurredAt` desc) |
| `carriers` | (`organizationId` asc, `type` asc) |

## 3. TTL (Time-to-live) — dọn dữ liệu log tự động

Firestore hỗ trợ TTL policy (xoá tự động document quá hạn theo 1 field timestamp) — áp dụng cho các collection **append-only** phát triển nhanh về số lượng, không cần giữ vĩnh viễn:

| Collection | Field TTL đề xuất | Thời gian giữ đề xuất |
|---|---|---|
| `activity_logs` | `createdAt` | 24 tháng (yêu cầu audit thông thường) |
| `inventory_transactions` | `createdAt` | Không TTL — cần giữ vĩnh viễn để đối chiếu tồn kho lịch sử/kiểm toán |
| `usage_logs` | `createdAt` | 12 tháng (dữ liệu vận hành AI, không phải chứng từ kế toán) |
| `notifications` | `createdAt` | 3 tháng (thông báo cũ không còn giá trị tác nghiệp) |
| `ai_history` | `createdAt` | 6 tháng (trừ khi Organization yêu cầu giữ lâu hơn vì lý do tuân thủ) |
| `tracking` | `occurredAt` | 12 tháng (đối chiếu khiếu nại giao hàng) |
| `ledger_entries` | — | **Không TTL** — chứng từ kế toán, phải giữ theo quy định lưu trữ sổ sách (thường ≥ 10 năm), ngoài phạm vi tự động hoá TTL của Firestore |

**Lưu ý**: TTL chỉ nên bật sau khi có Firebase project thật và đã thống nhất chính sách lưu trữ với đội vận hành — Stage 5 chỉ đề xuất, chưa cấu hình.

## 4. Vì sao không cần Collection Group Index cho các collection mới

Toàn bộ 79 collection Stage 5 thiết kế **phẳng (top-level)**, không nested (khác `branches`/`departments`/`members` hiện có, có `membersGroup()` dùng Collection Group Query) — nên **không phát sinh nhu cầu Collection Group Index mới**. Đây là một lợi ích phụ của quyết định "flat + `organizationId`" đã nêu ở `DATABASE_ARCHITECTURE.md` mục 2: truy vấn xuyên Organization (nếu `super_admin` nền tảng cần) chỉ là 1 query thường trên collection gốc, không cần Collection Group.

## 5. Tham chiếu

- Field và lý do cần lọc theo field đó: [COLLECTIONS.md](COLLECTIONS.md)
- Chiến lược phẳng vs nested: [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) mục 2
