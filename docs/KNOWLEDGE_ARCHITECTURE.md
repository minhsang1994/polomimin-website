# KNOWLEDGE_ARCHITECTURE.md — Thiết kế Knowledge

Knowledge là thư mục `packages/ai/knowledge/` (+ `packages/ai/embeddings/` cho phần vector hoá) — cung cấp **ngữ cảnh về tài liệu/dữ liệu nghiệp vụ** cho Gateway (khác `memory/` — ngữ cảnh về **quá khứ hội thoại**, xem `MEMORY_ARCHITECTURE.md`). Yêu cầu Stage 7 liệt kê 7 nguồn: SOP, Company Docs, Products, Orders, Production, Warehouse, Finance — phân làm **2 loại bản chất khác nhau**, xử lý khác nhau.

## 1. Hai loại Knowledge — phân biệt bắt buộc

| Loại | Đặc điểm | Nguồn trong 7 yêu cầu | Cách truy xuất |
|---|---|---|---|
| **A. Tri thức tĩnh (Unstructured)** | Văn bản dài, ít đổi, cần AI "hiểu ý" chứ không tra chính xác | SOP, Company Docs | RAG (semantic search qua embedding) — xem mục 2 |
| **B. Dữ liệu nghiệp vụ sống (Structured)** | Số liệu thay đổi liên tục, cần **chính xác tuyệt đối**, không được để AI "đoán" | Products, Orders, Production, Warehouse, Finance | Truy vấn trực tiếp Firestore theo `organizationId`/`workspaceId` (KHÔNG qua embedding) — xem mục 3 |

**Nguyên tắc quan trọng nhất của tài liệu này**: không bao giờ đưa dữ liệu nghiệp vụ sống (loại B) qua pipeline embedding rồi để AI "nhớ mang máng" — số dư tồn kho, số tiền hoá đơn, trạng thái đơn hàng... phải là **số liệu thật lấy trực tiếp từ Firestore tại thời điểm hỏi**, không phải suy luận từ vector gần đúng. Nhầm lẫn 2 loại này là lỗi kiến trúc nghiêm trọng nhất có thể mắc phải khi triển khai AI Gateway.

## 2. Loại A — Tri thức tĩnh (SOP, Company Docs)

Pipeline (thư mục `embeddings/`):

```
1. Nguồn: file trong Storage (`documents/sop/`, `documents/policies/` — STORAGE_STRUCTURE.md Stage 4)
2. Ghi metadata vào collection `knowledge` (Stage 5): title, sourceFileId, content/chunks
3. Chia nhỏ (chunking): cắt văn bản dài thành đoạn ~300-500 token/đoạn, giữ ngữ cảnh chồng lấn nhẹ
4. Tạo embedding: gửi từng chunk qua Embedding Model (của 1 trong các Provider — AI_PROVIDER.md
   mục 3) → vector số thực
5. Lưu vector vào Vector Store NGOÀI Firestore (Firestore không tối ưu cho vector search quy mô
   lớn — đã ghi chú ở `FIRESTORE_STRUCTURE.md` Stage 4 mục 8); `knowledge.embeddingRef` chỉ lưu
   CON TRỎ tham chiếu tới vị trí vector trong store ngoài đó
6. Khi cần: query semantic search (top-K đoạn liên quan nhất theo độ tương đồng vector) →
   trả về K đoạn văn bản gốc → đưa vào Context Injection
```

Truy xuất **luôn giới hạn theo `organizationId`** (mỗi Organization chỉ tìm kiếm trong SOP/Company Docs của chính họ) — trừ 1 số Knowledge nền tảng dùng chung do MIMIN cung cấp sẵn (đánh dấu field tương tự `isShared` như `prompts`, Stage 5).

## 3. Loại B — Dữ liệu nghiệp vụ sống (Products/Orders/Production/Warehouse/Finance)

**Không dùng RAG.** Gateway gọi thẳng `packages/database` generic helper (`listScoped`/`getScopedDoc` — đã xây ở Stage 6) để lấy số liệu thật, theo đúng `organizationId`/`workspaceId` của request:

| Nguồn yêu cầu | Collection Firestore thật (Stage 5) | Ví dụ câu hỏi cần loại B |
|---|---|---|
| Products | `products`, `product_variants`, `inventory` | "Sản phẩm áo sơ mi trắng còn bao nhiêu trong kho?" |
| Orders | `orders`, `order_items`, `invoices` | "Đơn hàng SO-202607-0012 đang ở trạng thái nào?" |
| Production | `production_orders`, `production_steps`, `quality_checks` | "Lệnh sản xuất PO-202607-005 đã hoàn thành công đoạn nào?" |
| Warehouse | `inventory`, `inventory_transactions`, `stock_counts` | "Kho A còn tồn bao nhiêu vải cotton?" |
| Finance | `invoices`, `debts`, `ledger_entries` | "Công nợ phải thu của khách hàng ABC là bao nhiêu?" |

Cơ chế: Gateway/Tool Calling (xem `AI_GATEWAY.md` mục 3 — "Function Calling/Tool Calling") định nghĩa các "Tool" tương ứng (VD tool `getInventoryBySku`, tool `getOrderStatus`) — model được phép **gọi Tool** để lấy số liệu chính xác thay vì tự bịa, đây chính là cách loại B được "tiêm" vào hội thoại đúng chuẩn Enterprise (Function Calling/Tool Calling, không phải Context Injection tĩnh nạp sẵn toàn bộ dữ liệu — vì dữ liệu sống quá lớn để nhét hết vào prompt).

## 4. Sơ đồ tổng hợp Context Injection (Gateway gộp cả 2 loại + Memory)

```
Context Injection cuối cùng gửi kèm prompt =
   Top-K đoạn Knowledge tĩnh liên quan (Loại A, semantic search)
 + Danh sách Tool khả dụng (Loại B — model tự gọi khi cần, không nạp sẵn số liệu)
 + Short/Long/Business/User Memory (MEMORY_ARCHITECTURE.md)
```

## 5. Knowledge theo Domain nào (đối chiếu 11 domain Stage 5)

| Nguồn yêu cầu Stage 7 | Domain COLLECTIONS.md tương ứng |
|---|---|
| SOP, Company Docs | CORE (`files`) + `knowledge` (loại A) |
| Products | SALES |
| Orders | SALES |
| Production | FACTORY |
| Warehouse | WAREHOUSE |
| Finance | FINANCE |

CRM, HR, ACADEMY, LOGISTICS **không nằm trong 7 nguồn Stage 7 yêu cầu** — không có nghĩa là bị loại trừ vĩnh viễn, chỉ là chưa được yêu cầu thiết kế Tool truy xuất ở stage này; cơ chế Tool Calling ở mục 3 áp dụng được cho bất kỳ domain nào khi cần mở rộng sau này (không cần đổi kiến trúc, chỉ cần định nghĩa thêm Tool mới).

## 6. Tham chiếu

- Collection `knowledge`: [COLLECTIONS.md](COLLECTIONS.md) mục I.67
- Storage SOP/Company Docs: [STORAGE_STRUCTURE.md](STORAGE_STRUCTURE.md) mục 4
- Extension tìm kiếm gợi ý (Algolia/BigQuery): [FIREBASE_ARCHITECTURE.md](FIREBASE_ARCHITECTURE.md) mục 3
- Generic helper truy vấn Loại B: `packages/database` (`listScoped`/`getScopedDoc` — Stage 6)
- Định nghĩa Tool cụ thể: [AI_GATEWAY.md](AI_GATEWAY.md) mục 2 (thư mục `tools/`)
