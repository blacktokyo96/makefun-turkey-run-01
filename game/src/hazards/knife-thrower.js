// Telegraphed knife throws for Wishbone Getaway: warning stripe, then a spinning carving knife.
import * as THREE from 'three';
import { FARMER, HAZARDS } from '../core/config.js';
import { makeKnife, makeWarningStripe } from './hazard-models.js';
export class KnifeThrower {
  constructor(scene) {
    this.scene = scene;
    this.knives = []; // {mesh, x, z, vx, vz, life, shaved}
    this.pending = null; // {x0, z, timer, targetZ, second}
    this.stripe = makeWarningStripe(20);
    this.stripe.visible = false;
    scene.add(this.stripe);
    this.stripe2 = makeWarningStripe(20);
    this.stripe2.visible = false;
    scene.add(this.stripe2);
  }
  throwFrom(farmer, targetZ, kitchen = false) {
    this.pending = { x0: farmer.x, z: targetZ, timer: FARMER.knifeWarn, second: kitchen && Math.random() < 0.4 ? targetZ + 2.6 : null };
  }
  update(dt, turkey, events) {
    if (this.pending) {
      const p = this.pending;
      p.timer -= dt;
      const x0 = p.x0, z = p.z;
      this.stripe.visible = true;
      this.stripe.position.set(x0 + 8, 0.06, z);
      this.stripe.material.opacity = 0.55 + 0.2 * Math.sin(performance.now() / 90);
      this.stripe2.visible = p.second !== null;
      if (p.second !== null) this.stripe2.position.set(x0 + 8, 0.06, p.second);
      if (p.timer <= 0) {
        this.spawn(x0, z);
        if (p.second !== null) this.spawn(x0, p.second);
        this.pending = null; this.stripe.visible = false; this.stripe2.visible = false;
        events.push({ type: 'knifeFlying' });
      }
    }
    for (const k of this.knives) {
      k.x += k.vx * dt; k.life -= dt;
      k.mesh.position.set(k.x, FARMER.knifeHeight, k.z);
      k.mesh.rotation.x += dt * 14; k.mesh.rotation.y += dt * 3;
      if (!k.shaved) {
        const d = Math.hypot(turkey.x - k.x, turkey.z - k.z);
        if (d < HAZARDS.shaveDist && turkey.y < 1.6) {
          if (d < FARMER.knifeHitRadius && turkey.invuln <= 0 && !turkey.hidden) {
            k.shaved = 'hit'; events.push({ type: 'knifeHit' });
          } else if (k.x > turkey.x + 0.4) { k.shaved = 'shave'; events.push({ type: 'shave' }); }
        }
      }
      if (k.life <= 0 || k.x > turkey.x + 30) { k.dead = true; }
    }
    for (const k of this.knives.filter((k) => k.dead)) { this.scene.remove(k.mesh); }
    this.knives = this.knives.filter((k) => !k.dead);
  }
  spawn(x0, z) {
    const mesh = makeKnife(1.7);
    mesh.position.set(x0, FARMER.knifeHeight, z);
    this.scene.add(mesh);
    this.knives.push({ mesh, x: x0, z, vx: FARMER.knifeSpeed, life: 2.2, shaved: false });
  }
  clear() {
    for (const k of this.knives) this.scene.remove(k.mesh);
    this.knives = []; this.pending = null; this.stripe.visible = false; this.stripe2.visible = false;
  }
  get incoming() { return this.pending !== null || this.knives.length > 0; }
  nextThrowIn(farmer) { return farmer.throwTimer; }
}
