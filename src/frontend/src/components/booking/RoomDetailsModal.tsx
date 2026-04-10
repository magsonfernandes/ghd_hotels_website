import {
  Bath,
  BriefcaseBusiness,
  Bus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Info,
  MapPin,
  Plane,
  Shirt,
  Sparkles,
  Snowflake,
  Train,
  Tv,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type TransportHub = {
  name: string;
  distanceKm: number;
  timeMinsRange: readonly [number, number];
  note?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  image: string;
  amenities: string[];
  description: string;
  bedInfo?: string;
  sleepsInfo?: string;
  transport?: {
    airports: TransportHub[];
    railways: TransportHub[];
    buses: TransportHub[];
    quickTipLines: string[];
  };
};

function amenityIcon(label: string) {
  const k = label.toLowerCase();
  if (k.includes("wi-fi") || k.includes("wifi")) return Wifi;
  if (k.includes("air")) return Snowflake;
  if (k.includes("tv")) return Tv;
  if (k.includes("desk") || k.includes("work")) return BriefcaseBusiness;
  if (k.includes("tea") || k.includes("coffee")) return Coffee;
  if (k.includes("wardrobe")) return Shirt;
  if (k.includes("bath")) return Bath;
  if (k.includes("linen")) return Sparkles;
  if (k.includes("housekeeping")) return Sparkles;
  return Info;
}

export function RoomDetailsModal(props: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryFading, setGalleryFading] = useState(false);
  const galleryFadeTimerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const zoomTouchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (!props.isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [props.isOpen]);

  useEffect(() => {
    if (!props.isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [props.isOpen, props.onClose]);

  const subInfo = useMemo(() => {
    const parts: string[] = [];
    if (props.bedInfo) parts.push(props.bedInfo);
    if (props.sleepsInfo) parts.push(props.sleepsInfo);
    return parts;
  }, [props.bedInfo, props.sleepsInfo]);

  const images = useMemo(() => Array.from({ length: 6 }, () => props.image), [props.image]);

  const GALLERY_FADE_MS = 220;
  const requestGalleryIndex = (nextIndex: number) => {
    const total = images.length;
    if (!total) return;
    const next = ((nextIndex % total) + total) % total;
    if (next === galleryIndex) return;

    if (galleryFadeTimerRef.current) {
      window.clearTimeout(galleryFadeTimerRef.current);
      galleryFadeTimerRef.current = null;
    }

    // Phase 1: fade out (opacity -> 0)
    setGalleryFading(true);
    galleryFadeTimerRef.current = window.setTimeout(() => {
      // Phase 2: swap image while still hidden
      setGalleryIndex(next);
      // Phase 3: fade in on next frame (opacity -> 1)
      window.requestAnimationFrame(() => setGalleryFading(false));
      galleryFadeTimerRef.current = null;
    }, GALLERY_FADE_MS);
  };

  useEffect(() => {
    if (!props.isOpen) return;
    return () => {
      if (galleryFadeTimerRef.current) {
        window.clearTimeout(galleryFadeTimerRef.current);
        galleryFadeTimerRef.current = null;
      }
    };
  }, [props.isOpen]);

  if (!props.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-5xl rounded-2xl border border-gold/15 bg-[#faf9f7] shadow-2xl shadow-black/40 overflow-hidden animate-[fadeInScale_180ms_ease-out] max-h-[calc(100vh-2.5rem)]"
      >
        <div className="flex max-h-[calc(100vh-2.5rem)] flex-col">
          <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4 sm:px-8">
            <h2
              id={titleId}
              className="font-display text-xl sm:text-2xl text-charcoal"
              style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
            >
              {props.roomName}
            </h2>
            <button
              type="button"
              onClick={props.onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/70 transition hover:bg-charcoal/5 hover:text-charcoal"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-invisible">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              {/* Left */}
              <div className="p-5 sm:p-8">
                {subInfo.length ? (
                  <p className="text-sm text-charcoal/65">
                    {subInfo.join(" • ")}
                  </p>
                ) : null}

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55 mb-3">
                    Room description
                  </p>
                  <p className="text-sm text-charcoal/75 leading-relaxed">
                    {props.description}
                  </p>
                  <p className="mt-3 text-sm text-charcoal/70">
                    <span className="font-semibold text-charcoal/80">
                      Room Size:
                    </span>{" "}
                    517 sq. ft.
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55 mb-3">
                    Room amenities
                  </p>
                  <ul className="space-y-2.5">
                    {props.amenities.map((a) => {
                      const Icon = amenityIcon(a);
                      return (
                        <li
                          key={a}
                          className="flex items-start gap-3 text-sm text-charcoal/80"
                        >
                          <span className="mt-0.5 w-5 flex justify-center text-charcoal/55">
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <span className="leading-relaxed">{a}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {props.transport ? (
                  <div className="mt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55 mb-3">
                      Nearby transport hubs (Nerul)
                    </p>

                    <div className="space-y-5">
                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-charcoal/55 mb-2 flex items-center gap-2">
                          <Plane className="h-4 w-4" aria-hidden />
                          Airports
                        </p>
                        <ul className="space-y-2">
                          {props.transport.airports.map((h) => (
                            <li
                              key={h.name}
                              className="rounded-lg border border-charcoal/10 bg-white/70 p-3"
                            >
                              <p className="text-sm font-semibold text-charcoal">
                                {h.name}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/65">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                                  {h.distanceKm} km
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" aria-hidden />
                                  {h.timeMinsRange[0]}–{h.timeMinsRange[1]} min
                                </span>
                              </div>
                              {h.note ? (
                                <p className="mt-1 text-xs text-charcoal/60">
                                  {h.note}
                                </p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-charcoal/55 mb-2 flex items-center gap-2">
                          <Train className="h-4 w-4" aria-hidden />
                          Railway stations
                        </p>
                        <ul className="space-y-2">
                          {props.transport.railways.map((h) => (
                            <li
                              key={h.name}
                              className="rounded-lg border border-charcoal/10 bg-white/70 p-3"
                            >
                              <p className="text-sm font-semibold text-charcoal">
                                {h.name}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/65">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                                  {h.distanceKm} km
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" aria-hidden />
                                  {h.timeMinsRange[0]}–{h.timeMinsRange[1]} min
                                </span>
                              </div>
                              {h.note ? (
                                <p className="mt-1 text-xs text-charcoal/60">
                                  {h.note}
                                </p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-charcoal/55 mb-2 flex items-center gap-2">
                          <Bus className="h-4 w-4" aria-hidden />
                          Bus stands
                        </p>
                        <ul className="space-y-2">
                          {props.transport.buses.map((h) => (
                            <li
                              key={h.name}
                              className="rounded-lg border border-charcoal/10 bg-white/70 p-3"
                            >
                              <p className="text-sm font-semibold text-charcoal">
                                {h.name}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/65">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                                  {h.distanceKm} km
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" aria-hidden />
                                  {h.timeMinsRange[0]}–{h.timeMinsRange[1]} min
                                </span>
                              </div>
                              {h.note ? (
                                <p className="mt-1 text-xs text-charcoal/60">
                                  {h.note}
                                </p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {props.transport.quickTipLines?.length ? (
                        <div className="rounded-xl border border-gold/15 bg-white/80 p-4">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-charcoal/55 mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4" aria-hidden />
                            Quick travel tip
                          </p>
                          <ul className="space-y-1.5">
                            {props.transport.quickTipLines.map((t) => (
                              <li key={t} className="text-xs text-charcoal/70">
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Right */}
              <div className="p-5 sm:p-8 lg:border-l lg:border-charcoal/10">
                <div className="rounded-xl border border-charcoal/10 bg-white/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/55 mb-3">
                    Room Gallery
                  </p>
                  <div
                    className="relative overflow-hidden rounded-xl border border-charcoal/10 bg-white"
                    onTouchStart={(e) => {
                      if (e.touches.length > 0) {
                        touchStartXRef.current = e.touches[0].clientX;
                      }
                    }}
                    onTouchEnd={(e) => {
                      const startX = touchStartXRef.current;
                      if (startX == null) return;
                      const endX = e.changedTouches[0]?.clientX ?? startX;
                      const deltaX = endX - startX;
                      touchStartXRef.current = null;
                      if (Math.abs(deltaX) < 24) return;
                      if (deltaX < 0) requestGalleryIndex(galleryIndex + 1);
                      else requestGalleryIndex(galleryIndex - 1);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setZoomSrc(images[galleryIndex] ?? props.image)}
                      className="group block w-full text-left"
                      aria-label={`Zoom gallery image ${galleryIndex + 1}`}
                    >
                      <img
                        src={images[galleryIndex] ?? props.image}
                        alt={`${props.roomName} gallery image ${galleryIndex + 1}`}
                        className={`w-full h-[260px] sm:h-[320px] lg:h-[420px] object-cover transition-opacity duration-300 ${
                          galleryFading ? "opacity-0" : "opacity-100"
                        }`}
                        loading="lazy"
                        draggable={false}
                      />
                    </button>

                    <div className="absolute inset-y-0 left-0 flex items-center px-2">
                      <button
                        type="button"
                        className="h-9 w-9 rounded-full bg-black/40 border border-white/10 text-ivory/90 flex items-center justify-center hover:bg-black/55 transition"
                        aria-label="Previous gallery image"
                        onClick={() => requestGalleryIndex(galleryIndex - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2">
                      <button
                        type="button"
                        className="h-9 w-9 rounded-full bg-black/40 border border-white/10 text-ivory/90 flex items-center justify-center hover:bg-black/55 transition"
                        aria-label="Next gallery image"
                        onClick={() => requestGalleryIndex(galleryIndex + 1)}
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={`gallery-dot-${i}`}
                          type="button"
                          className={`h-2 w-2 rounded-full border border-white/25 transition ${
                            i === galleryIndex
                              ? "bg-gold/90"
                              : "bg-white/15 hover:bg-white/25"
                          }`}
                          aria-label={`Show gallery image ${i + 1}`}
                          onClick={() => requestGalleryIndex(i)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom / lightbox */}
      {zoomSrc ? (
        <div
          className="absolute inset-0 z-[210] flex items-center justify-center p-4 sm:p-6"
          aria-label="Zoomed image"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onMouseDown={() => setZoomSrc(null)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setZoomSrc(null)}
              className="absolute -top-3 -right-3 sm:top-0 sm:right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/90 transition hover:bg-black/60"
              aria-label="Close zoom"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <div
              className="relative"
              onTouchStart={(e) => {
                if (e.touches.length > 0) {
                  zoomTouchStartXRef.current = e.touches[0].clientX;
                }
              }}
              onTouchEnd={(e) => {
                const startX = zoomTouchStartXRef.current;
                if (startX == null) return;
                const endX = e.changedTouches[0]?.clientX ?? startX;
                const deltaX = endX - startX;
                zoomTouchStartXRef.current = null;
                if (Math.abs(deltaX) < 24) return;
                if (deltaX < 0) requestGalleryIndex(galleryIndex + 1);
                else requestGalleryIndex(galleryIndex - 1);
                setZoomSrc(images[((galleryIndex % images.length) + images.length) % images.length] ?? props.image);
              }}
            >
            <img
              src={images[galleryIndex] ?? zoomSrc}
              alt={`Zoomed ${props.roomName}`}
              className={`w-full max-h-[80vh] object-contain rounded-2xl border border-white/10 shadow-2xl shadow-black/50 bg-black/20 transition-opacity duration-300 ${
                galleryFading ? "opacity-0" : "opacity-100"
              }`}
            />
              <div className="absolute inset-y-0 left-0 flex items-center px-2">
                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-black/45 border border-white/15 text-white/90 flex items-center justify-center hover:bg-black/60 transition"
                  aria-label="Previous image"
                  onClick={() => requestGalleryIndex(galleryIndex - 1)}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center px-2">
                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-black/45 border border-white/15 text-white/90 flex items-center justify-center hover:bg-black/60 transition"
                  aria-label="Next image"
                  onClick={() => requestGalleryIndex(galleryIndex + 1)}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

