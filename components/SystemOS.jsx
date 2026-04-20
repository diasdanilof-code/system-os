"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { tables, PROTOCOL_SINGLETON_ID, CHECKLIST_SINGLETON_ID } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { initSync } from "@/lib/sheetsSync";
import { fetchCopilot } from "@/lib/copilotClient";
import { phraseForDay } from "@/lib/phrases";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, AreaChart,
} from "recharts";
import {
  Home, CheckSquare, TrendingUp, Zap, FileText, Flame, Moon,
  Dumbbell, Activity, Brain, Heart, Droplet, Sparkles, ChevronRight,
  Check, Target, AlertTriangle, ArrowUp, ArrowDown, Minus, Sun,
  Utensils, Pill, Timer, Info, Plus, Save, Beef, Leaf, TestTube,
  Briefcase, Settings, Sunrise, Sunset, Edit3, User, FlaskConical,
  Beaker, Microscope, Gauge, Layers, Shield, Lightbulb, Compass,
  Clock, BarChart3, Cpu, Bookmark, TrendingDown, Pencil, X, Trash2,
  ChefHat, Waves, Stethoscope, Replace, PlusCircle,
} from "lucide-react";

/* ============================================================
 * SYSTEM OS DANILO FILHO — ARCHITECTURE
 * ------------------------------------------------------------
 * Personal performance operating system for a 90-day longevity
 * experiment. Mobile-first, offline-capable, timezone-aware.
 *
 * v1 = Option A (rule engine local). Designed to evolve to
 * Option C (hybrid: rules + LLM + stored summaries) without
 * rewriting the UI or business composition.
 *
 * LAYERED ARCHITECTURE — data flows strictly top-down:
 *
 *   ┌─────────────────────────────────────────────────────┐
 *   │  [1] DATA MODEL                                     │
 *   │      Pure schemas + factory functions.              │
 *   │      Entities: Protocol, DailyEntry, Intervention,  │
 *   │      LabSnapshot, BodyCompSnapshot, WeeklySummary,  │
 *   │      Supplement. Every entity carries id, version,  │
 *   │      createdAt, source.                             │
 *   └─────────────────────────────────────────────────────┘
 *                         ↓
 *   ┌─────────────────────────────────────────────────────┐
 *   │  [2] REPOSITORY LAYER                               │
 *   │      useRepository() hook. The ONLY storage         │
 *   │      boundary. Today: React state. Future swap      │
 *   │      target: SQLite / Supabase. UI never touches    │
 *   │      raw state.                                     │
 *   │      Public: repo.{protocol,entries,interventions,  │
 *   │               labs,bodyComp,supplements,            │
 *   │               weeklySummaries,checklist}.{crud}     │
 *   │      repo.snapshot() → immutable view for logic.    │
 *   └─────────────────────────────────────────────────────┘
 *                         ↓
 *   ┌─────────────────────────────────────────────────────┐
 *   │  [3] DETERMINISTIC LAYER                            │
 *   │      Pure math namespace. No side effects, no I/O,  │
 *   │      no randomness. Same input → same output.       │
 *   │      Public: Deterministic.{avg, last, clamp,       │
 *   │      computeCompliance, computeEnergyScore,         │
 *   │      computeRecoveryScore, computeMetabolicScore,   │
 *   │      scoreTrend, splitWindow, beforeAfterDeltas,    │
 *   │      hitRate, streak, ...}                          │
 *   └─────────────────────────────────────────────────────┘
 *                         ↓
 *   ┌─────────────────────────────────────────────────────┐
 *   │  [4] RULE ENGINE                                    │
 *   │      Pure rule-based reasoning. Consumes            │
 *   │      Deterministic.* exclusively. Produces          │
 *   │      structured data — no JSX, no text formatting.  │
 *   │      Public: RuleEngine.{detectChangingNow,         │
 *   │      detectPatterns, rankDrivers, generateTomorrow  │
 *   │      Plan, scoreInterventionImpacts, buildImpact    │
 *   │      Narratives, buildScores, buildWeekEvolution,   │
 *   │      buildPhaseComparison, assessLongevityAlignment,│
 *   │      buildRiskWatch, buildImproveShortList,         │
 *   │      buildExperimentLists, run}                     │
 *   └─────────────────────────────────────────────────────┘
 *                         ↓
 *   ┌─────────────────────────────────────────────────────┐
 *   │  [5] AI EXTENSION LAYER                             │
 *   │      Hook-only in v1. AI_ENABLED = false →          │
 *   │      passthrough. When enabled in Option C, each    │
 *   │      hook may call an LLM with a documented prompt  │
 *   │      skeleton and return narratives/explanations.   │
 *   │      Public: AILayer.{enrichTomorrowPlan,           │
 *   │      generateWeeklyNarrative,                       │
 *   │      explainInterventionImpact,                     │
 *   │      generateDeepAnalysis, apply}                   │
 *   └─────────────────────────────────────────────────────┘
 *                         ↓
 *   ┌─────────────────────────────────────────────────────┐
 *   │  [6] SYSTEM ORCHESTRATOR                            │
 *   │      Single composition point. buildSystemState()   │
 *   │      runs the pipeline:                             │
 *   │        repo.snapshot()                              │
 *   │          → RuleEngine.run(snapshot)                 │
 *   │          → AILayer.apply(ruleResult, ctx)           │
 *   │          → SystemState                              │
 *   │      SystemState = { data, math, rules, ai, view }. │
 *   └─────────────────────────────────────────────────────┘
 *                         ↓
 *   ┌─────────────────────────────────────────────────────┐
 *   │  [7] UI LAYER                                       │
 *   │      Consumes SystemState only. Calls repo methods  │
 *   │      for mutations via adapter callbacks wired at   │
 *   │      the App shell. No direct access to RuleEngine  │
 *   │      or AILayer from components.                    │
 *   └─────────────────────────────────────────────────────┘
 *
 * INVARIANTS:
 *   • Data flows strictly down through the layers.
 *   • Mutations flow through Repository only.
 *   • Deterministic / RuleEngine / AILayer are pure.
 *   • AILayer is passthrough while AI_ENABLED = false; the
 *     system behaves identically with or without it.
 *
 * TIMEZONE: America/Fortaleza. All date logic derives from
 * brNow() / brToday() / brHour(). Never use UTC directly.
 *
 * MIGRATION PATH TO OPTION C:
 *   1. Flip AI_ENABLED = true.
 *   2. Implement the 4 AILayer hooks with documented prompts.
 *   3. Add cache keyed by (userId, input hash).
 *   4. Swap useRepository() backing from React state to
 *      SQLite/Supabase. Public API stays the same.
 *   5. Orchestrator becomes async where needed (awaits on
 *      AILayer.apply).
 *   UI code does not change.
 * ============================================================ */

// ============================================================
// TIMEZONE — America/Fortaleza (Brasil)
// ============================================================
const TIMEZONE = "America/Fortaleza";

function brNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
}

