// Pip's movement for Wishbone Getaway: auto-run, sprint/ease, jump/flap/glide, dash, hide, mud/gravy.
import { TURKEY, TRACK } from '../core/config.js';
import { clamp, approach } from '../core/math-utils.js';
import { zoneAt, nearestSpot } from '../world/course-layout.js';
import { collideObstacles, clampTrack } from '../hazards/obstacles.js';
export class TurkeyController {
  constructor(layout) {
    this.layout = layout;
    this.reset();
  }
  reset() {
    this.x = 2; this.z = 0; this.y = 0; this.vy = 0; this.radius = TURKEY.radius;
    this.speed = TURKEY.run; this.acrossVel = 0; this.stamina = 1;
    this.stun = 0; this.invuln = 0; this.dashT = 0; this.dashCd = 0;
    this.flapped = false; this.grounded = true; this.hidden = false; this.hiddenSpot = null;
    this.hideCooldown = 0; this.airborne = false; this.dashing = false; this.cheer = false;
    this.mode = 'run';
  }
  update(dt, input, events, ctx) {
    if (this.hidden) {
      this.speed = 0; this.stamina = Math.min(1, this.stamina + TURKEY.staminaRegen * 2 * dt);
      this.hideCooldown = Math.max(0, this.hideCooldown - dt);
      if (input.pressed('KeyE') || input.pressed('Space') || input.axes().sprint) {
        if (this.hideCooldown <= 0) { this.leaveHide(events, ctx); }
      }
      return;
    }
    this.stun = Math.max(0, this.stun - dt);
    this.hideCooldown = Math.max(0, this.hideCooldown - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.dashCd = Math.max(0, this.dashCd - dt);
    const axes = input.axes();
    const zone = zoneAt(this.layout, this.x, this.z);
    const slippery = zone === 'gravy';
    let target = axes.sprint && this.stamina > 0.05 ? TURKEY.sprint : axes.ease ? TURKEY.ease : TURKEY.run;
    if (zone === 'mud') target *= 0.55;
    if (this.stun > 0) target *= 0.25;
    if (axes.sprint && this.stamina > 0) this.stamina = Math.max(0, this.stamina - TURKEY.staminaDrain * dt);
    else this.stamina = Math.min(1, this.stamina + TURKEY.staminaRegen * dt);
    // Dash (SHIFT): brief invulnerability, big speed.
    if (input.pressed('ShiftLeft') || input.pressed('ShiftRight')) {
      if (this.dashCd <= 0) { this.dashT = TURKEY.dashTime; this.dashCd = TURKEY.dashCooldown; this.invuln = Math.max(this.invuln, 0.4); events.push({ type: 'dash' }); }
    }
    this.dashing = this.dashT > 0;
    if (this.dashing) { this.dashT -= dt; target = TURKEY.dashSpeed; }
    const accel = this.dashing ? 80 : 18;
    this.speed = approach(this.speed, target, accel * dt);
    // Across: W/S, slippery gravy responds slowly + wobble.
    const want = axes.across * TURKEY.strafe;
    const rate = slippery ? 1.6 : 14;
    this.acrossVel = approach(this.acrossVel, want, rate * TURKEY.strafe * dt * 0.5 + (slippery ? 0 : 0));
    if (slippery) this.acrossVel += Math.sin(ctx.time * 3) * 0.35 * dt * 10;
    this.z += this.acrossVel * dt;
    clampTrack(this);
    // Jump / flap / glide.
    if (input.pressed('Space')) {
      if (this.grounded) { this.vy = TURKEY.jumpVel; this.grounded = false; this.flapped = false; events.push({ type: 'jump' }); }
      else if (!this.flapped) { this.vy = TURKEY.flapVel; this.flapped = true; events.push({ type: 'flap' }); }
    }
    const holdingSpace = input.isDown('Space');
    const grav = (!this.grounded && this.flapped && holdingSpace) ? TURKEY.glideGravity : TURKEY.gravity;
    this.vy -= grav * dt;
    this.y += this.vy * dt;
    if (this.y <= 0) { this.y = 0; this.vy = 0; this.grounded = true; this.flapped = false; }
    this.airborne = !this.grounded;
    this.x += this.speed * dt;
    // Hide.
    const spot = nearestSpot(this.layout, this.x, this.z, 2.6);
    this.nearSpot = spot;
    if (input.pressed('KeyE') && spot && this.grounded && this.hideCooldown <= 0) {
      this.hidden = true; this.hiddenSpot = spot; this.x = spot.x; this.z = spot.z; this.speed = 0; this.acrossVel = 0;
      events.push({ type: 'hide', spot });
    }
    collideObstacles(this, this.layout, events);
    this.mode = this.stun > 0 ? 'stunned' : 'run';
  }
  leaveHide(events, ctx) {
    const spot = this.hiddenSpot;
    this.hidden = false; this.hiddenSpot = null; this.hideCooldown = 0.6;
    events.push({ type: 'leaveHide', spot, seen: ctx ? ctx.farmerSeesTurkey : false });
  }
  hurt() { this.invuln = TURKEY.invuln; this.stun = TURKEY.stun; }
}
