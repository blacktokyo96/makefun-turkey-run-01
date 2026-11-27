// Shared low-poly props for Wishbone Getaway: trees, hay, pumpkins, fences, crates, corn, signs.
import * as THREE from 'three';
import { signTexture } from './canvas-textures.js';
function mat(color, opts = {}) { return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0, ...opts }); }
function box(w, h, d, color, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; }
function sphere(r, color, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat(color)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; return m; }
function cone(r, h, color, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), mat(color)); m.position.set(x, y, z); m.castShadow = true; return m; }
export function makeTree(rng) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 2.2, 7), mat(0x6b4423)); trunk.position.y = 1.1; trunk.castShadow = true; g.add(trunk);
  const cols = [0xd9481c, 0xf0a020, 0x9c2f1a, 0xc96a1e];
  for (let i = 0; i < 3; i++) { const s = sphere(1.5 - i * 0.3, cols[Math.floor(rng() * 4)], (rng() - 0.5) * 0.7, 2.6 + i * 0.9, (rng() - 0.5) * 0.7); g.add(s); }
  return g;
}
export function makeHayBale() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 12), mat(0xe3b84f)); body.rotation.x = Math.PI / 2; body.position.y = 0.9; body.castShadow = true; g.add(body);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 6, 14), mat(0xc99a2e)); ring.position.set(0, 0.9, 0.72); g.add(ring);
  return g;
}
export function makePumpkin(r = 0.5) {
  const g = new THREE.Group();
  const body = sphere(r, 0xe8741e, 0, r * 0.75, 0, 1, 0.82, 1); g.add(body);
  for (let i = 0; i < 5; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(r * 0.92, 0.03, 5, 12), mat(0xc95a12)); rib.position.y = r * 0.75; rib.rotation.y = (i / 5) * Math.PI; rib.scale.set(1, 0.82, 1); g.add(rib); }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.3, 6), mat(0x4a6b1e)); stem.position.y = r * 1.55; stem.rotation.z = 0.3; g.add(stem);
  return g;
}
export function makeFenceRun(len) {
  const g = new THREE.Group();
  const n = Math.max(2, Math.floor(len / 2.2));
  for (let i = 0; i <= n; i++) g.add(box(0.12, 1.0, 0.12, 0xf2e4c8, -len / 2 + (i * len) / n, 0.5, 0));
  g.add(box(len, 0.1, 0.08, 0xf2e4c8, 0, 0.85, 0)); g.add(box(len, 0.1, 0.08, 0xf2e4c8, 0, 0.45, 0));
  return g;
}
export function makeCrate(size = 1) {
  const g = new THREE.Group();
  g.add(box(size, size, size, 0x9a6b35, 0, size / 2, 0));
  g.add(box(size + 0.06, 0.1, size + 0.06, 0x7a4f22, 0, size * 0.92, 0));
  g.add(box(size + 0.06, 0.1, size + 0.06, 0x7a4f22, 0, size * 0.08, 0));
  return g;
}
export function makeBarrel() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.1, 12), mat(0x7a4f22)); body.position.y = 0.55; body.castShadow = true; g.add(body);
  for (const y of [0.25, 0.85]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.04, 6, 14), mat(0x333333)); ring.rotation.x = Math.PI / 2; ring.position.y = y; g.add(ring); }
  return g;
}
export function makeCornStalk(h = 2.2) {
  const g = new THREE.Group();
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, h, 6), mat(0x4a7a1e)); stalk.position.y = h / 2; g.add(stalk);
  for (let i = 0; i < 3; i++) { const leaf = cone(0.28, 1.1, 0x6b9a2e, 0.25, h * (0.4 + i * 0.25), 0); leaf.rotation.z = -0.9; g.add(leaf); }
  const cob = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.4, 4, 8), mat(0xf0d020)); cob.position.set(0.12, h * 0.72, 0); cob.rotation.z = 0.4; g.add(cob);
  return g;
}
export function makeSignBoard(lines, w = 4.4, h = 2.2, opts = {}) {
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), new THREE.MeshStandardMaterial({ map: signTexture(lines, opts), flatShading: true, roughness: 0.85 }));
  board.position.y = 1.9; board.castShadow = true; g.add(board);
  g.add(box(0.16, 1.6, 0.16, 0x6b4423, -w / 2 + 0.3, 0.6, 0)); g.add(box(0.16, 1.6, 0.16, 0x6b4423, w / 2 - 0.3, 0.6, 0));
  return g;
}
export { mat, box, sphere, cone };
