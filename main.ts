// Wishbone Getaway entry (Node 22, standard library only): copies the prebuilt game
// into the output dir. dossier.json is built at authoring time by
// tools/make-dossier.ts with buildDossier from the kit (vendor/makefun-game.ts),
// never here, so the grader's 10 s budget is spent on copies, not on building it.
// The gate rebuilds the dossier from /output with the same tool and compares it
// byte for byte against dossier.json.
// This program NEVER creates, deletes, chmods, chowns, renames or re-creates the
// output dir itself (/output or MAKEFUN_OUTPUT_DIR): it only writes files and
// subdirectories INSIDE it. The grader runs main.ts as uid 65534 and /output is a
// root-owned mountpoint, so touching it would fail the entry; cpSync creates the
// subfolders it needs.
import { copyFileSync, cpSync } from 'node:fs';
import { join } from 'node:path';

const repo = import.meta.dirname;
const out = process.env.MAKEFUN_OUTPUT_DIR || '/output';

cpSync(join(repo, 'game'), join(out, 'game'), { recursive: true });
cpSync(join(repo, 'screenshots'), join(out, 'screenshots'), { recursive: true });
copyFileSync(join(repo, 'dossier.json'), join(out, 'dossier.json'));
