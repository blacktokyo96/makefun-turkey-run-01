// Finish gate and woods for Wishbone Getaway: back-door frame, FREEDOM banner, gate, dense trees, stump.
import * as THREE from 'three';
import { mulberry32, range } from '../core/random.js';
import { makeTree, box, sphere } from './prop-kit.js';
export function buildWoods(scene) {
  const g = new THREE.Group();
  const rng = mulberry32(202);
  // Back-door frame at x 1200.
  g.add(box(0.6, 6, 1.2, 0xf2e4c8, 1200, 3, -6.2));
  g.add(box(0.6, 6, 1.2, 0xf2e4c8, 1200, 3, 6.2));
  g.add(box(0.6, 1.2, 13.6, 0xf2e4c8, 1200, 6, 0));
  const banner = box(5, 1.1, 0.15, 0x2a8a3a, 1200, 5.2, 0);
  banner.material = new THREE.MeshStandardMaterial({ color: 0x2a8a3a, emissive: 0x1a5a22, emissiveIntensity: 0.4 });
  g.add(banner);
  // Doggy flap.
  g.add(box(0.2, 1.0, 1.2, 0x6b4423, 1200.4, 0.5, -3));
  // Open gate.
  const gate = new THREE.Group();
  gate.add(box(0.15, 2.2, 3.4, 0x8a5a30, 0, 1.1, 0));
  gate.add(box(0.15, 0.15, 3.4, 0x8a5a30, 0, 1.9, 0)); gate.add(box(0.15, 0.15, 3.4, 0x8a5a30, 0, 0.6, 0));
  gate.position.set(1206, 0, 4.5); gate.rotation.y = 0.9; g.add(gate);
  // Dense autumn woods beyond.
  for (let i = 0; i < 60; i++) {
    const t = makeTree(rng);
    const tx = range(rng, 1205, 1295), tz = range(rng, -22, 22);
    if (tx > 1265 && Math.abs(tz) < 9) continue; // keep the stump / camera corridor clear
    t.position.set(tx, 0, tz);
    const s = 0.9 + rng() * 0.9; t.scale.setScalar(s);
    g.add(t);
  }
  // Tree stump at woodsEnd - 6 = 1284.
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.7, 12), new THREE.MeshStandardMaterial({ color: 0x8a5a30, flatShading: true, roughness: 1 }));
  stump.position.set(1284, 0.35, 0); stump.castShadow = true; g.add(stump);
  const top = new THREE.Mesh(new THREE.CircleGeometry(0.85, 12), new THREE.MeshStandardMaterial({ color: 0xd9b380 }));
  top.rotation.x = -Math.PI / 2; top.position.set(1284, 0.71, 0); g.add(top);
  scene.add(g);
  return g;
}
