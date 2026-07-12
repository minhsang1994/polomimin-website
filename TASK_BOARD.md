# 🎯 TASK BOARD — Phân chia công việc 3 AI

> **Project:** POLOMIMIN ERP System
> **Date:** 2026-07-12
> **Workspace:** `D:\polomimin\polomimin-erp\`
> **Total:** 47 HTML pages — chia 3 AI song song, không đụng hàng

---

## 📋 Tổng quan phân chia

| Ưu tiên | AI | Module | Số trang | Màu chủ đạo | Status |
|---|---|---|---|---|---|
| 🥇 **#1** | 🤖 **Claude** | MES (Sản xuất) | 10 | `#2563EB` (xanh dương) | ✅ **Done** (commit `584dd15`) |
| 🥈 **#2** | 🤖 **MiniMax** | WMS (Kho) + HR (Nhân sự) | 6+7=13 | WMS `#16A34A` / HR `#EA580C` | ⏳ Pending |
| 🥉 **#3** | 🤖 **Antigravity** | AI Center + Academy + Hub/Common | 4+3+5=12 | AI `#7C3AED` / Academy `#0891B2` | 🔄 85% (6/7 done) |

> **Thứ tự review (Mavis):** MES → WMS+HR → AI+Academy+Common
> **Tiến độ tổng:** 17/47 trang done (36%)

---

## 🤖 AI #1 — CLAUDE: MES Module (10 trang)

```
04-mes-dashboard.html       (Tổng quan sản xuất)
05-mes-lenh-sx.html         (Lệnh sản xuất)
08-mes-dashboard.html       (Dashboard v2)
09-mes-ke-hoach.html        (Kế hoạch sản xuất)
10-mes-lenh-sx.html         (Quản lý lệnh SX)
11-mes-lenh-cat.html        (Lệnh cắt vải)
12-mes-may.html             (Quản lý chuyền may)
13-mes-qc.html              (Kiểm tra chất lượng)
14-mes-hoan-thien.html      (Hoàn thiện - ủi, đóng gói)
15-mes-dong-goi.html        (Đóng gói & xuất kho TP)
```

**Màu:** `#2563EB` (xanh dương)
**Nav items (sidebar):**
1. Tổng quan
2. Kế hoạch SX
3. Lệnh cắt
4. Chuyền may
5. QC
6. Hoàn thiện
7. Đóng gói

**Yêu cầu cụ thể:**
- Sidebar MIMIN (collapsible) + Topbar với breadcrumb + user info
- KPI cards: Đơn SX hôm nay, Đang chạy, Hoàn thành, Lỗi QC
- Workflow timeline cho mỗi lệnh SX
- Bảng danh sách lệnh SX (filter theo trạng thái, ngày, công đoạn)
- AI Float button (góc phải) — gợi ý tối ưu chuyền may

---

## 🤖 AI #2 — MINIMAX: WMS + HR Module (13 trang)

### WMS — Kho vải & Thành phẩm (6 trang)
```
06-wms-dashboard.html       (Tổng quan kho)
07-wms-kho-vai.html         (Kho vải - cuộn, tồn kho)
16-wms-dashboard.html       (Dashboard v2)
17-wms-kho-vai.html         (Kho vải chi tiết)
18-wms-kho-tp.html          (Kho thành phẩm)
19-wms-nhap.html            (Nhập kho)
20-wms-xuat.html            (Xuất kho)
21-wms-kiem-ke.html         (Kiểm kê định kỳ)
```

### HR — Nhân sự (7 trang)
```
22-hr-dashboard.html        (Tổng quan nhân sự)
23-hr-ho-so.html            (Hồ sơ nhân viên)
24-hr-cham-cong.html        (Chấm công)
30-hr-dashboard.html        (Dashboard v2)
31-hr-ho-so.html            (Hồ sơ chi tiết)
32-hr-cham-cong.html        (Bảng công chi tiết)
34-hr-luong.html            (Tính lương)
```

**Màu:**
- WMS: `#16A34A` (xanh lá)
- HR: `#EA580C` (cam)

