# WEBHOOK_ENGINE.md — Thiết kế Webhook Engine

Webhook Engine (`packages/workflow/webhook/`) chuẩn hoá 2 chiều giao tiếp với hệ thống bên ngoài — **Incoming** (bên ngoài gọi vào MIMIN) và **Outgoing** (MIMIN gọi ra ngoài) — mở rộng trực tiếp từ nhóm Webhook đã đặt tên ở `FUNCTIONS_PLAN.md` (Stage 4 mục 4: `webhookShippingCarrier`, `webhookPaymentGateway`, `webhookOutbound`).

## 1. Incoming Webhook

Nhận request từ hệ thống ngoài (đơn vị vận chuyển, cổng thanh toán...) → kích hoạt `trigger.type = "webhook"` (`AUTOMATION_ENGINE.md` mục 1):

```
Incoming Webhook Endpoint {
  webhookEndpointId: string
  sourceSystem: string            // VD "ghtk", "vnpay" — hệ thống ngoài nào gọi tới
  expectedSignatureMethod: string  // VD "hmac_sha256" — dùng để xác thực (mục 5)
  linkedWorkflowId: string         // Workflow nào được kích hoạt khi request tới
}
```

Luồng: `Request ngoài → xác thực chữ ký (mục 5) → parse payload → gán vào "biến ngữ cảnh" Workflow → kích hoạt trigger.type="webhook" → chạy steps[] như bình thường (AUTOMATION_ENGINE.md mục 4)`.

## 2. Outgoing Webhook

MIMIN chủ động gọi ra ngoài khi 1 sự kiện nội bộ xảy ra (VD đơn hàng xác nhận → báo đối tác ERP ngoài, hoặc gửi Slack/Telegram/Discord — `NOTIFICATION_ENGINE.md` mục 1):

```
Outgoing Webhook Config {
  targetUrl: string
  eventTypes: array<string>       // sự kiện nào kích hoạt gửi (khớp trigger.type="event")
  payloadTemplate: string          // giống Prompt Template (PROMPT_ENGINE.md Stage 7) —
                                    // {{orderCode}}, {{status}}... điền vào JSON gửi đi
  headers: map                     // header tuỳ chỉnh (VD Authorization token đối tác cấp)
}
```

Đây chính là `webhookOutbound` (`FUNCTIONS_PLAN.md` Stage 4) — Stage 9 cụ thể hoá cấu hình để **người vận hành tự thêm đối tác Outgoing Webhook mới** (đổi `targetUrl`/`eventTypes`) mà không cần lập trình viên deploy code mới mỗi lần.

## 3. Retry

Áp dụng cho cả Incoming (xử lý lỗi khi Action bên trong Workflow lỗi) và Outgoing (khi gọi ra ngoài thất bại) — cùng triết lý Retry đã thiết kế ở `MODEL_ROUTER.md` (Stage 7 mục 3), khác chỗ đối tượng là HTTP request thay vì gọi AI Provider:

```
Gọi Outgoing Webhook lần 1
   │
   ├─ 2xx → thành công, dừng
   │
   └─ lỗi (timeout/5xx/mạng)
         │
         ▼
      Retry theo backoff tăng dần (VD 1 phút → 5 phút → 30 phút), tối đa N lần
         │
         ├─ Thành công ở 1 lần retry nào đó → dừng, ghi "đã retry X lần"
         │
         └─ Hết N lần vẫn lỗi → chuyển vào trạng thái "failed_permanently",
            ghi `ai_insights` cảnh báo (severity: warning) để người vận hành
            biết đối tác ngoài không nhận được dữ liệu, cần xử lý thủ công
```

## 4. Queue

Incoming Webhook có thể tới **dồn dập** (VD nhiều đơn vị vận chuyển cùng báo trạng thái 1 lúc) — Webhook Engine không xử lý đồng bộ ngay trong request (tránh timeout HTTP với bên gọi), mà:

```
Request tới → xác thực chữ ký (mục 5) → đẩy vào Queue (Cloud Tasks — hạ tầng
GCP có sẵn, không phải collection Firestore mới) → trả 200 OK ngay cho bên
gọi (xác nhận đã nhận, tránh họ tự retry vì tưởng lỗi) → xử lý thật (kích hoạt
Workflow) diễn ra bất đồng bộ, đọc dần từ Queue
```

**Không cần collection Firestore mới cho Queue** — đây là hạ tầng thực thi (Cloud Tasks), không phải dữ liệu cần truy vấn/hiển thị lâu dài; kết quả xử lý sau khi lấy ra khỏi Queue mới ghi vào `automation` (Stage 5) như mọi Workflow khác.

## 5. Security

Nối tiếp `FUNCTIONS_PLAN.md` (Stage 4 mục 7: "Webhook endpoint phải xác thực chữ ký/secret riêng của bên thứ 3, không dùng Firebase Auth") — cụ thể hoá:

| Bước | Mô tả |
|---|---|
| Xác thực chữ ký | Mỗi `sourceSystem` (mục 1) có 1 secret riêng (lưu Secret Manager, không phải Firestore — nhất quán nguyên tắc `AI_SECURITY.md` Stage 7 mục 1 không lưu secret trong dữ liệu đọc được từ client) — tính HMAC của payload, so khớp header chữ ký bên gửi đính kèm |
| Chặn Replay Attack | Kiểm tra `timestamp` trong payload không quá cũ (VD > 5 phút thì từ chối) — chặn kẻ tấn công gửi lại y nguyên 1 request cũ đã chặn được trước đó |
| Rate Limiting | Giới hạn số request/phút theo từng `webhookEndpointId` — tách biệt với Rate Limiting của Tool Calling (`TOOL_SECURITY.md` Stage 8 mục 7), vì đây là request từ bên ngoài không qua RBAC nội bộ |
| IP Allowlist (tuỳ chọn) | Nếu đối tác cung cấp dải IP cố định (VD cổng thanh toán), có thể chặn thêm theo IP nguồn — lớp phòng thủ bổ sung, không thay thế xác thực chữ ký |

## 6. Log

Mọi request Incoming/Outgoing (thành công, lỗi, bị từ chối bảo mật) ghi vào `activity_logs` (Stage 5, đã có sẵn, không tạo collection mới): `{ actorType: "system", action: "webhook_incoming" | "webhook_outgoing", targetCollection: "webhook_endpoints", metadata: { sourceSystem/targetUrl, statusCode, retryCount } }` — tái sử dụng đúng collection audit chung, nhất quán cách `TOOL_SECURITY.md` (Stage 8 mục 6) ghi log gọi Tool.

## 7. Tham chiếu

- Webhook Cloud Function đã đặt tên: [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md) mục 4/7 (Stage 4)
- Trigger loại `webhook`: [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md) mục 1
- Retry pattern gốc (AI Provider): [MODEL_ROUTER.md](MODEL_ROUTER.md) mục 3 (Stage 7)
- Audit log dùng chung: [COLLECTIONS.md](COLLECTIONS.md) mục A.8 (`activity_logs`)
