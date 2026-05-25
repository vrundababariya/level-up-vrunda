import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronRight, Sunrise, Moon, PenLine, Plus, Trash2, Check } from "lucide-react";
import { Card } from "@/components/Card";
import { SoftCheckbox } from "@/components/SoftCheckbox";
import { PillButton } from "@/components/PillButton";
import { FocusTimer } from "@/components/FocusTimer";
import {
  useDailyStore, MORNING_HABITS, EVENING_HABITS,
  emptySlate, useCustomHabitsStore,
  type DailySlate, type HabitSection,
} from "@/stores";
import { last7, todayKey, shortWeekday } from "@/lib/date";
import * as storage from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/routine")({
  head: () => ({
    meta: [
      { title: "Daily Routine — Level Up Girl" },
      { name: "description", content: "Morning and evening rituals, journaling and planning." },
      { property: "og:title", content: "Daily Routine — Level Up Girl" },
      { property: "og:description", content: "Morning and evening rituals, journaling and planning." },
      { property: "og:url", content: "/routine" },
    ],
  }),
  component: RoutinePage,
});

function HabitRow({
  time, name, note, expandable,
  checked, onToggle, readOnly, onDelete,
}: {
  id: string; time?: string; name: string; note: string;
  expandable?: "planning" | "journal";
  checked: boolean; onToggle: () => void; readOnly?: boolean;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const patch = useDailyStore((s) => s.patch);
  const slate = useDailyStore((s) => s.slate);

  return (
    <div className="group border-b border-border last:border-b-0 py-4">
      <div className="flex items-start gap-4">
        <SoftCheckbox checked={checked} onChange={readOnly ? () => {} : onToggle} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {time && (
              <span className="font-mono text-xs text-[var(--muted-foreground)]">{time}</span>
            )}
            <span className="text-sm font-medium">{name}</span>
          </div>
          {note && <p className="text-xs text-[var(--muted-foreground)] mt-1">{note}</p>}
        </div>
        {onDelete && !readOnly && (
          <button
            onClick={onDelete}
            className="text-[var(--muted-foreground)] hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete habit"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        )}
        {expandable && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-[var(--muted-foreground)] hover:text-foreground transition-colors"
            aria-label="Expand"
          >
            {open ? <ChevronDown size={18} strokeWidth={1.5} /> : <ChevronRight size={18} strokeWidth={1.5} />}
          </button>
        )}
      </div>

      {open && expandable === "planning" && !readOnly && (
        <PlanningCard
          value={slate.morningPlanning}
          onSave={(v) => patch({ morningPlanning: v })}
        />
      )}
      {open && expandable === "journal" && !readOnly && (
        <JournalCard value={slate.journal} onSave={(v) => patch({ journal: v })} />
      )}
    </div>
  );
}

function PlanningCard({
  value, onSave,
}: { value: DailySlate["morningPlanning"]; onSave: (v: DailySlate["morningPlanning"]) => void }) {
  const [local, setLocal] = useState(value);
  return (
    <div className="border-t border-border mt-4 pt-4 space-y-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
        <PenLine size={14} strokeWidth={1.5} /> Morning planning
      </div>
      <div className="space-y-2">
        <label className="text-xs text-[var(--muted-foreground)]">Top 3 goals today</label>
        {local.goals.map((g, i) => (
          <input
            key={i}
            value={g}
            onChange={(e) => {
              const goals = [...local.goals] as [string, string, string];
              goals[i] = e.target.value;
              setLocal({ ...local, goals });
            }}
            placeholder={`Goal ${i + 1}`}
            className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5"
          />
        ))}
      </div>
      <input
        value={local.gratitude}
        onChange={(e) => setLocal({ ...local, gratitude: e.target.value })}
        placeholder="I am grateful for…"
        className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5"
      />
      <input
        value={local.improve}
        onChange={(e) => setLocal({ ...local, improve: e.target.value })}
        placeholder="One habit I will improve today"
        className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5"
      />
      <PillButton onClick={() => onSave(local)}>Save planning</PillButton>
    </div>
  );
}

function JournalCard({
  value, onSave,
}: { value: DailySlate["journal"]; onSave: (v: DailySlate["journal"]) => void }) {
  const [local, setLocal] = useState(value);
  const fields: { key: keyof DailySlate["journal"]; label: string }[] = [
    { key: "wentWell", label: "What went well today?" },
    { key: "improve", label: "What can I improve?" },
    { key: "moodNote", label: "Today's mood note" },
    { key: "wins", label: "My wins today" },
    { key: "tomorrow", label: "Tomorrow's goals" },
  ];
  return (
    <div className="border-t border-border mt-4 pt-4 space-y-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
        <PenLine size={14} strokeWidth={1.5} /> Journal
      </div>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-xs text-[var(--muted-foreground)]">{f.label}</label>
          <textarea
            value={local[f.key]}
            onChange={(e) => setLocal({ ...local, [f.key]: e.target.value })}
            rows={2}
            className="w-full bg-transparent border border-border rounded-md p-2 text-sm focus:border-[var(--primary)] outline-none mt-1"
          />
        </div>
      ))}
      <PillButton onClick={() => onSave(local)}>Save journal</PillButton>
    </div>
  );
}

