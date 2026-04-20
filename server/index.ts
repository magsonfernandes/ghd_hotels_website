import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { sendMailViaSmtp } from "../mail/smtp.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env.local"), override: true });
const distDir = path.join(repoRoot, "src/frontend/dist");

const mailbox = "test@ghdhotels.in";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "256kb" }));

app.post("/api/contact", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim();
  const phone = String(req.body?.phone ?? "").trim();
  const message = String(req.body?.message ?? "").trim();

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
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Failed to send email";
    return res.status(500).json({ ok: false, error: msg });
  }

  return res.status(200).json({ ok: true });
});

app.post("/api/careers", upload.single("cv"), async (req, res) => {
  const fullName = String(req.body?.fullName ?? "").trim();
  const email = String(req.body?.email ?? "").trim();
  const phone = String(req.body?.phone ?? "").trim();
  const roleLabel = String(req.body?.roleLabel ?? "").trim();
  const message = String(req.body?.message ?? "").trim();
  const cv = req.file;

  if (!fullName || !email || !roleLabel) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }
  if (!cv?.buffer) {
    return res.status(400).json({ ok: false, error: "Missing CV file" });
  }

  const filename = cv.originalname || "cv";
  const contentType = cv.mimetype || undefined;

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
          content: cv.buffer,
          contentType,
        },
      ],
    });
  } catch (err) {
    if (err instanceof Error && /Missing SMTP_PASS/i.test(err.message)) {
      return res.status(400).json({ ok: false, error: "Missing SMTP_PASS" });
    }
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Failed to send email";
    return res.status(500).json({ ok: false, error: msg });
  }

  return res.status(200).json({ ok: true });
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distDir, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

const port = Number(process.env.PORT || 8788);
app.listen(port, () => {
  console.log(`Mail + site server listening on http://127.0.0.1:${port}`);
  if (!fs.existsSync(distDir)) {
    console.warn(
      `No frontend build at ${distDir}. Run: pnpm --filter @caffeine/template-frontend build`,
    );
  }
});
