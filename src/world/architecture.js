// ═══════════════════════════════════════
// АРХИТЕКТУРА ЭПОХ — постройки колец вместо титров: эпоху и часть света
// читают по силуэтам (решение автора). Модули колец — src/sprites/arch/;
// здесь — раскладка ансамблями по местам клеток (world/sites.js): где в клетке
// стоит место — по истории (год — радиус, прототип — азимут, местность — река,
// путь, холм, дорога); на месте постройки встают позади его табличек, двором.
// Доминанта — своим ансамблем; у дороги стоят только заставы (воротами).
// Между местами — пустой перегон. Всё детерминированно.
// ═══════════════════════════════════════
import { ARCH_BY_RING } from '../sprites/arch/index.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { TOWN, RINGS_D, RING_EDGE, warpedDist, trailPoint } from './disc.js';
import { sideAt } from './relief.js';
import { buildSites } from './sites.js';
import { sectorPoint, ringDepth } from './geoplace.js';
import { idealRiver, idealArcs } from './arteries.js';
import { ARCH_LOOKS } from '../content/arch_looks.js';
import { ARCH_BACKS } from '../content/arch_backs.js';
import { ARCH_WALLS } from '../content/arch_walls.js';
import { hiddenInscriptions } from './inscriptions.js';
import { useTexts } from './useActions.js';
import { ARCH_IDS } from '../content/arch_ids.js';

const BAND_MARGIN = 36;   // основание — вне шашки на рваной границе колец
const GAP = 10;           // между постройками
const NEAR = 360;         // радиус, в котором соседи вообще интересны

// ── проверки места ──
let margin = BAND_MARGIN;
function inBand(n, x, y) {
  const d = warpedDist(x, y);
  return d > RING_EDGE[n - 1] + margin && d < RING_EDGE[n] - margin;
}
// земля под всем основанием — своего кольца (рельеф границ учтён)
function baseOK(n, b) {
  return inBand(n, b.x - b.w / 2 + 3, b.gy) && inBand(n, b.x, b.gy) && inBand(n, b.x + b.w / 2 - 3, b.gy);
}

// табличка — вещь перед глазами: постройка её не заслоняет и не стоит
// у неё на пороге (иначе клик и подход путаются)
function signClash(b, s) {
  const sx = s.x + s.w / 2, sgy = s.y + s.h;
  const dx = Math.abs(sx - b.x);
  if (dx >= b.w / 2 + 20) return false;                        // в стороне
  if (sgy <= b.gy - b.h - 2) return false;                      // позади, над крышей
  if (sgy >= b.gy + 24 && (dx >= 22 || sgy >= b.gy + 44)) return false;   // впереди, не на пороге
  return true;
}

function boxClash(a, b) {
  return a.x - a.w / 2 - GAP < b.x + b.w / 2 && b.x - b.w / 2 - GAP < a.x + a.w / 2
    && a.gy - a.h - 4 < b.gy && b.gy - b.h - 4 < a.gy;
}
// порог (подход к двери) — не под чужой стеной
function porchClash(a, b) {
  const px0 = a.x - 12, px1 = a.x + 12, py0 = a.gy, py1 = a.gy + 28;
  return px0 < b.x + b.w / 2 && b.x - b.w / 2 < px1 && py0 < b.gy && b.gy - b.h < py1;
}

// тропа не уходит за стену и не упирается в основание
function trailClash(side, b) {
  if (side === 'plain') return false;
  if (side === 'south' || side === 'north') {
    for (let y = b.gy - b.h; y <= b.gy + 8; y += 4) {
      const d = side === 'south' ? y - TOWN.y1 : TOWN.y0 - y;
      if (d < 0) continue;
      if (Math.abs(trailPoint(side, d).x - b.x) < b.w / 2 + 8) return true;
    }
    return false;
  }
  for (let x = b.x - b.w / 2 - 6; x <= b.x + b.w / 2 + 6; x += 4) {
    const d = side === 'east' ? x - TOWN.x1 : TOWN.x0 - x;
    if (d < 0) continue;
    const ty = trailPoint(side, d).y;
    if (ty > b.gy - b.h - 6 && ty < b.gy + 10) return true;
  }
  return false;
}

