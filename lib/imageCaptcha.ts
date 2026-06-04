import crypto from "node:crypto";

const CAPTCHA_LENGTH = 5;
const TTL_MS = 10 * 60 * 1000;

function captchaSecret(): string {
  const fromEnv = process.env.CAPTCHA_SECRET?.trim();
  if (fromEnv) return fromEnv;
  const smtp = process.env.SMTP_PASS?.trim();
  if (smtp) return smtp;
  return "ghd-contact-captcha-dev-only";
}

function signPayload(payloadB64: string): string {
  return crypto
    .createHmac("sha256", captchaSecret())
    .update(payloadB64)
    .digest("base64url");
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function randomBetween(min: number, max: number): number {
  return crypto.randomInt(min, max + 1);
}

function renderCaptchaSvg(code: string): string {
  const width = 200;
  const height = 60;
  const chars = [...code];

  const noiseLines = Array.from({ length: 7 }, () => {
    const x1 = randomBetween(0, width);
    const y1 = randomBetween(0, height);
    const x2 = randomBetween(0, width);
    const y2 = randomBetween(0, height);
    const opacity = (randomBetween(15, 35) / 100).toFixed(2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(184,151,90,${opacity})" stroke-width="1"/>`;
  }).join("");

  const noiseDots = Array.from({ length: 40 }, () => {
    const cx = randomBetween(0, width);
    const cy = randomBetween(0, height);
    const r = randomBetween(1, 2);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,0.12)"/>`;
  }).join("");

  const digits = chars
    .map((ch, i) => {
      const x = 22 + i * 34 + randomBetween(-4, 4);
      const y = 40 + randomBetween(-5, 5);
      const rotate = randomBetween(-22, 22);
      const gold = randomBetween(150, 210);
      return `<text x="${x}" y="${y}" fill="rgb(${gold},${gold - 40},${gold - 90})" font-size="28" font-family="ui-monospace, Menlo, monospace" font-weight="700" transform="rotate(${rotate} ${x} ${y})">${escapeXml(ch)}</text>`;
    })
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#12100e"/>
  ${noiseLines}
  ${noiseDots}
  ${digits}
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

/** Issue a new numeric image CAPTCHA. */
export function createImageCaptcha(): {
  token: string;
  imageDataUrl: string;
} {
  const digits = Array.from({ length: CAPTCHA_LENGTH }, () =>
    String(crypto.randomInt(0, 10)),
  ).join("");
  const exp = Date.now() + TTL_MS;
  const payloadB64 = Buffer.from(`${digits}:${exp}`, "utf8").toString("base64url");
  const token = `${payloadB64}.${signPayload(payloadB64)}`;
  const imageDataUrl = renderCaptchaSvg(digits);
  return { token, imageDataUrl };
}

/** Verify user-entered digits against a signed captcha token. */
export function verifyImageCaptcha(
  token: string,
  answer: string,
): { ok: true } | { ok: false; error: string } {
  const trimmedToken = token.trim();
  const normalizedAnswer = answer.replace(/\D/g, "");

  if (!trimmedToken) {
    return { ok: false, error: "CAPTCHA expired. Please refresh and try again." };
  }
  if (!normalizedAnswer) {
    return { ok: false, error: "Enter the numbers shown in the image." };
  }

  const dot = trimmedToken.indexOf(".");
  if (dot <= 0) {
    return { ok: false, error: "Invalid CAPTCHA. Please refresh and try again." };
  }

  const payloadB64 = trimmedToken.slice(0, dot);
  const sig = trimmedToken.slice(dot + 1);
  const expectedSig = signPayload(payloadB64);
  if (!timingSafeEqual(sig, expectedSig)) {
    return { ok: false, error: "Invalid CAPTCHA. Please refresh and try again." };
  }

  let decoded: string;
  try {
    decoded = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return { ok: false, error: "Invalid CAPTCHA. Please refresh and try again." };
  }

  const colon = decoded.indexOf(":");
  if (colon <= 0) {
    return { ok: false, error: "Invalid CAPTCHA. Please refresh and try again." };
  }

  const expectedDigits = decoded.slice(0, colon);
  const exp = Number(decoded.slice(colon + 1));
  if (!Number.isFinite(exp) || Date.now() > exp) {
    return { ok: false, error: "CAPTCHA expired. Please refresh and try again." };
  }

  if (normalizedAnswer !== expectedDigits) {
    return {
      ok: false,
      error: "The numbers do not match the image. Please try again.",
    };
  }

  return { ok: true };
}

export const IMAGE_CAPTCHA_LENGTH = CAPTCHA_LENGTH;
