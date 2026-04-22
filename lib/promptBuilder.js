/* ============================================================
 * Prompt Builder — hybrid RAG layer.
 *
 * Responsibilities:
 *   1. Take the CORE_CONTEXT (lean ~3-5K tokens with philosophy
 *      + user profile + protocol + framework).
 *   2. Pull user input text + context signals.
 *   3. Retrieve relevant KB sections via keyword match.
 *   4. Assemble final system prompt: CORE + retrieved sections.
 *
 * Result: each API call sends only relevant knowledge (~5-15K tokens)
 * instead of dumping the entire KB (~30K tokens).
 * ============================================================ */

import { retrieveSections } from "./biohackingKB";

/**
 * Build final system prompt from core context + user-relevant KB sections.
 *
 * @param {object} opts
 * @param {string} opts.coreContext    — base system prompt (philosophy, user, protocol)
 * @param {string} opts.sectionHeader  — markdown header inserted before retrieved KB
 * @param {string|object} opts.input   — user input (for keyword extraction)
 * @param {number} opts.maxSections    — how many KB sections to include (default 4)
 * @returns {string} full assembled system prompt
 */
export function buildSystemPrompt({
  coreContext,
  sectionHeader = "\n═══════════════════════════════════════════════════════════════\nKNOWLEDGE BASE — sections relevant to this query\n═══════════════════════════════════════════════════════════════\n",
  input,
  maxSections = 4,
}) {
  if (!coreContext) return "";

  const queryText = typeof input === "string" ? input : JSON.stringify(input || {});
  const sections = retrieveSections(queryText, { maxSections });

  if (sections.length === 0) {
    return coreContext;
  }

  const kbBlock = sections
    .map((s) => `\n### KB:${s.id}\n${s.content.trim()}`)
    .join("\n");

  return coreContext + sectionHeader + kbBlock;
}

/**
 * Extract keyword hints from a user context object for better retrieval.
 * Specifically designed for Copilot context payloads.
 */
export function contextToQueryText(ctx) {
  if (!ctx) return "";
  const parts = [];

  // Scalar fields
  for (const k of Object.keys(ctx)) {
    const v = ctx[k];
    if (v === null || v === undefined) continue;
    if (typeof v === "string") parts.push(`${k}: ${v}`);
    if (typeof v === "number") parts.push(`${k}: ${v}`);
    if (typeof v === "boolean" && v) parts.push(`${k}: true`);
  }

  // Nested arrays (patterns, actions, drivers, etc.)
  if (Array.isArray(ctx.patterns)) {
    ctx.patterns.forEach((p) => {
      if (p?.title) parts.push(`pattern: ${p.title}`);
      if (p?.tag) parts.push(`tag: ${p.tag}`);
    });
  }
  if (Array.isArray(ctx.plan) || Array.isArray(ctx.tomorrow_plan)) {
    const plan = ctx.plan || ctx.tomorrow_plan;
    plan.forEach((p) => {
      if (p?.action) parts.push(`action: ${p.action}`);
      if (p?.tag) parts.push(`tag: ${p.tag}`);
    });
  }
  if (Array.isArray(ctx.weak_areas)) {
    ctx.weak_areas.forEach((w) => {
      if (w?.title) parts.push(`weakness: ${w.title}`);
    });
  }
  if (Array.isArray(ctx.current_supplements)) {
    parts.push(`supplements: ${ctx.current_supplements.join(", ")}`);
  }
  if (Array.isArray(ctx.biomarkers_flagged)) {
    parts.push(`biomarkers: ${ctx.biomarkers_flagged.join(", ")}`);
  }

  // Nested today_state (Strategist)
  if (ctx.today_state) {
    for (const k of Object.keys(ctx.today_state)) {
      const v = ctx.today_state[k];
      if (v !== null && v !== undefined && v !== false) {
        parts.push(`today_${k}: ${v}`);
      }
    }
  }

  return parts.join(" | ");
}
