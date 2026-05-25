import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles, Flame, Plus, Minus, Trophy, Zap, Flame as FlameIcon, Target, Waves, RefreshCw,
  Lightbulb, Dumbbell, Scale, Sun, TrendingUp, Moon, Medal, CalendarCheck, Brain, GraduationCap,
  Crown, Shield, Rocket, Star, Banknote, HeartPulse, Gem, Compass, BarChart3, ShieldCheck,
  Clock, Wind, PiggyBank, Wallet, Heart, Map, CheckCircle2, Maximize2, Infinity, ListChecks,
  ArrowRight, Repeat, Footprints, Move, Flower2, ArrowLeftRight,
} from "lucide-react";
import { Card } from "@/components/Card";
import { ThinProgress } from "@/components/ThinProgress";
import { WaterBottle } from "@/components/WaterBottle";
import { MoodPicker } from "@/components/MoodPicker";
import { useDailyStore, useStreaksStore, useStudyStore, useCustomHabitsStore } from "@/stores";
import { computeProgressFull, computeDayPct } from "@/lib/dayRollover";
import { dayOfYear, formatLong, last7 } from "@/lib/date";
import * as storage from "@/lib/storage";

const GREETINGS = [
  "Good morning, Vrunda.",
  "Welcome back, pretty soul.",
  "Becoming the best version of yourself.",
  "Consistency over motivation.",
];

const ICON_MAP: Record<string, React.ComponentType<{ size: number; strokeWidth: number; className: string }>> = {
  Trophy,
  Zap,
  Flame: FlameIcon,
  Target,
  Waves,
  RefreshCw,
  Lightbulb,
  Dumbbell,
  Scale,
  Sun,
  TrendingUp,
  Moon,
  Medal,
  CalendarCheck,
  Brain,
  GraduationCap,
  Crown,
  Shield,
  Rocket,
  Star,
  Banknote,
  HeartPulse,
  Gem,
  Compass,
  BarChart3,
  ShieldCheck,
  Clock,
  Wind,
  Wallet,
  Heart,
  Map,
  CheckCircle2,
  Maximize2,
  Infinity,
  ListChecks,
  ArrowRight,
  Repeat,
  Move,
  Flower2,
  ArrowLeftRight,
};