**Nav WMS:** Tổng quan, Kho vải, Kho TP, Nhập kho, Xuất kho, Kiểm kê
**Nav HR:** Tổng quan, Hồ sơ, Chấm công, Tính lương

---

## 🤖 AI #3 — ANTIGRAVITY: AI + Academy + Common (12 trang)

### AI Center (4 trang)
```
25-ai-dashboard.html        (Tổng quan AI)
33-ai-dashboard.html        (Dashboard v2)
35-ai-du-bao.html           (Dự báo nhu cầu)
36-ai-goi-y.html            (Gợi ý bán hàng)
```

### Academy — Đào tạo nội bộ (3 trang)
```
37-academy-dashboard.html   (Tổng quan)
38-academy-khoa-hoc.html    (Khóa học)
39-academy-sop.html          (Quy trình SOP)
```

### Hub & Common (5 trang)
```
01-home.html                (HUB chính - 7 modules)
index.html                  (Redirect → 01-home)
login.html                  (Đăng nhập)
settings.html               (Cài đặt)
gallery.html                (Showcase UI)
```

**Màu:**
- AI: `#7C3AED` (tím)
- Academy: `#0891B2` (cyan)
- Hub: Gradient `#1E3A8A` → `#14B8A6`

---

## 🛠 SHARED ASSETS (KHÔNG SỬA)

Tất cả 3 AI dùng chung, KHÔNG được đụng vào:

```
assets/css/main.css              ← Design system
assets/css/business-layout.css   ← Layout MIMIN
assets/css/hub.css               ← Hub (chỉ Antigravity dùng)
assets/css/agent.css             ← AI module
assets/css/factory.css           ← MES module
assets/css/warehouse.css         ← WMS module
assets/js/main.js                ← MiminShell.init
assets/js/business-layout.js     ← MiminBiz
assets/js/agent.js
assets/js/factory.js
assets/js/warehouse.js
assets/js/firebase-client.js
assets/logo.svg
favicon.svg
```

---

## 📐 TEMPLATE THAM KHẢO (copy pattern)

### Mẫu chính:
- **`02-erp-dashboard.html`** — MIMIN layout đầy đủ nhất (Blue theme)
- **`22-sales-dashboard.html`** — Red theme (Sales)

### Cấu trúc bắt buộc mỗi trang:
```html
<!DOCTYPE html>
<html lang="vi" data-theme="light">
<head>
  <meta charset="UTF-8">
  <title>POLOMIMIN — [Tên trang]</title>
  <link rel="icon" href="/favicon.svg">
  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/business-layout.css">
  <link rel="stylesheet" href="/assets/css/[module].css">  ← module-specific
</head>
<body>
  <div class="mimin-shell">
    <aside class="mimin-sidebar">...</aside>
    <main class="mimin-main">
      <header class="mimin-topbar">...</header>
      <div class="mimin-content">
        <div class="mimin-biz">
          <!-- KPI cards, table, chart, form -->
        </div>
      </div>
    </main>
  </div>
  
  <!-- AI Float Button -->
  <button class="ai-float-btn">💬</button>
  
  <!-- Quick Add FAB -->
  <button class="quick-add-fab">+</button>
  
  <script src="/assets/js/main.js"></script>
  <script src="/assets/js/business-layout.js"></script>
  <script>
    MiminShell.init({ module: '[module-name]' });
  </script>
</body>
</html>
```

---

## 🚦 WORKFLOW

### Mỗi AI tự xử lý:
1. **Đọc template** `02-erp-dashboard.html` để hiểu pattern
2. **Copy cấu trúc** sang trang mới, đổi nội dung
3. **Tạo nav đúng module** (tham khảo bảng trên)
4. **Test local** bằng cách mở file HTML trong browser
5. **Commit + push** lên GitHub theo format:
   ```bash
   git add <files-của-mình>
   git commit -m "feat(<module>): redesign với MIMIN design system"
   git push origin main
   ```

### Lệnh commit chuẩn:
- `feat(mes): redesign dashboard với MIMIN` — Claude
- `feat(wms): redesign 6 trang kho với MIMIN` — MiniMax
- `feat(hr): redesign 7 trang nhân sự với MIMIN` — MiniMax
- `feat(ai): redesign 4 trang AI Center` — Antigravity
- `feat(academy): redesign 3 trang đào tạo` — Antigravity
- `feat(hub): polish 01-home + login + settings` — Antigravity

