// Single source of truth for persistence.
// Swap this file's body to Firestore later — keep the same surface.

const NS = "levelupgirl_";
const DAILY_PREFIX = `${NS}daily_`;
const MAX_DAYS = 30;

const isBrowser = () => typeof window !== "undefined";

export function get<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(NS + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function set<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    // quota or serialization failure — silently ignore
  }
}

export function remove(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(NS + key);
}

export type DailyData = Record<string, unknown>;

function dailyKeyFull(date: string) {
  return DAILY_PREFIX + date;
}

export function getDaily<T = DailyData>(date: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(dailyKeyFull(date));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setDaily(date: string, patch: DailyData): void {
  if (!isBrowser()) return;
  const existing = getDaily(date) ?? {};
  const merged = { ...existing, ...patch };
  try {
    window.localStorage.setItem(dailyKeyFull(date), JSON.stringify(merged));
    pruneOldDailies();
  } catch {
    // ignore
  }
}

export function listRecentDailies(
  n: number,
): Array<{ date: string; data: DailyData }> {
  if (!isBrowser()) return [];
  const out: Array<{ date: string; data: DailyData }> = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k || !k.startsWith(DAILY_PREFIX)) continue;
    const date = k.slice(DAILY_PREFIX.length);
    try {
      const data = JSON.parse(window.localStorage.getItem(k) || "{}");
      out.push({ date, data });
    } catch {
      // skip
    }
  }
  out.sort((a, b) => (a.date < b.date ? 1 : -1));
  return out.slice(0, n);
}

function pruneOldDailies() {
  const all = listRecentDailies(9999);
  if (all.length <= MAX_DAYS) return;
  for (const old of all.slice(MAX_DAYS)) {
    window.localStorage.removeItem(dailyKeyFull(old.date));
  }
}
