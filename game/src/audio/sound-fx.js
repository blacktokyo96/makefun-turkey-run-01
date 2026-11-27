// Synthesized sound effects for Wishbone Getaway: Web Audio, no files, unlocked on first input.
export class SoundFX {
  constructor() { this.ctx = null; this.master = null; this.enabled = true; this.gestured = false; }
  markGesture() { this.gestured = true; }
  unlock() {
    if (!this.gestured) return; // never create an AudioContext without a user gesture (avoids autoplay warnings in shots)
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.35; this.master.connect(this.ctx.destination);
    } catch { this.ctx = null; }
  }
  tone(freq, dur, type = 'sine', vol = 0.3, slide = 0, delay = 0) {
    if (!this.ctx || !this.enabled) return;
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(this.master); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  noise(dur, vol = 0.3, freq = 1200, delay = 0) {
    if (!this.ctx || !this.enabled) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
    const g = this.ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(this.master); src.start(t0);
  }
  gobble() { for (let i = 0; i < 5; i++) this.tone(320 - i * 45, 0.09, 'sawtooth', 0.22, -60, i * 0.07); }
  jump() { this.tone(300, 0.16, 'sine', 0.25, 320); }
  flap() { this.noise(0.12, 0.2, 900); }
  dash() { this.noise(0.25, 0.3, 600); this.gobble(); }
  corn() { this.tone(880, 0.1, 'sine', 0.25); this.tone(1320, 0.12, 'sine', 0.2, 0, 0.07); }
  pie() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.15, 'triangle', 0.25, 0, i * 0.08)); }
  wishbone() { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.25, 0, i * 0.07)); }
  bump() { this.tone(120, 0.18, 'sine', 0.4, -40); this.noise(0.1, 0.2, 300); }
  hurt() { this.tone(700, 0.3, 'sawtooth', 0.3, -500); this.noise(0.2, 0.25, 2000); }
  knifeWarn() { this.tone(1800, 0.06, 'square', 0.15); this.tone(1800, 0.06, 'square', 0.15, 0, 0.12); }
  knifeSwish() { this.noise(0.25, 0.3, 2500); }
  ovenWarn() { this.tone(180, 0.5, 'sawtooth', 0.12, 60); }
  ovenRoar() { this.noise(0.8, 0.35, 500); this.tone(90, 0.7, 'sawtooth', 0.2, 40); }
  hide() { this.noise(0.3, 0.2, 1400); }
  sneak() { [659, 784, 988].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.22, 0, i * 0.06)); }
  spotted() { this.tone(1100, 0.12, 'square', 0.25); this.tone(900, 0.2, 'square', 0.25, 0, 0.12); }
  grabbed() { this.tone(400, 0.4, 'sawtooth', 0.3, -250); }
  decoy() { this.tone(1200, 0.1, 'sine', 0.2, 600); this.tone(1500, 0.12, 'sine', 0.2, 400, 0.1); }
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.3, 0, i * 0.12)); }
  escapeFanfare() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.3, 0, i * 0.13)); this.gobble(); }
  caughtSting() { [392, 370, 349, 311].forEach((f, i) => this.tone(f, 0.4, 'sawtooth', 0.22, 0, i * 0.2)); }
  shave() { this.noise(0.15, 0.25, 3000); this.tone(1500, 0.08, 'sine', 0.2); }
}
