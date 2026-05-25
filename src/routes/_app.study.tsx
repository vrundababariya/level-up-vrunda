import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Card } from "@/components/Card";
import { PillButton } from "@/components/PillButton";
import { FocusTimer } from "@/components/FocusTimer";
import { EmptyState } from "@/components/EmptyState";
import { useStudyStore, type StudyTask } from "@/stores";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/study")({
  head: () => ({
    meta: [
      { title: "Study Phase — Level Up Girl" },
      { name: "description", content: "Focused work, deep work, and skill-building tasks." },
      { property: "og:title", content: "Study Phase — Level Up Girl" },
      { property: "og:description", content: "Focused work, deep work, and skill-building tasks." },
      { property: "og:url", content: "/study" },
    ],
  }),
  component: StudyPage,
});

const NEXT_STATUS: Record<StudyTask["status"], StudyTask["status"]> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const STATUS_LABEL: Record<StudyTask["status"], string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_STYLE: Record<StudyTask["status"], string> = {
  todo: "bg-[var(--border)] text-foreground",
  in_progress: "bg-[var(--highlight)] text-foreground",
  done: "bg-[var(--success)] text-white",
};

function TaskCard({ t }: { t: StudyTask }) {
  const update = useStudyStore((s) => s.update);
  const remove = useStudyStore((s) => s.remove);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(t.name);
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                update(t.id, { name: draft.trim() || t.name });
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  update(t.id, { name: draft.trim() || t.name });
                  setEditing(false);
                }
              }}
              className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-base font-medium"
            />
          ) : (
            <h3
              className="text-base font-medium cursor-text"
              onClick={() => setEditing(true)}
              title="Click to edit"
            >
              {t.name}
            </h3>
          )}
          <p className="font-mono text-xs text-[var(--muted-foreground)] mt-1">
            {t.minutes} min
          </p>
        </div>
        <button
          onClick={() => update(t.id, { status: NEXT_STATUS[t.status] })}
          className={cn(
            "px-3 py-1 rounded-[var(--radius-pill)] text-xs transition-colors",
            STATUS_STYLE[t.status],
          )}
        >
          {STATUS_LABEL[t.status]}
        </button>
        <button
          onClick={() => remove(t.id)}
          className="text-[var(--muted-foreground)] hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete"
        >
          <Trash2 size={16} strokeWidth={1.5} />
        </button>
      </div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-[var(--primary)] mt-3 hover:underline"
      >
        {open ? "Hide timer" : "Open focus timer"}
      </button>
      {open && <FocusTimer defaultMinutes={t.minutes} />}
    </Card>
  );
}

function StudyPage() {
  const tasks = useStudyStore((s) => s.tasks);
  const add = useStudyStore((s) => s.add);
  const [name, setName] = useState("");
  const [mins, setMins] = useState(30);

  const totalMinutes = tasks.reduce((acc, t) => acc + (t.status === "done" ? t.minutes : 0), 0);
  const hrs = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  const showSummary = new Date().getHours() >= 18 && tasks.some((t) => t.status === "done");
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-10 py-8 md:py-12 space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Study Phase</h1>
          <p className="font-display italic text-[var(--muted-foreground)] mt-1">
            Focused work, built minute by minute.
          </p>
        </div>
        <p className="font-mono text-sm text-[var(--muted-foreground)]">
          Today: <span className="text-foreground">{hrs} hrs {m} mins</span>
        </p>
      </header>

      <Card>
        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-[var(--muted-foreground)]">Task name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What will you work on?"
              className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5"
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-[var(--muted-foreground)]">Minutes</label>
            <input
              type="number"
              value={mins}
              min={1}
              onChange={(e) => setMins(Math.max(1, parseInt(e.target.value || "1", 10)))}
              className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5 font-mono"
            />
          </div>
          <PillButton
            onClick={() => {
              if (!name.trim()) return;
              add(name.trim(), mins);
              setName("");
              setMins(30);
            }}
          >
            <Plus size={14} strokeWidth={1.8} /> Add
          </PillButton>
        </div>
      </Card>

      {tasks.length === 0 ? (
        <EmptyState icon={BookOpen} message="Your focus story begins here. Add your first task." />
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => <TaskCard key={t.id} t={t} />)}
        </div>
      )}

      {showSummary && (
        <div
          className="rounded-[var(--radius)] p-6 text-center"
          style={{ background: "var(--highlight)" }}
        >
          <p className="font-display text-xl">
            Today's study session: {hrs} hrs {m} mins completed across {doneCount} tasks.
          </p>
        </div>
      )}
    </div>
  );
}
