# POLOMIMIN - Hệ thống quản lý doanh nghiệp

🌐 **POLOMIMIN Platform** — Website + ERP tích hợp AI cho **Dệt May Giàu Sang**

## 🏢 Thông tin công ty

- **Tên:** CÔNG TY TNHH DỆT MAY GIÀU SANG
- **Tên quốc tế:** GIAU SANG TEXTILE COMPANY LIMITED
- **MST:** 0318507560
- **Địa chỉ:** 12/39 Xuân Thới Thượng 58C, Ấp 7, Xã Bà Điểm, TP.HCM
- **Hotline:** 0774 480 916
- **Website:** https://polomimin.shop
- **Tên miền:** polomimin.shop
- **Thương hiệu:** POLOMIMIN

## 📂 Cấu trúc dự án

```
polomimin-erp/
├── 01-home.html               # HUB chính - Landing page public
├── index.html                 # Redirect → 01-home.html
├── login.html                 # Đăng nhập
├── settings.html              # Cài đặt
├── gallery.html               # Showcase UI các module
│
├── 02-07_erp-*.html           # ERP Module (6 trang) - Quản lý tổng
├── 04-15_mes-*.html           # MES Module (10 trang) - Sản xuất
├── 06-21_wms-*.html           # WMS Module (8 trang) - Kho
├── 22-37_hr-*.html           # HR Module (7 trang) - Nhân sự
├── 22-38_sales-*.html        # Sales Module (14 trang) - Bán hàng
├── 25-36_ai-*.html            # AI Center (4 trang) - AI
├── 37-39_academy-*.html       # Academy (3 trang) - Đào tạo
├── 25-sales-san-pham.html     # Catalog sản phẩm (public)
│
├── assets/
│   ├── css/
│   │   ├── main.css              # MIMIN Design System core
│   │   ├── business-layout.css   # Layout MIMIN cho ERP/Sales/etc
│   │   ├── agent.css             # AI module styles
│   │   ├── factory.css           # MES module styles
│   │   └── warehouse.css         # WMS module styles
│   ├── js/
│   │   ├── main.js               # MiminShell.init (sidebar, theme, AI float)
│   │   ├── business-layout.js    # MiminBiz (stat cards, table, modal)
│   │   ├── agent.js              # AI module logic
│   │   ├── factory.js            # MES module logic
│   │   ├── warehouse.js          # WMS module logic
│   │   └── firebase-client.js    # Firebase Auth + Firestore
│   ├── images/                   # 17 ảnh sản phẩm + sales flow
│   └── logo.svg
│
├── docs/                        # 68 MD files từ MIMIN Platform
├── reference/                   # 10 HTML reference từ MIMIN
│
├── TASK_BOARD.md                # Phân chia 3 AI (Claude/MiniMax/Antigravity)
├── CNAME                        # polomimin.shop
├── firebase.json                # Firebase Hosting config
├── firestore.rules              # Security rules
├── firestore.indexes.json       # Composite indexes
├── .firebaserc                  # Firebase project
├── .env                         # Secrets (KHÔNG commit)
├── .gitignore
├── package.json
└── package-lock.json
```

## 🎨 Hệ thống thiết kế

| Loại | Style | Màu chính | Đối tượng |
|---|---|---|---|
| **Public pages** | Marketing | Navy `#0a1628` + Gold `#b8912a` | Khách hàng, công chúng |
| **Internal dashboards** | MIMIN Design | Blue/Red/Green theo module | Nhân viên POLOMIMIN |
| **Gallery** | Dark showcase | Navy `#050d1f` + Teal `#0ef0d4` | Demo UI |

### Màu theo module:
- **Sales:** `#DC2626` (Red)
- **MES:** `#2563EB` (Blue)
- **WMS:** `#16A34A` (Green)
- **HR:** `#EA580C` (Orange)
- **AI:** `#7C3AED` (Purple)
- **Academy:** `#0891B2` (Cyan)
- **ERP:** `#1E3A8A` + `#14B8A6` (Dark Blue + Teal)

### MIMIN Design System:
- Sidebar collapsible với MiminShell.init()
- Topbar với search + theme toggle + notifications + user drawer
- Stat cards (KPI) từ MiminBiz.renderStatCards()
- Data table với pagination
- Modal system
- AI Float button (gợi ý AI góc phải)
- Quick Add FAB (tác vụ nhanh)
- Light/Dark mode

## 🚀 Deploy

- **Frontend hosting:** GitHub Pages + Cloudflare CDN
- **URL chính:** https://polomimin.shop
- **GitHub:** https://github.com/minhsang1994/polomimin-website
- **Backend (Node.js):** https://fgo5whyr5da6.space.minimax.io (polomimin-tong-kho-si)

### DNS:
- Cloudflare Zone ID: `483f99606a8d007d6887a7e8700ac01c`
- 4 A records: 185.199.108/109/110/111.153
- CNAME `www` → `minhsang1994.github.io`

## 🤖 Phân chia công việc (3 AI song song)

Xem chi tiết trong [TASK_BOARD.md](./TASK_BOARD.md):

| Ưu tiên | AI | Module | Số trang |
|---|---|---|---|
| 🥇 #1 | **Claude** | MES (Sản xuất) | 10 |
| 🥈 #2 | **MiniMax** | WMS + HR | 6+7=13 |
| 🥉 #3 | **Antigravity** | AI + Academy + Common | 4+3+5=12 |

**Thứ tự review (Mavis):** MES → WMS+HR → AI+Academy+Common

## 🔥 Firebase

- **Auth:** Email/Password + Google OAuth
- **Firestore collections:**
  - `users/` — Auth profiles
  - `mes/lenh_sx/`, `mes/ke_hoach/` — Claude
  - `wms/kho_vai/`, `wms/kho_tp/` — MiniMax
  - `hr/nhan_vien/`, `hr/cham_cong/` — MiniMax
  - `ai/predictions/`, `ai/models/` — Antigravity
  - `academy/khoa_hoc/`, `academy/sop/` — Antigravity
- **Antigravity chủ trì** setup Auth UI + schema
- Mỗi AI gọi data qua collection tương ứng

## 📞 Liên hệ

- 📞 Hotline: 0774 480 916
- 📧 Email: congtydetmaygiausang@gmail.com
- 💬 Zalo OA: POLOMIMIN TỔNG KHO SỈ QUẦN ÁO (App ID: 4158462787311644250)

---

© 2026 POLOMIMIN Platform v1.0 · Dệt May Giàu Sang · MST: 0318507560
