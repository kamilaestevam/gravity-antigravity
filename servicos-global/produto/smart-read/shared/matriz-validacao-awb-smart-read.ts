/**
 * matriz-validacao-awb-smart-read.ts — SSOT Matriz de Validação do AWB / Air Waybill (v1.0)
 *
 * Documento dedicado ao modal aéreo (AWB / MAWB / HAWB, papel ou e-AWB).
 * Pipeline: OCR → Código (determinístico) → Cross-Doc (matrizes invoice S1–S9 e packing list P1–P9) →
 *           API/RAG (anuências, DGR) → LLM Analista → Score + Gates → UI
 *
 * Base normativa geral: RA (Decreto 6.759/2009) arts. 553/725/728 · IN SRF 680/2006 arts. 18, 20, 29, 44/56 ·
 * IN RFB 2.143/2023 (CCT Importação — Modal Aéreo) arts. 40–41 e 46 · Manual CCT Aéreo (XFWB/XFZB/XFHL) ·
 * DL 37/66 art. 107, IV, "e"/"f" · Convenção de Montreal (Decreto 5.910/2006) arts. 4º–11 e 22 ·
 * Resolução IATA 600a/672 · IATA TACT (peso taxável 1:6.000) · IATA DGR · ISO 4217 ·
 * Portaria MAPA 514/2022 + NIMF 15 · IN RFB 2.229/2024 (CNPJ alfanumérico).
 */

export type SecaoMatrizAwb =
  | 'identificacao_formato'
  | 'partes_consignacao'
  | 'voo_rota_prazos'
  | 'carga_volumes'
  | 'pesos_taxavel'
  | 'frete_valores'
  | 'dados_cct_aereo'
  | 'regulatorio_carga_especial'
  | 'legitimidade_risco'

/** Motores da matriz AWB — mesmo conjunto da matriz PL (Cross-Doc cruza com S1–S9 e P1–P9). */
export type MotorValidacaoAwb =
  | 'codigo'
  | 'api'
  | 'llm'
  | 'rag'
  | 'cross_doc'
  | 'codigo_rag'
  | 'cross_doc_rag'
  | 'api_llm'

/**
 * Severidade da regra:
 * - `bloq` — gate: falha rebaixa a classificação final independente do score
 * - `alerta` — pontua no score documental
 * - `info` — registra, não pontua
 * - `cond` — condicional: só roda quando o gatilho existe; ausência = N/A, não penaliza
 * - `null` — agregador (AW9-05 score / AW9-06 classificação), não é regra avaliável
 */
export type SeveridadeMatrizAwb = 'bloq' | 'alerta' | 'info' | 'cond' | null

export type RegraMatrizAwb = {
  id: string
  secao: SecaoMatrizAwb
  item: string
  motor: MotorValidacaoAwb
  severidade: SeveridadeMatrizAwb
  /** Gate condicional — BLOQ apenas quando o gatilho existe (ex.: AW2-05 só em HAWB). */
  gate_condicional?: boolean
  /** Nota técnica para prompt e motor — não exibir direto na UI */
  descricao: string
  /** Texto da tooltip (ícone i) — linguagem do usuário, máx ~90 caracteres */
  tooltip_conferencia: string
  /** Citação normativa que fundamenta a regra */
  base_normativa: string
}

/** Ordem canônica das seções na UI (matriz 1→9). */
export const ORDEM_SECOES_MATRIZ_AWB: readonly SecaoMatrizAwb[] = [
  'identificacao_formato',
  'partes_consignacao',
  'voo_rota_prazos',
  'carga_volumes',
  'pesos_taxavel',
  'frete_valores',
  'dados_cct_aereo',
  'regulatorio_carga_especial',
  'legitimidade_risco',
] as const

export const ROTULO_SECAO_MATRIZ_AWB: Record<SecaoMatrizAwb, string> = {
  identificacao_formato: '1 — Identificação, natureza e formato',
  partes_consignacao: '2 — Partes e consignação',
  voo_rota_prazos: '3 — Voo, rota e prazos CCT-Aéreo',
  carga_volumes: '4 — Carga e volumes',
  pesos_taxavel: '5 — Pesos e peso taxável (IATA)',
  frete_valores: '6 — Frete e valores (aéreo)',
  dados_cct_aereo: '7 — Dados do CCT-Aéreo',
  regulatorio_carga_especial: '8 — Regulatório, anuências e carga especial',
  legitimidade_risco: '9 — Legitimidade e risco aduaneiro',
}

