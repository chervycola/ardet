#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// ПРОБНИК «МИР ТЕКСТОМ» — городок для читателя без глаз.
// Концепт: docs/research/sandbox-for-visiting-models.md.
//
// Игра идёт на холсте: модель, запросившая страницу, мира не видит.
// Здесь тот же городок собран статическими страницами из тех же модулей
// содержания (looks, relooks, potemkin, whisper, dialogues): ссылка —
// шаг или взгляд. Состояния на сервере нет: что помнить — помнит идущий.
//
//   node prototype/walk/gen.mjs            → prototype/walk/town/*.html
//
// Что перенесено:
//   · первый осмотр — текст вещи как есть;
//   · «осмотреть» ещё раз, не уходя, — следующая станция круга:
//     шов подделки (потёмкинская скорость: неподвижность здесь — это
//     второй взгляд без шага), повторные осмотры, шёпот места; после
//     последней станции круг возвращает первый текст;
//   · разговор — протокол целиком, по порядку реплик;
//   · «рядом» — ближние вещи по карте городка: видно только соседей.
// Что не перенесено: действия с вещами (у них состояние), терминал,
// изнанка, кольца эпох, погода и сутки.
// Вход — дом (первая из двенадцати сцен: не заперто, в журнале ни строки);
// 404 с телом мира ведёт в дом возвращения с бланком под дверью (TROPA §8).
//
// Новых текстов мира здесь нет, кроме служебных строк входа и подписей
// ссылок (нов., на приёмку автору) — они собраны в FRAME ниже.
// В сборку сайта пробник входит папкой walk/ (site.js), 404.html — ещё и в корень.
// ═══════════════════════════════════════════════════════════════════
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ── служебные строки (нов., на приёмку) ──
const FRAME = {
  title: 'ARDET · Дом',
  house: 'дом',
  scene: 'Окна тёмные. Не заперто. В журнале ни строки.',   // первая из двенадцати сцен (BOOK §7)
  errand: 'Пришёл по чужому делу — сначала дело. Уйти можно с любой страницы.',
  near: 'Рядом',
  lost: 'место не установлено',
  notFound: 'Не найдено. Положение изменилось.',
  backHome: '← назад',
  underDoor: 'Под дверью бланк.',
  blank: 'вх. б/н\nпредъявитель.\nсопроводительных нет.\nпринят без рассмотрения.',
  toFire: 'к костру',
  toTerminal: 'к терминалу',
  toOffice: 'окно № 3',
  look: '§ ОСМОТРЕТЬ',          // подпись действия — как в меню игры
  talk: '❦ ГОВОРИТЬ',           // то же
  protocol: 'протокол беседы',  // ART_BIBLE: разговор — протокол
  back: 'к вещи',
  toEntry: 'ко входу',
};
const DIRS = ['к востоку', 'к юго-востоку', 'к югу', 'к юго-западу', 'к западу', 'к северо-западу', 'к северу', 'к северо-востоку'];

// ── заглушки DOM: те же, что в test/*.mjs ──
const noop = () => {};
const storage = new Map();
globalThis.localStorage = { getItem: k => (storage.has(k) ? storage.get(k) : null), setItem: (k, v) => storage.set(k, String(v)), removeItem: k => storage.delete(k), clear: () => storage.clear() };
globalThis.window = { innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1, addEventListener: noop, removeEventListener: noop, visualViewport: null };
const els = new Map();
function fakeEl() { return { style: {}, classList: { add: noop, remove: noop, contains: () => false }, appendChild: noop, removeChild: noop, addEventListener: noop, remove: noop, set innerHTML(v) {}, get innerHTML() { return ''; }, set textContent(v) {}, focus: noop }; }
globalThis.document = { getElementById: id => els.get(id) || (els.set(id, fakeEl()), els.get(id)), createElement: () => fakeEl(), addEventListener: noop, querySelectorAll: () => [], title: 'x', body: fakeEl() };
globalThis.requestAnimationFrame = noop;
globalThis.setTimeout = () => 0;
const grad = () => ({ addColorStop: noop });
const fakeCtx = () => new Proxy({ createLinearGradient: grad, createRadialGradient: grad, measureText: () => ({ width: 10 }) }, { get: (t, k) => (k in t ? t[k] : noop), set: () => true });

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = pathToFileURL(path.resolve(HERE, '../../src') + '/');
const OUT = path.join(HERE, 'town');
const imp = p => import(new URL(p, SRC));

