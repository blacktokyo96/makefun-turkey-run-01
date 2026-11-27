// Hazard meshes for Wishbone Getaway: carving knife, oven, fire jet, warning stripe.
import * as THREE from 'three';
import { mat, box, sphere } from '../world/prop-kit.js';
export function makeKnife(scale = 1) {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.lineTo(0.95, 0.06); shape.quadraticCurveTo(1.25, 0.1, 1.15, 0.22); shape.lineTo(0.1, 0.24); shape.lineTo(0, 0);
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0xeef2f6, metalness: 0.35, roughness: 0.3, flatShading: true }));
  blade.castShadow = true; g.add(blade);
  g.add(box(0.42, 0.14, 0.07, 0x3a2a1a, -0.28, 0.12, 0));
  g.add(box(0.06, 0.3, 0.06, 0xc0c6cc, -0.05, 0.12, 0));
  g.scale.setScalar(scale);
  return g;
}
export function makeOven() {
  const g = new THREE.Group();
  const body = box(2.2, 1.9, 1.1, 0x3c3f45, 0, 0.95, 0); g.add(body);
  const top = box(2.3, 0.1, 1.2, 0x9aa0a8, 0, 1.95, 0); g.add(top);
  const pan = box(1.2, 0.18, 0.7, 0x8a6a3a, 0, 2.05, 0); g.add(pan);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x2a1408, emissive: 0xff6a00, emissiveIntensity: 0.4, roughness: 0.4 });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), windowMat); win.position.set(0, 1.0, 0.56); g.add(win);
  g.userData.windowMat = windowMat;
  const handle = box(1.6, 0.08, 0.08, 0xc0c6cc, 0, 1.62, 0.58); g.add(handle);
  for (let i = 0; i < 4; i++) { const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 10), mat(0x222222)); knob.rotation.x = Math.PI / 2; knob.position.set(-0.7 + i * 0.47, 1.78, 0.56); g.add(knob); }
  return g;
}
export function makeFireJet() {
  const g = new THREE.Group();
  const geo = new THREE.IcosahedronGeometry(0.28, 0);
  const cols = [0xff6a00, 0xffb020, 0xffd23e, 0xe23b2e];
  const parts = [];
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: cols[i % 4], emissive: cols[i % 4], emissiveIntensity: 0.9, flatShading: true }));
    m.visible = false; g.add(m); parts.push(m);
  }
  g.userData.parts = parts;
  return g;
}
export function makeWarningStripe(len = 16) {
  const geo = new THREE.PlaneGeometry(len, 1.1);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.45, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.06;
  return m;
}
export function makeConeFan() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  const N = 14, R = 9, A = 0.5;
  for (let i = 0; i <= N; i++) { const a = -A + (2 * A * i) / N; shape.lineTo(Math.sin(a) * R, Math.cos(a) * R); }
  shape.lineTo(0, 0);
  const geo = new THREE.ShapeGeometry(shape);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffd23e, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.07;
  return m;
}
