import nodemailer from "nodemailer";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  authMethod?: "LOGIN" | "PLAIN";
};

function parsePort(raw: string | undefined, fallback: number): number {
  if (raw == null || raw.trim() === "") return fallback;
  const n = Number(raw.trim());
  return Number.isFinite(n) && n > 0 && n <= 65535 ? n : fallback;
}

function parseSecure(raw: string | undefined, port: number): boolean {
  if (raw == null || raw.trim() === "") return port === 465;
  const v = raw.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") return false;
  if (v === "true" || v === "1" || v === "yes") return true;
  return port === 465;
}

/** Trim and remove one matching pair of ASCII quotes (common .env copy/paste issue). */
function stripEnvValue(raw: string): string {
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
  ) {
    s = s.slice(1, -1);
  }
  return s;
}

/** Strip BOM / zero-width chars and line breaks that often sneak in from .env or copy-paste. */
function normalizeCredential(raw: string): string {
  let s = stripEnvValue(raw);
  s = s.replace(/^\uFEFF/, "").replace(/[\u200B-\u200D\uFEFF]/g, "");
  s = s.replace(/\r\n/g, "").replace(/\r/g, "").replace(/\n/g, "");
  return s.trim();
}

function parseAuthMethod(
  raw: string | undefined,
): "LOGIN" | "PLAIN" | undefined {
  const v = raw?.trim().toUpperCase();
  if (v === "LOGIN" || v === "PLAIN") return v;
  return undefined;
}

export function getSmtpConfigFromEnv(): SmtpConfig {
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

export function createSmtpTransport(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    ...(cfg.authMethod ? { authMethod: cfg.authMethod } : {}),
    connectionTimeout: 25_000,
    socketTimeout: 25_000,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
    tls: {
      servername: cfg.host,
    },
    ...(cfg.port === 587 && !cfg.secure ? { requireTLS: true } : {}),
  });
}

function isAuth535(err: unknown): boolean {
  const m = err instanceof Error ? err.message : String(err);
  return /535|incorrect authentication|invalid login|authentication failed|auth failed/i.test(
    m,
  );
}

function configKey(c: SmtpConfig): string {
  return `${c.host}|${c.port}|${c.secure}|${c.user}|${c.authMethod ?? "default"}`;
}

/** Build a small ordered list of auth variants; many shared hosts accept only LOGIN or only full-email / local-part. */
function smtpAuthVariants(base: SmtpConfig): SmtpConfig[] {
  const out: SmtpConfig[] = [];
  const seen = new Set<string>();

  const push = (c: SmtpConfig) => {
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

async function trySendWithVariants(
  variants: SmtpConfig[],
  mail: nodemailer.SendMailOptions,
): Promise<boolean> {
  let last535: unknown;
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

/**
 * Sends mail and, on typical "535" auth failures only, retries other common
 * cPanel/Exim combinations (LOGIN/PLAIN, local-part username). If the account
 * uses 465 but the host expects submission on 587, retries on 587+STARTTLS.
 */
export async function sendMailViaSmtp(
  mail: nodemailer.SendMailOptions,
): Promise<void> {
  const base = getSmtpConfigFromEnv();
  const primary = smtpAuthVariants(base);
  let lastAuthErr: unknown;
  try {
    if (await trySendWithVariants(primary, mail)) return;
  } catch (e) {
    if (!isAuth535(e)) throw e;
    lastAuthErr = e;
  }

  if (base.port === 465 && base.secure) {
    const alt: SmtpConfig = {
      ...base,
      port: 587,
      secure: false,
    };
    const secondary = smtpAuthVariants(alt);
    await trySendWithVariants(secondary, mail);
    return;
  }

  if (lastAuthErr) throw lastAuthErr;
  throw new Error("SMTP authentication failed after all attempts");
}
