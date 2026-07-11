/**
 * POLOMIMIN Business Layout JavaScript
 * Stat cards, tables, pagination, modals
 */

window.MiminBiz = (function () {
    'use strict';

    function renderStatCards(stats) {
        const grid = document.getElementById('statGrid');
        if (!grid) return;
        grid.innerHTML = stats.map(s => `
            <div class="biz-stat">
                <div class="biz-stat-icon">${s.icon}</div>
                <div class="biz-stat-label">${s.label}</div>
                <div class="biz-stat-value">${s.value}</div>
                <div class="biz-stat-change ${s.up ? '' : 'down'}">
                    ${s.up ? '↑' : '↓'} ${s.change}
                </div>
            </div>
        `).join('');
    }

    function renderTable({ container, emptyEl, columns, rows, onRowClick }) {
        if (!container) return;
        const table = container;
        const thead = table.querySelector('thead tr');
        const tbody = table.querySelector('tbody');
        const empty = emptyEl ? document.getElementById(emptyEl) : null;

        if (!rows || rows.length === 0) {
            table.style.display = 'none';
            if (empty) empty.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        if (empty) empty.style.display = 'none';

        thead.innerHTML = columns.map(c => `<th class="${c.cls || ''}">${c.label}</th>`).join('');
        tbody.innerHTML = rows.map((row, i) => {
            const cells = columns.map(c => {
                const val = c.render ? c.render(row) : row[c.key] || '';
                return `<td class="${c.cls || ''}">${val}</td>`;
            }).join('');
            return `<tr data-idx="${i}" style="cursor: pointer;">${cells}</tr>`;
        }).join('');

        if (onRowClick) {
            tbody.querySelectorAll('tr').forEach(tr => {
                tr.addEventListener('click', () => {
                    const idx = parseInt(tr.dataset.idx);
                    onRowClick(rows[idx]);
                });
            });
        }
    }

    function paginateRows(rows, page, pageSize) {
        const start = (page - 1) * pageSize;
        return rows.slice(start, start + pageSize);
    }

    function renderPagination({ container, total, pageSize, page, onChange }) {
        const el = document.getElementById(container);
        if (!el) return;
        const totalPages = Math.ceil(total / pageSize);
        if (totalPages <= 1) { el.innerHTML = ''; return; }

        let html = `<button class="page-btn" ${page === 1 ? 'disabled' : ''} data-p="${page - 1}">‹</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === page ? 'active' : ''}" data-p="${i}">${i}</button>`;
        }
        html += `<button class="page-btn" ${page === totalPages ? 'disabled' : ''} data-p="${page + 1}">›</button>`;
        el.innerHTML = html;

        el.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = parseInt(btn.dataset.p);
                if (p >= 1 && p <= totalPages) onChange(p);
            });
        });
    }

    function openModal({ title, subtitle, bodyHtml, rows, actions }) {
        let overlay = document.querySelector('.biz-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'biz-modal-overlay';
            overlay.innerHTML = `
                <div class="biz-modal">
                    <div class="biz-modal-head">
                        <div>
                            <div class="biz-modal-title"></div>
                            <div class="biz-modal-sub"></div>
                        </div>
                        <button class="drawer-close">✕</button>
                    </div>
                    <div class="biz-modal-body"></div>
                    <div class="biz-modal-foot"></div>
                </div>
            `;
            document.body.appendChild(overlay);
            overlay.querySelector('.drawer-close').addEventListener('click', () => overlay.classList.remove('open'));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('open');
            });
        }

        overlay.querySelector('.biz-modal-title').textContent = title || '';
        overlay.querySelector('.biz-modal-sub').textContent = subtitle || '';
        const body = overlay.querySelector('.biz-modal-body');
        if (bodyHtml) {
            body.innerHTML = bodyHtml;
        } else if (rows) {
            body.innerHTML = rows.map(r => `
                <div class="biz-modal-row">
                    <span class="label">${r.label}</span>
                    <span class="value">${r.value}</span>
                </div>
            `).join('');
        } else {
            body.innerHTML = '';
        }

        const foot = overlay.querySelector('.biz-modal-foot');
        if (actions && actions.length) {
            foot.innerHTML = actions.map((a, i) =>
                `<button class="btn-biz ${a.type === 'primary' ? 'btn-biz-primary' : 'btn-biz-outline'}" data-idx="${i}">${a.label}</button>`
            ).join('');
            foot.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.idx);
                    if (actions[idx].onClick) actions[idx].onClick();
                    if (actions[idx].type !== 'primary') overlay.classList.remove('open');
                });
            });
        } else {
            foot.innerHTML = '';
        }

        overlay.classList.add('open');
    }

    return { renderStatCards, renderTable, paginateRows, renderPagination, openModal };
})();
