/* ============================================================
 * Copilot cache — in-memory TTL cache for serverless functions.
 * ============================================================ */

const TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map();

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export function cacheKey(section, context) {
  return section + ":" + hash(JSON.stringify(context));
}

export function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

export function cacheSet(key, value) {
  cache.set(key, { at: Date.now(), value });
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}
