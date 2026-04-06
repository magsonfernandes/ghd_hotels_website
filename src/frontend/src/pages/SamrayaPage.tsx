import { Link } from "@tanstack/react-router";
import {
  Crown,
  Gem,
  Heart,
  Sparkles,
  Star,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
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

/** Full-bleed width (viewport). Slightly over 100vw if you want no hairline gaps. */
const SAMRAYA_GREEN_WIDTH = "104vw";

/** Added to margin-left calc (after viewport centering): negative = nudge left, positive = right. */
const SAMRAYA_GREEN_SHIFT_X = "-25px";

export function SamrayaPage() {
  useScrollAnimationAll();
  const philosophyRef = useRef<HTMLElement | null>(null);
  const [royalParallax, setRoyalParallax] = useState(0);
  const [philosophyFade, setPhilosophyFade] = useState(0);

  useEffect(() => {
    document.title = "Samrāya by GHD – Flagship Luxury";
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
    <div className="bg-black min-h-screen overflow-x-clip">
      <HeroSection
        bgImage="/assets/generated/hero-samraya.dim_1920x1080.png"
        title={
          <>
            — Samrāya —
            <span
              className="block mt-6 sm:mt-8"
              style={{
                fontFamily:
                  '"Zapfino", "Snell Roundhand", "Apple Chancery", "Segoe Script", "Brush Script MT", cursive',
                fontSize: "clamp(1.02rem, 2.2vw, 1.8rem)",
                fontWeight: 400,
                letterSpacing: "0.02em",
                textTransform: "none",
                WebkitTextStroke: "0px transparent",
              }}
            >
              A Realm of Refined Grandeur
            </span>
          </>
        }
        overlay="dark"
        baseColor="black"
        fadeOnScroll
        titleStyle={{
          fontSize: "clamp(4.85rem, 8.4vw, 9.25rem)",
          WebkitTextStroke: "1.3px rgba(0, 0, 0, 0.8)",
          textShadow:
            "0 0 20px rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.6), 0 0 70px rgba(0,0,0,0.85)",
        }}
      />

      {/* Brand Introduction */}
      <section className="section-pad relative z-0 bg-black pt-12 sm:pt-16 md:pt-20 lg:pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
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
                className="section-subheading animate-on-scroll delay-200"
                style={{ marginBottom: "2.5rem" }}
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
                <p
                  className="font-display text-ivory/90 italic"
                  style={{
                    fontFamily: "Instrument Serif, Georgia, serif",
                    fontWeight: 400,
                    fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
                    letterSpacing: "0.02em",
                    lineHeight: 1.5,
                    marginTop: "0.75rem",
                  }}
                >
                  Samrāya — A Kingdom of Comfort. A Legacy of Luxury.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 lg:self-start lg:pt-12 animate-on-scroll-right delay-200">
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
                        <span className="font-body text-base text-ivory-muted/70 min-w-0 flex-1 text-justify">
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
        className="section-pad relative z-10 overflow-x-clip overflow-y-visible bg-black"
        style={{ backgroundColor: "#000" }}
      >
        {/* Clip royallady + overlay only — green is a sibling so it can extend past section bottom */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src="/assets/generated/royallady.png"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-center select-none"
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
          <img
            src="/assets/generated/green.png"
            alt=""
            aria-hidden
            className="mx-auto block h-auto w-full max-w-full object-contain object-center select-none"
          />
        </div>

        <div className="relative z-[30] max-w-4xl mx-auto px-4 sm:px-0 lg:px-8 lg:max-w-[54vw] lg:ml-0 lg:mr-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p
              className="eyebrow eyebrow--gold-emphasis animate-on-scroll"
              style={{ color: "#b8975a" }}
            >
              The Philosophy of Samrāya
            </p>
            <div
              className="gold-divider animate-on-scroll delay-100"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #b8975a, transparent)",
              }}
            />
            <h2 className="section-heading animate-on-scroll delay-200">
              Luxury with Purpose
            </h2>
          </div>

          <div className="space-y-6 animate-on-scroll delay-300 text-center max-w-3xl mx-auto">
            <p
              className="body-refined-lg font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]"
              style={{ color: "rgba(245,240,232,0.92)", fontWeight: 700 }}
            >
              At Samrāya, luxury is shaped by purpose, precision, and thoughtful
              hospitality.
            </p>
            <p
              className="body-refined-lg font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]"
              style={{ fontWeight: 700 }}
            >
              Rooted in the timeless Indian principle of{" "}
              <em>Atithi Devo Bhava</em>— the guest is divine — Samrāya
              interprets India’s heritage through a contemporary lens, creating
              spaces where grandeur, dignity, and thoughtful service coexist in
              perfect harmony. As the flagship five-star brand of GHD Hotels,
              Samrāya is designed to deliver world-class luxury experiences
              while preserving the warmth and cultural depth of Indian
              hospitality.
            </p>
            <p
              className="body-refined-lg font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]"
              style={{ fontWeight: 700 }}
            >
              Samrāya represents refined grandeur — not opulence for display,
              but excellence expressed through architecture, service, and
              meticulous attention to detail.
            </p>
          </div>
        </div>
      </section>

      {/* Offerings: transparent top band so philosophy green can show through; charcoal begins below overlap */}
      <section className="section-pad relative z-10 overflow-visible bg-transparent">
        <div
          className="pointer-events-none absolute inset-x-0 bg-black z-0"
          style={{
            top: SAMRAYA_GREEN_OVERFLOW,
            bottom: 0,
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
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
            <h2 className="section-heading animate-on-scroll delay-200">
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
                    <h3
                      className="font-display text-ivory text-base mb-2"
                      style={{
                        fontFamily: "Instrument Serif, Georgia, serif",
                        fontWeight: 400,
                      }}
                    >
                      {feature.label}
                    </h3>
                    <p
                      className="font-body text-base text-ivory-muted/70 leading-relaxed"
                      style={{
                        fontWeight: 300,
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
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
