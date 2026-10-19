// ═══════════════════════════════════════
// LOCATION DRAW FUNCTIONS — procedural pixel art
// ═══════════════════════════════════════
import { rect, px, dither, hash } from '../../render/draw.js';
import { X } from '../../render/context.js';
import { t } from '../../core/time.js';
import { phaseAt } from '../../world/sky.js';
import { playerNearLoc } from '../../core/playerRef.js';
import { locations as locs } from '../../world/locations.js';
import { drawDumpsterDemon } from '../npcs/dumpster.js';
// места по канону — сверены с осмотром и описью сцены (sprites/locations/canon.js)
export { draw_office, draw_gates, draw_train, draw_theater, draw_terminal, draw_powerline, draw_crater, draw_nocturnal, draw_campfire, draw_pithos, draw_lantern1, draw_church, draw_library, draw_fountain, draw_cross, draw_radio, draw_tent } from './canon.js';

const P = {
  d1: '#0a0a0a', d2: '#6b0f1a', dgrey: '#2a2a2a', dstone: '#3a3a2a',
  ash: '#8a8d8f', bone: '#e8dcc8', dbone: '#c8b8a8',
  crimson: '#6b0f1a', gold: '#b8860b', amber: '#daa520', damber: '#a07818',
  term: '#8CC63F', termd: '#33431a',          // экран терминала — третья краска (код), weave/INK.md
  dwood: '#1a0e06', f1: '#ff6600', f2: '#ff3300',
  toxic: '#747963', g1: '#1a1810', g2: '#141208',   // яд — мглой с налётом, без неона (канон)
  fg1: '#0e1a08', fg2: '#1a2812', tg1: '#1a2a0e',
  // ported from monolith — referenced w/o ||-fallback
  rust: '#6b0f1a', drust: '#4a0a12',
  blood: '#8b0000', volcanic: '#8b0000',
  dtoxic: '#2f372c', btoxic: '#505948',
  stone: '#4a4844', lstone: '#8a8d8f',
  wood: '#4a3a2a', lwood: '#6a5a42',
  lgrey: '#bdb7a8',
  f3: '#8b0000', f4: '#b8860b',
  g3: '#16100a',
  indigo: '#252b22', celestial: '#6b726d',          // синего в палитре нет: глубь — мглой, небо в воде — пеплом
  sunflower: '#daa520',
  parchment: '#e8d8b0',
};

function drawBuildingSilhouette(x, y, w, h, roofColor) {
  rect(X, x, y, w, h, P.dstone);
  rect(X, x + 2, y + 2, w - 4, h - 4, '#1a1a22');
  rect(X, x, y, w, 2, roofColor || P.dgrey);
  for (let wy = 10; wy < h - 8; wy += 14) {
    for (let wx = 6; wx < w - 8; wx += 16) {
      rect(X, x + wx, y + wy, 3, 4, '#050305');
    }
  }
}

let npcProximity = 0;


export function draw_vending(x, y) {
    // ═══ VENDING MACHINE — Nosedive rating + Merits ═══
    X.globalAlpha=.3;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+18,y+56,22,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;
    // Main body
    rect(X,x,y,36,54,P.dgrey);
    rect(X,x+1,y+1,34,52,P.ash);
    rect(X,x+2,y+2,32,50,P.dstone);
    // Rust patches
    dither(X,x+3,y+20,8,18,P.rust,P.ash,.35);
    dither(X,x+26,y+28,7,16,P.drust,P.ash,.3);
    // Top display — flickering
    const fl=hash(0,t*.012,77)>.08?1:.2;
    X.globalAlpha=fl;
    rect(X,x+6,y+4,24,16,'#0a0a1a');
    // "ОБМЕН" label
    rect(X,x+8,y+7,16,2,P.amber);
    // Rating display — 4.7★ Nosedive style
    X.globalAlpha=fl*.9;
    rect(X,x+9,y+11,2,2,P.gold);rect(X,x+11,y+11,1,1,P.damber); // star
    rect(X,x+13,y+11,2,2,P.amber); // 4
    rect(X,x+16,y+11,1,2,P.amber); // .
    rect(X,x+18,y+11,2,2,P.amber); // 7
    X.globalAlpha=1;
    // 4 window cells with items (mice)
    for(let i=0;i<4;i++){
      rect(X,x+7+i*7,y+24,5,5,P.dgrey);
      rect(X,x+8+i*7,y+25,3,3,'#0a0a0e');
      // One window has a mouse inside
      if(i===1){
        rect(X,x+9,y+26,2,1,'#1a1a1a'); // mouse body
        if(t%12<6)px(X,x+9,y+26,'#6b0f1a'); // eye
      }
      // Another has a coin stuck
      if(i===2){
        px(X,x+16,y+27,P.gold);
      }
    }
    // Keypad
    rect(X,x+8,y+32,20,14,'#0a0a0a');
    for(let row=0;row<3;row++)for(let col=0;col<4;col++){
      rect(X,x+9+col*5,y+33+row*4,3,3,P.dgrey);
    }
    // Coin slot (welded shut)
    rect(X,x+8,y+48,20,2,'#1a1a1a');
    X.fillStyle='#6b0f1a';
    rect(X,x+10,y+48,3,1); // weld mark
    rect(X,x+16,y+48,2,1);
    rect(X,x+22,y+48,3,1);
    // Bottom lip
    rect(X,x+4,y+52,28,2,P.amber);
    // "PRESS TO SPIN" label (faded, broken)
    X.globalAlpha=.4;
    X.fillStyle='#1a1a1a';
    rect(X,x+10,y+29,16,1);
    X.globalAlpha=1;
    // Cracked screen line
    X.strokeStyle=P.lgrey;X.lineWidth=1;
    X.beginPath();X.moveTo(x+9,y+5);X.lineTo(x+22,y+15);X.stroke();
    // Small "5 ⭐" graffiti on the side
    X.fillStyle=P.gold;
    px(X,x+32,y+30);px(X,x+33,y+30);px(X,x+32,y+31);
    // Moss at base
    rect(X,x,y+52,3,2,P.dtoxic);
    px(X,x+1,y+51,P.toxic);
}

export function draw_graffiti(x, y) {
    // ═══ GRAFFITI WALL — layered slogans through the years ═══
    // Base concrete wall
    rect(X,x,y,58,42,P.stone);
    rect(X,x+1,y+1,56,40,P.dstone);
    // Cracks
    X.fillStyle='#0a0a0e';
    for(let i=0;i<5;i++){
      rect(X,x+2+hash(i,0,11)*54,y+2+hash(i,0,22)*38,1,3+hash(i,0,33)*4);
    }

    // ── LAYER 1 (oldest) — advertising ghost ──
    X.globalAlpha=.2;
    dither(X,x+3,y+3,52,36,P.damber,P.stone,.4);
    // Fragment of "БУДЬ В КАЧЕ" (be in quality, old ad)
    rect(X,x+6,y+6,3,1,P.damber);rect(X,x+10,y+6,3,1,P.damber);
    rect(X,x+14,y+6,3,1,P.damber);rect(X,x+18,y+6,3,1,P.damber);
    X.globalAlpha=1;

    // ── LAYER 2 — "СИСТЕМА МЕРТВА" big red ──
    X.fillStyle='#6b0f1a';
    rect(X,x+4,y+10,4,2);rect(X,x+4,y+12,2,4); // С
    rect(X,x+9,y+10,5,1);rect(X,x+11,y+10,2,6); // и (simplified)
    rect(X,x+15,y+10,4,1);rect(X,x+15,y+13,4,1);rect(X,x+15,y+16,4,1); // С (bottom)
    rect(X,x+20,y+10,2,7);rect(X,x+20,y+10,3,1);rect(X,x+20,y+13,3,1); // Т
    rect(X,x+25,y+10,1,7);rect(X,x+25,y+10,3,1); // Е
    rect(X,x+29,y+10,2,7);rect(X,x+31,y+12,2,5); // М
    rect(X,x+35,y+10,1,7);rect(X,x+35,y+13,3,1); // А
    // Red paint drips
    rect(X,x+6,y+17,1,3,'#4a0a12');
    rect(X,x+12,y+17,1,4,'#4a0a12');
    rect(X,x+22,y+17,1,3,'#4a0a12');
    rect(X,x+30,y+17,1,3,'#4a0a12');

    // ── LAYER 3 — "НО СКИДКИ ЖИВЫ" (underneath, smaller) ──
    X.globalAlpha=.6;
    X.fillStyle='#1a1a1a';
    for(let i=0;i<10;i++){
      rect(X,x+4+i*3,y+22,2,1);
      rect(X,x+4+i*3,y+24,2,1);
    }
    X.globalAlpha=1;

    // ── LAYER 4 — white "МЫ СВОБОДНЫ" ──
    X.fillStyle=P.bone;
    rect(X,x+7,y+26,2,5);rect(X,x+7,y+26,5,1);rect(X,x+7,y+28,3,1); // М
    rect(X,x+14,y+26,4,1);rect(X,x+14,y+26,1,5);rect(X,x+14,y+30,4,1); // Ы
    rect(X,x+20,y+26,3,5); // block
    rect(X,x+25,y+26,1,5);rect(X,x+25,y+28,3,1);rect(X,x+27,y+26,1,5); // Н
    rect(X,x+30,y+26,2,1);rect(X,x+30,y+30,2,1); // Ы

    // ── LAYER 5 — "ARDET" in big black ──
    X.fillStyle='#0a0a0a';
    // A
    rect(X,x+6,y+33,3,6);rect(X,x+7,y+32,2,1);rect(X,x+6,y+35,4,1);
    // R
    rect(X,x+11,y+32,3,7);rect(X,x+13,y+32,2,3);rect(X,x+13,y+35,2,3);
    // D
    rect(X,x+16,y+32,3,7);rect(X,x+18,y+32,2,1);rect(X,x+18,y+38,2,1);rect(X,x+19,y+33,1,5);
    // E
    rect(X,x+21,y+32,3,7);rect(X,x+21,y+32,5,1);rect(X,x+21,y+35,4,1);rect(X,x+21,y+38,5,1);
    // T
    rect(X,x+27,y+32,5,1);rect(X,x+29,y+32,2,7);

    // ── LAYER 6 (newest) — MOSS growing over ARDET ──
    // Living moss patches
    for(let i=0;i<6;i++){
      const mcx=x+8+i*5;
      const mcy=y+33+Math.sin(i)*2;
      rect(X,mcx,mcy,3,2,P.dtoxic);
      px(X,mcx+1,mcy-1,P.toxic);
      if(i%2)px(X,mcx,mcy+2,P.btoxic);
    }

    // ── SMALL TAGS on top ──
    // "А" (anarchist)
    X.fillStyle='#6b0f1a';
    rect(X,x+40,y+4,2,4);rect(X,x+40,y+5,4,1);rect(X,x+42,y+4,2,4);
    // Small "Z" crossed out (red strike)
    X.fillStyle='#252b22';
    rect(X,x+46,y+4,4,1);rect(X,x+48,y+5,2,1);rect(X,x+46,y+6,2,1);rect(X,x+46,y+7,4,1);
    X.strokeStyle='#6b0f1a';X.lineWidth=1;
    X.beginPath();X.moveTo(x+45,y+3);X.lineTo(x+51,y+9);X.stroke();

    // Heart + initials
    X.fillStyle='#b8860b';
    rect(X,x+47,y+16,1,1);rect(X,x+49,y+16,1,1);
    rect(X,x+46,y+17,4,1);
    rect(X,x+47,y+18,3,1);
    rect(X,x+48,y+19,1,1);

    // QR code in corner (tiny)
    for(let qy=0;qy<5;qy++)for(let qx=0;qx<5;qx++){
      if(hash(qx,qy,55)>.4)px(X,x+50+qx,y+32+qy,'#0a0a0a');
    }

    // Spray can at base
    rect(X,x+35,y+39,2,3,P.dgrey);
    px(X,x+35,y+38,P.ash);
    // Small spray mist
    if(t%80<20){
      X.globalAlpha=.2;
      px(X,x+36,y+37,'#6b0f1a');
      px(X,x+37,y+36,'#6b0f1a');
      X.globalAlpha=1;
    }

    // "Мох помнит" scratch (barely visible, very small)
    X.globalAlpha=.4;
    X.fillStyle=P.toxic;
    for(let i=0;i<8;i++)px(X,x+40+i,y+39,P.dtoxic);
    X.globalAlpha=1;
}

export function draw_raven(x, y) {
    // ═══ RAVEN'S NEST — twisted oak with trove ═══
    // Shadow
    X.globalAlpha=.4;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+22,y+42,14,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── GNARLED DEAD OAK TRUNK ──
    // Main trunk — wider, twisted
    rect(X,x+18,y+10,6,30,'#1a1006');
    rect(X,x+19,y+11,4,28,'#0e0a04');
    // Bark texture
    for(let i=0;i<12;i++){
      const bY=y+12+i*2.5;
      if(hash(i,0,11)>.5)rect(X,x+18,bY,1,2,'#050202');
      if(hash(i,0,22)>.5)rect(X,x+23,bY,1,2,'#050202');
    }
    // Knot holes
    rect(X,x+20,y+18,2,2,'#020102');
    rect(X,x+21,y+28,1,1,'#020102');

    // ── BRANCHES — reaching out like fingers ──
    // Upper branch left
    rect(X,x+14,y+12,4,2,'#1a1006');
    rect(X,x+8,y+10,6,2,'#1a1006');
    rect(X,x+4,y+8,4,2,'#1a1006');
    px(X,x+2,y+7,'#0e0a04');
    // Small twigs
    px(X,x+6,y+7,'#1a1006');px(X,x+3,y+6,'#1a1006');
    // Upper branch right
    rect(X,x+24,y+11,6,2,'#1a1006');
    rect(X,x+30,y+9,5,2,'#1a1006');
    rect(X,x+35,y+8,3,2,'#1a1006');
    // Twigs
    px(X,x+38,y+7,'#0e0a04');
    px(X,x+33,y+7,'#1a1006');
    // Lower branches
    rect(X,x+14,y+26,4,2,'#1a1006');
    rect(X,x+24,y+24,5,2,'#1a1006');
    rect(X,x+29,y+26,3,1,'#1a1006');

    // ── ROOTS at base ──
    rect(X,x+15,y+38,3,3,'#1a1006');
    rect(X,x+23,y+38,4,3,'#1a1006');
    rect(X,x+12,y+40,5,1,'#0e0a04');
    rect(X,x+25,y+40,6,1,'#0e0a04');

    // ── HUGE TANGLED NEST ──
    // Base layer — wide
    for(let i=0;i<22;i++){
      const nx=x+2+hash(i,0,11)*34;
      const ny=y+4+hash(i,0,22)*8;
      const nw=3+Math.floor(hash(i,0,33)*5);
      const nh=1+Math.floor(hash(i,0,44)*2);
      rect(X,nx,ny,nw,nh,hash(i,0,55)>.5?P.dwood:'#1a1006');
    }
    // Top twigs
    for(let i=0;i<12;i++){
      const nx=x+4+hash(i+30,0,11)*28;
      const ny=y+hash(i+30,0,22)*4;
      rect(X,nx,ny,2+hash(i+30,0,33)*3,1,P.dwood);
    }
    // Wire/metal bits in nest
    rect(X,x+10,y+3,4,1,P.ash);
    rect(X,x+24,y+5,3,1,P.dgrey);
    rect(X,x+16,y+2,5,1,P.ash);

    // ── TREASURES in the nest ──
    // Bone fragments
    px(X,x+12,y+6,P.bone);px(X,x+13,y+6,P.bone);
    px(X,x+11,y+7,P.dbone);
    // Gold coin
    rect(X,x+16,y+5,2,2,P.gold);
    px(X,x+17,y+5,'#ffeb99');
    // Silver watch
    rect(X,x+20,y+4,3,2,P.ash);
    px(X,x+21,y+4,P.lgrey);
    px(X,x+22,y+5,P.dstone);
    // Glass shard (opalescent)
    rect(X,x+24,y+7,2,1,P.celestial);
    px(X,x+25,y+6,'#D9CFB8');
    // Red fragment (jewel?)
    px(X,x+18,y+7,P.crimson);
    px(X,x+19,y+7,P.volcanic);
    // Tooth
    px(X,x+15,y+4,P.bone);
    // Eye (glass eye?)
    rect(X,x+28,y+6,2,2,'#D9CFB8');
    px(X,x+28,y+6,'#050505');
    // NECRONOMICON — the book
    rect(X,x+13,y+8,5,3,'#0a0a0a');
    rect(X,x+13,y+8,5,1,'#1a1410'); // spine
    // Moss on book — growing
    px(X,x+14,y+8,P.toxic);
    px(X,x+15,y+9,P.dtoxic);
    px(X,x+16,y+8,P.toxic);

    // ── THE RAVEN itself (large, on branch, looking at you) ──
    const ravenBob=Math.sin(t*.01)*.3;
    const ravenX=x+30,ravenY=y+8+ravenBob;
    // Body
    rect(X,ravenX,ravenY,8,5,'#050505');
    rect(X,ravenX+1,ravenY+1,6,3,'#0a0a0a');
    // Tail
    rect(X,ravenX+7,ravenY+1,3,2,'#050505');
    rect(X,ravenX+9,ravenY+2,1,1,'#050505');
    // Head
    rect(X,ravenX-2,ravenY-1,4,3,'#050505');
    rect(X,ravenX-1,ravenY,2,2,'#0a0a0a');
    // Beak
    rect(X,ravenX-4,ravenY,2,1,'#1a1006');
    // Eye — glowing amber
    px(X,ravenX-1,ravenY,P.amber);
    px(X,ravenX,ravenY,P.damber);
    // Legs
    rect(X,ravenX+2,ravenY+5,1,2,'#1a1006');
    rect(X,ravenX+5,ravenY+5,1,2,'#1a1006');
    // Feathers detail
    if(t%80<40){
      px(X,ravenX+3,ravenY,'#1a1a1a');
      px(X,ravenX+5,ravenY+2,'#1a1a1a');
    }
    // Occasional wing flap
    if(t%300<8){
      rect(X,ravenX-3,ravenY-2,12,2,'#050505');
      rect(X,ravenX-4,ravenY-1,14,1,'#0a0a0a');
    }

    // ── SECOND RAVEN (perched above) ──
    const raven2X=x+6,raven2Y=y+6;
    rect(X,raven2X,raven2Y,5,3,'#050505');
    rect(X,raven2X-1,raven2Y-1,2,2,'#050505');
    px(X,raven2X-2,raven2Y,'#1a1006'); // beak
    px(X,raven2X-1,raven2Y,P.amber); // eye

    // ── SCATTERED FEATHERS around nest ──
    for(let i=0;i<5;i++){
      const fx=x+5+hash(i,0,11)*30;
      const fy=y+15+hash(i,0,22)*15;
      rect(X,fx,fy,3,1,'#0a0a0a');
      px(X,fx+1,fy-1,'#1a1a1a');
    }

    // ── OCCASIONAL "NEVERMORE" whisper (animated subtle text) ──
    if(t%500<50){
      X.globalAlpha=.2;
      X.fillStyle=P.crimson;
      X.font='4px "Press Start 2P"';
      X.fillText('nevermore',x+12,y-2);
      X.globalAlpha=1;
    }
    // Silent cat on a branch — useless tree, useless cat, both survived
    // NPC drawn separately
}

