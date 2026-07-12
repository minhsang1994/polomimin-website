// Find wide elements on Hub home
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const p = await ctx.newPage();
    await p.goto('https://polomimin.shop/01-home.html', { waitUntil: 'domcontentloaded' });

    const wides = await p.evaluate(() => {
        const all = document.querySelectorAll('*');
        const wides = [];
        all.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > 375) {
                wides.push({
                    tag: el.tagName,
                    class: el.className?.toString().substring(0, 50),
                    id: el.id,
                    w: Math.round(r.width),
                    right: Math.round(r.right),
                    text: el.textContent?.substring(0, 30)
                });
            }
        });
        return wides.slice(0, 15);
    });

    console.log('=== HUB HOME - Elements wider than 375px viewport ===\n');
    wides.forEach(w => {
        console.log(`<${w.tag}> .${w.class}#${w.id} - w=${w.w}px, right=${w.right}px - "${w.text}"`);
    });
    await browser.close();
})();
