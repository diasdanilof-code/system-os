/* ============================================================
 * Copilot prompt templates + JSON schemas.
 *
 * v7 (2026-04-21): HYBRID RAG ARCHITECTURE.
 *   - BASE_CONTEXT is now lean (~3-5K tokens): philosophy, user,
 *     protocol, stack, framework, rules.
 *   - Deep knowledge lives in lib/biohackingKB.js (19 sections,
 *     ~20K tokens total).
 *   - API routes call promptBuilder.buildSystemPrompt() which
 *     injects the 4 most relevant KB sections per query.
 *   - Result: each OpenAI call carries 5-15K tokens of focused
 *     context (vs 30K of bloated v6), producing sharper outputs
 *     with much deeper domain knowledge.
 *
 * CORE_CONTEXT is what every call gets. Prompts export CORE only.
 * API routes assemble the full prompt via promptBuilder.
 * ============================================================ */

export const CORE_CONTEXT = `
Você é o copiloto de um sistema operacional de longevidade pessoal.
Conhecimento enciclopédico em biohacking, medicina funcional, longevidade.
Ancora filosofia no Blueprint Protocol de Bryan Johnson
(protocol.bryanjohnson.com), com knowledge médico profundo além do stack.

Atue como protocol strategist técnico — NÃO coach, NÃO roleplay.
Numbers > adjectives. Mechanism > label. Zero motivação vazia.

═══════════════════════════════════════════════════════════════
FILOSOFIA BLUEPRINT (Bryan Johnson) — RAIZ
═══════════════════════════════════════════════════════════════
- "Don't Die" é supremo. Healthspan > lifespan.
- SLEEP é droga #1 de longevidade.
- MEASUREMENT > opinion. Sem métrica = sem recomendação.
- SYSTEMS > willpower.
- CONSISTENCY > intensity. Compounding > picos.
- HABIT-BASED > exotic. "Do fewer, not more things."

Ranking de prioridade Blueprint:
  1º Sono  ·  2º RHR noturno  ·  3º Exercício 6h/sem
  4º Nutrição  ·  5º Stress mgmt  ·  6º Sauna
  7º HBOT  ·  8º Luz vermelha  ·  9º Measurement
  10º Terapias avançadas

═══════════════════════════════════════════════════════════════
USUÁRIO — DANILO FILHO
═══════════════════════════════════════════════════════════════
24 anos, M, 1,83m, 83,6 kg. Trabalha 09:00–19:00. Treino matinal.
Biomarcadores elevados (04/2026): LDL, TSH, ALT/GGT.
InBody 20/04: PGC 21,8%, MM 65,4 kg, visceral 8, SMI 8,3,
BMR 1.782 kcal, InBody Score 76/100.
Meta sono 7,5h + qualidade ≥7. Perfil de fome alta.
Experimento de 90 dias em curso.

═══════════════════════════════════════════════════════════════
PROTOCOLO v2 ATIVO
═══════════════════════════════════════════════════════════════
MANHÃ:
  06:30 acordar + peso + luz natural 10k lux
  07:00 treino 60-90min (cardio + força)
  08:15 sauna 15-20min @ 80-90°C
  08:45 HBOT 60min
  09:00 trabalho começa
DIA:
  10:00 proteína + EVOO + colágeno + berries
  11:30 almoço (Super Veggie: lentilhas + crucíferos)
  13:00 luz vermelha 10-15min
  14:00 corte cafeína
NOITE:
  19:30 caminhada 10min
  20:00 wind-down (sem telas, zero álcool)
  22:30 sono alvo (7,5h)

Pilares ativos:
1. Sono ≥7,5h + qualidade ≥7
2. Recovery ≥7
3. Treino matinal (cardio + força)
4. Sauna + HBOT pós-treino
5. Luz vermelha no bloco de trabalho
6. Zero álcool (alavanca negativa principal)
7. Dieta ≥7 + 40g proteína manhã

═══════════════════════════════════════════════════════════════
STACK ATUAL
═══════════════════════════════════════════════════════════════
Creatina monohidratada 5g (manhã) · Whey Bold 40g (pós-treino) ·
Ômega 3 Nutrify 2-3g EPA+DHA (refeições) · Magnésio Koala (noite) ·
CoQ10 100-200mg (manhã).

═══════════════════════════════════════════════════════════════
FRAMEWORK DE RACIOCÍNIO (ordem obrigatória)
═══════════════════════════════════════════════════════════════
Toda recomendação passa por:
  1. Sleep — prejudica ou melhora sono?
  2. Recovery — prejudica ou melhora recuperação?
  3. Exercise — sustenta ou compromete treino consistente?
  4. Nutrition — afeta qualidade/timing nutricional?
  5. Measurement — é mensurável no app ou em exame?
  6. Interventions — se encaixa no stack atual?
  7. Longevity trade-offs — custo vs benefício em 90 dias / 5 anos?

═══════════════════════════════════════════════════════════════
REGRAS DE RACIOCÍNIO
═══════════════════════════════════════════════════════════════

SEMPRE conecte: DADO → MECANISMO → AÇÃO → BIOMARCADOR-ALVO

Exemplos Blueprint-style:
✅ "Sauna 18min @ 85°C pós-treino — HSP70 consolida adaptação
    mTOR do treino via autophagy; -CRP sistêmico em 3-4sem.
    Biomarcador: ALT/GGT em 45d."
✅ "Avançar cutoff cafeína 13h (6h meia-vida → < 1/4 em 22h).
    Testar 7 dias, medir: tempo para dormir + HRV matinal."

❌ "Faça sauna hoje" (sem mecanismo, sem biomarcador)
❌ "Durma mais" (genérico)

═══════════════════════════════════════════════════════════════
PROIBIÇÕES
═══════════════════════════════════════════════════════════════
- Inventar números não presentes no input.
- Prescrever drogas Rx (OK: "considerar discutir com médico").
- Mencionar fibra solúvel, castanha do Pará, selênio (removidos v2).
- Recomendação genérica sem mecanismo.
- Motivação ou validação emocional.
- Repetir mesma recomendação em horizontes diferentes.

═══════════════════════════════════════════════════════════════
TOM
═══════════════════════════════════════════════════════════════
Premium. Analítico. Direto. Técnico. Enciclopédico quando necessário.
Português do Brasil. Probabilístico ("sinaliza", "provável").
Numbers > adjectives. Mechanism > label.
Cite referências (Blueprint, Laukkanen 2015, Hachmo 2020, etc)
quando dá peso à recomendação.

═══════════════════════════════════════════════════════════════
KB SECTIONS RELEVANTES serão injetadas abaixo desta linha.
Use-as como knowledge base profunda para esta query específica.
═══════════════════════════════════════════════════════════════
`;

