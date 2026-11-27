// Oven warn/blast cycle for Wishbone Getaway: flickering window, orange stripe, fire jet.
import * as THREE from 'three';
import { HAZARDS } from '../core/config.js';
import { makeFireJet, makeWarningStripe } from './hazard-models.js';
export class OvenBlast {
  constructor(scene, layout) {
    this.scene = scene;
    this.ovens = layout.ovens.map((o, i) => {
      const jet = makeFireJet();
      jet.position.set(o.x, 0.6, -6.6);
      scene.add(jet);
      const zEnd = o.long ? 3.6 : -0.5;
      const stripe = makeWarningStripe(zEnd + 6.6);
      stripe.visible = false;
      stripe.rotation.z = Math.PI / 2; // long axis along z, from the oven to its reach
      stripe.position.set(o.x, 0.06, (-6.6 + zEnd) / 2);
      scene.add(stripe);
      return { ...o, jet, stripe, mesh: null, hitDone: false };
    });
  }
  attachMeshes(meshes) { this.ovens.forEach((o, i) => { o.mesh = meshes[i] || null; }); }
  forceState(i, state, t = 0) { if (this.ovens[i]) { this.ovens[i].state = state; this.ovens[i].t = t; } }
  update(dt, turkey, events, time) {
    for (const o of this.ovens) {
      o.t += dt;
      const near = Math.abs(turkey.x - o.x) < 45; // ovens cycle everywhere, but only warn the player when close
      if (o.state === 'idle' && o.t > HAZARDS.ovenIdle) { o.state = 'warn'; o.t = 0; if (near) events.push({ type: 'ovenWarn', oven: o }); }
      else if (o.state === 'warn' && o.t > HAZARDS.ovenWarn) { o.state = 'blast'; o.t = 0; o.hitDone = false; if (near) events.push({ type: 'ovenBlast', oven: o }); }
      else if (o.state === 'blast' && o.t > HAZARDS.ovenBlast) { o.state = 'idle'; o.t = 0; }
      const warn = o.state === 'warn', blast = o.state === 'blast';
      o.stripe.visible = warn || blast;
      o.stripe.material.opacity = warn ? 0.3 + 0.25 * Math.sin(time * 14) : 0.55;
      if (o.mesh && o.mesh.userData.windowMat) o.mesh.userData.windowMat.emissiveIntensity = blast ? 2.2 : warn ? (1 + Math.sin(time * 20)) : 0.4;
      // Fire jet: tumbling icosahedra along +z to the reach.
      const parts = o.jet.userData.parts;
      const reach = o.reach; // -0.5 short (z from -6.6 to -0.5? actually reach is z target) — use z extent
      const zEnd = o.long ? 3.6 : -0.5;
      parts.forEach((p, i) => {
        p.visible = blast;
        if (!blast) return;
        const f = (i / parts.length + time * 2.2) % 1;
        // Local coords: jet group sits at z -6.6, fire runs along +z to the reach.
        p.position.set(Math.sin(i * 2.4 + time * 5) * 0.5, 0.5 + Math.sin(i * 1.7) * 0.35 + f * 0.4, 0.6 + f * (zEnd + 6.6 - 0.6));
        p.rotation.x += dt * 6; p.rotation.y += dt * 4;
        p.scale.setScalar(0.6 + f * 0.9);
      });
      if (blast && !o.hitDone && turkey.y < 1.7 && Math.abs(turkey.x - o.x) < HAZARDS.ovenBand && turkey.z > -6.6 && turkey.z < zEnd && !turkey.hidden && turkey.invuln <= 0) {
        o.hitDone = true; events.push({ type: 'ovenHit', oven: o });
      }
    }
  }
}
