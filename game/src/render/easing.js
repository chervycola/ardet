// ═══════════════════════════════════════
// EASING — animation timing functions
// ═══════════════════════════════════════

export function linear(t) { return t; }
export function easeInQuad(t) { return t * t; }
export function easeOutQuad(t) { return t * (2 - t); }
export function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
export function easeOutCubic(t) { return (--t) * t * t + 1; }
export function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; }
export function easeOutElastic(t) {
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}
export function easeOutBounce(t) {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
}

// Tween helper — call each frame, returns interpolated value
export class Tween {
  constructor(from, to, duration, easeFn = easeOutQuad) {
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.elapsed = 0;
    this.easeFn = easeFn;
    this.done = false;
  }

  update() {
    this.elapsed++;
    if (this.elapsed >= this.duration) {
      this.done = true;
      return this.to;
    }
    const t = this.elapsed / this.duration;
    return this.from + (this.to - this.from) * this.easeFn(t);
  }

  get value() {
    if (this.done) return this.to;
    const t = Math.min(1, this.elapsed / this.duration);
    return this.from + (this.to - this.from) * this.easeFn(t);
  }
}
