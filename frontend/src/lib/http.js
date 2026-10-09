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
