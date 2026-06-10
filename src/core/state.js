// ═══════════════════════════════════════
// STATE MACHINE — formal game states
// ═══════════════════════════════════════

const STATES = ['entry', 'game', 'menu', 'look', 'dialogue', 'terminal', 'shop', 'ending'];

// Valid transitions (from → to)
const TRANSITIONS = {
  entry: ['game'],
  game: ['menu', 'look', 'dialogue', 'terminal', 'shop', 'ending'],
  menu: ['game', 'look', 'dialogue', 'terminal', 'shop'],
  look: ['game', 'menu'],
  dialogue: ['game'],
  terminal: ['game'],
  shop: ['game'],
  ending: ['game'],  // allow reset
};

class StateMachine {
  constructor() {
    this.current = 'entry';
    this.enterHooks = {};
    this.exitHooks = {};
  }

  is(s) { return this.current === s; }

  isIn(...states) { return states.includes(this.current); }

  transition(to) {
    if (!STATES.includes(to)) {
      console.warn(`[state] unknown state: ${to}`);
      return false;
    }
    const allowed = TRANSITIONS[this.current] || [];
    if (!allowed.includes(to) && to !== this.current) {
      console.warn(`[state] invalid transition ${this.current} → ${to}`);
      return false;
    }

    // Run exit hooks
    if (this.exitHooks[this.current]) this.exitHooks[this.current]();

    const prev = this.current;
    this.current = to;

    // Run enter hooks
    if (this.enterHooks[to]) this.enterHooks[to](prev);

    return true;
  }

  onEnter(state, fn) { this.enterHooks[state] = fn; }
  onExit(state, fn) { this.exitHooks[state] = fn; }
}

export const state = new StateMachine();
