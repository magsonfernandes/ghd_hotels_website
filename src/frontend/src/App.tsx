import {
  Outlet,
  RouterProvider,
  ScrollRestoration,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
} from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { Navbar } from "./components/Navbar";
import { StickyBookNow } from "./components/StickyBookNow";

/** Scroll to top on every in-app navigation (links, buttons using navigate, etc.). */
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}
import { AboutPage } from "./pages/AboutPage";
import { BookingPage } from "./pages/BookingPage";
import { CareersPage } from "./pages/CareersPage";
import { CelestraPage } from "./pages/CelestraPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { NivaaraPage } from "./pages/NivaaraPage";
import { PoliciesPage } from "./pages/PoliciesPage";
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
      <StickyBookNow />
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

const policiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/policies",
  component: PoliciesPage,
});

const careersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/careers",
  component: CareersPage,
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
  policiesRoute,
  careersRoute,
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
