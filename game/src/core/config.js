// Tuning and names for Wishbone Getaway: one job, every number the game uses.
export const TITLE = 'WISHBONE GETAWAY';
export const TAGLINE = 'Pip the turkey vs. Farmer Grimsby — one day before Thanksgiving';
export const TURKEY_NAME = 'PIP';
export const FARMER_NAME = 'FARMER GRIMSBY';
export const TRACK = { halfWidth: 6, stageLength: 400, finishX: 1200, woodsEnd: 1290 };
export const STAGES = [
  { id: 'patch', name: 'PUMPKIN PATCH', from: 0, to: 400, farmerSpeed: 9.0, throwMin: 5.5, throwMax: 7.5, blurb: 'Fences, pumpkins and mud.', sky: 0xf2a65a, ground: 0x7d8f3e },
  { id: 'barn', name: 'RED BARN', from: 400, to: 800, farmerSpeed: 9.5, throwMin: 4.2, throwMax: 6.0, blurb: 'Barrels, hay lofts, rooster.', sky: 0xe89a4a, ground: 0x8a5a30 },
  { id: 'kitchen', name: 'GRIMSBY KITCHEN', from: 800, to: 1200, farmerSpeed: 10.0, throwMin: 3.0, throwMax: 4.6, blurb: 'Ovens, knives, gravy slicks.', sky: 0xd98a52, ground: 0xb24a2f },
];
export const TURKEY = { run: 9.4, sprint: 13.2, ease: 6.0, strafe: 8.5, jumpVel: 7.6, flapVel: 5.2, gravity: 22, glideGravity: 9, dashSpeed: 22, dashTime: 0.32, dashCooldown: 2.4, staminaDrain: 0.28, staminaRegen: 0.16, stun: 0.55, invuln: 1.5, radius: 0.55, lives: 3, maxLives: 3 };
export const FARMER = { startGap: 11, catchGap: 1.25, knockbackGap: 9, catchup: 3.2, catchupGap: 18, lungeGap: 3.2, lungeTime: 0.6, lungeBonus: 6, gazeRange: 9, gazeHalfAngle: 0.5, gazeSweep: 1.25, gazeSweepRange: 1.35, knifeWarn: 0.9, knifeSpeed: 27, knifeHitRadius: 0.62, knifeHeight: 0.55, searchSpeed: 5, searchRange: 4.5, spotBonus: 2.2, spotBonusTime: 3 };
export const HAZARDS = { ovenIdle: 2.6, ovenWarn: 1.0, ovenBlast: 1.25, ovenShortReach: -0.5, ovenLongReach: 3.6, ovenBand: 1.15, sliderPeriod: 2.4, sliderHeight: 0.5, barrelSpeed: 5.5, shaveDist: 1.5 };
export const SCORING = { perMetre: 1, corn: 10, shave: 50, sneak: 150, wishbone: 500, pie: 100, escapeBonus: 2000, featherBonus: 500, timeBonusPerSec: 15, timePar: 140 };
export const RANKS = [
  { min: 9000, name: 'FREE-RANGE LEGEND' },
  { min: 6500, name: 'WILD TURKEY' },
  { min: 4000, name: 'SLIPPERY GOBBLER' },
  { min: 0, name: 'LUCKY LEFTOVER' },
];
export const PALETTE = { skyTop: '#f2a65a', skyBottom: '#6b8fc7', fog: 0xe8b07a, fogNear: 70, fogFar: 190, grass: 0x7d8f3e, barnRed: 0xa8322d, hay: 0xe3b84f, pumpkin: 0xe8741e, leaf1: 0xd9481c, leaf2: 0xf0a020, leaf3: 0x9c2f1a, tileCream: 0xf2e4c8, tileTerra: 0xb24a2f, panel: 'rgba(42,21,9,0.84)', panelBorder: '#f0a020', cream: '#ffeec2', gold: '#f0a020', orange: '#ff7a1a', red: '#e23b2e', green: '#7ec850' };
export const CONTROLS_HELP = 'W/S or Up/Down dodge · D/Right sprint · A/Left ease off · SPACE jump, again to flap · SHIFT dash · E hide/sneak out · CLICK corn decoy · P pause · R retry · ESC title';
export const QUIPS = ['Come back here, dinner!', 'Gravy waits for no bird!', 'Get in the roasting pan, Pip!', "Oven's preheated!", 'Here, turkey turkey...', 'Next year, bird!'];
export function rankFor(score) { for (const r of RANKS) if (score >= r.min) return r.name; return RANKS[RANKS.length - 1].name; }
export function stageAt(x) { if (x < 400) return STAGES[0]; if (x < 800) return STAGES[1]; return STAGES[2]; }
export function stageIndex(x) { return x < 400 ? 0 : x < 800 ? 1 : 2; }
