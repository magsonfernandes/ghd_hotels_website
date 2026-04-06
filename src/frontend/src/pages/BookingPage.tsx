import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Footer } from "../components/Footer";
import {
  HomeSearchBar,
  type HomeSearchValues,
  type IsoDate,
  parseHomeSearchFromStorage,
} from "../components/HomeSearchBar";
import {
  BookingCheckoutModal,
  type BookingSearchSnapshot,
} from "../components/booking/BookingCheckoutModal";
import { FiltersBar } from "../components/booking/FiltersBar";
import { RoomCard } from "../components/booking/RoomCard";
import type { BookingRateSelection } from "../components/booking/bookingRates";
import {
  MEAL_PRICE_PER_ADULT,
  MEAL_PRICE_PER_CHILD,
  ROOM_CATEGORIES,
  type MealSelection,
  type RoomCategoryId,
} from "../components/booking/bookingRates";
import {
  defaultRoomOccupancy,
  normalizeRoomsList,
  totalGuestsFromRooms,
} from "../components/booking/roomOccupancy";

type Hotel = {
  id: string;
  name: string;
  brand: "nivaara" | "samraya" | "celestra";
  location: "nerul";
  tagline: string;
  description: string;
  image: string;
  to: string;
};

const HOTELS: Hotel[] = [
  {
    id: "nivaara-nerul",
    name: "Nivaara Nerul",
    brand: "nivaara",
    location: "nerul",
    tagline: "Nivaãra by GHD — Smart Comfort",
    description:
      "A calm, design-forward stay built for modern rhythm — smart comfort, refined living, and effortless ease.",
    image: "/assets/generated/hero-nivaara.dim_1920x1080.png",
    to: "/nivaara",
  },
  {
    id: "samraya-goa",
    name: "Samrāya Goa (Concept)",
    brand: "samraya",
    location: "nerul",
    tagline: "Samrāya by GHD — Luxury",
    description:
      "Royal hospitality, intuitive privacy, and elevated experiences — conceptual listing while development is underway.",
    image: "/assets/generated/hero-samraya.dim_1920x1080.png",
    to: "/samraya",
  },
  {
    id: "celestra-goa",
    name: "Celéstra Goa (Concept)",
    brand: "celestra",
    location: "nerul",
    tagline: "Celéstra by GHD — Premium",
    description:
      "Contemporary hospitality with intelligent amenities and refined comfort — conceptual listing while development is underway.",
    image: "/assets/generated/hero-celestra.dim_1920x1080.png",
    to: "/celestra",
  },
];

const defaultSearch: BookingSearchSnapshot = {
  checkIn: "",
  checkOut: "",
  adults: 2,
  children: 0,
  rooms: [defaultRoomOccupancy()],
};

const defaultMeals = (): MealSelection => ({
  breakfast: true,
  lunch: false,
  dinner: false,
});

function countByCategory(assignments: RoomCategoryId[]): Record<RoomCategoryId, number> {
  return { "studio-apartment": assignments.length };
}

function parseISODate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseISODate(checkIn);
  const b = parseISODate(checkOut);
  if (!a || !b || b <= a) return 1;
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

function readBookingSearch(): BookingSearchSnapshot {
  try {
    const raw = sessionStorage.getItem("ghd_booking_search");
    if (!raw) return defaultSearch;
    const p = parseHomeSearchFromStorage(raw);
    if (!p?.rooms?.length) {
      return {
        ...defaultSearch,
        checkIn: typeof p?.checkIn === "string" ? p.checkIn : "",
        checkOut: typeof p?.checkOut === "string" ? p.checkOut : "",
      };
    }
    const rooms = normalizeRoomsList(p.rooms);
    const t = totalGuestsFromRooms(rooms);
    return {
      checkIn: typeof p.checkIn === "string" ? p.checkIn : "",
      checkOut: typeof p.checkOut === "string" ? p.checkOut : "",
      adults: t.adults,
      children: t.children,
      rooms,
    };
  } catch {
    return defaultSearch;
  }
}

