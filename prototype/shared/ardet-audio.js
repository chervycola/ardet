// ═══════════════════════════════════════════════════════════════════
// ARDET AUDIO — треки по локациям с кроссфейдом + мобильный фуллскрин.
// Треки: assets/music/<id>.mp3 (см. assets/music/README.md).
// Пока файла нет — тихий процедурный гул-заглушка (WebAudio), свой
// тон у каждой локации, чтобы кроссфейды были слышны уже сейчас.
// Подключение:  <script src="../shared/ardet-audio.js"></script>
//   ArdetAudio.unlock()          — в первом жесте пользователя
//   ArdetAudio.setLocation(id)   — при смене локации (кроссфейд)
//   ArdetFS.enter()              — развернуть на весь экран
// ═══════════════════════════════════════════════════════════════════
(function(){
  const TRACKS = {
    title:       { file: 'title.mp3',       hz: 55,  fifth: true,  noise: 0.05 },
    townlet:     { file: 'townlet.mp3',     hz: 65.4,fifth: true,  noise: 0.04 },
    bridge:      { file: 'bridge.mp3',      hz: 73.4,fifth: false, noise: 0.07 },
    edge:        { file: 'edge.mp3',        hz: 49,  fifth: false, noise: 0.12 },
    axial_south: { file: 'axial_south.mp3', hz: 82.4,fifth: true,  noise: 0.06 },
  };
  const XFADE = 4.0;        // секунд кроссфейда
  const VOL   = 0.16;       // общий потолок — музыка мира тихая

  let ctx=null, master=null, current=null, currentId=null, unlocked=false;
  const buffers={};

  function ensureCtx(){
    if(ctx) return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return;
    ctx=new AC();
    master=ctx.createGain(); master.gain.value=VOL; master.connect(ctx.destination);
  }

  // ── путь до assets/music/ от prototype/<игра>/ ──
  function trackUrl(file){ return '../../assets/music/'+file; }

  async function loadBuffer(id){
    if(buffers[id]!==undefined) return buffers[id];
    try{
      const r=await fetch(trackUrl(TRACKS[id].file));
      if(!r.ok) throw 0;
      buffers[id]=await ctx.decodeAudioData(await r.arrayBuffer());
    }catch(e){ buffers[id]=null; }   // нет файла — будет заглушка
    return buffers[id];
  }

  // ── процедурная заглушка: два расстроенных голоса + дыхание шума ──
  function makeDrone(cfg){
    const g=ctx.createGain(); g.gain.value=0;
    const mix=ctx.createGain(); mix.gain.value=1; mix.connect(g);
    const nodes=[];
    const voice=(freq,detune,level,type)=>{
      const o=ctx.createOscillator(); o.type=type||'triangle';
      o.frequency.value=freq; o.detune.value=detune;
      const og=ctx.createGain(); og.gain.value=level;
      o.connect(og); og.connect(mix); o.start(); nodes.push(o);
      return o;
    };
    voice(cfg.hz,-6,0.30); voice(cfg.hz,+7,0.30);
    voice(cfg.hz*2,-3,0.10,'sine');
    if(cfg.fifth) voice(cfg.hz*1.5,+4,0.14,'sine');
    // медленное дыхание
    const lfo=ctx.createOscillator(); lfo.frequency.value=0.05+Math.random()*0.03;
    const lfoG=ctx.createGain(); lfoG.gain.value=0.35;
    lfo.connect(lfoG); lfoG.connect(mix.gain); lfo.start(); nodes.push(lfo);
    // шум сквозь низкий фильтр — ветер/зерно
    if(cfg.noise>0){
      const len=ctx.sampleRate*2, nb=ctx.createBuffer(1,len,ctx.sampleRate);
      const d=nb.getChannelData(0);
      for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
      const src=ctx.createBufferSource(); src.buffer=nb; src.loop=true;
      const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=320; f.Q.value=0.4;
      const ng=ctx.createGain(); ng.gain.value=cfg.noise;
      src.connect(f); f.connect(ng); ng.connect(mix); src.start(); nodes.push(src);
    }
    g.connect(master);
    return { gain:g, stop(){ nodes.forEach(n=>{try{n.stop();}catch(e){}}); setTimeout(()=>g.disconnect(),100); } };
  }

  function makeFilePlayer(buf){
    const g=ctx.createGain(); g.gain.value=0;
    const src=ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    src.connect(g); g.connect(master); src.start();
    return { gain:g, stop(){ try{src.stop();}catch(e){} setTimeout(()=>g.disconnect(),100); } };
  }

  async function play(id){
    if(!ctx||!TRACKS[id]||id===currentId) return;
    currentId=id;
    const buf=await loadBuffer(id);
    if(currentId!==id) return;                    // пока грузили — сменилось
    const next = buf ? makeFilePlayer(buf) : makeDrone(TRACKS[id]);
    const t=ctx.currentTime;
    next.gain.gain.setValueAtTime(0,t);
    next.gain.gain.linearRampToValueAtTime(1,t+XFADE);
    if(current){
      const old=current;
      old.gain.gain.setValueAtTime(old.gain.gain.value,t);
      old.gain.gain.linearRampToValueAtTime(0,t+XFADE);
      setTimeout(()=>old.stop(),XFADE*1000+200);
    }
    current=next;
  }

  window.ArdetAudio={
    unlock(){                                     // звать из жеста пользователя
      ensureCtx();
      if(!ctx) return;
      if(ctx.state==='suspended') ctx.resume();
      unlocked=true;
      if(currentId){ const id=currentId; currentId=null; play(id); }
    },
    setLocation(id){
      if(!unlocked){ currentId=id; return; }      // запомним до разблокировки
      play(id);
    },
    get unlocked(){ return unlocked; },
  };

  // ═══ МОБИЛЬНЫЙ ФУЛЛСКРИН ═══
  window.ArdetFS={
    enter(){
      const el=document.documentElement;
      const rq=el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen;
      if(rq){ try{ rq.call(el,{navigationUI:'hide'}); }catch(e){ try{rq.call(el);}catch(e2){} } }
      // iOS Safari фуллскрина не даёт — там путь «На экран Домой» (см. meta)
      if(screen.orientation&&screen.orientation.lock)
        screen.orientation.lock('landscape').catch(()=>{});
    },
    get active(){ return !!(document.fullscreenElement||document.webkitFullscreenElement); },
  };
})();
