// ═══════════════════════════════════════
// ЗЕМЛЯ ШТРИХОМ — земля всего мира (и городка) рисуется офортом по рельефу
// (world/relief.js): горизонтали и штриховка ложатся на склоны, отвёрнутые
// от света; освещённое — чистая земля. Свет — из суток (world/sky.js):
//   днём штрих тёмный, тень — краской; свет с солнца ходит по кругу;
//   ночью «костяная штриховка по чёрному» — штрих кости только на склонах
//   к луне, теневые склоны тонут в черноте;
//   к ночи перо исписалось (render/pen.js): полушаг и поперечный штрих редеют.
// Грейд сторон (канон, world_cells): восток — свет выше, штрих тоньше;
// север — штрих реже, тени холоднее; равнина — тени глуше, в МГЛУ;
// юг — пыль киноварью. Краска эпохи прежняя — по ней кольцо узнают;
// шов эпох резкий, по рельефу. Кольцо огня — гарь: штрих наискось, уголья.
// За краем — растр: там брейнрот, а он и есть растр.
// Плитки 128×128 запекаются по мере надобности (две за кадр) и
// перекрашиваются, когда свет повернул (четыре за кадр); кадр — несколько
// десятков готовых плиток вместо тысяч квадратов.
// ═══════════════════════════════════════
import { TOWN, RINGS, warpedDist } from '../world/disc.js';
import { heightAt, sideWarp, sideOf, landDist, landRing, townWarp, townZoneOf, townEdge, OUTER } from '../world/relief.js';
import { SEGMENTS } from '../content/ulitsa_db.js';
import { stampPaths, OV } from './etchPaths.js';
import { stampTown } from './etchTown.js';

export const TILE = 128;
const ST = 4, NS = TILE / ST + 2;            // узлы высот: шаг 4 точки (+ запас справа и снизу)
const WS = 16, NW = TILE / WS + 2;           // узлы швов: шаг 16 (швы плавные, их хватает)
export const DH = 2.4;                       // шаг горизонталей
const BAKE_PER_FRAME = 2, PAINT_PER_FRAME = 4, MAX_TILES = 90;

// ── краски ──
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k].map(Math.round);
const NIGHT = hex('#0D0B0A'), BONE = hex('#D9CFB8'), ASH = hex('#8A8D8F'), MGLA = hex('#3D4A3A'), CINNABAR = hex('#C23B2B');
export const LAND = 1, TOWNK = 2, FIRE = 3, EDGE = 4;

// номера красок: 0..4 — зоны городка; 8 + (кольцо−1)·5 + сторона — земля эпох;
// 56 — гарь кольца огня; 57.. — растр стихий за краем
export const MATS = [];
const mat = (i, o) => { MATS[i] = o; };
{
  // зоны городка — в краски канона (прежние были ядовито-зелёной и сиреневой):
  // лес — мгла, отрава — мгла с пеплом, квартал — каменная пыль, шоссе — щебень
  // с сепией, посёлок — утоптанная земля; фактура зон — render/etchTown.js
  const SEPIA = hex('#3A3026');
  const Z = [mix(NIGHT, MGLA, 0.6), mix(mix(NIGHT, MGLA, 0.55), ASH, 0.1), mix(NIGHT, ASH, 0.24), mix(mix(NIGHT, SEPIA, 0.72), ASH, 0.08), mix(NIGHT, SEPIA, 0.66)];
  Z.forEach((base, i) => {
    mat(i, { kind: TOWNK, base, dark: mix(base, NIGHT, 0.6), soft: mix(base, NIGHT, 0.4),
      lite: mix(base, BONE, 0.2), dust: mix(ASH, base, 0.45), dens: 0.8, liteK: 1, snow: false });
  });
  for (let n = 1; n <= RINGS; n++) {
    const pal = SEGMENTS[n - 1].palette, g = hex(pal.ground), du = hex(pal.dust);
    for (let s = 0; s < 5; s++) {
      let base = g, dark = mix(g, NIGHT, 0.55), soft = mix(g, NIGHT, 0.34), lite = mix(g, BONE, 0.3), dust = du;
      let dens = 1, liteK = 1;
      if (s === 0) { dens = 0.7; dark = mix(dark, ASH, 0.18); }                       // север: реже, тени холоднее
      if (s === 1) dust = mix(du, CINNABAR, 0.35);                                    // юг: пыль киноварью
      if (s === 3) { dens = 0.8; lite = mix(g, BONE, 0.42); liteK = 1.3; }            // восток: свет выше, штрих тоньше
      if (s === 4) { base = mix(g, NIGHT, 0.12); dark = mix(mix(g, NIGHT, 0.5), MGLA, 0.35); }   // равнина: глухо, МГЛА
      mat(8 + (n - 1) * 5 + s, { kind: LAND, base, dark, soft, lite, dust, dens, liteK, snow: s === 0 && n >= 3, ring: n });
    }
  }
  const char = hex('#160a06');
  mat(56, { kind: FIRE, base: char, dark: hex('#0a0503'), soft: mix(char, NIGHT, 0.4), lite: mix(char, CINNABAR, 0.18),
    dust: mix(char, CINNABAR, 0.55), dens: 1, liteK: 1, snow: false });
  // за краем: песок юга, мусор востока, лёд севера (кость, не голубой), токсичное озеро запада
  const edge = (i, h) => mat(i, { kind: EDGE, base: hex(h), dust: BONE });
  edge(57, '#5a4a30'); edge(58, '#4e3f28');
  edge(59, '#221c12'); edge(60, '#2e2618'); edge(61, '#1a160e');
  edge(62, '#D9CFB8'); edge(63, '#c2b9a4');
  edge(64, '#1e3a14'); edge(65, '#254a18');
  edge(66, '#160a06');
}