export function BookingPage() {
  const [filters, setFilters] = useState<{ location: string; brand: string }>({
    location: "",
    brand: "",
  });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSelection, setCheckoutSelection] =
    useState<BookingRateSelection | null>(null);
  const [liveSearch, setLiveSearch] = useState<BookingSearchSnapshot>(() =>
    readBookingSearch(),
  );
  const [meals, setMeals] = useState<MealSelection>(defaultMeals);
  const [roomAssignments, setRoomAssignments] = useState<RoomCategoryId[]>(() => ["studio-apartment"]);

  useEffect(() => {
    document.title = "Book a stay | GHD Hotels";
  }, []);

  const filteredHotels = useMemo(() => {
    return HOTELS.filter((h) => {
      if (filters.brand && h.brand !== filters.brand) return false;
      if (filters.location && h.location !== filters.location) return false;
      return true;
    });
  }, [filters.brand, filters.location]);

  const handleSearchValuesChange = useCallback((v: HomeSearchValues) => {
    const t = totalGuestsFromRooms(v.rooms);
    setLiveSearch({
      checkIn: v.checkIn,
      checkOut: v.checkOut,
      adults: t.adults,
      children: t.children,
      rooms: v.rooms,
    });
  }, []);

  const totalRoomsRequested = Math.max(1, liveSearch.rooms?.length ?? 1);
  const nights = useMemo(
    () => nightsBetween(liveSearch.checkIn, liveSearch.checkOut),
    [liveSearch.checkIn, liveSearch.checkOut],
  );
  const inventories: Record<RoomCategoryId, number> = {
    "studio-apartment": 15,
  };

  const roomsList = liveSearch.rooms?.length
    ? liveSearch.rooms
    : [defaultRoomOccupancy()];

  // Keep per-room assignments aligned with the rooms list length.
  useEffect(() => {
    setRoomAssignments((prev) => {
      const next: RoomCategoryId[] = [];
      for (let i = 0; i < totalRoomsRequested; i++) {
        next[i] = prev[i] ?? "studio-apartment";
      }
      return next;
    });
  }, [totalRoomsRequested]);

  const counts = useMemo(() => countByCategory(roomAssignments), [roomAssignments]);
  const selectedRoomsTotal = roomAssignments.length;

  const canAssignRoomToCategory = (_index: number, nextId: RoomCategoryId) =>
    nextId === "studio-apartment";

  const toggleMeal = (key: keyof MealSelection) => {
    setMeals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openCheckout = useCallback(() => {
    setLiveSearch(readBookingSearch());
    const rooms = (Object.keys(ROOM_CATEGORIES) as RoomCategoryId[])
      .map((id) => ({
        categoryId: id,
        categoryLabel: ROOM_CATEGORIES[id].label,
        quantity: counts[id],
        baseRatePerNight: ROOM_CATEGORIES[id].roomOnly.discounted,
      }))
      .filter((r) => r.quantity > 0);

    setCheckoutSelection({
      rooms,
      meals: { ...meals },
    });
    setCheckoutOpen(true);
  }, [counts, meals]);

  const initialValues = useMemo((): Partial<HomeSearchValues> => {
    try {
      const raw = sessionStorage.getItem("ghd_booking_search");
      if (!raw) return { rooms: [defaultRoomOccupancy()] };
      const p = parseHomeSearchFromStorage(raw);
      if (!p) return { rooms: [defaultRoomOccupancy()] };
      return {
        hotelId: String(p.hotelId ?? "nivaara-nerul"),
        checkIn: (p.checkIn as IsoDate) ?? "",
        checkOut: (p.checkOut as IsoDate) ?? "",
        rooms: p.rooms?.length
          ? normalizeRoomsList(p.rooms)
          : [defaultRoomOccupancy()],
      };
    } catch {
      return { rooms: [defaultRoomOccupancy()] };
    }
  }, []);

  return (
    <div className="bg-charcoal min-h-screen flex flex-col">
      <section className="flex-1 section-pad pt-28 sm:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10 sm:mb-12">
            <p className="eyebrow eyebrow--gold-emphasis mb-4">Reserve</p>
            <div className="gold-divider mx-auto mb-8" />
            <h1
              className="font-display text-ivory text-3xl sm:text-4xl"
              style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
            >
              Find your stay
            </h1>
          </div>

          <div className="mb-8">
            <FiltersBar
              location={filters.location}
              brand={filters.brand}
              onChange={setFilters}
            />
          </div>

          <div className="mb-12">
            <HomeSearchBar
              initial={initialValues}
              onSearch={() => {}}
              onValuesChange={handleSearchValuesChange}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div />
            </div>
            <Link to="/" className="btn-gold w-full sm:w-auto text-center">
              <span>Back to home</span>
            </Link>
          </div>

          {filteredHotels.some((h) => h.id === "nivaara-nerul") ? (
            <div className="space-y-6">
              <RoomCard
                propertyName="Nerul"
                brandLabel="Nivaãra"
                roomCategoryId="studio-apartment"
                roomType={ROOM_CATEGORIES["studio-apartment"].label}
                description={ROOM_CATEGORIES["studio-apartment"].shortDescription}
                image="/assets/generated/hero-nivaara.dim_1920x1080.png"
                totalInventory={inventories["studio-apartment"]}
                baseRateOriginal={ROOM_CATEGORIES["studio-apartment"].roomOnly.original}
                baseRateDiscounted={
                  ROOM_CATEGORIES["studio-apartment"].roomOnly.discounted
                }
                nights={nights}
                quantity={totalRoomsRequested}
                maxSelectable={Math.min(
                  inventories["studio-apartment"],
                  totalRoomsRequested,
                )}
                onQuantityChange={() => {}}
                lockQuantity
                meals={meals}
                roomRows={roomsList
                  .slice(0, totalRoomsRequested)
                  .map((r, index) => ({
                    index,
                    adults: r.adults,
                    children: r.children,
                    suggestedCategoryId: "studio-apartment" as const,
                    assignedCategoryId: "studio-apartment" as const,
                  }))
                  .filter((row) => row.assignedCategoryId === "studio-apartment")}
              />

              <div className="rounded-2xl border border-gold/15 bg-white/90 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55 mb-3">
                  Meals
                </p>
                <p className="text-xs text-charcoal/50 mb-3">
                  ₹{MEAL_PRICE_PER_ADULT.toLocaleString("en-IN")} per adult and ₹
                  {MEAL_PRICE_PER_CHILD.toLocaleString("en-IN")} per child, per
                  meal, per night — add or remove as you like.
                </p>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-6">
                  {(
                    [
                      { key: "breakfast", label: "Breakfast" },
                      { key: "lunch", label: "Lunch" },
                      { key: "dinner", label: "Dinner" },
                    ] as const
                  ).map(({ key, label }) => (
                    <label
                      key={key}
                      className="inline-flex cursor-pointer items-center gap-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={meals[key]}
                        onChange={() => toggleMeal(key)}
                        className="h-4 w-4 rounded border-charcoal/25 text-gold focus:ring-gold/40"
                      />
                      <span className="text-sm text-charcoal/85">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                <button
                  type="button"
                  className="btn-gold-filled h-11 px-6 w-full sm:w-auto"
                  onClick={openCheckout}
                  disabled={
                    selectedRoomsTotal !== totalRoomsRequested ||
                    counts["studio-apartment"] > inventories["studio-apartment"] ||
                    false
                  }
                >
                  Continue to checkout
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gold/10 bg-black/30 p-8 text-center">
              <p className="font-body text-ivory-muted/70">
                No rooms match your selected filters.
              </p>
            </div>
          )}
        </div>
      </section>
      {checkoutOpen && checkoutSelection ? (
        <BookingCheckoutModal
          onClose={() => {
            setCheckoutOpen(false);
            setCheckoutSelection(null);
          }}
          search={liveSearch}
          selection={checkoutSelection}
        />
      ) : null}
      <Footer />
    </div>
  );
}