function brToday() {
  const d = brNow();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function brHour() {
  return brNow().getHours();
}

function formatDateBR(iso) {
  const d = new Date(iso + "T12:00:00");
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentPhase() {
  const h = brHour();
  if (h < 12) return "morning";
  if (h < 19) return "day";
  return "night";
}

/* ============================================================
 * [1] DATA MODEL
 * ------------------------------------------------------------
 * Pure schemas + factory functions. No business logic.
 * Every entity carries: id, createdAt, source, version.
 * This layer is swap-ready for SQLite/Postgres in Option C.
 *
 * SCHEMA VERSIONS — bump when breaking changes happen.
 * Future migrations read these to upgrade persisted rows.
 * ============================================================ */

const SCHEMA_VERSIONS = {
  protocol: 1,
  dailyEntry: 1,
  intervention: 1,
  labSnapshot: 1,
  bodyCompSnapshot: 1,
  weeklySummary: 1,
  supplementStackEntry: 1,
};

// Helper: stable unique ID with entity prefix
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// --------------------------------------------------------------
// [1.1] PROTOCOL
// --------------------------------------------------------------
/**
 * Protocol — user's operating schedule + biomarker context.
 * Fields:
 *   version         schema version
 *   updatedAt       ISO timestamp of last edit
 *   wakeTime..dinnerTime   "HH:MM" 24h strings
 *   sleepTarget     hours (float, flexible)
 *   goals           string[]
 *   baseline        { weight, age, height }
 *   biomarkers      { elevated: [{name, priority, levers}], good: [{name, note}] }
 */
const makeProtocol = (overrides = {}) => ({
  version: SCHEMA_VERSIONS.protocol,
  updatedAt: new Date().toISOString(),
  wakeTime: "06:30",
  trainingTime: "07:00",
  saunaTime: "08:15",
  hbotTime: "08:45",
  workStart: "09:00",
  workEnd: "19:00",
  redLightTime: "14:00",
  dinnerTime: "20:00",
  sleepTarget: 7.5,
  goals: ["Maximizar performance", "Otimizar longevidade", "Reduzir LDL", "Estabilizar TSH"],
  baseline: { weight: 83.6, age: 24, height: 1.83 },
  biomarkers: {
    elevated: [
      { name: "LDL", priority: "alta", levers: ["ômega 3", "fibra solúvel", "cardio Z2", "azeite"] },
      { name: "TSH", priority: "alta", levers: ["sono ≥7,5h", "castanha do Pará", "reduzir estresse"] },
      { name: "Fígado (ALT/GGT)", priority: "média", levers: ["zero álcool", "sem processados", "crucíferos"] },
    ],
    good: [
      { name: "Glicose", note: "Controle bom — manter" },
      { name: "Inflamação", note: "Baixa — ômega 3 funcionando" },
    ],
  },
  ...overrides,
});

const DEFAULT_PROTOCOL = makeProtocol();

// --------------------------------------------------------------
// [1.2] DAILY ENTRY
// --------------------------------------------------------------
/**
 * DailyEntry — one per calendar day (Fortaleza TZ).
 * Phases logged progressively: morning → day → night → closed.
 *
 * Fields:
 *   id, version, createdAt, source ("manual"|"import")
 *   day              experiment day number (0 = pre-launch)
 *   date             ISO date "YYYY-MM-DD"
 *   dateLabel        localized label (display-only)
 *   -- morning --
 *   weight, sleepH, sleepQ, morningLogged
 *   -- day (state) --
 *   energy, focus, mood, stress, hunger, cravings
 *   -- day (actions) --
 *   training, sauna, hbot, redLight
 *   -- day (levers) --
 *   fiber, brazilNuts, alcohol
 *   -- night --
 *   finalEnergy, recovery, diet, notes, nightLogged
 *   -- lifecycle --
 *   closed           true after night phase committed
 */
const makeDailyEntry = (date, dayNum, overrides = {}) => ({
  id: newId("day"),
  version: SCHEMA_VERSIONS.dailyEntry,
  createdAt: new Date().toISOString(),
  source: "manual",
  day: dayNum,
  date,
  dateLabel: formatDateBR(date),
  weight: null, sleepH: null, sleepQ: null, morningLogged: false,
  energy: null, focus: null, mood: null, stress: null,
  hunger: null, cravings: null,
  training: false, sauna: false, hbot: false, redLight: false,
  fiber: false, brazilNuts: false, alcohol: false,
  finalEnergy: null, recovery: null, diet: null,
  nightLogged: false, notes: "", closed: false,
  // Per-day snapshot of the checklist (morning/work/night maps of id→bool).
  // Filled live while the user interacts with the Checklist screen for
  // "today" and frozen the moment a new day begins (via ensureToday).
  checklistSnapshot: { morning: {}, work: {}, night: {} },
  ...overrides,
});

// Back-compat alias — UI still calls makeEmptyDay.
const makeEmptyDay = (date, dayNum) => makeDailyEntry(date, dayNum);

// --------------------------------------------------------------
// [1.3] INTERVENTION
// --------------------------------------------------------------
/**
 * Intervention — a tracked change in routine/stack/protocol.
 * First-class experiment citizen. AI analyzes before/after.
 *
 * Fields:
 *   id, version, createdAt, source
 *   date       "YYYY-MM-DD" when intervention took effect
 *   action     "start" | "stop" | "change"
 *   category   supplement | diet | training | hbot | sauna
 *              | redLight | sleep | medication | protocol | other
 *   title      short user-facing label
 *   body       optional details (dose, reason, expectation)
 *   tags       free-form strings for AI correlation hints
 *
 * Static catalogs (UI metadata only — category & action options):
 */
const INTERVENTION_CATEGORIES = [
  { key: "supplement", label: "Suplemento", icon: Pill, color: "blue" },
  { key: "diet", label: "Dieta", icon: ChefHat, color: "amber" },
  { key: "training", label: "Treino", icon: Dumbbell, color: "emerald" },
  { key: "hbot", label: "HBOT", icon: Droplet, color: "indigo" },
  { key: "sauna", label: "Sauna", icon: Flame, color: "amber" },
  { key: "redLight", label: "Luz vermelha", icon: Sparkles, color: "rose" },
  { key: "sleep", label: "Sono", icon: Moon, color: "indigo" },
  { key: "medication", label: "Medicação", icon: Stethoscope, color: "rose" },
  { key: "protocol", label: "Protocolo", icon: Layers, color: "emerald" },
  { key: "other", label: "Outro", icon: Bookmark, color: "zinc" },
];

const INTERVENTION_ACTIONS = [
  { key: "start", label: "Iniciar", icon: PlusCircle },
  { key: "stop", label: "Parar", icon: X },
  { key: "change", label: "Modificar", icon: Replace },
];

const makeIntervention = ({
  date = brToday(),
  action = "start",
  category = "other",
  title = "",
  body = "",
  tags = [],
  id,
} = {}) => ({
  id: id || newId("iv"),
  version: SCHEMA_VERSIONS.intervention,
  createdAt: new Date().toISOString(),
  source: "manual",
  date, action, category, title, body, tags,
});

const DEFAULT_INTERVENTIONS = [
  makeIntervention({
    id: "iv-baseline",
    date: "2026-04-20",
    action: "start",
    category: "protocol",
    title: "Início do protocolo de 90 dias",
    body: "Stack de base: treino manhã, sauna, HBOT, luz vermelha, dieta alta em proteína + fibra, zero álcool.",
    tags: ["baseline", "protocol"],
  }),
];

// --------------------------------------------------------------
// [1.4] LAB SNAPSHOT
// --------------------------------------------------------------
/**
 * LabSnapshot — a single lab draw, immutable.
 * Panels grouped by system for AI reasoning.
 *
 * Fields:
 *   id, version, createdAt, source
 *   date       "YYYY-MM-DD" of blood draw
 *   label      human label ("Baseline", "Retest 45d"…)
 *   lipids         { ldl, hdl, triglycerides, totalChol }
 *   metabolic      { glucose, hba1c, insulin }
 *   liver          { alt, ast, ggt }
 *   thyroid        { tsh, t4, t3 }
 *   inflammation   { crp, homocysteine }
 *   vitamins       { vitD, b12 }
 *   notes          optional free text
 */
const makeLabSnapshot = ({
  date,
  label = "",
  lipids = {}, metabolic = {}, liver = {},
  thyroid = {}, inflammation = {}, vitamins = {},
  notes = "", id,
} = {}) => ({
  id: id || newId("lab"),
  version: SCHEMA_VERSIONS.labSnapshot,
  createdAt: new Date().toISOString(),
  source: "manual",
  date, label,
  lipids, metabolic, liver, thyroid, inflammation, vitamins,
  notes,
});

const DEFAULT_LAB_HISTORY = [
  makeLabSnapshot({
    id: "lab-baseline",
    date: "2026-04-15",
    label: "Baseline",
    lipids: { ldl: 162, hdl: 48, triglycerides: 128, totalChol: 228 },
    metabolic: { glucose: 88, hba1c: 5.2, insulin: 6.8 },
    liver: { alt: 48, ast: 32, ggt: 58 },
    thyroid: { tsh: 4.8, t4: 1.1, t3: 2.9 },
    inflammation: { crp: 0.6, homocysteine: 9.2 },
    vitamins: { vitD: 32, b12: 420 },
  }),
];

// --------------------------------------------------------------
// [1.5] BODY COMPOSITION SNAPSHOT
// --------------------------------------------------------------
/**
 * BodyCompSnapshot — one bioimpedance measurement.
 *
 * Fields:
 *   id, version, createdAt, source
 *   date, label
 *   weight (kg), bmi
 *   bodyFatPct, leanMassKg, fatMassKg
 *   waterPct, visceralFat, muscleKg
 *   notes
 */
const makeBodyCompSnapshot = ({
  date, label = "",
  weight = null, bmi = null,
  bodyFatPct = null, leanMassKg = null, fatMassKg = null,
  waterPct = null, visceralFat = null, muscleKg = null,
  // InBody-extended fields (all optional; backward-compatible)
  totalBodyWaterL = null, proteinKg = null, mineralsKg = null,
  waistHipRatio = null, bmrKcal = null, smi = null,
  inBodyScore = null, device = null,
  notes = "", id,
} = {}) => ({
  id: id || newId("body"),
  version: SCHEMA_VERSIONS.bodyCompSnapshot,
  createdAt: new Date().toISOString(),
  source: "manual",
  date, label,
  weight, bmi, bodyFatPct, leanMassKg, fatMassKg,
  waterPct, visceralFat, muscleKg,
  totalBodyWaterL, proteinKg, mineralsKg,
  waistHipRatio, bmrKcal, smi, inBodyScore, device,
  notes,
});

const DEFAULT_BODY_COMP_HISTORY = [
  makeBodyCompSnapshot({
    id: "body-inbody-20260420",
    date: "2026-04-20",
    label: "InBody 270 — 20/04/2026",
    device: "InBody 270",
    weight: 83.6,
    bmi: 25.0,
    bodyFatPct: 21.8,
    leanMassKg: 65.4,
    fatMassKg: 18.2,
    waterPct: Math.round((47.8 / 83.6) * 1000) / 10, // ≈57.2%
    visceralFat: 8,
    muscleKg: 37.1,
    totalBodyWaterL: 47.8,
    proteinKg: 12.9,
    mineralsKg: 4.69,
    waistHipRatio: 0.92,
    bmrKcal: 1782,
    smi: 8.3,
    inBodyScore: 76,
    notes: "Primeiro exame do experimento. PGC levemente acima; alvo baixar 6.7kg de gordura preservando massa magra.",
  }),
];

// --------------------------------------------------------------
// [1.6] SUPPLEMENT STACK ENTRY
// --------------------------------------------------------------
/**
 * SupplementStackEntry — supplement currently in the stack.
 * 'since' date enables stack-history queries.
 *
 * Fields:
 *   id, version, createdAt
 *   name, dose, timing, purpose, since, until (optional)
 */
const makeSupplement = ({
  name, dose = "", timing = "", purpose = "",
  since = brToday(), until = null, id,
} = {}) => ({
  id: id || newId("supp"),
  version: SCHEMA_VERSIONS.supplementStackEntry,
  createdAt: new Date().toISOString(),
  name, dose, timing, purpose, since, until,
});

const DEFAULT_SUPPLEMENTS = [
  makeSupplement({ id: "supp-creatina", name: "Creatina", dose: "5g", timing: "Manhã", purpose: "Força + cognição", since: "2026-04-20" }),
  makeSupplement({ id: "supp-whey", name: "Whey (Bold)", dose: "40g", timing: "Pós-treino", purpose: "Proteína", since: "2026-04-20" }),
  makeSupplement({ id: "supp-omega3", name: "Ômega 3 (Nutrify)", dose: "2–3g EPA/DHA", timing: "Refeições", purpose: "LDL + fígado", since: "2026-04-20" }),
  makeSupplement({ id: "supp-mag", name: "Magnésio Koala", dose: "1 dose", timing: "Noite", purpose: "Sono + TSH", since: "2026-04-20" }),
  makeSupplement({ id: "supp-coq10", name: "CoQ10", dose: "100–200mg", timing: "Manhã", purpose: "Mitocondrial", since: "2026-04-20" }),
];

// --------------------------------------------------------------
// [1.7] WEEKLY SUMMARY
// --------------------------------------------------------------
/**
 * WeeklySummary — condensed snapshot of a completed week.
 * FIRST-CLASS CITIZEN despite empty in v1.
 * Purpose:
 *   - v1 (rules): populated by Rule Engine at week close.
 *   - v2 (AI):    LLM generates narrative, stored here.
 * Stored rather than recomputed → enables stable longitudinal
 * review and cheap context for future AI prompts.
 *
 * Fields:
 *   id, version, createdAt, source ("rules" | "ai" | "manual")
 *   weekStart     ISO date of week start (Monday)
 *   weekEnd       ISO date of week end (Sunday)
 *   daysLogged    0–7
 *   scores        { compliance, energy, recovery, metabolic }
 *                 each = { avg, trendDelta }
 *   highlights    { bestDayId, worstDayId, sleepAvg,
 *                   trainingHits, hbotHits }
 *   topActions    array of tomorrow-plan-style actions
 *   narrative     string | null   (populated by AI in Option C)
 *   linkedInterventionIds  string[]  (interventions active this week)
 */
const makeWeeklySummary = ({
  weekStart, weekEnd,
  daysLogged = 0,
  scores = { compliance: null, energy: null, recovery: null, metabolic: null },
  highlights = {},
  topActions = [],
  narrative = null,
  linkedInterventionIds = [],
  source = "rules",
  id,
} = {}) => ({
  id: id || newId("week"),
  version: SCHEMA_VERSIONS.weeklySummary,
  createdAt: new Date().toISOString(),
  source,
  weekStart, weekEnd, daysLogged,
  scores, highlights, topActions,
  narrative, linkedInterventionIds,
});

// Empty by default — populated as weeks close.
const DEFAULT_WEEKLY_SUMMARIES = [];

// --------------------------------------------------------------
// [1.8] REVIEW PERIOD CATALOG — UI metadata for Plan screen
// --------------------------------------------------------------
const REVIEW_PERIODS = [
  { key: "weekly", label: "Semanal", days: 7, icon: Clock },
  { key: "30d", label: "30 dias", days: 30, icon: Layers },
  { key: "60d", label: "60 dias", days: 60, icon: Layers },
  { key: "90d", label: "90 dias", days: 90, icon: Target },
];

/* ============================================================
 * [2] REPOSITORY LAYER
 * ------------------------------------------------------------
 * Storage abstraction. The UI NEVER touches raw state.
 * Every read and write goes through explicit repository methods.
 *
 * Current backing store: React state (in-memory, session-scoped).
 * Swap targets for Option C:
 *   - SQLite (expo-sqlite / Dexie browser)
 *   - Supabase / Postgres (multi-device sync, RLS-protected)
 *
 * The public API of useRepository() must remain stable as the
 * implementation swaps. UI components receive `repo` and call
 * methods — they do not know whether data lives in memory,
 * IndexedDB, SQLite, or a remote Postgres.
 *
 * Method naming contract:
 *   list()         → array (sorted by date ascending)
 *   getById(id)    → entity | null
 *   getByDate(d)   → entity | null  (for date-keyed collections)
 *   latest()       → entity | null  (most recent by date)
 *   add(payload)   → entity          (factory called internally)
 *   upsert(payload)→ entity          (add or replace by id)
 *   update(id, patch) → entity | null
 *   remove(id)     → boolean
 *   replaceAll(arr)→ void             (bulk reset, used by sync)
 *
 * Side note: all returned arrays are fresh copies — never
 * pass internal references back to UI. This preserves the
 * "UI cannot mutate storage directly" invariant.
 * ============================================================ */

/**
 * useRepository — Dexie-backed persistence with local-state mirror.
 *
 * Strategy: React useState is the source of truth for the UI
 * (instant reactivity). Every mutation is mirrored to IndexedDB
 * in background. On mount, hydrate from IndexedDB; if empty, seed
 * defaults first. Write failures log but never block the UI.
 */
function useRepository() {
  const [protocol, setProtocol] = useState(DEFAULT_PROTOCOL);
  const [entries, setEntries] = useState([makeEmptyDay(brToday(), 0)]);
  const [interventions, setInterventions] = useState(DEFAULT_INTERVENTIONS);
  const [labs, setLabs] = useState(DEFAULT_LAB_HISTORY);
  const [bodyComp, setBodyComp] = useState(DEFAULT_BODY_COMP_HISTORY);
  const [supplements, setSupplements] = useState(DEFAULT_SUPPLEMENTS);
  const [weeklySummaries, setWeeklySummaries] = useState(DEFAULT_WEEKLY_SUMMARIES);
  const [checklistState, setChecklistState] = useState({ morning: {}, work: {}, night: {} });
  const [ready, setReady] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    (async () => {
      try {
        await seedIfEmpty({
          protocol: DEFAULT_PROTOCOL,
          interventions: DEFAULT_INTERVENTIONS,
          labs: DEFAULT_LAB_HISTORY,
          bodyComp: DEFAULT_BODY_COMP_HISTORY,
          supplements: DEFAULT_SUPPLEMENTS,
          emptyDay: makeEmptyDay(brToday(), 0),
          checklistState: { morning: {}, work: {}, night: {} },
        });
        const [
          protocolRow, checklistRow, entriesArr, interventionsArr,
          labsArr, bodyCompArr, supplementsArr, weeklyArr,
        ] = await Promise.all([
          tables.protocol.get(PROTOCOL_SINGLETON_ID),
          tables.checklistSingleton.get(CHECKLIST_SINGLETON_ID),
          tables.entries.orderBy("date").toArray(),
          tables.interventions.orderBy("date").toArray(),
          tables.labs.orderBy("date").toArray(),
          tables.bodyComp.orderBy("date").toArray(),
          tables.supplements.toArray(),
          tables.weeklySummaries.orderBy("weekStart").toArray(),
        ]);
        if (protocolRow) {
          // eslint-disable-next-line no-unused-vars
          const { id: _ignoredId, ...cleanProtocol } = protocolRow;
          setProtocol(cleanProtocol);
        }
        if (checklistRow && checklistRow.data) setChecklistState(checklistRow.data);
        if (entriesArr.length) setEntries(entriesArr);
        if (interventionsArr.length) setInterventions(interventionsArr);
        if (labsArr.length) setLabs(labsArr);
        // --------------------------------------------------------
        // One-time migrations (idempotent):
        //  • Ensure real InBody 20/04/2026 exam is present.
        //  • Bump baseline weight to 83.6 if still at 82.
        // Each checks first, writes only if missing — safe to
        // re-run on every load.
        // --------------------------------------------------------
        const EXAM_ID_INBODY_20260420 = "body-inbody-20260420";
        const hasInBody = bodyCompArr.some(b => b.id === EXAM_ID_INBODY_20260420);
        let effectiveBodyCompArr = bodyCompArr;
        if (!hasInBody) {
          const seed = DEFAULT_BODY_COMP_HISTORY.find(b => b.id === EXAM_ID_INBODY_20260420);
          if (seed) {
            try {
              await tables.bodyComp.put(seed);
              effectiveBodyCompArr = [...bodyCompArr, seed];
            } catch (mErr) { logWriteErr(mErr); }
          }
        }
        if (protocolRow && protocolRow.baseline && protocolRow.baseline.weight === 82 && protocolRow.baseline.age === 24) {
          const patched = { ...protocolRow, baseline: { ...protocolRow.baseline, weight: 83.6 }, updatedAt: new Date().toISOString() };
          try {
            await tables.protocol.put(patched);
            // eslint-disable-next-line no-unused-vars
            const { id: _ignoredId2, ...cleanProtocol2 } = patched;
            setProtocol(cleanProtocol2);
          } catch (mErr) { logWriteErr(mErr); }
        }

        if (effectiveBodyCompArr.length) setBodyComp(effectiveBodyCompArr);
        if (supplementsArr.length) setSupplements(supplementsArr);
        if (weeklyArr.length) setWeeklySummaries(weeklyArr);
        setReady(true);
        initSync(tables);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[useRepository] hydration failed:", err);
        setReady(true);
        initSync(tables);
      }
    })();
  }, []);

  const byDateAsc = (a, b) => (a.date || "").localeCompare(b.date || "");
  const latestOf = (arr) => (arr && arr.length ? [...arr].sort(byDateAsc)[arr.length - 1] : null);
  const logWriteErr = (err) => {
    // eslint-disable-next-line no-console
    console.error("[useRepository] IndexedDB write failed:", err);
  };

  const protocolRepo = {
    get: () => ({ ...protocol }),
    update: (patch) => {
      const next = { ...protocol, ...patch, updatedAt: new Date().toISOString() };
      setProtocol(next);
      tables.protocol.put({ ...next, id: PROTOCOL_SINGLETON_ID }).catch(logWriteErr);
      return next;
    },
    replace: (newProtocol) => {
      const next = { ...newProtocol, updatedAt: new Date().toISOString() };
      setProtocol(next);
      tables.protocol.put({ ...next, id: PROTOCOL_SINGLETON_ID }).catch(logWriteErr);
      return next;
    },
  };

  const entriesRepo = {
    list: () => [...entries].sort(byDateAsc),
    getById: (id) => entries.find((e) => e.id === id) || null,
    getByDate: (date) => entries.find((e) => e.date === date) || null,
    getToday: () => {
      if (!entries.length) return null;
      return [...entries].sort(byDateAsc)[entries.length - 1];
    },
    getByDayNumber: (day) => entries.find((e) => e.day === day) || null,
    add: (payload) => {
      const entry = payload.id ? payload : makeDailyEntry(payload.date, payload.day, payload);
      setEntries((prev) => [...prev, entry]);
      tables.entries.put(entry).catch(logWriteErr);
      return entry;
    },
    upsert: (payload) => {
      const entry = payload.id ? payload : makeDailyEntry(payload.date, payload.day, payload);
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.id === entry.id);
        if (idx === -1) return [...prev, entry];
        const copy = [...prev]; copy[idx] = entry; return copy;
      });
      tables.entries.put(entry).catch(logWriteErr);
      return entry;
    },
    update: (id, patch) => {
      // Compute synchronously before setState (React 18 safe).
      const existing = entries.find((e) => e.id === id);
      if (!existing) return null;
      const updated = { ...existing, ...patch };
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      tables.entries.put(updated).catch(logWriteErr);
      return updated;
    },
    /**
     * Ensure a DailyEntry exists for today's Brasília date.
     * If the latest entry is NOT today, append a fresh one with day++.
     * Idempotent: safe to call repeatedly (e.g., every 60s).
     * Returns true if a new day was created, false otherwise.
     */
    ensureToday: () => {
      const today = brToday();
      // Compute target synchronously (React 18 safe pattern).
      if (!entries.length) return false;
      let idx = 0;
      let maxDate = entries[0].date || "";
      for (let i = 1; i < entries.length; i++) {
        if ((entries[i].date || "") > maxDate) { maxDate = entries[i].date || ""; idx = i; }
      }
      const latest = entries[idx];
      if ((latest.date || "") >= today) return false; // already have today

      // --- DAY ROLLOVER ---
      // 1) Snapshot the current live checklistState into the PREVIOUS
      //    day's entry (so history is preserved per day).
      // 2) Create a new empty DailyEntry for today.
      // 3) Reset the live checklistSingleton (UI starts fresh).
      const nextDay = (latest.day || 0) + 1;
      const latestSnapshot = {
        ...latest,
        checklistSnapshot: {
          morning: { ...(checklistState.morning || {}) },
          work: { ...(checklistState.work || {}) },
          night: { ...(checklistState.night || {}) },
        },
      };
      const newEntry = makeDailyEntry(today, nextDay);
      setEntries((prev) => {
        if (!prev.length) return prev;
        let i2 = 0;
        let m2 = prev[0].date || "";
        for (let i = 1; i < prev.length; i++) {
          if ((prev[i].date || "") > m2) { m2 = prev[i].date || ""; i2 = i; }
        }
        const copy = [...prev];
        copy[i2] = latestSnapshot;
        return [...copy, newEntry];
      });
      // Write both writes to IDB
      tables.entries.put(latestSnapshot).catch(logWriteErr);
      tables.entries.put(newEntry).catch(logWriteErr);
      // Reset the live checklist singleton
      const emptyChecklist = { morning: {}, work: {}, night: {} };
      setChecklistState(emptyChecklist);
      tables.checklistSingleton.put({ id: CHECKLIST_SINGLETON_ID, data: emptyChecklist }).catch(logWriteErr);
      return true;
    },
    updateToday: (patch) => {
      // Compute update synchronously from current `entries` closure.
      // Previous version assigned `updated` inside the setState updater
      // callback, which in React 18's batched/concurrent mode may be
      // deferred — leaving `updated` as null when `tables.entries.put`
      // was about to run, silently skipping IndexedDB persistence.
      if (!entries.length) return null;
      let idx = 0;
      let maxDate = entries[0].date || "";
      for (let i = 1; i < entries.length; i++) {
        if ((entries[i].date || "") > maxDate) { maxDate = entries[i].date || ""; idx = i; }
      }
      const updated = { ...entries[idx], ...patch };
      setEntries((prev) => {
        // Re-locate idx inside the updater to stay safe against any
        // in-flight append (e.g. ensureToday racing with updateToday).
        if (!prev.length) return prev;
        let i2 = 0;
        let m2 = prev[0].date || "";
        for (let i = 1; i < prev.length; i++) {
          if ((prev[i].date || "") > m2) { m2 = prev[i].date || ""; i2 = i; }
        }
        const copy = [...prev];
        copy[i2] = { ...copy[i2], ...patch };
        return copy;
      });
      tables.entries.put(updated).catch(logWriteErr);
      return updated;
    },
    remove: (id) => {
      let removed = false;
      setEntries((prev) => {
        const next = prev.filter((e) => e.id !== id);
        removed = next.length !== prev.length;
        return next;
      });
      tables.entries.delete(id).catch(logWriteErr);
      return removed;
    },
    replaceAll: (arr) => {
      setEntries([...arr]);
      tables.entries.clear().then(() => tables.entries.bulkPut(arr)).catch(logWriteErr);
    },
  };

  const interventionsRepo = {
    list: () => [...interventions].sort(byDateAsc),
    getById: (id) => interventions.find((iv) => iv.id === id) || null,
    latest: () => latestOf(interventions),
    byCategory: (category) => interventions.filter((iv) => iv.category === category),
    sinceDate: (date) => interventions.filter((iv) => iv.date >= date),
    add: (payload) => {
      const iv = payload.id && payload.version ? payload : makeIntervention(payload);
      setInterventions((prev) => [...prev, iv]);
      tables.interventions.put(iv).catch(logWriteErr);
      return iv;
    },
    update: (id, patch) => {
      const existing = interventions.find((iv) => iv.id === id);
      if (!existing) return null;
      const updated = { ...existing, ...patch };
      setInterventions((prev) => prev.map((iv) => (iv.id === id ? { ...iv, ...patch } : iv)));
      tables.interventions.put(updated).catch(logWriteErr);
      return updated;
    },
    remove: (id) => {
      let removed = false;
      setInterventions((prev) => {
        const next = prev.filter((iv) => iv.id !== id);
        removed = next.length !== prev.length;
        return next;
      });
      tables.interventions.delete(id).catch(logWriteErr);
      return removed;
    },
    replaceAll: (arr) => {
      setInterventions([...arr]);
      tables.interventions.clear().then(() => tables.interventions.bulkPut(arr)).catch(logWriteErr);
    },
  };

  const labsRepo = {
    list: () => [...labs].sort(byDateAsc),
    getById: (id) => labs.find((l) => l.id === id) || null,
    latest: () => latestOf(labs),
    sinceDate: (date) => labs.filter((l) => l.date >= date),
    add: (payload) => {
      const snap = payload.id && payload.version ? payload : makeLabSnapshot(payload);
      setLabs((prev) => [...prev, snap]);
      tables.labs.put(snap).catch(logWriteErr);
      return snap;
    },
    update: (id, patch) => {
      const existing = labs.find((l) => l.id === id);
      if (!existing) return null;
      const updated = { ...existing, ...patch };
      setLabs((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
      tables.labs.put(updated).catch(logWriteErr);
      return updated;
    },
    remove: (id) => {
      let removed = false;
      setLabs((prev) => {
        const next = prev.filter((l) => l.id !== id);
        removed = next.length !== prev.length;
        return next;
      });
      tables.labs.delete(id).catch(logWriteErr);
      return removed;
    },
    replaceAll: (arr) => {
      setLabs([...arr]);
      tables.labs.clear().then(() => tables.labs.bulkPut(arr)).catch(logWriteErr);
    },
  };

  const bodyCompRepo = {
    list: () => [...bodyComp].sort(byDateAsc),
    getById: (id) => bodyComp.find((b) => b.id === id) || null,
    latest: () => latestOf(bodyComp),
    sinceDate: (date) => bodyComp.filter((b) => b.date >= date),
    add: (payload) => {
      const snap = payload.id && payload.version ? payload : makeBodyCompSnapshot(payload);
      setBodyComp((prev) => [...prev, snap]);
      tables.bodyComp.put(snap).catch(logWriteErr);
      return snap;
    },
    update: (id, patch) => {
      const existing = bodyComp.find((b) => b.id === id);
      if (!existing) return null;
      const updated = { ...existing, ...patch };
      setBodyComp((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
      tables.bodyComp.put(updated).catch(logWriteErr);
      return updated;
    },
    remove: (id) => {
      let removed = false;
      setBodyComp((prev) => {
        const next = prev.filter((b) => b.id !== id);
        removed = next.length !== prev.length;
        return next;
      });
      tables.bodyComp.delete(id).catch(logWriteErr);
      return removed;
    },
    replaceAll: (arr) => {
      setBodyComp([...arr]);
      tables.bodyComp.clear().then(() => tables.bodyComp.bulkPut(arr)).catch(logWriteErr);
    },
  };

  const supplementsRepo = {
    list: () => [...supplements],
    getById: (id) => supplements.find((s) => s.id === id) || null,
    active: () => supplements.filter((s) => !s.until),
    add: (payload) => {
      const supp = payload.id && payload.version ? payload : makeSupplement(payload);
      setSupplements((prev) => [...prev, supp]);
      tables.supplements.put(supp).catch(logWriteErr);
      return supp;
    },
    update: (id, patch) => {
      const existing = supplements.find((s) => s.id === id);
      if (!existing) return null;
      const updated = { ...existing, ...patch };
      setSupplements((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
      tables.supplements.put(updated).catch(logWriteErr);
      return updated;
    },
    discontinue: (id, untilDate = brToday()) => {
      return supplementsRepo.update(id, { until: untilDate });
    },
    remove: (id) => {
      let removed = false;
      setSupplements((prev) => {
        const next = prev.filter((s) => s.id !== id);
        removed = next.length !== prev.length;
        return next;
      });
      tables.supplements.delete(id).catch(logWriteErr);
      return removed;
    },
    replaceAll: (arr) => {
      setSupplements([...arr]);
      tables.supplements.clear().then(() => tables.supplements.bulkPut(arr)).catch(logWriteErr);
    },
  };

  const weeklySummariesRepo = {
    list: () => [...weeklySummaries].sort((a, b) => (a.weekStart || "").localeCompare(b.weekStart || "")),
    getById: (id) => weeklySummaries.find((w) => w.id === id) || null,
    getByWeekStart: (weekStart) => weeklySummaries.find((w) => w.weekStart === weekStart) || null,
    latest: () => {
      if (!weeklySummaries.length) return null;
      return [...weeklySummaries].sort((a, b) =>
        (a.weekStart || "").localeCompare(b.weekStart || ""))[weeklySummaries.length - 1];
    },
    upsert: (payload) => {
      const summary = payload.id && payload.version ? payload : makeWeeklySummary(payload);
      setWeeklySummaries((prev) => {
        const idx = prev.findIndex((w) => w.weekStart === summary.weekStart);
        if (idx === -1) return [...prev, summary];
        const copy = [...prev]; copy[idx] = summary; return copy;
      });
      tables.weeklySummaries.put(summary).catch(logWriteErr);
      return summary;
    },
    remove: (id) => {
      let removed = false;
      setWeeklySummaries((prev) => {
        const next = prev.filter((w) => w.id !== id);
        removed = next.length !== prev.length;
        return next;
      });
      tables.weeklySummaries.delete(id).catch(logWriteErr);
      return removed;
    },
    replaceAll: (arr) => {
      setWeeklySummaries([...arr]);
      tables.weeklySummaries.clear().then(() => tables.weeklySummaries.bulkPut(arr)).catch(logWriteErr);
    },
  };

  const writeChecklist = (nextData) => {
    // 1) Live singleton (fast access for current UI session).
    tables.checklistSingleton.put({
      id: CHECKLIST_SINGLETON_ID,
      data: nextData,
    }).catch(logWriteErr);
    // 2) Mirror into today's DailyEntry.checklistSnapshot so the
    //    per-day history is preserved for analytics / Copilot /
    //    streak + seal logic that already lives on the entry.
    if (entries.length) {
      let idx = 0;
      let maxDate = entries[0].date || "";
      for (let i = 1; i < entries.length; i++) {
        if ((entries[i].date || "") > maxDate) { maxDate = entries[i].date || ""; idx = i; }
      }
      const latest = entries[idx];
      const snapshot = {
        morning: { ...(nextData.morning || {}) },
        work: { ...(nextData.work || {}) },
        night: { ...(nextData.night || {}) },
      };
      const updated = { ...latest, checklistSnapshot: snapshot };
      setEntries((prev) => prev.map((e) => (e.id === latest.id ? { ...e, checklistSnapshot: snapshot } : e)));
      tables.entries.put(updated).catch(logWriteErr);
    }
  };

  const checklistRepo = {
    getAll: () => ({ ...checklistState }),
    getSection: (section) => ({ ...(checklistState[section] || {}) }),
    toggleItem: (section, itemId) => {
      setChecklistState((prev) => {
        const next = {
          ...prev,
          [section]: { ...prev[section], [itemId]: !prev[section]?.[itemId] },
        };
        writeChecklist(next);
        return next;
      });
    },
    setSection: (section, newMap) => {
      setChecklistState((prev) => {
        const next = { ...prev, [section]: { ...newMap } };
        writeChecklist(next);
        return next;
      });
    },
    resetSection: (section, itemIds) => {
      const cleared = {};
      itemIds.forEach((id) => { cleared[id] = false; });
      setChecklistState((prev) => {
        const next = { ...prev, [section]: cleared };
        writeChecklist(next);
        return next;
      });
    },
    markAll: (section, itemIds) => {
      const all = {};
      itemIds.forEach((id) => { all[id] = true; });
      setChecklistState((prev) => {
        const next = { ...prev, [section]: all };
        writeChecklist(next);
        return next;
      });
    },
    replaceAll: (next) => {
      setChecklistState({ ...next });
      writeChecklist({ ...next });
    },
  };

  return {
    ready,
    protocol: protocolRepo,
    entries: entriesRepo,
    interventions: interventionsRepo,
    labs: labsRepo,
    bodyComp: bodyCompRepo,
    supplements: supplementsRepo,
    weeklySummaries: weeklySummariesRepo,
    checklist: checklistRepo,

    snapshot: () => ({
      protocol: { ...protocol },
      entries: [...entries].sort(byDateAsc),
      interventions: [...interventions].sort(byDateAsc),
      labs: [...labs].sort(byDateAsc),
      bodyComp: [...bodyComp].sort(byDateAsc),
      supplements: [...supplements],
      weeklySummaries: [...weeklySummaries],
      checklistState: { ...checklistState },
    }),
  };
}

// ============================================================
// CHECKLIST BUILDER — auto-gerada do protocolo
// ============================================================
function buildChecklist(protocol) {
  return {
    morning: {
      label: "Manhã", icon: Sunrise, accent: "amber",
      window: `${protocol.wakeTime} – ${protocol.workStart}`,
      items: [
        { id: "m1", label: "Acordar + pesar", time: protocol.wakeTime },
        { id: "m2", label: "Hidratação + eletrólitos", time: protocol.wakeTime },
        { id: "m3", label: "Treino — cardio + força", time: protocol.trainingTime },
        { id: "m4", label: "Sauna 15–20 min", time: protocol.saunaTime },
        { id: "m5", label: "HBOT 60 min", time: protocol.hbotTime },
        { id: "m6", label: "Creatina + CoQ10 + Ômega 3", time: protocol.hbotTime },
        { id: "m7", label: "Café com 40g proteína + fibra", time: "pós-HBOT" },
      ],
    },
    work: {
      label: "Trabalho", icon: Briefcase, accent: "blue",
      window: `${protocol.workStart} – ${protocol.workEnd}`,
      items: [
        { id: "w1", label: "Hidratação 3,5L", time: "o dia todo" },
        { id: "w2", label: "Almoço — proteína + crucífero", time: "12:30" },
        { id: "w3", label: "2 castanhas do Pará", time: "almoço" },
        { id: "w4", label: "Luz vermelha 10–15 min", time: protocol.redLightTime },
        { id: "w5", label: "Corte de cafeína", time: "14:00" },
        { id: "w6", label: "Fibra solúvel (aveia/chia/feijão)", time: "refeições" },
        { id: "w7", label: "Fechar trabalho", time: protocol.workEnd },
      ],
    },
    night: {
      label: "Noite", icon: Sunset, accent: "indigo",
      window: `${protocol.workEnd} – ${protocol.wakeTime}`,
      items: [
        { id: "n1", label: "Jantar leve", time: protocol.dinnerTime },
        { id: "n2", label: "Zero álcool", time: "noite" },
        { id: "n3", label: "Magnésio Koala", time: "22:00" },
        { id: "n4", label: "Desacelerar — sem telas estressantes", time: "noite" },
        { id: "n5", label: `Dormir — meta ${protocol.sleepTarget}h`, time: "quando pronto" },
      ],
    },
  };
}

/* ============================================================
 * [3] DETERMINISTIC LAYER
 * ------------------------------------------------------------
 * Pure mathematical core of the system.
 *
 * INVARIANTS (enforced by design):
 *   • No side effects.
 *   • No access to Repository, UI state, or AI Layer.
 *   • No I/O, no network, no randomness, no time.now().
 *   • No mutation of inputs. Return fresh objects/arrays.
 *   • Same input → same output, across every run.
 *
 * CONTRACT:
 *   Every exported function takes only plain data as arguments
 *   (arrays of entries, a protocol object, etc.) and returns
 *   structured data — never text, never UI-tagged strings.
 *   Text rendering and tagging belong to Rule Engine / UI.
 *
 * PURPOSE:
 *   This is the reliable bedrock. Unit-testable in isolation.
 *   If this layer is correct, everything above is reproducible.
 *
 * ORGANIZATION:
 *   [3.1] Math primitives        (avg, last, clamp, sum, delta)
 *   [3.2] Entry predicates       (isLogged, isClosed, hitRate)
 *   [3.3] Compliance             (weighted adherence score)
 *   [3.4] Composite scores       (energy, recovery, metabolic)
 *   [3.5] Series + trend math    (avg series, trend direction)
 *   [3.6] Window selection       (last N, date range)
 *   [3.7] Before/after delta     (for intervention analysis)
 *   [3.8] Streak counting        (consecutive true predicates)
 *
 * ALL public functions are attached to the `Deterministic`
 * namespace at the bottom of this block. Rule Engine and UI
 * access math only through that namespace.
 * ============================================================ */

// --------------------------------------------------------------
// [3.1] Math primitives
// --------------------------------------------------------------
/** Average of an array, ignoring null/undefined. Empty → 0. */
const d_avg = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  let sum = 0, n = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v != null && !Number.isNaN(v)) { sum += v; n++; }
  }
  return n === 0 ? 0 : sum / n;
};

/** Last N items of an array (fresh copy). */
const d_last = (arr, n) => {
  if (!Array.isArray(arr)) return [];
  if (n <= 0) return [];
  return arr.slice(-n);
};

/** Clamp a number to [lo, hi]. */
const d_clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/** Sum of numeric array, ignoring null. */
const d_sum = (arr) => {
  if (!Array.isArray(arr)) return 0;
  let s = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v != null && !Number.isNaN(v)) s += v;
  }
  return s;
};

/** Count of non-null numeric values. */
const d_count = (arr) => {
  if (!Array.isArray(arr)) return 0;
  let n = 0;
  for (let i = 0; i < arr.length; i++) if (arr[i] != null && !Number.isNaN(arr[i])) n++;
  return n;
};

/** Round to N decimals. Defaults to 2. */
const d_round = (v, decimals = 2) => {
  if (v == null || Number.isNaN(v)) return null;
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
};

// --------------------------------------------------------------
// [3.2] Entry predicates
// --------------------------------------------------------------
/** Entry has morning fields recorded. */
const d_isMorningLogged = (e) => !!(e && e.morningLogged);

/** Entry is closed (night phase committed). */
const d_isClosed = (e) => !!(e && e.closed);

/** Filter to only closed entries (fresh array). */
const d_filterClosed = (entries) => (entries || []).filter(d_isClosed);

/** Hit rate of a boolean key across entries, in [0, 1]. */
const d_hitRate = (entries, key, inverted = false) => {
  if (!Array.isArray(entries) || entries.length === 0) return 0;
  let hits = 0;
  for (let i = 0; i < entries.length; i++) {
    const v = entries[i][key];
    if (inverted ? !v : !!v) hits++;
  }
  return hits / entries.length;
};

// --------------------------------------------------------------
// [3.3] Compliance — weighted adherence score per day
// --------------------------------------------------------------
/**
 * Returns an integer 0–100. Weighted by Danilo's biomarker priorities.
 * Weights sum is intentionally uneven; see Data Model doc.
 */
const d_computeCompliance = (entry, protocol) => {
  if (!entry || !entry.morningLogged) return 0;
  const weights = {
    training: 10, sauna: 6, hbot: 8, redLight: 4,
    sleepHit: 15, sleepQualHit: 8, dietHit: 10, recoveryHit: 6,
    fiber: 8, brazilNuts: 4, noAlcohol: 9,
  };
  const hits = {
    training: entry.training, sauna: entry.sauna,
    hbot: entry.hbot, redLight: entry.redLight,
    sleepHit: entry.sleepH != null && entry.sleepH >= protocol.sleepTarget,
    sleepQualHit: entry.sleepQ != null && entry.sleepQ >= 7,
    dietHit: entry.diet != null && entry.diet >= 7,
    recoveryHit: entry.recovery != null && entry.recovery >= 7,
    fiber: entry.fiber, brazilNuts: entry.brazilNuts, noAlcohol: !entry.alcohol,
  };
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const earned = Object.keys(weights).reduce((sum, k) => sum + (hits[k] ? weights[k] : 0), 0);
  return Math.round((earned / total) * 100);
};

// --------------------------------------------------------------
// [3.4] Composite scores — Energy / Recovery / Metabolic
// Output range 0–100. Returns null if no signals available.
// --------------------------------------------------------------
const d_computeEnergyScore = (entry, protocol) => {
  if (!entry) return null;
  const parts = [];
  if (entry.energy != null) parts.push({ v: entry.energy * 10, w: 0.35 });
  if (entry.focus != null) parts.push({ v: entry.focus * 10, w: 0.20 });
  if (entry.mood != null) parts.push({ v: entry.mood * 10, w: 0.15 });
  if (entry.sleepH != null) parts.push({ v: Math.min(100, entry.sleepH / protocol.sleepTarget * 100), w: 0.20 });
  if (entry.stress != null) parts.push({ v: (10 - entry.stress) * 10, w: 0.10 });
  if (parts.length === 0) return null;
  const totalW = parts.reduce((a, b) => a + b.w, 0);
  return Math.round(parts.reduce((a, b) => a + b.v * b.w, 0) / totalW);
};

const d_computeRecoveryScore = (entry, protocol) => {
  if (!entry) return null;
  const parts = [];
  if (entry.recovery != null) parts.push({ v: entry.recovery * 10, w: 0.35 });
  if (entry.sleepH != null) parts.push({ v: Math.min(100, entry.sleepH / protocol.sleepTarget * 100), w: 0.25 });
  if (entry.sleepQ != null) parts.push({ v: entry.sleepQ * 10, w: 0.15 });
  parts.push({ v: entry.hbot ? 100 : 0, w: 0.10 });
  parts.push({ v: entry.sauna ? 100 : 0, w: 0.08 });
  parts.push({ v: entry.redLight ? 100 : 0, w: 0.07 });
  if (parts.length === 0) return null;
  const totalW = parts.reduce((a, b) => a + b.w, 0);
  return Math.round(parts.reduce((a, b) => a + b.v * b.w, 0) / totalW);
};

const d_computeMetabolicScore = (entry, protocol) => {
  if (!entry) return null;
  const parts = [];
  if (entry.diet != null) parts.push({ v: entry.diet * 10, w: 0.25 });
  parts.push({ v: entry.fiber ? 100 : 0, w: 0.20 });
  parts.push({ v: entry.brazilNuts ? 100 : 0, w: 0.08 });
  parts.push({ v: entry.alcohol ? 0 : 100, w: 0.17 });
  parts.push({ v: entry.training ? 100 : 0, w: 0.15 });
  if (entry.hunger != null) parts.push({ v: (10 - entry.hunger) * 10, w: 0.08 });
  if (entry.cravings != null) parts.push({ v: (10 - entry.cravings) * 10, w: 0.07 });
  const totalW = parts.reduce((a, b) => a + b.w, 0);
  return Math.round(parts.reduce((a, b) => a + b.v * b.w, 0) / totalW);
};

// --------------------------------------------------------------
// [3.5] Series + trend math
// --------------------------------------------------------------
/**
 * Project an array of entries into a series of one numeric metric.
 * Drops nulls. Fresh array.
 */
const d_seriesOf = (entries, keyOrFn) => {
  if (!Array.isArray(entries)) return [];
  const get = typeof keyOrFn === "function" ? keyOrFn : (e) => e[keyOrFn];
  const out = [];
  for (let i = 0; i < entries.length; i++) {
    const v = get(entries[i]);
    if (v != null && !Number.isNaN(v)) out.push(v);
  }
  return out;
};

/**
 * Trend of a composite score across closed entries.
 * Compares last 7 vs previous 7 (when available).
 * Returns { dir: "up"|"down"|"flat", delta: number }.
 * Threshold of 2 points keeps the signal from jittering.
 */
