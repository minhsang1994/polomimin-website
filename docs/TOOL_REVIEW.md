# TOOL_REVIEW.md — Bước 8 Review

Tự đánh giá 4 tài liệu Tool Calling Architecture vừa hoàn thành (`docs/AI_TOOL_ARCHITECTURE.md`, `docs/TOOL_CALLING.md`, `docs/TOOL_REGISTRY.md`, `docs/TOOL_SECURITY.md`), cộng với `docs/AI_DATA_READING.md` (case study viết trước khi có yêu cầu hình thức hoá đầy đủ), trước khi dừng lại chờ xác nhận.

## 1. Đối chiếu với yêu cầu gốc

| Yêu cầu | Tài liệu tương ứng | Trạng thái |
|---|---|---|
| Tool Registry | `TOOL_REGISTRY.md` | ✅ 22 Tool, 9 domain |
| Tool Definition | `TOOL_CALLING.md` mục 1 (khuôn mẫu) + mỗi entry `TOOL_REGISTRY.md` | ✅ |
| Tool Permission | `TOOL_SECURITY.md` mục 1 + field `requiredPermission` mỗi Tool | ✅ |
| Tool Input/Output Schema | Mỗi entry `TOOL_REGISTRY.md` | ✅ đủ 22/22 Tool có input/output |
| Tool Routing | `TOOL_CALLING.md` mục 3 + `TOOL_SECURITY.md` mục 2 (whitelist) | ✅ |
| AI Recommendation Pipeline | `TOOL_CALLING.md` mục 4 | ✅ 5 bước, tổng quát hoá từ `AI_DATA_READING.md` |
| Tool chuẩn cho Orders/Customers/Products/Inventory/Warehouse/Production/Finance/HR/AI Knowledge | `TOOL_REGISTRY.md` mục A-I | ✅ đủ 9/9 domain |

**5/5 tài liệu yêu cầu đã xuất đủ** (`TOOL_CALLING.md`, `TOOL_REGISTRY.md`, `AI_TOOL_ARCHITECTURE.md`, `TOOL_SECURITY.md`, `TOOL_REVIEW.md`).

## 2. Tuân thủ ràng buộc

| Ràng buộc | Tuân thủ? |
|---|---|
| Không viết Business Logic | ✅ — toàn bộ chỉ là đặc tả (schema/luật quyết định ở mức mô tả), không có code thực thi |
| Không gọi Firebase thật | ✅ — không có kết nối/project thật nào được tạo hay gọi |
| Không gọi API AI thật | ✅ — không gọi bất kỳ Provider nào |
| Không viết `packages/ai/tools` | ✅ — không tạo file code nào trong `packages/ai` (thư mục này chưa tồn tại, đúng như Stage 7 để lại) |

## 3. Nhất quán giữa các tài liệu

- Khuôn mẫu `ToolDefinition` (`TOOL_CALLING.md` mục 1) được áp dụng đúng, đầy đủ field cho cả 22 Tool ở `TOOL_REGISTRY.md` — không có Tool nào thiếu `requiredPermission`/`sourceCollections`.
- Nguyên tắc READ-ONLY (`AI_TOOL_ARCHITECTURE.md` mục 3, nhắc lại ở `TOOL_SECURITY.md` mục 4) được tuân thủ nhất quán — rà lại cả 22 Tool trong `TOOL_REGISTRY.md`, không Tool nào có `action` khác `"view"` trong `requiredPermission`.
- `organizationId` là điều kiện ngầm định bắt buộc mọi Tool (`TOOL_REGISTRY.md` dòng mở đầu) nhất quán với cách xử lý ở `TOOL_CALLING.md` mục 2 bước 7 và `TOOL_SECURITY.md` mục 5.
- 3 Tool đã phác ở `AI_DATA_READING.md` (`getOrderDetails`, `checkInventoryAvailability`, `checkProductionCapacity`) khớp chính xác tên và schema với 3 entry tương ứng ở `TOOL_REGISTRY.md` mục A/D/F — không có sai lệch giữa case study và Registry chính thức.

## 4. Phát hiện mới trong quá trình thiết kế

