// POLOMIMIN ERP v2.0 - Complete JavaScript Application

// ==================== DATA MODELS ====================
const DATA_MODELS = {
    KENH_BAN: {
        name: 'Kênh bán hàng', icon: '🏪',
        columns: [
            {key:'Kenh_ID',label:'Mã kênh',type:'text',required:true},
            {key:'Ten_Kenh',label:'Tên kênh',type:'text',required:true},
            {key:'Loai_Kenh',label:'Loại kênh',type:'select',options:['Online','Offline','Marketplace','Social'],required:true},
            {key:'Mo_Ta',label:'Mô tả',type:'textarea'},
            {key:'Link_Shop',label:'Link cửa hàng',type:'url'},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Active','Inactive','Suspended'],required:true},
            {key:'Ngay_Tao',label:'Ngày tạo',type:'date'}
        ]
    },
    KHACH_HANG: {
        name: 'Khách hàng', icon: '👥',
        columns: [
            {key:'KhachHang_ID',label:'Mã KH',type:'text',required:true},
            {key:'Ten_Khach',label:'Tên khách hàng',type:'text',required:true},
            {key:'Loai_Khach',label:'Loại khách',type:'select',options:['Cá nhân','Cửa hàng','Đại lý','Doanh nghiệp'],required:true},
            {key:'Kenh_Nguon',label:'Nguồn khách',type:'select',options:['K001','K002','K003','K004','Referral','Organic'],required:true},
            {key:'Email',label:'Email',type:'email'},
            {key:'Dien_Thoai',label:'Điện thoại',type:'phone',required:true},
            {key:'Zalo',label:'Zalo',type:'text'},
            {key:'Dia_Chi',label:'Địa chỉ',type:'textarea'},
            {key:'Tinh_TP',label:'Tỉnh/TP',type:'text'},
            {key:'Nhom_Khach',label:'Nhóm khách',type:'select',options:['VIP','Thường','Mới','Tiềm năng'],required:true},
            {key:'Han_Muc_Cong_No',label:'Hạn mức công nợ',type:'currency'},
            {key:'Tong_Don_Hang',label:'Tổng đơn hàng',type:'number'},
            {key:'Tong_Gia_Tri',label:'Tổng giá trị',type:'currency'},
            {key:'Ngay_Tao',label:'Ngày tạo',type:'date'},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Active','Inactive','Blocked'],required:true},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    NHAN_VIEN: {
        name: 'Nhân viên', icon: '👔',
        columns: [
            {key:'NhanVien_ID',label:'Mã NV',type:'text',required:true},
            {key:'Ho_Ten',label:'Họ tên',type:'text',required:true},
            {key:'Ngay_Sinh',label:'Ngày sinh',type:'date'},
            {key:'Gioi_Tinh',label:'Giới tính',type:'select',options:['Nam','Nữ','Khác']},
            {key:'Chuc_Vu',label:'Chức vụ',type:'text',required:true},
            {key:'Bo_Phan',label:'Bộ phận',type:'select',options:['Kinh doanh','Sản xuất','Kho','Kế toán','Marketing','QC','HR'],required:true},
            {key:'So_Dien_Thoai',label:'SĐT',type:'phone',required:true},
            {key:'Email',label:'Email',type:'email',required:true},
            {key:'Dia_Chi',label:'Địa chỉ',type:'textarea'},
            {key:'Ngay_Vao_Lam',label:'Ngày vào làm',type:'date',required:true},
            {key:'Luong_Co_Ban',label:'Lương CB',type:'currency'},
            {key:'Phu_Cap',label:'Phụ cấp',type:'currency'},
            {key:'Role',label:'Role',type:'select',options:['Admin','Manager','Sale','Warehouse','Accountant','QC','Staff'],required:true},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Active','On Leave','Resigned'],required:true},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    SAN_PHAM: {
        name: 'Sản phẩm', icon: '📦',
        columns: [
            {key:'SanPham_ID',label:'Mã SP',type:'text',required:true},
            {key:'Ten_SP',label:'Tên sản phẩm',type:'text',required:true},
            {key:'Ma_Vach',label:'Mã vạch',type:'text'},
            {key:'Loai',label:'Loại',type:'select',options:['Áo Thun','Áo Polo','Áo Sơ Mi','Hoodie','Áo Khoác','Quần Short','Quần Jean','Quần Jogger','Đồ Thể Thao','Phụ kiện'],required:true},
            {key:'Chat_Lieu',label:'Chất liệu',type:'text'},
            {key:'Mo_ta_chung',label:'Mô tả',type:'textarea'},
            {key:'Mo_Ta_Chi_Tiet',label:'Mô tả chi tiết',type:'textarea'},
            {key:'Trong_Luong',label:'Trọng lượng (g)',type:'number'},
            {key:'Noi_Bat',label:'Nổi bật',type:'checkbox'},
            {key:'Ban_Chay',label:'Bán chạy',type:'checkbox'},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Active','Inactive','Draft','Discontinued'],required:true},
            {key:'Ngay_Tao',label:'Ngày tạo',type:'date'},
            {key:'Ngay_Cap_Nhat',label:'Ngày cập nhật',type:'date'}
        ]
    },
    BIEN_THE_SAN_PHAM: {
        name: 'Biến thể SP', icon: '🎨',
        columns: [
            {key:'BienThe_ID',label:'Mã biến thể',type:'text',required:true},
            {key:'SanPham_ID',label:'Sản phẩm',type:'select',options:['SP01','SP02','SP03','SP04','SP05','SP06'],required:true,relation:'SAN_PHAM'},
            {key:'SKU',label:'SKU',type:'text',required:true},
            {key:'Barcode',label:'Barcode',type:'text'},
            {key:'Size',label:'Size',type:'select',options:['XS','S','M','L','XL','XXL','28','30','32','34','36'],required:true},
            {key:'Mau',label:'Màu',type:'select',options:['Trắng','Đen','Xanh Navy','Đỏ','Ghi','Xanh Army','Be','Hồng'],required:true},
            {key:'Mau_Hex',label:'Mã màu',type:'color'},
            {key:'Gia_Nhap',label:'Giá nhập',type:'currency',required:true},
            {key:'Gia_Ban_Le',label:'Giá bán lẻ',type:'currency',required:true},
            {key:'Gia_Si_Toi_Thieu',label:'Giá sỉ tối thiểu',type:'currency'},
            {key:'Can_Nang',label:'Cân nặng (kg)',type:'number'},
            {key:'Chieu_Cao',label:'Chiều cao (cm)',type:'number'},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Active','Inactive','Out of Stock'],required:true},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    KHO_HANG: {
        name: 'Kho hàng', icon: '🏪',
        columns: [
            {key:'Kho_ID',label:'Mã kho',type:'text',required:true},
            {key:'Ten_Kho',label:'Tên kho',type:'text',required:true},
            {key:'Loai_Kho',label:'Loại kho',type:'select',options:['Kho chính','Kho phụ','Kho trả hàng','Kho hư hỏng','Kho black sale'],required:true},
            {key:'Dia_Chi',label:'Địa chỉ',type:'textarea',required:true},
            {key:'Dien_Thoai',label:'Điện thoại',type:'phone'},
            {key:'Nguoi_Quan_Ly',label:'Người quản lý',type:'text'},
            {key:'Tong_San_Pham',label:'Tổng SP',type:'number'},
            {key:'Tong_So_Luong',label:'Tổng số lượng',type:'number'},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Active','Inactive','Full','Maintenance'],required:true},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    CHINH_SACH_GIA: {
        name: 'Chính sách giá', icon: '💰',
        columns: [
            {key:'ChinhSachGia_ID',label:'Mã CS',type:'text',required:true},
            {key:'Ten_Chinh_Sach',label:'Tên CS',type:'text',required:true},
            {key:'Loai_Chinh_Sach',label:'Loại',type:'select',options:['Sỉ sắc bậc','Sỉ cố định','Khuyến mãi','Flash Sale','VIP','Đại lý'],required:true},
            {key:'Kenh_Ap_Dung',label:'Kênh áp dụng',type:'select',options:['Tất cả','Website','Shopee','TikTok','Offline','Sỉ'],required:true},
            {key:'So_Luong_Toi_Thieu',label:'SL tối thiểu',type:'number',required:true},
            {key:'So_Luong_Toi_Da',label:'SL tối đa',type:'number'},
            {key:'Phan_Tram_Giam',label:'% giảm',type:'number'},
            {key:'Ngay_Bat_Dau',label:'Ngày bắt đầu',type:'date',required:true},
            {key:'Ngay_Ket_Thuc',label:'Ngày kết thúc',type:'date'},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Active','Inactive','Expired','Scheduled'],required:true},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    GIA_THEO_CHINH_SACH: {
        name: 'Giá theo CS', icon: '🏷️',
        columns: [
            {key:'GiaPolicy_ID',label:'Mã giá',type:'text',required:true},
            {key:'ChinhSachGia_ID',label:'Chính sách',type:'select',options:['CS_SI_50','CS_SI_100','CS_SI_200','CS_VIP'],required:true,relation:'CHINH_SACH_GIA'},
            {key:'BienThe_ID',label:'Biến thể',type:'select',options:['BT001','BT002','BT003','BT004','BT005','BT006','BT007','BT008','BT009','BT010'],required:true,relation:'BIEN_THE_SAN_PHAM'},
            {key:'Gia_Mac_Dinh',label:'Giá mặc định',type:'currency'},
            {key:'Gia',label:'Giá CS mới',type:'currency',required:true},
            {key:'Chiet_Khau',label:'Chiết khấu (%)',type:'number'},
            {key:'Ngay_Ap_Dung',label:'Ngày áp dụng',type:'date'},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Active','Inactive'],required:true},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    DON_HANG: {
        name: 'Đơn hàng', icon: '📋',
        columns: [
            {key:'DonHang_ID',label:'Mã ĐH',type:'text',required:true},
            {key:'Ngay_Don',label:'Ngày đặt',type:'datetime',required:true},
            {key:'Kenh_ID',label:'Kênh bán',type:'select',options:['K001','K002','K003','K004'],required:true,relation:'KENH_BAN'},
            {key:'KhachHang_ID',label:'Khách hàng',type:'select',options:['KH001','KH002','KH003','KH004'],required:true,relation:'KHACH_HANG'},
            {key:'NhanVien_ID',label:'NV phụ trách',type:'select',options:['NV01','NV02','NV03'],relation:'NHAN_VIEN'},
            {key:'Loai_Don',label:'Loại đơn',type:'select',options:['Bán lẻ','Bán sỉ','Đồng phục','OEM'],required:true},
            {key:'Nguon_Don',label:'Nguồn đơn',type:'select',options:['Manual','Website','Shopee','TikTok','Affiliate','Facebook','Zalo','Call'],required:true},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Chờ xác nhận','Đã xác nhận','Đang chuẩn bị','Đã đóng gói','Đang giao','Đã giao','Hoàn thành','Đã hủy','Yêu cầu đổi trả'],required:true},
            {key:'Ten_Nguoi_Nhan',label:'Người nhận',type:'text',required:true},
            {key:'SDT_Nguoi_Nhan',label:'SĐT người nhận',type:'phone',required:true},
            {key:'Dia_Chi_Giao',label:'Địa chỉ giao',type:'textarea',required:true},
            {key:'Tinh_TP',label:'Tỉnh/TP',type:'text',required:true},
            {key:'Ghi_Chu_Giao',label:'Ghi chú giao hàng',type:'textarea'},
            {key:'Phi_Van_Chuyen',label:'Phí ship',type:'currency'},
            {key:'Ma_Khuyen_Mai',label:'Mã KM',type:'text'},
            {key:'Giam_Gia',label:'Giảm giá',type:'currency'},
            {key:'Tong_Tien_Hang',label:'Tổng tiền hàng',type:'currency'},
            {key:'Thanh_Tien',label:'Thành tiền',type:'currency',required:true},
            {key:'Ghi_Chu',label:'Ghi chú nội bộ',type:'textarea'}
        ]
    },
    CHI_TIET_DON_HANG: {
        name: 'Chi tiết đơn hàng', icon: '📄',
        columns: [
            {key:'CTDH_ID',label:'Mã CTĐH',type:'text',required:true},
            {key:'DonHang_ID',label:'Đơn hàng',type:'select',options:['DH001','DH002','DH003','DH004'],required:true,relation:'DON_HANG'},
            {key:'BienThe_ID',label:'Biến thể',type:'select',options:['BT001','BT002','BT003','BT004','BT005','BT006','BT007','BT008','BT009','BT010'],required:true,relation:'BIEN_THE_SAN_PHAM'},
            {key:'So_Luong',label:'Số lượng',type:'number',required:true},
            {key:'Don_Gia',label:'Đơn giá',type:'currency',required:true},
            {key:'Chiet_Khau',label:'Chiết khấu',type:'currency'},
            {key:'Thanh_Tien',label:'Thành tiền',type:'currency',required:true},
            {key:'QR_Token',label:'QR Token',type:'text'},
            {key:'Trang_Thai_Doi_Tra',label:'Đổi trả',type:'select',options:['Chưa yêu cầu','Yêu cầu đổi','Đang xử lý','Đã đổi','Yêu cầu trả','Đã trả'],required:true},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    THANH_TOAN: {
        name: 'Thanh toán', icon: '💳',
        columns: [
            {key:'ThanhToan_ID',label:'Mã thanh toán',type:'text',required:true},
            {key:'DonHang_ID',label:'Đơn hàng',type:'select',options:['DH001','DH002','DH003','DH004'],required:true,relation:'DON_HANG'},
            {key:'Phuong_Thuc',label:'Phương thức',type:'select',options:['COD','Chuyển khoản','MoMo','VNPay','ZaloPay','Tiền mặt','ATM'],required:true},
            {key:'So_Tien',label:'Số tiền',type:'currency',required:true},
            {key:'Phi_Thanh_Toan',label:'Phí thanh toán',type:'currency'},
            {key:'So_Tien_Thuc_Nhan',label:'Thực nhận',type:'currency'},
            {key:'Ngay_Thanh_Toan',label:'Ngày thanh toán',type:'datetime',required:true},
            {key:'Ma_Giao_Dich',label:'Mã giao dịch',type:'text'},
            {key:'Ngan_Hang',label:'Ngân hàng',type:'text'},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Pending','Processing','Done','Failed','Refunded'],required:true},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    VAN_CHUYEN: {
        name: 'Vận chuyển', icon: '🚚',
        columns: [
            {key:'VanChuyen_ID',label:'Mã vận chuyển',type:'text',required:true},
            {key:'DonHang_ID',label:'Đơn hàng',type:'select',options:['DH001','DH002','DH003','DH004'],required:true,relation:'DON_HANG'},
            {key:'Don_Vi',label:'Đơn vị vận chuyển',type:'select',options:['GHTK','GHTK Express','Viettel Post','GHN','J&T Express','Ninja Van','Best Express'],required:true},
            {key:'Ma_Van_Don',label:'Mã vận đơn',type:'text'},
            {key:'Loai_Van_Chuyen',label:'Loại VC',type:'select',options:['Tiêu chuẩn','Nhanh','Hỏa tốc','Siêu rẻ']},
            {key:'Phi_Van_Chuyen',label:'Phí VC',type:'currency'},
            {key:'Phi_COD',label:'Phí COD',type:'currency'},
            {key:'Ngay_Lay_Hang',label:'Ngày lấy hàng',type:'datetime'},
            {key:'Ngay_Giao_Hang',label:'Ngày giao dự kiến',type:'date'},
            {key:'Ngay_Giao',label:'Ngày giao thực tế',type:'datetime'},
            {key:'Trang_Thai_Giao',label:'Trạng thái giao',type:'select',options:['Chờ xác nhận','Chờ lấy hàng','Đã lấy hàng','Đang vận chuyển','Đang giao','Đã giao','Giao thất bại','Chuyển hoàn'],required:true},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    DOI_TRA: {
        name: 'Đổi trả', icon: '🔄',
        columns: [
            {key:'DoiTra_ID',label:'Mã đổi trả',type:'text',required:true},
            {key:'CTDH_ID',label:'CTĐH',type:'select',options:['CT001','CT002','CT003','CT004','CT005','CT006','CT007'],required:true,relation:'CHI_TIET_DON_HANG'},
            {key:'DonHang_ID',label:'Đơn hàng',type:'select',options:['DH001','DH002','DH003','DH004'],required:true,relation:'DON_HANG'},
            {key:'KhachHang_ID',label:'Khách hàng',type:'select',options:['KH001','KH002','KH003','KH004'],required:true,relation:'KHACH_HANG'},
            {key:'Loai_Yeu_Cau',label:'Loại',type:'select',options:['Đổi','Trả','Bảo hành'],required:true},
            {key:'So_Luong',label:'Số lượng',type:'number',required:true},
            {key:'Ly_Do',label:'Lý do',type:'textarea',required:true},
            {key:'BienThe_Moi',label:'Biến thể đổi (nếu đổi)',type:'select',options:['BT001','BT002','BT003','BT004','BT005','BT006','BT007','BT008','BT009','BT010'],relation:'BIEN_THE_SAN_PHAM'},
            {key:'So_Tien_Hoan',label:'Số tiền hoàn',type:'currency',required:true},
            {key:'Phuong_Thuc_Hoan',label:'PT hoàn tiền',type:'select',options:['Chuyển khoản','Tiền mặt','Tiền vào ví','Coupon']},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Yêu cầu mới','Đang xác nhận','Đã xác nhận','Đang xử lý','Hoàn thành','Từ chối','Đã hủy'],required:true},
            {key:'Ngay_Yeu_Cau',label:'Ngày yêu cầu',type:'datetime',required:true},
            {key:'Nguoi_Xu_Ly',label:'Người xử lý',type:'text'},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    DIA_CHI_GIAO_HANG: {
        name: 'Địa chỉ giao hàng', icon: '📍',
        columns: [
            {key:'DiaChi_ID',label:'Mã địa chỉ',type:'text',required:true},
            {key:'Ten_Dia_Chi',label:'Tên địa chỉ',type:'text',required:true},
            {key:'Loai_Dia_Chi',label:'Loại',type:'select',options:['Bến xe','Nhà xe','Kho','Văn phòng','Cửa hàng','Khác'],required:true},
            {key:'Ten_Nguoi_Lien_He',label:'Người liên hệ',type:'text'},
            {key:'SDT_Lien_He',label:'SĐT liên hệ',type:'phone'},
            {key:'Dia_Chi_Chi_Tiet',label:'Địa chỉ chi tiết',type:'textarea',required:true},
            {key:'Tinh_TP',label:'Tỉnh/TP',type:'text',required:true},
            {key:'Quan_Huyen',label:'Quận/Huyện',type:'text'},
            {key:'Tuyen_Giao',label:'Tuyến giao',type:'textarea'},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'},
            {key:'Is_Active',label:'Hoạt động',type:'checkbox'}
        ]
    },
    TON_KHO_THANH_PHAM: {
        name: 'Tồn kho', icon: '📈',
        columns: [
            {key:'TonTP_ID',label:'Mã tồn kho',type:'text',required:true},
            {key:'BienThe_ID',label:'Biến thể',type:'select',options:['BT001','BT002','BT003','BT004','BT005','BT006','BT007','BT008','BT009','BT010'],required:true,relation:'BIEN_THE_SAN_PHAM'},
            {key:'Kho_ID',label:'Mã kho',type:'text',required:true},
            {key:'Ten_Kho',label:'Tên kho',type:'text',required:true},
            {key:'Ton_Dau',label:'Tồn đầu kỳ',type:'number',required:true},
            {key:'Nhap',label:'Nhập trong kỳ',type:'number',required:true},
            {key:'Xuat',label:'Xuất trong kỳ',type:'number',required:true},
            {key:'Ton_Cuoi',label:'Tồn cuối kỳ',type:'number',required:true},
            {key:'Ton_Kha_Dung',label:'Khả dụng',type:'number'},
            {key:'Vi_Tri_Kho',label:'Vị trí trong kho',type:'text'},
            {key:'So_Luong_Toi_Thieu',label:'Tồn tối thiểu',type:'number'},
            {key:'Canh_Bao_Ton',label:'Cảnh báo tồn',type:'checkbox'},
            {key:'Ngay_Cap_Nhat',label:'Ngày cập nhật',type:'datetime',required:true},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    NHAP_KHO_THANH_PHAM: {
        name: 'Nhập kho', icon: '📥',
        columns: [
            {key:'NhapTP_ID',label:'Mã nhập kho',type:'text',required:true},
            {key:'LenhSX_ID',label:'Lệnh SX',type:'select',options:['LSX001','LSX002','LSX003'],relation:'LENH_SAN_XUAT'},
            {key:'BienThe_ID',label:'Biến thể',type:'select',options:['BT001','BT002','BT003','BT004','BT005','BT006','BT007','BT008','BT009','BT010'],required:true,relation:'BIEN_THE_SAN_PHAM'},
            {key:'So_Luong_Nhap',label:'SL nhập',type:'number',required:true},
            {key:'Don_Gia_Nhap',label:'Đơn giá nhập',type:'currency'},
            {key:'Thanh_Tien',label:'Thành tiền',type:'currency'},
            {key:'Kho_ID',label:'Kho nhập',type:'text'},
            {key:'Loai_Nhap',label:'Loại nhập',type:'select',options:['Sản xuất','Nhập mua','Nhập đổi','Nhập trả','Kiểm kho']},
            {key:'Ngay_Nhap',label:'Ngày nhập',type:'datetime',required:true},
            {key:'Nguoi_Giao_Hang',label:'Người giao hàng',type:'text'},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Draft','Pending','Approved','Done','Cancelled'],required:true},
            {key:'Xac_Nhan_Boi',label:'Xác nhận bởi',type:'text'},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    LENH_SAN_XUAT: {
        name: 'Lệnh sản xuất', icon: '🏭',
        columns: [
            {key:'LenhSX_ID',label:'Mã lệnh SX',type:'text',required:true},
            {key:'Ten_Lenh',label:'Tên lệnh',type:'text',required:true},
            {key:'Ngay_Tao',label:'Ngày tạo',type:'datetime',required:true},
            {key:'Ngay_Bat_Dau',label:'Ngày bắt đầu',type:'date'},
            {key:'Ngay_DuKien_Hoan',label:'Ngày dự kiến hoàn',type:'date'},
            {key:'Ngay_Hoan_Thanh',label:'Ngày hoàn thành',type:'datetime'},
            {key:'Bo_Phan_SX',label:'Bộ phận SX',type:'select',options:['May','Cắt','Nhuộm','Hoàn thiện']},
            {key:'Trang_Thai',label:'Trạng thái',type:'select',options:['Draft','Approved','In Progress','Paused','Done','Cancelled'],required:true},
            {key:'Tien_Do',label:'Tiến độ (%)',type:'number'},
            {key:'Tong_So_Luong',label:'Tổng SL',type:'number'},
            {key:'Da_Hoan_Thanh',label:'Đã hoàn thành',type:'number'},
            {key:'Chat_Luong_Dat',label:'Chất lượng đạt (%)',type:'number'},
            {key:'Nguoi_Phu_Trach',label:'Người phụ trách',type:'text'},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    CHI_TIET_LENH_SAN_XUAT: {
        name: 'Chi tiết lệnh SX', icon: '📋',
        columns: [
            {key:'CTLenhSX_ID',label:'Mã CTLSX',type:'text',required:true},
            {key:'LenhSX_ID',label:'Lệnh SX',type:'select',options:['LSX001','LSX002','LSX003'],required:true,relation:'LENH_SAN_XUAT'},
            {key:'BienThe_ID',label:'Biến thể',type:'select',options:['BT001','BT002','BT003','BT004','BT005','BT006','BT007','BT008','BT009','BT010'],required:true,relation:'BIEN_THE_SAN_PHAM'},
            {key:'So_Luong_Ke_Hoach',label:'SL kế hoạch',type:'number',required:true},
            {key:'So_Luong_Dat',label:'SL đạt',type:'number'},
            {key:'So_Luong_Loi',label:'SL lỗi',type:'number'},
            {key:'Ty_Le_Dat',label:'Tỷ lệ đạt (%)',type:'number'},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    BAO_CAO_DOANH_THU: {
        name: 'Báo cáo DT', icon: '📊',
        columns: [
            {key:'BaoCao_ID',label:'Mã BC',type:'text',required:true},
            {key:'Loai_Bao_Cao',label:'Loại BC',type:'select',options:['Ngày','Tuần','Tháng','Quý','Năm'],required:true},
            {key:'Ngay_Bat_Dau',label:'Từ ngày',type:'date',required:true},
            {key:'Ngay_Ket_Thuc',label:'Đến ngày',type:'date',required:true},
            {key:'Tong_Don_Hang',label:'Tổng ĐH',type:'number'},
            {key:'Tong_Doanh_Thu',label:'Tổng DT',type:'currency'},
            {key:'Tong_Loi_Nhuan',label:'Lợi nhuận',type:'currency'},
            {key:'Ty_Le_Loi_Nhuan',label:'% Lợi nhuận',type:'number'},
            {key:'Top_San_Pham',label:'Top SP bán chạy',type:'textarea'},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    },
    BAO_CAO_TON_KHO: {
        name: 'Báo cáo TK', icon: '📈',
        columns: [
            {key:'BaoCaoTK_ID',label:'Mã BC',type:'text',required:true},
            {key:'Ngay_Lap',label:'Ngày lập',type:'date',required:true},
            {key:'Tong_San_Pham',label:'Tổng SP',type:'number'},
            {key:'Tong_So_Luong',label:'Tổng SL tồn',type:'number'},
            {key:'Gia_Tri_Ton',label:'Giá trị tồn',type:'currency'},
            {key:'Ton_Thap',label:'SP tồn thấp',type:'number'},
            {key:'Ton_Cao',label:'SP tồn cao',type:'number'},
            {key:'De_Xuat',label:'Đề xuất',type:'textarea'},
            {key:'Ghi_Chu',label:'Ghi chú',type:'textarea'}
        ]
    }
};

// ==================== SAMPLE DATA ====================
const SAMPLE_DATA = {
    KENH_BAN: [
        {Kenh_ID:'K001',Ten_Kenh:'Website',Loai_Kenh:'Online',Mo_Ta:'Bán hàng qua website chính thức',Link_Shop:'https://polomimin.vn',Trang_Thai:'Active',Ngay_Tao:'2024-06-12'},
        {Kenh_ID:'K002',Ten_Kenh:'Shopee',Loai_Kenh:'Marketplace',Mo_Ta:'Shopee Mall',Link_Shop:'https://shopee.vn/polomimin',Trang_Thai:'Active',Ngay_Tao:'2024-06-15'},
        {Kenh_ID:'K003',Ten_Kenh:'TikTok Shop',Loai_Kenh:'Social',Mo_Ta:'TikTok Shop',Link_Shop:'https://tiktok.com/@polomimin',Trang_Thai:'Active',Ngay_Tao:'2024-07-01'},
        {Kenh_ID:'K004',Ten_Kenh:'Cửa hàng HCM',Loai_Kenh:'Offline',Mo_Ta:'Cửa hàng tại TP.HCM',Link_Shop:'',Trang_Thai:'Active',Ngay_Tao:'2024-06-12'}
    ],
    KHACH_HANG: [
        {KhachHang_ID:'KH001',Ten_Khach:'Nguyễn Văn A',Loai_Khach:'Cá nhân',Kenh_Nguon:'K001',Email:'a.nguyen@email.com',Dien_Thoai:'0909123456',Zalo:'0909123456',Dia_Chi:'123 Nguyễn Trãi, P.5, Q.1',Tinh_TP:'TP.HCM',Nhom_Khach:'VIP',Han_Muc_Cong_No:5000000,Tong_Don_Hang:15,Tong_Gia_Tri:4500000,Ngay_Tao:'2024-06-15',Trang_Thai:'Active',Ghi_Chu:'Khách VIP'},
        {KhachHang_ID:'KH002',Ten_Khach:'Cửa hàng X',Loai_Khach:'Cửa hàng',Kenh_Nguon:'K002',Email:'shopx@gmail.com',Dien_Thoai:'0988777666',Zalo:'0988777666',Dia_Chi:'456 Lê Lợi, P.2, Q.3',Tinh_TP:'TP.HCM',Nhom_Khach:'Thường',Han_Muc_Cong_No:20000000,Tong_Don_Hang:8,Tong_Gia_Tri:12000000,Ngay_Tao:'2024-07-10',Trang_Thai:'Active',Ghi_Chu:'Đại lý cấp 1'},
        {KhachHang_ID:'KH003',Ten_Khach:'Trần Minh B',Loai_Khach:'Cá nhân',Kenh_Nguon:'K003',Email:'minhb@email.com',Dien_Thoai:'0933221122',Zalo:'',Dia_Chi:'789 Trần Hưng Đạo, P.11, Q.5',Tinh_TP:'TP.HCM',Nhom_Khach:'Mới',Han_Muc_Cong_No:0,Tong_Don_Hang:2,Tong_Gia_Tri:650000,Ngay_Tao:'2025-01-15',Trang_Thai:'Active',Ghi_Chu:''},
        {KhachHang_ID:'KH004',Ten_Khach:'Công ty ABC',Loai_Khach:'Doanh nghiệp',Kenh_Nguon:'K004',Email:'contact@abc.vn',Dien_Thoai:'02812345678',Zalo:'',Dia_Chi:'Tầng 10, Tòa nhà ABC, 100 Nguyễn Huệ',Tinh_TP:'TP.HCM',Nhom_Khach:'VIP',Han_Muc_Cong_No:100000000,Tong_Don_Hang:3,Tong_Gia_Tri:45000000,Ngay_Tao:'2024-08-20',Trang_Thai:'Active',Ghi_Chu:'Đơn hàng đồng phục'}
    ],
    NHAN_VIEN: [
        {NhanVien_ID:'NV01',Ho_Ten:'Trần Thị B',Ngay_Sinh:'1990-05-15',Gioi_Tinh:'Nữ',Chuc_Vu:'Quản lý sản xuất',Bo_Phan:'Sản xuất',So_Dien_Thoai:'0912345678',Email:'ttb@polomimin.vn',Dia_Chi:'12/39 Xuân Thới Thượng, Bà Điểm, HCM',Ngay_Vao_Lam:'2024-06-01',Luong_Co_Ban:15000000,Phu_Cap:3000000,Role:'Admin',Trang_Thai:'Active',Ghi_Chu:''},
        {NhanVien_ID:'NV02',Ho_Ten:'Lê Văn C',Ngay_Sinh:'1995-08-20',Gioi_Tinh:'Nam',Chuc_Vu:'Nhân viên bán hàng',Bo_Phan:'Kinh doanh',So_Dien_Thoai:'0922333444',Email:'lvc@polomimin.vn',Dia_Chi:'45 Lê Văn Việt, Q.9, HCM',Ngay_Vao_Lam:'2024-07-01',Luong_Co_Ban:10000000,Phu_Cap:2000000,Role:'Sale',Trang_Thai:'Active',Ghi_Chu:''},
        {NhanVien_ID:'NV03',Ho_Ten:'Phạm Thị D',Ngay_Sinh:'1992-03-10',Gioi_Tinh:'Nữ',Chuc_Vu:'Kế toán',Bo_Phan:'Kế toán',So_Dien_Thoai:'0933445566',Email:'ptd@polomimin.vn',Dia_Chi:'78 Nguyễn Oanh, Q. Gò Vấp, HCM',Ngay_Vao_Lam:'2024-06-15',Luong_Co_Ban:12000000,Phu_Cap:2000000,Role:'Accountant',Trang_Thai:'Active',Ghi_Chu:''}
    ],
    SAN_PHAM: [
        {SanPham_ID:'SP01',Ten_SP:'Áo thun Polomimin cổ tròn',Ma_Vach:'8934567890001',Loai:'Áo Thun',Chat_Lieu:'Cotton 100% 240gsm',Mo_ta_chung:'Áo thun basic cotton 100%, mềm mại, thoáng mát',Trong_Luong:200,Noi_Bat:true,Ban_Chay:true,Trang_Thai:'Active',Ngay_Tao:'2024-06-01'},
        {SanPham_ID:'SP02',Ten_SP:'Áo Polo Polomimin cổ bẻ',Ma_Vach:'8934567890002',Loai:'Áo Polo',Chat_Lieu:'Pique Cotton',Mo_ta_chung:'Áo polo nam cao cấp, chất pique cotton thoáng mát',Trong_Luong:220,Noi_Bat:true,Ban_Chay:true,Trang_Thai:'Active',Ngay_Tao:'2024-06-01'},
        {SanPham_ID:'SP03',Ten_SP:'Áo sơ mi nam dài tay Oxford',Ma_Vach:'8934567890003',Loai:'Áo Sơ Mi',Chat_Lieu:'Vải Oxford',Mo_ta_chung:'Áo sơ mi nam dài tay chất vải oxford cao cấp',Trong_Luong:300,Noi_Bat:false,Ban_Chay:false,Trang_Thai:'Active',Ngay_Tao:'2024-07-01'},
        {SanPham_ID:'SP04',Ten_SP:'Quần short nam Thun lụa',Ma_Vach:'8934567890004',Loai:'Quần Short',Chat_Lieu:'Thun lụa',Mo_ta_chung:'Quần short nam chất thun lụa mát mẻ',Trong_Luong:180,Noi_Bat:true,Ban_Chay:false,Trang_Thai:'Active',Ngay_Tao:'2024-07-15'},
        {SanPham_ID:'SP05',Ten_SP:'Quần Jean nam Slim fit',Ma_Vach:'8934567890005',Loai:'Quần Jean',Chat_Lieu:'Denim 12oz',Mo_ta_chung:'Quần jean nam slim fit cao cấp',Trong_Luong:450,Noi_Bat:false,Ban_Chay:true,Trang_Thai:'Active',Ngay_Tao:'2024-08-01'},
        {SanPham_ID:'SP06',Ten_SP:'Hoodie Zipper Fleece',Ma_Vach:'8934567890006',Loai:'Hoodie',Chat_Lieu:'Fleece',Mo_ta_chung:'Hoodie nam chất fleece mềm mại, ấm áp',Trong_Luong:500,Noi_Bat:true,Ban_Chay:false,Trang_Thai:'Active',Ngay_Tao:'2024-09-01'}
    ],
    BIEN_THE_SAN_PHAM: [
        {BienThe_ID:'BT001',SanPham_ID:'SP01',SKU:'SP01-S-TR',Barcode:'8934567890001S',Size:'S',Mau:'Trắng',Mau_Hex:'#FFFFFF',Gia_Nhap:75000,Gia_Ban_Le:150000,Gia_Si_Toi_Thieu:95000,Can_Nang:0.2,Chieu_Cao:60,Trang_Thai:'Active',Ghi_Chu:''},
        {BienThe_ID:'BT002',SanPham_ID:'SP01',SKU:'SP01-M-TR',Barcode:'8934567890001M',Size:'M',Mau:'Trắng',Mau_Hex:'#FFFFFF',Gia_Nhap:75000,Gia_Ban_Le:150000,Gia_Si_Toi_Thieu:95000,Can_Nang:0.22,Chieu_Cao:65,Trang_Thai:'Active',Ghi_Chu:''},
        {BienThe_ID:'BT003',SanPham_ID:'SP01',SKU:'SP01-L-TR',Barcode:'8934567890001L',Size:'L',Mau:'Trắng',Mau_Hex:'#FFFFFF',Gia_Nhap:75000,Gia_Ban_Le:150000,Gia_Si_Toi_Thieu:95000,Can_Nang:0.25,Chieu_Cao:70,Trang_Thai:'Active',Ghi_Chu:''},
        {BienThe_ID:'BT004',SanPham_ID:'SP01',SKU:'SP01-S-DEN',Barcode:'8934567890002S',Size:'S',Mau:'Đen',Mau_Hex:'#1A1A1A',Gia_Nhap:75000,Gia_Ban_Le:150000,Gia_Si_Toi_Thieu:95000,Can_Nang:0.2,Chieu_Cao:60,Trang_Thai:'Active',Ghi_Chu:''},
        {BienThe_ID:'BT005',SanPham_ID:'SP01',SKU:'SP01-M-DEN',Barcode:'8934567890002M',Size:'M',Mau:'Đen',Mau_Hex:'#1A1A1A',Gia_Nhap:75000,Gia_Ban_Le:150000,Gia_Si_Toi_Thieu:95000,Can_Nang:0.22,Chieu_Cao:65,Trang_Thai:'Active',Ghi_Chu:''},
        {BienThe_ID:'BT006',SanPham_ID:'SP02',SKU:'SP02-S-NVY',Barcode:'8934567890003S',Size:'S',Mau:'Xanh Navy',Mau_Hex:'#1A1A2E',Gia_Nhap:110000,Gia_Ban_Le:220000,Gia_Si_Toi_Thieu:140000,Can_Nang:0.22,Chieu_Cao:60,Trang_Thai:'Active',Ghi_Chu:''},
        {BienThe_ID:'BT007',SanPham_ID:'SP02',SKU:'SP02-M-NVY',Barcode:'8934567890003M',Size:'M',Mau:'Xanh Navy',Mau_Hex:'#1A1A2E',Gia_Nhap:110000,Gia_Ban_Le:220000,Gia_Si_Toi_Thieu:140000,Can_Nang:0.24,Chieu_Cao:65,Trang_Thai:'Active',Ghi_Chu:''},
        {BienThe_ID:'BT008',SanPham_ID:'SP02',SKU:'SP02-L-NVY',Barcode:'8934567890003L',Size:'L',Mau:'Xanh Navy',Mau_Hex:'#1A1A2E',Gia_Nhap:110000,Gia_Ban_Le:220000,Gia_Si_Toi_Thieu:140000,Can_Nang:0.27,Chieu_Cao:70,Trang_Thai:'Active',Ghi_Chu:''},
        {BienThe_ID:'BT009',SanPham_ID:'SP03',SKU:'SP03-M-TR',Barcode:'8934567890004M',Size:'M',Mau:'Trắng',Mau_Hex:'#FFFFFF',Gia_Nhap:160000,Gia_Ban_Le:320000,Gia_Si_Toi_Thieu:200000,Can_Nang:0.3,Chieu_Cao:65,Trang_Thai:'Active',Ghi_Chu:''},
        {BienThe_ID:'BT010',SanPham_ID:'SP03',SKU:'SP03-L-TR',Barcode:'8934567890004L',Size:'L',Mau:'Trắng',Mau_Hex:'#FFFFFF',Gia_Nhap:160000,Gia_Ban_Le:320000,Gia_Si_Toi_Thieu:200000,Can_Nang:0.32,Chieu_Cao:70,Trang_Thai:'Active',Ghi_Chu:''}
    ],
    KHO_HANG: [
        {Kho_ID:'KHO001',Ten_Kho:'Kho HCM',Loai_Kho:'Kho chính',Dia_Chi:'12/39 Đường Xuân Thới Thượng 58C, Xã Bà Điểm, HCM',Dien_Thoai:'0774480916',Nguoi_Quan_Ly:'NV01',Tong_San_Pham:6,Tong_So_Luong:430,Trang_Thai:'Active',Ghi_Chu:'Kho chính tại xưởng'},
        {Kho_ID:'KHO002',Ten_Kho:'Kho Black Sale',Loai_Kho:'Kho black sale',Dia_Chi:'12/39 Đường Xuân Thới Thượng 58C, Xã Bà Điểm, HCM',Dien_Thoai:'0774480916',Nguoi_Quan_Ly:'NV01',Tong_San_Pham:1,Tong_So_Luong:8,Trang_Thai:'Active',Ghi_Chu:'Hàng black sale'}
    ],
    CHINH_SACH_GIA: [
        {ChinhSachGia_ID:'CS_SI_50',Ten_Chinh_Sach:'Sỉ sắc bậc 50 cái',Loai_Chinh_Sach:'Sỉ sắc bậc',Kenh_Ap_Dung:'Sỉ',So_Luong_Toi_Thieu:50,So_Luong_Toi_Da:99,Phan_Tram_Giam:0,Ngay_Bat_Dau:'2024-06-01',Ngay_Ket_Thuc:'',Trang_Thai:'Active',Ghi_Chu:''},
        {ChinhSachGia_ID:'CS_SI_100',Ten_Chinh_Sach:'Sỉ sắc bậc 100 cái',Loai_Chinh_Sach:'Sỉ sắc bậc',Kenh_Ap_Dung:'Sỉ',So_Luong_Toi_Thieu:100,So_Luong_Toi_Da:0,Phan_Tram_Giam:0,Ngay_Bat_Dau:'2024-06-01',Ngay_Ket_Thuc:'',Trang_Thai:'Active',Ghi_Chu:''},
        {ChinhSachGia_ID:'CS_SI_200',Ten_Chinh_Sach:'Sỉ sắc bậc 200 cái',Loai_Chinh_Sach:'Sỉ sắc bậc',Kenh_Ap_Dung:'Sỉ',So_Luong_Toi_Thieu:200,So_Luong_Toi_Da:0,Phan_Tram_Giam:0,Ngay_Bat_Dau:'2024-06-01',Ngay_Ket_Thuc:'',Trang_Thai:'Active',Ghi_Chu:''},
        {ChinhSachGia_ID:'CS_VIP',Ten_Chinh_Sach:'Khách hàng VIP',Loai_Chinh_Sach:'VIP',Kenh_Ap_Dung:'Tất cả',So_Luong_Toi_Thieu:1,So_Luong_Toi_Da:0,Phan_Tram_Giam:15,Ngay_Bat_Dau:'2024-06-01',Ngay_Ket_Thuc:'',Trang_Thai:'Active',Ghi_Chu:'Giảm 15% cho KH VIP'}
    ],
    GIA_THEO_CHINH_SACH: [
        {GiaPolicy_ID:'GP_BT002_50',ChinhSachGia_ID:'CS_SI_50',BienThe_ID:'BT002',Gia_Mac_Dinh:150000,Gia:53000,Chiet_Khau:65,Ngay_Ap_Dung:'2024-06-01',Trang_Thai:'Active',Ghi_Chu:''},
        {GiaPolicy_ID:'GP_BT002_100',ChinhSachGia_ID:'CS_SI_100',BienThe_ID:'BT002',Gia_Mac_Dinh:150000,Gia:51000,Chiet_Khau:66,Ngay_Ap_Dung:'2024-06-01',Trang_Thai:'Active',Ghi_Chu:''},
        {GiaPolicy_ID:'GP_BT001_50',ChinhSachGia_ID:'CS_SI_50',BienThe_ID:'BT001',Gia_Mac_Dinh:150000,Gia:53000,Chiet_Khau:65,Ngay_Ap_Dung:'2024-06-01',Trang_Thai:'Active',Ghi_Chu:''},
        {GiaPolicy_ID:'GP_BT001_100',ChinhSachGia_ID:'CS_SI_100',BienThe_ID:'BT001',Gia_Mac_Dinh:150000,Gia:51000,Chiet_Khau:66,Ngay_Ap_Dung:'2024-06-01',Trang_Thai:'Active',Ghi_Chu:''},
        {GiaPolicy_ID:'GP_BT007_50',ChinhSachGia_ID:'CS_SI_50',BienThe_ID:'BT007',Gia_Mac_Dinh:220000,Gia:85000,Chiet_Khau:61,Ngay_Ap_Dung:'2024-06-01',Trang_Thai:'Active',Ghi_Chu:''},
        {GiaPolicy_ID:'GP_BT007_100',ChinhSachGia_ID:'CS_SI_100',BienThe_ID:'BT007',Gia_Mac_Dinh:220000,Gia:82000,Chiet_Khau:63,Ngay_Ap_Dung:'2024-06-01',Trang_Thai:'Active',Ghi_Chu:''}
    ],
    DON_HANG: [
        {DonHang_ID:'DH001',Ngay_Don:'2025-03-20T10:30',Kenh_ID:'K001',KhachHang_ID:'KH001',NhanVien_ID:'NV02',Loai_Don:'Bán lẻ',Nguon_Don:'Website',Trang_Thai:'Hoàn thành',Ten_Nguoi_Nhan:'Nguyễn Văn A',SDT_Nguoi_Nhan:'0909123456',Dia_Chi_Giao:'123 Nguyễn Trãi, P.5, Q.1',Tinh_TP:'TP.HCM',Ghi_Chu_Giao:'',Phi_Van_Chuyen:20000,Ma_Khuyen_Mai:'',Giam_Gia:0,Tong_Tien_Hang:300000,Thanh_Tien:320000,Ghi_Chu:''},
        {DonHang_ID:'DH002',Ngay_Don:'2025-03-21T15:45',Kenh_ID:'K002',KhachHang_ID:'KH002',NhanVien_ID:'NV02',Loai_Don:'Bán sỉ',Nguon_Don:'Shopee',Trang_Thai:'Đang giao',Ten_Nguoi_Nhan:'Cửa hàng X',SDT_Nguoi_Nhan:'0988777666',Dia_Chi_Giao:'456 Lê Lợi, P.2, Q.3',Tinh_TP:'TP.HCM',Ghi_Chu_Giao:'',Phi_Van_Chuyen:35000,Ma_Khuyen_Mai:'',Giam_Gia:5000,Tong_Tien_Hang:550000,Thanh_Tien:555000,Ghi_Chu:'Khách sỉ'},
        {DonHang_ID:'DH003',Ngay_Don:'2025-03-22T09:15',Kenh_ID:'K003',KhachHang_ID:'KH003',NhanVien_ID:'NV02',Loai_Don:'Bán lẻ',Nguon_Don:'TikTok',Trang_Thai:'Đang chuẩn bị',Ten_Nguoi_Nhan:'Trần Minh B',SDT_Nguoi_Nhan:'0933221122',Dia_Chi_Giao:'789 Trần Hưng Đạo, P.11, Q.5',Tinh_TP:'TP.HCM',Ghi_Chu_Giao:'',Phi_Van_Chuyen:25000,Ma_Khuyen_Mai:'NEW50K',Giam_Gia:0,Tong_Tien_Hang:440000,Thanh_Tien:465000,Ghi_Chu:'Khách mới'},
        {DonHang_ID:'DH004',Ngay_Don:'2025-03-23T11:20',Kenh_ID:'K001',KhachHang_ID:'KH001',NhanVien_ID:'NV02',Loai_Don:'Bán lẻ',Nguon_Don:'Manual',Trang_Thai:'Hoàn thành',Ten_Nguoi_Nhan:'Nguyễn Văn A',SDT_Nguoi_Nhan:'0909123456',Dia_Chi_Giao:'123 Nguyễn Trãi, P.5, Q.1',Tinh_TP:'TP.HCM',Ghi_Chu_Giao:'',Phi_Van_Chuyen:0,Ma_Khuyen_Mai:'',Giam_Gia:10000,Tong_Tien_Hang:300000,Thanh_Tien:290000,Ghi_Chu:'Freeship'}
    ],
    CHI_TIET_DON_HANG: [
        {CTDH_ID:'CT001',DonHang_ID:'DH001',BienThe_ID:'BT002',So_Luong:2,Don_Gia:150000,Chiet_Khau:0,Thanh_Tien:300000,QR_Token:'abc123xyz',Trang_Thai_Doi_Tra:'Chưa yêu cầu',Ghi_Chu:''},
        {CTDH_ID:'CT002',DonHang_ID:'DH001',BienThe_ID:'BT001',So_Luong:1,Don_Gia:150000,Chiet_Khau:0,Thanh_Tien:150000,QR_Token:'def456uvw',Trang_Thai_Doi_Tra:'Chưa yêu cầu',Ghi_Chu:''},
        {CTDH_ID:'CT003',DonHang_ID:'DH002',BienThe_ID:'BT007',So_Luong:2,Don_Gia:220000,Chiet_Khau:10000,Thanh_Tien:430000,QR_Token:'ghi789rst',Trang_Thai_Doi_Tra:'Chưa yêu cầu',Ghi_Chu:'Chiết khấu sỉ'},
        {CTDH_ID:'CT004',DonHang_ID:'DH002',BienThe_ID:'BT006',So_Luong:1,Don_Gia:220000,Chiet_Khau:0,Thanh_Tien:220000,QR_Token:'jkl012uvw',Trang_Thai_Doi_Tra:'Chưa yêu cầu',Ghi_Chu:''},
        {CTDH_ID:'CT005',DonHang_ID:'DH003',BienThe_ID:'BT009',So_Luong:1,Don_Gia:320000,Chiet_Khau:0,Thanh_Tien:320000,QR_Token:'mno345xyz',Trang_Thai_Doi_Tra:'Chưa yêu cầu',Ghi_Chu:''},
        {CTDH_ID:'CT006',DonHang_ID:'DH003',BienThe_ID:'BT003',So_Luong:1,Don_Gia:150000,Chiet_Khau:30000,Thanh_Tien:120000,QR_Token:'pqr678abc',Trang_Thai_Doi_Tra:'Chưa yêu cầu',Ghi_Chu:'Khách mới'},
        {CTDH_ID:'CT007',DonHang_ID:'DH004',BienThe_ID:'BT005',So_Luong:2,Don_Gia:150000,Chiet_Khau:10000,Thanh_Tien:290000,QR_Token:'stu901def',Trang_Thai_Doi_Tra:'Chưa yêu cầu',Ghi_Chu:''}
    ],
    THANH_TOAN: [
        {ThanhToan_ID:'TT001',DonHang_ID:'DH001',Phuong_Thuc:'Chuyển khoản',So_Tien:320000,Phi_Thanh_Toan:0,So_Tien_Thuc_Nhan:320000,Ngay_Thanh_Toan:'2025-03-20T10:35',Ma_Giao_Dich:'TXN123456',Ngan_Hang:'Vietcombank',Trang_Thai:'Done',Ghi_Chu:''},
        {ThanhToan_ID:'TT002',DonHang_ID:'DH002',Phuong_Thuc:'COD',So_Tien:555000,Phi_Thanh_Toan:16650,So_Tien_Thuc_Nhan:538350,Ngay_Thanh_Toan:'2025-03-22T14:00',Ma_Giao_Dich:'',Ngan_Hang:'',Trang_Thai:'Pending',Ghi_Chu:'Chờ thu tiền'},
        {ThanhToan_ID:'TT003',DonHang_ID:'DH003',Phuong_Thuc:'Chuyển khoản',So_Tien:465000,Phi_Thanh_Toan:0,So_Tien_Thuc_Nhan:465000,Ngay_Thanh_Toan:'2025-03-22T09:20',Ma_Giao_Dich:'TXN789012',Ngan_Hang:'MB Bank',Trang_Thai:'Done',Ghi_Chu:''},
        {ThanhToan_ID:'TT004',DonHang_ID:'DH004',Phuong_Thuc:'COD',So_Tien:290000,Phi_Thanh_Toan:8700,So_Tien_Thuc_Nhan:281300,Ngay_Thanh_Toan:'2025-03-23T16:00',Ma_Giao_Dich:'',Ngan_Hang:'',Trang_Thai:'Done',Ghi_Chu:''}
    ],
    VAN_CHUYEN: [
        {VanChuyen_ID:'VC001',DonHang_ID:'DH001',Don_Vi:'GHTK',Ma_Van_Don:'GH123456789',Loai_Van_Chuyen:'Nhanh',Phi_Van_Chuyen:20000,Phi_COD:9600,Ngay_Lay_Hang:'2025-03-20T18:00',Ngay_Giao_Hang:'2025-03-22',Ngay_Giao:'2025-03-22T14:30',Trang_Thai_Giao:'Đã giao',Ghi_Chu:''},
        {VanChuyen_ID:'VC002',DonHang_ID:'DH002',Don_Vi:'Viettel Post',Ma_Van_Don:'VT789012345',Loai_Van_Chuyen:'Tiêu chuẩn',Phi_Van_Chuyen:35000,Phi_COD:16650,Ngay_Lay_Hang:'2025-03-21T16:00',Ngay_Giao_Hang:'2025-03-25',Ngay_Giao:'',Trang_Thai_Giao:'Đang vận chuyển',Ghi_Chu:''},
        {VanChuyen_ID:'VC003',DonHang_ID:'DH003',Don_Vi:'GHTK',Ma_Van_Don:'GH345678901',Loai_Van_Chuyen:'Nhanh',Phi_Van_Chuyen:25000,Phi_COD:13950,Ngay_Lay_Hang:'',Ngay_Giao_Hang:'2025-03-24',Ngay_Giao:'',Trang_Thai_Giao:'Chờ lấy hàng',Ghi_Chu:'Chờ đóng gói'}
    ],
    DOI_TRA: [
        {DoiTra_ID:'DT001',CTDH_ID:'CT002',DonHang_ID:'DH001',KhachHang_ID:'KH001',Loai_Yeu_Cau:'Đổi',So_Luong:1,Ly_Do:'Sai size M, muốn đổi sang size L',BienThe_Moi:'BT003',So_Tien_Hoan:0,Phuong_Thuc_Hoan:'',Trang_Thai:'Yêu cầu mới',Ngay_Yeu_Cau:'2025-04-03T10:30',Nguoi_Xu_Ly:'',Ghi_Chu:''},
        {DoiTra_ID:'DT002',CTDH_ID:'CT004',DonHang_ID:'DH002',KhachHang_ID:'KH002',Loai_Yeu_Cau:'Trả',So_Luong:1,Ly_Do:'Sản phẩm có lỗi từ nhà sản xuất',BienThe_Moi:'',So_Tien_Hoan:220000,Phuong_Thuc_Hoan:'Chuyển khoản',Trang_Thai:'Đang xử lý',Ngay_Yeu_Cau:'2025-04-05T14:00',Nguoi_Xu_Ly:'',Ghi_Chu:'Đang chờ QC kiểm tra'}
    ],
    DIA_CHI_GIAO_HANG: [
        {DiaChi_ID:'DC001',Ten_Dia_Chi:'Bến xe Miền Đông',Loai_Dia_Chi:'Bến xe',Ten_Nguoi_Lien_He:'Anh Hùng',SDT_Lien_He:'0909123456',Dia_Chi_Chi_Tiet:'292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh',Tinh_TP:'TP.HCM',Quan_Huyen:'Q.Bình Thạnh',Tuyen_Giao:'Tuyến Đà Lạt, Nha Trang, Đà Nẵng',Ghi_Chu:'',Is_Active:true},
        {DiaChi_ID:'DC002',Ten_Dia_Chi:'Nhà xe Phương Trang',Loai_Dia_Chi:'Nhà xe',Ten_Nguoi_Lien_He:'Anh Minh',SDT_Lien_He:'0988777666',Dia_Chi_Chi_Tiet:'231 Lê Hồng Phong, P.5, Q.10',Tinh_TP:'TP.HCM',Quan_Huyen:'Q.10',Tuyen_Giao:'Tuyến Cần Thơ, An Giang',Ghi_Chu:'Có bãi đỗ xe tải',Is_Active:true},
        {DiaChi_ID:'DC003',Ten_Dia_Chi:'Bến xe Miền Tây',Loai_Dia_Chi:'Bến xe',Ten_Nguoi_Lien_He:'Anh Tuấn',SDT_Lien_He:'0933221122',Dia_Chi_Chi_Tiet:'395 Kinh Dương Vương, P.13, Q.6',Tinh_TP:'TP.HCM',Quan_Huyen:'Q.6',Tuyen_Giao:'Tuyến các tỉnh miền Tây',Ghi_Chu:'',Is_Active:true}
    ],
    TON_KHO_THANH_PHAM: [
        {TonTP_ID:'TK001',BienThe_ID:'BT002',Kho_ID:'KHO001',Ten_Kho:'Kho HCM',Ton_Dau:50,Nhap:100,Xuat:45,Ton_Cuoi:105,Ton_Kha_Dung:105,Vi_Tri_Kho:'A-01-05',So_Luong_Toi_Thieu:10,Canh_Bao_Ton:false,Ngay_Cap_Nhat:'2025-04-01T18:00',Ghi_Chu:''},
        {TonTP_ID:'TK002',BienThe_ID:'BT002',Kho_ID:'KHO002',Ten_Kho:'Kho Black Sale',Ton_Dau:10,Nhap:0,Xuat:2,Ton_Cuoi:8,Ton_Kha_Dung:8,Vi_Tri_Kho:'B-02-01',So_Luong_Toi_Thieu:5,Canh_Bao_Ton:true,Ngay_Cap_Nhat:'2025-04-01T18:00',Ghi_Chu:'Hàng black sale'},
        {TonTP_ID:'TK003',BienThe_ID:'BT001',Kho_ID:'KHO001',Ten_Kho:'Kho HCM',Ton_Dau:80,Nhap:50,Xuat:30,Ton_Cuoi:100,Ton_Kha_Dung:100,Vi_Tri_Kho:'A-01-03',So_Luong_Toi_Thieu:10,Canh_Bao_Ton:false,Ngay_Cap_Nhat:'2025-04-01T18:00',Ghi_Chu:''},
        {TonTP_ID:'TK004',BienThe_ID:'BT003',Kho_ID:'KHO001',Ten_Kho:'Kho HCM',Ton_Dau:60,Nhap:80,Xuat:40,Ton_Cuoi:100,Ton_Kha_Dung:100,Vi_Tri_Kho:'A-01-07',So_Luong_Toi_Thieu:10,Canh_Bao_Ton:false,Ngay_Cap_Nhat:'2025-04-01T18:00',Ghi_Chu:''},
        {TonTP_ID:'TK005',BienThe_ID:'BT007',Kho_ID:'KHO001',Ten_Kho:'Kho HCM',Ton_Dau:40,Nhap:60,Xuat:25,Ton_Cuoi:75,Ton_Kha_Dung:75,Vi_Tri_Kho:'A-02-02',So_Luong_Toi_Thieu:10,Canh_Bao_Ton:false,Ngay_Cap_Nhat:'2025-04-01T18:00',Ghi_Chu:''}
    ],
    NHAP_KHO_THANH_PHAM: [
        {NhapTP_ID:'NK001',LenhSX_ID:'LSX001',BienThe_ID:'BT002',So_Luong_Nhap:100,Don_Gia_Nhap:75000,Thanh_Tien:7500000,Kho_ID:'KHO001',Loai_Nhap:'Sản xuất',Ngay_Nhap:'2025-03-10T14:00',Nguoi_Giao_Hang:'Trần Thị B',Trang_Thai:'Done',Xac_Nhan_Boi:'NV01',Ghi_Chu:'Nhập theo lệnh SX'},
        {NhapTP_ID:'NK002',LenhSX_ID:'LSX002',BienThe_ID:'BT001',So_Luong_Nhap:50,Don_Gia_Nhap:75000,Thanh_Tien:3750000,Kho_ID:'KHO001',Loai_Nhap:'Sản xuất',Ngay_Nhap:'2025-03-12T10:00',Nguoi_Giao_Hang:'Trần Thị B',Trang_Thai:'Done',Xac_Nhan_Boi:'NV01',Ghi_Chu:'Nhập bổ sung'},
        {NhapTP_ID:'NK003',LenhSX_ID:'LSX003',BienThe_ID:'BT003',So_Luong_Nhap:80,Don_Gia_Nhap:160000,Thanh_Tien:12800000,Kho_ID:'KHO001',Loai_Nhap:'Sản xuất',Ngay_Nhap:'2025-03-15T16:00',Nguoi_Giao_Hang:'Trần Thị B',Trang_Thai:'Done',Xac_Nhan_Boi:'NV01',Ghi_Chu:'Nhập theo lệnh SX'}
    ],
    LENH_SAN_XUAT: [
        {LenhSX_ID:'LSX001',Ten_Lenh:'SX Áo thun trắng M',Ngay_Tao:'2025-03-05T08:00',Ngay_Bat_Dau:'2025-03-05',Ngay_DuKien_Hoan:'2025-03-10',Ngay_Hoan_Thanh:'2025-03-10T17:00',Bo_Phan_SX:'May',Trang_Thai:'Done',Tien_Do:100,Tong_So_Luong:100,Da_Hoan_Thanh:100,Chat_Luong_Dat:98,Nguoi_Phu_Trach:'NV01',Ghi_Chu:'Lệnh sản xuất 100 áo'},
        {LenhSX_ID:'LSX002',Ten_Lenh:'SX Áo thun trắng S',Ngay_Tao:'2025-03-10T09:00',Ngay_Bat_Dau:'2025-03-10',Ngay_DuKien_Hoan:'2025-03-15',Ngay_Hoan_Thanh:'',Bo_Phan_SX:'May',Trang_Thai:'Draft',Tien_Do:0,Tong_So_Luong:50,Da_Hoan_Thanh:0,Chat_Luong_Dat:0,Nguoi_Phu_Trach:'NV01',Ghi_Chu:'Lệnh nháp'},
        {LenhSX_ID:'LSX003',Ten_Lenh:'SX Áo sơ mi trắng',Ngay_Tao:'2025-03-12T10:00',Ngay_Bat_Dau:'2025-03-12',Ngay_DuKien_Hoan:'2025-03-20',Ngay_Hoan_Thanh:'',Bo_Phan_SX:'May',Trang_Thai:'In Progress',Tien_Do:60,Tong_So_Luong:80,Da_Hoan_Thanh:48,Chat_Luong_Dat:97,Nguoi_Phu_Trach:'NV01',Ghi_Chu:'Sản xuất 80 áo Polo'}
    ],
    CHI_TIET_LENH_SAN_XUAT: [
        {CTLenhSX_ID:'CTLSX001',LenhSX_ID:'LSX001',BienThe_ID:'BT002',So_Luong_Ke_Hoach:100,So_Luong_Dat:100,So_Luong_Loi:2,Ty_Le_Dat:98,Ghi_Chu:''},
        {CTLenhSX_ID:'CTLSX002',LenhSX_ID:'LSX002',BienThe_ID:'BT001',So_Luong_Ke_Hoach:50,So_Luong_Dat:0,So_Luong_Loi:0,Ty_Le_Dat:0,Ghi_Chu:'Chưa sản xuất'},
        {CTLenhSX_ID:'CTLSX003',LenhSX_ID:'LSX003',BienThe_ID:'BT009',So_Luong_Ke_Hoach:50,So_Luong_Dat:48,So_Luong_Loi:1,Ty_Le_Dat:96,Ghi_Chu:''},
        {CTLenhSX_ID:'CTLSX004',LenhSX_ID:'LSX003',BienThe_ID:'BT010',So_Luong_Ke_Hoach:30,So_Luong_Dat:0,So_Luong_Loi:0,Ty_Le_Dat:0,Ghi_Chu:'Đang chờ'}
    ],
    BAO_CAO_DOANH_THU: [
        {BaoCao_ID:'BCDT001',Loai_Bao_Cao:'Tháng',Ngay_Bat_Dau:'2025-03-01',Ngay_Ket_Thuc:'2025-03-31',Tong_Don_Hang:45,Tong_Doanh_Thu:67500000,Tong_Loi_Nhuan:20250000,Ty_Le_Loi_Nhuan:30,Top_San_Pham:'Áo Thun, Áo Polo',Ghi_Chu:'Báo cáo tháng 3/2025'},
        {BaoCao_ID:'BCDT002',Loai_Bao_Cao:'Tuần',Ngay_Bat_Dau:'2025-03-25',Ngay_Ket_Thuc:'2025-03-31',Tong_Don_Hang:12,Tong_Doanh_Thu:18600000,Tong_Loi_Nhuan:5580000,Ty_Le_Loi_Nhuan:30,Top_San_Pham:'Áo Polo Navy',Ghi_Chu:'Tuần cuối tháng 3'}
    ],
    BAO_CAO_TON_KHO: [
        {BaoCaoTK_ID:'BCTK001',Ngay_Lap:'2025-03-31',Tong_San_Pham:6,Tong_So_Luong:438,Gia_Tri_Ton:65700000,Ton_Thap:2,Ton_Cao:4,De_Xuat:'Nhập thêm BT001, BT003',Ghi_Chu:'Báo cáo cuối tháng'}
    ]
};

// ==================== APP CLASS ====================
class ERPApp {
    constructor() {
        this.data = {};
        this.currentPage = 'dashboard';
        this.searchQuery = '';
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.notifications = [];
        this.init();
    }

    init() {
        this.loadData();
        this.renderSidebar();
        this.render();
        this.startAutoSave();
        this.loadNotifications();
    }

    loadData() {
        const stored = localStorage.getItem('polomimin_erp_v2');
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = JSON.parse(JSON.stringify(SAMPLE_DATA));
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('polomimin_erp_v2', JSON.stringify(this.data));
    }

    startAutoSave() {
        setInterval(() => {
            this.saveData();
            document.getElementById('autosave-indicator').textContent = `Đã lưu lúc ${new Date().toLocaleTimeString('vi-VN')}`;
        }, 30000);
    }

    loadNotifications() {
        this.notifications = [
            {icon:'🛒',message:'Có đơn hàng mới từ Website',time:'5 phút trước',type:'order'},
            {icon:'🔄',message:'Yêu cầu đổi trả từ KH001',time:'1 giờ trước',type:'return'},
            {icon:'⚠️',message:'Tồn kho BT002 dưới mức tối thiểu',time:'2 giờ trước',type:'warning'},
            {icon:'✅',message:'Đơn DH001 đã giao thành công',time:'3 giờ trước',type:'success'}
        ];
    }

    renderSidebar() {
        const modules = [
            {id:'dashboard',icon:'📊',label:'Dashboard',section:'overview'},
            {id:'kenh-ban',icon:'🏪',label:'Kênh bán',section:'catalog'},
            {id:'khach-hang',icon:'👥',label:'Khách hàng',section:'catalog'},
            {id:'nhan-vien',icon:'👔',label:'Nhân viên',section:'catalog'},
            {id:'san-pham',icon:'📦',label:'Sản phẩm',section:'catalog'},
            {id:'bien-the',icon:'🎨',label:'Biến thể',section:'catalog'},
            {id:'kho-hang',icon:'🏪',label:'Kho hàng',section:'catalog'},
            {id:'chinh-sach-gia',icon:'💰',label:'CS Giá',section:'pricing'},
            {id:'gia-chinh-sach',icon:'🏷️',label:'Giá CS',section:'pricing'},
            {id:'don-hang',icon:'📋',label:'Đơn hàng',section:'orders'},
            {id:'chi-tiet-dh',icon:'📄',label:'CT Đơn hàng',section:'orders'},
            {id:'thanh-toan',icon:'💳',label:'Thanh toán',section:'orders'},
            {id:'van-chuyen',icon:'🚚',label:'Vận chuyển',section:'orders'},
            {id:'doi-tra',icon:'🔄',label:'Đổi trả',section:'orders'},
            {id:'bao-cao-dt',icon:'📊',label:'BC Doanh thu',section:'reports'},
            {id:'bao-cao-tk',icon:'📈',label:'BC Tồn kho',section:'reports'},
            {id:'dia-chi',icon:'📍',label:'Địa chỉ giao',section:'orders'},
            {id:'ton-kho',icon:'📈',label:'Tồn kho',section:'warehouse'},
            {id:'nhap-kho',icon:'📥',label:'Nhập kho',section:'warehouse'},
            {id:'lenh-san-xuat',icon:'🏭',label:'Lệnh SX',section:'warehouse'},
            {id:'chi-tiet-lsx',icon:'📋',label:'CT Lệnh SX',section:'warehouse'}
        ];

        let html = '';
        let currentSection = '';
        const sectionNames = {overview:'Tổng quan',catalog:'Danh mục',pricing:'Giá & CS',orders:'Đơn hàng',warehouse:'Kho & SX'};

        modules.forEach(mod => {
            if (mod.section !== currentSection) {
                currentSection = mod.section;
                html += `<div class="nav-section-title">${sectionNames[currentSection]}</div>`;
            }
            const isActive = this.currentPage === mod.id ? 'active' : '';
            const badge = mod.id === 'don-hang' ? `<span class="badge">${this.data.DON_HANG?.length || 0}</span>` : '';
            html += `<div class="nav-item ${isActive}" data-page="${mod.id}"><span class="icon">${mod.icon}</span><span>${mod.label}</span>${badge}</div>`;
        });

        document.getElementById('sidebar-nav').innerHTML = html;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentPage = item.dataset.page;
                this.renderSidebar();
                this.render();
            });
        });
    }

    render() {
        document.getElementById('page-title').textContent = this.currentPage === 'dashboard' ? 'Dashboard' : (DATA_MODELS[this.currentPage.toUpperCase().replace(/-/g,'_')]?.name || this.currentPage);
        
        if (this.currentPage === 'dashboard') {
            document.getElementById('main-content').innerHTML = this.renderDashboard();
            this.initCharts();
        } else {
            document.getElementById('main-content').innerHTML = this.renderDataTable();
        }
    }

    renderDashboard() {
        const stats = this.calculateStats();
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon pink">📋</div>
                    <div class="stat-content">
                        <div class="stat-label">Đơn hàng hôm nay</div>
                        <div class="stat-value">${stats.todayOrders}</div>
                        <div class="stat-change ${stats.ordersChange>=0?'up':'down'}">${stats.ordersChange>=0?'↑':'↓'} ${Math.abs(stats.ordersChange)}% so với hôm qua</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">💰</div>
                    <div class="stat-content">
                        <div class="stat-label">Doanh thu hôm nay</div>
                        <div class="stat-value">${this.formatCurrency(stats.todayRevenue)}</div>
                        <div class="stat-change ${stats.revenueChange>=0?'up':'down'}">${stats.revenueChange>=0?'↑':'↓'} ${Math.abs(stats.revenueChange)}% so với hôm qua</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">📦</div>
                    <div class="stat-content">
                        <div class="stat-label">Sản phẩm</div>
                        <div class="stat-value">${stats.totalProducts}</div>
                        <div class="stat-sub">${stats.totalVariants} biến thể</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">👥</div>
                    <div class="stat-content">
                        <div class="stat-label">Khách hàng</div>
                        <div class="stat-value">${stats.totalCustomers}</div>
                        <div class="stat-sub">${stats.newCustomers} khách mới</div>
                    </div>
                </div>
            </div>
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header"><h3>📈 Biểu đồ doanh thu 7 ngày</h3></div>
                    <div class="card-body"><canvas id="revenueChart" height="200"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>📊 Đơn hàng theo kênh</h3></div>
                    <div class="card-body"><canvas id="ordersChart" height="200"></canvas></div>
                </div>
            </div>
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header"><h3>🛒 Đơn hàng gần đây</h3><button class="btn btn-sm btn-secondary" onclick="app.currentPage='don-hang';app.renderSidebar();app.render();">Xem tất cả</button></div>
                    <div class="table-container">
                        <table class="table">
                            <thead><tr><th>Mã ĐH</th><th>Khách hàng</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                            <tbody>${this.renderRecentOrders()}</tbody>
                        </table>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>⚠️ Cảnh báo tồn kho thấp</h3><button class="btn btn-sm btn-secondary" onclick="app.currentPage='ton-kho';app.renderSidebar();app.render();">Xem kho</button></div>
                    <div class="table-container">
                        <table class="table">
                            <thead><tr><th>Sản phẩm</th><th>SKU</th><th>Tồn kho</th><th>Trạng thái</th></tr></thead>
                            <tbody>${this.renderLowStock()}</tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header"><h3>📋 Công việc cần xử lý</h3></div>
                    <div class="card-body">${this.renderTasks()}</div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>📌 Thông báo</h3><span class="badge badge-primary">${this.notifications.length}</span></div>
                    <div class="notification-list">${this.renderNotifications()}</div>
                </div>
            </div>
        `;
    }

    calculateStats() {
        const orders = this.data.DON_HANG || [];
        const payments = this.data.THANH_TOAN || [];
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(o => o.Ngay_Don?.startsWith(today)).length;
        const todayRevenue = payments.filter(p => p.Ngay_Thanh_Toan?.startsWith(today) && p.Trang_Thai === 'Done').reduce((sum, p) => sum + (p.So_Tien_Thuc_Nhan || p.So_Tien || 0), 0);
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const yesterdayOrders = orders.filter(o => o.Ngay_Don?.startsWith(yesterday)).length;
        const yesterdayRevenue = payments.filter(p => p.Ngay_Thanh_Toan?.startsWith(yesterday) && p.Trang_Thai === 'Done').reduce((sum, p) => sum + (p.So_Tien_Thuc_Nhan || p.So_Tien || 0), 0);
        return {
            todayOrders, todayRevenue,
            ordersChange: yesterdayOrders > 0 ? Math.round((todayOrders - yesterdayOrders) / yesterdayOrders * 100) : 0,
            revenueChange: yesterdayRevenue > 0 ? Math.round((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0,
            totalProducts: (this.data.SAN_PHAM || []).length,
            totalVariants: (this.data.BIEN_THE_SAN_PHAM || []).length,
            totalCustomers: (this.data.KHACH_HANG || []).length,
            newCustomers: (this.data.KHACH_HANG || []).filter(c => c.Ngay_Tao === today).length
        };
    }

    renderRecentOrders() {
        const orders = (this.data.DON_HANG || []).slice(-5).reverse();
        return orders.map(o => {
            const customer = (this.data.KHACH_HANG || []).find(c => c.KhachHang_ID === o.KhachHang_ID);
            return `<tr><td><strong>${o.DonHang_ID}</strong></td><td>${customer?.Ten_Khach || 'N/A'}</td><td>${this.formatDate(o.Ngay_Don)}</td><td>${this.formatCurrency(o.Thanh_Tien)}</td><td><span class="badge badge-${this.getStatusClass(o.Trang_Thai)}">${o.Trang_Thai}</span></td></tr>`;
        }).join('') || '<tr><td colspan="5" class="text-center text-muted p-4">Không có đơn hàng</td></tr>';
    }

    renderLowStock() {
        const inventory = this.data.TON_KHO_THANH_PHAM || [];
        return inventory.filter(i => i.Ton_Cuoi < (i.So_Luong_Toi_Thieu || 10)).slice(0, 5).map(i => {
            const variant = (this.data.BIEN_THE_SAN_PHAM || []).find(v => v.BienThe_ID === i.BienThe_ID);
            return `<tr><td>${variant?.SKU || 'N/A'}</td><td>${i.Ten_Kho}</td><td><span class="badge badge-danger">${i.Ton_Cuoi}</span></td><td>⚠️ Thấp</td></tr>`;
        }).join('') || '<tr><td colspan="4" class="text-center text-muted p-4">Tất cả đủ hàng</td></tr>';
    }

    renderTasks() {
        const orders = this.data.DON_HANG || [];
        const returns = this.data.DOI_TRA || [];
        const tasks = [];
        const pendingOrders = orders.filter(o => ['Chờ xác nhận','Đã xác nhận','Đang chuẩn bị'].includes(o.Trang_Thai));
        if (pendingOrders.length) tasks.push({icon:'📋',text:`${pendingOrders.length} đơn hàng chờ xử lý`,urgent:true});
        const pendingReturns = returns.filter(r => ['Yêu cầu mới','Đang xác nhận'].includes(r.Trang_Thai));
        if (pendingReturns.length) tasks.push({icon:'🔄',text:`${pendingReturns.length} yêu cầu đổi trả`,urgent:true});
        return tasks.map(t => `<div class="task-item ${t.urgent?'urgent':''}"><span class="task-icon">${t.icon}</span><span class="task-text">${t.text}</span></div>`).join('') || '<div class="text-center text-muted">Không có công việc</div>';
    }

    renderNotifications() {
        return this.notifications.map(n => `<div class="notification-item"><span class="notification-icon">${n.icon}</span><div class="notification-content"><div class="notification-text">${n.message}</div><div class="notification-time">${n.time}</div></div></div>`).join('');
    }

    initCharts() {
        // Revenue Chart
        const revCtx = document.getElementById('revenueChart');
        if (revCtx && typeof Chart !== 'undefined') {
            const labels = [], data = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(Date.now() - i * 86400000);
                labels.push(d.toLocaleDateString('vi-VN', {day:'2-digit',month:'short'}));
                data.push(Math.floor(Math.random() * 500000 + 200000));
            }
            new Chart(revCtx, {type:'line',data:{labels,datasets:[{label:'Doanh thu',data,borderColor:'#e94560',backgroundColor:'rgba(233,69,96,0.1)',fill:true,tension:0.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>this.formatCurrency(v)}}}}});
        }
        // Orders Chart
        const ordCtx = document.getElementById('ordersChart');
        if (ordCtx && typeof Chart !== 'undefined') {
            const channels = this.data.KENH_BAN || [];
            const orders = this.data.DON_HANG || [];
            new Chart(ordCtx, {type:'doughnut',data:{labels:channels.map(c=>c.Ten_Kenh),datasets:[{data:channels.map(c=>orders.filter(o=>o.Kenh_ID===c.Kenh_ID).length),backgroundColor:['#e94560','#10b981','#f59e0b','#3b82f6']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
        }
    }

    renderDataTable() {
        const moduleKey = this.currentPage.toUpperCase().replace(/-/g,'_');
        const model = DATA_MODELS[moduleKey];
        if (!model) return '<div class="text-center p-4">Module not found</div>';
        const data = this.data[moduleKey] || [];
        let filteredData = data;
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filteredData = filteredData.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(q)));
        }
        return `
            <div class="page-header-bar">
                <div class="search-filter">
                    <div class="search-box">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="global-search" placeholder="Tìm kiếm..." value="${this.searchQuery}" oninput="app.handleSearch(this.value)">
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="app.exportData()">📤 Export</button>
                    <button class="btn btn-primary" onclick="app.openAddModal()">➕ Thêm mới</button>
                </div>
            </div>
            <div class="table-card">
                <table class="data-table">
                    <thead><tr>${model.columns.map(c=>`<th data-column="${c.key}" onclick="app.handleSort('${c.key}')">${c.label}</th>`).join('')}<th width="100">Thao tác</th></tr></thead>
                    <tbody>${this.renderRows(filteredData, model)}</tbody>
                </table>
            </div>
            <div class="pagination-bar">
                <div class="pagination-info">Hiển thị <strong>${filteredData.length}</strong> / <strong>${data.length}</strong> bản ghi</div>
            </div>
        `;
    }

    renderRows(data, model) {
        if (!data.length) return `<tr><td colspan="${model.columns.length + 1}" class="text-center text-muted p-4">Không có dữ liệu</td></tr>`;
        return data.map(item => `<tr>${model.columns.map(col => `<td>${this.renderCell(col, item)}</td>`).join('')}<td class="actions-cell"><button class="btn-icon" onclick="app.openEditModal('${item[model.columns[0].key]}')" title="Sửa">✏️</button><button class="btn-icon" onclick="app.deleteItem('${item[model.columns[0].key]}')" title="Xóa">🗑️</button></td></tr>`).join('');
    }

    renderCell(col, item) {
        let val = item[col.key];
        if (val === undefined || val === null || val === '') return '<span class="text-muted">—</span>';
        if (col.key === 'Trang_Thai' || col.key === 'Trang_Thai_Giao') return `<span class="badge badge-${this.getStatusClass(val)}">${val}</span>`;
        if (col.type === 'checkbox') return val ? '<span class="badge badge-success">✓</span>' : '<span class="badge badge-secondary">✗</span>';
        if (col.type === 'currency') return this.formatCurrency(val);
        if (col.key.includes('Ngay')) return this.formatDate(val);
        if (col.type === 'color' && val) return `<span class="color-swatch" style="background:${val}"></span>${val}`;
        if (col.key === 'Is_Active') return val ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-secondary">Inactive</span>';
        return String(val);
    }

    handleSearch(value) { this.searchQuery = value; this.render(); }
    handleSort(column) {
        if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        else { this.sortColumn = column; this.sortDirection = 'asc'; }
        this.render();
    }

    openAddModal() {
        const moduleKey = this.currentPage.toUpperCase().replace(/-/g,'_');
        const model = DATA_MODELS[moduleKey];
        if (!model) return;
        document.getElementById('modal-title').textContent = `Thêm mới ${model.name}`;
        document.getElementById('crud-form').dataset.editId = '';
        document.getElementById('crud-form').innerHTML = model.columns.map(col => {
            if (col.key.endsWith('_ID') && !col.required) return `<input type="hidden" name="${col.key}">`;
            return `<div class="form-group"><label class="form-label">${col.label}${col.required?'<span class="required">*</span>':''}</label>${this.renderFormField(col)}</div>`;
        }).join('');
        document.getElementById('crud-modal').classList.add('active');
    }

    openEditModal(id) {
        const moduleKey = this.currentPage.toUpperCase().replace(/-/g,'_');
        const model = DATA_MODELS[moduleKey];
        const item = (this.data[moduleKey] || []).find(i => i[model.columns[0].key] === id);
        if (!model || !item) return;
        document.getElementById('modal-title').textContent = `Sửa ${model.name}`;
        document.getElementById('crud-form').dataset.editId = id;
        document.getElementById('crud-form').innerHTML = model.columns.map(col => {
            const val = item[col.key] || '';
            return `<div class="form-group"><label class="form-label">${col.label}${col.required&&!col.key.endsWith('_ID')?'<span class="required">*</span>':''}</label>${this.renderFormField(col, val)}</div>`;
        }).join('');
        document.getElementById('crud-modal').classList.add('active');
    }

    renderFormField(col, value = '') {
        if (col.type === 'select' && col.options) {
            return `<select name="${col.key}" class="form-control" ${col.required?'required':''}><option value="">-- Chọn --</option>${col.options.map(o=>`<option value="${o}" ${value===o?'selected':''}>${o}</option>`).join('')}</select>`;
        }
        if (col.type === 'textarea') return `<textarea name="${col.key}" class="form-control" rows="3" ${col.required?'required':''}>${value}</textarea>`;
        if (col.type === 'checkbox') return `<input type="checkbox" name="${col.key}" value="true" ${value?'checked':''} class="checkbox-input">`;
        return `<input type="${col.type || 'text'}" name="${col.key}" value="${value}" class="form-control" ${col.required?'required':''}>`;
    }

    closeModal() { document.getElementById('crud-modal').classList.remove('active'); }

    saveItem() {
        const form = document.getElementById('crud-form');
        const moduleKey = this.currentPage.toUpperCase().replace(/-/g,'_');
        const model = DATA_MODELS[moduleKey];
        const editId = form.dataset.editId;
        const formData = new FormData(form);
        const item = {};
        model.columns.forEach(col => {
            if (col.type === 'checkbox') item[col.key] = form.querySelector(`[name="${col.key}"]`)?.checked || false;
            else item[col.key] = formData.get(col.key) || '';
        });
        if (editId) {
            const idx = this.data[moduleKey].findIndex(i => i[model.columns[0].key] === editId);
            if (idx !== -1) this.data[moduleKey][idx] = item;
            this.showToast('success', 'Thành công', 'Cập nhật thành công!');
        } else {
            if (!this.data[moduleKey]) this.data[moduleKey] = [];
            this.data[moduleKey].push(item);
            this.showToast('success', 'Thành công', 'Thêm mới thành công!');
        }
        this.saveData();
        this.closeModal();
        this.render();
    }

    deleteItem(id) {
        if (!confirm('Bạn có chắc muốn xóa bản ghi này?')) return;
        const moduleKey = this.currentPage.toUpperCase().replace(/-/g,'_');
        const model = DATA_MODELS[moduleKey];
        const idx = this.data[moduleKey].findIndex(i => i[model.columns[0].key] === id);
        if (idx !== -1) {
            this.data[moduleKey].splice(idx, 1);
            this.saveData();
            this.showToast('success', 'Thành công', 'Xóa thành công!');
            this.render();
        }
    }

    exportData() {
        const moduleKey = this.currentPage.toUpperCase().replace(/-/g,'_');
        const data = this.data[moduleKey] || [];
        const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${moduleKey}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('success', 'Thành công', 'Đã xuất dữ liệu!');
    }
    
    exportAllData() {
        const allData = {modules: Object.keys(this.data), exportDate: new Date().toISOString(), data: this.data};
        const blob = new Blob([JSON.stringify(allData, null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `POLOMIMIN_ERP_All_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('success', 'Thành công', 'Đã xuất toàn bộ dữ liệu!');
    }
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    const moduleKey = this.currentPage.toUpperCase().replace(/-/g,'_');
                    this.data[moduleKey] = [...this.data[moduleKey] || [], ...imported];
                    this.saveData();
                    this.showToast('success', 'Thành công', `Đã nhập ${imported.length} bản ghi!`);
                    this.render();
                } else if (imported.data && imported.modules) {
                    this.data = {...this.data, ...imported.data};
                    this.saveData();
                    this.showToast('success', 'Thành công', 'Đã nhập toàn bộ dữ liệu!');
                    this.renderSidebar();
                    this.render();
                }
            } catch (err) {
                this.showToast('error', 'Lỗi', 'File không hợp lệ!');
            }
        };
        reader.readAsText(file);
    }
    
    resetData() {
        if (confirm('Bạn có chắc muốn reset dữ liệu về mặc định?')) {
            this.data = JSON.parse(JSON.stringify(SAMPLE_DATA));
            this.saveData();
            this.showToast('success', 'Thành công', 'Đã reset dữ liệu!');
            this.render();
        }
    }

    showNotifications() { this.showToast('info', 'Thông báo', `${this.notifications.length} thông báo mới`); }
    showHelp() { this.showToast('info', 'Trợ giúp', 'Liên hệ: 0774 480 916 - POLOMIMIN'); }

    showToast(type, title, message) {
        const container = document.getElementById('toast-container');
        const icons = {success:'✓',error:'✕',warning:'⚠',info:'ℹ'};
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div>`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'slideIn 0.3s ease reverse'; setTimeout(() => toast.remove(), 300); }, 3000);
    }

    formatCurrency(v) { if (!v && v !== 0) return '—'; return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',minimumFractionDigits:0}).format(v); }
    formatDate(v) { if (!v) return '—'; return new Date(v).toLocaleDateString('vi-VN'); }
    getStatusClass(s) {
        const map = {'Active':'success','Inactive':'secondary','Hoàn thành':'success','Done':'success','Đã giao':'success','Đang giao':'info','Đang chuẩn bị':'warning','Chờ xác nhận':'warning','Pending':'warning','In Progress':'info','Đang xử lý':'info','Yêu cầu mới':'primary','Đã hủy':'danger','Cancelled':'danger','Failed':'danger'};
        return map[s] || 'info';
    }
}

// Initialize app
const app = new ERPApp();
