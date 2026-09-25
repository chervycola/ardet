// ═══════════════════════════════════════════════════════════════════
// ARDET AUDIO v2 — треки по очереди, радио, коллекция. Без кроссфейдов.
// Правила (канон автора):
//  · трек НИКОГДА не обрывается сменой локации — доигрывает до конца,
//    затем начинается трек текущей локации;
//  · посещение локации ОТКРЫВАЕТ её трек в коллекции (навсегда,
//    localStorage) — открытый можно включить с радио из любого места;
//  · выбор на радио — явное действие: включается сразу; по окончании
//    радио возвращается в эфир локации;
//  · пока файла трека нет — тихая процедурная заглушка (90 с и «конец»).
// Файлы: assets/music/<id>.mp3 · Подключение:
//   <script src="../shared/ardet-audio.js"><\/script>
//   ArdetAudio.unlock()        — в первом жесте (заставка)
//   ArdetAudio.playOnce('title') — трек заставки (после него — эфир)
//   ArdetAudio.setLocation(id) — локация сменилась (не обрывает)
//   ArdetFS.enter()            — на весь экран
// ═══════════════════════════════════════════════════════════════════
(function(){
  const TRACKS = {
    title:       { file:'title.mp3',       name:'заставка',   hz:55,  fifth:true,  noise:0.05 },
    townlet:     { file:'townlet.mp3',     name:'городок',    hz:65.4,fifth:true,  noise:0.04 },
    bridge:      { file:'bridge.mp3',      name:'за мостом',  hz:73.4,fifth:false, noise:0.07 },
    edge:        { file:'edge.mp3',        name:'край',       hz:49,  fifth:false, noise:0.12 },
    axial_south: { file:'axial_south.mp3', name:'осевое · юг',hz:82.4,fifth:true,  noise:0.06 },
    // зоны старой игры (ardet.fun)
    settlement:  { file:'settlement.mp3',  name:'поселение',  hz:65.4,fifth:true,  noise:0.04 },
    street:      { file:'street.mp3',      name:'улица',      hz:60,  fifth:true,  noise:0.05 },
    highway:     { file:'highway.mp3',     name:'трасса',     hz:48,  fifth:false, noise:0.08 },
    forest:      { file:'forest.mp3',      name:'лес',        hz:42,  fifth:true,  noise:0.06 },
    toxic:       { file:'toxic.mp3',       name:'зона',       hz:70,  fifth:false, noise:0.10 },
    quarter:     { file:'quarter.mp3',     name:'квартал',    hz:38,  fifth:false, noise:0.07 },
  };
  const VOL=0.5;                 // мастер; треки авторские — не душим
  const DRONE_LEN=90;            // сек «длительности» заглушки
  const LS_KEY='ardet_tracks_unlocked';

  let ctx=null, master=null, unlocked=false;
  let current=null;              // {id, stop(), isDrone}
  let loadingId=null;            // трек в декодировании — эфир ждёт
  let locationId=null;           // эфир: чей трек играть следующим
  let radioPick=null;            // выбранный на радио (one-shot)
  const buffers={};
  let collection=new Set(['title']);
  try{ JSON.parse(localStorage.getItem(LS_KEY)||'[]').forEach(t=>collection.add(t)); }catch(e){}

  function saveCol(){ try{ localStorage.setItem(LS_KEY, JSON.stringify([...collection])); }catch(e){} }
  function ensureCtx(){
    if(ctx) return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return;
    ctx=new AC();
    master=ctx.createGain(); master.gain.value=VOL; master.connect(ctx.destination);
  }

  // музыка может лежать по-разному относительно страницы — пробуем базы
  const BASES=[ (window.ARDET_MUSIC_BASE||null), 'assets/music/', '../assets/music/', '../../assets/music/' ].filter(Boolean);
  let baseFound=null;
  async function loadBuffer(id){
    if(buffers[id]!==undefined) return buffers[id];
    for(const b of (baseFound?[baseFound]:BASES)){
      try{
        const r=await fetch(b+TRACKS[id].file);
        if(!r.ok) continue;
        buffers[id]=await ctx.decodeAudioData(await r.arrayBuffer());
        baseFound=b;
        return buffers[id];
      }catch(e){}
    }
    buffers[id]=null; return null;
  }

  // ── заглушка: конечный гул (пока нет файла) ──
  function makeDrone(cfg,onended){
    const g=ctx.createGain(); g.gain.value=0;
    g.gain.linearRampToValueAtTime(0.28,ctx.currentTime+3);
    const nodes=[];
    const voice=(f,det,lv,type)=>{ const o=ctx.createOscillator(); o.type=type||'triangle';
      o.frequency.value=f; o.detune.value=det;
      const og=ctx.createGain(); og.gain.value=lv; o.connect(og); og.connect(g);
      o.start(); nodes.push(o); };
    voice(cfg.hz,-6,0.3); voice(cfg.hz,7,0.3); voice(cfg.hz*2,-3,0.1,'sine');
    if(cfg.fifth) voice(cfg.hz*1.5,4,0.14,'sine');
    if(cfg.noise>0){
      const len=ctx.sampleRate*2, nb=ctx.createBuffer(1,len,ctx.sampleRate);
      const d=nb.getChannelData(0);
      for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
      const src=ctx.createBufferSource(); src.buffer=nb; src.loop=true;
      const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=320;
      const ng=ctx.createGain(); ng.gain.value=cfg.noise;
      src.connect(f); f.connect(ng); ng.connect(g); src.start(); nodes.push(src);
    }
    g.connect(master);
    const endT=setTimeout(()=>{ // «трек кончился»
      g.gain.linearRampToValueAtTime(0,ctx.currentTime+2.5);
      setTimeout(()=>{ kill(); onended&&onended(); },2600);
    },DRONE_LEN*1000);
    function kill(){ clearTimeout(endT); nodes.forEach(n=>{try{n.stop();}catch(e){}});
      setTimeout(()=>g.disconnect(),100); }
    return { stop:kill, isDrone:true };
  }
  function makeFilePlayer(buf,onended){
    const g=ctx.createGain(); g.gain.value=1; g.connect(master);
    const src=ctx.createBufferSource(); src.buffer=buf; src.loop=false;
    src.connect(g); src.onended=()=>{ setTimeout(()=>g.disconnect(),100); onended&&onended(); };
    src.start();
    return { stop(){ try{src.onended=null;src.stop();}catch(e){} setTimeout(()=>g.disconnect(),100); }, isDrone:false };
  }

  function nextId(){ // что играть, когда текущий закончился
    if(radioPick){ const id=radioPick; radioPick=null; return id; }
    return locationId;
  }
  async function startTrack(id){
    if(!ctx||!TRACKS[id]) return;
    loadingId=id;
    const buf=await loadBuffer(id);
    if(loadingId!==id || current) return;     // пока грузили — план сменился
    loadingId=null;
    const onended=()=>{ current=null; ui.refresh();
      const nid=nextId(); if(nid) startTrack(nid); };
    current = buf ? makeFilePlayer(buf,onended) : makeDrone(TRACKS[id],onended);
    current.id=id;
    ui.refresh();
  }
  function hardSwitch(id){                    // радио/заставка: включить сразу
    if(!ctx) return;
    loadingId=null;
    if(current){ const c=current; current=null; c.stop(); }
    startTrack(id);
  }

  // ═══ РАДИО — интерфейс коллекции ═══
  const ui=(function(){
    let btn=null,pauseBtn=null,panel=null,open=false;
    function build(){
      if(btn||!document.body) return;
      const top=window.ARDET_RADIO_TOP||'12px';
      const right=window.ARDET_RADIO_RIGHT||'12px';
      const css=document.createElement('style');
      css.textContent=`
      #ardetRadioWrap{position:fixed;top:${top};right:${right};z-index:30;display:flex;gap:6px}
      #ardetRadioWrap button{background:rgba(238,227,203,0.55);color:#3A3026;border:none;
        padding:7px 11px 8px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.3);
        backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);
        font:500 9px Montserrat,sans-serif;letter-spacing:3px;text-transform:uppercase}
      #ardetRadioWrap button:active{background:rgba(238,227,203,0.78)}
      #ardetRadioBtn b{color:#C23B2B}
      #ardetPauseBtn{letter-spacing:0;min-width:34px;text-align:center;padding-left:8px;padding-right:8px}
      #ardetRadioPanel{position:fixed;top:calc(${top} + 40px);right:${right};z-index:30;min-width:210px;
        background:rgba(238,227,203,0.82);color:#3A3026;
        backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
        padding:10px 12px;box-shadow:0 8px 26px rgba(0,0,0,.45);display:none}
      #ardetRadioPanel h4{margin:0 0 7px;font:500 8px Montserrat,sans-serif;
        letter-spacing:3px;color:#C23B2B;text-transform:uppercase}
      #ardetRadioPanel button{display:block;width:100%;text-align:left;background:none;
        border:none;border-top:1px solid rgba(58,48,38,.18);padding:6px 2px;cursor:pointer;
        font:italic 15px 'Cormorant Garamond',Georgia,serif;color:#3A3026}
      #ardetRadioPanel button:hover{color:#C23B2B}
      #ardetRadioPanel button.now::before{content:'\u25c9 ';color:#C23B2B}
      #ardetRadioPanel .off{opacity:.45;font-style:normal;font-size:12px}`;
      document.head.appendChild(css);
      const wrap=document.createElement('div'); wrap.id='ardetRadioWrap';
      btn=document.createElement('button'); btn.id='ardetRadioBtn';
      btn.innerHTML='<b>\u25c9</b> радио';
      pauseBtn=document.createElement('button'); pauseBtn.id='ardetPauseBtn';
      pauseBtn.textContent='\u275a\u275a'; pauseBtn.title='пауза';
      panel=document.createElement('div'); panel.id='ardetRadioPanel';
      btn.addEventListener('click',()=>{ open=!open; panel.style.display=open?'block':'none'; refresh(); });
      pauseBtn.addEventListener('click',()=>{           // пауза всего эфира
        if(!ctx) return;
        if(ctx.state==='running'){ ctx.suspend(); pauseBtn.textContent='\u25ba'; pauseBtn.title='продолжить'; }
        else { ctx.resume(); pauseBtn.textContent='\u275a\u275a'; pauseBtn.title='пауза'; }
      });
      wrap.appendChild(btn); wrap.appendChild(pauseBtn);
      document.body.appendChild(wrap); document.body.appendChild(panel);
    }
    function refresh(){
      if(!panel||!open) return;
      let h='<h4>радио · опись эфира</h4>';
      const auto=!radioPick&&(!current||current.id===locationId||collection.size===0);
      h+=`<button data-id="__auto"${(!radioPick&&current&&current.id===locationId)?' class="now"':''}>эфир локации</button>`;
      for(const id of collection){
        if(!TRACKS[id]) continue;
        const now=current&&current.id===id&&(radioPick===null);
        h+=`<button data-id="${id}"${current&&current.id===id?' class="now"':''}>${TRACKS[id].name}</button>`;
      }
      h+='<div class="off">трек доигрывает до конца.<br>новые — находишь в локациях.</div>';
      panel.innerHTML=h;
      panel.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
        const id=b.dataset.id;
        if(id==='__auto'){ radioPick=null; if(locationId&&(!current||current.id!==locationId)) hardSwitch(locationId); }
        else { radioPick=null; hardSwitch(id); }
        refresh();
      }));
    }
    if(document.readyState!=='loading') build();
    else document.addEventListener('DOMContentLoaded',build);
    return {refresh, build};
  })();

  window.ArdetAudio={
    unlock(){
      ensureCtx(); if(!ctx) return;
      if(ctx.state==='suspended') ctx.resume();
      unlocked=true; ui.build();
      if(!current && locationId) startTrack(locationId);
    },
    playOnce(id){                       // трек заставки: сразу, вне очереди
      if(!unlocked) this.unlock();
      if(!ctx) return;
      hardSwitch(id);
    },
    setLocation(id){                    // локация: открыть трек + эфир
      if(!TRACKS[id]) return;
      if(!collection.has(id)){ collection.add(id); saveCol(); ui.refresh(); }
      locationId=id;
      if(unlocked && !current && !loadingId) startTrack(id); // тишина — начинаем
      // если что-то играет — доиграет; локация подхватится после
    },
    get unlocked(){ return unlocked; },
    get nowPlaying(){ return current?current.id:null; },
  };

  // ═══ МОБИЛЬНЫЙ ФУЛЛСКРИН ═══
  window.ArdetFS={
    enter(){
      const el=document.documentElement;
      const rq=el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen;
      if(rq){ try{ rq.call(el,{navigationUI:'hide'}); }catch(e){ try{rq.call(el);}catch(e2){} } }
      if(screen.orientation&&screen.orientation.lock)
        screen.orientation.lock('landscape').catch(()=>{});
    },
    get active(){ return !!(document.fullscreenElement||document.webkitFullscreenElement); },
  };
})();
