// Сервер для холодного прогона (weave/TROPA §9, weave/DEPLOY «Холодный читатель»): отдаёт собранный
// site/ с настоящим 404 — на любой адрес, которого нет, страницу 404.html кодом 404, как хостинг с
// ErrorDocument. Сначала `npm run site`, затем `node prototype/walk/serve.mjs [порт]` (по умолчанию 8766).
// Как и хостинг без перенаправления, `/walk` без косой черты отдаёт 404; с чертой — вход в мир текстом.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../site');
const PORT = Number(process.argv[2]) || 8766;
const TYPES = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon' };
if (!fs.existsSync(path.join(ROOT, 'index.html'))) { console.error('нет site/index.html — сначала npm run site'); process.exit(1); }
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.normalize(path.join(ROOT, p));
  if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); }
  else { res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); fs.createReadStream(path.join(ROOT, '404.html')).pipe(res); }
}).listen(PORT, '127.0.0.1', () => console.log(`site on http://127.0.0.1:${PORT}/`));