const d_scoreTrend = (entries, computeFn, protocol) => {
  const logged = d_filterClosed(entries);
  if (logged.length < 2) return { dir: "flat", delta: 0 };
  const recent = d_last(logged, 7);
  const prior = logged.slice(-14, -7);
  if (prior.length < 2) return { dir: "flat", delta: 0 };
  const recentAvg = d_avg(recent.map(e => computeFn(e, protocol)));
  const priorAvg = d_avg(prior.map(e => computeFn(e, protocol)));
  const delta = recentAvg - priorAvg;
  if (Math.abs(delta) < 2) return { dir: "flat", delta };
  return { dir: delta > 0 ? "up" : "down", delta };
};

/**
 * Delta of a raw metric (non-composite) between two windows.
 * Returns a number (can be negative). Used by Rule Engine for
 * sleep/energy/recovery/focus deltas.
 */
const d_windowDelta = (recentWindow, priorWindow, key) => {
  const r = d_avg((recentWindow || []).map(e => e[key]));
  const p = d_avg((priorWindow || []).map(e => e[key]));
  return r - p;
};

// --------------------------------------------------------------
// [3.6] Window selection
// --------------------------------------------------------------
/**
 * Split closed entries into recent (last N) and prior (N before that).
 * { recent, prior, logged } — all fresh arrays.
 */
const d_splitWindow = (entries, windowSize = 7) => {
  const logged = d_filterClosed(entries);
  const recent = d_last(logged, windowSize);
  const prior = logged.slice(-(windowSize * 2), -windowSize);
  return { recent, prior, logged };
};

/**
 * Entries on or after a given ISO date (inclusive).
 */
const d_sinceDate = (entries, isoDate) => {
  if (!Array.isArray(entries) || !isoDate) return [];
  return entries.filter(e => (e.date || "") >= isoDate);
};

/**
 * Entries strictly before a given ISO date.
 */
const d_beforeDate = (entries, isoDate) => {
  if (!Array.isArray(entries) || !isoDate) return [];
  return entries.filter(e => (e.date || "") < isoDate);
};

// --------------------------------------------------------------
// [3.7] Before/after delta — used for intervention impact
// --------------------------------------------------------------
/**
 * Given entries and a pivot date, compute per-metric deltas
 * (after window avg − before window avg) for a fixed metric set.
 * Returns { deltas, beforeCount, afterCount, ready }.
 * `ready` = whether enough data exists for a meaningful delta.
 */
const d_beforeAfterDeltas = (entries, pivotDate, protocol, windowSize = 7) => {
  const closed = d_filterClosed(entries);
  const before = d_beforeDate(closed, pivotDate).slice(-windowSize);
  const after = d_sinceDate(closed, pivotDate).slice(0, windowSize);
  const ready = before.length >= 2 && after.length >= 2;
  const deltas = !ready ? null : {
    sleep: d_windowDelta(after, before, "sleepH"),
    energy: d_windowDelta(after, before, "energy"),
    recovery: d_windowDelta(after, before, "recovery"),
    focus: d_windowDelta(after, before, "focus"),
    hunger: d_windowDelta(after, before, "hunger"),
    compliance: d_avg(after.map(e => d_computeCompliance(e, protocol))) -
                d_avg(before.map(e => d_computeCompliance(e, protocol))),
  };
  return { deltas, beforeCount: before.length, afterCount: after.length, ready };
};

// --------------------------------------------------------------
// [3.8] Streak counting
// --------------------------------------------------------------
/**
 * Count consecutive trailing entries satisfying a predicate.
 * Traverses from the end; stops on first failure.
 * Pre-launch entry (day 0) is excluded — it never starts streaks.
 */
const d_streak = (entries, predicate) => {
  if (!Array.isArray(entries)) return 0;
  let s = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (!e || e.day === 0) break;
    if (!e.closed && !e.morningLogged) continue;
    if (predicate(e)) s++;
    else break;
  }
  return s;
};

// --------------------------------------------------------------
// [3.9] Seal / badge system (deterministic)
// --------------------------------------------------------------
/**
 * Predicate: is this day "fully completed" for seal purposes?
 * Rule: non-optional daily fields all logged + day closed.
 * Sleep quality is OPTIONAL and does NOT block a seal.
 * Subjective fields (mood, focus, stress, hunger, cravings, finalEnergy,
 * notes, energy) are OPTIONAL and do NOT block a seal.
 */
const d_isSealedDay = (e) => {
  if (!e || e.day === 0) return false;
  if (!e.closed) return false;
  if (!e.training) return false;
  if (!e.sauna) return false;
  if (!e.hbot) return false;
  if (!e.redLight) return false;
  if (!e.fiber) return false;
  if (!e.brazilNuts) return false;
  if (e.weight == null) return false;
  if (e.sleepH == null) return false;
  if (e.recovery == null) return false;
  if (e.diet == null) return false;
  if (e.alcohol !== false) return false;
  return true;
};

/**
 * Count total seals earned so far (across the 90 days).
 * Pre-launch day (day 0) is excluded.
 */
const d_countSeals = (entries) => {
  if (!Array.isArray(entries)) return 0;
  return entries.filter(d_isSealedDay).length;
};

/**
 * Seal streak predicates — pure, composable.
 * Pass any of these to d_streak(entries, predicate).
 */
const d_pred = {
  sealed: d_isSealedDay,
  training: (e) => !!e.training,
  hbot: (e) => !!e.hbot,
  sauna: (e) => !!e.sauna,
  redLight: (e) => !!e.redLight,
  sleepTarget: (protocol) => (e) =>
    e.sleepH != null && e.sleepH >= (protocol?.sleepTarget ?? 7.5),
  endOfDayClosed: (e) => !!e.closed,
};

// --------------------------------------------------------------
// PUBLIC NAMESPACE
// --------------------------------------------------------------
/**
 * Deterministic — pure math namespace for the system.
 * Consume this from Rule Engine (Piece 4) and Orchestrator (Piece 6).
 * Do NOT call UI or Repository from this layer.
 */
const Deterministic = {
  // primitives
  avg: d_avg,
  last: d_last,
  clamp: d_clamp,
  sum: d_sum,
  count: d_count,
  round: d_round,
  // predicates
  isMorningLogged: d_isMorningLogged,
  isClosed: d_isClosed,
  filterClosed: d_filterClosed,
  hitRate: d_hitRate,
  // compliance
  computeCompliance: d_computeCompliance,
  // composite scores
  computeEnergyScore: d_computeEnergyScore,
  computeRecoveryScore: d_computeRecoveryScore,
  computeMetabolicScore: d_computeMetabolicScore,
  // series + trends
  seriesOf: d_seriesOf,
  scoreTrend: d_scoreTrend,
  windowDelta: d_windowDelta,
  // windows
  splitWindow: d_splitWindow,
  sinceDate: d_sinceDate,
  beforeDate: d_beforeDate,
  // intervention math
  beforeAfterDeltas: d_beforeAfterDeltas,
  // streaks
  streak: d_streak,
  // seals / badges
  isSealedDay: d_isSealedDay,
  countSeals: d_countSeals,
  streakPredicates: d_pred,
};

/* ============================================================
 * [4] RULE ENGINE — deterministic decision layer
 * ------------------------------------------------------------
 * Consumes: Deterministic.* (math), plain inputs (entries,
 *   protocol, labs, bodyComp, interventions).
 * Does NOT consume: Repository, UI, AI Layer.
 *
 * Every exported rule function is pure:
 *   • No side effects.
 *   • No UI state, no JSX, no DOM.
 *   • Returns structured data (arrays of objects).
 *
 * Icon references (Moon, Zap, Heart…) are treated as stable
 * "icon handles" passed through to the UI — not presentation
 * logic. Rule Engine decides WHICH handle, UI decides HOW to
 * render. Future migration to string keys + iconMap is trivial.
 *
 * PUBLIC API:
 *   RuleEngine.detectChangingNow(ctx)
 *   RuleEngine.detectPatterns(ctx)
 *   RuleEngine.rankDrivers(ctx)
 *   RuleEngine.generateTomorrowPlan(ctx)
 *   RuleEngine.scoreInterventionImpacts(ctx)
 *   RuleEngine.buildImpactNarratives(impacts)
 *   RuleEngine.buildWeekEvolution(ctx)
 *   RuleEngine.buildPhaseComparison(ctx)
 *   RuleEngine.assessLongevityAlignment(ctx)
 *   RuleEngine.buildRiskWatch(ctx)
 *   RuleEngine.buildScores(ctx)
 *   RuleEngine.buildImproveShortList(ctx)   [7d actions + static]
 *   RuleEngine.buildExperimentLists(ctx)    [tests + stop]
 *   RuleEngine.run(ctx) — orchestrator returning full shape
 *
 * CTX = {
 *   entries, protocol, labs, bodyComp, interventions,
 *   logged, ready, daysNeeded, recent, prior,
 *   hitRate, metrics
 * }
 * buildContext() normalizes inputs once. Rules read from ctx.
 * ============================================================ */

// --------------------------------------------------------------
// [4.0] Context builder — single source of truth for rule inputs
// --------------------------------------------------------------
/**
 * Build a RuleContext from raw inputs. Called once per run.
 * All rule functions consume this ctx; they never recompute
 * these windows, metrics, or hit rates.
 */
function buildRuleContext({ entries, protocol, labs, bodyComp, interventions }) {
  const logged = Deterministic.filterClosed(entries);
  const { recent, prior } = Deterministic.splitWindow(entries, 7);
  const ready = logged.length >= 3;

  const dMetric = (key) => Deterministic.windowDelta(recent, prior, key);

  const metrics = ready ? {
    dSleep: dMetric("sleepH"),
    dEnergy: dMetric("energy"),
    dRecovery: dMetric("recovery"),
    dFocus: dMetric("focus"),
    dHunger: dMetric("hunger"),
    dCompliance: Deterministic.avg(recent.map(e => Deterministic.computeCompliance(e, protocol))) -
                 Deterministic.avg(prior.map(e => Deterministic.computeCompliance(e, protocol))),
  } : null;

  const hitRate = (key, inv = false) => Deterministic.hitRate(recent, key, inv);

  return {
    entries, protocol, labs, bodyComp, interventions,
    logged, ready, daysNeeded: ready ? 0 : 3 - logged.length,
    recent, prior, hitRate, metrics,
  };
}

// --------------------------------------------------------------
// [4.1] detectChangingNow — "what is happening now"
// Output: array of { status, label, body, icon } objects
// Empty if !ready.
// --------------------------------------------------------------
function detectChangingNow(ctx) {
  const out = [];
  if (!ctx.ready) return out;
  const m = ctx.metrics;
  if (m.dSleep > 0.3) out.push({ status: "better", label: "Sono", body: `+${m.dSleep.toFixed(1)}h vs semana anterior`, icon: Moon });
  if (m.dSleep < -0.3) out.push({ status: "worse", label: "Sono", body: `Caiu ${Math.abs(m.dSleep).toFixed(1)}h`, icon: Moon });
  if (m.dEnergy > 0.5) out.push({ status: "better", label: "Energia", body: `+${m.dEnergy.toFixed(1)} pts`, icon: Zap });
  if (m.dEnergy < -0.5) out.push({ status: "worse", label: "Energia", body: `${m.dEnergy.toFixed(1)} pts`, icon: Zap });
  if (m.dRecovery > 0.5) out.push({ status: "better", label: "Recovery", body: `+${m.dRecovery.toFixed(1)} pts`, icon: Heart });
  if (m.dRecovery < -0.5) out.push({ status: "worse", label: "Recovery", body: `${m.dRecovery.toFixed(1)} pts`, icon: Heart });
  if (m.dFocus > 0.5) out.push({ status: "better", label: "Foco", body: `+${m.dFocus.toFixed(1)} pts`, icon: Brain });
  if (m.dFocus < -0.5) out.push({ status: "worse", label: "Foco", body: `${m.dFocus.toFixed(1)} pts`, icon: Brain });
  if (out.length === 0) out.push({ status: "stable", label: "Perfil estável", body: "Sem deltas relevantes ainda", icon: Gauge });
  return out;
}

// --------------------------------------------------------------
// [4.2] detectPatterns — correlational signals
// Output: array of { title, body, tag, icon } objects.
// --------------------------------------------------------------
function detectPatterns(ctx) {
  const out = [];
  if (!ctx.ready) return out;
  const { recent, protocol, hitRate } = ctx;

  const sleepHighDays = recent.filter(e => e.sleepH >= protocol.sleepTarget);
  const sleepLowDays = recent.filter(e => e.sleepH < protocol.sleepTarget);
  const sleepFocusDelta = Deterministic.avg(sleepHighDays.map(e => e.focus)) - Deterministic.avg(sleepLowDays.map(e => e.focus));
  if (sleepFocusDelta > 1 && sleepHighDays.length >= 3) out.push({
    title: "Sono ≥ meta → Foco mais alto",
    body: `Dias com ≥${protocol.sleepTarget}h de sono mostram +${sleepFocusDelta.toFixed(1)} em foco.`,
    tag: "TSH", icon: Brain,
  });

  const hbotDays = recent.filter(e => e.hbot);
  const noHbotDays = recent.filter(e => !e.hbot);
  const hbotRecDelta = Deterministic.avg(hbotDays.map(e => e.recovery)) - Deterministic.avg(noHbotDays.map(e => e.recovery));
  if (hbotRecDelta > 1 && hbotDays.length >= 3) out.push({
    title: "HBOT ↔ Recovery correlação",
    body: `Dias com HBOT mostram recovery +${hbotRecDelta.toFixed(1)} em média.`,
    tag: "RECOVERY", icon: Droplet,
  });

  const fiberRate = hitRate("fiber");
  const highHungerDays = recent.filter(e => e.hunger >= 7);
  if (fiberRate > 0.7 && highHungerDays.length <= 2) out.push({
    title: "Fibra diária → Fome controlada",
    body: `Fibra solúvel em ${Math.round(fiberRate * 100)}% dos dias parece estar suavizando picos de fome.`,
    tag: "FOME", icon: Leaf,
  });

  const alcoholFreeRate = hitRate("alcohol", true);
  if (alcoholFreeRate === 1) out.push({
    title: "Zero álcool mantido",
    body: `Streak limpo de 7/7. Direto em ALT/GGT.`,
    tag: "FÍGADO", icon: TestTube,
  });
  return out;
}

// --------------------------------------------------------------
// [4.3] rankDrivers — static drivers ranked by impact
// Currently protocol-aware (sleepTarget in title); structured so
// future versions can compute impact dynamically.
// --------------------------------------------------------------
function rankDrivers(ctx) {
  const { protocol } = ctx;
  return [
    { title: "Sono ≥" + protocol.sleepTarget + "h consistente", impact: 5, tag: "TSH",
      body: "Alavanca de maior leverage. Afeta TSH, recovery, foco e fome ao mesmo tempo." },
    { title: "Treino manhã como âncora", impact: 5, tag: "LDL",
      body: "Cardio + força diário. Base do experimento e alavanca primária de LDL." },
    { title: "Zero álcool", impact: 5, tag: "FÍGADO",
      body: "Inegociável para ALT/GGT. Manter o streak vale mais que qualquer suplemento." },
    { title: "Fibra solúvel diária", impact: 4, tag: "LDL",
      body: "Aveia, chia, feijão, psyllium. Liga bile acids → fígado puxa LDL do sangue." },
    { title: "HBOT pós-treino", impact: 4, tag: "RECOVERY",
      body: "Logo depois da sauna. Janela pós-treino maximiza benefício sistêmico." },
    { title: "Proteína 40g+ no café", impact: 4, tag: "FOME",
      body: "Neutraliza perfil de fome alta pelo resto do dia de trabalho." },
  ];
}

// --------------------------------------------------------------
// [4.4] buildImproveShortList — 3-for-tomorrow + static 7d actions
// --------------------------------------------------------------
function buildImproveShortList(ctx) {
  const { ready, metrics, protocol, hitRate } = ctx;
  const improveNow = [];
  if (ready) {
    if (metrics.dSleep < -0.2) improveNow.push({ text: `Antecipar sono em 30 min — meta ${protocol.sleepTarget}h`, tag: "TSH", window: "amanhã" });
    if (hitRate("training") < 0.6) improveNow.push({ text: "Treino manhã mesmo cansado — âncora do dia", tag: "LDL", window: "amanhã" });
    if (hitRate("fiber") < 0.6) improveNow.push({ text: "Deixar aveia + chia prontos na noite anterior", tag: "LDL", window: "amanhã" });
    if (hitRate("brazilNuts") < 0.6) improveNow.push({ text: "Deixar 2 castanhas na mesa do trabalho", tag: "TSH", window: "amanhã" });
    if (hitRate("hbot") < 0.7) improveNow.push({ text: "HBOT imediatamente após sauna", tag: "RECOVERY", window: "amanhã" });
  }
  while (improveNow.length < 3) improveNow.push({ text: "Manter o ritmo — sistema rodando", tag: "BASE", window: "amanhã" });

  const improve7d = [
    { text: "Testar janela fixa de HBOT pós-sauna (bloco inegociável)", tag: "RECOVERY" },
    { text: "Medir cintura e pesagem 3x na semana — reduzir ruído diário", tag: "BASE" },
    { text: "Planejar refeições do trabalho no domingo à noite", tag: "FOME" },
  ];

  return { improveNow: improveNow.slice(0, 3), improve7d };
}

// --------------------------------------------------------------
// [4.5] buildExperimentLists — "tests next" + "stop list"
// --------------------------------------------------------------
function buildExperimentLists(_ctx) {
  const testsNext = [
    { title: "Magnésio glicinato extra à noite", why: "Se sono continuar abaixo da meta, testar dose extra no TSH.", tag: "TSH" },
    { title: "Psyllium husk 5–10g antes do almoço", why: "Potencial boost de fibra solúvel para LDL.", tag: "LDL" },
    { title: "Alongar janela Z2 para 40 min", why: "Mais tempo em Z2 tende a reduzir LDL progressivamente.", tag: "LDL" },
    { title: "Cold exposure pós-HBOT", why: "Pode intensificar recovery se já estiver estável.", tag: "RECOVERY" },
  ];
  const stopList = [
    { title: "Qualquer bebida alcoólica", why: "Direto em ALT/GGT. Não existe dose segura no seu contexto.", tag: "FÍGADO" },
    { title: "Carbos pesados após 21:30", why: "Prejudica qualidade de sono — peso alto no TSH.", tag: "TSH" },
    { title: "Cafeína após 14:00", why: "Compromete adormecer dentro da janela ideal.", tag: "TSH" },
  ];
  return { testsNext, stopList };
}

// --------------------------------------------------------------
// [4.6] buildRiskWatch — static biomarker risk concerns
// --------------------------------------------------------------
function buildRiskWatch(_ctx) {
  return [
    { title: "LDL", tag: "LDL", level: "alta",
      body: "Alvo: cardio 3x/sem + fibra 7/7 + zero álcool + ômega 3 diário. Retestar em 45d.",
      icon: Activity },
    { title: "TSH", tag: "TSH", level: "alta",
      body: "Alvo: sono 7,5h 7/7 + castanha Pará diária + reduzir estresse. Monitorar T3/T4 junto.",
      icon: Brain },
    { title: "Fígado (ALT/GGT)", tag: "FÍGADO", level: "média",
      body: "Alvo: zero álcool + sem ultraprocessados + crucíferos diários. Retestar em 60d.",
      icon: Shield },
    { title: "Fome / saciedade", tag: "FOME", level: "baixa",
      body: "Alvo: 40g proteína manhã + fibra + hidratação. Evitar picos calóricos à noite.",
      icon: Utensils },
    { title: "Composição corporal", tag: "BASE", level: "observar",
      body: "Alvo: manter massa magra durante o processo. Rebioimpedância em 45d.",
      icon: User },
  ];
}

// --------------------------------------------------------------
// [4.7] assessLongevityAlignment — 5 strategies, status derived
// from adherence hit-rates.
// --------------------------------------------------------------
function assessLongevityAlignment(ctx) {
  const { hitRate, recent, protocol } = ctx;
  const ldlAligned = hitRate("training") >= 0.6 && hitRate("fiber") >= 0.6;
  const tshAligned = hitRate("brazilNuts") >= 0.5 && Deterministic.avg(recent.map(e => e.sleepH)) >= protocol.sleepTarget;
  const liverAligned = hitRate("alcohol", true) === 1;
  const satietyAligned = hitRate("fiber") >= 0.6;
  const recoveryAligned = hitRate("hbot") >= 0.6 && hitRate("sauna") >= 0.6;

  return [
    { strategy: "LDL-friendly", icon: Activity, tag: "LDL",
      aligned: ldlAligned,
      note: ldlAligned ? "Cardio + fibra sustentando o alvo" : "Reforçar cardio e fibra diariamente" },
    { strategy: "Thyroid-aware", icon: Brain, tag: "TSH",
      aligned: tshAligned,
      note: tshAligned ? "Sono e selênio sustentando o alvo" : "Priorizar sono consistente e selênio" },
    { strategy: "Liver-friendly", icon: Shield, tag: "FÍGADO",
      aligned: liverAligned,
      note: liverAligned ? "Zero álcool mantido" : "Qualquer álcool quebra a estratégia" },
    { strategy: "Satiety control", icon: Utensils, tag: "FOME",
      aligned: satietyAligned,
      note: satietyAligned ? "Fibra dominando a curva de fome" : "Aumentar consistência de fibra" },
    { strategy: "Recovery compounding", icon: Heart, tag: "RECOVERY",
      aligned: recoveryAligned,
      note: recoveryAligned ? "Stack HBOT + sauna consistente" : "Estabilizar janela de recovery pós-treino" },
  ];
}

// --------------------------------------------------------------
// [4.8] scoreInterventionImpacts — before/after deltas per
// intervention, classifying verdict positivo/negativo/neutro.
// --------------------------------------------------------------
function scoreInterventionImpacts(ctx) {
  const { interventions, logged, protocol } = ctx;
  const impacts = [];
  const sorted = [...interventions].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  sorted.forEach((iv) => {
    const ivDate = iv.date;
    const before = logged.filter(e => e.date < ivDate).slice(-7);
    const after = logged.filter(e => e.date >= ivDate).slice(0, 7);

    if (before.length < 2 || after.length < 2) {
      impacts.push({ ...iv, ready: false, daysAfter: after.length });
      return;
    }

    const deltas = {
      sleep: Deterministic.windowDelta(after, before, "sleepH"),
      energy: Deterministic.windowDelta(after, before, "energy"),
      recovery: Deterministic.windowDelta(after, before, "recovery"),
      focus: Deterministic.windowDelta(after, before, "focus"),
      hunger: Deterministic.windowDelta(after, before, "hunger"),
      compliance: Deterministic.avg(after.map(e => Deterministic.computeCompliance(e, protocol))) -
                  Deterministic.avg(before.map(e => Deterministic.computeCompliance(e, protocol))),
    };

    const signals = Object.entries(deltas).map(([k, v]) => ({ metric: k, delta: v }));
    const strongest = signals.reduce((a, b) => Math.abs(b.delta) > Math.abs(a.delta) ? b : a);

    const verdict = Math.abs(strongest.delta) < 0.3 ? "neutro" :
                    (strongest.metric === "hunger" ? strongest.delta < 0 : strongest.delta > 0) ? "positivo" : "negativo";

    impacts.push({
      ...iv, ready: true, deltas, strongest, verdict,
      daysAfter: after.length, daysBefore: before.length,
    });
  });

  return { impacts, recentIntervention: sorted[sorted.length - 1] };
}

// --------------------------------------------------------------
// [4.9] buildImpactNarratives — derive human-readable narratives
// from ready impacts with non-neutral verdicts.
// --------------------------------------------------------------
function buildImpactNarratives(impacts) {
  const labelMap = { sleep: "Sono", energy: "Energia", recovery: "Recovery", focus: "Foco", hunger: "Fome", compliance: "Compliance" };
  return impacts.filter(i => i.ready && i.verdict !== "neutro").map(iv => {
    const metricLabel = labelMap[iv.strongest.metric];
    const direction = iv.strongest.delta > 0 ? "subiu" : "caiu";
    const magnitude = Math.abs(iv.strongest.delta).toFixed(1);
    const verbAfter = iv.action === "start" ? "após iniciar" :
                      iv.action === "stop" ? "após parar" : "após modificar";
    return {
      id: iv.id,
      narrative: `${metricLabel} ${direction} ${magnitude} ${verbAfter} "${iv.title}"`,
      verdict: iv.verdict,
      metric: iv.strongest.metric,
      delta: iv.strongest.delta,
      date: iv.date,
      daysBefore: iv.daysBefore,
      daysAfter: iv.daysAfter,
      tag: iv.tag || (iv.category === "supplement" ? "BASE"
                   : iv.category === "diet" ? "FOME"
                   : iv.category === "training" ? "LDL"
                   : iv.category === "hbot" ? "RECOVERY" : "BASE"),
    };
  });
}

// --------------------------------------------------------------
// [4.10] buildScores — current composite scores + trends
// --------------------------------------------------------------
function buildScores(ctx) {
  const { entries, recent, protocol } = ctx;
  return {
    energy: {
      current: Deterministic.avg(recent.map(e => Deterministic.computeEnergyScore(e, protocol))),
      trend: Deterministic.scoreTrend(entries, Deterministic.computeEnergyScore, protocol),
    },
    recovery: {
      current: Deterministic.avg(recent.map(e => Deterministic.computeRecoveryScore(e, protocol))),
      trend: Deterministic.scoreTrend(entries, Deterministic.computeRecoveryScore, protocol),
    },
    metabolic: {
      current: Deterministic.avg(recent.map(e => Deterministic.computeMetabolicScore(e, protocol))),
      trend: Deterministic.scoreTrend(entries, Deterministic.computeMetabolicScore, protocol),
    },
  };
}

