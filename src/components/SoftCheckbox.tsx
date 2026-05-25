import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SoftCheckbox({
  checked,
  onChange,
  size = 22,
  className,
}: {
  checked: boolean;
  onChange: () => void;
  size?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={cn(
        "shrink-0 inline-flex items-center justify-center rounded-full border transition-all duration-300 ease-out",
        checked
          ? "bg-[var(--success)] border-[var(--success)]"
          : "bg-card border-border hover:border-[var(--muted-foreground)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {checked && <Check size={size * 0.6} strokeWidth={2.2} className="text-white" />}
    </button>
  );
}