const QUOTES = [
  { text: "Pressure is a privilege.", author: "Virat Kohli", icon: "Trophy" },
  { text: "Discipline beats motivation.", icon: "Zap" },
  { text: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य प्राप्त न हो जाए।", author: "Swami Vivekananda", icon: "Flame" },
  { text: "Confidence comes from preparation.", author: "Roger Federer", icon: "Target" },
  { text: "Peace begins where expectations end.", icon: "Waves" },
  { text: "Your habits create your future.", icon: "RefreshCw" },
  { text: "कर्म करो, फल की चिंता मत करो।", author: "Bhagavad Gita", icon: "Flower2" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs", icon: "Lightbulb" },
  { text: "Glow differently when your confidence comes from within.", icon: "Sparkles" },
  { text: "Talent without working hard is nothing.", author: "Cristiano Ronaldo", icon: "Dumbbell" },
  { text: "The pain of discipline is lighter than the pain of regret.", icon: "Scale" },
  { text: "अगर सूरज की तरह चमकना है, तो पहले सूरज की तरह जलना सीखो।", author: "A. P. J. Abdul Kalam", icon: "Sun" },
  { text: "Focus on progress, not perfection.", icon: "TrendingUp" },
  { text: "The soul grows in silence.", icon: "Moon" },
  { text: "Champions keep playing until they get it right.", author: "Billie Jean King", icon: "Medal" },
  { text: "Your future is created by what you do today.", icon: "CalendarCheck" },
  { text: "मनुष्य अपने विश्वास से निर्मित होता है। जैसा वह विश्वास करता है, वैसा वह बन जाता है।", author: "Bhagavad Gita", icon: "Brain" },
  { text: "Learn skills. Money follows value.", icon: "GraduationCap" },
  { text: "Act like the life you want is already yours.", icon: "Crown" },
  { text: "You become dangerous when you learn to control your emotions.", icon: "Shield" },
  { text: "Dream big. Start small. Act now.", icon: "Rocket" },
  { text: "सपने वो नहीं जो हम सोते समय देखते हैं, सपने वो हैं जो हमें सोने नहीं देते।", author: "A. P. J. Abdul Kalam", icon: "Star" },
  { text: "Wealth is built quietly.", icon: "Banknote" },
  { text: "Confidence and hard work are the best medicine to kill failure.", author: "A. P. J. Abdul Kalam", icon: "HeartPulse" },
  { text: "Consistency creates confidence.", icon: "RefreshCw" },
  { text: "Main character energy starts with self-respect.", icon: "Gem" },
  { text: "Detach from outcomes. Focus on actions.", icon: "Compass" },
  { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett", icon: "BarChart3" },
  { text: "Strong body. Strong mind. Strong life.", icon: "Dumbbell" },
  { text: "Protect your mind from things that don't grow you.", icon: "ShieldCheck" },
  { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg", icon: "Rocket" },
  { text: "शांत मन से बड़ा कोई धन नहीं।", author: "Bhagavad Gita", icon: "Waves" },
  { text: "Discipline will take you places motivation never could.", icon: "Map" },
  { text: "A weak mindset waits. A strong mindset works.", icon: "Zap" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", icon: "Clock" },
  { text: "Be stronger than your excuses.", icon: "Flame" },
  { text: "Calm mind. Clear heart. Pure energy.", icon: "Wind" },
  { text: "The universe responds to your energy.", icon: "Sparkles" },
  { text: "The person you want to become is hidden inside your daily routine.", icon: "CalendarCheck" },
  { text: "You have to fight to reach your dream.", author: "Lionel Messi", icon: "Trophy" },
  { text: "Financial freedom starts with self-control.", icon: "Wallet" },
  { text: "What is meant for you will never miss you.", icon: "Heart" },
  { text: "श्रेष्ठता एक निरंतर प्रक्रिया है, कोई दुर्घटना नहीं।", author: "A. P. J. Abdul Kalam", icon: "Star" },
  { text: "Become the standard.", icon: "Crown" },
  { text: "One workout at a time. One habit at a time.", icon: "ListChecks" },
  { text: "If people are doubting how far you can go, go so far that you can't hear them anymore.", author: "Michele Ruiz", icon: "ArrowRight" },
  { text: "Silence is sometimes the deepest prayer.", icon: "Moon" },
  { text: "Wake up. Work hard. Repeat.", icon: "Repeat" },
  { text: "आत्मा न जन्म लेती है, न मरती है।", author: "Bhagavad Gita", icon: "Infinity" },
  { text: "Your life changes the moment you stop needing validation.", icon: "Gem" },
  { text: "Small steps every day.", icon: "Move" },
  { text: "Invest in yourself. It gives the highest returns.", icon: "TrendingUp" },
  { text: "The more a person seeks security, the more that person gives up control over life.", author: "Rich Dad Poor Dad", icon: "BarChart3" },
  { text: "You were never meant to play small.", icon: "Maximize2" },
  { text: "The moment you choose yourself, everything changes.", icon: "Heart" },
  { text: "अगर मेरा संकल्प मजबूत है, तो असफलता मुझे कभी नहीं हरा सकती।", author: "A. P. J. Abdul Kalam", icon: "ShieldCheck" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "Atomic Habits", icon: "CheckCircle2" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "The 7 Habits of Highly Effective People", icon: "ArrowLeftRight" },
];

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Level Up Girl" },
      { name: "description", content: "Today's intentions, mood, water, and progress." },
      { property: "og:title", content: "Dashboard — Level Up Girl" },
      { property: "og:description", content: "Today's intentions, mood, water, and progress." },
      { property: "og:url", content: "/" },
    ],
  }),
  component: Dashboard,
});

