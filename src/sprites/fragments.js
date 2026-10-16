// ═══════════════════════════════════════
// ОБЛОМКИ ЭПОХ — то, что осталось в поле от каждой эпохи, кроме утвари:
// кладка, колонна, сруб, бочка, плита с арматурой, бетонный забор… По три
// на кольцо, без осмотра. Ткань поля (render/ground.js) ставит их рядом с
// брошенной утварью, когда её виды в кадре уже заняты.
// Свет — слева, кромка пеплом справа, как у построек и утвари.
// Контракт тот же: x — середина, gy — линия земли, рисунок строго в w×h.
// ═══════════════════════════════════════
const NI = '#0D0B0A', AS = '#8A8D8F', MG = '#3D4A3A';
const K0 = '#15100c', K1 = '#241c14', K2 = '#2a2620', K3 = '#34302a', K4 = '#3a3328';
const BR2 = '#3a2818', L1 = '#c8b89a', L2 = '#b0a284';
const q = Math.round;
function r(c, col, x, y, w, h) { c.fillStyle = col; c.fillRect(x, y, w, h); }
// отрезок по точкам
function ln(c, col, x0, y0, x1, y1) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  c.fillStyle = col;
  for (let i = 0; i <= n; i++) c.fillRect(q(x0 + (x1 - x0) * i / n), q(y0 + (y1 - y0) * i / n), 1, 1);
}

// ── 1 · осевое время: сырцовая кладка, черепки, вкопанный камень ──
function mudbrick(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K4, x - 12, g - 3, 20, 3); r(c, L2, x - 12, g - 3, 20, 1); r(c, AS, x + 7, g - 3, 1, 3);
  r(c, K4, x - 10, g - 6, 14, 3); r(c, L2, x - 10, g - 6, 14, 1); r(c, AS, x + 3, g - 6, 1, 3);
  r(c, K4, x - 7, g - 9, 6, 3); r(c, L2, x - 7, g - 9, 6, 1); r(c, AS, x - 2, g - 9, 1, 3);
  for (const sx of [-8, -3, 3]) r(c, K1, x + sx, g - 2, 1, 2);       // швы сырца — вразбежку
  for (const sx of [-6, 0]) r(c, K1, x + sx, g - 5, 1, 2);
  r(c, K1, x - 4, g - 8, 1, 2);
  r(c, K4, x + 8, g - 2, 3, 2); r(c, L2, x + 8, g - 2, 2, 1); r(c, K4, x + 11, g - 1, 1, 1);   // осыпь
}
function sherds(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K4, x - 6, g - 4, 6, 4); r(c, L2, x - 6, g - 4, 5, 1); r(c, L2, x - 6, g - 3, 1, 2);   // полпифоса горлом к нам
  r(c, K0, x - 4, g - 3, 3, 2); r(c, AS, x - 1, g - 3, 1, 2);
  r(c, K4, x + 2, g - 2, 3, 2); r(c, L2, x + 2, g - 2, 3, 1);         // черепки
  r(c, K3, x + 5, g - 1, 2, 1); r(c, L2, x + 6, g - 2, 1, 1);
  r(c, K4, x - 8, g - 1, 2, 1);
}
function standingStone(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K3, x - 3, g - 12, 6, 12); r(c, K3, x - 2, g - 14, 4, 2);
  r(c, L2, x - 3, g - 12, 1, 11); r(c, L2, x - 2, g - 14, 3, 1); r(c, L2, x - 3, g - 13, 1, 1);
  r(c, AS, x + 2, g - 12, 1, 11); r(c, AS, x + 1, g - 13, 1, 1);
  r(c, K1, x - 1, g - 9, 1, 1); r(c, K1, x, g - 6, 1, 1); r(c, K1, x - 1, g - 4, 1, 1);   // лунки-чаши
}

