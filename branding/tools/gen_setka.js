const fs = require('fs');
const OUT = __dirname + '/../renders/afisha';
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function wrap(text, max){
  const words=text.split(' '), lines=[]; let cur='';
  for(const w of words){
    if((cur+' '+w).trim().length>max){ lines.push(cur.trim()); cur=w; }
    else cur=(cur+' '+w).trim();
  }
  if(cur) lines.push(cur.trim());
  return lines;
}

const W=2480, H=1754;
const GX0=60, GX1=2420;
const TCOL=96;
const GY0=396, GY1=1620;         // 13:00 → 20:00
const PH=(GY1-GY0)/420;
const CX0=GX0+TCOL;
const NC=9, CW=(GX1-CX0)/NC;

const COLS=[
  ['ЭКСПО /','ДЕМО-ЗОНА'],['ЛЕКЦИИ 1202','РАСТР'],['ЛЕКЦИИ 1204','ВЕКТОР'],
  ['АНДЕР-ГАЛЕРЕЯ',''],['ВЕСТИБЮЛЬ ДК',''],['МАСТЕРСКАЯ 1',''],['МАСТЕРСКАЯ 2',''],
  ['УЛИЦА',''],['ДЕТСКАЯ','ДЕТИ АЙКЬЮ'],
];
const DARKCOLS=[3,4]; // ночные сцены — инверсия

// t1,t2 в минутах от 13:00 · style: g=серый, h=штриховка, d=ночной тёмный, r=красный
const EV=[
  [0, 0,  50,'h','xander.vasiliev, Артемий Анрилов','музыкально-художественная демонстрация'],
  [0, 50, 70,'g','Вводное слово','и небольшой экскурс по программе форума'],
  [0, 70, 100,'g','Мини-презентация проектов',''],
  [0, 100,110,'g','Сбор на экскурсию по МИЭТу',''],
  [0, 110,160,'h','Gogidze',''],
  [0, 160,190,'g','Мини-презентация проектов',''],
  [0, 200,255,'g','Никита Забелин — Ground',''],
  [0, 270,330,'g','Георгий Орлов-Давыдовский','Кастомные инструменты для шумовых перформансов'],
  [0, 360,420,'r','ОРГКОМАНДА','19:00 – 20:00 · выступление и результаты конкурса'],
  [1, 40, 115,'g','Владимир Кабанов','Бесконденсаторные фильтры в синтезаторах: особенности, история, перспективы'],
  [1, 120,175,'g','Влад Креймер','Организмический синтез как поэтический предвестник нового измерения науки'],
  [1, 180,235,'g','Александр Пленингер','Онлайн-лекция · Технический дизайн: дьявол в деталях'],
  [1, 240,295,'g','Григорьев, Лунёв','DSP-платформа «Семечко» и студия разработки Rostok IDE'],
  [1, 300,355,'g','Илья Чертков','Творческое применение самодельных микрофонов'],
  [2, 60, 115,'g','Карло Евгений Владимирович','Цена и ценность музыкальных устройств'],
  [2, 120,175,'g','Антоновский Иван Павлович','Микроконтроллеры и их применение — в технике, в жизни, в музыке'],
  [2, 180,235,'g','Игорь Мирзоев','3D-печать в музыкальной электронике · Пикасо 3D'],
  [2, 240,295,'g','Владимир Черепанов','Медицинский звук: использование в звукоэкспериментальных целях непрофильной техники'],
  [2, 300,355,'g','Каут Алекс','Опыт малотиражной разработки · Boring modular'],
  [3, 60, 110,'d','Там Огни | c0deterr0r',''],
  [3, 110,160,'d','М.О.У.Б.',''],
  [3, 160,210,'d','dr.SpaceKir',''],
  [3, 210,260,'d','Alexander Turkin',''],
  [3, 260,310,'d','RUBIGO FORTUNA','Раис · Казань'],
  [4, 90, 140,'d','Игра с тенью',''],
  [4, 150,200,'d','TiihayaRekaa',''],
  [4, 200,240,'d','Анна Пряхина · AV',''],
  [4, 240,300,'d','Аудиовизуальная синестезия · AV-лекция','Козловский Николай'],
  [5, 120,300,'g','Полина Шмонина','Хаотический синтезатор'],
  [6, 180,360,'g','Воронов Егор','Аналоговый синтезатор на интегральной микросхеме'],
  [7, 180,280,'g','Полевые записи — прогулка','с Ильёй Чертковым (30 мин инструктаж), Владом Креймером, Павлом Чукаевым (экскурсовод)'],
  [7, 300,360,'h','H.Ruine · выступление AV','Влад Лисицкий'],
  [8, 60, 120,'g','Мастерская звуков','Олег Слуцкий · от 6 до 12 лет'],
  [8, 120,180,'g','Звук — собери свою гармошку!','Склад Ума · от 6 до 12 лет'],
  [8, 180,240,'g','Синтезатор из сковородки','Олег Слуцкий · от 10 до 99 лет'],
  [8, 240,300,'g','«Чувствую движение» — шестое чувство','Склад Ума · от 6 до 12 лет'],
];

