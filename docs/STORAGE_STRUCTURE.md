# STORAGE_STRUCTURE.md — Thiết kế Firebase Storage

## 1. Nguyên tắc tổ chức đường dẫn (Path Convention)

Toàn bộ file cách ly theo Organization (nhất quán với Firestore ở `FIRESTORE_STRUCTURE.md`), theo cấu trúc:

```
/organizations/{orgId}/{category}/{subpath}/{fileName}
```

`{category}` là 8 nhóm theo đúng yêu cầu Stage 4. Không có file nào nằm ngoài `/organizations/{orgId}/...` (trừ `/platform/` dùng chung toàn nền tảng, xem mục 9).

## 2. Images

```
/organizations/{orgId}/images/
   ├── products/{productId}/{fileName}         ← ảnh sản phẩm (trùng vai trò với mục "Products" — xem mục 6, tách theo mục đích dùng: đây là ảnh dùng cho Marketing/Marketplace, mục 6 là file kỹ thuật sản phẩm)
   ├── banners/{fileName}                       ← ảnh banner trang chủ/marketing
   └── misc/{fileName}                          ← ảnh linh tinh khác
```

## 3. Videos

```
/organizations/{orgId}/videos/
   ├── training/{courseId}/{fileName}           ← video đào tạo (Academy, `15_lesson_player.html`)
   ├── product-demo/{productId}/{fileName}       ← video giới thiệu sản phẩm
   └── ai-generated/{uid}/{fileName}             ← video do AI Media sinh ra (`24_ai_video.html`, `33_ai_media.html`)
```

## 4. Documents (tài liệu chung, không thuộc 3 nhóm chuyên biệt Invoices/Contracts/Factory Files)

```
/organizations/{orgId}/documents/
   ├── sop/{departmentId}/{fileName}             ← SOP quy trình (`135_factory_sop.html`)
   ├── policies/{fileName}                        ← chính sách nội bộ
   └── general/{uid}/{fileName}                   ← tài liệu người dùng tự tải lên (`29_ai_document.html`, `134_factory_documents.html`)
```

## 5. Invoices (Hoá đơn)

```
/organizations/{orgId}/invoices/{invoiceId}/{fileName}
```

Liên kết `fileRef` trong Firestore `finance_invoices.fileRef` (xem `FIRESTORE_STRUCTURE.md` mục 6). Định dạng: PDF (bắt buộc), có thể kèm XML nếu tuân thủ hoá đơn điện tử.

## 6. Contracts (Hợp đồng)

```
/organizations/{orgId}/contracts/{contractId}/
   ├── signed.pdf                                 ← bản đã ký (immutable sau khi upload)
   └── amendments/{amendmentId}.pdf                ← phụ lục/điều chỉnh hợp đồng
```

Liên kết `crm_contracts.fileRef`. Quy tắc quan trọng: file trong `signed.pdf` **không được ghi đè** sau khi tải lên (chỉ thêm phụ lục mới) — cần Security Rules chặn `update`/`overwrite`, chỉ cho phép `create` 1 lần (xem `SECURITY_RULES.md`).

## 7. Products (File kỹ thuật sản phẩm — khác Images/Products ở mục 2)

```
/organizations/{orgId}/products/{productId}/
   ├── spec-sheet.pdf                             ← thông số kỹ thuật
   ├── size-chart.pdf                              ← bảng size (ngành may mặc)
   └── variants/{variantId}/{fileName}              ← file riêng theo biến thể (`77_variant_management.html`)
```

## 8. Avatar

```
/organizations/{orgId}/avatars/{uid}.{ext}
```

Đường dẫn phẳng, 1 file/user (ghi đè khi đổi avatar) — không cần subfolder vì không có lịch sử phiên bản avatar. Dùng chung cho mọi 16 app (Header avatar, Drawer hồ sơ — đã có UI mẫu ở toàn bộ 199 trang prototype).

## 9. Factory Files (File riêng ngành sản xuất)

```
/organizations/{orgId}/factory-files/
   ├── machine-manuals/{machineId}/{fileName}      ← tài liệu vận hành máy (`123_machine_management.html`)
   ├── qc-reports/{workOrderId}/{fileName}          ← biên bản QC đính kèm ảnh lỗi (`117_quality_control.html`)
   └── waste-photos/{wasteRecordId}/{fileName}      ← ảnh chứng minh hao hụt (`128_waste_management.html`)
```

## 10. Vùng dùng chung toàn nền tảng (ngoài phạm vi 1 Organization)

```
/platform/
   ├── module-icons/{slug}.svg                     ← icon 16 module (nếu chuyển từ emoji sang icon file thật — hiện tại theo docs/ICON_GUIDELINE.md vẫn dùng Emoji, mục này dự phòng)
   └── email-templates/{templateId}/{fileName}      ← template email dùng chung (xem FUNCTIONS_PLAN.md mục Email)
```

## 11. Bảng tổng hợp Category × Giới hạn dung lượng/định dạng (đề xuất)

| Category | Định dạng cho phép | Giới hạn dung lượng/file (đề xuất) |
|---|---|---|
| Images | jpg, png, webp | 5 MB |
| Videos | mp4, webm | 500 MB |
| Documents | pdf, docx, xlsx | 20 MB |
| Invoices | pdf, xml | 10 MB |
| Contracts | pdf | 20 MB |
| Products | pdf, jpg, png | 10 MB |
| Avatar | jpg, png (bắt buộc ảnh vuông, resize qua Extension `Resize Images` — xem `FIREBASE_ARCHITECTURE.md` mục 3) | 2 MB |
| Factory Files | pdf, jpg, png, dwg | 20 MB |

Giới hạn nên thực thi ở cả **Security Rules** (chặn cứng) lẫn **client trước khi upload** (trải nghiệm tốt hơn, báo lỗi sớm) — xem `SECURITY_RULES.md` mục Storage Rules.

## 12. Tham chiếu

- Field `fileRef` trong Firestore trỏ tới đường dẫn Storage nào: [FIRESTORE_STRUCTURE.md](FIRESTORE_STRUCTURE.md)
- Extension resize ảnh tự động: [FIREBASE_ARCHITECTURE.md](FIREBASE_ARCHITECTURE.md) mục 3
- Quy tắc bảo mật theo category: [SECURITY_RULES.md](SECURITY_RULES.md)
