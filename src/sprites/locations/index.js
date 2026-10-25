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
export { draw_office, draw_gates, draw_train, draw_theater, draw_terminal, draw_powerline, draw_crater, draw_nocturnal, draw_campfire, draw_pithos, draw_lantern1, draw_church, draw_library, draw_fountain, draw_cross, draw_radio, draw_tent, draw_pizzeria, draw_ruins, draw_watchtower, draw_junkyard, draw_bus, draw_billboard, draw_pipeline, draw_lake, draw_altar, draw_dumpster, draw_banner, draw_overpass, draw_posterwall, draw_crypt, draw_graffiti, draw_vending, draw_basement, draw_exit, draw_raven } from './canon.js';

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
