const fs = require('fs');
const OUT = __dirname + '/../renders/insta-mk';
try { fs.mkdirSync(OUT, { recursive:true }); } catch(e){}
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
function headText(word, y, fill){
  const est = word.length * 0.66 * 140;
  const fit = est > 900 ? ` textLength="960" lengthAdjust="spacingAndGlyphs"` : "";
  return `<text x="56" y="${y}" font-weight="800" font-size="140" letter-spacing="1" fill="${fill}"${fit}>${esc(word)}</text>`;
}
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
  return `<circle cx="${x0}" cy="${base}" r="6" fill="#E30613"/>
<polyline points="${pts.join(' ')}" fill="none" stroke="#000" stroke-width="3"/>`;
}
const towers = `
<g stroke="#c9c9c9" stroke-width="2">
  <rect x="664" y="150" width="84" height="386" fill="url(#th)"/>
  <rect x="826" y="150" width="74" height="386" fill="url(#th)"/>
</g>
<g stroke="#E30613" stroke-width="3.5" stroke-linecap="round">
  <line x1="975" y1="170" x2="975" y2="140"/><line x1="975" y1="258" x2="975" y2="288"/>
  <line x1="931" y1="214" x2="947" y2="214"/><line x1="1003" y1="214" x2="1019" y2="214"/>
  <line x1="944" y1="183" x2="923" y2="162"/><line x1="1006" y1="183" x2="1027" y2="162"/>
  <line x1="944" y1="245" x2="923" y2="266"/><line x1="1006" y1="245" x2="1027" y2="266"/>
</g>
<circle cx="975" cy="214" r="9" fill="#E30613"/>`;
const DEFS = `<defs>
  <g id="logoD" shape-rendering="crispEdges" transform="scale(0.66667)">
    <rect x="10" y="0" width="2" height="12"/><rect x="2" y="0" width="8" height="2"/><rect x="4" y="2" width="2" height="4"/>
    <rect x="2" y="6" width="2" height="2"/><rect x="0" y="8" width="12" height="2"/><rect x="0" y="10" width="2" height="2"/>
  </g>
  <pattern id="th" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
    <rect width="12" height="12" fill="#f4f4f4"/>
    <line x1="0" y1="0" x2="0" y2="12" stroke="#e3e3e3" stroke-width="4"/>
  </pattern>
</defs>`;

