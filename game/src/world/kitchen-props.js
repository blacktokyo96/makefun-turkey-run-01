// Stage 3 scenery for Wishbone Getaway: wallpaper wall, counters, cabinets, fridges, chalkboards.
import * as THREE from 'three';
import { mulberry32, range } from '../core/random.js';
import { makeSignBoard, box, sphere, cone } from './prop-kit.js';
import { wallpaperTexture, signTexture } from './canvas-textures.js';
function chalkboard(lines, w = 4, h = 2.4) {
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), new THREE.MeshStandardMaterial({ map: signTexture(lines, { bg: '#2a3a2a', fg: '#f2e4c8' }), roughness: 0.9 }));
  board.position.y = 2.6; g.add(board);
  g.add(box(w + 0.3, 0.12, 0.14, 0x8a5a30, 0, 1.35, 0));
  return g;
}
export function buildKitchen(scene) {
  const g = new THREE.Group();
  const rng = mulberry32(123);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(400, 9, 0.6), new THREE.MeshStandardMaterial({ map: wallpaperTexture(), roughness: 0.95 }));
  wall.position.set(1000, 4.5, -8.5); g.add(wall);
  // Wainscot.
  g.add(box(400, 1.2, 0.7, 0xf2e4c8, 1000, 0.6, -8.4));
  // Counters with gaps for ovens (ovens sit at z -6.6, counters along the wall between them).
  for (let x = 820; x < 1190; x += 14) {
    g.add(box(9, 1.0, 1.6, 0x8a5a30, x, 0.5, -7.2));
    g.add(box(9, 0.1, 1.8, 0xd9c8a0, x, 1.05, -7.2));
  }
  // Upper cabinets.
  for (let x = 830; x < 1180; x += 22) g.add(box(10, 2.2, 1.2, 0x7a8a5a, x, 5.6, -7.8));
  // Fridges.
  for (const fx of [860, 1080]) {
    g.add(box(3, 4.5, 2, 0xd8dde2, fx, 2.25, -7.4));
    g.add(box(0.2, 1.2, 0.2, 0x888888, fx + 1.2, 2.6, -6.3));
  }
  // Copper pots hanging.
  for (let i = 0; i < 10; i++) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 0.5, 10), new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.8, roughness: 0.35, flatShading: true }));
    pot.position.set(830 + i * 38 + range(rng, -4, 4), 4.4, -7.6); pot.castShadow = true; g.add(pot);
  }
  // Windows showing autumn trees (front side, glowing).
  for (const wx of [900, 1000, 1100]) {
    const win = box(3, 2.4, 0.15, 0xffc860, wx, 4.5, 7.9);
    win.material = new THREE.MeshStandardMaterial({ color: 0xffc860, emissive: 0xff9a40, emissiveIntensity: 0.7 }); g.add(win);
    g.add(box(0.15, 2.4, 0.2, 0x8a5a30, wx, 4.5, 7.9));
    g.add(box(3, 0.15, 0.2, 0x8a5a30, wx, 4.5, 7.9));
  }
  const board1 = chalkboard(["TODAY'S MENU:", 'ROAST TURKEY', '(catch it first)']); board1.position.set(950, 0, -8.1); g.add(board1);
  const board2 = chalkboard(['NOVEMBER', 'THU 26', 'TURKEY DAY!']); board2.position.set(1150, 0, -8.1); g.add(board2);
  // Dining tables with pies at the front.
  for (const tx of [880, 980, 1080, 1160]) {
    g.add(box(4, 0.2, 2.4, 0x8a5a30, tx, 1.0, 5.5));
    for (const [dx, dz] of [[-1.6, -0.9], [1.6, -0.9], [-1.6, 0.9], [1.6, 0.9]]) g.add(box(0.18, 1.0, 0.18, 0x6b4423, tx + dx, 0.5, 5.5 + dz));
    const pie = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0xb24a2f, flatShading: true }));
    pie.position.set(tx, 1.2, 5.5); g.add(pie);
  }
  const sign = makeSignBoard(['BACK DOOR', 'WOODS · FREEDOM →']); sign.position.set(1180, 0, 7.5); sign.rotation.y = -0.6; g.add(sign);
  scene.add(g);
  return g;
}
