// Keyboard and mouse input for Wishbone Getaway: held keys, one-shot presses, clicks.
export class Input {
  constructor() {
    this.keys = new Set();
    this.pressQueue = [];
    this.clicks = [];
    this.enabled = true;
    this._down = (e) => {
      if (!this.enabled) return;
      const c = e.code;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(c)) e.preventDefault();
      if (!e.repeat) this.pressQueue.push(c);
      this.keys.add(c);
    };
    this._up = (e) => this.keys.delete(e.code);
    this._blur = () => { this.keys.clear(); };
    this._click = (e) => {
      if (!this.enabled) return;
      const r = e.target.getBoundingClientRect ? e.target.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      this.clicks.push({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height, ndcX: ((e.clientX - r.left) / r.width) * 2 - 1, ndcY: -(((e.clientY - r.top) / r.height) * 2 - 1) });
    };
    window.addEventListener('keydown', this._down);
    window.addEventListener('keyup', this._up);
    window.addEventListener('blur', this._blur);
    window.addEventListener('mousedown', this._click);
  }
  isDown(...codes) { return codes.some((c) => this.keys.has(c)); }
  pressed(code) { const i = this.pressQueue.indexOf(code); if (i >= 0) { this.pressQueue.splice(i, 1); return true; } return false; }
  takeClicks() { const c = this.clicks; this.clicks = []; return c; }
  clearPresses() { this.pressQueue.length = 0; this.clicks.length = 0; }
  axes() {
    const across = (this.isDown('KeyW', 'ArrowUp') ? 1 : 0) - (this.isDown('KeyS', 'ArrowDown') ? 1 : 0);
    const sprint = this.isDown('KeyD', 'ArrowRight');
    const ease = this.isDown('KeyA', 'ArrowLeft');
    return { across, sprint, ease };
  }
}
