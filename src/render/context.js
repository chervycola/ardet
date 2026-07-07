// ═══════════════════════════════════════
// ACTIVE CONTEXT — shared canvas context for drawing
// ═══════════════════════════════════════
// Set before each draw pass, read by sprite functions

export let X = null;

export function setCtx(ctx) { X = ctx; }
