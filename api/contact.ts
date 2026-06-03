import { sendMailViaSmtp } from "./lib/smtp";
import { nodeRuntime } from "./lib/runtime";

export const config = nodeRuntime;

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

function json(status: number, payload: unknown) {
  return Response.json(payload, { status });
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== "POST") {
      return json(405, { ok: false, error: "Method not allowed" });
    }

    const mailbox = String(process.env.MAILBOX || "test@ghdhotels.in").trim();

    let body: Body;
    try {
      body = (await req.json()) as Body;
    } catch {
      return json(400, { ok: false, error: "Invalid JSON body" });
    }

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !message) {
      return json(400, { ok: false, error: "Missing required fields" });
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
      await sendMailViaSmtp({
        from: mailbox,
        to: mailbox,
        subject,
        text,
        replyTo: email,
      });
    } catch (err) {
      if (err instanceof Error && /Missing SMTP_PASS/i.test(err.message)) {
        return json(400, { ok: false, error: "Missing SMTP_PASS" });
      }
      const msg =
        err instanceof Error ? err.message : "Failed to send email";
      console.error("[api/contact] send failed:", msg);
      return json(500, { ok: false, error: msg });
    }

    return json(200, { ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("[api/contact] unhandled:", err);
    return json(500, { ok: false, error: msg });
  }
}
