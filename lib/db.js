import Dexie from "dexie";

export const PROTOCOL_SINGLETON_ID = "protocol-current";
export const CHECKLIST_SINGLETON_ID = "checklist-current";

export const db = new Dexie("SystemOS");

db.version(1).stores({
  protocol: "id",
  checklistSingleton: "id",
  entries: "id, date, day",
  interventions: "id, date, category",
  labs: "id, date",
  bodyComp: "id, date",
  supplements: "id, since",
  weeklySummaries: "id, weekStart",
});

export const tables = {
  protocol: db.protocol,
  checklistSingleton: db.checklistSingleton,
  entries: db.entries,
  interventions: db.interventions,
  labs: db.labs,
  bodyComp: db.bodyComp,
  supplements: db.supplements,
  weeklySummaries: db.weeklySummaries,
};
