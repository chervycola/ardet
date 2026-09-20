const fs = require('fs');
const OUT = __dirname + '/../renders/cert';
try { fs.mkdirSync(OUT, { recursive:true }); } catch(e){}

const W=1240, H=1754;
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

function shLine(x0,x1,base,q,sw){
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
<polyline points="${pts.join(' ')}" fill="none" stroke="#000" stroke-width="${sw||3}"/>`;
}
// равномерный прямоугольный меандр — «советский» орнамент из нашей волны
function meander(x0,x1,y,amp,period,stroke,sw){
  let pts=[`${x0},${y+amp}`], x=x0, up=false;
  while(x<x1){
    const nx=Math.min(x+period/2,x1);
    pts.push(`${nx},${up?y-amp:y+amp}`);
    pts.push(`${nx},${up?y+amp:y-amp}`);
    up=!up; x=nx;
  }
  pts.pop();
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`;
}
const sun=(cx,cy,s)=>`<g stroke="#E30613" stroke-width="${4*s}" stroke-linecap="round">
  <line x1="${cx}" y1="${cy-46*s}" x2="${cx}" y2="${cy-78*s}"/><line x1="${cx}" y1="${cy+46*s}" x2="${cx}" y2="${cy+78*s}"/>
  <line x1="${cx-46*s}" y1="${cy}" x2="${cx-78*s}" y2="${cy}"/><line x1="${cx+46*s}" y1="${cy}" x2="${cx+78*s}" y2="${cy}"/>
  <line x1="${cx-33*s}" y1="${cy-33*s}" x2="${cx-55*s}" y2="${cy-55*s}"/><line x1="${cx+33*s}" y1="${cy-33*s}" x2="${cx+55*s}" y2="${cy-55*s}"/>
  <line x1="${cx-33*s}" y1="${cy+33*s}" x2="${cx-55*s}" y2="${cy+55*s}"/><line x1="${cx+33*s}" y1="${cy+33*s}" x2="${cx+55*s}" y2="${cy+55*s}"/>
</g>
<circle cx="${cx}" cy="${cy}" r="${10*s}" fill="#E30613"/>`;

// ===== ВАРИАНТ B · помпезный, центрированный =====
const certB=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
${DEFS}
<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<rect x="30" y="30" width="${W-60}" height="${H-60}" fill="none" stroke="#000" stroke-width="5"/>
<rect x="48" y="48" width="${W-96}" height="${H-96}" fill="none" stroke="#000" stroke-width="1.5"/>
<g fill="#E30613">
  <rect x="30" y="30" width="26" height="26"/><rect x="${W-56}" y="30" width="26" height="26"/>
  <rect x="30" y="${H-56}" width="26" height="26"/><rect x="${W-56}" y="${H-56}" width="26" height="26"/>
</g>

${sun(620,170,1.0)}
<use href="#logoD" fill="#000" transform="translate(408,350) scale(5.25)"/>
<text x="462" y="392" font-weight="800" font-size="58" letter-spacing="3" fill="#000">ИСКРЕТ <tspan fill="#E30613">2026</tspan></text>
<text x="620" y="428" text-anchor="middle" font-family="'Courier New',monospace" font-size="17" letter-spacing="4" fill="#000">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>

<text x="620" y="640" text-anchor="middle" font-weight="800" font-size="126" letter-spacing="4" fill="#000">СЕРТИФИКАТ</text>
<text x="620" y="762" text-anchor="middle" font-weight="800" font-size="126" letter-spacing="4" fill="#E30613">УЧАСТНИКА</text>
<text x="620" y="822" text-anchor="middle" font-family="'Courier New',monospace" font-size="21" letter-spacing="6" fill="#000">№ ________</text>

${shLine(150,1090,884,7)}

<text x="620" y="980" text-anchor="middle" font-family="'Courier New',monospace" font-size="25" letter-spacing="3" fill="#000">НАСТОЯЩИМ ПОДТВЕРЖДАЕТСЯ, ЧТО</text>

<line x1="200" y1="1096" x2="1040" y2="1096" stroke="#000" stroke-width="2"/>
<text x="620" y="1128" text-anchor="middle" font-family="'Courier New',monospace" font-size="15" letter-spacing="3" fill="#8a8a8a">ИМЯ И ФАМИЛИЯ УЧАСТНИКА</text>

<text x="620" y="1210" text-anchor="middle" font-family="'Courier New',monospace" font-size="25" letter-spacing="2" fill="#000">ПРИНЯЛ(А) УЧАСТИЕ В ФОРУМЕ ДИСКРЕТ</text>
<text x="620" y="1248" text-anchor="middle" font-family="'Courier New',monospace" font-size="25" letter-spacing="2" fill="#000">19 СЕНТЯБРЯ 2026 ГОДА · ЗЕЛЕНОГРАД · НИУ МИЭТ</text>

<rect x="110" y="1310" width="1020" height="92" fill="#E30613"/>
<text x="620" y="1369" text-anchor="middle" font-weight="800" font-size="27" letter-spacing="1" fill="#FFF">ТЕХНИЧЕСКОЕ РЕШЕНИЕ — ИНСТРУМЕНТ САМОВЫРАЖЕНИЯ</text>

