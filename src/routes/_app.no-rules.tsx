import { createFileRoute } from "@tanstack/react-router";
import { UtensilsCrossed, GlassWater, Candy, Clock, Smartphone, VideoOff, type LucideIcon } from "lucide-react";
import { Card } from "@/components/Card";
import { useDailyStore, useStreaksStore, NO_RULES, type NoRuleIcon } from "@/stores";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/no-rules")({
  head: () => ({
    meta: [
      { title: "No Rules — Level Up Girl" },
      { name: "description", content: "Daily lines you don't cross. Discipline is self-love." },
      { property: "og:title", content: "No Rules — Level Up Girl" },
      { property: "og:description", content: "Daily lines you don't cross. Discipline is self-love." },
      { property: "og:url", content: "/no-rules" },
    ],
  }),
  component: NoRulesPage,
});

const ICON_MAP: Record<NoRuleIcon, LucideIcon> = {
  UtensilsCrossed,
  GlassWater,
  Candy,
  Clock,
  Smartphone,
  VideoOff,
};

function NoRulesPage() {
  const slate = useDailyStore((s) => s.slate);
  const toggle = useDailyStore((s) => s.toggleNoRule);
  const noRuleStreaks = useStreaksStore((s) => s.noRules);

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12 space-y-8">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">No Rules</h1>
        <p className="font-display italic text-2xl md:text-3xl text-[var(--primary)] mt-2">
          Discipline is self-love.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {NO_RULES.map((r) => {
          const followed = !!slate.noRules[r.id];
          const s = noRuleStreaks[r.id] ?? { current: 0, longest: 0 };
          const Icon = ICON_MAP[r.icon];
          return (
            <Card key={r.id} className={cn("flex flex-col items-center text-center transition-all", followed && "ring-1 ring-[var(--success)]/40")}>
              <Icon size={40} strokeWidth={1.5} className="text-[var(--primary)]" />
              <h3 className="font-medium mt-3">{r.name}</h3>

              <button
                onClick={() => toggle(r.id)}
                className={cn(
                  "mt-4 px-4 py-1.5 rounded-[var(--radius-pill)] text-xs border transition-all duration-200 active:scale-95",
                  followed
                    ? "bg-[var(--success)] text-white border-[var(--success)] scale-105"
                    : "border-border hover:bg-[var(--highlight)]",
                )}
              >
                {followed ? "Followed today ✓" : "Mark as followed"}
              </button>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-mono text-2xl">{s.current}</span>
                {s.current >= 3 && <span>🔥</span>}
                {s.current >= 7 && <span>👑</span>}
                <span className="text-xs text-[var(--muted-foreground)] ml-1">day streak</span>
              </div>
              <p className="text-[10px] text-[var(--muted-foreground)] font-mono">
                Longest: {s.longest}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
