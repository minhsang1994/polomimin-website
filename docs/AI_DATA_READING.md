# AI_DATA_READING.md — Bước 8: AI Đọc Dữ liệu Thật (Cross-Domain Tool Calling)

**Chỉ thiết kế — không viết code, không gọi API/Model thật, không kết nối Firebase thật.** Tài liệu này cụ thể hoá cơ chế **Tool Calling** đã đặt tên ở `AI_GATEWAY.md`/`KNOWLEDGE_ARCHITECTURE.md` (Stage 7) thành 1 chuỗi Tool thật, giải quyết đúng ví dụ đã cho:

```
AI
 ↓
Đọc Firestore
 ↓
Đơn hàng (orders)
 ↓
Kho (inventory)
 ↓
Sản xuất (production_orders / mrp_results)
 ↓
Đưa đề xuất (ai_insights + ai_recommendations)
```

Đây chính là điểm khác biệt giữa "AI chatbot trả lời chung chung" và **"AI doanh nghiệp"**: AI không chỉ trò chuyện — nó **tự đọc số liệu thật xuyên nhiều domain** rồi tổng hợp thành 1 đề xuất hành động cụ thể, đúng nguyên tắc Loại B (dữ liệu sống, không qua RAG) đã chốt ở `KNOWLEDGE_ARCHITECTURE.md` mục 1/3.

## 1. Bài toán cụ thể: "Đơn hàng này có giao được không?"

Đây là kịch bản mẫu — 1 trong nhiều kịch bản Cross-Domain có thể xây theo cùng khuôn mẫu (mục 6 liệt kê thêm ví dụ khác). Câu hỏi người dùng (hoặc trigger tự động khi 1 `orders` mới được tạo): **"Đơn hàng SO-202607-0012 có đủ hàng giao không? Nếu không thì bao giờ giao được?"**

## 2. Chuỗi 3 Tool cụ thể

Mỗi Tool là 1 hàm thuần đọc dữ liệu (không ghi, không quyết định) — nằm trong `packages/ai/tools/` (đã đặt tên thư mục ở `AI_GATEWAY.md` Stage 7), gọi qua `packages/database` generic helper (`getScopedDoc`/`listScoped`, Stage 6). Model chỉ được phép gọi đúng 3 Tool này cho kịch bản này (whitelist theo `agentId` — nguyên tắc chống Prompt Injection đã nêu ở `AI_SECURITY.md` mục 2).

### Tool 1 — `getOrderDetails`
| | |
|---|---|
| Mục đích | Lấy chi tiết 1 đơn hàng cần kiểm tra |
| Input | `{ organizationId, orderId }` |
| Đọc collection | `orders`, `order_items` (Stage 5, domain SALES) |
| Output | `{ orderCode, customerId, dueDate, status, items: [{ productId, sku, quantity }] }` |

### Tool 2 — `checkInventoryAvailability`
| | |
|---|---|
| Mục đích | Kiểm tra tồn kho khả dụng cho từng sản phẩm trong đơn |
| Input | `{ organizationId, sku, warehouseId? }` |
| Đọc collection | `inventory` (Stage 5, domain WAREHOUSE) |
| Output | `{ sku, quantityOnHand, quantityReserved, quantityAvailable }` (= `quantityOnHand - quantityReserved`) |

### Tool 3 — `checkProductionCapacity`
| | |
|---|---|
| Mục đích | Nếu tồn kho không đủ, kiểm tra khả năng sản xuất bù |
| Input | `{ organizationId, productId, quantityNeeded }` |
| Đọc collection | `production_orders`, `mrp_results`, `bom`, `materials`, `inventory` (NVL), `work_centers` (Stage 5, domain FACTORY/WAREHOUSE) |
| Output | `{ hasActiveProductionOrder, estimatedCompletionDate, missingMaterials: [{ materialId, quantityShort }] }` |

## 3. Quy tắc tổng hợp thành đề xuất (decision logic — đặc tả, không phải code)

