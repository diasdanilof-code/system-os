import { NextResponse } from "next/server";
import { callOpenAI } from "@/lib/openai";
import { EXPERIMENT } from "@/lib/copilotPrompts";
import { cacheKey, cacheGet, cacheSet } from "@/lib/copilotCache";

export const runtime = "nodejs";
export const maxDuration = 25;

export async function POST(req) {
  try {
    const body = await req.json();
    const key = cacheKey("experiment", body);
    const cached = cacheGet(key);
    if (cached) return NextResponse.json({ ok: true, data: cached, cached: true });

    const data = await callOpenAI({
      system: EXPERIMENT.system,
      input: body,
      schema: EXPERIMENT.schema,
      schemaName: EXPERIMENT.schemaName,
    });

    cacheSet(key, data);
    return NextResponse.json({ ok: true, data, cached: false });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 200 });
  }
}
