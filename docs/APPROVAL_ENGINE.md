# APPROVAL_ENGINE.md — Thiết kế Approval Engine

Approval Engine (`packages/workflow/approval/`) quản lý **vòng đời phê duyệt** của bất kỳ chứng từ nào cần con người xác nhận trước khi tiếp tục (đơn hàng vượt hạn mức, phiếu chi, đơn nghỉ phép, đề xuất AI...). Đây là hình thức hoá đầy đủ của Approval Flow đã phác ở `WORKFLOW.md` (Stage 3, 8 gate) và cơ chế "chờ người xác nhận" đã nêu ở `TOOL_CALLING.md` mục 4 (Stage 8, `ai_recommendations.status`).

## 1. State Machine 6 trạng thái

```
Draft ──► Pending ──┬──► Approved ──► Completed
                     └──► Rejected
Pending/Approved ──► Cancelled (huỷ giữa chừng, ở bất kỳ trạng thái nào trước Completed)
```

| Trạng thái | Ý nghĩa | Ai tác động |
|---|---|---|
| `draft` | Đang soạn, chưa gửi duyệt | Người tạo |
| `pending` | Đã gửi, chờ người có quyền duyệt | Hệ thống chuyển tự động khi người tạo "Gửi duyệt" |
| `approved` | Đã được duyệt — **quyết định xong, chưa chắc đã thực thi xong** | Người duyệt (`manager`/`owner`/`admin` theo Permission `manage`) |
| `rejected` | Bị từ chối — dừng hẳn, không tiếp tục | Người duyệt |
| `cancelled` | Bị huỷ bởi chính người tạo hoặc do Workflow cha bị huỷ | Người tạo hoặc hệ thống (Cross Module Workflow huỷ dây chuyền) |
| `completed` | Hành động đã **approved** được thực thi xong hoàn toàn | Hệ thống (sau khi Action tương ứng chạy xong) |

**Khác biệt quan trọng `approved` vs `completed`** (lý do tách 2 trạng thái thay vì gộp như `FIELD_STANDARD.md` Stage 5 mục 6 enum gốc `draft→pending_approval→approved→rejected→cancelled`, vốn không có `completed`): "Duyệt" (quyết định con người) và "Hoàn tất" (kết quả thực thi) là 2 sự kiện khác nhau về thời điểm — VD phiếu chi được **duyệt** hôm nay nhưng chỉ **hoàn tất** khi tiền thực sự chuyển khoản xong 2 ngày sau. Tách biệt giúp báo cáo chính xác "đã duyệt nhưng chưa xử lý xong" (rủi ro tồn đọng) khác với "đã xong hoàn toàn".

## 2. Áp dụng vào field `status` sẵn có — không tạo collection mới

`FIELD_STANDARD.md` (Stage 5) mục 6 đã định nghĩa `status` dùng chung: `draft → pending_approval → approved → rejected → cancelled`. Stage 9 **mở rộng thêm giá trị** `completed` vào cuối enum này — đây là **thay đổi giá trị hợp lệ của field đã có**, không phải thêm field/collection mới, áp dụng cho mọi collection đang dùng pattern `status` này (`orders`, `payments`, `leave_requests`, `stock_adjustments`, `returns`, `production_orders`...).

## 3. Multi-step Approval (nhiều cấp duyệt) — field nhúng, không collection mới

Với chứng từ cần **nhiều cấp duyệt tuần tự** (VD Trưởng phòng duyệt trước, Giám đốc duyệt sau), đề xuất field nhúng tuỳ chọn trên chính document đang cần duyệt (không tạo collection `approval_steps` riêng):

```
{document đang cần duyệt, VD payments/{id}}:
  status: "pending" | ...                          ← trạng thái tổng, theo mục 1
  approvalSteps: array<{
      stepOrder: number                            // thứ tự cấp duyệt
      requiredRoleSlug: string                      // vai trò cần duyệt ở cấp này
      approvedBy: string | null                     // uid người đã duyệt cấp này
      approvedAt: number | null
      decision: "pending" | "approved" | "rejected"
  }>
```

