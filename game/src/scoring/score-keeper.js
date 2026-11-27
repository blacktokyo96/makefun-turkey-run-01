// Score, combo, pop-ups and end tally for Wishbone Getaway.
import { SCORING, rankFor } from '../core/config.js';
import { formatInt } from '../core/math-utils.js';
export class ScoreKeeper {
  constructor() { this.reset(); }
  reset() {
    this.score = 0; this.combo = 1; this.comboTimer = 0; this.comboIdle = 0;
    this.corn = 0; this.shaves = 0; this.sneaks = 0; this.wishbones = 0; this.pies = 0;
    this.distance = 0; this.popups = []; this.lastMetre = 0;
  }
  addDistance(x) {
    const m = Math.floor(x);
    if (m > this.lastMetre) { this.score += (m - this.lastMetre) * SCORING.perMetre; this.lastMetre = m; }
    this.distance = x;
  }
  event(kind, x, z) {
    const base = { corn: SCORING.corn, shave: SCORING.shave, sneak: SCORING.sneak, wishbone: SCORING.wishbone, pie: SCORING.pie }[kind] || 0;
    const pts = base * this.combo;
    this.score += pts;
    if (kind === 'corn') this.corn++;
    if (kind === 'shave') this.shaves++;
    if (kind === 'sneak') this.sneaks++;
    if (kind === 'wishbone') this.wishbones++;
    if (kind === 'pie') this.pies++;
    if (['shave', 'sneak', 'wishbone'].includes(kind)) { this.combo = Math.min(5, this.combo + 1); this.comboIdle = 0; }
    if (base > 0) this.popups.push({ text: '+' + formatInt(pts), x, z, life: 1.2, max: 1.2 });
    return pts;
  }
  update(dt) {
    this.comboIdle += dt;
    if (this.comboIdle > 4) { this.comboTimer += dt; if (this.comboTimer > 2) { this.combo = Math.max(1, this.combo - 1); this.comboTimer = 0; this.comboIdle = 0; } }
    for (const p of this.popups) p.life -= dt;
    this.popups = this.popups.filter((p) => p.life > 0);
  }
  tally(escaped, livesLeft, timeSec) {
    const rows = [
      { label: 'Distance', value: Math.floor(this.distance) + ' m', pts: Math.floor(this.distance) },
      { label: 'Corn pecked', value: String(this.corn), pts: this.corn * SCORING.corn },
      { label: 'Close shaves', value: String(this.shaves), pts: this.shaves * SCORING.shave },
      { label: 'Sneaky escapes', value: String(this.sneaks), pts: this.sneaks * SCORING.sneak },
      { label: 'Golden wishbones', value: String(this.wishbones), pts: this.wishbones * SCORING.wishbone },
    ];
    let total = this.score;
    if (escaped) {
      rows.push({ label: 'Escape bonus', value: '', pts: SCORING.escapeBonus });
      rows.push({ label: 'Feathers left', value: String(livesLeft), pts: livesLeft * SCORING.featherBonus });
      const tb = Math.max(0, Math.floor((SCORING.timePar - timeSec) * SCORING.timeBonusPerSec));
      rows.push({ label: 'Time bonus', value: '', pts: tb });
      total += SCORING.escapeBonus + livesLeft * SCORING.featherBonus + tb;
    }
    return { rows, total, rank: rankFor(total) };
  }
}
