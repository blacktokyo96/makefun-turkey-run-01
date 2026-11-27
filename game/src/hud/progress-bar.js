// Route bar for Wishbone Getaway: three stage segments, finish flag, turkey and farmer markers.
import { TRACK, STAGES, PALETTE } from '../core/config.js';
import { panel, text, drawTurkeyIcon, drawFarmerIcon, drawFlag } from './draw-kit.js';
const SEG_COLORS = ['#7d8f3e', '#a8322d', '#b24a2f'];
export function drawRouteBar(ctx, s, x, y, w) {
  const h = 26;
  const cur = s.stageIndex;
  panel(ctx, x - 8, y - 30, w + 16, h + 66, 12);
  for (let i = 0; i < 3; i++) {
    const sx = x + (w * i) / 3, sw = w / 3;
    ctx.fillStyle = SEG_COLORS[i];
    ctx.globalAlpha = i === cur ? 1 : 0.55;
    ctx.beginPath(); ctx.roundRect(sx + 1, y, sw - 2, h, 5); ctx.fill();
    ctx.globalAlpha = 1;
    text(ctx, (i + 1) + ' · ' + STAGES[i].name, sx + sw / 2, y + h / 2 + 1, 11, i === cur ? '#ffd700' : '#ffeec2', 'center');
  }
  // Marker track below the segments, so the icons never cover the stage labels.
  const my = y + h + 12;
  ctx.strokeStyle = 'rgba(255,238,194,0.4)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, my); ctx.lineTo(x + w, my); ctx.stroke();
  const fx = x + (Math.max(0, Math.min(TRACK.finishX, s.farmerX)) / TRACK.finishX) * w;
  const tx = x + (Math.max(0, Math.min(TRACK.finishX, s.turkeyX)) / TRACK.finishX) * w;
  ctx.fillStyle = 'rgba(226,59,46,0.45)'; ctx.fillRect(Math.min(fx, tx), my - 5, Math.abs(tx - fx), 10);
  drawFarmerIcon(ctx, fx, my, 22);
  drawTurkeyIcon(ctx, tx, my, 22);
  drawFlag(ctx, x + w + 4, y + h / 2, 12);
  text(ctx, 'STAGE ' + (cur + 1) + '/3', x, y + h + 30, 13, PALETTE.gold, 'left');
  const toDoor = Math.max(0, Math.ceil(TRACK.finishX - s.turkeyX));
  text(ctx, toDoor + ' m to the back door', x + w, y + h + 30, 13, PALETTE.cream, 'right');
  // Stage subtitle: hidden on the results screen, where the results panel covers it.
  if (s.state !== 'end') text(ctx, 'STAGE ' + (cur + 1) + ' · ' + STAGES[cur].name, x + w / 2, y + h + 48, 12, '#ffb060', 'center');
}