`status` tổng = `approved` chỉ khi **toàn bộ** `approvalSteps[].decision = "approved"` theo đúng thứ tự (`stepOrder` sau chỉ mở khi `stepOrder` trước đã `approved`) — 1 bước `rejected` thì `status` tổng chuyển `rejected` ngay, các bước sau không cần xét tiếp.

**Đây là field nhúng tuỳ chọn** (`array`, có thể để trống nếu chứng từ chỉ cần 1 cấp duyệt đơn giản — dùng thẳng `status` mục 1, không cần `approvalSteps`) — không phá vỡ cấu trúc `TenantScopedDocument` (Stage 5/6) của bất kỳ collection nào, và **không phải collection mới** nên không vi phạm nguyên tắc đóng băng Database.

## 4. Ai được duyệt — tái dùng đúng RBAC hiện có

Không có "quyền duyệt" riêng cho Approval Engine — dùng đúng `Permission { resource, action: "manage" }` đã có (`AUTHENTICATION.md` Stage 4 mục 5: `manage` là điều kiện vượt Approval Gate mức cao nhất). `requiredRoleSlug` ở mục 3 chỉ là **gợi ý hiển thị** (UI biết nên hiển thị "chờ Trưởng phòng duyệt" hay "chờ Giám đốc duyệt") — quyền thật vẫn kiểm tra qua `usePermission().can(resource, "manage")` như mọi nơi khác trong hệ thống.

## 5. Hạn mức phê duyệt (Approval Threshold)

Nối tiếp `WORKFLOW.md` (Stage 3) — ngưỡng tiền cụ thể (VD "trên 200 triệu cần Giám đốc duyệt") lưu ở `settings` (Stage 5, CORE domain) theo `scopeType: "organization"`, field tự do trong `values` (VD `values.paymentApprovalThreshold = 200000000`) — Rule Engine (`AUTOMATION_ENGINE.md` mục 3) đọc giá trị này để quyết định số cấp `approvalSteps` cần tạo khi 1 chứng từ mới chuyển sang `pending` (VD dưới ngưỡng chỉ cần 1 cấp, vượt ngưỡng tự thêm cấp 2).

## 6. Approval Workflow tương tác với Workflow Engine (mục 3.3 `WORKFLOW_ENGINE.md`)

Khi 1 `workflows.steps[]` có `stepType: "approval"`, Workflow Engine:
1. Tạo/tham chiếu tới chứng từ cần duyệt (status chuyển `pending`, sinh `approvalSteps` nếu cần theo mục 5).
2. Gọi Notification Engine (`NOTIFICATION_ENGINE.md`) báo người duyệt.
3. **Tạm dừng** Workflow (không tính là lỗi) — `automation.status` giữ ở trạng thái trung gian (VD `"waiting_approval"`, bổ sung giá trị enum cho `automation.status` đã có ở Stage 5, tương tự cách mở rộng ở mục 2).
4. Khi người duyệt quyết định (Approved/Rejected) → Workflow Engine "đánh thức" lại Workflow, tiếp tục `steps[]` tiếp theo (nếu Approved) hoặc dừng hẳn (nếu Rejected).

## 7. Tham chiếu

- Approval Flow gốc (8 gate cụ thể): [WORKFLOW.md](WORKFLOW.md) (Stage 3) mục A
- Field `status` chuẩn: [FIELD_STANDARD.md](FIELD_STANDARD.md) mục 6
- Permission/Role: [AUTHENTICATION.md](AUTHENTICATION.md) mục 2/5
- Workflow Engine điều phối: [WORKFLOW_ENGINE.md](WORKFLOW_ENGINE.md) mục 3.3/5
- `ai_recommendations.status` (mẫu tương tự ở tầng AI): [COLLECTIONS.md](COLLECTIONS.md) mục I.72c
