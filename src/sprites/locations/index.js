// ═══════════════════════════════════════
// LOCATION DRAW FUNCTIONS — procedural pixel art
// ═══════════════════════════════════════
import { rect, px, dither, hash } from '../../render/draw.js';
import { X } from '../../render/context.js';
import { t } from '../../core/time.js';

const P = {
  d1: '#0a0a0a', d2: '#6b0f1a', dgrey: '#2a2a2a', dstone: '#3a3a2a',
  ash: '#8a8d8f', bone: '#e8dcc8', dbone: '#c8b8a8',
  crimson: '#6b0f1a', gold: '#b8860b', amber: '#daa520', damber: '#a07818',
  term: '#1a8c1a', termd: '#0a4a0a',
  dwood: '#1a0e06', f1: '#ff6600', f2: '#ff3300',
  toxic: '#3aff1a', g1: '#1a1810', g2: '#141208',
  fg1: '#0e1a08', fg2: '#1a2812', tg1: '#1a2a0e',
};

let npcProximity = 0;


export function draw_campfire(x, y) {
    // ═══ SACRIFICIAL FIRE — with horned beast skeleton ═══
    // Silent cat watching from the edge
    // NPC drawn separately
    // Shadow under fire
    X.globalAlpha=.5;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+18,y+30,24,4,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── RED CRESCENT MOON above the fire ──
    const moonY=y-24;
    // Crescent body
    X.fillStyle='#4a0a0a';
    X.beginPath();
    X.arc(x+17,moonY,9,Math.PI*.15,Math.PI*1.85,false);
    X.arc(x+20,moonY,7,Math.PI*1.85,Math.PI*.15,true);
    X.closePath();X.fill();
    // Brighter red face
    X.fillStyle='#8b0000';
    X.beginPath();
    X.arc(x+16,moonY-1,8,Math.PI*.2,Math.PI*1.8,false);
    X.arc(x+19,moonY,6,Math.PI*1.8,Math.PI*.2,true);
    X.closePath();X.fill();
    // Rim highlight
    X.fillStyle='#ff3020';
    X.beginPath();
    X.arc(x+15,moonY-2,3,Math.PI,Math.PI*1.5);
    X.stroke();
    // Blood drip from moon
    const bdp=(t*.004)%1;
    if(bdp<.6){
      X.globalAlpha=.6;
      rect(X,x+17,moonY+9,1,5+bdp*6,'#8b0000');
      X.globalAlpha=1;
    }
    // Halo
    X.globalAlpha=.12+.04*Math.sin(t*.008);
    const mhalo=X.createRadialGradient(x+17,moonY,4,x+17,moonY,20);
    mhalo.addColorStop(0,'rgba(139,0,0,.8)');
    mhalo.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=mhalo;X.fillRect(x-3,moonY-20,40,40);
    X.globalAlpha=1;

    // ── STONE CIRCLE — soot-blackened ──
    const stones=[[0,22],[10,26],[20,26],[30,24],[34,16],[28,8],[18,6],[8,8],[-2,16]];
    stones.forEach(([sx,sy])=>{
      rect(X,x+sx,y+sy,6,5,'#2a2420');
      rect(X,x+sx+1,y+sy+1,4,3,'#3a2e28');
      // Soot/blood splatter on top
      px(X,x+sx+2,y+sy,'#1a0a08');
    });

    // ── BONE PILES around stones (previous sacrifices) ──
    // Left pile
    rect(X,x-7,y+28,5,2,P.bone);
    rect(X,x-5,y+26,3,1,P.dbone);
    px(X,x-8,y+29,P.bone);
    rect(X,x-6,y+30,4,1,P.dbone);
    // Right pile
    rect(X,x+38,y+28,6,2,P.bone);
    rect(X,x+40,y+26,3,2,P.dbone);
    px(X,x+44,y+29,P.bone);
    rect(X,x+39,y+30,5,1,P.dbone);
    // Front pile
    rect(X,x+14,y+33,8,2,P.dbone);
    px(X,x+15,y+32,P.bone);
    px(X,x+19,y+31,P.bone);
    // A small skull on the right pile
    rect(X,x+41,y+25,3,2,P.bone);
    px(X,x+41,y+26,'#0a0a0e');
    px(X,x+43,y+26,'#0a0a0e');

    // ── BLOOD STAINS on stones ──
    X.fillStyle='#3a0608';
    rect(X,x+4,y+10,2,1);
    rect(X,x+22,y+7,3,1);
    rect(X,x+30,y+27,2,1);
    // Darker dried blood drips
    X.fillStyle='#1a0404';
    rect(X,x+5,y+12,1,3);
    rect(X,x+23,y+9,1,4);

    // ── FIRE BED (ash + embers) ──
    dither(X,x+6,y+18,22,8,P.f3,'#3a1a08',.5);
    // Glowing embers
    for(let i=0;i<8;i++){
      const ex=x+8+i*2.5+hash(i,0,11)*2;
      const ey=y+22+hash(i,0,22)*4;
      const ep=.5+.4*Math.sin(t*.02+i*.7);
      X.globalAlpha=ep;
      px(X,ex,ey,P.f1);
      X.globalAlpha=1;
    }

    // ── SACRIFICIAL BEAST SKELETON in the center of fire ──
    // Body lies horizontally
    // Ribcage — spiky, curving up
    for(let i=0;i<5;i++){
      const rbx=x+10+i*3;
      const rby=y+20;
      // Vertical rib arch
      rect(X,rbx,rby-2,1,4,P.bone);
      // Top of arch (darker where burning)
      rect(X,rbx,rby-3,1,1,'#3a3028');
    }
    // Spine (horizontal bar)
    rect(X,x+10,y+19,15,1,P.dbone);
    // HORNED SKULL — tilted up, facing the moon
    rect(X,x+24,y+15,5,4,P.bone);
    rect(X,x+25,y+16,3,2,'#3a2e28'); // shadow
    // Eye sockets (two dark pits)
    px(X,x+25,y+16,'#0a0a0e');
    px(X,x+27,y+16,'#0a0a0e');
    // Nose hole
    px(X,x+26,y+17,'#0a0a0e');
    // Teeth
    rect(X,x+25,y+18,3,1,P.bone);
    px(X,x+26,y+18,'#0a0a0e');
    // LONG CURVED HORNS reaching up
    // Left horn
    X.strokeStyle=P.bone;X.lineWidth=1;
    X.beginPath();
    X.moveTo(x+24,y+15);
    X.quadraticCurveTo(x+20,y+10,x+22,y+3);
    X.stroke();
    // Right horn
    X.beginPath();
    X.moveTo(x+29,y+15);
    X.quadraticCurveTo(x+33,y+10,x+31,y+3);
    X.stroke();
    // Horn tips (sharper)
    px(X,x+22,y+3,P.bone);
    px(X,x+31,y+3,P.bone);
    // Back legs (bones) sticking out
    rect(X,x+8,y+22,3,1,P.dbone);
    rect(X,x+7,y+23,2,1,P.dbone);
    // Front leg
    rect(X,x+18,y+22,1,3,P.dbone);

    // ── FIRE on top of the beast (consuming it) ──
    const f=t*.025;
    for(let i=0;i<14;i++){
      const fx=x+12+Math.sin(f+i*.8)*7;
      const fy=y+18-i*2.5-Math.abs(Math.sin(f*1.3+i*.6))*4;
      const s=Math.max(1,6-Math.floor(i*.4));
      X.globalAlpha=1-i*.06;
      rect(X,fx,fy,s,s,[P.f3,P.f3,P.f1,P.f1,P.f4,P.f4,P.f2,P.f2,P.f2,P.f2,'#ffeecc','#fff','#fff','#fff'][i]);
    }
    X.globalAlpha=1;

    // Sparks rising toward the moon
    for(let i=0;i<6;i++){
      const sx_=x+14+Math.sin(t*.015+i*1.5)*12;
      const spPh=(t*.04+i*10)%30;
      const sy_=y+6-spPh;
      X.globalAlpha=Math.max(0,1-spPh/30)*.8;
      px(X,sx_,sy_,P.f2);
      if(spPh<10)px(X,sx_+1,sy_,P.f4);
      X.globalAlpha=1;
    }

    // ── DRIPPING BLOOD from the beast ──
    if(t%60<30){
      X.globalAlpha=.6;
      rect(X,x+15,y+28,1,2,'#6b0f1a');
      X.globalAlpha=1;
    }

    // ── HOODED ELDER silhouette in far-right corner (small) ──
    // Distant figure watching
    rect(X,x+46,y+20,3,6,'#0a0a0a');
    rect(X,x+46,y+18,3,3,'#0a0a0a'); // hood
    px(X,x+47,y+19,'#1a0e06');
    px(X,x+48,y+19,'#1a0e06');

    // ── Jester moved to its own location (jester_home) ──

    // ── ASH/BLOOD puddle at the front of the fire ──
    X.globalAlpha=.4;
    X.fillStyle='#1a0608';
    X.beginPath();X.ellipse(x+18,y+34,10,2,0,0,Math.PI*2);X.fill();
    X.globalAlpha=1;
}

export function draw_terminal(x, y) {
    rect(X,x+4,y+30,38,12,P.dgrey);rect(X,x+6,y+32,34,8,P.ash);rect(X,x+8,y+42,3,6,P.dgrey);rect(X,x+35,y+42,3,6,P.dgrey);
    rect(X,x+10,y+4,26,28,P.dgrey);rect(X,x+12,y+6,22,24,'#1a1a1a');rect(X,x+20,y+28,6,4,P.ash);
    // Silent cat sitting on top-right of monitor
    // NPC drawn separately
    const g=.6+.25*Math.sin(t*.006);X.globalAlpha=g;rect(X,x+13,y+7,20,22,'#0a1a0a');X.globalAlpha=1;
    for(let i=0;i<8;i++){X.globalAlpha=.4+.3*hash(i,t*.007,6);rect(X,x+15,y+9+i*2.5,6+hash(i,t*.001,5)*12,1,P.term);};X.globalAlpha=1;
    rect(X,x+34,y+28,2,2,t%60<30?P.term:P.termd);
    // Sol moved to sol_home
}

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

