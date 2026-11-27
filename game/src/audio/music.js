// Banjo-style looping pluck tune for Wishbone Getaway: 4 bars in G, tempo rises each stage.
export class Music {
  constructor(sfx) { this.sfx = sfx; this.on = true; this.stage = 0; this.nextNote = 0; this.step = 0; this.menu = true; }
  // G major pentatonic-ish pluck line, 4 bars of 8 eighth notes.
  static NOTES = [392, 440, 494, 587, 494, 440, 392, 330, 392, 494, 587, 659, 587, 494, 440, 392, 392, 440, 494, 587, 659, 587, 494, 440, 587, 494, 440, 392, 330, 392, 294, 392];
  tempo() { return (this.menu ? 100 : 118 + this.stage * 14); }
  update(dt, time) {
    if (!this.on || !this.sfx.ctx || !this.sfx.enabled) return;
    const beat = 60 / this.tempo() / 2; // eighth notes
    if (time < this.nextNote) return;
    this.nextNote = time + beat;
    const note = Music.NOTES[this.step % Music.NOTES.length];
    const root = 196; // G3
    this.sfx.tone(note, 0.22, 'triangle', this.menu ? 0.07 : 0.12);
    if (this.step % 8 === 0) this.sfx.tone(root, 0.4, 'sine', 0.1);
    this.step++;
  }
  setStage(i) { this.stage = i; }
  setMenu(m) { this.menu = m; }
}