// ── 2 · портики: колонна без капители, барабан колонны, фронтон на земле ──
function column(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K4, x - 4, g - 3, 9, 3); r(c, L2, x - 4, g - 3, 9, 1); r(c, AS, x + 4, g - 3, 1, 3);   // база
  r(c, K3, x - 2, g - 21, 5, 18); r(c, L2, x - 2, g - 21, 1, 18); r(c, AS, x + 2, g - 21, 1, 18);
  r(c, K2, x, g - 21, 1, 18);                                          // каннелюра
  r(c, K3, x - 2, g - 22, 3, 1); r(c, L2, x - 2, g - 23, 1, 2); r(c, K3, x - 1, g - 23, 1, 1);   // обломанный верх
}
function drum(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K4, x - 6, g - 2, 13, 2); r(c, L2, x - 6, g - 2, 13, 1);       // плинт
  r(c, K3, x - 4, g - 8, 9, 6); r(c, L2, x - 4, g - 8, 1, 6); r(c, AS, x + 4, g - 8, 1, 6);
  r(c, K2, x - 2, g - 7, 1, 5); r(c, K2, x + 1, g - 7, 1, 5);         // каннелюры
  r(c, L2, x - 3, g - 9, 7, 1);                                        // срез
}
function pediment(c, X, G) {
  const x = q(X), g = q(G);
  for (let i = 0; i < 6; i++) {                                        // треугольник плашмя
    const hw = (1 + i * 1.8) | 0, y = g - 7 + i;
    r(c, K3, x - hw, y, hw * 2 + 1, 1); r(c, L2, x - hw, y, 1, 1); r(c, AS, x + hw, y, 1, 1);
  }
  r(c, K4, x - 11, g - 1, 23, 1); r(c, L2, x - 11, g - 1, 2, 1);      // карниз
  r(c, K1, x - 2, g - 4, 4, 2); r(c, K2, x + 3, g - 3, 2, 1);          // тимпан: рельеф сбит
}

// ── 3 · сад света: арка сада, погасший каменный фонарь, скамья ──
function gardenArch(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K3, x - 6, g - 14, 2, 14); r(c, L2, x - 6, g - 14, 1, 14);     // левый столб
  r(c, K3, x + 4, g - 11, 2, 11); r(c, AS, x + 5, g - 11, 1, 11);     // правый — обломан ниже
  r(c, K3, x - 6, g - 16, 7, 2); r(c, L2, x - 6, g - 16, 7, 1);       // свод — до половины
  r(c, K3, x + 1, g - 15, 2, 1); r(c, AS, x + 2, g - 15, 1, 1);
  r(c, MG, x - 6, g - 5, 2, 2); r(c, MG, x - 5, g - 9, 1, 2); r(c, MG, x + 4, g - 3, 2, 1);   // плющ
}
function deadLantern(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K4, x - 2, g - 3, 5, 3); r(c, L2, x - 2, g - 3, 5, 1);         // подставка
  r(c, K3, x - 1, g - 8, 3, 5); r(c, L2, x - 1, g - 8, 1, 5);         // ножка
  r(c, K3, x - 3, g - 11, 7, 3); r(c, L2, x - 3, g - 11, 1, 3); r(c, AS, x + 3, g - 11, 1, 3);
  r(c, K0, x - 1, g - 10, 3, 2);                                       // огня нет
  r(c, K4, x - 4, g - 12, 9, 1); r(c, L2, x - 3, g - 13, 7, 1);       // кровелька
}
function bench(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K4, x - 7, g - 5, 15, 2); r(c, L2, x - 7, g - 5, 15, 1); r(c, AS, x + 7, g - 5, 1, 2);
  r(c, K2, x - 6, g - 3, 2, 3); r(c, K2, x + 4, g - 3, 2, 3); r(c, L2, x - 6, g - 3, 1, 3);
  r(c, MG, x - 3, g - 5, 3, 1);
}

// ── 4 · два очага: плетень, угол сруба, стог ──
function wattle(c, X, G) {
  const x = q(X), g = q(G);
  for (let i = 0; i < 5; i++) {                                        // колья
    const sx = x - 10 + i * 5, hh = 9 + (i % 2);
    r(c, K1, sx, g - hh, 1, hh); r(c, L2, sx, g - hh, 1, 1);
  }
  for (const by of [7, 4]) { r(c, BR2, x - 10, g - by, 21, 2); r(c, L2, x - 10, g - by, 21, 1); }   // лоза
  r(c, AS, x + 10, g - 7, 1, 2); r(c, AS, x + 10, g - 4, 1, 2);
  r(c, K0, x + 2, g - 7, 3, 2);                                        // прореха
}
function logCorner(c, X, G) {
  const x = q(X), g = q(G);
  const len = [13, 12, 10, 7, 4];                                      // венцы — к верху обгорели
  for (let i = 0; i < 5; i++) {
    const y = g - 2 - i * 2;
    r(c, BR2, x - 5, y, len[i], 2); r(c, L2, x - 5, y, len[i], 1); r(c, AS, x - 5 + len[i] - 1, y + 1, 1, 1);
    if (i % 2 === 0) { r(c, K4, x - 7, y, 2, 2); r(c, L2, x - 7, y, 1, 1); r(c, K1, x - 6, y + 1, 1, 1); }   // торцы в лапу
  }
  r(c, K0, x + 2, g - 9, 2, 1);
}
function haystack(c, X, G) {
  const x = q(X), g = q(G);
  const hw = [2, 4, 5, 6, 6, 6, 7, 7, 7, 7, 7];                        // сверху вниз
  for (let i = 0; i < hw.length; i++) {
    const y = g - 11 + i;
    r(c, K4, x - hw[i], y, hw[i] * 2, 1); r(c, L2, x - hw[i], y, 1, 1); r(c, AS, x + hw[i] - 1, y, 1, 1);
  }
  for (const [sx, sy] of [[-3, 8], [1, 6], [-1, 4], [3, 9], [-5, 5]]) r(c, L2, x + sx, g - sy, 1, 1);   // солома
  r(c, K1, x - 7, g - 1, 14, 1);                                       // подгнил снизу
  r(c, K1, x, g - 14, 1, 3);                                           // стожар
}

