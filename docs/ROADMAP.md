# ROADMAP.md

Tiến độ tổng hợp của toàn bộ Prototype HTML (`001`–`201`), tính đến mốc **UI Freeze** (chuyển từ Prototype sang Product Architecture). Đối chiếu với 16 module nghiệp vụ đã định nghĩa trong `CLAUDE.md` gốc — lưu ý: phạm vi 8 nhóm dưới đây là **nhóm theo prototype HTML**, không hoàn toàn map 1:1 với 16 module Next.js apps (xem ghi chú cuối file).

## 1. Bảng tiến độ theo nhóm (001–201)

| Dải số | Nhóm | Số file | Trạng thái | Ghi chú |
|---|---|---|---|---|
| 001–010 | Core Platform (Auth, Home, Settings, Search) | 10 | ✅ Completed | Thế hệ 1 (inline CSS/JS) |
| 011–020 | Academy / Training Center | 10 | ✅ Completed | Thế hệ 1 |
| 021–041 | AI Center / AI Studio | 20 | ✅ Completed | Thế hệ 1 (`21`–`38`) + thế hệ 2 (`40`–`41`) |
| 042–069 | AI Agents (24 persona + hub + marketplace + settings) | 28 | ✅ Completed | Thế hệ 1 (`42`–`47`, `60`–`61`) + thế hệ 2 (`48`–`59`, `62`–`69`) |
| 070–101 | Business OS / CRM | 31 | ✅ Completed | Có `REVIEW_REPORT.md` (đợt review 70-79 + tiếp nối) |
| 102–141 | Factory OS | 39 | ✅ Completed | Có `FACTORY_REVIEW_REPORT.md` |
| 142–171 | Warehouse OS | 30 | ✅ Completed | Có `WAREHOUSE_REVIEW_REPORT.md`, kết nối chéo module thật |
| 172–201 | Finance & Accounting OS | 30 | ✅ Completed | Có `FINANCE_REVIEW_REPORT.md`, tái dùng `business-layout.*` |
| — | **UI Freeze Audit** (tài liệu này) | 14 doc + 1 report | ✅ Completed | Chuẩn hoá toàn bộ 199 file thành tài liệu tham chiếu |

**Tổng: 199/199 file HTML đã hoàn thành ở mức Prototype**, không còn màn hình nào dang dở.

## 2. Đối chiếu với 16 module chính thức (CLAUDE.md)

| Module CLAUDE.md | Trạng thái trong Next.js apps (`apps/*`) | Trạng thái trong Prototype HTML (`pages/*`) |
|---|---|---|
| Dashboard | 🟢 Đang phát triển thật (Next.js) | ✅ Có prototype tương ứng (Core Platform 001–010, Business Dashboard 070) |
| Admin | 🟢 Đang phát triển thật (Next.js) | ⚪ Chưa có prototype HTML riêng biệt cho Admin (Organization/Roles) |
| Trung tâm Đào tạo | ⚪ Nền móng (chưa code) | ✅ Prototype đầy đủ (011–020) |
| Trung tâm AI | ⚪ Nền móng | ✅ Prototype đầy đủ (021–041) + AI Agents (042–069, vượt phạm vi module gốc) |
| Business OS | ⚪ Nền móng | ✅ Prototype đầy đủ (070–101) |
| Factory OS | ⚪ Nền móng | ✅ Prototype đầy đủ (102–141) |
| Kho (Warehouse) | ⚪ Nền móng | ✅ Prototype đầy đủ (142–171, đặt tên "Smart Warehouse OS") |
| Tài chính (Finance) | ⚪ Nền móng | ✅ Prototype đầy đủ (172–201) |
| Marketplace | ⚪ Nền móng | 🔲 Future — chỉ có link `href="#"` placeholder từ Warehouse OS/Finance OS |
| Marketing | ⚪ Nền móng | 🔲 Future — chưa có prototype riêng |
| CRM | ⚪ Nền móng | ✅ Đã gộp vào Business OS prototype (070–101 bao gồm Lead/Opportunity/Pipeline/Ticket) |
| Affiliate | ⚪ Nền móng | 🔲 Future — chỉ có AI Agent tương ứng (`064_affiliate_agent.html`), chưa có module UI đầy đủ |
| Automation | ⚪ Nền móng | 🔲 Future — chỉ có AI Agent tương ứng (`065_automation_agent.html`) |
| Community | ⚪ Nền móng | 🔲 Future — chỉ có AI Agent tương ứng (`066_community_agent.html`) |
| Documents | ⚪ Nền móng | 🔲 Future — chỉ có AI Agent tương ứng (`067_documents_agent.html`) + Factory Documents (`134`) cục bộ |

## 3. Chú giải trạng thái

- ✅ **Completed** — đã có đủ màn hình UI prototype, qua ít nhất 1 vòng self-review kỹ thuật.
- 🟡 **In Progress** — hiện không có nhóm nào ở trạng thái này tại mốc UI Freeze (toàn bộ 199 file đã Completed).
- 🔲 **Future** — chưa có prototype HTML, cần lập kế hoạch riêng nếu muốn tiếp tục mở rộng UI trước khi vào Database Architecture, hoặc bỏ qua bước prototype và build thẳng trên Next.js app thật.

## 4. Định hướng sau UI Freeze

Theo đúng khung `UI_FREEZE_REPORT.md`, bước tiếp theo là **Database Architecture** — nghĩa là 199 màn hình này sẽ đóng vai trò tài liệu tham chiếu thiết kế (design reference) để đội ngũ phát triển Next.js apps thật (`apps/dashboard`, `apps/admin`, và các app module tương lai) build lại bằng React với dữ liệu thật, không phải để tiếp tục thêm HTML tĩnh mới. Các nhóm 🔲 Future (Marketplace, Marketing, Affiliate, Automation, Community, Documents) **không nằm trong phạm vi UI Freeze này** — quyết định có tiếp tục prototype hoá trước khi build thật hay bỏ qua bước này là quyết định của người điều hành dự án, ngoài phạm vi báo cáo kỹ thuật.
