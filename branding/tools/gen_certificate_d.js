const fs = require('fs');
const OUT = __dirname + '/../renders/cert';
try { fs.mkdirSync(OUT, { recursive:true }); } catch(e){}

const W=1240, H=1754;
const DEFS = `<defs>
  <g id="logoD" shape-rendering="crispEdges" transform="scale(0.66667)">
    <rect x="10" y="0" width="2" height="12"/><rect x="2" y="0" width="8" height="2"/><rect x="4" y="2" width="2" height="4"/>
    <rect x="2" y="6" width="2" height="2"/><rect x="0" y="8" width="12" height="2"/><rect x="0" y="10" width="2" height="2"/>
  </g>
</defs>`;

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

// графа бланка: серая метка сверху, линия снизу, значение
function row(x,y,w,label,value,vc){
  return `<text x="${x}" y="${y}" font-family="'Courier New',monospace" font-size="14" letter-spacing="2" fill="#8a8a8a">${label}</text>
<text x="${x}" y="${y+44}" font-family="'Courier New',monospace" font-size="25" letter-spacing="1" fill="${vc||'#000'}"${vc?' font-weight="bold"':''}>${value}</text>
<line x1="${x}" y1="${y+60}" x2="${x+w}" y2="${y+60}" stroke="#000" stroke-width="1.6"/>`;
}

const RX=150; // основная рамка: широкое левое поле подшивки
const certD=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
${DEFS}
<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<rect x="30" y="30" width="${W-60}" height="${H-60}" fill="none" stroke="#000" stroke-width="1.2"/>
<rect x="${RX}" y="56" width="${W-RX-56}" height="${H-112}" fill="none" stroke="#000" stroke-width="3"/>

<text transform="translate(104,${H-120}) rotate(-90)" font-family="'Courier New',monospace" font-size="17" letter-spacing="6" fill="#000">ДИСКРЕТ · НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ · 19.09.2026</text>

<use href="#logoD" fill="#000" transform="translate(190,116) scale(5.4)"/>
<text x="242" y="160" font-weight="800" font-size="60" letter-spacing="2" fill="#000">ИСКРЕТ <tspan fill="#E30613">2026</tspan></text>
<text x="1128" y="126" text-anchor="end" font-family="'Courier New',monospace" font-size="16" letter-spacing="3" fill="#000">ФОРМА Д-26</text>
<text x="1128" y="152" text-anchor="end" font-family="'Courier New',monospace" font-size="16" letter-spacing="3" fill="#E30613">ЭКЗ. ЕДИНСТВ.</text>
<line x1="${RX}" y1="196" x2="${W-56}" y2="196" stroke="#000" stroke-width="2"/>

<text x="190" y="312" font-weight="800" font-size="96" letter-spacing="2" fill="#000">СЕРТИФИКАТ</text>
<text x="190" y="408" font-weight="800" font-size="96" letter-spacing="2" fill="#E30613">УЧАСТНИКА</text>
<text x="190" y="464" font-family="'Courier New',monospace" font-size="20" letter-spacing="3" fill="#000">ФОРМУЛЯР ИЗДЕЛИЯ «УЧАСТНИК ФОРУМА»</text>

${shLine(190,1088,530,7)}

${row(190,600,898,'НАИМЕНОВАНИЕ ИЗДЕЛИЯ','ЧЕЛОВЕК ТВОРЧЕСКИЙ, ПРИБОРОСТРОИТЕЛЬНЫЙ')}
${row(190,712,898,'ИМЯ И ФАМИЛИЯ','')}
${row(190,824,420,'ДАТА ВЫПУСКА','19.09.2026')}
${row(668,824,420,'МЕСТО СБОРКИ','ЗЕЛЕНОГРАД · НИУ МИЭТ')}
${row(190,936,898,'ПРОГРАММА ИСПЫТАНИЙ','ЭКСПО · ЛЕКТОРИЙ · МАСТЕРСКИЕ · ЧЕТЫРЕ СЦЕНЫ')}
${row(190,1048,898,'ЗАКЛЮЧЕНИЕ','ГОДЕН(НА) К ТВОРЧЕСКОМУ САМОВЫРАЖЕНИЮ','#E30613')}

<g transform="translate(880,1180) rotate(-8)">
  <rect x="-160" y="-64" width="320" height="128" fill="none" stroke="#E30613" stroke-width="5"/>
  <rect x="-150" y="-54" width="300" height="108" fill="none" stroke="#E30613" stroke-width="1.6"/>
  <text x="0" y="-18" text-anchor="middle" font-weight="800" font-size="34" letter-spacing="4" fill="#E30613">ПРОВЕРЕНО</text>
  <text x="0" y="14" text-anchor="middle" font-family="'Courier New',monospace" font-size="18" letter-spacing="3" fill="#E30613">ОТК · ДИСКРЕТ</text>
  <text x="0" y="42" text-anchor="middle" font-family="'Courier New',monospace" font-size="18" letter-spacing="3" fill="#E30613">19.09.2026</text>
</g>

<text x="190" y="1180" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">ТЕХНИЧЕСКОЕ РЕШЕНИЕ —</text>
<text x="190" y="1212" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">ИНСТРУМЕНТ САМОВЫРАЖЕНИЯ</text>

<!-- основная надпись (чертёжный штамп) -->
<g stroke="#000" stroke-width="2">
  <rect x="${RX}" y="1380" width="${W-RX-56}" height="262" fill="none" stroke-width="3"/>
  <line x1="${RX}" y1="1446" x2="${W-56}" y2="1446"/>
  <line x1="${RX}" y1="1512" x2="${W-56}" y2="1512"/>
  <line x1="${RX}" y1="1578" x2="${W-56}" y2="1578"/>
  <line x1="500" y1="1380" x2="500" y2="1642"/>
  <line x1="900" y1="1380" x2="900" y2="1642"/>
</g>
<text x="170" y="1420" font-family="'Courier New',monospace" font-size="14" letter-spacing="2" fill="#8a8a8a">РАЗРАБОТАНО</text>
<text x="520" y="1420" font-family="'Courier New',monospace" font-size="14" letter-spacing="2" fill="#8a8a8a">ПОДПИСЬ</text>
<text x="920" y="1420" font-family="'Courier New',monospace" font-size="14" letter-spacing="2" fill="#8a8a8a">ЛИСТ</text>
<text x="170" y="1494" font-family="'Courier New',monospace" font-size="22" fill="#000">ОРГКОМАНДА ФОРУМА</text>
<text x="920" y="1494" font-family="'Courier New',monospace" font-size="22" fill="#000">1 / 1</text>
<text x="170" y="1560" font-family="'Courier New',monospace" font-size="22" fill="#000">НИУ МИЭТ</text>
<text x="170" y="1622" font-weight="800" font-size="26" fill="#E30613">ДИСКРЕТ.РФ</text>
<text x="920" y="1622" font-family="'Courier New',monospace" font-size="18" letter-spacing="1" fill="#000">ЛЮДИ · ЗВУК</text>
</svg>`;

fs.writeFileSync(`${OUT}/certificate-d.svg`, certD);
console.log('certificate-d.svg written');
