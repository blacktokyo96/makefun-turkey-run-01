// Farmer Grimsby's AI for Wishbone Getaway: chase, lunge, grab, search, confused, decoy, stagger, gloat.
import { FARMER, QUIPS } from '../core/config.js';
import { clamp } from '../core/math-utils.js';
import { mulberry32 } from '../core/random.js';
export class FarmerAI {
  constructor() { this.reset(0); }
  reset(turkeyX) {
    this.x = turkeyX - FARMER.startGap; this.z = 0; this.mode = 'chase';
    this.gap = FARMER.startGap; this.suspicion = 0; this.throwTimer = 4;
    this.quipTimer = 2; this.quip = QUIPS[0]; this.lungeT = 0; this.spotBonusT = 0;
    this.staggerT = 0; this.confusedT = 0; this.decoyT = 0; this.decoyTarget = null;
    this.gaze = 0; this.searchT = 0; this.rng = mulberry32(99);
    this.modeLabel = 'CHASING';
  }
  gapTo(t) { return t.x - this.x; }
  update(dt, turkey, stage, events, ctx) {
    this.quipTimer -= dt;
    if (this.quipTimer <= 0) { this.quipTimer = 3.5 + this.rng() * 3; this.quip = QUIPS[Math.floor(this.rng() * QUIPS.length)]; }
    this.gap = this.gapTo(turkey);
    if (this.staggerT > 0) { this.staggerT -= dt; this.mode = 'stagger'; this.modeLabel = 'STAGGERED'; this.x += stage.farmerSpeed * 0.4 * dt; return; }
    if (this.confusedT > 0) { this.confusedT -= dt; this.mode = 'confused'; this.modeLabel = 'LOST YOU'; return; }
    if (this.decoyT > 0) {
      this.decoyT -= dt; this.mode = 'decoy'; this.modeLabel = 'DISTRACTED';
      const dx = this.decoyTarget.x - this.x, dz = this.decoyTarget.z - this.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.3) { this.x += (dx / d) * 3.5 * dt; this.z += (dz / d) * 3.5 * dt; }
      if (this.decoyT <= 0) this.mode = 'chase';
      return;
    }
    // Hiding: slow, search near the spot.
    if (turkey.hidden && turkey.hiddenSpot) {
      const spot = turkey.hiddenSpot;
      const d = Math.hypot(spot.x - this.x, spot.z - this.z);
      if (d > FARMER.searchRange) {
        this.mode = 'chase'; this.modeLabel = 'CHASING';
        this.x += FARMER.searchSpeed * dt; this.z += clamp(spot.z - this.z, -1, 1) * 2 * dt;
      } else {
        this.mode = 'search'; this.modeLabel = 'SEARCHING';
        this.searchT += dt;
        this.gaze = Math.sin(this.searchT * FARMER.gazeSweep) * FARMER.gazeSweepRange;
        // Suspicion: cone covers spot?
        const angToSpot = Math.atan2(spot.z - this.z, spot.x - this.x);
        const coneCovers = Math.abs(angToSpot - this.gaze) < FARMER.gazeHalfAngle && d < FARMER.gazeRange;
        this.suspicion += (coneCovers ? 30 : 9) * dt;
        if (this.suspicion >= 100) { this.suspicion = 0; events.push({ type: 'found', spot }); }
      }
      return;
    }
    this.suspicion = Math.max(0, this.suspicion - 20 * dt);
    // Chase.
    let speed = stage.farmerSpeed;
    if (this.gap > FARMER.catchupGap) speed += FARMER.catchup;
    if (this.spotBonusT > 0) { speed += FARMER.spotBonus; this.spotBonusT -= dt; }
    if (this.lungeT > 0) { this.lungeT -= dt; speed += FARMER.lungeBonus; this.mode = 'lunge'; this.modeLabel = 'LUNGING!'; }
    else if (this.gap < FARMER.lungeGap && this.gap > 0) { this.lungeT = FARMER.lungeTime; this.mode = 'lunge'; this.modeLabel = 'LUNGING!'; }
    else { this.mode = 'chase'; this.modeLabel = 'CHASING'; }
    this.x += speed * dt;
    this.z += clamp(turkey.z - this.z, -1, 1) * 3.6 * dt;
    this.gaze = Math.atan2(turkey.z - this.z, turkey.x - this.x);
    this.gap = this.gapTo(turkey);
    // Grab.
    if (this.gap < FARMER.catchGap && turkey.invuln <= 0 && !turkey.hidden) {
      events.push({ type: 'grabbed' });
      this.x = turkey.x - FARMER.knockbackGap; this.staggerT = 1.1; this.gap = FARMER.knockbackGap;
    }
    // Knife throws only in chase.
    this.throwTimer -= dt;
    if (this.throwTimer <= 0 && this.mode === 'chase' && this.gap >= 3 && this.gap <= 17) {
      this.throwTimer = stage.throwMin + this.rng() * (stage.throwMax - stage.throwMin);
      events.push({ type: 'throwKnife', targetZ: turkey.z + turkey.acrossVel * 0.45, kitchen: ctx.stageIndex === 2 });
    } else if (this.throwTimer <= 0) { this.throwTimer = 1.5; }
  }
  onSpotted() { this.spotBonusT = FARMER.spotBonusTime; this.modeLabel = 'FURIOUS'; }
  onSneak() { this.confusedT = 1.8; this.mode = 'confused'; this.modeLabel = 'LOST YOU'; }
  onDecoy(target) { this.decoyTarget = target; this.decoyT = 2.6; this.quip = 'Ooh... corn?'; }
  gazeAngle() { return this.mode === 'search' ? this.gaze : Math.atan2(0, 1); }
}
