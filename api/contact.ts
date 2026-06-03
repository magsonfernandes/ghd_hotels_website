import type { VercelRequest, VercelResponse } from "@vercel/node";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const mailbox = String(process.env.MAILBOX || "test@ghdhotels.in").trim();
    const body = (req.body ?? {}) as Body;

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    const subject = `New enquiry from ${name}`;
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    try {
      const { sendMailViaSmtp } = require("./lib/smtp.cjs");
      await sendMailViaSmtp({
        from: mailbox,
        to: mailbox,
        subject,
        text,
        replyTo: email,
      });
    } catch (err) {
      if (err instanceof Error && /Missing SMTP_PASS/i.test(err.message)) {
        return res.status(400).json({ ok: false, error: "Missing SMTP_PASS" });
      }
      const msg =
        err instanceof Error ? err.message : "Failed to send email";
      console.error("[api/contact] send failed:", msg);
      return res.status(500).json({ ok: false, error: msg });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("[api/contact] unhandled:", err);
    return res.status(500).json({ ok: false, error: msg });
  }
}
