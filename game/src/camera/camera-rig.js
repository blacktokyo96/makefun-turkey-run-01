// Side-on chase camera for Wishbone Getaway: damped follow, shake, staged-shot overrides.
import * as THREE from 'three';
import { damp } from '../core/math-utils.js';
export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.shakeAmt = 0;
    this.override = null; // {pos:[x,y,z], look:[x,y,z], fov}
  }
  shake(a) { this.shakeAmt = Math.max(this.shakeAmt, a); }
  update(dt, turkey, hiding) {
    this.shakeAmt = Math.max(0, this.shakeAmt - dt * 2.2);
    if (this.override) {
      const o = this.override;
      this.camera.position.set(o.pos[0], o.pos[1], o.pos[2]);
      this.camera.lookAt(o.look[0], o.look[1], o.look[2]);
      if (o.fov && this.camera.fov !== o.fov) { this.camera.fov = o.fov; this.camera.updateProjectionMatrix(); }
      return;
    }
    const tx = turkey.x, tz = turkey.z;
    const px = hiding ? tx - 2.2 : tx - 3.2;
    const py = hiding ? 7.2 : 9.6;
    const pz = hiding ? 12.0 + tz * 0.25 : 15.4 + tz * 0.25;
    const k = 1 - Math.exp(-5 * dt);
    this.camera.position.x = damp(this.camera.position.x, px, 5, dt);
    this.camera.position.y = damp(this.camera.position.y, py, 5, dt);
    this.camera.position.z = damp(this.camera.position.z, pz, 5, dt);
    const lx = tx + 5.2, ly = 0.6, lz = -1.4 + tz * 0.35;
    if (this.shakeAmt > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeAmt;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeAmt;
    }
    this.camera.lookAt(lx, ly, lz);
    if (this.camera.fov !== 48) { this.camera.fov = 48; this.camera.updateProjectionMatrix(); }
  }
}
