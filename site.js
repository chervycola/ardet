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

let bytes = 0;
const list = [];
const put = (src, dst) => {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  fs.chmodSync(dst, 0o644);                    // хостинг отдаёт только читаемое всеми
  const n = fs.statSync(dst).size;
  bytes += n; list.push([path.relative(OUT, dst), n]);
};
for (const p of PAGES) put(path.join('build', p), path.join(OUT, p));
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
