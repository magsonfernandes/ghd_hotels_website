import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { BOOKING_TAX_RATE, type BookingRateSelection } from "./bookingRates";

export type { BookingRateSelection };

export type BookingSearchSnapshot = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
};

function formatInr(amount: number) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseISODate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseISODate(checkIn);
  const b = parseISODate(checkOut);
  if (!a || !b || b <= a) return 1;
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

function formatStayDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const inputClass =
  "w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

const labelClass =
  "block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-charcoal/55 mb-1.5";

export function BookingCheckoutModal(props: {
  onClose: () => void;
  search: BookingSearchSnapshot;
  selection: BookingRateSelection;
  roomType: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const nights = useMemo(
    () => nightsBetween(props.search.checkIn, props.search.checkOut),
    [props.search.checkIn, props.search.checkOut],
  );

  const pricing = useMemo(() => {
    const { roomOnly, breakfast, roomOnlyPerNight, breakfastPerNight } =
      props.selection;
    const roomSub =
      roomOnly * roomOnlyPerNight * nights +
      breakfast * breakfastPerNight * nights;
    const taxes = Math.round(roomSub * BOOKING_TAX_RATE * 100) / 100;
    const total = Math.round((roomSub + taxes) * 100) / 100;
    return { roomSub, taxes, total };
  }, [props.selection, nights]);

  const checkInDate = parseISODate(props.search.checkIn);
  const checkOutDate = parseISODate(props.search.checkOut);
  const dateLine =
    checkInDate && checkOutDate && checkOutDate > checkInDate
      ? `${formatStayDate(checkInDate)} - ${formatStayDate(checkOutDate)}`
      : checkInDate
        ? `${formatStayDate(checkInDate)} — ${nights} night${nights === 1 ? "" : "s"}`
        : `${nights} night${nights === 1 ? "" : "s"}`;

  const guestLine = useMemo(() => {
    const a = props.search.adults;
    const c = props.search.children;
    const parts = [`${a} Adult${a === 1 ? "" : "s"}`];
    if (c > 0) parts.push(`${c} Child${c === 1 ? "" : "ren"}`);
    return parts.join(", ");
  }, [props.search.adults, props.search.children]);

  const resetForm = useCallback(() => {
    setFirstName("");
    setSurname("");
    setPhone("");
    setEmail("");
    setCountry("");
    setAddress1("");
    setAddress2("");
    setCity("");
    setStateProvince("");
    setCreateAccount(false);
    setCardNumber("");
    setCardExp("");
    setCardCvv("");
    setNameOnCard("");
    setAgreePrivacy(false);
    setSubmitError("");
  }, []);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (!el.open) el.showModal();
    return () => {
      if (el.open) el.close();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (
      !firstName.trim() ||
      !surname.trim() ||
      !email.trim() ||
      !country.trim() ||
      !address1.trim() ||
      !city.trim() ||
      !stateProvince.trim() ||
      !cardNumber.trim() ||
      !cardExp.trim() ||
      !cardCvv.trim() ||
      !nameOnCard.trim()
    ) {
      setSubmitError("Please complete all required fields.");
      return;
    }
    if (!agreePrivacy) {
      setSubmitError("Please accept the Privacy Terms to continue.");
      return;
    }
    // Demo only — wire to payment / PMS when ready
    // eslint-disable-next-line no-alert
    alert(
      `Booking request recorded (demo).\nTotal: ${formatInr(pricing.total)}\nConfirmation would be sent to ${email.trim()}.`,
    );
    props.onClose();
  };

  const { roomOnly, breakfast, roomOnlyPerNight, breakfastPerNight } =
    props.selection;
  const roomPolicyLabel = `Room 1 ${props.roomType}, ${props.roomType}`;

  return (
    <dialog
      ref={dialogRef}
      className="booking-checkout-dialog z-[100] w-[calc(100%-1.5rem)] max-w-6xl overflow-visible rounded-2xl border border-gold/20 bg-[#faf9f7] p-0 shadow-2xl shadow-black/40 open:flex open:max-h-[calc(100vh-2rem)] open:flex-col"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        props.onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div className="flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-charcoal/10 bg-[#faf9f7]/95 px-5 py-4 backdrop-blur-sm sm:px-8">
          <h2
            id={titleId}
            className="font-display text-xl text-charcoal sm:text-2xl pr-4"
            style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
          >
            Complete your booking
          </h2>
          <button
            type="button"
            onClick={props.onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-charcoal/15 text-charcoal/70 transition hover:bg-charcoal/5 hover:text-charcoal"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(280px,340px)]">
            {/* Main column */}
            <div className="order-2 min-w-0 space-y-8 lg:order-1">
              <p className="text-xs text-charcoal/50">
                <span className="text-red-700">*</span> Required
              </p>

              <section>
                <h3 className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-charcoal border-b border-gold/25 pb-2 mb-4">
                  Contact Info
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="bk-first" className={labelClass}>
                      First Name <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="bk-first"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputClass}
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="bk-surname" className={labelClass}>
                      Surname <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="bk-surname"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className={inputClass}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="bk-phone" className={labelClass}>
                      Phone
                    </label>
                    <input
                      id="bk-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="bk-email" className={labelClass}>
                      Email Address <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="bk-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      autoComplete="email"
                      required
                    />
                    <p className="mt-1.5 text-xs text-charcoal/50">
                      This is the email we will send your confirmation to.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-charcoal border-b border-gold/25 pb-2 mb-4">
                  Address
                </h3>
                <p className="mb-4 text-xs text-charcoal/50">
                  Please begin typing or use the arrow keys to navigate
                  suggested options
                </p>
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="bk-country" className={labelClass}>
                      Country <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="bk-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={inputClass}
                      autoComplete="country-name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="bk-a1" className={labelClass}>
                      Address 1 <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="bk-a1"
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      className={inputClass}
                      autoComplete="address-line1"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="bk-a2" className={labelClass}>
                      Address 2
                    </label>
                    <input
                      id="bk-a2"
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      className={inputClass}
                      autoComplete="address-line2"
                    />
                  </div>
                  <div>
                    <label htmlFor="bk-city" className={labelClass}>
                      City <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="bk-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClass}
                      autoComplete="address-level2"
                      required
                    />
                    <p className="mt-1.5 text-xs text-charcoal/50">
                      Please begin typing or use the arrow keys to navigate
                      suggested options
                    </p>
                  </div>
                  <div>
                    <label htmlFor="bk-state" className={labelClass}>
                      State / Province <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="bk-state"
                      value={stateProvince}
                      onChange={(e) => setStateProvince(e.target.value)}
                      className={inputClass}
                      autoComplete="address-level1"
                      required
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-charcoal border-b border-gold/25 pb-2 mb-4">
                  Book Faster (Optional)
                </h3>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-charcoal/25 text-gold focus:ring-gold/40"
                  />
                  <span className="text-sm text-charcoal/80">
                    I would like to create an account.
                  </span>
                </label>
              </section>

              <section>
                <h3 className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-charcoal border-b border-gold/25 pb-2 mb-4">
                  Payment
                </h3>
                <p className="mb-4 text-sm text-charcoal/65">
                  We use secure transmission and encrypted storage to protect
                  your personal information.
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {(
                    [
                      "Visa",
                      "Mastercard",
                      "American Express",
                      "Diners Club",
                    ] as const
                  ).map((brand) => (
                    <span
                      key={brand}
                      className="rounded border border-charcoal/10 bg-white px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-charcoal/70"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="bk-card" className={labelClass}>
                      Card Number <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="bk-card"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className={inputClass}
                      placeholder="•••• •••• •••• ••••"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="bk-exp" className={labelClass}>
                        Expiration Date (MM/YY){" "}
                        <span className="text-red-700">*</span>
                      </label>
                      <input
                        id="bk-exp"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className={inputClass}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="bk-cvv" className={labelClass}>
                        CVV <span className="text-red-700">*</span>
                      </label>
                      <input
                        id="bk-cvv"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className={inputClass}
                        placeholder="•••"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bk-namecard" className={labelClass}>
                      Name on Card <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="bk-namecard"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className={inputClass}
                      autoComplete="cc-name"
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-charcoal/10 bg-white/80 p-4 sm:p-5">
                <h3 className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-charcoal mb-4">
                  Policies
                </h3>
                <div className="space-y-3 text-sm text-charcoal/80">
                  <p>
                    <span className="font-semibold text-charcoal">
                      Check-in
                    </span>{" "}
                    after 14:00
                  </p>
                  <p>
                    <span className="font-semibold text-charcoal">
                      Check-out
                    </span>{" "}
                    before 12:00
                  </p>
                  <p className="pt-2 font-medium text-charcoal">
                    {roomPolicyLabel}
                  </p>
                  <div className="pt-2 space-y-2 border-t border-charcoal/10">
                    <p className="text-xs font-semibold tracking-[0.14em] text-charcoal">
                      GUARANTEE POLICY
                    </p>
                    <p>
                      Credit Card guarantee is required at the time of booking
                    </p>
                    <p className="text-xs font-semibold tracking-[0.14em] text-charcoal pt-2">
                      CANCEL POLICY
                    </p>
                    <p>
                      Cancellation or amendment can be made 14 days prior to
                      date of arrival, failing which 100% retention is
                      applicable.{" "}
                      <span className="font-semibold text-charcoal">
                        {formatInr(pricing.total)}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 text-sm font-medium text-gold underline underline-offset-4 hover:text-charcoal transition"
                >
                  View Full Policy
                </button>
              </section>

              <section>
                <h3 className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-charcoal border-b border-gold/25 pb-2 mb-4">
                  Acknowledgement
                </h3>
                <p className="mb-4 text-sm text-charcoal/75">
                  By completing this booking, I agree with the Booking
                  Conditions.
                </p>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-charcoal/25 text-gold focus:ring-gold/40"
                    required
                  />
                  <span className="text-sm text-charcoal/80">
                    <span className="text-red-700">*</span> I agree with the
                    Privacy Terms.
                  </span>
                </label>
              </section>

              {submitError && (
                <p className="text-sm text-red-700" role="alert">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                className="btn-gold-filled w-full py-3.5 text-sm font-semibold tracking-wide sm:w-auto sm:min-w-[220px]"
              >
                Confirm Booking
              </button>
            </div>

            {/* Price sidebar */}
            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 h-fit">
              <div className="rounded-xl border border-gold/25 bg-white p-5 shadow-lg shadow-black/10">
                <h3
                  className="font-display text-lg text-charcoal border-b border-charcoal/10 pb-3 mb-4"
                  style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
                >
                  Price Details
                </h3>
                <p className="text-sm font-medium text-charcoal leading-snug">
                  {props.roomType}, {props.roomType}
                </p>
                <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
                  Book Direct
                </p>
                <p className="mt-3 text-xl font-semibold text-charcoal">
                  {formatInr(pricing.roomSub)}
                </p>
                <p className="text-xs text-charcoal/55 mt-1">
                  {nights} night{nights === 1 ? "" : "s"} stay
                  {roomOnly > 0 && breakfast > 0
                    ? " · mixed rates"
                    : roomOnly > 0
                      ? ` · ${formatInr(roomOnlyPerNight)} / room / night`
                      : breakfast > 0
                        ? ` · ${formatInr(breakfastPerNight)} / room / night`
                        : ""}
                </p>
                <div className="my-4 border-t border-charcoal/10 pt-4 flex justify-between gap-2 text-sm">
                  <span className="text-charcoal/65">Taxes and fees</span>
                  <span className="font-medium text-charcoal">
                    {formatInr(pricing.taxes)}
                  </span>
                </div>
                <p className="text-xs text-charcoal/55 leading-relaxed">
                  {dateLine}
                </p>
                <p className="text-xs text-charcoal/55 mt-1">{guestLine}</p>
                <div className="mt-5 border-t border-charcoal/10 pt-4">
                  <div className="flex justify-between items-baseline gap-2">
                    <div>
                      <p className="text-sm font-semibold text-charcoal">
                        Total
                      </p>
                      <p className="text-[0.65rem] text-charcoal/50">
                        Including taxes and fees
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-charcoal">
                      {formatInr(pricing.total)}
                    </p>
                  </div>
                </div>
                {(roomOnly > 0 || breakfast > 0) && (
                  <div className="mt-4 space-y-2 text-xs text-charcoal/60 border-t border-charcoal/10 pt-4">
                    {roomOnly > 0 && (
                      <p>
                        Room Only × {roomOnly} × {nights} night
                        {nights === 1 ? "" : "s"} —{" "}
                        {formatInr(roomOnly * roomOnlyPerNight * nights)}
                      </p>
                    )}
                    {breakfast > 0 && (
                      <p>
                        Breakfast included × {breakfast} × {nights} night
                        {nights === 1 ? "" : "s"} —{" "}
                        {formatInr(breakfast * breakfastPerNight * nights)}
                      </p>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={props.onClose}
                  className="mt-5 w-full rounded-lg border border-gold/40 bg-transparent py-2.5 text-sm font-medium text-charcoal transition hover:bg-gold/10"
                >
                  Add A Room
                </button>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </dialog>
  );
}