// замысел реки и кольцевых дорог (до трассировки): постройка с двором и порогом на линию не
// садится — встаёт у берега, у обочины; иначе трассировщик обходит её через чужое кольцо
let LINE_GRID = null;
function linePts() {
  if (LINE_GRID) return LINE_GRID;
  LINE_GRID = new Map();
  const put = (p, pad) => { const k = Math.floor(p.x / 200) + ',' + Math.floor(p.y / 200); if (!LINE_GRID.has(k)) LINE_GRID.set(k, []); LINE_GRID.get(k).push({ x: p.x, y: p.y, pad }); };
  for (const p of idealRiver()) put(p, 46);
  for (const A of idealArcs()) for (const p of A.pts) put(p, 30);
  return LINE_GRID;
}
function lineClash(b) {
  const G = linePts();
  const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, y0 = b.gy - Math.min(b.h, 40), y1 = b.gy + 30;
  for (let gx = Math.floor((x0 - 60) / 200); gx <= Math.floor((x1 + 60) / 200); gx++) for (let gy = Math.floor((y0 - 60) / 200); gy <= Math.floor((y1 + 60) / 200); gy++) {
    for (const p of G.get(gx + ',' + gy) || []) if (p.x > x0 - p.pad && p.x < x1 + p.pad && p.y > y0 - p.pad * 0.6 && p.y < y1 + p.pad) return true;
  }
  return false;
}

// ── раскладка ──
// стоит ли постройка b здесь: кольцо и сторона под всем основанием, таблички, соседи, тропа
function fits(n, side, b, signs, placed) {
  if (!baseOK(n, b)) return false;
  // своя сторона: швы рваные, у шва постройка не заходит к соседу
  if (sideAt(b.x - b.w / 2 + 3, b.gy) !== side || sideAt(b.x + b.w / 2 - 3, b.gy) !== side) return false;
  // городок вне времени не застраивают: силуэт — снаружи
  if (b.x + b.w / 2 > TOWN.x0 - 4 && b.x - b.w / 2 < TOWN.x1 + 4
    && b.gy > TOWN.y0 - 4 && b.gy - b.h < TOWN.y1 + 4) return false;
  for (const s of signs) if (signClash(b, s)) return false;
  for (const o of placed) {
    if (Math.abs(o.x - b.x) > NEAR || Math.abs(o.gy - b.gy) > NEAR) continue;
    if (boxClash(b, o) || porchClash(b, o) || porchClash(o, b)) return false;
  }
  return !trailClash(side, b) && !lineClash(b);
}

function nearSigns(signs, x, y) {
  return signs.filter(s => Math.abs(s.x - x) < NEAR && Math.abs(s.y - y) < NEAR);
}

// одинаковые постройки в один кадр (640×360 мира) не попадают даже краем:
// пустой перегон лучше двойника
const FRAME_W = 640, FRAME_H = 360;
function sameNear(b, placed) {
  return placed.some(o => o.kind === b.kind
    && Math.abs(o.x - b.x) < FRAME_W + (o.w + b.w) / 2 - 30
    && Math.abs(o.gy - b.gy) < FRAME_H + (o.h + b.h) / 2 - 30);
}

