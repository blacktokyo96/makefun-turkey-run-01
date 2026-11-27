// 2D HUD drawing helpers for Wishbone Getaway: panels, text, meters, keycaps, icons.
import { PALETTE } from '../core/config.js';
export function panel(ctx, x, y, w, h, r = 10) {
  ctx.fillStyle = PALETTE.panel; ctx.strokeStyle = PALETTE.panelBorder; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke();
}
export function text(ctx, s, x, y, size = 16, color = PALETTE.cream, align = 'left', weight = 'bold', font = 'Georgia, serif') {
  ctx.font = weight + ' ' + size + 'px ' + font;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
export function outlineText(ctx, s, x, y, size, color, align = 'center') {
  ctx.font = 'bold ' + size + 'px Georgia, serif';
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(42,21,9,0.9)'; ctx.strokeText(s, x, y);
  ctx.fillStyle = color; ctx.fillText(s, x, y);
}
export function meter(ctx, x, y, w, h, frac, color, bg = 'rgba(0,0,0,0.5)') {
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  if (frac > 0) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w * Math.max(0, Math.min(1, frac)), h, h / 2); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,238,194,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.stroke();
}
export function keycap(ctx, label, x, y, w = 34, h = 26) {
  ctx.fillStyle = '#f2e4c8'; ctx.strokeStyle = '#8a5a30'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y - h / 2, w, h, 6); ctx.fill(); ctx.stroke();
  text(ctx, label, x + w / 2, y + 1, 13, '#5a2d0c', 'center', 'bold', 'monospace');
}
export function drawFeather(ctx, x, y, s, lost = false) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5);
  ctx.fillStyle = lost ? '#777777' : '#e3b84f';
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.32, s * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = lost ? '#555' : '#a8322d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -s * 0.55); ctx.lineTo(0, s * 0.6); ctx.stroke();
  ctx.restore();
}
export function drawCorn(ctx, x, y, s) {
  ctx.fillStyle = '#f0d020'; ctx.beginPath(); ctx.ellipse(x, y, s * 0.55, s * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b9a2e'; ctx.beginPath(); ctx.ellipse(x - s * 0.4, y, s * 0.25, s * 0.18, -0.5, 0, Math.PI * 2); ctx.fill();
}
export function drawKnifeIcon(ctx, x, y, s, color = '#d8dde2') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6);
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-s, -s * 0.18); ctx.lineTo(s * 0.7, -s * 0.12); ctx.lineTo(s, 0); ctx.lineTo(s * 0.7, s * 0.12); ctx.lineTo(-s, s * 0.18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a2a1a'; ctx.fillRect(-s * 1.5, -s * 0.15, s * 0.5, s * 0.3);
  ctx.restore();
}
export function drawTurkeyIcon(ctx, x, y, s) {
  ctx.fillStyle = '#5a3a1e'; ctx.beginPath(); ctx.arc(x, y, s * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a8a9a'; ctx.beginPath(); ctx.arc(x + s * 0.35, y - s * 0.35, s * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f0a020'; ctx.beginPath(); ctx.moveTo(x + s * 0.55, y - s * 0.4); ctx.lineTo(x + s * 0.85, y - s * 0.3); ctx.lineTo(x + s * 0.55, y - s * 0.2); ctx.fill();
}
export function drawFarmerIcon(ctx, x, y, s) {
  ctx.fillStyle = '#e8b88a'; ctx.beginPath(); ctx.arc(x, y, s * 0.45, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e3b84f'; ctx.beginPath(); ctx.ellipse(x, y - s * 0.35, s * 0.6, s * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a8322d'; ctx.fillRect(x - s * 0.3, y - s * 0.35, s * 0.6, s * 0.12);
  ctx.fillStyle = '#6b4423'; ctx.beginPath(); ctx.arc(x, y + s * 0.25, s * 0.3, 0, Math.PI); ctx.fill();
}
export function drawFlag(ctx, x, y, s) {
  ctx.strokeStyle = '#5a2d0c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.9, y - s * 0.6); ctx.lineTo(x, y - s * 0.2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillRect(x + s * 0.15, y - s * 0.85, s * 0.2, s * 0.2); ctx.fillRect(x + s * 0.45, y - s * 0.55, s * 0.2, s * 0.2);
}
