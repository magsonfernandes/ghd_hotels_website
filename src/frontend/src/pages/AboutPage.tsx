import { useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { useScrollAnimationAll } from "../hooks/useScrollAnimation";

const values = [
  {
    number: "01",
    title: "Design Excellence",
    description:
      "Every GHD property is conceived by world-class architects and interior designers, ensuring that each hotel is a work of art in its own right — a destination, not merely a place to stay.",
  },
  {
    number: "02",
    title: "Service Philosophy",
    description:
      "Our service culture is built on anticipation. We believe the finest hospitality is felt before it is requested — in the details noticed, the needs predicted, and the moments made extraordinary.",
  },
  {
    number: "03",
    title: "Culinary Vision",
    description:
      "GHD Hotels places extraordinary emphasis on dining as an integral part of the guest experience. Each restaurant is curated with the same care as the accommodation itself.",
  },
  {
    number: "04",
    title: "Global Standards",
    description:
      "Regardless of brand tier, every GHD property adheres to uncompromising quality benchmarks. International travelers can expect the same dedication to excellence across all our categories.",
  },
];

const ABOUT_COUPLE_HERO_IMAGE =
  "/assets/generated/lady%20by%20the%20pool.png";

const ABOUT_SECTION_FADE = {
  fadeInStartVh: 0.9,
  fadeInEndVh: 0.1,
  fadeOutStartVh: 0,
  fadeOutEndVh: -1.2,
};

export function AboutPage() {
  useScrollAnimationAll();
  const missionRef = useRef<HTMLElement | null>(null);
  const valuesRef = useRef<HTMLElement | null>(null);
  const quoteRef = useRef<HTMLElement | null>(null);
  const [missionFade, setMissionFade] = useState(0);
  const [valuesFade, setValuesFade] = useState(0);
  const [quoteFade, setQuoteFade] = useState(0);

  useEffect(() => {
    document.title = "About GHD Hotels – Our Philosophy & Vision";
  }, []);

  useEffect(() => {
    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));
    const smoothstep01 = (t: number) => t * t * (3 - 2 * t);
    const getSectionFade = (el: HTMLElement, vh: number) => {
      const rect = el.getBoundingClientRect();
      const fadeInStartPx = vh * ABOUT_SECTION_FADE.fadeInStartVh;
      const fadeInEndPx = vh * ABOUT_SECTION_FADE.fadeInEndVh;
      const fadeInT = clamp(
        (fadeInStartPx - rect.top) / (fadeInStartPx - fadeInEndPx),
        0,
        1,
      );
      const fadeOutStartPx = vh * ABOUT_SECTION_FADE.fadeOutStartVh;
      const fadeOutEndPx = vh * ABOUT_SECTION_FADE.fadeOutEndVh;
      const fadeOutT = clamp(
        (rect.bottom - fadeOutEndPx) / (fadeOutStartPx - fadeOutEndPx),
        0,
        1,
      );
      return smoothstep01(fadeInT) * smoothstep01(fadeOutT);
    };

    const onScroll = () => {
      const vh = window.innerHeight;
      if (missionRef.current) setMissionFade(getSectionFade(missionRef.current, vh));
      if (valuesRef.current) setValuesFade(getSectionFade(valuesRef.current, vh));
      if (quoteRef.current) setQuoteFade(getSectionFade(quoteRef.current, vh));
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
    <div className="bg-charcoal min-h-screen">
      <HeroSection
        bgImage={ABOUT_COUPLE_HERO_IMAGE}
        title={
          <>
            — GHD Hotels —
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
              Where stays become experiences
            </span>
          </>
        }
        overlay="dark"
        fadeOnScroll
        titleStyle={{
          WebkitTextStroke: "1.3px rgba(0, 0, 0, 0.8)",
          textShadow:
            "0 0 20px rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.6), 0 0 70px rgba(0,0,0,0.85)",
        }}
      />

      {/* Mission Section */}
      <section
        id="who-we-are"
        ref={missionRef}
        className="section-pad bg-charcoal-mid"
      >
        <div
          className="max-w-5xl mx-auto px-2 sm:px-0"
          style={{ opacity: missionFade, willChange: "opacity" }}
        >
          <div className="grid grid-cols-1 gap-12 items-start">
            <div className="text-center">
              <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll-left">
                Who We Are
              </p>
              <div className="gold-divider animate-on-scroll-left delay-100" />
              <h2
                className="section-subheading animate-on-scroll-left delay-200"
                style={{ marginBottom: "2.5rem" }}
              >
                A Vision Born from Passion for Hospitality
              </h2>
              <div className="space-y-6 animate-on-scroll-left delay-300">
                <p className="body-refined-lg">
                  GHD Hotels was conceived with a clear and ambitious vision —
                  to create a hospitality brand that seamlessly serves the full
                  spectrum of modern travelers, from ultra-luxury seekers to
                  smart, efficiency-conscious guests.
                </p>
                <p className="body-refined">
                  Our founding philosophy recognizes that true luxury is not
                  defined by a price point — it is defined by the experience of
                  feeling understood, valued, and cared for in a thoughtfully
                  designed environment.
                </p>
                <p className="body-refined">
                  The GHD portfolio — Celéstra, Samrāya, and Nivaãra —
                  represents three distinct expressions of this philosophy, each
                  calibrated for a different traveler, but unified by the same
                  commitment to excellence.
                </p>
              </div>
            </div>

              <div className="about-logo-strip animate-on-scroll-right delay-200 mt-4 sm:mt-6">
                <div className="about-logo-track" aria-hidden>
                  <div className="about-logo-group">
                    <img
                      src="/assets/logo/Celestra_logo.png"
                      alt=""
                      className="about-logo-item about-logo-item--celestra"
                    />
                    <img
                      src="/assets/logo/Samrāya_logo.png"
                      alt=""
                      className="about-logo-item"
                    />
                    <img
                      src="/assets/logo/Nivaãra_logo.png"
                      alt=""
                      className="about-logo-item"
                    />
                  </div>
                  <div className="about-logo-group">
                    <img
                      src="/assets/logo/Celestra_logo.png"
                      alt=""
                      className="about-logo-item about-logo-item--celestra"
                    />
                    <img
                      src="/assets/logo/Samrāya_logo.png"
                      alt=""
                      className="about-logo-item"
                    />
                    <img
                      src="/assets/logo/Nivaãra_logo.png"
                      alt=""
                      className="about-logo-item"
                    />
                  </div>
                </div>
                <div className="sr-only">
                  Celéstra, Samrāya, and Nivaãra brand logos moving continuously.
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesRef} className="section-pad bg-charcoal">
        <div
          className="max-w-6xl mx-auto px-2 sm:px-0"
          style={{ opacity: valuesFade, willChange: "opacity" }}
        >
          <div className="text-center mb-12 sm:mb-20">
            <p
              className="eyebrow eyebrow--gold-emphasis animate-on-scroll"
              style={{ color: "#b8975a" }}
            >
              Our Principles
            </p>
            <div className="gold-divider animate-on-scroll delay-100" />
            <h2 className="section-heading animate-on-scroll delay-200">
              The Pillars of GHD
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <div
                key={value.number}
                className="pillar-card animate-on-scroll"
                style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="flex items-start gap-4 sm:gap-6 lg:gap-8">
                  <span
                    className="pillar-number font-display flex-shrink-0 leading-none"
                    style={{
                      fontFamily: "Instrument Serif, Georgia, serif",
                      fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                      lineHeight: 1,
                    }}
                  >
                    {value.number}
                  </span>
                  <div className="pt-1 sm:pt-2 min-w-0 text-justify">
                    <h3
                      className="font-display text-ivory mb-3"
                      style={{
                        fontFamily: "Instrument Serif, Georgia, serif",
                        fontWeight: 400,
                        fontSize: "1.35rem",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {value.title}
                    </h3>
                    <p className="body-refined">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote section */}
      <section
        ref={quoteRef}
        className="section-pad parallax-section relative text-center"
        style={{
          backgroundImage: `url(${ABOUT_COUPLE_HERO_IMAGE})`,
        }}
      >
        {/* No vignette overlay (intentionally removed site-wide) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(15,15,15,0.7) 0%, rgba(15,15,15,0.5) 50%, rgba(15,15,15,0.75) 100%)",
          }}
        />
        <div
          className="relative z-10 max-w-3xl mx-auto"
          style={{ opacity: quoteFade, willChange: "opacity" }}
        >
          <div className="gold-divider animate-on-scroll" />
          <blockquote
            className="font-display text-ivory italic animate-on-scroll delay-200"
            style={{
              fontFamily: "Instrument Serif, Georgia, serif",
              fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)",
              lineHeight: 1.4,
              letterSpacing: "0.02em",
              margin: "3rem 0",
            }}
          >
            "Hospitality is not an amenity. It is an art form — one that we at
            GHD Hotels are dedicated to mastering, one property at a time."
          </blockquote>
          <div className="gold-divider animate-on-scroll delay-300" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
