import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { HomeSearchBar } from "../components/HomeSearchBar";
import { ResponsiveImage } from "../components/ResponsiveImage";
import { MediaBackground } from "../components/MediaBackground";
import {
  CARD_IMAGE_SIZES,
  HOME_HERO_VIDEO_DESKTOP,
} from "../lib/optimizedMedia";
import { useScrollAnimationAll } from "../hooks/useScrollAnimation";
import { CELESTRA_HERO_IMAGE } from "../lib/celestraPropertyPhotos";

const brands = [
  {
    id: "nivaara",
    to: "/nivaara",
    name: "Nivaãra",
    tagline: "by GHD",
    tier: "Smart Comfort Hotels",
    description:
      "At Nivaãra, rooms and suites are designed as personal sanctuaries — layered lighting, bespoke furnishings, calming palettes, and serene views. Whether overlooking skyline, water or landscape, each space invites you to exhale.",
    ocidCard: "brand.nivaara.card",
    ocidBtn: "brand.nivaara.button",
    accent: "#b8975a",
    image: "/assets/generated/hero-nivaara.dim_1920x1080.png",
  },
  // Swap Celéstra and Samrāya positioning and star tiers
  {
    id: "samraya",
    to: "/samraya",
    name: "Samrāya",
    tagline: "by GHD",
    tier: "Luxury Hotels",
    description:
      "At Samraya, hospitality is not a service—it is a tradition. Guests are welcomed with the reverence once reserved for royalty, where privacy is respected, comfort is intuitive, and every experience feels personal.",
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
    tier: "Premium Hotels",
    description:
      "Every Celéstra property is thoughtfully designed as a contemporary hospitality destination — blending modern architecture, intelligent amenities, and refined comfort to meet the needs of today's traveler.",
    ocidCard: "brand.celestra.card",
    ocidBtn: "brand.celestra.button",
    accent: "#b8975a",
    image: CELESTRA_HERO_IMAGE,
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

  const homeHeroVideo = HOME_HERO_VIDEO_DESKTOP;

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

  // Our Hotel Brands — interactive carousel state
  const [activeBrandIndex, setActiveBrandIndex] = useState(1); // index 1 is Samrāya after swap
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
        variant="home"
        baseColor="black"
        bgVideo={homeHeroVideo.mp4}
        bgVideoPoster={homeHeroVideo.poster}
        bgVideoWebm={homeHeroVideo.webm}
        overlay="medium"
        fadeOnScroll
        contentClassName="max-w-6xl"
        contentPlacement="lower"
        allowSearchOverflow
      >
        <div className="home-hero-search-in-video relative z-[60] hidden w-full text-left lg:block">
          <HomeSearchBar welcomeTitle="Welcome To GHD Hotels" />
        </div>
      </HeroSection>

      <section
        className="home-hero-search lg:hidden relative z-50 bg-black px-3 py-4 border-b border-gold/10"
        aria-label="Search availability"
      >
        <div className="max-w-6xl mx-auto w-full px-1">
          <HomeSearchBar welcomeTitle="Welcome To GHD Hotels" />
        </div>
      </section>

      {/* ── Philosophy ────────────────────────────────────────── */}
      <section
        id="philosophy"
        ref={philosophySectionRef}
        className="home-section-pad bg-black"
        style={{ marginTop: "-2px" }}
      >
        <div
          className="max-w-4xl mx-auto text-center px-2 sm:px-0"
          style={{ opacity: philosophySectionFade, willChange: "opacity" }}
        >
          <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
            The Philosophy
          </p>
          <div className="gold-divider animate-on-scroll delay-100" />
          <h2
            className="section-lead animate-on-scroll delay-200"
            style={{ marginBottom: "1.5rem" }}
          >
            To craft spaces where people feel valued, inspired, and at ease.
          </h2>
          <div className="space-y-5 animate-on-scroll delay-300 text-center max-w-3xl mx-auto">
            <p className="body-refined-lg">
              From the quiet comfort of <strong>Nivaãra</strong>, to the refined elegance of{" "}
              <strong>Celéstra</strong>, to the royal luxury of <strong>Samrāya</strong> — each brand reflects a
              different expression of the same philosophy.
            </p>
            <p className="body-refined-lg">
              We do not simply build hotels. We shape environments where stories
              unfold — business milestones, family celebrations, destination
              weddings, and quiet escapes.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gold/10 animate-on-scroll delay-400">
            <p className="section-quote text-gold/80">
              "Hospitality, at its finest, is not built in walls of marble or towers of glass. It is built in moments."
            </p>
          </div>
        </div>
      </section>

      {/* ── Brand Cards: circular carousel ─────────────────────────── */}
      <section
        id="brands"
        ref={brandsSectionRef}
        className="home-section-pad bg-black"
      >
        <div
          className="max-w-6xl mx-auto px-4 sm:px-0"
          style={{
            opacity: brandsSectionFade,
            pointerEvents: brandsSectionFade < 0.08 ? "none" : "auto",
            willChange: "opacity",
          }}
        >
          <div className="text-center mb-8 sm:mb-10">
            <p className="eyebrow eyebrow--gold-emphasis">Our Portfolio</p>
            <div className="gold-divider mx-auto" />
            <h2 className="section-lead">Our Hotel Brands</h2>
          </div>

          {/* Carousel viewport */}
          <div
            className="relative mt-2 sm:mt-4 h-[500px] sm:h-[540px] md:h-[580px] flex items-center justify-center"
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
                  className="glass-card group relative overflow-hidden flex flex-col w-[300px] sm:w-[340px] md:w-[380px] h-[500px] sm:h-[540px] md:h-[580px] rounded-2xl"
                  data-ocid={brand.ocidCard}
                >
                  <div className="relative h-1/2 min-h-0 shrink-0 overflow-hidden bg-charcoal">
                    <ResponsiveImage
                      src={brand.image}
                      alt={brand.name}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      sizes={CARD_IMAGE_SIZES}
                    />
                  </div>

                  <div className="flex h-1/2 min-h-0 flex-col p-4 sm:p-4 md:p-5 text-justify min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="pillar-title text-ivory text-justify min-w-0 flex-1">
                        {brand.name}
                      </h3>
                      <p
                        className="star-rating flex-shrink-0"
                        style={{
                          textShadow:
                            "0 0 10px rgba(184,151,90,0.8), 0 0 18px rgba(184,151,90,0.6)",
                        }}
                      >
                      {/* star rating intentionally removed */}
                      </p>
                    </div>
                    <p
                      className="font-body text-gold/70 uppercase mb-2"
                    style={{
                      fontFamily:
                        '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
                      fontSize: "0.65rem",
                      letterSpacing: "0.28em",
                    }}
                    >
                      {brand.tagline}
                    </p>
                    <p className="body-refined text-ivory/65 mb-2 flex-1 min-h-0 overflow-y-auto scrollbar-invisible">
                      {brand.description}
                    </p>

                    <Link
                      to={brand.to}
                      className="btn-gold mt-auto flex-shrink-0 !py-2 !min-h-0"
                      style={{ fontSize: "0.65rem", letterSpacing: "0.18em" }}
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
        </div>
      </section>

      {/* ── Vision Section ─────────────────────────────────────── */}
      <section
        ref={visionSectionRef}
        className="home-future-section home-section-pad parallax-section parallax-fixed relative overflow-hidden"
      >
        <MediaBackground
          src="/assets/generated/hero-future.dim_1920x1080.png"
          className="parallax-fixed"
        />
        {/* No vignette overlay (intentionally removed site-wide) */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(15,15,15,0.6) 0%, rgba(15,15,15,0.45) 50%, rgba(15,15,15,0.75) 100%)",
          }}
        />
        <div
          className="home-future-section__content relative z-10 w-full text-center"
          style={{ opacity: visionSectionFade, willChange: "opacity" }}
        >
          <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
            The Future
          </p>
          <div className="gold-divider animate-on-scroll delay-100" />
          <div className="space-y-4 animate-on-scroll delay-200 w-full mt-6">
            <p className="home-vision-statement mx-auto">
              GHD Hotels is developing a new generation of hotels that combine
              design excellence, operational efficiency, and guest-focused
              service. Our properties are currently under development across
              carefully selected destinations.
            </p>
          </div>
          <div className="mt-8 animate-on-scroll delay-400">
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