const { setCtx } = await imp('render/context.js');
setCtx(fakeCtx());
const { locations, attachContent } = await imp('world/locations.js');
const { looks } = await imp('content/looks.js');
const { dialogues } = await imp('content/dialogues.js');
attachContent(looks, dialogues);
const { buildHouse, THINGS } = await imp('world/house.js');
buildHouse(locations);   // дом на перекрёстке квартала: снаружи — вещь городка, внутри — вход
const { placeStamp } = await imp('world/placeStamp.js');
const { seamOf } = await imp('world/potemkin.js');
const { RELOOKS } = await imp('content/relooks.js');
const { WHISPERS } = await imp('world/whisper.js');

// ── городок ──
const STAMP = 'городок · вне времени';
const town = locations.filter(l => placeStamp(l) === STAMP && typeof l.look === 'string' && l.look).sort((a, b) => a.id.localeCompare(b.id));
const byId = new Map(town.map(l => [l.id, l]));
const foot = l => ({ x: l.x + (l.w || 0) / 2, y: l.y + (l.h || 0) });
const dist = (a, b) => { const p = foot(a), q = foot(b); return Math.hypot(p.x - q.x, p.y - q.y); };
// север — вверх по карте (world/feedPull.js: N = [0, −1])
const dirOf = (a, b) => { const p = foot(a), q = foot(b); const k = Math.round(Math.atan2(q.y - p.y, q.x - p.x) / (Math.PI / 4)); return DIRS[(k + 8) % 8]; };

// соседи: три ближних + остов (чтобы дойти можно было до всего), в обе стороны
const adj = new Map(town.map(l => [l.id, new Set()]));
const link = (a, b) => { adj.get(a.id).add(b.id); adj.get(b.id).add(a.id); };
for (const a of town) for (const b of town.filter(x => x !== a).sort((x, y) => dist(a, x) - dist(a, y)).slice(0, 3)) link(a, b);
{ // остов Прима
  const inT = new Set([town[0].id]);
  while (inT.size < town.length) {
    let best = null;
    for (const id of inT) for (const b of town) if (!inT.has(b.id)) { const d = dist(byId.get(id), b); if (!best || d < best.d) best = { a: byId.get(id), b, d }; }
    link(best.a, best.b); inT.add(best.b.id);
  }
}

// ── круг взглядов вещи ──
// Первый осмотр — всегда свой текст (канон relook). Дальше, не уходя: шов (как его
// вклеивает world/potemkin.js lookText), повторные осмотры, шёпот. Затем — снова первый.
const HINT = '\n\n— обойти:';
function withSeam(base, seam) { const i = base.indexOf(HINT); return i < 0 ? `${base}\n\n${seam}` : `${base.slice(0, i)}\n\n${seam}${base.slice(i)}`; }
function relookOrder(list) {
  // у стоящего на месте нет ни погоды, ни «дела с вещью»: сперва безусловные, потом по обстановке;
  // помеченные n3 — не раньше третьего взгляда; требующие used — пропускаем (действий здесь нет)
  const left = list.filter(v => !(v.if || []).includes('used')).map((v, i) => ({ v, i, cls: !v.if ? 0 : v.if.every(t => t === 'n3') ? 1 : 2 })).sort((a, b) => a.cls - b.cls || a.i - b.i);
  const out = [];
  let n = 2;
  while (left.length) {
    let k = left.findIndex(o => !((o.v.if || []).includes('n3') && n < 3));
    if (k < 0) k = 0;
    out.push(left.splice(k, 1)[0].v.text); n++;
  }
  return out;
}
function stationsOf(l) {
  const st = [{ kind: 'look', text: l.look }];
  const seam = seamOf(l);
  if (seam) st.push({ kind: 'seam', text: withSeam(l.look, seam) });
  for (const text of relookOrder(RELOOKS[l.id] || [])) st.push({ kind: 'relook', text });
  if (WHISPERS[l.id]) st.push({ kind: 'whisper', text: WHISPERS[l.id] });
  return st;
}
const fileOf = (id, k = 1) => (k === 1 ? `${id}.html` : `${id}.${k}.html`);

