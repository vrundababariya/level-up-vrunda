import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, X, CheckCircle2, Circle, Leaf, Utensils, BookOpen, Sparkles, Scissors, Brain, Flower2 } from "lucide-react";
import { Card } from "@/components/Card";
import { PillButton } from "@/components/PillButton";
import { EmptyState } from "@/components/EmptyState";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  SEED_FOODS, BODY_SYSTEMS, SYSTEM_MAP, ALL_SUBCATEGORIES,
  type Food, type BodySystem, type Subcategory, suggestForSystem, foodMatchesSystem,
} from "@/lib/foodDb";
import { useDailyStore, useFoodDbStore } from "@/stores";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/meals")({
  head: () => ({
    meta: [
      { title: "Meal Logger — Level Up Girl" },
      { name: "description", content: "Nourishment by body system — gut, skin, hair, brain, heart, reproductive." },
      { property: "og:title", content: "Meal Logger — Level Up Girl" },
      { property: "og:description", content: "Log meals and see what your body still needs today." },
      { property: "og:url", content: "/meals" },
    ],
  }),
  component: MealsPage,
});

function coverage(foods: Food[], system: BodySystem): "covered" | "none" {
  const want = SYSTEM_MAP[system];
  const foodTags = foods.flatMap(f => f.tags);
  const hasMatch = want.some(tag => foodTags.includes(tag));
  return hasMatch ? "covered" : "none";
}

const HEALTH_FOOD_DATA = {
  gut: {
    icon: Leaf,
    subcategories: {
      "Prebiotics": ["Garlic", "Onion", "Banana", "Oats"],
      "Probiotics": ["Curd", "Idli", "Dosa", "Dhokla", "Appam"],
      "Fiber / Whole Grains": ["Oats", "Whole wheat", "Brown rice", "Ragi", "Semolina", "Barley", "Pearl millet", "Corn"],
      "Also good": ["Vegetables", "Fruits", "Seeds"],
    }
  },
  skin: {
    icon: Sparkles,
    subcategories: {
      "Hydration": ["Water", "Watermelon", "Oranges", "Coconut water", "Cucumbers", "Bottle gourd", "Leafy greens", "Strawberries", "Chaas"],
      "Vitamin C": ["Mandarins", "Sweet oranges", "Limes", "Lemons", "Guava"],
      "Vitamin E": ["Nuts", "Seeds"],
      "Vitamin A": ["Carrot", "Pumpkin", "Spinach"],
      "Antioxidants": ["Strawberries", "Mandarins", "Oranges", "Limes", "Lemons"],
    }
  },
  hair: {
    icon: Scissors,
    subcategories: {
      "Protein & Biotin": ["Sprouts", "Lentils", "Nuts", "Seeds"],
      "Zinc & Iron": ["Pumpkin", "Spinach", "Legumes"],
      "Healthy Oils (for massage)": ["Coconut oil", "Castor oil", "Almond oil"],
    }
  },
  heart: {
    icon: Circle, // Using Circle as placeholder - Heart is the system name
    subcategories: {
      "Healthy Fats": ["Nuts", "Seeds", "Healthy oils"],
      "Fiber / Whole Grains": ["Oats", "Whole wheat", "Brown rice", "Ragi", "Semolina", "Barley", "Pearl millet", "Corn"],
      "Omega-3 Fatty Acids": ["Flax seeds", "Chia seeds", "Walnuts"],
      "Exercise": ["30–60 min daily"],
    }
  },
  brain: {
    icon: Brain,
    subcategories: {
      "Omega-3 Fatty Acids": ["Walnuts", "Flax seeds", "Chia seeds"],
      "B Vitamins": ["Oats", "Whole wheat", "Brown rice", "Ragi", "Semolina", "Barley", "Pearl millet", "Corn", "Legumes", "Green leafy vegetables"],
      "Magnesium": ["Nuts", "Seeds", "Spinach"],
    }
  },
  reproductive: {
    icon: Flower2,
    subcategories: {
      "Zinc & Selenium": ["Pumpkin seeds", "Nuts", "Oats", "Whole wheat", "Brown rice", "Ragi", "Barley", "Bajra", "Corn"],
      "Folate": ["Spinach", "Legumes", "Flaxseed"],
      "Vitamin E & Healthy Fats": ["Nuts", "Seeds", "Healthy oils"],
    }
  }
};

