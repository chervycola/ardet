#!/usr/bin/env node
// ═══════════════════════════════════════
// ОХОТНИК · харнесс честного игрока
// Тело для модели, которая играет в ardet: видит то же, что игрок, и
// делает то же, что игрок. Модель — любая: харнесс говорит построчным
// JSON (stdin → stdout) и ничего не знает о том, кто им управляет.
//
//   node hunt/harness.mjs [--url <адрес игры>] [--out <папка прогона>] [--headed] [--serve <порт>]
//   (--serve: вместо stdin — HTTP на 127.0.0.1, одно действие на запрос; клиент — hunt/act.mjs)
//
// По умолчанию — локальная сборка build/index.html в режиме ?stream.
// Каждая строка на вход — одно действие, на выход — одно наблюдение:
//   {"do":"observe"}                          — просто посмотреть
//   {"do":"walk","dir":"up|down|left|right","ms":800,"sprint":false}
//   {"do":"key","key":"m","ms":100}            — нажать клавишу (m — карта, Escape — назад)
//   {"do":"click","x":480,"y":300}            — клик по экрану (подойти, осмотреть)
//   {"do":"menu","action":"look|use|talk|cancel"} — кнопка в открытом меню
//   {"do":"type","text":"help"}               — набрать в терминале и нажать Enter
//   {"do":"next"}                             — листать открытый текст / закрыть
//   {"do":"quit"}
// Наблюдение: {"step","shot","panel","menu","tally","t"} — путь к скриншоту,
// текст открытой панели (осмотр, диалог, терминал — то, что на экране),
// кнопки открытого меню, строка счёта канцелярии.
//
// Чего харнесс не умеет нарочно: телепортироваться, читать код, реестр
// находок, сохранения и состояние игры. Только экран и клавиши.
// ═══════════════════════════════════════
import { createInterface } from 'node:readline';
import { mkdirSync, appendFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const URL_ = arg('--url', pathToFileURL(resolve(here, '../build/index.html')).href + '?stream');
const OUT = resolve(arg('--out', join('hunt-runs', new Date().toISOString().replace(/[:.]/g, '-'))));
const HEADED = process.argv.includes('--headed');

let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  try {   // установленный глобально: ARDET_PLAYWRIGHT=<путь к пакету playwright>
    const { createRequire } = await import('node:module');
    ({ chromium } = createRequire(resolve(process.env.ARDET_PLAYWRIGHT || '.', 'index.js'))('playwright'));
  } catch { console.error('нужен playwright: npm i playwright && npx playwright install chromium'); process.exit(1); }
}

mkdirSync(OUT, { recursive: true });
const log = (o) => appendFileSync(join(OUT, 'log.jsonl'), JSON.stringify({ ts: Date.now(), ...o }) + '\n');

const browser = await chromium.launch({
  headless: !HEADED,
  ...(process.env.ARDET_CHROMIUM ? { executablePath: process.env.ARDET_CHROMIUM } : {}),
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', e => log({ pageerror: e.message }));

await page.goto(URL_);
await page.waitForTimeout(1500);
await page.click('#entry-btn').catch(() => {});
await page.waitForTimeout(600);
await page.click('#howto').catch(() => {});
await page.waitForTimeout(17000);       // вступление идёт само; его не пропустить

const DIRS = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
let step = 0;

// только видимое: открытые панели и меню
async function observe() {
  step++;
  const shot = join(OUT, String(step).padStart(4, '0') + '.png');
  await page.screenshot({ path: shot });
  const seen = await page.evaluate(() => {
    const vis = el => el && el.classList.contains('on');
    const txt = id => { const el = document.getElementById(id); return el ? el.innerText.trim() : ''; };
    let panel = '';
    if (vis(document.getElementById('look'))) panel = txt('lt') + '\n' + txt('lb');
    else if (vis(document.getElementById('dlg'))) panel = txt('dn') + '\n' + txt('dt') + '\n' + txt('do');
    else if (vis(document.getElementById('term'))) panel = txt('to').split('\n').slice(-24).join('\n');
    const m = document.getElementById('menu');
    const menu = vis(m) ? [...m.querySelectorAll('[data-a]')]
      .filter(b => getComputedStyle(b).display !== 'none')
      .map(b => ({ action: b.dataset.a, label: b.innerText.trim() })) : [];
    const tally = document.getElementById('stream-tally');
    return { panel, menu, tally: tally ? tally.innerText.trim() : '' };
  });
  return { step, shot, ...seen, t: Date.now() };
}

async function act(cmd) {
  switch (cmd.do) {
    case 'walk': {
      const k = DIRS[cmd.dir]; if (!k) throw new Error('dir: up|down|left|right');
      if (cmd.sprint) await page.keyboard.down('Shift');
      await page.keyboard.down(k); await page.waitForTimeout(Math.min(5000, cmd.ms || 600));
      await page.keyboard.up(k); if (cmd.sprint) await page.keyboard.up('Shift');
      break;
    }
    case 'key':
      await page.keyboard.down(cmd.key); await page.waitForTimeout(cmd.ms || 100); await page.keyboard.up(cmd.key);
      break;
    case 'click':                         // клик — подойти; ждём, пока дойдёт и откроется меню
      await page.mouse.click(cmd.x, cmd.y);
      await page.waitForFunction(() => document.getElementById('menu').classList.contains('on'),
        null, { timeout: Math.min(15000, cmd.wait || 6000) }).catch(() => {});
      break;
    case 'menu':
      await page.click(`#menu [data-a="${cmd.action}"]`, { timeout: 2000 });
      // терминал сначала загружается — ждём приглашения, как ждал бы игрок
      await page.waitForFunction(() => !document.getElementById('term').classList.contains('on')
        || /ГОТОВ/.test(document.getElementById('to').innerText), null, { timeout: 6000 }).catch(() => {});
      break;
    case 'type': await page.fill('#ti', String(cmd.text || '')); await page.press('#ti', 'Enter'); break;
    case 'next': await page.keyboard.press('Space'); break;
    case 'observe': break;
    default: throw new Error('неизвестное действие: ' + cmd.do);
  }
  await page.waitForTimeout(350);
}

const out = (o) => process.stdout.write(JSON.stringify(o) + '\n');

// одно действие → одно наблюдение; действия идут строго по очереди
let queue = Promise.resolve();
function handle(line) {
  const run = async () => {
    let cmd;
    try { cmd = JSON.parse(line); } catch { return { error: 'не JSON' }; }
    if (cmd.do === 'quit') return { quit: true };
    try { await act(cmd); const o = await observe(); log({ cmd, obs: { ...o, shot: undefined } }); return o; }
    catch (e) { log({ cmd, error: e.message }); return { error: e.message }; }
  };
  return (queue = queue.then(run));
}

const SERVE = arg('--serve', null);
if (SERVE) {
  // сервер: по действию на запрос — для голов, которые ходят по одному шагу (hunt/act.mjs)
  const { createServer } = await import('node:http');
  const srv = createServer((req, res) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      const o = await handle(body || '{"do":"observe"}');
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(o));
      if (o.quit) { srv.close(); await browser.close(); process.exit(0); }
    });
  });
  srv.listen(+SERVE, '127.0.0.1', async () => out({ ready: true, url: URL_, out: OUT, serve: +SERVE, ...(await observe()) }));
} else {
  out({ ready: true, url: URL_, out: OUT, ...(await observe()) });
  const rl = createInterface({ input: process.stdin });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const o = await handle(line);
    if (o.quit) break;
    out(o);
  }
  await browser.close();
}
