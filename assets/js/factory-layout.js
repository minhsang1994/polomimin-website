/* ==========================================================================
   MIMIN Platform — Factory OS Module Logic (shared by pages 102-141)
   Stat cards, sortable Data Table, Data Grid, generic Modal, Pagination,
   Kanban board, Timeline, Gantt bars, Calendar grid, simple bar chart.
   Use together with assets/css/factory-layout.css and assets/js/main.js (MiminShell).

   Usage in a page's own <script>:
     MiminFac.renderStatCards(STATS);
     MiminFac.renderTable({ container, columns, rows, onRowClick });
     MiminFac.renderGrid({ container, items, cardHtml, onCardClick });
     MiminFac.renderPagination({ container, total, pageSize, page, onChange });
     MiminFac.openModal({ title, subtitle, rows, actions });
     MiminFac.closeModal();
     MiminFac.filterRows(rows, query, fields);
     MiminFac.renderKanban({ container, columns, items, groupBy, cardHtml, onCardClick });
     MiminFac.renderTimeline({ container, items });
     MiminFac.renderGantt({ container, rows });
     MiminFac.renderCalendar({ container, year, month, today, events, onDayClick });
     MiminFac.renderBarChart({ container, data, maxKey });
   ========================================================================== */

const MiminFac = (function () {
    'use strict';

    // ====== STAT CARDS ======
    function renderStatCards(cards, containerId) {
        const grid = document.getElementById(containerId || 'statGrid');
        if (!grid) return;
        grid.innerHTML = '';
        cards.forEach((c, i) => {
            const card = document.createElement('div');
            card.className = 'fac-stat-card';
            card.style.animationDelay = `${i * 0.05}s`;
            card.innerHTML = `
                <div class="fsc-top">
                    <div class="fsc-icon">${c.icon}</div>
                    ${c.change ? `<span class="fsc-change ${c.up ? 'up' : 'down'}">${c.up ? '▲' : '▼'} ${c.change}</span>` : ''}
                </div>
                <div class="fsc-value">${c.value}</div>
                <div class="fsc-label">${c.label}</div>
            `;
            grid.appendChild(card);
        });
    }

    // ====== DATA TABLE (sortable) ======
    function renderTable(config) {
        const { container, columns, rows, onRowClick, emptyEl } = config;
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;

        if (!rows.length) {
            el.closest('.fac-table-wrap').style.display = 'none';
            if (emptyEl) document.getElementById(emptyEl).style.display = 'flex';
            return;
        }
        el.closest('.fac-table-wrap').style.display = 'block';
        if (emptyEl) document.getElementById(emptyEl).style.display = 'none';

        const thead = el.querySelector('thead tr');
        if (thead && !thead.dataset.built) {
            thead.innerHTML = columns.map(c => `<th data-key="${c.key}">${c.label}${c.sortable ? ' <span class="sort-arrow">↕</span>' : ''}</th>`).join('');
            thead.dataset.built = '1';
            if (config.onSort) {
                thead.querySelectorAll('th').forEach(th => {
                    const col = columns.find(c => c.key === th.dataset.key);
                    if (col && col.sortable) th.addEventListener('click', () => config.onSort(col.key));
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
        let overlay = document.getElementById('facModalOverlay');
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.className = 'fac-modal-overlay';
        overlay.id = 'facModalOverlay';
        overlay.innerHTML = `
            <div class="fac-modal" id="facModal">
                <div class="fm-header">
                    <div><div class="fm-title" id="fmTitle"></div><div class="fm-subtitle" id="fmSubtitle"></div></div>
                    <button class="fm-close" id="fmClose" aria-label="Đóng">✕</button>
                </div>
                <div class="fm-body" id="fmBody"></div>
                <div class="fm-footer" id="fmFooter"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
        overlay.querySelector('#fmClose').addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
        return overlay;
    }

    function openModal(config) {
        const overlay = ensureModalRoot();
        document.getElementById('fmTitle').textContent = config.title || '';
        document.getElementById('fmSubtitle').textContent = config.subtitle || '';
        const body = document.getElementById('fmBody');
        if (config.rows) {
            body.innerHTML = (config.bodyHtml || '') + config.rows.map(r => `
                <div class="fm-row"><span class="fm-label">${r.label}</span><span class="fm-value">${r.value}</span></div>
            `).join('');
        } else {
            body.innerHTML = config.bodyHtml || '';
        }
        const footer = document.getElementById('fmFooter');
        footer.innerHTML = '';
        (config.actions || [{ label: 'Đóng', type: 'secondary', onClick: closeModal }]).forEach(a => {
            const btn = document.createElement('button');
            btn.className = a.type === 'primary' ? 'fm-btn-primary' : 'fm-btn-secondary';
            btn.textContent = a.label;
            btn.addEventListener('click', a.onClick || closeModal);
            footer.appendChild(btn);
        });
        document.getElementById('facModal').classList.toggle('wide', !!config.wide);
        overlay.classList.add('open');
    }

    function closeModal() {
        const overlay = document.getElementById('facModalOverlay');
        if (overlay) overlay.classList.remove('open');
    }

    // ====== SEARCH / FILTER / PAGINATE HELPERS ======
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
            colEl.className = 'fac-kanban-col';
            colEl.setAttribute('role', 'listitem');
            colEl.innerHTML = `<div class="fac-kanban-col-head"><span>${col.label}</span><span class="count">${colItems.length}</span></div><div class="fac-kanban-col-body"></div>`;
            const body = colEl.querySelector('.fac-kanban-col-body');
            colItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'fac-kanban-card';
                card.tabIndex = 0;
                card.innerHTML = cardHtml(item);
                if (onCardClick) card.addEventListener('click', () => onCardClick(item));
                body.appendChild(card);
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
            div.className = 'fac-timeline-item' + (item.state ? ' ' + item.state : '');
            div.innerHTML = `
                <div class="ti-title">${item.title}</div>
                ${item.desc ? `<div class="ti-desc">${item.desc}</div>` : ''}
                <div class="ti-time">${item.time}</div>
            `;
            el.appendChild(div);
        });
    }

    // ====== GANTT (horizontal bars) ======
    function renderGantt(config) {
        const { container, rows } = config;
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        el.innerHTML = '';
        rows.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'fac-gantt-row';
            rowEl.innerHTML = `
                <div class="gr-label">${row.label}</div>
                <div class="gr-track">
                    <div class="gr-bar ${row.color || ''}" style="left:${row.start}%;width:${row.width}%;" title="${row.tooltip || row.label}">${row.text || ''}</div>
                </div>
            `;
            el.appendChild(rowEl);
        });
    }

    // ====== CALENDAR (month grid) ======
    function renderCalendar(config) {
        const { container, year, month, today, events, onDayClick, titleEl } = config;
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        el.innerHTML = '';

        if (titleEl) document.getElementById(titleEl).textContent = `Tháng ${month + 1}, ${year}`;

        const first = new Date(year, month, 1);
        const startWeekday = first.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        function makeCell(num, otherMonth, dayEvents, isToday) {
            const cell = document.createElement('div');
            cell.className = 'fac-cal-day' + (otherMonth ? ' other-month' : '') + (isToday ? ' today' : '');
            cell.setAttribute('role', 'gridcell');
            cell.innerHTML = `<div class="cd-num">${num}</div>` + dayEvents.map(e => `<div class="cd-event ${e.type || ''}">${e.time ? e.time + ' ' : ''}${e.title}</div>`).join('');
            if (!otherMonth && dayEvents.length && onDayClick) {
                cell.addEventListener('click', () => onDayClick(num, dayEvents));
            }
            return cell;
        }

        for (let i = startWeekday - 1; i >= 0; i--) el.appendChild(makeCell(daysInPrevMonth - i, true, []));
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = today && today.year === year && today.month === month && today.day === d;
            el.appendChild(makeCell(d, false, events[d] || [], isToday));
        }
        const remaining = (7 - (el.children.length % 7)) % 7;
        for (let d = 1; d <= remaining; d++) el.appendChild(makeCell(d, true, []));
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
        renderStatCards, renderTable, renderGrid, initViewToggle, renderPagination,
        openModal, closeModal, filterRows, paginateRows,
        renderKanban, renderTimeline, renderGantt, renderCalendar, renderBarChart
    };
})();