Gateway (không phải Tool) chạy quy tắc sau **sau khi** đã gọi đủ Tool cần thiết (Tool 3 chỉ gọi nếu Tool 2 báo thiếu hàng — không gọi thừa để tiết kiệm chi phí, đúng nguyên tắc Cost-aware Routing `MODEL_ROUTER.md` mục 4):

```
Bước 1: Gọi getOrderDetails(orderId) → danh sách sản phẩm + số lượng cần

Bước 2: Với mỗi sản phẩm, gọi checkInventoryAvailability(sku)
   → Nếu quantityAvailable >= quantity CHO TẤT CẢ sản phẩm:
        Kết luận: "Đủ hàng — có thể giao ngay"
        → dừng, không cần Bước 3

Bước 3 (chỉ chạy nếu Bước 2 thiếu hàng): với sản phẩm thiếu,
   gọi checkProductionCapacity(productId, thiếu = quantity - quantityAvailable)
   → Nếu missingMaterials rỗng VÀ hasActiveProductionOrder = true:
        Kết luận: "Thiếu {thiếu} {sku}, đang sản xuất, dự kiến xong {estimatedCompletionDate}"
   → Nếu missingMaterials rỗng VÀ hasActiveProductionOrder = false:
        Kết luận: "Thiếu {thiếu} {sku}, đủ NVL nhưng CHƯA có lệnh sản xuất — đề xuất tạo production_order"
   → Nếu missingMaterials khác rỗng:
        Kết luận: "Thiếu {thiếu} {sku} VÀ thiếu NVL {missingMaterials} — đề xuất tạo purchase request trước"
```

Đây là **luật quyết định** (business rule ở mức thiết kế) mà model AI sẽ dùng để diễn giải kết quả 3 Tool thành câu trả lời tự nhiên — bản thân luật này khi triển khai thật có thể nằm ở Prompt (hướng dẫn model tự suy luận từ dữ liệu Tool trả về) hoặc ở code Gateway (tính sẵn kết luận rồi mới đưa model diễn đạt lại cho tự nhiên) — **quyết định kỹ thuật này để dành cho lúc viết code thật**, Stage 8 chỉ xác định **luật đúng là gì**.

## 4. Ví dụ minh hoạ end-to-end (số liệu giả định, không phải dữ liệu thật)

```
Input:  "Kiểm tra đơn SO-202607-0012"

Tool 1 → { items: [{ sku: "AO-SOMI-TRANG-M", quantity: 500 }], dueDate: "25/07/2026" }

Tool 2 → { sku: "AO-SOMI-TRANG-M", quantityOnHand: 320, quantityReserved: 20,
           quantityAvailable: 300 }
         → Thiếu 200 cái

Tool 3(productId, quantityNeeded=200) →
         { hasActiveProductionOrder: true, estimatedCompletionDate: "22/07/2026",
           missingMaterials: [] }

Đề xuất cuối cùng (AI trả lời):
"Đơn SO-202607-0012 cần 500 áo sơ mi trắng size M. Kho hiện có 300 cái khả dụng,
thiếu 200 cái. Đã có lệnh sản xuất đang chạy, dự kiến hoàn thành 22/07/2026 —
TRƯỚC hạn giao 25/07/2026 nên vẫn kịp. Không cần hành động thêm."

→ Ghi vào `ai_insights`: { severity: "info", message: "Đơn SO-202607-0012 kịp giao,
   đang chờ sản xuất bổ sung 200 cái" }
→ Không tạo `ai_recommendations` (vì không cần hành động — chỉ tạo recommendation
   khi kết luận là "CHƯA có lệnh sản xuất" hoặc "thiếu NVL", tức cần ai đó hành động)
```

Nếu thay đổi giả định: `hasActiveProductionOrder: false` → sẽ ghi thêm `ai_recommendations`: `{ actionType: "create_production_order", targetCollection: "production_orders", insightId: <id vừa tạo> }` — đúng cấu trúc đã thiết kế ở `COLLECTIONS.md` Stage 5 mục I.72c, không tạo field/collection mới.

