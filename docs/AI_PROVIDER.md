# AI_PROVIDER.md — Thiết kế lớp trừu tượng Provider

Provider là thư mục `packages/ai/providers/` — mỗi Provider (OpenAI, Anthropic Claude, Google Gemini, DeepSeek, MiniMax, Grok, OpenRouter, Model nội bộ) có **1 adapter riêng**, nhưng tất cả implement **cùng 1 interface chung** — để `router/` và `gateway/` gọi bất kỳ Provider nào theo đúng 1 cách, không cần biết chi tiết bên trong.

## 1. Interface chung (khái niệm, không phải code thật)

Mọi Provider adapter cung cấp tối thiểu các thao tác sau (tên minh hoạ):

| Thao tác | Mô tả |
|---|---|
| `chat(messages, options)` | Gửi hội thoại (system + context + user message), nhận về 1 câu trả lời đầy đủ |
| `chatStream(messages, options)` | Giống `chat` nhưng trả về token/đoạn nhỏ dần dần (Streaming) |
| `callWithTools(messages, tools, options)` | Gửi kèm danh sách Tool khả dụng (Function/Tool Calling), Model có thể yêu cầu gọi Tool thay vì trả lời thẳng |
| `embed(text)` | Tạo vector embedding cho 1 đoạn văn bản (dùng cho `embeddings/`, không phải Provider nào cũng hỗ trợ — xem mục 3) |
| `listModels()` | Liệt kê model khả dụng của Provider đó (đồng bộ với catalog `models`, Stage 5) |

Tham số `options` dùng chung mọi Provider: `{ model, temperature, maxTokens, stopSequences }` — adapter tự dịch sang tham số riêng của API gốc Provider đó.

## 2. Chuẩn hoá định dạng message

Mỗi Provider có định dạng "message" hơi khác nhau (OpenAI dùng `role: system/user/assistant`, Claude tách System Prompt ra khỏi mảng message, Gemini dùng `role: user/model`...). `providers/` chịu trách nhiệm **dịch** từ 1 định dạng chuẩn nội bộ (do `prompt/` — `PROMPT_ENGINE.md` — sinh ra) sang định dạng riêng của từng Provider trước khi gọi — phần còn lại của hệ thống (Gateway, Router, Prompt Engine) **không cần biết** sự khác biệt này.

## 3. Bảng năng lực Provider (capability matrix — minh hoạ, cần xác nhận lại số liệu thật khi tích hợp)

| Provider | Chat | Streaming | Function/Tool Calling | Embedding | Image | Video | Ghi chú định tuyến |
|---|---|---|---|---|---|---|---|
| OpenAI | ✅ | ✅ | ✅ | ✅ | ✅ (GPT Image) | ❌ | Mặc định cho `image_generation` (`MODEL_ROUTER.md`) |
| Anthropic Claude | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | Mặc định cho `coding`, `crm`/`business-os`/`finance` |
| Google Gemini | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (giới hạn) | Mặc định cho `marketing`, `training-center`, `long_document_reasoning` |
| DeepSeek | ✅ | ✅ | ✅ (giới hạn) | ❌ | ❌ | ❌ | Mặc định cho `factory-os`/`production`/`warehouse`/`automation` (chi phí thấp) |
| MiniMax | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | Mặc định cho `video_generation` |
| Grok | ✅ | ✅ | ✅ (giới hạn) | ❌ | ❌ | ❌ | Fallback phụ, chưa có vai trò mặc định |
| OpenRouter | ✅ (proxy nhiều model) | ✅ (tuỳ model gốc) | ✅ (tuỳ model gốc) | ✅ (tuỳ model gốc) | tuỳ model gốc | tuỳ model gốc | Vai trò **Fallback trung tâm** (`MODEL_ROUTER.md` mục 3), không phải Provider chính mặc định cho module nào |
| Model nội bộ (Local LLM) | ✅ | tuỳ hạ tầng triển khai | tuỳ model | tuỳ model | ❌ | ❌ | Dùng khi Organization bật chế độ "không gửi dữ liệu ra ngoài" (`AI_SECURITY.md` mục 3) |

Bảng này đồng bộ với collection `models` (Stage 5) — mỗi document `models/{modelSlug}` có field `provider` khớp cột đầu bảng trên; khi thêm Provider/Model mới chỉ cần thêm document, không cần đổi kiến trúc.

## 4. Quản lý cấu hình (API Key, endpoint)

- **Không lưu API key trong code hay trong Firestore client-side đọc được** — chỉ lưu ở biến môi trường phía Cloud Function (`aiGatewayProxy`, `FUNCTIONS_PLAN.md` Stage 4) hoặc Secret Manager (GCP) — chi tiết bảo mật ở `AI_SECURITY.md` mục 1.
- Mỗi adapter Provider đọc đúng 1 key riêng của mình (VD `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`...) — không dùng chung 1 key cho nhiều Provider.
- `baseUrl`/`endpoint` có thể cấu hình được (không hard-code) — cần thiết riêng cho Model nội bộ (Local LLM, endpoint tự lưu trữ) và OpenRouter (1 endpoint, nhiều model chọn qua tham số).

## 5. Vì sao cần lớp trừu tượng thay vì gọi thẳng SDK mỗi Provider ở Gateway

- Đổi Provider mặc định cho 1 module (`MODEL_ROUTER.md` mục 2) chỉ là đổi **dữ liệu cấu hình**, không đổi code Gateway.
- Thêm Provider mới (VD sau này có model tiếng Việt chuyên biệt) chỉ cần viết 1 adapter mới tuân thủ interface mục 1, không đụng tới `gateway/`/`router/`/`prompt/`.
- Model Comparison (`MODEL_ROUTER.md` mục 5) gọi được nhiều Provider cùng lúc dễ dàng vì tất cả cùng 1 interface.

## 6. Tham chiếu

- Cách Router chọn Provider: [MODEL_ROUTER.md](MODEL_ROUTER.md)
- Bảo mật API key: [AI_SECURITY.md](AI_SECURITY.md) mục 1
- Catalog `models`: [COLLECTIONS.md](COLLECTIONS.md) mục I.70
