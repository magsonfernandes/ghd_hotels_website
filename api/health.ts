import type { VercelRequest, VercelResponse } from "@vercel/node";

function smtpPassConfigured(): boolean {
  const pass = String(process.env.SMTP_PASS ?? "").trim();
  return pass.length > 0 && pass !== "__SET_THIS_ON_THE_SERVER__";
}

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    smtpConfigured: smtpPassConfigured(),
  });
}
