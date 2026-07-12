# REPORT_FLOW.md — Luồng Tổng hợp Báo cáo

Tài liệu mô tả cách dữ liệu tác nghiệp (operational data) ở từng module **cộng dồn dần lên** thành báo cáo cấp module, rồi tiếp tục tổng hợp thành báo cáo cấp điều hành (executive report) — điểm kết thúc của Master Business Flow (xem `BUSINESS_FLOW.md` mục 1).

## 1. Nguyên tắc phân tầng báo cáo (Report Layering)

```
Tầng 1: Dữ liệu giao dịch (Transaction Level)
   ↓ cộng dồn theo thời gian thực
Tầng 2: Báo cáo vận hành (Operational Report) — theo ngày/tuần
   ↓ tổng hợp theo kỳ kế toán/kỳ báo cáo
Tầng 3: Báo cáo phân tích (Analytics Report) — theo tháng/quý, có xu hướng
   ↓ hợp nhất chéo module
Tầng 4: Báo cáo điều hành (Executive Report) — cấp CEO/Ban lãnh đạo
```

## 2. Báo cáo theo từng module (Tầng 2–3)

| Module | Báo cáo vận hành (Tầng 2) | Báo cáo phân tích (Tầng 3) |
|---|---|---|
| CRM & Sales | `98_business_report.html` | `101_business_analytics.html` |
| Production | `131_production_report.html`, `126_production_kpi.html` | `140_factory_analytics.html` |
| Warehouse | `157_inventory_report.html` | `168_inventory_analytics.html` |
| Logistics | *(chưa có báo cáo riêng — số liệu nằm rải trong `157`)* | *(chưa có)* |
| Finance | `194_financial_reports.html` (trung tâm tổng hợp) gồm `181` P&L, `182` Balance Sheet, `183` Cash Flow | `196_finance_analytics.html` |
| HR | *(chưa có — module gốc chưa có UI)* | *(chưa có)* |

## 3. Sơ đồ luồng cộng dồn báo cáo (Report Roll-up Flow)

```
SalesOrder, Invoice, Receipt (CRM & Sales, Finance)
WorkOrder, QCResult (Production)
StockIn/Out, CycleCount (Warehouse)
Shipment (Logistics)
        │
        ▼
┌─────────────────────────────────────────────┐
│  Báo cáo cấp module (Tầng 2)                  │
│  98, 131, 126, 157, 189 (payroll báo cáo lương)│
└──────────────────────┬────────────────────────┘
                        ▼
┌─────────────────────────────────────────────┐
│  Phân tích xu hướng cấp module (Tầng 3)        │
│  101, 140, 168, 196                            │
└──────────────────────┬────────────────────────┘
                        ▼
┌─────────────────────────────────────────────┐
│  194_financial_reports.html                    │
│  (điểm hội tụ: P&L + Balance Sheet + Cash Flow) │
└──────────────────────┬────────────────────────┘
                        ▼
┌─────────────────────────────────────────────┐
│  Báo cáo điều hành (Tầng 4)                    │
│  — CEO xem qua 43_ceo_agent.html hoặc duyệt     │
│    lần lượt qua *_home.html của từng module     │
└─────────────────────────────────────────────┘
```

**Nhận xét kiến trúc quan trọng**: `194_financial_reports.html` không chỉ là báo cáo riêng của Finance mà thực chất đóng vai trò **điểm hội tụ báo cáo toàn nền tảng** — vì P&L (Giá vốn hàng bán) phụ thuộc dữ liệu giá thành từ Production (`127_cost_management.html`), Balance Sheet (Hàng tồn kho) phụ thuộc giá trị tồn kho từ Warehouse (`157_inventory_report.html`). Đây là bằng chứng cụ thể hoá nguyên tắc đã nêu ở `BUSINESS_FLOW.md` mục 2.5: "Finance OS là điểm hội tụ cuối cùng của toàn bộ chu kỳ."

## 4. Chu kỳ báo cáo (Report Cadence)

| Loại báo cáo | Tần suất | Người xem chính |
|---|---|---|
| Cảnh báo tức thời (Alert) | Thời gian thực | Người vận hành trực tiếp (`133_factory_alert.html`, `155_inventory_alert.html`) |
| Báo cáo vận hành | Hàng ngày/hàng tuần | Quản lý cấp trung (Giám đốc Nhà máy, Quản lý Kho) |
| Báo cáo phân tích | Hàng tháng | Quản lý cấp cao + Kế toán trưởng |
| Báo cáo tài chính hợp nhất | Hàng quý (P&L, Balance Sheet, Cash Flow) | CEO + Kế toán trưởng |
| Báo cáo điều hành tổng thể | Theo yêu cầu (on-demand qua CEO Agent) | CEO |

## 5. AI trong luồng báo cáo

AI tham gia luồng báo cáo ở **2 điểm**:

1. **Trước khi báo cáo hình thành** — AI Forecast (`156`, `196`, `140`) tạo dự báo bổ sung vào báo cáo phân tích, không chỉ nhìn lại quá khứ mà còn nhìn trước xu hướng.
2. **Sau khi báo cáo hình thành** — Data Analyst Agent (`58_data_analyst_agent.html`) và CEO Agent (`43_ceo_agent.html`) đọc lại toàn bộ báo cáo đã tổng hợp để trả lời câu hỏi tự nhiên ngôn ngữ (VD "Tháng này lợi nhuận có tốt hơn tháng trước không?") thay vì người dùng phải tự mở từng trang so sánh.

## 6. Khoảng trống cần bổ sung

1. **Logistics chưa có báo cáo vận hành riêng** — số liệu giao hàng/vận chuyển hiện ẩn trong `157_inventory_report.html`, nên tách riêng khi Logistics trở thành module UI độc lập.
2. **HR chưa có bất kỳ báo cáo nào** — nhất quán với khoảng trống đã nêu ở `BUSINESS_FLOW.md`/`DATA_FLOW.md`/`USER_FLOW.md`.
3. **Chưa có 1 trang "Báo cáo điều hành hợp nhất" (Executive Dashboard) thực sự** — hiện CEO phải tự ghé lần lượt 4 trang `*_home`/`*_dashboard`, chưa có màn hình tổng hợp 1 lần duy nhất kiểu "1 trang nhìn thấy tất cả module." Đây là ứng viên hợp lý cho 1 màn hình mới ở giai đoạn Product Architecture (ngoài phạm vi Stage 3 — chỉ ghi nhận, không đề xuất tạo mới ở đây).

## 7. Tham chiếu

- Nguồn dữ liệu gốc cho từng báo cáo: [DATA_FLOW.md](DATA_FLOW.md)
- AI Forecast chi tiết: [AI_FLOW.md](AI_FLOW.md) mục 4
- Ai được xem báo cáo nào: [USER_FLOW.md](USER_FLOW.md) mục 8, 10
