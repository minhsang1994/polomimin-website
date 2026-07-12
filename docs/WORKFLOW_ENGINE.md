# WORKFLOW_ENGINE.md — Kiến trúc Tổng thể Workflow Engine (Stage 9)

Stage 9 thiết kế **Workflow Engine chuẩn Enterprise** cho MIMIN Platform — hạ tầng chạy chung cho mọi quy trình có nhiều bước, xuyên nhiều module, dù là quy trình do người vận hành thủ công, tự động hoá, cần phê duyệt, hay do AI khởi xướng. Đây là điểm vào chính (master overview); chi tiết từng mảng nằm ở 5 tài liệu chuyên biệt cùng thư mục `docs/`.

**Ràng buộc không đổi**: chỉ thiết kế kiến trúc — không viết code, không gọi Firebase/API thật, không tạo Automation thật, không viết Business Logic.

**Nguyên tắc không phá vỡ Database đã đóng băng (Stage 5)**: toàn bộ thiết kế Stage 9 xây trên **collection đã có sẵn** (`workflows`, `automation`, `notifications`, `activity_logs`) — không đề xuất collection top-level mới nào; nơi cần mở rộng chỉ là **thêm giá trị enum** hoặc **field nhúng tuỳ chọn** (chi tiết từng chỗ ở các mục dưới, tổng hợp lại ở `WORKFLOW_REVIEW.md` mục 2).

## 1. Cấu trúc package đề xuất: `packages/workflow`

**Chỉ là thiết kế thư mục** (chưa tạo file/code thật), theo đúng 10 module yêu cầu, gộp lại thành 7 thư mục:

```
packages/workflow/
├── workflow-engine/   # Bộ điều phối trung tâm — nạp Workflow definition, chạy chuỗi
│                       # Trigger → Condition → Action, ghi log vào `automation`
├── automation/         # TRIGGER + ACTION — 6 loại Trigger (mục 4 AUTOMATION_ENGINE.md),
│                       # Action Registry (danh mục hành động khả dụng, cùng khuôn mẫu
│                       # Tool Registry đã thiết kế ở Stage 8 để nhất quán kiến trúc)
├── approval/           # State machine Draft→Pending→Approved/Rejected→Cancelled→Completed
├── notification/       # 8 kênh thông báo (In-App/Email/SMS/Push/Slack/Telegram/Discord/Zalo)
├── scheduler/           # SCHEDULE — One Time/Daily/Weekly/Monthly/Yearly/Cron
├── webhook/             # Incoming/Outgoing Webhook, Retry, Queue, Log, Security
└── rules/               # CONDITION + RULE ENGINE — đánh giá điều kiện dùng chung cho
                          # Automation, Approval, và AI Recommendation Pipeline (Stage 8)
```

Ánh xạ 10 module yêu cầu ban đầu vào 7 thư mục:

| Module yêu cầu | Thư mục | Ghi chú |
|---|---|---|
| Workflow | `workflow-engine/` | Bộ điều phối trung tâm |
| Approval | `approval/` | Xem `APPROVAL_ENGINE.md` |
| Automation | `automation/` | Xem `AUTOMATION_ENGINE.md` |
| Notification | `notification/` | Xem `NOTIFICATION_ENGINE.md` |
| Schedule | `scheduler/` | Xem `SCHEDULER_ENGINE.md` |
| Webhook | `webhook/` | Xem `WEBHOOK_ENGINE.md` |
| Trigger | `automation/` (phần Trigger) | 1 trong 2 nửa của `automation/` |
| Action | `automation/` (phần Action, Action Registry) | Nửa còn lại của `automation/` |
| Condition | `rules/` | Cùng nhà với Rule Engine |
| Rule Engine | `rules/` | Engine đánh giá Condition |

## 2. Workflow Definition — mở rộng `workflows` (Stage 5), không đổi cấu trúc

`workflows` (Stage 5, domain AI): `{ name, trigger: {type, config}, steps: [{action, config}], isActive }` — Stage 9 **giữ nguyên field**, chỉ làm rõ **giá trị hợp lệ** bên trong:

```
workflows/{workflowId}
  name: string
  workflowType: "manual" | "auto" | "approval" | "ai" | "cross_module"   ← LÀM RÕ (mục 3)
  trigger: { type: TriggerType, config: {...} }                          ← xem AUTOMATION_ENGINE.md mục 1
  steps: array<{
      stepType: "condition" | "action" | "approval" | "notification"    ← LÀM RÕ
      config: {...}                                                     ← tuỳ stepType
  }>
  isActive: boolean
```

`steps[].stepType` cho phép 1 Workflow **trộn lẫn** Condition/Action/Approval/Notification trong cùng 1 chuỗi tuần tự — đây chính là cơ chế hiện thực hoá "Cross Module Workflow" (mục 3.5) và ví dụ Order→Warehouse→Production→Đề xuất đã thiết kế ở Stage 8 (`AI_DATA_READING.md`) dưới dạng 1 Workflow chính thức thay vì logic viết tay.

## 3. 5 loại Workflow

### 3.1. Manual Workflow
Người dùng tự khởi chạy từng bước qua UI (VD nhấn nút "Duyệt", "Chuyển bước tiếp theo") — `trigger.type = "manual"`, không có Schedule/Event nào tự động kích hoạt.

