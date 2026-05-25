# Level Up Girl — Build Plan

A 10-page luxury wellness & self-improvement tracker. "Soft luxury meets discipline" — clean, editorial, intentional. All storage funnels through one file so a future Firestore swap is a one-file rewrite.

## 0. Emoji & Iconography Policy (hard rule)

The UI should read like a luxury wellness journal, not a sticker sheet. Visual hierarchy comes from typography, whitespace, and thin icons — not decoration.

**Use instead of emojis:**
- `lucide-react` icons with `strokeWidth={1.5}` for nav, card headers, buttons, status, empty states.
- Small bespoke SVG illustrations for the few "hero" visuals: plant growth, water bottle, streak heatmap.
- Cormorant Garamond display + generous spacing for emotional weight.

**Emojis are allowed ONLY in these four places** (they are the feature, not decoration):
1. Mood picker — `😄 🙂 😐 😔 😫`
2. No Rules cards — one emoji per rule as its visual identity
3. Vision Board goal cards — one large intentional emoji per card
4. Earned streak indicators — `🔥` (streak ≥3 or ≥7 per spec) and `👑` (≥7), conditionally rendered only when earned

**Forbidden:** emoji in nav labels, page titles, card titles, button labels, headings, greetings, quotes, empty-state copy, score chips, section headers, callouts, or anywhere as a bullet. Greetings, quotes, score chips, and headers from the brief that contained `✨ 🌷 💫 🌟 🌿 💆 🏆` etc. are rewritten as plain text or paired with a lucide icon (e.g. `Sparkles`, `Flower2`, `Trophy`, `Leaf`, `HeartPulse`, `BookOpen`).

## 1. Foundation

**Dependencies**
- `bun add zustand recharts` (lucide-react + Tailwind already present)

**Design tokens — `src/styles.css`**
- Replace the existing oklch palette with the warm system: background `#FAF7F4`, card `#FFFFFF`, primary `#C9847A`, accent `#D4A89A`, highlight `#E8D5C4`, foreground `#2C2825`, muted-foreground `#8C7B74`, success `#7DB89A`, border `#EDE5DF`.
- Radii: `--radius:16px`, `--radius-button:12px`, `--radius-pill:50px`.
- Shadow: `--shadow-card: 0 2px 20px rgba(44,40,37,0.06)`.
- Register `font-display` (Cormorant Garamond), `font-sans` (DM Sans), `font-mono` (DM Mono) in `@theme`.

**Fonts** — `<link>` tags in `__root.tsx` head for the three Google Font families.

## 2. Data Layer (Firebase-ready)

**`src/lib/storage.ts`** — only file touching `localStorage`. Surface:
`get<T>(key)`, `set(key, value)`, `getDaily(date)`, `setDaily(date, patch)`, `listRecentDailies(n)`. Namespace `levelupgirl_*`; daily key `levelupgirl_daily_YYYY-MM-DD`; prunes to last 30 days.

**`src/lib/date.ts`** — `todayKey()`, `formatLong()`, `dayOfYear()`, `last7()`, `last30()`, `weekKey()` (Sunday-anchored).

**`src/lib/dayRollover.ts`** — on `_app` mount: if last-active date ≠ today, archive yesterday, recompute streaks (≥80% of all trackable items → increment, else reset, longest preserved), seed fresh daily.

**`src/lib/foodDb.ts`** — seed food list + subcategory→body-system map + `suggestForSystem(systemId, n=3)`.

**Zustand stores in `src/stores/`** — hydrate from `storage.ts` on init, persist on change:
- `dailyStore` (habits, water, mood, meals, no-rules, sleep note, haircare count, journaling, morning planning, affirmation)
- `streaksStore` (per-habit + per-no-rule, longest preserved)
- `foodDbStore` (user additions on top of seed)
- `studyStore`, `mediaStore`, `settingsStore` (vision goals)

**Progress formula** — `(checked) / (total)`, total = 10 morning + 8 evening + study tasks (min 1) + 6 no-rules + 5 self-care items. Render bar + `X / Y completed` in DM Mono.

