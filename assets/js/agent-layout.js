/* ==========================================================================
   MIMIN Platform — AI Agent Page Logic (shared by all Agent pages 48+)
   KPI grid, mini-panels / agents-grid, chat, tasks, knowledge, history, tabs.
   Use together with assets/css/agent-layout.css and assets/js/main.js.

   Usage in a page's own <script>:
     MiminAgentLayout.renderKpis(KPIS);
     MiminAgentLayout.renderPanels(PANELS);              // agent detail pages
     MiminAgentLayout.renderAgentsGrid(AGENTS, COMING_SOON); // hub pages only
     MiminAgentLayout.initChat({ welcome, suggested, avatarIcon, reply(text) });
     MiminAgentLayout.renderTasks(TASKS, TAG_LABELS);
     MiminAgentLayout.renderKnowledge(KNOWLEDGE);
     MiminAgentLayout.renderHistory(HISTORY);
     MiminAgentLayout.initTabs();                        // wires the 5 tab buttons + #goChatBtn
   ========================================================================== */

const MiminAgentLayout = (function () {
    'use strict';

    function renderKpis(kpis) {
        const grid = document.getElementById('kpiGrid');
        if (!grid) return;
        grid.innerHTML = '';
        kpis.forEach((k, i) => {
            const card = document.createElement('div');
            card.className = 'kpi-card';
            card.style.animationDelay = `${i * 0.05}s`;
            card.innerHTML = `
                <div class="kpi-top">
                    <div class="kpi-icon-wrap">${k.icon}</div>
                    <span class="kpi-change ${k.up ? 'up' : 'down'}">${k.up ? '▲' : '▼'} ${k.change}</span>
                </div>
                <div class="kpi-value">${k.value}</div>
                <div class="kpi-label">${k.label}</div>
            `;
            grid.appendChild(card);
        });
    }

    function renderPanels(panels) {
        const grid = document.getElementById('miniPanels');
        if (!grid) return;
        grid.innerHTML = '';
        panels.forEach(p => {
            const panel = document.createElement('div');
            panel.className = 'mini-panel';
            let body = '';
            if (p.bars) {
                body = p.bars.map(b => `
                    <div class="mp-row"><span>${b.label}</span><strong>${b.pct}%</strong></div>
                    <div class="mp-bar-track"><div class="mp-bar-fill" style="width:${b.pct}%;"></div></div>
                `).join('');
            }
            if (p.rows && p.rows.length) {
                body += p.rows.map(r => `<div class="mp-row"><span>${r.label}</span><strong>${r.value}</strong></div>`).join('');
            }
            panel.innerHTML = `<h4>${p.title}</h4>${body}`;
            grid.appendChild(panel);
        });
    }

    function renderAgentsGrid(agents, comingSoon) {
        const grid = document.getElementById('agentsGrid');
        if (!grid) return;
        grid.innerHTML = '';
        agents.forEach(a => {
            const card = document.createElement('a');
            card.className = 'agent-card';
            card.href = a.href;
            card.style.setProperty('--card-color', a.color);
            card.innerHTML = `
                <div class="ac-icon">${a.icon}</div>
                <div class="ac-name">${a.name}</div>
                <div class="ac-desc">${a.desc}</div>
                <div class="ac-meta"><span>✅ ${a.tasks} việc</span><span>💬 ${a.chats} chat</span></div>
                <span class="ac-open">Mở Agent →</span>
            `;
            grid.appendChild(card);
        });
        (comingSoon || []).forEach(c => {
            const card = document.createElement('div');
            card.className = 'agent-card coming-soon';
            card.innerHTML = `
                <span class="ac-badge-soon">Sắp ra mắt</span>
                <div class="ac-icon" style="background:var(--bg-hover);color:var(--text-light);">${c.icon}</div>
                <div class="ac-name">${c.name}</div>
                <div class="ac-desc">Đang được huấn luyện, sẽ có mặt trong sprint tiếp theo.</div>
            `;
            grid.appendChild(card);
        });
    }

    function addMessage(role, text, avatarIcon) {
        const container = document.getElementById('chatMessages');
        const typing = document.getElementById('typingIndicator');
        if (!container) return;
        const div = document.createElement('div');
        div.className = `chat-message ${role}`;
        div.innerHTML = `
            <div class="msg-avatar">${role === 'ai' ? (avatarIcon || '🤖') : 'HS'}</div>
            <div>
                <div class="msg-bubble">${text}</div>
                <span class="msg-time">Vừa xong</span>
            </div>
        `;
        container.insertBefore(div, typing);
        container.scrollTop = container.scrollHeight;
    }

    function initChat(config) {
        const avatarIcon = config.avatarIcon || '🤖';
        addMessage('ai', config.welcome, avatarIcon);
        const prompts = document.getElementById('suggestedPrompts');
        (config.suggested || []).forEach(p => {
            const chip = document.createElement('button');
            chip.className = 'prompt-chip';
            chip.textContent = p;
            chip.addEventListener('click', () => { document.getElementById('chatInput').value = p; send(); });
            prompts.appendChild(chip);
        });

        function send() {
            const input = document.getElementById('chatInput');
            const text = input.value.trim();
            if (!text) return;
            addMessage('user', text, avatarIcon);
            input.value = '';
            const typing = document.getElementById('typingIndicator');
            typing.classList.add('active');
            setTimeout(() => {
                typing.classList.remove('active');
                const reply = typeof config.reply === 'function' ? config.reply(text) : 'Đã ghi nhận yêu cầu của bạn.';
                addMessage('ai', reply, avatarIcon);
            }, 700 + Math.random() * 700);
        }

        document.getElementById('sendBtn').addEventListener('click', send);
        document.getElementById('chatInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
        });
    }

    function renderTasks(tasks, tagLabels) {
        const list = document.getElementById('taskList');
        if (!list) return;
        list.innerHTML = '';
        function update() {
            const remaining = tasks.filter(t => !t.done).length;
            document.getElementById('taskCount').textContent = `${remaining} việc cần làm`;
        }
        tasks.forEach(t => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="checkbox ${t.done ? 'checked' : ''}" role="checkbox" aria-checked="${t.done}" tabindex="0"></span>
                <span class="task-text ${t.done ? 'done' : ''}">${t.text}</span>
                <span class="task-tag ${t.tag}">${tagLabels[t.tag]}</span>
                <span class="task-due">${t.due}</span>
            `;
            const box = li.querySelector('.checkbox');
            const label = li.querySelector('.task-text');
            box.addEventListener('click', () => {
                t.done = !t.done;
                box.classList.toggle('checked', t.done);
                box.setAttribute('aria-checked', String(t.done));
                label.classList.toggle('done', t.done);
                update();
                if (t.done) MiminShell.showToast(`✅ Hoàn thành: ${t.text}`, 'success', '✅');
            });
            list.appendChild(li);
        });
        update();
    }

    function renderKnowledge(docs) {
        const grid = document.getElementById('knowledgeGrid');
        if (!grid) return;
        grid.innerHTML = '';
        docs.forEach(k => {
            const card = document.createElement('div');
            card.className = 'doc-card';
            card.innerHTML = `<div class="doc-icon">${k.icon}</div><div class="doc-name" title="${k.name}">${k.name}</div><div class="doc-meta">${k.meta}</div>`;
            card.addEventListener('click', () => MiminShell.showToast(`📄 Mở tài liệu: ${k.name}`, 'info', '📄'));
            grid.appendChild(card);
        });
        const countEl = document.getElementById('knowledgeCount');
        if (countEl) countEl.textContent = `${docs.length} tài liệu`;
    }

    function renderHistory(history) {
        const container = document.getElementById('historyTimeline');
        if (!container) return;
        container.innerHTML = '';
        history.forEach(h => {
            const row = document.createElement('div');
            row.className = 'mini-history-item';
            row.innerHTML = `<div class="mh-icon">${h.icon}</div><div class="mh-content"><div class="mh-title">${h.title}</div><div class="mh-time">${h.time}</div></div>`;
            container.appendChild(row);
        });
    }

    function initTabs() {
        const tabs = document.querySelectorAll('.agent-tabs .tab-btn');
        const contents = {};
        tabs.forEach(t => { contents[t.dataset.tab] = document.getElementById('tab-' + t.dataset.tab); });
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
                Object.values(contents).forEach(c => c && c.classList.remove('active'));
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                if (contents[this.dataset.tab]) contents[this.dataset.tab].classList.add('active');
            });
        });
        const goChatBtn = document.getElementById('goChatBtn');
        if (goChatBtn) {
            goChatBtn.addEventListener('click', () => {
                const chatTab = document.querySelector('.tab-btn[data-tab="chat"]');
                if (chatTab) chatTab.click();
            });
        }
    }

    return {
        renderKpis,
        renderPanels,
        renderAgentsGrid,
        addMessage,
        initChat,
        renderTasks,
        renderKnowledge,
        renderHistory,
        initTabs
    };
})();
