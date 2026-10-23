// ═══════════════════════════════════════
// UI SYSTEM — menus, panels, overlays
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import { lookText } from '../world/potemkin.js';
import { redNoon, smear } from '../world/redNoon.js';
import { events, E } from '../core/events.js';
import { getPortrait } from '../assets/loader.js';
import { fadeIn, scaleIn, slideUp } from './transitions.js';
import { playClick } from '../audio/audio.js';
import { input } from '../core/input.js';
import { useTexts } from '../world/useActions.js';
import { paginate, pageMeasure } from './pages.js';
import { STREAM } from './stream.js';

// Special use-actions handled directly by main.js (not via useTexts)
const SPECIAL_USE = new Set(['shop1', 'shop2', 'shop3', 'gates_pass', 'brainrot_enter', 'branch_plain', 'branch_back', 'well_crank', 'town_well_crank', 'under_up', 'under_ticket', 'under_call', 'under_fish', 'under_sign', 'under_herb', 'under_read', 'horizon_look', 'net_cert', 'net_mute', 'house_exit', 'house_enter']);

// Does this location actually do something on «использовать»?
// Mirrors the dispatch in main.js's 'location.use' handler — keep in sync.
function hasUseAction(loc) {
  if (loc.id === 'terminal') return true;
  if (loc.useShown && !loc.useShown()) return false;   // пасхалка: действие проявляется не сразу (пифос — после шёпота)
  const key = loc.useAction || loc.id;
  return SPECIAL_USE.has(key) || !!useTexts[key];
}

// ── MENU (location interaction) ──
const menuEl = document.getElementById('menu');
const menuInsc = document.getElementById('menu-inscription');
let activeLoc = null;

export const menuInscriptions = {
  net_note: 'почерк чужой.',                 // сеть странников (ui/netui.js)
  net_note_mine: 'почерк свой.',
  net_other: 'идёт своей дорогой.',
  wake_house: 'окна тёмные.',               // дом пробуждения (world/house.js)
  h_door: 'не заперто.',
  h_journal: 'ни строки.',
  h_window: 'за стеклом — квартал.',
  campfire: 'огонь не спрашивает.',
  jester_home: 'смеётся. потому что альтернатива.',
  terminal: 'session expired. reconnect?',
  sol_home: 'горит. без адресата.',
  vending: 'крути — получи мериты. цикл замкнут.',
  library: 'полка 3.14. не листай.',
  tent: 'без меня народ неполный.',
  elder_home: 'сидит. счёт ведётся.',
  graffiti: 'СИСТЕМА МЕРТВА. ...НО СКИДКИ ЖИВЫ.',
  radio: 'i don\'t want to set the world on fire...',
  cross: 'amor fati. или нет.',
  raven: '.pdf → .epub → .apk → .dna',
  lake: 'рыба — единственный оптимист.',
  basement: 'углов — пять. вчера было четыре.',
  exit: 'блуждание — было общим. продано. органа нет.',
  train: 'рельсы кончились.',
  bus: 'скука — было общим. продано. органа нет.',
  junkyard: 'вход — разное. выход — куб.',
  church: 'lasciate ogni speranza.',
  fountain: 'чума передаётся через текст.',
  crypt: 'ярус 9. предатели. лёд кончается.',
  dumpster: 'саморазрушение — честная форма творчества.',
  pizzeria: '47 столов. одно блюдо. welcome куда?',
  crater: 'монета уже упала. результат — ребро.',
  town_well: 'возвращено. владелец выбыл.',
  horizon_pole: 'нашедшему — вернуть.',
  nilometer: 'река больше не поднимается.',
  colonnade: 'тень расчерчена на платные полосы.',
  gas_grate: 'один горящий фонарь.',
  factory_hatch: 'завод работает. на что — уже не помнит.',
  factory_cellar: '1961. не открывать.',
  carriage_89: 'здесь был вася.',
  metro_sealed: 'lasciate ogni sp…',
  park_freezer: 'ждёт лучших времён.',
  overpass: 'тишина — было общим. продано. органа нет.',
  riverbed: 'дед помнил реку. отец — ручей. сын — лужу. внук — пыль.',
  billboard: 'галочка — бог после бога.',
  powerline: 'темнота — было общим. продано. органа нет.',
  ruins: 'квартира 42. кот ждёт. примус починен.',
  pipeline: 'труба считает.',
  watchtower: 'бинокль направлен внутрь.',
  pit: '...братишка...',
  nocturnal: 'тишина держит нити. нити держат тебя.',
  nocturnal_home: 'молчит. звук не долетает.',
  theater: 'выйди на сцену. зал полон.',
  altar: 'мох помнит. мох всегда помнил. теперь ты тоже.',
  posterwall: 'музыка не горит.',
  banner: '★ coming soon ★',
};

