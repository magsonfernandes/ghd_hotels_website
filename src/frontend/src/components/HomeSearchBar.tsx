import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PremiumDateRangePicker } from "./PremiumDateRangePicker";

type IsoDate = `${number}-${string}-${string}` | "";

type HomeSearchValues = {
  hotelId: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
  adults: number;
  children: number;
};

export type { HomeSearchValues, IsoDate };

export function HomeSearchBar(props?: {
  initial?: Partial<HomeSearchValues>;
  onSearch?: (values: HomeSearchValues) => void;
  /** Fires whenever dates, guests, or hotel change — use to keep checkout totals in sync */
  onValuesChange?: (values: HomeSearchValues) => void;
}) {
  const navigate = useNavigate();
  const [hotelId, setHotelId] = useState(
    props?.initial?.hotelId ?? "nivaara-nerul",
  );
  const [checkIn, setCheckIn] = useState<IsoDate>(
    props?.initial?.checkIn ?? "",
  );
  const [checkOut, setCheckOut] = useState<IsoDate>(
    props?.initial?.checkOut ?? "",
  );
  const [adults, setAdults] = useState<number>(props?.initial?.adults ?? 2);
  const [children, setChildren] = useState<number>(
    props?.initial?.children ?? 0,
  );

  useEffect(() => {
    const init = props?.initial;
    if (!init) return;
    if (init.hotelId !== undefined) setHotelId(init.hotelId);
    if (init.checkIn !== undefined) setCheckIn(init.checkIn);
    if (init.checkOut !== undefined) setCheckOut(init.checkOut);
    if (init.adults !== undefined) setAdults(init.adults);
    if (init.children !== undefined) setChildren(init.children);
  }, [props?.initial]);

  const todayISO = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}` as IsoDate;
  }, []);

  // Persist the current selection so it can be reused on the Reserve page.
  useEffect(() => {
    const payload: HomeSearchValues = {
      hotelId,
      checkIn,
      checkOut,
      adults,
      children,
    };
    try {
      sessionStorage.setItem("ghd_booking_search", JSON.stringify(payload));
    } catch {
      // Ignore (private mode / blocked storage)
    }
    props?.onValuesChange?.(payload);
  }, [hotelId, checkIn, checkOut, adults, children, props?.onValuesChange]);

  useEffect(() => {
    if (checkIn && checkOut && checkOut < checkIn) {
      setCheckOut("");
    }
  }, [checkIn, checkOut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values: HomeSearchValues = {
      hotelId,
      checkIn,
      checkOut,
      adults,
      children,
    };

    if (props?.onSearch) {
      props.onSearch(values);
      return;
    }

    navigate({
      to: "/booking",
      search: {
        hotelId,
        checkIn,
        checkOut,
        adults: String(adults),
        children: String(children),
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-6xl mx-auto rounded-xl sm:rounded-2xl bg-white text-charcoal shadow-xl shadow-black/25 border-2 border-gold px-3 py-3 sm:px-5 sm:py-4"
      data-ocid="home.search.bar"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            Hotel
          </span>
          <select
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            className="h-11 w-full rounded-lg border border-gold/45 bg-white px-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
            aria-label="Hotel"
          >
            <option value="nivaara-nerul">Nivaara Nerul</option>
          </select>
        </div>

        <div className="lg:flex-1 lg:min-w-[320px]">
          <PremiumDateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={({ checkIn: ci, checkOut: co }) => {
              // Guard against past dates coming in (dropdown already prevents this)
              if (ci && ci < todayISO) return;
              if (co && co < todayISO) return;
              setCheckIn(ci);
              setCheckOut(co);
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:w-[220px]">
          <label className="flex min-w-0 flex-col gap-1 text-left">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
              Adults
            </span>
            <input
              type="number"
              min={1}
              max={30}
              value={adults}
              onChange={(e) =>
                setAdults(
                  Math.max(1, Math.min(30, Number(e.target.value) || 1)),
                )
              }
              className="h-11 w-full rounded-lg border border-gold/45 bg-white px-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
              aria-label="Adults"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-left">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
              Children
            </span>
            <input
              type="number"
              min={0}
              max={30}
              value={children}
              onChange={(e) =>
                setChildren(
                  Math.max(0, Math.min(30, Number(e.target.value) || 0)),
                )
              }
              className="h-11 w-full rounded-lg border border-gold/45 bg-white px-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
              aria-label="Children"
            />
          </label>
        </div>

        <div className="flex items-end lg:shrink-0">
          <button
            type="submit"
            className="btn-gold-filled flex h-11 w-full items-center justify-center gap-2 lg:w-auto lg:min-w-[150px]"
            data-ocid="home.search.submit"
          >
            <span className="inline-flex items-center gap-2">
              <Search className="h-4 w-4" aria-hidden />
              Search
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
