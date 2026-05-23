import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock, Laptop, Moon, Tv2, Utensils, Wifi } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { heroImageTitleStyle } from "../lib/heroTitleStyle";
import { NIVAARA_PROPERTY_PHOTOS } from "../lib/nivaaraPropertyPhotos";
import { useScrollAnimationAll } from "../hooks/useScrollAnimation";

const features = [
  {
    icon: Tv2,
    label: "Smart Rooms",
    description:
      "Technology-integrated rooms with smart controls for lighting, temperature, and entertainment.",
  },
  {
    icon: Wifi,
    label: "High Speed WiFi",
    description:
      "High-bandwidth connectivity throughout the property ensuring seamless work and leisure experiences.",
  },
  {
    icon: Moon,
    label: "Comfortable Bedding",
    description:
      "Premium quality bedding with carefully selected mattresses ensuring a restful, restorative sleep.",
  },
  {
    icon: Utensils,
    label: "Compact Dining",
    description:
      "Efficient all-day dining with wholesome, quality meals and a curated selection of beverages.",
  },
  {
    icon: Laptop,
    label: "Business Friendly Facilities",
    description:
      "Dedicated work areas, printing facilities, and meeting spaces for business travelers.",
  },
  {
    icon: Clock,
    label: "24 Hour Reception",
    description:
      "Round-the-clock front desk service ensuring assistance and support at every hour.",
  },
];

