# MODULE_FLOW.md — Luồng Tương tác Giữa Các Module

Tài liệu này mô tả **cách các module gọi/kích hoạt lẫn nhau** ở mức hệ thống — module nào là thượng nguồn (upstream) của module nào, độ trễ kích hoạt (đồng bộ hay bất đồng bộ), và bằng chứng thực tế đã có trong prototype (khối "Cross-module Quick Link" đã build ở Warehouse OS/Finance OS).

## 1. Sơ đồ phụ thuộc Module (Module Dependency Graph)

```
                    ┌───────────────┐
                    │  CRM & Sales   │
                    └───────┬────────┘
                            │ (1) Đơn hàng xác nhận + Hợp đồng
                            ▼
                    ┌───────────────┐
                    │  Production    │
                    └───────┬────────┘
                            │ (2) Thành phẩm nhập kho
                            ▼
              ┌─────────────────────────┐
              │       Warehouse          │◄──────┐
              └───────────┬─────────────┘        │ (2b) Yêu cầu vật tư
                            │ (3) Xuất kho theo đơn      │ (Warehouse → Production,
                            ▼                             ngược dòng khi thiếu NVL)
                    ┌───────────────┐                    │
                    │  Logistics     │────────────────────┘
                    └───────┬────────┘
                            │ (4) Giao hàng xác nhận
                            ▼
                    ┌───────────────┐
                    │  Finance       │
                    └───────────────┘

        ┌───────────────┐         ┌───────────────┐
        │  HR            │         │  AI            │
        │ (nền tảng nhân  │         │ (lớp quan sát   │
        │  sự, hỗ trợ mọi │         │  toàn hệ thống) │
        │  module khác)   │         │                │
        └───────────────┘         └───────────────┘
              ▲                          ▲
              └──────────┬───────────────┘
                 Cả 2 không nằm trên trục chính,
                 mà cắt ngang (cross-cutting) qua toàn bộ 5 module trên
```

## 2. Bảng quan hệ Upstream/Downstream

| Module | Upstream (nhận dữ liệu từ) | Downstream (gửi dữ liệu tới) | Kiểu kích hoạt |
|---|---|---|---|
| CRM & Sales | — (điểm khởi đầu) | Production (đơn hàng), Finance (hợp đồng làm căn cứ hoá đơn) | Đồng bộ (người dùng xác nhận đơn hàng ngay trên UI) |
| Production | CRM & Sales | Warehouse (thành phẩm), ngược lại Warehouse khi cần NVL | Bất đồng bộ (kế hoạch sản xuất chạy theo lịch, không tức thời) |
| Warehouse | Production (thành phẩm), CRM & Sales (đơn hàng cần xuất) | Logistics (hàng xuất kho), Production (cấp NVL) | Hỗn hợp — nhập/xuất tức thời (đồng bộ), kiểm kê định kỳ (bất đồng bộ) |
| Logistics | Warehouse | Finance (xác nhận giao hàng để xuất hoá đơn) | Đồng bộ theo lô giao hàng (mỗi chuyến xe) |
| Finance | CRM & Sales, Production (giá thành), Warehouse (giá trị tồn kho), Logistics (xác nhận giao), HR (lương) | Report Flow (báo cáo tổng hợp) | Bất đồng bộ, chốt theo kỳ kế toán (ngày/tháng/quý) |
| HR | — (module nền tảng) | Production (nhân sự vận hành máy/ca), Finance (chi phí lương) | Bất đồng bộ, chốt theo kỳ lương |
| AI | Tất cả 6 module trên (chỉ đọc) | Tất cả 6 module trên (hiển thị insight ngược lại) | Bất đồng bộ, chạy nền liên tục |

## 3. Bằng chứng thực tế trong Prototype: Cross-module Quick Link

Prototype đã hiện thực hoá quan hệ module bằng component "Cross-module Quick Link" (xem `docs/COMPONENT_LIBRARY.md` mục 28) — đây là bằng chứng UI cụ thể cho sơ đồ phụ thuộc ở mục 1:

