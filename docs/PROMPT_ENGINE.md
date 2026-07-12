# PROMPT_ENGINE.md — Thiết kế Prompt Engine

Prompt Engine là thư mục `packages/ai/prompt/` — chịu trách nhiệm **lắp ráp prompt cuối cùng** gửi tới Model, từ 4 thành phần: System Prompt, Prompt Template, Variables, và lịch sử phiên bản (Prompt Version). Prompt Engine **không tự quyết định Model nào** (đó là việc của Router) và **không tự lấy Memory/Knowledge** (đó là việc của Gateway điều phối) — chỉ nhận input đã có sẵn và ghép thành chuỗi prompt.

## 1. Cấu trúc Prompt cuối cùng

```
┌─────────────────────────────────────────┐
│ 1. System Prompt   (vai trò/tính cách agent, bất biến theo agent)  │
├─────────────────────────────────────────┤
│ 2. Context Injection (Memory + Knowledge, do Gateway gộp sẵn)       │
├─────────────────────────────────────────┤
│ 3. Prompt Template đã điền Variables (nội dung tác vụ cụ thể)       │
├─────────────────────────────────────────┤
│ 4. User Message (câu hỏi/lệnh mới nhất của người dùng)              │
└─────────────────────────────────────────┘
```

Thứ tự này cố định — System Prompt luôn đứng đầu (định hình hành vi model xuyên suốt), User Message luôn đứng cuối (gần nhất với phần model sinh câu trả lời, theo khuyến nghị phổ biến của hầu hết Provider).

## 2. System Prompt

- Gắn 1-1 với `ai_agents.systemPrompt` (field đã có ở Stage 5) — mỗi AI Agent persona (24 persona, `AI_FLOW.md` Stage 3) có đúng 1 System Prompt.
- System Prompt là **văn bản tĩnh**, không chứa biến động (không nhúng dữ liệu Organization cụ thể) — dữ liệu động nằm ở Context Injection (mục 4) và Prompt Template (mục 3), không trộn vào System Prompt để tránh phải sửa System Prompt mỗi khi dữ liệu đổi.
- Có thể có System Prompt "gốc" dùng chung (nguyên tắc an toàn/giọng văn thương hiệu MIMIN) + System Prompt "riêng" theo từng agent, ghép lại: `systemPromptFinal = GLOBAL_SYSTEM_PROMPT + "\n\n" + agent.systemPrompt`.

## 3. Prompt Template + Variables

- Lưu ở collection `prompts` (Stage 5) — mỗi document có `content` (chuỗi template) + `variables` (danh sách tên biến khai báo, VD `["customerName", "orderCode", "dueDate"]`).
- Cú pháp biến đề xuất: `{{variableName}}` (dấu ngoặc nhọn kép, phổ biến, dễ nhận diện, không trùng cú pháp code thật của bất kỳ ngôn ngữ lập trình nào đang dùng trong monorepo).
- Prompt Engine chỉ làm 1 việc: nhận `template.content` + object `variables` (key-value) → thay thế toàn bộ `{{key}}` bằng giá trị tương ứng. Nếu thiếu biến bắt buộc → báo lỗi rõ ràng (không âm thầm để trống).
- Ví dụ:
  ```
  Template: "Soạn email nhắc {{customerName}} thanh toán đơn {{orderCode}} trước {{dueDate}}."
  Variables: { customerName: "Công ty ABC", orderCode: "SO-202607-0012", dueDate: "20/07/2026" }
  Kết quả:  "Soạn email nhắc Công ty ABC thanh toán đơn SO-202607-0012 trước 20/07/2026."
  ```
- `isShared: true` (field đã có ở `prompts`, Stage 5) cho phép 1 Template dùng chung nhiều Organization (mẫu chuẩn nền tảng cung cấp sẵn) — Organization tự tạo Template riêng nếu `isShared: false`.

## 4. Prompt Version

- Mỗi lần sửa nội dung `template.content`, **không ghi đè** — tạo 1 document `prompts` mới với field `version` (number, tăng dần) và `parentPromptId` (FK trỏ về bản trước, tuỳ chọn) — giữ lịch sử để:
  - Rollback về bản cũ nếu bản mới cho kết quả tệ hơn.
  - So sánh chất lượng giữa các version (kết hợp Model Comparison — `MODEL_ROUTER.md` mục 5 — để so cả Model lẫn Version prompt cùng lúc).
- Field `isActive` (boolean, mới, bổ sung khái niệm) trên `prompts` xác định version nào đang được Gateway sử dụng mặc định cho 1 `agentId`; chỉ 1 version active tại 1 thời điểm cho mỗi tổ hợp agent+mục đích.

## 5. Sơ đồ lắp ráp (Prompt Engine nhận gì, trả gì)

```
Input (do Gateway truyền vào):
  - agentId                        → tra ai_agents.systemPrompt
  - promptId (hoặc suy ra từ agentId + tác vụ) → tra prompts.content (bản isActive mới nhất)
  - variables (object)             → điền vào template
  - contextInjection (string, đã gộp sẵn từ Memory + Knowledge — Gateway chuẩn bị)
  - userMessage (string)

Output:
  - finalPrompt (string hoặc mảng message theo format Provider — xem AI_PROVIDER.md mục 2)
  - promptMetadata { agentId, promptId, promptVersion } → Gateway đính kèm vào
    usage_logs/ai_history để truy vết sau này prompt nào tạo ra kết quả nào
```

## 6. Tham chiếu

- Nguồn Context Injection (Memory + Knowledge): [MEMORY_ARCHITECTURE.md](MEMORY_ARCHITECTURE.md), [KNOWLEDGE_ARCHITECTURE.md](KNOWLEDGE_ARCHITECTURE.md)
- Định dạng message cuối cùng theo từng Provider: [AI_PROVIDER.md](AI_PROVIDER.md) mục 2
- Collection `prompts`/`ai_agents`: [COLLECTIONS.md](COLLECTIONS.md) mục A.10, mục I.66
