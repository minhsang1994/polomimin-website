# BUSINESS_FLOW.md — Luồng Nghiệp vụ Tổng thể MIMIN Platform

Tài liệu này mô tả luồng nghiệp vụ **đầu-cuối** (end-to-end) của MIMIN Platform: từ thời điểm khách hàng phát sinh nhu cầu đến khi đơn hàng được giao, thu tiền và tổng hợp báo cáo. Đây là tài liệu "WHY/WHAT" (vì sao và làm gì) — phần "HOW" (dữ liệu di chuyển thế nào giữa các entity) nằm ở [DATA_FLOW.md](DATA_FLOW.md), phần "ai dùng màn hình nào" nằm ở [USER_FLOW.md](USER_FLOW.md).

**Nguyên tắc thiết kế**: Luồng nghiệp vụ dưới đây được đối chiếu trực tiếp với 199 màn hình prototype đã build ở `pages/` — mỗi bước nghiệp vụ nêu trong tài liệu này đều trỏ tới ít nhất 1 màn hình cụ thể đã tồn tại (trừ phần HR, hiện chưa có module UI đầy đủ, xem mục 6).

---

## 1. Sơ đồ luồng nghiệp vụ đầu-cuối (Master Business Flow)

```
KHÁCH HÀNG PHÁT SINH NHU CẦU
        │
        ▼
┌─────────────────────┐
│  1. CRM & SALES      │  Lead → Báo giá → Đơn hàng → Hợp đồng
└──────────┬───────────┘
           │ (Đơn hàng đã xác nhận + Hợp đồng đã ký)
           ▼
┌─────────────────────┐
│  2. PRODUCTION       │  Kế hoạch SX → MRP → Mua NVL → ... → Kho thành phẩm
└──────────┬───────────┘
           │ (Thành phẩm nhập kho)
           ▼
┌─────────────────────┐
│  3. WAREHOUSE        │  Nhập → Xuất → Chuyển kho → Kiểm kê
└──────────┬───────────┘
           │ (Xuất kho theo đơn hàng)
           ▼
┌─────────────────────┐
│  4. LOGISTICS        │  Phiếu xuất → Đóng gói → Vận chuyển → Giao hàng
└──────────┬───────────┘
           │ (Đã giao hàng thành công)
           ▼
      KHÁCH HÀNG NHẬN HÀNG
           │
           ▼
┌─────────────────────┐
│  5. FINANCE           │  Hóa đơn → Thu tiền → Công nợ → Doanh thu → Chi phí → Lợi nhuận → Báo cáo
└──────────┬───────────┘
           │
           ▼
      BÁO CÁO HOÀN THÀNH CHU KỲ ĐƠN HÀNG

(Song song, xuyên suốt toàn bộ chu kỳ trên:)
┌─────────────────────┐        ┌─────────────────────┐
│  6. HR                │        │  7. AI                │
│  Nhân sự vận hành      │        │  Gateway → Agents →   │
│  toàn bộ quy trình     │        │  Insight/Forecast/Rec │
└─────────────────────┘        └─────────────────────┘
```

## 2. Chi tiết từng giai đoạn nghiệp vụ

### 2.1. CRM & Sales — Từ nhu cầu đến cam kết

| Bước | Nghiệp vụ | Màn hình prototype | Kết quả đầu ra |
|---|---|---|---|
| 1 | Ghi nhận khách hàng tiềm năng | `90_lead_management.html` | 1 bản ghi **Lead** |
| 2 | Đánh giá cơ hội bán hàng | `91_opportunity_management.html`, `92_pipeline_management.html` | Lead → **Opportunity** trong Pipeline |
| 3 | Lập báo giá | `78_price_management.html`, `79_price_list.html` | **Báo giá (Quote)** gửi khách hàng |
| 4 | Khách hàng chốt đơn | `80_sales_order.html`, `81_sales_order_detail.html` | **Đơn hàng (Sales Order)** đã xác nhận |
| 5 | Soạn thảo & ký hợp đồng | `86_contract_management.html` | **Hợp đồng** có hiệu lực |

**Điều kiện chuyển giai đoạn**: Đơn hàng phải ở trạng thái "Đã xác nhận" và Hợp đồng phải "Đã ký" trước khi Production được phép lập kế hoạch sản xuất (xem [WORKFLOW.md](WORKFLOW.md) mục Approval Flow).

### 2.2. Production — Từ đơn hàng đến thành phẩm

Chuỗi 18 công đoạn tuần tự (đúng theo yêu cầu gốc), mỗi công đoạn có màn hình riêng trong Factory OS (`102`–`141`):

