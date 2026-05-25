import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

export function PillButton({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-[var(--primary)] text-white hover:bg-[#b3736a]"
      : variant === "outline"
        ? "bg-transparent border border-border text-foreground hover:bg-[var(--highlight)]"
        : "bg-transparent text-foreground hover:bg-[var(--highlight)]";
  return (
    <button
      className={cn(base, styles, "rounded-[var(--radius-button)]", className)}
      {...props}
    />
  );
}
