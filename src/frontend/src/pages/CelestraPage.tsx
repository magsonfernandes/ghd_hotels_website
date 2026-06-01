import { Link } from "@tanstack/react-router";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Dumbbell,
  Sparkles,
  TreePine,
  ToyBrick,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { ResponsiveImage } from "../components/ResponsiveImage";
import { CELESTRA_PROPERTY_PHOTOS } from "../lib/celestraPropertyPhotos";
import {
  CELESTRA_HERO_VIDEO,
  GALLERY_IMAGE_SIZES,
  HERO_IMAGE_SIZES,
  optimizeSrc,
} from "../lib/optimizedMedia";
import { heroImageTitleStyle } from "../lib/heroTitleStyle";
import { useScrollAnimationAll } from "../hooks/useScrollAnimation";

const features = [
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
    icon: Dumbbell,
    label: "Gymnasium",
    description:
      "A fully equipped gymnasium with professional-grade equipment for strength, cardio, and wellness routines.",
  },
  {
    icon: Sparkles,
    label: "Spa & Sauna",
    description:
      "Restorative spa treatments and sauna facilities designed for relaxation, renewal, and quiet indulgence.",
  },
  {
    icon: ToyBrick,
    label: "Kids Play Area",
    description:
      "A safe, engaging play zone where younger guests can explore, play, and unwind in a supervised setting.",
  },
  {
    icon: TreePine,
    label: "Event Spaces & Thematic Garden",
    description:
      "Flexible event venues paired with curated thematic gardens — ideal for celebrations, gatherings, and memorable occasions.",
  },
];

// ── Celéstra philosophy parallax tuning ─────────────────────────────
// Adjust these values to manually tweak position + parallax intensity.
const CELESTRA_PHILOSOPHY_PARALLAX = {
  pathway: {
    multiplier: 0.18,
    clampMin: -220,
    clampMax: 220,
  },
};

// ── Celéstra philosophy fade tuning ─────────────────────────────────
// Edit these values to change when and how fast the philosophy section fades.
const CELESTRA_PHILOSOPHY_FADE = {
  fadeInStartVh: 1.5,
  fadeInEndVh: 0.2,

  // Pathway fade-out: starts when you're halfway towards "Celéstra Offerings"
  pathwayFadeStartVh: 0.7, // start fading earlier (midpoint still clearly on-screen)
  pathwayFadeEndVh: -0.05, // fully faded shortly after midpoint passes top (reaches 0 reliably)

  curvePower: 1.3,
  darkOverlayOpacity: 0.18,
};

