// Parse a JSON body without throwing on proxy error pages (e.g. an nginx 502 HTML page).
// Returns null when the body is not JSON.
export async function readJson(response) {
  try {
    const text = await response.text();
    const type = response.headers.get("content-type") || "";
    const trimmed = text.trimStart();
    if (!type.includes("application/json") && !trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
    return trimmed ? JSON.parse(trimmed) : null;
  } catch {
    return null;
  }
}

export const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "/backend";

// One fetch path for every API module: timeout, JSON (or FormData) body, optional auth token, safe parsing.
// Never throws — network errors and timeouts resolve to { ok: false, status: 0, error }.
export async function request(url, { method = "GET", json, formData, token, timeout = 10000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const headers = formData ? undefined : { "Content-Type": "application/json", ...(token && { Authorization: `Token ${token}` }) };
    const body = formData ?? (json === undefined ? undefined : JSON.stringify(json));
    const response = await fetch(url, { method, signal: controller.signal, headers, body });
    return { ok: response.ok, status: response.status, body: await readJson(response) };
  } catch (error) {
    return { ok: false, status: 0, body: null, error };
  } finally {
    clearTimeout(timer);
  }
}

// Log text for a failed request: the network error, or the HTTP status.
export const failure = (result) => result.error?.message ?? `HTTP error! Status: ${result.status}`;