## 3. Routing (TanStack Start, file-based)

```
src/routes/
  __root.tsx           fonts, default meta, providers
  _app.tsx             sidebar + bottom nav + <Outlet/>
  _app.index.tsx       Dashboard
  _app.routine.tsx     Daily Routine
  _app.study.tsx       Study Phase
  _app.health.tsx      Health Tracker
  _app.meals.tsx       Meal Logger
  _app.no-rules.tsx    No Rules
  _app.self-care.tsx   Self Care
  _app.vision.tsx      Vision Board
  _app.analytics.tsx   Analytics
  _app.media.tsx       Media
```

Each route owns `head()` (title, description, og:title/description, relative og:url). TanStack placeholder index removed.

## 4. Navigation Shell (`_app.tsx`)

- Desktop ≥768px: left sidebar, "Level Up Girl" wordmark in Cormorant, 10 items each with a lucide icon (`LayoutDashboard`, `Sun`, `BookOpen`, `HeartPulse`, `Utensils`, `ShieldCheck`, `Sparkles`, `Compass`, `BarChart3`, `Music2`) — no emoji in labels. Active = gradient pill `linear-gradient(135deg,#FAF7F4,#F0E8E4)` with icon + label in `--primary`.
- Mobile <768px: bottom nav (Dashboard / Routine / Study / Health / More) using lucide icons. "More" opens a sheet drawer linking to Meals, No Rules, Self Care, Vision, Analytics, Media.
- Calls `runDayRollover()` once on mount.

## 5. Reusable Components — `src/components/`

`Card`, `SoftCheckbox` (circle, sage-fills with `Check` lucide on done), `PillButton`, `ThinProgress` (6px), `FocusTimer` (countdown ring + stopwatch toggle, lucide `Play/Pause/RotateCcw`), `WaterBottle` (bespoke SVG), `PlantGrowth` (3-stage SVG, 500ms transitions), `MiniBar7Day`, `MoodPicker` (the emoji exception), `EmptyState` (Cormorant italic, optional lucide icon — no emoji).

Icons: lucide-react, `strokeWidth={1.5}`. Transitions: 300ms ease-out, no bounce (200ms scale tap on No Rules toggles is the only exception).

## 6. Pages

Content & behavior per the brief, with all decorative emojis replaced by lucide icons or plain text. Pre-filled lists (habits, study tasks, no-rules, food DB, shloka, goals) ship verbatim.

