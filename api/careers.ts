import { createSmtpTransport, getSmtpConfigFromEnv } from "./_smtp";

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function badRequest(message: string) {
  return json(400, { ok: false, error: message });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const to = process.env.CAREERS_TO || "ghdhotels@gmail.com";
  const from =
    process.env.CAREERS_FROM ||
    process.env.CONTACT_FROM ||
    "krupashrikoli@gmail.com";

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return badRequest("Invalid form data");
  }

  const fullName = String(form.get("fullName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const roleLabel = String(form.get("roleLabel") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const cv = form.get("cv");

  if (!fullName || !email || !roleLabel) {
    return badRequest("Missing required fields");
  }
  if (!(cv instanceof File)) {
    return badRequest("Missing CV file");
  }

  // Keep this conservative to avoid oversized function payloads / email bloat.
  const maxBytes = 10 * 1024 * 1024; // 10MB
  if (cv.size > maxBytes) {
    return badRequest("CV is too large (max 10MB)");
  }

  const filename = cv.name || "cv";
  const contentType = cv.type || undefined;

  const subject = `New career application: ${roleLabel} — ${fullName}`;
  const text = [
    `Role: ${roleLabel}`,
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    "",
    "Message:",
    message || "Not provided",
    "",
    `CV: ${filename}${contentType ? ` (${contentType})` : ""}`,
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
      attachments: [
        {
          filename,
          content: Buffer.from(await cv.arrayBuffer()),
          contentType,
        },
      ],
    });
  } catch (err) {
    if (err instanceof Error && /Missing SMTP_PASS/i.test(err.message)) {
      return badRequest("Missing SMTP_PASS");
    }
    // Surface SMTP failures to speed up configuration/debugging.
    // Examples: "Invalid login", "Connection timeout", "Blocked by network", etc.
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Failed to send email";
    return json(500, { ok: false, error: msg });
  }

  return json(200, { ok: true });
}

