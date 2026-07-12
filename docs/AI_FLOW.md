# AI_FLOW.md — Luồng AI Gateway → Agents → Insight/Forecast/Recommendation

Tài liệu mô tả kiến trúc lớp AI **cắt ngang (cross-cutting)** toàn bộ 6 module nghiệp vụ, theo đúng sơ đồ gốc:

```
Tất cả Module → AI Gateway → AI Agents → Insight → Forecast → Recommendation
```

## 1. Ba tầng AI đã có bằng chứng trong Prototype

Prototype thể hiện AI qua **3 tầng riêng biệt**, cần phân biệt rõ để không nhầm lẫn khi thiết kế AI Gateway thật:

| Tầng | Vị trí trong Prototype | Vai trò |
|---|---|---|
| **Tầng 1 — Công cụ AI đa năng** | AI Center/Studio (`21`–`41`, 21 trang) | Công cụ năng suất dùng chung: Chat, Document, Code, Database Designer, HTML Builder, Media, Marketing, Sales, Business, Workflow — hỗ trợ con người thao tác nhanh hơn, không gắn với 1 module nghiệp vụ cụ thể |
| **Tầng 2 — AI Agents (nhân viên ảo)** | AI Agents (`42`–`69`, 28 trang) | 24 persona AI chuyên trách theo vai trò/phòng ban, mỗi Agent có 5 tab cố định: Dashboard/Chat/Tasks/Knowledge/History |
| **Tầng 3 — AI Insight nhúng trong module** | `132`, `140`, `156`, `167`, `168`, `195`, `196` (7 trang) | Đây là hiện thân đúng nghĩa nhất của "AI Gateway" trong sơ đồ gốc — AI đọc dữ liệu ngay tại module, sinh gợi ý ngay tại chỗ, không cần rời màn hình |

## 2. AI Gateway — vai trò tổng hợp dữ liệu từ mọi module

**AI Gateway** (khái niệm kiến trúc, chưa có 1 trang UI riêng mang tên này) là lớp trung gian nhận dữ liệu từ tất cả module rồi định tuyến tới đúng AI Agent/tính năng Insight tương ứng:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ CRM & Sales   │  │ Production    │  │ Warehouse     │  │ Logistics     │  │ Finance       │  │ HR            │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                  │                  │                  │                  │                  │
       └──────────────────┴──────────────────┴─────────┬────────┴──────────────────┴──────────────────┘
                                                          ▼
                                                   ┌──────────────┐
                                                   │  AI GATEWAY   │  (lớp định tuyến — khái niệm kiến trúc)
                                                   └──────┬───────┘
                                        ┌──────────────────┼──────────────────┐
                                        ▼                  ▼                  ▼
                                 ┌────────────┐    ┌────────────┐    ┌────────────┐
                                 │ AI Agents   │    │ AI Insight  │    │ AI Center   │
                                 │ (42-69)     │    │ (nhúng module)│  │ Tools (21-41)│
                                 └─────┬──────┘    └─────┬──────┘    └────────────┘
                                       │                  │
                                       ▼                  ▼
                                 Insight → Forecast → Recommendation
                                       │
                                       ▼
                          Hiển thị ngược lại tại đúng module gốc
                          (AI Float Button / Insight Card / Agent Chat)
```

## 3. Ánh xạ AI Agent ↔ Module nghiệp vụ

| AI Agent | Trang | Module giám sát | Đã map đúng nghiệp vụ? |
|---|---|---|---|
| CEO Agent | `43` | Toàn nền tảng (điều hành) | ✅ |
| Marketing Agent | `44` | *(ngoài phạm vi 7 module đang thiết kế — module Marketing riêng, xem CLAUDE.md)* | — |
| Sales Agent | `45` | CRM & Sales | ✅ |
| Customer Service Agent | `46` | CRM & Sales (CSKH) | ✅ |
| Factory Agent | `47` | Production | ✅ |
| Finance Agent | `48` | Finance | ✅ |
| HR Agent | `49` | HR | ✅ (agent có sẵn dù module HR chưa có UI đầy đủ — xem mục 4) |
| Warehouse Agent | `62` | Warehouse | ✅ |
| Production Agent | `63` | Production (trùng vai trò với Factory Agent — xem ghi chú) | ⚠️ Trùng lặp vai trò với `47_factory_agent.html` |
| Affiliate Agent | `64` | *(ngoài phạm vi 7 module)* | — |
| Automation Agent | `65` | Cross-cutting (tự động hoá quy trình, gần với Workflow Flow) | ⚠️ Có thể xem như 1 phần AI Gateway |
| Data Analyst Agent | `58` | Report Flow (phân tích dữ liệu chéo module) | ✅ Gần đúng vai trò tổng hợp báo cáo |
| Project Manager Agent | `59` | Cross-cutting (theo dõi tiến độ, gần với Production + CRM) | ⚠️ Không map 1:1 vào 1 module |

**Phát hiện quan trọng**: `47_factory_agent.html` (Factory Agent) và `63_production_agent.html` (Production Agent) có vẻ trùng vai trò giám sát Production — đây là điểm cần làm rõ trước khi thiết kế AI Gateway thật: 2 agent này nên **hợp nhất thành 1** hay **phân chia phạm vi rõ ràng** (VD Factory Agent = vận hành thiết bị/nhà xưởng, Production Agent = kế hoạch/tiến độ đơn hàng)?

## 4. Luồng Insight → Forecast → Recommendation (chi tiết theo module)

### 4.1. Warehouse (bằng chứng đầy đủ nhất trong Prototype)

```
InventoryItem (dữ liệu tồn kho thời gian thực)
   ↓ AI Gateway đọc lịch sử xuất/nhập
