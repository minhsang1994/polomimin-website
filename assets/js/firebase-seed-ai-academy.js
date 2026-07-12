/**
 * POLOMIMIN — Antigravity Seed Data
 * Collections: ai/predictions, ai/models, academy/khoa_hoc, academy/sop
 *
 * Cách dùng:
 *   1. Mở Firebase project, chạy từ browser console sau khi include file này
 *   2. Gọi: PoloSeed.run()
 *
 * Include AFTER firebase-client.js:
 *   <script src="assets/js/firebase-client.js"></script>
 *   <script src="assets/js/firebase-seed-ai-academy.js"></script>
 */
(function() {
    'use strict';

    const AI_PREDICTIONS = [
        { id: 'FC-0042', type: 'revenue_7d',      label: 'Du bao doanh thu 7 ngay',   value: 485000000,    unit: 'VND', accuracy: 0.942, confidence: 'high',   period_days: 7,  alert: false, model_id: 'revsys-v3',    status: 'completed' },
        { id: 'FC-0041', type: 'sku_trend',        label: 'Polo Basic Navy tang manh', value: null,         unit: null,  accuracy: 0.940, confidence: 'high',   sku_ref: 'POLO-BASIC-NAVY', change_pct: 0.28, alert: true, alert_msg: 'Ton kho het trong 8 ngay', model_id: 'sku-trend-v2', status: 'alert' },
        { id: 'FC-0040', type: 'revenue_30d',      label: 'Du bao 30 ngay Q3/2026',   value: 2100000000,   unit: 'VND', accuracy: 0.780, confidence: 'medium', period_days: 30, alert: false, model_id: 'revsys-v3',    status: 'completed' },
        { id: 'FC-0039', type: 'inventory_risk',   label: 'Ao Thun Cotton het hang',   value: null,         unit: null,  accuracy: 0.910, confidence: 'high',   sku_ref: 'THUN-COTTON-WHITE', alert: true, alert_msg: 'Het hang trong 5 ngay', model_id: 'inv-risk-v1', status: 'alert' },
        { id: 'REC-248', type: 'recommendation',   label: 'Upsell So Mi Linen',        value: 210000000,    unit: 'VND', accuracy: 0.870, confidence: 'high',   target_customer: 'chain-sao-mai',   sku_ref: 'SOMI-LINEN-BLUE',  applied: true, model_id: 'recsys-v3', status: 'applied' },
        { id: 'REC-247', type: 'recommendation',   label: 'Tai dat Polo Basic',        value: 45000000,     unit: 'VND', accuracy: 0.930, confidence: 'high',   target_customer: 'agent-thanh-phat', sku_ref: 'POLO-BASIC-NAVY', applied: true, model_id: 'recsys-v3', status: 'applied' },
    ];

    const AI_MODELS = [
        { id: 'revsys-v3',    name: 'Revenue Forecast v3',           type: 'forecasting',     accuracy: 0.942, version: '3.0.2', status: 'online', train_samples: 12500, avg_response_ms: 2400, daily_calls: 4    },
        { id: 'recsys-v3',    name: 'Product Recommendation v3',     type: 'recommendation',  accuracy: 0.870, version: '3.1.0', status: 'online', train_samples: 8200,  avg_response_ms: 800,  daily_calls: 1248 },
        { id: 'sku-trend-v2', name: 'SKU Trend Detector v2',         type: 'trend_detection', accuracy: 0.910, version: '2.3.1', status: 'online', train_samples: 45000, avg_response_ms: 1200, daily_calls: 96   },
        { id: 'inv-risk-v1',  name: 'Inventory Risk v1',             type: 'risk_detection',  accuracy: 0.890, version: '1.4.0', status: 'online', train_samples: 22000, avg_response_ms: 900,  daily_calls: 24   },
        { id: 'churn-v1',     name: 'Customer Churn Predictor v1',   type: 'churn_prediction',accuracy: 0.830, version: '1.2.0', status: 'busy',   train_samples: 5800,  avg_response_ms: 3200, daily_calls: 2    },
        { id: 'img-gen-v1',   name: 'AI Image Generator v1',         type: 'generative',      accuracy: null,  version: '1.0.0', status: 'online', train_samples: null,  avg_response_ms: 8000, daily_calls: 20   },
    ];

    const ACADEMY_COURSES = [
        { id: 'AC-S-001',   category: 'Sales',       title: 'Ky nang ban hang dai ly cao cap',         lessons: 12, duration_h: 8,   students: 124, rating: 4.9, badge: 'popular',     required: false, instructor: 'Ho Minh Sang',    status: 'active' },
        { id: 'AC-AI-001',  category: 'AI',          title: 'Lam chu AI trong quan ly doanh nghiep',   lessons: 18, duration_h: 12,  students: 38,  rating: 4.8, badge: 'new',          required: false, instructor: 'Nguyen Trong Nghia', status: 'active' },
        { id: 'AC-OP-001',  category: 'Van hanh',    title: 'Nam vung SOP van hanh POLOMIMIN',         lessons: 8,  duration_h: 6,   students: 89,  rating: 4.7, badge: 'required',     required: true,  instructor: 'Phong Van hanh',  status: 'active' },
        { id: 'AC-MK-001',  category: 'Marketing',   title: 'Digital Marketing cho thoi trang',        lessons: 14, duration_h: 10,  students: 56,  rating: 4.8, badge: 'popular',     required: false, instructor: 'Le Thi Phuong',   status: 'active' },
        { id: 'AC-MFG-001', category: 'San xuat',    title: 'Hieu quy trinh san xuat det may',         lessons: 10, duration_h: 7,   students: 45,  rating: 4.6, badge: 'recommended', required: false, instructor: 'Phong San xuat',  status: 'active' },
        { id: 'AC-FIN-001', category: 'Tai chinh',   title: 'Quan ly dong tien va cong no',            lessons: 9,  duration_h: 6.5, students: 62,  rating: 4.7, badge: 'popular',     required: false, instructor: 'Phong Ke toan',   status: 'active' },
    ];

    const ACADEMY_SOP = [
        { id: 'SOP-S-001', code: 'SOP-S-001', category: 'Sales',    title: 'Tiep nhan & xu ly don hang dai ly',   owner: 'Phong Sales',   version: 'v2.3', required: true,  status: 'active',       view_count: 234, steps: ['Tiep nhan YC','Kiem tra ton kho','Tao don hang','Xac nhan gia','Chuyen kho xuat','Gui xac nhan KH'] },
        { id: 'SOP-S-002', code: 'SOP-S-002', category: 'Sales',    title: 'Onboard dai ly moi',                  owner: 'Phong Sales',   version: 'v1.5', required: true,  status: 'active',       view_count: 178, steps: ['Ho so phap ly','Ky hop dong','Cap tai khoan','Training','Thiet lap han muc','Follow-up 3 thang'] },
        { id: 'SOP-W-001', code: 'SOP-W-001', category: 'Kho',      title: 'Nhap kho thanh pham tu xuong',        owner: 'Phong Kho',     version: 'v3.0', required: true,  status: 'active',       view_count: 312, steps: ['Nhan phieu xuat xuong','Kiem dem SL','Kiem tra QC','Gan ma QR','Sap xep vi tri','Cap nhat WMS'] },
        { id: 'SOP-HR-001',code: 'SOP-HR-001',category: 'Nhan su',  title: 'Onboard nhan vien moi',               owner: 'Phong HR',      version: 'v2.1', required: true,  status: 'active',       view_count: 145, steps: ['Thu tuc hanh chinh','Cap thiet bi','Gioi thieu team','Dao tao SOP','Giao viec thuc te','Danh gia thu viec'] },
        { id: 'SOP-F-001', code: 'SOP-F-001', category: 'Tai chinh',title: 'Phe duyet chi phi phat sinh',         owner: 'Phong Ke toan', version: 'v1.8', required: false, status: 'needs_update', view_count: 89,  steps: ['Dien form de xuat','Giai trinh ly do','Phe duyet cap 1','Phe duyet cap 2','Cap ngan sach','Bao cao quyet toan'] },
        { id: 'SOP-P-001', code: 'SOP-P-001', category: 'San xuat', title: 'Mo lenh san xuat tu don hang',        owner: 'Phong San xuat',version: 'v2.0', required: true,  status: 'active',       view_count: 267, steps: ['Tong hop don','Kiem tra NL','Tao lenh SX','Phan cong chuyen','Theo doi tien do','Nghiem thu QC'] },
    ];

    window.PoloSeed = {
        data: { AI_PREDICTIONS, AI_MODELS, ACADEMY_COURSES, ACADEMY_SOP },

        /**
         * Seed tất cả Firestore collections của Antigravity
         * Cần Firebase đã init: firebase.initializeApp({...})
         */
        run: async function() {
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase SDK chua load. Include firebase-app-compat.js + firebase-firestore-compat.js truoc.');
                return;
            }
            const db = firebase.firestore();
            const ts = firebase.firestore.FieldValue.serverTimestamp;
            const batch = db.batch();

            AI_PREDICTIONS.forEach(d => {
                const ref = db.collection('ai').doc('predictions').collection('items').doc(d.id);
                batch.set(ref, { ...d, _seeded_at: ts(), _seeded_by: 'antigravity' });
            });

            AI_MODELS.forEach(d => {
                const ref = db.collection('ai').doc('models').collection('items').doc(d.id);
                batch.set(ref, { ...d, _seeded_at: ts(), _seeded_by: 'antigravity' });
            });

            ACADEMY_COURSES.forEach(d => {
                const ref = db.collection('academy').doc('khoa_hoc').collection('items').doc(d.id);
                batch.set(ref, { ...d, _seeded_at: ts(), _seeded_by: 'antigravity' });
            });

            ACADEMY_SOP.forEach(d => {
                const ref = db.collection('academy').doc('sop').collection('items').doc(d.id);
                batch.set(ref, { ...d, _seeded_at: ts(), _seeded_by: 'antigravity' });
            });

            await batch.commit();

            const total = AI_PREDICTIONS.length + AI_MODELS.length + ACADEMY_COURSES.length + ACADEMY_SOP.length;
            console.log(`✅ Antigravity seed xong ${total} docs:`);
            console.log(`   ai/predictions: ${AI_PREDICTIONS.length} docs`);
            console.log(`   ai/models:      ${AI_MODELS.length} docs`);
            console.log(`   academy/khoa_hoc: ${ACADEMY_COURSES.length} docs`);
            console.log(`   academy/sop:    ${ACADEMY_SOP.length} docs`);
        },

        /** Đọc toàn bộ 1 sub-collection */
        getCollection: async function(module, subcol) {
            if (typeof firebase === 'undefined') return [];
            const db = firebase.firestore();
            const snap = await db.collection(module).doc(subcol).collection('items').get();
            return snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
        }
    };

    console.log('🌱 PoloSeed loaded. Goi PoloSeed.run() de seed Firestore.');
    console.log('   Collections: ai/predictions, ai/models, academy/khoa_hoc, academy/sop');

})();
