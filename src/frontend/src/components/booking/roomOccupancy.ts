/** Hotel-style limits for the search bar (per room). */
export const MAX_BOOKING_ROOMS = 10;
export const MAX_GUESTS_PER_ROOM = 4;
export const MAX_CHILDREN_PER_ROOM = 2;
export const MAX_CHILD_AGE = 12;

/** ₹ per extra guest (3rd or 4th occupant) per room per night */
export const EXTRA_PERSON_SURCHARGE_PER_NIGHT = 1400;
/** ₹ per child aged 7–12 per room per night */
export const CHILD_OVER_6_SURCHARGE_PER_NIGHT = 750;

export type RoomOccupancy = {
  adults: number;
  children: number;
  /** One age per child, 0–12; length must match `children` */
  childAges: number[];
};

export const defaultRoomOccupancy = (): RoomOccupancy => ({
  adults: 2,
  children: 0,
  childAges: [],
});

/**
 * Max children selectable for a given adult count (matches {@link normalizeRoomOccupancy}).
 * Total guests per room never exceed {@link MAX_GUESTS_PER_ROOM}.
 */
export function maxChildrenForAdults(adults: number): number {
  const a = Math.max(1, Math.min(MAX_GUESTS_PER_ROOM, Math.floor(adults)));
  const space = Math.max(0, MAX_GUESTS_PER_ROOM - a);
  let cap = Math.min(MAX_CHILDREN_PER_ROOM, space);
  if (a >= 3) {
    cap = Math.min(cap, 1);
  }
  return cap;
}

/**
 * Enforce: max 4 guests total per room, max 2 children, min 1 adult.
 * 1 adult may have up to 2 children (3 guests). 3 adults → at most 1 child (4 guests max).
 */
export function normalizeRoomOccupancy(
  adults: number,
  children: number,
): { adults: number; children: number } {
  let c = Math.max(0, Math.min(MAX_CHILDREN_PER_ROOM, Math.floor(children)));
  let a = Math.max(1, Math.min(MAX_GUESTS_PER_ROOM, Math.floor(adults)));

  c = Math.min(c, MAX_CHILDREN_PER_ROOM, Math.max(0, MAX_GUESTS_PER_ROOM - a));
  a = Math.min(Math.max(1, a), MAX_GUESTS_PER_ROOM - c);
  c = Math.min(c, MAX_CHILDREN_PER_ROOM, Math.max(0, MAX_GUESTS_PER_ROOM - a));
  a = Math.min(Math.max(1, a), MAX_GUESTS_PER_ROOM - c);

  if (a >= 3) {
    c = Math.min(c, 1);
  }

  return { adults: a, children: c };
}

export function syncChildAges(
  childAges: number[],
  childrenCount: number,
): number[] {
  const next = childAges
    .slice(0, childrenCount)
    .map((age) =>
      Math.max(0, Math.min(MAX_CHILD_AGE, Math.floor(Number(age) || 0))),
    );
  while (next.length < childrenCount) next.push(0);
  return next;
}

export function totalGuestsFromRooms(rooms: RoomOccupancy[]): {
  adults: number;
  children: number;
} {
  return {
    adults: rooms.reduce((s, r) => s + r.adults, 0),
    children: rooms.reduce((s, r) => s + r.children, 0),
  };
}

export type OccupancySurchargeBreakdown = {
  extraPersonAmount: number;
  childOver6Amount: number;
  surchargesSubtotal: number;
  /** For display: extra person count across rooms (not nights) */
  extraPersonNights: number;
  childOver6Nights: number;
};

/**
 * Extra person: 3rd & 4th occupant in a room (₹/guest/night).
 * Child 7–12: ₹/child/night (ages from childAges).
 */
export function computeOccupancySurcharges(
  rooms: RoomOccupancy[],
  nights: number,
): OccupancySurchargeBreakdown {
  let extraPersonNights = 0;
  let childOver6Nights = 0;
  for (const r of rooms) {
    const occ = r.adults + r.children;
    const extras = Math.max(0, occ - 2);
    extraPersonNights += extras * nights;
    for (let i = 0; i < r.children; i++) {
      const age = r.childAges[i] ?? 0;
      if (age > 6) childOver6Nights += nights;
    }
  }
  const extraPersonAmount =
    extraPersonNights * EXTRA_PERSON_SURCHARGE_PER_NIGHT;
  const childOver6Amount = childOver6Nights * CHILD_OVER_6_SURCHARGE_PER_NIGHT;
  return {
    extraPersonAmount,
    childOver6Amount,
    surchargesSubtotal: extraPersonAmount + childOver6Amount,
    extraPersonNights,
    childOver6Nights,
  };
}

export function normalizeRoomsList(rooms: RoomOccupancy[]): RoomOccupancy[] {
  return rooms.map((r) => {
    const { adults, children } = normalizeRoomOccupancy(r.adults, r.children);
    return {
      adults,
      children,
      childAges: syncChildAges(r.childAges, children),
    };
  });
}

/** Legacy flat adults/children → one room (clamped to hotel rules). */
export function migrateLegacyGuestCountsToRooms(
  adults: number,
  children: number,
): RoomOccupancy[] {
  const n = normalizeRoomOccupancy(adults, children);
  return [{ ...n, childAges: syncChildAges([], n.children) }];
}
