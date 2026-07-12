// Re-test with cache bust
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({
        viewport: { width: 375, height: 667 },
        bypassCSP: true
    });
    await ctx.route('**/*', (route) => {
        const headers = { ...route.request().headers(), 'Cache-Control': 'no-cache' };
        route.continue({ headers });
    });
    const p = await ctx.newPage();
    await p.goto('https://polomimin.shop/01-home.html?t=' + Date.now(), { waitUntil: 'domcontentloaded' });

    const result = await p.evaluate(() => {
        return {
            body: {
                scrollWidth: document.body.scrollWidth,
                offsetWidth: document.body.offsetWidth,
                overflowX: getComputedStyle(document.body).overflowX
            },
            html: {
                scrollWidth: document.documentElement.scrollWidth,
                overflowX: getComputedStyle(document.documentElement).overflowX
            }
        };
    });
    console.log(JSON.stringify(result, null, 2));
    await browser.close();
})();