// ── 5 · просвещение: балюстрада, фонарный столб, тумба ──
function balustrade(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K4, x - 10, g - 10, 15, 2); r(c, L2, x - 10, g - 10, 15, 1); r(c, AS, x + 4, g - 10, 1, 2);   // перила — обломаны
  for (const i of [0, 1, 3]) {                                         // третий балясин выбит
    const bx = x - 8 + i * 5;
    r(c, K3, bx, g - 8, 3, 6); r(c, K3, bx - 1, g - 6, 5, 2); r(c, L2, bx - 1, g - 6, 1, 2); r(c, L2, bx, g - 8, 1, 2);
  }
  r(c, K4, x - 10, g - 2, 21, 2); r(c, L2, x - 10, g - 2, 21, 1); r(c, AS, x + 10, g - 2, 1, 2);
  r(c, K4, x + 6, g - 4, 4, 2); r(c, L2, x + 6, g - 4, 4, 1);         // кусок перил на плинте
}
function lampPost(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K2, x - 1, g - 3, 4, 3); r(c, L2, x - 1, g - 3, 1, 3);         // тумба
  r(c, K1, x, g - 17, 2, 14); r(c, L2, x, g - 17, 1, 14);             // столб
  r(c, K2, x - 2, g - 20, 6, 3); r(c, K0, x - 1, g - 19, 4, 1);       // фонарь: стекло тёмное
  r(c, L2, x - 2, g - 20, 6, 1); r(c, AS, x + 3, g - 19, 1, 2);
}
function advertColumn(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K3, x - 4, g - 11, 9, 11); r(c, L2, x - 4, g - 11, 1, 11); r(c, AS, x + 4, g - 11, 1, 11);
  r(c, K4, x - 5, g - 13, 11, 2); r(c, L2, x - 5, g - 13, 11, 1);     // шапка
  r(c, L1, x - 2, g - 9, 4, 5); r(c, K2, x, g - 7, 2, 3);             // ободранная афиша — без слов
  r(c, K2, x - 4, g - 1, 9, 1);
}

// ── 6 · пар и тени: обломок трубы, стена с окном, бочка ──
function chimneyStump(c, X, G) {
  const x = q(X), g = q(G);
  r(c, BR2, x - 3, g - 16, 7, 16); r(c, K4, x - 3, g - 16, 1, 16); r(c, AS, x + 3, g - 14, 1, 14);
  for (let y = g - 14; y < g; y += 3) r(c, K1, x - 2, y, 5, 1);       // швы кладки
  for (let y = g - 13; y < g - 1; y += 6) r(c, K1, x, y, 1, 2);
  r(c, BR2, x + 1, g - 18, 2, 2); r(c, L2, x - 3, g - 16, 3, 1);       // обломанный верх
  r(c, K0, x - 2, g - 17, 3, 1); r(c, K0, x + 1, g - 18, 1, 1);        // копоть
}
function brickWall(c, X, G) {
  const x = q(X), g = q(G);
  r(c, BR2, x - 10, g - 11, 20, 11); r(c, BR2, x - 10, g - 13, 8, 2); r(c, BR2, x - 2, g - 12, 5, 1);
  r(c, L2, x - 10, g - 13, 8, 1); r(c, L2, x - 2, g - 12, 5, 1); r(c, L2, x + 3, g - 11, 7, 1);
  for (let y = g - 9; y < g; y += 3) r(c, K1, x - 10, y, 20, 1);
  for (let y = g - 8, k = 0; y < g; y += 3, k++) for (let sx = -9 + (k % 2) * 3; sx < 10; sx += 6) r(c, K1, x + sx, y, 1, 2);
  r(c, K4, x - 10, g - 12, 1, 12); r(c, AS, x + 9, g - 10, 1, 10);
  r(c, NI, x + 2, g - 9, 4, 5); r(c, L2, x + 1, g - 10, 6, 1);         // окно без рамы, перемычка
}
function barrel(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K2, x - 3, g - 9, 7, 9); r(c, K2, x - 4, g - 7, 9, 5);
  r(c, L2, x - 4, g - 7, 1, 5); r(c, L2, x - 3, g - 9, 1, 2); r(c, AS, x + 4, g - 7, 1, 5);
  r(c, K0, x - 4, g - 6, 9, 1); r(c, K0, x - 4, g - 3, 9, 1);         // обручи
  r(c, K4, x - 2, g - 10, 5, 1);                                       // крышка
}