export function showMenu(loc) {
  activeLoc = loc;
  state.transition('menu');

  // Inscription
  if (menuInscriptions[loc.id]) {
    const insc = menuInscriptions[loc.id];
    menuInsc.textContent = '« ' + (redNoon.k > 0.5 ? smear(insc) : insc) + ' »';   // в полдень таблички нечитаемы
    menuInsc.classList.add('on');
  } else {
    menuInsc.classList.remove('on');
    menuInsc.textContent = '';
  }

  // Show/hide contextual buttons
  menuEl.querySelector('[data-a="talk"]').style.display = loc.npc ? 'flex' : 'none';
  menuEl.querySelector('[data-a="listen"]').style.display = 'none'; // TODO: listen sounds
  menuEl.querySelector('[data-a="take"]').style.display = 'none';   // TODO: lore pickup
  // «использовать»: hide when the location has no action (a silent
  // dead button reads as a bug); on two-sided street signs it means
  // walking around the plaque — label it accordingly.
  const useBtn = menuEl.querySelector('[data-a="use"]');
  if (!hasUseAction(loc)) {
    useBtn.style.display = 'none';
  } else {
    useBtn.style.display = 'flex';
    useBtn.innerHTML = useMenuLabel(loc);
  }

  // второе действие вещи — проявляется по случаю (изнанка: у лестницы — подуть на уголёк)
  const altBtn = menuEl.querySelector('[data-a="alt"]');
  const alt = loc.altNow ? loc.altNow() : null;
  altBtn.style.display = alt ? 'flex' : 'none';
  if (alt) altBtn.innerHTML = alt.label;

  // Position near last mouse position on desktop; mobile CSS handles centering.
  if (window.innerWidth > 768) {
    menuEl.style.left = Math.min(input.mouseX, window.innerWidth - 200) + 'px';
    menuEl.style.top = Math.min(input.mouseY, window.innerHeight - 260) + 'px';
  } else {
    menuEl.style.left = '';
    menuEl.style.top = '';
  }

  menuEl.classList.add('on');
  slideUp(menuEl, 200);
}

export function hideMenu() {
  menuEl.classList.remove('on');
  menuInsc.classList.remove('on');
  state.transition('game');
  activeLoc = null;
}

export function getActiveLoc() { return activeLoc; }

// Действие в один клик (weave/ROADMAP И3): что можно сделать с вещью — пункты меню
// без «отмены»; одно — сразу оно, больше — меню.
export function menuActions(loc) {
  const acts = ['look'];
  if (hasUseAction(loc)) acts.push('use');
  if (loc.altNow && loc.altNow()) acts.push('alt');
  if (loc.npc) acts.push('talk');
  return acts;
}
// intent — с клавиш E/F и правой кнопки: 'look' или 'use' (у человека «использовать» —
// заговорить). Второе действие (подуть, пожаловаться) — только из меню: случайно не
// жалуются. Путь тот же, что из меню: события, окна и звук — те же.
export function openThing(loc, intent = null) {
  const acts = menuActions(loc);
  let act = null;
  if (intent === 'look') act = 'look';
  else if (intent === 'use') act = acts.includes('use') ? 'use' : acts.includes('talk') ? 'talk' : acts.length === 1 ? 'look' : null;
  else if (acts.length === 1) act = acts[0];
  if (!act) { showMenu(loc); return; }
  activeLoc = loc;
  state.transition('menu');
  menuAction(act, true);
}

export function menuAction(action, direct = false) {
  playClick();
  menuEl.classList.remove('on');
  const loc = activeLoc;
  // меню могло закрыться между открытием и нажатием (двойной тап,
  // синтетический click) — тогда действия нет, просто закрываемся
  if (!loc) { hideMenu(); return; }

  switch (action) {
    case 'look':
      events.emit(E.LOCATION_LOOK, loc);
      showLook(loc, direct);
      break;
    // сначала закрыть меню, потом действие: оно может открыть своё окно (сцена, лавка,
    // терминал) — иначе меню, закрываясь, вернуло бы игру, а окно осталось висеть
    case 'use':
      hideMenu();
      events.emit('location.use', loc);
      break;
    case 'alt':
      hideMenu();
      events.emit('location.alt', loc);
      break;
    case 'talk':
      if (loc.npc) {
        events.emit(E.NPC_TALK, loc.npc, loc);
        startDialogue(loc);
      } else {
        hideMenu();
      }
      break;
    case 'cancel':
      hideMenu();
      break;
  }
}

// ── LOOK PANEL ──
const lookEl = document.getElementById('look');
let lookPages = [];
let lookPageIdx = 0;
let lookShownAt = 0;   // клик в ту же долю секунды, что открыл страницу, не листает её
let lookTitle = '';   // заголовок окна: имя вещи или название действия («МОНЕТА», «Я НЕ РОБОТ»)
let lookInsc = '';    // надпись меню, когда меню пропущено (один клик): её не теряем — строка под заголовком
let lookLoc = null;   // вещь, которую осматривают: F из осмотра — использовать её же

