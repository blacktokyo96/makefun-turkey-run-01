// The farmer's gaze fan on the floor for Wishbone Getaway: a visible cone that sweeps while searching.
import * as THREE from 'three';
import { makeConeFan } from '../hazards/hazard-models.js';
export class VisionCone {
  constructor(scene) {
    this.group = new THREE.Group();
    this.mesh = makeConeFan();
    this.group.add(this.mesh);
    scene.add(this.group);
  }
  // angle: atan2(dz, dx) in world xz, 0 = +x. The flat fan points along -z, so spin the group to steer it.
  update(fx, fz, angle, range = 9, color = 0xffd23e) {
    this.group.position.set(fx, 0, fz);
    this.group.rotation.y = -angle - Math.PI / 2;
    this.mesh.material.color.setHex(color);
    this.mesh.material.opacity = 0.28;
    this.group.visible = true;
  }
  hide() { this.group.visible = false; }
  show() { this.group.visible = true; }
}
