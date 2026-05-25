import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Droplet, Moon, Scissors, Bath, Brain, BookOpen, Heart, Plus, HeartHandshake } from "lucide-react";
import { Card } from "@/components/Card";
import { SoftCheckbox } from "@/components/SoftCheckbox";
import { useDailyStore, haircareThisWeek, SELF_CARE_ITEMS } from "@/stores";
import * as storage from "@/lib/storage";
import { last7, todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/self-care")({
  head: () => ({
    meta: [
      { title: "Self Care — Level Up Girl" },
      { name: "description", content: "Skincare, hair, body, meditation, reading, and small acts of care." },
      { property: "og:title", content: "Self Care — Level Up Girl" },
      { property: "og:description", content: "Take care of yourself first. Check in today." },
      { property: "og:url", content: "/self-care" },
    ],
  }),
  component: SelfCarePage,
});

function SelfCarePage() {
  const slate = useDailyStore((s) => s.slate);
  const toggle = useDailyStore((s) => s.toggleSelfCare);
  const inc = useDailyStore((s) => s.incHaircare);
  const patch = useDailyStore((s) => s.patch);

  const [hairCount, setHairCount] = useState(0);
  useEffect(() => {
    setHairCount(haircareThisWeek());
  }, [slate.haircareCount]);

  // weekly self-care score - counts days with ANY self-care item done (including hair)
  const week = last7();
  const weekScore = week.filter((d) => {
    const data = storage.getDaily<{ selfCare?: Record<string, boolean> }>(d);
    const selfCare = d === todayKey() ? slate.selfCare : data?.selfCare;
    return SELF_CARE_ITEMS.every((id) => !!selfCare?.[id]);
  }).length;

  const ToggleCard = ({
    id, label, icon: Icon,
  }: { id: string; label: string; icon: typeof Heart }) => {
    const on = !!slate.selfCare[id];
    return (
      <Card className={cn("flex items-center justify-between transition-colors", on && "bg-[var(--success)]/10 border-[var(--success)]/40")}>
        <div className="flex items-center gap-3">
          <Icon size={20} strokeWidth={1.5} className={on ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <SoftCheckbox checked={on} onChange={() => toggle(id)} />
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-10 py-8 md:py-12 space-y-6">
      <header className="flex items-center gap-3">
        <HeartHandshake size={24} strokeWidth={1.5} className="text-[var(--primary)]" />
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Self Care</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Self care this week: <span className="font-mono">{weekScore} / 7</span> days
          </p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <ToggleCard id="am_skin" label="AM Skincare" icon={Droplet} />
        <ToggleCard id="pm_skin" label="PM Skincare" icon={Moon} />

        {/* Hair care - with "Done today" toggle and "+ Log" button */}
        <Card className={cn("flex flex-col justify-between transition-colors", slate.selfCare["hair"] && "bg-[var(--success)]/10 border-[var(--success)]/40")}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scissors size={20} strokeWidth={1.5} className={slate.selfCare["hair"] ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"} />
              <span className="text-sm font-medium">Hair care</span>
            </div>
            <SoftCheckbox checked={!!slate.selfCare["hair"]} onChange={() => toggle("hair")} />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-[var(--muted-foreground)]">
              Done <span className="text-foreground text-sm">{hairCount}</span> times this week
            </p>
            <button
              onClick={inc}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--primary)] text-white text-xs hover:bg-[#b3736a] transition-colors"
            >
              <Plus size={14} strokeWidth={1.8} /> Log
            </button>
          </div>
        </Card>

        <ToggleCard id="body" label="Body care" icon={Bath} />
        <ToggleCard id="meditation" label="Meditation" icon={Brain} />

        {/* Book reading */}
        <Card className={cn("transition-colors", slate.selfCare["book"] && "bg-[var(--success)]/10 border-[var(--success)]/40")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen size={20} strokeWidth={1.5} className={slate.selfCare["book"] ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"} />
              <span className="text-sm font-medium">Book reading</span>
            </div>
            <SoftCheckbox checked={!!slate.selfCare["book"]} onChange={() => toggle("book")} />
          </div>
          <label className="text-xs text-[var(--muted-foreground)] mt-3 block">
            Minutes read
            <input
              type="number"
              min={0}
              value={slate.bookMinutes}
              onChange={(e) => patch({ bookMinutes: Math.max(0, parseInt(e.target.value || "0", 10)) })}
              className="block mt-1 w-24 bg-transparent border-b border-border focus:border-[var(--primary)] outline-none font-mono text-sm"
            />
          </label>
        </Card>

        {/* Self care treat — free text */}
        <Card className="md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <Heart size={20} strokeWidth={1.5} className="text-[var(--accent)]" />
            <span className="text-sm font-medium">Self-care treat</span>
          </div>
          <input
            value={slate.selfCareTreat}
            onChange={(e) => patch({ selfCareTreat: e.target.value })}
            placeholder="What did you do for yourself today?"
            className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5"
          />
        </Card>
      </div>
    </div>
  );
}
