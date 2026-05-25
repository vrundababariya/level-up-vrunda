import { createFileRoute } from "@tanstack/react-router";
import { Plus, Minus, Droplet, Moon, Dumbbell, Candy, Salad, Sparkles } from "lucide-react";
import { Card } from "@/components/Card";
import { WaterBottle } from "@/components/WaterBottle";
import { MiniBar7Day } from "@/components/MiniBar7Day";
import { useDailyStore, useStreaksStore } from "@/stores";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/_app/health")({
  head: () => ({
    meta: [
      { title: "Health Tracker — Level Up Girl" },
      { name: "description", content: "Water, sleep, movement, and daily food choices." },
      { property: "og:title", content: "Health Tracker — Level Up Girl" },
      { property: "og:description", content: "Water, sleep, movement, and daily food choices." },
      { property: "og:url", content: "/health" },
    ],
  }),
  component: HealthPage,
});

function timeDiffHrs(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}

function HealthPage() {
  const slate = useDailyStore((s) => s.slate);
  const addWater = useDailyStore((s) => s.addWater);
  const patch = useDailyStore((s) => s.patch);
  const workoutStreak = useStreaksStore((s) => s.workoutCurrent);
  const [sparkle, setSparkle] = useState(false);

  const sleepHrs = timeDiffHrs(slate.sleepAt, slate.wokeAt);
  const sleepColor = sleepHrs >= 7 ? "var(--success)" : sleepHrs >= 6 ? "#d4a432" : "#c45a4a";

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12 space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">Health Tracker</h1>
        <p className="font-display italic text-[var(--muted-foreground)] mt-1">
          Every small choice counts.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Water */}
        <Card>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            <Droplet size={14} strokeWidth={1.5} /> Water
          </div>
          <div className="flex items-center gap-4 mt-3">
            <WaterBottle ml={slate.water} />
            <div className="flex-1">
              <p className="font-mono text-2xl">
                {slate.water}<span className="text-sm text-[var(--muted-foreground)]"> / 2500 ml</span>
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => addWater(-250)}
                  disabled={slate.water <= 0}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[var(--radius-button)] border border-border disabled:opacity-30 hover:bg-[var(--highlight)] transition-colors"
                ><Minus size={16} strokeWidth={1.5} /></button>
                <button
                  onClick={() => addWater(250)}
                  disabled={slate.water >= 2500}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[var(--radius-button)] bg-[var(--primary)] text-white disabled:opacity-30 hover:bg-[#b3736a] transition-colors"
                ><Plus size={16} strokeWidth={1.5} /></button>
              </div>
            </div>
          </div>
          <MiniBar7Day resolve={(_, d) => ((d.water as number | undefined) ?? 0) / 2500} />
        </Card>

        {/* Sleep */}
        <Card>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            <Moon size={14} strokeWidth={1.5} /> Sleep
          </div>
          <div className="flex gap-4 mt-3 flex-wrap">
            <label className="text-xs text-[var(--muted-foreground)]">
              I slept at
              <input
                type="time"
                value={slate.sleepAt}
                onChange={(e) => patch({ sleepAt: e.target.value })}
                className="block mt-1 bg-transparent border border-border rounded-md px-2 py-1 font-mono text-sm"
              />
            </label>
            <label className="text-xs text-[var(--muted-foreground)]">
              I woke at
              <input
                type="time"
                value={slate.wokeAt}
                onChange={(e) => patch({ wokeAt: e.target.value })}
                className="block mt-1 bg-transparent border border-border rounded-md px-2 py-1 font-mono text-sm"
              />
            </label>
            {sleepHrs > 0 && (
              <p className="font-mono text-2xl self-end" style={{ color: sleepColor }}>
                {Math.floor(sleepHrs)} hrs {Math.round((sleepHrs % 1) * 60)} mins
              </p>
            )}
          </div>
          <input
            value={slate.sleepNote}
            onChange={(e) => patch({ sleepNote: e.target.value })}
            placeholder="How did you sleep? (deep, restless, dreamy…)"
            className="w-full mt-3 bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5"
          />
          <MiniBar7Day resolve={(_, d) => {
            const s = (d.sleepAt as string) || "";
            const w = (d.wokeAt as string) || "";
            if (!s || !w) return 0;
            return Math.min(1, timeDiffHrs(s, w) / 9);
          }} />
        </Card>

        {/* Workout */}
        <Card>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            <Dumbbell size={14} strokeWidth={1.5} /> Workout
          </div>
          <div className="flex gap-2 mt-3">
            {(["done", "skip"] as const).map((opt) => {
              const isDone = opt === "done";
              const active = slate.workoutDone === isDone;
              return (
                <button
                  key={opt}
                  onClick={() => patch({ workoutDone: isDone })}
                  className={cn(
                    "px-4 py-1.5 rounded-[var(--radius-pill)] text-sm border transition-colors",
                    active
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "border-border hover:bg-[var(--highlight)]",
                  )}
                >
                  {isDone ? "Done" : "Skipped"}
                </button>
              );
            })}
          </div>
          <input
            value={slate.workoutNote}
            onChange={(e) => patch({ workoutNote: e.target.value })}
            placeholder="Note (optional)"
            className="w-full mt-3 bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5"
          />
          <p className="font-mono text-xs text-[var(--muted-foreground)] mt-3">
            Workout streak: <span className="text-foreground">{workoutStreak}</span>
          </p>
          <MiniBar7Day resolve={(_, d) => (d.workoutDone ? 1 : 0)} />
        </Card>

        {/* Sugar */}
        <Card>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            <Candy size={14} strokeWidth={1.5} /> Sugar intake
          </div>
          <div className="flex gap-2 mt-3">
            {(["low", "medium", "high"] as const).map((opt) => {
              const active = slate.sugar === opt;
              return (
                <button
                  key={opt}
                  onClick={() => patch({ sugar: opt })}
                  className={cn(
                    "px-4 py-1.5 rounded-[var(--radius-pill)] text-sm border transition-colors capitalize",
                    active
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "border-border hover:bg-[var(--highlight)]",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <MiniBar7Day resolve={(_, d) => {
            const s = d.sugar as string | undefined;
            return s === "low" ? 1 : s === "medium" ? 0.5 : s === "high" ? 0.2 : 0;
          }} />
        </Card>

        {/* Junk avoided */}
        <Card className="relative overflow-hidden md:col-span-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            <Salad size={14} strokeWidth={1.5} /> Junk food avoided today?
          </div>
          <div className="flex gap-2 mt-3">
            {[true, false].map((v) => {
              const active = slate.junkAvoided === v;
              return (
                <button
                  key={String(v)}
                  onClick={() => {
                    patch({ junkAvoided: v });
                    if (v) {
                      setSparkle(true);
                      setTimeout(() => setSparkle(false), 1000);
                    }
                  }}
                  className={cn(
                    "px-4 py-1.5 rounded-[var(--radius-pill)] text-sm border transition-colors",
                    active
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "border-border hover:bg-[var(--highlight)]",
                  )}
                >
                  {v ? "Yes" : "No"}
                </button>
              );
            })}
          </div>
          {sparkle && (
            <Sparkles
              size={40}
              strokeWidth={1.5}
              className="absolute right-6 top-6 text-[var(--primary)] animate-pulse"
            />
          )}
          <MiniBar7Day resolve={(_, d) => (d.junkAvoided ? 1 : 0)} />
        </Card>
      </div>
    </div>
  );
}