## 5. Vì sao đây là "AI doanh nghiệp" chứ không phải chatbot thường

| Chatbot thường | AI doanh nghiệp (thiết kế ở đây) |
|---|---|
| Trả lời dựa trên kiến thức tổng quát hoặc văn bản tĩnh (RAG) | Đọc **số liệu thật tại thời điểm hỏi** qua Tool Calling (Loại B, `KNOWLEDGE_ARCHITECTURE.md` mục 1) |
| Dừng lại ở câu trả lời | Sinh ra **hành động cụ thể** (`ai_recommendations` trỏ thẳng tới collection cần tạo/sửa) |
| 1 nguồn dữ liệu | **Xuyên nhiều domain** (Sales → Warehouse → Factory) trong 1 lượt hỏi duy nhất |
| Không có dấu vết | Ghi lại `ai_insights`/`ai_recommendations`/`usage_logs` — có thể truy vết AI đã thấy gì, kết luận gì, ai xử lý sau đó |

## 6. Tổng quát hoá — mẫu áp dụng cho Cross-Domain Flow khác

Khuôn mẫu 3 bước (Đọc dữ liệu domain A → domain B → domain C → Đề xuất) áp dụng lại được cho các câu hỏi doanh nghiệp khác, không cần đổi kiến trúc — chỉ định nghĩa Tool mới cho domain tương ứng:

| Kịch bản | Chuỗi domain đọc | Tool cần thêm |
|---|---|---|
| "Khách hàng ABC có đang nợ quá hạn không?" | CRM (`customers`) → Finance (`debts`/`invoices`) | `getCustomerDebtStatus` |
| "Lead nào lâu chưa được chăm sóc?" | CRM (`leads`) → CRM (`customer_contacts`) | `findStaleLeads` |
| "Nhân viên nào sắp hết hạn hợp đồng?" | HR (`employees`) | `findExpiringContracts` |
| "Đơn hàng nào sắp trễ hạn theo tiến độ sản xuất?" | SALES (`orders`) → FACTORY (`production_orders`) → LOGISTICS (`shipments`) | `checkOrderTimeline` (mở rộng của Tool 3 ở trên, thêm bước Logistics) |

Mỗi kịch bản mới chỉ cần: (1) định nghĩa Tool đọc đúng collection cần, (2) viết luật tổng hợp (như mục 3), (3) map ra `ai_insights`/`ai_recommendations` đúng `actionType`/`targetCollection` — không cần sửa `AI_GATEWAY.md`/`MODEL_ROUTER.md`/`AI_SECURITY.md` đã thiết kế ở Stage 7.

## 7. Ràng buộc bảo mật (nhắc lại, không đổi so với Stage 7)

Mọi Tool ở mục 2 **bắt buộc** nhận `organizationId` và chỉ đọc trong phạm vi đó (`AI_SECURITY.md` mục 4) — không có Tool nào ở đây được phép truy vấn xuyên Organization. Whitelist Tool theo `agentId` (mục 2, dòng mở đầu) áp dụng đúng nguyên tắc chống Prompt Injection đã nêu ở `AI_SECURITY.md` mục 2.

## 8. Tham chiếu

- Cơ chế Tool Calling gốc: [KNOWLEDGE_ARCHITECTURE.md](KNOWLEDGE_ARCHITECTURE.md) mục 3
- Nơi Tool được gọi trong luồng Gateway: [AI_GATEWAY.md](AI_GATEWAY.md) mục 4
- Collection đọc/ghi: [COLLECTIONS.md](COLLECTIONS.md) domain C (SALES), D (WAREHOUSE), E (FACTORY), I (AI)
- Generic helper truy vấn Firestore: `packages/database` (`listScoped`/`getScopedDoc` — Stage 6)
- Cost-aware khi gọi Tool: [MODEL_ROUTER.md](MODEL_ROUTER.md) mục 4
- Bảo mật/cách ly Organization: [AI_SECURITY.md](AI_SECURITY.md) mục 2/4
