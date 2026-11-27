// Meshes for the seeded course layout for Wishbone Getaway: one mesh per piece, tracked for animation.
import * as THREE from 'three';
import { makeHayBale, makePumpkin, makeFenceRun, makeCrate, makeBarrel, makeCornStalk, mat, box, sphere } from './prop-kit.js';
import { makeOven } from '../hazards/hazard-models.js';
export function buildCourseMeshes(scene, layout) {
  const group = new THREE.Group();
  const dynamic = { barrels: [], ovens: [], sliders: [] };
  const mudMat = new THREE.MeshStandardMaterial({ color: 0x6b4a22, roughness: 1, transparent: true, opacity: 0.85 });
  const gravyMat = new THREE.MeshStandardMaterial({ color: 0x8a5a1e, roughness: 0.3, transparent: true, opacity: 0.8 });
  for (const p of layout.pieces) {
    let m = null;
    if (p.type === 'fence') {
      m = new THREE.Group();
      const gapZ = p.z, gap = p.gap;
      for (const [z0, z1] of [[-6, gapZ - gap / 2], [gapZ + gap / 2, 6]]) {
        const len = z1 - z0; if (len <= 0) continue;
        const f = makeFenceRun(len); f.rotation.y = Math.PI / 2; f.position.set(p.x, 0, (z0 + z1) / 2); m.add(f);
      }
    } else if (p.type === 'pumpkin') { m = makePumpkin(0.5); m.position.set(p.x, 0, p.z); }
    else if (p.type === 'mud') { m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), mudMat); m.rotation.x = -Math.PI / 2; m.scale.set(p.rx, p.rz, 1); m.position.set(p.x, 0.03, p.z); }
    else if (p.type === 'gravy') { m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), gravyMat); m.rotation.x = -Math.PI / 2; m.scale.set(p.rx, p.rz, 1); m.position.set(p.x, 0.03, p.z); }
    else if (p.type === 'trough') {
      m = new THREE.Group();
      const b = box(1, 0.75, 3.2, 0x7a5a3a, 0, 0.38, 0); m.add(b);
      const water = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 3.0), new THREE.MeshStandardMaterial({ color: 0x4a8ab8, roughness: 0.2 }));
      water.rotation.x = -Math.PI / 2; water.position.y = 0.72; m.add(water);
      m.position.set(p.x, 0, p.z);
    }
    else if (p.type === 'barrel') { m = makeBarrel(); m.position.set(p.x, 0, p.z); dynamic.barrels.push({ piece: p, mesh: m }); }
    else if (p.type === 'crate') {
      m = new THREE.Group();
      const c1 = makeCrate(1.1); c1.position.set(0, 0, 0); m.add(c1);
      const c2 = makeCrate(0.9); c2.position.set(0.1, 1.1, 0); c2.rotation.y = 0.4; m.add(c2);
      m.position.set(p.x, 0, p.z);
    }
    else if (p.type === 'pitchfork') {
      m = new THREE.Group();
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.5, 6), mat(0x8a6a3a)); handle.rotation.x = Math.PI / 2; handle.position.y = 0.18; m.add(handle);
      for (let i = -1; i <= 1; i++) { const tine = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.4, 6), mat(0xc0c6cc)); tine.rotation.x = Math.PI / 2; tine.position.set(0.06, 0.18, i * 0.18); m.add(tine); }
      m.position.set(p.x, 0, p.z);
    }
    else if (p.type === 'oven') { m = makeOven(); m.position.set(p.x, 0, -7.15); dynamic.ovens.push(m); }
    else if (p.type === 'slider') { m = new THREE.Group(); }
    else if (p.type === 'pot') {
      m = new THREE.Group();
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.75, 12), mat(0x5a5f66)); pot.position.y = 0.38; m.add(pot);
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 12), mat(0x8a8f96)); lid.position.y = 0.78; m.add(lid);
      m.position.set(p.x, 0, p.z);
    }
    if (m) { group.add(m); p.mesh = m; }
  }
  // Hiding spots: haystacks / hay piles / laundry baskets.
  for (const s of layout.spots) {
    let m;
    if (s.kind === 'laundry basket') {
      m = new THREE.Group();
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.9, 1.2, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0x7a8a9a, side: THREE.DoubleSide, flatShading: true }));
      basket.position.y = 0.6; m.add(basket);
      const cloth = sphere(0.9, 0xf2e4c8, 0, 1.15, 0, 1, 0.5, 1); m.add(cloth);
    } else {
      m = makeHayBale(); m.scale.setScalar(1.25); m.position.y = 0;
      const top = sphere(0.95, 0xd9a94f, 0, 1.15, 0, 1, 0.5, 1); m.add(top);
    }
    m.position.set(s.x, 0, s.z);
    group.add(m); s.mesh = m;
  }
  scene.add(group);
  return { group, dynamic };
}
