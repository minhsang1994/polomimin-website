# AI_SECURITY.md — Bảo mật AI Gateway & Cost Control

Nối tiếp `SECURITY_RULES.md`/`SECURITY_PLAN.md` (Stage 4/5) — tài liệu này thiết kế riêng các rủi ro **đặc thù của AI Gateway** mà Security Rules Firestore thông thường không tự bao phủ hết.

## 1. Quản lý API Key — không bao giờ lộ ra client

- Toàn bộ API key Provider (`AI_PROVIDER.md` mục 4) chỉ tồn tại phía server (Cloud Function `aiGatewayProxy`/Secret Manager) — **HTML và app Next.js không bao giờ giữ hoặc thấy** bất kỳ API key Provider nào.
- `AI Service Layer` (tầng client, `AI_GATEWAY.md` mục 1) chỉ gửi `agentId`/`prompt`/`uid`/`orgId` — không có trường nào cho phép client tự chỉ định API key hay endpoint Provider (tránh client giả mạo request tới endpoint tuỳ ý).
- App Check (`FIREBASE_ARCHITECTURE.md` Stage 4 mục 4) áp dụng cho request gọi `aiGatewayProxy` giống mọi Cloud Function khác — chặn request không đến từ app thật.

## 2. Prompt Injection — phòng vệ 3 lớp

Prompt Injection (người dùng hoặc nội dung Knowledge chèn lệnh giả để "vượt quyền" System Prompt) là rủi ro riêng của hệ thống AI, không có ở kiến trúc Database/Auth thông thường:

| Lớp | Biện pháp |
|---|---|
| 1. Đầu vào (User Message) | Không cho phép User Message override System Prompt — Prompt Engine luôn đặt System Prompt ở vị trí có độ ưu tiên cao nhất theo đúng cơ chế role-based message của từng Provider (`role: system`), không nối chuỗi thô cho phép User Message "giả danh" system |
| 2. Đầu vào gián tiếp (Knowledge/Tool result) | Nội dung lấy từ `knowledge` (RAG) hoặc kết quả Tool Calling (`KNOWLEDGE_ARCHITECTURE.md` mục 3) được đánh dấu rõ ràng là "dữ liệu tham khảo", không đặt ở vị trí có thể bị model hiểu nhầm là chỉ thị hệ thống |
| 3. Đầu ra (trước khi trả về client) | Model Comparison/kiểm duyệt đầu ra (Content Moderation, mục 6) trước khi trả câu trả lời cuối, đặc biệt với Function/Tool Calling — không cho phép model tự ý gọi Tool ngoài danh sách đã khai báo trước (whitelist Tool cố định theo `agentId`, không cho model "tự đề xuất" tool lạ) |

## 3. Chế độ Dữ liệu nhạy cảm — bắt buộc dùng Model nội bộ

Một số Organization (đặc biệt ngành có dữ liệu nhạy cảm — tài chính, y tế, hoặc theo yêu cầu hợp đồng bảo mật) cần đảm bảo **không dữ liệu nào rời khỏi hạ tầng nội bộ**. Thiết kế:

- Field cấu hình `settings` (Stage 5) cấp Organization: `aiDataResidency: "external" | "internal_only"`.
- Khi `internal_only`: Router (`MODEL_ROUTER.md` mục 2) **bắt buộc** chọn Model nội bộ (Local LLM), bỏ qua mọi Provider ngoài kể cả khi Model nội bộ chất lượng thấp hơn — không tự động fallback ra Provider ngoài (đã ghi ở `MODEL_ROUTER.md` mục 3).
- Áp dụng luôn cho cả Embedding (Loại A Knowledge, `KNOWLEDGE_ARCHITECTURE.md` mục 2) — không gửi SOP/Company Docs nhạy cảm ra Provider ngoài để tạo embedding nếu Organization bật `internal_only`.

## 4. Cách ly theo Organization (Organization Isolation cho AI)

Mọi bước của Gateway (Memory, Knowledge, Tool Calling) đều phải lọc theo `organizationId` của request — nhắc lại nguyên tắc đã có ở `SECURITY_PLAN.md` Stage 5, áp dụng cụ thể cho AI:

- `ai_history`/`ai_memories` chỉ đọc/ghi trong phạm vi `organizationId` của request — **không có chế độ "học chéo"** giữa các Organization dù dùng chung 1 AI Agent persona.
- Tool Calling (`KNOWLEDGE_ARCHITECTURE.md` mục 3) khi gọi `packages/database` generic helper **bắt buộc truyền `organizationId`** — không có Tool nào truy vấn xuyên Organization trừ khi người gọi có `platformRole: "super_admin"` (đúng theo `SECURITY_PLAN.md` Stage 5 mục 4).
- Knowledge dùng chung nền tảng (`isShared: true`) là **duy nhất ngoại lệ được phép** đọc xuyên Organization — vì đây là nội dung MIMIN chủ động công khai, không phải dữ liệu riêng tư của 1 Organization khác.

## 5. Cost Control

### 5.1. Token Usage & Provider Usage

Mỗi request ghi 1 document `usage_logs` (Stage 5) với `tokensInput`/`tokensOutput`/`costAmount`/`agentId`/`modelSlug` — đây là **nguồn số liệu duy nhất** cho mọi báo cáo chi phí (không tính lại từ nơi khác).

### 5.2. Daily Cost / Monthly Cost

```
tokens/{organizationId} (Stage 5, document 1-1 theo Organization):
  monthlyQuota        — hạn mức tháng (theo gói dịch vụ)
  usedThisMonth        — cộng dồn từ usage_logs.costAmount trong tháng hiện tại
  resetAt              — thời điểm reset lại usedThisMonth = 0 (đầu tháng)
```

- Gateway kiểm tra `usedThisMonth < monthlyQuota` **trước khi** gọi Router (bước 7, `AI_GATEWAY.md` mục 4) — vượt hạn mức thì chặn request, trả lỗi rõ ràng "Đã vượt hạn mức AI tháng này", không âm thầm gọi tiếp rồi tính phí phát sinh ngoài ý muốn Organization.
- Báo cáo Daily Cost tổng hợp từ `usage_logs` theo ngày (query `where organizationId == X, createdAt trong khoảng 1 ngày`) — không cần thêm collection riêng, tính trực tiếp từ `usage_logs` (giống cách `production_reports` tổng hợp từ dữ liệu gốc, Stage 5).
- Cảnh báo sớm (đề xuất): khi `usedThisMonth` vượt 80%/100% `monthlyQuota`, sinh 1 `ai_insights` (Stage 5) cảnh báo `owner`/`admin` — tái sử dụng đúng cơ chế Insight đã thiết kế, không tạo cơ chế cảnh báo riêng cho AI.

### 5.3. Model Comparison và chi phí

Model Comparison (`MODEL_ROUTER.md` mục 5) gọi nhiều Model cùng lúc — **tính đủ chi phí cho từng Model được gọi**, không tính là 1 request duy nhất — vì đây là tính năng có chi phí thật cao hơn bình thường (N model = N lần chi phí), cần hiển thị rõ cho người bật tính năng này để tránh vượt hạn mức ngoài ý muốn.

## 6. Content Moderation (đầu ra)

Trước khi trả kết quả về client, Gateway nên có bước kiểm tra đầu ra cơ bản (không phải Business Logic phức tạp — chỉ là 1 bước lọc chuẩn Enterprise thường có):
- Chặn nội dung vi phạm chính sách sử dụng (nếu Provider trả về nội dung không phù hợp).
- Không trả nguyên văn lỗi hệ thống/stack trace của Provider ra client (che giấu chi tiết hạ tầng, chỉ trả thông báo lỗi chung chung).

## 7. Tham chiếu

- Nguyên tắc bảo mật Database gốc: [SECURITY_RULES.md](SECURITY_RULES.md), [SECURITY_PLAN.md](SECURITY_PLAN.md) (Stage 4/5)
- Collection `tokens`/`usage_logs`/`ai_insights`: [COLLECTIONS.md](COLLECTIONS.md) mục I
- App Check: [FIREBASE_ARCHITECTURE.md](FIREBASE_ARCHITECTURE.md) mục 4
