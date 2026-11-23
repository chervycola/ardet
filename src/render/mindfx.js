// ═══════════════════════════════════════
// СОН В ХОДЕ МХА — путешествие по границам рассудка (слово автора 23.11: «во время сна нам
// нужно сделать меньше освещения по бокам и добавить эффектов в стиле гиперкубов и closed eye
// hallucinations. преврати эту кишку в путешествие по границам рассудка»).
// Уснул в пифосе — и идёшь ходом мха от пифоса к норе у огня. По бокам кадра — темнота
// закрытых век: свет остаётся посередине, где идёшь. В темноте — то, что видят за веками,
// по порядку, как засыпают (формы Клювера: пятна, решётки, тоннель, спираль), и дальше — за
// край: гиперкубы, четырёхмерные кубы на проволоке, поворачиваются сквозь себя. У сухого мха,
// у норы, всё сходит — просыпаешься к огню.
//   этап по ходу (0 — пифос, 1 — нора):
//     пятна и фосфены     — с самого начала, к середине тише;
//     решётка (соты)      — 0,15…0,55, дышит в такт сердцу;
//     тоннель и спираль   — 0,4…0,8, кольца идут навстречу — туда, куда идёшь;
//     гиперкубы           — 0,55…0,95: большой посередине, малые по бокам, в темноте;
//     у норы (за 0,9)     — сходит.
// Краски — свои: кость, пепел, бледный мох, редкая киноварь; неона нет, вспышек нет: всё
// медленное, яркость — доли. «Меньше движения» — те же формы, почти неподвижные и тише.
// ═══════════════════════════════════════
const BO = [217, 207, 184], AS = [138, 141, 143], MP = [157, 176, 138], KV = [194, 59, 43];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
function hh(a, b, s) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const sm = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
// окно этапа: нарастает от a до a+r, держится, сходит от b−r до b
const win = (p, a, b, r = 0.1) => sm(a, a + r, p) * (1 - sm(b - r, b, p));

// сколько каждого этапа на ходу p (0..1); k — насколько внутри хода
export function stagesAt(p, k = 1) {
  const wake = 1 - sm(0.88, 0.98, p);                 // у норы — просыпаешься
  return {
    sides: k,                                          // темнота по бокам — всё время сна
    specks: k * wake * (0.35 + 0.65 * (1 - sm(0.2, 0.6, p))),
    lattice: k * wake * win(p, 0.15, 0.55),
    tunnel: k * wake * win(p, 0.4, 0.8),
    cubes: k * wake * win(p, 0.55, 0.95),
  };
}

// ── темнота по бокам: от краёв кадра к середине — веки ──
export const SIDE = 0.36;                             // доля ширины с каждой стороны, где темнеет
export function sideAlpha(x, vw, k) {
  const d = Math.min(x, vw - x) / vw;                 // 0 — край, 0,5 — середина
  return k * 0.92 * (1 - sm(0, SIDE, d));
}
function drawSides(g, vw, vh, k) {
  if (k < 0.01) return;
  for (let x = 0; x < vw * SIDE; x += 2) {
    const a = sideAlpha(x, vw, k);
    if (a < 0.01) continue;
    g.fillStyle = `rgba(13,11,10,${a.toFixed(3)})`;
    g.fillRect(x, 0, 2, vh); g.fillRect(vw - x - 2, 0, 2, vh);
  }
  for (let y = 0; y < vh * 0.18; y += 2) {            // сверху и снизу — чуть
    const a = k * 0.5 * (1 - y / (vh * 0.18));
    g.fillStyle = `rgba(13,11,10,${a.toFixed(3)})`;
    g.fillRect(0, y, vw, 2); g.fillRect(0, vh - y - 2, vw, 2);
  }
}

