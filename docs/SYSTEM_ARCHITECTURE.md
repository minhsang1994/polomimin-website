# SYSTEM_ARCHITECTURE.md — Kiến trúc Tổng thể Luồng Dữ liệu

Tài liệu tổng hợp cấp cao nhất của Stage 3, hợp nhất 6 tài liệu flow (`BUSINESS_FLOW`, `DATA_FLOW`, `MODULE_FLOW`, `USER_FLOW`, `AI_FLOW`, `REPORT_FLOW`) và `WORKFLOW.md` thành **1 bức tranh kiến trúc duy nhất**. Đây thuần tuý là tài liệu khái niệm (conceptual) — không thiết kế database, không viết mã, đúng phạm vi Stage 3.

## 1. Vị trí của Data Flow Architecture trong vòng đời dự án

```
Stage 1: UI Freeze (Design System)        ✅ Hoàn thành
        ↓
Stage 2: Source Code Review                ✅ Hoàn thành
        ↓
Stage 3: Data Flow Architecture             ← Tài liệu này
        ↓
Stage 4 (dự kiến): Database Architecture    ⏳ Chưa bắt đầu
        ↓
Stage 5 (dự kiến): Backend/API Architecture ⏳ Chưa bắt đầu
```

Data Flow Architecture là **cầu nối bắt buộc** giữa "giao diện đã đóng băng" (Stage 1–2) và "dữ liệu sẽ được mô hình hoá" (Stage 4) — nếu bỏ qua bước này, việc thiết kế schema database sẽ thiếu ngữ cảnh về entity nào quan hệ với entity nào, ai được ghi/đọc entity nào, và sự kiện nào kích hoạt entity nào — tất cả đã được trả lời ở 7 tài liệu flow.

## 2. Kiến trúc tổng thể — 6 module nghiệp vụ + 1 lớp cross-cutting

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NGƯỜI DÙNG (theo vai trò)                     │
│         xem USER_FLOW.md để biết ai thao tác màn hình nào             │
└───────────────────────────────┬───────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LỚP NGHIỆP VỤ TUYẾN TÍNH (Business Flow — xem BUSINESS_FLOW.md)      │
│                                                                        │
│   CRM & Sales → Production → Warehouse → Logistics → Finance          │
│                                                                        │
│   Mỗi mũi tên "→" = 1 lần bàn giao dữ liệu (entity handoff),           │
│   chi tiết tại DATA_FLOW.md, kèm điều kiện phê duyệt tại WORKFLOW.md   │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │
        ┌────────────────────────┴────────────────────────┐
        ▼                                                   ▼
