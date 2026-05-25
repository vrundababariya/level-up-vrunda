import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  message,
}: {
  icon?: LucideIcon;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <Icon
          size={32}
          strokeWidth={1.5}
          className="text-[var(--muted-foreground)] mb-4"
        />
      )}
      <p className="font-display italic text-xl text-[var(--muted-foreground)] max-w-md">
        {message}
      </p>
    </div>
  );
}
