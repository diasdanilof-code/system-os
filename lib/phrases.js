/* ============================================================
 * Phrase of the Day — 30 curated phrases in pt-BR.
 * Rotates by dayNum → phrase[((dayNum - 1) % 30)].
 * ============================================================ */

export const PHRASES = [
  "Consistência vence intensidade. Todos os dias, sem exceção.",
  "O corpo responde ao que você repete. Repita o correto.",
  "Aderência perfeita é impossível. Aderência elevada é inegociável.",
  "Pequenas alavancas, aplicadas todos os dias, movem biomarcadores.",
  "Discipline-se hoje para ter dados confiáveis amanhã.",
  "Dormir bem não é descanso. É o próximo treino.",
  "Registre mesmo no dia difícil. Principalmente no dia difícil.",
  "O protocolo funciona nos dias em que você não quer segui-lo.",
  "Medir muda o que você mede.",
  "Fome alta é dado, não falha. Planeje em vez de resistir.",
  "HBOT é janela. Perder a janela é perder o efeito.",
  "Cardio Z2 parece lento. É o que move LDL no longo prazo.",
  "Zero álcool é a alavanca mais barata que você tem.",
  "Fibra solúvel diária é o composto do LDL.",
  "Duas castanhas do Pará. Todo dia. Sem drama.",
  "7,5h de sono é a diferença entre reagir e decidir.",
  "Recuperação não é opcional quando o TSH está alto.",
  "Proteína de manhã blinda o resto do dia.",
  "Treino matinal é a âncora. Sem ela, o dia vaza.",
  "Sauna + HBOT em sequência. Janela fixa. Bloco inegociável.",
  "Compliance não é perfeição. É reancorar sem drama.",
  "O experimento começa no primeiro dia que você termina exausto.",
  "Registre 5 segundos no app. Poupe 5 dias de análise.",
  "Dados honestos são mais valiosos que dados bonitos.",
  "Rebioimpedância em 45 dias. Painel em 90. Entre isso, execução.",
  "Estresse alto é sinal para desacelerar, não para apertar.",
  "Nenhum suplemento substitui 7 dias seguidos dormindo 7,5h.",
  "Padrões aparecem quando você para de fugir deles.",
  "Se o dia foi 6/10, feche como 6/10. Amanhã começa do zero.",
  "No Dia 90 você vai agradecer pela disciplina de hoje.",
];

export function phraseForDay(dayNum) {
  const i = Math.max(0, dayNum) % PHRASES.length;
  return PHRASES[i];
}
