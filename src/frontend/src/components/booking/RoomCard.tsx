import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useRates } from "../../lib/rates";
import { GALLERY_IMAGE_SIZES } from "../../lib/optimizedMedia";
import { ResponsiveImage } from "../ResponsiveImage";
import { type RoomCategoryId, countSelectedMeals } from "./bookingRates";

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
  propertyLinkTo?: string;
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
  onAssignRoomCategory?: (
    roomIndex: number,
    nextCategoryId: RoomCategoryId,
  ) => void;
  canAssignRoomToCategory?: (
    roomIndex: number,
    nextCategoryId: RoomCategoryId,
  ) => boolean;
  onRoomDetails?: () => void;
}) {
  const rates = useRates();
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
  const assignedAdults = props.roomRows?.reduce((s, r) => s + r.adults, 0) ?? 0;
  const assignedChildren =
    props.roomRows?.reduce((s, r) => s + r.children, 0) ?? 0;
  const mealsSubtotal =
    mealsSelected > 0
      ? mealsSelected *
        (assignedAdults * rates.mealPrices.perAdult +
          assignedChildren * rates.mealPrices.perChild) *
        nights
      : 0;
  const totalSubtotal = baseSubtotal + mealsSubtotal;
  const categoryById = useMemo(() => {
    const m = new Map<string, { label: string }>();
    for (const c of rates.roomCategories) m.set(c.id, { label: c.label });
    return m;
  }, [rates.roomCategories]);
  const labelFor = (id: RoomCategoryId): string =>
    categoryById.get(id)?.label ?? id;

  return (
    <div className="rounded-3xl overflow-hidden border border-gold/15 bg-white/90 shadow-2xl shadow-black/25">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
        <div className="relative bg-charcoal">
          {props.onRoomDetails ? (
            <button
              type="button"
              onClick={props.onRoomDetails}
              className="group relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
              aria-label={`View ${props.roomType} details`}
            >
              <ResponsiveImage
                src={props.image}
                alt={props.roomType}
                className="w-full h-[220px] sm:h-[260px] lg:h-full min-h-[220px] sm:min-h-[260px] object-cover transition duration-300 group-hover:brightness-[0.92]"
                sizes={GALLERY_IMAGE_SIZES}
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/10" />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center rounded-full bg-charcoal/70 text-ivory px-3 py-1 text-xs uppercase tracking-[0.22em] border border-gold/20">
                  {props.roomType}
                </span>
              </div>
            </button>
          ) : (
            <>
              <ResponsiveImage
                src={props.image}
                alt={props.roomType}
                className="w-full h-[220px] sm:h-[260px] lg:h-full object-cover"
                sizes={GALLERY_IMAGE_SIZES}
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center rounded-full bg-charcoal/70 text-ivory px-3 py-1 text-xs uppercase tracking-[0.22em] border border-gold/20">
                  {props.roomType}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {props.propertyLinkTo ? (
                <Link
                  to={props.propertyLinkTo}
                  className="block w-full text-left text-gold/90 text-xs uppercase tracking-[0.28em] hover:text-gold transition-colors"
                >
                  {props.brandLabel} • {props.propertyName}
                </Link>
              ) : (
                <p className="block w-full text-left text-gold/90 text-xs uppercase tracking-[0.28em]">
                  {props.brandLabel} • {props.propertyName}
                </p>
              )}
              {props.onRoomDetails ? (
                <button
                  type="button"
                  onClick={props.onRoomDetails}
                  className="block w-full text-left font-display text-charcoal text-2xl sm:text-3xl mt-1 hover:text-charcoal/80 transition-colors"
                  style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
                >
                  {props.roomType}
                </button>
              ) : (
                <h2
                  className="block w-full text-left font-display text-charcoal text-2xl sm:text-3xl mt-1"
                  style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
                >
                  {props.roomType}
                </h2>
              )}
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
                <p className="font-body text-sm !font-bold text-charcoal/90">
                  Room Rate
                </p>
              </div>
              <label className="flex items-center justify-between gap-3 lg:justify-start lg:gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-charcoal/55 whitespace-nowrap">
                  Rooms
                </span>
                <select
                  value={props.quantity}
                  onChange={(e) =>
                    props.onQuantityChange(Number(e.target.value))
                  }
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
                              {labelFor(row.suggestedCategoryId)}
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
                              {rates.roomCategories.map((cat) => (
                                <option
                                  key={`assigned-room-${row.index}-cat-${cat.id}`}
                                  value={cat.id}
                                  disabled={
                                    props.canAssignRoomToCategory
                                      ? !props.canAssignRoomToCategory(
                                          row.index,
                                          cat.id,
                                        )
                                      : false
                                  }
                                >
                                  {cat.label}
                                </option>
                              ))}
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
