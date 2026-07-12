# AI_GATEWAY.md — Kiến trúc Tổng thể AI Gateway (Stage 7)

Stage 7 thiết kế **AI Gateway chuẩn Enterprise** cho MIMIN Platform — nơi **mọi request AI của 16 module đều đi qua 1 cổng duy nhất**, không module nào gọi thẳng provider AI ngoài. Đây là điểm vào chính (master overview); chi tiết từng mảng nằm ở 6 tài liệu chuyên biệt cùng thư mục `docs/`.

**Ràng buộc không đổi**: chỉ thiết kế kiến trúc — không viết SDK/code, không gọi API thật, không kết nối model thật, không viết Business Logic/Workflow/Automation.

## 1. Luồng tổng thể (4 tầng)

```
HTML (199 trang pages/*.html, hoặc apps/dashboard·admin·... sau này)
   │  gọi qua assets/js/firebase-client.js (Stage 6) hoặc packages/database generic helper
   ▼
AI Service Layer
   │  lớp mỏng phía client — không chứa API key, không gọi provider trực tiếp;
   │  chỉ gói request (agentId/moduleSlug, prompt, uid, orgId) rồi gọi Cloud Function
   ▼
AI Gateway  ── aiGatewayProxy (Cloud Function, đã đặt tên ở FUNCTIONS_PLAN.md Stage 4)
   │  điểm hội tụ DUY NHẤT — xác thực, áp Permission, nạp Prompt/Memory/Knowledge,
   │  quyết định có cần Function/Tool Calling không, ghi Cost/Usage/Token Tracking
   ▼
Model Router
   │  chọn Provider + Model phù hợp theo module/task-type (xem MODEL_ROUTER.md),
   │  xử lý Retry/Fallback nếu Provider chính lỗi
   ▼
Provider (OpenAI / Anthropic Claude / Google Gemini / DeepSeek / MiniMax / Grok /
          OpenRouter / Model nội bộ — xem AI_PROVIDER.md)
```

**Nguyên tắc bất biến**: không tầng nào phía trên "AI Gateway" được phép biết chi tiết Provider nào đang được dùng, hay giữ API key. Toàn bộ 16 module (kể cả module chưa triển khai) khi cần AI đều gọi cùng 1 hợp đồng request/response của AI Gateway — không có đường tắt.

## 2. Cấu trúc package đề xuất: `packages/ai`

**Chỉ là thiết kế thư mục (chưa tạo file/code thật)** — khi triển khai thật, `packages/ai` sẽ là 1 workspace package mới (`@mimin/ai`), theo đúng quy ước monorepo đã có (`packages/core`, `packages/database`...):

```
packages/ai/
├── providers/       # 1 adapter/provider (OpenAI, Claude, Gemini...) — xem AI_PROVIDER.md
├── gateway/         # Điểm hội tụ request — xác thực, điều phối các bước, ghi log
├── router/          # Model Router — chọn Provider/Model theo module/task-type — xem MODEL_ROUTER.md
├── memory/          # Short/Long/Conversation/Business/User Memory — xem MEMORY_ARCHITECTURE.md
├── prompt/          # Prompt Template, System Prompt, Variables, Version — xem PROMPT_ENGINE.md
├── knowledge/        # SOP/Company Docs/dữ liệu nghiệp vụ sống — xem KNOWLEDGE_ARCHITECTURE.md
├── tools/            # Định nghĩa Function Calling/Tool Calling khả dụng cho AI Agent
├── embeddings/        # Pipeline tạo vector embedding cho Knowledge (RAG)
└── models/            # Danh mục model + capability matrix (đồng bộ với Firestore `models`, Stage 5)
```

Package này **tiêu thụ trực tiếp** `packages/database` (đọc/ghi `ai_agents`/`ai_history`/`prompts`/`knowledge`/`workflows`/`automation`/`models`/`tokens`/`usage_logs`/`ai_insights`/`ai_forecasts`/`ai_recommendations`/`ai_memories` — 13 collection AI đã thiết kế ở Stage 5) — không định nghĩa lại schema, chỉ thêm tầng logic điều phối phía trên.

## 3. Ánh xạ 15 tính năng Enterprise yêu cầu vào kiến trúc