// --------------------------------------------------------------
// [4.11] generateTomorrowPlan — decision engine output
// 3 ranked actions, prioritized by biomarker impact + adherence
// gaps + recent intervention context.
// --------------------------------------------------------------
function generateTomorrowPlan(ctx, recentIntervention) {
  const { ready, metrics, recent, protocol, hitRate, entries } = ctx;
  const candidates = [];

  if (ready) {
    const sleepShortfall = protocol.sleepTarget - Deterministic.avg(recent.map(e => e.sleepH));
    if (sleepShortfall > 0.3) candidates.push({
      priority: 100 + Math.round(sleepShortfall * 20),
      action: `Dormir ${protocol.sleepTarget}h esta noite`,
      why: `Média de 7 dias está ${sleepShortfall.toFixed(1)}h abaixo da meta. Com TSH elevado, sono é a alavanca mais cara de ignorar.`,
      how: "Iniciar wind-down às 22:00. Magnésio 21:45. Sem telas depois das 22:30.",
      tag: "TSH", icon: Moon,
    });

    if (hitRate("training") < 0.55) candidates.push({
      priority: 90 + (0.55 - hitRate("training")) * 50,
      action: "Treino manhã 07:00 (cardio + força)",
      why: `Treino em apenas ${Math.round(hitRate("training") * 100)}% dos dias. Cardio é alavanca primária de LDL.`,
      how: "Mochila pronta na noite anterior. Despertar 06:30 mesmo cansado.",
      tag: "LDL", icon: Dumbbell,
    });

    if (hitRate("fiber") < 0.6) candidates.push({
      priority: 80 + (0.6 - hitRate("fiber")) * 50,
      action: "30g de fibra solúvel amanhã",
      why: `Fibra em ${Math.round(hitRate("fiber") * 100)}% dos dias. Liga bile acids → LDL desce.`,
      how: "Aveia 50g café + chia 2 col almoço + feijão jantar. Deixar pronto hoje.",
      tag: "LDL", icon: Leaf,
    });

    if (hitRate("hbot") < 0.7) candidates.push({
      priority: 75 + (metrics.dRecovery < 0 ? 15 : 0),
      action: "HBOT 60 min logo após sauna",
      why: `HBOT em ${Math.round(hitRate("hbot") * 100)}% dos dias. Janela pós-treino maximiza benefício.`,
      how: "Encadear sauna 08:15 → HBOT 08:45. Bloco fixo inegociável.",
      tag: "RECOVERY", icon: Droplet,
    });

    if (hitRate("brazilNuts") < 0.6) candidates.push({
      priority: 70,
      action: "2 castanhas do Pará no almoço",
      why: `Selênio em apenas ${Math.round(hitRate("brazilNuts") * 100)}% dos dias. Apoia conversão T4→T3.`,
      how: "Deixar pote na mesa de trabalho. Comer junto com o almoço.",
      tag: "TSH", icon: Sparkles,
    });

    if (hitRate("alcohol") > 0) candidates.push({
      priority: 95,
      action: "Zero álcool amanhã",
      why: "Qualquer dose eleva ALT/GGT. Quebra streak de proteção hepática.",
      how: "Substituir por água com gás + limão se houver situação social.",
      tag: "FÍGADO", icon: TestTube,
    });

    if (Deterministic.avg(recent.map(e => e.hunger)) >= 7) candidates.push({
      priority: 65,
      action: "40g+ proteína no café da manhã",
      why: `Fome média ${Deterministic.avg(recent.map(e => e.hunger)).toFixed(1)}/10. Proteína forte no AM blinda o dia.`,
      how: "Whey 40g + 2 ovos ou iogurte grego. Preparar antes de deitar.",
      tag: "FOME", icon: Beef,
    });

    if (metrics.dEnergy < -0.5) candidates.push({
      priority: 60,
      action: "Dia mais leve com foco em recovery",
      why: `Energia caiu ${Math.abs(metrics.dEnergy).toFixed(1)} pts. Sinal de acumular fadiga.`,
      how: "Manter treino curto (40 min). Reforçar sauna + HBOT + dormir 15 min mais cedo.",
      tag: "RECOVERY", icon: Heart,
    });

    if (metrics.dCompliance < -5) candidates.push({
      priority: 55,
      action: "Resetar com dia 10/10",
      why: `Compliance caiu ${Math.abs(metrics.dCompliance).toFixed(0)}%. Momento de reancorar o sistema.`,
      how: "Cumprir todos os itens do protocolo. Nenhum atalho.",
      tag: "BASE", icon: Target,
    });
  }

  // Fallback: pre-ready days use today's entry as signal.
  const todayEntry = entries[entries.length - 1];
  if (!ready && todayEntry) {
    if (!todayEntry.training) candidates.push({ priority: 90, action: "Treino manhã 07:00", why: "Base do protocolo.", how: "Mochila pronta na noite anterior.", tag: "LDL", icon: Dumbbell });
    if (!todayEntry.fiber) candidates.push({ priority: 80, action: "30g de fibra solúvel", why: "Alavanca LDL.", how: "Aveia + chia.", tag: "LDL", icon: Leaf });
    if (!todayEntry.brazilNuts) candidates.push({ priority: 70, action: "2 castanhas do Pará", why: "Selênio para TSH.", how: "Junto com o almoço.", tag: "TSH", icon: Sparkles });
    if (!todayEntry.hbot) candidates.push({ priority: 75, action: "HBOT 60 min", why: "Recovery compounding.", how: "Após sauna.", tag: "RECOVERY", icon: Droplet });
  }

  // Boost priority where a recent intervention is topically linked.
  if (recentIntervention) {
    candidates.forEach(c => {
      if (recentIntervention.tags?.some(t => c.tag.toLowerCase().includes(t)) ||
          (recentIntervention.category === "diet" && c.tag === "LDL") ||
          (recentIntervention.category === "training" && c.tag === "LDL")) {
        c.priority += 10;
        c.linkedIntervention = recentIntervention.title;
      }
    });
  }

  return candidates.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

// --------------------------------------------------------------
// [4.12] buildWeekEvolution — recent vs prior window aggregates
// Returns null if !ready.
// --------------------------------------------------------------
function buildWeekEvolution(ctx) {
  const { ready, recent, prior, protocol } = ctx;
  if (!ready) return null;
  return {
    days: recent.length,
    compliance: {
      current: Math.round(Deterministic.avg(recent.map(e => Deterministic.computeCompliance(e, protocol)))),
      prior: Math.round(Deterministic.avg(prior.map(e => Deterministic.computeCompliance(e, protocol)))),
    },
    energy: {
      current: Deterministic.avg(recent.map(e => Deterministic.computeEnergyScore(e, protocol))),
      prior: Deterministic.avg(prior.map(e => Deterministic.computeEnergyScore(e, protocol))),
    },
    recovery: {
      current: Deterministic.avg(recent.map(e => Deterministic.computeRecoveryScore(e, protocol))),
      prior: Deterministic.avg(prior.map(e => Deterministic.computeRecoveryScore(e, protocol))),
    },
    metabolic: {
      current: Deterministic.avg(recent.map(e => Deterministic.computeMetabolicScore(e, protocol))),
      prior: Deterministic.avg(prior.map(e => Deterministic.computeMetabolicScore(e, protocol))),
    },
    highlights: {
      bestDay: recent.reduce((a, b) => (Deterministic.computeCompliance(b, protocol) > Deterministic.computeCompliance(a, protocol) ? b : a), recent[0]),
      worstDay: recent.reduce((a, b) => (Deterministic.computeCompliance(b, protocol) < Deterministic.computeCompliance(a, protocol) ? b : a), recent[0]),
      sleepAvg: Deterministic.avg(recent.map(e => e.sleepH)),
      trainingHits: recent.filter(e => e.training).length,
      hbotHits: recent.filter(e => e.hbot).length,
    },
  };
}

// --------------------------------------------------------------
// [4.13] buildPhaseComparison — Days 1-30 / 31-60 / 61-90
// Returns [] if no logged days.
// --------------------------------------------------------------
function buildPhaseComparison(ctx) {
  const { logged, protocol } = ctx;
  if (logged.length < 1) return [];
  return [
    { label: "Dias 1–30", range: [1, 30], entries: logged.filter(e => e.day >= 1 && e.day <= 30) },
    { label: "Dias 31–60", range: [31, 60], entries: logged.filter(e => e.day >= 31 && e.day <= 60) },
    { label: "Dias 61–90", range: [61, 90], entries: logged.filter(e => e.day >= 61 && e.day <= 90) },
  ].map(p => ({
    ...p,
    n: p.entries.length,
    compliance: p.entries.length ? Math.round(Deterministic.avg(p.entries.map(e => Deterministic.computeCompliance(e, protocol)))) : null,
    energy: p.entries.length ? Math.round(Deterministic.avg(p.entries.map(e => Deterministic.computeEnergyScore(e, protocol)))) : null,
    recovery: p.entries.length ? Math.round(Deterministic.avg(p.entries.map(e => Deterministic.computeRecoveryScore(e, protocol)))) : null,
    metabolic: p.entries.length ? Math.round(Deterministic.avg(p.entries.map(e => Deterministic.computeMetabolicScore(e, protocol)))) : null,
    sleepAvg: p.entries.length ? Deterministic.avg(p.entries.map(e => e.sleepH)) : null,
  }));
}

// --------------------------------------------------------------
// PUBLIC NAMESPACE
// --------------------------------------------------------------
const RuleEngine = {
  buildContext: buildRuleContext,
  detectChangingNow,
  detectPatterns,
  rankDrivers,
  buildImproveShortList,
  buildExperimentLists,
  buildRiskWatch,
  assessLongevityAlignment,
  scoreInterventionImpacts,
  buildImpactNarratives,
  buildScores,
  generateTomorrowPlan,
  buildWeekEvolution,
  buildPhaseComparison,
  /**
   * Orchestrator — runs all rules in the correct order and
   * returns the unified shape consumed by the UI today.
   */
  run: (inputs) => {
    const ctx = buildRuleContext(inputs);
    const { ready, daysNeeded, metrics } = ctx;
    const changingNow = detectChangingNow(ctx);
    const patterns = detectPatterns(ctx);
    const drivers = rankDrivers(ctx);
    const { improveNow, improve7d } = buildImproveShortList(ctx);
    const { testsNext, stopList } = buildExperimentLists(ctx);
    const riskWatch = buildRiskWatch(ctx);
    const longevity = assessLongevityAlignment(ctx);
    const { impacts: interventionImpacts, recentIntervention } = scoreInterventionImpacts(ctx);
    const impactNarratives = buildImpactNarratives(interventionImpacts);
    const scores = buildScores(ctx);
    const tomorrowPlan = generateTomorrowPlan(ctx, recentIntervention);
    const weekEvolution = buildWeekEvolution(ctx);
    const phaseComparison = buildPhaseComparison(ctx);

    return {
      ready, daysNeeded, metrics,
      changingNow, patterns, drivers,
      improveNow, improve7d,
      testsNext, stopList,
      riskWatch, longevity,
      interventionImpacts, recentIntervention,
      scores, tomorrowPlan,
      impactNarratives, weekEvolution, phaseComparison,
    };
  },
};

/* ============================================================
 * [5] AI EXTENSION LAYER
 * ------------------------------------------------------------
 * Hook-only layer. NO LLM calls are made in v1.
 *
 * POSITION IN THE STACK:
 *   Rule Engine → AI Layer → UI
 *   The AI Layer sits on top of RuleEngine.run() output. It
 *   receives a fully-formed, deterministic result and MAY
 *   enrich specific fields (narratives, explanations, deep
 *   analysis) when AI_ENABLED becomes true in Option C.
 *
 * PRINCIPLES:
 *   1. Passthrough by default. With AI_ENABLED = false, every
 *      function returns its input unchanged (or null where the
 *      output is additive). The app behaves 100% as if this
 *      layer did not exist.
 *   2. No side effects, no network, no state — just like
 *      Deterministic + RuleEngine. In Option C, the concrete
 *      implementation will make async calls; v1 stays sync.
 *   3. Explicit contracts. Each hook documents its inputs, its
 *      output shape, and the exact prompt skeleton that the
 *      Option C implementation will use.
 *
 * FUTURE MIGRATION TO OPTION C:
 *   Flip AI_ENABLED = true, replace the function bodies with
 *   async LLM calls that follow the documented prompt skeletons,
 *   add a caching layer keyed by (userId, input hash), and update
 *   the orchestrator to await where needed. UI already consumes
 *   these fields — it will light up automatically.
 *
 * PUBLIC API (signatures stable):
 *   AILayer.enrichTomorrowPlan(rulePlan, context) → Action[]
 *   AILayer.generateWeeklyNarrative(summary, context) → string | null
 *   AILayer.explainInterventionImpact(impact, context) → string | null
 *   AILayer.generateDeepAnalysis(context) → DeepAnalysis | null
 *   AILayer.apply(ruleResult, context) → EnrichedResult
 *
 * CONTEXT OBJECT (shared by all hooks):
 *   {
 *     entries, protocol, labs, bodyComp,
 *     interventions, weeklySummaries,
 *     logged, recent, prior,
 *     ready, daysNeeded,
 *   }
 * ============================================================ */

// --------------------------------------------------------------
// [5.0] GLOBAL FLAG — hard kill switch
// --------------------------------------------------------------
/**
 * AI_ENABLED
 *   false → layer is a pure passthrough. No behavior change.
 *   true  → layer MAY call out to an LLM and enrich rule outputs.
 *
 * v1 ships with AI_ENABLED = false. Do not flip this until the
 * concrete implementation is wired, tested, and budgeted.
 */
const AI_ENABLED = false;

// --------------------------------------------------------------
// [5.1] enrichTomorrowPlan
// --------------------------------------------------------------
/**
 * INPUT:
 *   rulePlan: Array<{
 *     priority: number,
 *     action: string,
 *     why: string,
 *     how: string,
 *     tag: "LDL"|"TSH"|"FÍGADO"|"FOME"|"RECOVERY"|"BASE",
 *     icon: IconHandle,
 *     linkedIntervention?: string,
 *   }>
 *   context: AIContext
 *
 * OUTPUT:
 *   Same shape as input. Each item MAY gain an optional
 *   `aiRationale` string field when AI_ENABLED = true.
 *
 * v1 BEHAVIOR:
 *   Return `rulePlan` unchanged. Guarantees zero behavior drift.
 *
 * FUTURE PROMPT (Option C):
 *   System: "You are a performance coach. Given the user's last
 *   7 days of logs, elevated biomarkers (LDL/TSH/liver), and a
 *   rule-generated tomorrow plan, write a 1-sentence rationale
 *   per item that references specific evidence from the data.
 *   Never invent facts. Never override the ranked order."
 *   User: JSON.stringify({ rulePlan, context })
 *   Response schema: Array<{ index, aiRationale: string }>
 *   Then merge by index. Timeout 3s, fallback = rulePlan.
 */
function enrichTomorrowPlan(rulePlan, _context) {
  if (!AI_ENABLED) return rulePlan;
  // TODO (Option C): call LLM with the prompt above, merge rationales.
  return rulePlan;
}

// --------------------------------------------------------------
// [5.2] generateWeeklyNarrative
// --------------------------------------------------------------
/**
 * INPUT:
 *   summary: WeeklySummary  (from Data Model [1.7])
 *   context: AIContext
 *
 * OUTPUT:
 *   string | null
 *   A 3–5 sentence narrative summarizing the week, referencing
 *   scores, highlights, and 1–2 non-obvious observations.
 *
 * v1 BEHAVIOR:
 *   Returns null. The UI already renders a rule-generated
 *   weekEvolution block; absence of narrative just hides the
 *   dedicated prose card (currently not displayed).
 *
 * FUTURE PROMPT (Option C):
 *   System: "You are a longevity copilot writing a weekly brief
 *   for a subject running a 90-day self-experiment. Use careful,
 *   probabilistic language. Never fabricate numbers. Cite the
 *   specific metrics from the provided summary object."
 *   User: JSON.stringify({ summary, context })
 *   Schema: { narrative: string (≤400 chars) }
 *   Persistence: write into WeeklySummary.narrative + set
 *                source = "ai" via weeklySummariesRepo.upsert().
 */
function generateWeeklyNarrative(_summary, _context) {
  if (!AI_ENABLED) return null;
  // TODO (Option C): call LLM on week close, persist to summary.
  return null;
}

// --------------------------------------------------------------
// [5.3] explainInterventionImpact
// --------------------------------------------------------------
/**
 * INPUT:
 *   impact: {
 *     ...Intervention fields,
 *     ready: boolean,
 *     deltas: { sleep, energy, recovery, focus, hunger, compliance },
 *     strongest: { metric, delta },
 *     verdict: "positivo"|"negativo"|"neutro",
 *     daysBefore: number, daysAfter: number,
 *   }
 *   context: AIContext
 *
 * OUTPUT:
 *   string | null
 *   A 1–2 sentence explanation linking the intervention to the
 *   observed change, with an honest uncertainty caveat.
 *
 * v1 BEHAVIOR:
 *   Returns null. UI falls back to the rule-generated
 *   impactNarratives[].narrative string (short, deterministic).
 *
 * FUTURE PROMPT (Option C):
 *   System: "Explain the likely relationship between this
 *   intervention and the observed metric change in ≤2 sentences.
 *   If the sample is small or confounded, say so. Do not claim
 *   causation. Match the user's Portuguese tone."
 *   Schema: { explanation: string, confidence: "alta"|"média"|"baixa" }
 */
function explainInterventionImpact(_impact, _context) {
  if (!AI_ENABLED) return null;
  // TODO (Option C): call LLM per impact. Cache by impact.id + data hash.
  return null;
}

// --------------------------------------------------------------
// [5.4] generateDeepAnalysis
// --------------------------------------------------------------
/**
 * INPUT:
 *   context: AIContext  (full state snapshot)
 *
 * OUTPUT:
 *   DeepAnalysis | null
 *   {
 *     hiddenPatterns: Array<{ title, body, confidence }>,
 *     whatToTest: Array<{ title, why, risk }>,
 *     strategyShifts: Array<{ area, suggestion }>,
 *   }
 *
 * v1 BEHAVIOR:
 *   Returns null. UI does not yet surface a "Deep Analysis"
 *   card; when it does, rule-based fallbacks (patterns, tests,
 *   longevity alignment) cover the same territory.
 *
 * FUTURE PROMPT (Option C):
 *   System: "You are a longevity research analyst. Given 30+ days
 *   of adherence + state logs + labs + interventions, surface
 *   up to 3 non-obvious patterns, 3 experiments worth running,
 *   and 3 strategy shifts. Cite the exact metric that supports
 *   each claim. Use cautious language."
 *   Schedule: run weekly, not per-session. Cache the result in
 *   WeeklySummary via weeklySummariesRepo.upsert().
 */
function generateDeepAnalysis(_context) {
  if (!AI_ENABLED) return null;
  // TODO (Option C): schedule weekly, persist in WeeklySummary.
  return null;
}

// --------------------------------------------------------------
// [5.5] AILayer.apply — single entry point used by the orchestrator
// --------------------------------------------------------------
/**
 * Takes the output of RuleEngine.run() and returns an enriched
 * object of the same shape plus additive AI fields:
 *   {
 *     ...ruleResult,
 *     tomorrowPlan,                   // possibly enriched
 *     aiWeeklyNarrative: string|null,
 *     aiDeepAnalysis: DeepAnalysis|null,
 *     aiImpactExplanations: { [impactId]: string } | null,
 *   }
 *
 * v1 BEHAVIOR:
 *   With AI_ENABLED = false, adds null/empty fields only.
 *   UI treats these as optional and renders deterministic data.
 *   Zero behavior change guaranteed.
 */
function applyAILayer(ruleResult, context) {
  if (!AI_ENABLED) {
    return {
      ...ruleResult,
      aiWeeklyNarrative: null,
      aiDeepAnalysis: null,
      aiImpactExplanations: null,
    };
  }
  // TODO (Option C): call each hook, merge outputs, handle
  //   timeouts/failures gracefully — never throw from here.
  const enrichedPlan = enrichTomorrowPlan(ruleResult.tomorrowPlan, context);
  const weekly = generateWeeklyNarrative(null, context);
  const deep = generateDeepAnalysis(context);
  const explanations = {};
  (ruleResult.interventionImpacts || []).forEach(imp => {
    if (imp.ready) {
      const exp = explainInterventionImpact(imp, context);
      if (exp) explanations[imp.id] = exp;
    }
  });
  return {
    ...ruleResult,
    tomorrowPlan: enrichedPlan,
    aiWeeklyNarrative: weekly,
    aiDeepAnalysis: deep,
    aiImpactExplanations: Object.keys(explanations).length ? explanations : null,
  };
}

// --------------------------------------------------------------
// PUBLIC NAMESPACE
// --------------------------------------------------------------
const AILayer = {
  AI_ENABLED,
  enrichTomorrowPlan,
  generateWeeklyNarrative,
  explainInterventionImpact,
  generateDeepAnalysis,
  apply: applyAILayer,
};

/* ============================================================
 * [6] SYSTEM ORCHESTRATOR
 * ------------------------------------------------------------
 * Official pipeline. This is the single function the App shell
 * uses to produce the fully composed SystemState for the UI.
 *
 * PIPELINE:
 *   Repository.snapshot()
 *     → RuleEngine.run(snapshot)
 *     → AILayer.apply(ruleResult, context)
 *     → SystemState
 *
 * CONTRACT:
 *   • Orchestrator is pure w.r.t. business composition.
 *   • Repository provides data (via .snapshot()).
 *   • Orchestrator composes layers.
 *   • UI consumes SystemState — never Layers directly.
 *   • AI_ENABLED = false in v1 → passthrough, zero behavior drift.
 *
 * SYSTEMSTATE SHAPE (consumed by App shell & screens):
 *   {
 *     data:   { protocol, today, entries, interventions, labs,
 *               bodyComp, supplements, weeklySummaries },
 *     math:   { currentCompliance, currentScores, checklistState },
 *     rules:  { ...full RuleEngine.run() output },
 *     ai:     { aiWeeklyNarrative, aiDeepAnalysis, aiImpactExplanations },
 *     view:   { today, progressPct, isPreLaunch, currentPhase },
 *   }
 *
 * The split keeps intent crystal clear:
 *   • data   — raw facts, no computation
 *   • math   — deterministic scores for "right now"
 *   • rules  — structured reasoning (the old `ai` prop)
 *   • ai     — future LLM-generated fields (null in v1)
 *   • view   — tiny UI-helpers derived from data (today label,
 *              progress %, phase). These are not business logic;
 *              they exist to keep screens simple.
 * ============================================================ */

/**
 * buildSystemState(snapshot)
 *
 * Pure function. Given a storage snapshot, return the complete
 * SystemState. Consumed by the App shell via useMemo.
 *
 * No side effects. No access to Repository or UI.
 */
function buildSystemState(snapshot) {
  const {
    protocol, entries, interventions, labs, bodyComp,
    supplements, weeklySummaries, checklistState,
  } = snapshot;

  // ----- [6.1] Rule Engine pass -------------------------------
  const ruleResult = RuleEngine.run({
    entries, protocol, labs, bodyComp, interventions,
  });

  // Rebuild the same context the Rule Engine used, so the AI
  // Layer (future) can reason with full adjacency to rules.
  const ruleContext = RuleEngine.buildContext({
    entries, protocol, labs, bodyComp, interventions,
  });

  // ----- [6.2] AI Layer pass (passthrough in v1) --------------
  const aiContext = {
    ...ruleContext,
    weeklySummaries,
    supplements,
    // labs/bodyComp already in ruleContext; surfaced again for
    // intention-revealing code in future AI prompts.
  };
  const enriched = AILayer.apply(ruleResult, aiContext);

  // ----- [6.3] Current-day determinism for UI shortcuts -------
  // `today` = most recent entry by date. Repository guarantees
  // sorted order via snapshot().entries.
  const today = entries.length ? entries[entries.length - 1] : null;

  const currentCompliance = today
    ? Deterministic.computeCompliance(today, protocol)
    : 0;

  const currentScores = today ? {
    energy: Deterministic.computeEnergyScore(today, protocol),
    recovery: Deterministic.computeRecoveryScore(today, protocol),
    metabolic: Deterministic.computeMetabolicScore(today, protocol),
  } : { energy: null, recovery: null, metabolic: null };

  // ----- [6.4] View helpers — pure, display-only --------------
  const isPreLaunch = !today || today.day === 0;
  const progressPct = isPreLaunch ? 0 : Math.round(today.day / 90 * 100);

  // ----- [6.5] Assemble SystemState ---------------------------
  return {
    // raw data — unmutated copies from the snapshot
    data: {
      protocol,
      entries,
      interventions,
      labs,
      bodyComp,
      supplements,
      weeklySummaries,
      today,
    },

    // deterministic "right now" math
    math: {
      currentCompliance,
      currentScores,
      checklistState,
    },

    // full rule-engine output (same shape UI already consumes)
    rules: enriched,

    // additive AI fields (null in v1 because AI_ENABLED = false)
    ai: {
      aiWeeklyNarrative: enriched.aiWeeklyNarrative,
      aiDeepAnalysis: enriched.aiDeepAnalysis,
      aiImpactExplanations: enriched.aiImpactExplanations,
    },

    // display-only helpers
    view: {
      today,
      isPreLaunch,
      progressPct,
      currentPhase: currentPhase(), // TZ-aware, morning/day/night
    },
  };
}

/**
 * Stable public export for the orchestrator. App shell calls this.
 */
const SystemOrchestrator = {
  build: buildSystemState,
};

/* ============================================================
 * [7] UI LAYER
 * ------------------------------------------------------------
 * Consumes ONLY SystemState (assembled by the Orchestrator).
 * Never calls Repository, RuleEngine, or AILayer directly.
 * Math references go through Deterministic.* explicitly for
 * the few cases where a component needs a fresh computation
 * of a display value derived from data it already has.
 * ============================================================ */

// ============================================================
// UI PRIMITIVES
// ============================================================
const Card = ({ children, className = "" }) => (
  <div className={`relative bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-5 ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children, action }) => (
  <div className="flex items-center justify-between px-1 mb-3">
    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold">{children}</div>
    {action}
  </div>
);

const Ring = ({ value, size = 88, stroke = 8, color = "#10b981" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  const gradId = `ring-${color.replace("#", "")}-${size}`;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.8} />
          <stop offset="100%" stopColor={color} stopOpacity={1} />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#27272a" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={`url(#${gradId})`}
        strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }} />
    </svg>
  );
};

const Slider = ({ label, value, onChange, min = 0, max = 10, colorStops }) => {
  const pct = ((value || 0) - min) / (max - min) * 100;
  const color = colorStops ? (pct < 40 ? "#ef4444" : pct < 70 ? "#f59e0b" : "#10b981") : "#10b981";
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-zinc-300">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-base text-white font-bold tabular-nums">{value ?? "—"}</span>
          {value != null && <span className="text-[10px] text-zinc-500">/ {max}</span>}
        </div>
      </div>
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden pointer-events-none">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${color}80, ${color})` }} />
      </div>
      <input type="range" min={min} max={max} value={value || 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-11 opacity-0 absolute left-0 -mt-9 cursor-pointer" />
    </div>
  );
};

const QuickAction = ({ label, value, onChange, icon: Icon, color = "emerald", time }) => {
  const colorMap = {
    emerald: "bg-emerald-500/15 border-emerald-500/50 text-emerald-200",
    amber: "bg-amber-500/15 border-amber-500/50 text-amber-200",
    blue: "bg-blue-500/15 border-blue-500/50 text-blue-200",
    rose: "bg-rose-500/15 border-rose-500/50 text-rose-200",
    indigo: "bg-indigo-500/15 border-indigo-500/50 text-indigo-200",
  };
  const iconColorMap = {
    emerald: "text-emerald-400", amber: "text-amber-400", blue: "text-blue-400",
    rose: "text-rose-400", indigo: "text-indigo-400",
  };
  return (
    <button onClick={() => onChange(!value)}
      className={`relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all active:scale-95 min-h-[86px] ${
        value ? colorMap[color] : "bg-zinc-900/40 border-zinc-800 text-zinc-500"
      }`}>
      <Icon size={20} className={value ? iconColorMap[color] : "text-zinc-600"} strokeWidth={2.25} />
      <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      {time && <span className={`text-[9px] ${value ? "opacity-80" : "text-zinc-600"}`}>{time}</span>}
      {value && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check size={10} className="text-black" strokeWidth={3} />
        </div>
      )}
    </button>
  );
};

