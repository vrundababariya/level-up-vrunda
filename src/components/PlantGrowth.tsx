export function PlantGrowth({ pct }: { pct: number }) {
  // 0-39 stage1, 40-79 stage2, 80+ stage3
  const stage = pct >= 80 ? 3 : pct >= 40 ? 2 : 1;
  return (
    <svg viewBox="0 0 140 160" className="w-full h-full transition-all duration-500 ease-out">
      {/* pot */}
      <path d="M30 120 L110 120 L100 155 L40 155 Z" fill="#d4a89a" />
      <rect x="28" y="115" width="84" height="8" rx="2" fill="#c9847a" />
      {/* soil */}
      <ellipse cx="70" cy="120" rx="38" ry="5" fill="#5a3a2a" />

      {stage === 1 && (
        <g className="transition-all duration-500 ease-out">
          {/* tiny seed sprout */}
          <line x1="70" y1="120" x2="70" y2="108" stroke="#7db89a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="70" cy="106" r="3" fill="#7db89a" />
        </g>
      )}

      {stage === 2 && (
        <g className="transition-all duration-500 ease-out">
          <line x1="70" y1="120" x2="70" y2="80" stroke="#5a8a6a" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="58" cy="90" rx="10" ry="6" fill="#7db89a" transform="rotate(-25 58 90)" />
          <ellipse cx="82" cy="86" rx="10" ry="6" fill="#7db89a" transform="rotate(25 82 86)" />
        </g>
      )}

      {stage === 3 && (
        <g className="transition-all duration-500 ease-out">
          <line x1="70" y1="120" x2="70" y2="50" stroke="#5a8a6a" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="55" cy="80" rx="12" ry="7" fill="#7db89a" transform="rotate(-25 55 80)" />
          <ellipse cx="85" cy="76" rx="12" ry="7" fill="#7db89a" transform="rotate(25 85 76)" />
          <ellipse cx="50" cy="60" rx="10" ry="6" fill="#7db89a" transform="rotate(-30 50 60)" />
          <ellipse cx="90" cy="58" rx="10" ry="6" fill="#7db89a" transform="rotate(30 90 58)" />
          {/* flowers */}
          <circle cx="70" cy="48" r="6" fill="#e8c5c0" />
          <circle cx="70" cy="48" r="2.5" fill="#c9847a" />
          <circle cx="58" cy="55" r="4" fill="#f3d8d0" />
          <circle cx="82" cy="53" r="4" fill="#f3d8d0" />
        </g>
      )}
    </svg>
  );
}
