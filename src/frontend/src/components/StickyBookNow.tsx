import { useLocation, useNavigate } from "@tanstack/react-router";

export function StickyBookNow() {
  const navigate = useNavigate();
  const loc = useLocation();

  // Hide on Reserve page to avoid redundancy; hide on Careers so it does not cover the form.
  if (loc.pathname === "/booking" || loc.pathname === "/careers") return null;

  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-[120] btn-gold-filled h-12 px-6 shadow-2xl shadow-black/35"
      onClick={() => {
        try {
          sessionStorage.removeItem("ghd_booking_search");
        } catch {
          // ignore
        }
        navigate({
          to: "/booking",
          search: {
            hotelId: "",
            checkIn: "",
            checkOut: "",
            adults: "",
            children: "",
          },
        });
      }}
      aria-label="Book now"
    >
      Book now
    </button>
  );
}