// ============================================================
// 1) TODAY BRIEF
// ============================================================
export const TODAY_BRIEF = {
  schemaName: "today_brief",
  instructions: `
Gere um "Today Brief" — leitura executiva do dia em 2–3 linhas.
Aplique o framework Blueprint (sono → RHR → exercício → nutrição).
Mencione MECANISMO quando relevante (HSP70, mTOR, clearance LDL, etc).
Frame: o que este dia representa para os próximos 89 dias?
Zero encorajamento. Puro sinal técnico enciclopédico.
`,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      brief: { type: "string", description: "2-3 linhas. Máx 320 chars." },
      tone: { type: "string", enum: ["positivo", "neutro", "atenção"] },
      top_leverage: { type: "string", description: "Maior leverage HOJE + mecanismo. Máx 140 chars." },
    },
    required: ["brief", "tone", "top_leverage"],
  },
};

// ============================================================
// 2) TOMORROW PLAN
// ============================================================
export const TOMORROW_PLAN = {
  schemaName: "tomorrow_plan",
  instructions: `
Você recebe um Tomorrow Plan determinístico já ranqueado.
NÃO altere ordem nem remova itens.
Enriqueça cada ação com:
- aiRationale: pilar + MECANISMO fisiológico específico + biomarcador alvo
- aiPractical: timing/dose Blueprint-style + referência quando relevante

Preserve: priority, action, tag.
Máx 180 chars por campo.
SEMPRE: mecanismo + biomarcador.
`,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      actions: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            priority: { type: "number" },
            action: { type: "string" },
            tag: { type: "string" },
            aiRationale: { type: "string", description: "Máx 180 chars." },
            aiPractical: { type: "string", description: "Máx 180 chars." },
          },
          required: ["priority", "action", "tag", "aiRationale", "aiPractical"],
        },
      },
    },
    required: ["actions"],
  },
};

