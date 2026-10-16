// ═══════════════════════════════════════
// ЗЕМЛЯ ГОРОДКА — у каждой из пяти зон своя фактура поверх штриха рельефа
// (render/etch.js), раз и навсегда в плитку: в Мёртвом лесу — опавшая хвоя,
// сучья и кора; в отраве — корка в трещинах, налёт соли, лужицы с плёнкой; в
// квартале — щебёнка и каменная пыль; на шоссе — гравий и масляные пятна; в
// посёлке — утоптано: солома и камешки. Краски — палитры канона; дороги, русло
// и прочие артерии лежат поверх (их накладки не трогаю).
// ═══════════════════════════════════════
import { OV } from './etchPaths.js';
import { TOWN } from '../world/disc.js';

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, k) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * k));
const NIGHT = hex('#0D0B0A'), BONE = hex('#D9CFB8'), ASH = hex('#8A8D8F'), MGLA = hex('#3D4A3A');
const tov = (col, a) => { OV.push({ col, a }); return OV.length - 1; };
const T = {
  needle: tov(mix(MGLA, NIGHT, 0.25), 0.6), twig: tov(NIGHT, 0.45), bark: tov(BONE, 0.13),
  crack: tov(NIGHT, 0.34), salt: tov(BONE, 0.11), film: tov(mix(MGLA, NIGHT, 0.4), 1), glint: tov(mix(MGLA, BONE, 0.45), 1), rim: tov(NIGHT, 0.38),
  stone: tov(ASH, 0.34), dust: tov(BONE, 0.07),
  gravel: tov(ASH, 0.26), oil: tov(NIGHT, 0.34),
  straw: tov(BONE, 0.17), pebble: tov(NIGHT, 0.3),
};
// зоны (world/relief.js: TOWN_ZONES): 0 лес, 1 отрава, 2 квартал, 3 шоссе, 4 посёлок
const FOREST = 0, TOXIC = 1, QUARTER = 2, HIGHWAY = 3, SETTLE = 4;

