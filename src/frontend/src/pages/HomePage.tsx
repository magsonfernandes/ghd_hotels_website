import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { useScrollAnimationAll } from "../hooks/useScrollAnimation";

const brands = [
  {
    id: "nivaara",
    to: "/nivaara",
    name: "Nivaãra",
    tagline: "by GHD",
    stars: "★★★",
    tier: "3★ Smart Comfort Hotels",
    description:
      "At Nivaãra, rooms and suites are designed as personal sanctuaries — layered lighting, bespoke furnishings, calming palettes, and views that restore perspective. Whether overlooking skyline, water, or landscape, each space invites you to exhale.",
    ocidCard: "brand.nivaara.card",
    ocidBtn: "brand.nivaara.button",
    accent: "#a89070",
    image: "/assets/generated/hero-nivaara.dim_1920x1080.png",
  },
  // Swap Celéstra and Samrāya positioning and star tiers
  {
    id: "samraya",
    to: "/samraya",
    name: "Samrāya",
    tagline: "by GHD",
    stars: "★★★★★",
    tier: "5★ Luxury Hotels",
    description:
      "At Samraya, hospitality is not a service—it is a tradition. Guests are welcomed with the reverence once reserved for royalty, where privacy is respected, comfort is intuitive, and every experience feels personal. Whether it is a serene stay in our premium rooms, an indulgent culinary journey, or a celebration hosted in our grand banquets, Samraya transforms moments into lasting memories.",
    ocidCard: "brand.samraya.card",
    ocidBtn: "brand.samraya.button",
    accent: "#b8975a",
    image: "/assets/generated/hero-samraya.dim_1920x1080.png",
  },
  {
    id: "celestra",
    to: "/celestra",
    name: "Celéstra",
    tagline: "by GHD",
    stars: "★★★★",
    tier: "4★ Premium Hotels",
    description:
      "Every Celéstra property is thoughtfully designed as a contemporary hospitality destination — blending modern architecture, intelligent amenities, and refined comfort to meet the needs of today's traveler. With well-appointed spaces for leisure, business, and social gatherings, Celéstra aims to become a preferred destination for vacations, meetings, and everyday stays — where comfort, convenience, and modern hospitality come together seamlessly.",
    ocidCard: "brand.celestra.card",
    ocidBtn: "brand.celestra.button",
    accent: "#c9a84c",
    image: "/assets/generated/hero-celestra.dim_1920x1080.png",
  },
];

// Shared section fade-in/out timing for Home page sections.
const HOME_SECTION_FADE = {
  fadeInStartVh: 0.9,
  fadeInEndVh: 0.1,
  fadeOutStartVh: 0,
  fadeOutEndVh: -1.2,
};

