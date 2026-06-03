const nodemailer = require("nodemailer");

const MAIL_CANONICAL_HOST = "mail.ghdhotels.in";
const DEFAULT_SMTP_CONNECT_HOST = "d16211.bom1.stableserver.net";

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

function resolveSmtpConnectHost(requestedHost) {
  const tlsServername =
    normalizeCredential(process.env.SMTP_TLS_SERVERNAME || "") ||
    MAIL_CANONICAL_HOST;
  const connectOverride = normalizeCredential(
    process.env.SMTP_CONNECT_HOST || "",
  );
  if (connectOverride) {
    return { connectHost: connectOverride, tlsServername };
  }
  if (requestedHost === MAIL_CANONICAL_HOST) {
    const fallback =
      normalizeCredential(process.env.SMTP_HOST_FALLBACK || "") ||
      DEFAULT_SMTP_CONNECT_HOST;
    return { connectHost: fallback, tlsServername };
  }
  return { connectHost: requestedHost, tlsServername };
}

function getSmtpConfigFromEnv() {
  const requestedHost = normalizeCredential(
    process.env.SMTP_HOST || MAIL_CANONICAL_HOST,
  );
  const { connectHost, tlsServername } = resolveSmtpConnectHost(requestedHost);
  const port = parsePort(process.env.SMTP_PORT, 465);
  const secure = parseSecure(process.env.SMTP_SECURE, port);
  const user = normalizeCredential(process.env.SMTP_USER || "test@ghdhotels.in");
  const pass = normalizeCredential(process.env.SMTP_PASS || "");
  const authMethod = parseAuthMethod(process.env.SMTP_AUTH_METHOD);

  if (!pass) {
    throw new Error("Missing SMTP_PASS");
  }

  return {
    host: connectHost,
    port,
    secure,
    user,
    pass,
    authMethod,
    tlsServername,
  };
}

const SMTP_CONNECT_MS = 10_000;
const SMTP_ATTEMPT_MS = 14_000;

function errCode(err) {
  if (err && typeof err === "object" && "code" in err) {
    return String(err.code);
  }
  return "";
}

function isConnectionError(err) {
  const m = err instanceof Error ? err.message : String(err);
  const code = errCode(err);
  return /ETIMEDOUT|ECONNREFUSED|ECONNRESET|ESOCKET|ETIMEOUT|ENOTFOUND|EHOSTUNREACH|ECONNABORTED|timed out|timeout/i.test(
    `${code} ${m}`,
  );
}

async function sendMailAttempt(transport, mail) {
  let timer;
  try {
    await Promise.race([
      transport.sendMail(mail),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          transport.close();
          reject(
            new Error(`SMTP timed out after ${SMTP_ATTEMPT_MS / 1000}s`),
          );
        }, SMTP_ATTEMPT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function connectionErrorMessage(cfg, err) {
  const detail = err instanceof Error ? err.message : String(err);
  return (
    `Cannot reach mail server ${cfg.host}:${cfg.port} (${detail}). ` +
    `Check SMTP_CONNECT_HOST / SMTP_HOST and outbound SMTP from this server.`
  );
}

function createSmtpTransport(cfg) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    ...(cfg.authMethod ? { authMethod: cfg.authMethod } : {}),
    connectionTimeout: SMTP_CONNECT_MS,
    greetingTimeout: SMTP_CONNECT_MS,
    socketTimeout: SMTP_CONNECT_MS,
    auth: { user: cfg.user, pass: cfg.pass },
    tls: { servername: cfg.tlsServername },
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
  return `${c.host}|${c.tlsServername}|${c.port}|${c.secure}|${c.user}|${c.authMethod ?? "default"}`;
}

function authFailureMessage(err) {
  const detail = err instanceof Error ? err.message : String(err);
  return (
    `SMTP login failed (${detail}). Verify SMTP_USER and SMTP_PASS in .env match ` +
    `the mailbox password in your hosting panel (Email Accounts). Quote passwords that contain #.`
  );
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

  const at = base.user.indexOf("@");
  if (at > 0) {
    const local = base.user.slice(0, at);
    push({ ...base, user: local, authMethod: "LOGIN" });
  }

  return out;
}

async function trySendWithVariants(variants, mail) {
  let last535;
  for (const cfg of variants) {
    const transport = createSmtpTransport(cfg);
    try {
      await sendMailAttempt(transport, mail);
      return true;
    } catch (e) {
      if (isConnectionError(e)) {
        throw new Error(connectionErrorMessage(cfg, e));
      }
      if (!isAuth535(e)) throw e;
      last535 = e;
    }
  }
  if (last535) throw new Error(authFailureMessage(last535));
  return false;
}

async function sendMailViaSmtp(mail) {
  const base = getSmtpConfigFromEnv();
  const primary = smtpAuthVariants(base);
  let lastAuthErr;
  try {
    if (await trySendWithVariants(primary, mail)) return;
  } catch (e) {
    if (isConnectionError(e)) throw e;
    if (!isAuth535(e)) throw e;
    lastAuthErr = e;
  }

  if (base.port === 465 && base.secure) {
    const alt = { ...base, port: 587, secure: false };
    await trySendWithVariants(smtpAuthVariants(alt), mail);
    return;
  }

  if (lastAuthErr) throw new Error(authFailureMessage(lastAuthErr));
  throw new Error("SMTP authentication failed after all attempts");
}

module.exports = { sendMailViaSmtp };
