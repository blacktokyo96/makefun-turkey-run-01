// Best score, escapes and runs for Wishbone Getaway: localStorage inside try/catch.
const KEY = 'wishbone-getaway-v1';
export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { best: 0, escapes: 0, runs: 0, sound: true };
    const d = JSON.parse(raw);
    return { best: d.best | 0, escapes: d.escapes | 0, runs: d.runs | 0, sound: d.sound !== false };
  } catch { return { best: 0, escapes: 0, runs: 0, sound: true }; }
}
export function storeSave(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* storage unavailable, play on */ }
}