// ── пятна и фосфены: искры за веками плывут по кругу, гаснут и загораются ──
export function specksAt(t, vw, vh, n = 46, reduced = false) {
  const out = [], cx = vw / 2, cy = vh / 2, sp = reduced ? 0.15 : 1;
  for (let i = 0; i < n; i++) {
    const r0 = 30 + hh(i, 1, 51) * Math.max(vw, vh) * 0.55, a0 = hh(i, 2, 51) * Math.PI * 2;
    const w = (0.0006 + hh(i, 3, 51) * 0.0012) * (i & 1 ? 1 : -1) * sp;
    const a = a0 + t * w, r = r0 * (1 + 0.06 * Math.sin(t * 0.004 * sp + i));
    const life = 0.5 + 0.5 * Math.sin(t * (0.01 + hh(i, 4, 51) * 0.02) * sp + i * 1.7);
    out.push({ x: Math.round(cx + Math.cos(a) * r * 1.4), y: Math.round(cy + Math.sin(a) * r * 0.8), a: life * life, c: i % 13 === 5 ? KV : i % 3 ? BO : MP, s: hh(i, 5, 51) < 0.2 ? 2 : 1 });
  }
  return out;
}
function drawSpecks(g, t, vw, vh, w, reduced) {
  if (w < 0.01) return;
  for (const s of specksAt(t, vw, vh, 46, reduced)) {
    g.fillStyle = rgba(s.c, s.a * w * (s.c === KV ? 0.35 : 0.55));
    g.fillRect(s.x, s.y, s.s, s.s);
  }
}
// облака за веками: большие мягкие пятна, медленно переливаются
function drawClouds(g, t, vw, vh, w, reduced) {
  if (w < 0.01 || !g.createRadialGradient) return;
  const sp = reduced ? 0.2 : 1;
  for (let i = 0; i < 4; i++) {
    const x = vw * (0.3 + 0.4 * hh(i, 6, 53)) + Math.sin(t * 0.002 * sp + i * 2) * vw * 0.12;
    const y = vh * (0.3 + 0.4 * hh(i, 7, 53)) + Math.cos(t * 0.0017 * sp + i) * vh * 0.1;
    const R = Math.min(vw, vh) * (0.25 + 0.15 * hh(i, 8, 53));
    const gr = g.createRadialGradient(x, y, 0, x, y, R);
    const c = i === 2 ? AS : i === 3 ? BO : MP;
    gr.addColorStop(0, rgba(c, 0.07 * w)); gr.addColorStop(1, rgba(c, 0));
    g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2);
  }
}

// ── решётка: соты, что дышат в такт сердцу и чуть плывут от середины ──
function drawLattice(g, t, vw, vh, w, pulse, reduced) {
  if (w < 0.01) return;
  const cx = vw / 2, cy = vh / 2, S = 22, h = S * Math.sqrt(3) / 2, sp = reduced ? 0.1 : 1;
  const warp = (x, y) => {                              // от середины — волной, на ударе сильнее
    const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy) || 1;
    const k = 1 + (0.03 + 0.05 * pulse) * Math.sin(r / 26 - t * 0.03 * sp);
    return [cx + dx * k, cy + dy * k];
  };
  g.strokeStyle = rgba(BO, 0.13 * w); g.lineWidth = 1;
  g.beginPath();
  const ox = (t * 0.05 * sp) % (S * 3);
  for (let row = -1; row * h < vh + h; row++) {
    for (let col = -2; col * S * 3 < vw + S * 3; col++) {
      const x0 = col * S * 3 + (row & 1 ? S * 1.5 : 0) - ox, y0 = row * h;
      const pts = [];
      for (let k = 0; k <= 6; k++) { const a = Math.PI / 3 * k; pts.push(warp(x0 + S * Math.cos(a), y0 + S * Math.sin(a))); }
      g.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]);
    }
  }
  g.stroke();
}

