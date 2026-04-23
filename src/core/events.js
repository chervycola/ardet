// ═══════════════════════════════════════
// EVENT BUS — pub/sub for decoupled game logic
// ═══════════════════════════════════════

class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const list = this.listeners[event];
    if (!list) return;
    const idx = list.indexOf(handler);
    if (idx > -1) list.splice(idx, 1);
  }

  once(event, handler) {
    const unsubscribe = this.on(event, (...args) => {
      unsubscribe();
      handler(...args);
    });
    return unsubscribe;
  }

  emit(event, ...args) {
    const list = this.listeners[event];
    if (!list) return;
    for (const handler of list) {
      try { handler(...args); }
      catch (e) { console.error(`[events] handler error for "${event}":`, e); }
    }
  }
}

export const events = new EventBus();

// Event name constants — prevents typos
export const E = {
  PLAYER_MOVE: 'player.move',
  PLAYER_INTERACT: 'player.interact',
  LOCATION_VISIT: 'location.visit',
  LOCATION_LOOK: 'location.look',
  LORE_COLLECT: 'lore.collect',
  NPC_TALK: 'npc.talk',
  OBSERVER_MET: 'observer.met',
  ACHIEVEMENT: 'achievement.unlock',
  SAVE: 'game.save',
  LOAD: 'game.load',
  STATE_CHANGE: 'state.change',
};
