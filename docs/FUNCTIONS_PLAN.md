# FUNCTIONS_PLAN.md — Thiết kế Cloud Functions

**Chỉ thiết kế danh sách function + trigger + mục đích.** Không viết code thật, không cài đặt `functions/` package.json, không viết Business Logic bên trong — mỗi function dưới đây là 1 **khái niệm chức năng** (tên, loại trigger, input/output ở mức ý tưởng).

## 1. Nhóm Automation

| Function (đề xuất) | Trigger | Nhiệm vụ |
|---|---|---|
| `onMembershipWrite` | Firestore trigger: `organizations/{orgId}/members/{uid}` onWrite | Đồng bộ lại custom claims (`roles` map) của user khi Membership được tạo/sửa/xoá — nối tiếp `AUTHENTICATION.md` mục 3 |
| `onOrganizationCreate` | Firestore trigger: `organizations/{orgId}` onCreate | Khởi tạo bộ Role mặc định (`super_admin`, `owner`, `admin`, `manager`, `leader`, `staff`, `partner`, `customer`, `supplier`, `guest` — xem `AUTHENTICATION.md` mục 2) với doc id cố định — nối tiếp giải pháp (b) ở `SECURITY_RULES.md` mục 5 |
| `onSalesOrderConfirmed` | Firestore trigger: `crm_sales_orders/{id}` onUpdate (status → confirmed) | Tự động tạo `production_plans` nháp — nối tiếp bước 2 "CRM & Sales → Production" ở `BUSINESS_FLOW.md` Stage 3 |
| `onQCResultFail` | Firestore trigger: `production_qc_results/{id}` onCreate (result = không đạt) | Tự động tạo `production_waste_records` + đánh dấu `production_work_orders.status = rework` |
| `onStockMovementWrite` | Firestore trigger: `warehouse_stock_movements/{id}` onCreate | Cộng/trừ `warehouse_inventory_items.quantity` tương ứng (giữ tồn kho luôn khớp nhật ký) |
| `recalculateAgingBuckets` | Scheduled (chạy mỗi ngày) | Tính lại `finance_accounts_receivable`/`payable` agingBucket theo `finance_invoices`/`finance_payments` còn mở |

## 2. Nhóm Notification

> Nối tiếp trực tiếp **Notification Flow** đã thiết kế ở `WORKFLOW.md` (Stage 3) — chỉ liệt kê function kích hoạt, không thiết kế lại nội dung thông báo.

| Function (đề xuất) | Trigger | Nhiệm vụ |
|---|---|---|
| `notifyApprovalRequested` | Firestore trigger onCreate/onUpdate tại các collection có Approval Gate (VD `finance_payments` khi vượt hạn mức) | Gửi FCM tới đúng Role có quyền `manage` cho resource đó (tra `hasPermission`) |
| `notifyLowStock` | Firestore trigger: `warehouse_inventory_items/{id}` onUpdate (quantity < ngưỡng) | Gửi FCM tới `manager`/`leader` phòng ban Warehouse |
| `notifyQCFailure` | Firestore trigger: `production_qc_results/{id}` onCreate (result = không đạt) | Gửi FCM tới `manager`/`leader` phòng ban Factory |
| `notifyInvoiceOverdue` | Scheduled (chạy mỗi ngày) | Quét `finance_invoices` quá hạn → FCM tới `manager`/`leader` phòng ban Finance |
| `dispatchNotification` | Callable/Pub-Sub trung gian | Hàm dùng chung nhận `{uid[], title, body, deepLink}` rồi gọi Cloud Messaging — mọi function ở trên gọi qua hàm này để tránh trùng lặp logging/định dạng |

## 3. Nhóm AI Gateway

> Nối tiếp **AI Flow** đã thiết kế ở `AI_FLOW.md` (Stage 3) — Cloud Functions đóng vai trò **cổng trung gian** giữa Firestore và dịch vụ AI bên ngoài (ngoài phạm vi Firebase), không tự triển khai mô hình AI trong Cloud Functions.

