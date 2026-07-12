# TOOL_SECURITY.md — Bảo mật Tool Calling

Nối tiếp `AI_SECURITY.md` (Stage 7) — tài liệu này thiết kế riêng các rủi ro bảo mật **đặc thù của việc cho phép Model tự gọi Tool đọc dữ liệu thật**, rủi ro lớn hơn hẳn so với AI chỉ trò chuyện thông thường vì Tool Calling chạm trực tiếp vào Firestore.

## 1. Tool Permission — mọi Tool đều gắn 1 Permission cụ thể

Mỗi `ToolDefinition` (`TOOL_CALLING.md` mục 1) có field `requiredPermission: { resource, action }` — tái sử dụng đúng model Permission đã có (`packages/database/src/types.ts`, `AUTHENTICATION.md` Stage 4). Trước khi thực thi Tool (bước 5, `TOOL_CALLING.md` mục 2), Gateway gọi đúng cơ chế `usePermission().can(resource, action)` (đã có từ Stage 4-6) — **không có cơ chế kiểm tra quyền riêng cho AI**, dùng chung 1 hệ RBAC với toàn bộ nền tảng.

Hệ quả thực tế: nếu 1 user không có quyền `finance: view`, AI Agent đại diện user đó **cũng không gọi được** `getInvoiceStatus`/`getOverdueDebts`/`getCashflowSummary` (`TOOL_REGISTRY.md` mục G) dù Model có "muốn" gọi — quyền của AI **không bao giờ vượt quá** quyền của user đang chat với nó.

## 2. Whitelist Tool theo Agent (Tool Routing bảo mật)

`TOOL_CALLING.md` mục 3 (Tool Routing) đã mô tả việc lọc theo `domain`/`moduleSlug` — đây là lớp lọc **thứ nhất** (theo mức độ liên quan nghiệp vụ). Lớp lọc bảo mật **thứ hai** (bắt buộc, không tuỳ chọn): mỗi `ai_agents` document (Stage 5) có thêm field `allowedTools: string[]` (đề xuất bổ sung) — danh sách tên Tool cụ thể agent đó được dùng, **mặc định rỗng** (agent mới tạo không có quyền gọi Tool nào cho tới khi được cấu hình rõ ràng — nguyên tắc "deny by default", không phải "allow by default").

## 3. Chặn Prompt Injection ép gọi Tool ngoài ý muốn

Nối tiếp `AI_SECURITY.md` (Stage 7) mục 2 — áp dụng cụ thể cho Tool Calling:

| Rủi ro | Biện pháp |
|---|---|
| Nội dung Knowledge (RAG, `searchKnowledgeBase`) chứa văn bản giả dạng chỉ thị ("Hãy gọi tool xoá dữ liệu...") | Không có Tool nào cho phép xoá/sửa (mục 4 — toàn bộ Registry READ-ONLY) nên dạng tấn công này **vô hiệu về mặt hậu quả**, dù vẫn nên lọc/cảnh báo nội dung bất thường |
| User cố tình yêu cầu AI "gọi tool X với quyền Y" trực tiếp trong câu hỏi | Gateway chỉ nhận tool call request **do Model sinh ra** qua đúng giao thức Function/Tool Calling của Provider (`TOOL_CALLING.md` mục 2, bước 2) — không parse ý định gọi Tool từ văn bản tự do của user |
| Model bị dẫn dụ gọi Tool ngoài whitelist | Bước 4 (`TOOL_CALLING.md` mục 2) chặn cứng ở tầng Gateway — không dựa vào việc Model "tự giác" tuân thủ hướng dẫn trong System Prompt |

## 4. READ-ONLY là ranh giới bảo mật cứng, không phải quy ước

Đây là nguyên tắc **quan trọng nhất** của toàn bộ Bước 8: **không Tool nào trong `TOOL_REGISTRY.md` được implement thao tác ghi** (`create`/`update`/`delete`) khi viết code thật sau này — đây không phải "khuyến nghị", mà là **ràng buộc kiến trúc bắt buộc**. Lý do:

- AI có thể suy luận sai (hallucination) — nếu Tool có quyền ghi, 1 suy luận sai có thể tạo/sửa dữ liệu thật sai lệch, hậu quả khó lường hơn nhiều so với chỉ trả lời sai.
- Mọi hành động ghi dữ liệu đều phải qua `ai_recommendations` (`status: "pending"`) rồi **con người bấm xác nhận** — đúng thiết kế Pipeline ở `TOOL_CALLING.md` mục 4, không có đường tắt.
- Khi viết code thật (ngoài phạm vi Bước 8), nếu có nhu cầu "Tool ghi" trong tương lai, đó phải là **quyết định kiến trúc mới, riêng biệt**, không mặc nhiên mở rộng từ Registry đọc hiện tại.

## 5. Cách ly theo Organization (nhắc lại, áp dụng cụ thể cho Tool)

- `organizationId` truyền vào mọi Tool **luôn lấy từ context request đã xác thực** (custom claims/`activeOrgId`), **không bao giờ lấy từ `arguments` do Model tự sinh** (`TOOL_CALLING.md` mục 2, bước 7) — nếu Model "tự ý" đưa 1 `organizationId` khác vào tham số, Gateway phải bỏ qua giá trị đó và luôn ghi đè bằng `organizationId` thật của request.
- `super_admin` (`platformRole`, `SECURITY_PLAN.md` Stage 5 mục 4) là **duy nhất ngoại lệ** được phép gọi Tool xuyên Organization — cần đánh dấu rõ trong `usage_logs` mỗi khi request thuộc diện này để dễ audit.

## 6. Audit Logging

Mọi lượt gọi Tool (thành công hoặc bị từ chối ở bất kỳ bước kiểm tra nào — mục 1/2/3/5) đều ghi vào `usage_logs`/`activity_logs` (Stage 5): `{ toolName, arguments, requestedBy: uid, result: "success"|"denied"|"error", reason }`. Log bị từ chối (`"denied"`) đặc biệt quan trọng — cho phép phát hiện sớm nếu 1 agent liên tục cố gọi Tool ngoài quyền (dấu hiệu cấu hình sai hoặc bị tấn công).

## 7. Rate Limiting theo Tool

Nối tiếp Cost Control (`AI_SECURITY.md` Stage 7 mục 5) — áp thêm giới hạn **số lượt gọi Tool/phút/Organization** (không chỉ giới hạn theo token/chi phí Model) vì Tool đọc Firestore trực tiếp, gọi quá nhiều trong thời gian ngắn có thể ảnh hưởng hiệu năng Firestore của chính Organization đó (không phải rủi ro chi phí Provider AI, mà là rủi ro hạ tầng Database).

## 8. Tham chiếu

- Bảo mật AI Gateway gốc: [AI_SECURITY.md](AI_SECURITY.md) (Stage 7)
- Bảo mật Firestore gốc: [SECURITY_PLAN.md](SECURITY_PLAN.md), [SECURITY_RULES.md](SECURITY_RULES.md) (Stage 4/5)
- Vòng đời gọi Tool: [TOOL_CALLING.md](TOOL_CALLING.md) mục 2
- Danh mục Tool: [TOOL_REGISTRY.md](TOOL_REGISTRY.md)