export const ROTULO_SEVERIDADE_MATRIZ_AWB: Record<Exclude<SeveridadeMatrizAwb, null>, string> = {
  bloq: 'BLOQ',
  alerta: 'ALERTA',
  info: 'INFO',
  cond: 'COND',
}

/** Matriz completa — fonte única para documentação, testes e orquestração. */
export const MATRIZ_VALIDACAO_AWB: RegraMatrizAwb[] = [
  // ── Seção 1 — Identificação, natureza e formato ─────────────────────────────
  {
    id: 'AW1-01',
    secao: 'identificacao_formato',
    item: 'Número do AWB',
    motor: 'codigo',
    severidade: 'bloq',
    descricao:
      'Formato IATA: 3 dígitos do prefixo da cia aérea + 8 dígitos do serial, sendo o último o dígito verificador (serial mód. 7). Prefixo deve existir na tabela IATA de companhias',
    tooltip_conferencia: 'Valida o número do AWB no padrão IATA com dígito verificador (mód. 7)',
    base_normativa: 'Resolução IATA 600a; RA art. 553, I',
  },
  {
    id: 'AW1-02',
    secao: 'identificacao_formato',
    item: 'Tipo: Master × House',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Classificar MAWB × HAWB; consolidada exige o par. No CCT o HAWB é identificado pelo conjunto (prefixo MAWB + nº MAWB + nº HAWB)',
    tooltip_conferencia: 'Identifica se é master ou house — consolidada exige o par',
    base_normativa: 'Manual CCT Aéreo (XFWB/XFZB/XFHL)',
  },
  {
    id: 'AW1-03',
    secao: 'identificacao_formato',
    item: 'e-AWB × AWB papel',
    motor: 'llm',
    severidade: 'info',
    descricao:
      'Detectar e-AWB (EAP/EAW) ou AWB físico; o CCT-Aéreo é compatível com e-AWB (troca eletrônica de dados IATA)',
    tooltip_conferencia: 'Identifica se é AWB eletrônico (e-AWB) ou em papel',
    base_normativa: 'Manual CCT Aéreo (padrão IATA e-AWB); Res. IATA 672',
  },
  {
    id: 'AW1-04',
    secao: 'identificacao_formato',
    item: 'Datas: emissão (execution)',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Data de execução (execution date) presente; alertar se futura, emissão < invoice, ou incoerente com a data do voo',
    tooltip_conferencia: 'Valida a data de emissão do AWB e a ordem cronológica com a invoice',
    base_normativa: 'Convenção de Montreal art. 7º; coerência com IN 680/06',
  },
  {
    id: 'AW1-05',
    secao: 'identificacao_formato',
    item: 'AWB duplicado/revisado',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Detectar dois AWBs distintos para o mesmo embarque (reemissão sem cancelamento)',
    tooltip_conferencia: 'Detecta conhecimentos aéreos conflitantes para o mesmo embarque',
    base_normativa: 'RA art. 725; IN 680/06 art. 20',
  },
  {
    id: 'AW1-06',
    secao: 'identificacao_formato',
    item: 'Aeroportos (IATA 3-letter)',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Airport of departure e of destination em código IATA de 3 letras válido (ex.: GRU, MIA); rota (routing) coerente',
    tooltip_conferencia: 'Valida os códigos IATA de aeroporto de origem e destino',
    base_normativa: 'Res. IATA 600a; coerência de rota',
  },

  // ── Seção 2 — Partes e consignação ──────────────────────────────────────────
  {
    id: 'AW2-01',
    secao: 'partes_consignacao',
    item: 'Shipper',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Nome/endereço presentes; comparação semântica com exportador da invoice (S2-05) e do PL (P2-01)',
    tooltip_conferencia: 'Confere o shipper contra o exportador da invoice e do packing list',
    base_normativa: 'RA art. 553; Convenção de Montreal art. 5º',
  },
  {
    id: 'AW2-02',
    secao: 'partes_consignacao',
    item: 'Consignee identificado',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Consignee deve identificar o importador (nome + CNPJ). O AWB não é título de crédito e não admite "to order" (Montreal art. 15, §3) — consignee nominal é obrigatório',
    tooltip_conferencia:
      'Verifica se o consignatário nominal identifica o importador — AWB não é "à ordem"',
    base_normativa: 'Convenção de Montreal art. 15, §3 (AWB não negociável); IN 680/06 art. 29, II',
  },
  {
    id: 'AW2-03',
    secao: 'partes_consignacao',
    item: 'Notify / also notify',
    motor: 'cross_doc',
    severidade: 'info',
    descricao: 'Notify coerente com importador/despachante e com S2-09/P2-04',
    tooltip_conferencia: 'Confere o notify party contra os demais documentos',
    base_normativa: 'Praxe documental; coerência do trio',
  },
  {
    id: 'AW2-04',
    secao: 'partes_consignacao',
    item: 'CNPJ no AWB — máscara',
    motor: 'codigo',
    severidade: 'cond',
    descricao:
      'Quando impresso: 14 posições numérico OU alfanumérico (letras maiúsculas A–Z nas 12 primeiras) + DV Módulo 11 com conversão ASCII−48; DV numérico. CNPJ alfa com data anterior a 31/07/2026 = red flag OCR/fraude',
    tooltip_conferencia:
      'Valida o CNPJ do consignatário (numérico ou alfanumérico) quando presente',
    base_normativa: 'IN RFB 2.229/2024 (vigência 31/07/2026); IN RFB 2119/2022',
  },
  {
    id: 'AW2-05',
    secao: 'partes_consignacao',
    item: 'Consignatário no CCT — bloqueio no HAWB',
    motor: 'cross_doc',
    severidade: 'bloq',
    gate_condicional: true,
    descricao:
      'No CCT o consignatário é informado por CNPJ (8 ou 14 dígitos), CPF ou passaporte. Falta de identificação do consignatário no HAWB até a chegada do voo gera bloqueio automático da carga (no MAWB não há bloqueio pela falta)',
    tooltip_conferencia:
      'Alerta que a falta de consignatário no HAWB até a chegada bloqueia a carga no CCT',
    base_normativa: 'Manual CCT Aéreo (identificação do consignatário; bloqueio automático no HAWB)',
  },
  {
    id: 'AW2-06',
    secao: 'partes_consignacao',
    item: 'Estabelecimento consignatário = declarante',
    motor: 'cross_doc',
    severidade: 'bloq',
    gate_condicional: true,
    descricao:
      'Quando informado com 14 posições: apontar o mesmo estabelecimento (raiz + ordem/filial) que registrará a DUIMP; matriz (/0001) × filial trava a vinculação. O CCT aceita 8 dígitos, mas a DUIMP se vincula ao estabelecimento — a divergência aparece no registro',
    tooltip_conferencia:
      'Confere se o estabelecimento consignado é o mesmo que declara — divergência matriz/filial trava a vinculação',
    base_normativa: 'IN 680/06 arts. 15, VI e 44; Dicionário DI/RFB (CNPJ 14 posições)',
  },
  {
    id: 'AW2-07',
    secao: 'partes_consignacao',
    item: 'Agente de carga (IATA / CNPJ)',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Em HAWB: identificar o agente de carga emissor (responsável no CCT por XFZB e XFHL). No aéreo, o agente é sempre CNPJ',
    tooltip_conferencia:
      'Identifica o agente de carga emissor do house (responsável pela associação no CCT)',
    base_normativa: 'Manual CCT Aéreo; Dicionário DI/RFB (agente aéreo = CNPJ)',
  },
  {
    id: 'AW2-08',
    secao: 'partes_consignacao',
    item: 'Issuing carrier / agent',
    motor: 'llm',
    severidade: 'info',
    descricao: 'Companhia emissora e agente IATA emissor identificados ("issued by")',
    tooltip_conferencia: 'Confere a companhia aérea e o agente emissor do AWB',
    base_normativa: 'Res. IATA 600a; Convenção de Montreal art. 7º',
  },

  // ── Seção 3 — Voo, rota e prazos CCT-Aéreo ─────────────────────────────────
  {
    id: 'AW3-01',
    secao: 'voo_rota_prazos',
    item: 'Voo e data (flight/date)',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Nº do voo + data presentes; carrier coerente com o prefixo do AWB (AW1-01)',
    tooltip_conferencia: 'Confere número do voo, data e a companhia contra o prefixo do AWB',
    base_normativa: 'Manual CCT Aéreo; Res. IATA 600a',
  },
  {
    id: 'AW3-02',
    secao: 'voo_rota_prazos',
    item: 'Routing e aeroportos',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      '"To / By first carrier / to / by" coerente com origem-destino (AW1-06) e com o local do Incoterm (S3-01/S3-02)',
    tooltip_conferencia: 'Cruza a rota do AWB com o Incoterm e a rota dos demais documentos',
    base_normativa: 'RA art. 553; coerência geográfica',
  },
  {
    id: 'AW3-03',
    secao: 'voo_rota_prazos',
    item: 'Transbordo / conexão',
    motor: 'llm',
    severidade: 'info',
    descricao:
      'Conexões e transferência entre companhias; TRM (transfer manifest) quando a carga é movida por cia diversa da emitente',
    tooltip_conferencia: 'Detecta conexões e transferência entre companhias aéreas',
    base_normativa: 'IN 2143/2023 art. 58, §7º (transferência por cia diversa — TRM)',
  },
  {
    id: 'AW3-04',
    secao: 'voo_rota_prazos',
    item: 'Coerência aérea do Incoterm',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Incoterm compatível com aéreo: FAS/FOB/CFR/CIF são exclusivos aquaviário — se a invoice traz um desses para carga aérea, é erro de enquadramento; aéreo usa EXW/FCA/CPT/CIP/DAP/DPU/DDP',
    tooltip_conferencia:
      'Detecta Incoterm marítimo (FOB/CIF etc.) usado indevidamente em carga aérea',
    base_normativa:
      'Incoterms® 2020 (FAS/FOB/CFR/CIF exclusivos aquaviário); IN 680/06 art. 15, VI',
  },
  {
    id: 'AW3-05',
    secao: 'voo_rota_prazos',
    item: 'RUC',
    motor: 'codigo',
    severidade: 'cond',
    descricao:
      'RUC no padrão quando citada; no CCT a RUC só é retificável até a primeira recepção/entrega',
    tooltip_conferencia: 'Valida a RUC quando presente e alerta a janela de retificação',
    base_normativa: 'Portal Único (RUC); Manual CCT Aéreo',
  },
  {
    id: 'AW3-06',
    secao: 'voo_rota_prazos',
    item: 'Prazos CCT-Aéreo — exposição',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Com ETA: alertar janelas — 4h antes da chegada (voo longo) ou 30 min após a decolagem na origem (voo curto) para manifestar; 15 min para registrar a chegada; recepção pelo depositário em 12h (prorrogável a 24h). Atraso/retificação extemporânea = R$ 5.000 + bloqueio automático',
    tooltip_conferencia:
      'Alerta as janelas do CCT-Aéreo (4h/30min/15min) e o risco de multa e bloqueio',
    base_normativa: 'IN 2143/2023 arts. 40–41 e 46; DL 37/66 art. 107, IV, "e"/"f"',
  },

  // ── Seção 4 — Carga e volumes ───────────────────────────────────────────────
  {
    id: 'AW4-01',
    secao: 'carga_volumes',
    item: 'Natureza e quantidade da mercadoria',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      '"Nature and quantity of goods" que identifique a mercadoria; rejeitar genéricos absolutos ("consolidated cargo" sem HAWB, "goods")',
    tooltip_conferencia:
      'Exige natureza e quantidade que identifiquem a mercadoria — rejeita genéricos',
    base_normativa: 'Convenção de Montreal art. 5º/7º; IN 680/06 art. 29, II',
  },
  {
    id: 'AW4-02',
    secao: 'carga_volumes',
    item: 'Número de volumes (pieces / RCP)',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: '"No. of pieces RCP" presente; inteiro > 0',
    tooltip_conferencia: 'Confere o número de volumes (pieces) do AWB',
    base_normativa: 'Res. IATA 600a; IN 680/06 art. 29',
  },
  {
    id: 'AW4-03',
    secao: 'carga_volumes',
    item: 'Contagem em dois níveis',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Pieces do AWB vs PL/invoice reconhecendo níveis (pallets ULD × caixas internas) — espelho de P3-07/S7-02',
    tooltip_conferencia:
      'Compara volumes com os demais documentos reconhecendo ULD/pallet vs caixas',
    base_normativa: 'IN 680/06 arts. 18 e 29',
  },
  {
    id: 'AW4-04',
    secao: 'carga_volumes',
    item: 'ULD / pallet aéreo',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Quando paletizado: identificação do ULD (ex.: PMC, AKE) e nº do ULD; coerência com o nº de pieces',
    tooltip_conferencia: 'Reconhece paletização aérea (ULD) e confere contra o número de volumes',
    base_normativa: 'Praxe aérea; padrão IATA ULD',
  },
  {
    id: 'AW4-05',
    secao: 'carga_volumes',
    item: 'Marcas e handling',
    motor: 'llm',
    severidade: 'info',
    descricao:
      'Shipping marks e "handling information" (frágil, this side up) coerentes com o PL (P4-04)',
    tooltip_conferencia: 'Confere marcas e instruções de manuseio contra o packing list',
    base_normativa: 'Praxe documental; IN 680/06 art. 27 (analogia)',
  },

  // ── Seção 5 — Pesos e peso taxável (IATA) ───────────────────────────────────
  {
    id: 'AW5-01',
    secao: 'pesos_taxavel',
    item: 'Peso bruto (gross weight)',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Gross weight presente; > 0; unidade (K = kg / L = lb) declarada',
    tooltip_conferencia: 'Exige peso bruto e a unidade (kg/lb) no AWB',
    base_normativa: 'Res. IATA 600a; IN 680/06 art. 29, IV',
  },
  {
    id: 'AW5-02',
    secao: 'pesos_taxavel',
    item: 'Peso taxável (chargeable weight)',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Chargeable weight = maior entre peso real e peso volumétrico (volume cm³ ÷ 6.000); recalcular e conferir o declarado',
    tooltip_conferencia: 'Recalcula o peso taxável (maior entre real e volumétrico ÷ 6.000) e confere',
    base_normativa: 'IATA TACT Rules (fator 1:6.000); base do frete aéreo',
  },
  {
    id: 'AW5-03',
    secao: 'pesos_taxavel',
    item: 'AWB × PL × Invoice — pesos',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao: 'Gross do AWB vs PL (P5-06) e invoice (S7-07): amarelo ≥ 2%, gate > 5%',
    tooltip_conferencia: 'Cruza o peso bruto com packing list e invoice — gate acima de 5%',
    base_normativa:
      'IN 680/06 art. 29, IV; jurisprudência (divergência grosseira → perdimento)',
  },
  {
    id: 'AW5-04',
    secao: 'pesos_taxavel',
    item: 'Consistência de unidades',
    motor: 'codigo',
    severidade: 'bloq',
    descricao:
      'Mistura kg/lb no documento ou vs PL/invoice (fator ~2,20×); dimensões cm × in',
    tooltip_conferencia: 'Detecta mistura de unidades de peso/dimensão',
    base_normativa: 'Art. 725 RA; espelho de P4-08/S7-06',
  },
  {
    id: 'AW5-05',
    secao: 'pesos_taxavel',
    item: 'Dimensões × volumétrico',
    motor: 'codigo',
    severidade: 'info',
    descricao:
      'Dimensões (C×L×A) coerentes com o volume usado no peso taxável; densidade plausível para carga aérea',
    tooltip_conferencia: 'Confere as dimensões contra o cálculo de peso volumétrico',
    base_normativa: 'IATA TACT; consolida com P5-08',
  },

  // ── Seção 6 — Frete e valores (aéreo) ───────────────────────────────────────
  {
    id: 'AW6-01',
    secao: 'frete_valores',
    item: 'Prepaid × Collect (PP/CC)',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Indicador PP/CC coerente com o Incoterm: C/D → prepaid; E/F → collect. Nos EUA e alguns países, frete aéreo "collect" pode ser restrito — sinalizar',
    tooltip_conferencia:
      'Cruza prepaid/collect (PP/CC) com o Incoterm — divergência é red flag',
    base_normativa: 'Incoterms® 2020; AVA-GATT art. 8º, 2; Res. IATA (CASS)',
  },
  {
    id: 'AW6-02',
    secao: 'frete_valores',
    item: 'Weight charge e componentes',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Weight/valuation charge, "Other Charges" (códigos IATA: MY, AW, etc.) discriminados quando expressos; base da valoração',
    tooltip_conferencia:
      'Extrai o frete aéreo e os "other charges" (códigos IATA) — base da valoração',
    base_normativa: 'AVA-GATT art. 8º; Res. IATA 600a (other charges codes)',
  },
  {
    id: 'AW6-03',
    secao: 'frete_valores',
    item: 'Moeda (currency)',
    motor: 'codigo',
    severidade: 'cond',
    descricao:
      'Campo "Currency" em ISO 4217; coerente com a invoice quando o frete também consta lá (S5-05/S5-07)',
    tooltip_conferencia: 'Valida a moeda do AWB e a coerência com a invoice',
    base_normativa: 'ISO 4217; base de conversão (RA art. 97)',
  },
  {
    id: 'AW6-04',
    secao: 'frete_valores',
    item: 'Declared value (carriage / customs)',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      '"Declared value for carriage" (NVD = no value declared) e "for customs" (NCV): quando há valor, não deve conflitar grosseiramente com a invoice',
    tooltip_conferencia: 'Confere os valores declarados (carriage/customs) contra a invoice',
    base_normativa:
      'Convenção de Montreal art. 22 (limite de responsabilidade); red flag de subfaturamento',
  },
  {
    id: 'AW6-05',
    secao: 'frete_valores',
    item: 'Bloqueio por frete no CCT',
    motor: 'rag',
    severidade: 'info',
    descricao:
      'Pendência de pagamento de frete no conhecimento bloqueia a entrega final da carga pelo depositário',
    tooltip_conferencia: 'Alerta que pendência de frete bloqueia a entrega da carga no CCT',
    base_normativa: 'IN 680/06 art. 56, I (consulta obrigatória do depositário); IN 2143/2023',
  },

  // ── Seção 7 — Dados do CCT-Aéreo ────────────────────────────────────────────
  {
    id: 'AW7-01',
    secao: 'dados_cct_aereo',
    item: 'Associação Master/House (XFHL)',
    motor: 'cross_doc',
    severidade: 'bloq',
    gate_condicional: true,
    descricao:
      'Consolidada: cada HAWB (XFZB) associado ao MAWB (XFWB). A data de emissão do XFHL deve ser posterior à do XFZB, sob pena de inviabilizar a associação no CCT',
    tooltip_conferencia:
      'Verifica a associação master/house e a ordem de datas exigida pelo CCT',
    base_normativa: 'Manual CCT Aéreo (XFWB/XFZB/XFHL); IN 2143/2023',
  },
  {
    id: 'AW7-02',
    secao: 'dados_cct_aereo',
    item: 'Consignatário / recinto de destino',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Recinto aduaneiro de destino (OCI no XFWB/XFZB) informado para dar visibilidade da carga ao depositário de zona secundária',
    tooltip_conferencia: 'Confere o recinto de destino que dá visibilidade da carga ao depositário',
    base_normativa: 'Manual CCT Aéreo (código do recinto no OCI); IN 680/06 art. 56, I',
  },
  {
    id: 'AW7-03',
    secao: 'dados_cct_aereo',
    item: 'Validação pré-DUIMP',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Checklist antes da DUIMP: peso, consignatário, RUC e frete conferidos; retificação de chegada só em 15 min, RUC só até a recepção',
    tooltip_conferencia: 'Alerta a conferência dos dados do CCT antes da DUIMP',
    base_normativa: 'Portal Único/DUIMP; Manual CCT Aéreo',
  },
  {
    id: 'AW7-04',
    secao: 'dados_cct_aereo',
    item: 'Manuseio especial (NAR e outros)',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Códigos de manuseio especial (ex.: "NAR" não armazenar para nacionalização em zona secundária) coerentes com o fluxo pretendido',
    tooltip_conferencia: 'Detecta códigos de manuseio especial e sua coerência com o fluxo',
    base_normativa: 'Manual CCT Aéreo (campo "Manuseio Especial da Carga")',
  },

  // ── Seção 8 — Regulatório, anuências e carga especial ───────────────────────
  {
    id: 'AW8-01',
    secao: 'regulatorio_carga_especial',
    item: 'Madeira declarada',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Presença/ausência de embalagens/suportes de madeira e se tratada/certificada (consolida com P8-01/S7-03)',
    tooltip_conferencia: 'Verifica declaração de madeira no AWB',
    base_normativa: 'Portaria MAPA 514/2022; NIMF 15',
  },
  {
    id: 'AW8-02',
    secao: 'regulatorio_carga_especial',
    item: 'Carga perigosa IATA DGR — dados',
    motor: 'rag',
    severidade: 'bloq',
    gate_condicional: true,
    descricao:
      'DG detectada: UN number, proper shipping name, classe, packing group, Shipper\'s Declaration for Dangerous Goods (SDDG) referenciada; observar itens proibidos em aeronave de passageiros (PAX) × cargueiro (CAO)',
    tooltip_conferencia: 'Exige UN, classe, packing group e SDDG no AWB; alerta PAX/CAO',
    base_normativa: 'IATA DGR (declaração aérea); Doc. ICAO 9284; NBR 7500',
  },
  {
    id: 'AW8-03',
    secao: 'regulatorio_carga_especial',
    item: 'Perecível / temperatura / pharma',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Perecíveis (PER), pharma (temperatura controlada — CEIV Pharma), animais vivos (AVI): condições declaradas e coerentes com o produto (ANVISA/MAPA)',
    tooltip_conferencia:
      'Confere condições de perecível/pharma/animais vivos e coerência com o produto',
    base_normativa: 'Praxe aérea (IATA PCR/LAR); RDC 81/2008; Vigiagro',
  },
  {
    id: 'AW8-04',
    secao: 'regulatorio_carga_especial',
    item: 'Valiosos / especiais',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Cargas valiosas (VAL), restos mortais (HUM), diplomática: manuseio especial declarado',
    tooltip_conferencia: 'Detecta cargas especiais (valiosos, restos mortais) com manuseio próprio',
    base_normativa: 'Praxe aérea (IATA); tratamento aduaneiro específico',
  },
  {
    id: 'AW8-05',
    secao: 'regulatorio_carga_especial',
    item: 'Anuências por NCM',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao:
      'NCM da invoice sujeito a anuente (ANVISA, MAPA, ANATEL, INMETRO, Exército, IBAMA, CNEN, PF): sinalizar LPCO e contradições no AWB',
    tooltip_conferencia: 'Sinaliza anuências pelo NCM e contradições no conhecimento aéreo',
    base_normativa:
      'Tratamento administrativo Portal Único; mesma tabela RAG das matrizes S/P',
  },

  // ── Seção 9 — Legitimidade e risco aduaneiro ────────────────────────────────
  {
    id: 'AW9-01',
    secao: 'legitimidade_risco',
    item: 'Assinaturas (shipper e carrier)',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'AWB assina duas vezes: "Signature of Shipper or his Agent" e "Signature of issuing Carrier or its Agent"; e-AWB dispensa assinatura física (acordo EDI)',
    tooltip_conferencia: 'Verifica as assinaturas do expedidor e do transportador (ou e-AWB)',
    base_normativa: 'Convenção de Montreal art. 7º; Res. IATA 600a/672 (e-AWB)',
  },
  {
    id: 'AW9-02',
    secao: 'legitimidade_risco',
    item: 'Legibilidade e integridade',
    motor: 'llm',
    severidade: 'alerta',
    descricao: 'Legível, sem rasuras não chanceladas ou sinais de adulteração',
    tooltip_conferencia: 'Avalia legibilidade e sinais de adulteração no AWB',
    base_normativa: 'DL 1.455/76 art. 23 (falsidade → perdimento)',
  },
  {
    id: 'AW9-03',
    secao: 'legitimidade_risco',
    item: 'Coerência global do trio',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Parecer único consolidando invoice × PL × AWB: partes, volumes, pesos, rota, frete/Incoterm, madeira e DG',
    tooltip_conferencia: 'Consolida a coerência entre invoice, packing list e AWB',
    base_normativa: 'RA art. 553; IN 680/06 arts. 18 e 29',
  },
  {
    id: 'AW9-04',
    secao: 'legitimidade_risco',
    item: 'Risco de penalidade e bloqueio',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Consolidar exposições: informação/retificação fora do prazo (R$ 5.000 por ocorrência), bloqueio automático (incl. falta de consignatário no HAWB), inexatidão (art. 725), armazenagem',
    tooltip_conferencia: 'Consolida risco de multa de R$ 5.000, bloqueio e custos decorrentes',
    base_normativa: 'DL 37/66 art. 107, IV, "e"/"f"; IN 2143/2023; Súmula CARF 126',
  },
  {
    id: 'AW9-05',
    secao: 'legitimidade_risco',
    item: 'Score documental',
    motor: 'codigo',
    severidade: null,
    descricao:
      'Score 0–100 sobre regras ALERTA/INFO aplicáveis (COND não disparadas = N/A, fora do score)',
    tooltip_conferencia: 'Pontuação de qualidade documental do AWB',
    base_normativa: 'Metodologia interna',
  },
  {
    id: 'AW9-06',
    secao: 'legitimidade_risco',
    item: 'Classificação de risco (gates + score)',
    motor: 'codigo',
    severidade: null,
    descricao:
      'Pior entre score e gates. Qualquer BLOQ falho ⇒ mínimo "Alto risco". Gates: AW1-01, AW1-05, AW2-05, AW2-06, AW3-04, AW5-03, AW5-04, AW7-01, AW8-02',
    tooltip_conferencia: 'Classificação final combinando gates e pontuação',
    base_normativa: 'Metodologia interna',
  },
]

