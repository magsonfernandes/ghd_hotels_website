import { Link } from "@tanstack/react-router";
import { Building2, Leaf, TrendingUp, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { useScrollAnimationAll } from "../hooks/useScrollAnimation";

const pillars = [
  {
    number: "I",
    icon: Building2,
    title: "Carefully Designed Hotel Architecture",
    description:
      "Every GHD property begins with a vision — not just of a building, but of an experience. Our architectural approach engages the finest design studios to create hotels that are as much cultural landmarks as they are places to stay. Each property responds to its geography, climate, and context, resulting in structures that belong to their location while transcending it.",
    accentColor: "#b8975a",
  },
  {
    number: "II",
    icon: Leaf,
    title: "Sustainable Development",
    description:
      "GHD Hotels is committed to a development philosophy that respects and preserves the environments in which we build. From the materials used in construction to the operational practices of our hotels, sustainability is not an afterthought but a founding principle. We aim to create properties that leave the lightest possible footprint while delivering the richest possible experiences.",
    accentColor: "#8aab7a",
  },
  {
    number: "III",
    icon: Users,
    title: "Guest Experience Driven Design",
    description:
      "Every decision in the development of a GHD hotel is filtered through a single lens: how will this enhance the guest experience? From room layouts optimised for natural light to lobby designs that facilitate organic social connection, the architecture and interior design of our properties are fundamentally in service of the people who stay in them.",
    accentColor: "#7a9db8",
  },
  {
    number: "IV",
    icon: TrendingUp,
    title: "Long Term Hospitality Vision",
    description:
      "GHD Hotels is building a hospitality portfolio with generational ambition. We are not developing hotels for quick returns but for lasting legacies. Our properties are designed to be iconic, enduring, and continually evolving. The GHD brand is being built to stand among the world's most respected hospitality names — a vision we pursue with patience and conviction.",
    accentColor: "#b8975a",
  },
];

const VISION_SECTION_FADE = {
  fadeInStartVh: 0.9,
  fadeInEndVh: 0.1,
  fadeOutStartVh: 0,
  fadeOutEndVh: -1.2,
};

export function VisionPage() {
  useScrollAnimationAll();
  const introRef = useRef<HTMLElement | null>(null);
  const pillarsRef = useRef<HTMLElement | null>(null);
  const statusRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);
  const [introFade, setIntroFade] = useState(0);
  const [pillarsFade, setPillarsFade] = useState(0);
  const [statusFade, setStatusFade] = useState(0);
  const [ctaFade, setCtaFade] = useState(0);

  useEffect(() => {
    document.title =
      "Development Vision – GHD Hotels | Building the Future of Hospitality";
  }, []);

  useEffect(() => {
    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));
    const smoothstep01 = (t: number) => t * t * (3 - 2 * t);
    const getSectionFade = (el: HTMLElement, vh: number) => {
      const rect = el.getBoundingClientRect();
      const fadeInStartPx = vh * VISION_SECTION_FADE.fadeInStartVh;
      const fadeInEndPx = vh * VISION_SECTION_FADE.fadeInEndVh;
      const fadeInT = clamp(
        (fadeInStartPx - rect.top) / (fadeInStartPx - fadeInEndPx),
        0,
        1,
      );
      const fadeOutStartPx = vh * VISION_SECTION_FADE.fadeOutStartVh;
      const fadeOutEndPx = vh * VISION_SECTION_FADE.fadeOutEndVh;
      const fadeOutT = clamp(
        (rect.bottom - fadeOutEndPx) / (fadeOutStartPx - fadeOutEndPx),
        0,
        1,
      );
      return smoothstep01(fadeInT) * smoothstep01(fadeOutT);
    };

    const onScroll = () => {
      const vh = window.innerHeight;
      if (introRef.current) setIntroFade(getSectionFade(introRef.current, vh));
      if (pillarsRef.current) setPillarsFade(getSectionFade(pillarsRef.current, vh));
      if (statusRef.current) setStatusFade(getSectionFade(statusRef.current, vh));
      if (ctaRef.current) setCtaFade(getSectionFade(ctaRef.current, vh));
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
    <div className="bg-charcoal min-h-screen nivaara-test-font">
      <HeroSection
        bgImage="/assets/generated/hero-vision.dim_1920x1080.png"
        title="Building the Future of Hospitality"
        overlay="dark"
        bgBlurPx={1}
        bgBrightness={0.65}
        titleStyle={{
          WebkitTextStroke: "1.3px rgba(0, 0, 0, 0.8)",
          textShadow:
            "0 0 20px rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.6), 0 0 70px rgba(0,0,0,0.85)",
        }}
      />

      {/* Intro Section */}
      <section ref={introRef} className="section-pad bg-charcoal-mid">
        <div
          className="max-w-4xl mx-auto text-center px-4 sm:px-0"
          style={{ opacity: introFade, willChange: "opacity" }}
        >
          <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
            The GHD Approach
          </p>
          <div className="gold-divider animate-on-scroll delay-100" />
          <h2
            className="section-heading animate-on-scroll delay-200"
            style={{ marginBottom: "3rem" }}
          >
            A New Hospitality Ecosystem
          </h2>
          <div className="space-y-6">
            <p className="body-refined-lg">
              GHD Hotels is not merely building hotels. We are developing a
              comprehensive hospitality ecosystem — one that offers remarkable
              experiences at every tier, from the most discerning luxury
              traveler to the efficiency-focused business guest.
            </p>
            <p className="body-refined">
              Our development approach is guided by four core principles that
              inform every aspect of how we select locations, design properties,
              and create the operational culture that will define the GHD guest
              experience.
            </p>
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section ref={pillarsRef} className="section-pad bg-charcoal">
        <div
          className="max-w-6xl mx-auto px-4 sm:px-0"
          style={{ opacity: pillarsFade, willChange: "opacity" }}
        >
          <div className="text-center mb-12 sm:mb-20">
            <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
              Development Pillars
            </p>
            <div className="gold-divider animate-on-scroll delay-100" />
            <h2 className="section-heading animate-on-scroll delay-200">
              Four Cornerstones of Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.number}
                  className="pillar-card animate-on-scroll"
                  style={{
                    transitionDelay: `${0.1 + i * 0.12}s`,
                    borderColor: `${pillar.accentColor}20`,
                  }}
                >
                  {/* Number + Icon Row */}
                  <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <span
                      className="pillar-number font-display text-5xl leading-none flex-shrink-0"
                      style={{
                        fontFamily: "Instrument Serif, Georgia, serif",
                        color: `${pillar.accentColor}30`,
                      }}
                    >
                      {pillar.number}
                    </span>
                    <div className="pt-2">
                      <Icon size={24} style={{ color: pillar.accentColor }} />
                    </div>
                  </div>

                  <div className="min-w-0 text-justify">
                    <h3
                      className="font-display text-ivory text-xl md:text-2xl mb-4"
                      style={{
                        fontFamily: "Instrument Serif, Georgia, serif",
                        fontWeight: 400,
                      }}
                    >
                      {pillar.title}
                    </h3>
                    <p
                      className="font-body text-base text-ivory-muted/65 leading-relaxed"
                      style={{
                        fontFamily: "General Sans, Helvetica Neue, sans-serif",
                        fontWeight: 300,
                      }}
                    >
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline / Under Construction */}
      <section
        id="development-status"
        ref={statusRef}
        className="section-pad parallax-section relative"
        style={{
          backgroundImage:
            "url(/assets/generated/hero-vision.dim_1920x1080.png)",
        }}
      >
        {/* No vignette overlay (intentionally removed site-wide) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(15,15,15,0.7) 0%, rgba(15,15,15,0.55) 50%, rgba(15,15,15,0.8) 100%)",
          }}
        />
        <div
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-0"
          style={{ opacity: statusFade, willChange: "opacity" }}
        >
          <div className="text-center mb-12 sm:mb-20">
            <p className="eyebrow eyebrow--gold-emphasis animate-on-scroll">
              Development Status
            </p>
            <div className="gold-divider animate-on-scroll delay-100" />
            <h2
              className="section-heading animate-on-scroll delay-200"
              style={{
                WebkitTextStroke: "1.3px rgba(0, 0, 0, 0.8)",
                textShadow:
                  "0 0 20px rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.6), 0 0 70px rgba(0,0,0,0.85)",
              }}
            >
              The Journey Ahead
            </h2>
          </div>

          <div className="space-y-6 animate-on-scroll delay-300">
            {[
              {
                phase: "Phase I",
                title: "Site Selection & Acquisition",
                status: "In Progress",
                detail:
                  "Strategic site selection across Tier 1 and Tier 2 Indian cities and international destinations.",
              },
              {
                phase: "Phase II",
                title: "Architectural Design & Planning",
                status: "In Progress",
                detail:
                  "Collaboration with world-class architecture firms to develop signature property designs.",
              },
              {
                phase: "Phase III",
                title: "Construction & Development",
                status: "Coming Soon",
                detail:
                  "Ground-up construction of flagship properties across all three brand tiers.",
              },
              {
                phase: "Phase IV",
                title: "Soft Opening & Launch",
                status: "Future",
                detail:
                  "Phased opening of properties beginning with select Nivaãra and Samrāya locations.",
              },
            ].map((item, i) => (
              <div
                key={item.phase}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start border border-gold/10 p-4 sm:p-6 animate-on-scroll"
                style={{
                  background: "rgba(26, 26, 26, 0.5)",
                  transitionDelay: `${0.1 + i * 0.12}s`,
                }}
              >
                <div className="flex-shrink-0 text-center w-24">
                  <p className="eyebrow">{item.phase}</p>
                  <p
                    className="font-body mt-2 px-2 py-1 border border-gold/20 text-center text-sm"
                    style={{
                      fontFamily: "General Sans, Helvetica Neue, sans-serif",
                      color:
                        item.status === "In Progress"
                          ? "#b8975a"
                          : item.status === "Coming Soon"
                            ? "#b8975a"
                            : "rgba(212,207,198,0.4)",
                      borderColor:
                        item.status === "In Progress"
                          ? "rgba(184, 151, 90, 0.3)"
                          : "rgba(184, 151, 90, 0.1)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {item.status}
                  </p>
                </div>
                <div>
                  <h4
                    className="font-display text-ivory text-lg mb-2"
                    style={{
                      fontFamily: "Instrument Serif, Georgia, serif",
                      fontWeight: 400,
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="font-body text-base text-ivory-muted/60"
                    style={{
                      fontFamily: "General Sans, Helvetica Neue, sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        ref={ctaRef}
        className="py-12 sm:py-20 bg-charcoal-mid border-t border-gold/10"
      >
        <div
          className="max-w-3xl mx-auto text-center px-4 sm:px-6"
          style={{ opacity: ctaFade, willChange: "opacity" }}
        >
          <div className="gold-divider animate-on-scroll" />
          <h3
            className="font-display text-ivory text-3xl mt-8 mb-4 animate-on-scroll delay-200"
            style={{
              fontFamily: "Instrument Serif, Georgia, serif",
              fontWeight: 400,
            }}
          >
            Join the GHD Journey
          </h3>
          <p
            className="font-body text-ivory-muted/65 text-base leading-relaxed mb-10 animate-on-scroll delay-300"
            style={{
              fontFamily: "General Sans, Helvetica Neue, sans-serif",
              fontWeight: 300,
            }}
          >
            We welcome partnerships, investment inquiries, and expressions of
            interest from those who share our vision for the future of
            hospitality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll delay-400">
            <Link to="/contact" className="btn-gold">
              <span>Get in Touch</span>
            </Link>
            <Link to="/about" className="btn-gold">
              <span>Learn About GHD</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
