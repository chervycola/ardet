// ═══════════════════════════════════════
// СЦЕНА ТЕАТРА ТЕНЕЙ — шаг 1 (weave/SCENE_STAGE_2026-11-22.md «Зал полон», §1а «Дыхание»).
// Прочитавший «СЦЕНУ» может сесть перед сценой театра в городке; кадр встаёт (render/camera.js
// hold). На дальнем краю сцены — человек с фонарём. Вдох: он поднимает фонарь, свет идёт вверх
// по ярусам, и зал встаёт из пыли — полный, головы к сидящему (призрачная дрожь, render/ghost.js,
// одно зерно на весь зал; рисует sprites/locations/canon.js draw_theater). Задержка, под конец
// поднимает фонарь выше — всматривается. Выдох: фонарь опускается, зал оседает следами.
// Длина — 30 с; каждый следующий приход короче (×0,85), с седьмого — 12 с навсегда; номер растёт
// при посадке, копить нечего. Приход — пока не отошёл от театра дальше 420 точек (как у кота);
// сел снова в тот же приход — зал тёмный, фонарь у ног. После конца — ничего нового (таблица покоя
// §4). За бумагой часы сцены ждут; в красный полдень фонарь не поднимают. Встал раньше — зал
// оседает за четверть секунды. «Квадрат» (тени обходят центр) — со второго шага, в декорации.
// ═══════════════════════════════════════
import { wasUsed } from './relook.js';

// середина сцены: место театра (world/locations.js, уже в мировых координатах) + sprites canon TH (cx 40, cy 50);
// ступни сидящего: перед сценой, ниже лицевой кладки — тени труппы над его капюшоном видны
export const STAGE_C = { x: 0, y: 0 }, SEAT = { x: 0, y: 0 };
export function placeStage(loc) {
  STAGE_C.x = loc.x + 40; STAGE_C.y = loc.y + 50;
  SEAT.x = loc.x + 42; SEAT.y = loc.y + loc.h + 17;   // первая свободная строка под телом театра (оно твёрдое)
}
placeStage({ x: 480, y: 200, w: 80, h: 60 });   // до проводки (проверки) — по содержимому городка
const AWAY = 420;              // отошёл дальше — приход кончился
const LEAD = 120;              // две секунды фонарь у ног
const SETTLE = 15;             // встал раньше — зал оседает за четверть секунды
// длина прихода в шагах (60 в секунду): 30 с, ×0,85, не короче 12 с
export const lenOf = n => Math.max(720, Math.round(1800 * Math.pow(0.85, Math.max(1, n) - 1)));

export const stage = { seated: false, n: 0, clock: 0, live: false, away: true, near: false, settle: 0, from: 0 };

// сесть у театра (строка меню «СЕСТЬ», ui.js sitNow) — когда «СЦЕНА» прочитана хоть раз
export const stageAlt = () => (wasUsed('theater') ? { key: 'stage_sit', label: '<i>⌂</i>СЕСТЬ' } : null);

// сел: новый приход — сцена с начала; тот же приход — тёмный зал
export function sitStage() {
  if (stage.seated) return stage.live;          // уже сидит — идущий приход не гасить
  stage.seated = true; stage.settle = 0;
  if (stage.away) { stage.away = false; stage.n++; stage.clock = 0; stage.live = true; }
  else stage.live = false;
  return stage.live;
}
// встал: что светилось — оседает быстро
export function standStage() {
  if (!stage.seated) return;
  const l = lightOf();
  stage.seated = false; stage.live = false;
  if (l > 0.01) { stage.settle = SETTLE; stage.from = l; }
}

// свет фонаря по часам прихода: 0 — у ног, 1 — зал полон («Дыхание»: вдох, задержка, выдох)
function phase() {
  const L = lenOf(stage.n), c = stage.clock, I = Math.round(L * 0.2), E = Math.round(L * 0.2);
  if (c < LEAD) return { light: 0, lift: 0 };
  if (c < LEAD + I) { const k = (c - LEAD) / I; return { light: k * k * (3 - 2 * k), lift: Math.min(1, k * 1.5) }; }
  const exhale = L - LEAD - E;
  if (c < exhale) return { light: 1, lift: c >= exhale - LEAD ? 1.4 : 1 };          // под конец — выше: всматривается
  if (c < L - LEAD) { const k = (c - exhale) / E; return { light: 1 - k * k * (3 - 2 * k), lift: Math.max(0, 1 - k * 1.5) }; }
  return { light: 0, lift: 0 };
}
function lightOf() { return stage.seated && stage.live ? phase().light : stage.settle > 0 ? stage.from * stage.settle / SETTLE : 0; }

// шаг мира; free — на мир смотрят (не за бумагой), noon — красный полдень.
// Возвращает 'inhale' / 'exhale' в шаг, когда сцена вдыхает и выдыхает (звук — main.js)
export function stepStage(fx, fy, free = true, noon = false) {
  if (stage.settle > 0) stage.settle--;
  stage.near = Math.hypot(fx - STAGE_C.x, fy - STAGE_C.y) <= AWAY;
  if (!stage.seated) {
    if (!stage.near) stage.away = true;
    return null;
  }
  if (!stage.live || !free || noon) return null;                 // за бумагой и в полдень часы ждут
  const L = lenOf(stage.n), E = Math.round(L * 0.2);
  stage.clock++;
  const c = stage.clock;
  if (c >= L) { stage.live = false; return null; }               // отыграно: дальше ничего нового
  if (c === LEAD) return 'inhale';
  if (c === L - LEAD - E) return 'exhale';
  return null;
}

// что рисовать (sprites/locations/canon.js draw_theater). Человек с фонарём живой: он у дальнего края,
// пока странник рядом с театром и «СЦЕНА» прочитана (появляется под бумагой, не на глазах); зал —
// только сидящему. noon — сила красного полудня 0..1: фонарь опускают и зал гаснет вместе с ним
export function stageView(noon = 0) {
  const k = Math.max(0, Math.min(1, +noon || 0));
  const on = stage.seated || stage.settle > 0 || (stage.near && wasUsed('theater'));
  if (!on) return null;
  const p = stage.seated && stage.live ? phase() : { light: 0, lift: 0 };
  return { light: lightOf() * (1 - k), lift: k > 0.5 ? 0 : p.lift, seated: stage.seated };
}

// сохранение: номер прихода, в котором садились (по нему — длина следующего)
export const saveStage = () => ({ n: stage.n });
export function loadStage(d) { stage.n = d && Number.isFinite(d.n) ? Math.max(0, d.n | 0) : 0; stage.away = true; stage.seated = false; stage.live = false; }
export function _resetStage() { Object.assign(stage, { seated: false, n: 0, clock: 0, live: false, away: true, near: false, settle: 0, from: 0 }); }
