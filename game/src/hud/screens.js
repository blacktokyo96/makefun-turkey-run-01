// Title, results, pause and toast screens for Wishbone Getaway: drawn on the HUD canvas.
import { TITLE, TAGLINE, STAGES, CONTROLS_HELP, PALETTE } from '../core/config.js';
import { panel, text, outlineText, keycap } from './draw-kit.js';
import { formatInt, formatTime } from '../core/math-utils.js';
export function drawTitle(ctx, s, W, H, time) {
  const grad = ctx.createLinearGradient(0, 0, W * 0.55, 0);
  grad.addColorStop(0, 'rgba(30,14,4,0.88)'); grad.addColorStop(1, 'rgba(30,14,4,0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W * 0.55, H);
  outlineText(ctx, 'WISHBONE', 40, 108, 64, PALETTE.gold, 'left');
  outlineText(ctx, 'GETAWAY', 40, 168, 64, '#ff7a1a', 'left');
  text(ctx, TAGLINE, 42, 208, 16, PALETTE.cream, 'left', 'normal', 'italic Georgia, serif');
  const items = [
    { k: '1', title: 'START THE ESCAPE', sub: 'Pumpkin Patch → Red Barn → Kitchen → Woods', sel: s.menuSel === 0 },
    { k: '2', title: 'PRACTICE: RED BARN', sub: 'Start at the barn door, x 400', sel: s.menuSel === 1 },
    { k: '3', title: 'PRACTICE: GRIMSBY KITCHEN', sub: 'Start at the kitchen door, x 800', sel: s.menuSel === 2 },
    { k: '4', title: 'SOUND: ' + (s.sound ? 'ON' : 'OFF'), sub: 'Banjo plucks + gobbles', sel: s.menuSel === 3 },
  ];
  items.forEach((it, i) => {
    const y = 250 + i * 62;
    ctx.fillStyle = it.sel ? 'rgba(240,160,32,0.28)' : 'rgba(42,21,9,0.7)';
    ctx.strokeStyle = it.sel ? PALETTE.gold : 'rgba(240,160,32,0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(40, y, 380, 52, 10); ctx.fill(); ctx.stroke();
    text(ctx, it.k + '  ' + it.title, 56, y + 18, 17, it.sel ? '#ffd700' : PALETTE.cream);
    text(ctx, it.sub, 56, y + 38, 12, '#d9c8a0');
  });
  panel(ctx, 40, 502, 380, 112, 12);
  text(ctx, 'CONTROLS', 56, 520, 13, '#ffb060');
  const bits = CONTROLS_HELP.split(' · ');
  let line = '', ly = 542;
  for (const b of bits) {
    if ((line + ' · ' + b).length > 52 && line) { text(ctx, line, 56, ly, 12, PALETTE.cream); ly += 15; line = b; }
    else line = line ? line + ' · ' + b : b;
  }
  if (line) { text(ctx, line, 56, ly, 12, PALETTE.cream); ly += 15; }
  text(ctx, 'ENTER or CLICK to run for your life', 56, ly + 4, 12, '#ffd700');
  // Route card on the right.
  panel(ctx, W - 340, 60, 300, 330, 14);
  text(ctx, 'THE ROUTE', W - 320, 84, 16, PALETTE.gold);
  STAGES.forEach((st, i) => {
    text(ctx, (i + 1) + ' · ' + st.name, W - 320, 116 + i * 62, 15, PALETTE.cream);
    text(ctx, st.blurb, W - 320, 136 + i * 62, 12, '#d9c8a0');
  });
  text(ctx, '★ BACK DOOR → WHISPERING WOODS', W - 320, 316, 13, '#7ec850');
  text(ctx, 'Best ' + formatInt(s.best) + ' · Escapes ' + s.escapes + ' · Runs ' + s.runs, W - 320, 352, 13, PALETTE.cream);
  if (Math.floor(time * 1.4) % 2 === 0) text(ctx, 'ENTER or CLICK to run for your life', W / 2, H - 24, 18, '#ffd700', 'center');
}
export function drawResults(ctx, s, W, H) {
  panel(ctx, W - 460, 90, 420, 460, 16);
  const esc = s.endKind === 'escaped';
  text(ctx, esc ? 'ESCAPED!' : 'CAUGHT!', W - 250, 130, 40, esc ? '#7ec850' : '#e23b2e', 'center');
  text(ctx, s.endLine, W - 250, 162, 14, PALETTE.cream, 'center', 'normal', 'italic Georgia, serif');
  text(ctx, 'Run ' + formatTime(s.runTime) + ' · ' + s.stageName, W - 250, 188, 13, '#ffb060', 'center');
  let y = 218;
  for (const row of s.tallyRows || []) {
    text(ctx, row.label, W - 430, y, 14, PALETTE.cream);
    text(ctx, row.value || '', W - 300, y, 14, PALETTE.cream, 'right');
    text(ctx, '+' + formatInt(row.pts), W - 70, y, 14, PALETTE.gold, 'right');
    y += 26;
  }
  ctx.strokeStyle = 'rgba(240,160,32,0.5)'; ctx.beginPath(); ctx.moveTo(W - 430, y + 4); ctx.lineTo(W - 70, y + 4); ctx.stroke();
  text(ctx, 'TOTAL', W - 430, y + 30, 18, PALETTE.cream);
  text(ctx, formatInt(s.totalScore), W - 70, y + 30, 22, PALETTE.gold, 'right');
  text(ctx, 'RANK: ' + s.rank, W - 250, y + 62, 17, '#ffd700', 'center');
  if (s.newBest) text(ctx, '★ NEW BEST! ★', W - 250, y + 88, 16, '#ffd700', 'center');
  keycap(ctx, 'R', W - 360, y + 118, 30); text(ctx, 'run again', W - 322, y + 118, 13, PALETTE.cream);
  text(ctx, 'CLICK restart · ESC title', W - 250, y + 142, 13, PALETTE.cream, 'center');
}
export function drawPause(ctx, s, W, H) {
  ctx.fillStyle = 'rgba(20,10,2,0.55)'; ctx.fillRect(0, 0, W, H);
  outlineText(ctx, 'PAUSED', W / 2, H / 2 - 20, 48, PALETTE.gold);
  text(ctx, 'P resume · R retry · ESC title', W / 2, H / 2 + 30, 16, PALETTE.cream, 'center');
}
export function drawToasts(ctx, s, W, H) {
  s.toasts.forEach((t, i) => {
    const a = Math.min(1, t.life / 0.4);
    ctx.globalAlpha = a;
    outlineText(ctx, t.text, W / 2, 150 + i * 44, t.big ? 34 : 26, t.color || '#ffd700');
    ctx.globalAlpha = 1;
  });
}
