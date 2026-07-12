/* ==========================================================================
   POLOMIMIN — firebase-client.js
   Shared Firebase initialization + Firestore helper functions.
   Include this BEFORE main.js and business-layout.js in pages that need
   real-time data from Firestore.

   Usage:
     MiminFirebase.getCollection('mes/lenh_sx/orders', { orderBy: 'createdAt', limit: 20 })
       .then(docs => { /* use docs */ });
     MiminFirebase.onCollection('mes/lenh_sx/orders', docs => render(docs));
   ========================================================================== */

const _MIMIN_CONFIG = {
    apiKey:            "AIzaSyB8cIURDcIsDHjqibi7Irql7HECCmXm4j8",
    authDomain:        "polomimin.firebaseapp.com",
    projectId:         "polomimin",
    storageBucket:     "polomimin.appspot.com",
    messagingSenderId: "1046397136632",
    appId:             "1:1046397136632:web:d3e4b9c2a7f8e1d0"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(_MIMIN_CONFIG);
}

const MiminFirebase = (function () {
    'use strict';

    const db   = () => firebase.firestore();

    // ── Auth ─────────────────────────────────────────────────────────────────
    function getCurrentUser() {
        try { return JSON.parse(localStorage.getItem('mimin-user') || 'null'); }
        catch { return null; }
    }

    function requireAuth() {
        const user = getCurrentUser();
        if (!user) window.location.replace('login.html?redirect=' + encodeURIComponent(window.location.pathname));
        return user;
    }

    // ── Firestore ─────────────────────────────────────────────────────────────
    async function getCollection(collPath, opts = {}) {
        try {
            let ref = db().collection(collPath);
            if (opts.where) for (const [f, op, v] of opts.where) ref = ref.where(f, op, v);
            if (opts.orderBy) ref = ref.orderBy(opts.orderBy, opts.direction || 'desc');
            if (opts.limit)   ref = ref.limit(opts.limit);
            const snap = await ref.get();
            return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) { console.warn('[MiminFirebase] getCollection:', collPath, err.message); return []; }
    }

    async function getDoc(docPath) {
        try {
            const snap = await db().doc(docPath).get();
            return snap.exists ? { id: snap.id, ...snap.data() } : null;
        } catch (err) { console.warn('[MiminFirebase] getDoc:', docPath, err.message); return null; }
    }

    function onCollection(collPath, callback, opts = {}) {
        try {
            let ref = db().collection(collPath);
            if (opts.where) for (const [f, op, v] of opts.where) ref = ref.where(f, op, v);
            if (opts.orderBy) ref = ref.orderBy(opts.orderBy, opts.direction || 'desc');
            if (opts.limit)   ref = ref.limit(opts.limit);
            return ref.onSnapshot(
                snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
                err  => console.warn('[MiminFirebase] onCollection:', collPath, err.message)
            );
        } catch (err) { console.warn('[MiminFirebase] onCollection setup:', collPath, err.message); return () => {}; }
    }

    async function setDoc(docPath, data, merge = true) {
        try {
            await db().doc(docPath).set({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge });
            return true;
        } catch (err) { console.error('[MiminFirebase] setDoc:', err.message); return false; }
    }

    async function addDoc(collPath, data) {
        try {
            const ref = await db().collection(collPath).add({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            return ref.id;
        } catch (err) { console.error('[MiminFirebase] addDoc:', err.message); return null; }
    }

    // ── Format helpers ────────────────────────────────────────────────────────
    const fmt = {
        number:   n  => Number(n || 0).toLocaleString('vi-VN'),
        time:     ts => { if (!ts) return '—'; const d = ts.toDate ? ts.toDate() : new Date(ts); return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }); },
        relative: ts => {
            if (!ts) return '—';
            const d = ts.toDate ? ts.toDate() : new Date(ts);
            const m = Math.floor((Date.now() - d.getTime()) / 60000);
            if (m < 1) return 'Vừa xong';
            if (m < 60) return `${m} phút trước`;
            const h = Math.floor(m / 60);
            if (h < 24) return `${h} giờ trước`;
            return `${Math.floor(h / 24)} ngày trước`;
        }
    };

    return { getCurrentUser, requireAuth, getCollection, getDoc, onCollection, setDoc, addDoc, fmt };
})();
