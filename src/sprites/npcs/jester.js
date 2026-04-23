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

export function drawNPC_jester(jx,jy){
  // ═══ THE JESTER — multi-armed demonic jester, very tall and thin ═══
  // ~35px wide, ~58px tall
  const bob=Math.sin(t*.007)*1.2;
  const breath=Math.sin(t*.01)*0.8;
  const bodyPulse=Math.sin(t*.015)*0.5; // breathing/body pulse
  const lean=Math.sin(t*.004)*1.2; // weight shift side to side
  const by=jy+bob;
  const bx=jx+lean;
  const cx=bx+17; // center X of sprite

  // Shadow (stretches with lean)
  X.globalAlpha=.25;X.fillStyle='#000';
  X.beginPath();X.ellipse(cx,jy+56,14+Math.abs(lean),3,0,0,Math.PI*2);X.fill();X.globalAlpha=1;

  // ── CHAIN FLAIL from left leg — pendulum physics ──
  const chainPendulum=Math.sin(t*.005)*0.6+Math.sin(t*.013)*0.2; // compound pendulum
  const chainAnchorX=bx+10,chainAnchorY=by+46;
  for(let i=0;i<10;i++){
    const swing=Math.sin(chainPendulum+i*.12)*i*1.2;
    const cx_=chainAnchorX-2+swing;
    const cy_=chainAnchorY+i*1.8;
    px(X,cx_,cy_,i%3===0?P.ash:P.dgrey);
    if(i%3===1)px(X,cx_+1,cy_,P.dgrey);
  }
  // Spiked ball at end
  const ballSwing=Math.sin(chainPendulum+1.2)*12;
  const fbx=chainAnchorX-2+ballSwing,fby=chainAnchorY+18;
  rect(X,fbx-2,fby-2,5,5,P.dgrey);
  rect(X,fbx-1,fby-1,3,3,P.ash);
  // Spikes radiate outward
  px(X,fbx-3,fby,P.d1);px(X,fbx+3,fby,P.d1);
  px(X,fbx,fby-3,P.d1);px(X,fbx,fby+3,P.d1);
  px(X,fbx-2,fby-2,P.d1);px(X,fbx+2,fby-2,P.d1);
  px(X,fbx-2,fby+2,P.d1);px(X,fbx+2,fby+2,P.d1);

  // ── LEGS — harlequin diamond pattern, very long and thin ──
  const legLen=18;
  // Left leg
  const llBend=lean<0?1:0;
  rect(X,bx+11,by+30-llBend,3,legLen+llBend,P.d1);
  // Harlequin diamonds on left leg
  for(let i=0;i<7;i++){
    const dc=i%2===0?P.crimson:P.bone;
    px(X,bx+12,by+31+i*2-llBend,dc);
    if(i%2===0)px(X,bx+11,by+32+i*2-llBend,dc);
    else px(X,bx+13,by+32+i*2-llBend,dc);
  }
  // Right leg
  const rlBend=lean>0?1:0;
  rect(X,bx+20,by+30-rlBend,3,legLen+rlBend,P.d1);
  // Harlequin diamonds on right leg
  for(let i=0;i<7;i++){
    const dc=i%2===0?P.bone:P.crimson;
    px(X,bx+21,by+31+i*2-rlBend,dc);
    if(i%2===0)px(X,bx+20,by+32+i*2-rlBend,dc);
    else px(X,bx+22,by+32+i*2-rlBend,dc);
  }

  // ── POINTED CURLED SHOES with bells ──
  // Left shoe — curls left
  rect(X,bx+8,by+48,5,2,P.d1);
  rect(X,bx+6,by+47,3,2,P.d1);
  px(X,bx+5,by+46,P.d1);
  // Bell on left shoe — bobs
  const bellBob1=Math.sin(t*.012+0.5)*1;
  px(X,bx+4,by+45+bellBob1,P.gold);
  px(X,bx+5,by+45+bellBob1,P.gold);
  // Right shoe — curls right
  rect(X,bx+20,by+48,5,2,P.d1);
  rect(X,bx+24,by+47,3,2,P.d1);
  px(X,bx+26,by+46,P.d1);
  // Bell on right shoe — bobs
  const bellBob2=Math.sin(t*.011+2)*1;
  px(X,bx+27,by+45+bellBob2,P.gold);
  px(X,bx+28,by+45+bellBob2,P.gold);

  // ── TORSO — skeletal/insectoid, narrow, with breathing ──
  // Very thin waist
  rect(X,bx+13,by+26-bodyPulse,8+bodyPulse,6,P.d1);
  // Upper torso — slightly wider
  rect(X,bx+11,by+14-breath,12+breath,12+breath,P.d1);
  dither(X,bx+12,by+15-breath,10+breath,10+breath,'#1a0a08',P.d1,.3);
  // Insectoid segments — exoskeleton ridges
  for(let i=0;i<5;i++){
    rect(X,bx+12,by+15+i*2.5-breath,10,1,'#2a1210');
  }
  // Spine visible through thin body
  for(let i=0;i<4;i++){
    px(X,bx+17,by+27+i*2,P.dgrey);
  }

  // ── 6 ARMS — each on different sin phase, holding weapons ──
  const armData=[
    // [shoulderOffX, shoulderOffY, phaseOffset, direction(-1=left,1=right), weaponType]
    {sox:-1, soy:15, phase:0.0, dir:-1, weapon:'dagger'},     // left upper
    {sox:-1, soy:18, phase:1.2, dir:-1, weapon:'sword'},      // left mid
    {sox:-1, soy:21, phase:2.4, dir:-1, weapon:'dagger'},     // left lower
    {sox:13+breath, soy:15, phase:0.7, dir:1, weapon:'sword'},// right upper
    {sox:13+breath, soy:18, phase:1.9, dir:1, weapon:'dagger'},// right mid
    {sox:13+breath, soy:21, phase:3.1, dir:1, weapon:'dagger'},// right lower
  ];
  armData.forEach((arm,idx)=>{
    // Each arm sways independently on its own phase
    const swing=Math.sin(t*.008+arm.phase)*0.6;
    const swing2=Math.sin(t*.012+arm.phase*1.3)*0.4;
    const sx_=bx+arm.sox+11;
    const sy_=by+arm.soy-breath;
    // Elbow position — radiates outward
    const elbowX=sx_+arm.dir*(6+Math.cos(swing)*2);
    const elbowY=sy_-2+Math.sin(swing)*3+idx*0.5;
    // Hand position
    const handX=elbowX+arm.dir*(5+Math.cos(swing+swing2)*2);
    const handY=elbowY-1+Math.sin(swing2)*2;

    // Draw arm segments — thin insectoid
    X.strokeStyle='#1a0a08';X.lineWidth=2;
    X.beginPath();X.moveTo(sx_,sy_);X.lineTo(elbowX,elbowY);X.stroke();
    X.lineWidth=1;
    X.beginPath();X.moveTo(elbowX,elbowY);X.lineTo(handX,handY);X.stroke();
    // Joint
    px(X,elbowX,elbowY,P.dgrey);
    // Hand
    px(X,handX,handY,P.bone);

    // Weapon
    const wAngle=swing+arm.phase*.5;
    if(arm.weapon==='dagger'){
      for(let w=0;w<5;w++){
        px(X,handX+arm.dir*Math.cos(wAngle)*w*0.8,handY-Math.sin(wAngle+.3)*w*0.6-w*0.3,w<3?P.ash:P.lgrey);
      }
      px(X,handX+arm.dir*Math.cos(wAngle)*5*0.8,handY-Math.sin(wAngle+.3)*5*0.6-5*0.3,'#fff');
    } else {
      // Sword — longer blade
      for(let w=0;w<8;w++){
        const sc=w<2?P.dwood:w<6?P.ash:P.lgrey;
        px(X,handX+arm.dir*Math.cos(wAngle)*w*0.9,handY-Math.sin(wAngle+.2)*w*0.5-w*0.4,sc);
      }
      // Crossguard
      px(X,handX+arm.dir*1,handY-1,P.gold);
      px(X,handX+arm.dir*1,handY+1,P.gold);
    }
  });

  // Two additional smaller arms (vestigial, twitching) — total 8
  for(let i=0;i<2;i++){
    const dir_=i===0?-1:1;
    const phase_=i===0?4.0:4.8;
    const twitch=Math.sin(t*.02+phase_)*1.5; // fast twitch
    const sx_=bx+17+dir_*5;
    const sy_=by+24-bodyPulse;
    const tipX=sx_+dir_*(4+twitch);
    const tipY=sy_+2+Math.sin(t*.015+phase_)*1;
    X.strokeStyle='#1a0a08';X.lineWidth=1;
    X.beginPath();X.moveTo(sx_,sy_);X.lineTo(tipX,tipY);X.stroke();
    px(X,tipX,tipY,P.dbone);
  }

  // ── HEAD — narrow skull with menacing expression ──
  const headTilt=Math.sin(t*.006)*1.5;
  const hx=bx+12+headTilt*.2,hy=by+3;
  // Narrow skull
  rect(X,hx,hy,10,10,P.bone);
  rect(X,hx+1,hy+1,8,8,'#2a2018');
  // Sunken cheeks
  rect(X,hx,hy+4,2,3,'#c8b8a0');
  rect(X,hx+8,hy+4,2,3,'#c8b8a0');
  // Eyes — crimson embers, menacing
  px(X,hx+2,hy+3,P.crimson);px(X,hx+3,hy+3,P.crimson);
  px(X,hx+6,hy+3,P.crimson);px(X,hx+7,hy+3,P.crimson);
  // Eye glow
  X.globalAlpha=.2+.1*Math.sin(t*.01);
  px(X,hx+2,hy+2,P.crimson);px(X,hx+7,hy+2,P.crimson);
  X.globalAlpha=1;
  // Nose holes
  px(X,hx+4,hy+6,P.d1);px(X,hx+5,hy+6,P.d1);
  // Teeth — grinning
  for(let i=0;i<6;i++)px(X,hx+2+i,hy+8,i%2?P.bone:P.d1);
  // Jaw
  rect(X,hx+2,hy+9,6,1,'#2a2018');
  for(let i=0;i<4;i++)px(X,hx+3+i,hy+9,i%2?P.d1:P.bone);

  // ── JESTER CAP — 3 horns/points with swinging bells ──
  rect(X,hx-1,hy-1,12,3,P.crimson);
  dither(X,hx,hy-1,10,2,P.d1,P.crimson,.3);
  // Horn 1 — left, curves with animation
  const h1s=Math.sin(t*.009)*2.5;
  rect(X,hx-3+h1s*.2,hy-3,4,3,P.crimson);
  rect(X,hx-5+h1s*.4,hy-6,3,4,P.crimson);
  rect(X,hx-7+h1s*.6,hy-9,2,4,P.crimson);
  // Bell — bobs on delay
  const bell1Bob=Math.sin(t*.012+0.3)*1.5;
  px(X,hx-8+h1s*.7,hy-10+bell1Bob,P.gold);
  px(X,hx-7+h1s*.7,hy-10+bell1Bob,P.gold);
  px(X,hx-8+h1s*.7,hy-9+bell1Bob,P.sunflower);
  // Horn 2 — center, tallest
  const h2s=Math.sin(t*.011+1)*1.8;
  rect(X,hx+3,hy-4,4,3,P.crimson);
  rect(X,hx+3+h2s*.15,hy-8,3,5,P.crimson);
  rect(X,hx+3+h2s*.25,hy-12,3,5,P.crimson);
  const bell2Bob=Math.sin(t*.01+1.5)*1.2;
  px(X,hx+4+h2s*.3,hy-13+bell2Bob,P.gold);
  px(X,hx+5+h2s*.3,hy-13+bell2Bob,P.gold);
  px(X,hx+4+h2s*.3,hy-12+bell2Bob,P.sunflower);
  // Horn 3 — right
  const h3s=Math.sin(t*.008+2.5)*2.5;
  rect(X,hx+9+h3s*.2,hy-3,4,3,P.crimson);
  rect(X,hx+12+h3s*.4,hy-6,3,4,P.crimson);
  rect(X,hx+14+h3s*.6,hy-9,2,4,P.crimson);
  const bell3Bob=Math.sin(t*.013+2)*1.5;
  px(X,hx+16+h3s*.7,hy-10+bell3Bob,P.gold);
  px(X,hx+15+h3s*.7,hy-10+bell3Bob,P.gold);
  px(X,hx+16+h3s*.7,hy-9+bell3Bob,P.sunflower);

  // ── MENACING AURA ──
  X.globalAlpha=.1+.06*Math.sin(t*.007)+npcProximity*.12;
  X.strokeStyle=P.crimson;X.lineWidth=1;
  X.beginPath();X.arc(cx,by+20,22+npcProximity*4,0,Math.PI*2);X.stroke();
  X.globalAlpha=1;

  // ── PROXIMITY REACTION: "ХА!" laugh bubbles ──
  if(npcProximity>.3&&t%80<20){
    const laughPh=(t%80)/20;
    X.globalAlpha=(1-laughPh)*npcProximity*.7;
    X.fillStyle=P.crimson;X.font='6px "Press Start 2P"';
    X.fillText('ХА!',cx+12-laughPh*2,hy-10-laughPh*4);
    X.globalAlpha=1;
  }
}

