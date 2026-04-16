import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { HeroSection } from "../components/HeroSection";
import { useScrollAnimationAll } from "../hooks/useScrollAnimation";

/** Add your hero image under `public/` and set this, e.g. `"/assets/contact/hero.jpg"`. */
const CONTACT_HERO_IMAGE: string | undefined = "/assets/generated/contact.png";

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function ContactPage() {
  useScrollAnimationAll();

  useEffect(() => {
    document.title = "Contact GHD Hotels – Get in Touch";
  }, []);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMsg("Please fill in all required fields.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/contact-submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error || "Failed to send message.");
      }

      setForm({ name: "", email: "", phone: "", message: "" });
      setStatus("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to send message.",
      );
      setStatus("error");
    }
  };

  return (
    <div className="bg-charcoal min-h-screen home-test-font">
      <HeroSection
        bgImage={CONTACT_HERO_IMAGE}
        eyebrow="GHD Hotels"
        title="Contact Us"
        overlay="dark"
        titleStyle={{
          WebkitTextStroke: "1px rgba(0, 0, 0, 0.55)",
          textShadow:
            "0 0 24px rgba(0,0,0,0.65), 0 0 48px rgba(0,0,0,0.45)",
        }}
      />

      {/* Contact Layout */}
      <section className="section-pad bg-charcoal-mid">
        <div className="max-w-6xl mx-auto px-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">
            {/* Left: Info */}
            <div>
              <div className="gold-divider gold-divider-left animate-on-scroll" />
              <h2
                className="section-subheading animate-on-scroll delay-100"
                style={{
                  marginBottom: "2.5rem",
                  fontSize: "clamp(1.5rem, 2.65vw, 2.35rem)",
                  lineHeight: 1.18,
                }}
              >
                <span className="block">GHD Hotels</span>
                <span
                  className="block mt-2"
                  style={{ fontSize: "0.78em", letterSpacing: "0.04em" }}
                >
                  Corporate Office
                </span>
              </h2>

              <div className="space-y-8 animate-on-scroll delay-300">
                <div className="flex gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <MapPin size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="eyebrow eyebrow--gold-emphasis mb-2">
                      Address
                    </p>
                    <address
                      className="font-body text-ivory-muted/70 not-italic leading-relaxed text-base"
                      style={{
                        fontFamily: "General Sans, Helvetica Neue, sans-serif",
                        fontWeight: 300,
                      }}
                    >
                      GHD Hotels LLP
                      <br />
                      625, Gera Imperium Star
                      <br />
                      Patto, Panjim
                      <br />
                      Goa – 403001, India
                    </address>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <Mail size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="eyebrow eyebrow--gold-emphasis mb-2">Email</p>
                    <a
                      href="mailto:info@ghdhotels.in"
                      className="font-body text-ivory-muted/70 text-base hover:text-gold transition-colors duration-300"
                      style={{
                        fontFamily: "General Sans, Helvetica Neue, sans-serif",
                        fontWeight: 300,
                      }}
                    >
                      info@ghdhotels.in
                    </a>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <Phone size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="eyebrow eyebrow--gold-emphasis mb-2">Phone</p>
                    <a
                      href="tel:+918380008687"
                      className="font-body text-ivory-muted/70 text-base hover:text-gold transition-colors duration-300"
                      style={{
                        fontFamily: "General Sans, Helvetica Neue, sans-serif",
                        fontWeight: 300,
                      }}
                    >
                      +91 8380008687
                    </a>
                  </div>
                </div>
              </div>

              {/* Decorative Brand Links */}
              <div className="mt-12 pt-10 border-t border-gold/10 animate-on-scroll delay-400">
                <p className="eyebrow eyebrow--gold-emphasis mb-6">
                  Our Brands
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { to: "/samraya", label: "Samrāya — Luxury Hotels" },
                    { to: "/celestra", label: "Celéstra — Premium Hotels" },
                    {
                      to: "/nivaara",
                      label: "Nivaãra — Smart Comfort Hotels",
                    },
                  ].map((brand) => (
                    <Link
                      key={brand.label}
                      to={brand.to}
                      className="flex items-center gap-3 group w-fit"
                    >
                      <span className="w-5 h-px bg-gold flex-shrink-0" />
                      <span
                        className="font-body text-sm text-ivory-muted/60 group-hover:text-gold transition-colors duration-300"
                        style={{
                          fontFamily:
                            "General Sans, Helvetica Neue, sans-serif",
                        }}
                      >
                        {brand.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="animate-on-scroll-right delay-200 min-w-0">
              <div className="border border-gold/15 p-5 sm:p-8 md:p-10">
                <h3
                  className="font-display text-ivory text-2xl mb-2"
                  style={{
                    fontFamily: "Instrument Serif, Georgia, serif",
                    fontWeight: 400,
                  }}
                >
                  Send Us a Message
                </h3>
                <p
                  className="font-body text-base text-ivory-muted/55 mb-8"
                  style={{
                    fontFamily: "General Sans, Helvetica Neue, sans-serif",
                    fontWeight: 300,
                  }}
                >
                  For enquiries, partnerships, or investment discussions.
                </p>

                {status === "success" ? (
                  <div
                    className="border border-gold/30 p-8 text-center"
                    data-ocid="contact.success_state"
                  >
                    <div className="gold-divider" />
                    <p
                      className="font-display text-gold text-xl mt-6 mb-3"
                      style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
                    >
                      Message Received
                    </p>
                    <p
                      className="font-body text-ivory-muted/60 text-base leading-relaxed"
                      style={{
                        fontFamily: "General Sans, Helvetica Neue, sans-serif",
                        fontWeight: 300,
                      }}
                    >
                      Thank you for reaching out. A member of the GHD Hotels
                      team will be in touch with you shortly.
                    </p>
                    <button
                      type="button"
                      className="btn-gold mt-8 text-sm"
                      onClick={() => setStatus("idle")}
                    >
                      <span>Send Another Message</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-5">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="eyebrow eyebrow--gold-emphasis block mb-2"
                        >
                          Full Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          className="ghd-input"
                          autoComplete="name"
                          required
                          data-ocid="contact.name.input"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-email"
                          className="eyebrow eyebrow--gold-emphasis block mb-2"
                        >
                          Email Address *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="ghd-input"
                          autoComplete="email"
                          required
                          data-ocid="contact.email.input"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-phone"
                          className="eyebrow eyebrow--gold-emphasis block mb-2"
                        >
                          Phone Number
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 00000 00000"
                          className="ghd-input"
                          autoComplete="tel"
                          data-ocid="contact.phone.input"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-message"
                          className="eyebrow eyebrow--gold-emphasis block mb-2"
                        >
                          Message *
                        </label>
                        <textarea
                          id="contact-message"
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="How can we assist you?"
                          rows={5}
                          className="ghd-input resize-none"
                          required
                          data-ocid="contact.message.textarea"
                        />
                      </div>

                      {status === "error" && errorMsg && (
                        <div
                          className="border border-red-500/30 px-4 py-3"
                          data-ocid="contact.error_state"
                        >
                          <p
                            className="font-body text-red-400 text-sm"
                            style={{
                              fontFamily:
                                "General Sans, Helvetica Neue, sans-serif",
                            }}
                          >
                            {errorMsg}
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="btn-gold-filled w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        data-ocid="contact.submit_button"
                      >
                        {status === "loading" ? (
                          <span
                            data-ocid="contact.loading_state"
                            className="flex items-center justify-center gap-2"
                          >
                            <span className="w-4 h-4 border border-charcoal/40 border-t-charcoal rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Send Message"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