<line x1="150" y1="1510" x2="540" y2="1510" stroke="#000" stroke-width="2"/>
<text x="345" y="1542" text-anchor="middle" font-family="'Courier New',monospace" font-size="15" letter-spacing="3" fill="#8a8a8a">ОРГКОМАНДА ФОРУМА</text>
<line x1="700" y1="1510" x2="1090" y2="1510" stroke="#000" stroke-width="2"/>
<text x="895" y="1542" text-anchor="middle" font-family="'Courier New',monospace" font-size="15" letter-spacing="3" fill="#8a8a8a">НИУ МИЭТ</text>

<line x1="150" y1="1608" x2="1090" y2="1608" stroke="#000" stroke-width="2.5"/>
<text x="620" y="1652" text-anchor="middle" font-family="'Courier New',monospace" font-size="18" letter-spacing="4" fill="#000">ЛЮДИ · ЗВУК · ТЕХНОЛОГИИ · ИДЕИ · <tspan font-weight="bold" fill="#E30613">ДИСКРЕТ.РФ</tspan></text>
</svg>`;

// ===== ВАРИАНТ C · советский лоск =====
const IV="#f5efdf", RD="#C00A10", BK="#1a1a1a";
const certC=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
${DEFS}
<rect width="${W}" height="${H}" fill="${IV}"/>
<rect x="36" y="36" width="${W-72}" height="${H-72}" fill="none" stroke="${RD}" stroke-width="10"/>
<rect x="58" y="58" width="${W-116}" height="${H-116}" fill="none" stroke="${BK}" stroke-width="2"/>

${meander(90,1150,118,9,36,RD,3)}
${meander(90,1150,H-118,9,36,RD,3)}

<use href="#logoD" fill="${RD}" transform="translate(362,247) scale(4.9)"/>
<text x="414" y="286" font-weight="800" font-size="54" letter-spacing="6" fill="${BK}">ИСКРЕТ · 2026</text>
<text x="620" y="322" text-anchor="middle" font-family="'Courier New',monospace" font-size="16" letter-spacing="5" fill="${BK}">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ</text>
<text x="620" y="348" text-anchor="middle" font-family="'Courier New',monospace" font-size="16" letter-spacing="5" fill="${BK}">ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>

${sun(620,470,1.15)}

<text x="620" y="700" text-anchor="middle" font-weight="800" font-size="120" letter-spacing="10" fill="${RD}">СЕРТИФИКАТ</text>
<text x="620" y="778" text-anchor="middle" font-weight="800" font-size="52" letter-spacing="16" fill="${BK}">УЧАСТНИКА</text>

<text x="620" y="920" text-anchor="middle" font-family="'Courier New',monospace" font-size="24" letter-spacing="2" fill="${BK}">НАСТОЯЩИЙ СЕРТИФИКАТ ВЫДАН</text>

<line x1="220" y1="1040" x2="1020" y2="1040" stroke="${BK}" stroke-width="2"/>
<text x="620" y="1072" text-anchor="middle" font-family="'Courier New',monospace" font-size="15" letter-spacing="3" fill="#8b8371">ИМЯ И ФАМИЛИЯ</text>

<text x="620" y="1160" text-anchor="middle" font-family="'Courier New',monospace" font-size="24" letter-spacing="2" fill="${BK}">В ТОМ, ЧТО ОН(А) ПРИНЯЛ(А) УЧАСТИЕ</text>
<text x="620" y="1198" text-anchor="middle" font-family="'Courier New',monospace" font-size="24" letter-spacing="2" fill="${BK}">В ФОРУМЕ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ ДИСКРЕТ</text>
<text x="620" y="1236" text-anchor="middle" font-family="'Courier New',monospace" font-size="24" letter-spacing="2" fill="${BK}">19 СЕНТЯБРЯ 2026 ГОДА · ГОРОД ЗЕЛЕНОГРАД · НИУ МИЭТ</text>

<text x="620" y="1350" text-anchor="middle" font-weight="800" font-size="27" letter-spacing="1" fill="${RD}">ТЕХНИЧЕСКОЕ РЕШЕНИЕ — ИНСТРУМЕНТ САМОВЫРАЖЕНИЯ</text>

<line x1="380" y1="1470" x2="860" y2="1470" stroke="${BK}" stroke-width="2"/>
<text x="620" y="1502" text-anchor="middle" font-family="'Courier New',monospace" font-size="15" letter-spacing="3" fill="#8b8371">ОРГКОМАНДА ФОРУМА</text>

<text x="620" y="1586" text-anchor="middle" font-family="'Courier New',monospace" font-size="17" letter-spacing="4" fill="${BK}">ЛЮДИ · ЗВУК · ТЕХНОЛОГИИ · ИДЕИ</text>
</svg>`;

fs.writeFileSync(`${OUT}/certificate-b.svg`, certB);
fs.writeFileSync(`${OUT}/certificate-c.svg`, certC);
console.log('certificate-b.svg + certificate-c.svg written');
