// ═══════════════════════════════════════
// UI SYSTEM — menus, panels, overlays
// ═══════════════════════════════════════
import { state } from '../core/state.js';
import { events, E } from '../core/events.js';
import { getPortrait } from '../assets/loader.js';
import { fadeIn, scaleIn, slideUp } from './transitions.js';
import { playClick } from '../audio/audio.js';
import { input } from '../core/input.js';
import { useTexts } from '../world/useActions.js';

// Special use-actions handled directly by main.js (not via useTexts)
const SPECIAL_USE = new Set(['shop1', 'shop2', 'shop3', 'gates_pass']);

// Does this location actually do something on «использовать»?
// Mirrors the dispatch in main.js's 'location.use' handler — keep in sync.
function hasUseAction(loc) {
  if (loc.id === 'terminal') return true;
  const key = loc.useAction || loc.id;
  return SPECIAL_USE.has(key) || !!useTexts[key];
}

// ── MENU (location interaction) ──
const menuEl = document.getElementById('menu');
const menuInsc = document.getElementById('menu-inscription');
let activeLoc = null;

const menuInscriptions = {
  campfire: 'огонь не спрашивает.',
  jester_home: 'смеётся. потому что альтернатива — пасть духом.',
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
  train: 'рельсы кончились. маршрут — внутренний.',
  bus: 'скука — было общим. продано. органа нет.',
  junkyard: 'вход — разное. выход — куб.',
  church: 'lasciate ogni speranza.',
  fountain: 'чума передаётся через текст.',
  crypt: 'ярус 9. предатели. лёд кончается.',
  dumpster: 'саморазрушение — честная форма творчества.',
  pizzeria: '47 столов. одно блюдо. welcome куда?',
  crater: 'монета уже упала. результат — ребро.',
  overpass: 'тишина — было общим. продано. органа нет.',
  riverbed: 'дед помнил реку. отец — ручей. сын — лужу. внук — пыль.',
  billboard: 'галочка — бог после бога.',
  powerline: 'темнота — было общим. продано. органа нет.',
  ruins: 'квартира 42. кот ждёт. примус починен.',
  pipeline: 'труба считает. не жидкость — вас.',
  watchtower: 'бинокль направлен внутрь.',
  pit: '...братишка...',
  nocturnal: 'тишина держит нити. нити держат тебя.',
  nocturnal_home: 'молчит. звук не долетает.',
  theater: 'выйди на сцену. зал полон. зал — это ты.',
  altar: 'мох помнит. мох всегда помнил. теперь ты тоже.',
  posterwall: 'музыка не горит.',
  banner: '★ coming soon ★',
};

export function showMenu(loc) {
  activeLoc = loc;
  state.transition('menu');

  // Inscription
  if (menuInscriptions[loc.id]) {
    menuInsc.textContent = '« ' + menuInscriptions[loc.id] + ' »';
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
    const flipping = loc.streetForm && loc.useAction && loc.useAction.endsWith('_flip');
    useBtn.innerHTML = flipping
      ? '<i>↺</i>ОБОЙТИ ЗНАК'
      : '<i>✋</i>ИСПОЛЬЗОВАТЬ';
  }

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

export function menuAction(action) {
  playClick();
  menuEl.classList.remove('on');
  const loc = activeLoc;

  switch (action) {
    case 'look':
      events.emit(E.LOCATION_LOOK, loc);
      showLook(loc);
      break;
    case 'use':
      events.emit('location.use', loc);
      hideMenu();
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

// Paginate long text
function paginateLook(text, charsPerPage = 600) {
  if (text.length <= charsPerPage) return [text];
  const pages = [];
  let remaining = text;
  while (remaining.length > 0) {
    let cut = Math.min(remaining.length, charsPerPage);
    // Try to cut at paragraph break
    const parBreak = remaining.lastIndexOf('\n\n', cut);
    if (parBreak > cut * 0.4) cut = parBreak + 2;
    pages.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }
  return pages;
}

export function showLook(loc) {
  state.transition('look');

  const lookData = loc.look || loc.name;
  lookPages = paginateLook(lookData);
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
  const ind = document.getElementById('look-page');

  lt.textContent = activeLoc ? activeLoc.name : '';
  lb.textContent = lookPages[lookPageIdx] || '';

  if (ind) {
    if (lookPages.length > 1) {
      const isLast = lookPageIdx >= lookPages.length - 1;
      ind.textContent = (lookPageIdx + 1) + ' / ' + lookPages.length + (isLast ? '  ✕' : '  →');
      ind.style.display = 'block';
    } else {
      ind.style.display = 'none';
    }
  }
}

export function advanceOrCloseLook() {
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
  // The #dpc canvas is 80×100; an Higgsfield 1024×1280 painting drawn
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
    if ((e.key === ' ' || e.key === 'Enter') && state.is('look')) {
      advanceOrCloseLook();
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
