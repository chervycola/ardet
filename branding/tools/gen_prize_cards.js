const fs = require('fs');
const OUT = __dirname + '/../renders/prize';
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
function shLine(){
  const LV=[0,-1,1,0,-2,2,-1,3,1,0,-2,1,-1,2,0,-1,0];
  const WD=[60,34,28,46,30,26,34,40,30,52,32,28,38,30,44,36,60];
  const x0=60,x1=1020,base=576,q=8;
  const tw=WD.reduce((a,b)=>a+b,0), k=(x1-x0)/tw;
  let x=x0, pts=[`${x0},${base+LV[0]*q}`];
  for(let i=0;i<LV.length;i++){
    x+=WD[i]*k;
    pts.push(`${Math.round(x)},${base+LV[i]*q}`);
    if(i<LV.length-1) pts.push(`${Math.round(x)},${base+LV[i+1]*q}`);
  }
  return `<circle cx="60" cy="576" r="6" fill="#E30613"/>
<polyline points="${pts.join(' ')}" fill="none" stroke="#000" stroke-width="3"/>`;
}
function plate(text, y){
  const w = Math.min(940, text.length*34+76);
  return `<rect x="60" y="${y}" width="${w}" height="96" fill="#E30613"/>
<text x="96" y="${y+64}" font-weight="800" font-size="52" letter-spacing="1" fill="#FFF">${esc(text)}</text>`;
}
function bodyLines(text, maxc, y0, fsz, lh){
  return wrap(text, maxc)
    .map((l,i)=>`<text x="60" y="${y0+i*lh}" font-family="'Courier New',monospace" font-size="${fsz}" letter-spacing="0.2" fill="#000">${esc(l)}</text>`).join('\n');
}
function card(n, kicker, h1, h2, content){
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
<defs>
  <g id="logoD" shape-rendering="crispEdges" transform="scale(0.66667)">
    <rect x="10" y="0" width="2" height="12"/><rect x="2" y="0" width="8" height="2"/><rect x="4" y="2" width="2" height="4"/>
    <rect x="2" y="6" width="2" height="2"/><rect x="0" y="8" width="12" height="2"/><rect x="0" y="10" width="2" height="2"/>
  </g>
  <pattern id="th" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
    <rect width="12" height="12" fill="#f4f4f4"/>
    <line x1="0" y1="0" x2="0" y2="12" stroke="#e3e3e3" stroke-width="4"/>
  </pattern>
</defs>
<rect width="1080" height="1350" fill="#FFFFFF"/>
<rect x="20" y="20" width="1040" height="1310" fill="none" stroke="#000" stroke-width="2"/>
<use href="#logoD" fill="#000" transform="translate(60,40) scale(4.0)"/>
<text x="540" y="72" text-anchor="middle" font-weight="800" font-size="46" letter-spacing="1" fill="#000">ДИСКРЕТ</text>
<text x="1020" y="66" text-anchor="end" font-family="'Courier New',monospace" font-size="19" letter-spacing="2" fill="#000">ПРИЗЫ</text>
<line x1="60" y1="96" x2="1020" y2="96" stroke="#000" stroke-width="2"/>
<text x="1020" y="134" text-anchor="end" font-family="'Courier New',monospace" font-size="20" letter-spacing="3" fill="#E30613">${n} / 04</text>
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
<circle cx="975" cy="214" r="9" fill="#E30613"/>
<text x="60" y="206" font-family="'Courier New',monospace" font-size="27" letter-spacing="5" fill="#E30613">· ${esc(kicker)}</text>
${headText(h1, 350, '#000')}
${headText(h2, 492, '#E30613')}
${shLine()}
${content}
<line x1="60" y1="1214" x2="1020" y2="1214" stroke="#000" stroke-width="2"/>
<text x="60" y="1258" font-family="'Courier New',monospace" font-size="18" letter-spacing="2" fill="#000">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>
<text x="60" y="1286" font-family="'Courier New',monospace" font-size="18" letter-spacing="2" fill="#000">ДИСКРЕТ.РФ</text>
<text x="1020" y="1252" text-anchor="end" font-weight="800" font-size="32" fill="#000">19.09.2026</text>
<text x="1020" y="1284" text-anchor="end" font-family="'Courier New',monospace" font-size="17" letter-spacing="2" fill="#E30613">ЗЕЛЕНОГРАД · МИЭТ</text>
</svg>`;
}

// 01 — обложка: фонд и Резонит
const c1 = card('01', 'ФОКУС НА ЭКСПО', 'ПРИЗОВАЯ', 'ПРОГРАММА',
  bodyLines('Делаем больший фокус на экспо: создан призовой фонд памятных призов для участников. Партнёр фонда — компания Резонит. Для производителей и разработчиков творческих приборов — три номинации.', 41, 664, 38, 56) + `
${plate('ТРИ НОМИНАЦИИ', 1067)}
<image x="660" y="1076" width="360" height="79" href="mono/rezonit.png" preserveAspectRatio="xMidYMid meet"/>`);

// 02 — номинации и как участвовать
const noms = [['01','СЛЕДУЮЩАЯ РЕВИЗИЯ'],['02','ИНЖЕНЕРНОЕ РЕШЕНИЕ'],['03','ЦЕЛЬНОСТЬ УСТРОЙСТВА']];
const nomRows = noms.map(([n,t],i)=>{
  const y = 688 + i*92;
  return `<text x="60" y="${y}" font-family="'Courier New',monospace" font-size="30" fill="#E30613">${n}</text>
<text x="140" y="${y}" font-weight="800" font-size="54" letter-spacing="1" fill="#000">${esc(t)}</text>
<line x1="60" y1="${y+26}" x2="1020" y2="${y+26}" stroke="#000" stroke-width="1.5"/>`;
}).join('\n');
const c2 = card('02', 'ДЛЯ УЧАСТНИКОВ ЭКСПО', 'ТРИ', 'НОМИНАЦИИ',
  nomRows + '\n' +
  bodyLines('Участвует любой зарегистрированный участник экспо: расскажи о проекте экспертному жюри на своём стенде или в короткой презентации на демо-сцене.', 52, 952, 30, 42) + `
${plate('ИТОГИ — В КОНЦЕ ДНЯ', 1086)}`);

// 03 — DJ Store и Пикасо 3D
const c3 = card('03', 'ОБОРУДОВАНИЕ И АКСЕССУАРЫ', 'ЗВУК', 'И ПОРЯДОК',
  bodyLines('DJ Store — звуковое оборудование столов выставки и демо-зоны: безопасное прослушивание и подключение к звуковым системам. Пикасо 3D — настольные аксессуары против хаоса проводов и тематические призы всем посетителям форума.', 41, 664, 38, 56) + `
<image x="60" y="1072" width="330" height="86" href="mono/djstore.png" preserveAspectRatio="xMidYMid meet"/>
<image x="500" y="1086" width="400" height="58" href="mono/picaso.png" preserveAspectRatio="xMidYMid meet"/>`);

// 04 — коллаборация с МИЭТ
const c4 = card('04', 'КОЛЛАБОРАЦИЯ С УНИВЕРСИТЕТОМ', 'ПРИЗЫ', 'ОТ МИЭТ',
  bodyLines('Для лекторов, артистов и ведущих мастер-классов подготовлены эксклюзивные призы в коллаборации с НИУ МИЭТ. Результаты всех номинаций объявим при подведении итогов форума.', 41, 664, 38, 56) + `
<rect x="60" y="944" width="360" height="104" fill="none" stroke="#000" stroke-width="3"/>
<text x="240" y="1012" text-anchor="middle" font-weight="800" font-size="46" letter-spacing="3" fill="#000">НИУ МИЭТ</text>
${plate('УВИДИМСЯ НА ИТОГАХ', 1086)}`);

[[1,c1],[2,c2],[3,c3],[4,c4]].forEach(([n,s])=>{
  fs.writeFileSync(`${OUT}/prize-0${n}.svg`, s);
});
console.log('prize-01..04 written');