// ── 7 · катастрофы: плита с арматурой, ёж из рельсов, стена-огрызок ──
function rebarSlab(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K3, x - 9, g - 6, 17, 6); r(c, K3, x - 9, g - 7, 6, 1);         // край отломан ступенькой
  r(c, L2, x - 9, g - 7, 6, 1); r(c, L2, x - 3, g - 6, 10, 1); r(c, AS, x + 7, g - 5, 1, 5);
  r(c, K1, x - 9, g - 3, 17, 1);
  r(c, BR2, x - 5, g - 12, 1, 5); r(c, BR2, x - 4, g - 13, 2, 1);      // арматура, загнута
  r(c, BR2, x + 1, g - 11, 1, 5); r(c, BR2, x + 2, g - 12, 1, 1);
  r(c, BR2, x + 5, g - 9, 1, 3);
  r(c, K4, x + 8, g - 2, 2, 2);                                        // крошка бетона
}
function hedgehog(c, X, G) {
  const x = q(X), g = q(G);
  ln(c, K1, x - 6, g - 1, x + 4, g - 10); ln(c, K1, x - 5, g - 1, x + 5, g - 10);   // два рельса крест-накрест
  ln(c, K1, x + 6, g - 1, x - 4, g - 10); ln(c, K1, x + 5, g - 1, x - 5, g - 10);
  ln(c, AS, x - 6, g - 2, x + 3, g - 10);                              // кромка — пеплом
  r(c, K2, x, g - 9, 1, 8); r(c, AS, x, g - 9, 1, 1);                  // третий — на нас
  r(c, K0, x - 1, g - 6, 3, 2);                                        // сварка
}
function wallStump(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K3, x - 6, g - 10, 12, 10); r(c, K3, x - 6, g - 15, 4, 5); r(c, K3, x - 2, g - 12, 3, 2); r(c, K3, x + 1, g - 11, 3, 1);
  r(c, L2, x - 6, g - 15, 4, 1); r(c, L2, x - 2, g - 12, 3, 1); r(c, L2, x + 1, g - 11, 3, 1); r(c, L2, x + 4, g - 10, 2, 1);
  r(c, L2, x - 6, g - 14, 1, 14); r(c, AS, x + 5, g - 9, 1, 9);
  r(c, NI, x - 1, g - 8, 3, 4);                                        // проём
  r(c, K0, x - 5, g - 14, 2, 2);                                       // копоть
}

// ── 8 · неон: бетонный забор, столб с проводами, остов ларька ──
function concreteFence(c, X, G) {
  const x = q(X), g = q(G);
  for (let i = 0; i < 3; i++) {
    const px = x - 13 + i * 9, top = g - 11 + (i === 2 ? 2 : 0);       // третья плита осела
    r(c, K3, px, top, 8, g - top); r(c, L2, px, top, 8, 1); r(c, AS, px + 7, top + 1, 1, g - top - 1);
    for (let yy = top + 3, k = 0; yy < g - 1; yy += 3, k++) for (let xx = px + 1 + (k % 2); xx < px + 7; xx += 2) r(c, K2, xx, yy, 1, 1);   // рельеф
  }
}
function wirePole(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K1, x, g - 20, 2, 20); r(c, L2, x, g - 20, 1, 20);
  r(c, K4, x - 6, g - 18, 14, 1);                                      // траверса
  r(c, AS, x - 6, g - 19, 1, 1); r(c, AS, x - 3, g - 19, 1, 1); r(c, AS, x + 7, g - 19, 1, 1);   // изоляторы
  ln(c, AS, x - 6, g - 17, x - 7, g - 11);                             // оборванные провода
  ln(c, AS, x + 7, g - 17, x + 7, g - 13);
}
function kioskShell(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K4, x - 7, g - 13, 14, 2); r(c, L2, x - 7, g - 13, 14, 1);     // козырёк
  r(c, NI, x - 5, g - 11, 10, 6);                                      // пустое окно
  r(c, K2, x - 6, g - 11, 1, 11); r(c, K2, x + 5, g - 11, 1, 11); r(c, L2, x - 6, g - 11, 1, 11);
  r(c, AS, x - 4, g - 10, 1, 2); r(c, AS, x + 2, g - 8, 2, 1);         // осколки стекла
  r(c, K3, x - 5, g - 5, 10, 5); r(c, L2, x - 5, g - 5, 10, 1); r(c, AS, x + 5, g - 5, 1, 5);
}

