/**
 * matriz-validacao-packing-list-smart-read.ts — SSOT Matriz de Validação do Packing List / Romaneio de Carga (v1.0)
 *
 * Pipeline: OCR → Código (determinístico) → Cross-Doc (resultado da matriz da invoice S1–S8) →
 *           API/RAG (anuências, payload, densidade) → LLM Analista → Score + Gates → UI
 *
 * Base normativa geral: RA (Decreto 6.759/2009) art. 553/725/728 · IN SRF 680/2006 arts. 18 e 29 ·
 * IN RFB 800/2007 · IN RFB 2002/2020 · Portaria MAPA 514/2022 + NIMF 15 · SOLAS Cap. VI Reg. 2 (VGM) ·
 * IMDG/IATA DGR · Lei 10.833/2003 / DL 37/66 art. 107.
 */

export type SecaoMatrizPackingList =
  | 'identificacao_vinculos'
  | 'partes_envolvidas'
  | 'transporte_cct'
  | 'volumes_embalagens'
  | 'pesos_consistencias'
  | 'itens_rastreabilidade'
  | 'catalogo_duimp'
  | 'regulatorio_anuencias'
  | 'legitimidade_risco'

/** Motores da matriz PL — inclui Cross-Doc (cruza com a matriz da invoice) e motores compostos. */
export type MotorValidacaoPackingList =
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
 * - `null` — agregador (P9-05 score / P9-06 classificação), não é regra avaliável
 */
export type SeveridadeMatrizPackingList = 'bloq' | 'alerta' | 'info' | 'cond' | null

export type RegraMatrizPackingList = {
  id: string
  secao: SecaoMatrizPackingList
  item: string
  motor: MotorValidacaoPackingList
  severidade: SeveridadeMatrizPackingList
  /** Gate condicional — BLOQ apenas quando o gatilho existe (ex.: P3-03 só em FCL multi-contêiner). */
  gate_condicional?: boolean
  /** Nota técnica para prompt e motor — não exibir direto na UI */
  descricao: string
  /** Texto da tooltip (ícone i) — linguagem do usuário, máx ~90 caracteres */
  tooltip_conferencia: string
  /** Citação normativa que fundamenta a regra */
  base_normativa: string
}

/** Ordem canônica das seções na UI (matriz 1→9). */
export const ORDEM_SECOES_MATRIZ_PACKING_LIST: readonly SecaoMatrizPackingList[] = [
  'identificacao_vinculos',
  'partes_envolvidas',
  'transporte_cct',
  'volumes_embalagens',
  'pesos_consistencias',
  'itens_rastreabilidade',
  'catalogo_duimp',
  'regulatorio_anuencias',
  'legitimidade_risco',
] as const

export const ROTULO_SECAO_MATRIZ_PACKING_LIST: Record<SecaoMatrizPackingList, string> = {
  identificacao_vinculos: '1 — Identificação e vínculos',
  partes_envolvidas: '2 — Partes envolvidas',
  transporte_cct: '3 — Transporte e CCT',
  volumes_embalagens: '4 — Volumes e embalagens',
  pesos_consistencias: '5 — Pesos e consistências',
  itens_rastreabilidade: '6 — Itens e rastreabilidade',
  catalogo_duimp: '7 — Catálogo de Produtos DUIMP',
  regulatorio_anuencias: '8 — Regulatório e anuências',
  legitimidade_risco: '9 — Legitimidade e risco aduaneiro',
}

export const ROTULO_MOTOR_MATRIZ_PACKING_LIST: Record<MotorValidacaoPackingList, string> = {
  codigo: 'Código',
  api: 'API',
  llm: 'IA',
  rag: 'RAG',
  cross_doc: 'Cross-Doc',
  codigo_rag: 'Código + RAG',
  cross_doc_rag: 'Cross-Doc + RAG',
  api_llm: 'API + IA',
}

export const ROTULO_SEVERIDADE_MATRIZ_PACKING_LIST: Record<
  Exclude<SeveridadeMatrizPackingList, null>,
  string
> = {
  bloq: 'BLOQ',
  alerta: 'ALERTA',
  info: 'INFO',
  cond: 'COND',
}

