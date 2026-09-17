const fs = require('fs');
const OUT = __dirname + '/../renders/insta';
try { fs.mkdirSync(OUT, { recursive:true }); } catch(e){}
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const EXPO = ['Kaleidoscope','ПРИБОР','Twang Modular','Solyara','Лаборатория звука МАЯК','ArtCraft workshop','LaserNoto','ЭФЭМИ','MXLS','SxLab','ЯНДЕКС','Резонанс','VG Line','Unheld modular','Paratek','УралСинтМаш','Alpha1 Midi Sequencer','СТК «Путь вперёд»','Edwards-audio','ФАЗА Электроника','Пикасо 3D','MADSOUNDFACTORY','PORKYSYNTH','Творческий центр ТРЕТИЙ ПУТЬ','Nakedboards','Ravzar','Микрофоны СОЮЗ','Noisescape'];
const ARTISTS = ['Там Огни | c0deterr0r','TiihayaRekaa','М.О.У.Б.','dr.SpaceKir','Alexander Turkin','Игра с тенью','H.Ruine','Анна Пряхина','Артемий Анрилов и xandr.vasiliev','Gogidze','RUBIGO FORTUNA'];
const LECTURES = ['Владимир Кабанов','Влад Креймер','Александр Пленингер','Александр Григорьев','Захар Лунев','Илья Чертков','Евгений Карло','Иван Антоновский','Игорь Мирзоев','Владимир Черепанов','Каут Алекс','Никита Забелин','Георгий Орлов-Давыдовский'];
const WORKSHOPS = ['Полина Шмонина · хаотический синтезатор','Егор Воронов · аналоговый синтезатор','Илья Чертков · полевые записи, прогулка','Олег Слуцкий · два детских семинара','Склад Ума · два детских семинара'];
const INSTALL = ['Анна Ходыкина','Лидия Симич','Олег Слуцкий','Роман Крылов'];

