import { Resend } from "resend";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return badRequest("Missing RESEND_API_KEY");

  const to = process.env.CONTACT_TO || "info@ghdhotels.in";
  const from = process.env.CONTACT_FROM;
  if (!from) return badRequest("Missing CONTACT_FROM");

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

  const resend = new Resend(apiKey);
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
    await resend.emails.send({
      from,
      to,
      subject,
      text,
      replyTo: email,
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Failed to send email" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

