/* ============================================================
 * Copilot client — browser-side fetcher for /api/copilot/* routes.
 * Falls back to { ok: false } so UI can use deterministic output.
 * ============================================================ */

const SECTION_ROUTES = {
  brief: "/api/copilot/brief",
  tomorrow: "/api/copilot/tomorrow",
  rootCause: "/api/copilot/root-cause",
  weekly: "/api/copilot/weekly",
  experiment: "/api/copilot/experiment",
  patterns: "/api/copilot/patterns",
};

export async function fetchCopilot(section, context, { timeoutMs = 18000 } = {}) {
  const url = SECTION_ROUTES[section];
  if (!url) return { ok: false, error: "unknown section: " + section };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
      signal: controller.signal,
    });
    const json = await res.json();
    return json;
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  } finally {
    clearTimeout(timer);
  }
}
