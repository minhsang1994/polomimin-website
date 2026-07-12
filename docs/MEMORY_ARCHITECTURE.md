# MEMORY_ARCHITECTURE.md — Thiết kế Memory

Memory là thư mục `packages/ai/memory/` — chịu trách nhiệm cung cấp **ngữ cảnh về quá khứ** cho Gateway trước khi gọi Model (khác `knowledge/` — cung cấp ngữ cảnh về **tài liệu/dữ liệu nghiệp vụ**, xem `KNOWLEDGE_ARCHITECTURE.md`). 5 loại Memory yêu cầu ánh xạ vào 2 collection Firestore đã có ở Stage 5 (`ai_history`, `ai_memories`) theo bảng dưới — **không thêm collection mới**, chỉ phân loại cách dùng.

## 1. Bảng ánh xạ 5 loại Memory

| Loại Memory | Phạm vi | Nguồn dữ liệu | Thời gian sống |
|---|---|---|---|
| **Short Memory** | N lượt hội thoại gần nhất trong 1 phiên | `ai_history` (lọc theo `agentId`+`uid`, `orderBy createdAt desc limit N`) | Hết phiên hoặc hết cửa sổ ngữ cảnh (token budget) |
| **Long Memory** | Thông tin đã chắt lọc, còn giá trị qua nhiều phiên | `ai_memories` | Theo `expiresAt` (có thể `null` = không hết hạn) |
| **Conversation Memory** | Toàn bộ 1 luồng hội thoại cụ thể (không giới hạn N lượt như Short Memory) | `ai_history` (toàn bộ document cùng 1 `conversationId`) | Theo TTL `ai_history` đã đề xuất ở `INDEX_PLAN.md` Stage 5 (6 tháng) |
| **Business Memory** | Thông tin AI học được về **doanh nghiệp** (không riêng 1 user) | `ai_memories` với `uid = null`/`scope = "organization"` (mở rộng field `memoryType`, xem mục 2) | Dài hạn, gắn theo `organizationId` |
| **User Memory** | Thông tin AI học được về **1 người dùng cụ thể** (sở thích, cách hỏi quen thuộc) | `ai_memories` với `uid` cụ thể | Dài hạn, gắn theo `uid` |

**Ghi chú quan trọng**: `Business Memory` và `User Memory` **không phải 2 collection khác nhau** — cả 2 đều là document trong `ai_memories` (Stage 5), chỉ khác ở việc `uid` có giá trị cụ thể (User Memory) hay đại diện cho cả Organization (Business Memory). Đây là cách phân loại **theo phạm vi** (scope), không phải theo cấu trúc lưu trữ.

## 2. Mở rộng field cho `ai_memories` (không đổi cấu trúc gốc, chỉ làm rõ giá trị enum)

`ai_memories.memoryType` (đã có ở Stage 5: `preference/fact/summary`) kết hợp thêm khái niệm **scope** để phân biệt Business vs User Memory:

| `memoryType` | `scope` (mới, đề xuất bổ sung) | Ví dụ |
|---|---|---|
| `preference` | `user` | "User X thích nhận báo cáo dạng bảng, không thích văn xuôi dài" |
| `fact` | `user` | "User X là Trưởng phòng Kho, thường hỏi về tồn kho NVL" |
| `fact` | `organization` (Business Memory) | "Công ty thường xuất hàng vào thứ 6 hàng tuần" |
| `summary` | `organization` (Business Memory) | "Tóm tắt: quý 2/2026 công ty tập trung mở rộng dòng sản phẩm X" |

## 3. Chiến lược lấy Memory vào Context (Retrieval)

Gateway (không phải Memory tự quyết định) gọi Memory theo thứ tự ưu tiên khi build Context Injection, có **ngân sách token** giới hạn (VD tối đa 20% cửa sổ ngữ cảnh dành cho Memory, phần còn lại dành Knowledge + hội thoại hiện tại):

```
1. Lấy Short Memory (N lượt gần nhất, N mặc định = 10, có thể chỉnh theo Model context window)
2. Lấy Long Memory liên quan — ưu tiên theo `lastUsedAt` gần nhất + khớp `agentId`
3. Nếu còn ngân sách token, lấy thêm Business Memory liên quan tới `moduleSlug` đang hỏi
4. Cắt bớt (truncate) theo thứ tự ưu tiên ngược lại nếu vượt ngân sách:
   bỏ Business Memory trước → bỏ bớt Long Memory → KHÔNG BAO GIỜ bỏ Short Memory gần nhất
   (mất ngữ cảnh hội thoại vừa nói sẽ khiến AI trả lời lạc đề ngay lập tức)
```

## 4. Ghi Memory sau khi có phản hồi (Write-back)

Sau mỗi lượt hội thoại, Gateway:
1. **Luôn** ghi 1 document mới vào `ai_history` (Short/Conversation Memory — ghi thô, không chọn lọc).
2. **Có điều kiện** ghi/cập nhật `ai_memories` (Long/Business/User Memory) — chỉ khi phát hiện thông tin "đáng nhớ" (VD user nói rõ 1 sở thích, hoặc model tự tóm tắt 1 hội thoại dài thành `summary`). Đây là bước **có chọn lọc**, tránh `ai_memories` phình to vô tội vạ với mọi câu nói vãng lai.
3. Cập nhật `lastUsedAt` của `ai_memories` mỗi khi 1 memory được dùng lại (phục vụ retrieval mục 3 ưu tiên theo độ mới).

## 5. Cách ly theo Organization (nhắc lại, không đổi so với Stage 5)

Mọi Memory (`ai_history`, `ai_memories`) đều mang `organizationId` bắt buộc (`FIELD_STANDARD.md` Stage 5 mục 3) — Business Memory của Organization A **không bao giờ** rò rỉ sang Organization B dù dùng chung 1 AI Agent persona. Đây là ranh giới bảo mật cứng, không phải tuỳ chọn — chi tiết ở `AI_SECURITY.md` mục 4.

## 6. Tham chiếu

- Collection nền: [COLLECTIONS.md](COLLECTIONS.md) mục A.11 (`ai_history`), mục I.72d (`ai_memories`)
- Cách Gateway gộp Memory + Knowledge thành Context Injection: [AI_GATEWAY.md](AI_GATEWAY.md) mục 4
- Cách ly dữ liệu theo Organization: [AI_SECURITY.md](AI_SECURITY.md) mục 4