function HealthFoodReference({ 
  onFoodTap, 
  allFoods 
}: { 
  onFoodTap: (foodName: string) => void;
  allFoods: Food[];
}) {
  const systemIcons: Record<BodySystem, typeof Leaf> = {
    gut: Leaf,
    skin: Sparkles,
    hair: Scissors,
    heart: Brain, // Using Brain temporarily for heart - will update with actual Heart icon usage
    brain: Brain,
    reproductive: Flower2,
  };

  const systemIconsMap: Record<string, typeof Leaf> = {
    "gut": Leaf,
    "skin": Sparkles,
    "hair": Scissors,
    "heart": Brain,
    "brain": Brain,
    "reproductive": Flower2,
  };

  return (
    <Card>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={20} strokeWidth={1.5} className="text-[var(--primary)]" />
          <h3 className="font-display text-xl">Health Food Reference</h3>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">Tap any system to see recommended foods</p>
      </div>

      <Accordion type="single" collapsible>
        {BODY_SYSTEMS.map((system) => {
          const data = HEALTH_FOOD_DATA[system.id as BodySystem];
          const SystemIcon = systemIconsMap[system.id];

          return (
            <AccordionItem key={system.id} value={system.id}>
              <AccordionTrigger className="text-base font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <SystemIcon size={18} strokeWidth={1.5} className="text-[var(--primary)]" />
                  {system.label}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {Object.entries(data.subcategories).map(([category, foods]) => (
                    <div key={category}>
                      <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {foods.map((food) => (
                          <button
                            key={food}
                            onClick={() => onFoodTap(food)}
                            className="text-xs px-2.5 py-1 rounded-full bg-[var(--highlight)] border border-border hover:bg-[var(--accent)] hover:text-white transition-colors"
                          >
                            {food}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Card>
  );
}

function MealsPage() {
  const slate = useDailyStore((s) => s.slate);
  const addMeal = useDailyStore((s) => s.addMeal);
  const removeMealAt = useDailyStore((s) => s.removeMealAt);
  const customFoods = useFoodDbStore((s) => s.custom);
  const addCustom = useFoodDbStore((s) => s.add);

  const allFoods = useMemo(() => [...SEED_FOODS, ...customFoods], [customFoods]);

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPrefilledName, setModalPrefilledName] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const todaysFoods: Food[] = slate.meals.map((m) => ({
    id: m.id,
    name: m.name,
    tags: m.tags as Subcategory[],
  }));

  const covered = BODY_SYSTEMS.filter((s) => coverage(todaysFoods, s.id) === "covered").length;

  const filtered = query.trim()
    ? allFoods.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : allFoods.slice(0, 16);

  const handleHealthFoodTap = (foodName: string) => {
    const foundFood = allFoods.find((f) => f.name.toLowerCase() === foodName.toLowerCase());
    if (foundFood) {
      addMeal(foundFood);
      setToastMessage(`Added ${foodName}!`);
      setTimeout(() => setToastMessage(""), 2000);
    } else {
      setModalPrefilledName(foodName);
      setModalOpen(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-12 space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-40 bg-[var(--success)] text-white px-4 py-2 rounded-[var(--radius-button)] text-sm animate-in fade-in duration-300">
          {toastMessage}
        </div>
      )}

      <header className="flex items-center gap-3">
        <Leaf size={24} strokeWidth={1.5} className="text-[var(--success)]" />
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Meal Logger</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Body nourishment score: <span className="font-mono">{covered} / 6</span> systems covered today
          </p>
        </div>
      </header>

      {/* Body system cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {BODY_SYSTEMS.map((s) => {
          const status = coverage(todaysFoods, s.id);
          const Icon = status === "covered" ? CheckCircle2 : Circle;
          const color = status === "covered" ? "var(--success)" : "var(--muted-foreground)";
          return (
            <Card key={s.id} className="p-4">
              <div className="flex items-center gap-2">
                <Icon size={18} strokeWidth={1.5} style={{ color }} />
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              {status !== "covered" && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {suggestForSystem(s.id, 3, allFoods).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => addMeal({ id: f.id, name: f.name, tags: f.tags })}
                      className="text-[11px] px-2.5 py-1 rounded-[var(--radius-pill)] bg-[var(--highlight)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                    >
                      + {f.name}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Health Food Reference */}
      <HealthFoodReference onFoodTap={handleHealthFoodTap} allFoods={allFoods} />

      {/* Search */}
      <Card>
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Search size={16} strokeWidth={1.5} className="text-[var(--muted-foreground)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs text-[var(--primary)] hover:underline whitespace-nowrap"
          >
            + Add new food
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {filtered.map((f) => (
            <button
              key={f.id}
              onClick={() => addMeal({ id: f.id, name: f.name, tags: f.tags })}
              className="text-sm px-3 py-1.5 rounded-[var(--radius-pill)] border border-border hover:bg-[var(--highlight)] transition-colors"
            >
              {f.name}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)] italic">
              No food matches. Add it as a new entry.
            </p>
          )}
        </div>
      </Card>

      {/* Today's meals */}
      <Card>
        <h3 className="font-display text-xl">Today's meals</h3>
        {slate.meals.length === 0 ? (
          <EmptyState icon={Utensils} message="Nourish yourself. Log your first meal of the day." />
        ) : (
          <ul className="mt-3 space-y-2">
            {slate.meals.map((m, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-3 p-3 rounded-[var(--radius-button)] bg-[var(--background)] border border-border"
              >
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {m.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--highlight)] text-[var(--muted-foreground)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => removeMealAt(i)}
                  className="text-[var(--muted-foreground)] hover:text-destructive"
                  aria-label="Remove"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {modalOpen && (
        <AddFoodModal
          prefilledName={modalPrefilledName}
          onClose={() => {
            setModalOpen(false);
            setModalPrefilledName("");
          }}
          onSave={(f) => {
            addCustom(f);
            addMeal(f);
            setModalOpen(false);
            setModalPrefilledName("");
            setToastMessage(`Added ${f.name}!`);
            setTimeout(() => setToastMessage(""), 2000);
          }}
        />
      )}
    </div>
  );
}

function AddFoodModal({
  prefilledName = "",
  onClose, 
  onSave,
}: { 
  prefilledName?: string;
  onClose: () => void; 
  onSave: (f: Food) => void;
}) {
  const [name, setName] = useState(prefilledName);
  const [tags, setTags] = useState<Subcategory[]>([]);
  const toggle = (t: Subcategory) =>
    setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-[var(--radius)] p-6 max-w-md w-full shadow-card max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">Add new food</h3>
          <button onClick={onClose}><X size={18} strokeWidth={1.5} /></button>
        </div>
        <label className="text-xs text-[var(--muted-foreground)]">Food name</label>
        <input
          autoFocus={!prefilledName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-transparent border-b border-border focus:border-[var(--primary)] outline-none text-sm py-1.5 mb-4"
        />
        <label className="text-xs text-[var(--muted-foreground)]">Categories</label>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {ALL_SUBCATEGORIES.map((t) => {
            const active = tags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggle(t)}
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-[var(--radius-pill)] border transition-colors",
                  active
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "border-border hover:bg-[var(--highlight)]",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <PillButton variant="outline" onClick={onClose}>Cancel</PillButton>
          <PillButton
            disabled={!name.trim() || tags.length === 0}
            onClick={() =>
              onSave({
                id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
                name: name.trim(),
                tags,
              })
            }
          >
            <Plus size={14} strokeWidth={1.8} /> Save
          </PillButton>
        </div>
      </div>
    </div>
  );
}
