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

export function drawDumpsterDemon(dx,dy){
  const hover=Math.sin(t*.004)*3;
  const wingFlap=Math.sin(t*.007)*11; // slower, deeper flap
  const breathe=Math.sin(t*.006)*2;
  const demonY=dy-68+hover; // raised higher to accommodate bigger demon
  const demonX=dx-18;       // shifted left for wider span
  const cx=demonX+30,cy=demonY+18; // body center

  // ── HEAT DISTORTION AURA — thin pulsing ring ──
  X.globalAlpha=.08+.04*Math.sin(t*.005);
  const auraR=38+breathe*2;
  const auraG=X.createRadialGradient(cx,cy,auraR*.6,cx,cy,auraR);
  auraG.addColorStop(0,'rgba(255,50,10,0)');
  auraG.addColorStop(.7,'rgba(255,60,20,.4)');
  auraG.addColorStop(1,'rgba(0,0,0,0)');
  X.fillStyle=auraG;X.fillRect(cx-auraR,cy-auraR,auraR*2,auraR*2);
  X.globalAlpha=1;

  // ── BAT WINGS — larger, 5 bone struts each, transparency gradient ──
  const wingTip=wingFlap;
  // Left wing — membrane as gradient fill
  X.save();
  const lwGrad=X.createLinearGradient(cx,cy,demonX-35,demonY);
  lwGrad.addColorStop(0,'rgba(107,15,26,.8)');
  lwGrad.addColorStop(.6,'rgba(74,10,18,.55)');
  lwGrad.addColorStop(1,'rgba(40,5,10,.2)');
  X.fillStyle=lwGrad;
  X.beginPath();
  X.moveTo(demonX+20,demonY+18);
  X.lineTo(demonX-28,demonY-10-wingTip);
  X.lineTo(demonX-35,demonY-2-wingTip*.6);
  X.lineTo(demonX-30,demonY+6-wingTip*.3);
  X.lineTo(demonX-22,demonY+12);
  X.lineTo(demonX-12,demonY+17);
  X.lineTo(demonX-2,demonY+21);
  X.lineTo(demonX+8,demonY+24);
  X.closePath();X.fill();
  X.restore();
  // Left wing bones (5 struts)
  X.strokeStyle='#3a0808';X.lineWidth=1;
  const lStruts=[[-26,-8-wingTip],[-22,-2-wingTip*.8],[-17,4-wingTip*.5],[-9,10-wingTip*.2],[-1,15]];
  lStruts.forEach(([ex,ey])=>{
    X.beginPath();X.moveTo(demonX+20,demonY+18);X.lineTo(demonX+ex,demonY+ey);X.stroke();
  });
  // Wing claws at tips
  for(let i=0;i<3;i++){
    const sx=demonX-26+i*8,sy=demonY-6-wingTip+i*5;
    px(X,sx-1,sy,'#1a0404');px(X,sx-2,sy+1,'#1a0404');
  }

  // Right wing — mirrored
  X.save();
  const rwGrad=X.createLinearGradient(cx,cy,demonX+95,demonY);
  rwGrad.addColorStop(0,'rgba(107,15,26,.8)');
  rwGrad.addColorStop(.6,'rgba(74,10,18,.55)');
  rwGrad.addColorStop(1,'rgba(40,5,10,.2)');
  X.fillStyle=rwGrad;
  X.beginPath();
  X.moveTo(demonX+40,demonY+18);
  X.lineTo(demonX+88,demonY-10-wingTip);
  X.lineTo(demonX+95,demonY-2-wingTip*.6);
  X.lineTo(demonX+90,demonY+6-wingTip*.3);
  X.lineTo(demonX+82,demonY+12);
  X.lineTo(demonX+72,demonY+17);
  X.lineTo(demonX+62,demonY+21);
  X.lineTo(demonX+52,demonY+24);
  X.closePath();X.fill();
  X.restore();
  X.strokeStyle='#3a0808';X.lineWidth=1;
  const rStruts=[[86,-8-wingTip],[82,-2-wingTip*.8],[77,4-wingTip*.5],[69,10-wingTip*.2],[61,15]];
  rStruts.forEach(([ex,ey])=>{
    X.beginPath();X.moveTo(demonX+40,demonY+18);X.lineTo(demonX+ex,demonY+ey);X.stroke();
  });
  for(let i=0;i<3;i++){
    const sx=demonX+86-i*8,sy=demonY-6-wingTip+i*5;
    px(X,sx+1,sy,'#1a0404');px(X,sx+2,sy+1,'#1a0404');
  }

  // ── SPIKED OUTER HALO — rotating ──
  for(let i=0;i<14;i++){
    const angle=i/14*Math.PI*2+t*.003;
    const hr=18;
    const hx=cx+Math.cos(angle)*hr;
    const hy=cy-12+Math.sin(angle)*hr;
    px(X,hx,hy,P.crimson);
    px(X,hx+Math.cos(angle)*3,hy+Math.sin(angle)*3,'#4a0a12');
    px(X,hx+Math.cos(angle)*4,hy+Math.sin(angle)*4,'#2a0508');
  }

  // ── CRESCENT MOON behind head ──
  X.strokeStyle='#4a0a12';X.lineWidth=1;
  X.beginPath();X.arc(cx,cy-18+hover*.3,11,Math.PI*.7,Math.PI*2.3);X.stroke();

  // ── BODY — bigger, breathing, ribbed ──
  rect(X,demonX+20,demonY+14-breathe*.3,20,24+breathe*.5,P.crimson);
  dither(X,demonX+21,demonY+15-breathe*.3,18,22+breathe*.5,'#8b0000','#4a0a12',.4);
  // Ribs — expand with breath (6 ribs now)
  for(let i=0;i<6;i++){
    const ribW=16+breathe*.3;
    rect(X,demonX+22-breathe*.1,demonY+17+i*3-breathe*.3,ribW,1,'#3a0808');
  }

  // ── CHEST CAVITY — opening with inner fire ──
  const cavityFlicker=.6+.4*Math.sin(t*.04);
  rect(X,demonX+27,demonY+22-breathe*.3,6,10,'#1a0404');
  X.globalAlpha=cavityFlicker;
  rect(X,demonX+28,demonY+23-breathe*.3,4,8,'#8b0000');
  rect(X,demonX+28,demonY+24-breathe*.3,4,5,P.f3);
  rect(X,demonX+29,demonY+25-breathe*.3,2,3,P.f1);
  X.globalAlpha=1;
  // Cavity rim ember
  px(X,demonX+27,demonY+22-breathe*.3,P.f1);
  px(X,demonX+32,demonY+22-breathe*.3,P.f1);
  px(X,demonX+27,demonY+31-breathe*.3,P.f1);
  px(X,demonX+32,demonY+31-breathe*.3,P.f1);

  // ── HEAD — skull, slowly turning ──
  const headTurn=Math.sin(t*.005)*2;
  const hx=cx-8+headTurn,hy=demonY+2;
  rect(X,hx,hy,14,12,P.crimson);
  rect(X,hx+1,hy+1,12,10,'#5a0a12');
  rect(X,hx+2,hy+2,10,8,'#4a0a12');

  // ── CROWN OF THORNS — 8 spikes radiating around skull ──
  const thornPoints=[[-2,-3],[2,-5],[6,-5],[10,-5],[14,-3],[15,2],[-3,2],[-1,6]];
  thornPoints.forEach(([ox,oy])=>{
    rect(X,hx+ox,hy+oy,1,3,'#1a0404');
    px(X,hx+ox,hy+oy-1,'#2a0508');
  });

  // ── BRANCHING HORNS — 2-segment with offshoots ──
  // Left horn main
  rect(X,hx,hy-2,2,4,'#3a0808');
  rect(X,hx-1,hy-5,2,3,'#3a0808');
  rect(X,hx-2,hy-7,2,2,'#2a0508');
  // Left horn offshoot
  rect(X,hx+1,hy-4,2,2,'#3a0808');
  // Right horn main
  rect(X,hx+12,hy-2,2,4,'#3a0808');
  rect(X,hx+13,hy-5,2,3,'#3a0808');
  rect(X,hx+14,hy-7,2,2,'#2a0508');
  // Right horn offshoot
  rect(X,hx+11,hy-4,2,2,'#3a0808');

  // ── EYES — two pulsing + third eye on forehead ──
  const eyeGlow=.4+.3*Math.sin(t*.01);
  const thirdEyeGlow=.5+.4*Math.sin(t*.013+1); // separate phase
  X.globalAlpha=eyeGlow;
  rect(X,hx+3,hy+4,3,3,P.f1);
  rect(X,hx+8,hy+4,3,3,P.f1);
  X.globalAlpha=1;
  px(X,hx+4,hy+5,'#fff');px(X,hx+9,hy+5,'#fff');
  // Third eye — bigger, more intense
  X.globalAlpha=thirdEyeGlow;
  rect(X,hx+5,hy+1,4,2,P.f2);
  rect(X,hx+6,hy,2,1,P.f2);
  rect(X,hx+6,hy+3,2,1,P.f2);
  rect(X,hx+6,hy+1,2,2,'#fff');
  px(X,hx+7,hy+2,'#ffffcc');
  X.globalAlpha=1;

  // ── JAW — open, fanged ──
  rect(X,hx+3,hy+9,8,3,'#2a0508');
  // Fangs
  px(X,hx+3,hy+12,P.bone);px(X,hx+4,hy+12,P.bone);
  px(X,hx+9,hy+12,P.bone);px(X,hx+10,hy+12,P.bone);
  // Inner mouth glow
  if(Math.sin(t*.008)>.2){
    X.globalAlpha=.5;
    rect(X,hx+5,hy+10,4,1,P.f2);
    X.globalAlpha=1;
  }

  // ── ARMS — outstretched crucifix-like (not reaching down) ──
  const armSway=Math.sin(t*.007)*2;
  // Left arm — upper
  X.strokeStyle=P.crimson;X.lineWidth=3;
  X.beginPath();X.moveTo(demonX+20,demonY+18);X.lineTo(demonX+10,demonY+20+armSway);X.stroke();
  X.lineWidth=2;
  X.beginPath();X.moveTo(demonX+10,demonY+20+armSway);X.lineTo(demonX+2,demonY+22+armSway*.5);X.stroke();
  X.lineWidth=1;
  // Left hand + 3 claws
  for(let i=0;i<3;i++){
    const clx=demonX-1+i*2;
    const cly=demonY+23+armSway*.5+Math.sin(t*.02+i)*.7;
    rect(X,clx,cly,1,3,'#2a0508');
    px(X,clx,cly+3,'#1a0404');
  }
  // Right arm
  X.strokeStyle=P.crimson;X.lineWidth=3;
  X.beginPath();X.moveTo(demonX+40,demonY+18);X.lineTo(demonX+50,demonY+20-armSway);X.stroke();
  X.lineWidth=2;
  X.beginPath();X.moveTo(demonX+50,demonY+20-armSway);X.lineTo(demonX+58,demonY+22-armSway*.5);X.stroke();
  X.lineWidth=1;
  for(let i=0;i<3;i++){
    const clx=demonX+56+i*2;
    const cly=demonY+23-armSway*.5+Math.sin(t*.02+i+1)*.7;
    rect(X,clx,cly,1,3,'#2a0508');
    px(X,clx,cly+3,'#1a0404');
  }

  // ── SKELETAL TAIL — 5 vertebrae, sways behind body ──
  const tailBase=[demonX+30,demonY+38-breathe*.3];
  let tx_=tailBase[0],ty_=tailBase[1];
  for(let i=0;i<6;i++){
    const segSway=Math.sin(t*.009+i*.5)*2;
    const nx=tx_+segSway;
    const ny=ty_+3;
    // Vertebra
    rect(X,nx-1,ny-1,2,2,'#3a0808');
    px(X,nx,ny,'#5a0a12');
    // Connection line
    X.strokeStyle='#2a0508';X.lineWidth=1;
    X.beginPath();X.moveTo(tx_,ty_);X.lineTo(nx,ny);X.stroke();
    tx_=nx;ty_=ny;
  }
  // Tail barb at end
  rect(X,tx_-2,ty_+1,5,2,'#3a0808');
  px(X,tx_-3,ty_,'#1a0404');
  px(X,tx_+3,ty_,'#1a0404');
  px(X,tx_,ty_+3,'#1a0404');

  // ── DRIPPING — 7 streams with splash at bottom ──
  for(let i=0;i<7;i++){
    const dripX=demonX+22+i*3.5;
    const dripSpeed=.003+hash(i,0,11)*.004;
    const dripPhase=(t*dripSpeed+hash(i,0,22))%1;
    const dripLen=18+hash(i,0,33)*12;
    for(let j=0;j<dripLen*dripPhase;j++){
      X.globalAlpha=.5*(1-j/(dripLen*dripPhase))*.7;
      px(X,dripX+Math.sin(j*.2+i)*0.5,demonY+38+j,P.crimson);
    }
    // Splash when drip reaches bottom
    if(dripPhase>.92){
      X.globalAlpha=.5*(1-dripPhase)*8;
      const splashY=demonY+38+dripLen;
      px(X,dripX-2,splashY,P.crimson);
      px(X,dripX+2,splashY,P.crimson);
      px(X,dripX,splashY+1,P.crimson);
      X.globalAlpha=1;
    }
  }
  X.globalAlpha=1;

  // ── EMBER PARTICLES rising from below demon (more when player near) ──
  const emberCount=7+Math.floor(npcProximity*8);
  for(let i=0;i<emberCount;i++){
    const ePhase=((t*.012*(1+npcProximity*.4)+i*.15)%1);
    const ex=demonX+15+Math.sin(t*.008+i*2.3)*20+windX*ePhase*8;
    const ey=demonY+55-ePhase*38;
    X.globalAlpha=(1-ePhase)*.7;
    px(X,ex,ey,i%2?P.f1:P.f2);
    if(ePhase<.3)px(X,ex+1,ey,P.f4);
    if(ePhase<.15)px(X,ex,ey-1,'#ffffcc');
    X.globalAlpha=1;
  }
  // Demon's eyes flare when approached
  if(npcProximity>.4){
    X.globalAlpha=npcProximity*.6;
    X.beginPath();X.arc(demonX+30+Math.sin(t*.005)*2,demonY+7,6,0,Math.PI*2);
    X.fillStyle='#ff3010';X.fill();
    X.globalAlpha=1;
  }
}

