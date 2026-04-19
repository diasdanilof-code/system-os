/* ============================================================
 * Sheets Sync — background push to Google Apps Script Web App.
 * ============================================================ */

const SYNC_URL = "https://script.google.com/macros/s/AKfycbwnUjeoHQlqX8FBJMZSvawEPZ_h-YFnlQBWkTyveO0vkkRr4Y3cMmEIy032jAzHjSzH/exec";
const QUEUE_KEY = "systemos.sync.queue.v1";
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

export function initSync(tables) {
  if (typeof window === "undefined") return;
  if (hooked) return;
  hooked = true;

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
    window.addEventListener("online", process);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") process();
    });
    setTimeout(process, 1000);
  }
}

export function syncRow(table, data) {
  if (!data || !data.id) return;
  queueRow(table, data);
  process();
}

export function flushSync() {
  return process();
}

export function pendingCount() {
  return loadQueue().length;
}

function queueRow(table, data) {
  const stamped = { ...data, updatedAt: data.updatedAt || new Date().toISOString() };
  const q = loadQueue();
  const filtered = q.filter((e) => !(e.table === table && e.data.id === stamped.id));
  filtered.push({ table, data: stamped });
  saveQueue(filtered);
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
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  const queue = loadQueue();
  if (queue.length === 0) return;

  processing = true;
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

    if (remaining.length > 0) setTimeout(process, 500);
  } catch (err) {
    console.warn("[sheetsSync] push failed, will retry:", err.message || err);
  } finally {
    processing = false;
  }
}