// копии места — вокруг якоря: позади сцены табличек (pref), рядом с соседом по месту; не нашлось
// рядом — шире; совсем негде — где угодно в своей клетке. twins — одинаковые дома одного двора
function placeCopies(n, side, copies, anchor, signs, placed, twins = false) {
  const out = [];
  // две копии одного места (две мечети одной площади) — рядом: правило кадра для них не действует
  const pair = new Set(copies.filter((c, i) => copies.findIndex(o => o.name === c.name) !== i).map(c => c.name));
  for (const C of copies) {
    const K = C.kind, all = [...placed, ...out.filter(o => !pair.has(o.kind.name))];
    const k = K.landmark ? 2.6 : 1, kx = K.landmark ? 6 : 1;
    let got = null;
    for (let grow = 1; grow <= 4 && !got; grow++) {
      const cands = [];
      const prev = out[out.length - 1];
      if (prev && grow === 1) {
        // рядом с предыдущей — слева или справа, чуть вглубь или вперёд
        for (const dir of [1, -1]) for (const gap of [GAP + 2, GAP + 12, GAP + 26]) for (const dy of [0, -10, 10, -22, 18]) {
          const dx = dir * (prev.w / 2 + gap + K.w / 2);
          cands.push({ x: prev.x + dx, gy: prev.gy + dy, s: gap + Math.abs(dy) + (dir < 0 ? 4 : 0) });
        }
      }
      const st = 6 * grow, sx = 12 * grow;
      for (let dy = -96 * k * grow; dy <= 36 * k * grow; dy += st) {
        for (let dx = -168 * kx * grow; dx <= 168 * kx * grow; dx += sx) {
          cands.push({ x: anchor.x + dx, gy: anchor.gy + dy, s: 40 + Math.abs(dx) * 0.8 + Math.abs(dy - anchor.pref) * 1.4 });
        }
      }
      cands.sort((p, q) => p.s - q.s);
      for (const c of cands) {
        const b = { x: Math.round(c.x), gy: Math.round(c.gy), w: K.w, h: K.h, kind: K, copy: C };
        if (!twins && sameNear(b, all)) continue;
        if (fits(n, side, b, K.landmark || grow > 1 ? signs : nearSigns(signs, b.x, b.gy), [...placed, ...out])) { got = b; break; }
      }
    }
    if (!got) {
      // совсем негде — по всей клетке, ближе к якорю
      const cands = [];
      for (let a = 0.06; a <= 0.941; a += 0.02) for (let r = 0.12; r <= 0.881; r += 0.08) {
        const p = sectorPoint(side, a, ringDepth(n, r));
        cands.push({ x: p.x, gy: p.y, s: Math.hypot(p.x - anchor.x, p.y - anchor.gy) });
      }
      cands.sort((p, q) => p.s - q.s);
      // сначала — не в кадр с таким же; совсем никак — хоть рядом (лучше, чем потерять постройку)
      for (const strict of twins ? [false] : [true, false]) {
        for (const c of cands) {
          const b = { x: Math.round(c.x), gy: Math.round(c.gy), w: K.w, h: K.h, kind: K, copy: C };
          if (strict && sameNear(b, all)) continue;
          if (fits(n, side, b, signs, [...placed, ...out])) { got = b; break; }
        }
        if (got) break;
      }
    }
    if (got) out.push(got);
  }
  return out;
}

// signs — табличные локации мира: [{x, y, w, h, streetSeg, streetSide, streetKey}]
// одинаковые постройки клетки — второй и третий экземпляр со своим текстом: ключ#2, ключ#3
// (осмотр, изнанка, надписи); своего нет — общий
export const archKey = (ringId, side, name, nth = 1) => `${ringId}:${side}:${name}` + (nth > 1 ? '#' + nth : '');
const own = (table, ringId, side, name, nth) => (nth > 1 && table[archKey(ringId, side, name, nth)]) || table[archKey(ringId, side, name)];
const SIDE_PASS = ['south', 'north', 'west', 'east', 'plain'];
const roadNear = (side, x, y) => {
  if (side === 'plain') return null;
  const d = side === 'south' ? y - TOWN.y1 : side === 'north' ? TOWN.y0 - y : side === 'east' ? x - TOWN.x1 : TOWN.x0 - x;
  return trailPoint(side, Math.max(0, d));
};

