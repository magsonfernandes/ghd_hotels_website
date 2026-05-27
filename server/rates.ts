import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, "data");
const ratesFile = path.join(dataDir, "rates.json");
const ratesTmpFile = path.join(dataDir, "rates.json.tmp");

export type RoomCategoryInput = {
  id: string;
  label: string;
  shortDescription: string;
  roomOnly: { original: number; discounted: number };
};

export type RatesPayload = {
  version: 1;
  updatedAt: string;
  taxRate: number;
  mealPrices: { perAdult: number; perChild: number };
  roomCategories: RoomCategoryInput[];
};

/**
 * Identical to the values previously hard-coded in
 * src/frontend/src/components/booking/bookingRates.ts. Kept here as the
 * single seed so that an out-of-the-box server matches the public site
 * byte-for-byte on day one.
 */
export const SEED_RATES: RatesPayload = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  taxRate: 0.05,
  mealPrices: { perAdult: 500, perChild: 250 },
  roomCategories: [
    {
      id: "studio-apartment",
      label: "Royal Studio",
      shortDescription: "Modern smart comfort — ideal for 2 guests.",
      roomOnly: { original: 7500, discounted: 7499 },
    },
  ],
};

type ValidationDetails = Record<string, string>;

export type ValidationFailure = {
  ok: false;
  error: string;
  details: ValidationDetails;
};

export type ValidationSuccess = {
  ok: true;
  value: RatesPayload;
};

const ID_RE = /^[a-z0-9-]{1,40}$/;
const MAX_MONEY = 10_000_000;

function isFiniteNonNegInt(n: unknown): n is number {
  return (
    typeof n === "number" &&
    Number.isFinite(n) &&
    Number.isInteger(n) &&
    n >= 0 &&
    n <= MAX_MONEY
  );
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Validate (and shape-normalize) an incoming rates payload. Unknown fields are
 * stripped rather than rejected to keep the contract forward-compatible.
 */
export function validateRates(input: unknown): ValidationSuccess | ValidationFailure {
  const details: ValidationDetails = {};
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Body must be an object", details: { body: "missing" } };
  }
  const raw = input as Record<string, unknown>;

  if (raw.version !== 1) {
    details.version = "must equal 1";
  }

  const taxRate = raw.taxRate;
  if (typeof taxRate !== "number" || !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1) {
    details.taxRate = "must be a finite number between 0 and 1 (inclusive)";
  }

  let mealAdult = 0;
  let mealChild = 0;
  const mp = raw.mealPrices;
  if (!mp || typeof mp !== "object") {
    details["mealPrices"] = "missing object";
  } else {
    const m = mp as Record<string, unknown>;
    if (!isFiniteNonNegInt(m.perAdult)) {
      details["mealPrices.perAdult"] = `must be an integer 0..${MAX_MONEY}`;
    } else {
      mealAdult = m.perAdult;
    }
    if (!isFiniteNonNegInt(m.perChild)) {
      details["mealPrices.perChild"] = `must be an integer 0..${MAX_MONEY}`;
    } else {
      mealChild = m.perChild;
    }
  }

  const cats = raw.roomCategories;
  const cleanCats: RoomCategoryInput[] = [];
  if (!Array.isArray(cats) || cats.length === 0) {
    details["roomCategories"] = "must be a non-empty array";
  } else {
    const seenIds = new Set<string>();
    cats.forEach((c, idx) => {
      const prefix = `roomCategories[${idx}]`;
      if (!c || typeof c !== "object") {
        details[prefix] = "must be an object";
        return;
      }
      const rc = c as Record<string, unknown>;
      const id = asString(rc.id).trim();
      const label = asString(rc.label).trim();
      const shortDescription = asString(rc.shortDescription).trim();
      if (!ID_RE.test(id)) {
        details[`${prefix}.id`] = "must match ^[a-z0-9-]{1,40}$";
      } else if (seenIds.has(id)) {
        details[`${prefix}.id`] = `duplicate id "${id}"`;
      } else {
        seenIds.add(id);
      }
      if (!label) details[`${prefix}.label`] = "required";
      if (label.length > 120) details[`${prefix}.label`] = "must be <= 120 characters";
      if (shortDescription.length > 280) {
        details[`${prefix}.shortDescription`] = "must be <= 280 characters";
      }
      const ro = rc.roomOnly;
      if (!ro || typeof ro !== "object") {
        details[`${prefix}.roomOnly`] = "missing object";
      } else {
        const rom = ro as Record<string, unknown>;
        let originalOk = true;
        let discountedOk = true;
        if (!isFiniteNonNegInt(rom.original)) {
          details[`${prefix}.roomOnly.original`] = `must be an integer 0..${MAX_MONEY}`;
          originalOk = false;
        }
        if (!isFiniteNonNegInt(rom.discounted)) {
          details[`${prefix}.roomOnly.discounted`] = `must be an integer 0..${MAX_MONEY}`;
          discountedOk = false;
        }
        if (originalOk && discountedOk && (rom.discounted as number) > (rom.original as number)) {
          details[`${prefix}.roomOnly.discounted`] = "must be <= original";
        }
        if (originalOk && discountedOk) {
          cleanCats.push({
            id,
            label,
            shortDescription,
            roomOnly: {
              original: rom.original as number,
              discounted: rom.discounted as number,
            },
          });
        }
      }
    });
  }

  if (Object.keys(details).length > 0) {
    return { ok: false, error: "Invalid rates payload", details };
  }

  const value: RatesPayload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    taxRate: taxRate as number,
    mealPrices: { perAdult: mealAdult, perChild: mealChild },
    roomCategories: cleanCats,
  };
  return { ok: true, value };
}

