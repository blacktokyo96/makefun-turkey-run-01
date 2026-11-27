// Carving-station knives sliding across the kitchen for Wishbone Getaway.
import * as THREE from 'three';
import { HAZARDS } from '../core/config.js';
import { makeKnife } from './hazard-models.js';
import { mat, box } from '../world/prop-kit.js';
export class KnifeSlider {
  constructor(scene, layout) {
    this.scene = scene;
    this.sliders = layout.sliders.map((s) => {
      const rail = box(0.5, 0.12, 12, 0x222222, s.x, 0.06, 0);
      scene.add(rail);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 12), mat(0xa8322d));
      hub.position.set(s.x, 0.2, 0); scene.add(hub);
      const knife = makeKnife(2.1);
      scene.add(knife);
      return { ...s, rail, hub, knife, hitDone: false };
    });
  }
  update(dt, time, turkey, events) {
    for (const s of this.sliders) {
      const z = Math.sin((time / HAZARDS.sliderPeriod) * Math.PI * 2 + s.phase) * 5.6;
      s.zNow = z;
      s.knife.position.set(s.x, HAZARDS.sliderHeight, z);
      s.knife.rotation.x = time * 5; s.knife.rotation.y = Math.PI / 2;
      s.hub.position.set(s.x, 0.2, z);
      if (turkey.y < 1.0 && Math.abs(turkey.x - s.x) < 0.9 && Math.abs(turkey.z - z) < 0.8 && turkey.invuln <= 0 && !turkey.hidden) {
        if (!s.hitDone) { s.hitDone = true; events.push({ type: 'sliderHit' }); }
      } else if (Math.abs(turkey.z - z) > 1.6) { s.hitDone = false; }
    }
  }
  parkAll(z) { for (const s of this.sliders) { s.knife.position.set(s.x, HAZARDS.sliderHeight, z); s.hub.position.set(s.x, 0.2, z); s.zNow = z; } }
}