┌───────────────────┐                             ┌───────────────────┐
│  HR (nền tảng)      │                             │  AI (cross-cutting) │
│  cung cấp nhân sự    │                             │  quan sát toàn bộ    │
│  vận hành 5 module    │                             │  5 module + HR,      │
│  tuyến tính trên      │                             │  sinh Insight/Forecast│
│  (xem khoảng trống    │                             │  /Recommendation      │
│  tại mục 6)           │                             │  (xem AI_FLOW.md)     │
└───────────────────┘                             └───────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LỚP TỔNG HỢP BÁO CÁO (Report Flow — xem REPORT_FLOW.md)              │
│  Transaction → Operational Report → Analytics Report → Executive Report│
└─────────────────────────────────────────────────────────────────────┘
```

## 3. Đối chiếu với kiến trúc Next.js hiện có (`apps/*`, `packages/*`)

Theo `CLAUDE.md`, nền tảng thật (không phải prototype HTML) đang dùng kiến trúc **Core Platform**: mỗi module nghiệp vụ là 1 Next.js app độc lập, chia sẻ `packages/ui`, `packages/core`, `packages/auth`. Data Flow Architecture ở Stage 3 này **ánh xạ trực tiếp** sang cấu trúc đó:

| Khái niệm Stage 3 | Tương ứng trong Core Platform (`apps/*`, `packages/*`) |
|---|---|
| Module nghiệp vụ (CRM & Sales, Production...) | 1 Next.js app riêng trong `apps/` (tương lai: `apps/business-os`, `apps/factory-os`...) |
| Entity trong `DATA_FLOW.md` | Sẽ trở thành model/schema trong `packages/database` (Stage 4, chưa làm) |
| AI Gateway | Có thể trở thành 1 package riêng (`packages/ai-gateway` hoặc tương đương) hoặc 1 app riêng (`apps/ai-center` theo đúng tên đã có trong danh sách 16 module CLAUDE.md) |
| Cross-module Quick Link (đã có trong prototype) | Tương ứng cơ chế điều hướng liên-app bằng URL tuyệt đối, đã quy định tại `packages/core/src/constants/modules.ts` |
| NAV_ITEMS dùng chung theo module | Tương ứng `AppSidebar` dùng chung từ `packages/ui` |
| Approval Flow / Notification Flow (WORKFLOW.md) | Chưa có package tương ứng — cần cân nhắc `packages/workflow` hoặc `packages/notifications` khi hiện thực hoá |

**Kết luận mục 3**: Kiến trúc Data Flow ở Stage 3 **không mâu thuẫn** với Core Platform đã quyết định ở ADR-0003 — ngược lại, củng cố thêm lý do vì sao kiến trúc "mỗi module 1 app độc lập, chia sẻ package chung" là lựa chọn đúng: 6 module nghiệp vụ có ranh giới rõ ràng (mục 4 của `BUSINESS_FLOW.md`), phù hợp để mỗi module là 1 đơn vị triển khai độc lập theo đúng Nguyên tắc 1 tại `CLAUDE.md` mục 7.

## 4. So sánh Module Flow (Stage 3) với 16 module CLAUDE.md

| Module trong yêu cầu Stage 3 | Module tương ứng trong CLAUDE.md | Trạng thái Prototype |
|---|---|---|
| CRM & Sales | Business OS (bao gồm CRM) | ✅ Đầy đủ (`70`–`101`) |
| Production | Factory OS | ✅ Đầy đủ (`102`–`141`) |
| Warehouse | Kho (Warehouse) | ✅ Đầy đủ (`142`–`171`) |
| Logistics | *(chưa liệt kê là module riêng trong CLAUDE.md — nằm trong Warehouse/Factory OS)* | ⚠️ Tập con của Warehouse OS (`158`–`162`), chưa tách module riêng |
| Finance | Tài chính (Finance) | ✅ Đầy đủ (`172`–`201`) |
| HR | *(chưa liệt kê là module riêng trong CLAUDE.md — gần nhất là "Business OS" phần tổ chức/nhân sự)* | ❌ Chưa có (xem mục 6) |
| AI | Trung tâm AI (AI Center) | ✅ Có (`21`–`69`, gồm AI Center + AI Agents) |

## 5. Nguyên tắc kiến trúc rút ra cho Stage 4 (Database Architecture)

1. **Mỗi module nghiệp vụ nên có 1 nhóm bảng dữ liệu riêng (bounded context)** — đúng theo ranh giới đã vẽ ở `BUSINESS_FLOW.md` mục 4, tránh 1 bảng dữ liệu khổng lồ dùng chung cho nhiều module.
2. **Entity hạ nguồn cần trường tham chiếu rõ ràng tới entity thượng nguồn** — đã liệt kê cụ thể ở `DATA_FLOW.md` mục 4 (VD `Invoice.orderId`, `JournalEntry.sourceRef`).
3. **Approval Gate cần 1 cơ chế trạng thái dùng chung** (không nên mỗi module tự định nghĩa enum trạng thái riêng) — vì đã quan sát thấy 2 khuôn mẫu lặp lại giống nhau ở `WORKFLOW.md` mục A.2 (Kanban 3–4 cột).
4. **Notification cần 1 dịch vụ trung tâم** (không nên nhúng logic thông báo rải rác trong từng module) — vì đã quan sát 3 kênh dùng chung `MiminShell` xuyên suốt 199 trang prototype, chứng minh tính khả thi của việc tập trung hoá.
5. **AI Gateway nên là 1 lớp đọc riêng (read replica/event stream), không ghi trực tiếp vào entity nghiệp vụ** — AI chỉ "đề xuất", quyết định ghi dữ liệu vẫn thuộc về con người qua Approval Flow (đã thể hiện đúng nguyên tắc này trong toàn bộ prototype: mọi nút "Áp dụng" trên Insight Card chỉ điều hướng sang trang thao tác, không tự động ghi dữ liệu).

## 6. Khoảng trống kiến trúc cần quyết định trước Stage 4

| Khoảng trống | Ảnh hưởng | Cần quyết định |
|---|---|---|
| **HR chưa là module độc lập** | Không có bounded context riêng cho `Employee`/`Timesheet`/`KPIRecord`/`TrainingRecord` | Có tách HR thành module riêng trước Stage 4, hay tạm gộp vào Business OS? |
| **Logistics là tập con của Warehouse OS** | Ranh giới dữ liệu Warehouse vs Logistics chưa rõ ràng để tách bảng | Có tách Logistics thành bounded context riêng, hay giữ chung với Warehouse? |
| **AI Gateway chưa có hiện thân kỹ thuật thống nhất** (3 tầng rời rạc: AI Center/AI Agents/AI Insight) | Khó thiết kế 1 schema `ai_events`/`ai_insights` dùng chung nếu 3 tầng có mô hình dữ liệu khác nhau | Có hợp nhất 3 tầng thành 1 kiến trúc AI Gateway kỹ thuật duy nhất trước khi thiết kế database? |
| **Chưa có Executive Dashboard hợp nhất** (nêu ở `REPORT_FLOW.md` mục 6) | Report Flow tầng 4 hiện chỉ là "ghé thăm tuần tự", chưa có bảng tổng hợp thật | Có cần 1 view/API tổng hợp chéo module cho CEO trước Stage 4? |

## 7. Tham chiếu toàn bộ tài liệu Stage 3

[BUSINESS_FLOW.md](BUSINESS_FLOW.md) · [DATA_FLOW.md](DATA_FLOW.md) · [MODULE_FLOW.md](MODULE_FLOW.md) · [USER_FLOW.md](USER_FLOW.md) · [AI_FLOW.md](AI_FLOW.md) · [REPORT_FLOW.md](REPORT_FLOW.md) · [WORKFLOW.md](WORKFLOW.md)

Đối chiếu Stage 1–2: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [../UI_FREEZE_REPORT.md](../UI_FREEZE_REPORT.md), [../PROJECT_HEALTH_REPORT.md](../PROJECT_HEALTH_REPORT.md)