// ── страница ──
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const paras = t => t.split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>\n')}</p>`).join('\n');
const CSS = 'pre{font:15px/1.5 "Courier New",monospace;margin:0 0 1em;white-space:pre-wrap}body{margin:0;background:#E8DCC3;color:#3A3026;font:18px/1.55 Georgia,"Times New Roman",serif}main{max-width:34em;margin:0 auto;padding:2.2em 1.2em 4em}.stamp{font:12px/1.4 "Courier New",monospace;letter-spacing:.08em;text-transform:uppercase;color:#8A8D8F;margin:0 0 1.4em}h1{font-size:1.25em;font-weight:normal;letter-spacing:.04em;margin:0 0 1em}p{margin:0 0 1em}.whisper{font-style:italic}nav{margin-top:2.2em;border-top:1px solid #3A3026;padding-top:1em}nav p{margin:0 0 .45em}a{color:#3A3026}a:visited{color:#8A8D8F}.act a{letter-spacing:.06em}blockquote{margin:0 0 1em;padding-left:1em;border-left:2px solid #C23B2B}.en{color:#8A8D8F;font-size:.85em}';
const page = (title, stamp, body, nav) => `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}</style>
</head>
<body>
<main>
<p class="stamp">${esc(stamp)}</p>
${body}
<nav>
${nav}
</nav>
</main>
</body>
</html>
`;
const nearNav = l => [...adj.get(l.id)].map(id => byId.get(id)).sort((a, b) => dist(l, a) - dist(l, b))
  .map(b => `<p>${esc(dirOf(l, b))} — <a href="${fileOf(b.id)}">${esc(b.name)}</a></p>`).join('\n');

// со всякой страницы — ко входу: там сказано, что это за место, и стоят правила дома
const ENTRY = `<p class="stamp" style="margin:1.6em 0 0"><a href="index.html">${FRAME.toEntry}</a></p>`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const files = new Map();
const put = (name, html) => { files.set(name, html); fs.writeFileSync(path.join(OUT, name), html); };

let nSeam = 0, nRelook = 0, nWhisper = 0, nTalk = 0;
for (const l of town) {
  const st = stationsOf(l);
  st.forEach((s, i) => {
    const k = i + 1, next = fileOf(l.id, k === st.length ? 1 : k + 1);
    if (s.kind === 'seam') nSeam++; if (s.kind === 'relook') nRelook++; if (s.kind === 'whisper') nWhisper++;
    const body = `<h1>${esc(l.name)}</h1>\n` + (s.kind === 'whisper' ? `<p class="whisper">${esc(s.text)}</p>` : paras(s.text));
    const acts = [`<p class="act"><a href="${next}">${FRAME.look}</a></p>`];
    if (Array.isArray(l.talkLines) && l.talkLines.length) acts.push(`<p class="act"><a href="${l.id}.talk.html">${FRAME.talk}</a></p>`);
    put(fileOf(l.id, k), page(l.name, STAMP, body, `${acts.join('\n')}\n<p class="stamp" style="margin:1.2em 0 .6em">${FRAME.near}</p>\n${nearNav(l)}\n${ENTRY}`));
  });
  if (Array.isArray(l.talkLines) && l.talkLines.length) {
    nTalk++;
    const body = `<h1>${esc(l.talkName || l.name)}</h1>\n` + l.talkLines.map(t => paras(String(t))).join('\n<p>·</p>\n');
    put(`${l.id}.talk.html`, page(`${l.name} · ${FRAME.protocol}`, `${STAMP} · ${FRAME.protocol}`, body, `<p>${FRAME.back} — <a href="${fileOf(l.id)}">${esc(l.name)}</a></p>\n${ENTRY}`));
  }
}

