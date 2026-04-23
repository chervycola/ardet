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

export function drawNPC_sol(sx,sy){
  // ═══ SOL INVICTUS / THE ESTIVAL — skeleton in dark flower-embroidered mantle ═══
  // ~36px wide, ~55px tall
  const breath=Math.sin(t*.008)*0.8;
  const sway=Math.sin(t*.003)*.6;
  const by=sy;
  const bx=sx+sway;
  const cx=bx+18; // center X

  // Shadow
  X.globalAlpha=.2;X.fillStyle='#000';X.beginPath();X.ellipse(cx,sy+52,12,3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

  // ── SKELETAL LEGS — visible below mantle ──
  const legSway=Math.sin(t*.004)*.4;
  X.strokeStyle=P.bone;X.lineWidth=2;
  // Left leg
  X.beginPath();X.moveTo(bx+12,by+40);X.lineTo(bx+11+legSway,by+45);X.lineTo(bx+11,by+50);X.stroke();
  // Right leg
  X.beginPath();X.moveTo(bx+22,by+40);X.lineTo(bx+23-legSway,by+45);X.lineTo(bx+23,by+50);X.stroke();
  X.lineWidth=1;
  // Knee caps
  px(X,bx+11+legSway,by+45,P.dbone);px(X,bx+23-legSway,by+45,P.dbone);
  // Feet bones
  rect(X,bx+9,by+50,4,2,P.dbone);rect(X,bx+21,by+50,4,2,P.dbone);

  // ── DARK MANTLE — full-body, flower-embroidered, torn ──
  // Main body
  rect(X,bx+6+sway*.2,by+12-breath,22+breath*.5,30+breath,P.d1);
  dither(X,bx+7+sway*.2,by+13-breath,20+breath*.5,28+breath,'#1a1008',P.d1,.2);
  // Mantle extends wider at bottom (draping)
  for(let i=0;i<7;i++){
    const rSwing=Math.sin(t*.005+i*.7)*1.2;
    const rh=6-Math.abs(i-3)+Math.sin(t*.004+i)*1;
    rect(X,bx+3+i*4+rSwing,by+41,3,rh,P.d1);
  }
  // Torn edges on mantle — ragged bottom
  for(let i=0;i<10;i++){
    const tx_=bx+4+i*3+Math.sin(t*.006+i*1.1)*.8;
    const tLen=2+hash(i,0,11)*3;
    rect(X,tx_,by+46,2,tLen,P.d1);
    if(hash(i,0,22)>.6)px(X,tx_,by+46+tLen,'#1a1008');
  }

  // ── FLOWER EMBROIDERY on mantle — sway slightly in wind ──
  const flowerSpots=[
    [8,16,'sunflower'],[10,22,'wildflower'],[7,28,'sunflower'],[9,34,'wildflower'],
    [24,15,'sunflower'],[26,20,'wildflower'],[25,26,'sunflower'],[23,32,'wildflower'],
    [14,38,'sunflower'],[20,36,'wildflower'],[12,19,'wildflower'],[22,24,'wildflower'],
  ];
  flowerSpots.forEach(([fx,fy,type],idx)=>{
    const fSway=Math.sin(t*.006+idx*.6)*.8;
    if(type==='sunflower'){
      // Sunflower — golden center with petals
      const fcx=bx+fx+fSway,fcy=by+fy;
      px(X,fcx,fcy,P.gold);
      px(X,fcx-1,fcy,P.sunflower);px(X,fcx+1,fcy,P.sunflower);
      px(X,fcx,fcy-1,P.sunflower);px(X,fcx,fcy+1,P.sunflower);
      // Center
      px(X,fcx,fcy,'#4a3a10');
      // Stem
      px(X,fcx,fcy+2,'#2a4a0a');
    } else {
      // Wildflower — smaller, various colors
      const wc=['#aa66aa','#cc4466','#66aa88','#dd8844'][idx%4];
      px(X,bx+fx+fSway,by+fy,wc);
      if(hash(fx,fy,33)>.4)px(X,bx+fx+1+fSway,by+fy,wc);
      px(X,bx+fx+fSway,by+fy+1,'#2a4a0a'); // stem
    }
  });

  // ── SHOULDER FLOWERS — growing from shoulders ──
  for(let i=0;i<3;i++){
    const fSway=Math.sin(t*.007+i*1.2)*.6;
    // Left shoulder
    px(X,bx+6+i*2+fSway,by+11-i,P.sunflower);
    px(X,bx+6+i*2+fSway,by+10-i,'#4a3a10');
    // Right shoulder
    px(X,bx+24-i*2+fSway,by+11-i,i%2?'#aa66aa':P.sunflower);
    px(X,bx+24-i*2+fSway,by+10-i,'#4a3a10');
  }

  // ── FALLING PETALS — gentle sway, more when player is close ──
  const petalCount=4+Math.floor(npcProximity*5);
  for(let pi=0;pi<petalCount;pi++){
    const petalPhase=((t*.002*(1+npcProximity*.4))+pi*.25)%1;
    const pcol=[P.sunflower,P.gold,'#aa66aa','#cc4466','#dd8844',P.crimson,'#66aa88'][pi%7];
    if(petalPhase<.85){
      const petalX=cx-8+pi*2.5+petalPhase*6+Math.sin(petalPhase*12+pi*1.5)*3+(typeof windX!=='undefined'?windX*petalPhase*5:0);
      const petalY=by+8+pi*1.5+petalPhase*48;
      X.globalAlpha=.55*(1-petalPhase*1.1);
      // Petal shape — 2px with slight rotation feel
      px(X,petalX,petalY,pcol);
      px(X,petalX+Math.sin(petalPhase*8+pi)*.8,petalY+1,pcol);
      X.globalAlpha=1;
    }
  }

  // ── RIBCAGE visible through torn mantle — breathing ──
  X.globalAlpha=.3;
  for(let i=0;i<5;i++){
    const ribW=8+breath*.4;
    const ribExpand=Math.sin(t*.008+i*.2)*0.3;
    rect(X,bx+13-ribW/2+ribExpand,by+18+i*3,ribW,1,P.bone);
  }
  X.globalAlpha=1;
  // Sternum
  rect(X,bx+17,by+17,1,14,P.dbone);

  // ── SKULLS nestled in chest area ──
  // Skull 1 — left
  rect(X,bx+11,by+20,4,4,P.bone);
  px(X,bx+11,by+21,P.d1);px(X,bx+13,by+21,P.d1); // eyes
  px(X,bx+12,by+23,P.d1); // mouth
  // Skull 2 — right
  rect(X,bx+20,by+21,4,4,P.bone);
  px(X,bx+20,by+22,P.d1);px(X,bx+22,by+22,P.d1); // eyes
  px(X,bx+21,by+24,P.d1); // mouth
  // Skull 3 — center, smaller, nestled deeper
  rect(X,bx+16,by+25,3,3,P.dbone);
  px(X,bx+16,by+26,P.d1);px(X,bx+18,by+26,P.d1);

  // ── LEFT ARM — holding burning branch ──
  const lArmAngle=Math.sin(t*.006)*0.25-0.4;
  const lSx=bx+7,lSy=by+16;
  const lEx=lSx-6+Math.cos(lArmAngle)*2;
  const lEy=lSy+2+Math.sin(lArmAngle)*2;
  const lHx=lEx-5+Math.cos(lArmAngle+.3)*2;
  const lHy=lEy+1+Math.sin(lArmAngle+.3)*2;
  // Bone arm
  X.strokeStyle=P.bone;X.lineWidth=2;
  X.beginPath();X.moveTo(lSx,lSy);X.lineTo(lEx,lEy);X.stroke();
  X.lineWidth=1;
  X.beginPath();X.moveTo(lEx,lEy);X.lineTo(lHx,lHy);X.stroke();
  // Bony fingers
  px(X,lHx-1,lHy,P.dbone);px(X,lHx,lHy+1,P.dbone);px(X,lHx-1,lHy+1,P.dbone);
  // Branch
  const brAngle=lArmAngle*.4;
  rect(X,lHx-8,lHy-2+brAngle,10,2,P.dwood);
  rect(X,lHx-12,lHy-3+brAngle,5,2,P.wood);
  rect(X,lHx-13,lHy-4+brAngle,2,3,P.wood);
  // Fire on branch — flickering, animated
  const ff=t*.02;
  for(let i=0;i<8;i++){
    const flx=lHx-11+Math.sin(ff+i*.7)*2.5;
    const fly=lHy-6+brAngle-i*2-Math.abs(Math.sin(ff*1.2+i*.5))*1.5;
    const fs=Math.max(1,4-Math.floor(i*.4));
    X.globalAlpha=1-i*.1;
    rect(X,flx,fly,fs,fs,[P.f3,P.f3,P.f1,P.f1,P.f4,P.f2,P.sunflower,'#fff'][i]);
  }
  X.globalAlpha=1;
  // Smoke wisps
  for(let i=0;i<5;i++){
    const swPhase=((t*.012+i*.2)%1);
    const swx=lHx-11+Math.sin(t*.006+i*1.8)*3+swPhase*2;
    const swy=lHy-16+brAngle-swPhase*18;
    X.globalAlpha=(1-swPhase)*.15;
    rect(X,swx,swy,2,2,'#3a3028');
    X.globalAlpha=1;
  }
  // Fire sparks
  for(let i=0;i<4;i++){
    const spx=lHx-11+Math.sin(t*.009+i*1.7)*5;
    const spy=lHy-16+brAngle-((t*.025+i*4)%12);
    X.globalAlpha=Math.max(0,.35-((t*.025+i*4)%12)/12);
    px(X,spx,spy,i%2?P.f1:P.f2);X.globalAlpha=1;
  }

  // ── RIGHT ARM — skeletal, dangling gently ──
  const rArmSway=Math.sin(t*.005+1)*0.35;
  X.strokeStyle=P.bone;X.lineWidth=2;
  X.beginPath();X.moveTo(bx+27,by+16);X.lineTo(bx+30+rArmSway*2,by+22);X.stroke();
  X.lineWidth=1;
  X.beginPath();X.moveTo(bx+30+rArmSway*2,by+22);X.lineTo(bx+29+rArmSway*3,by+30);X.stroke();
  // Dangling bony fingers
  for(let i=0;i<3;i++){
    const fing=Math.sin(t*.007+i*.8)*0.5;
    px(X,bx+28+rArmSway*3+i,by+31+fing,P.dbone);
  }

  // ══ SUN DISC HEAD — ~14 rays rotating slowly ══
  const headTilt=Math.sin(t*.004)*0.8;
  const pulse=.75+.25*Math.sin(t*.005);
  const hcx=cx+headTilt*.3,hcy=by+4;

  // Sun disc — outer glow
  X.globalAlpha=pulse*.3;
  X.fillStyle=P.sunflower;
  X.beginPath();X.arc(hcx,hcy,11,0,Math.PI*2);X.fill();
  X.globalAlpha=1;

  // Sun disc body
  X.globalAlpha=pulse;
  X.fillStyle=P.gold;
  X.beginPath();X.arc(hcx,hcy,9,0,Math.PI*2);X.fill();

  // ~14 sun rays — rotating slowly
  const rayRot=t*.0015; // very slow rotation
  for(let i=0;i<14;i++){
    const angle=i/14*Math.PI*2+rayRot;
    const rayLen=4+Math.sin(angle*3+t*.003)*1.5;
    const baseR=9;
    // Ray as a tapered line
    for(let r=0;r<rayLen;r++){
      const rx=hcx+Math.cos(angle)*(baseR+r);
      const ry=hcy+Math.sin(angle)*(baseR+r);
      const rc=r<2?P.gold:P.sunflower;
      px(X,rx,ry,rc);
      if(r<1){px(X,rx+Math.cos(angle+Math.PI/2)*.5,ry+Math.sin(angle+Math.PI/2)*.5,rc);}
    }
  }
  X.globalAlpha=1;

  // Face within disc — closed eyes, serene
  X.fillStyle=P.damber;
  X.beginPath();X.arc(hcx,hcy,6,0,Math.PI*2);X.fill();
  // Darker inner
  X.fillStyle='#5a4a18';
  X.beginPath();X.arc(hcx,hcy,4.5,0,Math.PI*2);X.fill();

  // Closed eyes — gentle arcs
  px(X,hcx-2,hcy-1,'#3a2a08');px(X,hcx-1,hcy-2,'#3a2a08');px(X,hcx-3,hcy,'#3a2a08');
  px(X,hcx+2,hcy-1,'#3a2a08');px(X,hcx+1,hcy-2,'#3a2a08');px(X,hcx+3,hcy,'#3a2a08');
  // Nose
  px(X,hcx,hcy+1,'#2a1a06');
  // Calm mouth
  px(X,hcx-1,hcy+2,'#3a2a08');px(X,hcx,hcy+2.5,'#3a2a08');px(X,hcx+1,hcy+2,'#3a2a08');
  // Gold tear streaks
  X.globalAlpha=.5;
  rect(X,hcx-3,hcy+1,1,4,P.gold);
  rect(X,hcx+3,hcy+1,1,4,P.gold);
  // Tear drops at bottom of streaks
  px(X,hcx-3,hcy+5,P.sunflower);
  px(X,hcx+3,hcy+5,P.sunflower);
  X.globalAlpha=1;

  // ── BUZZING INSECTS — orbit lazily ──
  for(let i=0;i<5;i++){
    const iAngle=t*.003+i*Math.PI*2/5;
    const iRadius=10+Math.sin(t*.002+i*1.3)*6;
    const ix=cx+Math.cos(iAngle)*iRadius;
    const iy=by+18+Math.sin(iAngle*.7+i)*iRadius*.5;
    X.globalAlpha=.5;
    px(X,ix,iy,P.d1);
    // Wing flicker
    if(t%3<2){px(X,ix+1,iy-1,'#666');px(X,ix-1,iy-1,'#666');}
    X.globalAlpha=1;
  }
}