function ensureDataDir(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function writeSeedIfMissing(): void {
  ensureDataDir();
  if (!fs.existsSync(ratesFile)) {
    const seeded: RatesPayload = {
      ...SEED_RATES,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(ratesFile, `${JSON.stringify(seeded, null, 2)}\n`, "utf8");
  }
}

/**
 * Read the live rates from disk; if the file is missing or corrupt, seed it
 * with the current defaults so the public site keeps working unchanged.
 *
 * `validateRates` always stamps a fresh `updatedAt` because it is also used
 * by the write path. On reads we preserve the saved timestamp so it tracks
 * the last actual save rather than the last process boot.
 */
export function loadRates(): RatesPayload {
  try {
    writeSeedIfMissing();
    const raw = fs.readFileSync(ratesFile, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result = validateRates(parsed);
    if (result.ok) {
      const savedAt =
        typeof parsed?.updatedAt === "string" ? parsed.updatedAt : result.value.updatedAt;
      return { ...result.value, updatedAt: savedAt };
    }
    console.warn(
      `[rates] data/rates.json failed validation, reseeding. Details:`,
      result.details,
    );
  } catch (err) {
    console.warn(`[rates] Could not read data/rates.json, reseeding.`, err);
  }
  const seeded: RatesPayload = {
    ...SEED_RATES,
    updatedAt: new Date().toISOString(),
  };
  try {
    ensureDataDir();
    fs.writeFileSync(ratesFile, `${JSON.stringify(seeded, null, 2)}\n`, "utf8");
  } catch (err) {
    console.warn(`[rates] Failed to write seed rates.json`, err);
  }
  return seeded;
}

/**
 * Validate + atomically persist a new rates payload. Writes to a temp file
 * first and then renames, so concurrent readers never see a partial file.
 */
export function saveRates(input: unknown): ValidationSuccess | ValidationFailure {
  const result = validateRates(input);
  if (!result.ok) return result;
  ensureDataDir();
  const json = `${JSON.stringify(result.value, null, 2)}\n`;
  fs.writeFileSync(ratesTmpFile, json, "utf8");
  fs.renameSync(ratesTmpFile, ratesFile);
  return result;
}
