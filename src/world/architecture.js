// ═══════════════════════════════════════
// АРХИТЕКТУРА ЭПОХ — постройки колец вместо титров: эпоху и часть света
// читают по силуэтам (решение автора). Модули колец — src/sprites/arch/;
// здесь — раскладка ансамблями, а не поштучно:
//  · ворота — пара построек по сторонам тропы: идёшь из городка наружу
//    и проходишь эпохи, как заставы;
//  · двор — постройки позади сцены табличек: таблички становятся вещами
//    чьего-то двора;
//  · посёлок — равнина (СНГ) на дуге северо-восточного угла.
// Между ансамблями — пустой перегон. Всё детерминированно.
// ═══════════════════════════════════════
import { ARCH_BY_RING } from '../sprites/arch/index.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { TOWN, RING_W, RINGS, warpedDist, trailPoint } from './disc.js';
import { ARCH_LOOKS } from '../content/arch_looks.js';

function h01(n) { const v = Math.sin(n * 127.13 + 7.7) * 43758.5453; return v - Math.floor(v); }

const BAND_MARGIN = 36;   // основание — вне шашки на рваной границе колец
const GAP = 10;           // между постройками
const NEAR = 360;         // радиус, в котором соседи вообще интересны

// ── проверки места ──
function inBand(n, x, y) {
  const d = warpedDist(x, y);
  return d > (n - 1) * RING_W + BAND_MARGIN && d < n * RING_W - BAND_MARGIN;
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

// ── раскладка ──
// поворот видов по кольцу: у соседних колец ансамбли начинаются с разного
function kindsFor(arch, side, n) {
  const ks = arch[side] || [];
  if (!ks.length) return ks;
  const r = n % ks.length;
  return ks.slice(r).concat(ks.slice(0, r));
}

// стоит ли постройка b здесь: кольцо, таблички, соседи, тропа
function fits(n, side, b, signs, placed) {
  if (!baseOK(n, b)) return false;
  // городок вне времени не застраивают: силуэт — снаружи
  if (b.x + b.w / 2 > TOWN.x0 - 4 && b.x - b.w / 2 < TOWN.x1 + 4
    && b.gy > TOWN.y0 - 4 && b.gy - b.h < TOWN.y1 + 4) return false;
  for (const s of signs) if (signClash(b, s)) return false;
  for (const o of placed) {
    if (Math.abs(o.x - b.x) > NEAR || Math.abs(o.gy - b.gy) > NEAR) continue;
    if (boxClash(b, o) || porchClash(b, o) || porchClash(o, b)) return false;
  }
  return !trailClash(side, b);
}

function nearSigns(signs, x, y) {
  return signs.filter(s => Math.abs(s.x - x) < NEAR && Math.abs(s.y - y) < NEAR);
}

// ворота юга/севера: тропа вертикальна — постройки слева и справа от неё
function gateNS(n, side, kinds, signs, placed) {
  const A = kinds[0], B = kinds[1] || kinds[0];
  for (const D of [100, 88, 112, 76, 124, 64, 136, 52, 148]) {
    for (const gap of [18, 28, 40, 56, 76]) {
      const d = (n - 1) * RING_W + D;
      const p = trailPoint(side, d);
      const st = Math.round((h01(n * 7 + D) - 0.5) * 18);     // ворота не по линейке
      const a = { x: Math.round(p.x - gap - A.w / 2), gy: Math.round(p.y + st), w: A.w, h: A.h, kind: A };
      const b = { x: Math.round(p.x + gap + B.w / 2), gy: Math.round(p.y - st), w: B.w, h: B.h, kind: B };
      const near = nearSigns(signs, p.x, p.y);
      const okA = fits(n, side, a, near, placed);
      const okB = okA && fits(n, side, b, near, [...placed, a]);
      if (okA && okB) return [a, b];
    }
  }
  return [];
}

// ворота запада/востока: тропа горизонтальна — бок о бок по северной
// обочине, а если не помещаются — улицей по обе стороны тропы
function gateWE(n, side, kinds, signs, placed) {
  const A = kinds[0], B = kinds[1] || kinds[0];
  const xAt = d => side === 'east' ? TOWN.x1 + d : TOWN.x0 - d;
  const dOf = x => side === 'east' ? x - TOWN.x1 : TOWN.x0 - x;
  // тропа на ширине постройки: самая высокая и самая низкая точки
  const span = (x, w) => {
    let lo = Infinity, hi = -Infinity;
    for (let xx = x - w / 2 - 6; xx <= x + w / 2 + 6; xx += 4) {
      const ty = trailPoint(side, Math.max(0, dOf(xx))).y;
      lo = Math.min(lo, ty); hi = Math.max(hi, ty);
    }
    return [lo, hi];
  };
  const tries = [];
  for (const [Da, Db] of [[58, 136], [50, 124], [68, 146], [44, 112]]) tries.push({ Da, Db, row: true });
  for (const [Da, Db] of [[96, 104], [84, 116], [108, 92], [72, 128], [120, 80]]) tries.push({ Da, Db, row: false });
  for (const tr of tries) {
    for (const lift of [0, 10, 22]) {
      const xa = Math.round(xAt((n - 1) * RING_W + tr.Da)), xb = Math.round(xAt((n - 1) * RING_W + tr.Db));
      const a = { x: xa, gy: Math.round(span(xa, A.w)[0] - 12 - lift), w: A.w, h: A.h, kind: A };
      let b;
      if (tr.row) {
        if (Math.abs(xa - xb) < (A.w + B.w) / 2 + GAP) continue;
        b = { x: xb, gy: Math.round(span(xb, B.w)[0] - 12 - lift - h01(n * 3 + tr.Da) * 8), w: B.w, h: B.h, kind: B };
      } else {
        b = { x: xb, gy: Math.round(span(xb, B.w)[1] + 12 + lift + B.h), w: B.w, h: B.h, kind: B };
      }
      const near = nearSigns(signs, (xa + xb) / 2, a.gy);
      if (fits(n, side, a, near, placed) && fits(n, side, b, near, [...placed, a])) return [a, b];
    }
  }
  return [];
}

// двор: постройки встают позади сцены табличек (или рядом), бок о бок
// вид для двора: не повторять соседа — дальше всего от такой же постройки
// одинаковые постройки в один кадр (640×360 мира) не попадают даже краем:
// пустой перегон лучше двойника
const FRAME_W = 640, FRAME_H = 360;
function kindOrder(kinds, used, anchor, placed) {
  const fresh = kinds.filter(k => !used.includes(k));
  const pool = fresh.length ? fresh : kinds.slice();
  const dist = k => {
    let d = Infinity;
    for (const o of placed) if (o.kind === k) d = Math.min(d, Math.hypot(o.x - anchor.x, o.gy - anchor.gy));
    return d;
  };
  return pool.map((k, i) => ({ k, d: dist(k), i })).sort((a, b) => (b.d - a.d) || (a.i - b.i)).map(o => o.k);
}
function sameNear(b, placed) {
  return placed.some(o => o.kind === b.kind
    && Math.abs(o.x - b.x) < FRAME_W + (o.w + b.w) / 2 - 30
    && Math.abs(o.gy - b.gy) < FRAME_H + (o.h + b.h) / 2 - 30);
}

function yard(n, side, kinds, count, anchor, signs, placed, twins = false) {
  const out = [];
  const near = nearSigns(signs, anchor.x, anchor.gy);
  for (let i = 0; i < count; i++) {
    const all = [...placed, ...out];
    let done = false;
    const used = out.map(o => o.kind);
    // двойняшки: лишний дом — копия первого (одинаковые дома в одинаковых дворах)
    const order = twins && kinds.every(k => used.includes(k)) ? kinds : kindOrder(kinds, used, anchor, all);
    for (const K of order) {
      const cands = [];
      const prev = out[out.length - 1];
      if (prev) {
        // рядом с предыдущей — слева или справа, чуть вглубь или вперёд
        for (const dir of [1, -1]) for (const gap of [GAP + 2, GAP + 12, GAP + 26]) for (const dy of [0, -10, 10, -22, 18]) {
          const dx = dir * (prev.w / 2 + gap + K.w / 2);
          // на дуге равнины соседи идут вдоль кольца — наискось
          const tilt = anchor.slope ? dx * anchor.slope : 0;
          cands.push({ x: prev.x + dx, gy: prev.gy + tilt + dy, s: gap + Math.abs(dy) + (dir < 0 ? 4 : 0) });
        }
      }
      // вокруг якоря: позади сцены — предпочтительно
      for (let dy = -96; dy <= 36; dy += 6) {
        for (let dx = -168; dx <= 168; dx += 12) {
          cands.push({ x: anchor.x + dx, gy: anchor.gy + dy, s: 40 + Math.abs(dx) * 0.8 + Math.abs(dy - anchor.pref) * 1.4 });
        }
      }
      cands.sort((p, q) => p.s - q.s);
      for (const c of cands) {
        const b = { x: Math.round(c.x), gy: Math.round(c.gy), w: K.w, h: K.h, kind: K };
        if (!twins && sameNear(b, all)) continue;
        if (fits(n, side, b, near, all)) { out.push(b); done = true; break; }
      }
      if (done) break;
    }
  }
  return out;
}

// сцены табличек кольца на стороне: группы по ходу стороны
function signScenes(signs, n, side) {
  const mine = signs.filter(s => s.streetSeg === n && s.streetSide === side);
  if (!mine.length) return [];
  const key = s => (side === 'south' || side === 'north') ? s.x + s.w / 2 : s.y + s.h;
  mine.sort((a, b) => key(a) - key(b));
  const groups = [[mine[0]]];
  for (let i = 1; i < mine.length; i++) {
    if (key(mine[i]) - key(mine[i - 1]) > 140) groups.push([]);
    groups[groups.length - 1].push(mine[i]);
  }
  return groups.map(g => {
    const xs = g.map(s => s.x + s.w / 2), gys = g.map(s => s.y + s.h);
    return { signs: g, x: (Math.min(...xs) + Math.max(...xs)) / 2, top: Math.min(...gys), bottom: Math.max(...gys) };
  });
}

// signs — табличные локации мира: [{x, y, w, h, streetSeg, streetSide}]
export function buildEnsembles(signs = []) {
  const buildings = [], ensembles = [];
  const add = (n, side, kind, members, extra = {}) => {
    if (!members.length) return;
    const seg = SEGMENTS[n - 1];
    const id = ensembles.length;
    const idx = [];
    for (const m of members) {
      idx.push(buildings.length);
      buildings.push({ x: m.x, gy: m.gy, w: m.w, h: m.h, kind: m.kind, draw: m.kind.draw, name: m.kind.name,
        ring: n, side, ens: id, look: ARCH_LOOKS[`${seg.id}:${side}:${m.kind.name}`] || null });
    }
    ensembles.push({ id, ring: n, ringId: seg.id, side, kind, members: idx, ...extra });
  };

  for (let n = 1; n <= RINGS; n++) {
    const seg = SEGMENTS[n - 1];
    const arch = ARCH_BY_RING[seg.id];
    if (!arch) continue;
    for (const side of ['south', 'north', 'west', 'east']) {
      const kinds = kindsFor(arch, side, n);
      if (!kinds.length) continue;
      // ворота у тропы
      const mid = (n - 1) * RING_W + 100;
      let gate = (side === 'south' || side === 'north' ? gateNS : gateWE)(n, side, kinds, signs, buildings);
      if (!gate.length) {
        // у тропы сцена табличек — ворота встают за ней, как двор у дороги
        const p = trailPoint(side, mid);
        gate = yard(n, side, kinds, 2, { x: p.x, gy: p.y, pref: -36 }, signs, buildings);
      }
      add(n, side, 'gate', gate, { trail: trailPoint(side, mid) });

      // дворы за сценами табличек: дальние от тропы — первыми
      const tp = trailPoint(side, mid);
      const along = p => (side === 'south' || side === 'north') ? p.x : p.gy;
      const scenes = signScenes(signs, n, side)
        .sort((a, b) => Math.abs(along({ x: b.x, gy: b.top }) - along({ x: tp.x, gy: tp.y }))
          - Math.abs(along({ x: a.x, gy: a.top }) - along({ x: tp.x, gy: tp.y })));
      const big = side === 'south' || side === 'north';
      const sizes = big ? [Math.min(3, Math.max(2, kinds.length)), 1] : [kinds.length > 2 ? 2 : 1];
      const yk = kinds.slice(2).concat(kinds.slice(0, 2));   // во двор — третий вид, если есть
      for (let i = 0; i < sizes.length; i++) {
        let anchor;
        if (scenes[i]) {
          anchor = { x: scenes[i].x, gy: scenes[i].top, pref: -40 };
        } else {
          // сцены нет — двор на пустом перегоне, по другую сторону от ворот
          const a = 0.22 + 0.56 * (h01(n * 11 + i * 5 + side.length) > 0.5 ? 1 : 0);
          const D = (n - 1) * RING_W + 100;
          if (side === 'south') anchor = { x: TOWN.x0 + a * (TOWN.x1 - TOWN.x0), gy: TOWN.y1 + D, pref: 0 };
          else if (side === 'north') anchor = { x: TOWN.x0 + a * (TOWN.x1 - TOWN.x0), gy: TOWN.y0 - D, pref: 0 };
          else if (side === 'east') anchor = { x: TOWN.x1 + D, gy: TOWN.y0 + a * (TOWN.y1 - TOWN.y0), pref: 0 };
          else anchor = { x: TOWN.x0 - D, gy: TOWN.y0 + a * (TOWN.y1 - TOWN.y0), pref: 0 };
        }
        const rot = yk.slice(i).concat(yk.slice(0, i));
        const members = yard(n, side, rot, sizes[i], anchor, signs, buildings);
        add(n, side, 'yard', members, { signs: scenes[i] ? scenes[i].signs.map(s => s.id) : [], trail: tp });
      }
    }
    // равнина — посёлок на дуге северо-восточного угла
    const kinds = kindsFor(arch, 'plain', n);
    if (kinds.length) {
      // в неоне панельки двойняшки — микрорайон одинаковых домов
      const count = kinds.length + (seg.id === 'neon' ? 1 : 0);
      const r = (n - 1) * RING_W + 100, ang = (0.42 + h01(n * 9) * 0.16) * Math.PI / 2;
      const anchor = { x: TOWN.x1 + r * Math.cos(ang), gy: TOWN.y0 - r * Math.sin(ang), pref: 0, slope: Math.cos(ang) / Math.sin(ang) };
      const members = yard(n, 'plain', kinds, count, anchor, signs, buildings, seg.id === 'neon');
      add(n, 'plain', 'plain', members, { trail: null });
    }
  }
  // повтор вида на той же стороне — зеркально: «такой же», а не копия.
  // Двойняшки одного двора — нет: одинаковые дома одинаковы до последнего окна
  const seen = new Map();
  for (const b of buildings) {
    const k = `${b.ring}:${b.side}:${b.name}`;
    const prev = seen.get(k) || [];
    b.flip = prev.length % 2 === 1 && !prev.some(o => o.ens === b.ens);
    seen.set(k, [...prev, b]);
  }
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
export function archLocations(decor) {
  return decor.map((d, i) => {
    const fh = Math.max(6, Math.min(14, Math.round(d.h * 0.3)));
    const fw = Math.round(d.w * 0.84);
    return {
      id: `ar_${i}`, name: d.name, zone: 'street',
      x: Math.round(d.x - d.w / 2), y: Math.round(d.gy - d.h), w: d.w, h: d.h,
      look: d.look || d.name,
      archDraw: d.draw, archX: Math.round(d.x), archGy: Math.round(d.gy),
      archRing: d.ring, archSide: d.side, archEns: d.ens, archFlip: !!d.flip,
      solidBox: { x: Math.round(d.x - fw / 2), y: Math.round(d.gy - fh), w: fw, h: fh },
    };
  });
}
