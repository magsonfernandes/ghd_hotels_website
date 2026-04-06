import { Link } from "@tanstack/react-router";
import {
  Armchair,
  BedDouble,
  Briefcase,
  CalendarDays,
  Coffee,
  Dumbbell,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { useScrollAnimationAll } from "../hooks/useScrollAnimation";

const features = [
  {
    icon: BedDouble,
    label: "Modern Rooms & Suites",
    description:
      "Thoughtfully designed rooms with premium fixtures, luxurious bedding, and sophisticated finishes.",
  },
  {
    icon: Coffee,
    label: "All Day Dining Restaurant",
    description:
      "Vibrant all-day dining with international and regional cuisines served in a contemporary setting.",
  },
  {
    icon: Briefcase,
    label: "Business Meeting Spaces",
    description:
      "State-of-the-art meeting rooms and boardrooms equipped with modern technology.",
  },
  {
    icon: Armchair,
    label: "Premium Lounge",
    description:
      "Exclusive lounge areas for relaxation, networking, and informal business conversations.",
  },
  {
    icon: Dumbbell,
    label: "Fitness Center",
    description:
      "Fully equipped, modern fitness facilities with professional equipment and wellness programs.",
  },
  {
    icon: CalendarDays,
    label: "Event Spaces",
    description:
      "Flexible, elegantly designed spaces for corporate events, social gatherings, and private celebrations.",
  },
];

// ── Celéstra philosophy parallax tuning ─────────────────────────────
// Adjust these values to manually tweak position + parallax intensity.
const CELESTRA_PHILOSOPHY_PARALLAX = {
  // Pathway background movement
  pathway: {
    multiplier: 0.18, // parallax strength
    clampMin: -220,
    clampMax: 220,
  },
  // Couple foreground movement
  couple: {
    multiplier: 0.1, // parallax strength (a bit stronger than pathway)
    clampMin: -280,
    clampMax: 200,
  },
  // Manual positioning + size for the couple layer
  couplePosition: {
    objectPosition: "center bottom",
    scale: 1.2, // full size (adjust as needed)
  },
  // Pixel-perfect nudge while keeping parallax (x=right, y=down)
  coupleOffsetPx: {
    x: 0,
    y: 0,
  },
};

// ── Celéstra philosophy fade tuning ─────────────────────────────────
// Edit these values to change when and how fast the philosophy section fades.
const CELESTRA_PHILOSOPHY_FADE = {
  // Fade-in (pathway + overlay appear as you scroll into the section)
  fadeInStartVh: 1.5,
  fadeInEndVh: 0.2,

  // COUPLE image fade-out: when the philosophy section itself scrolls away
  fadeOutStartVh: -0.5, // start fading when section top is this many vh from top (e.g. 0.5 = 50% viewport)
  fadeOutEndVh: -1, // fully faded when section top is this many vh above viewport (negative = above)

  // PATHWAY image fade-out: starts when you're halfway towards "Celéstra Offerings"
  pathwayFadeStartVh: 0.7, // start fading earlier (midpoint still clearly on-screen)
  pathwayFadeEndVh: -0.05, // fully faded shortly after midpoint passes top (reaches 0 reliably)

  // Curve: higher = more abrupt fade; lower = gentler (e.g. 1.2–2)
  curvePower: 1.3,
  // Ease: lower = fade stays visible longer then drops; higher = more linear (e.g. 0.6–1)
  fadeOutEase: 0.5,
  darkOverlayOpacity: 0.18,
};

export function CelestraPage() {
  useScrollAnimationAll();
  const philosophyRef = useRef<HTMLElement | null>(null);
  const offeringsRef = useRef<HTMLElement | null>(null);
  const [textParallax, setTextParallax] = useState(0);
  const [pathwayParallax, setPathwayParallax] = useState(0);
  const [coupleParallax, setCoupleParallax] = useState(0);
  const [philosophyBgOpacity, setPhilosophyBgOpacity] = useState(0);
  const [philosophyCoupleOpacity, setPhilosophyCoupleOpacity] = useState(0);

  useEffect(() => {
    document.title = "Celéstra by GHD – Premium Hospitality";
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
      const smoothstep01 = (t: number) => t * t * (3 - 2 * t);

      // Match Nivaãra philosophy text parallax exactly.
      const textOffset = (center - rect.top) * 0.07;
      setTextParallax(clamp(textOffset, -36, 36));

      // Smooth continuous parallax while entering/leaving the section
      const base = center - rect.top;
      setPathwayParallax(
        clamp(
          base * CELESTRA_PHILOSOPHY_PARALLAX.pathway.multiplier,
          CELESTRA_PHILOSOPHY_PARALLAX.pathway.clampMin,
          CELESTRA_PHILOSOPHY_PARALLAX.pathway.clampMax,
        ),
      );
      setCoupleParallax(
        clamp(
          base * CELESTRA_PHILOSOPHY_PARALLAX.couple.multiplier,
          CELESTRA_PHILOSOPHY_PARALLAX.couple.clampMin,
          CELESTRA_PHILOSOPHY_PARALLAX.couple.clampMax,
        ),
      );

      // Fade timing copied from Nivaãra pattern (with tunable constants)
      const fadeInT = clamp(
        (vh * CELESTRA_PHILOSOPHY_FADE.fadeInStartVh - rect.top) /
          (vh * 2 - vh * CELESTRA_PHILOSOPHY_FADE.fadeInEndVh),
        0,
        1,
      );
      // Fade-out based on section TOP (for couple)
      const fadeOutStart = CELESTRA_PHILOSOPHY_FADE.fadeOutStartVh * vh;
      const fadeOutEnd = CELESTRA_PHILOSOPHY_FADE.fadeOutEndVh * vh;
      const fadeOutT = clamp(
        (rect.top - fadeOutEnd) / (fadeOutStart - fadeOutEnd),
        0,
        1,
      );
      const fadeOutSmooth = fadeOutT ** CELESTRA_PHILOSOPHY_FADE.fadeOutEase;

      // Pathway: start fading when halfway towards Celéstra Offerings (uses pathwayFadeStartVh / pathwayFadeEndVh)
      const offeringsEl = offeringsRef.current;
      let pathwayFadeOutT = fadeOutT;
      if (offeringsEl) {
        const offeringsRect = offeringsEl.getBoundingClientRect();
        const midpoint = (rect.bottom + offeringsRect.top) / 2;
        const pathwayFadeStart =
          CELESTRA_PHILOSOPHY_FADE.pathwayFadeStartVh * vh;
        const pathwayFadeEnd = CELESTRA_PHILOSOPHY_FADE.pathwayFadeEndVh * vh;
        pathwayFadeOutT = clamp(
          (midpoint - pathwayFadeEnd) / (pathwayFadeStart - pathwayFadeEnd),
          0,
          1,
        );
      }
      // Smooth pathway fade (avoid double-easing which can look "steppy")
      const pathwayFadeOutSmooth = smoothstep01(pathwayFadeOutT);
      const opacityRaw = smoothstep01(fadeInT) * pathwayFadeOutSmooth;
      setPhilosophyBgOpacity(opacityRaw ** CELESTRA_PHILOSOPHY_FADE.curvePower);
      // Couple: no fade-in, only fade-out; full opacity (1) until fade-out zone
      const inFadeOutZone = rect.top < fadeOutStart;
      const coupleOpacityRaw =
        fadeInT > 0 ? (inFadeOutZone ? smoothstep01(fadeOutSmooth) : 1) : 0;
      setPhilosophyCoupleOpacity(
        coupleOpacityRaw ** CELESTRA_PHILOSOPHY_FADE.curvePower,
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="bg-black min-h-screen celestra-test-font"
      style={{ backgroundColor: "#000" }}
    >
      <HeroSection
        bgImage="/assets/generated/hero-celestra.dim_1920x1080.png"
        title={
          <>
            — Celéstra —
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
              Where Earth Meets the Extraordinary
            </span>
          </>
        }
        overlay="dark"
        fadeOnScroll
        baseColor="black"
        titleStyle={{
          WebkitTextStroke: "1.3px rgba(0, 0, 0, 0.8)",
          textShadow:
            "0 0 20px rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.6), 0 0 70px rgba(0,0,0,0.85)",
        }}
      />

      {/* Brand Introduction */}
      <section
        className="section-pad bg-black pt-12 sm:pt-16 md:pt-20 lg:pt-24"
        style={{ backgroundColor: "#000" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16 items-start">
            <div className="lg:col-span-7">
              <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
                The Premium Brand
              </p>
              <div className="gold-divider gold-divider-left animate-on-scroll delay-100" />
              <h2
                className="section-subheading animate-on-scroll delay-200 text-justify"
                style={{ marginBottom: "1.5rem" }}
              >
                A Celestial Expression of Refined Hospitality
              </h2>
              <div className="space-y-5 animate-on-scroll delay-300 text-justify">
                <p className="body-refined-lg text-ivory-muted/70">
                  In a world where travel experiences are often routine,
                  Celéstra was envisioned as something brighter — a celestial
                  expression of refined hospitality. The name Celéstra is
                  inspired by celestial, symbolizing light, elevation, and
                  effortless grace.
                </p>
                <p className="body-refined-lg text-ivory-muted/70">
                  As a 4-star hospitality brand, Celéstra blends comfort, style,
                  and sophistication to create experiences that feel both
                  uplifting and welcoming. Every Celéstra property is crafted to
                  reflect its surroundings while maintaining a distinctive
                  identity — whether overlooking serene coastlines, set within
                  vibrant cities, or located in emerging travel destinations.
                  Each hotel is designed to provide guests with a sense of calm,
                  balance, and modern luxury.
                </p>

                <p
                  className="font-display text-ivory/90 italic mt-3 text-justify"
                  style={{
                    fontFamily: "Instrument Serif, Georgia, serif",
                    fontWeight: 400,
                    fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
                    letterSpacing: "0.02em",
                    lineHeight: 1.5,
                  }}
                >
                  Celéstra by GHD Hotels — Where Comfort Meets Celestial
                  Elegance.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 lg:self-start lg:pt-12 animate-on-scroll-right delay-200">
              <div className="border border-gold/20 p-5 sm:p-8">
                <p className="eyebrow eyebrow--gold-emphasis mb-4 text-justify">
                  The Celéstra Promise
                </p>
                <ul className="space-y-3">
                  {[
                    "Elevated comfort — refined stays designed for modern travelers",
                    "Contemporary design — elegant spaces inspired by light and openness",
                    "Attentive service — warm, thoughtful hospitality that feels effortless",
                    "Local connection — experiences that reflect the spirit of each destination",
                    "Trusted excellence — consistent quality and comfort across every stay",
                  ].map((item) => {
                    const [label, ...rest] = item.split(" — ");
                    const restText = rest.join(" — ");
                    return (
                      <li key={item} className="flex items-start gap-3">
                        <span className="w-5 h-px bg-gold flex-shrink-0 mt-[0.65em]" />
                        <span
                          className="font-body text-base text-ivory-muted/70 min-w-0 flex-1 text-justify"
                          style={{
                            fontFamily:
                              "General Sans, Helvetica Neue, sans-serif",
                            fontWeight: 300,
                          }}
                        >
                          <strong className="text-ivory/90 font-semibold">
                            {label}
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

      {/* The Philosophy of Celéstra */}
      <section
        ref={philosophyRef}
        className="section-pad bg-black relative overflow-hidden"
        style={{ backgroundColor: "#000" }}
      >
        {/* Background image layer (use <img> so it always loads/paints reliably) */}
        <img
          src="/assets/generated/pathway.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            zIndex: 0,
            filter: "brightness(0.82) contrast(1.06) saturate(0.95)",
            transform: `translate3d(0, ${pathwayParallax}px, 0)`,
            willChange: "transform",
            opacity: philosophyBgOpacity,
          }}
        />
        {/* Dark overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: `rgba(0, 0, 0, ${CELESTRA_PHILOSOPHY_FADE.darkOverlayOpacity})`,
            zIndex: 1,
            opacity: philosophyBgOpacity,
          }}
          aria-hidden
        />
        {/* Foreground couple layer (over pathway, under text); reduced size + parallax */}
        <img
          src="/assets/generated/couple_walking.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none hidden lg:block"
          style={{
            zIndex: 6,
            objectPosition:
              CELESTRA_PHILOSOPHY_PARALLAX.couplePosition.objectPosition,
            transformOrigin: "center bottom",
            transform: `translate3d(${CELESTRA_PHILOSOPHY_PARALLAX.coupleOffsetPx.x - 200}px, ${coupleParallax + CELESTRA_PHILOSOPHY_PARALLAX.coupleOffsetPx.y + 200}px, 0) scale(${CELESTRA_PHILOSOPHY_PARALLAX.couplePosition.scale})`,
            willChange: "transform",
            opacity: philosophyCoupleOpacity,
          }}
        />
        <div
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-0 lg:px-8 lg:max-w-[54vw] lg:ml-0 lg:mr-auto transition-transform duration-700 ease-out"
          style={{
            transform: `translateY(${textParallax}px)`,
            willChange: "transform",
          }}
        >
          <div className="text-center mb-12 sm:mb-16">
            <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
              The Philosophy of Celéstra
            </p>
            <div className="gold-divider mx-auto animate-on-scroll delay-100" />
            <h2 className="section-heading animate-on-scroll delay-200">
              Designed for ease, crafted for memorable stays
            </h2>
          </div>
          <div className="space-y-6 animate-on-scroll delay-300 text-center max-w-3xl mx-auto">
            <p
              className="body-refined-lg text-ivory-muted/70"
              style={{ fontWeight: 700 }}
            >
              True hospitality is not displayed; it is experienced — felt
              quietly and remembered naturally. A hotel should never overwhelm
              the traveler, but instead welcome them with ease and intention.
            </p>
            <p
              className="body-refined-lg text-ivory-muted/70"
              style={{ fontWeight: 700 }}
            >
              At Celéstra, this belief shapes every detail, where balanced
              design, warm service, and a deep sense of place come together to
              create environments in which journeys slow down and moments become
              meaningful.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid (Celéstra Offerings) */}
      <section
        ref={offeringsRef}
        className="section-pad bg-black"
        style={{ backgroundColor: "#000" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-0">
          <div className="text-center mb-12 sm:mb-20">
            <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
              Celéstra Offerings
            </p>
            <div className="gold-divider animate-on-scroll delay-100" />
            <h2 className="section-heading animate-on-scroll delay-200">
              The Celéstra Experience
            </h2>
            <p className="body-refined-lg text-ivory-muted/70 mt-4 max-w-xl mx-auto animate-on-scroll delay-300">
              Every detail intentional. Every space a story.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="feature-item animate-on-scroll"
                  style={{ transitionDelay: `${0.05 + i * 0.08}s` }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div className="min-w-0 text-justify">
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
                      className="font-body text-sm text-ivory-muted/60 leading-relaxed"
                      style={{
                        fontFamily: "General Sans, Helvetica Neue, sans-serif",
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
      <section className="py-16 bg-black">
        <div className="max-w-3xl mx-auto text-center px-6">
          <div className="border border-gold/25 p-12 animate-on-scroll">
            <div className="gold-divider" />
            <h3
              className="font-display text-gold text-2xl mt-6 mb-4"
              style={{
                fontFamily: "Instrument Serif, Georgia, serif",
                fontWeight: 400,
              }}
            >
              Coming Soon
            </h3>
            <p
              className="font-body text-ivory-muted/65 text-base leading-relaxed mb-8"
              style={{
                fontFamily: "General Sans, Helvetica Neue, sans-serif",
                fontWeight: 300,
              }}
            >
              Celéstra properties are currently under development at carefully
              selected destinations. The finest experiences require the finest
              preparation.
            </p>
            <Link to="/contact" className="btn-gold text-sm">
              <span>Register Your Interest</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Cross Navigation */}
      <section className="py-16 bg-black border-t border-gold/10">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="eyebrow mb-8 animate-on-scroll">
            Explore Our Portfolio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll delay-200">
            <Link
              to="/samraya"
              className="btn-gold"
              data-ocid="celestra.samraya.button"
            >
              <span>Explore Samrāya</span>
            </Link>
            <Link
              to="/nivaara"
              className="btn-gold"
              data-ocid="celestra.nivaara.button"
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