export function CelestraPage() {
  useScrollAnimationAll();
  const philosophyRef = useRef<HTMLElement | null>(null);
  const offeringsRef = useRef<HTMLElement | null>(null);
  const [pathwayParallax, setPathwayParallax] = useState(0);
  const [philosophyBgOpacity, setPhilosophyBgOpacity] = useState(0);
  const [propertiesImageIndex, setPropertiesImageIndex] = useState(0);
  const [propertiesPrevIndex, setPropertiesPrevIndex] = useState<number | null>(
    null,
  );
  const [propertiesCarouselPaused, setPropertiesCarouselPaused] = useState(false);
  const propertiesImageIndexRef = useRef(0);
  const propertiesPrevIndexRef = useRef<number | null>(null);
  const propertiesCrossfadeTimerRef = useRef<number | null>(null);

  const PROPERTIES_IMAGES = CELESTRA_PROPERTY_PHOTOS;
  const PROPERTIES_AUTO_ADVANCE_MS = 3000;
  const PROPERTIES_CROSSFADE_MS = 380;

  propertiesImageIndexRef.current = propertiesImageIndex;
  propertiesPrevIndexRef.current = propertiesPrevIndex;

  const goToPropertyPhoto = useCallback(
    (nextIndex: number) => {
      const total = PROPERTIES_IMAGES.length;
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
    document.title = "Celéstra by GHD – Premium Hospitality";
  }, []);

  useEffect(() => {
    if (propertiesCarouselPaused) return;
    const id = window.setInterval(() => {
      goToPropertyPhoto(propertiesImageIndexRef.current + 1);
    }, PROPERTIES_AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [
    propertiesCarouselPaused,
    PROPERTIES_AUTO_ADVANCE_MS,
    goToPropertyPhoto,
  ]);

  useEffect(() => {
    return () => {
      if (propertiesCrossfadeTimerRef.current) {
        window.clearTimeout(propertiesCrossfadeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const n = PROPERTIES_IMAGES.length;
    const next = (propertiesImageIndex + 1) % n;
    const prev = (propertiesImageIndex - 1 + n) % n;
    for (const i of [next, prev]) {
      const preload = new Image();
      preload.src = optimizeSrc(PROPERTIES_IMAGES[i].src);
    }
  }, [propertiesImageIndex, PROPERTIES_IMAGES]);

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

      // Smooth continuous parallax while entering/leaving the section
      const base = center - rect.top;
      setPathwayParallax(
        clamp(
          base * CELESTRA_PHILOSOPHY_PARALLAX.pathway.multiplier,
          CELESTRA_PHILOSOPHY_PARALLAX.pathway.clampMin,
          CELESTRA_PHILOSOPHY_PARALLAX.pathway.clampMax,
        ),
      );

      // Fade timing copied from Nivaãra pattern (with tunable constants)
      const fadeInT = clamp(
        (vh * CELESTRA_PHILOSOPHY_FADE.fadeInStartVh - rect.top) /
          (vh * 2 - vh * CELESTRA_PHILOSOPHY_FADE.fadeInEndVh),
        0,
        1,
      );
      // Pathway: start fading when halfway towards Celéstra Offerings
      const offeringsEl = offeringsRef.current;
      let pathwayFadeOutT = 1;
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
        bgVideo={CELESTRA_HERO_VIDEO.mp4}
        bgVideoWebm={CELESTRA_HERO_VIDEO.webm}
        bgVideoPoster={CELESTRA_HERO_VIDEO.poster}
        title={
          <>
            — Celéstra —
            <span
              className="hero-tagline block mt-6 sm:mt-8"
              style={{
                fontFamily:
                  '"Zapfino", "Snell Roundhand", "Apple Chancery", "Segoe Script", "Brush Script MT", cursive',
              }}
            >
              Where Earth Meets the Extraordinary
            </span>
          </>
        }
        overlay="dark"
        fadeOnScroll
        contentPlacement="below-center"
        baseColor="black"
        titleStyle={heroImageTitleStyle}
      />

      {/* Brand Introduction */}
      <section
        className="home-section-pad bg-black"
        style={{ backgroundColor: "#000" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
            <div className="lg:col-span-7">
              <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
                The Premium Brand
              </p>
              <div className="gold-divider gold-divider-left animate-on-scroll delay-100" />
              <h2
                className="section-lead animate-on-scroll delay-200 text-justify"
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

                <p className="section-quote text-ivory/90 mt-3 text-justify">
                  Celéstra by GHD Hotels — Where Comfort Meets Celestial
                  Elegance.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 lg:self-start animate-on-scroll-right delay-200">
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
                        <span className="body-refined text-ivory-muted/70 min-w-0 flex-1 text-justify">
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
        className="brand-philosophy-section bg-black relative overflow-hidden"
        style={{ backgroundColor: "#000" }}
      >
        {/* Background image layer (use <img> so it always loads/paints reliably) */}
        <ResponsiveImage
          src="/assets/generated/pathway.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center"
          sizes={HERO_IMAGE_SIZES}
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
        <div className="brand-philosophy-section__content relative z-10 flex w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
                The Philosophy of Celéstra
              </p>
              <div className="gold-divider mx-auto animate-on-scroll delay-100" />
              <h2 className="section-lead animate-on-scroll delay-200">
                Designed for ease, crafted for memorable stays
              </h2>
            </div>
            <div className="space-y-4 animate-on-scroll delay-300">
              <p className="body-refined-lg text-ivory-muted/70">
                True hospitality is not displayed; it is experienced — felt
                quietly and remembered naturally. A hotel should never overwhelm
                the traveler, but instead welcome them with ease and intention.
              </p>
              <p className="body-refined-lg text-ivory-muted/70">
                At Celéstra, this belief shapes every detail, where balanced
                design, warm service, and a deep sense of place come together to
                create environments in which journeys slow down and moments become
                meaningful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid (Celéstra Offerings) */}
      <section
        ref={offeringsRef}
        className="home-section-pad bg-black"
        style={{ backgroundColor: "#000" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-0">
          <div className="text-center mb-8 sm:mb-10">
            <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
              Celéstra Offerings
            </p>
            <div className="gold-divider animate-on-scroll delay-100" />
            <h2 className="section-lead animate-on-scroll delay-200">
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
                    <h3 className="pillar-title text-ivory mb-2">
                      {feature.label}
                    </h3>
                    <p className="body-refined text-ivory-muted/60">
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
          <div className="gold-divider mx-auto mb-8" />
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
                    <span className="text-ivory-muted/40 mx-2 sm:mx-3" aria-hidden>
                      ·
                    </span>
                    Celéstra Dodamarg
                  </span>
                  <p className="body-refined text-ivory-muted/65 mt-3 max-w-md">
                    A premium Celéstra destination nestled in the Western Ghats —
                    contemporary comfort amid serene mountain landscapes.
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
                        ]?.src ?? PROPERTIES_IMAGES[0].src
                      }
                      alt={
                        PROPERTIES_IMAGES[
                          propertiesPrevIndex ?? propertiesImageIndex
                        ]?.alt ?? PROPERTIES_IMAGES[0].alt
                      }
                      className="nivaara-property-carousel__slide"
                      sizes={GALLERY_IMAGE_SIZES}
                      draggable={false}
                    />
                    {propertiesPrevIndex !== null && (
                      <ResponsiveImage
                        key={propertiesImageIndex}
                        src={
                          PROPERTIES_IMAGES[propertiesImageIndex]?.src ??
                          PROPERTIES_IMAGES[0].src
                        }
                        alt={
                          PROPERTIES_IMAGES[propertiesImageIndex]?.alt ??
                          PROPERTIES_IMAGES[0].alt
                        }
                        className="nivaara-property-carousel__slide nivaara-property-carousel__slide--incoming"
                        sizes={GALLERY_IMAGE_SIZES}
                        priority
                        draggable={false}
                      />
                    )}
                  </div>

                  <div className="absolute inset-y-0 left-0 flex items-center px-3">
                    <button
                      type="button"
                      className="h-10 w-10 rounded-full bg-black/45 border border-white/10 text-ivory/90 flex items-center justify-center hover:bg-black/55 transition"
                      aria-label="Previous photo"
                      onClick={() =>
                        goToPropertyPhoto(propertiesImageIndex - 1)
                      }
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3">
                    <button
                      type="button"
                      className="h-10 w-10 rounded-full bg-black/45 border border-white/10 text-ivory/90 flex items-center justify-center hover:bg-black/55 transition"
                      aria-label="Next photo"
                      onClick={() =>
                        goToPropertyPhoto(propertiesImageIndex + 1)
                      }
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
                    {PROPERTIES_IMAGES.map((_, i) => (
                      <button
                        key={`celestra-prop-dot-${i}`}
                        type="button"
                        className={`h-2.5 w-2.5 rounded-full border border-white/25 transition ${
                          i === propertiesImageIndex
                            ? "bg-gold/90"
                            : "bg-white/15 hover:bg-white/25"
                        }`}
                        aria-label={`Show photo ${i + 1}`}
                        onClick={() => goToPropertyPhoto(i)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Cross Navigation */}
      <section className="py-10 sm:py-12 bg-black border-t border-gold/10">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="eyebrow mb-6 animate-on-scroll">
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
