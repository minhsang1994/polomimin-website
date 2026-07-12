# COLOR_SYSTEM.md

## 1. Bảng màu chủ đạo (Brand Palette)

| Vai trò | Hex | Ghi chú |
|---|---|---|
| Primary | `#1E3A8A` (indigo-900) | Màu thương hiệu chính — sidebar active, nút chính, focus ring, logo |
| Primary Dark | `#172554` | Điểm kết gradient tối, dark-mode input focus background |
| Primary Light | `#3B82F6` | Hover accent, focus border, link |
| Primary Gradient | `linear-gradient(135deg, #1E3A8A 0%, #0D9488 100%)` | Dùng cho: avatar, logo icon, nút CTA chính, AI float button, FAB, progress fill mặc định |
| Teal (accent phụ) | `#14B8A6` | Logo dot, "mark all read", hover trạng thái phụ |
| Teal Light | `#5EEAD4` | Hiếm dùng, dự phòng cho gradient phụ |

**Nhận xét:** Primary Gradient pha trộn Indigo (`#1E3A8A`) → Teal (`#0D9488`, không phải chính xác token `--teal`) — đây là 1 hex "rời rạc" không có token riêng, xuất hiện lặp lại y hệt ở mọi file (an toàn vì luôn cùng giá trị, nhưng nên được đặt tên `--teal-gradient-end` nếu chuẩn hóa sau này).

## 2. Nền & văn bản (Surface & Text)

| Token | Light | Dark |
|---|---|---|
| `--bg-body` | `#F1F5F9` (slate-100) | `#0F172A` (slate-900) |
| `--bg-surface` | `#FFFFFF` | `#1E293B` (slate-800) |
| `--bg-input` | `#F8FAFC` (slate-50) | `#1E293B` |
| `--bg-hover` | `#F1F5F9` | `#1E293B` |
| `--text-primary` | `#0F172A` | `#F1F5F9` |
| `--text-secondary` | `#475569` (slate-600) | `#94A3B8` (slate-400) |
| `--text-light` | `#94A3B8` | `#64748B` (slate-500) |
| `--border-color` | `#E2E8F0` (slate-200) | `#1E293B` |

Toàn bộ nền tảng màu dựa trên thang **Slate** của Tailwind (dù project không dùng Tailwind runtime, giá trị hex trùng khớp thang Slate 50–900). Đây là điểm nhất quán tốt: 1 hệ thống thang xám duy nhất cho toàn bộ 199 trang.

## 3. Màu ngữ nghĩa (Semantic / Status Colors)

Dùng trong `status-badge` / `*-badge` (biz-badge, fac-badge, wh-badge), toast, stat-card change indicator. **Định nghĩa giống hệt nhau ở cả 4 file layout** (business/factory/warehouse) + `status-badge` chung — xác nhận 0% lệch giá trị giữa các module:

| Trạng thái | Light bg / text | Dark bg / text | Ý nghĩa dùng |
|---|---|---|---|
| `green` | `#D1FAE5` / `#065F46` | `#064E3B` / `#6EE7B7` | Thành công, đã duyệt, trong ngân sách, đủ hàng |
| `amber` | `#FEF3C7` / `#92400E` | `#4A3007` / `#FCD34D` | Cảnh báo, chờ xử lý, sắp hết hạn |
| `red` | `#FEE2E2` / `#991B1B` | `#4C1414` / `#FCA5A5` | Lỗi, quá hạn, vượt ngân sách, hết hàng |
| `blue` | `#DBEAFE` / `#1E40AF` | `#1E3A5F` / `#93C5FD` | Thông tin trung tính, đang xử lý |
| `gray` | `#F1F5F9` / `#475569` | `#1E293B` / `#94A3B8` | Vô hiệu hoá, đã lưu trữ, không hoạt động |
| `purple` | `#EDE9FE` / `#5B21B6` | `#2E1F5E` / `#C4B5FD` | Phân loại đặc biệt (VD: vai trò cao cấp) |

Toast dùng cùng 4 màu viền trái nhưng không phải toàn bộ 6 màu trên:

| Toast type | Border-left |
|---|---|
| `error` | `#EF4444` |
| `success` | `#10B981` |
| `warning` | `#F59E0B` |
| `info` | `var(--primary-light)` `#3B82F6` |

