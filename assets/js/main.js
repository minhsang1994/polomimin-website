/* ==========================================================================
   MIMIN Platform — Shared Shell JS
   Theme toggle, toast system, sidebar nav render, notification popover,
   user drawer, mobile menu, AI float button, keyboard shortcuts.

   Extracted from the JS that is identical (function names + logic) across
   pages/02, 07, 08, 10, 20, 24, 26. Use together with assets/css/main.css.

   Usage (in a page's own <script>, after including this file):
     MiminShell.init({
         user: { name, initials, role, company, plan, loginDate },
         navItems: [{ icon, label, active, badge }, ...],
         notifications: [{ icon, title, time }, ...],   // shown in the header popover (already trimmed to what should appear there)
         aiFloatMessage: '🧠 AI Gợi ý hôm nay: ...',
         onNavClick: (item) => {},                        // optional, defaults to a toast
         onLogout: () => {},                               // optional, defaults to a toast
         onManageAccount: () => {}                         // optional, defaults to a toast
     });

   Page-specific data (NAV_ITEMS content, notifications, filters, page content)
   stays defined in each page — this file only renders/wires the shared shell.
   ========================================================================== */

const MiminShell = (function () {
    'use strict';

    const THEME_KEY = 'mimin-theme';

    // ====== THEME ======
    function getTheme() {
        return localStorage.getItem(THEME_KEY) || 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        const btn = document.getElementById('themeToggle');
        if (btn) btn.textContent = theme === 'light' ? '🌓' : '☀️';
    }

    function toggleTheme() {
        setTheme(getTheme() === 'light' ? 'dark' : 'light');
    }

    // ====== TOAST ======
    function showToast(message, type = 'info', icon = '💡') {
        // Fallback: id="toastContainer" OR class="toast-container"
        const container = document.getElementById('toastContainer')
                       || document.querySelector('.toast-container');
        if (!container) return;
        // Auto-assign id for future calls
        if (!container.id) container.id = 'toastContainer';
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 350);
        }, 3000);
    }

    // ====== SIDEBAR NAV ======
    function renderNav(navItems, onNavClick) {
        const container = document.getElementById('navMenu');
        if (!container) return;
        container.innerHTML = '';
        navItems.forEach(item => {
            // ── Section divider label ──────────────────────────────────
            if (item.section && !item.icon && !item.label) {
                const li = document.createElement('li');
                li.className = 'nav-section-label';
                li.style.cssText = 'padding:14px 14px 4px;font-size:.62rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--text-light);pointer-events:none;user-select:none;';
                li.textContent = item.section;
                container.appendChild(li);
                return;
            }
            // ── Skip malformed items (no icon AND no label) ────────────
            if (!item.icon && !item.label) return;

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = item.active ? 'active' : '';
            a.innerHTML = `
                <span class="nav-icon">${item.icon || ''}</span>
                ${item.label || ''}
                ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
            `;
            a.href = item.href || '#';
            a.setAttribute('role', 'menuitem');
            a.addEventListener('click', (e) => {
                if (!item.href || item.href === '#') e.preventDefault();
                if (typeof onNavClick === 'function') {
                    onNavClick(item, a);
                } else {
                    document.querySelectorAll('.m-sidebar-nav a').forEach(el => el.classList.remove('active'));

                    a.classList.add('active');
                    showToast(`🚀 Điều hướng đến: ${item.label}`, 'info', '🧭');
                }
            });
            li.appendChild(a);
            container.appendChild(li);
        });
    }

    // ====== NOTIFICATION POPOVER ======
    function renderNotifPopover(notifications, onNotifClick) {
        const container = document.getElementById('notifList');
        if (!container) return;
        container.innerHTML = '';
        notifications.slice(0, 5).forEach(notif => {
            const div = document.createElement('div');
            div.className = 'item';
            div.innerHTML = `
                <span class="icon">${notif.icon}</span>
                <div class="content">
                    <div class="title">${notif.title}</div>
                    <div class="time">${notif.time}</div>
                </div>
            `;
            div.addEventListener('click', () => {
                if (typeof onNotifClick === 'function') {
                    onNotifClick(notif);
                } else {
                    showToast(`📬 ${notif.title}`, 'info', '🔔');
                }
            });
            container.appendChild(div);
        });
        if (notifications.length === 0) {
            container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-light);font-size:14px;">Không có thông báo mới</div>';
        }
    }

    // ====== USER UI ======
    function updateUserUI(user) {
        if (!user) return;
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        setText('sidebarAvatar', user.initials);
        setText('sidebarUserName', user.name);
        setText('sidebarUserRole', user.role);
        setText('headerAvatar', user.initials);

        const setVal = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        setVal('drawerName', user.name);
        setVal('drawerRole', user.role ? `${user.role}${user.company ? ' · ' + user.company : ''}` : '');
        setVal('drawerCompany', user.company);
        setVal('drawerPlan', user.plan);
        setVal('drawerLoginDate', user.loginDate);
        const drawerAvatar = document.getElementById('drawerAvatar');
        if (drawerAvatar) drawerAvatar.textContent = user.initials;
    }

    // ====== INIT (wires all shell interactions) ======
    function init(config) {
        config = config || {};
        const user = config.user;
        const navItems = config.navItems || [];
        const notifications = config.notifications || [];

        // Theme
        setTheme(getTheme());
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

        // Nav + user + notif popover
        renderNav(navItems, config.onNavClick);
        renderNotifPopover(notifications, config.onNotifClick);
        updateUserUI(user);

        // Notification popover open/close
        const notifBtn = document.getElementById('notifBtn');
        const notifPopover = document.getElementById('notifPopover');
        if (notifBtn && notifPopover) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notifPopover.classList.toggle('open');
                notifBtn.setAttribute('aria-expanded', notifPopover.classList.contains('open'));
            });
            document.addEventListener('click', () => {
                notifPopover.classList.remove('open');
                notifBtn.setAttribute('aria-expanded', 'false');
            });
            notifPopover.addEventListener('click', (e) => e.stopPropagation());

            const markAllRead = document.getElementById('markAllRead');
            if (markAllRead) {
                markAllRead.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof config.onMarkAllRead === 'function') config.onMarkAllRead();
                    notifPopover.classList.remove('open');
                });
            }
            const viewAllNotifs = document.getElementById('viewAllNotifs');
            if (viewAllNotifs) {
                viewAllNotifs.addEventListener('click', () => {
                    notifPopover.classList.remove('open');
                    if (typeof config.onViewAllNotifs === 'function') config.onViewAllNotifs();
                });
            }
        }

        // Drawer (user profile)
        const headerAvatar = document.getElementById('headerAvatar');
        const drawerOverlay = document.getElementById('drawerOverlay');
        const drawerClose = document.getElementById('drawerClose');
        if (headerAvatar && drawerOverlay) {
            headerAvatar.addEventListener('click', () => drawerOverlay.classList.add('open'));
            headerAvatar.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    drawerOverlay.classList.add('open');
                }
            });
        }
        if (drawerClose && drawerOverlay) {
            drawerClose.addEventListener('click', () => drawerOverlay.classList.remove('open'));
        }
        if (drawerOverlay) {
            drawerOverlay.addEventListener('click', (e) => {
                if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
            });
        }
        const manageAccountBtn = document.getElementById('manageAccountBtn');
        if (manageAccountBtn) {
            manageAccountBtn.addEventListener('click', () => {
                if (typeof config.onManageAccount === 'function') {
                    config.onManageAccount();
                } else {
                    showToast('🔐 Quản lý tài khoản', 'info', '⚙️');
                }
                if (drawerOverlay) drawerOverlay.classList.remove('open');
            });
        }

        // AI Float — id="aiFloatBtn" OR class="m-ai-float"
        const aiFloatBtn = document.getElementById('aiFloatBtn')
                        || document.querySelector('.m-ai-float');
        if (aiFloatBtn) {
            aiFloatBtn.addEventListener('click', () => {
                if (typeof config.onAiFloat === 'function') {
                    config.onAiFloat();
                } else {
                    showToast(config.aiFloatMessage || '🧠 AI Gợi ý hôm nay', 'info', '🤖');
                }
            });
        }

        // Logout — Firebase Auth signOut nếu có, fallback toast
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                if (typeof config.onLogout === 'function') {
                    config.onLogout();
                } else {
                    showToast('👋 Đang đăng xuất...', 'warning', '⏻');
                    // Firebase Auth logout (nếu SDK đã load)
                    try {
                        if (typeof firebase !== 'undefined' && firebase.auth) {
                            await firebase.auth().signOut();
                        }
                    } catch(e) { /* silent */ }
                    // Xóa session localStorage
                    localStorage.removeItem('mimin-user');
                    // Redirect về login
                    setTimeout(() => { window.location.href = 'login.html'; }, 800);
                }
            });
        }

        // Mobile menu
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                const isOpen = sidebar.classList.toggle('open');
                menuToggle.setAttribute('aria-expanded', isOpen);
            });
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    const isSidebar = sidebar.contains(e.target);
                    const isToggle = menuToggle.contains(e.target);
                    if (!isSidebar && !isToggle) {
                        sidebar.classList.remove('open');
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    sidebar.classList.remove('open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Keyboard shortcuts (Ctrl/Cmd+K focuses search, Escape closes overlays)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.m-header .search-box input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            if (e.key === 'Escape') {
                if (notifPopover) {
                    notifPopover.classList.remove('open');
                    if (notifBtn) notifBtn.setAttribute('aria-expanded', 'false');
                }
                if (drawerOverlay) drawerOverlay.classList.remove('open');
                if (sidebar) sidebar.classList.remove('open');
                if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
                if (typeof config.onEscape === 'function') config.onEscape();
            }
        });
    }

    return {
        getTheme,
        setTheme,
        toggleTheme,
        showToast,
        renderNav,
        renderNotifPopover,
        updateUserUI,
        init
    };
})();
