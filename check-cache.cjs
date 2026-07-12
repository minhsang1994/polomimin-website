const https = require('https');
const ts = Date.now();
https.get('https://polomimin.shop/01-home.html?t=' + ts, { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Cache-Control:', res.headers['cache-control']);
    console.log('CF-Cache-Status:', res.headers['cf-cache-status']);
    console.log('X-Cache:', res.headers['x-cache']);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const matches = (data.match(/MOBILE RESPONSIVE/g) || []).length;
        console.log('MOBILE RESPONSIVE matches:', matches);
    });
});
