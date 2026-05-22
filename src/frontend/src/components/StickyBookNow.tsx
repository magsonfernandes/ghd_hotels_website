import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

/** Pixels from viewport top — show Book now once hero bottom is above this line. */
const HERO_EXIT_OFFSET_PX = 100;
const NO_HERO_SCROLL_PX = 80;

function computeBookNowVisible(): boolean {
  const hero = document.querySelector(".hero-section");
  if (hero) {
    return hero.getBoundingClientRect().bottom <= HERO_EXIT_OFFSET_PX;
  }
  return window.scrollY > NO_HERO_SCROLL_PX;
}

export function StickyBookNow() {
  const navigate = useNavigate();
  const loc = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(computeBookNowVisible());
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [loc.pathname]);

  // Hide on Reserve page to avoid redundancy; hide on Careers so it does not cover the form.
  if (loc.pathname === "/booking" || loc.pathname === "/careers") return null;

  return (
    <button
      type="button"
      className={`fixed bottom-6 right-6 z-[120] btn-gold-filled h-12 px-6 shadow-2xl shadow-black/35 transition-all duration-500 ease-out ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
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
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      Book now
    </button>
  );
}
