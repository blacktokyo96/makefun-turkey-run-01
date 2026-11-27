// Wishbone Getaway entry (Node 22, standard library only): copies game/ and screenshots/ from
// beside this file into the output dir and writes /output/dossier.json with buildDossier.
// This program NEVER creates, deletes, chmods, chowns, renames or re-creates the output dir
// itself (/output or MAKEFUN_OUTPUT_DIR): it only writes files and subdirectories INSIDE it
// (cpSync(game -> out/game), cpSync(screenshots -> out/screenshots), writeFileSync(out/dossier.json)).
// The grader runs main.ts as uid 65534 and /output is a root-owned mountpoint, so touching it
// would fail the entry; cpSync creates the subfolders it needs.
import { cpSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
