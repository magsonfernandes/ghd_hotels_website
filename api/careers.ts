import { sendMailViaSmtp } from "../mail/smtp.ts";

function json(status: number, payload: unknown) {
  return Response.json(payload, { status });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const mailbox = String(process.env.MAILBOX || "test@ghdhotels.in").trim();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, { ok: false, error: "Invalid form data" });
  }

  const fullName = String(form.get("fullName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const roleLabel = String(form.get("roleLabel") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const cv = form.get("cv");

  if (!fullName || !email || !roleLabel) {
    return json(400, { ok: false, error: "Missing required fields" });
  }
  if (!(cv instanceof File)) {
    return json(400, { ok: false, error: "Missing CV file" });
  }

  const maxBytes = 10 * 1024 * 1024;
  if (cv.size > maxBytes) {
    return json(400, { ok: false, error: "CV is too large (max 10MB)" });
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
    await sendMailViaSmtp({
      from: mailbox,
      to: mailbox,
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
      return json(400, { ok: false, error: "Missing SMTP_PASS" });
    }
    const msg =
      err instanceof Error ? err.message : "Failed to send email";
    return json(500, { ok: false, error: msg });
  }

  return json(200, { ok: true });
}
