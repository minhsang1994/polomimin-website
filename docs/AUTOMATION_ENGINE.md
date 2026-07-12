# AUTOMATION_ENGINE.md — Thiết kế Automation, Trigger, Action, Rule Engine

Automation Engine (`packages/workflow/automation/` + `packages/workflow/rules/`) là nơi hiện thực hoá **Trigger** (cái gì khởi động Workflow), **Action** (Workflow làm gì), và **Rule Engine** (điều kiện quyết định có chạy tiếp hay không) — 3 trong 10 module yêu cầu ở Stage 9, gộp lại vì luôn hoạt động cùng nhau theo chuỗi `Trigger → Condition (Rule Engine) → Action`.

## 1. Trigger — 6 loại

`workflows.trigger.type` (Stage 5, đã có field, Stage 9 làm rõ 6 giá trị hợp lệ):

| `trigger.type` | Kích hoạt khi nào | `trigger.config` chứa gì |
|---|---|---|
| `time` | Theo lịch — xem `SCHEDULER_ENGINE.md` | `{ scheduleType, scheduleValue }` |
| `event` | 1 sự kiện nghiệp vụ phát sinh (VD "đơn hàng được xác nhận") — sự kiện logic, không nhất thiết là ghi Firestore trực tiếp (có thể là sự kiện tổng hợp từ nhiều thay đổi) | `{ eventName }` |
| `firestore` | 1 document trong collection cụ thể được tạo/sửa/xoá (onCreate/onUpdate/onDelete) — tương ứng trực tiếp Cloud Function Trigger thật (`FUNCTIONS_PLAN.md` Stage 4 mục 1: `onStockMovementWrite`, `onQCResultFail`...) | `{ collectionName, changeType }` |
| `ai` | AI Gateway/Tool Calling sinh ra 1 `ai_insights`/`ai_recommendations` mới (Stage 7/8) | `{ agentId?, insightSeverity? }` |
| `webhook` | 1 request Incoming Webhook tới (`WEBHOOK_ENGINE.md` mục 1) | `{ webhookEndpointId }` |
| `manual` | Người dùng tự bấm khởi chạy trên UI | (không cần config — chạy theo yêu cầu trực tiếp) |

**Quan hệ với Cloud Function thật**: `trigger.type = "firestore"` và `"time"` **không phát minh cơ chế trigger mới** — chúng là lớp mô tả (dữ liệu) cho đúng cơ chế Cloud Function Trigger/Cloud Scheduler đã có ở `FIREBASE_ARCHITECTURE.md`/`FUNCTIONS_PLAN.md` (Stage 4). Workflow Engine không thay thế Cloud Functions — nó là **tầng định nghĩa** phía trên, cho phép người vận hành (không phải lập trình viên) tự cấu hình Workflow mới mà không cần deploy code mới cho mỗi quy tắc.

## 2. Action — Action Registry (cùng khuôn mẫu Tool Registry, Stage 8)

Action là 1 bước **có thể ghi dữ liệu** (khác Tool ở Stage 8 — Tool luôn READ-ONLY, `TOOL_SECURITY.md` mục 4). Action Registry là danh mục hành động khả dụng, theo khuôn mẫu tương tự `ToolDefinition` (`TOOL_CALLING.md` Stage 8 mục 1) để nhất quán kiến trúc:

```
ActionDefinition {
  name: string                          // VD "createProductionOrder", "sendReminderEmail"
  description: string
  inputSchema: { [param]: type }
  requiredPermission: { resource, action }   // action ở đây thường là "create"/"update", KHÔNG phải "view"
  targetCollections: string[]           // collection Action này ghi vào
  requiresApproval: boolean             // true = Action này KHÔNG tự chạy, phải qua Approval Engine trước
}
```

### Danh mục Action chuẩn (đại diện, mở rộng được — không giới hạn danh sách này)

| Action | Domain | `requiresApproval` |
|---|---|---|
| `createProductionOrder` | FACTORY | `true` (tạo lệnh sản xuất mới cần duyệt) |
| `createPurchaseRequest` | WAREHOUSE/FINANCE | `true` |
| `updateOrderStatus` | SALES | `false` nếu chuyển trạng thái nội bộ thường (VD "confirmed"→"processing"); `true` nếu chuyển sang trạng thái có ảnh hưởng tài chính |
| `sendNotification` | mọi domain | `false` (bản thân việc thông báo không cần duyệt) |
| `createLedgerEntry` | FINANCE | `true` (bút toán kế toán luôn nhạy cảm — nhất quán `AI_SECURITY.md` mục 3 Stage 7 nhắc kế toán cần xác nhận logic thật) |
| `enrollStudentToCourse` | ACADEMY | `false` |
| `callAIGateway` | AI | `false` (bản thân việc hỏi AI không cần duyệt — chỉ *kết quả đề xuất* của AI mới cần duyệt qua `ai_recommendations`) |