export function draw_lake(x, y) {
    // ═══ TOXIC LAKE — the rainbow fish (last optimist) ═══

    // ── LAKE SURFACE — oval toxic water ──
    for(let py=0;py<55;py++)for(let px_=0;px_<96;px_+=2){
      const dx=(px_-48)/48,dy=(py-27)/27;
      if(dx*dx+dy*dy<1){
        const n=hash(px_+x,py+y+t*.001,55);
        const c=n>.6?P.btoxic:n>.3?P.toxic:P.dtoxic;
        X.globalAlpha=.7+.2*Math.sin(t*.003+px_*.1);
        rect(X,x+px_+3,y+py+3,2,1,c);
      }
    }
    X.globalAlpha=1;

    // ── SHORELINE — mud, cracked earth ──
    for(let a=0;a<40;a++){
      const ang=a/40*Math.PI*2;
      const r=48+hash(a,0,11)*4;
      const sx=x+51+Math.cos(ang)*r;
      const sy=y+30+Math.sin(ang)*28;
      rect(X,sx,sy,2,1,hash(a,0,22)>.5?'#2a1e14':'#1a1210');
    }

    // ── SWIRLING OIL SLICKS on surface (rainbow shimmer) ──
    for(let i=0;i<5;i++){
      const slPhase=((t*.004+i*.2)%1);
      const slCx=x+20+i*14+Math.sin(t*.01+i)*3;
      const slCy=y+25+Math.cos(t*.008+i)*4;
      X.globalAlpha=.25+.15*Math.sin(t*.02+i);
      const slColor=['#C23B2B','#D9CFB8','#8A8D8F','#5a6b56','#3A3026'][i];   // радуга нефти — в красках канона: киноварь, кость, пепел, мгла, сепия
      X.beginPath();X.ellipse(slCx,slCy,5+Math.sin(slPhase*Math.PI*2)*2,2,slPhase*Math.PI,0,Math.PI*2);
      X.fillStyle=slColor;X.fill();
      X.globalAlpha=1;
    }

    // ── BUBBLES rising from depths ──
    for(let i=0;i<6;i++){
      const bPh=((t*.003+i*.17)%1);
      const bx=x+15+hash(i,0,1)*70;
      const by=y+50-bPh*40;
      X.globalAlpha=.6*(1-bPh);
      rect(X,bx,by,2,2,P.btoxic);
      px(X,bx,by+2,P.btoxic);
      X.globalAlpha=1;
    }

    // Bigger methane bubbles
    if(t%120<8){
      const bigB=t%120;
      X.globalAlpha=.5;
      X.beginPath();X.arc(x+40,y+30-bigB,3+bigB*.3,0,Math.PI*2);
      X.fillStyle=P.btoxic;X.fill();
      X.globalAlpha=1;
    }

    // ── DEAD FISH skeletons (multiple, on shore and floating) ──
    // Shore fish 1
    rect(X,x+78,y+52,8,2,P.bone);
    rect(X,x+85,y+51,2,4,P.bone); // tail
    // Ribs
    rect(X,x+79,y+51,1,1,P.bone);rect(X,x+81,y+51,1,1,P.bone);rect(X,x+83,y+51,1,1,P.bone);
    rect(X,x+79,y+54,1,1,P.bone);rect(X,x+81,y+54,1,1,P.bone);rect(X,x+83,y+54,1,1,P.bone);
    // Skull with eye hole
    px(X,x+78,y+52,'#0a0a0e');

    // Shore fish 2 (smaller)
    rect(X,x+10,y+54,5,1,P.dbone);
    rect(X,x+14,y+53,2,3,P.dbone);

    // Floating fish 3
    rect(X,x+20,y+12,6,2,P.bone);
    rect(X,x+25,y+11,2,4,P.bone);
    px(X,x+20,y+12,'#0a0a0e');

    // ── THE RAINBOW FISH (alive!) ──
    // Wiggles with sine
    const fishX=x+55+Math.sin(t*.02)*3;
    const fishY=y+28+Math.cos(t*.03)*1;
    const fishDir=Math.sin(t*.008)>0?1:-1;
    // Body
    X.fillStyle='#6b0f1a';
    X.beginPath();X.ellipse(fishX,fishY,5,2,0,0,Math.PI*2);X.fill();
    // Rainbow scales — each pixel a different color
    px(X,fishX-2,fishY-1,'#6b0f1a');
    px(X,fishX-1,fishY-1,'#C23B2B');
    px(X,fishX,fishY-1,'#D9CFB8');
    px(X,fishX+1,fishY-1,'#8A8D8F');
    px(X,fishX+2,fishY-1,'#3D4A3A');
    px(X,fishX-2,fishY,'#6b0f1a');
    px(X,fishX-1,fishY,'#b0a284');
    px(X,fishX,fishY,'#D9CFB8');
    px(X,fishX+1,fishY,P.celestial);
    px(X,fishX+2,fishY,P.indigo);
    // Eye (the optimist's eye)
    px(X,fishX+2*fishDir,fishY-1,'#D9CFB8');                  // глаз — костью: чистого белого в каноне нет
    // Tail (wiggling)
    const tailPh=Math.sin(t*.04);
    rect(X,fishX-6*fishDir,fishY-1+tailPh,2,3,'#8A8D8F');
    px(X,fishX-7*fishDir,fishY-1+tailPh*2,'#3D4A3A');
    // Dorsal fin
    px(X,fishX,fishY-2,'#3D4A3A');
    px(X,fishX+1,fishY-2,'#252b22');
    // Bubbles coming from fish mouth
    if(t%30<15){
      px(X,fishX+4*fishDir,fishY,P.btoxic);
      px(X,fishX+5*fishDir,fishY-1,P.btoxic);
    }

    // Faint rainbow aura around the fish
    X.globalAlpha=.08+.04*Math.sin(t*.01);
    const fishGrad=X.createRadialGradient(fishX,fishY,0,fishX,fishY,15);
    fishGrad.addColorStop(0,'rgba(217,207,184,.6)');
    fishGrad.addColorStop(.5,'rgba(61,74,58,.4)');
    fishGrad.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=fishGrad;X.fillRect(fishX-15,fishY-15,30,30);
    X.globalAlpha=1;

    // ── BARREL half-sunk (radiation source?) ──
    rect(X,x+68,y+20,8,12,'#2a1a08');
    rect(X,x+69,y+21,6,10,'#3a2a0a');
    dither(X,x+69,y+22,6,8,P.rust,'#2a1a08',.4);
    // Radiation symbol
    rect(X,x+71,y+24,2,1,'#D9CFB8');
    rect(X,x+71,y+27,2,1,'#D9CFB8');
    rect(X,x+72,y+25,1,2,'#D9CFB8');
    // Leaking
    X.globalAlpha=.6;
    rect(X,x+70,y+31,2,3,P.btoxic);
    X.globalAlpha=1;

    // ── WARNING POSTER on a post (Greta reference) ──
    rect(X,x-4,y+30,1,12,P.dwood);
    rect(X,x-8,y+22,10,8,P.dbone);
    rect(X,x-7,y+23,8,6,'#e8d8b0');
    // Faint text lines
    X.fillStyle='#3a0608';
    rect(X,x-6,y+24,6,1);
    rect(X,x-6,y+26,4,1);
    rect(X,x-6,y+28,5,1);
    // Red X across it
    X.strokeStyle='#6b0f1a';X.lineWidth=1;
    X.beginPath();X.moveTo(x-7,y+23);X.lineTo(x+1,y+29);X.stroke();
    X.beginPath();X.moveTo(x+1,y+23);X.lineTo(x-7,y+29);X.stroke();

    // ── TIRE floating in water ──
    X.strokeStyle='#0a0a0a';X.lineWidth=2;
    X.beginPath();X.ellipse(x+36,y+38,4,2,0,0,Math.PI*2);X.stroke();
    X.lineWidth=1;

    // ── DEAD BIRD on shore ──
    rect(X,x+50,y+55,4,2,'#050505');
    px(X,x+49,y+55,'#1a0a06'); // beak
    px(X,x+54,y+56,'#050505'); // wing out
    px(X,x+55,y+57,'#050505');

    // ── HAZE/STENCH rising from lake ──
    for(let i=0;i<6;i++){
      const hzPh=((t*.006+i*.17)%1);
      const hzX=x+20+i*12+Math.sin(t*.01+i)*2;
      const hzY=y-hzPh*12;
      X.globalAlpha=(1-hzPh)*.12;
      rect(X,hzX,hzY,3,1,P.toxic);
      X.globalAlpha=1;
    }
}

export function draw_basement(x, y) {
    // ═══ FLOODED BASEMENT — Iä! Iä! ═══
    // Shadow
    X.globalAlpha=.35;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+25,y+44,28,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // Concrete walls
    rect(X,x+5,y+12,40,30,P.dstone);
    rect(X,x+6,y+13,38,28,'#1a1820');
    rect(X,x+7,y+14,36,26,'#0a0a12');
    // Moss on walls
    for(let i=0;i<4;i++){
      rect(X,x+8+i*9,y+14,2,2,P.dtoxic);
      if(hash(i,0,11)>.5)px(X,x+9+i*9,y+13,P.toxic);
    }

    // Stone frame
    rect(X,x+4,y+10,3,32,P.stone);
    rect(X,x+43,y+10,3,32,P.stone);
    rect(X,x+4,y+10,42,3,P.stone);
    // Frame weathering
    for(let i=0;i<6;i++)px(X,x+6+i*6,y+11,'#1a1a22');

    // Steps descending (with perspective)
    for(let i=0;i<5;i++){
      const stW=24-i*2;
      const stX=x+13+i;
      const stY=y+18+i*4;
      const shade=Math.max(3,30-i*6);
      rect(X,stX,stY,stW,2,`rgb(${shade},${shade-1},${shade+2})`);
      rect(X,stX,stY+2,stW,1,'#020202');
    }

    // Water at bottom — pulsing toxic glow
    X.globalAlpha=.5+.1*Math.sin(t*.02);
    rect(X,x+12,y+37,26,5,P.dtoxic);
    rect(X,x+13,y+38,24,3,P.toxic);
    X.globalAlpha=1;
    // Water ripples
    for(let i=0;i<3;i++){
      const rph=((t*.02+i*.33)%1);
      X.globalAlpha=(1-rph)*.3;
      X.strokeStyle=P.btoxic;X.lineWidth=1;
      X.beginPath();X.ellipse(x+25,y+39,3+rph*10,1+rph*2,0,0,Math.PI*2);X.stroke();
      X.globalAlpha=1;
    }

    // Glowing rune on wall — slow pulse
    const rPulse=.4+.3*Math.sin(t*.006);
    X.globalAlpha=rPulse;
    X.fillStyle='#6b0f1a';
    // Triangle
    rect(X,x+23,y+16,2,2);rect(X,x+21,y+19,6,1);
    rect(X,x+22,y+17,4,1);
    X.globalAlpha=1;

    // WET FOOTPRINTS on steps — coming UP (someone just climbed out)
    for(let i=0;i<4;i++){
      const fpY=y+22+i*4;
      const fpX=x+15+i*2+Math.sin(i*2)*2;
      X.globalAlpha=.4+hash(i,0,11)*.2;
      rect(X,fpX,fpY,2,1,'#1a3a2a');
      rect(X,fpX+3,fpY+1,2,1,'#1a3a2a');
      X.globalAlpha=1;
    }

    // Cold air/fog from inside (rising)
    for(let i=0;i<3;i++){
      const fph=((t*.008+i*.33)%1);
      const fx=x+18+i*6+Math.sin(t*.01+i)*2;
      const fy=y+12-fph*8;
      X.globalAlpha=(1-fph)*.25;
      rect(X,fx,fy,3,1,'#4a7a5a');
      X.globalAlpha=1;
    }

    // Graffiti on doorframe — "Iä!" in red
    X.fillStyle='#6b0f1a';
    rect(X,x+8,y+6,1,3); // I
    rect(X,x+10,y+6,1,3);px(X,x+11,y+6); // ä
    rect(X,x+10,y+5,1,1); rect(X,x+12,y+5,1,1);
    rect(X,x+14,y+6,1,1); // !
    rect(X,x+14,y+8,1,1);

    // Drop of water dripping from frame
    if(t%60<20){
      const dY=y+9+(t%60)*.4;
      X.globalAlpha=.5;
      px(X,x+20,dY,P.toxic);
      X.globalAlpha=1;
    }
}

export function draw_exit(x, y) {
    // ═══ EXIT TO THE WASTELAND — @ardet_mirror sign ═══
    // Road fading into the distance (perspective)
    for(let i=0;i<22;i++){
      const rx=x+i*4;
      const ry=y+12+Math.sin(i*.4)*2;
      const w=Math.max(1,24-Math.floor(i*1.3));
      dither(X,rx,ry,4,w,P.d1,P.g3,.5);
    }
    // Road markings (dashed center line)
    for(let i=0;i<5;i++){
      const rx=x+4+i*14;
      rect(X,rx,y+14+i*.8,4,2,'#3a2a0a');
    }

    // Signpost
    rect(X,x+10,y-14,3,34,P.dwood);
    rect(X,x+11,y-13,1,32,P.wood);
    // Rust at base
    px(X,x+10,y+18,P.rust);
    px(X,x+12,y+17,P.drust);

    // Main sign board
    rect(X,x+2,y-20,28,14,P.dwood);
    rect(X,x+3,y-19,26,12,P.wood);
    rect(X,x+3,y-19,26,1,P.lwood); // top edge
    // Darker weathering
    dither(X,x+4,y-18,24,10,'#3a2618','#5a3a24',.3);
    // Crack
    rect(X,x+18,y-18,1,6,'#1a0e06');
    // Arrow
    rect(X,x+5,y-13,2,4,P.bone);
    rect(X,x+7,y-14,1,6,P.bone);
    // @ardet_mirror fake-pixel text
    X.fillStyle=P.bone;
    // @
    rect(X,x+10,y-15,1,3);rect(X,x+11,y-15,3,1);rect(X,x+11,y-13,3,1);rect(X,x+13,y-14,1,1);
    // a
    rect(X,x+15,y-14,2,2);
    // r
    rect(X,x+18,y-14,1,2);rect(X,x+18,y-15,2,1);
    // d
    rect(X,x+20,y-15,1,3);rect(X,x+21,y-14,1,2);
    // e
    rect(X,x+23,y-14,2,1);rect(X,x+23,y-13,2,1);
    // t
    rect(X,x+26,y-15,1,3);rect(X,x+25,y-15,2,1);
    // Second line: smaller "ardet.art" fake
    rect(X,x+6,y-10,18,1,P.damber);

    // Small sub-sign below
    rect(X,x+14,y-4,12,5,P.dwood);
    rect(X,x+15,y-3,10,3,P.wood);
    // "→" arrow on sub-sign
    rect(X,x+17,y-2,4,1,'#1a0e06');
    rect(X,x+20,y-3,1,1,'#1a0e06');
    rect(X,x+20,y-1,1,1,'#1a0e06');

    // Crow perched on sign
    if(t%500<480){
      rect(X,x+25,y-21,2,1,'#050505');
      px(X,x+24,y-21,'#050505'); // beak
      px(X,x+25,y-22,'#050505'); // head
      // Occasional eye glint
      if(t%10<3)px(X,x+25,y-21,P.amber);
    }

    // Old bones at base of sign
    rect(X,x+4,y+17,4,1,P.bone);
    px(X,x+8,y+17,P.dbone);
    rect(X,x+6,y+19,3,1,P.dbone);

    // Wind-blown leaflet stuck to post
    const lfSway=Math.sin(t*.02)*.5;
    rect(X,x+13+lfSway,y-2,3,3,P.parchment);
    rect(X,x+13+lfSway,y-2,3,1,'#3a2a18');

    // Small boot footprints heading away (into the distance)
    for(let i=0;i<4;i++){
      const fpX=x+30+i*6+hash(i,0,11)*2;
      const fpY=y+12+i*2;
      X.globalAlpha=.25-i*.04;
      rect(X,fpX,fpY,2,1,'#0a0a0a');
      X.globalAlpha=1;
    }
}

export function draw_rocket(x, y) {
    // ═══ РАКЕТА ЗА ПУТЯМИ — «MARS: A FRESH START» ═══
    // Подделка целиком (потёмкинская скорость): пламя сопел писано
    // сепией по жести. Настоящее в ней одно — свеча пассажиров (СВЕЧА),
    // её проявление не трогает.
    const gy = y + 50;
    X.globalAlpha=.35;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+11,gy,12,2,0,0,Math.PI*2);X.fill();X.globalAlpha=1;
    const lean = (row) => Math.floor((gy - row) / 10);   // стоит криво
    // стабилизаторы
    rect(X,x+3,gy-10,4,8,P.dgrey); rect(X,x+15,gy-10,4,8,P.dgrey);
    rect(X,x+2,gy-3,2,3,P.dgrey);  rect(X,x+18,gy-3,2,3,P.dgrey);
    // корпус, с креном
    for (let row = y + 8; row < gy - 8; row++) {
      const o = lean(row);
      rect(X,x+6+o,row,10,1,P.dstone);
      if (hash(row,0,7) > .55) px(X,x+7+o+Math.floor(hash(row,1,9)*8),row,P.rust);
    }
    // обтекатель
    for (let i = 0; i < 8; i++) {
      const o = lean(y + i);
      const w = 2 + Math.floor(i * 1.1);
      rect(X,x+11+o-Math.floor(w/2),y+i,w,1,P.dgrey);
    }
    // иллюминаторы; в среднем — свеча
    for (const [k, ry] of [[0, y+14], [1, y+22], [2, y+30]]) {
      const o = lean(ry);
      rect(X,x+9+o,ry,4,4,'#0a0a0e');
      if (k === 1) {
        px(X,x+11+o,ry+2,'#E28A3A');
        if (t % 50 < 38) px(X,x+11+o,ry+1,'#E28A3A');
      }
    }
    // жесть вместо сопел, пламя писано сепией
    rect(X,x+6,gy-8,11,5,P.ash);
    X.fillStyle='#3A3026';
    rect(X,x+7,gy-6,2,3); rect(X,x+10,gy-7,2,4); rect(X,x+13,gy-6,2,3);
    // табличка у основания и баллончик под ней
    rect(X,x-6,gy-12,1,12,'#1a1a1a');
    rect(X,x-9,gy-16,8,4,P.parchment);
    for (let i = 0; i < 3; i++) rect(X,x-8+i*2,gy-15,1,1,'#1a1a1a');
    rect(X,x-9,gy-10,7,1,P.bone);
}

export function draw_bus(x, y) {
    // ═══ SCHOOL BUS — "дети алгоритма" ═══
    // Shadow
    X.globalAlpha=.4;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+30,y+38,34,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── BUS BODY — tilted, half-sunken ──
    // Main chassis
    rect(X,x,y,60,32,P.drust);
    rect(X,x+2,y+2,56,28,'#4a3a1a');
    dither(X,x+4,y+4,52,24,P.rust,'#3a2a0a',.4);
    // Yellow paint remnants
    rect(X,x+2,y+18,56,3,'#8a6408');
    rect(X,x+2,y+20,56,1,'#4a3a08');
    // Yellow stripe stencil "SCHOOL BUS"
    for(let i=0;i<5;i++){
      rect(X,x+6+i*11,y+19,8,1,P.damber);
    }

    // Top edge (slightly raised)
    rect(X,x,y-1,60,2,P.drust);
    rect(X,x+2,y-1,56,1,'#3a2a0a');

    // ── WINDOWS (5 side windows) ──
    for(let i=0;i<5;i++){
      const wx=x+5+i*11;
      rect(X,wx,y+4,9,10,P.dgrey);
      rect(X,wx+1,y+5,7,8,'#1a1a20');
      // Window frames
      rect(X,wx,y+4,9,1,P.rust);
      rect(X,wx,y+13,9,1,P.rust);
      // Middle divider
      rect(X,wx+4,y+4,1,10,P.rust);
      // Some windows broken — glass cracks
      if(i===1||i===3){
        X.fillStyle=P.lgrey;
        px(X,wx+2,y+7);px(X,wx+6,y+10);px(X,wx+3,y+11);
        X.fillStyle='#0a0a0a';
        rect(X,wx+1,y+5,7,3,'#0a0a0a');
      }
      // One window — eerie face silhouette looking out (window 2)
      if(i===2){
        rect(X,wx+1,y+5,7,8,'#2a1a08');
        // Face
        X.fillStyle='#1a1006';
        rect(X,wx+3,y+8,3,3); // head
        // Glowing eyes
        if(Math.sin(t*.005)>.2){
          px(X,wx+3,y+9,P.f2);
          px(X,wx+5,y+9,P.f2);
        }
      }
    }

    // ── CRACKED WINDSHIELD (front) ──
    rect(X,x+50,y+3,8,15,P.dgrey);
    rect(X,x+51,y+4,6,13,'#1a1a20');
    // Cracks spider pattern
    X.strokeStyle=P.lgrey;X.lineWidth=1;
    X.beginPath();
    X.moveTo(x+53,y+10);X.lineTo(x+56,y+6);
    X.moveTo(x+53,y+10);X.lineTo(x+57,y+15);
    X.moveTo(x+53,y+10);X.lineTo(x+51,y+12);
    X.moveTo(x+53,y+10);X.lineTo(x+52,y+5);
    X.stroke();
    // Central impact point
    px(X,x+53,y+10,'#D9CFB8');

    // ── DOOR (folding, ajar) ──
    rect(X,x+50,y+18,8,12,'#1a1a20');
    rect(X,x+51,y+19,3,10,'#0a0a0e');
    rect(X,x+54,y+19,3,10,'#0a0a0e');
    rect(X,x+53,y+19,1,10,P.rust); // hinge

    // ── WHEELS — sunken, flat ──
    // Front wheel
    rect(X,x+42,y+30,12,5,'#0a0a0a');
    rect(X,x+43,y+31,10,3,'#1a1a1a');
    px(X,x+47,y+32,P.dgrey); // hubcap center
    px(X,x+48,y+32,P.dgrey);
    // Back wheel
    rect(X,x+6,y+30,12,5,'#0a0a0a');
    rect(X,x+7,y+31,10,3,'#1a1a1a');
    px(X,x+11,y+32,P.dgrey);
    px(X,x+12,y+32,P.dgrey);

    // ── STOP SIGN arm (extended, broken) ──
    rect(X,x-6,y+8,6,2,P.drust);
    // Octagonal stop sign
    rect(X,x-12,y+5,6,8,'#6b0f1a');
    rect(X,x-11,y+4,4,1,'#6b0f1a');
    rect(X,x-11,y+13,4,1,'#6b0f1a');
    // "STOP" text (faded white)
    rect(X,x-10,y+8,1,1,P.bone);
    rect(X,x-9,y+8,1,1,P.bone);
    rect(X,x-10,y+9,1,1,P.bone);
    rect(X,x-8,y+9,1,1,P.bone);

    // ── ROOF ESCAPE HATCH (open) ──
    rect(X,x+30,y-2,10,3,'#1a1a1a');
    rect(X,x+31,y-3,8,2,'#0a0a0a');

    // ── HOOD MIRRORS (bent) ──
    rect(X,x+57,y+2,2,3,P.dgrey);
    px(X,x+58,y+1,P.lgrey);
    rect(X,x-1,y+2,2,3,P.dgrey);

    // ── SIDE MIRROR (left, hanging) ──
    const mSway=Math.sin(t*.015)*.5;
    rect(X,x-2,y+6+mSway,3,2,P.dgrey);

    // ── HEADLIGHTS (broken glass, one flickering) ──
    // Right headlight
    rect(X,x+56,y+14,3,4,'#1a1a1a');
    if(t%80<40){
      px(X,x+57,y+15,P.amber);
      X.globalAlpha=.15;
      X.beginPath();X.arc(x+57,y+16,8,0,Math.PI*2);
      X.fillStyle=P.amber;X.fill();
      X.globalAlpha=1;
    }
    // Left headlight (broken)
    rect(X,x+56,y+20,3,3,'#0a0a0a');
    px(X,x+56,y+21,P.lgrey);

    // ── RUST STREAKS ──
    for(let i=0;i<8;i++){
      const rx=x+5+hash(i,0,11)*50;
      rect(X,rx,y+22,1,6,'#3a0a08');
    }

    // ── BACKPACK on the ground beside ──
    rect(X,x+22,y+35,6,5,'#6b0f1a');
    rect(X,x+22,y+35,6,1,'#4a0a12');
    px(X,x+23,y+36,P.amber); // zipper
    // Strap
    rect(X,x+21,y+34,1,3,'#3a0a08');

    // ── NOTEBOOK fallen out (instruction card peeking) ──
    rect(X,x+30,y+37,4,2,P.dbone);
    rect(X,x+30,y+37,4,1,'#6b0f1a');
    // "v.47" hint
    px(X,x+31,y+38,'#1a0a06');
    px(X,x+33,y+38,'#1a0a06');

    // ── VAULT-BOY BOBBLEHEAD on dashboard ──
    // Through windshield
    rect(X,x+52,y+14,2,2,'#8a6408');
    rect(X,x+52,y+16,2,1,'#252b22'); // vault suit blue
    // Smile (even-in-apocalypse)
    px(X,x+52,y+15,'#0a0a0a');

    // ── FADED "NO 47" route sign ──
    rect(X,x+18,y-2,14,4,P.dbone);
    rect(X,x+19,y-1,12,2,'#1a1a22');
    // Tiny "47"
    rect(X,x+23,y,1,1,P.bone);
    rect(X,x+25,y,1,1,P.bone);
    rect(X,x+26,y,1,1,P.bone);

    // ═══════════════════════════════════════════
    // ── SCHOOL №1 / GAS MASK / DATE BOARD ──
    // ═══════════════════════════════════════════
    // "ШКОЛА №1" stencil on side
    X.fillStyle='#6b0f1a';X.font='4px "Press Start 2P"';
    X.globalAlpha=.8;
    X.fillText('ШКОЛА №1',x+6,y+26);
    X.globalAlpha=1;

    // ── GP-5 GAS MASK hanging on window 3 (child size) ──
    // Rubber head
    rect(X,x+28,y+6,7,7,'#1a1a1a');
    rect(X,x+29,y+7,5,5,'#0a0a0e');
    // Two round eye filters
    rect(X,x+29,y+8,2,2,'#3a3a42');
    rect(X,x+32,y+8,2,2,'#3a3a42');
    // Glass lens glint
    px(X,x+29,y+8,P.lgrey);
    px(X,x+32,y+8,P.lgrey);
    // Breathing hose
    X.strokeStyle='#1a1a1a';X.lineWidth=2;
    X.beginPath();
    X.moveTo(x+31,y+13);
    X.quadraticCurveTo(x+30,y+16,x+32,y+18);
    X.stroke();
    X.lineWidth=1;
    // Filter canister at end
    rect(X,x+31,y+17,3,3,P.rust);
    rect(X,x+31,y+17,3,1,'#8a6408');
    // Straps
    X.strokeStyle='#2a1a08';X.lineWidth=1;
    X.beginPath();X.moveTo(x+28,y+6);X.lineTo(x+26,y+9);X.stroke();
    X.beginPath();X.moveTo(x+35,y+6);X.lineTo(x+37,y+9);X.stroke();

    // ── BLACKBOARD with 5 dates — visible through side of bus ──
    // The chalkboard silhouette through one of the intact windows (5th)
    const bbX=x+45,bbY=y+5;
    rect(X,bbX,bbY,9,8,'#0a2a1a');
    rect(X,bbX,bbY,9,1,'#3a5a3a'); // wooden frame top
    // Chalk dates (tiny)
    X.fillStyle='#e8dcc8';
    X.globalAlpha=.75;
    X.font='3px "Press Start 2P"';
    X.fillText('95',bbX+1,bbY+3);
    X.fillText('99',bbX+5,bbY+3);
    X.fillText('22',bbX+1,bbY+6);
    X.fillText('24',bbX+5,bbY+6);
    // Red chalk "???" — unfilled
    X.fillStyle='#6b0f1a';
    X.fillText('??',bbX+2,bbY+9);
    X.globalAlpha=1;
    // "24.05" big chalk date on top (Uvalde memorial — last day before summer)
    X.globalAlpha=.6;X.fillStyle=P.bone;X.font='3px "Press Start 2P"';
    X.fillText('24.05',bbX+1,bbY-1);
    X.globalAlpha=1;

    // ── PILE of small SCHOOL BACKPACKS at back of bus ──
    const packColors=['#6b0f1a','#252b22','#3a2818','#3D4A3A','#8a6408'];
    for(let i=0;i<5;i++){
      const pbx=x+4+i*3;
      const pby=y+24+i%2*2;
      rect(X,pbx,pby,3,4,packColors[i]);
      px(X,pbx+1,pby+1,P.gold); // zipper pull
      // Straps
      rect(X,pbx,pby-1,1,1,packColors[i]);
      rect(X,pbx+2,pby-1,1,1,packColors[i]);
    }

    // ── BULLET HOLES in the side (clustered) ──
    for(let i=0;i<7;i++){
      const bhx=x+14+hash(i,7,11)*30;
      const bhy=y+10+hash(i,7,22)*8;
      // Hole — black with lighter ring (metal deformation)
      rect(X,bhx,bhy,2,2,'#050203');
      px(X,bhx-1,bhy,P.lgrey);
      px(X,bhx+2,bhy+1,P.lgrey);
    }

    // ── LOUDSPEAKER mounted above door — crackling ──
    rect(X,x+51,y+1,4,3,P.dgrey);
    rect(X,x+52,y+2,2,1,'#0a0a0a');
    // Sound wave (speaker active — "учебная тревога")
    if(t%60<30){
      X.globalAlpha=.3;
      X.strokeStyle=P.bone;X.lineWidth=1;
      X.beginPath();X.arc(x+53,y+2,3,-.5,.5);X.stroke();
      X.beginPath();X.arc(x+53,y+2,5,-.4,.4);X.stroke();
      X.globalAlpha=1;
    }

    // ── SCHEDULE sheet pinned beside loudspeaker ──
    rect(X,x+40,y-4,6,5,P.bone);
    rect(X,x+40,y-4,6,1,'#d8c8a8');
    // Tiny schedule lines
    X.fillStyle='#1a0806';
    rect(X,x+41,y-2,4,1);
    rect(X,x+41,y-1,3,1);
    rect(X,x+41,y,4,1);
    // "УРОК 1" header tint
    px(X,x+41,y-3,'#6b0f1a');

    // ── WHITE CARNATIONS laid by back wheel ──
    for(let i=0;i<4;i++){
      const fx_=x+4+i*2;
      rect(X,fx_,y+37,1,2,P.bone);
      px(X,fx_,y+36,'#e8dcc8'); // bloom
      // Green stem leaf
      px(X,fx_,y+38,'#1a4a1a');
    }

    // ── MEMORIAL BOTTLE OF WATER near flowers ──
    // (the tradition — empty bottles commemorating hostages denied water)
    rect(X,x+12,y+36,2,4,'#8A8D8F');
    rect(X,x+12,y+36,2,1,P.lgrey);
    // Empty — no fill
    px(X,x+13,y+38,'#0a0a0a');
}

