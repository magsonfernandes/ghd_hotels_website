import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { to: "/", label: "Home", ocid: "nav.home.link" },
  { to: "/about", label: "About", ocid: "nav.about.link" },
  // Swap brand positioning: Samrāya as 5★ first, Celéstra as 4★ second
  { to: "/samraya", label: "Samrāya", ocid: "nav.samraya.link" },
  { to: "/celestra", label: "Celéstra", ocid: "nav.celestra.link" },
  { to: "/nivaara", label: "Nivaãra", ocid: "nav.nivaara.link" },
  { to: "/vision", label: "Development Vision", ocid: "nav.vision.link" },
  { to: "/contact", label: "Contact", ocid: "nav.contact.link" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change — intentionally only runs when path changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "nav-solid" : "nav-transparent"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between h-16 sm:h-20">
          {/* Logo — left aligned */}
          <Link
            to="/"
            className="flex items-center h-full group flex-shrink-0"
            data-ocid="nav.home.link"
          >
            <img
              src="/assets/logo/GHD HOTELS - Gold Emboss Logo.png"
              alt="GHD Hotels"
              className="h-18 sm:h-20 w-auto object-contain transition-opacity duration-300 group-hover:opacity-95"
              draggable={false}
            />
          </Link>

          {/* Desktop Nav — right aligned */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = currentPath === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    data-ocid={link.ocid}
                    className={`relative nav-link font-body text-sm tracking-[0.15em] uppercase transition-colors duration-300 pb-1 group ${
                      isActive
                        ? "text-gold"
                        : "text-ivory/90 hover:text-gold"
                    }`}
                    style={{
                      fontFamily: "General Sans, Helvetica Neue, sans-serif",
                      fontSize: "0.875rem",
                    }}
                  >
                    {link.label}
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

          {/* Mobile Toggle — right aligned when minimized */}
          <button
            type="button"
            className="lg:hidden text-ivory hover:text-gold transition-colors duration-300 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            data-ocid="nav.mobile.toggle"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="mobile-menu lg:hidden">
          <button
            type="button"
            className="absolute top-6 right-6 text-ivory hover:text-gold transition-colors duration-300 p-2"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>

          <div className="gold-divider mb-4" />

          <nav className="flex flex-col items-center gap-6">
            {navLinks.map((link) => {
              const isActive = currentPath === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid={link.ocid}
                  onClick={() => setMobileOpen(false)}
                  className={`font-display text-2xl tracking-widest transition-colors duration-300 ${
                    isActive ? "text-gold" : "text-ivory hover:text-gold"
                  }`}
                  style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="gold-divider mt-4" />
        </div>
      )}
    </>
  );
}
