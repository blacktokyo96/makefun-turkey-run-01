// Painted canvas textures for Wishbone Getaway: grass, dirt, planks, tiles, wallpaper, signs.
import * as THREE from 'three';
import { mulberry32, range } from '../core/random.js';
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.anisotropy = 4;
  return t;
}
export function grassTexture() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#7d8f3e'; g.fillRect(0, 0, w, h);
    const rng = mulberry32(7);
    for (let i = 0; i < 900; i++) { g.fillStyle = ['#6b7f33', '#8fa04a', '#5d7030', '#a8b45e'][i % 4]; g.fillRect(rng() * w, rng() * h, 3, 6 + rng() * 6); }
  }, [24, 24]);
}
export function dirtTexture() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#a97c46'; g.fillRect(0, 0, w, h);
    const rng = mulberry32(11);
    for (let i = 0; i < 500; i++) { g.fillStyle = ['#96682f', '#bd9058', '#8a5f2c'][i % 3]; g.beginPath(); g.arc(rng() * w, rng() * h, 1 + rng() * 4, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(90,60,25,0.5)'; g.lineWidth = 3;
    for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(0, rng() * h); g.bezierCurveTo(80, rng() * h, 170, rng() * h, w, rng() * h); g.stroke(); }
  }, [10, 2]);
}
export function plankTexture(base = '#8a5a30') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) {
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, y, w, 3);
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, y + 3, w, 2);
      g.fillStyle = 'rgba(0,0,0,0.15)';
      for (let x = 0; x < w; x += 64) g.fillRect(x + ((y / 32) % 2) * 32, y + 6, 2, 20);
    }
  }, [8, 8]);
}
export function barnPlankTexture() { return plankTexture('#a8322d'); }
export function checkerTexture() {
  return canvasTex(256, 256, (g, w, h) => {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#b24a2f' : '#f2e4c8'; g.fillRect(x * 64, y * 64, 64, 64); }
    g.strokeStyle = 'rgba(0,0,0,0.2)'; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
  }, [16, 4]);
}
export function wallpaperTexture() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#e8c98a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d9a94f';
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.beginPath(); g.arc(x * 64 + 32, y * 64 + 32, 12, 0, 7); g.fill(); g.beginPath(); g.arc(x * 64 + 32, y * 64 + 32, 5, 0, 7); g.fillStyle = '#c98f2e'; g.fill(); g.fillStyle = '#d9a94f'; }
    g.fillStyle = '#8a5a30'; g.fillRect(0, h - 24, w, 24);
  }, [12, 2]);
}
export function signTexture(lines, opts = {}) {
  const bg = opts.bg || '#f2e4c8', fg = opts.fg || '#5a2d0c';
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    const n = lines.length;
    lines.forEach((line, i) => {
      // Shrink the font until the line fits inside the border: long lines
      // (e.g. FARMHOUSE KITCHEN) used to be clipped at both edges.
      let size = i === 0 ? 54 : 34;
      g.font = 'bold ' + size + 'px Georgia, serif';
      while (size > 12 && g.measureText(line).width > w - 48) { size -= 2; g.font = 'bold ' + size + 'px Georgia, serif'; }
      g.fillText(line, w / 2, h * (i + 0.5) / n);
    });
  });
}
export function plaidTexture() {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#a8322d'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < w; i += 32) { g.fillRect(i, 0, 8, h); g.fillRect(0, i, w, 8); }
    g.fillStyle = 'rgba(40,20,10,0.4)';
    for (let i = 16; i < w; i += 32) { g.fillRect(i, 0, 4, h); g.fillRect(0, i, w, 4); }
  }, [2, 2]);
}