export function draw_junkyard(x, y) {
    // ═══ JUNKYARD — UNIFICATOR 3000 — CUBE FACTORY ═══
    // Shadow
    X.globalAlpha=.35;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+45,y+72,50,4,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── BACK WALL — corrugated metal fence ──
    for(let i=0;i<22;i++){
      rect(X,x+i*4,y,4,3,i%2?P.dgrey:'#1a1a1a');
      rect(X,x+i*4,y+3,4,1,'#0a0a0a');
    }
    // Barbed wire top
    X.strokeStyle=P.ash;X.lineWidth=1;
    X.beginPath();X.moveTo(x,y);X.lineTo(x+90,y);X.stroke();
    // Barbs
    for(let i=0;i<10;i++){
      px(X,x+i*9,y-1,P.ash);
      px(X,x+i*9+1,y-2,P.ash);
    }

    // ── TOP ROW — 3 perfect grey cubes on an upper shelf ──
    // Upper ledge/beam
    rect(X,x+5,y+8,80,2,P.dgrey);
    // 3 IDENTICAL cubes — this is the point: uniformity
    for(let i=0;i<3;i++){
      const cx_=x+12+i*26;
      const cy_=y+0;
      // Cube body (all identical 10x10)
      rect(X,cx_,cy_,10,10,'#3a3a3a');
      rect(X,cx_+1,cy_+1,8,8,'#2a2a2a');
      // Highlight
      rect(X,cx_+1,cy_+1,8,1,'#4a4a4a');
      rect(X,cx_+1,cy_+1,1,8,'#4a4a4a');
      // Shadow
      rect(X,cx_+9,cy_+1,1,8,'#1a1a1a');
      rect(X,cx_+1,cy_+9,8,1,'#1a1a1a');
      // Barely-visible serial code
      px(X,cx_+3,cy_+5,'#4a4a4a');
      px(X,cx_+4,cy_+5,'#4a4a4a');
      px(X,cx_+6,cy_+5,'#4a4a4a');
    }

    // ── UNIFICATOR 3000 machine (left side) ──
    rect(X,x-2,y+20,14,40,P.dgrey);
    rect(X,x,y+22,10,36,'#1a1a1a');
    // Machine lettering
    X.fillStyle=P.rust;
    rect(X,x+2,y+25,1,1);rect(X,x+4,y+25,1,1);rect(X,x+6,y+25,1,1);rect(X,x+8,y+25,1,1);
    // Control panel
    rect(X,x+1,y+30,8,6,P.dstone);
    // Blinking lights
    if(t%60<30)px(X,x+3,y+32,P.f2);
    else px(X,x+3,y+32,'#3a0808');
    if(t%80<40)px(X,x+6,y+32,P.gold);
    // Warning sticker
    rect(X,x+2,y+38,6,4,P.damber);
    rect(X,x+3,y+39,4,2,'#1a0a06');
    px(X,x+5,y+40,P.amber); // exclamation
    // Input slot (funnel)
    X.fillStyle=P.dgrey;
    X.beginPath();
    X.moveTo(x,y+44);X.lineTo(x+10,y+44);X.lineTo(x+7,y+50);X.lineTo(x+3,y+50);X.closePath();X.fill();
    X.fillStyle='#0a0a0a';
    X.beginPath();
    X.moveTo(x+1,y+45);X.lineTo(x+9,y+45);X.lineTo(x+6,y+49);X.lineTo(x+4,y+49);X.closePath();X.fill();
    // Output chute to cubes (belt)
    rect(X,x+10,y+52,30,3,'#1a1a1a');
    rect(X,x+10,y+52,30,1,'#3a3a3a');
    // Belt rollers
    for(let i=0;i<4;i++){
      px(X,x+14+i*7,y+54,P.dgrey);
    }

    // ── MAIN PILE — 12 cubes in various rows ──
    const cubePositions=[
      [12,62],[23,62],[34,62],[45,62],[56,62],[67,62],
      [17,52],[28,52],[39,52],[50,52],[61,52],[72,52],
      [22,42],[33,42],[44,42],[55,42],[66,42],
    ];
    cubePositions.forEach(([cPx,cPy],i)=>{
      const cx_=x+cPx;
      const cy_=y+cPy;
      // Identical 10x10 cube
      rect(X,cx_,cy_,10,10,'#3a3a3a');
      rect(X,cx_+1,cy_+1,8,8,'#2a2a2a');
      // Highlight
      rect(X,cx_+1,cy_+1,8,1,'#4a4a4a');
      rect(X,cx_+1,cy_+1,1,8,'#4a4a4a');
      // Shadow
      rect(X,cx_+9,cy_+1,1,8,'#1a1a1a');
      rect(X,cx_+1,cy_+9,8,1,'#1a1a1a');
      // Hints of what WAS — barely visible
      const ghost=[P.rust,P.crimson,P.amber,P.celestial,P.bone,P.toxic,P.gold][i%7];
      X.globalAlpha=.12;
      rect(X,cx_+3,cy_+3,4,4,ghost);
      X.globalAlpha=1;
      // Serial numbers — all identical
      X.fillStyle='#4a4a4a';
      px(X,cx_+2,cy_+7);px(X,cx_+4,cy_+7);px(X,cx_+6,cy_+7);
    });

    // ── ONE NON-CUBE sticking out — irregular, colored ──
    // The "not-cube" in the crack between cubes
    const ncX=x+44,ncY=y+48;
    rect(X,ncX,ncY,3,4,P.crimson);
    px(X,ncX+1,ncY-1,P.rust);
    rect(X,ncX,ncY+2,2,1,P.damber);
    // A tiny glint
    if(Math.sin(t*.02)>.5){
      px(X,ncX+1,ncY+1,P.gold);
    }

    // ── CONVEYOR belt top — items waiting to be unified ──
    // Apple
    rect(X,x+14,y+49,3,3,P.crimson);
    px(X,x+15,y+48,'#2a1806'); // stem
    // Book
    rect(X,x+20,y+49,3,2,'#252b22');
    // Idea (lightbulb silhouette)
    rect(X,x+26,y+49,2,2,P.amber);
    px(X,x+27,y+48,P.damber);

    // ── OIL PUDDLE beneath ──
    dither(X,x+20,y+74,36,4,'#0a0a0a','#111',.5);
    // Oil slick rainbow shimmer
    for(let i=0;i<6;i++){
      const rx=x+24+i*5;
      const ry=y+75;
      X.globalAlpha=.2+.1*Math.sin(t*.01+i);
      px(X,rx,ry,['#6b0f1a','#daa520','#8A8D8F','#252b22','#4a0a12','#8a6408'][i]);
      X.globalAlpha=1;
    }

    // ── TINY "NOT A CUBE" sign nailed to wall ──
    rect(X,x+76,y+14,10,5,P.dbone);
    rect(X,x+77,y+15,8,3,P.dbone);
    // Scratched text
    X.fillStyle='#1a0a06';
    rect(X,x+78,y+16,1,1);rect(X,x+80,y+16,1,1);rect(X,x+82,y+16,1,1);rect(X,x+84,y+16,1,1);
    rect(X,x+78,y+17,1,1);rect(X,x+81,y+17,1,1);rect(X,x+84,y+17,1,1);

    // ── TESLA-T CUBE — one cube with a "T" carved into it ──
    // Top-middle cube of top row, with a T scratch
    X.fillStyle='#4a4a4a';
    rect(X,x+41,y+3,3,1);
    rect(X,x+42,y+3,1,5);

    // ── CROWS perched on cubes ──
    rect(X,x+25,y+1,2,1,'#050505');
    rect(X,x+50,y+1,2,1,'#050505');
    if(t%400<10){
      // One flies away
      X.globalAlpha=.6;
      px(X,x+27+(t%400)*2,y-(t%400),'#050505');
      X.globalAlpha=1;
    }

    // ════════════════════════════════════════════════════════
    // ── TESLA MODEL 3 — the only thing NOT unified into a cube ──
    // ════════════════════════════════════════════════════════
    // Positioned in the gap on the right side of the pile
    const tX=x+55,tY=y+60;
    // White car body (sleek silhouette)
    rect(X,tX,tY+4,24,6,P.bone);
    rect(X,tX,tY+4,24,1,'#e8dcc8');
    rect(X,tX,tY+9,24,1,'#8a8488');
    // Sloped roofline
    X.fillStyle=P.bone;
    X.beginPath();
    X.moveTo(tX+3,tY+4);
    X.lineTo(tX+7,tY);
    X.lineTo(tX+17,tY);
    X.lineTo(tX+21,tY+4);
    X.closePath();X.fill();
    // Windshield (shattered — dark with crack lines)
    X.fillStyle='#050208';
    X.beginPath();
    X.moveTo(tX+4,tY+4);
    X.lineTo(tX+8,tY+1);
    X.lineTo(tX+16,tY+1);
    X.lineTo(tX+20,tY+4);
    X.closePath();X.fill();
    // Crack lines on windshield
    X.strokeStyle=P.bone;X.lineWidth=1;
    X.beginPath();
    X.moveTo(tX+7,tY+4);X.lineTo(tX+12,tY+1);X.stroke();
    X.beginPath();
    X.moveTo(tX+12,tY+4);X.lineTo(tX+14,tY+2);X.stroke();
    // Crumpled front — IMPACT with a truck (left side compressed)
    rect(X,tX-2,tY+5,4,5,'#8a8488');
    rect(X,tX-1,tY+4,2,2,P.dgrey);
    // Rebar/metal sticking out
    rect(X,tX-3,tY+6,2,1,P.rust);
    // Wheels
    rect(X,tX+3,tY+9,3,3,'#050505');
    rect(X,tX+18,tY+9,3,3,'#050505');
    rect(X,tX+3,tY+9,3,1,'#1a1a1a'); // rim top
    rect(X,tX+18,tY+9,3,1,'#1a1a1a');
    // TESLA T logo on hood
    X.fillStyle='#6b0f1a';
    rect(X,tX+10,tY+5,4,1);
    rect(X,tX+11,tY+5,2,3);
    // License plate "AUTOPILOT"
    rect(X,tX+20,tY+7,4,2,P.bone);
    X.fillStyle='#050205';X.font='3px "Press Start 2P"';
    X.globalAlpha=.7;
    X.fillText('AP',tX+20,tY+9);
    X.globalAlpha=1;
    // Dashboard screen — still glowing "KEEP HANDS ON WHEEL"
    rect(X,tX+11,tY+2,3,2,P.celestial);
    // Pulsing warning red border
    const tscrB=Math.sin(t*.08)*.5+.5;
    X.globalAlpha=.4+tscrB*.4;
    rect(X,tX+11,tY+2,3,1,'#6b0f1a');
    X.globalAlpha=1;
    // Hand icon (tiny)
    px(X,tX+12,tY+3,P.bone);

    // Empty seatbelt dangling through nothing
    X.strokeStyle='#3a2414';X.lineWidth=1;
    X.beginPath();X.moveTo(tX+9,tY+2);X.lineTo(tX+8,tY+5);X.stroke();

    // Charging cable plugged into car, other end trailing into void
    X.strokeStyle='#1a1a22';X.lineWidth=1;
    X.beginPath();
    X.moveTo(tX+24,tY+6);
    X.quadraticCurveTo(tX+30,tY+8,tX+33,tY+5);
    X.lineTo(tX+35,tY+3);
    X.stroke();
    // Charge port glowing green (still trying to charge)
    if(t%40<20)px(X,tX+24,tY+6,P.toxic);

    // Dashcam still recording — red dot blinking
    if(t%30<8){
      px(X,tX+11,tY+1,'#ff2020');
    }

    // ── PRINTOUTS pinned under windshield wiper ──
    rect(X,tX+7,tY,9,2,P.parchment);
    rect(X,tX+7,tY,9,1,'#d8c8a8');
    // Staple
    px(X,tX+11,tY,P.ash);
    // Tiny text suggesting dates
    X.fillStyle='#1a0806';
    px(X,tX+8,tY+1);px(X,tX+10,tY+1);px(X,tX+12,tY+1);px(X,tX+14,tY+1);

    // Truck silhouette (the thing Tesla crashed into) — white against sky
    rect(X,tX-12,tY+2,10,8,P.bone);
    rect(X,tX-11,tY+3,8,6,'#e8dcc8');
    rect(X,tX-12,tY+9,10,1,'#8a8488');
    // Trailer wheels
    rect(X,tX-10,tY+10,2,2,'#050505');
    rect(X,tX-5,tY+10,2,2,'#050505');
    // "The horizon was the same color as the truck" — note pinned to truck
    rect(X,tX-10,tY+5,6,2,'#3a2814');

    // Glow from Tesla headlights (still on, but directionless)
    X.globalAlpha=.12+.04*Math.sin(t*.03);
    const tgl=X.createRadialGradient(tX-2,tY+7,0,tX-2,tY+7,14);
    tgl.addColorStop(0,'rgba(232,220,200,.9)');
    tgl.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=tgl;X.fillRect(tX-16,tY-7,30,28);
    X.globalAlpha=1;
}

export function draw_crypt(x, y) {
    // ═══ CRYPT — DANTE'S NINE CIRCLES ═══
    // Shadow on ground
    X.globalAlpha=.4;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+18,y+38,20,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── ENTRANCE — carved stone arch ──
    // Arch sides
    rect(X,x+1,y+4,4,32,P.stone);
    rect(X,x+31,y+4,4,32,P.stone);
    // Arch top — curved via multiple rects
    rect(X,x+5,y+2,26,3,P.stone);
    rect(X,x+7,y,22,2,P.stone);
    // Stone texture
    for(let i=0;i<8;i++){
      const sx=x+2+hash(i,0,11)*32;
      const sy=y+5+hash(i,0,22)*30;
      rect(X,sx,sy,1,1,'#1a1a20');
    }
    // Moss at base
    rect(X,x+2,y+35,4,2,P.dtoxic);
    rect(X,x+30,y+35,4,2,P.dtoxic);
    px(X,x+3,y+34,P.toxic);

    // ── KEYSTONE with inscription ──
    rect(X,x+16,y,4,4,P.lstone);
    px(X,x+17,y+1,'#0a0a0e');
    px(X,x+18,y+2,'#0a0a0e');

    // ── IRON GATE (ajar, swinging slightly) ──
    const gateSwing=Math.sin(t*.004)*.5;
    rect(X,x+5+gateSwing,y+4,2,32,P.dgrey);
    // Gate bars
    for(let i=0;i<5;i++){
      rect(X,x+6+gateSwing,y+6+i*6,10,1,P.dgrey);
    }
    for(let i=0;i<3;i++){
      rect(X,x+7+i*4+gateSwing,y+4,1,30,P.dgrey);
    }
    // Gate hinge
    px(X,x+5+gateSwing,y+4,P.ash);
    px(X,x+5+gateSwing,y+35,P.ash);

    // ── DESCENDING STEPS — 9 visible, receding into darkness ──
    for(let i=0;i<9;i++){
      const stepShade=Math.max(2,26-i*3);
      const stepWidth=24-i*1.5;
      const stepX=x+6+i*.7;
      const stepY=y+8+i*3;
      rect(X,stepX,stepY,stepWidth,2,`rgb(${stepShade},${stepShade},${stepShade+2})`);
      rect(X,stepX,stepY+2,stepWidth,1,'#020202');
    }

    // Deep darkness beyond
    X.globalAlpha=.95;
    X.fillStyle='#020204';
    X.fillRect(x+12,y+30,16,8);
    X.globalAlpha=1;

    // ── NUMBERED CIRCLES (small Roman numerals on steps, barely visible) ──
    X.fillStyle='#3a3a42';
    // I — first step
    px(X,x+14,y+9,'#4a4a50');
    // II — second
    px(X,x+14,y+12,'#4a4a50');px(X,x+15,y+12,'#4a4a50');
    // Rest fade into darkness
    X.globalAlpha=.4;
    px(X,x+14,y+15,'#3a3a42');px(X,x+15,y+15,'#3a3a42');px(X,x+16,y+15,'#3a3a42');
    X.globalAlpha=.25;
    px(X,x+15,y+18,'#2a2a32');
    X.globalAlpha=1;

    // ── COLD AIR / FOG POURING OUT ──
    for(let i=0;i<4;i++){
      const fogPhase=((t*.008+i*.25)%1);
      const fogY=y+12+fogPhase*18;
      const fogX=x+10+Math.sin(t*.01+i)*3;
      X.globalAlpha=(1-fogPhase)*.25;
      rect(X,fogX,fogY,8+i,2,'#6b726d');
      X.globalAlpha=1;
    }
    // Extra cold breath at step level
    if(t%40<20){
      X.globalAlpha=.1;
      rect(X,x+8,y+14,20,3,'#D9CFB8');
      X.globalAlpha=1;
    }

    // ── WARNING PLAQUE on left ──
    rect(X,x-6,y+12,6,8,P.stone);
    rect(X,x-5,y+13,4,6,P.dstone);
    // Faint text (scratches)
    px(X,x-4,y+14,'#0a0a0e');
    px(X,x-3,y+14,'#0a0a0e');
    px(X,x-4,y+16,'#0a0a0e');
    px(X,x-4,y+18,'#0a0a0e');
    px(X,x-3,y+18,'#0a0a0e');

    // ── BONES scattered at entrance ──
    rect(X,x+25,y+36,3,1,P.bone);
    px(X,x+27,y+35,P.bone);
    rect(X,x+8,y+37,2,1,P.dbone);

    // ── FALLEN ROMAN NUMERAL "IX" near entrance ──
    X.fillStyle='#3a3a42';
    rect(X,x+36,y+34,1,3,'#3a3a42');
    rect(X,x+38,y+34,1,3,'#3a3a42');
    rect(X,x+40,y+34,3,1,'#3a3a42');
    rect(X,x+40,y+36,3,1,'#3a3a42');

    // ── TORCH flickering beside gate ──
    rect(X,x-2,y+8,2,12,P.dwood);
    const trFlick=Math.sin(t*.06)*.5;
    px(X,x-1+trFlick,y+6,P.f2);
    px(X,x-1+trFlick,y+5,P.f1);
    px(X,x-1+trFlick,y+4,'#ffffcc');
    // Torch glow
    X.globalAlpha=.15+.05*Math.sin(t*.03);
    const tGlow=X.createRadialGradient(x-1,y+6,0,x-1,y+6,16);
    tGlow.addColorStop(0,'rgba(255,100,20,1)');
    tGlow.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=tGlow;X.fillRect(x-17,y-10,32,32);
    X.globalAlpha=1;
}

