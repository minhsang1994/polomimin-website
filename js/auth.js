/**
 * POLOMIMIN - Auth System
 * Đăng nhập / Đăng ký với Firebase + LocalStorage backup
 */

// ========== CONFIG ==========
const AUTH_CONFIG = {
    // Firebase config (anh sẽ tạo project và paste vào đây)
    firebase: {
        apiKey: "YOUR_API_KEY",
        authDomain: "polomimin.firebaseapp.com",
        projectId: "polomimin",
        storageBucket: "polomimin.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    // LocalStorage keys
    storage: {
        users: 'polomimin_users',
        session: 'polomimin_session'
    }
};

// ========== UTILS ==========
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;
    setTimeout(() => {
        alertBox.className = 'alert';
        alertBox.textContent = '';
    }, 5000);
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function hashPassword(password) {
    // Simple hash (nên dùng bcrypt/Firebase Auth trong production)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'plm_' + Math.abs(hash).toString(36) + '_' + btoa(password).slice(0, 10);
}

function generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

function getUsers() {
    const data = localStorage.getItem(AUTH_CONFIG.storage.users);
    return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
    localStorage.setItem(AUTH_CONFIG.storage.users, JSON.stringify(users));
}

function saveSession(user) {
    const session = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loginAt: new Date().toISOString(),
        // Token giả (production dùng Firebase Auth)
        token: 'plm_token_' + Date.now()
    };
    localStorage.setItem(AUTH_CONFIG.storage.session, JSON.stringify(session));
    return session;
}

function getCurrentSession() {
    const data = localStorage.getItem(AUTH_CONFIG.storage.session);
    return data ? JSON.parse(data) : null;
}

function isLoggedIn() {
    return getCurrentSession() !== null;
}

function logout() {
    localStorage.removeItem(AUTH_CONFIG.storage.session);
    window.location.href = 'auth.html';
}

// ========== VALIDATION ==========
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^(0|\+84)[0-9]{9,10}$/.test(phone.replace(/\s/g, ''));
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// ========== REGISTER ==========
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const subscribeEmail = document.getElementById('subscribeEmail').checked;

    // Validate
    if (!name) { showAlert('Vui lòng nhập họ tên', 'error'); return; }
    if (!validateEmail(email)) { showAlert('Email không hợp lệ', 'error'); return; }
    if (!validatePhone(phone)) { showAlert('Số điện thoại không hợp lệ (VD: 0774480916)', 'error'); return; }
    if (!validatePassword(password)) { showAlert('Mật khẩu phải có ít nhất 6 ký tự', 'error'); return; }
    if (password !== confirmPassword) { showAlert('Mật khẩu xác nhận không khớp', 'error'); return; }
    if (!agreeTerms) { showAlert('Vui lòng đồng ý với điều khoản', 'error'); return; }

    // Check existing
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        showAlert('Email đã được đăng ký', 'error');
        return;
    }
    if (users.find(u => u.phone === phone)) {
        showAlert('Số điện thoại đã được đăng ký', 'error');
        return;
    }

    // Create user
    const newUser = {
        id: generateId(),
        name,
        email,
        phone,
        password: hashPassword(password),
        subscribeEmail,
        role: 'customer',
        createdAt: new Date().toISOString(),
        // Metadata cho quảng cáo sau
        source: 'website',
        tags: ['new-customer']
    };

    users.push(newUser);
    saveUsers(users);
    saveSession(newUser);

    // Sync to Firebase (background, non-blocking)
    syncUserToFirebase(newUser);

    showAlert('Đăng ký thành công! Đang chuyển hướng...', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ========== LOGIN ==========
function handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;

    if (!identifier || !password) {
        showAlert('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }

    const users = getUsers();
    const user = users.find(u => 
        (u.email === identifier.toLowerCase() || u.phone === identifier)
    );

    if (!user) {
        showAlert('Tài khoản không tồn tại', 'error');
        return;
    }

    if (user.password !== hashPassword(password)) {
        showAlert('Mật khẩu không đúng', 'error');
        return;
    }

    saveSession(user);
    if (remember) {
        localStorage.setItem('polomimin_remember', identifier);
    }

    showAlert('Đăng nhập thành công!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ========== SOCIAL LOGIN ==========
function loginWithGoogle() {
    showAlert('Tính năng đang phát triển. Anh cần tạo Google OAuth Client ID.', 'error');
    // Production: dùng Firebase Auth
    // const provider = new firebase.auth.GoogleAuthProvider();
    // firebase.auth().signInWithPopup(provider)...
}

function loginWithZalo() {
    showAlert('Tính năng đang phát triển. Cần đăng ký Zalo OA trước.', 'error');
    // Production: dùng Zalo SDK
    // Zalo.login()...
}

function showForgotPassword() {
    const email = prompt('Nhập email đã đăng ký để nhận link reset mật khẩu:');
    if (email && validateEmail(email)) {
        showAlert(`Email reset đã được gửi tới ${email} (demo)`, 'success');
    } else if (email) {
        showAlert('Email không hợp lệ', 'error');
    }
}

// ========== FIREBASE SYNC (background) ==========
function syncUserToFirebase(user) {
    // TODO: Khi anh tạo Firebase project, paste config vào AUTH_CONFIG.firebase
    // rồi bật code bên dưới. Hiện tại chỉ lưu local.
    
    /*
    try {
        if (!firebase.apps.length) firebase.initializeApp(AUTH_CONFIG.firebase);
        const db = firebase.firestore();
        db.collection('users').doc(user.id).set({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            source: user.source,
            tags: user.tags
        }).catch(err => console.warn('Firebase sync failed:', err));
    } catch (e) {
        console.warn('Firebase not configured yet');
    }
    */
    console.log('User created locally. Will sync to Firebase when configured:', user.email);
}

// ========== TAB SWITCHING ==========
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (isLoggedIn() && window.location.pathname.includes('auth.html')) {
        const continueLogin = confirm('Bạn đã đăng nhập. Vào trang chủ?');
        if (continueLogin) window.location.href = 'index.html';
    }

    // Auto-fill remember
    const remembered = localStorage.getItem('polomimin_remember');
    if (remembered) {
        document.getElementById('loginEmail').value = remembered;
        document.getElementById('rememberMe').checked = true;
    }

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.form-section').forEach(f => f.classList.remove('active'));
            document.getElementById(target + 'Form').classList.add('active');
            document.getElementById('alertBox').className = 'alert';
        });
    });

    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});
