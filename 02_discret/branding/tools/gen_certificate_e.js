const fs = require('fs');
const OUT = __dirname + '/../renders/cert';
try { fs.mkdirSync(OUT, { recursive:true }); } catch(e){}

const W=1240, H=1754;
const BG="#0a0a0a", FG="#f2f2f2", GR="#9a9a9a", RD="#FF2E3B";

function shLine(x0,x1,base,q,color,sw){
  const LV=[0,-1,1,0,-2,2,-1,3,1,0,-2,1,-1,2,0,-1,0];
  const WD=[60,34,28,46,30,26,34,40,30,52,32,28,38,30,44,36,60];
  const tw=WD.reduce((a,b)=>a+b,0), k=(x1-x0)/tw;
  let x=x0, pts=[`${x0},${base+LV[0]*q}`];
  for(let i=0;i<LV.length;i++){
    x+=WD[i]*k;
    pts.push(`${Math.round(x)},${base+LV[i]*q}`);
    if(i<LV.length-1) pts.push(`${Math.round(x)},${base+LV[i+1]*q}`);
  }
  return `<circle cx="${x0}" cy="${base}" r="7" fill="${RD}"/>
<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
}

// сетка осциллографа
let grid='';
for(let x=68; x<=W-68; x+=52){ grid+=`<line x1="${x}" y1="68" x2="${x}" y2="${H-68}" stroke="#1c1c1c" stroke-width="1"/>\n`; }
for(let y=68; y<=H-68; y+=52){ grid+=`<line x1="68" y1="${y}" x2="${W-68}" y2="${y}" stroke="#1c1c1c" stroke-width="1"/>\n`; }
for(let x=68; x<=W-68; x+=260){ grid+=`<line x1="${x}" y1="68" x2="${x}" y2="${H-68}" stroke="#292929" stroke-width="1.4"/>\n`; }
for(let y=68; y<=H-68; y+=260){ grid+=`<line x1="68" y1="${y}" x2="${W-68}" y2="${y}" stroke="#292929" stroke-width="1.4"/>\n`; }

const certE=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
<defs>
  <g id="logoD" shape-rendering="crispEdges" transform="scale(0.66667)">
    <rect x="10" y="0" width="2" height="12"/><rect x="2" y="0" width="8" height="2"/><rect x="4" y="2" width="2" height="4"/>
    <rect x="2" y="6" width="2" height="2"/><rect x="0" y="8" width="12" height="2"/><rect x="0" y="10" width="2" height="2"/>
  </g>
</defs>
<rect width="${W}" height="${H}" fill="${BG}"/>
${grid}
<rect x="46" y="46" width="${W-92}" height="${H-92}" fill="none" stroke="${FG}" stroke-width="2.5"/>
<rect x="68" y="68" width="${W-136}" height="${H-136}" fill="none" stroke="#3a3a3a" stroke-width="1"/>

<use href="#logoD" fill="${FG}" transform="translate(110,120) scale(5.95)"/>
<text x="167" y="168" font-weight="800" font-size="66" letter-spacing="2" fill="${FG}">ИСКРЕТ <tspan fill="${RD}">2026</tspan></text>
<text x="110" y="206" font-family="'Courier New',monospace" font-size="16" letter-spacing="3" fill="${GR}">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>
<text x="1130" y="130" text-anchor="end" font-family="'Courier New',monospace" font-size="15" letter-spacing="3" fill="${RD}">НОЧНАЯ СМЕНА</text>
<text x="1130" y="156" text-anchor="end" font-family="'Courier New',monospace" font-size="15" letter-spacing="3" fill="${GR}">CH1 · 19.09.2026</text>

<text x="110" y="440" font-weight="800" font-size="118" letter-spacing="2" fill="${FG}">СЕРТИФИКАТ</text>
<text x="110" y="560" font-weight="800" font-size="118" letter-spacing="2" fill="${RD}">УЧАСТНИКА</text>

${shLine(110,1130,712,22,FG,5)}
${shLine(110,1130,712,22,'rgba(255,46,59,0.28)',14)}

<text x="110" y="900" font-family="'Courier New',monospace" font-size="26" letter-spacing="3" fill="${FG}">НАСТОЯЩИМ ПОДТВЕРЖДАЕТСЯ, ЧТО</text>

<line x1="110" y1="1026" x2="1130" y2="1026" stroke="${FG}" stroke-width="2"/>
<text x="110" y="1058" font-family="'Courier New',monospace" font-size="16" letter-spacing="3" fill="${GR}">ИМЯ И ФАМИЛИЯ УЧАСТНИКА</text>

<text x="110" y="1150" font-family="'Courier New',monospace" font-size="26" letter-spacing="2" fill="${FG}">ПРИНЯЛ(А) УЧАСТИЕ В ФОРУМЕ ДИСКРЕТ</text>
<text x="110" y="1190" font-family="'Courier New',monospace" font-size="26" letter-spacing="2" fill="${FG}">19 СЕНТЯБРЯ 2026 ГОДА · ЗЕЛЕНОГРАД · НИУ МИЭТ</text>

<rect x="110" y="1290" width="560" height="86" fill="${RD}"/>
<text x="134" y="1329" font-weight="800" font-size="26" fill="#0a0a0a">ТЕХНИЧЕСКОЕ РЕШЕНИЕ —</text>
<text x="134" y="1361" font-weight="800" font-size="26" fill="#0a0a0a">ИНСТРУМЕНТ САМОВЫРАЖЕНИЯ</text>

<line x1="720" y1="1358" x2="1130" y2="1358" stroke="${FG}" stroke-width="2"/>
<text x="720" y="1390" font-family="'Courier New',monospace" font-size="16" letter-spacing="3" fill="${GR}">ОРГКОМАНДА ФОРУМА</text>

<line x1="110" y1="1560" x2="1130" y2="1560" stroke="${FG}" stroke-width="2.5"/>
<text x="110" y="1604" font-family="'Courier New',monospace" font-size="19" letter-spacing="3" fill="${FG}">ЛЮДИ · ЗВУК · ТЕХНОЛОГИИ · ИДЕИ</text>
<text x="1130" y="1604" text-anchor="end" font-weight="800" font-size="30" fill="${RD}">ДИСКРЕТ.РФ</text>
</svg>`;

fs.writeFileSync(`${OUT}/certificate-e.svg`, certE);
console.log('certificate-e.svg written');