// места клеток (world/sites.js) → постройки: на месте — копии вокруг якоря позади его табличек;
// доминанта — своим ансамблем, прочие — дворами по три; у дороги (заставы) — воротами
export function buildEnsembles(signs = []) {
  const buildings = [], ensembles = [];
  const byKey = new Map(signs.filter(s => s.streetKey).map(s => [s.streetKey, s]));
  const add = (n, side, kind, members, extra = {}) => {
    if (!members.length) return;
    const seg = SEGMENTS[n - 1];
    const id = ensembles.length;
    const idx = [];
    for (const m of members) {
      idx.push(buildings.length);
      const k = m.copy.nth || 1;
      buildings.push({ x: m.x, gy: m.gy, w: m.w, h: m.h, kind: m.kind, draw: (k > 2 && m.kind.draw3) || (k > 1 && m.kind.draw2) || m.kind.draw, name: m.kind.name,
        ring: n, side, ens: id, nth: k, look: own(ARCH_LOOKS, seg.id, side, m.kind.name, k) || null, site: extra.site ?? null });
    }
    ensembles.push({ id, ring: n, ringId: seg.id, side, kind, members: idx, ...extra });
  };
  const sites = buildSites().filter(S => S.builds.length)
    .sort((p, q) => (p.ring - q.ring) || (SIDE_PASS.indexOf(p.side) - SIDE_PASS.indexOf(q.side)) || (q.builds.some(b => b.kind.landmark) - p.builds.some(b => b.kind.landmark)) || (p.id - q.id));
  for (const S of sites) {
    const n = S.ring, side = S.side, seg = SEGMENTS[n - 1];
    const scene = S.signs.map(it => byKey.get(it.key)).filter(Boolean);
    const anchor = scene.length
      ? { x: scene.reduce((a, l) => a + l.x + l.w / 2, 0) / scene.length, gy: Math.min(...scene.map(l => l.y + l.h)) - 6, pref: -40 }
      : { x: S.x, gy: S.y, pref: 0 };
    const copies = S.builds.slice().sort((p, q) => (q.kind.landmark ? 1 : 0) - (p.kind.landmark ? 1 : 0) || (q.kind.w * q.kind.h - p.kind.w * p.kind.h) || (p.nth - q.nth));
    // в неоне панельки двойняшки — микрорайон одинаковых домов; на узкой диагонали — ближе к шву колец
    const twins = seg.id === 'neon' && copies.filter(c => c.name === 'панельная девятиэтажка').length > 1;
    if (twins) margin = 24;
    const got = placeCopies(n, side, copies, anchor, signs, buildings, twins);
    margin = BAND_MARGIN;
    const ids = scene.map(l => l.id);
    const lm = got.filter(m => m.kind.landmark), rest = got.filter(m => !m.kind.landmark);
    for (const m of lm) add(n, side, 'landmark', [m], { trail: roadNear(side, m.x, m.gy), site: S.id });
    // дворами по три (слева направо); копии одного места — в одном дворе
    rest.sort((a, b) => a.x - b.x);
    const chunks = [];
    for (const m of rest) {
      const same = chunks.find(ch => ch.some(o => o.kind.name === m.kind.name));
      const last = chunks[chunks.length - 1];
      if (same) same.push(m); else if (last && last.length < 3) last.push(m); else chunks.push([m]);
    }
    chunks.forEach((ch, i) => {
      const cx = ch.reduce((a, m) => a + m.x, 0) / ch.length, cy = ch.reduce((a, m) => a + m.gy, 0) / ch.length;
      add(n, side, S.road ? 'gate' : side === 'plain' ? 'plain' : 'yard', ch, { signs: i === 0 ? ids : [], trail: roadNear(side, cx, cy), site: S.id });
    });
  }
  // зеркал нет (слово автора 25.10, weave/ARCH_PLAN.md этап 2): свет у всех слева, повтор вида —
  // свой рисунок #2 (kind.draw2, по осмотру ключ#2) и своё зерно износа, а не отражение
  for (const b of buildings) b.flip = false;
  return { buildings, ensembles };
}

