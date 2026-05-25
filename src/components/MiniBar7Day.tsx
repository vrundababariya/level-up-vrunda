import { last7, shortWeekday } from "@/lib/date";
import * as storage from "@/lib/storage";

// pass a per-date numeric value 0..1 or a custom resolver
export function MiniBar7Day({
  resolve,
}: {
  resolve: (date: string, data: Record<string, unknown>) => number; // 0..1
}) {
  const dates = last7();
  return (
    <div className="flex items-end gap-1 mt-3 h-12">
      {dates.map((d) => {
        const data = storage.getDaily<Record<string, unknown>>(d) ?? {};
        const v = Math.max(0, Math.min(1, resolve(d, data)));
        return (
          <div key={d} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-[var(--highlight)] rounded-sm h-9 flex items-end overflow-hidden">
              <div
                className="w-full bg-[var(--primary)] rounded-sm transition-all duration-500 ease-out"
                style={{ height: `${v * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              {shortWeekday(d)[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
