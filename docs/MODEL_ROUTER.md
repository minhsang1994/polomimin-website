# MODEL_ROUTER.md — Thiết kế AI Router

Router là thư mục `packages/ai/router/` — chịu trách nhiệm **chọn đúng Provider + Model** cho 1 request, xử lý Retry/Fallback, và hỗ trợ Model Comparison. Router **không tự gọi model** — chỉ quyết định "gọi ai", việc gọi thật do `providers/` đảm nhiệm (xem `AI_PROVIDER.md`).

## 1. Khoá định tuyến (Routing Key)

Router chọn Model dựa trên **2 lớp khoá**, ưu tiên lớp 1 trước:

| Lớp | Khoá | Ví dụ |
|---|---|---|
| 1. Task-type (ưu tiên cao nhất) | Loại tác vụ, không phụ thuộc module | `coding`, `image_generation`, `video_generation`, `long_document_reasoning` |
| 2. Module (mặc định) | `moduleSlug` từ `packages/core/MODULES[]` | `marketing`, `factory-os`, `crm`, `finance`... |

Lý do 2 lớp: 1 module (VD `marketing`) phần lớn dùng model hội thoại/văn bản, nhưng thỉnh thoảng cần sinh ảnh (task-type `image_generation`) — task-type override module mặc định trong trường hợp đó.

## 2. Bảng định tuyến mặc định (đề xuất)

### Theo Task-type (override, áp dụng bất kể module nào)

| Task-type | Provider chính | Model | Lý do chọn (minh hoạ) |
|---|---|---|---|
| `coding` | Anthropic Claude | model dòng Claude mạnh nhất khả dụng | Chất lượng sinh/sửa code, ngữ cảnh dài |
| `image_generation` | OpenAI | GPT Image | Chất lượng ảnh, tuân thủ prompt tốt |
| `video_generation` | MiniMax | model video MiniMax | Chuyên biệt sinh video |
| `long_document_reasoning` | Google Gemini | model dòng Gemini context dài | Cửa sổ ngữ cảnh lớn, phù hợp phân tích tài liệu dài |

### Theo Module (mặc định khi không khớp Task-type nào)

| Module (`packages/core/MODULES[]`) | Provider mặc định | Lý do (minh hoạ) |
|---|---|---|
| `marketing` | Google Gemini | Sinh nội dung đa phương tiện, chi phí hợp lý cho khối lượng lớn |
| `factory-os`, `production` | DeepSeek | Chi phí thấp, đủ tốt cho phân tích vận hành/số liệu lặp lại tần suất cao |
| `crm`, `business-os` | Anthropic Claude | Cân bằng chất lượng hội thoại tư vấn khách hàng và chi phí |
| `finance` | Anthropic Claude | Yêu cầu độ chính xác/thận trọng cao khi diễn giải số liệu tài chính |
| `warehouse` | DeepSeek | Tác vụ vận hành lặp lại, chi phí thấp phù hợp |
| `training-center` | Google Gemini | Nội dung giáo dục dài, đa phương tiện |
| `ai-center` (hub quản trị AI Agent) | tuỳ theo agent con | Không có mặc định — mỗi `ai_agents` document tự khai `preferredProvider` |
| `automation` | DeepSeek | Workflow chạy nền, ưu tiên chi phí |
| `community`, `documents`, `affiliate`, `marketplace` | OpenRouter | Khối lượng chưa rõ/thấp — dùng OpenRouter để linh hoạt đổi model không cần đổi code |
| Mặc định toàn nền tảng (module không khớp ở trên) | OpenRouter | An toàn, hỗ trợ nhiều model qua 1 API, dùng khi chưa xác định rõ nhu cầu |
| Chế độ Offline/Nội bộ (dữ liệu nhạy cảm không được rời hạ tầng) | Model nội bộ (Local LLM) | Khi Organization bật cấu hình "không gửi dữ liệu ra ngoài" (xem `AI_SECURITY.md` mục 3) |

Bảng này là **cấu hình dữ liệu** (lưu ở Firestore, VD field `preferredProviderByModule` trong `settings` hoặc trực tiếp trong từng `ai_agents`), không hard-code trong code — cho phép đổi Provider mặc định không cần deploy lại (nhất quán nguyên tắc Remote Config đã có ở `FIREBASE_ARCHITECTURE.md` Stage 4).

