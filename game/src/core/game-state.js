// Game orchestration for Wishbone Getaway: renderer, state machine, events, draw.
import * as THREE from 'three';
import { TRACK, STAGES, TURKEY, FARMER, SCORING, stageAt, stageIndex } from './config.js';
import { buildLayout, zoneAt } from '../world/course-layout.js';
import { buildCourseMeshes } from '../world/course-meshes.js';
import { buildGround } from '../world/ground.js';
import { buildSkyLighting } from '../world/sky-lighting.js';
import { buildFarmyard } from '../world/farmyard-props.js';
import { buildBarn } from '../world/barn-props.js';
import { buildKitchen } from '../world/kitchen-props.js';
import { buildWoods } from '../world/woods-props.js';
import { Particles } from '../world/particles.js';
import { buildTurkey, poseTurkey } from '../actors/turkey-model.js';
import { buildFarmer, poseFarmer } from '../actors/farmer-model.js';
import { TurkeyController } from '../actors/turkey-controller.js';
import { FarmerAI } from '../actors/farmer-ai.js';
import { VisionCone } from '../actors/vision-cone.js';
import { KnifeThrower } from '../hazards/knife-thrower.js';
import { OvenBlast } from '../hazards/oven-blast.js';
import { KnifeSlider } from '../hazards/knife-slider.js';
import { Pickups } from '../items/pickups.js';
import { ScoreKeeper } from '../scoring/score-keeper.js';
import { CameraRig } from '../camera/camera-rig.js';
import { HudRenderer } from '../hud/hud-renderer.js';
import { SoundFX } from '../audio/sound-fx.js';
import { Music } from '../audio/music.js';
import { Input } from './input.js';
import { loadSave, storeSave } from './save-data.js';
import { clamp } from './math-utils.js';

