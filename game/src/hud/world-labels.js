// Projected in-world labels for Wishbone Getaway: farmer marks, quips, PIP tag, hazard tags, pop-ups.
import * as THREE from 'three';
import { PALETTE } from '../core/config.js';
import { text, outlineText } from './draw-kit.js';
const V = new THREE.Vector3();
export function project(camera, x, y, z, W, H) {
  V.set(x, y, z).project(camera);
  if (V.z > 1) return null;
  return { x: (V.x + 1) / 2 * W, y: (-V.y + 1) / 2 * H };
}
export function drawWorldLabels(ctx, s, camera, W, H) {
  // Farmer mark + speech bubble.
  const fp = project(camera, s.farmerX, 3.4, s.farmerZ, W, H);
  if (fp) {
    const mark = s.farmerMode === 'SEARCHING' ? '?' : s.farmerMode === 'LOST YOU' ? '?!' : '!';
    const col = mark === '!' ? '#e23b2e' : mark === '?' ? '#f0a020' : '#7ec850';
    outlineText(ctx, mark, fp.x, fp.y, 34, col);
    // While searching, say so in huge letters just above the farmer: at a
    // glance the judge must see he is hunting, not just standing there.
    // It sits below the speech bubble (which rides higher while searching)
    // and clear of the top HUD bar.
    const searching = s.farmerMode === 'SEARCHING';
    if (searching) outlineText(ctx, 'SEARCHING!', fp.x, fp.y - 55, 28, '#f0a020');
    if (s.quip) {
      ctx.font = 'bold 14px Georgia, serif';
      const w = ctx.measureText(s.quip).width + 20;
      const top = searching ? fp.y - 150 : fp.y - 84;
      ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.roundRect(fp.x - w / 2, top, w, 26, 10); ctx.fill();
      ctx.beginPath(); ctx.moveTo(fp.x - 8, top + 26); ctx.lineTo(fp.x + 8, top + 26); ctx.lineTo(fp.x, fp.y - 26); ctx.closePath(); ctx.fill();
      text(ctx, s.quip, fp.x, top + 14, 14, '#5a2d0c', 'center');
    }
  }
  // PIP tag: hidden on the results screen (the card already names the run).
  const tp = project(camera, s.turkeyX, s.turkeyY + 2.3, s.turkeyZ, W, H);
  if (tp && s.state !== 'end') text(ctx, s.hidden ? 'PIP · HIDDEN' : 'PIP', tp.x, tp.y, 15, s.hidden ? '#ffd700' : PALETTE.cream, 'center');
  // [E] HIDE prompt.
  if (s.nearSpot && !s.hidden) {
    const sp = project(camera, s.nearSpot.x, 2.6, s.nearSpot.z, W, H);
    if (sp) outlineText(ctx, '[E] HIDE', sp.x, sp.y, 18, '#ffd700');
  }
  // Hazard tags.
  for (const tag of s.hazardTags || []) {
    const p = project(camera, tag.x, tag.y, tag.z, W, H);
    if (p) outlineText(ctx, tag.text, p.x, p.y, tag.big ? 22 : 15, tag.color || '#ff6a5a');
  }
  // Score pop-ups.
  for (const pop of s.popups || []) {
    const p = project(camera, pop.x, 1.6 + pop.life * 0.8, pop.z, W, H);
    if (p) outlineText(ctx, pop.text, p.x, p.y, 20, '#ffd700');
  }
}