/** Matriz completa — fonte única para documentação, testes e orquestração. */
export const MATRIZ_VALIDACAO_PACKING_LIST: RegraMatrizPackingList[] = [
  // ── Seção 1 — Identificação e vínculos ─────────────────────────────────────
  {
    id: 'P1-01',
    secao: 'identificacao_vinculos',
    item: 'Packing List identificado',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Título/natureza "Packing List / Romaneio" + referência única do documento',
    tooltip_conferencia:
      'Confere se o documento se identifica como packing list e traz referência única',
    base_normativa: 'RA art. 553, III; IN 680/06 art. 18, III',
  },
  {
    id: 'P1-02',
    secao: 'identificacao_vinculos',
    item: 'Data de emissão',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Presente; alerta se futura, > 180 dias ou anterior à data da invoice vinculada',
    tooltip_conferencia: 'Valida a data de emissão — alerta se futura, antiga ou anterior à invoice',
    base_normativa: 'Coerência documental (IN 680/06 arts. 25–32)',
  },
  {
    id: 'P1-03',
    secao: 'identificacao_vinculos',
    item: 'Referência à Invoice',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao: 'Extrair nº da invoice referenciada; deve existir e casar com a invoice do dossiê',
    tooltip_conferencia:
      'Busca o número da invoice vinculada e cruza com o documento do processo',
    base_normativa: 'IN 680/06 art. 18 (conjunto instrutivo); Portaria Coana 30/2015 (dossiê)',
  },
  {
    id: 'P1-04',
    secao: 'identificacao_vinculos',
    item: 'Referência PO / Proforma',
    motor: 'cross_doc',
    severidade: 'info',
    descricao: 'Extrair PO/proforma se citada; cruzar com a extraída na invoice (S1-03)',
    tooltip_conferencia: 'Busca referência de pedido de compra e compara com a da invoice',
    base_normativa: 'IN 680/06 art. 15, §1º (dado omisso/erro impede registro)',
  },
  {
    id: 'P1-05',
    secao: 'identificacao_vinculos',
    item: 'Paginação',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Total de páginas vs rodapé; sem páginas faltantes',
    tooltip_conferencia: 'Confronta o total de páginas declarado com a paginação do arquivo',
    base_normativa: 'Integridade documental — IN 680/06 art. 18, §3º c/c MP 2.200-2/2001',
  },
  {
    id: 'P1-06',
    secao: 'identificacao_vinculos',
    item: 'Packing duplicado no processo',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Detectar dois PLs distintos vinculados à mesma invoice com dados divergentes (revisão de fornecedor sem cancelamento)',
    tooltip_conferencia: 'Detecta packing lists conflitantes para a mesma invoice no processo',
    base_normativa:
      'RA art. 725 (declaração inexata); risco de instrução com documento superado',
  },

  // ── Seção 2 — Partes envolvidas ────────────────────────────────────────────
  {
    id: 'P2-01',
    secao: 'partes_envolvidas',
    item: 'Exportador / Shipper',
    motor: 'llm',
    severidade: 'alerta',
    descricao: 'Nome presente; comparação semântica com exportador da invoice (S2-05)',
    tooltip_conferencia: 'Confere shipper do romaneio contra o exportador da invoice',
    base_normativa: 'IN 680/06 art. 18; RA art. 553',
  },
  {
    id: 'P2-02',
    secao: 'partes_envolvidas',
    item: 'Importador / Consignee',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao: 'Nome (e CNPJ, se impresso) vs importador da invoice e cadastro RFB (S2-02/S2-03)',
    tooltip_conferencia: 'Compara o consignee com o importador da invoice e o cadastro do CNPJ',
    base_normativa: 'IN 680/06 art. 15, I (regularidade cadastral)',
  },
  {
    id: 'P2-03',
    secao: 'partes_envolvidas',
    item: 'CNPJ válido (quando existir)',
    motor: 'codigo',
    severidade: 'cond',
    descricao: 'Se houver CNPJ impresso: regex + Módulo 11; idêntico ao da invoice',
    tooltip_conferencia: 'Valida formato e dígitos do CNPJ quando presente no romaneio',
    base_normativa: 'IN RFB 2119/2022; coerência com S2-01',
  },
  {
    id: 'P2-04',
    secao: 'partes_envolvidas',
    item: 'Notify party / entrega',
    motor: 'cross_doc',
    severidade: 'info',
    descricao: 'Notify/entrega coerente com invoice (S2-09) e consignee do BL',
    tooltip_conferencia: 'Verifica notify party e endereço de entrega contra invoice e conhecimento',
    base_normativa: 'IN 680/06 art. 29, II',
  },
  {
    id: 'P2-05',
    secao: 'partes_envolvidas',
    item: 'Endereço do exportador',
    motor: 'llm',
    severidade: 'alerta',
    descricao: 'Endereço internacional presente; coerente com o da invoice (S2-06)',
    tooltip_conferencia: 'Confere o endereço do exportador contra a invoice',
    base_normativa: 'IN 680/06 art. 18; RA art. 553',
  },
  {
    id: 'P2-06',
    secao: 'partes_envolvidas',
    item: 'Endereço do importador',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao: 'Endereço coerente com invoice (S2-04) e cadastro fiscal RFB',
    tooltip_conferencia: 'Compara o endereço do importador com invoice e cadastro da RFB',
    base_normativa: 'Coerência cadastral (IN 680/06 art. 15)',
  },
  {
    id: 'P2-07',
    secao: 'partes_envolvidas',
    item: 'Exportador × Fabricante — triangulação',
    motor: 'cross_doc',
    severidade: 'info',
    descricao:
      'Exportador ≠ fabricante/origem (ex.: exportador HK, fabricante CN): não é erro, mas marcar para valoração e origem; alimenta S3-03 da invoice',
    tooltip_conferencia: 'Sinaliza triangulação comercial — exportador distinto do fabricante/origem',
    base_normativa:
      'Acordo de Valoração Aduaneira (art. 1º c/c 15); RA arts. 76–83 (valoração); controle de origem não preferencial',
  },

  // ── Seção 3 — Transporte e CCT ─────────────────────────────────────────────
  {
    id: 'P3-01',
    secao: 'transporte_cct',
    item: 'Referência BL/AWB/CRT',
    motor: 'llm',
    severidade: 'alerta',
    descricao: 'Extrair nº do conhecimento, se citado; um romaneio ↔ um conhecimento',
    tooltip_conferencia: 'Busca o número do BL/AWB/CRT vinculado ao romaneio',
    base_normativa: 'RA art. 554; IN 680/06 arts. 18 e 44 (vinculação NIC/CE no Mercante)',
  },
  {
    id: 'P3-02',
    secao: 'transporte_cct',
    item: 'Contêiner ISO 6346',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Nº de contêiner: 4 letras + 7 dígitos com dígito verificador válido',
    tooltip_conferencia: 'Valida o número do contêiner no padrão ISO 6346 com dígito verificador',
    base_normativa: 'ISO 6346; IN RFB 800/2007 (unidade de carga no CE)',
  },
  {
    id: 'P3-03',
    secao: 'transporte_cct',
    item: 'Distribuição por contêiner',
    motor: 'llm',
    severidade: 'bloq',
    gate_condicional: true,
    descricao:
      'Em multi-contêiner: conteúdo detalhado por unidade de carga. (BLOQ apenas quando FCL multi-contêiner)',
    tooltip_conferencia: 'Exige detalhamento do conteúdo por contêiner/unidade de carga',
    base_normativa: 'IN 680/06 art. 29, III (packing-list detalhado por unidade de carga)',
  },
  {
    id: 'P3-04',
    secao: 'transporte_cct',
    item: 'Portos e rota',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Porto/aeroporto de embarque e destino coerentes com local do Incoterm (S3-01/S3-02) e rota',
    tooltip_conferencia: 'Cruza portos do romaneio com o Incoterm e a rota da invoice',
    base_normativa: 'RA art. 553; coerência geográfica (paralelo S3-02)',
  },
  {
    id: 'P3-05',
    secao: 'transporte_cct',
    item: 'Navio / voo / veículo',
    motor: 'llm',
    severidade: 'info',
    descricao: 'Identificação do meio de transporte quando informado; coerente com o modal',
    tooltip_conferencia: 'Confere identificação do meio de transporte quando presente',
    base_normativa: 'IN RFB 800/2007 (aquaviário); Mantra (aéreo); CCT Portal Único',
  },
  {
    id: 'P3-06',
    secao: 'transporte_cct',
    item: 'Lacre (seal)',
    motor: 'codigo',
    severidade: 'cond',
    descricao: 'Em FCL: número de lacre presente',
    tooltip_conferencia: 'Exige número de lacre em carga FCL',
    base_normativa: 'IN RFB 800/2007; controle de integridade da unidade de carga',
  },
  {
    id: 'P3-07',
    secao: 'transporte_cct',
    item: 'Volumes por contêiner — dois níveis',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Comparar contagem em dois níveis: unidades externas (pallets) e embalagens internas (caixas). PL "10 pallets" vs CE "500 caixas" pode ser correto — reconhecer o nível de cada documento antes de acusar divergência',
    tooltip_conferencia: 'Compara volumes por contêiner reconhecendo pallets vs embalagens internas',
    base_normativa:
      'IN RFB 800/2007 (qtde de volumes no CE); evita travas de vinculação no Mercante',
  },
  {
    id: 'P3-08',
    secao: 'transporte_cct',
    item: 'Modal compatível',
    motor: 'codigo',
    severidade: 'bloq',
    descricao:
      'Detectar contradições: AWB + contêiner marítimo; CRT + navio; peso/dimensão incompatível com modal declarado',
    tooltip_conferencia: 'Detecta contradição entre documento de transporte, equipamento e modal',
    base_normativa:
      'Coerência documental; IN 680/06 art. 15, VI (vinculação no sistema de carga do modal)',
  },
  {
    id: 'P3-09',
    secao: 'transporte_cct',
    item: 'VGM / payload do contêiner',
    motor: 'codigo',
    severidade: 'bloq',
    descricao:
      "Peso bruto total por contêiner ≤ payload máximo do tipo (ex.: 20'DC ≈ 28,2 t; 40'HC ≈ 28,6 t); alerta se VGM citado divergir do gross do PL",
    tooltip_conferencia: 'Confere peso bruto contra o payload máximo do contêiner e o VGM',
    base_normativa: 'SOLAS Cap. VI, Reg. 2 (VGM); Resolução ANTAQ/praxe portuária',
  },

  // ── Seção 4 — Volumes e embalagens ─────────────────────────────────────────
  {
    id: 'P4-01',
    secao: 'volumes_embalagens',
    item: 'Quantidade total de volumes',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Total declarado; inteiro > 0',
    tooltip_conferencia: 'Confere a declaração do total de volumes da carga',
    base_normativa: 'Manual RFB (função básica do romaneio); IN RFB 800/2007',
  },
  {
    id: 'P4-02',
    secao: 'volumes_embalagens',
    item: 'Numeração sequencial',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Numeração 1..n contínua, sem lacunas nem duplicidade; n = total',
    tooltip_conferencia: 'Verifica numeração sequencial dos volumes contra o total declarado',
    base_normativa: 'Praxe aduaneira; conferência física (IN 680/06 arts. 27–29)',
  },
  {
    id: 'P4-03',
    secao: 'volumes_embalagens',
    item: 'Espécie de embalagem',
    motor: 'llm',
    severidade: 'alerta',
    descricao: 'Tipo por volume (caixa, pallet, tambor, bag...); rejeitar genérico "package"',
    tooltip_conferencia: 'Exige a espécie de embalagem de cada volume — rejeita termos genéricos',
    base_normativa: 'Manual RFB; RA art. 557, IV (analogia)',
  },
  {
    id: 'P4-04',
    secao: 'volumes_embalagens',
    item: 'Shipping marks',
    motor: 'llm',
    severidade: 'info',
    descricao: 'Marcas e contramarcas de identificação quando aplicável',
    tooltip_conferencia: 'Verifica marcas e contramarcas de identificação dos volumes',
    base_normativa: 'RA art. 557; IN 680/06 art. 27',
  },
  {
    id: 'P4-05',
    secao: 'volumes_embalagens',
    item: 'Dimensões e cubagem',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Dimensões (C×L×A) e/ou m³ por volume; Σ cubagem = total declarado',
    tooltip_conferencia: 'Valida dimensões e recalcula a cubagem total da carga',
    base_normativa: 'Manual RFB; IN RFB 800/2007 (cubagem no CE)',
  },
  {
    id: 'P4-06',
    secao: 'volumes_embalagens',
    item: 'Invoice × Packing — volumes',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao: 'Total de volumes do PL = sumário de embalagens da invoice (S7-02)',
    tooltip_conferencia: 'Cruza o total de volumes do romaneio com o declarado na invoice',
    base_normativa: 'IN 680/06 art. 18',
  },
  {
    id: 'P4-07',
    secao: 'volumes_embalagens',
    item: 'Volume fora do padrão',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Heurística de proporção: nº de volumes desproporcional ao nº de itens/quantidades (ex.: 999 caixas para 2 itens) — red flag de erro de extração ou fracionamento atípico. Dona da heurística de contagem; P5-07 é dona da heurística de peso',
    tooltip_conferencia: 'Detecta proporção anormal entre volumes e itens da carga',
    base_normativa: 'Red flag operacional; art. 725 RA (inexatidão)',
  },
  {
    id: 'P4-08',
    secao: 'volumes_embalagens',
    item: 'Consistência de unidades',
    motor: 'codigo',
    severidade: 'bloq',
    descricao:
      'Detectar mistura kg/lbs e m³/cft no mesmo documento ou entre PL e invoice; divergências ~2,20× (lb) ou ~35,3× (cft) indicam conversão não declarada',
    tooltip_conferencia: 'Detecta mistura de sistemas de unidades (kg×lbs, m³×cft) no documento',
    base_normativa: 'Fonte clássica de divergência documental; art. 725 RA',
  },

  // ── Seção 5 — Pesos e consistências ────────────────────────────────────────
  {
    id: 'P5-01',
    secao: 'pesos_consistencias',
    item: 'Peso líquido',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Net weight por volume ou linha; > 0',
    tooltip_conferencia: 'Exige peso líquido informado por volume ou item',
    base_normativa:
      'Manual RFB; jurisprudência TRF3 (ausência de net em itens → perdimento)',
  },
  {
    id: 'P5-02',
    secao: 'pesos_consistencias',
    item: 'Peso bruto',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Gross weight por volume; > 0',
    tooltip_conferencia: 'Exige peso bruto informado por volume',
    base_normativa: 'Manual RFB; IN RFB 800/2007',
  },
  {
    id: 'P5-03',
    secao: 'pesos_consistencias',
    item: 'Gross ≥ Net',
    motor: 'codigo',
    severidade: 'bloq',
    descricao:
      'Bruto ≥ líquido por volume e no total; tara implícita > 0 e proporcional à espécie de embalagem',
    tooltip_conferencia: 'Garante peso bruto ≥ líquido e tara plausível em cada volume',
    base_normativa: 'Consistência física; espelho do S7-01 da invoice',
  },
  {
    id: 'P5-04',
    secao: 'pesos_consistencias',
    item: 'Fechamento matemático',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Σ pesos por volume = totais declarados (net e gross)',
    tooltip_conferencia: 'Recalcula e confere os totais de peso líquido e bruto',
    base_normativa: 'Conferência aritmética; art. 725 RA',
  },
  {
    id: 'P5-05',
    secao: 'pesos_consistencias',
    item: 'Invoice × Packing — pesos',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao: 'Net/Gross totais do PL = pesos da invoice; tolerância default 0,5%',
    tooltip_conferencia: 'Cruza os pesos totais do romaneio com os da invoice',
    base_normativa: 'IN 680/06 art. 18',
  },
  {
    id: 'P5-06',
    secao: 'pesos_consistencias',
    item: 'Conhecimento × Packing — 5%',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Peso bruto do PL vs BL/CE-Mercante por unidade de carga; amarelo ≥ 2%, vermelho/gate > 5%',
    tooltip_conferencia: 'Compara peso bruto com o conhecimento — gate acima de 5% de divergência',
    base_normativa: 'IN 680/06 art. 29, IV (teto de 5%); IN RFB 800/2007',
  },
  {
    id: 'P5-07',
    secao: 'pesos_consistencias',
    item: 'Peso × Quantidade',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Relação kg/unidade plausível para o tipo de mercadoria; outliers sinalizados. Dona da heurística de peso; P4-07 é dona da de contagem',
    tooltip_conferencia: 'Analisa se a relação peso por quantidade é plausível para a mercadoria',
    base_normativa: 'IN 680/06 art. 29, V; red flag de ocultação/subfaturamento',
  },
  {
    id: 'P5-08',
    secao: 'pesos_consistencias',
    item: 'Densidade física plausível',
    motor: 'codigo_rag',
    severidade: 'alerta',
    descricao:
      'Densidade (kg/m³) por volume e total dentro de faixa plausível; calibrar por capítulo NCM quando disponível (ex.: 1 pallet, 3 m³, 12 kg = 4 kg/m³ → improvável). Nunca bloqueante — cargas legítimas de baixa densidade existem (EPS, plásticos ocos, luminárias)',
    tooltip_conferencia:
      'Calcula densidade da carga e sinaliza valores fisicamente improváveis',
    base_normativa:
      'Física da carga; detector de erro de extração; faixas por capítulo NCM (tabela RAG)',
  },

  // ── Seção 6 — Itens e rastreabilidade ──────────────────────────────────────
  {
    id: 'P6-01',
    secao: 'itens_rastreabilidade',
    item: 'Descrição por volume',
    motor: 'llm',
    severidade: 'alerta',
    descricao: 'Conteúdo de cada volume descrito; rejeitar "goods"/"cargo"',
    tooltip_conferencia: 'Exige descrição do conteúdo de cada volume — rejeita termos genéricos',
    base_normativa: 'Manual RFB (localizar produto no lote); IN 680/06 art. 29',
  },
  {
    id: 'P6-02',
    secao: 'itens_rastreabilidade',
    item: 'Part number',
    motor: 'cross_doc',
    severidade: 'cond',
    descricao: 'Quando a invoice traz PN (S4-01): deve constar e casar',
    tooltip_conferencia: 'Verifica part numbers e cruza com os da invoice',
    base_normativa: 'Rastreabilidade entre documentos instrutivos',
  },
  {
    id: 'P6-03',
    secao: 'itens_rastreabilidade',
    item: 'Quantidade por volume',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao: 'Σ quantidades por item no PL = quantidade do item na invoice (S4-05)',
    tooltip_conferencia: 'Soma as quantidades por volume e confere com as linhas da invoice',
    base_normativa: 'IN 680/06 arts. 5º, §1º e 18; art. 725 RA',
  },
  {
    id: 'P6-04',
    secao: 'itens_rastreabilidade',
    item: 'Itens ausentes',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao: 'Nenhum item da invoice ausente no PL e vice-versa (mercadoria não manifestada)',
    tooltip_conferencia: 'Detecta itens presentes em um documento e ausentes no outro',
    base_normativa: 'RA arts. 689/725; jurisprudência TRF3 (itens ausentes → perdimento)',
  },
  {
    id: 'P6-05',
    secao: 'itens_rastreabilidade',
    item: 'Valores indevidos',
    motor: 'cross_doc',
    severidade: 'cond',
    descricao:
      'PL dispensa preços; se presentes, moeda/valores devem casar com a invoice (S5-01/S5-02)',
    tooltip_conferencia: 'Romaneio dispensa valores — se presentes, devem coincidir com a invoice',
    base_normativa: 'Natureza logística do documento — Manual RFB',
  },
  {
    id: 'P6-06',
    secao: 'itens_rastreabilidade',
    item: 'País de origem',
    motor: 'cross_doc',
    severidade: 'cond',
    descricao:
      'Se "country of origin / made in" presente: distinguir origem de procedência e aquisição; cruzar com triangulação (P2-07 e S3-03) — não validar isoladamente',
    tooltip_conferencia: 'Extrai país de origem e cruza com a análise de origem/procedência/aquisição',
    base_normativa: 'RA arts. 15–16 (conceitos distintos na declaração); controle de origem',
  },
  {
    id: 'P6-07',
    secao: 'itens_rastreabilidade',
    item: 'Fabricante',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Quando presente: casar com fabricante da invoice (S2-07) e alimentar Seção 7. Ausência = N/A, não penaliza',
    tooltip_conferencia: 'Extrai o fabricante quando informado e alimenta o catálogo DUIMP',
    base_normativa: 'Catálogo de Produtos DUIMP (IN 680/06 Anexo III)',
  },
  {
    id: 'P6-08',
    secao: 'itens_rastreabilidade',
    item: 'Número de série',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Somente para bens seriados (máquinas, eletrônicos, veículos): extrair e conferir unicidade/contagem vs quantidade',
    tooltip_conferencia: 'Extrai números de série de bens seriados e confere a contagem',
    base_normativa: 'Identificação da mercadoria (RA art. 557); praxe para bens de capital',
  },
  {
    id: 'P6-09',
    secao: 'itens_rastreabilidade',
    item: 'Marca comercial',
    motor: 'llm',
    severidade: 'cond',
    descricao: 'Quando presente: extrair e alimentar Seção 7',
    tooltip_conferencia: 'Extrai a marca comercial quando informada no romaneio',
    base_normativa: 'Catálogo de Produtos DUIMP',
  },
  {
    id: 'P6-10',
    secao: 'itens_rastreabilidade',
    item: 'Modelo',
    motor: 'llm',
    severidade: 'cond',
    descricao: 'Quando presente: extrair e alimentar Seção 7',
    tooltip_conferencia: 'Extrai o modelo quando informado no romaneio',
    base_normativa: 'Catálogo de Produtos DUIMP',
  },

  // ── Seção 7 — Catálogo de Produtos DUIMP (toda a seção é COND) ─────────────
  {
    id: 'P7-01',
    secao: 'catalogo_duimp',
    item: 'Fabricante identificado',
    motor: 'cross_doc',
    severidade: 'cond',
    descricao:
      'Fabricante consolidado (PL + invoice S2-07); flag se nenhum documento o traz — exigido no catálogo DUIMP',
    tooltip_conferencia: 'Consolida o fabricante entre documentos — atributo do catálogo DUIMP',
    base_normativa:
      'IN 680/06, art. 4º-A e Anexo III (Duimp/Catálogo — incl. IN RFB 2002/2020)',
  },
  {
    id: 'P7-02',
    secao: 'catalogo_duimp',
    item: 'Marca identificada',
    motor: 'cross_doc',
    severidade: 'cond',
    descricao: 'Marca consolidada entre documentos, quando aplicável ao produto',
    tooltip_conferencia: 'Consolida a marca comercial entre invoice e romaneio',
    base_normativa: 'Atributos do Catálogo de Produtos (Portal Único)',
  },
  {
    id: 'P7-03',
    secao: 'catalogo_duimp',
    item: 'Modelo identificado',
    motor: 'cross_doc',
    severidade: 'cond',
    descricao: 'Modelo consolidado entre documentos, quando aplicável',
    tooltip_conferencia: 'Consolida o modelo entre invoice e romaneio',
    base_normativa: 'Atributos do Catálogo de Produtos',
  },
  {
    id: 'P7-04',
    secao: 'catalogo_duimp',
    item: 'Part number identificado',
    motor: 'cross_doc',
    severidade: 'cond',
    descricao: 'PN consolidado; chave primária de item para histórico e catálogo',
    tooltip_conferencia: 'Consolida o part number como chave do item no catálogo',
    base_normativa: 'Atributos do Catálogo de Produtos',
  },
  {
    id: 'P7-05',
    secao: 'catalogo_duimp',
    item: 'Descrição compatível com catálogo',
    motor: 'api_llm',
    severidade: 'cond',
    descricao:
      'Se o item já existe no catálogo do importador: descrição do PL compatível com a versão catalogada',
    tooltip_conferencia: 'Compara a descrição extraída com o item já catalogado do importador',
    base_normativa: 'Catálogo de Produtos DUIMP; consistência de versionamento',
  },
  {
    id: 'P7-06',
    secao: 'catalogo_duimp',
    item: 'Divergência de fabricante',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao: 'Fabricante do PL ≠ fabricante da invoice ou do catálogo para o mesmo PN',
    tooltip_conferencia: 'Acusa fabricante divergente entre romaneio, invoice e catálogo',
    base_normativa: 'Catálogo DUIMP; impacto em LPCO e parametrização',
  },
  {
    id: 'P7-07',
    secao: 'catalogo_duimp',
    item: 'Divergência de descrição',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Descrição do PL semanticamente incompatível com a da invoice (S4-02) para o mesmo item',
    tooltip_conferencia: 'Acusa descrição incompatível entre romaneio e invoice para o mesmo item',
    base_normativa: 'Art. 725 RA; qualidade do catálogo',
  },
  {
    id: 'P7-08',
    secao: 'catalogo_duimp',
    item: 'Divergência de part number',
    motor: 'codigo',
    severidade: 'bloq',
    descricao: 'Mesmo item com PNs diferentes entre PL e invoice',
    tooltip_conferencia: 'Acusa part numbers conflitantes entre romaneio e invoice',
    base_normativa: 'Rastreabilidade; art. 725 RA',
  },

  // ── Seção 8 — Regulatório e anuências (cross-document por design) ──────────
  {
    id: 'P8-01',
    secao: 'regulatorio_anuencias',
    item: 'Madeira detectada',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Declaração explícita "wooden package: treated / not applicable"; ausência gera alerta',
    tooltip_conferencia: 'Verifica declaração sobre presença ou ausência de embalagem de madeira',
    base_normativa: 'Portaria MAPA 514/2022 (dever de declarar madeira em bruto)',
  },
  {
    id: 'P8-02',
    secao: 'regulatorio_anuencias',
    item: 'NIMF 15 / marca IPPC',
    motor: 'rag',
    severidade: 'bloq',
    descricao: 'Se há madeira em bruto: exigir menção a tratamento HT/MB e marca IPPC',
    tooltip_conferencia: 'Detecta madeira em bruto e exige tratamento NIMF 15 / marca IPPC',
    base_normativa: 'NIMF 15 (CIPV/FAO); Portaria MAPA 514/2022 (devolução/destruição)',
  },
  {
    id: 'P8-03',
    secao: 'regulatorio_anuencias',
    item: 'Isenção NIMF',
    motor: 'rag',
    severidade: 'info',
    descricao:
      'Madeira processada (compensado, MDF, OSB) ou ≤ 6 mm: isenta — suprimir exigência indevida',
    tooltip_conferencia: 'Identifica embalagens isentas da NIMF 15 (madeira processada ou fina)',
    base_normativa: 'NIMF 15 (exclusões); Portaria MAPA 514/2022',
  },
  {
    id: 'P8-04',
    secao: 'regulatorio_anuencias',
    item: 'Anuência ANVISA',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao:
      'NCM/descrição indica produto sujeito à ANVISA → exigir no PL: lote (batch) e validade (shelf life) quando aplicável',
    tooltip_conferencia: 'Detecta produto ANVISA e exige lote e validade no romaneio',
    base_normativa: 'Tratamento administrativo Portal Único; RDC ANVISA 81/2008',
  },
  {
    id: 'P8-05',
    secao: 'regulatorio_anuencias',
    item: 'Anuência MAPA (produto)',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao: 'NCM/descrição indica produto agropecuário → exigir lote/origem quando aplicável',
    tooltip_conferencia: 'Detecta produto sujeito ao MAPA e os dados mínimos no romaneio',
    base_normativa: 'Tratamento administrativo; Decreto 5.741/2006 (SUASA/Vigiagro)',
  },
  {
    id: 'P8-06',
    secao: 'regulatorio_anuencias',
    item: 'Anuência ANATEL',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao: 'NCM de telecom/RF → sinalizar homologação; modelo (P6-10) vira dado crítico',
    tooltip_conferencia: 'Detecta produto de telecom e sinaliza exigência de homologação ANATEL',
    base_normativa: 'Lei 9.472/97; Res. ANATEL 715/2019',
  },
  {
    id: 'P8-07',
    secao: 'regulatorio_anuencias',
    item: 'Anuência INMETRO',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao: 'NCM sujeito a certificação compulsória → sinalizar registro/certificado',
    tooltip_conferencia: 'Detecta produto de certificação compulsória INMETRO',
    base_normativa: 'Lei 9.933/99; portarias de certificação por produto',
  },
  {
    id: 'P8-08',
    secao: 'regulatorio_anuencias',
    item: 'Anuência Exército (PCE)',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao: 'NCM/descrição de produto controlado → sinalizar CR/autorização',
    tooltip_conferencia: 'Detecta produto controlado pelo Exército (PCE)',
    base_normativa: 'Decreto 10.030/2019 (regulamento de produtos controlados)',
  },
  {
    id: 'P8-09',
    secao: 'regulatorio_anuencias',
    item: 'Anuência IBAMA',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao: 'NCM/descrição ambientalmente controlada (químicos, fauna/flora, pneus) → sinalizar',
    tooltip_conferencia: 'Detecta produto sujeito a controle ambiental do IBAMA',
    base_normativa: 'Lei 6.938/81; IN IBAMA aplicáveis; CITES',
  },
  {
    id: 'P8-10',
    secao: 'regulatorio_anuencias',
    item: 'Anuência CNEN',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao: 'Material radioativo/nuclear → sinalizar autorização',
    tooltip_conferencia: 'Detecta material sujeito a controle da CNEN',
    base_normativa: 'Lei 6.189/74',
  },
  {
    id: 'P8-11',
    secao: 'regulatorio_anuencias',
    item: 'Anuência Polícia Federal',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao: 'Precursores químicos controlados → sinalizar (Port. 240)',
    tooltip_conferencia: 'Detecta precursores químicos sob controle da Polícia Federal',
    base_normativa: 'Lei 10.357/2001; Portaria MJSP 240/2019',
  },
  {
    id: 'P8-12',
    secao: 'regulatorio_anuencias',
    item: 'Carga perigosa IMO/IATA — dados mínimos',
    motor: 'cross_doc_rag',
    severidade: 'bloq',
    descricao:
      'Se DG detectada (NCM/descrição/UN no doc): exigir UN number, classe de risco e packing group no PL ou referência à DGD — não apenas a flag',
    tooltip_conferencia: 'Detecta carga perigosa e exige UN number, classe e packing group',
    base_normativa:
      'IMDG Code (marítimo); IATA DGR (aéreo); Res. ANTT 5.998/2022 (rodoviário)',
  },

  // ── Seção 9 — Legitimidade e risco aduaneiro ───────────────────────────────
  {
    id: 'P9-01',
    secao: 'legitimidade_risco',
    item: 'Assinatura / carimbo',
    motor: 'llm',
    severidade: 'alerta',
    descricao: 'Assinatura mecânica, digital ou carimbo do exportador/embarcador',
    tooltip_conferencia: 'Verifica assinatura, carimbo ou selo de autenticidade no romaneio',
    base_normativa: 'IN 680/06 art. 18, §3º c/c MP 2.200-2/2001',
  },
  {
    id: 'P9-02',
    secao: 'legitimidade_risco',
    item: 'Legibilidade e idioma',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Documento legível; alerta se idioma impedir identificação (possível exigência de tradução)',
    tooltip_conferencia: 'Avalia legibilidade e idioma — alerta quando pode ser exigida tradução',
    base_normativa:
      'Exigências na conferência (IN 680/06 art. 30); praxe: inglês/espanhol aceitos',
  },
  {
    id: 'P9-03',
    secao: 'legitimidade_risco',
    item: 'Aplicabilidade do packing',
    motor: 'rag',
    severidade: 'info',
    descricao:
      'Granel, veículos (chassi), máquinas de grande porte (nº de série): romaneio dispensável — desativa o checklist e marca N/A geral',
    tooltip_conferencia: 'Reconhece cargas em que o romaneio é dispensado e desativa o checklist',
    base_normativa:
      'Manual RFB — exigível só onde é prática corrente; sem multa quando inaplicável',
  },
  {
    id: 'P9-04',
    secao: 'legitimidade_risco',
    item: 'Risco de multa',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'PL ausente/inválido em carga embalada → alerta multa R$ 500,00 + risco de retenção/canal',
    tooltip_conferencia: 'Alerta o risco da multa de R$ 500 e de retenção quando o romaneio é exigível',
    base_normativa: 'RA art. 728, VIII, "e" (DL 37/66 art. 107, red. Lei 10.833/2003)',
  },
  {
    id: 'P9-05',
    secao: 'legitimidade_risco',
    item: 'Score documental',
    motor: 'codigo',
    severidade: null,
    descricao:
      'Score 0–100 ponderado sobre regras ALERTA aplicáveis (COND não disparadas = N/A, fora da base de cálculo; INFO registra sem pontuar)',
    tooltip_conferencia: 'Pontuação de qualidade documental do romaneio',
    base_normativa: 'Metodologia interna',
  },
  {
    id: 'P9-06',
    secao: 'legitimidade_risco',
    item: 'Classificação de risco (gates + score)',
    motor: 'codigo',
    severidade: null,
    descricao:
      'Classificação final = pior entre (a) faixa do score e (b) gates. Qualquer BLOQ falho ⇒ no mínimo "Alto risco", independente do score. Gates: P1-06, P3-03*, P3-08, P3-09, P4-08, P5-03, P5-06, P6-03, P6-04, P7-06, P7-08, P8-02, P8-12',
    tooltip_conferencia: 'Classificação final de risco aduaneiro combinando gates e pontuação',
    base_normativa: 'Metodologia interna; espelha lógica de parametrização (canais)',
  },
]

