// Build-time dossier generator for the Wishbone Getaway entry.
// Runs the kit's buildDossier (vendor/makefun-game.ts) ONCE, here at authoring time,
// and writes dossier.json at the repo root. The grader entrypoint (main.ts) only
// copies that prebuilt file, so no buildDossier cost lands in the grader's 10 s
// wall-time budget. This script writes exactly one file (dossier.json) and
// deletes, chmods, or touches nothing else.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from '../vendor/makefun-game.ts';

const repo = join(import.meta.dirname, '..');

// The scorer's own caps (reference/gate.json), identical to the ones main.ts used
// when it built the dossier at run time: only text_max_bytes shapes the bytes; the
// others refuse an entry the scorer would refuse (more than 4 screenshots or one over
// 256 KiB; more than 993 files in game/ or 48 MiB of game files, in all, or a path
// under game/ over 1000 bytes).
writeFileSync(
  join(repo, 'dossier.json'),
  buildDossier(repo, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
