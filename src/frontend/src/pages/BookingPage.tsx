import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "../components/Footer";
import {
  HomeSearchBar,
  type HomeSearchValues,
  type IsoDate,
} from "../components/HomeSearchBar";
import { FiltersBar } from "../components/booking/FiltersBar";
import { RoomCard } from "../components/booking/RoomCard";

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
    tagline: "Samrāya by GHD — 5★ Luxury",
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
    tagline: "Celéstra by GHD — 4★ Premium",
    description:
      "Contemporary hospitality with intelligent amenities and refined comfort — conceptual listing while development is underway.",
    image: "/assets/generated/hero-celestra.dim_1920x1080.png",
    to: "/celestra",
  },
];

export function BookingPage() {
  const [filters, setFilters] = useState<{ location: string; brand: string }>({
    location: "",
    brand: "",
  });

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

  const initialValues = useMemo((): Partial<HomeSearchValues> => {
    try {
      const raw = sessionStorage.getItem("ghd_booking_search");
      if (!raw) return { adults: 2, children: 0 };
      const parsed = JSON.parse(raw) as Partial<HomeSearchValues>;
      return {
        hotelId: String(parsed.hotelId ?? "nivaara-nerul"),
        checkIn: (parsed.checkIn as IsoDate) ?? "",
        checkOut: (parsed.checkOut as IsoDate) ?? "",
        adults: typeof parsed.adults === "number" ? parsed.adults : 2,
        children: typeof parsed.children === "number" ? parsed.children : 0,
      };
    } catch {
      return { adults: 2, children: 0 };
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
            <HomeSearchBar initial={initialValues} onSearch={() => {}} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p
                className="font-body text-ivory-muted/70 text-sm"
                style={{
                  fontFamily: "General Sans, Helvetica Neue, sans-serif",
                }}
              >
                {filteredHotels.length} property
                {filteredHotels.length === 1 ? "" : "ies"} available
              </p>
            </div>
            <Link to="/" className="btn-gold w-full sm:w-auto text-center">
              <span>Back to home</span>
            </Link>
          </div>

          {filteredHotels.some((h) => h.id === "nivaara-nerul") ? (
            <RoomCard
              propertyName="Nivaãra Nerul"
              brandLabel="Nivaãra"
              roomType="Studio Apartment"
              image="/assets/generated/hero-nivaara.dim_1920x1080.png"
              totalInventory={15}
            />
          ) : (
            <div className="rounded-2xl border border-gold/10 bg-black/30 p-8 text-center">
              <p className="font-body text-ivory-muted/70">
                No rooms match your selected filters.
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
