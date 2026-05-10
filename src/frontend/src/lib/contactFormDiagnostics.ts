const BODY_SNIP = 600;

function tryParseJson(raw: string): { ok?: boolean; error?: string } | null {
  const t = raw.trim();
  if (!t.startsWith("{") && !t.startsWith("[")) return null;
  try {
    return JSON.parse(t) as { ok?: boolean; error?: string };
  } catch {
    return null;
  }
}

function looksLikeHtml(raw: string, contentType: string): boolean {
  const ct = contentType.toLowerCase();
  if (ct.includes("text/html")) return true;
  const head = raw.slice(0, 80).toLowerCase();
  return head.includes("<!doctype") || head.includes("<html");
}

/** Human-readable + technical lines for support / debugging. */
export function formatContactSubmitFailure(input: {
  requestUrl: string;
  response: Response;
  rawBody: string;
}): string {
  const { requestUrl, response, rawBody } = input;
  const ct = response.headers.get("content-type") || "";
  const parsed = tryParseJson(rawBody);
  const lines: string[] = [];

  lines.push(`POST ${requestUrl}`);
  lines.push(`HTTP ${response.status} ${response.statusText}`.trim());

  if (parsed?.error) {
    lines.push(`API: ${parsed.error}`);
  }

  if (looksLikeHtml(rawBody, ct)) {
    lines.push(
      "The response was HTML (your website page), not the JSON mail API. The server is not routing POST /api/contact to the Node mail server—fix reverse proxy / deployment, or set VITE_MAIL_API_URL to the API base URL during build.",
    );
    const oneLine = rawBody.replace(/\s+/g, " ").trim().slice(0, BODY_SNIP);
    if (oneLine) lines.push(`HTML snippet: ${oneLine}${rawBody.length > BODY_SNIP ? "…" : ""}`);
  } else if (!parsed?.error && rawBody.trim()) {
    lines.push(
      `Body: ${rawBody.trim().slice(0, BODY_SNIP)}${rawBody.length > BODY_SNIP ? "…" : ""}`,
    );
  }

  if (response.status === 405) {
    lines.push(
      "405 often means the host only serves static files and rejects POST on /api/contact.",
    );
  }
  if (response.status === 404) {
    lines.push("404: /api/contact not found on this host.");
  }
  if (response.status === 502 || response.status === 504) {
    lines.push("Bad gateway / timeout: proxy cannot reach the app or the app hung (e.g. SMTP connect stall).");
  }

  return lines.join("\n");
}

export function formatContactFetchFailure(requestUrl: string, err: unknown): string {
  const name = err instanceof Error ? err.name : "Error";
  const msg = err instanceof Error ? err.message : String(err);
  const lines = [`POST ${requestUrl}`, `${name}: ${msg}`];
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    lines.push(
      "The browser could not reach the server (offline, wrong URL, mixed HTTP/HTTPS, CORS, or blocked request).",
    );
  }
  return lines.join("\n");
}

export function parseContactResponseJson(
  rawBody: string,
  contentType: string,
): { ok?: boolean; error?: string } | null {
  const ct = contentType.toLowerCase();
  if (ct.includes("application/json") || rawBody.trim().startsWith("{")) {
    return tryParseJson(rawBody);
  }
  return null;
}