function fmt(m){ const h=13+Math.floor(m/60), mm=m%60; return `${h}:${String(mm).padStart(2,'0')}`; }

function cell(c,t1,t2,st,title,desc){
  const x=CX0+c*CW+5, w=CW-10;
  const y=GY0+t1*PH+2, h=(t2-t1)*PH-4;
  const fill = st==='r' ? '#E30613' : st==='d' ? '#111111' : st==='h' ? 'url(#th)' : '#f5f5f5';
  const tc  = (st==='r'||st==='d') ? '#FFF' : '#000';
  const timc= st==='r' ? '#FFF' : st==='d' ? '#FF5560' : '#E30613';
  let out=`<rect x="${x}" y="${y}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" stroke="#000" stroke-width="1.6"/>\n`;
  const pad=x+10, maxY=y+h-6;
  if(t2-t1<=15){
    out+=`<text x="${pad}" y="${y+h/2+5}" font-weight="800" font-size="13.5" fill="${tc}"><tspan font-family="'Courier New',monospace" font-weight="400" fill="${timc}">${fmt(t1)}</tspan> ${esc(title)}</text>\n`;
    return out;
  }
  let ty=y+24;
  if(st!=='r'){
    out+=`<text x="${pad}" y="${ty}" font-family="'Courier New',monospace" font-size="16" letter-spacing="0.5" fill="${timc}">${fmt(t1)} – ${fmt(t2)}</text>\n`;
    ty+=25;
  }
  for(const l of wrap(title,19)){
    if(ty>maxY) return out;
    out+=`<text x="${pad}" y="${ty}" font-weight="800" font-size="22" fill="${tc}">${esc(l)}</text>\n`;
    ty+=24;
  }
  if(desc){
    ty+=2;
    for(const l of wrap(desc,26)){
      if(ty>maxY) return out;
      out+=`<text x="${pad}" y="${ty}" font-size="16" fill="${tc}">${esc(l)}</text>\n`;
      ty+=19;
    }
  }
  return out;
}

let grid='';
for(let hh=0; hh<=7; hh++){
  const y=GY0+hh*60*PH;
  grid+=`<line x1="${CX0}" y1="${y}" x2="${GX1}" y2="${y}" stroke="${hh===0||hh===7?'#000':'#d6d6d6'}" stroke-width="${hh===0||hh===7?2:1}"/>\n`;
  grid+=`<text x="${GX0+TCOL-16}" y="${y+8}" text-anchor="end" font-weight="800" font-size="26" fill="#000">${13+hh}:00</text>\n`;
}
for(let c=0;c<=NC;c++){
  const x=CX0+c*CW;
  grid+=`<line x1="${x}" y1="${GY0-72}" x2="${x}" y2="${GY1}" stroke="${c===0||c===NC?'#000':'#c9c9c9'}" stroke-width="${c===0||c===NC?2:1}"/>\n`;
}
let heads='';
COLS.forEach((h,c)=>{
  const cx=CX0+c*CW+CW/2;
  const dark=DARKCOLS.includes(c);
  if(dark) heads+=`<rect x="${CX0+c*CW+5}" y="${GY0-60}" width="${CW-10}" height="48" fill="#111111"/>\n`;
  const y1 = h[1] ? GY0-44 : GY0-30;
  heads+=`<text x="${cx}" y="${y1}" text-anchor="middle" font-weight="800" font-size="22" letter-spacing="0.5" fill="${dark?'#FFF':'#000'}">${esc(h[0])}</text>\n`;
  if(h[1]) heads+=`<text x="${cx}" y="${GY0-18}" text-anchor="middle" font-weight="800" font-size="22" letter-spacing="0.5" fill="${dark?'#FF5560':'#E30613'}">${esc(h[1])}</text>\n`;
});

