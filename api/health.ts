import type { VercelRequest, VercelResponse } from "@vercel/node";

function smtpPassConfigured(): boolean {
  const pass = String(process.env.SMTP_PASS ?? "").trim();
  return pass.length > 0 && pass !== "__SET_THIS_ON_THE_SERVER__";
}

function missingSmtpPassHint(): string {
  return (
    "SMTP_PASS is not set on Vercel. Open Vercel → Project → Settings → Environment Variables, " +
    "add SMTP_PASS (and MAILBOX, SMTP_HOST, SMTP_PORT=465, SMTP_SECURE=true, SMTP_USER) for Production, " +
    "then Redeploy."
  );
}

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const smtpConfigured = smtpPassConfigured();
  res.status(200).json({
    ok: true,
    platform: "vercel",
    smtpConfigured,
    ...(smtpConfigured ? {} : { hint: missingSmtpPassHint() }),
  });
}