export function draw_dumpster(x, y) {
    // DEMON hovering above
    drawDumpsterDemon(x,y);
    // Dumpster body
    rect(X,x,y+10,40,28,P.dgrey);rect(X,x+1,y+11,38,26,'#3a3030');
    dither(X,x+2,y+14,36,20,P.drust,'#2a1a1a',.5);
    rect(X,x-2,y+6,36,5,P.dgrey);rect(X,x+30,y+2,8,8,P.ash);
    const f=t*.03;
    for(let i=0;i<12;i++){const fx=x+8+Math.sin(f+i*.9)*8;const fy=y+8-i*2-Math.abs(Math.sin(f*1.4+i*.7))*4;const s=Math.max(1,6-Math.floor(i*.4));X.globalAlpha=1-i*.06;rect(X,fx,fy,s,s,[P.f3,P.f3,P.f1,P.f1,P.f4,P.f4,P.f2,P.f2,P.f2,P.f2,'#D9CFB8','#D9CFB8'][i]);};X.globalAlpha=1;
    for(let i=0;i<4;i++){const sx=x+15+Math.sin(t*.005+i*1.5)*12;const sy=y-10-(t*.02+i*8)%30;X.globalAlpha=Math.max(0,.2-(t*.02+i*8)%30/30);rect(X,sx,sy,3,2,P.ash);};X.globalAlpha=1;
    rect(X,x+5,y+30,30,1,P.blood);rect(X,x+8,y+33,24,1,P.blood);
}

export function draw_pizzeria(x, y) {
    if(!playerNearLoc(locs.find(l=>l.id==='pizzeria'),350)){
      drawBuildingSilhouette(x,y+8,98,80,P.drust);
      // Sign silhouette
      rect(X,x-4,y-18,100,16,'#0a0a0a');
      // Live red letter
      if(t%80<40)rect(X,x+1,y-14,5,10,'#6b0f1a');
      return;
    }
    // ═══ ПИЦЦЕРИЯ "ВАВИЛОН" — 3-STORY RUIN, MONUMENT TO GLUTTONY ═══
    // Ground shadow
    X.globalAlpha=.4;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+46,y+80,58,5,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── GROUND FLOOR — wider brick walls ──
    for(let row=0;row<8;row++){
      for(let col=0;col<14;col++){
        const bx=x+col*7+(row%2?3:0);
        const by=y+38+row*5;
        const bw=7-((row+col)%4===0?1:0);
        const c=hash(col,row+x,11)>.5?P.rust:P.drust;
        rect(X,bx,by,bw,4,c);
        rect(X,bx,by+4,bw,1,'#1a0a08');
      }
    }
    // Soot staining on ground floor
    X.globalAlpha=.35;X.fillStyle='#0a0604';
    rect(X,x,y+38,40,35);
    X.globalAlpha=1;

    // ── SECOND FLOOR — partially intact ──
    for(let row=0;row<5;row++){
      for(let col=0;col<14;col++){
        // Right side increasingly damaged
        if(col>9&&row>1&&hash(col,row,22)>.35)continue;
        if(col>11&&hash(col,row,44)>.3)continue;
        const bx=x+col*7+(row%2?3:0);
        const by=y+13+row*5;
        const bw=7-((row+col)%4===0?1:0);
        const c=hash(col,row+x,33)>.5?P.rust:P.drust;
        rect(X,bx,by,bw,4,c);
        rect(X,bx,by+4,bw,1,'#1a0a08');
      }
    }

    // ── THIRD FLOOR — almost gone, skeletal ──
    for(let col=0;col<10;col++){
      if(hash(col,99,55)>.55)continue;
      const bx=x+col*7;
      rect(X,bx,y+3,6,4,hash(col,0,11)>.5?P.rust:P.drust);
      rect(X,bx,y+7,6,1,'#1a0a08');
    }
    // Lone standing column of bricks on left
    for(let i=0;i<3;i++){
      rect(X,x+4,y+i*5,5,4,P.drust);
      rect(X,x+4,y+i*5+4,5,1,'#1a0a08');
    }

    // Roof remnant — only left corner
    rect(X,x-3,y-1,30,5,P.dgrey);
    rect(X,x-2,y,28,3,P.dstone);
    rect(X,x-3,y+4,30,1,'#0a0a0e');
    // Collapsed tiles
    for(let i=0;i<6;i++){
      rect(X,x+30+hash(i,0,11)*15,y+10+hash(i,0,22)*4,3,1,P.dstone);
    }

    // Exposed beams across collapsed right side
    for(let i=0;i<6;i++){
      rect(X,x+42+i*6,y+6,2,14,P.dwood);
      rect(X,x+42+i*6,y+6,1,14,P.wood);
      // Rotted ends
      px(X,x+42+i*6,y+20,'#1a0806');
    }
    // Cross beams
    rect(X,x+42,y+8,36,1,P.dwood);
    rect(X,x+42,y+16,36,1,P.dwood);

    // Sky visible through collapsed roof
    X.globalAlpha=.08;
    rect(X,x+44,y+8,32,10,P.gold);
    X.globalAlpha=1;

    // ── HUGE NEON SIGN "ВАВИЛОН" — spans full width ──
    // Sign backing frame
    rect(X,x-4,y-18,100,16,'#0a0a0a');
    rect(X,x-3,y-17,98,14,'#1a0a0a');
    // Inner sign face
    rect(X,x-2,y-16,96,12,'#050202');
    // Metal frame details
    rect(X,x-4,y-18,100,1,'#2a2a2a');
    rect(X,x-4,y-3,100,1,'#0a0404');
    // Corner bolts
    px(X,x-3,y-17,P.lgrey);px(X,x+94,y-17,P.lgrey);
    px(X,x-3,y-4,P.lgrey);px(X,x+94,y-4,P.lgrey);

    // Letters: В А В И Л О Н — 7 letters across the sign
    // Only first "В" lights; flickers irregularly
    const blink1=t%80<40 && Math.sin(t*.3)>-.8;
    const blink2=Math.sin(t*.15)>.7; // buzz flicker
    // Drawing helper — each letter is 8x10
    const drawNeonLetter=(lx,ly,letter,lit,color,glow)=>{
      if(lit){
        // Bright core
        X.globalAlpha=.95;X.fillStyle=color;
        X.fillText(letter,lx,ly);
      }else{
        // Dead letter — dark tube shape
        X.globalAlpha=.6;X.fillStyle='#2a0a08';
        X.fillText(letter,lx,ly);
      }
      X.globalAlpha=1;
    };
    X.font='bold 12px "Press Start 2P", monospace';
    // First В — alive
    if(blink1){
      // Glow halo
      X.globalAlpha=.35;
      const letterGr=X.createRadialGradient(x+4,y-10,0,x+4,y-10,16);
      letterGr.addColorStop(0,'rgba(255,60,60,.9)');
      letterGr.addColorStop(1,'rgba(0,0,0,0)');
      X.fillStyle=letterGr;X.fillRect(x-12,y-22,32,24);
      X.globalAlpha=1;
      // Tube
      X.fillStyle='#ff3030';
      rect(X,x+1,y-14,5,10,'#ff3030');
      rect(X,x+2,y-14,3,1,'#ff8080');
      rect(X,x+6,y-13,1,3,'#ff3030');
      rect(X,x+2,y-10,3,1,'#ff6060');
      rect(X,x+6,y-9,1,3,'#ff3030');
      rect(X,x+2,y-6,3,1,'#ff6060');
      // Hot spots
      if(blink2){
        X.globalAlpha=.9;
        px(X,x+3,y-13,'#D9CFB8');
        px(X,x+3,y-9,'#D9CFB8');
        px(X,x+3,y-5,'#D9CFB8');
        X.globalAlpha=1;
      }
    }else{
      rect(X,x+1,y-14,5,10,'#3a0a08');
      rect(X,x+2,y-14,3,1,'#1a0404');
      rect(X,x+2,y-10,3,1,'#1a0404');
      rect(X,x+2,y-6,3,1,'#1a0404');
      rect(X,x+6,y-13,1,3,'#3a0a08');
      rect(X,x+6,y-9,1,3,'#3a0a08');
    }
    // Dead letters А В И Л О Н
    const letterPositions=[
      {lx:x+10,char:'А'},
      {lx:x+22,char:'В'},
      {lx:x+34,char:'И'},
      {lx:x+46,char:'Л'},
      {lx:x+58,char:'О'},
      {lx:x+70,char:'Н'}
    ];
    // А
    rect(X,x+10,y-14,6,10,'#2a0a08');
    rect(X,x+11,y-14,4,1,'#1a0404');
    rect(X,x+10,y-14,1,10,'#2a0a08');
    rect(X,x+15,y-14,1,10,'#2a0a08');
    rect(X,x+11,y-10,4,1,'#1a0404');
    // В (dead)
    rect(X,x+22,y-14,5,10,'#2a0a08');
    rect(X,x+23,y-14,3,1,'#1a0404');
    rect(X,x+23,y-10,3,1,'#1a0404');
    rect(X,x+23,y-6,3,1,'#1a0404');
    rect(X,x+27,y-13,1,3,'#2a0a08');
    rect(X,x+27,y-9,1,3,'#2a0a08');
    // И
    rect(X,x+34,y-14,1,10,'#2a0a08');
    rect(X,x+40,y-14,1,10,'#2a0a08');
    for(let di=0;di<5;di++)px(X,x+35+di,y-9+di,'#2a0a08');
    // Л
    rect(X,x+46,y-14,1,10,'#2a0a08');
    rect(X,x+51,y-14,1,10,'#2a0a08');
    rect(X,x+47,y-14,4,1,'#1a0404');
    rect(X,x+48,y-13,3,1,'#2a0a08');
    // О — missing / smashed, only fragment
    rect(X,x+58,y-14,1,6,'#2a0a08');
    rect(X,x+58,y-14,5,1,'#1a0404');
    rect(X,x+62,y-14,1,4,'#2a0a08');
    // O — broken glass below
    px(X,x+59,y-6,P.lgrey);
    px(X,x+61,y-5,P.lgrey);
    // Н
    rect(X,x+70,y-14,1,10,'#2a0a08');
    rect(X,x+76,y-14,1,10,'#2a0a08');
    rect(X,x+71,y-10,5,1,'#1a0404');

    // Sign electrical sparks on dead letters
    if(t%120<5){
      px(X,x+24+hash(t,0,11)*3,y-12+hash(t,0,22)*8,'#ffffcc');
      px(X,x+52+hash(t,2,11)*3,y-12+hash(t,2,22)*8,'#ffffcc');
    }

    // Dangling wire from sign
    X.strokeStyle='#0a0a0e';X.lineWidth=1;
    X.beginPath();
    X.moveTo(x+94,y-2);
    X.quadraticCurveTo(x+100,y+6,x+95,y+14);
    X.stroke();
    rect(X,x+96,y+14,1,4,'#0a0a0e');

    // Rust drips from sign
    rect(X,x+20,y-2,2,4,P.drust);
    rect(X,x+50,y-2,2,3,P.drust);
    rect(X,x+80,y-2,2,5,P.drust);

    // ── WINDOWS — ground floor, 5 bay windows ──
    for(let i=0;i<5;i++){
      const wx=x+5+i*18;
      // Window frame
      rect(X,wx-1,y+40,14,2,P.dgrey);
      rect(X,wx,y+42,12,14,'#040406');
      // Cross frame
      rect(X,wx+5,y+42,2,14,P.dstone);
      rect(X,wx,y+48,12,1,P.dstone);
      // ONE window — flickering candle (middle)
      if(i===2){
        const cf=Math.sin(t*.018+i)*.4+.5;
        X.globalAlpha=cf*.6;
        rect(X,wx+3,y+44,6,9,P.amber);
        X.globalAlpha=cf*.25;
        rect(X,wx+1,y+42,10,14,P.f2);
        X.globalAlpha=1;
        // Silhouette of diner inside
        rect(X,wx+4,y+46,3,5,'#1a0806');
        px(X,wx+4,y+46,'#3a1a08'); // head
      }else if(hash(i,0,55)>.5){
        // Smashed glass
        px(X,wx+3,y+45,P.lgrey);
        px(X,wx+7,y+50,P.lgrey);
        px(X,wx+9,y+47,P.lgrey);
        // Jagged remaining glass
        rect(X,wx+2,y+42,1,3,'#2a2a32');
        rect(X,wx+10,y+42,1,4,'#2a2a32');
      }
      // Boarded up?
      if(i===4){
        rect(X,wx,y+42,12,2,P.dwood);
        rect(X,wx,y+46,12,2,P.dwood);
        rect(X,wx,y+50,12,2,P.dwood);
        // Nails
        px(X,wx+1,y+43,P.ash);
        px(X,wx+11,y+43,P.ash);
        px(X,wx+1,y+51,P.ash);
      }
    }

    // ── SECOND FLOOR WINDOWS — smaller ──
    for(let i=0;i<4;i++){
      const wx=x+8+i*18;
      if(hash(i,22,11)>.3){
        rect(X,wx,y+18,10,8,'#040406');
        rect(X,wx,y+17,10,1,P.dgrey);
        rect(X,wx+4,y+18,2,8,P.dstone);
      }
    }

    // ── MAIN DOUBLE DOOR — ajar ──
    rect(X,x+38,y+56,22,22,'#0a0808');
    rect(X,x+37,y+55,24,2,P.dgrey);
    // Double door frame
    rect(X,x+48,y+56,2,22,P.dstone);
    // Left door (closed)
    rect(X,x+39,y+57,9,20,P.dwood);
    rect(X,x+40,y+58,7,18,P.wood);
    // Door panels
    rect(X,x+41,y+60,5,4,P.dwood);
    rect(X,x+41,y+67,5,4,P.dwood);
    // Handle
    px(X,x+47,y+66,P.gold);
    // Right door (open into darkness)
    rect(X,x+50,y+57,9,20,'#020204');
    // Glimpse of interior — red neon inside
    X.globalAlpha=.3+.1*Math.sin(t*.1);
    rect(X,x+51,y+60,7,10,'#6b0f1a');
    X.globalAlpha=1;
    // Handle on right door
    px(X,x+52,y+66,P.gold);

    // ── "OPEN 24/7" sign above door, cracked ──
    rect(X,x+38,y+52,22,3,'#0a0a0a');
    X.fillStyle='#ff3030';X.font='4px "Press Start 2P"';
    X.globalAlpha=t%90<60?.8:.3;
    X.fillText('OPEN 24/7',x+40,y+55);
    X.globalAlpha=1;
    // Crack through the sign
    rect(X,x+48,y+52,1,3,'#0a0a0e');

    // ── AWNING tattered over door ──
    X.fillStyle=P.crimson;
    X.beginPath();
    X.moveTo(x+34,y+50);
    X.lineTo(x+64,y+50);
    X.lineTo(x+62,y+53);
    X.lineTo(x+36,y+53);
    X.closePath();X.fill();
    // Tattered fringe
    for(let i=0;i<8;i++){
      if(hash(i,0,11)>.4)rect(X,x+36+i*3,y+53,2,2,P.dcrimson||'#3a0a0e');
    }
    // Support poles
    rect(X,x+34,y+48,1,4,P.dgrey);
    rect(X,x+64,y+48,1,4,P.dgrey);
    // Hanging rusted bell
    rect(X,x+35,y+50,2,3,P.rust);
    px(X,x+36,y+51,'#8a6408');

    // ── OUTDOOR SEATING — tables + chairs on sidewalk ──
    // Round table 1
    rect(X,x+68,y+70,8,2,P.dwood);
    rect(X,x+68,y+72,8,1,'#1a0804');
    rect(X,x+71,y+72,2,6,P.dwood);
    rect(X,x+69,y+78,6,1,P.dwood);
    // Umbrella pole
    rect(X,x+71,y+58,2,12,P.dwood);
    // Shredded umbrella
    X.fillStyle=P.crimson;
    X.beginPath();
    X.moveTo(x+64,y+58);
    X.lineTo(x+72,y+54);
    X.lineTo(x+80,y+58);
    X.closePath();X.fill();
    // Tatters
    px(X,x+66,y+59,P.dcrimson||'#3a0a0e');
    px(X,x+78,y+59,P.dcrimson||'#3a0a0e');
    rect(X,x+74,y+56,1,3,P.dcrimson||'#3a0a0e');
    // Chairs around table
    rect(X,x+66,y+72,3,2,P.dwood);
    rect(X,x+66,y+72,1,4,P.dwood);
    rect(X,x+77,y+72,3,2,P.dwood);
    rect(X,x+79,y+72,1,4,P.dwood);
    // Wine glass on table (fallen)
    rect(X,x+71,y+69,2,1,P.lgrey);
    px(X,x+71,y+69,'#6b0f1a'); // red wine spill
    rect(X,x+73,y+71,2,1,'#6b0f1a');

    // Second overturned table
    rect(X,x+82,y+73,8,2,P.dwood);
    rect(X,x+84,y+75,2,4,P.dwood);
    rect(X,x+82,y+79,8,1,P.dwood);
    // Chair on its side
    rect(X,x+82,y+68,2,4,P.dwood);
    rect(X,x+82,y+68,4,2,P.dwood);

    // ── PIZZA BOX graveyard on ground ──
    for(let i=0;i<5;i++){
      const pbx=x+14+i*7+hash(i,0,11)*4;
      const pby=y+76+hash(i,0,22)*4;
      rect(X,pbx,pby,6,3,'#3a2a14');
      rect(X,pbx+1,pby+1,4,2,'#5a3a18');
      // Pepperoni (some rotted)
      if(hash(i,0,33)>.5)px(X,pbx+2,pby+1,P.crimson);
      if(hash(i,0,44)>.5)px(X,pbx+3,pby+1,'#2a1a0a');
    }

    // ── HUGE PIZZA SLICE on ground (petrified) ──
    X.fillStyle='#8a6408';
    X.beginPath();
    X.moveTo(x+8,y+78);
    X.lineTo(x+20,y+74);
    X.lineTo(x+18,y+82);
    X.closePath();X.fill();
    // Crust
    X.strokeStyle='#5a3a08';X.lineWidth=1;
    X.beginPath();X.moveTo(x+20,y+74);X.lineTo(x+18,y+82);X.stroke();
    // Rotten topping
    px(X,x+12,y+77,P.crimson);
    px(X,x+14,y+76,'#2a4a1a'); // moldy green
    px(X,x+15,y+79,'#3a2a0a');
    // Flies buzzing
    for(let i=0;i<3;i++){
      const fy_=y+70+Math.sin(t*.1+i)*2;
      const fx_=x+10+i*3+Math.cos(t*.08+i)*1;
      px(X,fx_,fy_,'#0a0a0a');
    }

    // ── DRIPPING from second floor ──
    if(t%60<10){
      const dripY=y+26+(t%60)*1.2;
      X.globalAlpha=.55;
      px(X,x+40,dripY,P.drust);
      rect(X,x+40,dripY+1,1,2,P.drust);
      X.globalAlpha=1;
    }
    // Puddle at drip landing
    rect(X,x+38,y+85,6,1,P.drust);
    rect(X,x+39,y+86,4,1,'#2a0a04');

    // ── CRACKS on facade ──
    for(let i=0;i<10;i++){
      const cx_=x+5+hash(i,x,11)*82;
      const cy_=y+38+hash(i,y,22)*38;
      rect(X,cx_,cy_,1,3+hash(i,0,33)*6,'#0a0204');
    }
    // Big lightning crack on left
    X.strokeStyle='#0a0204';X.lineWidth=1;
    X.beginPath();
    X.moveTo(x+10,y+40);
    X.lineTo(x+14,y+48);
    X.lineTo(x+12,y+56);
    X.lineTo(x+16,y+66);
    X.stroke();

    // ── MOSS at base and climbing ──
    for(let i=0;i<12;i++){
      const mx_=x+4+hash(i,x,44)*84;
      rect(X,mx_,y+74,3,2,P.dtoxic);
      if(i%2)px(X,mx_+1,y+73,P.toxic);
      // Climbing patches
      if(i<6){
        rect(X,mx_,y+60-i*3,2,2,P.dtoxic);
        if(i%2)px(X,mx_+1,y+59-i*3,P.toxic);
      }
    }

    // ── BROKEN STREETLIGHT next to pizzeria ──
    rect(X,x-5,y+50,1,32,P.dgrey);
    rect(X,x-5,y+46,5,1,P.dgrey);
    rect(X,x-1,y+44,2,3,P.dgrey);
    // Glass
    px(X,x,y+45,P.lgrey);
    // Flicker
    if(Math.sin(t*.25)>.9){
      px(X,x,y+46,P.amber);
      X.globalAlpha=.2;
      X.fillStyle=P.amber;
      X.beginPath();X.arc(x,y+46,4,0,Math.PI*2);X.fill();
      X.globalAlpha=1;
    }
    rect(X,x-7,y+82,5,2,P.dstone);

    // ── CROW on awning ──
    if(t%250<120){
      const cbob=Math.sin(t*.02)*.3;
      rect(X,x+48,y+46+cbob,3,2,'#0a0604');
      px(X,x+51,y+46+cbob,'#0a0604');
      px(X,x+47,y+46+cbob,'#0a0604');
      // Eye
      px(X,x+49,y+46+cbob,P.crimson);
    }

    // ── TELEGRAM STICKER on door — @ardet_mirror ──
    rect(X,x+39,y+62,7,3,P.bone);
    X.fillStyle='#8A8D8F';X.font='3px "Press Start 2P"';
    X.globalAlpha=.7;
    X.fillText('@',x+40,y+65);
    X.globalAlpha=1;
    // Peeling corner
    px(X,x+45,y+62,'#d8c8a8');

    // ═══════════════════════════════════════════════════════════
    // ── СПРАВА В КУСТАХ — pizza box cache / dark lore dump ──
    // ═══════════════════════════════════════════════════════════
    // Ground shadow under bushes
    X.globalAlpha=.3;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+118,y+86,22,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // Toxic scrub bushes — 10 clumps
    for(let i=0;i<10;i++){
      const bx_=x+98+hash(i,x+3,11)*38;
      const by_=y+68+hash(i,y+3,22)*18;
      rect(X,bx_,by_,6,4,P.dtoxic);
      rect(X,bx_+1,by_-1,4,3,P.toxic);
      if(hash(i,0,33)>.5)px(X,bx_+2,by_-2,P.btoxic);
      if(hash(i,0,44)>.6)px(X,bx_+4,by_-1,P.btoxic);
      // Dead twigs
      if(hash(i,0,55)>.6){
        rect(X,bx_+1,by_-3,1,2,'#1a0e06');
        rect(X,bx_+3,by_-4,1,3,'#1a0e06');
      }
    }
    // Tall dried grass sticking up
    for(let i=0;i<16;i++){
      const gx_=x+100+hash(i,1,11)*36;
      const gy_=y+70+hash(i,1,22)*14;
      rect(X,gx_,gy_,1,3+hash(i,0,33)*3,'#3a2a14');
    }

    // ── PIZZA BOX PYRAMID (hidden cache) — 9 boxes ──
    // Back row (lower in stack — deeper perspective)
    const boxes=[
      {bx:x+100,by:y+82,op:false,lbl:'22.05.10'},
      {bx:x+110,by:y+83,op:true,kind:'cd'},
      {bx:x+120,by:y+82,op:false,lbl:'10K BTC'},
      {bx:x+130,by:y+81,op:true,kind:'usb'},
      // Middle row
      {bx:x+104,by:y+77,op:true,kind:'lube'},
      {bx:x+114,by:y+76,op:false,lbl:'L.H.'},
      {bx:x+124,by:y+77,op:true,kind:'draw'},
      // Top row
      {bx:x+108,by:y+72,op:false,lbl:'Mt.Gox'},
      {bx:x+118,by:y+71,op:true,kind:'tape'},
    ];
    boxes.forEach((b,bi)=>{
      // Box base — greasy cardboard
      rect(X,b.bx,b.by,9,5,'#3a2a14');
      rect(X,b.bx,b.by,9,1,'#5a3a18');
      rect(X,b.bx,b.by+4,9,1,'#1a0804');
      // Corner wear
      px(X,b.bx,b.by,'#2a1808');
      px(X,b.bx+8,b.by,'#2a1808');
      // Faded pizzeria stamp (red circle)
      if(bi%3===0){
        X.globalAlpha=.4;
        px(X,b.bx+4,b.by+1,'#8b0000');
        px(X,b.bx+5,b.by+2,'#8b0000');
        X.globalAlpha=1;
      }
      // Grease stain
      if(hash(bi,0,22)>.5){
        X.globalAlpha=.3;X.fillStyle='#0a0604';
        rect(X,b.bx+2,b.by+3,5,1);
        X.globalAlpha=1;
      }

      if(b.op){
        // Lid flipped open upward
        rect(X,b.bx,b.by-3,9,3,'#2a1808');
        rect(X,b.bx,b.by-3,9,1,'#4a2a0e');
        rect(X,b.bx+1,b.by-2,7,1,'#1a0804');
        // Dark interior
        rect(X,b.bx+1,b.by+1,7,3,'#020102');

        // Contents by kind
        if(b.kind==='cd'){
          // CD-R in paper sleeve, no label
          rect(X,b.bx+1,b.by+2,7,1,'#d8c8a8');
          rect(X,b.bx+2,b.by+2,5,1,'#b8a888');
          // Disc edge peeking out
          px(X,b.bx+5,b.by+2,'#c0c0c0');
          px(X,b.bx+6,b.by+2,'#8a8a8a');
          // Aluminum disc glint
          px(X,b.bx+4,b.by+3,'#D9CFB8');
        }else if(b.kind==='usb'){
          // 3 USB flash drives — no cases, exposed PCB green
          rect(X,b.bx+1,b.by+2,2,1,'#0a3a0a'); // PCB green
          rect(X,b.bx+3,b.by+2,1,1,'#8a8a8a'); // connector
          rect(X,b.bx+4,b.by+2,2,1,'#0a0a0a'); // black drive
          rect(X,b.bx+6,b.by+2,1,1,'#8a8a8a');
          rect(X,b.bx+1,b.by+3,2,1,'#0a3a0a');
          px(X,b.bx+3,b.by+3,'#8a8a8a');
        }else if(b.kind==='lube'){
          // Lubricant tubes — squeezed flat
          rect(X,b.bx+1,b.by+2,5,1,'#e0e0e0');
          rect(X,b.bx+6,b.by+2,1,1,'#8a6408'); // cap
          // Second smaller tube
          rect(X,b.bx+2,b.by+3,3,1,'#c8c8c8');
          px(X,b.bx+5,b.by+3,'#8a6408');
        }else if(b.kind==='draw'){
          // Children's drawing folded inside
          rect(X,b.bx+1,b.by+2,7,2,P.bone);
          // Crayon marks — sun, smile, stick figure
          px(X,b.bx+2,b.by+2,P.gold); // sun
          px(X,b.bx+3,b.by+2,'#D9CFB8');
          px(X,b.bx+5,b.by+3,P.crimson); // mouth
          px(X,b.bx+6,b.by+2,'#3D4A3A'); // tree
          px(X,b.bx+4,b.by+3,'#0a0a0a'); // stick figure
        }else if(b.kind==='tape'){
          // Magnetic tape cassette
          rect(X,b.bx+1,b.by+2,7,2,'#0a0a0a');
          rect(X,b.bx+2,b.by+3,1,1,'#3a3a3a'); // reel 1
          rect(X,b.bx+6,b.by+3,1,1,'#3a3a3a'); // reel 2
          // Label strip
          rect(X,b.bx+3,b.by+2,3,1,'#d8c8a8');
        }
      }

      // Scrawled label (Sharpie)
      if(b.lbl){
        X.fillStyle='#050202';
        X.font='3px "Press Start 2P"';
        X.globalAlpha=.8;
        X.fillText(b.lbl,b.bx+1,b.by+4);
        X.globalAlpha=1;
      }
    });

    // ── BITCOIN PIZZA DAY receipt on top of pile ──
    rect(X,x+118,y+66,12,5,'#d8c8a8');
    rect(X,x+118,y+66,12,1,'#b8a888');
    rect(X,x+118,y+70,12,1,'#8a7a58');
    // Curled edge
    px(X,x+129,y+66,'#3a2a14');
    // Receipt text (tiny pixels as scanline)
    X.fillStyle='#1a0806';
    // Date line "22.05.10"
    for(let i=0;i<8;i++)if(i%2)rect(X,x+119+i,y+67,1,1);
    // "2 PIZZA" line
    for(let i=0;i<6;i++)if(hash(i,0,11)>.4)rect(X,x+119+i,y+68,1,1);
    // "10000 BTC" line — bigger
    X.fillStyle='#4a2a0e';
    rect(X,x+119,y+69,10,1);

    // ── Empty BTC WALLET address paper beside pile ──
    rect(X,x+132,y+84,8,3,'#d8c8a8');
    rect(X,x+132,y+84,8,1,'#b8a888');
    X.fillStyle='#8A8D8F';
    X.font='3px "Press Start 2P"';
    X.globalAlpha=.6;
    X.fillText('bc1q...',x+133,y+86);
    X.globalAlpha=1;
    // Scribble crossing it out
    X.strokeStyle='#6b0f1a';X.lineWidth=1;
    X.beginPath();X.moveTo(x+132,y+85);X.lineTo(x+140,y+87);X.stroke();

    // ── Silk Road "closed" sticker on side box ──
    rect(X,x+119,y+75,7,2,'#6b0f1a');
    X.fillStyle=P.bone;X.font='3px "Press Start 2P"';
    X.globalAlpha=.7;
    X.fillText('SR-02.10.13',x+119,y+77);
    X.globalAlpha=1;

    // ── Flies buzzing over cache ──
    for(let i=0;i<6;i++){
      const fy_=y+62+Math.sin(t*.1+i*.7)*3;
      const fx_=x+104+i*5+Math.cos(t*.08+i*.5)*1;
      px(X,fx_,fy_,'#0a0a0a');
    }

    // ── Faint green glow from open boxes (screens? discs?) ──
    X.globalAlpha=.06+.03*Math.sin(t*.03);
    const glowG=X.createRadialGradient(x+118,y+78,0,x+118,y+78,20);
    glowG.addColorStop(0,'rgba(74,255,74,.6)');
    glowG.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=glowG;
    X.fillRect(x+98,y+58,42,32);
    X.globalAlpha=1;

    // ── Trail of drag marks from pizzeria door to bushes ──
    X.globalAlpha=.25;X.fillStyle='#1a0804';
    for(let i=0;i<12;i++){
      rect(X,x+62+i*4,y+84+Math.sin(i*.5)*1,2,1);
    }
    X.globalAlpha=1;

    // ── Fresh footprints leading INTO the bushes (single direction) ──
    X.fillStyle='#0a0604';
    for(let i=0;i<5;i++){
      const fpx=x+96+i*6;
      const fpy=y+88;
      rect(X,fpx,fpy,2,1);
      rect(X,fpx+1,fpy+1,2,1);
    }
}

