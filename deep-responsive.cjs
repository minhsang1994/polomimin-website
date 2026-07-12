// Deep check sidebar transform on mobile
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();

    // Mobile test
    const mobile = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const p = await mobile.newPage();
    await p.goto('https://polomimin.shop/06-wms-dashboard.html', { waitUntil: 'domcontentloaded' });

    const result = await p.evaluate(() => {
        const sidebar = document.querySelector('.m-sidebar');
        const style = getComputedStyle(sidebar);
        return {
            viewport: { w: window.innerWidth, h: window.innerHeight },
            sidebar: {
                position: style.position,
                transform: style.transform,
                left: style.left,
                width: style.width,
                display: style.display,
                visibility: style.visibility,
                zIndex: style.zIndex,
                classList: Array.from(sidebar.classList)
            },
            computed: {
                rect: sidebar.getBoundingClientRect(),
                inViewport: (() => {
                    const r = sidebar.getBoundingClientRect();
                    return { x: r.x, y: r.y, right: r.right };
                })()
            }
        };
    });
    console.log('=== MOBILE 375px WMS ===');
    console.log(JSON.stringify(result, null, 2));
    await mobile.close();

    // Hub home test
    const hub = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const h = await hub.newPage();
    await h.goto('https://polomimin.shop/01-home.html', { waitUntil: 'domcontentloaded' });

    const hubResult = await h.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const hero = document.querySelector('.hero, .hero-banner, .topbar, .navbar');
        const allSections = Array.from(document.querySelectorAll('section, .container, [class*="container"], [class*="row"]'));
        return {
            viewport: { w: window.innerWidth, h: window.innerHeight },
            body: { scrollWidth: body.scrollWidth, offsetWidth: body.offsetWidth },
            html: { scrollWidth: html.scrollWidth, offsetWidth: html.offsetWidth },
            wideElements: allSections.filter(s => s.offsetWidth > window.innerWidth).map(s => ({
                tag: s.tagName, class: s.className, w: s.offsetWidth
            })).slice(0, 5)
        };
    });
    console.log('\n=== MOBILE 375px HUB HOME ===');
    console.log(JSON.stringify(hubResult, null, 2));
    await hub.close();

    await browser.close();
})();