export class Game {
  constructor(viewport, hudCanvas) {
    this.viewport = viewport;
    this.save = loadSave();
    this.input = new Input();
    this.sfx = new SoundFX();
    this.music = new Music(this.sfx);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewport.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 900);
    this.camera.position.set(-3, 9.6, 15.4);
    this.cameraRig = new CameraRig(this.camera);
    this.hud = new HudRenderer(hudCanvas);
    this.layout = buildLayout(1);
    this.sky = buildSkyLighting(this.scene);
    buildGround(this.scene);
    buildFarmyard(this.scene);
    buildBarn(this.scene);
    buildKitchen(this.scene);
    buildWoods(this.scene);
    const meshes = buildCourseMeshes(this.scene, this.layout);
    this.courseMeshes = meshes;
    this.turkeyMesh = buildTurkey();
    this.scene.add(this.turkeyMesh.group);
    this.farmerMesh = buildFarmer();
    this.scene.add(this.farmerMesh.group);
    this.vision = new VisionCone(this.scene);
    this.particles = new Particles(this.scene);
    this.turkey = new TurkeyController(this.layout);
    this.farmer = new FarmerAI();
    this.knives = new KnifeThrower(this.scene);
    this.ovens = new OvenBlast(this.scene, this.layout);
    this.ovens.attachMeshes(meshes.dynamic.ovens);
    this.sliders = new KnifeSlider(this.scene, this.layout);
    this.pickups = new Pickups(this.scene, this.layout);
    this.score = new ScoreKeeper();
    this.state = 'title';
    this.menuSel = 0;
    this.lives = 3; this.decoys = 2; this.cornSinceDecoy = 0;
    this.runTime = 0; this.time = 0; this.toasts = [];
    this.endKind = null; this.endLine = ''; this.tallyRows = []; this.totalScore = 0; this.rank = ''; this.newBest = false;
    this.stageBanner = '';
    this.frozen = false;
    this.autopilot = new URLSearchParams(location.search).get('auto') === '1';
    this.god = new URLSearchParams(location.search).get('god') === '1';
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('keydown', () => { this.sfx.markGesture(); this.sfx.unlock(); });
    window.addEventListener('mousedown', () => { this.sfx.markGesture(); this.sfx.unlock(); });
    // Title tableau: Pip beside the first haystack, farmer behind him to the right.
    const spot0 = this.layout.spots[0] || { x: 70, z: 0 };
    this.turkey.x = spot0.x + 3.5; this.turkey.z = spot0.z + 2; this.turkey.y = 0;
    this.farmer.x = spot0.x - 2; this.farmer.z = spot0.z + 4.5; this.farmer.mode = 'chase';
    this.syncMeshes();
  }
  resize() {
    const w = this.viewport.clientWidth || window.innerWidth;
    const h = this.viewport.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.hud.resize(w, h, Math.min(2, window.devicePixelRatio || 1));
  }
  syncMeshes() {
    this.turkeyMesh.group.position.set(this.turkey.x, this.turkey.y, this.turkey.z);
    this.farmerMesh.group.position.set(this.farmer.x, 0, this.farmer.z);
  }
  toast(text, color = '#ffd700', big = false, life = 1.8) { this.toasts.push({ text, color, big, life }); }
  startRun(practice = 0) {
    const startX = practice === 1 ? 402 : practice === 2 ? 802 : 2;
    this.turkey.reset(); this.turkey.x = startX;
    this.farmer.reset(startX);
    this.knives.clear();
    this.score.reset();
    // Restore pickups visibility for a fresh run.
    for (const it of this.pickups.items) { it.taken = false; it.mesh.visible = true; }
    this.lives = TURKEY.lives; this.decoys = 2; this.cornSinceDecoy = 0;
    this.runTime = 0; this.toasts = []; this.endKind = null; this.newBest = false;
    this.state = 'run';
    this.save.runs += 1; storeSave(this.save);
    this.music.setMenu(false); this.music.setStage(practice);
    this.sfx.unlock(); this.sfx.fanfare();
    this.toast('STAGE 1 · PUMPKIN PATCH', '#ffd700', true, 2.2);
    this.input.clearPresses();
  }
  loseFeather(reason) {
    if (this.god) return;
    if (this.turkey.invuln > 0) return;
    this.lives -= 1;
    this.turkey.hurt();
    this.sfx.hurt(); this.cameraRig.shake(0.7);
    this.particles.feathers(this.turkey.x, 1.2, this.turkey.z);
    this.toast('-1 FEATHER · ' + reason, '#ff6a5a', true, 2);
    if (this.lives <= 0) this.endRun('caught', reason);
  }
  endRun(kind, reason) {
    this.state = 'end'; this.endKind = kind;
    const si = stageIndex(this.turkey.x);
    const tally = this.score.tally(kind === 'escaped', this.lives, this.runTime);
    this.tallyRows = tally.rows; this.totalScore = tally.total; this.rank = tally.rank;
    // HUD SCORE must equal the results TOTAL on the end screen: fold the bonuses in.
    this.score.score = tally.total;
    this.newBest = tally.total > this.save.best;
    if (this.newBest) { this.save.best = tally.total; }
    if (kind === 'escaped') {
      this.save.escapes += 1;
      this.endLine = 'Pip is free-range at last — no oven this year.';
      this.sfx.escapeFanfare();
      this.turkey.cheer = true; this.turkey.x = 1284; this.turkey.z = 0; this.turkey.y = 0.7;
      this.farmer.x = 1272; this.farmer.z = 4; this.farmer.mode = 'gloat'; this.farmer.modeLabel = 'GLOAT'; this.farmer.quip = 'Next year, bird!';
      this.particles.confetti(1284, 3, 0);
      this.cameraRig.override = null;
    } else {
      this.endLine = reason + '. Dinner is served...';
      this.sfx.caughtSting();
      this.farmer.mode = 'gloat'; this.farmer.modeLabel = 'GLOAT'; this.farmer.quip = 'Dinner is SERVED!';
      this.farmer.x = this.turkey.x - 1.5; this.farmer.z = this.turkey.z;
    }
    storeSave(this.save);
    this.input.clearPresses();
  }
  handleEvents(events) {
    for (const e of events) {
      if (e.type === 'jump') this.sfx.jump();
      else if (e.type === 'flap') { this.sfx.flap(); this.particles.dust(this.turkey.x, 0.5, this.turkey.z); }
      else if (e.type === 'dash') { this.sfx.dash(); this.particles.dust(this.turkey.x, 0.3, this.turkey.z); }
      else if (e.type === 'hide') { this.sfx.hide(); this.toast('HIDDEN — hold still!', '#ffd700', false, 1.4); }
      else if (e.type === 'leaveHide') {
        const seen = this.farmerSeesTurkey();
        if (seen) { this.farmer.onSpotted(); this.sfx.spotted(); this.toast('SPOTTED!', '#ff6a5a', true); }
        else { this.farmer.onSneak(); this.score.event('sneak', this.turkey.x, this.turkey.z); this.sfx.sneak(); this.toast('SNEAKED AWAY!', '#7ec850', true); }
      }
      else if (e.type === 'bump') { this.sfx.bump(); this.cameraRig.shake(0.4); this.particles.dust(this.turkey.x, 0.4, this.turkey.z); this.toast(e.reason, '#ff8a7a', false, 1.4); }
      else if (e.type === 'grabbed') { this.toast('GRABBED! Pip wriggles free — RUN!', '#ff6a5a', true); this.loseFeather('Grabbed by Farmer Grimsby'); this.sfx.grabbed(); }
      else if (e.type === 'found') { this.toast('FOUND YOU!', '#ff6a5a', true); this.loseFeather('Found hiding in the ' + (e.spot ? e.spot.kind : 'hay')); this.turkey.hidden = false; this.turkey.hiddenSpot = null; }
      else if (e.type === 'throwKnife') { this.knives.throwFrom(this.farmer, e.targetZ, e.kitchen); this.sfx.knifeWarn(); this.farmer.mode = 'throw'; }
      else if (e.type === 'knifeFlying') this.sfx.knifeSwish();
      else if (e.type === 'knifeHit') this.loseFeather('Carved by a flying knife');
      else if (e.type === 'shave') { this.score.event('shave', this.turkey.x, this.turkey.z); this.sfx.shave(); this.toast('CLOSE SHAVE!', '#ffd700', true); }
      else if (e.type === 'ovenWarn') { this.sfx.ovenWarn(); this.toast('OVEN! stay out of the orange stripe', '#ff8a7a', false, 1.2); }
      else if (e.type === 'ovenBlast') this.sfx.ovenRoar();
      else if (e.type === 'ovenHit') this.loseFeather('Toasted by the oven');
      else if (e.type === 'sliderHit') this.loseFeather('Sliced at the carving station');
      else if (e.type === 'pickup') {
        if (e.kind === 'corn') {
          this.score.event('corn', e.x, e.z); this.sfx.corn();
          this.cornSinceDecoy++;
          if (this.cornSinceDecoy >= 10 && this.decoys < 3) { this.decoys++; this.cornSinceDecoy = 0; this.toast('+1 DECOY!', '#ffd700', false, 1.2); }
        } else if (e.kind === 'pie') {
          this.score.event('pie', e.x, e.z); this.sfx.pie();
          if (this.lives < 3) this.lives++;
          this.toast('PUMPKIN PIE · +1 FEATHER!', '#ffd700', true);
        } else if (e.kind === 'wishbone') {
          this.score.event('wishbone', e.x, e.z); this.sfx.wishbone();
          this.toast('GOLDEN WISHBONE!', '#ffd700', true);
        }
      }
    }
  }
  farmerSeesTurkey() {
    const d = Math.hypot(this.turkey.x - this.farmer.x, this.turkey.z - this.farmer.z);
    if (d > FARMER.gazeRange) return false;
    const ang = Math.atan2(this.turkey.z - this.farmer.z, this.turkey.x - this.farmer.x);
    const gaze = this.farmer.mode === 'search' ? this.farmer.gaze : ang;
    return Math.abs(ang - gaze) < FARMER.gazeHalfAngle || this.farmer.mode !== 'search';
  }
  aheadList() {
    const out = [];
    const x = this.turkey.x;
    for (const p of this.layout.pieces) {
      if (p.x < x + 2 || p.x > x + 70) continue;
      const d = Math.round(p.x - x);
      const label = { fence: 'FENCE (jump it)', pumpkin: 'PUMPKINS', mud: 'MUD (slow)', trough: 'WATER TROUGH', barrel: 'ROLLING BARREL', crate: 'CRATES', pitchfork: 'PITCHFORK', oven: 'OVEN BLAST', slider: 'CARVING STATION', gravy: 'GRAVY (slippery)', pot: 'STOCK POTS' }[p.type] || p.type.toUpperCase();
      out.push({ label, dist: d, danger: ['oven', 'slider', 'barrel'].includes(p.type), x: p.x });
    }
    for (const s of this.layout.spots) if (s.x > x + 2 && s.x < x + 70) out.push({ label: 'HIDE: ' + s.kind.toUpperCase(), dist: Math.round(s.x - x), danger: false, x: s.x });
    for (const it of this.pickups.items) {
      if (it.taken) continue;
      if (it.x > x + 2 && it.x < x + 70) {
        const label = it.kind === 'pie' ? 'PUMPKIN PIE +1' : it.kind === 'wishbone' ? 'GOLD WISHBONE' : null;
        if (label) out.push({ label, dist: Math.round(it.x - x), danger: false, x: it.x });
      }
    }
    out.sort((a, b) => a.x - b.x);
    return out.slice(0, 4);
  }
  hazardTags() {
    const tags = [];
    for (const o of this.layout.ovens) {
      if (Math.abs(o.x - this.turkey.x) > 34) continue;
      const st = this.ovens.ovens.find((oo) => oo.x === o.x);
      tags.push({ x: o.x, y: 2.8, z: -4, text: st && st.state === 'blast' ? 'OVEN BLAST!' : 'OVEN · 350°F', color: '#ff6a5a', big: st && st.state === 'blast' });
    }
    for (const s of this.layout.sliders) {
      if (Math.abs(s.x - this.turkey.x) > 30) continue;
      tags.push({ x: s.x, y: 1.8, z: (this.sliders.sliders.find((ss) => ss.x === s.x) || {}).zNow || 0, text: 'CARVING KNIFE', color: '#ff6a5a' });
    }
    for (const k of this.knives.knives) tags.push({ x: k.x + 2, y: 1.6, z: k.z, text: 'KNIFE!', color: '#ff2a1a', big: true });
    return tags;
  }
  hudState() {
    const si = stageIndex(this.turkey.x);
    return {
      state: this.state, score: this.score.score, combo: this.score.combo,
      turkeyX: this.turkey.x, turkeyZ: this.turkey.z, turkeyY: this.turkey.y,
      farmerX: this.farmer.x, farmerZ: this.farmer.z, farmerMode: this.farmer.modeLabel || 'CHASING',
      gap: Math.max(0, this.turkey.x - this.farmer.x), nextThrow: Math.max(0, this.farmer.throwTimer),
      knifeIncoming: this.knives.incoming, stageIndex: si, corn: this.score.corn, decoys: this.decoys,
      lives: this.lives, best: this.save.best, ahead: this.aheadList(),
      hidden: this.turkey.hidden, suspicion: this.farmer.suspicion, hiddenSpotKind: this.turkey.hiddenSpot ? this.turkey.hiddenSpot.kind : '',
      nearSpot: this.turkey.nearSpot || null, stamina: this.turkey.stamina, dashCd: this.turkey.dashCd,
      quip: this.farmer.quip, hazardTags: this.hazardTags(), popups: this.score.popups,
      toasts: this.toasts, menuSel: this.menuSel, sound: this.sfx.enabled,
      escapes: this.save.escapes, runs: this.save.runs,
      endKind: this.endKind, endLine: this.endLine, runTime: this.runTime, stageName: STAGES[si].name,
      tallyRows: this.tallyRows, totalScore: this.totalScore, rank: this.rank, newBest: this.newBest,
    };
  }
  clickToFloor(click) {
    // Ray from camera through NDC to y=0 plane.
    const v = new THREE.Vector3(click.ndcX, click.ndcY, 0.5).unproject(this.camera);
    const dir = v.sub(this.camera.position).normalize();
    if (Math.abs(dir.y) < 1e-4) return null;
    const t = -this.camera.position.y / dir.y;
    if (t < 0) return null;
    const p = this.camera.position.clone().add(dir.multiplyScalar(t));
    return { x: clamp(p.x, this.turkey.x - 30, this.turkey.x + 40), z: clamp(p.z, -TRACK.halfWidth, TRACK.halfWidth) };
  }
  handleClicks() {
    for (const c of this.input.takeClicks()) {
      this.sfx.unlock();
      if (this.state === 'title') {
        // Menu hit test in logical space.
        const scale = (this.hud.H || 640) / 640;
        const lx = c.x / scale, ly = c.y / scale;
        if (lx > 40 && lx < 420) {
          const idx = Math.floor((ly - 250) / 62);
          if (idx >= 0 && idx <= 3) { this.menuSel = idx; if (idx === 3) { this.sfx.enabled = !this.sfx.enabled; this.save.sound = this.sfx.enabled; storeSave(this.save); return; } }
        }
        this.startRun(this.menuSel === 1 ? 1 : this.menuSel === 2 ? 2 : 0);
        return;
      }
      if (this.state === 'end') { this.startRun(0); return; }
      if (this.state === 'run') {
        if (this.decoys <= 0) { this.toast('No decoys — peck 10 corn for one!', '#ff8a7a', false, 1.2); continue; }
        const pt = this.clickToFloor(c);
        if (!pt) continue;
        this.decoys--;
        const target = this.pickups.throwDecoy(pt);
        this.sfx.decoy();
        if (Math.hypot(target.x - this.farmer.x, target.z - this.farmer.z) < 25) this.farmer.onDecoy(target);
      }
    }
  }
  handleKeys() {
    if (this.input.pressed('Enter')) {
      if (this.state === 'title') this.startRun(this.menuSel === 1 ? 1 : this.menuSel === 2 ? 2 : 0);
      else if (this.state === 'end') this.startRun(0);
    }
    if (this.input.pressed('Digit1')) this.menuSel = 0;
    if (this.input.pressed('Digit2')) this.menuSel = 1;
    if (this.input.pressed('Digit3')) this.menuSel = 2;
    if (this.input.pressed('Digit4')) { this.menuSel = 3; this.sfx.enabled = !this.sfx.enabled; }
    if (this.input.pressed('ArrowUp') && this.state === 'title') this.menuSel = (this.menuSel + 3) % 4;
    if (this.input.pressed('ArrowDown') && this.state === 'title') this.menuSel = (this.menuSel + 1) % 4;
    if (this.input.pressed('KeyP')) {
      if (this.state === 'run') this.state = 'paused';
      else if (this.state === 'paused') this.state = 'run';
    }
    if (this.input.pressed('KeyR')) { if (this.state === 'run' || this.state === 'paused' || this.state === 'end') this.startRun(0); }
    if (this.input.pressed('Escape')) {
      if (this.state === 'run' || this.state === 'paused' || this.state === 'end') { this.state = 'title'; this.cameraRig.override = null; this.input.clearPresses(); }
    }
    // First key/click unlocks audio.
    if (this.input.pressQueue.length) this.sfx.unlock();
  }
  autopilotStep(dt) {
    const t = this.turkey;
    this.input.keys.add('KeyD');
    if (t.stamina > 0.4) this.input.keys.add('ShiftLeft'); else this.input.keys.delete('ShiftLeft');
    // Handle the NEAREST threat first: a fence gap steer must never block a closer jump/strafe.
    // (pieces are not strictly x-sorted within a step, so pick the minimum x, not the first match.)
    const nearest = (pred) => { let best = null; for (const p of this.layout.pieces) if (pred(p) && (!best || p.x < best.x)) best = p; return best; };
    const fence = nearest((p) => p.type === 'fence' && p.x > t.x && p.x < t.x + 14);
    const ahead = nearest((p) => p.x > t.x + 0.5 && p.x < t.x + 10 && p.type !== 'mud' && p.type !== 'gravy' && p.type !== 'oven' && p.type !== 'slider' && p.type !== 'fence' && Math.abs(t.z - (p.z || 0)) < ((p.d || 1) / 2) + 0.6);
    let targetZ = null;
    // A strafe target latches until the obstacle is passed: without the latch the
    // fence-gap steer yanks the turkey back into the trough's band mid-crossing.
    if (this._strafeLatch && t.x < this._strafeLatch.x) targetZ = this._strafeLatch.z;
    else this._strafeLatch = null;
    if (ahead && (!fence || ahead.x <= fence.x)) {
      const hd = (ahead.d || 1) / 2 + 0.55;
      const dist = ahead.x - t.x;
      const up = (ahead.z || 0) + hd + 0.8, down = (ahead.z || 0) - hd - 0.8;
      const strafeTarget = clamp(Math.abs(up - t.z) < Math.abs(down - t.z) ? up : down, -5.5, 5.5);
      const strafeClears = Math.abs(strafeTarget - (ahead.z || 0)) >= hd + 0.2;
      // Jump early enough to be over the top at the crossing; strafe out of the way otherwise.
      // At the track edge a strafe cannot clear the band — jump + flap over it instead.
      if (ahead.h <= 0.9 && dist > 3 && dist < 8 && t.grounded) { t.vy = TURKEY.jumpVel; t.grounded = false; }
      else if (ahead.h <= 0.9 && !strafeClears && t.grounded) { t.vy = TURKEY.jumpVel; t.grounded = false; this._flapTimer = 0.3; }
      else if (dist < 3 || ahead.h > 0.9) { targetZ = strafeTarget; this._strafeLatch = { x: ahead.x + 1.5, z: strafeTarget }; }
    } else if (fence && !this._strafeLatch) targetZ = fence.z;
    if (this._flapTimer > 0) {
      this._flapTimer -= dt;
      if (this._flapTimer <= 0 && !t.grounded && !t.flapped) { t.vy = TURKEY.flapVel; t.flapped = true; }
    }
    if (targetZ !== null && Math.abs(t.z - targetZ) > 0.25) {
      if (targetZ > t.z) { this.input.keys.add('KeyW'); this.input.keys.delete('KeyS'); }
      else { this.input.keys.add('KeyS'); this.input.keys.delete('KeyW'); }
    } else { this.input.keys.delete('KeyW'); this.input.keys.delete('KeyS'); }
    if (this.god) t.invuln = 999;
  }
  update(dt) {
    this.time += dt;
    for (const t of this.toasts) t.life -= dt;
    this.toasts = this.toasts.filter((t) => t.life > 0);
    this.music.update(dt, this.time);
    if (this.state === 'title') {
      this.music.setMenu(true);
      const t = this.time;
      this.cameraRig.override = { pos: [this.turkey.x - 6 + Math.sin(t * 0.12) * 2, 5.2, this.turkey.z + 11], look: [this.turkey.x + 1, 1.2, this.turkey.z - 1], fov: 50 };
      this.cameraRig.update(dt, this.turkey, false);
      poseTurkey(this.turkeyMesh, { mode: 'idle', speed: 0, y: this.turkey.y, stun: 0, hidden: false, airborne: false, dashing: false, cheer: false }, dt, t);
      this.turkeyMesh.group.position.set(this.turkey.x, this.turkey.y, this.turkey.z);
      poseFarmer(this.farmerMesh, { mode: 'chase' }, dt, t);
      this.farmerMesh.group.position.set(this.farmer.x, 0, this.farmer.z);
      this.particles.update(dt, 18, 0, 0);
      this.handleKeys(); this.handleClicks();
      this.input.clearPresses();
      return;
    }
    if (this.state === 'paused') { this.handleKeys(); this.input.clearPresses(); return; }
    if (this.state === 'end') {
      this.cameraRig.override = this.endKind === 'escaped'
        ? { pos: [1277, 3.6, 9], look: [1287, 1.4, -1], fov: 50 }
        : null;
      this.cameraRig.update(dt, this.turkey, false);
      poseTurkey(this.turkeyMesh, { mode: 'run', speed: 0, y: this.turkey.y, stun: this.endKind === 'caught' ? 1 : 0, hidden: false, airborne: false, dashing: false, cheer: this.endKind === 'escaped' }, dt, this.time);
      poseFarmer(this.farmerMesh, { mode: 'gloat' }, dt, this.time);
      this.syncMeshes();
      this.particles.update(dt, this.turkey.x, this.turkey.z, stageIndex(this.turkey.x));
      if (this.endKind === 'escaped' && Math.random() < dt * 2) this.particles.confetti(this.turkey.x, 3, this.turkey.z);
      this.handleKeys(); this.handleClicks();
      this.input.clearPresses();
      return;
    }
    // Run.
    if (this.autopilot) this.autopilotStep(dt);
    this.handleKeys(); this.handleClicks();
    const events = [];
    const prevStage = stageIndex(this.turkey.x);
    this.turkey.update(dt, this.input, events, { time: this.time, farmerSeesTurkey: this.farmerSeesTurkey() });
    this.runTime += dt;
    this.score.addDistance(Math.max(0, this.turkey.x - 2));
    this.score.update(dt);
    // Rolling barrels.
    for (const b of this.courseMeshes.dynamic.barrels) {
      const p = b.piece;
      if (!p.rolling && this.turkey.x > p.x - 42 && this.turkey.x < p.x) p.rolling = true;
      if (p.rolling) { p.x -= 5.5 * dt; b.mesh.position.x = p.x; b.mesh.rotation.z -= dt * 4; }
    }
    const stage = stageAt(this.turkey.x);
    this.farmer.update(dt, this.turkey, stage, events, { stageIndex: stageIndex(this.turkey.x) });
    this.knives.update(dt, this.turkey, events);
    this.ovens.update(dt, this.turkey, events, this.time);
    this.sliders.update(dt, this.time, this.turkey, events);
    this.pickups.update(dt, this.turkey, events, this.time);
    this.pickups.updateDecoys(dt);
    this.handleEvents(events);
    const si = stageIndex(this.turkey.x);
    if (si !== prevStage && this.state === 'run') {
      this.toast('STAGE ' + (si + 1) + ' · ' + STAGES[si].name, '#ffd700', true, 2.2);
      this.music.setStage(si); this.sfx.fanfare();
    }
    // Escape?
    if (this.turkey.x >= TRACK.finishX && this.state === 'run') { this.endRun('escaped', ''); return; }
    // Vision cone.
    const gazeAngle = this.farmer.mode === 'search' ? this.farmer.gaze : Math.atan2(this.turkey.z - this.farmer.z, this.turkey.x - this.farmer.x);
    this.vision.update(this.farmer.x, this.farmer.z, gazeAngle);
    this.vision.show();
    // Sync meshes + poses.
    this.syncMeshes();
    poseTurkey(this.turkeyMesh, { mode: 'run', speed: this.turkey.speed, y: this.turkey.y, stun: this.turkey.stun, hidden: this.turkey.hidden, airborne: this.turkey.airborne, dashing: this.turkey.dashing, cheer: false }, dt, this.time);
    poseFarmer(this.farmerMesh, { mode: this.farmer.mode }, dt, this.time);
    this.sky.update(this.turkey.x);
    this.particles.update(dt, this.turkey.x, this.turkey.z, si);
    if (this.turkey.hidden) this.particles.steam(this.turkey.x, 1.5, this.turkey.z);
    this.cameraRig.update(dt, this.turkey, this.turkey.hidden);
    this.input.clearPresses();
  }
  frame(dt) {
    if (this.frozen) {
      // Staged shot: no sim advance, but apply camera override, poses and the gaze cone.
      this.syncMeshes();
      poseTurkey(this.turkeyMesh, { mode: 'run', speed: this.turkey.speed, y: this.turkey.y, stun: this.turkey.stun, hidden: this.turkey.hidden, airborne: this.turkey.airborne, dashing: this.turkey.dashing, cheer: this.endKind === 'escaped' }, dt, this.time);
      poseFarmer(this.farmerMesh, { mode: this.farmer.mode }, dt, this.time);
      if (this.state === 'title') poseTurkey(this.turkeyMesh, { mode: 'idle', speed: 0, y: this.turkey.y, stun: 0, hidden: false, airborne: false, dashing: false, cheer: false }, dt, this.time);
      const gazeAngle = this.farmer.mode === 'search' ? this.farmer.gaze : Math.atan2(this.turkey.z - this.farmer.z, this.turkey.x - this.farmer.x);
      if (this.state !== 'title') this.vision.update(this.farmer.x, this.farmer.z, gazeAngle);
      this.cameraRig.update(dt, this.turkey, this.turkey.hidden);
      this.renderer.render(this.scene, this.camera); this.hud.render(this.hudState(), this.camera, this.time); return;
    }
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
    this.hud.render(this.hudState(), this.camera, this.time);
  }
}
