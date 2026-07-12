// POLOMIMIN - Shared JavaScript
// Navigation utilities + active state

(function() {
    'use strict';

    // Module color mapping
    const MODULE_COLORS = {
        'erp': 'var(--erp-color)',
        'mes': 'var(--mes-color)',
        'wms': 'var(--wms-color)',
        'hr': 'var(--hr-color)',
        'sales': 'var(--sales-color)',
        'ai': 'var(--ai-color)',
        'academy': 'var(--academy-color)'
    };

    // Detect module from filename
    function detectModule() {
        const path = window.location.pathname;
        const match = path.match(/(\d+)-([a-z]+)-/);
        if (match) return match[2];
        return null;
    }

    // Apply module color to header
    function applyModuleTheme() {
        const module = detectModule();
        if (module && MODULE_COLORS[module]) {
            const header = document.querySelector('.module-header');
            if (header) {
                header.style.setProperty('--module-bg',
                    module === 'erp' ? 'linear-gradient(135deg, #1E3A8A, #1E40AF)' :
                    module === 'mes' ? 'linear-gradient(135deg, #2563EB, #1E40AF)' :
                    module === 'wms' ? 'linear-gradient(135deg, #16A34A, #15803D)' :
                    module === 'hr' ? 'linear-gradient(135deg, #EA580C, #C2410C)' :
                    module === 'sales' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' :
                    module === 'ai' ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' :
                    module === 'academy' ? 'linear-gradient(135deg, #0891B2, #0E7490)' : ''
                );
            }
        }
    }

    // Active nav link
    function highlightActiveNav() {
        const path = window.location.pathname.split('/').pop();
        document.querySelectorAll('.sidebar-nav-link').forEach(link => {
            if (link.getAttribute('href') === path) {
                link.classList.add('active');
            }
        });
    }

    // Init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            applyModuleTheme();
            highlightActiveNav();
        });
    } else {
        applyModuleTheme();
        highlightActiveNav();
    }
})();
