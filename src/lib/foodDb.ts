export type Subcategory =
  | "Probiotic"
  | "Prebiotic"
  | "Fiber"
  | "Whole Grain"
  | "Hydration"
  | "Vitamin C"
  | "Vitamin E"
  | "Vitamin A"
  | "Antioxidants"
  | "Protein"
  | "Zinc"
  | "Iron"
  | "Biotin"
  | "Healthy Fats"
  | "Omega-3"
  | "B Vitamins"
  | "Magnesium"
  | "Selenium"
  | "Folate";

export const ALL_SUBCATEGORIES: Subcategory[] = [
  "Probiotic",
  "Prebiotic",
  "Fiber",
  "Whole Grain",
  "Hydration",
  "Vitamin C",
  "Vitamin E",
  "Vitamin A",
  "Antioxidants",
  "Protein",
  "Zinc",
  "Iron",
  "Biotin",
  "Healthy Fats",
  "Omega-3",
  "B Vitamins",
  "Magnesium",
  "Selenium",
  "Folate",
];

export type BodySystem =
  | "gut"
  | "skin"
  | "hair"
  | "brain"
  | "heart"
  | "reproductive";

export const BODY_SYSTEMS: { id: BodySystem; label: string }[] = [
  { id: "gut", label: "Gut Health" },
  { id: "skin", label: "Skin Health" },
  { id: "hair", label: "Hair Health" },
  { id: "brain", label: "Brain Health" },
  { id: "heart", label: "Heart Health" },
  { id: "reproductive", label: "Reproductive Health" },
];

export const SYSTEM_MAP: Record<BodySystem, Subcategory[]> = {
  gut: ["Probiotic", "Prebiotic", "Fiber", "Whole Grain"],
  skin: ["Hydration", "Vitamin C", "Vitamin E", "Vitamin A", "Antioxidants"],
  hair: ["Protein", "Zinc", "Iron", "Biotin", "Healthy Fats"],
  brain: ["Omega-3", "B Vitamins", "Magnesium"],
  heart: ["Healthy Fats", "Fiber", "Omega-3"],
  reproductive: ["Zinc", "Selenium", "Folate", "Vitamin E", "Healthy Fats"],
};

export interface Food {
  id: string;
  name: string;
  tags: Subcategory[];
}

export const SEED_FOODS: Food[] = [
  { id: "curd", name: "Curd", tags: ["Probiotic"] },
  { id: "banana", name: "Banana", tags: ["Prebiotic", "Fiber"] },
  {
    id: "oats",
    name: "Oats",
    tags: ["Prebiotic", "Fiber", "Whole Grain", "B Vitamins"],
  },
  { id: "garlic", name: "Garlic", tags: ["Prebiotic"] },
  { id: "onion", name: "Onion", tags: ["Prebiotic"] },
  { id: "idli", name: "Idli", tags: ["Probiotic", "Whole Grain"] },
  { id: "dosa", name: "Dosa", tags: ["Probiotic"] },
  { id: "dhokla", name: "Dhokla", tags: ["Probiotic"] },
  { id: "appam", name: "Appam", tags: ["Probiotic"] },
  {
    id: "brown-rice",
    name: "Brown rice",
    tags: ["Whole Grain", "B Vitamins", "Fiber"],
  },
  {
    id: "whole-wheat",
    name: "Whole wheat",
    tags: ["Whole Grain", "Fiber", "B Vitamins"],
  },
  {
    id: "ragi",
    name: "Ragi / finger millet",
    tags: ["Whole Grain", "Fiber", "B Vitamins"],
  },
  {
    id: "bajra",
    name: "Bajra / pearl millet",
    tags: ["Whole Grain", "Fiber", "B Vitamins"],
  },
  {
    id: "barley",
    name: "Barley",
    tags: ["Whole Grain", "Fiber", "B Vitamins"],
  },
  {
    id: "corn",
    name: "Corn / maize",
    tags: ["Whole Grain", "Fiber", "B Vitamins"],
  },
  {
    id: "semolina",
    name: "Semolina / rava",
    tags: ["Whole Grain", "B Vitamins"],
  },
  {
    id: "spinach",
    name: "Spinach",
    tags: [
      "Vitamin A",
      "Iron",
      "Zinc",
      "Folate",
      "Magnesium",
      "B Vitamins",
    ],
  },
  { id: "carrot", name: "Carrot", tags: ["Vitamin A"] },
  { id: "pumpkin", name: "Pumpkin", tags: ["Vitamin A", "Zinc"] },
  { id: "watermelon", name: "Watermelon", tags: ["Hydration"] },
  { id: "coconut-water", name: "Coconut water", tags: ["Hydration"] },
  { id: "cucumber", name: "Cucumber", tags: ["Hydration"] },
  { id: "bottle-gourd", name: "Bottle gourd", tags: ["Hydration"] },
  {
    id: "orange",
    name: "Orange / citrus",
    tags: ["Vitamin C", "Antioxidants", "Hydration"],
  },
  { id: "guava", name: "Guava", tags: ["Vitamin C"] },
  {
    id: "strawberries",
    name: "Strawberries",
    tags: ["Vitamin C", "Antioxidants", "Hydration"],
  },
  { id: "lemon", name: "Lemon / lime", tags: ["Vitamin C", "Antioxidants"] },
  {
    id: "walnuts",
    name: "Walnuts",
    tags: ["Omega-3", "Healthy Fats", "Magnesium"],
  },
  {
    id: "flax",
    name: "Flax seeds",
    tags: ["Omega-3", "Folate", "Healthy Fats"],
  },
  { id: "chia", name: "Chia seeds", tags: ["Omega-3", "Healthy Fats"] },
  {
    id: "pumpkin-seeds",
    name: "Pumpkin seeds",
    tags: ["Zinc", "Selenium", "Healthy Fats"],
  },
  {
    id: "almonds",
    name: "Almonds / nuts",
    tags: ["Vitamin E", "Healthy Fats", "Magnesium", "Zinc", "B Vitamins"],
  },
  {
    id: "dal",
    name: "Dal / lentils",
    tags: ["Protein", "Fiber", "Folate", "B Vitamins"],
  },
  { id: "sprouts", name: "Sprouts", tags: ["Protein", "Zinc"] },
  {
    id: "legumes",
    name: "Legumes",
    tags: ["Fiber", "Folate", "B Vitamins", "Zinc"],
  },
  {
    id: "chaas",
    name: "Chaas / buttermilk",
    tags: ["Probiotic", "Hydration"],
  },
  { id: "coconut-oil", name: "Coconut oil", tags: ["Healthy Fats"] },
  { id: "castor-oil", name: "Castor oil", tags: ["Healthy Fats"] },
  { id: "almond-oil", name: "Almond oil", tags: ["Healthy Fats"] },
  {
    id: "eggs",
    name: "Eggs",
    tags: ["Protein", "Vitamin A", "B Vitamins"],
  },
];

export function foodMatchesSystem(food: Food, system: BodySystem): boolean {
  const wanted = SYSTEM_MAP[system];
  return food.tags.some((t) => wanted.includes(t));
}

export function suggestForSystem(
  system: BodySystem,
  n: number,
  pool: Food[] = SEED_FOODS,
): Food[] {
  return pool.filter((f) => foodMatchesSystem(f, system)).slice(0, n);
}