// Обрушенный мост — северный конец эстакады над трассой (world/town.js): два
// уцелевших пролёта на опорах, средний рухнул плитой на землю; над провалом —
// канат, истлевший до нитки; с края свисает верёвка, конец перетёрт; на
// уцелевшей опоре — щит. Восточный пролёт держит первая опора эстакады
// (render/arteryProps.js) — дальше пролёты идут над рельсами и трассой.
// Бетон — краской эстакад колец; настил на 24 точки над землёй, как у них.
const OV_C = '#5a5650', OV_D = '#3e3b36', OV_L = '#8a857a', OV_R = '#4a3420';
export function draw_overpass(x, y) {
    const g = y + 60, top = g - 30;                    // земля и верх настила
    // тень настила на земле
    X.globalAlpha = .3; X.fillStyle = '#0D0B0A';
    X.fillRect(x + 1, g - 2, 44, 3); X.fillRect(x + 79, g - 2, 21, 3); X.globalAlpha = 1;
    // рухнувший пролёт: плита лежит наискось, переломлена; осыпь
    for (let i = 0; i < 28; i++) {
      const px0 = x + 48 + i, py0 = g - 3 - Math.round(i * 0.28) - (i > 15 ? 2 : 0);
      rect(X, px0, py0 - 4, 1, 4, i === 15 || i === 16 ? '#0D0B0A' : OV_D);
      px(X, px0, py0 - 4, OV_L);
    }
    rect(X, x + 47, g - 3, 3, 3, OV_D); rect(X, x + 66, g - 2, 4, 2, OV_C); px(X, x + 66, g - 2, OV_L);
    rect(X, x + 74, g - 3, 3, 3, OV_C); px(X, x + 54, g - 1, OV_L); px(X, x + 71, g - 1, OV_D);
    // опоры
    for (const ox of [6, 33]) {
      rect(X, x + ox, top + 6, 5, 24, OV_C); rect(X, x + ox, top + 6, 1, 24, OV_L); rect(X, x + ox + 4, top + 6, 1, 24, OV_D);
      rect(X, x + ox - 1, top + 6, 7, 2, OV_D);
    }
    // настил: западный пролёт до слома, восточный — консолью к опоре эстакады
    const deck = (a, b) => {
      rect(X, a, top, b - a, 6, OV_D); rect(X, a, top, b - a, 1, OV_L); rect(X, a, top + 5, b - a, 1, '#0D0B0A');
      rect(X, a, top - 2, b - a, 1, OV_L);
      for (let k = a; k < b; k += 4) px(X, k, top - 1, OV_C);
    };
    deck(x, x + 45); deck(x + 79, x + 100);
    // сломы: край рваный, арматура наружу
    rect(X, x + 45, top + 1, 1, 3, OV_D); rect(X, x + 44, top + 4, 1, 1, OV_C);
    rect(X, x + 46, top + 2, 2, 1, OV_R); rect(X, x + 46, top + 4, 3, 1, OV_R);
    rect(X, x + 78, top + 2, 1, 3, OV_D); rect(X, x + 76, top + 1, 2, 1, OV_R); rect(X, x + 75, top + 3, 3, 1, OV_R);
    // арматура свисает с восточного слома — качается
    for (let i = 0; i < 3; i++) {
      const sw = Math.round(Math.sin(t * .005 + i * 2) * 1.4);
      for (let k = 0; k < 7 + i * 2; k++) px(X, x + 79 + i * 3 + (k > 3 ? sw : 0), top + 6 + k, OV_R);
    }
    // канат над провалом — истлел до нитки: провис, местами пропал
    X.globalAlpha = .75;
    for (let i = 0; i <= 33; i++) {
      const u = i / 33, yy = top - 1 + Math.round(6 * (1 - (2 * u - 1) ** 2));
      if ((i * 7) % 11 < 2) continue;
      px(X, x + 45 + i, yy, '#b0a284');
    }
    X.globalAlpha = 1;
    // верёвка свисает с восточного края, конец перетёрт
    const sw = Math.round(Math.sin(t * .003) * 1.2);
    for (let k = 0; k < 14; k++) px(X, x + 91 + (k > 6 ? sw : 0), top + 6 + k, '#8a857a');
    px(X, x + 90 + sw, top + 20, '#8a857a'); px(X, x + 92 + sw, top + 21, '#8a857a');
    // труба под настилом, разбита у слома — капает
    rect(X, x + 18, top + 7, 27, 2, '#241c14'); px(X, x + 18, top + 7, '#8a857a');
    if (t % 90 < 20) {
      const dropY = top + 9 + (t % 90) * 1.2;
      X.globalAlpha = .5; px(X, x + 44, dropY, P.toxic); X.globalAlpha = 1;
    }
    // щит на уцелевшей опоре: строки не прочесть
    rect(X, x + 3, top + 12, 11, 7, '#2a2620'); rect(X, x + 4, top + 13, 9, 5, '#b0a284');
    for (let k = 0; k < 3; k++) rect(X, x + 5, top + 14 + k * 1.5 | 0, 7 - (k === 2 ? 3 : 0), 1, '#3a3328');
    // на опоре — аэрозолем, киноварью, наискось
    X.globalAlpha = .7;
    for (let k = 0; k < 5; k++) px(X, x + 34 + k, top + 18 + (k & 1), '#C23B2B');
    X.globalAlpha = 1;
}

export function draw_riverbed(x, y) {
    // Animated puddle reflection
    const shimmer=Math.sin(t*.004)*.3+.3;
    X.globalAlpha=shimmer*.15;
    X.fillStyle='#3D4A3A';             // мгла: вода стоит небом, синего в палитре нет
    X.beginPath();X.ellipse(x+30,y+15,12,4,0,0,Math.PI*2);X.fill();
    X.globalAlpha=1;
    // Occasional ripple
    if(t%120<30){
      const ripR=(t%120)*0.5;
      X.globalAlpha=.1*(1-(t%120)/30);
      X.strokeStyle='#D9CFB8';X.lineWidth=1;
      X.beginPath();X.arc(x+30,y+15,ripR,0,Math.PI*2);X.stroke();
      X.globalAlpha=1;
    }
}

export function draw_billboard(x, y) {
    // ═══ FALLEN BILLBOARD — Just Do It + Bored Ape ═══
    // Main billboard panel (fallen flat, angled slightly)
    rect(X,x,y,75,38,P.dgrey);
    rect(X,x+1,y+1,73,36,P.dstone);

    // Wooden frame behind
    rect(X,x-1,y+10,77,3,P.dwood);
    rect(X,x-1,y+26,77,3,P.dwood);
    // Support posts sticking out
    rect(X,x+8,y+37,2,12,P.dwood);
    rect(X,x+65,y+37,2,12,P.dwood);

    // ── POSTER CONTENT ──
    // Background — cream/peeling paper
    rect(X,x+2,y+2,71,34,P.parchment);
    // Weathering
    dither(X,x+3,y+3,69,32,'#8a7458','#e8d8b0',.2);

    // ── NIKE-STYLE TOP HALF — "Just Do It" ──
    // Big black "JUST DO IT" text (pixel-simulated)
    X.fillStyle='#0a0a0a';
    // J
    rect(X,x+6,y+6,3,8);rect(X,x+5,y+12,4,2);rect(X,x+5,y+13,2,1);
    // U
    rect(X,x+11,y+6,2,6);rect(X,x+15,y+6,2,6);rect(X,x+11,y+12,6,2);
    // S
    rect(X,x+19,y+6,5,2);rect(X,x+19,y+9,5,2);rect(X,x+19,y+12,5,2);
    rect(X,x+19,y+6,2,3);rect(X,x+22,y+9,2,5);
    // T
    rect(X,x+26,y+6,6,2);rect(X,x+28,y+6,2,8);
    // (space)
    // D
    rect(X,x+34,y+6,2,8);rect(X,x+34,y+6,4,2);rect(X,x+34,y+12,4,2);rect(X,x+37,y+8,1,4);
    // O
    rect(X,x+40,y+6,4,8);rect(X,x+40,y+6,4,2);rect(X,x+40,y+12,4,2);
    // (space)
    // I
    rect(X,x+47,y+6,3,8);
    // T
    rect(X,x+52,y+6,6,2);rect(X,x+54,y+6,2,8);

    // Swoosh (Nike tick)
    X.strokeStyle='#0a0a0a';X.lineWidth=2;
    X.beginPath();
    X.moveTo(x+61,y+10);
    X.quadraticCurveTo(x+66,y+14,x+69,y+8);
    X.stroke();
    X.lineWidth=1;

    // ── NFT STICKER over right part ──
    // Paper corner stuck on
    const nftX=x+45,nftY=y+18;
    rect(X,nftX,nftY,20,16,'#1a1a1a');
    rect(X,nftX+1,nftY+1,18,14,'#2a2a2a');
    // Bored Ape tiny face
    // Head
    rect(X,nftX+4,nftY+3,12,10,'#3a2618');
    // Eyes (bored — half-closed)
    rect(X,nftX+6,nftY+6,2,1,'#e8dcc8');
    rect(X,nftX+11,nftY+6,2,1,'#e8dcc8');
    // Mouth (frowning)
    rect(X,nftX+7,nftY+10,6,1,'#1a0a06');
    // Hat (tiny sailor hat or crown)
    rect(X,nftX+5,nftY+2,10,1,'#6b0f1a');
    rect(X,nftX+7,nftY+1,6,1,'#6b0f1a');
    // Cigar
    rect(X,nftX+13,nftY+11,3,1,'#b8860b');
    // "#4729" label
    X.fillStyle=P.damber;
    px(X,nftX+2,nftY+14);rect(X,nftX+3,nftY+14,3,1);
    px(X,nftX+7,nftY+14);px(X,nftX+9,nftY+14);px(X,nftX+11,nftY+14);
    // Crossed out price "1.2M$ → 0.0001"
    X.fillStyle='#6b0f1a';
    rect(X,nftX+2,nftY+15,14,1);

    // ── "КУПИ ИЛИ УМРИ" scribble at bottom ──
    X.fillStyle='#1a0a06';
    for(let i=0;i<12;i++){
      rect(X,x+6+i*4,y+30,2,1);
      if(i%2)rect(X,x+6+i*4,y+32,2,1);
    }

    // Handwritten addition in red: "УМЕР. НЕ КУПИЛ."
    X.fillStyle='#6b0f1a';
    for(let i=0;i<10;i++){
      px(X,x+8+i*3,y+34);
      if(i%3)px(X,x+8+i*3,y+35);
    }

    // ── TORN CORNER flapping ──
    const flap=Math.sin(t*.02)*3;
    rect(X,x+68+flap*.5,y+4,5,7,P.parchment);
    rect(X,x+68+flap*.5,y+4,5,1,'#8a7458'); // torn edge shadow
    rect(X,x+67+flap,y+3,2,8,'#8a7458'); // bend shadow

    // Small nail holding it
    px(X,x+72,y+4,P.ash);

    // ── OLD CROW on the frame ──
    if(t%400<380){
      rect(X,x+30,y-2,2,1,'#050505');
      px(X,x+32,y-2,'#050505');
      px(X,x+29,y-2,'#050505'); // beak
    }

    // Dust/rust dripping down from frame
    rect(X,x+8,y+37,1,8,P.rust);
    rect(X,x+65,y+37,1,6,P.rust);

    // ═══════════════════════════════════════════════
    // ── NFT GRAVEYARD — 20 Bored Apes nailed to the billboard extension ──
    // ═══════════════════════════════════════════════
    // Extended canvas to the right — pinned printouts
    rect(X,x+75,y,30,50,P.dgrey);
    rect(X,x+76,y+1,28,48,P.dstone);
    // Peeling paper background
    rect(X,x+77,y+2,26,46,'#1a1a1a');

    // 20 tiny Bored Ape prints in a 4x5 grid, each 5x6
    const apeColors=['#3a2618','#4a2a08','#5a3a18','#2a1a08','#6b4a18'];
    for(let gi=0;gi<20;gi++){
      const gcol=gi%4,grow=Math.floor(gi/4);
      const apx=x+78+gcol*6,apy=y+3+grow*8;
      // Print paper
      rect(X,apx,apy,5,7,P.parchment);
      // Ape head silhouette
      const apc=apeColors[gi%5];
      rect(X,apx+1,apy+1,3,3,apc);
      // Eyes (bored — half closed)
      px(X,apx+1,apy+2,P.bone);
      px(X,apx+3,apy+2,P.bone);
      // Frown
      rect(X,apx+1,apy+3,3,1,'#0a0604');
      // Hat / accessory
      if(gi%3===0)rect(X,apx+1,apy,3,1,'#6b0f1a');
      else if(gi%3===1)rect(X,apx+1,apy,3,1,'#252b22');
      else rect(X,apx+1,apy,3,1,P.gold);
      // Nail in center-top
      px(X,apx+2,apy,P.ash);
      // Price line (crossed out)
      rect(X,apx,apy+5,5,1,'#6b0f1a');
      // Id number
      X.globalAlpha=.4;X.fillStyle='#050202';
      px(X,apx,apy+6);px(X,apx+2,apy+6);px(X,apx+4,apy+6);
      X.globalAlpha=1;
    }

    // ── BTC CHART — falling line graph below the apes ──
    rect(X,x+77,y+42,26,6,'#050205');
    // Axis
    rect(X,x+77,y+47,26,1,'#3a3a42');
    rect(X,x+77,y+42,1,6,'#3a3a42');
    // The crash line — starts high left, crashes right
    X.strokeStyle='#6b0f1a';X.lineWidth=1;
    X.beginPath();
    X.moveTo(x+78,y+46);  // 2020 low
    X.lineTo(x+82,y+45);  // 2020 rise
    X.lineTo(x+86,y+43);  // 2021 peak ATH 69k
    X.lineTo(x+88,y+44);
    X.lineTo(x+91,y+42);  // second peak
    X.lineTo(x+94,y+45);  // LUNA crash
    X.lineTo(x+97,y+46);  // FTX
    X.lineTo(x+100,y+47); // bottom 16k
    X.stroke();
    X.lineWidth=1;
    // Peak marker "69K"
    X.fillStyle=P.gold;X.font='3px "Press Start 2P"';
    X.globalAlpha=.7;
    X.fillText('69K',x+85,y+42);
    X.fillStyle='#6b0f1a';
    X.fillText('16K',x+98,y+47);
    X.globalAlpha=1;

    // ── SBF SKETCH in sharpie over the chart ──
    // Curly hair (scribble)
    X.fillStyle='#050202';
    for(let i=0;i<8;i++){
      const hx=x+90+hash(i,0,11)*6;
      const hy=y+38+hash(i,0,22)*2;
      px(X,hx,hy);
    }
    // Round face outline
    X.strokeStyle='#050202';X.lineWidth=1;
    X.beginPath();X.arc(x+93,y+40,2,0,Math.PI*2);X.stroke();
    // Zero eyes (0 0)
    px(X,x+92,y+40,P.bone);
    px(X,x+94,y+40,P.bone);

    // ── "WAGMI" crossed out, "NGMI" beside ──
    X.globalAlpha=.6;
    X.fillStyle='#050202';X.font='3px "Press Start 2P"';
    X.fillText('WAGMI',x+78,y+12);
    // Strike through
    X.strokeStyle='#6b0f1a';X.lineWidth=1;
    X.beginPath();X.moveTo(x+77,y+11);X.lineTo(x+94,y+11);X.stroke();
    X.fillStyle='#6b0f1a';
    X.fillText('NGMI',x+96,y+12);
    X.globalAlpha=1;

    // ── Beeple receipt fluttering ──
    const bfl=Math.sin(t*.02)*.8;
    rect(X,x+79+bfl,y+20,10,4,P.bone);
    rect(X,x+79+bfl,y+20,10,1,'#8a7458');
    X.fillStyle='#1a0806';
    X.font='3px "Press Start 2P"';
    X.globalAlpha=.6;
    X.fillText('69.3M',x+80+bfl,y+23);
    X.globalAlpha=1;

    // ── Pile of torn-off ape prints at base ──
    for(let i=0;i<8;i++){
      const tpx=x+76+i*4+hash(i,0,11)*3;
      const tpy=y+48+hash(i,0,22)*3;
      rect(X,tpx,tpy,3,3,P.parchment);
      px(X,tpx+1,tpy+1,apeColors[i%5]); // ape glimpse
      // Torn edges
      if(hash(i,0,33)>.5)px(X,tpx,tpy,'#8a7458');
    }

    // Graveyard crosses near the ape pile (tiny wooden crosses)
    for(let i=0;i<3;i++){
      const cx=x+80+i*8;
      const cy=y+52;
      rect(X,cx,cy,1,4,P.dwood);
      rect(X,cx-1,cy+1,3,1,P.dwood);
    }
}