/** IDs das regras BLOQ que atuam como gate na classificação final (P9-06). */
export const GATES_MATRIZ_PACKING_LIST: readonly string[] = MATRIZ_VALIDACAO_PACKING_LIST.filter(
  (regra) => regra.severidade === 'bloq',
).map((regra) => regra.id)

/** Gates cuja falha isolada já classifica o documento como Crítico (P9-06). */
export const GATES_CRITICOS_MATRIZ_PACKING_LIST: readonly string[] = ['P6-04', 'P5-06']

export type ClassificacaoRiscoPackingList = 'baixo_risco' | 'atencao' | 'alto_risco' | 'critico'

export const ROTULO_CLASSIFICACAO_RISCO_PACKING_LIST: Record<ClassificacaoRiscoPackingList, string> = {
  baixo_risco: 'Baixo risco',
  atencao: 'Atenção',
  alto_risco: 'Alto risco',
  critico: 'Crítico',
}

/** Faixas do score — aplicáveis somente quando nenhum gate falhou. */
export function classificacaoPorFaixaScorePackingList(score: number): ClassificacaoRiscoPackingList {
  if (score >= 95) return 'baixo_risco'
  if (score >= 80) return 'atencao'
  if (score >= 60) return 'alto_risco'
  return 'critico'
}

/**
 * Regra de rebaixamento (P9-06): 1 gate falho ⇒ mínimo "Alto risco";
 * 2+ gates falhos ou gate P6-04/P5-06 ⇒ "Crítico". O score nunca eleva
 * a classificação acima do teto imposto pelos gates.
 */
export function classificacaoRiscoPackingList(
  score: number,
  gatesFalhos: readonly string[],
): ClassificacaoRiscoPackingList {
  const porScore = classificacaoPorFaixaScorePackingList(score)
  if (gatesFalhos.length === 0) return porScore

  const temGateCritico = gatesFalhos.some((id) => GATES_CRITICOS_MATRIZ_PACKING_LIST.includes(id))
  if (gatesFalhos.length >= 2 || temGateCritico) return 'critico'

  return porScore === 'critico' ? 'critico' : 'alto_risco'
}

export function regraMatrizPackingListPorId(id: string): RegraMatrizPackingList | undefined {
  return MATRIZ_VALIDACAO_PACKING_LIST.find((r) => r.id === id)
}
