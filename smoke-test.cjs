// Smoke test 60 pages
const https = require('https');

const pages = [
    // Public-facing
    "01-home.html", "index.html", "login.html", "settings.html", "gallery.html",
    // ERP
    "02-erp-dashboard.html", "03-erp-don-hang.html", "04-erp-khach-hang.html", "05-erp-san-pham.html", "06-erp-thanh-toan.html", "07-erp-bao-cao.html",
    // MES
    "04-mes-dashboard.html", "05-mes-lenh-sx.html", "08-mes-dashboard.html", "09-mes-ke-hoach.html", "10-mes-lenh-sx.html", "11-mes-lenh-cat.html", "12-mes-may.html", "13-mes-qc.html", "14-mes-hoan-thien.html", "15-mes-dong-goi.html",
    // WMS
    "06-wms-dashboard.html", "07-wms-kho-vai.html", "16-wms-dashboard.html", "17-wms-kho-vai.html", "18-wms-kho-tp.html", "19-wms-nhap.html", "20-wms-xuat.html", "21-wms-kiem-ke.html",
    // HR
    "22-hr-dashboard.html", "23-hr-ho-so.html", "24-hr-cham-cong.html", "30-hr-dashboard.html", "31-hr-ho-so.html", "32-hr-cham-cong.html", "34-hr-luong.html",
    // Sales
    "22-sales-dashboard.html", "23-sales-don-hang.html", "24-sales-khach-hang.html", "25-sales-san-pham.html", "26-sales-kho-thanh-pham.html", "27-sales-van-chuyen.html", "28-sales-thanh-toan.html", "29-sales-kenh-ban.html", "30-sales-tao-don.html", "31-sales-chi-tiet-don.html", "32-sales-cap-nhat-trang-thai.html", "33-sales-huy-don.html", "34-sales-tra-hang.html", "35-sales-bang-gia.html", "36-sales-cong-no.html", "37-sales-doi-soat.html", "38-sales-bao-cao.html",
    // AI Center
    "25-ai-dashboard.html", "33-ai-dashboard.html", "35-ai-du-bao.html", "36-ai-goi-y.html",
    // Academy
    "37-academy-dashboard.html", "38-academy-khoa-hoc.html", "39-academy-sop.html"
];

console.log(`Testing ${pages.length} pages...\n`);

const results = { ok: [], notFound: [], err: [] };

async function testPage(page) {
    return new Promise((resolve) => {
        const url = `https://polomimin.shop/${page}`;
        const req = https.get(url, { timeout: 10000 }, (res) => {
            if (res.statusCode === 200) {
                results.ok.push(page);
            } else if (res.statusCode === 404) {
                results.notFound.push(page);
            } else {
                results.err.push(`${page} (${res.statusCode})`);
            }
            resolve();
        });
        req.on('error', (e) => {
            results.err.push(`${page} (${e.code || 'ERR'})`);
            resolve();
        });
        req.on('timeout', () => {
            req.destroy();
            results.err.push(`${page} (timeout)`);
            resolve();
        });
    });
}

(async () => {
    const BATCH = 10;
    for (let i = 0; i < pages.length; i += BATCH) {
        const batch = pages.slice(i, i + BATCH);
        await Promise.all(batch.map(testPage));
        process.stdout.write(`.`);
    }
    console.log('\n');

    console.log('=== RESULTS ===');
    console.log(`✅ OK (200):      ${results.ok.length}/${pages.length}`);
    console.log(`❌ 404:           ${results.notFound.length}`);
    console.log(`❌ Other errors:  ${results.err.length}`);

    if (results.notFound.length > 0) {
        console.log('\n=== 404 PAGES ===');
        results.notFound.forEach(p => console.log(`  - ${p}`));
    }
    if (results.err.length > 0) {
        console.log('\n=== ERR PAGES ===');
        results.err.forEach(p => console.log(`  - ${p}`));
    }
})();
