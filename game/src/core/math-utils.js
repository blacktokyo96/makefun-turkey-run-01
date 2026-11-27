// Small math helpers for Wishbone Getaway: clamp, lerp, damp and time formatting.
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export function smoothstep(a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
export function damp(current, target, lambda, dt) { return lerp(current, target, 1 - Math.exp(-lambda * dt)); }
export function approach(v, target, maxDelta) { if (v < target) return Math.min(v + maxDelta, target); return Math.max(v - maxDelta, target); }
export function wrapAngle(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
export function formatTime(s) { const m = Math.floor(s / 60); const r = Math.floor(s % 60); return m + ':' + String(r).padStart(2, '0'); }
export function formatInt(n) { return Math.floor(n).toLocaleString('en-US'); }
