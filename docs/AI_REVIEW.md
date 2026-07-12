# AI_REVIEW.md — Stage 7 Review

Tự đánh giá 7 tài liệu AI Gateway Architecture vừa hoàn thành (`docs/AI_GATEWAY.md`, `docs/MODEL_ROUTER.md`, `docs/PROMPT_ENGINE.md`, `docs/MEMORY_ARCHITECTURE.md`, `docs/KNOWLEDGE_ARCHITECTURE.md`, `docs/AI_PROVIDER.md`, `docs/AI_SECURITY.md`), trước khi dừng lại.

## 1. Đối chiếu với yêu cầu gốc

| Yêu cầu | Tài liệu tương ứng | Trạng thái |
|---|---|---|
| Luồng 4 tầng HTML → AI Service Layer → AI Gateway → Model Router → Provider | `AI_GATEWAY.md` mục 1/4 | ✅ |
| 8 Provider (OpenAI/Claude/Gemini/DeepSeek/MiniMax/Grok/OpenRouter/Local LLM) | `AI_PROVIDER.md` | ✅ đủ 8/8, có capability matrix |
| 15 tính năng Gateway (Model Selection → Model Comparison) | `AI_GATEWAY.md` mục 3, chi tiết ở từng tài liệu con | ✅ đủ 15/15, ánh xạ rõ nằm ở thư mục nào |
| Cấu trúc `packages/ai` (providers/gateway/router/memory/prompt/knowledge/tools/embeddings/models) | `AI_GATEWAY.md` mục 2 | ✅ đủ 9/9 thư mục yêu cầu |
| AI Router + ví dụ Marketing→Gemini/Factory→DeepSeek/Coding→Claude/Image→GPT Image/Video→MiniMax | `MODEL_ROUTER.md` mục 2 | ✅ đủ 5/5 ví dụ, mở rộng thêm toàn bộ 16 module |
| Prompt Engine (Template/System Prompt/Variables/Version) | `PROMPT_ENGINE.md` | ✅ đủ 4/4 |
| Memory (Short/Long/Conversation/Business/User) | `MEMORY_ARCHITECTURE.md` | ✅ đủ 5/5, ánh xạ rõ vào 2 collection Stage 5 |
| Knowledge (SOP/Company Docs/Products/Orders/Production/Warehouse/Finance) | `KNOWLEDGE_ARCHITECTURE.md` | ✅ đủ 7/7, phân 2 loại xử lý khác nhau (RAG vs Tool Calling) |
| Cost Control (Token/Provider/Daily/Monthly Usage) | `AI_SECURITY.md` mục 5 | ✅ đủ 4/4 |

**7/7 tài liệu yêu cầu đã xuất đủ trong `docs/`, không thiếu file nào** (đây là file thứ 8, `AI_REVIEW.md`, hoàn tất danh sách 8 file yêu cầu).

## 2. Phương pháp — bám sát nền tảng đã đóng băng

Toàn bộ thiết kế Stage 7 xây **trên nền Stage 3-6 đã có**, không phát minh lại:
- 13 collection domain AI (`ai_agents`, `ai_history`, `prompts`, `knowledge`, `workflows`, `automation`, `models`, `tokens`, `usage_logs`, `ai_insights`, `ai_forecasts`, `ai_recommendations`, `ai_memories`) từ `COLLECTIONS.md` (Stage 5, đã đóng băng) — Stage 7 **không thêm/đổi 1 field nào**, chỉ thêm tầng logic điều phối phía trên.
- `aiGatewayProxy` đã được đặt tên từ `FUNCTIONS_PLAN.md` (Stage 4) — Stage 7 là bản thiết kế chi tiết cho đúng function đó.
- 24 AI Agent persona + 3 tầng Insight/Agent/Forecast từ `AI_FLOW.md` (Stage 3) — Stage 7 không định nghĩa lại persona, chỉ định nghĩa hạ tầng chạy chung.
- `packages/database` generic helper (Stage 6) được tái sử dụng trực tiếp làm cơ chế Tool Calling truy xuất dữ liệu nghiệp vụ sống (`KNOWLEDGE_ARCHITECTURE.md` mục 3) — không thiết kế lại cách truy vấn Firestore.

## 3. Nhất quán giữa các tài liệu

- Danh sách 8 Provider xuất hiện nhất quán ở `AI_GATEWAY.md` mục 1, `MODEL_ROUTER.md` mục 3, `AI_PROVIDER.md` mục 3.
- `organizationId` là ranh giới cách ly xuyên suốt Memory (`MEMORY_ARCHITECTURE.md` mục 5), Knowledge (`KNOWLEDGE_ARCHITECTURE.md` mục 2/3), và Cost Control (`AI_SECURITY.md` mục 4/5) — không mâu thuẫn với `SECURITY_PLAN.md` Stage 5.
- Retry/Fallback (`MODEL_ROUTER.md` mục 3) và Cost Tracking (`AI_SECURITY.md` mục 5) cùng thống nhất nguồn ghi nhận là `usage_logs` — không có tài liệu nào đề xuất nguồn số liệu khác.
- Phân biệt Loại A (RAG tĩnh) và Loại B (dữ liệu sống, Tool Calling) ở `KNOWLEDGE_ARCHITECTURE.md` được `AI_GATEWAY.md` mục 3 (dòng Knowledge Base/Function Calling) tham chiếu đúng, không lẫn lộn.