export function draw_ruins(x, y) {
    if(!playerNearLoc(locs.find(l=>l.id==='ruins'),350)){
      drawBuildingSilhouette(x,y,108,88,P.dgrey);
      // Lit window 42 still flickers
      if(Math.sin(t*.003)>.2){
        rect(X,x+72,y+14,8,3,P.amber);
      }
      return;
    }
    // ═══ APARTMENT BLOCK #7 — 12-STORY KHRUSHCHYOVKA RUIN ═══
    // Massive Soviet panel building, half-collapsed, swarming with detail
    // Shadow
    X.globalAlpha=.4;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+54,y+92,60,5,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── MAIN BUILDING — 12 stories × 7 columns ──
    const bldW=108,bldH=88;
    // Base structure — concrete panels
    rect(X,x,y,bldW,bldH,P.dgrey);
    rect(X,x+1,y+1,bldW-2,bldH-2,P.dstone);
    // Weathering dither
    dither(X,x+2,y+2,bldW-4,bldH-4,P.stone,P.dstone,.28);
    // Rain streaks down walls
    for(let i=0;i<14;i++){
      const rx_=x+4+hash(i,x,11)*100;
      const rh_=20+hash(i,x,22)*40;
      X.globalAlpha=.25;
      rect(X,rx_,y+2,1,rh_,'#0a0a0e');
      X.globalAlpha=1;
    }
    // Concrete panel horizontal seams (every story)
    for(let row=0;row<13;row++){
      rect(X,x,y+row*6+5,bldW,1,'#050508');
      rect(X,x,y+row*6+6,bldW,1,'#1a1a22');
    }
    // Vertical panel seams
    for(let col=0;col<8;col++){
      rect(X,x+col*14,y,1,bldH,'#0a0a0e');
    }

    // ── WINDOWS — 12 floors × 7 columns = 84 windows ──
    for(let row=0;row<12;row++){
      for(let col=0;col<7;col++){
        const wx=x+3+col*14;
        const wy=y+2+row*6;
        // Most windows — dark void
        rect(X,wx,wy,10,3,'#040408');
        // Cracked glass
        if(hash(col,row,11)>.7){
          rect(X,wx+2,wy,1,3,'#1a1a22');
          rect(X,wx+5,wy+1,1,2,'#1a1a22');
        }
        // Window frame
        rect(X,wx,wy,1,3,P.dstone);
        rect(X,wx+9,wy,1,3,P.dstone);
        rect(X,wx+4,wy,1,3,P.dstone);
        // Boarded window (plywood)
        if(hash(col+1,row+2,22)>.85){
          rect(X,wx,wy,10,3,'#3a2814');
          rect(X,wx,wy+1,10,1,'#2a1808');
        }
        // Smashed window
        if(hash(col+2,row+3,33)>.88){
          rect(X,wx,wy,10,3,'#020204');
          px(X,wx+3,wy+1,'#1a1a22');
          px(X,wx+6,wy+2,'#1a1a22');
        }
      }
    }

    // ── THE APARTMENT #42 — 3rd floor, right window — LIT ──
    const apt42X=x+3+5*14,apt42Y=y+2+2*6;
    const windowOn=Math.sin(t*.003)>.2;
    if(windowOn){
      X.globalAlpha=.6+.15*Math.sin(t*.01);
      rect(X,apt42X+1,apt42Y,8,3,'#2a1a08');
      rect(X,apt42X+2,apt42Y,6,3,P.amber);
      X.globalAlpha=1;
      // Thermometer silhouette
      X.fillStyle='#1a1008';
      rect(X,apt42X+3,apt42Y+1,2,2);
      px(X,apt42X+4,apt42Y+2,'#8b0000');
      // Lamp glow
      X.globalAlpha=.1+.04*Math.sin(t*.01);
      const wg=X.createRadialGradient(apt42X+5,apt42Y+2,0,apt42X+5,apt42Y+2,18);
      wg.addColorStop(0,'rgba(218,165,32,1)');
      wg.addColorStop(1,'rgba(0,0,0,0)');
      X.fillStyle=wg;X.fillRect(apt42X-13,apt42Y-16,36,36);
      X.globalAlpha=1;
    }
    // Yellowed curtain, fluttering
    const cFlut=Math.sin(t*.015)*1.5;
    rect(X,apt42X+1+cFlut,apt42Y,2,3,'#b8a888');
    // ── BEHEMOTH — the cat silhouette in the lit window ──
    // Black cat sitting, tail curved, ears up
    if(windowOn){
      const catBr=Math.sin(t*.006)*.3;
      // Body
      rect(X,apt42X+6,apt42Y+1+catBr,3,2,'#050404');
      // Head
      rect(X,apt42X+7,apt42Y+catBr,2,1,'#050404');
      // Ears (two pointed)
      px(X,apt42X+7,apt42Y-1+catBr,'#050404');
      px(X,apt42X+8,apt42Y-1+catBr,'#050404');
      // Eye — glinting
      if(Math.sin(t*.04)>0)px(X,apt42X+8,apt42Y+catBr,P.amber);
      else px(X,apt42X+8,apt42Y+catBr,P.crimson);
      // Tail wrapping down
      px(X,apt42X+6,apt42Y+3+catBr,'#050404');
    }
    // "42" sign scratched into wall
    X.fillStyle='#1a0a06';
    rect(X,apt42X-2,apt42Y+4,1,1);rect(X,apt42X-1,apt42Y+4,1,1);
    rect(X,apt42X-2,apt42Y+5,1,1);
    rect(X,apt42X,apt42Y+4,1,1);rect(X,apt42X+1,apt42Y+4,1,1);
    // ── wall paint by entrance (kept in the quiet register) ──
    X.globalAlpha=.85;X.fillStyle=P.bone;X.font='4px "Press Start 2P"';
    X.fillText('ЖИЛЬЦЫ СЪЕХАЛИ',x+44,y+bldH-22);
    X.fillText('РАНЬШЕ ПОЖАРА',x+46,y+bldH-17);
    X.globalAlpha=1;
    // Oil spill at the base (golden-brown puddle)
    X.fillStyle='#3a2a08';
    X.beginPath();X.ellipse(x+62,y+bldH+1,7,2,0,0,Math.PI*2);X.fill();
    X.fillStyle='#5a4a18';
    X.beginPath();X.ellipse(x+62,y+bldH+1,5,1,0,0,Math.PI*2);X.fill();
    // Reflection glint on oil
    px(X,x+61,y+bldH,P.gold);
    px(X,x+63,y+bldH+1,P.gold);
    // Tram rail embedded in asphalt running past the spill
    rect(X,x+20,y+bldH+3,80,1,'#4a4a52');
    rect(X,x+20,y+bldH+5,80,1,'#4a4a52');
    // Rail sleepers
    for(let sl=0;sl<8;sl++){
      rect(X,x+22+sl*10,y+bldH+2,2,5,'#2a1808');
    }
    // ── APARTMENT #13 — ground floor, left — door with 20 locks ──
    // (declared here so PRIMUS block below can reference apt13X)
    const apt13X=x+2,apt13Y=y+bldH-14;
    // ── PRIMUS on the landing outside apt 13 ──
    const prX=apt13X+12,prY=apt13Y+7;
    // Primus base (brass)
    rect(X,prX,prY+3,6,3,'#8a6408');
    rect(X,prX,prY+3,6,1,P.gold);
    rect(X,prX,prY+5,6,1,'#4a3008');
    // Fuel reservoir
    rect(X,prX+1,prY,4,3,'#6a4a08');
    rect(X,prX+1,prY,4,1,'#8a6408');
    // Burner head
    rect(X,prX+2,prY-1,2,1,'#3a2408');
    // Tiny blue flame (primus is REPAIRED and burning)
    const prFl=Math.sin(t*.15)*.5;
    X.globalAlpha=.8;
    px(X,prX+2+prFl*.3,prY-2,'#8A8D8F');
    px(X,prX+3+prFl*.3,prY-3,'#D9CFB8');
    px(X,prX+3+prFl*.3,prY-2,'#8A8D8F');
    X.globalAlpha=1;
    // "починил" scratched beside primus
    X.globalAlpha=.4;X.fillStyle=P.bone;X.font='3px "Press Start 2P"';
    X.fillText('починил',prX-2,prY+10);
    X.globalAlpha=1;
    // ── «НЕ РАЗГОВАРИВАЙТЕ С НЕИЗВЕСТНЫМИ» chalk on wall near primus ──
    X.globalAlpha=.3;
    X.fillText('НЕ РАЗГОВАРИВАЙТЕ',x+16,y+bldH-28);
    X.fillText('С НЕИЗВЕСТНЫМИ',x+18,y+bldH-24);
    X.globalAlpha=1;

    // ── APT #13 DOOR (visual) — 20 locks ──
    rect(X,apt13X,apt13Y,10,14,'#1a0e06');
    rect(X,apt13X+1,apt13Y+1,8,12,'#0a0604');
    for(let i=0;i<20;i++){
      const lx=apt13X+2+(i%4)*2;
      const ly=apt13Y+2+Math.floor(i/4)*2;
      px(X,lx,ly,P.ash);
    }
    px(X,apt13X+8,apt13Y+7,P.amber);
    // Eye peeking through peephole
    if(t%400<30){
      px(X,apt13X+5,apt13Y+4,P.bone);
    }

    // ── COLLAPSED TOP-LEFT — 3 floors gone (bigger hole now) ──
    X.fillStyle='#0a0a0e';
    X.beginPath();
    X.moveTo(x,y);
    X.lineTo(x+32,y);
    X.lineTo(x+40,y+10);
    X.lineTo(x+26,y+18);
    X.lineTo(x+10,y+14);
    X.lineTo(x,y+10);
    X.closePath();X.fill();
    // Exposed rebar (twisted)
    for(let i=0;i<6;i++){
      rect(X,x+8+i*4,y+10-i*1.5,1,5+i,P.rust);
      // Bent tip
      px(X,x+9+i*4,y+9-i*1.5,P.rust);
    }
    // Exposed interior — furniture silhouettes
    // Broken bathtub hanging from edge
    rect(X,x+18,y+13,8,3,P.stone);
    rect(X,x+18,y+16,8,1,'#1a1a22');
    rect(X,x+19,y+14,6,1,'#0a0a0e');
    // Pipe jutting out
    rect(X,x+26,y+15,4,1,P.rust);
    // Falling ceiling panel
    rect(X,x+14,y+8,10,2,P.dstone);
    rect(X,x+13,y+10,12,1,'#0a0a0e');
    // Rebar support through hole
    rect(X,x+30,y+4,1,10,P.rust);

    // Massive rubble pile at base
    for(let i=0;i<16;i++){
      rect(X,x-6+hash(i,0,11)*52,y+bldH+hash(i,0,22)*6,3+hash(i,0,33)*4,2+hash(i,0,44)*2,hash(i,0,55)>.5?P.dgrey:P.dstone);
    }
    // Big chunk
    rect(X,x+10,y+bldH+2,8,6,P.dstone);
    rect(X,x+11,y+bldH+3,6,4,P.stone);
    // Rebar sticking out of chunk
    rect(X,x+12,y+bldH-1,1,4,P.rust);
    rect(X,x+15,y+bldH,1,3,P.rust);

    // ── FIRE ESCAPE — zigzag metal staircase on right side ──
    X.strokeStyle='#1a1a22';X.lineWidth=1;
    for(let floor=0;floor<10;floor++){
      const fy=y+6+floor*7;
      // Horizontal platform
      rect(X,x+bldW,fy,10,1,'#2a2a32');
      rect(X,x+bldW,fy+1,10,1,'#0a0a0e');
      // Support brackets to wall
      rect(X,x+bldW,fy-1,1,3,P.rust);
      rect(X,x+bldW+9,fy-1,1,3,P.rust);
      // Railing
      rect(X,x+bldW+1,fy-3,1,3,'#2a2a32');
      rect(X,x+bldW+5,fy-3,1,3,'#2a2a32');
      rect(X,x+bldW+9,fy-3,1,3,'#2a2a32');
      // Horizontal railing bar
      rect(X,x+bldW+1,fy-3,9,1,'#2a2a32');
      // Staircase zigzag between floors
      if(floor<9){
        X.beginPath();
        if(floor%2){
          X.moveTo(x+bldW+1,fy+2);
          X.lineTo(x+bldW+9,fy+6);
        }else{
          X.moveTo(x+bldW+9,fy+2);
          X.lineTo(x+bldW+1,fy+6);
        }
        X.stroke();
        // Step lines
        for(let st=0;st<3;st++){
          const stp=.2+st*.3;
          const sx_=floor%2?x+bldW+1+stp*8:x+bldW+9-stp*8;
          const sy_=fy+2+stp*4;
          px(X,sx_,sy_,'#2a2a32');
        }
      }
      // Rust patches
      if(floor%3===1)px(X,x+bldW+3,fy,P.rust);
    }
    X.lineWidth=1;
    // Broken section of fire escape — missing floor 6
    rect(X,x+bldW,y+6+5*7,10,2,'#0a0604');
    // Dangling wire from broken section
    rect(X,x+bldW+4,y+6+5*7+2,1,5,P.rust);

    // ── ROOF ANTENNAS — multiple, leaning ──
    rect(X,x+40,y-12,1,12,P.dgrey);
    rect(X,x+34,y-8,12,1,P.dgrey);
    rect(X,x+36,y-5,9,1,P.dgrey);
    rect(X,x+38,y-2,5,1,P.dgrey);
    // Bent TV element
    rect(X,x+41,y-12,3,1,P.dgrey);
    // Second smaller antenna
    rect(X,x+70,y-8,1,8,P.dgrey);
    rect(X,x+66,y-6,8,1,P.dgrey);
    rect(X,x+67,y-4,6,1,P.dgrey);
    // Satellite dish
    rect(X,x+80,y-6,6,1,'#8a8488');
    rect(X,x+80,y-5,6,1,P.lgrey);
    rect(X,x+82,y-4,2,3,P.dgrey);
    rect(X,x+83,y-4,1,5,P.dgrey);
    // Wire dangling from satellite
    X.strokeStyle=P.dgrey;X.lineWidth=1;
    X.beginPath();
    X.moveTo(x+83,y+1);
    X.quadraticCurveTo(x+78,y+8,x+85,y+12);
    X.stroke();
    // Wires crisscrossing rooftop
    rect(X,x+10,y-4,30,1,'#0a0a0e');
    rect(X,x+45,y-5,20,1,'#0a0a0e');

    // ── BALCONIES on multiple floors ──
    // Floor 4 balcony
    rect(X,x+48,y+28,18,1,P.dgrey);
    rect(X,x+48,y+29,1,4,P.dgrey);
    rect(X,x+65,y+29,1,4,P.dgrey);
    rect(X,x+50,y+28,1,2,P.dgrey);
    rect(X,x+54,y+28,1,2,P.dgrey);
    rect(X,x+58,y+28,1,2,P.dgrey);
    rect(X,x+62,y+28,1,2,P.dgrey);
    // Laundry line with tattered clothes
    const lsw=Math.sin(t*.015)*1;
    rect(X,x+52+lsw,y+30,3,3,'#6b0f1a');
    rect(X,x+57+lsw*.5,y+30,2,2,'#252b22');
    rect(X,x+61+lsw*.3,y+30,2,3,'#b8860b');
    // Plant pot on balcony
    rect(X,x+49,y+28,2,2,P.rust);
    rect(X,x+49,y+27,2,1,P.dtoxic);

    // Floor 6 balcony — partially collapsed
    rect(X,x+20,y+16,16,1,P.dgrey);
    rect(X,x+20,y+17,1,4,P.dgrey);
    // Railing broken
    rect(X,x+22,y+16,1,2,P.dgrey);
    rect(X,x+26,y+16,1,2,P.dgrey);
    // Broken-off section
    rect(X,x+36,y+17,1,2,P.dgrey);
    // Falling debris from broken balcony
    rect(X,x+40,y+20,2,1,P.dgrey);
    rect(X,x+42,y+24,1,1,P.dgrey);

    // Floor 8 balcony — tarped
    rect(X,x+70,y+4,14,1,P.dgrey);
    rect(X,x+70,y+5,1,4,P.dgrey);
    rect(X,x+83,y+5,1,4,P.dgrey);
    // Blue tarp sagging
    rect(X,x+71,y+5,12,3,'#252b22');
    rect(X,x+71,y+5,12,1,'#252b22');
    // Tarp fold
    rect(X,x+75,y+7,4,1,'#0a0a22');
    // Tied rope
    px(X,x+71,y+4,P.bone);
    px(X,x+83,y+4,P.bone);

    // Floor 10 balcony — bird cage with pigeon
    rect(X,x+85,y+10,10,1,P.dgrey);
    rect(X,x+85,y+11,1,3,P.dgrey);
    // Cage
    rect(X,x+88,y+8,4,5,'#3a3a3a');
    rect(X,x+89,y+9,2,3,'#1a1a1a');
    // Pigeon
    if(t%300<150){
      px(X,x+89,y+10,P.lgrey);
      px(X,x+90,y+10,P.lgrey);
      px(X,x+90,y+9,P.ash);
    }

    // ── VINES climbing up left wall ──
    for(let i=0;i<14;i++){
      const vx=x-1+Math.sin(i*.4)*2;
      const vy=y+bldH-i*6;
      rect(X,vx,vy,2,3,P.dtoxic);
      if(i%2)px(X,vx+1,vy-1,P.toxic);
      if(i%3===0)px(X,vx+2,vy,P.btoxic);
      // Tendrils reaching into windows
      if(i%4===2){
        X.strokeStyle=P.dtoxic;X.lineWidth=1;
        X.beginPath();
        X.moveTo(vx+2,vy);
        X.quadraticCurveTo(vx+6,vy-2,vx+8,vy+1);
        X.stroke();
      }
    }

    // ── GRAFFITI on ground floor wall — multiple tags ──
    // Tag 1 — "мох помнит" in red
    X.fillStyle='#6b0f1a';
    for(let gi=0;gi<3;gi++){
      const gy=y+bldH-8+gi*2;
      rect(X,x+60+gi*4,gy,3,1);
      rect(X,x+65+gi*3,gy,2,1);
      rect(X,x+69+gi*2,gy,4,1);
    }
    // Tag 2 — "42" in gold
    X.fillStyle=P.gold;
    rect(X,x+80,y+bldH-12,5,1);
    rect(X,x+84,y+bldH-11,1,3);
    rect(X,x+80,y+bldH-9,5,1);
    rect(X,x+80,y+bldH-11,1,1);
    rect(X,x+88,y+bldH-12,5,4);
    rect(X,x+89,y+bldH-11,3,2);
    // Tag 3 — crude heart
    X.fillStyle='#6b0f1a';
    rect(X,x+96,y+bldH-6,3,2);
    rect(X,x+100,y+bldH-6,3,2);
    rect(X,x+97,y+bldH-4,5,1);
    px(X,x+99,y+bldH-3,'#6b0f1a');

    // ── BROKEN LAMPPOST in front ──
    rect(X,x+92,y+48,1,38,P.dgrey);
    rect(X,x+92,y+44,5,1,P.dgrey);
    rect(X,x+96,y+42,2,4,P.dgrey);
    // Broken glass
    px(X,x+97,y+44,P.lgrey);
    px(X,x+96,y+45,P.lgrey);
    // Flickering bulb (still works occasionally)
    if(Math.sin(t*.2)>.85){
      px(X,x+96,y+43,P.amber);
      X.globalAlpha=.3;
      X.fillStyle=P.amber;
      X.beginPath();X.arc(x+96,y+44,5,0,Math.PI*2);X.fill();
      X.globalAlpha=1;
    }
    // Concrete base
    rect(X,x+90,y+bldH,5,3,P.dstone);

    // ── TRASH DUMPSTER overflowing ──
    rect(X,x-10,y+bldH-8,14,8,P.rust);
    rect(X,x-10,y+bldH-8,14,1,'#2a0a04');
    rect(X,x-10,y+bldH-1,14,1,'#1a0604');
    rect(X,x-4,y+bldH-10,2,2,P.dgrey); // lid handle
    // Overflowing trash
    rect(X,x-9,y+bldH-10,3,2,'#3a2814');
    rect(X,x-5,y+bldH-10,3,2,'#2a1808');
    rect(X,x-1,y+bldH-11,4,3,'#4a3a2a');
    // Fly swarm
    for(let i=0;i<4;i++){
      const fy_=y+bldH-13+Math.sin(t*.1+i)*2;
      const fx_=x-6+i*3+Math.cos(t*.08+i)*1;
      px(X,fx_,fy_,'#0a0a0a');
    }

    // ── OCCASIONAL CROW on antenna ──
    if(t%200<20){
      rect(X,x+40,y-13,2,1,'#0a0a0a');
      px(X,x+42,y-13,'#0a0a0a');
    }
    // Crow on fire escape
    if(t%350<30){
      const fey=y+6+3*7;
      rect(X,x+bldW+4,fey-2,2,1,'#0a0a0a');
      px(X,x+bldW+6,fey-2,'#0a0a0a');
    }

    // ── ПАДИКА ENTRANCE — covered in detail ──
    rect(X,x+50,y+bldH-14,14,14,'#0a0604');
    rect(X,x+51,y+bldH-13,12,12,'#050202');
    // Door frame
    rect(X,x+50,y+bldH-14,14,1,P.dstone);
    rect(X,x+50,y+bldH-1,14,1,'#1a1a22');
    // Domofon (intercom) with wires
    rect(X,x+64,y+bldH-10,3,5,'#2a2a2a');
    px(X,x+65,y+bldH-9,P.crimson);
    px(X,x+65,y+bldH-7,'#8A8D8F');
    // Dangling wire
    rect(X,x+65,y+bldH-4,1,3,'#1a1a22');
    // Glow from within (TV flicker blue)
    if(t%40<20){
      X.globalAlpha=.3;
      X.fillStyle='#8A8D8F';
      rect(X,x+53,y+bldH-12,8,4);
      X.globalAlpha=1;
    }
    // Step up
    rect(X,x+48,y+bldH-2,18,2,P.dstone);

    // ── "ДОМ 7" sign above entrance ──
    rect(X,x+48,y+bldH-18,18,3,P.dstone);
    rect(X,x+48,y+bldH-18,18,1,'#3a3a42');
    X.globalAlpha=.6;X.fillStyle=P.bone;X.font='4px "Press Start 2P"';
    X.fillText('ДОМ 7',x+51,y+bldH-15);
    X.globalAlpha=1;
    // Stain obscuring 7
    rect(X,x+59,y+bldH-17,4,2,'#3a0a04');
}

