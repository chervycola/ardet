const fs = require('fs');
const OUT = __dirname + '/../renders/afisha';

const EXPO = ['Kaleidoscope','ПРИБОР','Twang Modular','Solyara','Лаборатория звука МАЯК','ArtCraft workshop','LaserNoto','ЭФЭМИ','MXLS','SxLab','ЯНДЕКС','Резонанс','VG Line','Unheld modular','Paratek','УралСинтМаш','Alpha1 Midi Sequencer','СТК «Путь вперёд»','Edwards-audio','ФАЗА Электроника','Пикасо 3D','MADSOUNDFACTORY','PORKYSYNTH','Творческий центр ТРЕТИЙ ПУТЬ','Nakedboards'];
const ARTISTS = ['Там Огни | c0deterr0r','TiihayaRekaa','М.О.У.Б.','dr.SpaceKir','Alexander Turkin','Игра с тенью','H.Ruine','Анна Пряхина','Артемий Анрилов и xandr.vasiliev','Gogidze','RUBIGO FORTUNA'];
const LECTURES = ['Владимир Черепанов','Владимир Кабанов','Захар Лунев','Александр Григорьев','Александр Пленингер','Георгий Орлов-Давыдовский','Николай Козловский','Илья Чертков','Игорь Мирзоев','Каут Алекс','Иван Антоновский','Никита Забелин','Влад Креймер'];
const WORKSHOPS = ['Воронов Егор','Полина Шмонина','Олег Слуцкий','Илья Чертков','Склад Ума'];
const INSTALL = ['Анна Ходыкина','Василий Конкрет','Дарья Лукьянова','Лидия Симич','Олег Слуцкий','Роман Крылов'];

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const LH = 34, FS = 24;

function section(x, y, title, items, lh=LH){
  let out = `<text x="${x}" y="${y}" font-family="'Courier New',monospace" font-size="23" letter-spacing="4" fill="#E30613">· ${esc(title)}</text>`;
  items.forEach((n,i)=>{
    out += `\n<text x="${x}" y="${y + (i+1)*lh}" font-family="'Courier New',monospace" font-size="${FS}" fill="#000">${esc(n)}</text>`;
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
<text x="1020" y="66" text-anchor="end" font-family="'Courier New',monospace" font-size="19" letter-spacing="2" fill="#000">АФИША</text>
<line x1="60" y1="96" x2="1020" y2="96" stroke="#000" stroke-width="2"/>

<text x="60" y="152" font-weight="800" font-size="56" letter-spacing="1" fill="#000">СПИСОК <tspan fill="#E30613">УЧАСТНИКОВ</tspan></text>
<text x="1020" y="150" text-anchor="end" font-family="'Courier New',monospace" font-size="22" letter-spacing="2" fill="#E30613">19.09.2026</text>

<circle cx="60" cy="184" r="5" fill="#E30613"/>
<polyline points="60,184 149,184 149,176 199,176 199,192 241,192 241,184 309,184 309,168 353,168 353,200 392,200 392,176 442,176 442,208 501,208 501,192 546,192 546,184 623,184 623,168 670,168 670,192 712,192 712,176 768,176 768,200 813,200 813,184 878,184 878,176 931,176 931,184 1020,184" fill="none" stroke="#000" stroke-width="2.5"/>

${section(60, 240, 'ЭКСПО', EXPO, 30)}
${section(575, 240, 'АРТИСТЫ', ARTISTS, 32)}
${section(575, 240 + 12*32 + 8, 'ЛЕКТОРИЙ', LECTURES, 30)}

${section(60, 1060, 'МАСТЕР-КЛАССЫ', WORKSHOPS, 30)}
${section(575, 1060, 'ИНСТАЛЛЯЦИИ', INSTALL, 30)}

<line x1="60" y1="1250" x2="1020" y2="1250" stroke="#000" stroke-width="2"/>
<text x="60" y="1292" font-family="'Courier New',monospace" font-size="18" letter-spacing="2" fill="#000">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>
<text x="60" y="1318" font-family="'Courier New',monospace" font-size="18" letter-spacing="2" fill="#000">ЗЕЛЕНОГРАД · МИЭТ · 13:00–20:00 · БИЛЕТЫ: FLAT.AUDIO/E/2470</text>
<text x="1020" y="1300" text-anchor="end" font-weight="800" font-size="32" fill="#E30613">ДИСКРЕТ.РФ</text>
</svg>`;

fs.writeFileSync(`${OUT}/afisha-tg-sostav.svg`, svg);
console.log('afisha-tg-sostav.svg written');