function AddHabitForm({
  section, onClose,
}: { section: HabitSection; onClose: () => void }) {
  const addHabit = useCustomHabitsStore((s) => s.addHabit);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="border-t border-border mt-2 pt-4 space-y-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Habit name..."
        className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)..."
        className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5"
      />
      <div className="flex items-center gap-3 pt-2">
        <PillButton
          onClick={() => {
            if (!name.trim()) return;
            addHabit(section, name.trim(), note.trim());
            onClose();
          }}
        >
          Save
        </PillButton>
        <button
          onClick={onClose}
          className="text-xs text-[var(--muted-foreground)] hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function RoutinePage() {
  const slate = useDailyStore((s) => s.slate);
  const toggle = useDailyStore((s) => s.toggleHabit);
  const customMorning = useCustomHabitsStore((s) => s.morning);
  const customEvening = useCustomHabitsStore((s) => s.evening);
  const removeCustom = useCustomHabitsStore((s) => s.removeHabit);

  const [selected, setSelected] = useState<string>(todayKey());
  const isToday = selected === todayKey();

  const viewedSlate: DailySlate = isToday
    ? slate
    : { ...emptySlate(selected), ...(storage.getDaily<Partial<DailySlate>>(selected) ?? {}) };

  const [openSections, setOpenSections] = useState({ morning: true, evening: true });
  const [adding, setAdding] = useState<HabitSection | null>(null);

  const morningTotal = MORNING_HABITS.length + customMorning.length;
  const eveningTotal = EVENING_HABITS.length + customEvening.length;
  const morningDone =
    MORNING_HABITS.filter((h) => viewedSlate.habits[h.id]).length +
    customMorning.filter((h) => viewedSlate.habits[h.id]).length;
  const eveningDone =
    EVENING_HABITS.filter((h) => viewedSlate.habits[h.id]).length +
    customEvening.filter((h) => viewedSlate.habits[h.id]).length;

  const chip = (done: number, total: number) => {
    const all = done === total && total > 0;
    return (
      <span
        className={cn(
          "font-mono text-xs px-3 py-1 rounded-full inline-flex items-center gap-1.5",
          all ? "bg-[var(--success)] text-white" : "bg-[var(--highlight)] text-foreground",
        )}
      >
        {all && <Check size={12} strokeWidth={2} />}
        {done} / {total} done
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-10 py-8 md:py-12 space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">Daily Routine</h1>
        <p className="font-display italic text-[var(--muted-foreground)] mt-1">
          The shape of a beautiful day.
        </p>
      </header>

      {/* Week chip strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {last7().map((d) => {
          const active = d === selected;
          const isTodayChip = d === todayKey();
          return (
            <button
              key={d}
              onClick={() => setSelected(d)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-[var(--radius-pill)] text-xs flex flex-col items-center gap-0.5 border transition-colors",
                active
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-border hover:bg-[var(--highlight)]",
              )}
            >
              <span className="font-mono">{shortWeekday(d)}</span>
              <span className="text-[10px] opacity-80">{d.slice(8)}</span>
              {isTodayChip && !active && <span className="text-[9px] text-[var(--primary)]">today</span>}
            </button>
          );
        })}
      </div>

      {!isToday && (
        <p className="text-xs italic text-[var(--muted-foreground)]">
          Viewing {selected} — read only.
        </p>
      )}

      {/* Morning */}
      <Card>
        <button
          onClick={() => setOpenSections((s) => ({ ...s, morning: !s.morning }))}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Sunrise size={20} strokeWidth={1.5} className="text-[var(--primary)]" />
            <h2 className="font-display text-xl">Morning</h2>
          </div>
          {chip(morningDone, morningTotal)}
        </button>
        {openSections.morning && (
          <div className="mt-3">
            {MORNING_HABITS.map((h) => (
              <HabitRow
                key={h.id}
                {...h}
                checked={!!viewedSlate.habits[h.id]}
                onToggle={() => toggle(h.id)}
                readOnly={!isToday}
              />
            ))}
            {customMorning.map((h) => (
              <HabitRow
                key={h.id}
                id={h.id}
                name={h.name}
                note={h.note}
                checked={!!viewedSlate.habits[h.id]}
                onToggle={() => toggle(h.id)}
                onDelete={() => removeCustom("morning", h.id)}
                readOnly={!isToday}
              />
            ))}
            {isToday && (
              adding === "morning" ? (
                <AddHabitForm section="morning" onClose={() => setAdding(null)} />
              ) : (
                <button
                  onClick={() => setAdding("morning")}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  <Plus size={14} strokeWidth={1.5} /> Add habit
                </button>
              )
            )}
          </div>
        )}
      </Card>

      {/* Evening */}
      <Card>
        <button
          onClick={() => setOpenSections((s) => ({ ...s, evening: !s.evening }))}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Moon size={20} strokeWidth={1.5} className="text-[var(--accent)]" />
            <h2 className="font-display text-xl">Evening</h2>
          </div>
          {chip(eveningDone, eveningTotal)}
        </button>
        {openSections.evening && (
          <div className="mt-3">
            {EVENING_HABITS.map((h) => (
              <HabitRow
                key={h.id}
                {...h}
                checked={!!viewedSlate.habits[h.id]}
                onToggle={() => toggle(h.id)}
                readOnly={!isToday}
              />
            ))}
            {customEvening.map((h) => (
              <HabitRow
                key={h.id}
                id={h.id}
                name={h.name}
                note={h.note}
                checked={!!viewedSlate.habits[h.id]}
                onToggle={() => toggle(h.id)}
                onDelete={() => removeCustom("evening", h.id)}
                readOnly={!isToday}
              />
            ))}
            {isToday && (
              adding === "evening" ? (
                <AddHabitForm section="evening" onClose={() => setAdding(null)} />
              ) : (
                <button
                  onClick={() => setAdding("evening")}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  <Plus size={14} strokeWidth={1.5} /> Add habit
                </button>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
