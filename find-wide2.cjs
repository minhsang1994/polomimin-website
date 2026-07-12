// Re-find wide elements after fix
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const p = await ctx.newPage();
    await p.goto('https://polomimin.shop/01-home.html?nocache=' + Date.now(), { waitUntil: 'domcontentloaded' });

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
                    text: el.textContent?.substring(0, 30)?.replace(/\s+/g, ' ').trim()
                });
            }
        });
        return wides.slice(0, 15);
    });

    console.log('=== HUB HOME - After fix - Elements wider than 375px ===\n');
    wides.forEach(w => {
        console.log(`<${w.tag}> .${w.class}#${w.id} - w=${w.w}px, right=${w.right}px`);
    });
    await browser.close();
})();
