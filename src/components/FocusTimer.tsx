import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Timer, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function FocusTimer({ defaultMinutes = 25 }: { defaultMinutes?: number }) {
  const [mode, setMode] = useState<"countdown" | "stopwatch">("countdown");
  const [label, setLabel] = useState("");
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds elapsed
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (startRef.current === null) return;
      const now = Date.now();
      const delta = Math.floor((now - startRef.current) / 1000);
      setElapsed(delta);
    };
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const totalSeconds = minutes * 60;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const display = mode === "countdown" ? remaining : elapsed;
  const mm = String(Math.floor(display / 60)).padStart(2, "0");
  const ss = String(display % 60).padStart(2, "0");

  const pct =
    mode === "countdown"
      ? totalSeconds === 0
        ? 0
        : (elapsed / totalSeconds) * 100
      : 0;

  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dash = circ * (pct / 100);

  const start = () => {
    if (!running) {
      startRef.current = Date.now() - elapsed * 1000;
      setRunning(true);
    }
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setElapsed(0);
    startRef.current = null;
  };

  return (
    <div className="border-t border-border pt-4 mt-4 space-y-3">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="What are you working on?"
        className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5 placeholder:text-[var(--muted-foreground)]"
      />
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r={radius} stroke="var(--border)" strokeWidth="4" fill="none" />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="var(--primary)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              className="transition-[stroke-dasharray] duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-lg">
            {mm}:{ss}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {mode === "countdown" && (
            <label className="text-xs text-[var(--muted-foreground)] flex items-center gap-2">
              Minutes
              <input
                type="number"
                min={1}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value || "1", 10)))}
                className="w-16 border border-border rounded-md px-2 py-1 font-mono text-sm"
                disabled={running}
              />
            </label>
          )}
          <div className="flex items-center gap-2">
            {!running ? (
              <button
                onClick={start}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] bg-[var(--primary)] text-white text-sm hover:bg-[#b3736a] transition-colors"
              >
                <Play size={14} strokeWidth={1.8} /> Start
              </button>
            ) : (
              <button
                onClick={pause}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] border border-border text-sm hover:bg-[var(--highlight)] transition-colors"
              >
                <Pause size={14} strokeWidth={1.8} /> Pause
              </button>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] border border-border text-sm hover:bg-[var(--highlight)] transition-colors"
            >
              <RotateCcw size={14} strokeWidth={1.8} /> Reset
            </button>
            <button
              onClick={() => setMode((m) => (m === "countdown" ? "stopwatch" : "countdown"))}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-button)] text-xs transition-colors",
                "border border-border text-[var(--muted-foreground)] hover:bg-[var(--highlight)]",
              )}
              title="Toggle mode"
            >
              {mode === "countdown" ? <Clock size={14} strokeWidth={1.5} /> : <Timer size={14} strokeWidth={1.5} />}
              {mode === "countdown" ? "Stopwatch" : "Countdown"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