// вход — дом: сцена и вещи дома как они есть (world/house.js THINGS, ночь; ботинки — у проснувшегося);
// дверь ведёт наружу, к дому как вещи городка (wake_house), оттуда — к соседям
const outside = byId.get('wake_house');
const thing = id => THINGS.find(t => t.id === id);
const houseBody = THINGS.filter(t => t.id !== 'h_door').map(t => `<p>${esc(t.look)}</p>`).join('\n');
const door = `<p class="act"><a href="${fileOf(outside.id)}">${esc(thing('h_door').look)}</a></p>`;
const houseStamp = `${STAMP} · ${FRAME.house}`;
put('index.html', page(FRAME.title, houseStamp,
  `<h1>Дом</h1>\n<p>${esc(FRAME.scene)}</p>\n${houseBody}`,
  `${door}\n<p class="stamp" style="margin:1.6em 0 0">${esc(FRAME.errand)}</p>`));

// дом возвращения — куда ведёт 404: тот же дом, под дверью бланк (полная формула — один раз, здесь)
put('house.return.html', page(FRAME.title, houseStamp,
  `<h1>Дом</h1>\n<p>${esc(FRAME.scene)}</p>\n${houseBody}\n<p>${esc(FRAME.underDoor)}</p>\n<pre>${esc(FRAME.blank)}</pre>`,
  `${door}\n<p class="stamp" style="margin:1.2em 0 .6em">${FRAME.near}</p>\n<p><a href="campfire.html">${FRAME.toFire}</a></p>\n<p><a href="terminal.html">${FRAME.toTerminal}</a></p>\n<p><a href="office.html">${FRAME.toOffice}</a></p>\n${ENTRY}`));

// 404 — на любой адрес, которого нет (сайт отдаёт его настоящим кодом ответа); единственная
// страница без «ко входу»: её ссылка ведёт в дом возвращения. Ссылка абсолютная: страница
// отдаётся с любого пути
put('404.html', page('404', FRAME.lost,
  `<h1>404</h1>\n<p>${esc(FRAME.notFound)}</p>`,
  `<p><a href="/walk/house.return.html">${FRAME.backHome}</a></p>`));

// ── самопроверка: все ссылки ведут на собранные страницы; до всего можно дойти от входа ──
let bad = 0;
const local = h => h.replace(/^\/walk\//, '');                 // 404 ссылается абсолютно
for (const [name, html] of files) for (const m of html.matchAll(/href="([^"]+)"/g)) if (!files.has(local(m[1]))) { bad++; console.error(`битая ссылка: ${name} → ${m[1]}`); }
// входов два: дом и 404 (её отдаёт сервер на любой адрес, которого нет)
const reach = new Set(['index.html', '404.html']); const queue = [...reach];
while (queue.length) for (const m of files.get(queue.pop()).matchAll(/href="([^"]+)"/g)) { const h = local(m[1]); if (!reach.has(h)) { reach.add(h); queue.push(h); } }
const lost = [...files.keys()].filter(f => !reach.has(f));
const bytes = [...files.values()].reduce((a, h) => a + Buffer.byteLength(h), 0);
console.log(`городок текстом: вещей ${town.length}, страниц ${files.size} (${(bytes / 1024).toFixed(0)} КБ) → ${path.relative(process.cwd(), OUT)}/`);
console.log(`  швов ${nSeam}, повторных осмотров ${nRelook}, шёпотов ${nWhisper}, разговоров ${nTalk}`);
console.log(`  соседей у вещи: от ${Math.min(...[...adj.values()].map(s => s.size))} до ${Math.max(...[...adj.values()].map(s => s.size))}`);
if (bad || lost.length) { console.error(`✗ битых ссылок: ${bad}; недостижимых страниц: ${lost.length} ${lost.slice(0, 5).join(', ')}`); process.exit(1); }
console.log('✓ ссылки целы, от входа достижимо всё');
