const fs = require('fs');
const OUT = __dirname + '/../renders/cert';
try { fs.mkdirSync(OUT, { recursive:true }); } catch(e){}

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
const DEFS = `<defs>
  <g id="logoD" shape-rendering="crispEdges" transform="scale(0.66667)">
    <rect x="10" y="0" width="2" height="12"/><rect x="2" y="0" width="8" height="2"/><rect x="4" y="2" width="2" height="4"/>
    <rect x="2" y="6" width="2" height="2"/><rect x="0" y="8" width="12" height="2"/><rect x="0" y="10" width="2" height="2"/>
  </g>
  <pattern id="th" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
    <rect width="12" height="12" fill="#f6f6f6"/>
    <line x1="0" y1="0" x2="0" y2="12" stroke="#e3e3e3" stroke-width="4"/>
  </pattern>
</defs>`;
const sun = (cx,cy)=>`<g stroke="#E30613" stroke-width="4" stroke-linecap="round">
  <line x1="${cx}" y1="${cy-46}" x2="${cx}" y2="${cy-78}"/><line x1="${cx}" y1="${cy+46}" x2="${cx}" y2="${cy+78}"/>
  <line x1="${cx-46}" y1="${cy}" x2="${cx-78}" y2="${cy}"/><line x1="${cx+46}" y1="${cy}" x2="${cx+78}" y2="${cy}"/>
  <line x1="${cx-33}" y1="${cy-33}" x2="${cx-55}" y2="${cy-55}"/><line x1="${cx+33}" y1="${cy-33}" x2="${cx+55}" y2="${cy-55}"/>
  <line x1="${cx-33}" y1="${cy+33}" x2="${cx-55}" y2="${cy+55}"/><line x1="${cx+33}" y1="${cy+33}" x2="${cx+55}" y2="${cy+55}"/>
</g>
<circle cx="${cx}" cy="${cy}" r="10" fill="#E30613"/>`;

// ===== A4 альбомный · 1754×1240 =====
const Wl=1754, Hl=1240;
const landscape=`<svg xmlns="http://www.w3.org/2000/svg" width="${Wl}" height="${Hl}" viewBox="0 0 ${Wl} ${Hl}" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
${DEFS}
<rect width="${Wl}" height="${Hl}" fill="#FFFFFF"/>
<rect x="34" y="34" width="${Wl-68}" height="${Hl-68}" fill="none" stroke="#000" stroke-width="3"/>
<rect x="46" y="46" width="${Wl-92}" height="${Hl-92}" fill="none" stroke="#000" stroke-width="1.2"/>
<g stroke="#c9c9c9" stroke-width="2">
  <rect x="1280" y="120" width="90" height="330" fill="url(#th)"/>
  <rect x="1442" y="120" width="76" height="330" fill="url(#th)"/>
</g>
${sun(1600,196)}
<use href="#logoD" fill="#000" transform="translate(96,95) scale(6.85)"/>
<text x="162" y="150" font-weight="800" font-size="76" letter-spacing="2" fill="#000">ИСКРЕТ <tspan fill="#E30613">2026</tspan></text>
<text x="96" y="186" font-family="'Courier New',monospace" font-size="19" letter-spacing="4" fill="#000">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>
<text x="96" y="366" font-weight="800" font-size="128" letter-spacing="2" fill="#000">СЕРТИФИКАТ</text>
<text x="96" y="496" font-weight="800" font-size="128" letter-spacing="2" fill="#E30613">УЧАСТНИКА</text>
${shLine(96,1658,570,8)}
<text x="96" y="668" font-family="'Courier New',monospace" font-size="27" letter-spacing="3" fill="#000">НАСТОЯЩИМ ПОДТВЕРЖДАЕТСЯ, ЧТО</text>
<line x1="96" y1="790" x2="1274" y2="790" stroke="#000" stroke-width="2"/>
<text x="96" y="822" font-family="'Courier New',monospace" font-size="17" letter-spacing="3" fill="#8a8a8a">ИМЯ И ФАМИЛИЯ УЧАСТНИКА</text>
<text x="96" y="912" font-family="'Courier New',monospace" font-size="27" letter-spacing="2" fill="#000">ПРИНЯЛ(А) УЧАСТИЕ В ФОРУМЕ ДИСКРЕТ · 19 СЕНТЯБРЯ 2026 ГОДА</text>
<text x="96" y="952" font-family="'Courier New',monospace" font-size="27" letter-spacing="2" fill="#000">ЗЕЛЕНОГРАД · НИУ МИЭТ</text>
<rect x="1148" y="742" width="510" height="86" fill="#E30613"/>
<text x="1172" y="781" font-weight="800" font-size="26" fill="#FFF">ТЕХНИЧЕСКОЕ РЕШЕНИЕ —</text>
<text x="1172" y="813" font-weight="800" font-size="26" fill="#FFF">ИНСТРУМЕНТ САМОВЫРАЖЕНИЯ</text>
<line x1="1330" y1="990" x2="1658" y2="990" stroke="#000" stroke-width="2"/>
<text x="1330" y="1022" font-family="'Courier New',monospace" font-size="17" letter-spacing="3" fill="#8a8a8a">ОРГКОМАНДА ФОРУМА</text>
<line x1="96" y1="1096" x2="1658" y2="1096" stroke="#000" stroke-width="2.5"/>
<text x="96" y="1138" font-family="'Courier New',monospace" font-size="20" letter-spacing="3" fill="#000">ЛЮДИ · ЗВУК · ТЕХНОЛОГИИ · ИДЕИ</text>
<text x="1658" y="1138" text-anchor="end" font-weight="800" font-size="30" fill="#E30613">ДИСКРЕТ.РФ</text>
</svg>`;