```
Đơn hàng → Kế hoạch SX (103) → MRP (104) → Mua NVL (130) → Kho NVL/Sợi (105)
→ Dệt (106) → Nhuộm (107) → Kiểm vải (108) → Kho vải (109) → Cắt (110-111)
→ In (112) / Thêu (113) → May (114) → Khuy nút (115) → Ủi (116)
→ QC (117) → Đóng gói (118) → Kho thành phẩm (119)
```

**Đặc thù ngành may mặc**: 2 công đoạn "In" và "Thêu" chạy **song song** (không tuần tự bắt buộc), tuỳ theo yêu cầu thiết kế sản phẩm — không phải mọi đơn hàng đều cần cả 2. Đây là điểm rẽ nhánh (branch) duy nhất trong chuỗi Production, còn lại là luồng tuần tự nghiêm ngặt (mỗi công đoạn phụ thuộc hoàn thành công đoạn trước).

**Dữ liệu hỗ trợ xuyên suốt**: Máy móc (`123_machine_management.html`), Công nhân (`124_worker_management.html`), Ca làm việc (`125_work_shift.html`), Gia công ngoài (`121_subcontractor.html`), Hao hụt (`128_waste_management.html`) — không nằm trên trục chính nhưng cung cấp dữ liệu vào cho từng công đoạn.

### 2.3. Warehouse — Quản trị tồn kho xuyên suốt

Warehouse không phải 1 giai đoạn tuyến tính đơn lẻ mà là **lớp dịch vụ tồn kho dùng chung**, được cả Production lẫn Logistics gọi tới:

```
Kho nguyên liệu (143) ⇄ Nhập (147) / Xuất (148) / Chuyển kho (149) ⇄ Kiểm kê (151) ⇄ Kho thành phẩm (146)
```

Warehouse OS (`142`–`171`) nhận thành phẩm từ Production (mục 2.2) và cấp phát hàng cho Logistics (mục 2.4) — đóng vai trò "bể chứa trung gian" giữa 2 giai đoạn.

### 2.4. Logistics — Từ kho đến tay khách hàng

| Bước | Nghiệp vụ | Màn hình prototype |
|---|---|---|
| 1 | Lập phiếu xuất kho | `148_stock_out.html` |
| 2 | Lấy hàng theo đơn (Picking) | `160_picking.html` |
| 3 | Đóng gói | `161_packing_station.html` |
| 4 | Vận chuyển | `162_shipping.html` |
| 5 | Giao hàng | `120_delivery.html` (Factory OS, giao thành phẩm) + `159_delivery_schedule.html` (lịch giao hàng NCC/khách) |

**Ghi chú kiến trúc**: Logistics **không phải module UI riêng biệt** trong prototype hiện tại — các màn hình logistics nằm rải trong Warehouse OS (`158`–`162`) và một phần Factory OS (`120`). Về mặt nghiệp vụ đây là 1 luồng độc lập (đúng như user yêu cầu); về mặt UI hiện tại nó là tập con của Warehouse OS. Xem [MODULE_FLOW.md](MODULE_FLOW.md) mục 3 để biết cách 2 module chia sẻ ranh giới này.

### 2.5. Finance — Từ giao hàng đến báo cáo lợi nhuận

```
Đơn hàng (80) → Hóa đơn (186/87) → Thu tiền (188/89) → Công nợ (175 Phải thu / 176 Phải trả)
→ Doanh thu (178) → Chi phí (177) → Lợi nhuận (181 P&L) → Báo cáo tài chính (194)
```

Finance OS (`172`–`201`) là điểm hội tụ cuối cùng của toàn bộ chu kỳ — mọi giao dịch phát sinh ở CRM/Production/Warehouse/Logistics đều có hệ quả tài chính được ghi nhận tại đây (xem [DATA_FLOW.md](DATA_FLOW.md) mục 4 về cơ chế đối chiếu chéo module).

### 2.6. HR — Vận hành nhân sự (chưa có module UI đầy đủ)

```
Nhân viên → Chấm công → Lương → KPI → Đào tạo
```

**Trạng thái hiện tại**: HR **chưa có module UI đầy đủ** trong prototype. Các mảnh ghép đã tồn tại rải rác:
- Công nhân/Ca làm việc: `124_worker_management.html`, `125_work_shift.html` (thuộc Factory OS, phạm vi hẹp — chỉ nhân sự sản xuất)
- Trả lương: `189_salary_payment.html` (thuộc Finance OS, góc nhìn kế toán — chỉ phần "chi lương", không phải chấm công/KPI/đào tạo)
- HR Agent: `49_hr_agent.html` (AI Agent, không phải module nghiệp vụ)
- Đào tạo: `11`–`20` (Academy — đào tạo nội bộ/khách hàng chung, không phải riêng cho nhân viên theo KPI)

