# ANIMATION_GUIDE.md

## 1. Nguyên tắc chung

- Thời lượng ngắn (`0.15s`–`0.4s`), dùng easing `ease` mặc định hoặc `cubic-bezier(0.4, 0, 0.2, 1)` cho sidebar — không có animation nào dài quá 0.4s, phù hợp triết lý "micro-interaction" không gây chậm trải nghiệm.
- Animation chủ yếu phục vụ 2 mục đích: (a) phản hồi trạng thái mở/đóng (modal, drawer, popover, tab), (b) tạo cảm giác dữ liệu "xuất hiện có trật tự" khi render danh sách (card, row) qua `animation-delay` tăng dần theo index.

## 2. Bảng keyframes đã đối chiếu toàn bộ CSS

| Keyframe | Định nghĩa ở | Mục đích | Trùng lặp? |
|---|---|---|---|
| `fadeIn` | main.css | Notification popover xuất hiện | Dùng chung, không trùng |
| `slideIn` | main.css | Drawer trượt từ phải vào | Dùng chung, không trùng |
| `toastIn` / `toastOut` | main.css | Toast xuất hiện/biến mất | Dùng chung, không trùng |
| `fadeTab` | agent-layout.css | Chuyển tab trong Agent page | ⚠️ Trùng logic với `bizFadeTab`/`facFadeTab`/`whFadeTab` |
| `bizFadeTab` | business-layout.css | Chuyển tab (Business/Finance OS) | ⚠️ Trùng logic với `fadeTab` |
| `facFadeTab` | factory-layout.css | Chuyển tab (Factory OS) | ⚠️ Trùng logic |
| `whFadeTab` | warehouse-layout.css | Chuyển tab (Warehouse OS) | ⚠️ Trùng logic |
| `cardIn` | agent-layout.css | KPI card xuất hiện tuần tự | ⚠️ Trùng logic với `bizCardIn`/`facCardIn`/`whCardIn` |
| `bizCardIn` | business-layout.css | Stat/Kanban/Grid card xuất hiện | ⚠️ Trùng logic |
| `facCardIn` | factory-layout.css | Stat/Kanban card xuất hiện | ⚠️ Trùng logic |
| `whCardIn` | warehouse-layout.css | Stat/Grid/Kanban card xuất hiện | ⚠️ Trùng logic |
| `bizRowIn` | business-layout.css | Table row xuất hiện | ⚠️ Trùng logic với `facRowIn`/`whRowIn` |
| `facRowIn` | factory-layout.css | Table row xuất hiện | ⚠️ Trùng logic |
| `whRowIn` | warehouse-layout.css | Table row xuất hiện | ⚠️ Trùng logic |
| `bizModalIn` | business-layout.css | Modal mở (scale + fade) | ⚠️ Trùng logic với `facModalIn`/`whModalIn` |
| `facModalIn` | factory-layout.css | Modal mở | ⚠️ Trùng logic |
| `whModalIn` | warehouse-layout.css | Modal mở | ⚠️ Trùng logic |
| `msgIn` | agent-layout.css | Tin nhắn chat xuất hiện | Không trùng (riêng cho Chat) |
| `typingBounce` | agent-layout.css | Chấm "đang gõ..." nhảy | Không trùng (riêng cho Chat) |
| `bizPulse` | business-layout.css | Skeleton loading nhấp nháy | Không trùng, nhưng chỉ tồn tại ở business-layout — chưa có ở factory/warehouse |

**Kết luận:** 4/7 nhóm animation (FadeTab, CardIn, RowIn, ModalIn) bị **định nghĩa lặp lại y hệt 3–4 lần** với tên khác nhau theo prefix module, dù logic keyframe hoàn toàn giống nhau (đối chiếu từng dòng: `bizCardIn`, `facCardIn`, `whCardIn`, `cardIn` đều là `from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)}`). Đây là điểm trùng lặp CSS rõ ràng nhất trong toàn bộ audit — xem thêm [UI_FREEZE_REPORT.md](../UI_FREEZE_REPORT.md) mục 3.

## 3. Bảng animation theo thời lượng

| Thời lượng | Dùng cho |
|---|---|
| `0.15s` | Table row hover, tooltip transition |
| `0.2s` | Nav item hover, filter chip, toggle switch, tab hover |
| `0.25s` | Sidebar slide, button hover scale, card hover, modal open |
| `0.3s` | Tab content fade-in, card entrance |
| `0.35s` | Stat card entrance (khi có `animation-delay` tăng dần) |
| `0.4s` | Toast vào, drawer trượt, progress bar fill transition |
| `1.2s` | Typing indicator bounce (loop `infinite`) |
| `1.4s` | Skeleton pulse (loop `infinite`) |

## 4. Hiệu ứng tương tác (không phải keyframe, dùng `transition`)

| Hiệu ứng | Rule |
|---|---|
| Nút phóng to nhẹ khi hover | `transform: scale(1.03)` hoặc `scale(1.04)` (AI Float), `scale(1.08) rotate(90deg)` (FAB) |
| Card nhấc lên khi hover | `transform: translateY(-2px)` (stat card) hoặc `translateY(-3px)` (grid card) + `box-shadow` tăng cấp |
| Đóng nút xoay khi hover | `.bm-close:hover { transform: rotate(90deg); }` — áp dụng cho mọi nút đóng Modal (biz/fac/wh) |
| Input focus | Viền đổi màu `--primary-light` + `box-shadow: 0 0 0 4px rgba(59,130,246,.08)` (ring effect) |

## 5. Animation-delay theo thứ tự (Stagger Pattern)

Mọi danh sách card (`renderStatCards`, `renderKpis`) áp dụng `style.animationDelay = \`${i * 0.05}s\`` trong JS — tạo hiệu ứng xuất hiện tuần tự từng thẻ cách nhau 50ms. Pattern này nhất quán ở `business-layout.js`, `factory-layout.js`, `warehouse-layout.js`, `agent-layout.js` — đúng 1 công thức `i * 0.05`.

## 6. Đề xuất chuẩn hoá

1. Hợp nhất `bizCardIn`/`facCardIn`/`whCardIn`/`cardIn` → 1 keyframe `entranceCardIn` duy nhất trong `main.css`, loại bỏ 3 bản sao.
2. Tương tự cho `RowIn`, `ModalIn`, `FadeTab` — mỗi nhóm chỉ cần 1 keyframe dùng chung, các class theo prefix chỉ cần tham chiếu tên chung.
3. Đưa `bizPulse` (skeleton loading) lên `main.css` để Factory OS và Warehouse OS cũng có thể dùng — hiện 2 module đó không có trạng thái loading skeleton.
