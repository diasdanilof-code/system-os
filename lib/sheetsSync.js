/* ============================================================
 * Sheets Sync v2 — bi-directional sync with Google Apps Script.
 *
 *   • PUSH: explicit per-write (syncRow) + queued batch every 15s
 *   • PULL: pullAll() — used on hydrate when IDB is empty
 *   • STATUS: subscribeSync(fn) — emits { status, pending } so
 *            UI can render a sync indicator
 *
 * Why v2 exists:
 *   Safari iOS evicts IndexedDB for PWAs under storage pressure.
 *   Without pull, the app opens empty. Now Sheets is source of
 *   truth when local IDB is empty or clearly behind.
 * ============================================================ */

const SYNC_URL = "https://script.google.com/macros/s/AKfycbwnUjeoHQlqX8FBJMZSvawEPZ_h-YFnlQBWkTyveO0vkkRr4Y3cMmEIy032jAzHjSzH/exec";
const QUEUE_KEY = "systemos.sync.queue.v1";
const LAST_PULL_KEY = "systemos.sync.lastPull.v1";
const PROCESS_INTERVAL_MS = 15000;

const TABLE_MAP = {
  protocol: "protocol",
  entries: "entries",
  interventions: "interventions",
  labs: "labs",
  bodyComp: "bodyComp",
  supplements: "supplements",
  weeklySummaries: "weeklySummaries",
};

let timer = null;
let processing = false;
let hooked = false;
let status = "idle"; // idle | syncing | offline | error
const listeners = new Set();

function emit() {
  const snapshot = { status, pending: loadQueue().length };
  listeners.forEach((fn) => { try { fn(snapshot); } catch {} });
}

export function subscribeSync(fn) {
  listeners.add(fn);
  emit();
  return () => listeners.delete(fn);
}

export function initSync(tables) {
  if (typeof window === "undefined") return;
  if (hooked) return;
  hooked = true;

  // Legacy Dexie hooks (belt-and-suspenders — explicit syncRow is
  // now the primary path from repository methods).
  Object.keys(TABLE_MAP).forEach((tableName) => {
    const t = tables[tableName];
    if (!t || !t.hook) return;
    try {
      t.hook("creating", (primKey, obj) => {
        queueRow(TABLE_MAP[tableName], obj);
      });
      t.hook("updating", (mods, primKey, obj) => {
        queueRow(TABLE_MAP[tableName], { ...obj, ...mods });
      });
    } catch {}
  });

  if (!timer) {
    timer = setInterval(process, PROCESS_INTERVAL_MS);
    window.addEventListener("online", () => { status = "idle"; emit(); process(); });
    window.addEventListener("offline", () => { status = "offline"; emit(); });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") process();
    });
    setTimeout(process, 1000);
  }
}

/**
 * Explicit push — called from repository methods right after a
 * local IDB write. Does not depend on Dexie hooks (which are
 * unreliable after Safari tab eviction).
 */
export function syncRow(table, data) {
  if (!data || !data.id) return;
  queueRow(table, data);
  process(); // drain right away
}

export function flushSync() {
  return process();
}

export function pendingCount() {
  return loadQueue().length;
}

/**
 * PULL — fetch every table from Apps Script `dump` endpoint.
 * Returns { ok: boolean, data?: { protocol:[], entries:[], ... } }
 */
export async function pullAll({ timeoutMs = 20000 } = {}) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: false, error: "offline" };
  }
  status = "syncing"; emit();
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(SYNC_URL + "?action=dump", {
      method: "GET",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const json = JSON.parse(text);
    if (!json.ok) throw new Error(json.error || "dump failed");
    try {
      localStorage.setItem(LAST_PULL_KEY, new Date().toISOString());
    } catch {}
    status = "idle"; emit();
    return { ok: true, data: json.data };
  } catch (err) {
    status = "error"; emit();
    console.warn("[sheetsSync] pull failed:", err.message || err);
    return { ok: false, error: String(err.message || err) };
  } finally {
    clearTimeout(timerId);
  }
}

export function lastPullAt() {
  try { return localStorage.getItem(LAST_PULL_KEY); } catch { return null; }
}

function queueRow(table, data) {
  const stamped = { ...data, updatedAt: data.updatedAt || new Date().toISOString() };
  const q = loadQueue();
  const filtered = q.filter((e) => !(e.table === table && e.data.id === stamped.id));
  filtered.push({ table, data: stamped });
  saveQueue(filtered);
  emit();
}

function loadQueue() {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(q) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch {}
}

async function process() {
  if (processing) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    status = "offline"; emit();
    return;
  }
  const queue = loadQueue();
  if (queue.length === 0) {
    if (status !== "idle") { status = "idle"; emit(); }
    return;
  }

  processing = true;
  status = "syncing"; emit();
  try {
    const batch = queue.slice(0, 10);
    const res = await fetch(SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ rows: batch }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const json = JSON.parse(text);
    if (!json.ok) throw new Error(json.error || "unknown");

    const remaining = queue.filter(
      (q) => !batch.some((b) => b.table === q.table && b.data.id === q.data.id)
    );
    saveQueue(remaining);

    if (remaining.length > 0) {
      setTimeout(process, 500);
    } else {
      status = "idle"; emit();
    }
  } catch (err) {
    console.warn("[sheetsSync] push failed, will retry:", err.message || err);
    status = "error"; emit();
  } finally {
    processing = false;
  }
}