// совместимость: только постройки
export function buildArchitecture(signs = []) {
  return buildEnsembles(signs).buildings;
}

// фасад табличек формы «дом» — по кольцу и стороне
export function signFacade(ringN, side) {
  const seg = SEGMENTS[ringN - 1];
  const arch = seg && ARCH_BY_RING[seg.id];
  return (arch && arch.sign && arch.sign[side]) || null;
}

// Постройки как локации мира: подходишь — осмотр; твёрдое только
// основание (низ силуэта), чтобы высокое можно было обойти сзади.
// номер постройки — постоянный по ключу (content/arch_ids.js): сохранения держатся за постройку,
// а не за порядок раскладки; без строки в реестре — следующий свободный, но только на время
// (тест требует строку: иначе номер сполз бы при следующей новой постройке)
export function archIdsOf(decor) {
  let next = Math.max(-1, ...Object.values(ARCH_IDS)) + 1;
  return decor.map(d => {
    const key = archKey(SEGMENTS[d.ring - 1].id, d.side, d.name, d.nth || 1);
    return Object.prototype.hasOwnProperty.call(ARCH_IDS, key) ? ARCH_IDS[key] : next++;
  });
}
export function archLocations(decor) {
  const ids = archIdsOf(decor);
  return decor.map((d, j) => {
    const i = ids[j];
    // изнанка: обойти постройку; шов — если постройка сама притворство
    const rid = SEGMENTS[d.ring - 1].id;
    const bk = own(ARCH_BACKS, rid, d.side, d.name, d.nth || 1);
    const around = bk && bk.back ? `ar_${i}_around` : null;
    if (around) useTexts[around] = { title: `${d.name} — с изнанки`, text: bk.back };
    const wall = own(ARCH_WALLS, rid, d.side, d.name, d.nth || 1);
    if (wall && wall.length) hiddenInscriptions[`ar_${i}`] = wall;
    const fh = Math.max(6, Math.min(14, Math.round(d.h * 0.3)));
    const fw = Math.round(d.w * 0.84);
    return {
      id: `ar_${i}`, name: d.name, zone: 'street',
      x: Math.round(d.x - d.w / 2), y: Math.round(d.gy - d.h), w: d.w, h: d.h,
      look: d.look || d.name,
      archDraw: d.draw, archX: Math.round(d.x), archGy: Math.round(d.gy),
      archRing: d.ring, archSide: d.side, archEns: d.ens, archFlip: !!d.flip, archNth: d.nth || 1,
      archLife: (d.kind && ((d.nth > 2 && d.kind.life3) || (d.nth > 1 && d.kind.life2) || d.kind.life)) || null,   // у второго и третьего — своя (draw2/life2, draw3/life3)
      ...(around ? { useAction: around } : {}),
      ...(bk && bk.seam && !(d.kind && d.kind.potemkin) ? { potemkin: bk.seam, potemkinTender: !!bk.tender } : {}),
      // у кольца огня постройки закопчены: тем сильнее, чем ближе к огню
      archChar: Math.max(0, Math.min(1, (warpedDist(d.x, d.gy) - (RINGS_D - 130)) / 110)),
      // доминанта: огонь, видный из соседнего кольца; шов подделки; зеркало
      ...(d.kind && d.kind.landmark ? {
        archLandmark: true,
        archLight: d.kind.light || null,
        archMirror: d.kind.mirror || null,
        ...(d.kind.potemkin ? { potemkin: d.kind.potemkin, potemkinTender: !!d.kind.tender } : {}),
      } : {}),
      solidBox: { x: Math.round(d.x - fw / 2), y: Math.round(d.gy - fh), w: fw, h: fh },
    };
  });
}