function ih(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// накладки зон в плитку: x0, y0 — угол, S — сторона; mat — краски (зоны городка < 8);
// out — накладки (свободное — 0)
export function stampTown(x0, y0, S, mat, out) {
  if (x0 > TOWN.x1 + 60 || x0 + S < TOWN.x0 - 60 || y0 > TOWN.y1 + 60 || y0 + S < TOWN.y0 - 60) return;
  const zAt = (x, y) => mat[Math.min(S - 1, Math.max(0, y - y0)) * S + Math.min(S - 1, Math.max(0, x - x0))];
  const put = (x, y, z, o) => {
    const px = x - x0, py = y - y0;
    if (px < 0 || py < 0 || px >= S || py >= S) return;
    const k = py * S + px;
    if (mat[k] === z && !out[k]) out[k] = o;
  };
  const line = (x, y, dx, dy, n, z, o) => { for (let i = 0; i < n; i++) put(Math.round(x + dx * i), Math.round(y + dy * i), z, o); };
  // штрихи и крошки — по клеткам 6×6, с запасом за край плитки (стыков нет)
  const C = 6;
  for (let cy = Math.floor(y0 / C) - 1; cy <= Math.floor((y0 + S) / C) + 1; cy++) {
    for (let cx = Math.floor(x0 / C) - 1; cx <= Math.floor((x0 + S) / C) + 1; cx++) {
      const h = ih(cx, cy, 101), x = cx * C + ((ih(cx, cy, 103) * C) | 0), y = cy * C + ((ih(cx, cy, 107) * C) | 0);
      const z = zAt(x, y);
      if (z >= 8) continue;
      const a = ih(cx, cy, 109);
      if (z === FOREST) {
        if (h < 0.24) { const d = [[1, 1], [1, -1], [1, 0.5], [0.5, 1]][(a * 4) | 0]; line(x, y, d[0], d[1], 2 + (a > 0.6 ? 1 : 0), z, T.needle); }
        else if (h < 0.29) {                                        // сучок с отростком
          const an = a * Math.PI, dx = Math.cos(an), dy = Math.sin(an) * 0.6, n = 4 + ((a * 13) | 0) % 3;
          line(x, y, dx, dy, n, z, T.twig); line(x + dx * 2, y + dy * 2, dx * 0.4 - dy, dy * 0.4 + dx, 2, z, T.twig);
        } else if (h < 0.33) put(x, y, z, T.bark);
      } else if (z === SETTLE) {
        if (h < 0.05) line(x, y, a > 0.5 ? 1 : -1, 0.5, 2, z, T.straw);
        else if (h < 0.09) put(x, y, z, T.pebble);
      } else if (z === HIGHWAY) {
        if (h < 0.13) put(x, y, z, T.gravel);
        else if (h < 0.138) {                                       // масляное пятно
          const r = 2 + a * 3;
          for (let yy = -2; yy <= 2; yy++) for (let xx = -Math.ceil(r); xx <= Math.ceil(r); xx++) if ((xx / r) ** 2 + (yy / (r * 0.55)) ** 2 <= 1) put(x + xx, y + yy, z, T.oil);
        }
      } else if (z === QUARTER) {
        if (h < 0.1) { put(x, y, z, T.stone); if (a > 0.6) put(x + 1, y, z, T.stone); }
        else if (h < 0.11) for (let yy = -2; yy <= 2; yy++) for (let xx = -4; xx <= 4; xx++) if (ih(x + xx, y + yy, 113) < 0.7) put(x + xx, y + yy, z, T.dust);
      }
    }
  }
  // отрава: корка по ячейкам — трещины по их краям, налёт соли, изредка лужица с плёнкой.
  // Ячейки и поле корки считаются раз на плитку (по точке — только расстояния)
  let any = false;
  for (let k = 0; k < S * S && !any; k++) if (mat[k] === TOXIC) any = true;
  if (!any) return;
  const G = 18, gx0 = Math.floor(x0 / G) - 1, gy0 = Math.floor(y0 / G) - 1, NX = Math.floor((x0 + S) / G) + 2 - gx0, NY = Math.floor((y0 + S) / G) + 2 - gy0;
  const FX = new Float32Array(NX * NY), FY = new Float32Array(NX * NY), CH = new Float32Array(NX * NY);
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
    const gx = gx0 + i, gy = gy0 + j, q = j * NX + i;
    FX[q] = gx * G + ih(gx, gy, 121) * G; FY[q] = gy * G + ih(gx, gy, 123) * G * 0.8 + G * 0.1; CH[q] = ih(gx, gy, 127);
  }
  // корка — пятнами: где высохло (плавный шум), там трещины; между пятнами — ил без корки
  const B = 4, NB = S / B + 1, CR = new Float32Array(NB * NB);
  for (let j = 0; j < NB; j++) for (let i = 0; i < NB; i++) {
    const u = (x0 + i * B) / 150, v = (y0 + j * B) / 90, a0 = Math.floor(u), b0 = Math.floor(v), fu = u - a0, fv = v - b0;
    const a = ih(a0, b0, 141), b = ih(a0 + 1, b0, 141), c = ih(a0, b0 + 1, 141), d = ih(a0 + 1, b0 + 1, 141);
    const su = fu * fu * (3 - 2 * fu), sv = fv * fv * (3 - 2 * fv);
    CR[j * NB + i] = a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
  }
  // лужицы — по ячейкам: плёнка, тёмная кромка, блик
  for (let q = 0; q < NX * NY; q++) {
    if (CH[q] <= 0.94) continue;
    const rx = 3 + (CH[q] - 0.94) / 0.06 * 4, cx = Math.round(FX[q]), cy = Math.round(FY[q]);
    for (let yy = -3; yy <= 3; yy++) for (let xx = -Math.ceil(rx); xx <= Math.ceil(rx); xx++) {
      const e = (xx / rx) ** 2 + (yy / 2.4) ** 2;
      if (e > 1) continue;
      put(cx + xx, cy + yy, TOXIC, e > 0.6 ? T.rim : xx === -1 && yy === -1 ? T.glint : T.film);
    }
  }
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const k = py * S + px;
    if (mat[k] !== TOXIC || out[k]) continue;
    const cr = CR[(py >> 2) * NB + (px >> 2)];
    if (cr < 0.42) continue;
    const x = x0 + px, y = y0 + py, ci = Math.floor(x / G) - gx0, cj = Math.floor(y / G) - gy0;
    let d1 = 1e9, d2 = 1e9, c1 = 0;
    for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) {
      const q = j * NX + i, dd = (x - FX[q]) ** 2 + ((y - FY[q]) * 1.6) ** 2;   // по глубине ячейки ниже
      if (dd < d1) { d2 = d1; d1 = dd; c1 = q; } else if (dd < d2) d2 = dd;
    }
    if (cr > 0.5 && Math.sqrt(d2) - Math.sqrt(d1) < 0.8 * (cr - 0.4) / 0.6) { if (ih(x >> 1, y >> 1, 131) < 0.7) out[k] = T.crack; continue; }
    if (CH[c1] < 0.2 && ih(x, y, 133) < 0.45) out[k] = T.salt;
  }
}
