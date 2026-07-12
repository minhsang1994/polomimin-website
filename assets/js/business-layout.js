/* ==========================================================================
   MIMIN Platform — Business Module Logic (shared by pages 70-101)
   Stat cards, sortable Data Table, Data Grid, generic Modal, Pagination,
   search/filter helpers. Use together with assets/css/business-layout.css
   and assets/js/main.js (MiminShell).

   Usage in a page's own <script>:
     MiminBiz.renderStatCards(STATS);
     MiminBiz.renderTable({ container, columns, rows, onRowClick });
     MiminBiz.renderGrid({ container, items, cardHtml, onCardClick });
     MiminBiz.renderPagination({ container, total, pageSize, page, onChange });
     MiminBiz.openModal({ title, subtitle, rows, primaryLabel, onPrimary });
     MiminBiz.closeModal();
     MiminBiz.filterRows(rows, query, fields);
     MiminBiz.renderBarChart({ container, data });
   ========================================================================== */

const MiminBiz = (function () {
    'use strict';

    // ====== STAT CARDS ======
    function renderStatCards(cards) {
        const grid = document.getElementById('statGrid');
        if (!grid) return;
        grid.innerHTML = '';
        cards.forEach((c, i) => {
            const card = document.createElement('div');
            card.className = 'biz-stat-card';
            card.style.animationDelay = `${i * 0.05}s`;
            card.innerHTML = `
                <div class="bsc-top">
                    <div class="bsc-icon">${c.icon}</div>
                    ${c.change ? `<span class="bsc-change ${c.up ? 'up' : 'down'}">${c.up ? '▲' : '▼'} ${c.change}</span>` : ''}
                </div>
                <div class="bsc-value">${c.value}</div>
                <div class="bsc-label">${c.label}</div>
            `;
            grid.appendChild(card);
        });
    }

    // ====== DATA TABLE (sortable) ======
    let sortState = {};
    function renderTable(config) {
        const { container, columns, rows, rowKey, onRowClick, emptyEl } = config;
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;

        if (!rows.length) {
            el.closest('.data-table-wrap').style.display = 'none';
            if (emptyEl) document.getElementById(emptyEl).style.display = 'flex';
            return;
        }
        el.closest('.data-table-wrap').style.display = 'block';
        if (emptyEl) document.getElementById(emptyEl).style.display = 'none';

        const thead = el.querySelector('thead tr');
        if (thead && !thead.dataset.built) {
            thead.innerHTML = columns.map(c => `<th data-key="${c.key}">${c.label}${c.sortable ? ' <span class="sort-arrow">↕</span>' : ''}</th>`).join('');
            thead.dataset.built = '1';
            if (config.onSort) {
                thead.querySelectorAll('th').forEach(th => {
                    const col = columns.find(c => c.key === th.dataset.key);
                    if (col && col.sortable) {
                        th.addEventListener('click', () => config.onSort(col.key));
                    }
                });
            }
        }

        const tbody = el.querySelector('tbody');
        tbody.innerHTML = '';
        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = columns.map(c => `<td class="${c.cls || ''}">${c.render ? c.render(row) : (row[c.key] ?? '')}</td>`).join('');
            if (onRowClick) {
                tr.style.cursor = 'pointer';
                tr.addEventListener('click', (e) => {
                    if (e.target.closest('.row-actions')) return;
                    onRowClick(row);
                });
            }
            tbody.appendChild(tr);
        });
    }

    // ====== DATA GRID ======
    function renderGrid(config) {
        const { container, items, cardHtml, onCardClick, emptyEl } = config;
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;

        if (!items.length) {
            el.style.display = 'none';
            if (emptyEl) document.getElementById(emptyEl).style.display = 'flex';
            return;
        }
        el.style.display = 'grid';
        if (emptyEl) document.getElementById(emptyEl).style.display = 'none';

        el.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'data-grid-card';
            card.innerHTML = cardHtml(item);
            if (onCardClick) card.addEventListener('click', () => onCardClick(item));
            el.appendChild(card);
        });
    }

    // ====== VIEW TOGGLE (table/grid) ======
    function initViewToggle(containerId, onChange) {
        const wrap = document.getElementById(containerId);
        if (!wrap) return;
        const buttons = wrap.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                onChange(btn.dataset.view);
            });
        });
    }

    // ====== PAGINATION ======
    function renderPagination(config) {
        const { container, total, pageSize, page, onChange } = config;
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        el.innerHTML = '';
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (totalPages <= 1) return;

        const prev = document.createElement('button');
        prev.textContent = '‹ Trước';
        prev.disabled = page === 1;
        prev.addEventListener('click', () => onChange(page - 1));
        el.appendChild(prev);

        const pages = new Set([1, totalPages, page, page - 1, page + 1]);
        let last = 0;
        [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b).forEach(p => {
            if (last && p - last > 1) {
                const dots = document.createElement('span');
                dots.className = 'p-ellipsis';
                dots.textContent = '…';
                el.appendChild(dots);
            }
            const btn = document.createElement('button');
            btn.textContent = String(p);
            if (p === page) btn.classList.add('active');
            btn.addEventListener('click', () => onChange(p));
            el.appendChild(btn);
            last = p;
        });

        const next = document.createElement('button');
        next.textContent = 'Sau ›';
        next.disabled = page === totalPages;
        next.addEventListener('click', () => onChange(page + 1));
        el.appendChild(next);
    }

    // ====== MODAL (generic) ======
    function ensureModalRoot() {
        let overlay = document.getElementById('bizModalOverlay');
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.className = 'biz-modal-overlay';
        overlay.id = 'bizModalOverlay';
        overlay.innerHTML = `
            <div class="biz-modal" id="bizModal">
                <div class="bm-header">
                    <div>
                        <div class="bm-title" id="bmTitle"></div>
                        <div class="bm-subtitle" id="bmSubtitle"></div>
                    </div>
                    <button class="bm-close" id="bmClose" aria-label="Đóng">✕</button>
                </div>
                <div class="bm-body" id="bmBody"></div>
                <div class="bm-footer" id="bmFooter"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
        overlay.querySelector('#bmClose').addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
        return overlay;
    }

    function openModal(config) {
        const overlay = ensureModalRoot();
        document.getElementById('bmTitle').textContent = config.title || '';
        document.getElementById('bmSubtitle').textContent = config.subtitle || '';
        const body = document.getElementById('bmBody');
        if (config.rows) {
            body.innerHTML = (config.bodyHtml || '') + config.rows.map(r => `
                <div class="bm-row"><span class="bm-label">${r.label}</span><span class="bm-value">${r.value}</span></div>
            `).join('');
        } else {
            body.innerHTML = config.bodyHtml || '';
        }
        const footer = document.getElementById('bmFooter');
        footer.innerHTML = '';
        (config.actions || [{ label: 'Đóng', type: 'secondary', onClick: closeModal }]).forEach(a => {
            const btn = document.createElement('button');
            btn.className = a.type === 'primary' ? 'bm-btn-primary' : 'bm-btn-secondary';
            btn.textContent = a.label;
            btn.addEventListener('click', a.onClick || closeModal);
            footer.appendChild(btn);
        });
        document.getElementById('bizModal').classList.toggle('wide', !!config.wide);
        overlay.classList.add('open');
    }

    function closeModal() {
        const overlay = document.getElementById('bizModalOverlay');
        if (overlay) overlay.classList.remove('open');
    }

    // ====== SEARCH / FILTER HELPERS ======
    function filterRows(rows, query, fields) {
        if (!query || !query.trim()) return rows;
        const q = query.trim().toLowerCase();
        return rows.filter(r => fields.some(f => String(r[f] ?? '').toLowerCase().includes(q)));
    }

    function paginateRows(rows, page, pageSize) {
        const start = (page - 1) * pageSize;
        return rows.slice(start, start + pageSize);
    }

    // ====== KANBAN BOARD ======
    function renderKanban(config) {
        const { container, columns, items, groupBy, cardHtml, onCardClick, emptyEl } = config;
        const board = typeof container === 'string' ? document.getElementById(container) : container;
        if (!board) return;
        board.innerHTML = '';

        if (!items.length) {
            board.style.display = 'none';
            if (emptyEl) document.getElementById(emptyEl).style.display = 'flex';
            return;
        }
        board.style.display = 'flex';
        if (emptyEl) document.getElementById(emptyEl).style.display = 'none';

        columns.forEach(col => {
            const colItems = items.filter(it => it[groupBy] === col.key);
            const colEl = document.createElement('div');
            colEl.className = 'biz-kanban-col';
            colEl.setAttribute('role', 'listitem');
            colEl.innerHTML = `<div class="kc-head"><span>${col.label}</span><span class="kc-count">${colItems.length}</span></div>`;
            colItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'biz-kanban-card';
                card.tabIndex = 0;
                card.innerHTML = cardHtml(item);
                if (onCardClick) card.addEventListener('click', () => onCardClick(item));
                colEl.appendChild(card);
            });
            board.appendChild(colEl);
        });
    }

    // ====== TIMELINE ======
    function renderTimeline(config) {
        const { container, items } = config;
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        el.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'biz-timeline-item' + (item.state ? ' ' + item.state : '');
            div.innerHTML = `
                <div class="ti-title">${item.title}</div>
                ${item.desc ? `<div class="ti-desc">${item.desc}</div>` : ''}
                <div class="ti-time">${item.time}</div>
            `;
            el.appendChild(div);
        });
    }

    // ====== SIMPLE BAR CHART ======
    function renderBarChart(config) {
        const { container, data } = config;
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        el.innerHTML = '';
        const max = Math.max(...data.map(d => d.value));
        data.forEach(d => {
            const col = document.createElement('div');
            col.className = 'bar-col';
            const pct = max ? (d.value / max) * 100 : 0;
            col.innerHTML = `<div class="bar-fill ${d.color || ''}" style="height:${pct}%;" title="${d.value}"></div><div class="bar-label">${d.label}</div>`;
            el.appendChild(col);
        });
    }

    return {
        renderStatCards,
        renderTable,
        renderGrid,
        initViewToggle,
        renderPagination,
        openModal,
        closeModal,
        filterRows,
        paginateRows,
        renderBarChart,
        renderKanban,
        renderTimeline
    };
})();
