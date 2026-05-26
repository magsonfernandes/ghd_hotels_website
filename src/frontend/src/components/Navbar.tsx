import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ResponsiveImage } from "./ResponsiveImage";
import { LOGO_IMAGE_SIZES } from "../lib/optimizedMedia";

const navLinks = [
  { to: "/", label: "Home", shortLabel: "Home", ocid: "nav.home.link" },
  { to: "/about", label: "About", shortLabel: "About", ocid: "nav.about.link" },
  { to: "/nivaara", label: "Nivaãra", shortLabel: "Nivaãra", ocid: "nav.nivaara.link" },
  { to: "/celestra", label: "Celéstra", shortLabel: "Celéstra", ocid: "nav.celestra.link" },
  { to: "/samraya", label: "Samrāya", shortLabel: "Samrāya", ocid: "nav.samraya.link" },
  {
    to: "/vision",
    label: "Development Vision",
    shortLabel: "Vision",
    ocid: "nav.vision.link",
  },
  { to: "/contact", label: "Contact", shortLabel: "Contact", ocid: "nav.contact.link" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "nav-solid" : "nav-transparent"
      }`}
    >
      <div className="nav-bar-inner w-full px-2 sm:px-4 lg:px-10 flex flex-col gap-2 py-2 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:h-28 lg:py-0">
        <Link
          to="/"
          className="flex items-center justify-center lg:justify-start h-full group flex-shrink-0"
          data-ocid="nav.home.link"
        >
          <ResponsiveImage
            src="/assets/logo/GHD HOTELS - Gold Emboss Logo.png"
            alt="GHD Hotels"
            className="nav-bar-logo h-10 sm:h-14 lg:h-28 w-auto max-h-full object-contain object-center lg:object-left transition-opacity duration-300 group-hover:opacity-95"
            sizes={LOGO_IMAGE_SIZES}
            priority
            draggable={false}
          />
        </Link>

        <ul className="nav-bar-links flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:gap-x-3 lg:flex-nowrap lg:justify-end lg:gap-8">
          {navLinks.map((link) => {
            const isActive = currentPath === link.to;
            return (
              <li key={link.to} className="flex-shrink-0">
                <Link
                  to={link.to}
                  data-ocid={link.ocid}
                  className={`relative nav-link nav-link--bar tracking-[0.08em] sm:tracking-[0.1em] lg:tracking-[0.15em] uppercase transition-colors duration-300 pb-0.5 lg:pb-1 group whitespace-nowrap ${
                    isActive ? "text-gold" : "text-white hover:text-gold"
                  }`}
                >
                  <span className="lg:hidden">{link.shortLabel}</span>
                  <span className="hidden lg:inline">{link.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 h-px bg-gold transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
