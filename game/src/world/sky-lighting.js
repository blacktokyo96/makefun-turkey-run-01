// Sky dome, hemisphere and shadow sun for Wishbone Getaway: the sun follows the turkey.
import * as THREE from 'three';
import { PALETTE } from '../core/config.js';
export function buildSkyLighting(scene) {
  const geo = new THREE.SphereGeometry(420, 24, 16);
  const colors = [];
  const top = new THREE.Color(PALETTE.skyTop), bot = new THREE.Color(PALETTE.skyBottom);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = Math.max(0, Math.min(1, (pos.getY(i) / 420 + 0.15) * 1.4));
    const c = bot.clone().lerp(top, t);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }));
  scene.add(sky);
  const hemi = new THREE.HemisphereLight(0xffe0b0, 0x5a4a2a, 0.9); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe8c0, 2.0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -30; sun.shadow.camera.right = 30; sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 120; sun.shadow.bias = -0.002;
  scene.add(sun); scene.add(sun.target);
  scene.fog = new THREE.Fog(PALETTE.fog, PALETTE.fogNear, PALETTE.fogFar);
  scene.background = new THREE.Color(PALETTE.skyTop);
  return {
    update(x) {
      sky.position.x = x;
      sun.position.set(x - 18, 34, 22); sun.target.position.set(x + 6, 0, 0); sun.target.updateMatrixWorld();
    },
  };
}
