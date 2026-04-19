/* ============================================================
 * OpenAI client — server-side only.
 * Uses fetch directly (no SDK) to keep cold start fast on Vercel.
 * ============================================================ */

const OPENAI_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Call the OpenAI Responses API with a JSON-schema enforced output.
 */
export async function callOpenAI({
  system,
  input,
  schema,
  schemaName = "copilot_response",
  model = DEFAULT_MODEL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  reasoning = "none",
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const userText = typeof input === "string" ? input : JSON.stringify(input);

  const body = {
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: userText },
    ],
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        schema,
        strict: true,
      },
    },
    reasoning: { effort: reasoning },
    max_output_tokens: 800,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenAI ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();

    const output = data.output || [];
    for (const item of output) {
      if (item.type === "message" && Array.isArray(item.content)) {
        for (const part of item.content) {
          if (part.type === "output_text" && part.text) {
            return JSON.parse(part.text);
          }
        }
      }
    }
    if (data.output_text) {
      return JSON.parse(data.output_text);
    }
    throw new Error("No structured output in OpenAI response");
  } finally {
    clearTimeout(timer);
  }
}
