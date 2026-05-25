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
import { RoomCard } from "../components/booking/RoomCard";
import { RoomDetailsModal } from "../components/booking/RoomDetailsModal";
import type {
  BookingRateSelection,
  MealSelection,
  RoomCategoryId,
} from "../components/booking/bookingRates";
import {
  defaultRoomOccupancy,
  normalizeRoomsList,
  totalGuestsFromRooms,
} from "../components/booking/roomOccupancy";
import { NIVAARA_PROPERTY_PHOTO_SRCS } from "../lib/nivaaraPropertyPhotos";
import { useRates, useRatesStatus } from "../lib/rates";

/** Fallback per-category inventory when not yet configurable via the API. */
const DEFAULT_INVENTORY_PER_CATEGORY = 15;

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

function countByCategory(
  assignments: RoomCategoryId[],
): Record<RoomCategoryId, number> {
  const counts: Record<RoomCategoryId, number> = {};
  for (const id of assignments) {
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
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
  const rates = useRates();
  const { isLoading: ratesLoading } = useRatesStatus();
  const primaryCategoryId = rates.roomCategories[0]?.id ?? "studio-apartment";

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSelection, setCheckoutSelection] =
    useState<BookingRateSelection | null>(null);
  const [selectedHotelId, setSelectedHotelId] =
    useState<string>("nivaara-nerul");
  const [liveSearch, setLiveSearch] = useState<BookingSearchSnapshot>(() =>
    readBookingSearch(),
  );
  const [meals, setMeals] = useState<MealSelection>(defaultMeals);
  const [roomAssignments, setRoomAssignments] = useState<RoomCategoryId[]>(
    () => [primaryCategoryId],
  );
  const [roomDetailsOpen, setRoomDetailsOpen] = useState(false);

  useEffect(() => {
    document.title = "Book a stay | GHD Hotels";
  }, []);

  const handleSearchValuesChange = useCallback((v: HomeSearchValues) => {
    const t = totalGuestsFromRooms(v.rooms);
    setSelectedHotelId(v.hotelId);
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

  const knownCategoryIds = useMemo(
    () => new Set(rates.roomCategories.map((c) => c.id)),
    [rates.roomCategories],
  );
  const inventoryFor = (_categoryId: RoomCategoryId): number =>
    DEFAULT_INVENTORY_PER_CATEGORY;

  const roomsList = liveSearch.rooms?.length
    ? liveSearch.rooms
    : [defaultRoomOccupancy()];

  // Keep per-room assignments aligned with the rooms list length, and snap
  // any assignment to a category that no longer exists back to the primary.
  useEffect(() => {
    setRoomAssignments((prev) => {
      const next: RoomCategoryId[] = [];
      for (let i = 0; i < totalRoomsRequested; i++) {
        const current = prev[i];
        next[i] =
          current && knownCategoryIds.has(current)
            ? current
            : primaryCategoryId;
      }
      return next;
    });
  }, [totalRoomsRequested, primaryCategoryId, knownCategoryIds]);

  const counts = useMemo(
    () => countByCategory(roomAssignments),
    [roomAssignments],
  );
  const selectedRoomsTotal = roomAssignments.length;

  const canAssignRoomToCategory = (_index: number, nextId: RoomCategoryId) =>
    knownCategoryIds.has(nextId);

  const assignRoomCategory = (roomIndex: number, nextId: RoomCategoryId) => {
    if (!knownCategoryIds.has(nextId)) return;
    setRoomAssignments((prev) => {
      const next = prev.slice();
      next[roomIndex] = nextId;
      return next;
    });
  };

  const toggleMeal = (key: keyof MealSelection) => {
    setMeals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openCheckout = useCallback(() => {
    setLiveSearch(readBookingSearch());
    const rooms = rates.roomCategories
      .map((cat) => ({
        categoryId: cat.id,
        categoryLabel: cat.label,
        quantity: counts[cat.id] ?? 0,
        baseRatePerNight: cat.roomOnly.discounted,
      }))
      .filter((r) => r.quantity > 0);

    setCheckoutSelection({
      rooms,
      meals: { ...meals },
    });
    setCheckoutOpen(true);
  }, [counts, meals, rates.roomCategories]);

  const roomDetails = useMemo(() => {
    return {
      roomName: "Royal Studio",
      image: NIVAARA_PROPERTY_PHOTO_SRCS[0],
      galleryImages: [...NIVAARA_PROPERTY_PHOTO_SRCS],
      bedInfo: "1 King Bed",
      sleepsInfo: "Sleeps 2",
      amenities: [
        "Wi‑Fi",
        "Air Conditioning",
        "Smart TV",
        "Work Desk",
        "Tea/Coffee Maker",
        "Wardrobe",
        "Bathroom Amenities",
        "Fresh Linen",
        "Daily Housekeeping",
      ],
      description:
        "Designed for modern comfort, the Royal Studio at Nivaãra offers a spacious and thoughtfully curated stay experience. Featuring a king-sized bed, a functional workspace, and clean contemporary interiors, the room is ideal for both short stays and extended visits. Natural lighting, an efficient layout, and essential amenities ensure a seamless and comfortable stay.",
      transport: {
        airports: [
          {
            name: "Goa International Airport (Dabolim)",
            distanceKm: 32,
            timeMinsRange: [45, 60] as const,
            note: "Main airport, closer to South Goa side",
          },
          {
            name: "Manohar International Airport (Mopa)",
            distanceKm: 30,
            timeMinsRange: [40, 50] as const,
            note: "New North Goa airport (better option from Nerul)",
          },
        ],
        railways: [
          {
            name: "Thivim Railway Station",
            distanceKm: 18,
            timeMinsRange: [30, 40] as const,
            note: "Best station for North Goa",
          },
          {
            name: "Madgaon Railway Station",
            distanceKm: 40,
            timeMinsRange: [60, 75] as const,
            note: "Major railway hub (more trains available)",
          },
        ],
        buses: [
          {
            name: "Mapusa Bus Stand",
            distanceKm: 9,
            timeMinsRange: [20, 25] as const,
            note: "Main bus stand for North Goa routes",
          },
          {
            name: "Kadamba Bus Stand Panaji",
            distanceKm: 7,
            timeMinsRange: [15, 20] as const,
            note: "Good for city & intercity buses",
          },
        ],
        quickTipLines: [
          "Nearest Airport: Mopa (faster from Nerul)",
          "Nearest Railway Station: Thivim",
          "Nearest Bus Stand: Panaji (Kadamba)",
        ],
      },
      stayInfo: {
        timings: [
          { label: "Breakfast", hours: "8:30 AM – 10:30 AM" },
          { label: "Housekeeping", hours: "9:00 AM – 6:00 PM" },
          { label: "Pool", hours: "9:00 AM – 8:00 PM" },
        ],
        reminders: [
          "Deposit your room keys at Reception when going out.",
          "Switch off lights, AC, and geyser when leaving the room.",
          "Maintain silence in corridors and common areas.",
          "Room service orders may take extra time during peak hours.",
          "For any assistance, please contact Reception.",
          "Please inform the Front Desk in advance for late check-out requests.",
          "Management is not responsible for any loss of valuable belongings.",
          "Any damage to room items will be charged accordingly.",
        ],
      },
    };
  }, []);

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

  useEffect(() => {
    if (typeof initialValues.hotelId === "string" && initialValues.hotelId) {
      setSelectedHotelId(initialValues.hotelId);
    }
  }, [initialValues.hotelId]);

  const isNivaaraNerulSelected = selectedHotelId === "nivaara-nerul";

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

          <div className="mb-12 w-full rounded-2xl bg-white/95 border border-gold/25 shadow-xl shadow-black/20 px-4 py-4 sm:px-6 sm:py-5">
            <HomeSearchBar
              initial={initialValues}
              onSearch={() => {}}
              onValuesChange={handleSearchValuesChange}
              embedded
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div />
            </div>
            <Link
              to={isNivaaraNerulSelected ? "/nivaara" : "/"}
              className="btn-gold w-full sm:w-auto text-center"
            >
              <span>
                {isNivaaraNerulSelected ? "Visit Nivaãra" : "Back to home"}
              </span>
            </Link>
          </div>

          <div className="space-y-6">
            {ratesLoading && rates.roomCategories.length === 0 ? (
              <div
                aria-hidden="true"
                className="h-[320px] w-full rounded-3xl border border-gold/15 bg-white/40 animate-pulse"
              />
            ) : (
              rates.roomCategories.map((cat, catIndex) => {
                const inventory = inventoryFor(cat.id);
                const rowsForCategory = roomsList
                  .slice(0, totalRoomsRequested)
                  .map((r, index) => ({
                    index,
                    adults: r.adults,
                    children: r.children,
                    suggestedCategoryId: primaryCategoryId,
                    assignedCategoryId:
                      roomAssignments[index] ?? primaryCategoryId,
                  }))
                  .filter((row) => row.assignedCategoryId === cat.id);
                const quantityForCategory = rowsForCategory.length;
                return (
                  <RoomCard
                    key={cat.id}
                    propertyName="Nerul"
                    brandLabel="Nivaãra"
                    propertyLinkTo={
                      catIndex === 0 ? "/nivaara#properties" : undefined
                    }
                    roomCategoryId={cat.id}
                    roomType={cat.label}
                    description={cat.shortDescription}
                    image={
                      catIndex === 0
                        ? NIVAARA_PROPERTY_PHOTO_SRCS[0]
                        : "/assets/generated/hero-nivaara.dim_1920x1080.png"
                    }
                    totalInventory={inventory}
                    baseRateOriginal={cat.roomOnly.original}
                    baseRateDiscounted={cat.roomOnly.discounted}
                    nights={nights}
                    quantity={quantityForCategory}
                    maxSelectable={Math.min(inventory, totalRoomsRequested)}
                    onQuantityChange={() => {}}
                    lockQuantity
                    meals={meals}
                    roomRows={rowsForCategory}
                    onAssignRoomCategory={assignRoomCategory}
                    canAssignRoomToCategory={canAssignRoomToCategory}
                    onRoomDetails={
                      catIndex === 0
                        ? () => setRoomDetailsOpen(true)
                        : undefined
                    }
                  />
                );
              })
            )}

            {/* Meals — hidden for now; uncomment block below to re-enable meal add-ons */}
            {/*
            <div className="rounded-2xl border border-gold/15 bg-white/90 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55 mb-3">
                Meals
              </p>
              <p className="text-xs text-charcoal/50 mb-3">
                ₹{rates.mealPrices.perAdult.toLocaleString("en-IN")} per adult
                and ₹{rates.mealPrices.perChild.toLocaleString("en-IN")} per
                child, per meal, per night — add or remove as you like.
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
            */}

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
              <button
                type="button"
                className="btn-gold-filled h-11 px-6 w-full sm:w-auto"
                onClick={openCheckout}
                disabled={
                  selectedRoomsTotal !== totalRoomsRequested ||
                  rates.roomCategories.some(
                    (cat) => (counts[cat.id] ?? 0) > inventoryFor(cat.id),
                  )
                }
              >
                Continue to checkout
              </button>
            </div>
          </div>
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
      <RoomDetailsModal
        isOpen={roomDetailsOpen}
        onClose={() => setRoomDetailsOpen(false)}
        roomName={roomDetails.roomName}
        image={roomDetails.image}
        galleryImages={roomDetails.galleryImages}
        amenities={roomDetails.amenities}
        description={roomDetails.description}
        bedInfo={roomDetails.bedInfo}
        sleepsInfo={roomDetails.sleepsInfo}
        transport={roomDetails.transport}
        stayInfo={roomDetails.stayInfo}
      />
      <Footer />
    </div>
  );
}