167_ai_inventory.html → Insight: "Sợi Cotton 30/1 chỉ còn 180kg, đề xuất tạo yêu cầu vật tư ngay"
   ↓
156_inventory_forecast.html → Forecast: dự báo nhu cầu 14 ngày tới theo xu hướng tiêu thụ
   ↓
Recommendation: nút "Áp dụng" trên Insight Card → tạo thẳng 130_purchase_request.html
```

### 4.2. Finance

```
AccountsReceivable + CashFlow (dữ liệu công nợ/dòng tiền)
   ↓
195_ai_finance.html → Insight: "3 khách hàng nợ quá hạn trên 90 ngày, đề xuất gửi nhắc nợ"
   ↓
196_finance_analytics.html → Forecast: xu hướng ROE/ROA, biên lợi nhuận theo quý
   ↓
Recommendation: nút "Áp dụng" → tạo thẳng thao tác nhắc nợ / điều chỉnh ngân sách
```

### 4.3. Production

```
WorkOrder + MachineStatus (dữ liệu vận hành máy móc, tiến độ công đoạn)
   ↓
132_factory_dashboard_ai.html → Insight: cảnh báo máy móc/tiến độ chậm
   ↓
140_factory_analytics.html → Forecast: năng suất theo ca, xu hướng hao hụt
   ↓
Recommendation: đề xuất điều chỉnh kế hoạch sản xuất (103_production_planning.html)
```

**Nhận xét**: Cấu trúc 3 bước Insight→Forecast→Recommendation **nhất quán tuyệt đối** giữa 3 module trên (Warehouse, Finance, Production) — đều dùng chung mẫu "trang Insight dạng feed thẻ + trang Analytics dạng biểu đồ + nút Áp dụng điều hướng sang hành động cụ thể". Đây là khuôn mẫu chuẩn nên áp dụng khi CRM & Sales, Logistics, HR có AI Insight riêng trong tương lai (hiện 3 module này **chưa có trang AI Insight/Forecast riêng**, khoảng trống cần bổ sung).

## 5. Bảng trạng thái AI theo module (Coverage Matrix)

| Module | Có AI Insight? | Có AI Agent? | Có AI Forecast/Analytics? |
|---|---|---|---|
| CRM & Sales | ❌ Chưa có | ✅ Sales Agent (45), CSKH Agent (46) | ❌ Chưa có (chỉ có `101_business_analytics.html` dạng thường, không gắn AI) |
| Production | ✅ `132` | ✅ Factory Agent (47), Production Agent (63) | ✅ `140` |
| Warehouse | ✅ `167` | ✅ Warehouse Agent (62) | ✅ `168`, `156` |
| Logistics | ❌ Chưa có | ❌ Chưa có agent riêng (dùng chung Warehouse Agent) | ❌ Chưa có |
| Finance | ✅ `195` | ✅ Finance Agent (48) | ✅ `196` |
| HR | ❌ Chưa có (module gốc chưa có) | ✅ HR Agent (49) — có agent dù chưa có module | ❌ Chưa có |

**Kết luận mục 5**: Warehouse và Finance là 2 module có AI Gateway hoàn chỉnh nhất (đủ cả 3 tầng Insight/Agent/Forecast). CRM & Sales, Logistics, HR còn thiếu ít nhất 1 tầng.

## 6. Tham chiếu

- Entity mà AI đọc: [DATA_FLOW.md](DATA_FLOW.md) mục 2.7
- Cách AI Gateway định tuyến qua các module: [MODULE_FLOW.md](MODULE_FLOW.md) mục 5
- AI trong luồng báo cáo: [REPORT_FLOW.md](REPORT_FLOW.md)
