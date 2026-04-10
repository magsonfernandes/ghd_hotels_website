import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PremiumDateRangePicker } from "./PremiumDateRangePicker";
import { RoomGuestsSelector } from "./RoomGuestsSelector";
import {
  MAX_BOOKING_ROOMS,
  type RoomOccupancy,
  defaultRoomOccupancy,
  migrateLegacyGuestCountsToRooms,
  normalizeRoomsList,
  totalGuestsFromRooms,
} from "./booking/roomOccupancy";

type IsoDate = `${number}-${string}-${string}` | "";

type HomeSearchValues = {
  hotelId: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
  rooms: RoomOccupancy[];
};

export type { HomeSearchValues, IsoDate };
export type { RoomOccupancy };

function parseInitialRooms(
  init?: Partial<HomeSearchValues> & { adults?: number; children?: number },
): RoomOccupancy[] {
  if (init?.rooms?.length) {
    return normalizeRoomsList(init.rooms).slice(0, MAX_BOOKING_ROOMS);
  }
  if (init?.adults !== undefined || init?.children !== undefined) {
    return migrateLegacyGuestCountsToRooms(
      init.adults ?? 2,
      init.children ?? 0,
    );
  }
  return [defaultRoomOccupancy()];
}

/** Restore search from session JSON (supports legacy adults/children). */
export function parseHomeSearchFromStorage(
  raw: string,
): Partial<HomeSearchValues> | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const hotelId =
      typeof parsed.hotelId === "string" ? parsed.hotelId : "nivaara-nerul";
    const checkIn = typeof parsed.checkIn === "string" ? parsed.checkIn : "";
    const checkOut = typeof parsed.checkOut === "string" ? parsed.checkOut : "";

    let rooms: RoomOccupancy[];
    if (Array.isArray(parsed.rooms)) {
      const raw: RoomOccupancy[] = [];
      for (const item of parsed.rooms) {
        if (!item || typeof item !== "object") continue;
        const o = item as Record<string, unknown>;
        raw.push({
          adults: Number(o.adults) || 1,
          children: Number(o.children) || 0,
          childAges: Array.isArray(o.childAges)
            ? o.childAges.map((x) => Number(x) || 0)
            : [],
        });
      }
      rooms = raw.length
        ? normalizeRoomsList(raw).slice(0, MAX_BOOKING_ROOMS)
        : [defaultRoomOccupancy()];
    } else {
      rooms = migrateLegacyGuestCountsToRooms(
        Number(parsed.adults) || 2,
        Number(parsed.children) || 0,
      );
    }

    return {
      hotelId,
      checkIn: checkIn as IsoDate,
      checkOut: checkOut as IsoDate,
      rooms,
    };
  } catch {
    return null;
  }
}

export function HomeSearchBar(props?: {
  initial?: Partial<HomeSearchValues> & { adults?: number; children?: number };
  onSearch?: (values: HomeSearchValues) => void;
  /** Fires whenever dates, guests, or hotel change — use to keep checkout totals in sync */
  onValuesChange?: (values: HomeSearchValues) => void;
  embedded?: boolean;
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
  const [rooms, setRooms] = useState<RoomOccupancy[]>(() =>
    parseInitialRooms(props?.initial),
  );

  useEffect(() => {
    const init = props?.initial;
    if (!init) return;
    if (init.hotelId !== undefined) setHotelId(init.hotelId);
    if (init.checkIn !== undefined) setCheckIn(init.checkIn);
    if (init.checkOut !== undefined) setCheckOut(init.checkOut);
    if (
      init.rooms !== undefined ||
      init.adults !== undefined ||
      init.children !== undefined
    ) {
      setRooms(parseInitialRooms(init));
    }
  }, [props?.initial]);

  const todayISO = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}` as IsoDate;
  }, []);

  const guestTotals = useMemo(() => totalGuestsFromRooms(rooms), [rooms]);

  // Persist the current selection so it can be reused on the Reserve page.
  useEffect(() => {
    const payload: HomeSearchValues = {
      hotelId,
      checkIn,
      checkOut,
      rooms,
    };
    try {
      sessionStorage.setItem("ghd_booking_search", JSON.stringify(payload));
    } catch {
      // Ignore (private mode / blocked storage)
    }
    props?.onValuesChange?.(payload);
  }, [hotelId, checkIn, checkOut, rooms, props?.onValuesChange]);

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
      rooms,
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
        adults: String(guestTotals.adults),
        children: String(guestTotals.children),
      },
    });
  };

  const setRoomsSafe = (next: RoomOccupancy[]) => {
    setRooms(normalizeRoomsList(next).slice(0, MAX_BOOKING_ROOMS));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={
        props?.embedded
          ? "w-full"
          : "w-full max-w-6xl mx-auto rounded-xl sm:rounded-2xl bg-white text-charcoal shadow-xl shadow-black/25 border-2 border-gold px-3 py-3 sm:px-5 sm:py-4"
      }
      data-ocid="home.search.bar"
    >
      <div
        className={
          props?.embedded
            ? "flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-3"
            : "flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-3"
        }
      >
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
              if (ci && ci < todayISO) return;
              if (co && co < todayISO) return;
              setCheckIn(ci);
              setCheckOut(co);
            }}
          />
        </div>

        <RoomGuestsSelector rooms={rooms} onChange={setRoomsSafe} />

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
