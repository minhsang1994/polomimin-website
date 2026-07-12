/**
 * Firebase Admin SDK Initialization
 * Pattern shared by anh Sang: dùng serviceAccountKey.json + cert()
 *
 * Setup:
 * 1. Download serviceAccountKey.json từ Firebase Console:
 *    https://console.firebase.google.com/project/polomimin/settings/serviceaccounts/adminsdk
 * 2. Đặt file vào D:\polomimin\polomimin-erp\serviceAccountKey.json
 * 3. Chạy: node firebase-admin-init.js
 *
 * Lưu ý: File JSON chứa private key, KHÔNG commit lên GitHub
 */

const { initializeApp, cert } = require('firebase-admin/app');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

console.log('✅ Firebase Admin SDK initialized for project:', serviceAccount.project_id);
console.log('   Service account:', serviceAccount.client_email);
console.log('');
console.log('📋 Sử dụng:');
console.log('   const admin = require("firebase-admin");');
console.log('   const db = admin.firestore();');
console.log('   const auth = admin.auth();');
