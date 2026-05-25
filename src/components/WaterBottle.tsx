export function WaterBottle({ ml, goal = 2500 }: { ml: number; goal?: number }) {
  const pct = Math.max(0, Math.min(1, ml / goal));
  const fillHeight = 130 * pct;
  const fillY = 30 + (130 - fillHeight);
  return (
    <svg viewBox="0 0 100 180" className="w-20 h-36">
      <defs>
        <clipPath id="bottle-clip">
          <path d="M40 20 h20 v10 c12 4 18 16 18 28 v92 c0 8-6 14-14 14 H36 c-8 0-14-6-14-14 V58 c0-12 6-24 18-28 z" />
        </clipPath>
      </defs>
      <path
        d="M40 20 h20 v10 c12 4 18 16 18 28 v92 c0 8-6 14-14 14 H36 c-8 0-14-6-14-14 V58 c0-12 6-24 18-28 z"
        fill="none"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <rect
        x="22"
        y={fillY}
        width="56"
        height={fillHeight}
        fill="var(--primary)"
        fillOpacity="0.85"
        clipPath="url(#bottle-clip)"
        className="transition-all duration-500 ease-out"
      />
      <rect x="40" y="14" width="20" height="6" rx="2" fill="var(--border)" />
    </svg>
  );
}
