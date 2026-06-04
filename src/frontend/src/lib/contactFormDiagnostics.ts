function tryParseJson(raw: string): { ok?: boolean; error?: string; hint?: string } | null {
  const t = raw.trim();
  if (!t.startsWith("{") && !t.startsWith("[")) return null;
  try {
    return JSON.parse(t) as { ok?: boolean; error?: string; hint?: string };
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

  if (parsed?.error) lines.push(`API: ${parsed.error}`);
  if (parsed?.hint?.trim()) lines.push(parsed.hint.trim());

  if (looksLikeHtml(rawBody, ct)) {
    lines.push(
      "The response was HTML, not the mail API. Ensure POST /api/contact is proxied to the Node server or set VITE_MAIL_API_URL.",
    );
  }

  return lines.join("\n");
}

export function formatContactFetchFailure(requestUrl: string, err: unknown): string {
  const name = err instanceof Error ? err.name : "Error";
  const msg = err instanceof Error ? err.message : String(err);
  const lines = [`POST ${requestUrl}`, `${name}: ${msg}`];
  if (name === "AbortError" || /aborted/i.test(msg)) {
    lines.push("The request timed out before the server responded.");
  } else if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    lines.push("The browser could not reach the server.");
  }
  return lines.join("\n");
}

export function parseContactResponseJson(
  rawBody: string,
  contentType: string,
): { ok?: boolean; error?: string; hint?: string } | null {
  const ct = contentType.toLowerCase();
  if (ct.includes("application/json") || rawBody.trim().startsWith("{")) {
    return tryParseJson(rawBody);
  }
  return null;
}