export function draw_pipeline(x, y) {
    // ═══ PIPELINE — truba schitaet ═══
    // Main pipe body (huge, horizontal)
    rect(X,x,y,80,14,P.dgrey);
    rect(X,x,y+1,80,12,P.dstone);
    rect(X,x,y+13,80,2,'#1a1a1a'); // bottom shadow
    // Highlight on top
    rect(X,x,y+1,80,1,P.ash);
    rect(X,x,y+2,80,1,P.lgrey);
    // Rust patches
    dither(X,x+4,y+3,72,8,P.rust,P.dstone,.4);
    // Bolts along pipe
    for(let i=0;i<8;i++){
      px(X,x+6+i*10,y+4,P.ash);
      px(X,x+6+i*10,y+10,P.ash);
    }

    // Flange connections (every 40px)
    rect(X,x+18,y-2,4,18,P.dgrey);
    rect(X,x+19,y-1,2,16,P.lgrey);
    rect(X,x+58,y-2,4,18,P.dgrey);
    rect(X,x+59,y-1,2,16,P.lgrey);

    // ── LEAK #1 — main crack, steady drip ──
    rect(X,x+32,y+6,6,2,'#050505');
    px(X,x+31,y+7,'#050505');
    px(X,x+38,y+7,'#050505');
    // Drip
    const dp1=(t*.02)%1;
    if(dp1<.7){
      const dropY=y+8+dp1*26;
      X.globalAlpha=.7;
      rect(X,x+34,dropY,2,3,P.toxic);
      if(dp1>.4)px(X,x+34,dropY+3,P.btoxic);
      X.globalAlpha=1;
    }
    // Puddle below leak 1
    X.globalAlpha=.35;
    X.beginPath();X.ellipse(x+35,y+34,7,2,0,0,Math.PI*2);X.fillStyle=P.toxic;X.fill();
    X.globalAlpha=1;

    // ── LEAK #2 — small stream, faster ──
    rect(X,x+14,y+8,2,1,'#050505');
    const dp2=(t*.04)%1;
    if(dp2<.8){
      const dropY=y+9+dp2*22;
      X.globalAlpha=.6;
      px(X,x+14,dropY,P.toxic);
      X.globalAlpha=1;
    }
    // Small puddle
    X.globalAlpha=.25;
    X.beginPath();X.ellipse(x+14,y+32,3,1,0,0,Math.PI*2);X.fillStyle=P.dtoxic;X.fill();
    X.globalAlpha=1;

    // ── LEAK #3 — big one on right, slow dribble ──
    rect(X,x+60,y+5,4,3,'#0a0a0a');
    rect(X,x+61,y+6,2,1,P.dtoxic);
    const dp3=(t*.012)%1;
    if(dp3<.6){
      X.globalAlpha=.6;
      rect(X,x+62,y+8+dp3*25,2,4,P.toxic);
      X.globalAlpha=1;
    }
    // Big puddle
    X.globalAlpha=.4;
    X.beginPath();X.ellipse(x+62,y+36,9,3,0,0,Math.PI*2);X.fillStyle=P.toxic;X.fill();
    X.globalAlpha=1;

    // ── TALLY MARKS — the pipe counts something ──
    X.fillStyle='#1a0e06';
    // Row of small vertical marks (scratched)
    for(let i=0;i<9;i++){
      rect(X,x+42+i*1.5,y+3,1,2);
    }
    // Cross-out on 5th
    rect(X,x+42,y+3,13,1);
    // Another row below
    for(let i=0;i<7;i++){
      rect(X,x+42+i*1.5,y+11,1,2);
    }

    // ── STENCIL "∅ 600" (pipe diameter) ──
    X.fillStyle='#1a0e06';
    rect(X,x+4,y+3,3,3); // ∅ circle
    rect(X,x+5,y+3,1,1,P.dstone);
    rect(X,x+3,y+3,1,1); // cross
    rect(X,x+6,y+5,1,1);
    // "600" dots
    rect(X,x+8,y+4,1,2);rect(X,x+10,y+4,1,2);rect(X,x+12,y+4,1,2);

    // Moss on wet areas
    for(let i=0;i<4;i++){
      rect(X,x+30+i*12,y+12,3,1,P.dtoxic);
      if(hash(i,0,11)>.5)px(X,x+31+i*12,y+11,P.toxic);
    }

    // Drain grate on the ground (where the leaks drain to)
    rect(X,x+44,y+38,6,2,'#0a0a0a');
    for(let i=0;i<4;i++)rect(X,x+45+i*1.5,y+38,1,2,'#1a1a1a');

    // ════════════════════════════════════════════════════════
    // ── NORD STREAM SABOTAGE OVERLAY ──
    // ════════════════════════════════════════════════════════
    // "NORD STREAM — NS1 — 2011" stencil label on intact section
    X.fillStyle='#1a1a22';
    X.font='4px "Press Start 2P"';
    X.globalAlpha=.7;
    X.fillText('NORD STREAM',x+20,y+7);
    X.globalAlpha=.5;
    X.fillText('NS1 2011',x+24,y+11);
    X.globalAlpha=1;
    // Gazprom label torn off (only scraps)
    rect(X,x+50,y+3,4,2,'#b0a284');   // обрывок этикетки — бумагой (синего в каноне нет)
    rect(X,x+54,y+3,2,1,'#3a3328'); // torn edge
    px(X,x+56,y+4,'#b0a284');

    // ── EXPLOSION BREACH — gaping hole on right side (replaces leak #3 visual) ──
    // Jagged outward-curled hole
    X.fillStyle='#020102';
    X.beginPath();
    X.moveTo(x+58,y+3);
    X.lineTo(x+62,y+1);
    X.lineTo(x+66,y+2);
    X.lineTo(x+68,y+6);
    X.lineTo(x+67,y+10);
    X.lineTo(x+64,y+12);
    X.lineTo(x+60,y+11);
    X.lineTo(x+57,y+8);
    X.closePath();X.fill();
    // Metal shards peeling outward — curled edges
    X.fillStyle=P.lgrey;
    rect(X,x+57,y+2,2,1);
    rect(X,x+67,y+3,2,1);
    rect(X,x+68,y+9,1,2);
    rect(X,x+58,y+11,2,1);
    // Darker inside edge (heat-melted)
    X.strokeStyle='#3a1a0a';X.lineWidth=1;
    X.beginPath();
    X.moveTo(x+58,y+3);
    X.lineTo(x+62,y+1);
    X.lineTo(x+66,y+2);
    X.stroke();
    // Blackened char marks radiating
    X.globalAlpha=.5;
    X.fillStyle='#0a0604';
    for(let i=0;i<8;i++){
      const ang=i/8*Math.PI*2;
      rect(X,x+62+Math.cos(ang)*7,y+6+Math.sin(ang)*5,1,1);
    }
    X.globalAlpha=1;

    // ── BUBBLES rising from breach (like the real Baltic sea footage) ──
    for(let i=0;i<5;i++){
      const bubT=((t*.03+i*.4)%1);
      const bbx=x+62+Math.sin(bubT*3)*2;
      const bby=y-bubT*20;
      X.globalAlpha=.4*(1-bubT);
      X.beginPath();X.arc(bbx,bby,1+bubT*.5,0,Math.PI*2);
      X.fillStyle=P.toxic;X.fill();
      X.globalAlpha=1;
    }

    // ── CHALK COORDINATES on concrete below pipe ──
    X.fillStyle=P.bone;X.font='4px "Press Start 2P"';
    X.globalAlpha=.6;
    X.fillText('26.09.2022',x+12,y+42);
    X.fillText('02:03 UTC',x+13,y+46);
    X.fillText('54.88N',x+14,y+50);
    X.fillText('15.41E',x+14,y+54);
    X.globalAlpha=1;

    // ── LIST OF "WHO DID IT?" SUSPECTS crossed out ──
    X.fillStyle='#1a0806';X.font='4px "Press Start 2P"';
    const suspects=['USA?','RU?','UKR?','DE?','???'];
    suspects.forEach((s,si)=>{
      X.globalAlpha=.6;
      X.fillText(s,x+50,y+42+si*4);
      // Cross out all except last
      if(si<4){
        X.strokeStyle='#6b0f1a';X.lineWidth=1;
        X.beginPath();
        X.moveTo(x+49,y+40+si*4);
        X.lineTo(x+68,y+42+si*4);
        X.stroke();
      }
      X.globalAlpha=1;
    });

    // ── NEWSPAPER SCRAP pinned to pipe — "DIE ZEIT" ──
    rect(X,x+2,y+16,10,4,P.bone);
    rect(X,x+2,y+16,10,1,'#8a7458');
    X.fillStyle='#050205';X.font='3px "Press Start 2P"';
    X.globalAlpha=.8;
    X.fillText('DIE ZEIT',x+3,y+19);
    X.globalAlpha=1;

    // ── RUSTED SHUT VALVE (gas can't flow anyway) ──
    X.fillStyle=P.rust;
    rect(X,x+78,y+2,6,10,P.rust);
    rect(X,x+80,y,2,14,P.rust);
    rect(X,x+78,y+5,6,1,'#4a1808');
    // Red hand wheel
    X.strokeStyle='#6b0f1a';X.lineWidth=1;
    X.beginPath();X.arc(x+81,y+7,3,0,Math.PI*2);X.stroke();
    rect(X,x+80,y+7,3,1,'#6b0f1a');
    rect(X,x+81,y+5,1,5,'#6b0f1a');

    // ── FOOTPRINTS fading toward the sea (to the north edge) ──
    X.globalAlpha=.2;X.fillStyle='#050202';
    for(let i=0;i<6;i++){
      rect(X,x+66+i*3,y+22+i,2,1);
      rect(X,x+67+i*3,y+23+i,2,1);
    }
    X.globalAlpha=1;
}

export function draw_watchtower(x, y) {
    // ═══ WATCHTOWER — THE ARCHIVIST'S POST ═══
    // Shadow on ground
    X.globalAlpha=.35;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+15,y+62,22,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── FOUR TOWER LEGS (perspective) ──
    // Front legs
    rect(X,x+1,y+15,3,47,P.wood);
    rect(X,x+2,y+16,1,45,P.lwood);
    rect(X,x+26,y+15,3,47,P.wood);
    rect(X,x+27,y+16,1,45,P.lwood);
    // Back legs (thinner, darker for depth)
    rect(X,x+5,y+18,2,44,P.dwood);
    rect(X,x+23,y+18,2,44,P.dwood);

    // ── CROSS BRACES — X pattern ──
    X.strokeStyle=P.dwood;X.lineWidth=1;
    // X-brace 1 (upper)
    X.beginPath();X.moveTo(x+4,y+24);X.lineTo(x+26,y+36);X.stroke();
    X.beginPath();X.moveTo(x+26,y+24);X.lineTo(x+4,y+36);X.stroke();
    // X-brace 2 (lower)
    X.beginPath();X.moveTo(x+4,y+40);X.lineTo(x+26,y+52);X.stroke();
    X.beginPath();X.moveTo(x+26,y+40);X.lineTo(x+4,y+52);X.stroke();
    // Horizontal ties
    rect(X,x+4,y+24,22,1,P.wood);
    rect(X,x+4,y+36,22,1,P.wood);
    rect(X,x+4,y+48,22,1,P.wood);
    rect(X,x+4,y+60,22,1,P.wood);

    // ── PLATFORM — wooden planks with details ──
    rect(X,x-3,y+9,36,6,P.dwood);
    rect(X,x-2,y+10,34,4,P.wood);
    // Plank seams
    for(let i=0;i<6;i++){rect(X,x-2+i*6,y+10,1,4,'#1a0e06');}
    // Platform front edge shadow
    rect(X,x-3,y+14,36,1,'#0a0604');

    // ── RAILING (4 posts + horizontal bar) ──
    rect(X,x-3,y+2,2,8,P.wood);
    rect(X,x+9,y+2,1,8,P.dwood);
    rect(X,x+20,y+2,1,8,P.dwood);
    rect(X,x+31,y+2,2,8,P.wood);
    rect(X,x-3,y+2,36,2,P.wood);
    // Railing middle bar
    rect(X,x-3,y+6,36,1,P.dwood);

    // ── ROOF — tin, rusted, sloped ──
    rect(X,x-4,y-8,38,3,P.rust);
    rect(X,x-3,y-7,36,1,P.drust);
    // Roof rust streaks
    for(let i=0;i<5;i++){
      px(X,x+hash(i,0,11)*34,y-5,P.drust);
    }
    // Support beams from roof to platform corners
    X.strokeStyle=P.dwood;X.lineWidth=1;
    X.beginPath();X.moveTo(x-3,y-5);X.lineTo(x-3,y+2);X.stroke();
    X.beginPath();X.moveTo(x+33,y-5);X.lineTo(x+33,y+2);X.stroke();

    // ── HANGING LANTERN from roof ──
    const lantSway=Math.sin(t*.01)*.5;
    rect(X,x+4+lantSway,y-4,1,3,P.dgrey);
    rect(X,x+3+lantSway,y-1,3,3,P.dgrey);
    rect(X,x+4+lantSway,y,1,1,P.f2);
    // Lantern glow
    X.globalAlpha=.15+.05*Math.sin(t*.02);
    const lanGlow=X.createRadialGradient(x+4+lantSway,y+1,0,x+4+lantSway,y+1,20);
    lanGlow.addColorStop(0,'rgba(218,165,32,1)');
    lanGlow.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=lanGlow;X.fillRect(x-16,y-19,40,40);
    X.globalAlpha=1;

    // ── ARCHIVIST SILHOUETTE on platform ──
    // Hooded figure sitting, back to viewer
    const brth=Math.sin(t*.008)*.3;
    // Body
    rect(X,x+14,y+3-brth,6,6,'#0a0604');
    // Hood
    rect(X,x+13,y+1,8,3,'#0a0604');
    rect(X,x+14,y,6,2,'#050404');
    // Shoulders
    rect(X,x+12,y+4,2,3,'#0a0604');
    rect(X,x+20,y+4,2,3,'#0a0604');

    // ── BINOCULARS in Archivist's hands (pointing INWARD at settlement) ──
    rect(X,x+15,y+5,2,2,P.dgrey);
    rect(X,x+18,y+5,2,2,P.dgrey);
    rect(X,x+14,y+5,1,1,'#1a1a20'); // left eyepiece
    rect(X,x+20,y+5,1,1,'#1a1a20'); // right eyepiece
    // Strap
    X.strokeStyle='#1a1410';X.lineWidth=1;
    X.beginPath();X.moveTo(x+14,y+6);X.lineTo(x+13,y+8);X.stroke();
    X.beginPath();X.moveTo(x+21,y+6);X.lineTo(x+22,y+8);X.stroke();
    // Animated lens glint
    if(t%90<6){
      X.globalAlpha=.6;px(X,x+14,y+5,'#D9CFB8');px(X,x+20,y+5,'#D9CFB8');X.globalAlpha=1;
    }

    // ── OPEN JOURNAL on platform beside archivist ──
    rect(X,x+22,y+8,6,3,P.dbone);
    rect(X,x+22,y+8,3,3,'#e8d8b0');
    rect(X,x+25,y+8,3,3,'#d8c8a8');
    rect(X,x+24,y+8,1,3,'#3a2618'); // spine
    // Written lines on page
    rect(X,x+22,y+9,2,1,'#1a1410');
    rect(X,x+26,y+9,2,1,'#1a1410');
    rect(X,x+22,y+10,2,1,'#1a1410');

    // ── PENCIL beside journal ──
    rect(X,x+28,y+7,2,1,P.wood);
    px(X,x+30,y+7,P.bone);

    // ── THERMOS & CUP ──
    rect(X,x+6,y+7,2,3,P.dgrey);
    rect(X,x+6,y+7,2,1,'#1a1a20');
    rect(X,x+9,y+8,2,2,P.stone);
    // Steam from cup
    if(t%30<20){
      X.globalAlpha=.3;
      rect(X,x+9+Math.sin(t*.05)*1,y+6,1,2,P.ash);
      X.globalAlpha=1;
    }

    // ── LADDER on right side ──
    rect(X,x+13,y+15,1,45,P.wood);
    rect(X,x+17,y+15,1,45,P.wood);
    for(let i=0;i<6;i++){
      rect(X,x+13,y+18+i*7,5,1,P.wood);
    }

    // ── HANGING ROPE with knot (escape line?) ──
    X.strokeStyle='#2a1a10';X.lineWidth=1;
    X.beginPath();X.moveTo(x+33,y+9);X.lineTo(x+35,y+25);X.lineTo(x+34,y+35);X.stroke();
    // Knot
    rect(X,x+34,y+25,2,2,P.dwood);

    // ── TALLY MARKS on railing (days counted) ──
    X.fillStyle='#1a1410';
    for(let i=0;i<8;i++){
      rect(X,x-2+i*4,y+4,1,2);
    }
    // Cross-out on 5th
    rect(X,x-3+16,y+4,5,1,'#1a1410');

    // ═════════════════════════════════════════════
    // ── PRISM / SURVEILLANCE KIT on platform ──
    // ═════════════════════════════════════════════
    // Smartphone face-down beside the journal, camera taped
    rect(X,x+4,y+11,4,6,'#0a0a12');
    rect(X,x+4,y+11,4,1,'#1a1a22');
    // Camera lens cluster taped over with black tape
    rect(X,x+5,y+12,2,2,'#050508');
    // Black tape strip across camera
    rect(X,x+4,y+12,4,1,'#1a1a1a');
    // Microphone hole — also taped
    px(X,x+6,y+16,'#1a1a1a');
    // Faint blinking indicator (phone still recording?)
    if(t%50<5)px(X,x+7,y+11,'#6b0f1a');

    // ── STICKER LOGOS on side of tower (PRISM/XKEYSCORE/etc) ──
    // PRISM prism triangle logo
    X.fillStyle='#8A8D8F';
    X.beginPath();
    X.moveTo(x-2,y+20);
    X.lineTo(x+1,y+17);
    X.lineTo(x+1,y+23);
    X.closePath();X.fill();
    // Rainbow refraction line
    X.strokeStyle='#D9CFB8';X.lineWidth=1;
    X.beginPath();X.moveTo(x+1,y+20);X.lineTo(x+4,y+19);X.stroke();
    X.strokeStyle='#a8ffcf';
    X.beginPath();X.moveTo(x+1,y+20);X.lineTo(x+4,y+20);X.stroke();
    X.strokeStyle='#C23B2B';
    X.beginPath();X.moveTo(x+1,y+20);X.lineTo(x+4,y+21);X.stroke();
    X.lineWidth=1;

    // NSA seal (tiny circle with eagle)
    rect(X,x-3,y+27,4,4,'#1b1e18');
    px(X,x-2,y+28,P.gold);
    px(X,x-1,y+28,P.gold);
    px(X,x-2,y+29,P.gold);
    // Cross it out
    X.strokeStyle='#6b0f1a';X.lineWidth=1;
    X.beginPath();X.moveTo(x-3,y+27);X.lineTo(x+1,y+31);X.stroke();
    X.beginPath();X.moveTo(x+1,y+27);X.lineTo(x-3,y+31);X.stroke();

    // СОРМ label
    X.fillStyle=P.bone;X.font='3px "Press Start 2P"';
    X.globalAlpha=.5;
    X.fillText('PRISM',x-3,y+35);
    X.fillText('XKS',x-3,y+39);
    X.fillText('SORM',x-3,y+43);
    X.fillText('PEGASUS',x-3,y+47);
    X.globalAlpha=1;
    // Double-underlined unnamed entry
    X.fillStyle='#6b0f1a';
    rect(X,x-3,y+51,7,1);
    rect(X,x-3,y+53,7,1);

    // ── DATED NEWSPAPER CLIPPING pinned to railing ──
    // "The Guardian" clipping — 06.06.2013
    rect(X,x+22,y+4,8,5,P.bone);
    rect(X,x+22,y+4,8,1,'#3a2618');
    X.fillStyle='#050205';X.font='3px "Press Start 2P"';
    X.globalAlpha=.8;
    X.fillText('06.06.13',x+23,y+7);
    X.globalAlpha=.5;
    rect(X,x+23,y+8,6,1,'#1a0806');
    X.globalAlpha=1;

    // Tiny "SNOWDEN 29" passport photo pinned next to it
    rect(X,x+22,y+10,4,5,'#1a1a22');
    rect(X,x+23,y+11,2,2,'#8a7458'); // glasses-face
    px(X,x+23,y+12,'#050205'); // eye
    px(X,x+24,y+12,'#050205'); // eye

    // Red thread connecting phone → prism → journal → newspaper
    X.strokeStyle='#6b0f1a';X.lineWidth=1;
    X.globalAlpha=.6;
    X.beginPath();
    X.moveTo(x+6,y+14);      // phone
    X.lineTo(x+1,y+20);      // prism
    X.lineTo(x+22,y+10);     // snowden photo
    X.lineTo(x+22,y+7);      // newspaper
    X.lineTo(x+25,y+9);      // journal
    X.stroke();
    X.globalAlpha=1;

    // Warm steam from thermos (EXISTING) — augmented with a second cup fresh
    rect(X,x+11,y+8,2,2,P.stone);
    // Someone JUST left — fresh footprints on the ground near ladder base
    X.globalAlpha=.3;X.fillStyle='#0a0604';
    for(let i=0;i<4;i++){
      rect(X,x+18+i*3,y+62,2,1);
      rect(X,x+19+i*3,y+63,2,1);
    }
    X.globalAlpha=1;
}

