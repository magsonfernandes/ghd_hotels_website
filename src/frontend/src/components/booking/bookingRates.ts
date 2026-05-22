/**
 * Shared booking-rate contracts.
 *
 * Pricing is no longer hard-coded here — it now flows from the server's
 * `/api/rates` endpoint and is consumed via `useRates()` from `src/lib/rates`.
 * This file keeps the (back-compat) named exports so existing imports
 * continue to work; the concrete numbers come from the live payload.
 *
 * `SEED_RATES_CLIENT` mirrors the values that the server seeds with on first
 * boot and is used as a fallback when the network is unreachable.
 */

/** Room category ids are now arbitrary slugs sourced from the API. */
export type RoomCategoryId = string;

export type RoomCategory = {
  id: RoomCategoryId;
  label: string;
  /** Short hint shown under room title. */
  shortDescription: string;
  /** Base rate per room per night (before meals, before tax). */
  roomOnly: { original: number; discounted: number };
};

export type MealSelection = {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
};

export type BookingRateSelection = {
  rooms: Array<{
    categoryId: RoomCategoryId;
    categoryLabel: string;
    quantity: number;
    /** Base ₹ per room per night (discounted room rate, before meal add-ons) */
    baseRatePerNight: number;
  }>;
  meals: MealSelection;
};

/**
 * Day-one defaults — kept in sync with `SEED_RATES` in `server/rates.ts`.
 * Used as fallback when the API is unreachable on first paint.
 */
export const SEED_RATES_CLIENT = {
  version: 1 as const,
  taxRate: 0.18,
  mealPrices: { perAdult: 500, perChild: 250 },
  roomCategories: [
    {
      id: "studio-apartment",
      label: "Royal Studio",
      shortDescription: "Modern smart comfort — ideal for 2 guests.",
      roomOnly: { original: 7500, discounted: 5999 },
    },
  ] as RoomCategory[],
};

export function countSelectedMeals(m: MealSelection): number {
  return (m.breakfast ? 1 : 0) + (m.lunch ? 1 : 0) + (m.dinner ? 1 : 0);
}

/**
 * Total meal add-on cost per night for the given party composition.
 * `mealPrices` should come from `useRates().mealPrices`; if omitted, the
 * day-one seed values are used so this function stays usable in isolation.
 */
export function perGuestMealsPerNightTotal(args: {
  adults: number;
  children: number;
  meals: MealSelection;
  mealPrices?: { perAdult: number; perChild: number };
}): number {
  const meals = countSelectedMeals(args.meals);
  const prices = args.mealPrices ?? SEED_RATES_CLIENT.mealPrices;
  const perMeal =
    args.adults * prices.perAdult + args.children * prices.perChild;
  return meals * perMeal;
}
