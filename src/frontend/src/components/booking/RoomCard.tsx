import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RoomOptionRow } from "./RoomOptionRow";
import {
  type BookingRateSelection,
  NIVAARA_STUDIO_RATES,
} from "./bookingRates";
import { useInventoryManager } from "./useInventoryManager";

export function RoomCard(props: {
  propertyName: string;
  brandLabel: string;
  roomType: string;
  image: string;
  totalInventory: number;
  onBook?: (selection: BookingRateSelection) => void;
}) {
  const inv = useInventoryManager(props.totalInventory);

  const totalSelected = inv.selectedTotal;

  const onBook = () => {
    if (props.onBook) {
      props.onBook({
        roomOnly: inv.selectedRooms.roomOnly,
        breakfast: inv.selectedRooms.breakfast,
        roomOnlyPerNight: NIVAARA_STUDIO_RATES.roomOnly.discounted,
        breakfastPerNight: NIVAARA_STUDIO_RATES.breakfast.discounted,
      });
      return;
    }
    // eslint-disable-next-line no-alert
    alert(
      `Booked — Room Only: ${inv.selectedRooms.roomOnly}, Breakfast: ${inv.selectedRooms.breakfast} (Remaining: ${inv.remainingInventory})`,
    );
  };

  return (
    <div className="rounded-3xl overflow-hidden border border-gold/15 bg-white/90 shadow-2xl shadow-black/25">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
        {/* LEFT: Image */}
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

          {/* Optional carousel arrows (single image for now) */}
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

        {/* MIDDLE/RIGHT: Details + Options */}
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
                Modern smart comfort room, thoughtfully designed for a refined
                stay. Ideal for 2 guests.
              </p>
              <Link
                to="/nivaara"
                className="inline-block mt-3 text-sm text-gold underline underline-offset-4 hover:text-gold-light transition"
              >
                More info
              </Link>
            </div>

            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-charcoal/55">
                Inventory
              </p>
              <p className="text-sm text-charcoal/80">
                {inv.remainingInventory} of {inv.totalInventory} available
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <RoomOptionRow
              rateKey="roomOnly"
              title="Room Only"
              badge="Basic Discount"
              badgeTone="muted"
              originalPrice={NIVAARA_STUDIO_RATES.roomOnly.original}
              discountedPrice={NIVAARA_STUDIO_RATES.roomOnly.discounted}
              quantity={inv.selectedRooms.roomOnly}
              maxQuantity={inv.maxSelectableFor("roomOnly")}
              onQuantityChange={(n) => inv.setQuantity("roomOnly", n)}
            />

            <RoomOptionRow
              rateKey="breakfast"
              title="Breakfast Included"
              badge="Best Value"
              badgeTone="gold"
              originalPrice={NIVAARA_STUDIO_RATES.breakfast.original}
              discountedPrice={NIVAARA_STUDIO_RATES.breakfast.discounted}
              quantity={inv.selectedRooms.breakfast}
              maxQuantity={inv.maxSelectableFor("breakfast")}
              onQuantityChange={(n) => inv.setQuantity("breakfast", n)}
            />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-charcoal/70">
              Selected:{" "}
              <span className="font-semibold text-charcoal">
                {totalSelected}
              </span>{" "}
              room{totalSelected === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              className="btn-gold-filled h-11 px-6 w-full sm:w-auto"
              onClick={onBook}
              disabled={totalSelected === 0}
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
