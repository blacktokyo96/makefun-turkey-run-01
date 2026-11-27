// Pip the turkey mesh and pose for Wishbone Getaway: low-poly, flat shaded, faces +x.
import * as THREE from 'three';
import { mat, sphere, cone } from '../world/prop-kit.js';
export function buildTurkey() {
  const g = new THREE.Group();
  const body = sphere(0.55, 0x5a3a1e, 0, 0.75, 0, 1.15, 1, 0.95); g.add(body);
  const breast = sphere(0.42, 0x8a5a30, 0.18, 0.68, 0, 1, 0.9, 0.9); g.add(breast);
  const head = new THREE.Group(); head.position.set(0.48, 1.28, 0);
  const skull = sphere(0.24, 0x7a8a9a, 0, 0, 0); head.add(skull);
  const beak = cone(0.09, 0.3, 0xf0a020, 0.3, -0.02, 0); beak.rotation.z = -Math.PI / 2; head.add(beak);
  const snood = sphere(0.07, 0xd9281e, 0.22, -0.12, 0, 1, 1.6, 1); head.add(snood);
  const wattle = sphere(0.08, 0xd9281e, 0.18, -0.2, 0.08, 1, 1.4, 1); head.add(wattle);
  for (const s of [-1, 1]) {
    const eye = sphere(0.06, 0x111111, 0.14, 0.08, s * 0.17); head.add(eye);
    const glint = sphere(0.02, 0xffffff, 0.18, 0.11, s * 0.17); head.add(glint);
  }
  g.add(head);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.5, 8), mat(0x7a8a9a)); neck.position.set(0.42, 1.0, 0); g.add(neck);
  const tail = new THREE.Group(); tail.position.set(-0.55, 0.85, 0);
  const feathers = [];
  for (let i = 0; i < 9; i++) {
    const a = (i - 4) * 0.22;
    const f = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.95), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xc99a5a : 0x6b4423, side: THREE.DoubleSide, flatShading: true }));
    blade.position.y = 0.5; f.add(blade);
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.14), new THREE.MeshStandardMaterial({ color: 0x2a1a0c, side: THREE.DoubleSide }));
    stripe.position.y = 0.72; f.add(stripe);
    const tip = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.16), new THREE.MeshStandardMaterial({ color: 0xffeec2, side: THREE.DoubleSide }));
    tip.position.y = 0.9; f.add(tip);
    f.rotation.x = a; f.rotation.z = 0.5;
    tail.add(f); feathers.push(f);
  }
  g.add(tail);
  const wingL = new THREE.Group(); wingL.position.set(-0.05, 0.85, 0.42);
  const wl = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.1), mat(0x4a2e16)); wl.position.x = -0.2; wingL.add(wl);
  const barL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.11), mat(0xffeec2)); barL.position.set(-0.2, 0.08, 0); wingL.add(barL);
  g.add(wingL);
  const wingR = wingL.clone(); wingR.position.z = -0.42; g.add(wingR);
  const legL = new THREE.Group(); legL.position.set(0.05, 0.42, 0.18);
  const ll = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.42, 6), mat(0xf07a1e)); ll.position.y = -0.2; legL.add(ll);
  const footL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.24), mat(0xf07a1e)); footL.position.set(0.08, -0.4, 0); legL.add(footL);
  g.add(legL);
  const legR = legL.clone(); legR.position.z = -0.18; g.add(legR);
  g.scale.setScalar(1.3);
  return { group: g, parts: { body, head, tail, feathers, wingL, wingR, legL, legR } };
}
export function poseTurkey(p, state, dt, t) {
  const { parts } = p;
  const run = state.mode === 'run';
  const speed = state.speed || 0;
  const phase = t * (6 + speed * 1.1);
  if (state.hidden) {
    p.group.position.y = state.y - 0.45;
    parts.tail.rotation.x = 0; parts.wingL.rotation.z = 0; parts.wingR.rotation.z = 0;
    parts.head.position.y = 1.28; return;
  }
  p.group.position.y = state.y;
  const swing = run ? Math.sin(phase) * 0.7 : 0;
  parts.legL.rotation.z = swing; parts.legR.rotation.z = -swing;
  p.group.position.y = state.y + (run ? Math.abs(Math.sin(phase)) * 0.08 : 0);
  p.group.rotation.z = state.stun > 0 ? Math.sin(t * 30) * 0.12 : -0.08 - speed * 0.004;
  const spread = state.dashing ? 1.6 : state.cheer ? 1.8 : 1;
  parts.feathers.forEach((f, i) => { const a = (i - 4) * 0.22 * spread; f.rotation.x = a; });
  if (state.airborne) {
    parts.wingL.rotation.z = 0.9 + Math.sin(t * 18) * 0.35; parts.wingR.rotation.z = -0.9 - Math.sin(t * 18) * 0.35;
  } else if (state.cheer) {
    parts.wingL.rotation.z = 1.2 + Math.sin(t * 12) * 0.5; parts.wingR.rotation.z = -1.2 - Math.sin(t * 12) * 0.5;
  } else {
    parts.wingL.rotation.z = run ? Math.sin(phase) * 0.25 : 0; parts.wingR.rotation.z = -parts.wingL.rotation.z;
  }
  parts.head.rotation.z = state.stun > 0 ? Math.sin(t * 20) * 0.2 : 0;
}
