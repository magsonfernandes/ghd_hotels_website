import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import {
  type RoomCategoryId,
  countSelectedMeals,
  MEAL_PRICE_PER_ADULT,
  MEAL_PRICE_PER_CHILD,
  ROOM_CATEGORIES,
} from "./bookingRates";

function currency(n: number) {
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export function RoomCard(props: {
  propertyName: string;
  brandLabel: string;
  roomType: string;
  roomCategoryId: RoomCategoryId;
  image: string;
  totalInventory: number;
  description: string;
  baseRateOriginal: number;
  baseRateDiscounted: number;
  nights: number;
  quantity: number;
  maxSelectable: number;
  onQuantityChange: (nextQty: number) => void;
  lockQuantity?: boolean;
  meals?: { breakfast: boolean; lunch: boolean; dinner: boolean };
  roomRows?: Array<{
    index: number;
    adults: number;
    children: number;
    suggestedCategoryId: RoomCategoryId;
    assignedCategoryId: RoomCategoryId;
  }>;
  onAssignRoomCategory?: (roomIndex: number, nextCategoryId: RoomCategoryId) => void;
  canAssignRoomToCategory?: (roomIndex: number, nextCategoryId: RoomCategoryId) => boolean;
  onRoomDetails?: () => void;
}) {
  const roomQtyOptions = useMemo(
    () =>
      Array.from({ length: props.maxSelectable + 1 }, (_, quantity) => ({
        quantity,
      })),
    [props.maxSelectable],
  );
  const nights = Math.max(1, Math.floor(props.nights || 1));
  const baseSubtotal = props.quantity * props.baseRateDiscounted * nights;
  const mealsSelected = props.meals ? countSelectedMeals(props.meals) : 0;
  const assignedAdults =
    props.roomRows?.reduce((s, r) => s + r.adults, 0) ?? 0;
  const assignedChildren =
    props.roomRows?.reduce((s, r) => s + r.children, 0) ?? 0;
  const mealsSubtotal =
    mealsSelected > 0
      ? mealsSelected *
        (assignedAdults * MEAL_PRICE_PER_ADULT +
          assignedChildren * MEAL_PRICE_PER_CHILD) *
        nights
      : 0;
  const totalSubtotal = baseSubtotal + mealsSubtotal;

  return (
    <div className="rounded-3xl overflow-hidden border border-gold/15 bg-white/90 shadow-2xl shadow-black/25">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
        <div className="relative bg-charcoal">
          <img
            src={props.image}
            alt={props.roomType}
            className="w-full h-[220px] sm:h-[260px] lg:h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center rounded-full bg-charcoal/70 text-ivory px-3 py-1 text-xs uppercase tracking-[0.22em] border border-gold/20">
              {props.roomType}
            </span>
          </div>

          <div className="absolute inset-y-0 left-0 flex items-center px-2">
            <button
              type="button"
              className="h-9 w-9 rounded-full bg-black/35 border border-white/10 text-ivory/90 flex items-center justify-center hover:bg-black/45 transition"
              aria-label="Previous image"
              disabled
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center px-2">
            <button
              type="button"
              className="h-9 w-9 rounded-full bg-black/35 border border-white/10 text-ivory/90 flex items-center justify-center hover:bg-black/45 transition"
              aria-label="Next image"
              disabled
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-gold/90 text-xs uppercase tracking-[0.28em]">
                {props.brandLabel} • {props.propertyName}
              </p>
              <h2
                className="font-display text-charcoal text-2xl sm:text-3xl mt-2"
                style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
              >
                {props.roomType}
              </h2>
              <p className="font-body text-charcoal/70 text-sm leading-relaxed mt-2 max-w-2xl">
                {props.description}
              </p>
              {props.onRoomDetails ? (
                <button
                  type="button"
                  onClick={props.onRoomDetails}
                  className="inline-block mt-3 text-sm text-charcoal/70 underline underline-offset-4 hover:text-charcoal transition"
                >
                  Room Details
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gold/15 bg-white/80 px-4 py-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:gap-6">
              <div className="min-w-0">
                <p className="font-body text-sm font-medium text-charcoal/90">
                  Room rate
                </p>
              </div>
              <label className="flex items-center justify-between gap-3 lg:justify-start lg:gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-charcoal/55 whitespace-nowrap">
                  Rooms
                </span>
                <select
                  value={props.quantity}
                  onChange={(e) => props.onQuantityChange(Number(e.target.value))}
                  className="h-10 w-[120px] sm:w-[140px] lg:w-[92px] rounded-lg border border-gold/30 bg-white px-3 text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/25"
                  aria-label={`Number of rooms for ${props.roomType}`}
                  disabled={props.lockQuantity}
                >
                  {roomQtyOptions.map((row) => (
                    <option
                      key={`${props.roomCategoryId}-room-qty-${row.quantity}`}
                      value={row.quantity}
                    >
                      {row.quantity}
                    </option>
                  ))}
                </select>
              </label>
              <div className="text-left lg:text-right lg:min-w-[160px]">
                <p className="text-xs text-charcoal/55 uppercase tracking-[0.18em]">
                  Total ({nights} night{nights === 1 ? "" : "s"})
                </p>
                <div className="flex items-baseline justify-start lg:justify-end gap-2 mt-0.5">
                  <span className="text-lg font-semibold text-charcoal">
                    {currency(totalSubtotal)}
                  </span>
                </div>
                <p className="mt-1 text-[0.7rem] text-charcoal/55">
                  {currency(props.baseRateDiscounted)} / room / night{" "}
                  <span className="text-charcoal/40 line-through">
                    {currency(props.baseRateOriginal)}
                  </span>
                </p>
                {mealsSubtotal > 0 ? (
                  <p className="mt-1 text-[0.7rem] text-charcoal/55">
                    Includes meals: {currency(mealsSubtotal)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {props.roomRows?.length ? (
            <div className="mt-4 rounded-xl border border-gold/15 bg-white/80 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55 mb-3">
                Rooms assigned to this category
              </p>
              <div className="space-y-2">
                {props.roomRows.map((row) => {
                  const pax = row.adults + row.children;
                  const paxLabel =
                    row.children > 0
                      ? `${row.adults} adult${row.adults === 1 ? "" : "s"} · ${row.children} child${row.children === 1 ? "" : "ren"}`
                      : `${row.adults} adult${row.adults === 1 ? "" : "s"}`;
                  const roomLabel = `Room ${row.index + 1}`;
                  return (
                    <div
                      key={`assigned-room-${props.roomCategoryId}-${row.index}`}
                      className="rounded-lg border border-charcoal/10 bg-white p-3"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-charcoal">
                            {roomLabel} · {pax} pax
                          </p>
                          <p className="text-xs text-charcoal/60 mt-0.5">
                            {paxLabel}
                          </p>
                          <p className="text-[0.7rem] text-charcoal/55 mt-1">
                            Suggested:{" "}
                            <span className="font-semibold text-charcoal">
                              {ROOM_CATEGORIES[row.suggestedCategoryId].label}
                            </span>
                          </p>
                        </div>

                        {props.onAssignRoomCategory ? (
                          <label className="flex items-center justify-between gap-3 sm:justify-end">
                            <span className="text-xs uppercase tracking-[0.18em] text-charcoal/55 whitespace-nowrap">
                              Book as
                            </span>
                            <select
                              value={row.assignedCategoryId}
                              onChange={(e) =>
                                props.onAssignRoomCategory?.(
                                  row.index,
                                  e.target.value as RoomCategoryId,
                                )
                              }
                              className="h-10 w-[240px] max-w-full rounded-lg border border-gold/30 bg-white px-3 text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/25"
                              aria-label={`${roomLabel} category`}
                            >
                              {(Object.keys(ROOM_CATEGORIES) as RoomCategoryId[]).map(
                                (id) => (
                                  <option
                                    key={`assigned-room-${row.index}-cat-${id}`}
                                    value={id}
                                    disabled={
                                      props.canAssignRoomToCategory
                                        ? !props.canAssignRoomToCategory(row.index, id)
                                        : false
                                    }
                                  >
                                    {ROOM_CATEGORIES[id].label}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-charcoal/70">
              Selected:{" "}
              <span className="font-semibold text-charcoal">
                {props.quantity}
              </span>{" "}
              room{props.quantity === 1 ? "" : "s"}
            </p>
            {!props.lockQuantity ? (
              <span className="text-xs text-charcoal/50">
                Choose how many rooms of this category you want.
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
