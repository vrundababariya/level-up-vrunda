import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart,
  Line, CartesianGrid, ReferenceLine,
} from "recharts";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { BarChart3, Sun, Smile, Meh, CloudRain, BatteryLow } from "lucide-react";
import * as storage from "@/lib/storage";
import { last7, last30, shortWeekday } from "@/lib/date";
import { computeProgressFull, computeDayPct } from "@/lib/dayRollover";
import { emptySlate, MORNING_HABITS, EVENING_HABITS, type DailySlate, useStudyStore, useCustomHabitsStore } from "@/stores";
import { BODY_SYSTEMS, SYSTEM_MAP, type Subcategory } from "@/lib/foodDb";
import { MOODS } from "@/components/MoodPicker";

const MOOD_ICONS: Record<string, React.ComponentType<{ size: number; strokeWidth: number; className: string }>> = {
  amazing: Sun,
  good: Smile,
  okay: Meh,
  low: CloudRain,
  exhausted: BatteryLow,
};

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Level Up Girl" },
      { name: "description", content: "30 days of habits, water, study, mood, and nourishment." },
      { property: "og:title", content: "Analytics — Level Up Girl" },
      { property: "og:description", content: "30 days of habits, water, study, mood, and nourishment." },
      { property: "og:url", content: "/analytics" },
    ],
  }),
  component: AnalyticsPage,
});

const tickStyle = { fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--muted-foreground)" };

