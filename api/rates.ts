import { SEED_RATES } from "../server/rates.ts";

export default function handler(req: Request): Response {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return Response.json({
    ...SEED_RATES,
    updatedAt: new Date().toISOString(),
  });
}