## 4. Phát hiện mới trong quá trình thiết kế

1. **Business Memory và User Memory không cần collection riêng** — cả 2 chỉ khác nhau ở giá trị `scope` trong cùng `ai_memories` (đã có sẵn từ Stage 5) — phát hiện khi thiết kế `MEMORY_ARCHITECTURE.md`, đề xuất bổ sung field `scope` (không phá vỡ cấu trúc `ai_memories` gốc, chỉ làm rõ giá trị sử dụng).
2. **Rủi ro nhầm lẫn RAG với dữ liệu sống** là điểm quan trọng nhất phát hiện ở `KNOWLEDGE_ARCHITECTURE.md` mục 1 — nếu đưa Products/Orders/Warehouse/Finance qua pipeline embedding thay vì Tool Calling, AI có thể trả lời sai số liệu (ảo giác/hallucination) cho những câu hỏi cần độ chính xác tuyệt đối (số dư tồn kho, công nợ...) — đây là cảnh báo kiến trúc quan trọng cần người triển khai code thật tuân thủ nghiêm ngặt.
3. **OpenRouter đóng vai trò "Fallback trung tâm"** thay vì là 1 Provider ngang hàng có vai trò mặc định riêng — phát hiện khi thiết kế bảng Fallback (`MODEL_ROUTER.md` mục 3), giúp giảm số lượng adapter Provider cần cấu hình fallback thủ công.
4. **Chế độ `aiDataResidency: internal_only`** (Model nội bộ bắt buộc, không fallback ra ngoài) là bổ sung mới so với mọi thiết kế Security trước đó — cần thiết cho Organization có yêu cầu bảo mật dữ liệu cao, chưa từng được đề cập ở Stage 4/5.

## 5. Giới hạn của tài liệu (Limitations)

- Đây là thiết kế **khái niệm** — chưa gọi API thật, chưa kết nối Model thật, chưa có SDK/code triển khai (đúng yêu cầu Stage 7).
- Bảng capability Provider (`AI_PROVIDER.md` mục 3) là **minh hoạ dựa trên hiểu biết chung về thị trường**, cần xác nhận lại số liệu chính xác (model nào hỗ trợ Tool Calling, Embedding...) tại thời điểm tích hợp thật — thị trường AI Provider thay đổi nhanh.
- Bảng định tuyến mặc định (`MODEL_ROUTER.md` mục 2) là **đề xuất minh hoạ** dựa trên đặc tính chung của từng Provider, không phải kết quả benchmark thật trên dữ liệu MIMIN Platform — nên coi là điểm khởi đầu, cần tinh chỉnh bằng dữ liệu Model Comparison thật sau khi vận hành.
- Chưa thiết kế cụ thể Vector Store nào (Pinecone/Weaviate/pgvector/Firestore+Algolia...) cho phần Embedding (`KNOWLEDGE_ARCHITECTURE.md` mục 2) — chỉ xác định **Firestore không phù hợp**, việc chọn Vector Store cụ thể để ngoài phạm vi Stage 7 (là quyết định hạ tầng, không phải kiến trúc AI Gateway).

## 6. Sẵn sàng cho giai đoạn kế tiếp (viết code AI Gateway thật)?

| Điều kiện tiên quyết | Đạt? |
|---|---|
| Đủ 4 tầng kiến trúc (HTML→Service Layer→Gateway→Router→Provider) | ✅ |
| Đủ 8 Provider có capability matrix | ✅ |
| Đủ 15 tính năng Enterprise được ánh xạ vào thư mục cụ thể | ✅ |
| Router có chiến lược Retry/Fallback/Cost-aware rõ ràng | ✅ |
| Prompt Engine tách bạch Template/System Prompt/Variables/Version | ✅ |
| Memory phân loại rõ 5 loại, ánh xạ đúng collection Stage 5 | ✅ |
| Knowledge phân biệt rõ RAG (tĩnh) vs Tool Calling (sống) — tránh hallucination số liệu | ✅ |
| Cost Control có cơ chế chặn khi vượt hạn mức, không âm thầm tính phí thêm | ✅ |
| Đã chọn Vector Store cụ thể cho Embedding | ❌ — quyết định hạ tầng, chưa nằm trong phạm vi Stage 7 |
| Đã xác nhận capability Provider thật tại thời điểm tích hợp | ❌ — cần kiểm tra lại khi bắt đầu viết code |

**Kết luận**: Kiến trúc AI Gateway (Stage 7) đã đủ để làm tài liệu tham chiếu thiết kế hoàn chỉnh cho toàn bộ yêu cầu — luồng 4 tầng, 8 Provider, 15 tính năng Enterprise, Router/Prompt/Memory/Knowledge/Security — nhất quán với Database Architecture đã đóng băng (Stage 5) và framework Firebase Binding (Stage 6). Còn 2 quyết định hạ tầng (chọn Vector Store, xác nhận capability Provider thật) cần thực hiện ở giai đoạn viết code, ngoài phạm vi thiết kế của Stage 7.

---

**Dừng lại theo đúng yêu cầu** — không viết code/SDK, không gọi API thật, không kết nối Model thật.