| Function (đề xuất) | Trigger | Nhiệm vụ |
|---|---|---|
| `aiGatewayProxy` | Callable (gọi từ 16 app qua `packages/core`) | Nhận request từ client, đính kèm `orgId`/`uid` đã xác thực, forward tới dịch vụ AI ngoài (AI Center - `ai-center` module), trả kết quả — client không bao giờ gọi thẳng API key AI ra ngoài |
| `onForecastResultReceived` | Pub/Sub hoặc HTTPS callback từ dịch vụ AI ngoài | Ghi kết quả vào `ai_forecasts`, tạo `ai_insights` tương ứng nếu vượt ngưỡng cảnh báo |
| `onAgentConversationTurn` | Callable | Ghi từng lượt hội thoại vào `ai_agent_conversations/{id}/messages` (subcollection) — nối tiếp UI Agent Chat đã có ở 199 trang prototype (`42`-`69`) |

## 4. Nhóm Webhook

| Function (đề xuất) | Trigger | Nhiệm vụ |
|---|---|---|
| `webhookShippingCarrier` | HTTPS endpoint (webhook nhận từ đơn vị vận chuyển ngoài) | Cập nhật `logistics_shipments.status` khi carrier báo trạng thái mới |
| `webhookPaymentGateway` | HTTPS endpoint | Cập nhật `finance_receipts`/`finance_invoices.status` khi cổng thanh toán ngoài xác nhận đã thu tiền |
| `webhookOutbound` | Firestore trigger (tổng quát, cấu hình theo Organization) | Đẩy sự kiện nội bộ (VD `sales_order_confirmed`) ra hệ thống ngoài mà đối tác đăng ký nhận (ERP ngoài, dịch vụ kế toán thuê ngoài) |

## 5. Nhóm Email

| Function (đề xuất) | Trigger | Nhiệm vụ |
|---|---|---|
| `sendInvoiceEmail` | Firestore trigger: `finance_invoices/{id}` onCreate | Gửi email hoá đơn kèm file từ Storage `invoices/{invoiceId}` — khuyến nghị dùng Extension `Trigger Email` (xem `FIREBASE_ARCHITECTURE.md` mục 3) thay vì tự viết SMTP logic |
| `sendWelcomeEmail` | Auth trigger: `onCreate` user mới | Gửi email chào mừng + hướng dẫn tham gia Organization |
| `sendContractSignedEmail` | Storage trigger: `contracts/{contractId}/signed.pdf` onFinalize | Gửi email xác nhận hợp đồng đã ký tới các bên liên quan |

## 6. Bảng tổng hợp Trigger Type

| Loại Trigger | Số function dùng | Ví dụ |
|---|---|---|
| Firestore onCreate/onUpdate/onWrite | 10 | `onStockMovementWrite`, `notifyQCFailure` |
| Scheduled (Cloud Scheduler) | 2 | `recalculateAgingBuckets`, `notifyInvoiceOverdue` |
| Callable (gọi trực tiếp từ client đã xác thực) | 3 | `aiGatewayProxy`, `onAgentConversationTurn`, `dispatchNotification` |
| HTTPS endpoint (webhook từ bên ngoài) | 2 | `webhookShippingCarrier`, `webhookPaymentGateway` |
| Auth trigger | 1 | `sendWelcomeEmail` |
| Storage trigger | 1 | `sendContractSignedEmail` |

## 7. Nguyên tắc chung khi triển khai thật (ghi chú, ngoài phạm vi Stage 4)

- Mọi Callable Function phải kiểm tra `context.auth` + `activeOrgId` trước khi xử lý (không tin tưởng riêng Security Rules, vì Cloud Functions Admin SDK bỏ qua Rules).
- Webhook endpoint (mục 4) phải xác thực chữ ký/secret riêng của bên thứ 3 (không dùng Firebase Auth vì bên ngoài không có tài khoản Firebase).
- Extension thay thế function tự viết khi có thể (xem `FIREBASE_ARCHITECTURE.md` mục 3) để giảm số lượng function tự bảo trì.

## 8. Tham chiếu

- Notification Flow gốc: [WORKFLOW.md](WORKFLOW.md) (Stage 3)
- AI Flow gốc: [AI_FLOW.md](AI_FLOW.md) (Stage 3)
- Business Flow gốc (trigger nghiệp vụ): [BUSINESS_FLOW.md](BUSINESS_FLOW.md) (Stage 3)
- Collection bị ghi/đọc bởi từng function: [FIRESTORE_STRUCTURE.md](FIRESTORE_STRUCTURE.md)
- Custom claims được đồng bộ bởi `onMembershipWrite`: [AUTHENTICATION.md](AUTHENTICATION.md)