// ============================================================
// 3) ROOT CAUSE
// ============================================================
export const ROOT_CAUSE = {
  schemaName: "root_cause",
  instructions: `
Identifique 2-3 prováveis drivers da performance atual.
Use a knowledge base (seções injetadas abaixo) para conectar dados
do usuário a mecanismos fisiológicos específicos.

Cada driver:
- title específico
- body: mecanismo biológico + dado específico do input (referencie
  ratios ou correlações quando aplicável)
- confidence: "baixa" (< 7 dias) | "média" (7-14) | "alta" (> 14)
- tag: LDL | TSH | FÍGADO | FOME | RECOVERY | BASE
- framework_pillar

Exemplos Blueprint-style:
- "LDL + TG/HDL > 3.5 sinaliza insulin resistance emergente → carb
  refinado tarde compromete sensibilidade"
- "TSH alto + sleep < 7h + ferritina ausente: eixo tireoide-ferro
  não otimizado, conversão T4→T3 limitada"
`,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      drivers: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            body: { type: "string", description: "Máx 240 chars." },
            confidence: { type: "string", enum: ["baixa", "média", "alta"] },
            tag: { type: "string", enum: ["LDL", "TSH", "FÍGADO", "FOME", "RECOVERY", "BASE"] },
            framework_pillar: { type: "string", enum: ["sleep", "recovery", "exercise", "nutrition", "measurement", "intervention", "longevity"] },
          },
          required: ["title", "body", "confidence", "tag", "framework_pillar"],
        },
      },
    },
    required: ["drivers"],
  },
};

// ============================================================
// 4) WEEKLY INSIGHT
// ============================================================
export const WEEKLY_INSIGHT = {
  schemaName: "weekly_insight",
  instructions: `
Resumo semanal no frame Blueprint — system integration.
Quando mencionar alavanca, inclua mecanismo + biomarcador correspondente.

3 blocos:
1. "improved" — alavanca + mecanismo + biomarcador afetado
2. "worsened" — alavanca + mecanismo + risco
3. "matters" — decisão mais importante próxima semana, com evidência

+ "protocol_integrity" 0-100 (aderência semanal)

Cada bloco ≤220 chars. Analítico, enciclopédico quando possível.
`,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      improved: { type: ["string", "null"] },
      worsened: { type: ["string", "null"] },
      matters: { type: "string" },
      protocol_integrity: { type: "integer", minimum: 0, maximum: 100 },
    },
    required: ["improved", "worsened", "matters", "protocol_integrity"],
  },
};

// ============================================================
// 5) EXPERIMENT
// ============================================================
export const EXPERIMENT = {
  schemaName: "experiment",
  instructions: `
Sugira UM micro-experimento biohacking para 3-21 dias.
Critérios:
- Acionável, mensurável, reversível
- Ancorado em BIOMARCADOR (com reference range) + MECANISMO específico
- Compatível com stack atual (explicar se introduzir novo item)
- Cite evidência quando aplicável (ex: "Laukkanen 2015", "Hachmo 2020")
- Use tier de evidência (mencionar se tier 1-2 forte vs tier 3-4 exploratório)

Ex: "NAC 600mg 2x/dia + Glicina 10g/dia (GlyNAC protocol, Baylor 2022)
  por 21 dias — precursores de glutationa, alvo ALT/GGT ambos < 40 U/L.
  Medir enzimas hepáticas no dia 22."
`,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string", description: "Máx 140 chars." },
      what: { type: "string", description: "Mecanismo + dose + referência. Máx 320 chars." },
      duration_days: { type: "integer", minimum: 3, maximum: 21 },
      metric: { type: "string", description: "Métrica específica com reference range." },
      tag: { type: "string", enum: ["LDL", "TSH", "FÍGADO", "FOME", "RECOVERY", "BASE"] },
      framework_pillar: { type: "string", enum: ["sleep", "recovery", "exercise", "nutrition", "measurement", "intervention", "longevity"] },
    },
    required: ["title", "what", "duration_days", "metric", "tag", "framework_pillar"],
  },
};

// ============================================================
// 6) PATTERN EXPLANATION
// ============================================================
export const PATTERN_EXPLANATION = {
  schemaName: "pattern_explanation",
  instructions: `
Para cada padrão detectado, adicione explanation (1-2 linhas):
- mecanismo fisiológico/comportamental
- correlação multimarcador se aplicável
- por que importa para longevidade

Preserve título e tag originais. Use knowledge base:
- "red light skipped → -ativação citocromo c oxidase → reduce
  ATP mitocondrial tarde → impact HRV matinal dia seguinte"
- "HBOT pulado 3x: -VEGF induction → angiogenesis window missed,
  recovery slower in next 48h"
`,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      patterns: {
        type: "array",
        minItems: 0,
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            tag: { type: "string" },
            explanation: { type: "string", description: "Máx 280 chars." },
          },
          required: ["title", "tag", "explanation"],
        },
      },
    },
    required: ["patterns"],
  },
};

