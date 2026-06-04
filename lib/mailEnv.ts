import fs from "node:fs";
import path from "node:path";

const PLACEHOLDER = "__SET_THIS_ON_THE_SERVER__";

export function isSmtpPassConfigured(): boolean {
  const pass = String(process.env.SMTP_PASS ?? "").trim();
  return pass.length > 0 && pass !== PLACEHOLDER;
}

export function missingSmtpPassHint(options?: {
  platform: "vercel" | "node";
  envFilePath?: string;
  envFileExists?: boolean;
}): string {
  const platform = options?.platform ?? (process.env.VERCEL ? "vercel" : "node");

  if (platform === "vercel") {
    return (
      "SMTP_PASS is not set on Vercel. Open Vercel → Project → Settings → Environment Variables, " +
      "add SMTP_PASS (and MAILBOX, SMTP_HOST, SMTP_PORT=465, SMTP_SECURE=true, SMTP_USER) for Production, " +
      "then Redeploy. Use quotes in .env only; in the Vercel UI paste the password as one value."
    );
  }

  const envPath = options?.envFilePath ?? ".env";
  const exists = options?.envFileExists ?? false;
  if (!exists) {
    return (
      `No SMTP password in the process environment and no ${envPath} file was found at app startup. ` +
      `On the server: copy .env.example to ${envPath} in the project root (same folder as package.json), set SMTP_PASS="your-mailbox-password", restart pnpm start. ` +
      `If using systemd/PM2, you can instead set Environment=SMTP_PASS=... in the unit file.`
    );
  }

  return (
    `${envPath} exists but SMTP_PASS is empty or still the placeholder. Set SMTP_PASS="your-mailbox-password" ` +
    `(quote the value if it contains #) and restart the Node app (pnpm start).`
  );
}

export function mailHealthPayload(repoRoot?: string): Record<string, unknown> {
  const platform = process.env.VERCEL ? "vercel" : "node";
  const smtpConfigured = isSmtpPassConfigured();
  const payload: Record<string, unknown> = {
    ok: true,
    platform,
    smtpConfigured,
  };

  if (repoRoot) {
    const envPath = path.join(repoRoot, ".env");
    payload.envFile = envPath;
    payload.envFileExists = fs.existsSync(envPath);
  }

  if (!smtpConfigured) {
    payload.hint = missingSmtpPassHint({
      platform: platform as "vercel" | "node",
      envFilePath: repoRoot ? path.join(repoRoot, ".env") : ".env",
      envFileExists: repoRoot ? fs.existsSync(path.join(repoRoot, ".env")) : undefined,
    });
  }

  return payload;
}