// ── 9 · сейчас: бетонный блок, стеклобетон, знак без надписи ──
function jersey(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K3, x - 8, g - 3, 17, 3); r(c, K3, x - 6, g - 6, 13, 3); r(c, K3, x - 5, g - 8, 11, 2);
  r(c, L2, x - 5, g - 8, 11, 1); r(c, L2, x - 6, g - 6, 1, 1); r(c, L2, x - 8, g - 3, 2, 1);
  r(c, AS, x + 5, g - 7, 1, 4); r(c, AS, x + 8, g - 3, 1, 3);
  r(c, L1, x - 3, g - 5, 6, 1);                                        // отражатель — выцвел
}
function glassPanel(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K2, x - 5, g - 16, 11, 16);
  r(c, K0, x - 4, g - 15, 4, 7); r(c, K0, x + 1, g - 15, 4, 7); r(c, K0, x - 4, g - 7, 9, 6);
  r(c, AS, x - 3, g - 14, 1, 1); r(c, AS, x - 2, g - 13, 1, 1); r(c, AS, x + 2, g - 12, 1, 1);   // блики
  ln(c, AS, x + 1, g - 6, x + 4, g - 3);                               // трещина
  r(c, L2, x - 5, g - 16, 1, 16); r(c, L2, x - 5, g - 16, 11, 1);
}
function blankSign(c, X, G) {
  const x = q(X), g = q(G);
  r(c, K1, x, g - 10, 1, 10); r(c, AS, x + 1, g - 9, 1, 9);
  r(c, K3, x - 4, g - 15, 9, 6);
  r(c, AS, x - 4, g - 15, 9, 1); r(c, AS, x - 4, g - 15, 1, 6); r(c, AS, x + 4, g - 15, 1, 6); r(c, AS, x - 4, g - 10, 9, 1);
  r(c, K2, x - 3, g - 14, 7, 4);                                       // поле пустое
}

// по кольцу (индекс 0 — осевое): { name, w, h, draw }
export const FRAGMENTS = [
  [{ name: 'сырцовая кладка', w: 24, h: 9, draw: mudbrick }, { name: 'черепки пифоса', w: 16, h: 4, draw: sherds }, { name: 'вкопанный камень', w: 8, h: 14, draw: standingStone }],
  [{ name: 'колонна без капители', w: 10, h: 23, draw: column }, { name: 'барабан колонны', w: 13, h: 9, draw: drum }, { name: 'фронтон на земле', w: 24, h: 7, draw: pediment }],
  [{ name: 'арка сада', w: 14, h: 16, draw: gardenArch }, { name: 'погасший фонарь сада', w: 9, h: 13, draw: deadLantern }, { name: 'скамья', w: 16, h: 5, draw: bench }],
  [{ name: 'плетень', w: 22, h: 10, draw: wattle }, { name: 'угол сруба', w: 15, h: 11, draw: logCorner }, { name: 'стог', w: 15, h: 14, draw: haystack }],
  [{ name: 'балюстрада', w: 22, h: 10, draw: balustrade }, { name: 'фонарный столб', w: 7, h: 20, draw: lampPost }, { name: 'тумба', w: 11, h: 13, draw: advertColumn }],
  [{ name: 'обломок трубы', w: 9, h: 18, draw: chimneyStump }, { name: 'стена с окном', w: 21, h: 13, draw: brickWall }, { name: 'бочка', w: 9, h: 10, draw: barrel }],
  [{ name: 'плита с арматурой', w: 20, h: 13, draw: rebarSlab }, { name: 'ёж из рельсов', w: 14, h: 10, draw: hedgehog }, { name: 'стена-огрызок', w: 13, h: 15, draw: wallStump }],
  [{ name: 'бетонный забор', w: 28, h: 11, draw: concreteFence }, { name: 'столб с проводами', w: 15, h: 20, draw: wirePole }, { name: 'остов ларька', w: 14, h: 13, draw: kioskShell }],
  [{ name: 'бетонный блок', w: 18, h: 8, draw: jersey }, { name: 'стеклобетон', w: 11, h: 16, draw: glassPanel }, { name: 'знак без надписи', w: 9, h: 15, draw: blankSign }],
];