// direct — открыто мимо меню (одно действие, клавиша): надпись меню переходит в окно
export function showLook(loc, direct = false) {
  state.transition('look');
  lookTitle = (loc && loc.name) || '';
  lookInsc = direct && loc ? menuInscriptions[loc.id] || '' : '';
  lookLoc = activeLoc && activeLoc === loc ? loc : null;

  const lookData = lookText(loc);
  const coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const m = pageMeasure(window.innerWidth, window.innerHeight, coarse, STREAM);
  lookPages = paginate(lookData, m.budget, m.nl);
  lookPageIdx = 0;
  renderLookPage();

  lookEl.classList.add('on');
  scaleIn(lookEl, 250);

  // Track observer viewing
  if (loc.npc && ['jester', 'sol', 'elder', 'nocturnal'].includes(loc.npc)) {
    events.emit(E.OBSERVER_MET, loc.npc);
  }
}

function renderLookPage() {
  const lt = document.getElementById('lt');
  const lb = document.getElementById('lb');
  let ind = document.getElementById('look-page');
  if (!ind && lookEl) {          // в разметке его не было — указатель не показывался никогда
    ind = document.createElement('div');
    ind.id = 'look-page';        // вид — style.css
    lookEl.appendChild(ind);
  }
  lookShownAt = performance.now();

  let insc = document.getElementById('look-insc');
  if (!insc && lookEl && lt) {
    insc = document.createElement('div');
    insc.id = 'look-insc';       // вид — style.css
    lt.after(insc);
  }

  // красный полдень: мир перестаёт быть текстом — буквы точками, строки на месте
  const noon = redNoon.k > 0.5, blind = noon ? smear : (x => x);
  lt.textContent = blind(lookTitle || (activeLoc ? activeLoc.name : ''));
  lb.textContent = blind(lookPages[lookPageIdx] || '');
  lb.classList.toggle('blind', noon);
  if (insc) {
    const on = !!lookInsc && lookPageIdx === 0;
    insc.textContent = on ? '« ' + blind(lookInsc) + ' »' : '';
    insc.style.display = on ? 'block' : 'none';
  }

  if (ind) {
    // F — второе дело той же вещи: обойти знак, использовать, заговорить (клавиатура)
    const fine = !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);
    const f = fine && lookLoc ? nextWord(lookLoc) : '';
    const fHint = f ? ' · F — ' + f : '';
    if (lookPages.length > 1) {
      const isLast = lookPageIdx >= lookPages.length - 1;
      ind.textContent = (lookPageIdx + 1) + ' / ' + lookPages.length
        + (isLast ? '   пробел — закрыть' : '   пробел — дальше · ← назад') + fHint + ' · esc ✕';
      ind.style.display = 'block';
    } else {
      ind.textContent = 'пробел / esc — закрыть' + fHint;
      ind.style.display = 'block';
    }
  }
}

// подпись «использовать» у вещи на кнопке меню: обойти знак, обойти постройку или своё
function useMenuLabel(loc) {
  const flipping = (loc.streetForm && loc.useAction && loc.useAction.endsWith('_flip'))
    || (loc.archDraw && loc.useAction && loc.useAction.endsWith('_around'));
  return loc.useLabel ? loc.useLabel : flipping
    ? (loc.archDraw ? '<i>↺</i>ОБОЙТИ' : '<i>↺</i>ОБОЙТИ ЗНАК')
    : '<i>✋</i>ИСПОЛЬЗОВАТЬ';
}
// что сделает F у осмотренной вещи — словом для подсказки; нечего — пусто
function nextWord(loc) {
  const acts = menuActions(loc);
  if (acts.includes('use')) return useMenuLabel(loc).replace(/<i>.*?<\/i>/, '').toLowerCase();
  if (acts.includes('talk')) return 'говорить';
  return '';
}

export function advanceOrCloseLook() {
  if (performance.now() - lookShownAt < 250) return false;
  if (lookPageIdx < lookPages.length - 1) {
    lookPageIdx++;
    renderLookPage();
    return false;
  }
  closeLook();
  return true;
}

export function closeLook() {
  lookEl.classList.remove('on');
  state.transition('game');
  activeLoc = null;
  lookLoc = null;
  lookInsc = '';
  lookPages = [];
  lookPageIdx = 0;
}

// ── DIALOGUE ──
const dlgEl = document.getElementById('dlg');
let dlgLines = [];
let dlgIndex = 0;
let dlgLoc = null;