export function draw_library(x, y) {
    if(!playerNearLoc(locs.find(l=>l.id==='library'),350)){
      // Pediment triangle silhouette
      X.fillStyle=P.dstone;
      X.beginPath();X.moveTo(x+3,y+6);X.lineTo(x+51,y-18);X.lineTo(x+99,y+6);X.closePath();X.fill();
      drawBuildingSilhouette(x+4,y+6,94,72,P.dstone);
      // Hint columns
      for(let c=0;c<6;c++)rect(X,x+8+c*16,y+20,5,38,'#1a1a22');
      return;
    }
    // ═══ CLASSICAL TEMPLE OF BOOKS — Alexandria-on-Fire ═══
    // Massive stone podium on which the temple rests
    // Ground shadow
    X.globalAlpha=.4;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+50,y+80,60,5,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── STEPS / STYLOBATE — wide marble steps leading up ──
    for(let s=0;s<5;s++){
      const sy_=y+72-s*2;
      rect(X,x+6-s,sy_,88+s*2,3,P.stone);
      rect(X,x+6-s,sy_,88+s*2,1,P.lstone||'#4a4a52');
      rect(X,x+6-s,sy_+2,88+s*2,1,'#1a1a22');
      // Cracks in steps
      if(s%2)rect(X,x+20+s*8,sy_+1,hash(s,x,11)*25,1,'#0a0a0e');
    }
    // Crumbled step corner on right
    for(let i=0;i<6;i++){
      rect(X,x+82+hash(i,0,11)*12,y+70+hash(i,0,22)*6,2+hash(i,0,33)*3,2,P.dstone);
    }

    // ── STYLOBATE (base platform) ──
    rect(X,x+4,y+60,94,12,P.dstone);
    rect(X,x+4,y+60,94,1,P.stone);
    rect(X,x+4,y+71,94,1,'#0a0a0e');
    // Greek key frieze on stylobate
    for(let i=0;i<22;i++){
      const fx=x+6+i*4;
      if(i%2){rect(X,fx,y+63,3,1,P.dgold||'#8a6408');rect(X,fx+2,y+63,1,3,P.dgold||'#8a6408');}
      else{rect(X,fx,y+66,3,1,P.dgold||'#8a6408');rect(X,fx,y+63,1,3,P.dgold||'#8a6408');}
    }

    // ── SIX IONIC COLUMNS ──
    const colXs=[x+8,x+24,x+40,x+56,x+72,x+88];
    colXs.forEach((cx,ci)=>{
      const fallen=ci===4; // 5th column has fallen
      if(fallen){
        // Fallen column segments on the ground
        for(let seg=0;seg<4;seg++){
          rect(X,x+60+seg*7,y+68,6,4,P.stone);
          rect(X,x+60+seg*7,y+68,6,1,P.lstone||'#4a4a52');
          rect(X,x+60+seg*7,y+71,6,1,'#1a1a22');
          // Fluting on side
          rect(X,x+61+seg*7,y+69,1,2,'#2a2a32');
          rect(X,x+63+seg*7,y+69,1,2,'#2a2a32');
        }
        // Broken capital on ground
        rect(X,x+58,y+66,4,4,P.stone);
        return;
      }
      // Column base (torus)
      rect(X,cx-1,y+58,8,3,P.dstone);
      rect(X,cx,y+58,6,1,P.lstone||'#4a4a52');
      rect(X,cx-1,y+60,8,1,'#1a1a22');
      // Column shaft with fluting (tall)
      rect(X,cx,y+20,6,38,P.stone);
      // Fluting lines
      rect(X,cx+1,y+20,1,38,'#2a2a32');
      rect(X,cx+3,y+20,1,38,'#3a3a42');
      rect(X,cx+5,y+20,1,38,'#2a2a32');
      // Shadow side
      rect(X,cx,y+20,1,38,'#1a1a22');
      // Moss at base
      if(ci%2)rect(X,cx,y+56,6,2,P.dtoxic);
      if(ci===1)rect(X,cx+2,y+54,3,2,P.toxic);
      // Cracks on shaft
      if(ci===2){rect(X,cx+2,y+35,1,12,'#0a0a0e');}
      if(ci===0){rect(X,cx+3,y+40,1,8,'#0a0a0e');}
      // Ionic capital — volute scrolls
      rect(X,cx-2,y+17,10,3,P.stone);
      rect(X,cx-2,y+17,10,1,P.lstone||'#4a4a52');
      // Left volute scroll
      rect(X,cx-2,y+15,3,2,P.dstone);
      px(X,cx-1,y+14,P.stone);
      px(X,cx-2,y+15,P.stone);
      // Right volute scroll
      rect(X,cx+5,y+15,3,2,P.dstone);
      px(X,cx+6,y+14,P.stone);
      px(X,cx+7,y+15,P.stone);
      // Echinus (curve between capital and shaft)
      rect(X,cx-1,y+16,8,1,P.dstone);
    });

    // ── ENTABLATURE (horizontal beam above columns) ──
    // Architrave
    rect(X,x+4,y+12,94,5,P.stone);
    rect(X,x+4,y+12,94,1,P.lstone||'#4a4a52');
    rect(X,x+4,y+16,94,1,'#1a1a22');
    // Broken chunk missing above fallen column
    rect(X,x+58,y+12,16,5,'#0a0604');
    // Frieze (above architrave) with relief — scholars reading
    rect(X,x+4,y+8,94,4,P.dstone);
    // Tiny figures on frieze (Muses)
    for(let fi=0;fi<8;fi++){
      if(fi===4)continue; // gap at broken section
      const ffx=x+8+fi*12;
      rect(X,ffx,y+9,2,3,P.stone); // body
      px(X,ffx,y+9,P.dstone); // head shadow
      px(X,ffx+1,y+9,P.stone);
      // Scroll in hand
      px(X,ffx+2,y+10,P.bone);
    }
    // Cornice (top overhang)
    rect(X,x+3,y+6,96,3,P.stone);
    rect(X,x+3,y+6,96,1,P.lstone||'#4a4a52');
    rect(X,x+3,y+8,96,1,'#1a1a22');
    // Dentils (tooth-like blocks under cornice)
    for(let d=0;d<30;d++){
      if(d%2)rect(X,x+4+d*3,y+5,2,1,P.dstone);
    }

    // ── PEDIMENT (triangular gable) ──
    // Main triangle
    X.fillStyle=P.stone;
    X.beginPath();
    X.moveTo(x+3,y+6);
    X.lineTo(x+51,y-18);
    X.lineTo(x+99,y+6);
    X.closePath();X.fill();
    // Inner tympanum shadow
    X.fillStyle=P.dstone;
    X.beginPath();
    X.moveTo(x+6,y+6);
    X.lineTo(x+51,y-14);
    X.lineTo(x+96,y+6);
    X.closePath();X.fill();
    // Edge highlights
    X.strokeStyle=P.lstone||'#4a4a52';X.lineWidth=1;
    X.beginPath();X.moveTo(x+3,y+6);X.lineTo(x+51,y-18);X.stroke();
    X.strokeStyle='#1a1a22';
    X.beginPath();X.moveTo(x+51,y-18);X.lineTo(x+99,y+6);X.stroke();

    // Sculpture in tympanum — seated goddess with open book
    // Throne
    rect(X,x+46,y-6,10,8,P.dstone);
    rect(X,x+45,y-8,12,2,P.stone);
    // Goddess body
    rect(X,x+48,y-12,6,6,P.stone);
    // Head
    rect(X,x+49,y-16,4,4,P.stone);
    px(X,x+50,y-15,P.dstone);
    px(X,x+51,y-15,P.dstone);
    // Halo
    X.globalAlpha=.3;X.fillStyle=P.gold;
    X.beginPath();X.arc(x+51,y-14,5,0,Math.PI*2);X.fill();
    X.globalAlpha=1;
    // Open book in lap
    rect(X,x+47,y-5,8,2,P.bone);
    rect(X,x+51,y-5,1,2,P.dstone);
    // Figures flanking goddess — tiny seated scholars
    rect(X,x+38,y-2,4,5,P.stone);rect(X,x+40,y-4,2,2,P.stone); // left scholar
    rect(X,x+58,y-2,4,5,P.stone);rect(X,x+60,y-4,2,2,P.stone); // right scholar
    // Broken chunk of pediment — top right missing
    X.fillStyle='#0a0604';
    X.beginPath();
    X.moveTo(x+88,y-10);
    X.lineTo(x+99,y+6);
    X.lineTo(x+88,y+4);
    X.closePath();X.fill();
    // Jagged edge of break
    for(let i=0;i<6;i++){
      px(X,x+88+i,y-9+i,P.stone);
    }
    // Acroterion (ornament at pediment peak)
    rect(X,x+49,y-22,4,4,P.dstone);
    rect(X,x+50,y-24,2,2,P.stone);
    px(X,x+51,y-26,P.stone);

    // ── INTERIOR — visible between columns (dark depth) ──
    rect(X,x+10,y+20,80,38,'#0a0604');
    // Inner back wall
    rect(X,x+12,y+22,76,34,'#1a0e08');
    // Wall texture — burnt
    for(let i=0;i<20;i++){
      rect(X,x+13+hash(i,x,11)*72,y+23+hash(i,y,22)*32,hash(i,0,33)*8,1,'#0a0604');
    }
    // Shaft of light from broken roof — hits the altar
    X.globalAlpha=.08;
    const shaft=X.createLinearGradient(x+30,y-6,x+50,y+55);
    shaft.addColorStop(0,'rgba(184,134,11,.6)');
    shaft.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=shaft;X.fillRect(x+25,y-6,30,65);
    X.globalAlpha=1;

    // ── BOOKSHELVES visible between columns ──
    // Back wall shelves — 4 rows
    for(let row=0;row<4;row++){
      const sy_=y+24+row*8;
      rect(X,x+14,sy_+6,72,1,P.wood);
      rect(X,x+14,sy_,1,7,P.wood); // left support
      rect(X,x+49,sy_,1,7,P.wood); // middle support
      rect(X,x+85,sy_,1,7,P.wood); // right support
      // Book spines
      for(let b=0;b<30;b++){
        if(hash(b,row+x,11)>.3){
          const bx=x+15+b*2.4;
          const bh=3+Math.floor(hash(b,row,22)*4);
          const bc=[P.crimson,'#2a1a0a','#1a2a1a',P.dwood,P.damber,P.indigo,'#3a1a08','#0a1a2a','#2a0a2a'][Math.floor(hash(b,row,44)*9)];
          rect(X,bx,sy_+6-bh,2,bh,bc);
          if(hash(b,row,55)>.6)px(X,bx,sy_+6-bh+1,P.gold);
        }
      }
    }
    // Burn marks on shelves
    X.globalAlpha=.5;X.fillStyle='#0a0604';
    rect(X,x+30,y+24,20,8,'#0a0604');
    rect(X,x+60,y+40,15,6,'#0a0604');
    X.globalAlpha=1;
    // Burned corner with glowing ember
    const emberP=(Math.sin(t*.04)+1)*.5;
    X.globalAlpha=.4+emberP*.3;
    px(X,x+35,y+28,P.crimson);
    px(X,x+36,y+28,P.f1);
    X.globalAlpha=1;

    // ── ALTAR / CENTRAL READING PEDESTAL ──
    // Marble pedestal
    rect(X,x+42,y+48,16,10,P.stone);
    rect(X,x+42,y+48,16,1,P.lstone||'#4a4a52');
    rect(X,x+42,y+57,16,1,'#1a1a22');
    // Pedestal carvings
    rect(X,x+44,y+50,2,6,P.dstone);
    rect(X,x+54,y+50,2,6,P.dstone);

    // ── OPEN GRAND BOOK on altar — THE книга ──
    // Book base
    rect(X,x+40,y+44,20,5,'#3a2814');
    rect(X,x+40,y+44,20,1,P.dwood);
    // Left page
    rect(X,x+41,y+45,9,4,P.parchment);
    rect(X,x+41,y+45,9,1,'#d8c8a8');
    // Right page
    rect(X,x+51,y+45,8,4,P.parchment);
    rect(X,x+51,y+45,8,1,'#d8c8a8');
    // Central spine
    rect(X,x+50,y+44,1,5,P.dwood);
    // Text on left page (dot pattern)
    X.fillStyle='#1a0e06';
    rect(X,x+42,y+46,2,1);rect(X,x+45,y+46,3,1);
    rect(X,x+42,y+47,4,1);rect(X,x+47,y+47,2,1);
    rect(X,x+42,y+48,3,1);
    // Text on right page
    rect(X,x+52,y+46,3,1);rect(X,x+56,y+46,2,1);
    rect(X,x+52,y+47,2,1);rect(X,x+55,y+47,3,1);
    rect(X,x+52,y+48,4,1);
    // Moss growing on the book (mossG based on time)
    const mossG=Math.min(3,Math.floor(t/5400));
    if(mossG>0){
      rect(X,x+43,y+45,mossG,1,P.dtoxic);
      if(mossG>1)px(X,x+44,y+44,P.toxic);
      if(mossG>2)px(X,x+45,y+44,P.btoxic);
    }
    // Small candle on altar corner
    rect(X,x+58,y+42,2,4,P.bone);
    const cflick=Math.sin(t*.08)*.5;
    px(X,x+58+cflick*.3,y+41,P.f2);
    px(X,x+59+cflick*.3,y+41,P.f1);
    X.globalAlpha=.2+.1*Math.sin(t*.08);
    X.fillStyle=P.gold;
    X.beginPath();X.arc(x+59,y+42,6,0,Math.PI*2);X.fill();
    X.globalAlpha=1;

    // ── SCATTERED PAGES / FLOATING IN LIGHT SHAFT ──
    for(let i=0;i<10;i++){
      const px_=x+12+hash(i,1,11)*76;
      const py_=y+55+hash(i,1,22)*5;
      const rot=hash(i,1,33)>.5;
      rect(X,px_,py_,rot?3:2,rot?2:3,hash(i,1,44)>.3?P.bone:'#d8c8b0');
      // Burnt edges
      px(X,px_,py_,'#3a2814');
    }
    // Floating pages in light shaft (animated)
    for(let i=0;i<4;i++){
      const fpy=y+20+((t*.3+i*40)%40);
      const fpx=x+32+Math.sin(t*.02+i)*3;
      X.globalAlpha=.6;
      rect(X,fpx,fpy,2,2,P.bone);
      X.globalAlpha=1;
    }

    // ── STATUE fragments inside — broken bust on floor ──
    rect(X,x+16,y+50,6,8,P.stone);
    rect(X,x+16,y+50,6,1,P.lstone||'#4a4a52');
    // Head (decapitated, next to body)
    rect(X,x+24,y+54,4,4,P.stone);
    px(X,x+25,y+55,P.dstone); // eye socket
    px(X,x+26,y+55,P.dstone);

    // ── BIRDCAGE with paper scrolls instead of bird ──
    rect(X,x+78,y+38,8,10,'#0a0808');
    for(let bc=0;bc<4;bc++){
      rect(X,x+78+bc*2,y+38,1,10,'#3a3a3a');
    }
    rect(X,x+78,y+38,8,1,'#3a3a3a');
    rect(X,x+78,y+47,8,1,'#3a3a3a');
    // Paper scrolls inside
    rect(X,x+79,y+42,6,3,P.parchment);
    px(X,x+80,y+43,'#1a0e06');
    px(X,x+82,y+43,'#1a0e06');

    // ── STRANGE GROWTH — mycelium spreading across back wall ──
    for(let i=0;i<18;i++){
      const mx_=x+14+hash(i,x+11,11)*72;
      const my_=y+22+hash(i,y+22,22)*32;
      rect(X,mx_,my_,2+hash(i,0,33)*3,1,P.dtoxic);
      if(hash(i,0,44)>.6)px(X,mx_+1,my_-1,P.toxic);
      if(hash(i,0,55)>.8)px(X,mx_+2,my_,P.btoxic);
    }
    // Connecting threads between moss spots
    X.strokeStyle=P.dtoxic;X.lineWidth=1;
    X.globalAlpha=.5;
    X.beginPath();
    X.moveTo(x+20,y+30);X.quadraticCurveTo(x+45,y+35,x+80,y+28);
    X.stroke();
    X.globalAlpha=1;

    // ── IVY climbing left side ──
    for(let i=0;i<12;i++){
      const iy=y+10+i*5;
      rect(X,x+3,iy,2,3,P.dtoxic);
      if(i%2)rect(X,x+1,iy+1,2,2,P.toxic);
      else rect(X,x+5,iy+1,2,2,P.toxic);
      // Tendrils
      if(i%3===0){
        X.strokeStyle=P.dtoxic;X.lineWidth=1;
        X.beginPath();X.moveTo(x+4,iy);X.quadraticCurveTo(x+1,iy+2,x+3,iy+4);X.stroke();
      }
    }

    // ── CRACKED COLUMN capital laying on steps ──
    rect(X,x+75,y+70,8,3,P.stone);
    rect(X,x+76,y+69,6,1,P.dstone);
    // Scroll volutes on fallen capital
    px(X,x+75,y+70,P.dstone);
    px(X,x+82,y+70,P.dstone);

    // ── GREEK INSCRIPTION on architrave (faded Cyrillic meta) ──
    X.globalAlpha=.25;X.fillStyle=P.bone;X.font='4px "Press Start 2P"';
    X.fillText('БИБЛIOΘHKA',x+28,y+11);
    X.globalAlpha=1;
    // "3.14" scratched on column (Borges easter egg)
    X.globalAlpha=.2;X.fillStyle=P.bone;
    X.fillText('3.14',x+26,y+45);
    // Second hidden tag on another column
    X.fillText('VII-G',x+74,y+40);
    X.globalAlpha=1;

    // ── RAVEN perched on broken pediment ──
    const rvBob=Math.sin(t*.02)*.3;
    rect(X,x+86,y-4+rvBob,4,3,'#0a0604');
    rect(X,x+89,y-5+rvBob,2,3,'#0a0604');
    // Beak
    px(X,x+91,y-4+rvBob,P.damber);
    // Eye
    px(X,x+89,y-4+rvBob,P.crimson);
    // Tail
    rect(X,x+85,y-3+rvBob,2,1,'#0a0604');
    // Occasional caw — tiny "!" above
    if(t%300<20){
      px(X,x+88,y-8+rvBob,P.bone);
      px(X,x+88,y-6+rvBob,P.bone);
    }

    // ── DOORWAY — dark, between middle columns (looks like throat) ──
    // Keyed arch at back
    rect(X,x+44,y+30,12,22,'#0a0604');
    // Glow from deep inside
    X.globalAlpha=.15+.05*Math.sin(t*.03);
    X.fillStyle=P.crimson;
    rect(X,x+47,y+40,6,10,P.crimson);
    X.globalAlpha=1;
    // Tiny figure in doorway — ARCHIVARIUS silhouette
    if(Math.sin(t*.01)>0){
      rect(X,x+48,y+35,4,12,'#050404');
      px(X,x+49,y+36,P.bone); // eye glint
    }

    // ── GROUND DETAILS near base ──
    // Scattered books on stylobate (fallen out)
    for(let i=0;i<5;i++){
      const bkx=x+10+hash(i,2,11)*75;
      rect(X,bkx,y+58,4,2,[P.crimson,P.indigo,P.dwood,'#2a1a08'][i%4]);
      px(X,bkx+1,y+58,P.gold);
    }
    // Pigeon feather
    rect(X,x+40,y+73,1,3,P.bone);
    px(X,x+40,y+73,'#8a8488');
}