export function draw_pit(x, y) {
    // Dark hole in ground
    X.fillStyle='#020202';
    X.beginPath();X.ellipse(x+20,y+15,22,12,0,0,Math.PI*2);X.fill();
    // Crumbling edge
    for(let i=0;i<16;i++){
      const angle=i/16*Math.PI*2;
      const r_=18+hash(i,0,11)*8;
      const ex_=x+20+Math.cos(angle)*r_;
      const ey_=y+15+Math.sin(angle)*r_*.5;
      rect(X,ex_,ey_,3,2,hash(i,0,22)>.5?P.dstone:P.dgrey);
    }
    // Green glow from below
    const pulse=.04+.03*Math.sin(t*.004);
    X.globalAlpha=pulse;
    X.beginPath();X.ellipse(x+20,y+15,15,8,0,0,Math.PI*2);
    X.fillStyle='#1a3a0a';X.fill();
    X.globalAlpha=1;
    // Faint steam
    if(t%40<20){
      const steamY=y+10-((t%40)*.3);
      X.globalAlpha=.06;
      rect(X,x+16+Math.sin(t*.01)*3,steamY,4,2,'#2a4a1a');
      X.globalAlpha=1;
    }
}

export function draw_altar(x, y) {
    // ── CLEARING CIRCLE (darker earth around) ──
    X.globalAlpha=.3;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+27,y+40,30,5,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // Circle of scorched/dark earth
    for(let a=0;a<32;a++){
      const ang=a/32*Math.PI*2;
      const r1=28+hash(a,0,11)*3;
      const px_=x+27+Math.cos(ang)*r1;
      const py_=y+22+Math.sin(ang)*r1*.6;
      rect(X,px_,py_,2,1,hash(a,0,22)>.5?'#1a120a':'#0e0a04');
    }

    // ── MYCELIUM THREADS radiating outward ──
    X.strokeStyle=P.dtoxic;X.lineWidth=1;
    for(let i=0;i<12;i++){
      const ang=i/12*Math.PI*2;
      X.globalAlpha=.35+.15*Math.sin(t*.004+i);
      X.beginPath();
      X.moveTo(x+27,y+22);
      // Wavy thread
      let tx=x+27,ty=y+22;
      for(let j=0;j<8;j++){
        const jr=j*4;
        const jitter=Math.sin(j+i*.5)*2;
        tx=x+27+Math.cos(ang)*jr+jitter;
        ty=y+22+Math.sin(ang)*jr*.6+jitter*.3;
        X.lineTo(tx,ty);
      }
      X.stroke();
    }
    X.globalAlpha=1;

    // ── FLAT STONE SLAB (main altar) ──
    // Stone base (elliptical, thick)
    X.fillStyle='#3a3028';
    X.beginPath();X.ellipse(x+27,y+22,16,6,0,0,Math.PI*2);X.fill();
    X.fillStyle='#2a1e14';
    X.beginPath();X.ellipse(x+27,y+22,14,5,0,0,Math.PI*2);X.fill();
    // Shadow side
    X.fillStyle='#1a120a';
    X.beginPath();X.ellipse(x+27,y+24,14,3,0,0,Math.PI*2);X.fill();

    // ── MOSS COVERING THE STONE (thick layer) ──
    // Base moss layer
    X.fillStyle=P.dtoxic;
    X.beginPath();X.ellipse(x+27,y+21,13,4,0,0,Math.PI*2);X.fill();
    // Brighter moss on top
    X.fillStyle=P.toxic;
    X.beginPath();X.ellipse(x+27,y+20,11,3,0,0,Math.PI*2);X.fill();
    // Bright spots
    for(let i=0;i<15;i++){
      const mx=x+17+hash(i,0,11)*20;
      const my=y+18+hash(i,0,22)*5;
      const pulse=.7+.3*Math.sin(t*.008+i*.5);
      X.globalAlpha=pulse;
      px(X,mx,my,P.btoxic);
      if(hash(i,0,33)>.6)px(X,mx,my-1,'#5d675a');
      X.globalAlpha=1;
    }

    // ── GROWN SYMBOL ON TOP — slowly shifting ──
    // Spiral pattern
    X.fillStyle='#2a4a1a';
    const symOffset=Math.floor(t*.002)%4;
    for(let i=0;i<12;i++){
      const sa=i*.5+symOffset*.1;
      const sr=i*.4;
      const sx_=x+27+Math.cos(sa)*sr;
      const sy_=y+20+Math.sin(sa)*sr*.5;
      px(X,sx_,sy_,'#2a4a1a');
    }
    // Ritual dots
    X.globalAlpha=.7+.2*Math.sin(t*.006);
    px(X,x+22,y+19,P.sunflower);
    px(X,x+32,y+19,P.sunflower);
    px(X,x+27,y+17,P.gold);
    X.globalAlpha=1;

    // ── MUSHROOMS growing around the slab ──
    for(let i=0;i<6;i++){
      const mx=x+10+i*7+hash(i,0,11)*2;
      const my=y+28+hash(i,0,22)*4;
      // Stem
      rect(X,mx,my,1,3,P.bone);
      // Cap
      rect(X,mx-1,my-1,3,1,hash(i,0,33)>.5?'#6b0f1a':'#8a5a2a');
      px(X,mx,my-2,hash(i,0,33)>.5?'#8b0000':'#aa7a3a');
      // Dots on cap
      if(hash(i,0,44)>.5)px(X,mx-1,my-1,P.bone);
    }

    // ── FIREFLY SPORES floating around ──
    for(let i=0;i<8;i++){
      const spPh=((t*.005+i*.12)%1);
      const spx=x+15+Math.sin(t*.01+i*2)*20;
      const spy=y+15-spPh*15;
      X.globalAlpha=(1-spPh)*.7;
      px(X,spx,spy,P.btoxic);
      if(spPh<.3)px(X,spx+1,spy,'#aaff88');
      X.globalAlpha=1;
    }

    // ── PULSING AURA — the altar is "breathing" ──
    const auraPulse=.08+.04*Math.sin(t*.004);
    X.globalAlpha=auraPulse;
    const aura=X.createRadialGradient(x+27,y+22,5,x+27,y+22,35);
    aura.addColorStop(0,'rgba(90,200,80,.6)');
    aura.addColorStop(.6,'rgba(40,100,30,.2)');
    aura.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=aura;
    X.fillRect(x-8,y-15,70,60);
    X.globalAlpha=1;

    // (летящая надпись убрана: мох помнит и без напоминаний)

    // ── NEARBY STANDING MUSHROOM (tall, torch-like) ──
    rect(X,x+42,y+24,1,8,P.dbone);
    rect(X,x+41,y+22,3,2,'#6b0f1a');
    rect(X,x+42,y+21,1,1,'#8b0000');
    // Glow from the big mushroom
    X.globalAlpha=.1+.04*Math.sin(t*.02);
    const bg=X.createRadialGradient(x+42,y+23,0,x+42,y+23,12);
    bg.addColorStop(0,'rgba(139,0,0,.7)');
    bg.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=bg;
    X.fillRect(x+30,y+11,24,24);
    X.globalAlpha=1;
}

export function draw_posterwall(x, y) {
    // Concrete wall base
    rect(X,x,y,65,45,P.stone);rect(X,x+1,y+1,63,43,P.dstone);
    // Layered posters — different sizes, colors, overlapping
    const posters=[
      {px:3,py:3,pw:18,ph:22,c:'#3a0a08',tc:P.amber},   // crimson poster
      {px:20,py:2,pw:20,ph:25,c:'#252b22',tc:P.bone},    // indigo poster
      {px:38,py:4,pw:22,ph:20,c:'#0a0a0a',tc:'#8b0000'}, // black poster
      {px:5,py:24,pw:25,ph:18,c:'#2a1a08',tc:P.gold},    // burnt poster
      {px:32,py:22,pw:28,ph:20,c:'#1a0c20',tc:P.celestial}, // purple poster
    ];
    posters.forEach(p=>{
      rect(X,x+p.px,y+p.py,p.pw,p.ph,p.c);
      // Torn edges
      for(let i=0;i<3;i++){
        const tx_=x+p.px+hash(i,p.px,1)*p.pw;
        const ty_=y+p.py+hash(i,p.py,2)*p.ph;
        rect(X,tx_,ty_,2,1,P.dstone);
      }
      // Text lines (abstract)
      rect(X,x+p.px+2,y+p.py+3,p.pw-4,1,p.tc);
      rect(X,x+p.px+2,y+p.py+6,p.pw*.6,1,p.tc);
      // "A" logo on some
      if(hash(p.px,p.py,33)>.4){
        X.globalAlpha=.6;
        rect(X,x+p.px+p.pw/2-2,y+p.py+p.ph-8,5,6,p.tc);
        X.globalAlpha=1;
      }
    });
    // Peeling corner on top poster
    const peel=Math.sin(t*.008)*1.5;
    rect(X,x+58+peel,y+5,3,4,P.dstone);

    // ═══════════════════════════════════════════
    // ── 5 FIRE-MEMORIAL POSTERS with WAX SEALS ──
    // ═══════════════════════════════════════════
    // Each of the 5 stacked posters corresponds to a real concert-hall fire.
    // Char marks at the edges (burn marks)
    X.globalAlpha=.55;X.fillStyle='#0a0604';
    // Burn halo around poster 1
    for(let i=0;i<8;i++){
      const ang=i/8*Math.PI*2;
      rect(X,x+12+Math.cos(ang)*10,y+14+Math.sin(ang)*12,2,1);
    }
    X.globalAlpha=1;
    // Five date labels on poster corners (tiny)
    X.fillStyle=P.bone;X.font='3px "Press Start 2P"';
    X.globalAlpha=.55;
    X.fillText('20.02.03',x+4,y+8);   // The Station
    X.fillText('05.12.09',x+21,y+8);  // Хромая Лошадь
    X.fillText('27.01.13',x+39,y+8);  // Kiss Santa Maria
    X.fillText('30.10.15',x+6,y+30);  // Colectiv
    X.fillText('13.11.15',x+33,y+30); // Bataclan
    X.globalAlpha=1;
    // Wax seals dripped over each poster — red wax
    const sealPos=[
      [12,14],[29,14],[48,14],[17,33],[45,33]
    ];
    sealPos.forEach(([sx_,sy_],si)=>{
      // Drip base
      X.fillStyle='#6b0f1a';
      X.beginPath();X.arc(x+sx_,y+sy_,2,0,Math.PI*2);X.fill();
      // Dripping down
      rect(X,x+sx_,y+sy_,1,3+si*.5,'#6b0f1a');
      // Highlight
      px(X,x+sx_-1,y+sy_-1,'#8b0f1a');
      // Tiny number stamped in wax (1-5)
      X.fillStyle=P.bone;
      px(X,x+sx_,y+sy_,P.bone);
    });

    // ── 5 CANDLES at the base — simplified (single cheap glow) ──
    for(let ci=0;ci<5;ci++){
      const cdx=x+8+ci*12;
      const cdy=y+45;
      // Wax puddle base
      rect(X,cdx-1,cdy+5,5,2,'#e8dcc8');
      rect(X,cdx,cdy+7,3,1,'#c8b098');
      // Candle body
      rect(X,cdx,cdy-3,3,8,P.bone);
      rect(X,cdx,cdy-3,3,1,'#e8dcc8');
      // Wick
      px(X,cdx+1,cdy-4,'#1a0806');
      // Flame — simple
      X.globalAlpha=.9;
      rect(X,cdx+1,cdy-6,1,2,P.f2);
      px(X,cdx+1,cdy-7,'#ffffcc');
      X.globalAlpha=1;
      // Cheap amber glow (plain rect, no gradient)
      X.globalAlpha=.08+.02*Math.sin(t*.1+ci);
      rect(X,cdx-3,cdy-8,9,6,P.amber);
      X.globalAlpha=1;
    }

    // ── "ВЫХОД БЫЛ ЗАПЕРТ" graffiti above the posters ──
    X.fillStyle='#6b0f1a';X.font='4px "Press Start 2P"';
    X.globalAlpha=.7;
    X.fillText('ВЫХОД БЫЛ',x+6,y+41);
    X.fillText('ЗАПЕРТ СНАРУЖИ',x+2,y+44);
    X.globalAlpha=1;

    // ── PYROTECHNIC SCORCH MARKS radiating across the wall ──
    X.globalAlpha=.15;
    X.fillStyle='#1a0604';
    for(let i=0;i<30;i++){
      const sox=hash(i,0,11)*65;
      const soy=hash(i,0,22)*45;
      rect(X,x+sox,y+soy,1+hash(i,0,33)*3,1,'#1a0604');
    }
    X.globalAlpha=1;

    // ── DEAD ROSES at base of wall — 5 stems ──
    for(let i=0;i<5;i++){
      const rosX=x+14+i*10;
      // Stem
      rect(X,rosX,y+49,1,4,'#1a2a0a');
      // Dried bud
      rect(X,rosX-1,y+48,3,2,'#3a0a08');
      // Petals falling
      px(X,rosX+hash(i,0,11)*3-1,y+53,'#3a0a08');
    }
}

export function draw_banner(x, y) {
    // Heavy support poles with base plates
    rect(X,x-4,y-20,6,140,P.dgrey);rect(X,x-3,y-20,4,140,P.ash);
    rect(X,x+274,y-20,6,140,P.dgrey);rect(X,x+275,y-20,4,140,P.ash);
    // Base plates
    rect(X,x-10,y+118,20,4,P.dgrey);rect(X,x+268,y+118,20,4,P.dgrey);
    // Cross-wires top and bottom
    rect(X,x+2,y-16,272,2,P.dgrey);
    rect(X,x+2,y+114,272,2,P.dgrey);
    // Diagonal support wires
    for(let i=0;i<3;i++){
      const wy=y-10+i*45;
      rect(X,x-3,wy,2,1,P.ash);rect(X,x+276,wy,2,1,P.ash);
    }
    
    // Banner fabric — animated wave
    const wave=Math.sin(t*.005)*3;
    const wave2=Math.sin(t*.007+1)*2;
    
    // Fabric background — warm parchment
    rect(X,x+4,y-12+wave*.3,268,118+Math.abs(wave),'#2a1e10');
    rect(X,x+6,y-10+wave*.3,264,114+Math.abs(wave),'#3a2a14');
    // Aged stain patches
    for(let i=0;i<8;i++){
      X.globalAlpha=.08;
      rect(X,x+20+hash(i,0,11)*220,y+hash(i,0,22)*80+wave*.3,
        10+hash(i,0,33)*25,8+hash(i,0,44)*15,
        hash(i,0,55)>.5?'#4a3a20':'#2a1a0a');
    }
    X.globalAlpha=1;
    
    // Double ornamental border — gold
    rect(X,x+8,y-8+wave*.3,260,2,P.gold);
    rect(X,x+8,y+100+wave*.3+Math.abs(wave),260,2,P.gold);
    rect(X,x+8,y-8+wave*.3,2,108+Math.abs(wave),P.gold);
    rect(X,x+266,y-8+wave*.3,2,108+Math.abs(wave),P.gold);
    // Inner border
    rect(X,x+12,y-4+wave*.3,252,1,P.damber);
    rect(X,x+12,y+96+wave*.3+Math.abs(wave),252,1,P.damber);
    rect(X,x+12,y-4+wave*.3,1,100+Math.abs(wave),P.damber);
    rect(X,x+263,y-4+wave*.3,1,100+Math.abs(wave),P.damber);
    
    // Corner stars
    const corners=[[14,-2],[258,-2],[14,92+Math.abs(wave)],[258,92+Math.abs(wave)]];
    corners.forEach(([cx,cy])=>{
      X.fillStyle=P.gold;
      const sx=x+cx,sy=y+cy+wave*.3;
      X.beginPath();X.moveTo(sx,sy-3);X.lineTo(sx+2,sy-1);X.lineTo(sx+4,sy-3);
      X.lineTo(sx+3,sy);X.lineTo(sx+4,sy+3);X.lineTo(sx+2,sy+1);
      X.lineTo(sx,sy+3);X.lineTo(sx+1,sy);X.closePath();X.fill();
    });
    
    // Decorative line under title
    rect(X,x+40,y+22+wave*.3,196,1,P.gold);
    rect(X,x+60,y+24+wave*.3,156,1,P.damber);
    
    // Text: "ARDET" — huge
    X.fillStyle=P.gold;X.font='20px "Press Start 2P"';
    X.textAlign='center';
    X.fillText('A R D E T',x+138,y+16+wave*.3);
    
    // "COMING SOON" — crimson
    X.fillStyle=P.crimson;X.font='11px "Press Start 2P"';
    X.fillText('★  COMING SOON  ★',x+138,y+44+wave*.3);
    
    // Subtitle lines
    X.fillStyle=P.bone;X.font='7px "Press Start 2P"';
    X.globalAlpha=.7;
    X.fillText('дата уточняется',x+138,y+62+wave*.3);
    X.fillText('место уточняется',x+138,y+74+wave*.3);
    X.globalAlpha=.4;
    X.fillText('реальность уточняется',x+138,y+86+wave*.3);
    X.globalAlpha=1;
    X.textAlign='left';
    
    // Bottom fringe — fabric tassels waving
    for(let i=0;i<20;i++){
      const fx=x+14+i*13;
      const fy=y+104+wave*.3+Math.abs(wave)+Math.sin(t*.01+i*.7)*2;
      const fh=4+Math.sin(t*.012+i*.5)*2;
      rect(X,fx,fy,4,fh,'#3a2a14');
      rect(X,fx+1,fy+fh,2,2,'#2a1e10');
    }
    
    // Torn/burned section — right side
    for(let i=0;i<6;i++){
      const tx_=x+258+hash(i,0,11)*10;
      const ty_=y+20+hash(i,0,22)*60+wave*.3;
      rect(X,tx_,ty_,3+hash(i,0,33)*4,2,P.dstone);
    }
    // Scorch mark — left bottom
    X.globalAlpha=.15;
    for(let i=0;i<10;i++){
      rect(X,x+10+hash(i,1,11)*30,y+85+hash(i,1,22)*20+wave*.3,
        3+hash(i,1,33)*6,2,'#1a0a04');
    }
    X.globalAlpha=1;
}

// End of location sprites

// ═══════════════════════════════════════
// PHILOSOPHY PHASE 1 — PACKAGE A: TOWN
// ═══════════════════════════════════════

// Office — bureaucratic building, window №3, solid.
// Окно №3 светится всю ночь — тёплое пятно II (ART_BIBLE §04): свет сплошной,
// за решёткой — пишущий силуэт, перо ходит; раз в сутки, строго по расписанию,
// перерыв: силуэт выпрямился, у губ чашка (world_folk: «Чай третьего окна»).
// Рядом — доска объявлений: листки без слов, один оборван.
