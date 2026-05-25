import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import * as storage from "@/lib/storage";
import { todayKey, weekKey } from "@/lib/date";

export interface HabitDef {
  id: string;
  name: string;
  note: string;
  time?: string;
  expandable?: "planning" | "journal";
}

export const MORNING_HABITS: HabitDef[] = [
  { id: "m1", time: "6:30 AM", name: "Wake up by 6:30 AM", note: "No phone scrolling, open curtains, drink warm water" },
  { id: "m2", name: "Make bed & clean space", note: "Declutter, dirty clothes basket" },
  { id: "m3", name: "Toilet + freshen up", note: "" },
  { id: "m4", name: "Shower + skincare", note: "Affirmations, gratitude, positive self-talk" },
  { id: "m5", name: "Yoga / Surya Namaskar", note: "10–12 rounds, stretching, mobility" },
  { id: "m6", name: "Pranayama", note: "Anulom Vilom, Bhramari, deep breathing" },
  { id: "m7", name: "Meditation", note: "10–15 mins, calm + visualization" },
  { id: "m8", name: "Prepare healthy breakfast", note: "" },
  { id: "m9", name: "Breakfast mindfully", note: "No reels while eating" },
  { id: "m10", name: "Morning affirmation + planning", note: "", expandable: "planning" as const },
];

export const EVENING_HABITS: HabitDef[] = [
  { id: "e1", name: "Snack + hydration", note: "" },
  { id: "e2", name: "Walk / light workout", note: "Walk, stretch, dance/cardio, sunlight" },
  { id: "e3", name: "Dinner", note: "" },
  { id: "e4", name: "Family time / relax", note: "Light entertainment, music" },
  { id: "e5", name: "Night skincare", note: "Body care, hair care, hygiene" },
  { id: "e6", name: "Meditation + evening affirmation", note: "Peace, gratitude, self-worth" },
  { id: "e7", name: "Journaling", note: "", expandable: "journal" as const },
  { id: "e8", time: "11:30 PM", name: "Sleep by 11:30 PM", note: "No phone, dark room, calm music" },
];

export type NoRuleIcon = "UtensilsCrossed" | "GlassWater" | "Candy" | "Clock" | "Smartphone" | "VideoOff";

export const NO_RULES: { id: string; name: string; icon: NoRuleIcon }[] = [
  { id: "junk", name: "No junk food", icon: "UtensilsCrossed" },
  { id: "cold", name: "No cold drinks", icon: "GlassWater" },
  { id: "sugar", name: "Less sugar", icon: "Candy" },
  { id: "procrastinate", name: "No procrastination", icon: "Clock" },
  { id: "scroll", name: "No phone scrolling", icon: "Smartphone" },
  { id: "reels", name: "No reels while eating", icon: "VideoOff" },
];

export const SELF_CARE_ITEMS = ["am_skin", "pm_skin", "hair", "body", "meditation", "book"] as const;

export interface MorningPlanning {
  goals: [string, string, string];
  gratitude: string;
  improve: string;
}

export interface Journal {
  wentWell: string;
  improve: string;
  moodNote: string;
  wins: string;
  tomorrow: string;
}

export interface DailySlate {
  date: string;
  habits: Record<string, boolean>; // includes morning, evening
  water: number; // ml
  mood: string | null; // one of mood ids
  meals: { id: string; name: string; tags: string[] }[];
  noRules: Record<string, boolean>;
  selfCare: Record<string, boolean>;
  haircareCount: number;
  bookMinutes: number;
  selfCareTreat: string;
  sleepAt: string; // "HH:MM"
  wokeAt: string;
  sleepNote: string;
  workoutDone: boolean | null; // null = not set, true=done, false=skipped
  workoutNote: string;
  sugar: "low" | "medium" | "high" | null;
  junkAvoided: boolean | null;
  studyTaskMinutesActual: Record<string, number>; // taskId -> minutes
  morningPlanning: MorningPlanning;
  journal: Journal;
  affirmation: string;
}

const emptyPlanning = (): MorningPlanning => ({
  goals: ["", "", ""],
  gratitude: "",
  improve: "",
});
const emptyJournal = (): Journal => ({
  wentWell: "",
  improve: "",
  moodNote: "",
  wins: "",
  tomorrow: "",
});

export function emptySlate(date: string): DailySlate {
  return {
    date,
    habits: {},
    water: 0,
    mood: null,
    meals: [],
    noRules: {},
    selfCare: {},
    haircareCount: 0,
    bookMinutes: 0,
    selfCareTreat: "",
    sleepAt: "",
    wokeAt: "",
    sleepNote: "",
    workoutDone: null,
    workoutNote: "",
    sugar: null,
    junkAvoided: null,
    studyTaskMinutesActual: {},
    morningPlanning: emptyPlanning(),
    journal: emptyJournal(),
    affirmation: "",
  };
}

function loadOrInit(date: string): DailySlate {
  const raw = storage.getDaily<Partial<DailySlate>>(date);
  return { ...emptySlate(date), ...(raw ?? {}) };
}