### 3.2. Auto Workflow
Toàn bộ chuỗi `steps` chạy tự động khi `trigger` kích hoạt (Time/Event/Firestore/Webhook — xem `AUTOMATION_ENGINE.md` mục 1), không cần con người can thiệp giữa chừng — trừ khi 1 `step` có `stepType: "approval"` (khi đó Auto Workflow tạm dừng chờ người duyệt, xem mục 3.3).

### 3.3. Approval Workflow
1 hoặc nhiều `steps` có `stepType: "approval"` — Workflow **tạm dừng** tại bước đó cho tới khi có quyết định (Approved/Rejected — `APPROVAL_ENGINE.md`), sau đó mới tiếp tục (nếu Approved) hoặc dừng hẳn (nếu Rejected/Cancelled).

### 3.4. AI Workflow
`trigger.type = "ai"` hoặc có `step` gọi Action loại `"call_ai_gateway"` — Workflow gọi AI Gateway/Tool Calling (Stage 7/8) như 1 bước trong chuỗi, kết quả (`ai_insights`/`ai_recommendations`) có thể là **input cho Condition ở bước kế tiếp** (VD "Nếu AI đề xuất `create_purchase_request` → tự tạo Draft Purchase Request chờ duyệt").

### 3.5. Cross Module Workflow
1 Workflow có `steps` gọi Action ở **nhiều domain khác nhau** trong cùng 1 chuỗi — đây không phải 1 loại `workflowType` tách biệt về mặt kỹ thuật, mà là **đặc điểm** của Workflow khi chuỗi Action của nó chạm > 1 domain (VD Đơn hàng (SALES) → kiểm tra Kho (WAREHOUSE) → tạo lệnh Sản xuất (FACTORY) → thông báo Kế toán (FINANCE)). Xem mục 4 — bảng domain kết nối được.

## 4. Workflow kết nối được 8 domain nghiệp vụ

| Domain yêu cầu | Collection Stage 5 mà Action/Condition có thể đọc/ghi |
|---|---|
| Customers | `customers`, `leads`, `opportunities` (domain CRM) |
| Orders | `orders`, `order_items`, `quotations` (domain SALES) |
| Warehouse | `inventory`, `warehouses`, `transfer_orders` (domain WAREHOUSE) |
| Production | `production_orders`, `mrp_results`, `quality_checks` (domain FACTORY) |
| Finance | `invoices`, `debts`, `payments`, `ledger_entries` (domain FINANCE) |
| HR | `employees`, `leave_requests`, `payroll` (domain HR) |
| Academy | `courses`, `students`, `certificates` (domain ACADEMY) |
| AI Agents | `ai_agents`, `ai_insights`, `ai_recommendations` (domain AI) |

Cơ chế đọc: Action trong `automation/` gọi `packages/database` generic helper (Stage 6) — **giống hệt cách Tool Registry (Stage 8) đọc dữ liệu** — Workflow Engine không tự phát minh cách truy cập Firestore riêng.

## 5. Sơ đồ thực thi 1 Workflow điển hình

```
1. Trigger kích hoạt (Time/Event/Firestore/AI/Webhook/Manual — AUTOMATION_ENGINE.md mục 1)
2. Workflow Engine nạp `workflows/{workflowId}` (definition), tạo 1 document `automation`
   mới (Stage 5) đại diện lượt chạy này — status: "running"
3. Chạy tuần tự từng phần tử `steps[]`:
   - stepType "condition"  → Rule Engine (`rules/`) đánh giá true/false — false thì dừng
     chuỗi (hoặc rẽ nhánh, nếu Workflow có định nghĩa nhánh else — RULE_ENGINE con)
   - stepType "action"     → gọi Action Registry (`automation/`), đọc/ghi domain tương ứng
   - stepType "approval"   → tạm dừng, chuyển trạng thái Workflow "waiting_approval"
     (APPROVAL_ENGINE.md), CHỜ người duyệt — không tính là lỗi, không retry
   - stepType "notification" → gọi Notification Engine (`notification/`)
4. Hết `steps[]` không lỗi → `automation.status = "success"`
   Có lỗi/bị Reject      → `automation.status = "failed"` (kèm lý do)
5. Ghi `finishedAt`, tổng hợp thời gian chạy — phục vụ Report Flow (Stage 3) nếu cần
```

## 6. Tham chiếu

- Approval chi tiết: [APPROVAL_ENGINE.md](APPROVAL_ENGINE.md)
- Automation/Trigger/Action/Rule Engine chi tiết: [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md)
- Notification chi tiết: [NOTIFICATION_ENGINE.md](NOTIFICATION_ENGINE.md)
- Scheduler chi tiết: [SCHEDULER_ENGINE.md](SCHEDULER_ENGINE.md)
- Webhook chi tiết: [WEBHOOK_ENGINE.md](WEBHOOK_ENGINE.md)
- Collection nền (`workflows`/`automation`/`notifications`): [COLLECTIONS.md](COLLECTIONS.md) domain A/I
- Approval Flow gốc (8 gate) + Notification Flow gốc (3 kênh): [WORKFLOW.md](WORKFLOW.md) (Stage 3)
- Cloud Function triển khai thật (Automation/Notification/Webhook): [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md) (Stage 4)
- Tool Registry (khuôn mẫu tái dùng cho Action Registry): [TOOL_REGISTRY.md](TOOL_REGISTRY.md) (Stage 8)
