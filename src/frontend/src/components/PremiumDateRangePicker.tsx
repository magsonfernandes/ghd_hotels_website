import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type IsoDate = `${number}-${string}-${string}` | "";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date): IsoDate {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseISODate(iso: IsoDate): Date | null {
  if (!iso) return null;
  const [y, m, day] = iso.split("-").map((v) => Number(v));
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeDay(a: Date, b: Date) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

function isAfterDay(a: Date, b: Date) {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

function clampMonthToToday(monthAnchor: Date) {
  const today = startOfDay(new Date());
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const cur = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  return cur.getTime() < minMonth.getTime() ? minMonth : cur;
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function monthLabel(d: Date) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function getMonthDaysGrid(monthAnchor: Date) {
  const first = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
    );
  }
  return { first, days };
}

function formatDisplay(iso: IsoDate) {
  const d = parseISODate(iso);
  if (!d) return "";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PremiumDateRangePicker(props: {
  checkIn: IsoDate;
  checkOut: IsoDate;
  onChange: (next: { checkIn: IsoDate; checkOut: IsoDate }) => void;
}) {
  const { checkIn, checkOut, onChange } = props;
  const [open, setOpen] = useState(false);
  const [hoverISO, setHoverISO] = useState<IsoDate>("");

  const checkInDate = useMemo(() => parseISODate(checkIn), [checkIn]);
  const checkOutDate = useMemo(() => parseISODate(checkOut), [checkOut]);

  const initialMonth = useMemo(() => {
    const anchor = checkInDate ?? new Date();
    return clampMonthToToday(
      new Date(anchor.getFullYear(), anchor.getMonth(), 1),
    );
  }, [checkInDate]);

  const [month, setMonth] = useState<Date>(initialMonth);
  useEffect(() => {
    setMonth(initialMonth);
  }, [initialMonth]);

  const hoverDate = useMemo(() => parseISODate(hoverISO), [hoverISO]);

  const selectingEnd = Boolean(checkInDate && !checkOutDate);
  const today = useMemo(() => startOfDay(new Date()), []);

  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
        setHoverISO("");
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const monthStart = useMemo(
    () => new Date(month.getFullYear(), month.getMonth(), 1),
    [month],
  );
  const { first: monthFirst, days: grid } = useMemo(
    () => getMonthDaysGrid(monthStart),
    [monthStart],
  );

  const prevDisabled = useMemo(() => {
    const prev = addMonths(monthStart, -1);
    const min = new Date(today.getFullYear(), today.getMonth(), 1);
    return prev.getTime() < min.getTime();
  }, [monthStart, today]);

  const handleDayClick = (d: Date) => {
    if (isBeforeDay(d, today)) return;
    if (!checkInDate || (checkInDate && checkOutDate)) {
      onChange({ checkIn: toISODate(d), checkOut: "" });
      setHoverISO("");
      return;
    }

    if (isBeforeDay(d, checkInDate)) {
      onChange({ checkIn: toISODate(d), checkOut: "" });
      setHoverISO("");
      return;
    }

    onChange({ checkIn, checkOut: toISODate(d) });
    setHoverISO("");
    setOpen(false);
  };

  const inPreviewRange = (d: Date) => {
    if (!selectingEnd || !checkInDate || !hoverDate) return false;
    if (isBeforeDay(hoverDate, checkInDate)) return false;
    return !isBeforeDay(d, checkInDate) && !isAfterDay(d, hoverDate);
  };

  const inSelectedRange = (d: Date) => {
    if (!checkInDate || !checkOutDate) return false;
    return !isBeforeDay(d, checkInDate) && !isAfterDay(d, checkOutDate);
  };

  const isStart = (d: Date) =>
    checkInDate ? isSameDay(d, checkInDate) : false;
  const isEnd = (d: Date) =>
    checkOutDate ? isSameDay(d, checkOutDate) : false;

  return (
    <div ref={rootRef} className="relative">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex min-w-0 flex-col gap-1 text-left">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            Check-in
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-11 w-full cursor-pointer rounded-lg border border-gold/45 bg-white px-3 text-sm text-charcoal outline-none transition text-left focus:border-gold focus:ring-2 focus:ring-gold/30"
            aria-label="Check-in date"
            data-ocid="home.search.checkin"
          >
            <span className={checkIn ? "text-charcoal" : "text-charcoal/45"}>
              {checkIn ? formatDisplay(checkIn) : "Select date"}
            </span>
          </button>
        </div>

        <div className="flex min-w-0 flex-col gap-1 text-left">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            Check-out
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-11 w-full cursor-pointer rounded-lg border border-gold/45 bg-white px-3 text-sm text-charcoal outline-none transition text-left focus:border-gold focus:ring-2 focus:ring-gold/30"
            aria-label="Check-out date"
            data-ocid="home.search.checkout"
          >
            <span className={checkOut ? "text-charcoal" : "text-charcoal/45"}>
              {checkOut
                ? formatDisplay(checkOut)
                : checkIn
                  ? "Select date"
                  : "Select check-in first"}
            </span>
          </button>
        </div>
      </div>

      <div
        className={`absolute z-50 left-0 right-0 bottom-full mb-3 origin-bottom rounded-2xl border border-gold/40 bg-ivory shadow-2xl shadow-black/25 p-4 sm:p-5 transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        aria-label="Select check-in and check-out dates"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            disabled={prevDisabled}
            className={`h-9 w-9 rounded-full border border-gold/35 flex items-center justify-center transition ${
              prevDisabled
                ? "opacity-35 cursor-not-allowed"
                : "hover:bg-gold/15"
            }`}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-charcoal/75" />
          </button>

          <div className="text-center">
            <p
              className="font-display text-charcoal"
              style={{
                fontFamily: "Instrument Serif, Georgia, serif",
                fontSize: "1.25rem",
                letterSpacing: "0.02em",
              }}
            >
              {monthLabel(monthStart)}
            </p>
            <p className="text-[0.7rem] uppercase tracking-[0.25em] text-charcoal/55">
              {selectingEnd ? "Select check-out date" : "Select check-in date"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="h-9 w-9 rounded-full border border-gold/35 flex items-center justify-center transition hover:bg-gold/15"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-charcoal/75" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="text-[0.62rem] uppercase tracking-[0.22em] text-charcoal/55 py-1"
              style={{ fontFamily: "General Sans, Helvetica Neue, sans-serif" }}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {grid.map((d) => {
            const isOutsideMonth = d.getMonth() !== monthFirst.getMonth();

            const disabled = isBeforeDay(d, today);
            const selectedStart = isStart(d);
            const selectedEnd = isEnd(d);
            const inSel = inSelectedRange(d);
            const inPrev = !inSel && inPreviewRange(d);

            const rangeBase = inSel || inPrev ? "bg-gold/20" : "bg-transparent";
            const strong =
              selectedStart || selectedEnd ? "bg-gold text-charcoal" : "";

            const leftRound =
              selectedStart ||
              (inSel &&
                checkInDate &&
                !isBeforeDay(d, checkInDate) &&
                (isSameDay(d, checkInDate) || isSameDay(d, checkOutDate ?? d)))
                ? "rounded-l-full"
                : "";
            const rightRound =
              selectedEnd ||
              (inSel &&
                checkOutDate &&
                !isAfterDay(d, checkOutDate) &&
                (isSameDay(d, checkOutDate) || isSameDay(d, checkInDate ?? d)))
                ? "rounded-r-full"
                : "";

            const isSingleDay =
              selectedStart && selectedEnd && checkIn && checkOut;

            const cellRangeClass =
              inSel || inPrev
                ? `rounded-none ${leftRound} ${rightRound}`
                : "rounded-full";

            const hoverClass = !disabled && !strong ? "hover:bg-gold/15" : "";

            return (
              <button
                key={toISODate(d)}
                type="button"
                disabled={disabled}
                onClick={() => handleDayClick(d)}
                onMouseEnter={() => {
                  if (!selectingEnd) return;
                  setHoverISO(toISODate(d));
                }}
                onMouseLeave={() => setHoverISO("")}
                className={[
                  "h-10 sm:h-11 w-full flex items-center justify-center text-sm transition",
                  "focus:outline-none focus:ring-2 focus:ring-gold/30",
                  disabled
                    ? "text-charcoal/25 cursor-not-allowed"
                    : isOutsideMonth
                      ? "text-charcoal/45"
                      : "text-charcoal",
                  rangeBase,
                  cellRangeClass,
                  isSingleDay ? "rounded-full" : "",
                  strong,
                  hoverClass,
                ].join(" ")}
                style={{
                  fontFamily: "General Sans, Helvetica Neue, sans-serif",
                }}
                aria-label={d.toDateString()}
              >
                <span className={strong ? "font-semibold" : "font-medium"}>
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-xs uppercase tracking-[0.22em] text-charcoal/60 hover:text-charcoal transition"
            onClick={() => {
              onChange({ checkIn: "", checkOut: "" });
              setHoverISO("");
            }}
          >
            Clear
          </button>

          <button
            type="button"
            className="btn-gold-filled flex h-10 items-center justify-center px-5"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
