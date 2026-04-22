import { NextResponse } from "next/server";
import { callOpenAI } from "@/lib/openai";
import { CORE_CONTEXT, WEEKLY_INSIGHT } from "@/lib/copilotPrompts";
import { buildSystemPrompt, contextToQueryText } from "@/lib/promptBuilder";
import { cacheKey, cacheGet, cacheSet } from "@/lib/copilotCache";

export const runtime = "nodejs";
export const maxDuration = 25;

export async function POST(req) {
  try {
    const body = await req.json();
    const key = cacheKey("weekly", body);
    const cached = cacheGet(key);
    if (cached) return NextResponse.json({ ok: true, data: cached, cached: true });

    const queryText = contextToQueryText(body);
    const systemPrompt = buildSystemPrompt({
      coreContext: CORE_CONTEXT + WEEKLY_INSIGHT.instructions,
      input: queryText + " weekly review integrity",
      maxSections: 4,
    });

    const data = await callOpenAI({
      system: systemPrompt,
      input: body,
      schema: WEEKLY_INSIGHT.schema,
      schemaName: WEEKLY_INSIGHT.schemaName,
    });

    cacheSet(key, data);
    return NextResponse.json({ ok: true, data, cached: false });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 200 });
  }
}
