/**
 * Single source of truth for bookable rates (₹ per room per night, before tax).
 * RoomCard / checkout must use these values so displayed totals always match.
 */
export const NIVAARA_STUDIO_RATES = {
  roomOnly: { original: 7500, discounted: 5999 },
  breakfast: { original: 9200, discounted: 7699 },
} as const;

export const BOOKING_TAX_RATE = 0.18;

export type BookingRateSelection = {
  roomOnly: number;
  breakfast: number;
  /** Discounted ₹/room/night — must equal NIVAARA_STUDIO_RATES.*.discounted at book time */
  roomOnlyPerNight: number;
  breakfastPerNight: number;
};
