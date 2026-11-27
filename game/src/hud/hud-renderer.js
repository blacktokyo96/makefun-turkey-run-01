// HUD layout for Wishbone Getaway: lays every panel out in a 640-unit-high logical space.
import { drawTopLeft, drawTopRight, drawThreat, drawAbility, drawHiddenPanel } from './hud-panels.js';
import { drawRouteBar } from './progress-bar.js';
import { drawWorldLabels } from './world-labels.js';
import { drawTitle, drawResults, drawPause, drawToasts } from './screens.js';
export class HudRenderer {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); }
  resize(w, h, dpr) {
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w; this.H = h;
  }
  render(s, camera, time) {
    const ctx = this.ctx, W = this.W, H = this.H;
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    const scale = H / 640;
    ctx.save();
    // Logical space: 640 high, width = aspect * 640. Scale drawing so panels keep their size on any window.
    const lw = W / scale;
    ctx.scale(scale, scale);
    const S = { ...s, W: lw, H: 640 };
    if (s.state === 'title') { drawTitle(ctx, S, lw, 640, time); drawToasts(ctx, S, lw, 640); ctx.restore(); return; }
    // End screen: the results panel is the whole HUD. The in-run panels
    // (score, route bar, threat, ability bar) used to leak through behind it.
    if (s.state === 'end') { drawResults(ctx, S, lw, 640); ctx.restore(); return; }
    // In-run HUD.
    drawTopLeft(ctx, S, lw);
    drawTopRight(ctx, S, lw);
    drawRouteBar(ctx, S, lw / 2 - 190, 16, 380);
    drawThreat(ctx, S, lw, 640);
    if (!s.lite) drawAbility(ctx, S, lw, 640);
    if (s.hidden) drawHiddenPanel(ctx, S, lw, 640);
    drawWorldLabels(ctx, S, camera, lw, 640);
    drawToasts(ctx, S, lw, 640);
    if (s.state === 'paused') drawPause(ctx, S, lw, 640);
    ctx.restore();
  }
}
