import { Users } from "lucide-react";
import type { RateKey } from "./useInventoryManager";

function currency(n: number) {
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export function RoomOptionRow(props: {
  rateKey: RateKey;
  title: string;
  badge: string;
  badgeTone: "muted" | "gold";
  originalPrice: number;
  discountedPrice: number;
  nightsLabel?: string;
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (next: number) => void;
}) {
  const options = Array.from({ length: props.maxQuantity + 1 }, (_, i) => i);

  return (
    <div className="rounded-xl border border-gold/15 bg-white/80 px-4 py-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:gap-6">
        {/* Left: Badge + guests + title */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${
                props.badgeTone === "gold"
                  ? "bg-gold text-charcoal"
                  : "bg-charcoal/10 text-charcoal/75"
              }`}
            >
              {props.badge}
            </span>
            <div className="inline-flex items-center gap-1 text-charcoal/60 text-xs">
              <Users className="h-4 w-4" aria-hidden />
              <span className="uppercase tracking-[0.18em]">2 guests</span>
            </div>
          </div>
          <p className="font-body text-sm text-charcoal/85">{props.title}</p>
        </div>

        {/* Middle: Rooms selector */}
        <label className="flex items-center justify-between gap-3 lg:justify-start lg:gap-2">
          <span className="text-xs uppercase tracking-[0.18em] text-charcoal/55 whitespace-nowrap">
            Rooms
          </span>
          <select
            value={props.quantity}
            onChange={(e) => props.onQuantityChange(Number(e.target.value))}
            className="h-10 w-[120px] sm:w-[140px] lg:w-[92px] rounded-lg border border-gold/30 bg-white px-3 text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/25"
            aria-label={`${props.title} room quantity`}
          >
            {options.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        {/* Right: Price */}
        <div className="text-left lg:text-right lg:min-w-[190px]">
          <p className="text-xs text-charcoal/55 uppercase tracking-[0.18em]">
            Rate for 1 night
          </p>
          <div className="flex items-baseline justify-start lg:justify-end gap-2">
            <span className="text-sm text-charcoal/45 line-through">
              {currency(props.originalPrice)}
            </span>
            <span className="text-lg font-semibold text-charcoal">
              {currency(props.discountedPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