/** IDs das regras BLOQ que atuam como gate na classificação final (AW9-06). */
export const GATES_MATRIZ_AWB: readonly string[] = MATRIZ_VALIDACAO_AWB.filter(
  (regra) => regra.severidade === 'bloq',
).map((regra) => regra.id)

/**
 * Gates cuja falha isolada já classifica o documento como Crítico (AW9-06):
 * AW2-05 (falta de consignatário no HAWB → bloqueio), AW7-01 (associação
 * master/house inviável) e AW5-03 (divergência de peso > 5%).
 */
export const GATES_CRITICOS_MATRIZ_AWB: readonly string[] = ['AW2-05', 'AW7-01', 'AW5-03']

export type ClassificacaoRiscoAwb = 'baixo_risco' | 'atencao' | 'alto_risco' | 'critico'

export const ROTULO_CLASSIFICACAO_RISCO_AWB: Record<ClassificacaoRiscoAwb, string> = {
  baixo_risco: 'Baixo risco',
  atencao: 'Atenção',
  alto_risco: 'Alto risco',
  critico: 'Crítico',
}

/** Faixas do score — aplicáveis somente quando nenhum gate falhou. */
export function classificacaoPorFaixaScoreAwb(score: number): ClassificacaoRiscoAwb {
  if (score >= 95) return 'baixo_risco'
  if (score >= 80) return 'atencao'
  if (score >= 60) return 'alto_risco'
  return 'critico'
}

/**
 * Regra de rebaixamento (AW9-06): 1 gate falho ⇒ mínimo "Alto risco";
 * 2+ gates falhos ou gate AW2-05/AW7-01/AW5-03 ⇒ "Crítico". O score nunca
 * eleva a classificação acima do teto imposto pelos gates.
 */
export function classificacaoRiscoAwb(
  score: number,
  gatesFalhos: readonly string[],
): ClassificacaoRiscoAwb {
  const porScore = classificacaoPorFaixaScoreAwb(score)
  if (gatesFalhos.length === 0) return porScore

  const temGateCritico = gatesFalhos.some((id) => GATES_CRITICOS_MATRIZ_AWB.includes(id))
  if (gatesFalhos.length >= 2 || temGateCritico) return 'critico'

  return porScore === 'critico' ? 'critico' : 'alto_risco'
}

export function regraMatrizAwbPorId(id: string): RegraMatrizAwb | undefined {
  return MATRIZ_VALIDACAO_AWB.find((r) => r.id === id)
}
