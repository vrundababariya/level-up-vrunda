export function ThinProgress({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full h-1.5 bg-[var(--highlight)] rounded-full overflow-hidden">
      <div
        className="h-full bg-[var(--primary)] transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
