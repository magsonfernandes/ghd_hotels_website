/** Public booking rates seed (mirrors server/rates.ts SEED_RATES for Vercel API). */
export const SEED_RATES = {
  version: 1 as const,
  updatedAt: new Date(0).toISOString(),
  taxRate: 0.05,
  mealPrices: { perAdult: 500, perChild: 250 },
  roomCategories: [
    {
      id: "studio-apartment",
      label: "Royal Studio",
      shortDescription: "Modern smart comfort — ideal for 2 guests.",
      roomOnly: { original: 7500, discounted: 7499 },
    },
  ],
};
