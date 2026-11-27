// Farmer Grimsby mesh and pose for Wishbone Getaway: plaid, overalls, straw hat, knife in hand.
import * as THREE from 'three';
import { mat, box, sphere, cone } from '../world/prop-kit.js';
import { plaidTexture } from '../world/canvas-textures.js';
import { makeKnife } from '../hazards/hazard-models.js';
export function buildFarmer() {
  const g = new THREE.Group();
  const belly = sphere(0.55, 0xa8322d, 0, 1.05, 0, 1, 1.05, 0.95); g.add(belly);
  // plaid shirt: wrap belly in plaid via a slightly larger sphere segment look — use plaid material on torso box
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.8), new THREE.MeshStandardMaterial({ map: plaidTexture(), flatShading: true, roughness: 0.9 }));
  torso.position.set(0, 1.15, 0); torso.castShadow = true; g.add(torso);
  const overalls = box(0.72, 0.55, 0.82, 0x2a4a8a, 0, 0.62, 0); g.add(overalls);
  for (const s of [-1, 1]) {
    g.add(box(0.08, 0.5, 0.05, 0x2a4a8a, 0.18, 1.25, s * 0.3));
    const btn = sphere(0.05, 0xf0c020, 0.18, 1.42, s * 0.3); g.add(btn);
  }
  const head = new THREE.Group(); head.position.set(0.1, 1.75, 0);
  const skull = sphere(0.3, 0xe8b88a, 0, 0, 0); head.add(skull);
  const beard = sphere(0.26, 0x6b4423, 0.08, -0.14, 0, 1, 0.8, 0.9); head.add(beard);
  const nose = sphere(0.09, 0xd9281e, 0.3, -0.02, 0); head.add(nose);
  for (const s of [-1, 1]) {
    const eye = sphere(0.045, 0x111111, 0.2, 0.08, s * 0.12); head.add(eye);
    const brow = box(0.16, 0.05, 0.05, 0x4a2e16, 0.2, 0.18, s * 0.12); brow.rotation.z = s * 0.4; head.add(brow);
  }
  const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.22, 10), mat(0xe3b84f)); hatTop.position.y = 0.28; head.add(hatTop);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 12), mat(0xe3b84f)); brim.position.y = 0.18; head.add(brim);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.08, 10), mat(0xa8322d)); band.position.y = 0.2; head.add(band);
  g.add(head);
  const armR = new THREE.Group(); armR.position.set(0.1, 1.4, -0.45);
  const ar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 7), mat(0xa8322d)); ar.position.y = -0.28; armR.add(ar);
  const knife = makeKnife(1.0); knife.position.set(0.05, -0.62, 0); knife.rotation.z = -0.6; armR.add(knife);
  g.add(armR);
  const armL = new THREE.Group(); armL.position.set(0.1, 1.4, 0.45);
  const al = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 7), mat(0xa8322d)); al.position.y = -0.28; armL.add(al);
  g.add(armL);
  const legL = new THREE.Group(); legL.position.set(0, 0.42, 0.2);
  const ll = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.42, 7), mat(0x2a4a8a)); ll.position.y = -0.2; legL.add(ll);
  const bootL = box(0.36, 0.14, 0.2, 0x4a2e16, 0.08, -0.4, 0); legL.add(bootL);
  g.add(legL);
  const legR = legL.clone(); legR.position.z = -0.2; g.add(legR);
  g.scale.setScalar(1.1);
  return { group: g, parts: { head, armR, armL, legL, legR, torso } };
}
export function poseFarmer(f, state, dt, t) {
  const { parts } = f;
  const run = state.mode === 'chase' || state.mode === 'lunge';
  const phase = t * 9;
  const swing = run ? Math.sin(phase) * 0.6 : 0;
  parts.legL.rotation.z = swing; parts.legR.rotation.z = -swing;
  f.group.rotation.z = run ? -0.06 : 0;
  if (state.mode === 'search') {
    parts.armR.rotation.x = 0; parts.armR.rotation.z = -2.2;
    parts.head.rotation.y = Math.sin(t * 1.6) * 0.7;
  } else if (state.mode === 'throw') {
    parts.armR.rotation.z = -2.6 + Math.sin(t * 6) * 0.2;
  } else if (state.mode === 'lunge') {
    parts.armR.rotation.z = -1.2; parts.armL.rotation.z = 1.2;
  } else if (state.mode === 'gloat') {
    parts.armR.rotation.z = -2.4 + Math.sin(t * 8) * 0.5; parts.head.rotation.y = 0;
  } else if (state.mode === 'confused') {
    parts.head.rotation.y = Math.PI; parts.armR.rotation.z = -0.4;
  } else {
    parts.armR.rotation.z = -0.9 + Math.sin(phase) * 0.3; parts.armL.rotation.z = 0.2;
    parts.head.rotation.y = 0;
  }
}
