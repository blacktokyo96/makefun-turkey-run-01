// Stage 2 scenery for Wishbone Getaway: plank walls, pillars, lofts, stalls, chickens, lanterns.
import * as THREE from 'three';
import { mulberry32, range } from '../core/random.js';
import { makeHayBale, makeSignBoard, box, sphere, cone } from './prop-kit.js';
export function buildBarn(scene) {
  const g = new THREE.Group();
  const rng = mulberry32(77);
  // Red plank back wall (z -8) and front wall pieces (z +8, with gaps so the camera sees in).
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xa8322d, roughness: 0.95, flatShading: true });
  const back = new THREE.Mesh(new THREE.BoxGeometry(400, 9, 0.6), wallMat); back.position.set(600, 4.5, -8.5); back.receiveShadow = true; g.add(back);
  for (let x = 410; x < 800; x += 20) { const pillar = box(1.2, 9, 1.2, 0x7a241d, x, 4.5, -8); g.add(pillar); }
  // Roof beams.
  for (let x = 410; x < 800; x += 25) { const beam = box(0.8, 0.8, 17, 0x6b4423, x, 8.2, 0); beam.rotation.x = 0.25; g.add(beam); }
  // Glowing windows + lanterns on the back wall.
  for (let x = 430; x < 790; x += 45) {
    const win = box(2.2, 1.6, 0.1, 0xffe9a0, x, 5.5, -8.1); win.material = new THREE.MeshStandardMaterial({ color: 0xffe9a0, emissive: 0xffc860, emissiveIntensity: 0.9 }); g.add(win);
    const lamp = sphere(0.28, 0xffb020, x + 12, 6.5, -7.6); lamp.material = new THREE.MeshStandardMaterial({ color: 0xffb020, emissive: 0xff9a00, emissiveIntensity: 1.2 }); g.add(lamp);
  }
  // Hay lofts with bales.
  for (const [lx, lz] of [[480, -6.5], [620, -6.5], [740, -6.5]]) {
    g.add(box(14, 0.5, 3, 0x8a5a30, lx, 3.2, lz));
    for (let i = 0; i < 4; i++) { const b = makeHayBale(); b.position.set(lx - 5 + i * 3.2, 3.45, lz); g.add(b); }
  }
  // Stalls on the front side.
  for (let x = 450; x < 780; x += 55) { g.add(box(10, 1.4, 0.3, 0x8a5a30, x, 0.7, 7.2)); g.add(box(0.3, 1.4, 0.3, 0x6b4423, x - 5, 0.7, 7.2)); }
  // Chickens pecking.
  for (let i = 0; i < 8; i++) {
    const c = new THREE.Group();
    const body = sphere(0.3, 0xffffff, 0, 0.35, 0, 1, 0.9, 1); c.add(body);
    const head = sphere(0.14, 0xffffff, 0.28, 0.55, 0); c.add(head);
    const comb = cone(0.08, 0.16, 0xd9281e, 0.28, 0.68, 0); c.add(comb);
    c.position.set(range(rng, 420, 780), 0, (rng() < 0.5 ? -1 : 1) * range(rng, 3, 6.5));
    g.add(c);
  }
  const sign = makeSignBoard(['FARMHOUSE KITCHEN', 'NO TURKEYS BEYOND THIS POINT']); sign.position.set(560, 0, -7.8); g.add(sign);
  // Cream door frame at x 800.
  g.add(box(0.5, 5.5, 1.2, 0xf2e4c8, 800, 2.75, -6));
  g.add(box(0.5, 5.5, 1.2, 0xf2e4c8, 800, 2.75, 6));
  g.add(box(0.5, 1.2, 13.2, 0xf2e4c8, 800, 5.5, 0));
  scene.add(g);
  return g;
}