| Từ trang | Tới module | Tới trang | Quan hệ minh hoạ |
|---|---|---|---|
| `143_material_inventory.html` (Warehouse) | Factory OS | `129_material_request.html` | Warehouse ⇢ Production (yêu cầu vật tư) |
| `144_fabric_inventory.html` (Warehouse) | Factory OS | `109_fabric_inventory.html` | Warehouse ⇢ Production (đồng bộ tồn vải) |
| `146_finished_goods_inventory.html` (Warehouse) | Business OS | `80_sales_order.html` | Warehouse ⇢ CRM & Sales (tạo đơn từ tồn kho có sẵn) |
| `156_inventory_forecast.html` (Warehouse) | Factory OS | `130_purchase_request.html` | Warehouse (AI dự báo thiếu hàng) ⇢ Production (đề nghị mua) |
| `158_supplier_delivery.html` (Warehouse/Logistics) | Business OS | `82_purchase_order_detail.html`, `83_purchase_order_detail.html` | Logistics ⇢ CRM & Sales (đối chiếu đơn mua) |
| `186_invoice_management.html` (Finance) | Business OS | `87_invoice_management.html` | Finance ⇢ CRM & Sales (đồng bộ hoá đơn gốc) |
| `201_finance_home.html` | Factory OS, Warehouse OS | `127_cost_management.html`, `157_inventory_report.html` | Finance ⇢ Production + Warehouse (giá thành, giá trị tồn kho) |

**Nhận xét quan trọng**: Cơ chế Cross-module Quick Link **chỉ xuất hiện từ Warehouse OS trở đi** (`142`+) — Business OS (`70`–`101`) và Factory OS (`102`–`141`) được xây trước khi quy ước này hình thành nên **không có liên kết chéo xuất ra ngoài module của chính nó** (chỉ có liên kết chéo module **đến** chúng từ Warehouse/Finance OS, không có chiều ngược lại). Đây là khoảng trống nhất quán đã ghi nhận ở `UI_FREEZE_REPORT.md`, nhắc lại ở đây vì ảnh hưởng trực tiếp tới thiết kế Module Flow: về mặt kiến trúc dữ liệu, CRM & Sales và Production **vẫn cần** đường tham chiếu ngược tới Warehouse/Finance dù UI hiện tại chưa thể hiện.

## 4. Vòng lặp ngược (Feedback Loop) — điểm đặc biệt cần lưu ý

Không phải mọi luồng module đều là 1 chiều. Có 2 vòng lặp ngược quan trọng:

1. **Warehouse → Production (khi thiếu NVL)**: Nếu `MaterialRequest` không đủ tồn kho, Warehouse phản hồi ngược cho Production biết cần chờ `PurchaseRequest` hoàn tất — Production không thể tiếp tục công đoạn Dệt/Cắt cho tới khi có đủ NVL. Đây là **điểm nghẽn tiềm năng (bottleneck)** quan trọng nhất trong toàn hệ thống.
2. **Logistics → Warehouse (khi hàng trả về)**: `ReturnGoods` (`163_return_goods.html`) đưa hàng đã giao quay lại nhập kho — phá vỡ giả định "Logistics luôn là bước cuối trước Finance"; Finance phải xử lý `CreditNote` (giảm trừ hoá đơn) thay vì `Invoice` thông thường trong trường hợp này.

## 5. Module không nằm trên trục chính: AI Center vs AI Agents

Cần phân biệt rõ 2 khái niệm AI trong prototype (dễ nhầm lẫn khi thiết kế Module Flow):

| Khái niệm | Phạm vi | Vai trò trong Module Flow |
|---|---|---|
| **AI Center / AI Studio** (`21`–`41`) | Công cụ AI đa năng dùng chung (Chat, Document, Code, Database Designer, HTML Builder, Media...) | Công cụ hỗ trợ **con người** thao tác nhanh hơn — không phải 1 module nghiệp vụ trong chuỗi CRM→...→Finance |
| **AI Agents** (`42`–`69`) | 24 "nhân viên ảo" chuyên trách theo vai trò (CEO/Marketing/Sales/Factory/Finance/HR/Warehouse...) | Đại diện AI **song song** với người dùng thật ở từng module — Factory Agent (`47`) theo dõi Production, Warehouse Agent (`62`) theo dõi Warehouse, Finance Agent (`48`) theo dõi Finance |
| **AI Insight/Forecast** (nhúng trong từng module, VD `132`, `156`, `167`, `195`) | Tính năng AI gắn liền với chính module đó, không phải trang riêng | Đây mới là hiện thân đúng nghĩa của "AI Gateway" trong sơ đồ gốc — xem [AI_FLOW.md](AI_FLOW.md) |

## 6. Tham chiếu

- Chi tiết entity di chuyển giữa module: [DATA_FLOW.md](DATA_FLOW.md)
- Vai trò người dùng ở từng module: [USER_FLOW.md](USER_FLOW.md)
- Cơ chế thông báo khi module bàn giao cho nhau: [WORKFLOW.md](WORKFLOW.md) mục Notification Flow