1. **Dashboard** — rotating Cormorant greeting (`dayOfYear()%4`, trailing emoji stripped, optional `Sparkles` lucide on the right of the greeting line), long date, streak card with 7-dot mini week heatmap and `Flame` lucide that scales when streak ≥7 (no decorative emoji), water tracker (+/−250ml, 0–2500 clamp), MoodPicker (emojis allowed), today's progress, daily quote (15-quote rotation via `dayOfYear()%15`, italic Cormorant, no decoration), Top 3 Goals mirror of morning planning, PlantGrowth bottom-right.
2. **Daily Routine** — 7-day chip strip (past = read-only), Morning (10) and Evening (8) collapsible sections with completion chips, HabitCard with inline FocusTimer; 9:00 AM expands Morning Planning (top 3 goals, gratitude, habit-to-improve); 9:40 PM expands Journaling (5 textareas). Section headers/prompts use lucide icons (`Sunrise`, `Moon`, `PenLine`) — no emoji.
3. **Study Phase** — total time header, add-task row, 6 pre-filled tasks (editable/deletable), inline-edit name, status pill cycle Todo→In Progress→Done, per-task FocusTimer, end-of-day summary card after 18:00 (Cormorant, no `✨`). Empty state: "Your focus story begins here. Add your first task."
4. **Health Tracker** — Water (synced with dashboard), Sleep (time pickers, threshold colors, "How did you sleep?" note), Workout (Done/Skipped + note + streak), Sugar (Low/Med/High), Junk Food Avoided (subtle sparkle micro-animation using lucide `Sparkles` fade, not emoji confetti). 7-day MiniBar on every card.
5. **Meal Logger** — body-nourishment score header (lucide `Leaf` icon, no emoji), 6 system status cards with lucide status icons (`CheckCircle2`, `AlertCircle`, `Circle`) instead of `✅⚠️❌`, suggestion chips (tap → instant add), real-time search, tap-to-add, tap-to-remove, "+ Add new food" modal writing to `foodDbStore`. Seed food list + subcategory→system map from spec.
6. **No Rules** — Cormorant italic title "Discipline is self-love.", grid `grid-cols-2 md:grid-cols-3`, 6 rule cards (emojis allowed — they are the rule identity), toggle with 200ms scale bounce, current + longest streak in DM Mono, conditional `🔥` ≥3 and `👑` ≥7.
7. **Self Care** — weekly score chip "Self care this week: X / 7 days" with lucide `HeartHandshake` (no emoji), AM/PM skincare toggles, Hair care counter (weekly reset via `weekKey`), Body care, Meditation (two-way sync with routine), Book reading toggle + minutes, free-text self-care treat. Card headers use lucide icons (`Droplet`, `Moon`, `Scissors`, `Bath`, `Brain`, `BookOpen`, `Heart`) — no emoji.
8. **Vision Board** — image upload via `URL.createObjectURL` (no base64), elegant re-upload prompt after refresh (lucide `ImagePlus`, copy without emoji: "Re-upload your vision board"); 6 goal cards in 2×3 grid (one large intentional emoji per card — allowed), double-click / long-press to edit, persisted to `settingsStore`; full-width shloka card (Sanskrit Cormorant + DM Sans translation); daily affirmation textarea + "Yesterday's affirmation:" label below.
9. **Analytics** — Recharts: habit % bar (7d, primary), water line (primary) with dashed `ReferenceLine` at 2500ml labeled "Goal", 30-day CSS-grid heatmap (today outlined in primary), study hours bar (accent), mood strip (7 cells, large mood emoji allowed — these come from MoodPicker), body-system horizontal bar (success), strongest-day stat card, most-skipped-habit callout. DM Mono axes. Empty state in Cormorant italic: "Your journey is just beginning. Check back after a few days."
10. **Media** — 2 custom audio players: file picker → object URL → custom UI (lucide `Play/Pause`, seekable 6px bar, `0:00 / 0:00` in DM Mono, lucide `Volume2` slider, `Upload` for re-pick). Titles "Morning Affirmations" / "Evening Affirmations" — no emoji. 3 YouTube cards labeled "Yoga / Surya Namaskar", "Pranayama", "Meditation" with lucide icons; parse video ID from `youtu.be/`, `watch?v=`, `embed/`; 16:9 rounded iframe; persisted to `mediaStore`.

## 7. Cross-cutting

- All forms controlled React state.
- Every write goes through `storage.ts`.
- Empty states (Cormorant italic, lucide icon optional, no emoji) on Study, Health, Meals, Self Care, Vision, Analytics, Media — copy per spec with trailing emojis stripped.
- Day rollover preserves longest streaks, archives yesterday, creates fresh slate at midnight.
- TanStack default placeholder removed.

## Technical Notes

- Audio + vision-board images use `URL.createObjectURL` and are intentionally not persisted (object URLs die on reload) — show a friendly re-upload UI.
- Streaks recompute on rollover only, not per toggle, to keep "≥80% of all trackable items" stable.
- `foodDb` ships as a static seed; user additions from `foodDbStore` merge at read time.
- All storage keys namespaced `levelupgirl_*` so a future migration script can scan/transform cleanly.
- Firebase later: re-implement `src/lib/storage.ts` against Firestore behind the same 5-method surface; stores and pages stay untouched.
- Emoji-policy enforcement: a single shared lucide-icon map per page keeps copy clean; rely on this plan as the source of truth — any future tweak that wants to add an emoji must fall into one of the four allowed buckets.
