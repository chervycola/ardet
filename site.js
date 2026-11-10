#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// Папка сайта: build/*.html + assets/** → site/ — ровно то, что лежит
// в корне хостинга ardet.art (weave/DEPLOY.md). Сначала node build.js.
// Картины, музыку и значки игра ищет по путям от страницы: assets/…
// ═══════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const OUT = 'site';
const PAGES = ['index.html', 'mobile.html'];
const MEDIA = /\.(png|jpe?g|webp|gif|svg|mp3|ogg|m4a|wav)$/i;

for (const p of PAGES) {
  if (!fs.existsSync(path.join('build', p))) { console.error(`нет build/${p} — сначала node build.js`); process.exit(1); }
}
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.chmodSync(OUT, 0o755);                      // папки — 755: при umask 077 вышли бы 700, и сервер ответит 403

let bytes = 0;
const list = [];
const put = (src, dst) => {
  if (fs.mkdirSync(path.dirname(dst), { recursive: true }))
    for (let d = path.dirname(dst); d !== OUT && d.startsWith(OUT); d = path.dirname(d)) fs.chmodSync(d, 0o755);
  fs.copyFileSync(src, dst);
  fs.chmodSync(dst, 0o644);                    // хостинг отдаёт только читаемое всеми
  const n = fs.statSync(dst).size;
  bytes += n; list.push([path.relative(OUT, dst), n]);
};
for (const p of PAGES) put(path.join('build', p), path.join(OUT, p));
// мир текстом — для читающих без глаз (prototype/walk, дверь из <noscript> заглавной)
const WALK = path.join('prototype', 'walk', 'town');
if (fs.existsSync(WALK)) for (const f of fs.readdirSync(WALK)) if (/\.html$/.test(f)) put(path.join(WALK, f), path.join(OUT, 'walk', f));
// 404 с телом мира — в корень: хостинг отдаёт её на любой адрес, которого нет (Apache — .htaccess;
// иначе страницу 404 назначают в панели: weave/DEPLOY.md)
if (fs.existsSync(path.join(WALK, '404.html'))) {
  put(path.join(WALK, '404.html'), path.join(OUT, '404.html'));
  fs.writeFileSync(path.join(OUT, '.htaccess'), 'ErrorDocument 404 /404.html\n');
  fs.chmodSync(path.join(OUT, '.htaccess'), 0o644); list.push(['.htaccess', fs.statSync(path.join(OUT, '.htaccess')).size]);
}
// роботам ворота открыты по-настоящему; табличка — из терминала
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n# ворота открыты. табличка висит.\n');
fs.chmodSync(path.join(OUT, 'robots.txt'), 0o644); list.push(['robots.txt', fs.statSync(path.join(OUT, 'robots.txt')).size]);
(function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const s = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(s);
    else if (MEDIA.test(ent.name)) put(s, path.join(OUT, s));
  }
})('assets');

const mb = n => (n / 1048576).toFixed(n < 1048576 ? 2 : 1) + ' МБ';
for (const [f, n] of list) console.log(`  ${f.padEnd(36)} ${mb(n)}`);
console.log(`✓ ${OUT}/: ${list.length} файлов, ${mb(bytes)} — залить содержимое в корень сайта`);
