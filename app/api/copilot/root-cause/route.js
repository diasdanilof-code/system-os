import { NextResponse } from "next/server";
import { callOpenAI } from "@/lib/openai";
import { ROOT_CAUSE } from "@/lib/copilotPrompts";
import { cacheKey, cacheGet, cacheSet } from "@/lib/copilotCache";

export const runtime = "nodejs";
export const maxDuration = 25;

export async function POST(req) {
  try {
    const body = await req.json();
    const key = cacheKey("root-cause", body);
    const cached = cacheGet(key);
    if (cached) return NextResponse.json({ ok: true, data: cached, cached: true });

    const data = await callOpenAI({
      system: ROOT_CAUSE.system,
      input: body,
      schema: ROOT_CAUSE.schema,
      schemaName: ROOT_CAUSE.schemaName,
    });

    cacheSet(key, data);
    return NextResponse.json({ ok: true, data, cached: false });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 200 });
  }
}
