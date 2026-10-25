// ═══════════════════════════════════════
// LOCATION DRAW FUNCTIONS — procedural pixel art
// ═══════════════════════════════════════
import { rect, px, dither, hash } from '../../render/draw.js';
import { X } from '../../render/context.js';
import { t } from '../../core/time.js';
import { phaseAt } from '../../world/sky.js';
import { playerNearLoc } from '../../core/playerRef.js';
import { locations as locs } from '../../world/locations.js';
// места по канону — сверены с осмотром и описью сцены (sprites/locations/canon.js)
export { draw_office, draw_gates, draw_train, draw_theater, draw_terminal, draw_powerline, draw_crater, draw_nocturnal, draw_campfire, draw_pithos, draw_lantern1, draw_church, draw_library, draw_fountain, draw_cross, draw_radio, draw_tent, draw_pizzeria, draw_ruins, draw_watchtower, draw_junkyard, draw_bus, draw_billboard, draw_pipeline, draw_lake, draw_altar, draw_dumpster, draw_banner, draw_overpass, draw_posterwall } from './canon.js';

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

// End of location sprites

// ═══════════════════════════════════════
// PHILOSOPHY PHASE 1 — PACKAGE A: TOWN
// ═══════════════════════════════════════

// Office — bureaucratic building, window №3, solid.
// Окно №3 светится всю ночь — тёплое пятно II (ART_BIBLE §04): свет сплошной,
// за решёткой — пишущий силуэт, перо ходит; раз в сутки, строго по расписанию,
// перерыв: силуэт выпрямился, у губ чашка (world_folk: «Чай третьего окна»).
// Рядом — доска объявлений: листки без слов, один оборван.
