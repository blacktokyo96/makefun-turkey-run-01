// Boot and frame loop for Wishbone Getaway: ?shot=NAME stages a scene, draws 4 frames, then sets __shotReady.
import { Game } from './core/game-state.js';
import { applyShot } from './shots/shot-director.js';
const viewport = document.getElementById('viewport');
const hudCanvas = document.getElementById('hud');
const game = new Game(viewport, hudCanvas);
window.__game = game;
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  game.frame(dt);
  if (!shot) requestAnimationFrame(frame);
}
if (shot) {
  const ok = applyShot(game, shot);
  // Draw 4 frames, then signal readiness. Frozen scenes do not advance the sim.
  for (let i = 0; i < 4; i++) game.frame(0.016);
  window.__shotReady = !!ok;
} else {
  requestAnimationFrame(frame);
}
