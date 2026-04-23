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

export function drawNPC_elder(ex,ey){
  // ═══ ELDER — hooded, subtle breathing ═══
  const breath=Math.sin(t*.008)*0.5;
  // Subtle hood shadow shift
  const hoodShift=Math.sin(t*.004)*.3;
  rect(X,ex,ey+5-breath,12,14+breath,P.d1);dither(X,ex+1,ey+6-breath,10,12+breath,P.dgrey,P.d1,.3);
  rect(X,ex+1+hoodShift,ey-2,10,8,P.d1);rect(X,ex+2+hoodShift,ey-1,8,6,'#0e0a08');
  rect(X,ex+3+hoodShift,ey,6,4,P.bone);
  // Eyes — pulse very slowly (very tired)
  const eyeBlink=Math.sin(t*.002)>.96?0:1;
  if(eyeBlink){
    px(X,ex+4+hoodShift,ey+1,P.d2);px(X,ex+7+hoodShift,ey+1,P.d2);
  }else{
    rect(X,ex+4+hoodShift,ey+1,4,1,P.d2); // closed eyes
  }
  // Hands — subtle movement
  const handSway=Math.sin(t*.006)*1;
  rect(X,ex-2+handSway,ey+12,3,2,P.bone);rect(X,ex+11-handSway,ey+12,3,2,P.bone);
  // Staff with subtle tremor (very old hands)
  const tremor=Math.sin(t*.05)*.4;
  rect(X,ex+13-handSway+tremor,ey+5,2,16,P.dwood);
  px(X,ex+13-handSway+tremor,ey+4,P.ash);
  // Staff cap glint occasionally
  if(t%180<5){
    X.globalAlpha=.5;px(X,ex+13-handSway+tremor,ey+3,'#fff');X.globalAlpha=1;
  }
}

// ═══ THE NOCTURNAL / ЛУННЫЙ — white-robed priestly figure ═══
// crescent moon head, ceremonial white robes, dark bony hands, cosmic void within

