import { NextResponse } from "next/server";
import { callOpenAI } from "@/lib/openai";
import { CORE_CONTEXT, STRATEGIST } from "@/lib/copilotPrompts";
import { buildSystemPrompt, contextToQueryText } from "@/lib/promptBuilder";
import { cacheKey, cacheGet, cacheSet } from "@/lib/copilotCache";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req) {
  try {
    const body = await req.json();
    const key = cacheKey("strategist", body);
    const cached = cacheGet(key);
    if (cached) return NextResponse.json({ ok: true, data: cached, cached: true });

    // Strategist uses full-context query — pull more sections (denser coverage)
    const queryText = contextToQueryText(body);
    const systemPrompt = buildSystemPrompt({
      coreContext: CORE_CONTEXT + STRATEGIST.instructions,
      input: queryText + " sleep recovery exercise nutrition supplement intervention measurement",
      maxSections: 6, // strategist needs widest context
    });

    const data = await callOpenAI({
      system: systemPrompt,
      input: body,
      schema: STRATEGIST.schema,
      schemaName: STRATEGIST.schemaName,
      maxOutputTokens: 2000,
      timeoutMs: 22000,
    });

    cacheSet(key, data);
    return NextResponse.json({ ok: true, data, cached: false });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 200 });
  }
}
