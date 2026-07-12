# WORKFLOW_REVIEW.md — Stage 9 Review

Tự đánh giá 6 tài liệu Workflow Engine Architecture vừa hoàn thành (`docs/WORKFLOW_ENGINE.md`, `docs/APPROVAL_ENGINE.md`, `docs/AUTOMATION_ENGINE.md`, `docs/NOTIFICATION_ENGINE.md`, `docs/SCHEDULER_ENGINE.md`, `docs/WEBHOOK_ENGINE.md`), trước khi dừng lại.

## 1. Đối chiếu với yêu cầu gốc

| Yêu cầu | Tài liệu tương ứng | Trạng thái |
|---|---|---|
| 10 module (Workflow/Approval/Automation/Notification/Schedule/Webhook/Trigger/Action/Condition/Rule Engine) | `WORKFLOW_ENGINE.md` mục 1 (bảng ánh xạ đủ 10/10 vào 7 thư mục) | ✅ |
| 5 loại Workflow (Manual/Auto/Approval/AI/Cross Module) | `WORKFLOW_ENGINE.md` mục 3 | ✅ đủ 5/5 |
| 6 trạng thái Approval (Draft/Pending/Approved/Rejected/Cancelled/Completed) | `APPROVAL_ENGINE.md` mục 1 | ✅ đủ 6/6, giải thích rõ Approved≠Completed |
| 6 loại Trigger (Time/Event/Firestore/AI/Webhook/Manual) | `AUTOMATION_ENGINE.md` mục 1 | ✅ đủ 6/6 |
| 8 kênh Notification (In-App/Email/SMS/Push/Slack/Telegram/Discord/Zalo) | `NOTIFICATION_ENGINE.md` mục 1 | ✅ đủ 8/8, Zalo đánh dấu mở rộng đúng yêu cầu |
| 6 loại Schedule (One Time/Daily/Weekly/Monthly/Yearly/Cron) | `SCHEDULER_ENGINE.md` mục 1 | ✅ đủ 6/6 |
| Webhook (Incoming/Outgoing/Retry/Queue/Log/Security) | `WEBHOOK_ENGINE.md` | ✅ đủ 6/6 mục |
| Kết nối 8 domain (Customers/Orders/Warehouse/Production/Finance/HR/Academy/AI Agents) | `WORKFLOW_ENGINE.md` mục 4 | ✅ đủ 8/8 |
| Cấu trúc `packages/workflow/` (7 thư mục) | `WORKFLOW_ENGINE.md` mục 1 | ✅ đủ 7/7 |

**6/6 tài liệu yêu cầu đã xuất đủ trong `docs/`** (đây là file thứ 7, `WORKFLOW_REVIEW.md`, hoàn tất danh sách 7 file yêu cầu).

## 2. Tuân thủ ràng buộc — đặc biệt quan trọng: KHÔNG phá vỡ Database đã đóng băng (Stage 5)

| Ràng buộc | Tuân thủ? |
|---|---|
| Không tạo/sửa HTML | ✅ |
| Không viết Business Logic | ✅ — chỉ có đặc tả state machine/schema, không có code thực thi |
| Không gọi API/Firebase thật | ✅ |
| Không tạo Automation thật | ✅ |
| **Không thêm collection Firestore mới** (Database đã đóng băng Stage 5) | ✅ — xem bảng dưới, mọi mở rộng chỉ là enum/field nhúng tuỳ chọn |

### Bảng tổng hợp mọi điểm "chạm" vào Database đã đóng băng (minh bạch hoá, không giấu)

| Thay đổi đề xuất | Loại | Có phải collection mới? |
|---|---|---|
| `status` thêm giá trị `completed` | Mở rộng enum giá trị | ❌ Không |
| `notifications.channel` thêm 5 giá trị (email/sms/slack/telegram/discord/zalo, gộp toast+popover thành `in_app`) | Mở rộng enum giá trị | ❌ Không |
| `workflows.trigger.type`, `workflows.steps[].stepType` làm rõ giá trị hợp lệ | Làm rõ giá trị field đã có, không đổi cấu trúc | ❌ Không |
| `automation.status` thêm giá trị `waiting_approval` | Mở rộng enum giá trị | ❌ Không |
| `approvalSteps: array<{...}>` trên document cần duyệt nhiều cấp | Field nhúng **tuỳ chọn** | ❌ Không (không phải collection, không bắt buộc mọi document phải có) |
| `ai_agents.allowedTools` (đã đề xuất từ Stage 8) | Field bổ sung | ❌ Không (đã ghi nhận từ Stage 8, không phát sinh mới ở Stage 9) |

**Không có collection top-level mới nào được đề xuất ở Stage 9** — đây là điểm cần xác nhận rõ với người điều hành dự án dù không bắt buộc phải hỏi lại (nguyên tắc đóng băng Stage 5 nói "không thay đổi cấu trúc Database nếu không có yêu cầu rõ ràng" — các thay đổi ở đây đều là *mở rộng giá trị*, không phải *đổi cấu trúc*, nhưng vẫn liệt kê minh bạch để dễ rà soát).

## 3. Nhất quán giữa các tài liệu

