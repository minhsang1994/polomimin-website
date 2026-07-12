# TOOL_CALLING.md — Cơ chế gọi Tool (Lifecycle, Routing, Recommendation Pipeline)

## 1. Khuôn mẫu chung của 1 Tool Definition

Mọi Tool trong Registry (`TOOL_REGISTRY.md`) mô tả theo đúng 1 khuôn mẫu — đây là "meta-schema" áp dụng cho toàn bộ Tool, không riêng domain nào:

```
ToolDefinition {
  name: string                     // duy nhất toàn hệ thống, camelCase, VD "getOrderDetails"
  description: string              // mô tả cho MODEL hiểu khi nào nên gọi Tool này
  domain: string                   // 1 trong 9 domain — Orders/Customers/Products/Inventory/
                                    // Warehouse/Production/Finance/HR/AI Knowledge
  inputSchema: { [param]: type }   // tham số đầu vào + kiểu dữ liệu (luôn có organizationId)
  outputSchema: { [field]: type }  // hình dạng dữ liệu trả về
  requiredPermission: { resource, action }  // xem TOOL_SECURITY.md mục 1
  sourceCollections: string[]      // collection Firestore Tool này đọc (READ-ONLY)
  isEnabled: boolean               // bật/tắt Tool không cần xoá khỏi Registry
}
```

`inputSchema`/`outputSchema` dùng kiểu dữ liệu chuẩn đã có ở `FIELD_STANDARD.md` (Stage 5): `string`, `number`, `boolean`, `array<...>`, `map` — không phát minh kiểu mới cho riêng Tool.

## 2. Vòng đời 1 lượt gọi Tool (Lifecycle)

```
1. Model (trong lúc trả lời) quyết định cần dữ liệu ngoài ngữ cảnh đã có
   → phát sinh 1 "tool call request": { toolName, arguments }

2. Gateway nhận tool call request từ Model (không phải từ client — client không
   được tự ý yêu cầu gọi Tool thay Model, tránh Prompt Injection — TOOL_SECURITY.md mục 5)

3. Gateway tra Tool Registry theo `toolName`
   → Không tồn tại / isEnabled=false → trả lỗi cho Model, KHÔNG thực thi gì cả

4. Gateway kiểm tra Tool Routing (mục 3) — Tool này có nằm trong whitelist của
   agentId/module đang phục vụ không?
   → Không nằm trong whitelist → từ chối, ghi activity_logs (nghi vấn bảo mật)

5. Gateway kiểm tra Tool Permission (TOOL_SECURITY.md mục 1) — user gọi request
   này có quyền `requiredPermission` không?
   → Không đủ quyền → từ chối, trả lý do rõ ràng

6. Gateway validate `arguments` đúng `inputSchema` (đủ field bắt buộc, đúng kiểu)
   → Sai định dạng → trả lỗi cho Model để Model tự sửa lại tham số và gọi lại

7. Thực thi Tool: gọi packages/database generic helper (Stage 6) với
   organizationId lấy từ request gốc (KHÔNG lấy từ arguments Model tự sinh ra —
   organizationId luôn do Gateway tiêm vào, Model không được tự khai — xem
   TOOL_SECURITY.md mục 4)

8. Kết quả trả về đúng outputSchema → đưa lại vào hội thoại (dạng "tool result
   message" — định dạng khác nhau theo từng Provider, xem AI_PROVIDER.md mục 2)

9. Model đọc tool result, có thể:
   a. Trả lời ngay nếu đủ thông tin
   b. Gọi thêm 1 Tool khác (lặp lại từ bước 1 — xem mục 4, đa bước)

10. Gateway ghi lại toàn bộ chuỗi tool call (tên Tool, arguments, kết quả, thời
    gian) vào `ai_history`/`usage_logs` (Stage 5) — phục vụ audit (TOOL_SECURITY.md mục 6)
```

## 3. Tool Routing — request nào thấy Tool nào

Router (mở rộng `MODEL_ROUTER.md` Stage 7) không chỉ chọn Provider/Model — còn quyết định **danh sách Tool được phép xuất hiện** trong request gửi lên Model (Provider chỉ cho Model gọi Tool nằm trong danh sách này, không phải toàn bộ Registry):

```
Danh sách Tool khả dụng cho 1 request
   = Tool có domain khớp `moduleSlug` của agentId đang phục vụ
   + Tool dùng chung mọi agent (VD searchKnowledgeBase — domain "AI Knowledge")
   − Tool bị tắt (isEnabled = false)
   − Tool mà Role của user hiện tại chắc chắn không đủ Permission (lọc sớm,
     đỡ phải để Model đề xuất Tool rồi mới từ chối ở bước 5 mục 2)
```

