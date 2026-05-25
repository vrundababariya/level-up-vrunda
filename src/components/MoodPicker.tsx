import { cn } from "@/lib/utils";
import { Sun, Smile, Meh, CloudRain, BatteryLow } from "lucide-react";

const MOODS = [
  { id: "amazing", icon: Sun, label: "Amazing" },
  { id: "good", icon: Smile, label: "Good" },
  { id: "okay", icon: Meh, label: "Okay" },
  { id: "low", icon: CloudRain, label: "Low" },
  { id: "exhausted", icon: BatteryLow, label: "Exhausted" },
];

export function MoodPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((m) => {
        const active = value === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={cn(
              "flex flex-col items-center gap-2 px-3 py-2 rounded-[var(--radius-pill)] text-sm transition-colors duration-300 ease-out border",
              active
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "bg-transparent text-foreground border-border hover:bg-[var(--highlight)]",
            )}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { MOODS };
