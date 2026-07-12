# USER_FLOW.md — Luồng Người dùng theo Vai trò

Tài liệu mô tả **ai thao tác màn hình nào, theo trình tự nào** — góc nhìn con người thay vì dữ liệu. Nhân vật mẫu (persona) lấy đúng từ dữ liệu `USER` đã khai báo trong prototype (không hư cấu thêm).

## 1. Bảng vai trò chính đã có persona trong Prototype

| Vai trò | Persona mẫu | Module chính | Nguồn xác nhận |
|---|---|---|---|
| Founder & CEO | Hồ Minh Sang (MIMIN JSC) | Business OS, Core Platform, AI Studio | `70_business_dashboard.html` |
| Giám đốc Nhà máy | Trần Văn Bình (Xưởng May 1 - Bình Dương) | Factory OS | `102_factory_dashboard.html` |
| Quản lý Kho | Lý Thị Phượng | Warehouse OS | `142_warehouse_dashboard.html` |
| Kế toán trưởng | Đặng Thu Hà | Finance OS | `172_finance_dashboard.html` |

Các vai trò dưới đây **chưa có persona demo riêng** nhưng suy ra từ cấu trúc phân quyền đã thiết kế (`139_factory_permissions.html`, `169_inventory_permissions.html`, `199_finance_permissions.html`): Nhân viên Sales, Nhân viên Kho/Picking/Đóng gói, Thủ quỹ, Công nhân sản xuất.

## 2. User Flow: Founder & CEO (Hồ Minh Sang)

Vai trò xuyên suốt toàn bộ nền tảng — không giới hạn 1 module, cần góc nhìn tổng quan + quyền truy cập mọi nơi.

```
01_home_platform.html (Trang chủ nền tảng)
   → 02_overview.html (Tổng quan hệ thống)
   → 70_business_dashboard.html (Kiểm tra CRM & Sales)
   → 101_business_analytics.html (Phân tích kinh doanh)
   → 141_factory_home.html (Kiểm tra Production)
   → 171_warehouse_home.html (Kiểm tra Warehouse)
   → 201_finance_home.html (Kiểm tra Finance)
   → 42_ai_agents_dashboard.html → 43_ceo_agent.html (Hỏi CEO Agent tổng hợp báo cáo)
```

**Đặc điểm**: CEO là vai trò duy nhất hợp lý ghé qua **cả 4 trang "*_home"/"*_dashboard"** của 4 module nghiệp vụ liên tiếp trong 1 phiên làm việc — đúng vai trò giám sát toàn cục. Cũng là vai trò chính sử dụng `43_ceo_agent.html` (CEO Agent) để tổng hợp nhanh thay vì tự đọc từng dashboard.

## 3. User Flow: Sales/CRM (thao tác CRM & Sales)

```
90_lead_management.html (Ghi nhận Lead mới)
   → 91_opportunity_management.html (Chuyển thành Opportunity)
   → 92_pipeline_management.html (Theo dõi giai đoạn pipeline)
   → 78_price_management.html / 79_price_list.html (Lập báo giá)
   → 80_sales_order.html → 81_sales_order_detail.html (Xác nhận đơn hàng)
   → 86_contract_management.html (Soạn hợp đồng)
   → 96_calendar.html / 97_task_management.html (Lên lịch follow-up, tạo task)
   → 45_sales_agent.html (Nhờ Sales Agent theo dõi pipeline, soạn báo giá tự động)
```

**Điểm bàn giao sang vai trò khác**: sau khi `80_sales_order.html` chuyển trạng thái "Đã xác nhận", quyền thao tác tiếp theo chuyển sang **Giám đốc Nhà máy** (mục 4) — Sales không còn thao tác trực tiếp trên đơn hàng đó nữa, chỉ theo dõi trạng thái qua `81_sales_order_detail.html`.

## 4. User Flow: Giám đốc Nhà máy (Trần Văn Bình)

```
102_factory_dashboard.html (Xem tổng quan nhà máy)
   → 103_production_planning.html (Lập kế hoạch sản xuất từ đơn hàng mới)
   → 104_mrp.html (Chạy MRP tính nhu cầu vật tư)
   → 129_material_request.html / 130_purchase_request.html (Phát yêu cầu vật tư/mua hàng)
   → 122_production_schedule.html (Theo dõi lịch sản xuất — dùng Calendar)
   → 117_quality_control.html (Duyệt kết quả QC)
   → 133_factory_alert.html (Xử lý cảnh báo phát sinh)
   → 126_production_kpi.html / 131_production_report.html (Theo dõi KPI, xuất báo cáo)
   → 132_factory_dashboard_ai.html (Xem gợi ý AI — Factory Dashboard AI)
```

**Vai trò vận hành công đoạn** (Trưởng ca/Tổ trưởng — chưa có persona riêng nhưng suy ra từ cấu trúc): thao tác trực tiếp từng màn hình công đoạn `106`–`118` (Dệt→Nhuộm→...→Đóng gói) theo tuần tự, không cần truy cập `103`/`104` (thuộc quyền Giám đốc Nhà máy).

## 5. User Flow: Quản lý Kho (Lý Thị Phượng)

