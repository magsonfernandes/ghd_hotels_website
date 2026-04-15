import nodemailer from "nodemailer";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

export function getSmtpConfigFromEnv(): SmtpConfig {
  // Defaults for Gmail SMTP (works with an App Password).
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE ?? (port === 465)).toLowerCase() !== "false";
  const user = process.env.SMTP_USER || "krupashrikoli@gmail.com";
  const pass = process.env.SMTP_PASS || "";

  if (!pass) {
    throw new Error("Missing SMTP_PASS");
  }

  return { host, port, secure, user, pass };
}

export function createSmtpTransport(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });
}

