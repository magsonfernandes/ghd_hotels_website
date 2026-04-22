import { useEffect, type CSSProperties } from "react";

export function PoliciesPage() {
  useEffect(() => {
    document.title = "Policies | GHD Hotels";
  }, []);

  const sectionTitle =
    "font-body text-sm font-semibold uppercase tracking-[0.2em] text-ivory border-b border-gold/30 pb-2 mb-4";
  const subTitle =
    "font-body text-xs font-semibold uppercase tracking-[0.18em] text-ivory/75 mt-6 mb-2";
  const p =
    "font-body text-sm sm:text-[0.95rem] text-ivory/80 leading-relaxed";
  const li =
    "font-body text-sm sm:text-[0.95rem] text-ivory/80 leading-relaxed";

  const policiesBgStyle: CSSProperties = {
    backgroundImage: 'url("/assets/generated/bg%20image.png")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-charcoal">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          ...policiesBgStyle,
          filter: "brightness(1.12)",
        }}
      />
      <div className="absolute inset-0 bg-black/55" />

      <section className="relative z-10 flex-1 section-pad pt-28 sm:pt-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10 sm:mb-12">
            <p className="eyebrow eyebrow--gold-emphasis mb-4">Policies</p>
            <div className="gold-divider mx-auto mb-8" />
            <h1
              className="font-display text-ivory text-3xl sm:text-4xl"
              style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
            >
              Policies
            </h1>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className={sectionTitle}>Hotel booking required details</h2>

              <h3 className={subTitle}>1. Guest information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>Full Name (as per ID)</li>
                <li className={li}>Contact Number</li>
                <li className={li}>Email ID</li>
              </ul>

              <h3 className={subTitle}>2. Stay details</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>Check-in Date</li>
                <li className={li}>Check-out Date</li>
                <li className={li}>Number of Nights</li>
              </ul>

              <h3 className={subTitle}>3. Room requirements</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>Number of Rooms</li>
              </ul>

              <h3 className={subTitle}>4. Guest count</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>Number of Adults</li>
                <li className={li}>Number of Children (with age)</li>
              </ul>

              <h3 className={subTitle}>5. Identification proof (at check-in)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>
                  Valid Government ID (Aadhar Card, Passport, Driving License,
                  etc.)
                </li>
              </ul>

              <h3 className={subTitle}>6. Payment details</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>Advance Payment</li>
                <li className={li}>
                  Mode of Payment (UPI / Card / Cash / Bank Transfer)
                </li>
              </ul>

              <h3 className={subTitle}>7. Special requests (Optional)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>Early Check-in / Late Check-out</li>
                <li className={li}>Extra Bed Requirement</li>
                <li className={li}>Airport Pickup/Drop</li>
                <li className={li}>
                  Special occasions (Birthday, Anniversary)
                </li>
              </ul>
            </section>

            <section>
              <h2 className={sectionTitle}>Hotel cancellation policy</h2>

              <h3 className={subTitle}>1. Standard cancellation policy</h3>
              <p className={p}>
                Free cancellation allowed up to 4 days before check-in.
              </p>
              <p className={p}>
                If cancelled within days/hours, full charge will be applicable.
              </p>

              <h3 className={subTitle}>2. No-show policy</h3>
              <p className={p}>
                In case of a no-show (guest does not arrive), 100% of the booking
                amount will be charged.
              </p>

              <h3 className={subTitle}>3. Early check-out</h3>
              <p className={p}>
                If the guest checks out early, full payment retention charge will
                apply.
              </p>

              <h3 className={subTitle}>4. Peak season / long weekend policy</h3>
              <p className={p}>During peak season, festivals, or long weekends:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li className={li}>No free cancellation</li>
                <li className={li}>100% advance payment required</li>
                <li className={li}>No refund on cancellation</li>
              </ul>

              <h3 className={subTitle}>5. Group booking (3 rooms or more)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>Cancellation allowed up to 7 days prior to arrival</li>
                <li className={li}>After that, 100% retention charges apply</li>
              </ul>

              <h3 className={subTitle}>6. Refund policy</h3>
              <p className={p}>
                Refunds (if applicable) will be processed within 7–10 working
                days via the original payment method.
              </p>

              <h3 className={subTitle}>7. Modification policy</h3>
              <p className={p}>
                Date changes allowed subject to availability and rate difference.
              </p>

              <h3 className={subTitle}>
                Optional add-ons (recommended for better revenue control)
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>
                  Non-refundable discounted rate (lower price, no cancellation)
                </li>
                <li className={li}>100% advance for weekends</li>
              </ul>
            </section>

            <section>
              <h2 className={sectionTitle}>Hotel child policy</h2>

              <h3 className={subTitle}>1. Child age definition</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>
                  Children below 6 years can stay free of charge when using
                  existing bedding.
                </li>
                <li className={li}>
                  Children aged 6 to 12 years will be charged extra child rate.
                </li>
                <li className={li}>
                  Children above 12 years will be considered as adults.
                </li>
              </ul>

              <h3 className={subTitle}>2. Extra bed policy</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>
                  Extra bed/mattress can be provided at an additional charge.
                </li>
                <li className={li}>Charges may vary depending on season.</li>
              </ul>

              <h3 className={subTitle}>3. Maximum occupancy</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>
                  Maximum occupancy per room is 2 adults + 2 child.
                </li>
                <li className={li}>
                  Any additional guest will require an extra bed and applicable
                  charges.
                </li>
              </ul>

              <h3 className={subTitle}>
                4. Complimentary inclusions for children
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li className={li}>
                  Breakfast for children below 6 years is complimentary.
                </li>
                <li className={li}>
                  Children above 6 years will be charged as per meal plan.
                </li>
              </ul>

              <h3 className={subTitle}>5. Safety &amp; responsibility</h3>
              <p className={p}>
                Parents/guardians are responsible for the safety and supervision
                of children at all times.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