function plate(text, y){
  const w = Math.min(940, text.length*34+76);
  return `<rect x="60" y="${y}" width="${w}" height="96" fill="#E30613"/>
<text x="96" y="${y+64}" font-weight="800" font-size="52" letter-spacing="1" fill="#FFF">${esc(text)}</text>`;
}
function body(text, y0){
  return wrap(text, 41)
    .map((l,i)=>`<text x="60" y="${y0+i*56}" font-family="'Courier New',monospace" font-size="38" letter-spacing="0.2" fill="#000">${esc(l)}</text>`).join('\n');
}
function shell(n, total, inner){
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
${DEFS}
<rect width="1080" height="1350" fill="#FFFFFF"/>
<rect x="20" y="20" width="1040" height="1310" fill="none" stroke="#000" stroke-width="2"/>
<use href="#logoD" fill="#000" transform="translate(60,40) scale(4.0)"/>
<text x="540" y="72" text-anchor="middle" font-weight="800" font-size="46" letter-spacing="1" fill="#000">ДИСКРЕТ</text>
<text x="1020" y="66" text-anchor="end" font-family="'Courier New',monospace" font-size="19" letter-spacing="2" fill="#000">МАСТЕРСКИЕ</text>
<line x1="60" y1="96" x2="1020" y2="96" stroke="#000" stroke-width="2"/>
<text x="1020" y="134" text-anchor="end" font-family="'Courier New',monospace" font-size="20" letter-spacing="3" fill="#E30613">${n} / ${total}</text>
${inner}
<line x1="60" y1="1214" x2="1020" y2="1214" stroke="#000" stroke-width="2"/>
<text x="60" y="1258" font-family="'Courier New',monospace" font-size="18" letter-spacing="2" fill="#000">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>
<text x="60" y="1286" font-family="'Courier New',monospace" font-size="18" letter-spacing="2" fill="#000">ДИСКРЕТ.РФ</text>
<text x="1020" y="1252" text-anchor="end" font-weight="800" font-size="32" fill="#000">19.09.2026</text>
<text x="1020" y="1284" text-anchor="end" font-family="'Courier New',monospace" font-size="17" letter-spacing="2" fill="#E30613">ЗЕЛЕНОГРАД · МИЭТ</text>
</svg>`;
}
const kick = t => `<text x="60" y="206" font-family="'Courier New',monospace" font-size="27" letter-spacing="5" fill="#E30613">· ${esc(t)}</text>`;

// 01 · обложка
const c1 = shell('01','06', `${towers}
${kick('СОБРАТЬ И УНЕСТИ')}
${headText('МАСТЕРСКИЕ', 350, '#000')}
${headText('ДИСКРЕТА', 492, '#E30613')}
${shLine(60,1020,576,8)}
${body('Три мастер-класса для взрослых и четыре детских занятия: полевые записи на прогулке, circuit bending, пайка синтезатора — и детская, где звук собирают с шести лет. Готовый прибор уходит домой с вами.', 664)}
${plate('ПАЯЛЬНИК ДАЮТ В РУКИ', 1067)}`);

// 02 · прогулка
const c2 = shell('02','06', `${towers}
${kick('16:00–17:40 · ЛОКАЦИЯ УЛИЦА')}
${headText('ПОЛЕВЫЕ', 350, '#000')}
${headText('ЗАПИСИ', 492, '#E30613')}
${shLine(60,1020,576,8)}
${body('Прогулка с записью звуков города: 30-минутный инструктаж от Ильи Черткова, затем в путь с экспертом Владом Креймером (SOMA). Маршрут составил экскурсовод Павел Чукаев. Записи с наших диктофонов заберёте как материалы.', 664)}
${plate('3456 ₽ · ЗАПИСЬ ОТКРЫТА', 1067)}`);

// 03 · Шмонина
const c3 = shell('03','06', `${towers}
${kick('15:00–18:00 · ЗАЛ МАСТ·1')}
${headText('ХАОТИЧЕСКИЙ', 350, '#000')}
${headText('СИНТЕЗАТОР', 492, '#E30613')}
${shLine(60,1020,576,8)}
${body('Circuit bending с Полиной Шмониной: модифицируем усилитель и эхо-процессор, строим петли обратной связи и сенсорные контакты — сбои и глитчи становятся звуком. Для начинающих. Шумовой генератор уедет домой с вами.', 664)}
${plate('4567 ₽ · ЗАПИСЬ ОТКРЫТА', 1067)}`);

// 04 · Воронов
const c4 = shell('04','06', `${towers}
${kick('16:00–19:00 · ЗАЛ МАСТ·2')}
${headText('АНАЛОГОВЫЙ', 350, '#000')}
${headText('СИНТЕЗАТОР', 492, '#E30613')}
${shLine(60,1020,576,8)}
${body('Каждый участник спаяет синтезатор на интегральной микросхеме с Егором Вороновым: выводные компоненты, порядок сборки платы, желающим — SMD. Опыт не нужен, всё включено. Прибор уезжает домой с вами.', 664)}
${plate('4567 ₽ · ЗАПИСЬ ОТКРЫТА', 1067)}`);

// 05 · детская
const KIDS = [
  ['14:00','Мастерская звуков','6–12 лет · 876 ₽'],
  ['15:00','Собери свою гармошку!','Склад Ума · бесплатно'],
  ['16:00','Синтезатор из сковородки','10–99 лет · 987 ₽'],
  ['17:00','«Чувствую движение»','Склад Ума · бесплатно'],
];
const kidsRows = KIDS.map(([t,n,d],i)=>{
  const y = 672 + i*104;
  return `<text x="60" y="${y}" font-family="'Courier New',monospace" font-size="30" fill="#E30613">${t}</text>
<text x="200" y="${y}" font-weight="800" font-size="42" letter-spacing="0.5" fill="#000">${esc(n)}</text>
<text x="200" y="${y+40}" font-family="'Courier New',monospace" font-size="26" fill="#000">${esc(d)}</text>
<line x1="60" y1="${y+62}" x2="1020" y2="${y+62}" stroke="#000" stroke-width="1.5"/>`;
}).join('\n');
const c5 = shell('05','06', `${towers}
${kick('ДЕТСКАЯ · ЗАЛ ДЕТИ АЙКЬЮ')}
${headText('ДЕТЯМ', 350, '#000')}
${headText('СВОЁ', 492, '#E30613')}
${shLine(60,1020,576,8)}
${kidsRows}
${wrap('Бесплатные занятия — с регистрацией на инфостойке в день форума.', 52)
  .map((l,i)=>`<text x="60" y="${1118+i*42}" font-family="'Courier New',monospace" font-size="30" fill="#000">${esc(l)}</text>`).join('\n')}`);

// 06 · финал
const c6 = shell('06','06', `${towers}
${kick('19.09.2026 · 13:00–20:00')}
${headText('СОБРАТЬ И', 350, '#000')}
${headText('УНЕСТИ', 492, '#E30613')}
${shLine(60,1020,576,8)}
${body('Мастер-классы оплачиваются отдельно от входного билета, места ограничены размером мастерской. Запись — по ссылке в шапке профиля.', 664)}
${plate('МЕСТА ОГРАНИЧЕНЫ', 1067)}`);

// сторис 1080×1920
function story(){
  const secHead=(x,y,t)=>`<text x="${x}" y="${y}" font-family="'Courier New',monospace" font-size="24" letter-spacing="4" fill="#E30613">· ${esc(t)}</text>`;
  const row=(y,t,n,d)=>`<text x="60" y="${y}" font-family="'Courier New',monospace" font-size="26" fill="#E30613">${t}</text>
<text x="185" y="${y}" font-weight="800" font-size="34" letter-spacing="0.5" fill="#000">${esc(n)}</text>
<text x="185" y="${y+34}" font-family="'Courier New',monospace" font-size="23" fill="#000">${esc(d)}</text>`;
  const ADULTS=[
    ['16:00','Полевые записи · прогулка','Илья Чертков · улица · 3456 ₽'],
    ['15:00','Хаотический синтезатор','Полина Шмонина · МАСТ·1 · 4567 ₽'],
    ['16:00','Аналоговый синтезатор','Егор Воронов · МАСТ·2 · 4567 ₽'],
  ];
  const KIDS2=[
    ['14:00','Мастерская звуков','6–12 лет · 876 ₽'],
    ['15:00','Собери свою гармошку!','Склад Ума · бесплатно'],
    ['16:00','Синтезатор из сковородки','10–99 лет · 987 ₽'],
    ['17:00','«Чувствую движение»','Склад Ума · бесплатно'],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
${DEFS}
<rect width="1080" height="1920" fill="#FFFFFF"/>
<rect x="20" y="20" width="1040" height="1880" fill="none" stroke="#000" stroke-width="2"/>
<use href="#logoD" fill="#000" transform="translate(60,56) scale(5.0)"/>
<text x="540" y="98" text-anchor="middle" font-weight="800" font-size="54" letter-spacing="1" fill="#000">ДИСКРЕТ</text>
<text x="1020" y="90" text-anchor="end" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">МАСТЕРСКИЕ</text>
<line x1="60" y1="130" x2="1020" y2="130" stroke="#000" stroke-width="2"/>
<text x="60" y="248" font-weight="800" font-size="88" letter-spacing="1" fill="#000">МАСТЕРСКИЕ <tspan fill="#E30613">19.09</tspan></text>
${shLine(60,1020,306,7)}
${secHead(60,400,'ВЗРОСЛЫМ · С ПАЯЛЬНИКОМ И БЕЗ')}
${ADULTS.map((a,i)=>row(462+i*112, a[0], a[1], a[2])).join('\n')}
${secHead(60,830,'ДЕТСКАЯ · ЗАЛ ДЕТИ АЙКЬЮ')}
${KIDS2.map((a,i)=>row(892+i*112, a[0], a[1], a[2])).join('\n')}
<text x="60" y="1370" font-family="'Courier New',monospace" font-size="24" fill="#000">Бесплатные занятия — с регистрацией</text>
<text x="60" y="1406" font-family="'Courier New',monospace" font-size="24" fill="#000">на инфостойке в день форума.</text>
<text x="60" y="1478" font-family="'Courier New',monospace" font-size="24" fill="#000">Мастер-классы оплачиваются отдельно</text>
<text x="60" y="1514" font-family="'Courier New',monospace" font-size="24" fill="#000">от входного билета. Готовый прибор</text>
<text x="60" y="1550" font-family="'Courier New',monospace" font-size="24" fill="#000">уходит домой с вами.</text>
<rect x="60" y="1616" width="480" height="90" fill="#E30613"/>
<text x="78" y="1674" font-weight="800" font-size="38" letter-spacing="1" fill="#FFF">МЕСТА ОГРАНИЧЕНЫ</text>
<text x="600" y="1660" font-family="'Courier New',monospace" font-size="24" letter-spacing="1" fill="#000">запись — по ссылке</text>
<text x="600" y="1694" font-family="'Courier New',monospace" font-size="24" letter-spacing="1" fill="#000">в шапке профиля</text>
<text x="60" y="1770" font-family="'Courier New',monospace" font-size="20" letter-spacing="1" fill="#E30613">ЗЕЛЕНОГРАД · МИЭТ · 13:00–20:00</text>
<line x1="60" y1="1830" x2="1020" y2="1830" stroke="#000" stroke-width="2"/>
<text x="60" y="1872" font-family="'Courier New',monospace" font-size="19" letter-spacing="2" fill="#000">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>
<text x="1020" y="1872" text-anchor="end" font-weight="800" font-size="28" fill="#E30613">ДИСКРЕТ.РФ</text>
</svg>`;
}

[[1,c1],[2,c2],[3,c3],[4,c4],[5,c5],[6,c6]].forEach(([n,s])=>{
  fs.writeFileSync(`${OUT}/igmk-0${n}.svg`, s);
});
fs.writeFileSync(`${OUT}/igmk-story.svg`, story());
console.log('igmk-01..06 + igmk-story written');