```
142_warehouse_dashboard.html (Xem tổng quan kho, cảnh báo tồn)
   → 155_inventory_alert.html (Xử lý cảnh báo tồn kho)
   → 147_stock_in.html / 148_stock_out.html (Duyệt phiếu nhập/xuất)
   → 151_cycle_count.html (Chỉ đạo kiểm kê định kỳ)
   → 156_inventory_forecast.html (Xem AI dự báo, quyết định đặt hàng trước)
   → 169_inventory_permissions.html (Phân quyền nhân viên kho)
```

Vai trò cấp dưới **Nhân viên Picking/Đóng gói** (đã định nghĩa trong `169_inventory_permissions.html`) thao tác hẹp hơn:

```
160_picking.html (Lấy hàng theo đơn — view Kanban)
   → 161_packing_station.html (Đóng gói)
   → 162_shipping.html (Bàn giao vận chuyển)
```

## 6. User Flow: Kế toán trưởng (Đặng Thu Hà)

```
172_finance_dashboard.html (Xem tổng quan tài chính)
   → 186_invoice_management.html (Kiểm tra hoá đơn cần xuất — đối chiếu Business OS)
   → 175_accounts_receivable.html (Theo dõi công nợ phải thu quá hạn)
   → 187_payment_management.html (Duyệt yêu cầu thanh toán — Kanban phê duyệt)
   → 193_journal_entries.html (Duyệt bút toán)
   → 181_profit_loss.html / 182_balance_sheet.html / 183_cash_flow.html (Xem báo cáo cuối kỳ)
   → 194_financial_reports.html (Xuất báo cáo tổng hợp gửi CEO)
   → 195_ai_finance.html (Xem gợi ý AI Finance)
```

## 7. User Flow: Nhân viên Logistics (vai trò suy luận, chưa có persona riêng)

```
148_stock_out.html (Nhận phiếu xuất từ Kho)
   → 160_picking.html → 161_packing_station.html → 162_shipping.html
   → 120_delivery.html (Factory OS — xác nhận đã giao thành phẩm)
   → 163_return_goods.html (Xử lý nếu có hàng trả về)
```

## 8. User Flow: Ban lãnh đạo xem báo cáo (Read-only, đa vai trò)

Khác với các vai trò thao tác (CRUD), vai trò "xem báo cáo" chỉ đọc — đại diện Ban Giám đốc/Nhà đầu tư:

```
201_finance_home.html → 194_financial_reports.html → 101_business_analytics.html
   → 140_factory_analytics.html → 168_inventory_analytics.html → 196_finance_analytics.html
```

Đã có tiền lệ phân quyền "Chỉ xem" trong `199_finance_permissions.html` (vai trò "Xem báo cáo (Ban lãnh đạo)", 5 người dùng) — xác nhận role-based access phù hợp cho nhóm này.

## 9. User Flow: HR (khoảng trống — chưa có prototype)

Chưa có persona/UI riêng cho vai trò Nhân sự (HR Manager). Suy luận từ sơ đồ nghiệp vụ gốc:

```
[Chưa có: Employee onboarding] → [Chưa có: Timesheet] → 189_salary_payment.html (chỉ phần chi lương, thuộc Finance OS)
   → [Chưa có: KPI Review] → 11_academy_home.html (Đào tạo, dùng chung không phân biệt nhân viên nội bộ/khách hàng)
```

Ghi nhận nhất quán với khoảng trống đã nêu ở `BUSINESS_FLOW.md` mục 2.6 và `DATA_FLOW.md` mục 2.6.

## 10. Ma trận Vai trò × Module (tổng hợp truy cập)

| Vai trò | CRM&Sales | Production | Warehouse | Logistics | Finance | HR | AI |
|---|---|---|---|---|---|---|---|
| Founder & CEO | Đọc/Ghi | Đọc | Đọc | Đọc | Đọc | Đọc *(dự kiến)* | Toàn quyền (43) |
| Sales/CRM | Toàn quyền | — | Đọc (tồn kho để chào hàng) | — | Đọc (công nợ khách) | — | 45 |
| Giám đốc Nhà máy | Đọc (đơn hàng) | Toàn quyền | Đọc/Ghi (NVL) | — | Đọc (giá thành) | Đọc (nhân công) | 47, 132 |
| Quản lý Kho | Đọc (tạo đơn từ tồn) | Đọc/Ghi (NVL) | Toàn quyền | Ghi (xuất hàng) | — | — | 62, 167 |
| Kế toán trưởng | Đọc (hoá đơn) | Đọc (giá thành) | Đọc (giá trị tồn) | Đọc (xác nhận giao) | Toàn quyền | Đọc (lương) | 48, 195 |
| Nhân sự *(dự kiến)* | — | Đọc (nhân công) | — | — | Ghi (lương) | Toàn quyền *(dự kiến)* | 49 |

## 11. Tham chiếu

- Điều kiện phê duyệt giữa các bước trong từng luồng: [WORKFLOW.md](WORKFLOW.md)
- Thông báo phát sinh khi chuyển vai trò xử lý: [WORKFLOW.md](WORKFLOW.md) mục Notification Flow
- Bản đồ đầy đủ 199 màn hình: [HTML_INDEX.md](HTML_INDEX.md)