function MiniWeekDots({ customHabitIds }: { customHabitIds: string[] }) {
  const [days, setDays] = useState<{ date: string; pct: number }[]>([]);
  useEffect(() => {
    const out = last7().map((d) => {
      const data = storage.getDaily<Record<string, unknown>>(d) ?? {};
      return { date: d, pct: computeDayPct(data, customHabitIds) };
    });
    setDays(out);
  }, [customHabitIds]);
  return (
    <div className="flex gap-1.5 mt-3">
      {days.map((d) => (
        <span
          key={d.date}
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: d.pct >= 80 ? "var(--primary)" : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

function Dashboard() {
  const slate = useDailyStore((s) => s.slate);
  const addWater = useDailyStore((s) => s.addWater);
  const setMood = useDailyStore((s) => s.setMood);
  const streaks = useStreaksStore();
  const studyTasks = useStudyStore((s) => s.tasks);
  const customMorning = useCustomHabitsStore((s) => s.morning);
  const customEvening = useCustomHabitsStore((s) => s.evening);
  const customHabitIds = [...customMorning, ...customEvening].map((h) => h.id);
  const customCount = customHabitIds.length;

  const studyDone = studyTasks.filter((t) => t.status === "done").length;
  const progress = computeProgressFull(slate, studyDone, studyTasks.length, customCount);

  const greetingIdx = dayOfYear() % GREETINGS.length;

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
      <header className="mb-10">
        <div className="flex items-start gap-3">
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            {GREETINGS[greetingIdx]}
          </h1>
          <Sparkles size={22} strokeWidth={1.5} className="text-[var(--primary)] mt-3" />
        </div>
        <p className="font-display italic text-lg text-[var(--muted-foreground)] mt-2">
          {formatLong()}
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Streak */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                Current streak
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-mono text-4xl">{streaks.current}</span>
                <span className="text-sm text-[var(--muted-foreground)]">day streak</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Longest: <span className="font-mono">{streaks.longest}</span>
              </p>
            </div>
            <Flame
              size={28}
              strokeWidth={1.5}
              className="text-[var(--primary)] transition-transform duration-300"
              style={{ transform: streaks.current >= 7 ? "scale(1.25)" : "scale(1)" }}
            />
          </div>
          <MiniWeekDots customHabitIds={customHabitIds} />
        </Card>

        {/* Water */}
        <Card>
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            Water
          </p>
          <div className="flex items-center gap-4 mt-2">
            <WaterBottle ml={slate.water} />
            <div className="flex-1">
              <p className="font-mono text-2xl">
                {slate.water}
                <span className="text-sm text-[var(--muted-foreground)]"> / 2500 ml</span>
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => addWater(-250)}
                  disabled={slate.water <= 0}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[var(--radius-button)] border border-border disabled:opacity-30 hover:bg-[var(--highlight)] transition-colors"
                >
                  <Minus size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => addWater(250)}
                  disabled={slate.water >= 2500}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[var(--radius-button)] bg-[var(--primary)] text-white disabled:opacity-30 hover:bg-[#b3736a] transition-colors"
                >
                  <Plus size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Mood */}
        <Card>
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            How are you today
          </p>
          <div className="mt-3">
            <MoodPicker value={slate.mood} onChange={setMood} />
          </div>
        </Card>

        {/* Progress */}
        <Card className="md:col-span-2">
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            Today's progress
          </p>
          <div className="mt-4">
            <ThinProgress value={progress.pct} />
            <p className="font-mono text-xs text-[var(--muted-foreground)] mt-2">
              {progress.checked} / {progress.total} completed
            </p>
          </div>
        </Card>

        {/* Quote Card (replaces PlantGrowth + old quote card) */}
        {(() => {
          const quoteIdx = dayOfYear() % QUOTES.length;
          const quote = QUOTES[quoteIdx];
          const IconComponent = ICON_MAP[quote.icon];
          return (
            <Card className="md:col-span-3" style={{ background: "var(--highlight)" }}>
              <div className="flex flex-col items-center text-center">
                {IconComponent && (
                  <IconComponent size={28} strokeWidth={1.5} className="text-[var(--primary)]" />
                )}
                <p className="font-display italic text-2xl md:text-3xl mt-6 mb-4 leading-relaxed">
                  {quote.text}
                </p>
                {quote.author && (
                  <p className="font-mono text-sm text-[var(--muted-foreground)]">
                    — {quote.author}
                  </p>
                )}
              </div>
            </Card>
          );
        })()}

        {/* Top 3 goals */}
        <Card>
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
            Top 3 goals today
          </p>
          {slate.morningPlanning.goals.some((g) => g.trim()) ? (
            <ol className="mt-3 space-y-2">
              {slate.morningPlanning.goals.map((g, i) =>
                g.trim() ? (
                  <li key={i} className="text-sm flex gap-3">
                    <span className="font-mono text-[var(--primary)]">{i + 1}</span>
                    <span>{g}</span>
                  </li>
                ) : null,
              )}
            </ol>
          ) : (
            <Link
              to="/routine"
              className="block mt-4 font-display italic text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
            >
              Set your intentions in Morning Routine →
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
}
