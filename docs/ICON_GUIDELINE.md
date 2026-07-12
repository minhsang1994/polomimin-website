# ICON_GUIDELINE.md

## 1. Hệ thống icon: 100% Emoji, không dùng icon font/SVG

Đã khảo sát toàn bộ 199 file: **0 file** dùng Font Awesome, Material Icons, Feather Icons, hoặc SVG sprite. Toàn bộ icon trong sidebar, header, stat card, button, badge, empty state, toast, notification đều là **ký tự Emoji Unicode** đặt trực tiếp trong HTML/JS string.

Đây là quyết định thiết kế nhất quán và có chủ đích: emoji tải tức thời (không cần font/network request riêng), tự động thích ứng dark mode (không cần đổi màu icon thủ công), và mang tính biểu cảm cao phù hợp thị trường Việt Nam.

## 2. Quy tắc kích thước theo ngữ cảnh

| Ngữ cảnh | Kích thước | Ví dụ |
|---|---|---|
| Nav icon (sidebar) | `20px` | 🏠 💰 🏭 |
| Header action icon | `20px` (nút `40×40px`) | 🌓 🔔 |
| Stat/KPI card icon | `18px` (khung `36×36px`) | 💰 📈 |
| Data-grid card icon | `22px` (khung `44×44px`) | 📦 🏢 |
| Agent avatar | `30px` (khung `64×64px`) | 🧠 💼 |
| Empty state icon | `48px` | 📭 🔍 |
| Notification/timeline icon | `16–20px` | 🔔 ✅ |
| Info/tooltip trigger | `10px` (khung tròn `16×16px`, không phải emoji mà là chữ "i") | ℹ️ dạng text `i` |
| AI Float / FAB | `24–26px` | 🧠 ➕ |

## 3. Danh mục ngữ nghĩa (Semantic Icon Categories)

| Nhóm | Icon phổ biến | Ý nghĩa |
|---|---|---|
| Tài chính / tiền | 💰 💵 🏦 💳 🧾 📥 📤 | Doanh thu, chi phí, ngân hàng, hoá đơn |
| Kho / vận hành | 📦 🏬 🧶 🧵 🔘 🚚 | Kho hàng, nguyên vật liệu, vận chuyển |
| Sản xuất | 🏭 🧵 ✂️ 🪡 ⚙️ | Nhà máy, cắt may, quy trình |
| AI / thông minh | 🧠 🤖 💬 | Trợ lý AI, gợi ý, chat |
| Trạng thái tích cực | ✅ 📈 🎉 | Hoàn tất, tăng trưởng |
| Trạng thái cảnh báo | 🚨 ⚠️ ⏳ ⏰ | Cần chú ý, đang chờ, sắp hết hạn |
| Trạng thái tiêu cực | 💥 ❌ ↩️ | Lỗi, hàng hỏng, hoàn trả |
| Con người / vai trò | 👤 👥 👛 🔐 | Người dùng, nhân sự, phân quyền |
| Tài liệu / báo cáo | 📄 📋 📊 📚 📝 | Hợp đồng, báo cáo, sổ sách |
| Điều hướng / hệ thống | 🏠 ⚙️ 🔍 🔔 🌓 | Trang chủ, cấu hình, tìm kiếm, theme |

## 4. Quy tắc Accessibility

- Icon thuần trang trí (không mang thông tin bổ sung ngoài text đi kèm) → **luôn kèm `aria-hidden="true"`**. VD: `<span class="ai-icon" aria-hidden="true">🧠</span>`.
- Icon là **nút hành động độc lập** (không có text label nhìn thấy) → **bắt buộc có `aria-label`**. VD: `<button class="action-btn" id="notifBtn" aria-label="Mở thông báo">🔔</button>`.
- Icon trong badge/status **không** cần `aria-hidden` riêng vì text đi kèm luôn giải thích đủ ngữ nghĩa (badge luôn có text, không bao giờ chỉ icon đơn độc).

**Tuân thủ ở mức cao**: khảo sát cho thấy hầu hết icon hành động (nút header, FAB, action-btn) đều có `aria-label` hoặc `title` đi kèm — quy tắc này được áp dụng đồng đều từ file `01` đến `201`.

## 5. Không dùng icon để truyền tải thông tin duy nhất

Nguyên tắc xuyên suốt: **không có trường hợp nào icon là nguồn thông tin duy nhất** — mọi icon quan trọng (trạng thái, hành động) đều đi kèm text/tooltip/label. Đây là thực hành tốt cho khả năng tiếp cận (accessibility) và đa ngôn ngữ (icon không cần dịch, nhưng text đi kèm mới mang nghĩa thật).

## 6. Đề xuất chuẩn hoá

1. Không cần thay đổi cơ chế (emoji tiếp tục phù hợp cho giai đoạn Product Architecture), nhưng nên lập **1 bảng tra cứu emoji → ý nghĩa chính thức** (mở rộng từ mục 3) để tránh 1 khái niệm dùng nhiều emoji khác nhau ở các trang khác nhau (VD: "Kho vải" dùng cả 🧵 lẫn 🧶 tuỳ trang).
2. Khi chuyển sang Database Architecture và có thể cần icon động theo dữ liệu (VD icon từ CMS), nên định nghĩa 1 map `iconKey → emoji` tập trung thay vì hard-code emoji rải rác trong từng file JS.
