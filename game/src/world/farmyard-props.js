// Stage 1 scenery for Wishbone Getaway: farmhouses, silos, scarecrows, corn rows, trees, signs.
import * as THREE from 'three';
import { mulberry32, range } from '../core/random.js';
import { makeTree, makePumpkin, makeCornStalk, makeSignBoard, makeFenceRun, box, sphere, cone } from './prop-kit.js';
function farmhouse(color) {
  const g = new THREE.Group();
  g.add(box(6, 4, 5, color, 0, 2, 0));
  const roof = cone(4.6, 2.6, 0x8a3a22, 0, 5.2, 0); roof.rotation.y = Math.PI / 4; roof.scale.set(1.15, 1, 1); g.add(roof);
  g.add(box(1.2, 2, 0.15, 0x6b4423, 0, 1, 2.55));
  for (const [wx, wy] of [[-1.8, 2.6], [1.8, 2.6], [-1.8, 1.2], [1.8, 1.2]]) g.add(box(0.9, 0.9, 0.1, 0xffe9a0, wx, wy, 2.55));
  return g;
}
function scarecrow() {
  const g = new THREE.Group();
  g.add(box(0.12, 2.4, 0.12, 0x6b4423, 0, 1.2, 0));
  g.add(box(1.4, 0.12, 0.12, 0x6b4423, 0, 1.8, 0));
  const shirt = box(1.2, 0.9, 0.3, 0x4a6b9a, 0, 1.7, 0); g.add(shirt);
  const head = sphere(0.32, 0xe8c98a, 0, 2.35, 0); g.add(head);
  const hat = cone(0.5, 0.4, 0xe3b84f, 0, 2.7, 0); g.add(hat);
  return g;
}
export function buildFarmyard(scene) {
  const g = new THREE.Group();
  const rng = mulberry32(42);
  // Rail fences both sides of the track.
  for (let x = -10; x < 400; x += 18) {
    const f1 = makeFenceRun(16); f1.position.set(x, 0, -7.5); g.add(f1);
    const f2 = makeFenceRun(16); f2.position.set(x, 0, 7.5); g.add(f2);
  }
  // Corn rows behind the fences.
  for (let x = 10; x < 390; x += 4) {
    for (const z of [-10.5, -12, 10.5, 12]) { const c = makeCornStalk(2 + rng() * 0.7); c.position.set(x + range(rng, -1, 1), 0, z + range(rng, -0.5, 0.5)); g.add(c); }
  }
  for (let i = 0; i < 26; i++) { const t = makeTree(rng); t.position.set(range(rng, 0, 390), 0, (rng() < 0.5 ? -1 : 1) * range(rng, 14, 24)); g.add(t); }
  for (let i = 0; i < 30; i++) { const p = makePumpkin(0.4 + rng() * 0.3); p.position.set(range(rng, 5, 395), 0, (rng() < 0.5 ? -1 : 1) * range(rng, 8, 13)); g.add(p); }
  const h1 = farmhouse(0xf2e4c8); h1.position.set(60, 0, -16); h1.rotation.y = 0.3; g.add(h1);
  const h2 = farmhouse(0xe8c98a); h2.position.set(240, 0, 17); h2.rotation.y = -0.4; g.add(h2);
  for (const [sx, sz] of [[120, -15], [320, 15]]) {
    const silo = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 9, 12), new THREE.MeshStandardMaterial({ color: 0xb8bcc0, metalness: 0.6, roughness: 0.4, flatShading: true }));
    silo.position.set(sx, 4.5, sz); silo.castShadow = true; g.add(silo);
    const cap = sphere(2, 0x9a3a2a, sx, 9, sz, 1, 0.5, 1); g.add(cap);
  }
  const sc1 = scarecrow(); sc1.position.set(150, 0, -9); g.add(sc1);
  const sc2 = scarecrow(); sc2.position.set(300, 0, 9); sc2.rotation.y = Math.PI; g.add(sc2);
  const sign1 = makeSignBoard(['GRIMSBY FARM', 'FRESH TURKEYS · $1.99/lb']); sign1.position.set(18, 0, -8.5); sign1.rotation.y = 0.5; g.add(sign1);
  const sign2 = makeSignBoard(['PUMPKIN PATCH →'], 3.6, 1.4); sign2.position.set(120, 0, 8.5); sign2.rotation.y = -0.5; g.add(sign2);
  // Red barn front at x 400.
  const barn = new THREE.Group();
  barn.add(box(10, 8, 6, 0xa8322d, 0, 4, 0));
  const roof = cone(7.5, 3.5, 0x6b2a20, 0, 9.5, 0); roof.rotation.y = Math.PI / 4; roof.scale.set(1.2, 1, 0.9); barn.add(roof);
  barn.add(box(4, 5.5, 0.2, 0x7a241d, 0, 2.75, 3.05));
  const bsign = makeSignBoard(['RED BARN'], 4, 1.6); bsign.position.set(0, 6.5, 3.2); barn.add(bsign);
  barn.position.set(402, 0, 0); barn.rotation.y = -Math.PI / 2; g.add(barn);
  scene.add(g);
  return g;
}