// быстрый целочисленный разброс (детерминированно)
function ih(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ── плитка: из чего состоит (раз и навсегда) ──
// mat — номер краски; cls — биты: 1 горизонталь, 2 полушаг, 4 поперечный штрих,
// 8 пылинка, 16 снег, 32 уголёк; dir — куда смотрит склон (16 румбов) и крутизна (4)
const Hn = new Float32Array(NS * NS), Hp = new Float32Array((TILE + 1) * (TILE + 1));
const Dn = new Float32Array(NW * NW), SXn = new Float32Array(NW * NW), SYn = new Float32Array(NW * NW);
const ZXn = new Float32Array(NW * NW), ZYn = new Float32Array(NW * NW), TEn = new Float32Array(NW * NW);
const Gb = new Uint8Array(NS * NS);
export function bakeData(tx, ty) {
  const x0 = tx * TILE, y0 = ty * TILE, A = TILE * TILE;
  const m = new Uint8Array(A), c = new Uint8Array(A), dir = new Uint8Array(A), ov = new Uint8Array(A);
  for (let j = 0; j < NS; j++) for (let i = 0; i < NS; i++) Hn[j * NS + i] = heightAt(x0 + i * ST, y0 + j * ST);
  // у кромки городка — живая линия вала (world/relief.js: townEdge), по узлам швов
  const nearEdge = x0 < TOWN.x1 + 140 && x0 + TILE > TOWN.x0 - 140 && y0 < TOWN.y1 + 140 && y0 + TILE > TOWN.y0 - 140
    && !(x0 > TOWN.x0 + 100 && x0 + TILE < TOWN.x1 - 100 && y0 > TOWN.y0 + 100 && y0 + TILE < TOWN.y1 - 100);
  for (let j = 0; j < NW; j++) for (let i = 0; i < NW; i++) {
    const X = x0 + i * WS, Y = y0 + j * WS, k = j * NW + i;
    Dn[k] = warpedDist(X, Y);
    const s = sideWarp(X, Y); SXn[k] = s[0]; SYn[k] = s[1];
    const z = townWarp(X, Y); ZXn[k] = z[0]; ZYn[k] = z[1];
    if (nearEdge) TEn[k] = townEdge(X, Y);
  }
  // склон по клеткам высот: куда падает (на земле — по глубине вдвое) и как круто
  for (let j = 0; j < NS - 1; j++) for (let i = 0; i < NS - 1; i++) {
    const a = Hn[j * NS + i], b = Hn[j * NS + i + 1], cc = Hn[(j + 1) * NS + i], d = Hn[(j + 1) * NS + i + 1];
    const gx = ((b - a) + (d - cc)) / (2 * ST), gy = ((cc - a) + (d - b)) / (4 * ST);
    const s = Math.hypot(gx, gy);
    let bin = Math.round(Math.atan2(-gy, -gx) / (Math.PI * 2) * 16);
    bin = ((bin % 16) + 16) % 16;
    Gb[j * NS + i] = (bin << 2) | (s < 0.12 ? 0 : s < 0.3 ? 1 : s < 0.6 ? 2 : 3);
  }
  // высота в каждой точке — между узлами
  const W1 = TILE + 1;
  for (let py = 0; py <= TILE; py++) {
    const fj = py / ST, j = Math.min(NS - 2, fj | 0), v = fj - j;
    for (let px = 0; px <= TILE; px++) {
      const fi = px / ST, i = Math.min(NS - 2, fi | 0), u = fi - i;
      const a = Hn[j * NS + i], b = Hn[j * NS + i + 1], cc = Hn[(j + 1) * NS + i], d = Hn[(j + 1) * NS + i + 1];
      Hp[py * W1 + px] = a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v;
    }
  }
  for (let py = 0; py < TILE; py++) {
    const y = y0 + py, fj = py / WS, j = fj | 0, v = fj - j, cj = (py / ST) | 0;
    for (let px = 0; px < TILE; px++) {
      const x = x0 + px, k = py * TILE + px;
      const fi = px / WS, i = fi | 0, u = fi - i, q = j * NW + i;
      const h = Hp[py * W1 + px], hr = Hp[py * W1 + px + 1], hd = Hp[(py + 1) * W1 + px];
      const g = Gb[cj * NS + ((px / ST) | 0)];
      dir[k] = g;
      let mt, bits = 0;
      const inTown = nearEdge ? bil(TEn, q, u, v) < 0 : x >= TOWN.x0 && x < TOWN.x1 && y >= TOWN.y0 && y < TOWN.y1;
      if (inTown) {
        mt = townZoneOf(x + bil(ZXn, q, u, v), y + bil(ZYn, q, u, v));
        if (ih(x >> 1, y >> 1, 3) < 0.012) bits |= 32;                     // пепел по городку
      } else {
        const ld = landDist(bil(Dn, q, u, v), h), r = Math.max(1, landRing(ld));   // за живой кромкой — уже первое кольцо
        if (r >= 1 && r <= RINGS) {
          const sd = sideOf(x + bil(SXn, q, u, v), y + bil(SYn, q, u, v));
          mt = 8 + (r - 1) * 5 + sd;
          const hs = ih(x >> 1, y >> 1, 5);
          if (hs < 0.012) bits |= 8;                                       // пылинка 2×2
          else if (MATS[mt].snow && hs > 1 - (0.008 + 0.004 * (r - 2))) bits |= 16;   // снег севера гуще к краю
        } else if (r === RINGS + 1) {
          mt = 56;
          if ((x + 2 * y) % 6 === 0 && ih(x >> 2, y, 7) < 0.7) bits |= 4;   // гарь — штрих наискось
          if (ih(x >> 1, y >> 1, 9) < 0.03) bits |= 32;                      // уголья
        } else {
          mt = edgeMat(x, y, x + bil(SXn, q, u, v), y + bil(SYn, q, u, v), ld);
          if (ih(x >> 1, y >> 1, 13) < 0.04) bits |= 8;                     // блёстки стихии
        }
      }
      m[k] = mt;
      if (MATS[mt].kind === EDGE || MATS[mt].kind === FIRE) { c[k] = bits; continue; }   // гарь и стихии — без горизонталей
      const l0 = Math.floor(h / DH), m0 = Math.floor(h / DH + 0.5);
      if (l0 !== Math.floor(hr / DH) || l0 !== Math.floor(hd / DH)) bits |= 1;
      else if (m0 !== Math.floor(hr / DH + 0.5) || m0 !== Math.floor(hd / DH + 0.5)) bits |= 2;
      else {
        // поперечный штрих: короткие черты вдоль ската, через полосу
        const a = (g >> 2) * Math.PI / 8, cx = -Math.sin(a), cy = Math.cos(a);
        const uu = x * cx + 2 * y * cy;
        if ((((uu % 3) + 3) % 3) < 1 && ((h / DH) % 1 + 1) % 1 < 0.5) bits |= 4;
      }
      c[k] = bits;
    }
  }
  stampPaths(x0, y0, TILE, ov, c);                                     // дороги, река, дуги — поверх
  stampTown(x0, y0, TILE, m, ov);                                      // фактура зон городка — под ними
  return { mat: m, cls: c, dir, ov };
}

const bil = (A, q, u, v) => A[q] + (A[q + 1] - A[q]) * u + (A[q + NW] - A[q]) * v + (A[q] - A[q + 1] - A[q + NW] + A[q + NW + 1]) * u * v;

// за краем: стихия по стороне (шов неровный), узор — растр по 8 точек;
// у кромки огня гарь крошится в стихию
function edgeMat(x, y, wx, wy, ld) {
  const bx = x & ~7, by = y & ~7;
  const f = (ld - OUTER) / 34;                       // гарь крошится в стихию мелким растром
  if (f < 1 && ih(x >> 2, y >> 2, 17) > f) return 66;
  const dn = TOWN.y0 - wy, ds = wy - TOWN.y1, dw = TOWN.x0 - wx, de = wx - TOWN.x1;
  const mm = Math.max(dn, ds, dw, de);
  if (mm === ds) return ((bx + by) % 24 < 12) ? 57 : 58;
  if (mm === de) return 59 + ((((bx * 7 + by * 13) / 8 | 0) % 3) + 3) % 3;
  if (mm === dn) return ((bx - by) % 28 + 28) % 28 < 14 ? 62 : 63;
  return ((bx + by) % 20 < 10) ? 64 : 65;
}

// ── свет: откуда (угол на земле), сила дня, сила луны, нажим пера ──
const faceTab = new Float32Array(16);
const STEEP = [0.25, 0.55, 0.85, 1];
let L = { ang: 0, day: 0, night: 0, press: 1 };
export function lightKey(l) {
  return `${Math.round(l.ang / (Math.PI / 18))}|${Math.round(l.day * 8)}|${Math.round(l.night * 8)}|${Math.round(l.press * 5)}`;
}
export function setLight(l) {
  L = { ang: Math.round(l.ang / (Math.PI / 18)) * Math.PI / 18, day: Math.round(l.day * 8) / 8,
    night: Math.round(l.night * 8) / 8, press: Math.max(0.3, Math.round(l.press * 5) / 5) };
  for (let b = 0; b < 16; b++) faceTab[b] = Math.cos(b * Math.PI / 8 - L.ang);
}
setLight(L);

// ── покраска плитки при нынешнем свете → RGBA ──
export function paintData(d, out) {
  const { mat: m, cls: c, dir, ov } = d, A = m.length;
  const day = L.day, night = L.night, press = L.press;
  let r = 0, g = 0, b = 0;
  const put = (col, a) => { r += (col[0] - r) * a; g += (col[1] - g) * a; b += (col[2] - b) * a; };
  for (let k = 0; k < A; k++) {
    const M = MATS[m[k]], bits = c[k];
    r = M.base[0]; g = M.base[1]; b = M.base[2];
    if (M.kind === EDGE) {
      if (bits & 8) put(BONE, 0.25);
    } else if (bits) {
      const f = faceTab[dir[k] >> 2] * STEEP[dir[k] & 3];
      if (M.kind === FIRE) {
        if (bits & 4) put(M.dark, 0.7);
      } else {
        if (day > 0) {
          const sh = Math.max(0, -f) * day, li = Math.max(0, f) * day;
          if ((bits & 1) && sh > 0.1 / M.dens) put(M.dark, Math.min(0.9, 0.35 + sh));
          else if ((bits & 2) && sh > 0.3 / (M.dens * press)) put(M.dark, Math.min(0.75, sh * 0.9));
          else if ((bits & 4) && sh > 0.55 / (M.dens * press)) put(M.soft, 0.55);
          else if ((bits & 1) && li > 0.45) put(M.lite, 0.28 * M.liteK);   // свет — почти чистый лист
        }
        if (night > 0) {
          const li = Math.max(0, f) * night;
          if ((bits & 1) && li > 0.15) put(BONE, Math.min(0.6, 0.14 + li * 0.55));
          else if ((bits & 2) && li > 0.4 / press) put(BONE, 0.2 + li * 0.15);
          else if ((bits & 4) && li > 0.65 / press) put(BONE, 0.14);
        }
      }
      if (bits & 8) put(M.dust, 0.85);
      if (bits & 16) put(BONE, 0.55);
      if (bits & 32) put(M.dust, 0.8);
    }
    if (ov && ov[k]) { const V = OV[ov[k]]; if (V.a >= 1) { r = V.col[0]; g = V.col[1]; b = V.col[2]; } else put(V.col, V.a); }
    const o = k * 4;
    out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = 255;
  }
  return out;
}

// ── кэш плиток ──
const tiles = new Map();
let frame = 0, curKey = '';
let img = null;                                   // одна общая на покраску: putImageData её копирует
function bake(tx, ty) {
  const d = bakeData(tx, ty);
  const cv = document.createElement('canvas'); cv.width = TILE; cv.height = TILE;
  const t = { tx, ty, d, cv, g: cv.getContext('2d'), key: '', used: frame };
  tiles.set(tx * 100000 + ty, t);
  return t;
}
function paint(t) {
  if (!img) img = t.g.createImageData(TILE, TILE);
  paintData(t.d, img.data);
  t.g.putImageData(img, 0, 0);
  t.key = curKey;
}
// пока плитка не готова — краска эпохи кусками по 32 точки
function rough(ctx, tx, ty, camX, camY) {
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    const x = tx * TILE + i * 32 + 16, y = ty * TILE + j * 32 + 16;
    let M;
    if (townEdge(x, y) < 0) M = MATS[townZoneOf(x, y)];
    else {
      const r = Math.max(1, landRing(landDist(warpedDist(x, y), heightAt(x, y))));
      const s = sideWarp(x, y);
      M = r >= 1 && r <= RINGS ? MATS[8 + (r - 1) * 5 + sideOf(x + s[0], y + s[1])] : r === RINGS + 1 ? MATS[56] : MATS[66];
    }
    ctx.fillStyle = `rgb(${M.base[0]},${M.base[1]},${M.base[2]})`;
    ctx.fillRect(x - 16 - camX, y - 16 - camY, 32, 32);
  }
}

