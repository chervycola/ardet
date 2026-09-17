const fs = require('fs');
const OUT = __dirname + '/../renders/mk-post';
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
const c1 = shell('01','04', `${towers}
${kick('СОБРАТЬ И УНЕСТИ')}
${headText('МАСТЕРСКИЕ', 350, '#000')}
${headText('ДИСКРЕТА', 492, '#E30613')}
${shLine(60,1020,576,8)}
${body('Два зала мастерских и детская программа: circuit bending с Полиной Шмониной, пайка аналогового синтезатора с Егором Вороновым и четыре детских занятия от Олега Слуцкого и Склада Ума.', 664)}
${plate('ПАЯЛЬНИК ДАЮТ В РУКИ', 1067)}`);

// 02 · Шмонина
const c2 = shell('02','04', `${towers}
${kick('15:00–18:00 · ЗАЛ МАСТ·1')}
${headText('ХАОТИЧЕСКИЙ', 350, '#000')}
${headText('СИНТЕЗАТОР', 492, '#E30613')}
${shLine(60,1020,576,8)}
${body('Circuit bending с Полиной Шмониной: модифицируем усилитель и эхо-процессор, строим петли обратной связи и сенсорные контакты — сбои и глитчи становятся звуком. Для начинающих. Шумовой генератор уедет домой с вами.', 664)}
${plate('4567 ₽ · ЗАПИСЬ ОТКРЫТА', 1067)}`);

// 03 · Воронов
const c3 = shell('03','04', `${towers}
${kick('16:00–19:00 · ЗАЛ МАСТ·2')}
${headText('АНАЛОГОВЫЙ', 350, '#000')}
${headText('СИНТЕЗАТОР', 492, '#E30613')}
${shLine(60,1020,576,8)}
${body('Каждый участник спаяет синтезатор на интегральной микросхеме с Егором Вороновым: выводные компоненты, порядок сборки платы, желающим — SMD. Опыт не нужен, всё включено. Прибор уезжает домой с вами.', 664)}
${plate('4567 ₽ · ЗАПИСЬ ОТКРЫТА', 1067)}`);

// 04 · детская
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
const c4 = shell('04','04', `${towers}
${kick('ДЕТСКАЯ · ЗАЛ ДЕТИ АЙКЬЮ')}
${headText('ДЕТЯМ', 350, '#000')}
${headText('СВОЁ', 492, '#E30613')}
${shLine(60,1020,576,8)}
${kidsRows}
${wrap('Бесплатные занятия — с регистрацией на инфостойке в день форума.', 52)
  .map((l,i)=>`<text x="60" y="${1118+i*42}" font-family="'Courier New',monospace" font-size="30" fill="#000">${esc(l)}</text>`).join('\n')}`);

[[1,c1],[2,c2],[3,c3],[4,c4]].forEach(([n,s])=>{
  fs.writeFileSync(`${OUT}/mkp-0${n}.svg`, s);
});
console.log('mkp-01..04 written');
