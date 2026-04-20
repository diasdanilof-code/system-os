import { NextResponse } from "next/server";
import { callOpenAI } from "@/lib/openai";
import { STRATEGIST } from "@/lib/copilotPrompts";
import { cacheKey, cacheGet, cacheSet } from "@/lib/copilotCache";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req) {
  try {
    const body = await req.json();
    const key = cacheKey("strategist", body);
    const cached = cacheGet(key);
    if (cached) return NextResponse.json({ ok: true, data: cached, cached: true });

    const data = await callOpenAI({
      system: STRATEGIST.system,
      input: body,
      schema: STRATEGIST.schema,
      schemaName: STRATEGIST.schemaName,
      // Strategist emits a dense multi-horizon object — needs more tokens
      // and slightly longer timeout than the 6 default routes.
      maxOutputTokens: 2000,
      timeoutMs: 22000,
    });

    cacheSet(key, data);
    return NextResponse.json({ ok: true, data, cached: false });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 200 });
  }
}
