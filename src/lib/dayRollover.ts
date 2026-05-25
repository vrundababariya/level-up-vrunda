import * as storage from "./storage";
import { todayKey } from "./date";
import {
  emptySlate,
  MORNING_HABITS,
  EVENING_HABITS,
  NO_RULES,
  SELF_CARE_ITEMS,
  type DailySlate,
} from "@/stores";

export const SELF_CARE_TRACKABLE = ["am_skin", "pm_skin", "body", "meditation", "book"];

// Compute a day's progress purely from a stored daily slate (habits + noRules + selfCare).
// Used by MiniWeekDots, analytics heatmap, and rollover.
export function computeDayPct(
  data: Partial<DailySlate>,
  customHabitIds: string[] = [],
): number {
  const habitIds = [...MORNING_HABITS, ...EVENING_HABITS].map((h) => h.id);
  const allHabitIds = [...habitIds, ...customHabitIds];
  let checked = 0;
  const habits = data.habits ?? {};
  for (const id of allHabitIds) if (habits[id]) checked++;
  const noRules = data.noRules ?? {};
  for (const r of NO_RULES) if (noRules[r.id]) checked++;
  const selfCare = data.selfCare ?? {};
  for (const s of SELF_CARE_TRACKABLE) if (selfCare[s]) checked++;
  const total = allHabitIds.length + NO_RULES.length + SELF_CARE_TRACKABLE.length;
  return total ? Math.round((checked / total) * 100) : 0;
}

// Count of all "trackable" items for a slate. Used for the 80% streak rule + progress bar.
export function computeProgress(
  slate: DailySlate,
  studyTaskCount: number,
  customHabitCount = 0,
): { checked: number; total: number; pct: number } {
  const habitIds = [...MORNING_HABITS, ...EVENING_HABITS].map((h) => h.id);
  let checked = 0;
  for (const id of habitIds) if (slate.habits[id]) checked++;
  // custom habit toggled state lives in slate.habits as well
  let customChecked = 0;
  for (const k of Object.keys(slate.habits)) {
    if (!habitIds.includes(k) && slate.habits[k]) customChecked++;
  }
  checked += customChecked;

  const studyTotal = Math.max(1, studyTaskCount);

  for (const r of NO_RULES) if (slate.noRules[r.id]) checked++;
  for (const s of SELF_CARE_TRACKABLE) if (slate.selfCare[s]) checked++;

  const total =
    MORNING_HABITS.length +
    EVENING_HABITS.length +
    customHabitCount +
    studyTotal +
    NO_RULES.length +
    SELF_CARE_TRACKABLE.length;

  return {
    checked,
    total,
    pct: total ? Math.round((checked / total) * 100) : 0,
  };
}

// Full progress including study done
export function computeProgressFull(
  slate: DailySlate,
  studyTasksDone: number,
  studyTaskCount: number,
  customHabitCount = 0,
): { checked: number; total: number; pct: number } {
  const base = computeProgress(slate, studyTaskCount, customHabitCount);
  const checked = base.checked + studyTasksDone;
  return {
    checked,
    total: base.total,
    pct: base.total ? Math.round((checked / base.total) * 100) : 0,
  };
}

const LAST_ACTIVE_KEY = "lastActiveDate";

export function runDayRollover() {
  if (typeof window === "undefined") return;
  const today = todayKey();
  const last = storage.get<string>(LAST_ACTIVE_KEY);
  if (last === today) return;

  if (last && last !== today) {
    // Recompute streaks based on yesterday's archive
    const yesterdayData = storage.getDaily<DailySlate>(last);
    if (yesterdayData) {
      const studyTasks = storage.get<Array<{ status: string }>>("study") ?? [];
      const studyDone = studyTasks.filter((t) => t.status === "done").length;
      const customHabits = storage.get<{ morning?: Array<{ id: string }>; evening?: Array<{ id: string }> }>("custom_habits") ?? {};
      const customCount = (customHabits.morning?.length ?? 0) + (customHabits.evening?.length ?? 0);
      const { pct } = computeProgressFull(
        { ...emptySlate(last), ...yesterdayData },
        studyDone,
        studyTasks.length,
        customCount,
      );

      const streaks = storage.get<{
        current?: number;
        longest?: number;
        workoutCurrent?: number;
        workoutLongest?: number;
        noRules?: Record<string, { current: number; longest: number }>;
      }>("streaks") ?? {};

      const current = pct >= 80 ? (streaks.current ?? 0) + 1 : 0;
      const longest = Math.max(streaks.longest ?? 0, current);

      // workout streak
      const workoutCurrent = yesterdayData.workoutDone
        ? (streaks.workoutCurrent ?? 0) + 1
        : 0;
      const workoutLongest = Math.max(streaks.workoutLongest ?? 0, workoutCurrent);

      // no-rules streaks
      const noRules = { ...(streaks.noRules ?? {}) } as Record<
        string,
        { current: number; longest: number }
      >;
      for (const r of NO_RULES) {
        const prev = noRules[r.id] ?? { current: 0, longest: 0 };
        const cur = yesterdayData.noRules?.[r.id] ? prev.current + 1 : 0;
        noRules[r.id] = { current: cur, longest: Math.max(prev.longest, cur) };
      }

      storage.set("streaks", {
        current,
        longest,
        workoutCurrent,
        workoutLongest,
        noRules,
      });
    }
  }

  storage.set(LAST_ACTIVE_KEY, today);
}