interface DailyState {
  date: string;
  slate: DailySlate;
  hydrate: () => void;
  patch: (p: Partial<DailySlate>) => void;
  toggleHabit: (id: string) => void;
  addWater: (delta: number) => void;
  setMood: (m: string) => void;
  addMeal: (m: { id: string; name: string; tags: string[] }) => void;
  removeMealAt: (index: number) => void;
  toggleNoRule: (id: string) => void;
  toggleSelfCare: (id: string) => void;
  incHaircare: () => void;
  setStudyMinutes: (taskId: string, minutes: number) => void;
}

function persist(slate: DailySlate) {
  storage.setDaily(slate.date, slate as unknown as Record<string, unknown>);
}

export const useDailyStore = create<DailyState>()(
  subscribeWithSelector((set, get) => ({
    date: todayKey(),
    slate: emptySlate(todayKey()),
    hydrate: () => {
      const date = todayKey();
      set({ date, slate: loadOrInit(date) });
    },
    patch: (p) => {
      const slate = { ...get().slate, ...p };
      persist(slate);
      set({ slate });
    },
    toggleHabit: (id) => {
      const habits = { ...get().slate.habits, [id]: !get().slate.habits[id] };
      // sync routine meditation <-> self-care meditation
      const selfCare = { ...get().slate.selfCare };
      if (id === "m7" || id === "e6") {
        const anyMed = habits["m7"] || habits["e6"];
        selfCare["meditation"] = !!anyMed;
      }
      const slate = { ...get().slate, habits, selfCare };
      persist(slate);
      set({ slate });
    },
    addWater: (delta) => {
      const water = Math.max(0, Math.min(2500, get().slate.water + delta));
      const slate = { ...get().slate, water };
      persist(slate);
      set({ slate });
    },
    setMood: (mood) => {
      const slate = { ...get().slate, mood };
      persist(slate);
      set({ slate });
    },
    addMeal: (m) => {
      const meals = [...get().slate.meals, m];
      const slate = { ...get().slate, meals };
      persist(slate);
      set({ slate });
    },
    removeMealAt: (index) => {
      const meals = get().slate.meals.filter((_, i) => i !== index);
      const slate = { ...get().slate, meals };
      persist(slate);
      set({ slate });
    },
    toggleNoRule: (id) => {
      const noRules = { ...get().slate.noRules, [id]: !get().slate.noRules[id] };
      const slate = { ...get().slate, noRules };
      persist(slate);
      set({ slate });
    },
    toggleSelfCare: (id) => {
      const selfCare = { ...get().slate.selfCare, [id]: !get().slate.selfCare[id] };
      const habits = { ...get().slate.habits };
      if (id === "meditation") {
        habits["m7"] = !!selfCare["meditation"];
      }
      const slate = { ...get().slate, selfCare, habits };
      persist(slate);
      set({ slate });
    },
    incHaircare: () => {
      const slate = { ...get().slate, haircareCount: get().slate.haircareCount + 1 };
      persist(slate);
      set({ slate });
    },
    setStudyMinutes: (taskId, minutes) => {
      const studyTaskMinutesActual = {
        ...get().slate.studyTaskMinutesActual,
        [taskId]: minutes,
      };
      const slate = { ...get().slate, studyTaskMinutesActual };
      persist(slate);
      set({ slate });
    },
  })),
);

// Streaks store
interface StreaksState {
  current: number;
  longest: number;
  workoutCurrent: number;
  workoutLongest: number;
  noRules: Record<string, { current: number; longest: number }>;
  hydrate: () => void;
  set: (patch: Partial<StreaksState>) => void;
}

export const useStreaksStore = create<StreaksState>()((set) => ({
  current: 0,
  longest: 0,
  workoutCurrent: 0,
  workoutLongest: 0,
  noRules: {},
  hydrate: () => {
    const s = storage.get<Partial<StreaksState>>("streaks");
    if (s) set(s);
  },
  set: (patch) => {
    set((prev) => {
      const next = { ...prev, ...patch };
      storage.set("streaks", {
        current: next.current,
        longest: next.longest,
        workoutCurrent: next.workoutCurrent,
        workoutLongest: next.workoutLongest,
        noRules: next.noRules,
      });
      return next;
    });
  },
}));

// Food DB store
import type { Food } from "@/lib/foodDb";

interface FoodDbState {
  custom: Food[];
  hydrate: () => void;
  add: (f: Food) => void;
}
export const useFoodDbStore = create<FoodDbState>()((set, get) => ({
  custom: [],
  hydrate: () => {
    const s = storage.get<Food[]>("foodDb");
    if (s) set({ custom: s });
  },
  add: (f) => {
    const custom = [...get().custom, f];
    storage.set("foodDb", custom);
    set({ custom });
  },
}));

// Study store
export interface StudyTask {
  id: string;
  name: string;
  minutes: number;
  status: "todo" | "in_progress" | "done";
}

