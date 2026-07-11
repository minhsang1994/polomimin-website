/**
 * POLOMIMIN Main JavaScript
 * Shell: navigation, notifications, toasts
 */

window.MiminShell = (function () {
    'use strict';

    let currentUser = null;
    let navItems = [];
    let notifications = [];
    let aiFloatMessage = '';

    function init({ user, navItems: nav, notifications: notifs, aiFloatMessage: aimsg, onNavClick }) {
        currentUser = user || { name: 'POLOMIMIN User', initials: 'PU', role: 'Member' };
        navItems = nav || [];
        notifications = notifs || [];
        aiFloatMessage = aimsg || '';

        renderUser();
        renderNav();
        renderNotifications();
        bindEvents();
        if (onNavClick) _onNavClick = onNavClick;
    }

    let _onNavClick = null;

    function renderUser() {
        const avatarEls = document.querySelectorAll('#sidebarAvatar, #headerAvatar, #drawerAvatar');
        avatarEls.forEach(el => { if (el) el.textContent = currentUser.initials; });
        const nameEl = document.getElementById('sidebarUserName');
        if (nameEl) nameEl.textContent = currentUser.name;
        const roleEl = document.getElementById('sidebarUserRole');
        if (roleEl) roleEl.textContent = currentUser.role;
        const drawerName = document.getElementById('drawerName');
        if (drawerName) drawerName.textContent = currentUser.name;
        const drawerRole = document.getElementById('drawerRole');
        if (drawerRole) drawerRole.textContent = currentUser.role + ' · POLOMIMIN';
        const drawerCompany = document.getElementById('drawerCompany');
        if (drawerCompany) drawerCompany.textContent = currentUser.company || 'POLOMIMIN JSC';
        const drawerPlan = document.getElementById('drawerPlan');
        if (drawerPlan) drawerPlan.textContent = currentUser.plan || 'Enterprise';
    }

    function renderNav() {
        const navEl = document.getElementById('navMenu');
        if (!navEl) return;
        navEl.innerHTML = navItems.map((item, i) => `
            <li>
                <a href="${item.href || '#'}" class="${item.active ? 'active' : ''}" data-idx="${i}">
                    <span style="font-size: 18px;">${item.icon}</span>
                    <span>${item.label}</span>
                    ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                </a>
            </li>
        `).join('');

        navEl.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', (e) => {
                if (a.getAttribute('href') === '#' || !a.getAttribute('href')) {
                    e.preventDefault();
                }
                const idx = parseInt(a.dataset.idx);
                const item = navItems[idx];
                navEl.querySelectorAll('a').forEach(x => x.classList.remove('active'));
                a.classList.add('active');
                if (_onNavClick) _onNavClick(item, a);
            });
        });
    }

    function renderNotifications() {
        const listEl = document.getElementById('notifList');
        if (!listEl) return;
        listEl.innerHTML = notifications.map(n => `
            <div class="notif-item">
                <span class="notif-icon">${n.icon}</span>
                <div class="notif-content">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-time">${n.time}</div>
                </div>
            </div>
        `).join('');
    }

    function bindEvents() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                localStorage.removeItem('polomimin_session');
                window.location.href = '03_login.html';
            }
        });

        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) menuToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.toggle('open');
        });

        const notifBtn = document.getElementById('notifBtn');
        const notifPopover = document.getElementById('notifPopover');
        if (notifBtn && notifPopover) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notifPopover.classList.toggle('open');
            });
            document.addEventListener('click', (e) => {
                if (!notifPopover.contains(e.target) && e.target !== notifBtn) {
                    notifPopover.classList.remove('open');
                }
            });
        }

        const headerAvatar = document.getElementById('headerAvatar');
        const drawerOverlay = document.getElementById('drawerOverlay');
        const drawerClose = document.getElementById('drawerClose');
        if (headerAvatar && drawerOverlay) {
            headerAvatar.addEventListener('click', () => drawerOverlay.classList.add('open'));
        }
        if (drawerClose && drawerOverlay) {
            drawerClose.addEventListener('click', () => drawerOverlay.classList.remove('open'));
            drawerOverlay.addEventListener('click', (e) => {
                if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
            });
        }

        const manageBtn = document.getElementById('manageAccountBtn');
        if (manageBtn) manageBtn.addEventListener('click', () => {
            showToast('Trang quản lý tài khoản (demo)', 'info', '⚙️');
        });

        const aiFloat = document.getElementById('aiFloatBtn');
        if (aiFloat) {
            aiFloat.addEventListener('click', () => {
                showToast(aiFloatMessage || 'AI đang phân tích...', 'info', '🧠');
            });
        }
    }

    function showToast(message, type = 'info', icon = 'ℹ️') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span style="font-size: 20px;">${icon}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    return { init, showToast, getUser: () => currentUser };
})();
