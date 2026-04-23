import { rect, px, dither, hash } from '../../render/draw.js';
import { t } from '../../core/time.js';
import { X } from '../../render/context.js';

const P = {
  d1: '#0a0a0a', d2: '#6b0f1a', dgrey: '#2a2a2a',
  ash: '#8a8d8f', bone: '#e8dcc8', dbone: '#c8b8a8',
  crimson: '#6b0f1a', gold: '#b8860b', amber: '#daa520',
  damber: '#a07818', term: '#1a8c1a', termd: '#0a4a0a',
  dwood: '#1a0e06', f1: '#ff6600', f2: '#ff3300',
  toxic: '#3aff1a',
};

let npcProximity = 0;
export function setProximity(v) { npcProximity = v; }

export function drawNPC_nocturnal(nx,ny){
  // ~46px wide (including wings), ~80px tall — tall priestly silhouette
  const breath=Math.sin(t*.003)*0.4;     // barely breathing
  const sway=Math.sin(t*.0025)*0.6;      // slow ceremonial sway
  const starShimmer=t*.002;
  const cx=nx+11+sway*.3;                 // sprite center X

  // ── LONG STRETCHED SHADOW ──
  X.globalAlpha=.5;X.fillStyle='#000';
  X.beginPath();X.ellipse(cx,ny+80,22,4,0,0,Math.PI*2);X.fill();
  X.globalAlpha=1;

  // ── WING SUGGESTIONS BEHIND — pale, ghostly, half-furled ──
  // Left wing — soft gradient
  X.save();
  const lwGrad=X.createLinearGradient(nx-2,ny+20,nx-22,ny+50);
  lwGrad.addColorStop(0,'rgba(232,220,200,.55)');
  lwGrad.addColorStop(.6,'rgba(184,168,136,.25)');
  lwGrad.addColorStop(1,'rgba(120,110,90,.05)');
  X.fillStyle=lwGrad;
  X.beginPath();
  X.moveTo(nx+4,ny+18);
  X.quadraticCurveTo(nx-14,ny+14+breath,nx-20,ny+34);
  X.quadraticCurveTo(nx-16,ny+50,nx-2,ny+54);
  X.lineTo(nx+4,ny+44);
  X.closePath();X.fill();
  X.restore();
  // Wing feather struts
  X.strokeStyle='rgba(232,220,200,.35)';X.lineWidth=1;
  for(let i=0;i<5;i++){
    const a=i*.18-.1;
    X.beginPath();
    X.moveTo(nx+4,ny+18);
    X.lineTo(nx-18+Math.sin(a)*4,ny+22+i*7);
    X.stroke();
  }
  // Right wing — mirrored
  X.save();
  const rwGrad=X.createLinearGradient(nx+22,ny+20,nx+44,ny+50);
  rwGrad.addColorStop(0,'rgba(232,220,200,.55)');
  rwGrad.addColorStop(.6,'rgba(184,168,136,.25)');
  rwGrad.addColorStop(1,'rgba(120,110,90,.05)');
  X.fillStyle=rwGrad;
  X.beginPath();
  X.moveTo(nx+18,ny+18);
  X.quadraticCurveTo(nx+36,ny+14+breath,nx+42,ny+34);
  X.quadraticCurveTo(nx+38,ny+50,nx+24,ny+54);
  X.lineTo(nx+18,ny+44);
  X.closePath();X.fill();
  X.restore();
  X.strokeStyle='rgba(232,220,200,.35)';X.lineWidth=1;
  for(let i=0;i<5;i++){
    const a=i*.18-.1;
    X.beginPath();
    X.moveTo(nx+18,ny+18);
    X.lineTo(nx+40-Math.sin(a)*4,ny+22+i*7);
    X.stroke();
  }

  // ── WHITE FLOWING ROBE — full-body cape with drape folds ──
  // Base silhouette — bone-white parchment
  X.fillStyle='#e8dcc8';
  X.beginPath();
  X.moveTo(nx-1+sway*.3,ny+16+breath);
  X.lineTo(nx+5,ny+12);
  X.lineTo(nx+17,ny+12);
  X.lineTo(nx+23-sway*.3,ny+16+breath);
  X.lineTo(nx+30,ny+45);
  X.lineTo(nx+34,ny+78);
  X.lineTo(nx-12,ny+78);
  X.lineTo(nx-8,ny+45);
  X.closePath();X.fill();
  // Inner shading dither — soft warm grey
  dither(X,nx-4,ny+22,30,52,'#c8bca8','#e8dcc8',.3);
  // Vertical drape folds — long ceremonial pleats
  for(let i=0;i<6;i++){
    const fx=nx-6+i*7+sway*.5;
    const foldShade=i%2?'#b8a888':'#a89878';
    X.globalAlpha=.45;
    rect(X,fx,ny+24,1,52,foldShade);
    // Soft highlight beside each fold
    X.globalAlpha=.25;
    px(X,fx+1,ny+30,'#fffaf0');
    px(X,fx+1,ny+50,'#fffaf0');
    px(X,fx+1,ny+68,'#fffaf0');
  }
  X.globalAlpha=1;
  // Hem ripples — robe pooling on ground
  for(let i=0;i<5;i++){
    const rSwing=Math.sin(t*.005+i*.7)*1.2;
    rect(X,nx-12+i*9+rSwing,ny+74,4,4,'#e8dcc8');
    px(X,nx-12+i*9+rSwing,ny+78,'#b8a888');
    px(X,nx-9+i*9+rSwing,ny+78,'#b8a888');
  }

  // ── GOLDEN BYZANTINE TRIM along robe edges ──
  X.fillStyle=P.gold;
  // Left edge zigzag
  for(let i=0;i<10;i++){
    const ty=ny+18+i*6;
    rect(X,nx-8+(i%2?1:0),ty,1,3,P.gold);
    if(i%2)px(X,nx-8,ty+1,P.damber);
  }
  // Right edge
  for(let i=0;i<10;i++){
    const ty=ny+18+i*6;
    rect(X,nx+30+(i%2?0:1),ty,1,3,P.gold);
    if(i%2)px(X,nx+31,ty+1,P.damber);
  }
  // Bottom hem — golden stitches
  for(let i=0;i<22;i++){
    px(X,nx-11+i*2,ny+77,i%2?P.gold:P.damber);
  }
  // Small ritual marks on robe (tiny gold crosses)
  for(let i=0;i<4;i++){
    const cmx=nx-4+i*8,cmy=ny+30+i*12;
    px(X,cmx,cmy,P.damber);
    px(X,cmx,cmy+1,P.gold);
    px(X,cmx-1,cmy+1,P.damber);
    px(X,cmx+1,cmy+1,P.damber);
  }

  // ── CHEST OPENING — cosmic void where the heart should be ──
  // Dark void cavity through robe
  X.fillStyle='#040408';
  X.fillRect(nx+6,ny+19,10,22);
  // Soft inner glow — radial
  const voidGrad=X.createRadialGradient(nx+11,ny+30,1,nx+11,ny+30,12);
  voidGrad.addColorStop(0,'rgba(40,40,80,.9)');
  voidGrad.addColorStop(.6,'rgba(14,10,40,.6)');
  voidGrad.addColorStop(1,'rgba(4,4,8,0)');
  X.fillStyle=voidGrad;
  X.fillRect(nx+4,ny+18,14,24);
  // Stars inside the void
  for(let i=0;i<14;i++){
    const stX=nx+7+hash(i,0,11)*8;
    const stY=ny+20+hash(i,0,22)*20;
    const stPhase=(starShimmer+i*.25)%1;
    X.globalAlpha=.45+.5*Math.sin(stPhase*Math.PI*2);
    px(X,stX,stY,hash(i,0,33)>.5?'#ffffff':'#ccccff');
    if(hash(i,0,44)>.85){
      px(X,stX+1,stY,'#ffffff');
      px(X,stX,stY+1,'#ffffff');
    }
  }
  X.globalAlpha=1;
  // Galaxy spiral in chest
  X.globalAlpha=.55;
  for(let i=0;i<8;i++){
    const a=i*.7+t*.002;
    const r=i*.55;
    px(X,nx+11+Math.cos(a)*r,ny+30+Math.sin(a)*r*.85,'#ccccff');
  }
  X.globalAlpha=1;
  px(X,nx+11,ny+30,'#ffffff'); // galaxy core
  // Small planet orbit — elliptical ring
  X.strokeStyle='rgba(170,170,220,.35)';X.lineWidth=1;
  X.beginPath();X.ellipse(nx+11,ny+30,5,1.8,0,0,Math.PI*2);X.stroke();
  const orbA=t*.01;
  px(X,nx+11+Math.cos(orbA)*5,ny+30+Math.sin(orbA)*1.8,'#aaaacc');
  // Void rim — golden filigree edge of the opening
  X.strokeStyle=P.gold;X.lineWidth=1;
  X.strokeRect(nx+6,ny+19,10,22);
  // Inner gold dots at corners
  px(X,nx+5,ny+19,P.damber);px(X,nx+16,ny+19,P.damber);
  px(X,nx+5,ny+41,P.damber);px(X,nx+16,ny+41,P.damber);

  // ── LEFT ARM raised — DARK BONY arm contrasting white robes ──
  // Sleeve drape (white) — fabric pulled back near shoulder
  X.fillStyle='#e8dcc8';
  X.beginPath();
  X.moveTo(nx-1,ny+16);
  X.lineTo(nx-4,ny+14);
  X.lineTo(nx-6,ny+8);
  X.lineTo(nx-3,ny+5);
  X.lineTo(nx+1,ny+12);
  X.closePath();X.fill();
  // Sleeve shadow folds
  px(X,nx-3,ny+10,'#b8a888');
  px(X,nx-4,ny+11,'#a89878');
  // Gold cuff at sleeve opening
  rect(X,nx-5,ny+5,4,1,P.gold);
  px(X,nx-5,ny+4,P.damber);
  px(X,nx-2,ny+4,P.damber);
  // Dark bony arm emerging from cuff
  X.strokeStyle='#0a0a0a';X.lineWidth=2;
  X.beginPath();
  X.moveTo(nx-3,ny+5);
  X.lineTo(nx-5,ny-3);
  X.stroke();
  X.lineWidth=1;
  // Bone joint detail
  px(X,nx-4,ny+1,'#1a1a1a');
  px(X,nx-5,ny-1,'#1a1a1a');
  // Skeletal black hand raised — fingers spread
  rect(X,nx-6,ny-5,3,2,'#0a0a0a');
  // Black bony fingers
  px(X,nx-7,ny-6,'#0a0a0a');
  px(X,nx-7,ny-7,'#0a0a0a');
  px(X,nx-5,ny-7,'#0a0a0a');
  px(X,nx-5,ny-8,'#0a0a0a');
  px(X,nx-3,ny-7,'#0a0a0a');
  px(X,nx-3,ny-8,'#0a0a0a');
  px(X,nx-3,ny-9,'#1a1a1a');
  // Cold rim highlight on bony hand
  X.globalAlpha=.4;
  px(X,nx-4,ny-6,'#3a3a42');
  px(X,nx-2,ny-7,'#3a3a42');
  X.globalAlpha=1;

  // Threads from raised hand to small stars above — ceremonial puppeteer
  X.strokeStyle=`rgba(232,220,200,${.4+npcProximity*.3})`;X.lineWidth=1;
  for(let i=0;i<4;i++){
    const swayT=Math.sin(t*.006+i*.4)*.6*(1-npcProximity*.5);
    X.beginPath();
    X.moveTo(nx-5+i,ny-8);
    const pullY=-22-npcProximity*3;
    X.lineTo(nx-9+i*3+swayT,ny+pullY);
    X.stroke();
    // Thread shimmer — occasional sparkle traveling along thread
    const shimmerPos=((t*.004+i*.3)%1);
    if(shimmerPos>.7&&shimmerPos<.85){
      const shX=(nx-5+i)+((nx-9+i*3+swayT)-(nx-5+i))*shimmerPos;
      const shY=(ny-8)+((ny+pullY)-(ny-8))*shimmerPos;
      X.globalAlpha=.8;px(X,shX,shY,'#ffffff');X.globalAlpha=1;
    }
  }
  // Tiny stars at top of threads
  for(let i=0;i<4;i++){
    const ssx=nx-9+i*3;
    const ssy=ny-22-npcProximity*3;
    X.globalAlpha=.5+.3*Math.sin(t*.01+i)+npcProximity*.3;
    px(X,ssx,ssy,'#ffffff');
    px(X,ssx+1,ssy,'#ffffff');
    px(X,ssx,ssy-1,'#ccccee');
    X.globalAlpha=1;
  }

  // ── RIGHT ARM lowered — DARK BONY hand pouring black sand ──
  // Sleeve drape (white) on right shoulder, flowing down
  X.fillStyle='#e8dcc8';
  X.beginPath();
  X.moveTo(nx+23,ny+16);
  X.lineTo(nx+26,ny+20);
  X.lineTo(nx+30,ny+30);
  X.lineTo(nx+33,ny+38);
  X.lineTo(nx+30,ny+40);
  X.lineTo(nx+27,ny+32);
  X.lineTo(nx+24,ny+22);
  X.closePath();X.fill();
  // Sleeve shadow folds
  px(X,nx+27,ny+24,'#b8a888');
  px(X,nx+29,ny+30,'#b8a888');
  px(X,nx+31,ny+36,'#a89878');
  // Gold cuff at wrist opening
  rect(X,nx+30,ny+38,4,1,P.gold);
  px(X,nx+30,ny+39,P.damber);
  px(X,nx+33,ny+39,P.damber);
  // Dark bony hand emerging from sleeve
  X.strokeStyle='#0a0a0a';X.lineWidth=2;
  X.beginPath();
  X.moveTo(nx+32,ny+39);
  X.lineTo(nx+33,ny+44);
  X.stroke();
  X.lineWidth=1;
  // Black skeletal hand
  rect(X,nx+31,ny+44,3,2,'#0a0a0a');
  // Black bony fingers reaching down — cupped palm
  px(X,nx+30,ny+46,'#0a0a0a');
  px(X,nx+30,ny+47,'#1a1a1a');
  px(X,nx+32,ny+46,'#0a0a0a');
  px(X,nx+32,ny+47,'#0a0a0a');
  px(X,nx+32,ny+48,'#1a1a1a');
  px(X,nx+34,ny+46,'#0a0a0a');
  px(X,nx+34,ny+47,'#0a0a0a');
  // Cold rim highlight
  X.globalAlpha=.4;
  px(X,nx+33,ny+45,'#3a3a42');
  px(X,nx+31,ny+45,'#3a3a42');
  X.globalAlpha=1;

  // Black sand falling from palm — long stream
  for(let i=0;i<10;i++){
    const sPhase=((t*.02+i*.13)%1);
    const sandX=nx+32+Math.sin(i*2+t*.01)*1.5;
    const sandY=ny+49+sPhase*30;
    X.globalAlpha=.85-sPhase*.6;
    px(X,sandX,sandY,'#0a0a0e');
    if(hash(i,0,11)>.5)px(X,sandX+1,sandY,'#050508');
    X.globalAlpha=1;
  }
  // Pile of black sand at his foot — stark against white robe
  rect(X,nx+27,ny+76,11,3,'#0a0a0e');
  dither(X,nx+28,ny+75,9,2,'#050508','#0a0a0e',.5);
  px(X,nx+30,ny+74,'#0a0a0e');
  px(X,nx+33,ny+74,'#0a0a0e');
  px(X,nx+35,ny+75,'#050508');

  // When very close — chest void glows brighter (gaze opens)
  if(npcProximity>.5){
    X.globalAlpha=npcProximity*.4;
    X.strokeStyle='#ffffff';X.lineWidth=1;
    X.beginPath();X.arc(nx+11,ny+30,6,0,Math.PI*2);X.stroke();
    X.globalAlpha=1;
  }

  // ── HEAD — CRESCENT MOON with serene face inside ──
  const hx=nx+10+sway*.2,hy=ny+4;

  // Golden disc halo behind crescent (from ref image 5 priestly figure)
  X.save();
  const haloGrad=X.createRadialGradient(hx+2,hy,2,hx+2,hy,16);
  haloGrad.addColorStop(0,'rgba(218,165,32,.45)');
  haloGrad.addColorStop(.5,'rgba(184,134,11,.2)');
  haloGrad.addColorStop(1,'rgba(184,134,11,0)');
  X.fillStyle=haloGrad;
  X.fillRect(hx-14,hy-14,32,28);
  X.restore();
  // Halo rim — thin gold circle pulsing
  X.globalAlpha=.55+.15*Math.sin(t*.006);
  X.strokeStyle=P.gold;X.lineWidth=1;
  X.beginPath();X.arc(hx+2,hy,12,0,Math.PI*2);X.stroke();
  X.globalAlpha=1;

  // Outer crescent — pale ivory edge
  X.save();
  X.fillStyle='#a89878';
  X.beginPath();
  X.arc(hx,hy,10,Math.PI*.15,Math.PI*1.85,false);
  X.arc(hx+3,hy,8,Math.PI*1.85,Math.PI*.15,true);
  X.closePath();X.fill();
  // Mid-tone — bone white
  X.fillStyle='#e8dcc8';
  X.beginPath();
  X.arc(hx-1,hy-1,9,Math.PI*.2,Math.PI*1.8,false);
  X.arc(hx+2,hy,7,Math.PI*1.8,Math.PI*.2,true);
  X.closePath();X.fill();
  // Bright lunar highlight on outer curve
  X.fillStyle='#fffaf0';
  X.beginPath();
  X.arc(hx-2,hy-2,6,Math.PI*.3,Math.PI*1.0,false);
  X.arc(hx,hy-1,4,Math.PI*1.0,Math.PI*.3,true);
  X.closePath();X.fill();
  // Dark inner rim (inside curve)
  X.strokeStyle='#8a8d8f';X.lineWidth=1;
  X.beginPath();
  X.arc(hx+3,hy,7,Math.PI*1.85,Math.PI*.15,true);
  X.stroke();
  X.restore();

  // Lunar craters — tiny pixels on the moon face
  px(X,hx-4,hy-2,'#a89878');
  px(X,hx-5,hy+1,'#a89878');
  px(X,hx-3,hy+3,'#a89878');
  px(X,hx-6,hy-1,'#a89878');

  // Face nestled in the crescent curve — ghostly pale, serene
  X.fillStyle='#e8dcc8';
  X.fillRect(hx-1,hy-2,6,6);
  X.fillStyle='#c8bca8';
  X.fillRect(hx,hy-1,4,5);
  // Closed eyes — gentle horizontal lines (warm dark)
  rect(X,hx,hy+1,1,1,'#3a3028');
  rect(X,hx+3,hy+1,1,1,'#3a3028');
  // Lashes
  px(X,hx-1,hy+1,'#3a3028');
  px(X,hx+4,hy+1,'#3a3028');
  // Calm mouth
  px(X,hx+1,hy+3,'#6a5a42');
  px(X,hx+2,hy+3,'#6a5a42');
  // Faint nose shadow
  px(X,hx+1,hy+2,'#a89878');
  // Tear streaks — silver-pale
  X.globalAlpha=.4;
  rect(X,hx,hy+2,1,2,'#aaaabb');
  rect(X,hx+3,hy+2,1,2,'#aaaabb');
  X.globalAlpha=1;

  // Star above head — single floating point of light
  const topStar=.6+.4*Math.sin(t*.008);
  X.globalAlpha=topStar;
  px(X,hx+1,hy-20,'#ffffff');
  px(X,hx+2,hy-20,'#ffffff');
  px(X,hx+1,hy-21,'#ccccee');
  px(X,hx+2,hy-21,'#ccccee');
  X.globalAlpha=1;
}

// ═══════════════════════════════════════
// SHOP PICTURE-ROOMS

