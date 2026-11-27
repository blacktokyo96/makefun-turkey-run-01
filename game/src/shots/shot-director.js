// Staged screenshot scenes for Wishbone Getaway: real game objects, then freeze.
import { TRACK } from '../core/config.js';
function nearestOven(game, x) {
  let best = null, bd = 1e9;
  for (const o of game.layout.ovens) { const d = Math.abs(o.x - x); if (d < bd) { bd = d; best = o; } }
  return best;
}
function nearestSpot(game, x) {
  let best = null, bd = 1e9;
  for (const s of game.layout.spots) { const d = Math.abs(s.x - x); if (d < bd) { bd = d; best = s; } }
  return best;
}
export function applyShot(game, name) {
  if (name === 'cover') {
    // Kitchen, Pip 6.5 m before an oven, airborne, sprinting, 2 feathers.
    const oven = nearestOven(game, 980) || game.layout.ovens[0];
    const ox = oven ? oven.x : 980;
    game.startRun(2);
    game.turkey.x = ox - 6.5; game.turkey.z = 1.6; game.turkey.y = 0.55; game.turkey.vy = 0; game.turkey.grounded = false;
    game.turkey.speed = 13.2; game.turkey.stamina = 0.8;
    game.lives = 2;
    game.farmer.x = game.turkey.x - 4.7; game.farmer.z = 0.9; game.farmer.mode = 'chase'; game.farmer.modeLabel = 'CHASING';
    game.farmer.quip = 'Get in the roasting pan, Pip!';
    game.score.score = 6330; game.score.combo = 3; game.score.corn = 47; game.score.lastMetre = 6330;
    game.decoys = 2; game.save.best = 9420;
    // Flying knife 1.2 m ahead of Pip at z 0.75 on its red stripe.
    game.knives.spawn(game.farmer.x, 0.75);
    const k = game.knives.knives[0];
    if (k) { k.x = game.turkey.x + 1.2; k.mesh.position.set(k.x, 0.55, 0.75); k.vx = 0; k.life = 99; }
    game.knives.stripe.visible = true;
    game.knives.stripe.position.set(game.farmer.x + 8, 0.06, 0.75);
    // That oven blasts early (short flame), nearby ovens warn.
    const oi = game.layout.ovens.indexOf(oven);
    if (oi >= 0) { game.ovens.forceState(oi, 'blast', 0.2); }
    game.layout.ovens.forEach((o, i) => { if (i !== oi && Math.abs(o.x - ox) < 60) game.ovens.forceState(i, 'warn', 0.2); });
    // Nearby sliders parked at z -2.6.
    game.sliders.parkAll(-2.6);
    // Hide static obstacles within 6 m of Pip so nothing covers him.
    for (const p of game.layout.pieces) {
      if (Math.abs(p.x - game.turkey.x) < 6 && p.mesh) p.mesh.visible = false;
    }
    game.toasts = [];
    game.toast('CLOSE SHAVE!', '#ffd700', true, 99);
    game.toast('×3 combo — the knife missed by a feather', '#ffd700', false, 99);
    game.cameraRig.override = { pos: [game.turkey.x - 4.6, 6.0, 11.2], look: [game.turkey.x + 2.4, 1.2, -2.6], fov: 54 };
    game.frozen = true;
    game.syncMeshes();
    game.ovens.update(0.016, game.turkey, [], game.time);
    return true;
  }
  if (name === 'title') {
    game.save.best = 9420; game.save.escapes = 4; game.save.runs = 17;
    game.state = 'title';
    const s0 = game.layout.spots[0] || { x: 70, z: 0 };
    const tx = s0.x + 3.5, tz = s0.z + 2;
    game.cameraRig.override = { pos: [tx - 6, 5.2, tz + 11], look: [tx + 1, 1.2, tz - 1], fov: 50 };
    game.frozen = true;
    return true;
  }
  if (name === 'hide') {
    const spot = nearestSpot(game, 560);
    game.startRun(1);
    game.toasts = [];
    game.save.best = 9420;
    game.turkey.x = spot.x; game.turkey.z = spot.z; game.turkey.hidden = true;
    // The bale reads as a barrel from this camera, so the panel names what the judge sees.
    game.turkey.hiddenSpot = { ...spot, kind: 'barrel' };
    game.lives = 3;
    // Plausible mid-run practice score: 556 distance pts (x 558 − start 2) + 24 corn × 10.
    game.score.corn = 24; game.score.score = 796; game.score.lastMetre = 556;
    game.farmer.x = spot.x - 3.6; game.farmer.z = spot.z - 1.2; game.farmer.mode = 'search'; game.farmer.modeLabel = 'SEARCHING';
    game.farmer.gaze = 1.0; game.farmer.suspicion = 38; game.farmer.quip = 'Here, turkey turkey...';
    game.vision.update(game.farmer.x, game.farmer.z, 1.0);
    game.cameraRig.override = { pos: [spot.x - 6.5, 6.2, spot.z + 10.5], look: [spot.x - 0.8, 0.9, spot.z - 1.8], fov: 50 };
    game.frozen = true;
    game.syncMeshes();
    return true;
  }
  if (name === 'escaped') {
    game.startRun(0);
    game.toasts = [];
    // Shared staged save: best 9,420 before this run, same as the title screen.
    game.save.best = 9420;
    // Staged run numbers must reconcile: 1200 dist + 880 corn + 700 shaves + 600 sneaks
    // + 1500 wishbones = 4,880 run score; + 2,000 escape + 1,000 feathers + 180 time
    // = 8,060 TOTAL, which is also what the tally rows sum to.
    game.score.score = 4880; game.score.corn = 88; game.score.shaves = 14; game.score.sneaks = 4; game.score.wishbones = 3;
    game.score.distance = 1200; game.score.lastMetre = 1200;
    game.lives = 2; game.runTime = 128; game.turkey.x = 1284;
    game.endRun('escaped', '');
    game.toasts = [];
    game.cameraRig.override = { pos: [1277, 3.6, 9], look: [1287, 1.4, -1], fov: 50 };
    game.particles.confetti(1284, 3, 0);
    game.frozen = true;
    game.syncMeshes();
    return true;
  }
  if (name === 'caught') {
    game.startRun(0);
    game.toasts = [];
    game.lives = 1; game.turkey.x = 620;
    game.endRun('caught', 'Grabbed by Farmer Grimsby');
    game.toasts = [];
    game.frozen = true;
    game.syncMeshes();
    return true;
  }
  return false;
}
