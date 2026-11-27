// Title, results, pause and toast screens for Wishbone Getaway: drawn on the HUD canvas.
import { TITLE, TAGLINE, STAGES, CONTROLS_HELP, PALETTE } from '../core/config.js';
import { panel, text, outlineText, keycap } from './draw-kit.js';
import { formatInt, formatTime } from '../core/math-utils.js';
export function drawTitle(ctx, s, W, H, time) {
  const grad = ctx.createLinearGradient(0, 0, W * 0.55, 0);
  grad.addColorStop(0, 'rgba(30,14,4,0.88)'); grad.addColorStop(1, 'rgba(30,14,4,0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W * 0.55, H);
  outlineText(ctx, 'WISHBONE', 40, 100, 76, PALETTE.gold, 'left');
  outlineText(ctx, 'GETAWAY', 40, 172, 76, '#ff7a1a', 'left');
  text(ctx, TAGLINE, 42, 216, 16, PALETTE.cream, 'left', 'normal', 'italic Georgia, serif');
  // Menu rows: the first is a giant START, the rest compact chips. Keep these
  // exact y/h values: handleClicks in game-state.js hit-tests the same rows.
  const rows = [
    { k: '1', title: 'START THE ESCAPE', sub: 'Pumpkin Patch → Red Barn → Kitchen → Woods', sel: s.menuSel === 0, y: 250, h: 68, size: 24 },
    { k: '2', title: 'PRACTICE: RED BARN', sub: 'Start at the barn door, x 400', sel: s.menuSel === 1, y: 330, h: 52, size: 17 },
    { k: '3', title: 'PRACTICE: GRIMSBY KITCHEN', sub: 'Start at the kitchen door, x 800', sel: s.menuSel === 2, y: 392, h: 52, size: 17 },
    { k: '4', title: 'SOUND: ' + (s.sound ? 'ON' : 'OFF'), sub: 'Banjo plucks + gobbles', sel: s.menuSel === 3, y: 454, h: 52, size: 17 },
  ];
  rows.forEach((it) => {
    ctx.fillStyle = it.sel ? 'rgba(240,160,32,0.28)' : 'rgba(42,21,9,0.7)';
    ctx.strokeStyle = it.sel ? PALETTE.gold : 'rgba(240,160,32,0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(40, it.y, 380, it.h, 10); ctx.fill(); ctx.stroke();
    text(ctx, it.k + '  ' + it.title, 56, it.y + it.h / 2 - 10, it.size, it.sel ? '#ffd700' : PALETTE.cream);
    text(ctx, it.sub, 56, it.y + it.h / 2 + 12, 12, '#d9c8a0');
  });
  // Controls: one line, not a paragraph block.
  panel(ctx, 40, 518, 380, 72, 12);
  text(ctx, 'W/S dodge · SPACE jump · SHIFT dash · E hide', 56, 538, 12, PALETTE.cream);
  text(ctx, 'CLICK decoy · P pause · R retry · ESC title', 56, 558, 12, PALETTE.cream);
  text(ctx, 'ENTER or CLICK to run for your life', 56, 578, 12, '#ffd700');
  // Route card: short one-line chips, plus the woods as a 4th chip.
  panel(ctx, W - 340, 60, 300, 292, 14);
  text(ctx, 'THE ROUTE', W - 320, 84, 16, PALETTE.gold);
  STAGES.forEach((st, i) => {
    text(ctx, (i + 1) + ' · ' + st.name, W - 320, 118 + i * 52, 15, PALETTE.cream);
    text(ctx, st.blurb, W - 320, 136 + i * 52, 12, '#d9c8a0');
  });
  text(ctx, '4 · WHISPERING WOODS', W - 320, 274, 15, '#7ec850');
  text(ctx, 'Freedom past the back door', W - 320, 292, 12, '#d9c8a0');
  text(ctx, 'Best ' + formatInt(s.best) + ' · Escapes ' + s.escapes + ' · Runs ' + s.runs, W - 320, 324, 13, PALETTE.cream);
}
export function drawResults(ctx, s, W, H) {
  panel(ctx, W - 500, 80, 460, 500, 16);
  const esc = s.endKind === 'escaped';
  text(ctx, esc ? 'ESCAPED!' : 'CAUGHT!', W - 270, 130, 54, esc ? '#7ec850' : '#e23b2e', 'center');
  text(ctx, s.endLine, W - 270, 168, 14, PALETTE.cream, 'center', 'normal', 'italic Georgia, serif');
  text(ctx, 'Run ' + formatTime(s.runTime) + ' · ' + s.stageName, W - 270, 194, 13, '#ffb060', 'center');
  let y = 226;
  for (const row of s.tallyRows || []) {
    text(ctx, row.label, W - 470, y, 14, PALETTE.cream);
    text(ctx, row.value || '', W - 320, y, 14, PALETTE.cream, 'right');
    text(ctx, '+' + formatInt(row.pts), W - 90, y, 14, PALETTE.gold, 'right');
    y += 24;
  }
  ctx.strokeStyle = 'rgba(240,160,32,0.5)'; ctx.beginPath(); ctx.moveTo(W - 470, y + 4); ctx.lineTo(W - 90, y + 4); ctx.stroke();
  text(ctx, 'TOTAL', W - 470, y + 26, 18, PALETTE.cream);
  text(ctx, formatInt(s.totalScore), W - 90, y + 26, 22, PALETTE.gold, 'right');
  text(ctx, 'RANK: ' + s.rank, W - 270, y + 54, 17, '#ffd700', 'center');
  if (s.newBest) text(ctx, '★ NEW BEST! ★', W - 270, y + 80, 16, '#ffd700', 'center');
  keycap(ctx, 'R', W - 400, y + 112, 44, 40, 22); text(ctx, 'RUN AGAIN', W - 348, y + 112, 22, '#ffd700');
  text(ctx, 'CLICK restart · ESC title', W - 270, y + 148, 15, PALETTE.cream, 'center');
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
