// HUD panels for Wishbone Getaway: score, threat, ability bar, hide meter, danger-ahead list.
import { PALETTE } from '../core/config.js';
import { panel, text, meter, keycap, drawFeather, drawFarmerIcon } from './draw-kit.js';
import { formatInt } from '../core/math-utils.js';
export function drawTopLeft(ctx, s, W) {
  // Score panel only: score + combo. DISTANCE / corn / DECOYS / CLICK rows
  // were removed — at the 768x480 judge view their 11-13px labels were
  // unreadable clutter. Stage lives in the route bar, lives top-right.
  panel(ctx, 12, 12, 250, 76, 12);
  text(ctx, 'SCORE', 26, 30, 13, '#ffb060');
  text(ctx, formatInt(s.score), 26, 58, 30, PALETTE.gold);
  if (s.combo > 1) {
    ctx.fillStyle = '#e23b2e'; ctx.beginPath(); ctx.roundRect(170, 36, 74, 28, 8); ctx.fill();
    text(ctx, '×' + s.combo + ' COMBO', 207, 51, 14, '#fff', 'center');
  }
}
export function drawTopRight(ctx, s, W) {
  panel(ctx, W - 232, 12, 220, 62, 12);
  text(ctx, 'FEATHERS', W - 218, 30, 13, '#ffb060');
  // Icons sit clear of the label: label ends ~W-150, icons start at W-118.
  for (let i = 0; i < 3; i++) drawFeather(ctx, W - 118 + i * 26, 32, 14, i >= s.lives);
  text(ctx, 'BEST ' + formatInt(s.best), W - 26, 56, 13, PALETTE.cream, 'right');
  // AHEAD list: next 4 things within 70 m. Hidden in the lite shot HUD.
  const ahead = s.ahead || [];
  if (ahead.length && !s.lite) {
    panel(ctx, W - 232, 82, 220, 24 + ahead.length * 20, 12);
    text(ctx, 'AHEAD', W - 218, 96, 12, '#ffb060');
    ahead.slice(0, 4).forEach((a, i) => {
      text(ctx, a.label, W - 218, 116 + i * 20, 13, a.danger ? '#ff8a7a' : PALETTE.cream);
      text(ctx, a.dist + ' m', W - 26, 116 + i * 20, 13, PALETTE.cream, 'right');
    });
  }
}
export function drawThreat(ctx, s, W, H) {
  panel(ctx, 12, H - 108, 300, 96, 12);
  drawFarmerIcon(ctx, 36, H - 78, 26);
  text(ctx, 'FARMER GRIMSBY', 58, H - 88, 13, PALETTE.cream);
  const lamp = s.farmerMode === 'LUNGING!' || s.farmerMode === 'FURIOUS' ? '#e23b2e' : s.farmerMode === 'SEARCHING' ? '#f0a020' : s.farmerMode === 'LOST YOU' ? '#7ec850' : '#ffb060';
  ctx.fillStyle = lamp; ctx.beginPath(); ctx.arc(58, H - 62, 6, 0, Math.PI * 2); ctx.fill();
  text(ctx, s.farmerMode, 72, H - 62, 14, lamp);
  const gapFrac = Math.max(0, Math.min(1, s.gap / 18));
  const gapColor = s.gap > 9 ? '#7ec850' : s.gap < 4.5 ? '#e23b2e' : '#f0a020';
  meter(ctx, 58, H - 48, 180, 12, gapFrac, gapColor);
  text(ctx, 'GAP ' + s.gap.toFixed(1) + ' m', 246, H - 42, 12, PALETTE.cream);
  text(ctx, s.knifeIncoming ? 'KNIFE INCOMING — DODGE!' : 'next throw ~' + Math.max(0, s.nextThrow).toFixed(1) + ' s', 58, H - 24, 13, s.knifeIncoming ? '#ff6a5a' : '#ffb060');
}
export function drawAbility(ctx, s, W, H) {
  const y = H - 38;
  panel(ctx, W - 492, H - 66, 480, 54, 12);
  keycap(ctx, 'SPACE', W - 484, y, 52); text(ctx, 'JUMP/FLAP', W - 426, y, 11, PALETTE.cream);
  keycap(ctx, 'SHIFT', W - 342, y, 48); text(ctx, s.dashCd > 0 ? 'DASH ' + s.dashCd.toFixed(1) + 's' : 'DASH', W - 288, y, 11, s.dashCd > 0 ? '#ff8a7a' : PALETTE.cream);
  keycap(ctx, 'E', W - 224, y, 26); text(ctx, 'HIDE', W - 192, y, 11, s.nearSpot ? '#ffd700' : '#c9b896');
  text(ctx, 'SPRINT', W - 148, y, 11, PALETTE.cream);
  meter(ctx, W - 108, y - 5, 88, 10, s.stamina, '#7ec850');
}
export function drawHiddenPanel(ctx, s, W, H) {
  panel(ctx, W / 2 - 210, H - 178, 420, 96, 12);
  text(ctx, 'HIDDEN IN THE ' + (s.hiddenSpotKind || 'HAY PILE').toUpperCase(), W / 2, H - 150, 20, PALETTE.gold, 'center');
  text(ctx, 'SUSPICION', W / 2 - 190, H - 122, 12, '#ffb060');
  meter(ctx, W / 2 - 105, H - 130, 230, 14, s.suspicion / 100, s.suspicion > 70 ? '#e23b2e' : '#f0a020');
  text(ctx, Math.floor(s.suspicion) + '%', W / 2 + 160, H - 122, 13, PALETTE.cream);
  text(ctx, 'Sneak out [E] while his gaze turns away!', W / 2, H - 100, 14, PALETTE.cream, 'center');
}