**Điểm chưa thống nhất:** `#10B981`/`#F59E0B`/`#EF4444` (dùng cho toast + chart bar-fill + progress-fill variants) là 3 hex **khác** với hex dùng trong status-badge (`#065F46`/`#92400E`/`#991B1B` làm text, nền riêng). Cả hai bộ đều "xanh/vàng/đỏ" nhưng không cùng 1 token — tức có **2 thang màu ngữ nghĩa song song**: một cho badge/pill (nền nhạt + chữ đậm, chuẩn WCAG contrast tốt), một cho fill đặc (chart, progress, toast border, dùng để tô khối solid). Đây là chủ đích thiết kế hợp lý (nền nhạt cần độ tương phản khác khối đặc), nhưng **chưa được đặt tên token chính thức** — nên chuẩn hoá thành `--color-success-fill` / `--color-success-bg` / `--color-success-text` khi bước sang giai đoạn component hóa thật.

## 4. Bảng màu AI Agents (Persona Accent Colors)

Mỗi trong 24 AI Agent (`43`–`69`, trừ hub/marketplace/settings) tự khai báo 1 cặp `--agent-color` / `--agent-color-light` riêng để tạo bản sắc nhân vật — đây là **biến thể có chủ đích**, không phải lỗi:

| File | Agent | `--agent-color` |
|---|---|---|
| 43 | CEO Agent | `#1E3A8A` |
| 44 | Marketing Agent | `#DB2777` |
| 45 | Sales Agent | `#059669` |
| 46 | Customer Service Agent | `#7C3AED` |
| 47 | Factory Agent | `#EA580C` |
| 48 | Finance Agent | `#0891B2` |
| 49 | HR Agent | `#DC2626` |
| 50 | Legal Agent | `#334155` |
| 51 | Developer Agent | `#4F46E5` |
| 52 | Designer Agent | `#D946EF` |
| 53 | Video Agent | `#DC2626` |
| 54 | Content Agent | `#0D9488` |
| 55 | TikTok Agent | `#FE2C55` |
| 56 | Shopee Agent | `#EE4D2D` |
| 57 | Facebook Agent | `#1877F2` |
| 58 | Data Analyst Agent | `#0EA5E9` |
| 59 | Project Manager Agent | `#6366F1` |
| 62 | Warehouse Agent | `#92400E` |
| 63 | Production Agent | `#475569` |
| 64 | Affiliate Agent | `#16A34A` |
| 65 | Automation Agent | `#8B5CF6` |
| 66 | Community Agent | `#06B6D4` |
| 67 | Documents Agent | `#A16207` |
| 68 | Training Agent | `#2563EB` |
| 69 | Onboarding Agent | `#E11D48` |

Quy tắc: `--agent-color` dùng cho avatar/hero gradient/tab active/nút CTA/message bubble của riêng agent đó; **không ghi đè** `--primary` toàn cục — chỉ áp dụng cục bộ trong phạm vi trang agent. Ngoại lệ đã phát hiện (xác nhận bằng đối chiếu trực tiếp từng file, không suy diễn): **HR Agent (49)** và **Video Agent (53)** dùng chung tuyệt đối `#DC2626` — 2 persona khác nhau trùng mã màu, có thể gây nhầm lẫn nhận diện nếu hiển thị cạnh nhau (VD: `agents-grid` ở `42_ai_agents_dashboard.html` / `60_agent_marketplace.html`).

## 5. Dark Mode

Kích hoạt qua `[data-theme="dark"]` trên `<html>`, lưu trong `localStorage` (`mimin-theme`). Toàn bộ token nền/chữ/shadow có override riêng; **màu ngữ nghĩa (badge/status) và màu primary/teal/agent-color KHÔNG đổi giữa 2 theme** — chỉ nền và chữ trung tính đổi. Đây là pattern đúng chuẩn (brand color giữ nguyên, chỉ đảo nền/chữ).

## 6. Đề xuất chuẩn hóa (xem thêm UI_FREEZE_REPORT.md)

1. Đặt tên chính thức cho cặp hex "fill đặc" (`#10B981`/`#F59E0B`/`#EF4444`) thành token `--color-success` / `--color-warning` / `--color-danger`.
2. Đổi accent trùng giữa Warehouse Agent và Customer Service Agent để tránh nhầm lẫn.
3. Cân nhắc thêm `--radius-xl` (20px) vào một component cụ thể hoặc bỏ token nếu không dùng — hiện khai báo nhưng không xuất hiện trong bất kỳ rule nào đã khảo sát.