---

## 📊 CHECKLIST TIẾN ĐỘ

### Claude (MES)
- [ ] 04-mes-dashboard.html
- [ ] 05-mes-lenh-sx.html
- [ ] 08-mes-dashboard.html
- [ ] 09-mes-ke-hoach.html
- [ ] 10-mes-lenh-sx.html
- [ ] 11-mes-lenh-cat.html
- [ ] 12-mes-may.html
- [ ] 13-mes-qc.html
- [ ] 14-mes-hoan-thien.html
- [ ] 15-mes-dong-goi.html

### MiniMax (WMS + HR)
- [ ] 06-wms-dashboard.html
- [ ] 07-wms-kho-vai.html
- [ ] 16-wms-dashboard.html
- [ ] 17-wms-kho-vai.html
- [ ] 18-wms-kho-tp.html
- [ ] 19-wms-nhap.html
- [ ] 20-wms-xuat.html
- [ ] 21-wms-kiem-ke.html
- [ ] 22-hr-dashboard.html
- [ ] 23-hr-ho-so.html
- [ ] 24-hr-cham-cong.html
- [ ] 30-hr-dashboard.html
- [ ] 31-hr-ho-so.html
- [ ] 32-hr-cham-cong.html
- [ ] 34-hr-luong.html

### Antigravity (AI + Academy + Common)
- [ ] 25-ai-dashboard.html
- [ ] 33-ai-dashboard.html
- [ ] 35-ai-du-bao.html
- [ ] 36-ai-goi-y.html
- [ ] 37-academy-dashboard.html
- [ ] 38-academy-khoa-hoc.html
- [ ] 39-academy-sop.html
- [ ] 01-home.html (polish)
- [ ] login.html (polish)
- [ ] settings.html (polish)
- [ ] gallery.html (polish)

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Mỗi AI chỉ sửa file trong module mình** — KHÔNG đụng file AI khác
2. **KHÔNG sửa shared assets** (CSS/JS) — nếu cần component mới, tạo file mới
3. **Mỗi commit chỉ chứa file của 1 module** — tránh conflict khi merge
4. **Trước khi push, pull main về** để tránh conflict
5. **Test trên Chrome local** trước khi commit
6. **Responsive bắt buộc** — mobile + tablet + desktop

## 🔌 PHÂN VAI HẠ TẦNG

| Hạ tầng | Phụ trách | Trạng thái |
|---|---|---|
| ☁️ **Cloudflare DNS** (polomimin.shop) | 🤖 **Mavis** | ✅ Xong |
| 🐙 **GitHub push** (mỗi module) | Mỗi AI tự push | 🔄 Đang chạy |
| 🔥 **Firebase Auth + Firestore** | 🤖 **Antigravity (chủ trì)** | ⏳ Cần setup |
| 🗄 **Firestore data schema** | Mỗi AI tạo data cho module mình | ⏳ Sau khi Auth xong |

**Firestore collections (đề xuất):**
- `users/` — Auth profiles
- `mes/lenh_sx/`, `mes/ke_hoach/` — Claude
- `wms/kho_vai/`, `wms/kho_tp/` — MiniMax
- `hr/nhan_vien/`, `hr/cham_cong/` — MiniMax
- `ai/predictions/`, `ai/models/` — Antigravity
- `academy/khoa_hoc/`, `academy/sop/` — Antigravity

**Workflow:**
1. Antigravity setup `firebase-client.js` (đã có sẵn) + Auth UI
2. Mỗi AI gọi `firebase.firestore().collection('module/...')` trong code mình
3. Mavis review schema + security rules

---

## 🔗 LIÊN KẾT

- **Repo:** https://github.com/minhsang1994/polomimin-website
- **Live:** https://polomimin.shop/
- **MIMIN design system:** `D:\MIMIN Platform\docs\`
- **Reference HTML:** `D:\polomimin\polomimin-erp\reference\`
- **Template chính:** `D:\polomimin\polomimin-erp\02-erp-dashboard.html`
