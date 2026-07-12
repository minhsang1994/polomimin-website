// Mobile responsive audit - test 3 viewports x 5 sample pages
const { chromium } = require('playwright');

const testPages = [
    { url: '06-wms-dashboard.html', name: 'WMS Dashboard' },
    { url: '22-sales-dashboard.html', name: 'Sales Dashboard' },
    { url: '04-mes-dashboard.html', name: 'MES Dashboard' },
    { url: '22-hr-dashboard.html', name: 'HR Dashboard' },
    { url: '01-home.html', name: 'Hub Home' }
];

const viewports = [
    { name: 'Mobile (375x667)', width: 375, height: 667 },
    { name: 'Tablet (768x1024)', width: 768, height: 1024 },
    { name: 'Desktop (1920x1080)', width: 1920, height: 1080 }
];

(async () => {
    const browser = await chromium.launch();
    const results = [];

    for (const vp of viewports) {
        for (const page of testPages) {
            const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
            const p = await context.newPage();
            const issues = [];

            try {
                const resp = await p.goto(`https://polomimin.shop/${page.url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
                const status = resp.status();

                // Check responsive behavior
                const checks = await p.evaluate(() => {
                    const sidebar = document.querySelector('.m-sidebar');
                    const main = document.querySelector('.m-main');
                    const body = document.body;
                    const sidebarStyle = sidebar ? getComputedStyle(sidebar) : null;
                    const mainStyle = main ? getComputedStyle(main) : null;

                    return {
                        viewport: { w: window.innerWidth, h: window.innerHeight },
                        sidebar: sidebarStyle ? {
                            position: sidebarStyle.position,
                            transform: sidebarStyle.transform,
                            width: sidebarStyle.width
                        } : null,
                        main: mainStyle ? {
                            marginLeft: mainStyle.marginLeft,
                            paddingLeft: mainStyle.paddingLeft,
                            width: mainStyle.width
                        } : null,
                        bodyWidth: body.scrollWidth,
                        bodyOverflowX: getComputedStyle(body).overflowX,
                        htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
                        hasHorizontalScroll: body.scrollWidth > window.innerWidth,
                        menuToggleVisible: (() => {
                            const btn = document.querySelector('.m-header .menu-toggle');
                            if (!btn) return null;
                            const s = getComputedStyle(btn);
                            return s.display !== 'none' && s.visibility !== 'hidden';
                        })()
                    };
                });

                const isMobile = vp.width <= 768;
                if (isMobile && checks.sidebar) {
                    // Sidebar is hidden if: transform moves it offscreen
                    const t = checks.sidebar.transform;
                    let isHidden = t.includes('translateX') && t.includes('-');
                    // matrix(a, b, c, d, e, f) - e is x translation
                    const matrixMatch = t.match(/matrix\(([^)]+)\)/);
                    if (!isHidden && matrixMatch) {
                        const parts = matrixMatch[1].split(',').map(s => parseFloat(s.trim()));
                        const e = parts[4]; // x translation
                        isHidden = e < -50; // moved left offscreen
                    }
                    if (checks.sidebar.position === 'fixed' && !isHidden) {
                        issues.push('Sidebar visible on mobile (should be hidden)');
                    }
                }

                // Body horizontal scroll: only counts if overflow is visible
                const bodyOvf = checks.bodyOverflowX || '?';
                const htmlOvf = checks.htmlOverflowX || '?';
                if (checks.hasHorizontalScroll && bodyOvf !== 'hidden' && htmlOvf !== 'hidden') {
                    issues.push(`H-scroll visible (body=${checks.bodyWidth}px, bodyOvf=${bodyOvf}, htmlOvf=${htmlOvf})`);
                }
                if (isMobile && checks.menuToggleVisible === false) {
                    issues.push('Menu toggle not visible on mobile');
                }

                results.push({
                    page: page.name,
                    url: page.url,
                    viewport: vp.name,
                    status,
                    checks,
                    issues
                });
            } catch (e) {
                results.push({
                    page: page.name,
                    url: page.url,
                    viewport: vp.name,
                    error: e.message
                });
            }
            await context.close();
        }
    }

    await browser.close();

    // Group by viewport
    console.log('\n=== MOBILE RESPONSIVE AUDIT ===\n');
    for (const vp of viewports) {
        console.log(`\n📱 ${vp.name} (${vp.width}px)\n${'='.repeat(50)}`);
        const vpResults = results.filter(r => r.viewport === vp.name);
        vpResults.forEach(r => {
            if (r.error) {
                console.log(`  ❌ ${r.page}: ${r.error}`);
                return;
            }
            const c = r.checks;
            const sidebarState = c.sidebar ? `${c.sidebar.position}/${c.sidebar.transform.includes('translateX') ? 'hidden' : 'visible'}` : 'none';
            const status = r.issues.length === 0 ? '✅' : '⚠️';
            console.log(`  ${status} ${r.page}`);
            console.log(`     Sidebar: ${sidebarState} (${c.sidebar?.width || 'N/A'})`);
            console.log(`     Main: ${c.main?.paddingLeft || 'N/A'} pad-left, ${c.main?.width || 'N/A'} wide`);
            console.log(`     Menu toggle: ${c.menuToggleVisible === null ? 'N/A' : c.menuToggleVisible ? 'visible' : 'hidden'}`);
            console.log(`     H-scroll: ${c.hasHorizontalScroll ? '❌ YES' : '✅ no'}`);
            if (r.issues.length > 0) {
                r.issues.forEach(i => console.log(`     ⚠️  ${i}`));
            }
        });
    }

    // Summary
    const total = results.length;
    const withIssues = results.filter(r => r.issues && r.issues.length > 0).length;
    const withHScroll = results.filter(r => r.checks && r.checks.hasHorizontalScroll).length;
    const withSidebarVisible = results.filter(r => {
        return r.checks && r.checks.sidebar &&
               viewports.find(v => v.name === r.viewport).width <= 768 &&
               !r.checks.sidebar.transform.includes('translateX');
    }).length;

    console.log(`\n\n📊 SUMMARY:`);
    console.log(`  Total tests: ${total}`);
    console.log(`  Tests with issues: ${withIssues}`);
    console.log(`  Mobile sidebar always hidden: ${total - withSidebarVisible}/${viewports.length * testPages.length}`);
    console.log(`  Horizontal scroll: ${withHScroll}/${total}`);
})();
