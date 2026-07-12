// Debug Hub overflow
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const p = await ctx.newPage();
    await p.goto('https://polomimin.shop/01-home.html?t=' + Date.now(), { waitUntil: 'domcontentloaded' });

    const r = await p.evaluate(() => {
        return {
            body: {
                scrollWidth: document.body.scrollWidth,
                clientWidth: document.body.clientWidth,
                overflowX: getComputedStyle(document.body).overflowX,
                maxWidth: getComputedStyle(document.body).maxWidth
            },
            html: {
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
                overflowX: getComputedStyle(document.documentElement).overflowX,
                maxWidth: getComputedStyle(document.documentElement).maxWidth
            },
            viewport: { w: window.innerWidth, h: window.innerHeight }
        };
    });
    console.log(JSON.stringify(r, null, 2));

    // Try to scroll horizontally - is it actually scrollable?
    const scrollResult = await p.evaluate(() => {
        const before = window.scrollX;
        window.scrollTo(100, 0);
        const after = window.scrollX;
        return { before, after, scrollable: after > before };
    });
    console.log('Can scroll horizontally:', scrollResult);

    await browser.close();
})();