1. **Cần phân biệt "AI Recommendation Pipeline luôn chạy" và "chỉ ghi `ai_recommendations` khi cần hành động"** — ban đầu dễ nhầm là mọi lượt hỏi đều tạo ra 1 recommendation; thực tế `ai_insights` ghi mọi lần có phát hiện, còn `ai_recommendations` chỉ ghi thêm khi phát hiện đó cần ai đó **hành động cụ thể** (`TOOL_CALLING.md` mục 4, Bước 3 vs Bước 4) — tránh `ai_recommendations` bị ngập những đề xuất vô nghĩa kiểu "mọi thứ đều ổn, không cần làm gì".
2. **`allowedTools` cần bổ sung vào `ai_agents`** (`TOOL_SECURITY.md` mục 2) — Stage 5 chưa có field này vì lúc đó Tool Calling chưa được thiết kế chi tiết; đây là **bổ sung field nhỏ**, không phải thay đổi cấu trúc `ai_agents`, tương tự cách `roles.slug` được bổ sung ở Xác nhận Stage 5.
3. **Rate Limiting theo Tool (lượt gọi/phút) là rủi ro khác với Cost Control theo token** — phát hiện khi thiết kế `TOOL_SECURITY.md` mục 7: Tool Calling tạo tải trực tiếp lên Firestore (rủi ro hạ tầng), khác với rủi ro chi phí Provider AI (`AI_SECURITY.md` Stage 7 mục 5) — cần theo dõi riêng, không gộp chung 1 chỉ số.

## 5. Giới hạn của tài liệu (Limitations)

- 22 Tool ở `TOOL_REGISTRY.md` là **bộ Tool khởi điểm hợp lý**, không phải danh sách đầy đủ mọi câu hỏi doanh nghiệp có thể có — Registry được thiết kế để **mở rộng dễ dàng** (mục "Bảng tổng hợp" cuối `TOOL_REGISTRY.md`), thêm Tool mới không cần đổi 4 tài liệu còn lại.
- Luật quyết định cụ thể (VD ở `AI_DATA_READING.md` mục 3) mới minh hoạ **1 kịch bản** (Orders→Warehouse→Production) — các domain khác (Customers/Finance/HR) có Tool nhưng **chưa có luật quyết định cụ thể riêng**, chỉ có khuôn mẫu chung ở `TOOL_CALLING.md` mục 4 — cần thiết kế thêm luật cụ thể cho từng kịch bản khi triển khai thật, theo đúng mẫu ở mục 6 `AI_DATA_READING.md`.
- Chưa xác nhận Provider nào trong 8 Provider (`AI_PROVIDER.md` Stage 7) hỗ trợ tốt multi-step Tool Calling (đa bước tuần tự, `TOOL_CALLING.md` mục 5) — cần kiểm chứng khi tích hợp thật, một số Provider có giới hạn khác nhau về số Tool/lượt.

## 6. Sẵn sàng cho giai đoạn kế tiếp?

| Điều kiện tiên quyết | Đạt? |
|---|---|
| Tool Registry đủ 9 domain, có Input/Output Schema | ✅ |
| Tool Permission tái sử dụng đúng RBAC hiện có, không tạo hệ quyền riêng | ✅ |
| Tool Routing có whitelist rõ ràng (deny by default) | ✅ |
| AI Recommendation Pipeline không tự động hành động, luôn cần người xác nhận | ✅ |
| READ-ONLY là ràng buộc kiến trúc, không phải quy ước lỏng lẻo | ✅ |
| Đã có luật quyết định cụ thể cho mọi domain (không chỉ Orders/Warehouse/Production) | ❌ — cần thiết kế thêm khi có kịch bản cụ thể từng domain |
| Đã xác nhận capability multi-tool của từng Provider | ❌ — kiểm chứng khi viết code thật |

**Kết luận**: Kiến trúc Tool Calling (Bước 8) đã đủ để làm tài liệu tham chiếu thiết kế hoàn chỉnh — Tool Registry/Definition/Permission/Schema/Routing/Recommendation Pipeline đều có, nhất quán với AI Gateway (Stage 7) và Database Architecture đã đóng băng (Stage 5). Còn 2 điểm cần bổ sung khi có nhu cầu cụ thể hơn: luật quyết định riêng cho từng domain ngoài Orders/Warehouse/Production, và xác nhận capability multi-tool thật của từng Provider.

---

**Dừng lại và chờ xác nhận của người điều hành dự án** trước khi tiến hành bất kỳ bước tiếp theo nào.
