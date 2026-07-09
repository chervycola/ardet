/* ARDET vector etching scene generator — shared node/browser.
   Tonal engraving: line density = light. Display list: rect|poly|circle|glow|path|stroke. */
(function(root){

function genOutside(W,H,opts){
  opts=opts||{campfire:true,wanderer:true};
  var L=[];
  var horizon=0.42*H;                     // вид сбоку-сверху: поле занимает низ
  var ARC=0.016*W;                        // дуга планеты-диска
  function hy(x){var u=(x-W*0.5)/(W*0.5);return horizon+ARC*u*u;}
  var moon={x:0.27*W, y:0.22*H, r:0.070*W};

  function hash(x,y){var n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}
  function n2(x,y){
    var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
    function s(t){return t*t*(3-2*t);}
    var a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);
    return a+(b-a)*s(xf)+(c-a)*s(yf)+(a-b-c+d)*s(xf)*s(yf);
  }

  /* ── cathedral profile: architectural blocks ────── */
  var CATH0=0.545*W, CATH1=0.985*W, CW=CATH1-CATH0;
  function cathTop(x){
    var a=(x-CATH0)/CW;
    if(a<0||a>1) return horizon;
    var h=0;
    if(a<0.36){ h=0.36; if(Math.sin(a*160)>0.2) h+=0.035; }            // nave + battlements
    else if(a<0.40){ h=0.48; }                                          // shoulder
    else if(a<0.58){                                                    // great tower
      h=0.97;
      var t=(a-0.40)/0.18;
      if(t>0.72) h=0.97-(t-0.72)*1.5;                                   // broken diagonal top
      if(Math.sin(t*70)>0.55) h+=0.03;
    }
    else if(a<0.70){ h=0.44; if(Math.sin(a*120)>0.4) h+=0.03; }
    else if(a<0.80){                                                    // pointed spire, snapped
      var u=(a-0.70)/0.10;
      h=0.46+ (u<0.5? u*0.62 : (1-u)*0.62)*1.35;
      if(u>0.42&&u<0.58) h=0.78;                                        // flat snap
    }
    else { h=Math.max(0, 0.30-(a-0.80)*1.15); if(Math.sin(a*90)>0.3) h+=0.04; }
    h+= (n2(x*0.12,7)-0.5)*0.02;
    return hy(x) - Math.max(0,h)*(H*0.40);
  }
  var RUIN0=0.015*W, RUIN1=0.27*W;
  function ruinTop(x){
    var b=(x-RUIN0)/(RUIN1-RUIN0);
    if(b<0||b>1) return horizon;
    var rh=0.16*Math.pow(Math.sin(b*Math.PI),0.6)*(0.4+0.6*Math.sin(b*30));
    if(Math.sin(b*13)>0.35) rh+=0.05;
    if(b>0.27&&b<0.35) rh=0.34;                                          // broken tower 1
    if(b>0.61&&b<0.67) rh=0.27;                                          // broken tower 2
    return hy(x) - Math.max(0,rh)*(H*0.40);
  }
  function skylineTop(x){ return Math.min(cathTop(x), ruinTop(x)); }
  function inSky(x,y){ return y < skylineTop(x)-0.5; }

  /* windows (lancets + rose) */
  var lancets=[
    {x:0.665*W,y:0.285*H,w:0.024*W,h:0.065*H},
    {x:0.715*W,y:0.16*H, w:0.026*W,h:0.085*H},
    {x:0.745*W,y:0.16*H, w:0.026*W,h:0.085*H},
    {x:0.885*W,y:0.305*H,w:0.022*W,h:0.055*H}
  ];
  var rose={x:0.730*W,y:0.155*H,r:0.024*W};

  /* fires on ruin towers */
  var fires=[{x:RUIN0+(RUIN1-RUIN0)*0.31,y:0,p:1.0},{x:RUIN0+(RUIN1-RUIN0)*0.64,y:0,p:0.75}];
  fires.forEach(function(f){ f.y=ruinTop(f.x)-2; });

  /* ── tone fields ────────────────────────────────── */
  function skyTone(x,y){
    var dm=Math.hypot(x-moon.x,y-moon.y);
    var g=Math.max(0, 1.05 - dm/(moon.r*2.6));
    var fog=Math.max(0, 1-(horizon-y)/(H*0.13))*0.42;
    var f=0;
    for(var i=0;i<fires.length;i++){
      var d=Math.hypot(x-fires[i].x,y-fires[i].y);
      f=Math.max(f, fires[i].p*Math.max(0,1-d/(0.085*W)));
    }
    var t=Math.max(g*g*1.15, fog, f*0.75);
    t+=(n2(x*0.015,y*0.02)-0.5)*0.14;
    return Math.max(0,Math.min(1.2,t));
  }
  function winGlow(x,y){
    var g=0;
    for(var i=0;i<lancets.length;i++){
      var l=lancets[i];
      var d=Math.hypot(x-l.x,(y-(l.y+l.h*0.5))*1.3);
      g=Math.max(g, Math.max(0,1-d/(l.w*3.6)));
    }
    var dr=Math.hypot(x-rose.x,y-rose.y);
    g=Math.max(g, Math.max(0,1-dr/(rose.r*3.0)));
    return g;
  }
  function cathLight(x,y){
    var top=cathTop(x);
    if(y<top||y>hy(x)) return 0;
    var a=(x-CATH0)/CW;
    var lit=Math.max(0.04, 0.62-0.95*a);                    // moonlit left
    var edge=Math.max(0, 1-(y-top)/(H*0.07));               // top rim
    var t=(lit*0.34 + edge*0.42*Math.max(0.3,lit) + winGlow(x,y)*0.55)*1.25;
    if((a>0.36&&a<0.405)||(a>0.575&&a<0.615)||(a>0.79&&a<0.815)) t*=0.22;   // shadow joints between blocks
    t+=(n2(x*0.05,y*0.05)-0.5)*0.10;
    if(n2(x*0.09,y*0.09)>0.78) t*=0.25;                      // cracks
    return Math.max(0,Math.min(1,t));
  }
  var wx=0.325*W, wy=horizon+(H-horizon)*0.34;
  var fx=0.795*W, fy=horizon+(H-horizon)*0.62;
  function groundTone(x,y){
    var fog=Math.max(0,1-(y-hy(x))/(H*0.062))*0.58*(0.35+0.65*n2(x*0.02,y*0.31));
    var px=0.185*W+(y-H)*(-0.20), pw=0.03*W+(y-horizon)*0.13;
    var pd=Math.abs(x-px);
    var path=pd<pw?(1-pd/pw)*0.70*Math.max(0.25,1-(y-horizon)/(H-horizon)):0;
    var lamp=Math.max(0,1-Math.hypot(x-(wx+9),y-(wy+7))/34)*0.85;
    var camp=Math.max(0,1-Math.hypot(x-fx,y-(fy-4))/52)*0.8;
    var spill=0;                                            // red spill under windows
    for(var i=1;i<3;i++){
      var l=lancets[i];
      spill=Math.max(spill,Math.max(0,1-Math.hypot(x-l.x,(y-horizon-8)*2.2)/(l.w*4))*0.20);
    }
    var t=Math.max(fog,path,lamp,camp,spill);
    t+=(n2(x*0.04,y*0.05)-0.5)*0.12;
    return Math.max(0,Math.min(1,t));
  }
  function groundColor(x,y){
    for(var i=1;i<3;i++){
      var l=lancets[i];
      if(Math.hypot(x-l.x,(y-horizon-8)*2.2)<l.w*2.1 && n2(x*0.2,y*0.2)>0.48) return 'blood';
    }
    return 'etch';
  }

  /* ── stroke store ───────────────────────────────── */
  var S={};
  function stroke(pts,w,c){ if(pts.length>1){ var k=c+'|'+w; (S[k]=S[k]||[]).push(pts);} }
  function runs(pts,keep,color,w){
    var run=[],lastC=null;
    function flush(){ if(run.length>1&&lastC)stroke(run,w,lastC); run=[]; }
    for(var i=0;i<pts.length;i++){
      var p=pts[i], ok=p&&keep(p[0],p[1]);
      var c=ok?color(p[0],p[1]):null;
      if(!ok||c!==lastC){flush();lastC=c;}
      if(ok)run.push(p);
    }
    flush();
  }
  function wob(x,y,ph,amp){return (n2(x*0.08+ph*3.7,y*0.08)-0.5)*2*amp;}
  var TH=[0.07,0.20,0.36,0.55,0.76];

  /* ══ PAINT ═══════════════════════════════════════ */
  L.push({t:'rect',x:0,y:0,w:W,h:H,c:'sky'});

  // fire glows (behind silhouettes)
  fires.forEach(function(f){L.push({t:'glow',x:f.x,y:f.y-12,r:0.11*W*f.p,c:'blood',a:0.55});
    for(var ei=0;ei<5;ei++){var ex=f.x+(hash(ei,f.x)-0.5)*22, el=6+hash(ei,9)*16;
      stroke([[ex,f.y-14-hash(ei,3)*34],[ex+(hash(ei,5)-0.5)*5,f.y-14-hash(ei,3)*34-el]],1.2,'blood');}});
  L.push({t:'glow',x:moon.x,y:moon.y,r:moon.r*2.4,c:'blood',a:0.42});

  /* sky engraving: near-horizontal lines flowing AROUND the moon */
  (function(){
    var idx=0;
    for(var y0=4;y0<horizon+ARC-1;y0+=2.6,idx++){
      var th=TH[idx%5], pts=[];
      for(var x=-4;x<=W+4;x+=3.0){
        var y=y0 + 5*Math.sin(x/W*Math.PI*1.1+idx*0.3)*0.4;
        // deflect around the moon disc
        var dx=x-moon.x, dy=y-moon.y;
        var d=Math.hypot(dx,dy);
        if(d<moon.r*2.5){
          var push=(moon.r*2.5-d)/(moon.r*2.5);
          y+= (dy>=0?1:-1) * push*push * moon.r*0.58;
          dy=y-moon.y; d=Math.hypot(dx,dy);
        }
        if(d<moon.r+1.8){ pts.push(null); continue; }
        pts.push([x, y+wob(x,y,idx,0.8)]);
      }
      runs(pts,function(px,py){return py<horizon-1&&inSky(px,py)&&skyTone(px,py)>th;},
        function(px,py){ return Math.hypot(px-moon.x,py-moon.y)<moon.r*1.85?'blood':'etch'; },
        0.7);
    }
    // second diagonal layer in the halo core (richness)
    idx=0;
    for(var d0=-H;d0<W;d0+=4.2,idx++){
      var th2=TH[1+(idx%2)], pts2=[];
      for(var yy=0;yy<horizon;yy+=3){
        var xx=d0+yy*0.9;
        var dd=Math.hypot(xx-moon.x,yy-moon.y);
        if(dd<moon.r+2||dd>moon.r*2.6)continue;
        pts2.push([xx+wob(xx,yy,idx,0.6),yy]);
      }
      runs(pts2,function(px,py){return inSky(px,py)&&skyTone(px,py)>th2;},
        function(){return 'blood';},0.65);
    }
  })();

  /* smoke: engraved curls rising from tower + fires */
  function smokeCurls(sx,sy,n,scale,drift){
    var x=sx,y=sy,r=3.5*scale;
    for(var i=0;i<n;i++){
      var arc=[];
      var a0=hash(i,sx)*Math.PI;
      for(var a=a0;a<a0+2.5;a+=0.3)
        arc.push([x+Math.cos(a)*r+wob(x,a*9,i,0.5), y+Math.sin(a)*r*0.72]);
      stroke(arc,0.8,'ash');
      x+=drift*(6+r*0.5)+(n2(x*0.05,i*3)-0.5)*7;
      y-=r*1.5+4;
      r*=1.22;
      if(y<H*0.06)break;
    }
  }
  smokeCurls(0.652*W,cathTop(0.652*W)+4,9,1.15,0.5);
  smokeCurls(fires[0].x,fires[0].y-6,7,0.9,0.65);
  

  /* far ruins: silhouette + rim + flames */
  (function(){
    var pts=[];
    for(var x=RUIN0;x<=RUIN1;x+=2.5)pts.push(x.toFixed(1)+','+ruinTop(x).toFixed(1));
    pts.push(RUIN1.toFixed(1)+','+horizon,RUIN0.toFixed(1)+','+horizon);
    L.push({t:'poly',p:pts.join(' '),c:'far'});
    var seg=[];
    for(var x2=RUIN0;x2<=RUIN1;x2+=2){
      var y2=ruinTop(x2);
      if(y2<horizon-2)seg.push([x2,y2-0.6+wob(x2,y2,4,0.5)]);
      else{if(seg.length>2)stroke(seg,0.8,'etch');seg=[];}
    }
    if(seg.length>2)stroke(seg,0.8,'etch');
    fires.forEach(function(f){
      var fl='M'+(f.x-11)+','+(f.y+3)+' q3,-16 5.5,-22 q3,11 6.6,14 q3,-19 6.6,-25 q5.5,14 3.3,25 q8,-8 5.5,-19 q5.5,16 -2.7,27 q-14,8 -25,0 z';
      L.push({t:'path',d:fl,c:'blood'});
    });
  })();

  /* cathedral: mass, engraving, windows, rose */
  (function(){
    var pts=[];
    for(var x=CATH0;x<=CATH1;x+=2)pts.push(x.toFixed(1)+','+cathTop(x).toFixed(1));
    pts.push(CATH1.toFixed(1)+','+horizon,CATH0.toFixed(1)+','+horizon);
    L.push({t:'poly',p:pts.join(' '),c:'stone'});

    // vertical strokes (primary)
    var idx=0;
    for(var x2=CATH0+1.5;x2<CATH1;x2+=2.7,idx++){
      var th=TH[idx%5],p2=[];
      for(var y=cathTop(x2)-0.5;y<horizon;y+=2.6){
        if(((y+x2*0.33)%26)<4.5){p2.push(null);continue;}              // stone-course breaks
        p2.push([x2+wob(x2,y,1,0.55),y]);
      }
      runs(p2,function(px,py){return cathLight(px,py)>th;},
        function(px,py){return winGlow(px,py)>0.55?'blood':'etch';},0.7);
    }
    // masonry courses (horizontal, mid tones)
    idx=0;
    for(var y3=H*0.06;y3<horizon;y3+=7.0,idx++){
      var th3=TH[2+(idx%3)],p3=[];
      for(var x3=CATH0;x3<CATH1;x3+=3)p3.push([x3,y3+wob(x3,y3,6,0.6)]);
      runs(p3,function(px,py){return py>cathTop(px)+2&&cathLight(px,py)>th3;},
        function(){return 'etch';},0.5);
    }
    // rim light along profile
    var seg=[];
    for(var x4=CATH0;x4<=CATH1;x4+=1.6){
      var y4=cathTop(x4),y5=cathTop(x4+1.6);
      if(Math.abs(y5-y4)<3.2&&y4<horizon-4)seg.push([x4,y4-0.8+wob(x4,y4,9,0.4)]);
      else{if(seg.length>2)stroke(seg,1.15,'etch');seg=[];}
    }
    if(seg.length>2)stroke(seg,1.15,'etch');
    // vertical edges of the great tower & spire (crisp bone lines)
    [[0.40,0.97],[0.58,0.44]].forEach(function(e){
      var ex=CATH0+e[0]*CW;
      stroke([[ex,cathTop(ex+2)],[ex,horizon]],0.9,'etch');
    });

    // lancet windows: outline + mullion + fire fill
    lancets.forEach(function(l){
      var x0=l.x-l.w/2,x1=l.x+l.w/2,ya=l.y+l.h*0.38;
      var d='M'+x0.toFixed(1)+','+(l.y+l.h).toFixed(1)+' L'+x0.toFixed(1)+','+ya.toFixed(1)+
        ' Q'+x0.toFixed(1)+','+l.y.toFixed(1)+' '+l.x.toFixed(1)+','+l.y.toFixed(1)+
        ' Q'+x1.toFixed(1)+','+l.y.toFixed(1)+' '+x1.toFixed(1)+','+ya.toFixed(1)+
        ' L'+x1.toFixed(1)+','+(l.y+l.h).toFixed(1)+' Z';
      L.push({t:'path',d:d,c:'winfire'});
      L.push({t:'path',d:d,c:'none',sc:'etch',sw:0.9,so:0.8});
      stroke([[l.x,l.y+3],[l.x,l.y+l.h]],1.2,'void');                 // mullion
      stroke([[x0+1,l.y+l.h*0.55],[x1-1,l.y+l.h*0.55]],1.0,'void');   // transom
      L.push({t:'glow',x:l.x,y:l.y+l.h*0.5,r:l.w*2.2,c:'blood',a:0.28});
    });

    // rose window: burning wheel
    L.push({t:'circle',x:rose.x,y:rose.y,r:rose.r,c:'winfire'});
    L.push({t:'glow',x:rose.x,y:rose.y,r:rose.r*2.6,c:'blood',a:0.34});
    for(var a6=0;a6<Math.PI*2;a6+=Math.PI/8)
      stroke([[rose.x+Math.cos(a6)*rose.r*0.25,rose.y+Math.sin(a6)*rose.r*0.25],
              [rose.x+Math.cos(a6)*rose.r*0.96,rose.y+Math.sin(a6)*rose.r*0.96]],0.9,'void');
    [0.99,0.75,0.28].forEach(function(rr,ri){
      var ring=[];
      for(var a7=0;a7<=Math.PI*2+0.15;a7+=0.18)
        ring.push([rose.x+Math.cos(a7)*rose.r*rr,rose.y+Math.sin(a7)*rose.r*rr]);
      stroke(ring,ri===0?1.2:0.8,ri===0?'etch':'void');
    });
  })();

  /* horizon rim: broken bone segments */
  (function(){
    var seg=[];
    for(var x=0;x<W;x+=3){
      if(n2(x*0.02,50)>0.42&&skyTone(x,hy(x)-3)>0.25)seg.push([x,hy(x)-1+wob(x,horizon,8,0.6)]);
      else{if(seg.length>2)stroke(seg,0.8,'etch');seg=[];}
    }
    if(seg.length>2)stroke(seg,0.8,'etch');
  })();

  /* ground — под дугой планеты */
  (function(){
    var gp=[];
    for(var gx=0;gx<=W;gx+=8)gp.push(gx.toFixed(0)+','+hy(gx).toFixed(1));
    gp.push(W+','+H,'0,'+H);
    L.push({t:'poly',p:gp.join(' '),c:'ground'});
  })();
  (function(){
    var idx=0;
    for(var y=horizon+1.2;y<H;y+=2.3+(y-horizon)*0.036,idx++){
      var th=TH[idx%5],pts=[];
      for(var x=0;x<W;x+=3.0){
        var bend=(hy(x)-horizon)*(1-Math.min(1,(y-horizon)/(H-horizon)));
        pts.push([x,y+bend+wob(x,y,2,1.6)]);
      }
      runs(pts,function(px,py){return py>hy(px)+1&&groundTone(px,py)>th;},groundColor,0.7);
    }
    // tufts of dead grass
    for(var i=0;i<70;i++){
      var gx=hash(i,41)*W, gy=horizon+6+hash(i,43)*(H-horizon)*0.8;
      var t=groundTone(gx,gy);
      if(t<0.12||t>0.7)continue;
      var s=2+hash(i,47)*3;
      stroke([[gx,gy],[gx+(hash(i,53)-0.5)*3,gy-s]],0.7,'etch');
      if(hash(i,59)>0.5)stroke([[gx+1.5,gy],[gx+2.5,gy-s*0.7]],0.6,'etch');
    }
    // rubble stones near path
    for(var j=0;j<12;j++){
      var rx=0.10*W+hash(j,61)*0.30*W, ry=horizon+14+hash(j,67)*(H-horizon)*0.6;
      var rr=2+hash(j,71)*4;
      var st=[];
      for(var a=0;a<=Math.PI*2.1;a+=0.5)
        st.push([rx+Math.cos(a)*rr*(1+0.3*hash(j,a*10)),ry+Math.sin(a)*rr*0.6]);
      stroke(st,0.7,'etch');
    }
  })();

  /* procession of leaning grave-crosses along the path */
  (function(){
    var defs=[[0.415,0.10],[0.465,0.22],[0.515,0.08],[0.565,0.30],[0.615,0.14],[0.665,0.36],[0.44,0.46],[0.36,0.18]];
    defs.forEach(function(g,i){
      var gx=g[0]*W, gy=horizon+(H-horizon)*g[1];
      var hgt=14+hash(i,11)*22, lean=(hash(i,5)-0.5)*0.8;
      var tx=gx+lean*hgt, ty=gy-hgt;
      stroke([[gx,gy],[tx,ty]],3.6,'void');
      stroke([[gx-2,gy],[tx-2,ty]],1.0,'etch');
      var bx=gx+lean*hgt*0.68, by=gy-hgt*0.68;
      stroke([[bx-hgt*0.32,by-lean*2.5],[bx+hgt*0.32,by+lean*2.5]],3.2,'void');
      stroke([[bx-hgt*0.32,by-lean*2.5-1.4],[bx+hgt*0.32,by+lean*2.5-1.4]],0.8,'etch');
      stroke([[tx-1,ty],[tx+1.5,ty-1]],1,'etch');                     // moon glint on top
    });
  })();

  /* wanderer + lantern */
  if(opts.wanderer){
  L.push({t:'glow',x:wx+8,y:wy+6,r:26,c:'flame',a:0.85,cls:'warmglow'});
  L.push({t:'path',d:'M'+wx+','+(wy-17)+' q7,-3 9,4 l7,28 q-12,5 -23,0 z',c:'void',sc:'etch',sw:0.9,so:0.7});
  L.push({t:'circle',x:wx+5,y:wy-19,r:4.8,c:'void',sc:'etch',sw:0.9,so:0.7});
  L.push({t:'circle',x:wx+12,y:wy+8,r:2.6,c:'flame',cls:'warmdot'});
  stroke([[wx+12,wy+2],[wx+12,wy+5.5]],0.8,'etch');                    // lantern handle
  stroke([[wx+16,wy-26],[wx+14,wy+16]],1.3,'etch');                    // staff
  stroke([[wx-1,wy-14],[wx-3,wy+12]],1.0,'etch');                      // cloak rim (moon side)
  stroke([[wx+1,wy-22],[wx+7,wy-24]],0.9,'etch');                      // hood rim

  }

  /* campfire + jester */
  if(opts.campfire){
  L.push({t:'glow',x:fx,y:fy-6,r:44,c:'flame',a:0.7,cls:'warmglow'});
  L.push({t:'path',d:'M'+(fx-16)+','+fy+' q16,6 32,0 l-4,4 q-12,4 -24,0 z',c:'void',sc:'etch',sw:0.8,so:0.5});
  L.push({t:'path',d:'M'+fx+','+(fy-30)+' q7,10 3,20 q8,-4 6,-13 q6,14 -3,22 q-14,6 -18,-6 q-3,-10 4,-16 q-2,8 3,10 q-3,-9 5,-17 z',c:'flame',cls:'warmglow'});
  stroke([[fx+1,fy-34],[fx+1,fy-52]],1,'etch');
  L.push({t:'circle',x:fx+1,y:fy-57,r:5,c:'void',sc:'etch',sw:1,so:0.7});
  L.push({t:'path',d:'M'+(fx-4)+','+(fy-60)+' q-8,-6 -6,-13',c:'none',sc:'etch',sw:1,so:0.7});
  L.push({t:'path',d:'M'+(fx+6)+','+(fy-60)+' q8,-6 6,-13',c:'none',sc:'etch',sw:1,so:0.7});
  L.push({t:'path',d:'M'+(fx+34)+','+(fy+4)+' q10,-22 20,0 q2,6 -4,8 l-14,0 q-4,-3 -2,-8 z',c:'void',sc:'etch',sw:0.8,so:0.6});
  L.push({t:'circle',x:fx+44,y:fy-22,r:5.4,c:'void',sc:'etch',sw:0.8,so:0.6});
  L.push({t:'path',d:'M'+(fx+40)+','+(fy-26)+' l-6,-8 l4,8 M'+(fx+44)+','+(fy-28)+' l0,-9 l2,9 M'+(fx+48)+','+(fy-26)+' l7,-7 l-5,8',c:'none',sc:'etch',sw:1.6,so:0.6});

  }

  /* ── THE BLOOD MOON: engraved sphere ── */
  L.push({t:'circle',x:moon.x,y:moon.y,r:moon.r,c:'bloodDark'});
  (function(){
    // latitude hatching, denser toward lower-right limb
    var idx=0;
    for(var ly=-moon.r+2;ly<moon.r-1;ly+=1.3,idx++){
      var th=TH[idx%5];
      var half=Math.sqrt(moon.r*moon.r-ly*ly);
      var pts=[];
      for(var lx=-half+1;lx<half-1;lx+=2.4){
        var sag=ly*0.16*(1-(lx*lx)/(half*half));
        pts.push([moon.x+lx, moon.y+ly+sag+wob(lx,ly,idx,0.4)]);
      }
      runs(pts,function(px,py){
          var nx=(px-moon.x)/moon.r, ny=(py-moon.y)/moon.r;
          var light=0.20+0.85*Math.max(0,(-nx*0.62-ny*0.78));           // lit upper-left limb
          var mare=n2(nx*3+9,ny*3+4)>0.60?-0.30:0;                      // maria eat light
          return (light+mare)>th*0.7+0.03;
        },function(){return 'blood';},0.75);
    }
    // limb ring
    var ring=[];
    for(var a=0;a<=Math.PI*2+0.1;a+=0.12)
      ring.push([moon.x+Math.cos(a)*moon.r,moon.y+Math.sin(a)*moon.r]);
    stroke(ring,1.5,'blood');
  })();
  // drips
  (function(){
    var xs=[-0.66,-0.38,-0.12,0.13,0.42,0.68];
    for(var i=0;i<xs.length;i++){
      var dx=xs[i]*moon.r;
      var yb=moon.y+Math.sqrt(Math.max(0,moon.r*moon.r-dx*dx));
      var len=(16+hash(i,23)*54)*(1-Math.abs(xs[i])*0.45);
      stroke([[moon.x+dx,yb-2],[moon.x+dx,yb+len]],1.1,'blood');
      L.push({t:'circle',x:moon.x+dx,y:yb+len+1.6,r:1.6,c:'blood'});
    }
  })();
  // crow flock: from moon toward the cathedral
  (function(){
    var flock=[[0.255,0.205,11],[0.293,0.165,9],[0.235,0.275,8],[0.35,0.13,9],[0.415,0.10,7],
               [0.47,0.155,8],[0.53,0.12,6],[0.585,0.165,5],[0.315,0.30,7],[0.41,0.24,5.5]];
    flock.forEach(function(b,i){
      var cx=b[0]*W, cy=b[1]*H, s=b[2];
      var f=hash(i,77)*0.8+0.6;                                        // wing phase
      stroke([[cx-s,cy-s*0.1],[cx-s*0.35,cy-s*f*0.6],[cx,cy]],2.0,'void');
      stroke([[cx,cy],[cx+s*0.35,cy-s*f*0.6],[cx+s,cy-s*0.1]],2.0,'void');
    });
  })();

  /* dead tree repoussoir over the halo */
  (function(){
    function branch(x,y,ang,len,w,depth){
      var pts=[[x,y]];
      var steps=Math.max(3,Math.floor(len/8));
      for(var i=1;i<=steps;i++){
        ang+=(n2(x*0.04+i*0.7,depth*5)-0.5)*0.5;
        x+=Math.cos(ang)*len/steps; y+=Math.sin(ang)*len/steps;
        pts.push([x,y]);
        if(depth<3&&i===Math.floor(steps*0.5)&&hash(x,y)>0.3)
          branch(x,y,ang+(hash(x,depth)>0.5?0.85:-0.85),len*0.5,Math.max(0.8,w*0.5),depth+1);
      }
      stroke(pts,w,'void');
      // dead droop twigs at tips
      if(depth>=1&&hash(x,y)>0.45)
        stroke([[x,y],[x+Math.cos(ang+0.9)*7,y+Math.sin(ang+0.9)*7+4]],Math.max(0.7,w*0.4),'void');
    }
    var tpts=[[0.035*W,H],[0.045*W,H*0.84],[0.040*W,H*0.66],[0.052*W,H*0.50],[0.048*W,H*0.38]];
    stroke(tpts,13,'void'); stroke(tpts,9,'void'); stroke(tpts,6,'void');
    branch(0.048*W,H*0.40,-0.82,H*0.40,6.5,0);   // main up-right over halo
    branch(0.050*W,H*0.52,-0.22,W*0.26,5.5,0);  // long right arm
    branch(0.044*W,H*0.62,-1.9,W*0.06,3,1);
    branch(0.049*W,H*0.38,-1.35,H*0.16,3.4,1);
    // bone rim on moon side of the trunk
    var rim=tpts.map(function(p){return [p[0]+5.0,p[1]-1];});
    stroke(rim,1.1,'etch');
  })();

  /* пустая рама — конец дороги (только в игре) */
  if(opts.frame){
    var qx=0.965*W, qy=horizon+(H-horizon)*0.72;
    stroke([[qx-15,qy],[qx-13,qy-62]],3,'void');
    stroke([[qx+15,qy],[qx+13,qy-62]],3,'void');
    stroke([[qx-14,qy-2],[qx-12,qy-60]],0.9,'etch');
    var fr=[[qx-27,qy-58],[qx+27,qy-58],[qx+27,qy-128],[qx-27,qy-128],[qx-27,qy-58]];
    stroke(fr,1.6,'etch');
    stroke(fr.map(function(p){return[p[0]+(p[0]<qx?4:-4),p[1]+(p[1]<qy-90?4:-4)];}),0.8,'etch');
    [[qx-27,qy-58],[qx+27,qy-58],[qx+27,qy-128],[qx-27,qy-128]].forEach(function(cp){
      L.push({t:'circle',x:cp[0],y:cp[1],r:3,c:'void',sc:'etch',sw:1,so:0.9});
    });
    stroke([[qx-16,qy-50],[qx+16,qy-50]],0.7,'ash');
  }

  return {list:L, strokes:S, W:W, H:H};
}


/* ── TOWN block — вид сбоку-сверху, кровавая луна, жирные пропсы ── */
function genTown(W,H,opts){
  opts=opts||{}; var RU=!!opts.ruined;
  var L=[];
  var horizon=0.42*H, ARC=0.015*W;
  function hy(x){var u=(x-W*0.5)/(W*0.5);return horizon+ARC*u*u;}
  var moon={x:0.525*W, y:0.15*H, r:0.034*W};

  function hash(x,y){var n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}
  function n2(x,y){
    var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
    function sm(t){return t*t*(3-2*t);}
    var a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);
    return a+(b-a)*sm(xf)+(c-a)*sm(yf)+(a-b-c+d)*sm(xf)*sm(yf);
  }
  var S={};
  function stroke(pts,w,c){ if(pts.length>1){var k=c+'|'+w;(S[k]=S[k]||[]).push(pts);} }
  function runs(pts,keep,color,w){
    var run=[],lastC=null;
    function flush(){ if(run.length>1&&lastC)stroke(run,w,lastC); run=[]; }
    for(var i=0;i<pts.length;i++){
      var p=pts[i], ok=p&&keep(p[0],p[1]);
      var c=ok?color(p[0],p[1]):null;
      if(!ok||c!==lastC){flush();lastC=c;}
      if(ok)run.push(p);
    }
    flush();
  }
  var TH=[0.07,0.20,0.36,0.55,0.76];
  function wob(x,y,ph,amp){return (n2(x*0.08+ph*3.7,y*0.08)-0.5)*2*amp;}

  /* houses */
  var houses=[
    {x0:0.075*W,x1:0.165*W,hh:150,roof:52,chimney:true},
    {x0:0.32*W, x1:0.395*W,hh:120,roof:44},
    {x0:0.59*W, x1:0.69*W, hh:170,roof:0,office:true},
    {x0:0.78*W, x1:0.85*W, hh:130,roof:48}
  ];
  if(RU) houses.forEach(function(h,i){ h.hh=Math.round(h.hh*(0.38+0.14*((i*7)%3))); h.roof=0; h.chimney=false; h.broken=true; });
  var win3={x:0,y:0};
  function houseTop(x){
    for(var i=0;i<houses.length;i++){
      var h=houses[i];
      if(x>=h.x0-6&&x<=h.x1+6){
        var mid=(h.x0+h.x1)/2, base=hy(mid)-h.hh;
        if(h.roof>0){
          if(x<h.x0||x>h.x1){var t=x<h.x0?(x-(h.x0-6))/6:((h.x1+6)-x)/6;return base- h.roof*0.1*t;}
          var tt=1-Math.abs(x-mid)/((h.x1-h.x0)/2);
          return base - h.roof*tt;
        }
        if(x<h.x0||x>h.x1)return hy(x);
        if(h.broken) return base + Math.abs(Math.sin(x*0.11)*14) + (Math.sin(x*0.31)>0.6?10:0);
        if((((x-h.x0)/10)%2)<1) return base-8;
        return base;
      }
    }
    return hy(x);
  }
  function farTop(x){
    var t=hy(x)-(42+22*Math.sin(x*0.004)+16*Math.sin(x*0.0113+2));
    if((x%(0.11*W))<6) t-=22;
    return t;
  }
  function skylineTop(x){ return Math.min(houseTop(x),farTop(x)); }
  function inSky(x,y){ return y<skylineTop(x)-0.6; }

  function skyTone(x,y){
    var d=Math.hypot(x-moon.x,y-moon.y);
    var g=Math.max(0,1.12-d/(moon.r*3.0)); g=g*g;
    var fog=Math.max(0,1-(hy(x)-y)/(H*0.09))*0.42;
    return Math.max(g*1.15,fog)+(n2(x*0.015,y*0.02)-0.5)*0.14;
  }
  function skyColor(x,y){
    var d=Math.hypot(x-moon.x,y-moon.y);
    if(d<moon.r*1.5) return 'blood';
    if(skyTone(x,y)<0.28) return 'ash';
    return 'etch';
  }

  /* ══ PAINT ══ */
  L.push({t:'rect',x:0,y:0,w:W,h:H,c:'sky'});
  L.push({t:'glow',x:moon.x,y:moon.y,r:moon.r*2.5,c:'blood',a:0.45});

  /* sky — v5 deflected lines around the BLOOD moon + diagonal red layer */
  (function(){
    var idx=0;
    for(var y0=4;y0<horizon+ARC-1;y0+=2.6,idx++){
      var th=TH[idx%5], pts=[];
      for(var x=-4;x<=W+4;x+=3.0){
        var y=y0;
        var dx=x-moon.x, dy=y-moon.y;
        var d=Math.hypot(dx,dy);
        if(d<moon.r*2.5){
          var push=(moon.r*2.5-d)/(moon.r*2.5);
          y+=(dy>=0?1:-1)*push*push*moon.r*0.58;
          dy=y-moon.y; d=Math.hypot(dx,dy);
        }
        if(d<moon.r+1.8){pts.push(null);continue;}
        pts.push([x,y+wob(x,y,idx,0.8)]);
      }
      runs(pts,function(px,py){return py<hy(px)-1&&inSky(px,py)&&skyTone(px,py)>th;},skyColor,0.7);
    }
    idx=0;
    for(var d0=-H;d0<W;d0+=5.6,idx++){
      var th2=TH[2+(idx%2)],pts2=[];
      for(var yy=0;yy<horizon+ARC;yy+=3){
        var xx=d0+yy*0.9;
        var dd=Math.hypot(xx-moon.x,yy-moon.y);
        if(dd<moon.r+2||dd>moon.r*2.6)continue;
        pts2.push([xx+wob(xx,yy,idx,0.6),yy]);
      }
      runs(pts2,function(px,py){return inSky(px,py)&&skyTone(px,py)>th2;},
        function(){return 'blood';},0.65);
    }
  })();

  /* THE BLOOD MOON — как за вратами: тёмный диск, свет на кромке */
  L.push({t:'circle',x:moon.x,y:moon.y,r:moon.r,c:'bloodDark'});
  (function(){
    var idx=0;
    for(var ly=-moon.r+1.5;ly<moon.r-1;ly+=1.3,idx++){
      var th=TH[idx%5];
      var half=Math.sqrt(moon.r*moon.r-ly*ly), pts=[];
      for(var lx=-half+1;lx<half-1;lx+=2.0)
        pts.push([moon.x+lx,moon.y+ly+ly*0.10*(1-(lx*lx)/(half*half))+wob(lx,ly,7,0.4)]);
      runs(pts,function(px,py){
          var nx=(px-moon.x)/moon.r, ny=(py-moon.y)/moon.r;
          var light=0.20+0.85*Math.max(0,(-nx*0.62-ny*0.78));
          if(n2(nx*3+9,ny*3+4)>0.60) light-=0.30;
          return light>TH[idx%5]*0.7+0.03;
        },function(){return 'blood';},0.75);
    }
    var ring=[];
    for(var a=0;a<=Math.PI*2+0.1;a+=0.09)
      ring.push([moon.x+Math.cos(a)*moon.r,moon.y+Math.sin(a)*moon.r]);
    stroke(ring,1.5,'blood');
    // потёки
    var xs=[-0.6,-0.28,0.05,0.4,0.66];
    for(var i=0;i<xs.length;i++){
      var dxx=xs[i]*moon.r;
      var yb=moon.y+Math.sqrt(Math.max(0,moon.r*moon.r-dxx*dxx));
      var len=(12+hash(i,23)*38)*(1-Math.abs(xs[i])*0.4);
      stroke([[moon.x+dxx,yb-1],[moon.x+dxx,yb+len]],1.1,'blood');
      L.push({t:'circle',x:moon.x+dxx,y:yb+len+1.4,r:1.5,c:'blood'});
    }
  })();

  /* far roofs */
  (function(){
    var pts=[];
    for(var x=0;x<=W;x+=3)pts.push(x.toFixed(1)+','+farTop(x).toFixed(1));
    pts.push(W+','+(horizon+ARC+2),'0,'+(horizon+ARC+2));
    L.push({t:'poly',p:pts.join(' '),c:'far'});
    var seg=[];
    for(var x2=0;x2<=W;x2+=3){
      if(skyTone(x2,farTop(x2))>0.14)seg.push([x2,farTop(x2)-0.6]);
      else{if(seg.length>2)stroke(seg,0.7,'ash');seg=[];}
    }
    if(seg.length>2)stroke(seg,0.7,'ash');
  })();

  /* ground — под дугой планеты */
  (function(){
    var gp=[];
    for(var gx=0;gx<=W;gx+=8)gp.push(gx.toFixed(0)+','+hy(gx).toFixed(1));
    gp.push(W+','+H,'0,'+H);
    L.push({t:'poly',p:gp.join(' '),c:'ground'});
  })();

  /* front houses */
  houses.forEach(function(h,hi){
    var mid=(h.x0+h.x1)/2, HY=hy(mid), base=HY-h.hh;
    L.push({t:'poly',p:[h.x0+','+HY,h.x0+','+base,h.x1+','+base,h.x1+','+HY].join(' '),c:'stone'});
    if(h.roof>0){
      L.push({t:'poly',p:[(h.x0-8)+','+base,mid+','+(base-h.roof),(h.x1+8)+','+base].join(' '),c:'void'});
      stroke([[h.x0-8,base],[mid,base-h.roof],[h.x1+8,base]],1.2,'etch');
      // штрих кровли
      for(var rx=h.x0-2;rx<h.x1+2;rx+=5){
        var t=1-Math.abs(rx-mid)/((h.x1-h.x0)/2+8);
        if(t<=0.05)continue;
        stroke([[rx,base-2],[rx+3,base-h.roof*t*0.85]],0.6,'ash');
      }
    } else {
      var par=[];
      for(var px2=h.x0;px2<=h.x1;px2+=1.5)par.push([px2,houseTop(px2)-0.5]);
      stroke(par,h.broken?1.0:1.2,'etch');
      if(h.broken){
        // пролом в стене
        var bx0=mid-14+((hi*13)%12), bw=26;
        L.push({t:'path',d:'M'+bx0+','+HY+' l4,-26 l7,-8 l6,9 l5,-6 l4,31 z',c:'sky'});
        stroke([[bx0,HY],[bx0+4,HY-26],[bx0+11,HY-34],[bx0+17,HY-25],[bx0+22,HY-31],[bx0+26,HY]],0.9,'etch');
      }
    }
    stroke([[h.x0,HY],[h.x0,base]],1.1,'etch');
    stroke([[h.x1,HY],[h.x1,base]],1.1,'etch');
    // фасадный штрих v5
    var idx=0;
    for(var x3=h.x0+3;x3<h.x1-2;x3+=3.0,idx++){
      if(h.office)break;
      var thh=TH[idx%5],p3=[];
      for(var y=base+3;y<HY-1;y+=2.6){
        if(((y+x3*0.33)%26)<4.5){p3.push(null);continue;}
        p3.push([x3+wob(x3,y,1,0.55),y]);
      }
      runs(p3,function(px,py){
        var lit=Math.max(0.08,0.55-Math.abs(px-moon.x)/(0.55*W));
        return lit*(0.7+(n2(px*0.05,py*0.05)-0.5)*0.5)>thh*0.55;
      },function(){return 'etch';},0.6);
    }
    // окна
    var wcount=Math.max(1,Math.floor((h.x1-h.x0)/46));
    for(var wi=0;wi<wcount;wi++){
      var wxp=h.x0+(wi+0.5)*((h.x1-h.x0)/wcount)-6;
      var wyp=base+(HY-base)*0.30;
      if(h.office&&wi===1&&!RU){
        win3.x=wxp+6; win3.y=wyp;
        L.push({t:'rect',x:wxp,y:wyp,w:13,h:17,c:'flame',cls:'warmglow'});
        L.push({t:'glow',x:wxp+6,y:wyp+8,r:26,c:'flame',a:0.5,cls:'warmglow'});
        stroke([[wxp+6.5,wyp],[wxp+6.5,wyp+17]],1,'void');
        stroke([[wxp,wyp+8.5],[wxp+13,wyp+8.5]],1,'void');
        stroke([[wxp-1,wyp-1],[wxp+14,wyp-1],[wxp+14,wyp+18],[wxp-1,wyp+18],[wxp-1,wyp-1]],0.9,'etch');
      } else if(h.office&&wi===1&&RU){
        win3.x=wxp+6; win3.y=wyp;
        L.push({t:'rect',x:wxp,y:wyp,w:13,h:17,c:'void'});
        stroke([[wxp,wyp],[wxp+13,wyp+17]],0.9,'etch');   // разбитая рама крестом
        stroke([[wxp+13,wyp],[wxp,wyp+17]],0.9,'etch');
        stroke([[wxp-1,wyp-1],[wxp+14,wyp-1],[wxp+14,wyp+18],[wxp-1,wyp+18],[wxp-1,wyp-1]],0.9,'etch');
      } else {
        L.push({t:'rect',x:wxp,y:wyp,w:12,h:16,c:'void'});
        stroke([[wxp,wyp],[wxp+12,wyp],[wxp+12,wyp+16],[wxp,wyp+16],[wxp,wyp]],0.9,'etch');
      }
    }
    var dx2=mid-8+(hi%2)*10;
    L.push({t:'rect',x:dx2,y:HY-26,w:15,h:26,c:'void'});
    stroke([[dx2,HY-26],[dx2+15,HY-26]],0.9,'etch');
    if(h.chimney){
      var cx=h.x0+(h.x1-h.x0)*0.72, cy=base-h.roof*0.55;
      L.push({t:'rect',x:cx-5,y:cy-18,w:11,h:18,c:'void'});
      stroke([[cx-5,cy-18],[cx+6,cy-18]],1,'etch');
      for(var off=0;off<2;off++){
        var pts=[];
        for(var y2=cy-20;y2>H*0.12;y2-=4){
          var t=(cy-20-y2);
          pts.push([cx+off*4+t*0.10+(2+16*t/(cy-20-H*0.12))*Math.sin(t*0.03+off),y2]);
        }
        stroke(pts,0.85,'ash');
      }
    }
  });

  /* Жертвенный костёр — кольцо камней (вид сверху-сбоку), Шут у огня */
  var fx=0.225*W, fy=hy(0.225*W)+(H-horizon)*0.36;
  L.push({t:'glow',x:fx,y:fy-8,r:52,c:'flame',a:0.7,cls:'warmglow'});
  // кольцо камней — эллипс из 9 валунов
  for(var st=0;st<9;st++){
    var a=st/9*Math.PI*2;
    var sx=fx+Math.cos(a)*24, sy=fy+Math.sin(a)*10;
    L.push({t:'circle',x:sx,y:sy,r:3.4+hash(st,3)*1.6,c:'void',sc:'etch',sw:1,so:0.85});
  }
  L.push({t:'path',d:'M'+fx+','+(fy-36)+' q9,12 4,24 q10,-5 7,-16 q8,17 -4,27 q-17,7 -22,-7 q-4,-12 5,-19 q-2,10 4,12 q-4,-11 6,-21 z',c:'flame',cls:'warmglow'});
  for(var e=0;e<3;e++)
    L.push({t:'circle',x:fx-8+hash(e,9)*16,y:fy-42-hash(e,5)*16,r:1.3,c:'flame',cls:'warmdot'});
  stroke([[fx+1,fy-38],[fx+1,fy-58]],1.4,'etch');
  L.push({t:'circle',x:fx+1,y:fy-64,r:6,c:'void',sc:'etch',sw:1.2,so:0.9});
  L.push({t:'path',d:'M'+(fx-5)+','+(fy-67)+' q-10,-7 -8,-16',c:'none',sc:'etch',sw:1.3,so:0.9});
  L.push({t:'path',d:'M'+(fx+7)+','+(fy-67)+' q10,-7 8,-16',c:'none',sc:'etch',sw:1.3,so:0.9});
  // Шут: трёхрогий колпак с бубенцами, кочерга к огню
  var jx=fx+52, jy=fy-2;
  L.push({t:'path',d:'M'+jx+','+jy+' q3,-26 13,-28 q11,-2 14,28 q1,7 -5,9 l-18,0 q-5,-3 -4,-9 z',c:'void',sc:'etch',sw:1.0,so:0.8});
  L.push({t:'circle',x:jx+13,y:jy-34,r:6.4,c:'void',sc:'etch',sw:1.0,so:0.8});
  L.push({t:'path',d:'M'+(jx+8)+','+(jy-38)+' q-9,-3 -11,-12 M'+(jx+13)+','+(jy-40)+' q0,-10 1,-13 M'+(jx+18)+','+(jy-38)+' q9,-5 10,-13',c:'none',sc:'etch',sw:1.6,so:0.85});
  [[-11.5,-50],[1.5,-53.5],[10.5,-51]].forEach(function(b){
    L.push({t:'circle',x:jx+13+b[0]*0.9,y:jy+b[1],r:1.6,c:'etch'});
  });
  stroke([[jx+2,jy-14],[fx+26,fy-6]],1.2,'etch');   // кочерга
  stroke([[jx-6,jy+9],[jx+34,jy+9]],0.8,'ash');      // тень-подсед

  /* пифос — амфора на боку, плотный силуэт */
  var px_=0.415*W, py_=hy(0.415*W)+(H-horizon)*0.30;
  L.push({t:'path',d:'M'+(px_-30)+','+py_+' q-7,-16 0,-32 q30,-12 62,0 q7,16 0,32 q-32,11 -62,0 z',c:'void',sc:'etch',sw:1.3,so:0.95});
  [[-14],[4],[20]].forEach(function(rb){
    L.push({t:'path',d:'M'+(px_+rb[0])+','+(py_-33)+' q4,17 0,34',c:'none',sc:'etch',sw:1.1,so:0.7});
  });
  L.push({t:'circle',x:px_-29,y:py_-16,r:11,c:'void',sc:'etch',sw:1.4,so:1});
  L.push({t:'circle',x:px_-29,y:py_-16,r:6.5,c:'none',sc:'etch',sw:0.9,so:0.6});
  stroke([[px_-38,py_+4],[px_+36,py_+4]],0.9,'ash');
  stroke([[px_-30,py_+7],[px_+24,py_+7]],0.6,'ash');

  /* обломки постиндустрии (только в руинах) */
  if(RU){
    for(var db=0;db<9;db++){
      var dx0=(0.08+db*0.10)*W+(hash(db,3)-0.5)*40, dy0=hy(dx0)+30+hash(db,7)*(H-horizon)*0.5;
      // наклонная балка
      stroke([[dx0,dy0],[dx0+26+hash(db,9)*20,dy0-14-hash(db,11)*10]],3.2,'void');
      stroke([[dx0-1,dy0-1],[dx0+24,dy0-14]],0.8,'etch');
      // гнутая арматура
      L.push({t:'path',d:'M'+(dx0+8)+','+dy0+' q6,-14 2,-22 q-3,-6 3,-9',c:'none',sc:'etch',sw:1,so:0.7});
      // куча кирпича
      L.push({t:'path',d:'M'+(dx0-14)+','+(dy0+6)+' q10,-9 22,0 z',c:'void',sc:'etch',sw:0.8,so:0.6});
    }
  }

  /* погасший фонарь — кованый, с завитком */
  var lx=0.505*W, ly=hy(0.505*W)+(H-horizon)*0.22;
  if(RU){ // столб покосился
    stroke([[lx,ly],[lx+14,ly-78]],3.6,'void');
    stroke([[lx+1.4,ly-2],[lx+15,ly-76]],1.0,'etch');
  } else {
  stroke([[lx,ly],[lx,ly-84]],3.6,'void');
  stroke([[lx-1.8,ly-2],[lx-1.8,ly-82]],1.0,'etch');
  L.push({t:'path',d:'M'+lx+','+(ly-84)+' q14,2 16,-12 q1,-7 -5,-8',c:'none',sc:'void',sw:3,so:1});
  L.push({t:'path',d:'M'+lx+','+(ly-84)+' q14,2 16,-12',c:'none',sc:'etch',sw:1,so:0.8});
  L.push({t:'rect',x:lx+5,y:ly-104,w:14,h:18,c:'void'});
  stroke([[lx+5,ly-104],[lx+19,ly-104],[lx+19,ly-86],[lx+5,ly-86],[lx+5,ly-104]],1.2,'etch');
  stroke([[lx+12,ly-104],[lx+12,ly-86]],0.8,'etch');
  stroke([[lx+5,ly-95],[lx+19,ly-95]],0.8,'etch');
  stroke([[lx+12,ly-107],[lx+12,ly-104]],1.6,'etch');
  L.push({t:'path',d:'M'+(lx-8)+','+ly+' q8,-5 16,0',c:'none',sc:'etch',sw:1,so:0.7});
  stroke([[lx-12,ly+4],[lx+14,ly+4]],0.8,'ash');
  }

  /* доска объявлений — бумаги и сургучная печать */
  var bx=0.735*W, by=hy(0.735*W)+(H-horizon)*0.16;
  stroke([[bx-16,by],[bx-16,by-40]],3.0,'void');
  stroke([[bx+16,by],[bx+16,by-40]],3.0,'void');
  stroke([[bx-17.5,by-2],[bx-17.5,by-38]],0.9,'etch');
  L.push({t:'rect',x:bx-24,y:by-66,w:48,h:28,c:'void'});
  stroke([[bx-24,by-66],[bx+24,by-66],[bx+24,by-38],[bx-24,by-38],[bx-24,by-66]],1.3,'etch');
  stroke([[bx-21,by-63],[bx+21,by-63],[bx+21,by-41],[bx-21,by-41],[bx-21,by-63]],0.7,'etch');
  L.push({t:'rect',x:bx-16,y:by-60,w:11,h:15,c:'etch'});
  L.push({t:'rect',x:bx+3,y:by-58,w:10,h:12,c:'ash'});
  L.push({t:'path',d:'M'+(bx-16)+','+(by-45)+' l3,3 l8,0 l0,-3 z',c:'etch'});
  L.push({t:'circle',x:bx-10.5,y:by-49,r:2,c:'blood'});
  stroke([[bx-20,by+3],[bx+20,by+3]],0.8,'ash');

  /* врата — две башни по обе стороны дороги (сверху-сбоку) */
  var gx=0.945*W;
  [[hy(gx)+34,148],[hy(gx)+206,120]].forEach(function(p,pi){
    if(RU&&pi===1){p[1]=Math.round(p[1]*0.38);}
    var baseY=p[0], hgt=p[1], X=gx+(pi===0?-4:4);
    L.push({t:'rect',x:X-13,y:baseY-hgt,w:26,h:hgt,c:'void'});
    stroke([[X-13,baseY],[X-13,baseY-hgt],[X+13,baseY-hgt],[X+13,baseY]],1.3,'etch');
    for(var tt=0;tt<3;tt++)
      L.push({t:'rect',x:X-13+tt*9,y:baseY-hgt-7,w:6,h:7,c:'void'});
    stroke([[X-13,baseY-hgt-7],[X+13,baseY-hgt-7]],1.0,'etch');
    for(var vv=0;vv<3;vv++){
      var vx=X-8+vv*8, pv=[];
      for(var vy=baseY-hgt+4;vy<baseY-2;vy+=2.6){
        if(((vy+vx*0.33)%26)<4.5){pv.push(null);continue;}
        pv.push([vx+wob(vx,vy,1,0.5),vy]);
      }
      runs(pv,function(){return true;},function(){return 'etch';},0.55);
    }
  });
  // распахнутые створки у основания башен — плоские, вросли
  L.push({t:'path',d:'M'+(gx-17)+','+(hy(gx)+30)+' l-34,10 l0,-52 l34,-8 z',c:'void',sc:'etch',sw:1.1,so:0.9});
  stroke([[gx-24,hy(gx)+18],[gx-24,hy(gx)-16]],0.7,'etch');
  stroke([[gx-38,hy(gx)+24],[gx-38,hy(gx)-10]],0.7,'etch');
  L.push({t:'path',d:'M'+(gx+17)+','+(hy(gx)+202)+' l34,10 l0,-52 l-34,-8 z',c:'void',sc:'etch',sw:1.1,so:0.9});
  stroke([[gx+24,hy(gx)+190],[gx+24,hy(gx)+156]],0.7,'etch');
  stroke([[gx+38,hy(gx)+196],[gx+38,hy(gx)+162]],0.7,'etch');

  /* блюдце — эллипс, вид сверху */
  var mx=0.975*W, my=hy(0.975*W)+(H-horizon)*0.40;
  L.push({t:'circle',x:mx,y:my,r:8,c:'void',sc:'etch',sw:1.2,so:0.95});
  L.push({t:'path',d:'M'+(mx-8)+','+my+' a8,3.4 0 1,0 16,0 a8,3.4 0 1,0 -16,0 z',c:'void',sc:'etch',sw:1.2,so:0.95});
  L.push({t:'path',d:'M'+(mx-5)+','+my+' a5,2 0 1,0 10,0 a5,2 0 1,0 -10,0 z',c:'etch'});

  /* ground rows + tufts (v5 texture, изгиб дуги) */
  (function(){
    var idxg=0;
    for(var y=horizon+1.2;y<H;y+=2.3+(y-horizon)*0.036,idxg++){
      var th=TH[idxg%5],pts=[];
      for(var x=0;x<W;x+=3.0){
        var bend=(hy(x)-horizon)*(1-Math.min(1,(y-horizon)/(H-horizon)));
        pts.push([x,y+bend+wob(x,y,2,1.6)]);
      }
      runs(pts,function(px2,py2){
          if(py2<=hy(px2)+1)return false;
          var fog=Math.max(0,1-(py2-hy(px2))/(H*0.062))*0.58*(0.35+0.65*n2(px2*0.02,py2*0.31));
          var lamp=Math.max(0,1-Math.hypot(px2-fx,py2-fy)/60)*0.75;
          var winl=Math.max(0,1-Math.hypot(px2-win3.x,(py2-hy(px2)-10)*2.2)/60)*0.4;
          var t=Math.max(fog,lamp,winl)+(n2(px2*0.04,py2*0.05)-0.5)*0.12;
          return t>th;
        },function(px2){
          return Math.abs(px2-win3.x)<26&&n2(px2*0.2,3)>0.4?'flame':'etch';
        },0.7);
    }
    for(var ti=0;ti<46;ti++){
      var tx=hash(ti,41)*W, ty=horizon+ARC+8+hash(ti,43)*(H-horizon-ARC)*0.85;
      if(ty<hy(tx)+6)continue;
      var ts=2+hash(ti,47)*3;
      stroke([[tx,ty],[tx+(hash(ti,53)-0.5)*3,ty-ts]],0.7,'etch');
      if(hash(ti,59)>0.5)stroke([[tx+1.5,ty],[tx+2.5,ty-ts*0.7]],0.6,'etch');
    }
    // колея дороги — две волнистые пары через всё поле
    [0.30,0.62].forEach(function(fr,fi){
      var pts=[];
      for(var x=0;x<=W;x+=6){
        var yy=horizon+(H-horizon)*fr;
        var bend=(hy(x)-horizon)*(1-fr);
        pts.push([x,yy+bend+2.5*Math.sin(x*0.006+fi*2)+wob(x,yy,fi+4,1)]);
      }
      stroke(pts,0.8,'ash');
    });
  })();

  return {list:L,strokes:S,W:W,H:H};
}

root.SceneGen={
  gen:function(W,H){return genOutside(W,H,{campfire:true,wanderer:true});},
  genOutside:genOutside,
  genTown:genTown
};
})(typeof module!=='undefined'?module.exports:window);
