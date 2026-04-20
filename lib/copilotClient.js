/* ============================================================
 * Copilot client — browser-side fetcher for /api/copilot/* routes.
 * Falls back to { ok: false } so UI can use deterministic output.
 *
 * v3 (2026-04-20): added "strategist" section (multi-horizon council).
 * ============================================================ */

const SECTION_ROUTES = {
  brief: "/api/copilot/brief",
  tomorrow: "/api/copilot/tomorrow",
  rootCause: "/api/copilot/root-cause",
  weekly: "/api/copilot/weekly",
  experiment: "/api/copilot/experiment",
  patterns: "/api/copilot/patterns",
  strategist: "/api/copilot/strategist",
};

// Per-section client-side timeouts. Strategist is denser → longer.
const SECTION_TIMEOUTS = {
  strategist: 26000,
};
const DEFAULT_TIMEOUT_MS = 18000;

export async function fetchCopilot(section, context, { timeoutMs } = {}) {
  const url = SECTION_ROUTES[section];
  if (!url) return { ok: false, error: "unknown section: " + section };

  const effectiveTimeout = timeoutMs ?? SECTION_TIMEOUTS[section] ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), effectiveTimeout);

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
