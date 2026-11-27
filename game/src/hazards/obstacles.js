// Static obstacle and rolling barrel collision for Wishbone Getaway.
import { TRACK } from '../core/config.js';
// Returns 'bump' | 'none'. Mutates turkey pos/vel on a front-face hit; overlapping obstacles let him through.
export function collideObstacles(turkey, layout, events) {
  if (turkey.hidden) return 'none';
  for (const p of layout.pieces) {
    if (p.type === 'mud' || p.type === 'gravy' || p.type === 'oven' || p.type === 'slider') continue;
    const dx = turkey.x - p.x;
    if (Math.abs(dx) > 1.6) continue;
    if (p.type === 'fence') {
      if (turkey.y > p.h) continue;
      const dz = Math.abs(turkey.z - p.z);
      if (dz < p.gap / 2) continue; // through the gap
      if (dx < 0 && dx > -1.0) { bump(turkey, p, events); return 'bump'; }
      continue;
    }
    const hw = (p.w || 1) / 2, hd = (p.d || 1) / 2;
    if (turkey.y > (p.h || 1)) continue;
    if (Math.abs(turkey.z - (p.z || 0)) > hd + turkey.radius) continue;
    if (p.type === 'barrel' && p.rolling) {
      if (dx < 0 && dx > -1.2) { // barrel pushed ahead, counts as a bump
        p.x = turkey.x + 1.0; bump(turkey, p, events, true); return 'bump';
      }
      continue;
    }
    if (dx < 0 && dx > -(hw + 0.6)) { bump(turkey, p, events); return 'bump'; }
    // already overlapping (landed late): let him through, never trap.
  }
  return 'none';
}
function bump(turkey, p, events, barrel = false) {
  turkey.x = p.x - ((p.w || 1) / 2) - (turkey.radius || 0.55) - 0.05;
  turkey.stun = 0.55;
  const edge = turkey.z >= (p.z || 0) ? 1 : -1;
  turkey.acrossVel = edge * 7;
  turkey.speed = Math.min(turkey.speed, 3);
  events.push({ type: 'bump', reason: barrel ? 'OOF! Tripped on a rolling barrel' : p.type === 'fence' ? 'OOF! Tripped on a fence' : p.type === 'pitchfork' ? 'OOF! Tripped on a pitchfork' : 'OOF! Bumped into a ' + p.type });
}
export function clampTrack(turkey) { turkey.z = Math.max(-TRACK.halfWidth, Math.min(TRACK.halfWidth, turkey.z)); }