function shLine(x0,x1,base,q){
  const LV=[0,-1,1,0,-2,2,-1,3,1,0,-2,1,-1,2,0,-1,0];
  const WD=[60,34,28,46,30,26,34,40,30,52,32,28,38,30,44,36,60];
  const tw=WD.reduce((a,b)=>a+b,0), k=(x1-x0)/tw;
  let x=x0, pts=[`${x0},${base+LV[0]*q}`];
  for(let i=0;i<LV.length;i++){
    x+=WD[i]*k;
    pts.push(`${Math.round(x)},${base+LV[i]*q}`);
    if(i<LV.length-1) pts.push(`${Math.round(x)},${base+LV[i+1]*q}`);
  }
  return `<circle cx="${x0}" cy="${base}" r="5" fill="#E30613"/>
<polyline points="${pts.join(' ')}" fill="none" stroke="#000" stroke-width="2.5"/>`;
}

const events=EV.map(e=>cell(...e)).join('\n');

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
<defs>
  <g id="logoD" shape-rendering="crispEdges" transform="scale(0.66667)">
    <rect x="10" y="0" width="2" height="12"/><rect x="2" y="0" width="8" height="2"/><rect x="4" y="2" width="2" height="4"/>
    <rect x="2" y="6" width="2" height="2"/><rect x="0" y="8" width="12" height="2"/><rect x="0" y="10" width="2" height="2"/>
  </g>
  <pattern id="th" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
    <rect width="12" height="12" fill="#f8f8f8"/>
    <line x1="0" y1="0" x2="0" y2="12" stroke="#e0e0e0" stroke-width="4"/>
  </pattern>
</defs>
<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<rect x="30" y="30" width="${W-60}" height="${H-60}" fill="none" stroke="#000" stroke-width="3"/>

<use href="#logoD" fill="#000" transform="translate(60,64) scale(11.5)"/>
<text x="230" y="150" font-weight="800" font-size="118" letter-spacing="2" fill="#000">ДИСКРЕТ <tspan fill="#E30613">2026</tspan></text>
<text x="234" y="196" font-family="'Courier New',monospace" font-size="25" letter-spacing="6" fill="#000">ПОЛНАЯ СЕТКА · 19 СЕНТЯБРЯ · МИЭТ · ЗЕЛЕНОГРАД</text>
<text x="1770" y="92" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">НАУЧНО-ТЕХНИЧЕСКИЙ</text>
<text x="1770" y="122" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">ФОРУМ ТВОРЧЕСКОГО</text>
<text x="1770" y="152" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">ПРИБОРОСТРОЕНИЯ</text>
<text x="1770" y="196" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#E30613">ДИСКРЕТ.РФ</text>
<text x="2240" y="92" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">ЛЮДИ</text>
<text x="2240" y="122" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">ЗВУК</text>
<text x="2240" y="152" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">ТЕХНОЛОГИИ</text>
<text x="2240" y="182" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">ИДЕИ</text>
${shLine(60,2420,236,7)}

<text x="${CX0+8}" y="${GY0-92}" font-family="'Courier New',monospace" font-size="24" letter-spacing="4" fill="#E30613">● ОТКРЫТИЕ ДВЕРЕЙ · 13:00</text>
<line x1="${CX0+540}" y1="${GY0-100}" x2="${GX1}" y2="${GY0-100}" stroke="#E30613" stroke-width="2.5"/>
<circle cx="${GX1-6}" cy="${GY0-100}" r="6" fill="#E30613"/>

${grid}
${heads}
${events}

<line x1="60" y1="1662" x2="2420" y2="1662" stroke="#000" stroke-width="2.5"/>
<text x="60" y="1700" font-family="'Courier New',monospace" font-size="21" letter-spacing="3" fill="#000">СИНТЕЗИРУЕМ БОЛЬШЕ, ЧЕМ ЗВУК · ЭКСПО ОТКРЫТО 13:00–20:00</text>
<text x="1560" y="1700" font-family="'Courier New',monospace" font-size="21" letter-spacing="3" fill="#000">ВХОД ПО БИЛЕТАМ · FLAT.AUDIO/E/2470</text>
<text x="2420" y="1700" text-anchor="end" font-family="'Courier New',monospace" font-size="21" letter-spacing="3" fill="#E30613">ЗАКРЫТИЕ · 20:00 ●</text>
</svg>`;

fs.writeFileSync(`${OUT}/setka-a3.svg`, svg);
console.log('setka-a3.svg written');
