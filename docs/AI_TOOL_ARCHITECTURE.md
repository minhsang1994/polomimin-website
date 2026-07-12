# AI_TOOL_ARCHITECTURE.md — Kiến trúc Tổng thể Tool Calling (Bước 8)

Bước 8 hoàn thiện kiến trúc **Tool Calling** đã đặt tên ở Stage 7 (`AI_GATEWAY.md`, `KNOWLEDGE_ARCHITECTURE.md` mục 3) thành 1 hệ thống đầy đủ: **Tool Registry** (danh mục), **Tool Definition** (đặc tả từng Tool), **Tool Permission** (ai được gọi), **Tool Routing** (chọn Tool nào cho request nào), và **AI Recommendation Pipeline** (biến kết quả Tool thành đề xuất hành động). Đây là điểm vào chính; chi tiết ở 4 tài liệu chuyên biệt cùng thư mục `docs/`.

**Ràng buộc không đổi**: chỉ thiết kế kiến trúc — không viết code (kể cả `packages/ai/tools/`), không gọi Firebase thật, không gọi API AI thật, không viết Business Logic thật.

## 1. Vị trí trong kiến trúc AI Gateway (Stage 7)

```
AI Gateway (đã thiết kế Stage 7)
   │
   ▼
Model quyết định cần gọi Tool (Function/Tool Calling — AI_GATEWAY.md mục 3)
   │
   ▼
┌─────────────────────────────────────────────────────────┐
│  TOOL CALLING SUBSYSTEM (Bước 8 — tài liệu này)           │
│                                                           │
│  Tool Routing ──► tra Tool Registry ──► kiểm tra          │
│  (agentId muốn    (danh mục Tool      Tool Permission     │
│   gọi tool nào?)   khả dụng)          (được phép không?)  │
│                         │                                 │
│                         ▼                                 │
│              Thực thi Tool Definition                     │
│              (đọc Firestore qua packages/database         │
│               generic helper — Stage 6, READ-ONLY)        │
│                         │                                 │
│                         ▼                                 │
│              AI Recommendation Pipeline                   │
│              (gộp kết quả nhiều Tool → luật quyết định     │
│               → ai_insights → ai_recommendations)          │
└─────────────────────────────────────────────────────────┘
   │
   ▼
Model dùng kết quả Tool để trả lời / Gateway trả đề xuất kèm câu trả lời
```

## 2. 5 thành phần — vai trò và tài liệu chi tiết

| Thành phần | Trả lời câu hỏi | Tài liệu |
|---|---|---|
| **Tool Registry** | "Hệ thống có những Tool nào?" | [TOOL_REGISTRY.md](TOOL_REGISTRY.md) |
| **Tool Definition** | "1 Tool cụ thể hoạt động ra sao?" (input/output/nguồn dữ liệu) | [TOOL_REGISTRY.md](TOOL_REGISTRY.md) (mỗi entry) + [TOOL_CALLING.md](TOOL_CALLING.md) mục 1 (khuôn mẫu chung) |
| **Tool Permission** | "Ai/Agent nào được gọi Tool nào?" | [TOOL_SECURITY.md](TOOL_SECURITY.md) |
| **Tool Input/Output Schema** | "Tool nhận gì, trả về gì, đúng kiểu dữ liệu nào?" | [TOOL_REGISTRY.md](TOOL_REGISTRY.md) (mỗi entry) |
| **Tool Routing** | "Request này nên thấy Tool nào trong danh sách?" | [TOOL_CALLING.md](TOOL_CALLING.md) mục 3 |
| **AI Recommendation Pipeline** | "Kết quả Tool biến thành đề xuất hành động thế nào?" | [TOOL_CALLING.md](TOOL_CALLING.md) mục 4 |

## 3. Nguyên tắc thiết kế bao trùm

1. **Tool luôn READ-ONLY** — không Tool nào trong Registry (mục `TOOL_REGISTRY.md`) được phép ghi dữ liệu. Hành động ghi (tạo `production_order`, tạo `purchase_request`...) luôn đi qua `ai_recommendations` để **người dùng xác nhận thủ công** — AI không tự hành động, chỉ tự đề xuất (ranh giới bảo mật quan trọng nhất của toàn bộ Bước 8, chi tiết `TOOL_SECURITY.md` mục 4).
2. **Mọi Tool bắt buộc nhận `organizationId`** và tự động lọc theo `workspaceId`/`branchId` nếu áp dụng — không có ngoại lệ (kế thừa nguyên tắc `SECURITY_PLAN.md` Stage 5, `AI_SECURITY.md` Stage 7 mục 4).
3. **Tool không gọi Tool khác trực tiếp** — việc điều phối gọi nhiều Tool theo trình tự (VD ví dụ Orders→Warehouse→Production ở `AI_DATA_READING.md`) là trách nhiệm của **AI Recommendation Pipeline**/Model, không phải Tool tự gọi chéo nhau (giữ mỗi Tool đơn giản, dễ kiểm chứng độc lập).
4. **1 nguồn danh mục duy nhất** — Tool Registry là nơi duy nhất liệt kê Tool khả dụng; Router (`MODEL_ROUTER.md` Stage 7) và Gateway không tự "biết" Tool nào tồn tại ngoài việc tra Registry, tránh 2 nơi định nghĩa lệch nhau.

## 4. Quan hệ với `AI_DATA_READING.md` (tài liệu trước đó cùng Bước 8)

`AI_DATA_READING.md` là **ví dụ minh hoạ cụ thể** (case study) cho đúng 1 kịch bản Orders→Warehouse→Production — viết trước khi có yêu cầu hình thức hoá đầy đủ. Bước 8 (tài liệu này trở đi) **hình thức hoá** case study đó thành kiến trúc chuẩn, tái sử dụng: 3 Tool đã phác ở `AI_DATA_READING.md` mục 2 nay là 3 entry chính thức trong Tool Registry (`getOrderDetails`, `checkInventoryAvailability`, `checkProductionCapacity` — xem `TOOL_REGISTRY.md` mục Orders/Inventory/Production), và luật tổng hợp ở `AI_DATA_READING.md` mục 3 nay là 1 ví dụ cụ thể của AI Recommendation Pipeline tổng quát (`TOOL_CALLING.md` mục 4).

## 5. Tham chiếu

- Cơ chế Function/Tool Calling gốc (Stage 7): [AI_GATEWAY.md](AI_GATEWAY.md) mục 3, [KNOWLEDGE_ARCHITECTURE.md](KNOWLEDGE_ARCHITECTURE.md) mục 3
- Ví dụ end-to-end cụ thể: [AI_DATA_READING.md](AI_DATA_READING.md)
- Lifecycle gọi Tool + Routing + Pipeline: [TOOL_CALLING.md](TOOL_CALLING.md)
- Danh mục đầy đủ Tool 9 domain: [TOOL_REGISTRY.md](TOOL_REGISTRY.md)
- Bảo mật/quyền/read-only/audit: [TOOL_SECURITY.md](TOOL_SECURITY.md)
