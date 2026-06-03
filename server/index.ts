import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { sendMailViaSmtp } from "../lib/smtp.ts";
import { loadRates, saveRates } from "./rates.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env.local"), override: true });
const distDir = path.join(repoRoot, "src/frontend/dist");

const mailbox = String(process.env.MAILBOX || "test@ghdhotels.in").trim();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const app = express();
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.trim() !== ""
        ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
        : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "256kb" }));

app.get("/api/health", (_req, res) => {
  return res.status(200).json({ ok: true });
});

// ─── Rates API (public read + admin write) ───────────────────────────
const adminTokenEnv = (): string => String(process.env.ADMIN_TOKEN || "").trim();

function timingSafeStringEquals(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  // crypto.timingSafeEqual requires equal length; pad shorter to equal length.
  const len = Math.max(aBuf.length, bBuf.length, 1);
  const aPadded = Buffer.alloc(len, 0);
  const bPadded = Buffer.alloc(len, 0);
  aBuf.copy(aPadded);
  bBuf.copy(bPadded);
  const eq = crypto.timingSafeEqual(aPadded, bPadded);
  return eq && aBuf.length === bBuf.length;
}

function requireAdmin(
  req: express.Request,
  res: express.Response,
): boolean {
  const token = adminTokenEnv();
  if (!token) {
    res.status(503).json({ error: "ADMIN_TOKEN not configured" });
    return false;
  }
  const auth = String(req.headers.authorization || "");
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  const provided = m?.[1]?.trim() ?? "";
  if (!provided || !timingSafeStringEquals(provided, token)) {
    res.status(401).json({ error: "Invalid or missing token" });
    return false;
  }
  return true;
}

// Tiny in-memory rate limiter: 30 requests / 60s / IP.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;

function rateLimitWrite(
  req: express.Request,
  res: express.Response,
): boolean {
  const now = Date.now();
  const ip = String(req.ip || req.socket?.remoteAddress || "unknown");
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_MAX) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({ error: "Too many requests" });
    return false;
  }
  bucket.count += 1;
  return true;
}

app.get("/api/rates", (_req, res) => {
  try {
    return res.status(200).json(loadRates());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load rates";
    return res.status(500).json({ error: msg });
  }
});

app.get("/api/admin/rates", (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    return res.status(200).json(loadRates());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load rates";
    return res.status(500).json({ error: msg });
  }
});

app.put("/api/admin/rates", (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!rateLimitWrite(req, res)) return;
  try {
    const result = saveRates(req.body);
    if (!result.ok) {
      return res.status(400).json({ error: result.error, details: result.details });
    }
    return res.status(200).json(result.value);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save rates";
    return res.status(500).json({ error: msg });
  }
});

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
  // Ensure data/rates.json exists (and is valid) before serving traffic.
  try {
    loadRates();
  } catch (err) {
    console.warn("[rates] Initial load failed", err);
  }
  console.log(`Mail + site server listening on http://127.0.0.1:${port}`);
  if (!adminTokenEnv()) {
    console.warn(
      "[rates] ADMIN_TOKEN is not set — /api/admin/rates will respond with 503.",
    );
  }
  if (!fs.existsSync(distDir)) {
    console.warn(
      `No frontend build at ${distDir}. Run: pnpm --filter @caffeine/template-frontend build`,
    );
  }
});