const tagColor = {
  LDL: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  TSH: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  "FÍGADO": "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  FOME: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  RECOVERY: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  BASE: "bg-zinc-700/40 text-zinc-300 border-zinc-700",
};

// ============================================================
// HOME — MISSION CONTROL
// ============================================================
// ============================================================
// HOME — Seals + Streaks subcomponent (premium, não intrusivo)
// ============================================================
const HomeSealsStreaks = ({ entries, protocol, today }) => {
  const SEAL_GOAL = 70;
  const TOTAL_DAYS = 90;

  const data = useMemo(() => {
    const sealCount = Deterministic.countSeals(entries);
    const perfectStreak = Deterministic.streak(entries, Deterministic.streakPredicates.sealed);
    const trainingStreak = Deterministic.streak(entries, Deterministic.streakPredicates.training);
    const hbotStreak = Deterministic.streak(entries, Deterministic.streakPredicates.hbot);
    const saunaStreak = Deterministic.streak(entries, Deterministic.streakPredicates.sauna);
    const redLightStreak = Deterministic.streak(entries, Deterministic.streakPredicates.redLight);
    const sleepStreak = Deterministic.streak(entries, Deterministic.streakPredicates.sleepTarget(protocol));
    const closedStreak = Deterministic.streak(entries, Deterministic.streakPredicates.endOfDayClosed);
    return {
      sealCount,
      perfectStreak,
      trainingStreak,
      hbotStreak,
      saunaStreak,
      redLightStreak,
      sleepStreak,
      closedStreak,
    };
  }, [entries, protocol]);

  const pct = Math.min(100, (data.sealCount / SEAL_GOAL) * 100);
  const onPace = today.day > 0 ? data.sealCount >= Math.round((today.day / TOTAL_DAYS) * SEAL_GOAL) : true;

  const streakChips = [
    { key: "perfect", label: "Perfect", value: data.perfectStreak, icon: Sparkles, color: "text-emerald-400" },
    { key: "training", label: "Treino", value: data.trainingStreak, icon: Dumbbell, color: "text-amber-400" },
    { key: "hbot", label: "HBOT", value: data.hbotStreak, icon: Droplet, color: "text-cyan-400" },
    { key: "sauna", label: "Sauna", value: data.saunaStreak, icon: Flame, color: "text-orange-400" },
    { key: "red", label: "RedLight", value: data.redLightStreak, icon: Sun, color: "text-rose-400" },
    { key: "sleep", label: "Sono", value: data.sleepStreak, icon: Moon, color: "text-indigo-400" },
    { key: "close", label: "Fechou", value: data.closedStreak, icon: Check, color: "text-zinc-300" },
  ];

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
      {/* Seal progress */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <Bookmark size={13} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Selos</div>
            <div className="text-[15px] font-bold text-white tabular-nums leading-none">
              {data.sealCount}
              <span className="text-[11px] text-zinc-500 font-semibold">/{SEAL_GOAL}</span>
            </div>
          </div>
        </div>
        <div className={`text-[9px] font-semibold uppercase tracking-wider ${onPace ? "text-emerald-400" : "text-amber-400"}`}>
          {onPace ? "No ritmo" : "Abaixo do ritmo"}
        </div>
      </div>
      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>

      {/* Streak chips — compact horizontal */}
      <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-0.5" style={{ scrollbarWidth: "none" }}>
        {streakChips.map(s => (
          <div
            key={s.key}
            className="flex-shrink-0 flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-full px-2 py-1"
            title={`${s.label}: ${s.value} dia${s.value === 1 ? "" : "s"} seguidos`}
          >
            <s.icon size={10} className={s.color} />
            <span className="text-[10px] font-bold tabular-nums text-white">{s.value}</span>
            <span className="text-[9px] text-zinc-500 font-semibold">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomeScreen = ({ entries, today, protocol, ai, setTab, setTodayField, openAISection }) => {
  const phase = currentPhase();
  const dayLabel = today.day === 0 ? "Dia 0 · Pré-lançamento" : `Dia ${today.day} de 90`;
  const compliance = Deterministic.computeCompliance(today, protocol);

  // Status das fases
  const morningReady = today.weight != null && today.sleepH != null;
  const dayActionsCount = [today.training, today.sauna, today.hbot, today.redLight].filter(Boolean).length;
  const nightReady = today.recovery != null && today.diet != null;

  // Ações pendentes (sequência real de protocolo)
  const pending = useMemo(() => {
    const items = [];
    const now = brHour();
    if (!today.weight) items.push({ label: "Registrar peso", time: protocol.wakeTime, tab: "log", phase: "morning", urgent: now >= 7 });
    if (!today.sleepH) items.push({ label: "Registrar horas de sono", time: protocol.wakeTime, tab: "log", phase: "morning", urgent: now >= 7 });
    if (!today.training) items.push({ label: "Treino — cardio + força", time: protocol.trainingTime, tab: "log", phase: "day", urgent: now >= 8 });
    if (!today.sauna) items.push({ label: "Sauna 15–20 min", time: protocol.saunaTime, tab: "log", phase: "day", urgent: now >= 9 });
    if (!today.hbot) items.push({ label: "HBOT 60 min", time: protocol.hbotTime, tab: "log", phase: "day", urgent: now >= 10 });
    if (!today.redLight) items.push({ label: "Luz vermelha (trabalho)", time: protocol.redLightTime, tab: "log", phase: "day", urgent: now >= 15 });
    if (!today.fiber) items.push({ label: "Fibra solúvel", time: "refeições", tab: "log", phase: "day" });
    if (!today.brazilNuts) items.push({ label: "2 castanhas do Pará", time: "almoço", tab: "log", phase: "day" });
    if (phase === "night" && today.recovery == null) items.push({ label: "Registrar recovery", time: "noite", tab: "log", phase: "night", urgent: true });
    if (phase === "night" && today.diet == null) items.push({ label: "Registrar dieta", time: "noite", tab: "log", phase: "night", urgent: true });
    return items;
  }, [today, protocol, phase]);

  // Top 3 prioridades (ordenadas por urgência + impacto)
  const topPriorities = pending.slice(0, 3);

  // Alerta principal do sistema
  const systemAlert = useMemo(() => {
    if (!ai.ready) return null;
    if (ai.metrics.dSleep < -0.3) return {
      type: "risk",
      title: "Maior risco agora",
      body: `Sono caiu ${Math.abs(ai.metrics.dSleep).toFixed(1)}h vs semana anterior. Com TSH elevado, é o desvio mais caro do experimento.`,
      action: "Antecipar sono em 30 min hoje",
      tag: "TSH", icon: AlertTriangle,
    };
    if (ai.metrics.dCompliance > 5) return {
      type: "opportunity",
      title: "Maior oportunidade agora",
      body: `Compliance subiu ${Math.round(ai.metrics.dCompliance)}% vs semana anterior. Momento de cristalizar a rotina.`,
      action: "Manter o ritmo + adicionar 1 teste novo",
      tag: "BASE", icon: TrendingUp,
    };
    const weakest = ["fiber", "brazilNuts", "hbot"].find(k => {
      const rate = Deterministic.last(entries.filter(e => e.closed), 7).filter(e => e[k]).length / 7;
      return rate < 0.5;
    });
    if (weakest) {
      const map = {
        fiber: { title: "Gargalo: fibra", body: "Fibra solúvel abaixo de 50% — alavanca forte de LDL subutilizada.", action: "Deixar aveia pronta amanhã", tag: "LDL", icon: Leaf },
        brazilNuts: { title: "Gargalo: selênio", body: "Castanha do Pará abaixo de 50% — alavanca de TSH ignorada.", action: "Deixar castanhas na mesa", tag: "TSH", icon: Sparkles },
        hbot: { title: "Gargalo: HBOT", body: "HBOT abaixo de 50% — janela pós-sauna perdida.", action: "Encadear HBOT logo após sauna", tag: "RECOVERY", icon: Droplet },
      };
      return { type: "bottleneck", ...map[weakest] };
    }
    return {
      type: "status",
      title: "Sistema estável",
      body: "Sem gargalos claros. Continue logando e mantenha o ritmo.",
      action: "Checar AI para padrões emergentes",
      tag: "BASE", icon: Gauge,
    };
  }, [ai, entries]);

  // Próxima ação única (ranqueada por urgência + impacto)
  const nextAction = pending.find(p => p.urgent) || pending[0];

  // Top 1 do Tomorrow Plan (mostra no Home)
  const topTomorrow = ai.tomorrowPlan?.[0];

  return (
    <div className="space-y-5 pb-28">
      {/* ACTION CENTER HERO — entendível em 5 segundos */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-zinc-800/80 p-6">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-semibold">{dayLabel}</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">{today.dateLabel} · Fortaleza</span>
          </div>
          <div className="text-white text-[22px] font-bold tracking-tight mb-1 leading-tight">
            {phase === "morning" ? "Bom dia, Danilo." : phase === "day" ? "No meio do dia." : "Hora de fechar."}
          </div>
          <div className="text-[11px] text-zinc-500 mb-5">
            Fase atual: <span className="text-zinc-300 capitalize font-semibold">{phase === "morning" ? "Manhã" : phase === "day" ? "Dia" : "Noite"}</span>
          </div>

          {/* PRÓXIMA AÇÃO — destaque único */}
          {nextAction && (
            <button onClick={() => setTab(nextAction.tab)}
              className="w-full flex items-center gap-3 p-3 mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 active:scale-[0.98] transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <ArrowUp size={18} className="text-black" strokeWidth={3} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-[9px] uppercase tracking-widest text-emerald-400 font-semibold">Próxima ação</div>
                <div className="text-sm font-bold text-white truncate">{nextAction.label}</div>
                <div className="text-[10px] text-zinc-500">{nextAction.time}</div>
              </div>
              <ChevronRight size={16} className="text-zinc-400" />
            </button>
          )}

          {/* Score + 3 fases */}
          <div className="flex items-center gap-5 mb-5">
            <div className="relative flex-shrink-0">
              <Ring value={compliance} size={104} stroke={9}
                color={compliance >= 80 ? "#10b981" : compliance >= 60 ? "#f59e0b" : "#3f3f46"} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[26px] font-bold text-white tabular-nums leading-none">{compliance}</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1 font-semibold">Score</div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-1.5">
              <div className={`rounded-lg p-2 border text-center ${morningReady ? "bg-amber-500/10 border-amber-500/30" : "bg-zinc-800/40 border-zinc-800"}`}>
                <Sunrise size={14} className={`mx-auto mb-1 ${morningReady ? "text-amber-400" : "text-zinc-600"}`} />
                <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Manhã</div>
                <div className={`text-[11px] font-bold ${morningReady ? "text-amber-300" : "text-zinc-600"}`}>{morningReady ? "✓" : "—"}</div>
              </div>
              <div className={`rounded-lg p-2 border text-center ${dayActionsCount > 0 ? "bg-blue-500/10 border-blue-500/30" : "bg-zinc-800/40 border-zinc-800"}`}>
                <Sun size={14} className={`mx-auto mb-1 ${dayActionsCount > 0 ? "text-blue-400" : "text-zinc-600"}`} />
                <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Dia</div>
                <div className={`text-[11px] font-bold ${dayActionsCount > 0 ? "text-blue-300" : "text-zinc-600"}`}>{dayActionsCount}/4</div>
              </div>
              <div className={`rounded-lg p-2 border text-center ${nightReady ? "bg-indigo-500/10 border-indigo-500/30" : "bg-zinc-800/40 border-zinc-800"}`}>
                <Sunset size={14} className={`mx-auto mb-1 ${nightReady ? "text-indigo-400" : "text-zinc-600"}`} />
                <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Noite</div>
                <div className={`text-[11px] font-bold ${nightReady ? "text-indigo-300" : "text-zinc-600"}`}>{nightReady ? "✓" : "—"}</div>
              </div>
            </div>
          </div>

          {/* Cards de status rápido */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-zinc-800/60">
            <StatMini label="Sono" value={today.sleepH} unit="h" target={protocol.sleepTarget} color="indigo" />
            <StatMini label="Energia" value={today.energy} unit="/10" color="amber" />
            <StatMini label="Foco" value={today.focus} unit="/10" color="blue" />
            <StatMini label="Recovery" value={today.recovery} unit="/10" color="emerald" />
          </div>
        </div>
      </div>

      {/* PHRASE OF THE DAY — pequena, premium, rotaciona por dia */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/5 via-zinc-900/60 to-zinc-900/60 border border-emerald-500/15 px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={10} className="text-emerald-400" />
          <span className="text-[9px] uppercase tracking-[0.22em] text-emerald-400/80 font-semibold">
            Frase do dia
          </span>
        </div>
        <p className="text-[13px] leading-snug text-zinc-200 font-medium">
          {phraseForDay(today.day || 0)}
        </p>
      </div>

      {/* SEALS + STREAKS — leve, não intrusivo */}
      <HomeSealsStreaks entries={entries} protocol={protocol} today={today} />

      {/* COMPOSITE SCORES — Energy / Recovery / Metabolic */}
      {ai.ready && (
        <div>
          <SectionLabel action={<span className="text-[10px] text-zinc-500 font-semibold">7d</span>}>
            Scores compostos
          </SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "energy", label: "Energia", color: "#fbbf24", icon: Zap },
              { key: "recovery", label: "Recovery", color: "#34d399", icon: Heart },
              { key: "metabolic", label: "Metabólico", color: "#a78bfa", icon: FlaskConical },
            ].map(s => {
              const sc = ai.scores[s.key];
              const trendIcon = sc.trend.dir === "up" ? ArrowUp : sc.trend.dir === "down" ? ArrowDown : Minus;
              const trendColor = sc.trend.dir === "up" ? "text-emerald-400" : sc.trend.dir === "down" ? "text-rose-400" : "text-zinc-500";
              const TrendIcon = trendIcon;
              return (
                <div key={s.key} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon size={14} style={{ color: s.color }} />
                    <TrendIcon size={11} className={trendColor} strokeWidth={3} />
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">{s.label}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white tabular-nums">{Math.round(sc.current)}</span>
                    <span className="text-[10px] text-zinc-500">/100</span>
                  </div>
                  <div className={`text-[9px] font-semibold tabular-nums ${trendColor}`}>
                    {sc.trend.delta > 0 ? "+" : ""}{sc.trend.delta.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI PREVIEWS — Tomorrow / Now / Risk (cada um abre a seção AI direta) */}
      {ai.ready && (
        <div>
          <SectionLabel action={<span className="text-[10px] text-zinc-500 font-semibold">tap para abrir</span>}>
            Copiloto AI
          </SectionLabel>
          <div className="space-y-2">
            {/* TOMORROW preview */}
            {topTomorrow && (
              <button onClick={() => openAISection("tomorrow")}
                className="w-full flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-zinc-900/60 border border-emerald-500/20 active:scale-[0.98] transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={18} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Amanhã</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${tagColor[topTomorrow.tag]}`}>{topTomorrow.tag}</span>
                  </div>
                  <div className="text-sm font-bold text-white leading-snug truncate">{topTomorrow.action}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{topTomorrow.why}</div>
                </div>
                <ChevronRight size={14} className="text-zinc-500 flex-shrink-0 mt-1" />
              </button>
            )}

            {/* NOW preview — scores compostos principais */}
            <button onClick={() => openAISection("now")}
              className="w-full flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-zinc-900/60 border border-blue-500/20 active:scale-[0.98] transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
                <Gauge size={18} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] uppercase tracking-widest text-blue-400 font-bold">Agora</span>
                  <span className="text-[9px] text-zinc-500 font-semibold">scores 7d</span>
                </div>
                <div className="flex items-center gap-3">
                  {[
                    { k: "energy", label: "Energia", color: "#fbbf24" },
                    { k: "recovery", label: "Recovery", color: "#34d399" },
                    { k: "metabolic", label: "Metabólico", color: "#a78bfa" },
                  ].map(s => {
                    const sc = ai.scores[s.k];
                    const dir = sc.trend.dir;
                    const TrendIcon = dir === "up" ? ArrowUp : dir === "down" ? ArrowDown : Minus;
                    const trendColor = dir === "up" ? "text-emerald-400" : dir === "down" ? "text-rose-400" : "text-zinc-500";
                    return (
                      <div key={s.k} className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-base font-bold text-white tabular-nums">{Math.round(sc.current)}</span>
                          <TrendIcon size={10} className={trendColor} strokeWidth={3} />
                        </div>
                        <div className="text-[9px] text-zinc-500 truncate" style={{ color: s.color }}>{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-500 flex-shrink-0 mt-1" />
            </button>

            {/* RISK preview — risco principal */}
            {ai.riskWatch && ai.riskWatch[0] && (() => {
              const topRisk = ai.riskWatch.find(r => r.level === "alta") || ai.riskWatch[0];
              return (
                <button onClick={() => openAISection("risks")}
                  className="w-full flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-zinc-900/60 border border-rose-500/20 active:scale-[0.98] transition-all text-left">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
                    <Shield size={18} className="text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] uppercase tracking-widest text-rose-400 font-bold">Risco</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${tagColor[topRisk.tag]}`}>{topRisk.tag}</span>
                      <span className="text-[9px] text-zinc-500 font-semibold">· {topRisk.level}</span>
                    </div>
                    <div className="text-sm font-bold text-white leading-snug truncate">{topRisk.title}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{topRisk.body}</div>
                  </div>
                  <ChevronRight size={14} className="text-zinc-500 flex-shrink-0 mt-1" />
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* ALERTA PRINCIPAL DO SISTEMA */}
      {systemAlert && (
        <div className={`relative overflow-hidden rounded-3xl p-5 border ${
          systemAlert.type === "risk" ? "bg-gradient-to-br from-rose-500/15 to-zinc-900/50 border-rose-500/30" :
          systemAlert.type === "opportunity" ? "bg-gradient-to-br from-emerald-500/15 to-zinc-900/50 border-emerald-500/30" :
          systemAlert.type === "bottleneck" ? "bg-gradient-to-br from-amber-500/15 to-zinc-900/50 border-amber-500/30" :
          "bg-zinc-900/60 border-zinc-800"
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              systemAlert.type === "risk" ? "bg-rose-500/20 border-rose-500/40" :
              systemAlert.type === "opportunity" ? "bg-emerald-500/20 border-emerald-500/40" :
              systemAlert.type === "bottleneck" ? "bg-amber-500/20 border-amber-500/40" :
              "bg-zinc-800 border-zinc-700"
            }`}>
              <systemAlert.icon size={18} className={
                systemAlert.type === "risk" ? "text-rose-400" :
                systemAlert.type === "opportunity" ? "text-emerald-400" :
                systemAlert.type === "bottleneck" ? "text-amber-400" : "text-zinc-400"
              } />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">{systemAlert.title}</div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${tagColor[systemAlert.tag]}`}>{systemAlert.tag}</span>
              </div>
              <div className="text-sm text-zinc-100 leading-snug mb-2">{systemAlert.body}</div>
              <button onClick={() => setTab("ai")} className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                → {systemAlert.action} <ChevronRight size={10} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP 3 PRIORIDADES */}
      <div>
        <SectionLabel action={
          <span className="text-[10px] text-zinc-500 font-semibold">{pending.length} pendentes</span>
        }>Top 3 prioridades agora</SectionLabel>
        <Card className="!p-0 overflow-hidden">
          {topPriorities.length === 0 ? (
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Check size={18} className="text-emerald-400" strokeWidth={3}/>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-emerald-300">Dia limpo</div>
                <div className="text-[11px] text-zinc-500">Todas as ações principais completas</div>
              </div>
            </div>
          ) : (
            topPriorities.map((p, i) => (
              <button key={i} onClick={() => setTab(p.tab)}
                className={`w-full flex items-center gap-3 p-4 text-left active:bg-zinc-800/40 transition-all ${
                  i < topPriorities.length - 1 ? "border-b border-zinc-800/60" : ""
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  p.urgent ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-zinc-800 border-zinc-700 text-zinc-300"
                }`}>
                  <span className="text-sm font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{p.label}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {p.time}
                    {p.urgent && <span className="text-rose-400 font-semibold ml-1">· urgente</span>}
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-600" />
              </button>
            ))
          )}
        </Card>
      </div>

      {/* AÇÕES RÁPIDAS */}
      <div>
        <SectionLabel action={<span className="text-[10px] text-zinc-500 font-semibold">{dayActionsCount}/4</span>}>
          Ações de hoje
        </SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <QuickAction label="Treino" time={protocol.trainingTime} value={today.training} onChange={(v) => setTodayField("training", v)} icon={Dumbbell} color="emerald" />
          <QuickAction label="Sauna" time={protocol.saunaTime} value={today.sauna} onChange={(v) => setTodayField("sauna", v)} icon={Flame} color="amber" />
          <QuickAction label="HBOT" time={protocol.hbotTime} value={today.hbot} onChange={(v) => setTodayField("hbot", v)} icon={Droplet} color="indigo" />
          <QuickAction label="Luz vermelha" time={protocol.redLightTime} value={today.redLight} onChange={(v) => setTodayField("redLight", v)} icon={Sparkles} color="rose" />
        </div>
      </div>

      {/* INTERVENÇÕES — shortcut sutil */}
      <button onClick={() => setTab("interventions")}
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 active:scale-[0.98] transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <FlaskConical size={14} className="text-zinc-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">Registrar intervenção</div>
            <div className="text-[10px] text-zinc-500">mudança de rotina ou suplemento</div>
          </div>
        </div>
        <ChevronRight size={14} className="text-zinc-500" />
      </button>
    </div>
  );
};

const StatMini = ({ label, value, unit, target, color }) => {
  const colors = {
    indigo: "text-indigo-300",
    amber: "text-amber-300",
    blue: "text-blue-300",
    emerald: "text-emerald-300",
  };
  const hit = target ? value >= target : value != null;
  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-0.5">{label}</div>
      <div className={`text-base font-bold tabular-nums ${value != null ? (hit ? colors[color] : "text-zinc-300") : "text-zinc-600"}`}>
        {value ?? "—"}<span className="text-[10px] text-zinc-500 ml-0.5">{unit}</span>
      </div>
    </div>
  );
};

// ============================================================
// LOG — 3 fases
// ============================================================
const Log = ({ today, protocol, setTodayField, setTodayFields }) => {
  // Atomic patch helper — falls back to sequential setters if the
  // new API is not provided (keeps older callers/screens safe).
  const applyPatch = (patch) =>
    setTodayFields ? setTodayFields(patch) :
      Object.entries(patch).forEach(([k, v]) => setTodayField(k, v));
  const [phase, setPhase] = useState(currentPhase());
  return (
    <div className="space-y-5 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold">Registro diário</div>
          <div className="text-lg font-bold text-white">{today.day === 0 ? "Dia 0" : `Dia ${today.day}`} · {today.dateLabel}</div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">Ao vivo</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { key: "morning", label: "Manhã", icon: Sunrise },
          { key: "day", label: "Dia", icon: Sun },
          { key: "night", label: "Noite", icon: Sunset },
        ].map((p) => {
          const active = phase === p.key;
          return (
            <button key={p.key} onClick={() => setPhase(p.key)}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                active ? "bg-white/5 border-zinc-700 text-white" : "bg-zinc-900/60 border-zinc-800 text-zinc-500"
              }`}>
              <p.icon size={14} />
              <span className="text-xs font-semibold">{p.label}</span>
            </button>
          );
        })}
      </div>

      {phase === "morning" && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sunrise size={14} className="text-amber-400" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-400 font-semibold">Ao acordar</span>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-300">Peso</span>
                <span className="text-base font-bold text-white tabular-nums">{today.weight ?? "—"} kg</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setTodayField("weight", +((today.weight || protocol.baseline.weight) - 0.1).toFixed(1))}
                  className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold active:scale-95">−</button>
                <input type="number" step="0.1" value={today.weight ?? ""} placeholder={protocol.baseline.weight}
                  onChange={(e) => setTodayField("weight", e.target.value === "" ? null : Number(e.target.value))}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 h-11 text-white text-center text-base font-semibold tabular-nums" />
                <button onClick={() => setTodayField("weight", +((today.weight || protocol.baseline.weight) + 0.1).toFixed(1))}
                  className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold active:scale-95">+</button>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-300">Horas de sono</span>
                <span className={`text-base font-bold tabular-nums ${today.sleepH >= protocol.sleepTarget ? "text-emerald-300" : "text-white"}`}>
                  {today.sleepH ?? "—"} h
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setTodayField("sleepH", Deterministic.clamp(+((today.sleepH || protocol.sleepTarget) - 0.25).toFixed(2), 0, 12))}
                  className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold active:scale-95">−</button>
                <input type="number" step="0.25" value={today.sleepH ?? ""} placeholder={protocol.sleepTarget}
                  onChange={(e) => setTodayField("sleepH", e.target.value === "" ? null : Number(e.target.value))}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 h-11 text-white text-center text-base font-semibold tabular-nums" />
                <button onClick={() => setTodayField("sleepH", Deterministic.clamp(+((today.sleepH || protocol.sleepTarget) + 0.25).toFixed(2), 0, 12))}
                  className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold active:scale-95">+</button>
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">Meta: {protocol.sleepTarget}h</div>
            </div>
            <Slider label="Qualidade do sono" value={today.sleepQ} onChange={(v) => setTodayField("sleepQ", v)} colorStops />
          </div>
          {today.morningLogged ? (
            <div className="w-full mt-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 font-semibold text-sm flex items-center justify-center gap-2">
              <Check size={15} strokeWidth={3} /> Manhã confirmada
            </div>
          ) : (
            <button onClick={() => applyPatch({ morningLogged: true })}
              className="w-full mt-5 py-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 font-semibold text-sm active:scale-[0.98]">
              Confirmar manhã
            </button>
          )}
        </Card>
      )}

      {phase === "day" && (
        <>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Sun size={14} className="text-blue-400" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-400 font-semibold">Ações</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction label="Treino" time={protocol.trainingTime} value={today.training} onChange={(v) => setTodayField("training", v)} icon={Dumbbell} color="emerald" />
              <QuickAction label="Sauna" time={protocol.saunaTime} value={today.sauna} onChange={(v) => setTodayField("sauna", v)} icon={Flame} color="amber" />
              <QuickAction label="HBOT" time={protocol.hbotTime} value={today.hbot} onChange={(v) => setTodayField("hbot", v)} icon={Droplet} color="indigo" />
              <QuickAction label="Luz vermelha" time={protocol.redLightTime} value={today.redLight} onChange={(v) => setTodayField("redLight", v)} icon={Sparkles} color="rose" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={14} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-400 font-semibold">Alavancas</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <QuickAction label="Fibra" value={today.fiber} onChange={(v) => setTodayField("fiber", v)} icon={Leaf} color="emerald" />
              <QuickAction label="Castanha" value={today.brazilNuts} onChange={(v) => setTodayField("brazilNuts", v)} icon={Sparkles} color="amber" />
              <QuickAction label="Álcool" value={today.alcohol} onChange={(v) => setTodayField("alcohol", v)} icon={AlertTriangle} color="rose" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Brain size={14} className="text-blue-400" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-400 font-semibold">Estado</span>
            </div>
            <div className="space-y-5">
              <Slider label="Energia" value={today.energy} onChange={(v) => setTodayField("energy", v)} colorStops />
              <Slider label="Foco" value={today.focus} onChange={(v) => setTodayField("focus", v)} colorStops />
              <Slider label="Humor" value={today.mood} onChange={(v) => setTodayField("mood", v)} colorStops />
              <Slider label="Estresse" value={today.stress} onChange={(v) => setTodayField("stress", v)} />
              <Slider label="Fome" value={today.hunger} onChange={(v) => setTodayField("hunger", v)} />
              <Slider label="Desejos" value={today.cravings} onChange={(v) => setTodayField("cravings", v)} />
            </div>
          </Card>
        </>
      )}

      {phase === "night" && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sunset size={14} className="text-indigo-400" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-400 font-semibold">Fechar dia</span>
          </div>
          <div className="space-y-5">
            <Slider label="Energia final" value={today.finalEnergy} onChange={(v) => setTodayField("finalEnergy", v)} colorStops />
            <Slider label="Nível de recovery" value={today.recovery} onChange={(v) => setTodayField("recovery", v)} colorStops />
            <Slider label="Aderência à dieta" value={today.diet} onChange={(v) => setTodayField("diet", v)} colorStops />
            <div>
              <div className="text-sm text-zinc-300 mb-2">Notas</div>
              <textarea value={today.notes || ""} onChange={(e) => setTodayField("notes", e.target.value)} rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-emerald-500/50"
                placeholder="Algo importante hoje…" />
            </div>
          </div>
          {today.closed ? (
            <div className="w-full mt-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 font-semibold text-sm flex items-center justify-center gap-2">
              <Check size={15} strokeWidth={3} /> Dia fechado · análise disponível
            </div>
          ) : (
            <button onClick={() => applyPatch({ nightLogged: true, closed: true })}
              className="w-full mt-5 py-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 font-semibold text-sm active:scale-[0.98]">
              Fechar dia + gerar análise
            </button>
          )}
        </Card>
      )}

      {/* CONFIRM DAY — sempre visível no final do Log, fase independente.
          Permite fechar o dia a qualquer momento (ex: se dormiu cedo). */}
      {!today.closed && phase !== "night" && (
        <Card className="bg-gradient-to-br from-indigo-500/5 to-zinc-900/60 border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sunset size={14} className="text-indigo-400" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-400 font-semibold">Fechar dia agora</span>
          </div>
          <p className="text-[12px] text-zinc-400 leading-relaxed mb-3">
            Confirme quando quiser encerrar o dia. Todos os registros são salvos
            e o selo é computado com base nos critérios do protocolo.
          </p>
          <button onClick={() => applyPatch({ nightLogged: true, closed: true })}
            className="w-full py-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 font-semibold text-sm active:scale-[0.98] flex items-center justify-center gap-2">
            <Check size={15} strokeWidth={2.5} /> Confirmar dia
          </button>
        </Card>
      )}

      {today.closed && phase !== "night" && (
        <div className="w-full py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 font-semibold text-sm flex items-center justify-center gap-2">
          <Check size={15} strokeWidth={3} /> Dia confirmado
        </div>
      )}
    </div>
  );
};

// ============================================================
// CHECK — checklist
// ============================================================
const Checklist = ({ today, checklistState, setChecklistState, protocol }) => {
  const [expanded, setExpanded] = useState("morning");
  const template = buildChecklist(protocol);

  const toggle = (section, id) => {
    setChecklistState((prev) => ({
      ...prev,
      [section]: { ...prev[section], [id]: !prev[section]?.[id] },
    }));
  };

  const progress = (key) => {
    const items = template[key].items;
    const done = items.filter(i => checklistState[key]?.[i.id]).length;
    return { done, total: items.length, pct: Math.round(done / items.length * 100) };
  };

  const total = Object.keys(template).reduce((s, k) => s + progress(k).done, 0);
  const totalItems = Object.keys(template).reduce((s, k) => s + progress(k).total, 0);
  const overallPct = Math.round(total / totalItems * 100);

  const accentMap = {
    indigo: { ring: "#818cf8", text: "text-indigo-300" },
    amber: { ring: "#fbbf24", text: "text-amber-300" },
    blue: { ring: "#60a5fa", text: "text-blue-300" },
  };

  return (
    <div className="space-y-5 pb-28">
      <Card>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <Ring value={overallPct} size={72} stroke={7} color="#10b981" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white tabular-nums">{overallPct}<span className="text-[10px] text-zinc-500">%</span></span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold mb-1">Checklist de hoje</div>
            <div className="text-xl font-bold text-white">{total}<span className="text-sm text-zinc-500 font-normal"> / {totalItems}</span></div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{today.dateLabel} · auto-gerada do protocolo</div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {Object.entries(template).map(([key, s]) => {
          const p = progress(key);
          const active = expanded === key;
          const acc = accentMap[s.accent];
          return (
            <button key={key} onClick={() => setExpanded(key)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all ${
                active ? `bg-white/5 border-zinc-700 ${acc.text}` : "bg-zinc-900/60 border-zinc-800 text-zinc-500"
              }`}>
              <s.icon size={14} />
              <span className="text-xs font-semibold">{s.label}</span>
              <span className={`text-[10px] font-bold tabular-nums px-1.5 rounded-full ${
                p.pct === 100 ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-500"
              }`}>{p.done}/{p.total}</span>
            </button>
          );
        })}
      </div>

      {(() => {
        const s = template[expanded];
        const p = progress(expanded);
        const acc = accentMap[s.accent];
        return (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-800 flex items-center justify-center">
                  <s.icon size={18} className={acc.text} />
                </div>
                <div>
                  <div className="text-base font-bold text-white">{s.label}</div>
                  <div className="text-[11px] text-zinc-500">{s.window}</div>
                </div>
              </div>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full mb-4 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.pct}%`, background: acc.ring }} />
            </div>
            <div className="space-y-2">
              {s.items.map((item) => {
                const checked = checklistState[expanded]?.[item.id];
                return (
                  <button key={item.id} onClick={() => toggle(expanded, item.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                      checked ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-800/30 border-zinc-800"
                    }`}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                      checked ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 bg-zinc-900"
                    }`}>
                      {checked && <Check size={14} className="text-black" strokeWidth={3.5} />}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className={`text-sm font-medium truncate ${checked ? "text-emerald-200 line-through" : "text-zinc-100"}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                        <Timer size={10} />{item.time}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })()}
    </div>
  );
};

// ============================================================
// AI — LONGEVITY COPILOT
// ============================================================
const AI = ({ ai, entries, protocol, labs, bodyComp, interventions, initialSection = "tomorrow" }) => {
  const [section, setSection] = useState(initialSection);
  const [mode, setMode] = useState("fast"); // "fast" | "deep"
  const [deepExpanded, setDeepExpanded] = useState(false);

  // Sincroniza section externa (vinda do Home) sem loop
  useEffect(() => {
    if (initialSection) setSection(initialSection);
    const deepKeys = ["week", "phases", "impact", "interventions", "patterns", "drivers", "experiments", "longevity"];
    if (initialSection && deepKeys.includes(initialSection)) {
      setMode("deep");
      setDeepExpanded(true);
    }
  }, [initialSection]);

  if (!ai.ready) {
    return (
      <div className="space-y-5 pb-28">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-400 font-semibold mb-1">Copiloto de longevidade</div>
          <div className="text-lg font-bold text-white">Aprendendo</div>
        </div>
        <Card className="!p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Cpu size={24} className="text-emerald-400" />
          </div>
          <div className="text-base font-bold text-white mb-2">Faltam {ai.daysNeeded} dia{ai.daysNeeded > 1 ? "s" : ""}</div>
          <div className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
            A camada de inteligência ativa após <span className="text-emerald-300 font-semibold">3 dias fechados</span>. Continue registrando.
          </div>
        </Card>
      </div>
    );
  }

  const fastSections = [
    { key: "tomorrow", label: "Amanhã", icon: Lightbulb, hint: "Plano decisório" },
    { key: "now", label: "Agora", icon: Gauge, hint: "Scores + deltas" },
    { key: "risks", label: "Riscos", icon: Shield, hint: "Watch biomarcador" },
  ];
  const deepSections = [
    { key: "week", label: "Semana", icon: Clock },
    { key: "phases", label: "Fases", icon: Layers },
    { key: "impact", label: "Impacto", icon: FlaskConical },
    { key: "interventions", label: "Intervenções", icon: FlaskConical },
    { key: "patterns", label: "Padrões", icon: BarChart3 },
    { key: "drivers", label: "Drivers", icon: Target },
    { key: "experiments", label: "Testar", icon: Beaker },
    { key: "longevity", label: "Longevidade", icon: Compass },
  ];
  const allSections = [...fastSections, ...deepSections];
  const activeSection = allSections.find(s => s.key === section) || fastSections[0];
  const isDeepSection = deepSections.some(s => s.key === section);

  const confColor = {
    "alta": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    "média": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-black border border-emerald-500/20 p-5">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={14} className="text-emerald-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-semibold">Copiloto de longevidade</span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight mb-1">Análise contínua</div>
          <div className="text-[12px] text-zinc-400">
            Conectando rotina · logs · biomarcadores · protocolo · sinais corporais
          </div>
        </div>
      </div>

      {/* FAST MODE — 3 cards grandes */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold">Fast mode</div>
          <div className="text-[10px] text-zinc-600">uso diário</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {fastSections.map(s => {
            const active = section === s.key;
            return (
              <button key={s.key} onClick={() => setSection(s.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all active:scale-95 min-h-[80px] ${
                  active
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-200"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400"
                }`}>
                <s.icon size={18} className={active ? "text-emerald-400" : "text-zinc-400"} strokeWidth={2.25} />
                <span className="text-[12px] font-bold uppercase tracking-wide">{s.label}</span>
                <span className={`text-[9px] ${active ? "text-emerald-300/80" : "text-zinc-600"}`}>{s.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DEEP MODE — expandable */}
      <div>
        <button onClick={() => setDeepExpanded(e => !e)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 active:scale-[0.99] transition-all">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-zinc-400" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-zinc-400 font-semibold">Deep mode</span>
            {isDeepSection && <span className="text-[10px] text-emerald-400 font-semibold">· {activeSection.label}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500">{deepSections.length} análises</span>
            <ChevronRight size={14} className={`text-zinc-500 transition-transform ${deepExpanded ? "rotate-90" : ""}`} />
          </div>
        </button>
        {deepExpanded && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {deepSections.map(s => {
              const active = section === s.key;
              return (
                <button key={s.key} onClick={() => setSection(s.key)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all active:scale-95 ${
                    active
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-500"
                  }`}>
                  <s.icon size={14} />
                  <span className="text-[10px] font-semibold">{s.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* TOMORROW PLAN — Decision Engine */}
      {section === "tomorrow" && (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/15 via-zinc-900 to-black border border-emerald-500/30 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-semibold">Decision Engine</span>
            </div>
            <div className="text-xl font-bold text-white mb-1">Plano para amanhã</div>
            <div className="text-[12px] text-zinc-400 leading-snug">
              3 ações exatas. Ranqueadas por impacto. Baseadas nos últimos 7 dias + aderência + biomarcadores + intervenções.
            </div>
          </div>

          {ai.tomorrowPlan.length === 0 ? (
            <Card className="!p-4"><div className="text-sm text-zinc-400">Sistema limpo. Mantenha o ritmo atual.</div></Card>
          ) : (
            <div className="space-y-3">
              {ai.tomorrowPlan.map((p, i) => (
                <Card key={i} className={`!p-4 ${i === 0 ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-zinc-900/60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      i === 0 ? "bg-emerald-500 text-black" : "bg-zinc-800 border border-zinc-700 text-zinc-300"
                    }`}>
                      <span className="text-base font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-sm font-bold text-white leading-snug">{p.action}</div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${tagColor[p.tag]}`}>{p.tag}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <p.icon size={12} className="text-zinc-500" />
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">prioridade {Math.round(p.priority)}</span>
                      </div>
                      <div className="text-xs text-zinc-300 leading-relaxed mb-2">
                        <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-widest">Por quê · </span>
                        {p.why}
                      </div>
                      <div className="text-xs text-zinc-300 leading-relaxed mb-1">
                        <span className="text-zinc-500 font-semibold uppercase text-[9px] tracking-widest">Como · </span>
                        {p.how}
                      </div>
                      {p.linkedIntervention && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                          <FlaskConical size={10} />
                          Vinculado a: {p.linkedIntervention}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <Info size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-zinc-500 leading-relaxed">
              Recalculado automaticamente após cada dia fechado. Executar 3 ações de alta prioridade &gt; 10 ações dispersas.
            </div>
          </div>
        </>
      )}

      {/* AGORA — o que está acontecendo */}
      {section === "now" && (
        <>
          {/* Composite scores */}
          <div>
            <SectionLabel>Scores compostos</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "energy", label: "Energia", color: "#fbbf24", icon: Zap,
                  sources: "energia · foco · humor · sono · estresse" },
                { key: "recovery", label: "Recovery", color: "#34d399", icon: Heart,
                  sources: "recovery · sono · qualidade · HBOT · sauna · luz" },
                { key: "metabolic", label: "Metabólico", color: "#a78bfa", icon: FlaskConical,
                  sources: "dieta · fibra · álcool · treino · fome · desejos" },
              ].map(s => {
                const sc = ai.scores[s.key];
                const trendIcon = sc.trend.dir === "up" ? ArrowUp : sc.trend.dir === "down" ? ArrowDown : Minus;
                const trendColor = sc.trend.dir === "up" ? "text-emerald-400" : sc.trend.dir === "down" ? "text-rose-400" : "text-zinc-500";
                const TrendIcon = trendIcon;
                return (
                  <div key={s.key} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <s.icon size={14} style={{ color: s.color }} />
                      <TrendIcon size={11} className={trendColor} strokeWidth={3} />
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">{s.label}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white tabular-nums">{Math.round(sc.current)}</span>
                      <span className="text-[10px] text-zinc-500">/100</span>
                    </div>
                    <div className={`text-[9px] font-semibold tabular-nums ${trendColor}`}>
                      {sc.trend.delta > 0 ? "+" : ""}{sc.trend.delta.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Sono", v: ai.metrics.dSleep, unit: "h" },
              { label: "Energia", v: ai.metrics.dEnergy, unit: "pt" },
              { label: "Recovery", v: ai.metrics.dRecovery, unit: "pt" },
              { label: "Foco", v: ai.metrics.dFocus, unit: "pt" },
            ].map((x, i) => {
              const good = x.v > 0.2, bad = x.v < -0.2;
              return (
                <div key={i} className={`rounded-xl p-2.5 border ${
                  good ? "bg-emerald-500/10 border-emerald-500/20" :
                  bad ? "bg-rose-500/10 border-rose-500/20" : "bg-zinc-900/60 border-zinc-800"
                }`}>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">{x.label}</div>
                  <div className={`text-base font-bold tabular-nums ${good ? "text-emerald-300" : bad ? "text-rose-300" : "text-zinc-400"}`}>
                    {x.v > 0 ? "+" : ""}{x.v.toFixed(1)}<span className="text-[10px] text-zinc-500">{x.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <SectionLabel>O que está acontecendo</SectionLabel>
            <div className="space-y-2">
              {ai.changingNow.map((c, i) => {
                const colors = {
                  better: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
                  worse: "bg-rose-500/10 border-rose-500/20 text-rose-300",
                  stable: "bg-zinc-900/60 border-zinc-800 text-zinc-400",
                };
                const Icon = c.status === "better" ? ArrowUp : c.status === "worse" ? ArrowDown : Minus;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${colors[c.status]}`}>
                    <c.icon size={14} className="opacity-70" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{c.label}</div>
                      <div className="text-[11px] opacity-80">{c.body}</div>
                    </div>
                    <Icon size={14} strokeWidth={3} />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* WEEK EVOLUTION */}
      {section === "week" && (
        <>
          {!ai.weekEvolution ? (
            <Card className="!p-4"><div className="text-sm text-zinc-400">Aguardando dados da semana anterior para comparar.</div></Card>
          ) : (
            <>
              <div>
                <SectionLabel>Evolução semanal</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "compliance", label: "Compliance", color: "#10b981" },
                    { key: "energy", label: "Energia", color: "#fbbf24" },
                    { key: "recovery", label: "Recovery", color: "#34d399" },
                    { key: "metabolic", label: "Metabólico", color: "#a78bfa" },
                  ].map(m => {
                    const v = ai.weekEvolution[m.key];
                    const delta = (v.current || 0) - (v.prior || 0);
                    const good = delta > 2, bad = delta < -2;
                    return (
                      <div key={m.key} className={`rounded-2xl p-3 border ${
                        good ? "bg-emerald-500/10 border-emerald-500/20" :
                        bad ? "bg-rose-500/10 border-rose-500/20" :
                        "bg-zinc-900/60 border-zinc-800"
                      }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
                          <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">{m.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-white tabular-nums">{Math.round(v.current || 0)}</span>
                          <span className="text-[10px] text-zinc-500">vs {Math.round(v.prior || 0)}</span>
                        </div>
                        <div className={`text-[10px] font-semibold tabular-nums ${
                          good ? "text-emerald-300" : bad ? "text-rose-300" : "text-zinc-400"
                        }`}>
                          {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Card>
                <SectionLabel>Destaques da semana</SectionLabel>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <ArrowUp size={14} className="text-emerald-400" strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Melhor dia</div>
                      <div className="text-sm font-bold text-white">{ai.weekEvolution.highlights.bestDay?.dateLabel ?? "—"}</div>
                    </div>
                    <span className="text-base font-bold text-emerald-300 tabular-nums">
                      {ai.weekEvolution.highlights.bestDay ? Deterministic.computeCompliance(ai.weekEvolution.highlights.bestDay, protocol) : "—"}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                      <ArrowDown size={14} className="text-rose-400" strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Pior dia</div>
                      <div className="text-sm font-bold text-white">{ai.weekEvolution.highlights.worstDay?.dateLabel ?? "—"}</div>
                    </div>
                    <span className="text-base font-bold text-rose-300 tabular-nums">
                      {ai.weekEvolution.highlights.worstDay ? Deterministic.computeCompliance(ai.weekEvolution.highlights.worstDay, protocol) : "—"}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-zinc-800/30 rounded-xl p-3 border border-zinc-800/60">
                      <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Sono médio</div>
                      <div className="text-base font-bold text-white tabular-nums">{ai.weekEvolution.highlights.sleepAvg.toFixed(1)}<span className="text-[10px] text-zinc-500 ml-0.5">h</span></div>
                    </div>
                    <div className="bg-zinc-800/30 rounded-xl p-3 border border-zinc-800/60">
                      <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Treinos</div>
                      <div className="text-base font-bold text-white tabular-nums">{ai.weekEvolution.highlights.trainingHits}/{ai.weekEvolution.days}</div>
                    </div>
                    <div className="bg-zinc-800/30 rounded-xl p-3 border border-zinc-800/60">
                      <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">HBOT</div>
                      <div className="text-base font-bold text-white tabular-nums">{ai.weekEvolution.highlights.hbotHits}/{ai.weekEvolution.days}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* PHASE COMPARISON */}
      {section === "phases" && (
        <>
          <div>
            <SectionLabel>Comparação por fase</SectionLabel>
            <div className="space-y-3">
              {ai.phaseComparison.map((p, i) => {
                const hasData = p.n > 0;
                const prev = i > 0 ? ai.phaseComparison[i - 1] : null;
                const complianceDelta = hasData && prev?.compliance != null ? p.compliance - prev.compliance : null;
                return (
                  <Card key={p.label} className={`!p-4 ${!hasData ? "opacity-40" : ""}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-zinc-400" />
                        <div className="text-sm font-bold text-white">{p.label}</div>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        {hasData ? `${p.n} dia${p.n > 1 ? "s" : ""}` : "pendente"}
                      </span>
                    </div>
                    {hasData ? (
                      <>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          {[
                            { label: "Compl", v: p.compliance, u: "%" },
                            { label: "Energia", v: p.energy, u: "" },
                            { label: "Recovery", v: p.recovery, u: "" },
                            { label: "Metab", v: p.metabolic, u: "" },
                          ].map((m, j) => (
                            <div key={j} className="bg-zinc-800/30 rounded-lg p-2 border border-zinc-800/60">
                              <div className="text-[8px] uppercase tracking-widest text-zinc-500 font-semibold">{m.label}</div>
                              <div className="text-sm font-bold text-white tabular-nums">
                                {m.v ?? "—"}<span className="text-[9px] text-zinc-500">{m.u}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {complianceDelta != null && (
                          <div className={`text-[11px] font-semibold ${
                            complianceDelta > 2 ? "text-emerald-400" :
                            complianceDelta < -2 ? "text-rose-400" : "text-zinc-500"
                          }`}>
                            {complianceDelta > 0 ? "+" : ""}{complianceDelta}% compliance vs fase anterior
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[11px] text-zinc-500">Fase ainda não iniciada no experimento.</div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <Info size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-zinc-500 leading-relaxed">
              Comparação ativa à medida que você avança no experimento. Exames em 45 e 90 dias validam se a evolução subjetiva refletiu em biomarcadores.
            </div>
          </div>
        </>
      )}

      {/* INTERVENTION IMPACT (narratives) */}
      {section === "impact" && (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-black border border-emerald-500/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical size={14} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-semibold">Intervention Impact</span>
            </div>
            <div className="text-xl font-bold text-white mb-1">Conexões observadas</div>
            <div className="text-[12px] text-zinc-400 leading-snug">
              Mudanças de rotina ↔ mudanças em métricas. Só aparece quando houver dados suficientes antes/depois.
            </div>
          </div>

          {ai.impactNarratives.length === 0 ? (
            <Card className="!p-4">
              <div className="text-sm text-zinc-400">
                Nenhuma conexão forte identificada ainda. Registre intervenções e aguarde 3+ dias de dados depois de cada uma.
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {ai.impactNarratives.map((n, i) => {
                const verdictColor = {
                  "positivo": "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
                  "negativo": "bg-rose-500/10 text-rose-300 border-rose-500/30",
                };
                const Icon = n.verdict === "positivo" ? ArrowUp : ArrowDown;
                return (
                  <Card key={n.id || i} className={`!p-4 ${
                    n.verdict === "positivo" ? "bg-gradient-to-br from-emerald-500/5 to-zinc-900/60 border-emerald-500/20" :
                    "bg-gradient-to-br from-rose-500/5 to-zinc-900/60 border-rose-500/20"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${verdictColor[n.verdict]}`}>
                        <Icon size={14} strokeWidth={3} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-sm font-semibold text-white leading-snug">{n.narrative}</div>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${verdictColor[n.verdict]}`}>
                            {n.verdict}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1">
                          Intervenção em {formatDateBR(n.date)} · {n.daysBefore}d antes / {n.daysAfter}d depois
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <Info size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-zinc-500 leading-relaxed">
              Correlacional — outras variáveis podem estar em jogo. Para isolar: mude uma intervenção por vez.
            </div>
          </div>
        </>
      )}

      {/* INTERVENÇÕES (lista completa — antiga) */}
      {section === "interventions" && (
        <>
          <div>
            <SectionLabel action={
              <span className="text-[10px] text-zinc-500 font-semibold">
                {ai.interventionImpacts.filter(i => i.ready).length}/{ai.interventionImpacts.length} avaliadas
              </span>
            }>Impacto das intervenções</SectionLabel>
            {ai.interventionImpacts.length === 0 ? (
              <Card className="!p-4"><div className="text-sm text-zinc-400">Nenhuma intervenção registrada ainda.</div></Card>
            ) : (
              <div className="space-y-3">
                {[...ai.interventionImpacts].reverse().map((iv, i) => {
                  const verdictColor = {
                    "positivo": "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
                    "negativo": "bg-rose-500/10 text-rose-300 border-rose-500/30",
                    "neutro": "bg-zinc-800 text-zinc-400 border-zinc-700",
                  };
                  const cat = INTERVENTION_CATEGORIES.find(c => c.key === iv.category);
                  if (!iv.ready) {
                    return (
                      <Card key={iv.id || i} className="!p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                            {cat ? <cat.icon size={16} className="text-zinc-400" /> : <FlaskConical size={16} className="text-zinc-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white leading-snug mb-1">{iv.title}</div>
                            <div className="text-[10px] text-zinc-500 mb-2">{formatDateBR(iv.date)}</div>
                            <div className="flex items-center gap-2">
                              <Clock size={11} className="text-zinc-500" />
                              <span className="text-[11px] text-zinc-500">
                                Aguardando · {iv.daysAfter}/3 dias depois
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  }
                  const labels = { sleep: "Sono", energy: "Energia", recovery: "Recovery", focus: "Foco", hunger: "Fome", compliance: "Score" };
                  return (
                    <Card key={iv.id || i} className="!p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          {cat ? <cat.icon size={16} className="text-emerald-400" /> : <FlaskConical size={16} className="text-emerald-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="text-sm font-bold text-white leading-snug">{iv.title}</div>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${verdictColor[iv.verdict]}`}>
                              {iv.verdict}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 mb-2">
                            {formatDateBR(iv.date)} · {cat?.label || "outro"}
                          </div>
                          <div className="text-xs text-zinc-300 mb-2">
                            Sinal mais forte: <span className="font-semibold">{labels[iv.strongest.metric]}</span> {iv.strongest.delta > 0 ? "+" : ""}{iv.strongest.delta.toFixed(1)}
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {Object.entries(iv.deltas).map(([k, v]) => {
                              const inverted = k === "hunger";
                              const good = inverted ? v < -0.2 : v > 0.2;
                              const bad = inverted ? v > 0.2 : v < -0.2;
                              return (
                                <div key={k} className={`rounded-lg p-1.5 border ${
                                  good ? "bg-emerald-500/10 border-emerald-500/20" :
                                  bad ? "bg-rose-500/10 border-rose-500/20" :
                                  "bg-zinc-800/40 border-zinc-800"
                                }`}>
                                  <div className="text-[8px] uppercase tracking-widest text-zinc-500 font-semibold">{labels[k]}</div>
                                  <div className={`text-[11px] font-bold tabular-nums ${
                                    good ? "text-emerald-300" : bad ? "text-rose-300" : "text-zinc-400"
                                  }`}>
                                    {v > 0 ? "+" : ""}{v.toFixed(1)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-2">
                            {iv.daysBefore}d antes vs {iv.daysAfter}d depois
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <Info size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-zinc-500 leading-relaxed">
              Correlacional, não causal. Outras variáveis podem estar em jogo. Idealmente, mudar uma intervenção por vez.
            </div>
          </div>
        </>
      )}

      {/* PADRÕES */}
      {section === "patterns" && (
        <>
          <div>
            <SectionLabel>Padrões emergentes</SectionLabel>
            {ai.patterns.length === 0 ? (
              <Card className="!p-4"><div className="text-sm text-zinc-400">Sem padrões fortes ainda. Continue logando.</div></Card>
            ) : (
              <div className="space-y-3">
                {ai.patterns.map((p, i) => (
                  <Card key={i} className="!p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                        <p.icon size={16} className="text-zinc-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-sm font-bold text-white">{p.title}</div>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${tagColor[p.tag]}`}>{p.tag}</span>
                        </div>
                        <div className="text-xs text-zinc-300 leading-relaxed">{p.body}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Trends mini */}
          <TrendsGrid entries={entries} protocol={protocol} />
        </>
      )}

      {/* DRIVERS */}
      {section === "drivers" && (
        <div>
          <SectionLabel>Prováveis drivers (impacto)</SectionLabel>
          <div className="space-y-2.5">
            {ai.drivers.map((d, i) => (
              <Card key={i} className="!p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Target size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm font-bold text-white">{d.title}</div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${tagColor[d.tag]}`}>{d.tag}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((n) => (
                            <div key={n} className={`w-1 h-3 rounded-full ${n <= d.impact ? "bg-amber-400" : "bg-zinc-800"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-400 leading-relaxed">{d.body}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}


      {/* TESTAR */}
      {section === "experiments" && (
        <>
          <div>
            <SectionLabel>O que testar a seguir</SectionLabel>
            <div className="space-y-2.5">
              {ai.testsNext.map((t, i) => (
                <Card key={i} className="!p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <FlaskConical size={16} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-sm font-bold text-white">{t.title}</div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${tagColor[t.tag]}`}>{t.tag}</span>
                      </div>
                      <div className="text-xs text-zinc-400 leading-relaxed">{t.why}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>O que parar se não rodar</SectionLabel>
            <Card className="!p-0 overflow-hidden">
              {ai.stopList.map((s, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 ${i < ai.stopList.length - 1 ? "border-b border-zinc-800/60" : ""}`}>
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowDown size={12} className="text-rose-400" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-zinc-100 leading-snug font-semibold">{s.title}</div>
                    <div className="text-[11px] text-zinc-400 mt-1">{s.why}</div>
                    <span className={`inline-block mt-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${tagColor[s.tag]}`}>{s.tag}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}

      {/* RISCOS */}
      {section === "risks" && (
        <div>
          <SectionLabel>Risk watch</SectionLabel>
          <div className="space-y-3">
            {ai.riskWatch.map((r, i) => {
              const levelColor = {
                "alta": "bg-rose-500/10 border-rose-500/20 text-rose-300",
                "média": "bg-amber-500/10 border-amber-500/20 text-amber-300",
                "baixa": "bg-zinc-800 border-zinc-700 text-zinc-400",
                "observar": "bg-zinc-800 border-zinc-700 text-zinc-400",
              };
              return (
                <Card key={i} className="!p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${levelColor[r.level]}`}>
                      <r.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-sm font-bold text-white">{r.title}</div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${levelColor[r.level]}`}>
                          {r.level}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300 leading-relaxed">{r.body}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* LONGEVIDADE */}
      {section === "longevity" && (
        <div>
          <SectionLabel>Alinhamento estratégico</SectionLabel>
          <div className="space-y-3">
            {ai.longevity.map((l, i) => (
              <Card key={i} className={`!p-4 ${l.aligned ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                    l.aligned ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  }`}>
                    <l.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm font-bold text-white">{l.strategy}</div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        l.aligned ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      }`}>
                        {l.aligned ? "alinhado" : "atenção"}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-300 leading-relaxed">{l.note}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
        <Info size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-zinc-500 leading-relaxed">
          Análise correlacional, não causal. Validar com exames em 45 dias. Timezone: America/Fortaleza.
        </div>
      </div>
    </div>
  );
};

const TrendsGrid = ({ entries, protocol }) => {
  const logged = entries.filter(e => e.closed);
  if (logged.length < 3) return null;

  const series = logged.map(e => ({
    day: e.day, sleep: e.sleepH, energy: e.energy,
    focus: e.focus, recovery: e.recovery, hunger: e.hunger,
    compliance: Deterministic.computeCompliance(e, protocol),
  }));

  const metrics = [
    { key: "compliance", label: "Compliance", color: "#10b981", unit: "%" },
    { key: "sleep", label: "Sono", color: "#818cf8", unit: "h" },
    { key: "energy", label: "Energia", color: "#fbbf24", unit: "/10" },
    { key: "focus", label: "Foco", color: "#60a5fa", unit: "/10" },
    { key: "recovery", label: "Recovery", color: "#34d399", unit: "/10" },
    { key: "hunger", label: "Fome", color: "#f472b6", unit: "/10" },
  ];

  return (
    <div>
      <SectionLabel>Tendências</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <div key={m.key} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3">
            <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">{m.label}</div>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-xl font-bold text-white tabular-nums">{series[series.length - 1][m.key]}</span>
              <span className="text-[10px] text-zinc-500">{m.unit}</span>
            </div>
            <ResponsiveContainer width="100%" height={32}>
              <LineChart data={series}>
                <Line type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={1.75} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// COPILOT TAB — AI-first intelligence hub
// ------------------------------------------------------------
// 7 sections, each backed by a live /api/copilot/* endpoint.
// Deterministic RuleEngine output is used as fallback when AI
// is unavailable (ok:false or timeout).
// ============================================================
const useCopilotSection = (section, context, enabled) => {
  const [state, setState] = useState({ loading: false, data: null, error: null, source: null });
  const ctxKey = useMemo(() => JSON.stringify(context || {}), [context]);

  useEffect(() => {
    if (!enabled) {
      setState({ loading: false, data: null, error: null, source: null });
      return;
    }
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));
    fetchCopilot(section, context)
      .then(res => {
        if (cancelled) return;
        if (res && res.ok) {
          setState({ loading: false, data: res.data, error: null, source: "ai" });
        } else {
          setState({ loading: false, data: null, error: res?.error || "AI indisponível", source: "fallback" });
        }
      })
      .catch(err => {
        if (cancelled) return;
        setState({ loading: false, data: null, error: String(err.message || err), source: "fallback" });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, ctxKey, enabled]);

  return state;
};

const CopilotCard = ({ icon: Icon, label, source, children, loading }) => (
  <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Icon size={13} className="text-emerald-400" />
        </div>
        <div className="text-[9px] uppercase tracking-widest text-zinc-400 font-semibold">{label}</div>
      </div>
      <div className="flex items-center gap-1.5">
        {loading && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        <span className={`text-[8px] uppercase tracking-widest font-semibold ${source === "ai" ? "text-emerald-400" : "text-zinc-500"}`}>
          {source === "ai" ? "IA" : source === "fallback" ? "Local" : loading ? "…" : "—"}
        </span>
      </div>
    </div>
    <div className="text-sm text-zinc-200 leading-relaxed">{children}</div>
  </div>
);

const CopilotTab = ({ ai, entries, protocol, today }) => {
  const enabled = ai?.ready === true;

  // Contexts sent to each API (lean payloads — no PII beyond health data already in this repo)
  const briefCtx = useMemo(() => ({
    day: today?.day,
    sleep_hours: today?.sleepH,
    sleep_quality: today?.sleepQ,
    recovery: today?.recovery,
    energy: today?.energy,
    adherence: ai?.metrics?.compliance,
    phase: currentPhase(),
  }), [today, ai]);

  const tomorrowCtx = useMemo(() => ({
    plan: (ai?.tomorrowPlan || []).slice(0, 3).map(p => ({
      priority: p.priority, action: p.action, tag: p.tag,
    })),
  }), [ai]);

  const rootCauseCtx = useMemo(() => ({
    metrics: ai?.metrics,
    compliance: ai?.metrics?.compliance,
    days_logged: entries?.filter(e => e.closed)?.length ?? 0,
    scores: ai?.scores ? {
      energy: ai.scores.energy?.current,
      recovery: ai.scores.recovery?.current,
      metabolic: ai.scores.metabolic?.current,
    } : null,
  }), [ai, entries]);

  const weeklyCtx = useMemo(() => ({
    metrics: ai?.metrics,
    weekEvolution: ai?.weekEvolution,
  }), [ai]);

  const experimentCtx = useMemo(() => ({
    compliance: ai?.metrics?.compliance,
    weak_areas: (ai?.patterns || []).slice(0, 3).map(p => ({ title: p.title, tag: p.tag })),
    current_supplements: protocol?.supplements?.map?.(s => s.name) || [],
  }), [ai, protocol]);

  const patternsCtx = useMemo(() => ({
    patterns: (ai?.patterns || []).map(p => ({ title: p.title, tag: p.tag })),
  }), [ai]);

  const brief = useCopilotSection("brief", briefCtx, enabled);
  const tomorrow = useCopilotSection("tomorrow", tomorrowCtx, enabled && (ai?.tomorrowPlan?.length > 0));
  const rootCause = useCopilotSection("rootCause", rootCauseCtx, enabled);
  const weekly = useCopilotSection("weekly", weeklyCtx, enabled);
  const experiment = useCopilotSection("experiment", experimentCtx, enabled);
  const patterns = useCopilotSection("patterns", patternsCtx, enabled && (ai?.patterns?.length > 0));

  // Deterministic "Next Best Action" — derived locally, no AI call
  const nextBestAction = useMemo(() => {
    const plan = ai?.tomorrowPlan || [];
    if (plan.length > 0) return plan[0];
    return null;
  }, [ai]);

  if (!ai?.ready) {
    return (
      <div className="space-y-5 pb-28">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-400 font-semibold mb-1">Copilot</div>
          <div className="text-lg font-bold text-white">Aprendendo seus dados</div>
        </div>
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Cpu size={24} className="text-emerald-400" />
          </div>
          <div className="text-base font-bold text-white mb-2">Faltam {ai?.daysNeeded ?? 3} dia{(ai?.daysNeeded ?? 3) > 1 ? "s" : ""}</div>
          <div className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Copilot ativa após <span className="text-emerald-300 font-semibold">3 dias fechados</span>. Continue registrando.
          </div>
        </div>
      </div>
    );
  }

  const planItems = tomorrow.data?.actions || (ai.tomorrowPlan || []).slice(0, 3);
  const drivers = rootCause.data?.drivers || null;
  const patternItems = patterns.data?.patterns || (ai.patterns || []).slice(0, 3).map(p => ({ title: p.title, tag: p.tag, explanation: p.body || null }));
  const weeklyData = weekly.data;
  const experimentData = experiment.data;

  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-400 font-semibold mb-1">Copilot</div>
        <div className="text-lg font-bold text-white">Inteligência do dia</div>
        <div className="text-[11px] text-zinc-500 mt-1">
          Respostas geradas via IA, com fallback determinístico caso a rede falhe.
        </div>
      </div>

      {/* 1) Today Brief */}
      <CopilotCard icon={Sparkles} label="Today Brief" source={brief.source} loading={brief.loading}>
        {brief.data?.brief ? (
          <>
            <p>{brief.data.brief}</p>
            {brief.data.tone && (
              <div className="mt-2 text-[9px] uppercase tracking-widest font-semibold text-zinc-500">
                Tom: {brief.data.tone}
              </div>
            )}
          </>
        ) : (
          <p className="text-zinc-400">
            {ai.changingNow?.body || "Sem alertas. Mantenha o ritmo e continue registrando."}
          </p>
        )}
      </CopilotCard>

      {/* 2) Next Best Action */}
      <CopilotCard icon={Target} label="Next Best Action" source="deterministic">
        {nextBestAction ? (
          <>
            <div className="flex items-start gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mt-0.5">
                #{nextBestAction.priority ?? 1}
              </span>
              <span className="flex-1">{nextBestAction.action}</span>
            </div>
            {nextBestAction.tag && (
              <div className="mt-2 inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-full px-2 py-0.5">
                <span className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400">{nextBestAction.tag}</span>
              </div>
            )}
          </>
        ) : (
          <p className="text-zinc-400">Nenhuma ação crítica pendente no momento.</p>
        )}
      </CopilotCard>

      {/* 3) Tomorrow Plan (enriquecido com IA) */}
      <CopilotCard icon={Lightbulb} label="Tomorrow Plan" source={tomorrow.source} loading={tomorrow.loading}>
        {planItems && planItems.length > 0 ? (
          <ul className="space-y-2.5">
            {planItems.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mt-0.5 w-4">
                  #{p.priority ?? i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-white">{p.action}</div>
                  {p.aiRationale && (
                    <div className="text-[11px] text-zinc-400 mt-0.5">Por quê: {p.aiRationale}</div>
                  )}
                  {p.aiPractical && (
                    <div className="text-[11px] text-zinc-500 mt-0.5">Como: {p.aiPractical}</div>
                  )}
                  {p.tag && (
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-full px-2 py-0.5">
                      <span className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400">{p.tag}</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-400">Sem plano determinístico disponível ainda.</p>
        )}
      </CopilotCard>

      {/* 4) Root Cause Analysis */}
      <CopilotCard icon={Compass} label="Root Cause" source={rootCause.source} loading={rootCause.loading}>
        {drivers && drivers.length > 0 ? (
          <ul className="space-y-3">
            {drivers.map((d, i) => (
              <li key={i}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold text-white">{d.title}</span>
                  <span className={`text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full ${
                    d.confidence === "alta" ? "bg-emerald-500/10 text-emerald-400" :
                    d.confidence === "média" ? "bg-amber-500/10 text-amber-400" :
                    "bg-zinc-800 text-zinc-400"
                  }`}>{d.confidence}</span>
                </div>
                <div className="text-[11px] text-zinc-400 leading-relaxed">{d.body}</div>
                {d.tag && (
                  <div className="mt-1.5 inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-full px-2 py-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400">{d.tag}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-400">Dados insuficientes para identificar drivers.</p>
        )}
      </CopilotCard>

      {/* 5) Pattern Detection */}
      <CopilotCard icon={Layers} label="Pattern Detection" source={patterns.source} loading={patterns.loading}>
        {patternItems && patternItems.length > 0 ? (
          <ul className="space-y-2.5">
            {patternItems.map((p, i) => (
              <li key={i}>
                <div className="text-[13px] font-semibold text-white">{p.title}</div>
                {p.explanation && (
                  <div className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">{p.explanation}</div>
                )}
                {p.tag && (
                  <div className="mt-1 inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-full px-2 py-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400">{p.tag}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-400">Nenhum padrão detectado ainda.</p>
        )}
      </CopilotCard>

      {/* 6) Weekly Insight */}
      <CopilotCard icon={BarChart3} label="Weekly Insight" source={weekly.source} loading={weekly.loading}>
        {weeklyData ? (
          <div className="space-y-2">
            {weeklyData.improved && (
              <div>
                <div className="text-[9px] uppercase tracking-widest font-semibold text-emerald-400 mb-0.5">Melhorou</div>
                <div className="text-[12px] text-zinc-200">{weeklyData.improved}</div>
              </div>
            )}
            {weeklyData.worsened && (
              <div>
                <div className="text-[9px] uppercase tracking-widest font-semibold text-rose-400 mb-0.5">Piorou</div>
                <div className="text-[12px] text-zinc-200">{weeklyData.worsened}</div>
              </div>
            )}
            {weeklyData.matters && (
              <div>
                <div className="text-[9px] uppercase tracking-widest font-semibold text-amber-400 mb-0.5">Importa agora</div>
                <div className="text-[12px] text-zinc-200">{weeklyData.matters}</div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-zinc-400">
            Compliance semanal: {ai.metrics?.compliance != null ? `${Math.round(ai.metrics.compliance)}%` : "—"}.
            Continue registrando para obter síntese semanal da IA.
          </p>
        )}
      </CopilotCard>

      {/* 7) Experiment Suggestion */}
      <CopilotCard icon={FlaskConical} label="Experiment" source={experiment.source} loading={experiment.loading}>
        {experimentData ? (
          <div>
            <div className="text-[14px] font-bold text-white mb-1">{experimentData.title}</div>
            <div className="text-[12px] text-zinc-300 leading-relaxed mb-2">{experimentData.what}</div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-full px-2 py-0.5">
                <Clock size={9} className="text-zinc-400" />
                <span className="text-[10px] font-semibold text-zinc-300 tabular-nums">{experimentData.duration_days} dias</span>
              </div>
              {experimentData.tag && (
                <div className="inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-full px-2 py-0.5">
                  <span className="text-[9px] uppercase tracking-widest font-semibold text-zinc-400">{experimentData.tag}</span>
                </div>
              )}
            </div>
            {experimentData.metric && (
              <div className="text-[11px] text-zinc-500 mt-2">Medir: {experimentData.metric}</div>
            )}
          </div>
        ) : (
          <p className="text-zinc-400">Gerando sugestão de experimento…</p>
        )}
      </CopilotCard>

      <div className="text-center text-[9px] uppercase tracking-widest text-zinc-600 font-semibold pt-2">
        Cache local · 6h · fallback determinístico
      </div>
    </div>
  );
};

// ============================================================
// INTERVENTIONS SCREEN — registrar mudanças do experimento
// ============================================================
const Interventions = ({ interventions, setInterventions, ai }) => {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");

  const blank = {
    action: "start", category: "supplement",
    title: "", body: "", date: brToday(), tags: [],
  };
  const [draft, setDraft] = useState(blank);

  const categoryMap = Object.fromEntries(INTERVENTION_CATEGORIES.map(c => [c.key, c]));

  const save = () => {
    if (!draft.title.trim()) return;
    if (editId) {
      setInterventions(prev => prev.map(iv => iv.id === editId ? { ...draft, id: editId } : iv));
      setEditId(null);
    } else {
      setInterventions(prev => [...prev, { ...draft, id: `iv-${Date.now()}` }]);
    }
    setDraft(blank);
    setAdding(false);
  };

  const remove = (id) => {
    setInterventions(prev => prev.filter(iv => iv.id !== id));
  };

  const startEdit = (iv) => {
    setDraft({ ...iv });
    setEditId(iv.id);
    setAdding(true);
  };

  const cancel = () => {
    setDraft(blank);
    setEditId(null);
    setAdding(false);
  };

  const filtered = filter === "all"
    ? interventions
    : interventions.filter(iv => iv.category === filter);

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  // Stats rápidas
  const byCategory = INTERVENTION_CATEGORIES.map(c => ({
    ...c, count: interventions.filter(iv => iv.category === c.key).length,
  })).filter(c => c.count > 0);

  const colorMap = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-300", icon: "text-blue-400" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300", icon: "text-amber-400" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300", icon: "text-emerald-400" },
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-300", icon: "text-indigo-400" },
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-300", icon: "text-rose-400" },
    zinc: { bg: "bg-zinc-800", border: "border-zinc-700", text: "text-zinc-300", icon: "text-zinc-400" },
  };

  const actionMap = Object.fromEntries(INTERVENTION_ACTIONS.map(a => [a.key, a]));

  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-black border border-emerald-500/20 p-5">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical size={14} className="text-emerald-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-semibold">Experimento</span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight mb-1">Intervenções</div>
          <div className="text-[12px] text-zinc-400 leading-relaxed">
            Registre mudanças importantes para a AI conectar com resultados.
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 bg-zinc-800/40 rounded-xl p-2.5 border border-zinc-800/60">
              <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Total</div>
              <div className="text-lg font-bold text-white tabular-nums">{interventions.length}</div>
            </div>
            <div className="flex-1 bg-zinc-800/40 rounded-xl p-2.5 border border-zinc-800/60">
              <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Categorias</div>
              <div className="text-lg font-bold text-white tabular-nums">{byCategory.length}</div>
            </div>
            <div className="flex-1 bg-zinc-800/40 rounded-xl p-2.5 border border-zinc-800/60">
              <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Avaliadas</div>
              <div className="text-lg font-bold text-white tabular-nums">
                {ai?.interventionImpacts?.filter(i => i.ready).length ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add button */}
      {!adding && (
        <button onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/30">
          <PlusCircle size={18} strokeWidth={2.5} />
          Registrar nova intervenção
        </button>
      )}

      {/* Add/Edit form */}
      {adding && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="text-base font-bold text-white">{editId ? "Editar" : "Nova"} intervenção</div>
            <button onClick={cancel} className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center active:scale-95">
              <X size={14} className="text-zinc-400" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Ação */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold mb-2">Ação</div>
              <div className="grid grid-cols-3 gap-2">
                {INTERVENTION_ACTIONS.map(a => {
                  const active = draft.action === a.key;
                  return (
                    <button key={a.key} onClick={() => setDraft({ ...draft, action: a.key })}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                        active ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-200" : "bg-zinc-900/40 border-zinc-800 text-zinc-500"
                      }`}>
                      <a.icon size={14} />
                      <span className="text-xs font-semibold">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold mb-2">Categoria</div>
              <div className="grid grid-cols-3 gap-2">
                {INTERVENTION_CATEGORIES.map(c => {
                  const active = draft.category === c.key;
                  const cc = colorMap[c.color];
                  return (
                    <button key={c.key} onClick={() => setDraft({ ...draft, category: c.key })}
                      className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                        active ? `${cc.bg} ${cc.border.replace("border-", "border-")} ${cc.text}` : "bg-zinc-900/40 border-zinc-800 text-zinc-500"
                      }`}>
                      <c.icon size={14} />
                      <span className="text-[10px] font-semibold">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Título */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold mb-2">Título</div>
              <input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Ex: Adicionei psyllium 10g antes do almoço"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 h-11 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500/50" />
            </div>

            {/* Data */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold mb-2">Data</div>
              <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 h-11 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500/50" />
            </div>

            {/* Detalhes */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold mb-2">Detalhes (opcional)</div>
              <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={3}
                placeholder="Contexto, dose, motivo, expectativa…"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-emerald-500/50" />
            </div>

            {/* Save */}
            <button onClick={save} disabled={!draft.title.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                draft.title.trim()
                  ? "bg-emerald-500 text-black"
                  : "bg-zinc-800 text-zinc-500"
              }`}>
              {editId ? "Salvar alterações" : "Registrar intervenção"}
            </button>
          </div>
        </Card>
      )}

      {/* Filter chips */}
      {!adding && interventions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          <button onClick={() => setFilter("all")}
            className={`flex-shrink-0 px-3 py-2 rounded-full border transition-all ${
              filter === "all" ? "bg-white/5 border-zinc-700 text-white" : "bg-zinc-900/60 border-zinc-800 text-zinc-500"
            }`}>
            <span className="text-[11px] font-semibold">Todas · {interventions.length}</span>
          </button>
          {byCategory.map(c => {
            const active = filter === c.key;
            const cc = colorMap[c.color];
            return (
              <button key={c.key} onClick={() => setFilter(c.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all ${
                  active ? `${cc.bg} ${cc.border} ${cc.text}` : "bg-zinc-900/60 border-zinc-800 text-zinc-500"
                }`}>
                <c.icon size={11} />
                <span className="text-[11px] font-semibold">{c.label} · {c.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      {interventions.length === 0 ? (
        <Card className="!p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
            <FlaskConical size={24} className="text-zinc-500" />
          </div>
          <div className="text-base font-bold text-white mb-2">Nenhuma intervenção</div>
          <div className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Registre a primeira mudança para a AI começar a conectar com resultados.
          </div>
        </Card>
      ) : sorted.length === 0 ? (
        <Card className="!p-4 text-center">
          <div className="text-sm text-zinc-400">Nenhuma intervenção nesta categoria.</div>
        </Card>
      ) : (
        <div>
          <SectionLabel>Timeline</SectionLabel>
          <div className="space-y-3">
            {sorted.map((iv, i) => {
              const cat = categoryMap[iv.category] || categoryMap.other;
              const act = actionMap[iv.action] || actionMap.start;
              const cc = colorMap[cat.color];
              const impact = ai?.interventionImpacts?.find(ii => ii.id === iv.id);
              const verdictColor = {
                "positivo": "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
                "negativo": "bg-rose-500/10 text-rose-300 border-rose-500/30",
                "neutro": "bg-zinc-800 text-zinc-400 border-zinc-700",
              };
              return (
                <Card key={iv.id} className="!p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${cc.bg} border ${cc.border} flex items-center justify-center flex-shrink-0`}>
                      <cat.icon size={16} className={cc.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-sm font-bold text-white leading-snug">{iv.title}</div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => startEdit(iv)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center active:scale-90">
                            <Pencil size={11} className="text-zinc-400" />
                          </button>
                          <button onClick={() => remove(iv.id)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center active:scale-90">
                            <Trash2 size={11} className="text-zinc-400" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cc.bg} ${cc.text} ${cc.border}`}>
                          {cat.label}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {act.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-semibold">· {formatDateBR(iv.date)}</span>
                      </div>

                      {iv.body && <div className="text-[12px] text-zinc-400 leading-relaxed mb-2">{iv.body}</div>}

                      {/* Impact analysis */}
                      {impact && impact.ready && (
                        <div className="mt-3 pt-3 border-t border-zinc-800/60">
                          <div className="flex items-center gap-2 mb-2">
                            <Cpu size={11} className="text-emerald-400" />
                            <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-semibold">Análise AI</span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${verdictColor[impact.verdict]}`}>
                              {impact.verdict}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {Object.entries(impact.deltas).map(([k, v]) => {
                              const labels = { sleep: "Sono", energy: "Energia", recovery: "Rec", focus: "Foco", hunger: "Fome", compliance: "Score" };
                              const inverted = k === "hunger";
                              const good = inverted ? v < -0.2 : v > 0.2;
                              const bad = inverted ? v > 0.2 : v < -0.2;
                              return (
                                <div key={k} className={`rounded-lg p-1.5 border ${
                                  good ? "bg-emerald-500/10 border-emerald-500/20" :
                                  bad ? "bg-rose-500/10 border-rose-500/20" :
                                  "bg-zinc-800/40 border-zinc-800"
                                }`}>
                                  <div className="text-[8px] uppercase tracking-widest text-zinc-500 font-semibold">{labels[k]}</div>
                                  <div className={`text-[11px] font-bold tabular-nums ${
                                    good ? "text-emerald-300" : bad ? "text-rose-300" : "text-zinc-400"
                                  }`}>
                                    {v > 0 ? "+" : ""}{v.toFixed(1)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-2">
                            Comparando {impact.daysBefore}d antes vs {impact.daysAfter}d depois
                          </div>
                        </div>
                      )}
                      {impact && !impact.ready && (
                        <div className="mt-3 pt-3 border-t border-zinc-800/60">
                          <div className="flex items-center gap-2">
                            <Clock size={11} className="text-zinc-500" />
                            <span className="text-[10px] text-zinc-500">
                              Aguardando mais dados · {impact.daysAfter}/3 dias depois
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
        <Info size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-zinc-500 leading-relaxed">
          Cada intervenção registrada é comparada automaticamente pela AI: métricas de 7 dias antes vs 7 dias depois. Mínimo 3 dias após para gerar análise.
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PROFILE — Body Data Layer
// ============================================================
const Profile = ({ protocol, setProtocol, labs, bodyComp, supplements, interventions, entries, setTab }) => {
  const [section, setSection] = useState("baseline");
  const latestLab = labs[labs.length - 1];
  const latestBody = bodyComp[bodyComp.length - 1];
  const currentWeight = entries.filter(e => e.weight != null).slice(-1)[0]?.weight ?? protocol.baseline.weight;

  const sections = [
    { key: "baseline", label: "Baseline", icon: User },
    { key: "body", label: "Corpo", icon: Gauge },
    { key: "labs", label: "Exames", icon: Beaker },
    { key: "supps", label: "Stack", icon: Pill },
    { key: "flags", label: "Flags", icon: Shield },
    { key: "history", label: "Histórico", icon: Clock },
  ];

  return (
    <div className="space-y-5 pb-28">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/80 p-5">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-emerald-500/30">DF</div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-semibold">Health data center</div>
              <div className="text-xl font-bold text-white tracking-tight">Danilo Filho</div>
              <div className="text-[11px] text-zinc-500">24 anos · 1,83m · {currentWeight}kg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {sections.map((s) => {
          const active = section === s.key;
          return (
            <button key={s.key} onClick={() => setSection(s.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all ${
                active ? "bg-white/5 border-zinc-700 text-white" : "bg-zinc-900/60 border-zinc-800 text-zinc-500"
              }`}>
              <s.icon size={12} />
              <span className="text-[11px] font-semibold">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* BASELINE */}
      {section === "baseline" && (
        <>
          <Card>
            <SectionLabel>Perfil pessoal</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <BioField label="Nome" value="Danilo Filho" />
              <BioField label="Idade" value={`${protocol.baseline.age} anos`} />
              <BioField label="Altura" value={`${protocol.baseline.height} m`} />
              <BioField label="Peso atual" value={`${currentWeight} kg`} delta={`${(currentWeight - protocol.baseline.weight).toFixed(1)} vs base`} />
              <BioField label="Trabalho" value={`${protocol.workStart}–${protocol.workEnd}`} />
              <BioField label="Treino" value="Manhã" />
              <BioField label="Fome" value="Alta" />
              <BioField label="Timezone" value="Fortaleza" />
            </div>
          </Card>

          <Card>
            <SectionLabel>Objetivos</SectionLabel>
            <div className="space-y-2">
              {protocol.goals.map((g, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/60">
                  <Target size={14} className="text-emerald-400" />
                  <span className="text-sm text-zinc-200">{g}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* BODY COMPOSITION */}
      {section === "body" && (
        <>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Última bioimpedância</SectionLabel>
              <span className="text-[10px] text-zinc-500 font-semibold">{formatDateBR(latestBody.date)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <BioField label="Peso" value={`${latestBody.weight} kg`} />
              <BioField label="BMI" value={latestBody.bmi} />
              <BioField label="Gordura" value={`${latestBody.bodyFatPct}%`} accent="amber" />
              <BioField label="Massa magra" value={`${latestBody.leanMassKg} kg`} accent="emerald" />
              <BioField label="Massa gorda" value={`${latestBody.fatMassKg} kg`} />
              <BioField label="Músculo" value={`${latestBody.muscleKg} kg`} accent="emerald" />
              <BioField label="Água" value={`${latestBody.waterPct}%`} />
              <BioField label="Gord. visceral" value={latestBody.visceralFat} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Microscope size={16} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Próxima bioimpedância</div>
                <div className="text-[11px] text-zinc-500">Rebaselinar em 45 dias</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                45d
              </span>
            </div>
          </Card>
        </>
      )}

      {/* LABS */}
      {section === "labs" && (
        <>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Painel metabólico</SectionLabel>
              <span className="text-[10px] text-zinc-500 font-semibold">{formatDateBR(latestLab.date)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <BioField label="Glicose" value={`${latestLab.metabolic.glucose}`} unit="mg/dL" good />
              <BioField label="HbA1c" value={`${latestLab.metabolic.hba1c}`} unit="%" good />
              <BioField label="Insulina" value={`${latestLab.metabolic.insulin}`} unit="μU/mL" />
            </div>
          </Card>

          <Card>
            <SectionLabel>Lipídios</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <BioField label="LDL" value={latestLab.lipids.ldl} unit="mg/dL" accent="rose" alert />
              <BioField label="HDL" value={latestLab.lipids.hdl} unit="mg/dL" />
              <BioField label="Triglicérides" value={latestLab.lipids.triglycerides} unit="mg/dL" />
              <BioField label="Colesterol total" value={latestLab.lipids.totalChol} unit="mg/dL" accent="rose" />
            </div>
          </Card>

          <Card>
            <SectionLabel>Fígado</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              <BioField label="ALT" value={latestLab.liver.alt} unit="U/L" accent="amber" />
              <BioField label="AST" value={latestLab.liver.ast} unit="U/L" />
              <BioField label="GGT" value={latestLab.liver.ggt} unit="U/L" accent="amber" alert />
            </div>
          </Card>

          <Card>
            <SectionLabel>Tireoide</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              <BioField label="TSH" value={latestLab.thyroid.tsh} unit="μIU/mL" accent="indigo" alert />
              <BioField label="T4 livre" value={latestLab.thyroid.t4} unit="ng/dL" />
              <BioField label="T3 total" value={latestLab.thyroid.t3} unit="pg/mL" />
            </div>
          </Card>

          <Card>
            <SectionLabel>Inflamação + vitaminas</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <BioField label="PCR" value={latestLab.inflammation.crp} unit="mg/L" good />
              <BioField label="Homocisteína" value={latestLab.inflammation.homocysteine} unit="μmol/L" />
              <BioField label="Vit D" value={latestLab.vitamins.vitD} unit="ng/mL" />
              <BioField label="B12" value={latestLab.vitamins.b12} unit="pg/mL" />
            </div>
          </Card>

          {/* BIOIMPEDÂNCIA — dentro da aba Exames */}
          {(() => {
            const latestBody = bodyComp && bodyComp.length ? bodyComp[bodyComp.length - 1] : null;
            if (!latestBody) return null;
            return (
              <>
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <SectionLabel>Bioimpedância</SectionLabel>
                    <div className="flex items-center gap-2">
                      {latestBody.device && (
                        <span className="text-[9px] uppercase tracking-widest font-semibold text-zinc-500">{latestBody.device}</span>
                      )}
                      <span className="text-[10px] text-zinc-500 font-semibold">{formatDateBR(latestBody.date)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <BioField label="Peso" value={latestBody.weight} unit="kg" />
                    <BioField label="IMC" value={latestBody.bmi} unit="kg/m²" />
                    <BioField label="PGC" value={latestBody.bodyFatPct} unit="%" accent="amber" alert />
                  </div>
                </Card>

                <Card>
                  <SectionLabel>Composição corporal</SectionLabel>
                  <div className="grid grid-cols-3 gap-2">
                    <BioField label="Massa magra" value={latestBody.leanMassKg} unit="kg" good />
                    <BioField label="Massa gorda" value={latestBody.fatMassKg} unit="kg" accent="amber" />
                    <BioField label="Músculo esq." value={latestBody.muscleKg} unit="kg" good />
                    {latestBody.proteinKg != null && (
                      <BioField label="Proteína" value={latestBody.proteinKg} unit="kg" />
                    )}
                    {latestBody.mineralsKg != null && (
                      <BioField label="Minerais" value={latestBody.mineralsKg} unit="kg" />
                    )}
                    {latestBody.totalBodyWaterL != null && (
                      <BioField label="Água" value={latestBody.totalBodyWaterL} unit="L" />
                    )}
                  </div>
                </Card>

                <Card>
                  <SectionLabel>Indicadores de risco</SectionLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {latestBody.visceralFat != null && (
                      <BioField
                        label="Visceral"
                        value={latestBody.visceralFat}
                        unit="nível"
                        accent={latestBody.visceralFat >= 10 ? "rose" : "emerald"}
                        alert={latestBody.visceralFat >= 10}
                      />
                    )}
                    {latestBody.waistHipRatio != null && (
                      <BioField
                        label="Cint/Qdril"
                        value={latestBody.waistHipRatio}
                        unit=""
                        accent={latestBody.waistHipRatio >= 0.9 ? "amber" : "emerald"}
                        alert={latestBody.waistHipRatio >= 0.9}
                      />
                    )}
                    {latestBody.waterPct != null && (
                      <BioField label="Água %" value={latestBody.waterPct} unit="%" />
                    )}
                  </div>
                </Card>

                {(latestBody.bmrKcal != null || latestBody.smi != null || latestBody.inBodyScore != null) && (
                  <Card>
                    <SectionLabel>Metabolismo + pontuação</SectionLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {latestBody.bmrKcal != null && (
                        <BioField label="TMB" value={latestBody.bmrKcal} unit="kcal" />
                      )}
                      {latestBody.smi != null && (
                        <BioField label="SMI" value={latestBody.smi} unit="kg/m²" good />
                      )}
                      {latestBody.inBodyScore != null && (
                        <BioField label="Score" value={latestBody.inBodyScore} unit="/100" />
                      )}
                    </div>
                  </Card>
                )}

                {latestBody.notes && (
                  <Card className="bg-gradient-to-br from-emerald-500/5 to-zinc-900/50 border-emerald-500/15">
                    <div className="text-[9px] uppercase tracking-widest text-emerald-400/80 font-semibold mb-1.5">
                      Observação
                    </div>
                    <div className="text-[12px] text-zinc-200 leading-relaxed">{latestBody.notes}</div>
                  </Card>
                )}
              </>
            );
          })()}

          <Card className="bg-gradient-to-br from-blue-500/10 to-zinc-900/50 border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <Beaker size={16} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Próximo retest</div>
                <div className="text-[11px] text-zinc-400">LDL + TSH em 45d · ALT/GGT em 60d · Bioimpedância em 45d</div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* SUPPLEMENTS */}
      {section === "supps" && (
        <Card>
          <SectionLabel>Stack atual</SectionLabel>
          <div className="space-y-2">
            {supplements.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/60">
                <Pill size={14} className="text-blue-400 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{s.name}</span>
                    <span className="text-[10px] text-zinc-500">{s.dose}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{s.purpose}</div>
                  <div className="text-[9px] text-zinc-600 mt-0.5">Desde {formatDateBR(s.since)}</div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-blue-300 border border-blue-500/20 bg-zinc-900/60 flex-shrink-0">
                  {s.timing}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* FLAGS */}
      {section === "flags" && (
        <>
          <Card>
            <SectionLabel>Flags estratégicos</SectionLabel>
            <div className="space-y-2">
              {[
                { label: "LDL elevado", tag: "LDL", icon: Activity },
                { label: "TSH elevado", tag: "TSH", icon: Brain },
                { label: "Estresse hepático leve", tag: "FÍGADO", icon: Shield },
                { label: "Perfil de fome alta", tag: "FOME", icon: Utensils },
                { label: "Foco em recovery", tag: "RECOVERY", icon: Heart },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/60">
                  <f.icon size={14} className="text-zinc-400" />
                  <span className="text-sm text-zinc-200 flex-1">{f.label}</span>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${tagColor[f.tag]}`}>{f.tag}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionLabel>Em boa faixa</SectionLabel>
            <div className="space-y-2">
              {protocol.biomarkers.good.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <Check size={14} className="text-emerald-400" strokeWidth={3} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{b.name}</div>
                    <div className="text-[11px] text-zinc-500">{b.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* HISTORY */}
      {section === "history" && (
        <>
          <button onClick={() => setTab("interventions")}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-zinc-900/40 border border-emerald-500/20 active:scale-[0.98] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <FlaskConical size={18} className="text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">Intervenções ({interventions.length})</div>
                <div className="text-[11px] text-zinc-400">Registrar e analisar mudanças</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-500" />
          </button>

          <Card>
            <SectionLabel>Últimas intervenções</SectionLabel>
            <div className="space-y-2">
              {[...interventions].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5).map((iv, i) => {
                const cat = INTERVENTION_CATEGORIES.find(c => c.key === iv.category);
                return (
                  <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/60">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {cat ? <cat.icon size={12} className="text-emerald-400" /> : <Bookmark size={12} className="text-emerald-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="text-sm font-semibold text-white truncate">{iv.title}</div>
                      </div>
                      <div className="text-[11px] text-zinc-500 mb-0.5">{formatDateBR(iv.date)} · {cat?.label || iv.category}</div>
                      {iv.body && <div className="text-[11px] text-zinc-400 line-clamp-2">{iv.body}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionLabel>Snapshots de exames</SectionLabel>
            <div className="space-y-2">
              {labs.map((l, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/60">
                  <Beaker size={14} className="text-blue-400" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{l.label}</div>
                    <div className="text-[11px] text-zinc-500">{formatDateBR(l.date)}</div>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    LDL {l.lipids.ldl} · TSH {l.thyroid.tsh}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionLabel>Snapshots de bioimpedância</SectionLabel>
            <div className="space-y-2">
              {bodyComp.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/60">
                  <Gauge size={14} className="text-emerald-400" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{b.label}</div>
                    <div className="text-[11px] text-zinc-500">{formatDateBR(b.date)}</div>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {b.weight}kg · {b.bodyFatPct}%BF · {b.leanMassKg}kg MM
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

const BioField = ({ label, value, unit, delta, accent, alert, good }) => {
  const accentColor = {
    amber: "text-amber-300", rose: "text-rose-300",
    indigo: "text-indigo-300", emerald: "text-emerald-300",
  };
  const color = good ? "text-emerald-300" : accent ? accentColor[accent] : "text-white";
  return (
    <div className="bg-zinc-800/30 rounded-xl p-3 border border-zinc-800/60">
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">{label}</span>
        {alert && <AlertTriangle size={9} className="text-amber-400" />}
      </div>
      <div className={`text-base font-bold tabular-nums ${color}`}>
        {value}{unit && <span className="text-[10px] text-zinc-500 ml-1 font-normal">{unit}</span>}
      </div>
      {delta && <div className="text-[9px] text-zinc-500 mt-0.5">{delta}</div>}
    </div>
  );
};

// ============================================================
// PLAN — Protocol Settings + Reviews
// ============================================================
const Plan = ({ protocol, setProtocol, entries, interventions }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(protocol);

  const save = () => { setProtocol(draft); setEditing(false); };
  const cancel = () => { setDraft(protocol); setEditing(false); };

  const TimeField = ({ label, field, hint }) => (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-zinc-300">{label}</span>
        {hint && <span className="text-[10px] text-zinc-500">{hint}</span>}
      </div>
      <input type="time" value={draft[field]} onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 h-11 text-white text-base font-semibold" />
    </div>
  );

  return (
    <div className="space-y-5 pb-28">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/80 p-5">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-1">Protocolo · 90 dias</div>
              <div className="text-xl font-bold text-white">Experimento pessoal</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Seg 20/abr → Dom 19/jul · Fortaleza</div>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center active:scale-95">
                <Edit3 size={14} className="text-zinc-300" />
              </button>
            ) : (
              <div className="flex gap-1.5">
                <button onClick={cancel} className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold">Cancelar</button>
                <button onClick={save} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold">Salvar</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div>
        <SectionLabel>Marcos do experimento</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {REVIEW_PERIODS.map((r, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <r.icon size={14} className="text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">{r.label}</div>
                <div className="text-[10px] text-zinc-500">revisão {r.days}d</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MANHÃ */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 flex items-center justify-center">
            <Sunrise size={18} className="text-amber-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white">Rotina da manhã</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Sequência real</div>
          </div>
        </div>
        {editing ? (
          <div className="space-y-4">
            <TimeField label="Acordar" field="wakeTime" />
            <TimeField label="Treino (cardio + força)" field="trainingTime" />
            <TimeField label="Sauna" field="saunaTime" hint="pós-treino" />
            <TimeField label="HBOT" field="hbotTime" hint="pós-sauna, manhã" />
          </div>
        ) : (
          <div className="space-y-2">
            {[
              { label: "Acordar + peso", time: protocol.wakeTime },
              { label: "Treino — cardio + força", time: protocol.trainingTime },
              { label: "Sauna 15–20 min", time: protocol.saunaTime },
              { label: "HBOT 60 min", time: protocol.hbotTime },
            ].map((it, j) => (
              <div key={j} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/60">
                <div className="w-1 h-1 rounded-full bg-amber-400" />
                <span className="text-sm text-zinc-200 flex-1">{it.label}</span>
                <span className="text-[10px] font-bold text-amber-300 tabular-nums">{it.time}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* TRABALHO */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 flex items-center justify-center">
            <Briefcase size={18} className="text-blue-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white">Trabalho</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Luz vermelha durante o dia</div>
          </div>
        </div>
        {editing ? (
          <div className="space-y-4">
            <TimeField label="Início" field="workStart" />
            <TimeField label="Fim" field="workEnd" />
            <TimeField label="Luz vermelha" field="redLightTime" hint="durante o trabalho" />
          </div>
        ) : (
          <div className="space-y-2">
            {[
              { label: "Início do trabalho", time: protocol.workStart },
              { label: "Luz vermelha 10–15 min", time: protocol.redLightTime },
              { label: "Fim do trabalho", time: protocol.workEnd },
            ].map((it, j) => (
              <div key={j} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/60">
                <div className="w-1 h-1 rounded-full bg-blue-400" />
                <span className="text-sm text-zinc-200 flex-1">{it.label}</span>
                <span className="text-[10px] font-bold text-blue-300 tabular-nums">{it.time}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* NOITE */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 flex items-center justify-center">
            <Sunset size={18} className="text-indigo-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white">Noite</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Flexível · sem horário fixo</div>
          </div>
        </div>
        {editing ? (
          <div className="space-y-4">
            <TimeField label="Jantar leve" field="dinnerTime" />
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-zinc-300">Meta de sono (h)</span>
                <span className="text-[10px] text-zinc-500">flexível</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDraft({ ...draft, sleepTarget: Math.max(5, draft.sleepTarget - 0.25) })}
                  className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold">−</button>
                <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 h-11 text-white text-center text-base font-semibold tabular-nums flex items-center justify-center">
                  {draft.sleepTarget}h
                </div>
                <button onClick={() => setDraft({ ...draft, sleepTarget: Math.min(10, draft.sleepTarget + 0.25) })}
                  className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold">+</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {[
              { label: "Jantar leve", time: protocol.dinnerTime },
              { label: "Zero álcool", time: "sempre" },
              { label: "Magnésio Koala", time: "noite" },
              { label: `Meta de sono: ${protocol.sleepTarget}h`, time: "flexível" },
            ].map((it, j) => (
              <div key={j} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/60">
                <div className="w-1 h-1 rounded-full bg-indigo-400" />
                <span className="text-sm text-zinc-200 flex-1">{it.label}</span>
                <span className="text-[10px] font-bold text-indigo-300">{it.time}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* CADENCE */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <TestTube size={18} className="text-zinc-300" />
          </div>
          <div>
            <div className="text-base font-bold text-white">Retestes programados</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Verificar o experimento</div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: "LDL + lipídios", badge: "45 dias" },
            { label: "TSH + T3/T4", badge: "45 dias" },
            { label: "ALT / GGT", badge: "60 dias" },
            { label: "Bioimpedância", badge: "45 dias" },
            { label: "Painel completo", badge: "90 dias" },
          ].map((it, j) => (
            <div key={j} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/60">
              <div className="w-1 h-1 rounded-full bg-zinc-400" />
              <span className="text-sm text-zinc-200 flex-1">{it.label}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-zinc-300 border border-zinc-700 bg-zinc-900/60">
                {it.badge}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================================
// APP SHELL
// ============================================================
export default function SystemOS() {
  // ------------------------------------------------------------
  // Repository — the ONLY storage boundary in the app.
  // UI components receive derived data + adapter callbacks;
  // they never touch React state directly.
  // ------------------------------------------------------------
  const repo = useRepository();

  // ------------------------------------------------------------
  // DATE WATCHER — keeps `today` always equal to Brasília's current
  // calendar day. Triggers:
  //   1. On mount (once repo is ready)
  //   2. Every 60 seconds while app is open
  //   3. When tab/window becomes visible again (mobile + desktop)
  // Why: without this, opening the app at 23:55 and leaving it open
  // past midnight (or backgrounding overnight) keeps `today` stale.
  // ------------------------------------------------------------
  useEffect(() => {
    if (!repo.ready) return;
    const tick = () => {
      try { repo.entries.ensureToday(); } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[dateWatcher] ensureToday failed:", err);
      }
    };
    // Immediate check on mount / ready
    tick();
    // Periodic check every 60s
    const intervalId = setInterval(tick, 60 * 1000);
    // Re-check when app comes back to foreground
    const onVisibility = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo.ready]);

  // ------------------------------------------------------------
  // SYSTEM STATE — composed by the Orchestrator.
  // Pipeline: repo.snapshot() → RuleEngine → AILayer → state.
  // UI consumes `systemState` (and its named sections) only.
  // ------------------------------------------------------------
  const snapshot = repo.snapshot();
  const systemState = useMemo(
    () => SystemOrchestrator.build(snapshot),
    // Re-run whenever any persisted collection changes.
    [
      snapshot.protocol,
      snapshot.entries,
      snapshot.interventions,
      snapshot.labs,
      snapshot.bodyComp,
      snapshot.supplements,
      snapshot.weeklySummaries,
      snapshot.checklistState,
    ]
  );

  // Named destructuring from SystemState — keeps screen wiring readable.
  // `data` = raw facts. `rules` = RuleEngine output (same shape the
  //   UI used to receive as the `ai` prop). `view` = display helpers.
  const { data, rules, view } = systemState;
  const { protocol, entries, interventions, labs, bodyComp, supplements, today } = data;
  const checklistState = systemState.math.checklistState;

  // ------------------------------------------------------------
  // Pure UI state (navigation — not persisted business data)
  // ------------------------------------------------------------
  const [tab, setTab] = useState("home");
  const [aiInitialSection, setAiInitialSection] = useState("tomorrow");

  const openAISection = (sectionKey) => {
    setAiInitialSection(sectionKey);
    setTab("ai");
  };

  // ------------------------------------------------------------
  // UI adapter callbacks — translate UI actions into repo calls.
  // Components receive these instead of raw setters, preserving
  // the repository boundary.
  // ------------------------------------------------------------
  const setTodayField = (field, value) => {
    repo.entries.updateToday({ [field]: value });
  };

  /**
   * setTodayFields — atomic multi-field update.
   * Required when committing multiple fields in the same tick
   * (e.g., Fechar dia sets nightLogged + closed together).
   * Avoids the stale-closure race where two sequential
   * setTodayField calls lose one of the writes.
   */
  const setTodayFields = (patch) => {
    repo.entries.updateToday(patch);
  };

  const updateProtocol = (nextProtocol) => {
    repo.protocol.replace(nextProtocol);
  };

  // Adapter for <Interventions />: the component uses a
  // React-style setter (prev → next). We translate that into
  // repository calls so the repo boundary stays intact.
  const setInterventionsCompat = (updater) => {
    const current = repo.interventions.list();
    const next = typeof updater === "function" ? updater(current) : updater;
    repo.interventions.replaceAll(next);
  };

  // Adapter for <Checklist />: same pattern as above.
  const setChecklistStateCompat = (updater) => {
    const current = repo.checklist.getAll();
    const next = typeof updater === "function" ? updater(current) : updater;
    repo.checklist.replaceAll(next);
  };

  // ------------------------------------------------------------
  // SCREENS — UI receives the same props as before. The `ai` prop
  // is now sourced from SystemState.rules (RuleEngine output +
  // passthrough AI fields). Every screen contract is unchanged.
  // ------------------------------------------------------------
  const screens = {
    home: <HomeScreen entries={entries} today={today} protocol={protocol} ai={rules} setTab={setTab} setTodayField={setTodayField} openAISection={openAISection} />,
    check: <Checklist today={today} checklistState={checklistState} setChecklistState={setChecklistStateCompat} protocol={protocol} />,
    log: <Log today={today} protocol={protocol} setTodayField={setTodayField} setTodayFields={setTodayFields} />,
    copilot: <CopilotTab ai={rules} entries={entries} protocol={protocol} today={today} />,
    ai: <AI ai={rules} entries={entries} protocol={protocol} labs={labs} bodyComp={bodyComp} interventions={interventions} initialSection={aiInitialSection} />,
    profile: <Profile protocol={protocol} setProtocol={updateProtocol} labs={labs} bodyComp={bodyComp}
      supplements={supplements} interventions={interventions} entries={entries} setTab={setTab} />,
    interventions: <Interventions interventions={interventions} setInterventions={setInterventionsCompat} ai={rules} />,
    plan: <Plan protocol={protocol} setProtocol={updateProtocol} entries={entries} interventions={interventions} />,
  };

  const tabs = [
    { key: "home", label: "Home", icon: Home, layer: "exec" },
    { key: "check", label: "Check", icon: CheckSquare, layer: "exec" },
    { key: "log", label: "Log", icon: Plus, primary: true, layer: "exec" },
    { key: "copilot", label: "Copilot", icon: Sparkles, layer: "intel" },
    { key: "profile", label: "Perfil", icon: User, layer: "body" },
  ];

  // Display-only helpers come pre-computed from the orchestrator.
  const { isPreLaunch, progressPct } = view;

  // Loading splash while IndexedDB hydrates
  if (!repo.ready) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center" style={{ fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-[9px] uppercase tracking-[0.25em] text-emerald-400/80 font-semibold">System OS</div>
          <div className="text-[15px] font-bold tracking-tight">DANILO FILHO</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 bg-gradient-to-b from-emerald-500/5 to-transparent" />
      </div>

      <div className="max-w-md mx-auto min-h-screen relative">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-zinc-900/80">
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-[8px] tracking-[0.3em] text-emerald-400/80 uppercase font-bold">System OS</div>
              <div className="text-[15px] font-bold tracking-tight leading-tight">DANILO FILHO</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setTab("plan")}
                className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-95">
                <Settings size={15} className="text-zinc-400" />
              </button>
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center text-black font-bold text-xs shadow-lg shadow-emerald-500/30">DF</div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-black ${isPreLaunch ? "bg-amber-400" : "bg-emerald-400"}`} />
              </div>
            </div>
          </div>
          <div className="px-5 pb-2">
            <div className="flex items-center gap-2">
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                {isPreLaunch ? "Dia 0/90" : `Dia ${today.day}/90`}
              </div>
              <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${isPreLaunch ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-emerald-500 to-emerald-400"}`}
                  style={{ width: `${Math.max(progressPct, 2)}%` }} />
              </div>
              <div className={`text-[9px] font-bold tabular-nums ${isPreLaunch ? "text-amber-400" : "text-emerald-400"}`}>
                {isPreLaunch ? "Pré" : `${progressPct}%`}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-5">{screens[tab]}</div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 pb-4 px-3">
          <div className="bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/80 rounded-full px-2 py-2 shadow-2xl shadow-black">
            <div className="flex items-center justify-between gap-1">
              {tabs.map((t) => {
                const active = tab === t.key;
                if (t.primary) {
                  return (
                    <button key={t.key} onClick={() => setTab(t.key)}
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 bg-gradient-to-br from-emerald-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/30">
                      <t.icon size={22} strokeWidth={2.75} />
                    </button>
                  );
                }
                return (
                  <button key={t.key} onClick={() => {
                    if (t.key === "ai") setAiInitialSection("tomorrow");
                    setTab(t.key);
                  }}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full transition-all ${
                      active ? "text-emerald-400" : "text-zinc-500"
                    }`}>
                    <t.icon size={18} strokeWidth={active ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
