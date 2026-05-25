import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-[var(--radius)] shadow-card p-6",
        className,
      )}
      {...props}
    />
  );
}
