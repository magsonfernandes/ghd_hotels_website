import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type RoomCategory,
  SEED_RATES_CLIENT,
} from "../components/booking/bookingRates";

export type LiveRates = {
  version: 1;
  updatedAt: string;
  taxRate: number;
  mealPrices: { perAdult: number; perChild: number };
  roomCategories: RoomCategory[];
};

type RatesContextValue = {
  rates: LiveRates;
  isLoading: boolean;
  /** True while the seeded fallback is being used (e.g. fetch failed). */
  isFallback: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const fallbackRates: LiveRates = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  taxRate: SEED_RATES_CLIENT.taxRate,
  mealPrices: { ...SEED_RATES_CLIENT.mealPrices },
  roomCategories: SEED_RATES_CLIENT.roomCategories.map((c) => ({
    ...c,
    roomOnly: { ...c.roomOnly },
  })),
};

const RatesContext = createContext<RatesContextValue>({
  rates: fallbackRates,
  isLoading: false,
  isFallback: true,
  error: null,
  refresh: async () => {},
});

const REVALIDATE_MS = 5 * 60 * 1000;

function apiBase(): string {
  const fromEnv = (import.meta as ImportMeta).env?.VITE_API_BASE;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return fromEnv.replace(/\/+$/, "");
  }
  return "";
}

function isShapeValid(x: unknown): x is LiveRates {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  if (r.version !== 1) return false;
  if (typeof r.taxRate !== "number") return false;
  if (!r.mealPrices || typeof r.mealPrices !== "object") return false;
  const mp = r.mealPrices as Record<string, unknown>;
  if (typeof mp.perAdult !== "number" || typeof mp.perChild !== "number")
    return false;
  if (!Array.isArray(r.roomCategories) || r.roomCategories.length === 0)
    return false;
  return true;
}

export function RatesProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<LiveRates>(fallbackRates);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showFallbackToast = useCallback((message: string) => {
    if (typeof window === "undefined") return;
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    const existing = document.getElementById("__rates_toast");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.id = "__rates_toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.style.cssText =
      "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);" +
      "background:rgba(20,20,20,0.92);color:#fff;font:500 13px/1.4 system-ui,sans-serif;" +
      "padding:10px 16px;border-radius:9999px;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,0.25);";
    el.textContent = message;
    document.body.appendChild(el);
    toastTimerRef.current = window.setTimeout(() => {
      el.remove();
      toastTimerRef.current = null;
    }, 4500);
  }, []);

  const fetchRates = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      try {
        const res = await fetch(`${apiBase()}/api/rates`, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal,
        });
        if (!res.ok) {
          throw new Error(`Rates API responded with ${res.status}`);
        }
        const data = (await res.json()) as unknown;
        if (!isShapeValid(data)) {
          throw new Error("Rates API returned an unexpected payload");
        }
        setRates(data);
        setIsFallback(false);
        setError(null);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Failed to load rates";
        setError(message);
        setIsFallback(true);
        showFallbackToast(
          "Using last-known rates — couldn’t reach pricing service.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [showFallbackToast],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    void fetchRates(ctrl.signal);
    const interval = window.setInterval(() => {
      void fetchRates();
    }, REVALIDATE_MS);
    const onFocus = () => {
      void fetchRates();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      ctrl.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [fetchRates]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchRates();
  }, [fetchRates]);

  const value = useMemo<RatesContextValue>(
    () => ({ rates, isLoading, isFallback, error, refresh }),
    [rates, isLoading, isFallback, error, refresh],
  );

  return (
    <RatesContext.Provider value={value}>{children}</RatesContext.Provider>
  );
}

export function useRates(): LiveRates {
  return useContext(RatesContext).rates;
}

export function useRatesStatus(): Omit<RatesContextValue, "rates"> {
  const { isLoading, isFallback, error, refresh } = useContext(RatesContext);
  return { isLoading, isFallback, error, refresh };
}

/**
 * Convenience: lookup helpers around the live category list.
 */
export function findRoomCategory(
  rates: LiveRates,
  id: string,
): RoomCategory | undefined {
  return rates.roomCategories.find((c) => c.id === id);
}

/** Returns the first category id (the "primary" or default category). */
export function primaryRoomCategoryId(rates: LiveRates): string {
  return rates.roomCategories[0]?.id ?? "studio-apartment";
}