## 3. Retry & Fallback

```
Gọi Provider chính (theo bảng mục 2)
   │
   ├─ Thành công → trả kết quả
   │
   └─ Lỗi (timeout / rate limit / 5xx)
         │
         ▼
      Retry cùng Provider (tối đa N lần, backoff tăng dần)
         │
         ├─ Thành công → trả kết quả (đánh dấu "đã retry" trong usage_logs)
         │
         └─ Vẫn lỗi sau N lần retry
               │
               ▼
            Fallback sang Provider dự phòng (danh sách thứ tự ưu tiên theo module/task-type)
               │
               ├─ Thành công → trả kết quả (đánh dấu "đã fallback" — cảnh báo ai_insights
               │                nếu Provider chính lỗi lặp lại nhiều lần trong ngày)
               │
               └─ Toàn bộ danh sách Fallback đều lỗi → trả lỗi rõ ràng cho AI Service Layer,
                  KHÔNG âm thầm trả kết quả rỗng/giả
```

**Danh sách Fallback đề xuất theo Provider chính** (dự phòng theo thứ tự, dừng ngay khi có 1 cái thành công):

| Provider chính | Fallback 1 | Fallback 2 |
|---|---|---|
| OpenAI | OpenRouter (route lại tới model tương đương) | Anthropic Claude |
| Anthropic Claude | OpenRouter | Google Gemini |
| Google Gemini | OpenRouter | DeepSeek |
| DeepSeek | OpenRouter | Google Gemini |
| MiniMax | OpenRouter | (không có — task video ít provider thay thế tương đương) |
| Grok | OpenRouter | OpenAI |
| Model nội bộ (Local LLM) | **không Fallback ra ngoài** — nếu Organization bật chế độ offline (mục 2), lỗi thì báo lỗi thẳng, không tự ý gửi dữ liệu ra Provider ngoài (xem `AI_SECURITY.md` mục 3) |

**OpenRouter đóng vai trò "fallback trung tâm"** vì bản thân nó là gateway trung gian tới nhiều model khác nhau — 1 lần tích hợp OpenRouter giảm số lượng adapter Provider cần fallback thủ công.

## 4. Cost-aware Routing (cân nhắc chi phí khi chọn Model)

Với tác vụ không yêu cầu chất lượng cao nhất (VD tóm tắt ngắn, phân loại đơn giản), Router có thể áp quy tắc "hạ cấp Model" để tiết kiệm chi phí — dựa trên field `complexity` gắn trong request (`low`/`medium`/`high`, do AI Service Layer hoặc Prompt Engine gán):

| `complexity` | Xu hướng chọn Model |
|---|---|
| `low` | Model rẻ nhất còn đáp ứng đủ (VD DeepSeek, hoặc model "mini/flash" của Provider chính) |
| `medium` | Model mặc định theo bảng mục 2 |
| `high` | Model mạnh nhất của Provider chính, bỏ qua cân nhắc chi phí |

Đây là **quy tắc định tuyến**, không phải Business Logic tính giá — số liệu chi phí thật do `AI_SECURITY.md` mục 5 (Cost Control) theo dõi.

## 5. Model Comparison

Chế độ đặc biệt (bật thủ công, VD màn hình "So sánh Model" ở `ai-center`): Router gửi **cùng 1 prompt đã lắp ráp** (Prompt Engine) tới ≥ 2 Model song song, ghi kết quả + `usage_logs` cạnh nhau (cùng `comparisonGroupId` để nhóm lại), không chọn 1 kết quả duy nhất trả về — người dùng tự so sánh chất lượng/tốc độ/chi phí trên UI. Không ảnh hưởng luồng định tuyến bình thường ở mục 2/3.

## 6. Tham chiếu

- Danh sách Provider + capability: [AI_PROVIDER.md](AI_PROVIDER.md)
- Nơi ghi nhận Cost/Usage/Token sau khi Router chọn xong: [AI_SECURITY.md](AI_SECURITY.md) mục 5
- Catalog `models` (Stage 5): [COLLECTIONS.md](COLLECTIONS.md) mục I.70
