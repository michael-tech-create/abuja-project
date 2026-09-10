export type BudgetTier = "budget" | "mid" | "premium" | "luxury";

export const BUDGET_TIERS: {
  value: BudgetTier;
  label: string;
  hint: string;
  min: number;
  max: number | null;
}[] = [
  {
    value: "budget",
    label: "Budget",
    hint: "Under ₦2m / year",
    min: 0,
    max: 2_000_000,
  },
  {
    value: "mid",
    label: "Mid-range",
    hint: "₦2m – ₦5m / year",
    min: 2_000_000,
    max: 5_000_000,
  },
  {
    value: "premium",
    label: "Premium",
    hint: "₦5m – ₦15m / year",
    min: 5_000_000,
    max: 15_000_000,
  },
  {
    value: "luxury",
    label: "Luxury",
    hint: "₦15m+ / year",
    min: 15_000_000,
    max: null,
  },
];

/** Classify annual rent (NGN) into a budget band. */
export function classifyBudget(price: number | string): BudgetTier {
  const value = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(value) || value < 2_000_000) return "budget";
  if (value < 5_000_000) return "mid";
  if (value < 15_000_000) return "premium";
  return "luxury";
}

export function budgetLabel(tier: BudgetTier) {
  return BUDGET_TIERS.find((t) => t.value === tier)?.label ?? tier;
}

export function budgetHint(tier: BudgetTier) {
  return BUDGET_TIERS.find((t) => t.value === tier)?.hint ?? "";
}

export function budgetRange(tier: BudgetTier): {
  minPrice?: number;
  maxPrice?: number;
} {
  const band = BUDGET_TIERS.find((t) => t.value === tier);
  if (!band) return {};
  return {
    minPrice: band.min > 0 ? band.min : undefined,
    maxPrice: band.max ?? undefined,
  };
}
