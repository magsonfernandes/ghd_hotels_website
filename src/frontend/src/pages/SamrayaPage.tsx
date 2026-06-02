import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Gem,
  Heart,
  Sparkles,
  Star,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { ResponsiveImage } from "../components/ResponsiveImage";
import { HERO_IMAGE_SIZES } from "../lib/optimizedMedia";
import { heroImageTitleStyle } from "../lib/heroTitleStyle";
import { useScrollAnimationAll } from "../hooks/useScrollAnimation";

const features = [
  {
    icon: Gem,
    label: "Bespoke Suites",
    description:
      "Private sanctuaries with layered lighting, bespoke furnishings, and views that restore perspective.",
  },
  {
    icon: UtensilsCrossed,
    label: "Culinary Artistry",
    description:
      "Immersive journeys curated by master chefs, reflecting destination culture and timeless technique.",
  },
  {
    icon: Sparkles,
    label: "Signature Spa Rituals",
    description:
      "Holistic sanctuaries rooted in ancient wisdom and modern science; experiences that cannot be replicated.",
  },
  {
    icon: Waves,
    label: "Iconic Pools & Landscapes",
    description:
      "Architecturally landmark infinity pools and settings that define the destination.",
  },
  {
    icon: Crown,
    label: "Grand Ballrooms & Events",
    description:
      "Opulent spaces for celebrations that feel once-in-a-lifetime and business that feels regal.",
  },
  {
    icon: Heart,
    label: "Destination Weddings",
    description:
      "Bespoke celebrations set in architectural masterpieces — unforgettable by design.",
  },
];

const propertyGallery = {
  title: "Samraya Dodamarg",
  images: [
    {
      folderLabel: "Exterior",
      src: "/SAMRAYA/Exterior/DJI_20260227174647_0419_D.JPG",
    },
    {
      folderLabel: "Exterior",
      src: "/SAMRAYA/Exterior/DJI_20260227174028_0405_D.JPG",
    },
    {
      folderLabel: "1 BHK",
      src: "/SAMRAYA/1 BHK/YAD08303.JPG",
    },
    {
      folderLabel: "1 BHK",
      src: "/SAMRAYA/1 BHK/YAD08283.JPG",
    },
    {
      folderLabel: "2 BHK",
      src: "/SAMRAYA/2 BHK/YAD08068.JPG",
    },
    {
      folderLabel: "2 BHK",
      src: "/SAMRAYA/2 BHK/YAD07957.JPG",
    },
    {
      folderLabel: "Villa",
      src: "/SAMRAYA/Villa/YAD07641.JPG",
    },
    {
      folderLabel: "Villa",
      src: "/SAMRAYA/Villa/YAD07569.JPG",
    },
  ],
};

const SAMRAYA_PHILOSOPHY = {
  darkOverlayOpacity: 0.42,
};

// ── Samrāya philosophy: royallady only (scroll parallax). green.png is layout-only (no JS motion).
const SAMRAYA_PHILOSOPHY_PARALLAX = {
  royal: {
    multiplier: 0.13,
    clampMin: -160,
    clampMax: 160,
  },
};

// Smooth opacity fade for decorative layers (royallady + green) when entering/leaving Philosophy.
// Values are in "vh" terms and applied against the section's rect.top / rect.bottom.
const SAMRAYA_PHILOSOPHY_FADE = {
  // Fade in as section top moves from here -> here.
  fadeInStartVh: 0.9,
  fadeInEndVh: 0.1,
  // Fade out as section bottom moves from here -> here (negative = above viewport).
  fadeOutStartVh: 0.9,
  fadeOutEndVh: 0.1,
};

/** How far green.png sits below the philosophy section’s bottom edge (into Offerings). */
const SAMRAYA_GREEN_OVERFLOW = "clamp(4.5rem, 4vw, 10rem)";

/** Extra top space so Offerings headings/grid clear the green decorative image. */
const SAMRAYA_OFFERINGS_TOP_PAD = `calc(${SAMRAYA_GREEN_OVERFLOW} + 2.5rem)`;

/** Full-bleed width (viewport). Slightly over 100vw if you want no hairline gaps. */
const SAMRAYA_GREEN_WIDTH = "104vw";

/** Added to margin-left calc (after viewport centering): negative = nudge left, positive = right. */
const SAMRAYA_GREEN_SHIFT_X = "-25px";

