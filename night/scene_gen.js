/* ARDET vector etching scene — v3 "opryatno".
   Tonal engraving, clean stroke systems: streamlines around the blood moon,
   crisp silhouettes, deliberate rhythms. Display list API unchanged. */
(function(root){

function genOutside(W,H,opts){
  opts=opts||{campfire:true,wanderer:true};
  var L=[];
  var horizon=0.64*H;
  var moon={x:0.27*W, y:0.22*H, r:0.072*W};

  function hash(x,y){var n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}
  function n2(x,y){
    var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
    function s(t){return t*t*(3-2*t);}
    var a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);
    return a+(b-a)*s(xf)+(c-a)*s(yf)+(a-b-c+d)*s(xf)*s(yf);
  }

  /* ── stroke store ── */
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
  var TH=[0.10,0.28,0.50,0.72];

  /* ── skyline ─────────────────────────────────────── */
  var CATH0=0.545*W, CATH1=0.985*W, CW=CATH1-CATH0;
  function cathTop(x){
    var a=(x-CATH0)/CW;
    if(a<0||a>1) return horizon;
    var h;
    if(a<0.36){ h=0.36 + (((a*44)%2)<1?0:0.035); }                     // nave, regular battlements
    else if(a<0.40){ h=0.50; }                                          // shoulder
    else if(a<0.58){                                                    // great tower
      h=0.97;
      var t=(a-0.40)/0.18;
      if(t>0.74) h=0.97-(t-0.74)*1.7;                                   // broken diagonal
    }
    else if(a<0.70){ h=0.44 + (((a*60)%2)<1?0:0.03); }
    else if(a<0.80){                                                    // snapped spire
      var u=(a-0.70)/0.10;
      h=0.46+(u<0.5?u:1-u)*1.35*0.62;
      if(u>0.44&&u<0.56) h=0.76;
    }
    else { h=Math.max(0,0.28-(a-0.80)*1.3) + (((a*70)%2)<1?0:0.03); }
    return horizon - Math.max(0,h)*(horizon*0.96);
  }
  var RUIN0=0.015*W, RUIN1=0.26*W;
  function ruinTop(x){
    var b=(x-RUIN0)/(RUIN1-RUIN0);
    if(b<0||b>1) return horizon;
    var rh=0.10*Math.pow(Math.sin(b*Math.PI),0.7);
    if(b>0.16&&b<0.24) rh=0.20;                                         // tower 1
    if(b>0.30&&b<0.345) rh=0.335;                                       // tower 2 (burning)
    if(b>0.58&&b<0.625) rh=0.245;                                       // tower 3 (burning)
    if(b>0.78&&b<0.82) rh=0.16;
    return horizon - rh*horizon;
  }
  function skylineTop(x){ return Math.min(cathTop(x),ruinTop(x)); }
  function inSky(x,y){ return y < skylineTop(x)-0.6; }

  var lancets=[
    {x:0.665*W,y:0.435*H,w:0.024*W,h:0.10*H},
    {x:0.715*W,y:0.30*H, w:0.026*W,h:0.13*H},
    {x:0.745*W,y:0.30*H, w:0.026*W,h:0.13*H},
    {x:0.885*W,y:0.475*H,w:0.022*W,h:0.09*H}
  ];
  var rose={x:0.730*W,y:0.20*H,r:0.030*W};
  var fires=[{x:RUIN0+(RUIN1-RUIN0)*0.322,y:0,p:1.0},{x:RUIN0+(RUIN1-RUIN0)*0.602,y:0,p:0.6}];
  fires.forEach(function(f){f.y=ruinTop(f.x)-1;});

  /* ── tone fields (smooth, no confetti noise) ────── */
  function skyTone(x,y){
    var d=Math.hypot(x-moon.x,y-moon.y);
    var g=Math.max(0,1.12-d/(moon.r*3.0)); g=g*g;
    var fog=Math.max(0,1-(horizon-y)/(H*0.10))*0.5;
    var f=0;
    for(var i=0;i<fires.length;i++){
      var dd=Math.hypot(x-fires[i].x,y-fires[i].y);
      f=Math.max(f,fires[i].p*Math.max(0,1-dd/(0.09*W)));
    }
    return Math.max(g*1.15,fog,f*0.8) + (n2(x*0.006,y*0.006)-0.5)*0.06;
  }
  function skyColor(x,y){
    var d=Math.hypot(x-moon.x,y-moon.y);
    if(d<moon.r*1.7) return 'blood';
    for(var i=0;i<fires.length;i++)
      if(Math.hypot(x-fires[i].x,y-fires[i].y)<0.05*W) return 'blood';
    if(d>moon.r*2.9 && skyTone(x,y)<0.34) return 'ash';
    return 'etch';
  }
  function winGlow(x,y){
    var g=0;
    for(var i=0;i<lancets.length;i++){
      var l=lancets[i];
      var d=Math.hypot(x-l.x,(y-(l.y+l.h*0.5))*1.25);
      g=Math.max(g,Math.max(0,1-d/(l.w*3.2)));
    }
    g=Math.max(g,Math.max(0,1-Math.hypot(x-rose.x,y-rose.y)/(rose.r*2.6)));
    return g;
  }
  function cathLight(x,y){
    var top=cathTop(x);
    if(y<top||y>horizon) return 0;
    var a=(x-CATH0)/CW;
    var lit=Math.max(0.05,0.60-0.85*a);
    var edge=Math.max(0,1-(y-top)/(H*0.10));
    var t=lit*0.42 + edge*0.42*Math.max(0.25,lit) + winGlow(x,y)*0.72;
    if((a>0.365&&a<0.40)||(a>0.578&&a<0.60)||(a>0.795&&a<0.812)) t*=0.15;   // shadow joints
    return Math.max(0,Math.min(1,t));
  }
  var wx=0.335*W, wy=horizon+(H-horizon)*0.36;
  var fx=0.795*W, fy=horizon+(H-horizon)*0.62;

  /* ══ PAINT ═══════════════════════════════════════ */
  L.push({t:'rect',x:0,y:0,w:W,h:H,c:'sky'});
  fires.forEach(function(f){L.push({t:'glow',x:f.x,y:f.y-10,r:0.10*W*Math.sqrt(f.p),c:'blood',a:0.5});});
  L.push({t:'glow',x:moon.x,y:moon.y,r:moon.r*2.5,c:'blood',a:0.45});

  /* SKY — potential-flow streamlines around the moon disc */
  (function(){
    var R=moon.r*1.16, R2=R*R, idx=0;
    for(var s=-moon.y+6; s<horizon-moon.y-2; s+=2.9, idx++){
      var th=TH[idx%4], pts=[];
      for(var x=0;x<=W;x+=3.2){
        var dx=x-moon.x;
        var yv=s;                                   // solve streamline: y(1-R²/(dx²+y²))=s
        for(var it=0;it<7;it++) yv = s + R2*yv/(dx*dx+yv*yv+1e-6);
        var y=moon.y+yv;
        if(dx*dx+yv*yv < (R+1.2)*(R+1.2) || y>=horizon-1){ pts.push(null); continue; }
        y += 1.1*Math.sin(x*0.011+idx*1.7);         // long calm wave, no jitter
        pts.push([x,y]);
      }
      runs(pts,function(px,py){return inSky(px,py)&&skyTone(px,py)>th;},skyColor,
           idx%4===0?0.8:0.7);
    }
    // two deliberate aura arcs at the disc edge
    [1.20,1.38].forEach(function(k,ki){
      var arc=[];
      for(var a=-2.45;a<0.75;a+=0.07)
        arc.push([moon.x+Math.cos(a)*moon.r*k, moon.y+Math.sin(a)*moon.r*k]);
      stroke(arc,ki===0?1.0:0.8,'blood');
    });
  })();

  /* smoke — two clean ribbons per column */
  function ribbon(sx,sy,topLim,amp,drift,w){
    for(var off=0;off<2;off++){
      var pts=[];
      for(var y=sy;y>topLim;y-=4){
        var t=(sy-y);
        var A=2+amp*t/(sy-topLim);
        var x=sx+off*4 + drift*t*0.18 + A*Math.sin(t*0.030+off*0.9);
        pts.push([x,y]);
      }
      stroke(pts,w,'ash');
    }
  }
  ribbon(0.652*W,cathTop(0.652*W)+3,H*0.10,26,0.9,0.9);
  ribbon(fires[0].x,fires[0].y-6,H*0.22,20,1.1,0.85);
  ribbon(fires[1].x,fires[1].y-6,H*0.30,14,0.8,0.8);

  /* far ruins — solid silhouette, one rim line, fires */
  (function(){
    var pts=[];
    for(var x=RUIN0;x<=RUIN1;x+=2)pts.push(x.toFixed(1)+','+ruinTop(x).toFixed(1));
    pts.push(RUIN1.toFixed(1)+','+horizon,RUIN0.toFixed(1)+','+horizon);
    L.push({t:'poly',p:pts.join(' '),c:'void'});
    var rim=[];
    for(var x2=RUIN0;x2<=RUIN1;x2+=2)rim.push([x2,ruinTop(x2)-0.7]);
    stroke(rim,1.0,'etch');
    // flames: clean three-tongue silhouettes
    fires.forEach(function(f,fi){
      var s=f.p*13;
      L.push({t:'path',d:'M'+(f.x-s*0.7)+','+(f.y+2)+
        ' q'+(s*0.15)+','+(-s*0.9)+' '+(s*0.35)+','+(-s*1.15)+
        ' q'+(s*0.12)+','+(s*0.55)+' '+(s*0.32)+','+(s*0.62)+
        ' q'+(s*0.10)+','+(-s*1.1)+' '+(s*0.34)+','+(-s*1.5)+
        ' q'+(s*0.25)+','+(s*0.9)+' '+(s*0.18)+','+(s*1.4)+
        ' q'+(s*0.28)+','+(-s*0.5)+' '+(s*0.20)+','+(-s*0.95)+
        ' q'+(s*0.25)+','+(s*0.85)+' '+(-s*0.08)+','+(s*1.42)+
        ' q'+(-s*0.7)+','+(s*0.35)+' '+(-s*1.31)+',0 z',c:'blood'});
      for(var e=0;e<4;e++){
        var ex=f.x+(hash(e,fi)-0.5)*18, ey=f.y-18-hash(e,7)*26;
        stroke([[ex,ey],[ex+1.5,ey-6-hash(e,3)*10]],1.1,'blood');
      }
    });
  })();

  /* horizon line — only in the open gap */
  (function(){
    var seg=[];
    for(var x=0;x<=W;x+=3){
      if(skylineTop(x)>=horizon-1&&skyTone(x,horizon-4)>0.15)seg.push([x,horizon-0.5]);
      else{if(seg.length>2)stroke(seg,0.9,'etch');seg=[];}
    }
    if(seg.length>2)stroke(seg,0.9,'etch');
  })();

  /* CATHEDRAL — solid mass, crisp contour, calm masonry */
  (function(){
    var pts=[];
    for(var x=CATH0;x<=CATH1;x+=1.6)pts.push(x.toFixed(1)+','+cathTop(x).toFixed(1));
    pts.push(CATH1.toFixed(1)+','+horizon,CATH0.toFixed(1)+','+horizon);
    L.push({t:'poly',p:pts.join(' '),c:'stone'});

    // crisp continuous contour (steps render as clean verticals)
    var cont=[];
    for(var x1=CATH0;x1<=CATH1;x1+=1.6)cont.push([x1,cathTop(x1)-0.6]);
    stroke(cont,1.15,'etch');

    // vertical engraving, stone courses on a fixed grid
    var idx=0;
    for(var x2=CATH0+2;x2<CATH1;x2+=2.7,idx++){
      var th=TH[idx%4],p2=[];
      for(var y=cathTop(x2)+1;y<horizon-0.5;y+=2.4){
        if((y%22)<2.6){p2.push(null);continue;}                 // aligned course breaks
        p2.push([x2,y]);
      }
      runs(p2,function(px,py){return cathLight(px,py)>th;},
        function(px,py){return winGlow(px,py)>0.5?'blood':'etch';},0.7);
    }
    // masonry horizontals only in the lit band
    for(var y3=H*0.30;y3<horizon;y3+=11){
      var p3=[];
      for(var x3=CATH0;x3<CATH0+CW*0.36;x3+=3)p3.push([x3,y3]);
      runs(p3,function(px,py){return py>cathTop(px)+3&&cathLight(px,py)>0.42;},
        function(){return 'etch';},0.55);
    }

    // windows: fire fill, clean outline, mullion+transom
    lancets.forEach(function(l){
      var x0=l.x-l.w/2,x1=l.x+l.w/2,ya=l.y+l.h*0.38;
      var d='M'+x0.toFixed(1)+','+(l.y+l.h).toFixed(1)+' L'+x0.toFixed(1)+','+ya.toFixed(1)+
        ' Q'+x0.toFixed(1)+','+l.y.toFixed(1)+' '+l.x.toFixed(1)+','+l.y.toFixed(1)+
        ' Q'+x1.toFixed(1)+','+l.y.toFixed(1)+' '+x1.toFixed(1)+','+ya.toFixed(1)+
        ' L'+x1.toFixed(1)+','+(l.y+l.h).toFixed(1)+' Z';
      L.push({t:'path',d:d,c:'winfire'});
      L.push({t:'path',d:d,c:'none',sc:'etch',sw:1.0,so:0.9});
      stroke([[l.x,l.y+2.5],[l.x,l.y+l.h]],1.3,'void');
      stroke([[x0+1.5,l.y+l.h*0.56],[x1-1.5,l.y+l.h*0.56]],1.1,'void');
      L.push({t:'glow',x:l.x,y:l.y+l.h*0.5,r:l.w*2.1,c:'blood',a:0.26});
    });

    // rose window — burning wheel
    L.push({t:'circle',x:rose.x,y:rose.y,r:rose.r,c:'winfire'});
    L.push({t:'glow',x:rose.x,y:rose.y,r:rose.r*2.4,c:'blood',a:0.32});
    for(var a6=0;a6<Math.PI*2;a6+=Math.PI/8)
      stroke([[rose.x+Math.cos(a6)*rose.r*0.22,rose.y+Math.sin(a6)*rose.r*0.22],
              [rose.x+Math.cos(a6)*rose.r*0.94,rose.y+Math.sin(a6)*rose.r*0.94]],0.95,'void');
    [1.0,0.72,0.26].forEach(function(rr,ri){
      var ring=[];
      for(var a7=0;a7<=Math.PI*2+0.12;a7+=0.14)
        ring.push([rose.x+Math.cos(a7)*rose.r*rr,rose.y+Math.sin(a7)*rose.r*rr]);
      stroke(ring,ri===0?1.3:0.8,ri===0?'etch':'void');
    });
  })();

  /* GROUND — fog lines, road ladder, curated props */
  L.push({t:'rect',x:0,y:horizon,w:W,h:H-horizon,c:'ground'});
  (function(){
    // fog: long calm lines fading down
    for(var k=0;k<7;k++){
      var y=horizon+2.5+k*2.4, pts=[];
      for(var x=0;x<=W;x+=3.5)
        pts.push([x, y+1.4*Math.sin(x*0.012+k*1.3)]);
      var gate=0.92-k*0.13;
      runs(pts,function(px){
          return (0.5+0.5*Math.sin(px*0.008+k*2.2)) < gate;
        },function(px){
          for(var i=1;i<3;i++)
            if(Math.abs(px-lancets[i].x)<lancets[i].w*2.4) return 'blood';
          return k<3?'etch':'ash';
        },0.75);
    }
    // road: two edges + perspective rungs
    function edge(x0,y0,x1,y1,bend){
      var pts=[];
      for(var t=0;t<=1.001;t+=0.05){
        var x=x0+(x1-x0)*t, y=y0+(y1-y0)*t;
        x+=bend*Math.sin(t*Math.PI);
        pts.push([x,y]);
      }
      return pts;
    }
    var eL=edge(0.075*W,H+2, wx-9, wy+16,-14);
    var eR=edge(0.26*W, H+2, wx+16, wy+16, 10);
    stroke(eL,0.9,'etch'); stroke(eR,0.9,'etch');
    for(var r=0;r<9;r++){
      var i=2+r*2;
      if(i>=eL.length-1)break;
      stroke([[eL[i][0]+3,eL[i][1]],[eR[i][0]-3,eR[i][1]]],0.7,'ash');
    }
    // grass clumps (curated, sparse)
    var clumps=[[0.30,0.55],[0.41,0.28],[0.48,0.62],[0.55,0.40],[0.63,0.68],[0.69,0.30],[0.145,0.42],[0.22,0.75]];
    clumps.forEach(function(cpos,i){
      var gx=cpos[0]*W, gy=horizon+(H-horizon)*cpos[1];
      for(var b=0;b<3;b++)
        stroke([[gx,gy],[gx+(b-1)*3.2,gy-5-hash(i,b)*4]],0.8,'etch');
    });
    // rubble near the tree
    for(var j=0;j<4;j++){
      var rx=0.10*W+hash(j,61)*0.06*W, ry=horizon+(H-horizon)*(0.55+hash(j,67)*0.3);
      var rr=3+hash(j,71)*3, st=[];
      for(var a=0;a<=Math.PI*2.1;a+=0.45)
        st.push([rx+Math.cos(a)*rr,ry+Math.sin(a)*rr*0.55]);
      stroke(st,0.75,'etch');
    }
  })();

  /* graves — five crisp leaning crosses, receding */
  (function(){
    var defs=[[0.445,0.14,26],[0.505,0.075,20],[0.575,0.22,30],[0.64,0.11,18],[0.69,0.33,24]];
    defs.forEach(function(g,i){
      var gx=g[0]*W, gy=horizon+(H-horizon)*g[1], hgt=g[2];
      var lean=(hash(i,5)-0.5)*0.5;
      var tx=gx+lean*hgt, ty=gy-hgt;
      stroke([[gx,gy],[tx,ty]],3.2,'void');
      stroke([[gx-2,gy],[tx-2,ty]],0.9,'etch');                       // moon rim
      var bx=gx+lean*hgt*0.7, by=gy-hgt*0.7, arm=hgt*0.34;
      stroke([[bx-arm,by-lean*3],[bx+arm,by+lean*3]],2.8,'void');
      stroke([[bx-arm,by-lean*3-1.6],[bx+arm,by+lean*3-1.6]],0.9,'etch');
    });
  })();

  /* wanderer — larger, cleaner, one warm lantern */
  if(opts.wanderer){
  L.push({t:'glow',x:wx+9,y:wy+8,r:32,c:'flame',a:0.85,cls:'warmglow'});
  L.push({t:'path',d:'M'+wx+','+(wy-21)+' q8,-4 11,5 l8,34 q-14,6 -27,0 z',c:'void',sc:'etch',sw:1.0,so:0.75});
  L.push({t:'circle',x:wx+5,y:wy-24,r:5.6,c:'void',sc:'etch',sw:1.0,so:0.75});
  stroke([[wx+2,wy-27],[wx+9,wy-29]],0.9,'etch');                      // hood rim
  stroke([[wx-2,wy-16],[wx-4,wy+15]],1.0,'etch');                      // cloak rim
  stroke([[wx+20,wy-32],[wx+17,wy+18]],1.4,'etch');                    // staff
  L.push({t:'circle',x:wx+14,y:wy+9,r:3.0,c:'flame',cls:'warmdot'});
  stroke([[wx+14,wy+2],[wx+14,wy+6]],0.9,'etch');                      // lantern cord
  }

  /* campfire + jester */
  if(opts.campfire){
  L.push({t:'glow',x:fx,y:fy-6,r:46,c:'flame',a:0.7,cls:'warmglow'});
  L.push({t:'path',d:'M'+(fx-17)+','+fy+' q17,7 34,0 l-4,4 q-13,4 -26,0 z',c:'void',sc:'etch',sw:0.9,so:0.6});
  L.push({t:'path',d:'M'+fx+','+(fy-31)+' q7,10 3,20 q8,-4 6,-13 q6,14 -3,22 q-14,6 -18,-6 q-3,-10 4,-16 q-2,8 3,10 q-3,-9 5,-17 z',c:'flame',cls:'warmglow'});
  stroke([[fx+1,fy-35],[fx+1,fy-53]],1.1,'etch');
  L.push({t:'circle',x:fx+1,y:fy-58,r:5.2,c:'void',sc:'etch',sw:1.1,so:0.8});
  L.push({t:'path',d:'M'+(fx-4)+','+(fy-61)+' q-9,-6 -7,-14',c:'none',sc:'etch',sw:1.1,so:0.8});
  L.push({t:'path',d:'M'+(fx+6)+','+(fy-61)+' q9,-6 7,-14',c:'none',sc:'etch',sw:1.1,so:0.8});
  L.push({t:'path',d:'M'+(fx+35)+','+(fy+4)+' q10,-23 21,0 q2,6 -4,8 l-15,0 q-4,-3 -2,-8 z',c:'void',sc:'etch',sw:0.9,so:0.7});
  L.push({t:'circle',x:fx+45,y:fy-23,r:5.6,c:'void',sc:'etch',sw:0.9,so:0.7});
  L.push({t:'path',d:'M'+(fx+41)+','+(fy-27)+' l-7,-8 l5,8 M'+(fx+45)+','+(fy-29)+' l0,-10 l2,10 M'+(fx+49)+','+(fy-27)+' l8,-7 l-6,8',c:'none',sc:'etch',sw:1.7,so:0.7});
  }

  /* THE BLOOD MOON — engraved sphere, clean rings, drips, crows */
  L.push({t:'circle',x:moon.x,y:moon.y,r:moon.r,c:'bloodDark'});
  (function(){
    var idx=0;
    for(var ly=-moon.r+2;ly<moon.r-1.2;ly+=1.6,idx++){
      var th=TH[idx%4];
      var half=Math.sqrt(moon.r*moon.r-ly*ly);
      var pts=[];
      for(var lx=-half+1.2;lx<half-1.2;lx+=2.2){
        var sag=ly*0.13*(1-(lx*lx)/(half*half));
        pts.push([moon.x+lx,moon.y+ly+sag]);
      }
      runs(pts,function(px,py){
          var nx=(px-moon.x)/moon.r, ny=(py-moon.y)/moon.r;
          var light=0.24+0.92*Math.max(0,(-nx*0.64-ny*0.77));
          if(((nx-0.16)/0.46)*((nx-0.16)/0.46)+((ny+0.06)/0.30)*((ny+0.06)/0.30)<1) light-=0.34;  // mare 1
          if(((nx+0.30)/0.28)*((nx+0.30)/0.28)+((ny-0.34)/0.20)*((ny-0.34)/0.20)<1) light-=0.30;  // mare 2
          return light>th*0.85+0.05;
        },function(){return 'blood';},0.75);
    }
    var ring=[];
    for(var a=0;a<=Math.PI*2+0.1;a+=0.09)
      ring.push([moon.x+Math.cos(a)*moon.r,moon.y+Math.sin(a)*moon.r]);
    stroke(ring,1.6,'blood');
  })();
  (function(){ // drips
    var xs=[-0.62,-0.33,-0.05,0.24,0.55];
    for(var i=0;i<xs.length;i++){
      var dx=xs[i]*moon.r;
      var yb=moon.y+Math.sqrt(Math.max(0,moon.r*moon.r-dx*dx));
      var len=(16+hash(i,23)*52)*(1-Math.abs(xs[i])*0.4);
      stroke([[moon.x+dx,yb-1],[moon.x+dx,yb+len]],1.15,'blood');
      L.push({t:'circle',x:moon.x+dx,y:yb+len+1.8,r:1.7,c:'blood'});
    }
  })();
  (function(){ // crows: one arc from moon toward the cathedral
    var flock=[[0.255,0.20,12],[0.30,0.155,10],[0.355,0.125,9],[0.415,0.105,7.5],[0.475,0.115,6.5],[0.535,0.145,5.5]];
    flock.forEach(function(b,i){
      var cx=b[0]*W, cy=b[1]*H, s=b[2], f=0.62+hash(i,77)*0.5;
      stroke([[cx-s,cy-s*0.24],[cx-s*0.42,cy-s*f*0.6],[cx,cy]],2.1,'void');
      stroke([[cx,cy],[cx+s*0.42,cy-s*f*0.6],[cx+s,cy-s*0.24]],2.1,'void');
    });
  })();

  /* dead tree repoussoir — smooth limbs, bone rim */
  (function(){
    function limb(x,y,ang,len,w0,w1,curve,seg){
      var pts=[[x,y]],a=ang;
      for(var i=1;i<=seg;i++){
        a+=curve/seg;
        x+=Math.cos(a)*len/seg; y+=Math.sin(a)*len/seg;
        pts.push([x,y]);
      }
      stroke(pts,w0,'void');
      stroke(pts.slice(Math.floor(seg*0.4)),(w0+w1)/2,'void');
      stroke(pts.slice(Math.floor(seg*0.7)),w1,'void');
      return pts;
    }
    var trunk=limb(0.052*W,H+4,-Math.PI/2,H*0.66,14,7,-0.10,8);
    var main=limb(trunk[5][0],trunk[5][1],-1.02,H*0.40,7,2,-0.34,9);   // sweeps over the halo
    limb(trunk[6][0],trunk[6][1],-0.30,W*0.24,6,1.5,0.22,9);           // long right arm
    limb(trunk[4][0],trunk[4][1],-2.05,W*0.055,4,1.2,-0.3,5);
    limb(main[5][0],main[5][1],-0.45,W*0.085,3,1,0.35,5);
    limb(main[7][0],main[7][1],-1.5,W*0.05,2.2,0.8,-0.4,4);
    var rim=trunk.map(function(p){return [p[0]+6.5,p[1]];});
    stroke(rim.slice(0,7),1.1,'etch');
  })();

  return {list:L, strokes:S, W:W, H:H};
}



/* ── TOWN block — «вязкая почти-нормальность» (canon §04) ── */
function genTown(W,H){
  var L=[];
  var horizon=0.64*H;
  var moon={x:0.525*W, y:0.19*H, r:0.026*W};   // bone moon — тёплое пятно III

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
  var TH=[0.10,0.28,0.50,0.72];

  /* houses (front plane) */
  var houses=[
    {x0:0.075*W,x1:0.165*W,h:0.30,roof:0.12,chimney:true},
    {x0:0.32*W, x1:0.395*W,h:0.24,roof:0.10},
    {x0:0.59*W, x1:0.69*W, h:0.34,roof:0.0,parapet:true,office:true},  // канцелярия
    {x0:0.78*W, x1:0.85*W, h:0.26,roof:0.11}
  ];
  var win3={x:0.657*W,y:0,w:13,h:17};                                  // окно №3
  houses.forEach(function(hh){ if(hh.office) win3.y = horizon - hh.h*H*0.55; });

  function houseTop(x){
    for(var i=0;i<houses.length;i++){
      var hh=houses[i];
      if(x>=hh.x0&&x<=hh.x1){
        var base=horizon-hh.h*H;
        if(hh.roof>0){
          var mid=(hh.x0+hh.x1)/2;
          var t=1-Math.abs(x-mid)/((hh.x1-hh.x0)/2);
          return base - hh.roof*H*t;
        }
        if(hh.parapet && (((x-hh.x0)/9)%2)<1 ) return base-6;
        return base;
      }
    }
    return horizon;
  }
  /* far roofs plane */
  function farTop(x){
    var t=horizon-(0.10+0.05*Math.sin(x*0.004)+0.04*Math.sin(x*0.0113+2))*H;
    if((x%(0.11*W))<6) t-=0.05*H;                                      // chimneys
    return t;
  }
  function skylineTop(x){ return Math.min(houseTop(x),farTop(x)); }
  function inSky(x,y){ return y<skylineTop(x)-0.6; }

  function skyTone(x,y){
    var d=Math.hypot(x-moon.x,y-moon.y);
    var g=Math.max(0,1.05-d/(moon.r*4.2)); g=g*g;
    var fog=Math.max(0,1-(horizon-y)/(H*0.09))*0.42;
    return Math.max(g,fog)+(n2(x*0.006,y*0.006)-0.5)*0.05;
  }

  /* PAINT */
  L.push({t:'rect',x:0,y:0,w:W,h:H,c:'sky'});
  L.push({t:'glow',x:moon.x,y:moon.y,r:moon.r*2.2,c:'flame',a:0.16});   // тёплая луна

  /* streamlines around the bone moon */
  (function(){
    var R=moon.r*1.25,R2=R*R,idx=0;
    for(var s=-moon.y+6;s<horizon-moon.y-2;s+=3.1,idx++){
      var th=TH[idx%4],pts=[];
      for(var x=0;x<=W;x+=4.2){
        var dx=x-moon.x, yv=s;
        for(var it=0;it<6;it++) yv=s+R2*yv/(dx*dx+yv*yv+1e-6);
        var y=moon.y+yv;
        if(dx*dx+yv*yv<(R+1.2)*(R+1.2)||y>=horizon-1){pts.push(null);continue;}
        y+=1.0*Math.sin(x*0.010+idx*1.7);
        pts.push([x,y]);
      }
      runs(pts,function(px,py){return inSky(px,py)&&skyTone(px,py)>th;},
        function(px,py){return skyTone(px,py)<0.30?'ash':'etch';},0.7);
    }
  })();

  /* bone moon — quiet engraved disc */
  (function(){
    var idx=0;
    for(var ly=-moon.r+1.5;ly<moon.r-1;ly+=1.6,idx++){
      var th=TH[idx%4];
      var half=Math.sqrt(moon.r*moon.r-ly*ly), pts=[];
      for(var lx=-half+1;lx<half-1;lx+=2.0)
        pts.push([moon.x+lx,moon.y+ly+ly*0.10*(1-(lx*lx)/(half*half))]);
      runs(pts,function(px,py){
          var nx=(px-moon.x)/moon.r, ny=(py-moon.y)/moon.r;
          var light=0.30+0.85*Math.max(0,(-nx*0.5-ny*0.85));
          if(((nx-0.2)/0.4)*((nx-0.2)/0.4)+((ny+0.1)/0.3)*((ny+0.1)/0.3)<1) light-=0.28;
          return light>th*0.9+0.06;
        },function(){return 'etch';},0.7);
    }
    var ring=[];
    for(var a=0;a<=Math.PI*2+0.1;a+=0.11)
      ring.push([moon.x+Math.cos(a)*moon.r,moon.y+Math.sin(a)*moon.r]);
    stroke(ring,1.2,'etch');
  })();

  /* far roofs silhouette */
  (function(){
    var pts=[];
    for(var x=0;x<=W;x+=3)pts.push(x.toFixed(1)+','+farTop(x).toFixed(1));
    pts.push(W+','+horizon,'0,'+horizon);
    L.push({t:'poly',p:pts.join(' '),c:'far'});
    var seg=[];
    for(var x2=0;x2<=W;x2+=3){
      if(skyTone(x2,farTop(x2))>0.14)seg.push([x2,farTop(x2)-0.6]);
      else{if(seg.length>2)stroke(seg,0.7,'ash');seg=[];}
    }
    if(seg.length>2)stroke(seg,0.7,'ash');
  })();

  /* ground fill goes under everything that stands on it */
  L.push({t:'rect',x:0,y:horizon,w:W,h:H-horizon,c:'ground'});

  /* front houses */
  houses.forEach(function(hh,hi){
    var base=horizon-hh.h*H, mid=(hh.x0+hh.x1)/2;
    // body
    L.push({t:'poly',p:[hh.x0+','+horizon,hh.x0+','+base,hh.x1+','+base,hh.x1+','+horizon].join(' '),c:'stone'});
    // roof
    if(hh.roof>0){
      L.push({t:'poly',p:[(hh.x0-6)+','+base,mid+','+(base-hh.roof*H),(hh.x1+6)+','+base].join(' '),c:'void'});
      stroke([[hh.x0-6,base],[mid,base-hh.roof*H],[hh.x1+6,base]],1.1,'etch');
    } else {
      var par=[];
      for(var x=hh.x0;x<=hh.x1;x+=1.5)par.push([x,houseTop(x)-0.5]);
      stroke(par,1.1,'etch');
    }
    stroke([[hh.x0,horizon],[hh.x0,base]],1.0,'etch');
    stroke([[hh.x1,horizon],[hh.x1,base]],1.0,'etch');
    // facade hatch — quiet
    var idx=0;
    for(var x3=hh.x0+3;x3<hh.x1-2;x3+=3.0,idx++){
      if(hh.office)break;
      if(idx%4!==0)continue;
      var p3=[];
      for(var y=base+3;y<horizon-1;y+=2.6){
        if((y%20)<2.4){p3.push(null);continue;}
        p3.push([x3,y]);
      }
      runs(p3,function(px,py){
        var lit=Math.max(0.1,0.5-Math.abs(px-moon.x)/(0.5*W));
        return lit>0.18;
      },function(){return 'etch';},0.55);
    }
    // windows: dark; office gets окно №3 warm + переплёт
    var wcount=Math.max(1,Math.floor((hh.x1-hh.x0)/46));
    for(var wi=0;wi<wcount;wi++){
      var wxp=hh.x0+(wi+0.5)*((hh.x1-hh.x0)/wcount)-6;
      var wyp=base+(horizon-base)*0.32;
      if(hh.office&&wi===1){
        win3.x=wxp+6; win3.y=wyp;
        L.push({t:'rect',x:wxp,y:wyp,w:13,h:17,c:'flame',cls:'warmglow'});
        L.push({t:'glow',x:wxp+6,y:wyp+8,r:26,c:'flame',a:0.5,cls:'warmglow'});
        stroke([[wxp+6.5,wyp],[wxp+6.5,wyp+17]],1,'void');
        stroke([[wxp,wyp+8.5],[wxp+13,wyp+8.5]],1,'void');
        stroke([[wxp-1,wyp-1],[wxp+14,wyp-1],[wxp+14,wyp+18],[wxp-1,wyp+18],[wxp-1,wyp-1]],0.9,'etch');
      } else {
        L.push({t:'rect',x:wxp,y:wyp,w:12,h:16,c:'void'});
        stroke([[wxp,wyp],[wxp+12,wyp],[wxp+12,wyp+16],[wxp,wyp+16],[wxp,wyp]],0.8,'etch');
      }
    }
    // door
    var dx=mid-8+(hi%2)*10;
    L.push({t:'rect',x:dx,y:horizon-24,w:14,h:24,c:'void'});
    stroke([[dx,horizon-24],[dx+14,horizon-24]],0.8,'etch');
    // chimney + smoke
    if(hh.chimney){
      var cx=hh.x0+(hh.x1-hh.x0)*0.72, cy=base-hh.roof*H*0.55;
      L.push({t:'rect',x:cx-5,y:cy-16,w:10,h:16,c:'void'});
      for(var off=0;off<2;off++){
        var pts=[];
        for(var y2=cy-18;y2>H*0.16;y2-=4){
          var t=(cy-18-y2);
          pts.push([cx+off*4+t*0.10+(2+16*t/(cy-18-H*0.16))*Math.sin(t*0.03+off),y2]);
        }
        stroke(pts,0.85,'ash');
      }
    }
  });

  /* Жертвенный костёр + Шут (canon: череп быка над огнём) */
  var fx=0.225*W, fy=horizon+(H-horizon)*0.52;
  L.push({t:'glow',x:fx,y:fy-6,r:46,c:'flame',a:0.7,cls:'warmglow'});
  L.push({t:'path',d:'M'+(fx-17)+','+fy+' q17,7 34,0 l-4,4 q-13,4 -26,0 z',c:'void',sc:'etch',sw:0.9,so:0.6});
  L.push({t:'path',d:'M'+fx+','+(fy-31)+' q7,10 3,20 q8,-4 6,-13 q6,14 -3,22 q-14,6 -18,-6 q-3,-10 4,-16 q-2,8 3,10 q-3,-9 5,-17 z',c:'flame',cls:'warmglow'});
  stroke([[fx+1,fy-35],[fx+1,fy-53]],1.1,'etch');
  L.push({t:'circle',x:fx+1,y:fy-58,r:5.2,c:'void',sc:'etch',sw:1.1,so:0.8});
  L.push({t:'path',d:'M'+(fx-4)+','+(fy-61)+' q-9,-6 -7,-14',c:'none',sc:'etch',sw:1.1,so:0.8});
  L.push({t:'path',d:'M'+(fx+6)+','+(fy-61)+' q9,-6 7,-14',c:'none',sc:'etch',sw:1.1,so:0.8});
  L.push({t:'path',d:'M'+(fx+35)+','+(fy+4)+' q10,-23 21,0 q2,6 -4,8 l-15,0 q-4,-3 -2,-8 z',c:'void',sc:'etch',sw:0.9,so:0.7});
  L.push({t:'circle',x:fx+45,y:fy-23,r:5.6,c:'void',sc:'etch',sw:0.9,so:0.7});
  L.push({t:'path',d:'M'+(fx+41)+','+(fy-27)+' l-7,-8 l5,8 M'+(fx+45)+','+(fy-29)+' l0,-10 l2,10 M'+(fx+49)+','+(fy-27)+' l8,-7 l-6,8',c:'none',sc:'etch',sw:1.7,so:0.7});

  /* пифос — глиняная бочка на боку, пустая (canon A1) */
  var px_=0.415*W, py_=horizon+(H-horizon)*0.50;
  L.push({t:'path',d:'M'+(px_-24)+','+py_+' q-4,-14 0,-26 q24,-9 48,0 q4,12 0,26 q-24,8 -48,0 z',c:'void',sc:'etch',sw:1.0,so:0.85});
  [[-10,-27,-10,1],[6,-28,6,2]].forEach(function(rb){
    stroke([[px_+rb[0],py_+rb[1]],[px_+rb[2],py_+rb[3]]],0.9,'etch');
  });
  L.push({t:'circle',x:px_-22,y:py_-13,r:9,c:'void',sc:'etch',sw:1.1,so:0.9});
  stroke([[px_-30,py_+3],[px_+28,py_+3]],0.7,'ash');

  /* погасший фонарь — единственный столб без света (canon A2) */
  var lx=0.505*W, ly=horizon+(H-horizon)*0.42;
  stroke([[lx,ly],[lx,ly-64]],3.0,'void');
  stroke([[lx-1.4,ly],[lx-1.4,ly-64]],0.9,'etch');
  stroke([[lx,ly-64],[lx+10,ly-70]],2.2,'void');
  L.push({t:'rect',x:lx+6,y:ly-82,w:11,h:14,c:'void'});
  stroke([[lx+6,ly-82],[lx+17,ly-82],[lx+17,ly-68],[lx+6,ly-68],[lx+6,ly-82]],0.9,'etch');
  stroke([[lx+11.5,ly-84],[lx+11.5,ly-82]],1.5,'etch');

  /* доска объявлений (подмигивание: «утеряно: смысл») */
  var bx=0.735*W, by=horizon+(H-horizon)*0.34;
  stroke([[bx-14,by],[bx-14,by-34]],2.2,'void');
  stroke([[bx+14,by],[bx+14,by-34]],2.2,'void');
  L.push({t:'rect',x:bx-20,y:by-56,w:40,h:24,c:'void'});
  stroke([[bx-20,by-56],[bx+20,by-56],[bx+20,by-32],[bx-20,by-32],[bx-20,by-56]],1.0,'etch');
  L.push({t:'rect',x:bx-12,y:by-52,w:10,h:13,c:'etch'});
  L.push({t:'rect',x:bx+2,y:by-50,w:9,h:11,c:'ash'});

  /* врата — открыты всегда, вросли (canon A4) */
  var gx=0.945*W;
  [[-30,110],[30,110]].forEach(function(p){
    var X=gx+p[0];
    L.push({t:'rect',x:X-9,y:horizon-p[1],w:18,h:p[1],c:'void'});
    stroke([[X-9,horizon],[X-9,horizon-p[1]],[X+9,horizon-p[1]],[X+9,horizon]],1.0,'etch');
    stroke([[X-12,horizon-p[1]],[X+12,horizon-p[1]-6],[X+12,horizon-p[1]]],1.0,'etch');
  });
  L.push({t:'path',d:'M'+(gx-21)+','+(horizon-8)+' l-26,10 l0,-64 l26,-6 z',c:'void',sc:'etch',sw:1.0,so:0.85});
  L.push({t:'path',d:'M'+(gx+21)+','+(horizon-8)+' l26,10 l0,-64 l-26,-6 z',c:'void',sc:'etch',sw:1.0,so:0.85});
  var vy=horizon+2;
  stroke([[gx-40,vy+6],[gx-21,vy]],0.7,'ash');
  stroke([[gx+21,vy],[gx+40,vy+6]],0.7,'ash');

  /* ground: fog lines + street + props */
  (function(){
    for(var k=0;k<6;k++){
      var y=horizon+2.5+k*2.5, pts=[];
      for(var x=0;x<=W;x+=4)
        pts.push([x,y+1.3*Math.sin(x*0.011+k*1.3)]);
      var gate=0.9-k*0.13;
      runs(pts,function(px2){return (0.5+0.5*Math.sin(px2*0.0075+k*2.2))<gate;},
        function(){return k<3?'etch':'ash';},0.7);
    }
    // street: two long edges + occasional rungs
    var sy1=horizon+(H-horizon)*0.62, sy2=horizon+(H-horizon)*0.86;
    [[sy1,0.9],[sy2,0.9]].forEach(function(e,ei){
      var pts=[];
      for(var x=0;x<=W;x+=5)pts.push([x,e[0]+2.2*Math.sin(x*0.006+ei*2)]);
      stroke(pts,e[1],'etch');
    });
    for(var r=0;r<14;r++){
      var rx=(0.03+r*0.07)*W;
      stroke([[rx,sy1+3],[rx-6,sy2-3]],0.6,'ash');
    }
    var clumps=[[0.06,0.35],[0.13,0.72],[0.28,0.30],[0.40,0.75],[0.52,0.28],[0.63,0.70],[0.71,0.40],[0.88,0.68],[0.97,0.35]];
    clumps.forEach(function(cp,i){
      var gx2=cp[0]*W, gy2=horizon+(H-horizon)*cp[1];
      for(var b=0;b<3;b++)
        stroke([[gx2,gy2],[gx2+(b-1)*3,gy2-5-hash(i,b)*4]],0.75,'etch');
    });
    // блюдце молока — сразу за вратами (подмигивание)
    var mx=0.975*W, my=horizon+(H-horizon)*0.55;
    L.push({t:'circle',x:mx,y:my,r:5,c:'none',sc:'etch',sw:0.9,so:0.9});
    L.push({t:'circle',x:mx,y:my,r:2.6,c:'etch'});
  })();

  return {list:L,strokes:S,W:W,H:H};
}

root.SceneGen={
  gen:function(W,H){return genOutside(W,H,{campfire:true,wanderer:true});},
  genOutside:genOutside,
  genTown:genTown
};
})(typeof module!=='undefined'?module.exports:window);
