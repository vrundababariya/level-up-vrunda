export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatLong(d: Date = new Date()): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function dayOfYear(d: Date = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function last7(d: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(d);
    dt.setDate(dt.getDate() - i);
    out.push(todayKey(dt));
  }
  return out;
}

export function last30(d: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const dt = new Date(d);
    dt.setDate(dt.getDate() - i);
    out.push(todayKey(dt));
  }
  return out;
}

// Sunday-anchored week key.
export function weekKey(d: Date = new Date()): string {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() - dt.getDay());
  return todayKey(dt);
}

export function shortWeekday(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
  });
}