const DEFAULT_STUDY: StudyTask[] = [
  { id: "py", name: "Python practice", minutes: 45, status: "todo" },
  { id: "sql", name: "SQL practice", minutes: 30, status: "todo" },
  { id: "proj", name: "Project / portfolio work", minutes: 30, status: "todo" },
  { id: "eng", name: "English + communication skills", minutes: 60, status: "todo" },
  { id: "free", name: "Freelancing / career building", minutes: 60, status: "todo" },
  { id: "code", name: "Coding practice", minutes: 45, status: "todo" },
];

interface StudyState {
  tasks: StudyTask[];
  hydrate: () => void;
  add: (name: string, minutes: number) => void;
  update: (id: string, p: Partial<StudyTask>) => void;
  remove: (id: string) => void;
}

export const useStudyStore = create<StudyState>()((set, get) => ({
  tasks: DEFAULT_STUDY,
  hydrate: () => {
    const s = storage.get<StudyTask[]>("study");
    if (s) set({ tasks: s });
    else storage.set("study", DEFAULT_STUDY);
  },
  add: (name, minutes) => {
    const tasks = [
      ...get().tasks,
      { id: crypto.randomUUID(), name, minutes, status: "todo" as const },
    ];
    storage.set("study", tasks);
    set({ tasks });
  },
  update: (id, p) => {
    const tasks = get().tasks.map((t) => (t.id === id ? { ...t, ...p } : t));
    storage.set("study", tasks);
    set({ tasks });
  },
  remove: (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    storage.set("study", tasks);
    set({ tasks });
  },
}));

// Media store
interface MediaState {
  videos: Record<string, string>; // slot -> url
  hydrate: () => void;
  setVideo: (slot: string, url: string) => void;
}
export const useMediaStore = create<MediaState>()((set, get) => ({
  videos: {},
  hydrate: () => {
    const s = storage.get<Record<string, string>>("media");
    if (s) set({ videos: s });
  },
  setVideo: (slot, url) => {
    const videos = { ...get().videos, [slot]: url };
    storage.set("media", videos);
    set({ videos });
  },
}));

// Settings store (vision goals)
const DEFAULT_GOALS = [
  { icon: "Banknote", text: "I am earning ₹1 lakh per month" },
  { icon: "Heart", text: "Healthy, glowing, strong body" },
  { icon: "Laptop", text: "Dream job in AI / Tech" },
  { icon: "Video", text: "Growing personal brand + YouTube channel" },
  { icon: "TrendingUp", text: "Financial independence" },
  { icon: "Globe", text: "Travel + beautiful lifestyle" },
];

interface SettingsState {
  goals: { icon: string; text: string }[];
  hydrate: () => void;
  setGoalText: (i: number, text: string) => void;
}
export const useSettingsStore = create<SettingsState>()((set, get) => ({
  goals: DEFAULT_GOALS,
  hydrate: () => {
    const s = storage.get<{ icon: string; text: string }[]>("settings.goals");
    if (s) set({ goals: s });
  },
  setGoalText: (i, text) => {
    const goals = get().goals.map((g, idx) => (idx === i ? { ...g, text } : g));
    storage.set("settings.goals", goals);
    set({ goals });
  },
}));

// Hair care weekly helper — count this week's haircare across archived dailies
export function haircareThisWeek(): number {
  const wk = weekKey();
  const recent = storage.listRecentDailies(30);
  let total = 0;
  for (const { date, data } of recent) {
    if (weekKey(new Date(date + "T00:00:00")) === wk) {
      total += (data as Partial<DailySlate>).haircareCount ?? 0;
    }
  }
  return total;
}

// ============= Custom habits store =============
export interface CustomHabit { id: string; name: string; note: string }
export type HabitSection = "morning" | "evening";

interface CustomHabitsState {
  morning: CustomHabit[];
  evening: CustomHabit[];
  hydrate: () => void;
  addHabit: (section: HabitSection, name: string, note: string) => void;
  removeHabit: (section: HabitSection, id: string) => void;
}

export const useCustomHabitsStore = create<CustomHabitsState>()((set, get) => ({
  morning: [],
  evening: [],
  hydrate: () => {
    const s = storage.get<{ morning: CustomHabit[]; evening: CustomHabit[] }>("custom_habits");
    if (s) set({ morning: s.morning ?? [], evening: s.evening ?? [] });
  },
  addHabit: (section, name, note) => {
    const item: CustomHabit = { id: crypto.randomUUID(), name, note };
    const list = [...get()[section], item];
    const next = { ...get(), [section]: list };
    storage.set("custom_habits", { morning: next.morning, evening: next.evening });
    set({ [section]: list } as Partial<CustomHabitsState>);
  },
  removeHabit: (section, id) => {
    const list = get()[section].filter((h) => h.id !== id);
    const next = { ...get(), [section]: list };
    storage.set("custom_habits", { morning: next.morning, evening: next.evening });
    set({ [section]: list } as Partial<CustomHabitsState>);
  },
}));

export function customHabitsCount(): number {
  const s = storage.get<{ morning: CustomHabit[]; evening: CustomHabit[] }>("custom_habits");
  return (s?.morning?.length ?? 0) + (s?.evening?.length ?? 0);
}