→ **Đây là khoảng trống module rõ ràng nhất trong toàn bộ Business Flow** — chưa có 1 "Human Resources OS" thống nhất từ Chấm công → KPI → Đào tạo. Ghi nhận là hạng mục cần bổ sung trước khi bước sang Database Architecture nếu HR là phạm vi bắt buộc của giai đoạn tiếp theo.

### 2.7. AI — Lớp thông minh xuyên suốt (cross-cutting)

AI không phải 1 giai đoạn trong chuỗi tuyến tính mà là **lớp quan sát và gợi ý chạy song song** với cả 6 module nghiệp vụ trên:

```
Tất cả Module → AI Gateway → AI Agents → Insight → Forecast → Recommendation
```

Chi tiết đầy đủ tại [AI_FLOW.md](AI_FLOW.md).

## 3. Vòng đời 1 đơn hàng — theo dõi xuyên suốt 5 module

Ví dụ cụ thể hoá Master Business Flow bằng 1 đơn hàng mẫu, giúp hình dung tính liên tục:

1. **CRM**: Khách hàng "Công ty TNHH Long An Garment" được ghi nhận Lead (`90`) → chuyển Opportunity (`91`) → nhận báo giá 10.000 áo thun (`78`/`79`) → xác nhận Đơn hàng SO-2026-xxx (`80`) → ký Hợp đồng (`86`).
2. **Production**: Đơn hàng kích hoạt Kế hoạch sản xuất (`103`) → chạy MRP tính nhu cầu NVL (`104`) → phát Yêu cầu vật tư (`129`)/Đề nghị mua (`130`) → nguyên liệu qua 15 công đoạn → nhập Kho thành phẩm (`119`).
3. **Warehouse**: Thành phẩm từ Factory OS đồng bộ sang Kho thành phẩm Warehouse OS (`146`) → theo dõi tồn qua Kiểm kê (`151`).
4. **Logistics**: Lập phiếu xuất (`148`) → Picking (`160`) → Đóng gói (`161`) → Xuất hàng (`162`) → Giao hàng.
5. **Finance**: Xuất Hóa đơn (`186`) khớp với Đơn hàng gốc → khách thanh toán, ghi Phiếu thu (`188`) → cập nhật Công nợ phải thu (`175`) → ghi nhận Doanh thu (`178`) → cuối kỳ tổng hợp vào Báo cáo lãi lỗ (`181`) và Báo cáo tài chính (`194`).

Toàn bộ vòng đời trên được AI Gateway quan sát liên tục (VD: `156_inventory_forecast.html` dự báo tồn kho dựa trên tốc độ tiêu thụ từ các đơn hàng tương tự, `195_ai_finance.html` cảnh báo dòng tiền dựa trên công nợ phải thu tồn đọng).

## 4. Ranh giới trách nhiệm giữa các module (Business Boundary)

| Module | Bắt đầu khi | Kết thúc khi | Bàn giao cho |
|---|---|---|---|
| CRM & Sales | Có nhu cầu khách hàng | Hợp đồng ký + Đơn hàng xác nhận | Production |
| Production | Nhận đơn hàng đã xác nhận | Thành phẩm nhập kho | Warehouse |
| Warehouse | Nhận thành phẩm hoặc NVL | Hàng sẵn sàng xuất theo yêu cầu | Logistics (xuất) hoặc Production (cấp NVL) |
| Logistics | Có phiếu xuất kho | Giao hàng thành công, khách xác nhận | Finance (đối soát công nợ) |
| Finance | Có giao dịch phát sinh giá trị (đơn hàng/mua hàng/lương...) | Ghi nhận đầy đủ vào sổ sách + báo cáo | Ban lãnh đạo (qua Report Flow) |
| HR | Nhân viên được tuyển dụng *(ngoài phạm vi prototype hiện tại)* | Đánh giá KPI + hoàn thành đào tạo | Production/mọi module (nhân sự vận hành) |
| AI | Dữ liệu phát sinh ở bất kỳ module nào | Sinh insight/forecast/recommendation | Người dùng cuối ở mọi module (qua AI Float/Insight Card) |

## 5. Tham chiếu

- Luồng dữ liệu kỹ thuật chi tiết: [DATA_FLOW.md](DATA_FLOW.md)
- Cách các module gọi lẫn nhau: [MODULE_FLOW.md](MODULE_FLOW.md)
- Ai thao tác màn hình nào: [USER_FLOW.md](USER_FLOW.md)
- Điều kiện phê duyệt giữa các giai đoạn: [WORKFLOW.md](WORKFLOW.md)
- Tổng hợp báo cáo cuối chu kỳ: [REPORT_FLOW.md](REPORT_FLOW.md)
