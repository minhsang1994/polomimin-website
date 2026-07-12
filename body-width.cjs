// Test body scroll width
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const p = await ctx.newPage();
    await p.goto('https://polomimin.shop/01-home.html?nocache=' + Date.now(), { waitUntil: 'domcontentloaded' });

    const result = await p.evaluate(() => {
        return {
            viewport: { w: window.innerWidth, h: window.innerHeight },
            body: {
                scrollWidth: document.body.scrollWidth,
                offsetWidth: document.body.offsetWidth,
                clientWidth: document.body.clientWidth
            },
            html: {
                scrollWidth: document.documentElement.scrollWidth,
                offsetWidth: document.documentElement.offsetWidth,
                clientWidth: document.documentElement.clientWidth
            },
            computedBody: {
                overflowX: getComputedStyle(document.body).overflowX,
                maxWidth: getComputedStyle(document.body).maxWidth
            },
            computedHtml: {
                overflowX: getComputedStyle(document.documentElement).overflowX,
                maxWidth: getComputedStyle(document.documentElement).maxWidth
            }
        };
    });
    console.log(JSON.stringify(result, null, 2));
    await browser.close();
})();
