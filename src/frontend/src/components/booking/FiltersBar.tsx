import type { ChangeEvent } from "react";

export function FiltersBar(props: {
  location: string;
  brand: string;
  onChange: (next: { location: string; brand: string }) => void;
  embedded?: boolean;
}) {
  const onLocation = (e: ChangeEvent<HTMLSelectElement>) => {
    props.onChange({ location: e.target.value, brand: props.brand });
  };
  const onBrand = (e: ChangeEvent<HTMLSelectElement>) => {
    props.onChange({ location: props.location, brand: e.target.value });
  };

  const inner = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-left">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            Location
          </span>
          <select
            value={props.location}
            onChange={onLocation}
            className="h-11 w-full rounded-lg border border-gold/35 bg-white px-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
            aria-label="Location"
          >
            <option value="">All locations</option>
            <option value="nerul">Nerul</option>
          </select>
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-1 text-left">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            Brand
          </span>
          <select
            value={props.brand}
            onChange={onBrand}
            className="h-11 w-full rounded-lg border border-gold/35 bg-white px-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
            aria-label="Brand"
          >
            <option value="">All brands</option>
            <option value="nivaara">Nivaãra</option>
            <option value="samraya" disabled>
              Samrāya (coming soon)
            </option>
            <option value="celestra" disabled>
              Celéstra (coming soon)
            </option>
          </select>
        </label>
      </div>
  );

  if (props.embedded) return inner;

  return (
    <div className="w-full rounded-2xl bg-white/95 border border-gold/25 shadow-xl shadow-black/20 px-4 py-4 sm:px-6">
      {inner}
    </div>
  );
}
