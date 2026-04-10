import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Footer } from "../components/Footer";

export function CareersPage() {
  useEffect(() => {
    document.title = "Careers | GHD Hotels";
  }, []);

  const p =
    "font-body text-sm sm:text-[0.95rem] text-ivory-muted/70 leading-relaxed";

  return (
    <div className="bg-charcoal min-h-screen flex flex-col">
      <section className="flex-1 section-pad pt-28 sm:pt-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10 sm:mb-12">
            <p className="eyebrow eyebrow--gold-emphasis mb-4">Careers</p>
            <div className="gold-divider mx-auto mb-8" />
            <h1
              className="font-display text-ivory text-3xl sm:text-4xl"
              style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
            >
              Join GHD Hotels
            </h1>
          </div>

          <div className="rounded-2xl border border-gold/15 bg-black/25 p-5 sm:p-8 space-y-5">
            <p className={p}>
              We are building a portfolio of distinctive hotels across luxury,
              premium, and smart comfort. This careers section is a placeholder
              while we prepare official listings and an application process.
            </p>
            <p className={p}>
              Interested in future opportunities? Reach out through our contact
              page—we would love to hear from you.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/contact" className="btn-gold-filled text-center px-6 py-2.5">
                <span>Contact us</span>
              </Link>
              <Link to="/" className="btn-gold text-center px-6 py-2.5">
                <span>Back to home</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
