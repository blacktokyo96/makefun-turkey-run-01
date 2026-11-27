// Ground strips per stage for Wishbone Getaway: grass + dirt, barn planks, kitchen checker.
import * as THREE from 'three';
import { grassTexture, dirtTexture, plankTexture, checkerTexture } from './canvas-textures.js';
export function buildGround(scene) {
  const group = new THREE.Group();
  function strip(x0, x1, tex, color) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 34), new THREE.MeshStandardMaterial({ map: tex, color, roughness: 1 }));
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0, 0); m.receiveShadow = true; group.add(m); return m;
  }
  strip(-30, 400, grassTexture(), 0xffffff);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(430, 7), new THREE.MeshStandardMaterial({ map: dirtTexture(), roughness: 1 }));
  path.rotation.x = -Math.PI / 2; path.position.set(185, 0.02, 0); path.receiveShadow = true; group.add(path);
  strip(400, 800, plankTexture('#8a5a30'), 0xffffff);
  strip(800, 1200, checkerTexture(), 0xffffff);
  strip(1200, 1300, grassTexture(), 0xffffff);
  // Side grass beyond the track in barn/kitchen so the world never ends in void.
  for (const [x0, x1] of [[400, 800], [800, 1200]]) {
    for (const zs of [-25, 25]) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 16), new THREE.MeshStandardMaterial({ color: 0x6b7f33, roughness: 1 }));
      s.rotation.x = -Math.PI / 2; s.position.set((x0 + x1) / 2, -0.05, zs); group.add(s);
    }
  }
  scene.add(group);
  return group;
}