function AnalyticsPage() {
  const studyTaskCount = useStudyStore((s) => s.tasks.length);
  const customMorning = useCustomHabitsStore((s) => s.morning);
  const customEvening = useCustomHabitsStore((s) => s.evening);
  const customHabitIds = [...customMorning, ...customEvening].map((h) => h.id);
  const [recent, setRecent] = useState<Array<{ date: string; data: DailySlate }>>([]);

  useEffect(() => {
    const all = storage.listRecentDailies(30);
    setRecent(
      all.map((x) => ({
        date: x.date,
        data: { ...emptySlate(x.date), ...(x.data as Partial<DailySlate>) },
      })),
    );
  }, []);

  const hasData = recent.length > 0;

  // 7-day series
  const seven = last7();
  const habit7 = useMemo(
    () =>
      seven.map((d) => {
        const found = recent.find((r) => r.date === d);
        if (!found) return { date: d, day: shortWeekday(d)[0], pct: 0 };
        const studyDoneArr = [] as number[];
        // we can't know per-day study done; treat 0 here unless persisted
        const pct = computeProgressFull(found.data, 0, Math.max(1, studyTaskCount)).pct;
        void studyDoneArr;
        return { date: d, day: shortWeekday(d)[0], pct };
      }),
    [seven, recent, studyTaskCount],
  );

  const water7 = seven.map((d) => {
    const found = recent.find((r) => r.date === d);
    return { day: shortWeekday(d)[0], ml: found?.data.water ?? 0 };
  });

  const study7 = seven.map((d) => {
    const found = recent.find((r) => r.date === d);
    const total = Object.values(found?.data.studyTaskMinutesActual ?? {}).reduce((a, b) => a + b, 0);
    return { day: shortWeekday(d)[0], hours: +(total / 60).toFixed(1) };
  });

  // mood strip
  const mood7 = seven.map((d) => {
    const found = recent.find((r) => r.date === d);
    const m = MOODS.find((mm) => mm.id === found?.data.mood);
    return { date: d, day: shortWeekday(d)[0], moodId: m?.id ?? null };
  });

  // body system coverage 7-day avg
  const systemAvg = BODY_SYSTEMS.map((s) => {
    let count = 0;
    let total = 0;
    for (const d of seven) {
      const r = recent.find((x) => x.date === d);
      total++;
      if (!r) continue;
      const want = SYSTEM_MAP[s.id];
      const foodTags = r.data.meals.flatMap(m => m.tags);
      const hasMatch = want.some(tag => foodTags.includes(tag as Subcategory));
      if (hasMatch) count++;
    }
    return { label: s.label, pct: total ? Math.round((count / total) * 100) : 0 };
  });

  // 30-day heatmap — compute real pct per day
  const thirty = last30();
  const heatmap = thirty.map((d) => {
    const found = recent.find((r) => r.date === d);
    return { date: d, pct: found ? computeDayPct(found.data, customHabitIds) : 0 };
  });

  // strongest day of week
  const dayBuckets: Record<string, { sum: number; n: number }> = {};
  for (const r of recent) {
    const wd = new Date(r.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long" });
    const p = computeDayPct(r.data, customHabitIds);
    dayBuckets[wd] ??= { sum: 0, n: 0 };
    dayBuckets[wd].sum += p;
    dayBuckets[wd].n++;
  }
  const strongest = Object.entries(dayBuckets)
    .map(([k, v]) => ({ day: k, avg: v.n ? v.sum / v.n : 0 }))
    .sort((a, b) => b.avg - a.avg)[0];

  // most skipped habit
  const skipCount: Record<string, { name: string; n: number }> = {};
  for (const h of [...MORNING_HABITS, ...EVENING_HABITS]) skipCount[h.id] = { name: h.name, n: 0 };
  for (const r of recent) {
    for (const h of [...MORNING_HABITS, ...EVENING_HABITS]) {
      if (!r.data.habits[h.id]) skipCount[h.id].n++;
    }
  }
  const mostSkipped = Object.values(skipCount).sort((a, b) => b.n - a.n)[0];

  if (!hasData) {
    return (
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12">
        <header className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl">Analytics</h1>
        </header>
        <EmptyState icon={BarChart3} message="Your journey is just beginning. Check back after a few days." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12 space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">Analytics</h1>
        <p className="font-display italic text-[var(--muted-foreground)] mt-1">
          The quiet story of your last thirty days.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <h3 className="text-sm font-medium mb-3">Habit completion (7 days)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habit7}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="pct" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium mb-3">Water intake (7 days)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={water7}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip />
                <ReferenceLine y={2500} stroke="var(--accent)" strokeDasharray="4 4" label={{ value: "Goal", fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Line type="monotone" dataKey="ml" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h3 className="text-sm font-medium mb-3">30-day consistency</h3>
          <div className="grid grid-cols-7 gap-1.5">
            {heatmap.map((d) => {
              const today = thirty[thirty.length - 1] === d.date;
              const intensity = d.pct / 100;
              const bg = intensity > 0
                ? `color-mix(in oklab, var(--primary) ${Math.max(15, Math.round(intensity * 100))}%, var(--background))`
                : "var(--border)";
              return (
                <div
                  key={d.date}
                  title={`${d.date} — ${d.pct}%`}
                  className="aspect-square rounded-md"
                  style={{
                    background: bg,
                    outline: today ? "2px solid var(--primary)" : "none",
                    outlineOffset: today ? "1px" : 0,
                  }}
                />
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium mb-3">Study hours (7 days)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={study7}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="hours" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium mb-3">Mood — last 7 days</h3>
          <div className="flex gap-2 mt-2">
            {mood7.map((m) => {
              const IconComponent = m.moodId ? MOOD_ICONS[m.moodId] : null;
              return (
                <div key={m.date} className="flex-1 flex flex-col items-center gap-2">
                  {IconComponent ? (
                    <IconComponent size={28} strokeWidth={1.5} className="text-[var(--primary)]" />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-[var(--border)] inline-block" />
                  )}
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{m.day}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h3 className="text-sm font-medium mb-3">Body system coverage (7-day avg %)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={systemAvg} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis type="category" dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} width={130} />
                <Tooltip />
                <Bar dataKey="pct" fill="var(--success)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {strongest && (
          <Card>
            <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
              Strongest day of week
            </p>
            <p className="font-display text-3xl mt-2">{strongest.day}</p>
            <p className="font-mono text-xs text-[var(--muted-foreground)] mt-1">
              avg {Math.round(strongest.avg)}% completion
            </p>
          </Card>
        )}

        {mostSkipped && mostSkipped.n > 0 && (
          <Card>
            <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
              Most skipped habit
            </p>
            <p className="font-display text-2xl mt-2">{mostSkipped.name}</p>
            <p className="font-mono text-xs text-[var(--muted-foreground)] mt-1">
              skipped {mostSkipped.n} times
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
