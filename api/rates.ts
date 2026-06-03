import { SEED_RATES } from "./lib/seed-rates.js";
import { nodeRuntime } from "./lib/runtime.js";

export const config = nodeRuntime;

export default function handler(req: Request): Response {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return Response.json({
    ...SEED_RATES,
    updatedAt: new Date().toISOString(),
  });
}