export function draw_tent(x, y) {
    // ═══ TENT OF THE ELDER — ritual space ═══
    // Silent cat sitting by the tent entrance
    // NPC drawn separately
    // Shadow
    X.globalAlpha=.3;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+30,y+52,34,4,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── FOUR SUPPORT POLES ──
    rect(X,x+6,y+8,3,44,P.wood);rect(X,x+7,y+9,1,42,P.lwood);
    rect(X,x+50,y+14,3,38,P.wood);rect(X,x+51,y+15,1,36,P.lwood);
    // Back poles (shorter, for perspective)
    rect(X,x+14,y+4,2,46,P.dwood);
    rect(X,x+44,y+8,2,42,P.dwood);

    // ── TENT CANVAS — layered, with sag ──
    const sag=Math.sin(t*.003)*.5;
    X.fillStyle=P.dwood;
    X.beginPath();
    X.moveTo(x+2,y+24+sag);
    X.lineTo(x+18,y+4);
    X.lineTo(x+38,y+2);
    X.lineTo(x+58,y+26+sag);
    X.lineTo(x+56,y+30);
    X.lineTo(x+38,y+10);
    X.lineTo(x+18,y+12);
    X.lineTo(x+4,y+27);
    X.closePath();X.fill();
    // Canvas texture — dithered
    dither(X,x+10,y+6,36,18,'#3a3a28','#2a2618',.4);
    // Patches — slightly different color squares
    rect(X,x+18,y+8,5,4,'#4a3a28');
    rect(X,x+32,y+12,4,4,'#3a2a18');
    rect(X,x+42,y+6,4,5,'#3a3020');
    // Seams (dark stitching lines)
    X.strokeStyle='#1a0e06';X.lineWidth=1;
    X.beginPath();X.moveTo(x+20,y+6);X.lineTo(x+20,y+24);X.stroke();
    X.beginPath();X.moveTo(x+38,y+4);X.lineTo(x+38,y+22);X.stroke();

    // ── TENT OPENING — triangular flap pulled aside ──
    X.fillStyle='#0a0604';
    X.beginPath();
    X.moveTo(x+22,y+24);
    X.lineTo(x+32,y+10);
    X.lineTo(x+40,y+24);
    X.lineTo(x+38,y+36);
    X.lineTo(x+24,y+36);
    X.closePath();X.fill();
    // Inner warm glow from candles
    const glowPulse=.6+.2*Math.sin(t*.008);
    X.globalAlpha=glowPulse*.2;
    const tentGlow=X.createRadialGradient(x+31,y+28,0,x+31,y+28,14);
    tentGlow.addColorStop(0,'rgba(218,165,32,1)');
    tentGlow.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=tentGlow;X.fillRect(x+18,y+14,26,28);
    X.globalAlpha=1;

    // ── INSCRIBED SYMBOLS on poles ──
    X.fillStyle='#6b0f1a';
    // Left pole — small crescent
    rect(X,x+5,y+20,1,1,'#6b0f1a');rect(X,x+5,y+22,1,1,'#6b0f1a');
    rect(X,x+4,y+21,1,1,'#6b0f1a');
    // Right pole — triangle
    rect(X,x+52,y+22,1,1,'#6b0f1a');
    rect(X,x+51,y+23,3,1,'#6b0f1a');

    // ── ROPE TIES from poles to ground ──
    X.strokeStyle='#3a2a18';X.lineWidth=1;
    X.beginPath();X.moveTo(x+7,y+50);X.lineTo(x-2,y+56);X.stroke();
    px(X,x-2,y+56,P.ash);
    X.beginPath();X.moveTo(x+52,y+50);X.lineTo(x+62,y+56);X.stroke();
    px(X,x+62,y+56,P.ash);

    // ── WIND CHIMES hanging from roof ──
    for(let i=0;i<4;i++){
      const wcSway=Math.sin(t*.02+i*.7)*1.5;
      const wcX=x+24+i*4+wcSway;
      const wcY=y+2;
      rect(X,wcX,wcY,1,3+i%2,P.ash);
      if(i%2)px(X,wcX,wcY+3,P.gold);
    }
    // Hanging string
    X.strokeStyle='#1a1410';X.lineWidth=1;
    X.beginPath();X.moveTo(x+22,y+1);X.lineTo(x+40,y+1);X.stroke();

    // Elder moved to elder_home

    // ── CANDLES in front of elder ──
    // Left candle
    rect(X,x+18,y+38,2,4,P.bone);
    const fl1=Math.sin(t*.04)*.5;
    px(X,x+18+fl1,y+36,P.f2);
    px(X,x+19+fl1,y+35,P.f1);
    // Right candle
    rect(X,x+40,y+38,2,4,P.bone);
    const fl2=Math.sin(t*.04+1.3)*.5;
    px(X,x+40+fl2,y+36,P.f2);
    px(X,x+41+fl2,y+35,P.f1);
    // Tall center candle
    rect(X,x+30,y+34,2,6,P.bone);
    const fl3=Math.sin(t*.05+2)*.7;
    px(X,x+30+fl3,y+32,P.f2);
    px(X,x+31+fl3,y+31,P.f1);
    px(X,x+30+fl3,y+30,'#ffffcc');

    // ── INCENSE BOWL on right with smoke ──
    rect(X,x+44,y+40,5,2,P.dgrey);
    rect(X,x+45,y+41,3,1,P.ash);
    // Smoke wisps rising
    for(let i=0;i<3;i++){
      const smPhase=((t*.012+i*.33)%1);
      const smX=x+46+Math.sin(t*.02+i*1.5)*2;
      const smY=y+38-smPhase*20;
      X.globalAlpha=(1-smPhase)*.35;
      rect(X,smX,smY,1,1+i,'#6a5a4a');
      X.globalAlpha=1;
    }

    // ── BOOKS STACKED on left ──
    rect(X,x+10,y+42,6,2,'#2a1a08');
    rect(X,x+10,y+44,6,2,'#4a1a0a');
    rect(X,x+10,y+46,6,2,'#1b1464');
    rect(X,x+10,y+48,6,2,'#3a2a18');
    // Gold lettering on spines
    px(X,x+12,y+43,P.gold);
    px(X,x+13,y+45,P.gold);
    px(X,x+12,y+47,P.gold);

    // ── CATS SAUCER at entrance ──
    rect(X,x+32,y+44,5,1,P.dstone);
    rect(X,x+33,y+43,3,1,P.dbone); // milk

    // ── EMBERS scattered on the ground ──
    for(let i=0;i<3;i++){
      if(hash(i,Math.floor(t*.01),99)>.6){
        X.globalAlpha=.5+hash(i,0,11)*.3;
        px(X,x+20+i*10,y+50,P.f1);
        X.globalAlpha=1;
      }
    }
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
    X.fillStyle='#1b1464';
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

export function draw_radio(x, y) {
    // ═══ RADIO TOWER — with doomscroll phone at base ═══

    // Shadow
    X.globalAlpha=.35;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+20,y+82,20,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── TOWER STRUCTURE — lattice frame ──
    // Vertical members — 4 legs in perspective
    for(let i=0;i<78;i++){
      const w=Math.max(2,16-Math.floor(i*.18));
      // Left edge
      rect(X,x+20-w/2,y+80-i,1,1,i%3?P.dgrey:P.ash);
      // Right edge
      rect(X,x+20+w/2-1,y+80-i,1,1,i%3?P.dgrey:P.ash);
      // Center spine (thin)
      if(i%4===0)px(X,x+20,y+80-i,P.lgrey);
    }
    // Cross beams horizontal (stronger)
    for(let i=0;i<5;i++){
      const by=y+74-i*15;
      const bw=14-i*2;
      rect(X,x+20-bw/2,by,bw,1,P.ash);
    }
    // X-pattern diagonals between horizontals
    X.strokeStyle=P.dgrey;X.lineWidth=1;
    for(let i=0;i<4;i++){
      const by1=y+74-i*15;
      const by2=y+74-(i+1)*15;
      const bw1=14-i*2;
      const bw2=14-(i+1)*2;
      X.beginPath();
      X.moveTo(x+20-bw1/2,by1);
      X.lineTo(x+20+bw2/2,by2);
      X.stroke();
      X.beginPath();
      X.moveTo(x+20+bw1/2,by1);
      X.lineTo(x+20-bw2/2,by2);
      X.stroke();
    }

    // ── ANTENNA AT TOP ──
    rect(X,x+19,y,2,4,P.ash);
    rect(X,x+20,y-2,1,2,P.dgrey);
    // Side prongs
    rect(X,x+17,y+2,6,1,P.ash);
    rect(X,x+18,y+4,4,1,P.ash);

    // ── BLINKING RED LIGHT ──
    const blink=Math.sin(t*.03)>.3;
    if(blink){
      rect(X,x+18,y+4,4,3,'#ff0000');
      rect(X,x+19,y+5,2,1,'#ff6666');
      // Aura
      X.globalAlpha=.2;
      const rGlow=X.createRadialGradient(x+20,y+5,0,x+20,y+5,15);
      rGlow.addColorStop(0,'rgba(255,0,0,1)');
      rGlow.addColorStop(1,'rgba(0,0,0,0)');
      X.fillStyle=rGlow;X.fillRect(x+5,y-10,30,30);
      X.globalAlpha=1;
    }else{
      rect(X,x+18,y+4,4,3,'#3a0606');
    }

    // ── CABLES dangling from top ──
    X.strokeStyle='#1a1410';X.lineWidth=1;
    X.beginPath();
    X.moveTo(x+17,y+10);
    X.quadraticCurveTo(x+8,y+25,x+10,y+40);
    X.stroke();
    X.beginPath();
    X.moveTo(x+23,y+10);
    X.quadraticCurveTo(x+32,y+30,x+30,y+45);
    X.stroke();
    // Guy wires to ground
    X.strokeStyle='#3a3a3a';X.lineWidth=1;
    X.beginPath();X.moveTo(x+14,y+40);X.lineTo(x-4,y+82);X.stroke();
    X.beginPath();X.moveTo(x+26,y+40);X.lineTo(x+44,y+82);X.stroke();

    // ── SPEAKER BOX mid-tower ──
    rect(X,x+13,y+50,14,10,P.dgrey);
    rect(X,x+14,y+51,12,8,P.dstone);
    // Speaker mesh
    for(let i=0;i<3;i++)for(let j=0;j<4;j++){
      px(X,x+16+j*3,y+53+i*2,'#0a0a0a');
    }
    // Rust stains below
    rect(X,x+14,y+60,1,4,P.rust);
    rect(X,x+25,y+60,1,3,P.rust);

    // ── BASE CONCRETE FOUNDATION ──
    rect(X,x+10,y+78,20,6,P.dstone);
    rect(X,x+11,y+79,18,4,P.stone);
    dither(X,x+12,y+80,16,3,P.dgrey,P.stone,.3);
    // Bolts
    px(X,x+12,y+80,P.dgrey);px(X,x+28,y+80,P.dgrey);
    px(X,x+12,y+82,P.dgrey);px(X,x+28,y+82,P.dgrey);

    // ── THE DOOMSCROLL PHONE at the base ──
    // Phone body (lying face-up)
    rect(X,x+32,y+80,8,4,'#1a1a20');
    rect(X,x+33,y+80,6,4,'#0a0a10');
    // Screen — bright and endlessly scrolling
    const scrollY=(t*.1)%12;
    X.fillStyle='#1e3a5f';
    rect(X,x+33,y+80,6,3,'#1e3a5f');
    // Scrolling "feed" lines
    X.fillStyle='#4a7fb5';
    for(let i=0;i<4;i++){
      const fy=y+80+((i*4-scrollY/3)%4);
      rect(X,x+33,fy,6,1,i%2?'#4a7fb5':'#3a6fa5');
    }
    // Glow
    X.globalAlpha=.2+.1*Math.sin(t*.05);
    const phGlow=X.createRadialGradient(x+36,y+82,0,x+36,y+82,14);
    phGlow.addColorStop(0,'rgba(74,127,181,1)');
    phGlow.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=phGlow;X.fillRect(x+22,y+68,28,22);
    X.globalAlpha=1;

    // ── A HAND reaching toward the phone (silhouette) ──
    // Just the fingers visible, as if someone can't help themselves
    rect(X,x+40,y+79,4,1,'#050505');
    rect(X,x+41,y+80,1,1,'#050505');
    rect(X,x+43,y+80,1,1,'#050505');

    // ── SCATTERED EMPTY MUGS at base (many mugs = many hours) ──
    for(let i=0;i<4;i++){
      const mx=x+i*3;
      const my=y+82;
      rect(X,mx,my,2,3,P.dgrey);
      rect(X,mx,my,2,1,'#1a1a1a');
    }

    // ── CIGARETTE BUTTS scattered ──
    for(let i=0;i<6;i++){
      px(X,x+5+hash(i,0,11)*35,y+85+hash(i,0,22)*2,'#e8d8b0');
      if(hash(i,0,33)>.5)px(X,x+5+hash(i,0,11)*35,y+86,'#8a6408');
    }

    // ═══════════════════════════════════════════════════
    // ── ABANDONED SERVER RACK — CA / SCL / AIQ ──
    // ═══════════════════════════════════════════════════
    // Server cabinet beside the radio base
    rect(X,x-8,y+68,8,16,'#1a1a1a');
    rect(X,x-7,y+69,6,14,'#0a0a0a');
    // Rack rails
    rect(X,x-8,y+68,1,16,'#2a2a2a');
    rect(X,x-1,y+68,1,16,'#2a2a2a');
    // Blinking status LEDs
    for(let i=0;i<5;i++){
      const ly=y+70+i*2;
      rect(X,x-6,ly,1,1,i%2?'#0a4a0a':'#3a0a0a');
      // Some blink red (errors)
      if(i===2&&Math.sin(t*.15+i)>.3)px(X,x-6,ly,'#ff2020');
    }
    // Network cables dangling
    X.strokeStyle='#1a4a1a';X.lineWidth=1;
    X.beginPath();X.moveTo(x-4,y+84);X.lineTo(x-2,y+88);X.stroke();
    X.strokeStyle='#4a1a1a';
    X.beginPath();X.moveTo(x-5,y+84);X.lineTo(x-7,y+88);X.stroke();
    X.strokeStyle='#1a1a4a';
    X.beginPath();X.moveTo(x-3,y+84);X.lineTo(x+1,y+87);X.stroke();

    // Stickers on the side (CA / SCL / AIQ)
    rect(X,x-7,y+71,5,2,'#4a7fb5');
    X.fillStyle=P.bone;X.font='3px "Press Start 2P"';
    X.globalAlpha=.7;
    X.fillText('SCL',x-7,y+73);
    X.globalAlpha=1;
    // Sticker 2 — CA
    rect(X,x-7,y+74,5,2,'#6b0f1a');
    X.fillStyle=P.bone;
    X.globalAlpha=.7;
    X.fillText('CA',x-7,y+76);
    X.globalAlpha=1;
    // Red X through both stickers
    X.strokeStyle='#ffffff';X.lineWidth=1;
    X.beginPath();X.moveTo(x-7,y+71);X.lineTo(x-2,y+76);X.stroke();
    X.beginPath();X.moveTo(x-2,y+71);X.lineTo(x-7,y+76);X.stroke();
    // New label "the algorithm ≠ neutral"
    rect(X,x-7,y+78,5,2,'#0a0a0a');
    X.fillStyle='#4a7fb5';
    X.globalAlpha=.6;
    X.fillText('ALG≠',x-7,y+80);
    X.globalAlpha=1;

    // ── PRINTOUT with 87M FIGURE pinned to radio base ──
    rect(X,x+12,y+72,16,6,P.bone);
    rect(X,x+12,y+72,16,1,'#8a7458');
    // "87M" in big red
    X.fillStyle='#6b0f1a';X.font='5px "Press Start 2P"';
    X.fillText('87M',x+14,y+77);
    // Small "profiles" text
    X.fillStyle='#1a0806';X.font='3px "Press Start 2P"';
    X.globalAlpha=.7;
    X.fillText('profiles',x+20,y+77);
    X.globalAlpha=1;
    // Nail pinning it
    px(X,x+20,y+72,P.ash);

    // ── ZUCKERBERG LIZARD-MAN sketch — tiny ──
    // (the "running ads" face)
    rect(X,x+14,y+66,4,5,'#0a0a22'); // suit
    rect(X,x+15,y+64,3,3,P.bone);    // face
    px(X,x+15,y+65,'#050205'); // eye
    px(X,x+17,y+65,'#050205'); // eye
    // Flat mouth
    rect(X,x+15,y+66,3,1,'#050205');
    // Speech bubble
    rect(X,x+19,y+63,7,3,P.bone);
    X.fillStyle='#050205';X.font='3px "Press Start 2P"';
    X.globalAlpha=.7;
    X.fillText('ads',x+20,y+66);
    X.globalAlpha=1;

    // ── NEWS CLIPPING stack ──
    for(let i=0;i<3;i++){
      rect(X,x+30+i,y+78+i,6,4,P.parchment);
      rect(X,x+30+i,y+78+i,6,1,'#8a7458');
      // Tiny text lines
      rect(X,x+31+i,y+79+i,4,1,'#1a0806');
      rect(X,x+31+i,y+80+i,3,1,'#1a0806');
    }

    // ── FRANCES HAUGEN name tag (whistleblower) ──
    rect(X,x+3,y+68,8,3,'#e8dcc8');
    rect(X,x+3,y+68,8,1,'#8a7458');
    X.fillStyle='#050205';X.font='3px "Press Start 2P"';
    X.globalAlpha=.6;
    X.fillText('HAUGEN',x+4,y+71);
    X.globalAlpha=1;

    // ── Troll farm sticker — IRA St.Petersburg ──
    rect(X,x+24,y+68,4,3,'#1b1464');
    X.fillStyle='#e8dcc8';
    X.globalAlpha=.5;
    X.fillText('IRA',x+25,y+71);
    X.globalAlpha=1;

    // ── GPT CURSOR blinking — next to everything, "the new mouth" ──
    rect(X,x-10,y+64,1,3,'#0a0a0a');
    if(t%40<20){
      px(X,x-10,y+65,P.toxic);
      px(X,x-10,y+66,P.toxic);
    }
    // Tiny "ChatGPT" label
    X.fillStyle=P.toxic;X.font='3px "Press Start 2P"';
    X.globalAlpha=.5;
    X.fillText('GPT',x-8,y+67);
    X.globalAlpha=1;

    // Additional overlay — radio plays "I don't want to set the world on fire" wave
    X.globalAlpha=.15;
    X.strokeStyle=P.amber;X.lineWidth=1;
    X.beginPath();
    for(let i=0;i<30;i++){
      const wx=x+5+i*1.2;
      const wy=y+63+Math.sin(t*.05+i*.4)*2;
      if(i===0)X.moveTo(wx,wy);else X.lineTo(wx,wy);
    }
    X.stroke();
    X.globalAlpha=1;
}

export function draw_cross(x, y) {
    // ═══ CROSS ON THE HILL — SISYPHUS / GOLGOTHA ═══
    // Shadow
    X.globalAlpha=.35;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+15,y+52,22,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── HILL MOUND underneath (rounded) ──
    for(let dy=0;dy<10;dy+=1){
      const w=32-dy*2;
      const hue=24+dy;
      rect(X,x-1+dy,y+42+dy,w,1,`rgb(${hue},${hue-2},${hue-6})`);
    }
    // Grass (dead)
    for(let i=0;i<8;i++){
      const gx=x+hash(i,0,11)*30;
      px(X,gx,y+42+hash(i,0,22)*3,'#2a1806');
    }

    // ── CROSS — heavy wooden, weathered ──
    // Vertical beam
    rect(X,x+11,y,6,48,P.wood);
    rect(X,x+12,y+1,4,46,'#3a2814');
    rect(X,x+13,y+2,2,44,P.lwood);
    // Wood grain lines
    for(let i=0;i<20;i++){
      px(X,x+12,y+3+i*2,'#1a0e06');
    }
    // Nails in vertical beam
    px(X,x+11,y+8,P.dgrey);
    px(X,x+16,y+8,P.dgrey);
    px(X,x+11,y+30,P.dgrey);

    // Horizontal beam
    rect(X,x+2,y+10,24,5,P.wood);
    rect(X,x+3,y+11,22,3,'#3a2814');
    rect(X,x+4,y+12,20,1,P.lwood);
    // Wood grain
    for(let i=0;i<12;i++){
      px(X,x+4+i*2,y+13,'#1a0e06');
    }
    // End caps
    rect(X,x+2,y+10,1,5,P.dwood);
    rect(X,x+25,y+10,1,5,P.dwood);
    // Nails in crossbar
    px(X,x+6,y+11,P.dgrey);
    px(X,x+21,y+11,P.dgrey);
    px(X,x+13,y+11,P.dgrey);
    px(X,x+15,y+11,P.dgrey);

    // Weathering (bird droppings, stains)
    px(X,x+11,y+6,P.bone);
    px(X,x+17,y+4,P.bone);
    // Rust/blood stains
    rect(X,x+13,y+11,2,1,'#3a0608');
    rect(X,x+14,y+15,1,8,'#3a0608');

    // ── CARVED INSCRIPTION on crossbar ──
    // "INRI" faint
    px(X,x+10,y+13,'#0a0a0e');
    px(X,x+12,y+13,'#0a0a0e');
    px(X,x+14,y+13,'#0a0a0e');
    px(X,x+16,y+13,'#0a0a0e');
    px(X,x+18,y+13,'#0a0a0e');

    // ── SISYPHUS'S STONE at base ──
    // Big round warm stone
    const stPulse=.9+.1*Math.sin(t*.005);
    X.fillStyle=P.stone;
    X.beginPath();X.arc(x+19,y+43,6,0,Math.PI*2);X.fill();
    X.fillStyle=P.dstone;
    X.beginPath();X.arc(x+19,y+43,5,0,Math.PI*2);X.fill();
    // Warmth aura — the stone is always warm
    X.globalAlpha=(.08+.04*Math.sin(t*.003))*stPulse;
    const stGrad=X.createRadialGradient(x+19,y+43,0,x+19,y+43,12);
    stGrad.addColorStop(0,'rgba(218,165,32,.7)');
    stGrad.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=stGrad;X.fillRect(x+7,y+31,24,24);
    X.globalAlpha=1;
    // Stone surface details — texture
    px(X,x+17,y+41,P.lstone);
    px(X,x+21,y+42,P.lstone);
    px(X,x+18,y+44,'#1a1a22');
    px(X,x+20,y+45,'#1a1a22');
    // Drag marks from stone — hints it's been rolled before
    for(let i=0;i<5;i++){
      rect(X,x+8-i*2,y+48+i,3,1,'#0e0a04');
    }

    // ── OFFERINGS at base ──
    // Wilted flowers (dried)
    rect(X,x+4,y+46,2,1,'#3a0a08');
    px(X,x+4,y+45,'#1a0404');
    rect(X,x+8,y+47,2,1,'#2a1806');
    // Candle (tall, half-burnt)
    rect(X,x+26,y+40,2,8,P.bone);
    rect(X,x+26,y+39,2,1,P.dbone); // melted top
    // Wax drips down
    rect(X,x+25,y+43,1,2,P.dbone);
    rect(X,x+28,y+42,1,3,P.dbone);
    // Flame
    const fl=Math.sin(t*.04)*.5;
    px(X,x+26+fl,y+38,P.f2);
    px(X,x+27+fl,y+37,P.f1);
    // Candle light
    X.globalAlpha=.12+.04*Math.sin(t*.03);
    const cdGrad=X.createRadialGradient(x+27,y+38,0,x+27,y+38,12);
    cdGrad.addColorStop(0,'rgba(218,165,32,.8)');
    cdGrad.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=cdGrad;X.fillRect(x+15,y+26,24,24);
    X.globalAlpha=1;

    // Small handwritten paper note weighted by a pebble
    rect(X,x+10,y+48,5,2,P.dbone);
    // Barely-visible handwriting
    px(X,x+11,y+48,'#1a0a06');
    px(X,x+13,y+48,'#1a0a06');
    // Pebble holding it down
    px(X,x+12,y+49,P.dstone);

    // ── KPI BOARD nailed to cross (modern absurdity) ──
    // Tiny clipboard hanging from a nail
    rect(X,x+18,y+7,6,8,'#e8dcc8');
    rect(X,x+18,y+7,6,1,P.dgrey); // clip
    // Lines of text (graph?)
    rect(X,x+19,y+9,4,1,'#1a0e06');
    rect(X,x+19,y+11,3,1,'#1a0e06');
    rect(X,x+19,y+13,4,1,'#1a0e06');
    // "0%" marker in red
    px(X,x+22,y+13,P.crimson);

    // ── DISTANT CROW on top of cross ──
    if(t%500<480){
      rect(X,x+13,y-2,3,1,'#050505');
      px(X,x+15,y-2,'#050505');
      px(X,x+12,y-2,'#050505'); // beak
    }

    // ── WIND RIBBONS tied to crossbar ──
    const ribSway=Math.sin(t*.02)*2;
    rect(X,x+3+ribSway*.2,y+16,1,5,'#6b0f1a');
    rect(X,x+4+ribSway*.3,y+18,1,4,'#4a0a12');
    rect(X,x+24+ribSway*.2,y+16,1,6,'#1b1464');
    rect(X,x+23+ribSway*.3,y+18,1,4,'#0e0a38');
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
    px(X,x+25,y+6,'#aaccff');
    // Red fragment (jewel?)
    px(X,x+18,y+7,P.crimson);
    px(X,x+19,y+7,P.volcanic);
    // Tooth
    px(X,x+15,y+4,P.bone);
    // Eye (glass eye?)
    rect(X,x+28,y+6,2,2,'#ccccff');
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
      const slColor=['#6b0f1a','#daa520','#4a7fb5','#1b1464','#8a6408'][i];
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
    px(X,fishX-1,fishY-1,P.amber);
    px(X,fishX,fishY-1,'#daa520');
    px(X,fishX+1,fishY-1,'#4a7fb5');
    px(X,fishX+2,fishY-1,'#1b1464');
    px(X,fishX-2,fishY,'#8b0000');
    px(X,fishX-1,fishY,P.damber);
    px(X,fishX,fishY,P.gold);
    px(X,fishX+1,fishY,P.celestial);
    px(X,fishX+2,fishY,P.indigo);
    // Eye (the optimist's eye)
    px(X,fishX+2*fishDir,fishY-1,'#fff');
    // Tail (wiggling)
    const tailPh=Math.sin(t*.04);
    rect(X,fishX-6*fishDir,fishY-1+tailPh,2,3,'#4a7fb5');
    px(X,fishX-7*fishDir,fishY-1+tailPh*2,'#1b1464');
    // Dorsal fin
    px(X,fishX,fishY-2,'#1b1464');
    px(X,fishX+1,fishY-2,'#0e0a38');
    // Bubbles coming from fish mouth
    if(t%30<15){
      px(X,fishX+4*fishDir,fishY,P.btoxic);
      px(X,fishX+5*fishDir,fishY-1,P.btoxic);
    }

    // Faint rainbow aura around the fish
    X.globalAlpha=.08+.04*Math.sin(t*.01);
    const fishGrad=X.createRadialGradient(fishX,fishY,0,fishX,fishY,15);
    fishGrad.addColorStop(0,'rgba(218,165,32,.8)');
    fishGrad.addColorStop(.5,'rgba(74,127,181,.4)');
    fishGrad.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=fishGrad;X.fillRect(fishX-15,fishY-15,30,30);
    X.globalAlpha=1;

    // ── BARREL half-sunk (radiation source?) ──
    rect(X,x+68,y+20,8,12,'#2a1a08');
    rect(X,x+69,y+21,6,10,'#3a2a0a');
    dither(X,x+69,y+22,6,8,P.rust,'#2a1a08',.4);
    // Radiation symbol
    rect(X,x+71,y+24,2,1,P.amber);
    rect(X,x+71,y+27,2,1,P.amber);
    rect(X,x+72,y+25,1,2,P.amber);
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

export function draw_train(x, y) {
    // ═══ RUSTED TRAIN — Platonov's Machinist Route ═══
    // Shadow
    X.globalAlpha=.4;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+60,y+46,70,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── RAIL TIES + RUSTED RAILS underneath ──
    for(let i=0;i<14;i++){
      rect(X,x-2+i*9,y+44,6,2,'#2a1806');
    }
    // Rails
    rect(X,x-2,y+43,124,1,P.rust);
    rect(X,x-2,y+46,124,1,P.rust);

    // ── LOCOMOTIVE (left wagon — Platonov's engine) ──
    const lx=x;
    // Main body
    rect(X,lx,y+4,52,34,P.dgrey);
    rect(X,lx+2,y+6,48,30,P.dstone);
    dither(X,lx+4,y+8,44,26,P.rust,P.dstone,.4);

    // Boiler — round part
    X.fillStyle=P.dgrey;
    X.beginPath();X.arc(lx+14,y+24,14,0,Math.PI*2);X.fill();
    X.fillStyle=P.dstone;
    X.beginPath();X.arc(lx+14,y+24,12,0,Math.PI*2);X.fill();
    // Rust dither on boiler
    for(let i=0;i<30;i++){
      const bx=lx+6+hash(i,0,11)*16;
      const by=y+16+hash(i,0,22)*16;
      const dx_=bx-(lx+14),dy_=by-(y+24);
      if(dx_*dx_+dy_*dy_<144)px(X,bx,by,hash(i,0,33)>.5?P.rust:P.drust);
    }
    // Boiler bands (metal rings)
    rect(X,lx+2,y+22,24,1,'#1a1a1a');
    rect(X,lx+2,y+26,24,1,'#1a1a1a');
    // Rivets
    for(let i=0;i<6;i++){
      px(X,lx+4+i*4,y+22,P.lgrey);
      px(X,lx+4+i*4,y+26,P.lgrey);
    }
    // Headlight (dead)
    rect(X,lx,y+20,3,4,'#0a0a0a');
    rect(X,lx,y+21,3,2,'#2a1a0a');
    // Smokestack
    rect(X,lx+11,y+4,6,8,P.dgrey);
    rect(X,lx+12,y+4,4,7,'#1a1a1a');
    rect(X,lx+10,y+2,8,2,P.dgrey);
    // Slow steam rising (or soul rising — Platonov didn't differentiate)
    for(let i=0;i<4;i++){
      const smPh=((t*.008+i*.25)%1);
      const smX=lx+14+Math.sin(t*.01+i*2)*3;
      const smY=y-smPh*18;
      X.globalAlpha=(1-smPh)*.4;
      rect(X,smX,smY,2+i%2,1,'#6a5a4a');
      X.globalAlpha=1;
    }

    // Cab — behind boiler
    rect(X,lx+28,y+6,24,22,P.dgrey);
    rect(X,lx+30,y+8,20,18,'#1a1a1a');
    // Cab window
    rect(X,lx+32,y+10,16,8,'#0a0a0e');
    // MACHINIST silhouette inside cab (breathing slowly, still at controls)
    const mBrth=Math.sin(t*.005)*.3;
    rect(X,lx+36,y+12+mBrth,4,4,'#050505');
    rect(X,lx+37,y+11+mBrth,2,2,'#0a0a0a'); // head
    // Hand on throttle
    rect(X,lx+40,y+14+mBrth,2,1,'#050505');
    // One glowing gauge on cab
    if(t%120<60){
      px(X,lx+45,y+12,P.f2);
    }else{
      px(X,lx+45,y+12,'#3a0808');
    }

    // Cab door (open)
    rect(X,lx+28,y+18,2,10,'#0a0a0a');
    // Steps
    rect(X,lx+27,y+28,3,2,P.dgrey);
    rect(X,lx+27,y+31,3,2,P.dgrey);

    // Locomotive wheels (3 large)
    for(let i=0;i<3;i++){
      const whX=lx+6+i*14;
      rect(X,whX,y+36,10,8,'#0a0a0a');
      rect(X,whX+1,y+37,8,6,'#1a1a1a');
      // Spokes
      px(X,whX+5,y+38,P.dgrey);
      px(X,whX+5,y+42,P.dgrey);
      px(X,whX+2,y+40,P.dgrey);
      px(X,whX+8,y+40,P.dgrey);
      px(X,whX+5,y+40,P.rust); // center hub
    }
    // Connecting rod (red)
    rect(X,lx+6,y+40,38,1,P.rust);

    // ── COUPLING ──
    rect(X,lx+52,y+25,6,3,'#1a1a1a');
    rect(X,lx+55,y+24,3,5,P.dgrey);

    // ── PASSENGER CAR (right wagon) ──
    const px2=x+60;
    rect(X,px2,y+4,58,34,P.dgrey);
    rect(X,px2+2,y+6,54,30,P.dstone);
    dither(X,px2+4,y+8,50,26,P.rust,P.dstone,.4);

    // Roof
    rect(X,px2,y+2,58,2,'#1a1a1a');

    // Windows (6, some broken)
    for(let i=0;i<6;i++){
      const wx2=px2+4+i*9;
      rect(X,wx2,y+10,7,8,'#0a0a0a');
      rect(X,wx2,y+10,7,1,P.rust);
      rect(X,wx2,y+17,7,1,P.rust);
      // Some broken — glass shards
      if(hash(i,0,11)>.5){
        px(X,wx2+2,y+13,P.lgrey);
        px(X,wx2+5,y+15,P.lgrey);
      }
      // One window — someone still looking out (window 2)
      if(i===2){
        X.fillStyle='#050505';
        rect(X,wx2+2,y+12,3,4);
        px(X,wx2+3,y+13,P.bone); // face blur
      }
      // Window frame divider
      rect(X,wx2+3,y+10,1,8,P.rust);
    }

    // Door in middle
    rect(X,px2+26,y+18,8,18,'#0a0a0a');
    rect(X,px2+27,y+19,6,16,'#1a1a1a');
    // Door handle
    px(X,px2+32,y+27,P.amber);

    // "НИИЧАВО" stencil on side (faded)
    X.fillStyle='#1a0a06';
    rect(X,px2+40,y+30,1,2);rect(X,px2+42,y+30,1,2);rect(X,px2+44,y+30,1,2);
    rect(X,px2+46,y+30,1,2);rect(X,px2+48,y+30,1,2);

    // Passenger car wheels (4)
    for(let i=0;i<4;i++){
      const whX=px2+6+i*12;
      rect(X,whX,y+36,8,7,'#0a0a0a');
      rect(X,whX+1,y+37,6,5,'#1a1a1a');
      px(X,whX+3,y+39,P.dgrey);
      px(X,whX+4,y+39,P.dgrey);
    }

    // ── BROKEN RAILS ahead (rails end abruptly) ──
    rect(X,x+120,y+44,6,1,'#050202');
    rect(X,x+122,y+46,4,1,'#050202');
    // Jagged broken rail ends
    px(X,x+126,y+43,P.rust);
    px(X,x+127,y+44,P.rust);

    // ── GHOSTLY SMOKE trailing from stack (thick) ──
    for(let i=0;i<6;i++){
      const ghPh=((t*.003+i*.17)%1);
      const ghX=lx+14+Math.sin(i*2)*5-ghPh*8;
      const ghY=y-4-ghPh*20;
      X.globalAlpha=(1-ghPh)*.15;
      X.beginPath();X.arc(ghX,ghY,3+i*.5,0,Math.PI*2);
      X.fillStyle='#3a3028';X.fill();
      X.globalAlpha=1;
    }

    // ── RED LANTERN hanging from last wagon ──
    rect(X,x+116,y+18,2,3,P.dgrey);
    rect(X,x+115,y+21,4,3,'#1a0a06');
    if(Math.sin(t*.008)>.3){
      px(X,x+116,y+22,P.f2);
      px(X,x+117,y+22,P.f2);
      // Red glow
      X.globalAlpha=.15;
      X.beginPath();X.arc(x+117,y+22,8,0,Math.PI*2);
      X.fillStyle='#6b0f1a';X.fill();
      X.globalAlpha=1;
    }
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
    px(X,x+53,y+10,'#fff');

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
    rect(X,x+52,y+16,2,1,'#1b1464'); // vault suit blue
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
    const packColors=['#6b0f1a','#1b1464','#4a1a8a','#2a6a1a','#8a6408'];
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
    rect(X,x+12,y+36,2,4,'#4a7fb5');
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
    rect(X,x+20,y+49,3,2,'#1b1464');
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
      px(X,rx,ry,['#6b0f1a','#daa520','#4a7fb5','#1b1464','#4a0a12','#8a6408'][i]);
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

export function draw_church(x, y) {
    // LOD: far player sees simplified silhouette
    if(!playerNearLoc(locs.find(l=>l.id==='church'),350)){
      drawBuildingSilhouette(x,y+8,100,78,P.dgrey);
      // Bell tower silhouette
      rect(X,x+6,y-25,20,40,P.dstone);
      rect(X,x+10,y-30,12,10,P.dgrey);
      return;
    }
    // ═══ GOTHIC CATHEDRAL — massive, detailed ═══
    // Ground shadow
    X.globalAlpha=.35;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+52,y+90,60,5,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── MAIN NAVE BODY — 100x75 stone structure ──
    rect(X,x,y+8,100,78,P.stone);
    // Individual stone blocks for texture
    for(let row=0;row<16;row++){
      for(let col=0;col<11;col++){
        const bx=x+1+col*9+(row%2?4:0);
        const by=y+9+row*5;
        const bw=8-((row+col)%4===0?1:0);
        const shade=hash(col,row+x,11)>.5?P.dstone:P.stone;
        rect(X,bx,by,bw,4,shade);
        rect(X,bx,by+4,bw,1,'#1a1a22');
      }
    }
    // Moss patches (more this time, thicker)
    for(let i=0;i<10;i++){
      const mx_=x+3+hash(i,x,22)*92;
      const my_=y+8+hash(i,y,33)*78;
      rect(X,mx_,my_,3+hash(i,0,44)*5,2,P.dtoxic);
      if(hash(i,0,55)>.5)px(X,mx_+1,my_-1,P.toxic);
      if(hash(i,0,66)>.7)px(X,mx_+2,my_+1,P.btoxic);
    }

    // ── FLYING BUTTRESSES on left side ──
    // Support arches from ground up
    for(let i=0;i<3;i++){
      const bY=y+28+i*20;
      // Main buttress pier (sticking out from wall)
      rect(X,x-6,bY,7,12,P.dstone);
      rect(X,x-5,bY+1,5,10,P.stone);
      // Arch connecting to wall
      X.strokeStyle=P.dstone;X.lineWidth=2;
      X.beginPath();
      X.moveTo(x-6,bY);
      X.quadraticCurveTo(x-2,bY-6,x+2,bY-2);
      X.stroke();
      X.lineWidth=1;
      // Moss on buttress
      if(i%2)rect(X,x-4,bY+8,3,2,P.dtoxic);
    }

    // ── FRONT FACADE with ROSE WINDOW ──
    // Slightly taller front section
    rect(X,x+36,y+2,28,8,P.stone);
    rect(X,x+37,y+3,26,7,P.dstone);
    // ROSE WINDOW — circular stained glass
    const roseX=x+50,roseY=y+18;
    // Outer stone ring
    X.fillStyle=P.stone;
    X.beginPath();X.arc(roseX,roseY,11,0,Math.PI*2);X.fill();
    X.fillStyle=P.dstone;
    X.beginPath();X.arc(roseX,roseY,10,0,Math.PI*2);X.fill();
    // Dark inner void
    X.fillStyle='#040408';
    X.beginPath();X.arc(roseX,roseY,9,0,Math.PI*2);X.fill();
    // Radial stone spokes (6 spokes)
    X.strokeStyle=P.dstone;X.lineWidth=1;
    for(let sp=0;sp<6;sp++){
      const a=sp/6*Math.PI*2;
      X.beginPath();
      X.moveTo(roseX,roseY);
      X.lineTo(roseX+Math.cos(a)*9,roseY+Math.sin(a)*9);
      X.stroke();
    }
    // Inner circle
    X.fillStyle=P.dstone;
    X.beginPath();X.arc(roseX,roseY,3,0,Math.PI*2);X.fill();
    // Stained glass panels — 6 colored triangular shards
    const roseColors=[P.crimson,P.indigo,P.gold,P.celestial,P.volcanic,'#8a5aaa'];
    for(let sp=0;sp<6;sp++){
      const a=sp/6*Math.PI*2+Math.PI/6;
      const gx=roseX+Math.cos(a)*5;
      const gy=roseY+Math.sin(a)*5;
      X.globalAlpha=.55+.15*Math.sin(t*.004+sp);
      rect(X,gx-1,gy-1,2,2,roseColors[sp]);
      X.globalAlpha=.25;
      rect(X,gx-2,gy-2,4,4,roseColors[sp]);
      X.globalAlpha=1;
    }
    // Center glass piece (gold)
    X.globalAlpha=.7+.2*Math.sin(t*.005);
    px(X,roseX,roseY,P.gold);
    X.globalAlpha=1;
    // Rose window glow (at night)
    X.globalAlpha=.08+.04*Math.sin(t*.003);
    const rgl=X.createRadialGradient(roseX,roseY,5,roseX,roseY,28);
    rgl.addColorStop(0,'rgba(218,165,32,.5)');
    rgl.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=rgl;X.fillRect(roseX-28,roseY-28,56,56);
    X.globalAlpha=1;

    // ── 4 GOTHIC POINTED-ARCH WINDOWS along the nave ──
    for(let i=0;i<4;i++){
      const wx=x+4+i*22,wy=y+36;
      // Deep black interior
      rect(X,wx,wy,16,32,'#040408');
      // Pointed arch top
      for(let a=0;a<8;a++){
        const archY=wy-1-Math.abs(4-a)*.9;
        rect(X,wx+a*2,archY,2,2,P.stone);
      }
      // Stone frame
      rect(X,wx-1,wy,2,32,P.stone);
      rect(X,wx+15,wy,2,32,P.stone);
      // Mullion (vertical divider)
      rect(X,wx+7,wy+3,2,26,P.dstone);
      // Horizontal transoms
      rect(X,wx+1,wy+11,14,1,P.dstone);
      rect(X,wx+1,wy+20,14,1,P.dstone);
      // Tracery decoration
      rect(X,wx+4,wy+2,8,1,P.dstone);
      rect(X,wx+6,wy,4,1,P.dstone);
      // Stained glass fragments (more this time)
      const glassColors=[P.crimson,P.indigo,P.gold,P.celestial,P.volcanic,'#8a5aaa'];
      for(let g=0;g<10;g++){
        if(hash(g,i+x,66)>.3){
          const gx=wx+2+hash(g,i,77)*12;
          const gy=wy+4+hash(g,i,88)*22;
          const gc=glassColors[Math.floor(hash(g,i,99)*glassColors.length)];
          rect(X,gx,gy,2,3,gc);
          // Glow at night
          X.globalAlpha=.06+.03*Math.sin(t*.003+g);
          rect(X,gx-1,gy-1,4,5,gc);
          X.globalAlpha=1;
        }
      }
    }

    // ── MAIN DOOR — heavy Gothic wooden ──
    // Pointed arch doorway
    rect(X,x+42,y+54,18,36,'#0a0808');
    rect(X,x+41,y+51,20,3,P.stone);
    // Pointed arch top
    for(let a=0;a<10;a++){
      const archY=y+51-Math.abs(5-a)*.8;
      rect(X,x+41+a*2,archY,2,2,P.stone);
    }
    // Door panels (thick wood)
    rect(X,x+43,y+56,6,32,P.dwood);
    rect(X,x+44,y+57,4,30,'#2a1a08');
    rect(X,x+52,y+56,6,32,P.dwood);
    rect(X,x+53,y+57,4,30,'#2a1a08');
    // Door gap ajar
    rect(X,x+50,y+56,2,32,'#020204');
    // Iron hinges
    rect(X,x+43,y+60,6,1,P.dgrey);
    rect(X,x+43,y+72,6,1,P.dgrey);
    rect(X,x+43,y+84,6,1,P.dgrey);
    rect(X,x+53,y+60,5,1,P.dgrey);
    rect(X,x+53,y+72,5,1,P.dgrey);
    rect(X,x+53,y+84,5,1,P.dgrey);
    // Iron door ring
    X.fillStyle=P.ash;
    X.beginPath();X.arc(x+48,y+74,2,0,Math.PI*2);X.stroke();
    // Steps leading up
    rect(X,x+38,y+88,24,2,P.dstone);
    rect(X,x+36,y+90,28,2,P.dstone);

    // Interior visible through door gap
    for(let fy=0;fy<6;fy++){
      rect(X,x+44,y+78+fy*2,12,1,fy%2?'#0e0e14':'#080810');
    }

    // ── BELL TOWER on the right — taller, more imposing ──
    rect(X,x+86,y-35,20,45,P.stone);
    // Tower stones
    for(let row=0;row<11;row++){
      rect(X,x+87,y-34+row*4,18,3,hash(row,0,11)>.5?P.dstone:P.stone);
    }
    // Moss on tower
    rect(X,x+86,y,3,4,P.dtoxic);
    px(X,x+87,y+2,P.toxic);
    // BELFRY — large arched opening
    rect(X,x+89,y-28,14,10,'#040408');
    rect(X,x+95,y-28,2,10,P.dstone); // divider
    // Pointed arches on belfry openings
    for(let a=0;a<7;a++){
      rect(X,x+89+a*2,y-29-Math.abs(3-a)*.6,2,1,P.stone);
    }
    // Bell silhouette inside
    X.globalAlpha=.5;
    X.fillStyle='#3a3a42';
    X.beginPath();
    X.moveTo(x+91,y-25);X.lineTo(x+93,y-21);
    X.lineTo(x+100,y-21);X.lineTo(x+102,y-25);
    X.closePath();X.fill();
    // Bell rope hanging down
    rect(X,x+96,y-21,1,12,P.dbone);
    X.globalAlpha=1;
    // Second belfry (smaller, above first)
    rect(X,x+92,y-40,8,6,'#040408');
    rect(X,x+95,y-40,2,6,P.dstone);
    // Tower cap — stepped pyramid
    rect(X,x+84,y-42,24,3,P.dstone);
    rect(X,x+86,y-46,20,4,P.dstone);
    rect(X,x+88,y-50,16,4,P.stone);
    rect(X,x+90,y-54,12,4,P.dstone);
    rect(X,x+93,y-58,6,4,P.dgrey);
    // Spire
    rect(X,x+95,y-64,2,6,P.dgrey);
    // Cross on top
    rect(X,x+95,y-72,2,8,P.ash);
    rect(X,x+92,y-68,8,2,P.ash);
    // Highlight
    px(X,x+96,y-71,P.bone);

    // ── SECONDARY SPIRE on left (matches tower) ──
    rect(X,x-3,y-10,12,20,P.stone);
    for(let row=0;row<5;row++){
      rect(X,x-2,y-9+row*4,10,3,hash(row,1,22)>.5?P.dstone:P.stone);
    }
    // Small cap
    rect(X,x-4,y-13,14,3,P.dstone);
    rect(X,x-1,y-18,8,5,P.dstone);
    rect(X,x+1,y-22,4,4,P.dgrey);
    // Small cross
    rect(X,x+2,y-28,2,6,P.ash);
    rect(X,x,y-26,6,1,P.ash);

    // ── NO ROOF — exposed interior walls on top ──
    rect(X,x+2,y+8,82,2,P.dstone);
    // Collapsed roof beams sticking into the sky
    rect(X,x+8,y-10,3,20,P.dwood);
    rect(X,x+8,y-10,3,1,'#0a0604');
    rect(X,x+24,y-6,2,16,P.dwood);
    rect(X,x+70,y-4,3,14,P.dwood);
    rect(X,x+55,y+2,18,2,P.dwood); // fallen angled beam
    // Broken rafters
    for(let i=0;i<8;i++){
      rect(X,x+12+i*10,y+4,2,3,'#1a0e06');
    }

    // ── ALTAR visible through the main door ──
    rect(X,x+44,y+70,12,6,P.lstone);
    rect(X,x+45,y+68,10,3,P.stone);
    // Carved cross front
    rect(X,x+49,y+71,2,4,P.ash);
    rect(X,x+48,y+72,4,1,P.ash);
    // Black notebook on altar
    rect(X,x+46,y+66,6,3,'#0a0a0a');
    rect(X,x+46,y+66,6,1,'#1a1a1a');
    // Candle next to notebook
    rect(X,x+53,y+63,2,6,P.bone);
    const cf=t*.03;
    const flx=x+53+Math.sin(cf)*1;
    px(X,flx,y+61,P.f2);
    px(X,flx+1,y+62,P.f1);
    // Candle light pool
    X.globalAlpha=.05+.03*Math.sin(cf);
    const cg=X.createRadialGradient(x+54,y+63,0,x+54,y+63,14);
    cg.addColorStop(0,'rgba(218,165,32,.8)');
    cg.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=cg;X.fillRect(x+40,y+49,28,28);
    X.globalAlpha=1;

    // ── KNEELING FIGURE before altar (visible through door) ──
    const figBrth=Math.sin(t*.006)*.3;
    rect(X,x+46,y+76+figBrth,5,8,'#050505');
    rect(X,x+46,y+74+figBrth,5,3,'#0a0a0a');
    rect(X,x+47,y+79+figBrth,3,1,'#1a0a06');

    // ── PEWS visible through door ──
    for(let i=0;i<4;i++){
      rect(X,x+44,y+84+i*2,12,1,'#1a0e06');
      rect(X,x+50,y+84+i*2,1,2,'#1a0e06');
    }

    // ── BLOOD STAINS on altar ──
    X.fillStyle='#3a0608';
    rect(X,x+47,y+69,3,1);
    px(X,x+50,y+70,'#3a0608');
    px(X,x+48,y+71,'#1a0404');
    rect(X,x+48,y+72,1,2,'#3a0608');

    // ── GARGOYLES (stone beast heads jutting from top corners) ──
    // Left gargoyle
    rect(X,x-2,y+12,6,5,P.dstone);
    rect(X,x-3,y+13,7,3,P.stone);
    // Eyes
    px(X,x-1,y+14,'#0a0a0e');
    px(X,x+1,y+14,'#0a0a0e');
    // Fangs
    px(X,x,y+16,P.bone);
    px(X,x+2,y+16,P.bone);
    // Right gargoyle
    rect(X,x+96,y+14,6,5,P.dstone);
    rect(X,x+97,y+15,6,3,P.stone);
    px(X,x+99,y+16,'#0a0a0e');
    px(X,x+101,y+16,'#0a0a0e');
    px(X,x+99,y+18,P.bone);
    px(X,x+101,y+18,P.bone);

    // ── CROWS on the cross and belfry ──
    if(t%400<380){
      rect(X,x+94,y-73,2,1,'#050505');
      px(X,x+96,y-73,'#050505');
    }
    rect(X,x+88,y-29,2,1,'#050505');
    px(X,x+90,y-29,'#050505');
    // Occasional crow flight
    if(t%600<30){
      const flyPh=(t%600)/30;
      X.globalAlpha=1-flyPh;
      px(X,x+100+flyPh*15,y-40-flyPh*10,'#050505');
      px(X,x+101+flyPh*15,y-40-flyPh*10,'#050505');
      X.globalAlpha=1;
    }

    // ── ALCOVE CANDLES along the interior walls ──
    for(let i=0;i<6;i++){
      const cx_=x+8+i*15;
      const cy_=y+30;
      rect(X,cx_,cy_,1,3,P.bone);
      const fl=Math.sin(t*.04+i*2)*.5;
      px(X,cx_+fl,cy_-1,P.f2);
      X.globalAlpha=.06+.03*Math.sin(t*.03+i);
      const cgl=X.createRadialGradient(cx_,cy_,0,cx_,cy_,7);
      cgl.addColorStop(0,'rgba(218,165,32,1)');
      cgl.addColorStop(1,'rgba(0,0,0,0)');
      X.fillStyle=cgl;X.fillRect(cx_-7,cy_-7,14,14);
      X.globalAlpha=1;
    }

    // ── BROKEN CHANDELIER hanging from a beam ──
    rect(X,x+48,y+14,1,20,'#1a1410');
    rect(X,x+42,y+34,14,1,P.damber);
    rect(X,x+42,y+34,1,4,P.damber);
    rect(X,x+55,y+34,1,4,P.damber);
    rect(X,x+48,y+36,1,3,P.damber);
    px(X,x+43,y+33,P.f2);
    px(X,x+54,y+33,P.damber);

    // ── IVY climbing left wall ──
    for(let i=0;i<12;i++){
      const iy=y+84-i*7-hash(i,0,33)*3;
      const ix=x-1+hash(i,0,44)*4;
      rect(X,ix,iy,2,3,P.dtoxic);
      if(i%2)px(X,ix+1,iy-1,P.toxic);
    }

    // ── GRAVESTONES at base of church (outside, right side) ──
    for(let i=0;i<6;i++){
      const gx_=x+106+i*9;
      const gy_=y+80+hash(i,x,11)*8;
      rect(X,gx_,gy_-10,6,10,P.stone);
      rect(X,gx_+1,gy_-9,4,1,P.lstone);
      // Cross etching
      rect(X,gx_+2,gy_-6,2,3,P.dstone);
      if(hash(i,0,22)>.6)rect(X,gx_+1,gy_-11,5,2,P.dstone);
    }

    // ── LATIN INSCRIPTION above door (pixel-simulated) ──
    X.fillStyle='#1a0e06';
    for(let i=0;i<16;i++){
      rect(X,x+40+i*1,y+51,1,1);
    }
    // Red scratch "А шо, были?"
    X.fillStyle='#6b0f1a';
    rect(X,x+44,y+53,1,1);
    px(X,x+46,y+53,'#6b0f1a');
    px(X,x+48,y+53,'#6b0f1a');
    px(X,x+50,y+53,'#6b0f1a');
    px(X,x+52,y+53,'#6b0f1a');

    // ── QR CODE on the right wall ──
    const qrX=x+78,qrY=y+60;
    rect(X,qrX,qrY,8,8,P.bone);
    for(let qy=0;qy<6;qy++)for(let qx=0;qx<6;qx++){
      if(hash(qx,qy,77)>.4)rect(X,qrX+1+qx,qrY+1+qy,1,1,'#0a0a0e');
    }
    rect(X,qrX+1,qrY+1,2,2,'#0a0a0e');
    rect(X,qrX+5,qrY+1,2,2,'#0a0a0e');
    rect(X,qrX+1,qrY+5,2,2,'#0a0a0e');

    // ── PIGEON FEATHER near door ──
    px(X,x+64,y+86,P.bone);
    px(X,x+65,y+86,P.dbone);
    px(X,x+64,y+87,P.dbone);
}

export function draw_fountain(x, y) {
    // ═══ FOUNTAIN — HEADLESS ANGEL / PLAGUE MEMORIAL ═══
    // Shadow
    X.globalAlpha=.3;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+25,y+42,28,4,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── OUTER BASIN — three-tier stone ring ──
    // Outermost ring
    X.fillStyle=P.dstone;
    X.beginPath();X.ellipse(x+25,y+32,28,13,0,0,Math.PI*2);X.fill();
    X.fillStyle=P.stone;
    X.beginPath();X.ellipse(x+25,y+32,26,12,0,0,Math.PI*2);X.fill();
    // Stone block segments on rim
    for(let i=0;i<16;i++){
      const ang=i/16*Math.PI*2;
      const bx=x+25+Math.cos(ang)*26;
      const by=y+32+Math.sin(ang)*12;
      rect(X,bx-1,by-1,2,2,i%2?P.lstone:P.dstone);
    }
    // Inner basin
    X.fillStyle=P.dstone;
    X.beginPath();X.ellipse(x+25,y+32,22,10,0,0,Math.PI*2);X.fill();

    // Cracks in basin
    X.fillStyle='#0a0a0e';
    rect(X,x+5,y+28,6,1);
    rect(X,x+8,y+29,2,2);
    rect(X,x+40,y+35,5,1);
    rect(X,x+42,y+36,2,1);

    // ── TOXIC JIJA inside ──
    X.globalAlpha=.7;
    X.fillStyle=P.dtoxic;
    X.beginPath();X.ellipse(x+25,y+33,20,8,0,0,Math.PI*2);X.fill();
    X.fillStyle=P.toxic;
    X.beginPath();X.ellipse(x+25,y+33,18,7,0,0,Math.PI*2);X.fill();
    X.globalAlpha=1;
    // Ripples on the surface
    for(let i=0;i<4;i++){
      const rPhase=((t*.01+i*.25)%1);
      X.globalAlpha=(1-rPhase)*.3;
      X.strokeStyle=P.btoxic;X.lineWidth=1;
      X.beginPath();
      X.ellipse(x+25,y+33,4+rPhase*14,1+rPhase*5,0,0,Math.PI*2);
      X.stroke();
      X.globalAlpha=1;
    }
    // Floating bubbles
    for(let i=0;i<4;i++){
      if(hash(i,Math.floor(t*.005),55)>.5){
        const bx=x+12+hash(i,0,11)*26;
        const by=y+30+hash(i,0,22)*6;
        px(X,bx,by,P.btoxic);
      }
    }

    // ── PEDESTAL ──
    rect(X,x+19,y+26,12,6,P.stone);
    rect(X,x+20,y+27,10,4,P.lstone);
    // Carved border
    rect(X,x+19,y+30,12,1,P.dstone);
    // Weathered "ПОМНИ" text
    X.fillStyle='#1a1a22';
    rect(X,x+21,y+28,1,2);rect(X,x+23,y+28,1,2);rect(X,x+22,y+29,1,1); // П
    rect(X,x+25,y+28,1,2);rect(X,x+26,y+28,1,1);rect(X,x+26,y+29,1,1); // О fragment
    rect(X,x+28,y+28,1,2);rect(X,x+29,y+29,1,1); // М fragment

    // ── HEADLESS ANGEL STATUE ──
    // Draped robe (wider at base)
    X.fillStyle=P.stone;
    X.beginPath();
    X.moveTo(x+20,y+26);
    X.lineTo(x+22,y+10);
    X.lineTo(x+28,y+10);
    X.lineTo(x+30,y+26);
    X.closePath();X.fill();
    // Fold highlights
    X.fillStyle=P.lstone;
    rect(X,x+22,y+12,1,14);
    rect(X,x+25,y+12,1,14);
    rect(X,x+28,y+12,1,14);
    // Shadow folds
    X.fillStyle=P.dstone;
    rect(X,x+23,y+14,1,10);
    rect(X,x+27,y+14,1,10);

    // ── BROKEN WINGS (half missing, jagged edges) ──
    // Left wing — mostly intact
    X.fillStyle=P.stone;
    X.beginPath();
    X.moveTo(x+22,y+10);
    X.lineTo(x+14,y+8);
    X.lineTo(x+10,y+12);
    X.lineTo(x+13,y+16);
    X.lineTo(x+20,y+14);
    X.closePath();X.fill();
    // Wing feather details
    X.fillStyle=P.dstone;
    rect(X,x+12,y+10,5,1);
    rect(X,x+13,y+12,4,1);
    rect(X,x+15,y+14,3,1);
    // Cracks on left wing
    X.fillStyle='#0a0a0e';
    rect(X,x+13,y+11,1,3);

    // Right wing — BROKEN OFF (just stub with jagged edge)
    X.fillStyle=P.stone;
    X.beginPath();
    X.moveTo(x+28,y+10);
    X.lineTo(x+32,y+9);
    X.lineTo(x+34,y+12);
    X.lineTo(x+30,y+14);
    X.closePath();X.fill();
    // Jagged break line
    X.fillStyle='#0a0a0e';
    rect(X,x+34,y+10,1,1);
    rect(X,x+35,y+11,1,1);
    rect(X,x+33,y+13,2,1);
    // Rubble on ground from broken wing
    rect(X,x+38,y+30,3,2,P.stone);
    rect(X,x+40,y+29,2,1,P.dstone);

    // ── BROKEN ARMS ──
    // Left arm — holding cup forever
    rect(X,x+17,y+14,5,3,P.stone);
    rect(X,x+17,y+14,5,1,P.lstone);
    // Cup (broken)
    rect(X,x+15,y+15,2,3,P.dstone);
    // Right arm — stub only
    rect(X,x+28,y+14,2,3,P.stone);
    // Broken piece on ground
    rect(X,x+34,y+20,3,2,P.stone);

    // ── NECK (no head, just jagged break) ──
    rect(X,x+24,y+8,3,2,P.stone);
    X.fillStyle='#0a0a0e';
    rect(X,x+24,y+7,1,1);
    rect(X,x+26,y+7,1,1);
    // Bloodstain trail down the robe (dried)
    X.fillStyle='#3a0608';
    rect(X,x+25,y+9,1,4);
    rect(X,x+25,y+14,1,2);

    // ── FALLEN HEAD lying in the basin ──
    X.fillStyle=P.stone;
    X.beginPath();X.ellipse(x+38,y+34,3,2,0,0,Math.PI*2);X.fill();
    X.fillStyle=P.lstone;
    X.beginPath();X.ellipse(x+38,y+34,2,1.5,0,0,Math.PI*2);X.fill();
    // Eye sockets
    px(X,x+37,y+34,'#0a0a0e');
    px(X,x+39,y+34,'#0a0a0e');
    // Cracked nose
    px(X,x+38,y+35,'#1a1a22');

    // ── CRYING FACE CARVING visible on pedestal front ──
    X.fillStyle='#0a0a0e';
    // Two eyes
    px(X,x+22,y+25,'#0a0a0e');
    px(X,x+27,y+25,'#0a0a0e');
    // Down-curve mouth
    rect(X,x+23,y+27,3,1,'#0a0a0e');
    px(X,x+22,y+26,'#0a0a0e');
    px(X,x+26,y+26,'#0a0a0e');

    // ── DEAD RAT (Camus plague reference) ──
    rect(X,x+8,y+38,5,2,'#0a0a0e');
    rect(X,x+9,y+37,3,1,'#0a0a0e');
    // Tail
    rect(X,x+12,y+40,3,1,'#0a0a0e');
    // Dr. Rieux's hat on the rat (tiny)
    rect(X,x+9,y+36,3,1,'#1a0a06');
    rect(X,x+10,y+35,1,1,'#1a0a06');

    // ── CANDLES around the basin (mourners' offerings) ──
    for(let i=0;i<5;i++){
      const ang=(i/5)*Math.PI*2+Math.PI/2;
      const cx_=x+25+Math.cos(ang)*30;
      const cy_=y+32+Math.sin(ang)*14;
      rect(X,cx_,cy_-3,1,3,P.bone);
      // Some still burning
      if(hash(i,0,11)>.5){
        const fl=Math.sin(t*.04+i*2)*.4;
        px(X,cx_+fl,cy_-4,P.f2);
        // Tiny glow
        X.globalAlpha=.1;
        X.beginPath();X.arc(cx_,cy_-3,5,0,Math.PI*2);
        X.fillStyle=P.amber;X.fill();
        X.globalAlpha=1;
      }
    }

    // ── DRIED FLOWERS (once offerings) ──
    rect(X,x+32,y+36,2,1,'#3a0a08');
    rect(X,x+33,y+37,1,1,'#1a0404');
    rect(X,x+16,y+36,1,2,'#2a1806');
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
      rect(X,fogX,fogY,8+i,2,'#5a7a9a');
      X.globalAlpha=1;
    }
    // Extra cold breath at step level
    if(t%40<20){
      X.globalAlpha=.1;
      rect(X,x+8,y+14,20,3,'#aaccff');
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
    for(let i=0;i<12;i++){const fx=x+8+Math.sin(f+i*.9)*8;const fy=y+8-i*2-Math.abs(Math.sin(f*1.4+i*.7))*4;const s=Math.max(1,6-Math.floor(i*.4));X.globalAlpha=1-i*.06;rect(X,fx,fy,s,s,[P.f3,P.f3,P.f1,P.f1,P.f4,P.f4,P.f2,P.f2,P.f2,P.f2,'#ffeecc','#fff'][i]);};X.globalAlpha=1;
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
        px(X,x+3,y-13,'#ffffff');
        px(X,x+3,y-9,'#ffffff');
        px(X,x+3,y-5,'#ffffff');
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
    X.fillStyle='#4a7fb5';X.font='3px "Press Start 2P"';
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
          px(X,b.bx+4,b.by+3,'#ffffff');
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
          px(X,b.bx+3,b.by+2,'#ffcc00');
          px(X,b.bx+5,b.by+3,P.crimson); // mouth
          px(X,b.bx+6,b.by+2,'#1a8a1a'); // tree
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
    X.fillStyle='#4a7fb5';
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

export function draw_crater(x, y) {
    // ═══ CRATER — ultra-light animated overlay ═══
    // Molten center pulse — simple rects, no gradient
    const pulse=Math.sin(t*.006);
    if(pulse>0){
      X.globalAlpha=pulse*.2;
      rect(X,x+20,y+14,10,10,'#ff6414');
      rect(X,x+22,y+16,6,6,'#8b0000');
      X.globalAlpha=1;
    }
    // Hot center dot
    if(Math.sin(t*.02)>.3){
      px(X,x+25,y+19,P.f2);px(X,x+24,y+19,P.f1);px(X,x+26,y+19,P.f1);
    }
    // Heat shimmer — 3 instead of 7
    for(let i=0;i<3;i++){
      const hx=x+14+Math.sin(t*.01+i)*4+i*6;
      const hy=y+8+Math.sin(t*.015+i*1.3)*2;
      X.globalAlpha=.07;rect(X,hx,hy,2,1,P.f1);X.globalAlpha=1;
    }
    // Coin — simple, no gradient
    const coinX=x+45,coinY=y+11;
    X.globalAlpha=.4;rect(X,coinX-1,coinY+8,4,1,'#000');X.globalAlpha=1;
    rect(X,coinX-1,coinY+1,3,7,P.gold);
    rect(X,coinX,coinY+2,1,5,P.damber);
    px(X,coinX-1,coinY+3,'#ffeb99');
    // Embers — 2 instead of 4
    for(let i=0;i<2;i++){
      const ePh=((t*.012+i*.5)%1);
      X.globalAlpha=(1-ePh)*.6;
      px(X,x+25+Math.sin(t*.008+i*3)*6,y+17-ePh*14,P.f2);
      X.globalAlpha=1;
    }
}

export function draw_overpass(x, y) {
    // Dangling rebar animation
    for(let i=0;i<3;i++){
      const swing=Math.sin(t*.005+i*2)*2;
      const rx=x+78+i*4;
      const ry=y+8+Math.abs(swing);
      rect(X,rx,ry,1,8+i*2,P.rust);
    }
    // Dripping water from broken pipe
    if(t%90<20){
      const dropY=y+35+(t%90)*1.5;
      X.globalAlpha=.5;px(X,x+45,dropY,P.toxic);X.globalAlpha=1;
    }
}

export function draw_riverbed(x, y) {
    // Animated puddle reflection
    const shimmer=Math.sin(t*.004)*.3+.3;
    X.globalAlpha=shimmer*.15;
    X.fillStyle='#4466aa';
    X.beginPath();X.ellipse(x+30,y+15,12,4,0,0,Math.PI*2);X.fill();
    X.globalAlpha=1;
    // Occasional ripple
    if(t%120<30){
      const ripR=(t%120)*0.5;
      X.globalAlpha=.1*(1-(t%120)/30);
      X.strokeStyle='#6688cc';X.lineWidth=1;
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
      else if(gi%3===1)rect(X,apx+1,apy,3,1,'#1b1464');
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

export function draw_powerline(x, y) {
    // Animated spark on broken wire
    if(t%180<10){
      const sparkX=x+15+hash(t%180,0,1)*10;
      const sparkY=y+35+hash(t%180,0,2)*5;
      X.globalAlpha=.7;
      px(X,sparkX,sparkY,P.f2);px(X,sparkX+1,sparkY-1,'#fff');
      X.globalAlpha=.3;
      X.beginPath();X.arc(sparkX,sparkY,4,0,Math.PI*2);X.fillStyle=P.amber;X.fill();
      X.globalAlpha=1;
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
    // ── «АННУШКА УЖЕ РАЗЛИЛА» — white paint on brick wall by entrance ──
    X.globalAlpha=.85;X.fillStyle=P.bone;X.font='4px "Press Start 2P"';
    X.fillText('АННУШКА',x+52,y+bldH-22);
    X.fillText('УЖЕ РАЗЛИЛА',x+46,y+bldH-17);
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
    px(X,prX+2+prFl*.3,prY-2,'#4a7fb5');
    px(X,prX+3+prFl*.3,prY-3,'#8acfff');
    px(X,prX+3+prFl*.3,prY-2,'#4a7fb5');
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
    rect(X,x+57+lsw*.5,y+30,2,2,'#1b1464');
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
    rect(X,x+71,y+5,12,3,'#1b1464');
    rect(X,x+71,y+5,12,1,'#2a2478');
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
    px(X,x+65,y+bldH-7,'#4a7fb5');
    // Dangling wire
    rect(X,x+65,y+bldH-4,1,3,'#1a1a22');
    // Glow from within (TV flicker blue)
    if(t%40<20){
      X.globalAlpha=.3;
      X.fillStyle='#4a7fb5';
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
    rect(X,x+50,y+3,4,2,'#4a7fb5');
    rect(X,x+54,y+3,2,1,'#1a3a6a'); // torn edge
    px(X,x+56,y+4,'#4a7fb5');

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
      X.globalAlpha=.6;px(X,x+14,y+5,'#fff');px(X,x+20,y+5,'#fff');X.globalAlpha=1;
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
    X.fillStyle='#4a7fb5';
    X.beginPath();
    X.moveTo(x-2,y+20);
    X.lineTo(x+1,y+17);
    X.lineTo(x+1,y+23);
    X.closePath();X.fill();
    // Rainbow refraction line
    X.strokeStyle='#8acfff';X.lineWidth=1;
    X.beginPath();X.moveTo(x+1,y+20);X.lineTo(x+4,y+19);X.stroke();
    X.strokeStyle='#a8ffcf';
    X.beginPath();X.moveTo(x+1,y+20);X.lineTo(x+4,y+20);X.stroke();
    X.strokeStyle='#ffa8cf';
    X.beginPath();X.moveTo(x+1,y+20);X.lineTo(x+4,y+21);X.stroke();
    X.lineWidth=1;

    // NSA seal (tiny circle with eagle)
    rect(X,x-3,y+27,4,4,'#0a1a4a');
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

export function draw_nocturnal(x, y) {
    // Silent cat sitting in the black sand — barely visible against the dark
    // NPC drawn separately
    // Big circular patch of scorched black sand
    for(let dy=0;dy<90;dy+=2){
      for(let dx=0;dx<60;dx+=2){
        const cdx=(dx-30)/32,cdy=(dy-45)/45;
        const d=Math.sqrt(cdx*cdx+cdy*cdy);
        if(d<1){
          const n=hash(x+dx,y+dy,55);
          const c=n>.65?'#0a0a10':(n>.35?'#050508':'#020204');
          rect(X,x+dx,y+dy,2,2,c);
        }
      }
    }
    // Deeper scorch ring around
    for(let a=0;a<32;a++){
      const ang=a/32*Math.PI*2;
      const rx=x+30+Math.cos(ang)*28;
      const ry=y+45+Math.sin(ang)*42;
      px(X,rx,ry,'#0a0604');
      if(hash(a,0,11)>.5)px(X,rx+1,ry,'#0a0604');
    }

    // ── SCATTERED SKELETAL GRASS ──
    for(let i=0;i<22;i++){
      const gx=x+5+hash(i,0,11)*50;
      const gy=y+15+hash(i,0,22)*70;
      rect(X,gx,gy,1,3,'#1a1410');
      px(X,gx,gy-1,'#2a1810');
      // Slight sway on tallest
      if(hash(i,0,33)>.7){
        rect(X,gx,gy-2,1,2,'#2a1810');
      }
    }

    // ── SCATTERED SKULLS AND BONES ──
    for(let i=0;i<7;i++){
      const bx=x+8+hash(i,0,33)*45;
      const by=y+25+hash(i,0,44)*55;
      rect(X,bx,by,4,3,P.bone);
      px(X,bx+1,by+1,P.d2);
      px(X,bx+2,by+1,P.d2);
      rect(X,bx+1,by+2,2,1,P.d2);
      // Bone fragments nearby
      rect(X,bx+5,by+1,3,1,P.dbone);
      px(X,bx+9,by,P.bone);
    }

    // ── DISTANT FIRE GLOW on horizon ──
    X.globalAlpha=.14+.05*Math.sin(t*.003);
    const fireGrad=X.createLinearGradient(x,y+88,x,y+100);
    fireGrad.addColorStop(0,'rgba(0,0,0,0)');
    fireGrad.addColorStop(1,'rgba(139,0,0,.6)');
    X.fillStyle=fireGrad;
    X.fillRect(x-5,y+88,70,15);
    X.globalAlpha=1;
    // Tiny distant fire spots
    for(let i=0;i<4;i++){
      if(Math.sin(t*.005+i)>.3){
        X.globalAlpha=.4;
        px(X,x+10+i*14,y+96,P.f1);
        X.globalAlpha=1;
      }
    }

    // ── AMBIENT COLD MIST rising ──
    for(let i=0;i<5;i++){
      const mPhase=((t*.005+i*.2)%1);
      const mx=x+8+hash(i,0,55)*44;
      const my=y+75-mPhase*50;
      X.globalAlpha=(1-mPhase)*.22;
      rect(X,mx,my,2+i%3,1,'#4a4a60');
      X.globalAlpha=1;
    }

    // Nocturnal moved to nocturnal_home

    // ── TRAIL OF BLACK SAND leading AWAY (pile grown over years) ──
    for(let i=0;i<5;i++){
      const sx=x+50+i*3;
      const sy=y+80+Math.sin(i*.5)*1;
      rect(X,sx,sy,2+i%2,1,'#050508');
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
      if(hash(i,0,33)>.6)px(X,mx,my-1,'#6aaa4a');
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

    // ── OCCASIONAL WHISPER TEXT ──
    if(t%500<40){
      const whPh=(t%500)/40;
      X.globalAlpha=(1-whPh)*.35;
      X.fillStyle=P.toxic;X.font='5px "Press Start 2P"';
      X.textAlign='center';
      X.fillText('мох помнит',x+27,y+10-whPh*4);
      X.textAlign='left';
      X.globalAlpha=1;
    }

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

export function draw_theater(x, y) {
    // ── HILL SLOPE ──
    X.globalAlpha=.3;X.fillStyle='#000';
    X.beginPath();X.ellipse(x+40,y+58,42,4,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

    // ── SEMI-CIRCLE STONE TIERS (back to front) ──
    for(let tier=0;tier<6;tier++){
      const ty=y+8+tier*5;
      const tw=70-tier*8;
      const tx=x+5+tier*4;
      // Stone bench
      const shade=22+tier*3;
      rect(X,tx,ty,tw,2,`rgb(${shade+8},${shade+5},${shade+2})`);
      rect(X,tx,ty+2,tw,1,`rgb(${shade-2},${shade-4},${shade-6})`);
      // Bench seam markings
      for(let i=0;i<8;i++){
        if(hash(i,tier,11)>.5)rect(X,tx+2+i*8,ty,1,2,'#0a0a0e');
      }
      // Moss patches on benches
      if(hash(tier,0,22)>.4){
        rect(X,tx+5+hash(tier,0,33)*tw*.8,ty,3,1,P.dtoxic);
        if(hash(tier,0,44)>.5)px(X,tx+6,ty-1,P.toxic);
      }
    }

    // ── SCATTERED BONES on benches (where bodies sat) ──
    for(let i=0;i<5;i++){
      const bx=x+15+hash(i,0,11)*50;
      const by=y+10+hash(i,0,22)*22;
      rect(X,bx,by,3,1,P.bone);
      if(hash(i,0,33)>.5)px(X,bx+3,by,P.dbone);
    }

    // ── ROUND STAGE in center-bottom ──
    X.fillStyle=P.dstone;
    X.beginPath();X.ellipse(x+40,y+50,18,5,0,0,Math.PI*2);X.fill();
    X.fillStyle=P.stone;
    X.beginPath();X.ellipse(x+40,y+50,16,4,0,0,Math.PI*2);X.fill();
    // Stage edge
    X.strokeStyle='#0a0a0e';X.lineWidth=1;
    X.beginPath();X.ellipse(x+40,y+50,16,4,0,0,Math.PI*2);X.stroke();

    // ── 4 GHOST SILHOUETTES on stage performing ──
    // Ghost 1 — JESTER (laughing) far left
    const g1bob=Math.sin(t*.02)*.5;
    X.globalAlpha=.4+.1*Math.sin(t*.03);
    rect(X,x+25,y+44+g1bob,3,7,'#3a2828');
    rect(X,x+24,y+42+g1bob,5,3,'#3a2828');
    // Hat horns
    px(X,x+24,y+41+g1bob,'#3a2828');
    px(X,x+27,y+41+g1bob,'#3a2828');
    X.globalAlpha=1;

    // Ghost 2 — SOL (burning) center-left
    const g2pulse=.4+.1*Math.sin(t*.025);
    X.globalAlpha=g2pulse;
    rect(X,x+33,y+43,3,8,'#5a4028');
    // Sun head
    rect(X,x+32,y+40,5,4,'#5a4028');
    // Tiny rays
    px(X,x+31,y+41,'#5a4028');px(X,x+37,y+41,'#5a4028');
    X.globalAlpha=1;

    // Ghost 3 — ELDER (sitting) center-right
    X.globalAlpha=.4+.05*Math.sin(t*.015);
    rect(X,x+42,y+45,4,6,'#3a3a4a');
    rect(X,x+41,y+43,6,3,'#3a3a4a'); // hood
    X.globalAlpha=1;

    // Ghost 4 — NOCTURNAL (silent) far right
    const g4f=.5+.15*Math.sin(t*.008);
    X.globalAlpha=g4f;
    rect(X,x+50,y+42,3,9,'#2a2a3a');
    // Crescent head
    rect(X,x+49,y+40,5,3,'#3a3a4a');
    px(X,x+49,y+39,'#5a5d62');
    px(X,x+53,y+39,'#5a5d62');
    X.globalAlpha=1;

    // ── PHANTOM SPOTLIGHT from above ──
    const slPulse=.06+.03*Math.sin(t*.01);
    X.globalAlpha=slPulse;
    const slGrad=X.createLinearGradient(x+40,y+10,x+40,y+50);
    slGrad.addColorStop(0,'rgba(218,165,32,1)');
    slGrad.addColorStop(.7,'rgba(218,165,32,.4)');
    slGrad.addColorStop(1,'rgba(0,0,0,0)');
    X.fillStyle=slGrad;
    // Cone shape
    X.beginPath();
    X.moveTo(x+38,y+10);
    X.lineTo(x+42,y+10);
    X.lineTo(x+50,y+50);
    X.lineTo(x+30,y+50);
    X.closePath();X.fill();
    X.globalAlpha=1;

    // Stage curtain remnants on sides
    rect(X,x+22,y+38,2,16,'#3a0a08');
    rect(X,x+56,y+38,2,16,'#3a0a08');
    // Tattered edges
    px(X,x+22,y+54,'#3a0a08');
    px(X,x+56,y+54,'#3a0a08');

    // Old playbill stuck to a bench
    rect(X,x+12,y+30,4,3,P.parchment);
    px(X,x+13,y+31,'#1a0e06');
    px(X,x+14,y+31,'#1a0e06');

    // Two pillars at the entrance (left and right of the structure)
    rect(X,x-2,y+5,3,50,P.dstone);
    rect(X,x-1,y+6,1,48,P.lstone);
    rect(X,x+78,y+5,3,50,P.dstone);
    rect(X,x+79,y+6,1,48,P.lstone);
    // Cracks in pillars
    rect(X,x-1,y+30,1,8,'#0a0a0e');
    rect(X,x+78,y+25,1,10,'#0a0a0e');

    // Mask hanging on left pillar (theater mask)
    rect(X,x-3,y+12,5,5,P.bone);
    rect(X,x-2,y+13,3,3,'#3a2618');
    px(X,x-1,y+14,'#0a0a0e'); // eye
    px(X,x+1,y+14,'#0a0a0e'); // eye
    // Sad mouth (curved)
    rect(X,x,y+16,2,1,'#0a0a0e');
}

export function draw_posterwall(x, y) {
    // Concrete wall base
    rect(X,x,y,65,45,P.stone);rect(X,x+1,y+1,63,43,P.dstone);
    // Layered posters — different sizes, colors, overlapping
    const posters=[
      {px:3,py:3,pw:18,ph:22,c:'#3a0a08',tc:P.amber},   // crimson poster
      {px:20,py:2,pw:20,ph:25,c:'#1b1464',tc:P.bone},    // indigo poster
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