| Tính năng | Nằm ở tầng/thư mục nào | Ghi chú |
|---|---|---|
| Model Selection | `router/` | Xem `MODEL_ROUTER.md` |
| Prompt Template | `prompt/` | Xem `PROMPT_ENGINE.md` |
| System Prompt | `prompt/` | Gắn theo từng `ai_agents.systemPrompt` (Stage 5) |
| Conversation Memory | `memory/` | Xem `MEMORY_ARCHITECTURE.md` |
| Context Injection | `gateway/` (điều phối) + `knowledge/`/`memory/` (nguồn dữ liệu) | Gateway gộp Memory + Knowledge thành context trước khi gửi Provider |
| Knowledge Base | `knowledge/` + `embeddings/` | Xem `KNOWLEDGE_ARCHITECTURE.md` |
| Function Calling | `tools/` | Định nghĩa function schema dùng chung nhiều Provider |
| Tool Calling | `tools/` | Đồng nghĩa Function Calling ở 1 số Provider (OpenAI gọi "function calling", Claude gọi "tool use") — `tools/` trừu tượng hoá chung 1 tên gọi |
| Streaming | `gateway/` + `providers/` | Gateway forward stream token-by-token, mỗi Provider adapter tự implement streaming riêng theo API gốc |
| Retry | `router/` | Retry cùng Provider trước khi Fallback sang Provider khác |
| Fallback | `router/` | Chuyển Provider/Model khác khi Retry vẫn lỗi — xem `MODEL_ROUTER.md` mục 3 |
| Cost Tracking | `gateway/` ghi vào Firestore `usage_logs` | Xem `AI_SECURITY.md` mục 5 (Cost Control) |
| Usage Tracking | `gateway/` ghi vào `usage_logs`/`ai_history` | |
| Token Tracking | `gateway/` đọc từ response Provider, ghi `usage_logs.tokensInput/tokensOutput`, trừ vào `tokens.usedThisMonth` (Stage 5) | |
| Model Comparison | `router/` (chế độ so sánh) | Gửi cùng 1 prompt tới ≥ 2 Model, ghi kết quả cạnh nhau — xem `MODEL_ROUTER.md` mục 5 |

## 4. Sơ đồ trình tự 1 request điển hình

```
1. HTML/App gọi AI Service Layer: { agentId, moduleSlug, uid, orgId, userMessage }
2. AI Service Layer gọi Cloud Function aiGatewayProxy (không đính kèm API key nào)
3. Gateway xác thực (Firebase Auth token) + kiểm tra Permission (resource "ai-center")
4. Gateway đọc ai_agents.systemPrompt + prompts (Prompt Engine lắp ráp prompt cuối)
5. Gateway đọc ai_memories (Long Memory) + N lượt gần nhất trong ai_history (Short Memory)
6. Gateway truy vấn knowledge (RAG semantic search) + dữ liệu nghiệp vụ sống liên quan
   (VD orders/inventory đang mở) → gộp thành Context Injection
7. Gateway kiểm tra tokens.usedThisMonth còn hạn mức không (Cost Control)
8. Router chọn Provider + Model theo moduleSlug/task-type (MODEL_ROUTER.md)
9. Provider adapter gọi model thật (NGOÀI PHẠM VI STAGE 7 — chưa kết nối thật),
   hỗ trợ Streaming nếu client yêu cầu
10. Nếu lỗi → Retry cùng Provider → vẫn lỗi → Fallback Provider khác (MODEL_ROUTER.md)
11. Gateway ghi ai_history (nội dung hội thoại), usage_logs (chi phí/token/latency),
    cập nhật ai_memories nếu phát hiện thông tin nên nhớ dài hạn
12. Trả kết quả về AI Service Layer → HTML/App
```

## 5. Đối chiếu với các Stage trước

- **AI_FLOW.md (Stage 3)**: 24 AI Agent persona + mô hình 3 tầng (Insight/Agent/Forecast) là **nội dung nghiệp vụ** chạy trên hạ tầng Gateway này — Stage 7 không định nghĩa lại persona, chỉ định nghĩa **hạ tầng chạy chung** cho mọi persona.
- **FIREBASE_ARCHITECTURE.md/FUNCTIONS_PLAN.md (Stage 4)**: `aiGatewayProxy` đã được đặt tên trước — Stage 7 là bản thiết kế chi tiết cho đúng function đó, không đổi tên/vị trí.
- **COLLECTIONS.md (Stage 5)**: 13 collection domain AI (`ai_agents`, `ai_history`, `prompts`, `knowledge`, `workflows`, `automation`, `models`, `tokens`, `usage_logs`, `ai_insights`, `ai_forecasts`, `ai_recommendations`, `ai_memories`) là **kho dữ liệu** mà `packages/ai` đọc/ghi — Database Architecture đã đóng băng (Stage 5), Stage 7 không đổi schema, chỉ dùng.

## 6. Tham chiếu

- Model Router chi tiết: [MODEL_ROUTER.md](MODEL_ROUTER.md)
- Prompt Engine chi tiết: [PROMPT_ENGINE.md](PROMPT_ENGINE.md)
- Memory chi tiết: [MEMORY_ARCHITECTURE.md](MEMORY_ARCHITECTURE.md)
- Knowledge chi tiết: [KNOWLEDGE_ARCHITECTURE.md](KNOWLEDGE_ARCHITECTURE.md)
- Provider chi tiết: [AI_PROVIDER.md](AI_PROVIDER.md)
- Bảo mật: [AI_SECURITY.md](AI_SECURITY.md)
- Dữ liệu nền: [COLLECTIONS.md](COLLECTIONS.md) domain I (AI)
- Cloud Function triển khai thật: [FUNCTIONS_PLAN.md](FUNCTIONS_PLAN.md) mục 3 (AI Gateway)
