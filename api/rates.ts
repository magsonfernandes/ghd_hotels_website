import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SEED_RATES } from "./lib/seed-rates";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  if (_req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({
    ...SEED_RATES,
    updatedAt: new Date().toISOString(),
  });
}