export function SamrayaPage() {
  useScrollAnimationAll();
  const philosophyRef = useRef<HTMLElement | null>(null);
  const [royalParallax, setRoyalParallax] = useState(0);
  const [philosophyFade, setPhilosophyFade] = useState(0);
  const [propertiesImageIndex, setPropertiesImageIndex] = useState(0);
  const [propertiesPrevIndex, setPropertiesPrevIndex] = useState<number | null>(
    null,
  );
  const [propertiesCarouselPaused, setPropertiesCarouselPaused] = useState(false);
  const propertiesImageIndexRef = useRef(0);
  const propertiesPrevIndexRef = useRef<number | null>(null);
  const propertiesCrossfadeTimerRef = useRef<number | null>(null);

  const PROPERTIES_IMAGES = propertyGallery.images;
  const PROPERTIES_AUTO_ADVANCE_MS = 3000;
  const PROPERTIES_CROSSFADE_MS = 380;

  propertiesImageIndexRef.current = propertiesImageIndex;
  propertiesPrevIndexRef.current = propertiesPrevIndex;

  const goToPropertyPhoto = useCallback(
    (nextIndex: number) => {
      const total = PROPERTIES_IMAGES.length;
      if (!total) return;
      const next = ((nextIndex % total) + total) % total;
      const current = propertiesImageIndexRef.current;
      if (next === current && propertiesPrevIndexRef.current === null) return;

      if (propertiesCrossfadeTimerRef.current) {
        window.clearTimeout(propertiesCrossfadeTimerRef.current);
        propertiesCrossfadeTimerRef.current = null;
      }

      setPropertiesPrevIndex(current);
      setPropertiesImageIndex(next);

      propertiesCrossfadeTimerRef.current = window.setTimeout(() => {
        setPropertiesPrevIndex(null);
        propertiesCrossfadeTimerRef.current = null;
      }, PROPERTIES_CROSSFADE_MS);
    },
    [PROPERTIES_IMAGES.length],
  );

  useEffect(() => {
    document.title = "Samrāya by GHD – Flagship Luxury";
  }, []);

  useEffect(() => {
    if (propertiesCarouselPaused) return;
    if (!PROPERTIES_IMAGES.length) return;
    const id = window.setInterval(() => {
      goToPropertyPhoto(propertiesImageIndexRef.current + 1);
    }, PROPERTIES_AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [propertiesCarouselPaused, goToPropertyPhoto, PROPERTIES_IMAGES.length]);

  useEffect(() => {
    return () => {
      if (propertiesCrossfadeTimerRef.current) {
        window.clearTimeout(propertiesCrossfadeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = philosophyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = vh * 0.5;
      const clamp = (v: number, min: number, max: number) =>
        Math.max(min, Math.min(max, v));
      const base = center - rect.top;

      const p = SAMRAYA_PHILOSOPHY_PARALLAX;
      setRoyalParallax(
        clamp(base * p.royal.multiplier, p.royal.clampMin, p.royal.clampMax),
      );

      // Smooth enter/exit fade using rect.top/rect.bottom (no transform/position animation).
      const smoothstep01 = (t: number) => t * t * (3 - 2 * t);
      const fadeInStartPx = vh * SAMRAYA_PHILOSOPHY_FADE.fadeInStartVh;
      const fadeInEndPx = vh * SAMRAYA_PHILOSOPHY_FADE.fadeInEndVh;
      const fadeInT = clamp(
        (fadeInStartPx - rect.top) / (fadeInStartPx - fadeInEndPx),
        0,
        1,
      );

      const fadeOutStartPx = vh * SAMRAYA_PHILOSOPHY_FADE.fadeOutStartVh;
      const fadeOutEndPx = vh * SAMRAYA_PHILOSOPHY_FADE.fadeOutEndVh;
      const fadeOutT = clamp(
        (rect.bottom - fadeOutEndPx) / (fadeOutStartPx - fadeOutEndPx),
        0,
        1,
      );

      setPhilosophyFade(smoothstep01(fadeInT) * smoothstep01(fadeOutT));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="bg-black min-h-screen overflow-x-clip samraya-test-font">
      <HeroSection
        bgVideo="/SAMRAYA/GHD Regenta Aangan About.mp4"
        bgVideoPoster="/assets/generated/hero-samraya.dim_1920x1080.w1280.webp"
        title={
          <>
            — Samrāya —
            <span
              className="hero-tagline block mt-6 sm:mt-8"
              style={{
                fontFamily:
                  '"Zapfino", "Snell Roundhand", "Apple Chancery", "Segoe Script", "Brush Script MT", cursive',
              }}
            >
              A Realm of Refined Grandeur
            </span>
          </>
        }
        overlay="dark"
        baseColor="black"
        fadeOnScroll
        contentPlacement="below-center"
        titleStyle={heroImageTitleStyle}
      />

      {/* Brand Introduction */}
      <section className="home-section-pad relative z-0 bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            <div className="lg:col-span-7 text-justify">
              <p
                className="eyebrow eyebrow--gold-emphasis animate-on-scroll"
                style={{ color: "#b8975a" }}
              >
                The Flagship Brand
              </p>
              <div
                className="gold-divider gold-divider-left animate-on-scroll delay-100"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #b8975a, transparent)",
                }}
              />
              <h2
                className="section-lead animate-on-scroll delay-200"
                style={{ marginBottom: "1.5rem" }}
              >
                A Quieter Power, Rooted in Heritage
              </h2>
              <div className="space-y-5 animate-on-scroll delay-300">
                <p className="body-refined-lg text-ivory-muted/70">
                  Luxury is not only about grandeur—it is about creating
                  experiences that carry meaning, heritage, and timeless
                  elegance. The name <strong>Samrāya</strong> is inspired by the
                  idea of sovereignty and sanctuary—a realm that reflects
                  dignity, balance, and quiet authority. Chosen for its cultural
                  depth and regal character, it embodies a vision of spaces
                  where guests are welcomed with the warmth and reverence
                  traditionally reserved for royalty.
                </p>
                <p className="body-refined-lg text-ivory-muted/70">
                  As the flagship five-star brand of GHD Hotels, Samrāya is
                  conceived as a luxury hospitality experience rooted in Indian
                  heritage. Drawing from the architectural elegance, cultural
                  richness, and royal traditions of historic Indian palaces, the
                  brand reinterprets these influences through contemporary
                  design and modern hospitality standards.
                </p>
                <p className="section-quote text-ivory/90" style={{ marginTop: "0.75rem" }}>
                  Samrāya — A Kingdom of Comfort. A Legacy of Luxury.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 lg:self-start animate-on-scroll-right delay-200">
              <div
                className="border border-gold/15 p-5 sm:p-8"
                style={{ borderColor: "rgba(184, 151, 90, 0.2)" }}
              >
                <p
                  className="eyebrow eyebrow--gold-emphasis mb-4 text-justify"
                  style={{ color: "#b8975a" }}
                >
                  The Samrāya Promise
                </p>
                <ul className="space-y-3">
                  {[
                    "Refined luxury — excellence in every detail",
                    "Grand design — heritage-inspired architecture with modern elegance",
                    "Intuitive service — personalized, discreet, and effortless",
                    "Living heritage — Indian culture expressed through experience, not display",
                    "Enduring excellence — world-class standards across every destination",
                  ].map((item) => {
                    const [bold, ...rest] = item.split(" — ");
                    const restText = rest.join(" — ");
                    return (
                      <li key={item} className="flex items-start gap-3">
                        <span
                          className="w-5 h-px flex-shrink-0 mt-[0.65em]"
                          style={{ background: "#b8975a" }}
                        />
                        <span className="body-refined text-ivory-muted/70 min-w-0 flex-1 text-justify">
                          <strong className="text-ivory/90 font-semibold">
                            {bold}
                          </strong>
                          {restText ? ` — ${restText}` : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy + Offerings: green.png overflows visually into Offerings (no overflow clip on section). */}
      <section
        ref={philosophyRef}
        className="brand-philosophy-section relative z-10 overflow-x-clip overflow-y-visible bg-black"
        style={{ backgroundColor: "#000" }}
      >
        {/* Clip royallady + overlay only — green is a sibling so it can extend past section bottom */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <ResponsiveImage
            src="/assets/generated/royallady.png"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-center select-none"
            sizes={HERO_IMAGE_SIZES}
            style={{
              filter: "brightness(0.88) contrast(1.05) saturate(1.02)",
              transform: `translate3d(0, ${royalParallax}px, 0)`,
              opacity: philosophyFade,
              willChange: "transform, opacity",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `rgba(18, 16, 14, ${SAMRAYA_PHILOSOPHY.darkOverlayOpacity})`,
              opacity: philosophyFade,
            }}
            aria-hidden
          />
        </div>

        {/* green.png: full viewport width, centered (calc breaks out of section-pad); bottom into Offerings */}
        <div
          className="pointer-events-none absolute left-0 z-[15] max-w-none"
          style={{
            width: SAMRAYA_GREEN_WIDTH,
            // Centers a 100vw-wide layer on the viewport from inside padded section
            marginLeft: `calc(50% - 50vw + ${SAMRAYA_GREEN_SHIFT_X})`,
            bottom: `calc(-1 * ${SAMRAYA_GREEN_OVERFLOW})`,
            opacity: philosophyFade,
          }}
        >
          <ResponsiveImage
            src="/assets/generated/green.png"
            alt=""
            aria-hidden
            className="mx-auto block h-auto w-full max-w-full object-contain object-center select-none"
            sizes={HERO_IMAGE_SIZES}
          />
        </div>

        <div className="brand-philosophy-section__content relative z-[30] flex w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <p
                className="eyebrow eyebrow--gold-emphasis animate-on-scroll"
                style={{ color: "#b8975a" }}
              >
                The Philosophy of Samrāya
              </p>
              <div
                className="gold-divider mx-auto animate-on-scroll delay-100"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #b8975a, transparent)",
                }}
              />
              <h2 className="section-lead animate-on-scroll delay-200">
                Luxury with Purpose
              </h2>
            </div>

            <div className="space-y-4 animate-on-scroll delay-300">
              <p className="body-refined-lg text-ivory-muted/70 drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
                At Samrāya, luxury is shaped by purpose, precision, and thoughtful
                hospitality.
              </p>
              <p className="body-refined-lg text-ivory-muted/70 drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
                Rooted in the timeless Indian principle of{" "}
                <em>Atithi Devo Bhava</em>— the guest is divine — Samrāya
                interprets India’s heritage through a contemporary lens, creating
                spaces where grandeur, dignity, and thoughtful service coexist in
                perfect harmony. As the flagship five-star brand of GHD Hotels,
                Samrāya is designed to deliver world-class luxury experiences
                while preserving the warmth and cultural depth of Indian
                hospitality.
              </p>
              <p className="body-refined-lg text-ivory-muted/70 drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
                Samrāya represents refined grandeur — not opulence for display,
                but excellence expressed through architecture, service, and
                meticulous attention to detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings: transparent top band so philosophy green can show through; charcoal begins below overlap */}
      <section className="home-section-pad relative z-10 overflow-visible bg-transparent">
        <div
          className="pointer-events-none absolute inset-x-0 bg-black z-0"
          style={{
            top: SAMRAYA_GREEN_OVERFLOW,
            bottom: 0,
          }}
          aria-hidden
        />
        <div
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-0"
          style={{ paddingTop: SAMRAYA_OFFERINGS_TOP_PAD }}
        >
          <div className="text-center mb-8 sm:mb-10">
            <p
              className="eyebrow eyebrow--gold-emphasis animate-on-scroll"
              style={{ color: "#b8975a" }}
            >
              Samrāya Offerings
            </p>
            <div
              className="gold-divider animate-on-scroll delay-100"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #b8975a, transparent)",
              }}
            />
            <h2 className="section-lead animate-on-scroll delay-200">
              The Samrāya Experience
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="feature-item animate-on-scroll text-justify"
                  style={{
                    transitionDelay: `${0.05 + i * 0.1}s`,
                    borderColor: "rgba(184, 151, 90, 0.12)",
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon size={18} style={{ color: "#b8975a" }} />
                  </div>
                  <div>
                    <h3 className="pillar-title text-ivory mb-2">
                      {feature.label}
                    </h3>
                    <p className="body-refined text-ivory-muted/70">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Properties */}
      <section
        id="properties"
        className="home-section-pad bg-black border-t border-gold/10"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="eyebrow eyebrow--gold-emphasis mb-4">Properties</p>
          <div
            className="gold-divider mx-auto mb-8"
            style={{
              background:
                "linear-gradient(90deg, transparent, #b8975a, transparent)",
            }}
          />

          <ul className="text-left mx-auto space-y-4">
            <li
              className="font-body text-ivory/90 border border-gold/15 rounded-2xl px-6 py-6 sm:px-8 sm:py-8 w-full bg-black/30 animate-on-scroll"
              style={{
                fontFamily: "General Sans, Helvetica Neue, sans-serif",
              }}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-8">
                <div className="min-w-0 shrink-0 text-left lg:flex lg:flex-col lg:justify-center">
                  <span className="font-display text-gold-light text-2xl block leading-snug">
                    <span className="font-body text-sm sm:text-base font-semibold uppercase tracking-[0.22em] text-gold">
                      Opening Soon
                    </span>
                    <span
                      className="text-ivory-muted/40 mx-2 sm:mx-3"
                      aria-hidden
                    >
                      ·
                    </span>
                    {propertyGallery.title}
                  </span>
                  <p className="body-refined text-ivory-muted/65 mt-3 max-w-md">
                    A flagship Samrāya destination in Dodamarg — set amid the
                    Western Ghats, where refined design meets quiet nature-led
                    escape.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div
                  className="relative rounded-2xl overflow-hidden border border-gold/15 bg-black/30"
                  onMouseEnter={() => setPropertiesCarouselPaused(true)}
                  onMouseLeave={() => setPropertiesCarouselPaused(false)}
                  onFocusCapture={() => setPropertiesCarouselPaused(true)}
                  onBlurCapture={(e) => {
                    const next = e.relatedTarget as Node | null;
                    if (!next || !e.currentTarget.contains(next)) {
                      setPropertiesCarouselPaused(false);
                    }
                  }}
                >
                  <div className="relative h-[340px] sm:h-[420px] lg:h-[520px]">
                    <ResponsiveImage
                      src={
                        PROPERTIES_IMAGES[
                          propertiesPrevIndex ?? propertiesImageIndex
                        ]?.src ?? PROPERTIES_IMAGES[0]?.src ?? ""
                      }
                      alt=""
                      aria-hidden
                      className="nivaara-property-carousel__slide"
                      sizes="(max-width: 1024px) 100vw, 1100px"
                      draggable={false}
                    />
                    {propertiesPrevIndex !== null && (
                      <ResponsiveImage
                        key={propertiesImageIndex}
                        src={
                          PROPERTIES_IMAGES[propertiesImageIndex]?.src ??
                          PROPERTIES_IMAGES[0]?.src ??
                          ""
                        }
                        alt=""
                        aria-hidden
                        className="nivaara-property-carousel__slide nivaara-property-carousel__slide--incoming"
                        sizes="(max-width: 1024px) 100vw, 1100px"
                        priority
                        draggable={false}
                      />
                    )}

                    <div className="absolute top-3 right-3">
                      <div
                        className="inline-flex items-center self-start px-3 py-1 text-[11px] tracking-[0.22em] uppercase border"
                        style={{
                          borderColor: "rgba(255,255,255,0.18)",
                          color: "rgba(255,255,255,0.86)",
                          backgroundColor: "rgba(0,0,0,0.35)",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        {PROPERTIES_IMAGES[propertiesImageIndex]?.folderLabel ?? ""}
                      </div>
                    </div>
                  </div>

                  {/* Left / right arrows */}
                  <div className="absolute inset-y-0 left-0 flex items-center px-3">
                    <button
                      type="button"
                      className="h-10 w-10 rounded-full bg-black/45 border border-white/10 text-ivory/90 flex items-center justify-center hover:bg-black/55 transition"
                      aria-label="Previous photo"
                      onClick={() => goToPropertyPhoto(propertiesImageIndex - 1)}
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3">
                    <button
                      type="button"
                      className="h-10 w-10 rounded-full bg-black/45 border border-white/10 text-ivory/90 flex items-center justify-center hover:bg-black/55 transition"
                      aria-label="Next photo"
                      onClick={() => goToPropertyPhoto(propertiesImageIndex + 1)}
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Under Development Banner */}
      <section className="py-10 sm:py-14 lg:py-16 bg-black">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
          <div
            className="p-6 sm:p-8 lg:p-12 animate-on-scroll"
            style={{ border: "1px solid rgba(184, 151, 90, 0.25)" }}
          >
            <div
              className="gold-divider"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #b8975a, transparent)",
              }}
            />
            <h3
              className="font-display text-xl sm:text-2xl mt-4 sm:mt-6 mb-3 sm:mb-4"
              style={{
                fontFamily: "Instrument Serif, Georgia, serif",
                fontWeight: 400,
                color: "#b8975a",
              }}
            >
              Coming Soon
            </h3>
            <p
              className="font-body text-ivory-muted/65 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8"
              style={{
                fontWeight: 300,
              }}
            >
              Samrāya hotels are currently under development at premier business
              and leisure destinations across India and beyond.
            </p>
            <Link
              to="/contact"
              className="btn-gold text-sm w-full sm:w-auto inline-block text-center"
              style={{ borderColor: "#b8975a", color: "#b8975a" }}
            >
              <span>Register Your Interest</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Cross Navigation */}
      <section className="py-10 sm:py-14 lg:py-16 bg-black border-t border-gold/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          <p className="eyebrow mb-6 sm:mb-8 animate-on-scroll">
            Explore Our Portfolio
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center animate-on-scroll delay-200">
            <Link
              to="/celestra"
              className="btn-gold w-full sm:w-auto text-center"
              data-ocid="samraya.celestra.button"
            >
              <span>Explore Celéstra</span>
            </Link>
            <Link
              to="/nivaara"
              className="btn-gold w-full sm:w-auto text-center"
              data-ocid="samraya.nivaara.button"
            >
              <span>Explore Nivaãra</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
