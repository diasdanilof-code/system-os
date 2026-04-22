import { NextResponse } from "next/server";
import { callOpenAI } from "@/lib/openai";
import { CORE_CONTEXT } from "@/lib/copilotPrompts";
import { buildSystemPrompt, contextToQueryText } from "@/lib/promptBuilder";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * /api/copilot/chat
 *
 * Conversational AI endpoint — expert in biohacking + usuário context.
 * Accepts the full user message + history + real user data.
 * Uses CORE_CONTEXT v8 + KB retrieval (6 sections for widest context).
 * Returns a markdown answer.
 *
 * Body shape:
 * {
 *   message: string,                       // pergunta atual
 *   history: [{role, content}, ...],       // últimas 6-10 mensagens
 *   user_context: {
 *     latest_lab?: {...},
 *     latest_body_comp?: {...},
 *     body_comp_delta?: {...},
 *     current_supplements?: [...],
 *     biomarkers_flagged?: [...],
 *     compliance_7d?: number,
 *     sleep_avg_7d?: number,
 *     recovery_avg_7d?: number,
 *     day_index?: number,
 *   }
 * }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const message = String(body?.message || "").trim();
    const history = Array.isArray(body?.history) ? body.history.slice(-10) : [];
    const user_context = body?.user_context || {};

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "message_required" },
        { status: 200 }
      );
    }

    const CHAT_INSTRUCTIONS = `
Você está em modo CHAT conversacional com o usuário (Danilo).
Responda a pergunta dele usando a mesma filosofia técnica e os mesmos
princípios da REGRA SUPREMA do CORE_CONTEXT.

🔴 OBRIGATÓRIO em cada resposta:
  (1) Citar pelo menos 1 dado REAL do usuário (do "user_context"
      abaixo) quando a pergunta é pessoal. Se não tem dado, dizer
      "preciso medir X antes de responder bem".
  (2) Dar ação concreta + alvo mensurável + prazo.
  (3) DADO → MECANISMO → AÇÃO → BIOMARCADOR-ALVO.
  (4) Citar estudo/referência quando dá peso à recomendação
      (Blueprint, Attia, Laukkanen 2015, Hachmo 2020, Baylor 2022,
      Seiler 80/20, Norwegian 4x4, Sinclair, Dayspring, etc).
  (5) Se é pergunta "exames a fazer", sugerir painéis específicos
      com reference range.
  (6) Se é pergunta sobre rotina ("troquei horário, muda algo?"),
      responder em termos de mecanismo + janela circadiana + sinergia.

FORMATO DE SAÍDA (markdown curto, mobile-friendly):
  - Resposta direta em 2-4 parágrafos OU bullets quando aplicável
  - Máx 800 palavras
  - Bold nos números/alvos chave
  - Nunca motivação vazia
  - Nunca disclaimer genérico ("consulte médico") exceto quando
    fala em droga Rx

EXEMPLOS de perguntas que você recebe e tom de resposta:

Q: "Não fiz hiperbárica às 9h, posso fazer às 16h?"
R: "Sim, com trade-off. HBOT pós-treino (janela 2-4h) sinergia com
mTOR + HSP70 + VEGF induction do exercício. Às 16h você perde
essa sinergia, mas ainda ganha angiogênese (VEGF) + clearance
metabólica + anti-inflamatório sistêmico. Para SEU protocolo
(treino matinal), o ótimo é 08:45. Se precisar deslocar: ≤4h
pós-treino > 6h > 8h. **Às 16h ≈ 70% do benefício** do timing
ideal. Não pule — prefira deslocar."

Q: "Quais os melhores suplementos pra eu melhorar meu LDL?"
R: "Seu LDL 162 está 2x acima do Blueprint (<70). Priorização por
evidência e custo-benefício:
1. **Ômega 3 EPA+DHA 3g/dia** (tier 1) — -trigs 15-30%, -sdLDL,
   -CRP. Alvo ômega-3 index >8%.
2. **Fibra psyllium 10-15g/dia** (tier 1) — liga bile acid →
   ↓ reabsorção colesterol. -LDL 5-10%.
3. **Berberine 500mg 2-3x/dia** (tier 2) — ativa AMPK → ↓ PCSK9
   → ↑ LDL receptor. -LDL 15-20%.
4. **Fitoesteróis 2g/dia** (tier 2) — competição intestinal com
   colesterol. -LDL 10%.
5. **Red yeast rice 1200-2400mg** (tier 2) — estatina natural
   (monacolin K). -LDL 15-25%. Cuidado: rhabdomiólise rara.

Stack sugerido: Ômega 3 já tem (bom). Adicionar psyllium manhã +
berberine peri-refeição. **Alvo LDL <120 em 8 semanas, <100 em 16.**
Remedir com ApoB (mais acurado)."

Agora responda a pergunta abaixo com esse rigor.
`;

    // Use contextToQueryText para extrair keywords do user_context +
    // da pergunta para melhor RAG retrieval
    const queryText =
      contextToQueryText(user_context) +
      " | question: " +
      message;

    const systemPrompt = buildSystemPrompt({
      coreContext: CORE_CONTEXT + CHAT_INSTRUCTIONS,
      input: queryText,
      maxSections: 6, // chat: contexto largo
    });

    // Converte histórico em formato conversacional + pergunta atual
    const conversation = [
      ...history,
      { role: "user", content: message },
    ];

    const inputPayload = {
      user_context,
      conversation,
      question: message,
    };

    const data = await callOpenAI({
      system: systemPrompt,
      input: inputPayload,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          answer: {
            type: "string",
            description:
              "Resposta em markdown, 2-4 parágrafos ou bullets, citando dados reais + mecanismo + ação + alvo. Máx 3000 chars.",
          },
          refs: {
            type: "array",
            maxItems: 4,
            items: { type: "string" },
            description:
              "Referências chave citadas na resposta (ex: Blueprint, Laukkanen 2015, Attia, Baylor 2022).",
          },
          follow_up_suggestions: {
            type: "array",
            maxItems: 3,
            items: { type: "string" },
            description:
              "3 perguntas sugeridas de follow-up, <80 chars cada, relevantes.",
          },
        },
        required: ["answer", "refs", "follow_up_suggestions"],
      },
      schemaName: "chat_answer",
      maxOutputTokens: 1800,
      timeoutMs: 25000,
    });

    return NextResponse.json({ ok: true, data, cached: false });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 200 }
    );
  }
}
