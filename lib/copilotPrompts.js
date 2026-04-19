/* ============================================================
 * Copilot prompt templates + JSON schemas.
 * Each export is { system, schema, schemaName }.
 * ============================================================ */

const BASE_CONTEXT = `
Você é o copiloto do "System OS — Danilo Filho", um OS pessoal de performance e longevidade para um experimento de 90 dias.

Usuário: Danilo Filho, 24 anos, 1,83m, 82 kg. Treina cedo.
Biomarcadores elevados: LDL, TSH, ALT/GGT.
Perfil de fome alta.

Seu papel:
- Sintetizar, priorizar, explicar e sugerir.
- NÃO inventar números.
- Usar linguagem probabilística quando apropriado ("provável", "sinaliza", "pode indicar").
- Sempre escrever em português do Brasil, tom disciplinado, premium, sem floreios.
- Sempre respeitar a lógica determinística que já vem calculada.
- Ser conciso.
`;

export const TODAY_BRIEF = {
  schemaName: "today_brief",
  system: BASE_CONTEXT + `
Gere um "Today Brief": resumo executivo do estado atual do dia em 2-3 linhas.
Base: sono, sensação ao acordar, recovery recente, tendências, aderência ao protocolo.
Tom: direto, observacional, acionável.
`,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      brief: { type: "string", description: "2-3 linhas. Máx 280 chars." },
      tone: { type: "string", enum: ["positivo", "neutro", "atenção"] },
    },
    required: ["brief", "tone"],
  },
};

export const TOMORROW_PLAN = {
  schemaName: "tomorrow_plan",
  system: BASE_CONTEXT + `
Você recebe um Tomorrow Plan determinístico já ranqueado.
NÃO mude a ordem nem remova itens.
APENAS adicione para cada ação:
- uma rationale curta (1 linha) explicando o porquê
- uma nota prática (1 linha) com como fazer

Preserve os campos: priority, action, tag.
Adicione: aiRationale, aiPractical.
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
            aiRationale: { type: "string", description: "Máx 120 chars." },
            aiPractical: { type: "string", description: "Máx 120 chars." },
          },
          required: ["priority", "action", "tag", "aiRationale", "aiPractical"],
        },
      },
    },
    required: ["actions"],
  },
};

export const ROOT_CAUSE = {
  schemaName: "root_cause",
  system: BASE_CONTEXT + `
Identifique 2-3 prováveis drivers da performance atual baseado nos dados.
Para cada driver:
- title (ex: "Sono abaixo da meta")
- body (1-2 linhas explicando o mecanismo)
- confidence: "baixa" | "média" | "alta"
- tag: LDL | TSH | FÍGADO | FOME | RECOVERY | BASE
Use confiança honesta — se dados são escassos (< 7 dias logados), use "baixa".
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
            body: { type: "string", description: "Máx 180 chars." },
            confidence: { type: "string", enum: ["baixa", "média", "alta"] },
            tag: { type: "string", enum: ["LDL", "TSH", "FÍGADO", "FOME", "RECOVERY", "BASE"] },
          },
          required: ["title", "body", "confidence", "tag"],
        },
      },
    },
    required: ["drivers"],
  },
};

export const WEEKLY_INSIGHT = {
  schemaName: "weekly_insight",
  system: BASE_CONTEXT + `
Resumo semanal conciso. 3 blocos curtos:
1. "improved" — o que melhorou (ou null)
2. "worsened" — o que piorou (ou null)
3. "matters" — o que mais importa agora (obrigatório)

Cada bloco com no máximo 160 chars. Tom analítico.
`,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      improved: { type: ["string", "null"] },
      worsened: { type: ["string", "null"] },
      matters: { type: "string" },
    },
    required: ["improved", "worsened", "matters"],
  },
};

export const EXPERIMENT = {
  schemaName: "experiment",
  system: BASE_CONTEXT + `
Sugira UM micro-experimento pequeno e seguro para os próximos dias.
Deve ser:
- Acionável
- Mensurável
- Reversível
- Baseado em biomarcadores do usuário (LDL/TSH/fígado/fome/recovery)

Evite experimentos genéricos. Conecte ao protocolo atual.
`,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string", description: "Máx 80 chars." },
      what: { type: "string", description: "O que fazer, máx 200 chars." },
      duration_days: { type: "integer", minimum: 3, maximum: 21 },
      metric: { type: "string", description: "Métrica a observar." },
      tag: { type: "string", enum: ["LDL", "TSH", "FÍGADO", "FOME", "RECOVERY", "BASE"] },
    },
    required: ["title", "what", "duration_days", "metric", "tag"],
  },
};

export const PATTERN_EXPLANATION = {
  schemaName: "pattern_explanation",
  system: BASE_CONTEXT + `
Você recebe padrões já detectados pelo rule engine determinístico.
Para cada um, adicione uma explicação humana curta (1-2 linhas):
- por que isso importa
- o que provavelmente está causando

Preserve título e tag originais. Adicione campo "explanation".
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
            explanation: { type: "string", description: "Máx 200 chars." },
          },
          required: ["title", "tag", "explanation"],
        },
      },
    },
    required: ["patterns"],
  },
};