export function HomePage() {
  useScrollAnimationAll();

  useEffect(() => {
    document.title = "GHD Hotels – Crafted Experiences. Defined Excellence";
  }, []);

  const philosophySectionRef = useRef<HTMLElement | null>(null);
  const brandsSectionRef = useRef<HTMLElement | null>(null);
  const visionSectionRef = useRef<HTMLElement | null>(null);
  const [philosophySectionFade, setPhilosophySectionFade] = useState(0);
  const [brandsSectionFade, setBrandsSectionFade] = useState(0);
  const [visionSectionFade, setVisionSectionFade] = useState(0);

  useEffect(() => {
    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));
    const smoothstep01 = (t: number) => t * t * (3 - 2 * t);
    const getSectionFade = (el: HTMLElement, vh: number) => {
      const rect = el.getBoundingClientRect();
      const fadeInStartPx = vh * HOME_SECTION_FADE.fadeInStartVh;
      const fadeInEndPx = vh * HOME_SECTION_FADE.fadeInEndVh;
      const fadeInT = clamp(
        (fadeInStartPx - rect.top) / (fadeInStartPx - fadeInEndPx),
        0,
        1,
      );

      const fadeOutStartPx = vh * HOME_SECTION_FADE.fadeOutStartVh;
      const fadeOutEndPx = vh * HOME_SECTION_FADE.fadeOutEndVh;
      const fadeOutT = clamp(
        (rect.bottom - fadeOutEndPx) / (fadeOutStartPx - fadeOutEndPx),
        0,
        1,
      );

      return smoothstep01(fadeInT) * smoothstep01(fadeOutT);
    };

    const onScroll = () => {
      const vh = window.innerHeight;
      if (philosophySectionRef.current) {
        setPhilosophySectionFade(getSectionFade(philosophySectionRef.current, vh));
      }
      if (brandsSectionRef.current) {
        setBrandsSectionFade(getSectionFade(brandsSectionRef.current, vh));
      }
      if (visionSectionRef.current) {
        setVisionSectionFade(getSectionFade(visionSectionRef.current, vh));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Our Hotel Brands — interactive carousel state
  const [activeBrandIndex, setActiveBrandIndex] = useState(1); // index 1 is Samrāya (5★) after swap
  const [brandsCarouselPaused, setBrandsCarouselPaused] = useState(false);

  const BRANDS_AUTO_ADVANCE_MS = 3500;

  // Auto-advance carousel; pause while pointer is over or focus is inside the viewport
  useEffect(() => {
    if (brandsCarouselPaused) return;
    const t = window.setTimeout(() => {
      setActiveBrandIndex((prev) => (prev + 1) % brands.length);
    }, BRANDS_AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [activeBrandIndex, brandsCarouselPaused]);

  // Throttle wheel-based carousel navigation so it feels intentional
  const lastWheelTimeRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);

  const handleBrandWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 600) {
      return;
    }

    const primaryDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    if (Math.abs(primaryDelta) < 10) return;

    lastWheelTimeRef.current = now;

    setActiveBrandIndex((prev) => {
      const total = brands.length;
      if (primaryDelta > 0) {
        // scroll down / right → next card
        return (prev + 1) % total;
      }
      // scroll up / left → previous card
      return (prev - 1 + total) % total;
    });
  };

  const handleBrandTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length > 0) {
      touchStartXRef.current = event.touches[0].clientX;
    }
  };

  const handleBrandTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    if (startX == null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;
    touchStartXRef.current = null;

    // Lower threshold so light swipes still register
    if (Math.abs(deltaX) < 10) return;

    setActiveBrandIndex((prev) => {
      const total = brands.length;
      if (deltaX < 0) {
        // swipe left → next card
        return (prev + 1) % total;
      }
      // swipe right → previous card
      return (prev - 1 + total) % total;
    });
  };

  const getBrandPositionStyles = (index: number) => {
    const total = brands.length;
    const offset = (index - activeBrandIndex + total) % total;

    // Base styles shared by all cards
    const base: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transformOrigin: "center center",
      transition:
        "transform 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms ease, filter 700ms ease",
      cursor: "pointer",
    };

    if (offset === 0) {
      // Center (active) card
      return {
        ...base,
        transform: "translate(-50%, -50%) scale(1)",
        opacity: 1,
        zIndex: 30,
        filter: "none",
      };
    }

    if (offset === 1) {
      // Right card – tilt outwards (no blur so image stays sharp)
      return {
        ...base,
        transform: "translate(30%, -50%) scale(0.8) rotateY(30deg)",
        opacity: 0.45,
        zIndex: 20,
        filter: "none",
      };
    }

    // Left card (offset === 2) – tilt outwards (no blur so image stays sharp)
    return {
      ...base,
      transform: "translate(-130%, -50%) scale(0.8) rotateY(-30deg)",
      opacity: 0.45,
      zIndex: 20,
      filter: "none",
    };
  };

  return (
    <div className="bg-charcoal min-h-screen home-test-font">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <HeroSection
        bgImage="/assets/generated/hero-home.dim_1920x1080.png"
        title={
          <>
            Crafted Experiences.
            <br />
            Defined Excellence.
          </>
        }
        overlay="medium"
        titleClass="max-w-4xl mx-auto"
        titleStyle={{
          fontSize: "clamp(2.45rem, 5.8vw, 5.25rem)",
          fontWeight: 100,
          WebkitTextStroke: "1.3px rgba(0, 0, 0, 0.8)",
          textShadow:
            "0 0 20px rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.6), 0 0 70px rgba(0,0,0,0.85)",
        }}
        bottomNote={
          <p
            className="conceptual-disclaimer font-body text-left text-[0.58rem] sm:text-[0.64rem] md:text-[0.7rem]"
            style={{
              fontFamily:
                '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
              letterSpacing: "0.03em",
              lineHeight: 1.35,
            }}
          >
            Images are conceptual and may differ from final development.
          </p>
        }
        fadeOnScroll
      >
        <div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => scrollTo("philosophy")}
              className="btn-gold"
              data-ocid="hero.philosophy.button"
            >
              <span>Explore Our Philosophy</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTo("brands")}
              className="btn-gold-filled"
              data-ocid="hero.brands.button"
            >
              Discover Our Brands
            </button>
          </div>
        </div>
      </HeroSection>

      {/* ── Philosophy ────────────────────────────────────────── */}
      <section
        id="philosophy"
        ref={philosophySectionRef}
        className="snap-section section-pad bg-charcoal-mid min-h-screen flex flex-col justify-center pt-12 sm:pt-16 md:pt-20 lg:pt-24"
        style={{ marginTop: "-2px" }}
      >
        <div
          className="max-w-4xl mx-auto text-center px-2 sm:px-0 mt-12"
          style={{ opacity: philosophySectionFade, willChange: "opacity" }}
        >
          <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
            The Philosophy
          </p>
          <div className="gold-divider animate-on-scroll delay-100" />
          <h2
            className="font-display text-ivory animate-on-scroll delay-200"
            style={{
              fontFamily: "Instrument Serif, Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(2.5rem, 5vw, 5rem)",
              lineHeight: 1.08,
              letterSpacing: "0.03em",
              marginBottom: "3rem",
            }}
          >
            To craft spaces where people feel valued, inspired, and at ease.
          </h2>
          <div className="space-y-7 animate-on-scroll delay-300 text-center max-w-3xl mx-auto">
            <p
              className="font-body text-ivory/65 leading-loose"
              style={{
                fontFamily:
                  '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 300,
                fontSize: "1.3rem",
                lineHeight: 1.9,
              }}
            >
              From the quiet comfort of <strong>Nivaãra</strong>, to the refined elegance of{" "}
              <strong>Samrāya</strong>, to the iconic luxury of <strong>Celéstra</strong> — each brand reflects a
              different expression of the same philosophy.
            </p>
            <p
              className="font-body text-ivory/65 leading-loose"
              style={{
                fontFamily:
                  '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 300,
                fontSize: "1.3rem",
                lineHeight: 1.9,
              }}
            >
              We do not simply build hotels. We shape environments where stories
              unfold — business milestones, family celebrations, destination
              weddings, and quiet escapes.
            </p>
          </div>

          <div className="mt-16 pt-12 border-t border-gold/10 animate-on-scroll delay-400">
            <p
              className="font-display text-gold/80 italic"
              style={{
                fontFamily: "Instrument Serif, Georgia, serif",
                fontSize: "clamp(1.2rem, 2.5vw, 1.75rem)",
                lineHeight: 1.5,
                letterSpacing: "0.02em",
              }}
            >
              "Hospitality, at its finest, is not built in walls of marble or towers of glass. It is built in moments."
            </p>
          </div>
        </div>
      </section>

      {/* ── Brand Cards: circular carousel ─────────────────────────── */}
      <section
        id="brands"
        ref={brandsSectionRef}
        className="section-pad bg-charcoal"
      >
        <div
          className="max-w-6xl mx-auto px-4 sm:px-0"
          style={{
            opacity: brandsSectionFade,
            pointerEvents: brandsSectionFade < 0.08 ? "none" : "auto",
            willChange: "opacity",
          }}
        >
          <div className="text-center mb-14 sm:mb-20">
            <p className="eyebrow eyebrow--gold-emphasis">Our Portfolio</p>
            <div className="gold-divider mx-auto" />
            <h2
              className="font-display text-ivory"
              style={{
                fontFamily: "Instrument Serif, Georgia, serif",
                fontWeight: 400,
                fontSize: "clamp(2.5rem, 5vw, 5rem)",
                lineHeight: 1.08,
                letterSpacing: "0.03em",
              }}
            >
              Our Hotel Brands
            </h2>
          </div>

          {/* Carousel viewport */}
          <div
            className="relative mt-6 sm:mt-8 h-[580px] sm:h-[640px] md:h-[720px] flex items-center justify-center"
            style={{ perspective: "1600px" }}
            onWheel={handleBrandWheel}
            onTouchStart={handleBrandTouchStart}
            onTouchEnd={handleBrandTouchEnd}
            onMouseEnter={() => setBrandsCarouselPaused(true)}
            onMouseLeave={() => setBrandsCarouselPaused(false)}
            onFocusCapture={() => setBrandsCarouselPaused(true)}
            onBlurCapture={(e) => {
              const next = e.relatedTarget as Node | null;
              if (!next || !e.currentTarget.contains(next)) {
                setBrandsCarouselPaused(false);
              }
            }}
          >
            {brands.map((brand, i) => (
              <div
                key={brand.id}
                role="button"
                tabIndex={0}
                aria-label={`Show ${brand.name} details`}
                onClick={() => setActiveBrandIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveBrandIndex(i);
                  }
                }}
                style={getBrandPositionStyles(i)}
              >
                <div
                  className="glass-card group relative overflow-hidden flex flex-col w-[400px] sm:w-[460px] md:w-[520px] h-[540px] sm:h-[600px] md:h-[680px] rounded-3xl"
                  data-ocid={brand.ocidCard}
                >
                  <div className="relative h-56 sm:h-64 md:h-80 flex-shrink-0 overflow-hidden bg-charcoal">
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5 sm:p-6 md:p-7 pt-6 flex-1 flex flex-col min-h-0 text-justify min-w-0">
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <h3
                        className="font-display text-ivory text-justify min-w-0 flex-1"
                        style={{
                          fontFamily: "Instrument Serif, Georgia, serif",
                          fontWeight: 400,
                          fontSize: "clamp(1.4rem, 2vw, 1.8rem)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {brand.name}
                      </h3>
                      <p
                        className="star-rating flex-shrink-0"
                        style={{
                          textShadow:
                            "0 0 10px rgba(201,168,76,0.8), 0 0 18px rgba(201,168,76,0.6)",
                        }}
                      >
                        {brand.stars}
                      </p>
                    </div>
                    <p
                      className="font-body text-gold/70 uppercase mb-3"
                    style={{
                      fontFamily:
                        '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
                      fontSize: "0.7rem",
                      letterSpacing: "0.32em",
                    }}
                    >
                      {brand.tagline}
                    </p>
                    <p
                      className="font-body text-ivory leading-loose mb-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pr-1"
                      style={{
                        fontFamily:
                          '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
                        fontWeight: 300,
                        fontSize: "0.95rem",
                        lineHeight: 1.85,
                      }}
                    >
                      {brand.description}
                    </p>

                    <Link
                      to={brand.to}
                      className="btn-gold mt-auto flex-shrink-0"
                      style={{ fontSize: "0.7rem", letterSpacing: "0.2em" }}
                      data-ocid={brand.ocidBtn}
                      onClick={(e) => {
                        // Only allow navigation directly from the centered card
                        if (i !== activeBrandIndex) {
                          e.preventDefault();
                          setActiveBrandIndex(i);
                        }
                      }}
                    >
                      <span>Explore {brand.name}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p
            className="conceptual-disclaimer font-body text-left text-[0.58rem] sm:text-[0.64rem] md:text-[0.7rem] mt-12"
            style={{
              fontFamily:
                '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
              letterSpacing: "0.03em",
              lineHeight: 1.35,
            }}
          >
            Images are conceptual and may differ from final development.
          </p>
        </div>
      </section>

      {/* ── Vision Section ─────────────────────────────────────── */}
      <section
        ref={visionSectionRef}
        className="snap-section section-pad parallax-section parallax-fixed relative min-h-screen flex flex-col justify-center"
        style={{
          backgroundImage:
            "url(/assets/generated/hero-future.dim_1920x1080.png)",
        }}
      >
        {/* No vignette overlay (intentionally removed site-wide) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(15,15,15,0.6) 0%, rgba(15,15,15,0.45) 50%, rgba(15,15,15,0.75) 100%)",
          }}
        />
        <div
          className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-0"
          style={{ opacity: visionSectionFade, willChange: "opacity" }}
        >
          <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
            The Future
          </p>
          <div className="gold-divider animate-on-scroll delay-100" />
          <h2
            className="font-display text-ivory animate-on-scroll delay-200"
            style={{
              fontFamily: "Instrument Serif, Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(2.5rem, 5vw, 5rem)",
              lineHeight: 1.08,
              letterSpacing: "0.03em",
              marginBottom: "2.5rem",
              // Match hero title (“Crafted Experiences…”): stroke + glow
              WebkitTextStroke: "1.3px rgba(0, 0, 0, 0.8)",
              textShadow:
                "0 0 20px rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.6), 0 0 70px rgba(0,0,0,0.85)",
            }}
          >
            Building the Future of Hospitality
          </h2>
          <div className="space-y-6 animate-on-scroll delay-300">
            <p
              className="font-body text-ivory/65 leading-loose"
              style={{
                fontFamily:
                  '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 400,
                fontSize: "1.3rem",
                lineHeight: 1.9,
              }}
            >
              GHD Hotels is developing a new generation of hotels that combine
              design excellence, operational efficiency, and guest-focused
              service. Our properties are currently under development across
              carefully selected destinations.
            </p>
          </div>
          <div className="mt-14 animate-on-scroll delay-400">
            <Link to="/vision" className="btn-gold">
              <span>Discover Our Vision</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
