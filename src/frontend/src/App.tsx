import {
  Outlet,
  RouterProvider,
  ScrollRestoration,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "./components/Navbar";

// Scroll to top when the route pathname changes (e.g. clicking a nav link).
function ScrollToTop() {
  useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}
import { AboutPage } from "./pages/AboutPage";
import { BookingPage } from "./pages/BookingPage";
import { CelestraPage } from "./pages/CelestraPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { NivaaraPage } from "./pages/NivaaraPage";
import { SamrayaPage } from "./pages/SamrayaPage";
import { VisionPage } from "./pages/VisionPage";

// ── Root Layout ─────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Navbar />
      <ScrollRestoration />
      <ScrollToTop />
      <Outlet />
    </>
  ),
});

// ── Page Routes ──────────────────────────────────────────────────────
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const celestraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/celestra",
  component: CelestraPage,
});

const samrayaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/samraya",
  component: SamrayaPage,
});

const nivaaraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nivaara",
  component: NivaaraPage,
});

const visionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vision",
  component: VisionPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking",
  component: BookingPage,
  validateSearch: (raw: Record<string, unknown>) => ({
    hotelId: String(raw.hotelId ?? ""),
    checkIn: String(raw.checkIn ?? ""),
    checkOut: String(raw.checkOut ?? ""),
    adults: String(raw.adults ?? ""),
    children: String(raw.children ?? ""),
  }),
});

// ── Router ───────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  homeRoute,
  aboutRoute,
  celestraRoute,
  samrayaRoute,
  nivaaraRoute,
  visionRoute,
  contactRoute,
  bookingRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App ──────────────────────────────────────────────────────────────
export default function App() {
  return <RouterProvider router={router} />;
}
