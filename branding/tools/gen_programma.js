const fs = require('fs');
const OUT = __dirname + '/../renders/afisha';
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const LEFT = [
  ['ЭКСПО · ДЕМО-СЦЕНА', [
    '13:00 Анрилов и xandr.vasiliev',
    '13:50 Вводное слово о программе',
    '14:10 Мини-презентации проектов',
    '14:40 Экскурсия по МИЭТу',
    '14:50 Gogidze',
    '15:40 Мини-презентации проектов',
    '16:20 Как работает Ground · Забелин',
    '17:30 Кастомные инструменты для',
    '      шумовых перформансов',
    '19:00 Оргкоманда · итоги конкурса',
  ]],
  ['СЦЕНА АНДЕР-ГАЛЕРЕЯ', [
    '14:00 Там Огни | c0deterr0r',
    '14:50 М.О.У.Б.',
    '15:40 dr.SpaceKir',
    '16:30 Alexander Turkin',
    '17:20 RUBIGO FORTUNA',
  ]],
  ['СЦЕНА ВЕСТИБЮЛЬ ДК', [
    '14:30 Игра с тенью',
    '15:30 TiihayaRekaa',
    '16:20 Анна Пряхина · AV',
    '17:00 Аудиовиз. синестезия · Козловский',
  ]],
];
const RIGHT = [
  ['ЛЕКЦИИ · РАСТР · 1202', [
    '13:40 Фильтры в синтезаторах · Кабанов',
    '15:00 Организмический синтез · Креймер',
    '16:00 Технический дизайн · Пленингер',
    '17:00 «Семечко» и Rostok IDE · Григорьев,','      Лунев',
    '18:00 Самодельные микрофоны · Чертков',
  ]],
  ['ЛЕКЦИИ · ВЕКТОР · 1204', [
    '14:00 Цена и ценность устройств · Карло',
    '15:00 Микроконтроллеры · Антоновский',
    '16:00 3D-печать · Мирзоев (Пикасо 3D)',
    '17:00 Медицинский звук · Черепанов',
    '18:00 Малотиражная разработка · Каут',
  ]],
  ['МАСТЕРСКИЕ И УЛИЦА', [
    '15:00 Хаотический синтезатор · Шмонина',
    '16:00 Аналоговый синтезатор · Воронов',
    '16:00 Полевые записи · улица · Чертков',
    '18:00 H.Ruine · AV · улица',
  ]],
  ['ДЕТСКАЯ · ЗАЛ ДЕТИ АЙКЬЮ', [
    '14:00 Мастерская звуков · 6–12 лет',
    '15:00 Собери свою гармошку · 6–12 лет',
    '16:00 Синтезатор из сковородки · 10+',
    '17:00 «Чувствую движение» · 6–12 лет',
  ]],
];

const FS = 20, LH = 33, GAP = 24, HGAP = 42;
function col(x, blocks, y0){
  let y = y0, out = '';
  blocks.forEach(([title, rows])=>{
    out += `<text x="${x}" y="${y}" font-family="'Courier New',monospace" font-size="21" letter-spacing="3" fill="#E30613">· ${esc(title)}</text>\n`;
    y += HGAP - LH + 30;
    rows.forEach(r=>{
      const cont = r.startsWith('      ');
      out += `<text x="${x + (cont?76:0)}" y="${y}" font-family="'Courier New',monospace" font-size="${FS}" fill="#000">${esc(cont?r.trim():r)}</text>\n`;
      y += LH;
    });
    y += GAP;
  });
  return out;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
<defs>
  <g id="logoD" shape-rendering="crispEdges" transform="scale(0.66667)">
    <rect x="10" y="0" width="2" height="12"/><rect x="2" y="0" width="8" height="2"/><rect x="4" y="2" width="2" height="4"/>
    <rect x="2" y="6" width="2" height="2"/><rect x="0" y="8" width="12" height="2"/><rect x="0" y="10" width="2" height="2"/>
  </g>
</defs>
<rect width="1080" height="1350" fill="#FFFFFF"/>
<rect x="20" y="20" width="1040" height="1310" fill="none" stroke="#000" stroke-width="2"/>

<use href="#logoD" fill="#000" transform="translate(60,40) scale(4.0)"/>
<text x="540" y="72" text-anchor="middle" font-weight="800" font-size="46" letter-spacing="1" fill="#000">ДИСКРЕТ</text>
<text x="1020" y="66" text-anchor="end" font-family="'Courier New',monospace" font-size="19" letter-spacing="2" fill="#000">ПРОГРАММА</text>
<line x1="60" y1="96" x2="1020" y2="96" stroke="#000" stroke-width="2"/>

<text x="60" y="152" font-weight="800" font-size="56" letter-spacing="1" fill="#000">ПРОГРАММА <tspan fill="#E30613">ПО ЧАСАМ</tspan></text>
<text x="1020" y="150" text-anchor="end" font-family="'Courier New',monospace" font-size="22" letter-spacing="2" fill="#E30613">19.09.2026</text>

<circle cx="60" cy="184" r="5" fill="#E30613"/>
<polyline points="60,184 149,184 149,176 199,176 199,192 241,192 241,184 309,184 309,168 353,168 353,200 392,200 392,176 442,176 442,208 501,208 501,192 546,192 546,184 623,184 623,168 670,168 670,192 712,192 712,176 768,176 768,200 813,200 813,184 878,184 878,176 931,176 931,184 1020,184" fill="none" stroke="#000" stroke-width="2.5"/>

<text x="60" y="230" font-family="'Courier New',monospace" font-size="22" letter-spacing="2" fill="#000">ЭКСПО РАБОТАЕТ 13:00–20:00 · 25 УЧАСТНИКОВ · ВХОД ПО БИЛЕТАМ</text>

${col(60, LEFT, 296)}
${col(575, RIGHT, 296)}

<line x1="60" y1="1250" x2="1020" y2="1250" stroke="#000" stroke-width="2"/>
<text x="60" y="1292" font-family="'Courier New',monospace" font-size="18" letter-spacing="2" fill="#000">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>
<text x="60" y="1318" font-family="'Courier New',monospace" font-size="18" letter-spacing="2" fill="#000">ЗЕЛЕНОГРАД · МИЭТ · БИЛЕТЫ: FLAT.AUDIO/E/2470</text>
<text x="1020" y="1300" text-anchor="end" font-weight="800" font-size="32" fill="#E30613">ДИСКРЕТ.РФ</text>
</svg>`;

fs.writeFileSync(`${OUT}/programma-tg.svg`, svg);
console.log('programma-tg.svg written');
