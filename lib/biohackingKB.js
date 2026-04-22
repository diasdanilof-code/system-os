/* ============================================================
 * Biohacking Knowledge Base — v1
 *
 * Dense reference material organized in self-contained sections.
 * Each section declares:
 *   - id: unique key
 *   - keywords: words that trigger retrieval
 *   - priority: 1 (core) to 3 (niche); retrieval prefers lower
 *   - content: full text injected into prompt when retrieved
 *
 * promptBuilder.js reads this + user context and injects the
 * top N most relevant sections into the OpenAI system message.
 * ============================================================ */

export const KB_SECTIONS = [
  // ========================================================
  // LIPIDS & CARDIOVASCULAR
  // ========================================================
  {
    id: "lipids_deep",
    keywords: ["ldl", "hdl", "trig", "triglicer", "colesterol", "cholesterol", "apob", "lp(a)", "lpa", "lipoprotein", "estatina", "statin", "ezetimibe", "pcsk9", "repatha", "evolocumab", "praluent", "bempedoic", "sdldl"],
    priority: 1,
    content: `
## Deep dive — LIPIDS & CARDIOVASCULAR RISK

### ApoB vs LDL-C (por que ApoB é superior)
LDL-C mede MASSA de colesterol em partículas LDL. ApoB conta
PARTÍCULAS (1 ApoB = 1 partícula aterogênica: LDL + IDL + VLDL + Lp(a)).
Em padrão B (small dense LDL), LDL-C pode estar "normal" mas ApoB alto
por partículas numerosas menores. ApoB é marcador #1 CV segundo Peter
Attia, Tom Dayspring, Allan Sniderman.

Alvos ApoB (mg/dL):
  < 60: extremo Blueprint
  < 80: ótimo primary prevention
  60-80: moderado
  > 80: elevado, investigar
  > 100: alto risco, intervenção

### Lp(a) — medir 1x na vida
Genético, pouquíssima modulação por lifestyle.
Elevado em ~20% da população. Aumenta risco CV 2-3x.
  Ótimo: < 30 mg/dL (< 75 nmol/L)
  Alto: > 50 mg/dL (> 125 nmol/L)
Único que reduz: niacina alta dose, apheresis, Olpasiran/Pelacarsen
  (ambos em fase 3).

### sdLDL (small dense LDL)
Subfração mais aterogênica. NMR LipoProfile mede.
Driven por: trigs altos, insulin resistance, carbo refinado.
Reduzir: -carb refinado, +cardio Z2, ômega 3, perda peso.

### Remnant cholesterol
= Colesterol total − HDL − LDL. Representa VLDL e IDL cholesterol.
  < 15 mg/dL: ótimo
  15-30: moderado
  > 30: alto (muitas vezes em NAFLD, pré-diabetes)

### Escalada de intervenções lipídicas (por potência)
1. Estilo de vida: cardio + -carbo refinado + -álcool + perda peso
2. Ômega 3 EPA/DHA 2-4g/dia: -trigs 15-30%, -CRP
3. Ezetimibe 10mg: -LDL 15-22%, seguro, barato
4. Bempedoic acid 180mg: -LDL 15-25%, sem mialgia
5. Estatina low-dose (rosuvastatin 5-10mg): -LDL 30-45%
6. Estatina high-intensity: -LDL 45-60%
7. PCSK9 inhibitor (Repatha/Praluent): +50-60% sobre statin
8. Inclisiran: siRNA, 2x/ano. -50% LDL.

### Efeitos colaterais estatinas
Mialgia 5-10%, depleção CoQ10 (supplementar 100-200mg ubiquinol),
diabetes +9% risk (especialmente high-intensity), memory fog raro
(reversível). Mialgia pode ser placebo em RCT (StatinWise 2020).
Em statin-intolerant: trocar molécula, tentar dose baixa + ezetimibe,
ou pular pra bempedoic/PCSK9.
`,
  },

  // ========================================================
  // GLUCOSE / INSULIN / METABOLIC
  // ========================================================
  {
    id: "metabolic_deep",
    keywords: ["glicose", "glucose", "insulina", "insulin", "hba1c", "homa", "diabetes", "pré-diabetes", "resistance", "metformin", "metformina", "berberine", "acarbose", "jardiance", "glp", "ozempic", "semaglutida", "jejum", "fasting", "cgm", "frutosamina"],
    priority: 1,
    content: `
## Deep dive — GLUCOSE, INSULIN, METABOLIC HEALTH

### CGM (Continuous Glucose Monitor) — superior a qualquer pontual
Dados-chave:
  Average glucose: alvo 80-100 mg/dL (Blueprint ~84)
  Glucose variability (SD): alvo < 15 mg/dL
  Time in range (70-140): alvo > 95%
  Postprandial peak: alvo < 30 mg/dL acima basal
  Nighttime: alvo estável, sem dawn phenomenon pronunciado

Drivers de variabilidade alta:
  - Carbo refinado (especialmente líquido: sucos, açúcar)
  - Jantar tarde
  - Stress/cortisol
  - Sono < 6h
  - Inatividade pós-refeição

Intervenções:
  - Caminhada 10-15min pós-refeição: -peak 25-30%
  - Vinagre de maçã 1 Tbsp pré-refeição: -peak 20%
  - Sequência de prato: fibra → proteína → carbo
  - Proteína/fibra pré carbo: -peak + -glucose AUC

### HOMA-IR calculation
= (glucose jejum × insulin jejum) / 405
  < 1.0: ótimo
  1.0-1.9: normal
  2.0-2.9: moderado IR
  ≥ 3.0: insulin resistant

### Matsuda index (OGTT)
Mais preciso que HOMA em resposta dinâmica. Mede insulin sensitivity
durante 2h pós-glucose load.

### Metformin — mecanismo + cautela
Ativa AMPK → inibe gluconeogênese hepática, sensibiliza insulina.
Inibe complexo I mitocondrial levemente → reduz ROS mas pode blunt
hypertrophy de treino de força (Konopka 2019: -30% muscle gains em
idosos treinando + metformin).
Dose longevity off-label: 500mg manhã + 500mg noite (com refeição
pra -GI upset). Bryan cicla 6 semanas on/off.
TAME trial (Nir Barzilai): em andamento, vai validar metformin anti-aging.

Efeitos colaterais:
  GI upset (30-50% início, diminui em 2-4 sem)
  Depleção B12 (supplementar 1000μg/dia)
  Acidose láctica rara (insuf. renal eGFR < 30 contraindicado)

### Berberina — metformin "natural"
Mecanismo similar (+AMPK). -HbA1c ~0.7%, -LDL 16%.
Dose: 500mg 2-3x/dia com refeição.
Combinar com metformin: sinergia mas GI worsens.

### GLP-1 agonists (Ozempic/Wegovy, Mounjaro/Zepbound)
Semaglutide (Ozempic): -peso 10-15%, -HbA1c 1.5%, +saciedade.
Tirzepatide (Mounjaro): dual GIP+GLP-1, -peso 20-25%.
Efeitos: náusea (30%), gastroparesia raro, pancreatitis raro.
Para biohacking longevidade: off-label se BMI > 27 + metabolic issues.

### Acarbose
Inibe alfa-glucosidase → -absorção carbo.
Dose: 50-100mg pré-refeição.
-Postprandial peak 30-40%. Flatulência alta.
Bryan usa 200mg/dia com final meal.

### Jejum intermitente — hierarquia de protocolos
16:8 (janela 8h): leve, sustentável, AMPK modesto
18:6: melhor autophagy activation
20:4 (OMAD): autophagy forte, risco social/performance
24h 1-2x/sem: mitophagy significativa
72-120h prolongado 1-2x/ano: stem cell renewal (Longo lab)
Alimentar-se cedo (janela 8-16h) melhor que tarde (14-22h) para
glicose + sono.
`,
  },

  // ========================================================
  // LIVER FUNCTION / NAFLD
  // ========================================================
  {
    id: "liver_deep",
    keywords: ["alt", "ast", "ggt", "fígado", "liver", "nafld", "esteatose", "bilirrubina", "albumina", "alp", "fosfatase", "hepatite", "hemocromatose", "glicina", "nac", "glynac", "cirrose", "fibrose"],
    priority: 1,
    content: `
## Deep dive — LIVER FUNCTION, NAFLD, HEPATIC BIOHACKING

### Padrões de elevação enzimática
ALT isolado alto, AST normal, GGT moderado: NAFLD (esteatose)
ALT alto, AST alto, GGT alto: hepatite (viral/alcoólica/tóxica)
AST > ALT (ratio > 2): álcool OU lesão muscular (checar CPK)
GGT isolado > 80: álcool, medicação indutora, colestase
ALP alto + GGT alto: colestase/obstrução biliar
ALP alto + GGT normal: origem óssea (crianças, Paget)
ALT normal + plaquetas baixas + albumina baixa: fibrose avançada

### NAFLD (Non-Alcoholic Fatty Liver Disease)
Afeta 25-30% adultos, 70-90% obesos. Spectrum:
  Esteatose simples (gordura > 5% hepatócitos)
  NASH (esteatohepatite, inflamação)
  Fibrose → cirrose (10-20% NASH em 10 anos)

Drivers primários:
  - Frutose adicionada (especialmente HFCS)
  - Carbo refinado + insulin resistance
  - Álcool (mesmo moderado)
  - Sedentarismo
  - Obesidade visceral

Diagnóstico não-invasivo:
  FIB-4 score: <1.45 low risk, >3.25 high risk
  ELF test: matriz extracelular fibrose
  FibroScan (elastografia): gold standard não-invasivo
  MRI-PDFF: quantifica gordura hepática

Intervenção (tier 1 → 4):
  1. -Frutose adicionada + -álcool + perda peso 5-10%
  2. Cardio Z2 150min/sem: -gordura hepática 40-60%
  3. Ômega 3 EPA/DHA 2-4g/dia: -trigs, -inflamação
  4. Vitamina E 800 UI/dia (se NASH confirmado): PIVENS trial
  5. GlyNAC (glicina 10g + NAC 10g): precursor glutationa
  6. Metformin off-label se IR presente
  7. GLP-1 se obesidade
  8. Semaglutide resmetirom para NASH: Phase 3

### GlyNAC protocol — detalhado (Baylor 2022)
Estudo piloto Sekhar Lab em idosos 24 semanas.
Componentes:
  Glicina: 200mg/kg/dia (150g/75kg = ~10g 2x/dia)
  N-acetilcisteína: 200mg/kg/dia (~10g 2x/dia)
Total: ~20g/dia de cada, dividido em 2 doses.
Resultados: restauração glutationa, -oxidative stress, +mitochondrial
function, +insulin sensitivity, -ALT/AST ~25%.
Cautelas: NAC em dose alta pode causar GI + cheiro sulfur.
Começar mais baixo (2-5g cada) e escalar.

### NAC — outras indicações
APAP overdose: padrão terapêutico
PCOS: -androgens
Mental health: OCD, trichotillomania, adição
Respiratório: mucolítico
Dose comum: 600-1800mg/dia

### Milk thistle (silimarina)
Efeito hepatoprotetor em estudos mistos.
Dose: 140-420mg/dia (standardizado 80% silymarin).
NÃO substitui intervenção de causa.

### Colina
Deficiência causa NAFLD em modelos animais.
Fontes: ovos gema (125mg/ovo), carne, soja.
Suplementar alpha-GPC 300-600mg se dieta pobre.

### Cirrose / insuficiência hepática — red flags
Plaquetas < 150k, albumina < 3.5, INR > 1.2, bilirrubina > 2.
Esses sinais = investigação imediata com hepatologista.
`,
  },

  // ========================================================
  // THYROID
  // ========================================================
  {
    id: "thyroid_deep",
    keywords: ["tsh", "tireoide", "thyroid", "t4", "t3", "levotiroxina", "levothyroxine", "armour", "hashimoto", "hipotireoid", "rt3", "cytomel", "synthroid", "anti-tpo", "graves"],
    priority: 1,
    content: `
## Deep dive — THYROID FUNCTION

### Interpretação TSH funcional (não só standard)
TSH standard ranges: 0.4-4.5 μIU/mL.
Ranges funcionais biohacking (Peter Attia, Ted Naiman):
  < 0.4: hipertireoid ou supressão Rx
  0.4-2.5: ótimo funcional
  2.5-4.0: watch — se T4 livre < 1.2 + sintomas = subclinical hypothyroid
  > 4.0: hipotireoid

### T4 total vs T4 livre
T4 livre é biologicamente ativa. Alvo funcional: 1.2-1.5 ng/dL.
T4 alto + sintomas hipo: conversão T4→T3 prejudicada.

### T3 reverso (rT3)
Metabólito inativo. T3 normal vira rT3 em:
  Jejum prolongado / caloric restriction severa
  Stress crônico / cortisol alto
  Doença crônica
  Hepatopatia
Ratio T3/rT3 < 20: conversão prejudicada.
Alvo rT3: < 15 ng/dL.

### Conversão T4→T3 — otimização
Cofatores: selênio (200μg/dia), zinco, ferro (ferritina > 50),
tirosina, iodo adequado (mas não excesso — pode piorar Hashimoto).
Prejudicam: estresse crônico, jejum extremo, álcool, fluoreto.

### Hashimoto
Anti-TPO > 35 ou anti-TG > 40 positivos = autoimune.
50-70% dos hipotireoidismos. Progressão lenta.
Intervenções (evidência variada):
  Dieta anti-inflamatória (auto-immune protocol)
  Vitamina D > 60 ng/mL
  LDN (low-dose naltrexone) 1.5-4.5mg: reduz autoimune
  Selênio 200μg: reduz anti-TPO em alguns estudos
  Gluten-free em sensíveis

### Levothyroxine (T4 sintética)
Padrão ouro para reposição. Dose: 1.6μg/kg/dia.
Tomar em jejum, aguardar 30-60min. Separar de ferro/cálcio 4h.
Alvo: TSH 0.5-2.0, T4 livre meio do range.

### T3 (Cytomel) / Armour thyroid
T3 adicionada ou natural desiccated thyroid.
Usado se T4 sozinho não converte bem (sintomas persistem com
TSH normal). Armour = 38μg T4 + 9μg T3 por grain (60mg).
Bryan: Armour 60mg + levo 100μg.

### Subclinical hypothyroid — tratar ou não?
Debate clínico. Considerar tratamento se:
  Sintomas (fadiga, peso, frio, constipação)
  Anti-TPO positivo
  TSH > 7
  Gravidez / tentando engravidar
  LDL elevado correlato
Antes de medicar: otimizar sono, ferritina, selênio, zinco,
vit D, reduzir stress.
`,
  },

  // ========================================================
  // SAUNA, HEAT THERAPY
  // ========================================================
  {
    id: "sauna_deep",
    keywords: ["sauna", "hsp", "heat shock", "finland", "laukkanen", "cardio", "prolactin", "enos", "infrared", "iv", "hse"],
    priority: 2,
    content: `
## Deep dive — SAUNA & HEAT THERAPY

### Estudos finlandeses (Laukkanen, University of Eastern Finland)
JAMA Internal Medicine 2015 (2.315 homens, 20 anos follow-up):
  1 sessão/semana (ref): baseline
  2-3 sessões/sem: -22% mortalidade sudden cardiac
  4-7 sessões/sem: -63% mortalidade sudden cardiac, -40% total CV
  20+ min vs < 11min: dose-response clara

Outros estudos Laukkanen:
  -46% risco demência (4-7x/sem vs 1x)
  -66% risco Alzheimer
  -41% risco hipertensão
  -77% risco pneumonia

### Mecanismo HSP70/HSP90
Heat shock response ativada a ~38.5-39°C core temp.
HSPs funcionam como chaperones moleculares:
  Reparo proteico em dobramento incorreto
  Autophagy induction
  Proteção neuronal contra misfolding (Alzheimer/Parkinson relation)
  Anti-inflammatory via NF-κB modulação

### Prolactin spike
+140% em session única. Persiste 1-2h.
Função: +reparo muscular, +mood (receptores D2).
Não é testosterone-suppressive em dose fisiológica.

### eNOS (endothelial nitric oxide synthase)
Vasodilatação via NO → -pressão arterial sistólica 5-10 mmHg.
Mecanismo principal pela qual sauna reduz CV mortality.

### Fertility — protocolo Bryan (importante)
Protocolo SEM proteção: -sperm count 20-30% em 2-3 sem.
Protocolo Bryan COM proteção: +57% total motile sperm após 27 sessions.
Proteção: ice pack + cotton boxers + shorts placement.

### Infrared sauna vs tradicional
Tradicional (finlandesa, dry 80-100°C): mais evidência
Infrared (40-60°C): menor stress cardiovascular, alguns benefícios
  antioxidantes específicos, conforto maior
Studies mostram efeitos similares em vários endpoints.

### Contraindicações
Cardiopatia instável, desidratação severa, primeiro trimestre
gravidez, intoxicação aguda.
Pós-treino pesado SEM reposição eletrolítica: risco hipotensão.

### Protocolo Blueprint detalhado
20min @ 93°C dry sauna
Hidratação: 1L água mineralizada pós (magnésio, sódio, potássio)
Ice pack testicular em session > 15min
Frequência: diário (7x/sem)
Timing: pós-treino (recovery) ou 2-3h pré-sono
`,
  },

  // ========================================================
  // HBOT
  // ========================================================
  {
    id: "hbot_deep",
    keywords: ["hbot", "hiperb", "hyperbar", "oxigênio", "oxygen", "pressure", "pO2", "vegf", "telomere", "hachmo", "câmara", "chamber"],
    priority: 2,
    content: `
## Deep dive — HBOT (Hyperbaric Oxygen Therapy)

### Mecanismo fisiológico
Pressão 1.5-2.4 ATA (atmospheric absolute) com 100% O2.
pO2 arterial sobe de ~100 mmHg (normal) para ~1.500-2.000 mmHg.
Oxigênio dissolvido no plasma triplica (normalmente transporte é
só via hemoglobina).
Tecidos com circulação ruim recebem O2 que antes não chegava.

### Estudo Hachmo 2020 (Aviv Clinics, Shai Efrati)
35 adultos saudáveis 64+, 60 sessions 90min 5x/sem.
Resultados (vs baseline):
  Telomere length: +20-38% em T cells (age reversal biomarker)
  Senescent T cells: -10-37% (diferentes subtipos)
  Cognitive function: +improved
  Skin health: improved

### Blueprint data (Bryan Johnson, 60 sessions)
  VEGF: +300%
  hsCRP: indetectável
  pTAU-217 (Alzheimer marker): -28.6%
  n-Butyrate: +290%
  Vitamina D: +235% (sem mudar dose — mecanismo indireto)
  Telomere length: +2.6% leucócitos

### Protocolos por indicação
Anti-aging/longevity: 60 sessions @ 2 ATA, 90min, 5x/sem
Recovery esportivo: 10-20 sessions @ 1.5-2 ATA
Neurológico (pós-AVC, TBI): 40-80 sessions @ 1.5-2 ATA
Wound healing: FDA approved @ 2-2.4 ATA
Fibromialgia: 40 sessions @ 2 ATA

### Sinergias
+ Sauna ANTES: vasodilatação prévia maximiza O2 delivery
+ Cardio: induz VEGF que HBOT amplifica
+ NAD+ precursors (NR/NMN): amplifica mitochondrial response
+ Cold exposure DEPOIS: hormesis combinada

### ROS paradox — dose response
HBOT excessivo (diário, alta pressão) pode EXCEDER capacidade
antioxidante → ROS damage.
5x/sem é ótimo; daily pode ser tóxico mitocondrialmente.
Ciclos (ex: 60 sessions on, 60 off) seguem evidência animal.

### Contraindicações absolutas
Pneumotórax não tratado (expansion trauma)
Doxorubicin / bleomycin (pulmonary toxicity)
Congestão sinus/ouvido agudo (barotrauma)
Pacemaker não-MRI compatible (checar spec)

### Efeitos colaterais comuns
Barotrauma timpânico (3-5% — descer devagar ajuda)
Miopia reversível após 20+ sessões (reverte 4-8 sem após parar)
Fatigue pós-sessão primeiras semanas
Raramente: seizure por hiperóxia (< 0.01%)

### Mild HBOT (home units, 1.3 ATA ar ambiente)
Evidência MUITO menor que hard-shell 2 ATA.
Popular por acessibilidade mas eficácia debatível.
Marketing > ciência em muitos casos.
`,
  },

  // ========================================================
  // RED LIGHT / PHOTOBIOMODULATION
  // ========================================================
  {
    id: "pbm_deep",
    keywords: ["luz", "light", "red", "vermelha", "nir", "infrared", "photobio", "pbm", "660", "850", "arndt", "citocromo", "cytochrome"],
    priority: 2,
    content: `
## Deep dive — PHOTOBIOMODULATION (Red/NIR Light)

### Mecanismo molecular
Luz 600-1100nm atravessa pele, atinge citocromo c oxidase
(complexo IV cadeia respiratória mitocondrial). Dissocia NO
inibitório → +atividade enzimática → +ATP, +NO local (vasodilatação),
+ROS sinalização (hormesis).

### Wavelengths específicos
630-660nm (visível vermelho): penetração superficial, pele, cicatrização
810-830nm: profundidade média, músculos, cérebro
850nm (NIR): profundidade ótima, penetra 2-5cm
1064nm: profundidade máxima, specific para bone/deep tissue

Panels múltiplos (ex: Joovv, Mito Red): combinam 660+850nm.

### Dose-response Arndt-Schultz (biphasic)
Muito baixa dose: sem efeito
Dose ótima: máximo benefício (~5-60 J/cm²)
Dose alta: inhibição (> 150 J/cm²)

Duração típica:
  Face/pele: 5-10min a 10-20cm
  Corpo todo: 10-20min a 30cm
  Transcranial: 5-15min
  Joelho/articulação: 10-15min a 5-10cm

### Resultados biomarker-based
ATP celular: +8-20% em tecido irradiado
Colágeno tipo I: +em biópsias pele após 8-12 sem daily
Testosterona (tópica escrotal): +200% livre em 3 estudos pequenos
Pain reduction: RCTs robustas em arthritis, chronic pain
Skin age: Bryan revisou 9 anos com PBM + peptides

### Cognitive/brain applications
Transcranial PBM (testa/têmporas):
  Cognitive performance: +melhora focus em RCTs pequenos
  TBI recovery: emerging evidence
  Alzheimer/Parkinson: Phase 2 trials
  Mood/depression: effect size moderate

### Timing ótimo
Manhã (após nascer sol): refinance circadian rhythm
Pré-treino: +performance via ATP muscular
Pós-treino: +recovery, -DOMS
2-4h pré-sono: -oxidative stress sistêmico

### Timing a EVITAR
Imediatamente antes de dormir: pode mascarar melatonin onset
Sob maquiagem ou protetor solar: bloqueia penetração
Após Retin-A aplicação recente: irritação

### Red light helmet (655nm)
Bryan usa 6min daily para folículos capilares.
Sinergia com minoxidil tópico + peptide serum (EGF, copper tripeptide).
Evidência: LLLT Study Gheisari 2021 +25% hair count 16 weeks.

### Full-body panel protocols
Mito Red, Joovv, PlatinumLED: mais comuns.
Protocolo comum: 10-20min daily, 15-30cm distância.
Partes a rodar: peito, costas, pernas frente/trás (separado).
`,
  },

  // ========================================================
  // PEPTIDES (biohacking pantheon)
  // ========================================================
  {
    id: "peptides_deep",
    keywords: ["peptide", "peptídeo", "bpc", "bpc-157", "tb-500", "tb500", "cjc", "ipamorelin", "ghrp", "epitalon", "epithalamin", "mots-c", "semax", "selank", "dsip", "nad+", "mk-677", "mk677", "ibutamoren", "ghrh", "ghk-cu", "ghk", "sermorelin", "tesofensine"],
    priority: 2,
    content: `
## Deep dive — BIOHACKING PEPTIDES

ATENÇÃO: uso off-label, muitos pouco estudados em humanos,
maioria requer injeção subcutânea. Evidência rigorosa escassa para
a maioria. Recomendar sempre avaliação médica.

### Healing / tissue repair

**BPC-157 (Body Protective Compound)**
Origem: fragmento proteína gástrica protetora.
Dose: 250-500μg 1-2x/dia SC local ou oral (evidência oral limitada).
Mecanismo: +angiogênese local, modula NO pathway, +TGF-β.
Uses: tendinopatia, IBD, healing acelerado pós-lesão.
Evidência: animais robusta, humanos limited (RCTs pequenos).
Segurança: perfil excelente em animais, uso humano longo-termo desconhecido.

**TB-500 (Thymosin Beta-4)**
Dose: 2-5mg SC 2x/sem por 4-6 semanas, depois manutenção 2mg/sem.
Mecanismo: +actin polymerization, +cell migration, +angiogenesis.
Uses: lesões crônicas, cardiac recovery pós-MI, wound healing.
Combinação BPC-157 + TB-500: sinergia clássica em sports medicine.

### Growth hormone axis

**CJC-1295 + Ipamorelin** (combinação gold)
CJC-1295 (GHRH analog, DAC ou no DAC):
  No-DAC: 100μg SC antes dormir (pulsátil natural)
  Com-DAC: 1-2mg/sem (steady state)
Ipamorelin (GHRP, selective): 100-300μg SC com CJC.
Sinergia: +growth hormone pulsátil sem aumentar cortisol ou fome
(como MK-677 faz).
Biomarker: IGF-1 alvo 250-300 ng/mL.

**Sermorelin** (GHRH 29-aa)
Mais antigo, menos potente que CJC.
Dose: 200-500μg SC noite.

**MK-677 / Ibutamoren** (oral GH secretagogue, não peptídeo estrito)
Dose: 10-25mg/dia oral.
+GH + IGF-1 + fome + água retention + joint comfort.
Contra: insulin resistance moderate, fome significativa.

### Longevity / anti-aging specific

**Epitalon (epithalamin)**
10mg SC daily por 10-20 dias, 2-3x/ano.
Mecanismo: +telomerase activity, sincroniza pineal.
Evidência: estudos russos de Khavinson, longevity animals robusta.
Humano: estudos pequenos, replicação limitada.

**MOTS-c** (mitochondrial peptide)
Mecanismo: +mitophagy, +metabolic flexibility.
Dose: 5-10mg SC 2-3x/sem.
Muito novo em humanos — mais evidência animal.

**Thymalin / Thymogen**
Immune modulators, pineal extracts.
Popular em Khavinson protocols Rússia.
Evidência ocidental escassa.

### Cognitive

**Semax**
Nootropic russo (ACTH 4-10 analog fragment).
Dose: 1-5mg intranasal.
Uses: ischemic stroke (aprovado Rússia), ADHD, cognition.
Efeitos agudos: +focus, +memory.

**Selank**
Similar Semax, más anxiolytic profile.
Dose: 1-3mg intranasal.
GABAergic via tuftsin-derived action.

### Skin / hair / cosmetic

**GHK-Cu (Copper Peptide)**
Tripeptide glicina-histidina-lisina + Cu.
Dose tópica: soro 0.1-2% face/couro cabeludo.
Injetável: 10-50mg intralesional.
Uses: wound healing, anti-aging skin, hair growth (+in vitro).

**Thymosin Alpha-1 (Tα1)**
Immune modulator. Off-label longevity.
Dose: 1.6mg SC 2x/sem ou 0.4mg daily.
Aprovado Europa para adjuvante hepatite B/C, câncer immunotherapy.

### Sexual function

**PT-141 (Bremelanotide / Vyleesi)**
Melanocortin agonist → +desire, +arousal.
Dose: 0.75-1.75mg SC PRN (30-60min antes).
FDA approved para HSDD feminino. Off-label masculino.

**Kisspeptin-10**
HPG axis regulator. +endogenous LH/FSH/T.
Research pharmacology — Phase 2 trials.

### Pitfalls / red flags
- Research chemicals USP/não-farmacêuticas: pureza variável
- Sourcing crítico: muitos vendors não validados
- Interactions com AAS/estimulantes não estudados
- Grupos hormonais-sensitive: thyroid, adrenal, gonadal
- Autoimmune history: evitar imunostimulantes
- Câncer history: peptides GH-axis CONTRAINDICADOS
`,
  },

  // ========================================================
  // NAD+ / SIRTUINS
  // ========================================================
  {
    id: "nad_sirtuins_deep",
    keywords: ["nad", "nadh", "sirtuin", "sirt1", "nr", "nmn", "nicotinamide", "riboside", "mononucleotide", "resveratrol", "sinclair", "pterostilbene", "niacin", "niagen", "basis", "nrf2"],
    priority: 2,
    content: `
## Deep dive — NAD+ / SIRTUINS / CELL ENERGY

### NAD+ biology
Nicotinamide adenine dinucleotide — cofator em 500+ enzimas.
Essencial para:
  Glycolysis, Krebs cycle (ATP production)
  Sirtuins (SIRT1-7) — longevity enzymes
  PARP1 — DNA repair (consume NAD+ massively in damage)
  CD38 — immune cell signaling (main consumer after 50)

### Declínio com idade
NAD+ cai ~50% entre 40-60 anos.
Drivers do declínio:
  CD38 upregulation (inflammaging)
  PARP1 activation (DNA damage accumulation)
  Reduced biosynthesis
  Increased consumption

### Sirtuins — funções por isoforma
SIRT1 (núcleo): metabolic regulator, autophagy, DNA repair
SIRT2 (citosol): cell cycle, insulin sensitivity
SIRT3 (mitocôndria): mitochondrial biogenesis, oxidative stress
SIRT6 (núcleo): telomere maintenance, genomic stability
SIRT7 (núcleo): rRNA transcription

Sirtuins precisam de NAD+ para deacetylation. Baixo NAD+ = sirtuins
inativas = aging acelerado (David Sinclair hypothesis).

### NR (Nicotinamide Riboside) — Tru Niagen, Basis
Precursor NAD+ estável oral. Convertido via NRK1 → NMN → NAD+.
Dose: 300-600mg/dia manhã com comida.
+NAD+ sangue 40-50% em 2 semanas.
Estudos humanos: safety excelente, clinical endpoints mistos.
NR pode piorar triglicérides 20-40% em alguns usuários (watch).

### NMN (Nicotinamide Mononucleotide)
Dose: 500-1000mg/dia (Sinclair lab sublingual 1g).
Absorção debatida — Sinclair argumenta sublingual > oral.
+NAD+ similar a NR em estudos comparativos.
Regulatório: FDA retirou status "supplement" em 2022 (pending drug
classification), mas ainda vendido.

### Niacin (ácido nicotínico)
Dose: 500-3000mg/dia para lipídeos (-LDL, +HDL, -Lp(a) ~25%).
Flush reaction (prostaglandin-mediated): pode ser severa.
Sustained-release forms: LESS flush mas +hepatotoxicity.
NÃO é NAD+ precursor ótimo (rota diferente).

### NAD+ IV
Dose: 500-1000mg IV over 2-4h.
+NAD+ imediato, pico dramático, mas curto (<48h).
Uso: addiction recovery, acute energy boost.
Caro ($300-800/session) e cansativo.

### Resveratrol — ressalvas
Sirtuin activator clássico (David Sinclair fame).
Bioavailability oral péssima (< 1%).
Dose comum: 250-1000mg/dia trans-resveratrol micronized.
Estudos humanos: longevity endpoints decepcionantes pós-hype 2006.
Pterostilbene: primo com bioavailability melhor.

### Fisetin
Flavonoide senolytic (Mayo Clinic studies).
Dose: 20mg/kg 2 dias consecutivos 1x/mês.
Para um homem 75kg: 1500mg 2 dias seguidos.
Seletivamente mata senescent cells.

### Quercetin + Dasatinib (D+Q protocol)
Senolytic protocol clássico (Unity Biotech, Mayo Clinic).
Dasatinib: 100mg (Rx, câncer med off-label)
Quercetin: 1000mg
Tomar juntos 2 dias consecutivos, 1-2x/mês.
Evidência: ensaios piloto humanos, resultados interessantes.
NÃO fazer sem médico (dasatinib tem side effects sérios).
`,
  },

  // ========================================================
  // SLEEP DEEP
  // ========================================================
  {
    id: "sleep_deep",
    keywords: ["sono", "sleep", "melatonina", "melatonin", "circadian", "circadiano", "rem", "deep", "profundo", "oura", "whoop", "rhr", "hrv", "cortisol", "magnesium", "glycine", "apigenin", "ashwagandha", "theanine", "insomnia", "insônia", "blue light"],
    priority: 1,
    content: `
## Deep dive — SLEEP OPTIMIZATION

### Arquitetura normal do sono
Ciclos 90min, 4-5/noite.
Fases:
  N1 (5%): transição
  N2 (45-55%): maioria do sono
  N3 (15-25%): deep sleep, memória declarativa, growth hormone
  REM (20-25%): memória procedural, processamento emocional

Blueprint target (Bryan):
  Duration: 8h+ in bed, 7.5h+ asleep
  Efficiency: > 95%
  Deep sleep: 90+ min
  REM: 90+ min

### Biomarkers do sono
HRV: baseline individual. Queda > 15% = recovery deficit.
RHR: queda 5-10 bpm abaixo daytime = sono profundo adequado.
Respiratory rate: elevação 1+ = ilness onset.
Wake after sleep onset (WASO): < 20min ideal.
Sleep onset latency: < 15min ideal (Bryan: 3min).

### Tracking devices ranking
Oura Ring gen 3: best overall (HRV, temp, sleep stages)
Whoop 4.0: +strain/recovery metrics, subscription
Apple Watch Ultra: good HRV, sleep metrics
Eight Sleep Pod: +temperature control the mattress
8Sleep app (alone): basic tracking

### Cortisol awakening response (CAR)
+50-60% cortisol nos primeiros 30min acordado. CRÍTICO para
hormonal cascade diária.
Destruído por: checkar celular ao acordar, dormir até tarde irregular,
stress manhã.
Otimizar: luz natural 10-15min nos primeiros 30min.

### Sleep pressure (adenosine)
Cafeína bloqueia receptores A1/A2A → mascara sleep pressure.
Meia-vida: 5-6h. Cortar 8-10h antes de dormir (Blueprint: 14h).
Adenosine acumula com wakefulness; sono dissipate.
"Caffeine nap" 100-200mg + 20min nap: funciona porque café ação
começa ao acordar.

### Temperature biology
Core temp cai 0.5-1°C durante sono.
Quarto ideal: 18-21°C.
Sauna 2-3h antes dormir: pele esquenta, +contraste com quarto frio,
triggers melatonin.
Cooled mattress (Eight Sleep, ChiliPad): +deep sleep 15-25%.

### Melatonin — usar ou não?
Dose farmacológica (3-10mg): OVERDOSE fisiológica (natural é 0.3mg).
Pode causar: morning grogginess, weird dreams, desregular ritmo.
Dose fisiológica (0.3-0.5mg): mais próxima do natural.
Time-release: melhor para sustaining sleep.
Uso principal: jet lag, shift work. Não daily idealmente.
Biomarker: DLMO (dim light melatonin onset) — salivary tests.

### Magnésio para sono
Glicinato ou Malato: melhor absorção + GABA pathway.
Dose: 400-600mg à noite.
Threonate (Neuro-Mag): atravessa BBB, +cognição/sono deep.
Citrate: -laxative effect maior, economy.

### Glicina (glycine)
3g antes de dormir: +deep sleep, -core temp.
Yamadera 2007: melhora sleep quality subjetiva.

### Apigenin
Flavonoide (camomila). 50mg pré-sono.
Huberman recomenda. -cortisol via CYP17.
Sem robust RCTs em humanos.

### Ashwagandha KSM-66
300-600mg à noite (ou manhã).
-Cortisol 14-28%.
Pode piorar hipertireoidismo.

### L-theanine
100-200mg.
GABAergic, ansiolítico sem sedation.
Combina bem com cafeína para focus daytime.

### DSIP (Delta Sleep-Inducing Peptide)
Injetável 100μg subcutâneo pré-sono.
Evidência humana escassa, hype > ciência.

### Bedtime red flags
Gin/drinks pré-sono: -30% REM, -deep sleep, +3 wakings
Refeição grande < 3h: +reflux, -deep, +RHR
Celular na cama: +cortisol, -melatonin via blue light
Work/emails após 21h: +arousal cognitivo 60-90min

### Sleep devices avançados
Muse headband: EEG feedback meditation
Alpha-Stim CES: Cranial Electrotherapy Stimulation
Apollo Neuro: vibração vagal nerve stim
Somavedic: pseudoscience (skeptical marker)
`,
  },

  // ========================================================
  // HRV / RHR / RECOVERY
  // ========================================================
  {
    id: "hrv_deep",
    keywords: ["hrv", "heart rate variability", "variabilidade", "rhr", "resting heart", "autonomic", "autônomo", "parasympathetic", "sympathetic", "vagal", "vagus", "recovery", "overtraining", "whoop", "oura"],
    priority: 2,
    content: `
## Deep dive — HRV & AUTONOMIC NERVOUS SYSTEM

### HRV fundamentals
Heart Rate Variability = variação em milissegundos entre batimentos.
NÃO é sinais vitais (RHR baixo). Reflete ANS balance:
  Parasympathetic (vagal) high → HRV high → recovered
  Sympathetic high → HRV low → stressed

Métricas principais:
  RMSSD (root mean square of successive differences): vagal tone
  SDNN (standard deviation of NN intervals): overall HRV
  HF power (high frequency 0.15-0.4 Hz): vagal
  LF/HF ratio: sympathetic/parasympathetic balance

Baseline individual matters — comparação deve ser SEU baseline,
não normativo populational.

### Drivers HRV alto (bom)
Sleep suficiente (7.5h+)
Cardio Z2 regular
Meditation / breathwork
Cold exposure
Sauna (acute dip, chronic boost)
Alimentação leve
Zero álcool

### Drivers HRV baixo (ruim)
Álcool (acute -40% HRV por 1-2 dias)
Late meal (< 3h antes dormir)
Sleep debt acumulado
Overtraining / illness onset
Inflammation crônica
Stress psicológico
Desidratação

### RHR baixo = saudável? Sim, até um ponto
Atletas elite: 40-50 bpm.
Bryan: ~39 bpm.
RHR < 35 em não-atleta: investigar bradycardia, eletrólitos.
RHR > 80 consistente: inflamação, stress, deconditioning.

Queda RHR em 1-2 meses com treino aeróbico: +5-15 bpm redução
possível em destreinados.

### Vagal tone exercises (vagus nerve hacking)
Gargarejo água 30s várias vezes/dia
Cold exposure face (30-60s face in ice water)
Diaphragmatic breathing (4-7-8, box breathing)
Humming/singing (bora vibração)
Chanting (Om, mantras)
Gargling ice water

### Breathwork protocols
**Box breathing**: 4-4-4-4 sec. Seal operatives.
**4-7-8 (Andrew Weil)**: inhale 4, hold 7, exhale 8. Vagal activation.
**Wim Hof method**: 30-40 deep breaths + breath hold + retention.
**Physiological sigh** (Huberman): double inhale + long exhale.
  Fastest relief agudo stress.
**Resonance breathing** (6 bpm): +HRV imediato.

### Overtraining syndrome
Red flags:
  HRV < -15% baseline por 3+ dias
  RHR elevated 5+ bpm
  Mood changes (irritability, apathy)
  Performance decline
  Sleep disturbance
  Chronic fatigue
  Recurrent colds

Ação: deload 7-14 dias, priorizar sono, alimentação, cardio leve.

### Cold water immersion — HRV specific
Cold face immersion 2min: +HRV acute.
Cold shower finish 30s: +norepinephrine, +HRV chronic.
Ice bath 3-5min @ 10°C: +parasympathetic pós 30min.

### Devices ranking HRV
Oura Ring: medição noturna, curva tempo-dia.
Whoop: continuous, strain metric, recovery score.
Polar H10 chest strap: gold standard accuracy.
Morning readiness: Oura/Whoop algorithms.
HRV4Training app: manual morning check.
Kubios HRV: análise profunda (research-grade).

### Heart Math Coherence (Institute of HeartMath)
Coherent breathing 5-6 bpm + positive emotion focus.
+HRV, +autonomic balance.
Inner Balance device + app.
`,
  },

  // ========================================================
  // MITOCHONDRIA
  // ========================================================
  {
    id: "mito_deep",
    keywords: ["mitocôndria", "mitochondria", "mitochondrial", "atp", "krebs", "electron transport", "oxidative", "ros", "pgc-1", "mitophagy", "urolithin", "mitopure", "fission", "fusion", "complex i", "complex iv", "coenzyme q"],
    priority: 2,
    content: `
## Deep dive — MITOCHONDRIAL HEALTH

### Fisiologia mitocondrial
Geradores de ATP via phosphorylation oxidativa.
Cadeia respiratória (membrana interna):
  Complex I (NADH dehydrogenase) — metformin inibe levemente
  Complex II (succinate dehydrogenase)
  Complex III (cytochrome bc1)
  Complex IV (cytochrome c oxidase) — alvo PBM/red light
  ATP synthase

### ROS como sinalização
Níveis baixos-moderados: +adaptive response (hormesis), +biogenesis
Níveis altos crônicos: damage DNA/proteins/lipids → aging
Antioxidants endógenos: SOD, catalase, glutathione peroxidase
Antioxidants exógenos em excesso: podem BLUNT adaptations
  (ex: Vitamin C/E high dose + treino: -mitochondrial biogenesis)

### Mitochondrial biogenesis
Criação de novas mitocôndrias via PGC-1α (master regulator).
Triggers:
  Cardio Z2 moderate-long duration (60+ min)
  Cold exposure (BAT activation + PGC-1α)
  Caloric restriction / fasting
  Heat stress (sauna)
  Resveratrol + SIRT1 → PGC-1α
  Metformin → AMPK → PGC-1α

### Mitophagy (seleção de mitocôndrias)
Auto-degradação via PINK1/Parkin pathway.
Falhas → accumulation de mitos disfuncionais → aging.
Triggers mitofagia:
  Prolonged fasting (> 24h)
  Cardio Z2 exhaustion
  Urolithin A (Mitopure) 500mg/dia
  Spermidine 1-3mg/dia (wheat germ, natto)
  Rapamycin weekly pulse

### Urolithin A / Mitopure (Amazentis)
Metabolite de ellagic acid (romã, nozes) produzido por bactérias
intestinais em ~40% da população.
Dose: 500mg/dia = equivalente a 6x romãs.
Estudo MOTION 2022: +29% endurance 4-month humans.
Aumenta mitophagy seletivamente.

### Spermidine
Polyamine em wheat germ, natto, aged cheese, mushrooms.
Dose: 1-3mg/dia (supplement) OU food-based.
Longevity markers em modelos animais.
Human data: epidemiological (+longevity), não RCT.

### CoQ10 (Ubiquinol > Ubiquinone em absorption)
Cofator transporte electron Complex III.
Dose: 100-400mg/dia com gordura (lipid-soluble).
Depleted por statins — supplementar obrigatório se estatina.
Idade > 40: produção endógena cai significantly.

### Creatina — mitocondrial
+ATP recycling via creatine phosphate/PCr system.
Dose: 5g/dia monohydrate.
Beneficia: força, cognição, pode retardar mitopatias.
Segurança: mais estudada supplement em sports science.

### Methylene blue (MB)
USP/research: 0.5-4mg/kg oral.
Atalho na cadeia respiratória (bypass Complex I/III damage).
Strong MAOI — evitar com SSRIs, tyramine foods.
Off-label longevity/neuroprotection. NÃO comum.

### PQQ (Pyrroloquinoline quinone)
Cofator mitocondrial. +biogenesis em estudos.
Dose: 10-20mg/dia.
Sinergia com CoQ10.
Evidência humana emergente.

### NMN/NR (covered in NAD+ section)
Amplify mitochondrial function via sirtuins.

### Treino que ativa mitocôndrias
HIIT short: PGC-1α spike agudo
Z2 long: mitochondrial biogenesis crônica sustentada
Resistance training: -PGC-1α agudo, +massa mito pos-adaptation
Combined (polarized training — 80% Z2, 20% HIIT): ótimo.
`,
  },

  // ========================================================
  // EPIGENETIC CLOCKS
  // ========================================================
  {
    id: "epi_clocks_deep",
    keywords: ["epigenetic", "epigenético", "horvath", "hannum", "phenoage", "grimage", "dunedin", "pace", "biological age", "idade biológica", "clock", "methylation", "metilação", "cpg", "trueage", "mygenes"],
    priority: 3,
    content: `
## Deep dive — EPIGENETIC AGING CLOCKS

### Overview
Estimativa de idade biológica via padrões de DNA methylation em
CpG sites específicos. Alguns medem "idade" (cronológica equivalente),
outros medem "velocidade" (DunedinPACE — Belsky 2022).

### Clocks primários

**Horvath (2013)** — Multi-tissue
353 CpGs, funciona em 51 tissues/cell types.
R² ~0.95 com idade cronológica em healthy.
Problema: não captura perfil "frailty" muito bem.

**Hannum (2013)** — Blood-only
71 CpGs. Idade cronológica humana whole blood.
Preciso mas menos mortality-predictive que PhenoAge.

**PhenoAge (Levine 2018)** — Mortality-informed
Construído usando: albumina, creatinina, glucose, CRP, linfócitos,
mean cell volume, red cell distribution width, alkaline phosphatase,
WBC count.
MELHOR predictor mortality que Horvath.

**GrimAge (Lu 2019)** — Mortality + plasma proteins
Construído com smoking pack-years + 7 plasma proteins:
  ADM, B2M, Cystatin C, GDF15, Leptin, PAI-1, TIMP-1.
ATUAL mortality predictor mais forte.
+smoke pack-years mesmo em não-fumantes (captura "exposure age").

**DunedinPACE (Belsky 2022)**
NÃO mede idade — mede VELOCIDADE de aging (ano biológico / ano
cronológico).
Derivado de estudo longitudinal 1972 Dunedin cohort.
Valor:
  < 0.8: aging slow (Bryan: 0.48)
  1.0: normal
  > 1.2: aging fast
Melhor para MONITORAR intervenções curto-termo (3-6 meses) vs
idade estática.

### Comercial tests (ranking)

**TruAge (TruDiagnostic)**: PACE + outros clocks. ~$229.
**MyDNAge**: Horvath-based. ~$299.
**Elysium Index**: várias métricas. ~$499.
**Trellis Health**: full panel + coaching.

### Limitações
Methylation drift ≠ causation aging.
Blood-based clocks podem diferir de tissue-specific.
Variation test-retest: 1-3 anos em mesma amostra.
Reversibilidade: modestly modifiable (studies show -2 to -5 years
em intervenções agressivas 1 ano).

### Intervenções com evidência de "reverter" clocks

**Fitterman et al 2021** (DNA PhenoAge rejuvenation):
  8 semanas diet/lifestyle: -3.23 years PhenoAge.
  Intervention: plant-based, sleep, exercise, meditation,
  polyphenols, DHA, methylation donors.

**Harvard/Levine cross-sectional**:
  Exercício regular: -5 years vs sedentary.
  Mediterranean diet: -3 years.
  Omega-3 index > 8%: -2 years.
  Smoking: +10 years.

**TRIIM trial (Fahy 2019)**:
  Growth hormone + metformin + DHEA 1 year.
  -2.5 years GrimAge. Small sample (9 men).

**Blueprint Bryan**:
  DunedinPACE 0.48. Mais lento human registered.

### Outros age biomarkers

**Glycan age**: AGE product-based. IgG glycans.
**Body composition**: DEXA, skinfolds, InBody.
**VO2max**: baseado normative by age + sex.
**Grip strength**: dynamometer, age/sex norms.
**Stand-from-floor test** (Brito): predictor mortality simples.

### Frequency de testar
Horvath/PhenoAge: anual (não muda rápido o suficiente).
DunedinPACE: 3-6 meses para monitorar interventions.
Combo: anual full panel + trimestral PACE.
`,
  },

  // ========================================================
  // AUTOPHAGY / FASTING
  // ========================================================
  {
    id: "autophagy_deep",
    keywords: ["autofagia", "autophagy", "mitophagy", "jejum", "fasting", "ketogenic", "cetogênica", "keto", "omad", "caloric restriction", "restrição calórica", "cr", "spermidine", "rapamycin", "prolonged fast", "walter longo", "fmd"],
    priority: 2,
    content: `
## Deep dive — AUTOPHAGY & FASTING PROTOCOLS

### Autophagy mechanics
"Self-eating" — degradação e reciclagem de componentes celulares.
Induzida por:
  Nutrient scarcity (mTOR shutdown)
  Oxidative stress
  Hypoxia
  Infection

Molecular switches:
  AMPK ↑ (low energy) → activate autophagy
  mTORC1 ↓ (low amino acids) → activate autophagy
  SIRT1 ↑ → deacetylates ATG proteins → autophagy

Biomarkers:
  LC3-II accumulation (autophagosomes)
  p62/SQSTM1 degradation
  Beclin-1 expression

### Protocolos de jejum por autophagy potency

**12h TRE (time-restricted eating) overnight**:
  Levê autophagy induction.
  Circadian alignment.
  Acessível diário.

**16:8**:
  AMPK modesto, autophagy leve 14-16h em.
  Sustentável. Popular.

**18:6**:
  AMPK mais forte. Autophagy notable.

**20:4 (Warrior Diet)**:
  Autophagy robust.
  Risco: insuficiência calórica/nutricional.

**OMAD (one meal a day)**:
  Autophagy strong.
  Social/practical constraints.

**36-48h**:
  Mitophagy + senescent cell clearance starts.
  Strong AMPK, SIRT1.
  Recomendado 1-2x/mês.

**72-120h (prolonged fast)**:
  Stem cell regeneration (Longo lab).
  +HSCs, +thymus renewal.
  Recomendado 1-3x/ano.
  Risk: electrolyte imbalance, refeeding syndrome.
  Consider medical supervision.

**5-day FMD (Fasting Mimicking Diet)** — Prolon:
  Low-cal (~700-1100 kcal) 5 days/month.
  Simula jejum sem jejuar realmente.
  Studies (Longo): similar benefits prolonged fast.
  5 dias / 4-6x/ano.

### Refeeding
Após 48h+: reintroduzir devagar.
Eletrólitos (Na, K, Mg, P) antes de carbo.
Evitar large carb meal — risk refeeding syndrome.

### Ketogenic diet
Não é fasting, mas mimética em ketosis.
Macros: < 50g carb, 70% fat, 20% protein.
BHB (beta-hydroxybutyrate) como fuel alternativo.
Benefits: seizures, some neurodegenerative diseases, weight loss.
Controverso para atletas força/HIIT.

### Caloric restriction (CR) lifespan data
Primatas (Rhesus monkeys, Wisconsin + NIA):
  Wisconsin: +lifespan
  NIA: no significant extension
Humanos CALERIE trial 2015:
  12% CR 2 anos → -biological aging markers
  Sustentabilidade: BAIXA em humanos.

### Spermidine (endogenous autophagy inducer)
Em alimentos: wheat germ, natto, aged cheese, mushrooms.
Dose supplement: 1-3mg/dia.
Evidence: epidemiological +longevity correlation.
Não suprime mTOR como rapamycin; gentler.

### Rapamycin weekly pulse (anti-aging dosing)
6-8mg/semana (não daily).
Pulse permite mTORC1 inhibition without chronic immunosuppression.
Side effects dose-dependent: mouth sores, hyperlipidemia reversível.

### Exercise que ativa autophagy
Prolonged Z2 (60-90+ min): autophagy significativa.
HIIT: agudo spike mas short-lived.
Combined (PT plus cardio): sinergia.
Fasted training: amplifica effect (mas careful performance).

### Contraindicações jejum
Gravidez, lactação
Underweight (BMI < 18.5)
Eating disorder history
Type 1 diabetes
Specific medications (SU, insulin)
Growing children/teens
Stressful life period (prolonged fast)
`,
  },

  // ========================================================
  // EXERCISE SCIENCE
  // ========================================================
  {
    id: "exercise_deep",
    keywords: ["treino", "training", "exercise", "cardio", "z2", "zona 2", "hiit", "vo2max", "lactate", "lactato", "strength", "força", "hipertrofia", "hypertrophy", "volume", "intensity", "deload", "attia", "inigo", "san millán", "z5", "rpe", "1rm"],
    priority: 1,
    content: `
## Deep dive — EXERCISE SCIENCE FOR LONGEVITY

### Zone 2 cardio (Inigo San Millán, Peter Attia)
Definição: max fat oxidation zone, just below lactate threshold 1.
Lactate blood: 1.7-2.0 mmol/L.
Perception: sustainable, can hold conversation but not sing.
FCmax %: ~60-70% (but depends on individual).
Duration: 45-90min per session.
Frequency: 4x/semana ideal para longevity.

Benefits:
  Mitochondrial biogenesis (PGC-1α)
  +Fat oxidation enzymes
  LDL receptor upregulation → -LDL
  +HDL, -trigs
  +capillary density
  Improved VO2max slow (aerobic base)
  Lactate clearance better

Medição precisa: lactate meter (Edge-Lactate Pro, ~$300) no dedo.
Sem meter: RPE 5-6/10, breathing nasal possible.

### VO2max — longevity biomarker
Norms by age/sex (Cooper Institute):
  Age 20-29 M elite (>90%): >57
  Age 30-39 M elite: >54
  Age 40-49 M elite: >51
  Age 50-59 M elite: >48
Danilo aos 24: VO2max ótimo >55.

Hazard ratios (Mandsager 2018, 122k patients):
  Elite vs Low VO2: HR 5.04 (5x higher death risk).
  Moving from "low" to "below average": -50% mortality.
  Bigger effect than smoking, diabetes, CAD.

How to increase:
  HIIT 4x4 Norwegian protocol: 4x4min @ 90% + 3min rest
  Norwegian double: 2 sessions same day
  Z2 base (aerobic base expansion)
  Progressive overload

### HIIT — Zone 5
Zone 5: > 90% FCmax, > VO2max threshold.
Protocolos:
  4x4min Norwegian: 4 × (4min high + 3min low)
  Tabata: 20s sprint + 10s rest × 8 = 4min
  30/30: 30s all-out + 30s jog × 8-12
Frequency: 1-2x/semana. Mais causa overtraining.

### Strength training — hipertrofia
Evidence-based volume (Schoenfeld 2017):
  Minimum effective: 10 sets/muscle/week
  Optimal: 12-20 sets/muscle/week
  Maximum adaptive: ~25 sets (past that, diminishing)

Intensity (%1RM):
  60-80% → hipertrofia
  80-95% → força/neural
  >95% → força máxima

Proximity to failure:
  RIR (Reps In Reserve) 1-3: sweet spot hypertrophy
  RIR 0 (failure) ocasionalmente

Frequency por grupo:
  Min 2x/semana para crescimento
  3-4x/sem possibly superior (Schoenfeld 2017)

### Protein for muscle
Dose: 1.6-2.2g/kg/dia (Morton 2018 meta-analysis).
Per meal: 0.4g/kg, max ~40g for MPS (muscle protein synthesis).
Timing: distribuído, peri-workout window 0-3h pós.
Leucine threshold: 2.5-3g per meal to max MPS.
Whey 40g = ~4.5g leucine. Ótimo stimulus.

### Creatine — beyond strength
5g/dia monohydrate.
Effects:
  +Strength ~5-15% in 4-6 wks
  +Muscle mass ~1-2 kg
  +Cognition (brain ATP buffer)
  +Recovery, -DOMS
  Possibly neuroprotective (Parkinson trials)
Safety: most studied supplement in sports, 20+ years RCT.

### Deload — when + how
Frequency: every 4-8 weeks OR when HRV indicators bad.
Protocol:
  -50% volume for 5-7 days
  OR -intensity 30% maintaining volume
  Return to baseline strength
Markers it's time:
  Stalled progress 2+ weeks
  HRV chronically low (-10% baseline)
  Sleep quality declining
  Mood changes

### RPE (Rate of Perceived Exertion)
0-10 scale (Borg modifi):
  6-7: moderate, conversation possible
  8-9: hard, limited conversation
  10: max effort

### RIR (Reps In Reserve)
0: failure (can't do 1 more)
1: 1 more possible
3: 3 more possible (too easy for hypertrophy)

### Warm-up & recovery
Dynamic stretching pré (>static).
Foam rolling: evidence modest, helps individuals.
Compression garments: marginal effect.
Ice bath pós-força: BLUNT mTOR up to 4h → use só pós-cardio se goal = hypertrophy.

### Running-specific
Maffetone 180 formula: 180 - age + mods for baseline fitness.
Good Z2 starting point sem meter.
For Danilo (24): ~156 bpm max aerobic.

### Polarized training (Elite athletes)
80% easy (Z1-Z2), 20% hard (Z4-Z5).
Superior than threshold-heavy middle ground.

### Activity > exercise
NEAT (Non-Exercise Activity Thermogenesis):
  Posture, fidgeting, walking around.
  Can account 150-500 kcal/day difference.
Bryan: walking 2-3min every 30min, 10min post-meal walks.
Target: 10k+ steps/day as baseline.
`,
  },

  // ========================================================
  // COLD EXPOSURE
  // ========================================================
  {
    id: "cold_deep",
    keywords: ["frio", "cold", "ice", "gelo", "cryo", "crio", "wim hof", "soberg", "bat", "brown fat", "norepinephrine", "irisin", "cold plunge", "ice bath"],
    priority: 3,
    content: `
## Deep dive — COLD EXPOSURE

### Protocolos
**Cold shower**: 30s-3min @ cold tap end of shower.
**Face immersion**: 2-3min @ 10-15°C water bowl.
**Cold plunge/ice bath**: 3-5min @ 10-15°C.
**Cryo chamber**: 2-3min @ -110°C to -160°C (nitrogen vapor).
**Cold open water swimming**: 10-15min @ <15°C.

### Dose-response (Soberg 2021)
Weekly 11min total "comfort-challenged" cold exposure appears minimum
effective for metabolic benefits.

### Mechanisms
**Norepinephrine surge**: +200-530% (Srámek 2000).
  Persistent 4-6h after.
  Dopamine-like mood lift.
**Brown adipose tissue (BAT) activation**: converts white fat energy.
  Improved glucose handling.
  Irisin release from muscle → browning.
**Cold shock proteins (RBM3, CIRP)**: anti-apoptotic, neuroprotective.
**Vagal tone**: acute activation, +HRV chronic.

### Timing com treino (crítico)
Pós-força: BLOQUEIA mTOR 4-6h → prejudica hipertrofia
(Roberts 2015).
Pós-cardio: OK, possivelmente sinérgico para recovery.
Pré-treino: geralmente não ideal (redução performance).
Fasted cold morning: combo + AMPK.

### Benefits (evidência variada)
**Depression/mood**: single cold shower vs antidepressants meta
  (Shevchuk 2008): +mood curto prazo.
**Immune function**: Buijze 2016 cold shower 30 days
  -29% absenteísmo trabalho por doença.
**Metabolism**: +BAT, +cold-induced thermogenesis 15-30%.
**Sleep**: controversial — too close to bed (4h) pode piorar sono.
**Fat loss**: modest, sustained over months.

### Wim Hof method
Breathing: 30-40 deep breaths + exhale + retention.
Cold exposure: gradual progression.
Benefits debated — epinephrine production robust.
Not recommended for cardiac disease, pregnancy.

### Sauna + cold (contrast therapy)
Finnish tradition: sauna 20min + cold 1-3min + rest × 3-4 cycles.
Enhanced hormesis. Vaso-training.
Japanese onsen + cold spring variants.

### Devices
Morozko Forge: commercial cold plunge ($10k+).
Ice Barrel: accessible ($1k-2k).
Chili Pad (cooling): night bed temperature.
Cryo chambers: franchises (-XO, Restore).

### Safety
Avoid:
  Cardiac disease uncontrolled
  Raynaud's severo
  Uncontrolled hypertension
  Pregnancy (limited data)
  Open wounds
Shock response can trigger cardiac event in susceptible individuals.
Start gradual: cold shower 30s, progress weekly.
`,
  },

  // ========================================================
  // GUT HEALTH
  // ========================================================
  {
    id: "gut_deep",
    keywords: ["microbioma", "microbiome", "gut", "intestino", "prebiótico", "prebiotic", "probiótico", "probiotic", "fiber", "fermented", "fermentado", "sibo", "ibs", "leaky gut", "zonulin", "butyrate", "butirato", "scfa", "akkermansia"],
    priority: 3,
    content: `
## Deep dive — GUT HEALTH & MICROBIOME

### Microbiome basics
~38 trillion bacteria, 1000+ species.
Diversity = longevity marker.
Shaped by: birth mode, diet, antibiotics, environment, stress, sleep.

### Key beneficial bacteria
**Akkermansia muciniphila**: mucin-degrading, correlates inverse
with obesity + IR. Pendulum (Pendulum Akkermansia) supplement.
**Faecalibacterium prausnitzii**: main butyrate producer, anti-inflammatory.
**Bifidobacterium spp**: infants, but adults too. Vit B production.
**Lactobacillus spp**: fermentation products, mood (gut-brain axis).
**Roseburia**: butyrate producer.

### Butyrate (SCFA — short chain fatty acid)
Produto da fermentação fiber por bacterias.
Energia preferida de colonócitos.
Anti-inflammatory via HDAC inhibition.
Pode suppress intestinal cancer pathways.
Produzido por: resistant starch, inulin, pectin (psyllium intencional não recomendado pós-v2, mas vegetables).

### Sources de prebiotic fiber
Jerusalem artichoke, onion, garlic, leek, banana verde, asparagus,
chicory root, oats, legumes, berries.
Blueprint approach: lentilhas + crucíferos + berries diários.

### Fermented foods
Kimchi, sauerkraut, kefir, kombucha, natto, yogurt Greek.
Daily 1-4 Tbsp fermentado: +microbiome diversity (Wastyk 2021
Stanford study).

### Probiotic supplements
Efficacy highly strain-specific:
**Lactobacillus rhamnosus GG**: immune, antibiotic diarrhea prevention.
**Saccharomyces boulardii**: traveler's diarrhea, C. diff.
**Bifidobacterium longum 35624**: IBS (Align).
**VSL#3**: pouchitis, UC.
Generic "multi-strain" pouco evidence.

### Microbiome testing
**Viome**: RNA sequencing, claims functional analysis. Controversial.
**Thorne Gut Health**: comprehensive, professional interpretation.
**ZOE**: blood + gut + food response.
**Genova GI-MAP**: medical-grade, pathogens + markers.

### SIBO (Small Intestinal Bacterial Overgrowth)
Symptoms: bloating, gas, abdominal discomfort, fatigue.
Diagnosis: breath test (lactulose/glucose).
Treatment:
  Rifaximin 550mg 3x/dia × 14d (hydrogen-dominant)
  Rifaximin + neomycin (methane-dominant)
  Elemental diet 2-3 weeks
  Low-FODMAP diet reduction phase

### Leaky gut (intestinal permeability)
Zonulin marker.
Causa by: gluten (in sensitive), NSAIDs, alcohol, stress, dysbiosis.
Test: lactulose/mannitol ratio.
Heal: glutamine 10-20g/dia, collagen, bone broth, L-glutamine,
zinc carnosine, probiotics specific.

### Colostrum
Bovine colostrum 20-30g/dia.
+IgG, lactoferrin, growth factors.
Studies: gut barrier function, immune modulation.
Atleta market: popular for gut + immunity.

### Glutamine
10-20g/dia (split doses).
Primary fuel enterocytes.
Glutamina post-workout: disputed sports benefit.
Gut healing role more established.

### Intestinal permeability markers
Zonulin serum: elevated = leaky gut.
Calprotectin fecal: inflamação intestinal.
LPS (lipopolysaccharide): translocação bacteriana.
SCFA fecal panel: mede produção SCFAs.
`,
  },

  // ========================================================
  // VITAMINS / MINERALS DEEP
  // ========================================================
  {
    id: "micros_deep",
    keywords: ["vitamina", "vitamin", "mineral", "zinco", "zinc", "selênio", "selenium", "iodo", "iodine", "boro", "boron", "manganês", "manganese", "mma", "methylmalonic", "folate", "folato", "metilfolato", "b12", "b6", "b complex", "k2", "d3", "k2", "mg", "magnésio"],
    priority: 2,
    content: `
## Deep dive — VITAMINS & MINERALS

### Vitamin D3 — mais importante single supplement
Função: hormônio esteroide, modula 3000+ genes.
Deficiency: < 20 ng/mL (50% adultos).
Insufficiency: 20-30.
Normal: 30-50.
**Optimal biohacking: 50-80 ng/mL**.
Toxicidade: > 100 (raro).

Doses:
  1000-2000 UI maintenance.
  4000-5000 UI se deficient.
  Up to 10000 UI com monitor.

Co-factors críticos:
  **K2 (MK-7 form)** 90-200μg: direciona Ca para ossos vs artérias.
  **Magnésio**: cofator conversion active D.
  **Boron** 3mg: suporte steroidal axis.

Testing: 25(OH)D3 every 3-6 months.

### Vitamin K2
Ativa osteocalcin (bone) + MGP (artery anti-calcification).
Forms:
  **MK-4**: curta meia-vida, reservado.
  **MK-7 (natto)**: long half-life, preferido.
Dose: 90-200μg/dia com vitamin D.
Blueprint: em Longevity Mix.

### B12 + folate testing inadequacy
B12 serum NORMAL não significa adequado.
**MMA (methylmalonic acid)**: superior marker B12 status.
  < 0.27 nmol/mL: suficiente.
  0.27-0.37: borderline.
  > 0.37: deficient (mesmo com B12 serum normal).

**Homocysteine**: marker combined B12/B6/folate deficiency.
  < 9 μmol/L: ótimo.

MTHFR polymorphism (C677T): affects folate methylation.
Homozygous TT: use **methylfolate** (5-MTHF), não folic acid.
Heterozygous: methyltetrahydrofolate helpful.

Methyl B12: methylcobalamin > cyanocobalamin.
Dose: 1000-5000μg/dia sublingual se deficient.

### Zinc
Cofator 300+ enzymes.
Serum: 70-120 μg/dL.
Ratio Cu:Zn: alvo < 1.2 (Blueprint focus).
Deficiency symptoms: alopecia, taste loss, immune weakness.

Dose: 15-30mg/dia max (mais = Cu depletion).
Forms: glycinate, picolinate > oxide (poor absorption).

### Selenium
Cofator thyroid hormone conversion.
Deficiency: endemic in areas (Finland supplementa national level).
Dose: 100-200μg/dia max.
Brazil nuts 1-2/dia classical source MAS excess > 400μg/dia
toxicidade (diabetes risk, alopecia).
Supplementação: selenomethionine forma preferida.

### Magnesium — forms matter
RBC magnesium > serum (serum é enganoso, só 1% no sangue).
Alvo RBC Mg: > 5.8 mg/dL.

Forms por indicação:
  **Glycinate**: sono, calma, GABA
  **Malate**: energia, fibromialgia
  **Threonate (Neuro-Mag)**: cérebro, cognição
  **Citrate**: laxative efeito + general
  **Oxide**: barato mas BAIXA absorção (20%)

Doses: 200-600mg/dia.
Blueprint: combinação vários forms no Longevity Mix.

### Iodine (não over-supplementar)
Deficiency causa goiter, thyroid problems.
Dose RDA: 150μg.
Biohacking: tricky — excess pode piorar Hashimoto.
Sources: sal iodado (diminuir se excesso), seaweed.
Testing: iodine load test, 24h urine.

### Boron
3-10mg/dia.
+T/DHT ratio masculina ligeira.
+free testosterone em trials.
Suporta bone, joints.

### Calcium
Paradox: supplementar aumenta arterial calcification (Bolland 2010 meta).
Best: from food (greens, sardines, yogurt).
Se supplementar: sempre com K2.
Dose calcium: 500-1000mg/dia max, from food preferred.

### Iron — specific considerations
Ferritin (storage): 30-150 (F pre-meno), 50-200 (M).
Serum iron, TIBC, transferrin saturation.
Oversupplementação: hemochromatosis risk, +LDL oxidation.
Men > 40 rarely need supplement.
Women: cycle-dependent needs.
Form: bisglycinate > sulfate (less GI upset).

### Chromium
GTF chromium (glucose tolerance factor).
Dose: 200-400μg/dia picolinate.
+insulin sensitivity em some trials.
Limited benefit in non-deficient.

### Copper (caution with zinc)
RDA: 900μg.
Zinc excess → Cu deficiency (anemia, neutropenia).
If zinc > 20mg/dia: supplementar 1-2mg Cu.

### Manganese
Cofator SOD2 antioxidant.
Food sources adequate usually.
Excess: neurotoxicity (parkinsonism).

### Vitamin C — RCTs vs biohacking
RDA: 90mg.
Biohacking ranges: 500-2000mg/dia.
High-dose IV (10-50g): alternative oncology, evidence limited.
Interaction: may blunt exercise adaptation (high-dose + training).

### Vitamin E
Mixed tocopherols > alpha only.
Paradox: single alpha-tocopherol depletes gamma.
Dose: 200-400 UI mixed.
PIVENS trial: 800 UI/dia in biopsy-proven NASH = clinical benefit.

### Vitamin A
Retinol activity equivalents.
Blueprint: adequate from food (liver, eggs, leafy greens for beta-carotene).
Excess (> 10,000 UI retinol/dia daily): toxicity.
Beta-carotene: safer (conversion-regulated).
`,
  },

  // ========================================================
  // PROTOCOL STACKING / WEEKLY SCHEDULE
  // ========================================================
  {
    id: "protocol_stacking",
    keywords: ["protocolo", "protocol", "schedule", "stack", "weekly", "semanal", "routine", "rotina", "blueprint", "bryan"],
    priority: 1,
    content: `
## Protocol Stacking — princípios de combinação

### Sinergias clássicas
- **Sauna → HBOT**: vasodilatação prévia amplifica oxygen delivery.
- **Exercise → Sauna**: HSP70 consolidates training adaptation.
- **Cold → Red light**: sequential hormesis sources.
- **Fast + cardio Z2**: AMPK compound + fat oxidation.
- **Fast > 24h + rapamycin weekly**: deeper autophagy than either alone.
- **EVOO + fat-soluble vitamins (A, D, E, K)**: absorção 2-3x.

### Antagonismos / timing conflicts
- **Cold imediato pós-força**: bloqueia mTOR 4-6h → -hipertrofia.
- **HBOT diário high-pressure**: pode exceder antioxidant capacity.
- **High-dose antioxidantes + treino**: blunt mitochondrial adaptation.
- **Cardio intenso + strength mesmo dia**: interference effect (minor).
- **Caffeine + cold plunge <60min antes**: amplifica cortisol.
- **Álcool + rapamycin**: both hepatotoxic — evitar.

### Weekly schedule template (Blueprint-adapted, 7 days)

**Segunda**: Force push (peito, ombro, tríceps) + sauna + HBOT.
**Terça**: Cardio Z2 45-60min + sauna + red light.
**Quarta**: Force pull (costas, bíceps) + sauna + HBOT.
**Quinta**: HIIT 4x4 + light mobility + sauna.
**Sexta**: Force legs + sauna + HBOT.
**Sábado**: Long Z2 60-90min outdoor + sauna.
**Domingo**: Mobility/flexibility + sauna + HBOT (recovery day).

### Periodização recovery (macro)
- Semana 1-3: volume progression.
- Semana 4: deload (50% volume).
- Ciclo meso: 4-8 semanas.
- Ciclo macro: 12-20 semanas + 1-2 week full rest.

### Protocol review cadence
- Daily: log adherence + subjective.
- Weekly: compliance %, HRV trend, sleep trend.
- Monthly: body composition, key metrics review.
- Quarterly: full biomarker panel.
- Annually: DEXA, VO2max, full epigenetic age.

### Priority triage (quando vida fica corrida)
Se só tem 20min:
  1. Sleep quality (wind-down)
  2. 20min Z2 cardio OR 20min força
Se só 60min:
  1. 40min treino + 15-20min sauna
Se só 30min para recovery:
  1. 15min sauna (maior evidência)
  2. 10min red light + breathwork
Pular SEM PERDER muito: HBOT (caro, tempo), cold (opcional).
Não pular: sono, treino base, alimentação, zero álcool.
`,
  },

  // ========================================================
  // INBODY / BODY COMPOSITION DEEP
  // ========================================================
  {
    id: "inbody_analysis",
    keywords: ["inbody", "body composition", "bodycomp", "body_comp", "pbf", "smi", "mm", "muscle mass", "gordura", "massa magra", "visceral", "phase angle", "ecw", "icw", "water", "segmental", "bmr", "tmb", "composição", "bmi", "imc"],
    priority: 1,
    content: `
## Deep dive — INBODY / BODY COMPOSITION INTERPRETATION

### Principais métricas InBody (e ranges ideais homem <30a)
- **PBF (% gordura corporal)**: ideal 10-18% (atleta) · bom 15-20% ·
  aceitável 20-25% · alto >25%. PBF 21,8% = limítrofe — reduzir
  gradual, preservando MM.
- **Massa Muscular (MM)**: >50% do peso (homem). 65 kg MM em 82-83 kg
  total = 78-79%, ótimo.
- **Visceral Fat Area**: <100 cm² ótimo · 100-130 alerta · >130 risco
  cardiometabólico. "Nível visceral" InBody: <10 ideal.
- **SMI (Skeletal Muscle Index)**: MM esquelética/altura². Homem:
  7,0-7,5 normal · 7,5-8,5 atlético · >8,5 superior. SMI 8,3 = atlético.
- **ECW/TBW (water ratio)**: 0,360-0,390 saudável. >0,390 = edema,
  inflamação sistêmica, desequilíbrio Na/K.
- **Phase Angle (graus)**: qualidade membrana celular. Homem <30a:
  >7,0 ótimo · 6,0-7,0 bom · <6,0 alerta (desnutrição/inflamação).
- **BMR**: calorias em repouso. BMR 1.782 + TDEE ~2.600-2.800 (mod
  active) → déficit -300 preservando proteína = -1kg gordura/sem.

### Interpretação de padrões
- **MM alta + PBF alto**: skinny-fat-overmuscled. Priorizar perda
  gradual gordura mantendo proteína 1,8-2,2g/kg + cardio Z2.
- **MM baixa + PBF alto**: sarcopenia-obesidade. Foco em hipertrofia
  + déficit leve + progressão carga + creatina 5g.
- **Visceral alto + PBF OK**: fígado gordo, metabolismo central alto
  risco. Cardio Z2 (mobiliza gordura visceral) + corte carb refinado
  + álcool zero.
- **ECW/TBW >0,390**: inflamação. Investigar sleep, álcool,
  inflamatória alimentar, excesso Na, stress.
- **Segmental imbalance (diferença >10%)**: déficit unilateral ou
  compensação lesional. Unilateral loading.

### InBody vs DEXA
DEXA é gold standard (bone + visceral real). InBody = bioimpedância,
boa para trend relativo mas absoluta menos acurada. Para decisão:
trend InBody semanal + DEXA a cada 4-6 meses.

### Preparo InBody (para acurácia)
- Jejum 3-4h.
- Sem cafeína 2h antes.
- Sem treino 6-12h antes.
- Pós-banheiro (bexiga/intestino).
- Manhã preferível, mesma hora sempre.
- Sem creme/óleo nas mãos/pés.
- Meta variação <200g dia a dia = ruído.

### Alvos Blueprint para compositionf
- PBF 10-15% (homem).
- MM ↑ constante com progressão carga + proteína 1,6-2,2g/kg.
- Visceral <8.
- Phase angle >7.
- Circunferência cintura <90cm (ou <altura/2).
`,
  },

  // ========================================================
  // PROTEIN SYNTHESIS / DIAAS / LEUCINE
  // ========================================================
  {
    id: "protein_synthesis",
    keywords: ["protein", "proteína", "leucine", "leucina", "whey", "caseína", "diaas", "pdcaas", "bcaa", "mps", "muscle protein", "synthesis", "mtor", "aminoacid", "essencial", "eaa"],
    priority: 1,
    content: `
## Deep dive — PROTEIN SYNTHESIS OPTIMIZATION

### MPS (Muscle Protein Synthesis) — drivers
- **Leucina**: ativa mTORC1 via Rag GTPases + Sestrin2. Threshold
  ≈ 2,5-3,0g leucina por refeição para MPS máxima.
- **Total protein per meal**: 0,4g/kg/refeição é ótimo. 83kg = 33g
  por refeição; 40g whey pós-treino = bem dentro.
- **Frequência**: 4-5 refeições/dia com proteína completa.
- **Dose diária**: 1,6-2,2g/kg para hipertrofia (Morton 2018 meta).
  83kg = 130-180g/dia.

### DIAAS (Digestible Indispensable Amino Acid Score)
Substituiu PDCAAS — DIAAS > 100 = proteína completa de alta qualidade.
  - Whey isolate: DIAAS 125
  - Whey concentrate: DIAAS 109
  - Leite integral: DIAAS 114
  - Ovo inteiro: DIAAS 113
  - Carne bovina: DIAAS 112
  - Caseína: DIAAS 117
  - Soja isolada: DIAAS 91
  - Ervilha: DIAAS 82
  - Arroz: DIAAS 60
  - Trigo: DIAAS 43

### Timing
- Pós-treino: 20-40g proteína rápida (whey) dentro de 2h para
  "anabolic window" — evidência atualizada mostra janela ampla
  (24h), mas proximidade maximiza MPS.
- Antes de dormir: 30-40g caseína reduz proteólise noturna.
- Manhã: 40g proteína quebra jejum noturno + estimula MPS matinal
  (jovens podem tolerar jejum; >40a precisam).

### EAAs vs whey vs BCAAs
- EAAs 8-10g: custo/efeito bom em viagem ou fast.
- Whey: melhor custo-efeito geral.
- BCAAs isolados: SEM efeito hipertrófico se proteína total suficiente
  (Wolfe 2017). Marketing.

### Plant-based combining
Leucina baixa em plantas. Para compensar:
- Combinar soja + whey plant-based.
- Ervilha+arroz: DIAAS combinado ~80.
- Suplementar leucina livre 2-3g em refeição plant-only.

### Para Danilo (83kg, alta fome, MM 65,4kg)
- Meta: 1,8g/kg = 150g/dia
- Distribuir: 40g manhã + 30g almoço + 40g pós-treino + 40g jantar
- Whey Bold 40g pós-treino = DIAAS ~109 + leucina ~3,5g = ótimo
`,
  },

  // ========================================================
  // BILE ACIDS / ALT / GGT / LIVER DEEP 2
  // ========================================================
  {
    id: "bile_ggt_deep",
    keywords: ["ggt", "alt", "ast", "bile", "bilirubina", "fosfatase", "alkaline phosphatase", "tudca", "ursodiol", "colestase", "fígado", "liver", "hepatic", "nafld", "nash", "mafld", "glutationa", "glutathione", "nac", "sam-e", "same", "fatty liver", "esteatose"],
    priority: 1,
    content: `
## Deep dive — BILE, GGT, ALT & LIVER FUNCTION

### Hierarchy of liver markers
- **ALT (alanina transaminase)**: hepatócito-específico. Sensitivo
  para dano hepatocelular.
  Ideal <25 U/L homem · Alerta 25-40 · Alto >40
- **AST (aspartato transaminase)**: hepático + muscular + cardíaco.
  Sobe em treino intenso. AST/ALT ratio >2 = alcoólica ou cirrose.
- **GGT (gama-glutamil)**: colestase, álcool, fígado gordo,
  estresse oxidativo. Marcador MAIS SENSITIVO para:
  - álcool (mesmo "social")
  - NAFLD precoce
  - stress oxidativo sistêmico
  Ideal <20 U/L · Alerta 20-40 · Alto >40
- **Alkaline phosphatase**: colestase, ossos. Contexto.
- **Bilirrubina total**: >1,2 investigar Gilbert (benigno) vs
  colestase.

### NAFLD / MAFLD — cascata
Fígado gordo não-alcoólico → esteatohepatite (NASH) → fibrose →
cirrose. Drivers principais:
  1. Resistência insulina + carb refinado + frutose (HFCS)
  2. Álcool (mesmo "dentro do limite")
  3. Sobrepeso visceral
  4. Stress oxidativo não-compensado
  5. Baixa colina, B12, betaína

### GlyNAC protocol (Baylor 2022, Kumar et al)
NAC 600mg 2x/dia + Glicina 10g/dia por 16 semanas em idosos:
- ↑ Glutationa intracelular
- ↓ ALT -24%, ↓ GGT -19%
- ↑ Sensibilidade insulina
- ↓ Dano oxidativo mitocondrial
- ↑ Telomere length ALT+ (marginal)

### Suplementos com evidência hepática
1. **NAC 600-1800mg**: precursor cisteína → glutationa. Tier 1.
2. **Glicina 5-15g**: precursor glutationa + anti-inflamatório.
3. **TUDCA 500-1000mg**: bile acid terciário. Protege hepatócito
   contra stress ER. Tier 1 para colestase leve.
4. **Milk thistle (silimarina) 300-600mg**: antioxidante hepático.
   Tier 2.
5. **Colina 500mg** + Betaína 1,5g: previne NAFLD, metilação.
6. **SAM-e 400-800mg**: metilação + glutationa. Caro.
7. **Vitamina E 400 UI** (PIVENS trial): reduz NASH histológico.

### Lifestyle drivers (ordem de impacto)
1. ZERO álcool (maior intervenção single — GGT cai rápido)
2. Perda peso 5-10% → ALT -30-50%
3. Cardio Z2 180min/sem (mobiliza gordura visceral)
4. Corte frutose líquida e HFCS
5. Café 3-4 xícaras/dia (↓ ALT +GGT +fibrose, Saab 2014)
6. Dieta mediterrânea
7. Sleep ≥7h (NAFLD+ em sleep deprivation)

### Para Danilo
Se ALT/GGT levemente elevados → GlyNAC 16sem, zero álcool (já faz),
café 3x/dia, Z2 cardio 180min. Remedir em 8 semanas.
Alvos: ALT <25, GGT <20.
`,
  },

  // ========================================================
  // VO2MAX / ZONES / NORWEGIAN 4x4
  // ========================================================
  {
    id: "vo2max_zones",
    keywords: ["vo2", "vo2max", "cardio", "zone", "zona 2", "z2", "z5", "hiit", "4x4", "norwegian", "attia", "aerobic", "anaerobic", "threshold", "lactate", "limiar", "aerobico", "anaeróbico", "fc max", "hr max", "mitochondrial"],
    priority: 1,
    content: `
## Deep dive — VO2MAX, ZONES, NORWEGIAN 4x4

### Por que VO2max é o marcador #1 all-cause mortality
Mandsager 2018 (JAMA, n=122k): VO2max é preditor MAIS FORTE de
mortalidade que tabagismo, diabetes ou hipertensão.
  - Low CRF vs elite: risco mortalidade 5x
  - Cada 3,5 mL/kg/min VO2max ≈ +13% sobrevida
Alvo Attia: top 2,5% para sua idade/sexo (= elite).

### Ranges VO2max (mL/kg/min) homem 20-29a
- Pobre: <38
- Abaixo média: 38-44
- Média: 44-51
- Acima média: 51-56
- Excelente: 56-60
- Elite (top 2,5%): >60

### Zone training (Attia / Seiler 80/20)
- **Zona 1** (50-60% FCmax): recovery, aquecimento.
- **Zona 2** (60-70% FCmax / fala-mas-com-esforço): BASE aeróbica.
  Driver principal de densidade mitocondrial + biogênese via
  PGC-1α. 180-240min/sem mínimo para efeito.
- **Zona 3** (70-80%): "zona cinza" — compromete recovery sem
  benefício extra. Evitar exceto em protocolo específico.
- **Zona 4** (80-90%): threshold / lactato.
- **Zona 5** (90-100%): VO2max. Estímulo máximo para VO2max +
  eNOS + BDNF.

Distribuição Attia ideal:
  - 80% do volume em Z2
  - 20% em Z5 (1-2 sessões HIIT/sem)

### Norwegian 4x4 (Helgerud 2007)
Protocolo validado para ↑ VO2max em ~10% em 8 semanas:
- Aquecer 10min
- 4x [4min @ 90-95% FCmax, 3min @ 60-70% recovery]
- Desaquecer 5min
- Total 40min
- 1-2x/sem (não mais — compromete base Z2)

### eNOS & cardiovascular
Z2 consistente → endothelial shear stress → ↑ eNOS → ↑ NO →
vasodilatação + ↓ oxidative stress + ↓ BP. Efeito compounding
em 8-12 semanas.

### Como medir VO2max
1. **Lab**: máscara + cicloergômetro/esteira. Gold standard.
2. **Cooper test 12min**: VO2max = (distância_m - 504) / 44,73
3. **Wearable (Garmin/Apple)**: estimativa de batida cardíaca.
   Ok para trend, não para absoluto.
4. **Rockport 1mile walk**: para sedentário.

### FCmax
Fórmula Tanaka 2001: 208 - (0,7 × idade)
Danilo 24a: 208 - 16,8 = 191 bpm
  Z2: 115-134
  Z5: 172-191

### Para Danilo (subir VO2max do baseline)
1. 3x/sem Z2 45-60min (corrida ou bike) = ~180min Z2
2. 1x/sem Norwegian 4x4 @ 172-181 bpm
3. Medir VO2max inicial + 8sem + 16sem
4. Alvo 16 semanas: +8-10% VO2max
`,
  },

  // ========================================================
  // HRV DEEP FRAMEWORK
  // ========================================================
  {
    id: "hrv_framework",
    keywords: ["hrv", "variabilidade", "rmssd", "autonomic", "autonomico", "vagal", "parasympathetic", "parassimpatico", "readiness", "recovery", "oura", "whoop", "garmin", "baseline"],
    priority: 1,
    content: `
## Deep dive — HRV AS DECISION FRAMEWORK

### O que HRV mede
RMSSD = root-mean-square das diferenças sucessivas entre batimentos.
Proxy do tônus parassimpático (vagal). Baixo HRV = stress sistêmico
(físico/mental/inflamatório/sono ruim).

### Ranges (adulto saudável)
- RMSSD <20ms: muito baixo, stress crônico
- RMSSD 20-40ms: baixo
- RMSSD 40-60ms: médio
- RMSSD 60-100ms: bom
- RMSSD >100ms: excelente

⚠️ HRV é MUITO pessoal. Compare com SEU baseline, não com números
absolutos.

### Drivers positivos de HRV
1. Sleep consistente 7-9h
2. Cardio Z2 regular (não HIIT crônico)
3. Respiração 5-6 rpm (breathwork)
4. Sauna (paradoxal: aguda ↓, crônica ↑)
5. Frio (ativação vagal)
6. Meditação
7. Social connection, risadas
8. Dieta anti-inflamatória (ômega 3)

### Drivers negativos de HRV
1. Sono <6h (impacto -30-50% em 1 noite ruim)
2. Álcool (queda de 20-40% por 24-48h)
3. Refeição tardia pesada
4. HIIT/treino intenso no dia anterior (+ carga aguda ok, cronic −)
5. Stress psicológico agudo
6. Doença/inflamação
7. Desidratação
8. Variação forte temperatura

### Decision framework HRV matinal vs baseline
- HRV 90-110% baseline: proceder conforme plano.
- HRV 75-90% baseline: reduzir intensidade 20-30%, manter volume.
- HRV <75% baseline: descanso ativo, Z2 leve, sauna, sono precoce.
- HRV >110% baseline: janela para treino intenso / experimento novo.

### Correlação com biomarcadores
- HRV baixo cronico: ↑ risco CV, ↑ cortisol, ↓ insulin sensitivity.
- HRV alto: ↓ inflamação sistêmica (CRP), ↓ mortalidade.

### Para Danilo
Medir HRV matinal via Oura/Whoop/Polar H10. Tracking:
  - 7d rolling average
  - Flag desvio >15% baseline
  - Correlacionar com: álcool (0 é default), sleep hours, workouts,
    refeição tardia.
`,
  },

  // ========================================================
  // RMR / METABOLIC EFFICIENCY / TDEE
  // ========================================================
  {
    id: "rmr_efficiency",
    keywords: ["bmr", "rmr", "tdee", "calorias", "calorie", "deficit", "superávit", "metabolismo", "metabolic", "nutrient partitioning", "reebsoração", "metabolismo basal"],
    priority: 2,
    content: `
## Deep dive — RMR / TDEE / METABOLIC EFFICIENCY

### Conceitos base
- **BMR/RMR** (basal/resting metabolic rate): calorias em repouso
  total. Mede em câmara calorimétrica ou estima via InBody (próximo
  de BMR com multiplicador).
- **TDEE** (total daily energy expenditure) = BMR + TEF (thermic
  effect food) + NEAT (non-exercise activity) + EAT (exercise).
  - TEF = 10% da ingestão
  - NEAT variação 100-800 kcal/dia (high-swing)
  - EAT = calorias treino + EPOC pós-treino

### Estimativa TDEE para Danilo (BMR 1.782)
Multiplicadores:
  Sedentário × 1,2 = 2.138
  Leve × 1,375 = 2.450
  Moderado × 1,55 = 2.762
  Ativo × 1,725 = 3.074 (treino matinal + Z2 diário + sauna)
TDEE estimado Danilo: ~2.700-2.900 kcal

### Body composition math
- Déficit 500 kcal/dia × 7 = 3.500 kcal ≈ 0,45 kg gordura/sem
- Com 1,6-2,2g/kg proteína + força = preserva MM
- Déficit <20% TDEE evita adaptation metabólica

### Metabolic adaptation (não-mitos)
Déficit agressivo >25% TDEE por >8sem:
  - ↓ leptina → fome ↑↑
  - ↓ T3 → TMB ↓ 5-15%
  - ↓ NEAT subconsciente
  - ↓ testosterona (homem)

### Re-feed / diet break (Bikman, Hall)
A cada 4-6 sem de déficit, semana em manutenção:
  - Restaura leptina
  - Restaura T3
  - Restaura NEAT
  - Melhora aderência psicológica

### Para Danilo (se goal = ↓ PBF preservando MM)
- TDEE alvo ~2.700-2.800 kcal
- Déficit -300-400 kcal/dia (manutenção de MM)
- Proteína 150-180g
- Carb 200-280g (peri-treino)
- Gordura 70-90g (EVOO, ômega 3, abacate)
- Re-feed a cada 6 semanas: 1 semana em manutenção
`,
  },

  // ========================================================
  // FULL BIOMARKER PANELS (what to request)
  // ========================================================
  {
    id: "biomarker_panels_full",
    keywords: ["exame", "panel", "painel", "laboratorio", "laboratorial", "medir", "measurement", "diagnostico", "sangue", "urina", "biomarker", "bloodwork", "labs", "apob", "lp(a)", "hba1c", "homocisteina", "crp", "hscrp", "pcr", "ferritina", "vitamin d"],
    priority: 1,
    content: `
## Deep dive — BIOMARKER PANELS (Blueprint-grade)

### Painel trimestral ESSENCIAL (Blueprint core)
**Lipids (avançado)**:
  - ApoB (mg/dL) — alvo <80, Blueprint <60
  - LDL-C, HDL-C, Triglicerídeos, Colesterol total
  - Lp(a) (medir 1x na vida; se alto, tracking 2x/ano)
  - NMR LipoProfile (sdLDL, particle count)

**Metabolic**:
  - Glicemia jejum (<85)
  - HbA1c (<5,2)
  - Insulina jejum (<6 mUI/L)
  - HOMA-IR (<1,5)
  - Ácido úrico (<5,5)

**Tireoide completa**:
  - TSH (<2,5 alvo Blueprint)
  - T4 livre, T3 livre, rT3
  - Anti-TPO, Anti-Tg (autoimunes)

**Hepatic**:
  - ALT (<25), AST (<25), GGT (<20)
  - Bilirrubina total/direta
  - Albumina, proteínas totais

**Inflamação**:
  - hs-CRP (<1,0 ótimo; <0,5 Blueprint)
  - Homocisteína (<8,0)
  - Ferritina (30-150 homem; >150 alerta inflamação)
  - Interleucina-6 (se disponível)

**Renal**:
  - Creatinina, uréia, TFG
  - Cystatin C (mais preciso que creatinina)
  - Microalbuminúria urinária

**Hormônios (homem)**:
  - Testosterona total + livre + SHBG
  - DHEA-S
  - Estradiol
  - Cortisol matinal (e.g., 8h) + salivar diurno

**Micronutrientes essenciais**:
  - 25-OH Vitamina D (40-60 ng/mL alvo)
  - B12 + Ácido metilmalônico (MMA)
  - Folato
  - Magnésio intracelular (eritrocitário > sérico)
  - Zinco, selênio
  - Ômega-3 index (>8% alvo)
  - Ferritina + saturação transferrina

### Painel semestral adicional
- Colesterol VLDL, remnant cholesterol
- CBC completo com diferencial
- Eletroforese proteína
- Testosterona biodisponível

### Painel anual
- DEXA scan (composição corporal + densidade óssea)
- VO2max (lab)
- Coronary CT calcium score (depende idade/risco)
- Calprotectina fecal (se GI)
- Epigenetic age (DunedinPACE, Horvath, GrimAge)

### Painel avançado/opcional (Blueprint elite)
- Methylation panel (SAM/SAH ratio)
- Oxidative stress (8-OH-dG, F2-isoprostanes)
- Mitochondrial function (lactate/pyruvate, acilcarnitines)
- Hormônios tireoideos completos (T3 reverso, anticorpos)
- IgA sIgA (mucosa GI)
- GI-MAP (microbioma)
- Organic acids (Genova OAT)

### Para Danilo — próximos exames prioritários
Baseado em LDL 162 + TSH 4,8 + ALT/GGT elevados:
  1. **ApoB + Lp(a)** (antes de nova intervenção lipídica)
  2. **T3 livre + T4 livre + rT3 + anti-TPO** (TSH 4,8 =
     subclínico; ver se está indo em direção a Hashimoto)
  3. **Homocisteína + hs-CRP** (inflamação sistêmica)
  4. **Ferritina + vitamina D + B12** (ferritina para fadiga/sono)
  5. **HbA1c + insulina + HOMA-IR** (ALT/GGT pode ser NAFLD precoce)
  6. **NMR LipoProfile** (sdLDL é chave com LDL 162)
  7. **Testosterona livre + SHBG** (baseline aos 24a importa)

### Frequência geral
- Painel base: trimestral (12 semanas cobre ciclos intervenção)
- Completo: anual
- Spot check (LDL, ALT, glicemia): mensal se em intervenção
`,
  },
];

/**
 * Retrieve top N most relevant sections for a given text input.
 * Uses keyword matching + priority ranking.
 * In real RAG you'd use embeddings — this is keyword-based MVP.
 */
export function retrieveSections(queryText, { maxSections = 4 } = {}) {
  const query = (queryText || "").toLowerCase();
  if (!query.trim()) return [];

  const scored = KB_SECTIONS.map((sec) => {
    const matches = sec.keywords.filter((k) => query.includes(k.toLowerCase())).length;
    return {
      section: sec,
      score: matches,
      // Lower priority = higher relevance weight
      priorityBoost: (4 - sec.priority) * 0.5,
    };
  }).filter((s) => s.score > 0);

  // Sort by (match count + priority boost) DESC
  scored.sort((a, b) => (b.score + b.priorityBoost) - (a.score + a.priorityBoost));

  return scored.slice(0, maxSections).map((s) => s.section);
}

/**
 * Get all sections (for debugging or admin).
 */
export function getAllSections() {
  return KB_SECTIONS;
}