// ===== A4 вертикальный · 1240×1754 =====
const W=1240, H=1754;
const portrait=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
${DEFS}
<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<rect x="34" y="34" width="${W-68}" height="${H-68}" fill="none" stroke="#000" stroke-width="3"/>
<rect x="46" y="46" width="${W-92}" height="${H-92}" fill="none" stroke="#000" stroke-width="1.2"/>

<g stroke="#c9c9c9" stroke-width="2">
  <rect x="800" y="130" width="82" height="320" fill="url(#th)"/>
  <rect x="948" y="130" width="70" height="320" fill="url(#th)"/>
</g>
${sun(1092,206)}

<use href="#logoD" fill="#000" transform="translate(90,102) scale(5.95)"/>
<text x="147" y="150" font-weight="800" font-size="66" letter-spacing="2" fill="#000">ИСКРЕТ <tspan fill="#E30613">2026</tspan></text>
<text x="90" y="186" font-family="'Courier New',monospace" font-size="16" letter-spacing="3" fill="#000">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ</text>
<text x="90" y="212" font-family="'Courier New',monospace" font-size="16" letter-spacing="3" fill="#000">ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>

<text x="90" y="620" font-weight="800" font-size="118" letter-spacing="2" fill="#000">СЕРТИФИКАТ</text>
<text x="90" y="740" font-weight="800" font-size="118" letter-spacing="2" fill="#E30613">УЧАСТНИКА</text>

${shLine(90,1150,820,8)}

<text x="90" y="930" font-family="'Courier New',monospace" font-size="26" letter-spacing="3" fill="#000">НАСТОЯЩИМ ПОДТВЕРЖДАЕТСЯ, ЧТО</text>

<line x1="90" y1="1056" x2="1150" y2="1056" stroke="#000" stroke-width="2"/>
<text x="90" y="1088" font-family="'Courier New',monospace" font-size="16" letter-spacing="3" fill="#8a8a8a">ИМЯ И ФАМИЛИЯ УЧАСТНИКА</text>

<text x="90" y="1180" font-family="'Courier New',monospace" font-size="26" letter-spacing="2" fill="#000">ПРИНЯЛ(А) УЧАСТИЕ В ФОРУМЕ ДИСКРЕТ</text>
<text x="90" y="1220" font-family="'Courier New',monospace" font-size="26" letter-spacing="2" fill="#000">19 СЕНТЯБРЯ 2026 ГОДА · ЗЕЛЕНОГРАД · НИУ МИЭТ</text>

<rect x="90" y="1320" width="560" height="86" fill="#E30613"/>
<text x="114" y="1359" font-weight="800" font-size="26" fill="#FFF">ТЕХНИЧЕСКОЕ РЕШЕНИЕ —</text>
<text x="114" y="1391" font-weight="800" font-size="26" fill="#FFF">ИНСТРУМЕНТ САМОВЫРАЖЕНИЯ</text>

<line x1="710" y1="1388" x2="1150" y2="1388" stroke="#000" stroke-width="2"/>
<text x="710" y="1420" font-family="'Courier New',monospace" font-size="16" letter-spacing="3" fill="#8a8a8a">ОРГКОМАНДА ФОРУМА</text>

<line x1="90" y1="1580" x2="1150" y2="1580" stroke="#000" stroke-width="2.5"/>
<text x="90" y="1624" font-family="'Courier New',monospace" font-size="19" letter-spacing="3" fill="#000">ЛЮДИ · ЗВУК · ТЕХНОЛОГИИ · ИДЕИ</text>
<text x="1150" y="1624" text-anchor="end" font-weight="800" font-size="30" fill="#E30613">ДИСКРЕТ.РФ</text>
</svg>`;

fs.writeFileSync(`${OUT}/certificate.svg`, landscape);
fs.writeFileSync(`${OUT}/certificate-vert.svg`, portrait);
console.log('certificate.svg + certificate-vert.svg written');