// ── тоннель и спираль: кольца идут навстречу (туда, куда идёшь), рукава поворачиваются ──
function drawTunnel(g, t, vw, vh, w, reduced) {
  if (w < 0.01) return;
  const cx = vw * 0.58, cy = vh * 0.5, M = Math.max(vw, vh) * 0.75, sp = reduced ? 0.1 : 1;
  g.lineWidth = 1;
  const ph = (t * 0.004 * sp) % 1;
  for (let i = 0; i < 9; i++) {                         // кольца: от точки схода — наружу (идёшь вглубь)
    const f = (i + ph) / 9, r = M * f * f;
    if (r < 3) continue;
    g.strokeStyle = rgba(i & 1 ? AS : BO, 0.16 * w * Math.sin(Math.PI * f));
    g.beginPath(); g.ellipse ? g.ellipse(cx, cy, r, r * 0.62, 0, 0, Math.PI * 2) : g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
  }
  const rot = t * 0.006 * sp;
  for (let arm = 0; arm < 5; arm++) {                   // рукава спирали — логарифмической
    g.strokeStyle = rgba(arm === 2 ? KV : MP, (arm === 2 ? 0.08 : 0.12) * w);
    g.beginPath();
    for (let s = 0; s <= 40; s++) {
      const a = rot + arm * Math.PI * 2 / 5 + s * 0.16, r = 4 * Math.exp(s * 0.11);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.62;
      if (!s) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
}

// ── гиперкуб: шестнадцать вершин (±1)⁴, поворот в плоскостях XW, YZ, ZW; четыре измерения —
//    в три перспективой по w, три — в два перспективой по z; тридцать два ребра ──
export const TESS_V = [];
for (let i = 0; i < 16; i++) TESS_V.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
export const TESS_E = [];
for (let i = 0; i < 16; i++) for (let b = 0; b < 4; b++) { const j = i ^ (1 << b); if (j > i) TESS_E.push([i, j]); }
export function tesseract(a1, a2, a3, size, cx, cy) {
  const c1 = Math.cos(a1), s1 = Math.sin(a1), c2 = Math.cos(a2), s2 = Math.sin(a2), c3 = Math.cos(a3), s3 = Math.sin(a3);
  return TESS_V.map(([x, y, z, w]) => {
    [x, w] = [x * c1 - w * s1, x * s1 + w * c1];       // XW
    [y, z] = [y * c2 - z * s2, y * s2 + z * c2];       // YZ
    [z, w] = [z * c3 - w * s3, z * s3 + w * c3];       // ZW
    const f = 1 / (2.6 - w), X = x * f, Y = y * f, Z = z * f;
    const g = 1 / (3.2 - Z);
    return [cx + X * g * size, cy + Y * g * size, w];
  });
}
function drawCube(g, P, alpha, inner) {
  for (const [i, j] of TESS_E) {
    const ww = (P[i][2] + P[j][2]) / 2;                 // ближнее в четвёртом — ярче
    const inn = inner && TESS_V[i][3] < 0 && TESS_V[j][3] < 0;
    g.strokeStyle = rgba(inn ? KV : BO, alpha * (inn ? 0.6 : 0.55 + 0.45 * (ww + 1.5) / 3));
    g.beginPath(); g.moveTo(Math.round(P[i][0]) + 0.5, Math.round(P[i][1]) + 0.5); g.lineTo(Math.round(P[j][0]) + 0.5, Math.round(P[j][1]) + 0.5); g.stroke();
  }
}
function drawCubes(g, t, vw, vh, w, pulse, reduced) {
  if (w < 0.01) return;
  const sp = reduced ? 0.08 : 1;
  g.lineWidth = 1;
  const m = Math.min(vw, vh);
  // большой — посередине, бледный, сквозь него идёшь
  drawCube(g, tesseract(t * 0.007 * sp, t * 0.0043 * sp, t * 0.0029 * sp, m * (1.05 + 0.04 * pulse), vw / 2, vh * 0.48), 0.12 * w, true);
  // малые — по бокам, в темноте век
  for (let i = 0; i < 4; i++) {
    const side = i & 1 ? 1 : -1, x = vw / 2 + side * vw * (0.33 + 0.08 * hh(i, 9, 57)), y = vh * (0.25 + 0.5 * hh(i, 10, 57)) + Math.sin(t * 0.003 * sp + i) * 10;
    drawCube(g, tesseract(t * (0.011 + 0.004 * i) * sp + i, t * 0.006 * sp * side, t * 0.004 * sp + i * 0.7, m * (0.22 + 0.06 * hh(i, 11, 57)), x, y), 0.26 * w, false);
  }
}

// ── всё вместе: fx — слой эффектов поверх света (main.js renderUnder); p — ход 0..1;
//    k — насколько внутри хода; pulse — удар сердца 0..1 ──
export function drawMossDream(g, vw, vh, t, p, k, pulse = 0, reduced = false) {
  if (k < 0.01 || !g) return;
  const S = stagesAt(p, k);
  g.save();
  drawSides(g, vw, vh, S.sides);
  drawClouds(g, t, vw, vh, S.specks, reduced);
  drawSpecks(g, t, vw, vh, S.specks, reduced);
  drawLattice(g, t, vw, vh, S.lattice, pulse, reduced);
  drawTunnel(g, t, vw, vh, S.tunnel, reduced);
  drawCubes(g, t, vw, vh, S.cubes, pulse, reduced);
  g.restore();
}
