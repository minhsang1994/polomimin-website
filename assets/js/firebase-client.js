/* ==========================================================================
   MIMIN Platform — Firebase Binding Framework (Stage 6)
   Generic Firestore/Auth client cho 199 trang prototype HTML (pages/*.html).

   CHỈ LÀ FRAMEWORK — chưa gắn vào trang nào (không có pages/*.html nào include
   file này), chưa có Business Logic/Workflow/Automation. Khi Firebase project
   thật được tạo (hiện .env Next.js còn trống — xem CLAUDE.md mục 9), file này
   sẵn sàng dùng ngay mà không cần build step/bundler, dùng Firebase JS SDK bản
   "compat" qua CDN — cùng phong cách <script src="..."> như main.js/MiminShell.

   Cách dùng (trong 1 trang, SAU KHI include 3 script CDN sau, THEO ĐÚNG thứ tự):
     <script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"></script>
     <script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-auth-compat.js"></script>
     <script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore-compat.js"></script>
     <script src="../assets/js/firebase-client.js"></script>

     MiminFirebase.init({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId });

     const orders = await MiminFirebase.list('orders', { organizationId, workspaceId: 'business' });
     const one    = await MiminFirebase.get('orders', orderId);
     const newId  = await MiminFirebase.create('orders', { organizationId, workspaceId: 'business', createdBy: uid, ... });
     await MiminFirebase.update('orders', orderId, { status: 'approved' });
     await MiminFirebase.softDelete('orders', orderId, uid);
     MiminFirebase.onAuthChange((user) => { ... });

   Tên collection hợp lệ: xem docs/COLLECTIONS.md (92 collection, 11 domain) và
   packages/database/src/firestore/collection-names.ts (bản TypeScript tương đương
   dùng cho apps/dashboard, apps/admin — 2 bên cùng 1 nguồn thiết kế, khác ngôn ngữ).

   Quy ước field tự động điền khi create()/update()/softDelete(): xem
   docs/FIELD_STANDARD.md mục 3 (organizationId/workspaceId bắt buộc — người gọi
   tự truyền, file này KHÔNG suy đoán hộ; createdAt/updatedAt/isDeleted tự động).
   ========================================================================== */

const MiminFirebase = (function () {
    'use strict';

    let app = null;
    let db = null;
    let auth = null;

    /** Danh sách collection dùng chung toàn nền tảng — không lọc organizationId/workspaceId
     *  (khớp PLATFORM_WIDE_COLLECTIONS ở packages/database/src/firestore/collection-names.ts). */
    const PLATFORM_WIDE_COLLECTIONS = [
        'permissions', 'models', 'menus', 'pages', 'components',
        'themes', 'languages', 'countries', 'currencies',
    ];

    /** Collection dùng chung trong 1 Organization, không lọc workspaceId (chỉ organizationId). */
    const ORG_WIDE_COLLECTIONS = ['roles'];

    function ensureInitialized() {
        if (!app) {
            throw new Error('MiminFirebase.init(config) chưa được gọi.');
        }
    }

    // ====== INIT ======
    function init(config) {
        if (typeof firebase === 'undefined') {
            throw new Error(
                'Chưa include Firebase SDK (compat) qua CDN trước firebase-client.js — xem banner comment đầu file.',
            );
        }
        app = firebase.apps && firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(config);
        db = firebase.firestore();
        auth = firebase.auth();
        return { app, db, auth };
    }

    // ====== AUTH ======
    function onAuthChange(callback) {
        ensureInitialized();
        return auth.onAuthStateChanged(callback);
    }

    function signInWithEmail(email, password) {
        ensureInitialized();
        return auth.signInWithEmailAndPassword(email, password);
    }

    function signOut() {
        ensureInitialized();
        return auth.signOut();
    }

    // ====== FIRESTORE — GENERIC CRUD (không Business Logic, chỉ build query/document) ======

    function buildScopedQuery(collectionName, scope, extra) {
        let ref = db.collection(collectionName);

        if (PLATFORM_WIDE_COLLECTIONS.indexOf(collectionName) === -1) {
            ref = ref.where('organizationId', '==', scope.organizationId);
            if (ORG_WIDE_COLLECTIONS.indexOf(collectionName) === -1 && scope.workspaceId) {
                ref = ref.where('workspaceId', '==', scope.workspaceId);
            }
            if (scope.branchId) {
                ref = ref.where('branchId', '==', scope.branchId);
            }
        }

        return typeof extra === 'function' ? extra(ref) : ref;
    }

    /** Liệt kê document theo phạm vi tenant (organizationId bắt buộc, trừ catalog nền tảng). */
    async function list(collectionName, scope, extraQueryFn) {
        ensureInitialized();
        const snapshot = await buildScopedQuery(collectionName, scope || {}, extraQueryFn).get();
        return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    }

    /** Đọc 1 document theo id, trả null nếu không tồn tại. */
    async function get(collectionName, docId) {
        ensureInitialized();
        const docSnap = await db.collection(collectionName).doc(docId).get();
        return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
    }

    /** Tạo document mới — tự điền createdAt/updatedAt/isDeleted, KHÔNG tự đoán organizationId/workspaceId. */
    async function create(collectionName, data) {
        ensureInitialized();
        const now = Date.now();
        const docRef = await db.collection(collectionName).add({
            ...data,
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
        });
        return docRef.id;
    }

    /** Cập nhật document — tự set lại updatedAt. */
    async function update(collectionName, docId, patch) {
        ensureInitialized();
        await db.collection(collectionName).doc(docId).update({
            ...patch,
            updatedAt: Date.now(),
        });
    }

    /** Soft-delete — không xoá cứng, giữ vết cho activity_logs/báo cáo lịch sử (FIELD_STANDARD.md mục 3). */
    async function softDelete(collectionName, docId, deletedBy) {
        ensureInitialized();
        await db.collection(collectionName).doc(docId).update({
            isDeleted: true,
            deletedAt: Date.now(),
            deletedBy: deletedBy,
            updatedAt: Date.now(),
        });
    }

    return {
        init,
        onAuthChange,
        signInWithEmail,
        signOut,
        list,
        get,
        create,
        update,
        softDelete,
    };
})();