// земля кадра (ctx — слой земли, без сдвига камеры); light — { ang, day, night, press }
export function drawEtchedGround(ctx, camX, camY, vw, vh, light) {
  frame++;
  const key = lightKey(light);
  if (key !== curKey) { curKey = key; setLight(light); }
  const tx0 = Math.floor(camX / TILE), ty0 = Math.floor(camY / TILE);
  const tx1 = Math.floor((camX + vw - 1) / TILE), ty1 = Math.floor((camY + vh - 1) / TILE);
  const cx = camX + vw / 2, cy = camY + vh / 2, list = [];
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    list.push({ tx, ty, d: Math.hypot((tx + 0.5) * TILE - cx, (ty + 0.5) * TILE - cy) });
  }
  list.sort((a, b) => a.d - b.d);                      // сначала середина кадра
  let bakes = 0, paints = 0;
  for (const { tx, ty } of list) {
    let t = tiles.get(tx * 100000 + ty);
    if (!t && bakes < BAKE_PER_FRAME) { t = bake(tx, ty); bakes++; paint(t); }
    if (!t) { rough(ctx, tx, ty, camX, camY); continue; }
    if (t.key !== curKey && paints < PAINT_PER_FRAME) { paint(t); paints++; }
    t.used = frame;
    ctx.drawImage(t.cv, tx * TILE - camX, ty * TILE - camY);
  }
  // запас: плитка за краем кадра, если бюджет остался (идёшь — земля уже готова)
  if (bakes < BAKE_PER_FRAME) {
    for (let ty = ty0 - 1; ty <= ty1 + 1 && bakes < BAKE_PER_FRAME; ty++) for (let tx = tx0 - 1; tx <= tx1 + 1 && bakes < BAKE_PER_FRAME; tx++) {
      if (tiles.has(tx * 100000 + ty)) continue;
      const t = bake(tx, ty); paint(t); t.used = frame; bakes++;
    }
  }
  if (tiles.size > MAX_TILES) {
    const old = [...tiles.values()].sort((a, b) => a.used - b.used).slice(0, tiles.size - MAX_TILES);
    for (const t of old) tiles.delete(t.tx * 100000 + t.ty);
  }
}
export const _tiles = () => tiles;