**Nguyên tắc bắt buộc**: `requiresApproval: true` → Action **không thực thi trực tiếp** khi Workflow Engine chạm tới bước đó — thay vào đó, Workflow Engine chèn 1 bước `stepType: "approval"` tự động trước khi cho phép Action chạy thật (`APPROVAL_ENGINE.md` mục 6). Đây là ranh giới an toàn tương đương nguyên tắc READ-ONLY của Tool Calling (Stage 8) nhưng áp dụng cho hành động ghi dữ liệu.

## 3. Rule Engine (Condition)

Rule Engine đánh giá 1 hoặc nhiều **điều kiện** (Condition) để quyết định Workflow có tiếp tục sang Action kế tiếp hay không — dùng chung bởi Automation, Approval (mục 5 `APPROVAL_ENGINE.md`), và AI Recommendation Pipeline (Stage 8, `TOOL_CALLING.md` mục 4 — luật quyết định ở đó chính là 1 dạng Rule).

### Cấu trúc 1 Rule

```
Rule {
  field: string          // đường dẫn tới field cần kiểm tra, VD "order.totalAmount"
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains"
  value: any              // giá trị so sánh, VD 200000000 (đọc từ settings — APPROVAL_ENGINE.md mục 5)
}

RuleGroup {
  logic: "AND" | "OR"
  rules: array<Rule | RuleGroup>   // đệ quy — cho phép nhóm điều kiện lồng nhau
}
```

Ví dụ minh hoạ (không phải code thật): "Nếu `order.totalAmount > 200000000` VÀ `customer.customerGroupId != 'vip'`" → 1 `RuleGroup { logic: "AND", rules: [{field: "order.totalAmount", operator: "gt", value: 200000000}, {field: "customer.customerGroupId", operator: "neq", value: "vip"}] }`.

### Vị trí Rule Engine trong chuỗi Workflow

`workflows.steps[]` với `stepType: "condition"` chứa 1 `RuleGroup` — Rule Engine đánh giá dựa trên dữ liệu đã có trong "biến ngữ cảnh" của lượt chạy Workflow đó (kết quả các Action/Trigger trước đó gộp lại, tương tự cách Prompt Engine dùng `variables`, Stage 7 `PROMPT_ENGINE.md` mục 3 — cùng triết lý "biến + điền giá trị", khác chỗ dùng để rẽ nhánh thay vì lắp chuỗi văn bản).

## 4. Sơ đồ Trigger → Rule Engine → Action

```
Trigger kích hoạt (mục 1)
   ↓
Nạp `workflows.steps[]`
   ↓
Với mỗi step:
   stepType "condition" → Rule Engine đánh giá RuleGroup
        → false → DỪNG chuỗi (Workflow kết thúc, automation.status = "success",
                   không phải lỗi — điều kiện không khớp là kết quả hợp lệ)
        → true  → tiếp tục step kế tiếp
   stepType "action"    → tra Action Registry (mục 2)
        → requiresApproval = true  → chèn Approval Workflow (APPROVAL_ENGINE.md)
        → requiresApproval = false → thực thi ngay qua packages/database generic
                                       helper (Stage 6), ghi kết quả vào "biến ngữ
                                       cảnh" cho step kế tiếp dùng
```

## 5. Tham chiếu

- Workflow Definition tổng thể: [WORKFLOW_ENGINE.md](WORKFLOW_ENGINE.md) mục 2
- Approval khi Action cần duyệt: [APPROVAL_ENGINE.md](APPROVAL_ENGINE.md)
- Tool Registry (khuôn mẫu Action Registry mô phỏng theo): [TOOL_REGISTRY.md](TOOL_REGISTRY.md), [TOOL_CALLING.md](TOOL_CALLING.md) mục 1 (Stage 8)
- Cloud Function Trigger thật tương ứng: [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md) mục 1 (Stage 4)
- Collection `workflows`/`automation`: [COLLECTIONS.md](COLLECTIONS.md) mục I.68/69
