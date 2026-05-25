// Single source of truth for persistence.
// Now uses Supabase for cloud sync across devices.
// localStorage is used as a fast local cache.

import { supabase, USER_ID } from "./supabase";

const NS = "levelupgirl_";
const DAILY_PREFIX = `${NS}daily_`;
const MAX_DAYS = 30;

const isBrowser = () => typeof window !== "undefined";

// ─── local cache helpers ───────────────────────────────────────────────────

function lsGet<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function lsSet<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─── key/value store (streaks, settings, study tasks etc.) ────────────────

export function get<T>(key: string): T | null {
  // read from local cache first (fast, works offline)
  return lsGet<T>(NS + key);
}

export function set<T>(key: string, value: T): void {
  // write to local cache immediately
  lsSet(NS + key, value);
  // sync to Supabase in background (don't await — non-blocking)
  supabase
    .from("kv_store")
    .upsert({ user_id: USER_ID, key: NS + key, value: JSON.stringify(value) })
    .then(() => {})
    .catch(() => {});
}

export function remove(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(NS + key);
  supabase
    .from("kv_store")
    .delete()
    .eq("user_id", USER_ID)
    .eq("key", NS + key)
    .then(() => {})
    .catch(() => {});
}

// ─── daily logs ────────────────────────────────────────────────────────────

export type DailyData = Record<string, unknown>;

function dailyKeyFull(date: string) {
  return DAILY_PREFIX + date;
}

export function getDaily<T = DailyData>(date: string): T | null {
  return lsGet<T>(dailyKeyFull(date));
}

export function setDaily(date: string, patch: DailyData): void {
  if (!isBrowser()) return;
  const existing = getDaily(date) ?? {};
  const merged = { ...existing, ...patch };
  lsSet(dailyKeyFull(date), merged);

  // sync to Supabase in background
  supabase
    .from("daily_logs")
    .upsert({
      user_id: USER_ID,
      date,
      data: merged,
      updated_at: new Date().toISOString(),
    })
    .then(() => {})
    .catch(() => {});

  pruneOldDailies();
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
    } catch {}
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

// ─── sync FROM Supabase to localStorage (call on app start) ───────────────
// This pulls cloud data into local cache so offline still works.

export async function syncFromCloud(): Promise<void> {
  try {
    // sync kv_store
    const { data: kvData } = await supabase
      .from("kv_store")
      .select("key, value")
      .eq("user_id", USER_ID);

    if (kvData) {
      for (const row of kvData) {
        try {
          lsSet(row.key, JSON.parse(row.value));
        } catch {}
      }
    }

    // sync last 30 daily logs
    const { data: dailyData } = await supabase
      .from("daily_logs")
      .select("date, data")
      .eq("user_id", USER_ID)
      .order("date", { ascending: false })
      .limit(30);

    if (dailyData) {
      for (const row of dailyData) {
        lsSet(dailyKeyFull(row.date), row.data);
      }
    }
  } catch {
    // offline or error — local cache still works
  }
}