export function NivaaraPage() {
  useScrollAnimationAll();
  const philosophyRef = useRef<HTMLElement | null>(null);
  const [philosophyParallax, setPhilosophyParallax] = useState(0);
  const [philosophyBgOpacity, setPhilosophyBgOpacity] = useState(0);
  const [propertiesImageIndex, setPropertiesImageIndex] = useState(0);
  const [propertiesPrevIndex, setPropertiesPrevIndex] = useState<number | null>(
    null,
  );
  const [propertiesCarouselPaused, setPropertiesCarouselPaused] = useState(false);
  const propertiesImageIndexRef = useRef(0);
  const propertiesPrevIndexRef = useRef<number | null>(null);
  const propertiesCrossfadeTimerRef = useRef<number | null>(null);

  const PROPERTIES_IMAGES = NIVAARA_PROPERTY_PHOTOS;
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

  // Smooth opacity fade for Buddha background when entering/leaving Philosophy.
  // Uses rect.top/rect.bottom so it naturally fades as the section transitions into/out of view.
  const NIVAA_PHILOSOPHY_FADE = {
    fadeInStartVh: 0.9,
    fadeInEndVh: 0.1,
    fadeOutStartVh: 0.8,
    fadeOutEndVh: 0.3,
  };

  useEffect(() => {
    document.title = "Nivaãra by GHD – Smart Comfort";
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
    const onScroll = () => {
      const el = philosophyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = vh * 0.5;
      const clamp = (v: number, min: number, max: number) =>
        Math.max(min, Math.min(max, v));
      const smoothstep01 = (t: number) => t * t * (3 - 2 * t);

      // Buddha background: subtle scroll parallax
      const offset = (center - rect.top) * 0.2;
      setPhilosophyParallax(clamp(offset, -70, 100));

      // Fade timing: fade in when entering the section, fade out as the section scrolls away
      // (into the next content area). No transform/parallax changes here.
      const fadeInStartPx = vh * NIVAA_PHILOSOPHY_FADE.fadeInStartVh;
      const fadeInEndPx = vh * NIVAA_PHILOSOPHY_FADE.fadeInEndVh;
      const fadeInT = clamp(
        (fadeInStartPx - rect.top) / (fadeInStartPx - fadeInEndPx),
        0,
        1,
      );

      const fadeOutStartPx = vh * NIVAA_PHILOSOPHY_FADE.fadeOutStartVh;
      const fadeOutEndPx = vh * NIVAA_PHILOSOPHY_FADE.fadeOutEndVh;
      const fadeOutT = clamp(
        (rect.bottom - fadeOutEndPx) / (fadeOutStartPx - fadeOutEndPx),
        0,
        1,
      );

      const opacity = smoothstep01(fadeInT) * smoothstep01(fadeOutT);
      setPhilosophyBgOpacity(opacity);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-charcoal min-h-screen nivaara-test-font">
      <HeroSection
        bgImage="/assets/generated/hero-nivaara.dim_1920x1080.png"
        title={
          <>
            — Nivaãra —
            <span
              className="hero-tagline block mt-6 sm:mt-8"
              style={{
                fontFamily:
                  '"Zapfino", "Snell Roundhand", "Apple Chancery", "Segoe Script", "Brush Script MT", cursive',
              }}
            >
              Luxury in Motion
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
      <section className="home-section-pad bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            <div className="lg:col-span-7">
              <p
                className="eyebrow eyebrow--gold-emphasis animate-on-scroll"
                style={{ color: "#b8975a" }}
              >
                The Smart Comfort Brand
              </p>
              <div
                className="gold-divider gold-divider-left animate-on-scroll delay-100"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #b8975a, transparent)",
                }}
              />
              <h2
                className="section-lead animate-on-scroll delay-200 text-justify"
                style={{ marginBottom: "1.5rem" }}
              >
                Where Urban Energy Finds Balance
              </h2>
              <div className="space-y-5 animate-on-scroll delay-300 text-justify">
                <p className="body-refined-lg text-ivory-muted/70">
                  In the rhythm of modern cities, time moves quickly. Meetings
                  begin early. Flights depart late. Opportunities appear without
                  warning. Nivaãra was created for those who live within this
                  momentum.
                </p>
                <p className="body-refined-lg text-ivory-muted/70">
                  Derived from the idea of shelter and restoration, Nivaãra
                  offers travelers a place where the energy of the city meets
                  the comfort of thoughtful hospitality. It is not a retreat
                  away from movement—it is a sanctuary designed to support it.
                </p>
                <p className="body-refined-lg text-ivory-muted/70">
                  Every stay at Nivaãra is intentionally calm and quietly
                  serene. From muted palettes to gentle lighting and
                  acoustically softened rooms, the experience feels
                  peaceful—even when the city outside is moving fast.
                </p>
                <p className="section-quote text-ivory/90 text-justify" style={{ marginTop: "0.75rem" }}>
                  Nivaãra by GHD Hotels — Quick comfort. Refined living.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 lg:self-start animate-on-scroll-right delay-200">
              <div className="border border-gold/20 p-5 sm:p-8">
                <p className="eyebrow eyebrow--gold-emphasis mb-4 text-justify">
                  The Nivaãra Promise
                </p>
                <ul className="space-y-3">
                  {[
                    "Smart comfort — rooms that balance efficiency with modern elegance",
                    "Seamless connectivity — reliable high-speed internet for effortless connectivity",
                    "Effortless arrival — smooth, efficient check-in and check-out",
                    "Honest dining — quality food crafted with care, offered at fair prices",
                    "Urban access — well-located hotels close to city’s business and movement",
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

      {/* The Philosophy of Nivaãra */}
      <section
        ref={philosophyRef}
        className="nivaara-philosophy-section bg-black relative"
      >
        {/* Background image – Buddha, softened behind content */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-65 transition-opacity duration-900 ease-out"
          style={{
            backgroundImage: 'url("/assets/generated/buddha.png")',
            transform: `translateY(${-philosophyParallax}px)`,
            opacity: philosophyBgOpacity,
            filter: "brightness(0.5)",
            // Soften edges so the image blends into the black base.
            WebkitMaskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 100%)",
            maskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 100%)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "cover",
            maskSize: "cover",
          }}
          aria-hidden
        />
        <div
          className="nivaara-philosophy-section__content relative z-10 flex w-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center transition-opacity duration-700 ease-out"
          style={{
            opacity: philosophyBgOpacity,
            willChange: "opacity",
          }}
        >
          <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <p
                className="eyebrow eyebrow--gold-emphasis animate-on-scroll"
                style={{ color: "#b8975a" }}
              >
                The Philosophy of Nivaãra
              </p>
              <div
                className="gold-divider mx-auto animate-on-scroll delay-100"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #b8975a, transparent)",
                }}
              />
              <h2 className="section-lead animate-on-scroll delay-200">
                Calm in the Heart of Motion
              </h2>
            </div>

            <div className="space-y-4 animate-on-scroll delay-300">
              <p className="body-refined-lg text-ivory-muted/70">
                At Nivaãra by GHD Hotels, our philosophy is built around the
                understanding that modern travel moves at an accelerated pace.
                Cities are dynamic, journeys are purposeful, and time has become
                one of the most valuable resources for today’s traveler.
              </p>
              <p className="body-refined-lg text-ivory-muted/70">
                Nivaãra was created to respond to this rhythm.
              </p>
              <p className="body-refined-lg text-ivory-muted/70">
                Rather than slowing the world down, we design our hospitality to
                move with it—offering spaces where comfort, efficiency, and
                thoughtful design come together to support the traveler’s journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="home-section-pad bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-0">
          <div className="text-center mb-8 sm:mb-10">
            <p
              className="eyebrow eyebrow--gold-emphasis animate-on-scroll"
              style={{ color: "#b8975a" }}
            >
              Nivaãra Offerings
            </p>
            <div
              className="gold-divider animate-on-scroll delay-100"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #b8975a, transparent)",
              }}
            />
            <h2 className="section-lead animate-on-scroll delay-200">
              The Nivaãra Experience
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="feature-item animate-on-scroll"
                  style={{
                    transitionDelay: `${0.05 + i * 0.1}s`,
                    borderColor: "rgba(168, 144, 112, 0.12)",
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon size={18} style={{ color: "#b8975a" }} />
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
          <div
            className="gold-divider mx-auto mb-8"
            style={{
              background:
                "linear-gradient(90deg, transparent, #b8975a, transparent)",
            }}
          />
          <ul className="text-left mx-auto space-y-4">
            <li
              className="font-body text-ivory/90 border border-gold/15 rounded-2xl px-6 py-6 sm:px-8 sm:py-8 w-full bg-black/30"
              style={{
                fontFamily: "General Sans, Helvetica Neue, sans-serif",
              }}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-8">
                <div className="min-w-0 shrink-0 text-left lg:flex lg:flex-col lg:justify-center">
                  <span className="font-display text-gold-light text-2xl block">
                    Nivaara - Nerul
                  </span>
                </div>

                <div
                  className="w-full min-w-0 flex-1 self-stretch rounded-2xl border border-gold/20 bg-black/40 px-4 py-4 sm:px-5 sm:py-5 text-left"
                  role="group"
                  aria-label="Nivaara - Nerul contact details"
                >
                  <div className="space-y-2.5 text-sm text-ivory/85 leading-relaxed">
                    <p>
                      <span className="text-ivory-muted/70">Reception :</span>{" "}
                      <a
                        href="tel:+918390020408"
                        className="text-ivory hover:text-gold transition-colors"
                      >
                        +91 8390020408
                      </a>
                    </p>
                    <p>
                      <span className="text-ivory-muted/70">Reception Email :</span>{" "}
                      <a
                        href="mailto:info.nerul@ghdhotels.in"
                        className="text-ivory hover:text-gold transition-colors break-all"
                      >
                        info.nerul@ghdhotels.in
                      </a>
                    </p>
                    <p className="text-ivory-muted/80">
                      <span className="text-ivory-muted/70">Address :</span>{" "}
                      Survey No. 98, Nerul, North Goa – 403114
                    </p>
                  </div>
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
                    <img
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
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                    {propertiesPrevIndex !== null && (
                      <img
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
                        loading="eager"
                        decoding="async"
                        draggable={false}
                      />
                    )}
                  </div>

                  {/* Left / right arrows */}
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

                  {/* Dots */}
                  <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
                    {PROPERTIES_IMAGES.map((_, i) => (
                      <button
                        key={`prop-dot-${i}`}
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
              to="/celestra"
              className="btn-gold"
              data-ocid="nivaara.celestra.button"
            >
              <span>Explore Celéstra</span>
            </Link>
            <Link
              to="/samraya"
              className="btn-gold"
              data-ocid="nivaara.samraya.button"
            >
              <span>Explore Samrāya</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
