// Small helpers so a blocked/empty localStorage never crashes the app.
export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
export const todayKey = () => new Date().toISOString().slice(0, 10);