export function startDialogue(loc) {
  if (!loc.talkLines || loc.talkLines.length === 0) {
    hideMenu();
    return;
  }

  dlgLoc = loc;
  dlgLines = loc.talkLines;
  dlgIndex = 0;
  state.transition('dialogue');
  dlgEl.classList.add('on');
  fadeIn(dlgEl, 300);
  typeLine();
}

function drawPortrait(npcId) {
  // The #dpc canvas is 104×130; an Higgsfield 1024×1280 painting drawn
  // into it with nearest-neighbour reads as a detailed pixel icon —
  // this is the bridge between the painterly style and the game art.
  const c = document.getElementById('dpc');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  const img = getPortrait(npcId);
  if (!img) {
    // No painting yet — leave the frame empty (the existing dlg
    // border + bone-color background already reads as an icon slot).
    ctx.fillStyle = '#0a0810';
    ctx.fillRect(0, 0, c.width, c.height);
    return;
  }
  ctx.imageSmoothingEnabled = false;
  // Cover-fit: scale up the shorter side so the painting fills the
  // 4:5 frame, then center-crop the longer side.
  const r = Math.max(c.width / img.width, c.height / img.height);
  const w = img.width * r, h = img.height * r;
  ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
}

function typeLine() {
  const nameEl = document.getElementById('dn');
  const textEl = document.getElementById('dt');
  const optsEl = document.getElementById('do');

  if (dlgLoc) {
    nameEl.textContent = dlgLoc.talkName || dlgLoc.name || '';
    drawPortrait(dlgLoc.npc);
  }
  textEl.textContent = dlgLines[dlgIndex] || '';

  optsEl.innerHTML = '';
  if (dlgIndex < dlgLines.length - 1) {
    const btn = document.createElement('button');
    btn.className = 'dopt';
    btn.textContent = 'Продолжить...';
    btn.onclick = () => { dlgIndex++; typeLine(); };
    optsEl.appendChild(btn);
  } else {
    const btn = document.createElement('button');
    btn.className = 'dopt';
    btn.textContent = 'Уйти';
    btn.onclick = closeDialogue;
    optsEl.appendChild(btn);
  }
}

export function closeDialogue() {
  dlgEl.classList.remove('on');
  state.transition('game');
  if (dlgLoc && dlgLoc.npc) {
    events.emit(E.NPC_TALK, dlgLoc.npc, dlgLoc);
  }
  dlgLoc = null;
  dlgLines = [];
  dlgIndex = 0;
}

// ── INIT: wire up menu buttons ──
export function initUI() {
  document.querySelectorAll('.mi').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      menuAction(el.dataset.a);
    });
  });

  // Click outside menu closes it
  document.addEventListener('click', e => {
    if (state.is('menu') && !menuEl.contains(e.target)) {
      hideMenu();
    }
  });

  // Look panel: click to advance/close
  lookEl.addEventListener('click', e => {
    e.stopPropagation();
    advanceOrCloseLook();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (state.is('look')) closeLook();
      else if (state.is('menu')) hideMenu();
      else if (state.is('dialogue')) closeDialogue();
    }
    if ((e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') && state.is('look')) {
      e.preventDefault();
      advanceOrCloseLook();
    }
    if ((e.key === 'ArrowLeft' || e.key === 'Backspace') && state.is('look') && lookPageIdx > 0) {
      e.preventDefault();
      lookPageIdx--; renderLookPage();
    }
    if ((e.key === ' ' || e.key === 'Enter') && state.is('dialogue')) {
      const btn = document.querySelector('#do button');     // «Продолжить…» или «Уйти»
      if (btn) { e.preventDefault(); btn.click(); }
    }
    // E — осмотреть, F — использовать (обойти, заговорить): в меню и из окна осмотра.
    // По месту клавиши, не по букве: в русской раскладке те же У и А
    const k = e.code === 'KeyE' ? 'look' : e.code === 'KeyF' ? 'use' : null;
    if (!k || e.repeat || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;   // уже сделано в игре (main.js)
    if (state.is('menu') && activeLoc) {
      const acts = menuActions(activeLoc);
      const act = k === 'look' ? 'look' : acts.includes('use') ? 'use' : acts.includes('talk') ? 'talk' : null;
      if (act) { e.preventDefault(); menuAction(act); }
    } else if (state.is('look') && k === 'use' && lookLoc && nextWord(lookLoc)) {
      e.preventDefault();
      const l = lookLoc;
      closeLook();
      openThing(l, 'use');
    }
  });

  // Swipe on look panel
  let swipeStartX = 0;
  lookEl.addEventListener('touchstart', e => {
    swipeStartX = e.touches[0].clientX;
  }, { passive: true });
  lookEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - swipeStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) advanceOrCloseLook();
      else if (lookPageIdx > 0) { lookPageIdx--; renderLookPage(); }
    }
  }, { passive: true });
}
