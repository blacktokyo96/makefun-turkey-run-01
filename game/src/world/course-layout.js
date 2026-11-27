// Pure seeded course layout for Wishbone Getaway: obstacles, zones, hazards, pickups, hiding spots.
import { mulberry32, range, intRange, chance } from '../core/random.js';
import { TRACK, STAGES } from '../core/config.js';
export function stageAt(x) { return x < 400 ? 0 : x < 800 ? 1 : 2; }
export function buildLayout(seed = 1) {
  const rng = mulberry32(seed);
  const pieces = []; const spots = []; const pickups = []; const ovens = []; const sliders = [];
  let nextSpot = 70;
  for (let s = 0; s < 3; s++) {
    const start = STAGES[s].from, end = STAGES[s].to;
    let x = start + 24;
    let pieAt = start + range(rng, 150, 250);
    let boneAt = start + range(rng, 280, 360);
    let pieDone = false, boneDone = false;
    while (x < end - 24) {
      if (x >= nextSpot) {
        const kind = s === 0 ? 'haystack' : s === 1 ? 'hay pile' : 'laundry basket';
        spots.push({ x, z: range(rng, -4, 4), kind, r: 1.7 });
        nextSpot = x + range(rng, 65, 90);
        x += range(rng, 9, 14); continue;
      }
      if (!pieDone && x >= pieAt) { pickups.push({ kind: 'pie', x, z: range(rng, -3, 3), y: 0.9 }); pieDone = true; }
      if (!boneDone && x >= boneAt) { pickups.push({ kind: 'wishbone', x, z: range(rng, -3, 3), y: 1.9 }); boneDone = true; }
      const step = range(rng, 9, 14) - s * 1.2;
      if (s === 0) {
        const roll = rng();
        if (roll < 0.3) {
          const gapZ = range(rng, -3, 3);
          pieces.push({ type: 'fence', x, z: gapZ, gap: 2.8, h: 0.85, w: 0.3, d: 12 });
          for (let i = -1; i <= 1; i++) pickups.push({ kind: 'corn', x: x + 1.2, z: gapZ + i * 0.9, y: 0.6 });
        } else if (roll < 0.55) {
          const n = intRange(rng, 2, 4);
          for (let i = 0; i < n; i++) pieces.push({ type: 'pumpkin', x: x + range(rng, -2, 2), z: range(rng, -4.5, 4.5), r: 0.5, h: 0.7, w: 1, d: 1 });
        } else if (roll < 0.75) {
          pieces.push({ type: 'mud', x, z: range(rng, -2, 2), rx: 2.5, rz: range(rng, 1.5, 3), h: 0.1, w: 5, d: 6 });
        } else {
          pieces.push({ type: 'trough', x, z: range(rng, -2, 2), h: 0.75, w: 1, d: 3.2 });
        }
      } else if (s === 1) {
        const roll = rng();
        if (roll < 0.4) {
          const n = intRange(rng, 1, 2);
          for (let i = 0; i < n; i++) pieces.push({ type: 'barrel', x: x + i * 3, z: range(rng, -4, 4), r: 0.6, h: 1.1, w: 1.2, d: 1.2, rolling: false, vx: 0 });
        } else if (roll < 0.7) {
          pieces.push({ type: 'crate', x, z: range(rng, -3.5, 3.5), h: 0.95, w: 1.1, d: 1.1 });
        } else {
          pieces.push({ type: 'pitchfork', x, z: 0, h: 0.35, w: 0.5, d: 4.5 });
        }
      } else {
        const roll = rng();
        if (roll < 0.35) {
          const long = chance(rng, 0.55);
          ovens.push({ x, z: -6.6, phase: range(rng, 0, 3.6), long, state: 'idle', t: range(rng, 0, 2), reach: long ? 3.6 : -0.5 });
          pieces.push({ type: 'oven', x, z: -6.6, h: 1.9, w: 2.2, d: 1.2, ovenIndex: ovens.length - 1 });
        } else if (roll < 0.6) {
          sliders.push({ x, z: 0, phase: range(rng, 0, 6.28), t: 0 });
          pieces.push({ type: 'slider', x, z: 0, h: 0.5, w: 0.6, d: 11.2, sliderIndex: sliders.length - 1 });
        } else if (roll < 0.8) {
          pieces.push({ type: 'gravy', x, z: range(rng, -2, 2), rx: 2.25, rz: range(rng, 1.5, 2.5), h: 0.1, w: 4.5, d: 5 });
        } else {
          const n = 2;
          for (let i = 0; i < n; i++) pieces.push({ type: 'pot', x: x + i * 1.4, z: range(rng, -4, 4), r: 0.55, h: 0.75, w: 1.1, d: 1.1 });
        }
      }
      // Corn lines / arcs beside pieces.
      if (chance(rng, 0.55)) {
        const cz = range(rng, -4, 4); const n = intRange(rng, 3, 5);
        for (let i = 0; i < n; i++) pickups.push({ kind: 'corn', x: x + 2 + i * 1.6, z: cz, y: 0.6 });
      } else if (chance(rng, 0.3)) {
        const cz = range(rng, -3, 3);
        for (let i = 0; i < 6; i++) pickups.push({ kind: 'corn', x: x + 1 + i * 1.1, z: cz, y: 0.6 + Math.sin((i / 5) * Math.PI) * 1.2 });
      }
      x += Math.max(8, step);
    }
  }
  return { pieces, spots, pickups, ovens, sliders, seed };
}
export function zoneAt(layout, x, z) {
  for (const p of layout.pieces) {
    if ((p.type === 'mud' || p.type === 'gravy') && Math.abs(x - p.x) < p.rx && Math.abs(z - p.z) < p.rz) return p.type;
  }
  return null;
}
export function nearestSpot(layout, x, z, maxDist = 2.6) {
  let best = null, bd = maxDist;
  for (const s of layout.spots) { const d = Math.hypot(x - s.x, z - s.z); if (d < bd) { bd = d; best = s; } }
  return best;
}
