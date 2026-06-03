const { createRequire } = require("node:module");
const require = createRequire(__filename);
const nodemailer = require("nodemailer");

function parsePort(raw, fallback) {
  if (raw == null || String(raw).trim() === "") return fallback;
  const n = Number(String(raw).trim());
  return Number.isFinite(n) && n > 0 && n <= 65535 ? n : fallback;
}

function parseSecure(raw, port) {
  if (raw == null || String(raw).trim() === "") return port === 465;
  const v = String(raw).trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") return false;
  if (v === "true" || v === "1" || v === "yes") return true;
  return port === 465;
}

function stripEnvValue(raw) {
  let s = String(raw).trim();
  if (
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
  ) {
    s = s.slice(1, -1);
  }
  return s;
}

function normalizeCredential(raw) {
  let s = stripEnvValue(raw);
  s = s.replace(/^\uFEFF/, "").replace(/[\u200B-\u200D\uFEFF]/g, "");
  s = s.replace(/\r\n/g, "").replace(/\r/g, "").replace(/\n/g, "");
  return s.trim();
}

function parseAuthMethod(raw) {
  const v = raw?.trim().toUpperCase();
  if (v === "LOGIN" || v === "PLAIN") return v;
  return undefined;
}

function getSmtpConfigFromEnv() {
  const host = normalizeCredential(process.env.SMTP_HOST || "mail.ghdhotels.in");
  const port = parsePort(process.env.SMTP_PORT, 465);
  const secure = parseSecure(process.env.SMTP_SECURE, port);
  const user = normalizeCredential(process.env.SMTP_USER || "test@ghdhotels.in");
  const pass = normalizeCredential(process.env.SMTP_PASS || "");
  const authMethod = parseAuthMethod(process.env.SMTP_AUTH_METHOD);

  if (!pass) {
    throw new Error("Missing SMTP_PASS");
  }

  return { host, port, secure, user, pass, authMethod };
}

function createSmtpTransport(cfg) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    ...(cfg.authMethod ? { authMethod: cfg.authMethod } : {}),
    connectionTimeout: 25_000,
    socketTimeout: 25_000,
    auth: { user: cfg.user, pass: cfg.pass },
    tls: { servername: cfg.host },
    ...(cfg.port === 587 && !cfg.secure ? { requireTLS: true } : {}),
  });
}

function isAuth535(err) {
  const m = err instanceof Error ? err.message : String(err);
  return /535|incorrect authentication|invalid login|authentication failed|auth failed/i.test(
    m,
  );
}

function configKey(c) {
  return `${c.host}|${c.port}|${c.secure}|${c.user}|${c.authMethod ?? "default"}`;
}

function smtpAuthVariants(base) {
  const out = [];
  const seen = new Set();

  const push = (c) => {
    const k = configKey(c);
    if (seen.has(k)) return;
    seen.add(k);
    out.push(c);
  };

  const explicitAuth = parseAuthMethod(process.env.SMTP_AUTH_METHOD);
  if (explicitAuth) {
    push({ ...base, authMethod: explicitAuth });
    return out;
  }

  push({ ...base, authMethod: "LOGIN" });
  push({ ...base, authMethod: "PLAIN" });

  const at = base.user.indexOf("@");
  if (at > 0) {
    const local = base.user.slice(0, at);
    push({ ...base, user: local, authMethod: "LOGIN" });
    push({ ...base, user: local, authMethod: "PLAIN" });
  }

  return out;
}

async function trySendWithVariants(variants, mail) {
  let last535;
  for (const cfg of variants) {
    const transport = createSmtpTransport(cfg);
    try {
      await transport.sendMail(mail);
      return true;
    } catch (e) {
      if (!isAuth535(e)) throw e;
      last535 = e;
    }
  }
  if (last535) throw last535;
  return false;
}

async function sendMailViaSmtp(mail) {
  const base = getSmtpConfigFromEnv();
  const primary = smtpAuthVariants(base);
  let lastAuthErr;
  try {
    if (await trySendWithVariants(primary, mail)) return;
  } catch (e) {
    if (!isAuth535(e)) throw e;
    lastAuthErr = e;
  }

  if (base.port === 465 && base.secure) {
    const alt = { ...base, port: 587, secure: false };
    await trySendWithVariants(smtpAuthVariants(alt), mail);
    return;
  }

  if (lastAuthErr) throw lastAuthErr;
  throw new Error("SMTP authentication failed after all attempts");
}

module.exports = { sendMailViaSmtp };
