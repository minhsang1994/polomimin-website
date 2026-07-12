# 📢 PHÂN CÔNG CỤ THỂ – POLOMIMIN ERP

> **Ngày phân công:** 12/07/2026
> **Người phân công:** Mavis (Mavis coordinator) cho anh Sang
> **Người nhận:** Claude (MES), MiniMax/Mavis (CI/CD + QA), Antigravity (Backend + Firebase)
> **Báo cáo:** Mỗi ngày 18:00 vào group chat

---

## 🟢 MINIMAX / MAVIS – CI/CD + QA + Tối ưu

### Task 1 (ưu tiên cao nhất) — Deadline: **12/07/2026**
- [ ] Lấy Service Account JSON từ Firebase Console (project `polomimin`)
  - Link: https://console.firebase.google.com/project/polomimin/settings/serviceaccounts/adminsdk
  - Click "Generate new private key" → download `.json`
- [ ] Thêm vào GitHub Secrets với tên `FIREBASE_SERVICE_ACCOUNT`
  - Vào https://github.com/minhsang1994/polomimin-website/settings/secrets/actions/new
  - Name: `FIREBASE_SERVICE_ACCOUNT` → paste toàn bộ nội dung JSON
- [ ] Kiểm tra workflow `.github/workflows/firebase-deploy.yml` đã push lên `main` chưa
  - Nếu **CHƯA** có: tạo file qua Web GitHub (paste nội dung workflow)
  - File mẫu: `D:\polomimin\polomimin-erp\.github\workflows\firebase-deploy.yml` (đã có local)
- [ ] Test workflow bằng cách:
  - Push 1 file nhỏ (test.txt) → check tab Actions xem có chạy không
  - Verify `https://polomimin.web.app` update đồng bộ với GitHub Pages

### Task 2 — Deadline: **13/07/2026**
- [ ] **Smoke test toàn bộ 60 trang** trên Chrome (Playwright headless OK)
  - Console errors (404, undefined, JS errors)
  - Link die (click navigation từng trang)
  - Sidebar nav rendering đúng
  - Dark mode toggle hoạt động
  - AI Float button hiển thị + click
  - Quick Add FAB hoạt động
- [ ] Báo cáo lỗi tìm được trong group chat

### Task 3 — Deadline: **14/07/2026**
- [ ] **Mobile responsive audit + fix**
  - Viewport 375px (iPhone SE) — sidebar collapse, table scroll
  - Viewport 768px (iPad) — layout tablet
  - Viewport 1920px (desktop) — max-width container
- [ ] Test trên Chrome DevTools + thật (nếu có thiết bị)

### Task 4 — Deadline: **15/07/2026**
- [ ] **SEO meta tags** cho tất cả 60 trang:
  - Open Graph (`og:title`, `og:image`, `og:description`)
  - Twitter Cards
  - JSON-LD structured data
  - sitemap.xml
  - robots.txt
  - Canonical URLs
- [ ] Verify bằng Google Search Console

---

## 🟣 ANTIGRAVITY – Backend + Firebase Logic

### Task 1 (ưu tiên cao nhất) — Deadline: **13/07/2026**
- [ ] **Hoàn thiện login flow thật** (kết nối Firebase Auth)
  - `login.html` hiện tại là mockup → kết nối `firebase.auth().signInWithEmailAndPassword()`
  - Thêm logout handler (`logoutBtn` đã có trong `main.js`)
  - Session management: redirect về login nếu chưa login
  - Show user info thật trong `m-drawer` (sidebar user panel)
- [ ] Tạo file `assets/js/auth-flow.js` (nếu chưa có)
- [ ] Update `.firebaserc` nếu cần

### Task 2 — Deadline: **14/07/2026**
- [ ] **Kết nối Firestore vào các module**:
  - Thay dữ liệu mẫu tĩnh trong JS bằng `firebase.firestore().collection('xxx').get()` real-time
  - Ưu tiên: MES (10 trang) → WMS (8 trang) → HR (7 trang)
  - Collections đã seed sẵn:
    - `mes/lenh_sx/`, `mes/ke_hoach/`
    - `wms/kho_vai/`, `wms/kho_tp/`
    - `hr/nhan_vien/`, `hr/cham_cong/`
- [ ] Hiển thị loading state khi fetch data

### Task 3 — Deadline: **cùng Task 2**
- [ ] **Cache-bust toàn bộ trang** còn thiếu:
  - Thêm `?v=2` vào CSS/JS links
  - Modules: MES, WMS, HR, AI Center, Academy (đồng bộ version)
  - Pattern: `assets/js/main.js?v=2`

