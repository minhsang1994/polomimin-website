# SCHEDULER_ENGINE.md — Thiết kế Scheduler Engine

Scheduler Engine (`packages/workflow/scheduler/`) là nơi diễn giải `workflows.trigger.config` khi `trigger.type = "time"` (`AUTOMATION_ENGINE.md` mục 1) thành lịch chạy cụ thể — tầng **định nghĩa dữ liệu**, không tự vận hành lịch (việc thật sự "đánh thức" theo giờ là Cloud Scheduler, đã có ở `FUNCTIONS_PLAN.md` Stage 4 mục 6, cột "Scheduled").

## 1. 6 loại Schedule

```
ScheduleConfig (nằm trong workflows.trigger.config khi trigger.type = "time"):
  scheduleType: "one_time" | "daily" | "weekly" | "monthly" | "yearly" | "cron"
  scheduleValue: string | number    // ý nghĩa tuỳ scheduleType, xem bảng dưới
  timezone: string                  // VD "Asia/Ho_Chi_Minh" — bắt buộc, tránh lệch giờ
  startAt: number                   // không chạy trước mốc này
  endAt: number | null              // null = không giới hạn, dừng hẳn sau mốc này nếu có
```

| `scheduleType` | `scheduleValue` chứa gì | Ví dụ |
|---|---|---|
| `one_time` | Timestamp (number, epoch ms) — chạy đúng 1 lần | Nhắc 1 lần vào "10:00 25/07/2026" |
| `daily` | Giờ trong ngày (`"HH:mm"`) | `"08:00"` — chạy mỗi ngày lúc 8h sáng |
| `weekly` | Thứ trong tuần + giờ (`"MON,WED,FRI 08:00"`) | Báo cáo tồn kho mỗi Thứ 2/4/6 |
| `monthly` | Ngày trong tháng + giờ (`"1 08:00"` = ngày 1 hàng tháng) | Tính lương đầu tháng |
| `yearly` | Ngày/tháng + giờ (`"01-01 00:00"`) | Chốt sổ đầu năm tài chính |
| `cron` | Biểu thức Cron chuẩn (`"0 8 * * 1,3,5"`) | Dùng khi 5 loại trên không đủ linh hoạt biểu diễn |

`cron` là **lối thoát tổng quát** — 5 loại còn lại là các mẫu rút gọn phổ biến, dễ cấu hình qua UI (không bắt người dùng thường phải hiểu cú pháp Cron) nhưng **diễn giải về cùng 1 biểu thức Cron** phía dưới khi đăng ký với Cloud Scheduler (VD `daily "08:00"` = tương đương cron `"0 8 * * *"`) — không phải 2 cơ chế song song, chỉ là 2 cách nhập liệu cho cùng 1 kết quả.

## 2. Vòng đời 1 Schedule

```
1. Người vận hành cấu hình ScheduleConfig trên UI (chọn 1 trong 6 loại)
2. Scheduler Engine dịch ScheduleConfig → biểu thức Cron chuẩn
3. Đăng ký 1 Cloud Scheduler job (khi triển khai thật, ngoài phạm vi Stage 9) trỏ
   tới `workflowId` tương ứng — Cloud Scheduler chỉ cần biết "tới giờ gọi endpoint
   nào", không cần biết chi tiết Workflow bên trong
4. Tới giờ, Cloud Scheduler gọi `aiGatewayProxy`/1 Cloud Function riêng cho
   Workflow (tuỳ quyết định triển khai) → Workflow Engine nhận trigger.type="time"
   → chạy như mục 5 WORKFLOW_ENGINE.md
5. `automation` (Stage 5) ghi lại lượt chạy — có thể so sánh `scheduleValue` dự
   kiến với `createdAt` thực tế để phát hiện job chạy trễ/miss (giám sát vận hành)
```

## 3. Xử lý múi giờ và trùng lịch

- **Bắt buộc lưu `timezone` tường minh** (không suy đoán từ server) — Organization vận hành tại Việt Nam mặc định `Asia/Ho_Chi_Minh`, nhưng Organization có chi nhánh nước ngoài (nếu có) cần override riêng.
- Nếu 2 `workflows` cùng lịch trùng giờ chạy độc lập — không cần cơ chế hàng đợi đặc biệt (khác Webhook, `WEBHOOK_ENGINE.md` mục 3, vốn cần Queue vì tần suất bất định) vì lịch đã biết trước, Cloud Scheduler xử lý đồng thời được.
- `endAt` hết hạn → Scheduler Engine tự đặt `workflows.isActive = false` (không xoá Workflow, chỉ tắt) — giữ lịch sử để xem lại cấu hình cũ.

## 4. Quan hệ với Automation Engine

Scheduler Engine **không tự quyết định Workflow làm gì** khi tới giờ — nó chỉ đảm bảo đúng **thời điểm** kích hoạt `trigger.type = "time"` (`AUTOMATION_ENGINE.md` mục 1). Toàn bộ `steps[]` sau đó chạy theo đúng luồng Trigger→Condition→Action đã thiết kế ở `AUTOMATION_ENGINE.md` — Scheduler chỉ là 1 trong 6 nguồn Trigger, không phải 1 hệ thống tách biệt.

## 5. Tham chiếu

- Trigger tổng thể (6 loại): [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md) mục 1
- Cloud Scheduler đã đặt tên trước: [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md) mục 6 (Stage 4)
- Workflow Definition: [WORKFLOW_ENGINE.md](WORKFLOW_ENGINE.md) mục 2
