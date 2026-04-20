/** Base URL for the mail HTTP API (no trailing slash). Empty = same origin. */
export function mailApiBase(): string {
  const raw = import.meta.env.VITE_MAIL_API_URL as string | undefined;
  if (raw == null || raw.trim() === "") return "";
  return raw.trim().replace(/\/$/, "");
}

export function mailApiUrl(path: "/api/contact" | "/api/careers"): string {
  return `${mailApiBase()}${path}`;
}
