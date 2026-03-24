import { useEffect, useState } from "react";

interface HeroSectionProps {
  bgImage: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  bottomNote?: React.ReactNode;
  overlay?: "light" | "medium" | "dark";
  titleClass?: string;
  titleStyle?: React.CSSProperties;
  /** Optional: blur the hero background image slightly (layout-only, not scroll-driven). */
  bgBlurPx?: number;
  /** Optional: dim/brighten the hero background image (layout-only, not scroll-driven).
   * 1 = unchanged, 0.85 = slightly dim.
   */
  bgBrightness?: number;
  /** When true, hero background fades out as user scrolls down (main page only) */
  fadeOnScroll?: boolean;
  /** Base color behind the hero image (section bg and bottom fade). Default charcoal (grey); use "black" for pure black. */
  baseColor?: "charcoal" | "black";
}

export function HeroSection({
  bgImage,
  eyebrow,
  title,
  subtitle,
  description,
  children,
  bottomNote,
  overlay = "medium",
  titleClass = "",
  titleStyle,
  bgBlurPx = 0,
  bgBrightness = 1,
  fadeOnScroll = false,
  baseColor = "charcoal",
}: HeroSectionProps) {
  const [bgOffset, setBgOffset] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;

      // Parallax: reduced — background moves only slightly with scroll
      const clamped = Math.min(y * 0.15, vh * 0.15);
      setBgOffset(clamped);

      // Force visible fade: over first 500px of scroll, hero image goes 1 → 0 (very obvious)
      if (fadeOnScroll) {
        const opacity = Math.max(0, 1 - y / 500);
        setBgOpacity(opacity);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [fadeOnScroll]);

  return (
    <section
      className={`hero-section snap-section${baseColor === "black" ? " hero-section--black" : ""}`}
    >
      {/* Wrapper so opacity is applied to the whole background layer; fade is impossible to miss */}
      <div
        className="absolute inset-0 z-0"
        style={{
          opacity: fadeOnScroll ? bgOpacity : 1,
          willChange: fadeOnScroll ? "opacity" : undefined,
        }}
        aria-hidden
      >
        <div
          className="hero-bg"
          style={{
            backgroundImage: `url(${bgImage})`,
            transform: `translateY(${bgOffset * -1}px)`,
            filter: (() => {
              const parts: string[] = [];
              if (bgBlurPx) parts.push(`blur(${bgBlurPx}px)`);
              if (bgBrightness !== 1) parts.push(`brightness(${bgBrightness})`);
              return parts.length ? parts.join(" ") : undefined;
            })(),
          }}
        />
      </div>

      {/* Layer 1: Bottom-weighted directional gradient for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(15,15,15,0.08) 0%,
            rgba(15,15,15,0.0) 30%,
            rgba(15,15,15,0.35) 65%,
            rgba(15,15,15,0.88) 100%
          )`,
        }}
      />

      {/* Layer 3: Subtle top shadow for nav legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15,15,15,0.45) 0%, transparent 18%)",
        }}
      />

      {/* Noise grain texture overlay (light so hero image stays crisp) */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto w-full pt-3 sm:pt-6 md:pt-10">
        {eyebrow && (
          <p
            className="eyebrow mb-7 opacity-0 animate-fade-up"
            style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
          >
            {eyebrow}
          </p>
        )}

        <div
          className="gold-divider mb-10 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
        />

        <h1
          className={`font-display text-ivory opacity-0 animate-fade-up ${titleClass}`}
          style={{
            fontFamily: "Instrument Serif, Georgia, serif",
            fontSize: "clamp(3rem, 7.5vw, 7rem)",
            fontWeight: 500,
            letterSpacing: "0.03em",
            lineHeight: 1.02,
            marginBottom: "2rem",
            animationDelay: "0.2s",
            animationFillMode: "forwards",
            ...titleStyle,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="eyebrow text-gold-light mb-8 opacity-0 animate-fade-up"
            style={{
              animationDelay: "0.32s",
              animationFillMode: "forwards",
              letterSpacing: "0.4em",
            }}
          >
            {subtitle}
          </p>
        )}

        {description && (
          <p
            className="font-body text-ivory/60 max-w-xl mx-auto mb-8 sm:mb-12 opacity-0 animate-fade-up"
            style={{
              fontFamily: "General Sans, Helvetica Neue, sans-serif",
              fontWeight: 300,
              fontSize: "clamp(1.125rem, 2.4vw, 1.2rem)",
              lineHeight: 1.9,
              letterSpacing: "0.01em",
              animationDelay: "0.42s",
              animationFillMode: "forwards",
            }}
          >
            {description}
          </p>
        )}

        {children && (
          <div
            className="opacity-0 animate-fade-up mt-16 sm:mt-24"
            style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}
          >
            {children}
          </div>
        )}
      </div>

      {/* Bottom fade — blends into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-56 sm:h-64"
        style={{
          background:
            baseColor === "black"
              ? "linear-gradient(to top, #000 0%, rgba(0,0,0,0.9) 25%, rgba(0,0,0,0.4) 55%, transparent 100%)"
              : "linear-gradient(to top, #1a1a1a 0%, rgba(26,26,26,0.85) 25%, rgba(15,15,15,0.4) 55%, transparent 100%)",
        }}
      />

      {bottomNote && (
        <div
          className="absolute z-10 left-4 sm:left-6 md:left-10 bottom-2 sm:bottom-3 md:bottom-4 max-w-[92%] sm:max-w-[80%]"
          style={{
            opacity: fadeOnScroll ? bgOpacity : 1,
            willChange: fadeOnScroll ? "opacity" : undefined,
          }}
        >
          {bottomNote}
        </div>
      )}

      {/* Scroll indicator — refined line + small label */}
      <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <div
          className="w-px h-14 bg-gradient-to-b from-gold/60 via-gold/30 to-transparent"
          style={{ animation: "scroll-line 2.4s ease-in-out infinite" }}
        />
      </div>
    </section>
  );
}
