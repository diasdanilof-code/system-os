import { tables, PROTOCOL_SINGLETON_ID, CHECKLIST_SINGLETON_ID } from "./db";

/**
 * Seed IndexedDB on first run only. Idempotent.
 */
export async function seedIfEmpty(defaults) {
  const existing = await tables.protocol.get(PROTOCOL_SINGLETON_ID);
  if (existing) return false;

  await Promise.all([
    tables.protocol.put({ ...defaults.protocol, id: PROTOCOL_SINGLETON_ID }),
    tables.checklistSingleton.put({
      id: CHECKLIST_SINGLETON_ID,
      data: defaults.checklistState || { morning: {}, work: {}, night: {} },
    }),
    tables.interventions.bulkPut(defaults.interventions),
    tables.labs.bulkPut(defaults.labs),
    tables.bodyComp.bulkPut(defaults.bodyComp),
    tables.supplements.bulkPut(defaults.supplements),
    tables.entries.put(defaults.emptyDay),
  ]);

  return true;
}