function wrap(text, max){
  const words=text.split(' '), lines=[]; let cur='';
  for(const w of words){
    if((cur+' '+w).trim().length>max){ lines.push(cur.trim()); cur=w; }
    else cur=(cur+' '+w).trim();
  }
  if(cur) lines.push(cur.trim());
  return lines;
}
function headText(word, y, fill, fw){
  const FW = fw||960;
  const est = word.length * 0.66 * 140;
  const fit = est > FW-60 ? ` textLength="${FW}" lengthAdjust="spacingAndGlyphs"` : "";
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

function shell(n, total, inner){
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
${DEFS}
<rect width="1080" height="1350" fill="#FFFFFF"/>
<rect x="20" y="20" width="1040" height="1310" fill="none" stroke="#000" stroke-width="2"/>
<use href="#logoD" fill="#000" transform="translate(60,40) scale(4.0)"/>
<text x="540" y="72" text-anchor="middle" font-weight="800" font-size="46" letter-spacing="1" fill="#000">ДИСКРЕТ</text>
<text x="1020" y="66" text-anchor="end" font-family="'Courier New',monospace" font-size="19" letter-spacing="2" fill="#000">СОСТАВ</text>
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

function listBlock(x, y, items, fs, lh){
  return items.map((n,i)=>`<text x="${x}" y="${y+i*lh}" font-family="'Courier New',monospace" font-size="${fs}" fill="#000">${esc(n)}</text>`).join('\n');
}

// 01 · обложка
const cover = shell('01','06', `${towers}
<text x="60" y="206" font-family="'Courier New',monospace" font-size="27" letter-spacing="5" fill="#E30613">· КТО ДЕЛАЕТ ФОРУМ 19.09</text>
${headText('СОСТАВ', 350, '#000')}
${headText('ФОРУМА', 492, '#E30613')}
${shLine(60,1020,576,8)}
${wrap('28 участников экспо, 11 артистов на четырёх сценах, 13 лекторов, пять мастер-классов и четыре инсталляции. Полный список — в карточках. Листайте.', 41)
  .map((l,i)=>`<text x="60" y="${664+i*56}" font-family="'Courier New',monospace" font-size="38" letter-spacing="0.2" fill="#000">${esc(l)}</text>`).join('\n')}
<rect x="60" y="960" width="700" height="96" fill="#E30613"/>
<text x="96" y="1024" font-weight="800" font-size="52" letter-spacing="1" fill="#FFF">ВЕСЬ СОСТАВ ВНУТРИ</text>`);

// 02 · экспо (2 колонки)
const expo = shell('02','06', `${towers}
<text x="60" y="206" font-family="'Courier New',monospace" font-size="27" letter-spacing="5" fill="#E30613">· ВСЁ ВКЛЮЧАЕТСЯ И ЗВУЧИТ</text>
${headText('ЭКСПО', 350, '#000')}
${headText('28 УЧАСТНИКОВ', 492, '#E30613')}
${shLine(60,1020,576,8)}
${listBlock(60, 656, EXPO.slice(0,14), 25, 42)}
${listBlock(560, 656, EXPO.slice(14), 25, 42)}`);

// 03 · артисты
const artists = shell('03','06', `${towers}
<text x="60" y="206" font-family="'Courier New',monospace" font-size="27" letter-spacing="5" fill="#E30613">· ЧЕТЫРЕ СЦЕНЫ ЖИВОГО ЗВУКА</text>
${headText('АРТИСТЫ', 350, '#000')}
${headText('11 СЕТОВ', 492, '#E30613')}
${shLine(60,1020,576,8)}
${listBlock(60, 664, ARTISTS, 30, 48)}`);

// 04 · лекторий
const lecture = shell('04','06', `${towers}
<text x="60" y="206" font-family="'Courier New',monospace" font-size="27" letter-spacing="5" fill="#E30613">· ДВА ЗАЛА И ДЕМО-СЦЕНА</text>
${headText('ЛЕКТОРИЙ', 350, '#000')}
${headText('13 ЛЕКТОРОВ', 492, '#E30613')}
${shLine(60,1020,576,8)}
${listBlock(60, 656, LECTURES.slice(0,7), 27, 44)}
${listBlock(560, 656, LECTURES.slice(7), 27, 44)}`);

// 05 · мастерские + инсталляции
const work = shell('05','06', `${towers}
<text x="60" y="206" font-family="'Courier New',monospace" font-size="27" letter-spacing="5" fill="#E30613">· РУКАМИ И В ПРОСТРАНСТВЕ</text>
${headText('МАСТЕРСКИЕ', 350, '#000')}
${headText('И ОБЪЕКТЫ', 492, '#E30613')}
${shLine(60,1020,576,8)}
<text x="60" y="650" font-family="'Courier New',monospace" font-size="23" letter-spacing="4" fill="#E30613">· МАСТЕР-КЛАССЫ</text>
${listBlock(60, 696, WORKSHOPS, 26, 44)}
<text x="60" y="960" font-family="'Courier New',monospace" font-size="23" letter-spacing="4" fill="#E30613">· ИНСТАЛЛЯЦИИ</text>
${listBlock(60, 1006, INSTALL.slice(0,3), 26, 44)}
${listBlock(560, 1006, INSTALL.slice(3), 26, 44)}`);

// 06 · финал
const fin = shell('06','06', `${towers}
<text x="60" y="206" font-family="'Courier New',monospace" font-size="27" letter-spacing="5" fill="#E30613">· 19.09.2026 · 13:00–20:00</text>
${headText('ДО ВСТРЕЧИ', 350, '#000')}
${headText('В МИЭТЕ', 492, '#E30613')}
${shLine(60,1020,576,8)}
${wrap('Каждый прибор на экспо можно включить и обсудить с автором. Лекторий входит в стандартный билет. Билеты — по ссылке в шапке профиля.', 41)
  .map((l,i)=>`<text x="60" y="${664+i*56}" font-family="'Courier New',monospace" font-size="38" letter-spacing="0.2" fill="#000">${esc(l)}</text>`).join('\n')}
<rect x="60" y="960" width="586" height="96" fill="#E30613"/>
<text x="96" y="1024" font-weight="800" font-size="52" letter-spacing="1" fill="#FFF">ВХОД ПО БИЛЕТАМ</text>`);

// сторис 1080×1920 — весь состав одним листом
function story(){
  const secHead=(x,y,t)=>`<text x="${x}" y="${y}" font-family="'Courier New',monospace" font-size="24" letter-spacing="4" fill="#E30613">· ${esc(t)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" font-family="'Arial Narrow','Helvetica Neue',Arial,sans-serif">
${DEFS}
<rect width="1080" height="1920" fill="#FFFFFF"/>
<rect x="20" y="20" width="1040" height="1880" fill="none" stroke="#000" stroke-width="2"/>
<use href="#logoD" fill="#000" transform="translate(60,56) scale(5.0)"/>
<text x="540" y="98" text-anchor="middle" font-weight="800" font-size="54" letter-spacing="1" fill="#000">ДИСКРЕТ</text>
<text x="1020" y="90" text-anchor="end" font-family="'Courier New',monospace" font-size="20" letter-spacing="2" fill="#000">СОСТАВ</text>
<line x1="60" y1="130" x2="1020" y2="130" stroke="#000" stroke-width="2"/>
<text x="60" y="236" font-weight="800" font-size="88" letter-spacing="1" fill="#000">СОСТАВ <tspan fill="#E30613">ФОРУМА</tspan></text>
<text x="1020" y="340" text-anchor="end" font-family="'Courier New',monospace" font-size="24" letter-spacing="2" fill="#E30613">19.09.2026</text>
${shLine(60,1020,290,7)}
${secHead(60,370,'ЭКСПО · 28')}
${listBlock(60, 412, EXPO.slice(0,14), 24, 36)}
${listBlock(60, 412+14*36+18, EXPO.slice(14), 24, 36)}
${secHead(600,370,'АРТИСТЫ · 11')}
${listBlock(600, 412, ARTISTS.map(a=>a==='Артемий Анрилов и xandr.vasiliev'?'Анрилов и xandr.vasiliev':a), 24, 36)}
${secHead(600,412+11*36+30,'ЛЕКТОРИЙ · 13')}
${listBlock(600, 412+11*36+72, LECTURES, 24, 36)}
${secHead(60,1420,'МАСТЕР-КЛАССЫ')}
${listBlock(60, 1462, ['Полина Шмонина','Егор Воронов','Илья Чертков','Олег Слуцкий','Склад Ума'], 24, 36)}
${secHead(60,1690,'ИНСТАЛЛЯЦИИ')}
${listBlock(60, 1732, INSTALL.slice(0,3), 24, 36)}
${listBlock(320, 1732, INSTALL.slice(3), 24, 36)}
<rect x="600" y="1560" width="420" height="90" fill="#E30613"/>
<text x="618" y="1618" font-weight="800" font-size="38" letter-spacing="1" fill="#FFF">ВХОД ПО БИЛЕТАМ</text>
<text x="600" y="1700" font-family="'Courier New',monospace" font-size="24" letter-spacing="1" fill="#000">билеты — по ссылке</text>
<text x="600" y="1736" font-family="'Courier New',monospace" font-size="24" letter-spacing="1" fill="#000">в шапке профиля</text>
<text x="600" y="1800" font-family="'Courier New',monospace" font-size="20" letter-spacing="1" fill="#E30613">ЗЕЛЕНОГРАД · МИЭТ · 13:00–20:00</text>
<line x1="60" y1="1830" x2="1020" y2="1830" stroke="#000" stroke-width="2"/>
<text x="60" y="1872" font-family="'Courier New',monospace" font-size="19" letter-spacing="2" fill="#000">НАУЧНО-ТЕХНИЧЕСКИЙ ФОРУМ ТВОРЧЕСКОГО ПРИБОРОСТРОЕНИЯ</text>
<text x="1020" y="1872" text-anchor="end" font-weight="800" font-size="28" fill="#E30613">ДИСКРЕТ.РФ</text>
</svg>`;
}

fs.writeFileSync(`${OUT}/ig-01.svg`, cover);
fs.writeFileSync(`${OUT}/ig-02.svg`, expo);
fs.writeFileSync(`${OUT}/ig-03.svg`, artists);
fs.writeFileSync(`${OUT}/ig-04.svg`, lecture);
fs.writeFileSync(`${OUT}/ig-05.svg`, work);
fs.writeFileSync(`${OUT}/ig-06.svg`, fin);
fs.writeFileSync(`${OUT}/ig-story.svg`, story());
console.log('ig-01..06 + ig-story written');
