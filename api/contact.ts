type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

import { createSmtpTransport, getSmtpConfigFromEnv } from "./_smtp";

function badRequest(message: string) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const to = process.env.CONTACT_TO || "ghdhotels@gmail.com";
  const from = process.env.CONTACT_FROM || "krupashrikoli@gmail.com";

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return badRequest("Invalid JSON body");
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return badRequest("Missing required fields");
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
    const cfg = getSmtpConfigFromEnv();
    const transport = createSmtpTransport(cfg);
    await transport.sendMail({
      from,
      to,
      subject,
      text,
      replyTo: email,
    });
  } catch (err) {
    if (err instanceof Error && /Missing SMTP_PASS/i.test(err.message)) {
      return badRequest("Missing SMTP_PASS");
    }
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Failed to send email";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