- `workflows`/`automation` (Stage 5) là nguồn dữ liệu duy nhất xuyên suốt cả 6 tài liệu — không tài liệu nào tự ý thêm collection song song.
- Action Registry (`AUTOMATION_ENGINE.md` mục 2) và Tool Registry (Stage 8) dùng chung 1 triết lý khuôn mẫu — khác biệt duy nhất là Action **được phép ghi** (có `requiresApproval`), Tool **chỉ đọc** — ranh giới này nhất quán, không lẫn lộn giữa 2 tài liệu.
- Retry (`WEBHOOK_ENGINE.md` mục 3) dùng cùng mẫu backoff tăng dần như `MODEL_ROUTER.md` (Stage 7) — không phát minh cơ chế Retry khác biệt không cần thiết.
- Rule Engine (`AUTOMATION_ENGINE.md` mục 3) được `APPROVAL_ENGINE.md` mục 5 tái sử dụng đúng (đọc `settings` để quyết định ngưỡng duyệt) — không có 2 cơ chế đánh giá điều kiện song song.
- Approval Workflow (`WORKFLOW_ENGINE.md` mục 3.3) và Approval Engine (`APPROVAL_ENGINE.md` mục 6) mô tả đúng 1 luồng, không mâu thuẫn về việc Workflow "tạm dừng" khi gặp bước duyệt.

## 4. Phát hiện mới trong quá trình thiết kế

1. **Approved ≠ Completed** là phát hiện quan trọng nhất (`APPROVAL_ENGINE.md` mục 1) — tách 2 khái niệm "quyết định" và "hoàn tất thực thi" giúp báo cáo phát hiện tồn đọng ("đã duyệt nhưng chưa xử lý xong"), điều mà enum gốc Stage 5 (`FIELD_STANDARD.md` mục 6, không có `completed`) chưa bao quát.
2. **Multi-step Approval không cần collection mới** — dùng field nhúng `approvalSteps` ngay trên chính document cần duyệt, tránh phát sinh 1 collection `approval_instances` riêng (phương án ban đầu cân nhắc nhưng loại bỏ vì không cần thiết và tôn trọng nguyên tắc đóng băng Database tốt hơn).
3. **Schedule 6 loại thực chất là 1 loại (Cron) với 5 lối tắt cấu hình dễ dùng hơn** — không phải 6 cơ chế song song, giúp đơn giản hoá đáng kể khi triển khai thật (chỉ cần 1 bộ dịch ScheduleConfig→Cron, không cần 6 pipeline riêng).
4. **Cần phân biệt Rate Limiting của Webhook (Stage 9) và của Tool Calling (Stage 8)** — cùng khái niệm nhưng khác đối tượng bảo vệ (request từ bên ngoài không qua RBAC nội bộ, khác Tool Calling luôn có user đã xác thực) — dễ nhầm là 1 cơ chế nếu không tách rõ.

## 5. Giới hạn của tài liệu (Limitations)

- Đây là thiết kế khái niệm — chưa có Cloud Scheduler/Cloud Tasks thật, chưa xác nhận `webhookSignatureMethod` cụ thể cho từng đối tác ngoài (GHTK/VNPay/Slack...) tại thời điểm tích hợp thật.
- Rule Engine (`AUTOMATION_ENGINE.md` mục 3) mới định nghĩa cú pháp Rule cơ bản (so sánh field-operator-value) — chưa xử lý các trường hợp phức tạp hơn (hàm tổng hợp như SUM/COUNT trong Rule) — có thể cần mở rộng khi có kịch bản cụ thể.
- Chưa chọn nhà cung cấp SMS Gateway cụ thể (`NOTIFICATION_ENGINE.md` mục 1) — để ngỏ, là quyết định hạ tầng ngoài phạm vi thiết kế kiến trúc.
- Zalo Official Account API cần quy trình xét duyệt riêng của Zalo — chưa xác nhận được thời điểm khả dụng, đúng như đã đánh dấu "mở rộng" trong yêu cầu gốc.

## 6. Sẵn sàng cho giai đoạn kế tiếp?

| Điều kiện tiên quyết | Đạt? |
|---|---|
| Đủ 10 module, ánh xạ rõ vào cấu trúc package | ✅ |
| Đủ 5 loại Workflow, 6 trạng thái Approval, 6 Trigger, 8 kênh Notification, 6 Schedule | ✅ |
| Webhook đủ 6 khía cạnh (Incoming/Outgoing/Retry/Queue/Log/Security) | ✅ |
| Không phá vỡ Database đã đóng băng — mọi thay đổi chỉ là mở rộng enum/field nhúng tuỳ chọn | ✅ |
| Kết nối được cả 8 domain nghiệp vụ yêu cầu | ✅ |
| Đã chọn nhà cung cấp SMS/xác nhận Zalo API khả dụng | ❌ — quyết định hạ tầng, ngoài phạm vi Stage 9 |
| Đã kiểm chứng Rule Engine đủ biểu đạt mọi luật nghiệp vụ thật | ❌ — cần mở rộng khi có kịch bản cụ thể phức tạp hơn |

**Kết luận**: Kiến trúc Workflow Engine (Stage 9) đã đủ để làm tài liệu tham chiếu thiết kế hoàn chỉnh cho toàn bộ 10 module yêu cầu, nhất quán với AI Gateway (Stage 7), Tool Calling (Stage 8), và Database Architecture đã đóng băng (Stage 5) — **không đề xuất bất kỳ collection Firestore mới nào**, chỉ mở rộng giá trị enum và field nhúng tuỳ chọn trên nền đã có.

---

**Dừng lại theo đúng yêu cầu** — không viết code, không gọi Firebase, không viết Business Logic.