Ví dụ: AI Agent thuộc `factory-os`/`production` chỉ thấy Tool domain Production/Inventory/Warehouse, **không thấy** Tool domain Finance/HR — không phải vì bị cấm tuyệt đối, mà vì không liên quan tác vụ, giảm khả năng Model gọi nhầm Tool không cần thiết (đỡ tốn token, đỡ rủi ro bảo mật thừa).

## 4. AI Recommendation Pipeline (tổng quát hoá từ `AI_DATA_READING.md`)

Sau khi 1 chuỗi Tool call kết thúc (Model đã đủ dữ liệu), Gateway chạy pipeline sau — **luôn** chạy, không phụ thuộc pipeline có sinh ra đề xuất hay không:

```
Bước 1 — THU THẬP: Gộp toàn bộ kết quả Tool đã gọi trong lượt này thành 1 tập dữ kiện

Bước 2 — ĐÁNH GIÁ: Áp luật quyết định (rule cụ thể theo từng kịch bản nghiệp vụ —
   VD luật ở AI_DATA_READING.md mục 3) để xác định:
     a. Có vấn đề/cơ hội đáng chú ý không? (VD thiếu hàng, nợ quá hạn, nhân sự
        sắp hết hợp đồng...)
     b. Mức độ nghiêm trọng (severity: info/warning/critical)

Bước 3 — GHI NHẬN: Nếu Bước 2a = có → tạo 1 document `ai_insights` (Stage 5)
   { sourceModule, sourceCollection, sourceId, severity, message }

Bước 4 — ĐỀ XUẤT (tuỳ chọn, chỉ khi cần hành động): Nếu vấn đề cần ai đó làm gì
   (không chỉ để biết) → tạo thêm `ai_recommendations` (Stage 5)
   { insightId, actionType, targetCollection, targetId, status: "pending" }
   — actionType là 1 hành động CỤ THỂ (VD "create_production_order",
   "create_purchase_request", "send_payment_reminder") — không phải câu chung
   chung "cần xử lý"

Bước 5 — TRẢ LỜI: Model dùng dữ kiện Bước 1 để trả lời tự nhiên cho người dùng,
   kèm tham chiếu insightId/recommendationId vừa tạo (nếu có) để UI có thể liên
   kết trực tiếp tới màn hình xử lý
```

**Ranh giới quan trọng**: Pipeline này **chỉ tạo ra đề xuất** (`ai_recommendations.status = "pending"`) — không tự động chuyển `status` sang `accepted` và tự thực thi hành động. Việc 1 user bấm "Chấp nhận" trên UI mới thật sự tạo `production_order`/`purchase_request`... — đó là Business Logic thật, ngoài phạm vi Bước 8 (đã xác nhận không viết Business Logic).

## 5. Đa bước (Multi-tool Orchestration)

Model được phép gọi **nhiều Tool tuần tự** trong 1 lượt trả lời (đúng ví dụ Orders→Warehouse→Production ở `AI_DATA_READING.md`) — Gateway không giới hạn cứng số lượng Tool/lượt, nhưng áp 2 giới hạn an toàn:

| Giới hạn | Giá trị đề xuất | Lý do |
|---|---|---|
| Số lượt gọi Tool tối đa/1 câu hỏi | 6 | Tránh Model rơi vào vòng lặp gọi Tool vô hạn (lỗi logic hoặc bị dẫn dụ bởi Prompt Injection) |
| Thời gian tối đa cho toàn bộ chuỗi Tool call | Theo timeout chung của Cloud Function (`aiGatewayProxy`, Stage 4) | Tránh 1 request treo quá lâu vì gọi Tool chậm liên tiếp |

Vượt giới hạn → Gateway dừng, trả lời dựa trên dữ liệu đã thu thập được tới thời điểm đó, kèm ghi chú "chưa thu thập đủ dữ liệu" thay vì lỗi cứng.

## 6. Tham chiếu

- Danh mục Tool đầy đủ: [TOOL_REGISTRY.md](TOOL_REGISTRY.md)
- Quyền/bảo mật khi gọi Tool: [TOOL_SECURITY.md](TOOL_SECURITY.md)
- Ví dụ end-to-end: [AI_DATA_READING.md](AI_DATA_READING.md)
- Collection `ai_insights`/`ai_recommendations`: [COLLECTIONS.md](COLLECTIONS.md) mục I.72a/72c