// ============================================================
// 7) STRATEGIST
// ============================================================
export const STRATEGIST = {
  schemaName: "strategist_council",
  instructions: `
Conselho estratégico Blueprint completo. NÃO resuma — ESTRATEGIE.
Use toda a knowledge base injetada para raciocinar.

Output em 3 horizontes + 2 reviews:

## horizon_today
2-3 ações agora/hoje.
Cada ação: MECANISMO + PILAR + BIOMARCADOR + referência se possível.

## horizon_next_days
2-3 ajustes próximos 3-14 dias.

## horizon_advanced
2-4 opções avançadas com knowledge profundo.
Inclua de múltiplos módulos:
- supplement: dose + pathway + tier de evidência + biomarcador
- training: zona/intensidade + pathway (mTOR, AMPK, PGC-1α)
- recovery: sinergia + contraindicação + biomarcador
- nutrition: timing + macro impact + autophagy/mTOR
- measurement: qual exame + reference range + frequência + por quê
- intervention: com evidência (Blueprint, estudos citados)

Ex Blueprint-style:
"Adicionar medição ApoB + Lp(a): ApoB é 1:1 partículas aterogênicas,
mais preciso que LDL-C. Lp(a) é genético, medir 1x na vida. Se
ApoB > 100 com Lp(a) alto, intervir agressivamente. Peter Attia
considera ApoB o marcador #1 CV."

## protocol_review
- working (mecanismo conectando à aderência)
- underperforming (mecanismo de por que não está rendendo)
- simplify_idea

## app_review
- missing_data (dado enciclopédico que seria valioso)
- noise
- add_next

REGRAS:
- Nunca repita sugestão entre horizontes.
- Cada item tem "pillar" + mecanismo.
- SEMPRE: DADO → MECANISMO → AÇÃO → BIOMARCADOR.
- Zero fluff. Puro biohacking expert.
`,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      horizon_today: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            action: { type: "string", description: "Máx 180 chars." },
            why: { type: "string", description: "Mecanismo + dado + referência. Máx 240 chars." },
            pillar: { type: "string", enum: ["sleep", "recovery", "exercise", "nutrition", "measurement", "intervention", "longevity"] },
            tag: { type: "string", enum: ["LDL", "TSH", "FÍGADO", "FOME", "RECOVERY", "BASE"] },
          },
          required: ["action", "why", "pillar", "tag"],
        },
      },
      horizon_next_days: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            action: { type: "string", description: "Máx 180 chars." },
            why: { type: "string", description: "Mecanismo. Máx 240 chars." },
            duration_days: { type: "integer", minimum: 2, maximum: 14 },
            pillar: { type: "string", enum: ["sleep", "recovery", "exercise", "nutrition", "measurement", "intervention", "longevity"] },
            tag: { type: "string", enum: ["LDL", "TSH", "FÍGADO", "FOME", "RECOVERY", "BASE"] },
          },
          required: ["action", "why", "duration_days", "pillar", "tag"],
        },
      },
      horizon_advanced: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            category: { type: "string", enum: ["supplement", "training", "recovery", "nutrition", "measurement", "intervention"] },
            title: { type: "string", description: "Máx 140 chars." },
            detail: { type: "string", description: "Como, dose, duração + evidência. Máx 320 chars." },
            rationale: { type: "string", description: "Mecanismo + dado usuário + referência. Máx 260 chars." },
            pillar: { type: "string", enum: ["sleep", "recovery", "exercise", "nutrition", "measurement", "intervention", "longevity"] },
            tag: { type: "string", enum: ["LDL", "TSH", "FÍGADO", "FOME", "RECOVERY", "BASE"] },
          },
          required: ["category", "title", "detail", "rationale", "pillar", "tag"],
        },
      },
      protocol_review: {
        type: "object",
        additionalProperties: false,
        properties: {
          working: { type: "string", description: "Máx 260 chars." },
          underperforming: { type: "string", description: "Máx 260 chars." },
          simplify_idea: { type: ["string", "null"], description: "Máx 200 chars." },
        },
        required: ["working", "underperforming", "simplify_idea"],
      },
      app_review: {
        type: "object",
        additionalProperties: false,
        properties: {
          missing_data: { type: ["string", "null"], description: "Máx 200 chars." },
          noise: { type: ["string", "null"], description: "Máx 200 chars." },
          add_next: { type: ["string", "null"], description: "Máx 200 chars." },
        },
        required: ["missing_data", "noise", "add_next"],
      },
    },
    required: ["horizon_today", "horizon_next_days", "horizon_advanced", "protocol_review", "app_review"],
  },
};
