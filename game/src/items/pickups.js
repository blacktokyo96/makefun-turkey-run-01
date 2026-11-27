// Corn, pumpkin pie, golden wishbone and corn-cob decoys for Wishbone Getaway.
import * as THREE from 'three';
import { mat, sphere } from '../world/prop-kit.js';
export class Pickups {
  constructor(scene, layout) {
    this.scene = scene;
    this.items = layout.pickups.map((p) => {
      let mesh;
      if (p.kind === 'corn') {
        mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.45, 4, 8), mat(0xf0d020));
        mesh.rotation.z = Math.PI / 2;
      } else if (p.kind === 'pie') {
        mesh = new THREE.Group();
        const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.4, 0.18, 12), mat(0xd9c8a0)); mesh.add(dish);
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12), mat(0xb24a2f)); top.position.y = 0.12; mesh.add(top);
      } else { // wishbone
        mesh = new THREE.Group();
        const m = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.3, emissive: 0x664400, emissiveIntensity: 0.5 });
        for (const s of [-1, 1]) {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.7, 6), m);
          arm.position.set(0.18, 0.25, s * 0.18); arm.rotation.z = -0.7; arm.rotation.x = s * 0.35; mesh.add(arm);
        }
        const knob = sphere(0.09, 0xffd700, 0, 0.55, 0); mesh.add(knob);
      }
      mesh.position.set(p.x, p.y, p.z);
      mesh.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      scene.add(mesh);
      return { ...p, mesh, taken: false };
    });
    this.decoys = [];
  }
  update(dt, turkey, events, time) {
    for (const it of this.items) {
      if (it.taken) continue;
      it.mesh.rotation.y += dt * 1.5;
      it.mesh.position.y = it.y + Math.sin(time * 2 + it.x) * 0.08;
      const d = Math.hypot(turkey.x - it.x, turkey.z - it.z);
      if (d < 1.1 && Math.abs(turkey.y - it.y) < 1.6) {
        it.taken = true; it.mesh.visible = false;
        events.push({ type: 'pickup', kind: it.kind, x: it.x, z: it.z });
      }
    }
  }
  throwDecoy(point) {
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.45, 4, 8), mat(0xf0d020));
    mesh.rotation.z = Math.PI / 2; mesh.position.set(point.x, 0.6, point.z);
    this.scene.add(mesh);
    this.decoys.push({ mesh, x: point.x, z: point.z, t: 0 });
    return { x: point.x, z: point.z };
  }
  updateDecoys(dt) {
    for (const d of this.decoys) { d.t += dt; d.mesh.rotation.y += dt * 4; if (d.t > 3) { this.scene.remove(d.mesh); d.dead = true; } }
    this.decoys = this.decoys.filter((d) => !d.dead);
  }
}