> **Lưu ý:** Antigravity KHÔNG làm deploy. Chỉ commit code, CI/CD do MiniMax/Mavis lo.

---

## 🔵 CLAUDE – Module MES (Sản xuất)

### Task 1 — Deadline: **15/07/2026** (chờ Antigravity xong Task 2)
- [ ] Cập nhật 10 trang MES để hiển thị **dữ liệu thật từ Firestore** (thay dữ liệu mẫu tĩnh):
  - `04-mes-dashboard.html`
  - `05-mes-lenh-sx.html`
  - `08-mes-dashboard.html`
  - `09-mes-ke-hoach.html`
  - `10-mes-lenh-sx.html`
  - `11-mes-lenh-cat.html`
  - `12-mes-may.html`
  - `13-mes-qc.html`
  - `14-mes-hoan-thien.html`
  - `15-mes-dong-goi.html`
- [ ] Bind collections: `mes/lenh_sx/`, `mes/ke_hoach/`, `mes/ke_hoach_chi_tiet/`

### Task 2 — Deadline: **16/07/2026**
- [ ] **Kiểm tra + fix lỗi riêng của MES** sau khi gán data
  - Render performance (nếu load chậm)
  - Edge cases (empty data, error states)
  - User experience (loading skeletons, error messages)

### Task 3 — Deadline: **cùng Task 1**
- [ ] **Đảm bảo cache-bust đúng** cho 10 trang MES
  - Nếu Antigravity chưa làm, tự thêm `?v=2` cho tất cả CSS/JS links
  - Pattern: `<script src="..."?v=2></script>`

> **Lưu ý:** Claude chỉ tập trung MES. **KHÔNG sửa file chung** (`main.js`, `business-layout.js`, `firebase-client.js`).

---

## ⚠️ QUY TẮC LÀM VIỆC CHO CẢ 3 AI

1. **Luôn `git pull` trước** khi commit
2. **Commit message có tên AI**: `feat(auth): login Firebase - Antigravity`
3. **Không dùng `git add -A`** — chỉ add file mình sửa
4. **Không sửa file của người khác** nếu không thông báo
5. **Báo cáo tiến độ mỗi ngày 18:00** vào group
6. **KHÔNG push trực tiếp** lên main nếu token không có `workflow` scope — dùng GitHub Web thay thế
7. **Conflict?** Pull + rebase + giải quyết, báo cáo lên group

---

## 📊 BÁO CÁO MẪU (cuối ngày)

```
📋 Báo cáo [Antigravity] - 13/07/2026

✅ Done:
- Login flow hoàn thiện với Firebase Auth
- Logout handler

🔄 In progress:
- Bind Firestore cho MES (5/10 trang)

❌ Blocked:
- Cần Service Account JSON để test CI/CD

📅 Plan ngày mai:
- Hoàn thành bind Firestore MES
- Bắt đầu cache-bust
```

---

## 🎯 TIMELINE TỔNG QUAN

| Ngày | MiniMax/Mavis | Antigravity | Claude |
|---|---|---|---|
| **12/07 (Hôm nay)** | Setup CI/CD + secret | Cache-bust (parallel) | Chờ |
| **13/07** | Smoke test 60 trang | **Login flow** | Chờ |
| **14/07** | Mobile responsive | **Firestore binding** | Chờ |
| **15/07** | SEO meta tags | (cache-bust hoàn tất) | **Bind data MES** |
| **16/07** | (dự phòng) | (hỗ trợ Claude) | **Fix MES bugs** |

---

## 🔗 LINKS HỮU ÍCH

- **Repo:** https://github.com/minhsang1994/polomimin-website
- **Live site:** https://polomimin.shop
- **Firebase:** https://console.firebase.google.com/project/polomimin
- **Service Account:** https://console.firebase.google.com/project/polomimin/settings/serviceaccounts/adminsdk
- **GitHub Secrets:** https://github.com/minhsang1994/polomimin-website/settings/secrets/actions
- **GitHub Actions:** https://github.com/minhsang1994/polomimin-website/actions
- **Firestore Data:** https://console.firebase.google.com/project/polomimin/firestore
- **Cloudflare:** https://dash.cloudflare.com/

---

## 📞 LIÊN HỆ

- 👤 **Project Owner:** Hồ Minh Sang (anh Sang) — 0774 480 916
- 🤖 **Coordinator:** Mavis (Mavis)
- 🤖 **MES:** Claude (Cursor + Claude Sonnet)
- 🤖 **Backend/AI:** Antigravity (Cursor + Claude Sonnet)
- 🤖 **CI/CD + QA:** MiniMax → take over by Mavis

---

*Generated by Mavis on 12/07/2026 16:24*
*Approved by anh Sang*
