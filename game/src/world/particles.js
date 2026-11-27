// Pooled particles for Wishbone Getaway: leaves, feathers, dust, steam, confetti.
import * as THREE from 'three';
import { mulberry32 } from '../core/random.js';
export class Particles {
  constructor(scene) {
    this.scene = scene;
    this.pool = [];
    const geo = new THREE.PlaneGeometry(0.22, 0.22);
    for (let i = 0; i < 220; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }));
      m.visible = false; scene.add(m);
      this.pool.push({ mesh: m, life: 0, max: 1, vx: 0, vy: 0, vz: 0, spin: 0, grav: 0 });
    }
    this.leafTimer = 0;
  }
  clear() { for (const p of this.pool) { p.life = 0; p.mesh.visible = false; } }
  spawn(x, y, z, color, n, opt = {}) {
    const rnd = opt.rng || Math.random;
    let c = 0;
    for (const p of this.pool) {
      if (p.life > 0) continue;
      p.life = p.max = opt.life || 1.2;
      p.mesh.visible = true; p.mesh.material.color.setHex(color);
      p.mesh.position.set(x + (rnd() - 0.5) * (opt.spread || 0.6), y + (rnd() - 0.5) * 0.4, z + (rnd() - 0.5) * (opt.spread || 0.6));
      p.vx = (rnd() - 0.5) * (opt.v || 2); p.vy = opt.vy ?? (rnd() * 2); p.vz = (rnd() - 0.5) * (opt.v || 2);
      p.spin = (rnd() - 0.5) * 8; p.grav = opt.grav ?? -3;
      if (++c >= n) break;
    }
  }
  leaves(x, z, color) { this.spawn(x + (Math.random() - 0.5) * 20, 4 + Math.random() * 3, z + (Math.random() - 0.5) * 14, color, 1, { life: 4, vy: -0.7, v: 1, grav: -0.4, spread: 0 }); }
  feathers(x, y, z) { this.spawn(x, y, z, 0xffeec2, 10, { life: 1.4, vy: 1.5, v: 3, grav: -1.5 }); }
  dust(x, y, z) { this.spawn(x, y, z, 0xc9a86a, 6, { life: 0.7, vy: 0.5, v: 1.5, grav: 0 }); }
  steam(x, y, z) { this.spawn(x, y, z, 0xeeeeee, 2, { life: 1.6, vy: 1.2, v: 0.4, grav: 0.4 }); }
  confetti(x, y, z, seed, spread) {
    // A seed makes the burst deterministic: staged screenshots must retake
    // byte-identical. Live play calls it without a seed (Math.random).
    // spread widens the initial cloud: frozen staged shots never advance the
    // particles, so a tight burst would read as one coloured blob.
    const cols = [0xff2a1a, 0xffd23e, 0x7ec850, 0x4a8ab8];
    const rng = seed === undefined ? undefined : mulberry32(seed);
    for (let i = 0; i < 4; i++) this.spawn(x, y, z, cols[i % 4], 12, { life: 2.2, vy: 4, v: 4, grav: -4, rng, spread: spread || 0.6 });
  }
  update(dt, turkeyX, turkeyZ, stageIndex) {
    this.leafTimer -= dt;
    if (this.leafTimer <= 0 && stageIndex < 2) { this.leafTimer = 0.25; this.leaves(turkeyX + 10, turkeyZ, [0xd9481c, 0xf0a020, 0x9c2f1a][Math.floor(Math.random() * 3)]); }
    for (const p of this.pool) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.mesh.visible = false; continue; }
      p.vy += p.grav * dt;
      p.mesh.position.x += p.vx * dt; p.mesh.position.y += p.vy * dt; p.mesh.position.z += p.vz * dt;
      p.mesh.rotation.x += p.spin * dt; p.mesh.rotation.y += p.spin * dt;
      p.mesh.material.opacity = Math.min(1, p.life / (p.max * 0.5));
    }
  }
}
