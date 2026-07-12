# NOTIFICATION_ENGINE.md — Thiết kế Notification Engine

Notification Engine (`packages/workflow/notification/`) gửi thông báo qua **8 kênh** yêu cầu, mở rộng trực tiếp từ `notifications` (Stage 5, CORE domain) và Notification Flow gốc (`WORKFLOW.md` Stage 3, 3 kênh: Toast/Popover/AI Float — nay là 1 tập con của 8 kênh này) + `dispatchNotification` (`FUNCTIONS_PLAN.md` Stage 4 mục 2).

## 1. Channel Adapter — cùng triết lý Provider Adapter (AI_PROVIDER.md, Stage 7)

Mỗi kênh có 1 adapter riêng, cùng 1 interface chung (`send(recipient, payload)`) — Notification Engine không quan tâm chi tiết bên trong từng kênh, giống hệt cách `AI_PROVIDER.md` trừu tượng hoá 8 Provider AI:

| Kênh | Loại | Ghi chú kỹ thuật (khi triển khai thật, ngoài phạm vi Stage 9) |
|---|---|---|
| In-App | Nội bộ | Ghi trực tiếp `notifications` (Stage 5) — không qua dịch vụ ngoài, hiển thị qua Toast/Popover (`WORKFLOW.md` Stage 3) |
| Email | Ngoài | Qua Extension `Trigger Email` (`FIREBASE_ARCHITECTURE.md` Stage 4 mục 3) — đã có sẵn, không cần Cloud Function tự viết |
| SMS | Ngoài | Cần nhà cung cấp SMS Gateway (VD Twilio/eSMS/Viettel) — chưa chọn cụ thể, để ngỏ |
| Push Notification | Ngoài (nhưng hạ tầng nội bộ Firebase) | Cloud Messaging (FCM) — đã có trong `FIREBASE_ARCHITECTURE.md` Stage 4 mục 2 |
| Slack | Ngoài | Webhook Outgoing (`WEBHOOK_ENGINE.md` mục 2) tới Slack Incoming Webhook URL |
| Telegram | Ngoài | Gọi Telegram Bot API (dạng Webhook Outgoing tương tự Slack) |
| Discord | Ngoài | Webhook Outgoing tới Discord Webhook URL (tương tự Slack) |
| Zalo (mở rộng) | Ngoài | Đánh dấu **giai đoạn mở rộng sau** — Zalo Official Account API cần xét duyệt doanh nghiệp riêng, không triển khai ngay giai đoạn đầu |

## 2. Mở rộng field `notifications.channel` (Stage 5) — không tạo collection mới

`notifications.channel` (Stage 5) hiện có enum `toast/popover/push` — Stage 9 mở rộng thành 8 giá trị: `in_app` (gộp toast+popover, vì cả 2 chỉ là **cách hiển thị** khác nhau của cùng 1 kênh In-App, không phải 2 kênh riêng), `email`, `sms`, `push`, `slack`, `telegram`, `discord`, `zalo`. Đây là **mở rộng giá trị enum**, không đổi cấu trúc field, không vi phạm đóng băng Database (Stage 5).

## 3. Notification Definition (gửi gì, cho ai, qua kênh nào)

```
NotificationRequest {
  organizationId: string
  recipientUid: string              // hoặc recipientRoleSlug (gửi theo vai trò, VD "mọi manager Finance")
  channels: array<ChannelType>       // 1 thông báo có thể gửi ĐA KÊNH cùng lúc
  title: string
  body: string
  deepLink: string                   // dẫn thẳng tới màn hình xử lý (VD tới approval đang chờ)
  priority: "low" | "normal" | "high" | "urgent"
}
```

`priority` (mới, đề xuất bổ sung) quyết định **kênh mặc định** nếu `channels` không chỉ định rõ — VD `urgent` mặc định gửi cả In-App + Push + kênh ngoài (Slack/Telegram) đồng thời, `low` chỉ ghi In-App.

## 4. Sơ đồ gửi đa kênh

```
NotificationRequest
   ↓
Với mỗi channel trong `channels[]`:
   → tra Channel Adapter tương ứng (mục 1)
   → gọi adapter.send(recipient, payload)
   → ghi kết quả (thành công/lỗi) — append vào `notifications` (kênh in_app luôn ghi;
     kênh khác ghi thêm 1 field `deliveryLog` nhúng trên cùng document, không tách
     collection riêng cho log gửi từng kênh)
   → 1 kênh lỗi KHÔNG chặn kênh khác (gửi độc lập — Slack lỗi không ảnh hưởng Email)
```

## 5. Sở thích thông báo theo User (User Notification Preference)

Nối tiếp User Memory (Stage 7 `MEMORY_ARCHITECTURE.md` mục 2) — không phải mọi user đều muốn nhận đủ 8 kênh. Đề xuất field trong `settings` (Stage 5, `scopeType: "user"`): `values.notificationPreferences = { email: true, sms: false, slack: true, ... }`. Notification Engine tra field này **trước khi** gửi qua kênh ngoài (không tra cho In-App — In-App luôn ghi, vì đó là nơi lưu trữ thông báo chính thức, tắt kênh khác không có nghĩa là tắt luôn việc ghi nhận thông báo).

## 6. Quan hệ với Workflow Engine

`stepType: "notification"` (`WORKFLOW_ENGINE.md` mục 2) chính là 1 `NotificationRequest` được điền sẵn `config` trong `workflows.steps[]` — Notification Engine không tự quyết định "khi nào gửi", chỉ chịu trách nhiệm "gửi như thế nào" khi được Workflow Engine hoặc `dispatchNotification` (Cloud Function, `FUNCTIONS_PLAN.md` Stage 4) gọi tới.

## 7. Tham chiếu

- Toast/Popover/AI Float gốc: [WORKFLOW.md](WORKFLOW.md) (Stage 3) mục B
- Collection `notifications`, field `settings`: [COLLECTIONS.md](COLLECTIONS.md) domain A.6/A.7
- Cloud Messaging, Extension Trigger Email: [FIREBASE_ARCHITECTURE.md](FIREBASE_ARCHITECTURE.md) mục 2/3 (Stage 4)
- `dispatchNotification`: [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md) mục 2 (Stage 4)
- Webhook Outgoing (Slack/Telegram/Discord): [WEBHOOK_ENGINE.md](WEBHOOK_ENGINE.md) mục 2
