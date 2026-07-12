/**
 * matriz-validacao-bl-smart-read.ts — SSOT Matriz de Validação do BL / Bill of Lading (v1.0)
 *
 * Documento dedicado ao modal marítimo (BL / MBL / HBL). O modal aéreo tem matriz
 * própria (matriz-validacao-awb-smart-read.ts).
 * Pipeline: OCR → Código (determinístico) → Cross-Doc (matrizes invoice S1–S9 e packing list P1–P9,
 *           e CE-Mercante quando integrado) → API/RAG (anuências, IMDG, AFRMM) → LLM Analista → Score + Gates → UI
 *
 * Base normativa geral: RA (Decreto 6.759/2009) arts. 553, 554–556, 725 e 728 · IN SRF 680/2006 arts. 18, 20, 29, 44/51 ·
 * IN RFB 800/2007 (Siscomex Carga / Mercante) arts. 22 e 44 e Anexos II–IV · DL 37/66 art. 107, IV, "e" ·
 * Lei 10.893/2004 (AFRMM) · SOLAS Cap. VI, Reg. 2 (VGM) · IMDG Code · ISO 6346 · UCP 600 ·
 * Portaria MAPA 514/2022 + NIMF 15 · IN RFB 2.229/2024 (CNPJ alfanumérico) · Layout EDI Mercante v3.2.
 */

export type SecaoMatrizBl =
  | 'identificacao_vias'
  | 'partes_consignacao'
  | 'navio_rota_mercante'
  | 'carga_conteineres_volumes'
  | 'pesos_medidas'
  | 'frete_valores_afrmm'
  | 'dados_ce_mercante'
  | 'regulatorio_clausulas_carga'
  | 'legitimidade_risco'

/** Motores da matriz BL — mesmo conjunto das matrizes S/P/AW (Cross-Doc cruza com S1–S9, P1–P9 e CE-Mercante). */
export type MotorValidacaoBl =
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
 * - `null` — agregador (BL9-05 score / BL9-06 classificação), não é regra avaliável
 */
export type SeveridadeMatrizBl = 'bloq' | 'alerta' | 'info' | 'cond' | null

export type RegraMatrizBl = {
  id: string
  secao: SecaoMatrizBl
  item: string
  motor: MotorValidacaoBl
  severidade: SeveridadeMatrizBl
  /** Gate condicional — BLOQ apenas quando o gatilho existe (ex.: BL8-02 só quando há carga perigosa). */
  gate_condicional?: boolean
  /** Nota técnica para prompt e motor — não exibir direto na UI */
  descricao: string
  /** Texto da tooltip (ícone i) — linguagem do usuário, máx ~90 caracteres */
  tooltip_conferencia: string
  /** Citação normativa que fundamenta a regra */
  base_normativa: string
}

/** Ordem canônica das seções na UI (matriz 1→9). */
export const ORDEM_SECOES_MATRIZ_BL: readonly SecaoMatrizBl[] = [
  'identificacao_vias',
  'partes_consignacao',
  'navio_rota_mercante',
  'carga_conteineres_volumes',
  'pesos_medidas',
  'frete_valores_afrmm',
  'dados_ce_mercante',
  'regulatorio_clausulas_carga',
  'legitimidade_risco',
] as const

export const ROTULO_SECAO_MATRIZ_BL: Record<SecaoMatrizBl, string> = {
  identificacao_vias: '1 — Identificação, natureza e vias',
  partes_consignacao: '2 — Partes e consignação',
  navio_rota_mercante: '3 — Navio, rota e vinculação de carga (Mercante)',
  carga_conteineres_volumes: '4 — Carga, contêineres e volumes',
  pesos_medidas: '5 — Pesos e medidas',
  frete_valores_afrmm: '6 — Frete, valores e AFRMM',
  dados_ce_mercante: '7 — Dados do CE-Mercante',
  regulatorio_clausulas_carga: '8 — Regulatório, anuências e cláusulas de carga',
  legitimidade_risco: '9 — Legitimidade e risco aduaneiro',
}

export const ROTULO_SEVERIDADE_MATRIZ_BL: Record<Exclude<SeveridadeMatrizBl, null>, string> = {
  bloq: 'BLOQ',
  alerta: 'ALERTA',
  info: 'INFO',
  cond: 'COND',
}

/** Matriz completa — fonte única para documentação, testes e orquestração. */
export const MATRIZ_VALIDACAO_BL: RegraMatrizBl[] = [
  // ── Seção 1 — Identificação, natureza e vias ────────────────────────────────
  {
    id: 'BL1-01',
    secao: 'identificacao_vias',
    item: 'Número do BL',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Nº do conhecimento marítimo presente e único',
    tooltip_conferencia: 'Confere o número do conhecimento marítimo',
    base_normativa: 'RA art. 553, I',
  },
  {
    id: 'BL1-02',
    secao: 'identificacao_vias',
    item: 'Tipo: Master × House',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Classificar MBL × HBL; carga consolidada exige o par (master + house) — a DUIMP vincula-se ao CE agregado (house)',
    tooltip_conferencia: 'Identifica se o BL é master ou house — consolidada exige o par',
    base_normativa: 'IN 800/2007, arts. 18–19 (CE genérico e CE agregado; desconsolidação)',
  },
  {
    id: 'BL1-03',
    secao: 'identificacao_vias',
    item: 'Via: original / surrender / seaway',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Identificar via: original negociável (3 originais), surrendered/telex release, sea waybill ou express release; no aquaviário com CE a apresentação física é dispensada, mas a via afeta a liberação',
    tooltip_conferencia: 'Identifica a via do BL (original, surrender, seaway) e seu efeito na liberação',
    base_normativa: 'RA art. 553, I; IN 680/06 art. 18, §2º, "d"',
  },
  {
    id: 'BL1-04',
    secao: 'identificacao_vias',
    item: 'Datas: emissão e shipped on board',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Data de emissão e data de embarque ("shipped/laden on board") presentes; alertar se futuras, emissão < invoice, ou on board anterior à emissão da invoice em Incoterms C/D',
    tooltip_conferencia: 'Valida datas de emissão e de embarque e a ordem cronológica com a invoice',
    base_normativa: 'UCP 600 art. 20 (on board date); coerência com IN 680/06',
  },
  {
    id: 'BL1-05',
    secao: 'identificacao_vias',
    item: 'BL duplicado/revisado',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Detectar dois BLs distintos para o mesmo embarque (reemissão sem cancelamento, correções manuscritas não chanceladas)',
    tooltip_conferencia: 'Detecta conhecimentos conflitantes ou reemitidos para o mesmo embarque',
    base_normativa: 'RA art. 725; IN 680/06 art. 20 (carta de correção limitada a 30 dias / antes do registro)',
  },
  {
    id: 'BL1-06',
    secao: 'identificacao_vias',
    item: 'Paginação e anexos (rider)',
    motor: 'codigo',
    severidade: 'info',
    descricao: 'Total de páginas vs rodapé; riders/attached lists referenciados presentes',
    tooltip_conferencia: 'Confere paginação e presença de anexos (riders) citados no BL',
    base_normativa: 'Integridade documental (IN 680/06 art. 18, §3º)',
  },

  // ── Seção 2 — Partes e consignação ──────────────────────────────────────────
  {
    id: 'BL2-01',
    secao: 'partes_consignacao',
    item: 'Shipper',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Nome/endereço presentes; comparação semântica com exportador da invoice (S2-05) e do PL (P2-01) — divergência legítima em triangulação sinalizada, não reprovada',
    tooltip_conferencia: 'Confere o shipper contra o exportador da invoice e do packing list',
    base_normativa: 'RA art. 553; IN 680/06 art. 29, II; consolida com S3-03/P2-07',
  },
  {
    id: 'BL2-02',
    secao: 'partes_consignacao',
    item: 'Consignee identificado',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Consignee deve identificar o importador (nome + CNPJ) ou ser "to order" com cadeia de endosso completa',
    tooltip_conferencia: 'Verifica se o consignatário identifica o importador ou traz endosso completo',
    base_normativa: 'IN 680/06 art. 29, II; RA arts. 554–556 (endosso)',
  },
  {
    id: 'BL2-03',
    secao: 'partes_consignacao',
    item: '"To order" / endosso',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Se "to order (of shipper/bank)": verificar endosso no verso ou menção a endosso bancário; transferência por endosso exige comprovação da transação (dispensada no endosso bancário)',
    tooltip_conferencia: 'Verifica a cadeia de endosso quando o BL é "à ordem"',
    base_normativa: 'IN 680/06 art. 18, §§4º–5º; RA art. 556',
  },
  {
    id: 'BL2-04',
    secao: 'partes_consignacao',
    item: 'Notify party',
    motor: 'cross_doc',
    severidade: 'info',
    descricao: 'Notify coerente com importador/despachante e com S2-09/P2-04',
    tooltip_conferencia: 'Confere o notify party contra os demais documentos',
    base_normativa: 'Praxe documental; coerência do trio documental',
  },
  {
    id: 'BL2-05',
    secao: 'partes_consignacao',
    item: 'CNPJ no BL — máscara',
    motor: 'codigo',
    severidade: 'cond',
    descricao:
      'Quando impresso: 14 posições numérico OU alfanumérico (letras maiúsculas A–Z nas 12 primeiras) + DV Módulo 11 com conversão ASCII−48; DV numérico. CNPJ alfa com data anterior a 31/07/2026 = red flag OCR/fraude',
    tooltip_conferencia: 'Valida o CNPJ do consignatário (numérico ou alfanumérico) quando presente',
    base_normativa: 'IN RFB 2.229/2024 (vigência 31/07/2026); IN 800/2007 Anexos III–IV; IN RFB 2119/2022',
  },
  {
    id: 'BL2-05b',
    secao: 'partes_consignacao',
    item: 'Estabelecimento consignatário = declarante',
    motor: 'cross_doc',
    severidade: 'bloq',
    gate_condicional: true,
    descricao:
      'CNPJ de 14 posições (raiz + ordem/filial + DV) — raiz de 8 não identifica estabelecimento — apontando o mesmo estabelecimento que registrará a DUIMP; matriz (/0001) × filial trava a vinculação da carga no Mercante',
    tooltip_conferencia:
      'Confere se o estabelecimento consignado no CE é o mesmo que declara — divergência matriz/filial trava a vinculação',
    base_normativa:
      'IN 680/06 arts. 15, VI e 44 (vinculação NIC↔CE); IN 800/2007 (consignatário 14 posições); Dicionário DI/RFB',
  },
  {
    id: 'BL2-06',
    secao: 'partes_consignacao',
    item: 'Agente / NVOCC / desconsolidador',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Em HBL: identificar o agente de carga emissor; responsável pela desconsolidação no Mercante (prazo de 48h)',
    tooltip_conferencia:
      'Identifica o agente de carga emissor do house e responsável pela desconsolidação',
    base_normativa: 'IN 800/2007, arts. 2º–4º e 18',
  },

  // ── Seção 3 — Navio, rota e vinculação de carga (Mercante) ─────────────────
  {
    id: 'BL3-01',
    secao: 'navio_rota_mercante',
    item: 'Navio e viagem',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Nome do navio + nº da viagem presentes',
    tooltip_conferencia: 'Confere identificação do navio e da viagem',
    base_normativa: 'IN 800/2007 (escala/manifesto)',
  },
  {
    id: 'BL3-02',
    secao: 'navio_rota_mercante',
    item: 'Portos: POL, POD, destino',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Porto de embarque (POL), descarga (POD) e destino final presentes; coerentes com o local do Incoterm (S3-01/S3-02) e o PL (P3-04)',
    tooltip_conferencia: 'Cruza portos do BL com o Incoterm e a rota dos demais documentos',
    base_normativa: 'RA art. 553; coerência geográfica',
  },
  {
    id: 'BL3-03',
    secao: 'navio_rota_mercante',
    item: 'Transbordo / baldeação',
    motor: 'llm',
    severidade: 'info',
    descricao:
      'Transbordo declarado (transshipment port); no Mercante o CE deve ser associado a novo manifesto no transbordo',
    tooltip_conferencia: 'Detecta transbordo e seu reflexo na associação de manifesto',
    base_normativa: 'IN 800/2007, art. 20',
  },
  {
    id: 'BL3-04',
    secao: 'navio_rota_mercante',
    item: 'Coerência marítima do Incoterm',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Incoterm compatível com marítimo: FAS/FOB/CFR/CIF são exclusivos aquaviário; se a invoice traz EXW/FCA/CPT/CIP/DAP/DPU/DDP, verificar coerência com a natureza da carga (contêiner/break bulk)',
    tooltip_conferencia: 'Verifica coerência entre o Incoterm da invoice e o modal marítimo',
    base_normativa: 'Incoterms® 2020 (FAS/FOB/CFR/CIF exclusivos aquaviário); IN 680/06 art. 15, VI',
  },
  {
    id: 'BL3-05',
    secao: 'navio_rota_mercante',
    item: 'Nº do CE-Mercante / RUC',
    motor: 'codigo',
    severidade: 'cond',
    descricao: 'Quando citado: CE com 15 dígitos; RUC no padrão; cruzar com o CE do processo',
    tooltip_conferencia: 'Valida número do CE-Mercante e RUC quando presentes',
    base_normativa: 'IN 800/2007 (CE); Portal Único (RUC)',
  },
  {
    id: 'BL3-06',
    secao: 'navio_rota_mercante',
    item: 'Um conhecimento ↔ uma declaração',
    motor: 'rag',
    severidade: 'info',
    descricao:
      'Um BL ↔ uma DUIMP (exceções: petróleo a granel, nova adição — IN 680 arts. 67/68); múltiplas invoices num BL exigem atenção ao registro',
    tooltip_conferencia: 'Verifica a regra de um conhecimento por declaração e exceções',
    base_normativa: 'RA arts. 554–555; IN 680/06 arts. 67–68',
  },
  {
    id: 'BL3-07',
    secao: 'navio_rota_mercante',
    item: 'Prazos Siscarga — exposição',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Com ETA disponível: alertar janela de 48h antes da atracação (manifesto e desconsolidação HBL; rotas de exceção reduzidas) — atraso/retificação extemporânea = R$ 5.000 por ocorrência + bloqueio automático',
    tooltip_conferencia: 'Alerta a janela de 48h do Mercante e o risco de multa e bloqueio',
    base_normativa: 'IN 800/2007, arts. 22 e 44; DL 37/66 art. 107, IV, "e"',
  },

  // ── Seção 4 — Carga, contêineres e volumes ──────────────────────────────────
  {
    id: 'BL4-01',
    secao: 'carga_conteineres_volumes',
    item: 'Descrição da mercadoria',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Descrição que identifique a mercadoria; rejeitar "said to contain" sem descrição mínima e genéricos absolutos ("cargo", "goods")',
    tooltip_conferencia: 'Exige descrição que identifique a mercadoria — rejeita genéricos absolutos',
    base_normativa: 'IN 680/06 art. 29, II; RA art. 553',
  },
  {
    id: 'BL4-02',
    secao: 'carga_conteineres_volumes',
    item: 'Quantidade e espécie de volumes',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Nº de volumes + espécie (packages, pallets, cartons); inteiro > 0',
    tooltip_conferencia: 'Confere quantidade e espécie de volumes',
    base_normativa: 'IN 800/2007, Anexo IV; RA art. 557 (analogia)',
  },
  {
    id: 'BL4-03',
    secao: 'carga_conteineres_volumes',
    item: 'Contêineres ISO 6346',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Todos os contêineres no padrão ISO (4 letras + 7 dígitos, dígito verificador); sem duplicidade; type code coerente com a carga (reefer, OT, FR, tank)',
    tooltip_conferencia: 'Valida números de contêiner ISO 6346 e o tipo de equipamento',
    base_normativa: 'ISO 6346; IN 800/2007',
  },
  {
    id: 'BL4-04',
    secao: 'carga_conteineres_volumes',
    item: 'Lacres por contêiner',
    motor: 'codigo',
    severidade: 'cond',
    descricao: 'Em FCL: lacre por contêiner; cruzar com o PL (P3-06)',
    tooltip_conferencia: 'Exige número de lacre por contêiner em carga FCL',
    base_normativa: 'IN 800/2007; alteração de lacre em procedimento fiscal',
  },
  {
    id: 'BL4-05',
    secao: 'carga_conteineres_volumes',
    item: 'Contagem em dois níveis',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Volumes do BL vs PL/invoice reconhecendo níveis (pallets × caixas internas) — espelho de P3-07/S7-02',
    tooltip_conferencia: 'Compara volumes com os demais documentos reconhecendo pallets vs caixas',
    base_normativa: 'IN 680/06 arts. 18 e 29; evita travas no Mercante',
  },
  {
    id: 'BL4-06',
    secao: 'carga_conteineres_volumes',
    item: 'Marcas (shipping marks)',
    motor: 'llm',
    severidade: 'info',
    descricao: 'Marcas e números coerentes com o PL (P4-04)',
    tooltip_conferencia: 'Confere marcas dos volumes contra o packing list',
    base_normativa: 'RA art. 557 (analogia); IN 680/06 art. 27',
  },
  {
    id: 'BL4-07',
    secao: 'carga_conteineres_volumes',
    item: 'FCL/LCL × equipamento',
    motor: 'codigo',
    severidade: 'cond',
    descricao:
      'Regime declarado (FCL/FCL, LCL/LCL, CY/CY, CFS) coerente: LCL não deveria listar contêiner exclusivo com lacre do shipper; FCL exige contêiner(es)',
    tooltip_conferencia: 'Verifica coerência entre regime FCL/LCL e equipamentos',
    base_normativa: 'Praxe de transporte; IN 800/2007 (LCL/carga solta)',
  },
  {
    id: 'BL4-08',
    secao: 'carga_conteineres_volumes',
    item: 'Break bulk / carga solta',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Carga não conteinerizada (break bulk, RoRo): dimensões e peça-a-peça declarados; sem contêiner ISO obrigatório',
    tooltip_conferencia: 'Reconhece carga solta/break bulk e ajusta a exigência de contêiner',
    base_normativa: 'IN 800/2007 (carga solta); praxe portuária',
  },

  // ── Seção 5 — Pesos e medidas ───────────────────────────────────────────────
  {
    id: 'BL5-01',
    secao: 'pesos_medidas',
    item: 'Peso bruto',
    motor: 'codigo',
    severidade: 'alerta',
    descricao: 'Gross weight total (e por contêiner quando multi) presente; > 0',
    tooltip_conferencia: 'Exige peso bruto declarado no BL',
    base_normativa: 'IN 800/2007, Anexo IV; IN 680/06 art. 29, IV',
  },
  {
    id: 'BL5-02',
    secao: 'pesos_medidas',
    item: 'Cubagem (measurement)',
    motor: 'codigo',
    severidade: 'cond',
    descricao: 'Measurement (m³) presente, sobretudo em LCL; base de frete W/M',
    tooltip_conferencia: 'Valida cubagem, sobretudo em carga LCL',
    base_normativa: 'IN 800/2007 (cubagem no CE); praxe de frete peso/medida',
  },
  {
    id: 'BL5-03',
    secao: 'pesos_medidas',
    item: 'BL × PL × Invoice — pesos',
    motor: 'cross_doc',
    severidade: 'bloq',
    descricao:
      'Gross do BL vs PL (P5-06) e invoice (S7-07): amarelo ≥ 2%, gate > 5% por unidade de carga',
    tooltip_conferencia: 'Cruza o peso bruto com packing list e invoice — gate acima de 5%',
    base_normativa:
      'IN 680/06 art. 29, IV; jurisprudência TRF3 (divergência grosseira → perdimento)',
  },
  {
    id: 'BL5-04',
    secao: 'pesos_medidas',
    item: 'VGM / payload',
    motor: 'codigo',
    severidade: 'bloq',
    descricao:
      'Peso bruto por contêiner ≤ payload do type code ISO; VGM (SOLAS) citado deve casar com o gross (espelho de P3-09)',
    tooltip_conferencia: 'Confere peso por contêiner contra payload máximo e VGM',
    base_normativa: 'SOLAS Cap. VI, Reg. 2; ISO 6346 (type codes)',
  },
  {
    id: 'BL5-05',
    secao: 'pesos_medidas',
    item: 'Consistência de unidades',
    motor: 'codigo',
    severidade: 'bloq',
    descricao:
      'Mistura kg/lbs, m³/cft, kg/ton no documento ou vs PL/invoice (fatores ~2,20× / ~35,3× / ~1.000×)',
    tooltip_conferencia: 'Detecta mistura de sistemas de unidades',
    base_normativa: 'Art. 725 RA; espelho de P4-08/S7-06',
  },
  {
    id: 'BL5-06',
    secao: 'pesos_medidas',
    item: 'Densidade / capacidade do contêiner',
    motor: 'llm',
    severidade: 'info',
    descricao:
      'Densidade por contêiner plausível (consolida com P5-08); m³ declarado > capacidade do equipamento = alerta',
    tooltip_conferencia: 'Analisa densidade e capacidade volumétrica por contêiner',
    base_normativa: 'Física da carga; capacidade por type code ISO',
  },

  // ── Seção 6 — Frete, valores e AFRMM ────────────────────────────────────────
  {
    id: 'BL6-01',
    secao: 'frete_valores_afrmm',
    item: 'Freight prepaid × collect',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Cláusula de frete coerente com o Incoterm: C/D (CFR, CIF, CPT, CIP, DAP, DPU, DDP) → prepaid; E/F (EXW, FCA, FAS, FOB) → collect. Divergência é red flag de valoração',
    tooltip_conferencia: 'Cruza prepaid/collect com o Incoterm — divergência é red flag',
    base_normativa: 'Incoterms® 2020; AVA-GATT art. 8º, 2',
  },
  {
    id: 'BL6-02',
    secao: 'frete_valores_afrmm',
    item: 'Valor do frete e componentes',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Frete e sobretaxas (BAF, CAF, THC origem etc.) discriminados quando expressos; base do AFRMM e da valoração',
    tooltip_conferencia: 'Extrai valor do frete e componentes — base do AFRMM e da valoração',
    base_normativa:
      'Lei 10.893/2004; IN 800/2007 Anexo IV; jurisprudência (retificação de frete fora do prazo → R$ 5.000)',
  },
  {
    id: 'BL6-03',
    secao: 'frete_valores_afrmm',
    item: 'Moeda do frete',
    motor: 'codigo',
    severidade: 'cond',
    descricao:
      'Moeda ISO 4217 quando o frete é expresso; coerente com a invoice (S5-05/S5-07)',
    tooltip_conferencia: 'Valida a moeda do frete e a coerência com a invoice',
    base_normativa: 'ISO 4217; base de conversão (RA art. 97)',
  },
  {
    id: 'BL6-04',
    secao: 'frete_valores_afrmm',
    item: 'AFRMM — exposição',
    motor: 'rag',
    severidade: 'info',
    descricao:
      'Longo curso: sinalizar AFRMM (8% do frete) e a verificação de regularidade antes da entrega; identificar isenção/suspensão (ZFM, Reporto, acordos)',
    tooltip_conferencia: 'Sinaliza incidência de AFRMM e isenções antes da entrega',
    base_normativa: 'Lei 10.893/2004 (red. Lei 14.301/2022); IN 680/06 art. 51',
  },
  {
    id: 'BL6-05',
    secao: 'frete_valores_afrmm',
    item: 'Bloqueio por frete no Mercante',
    motor: 'rag',
    severidade: 'info',
    descricao:
      'Pendência de pagamento de frete no CE bloqueia a entrega final da carga pelo depositário',
    tooltip_conferencia: 'Alerta que pendência de frete no CE bloqueia a entrega da carga',
    base_normativa: 'IN 680/06 art. 56, I (consulta obrigatória do depositário); IN 800/2007',
  },

  // ── Seção 7 — Dados do CE-Mercante (documento × sistema) ────────────────────
  {
    id: 'BL7-01',
    secao: 'dados_ce_mercante',
    item: 'NCM no CE',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'NCM informado no CE (Anexo IV da IN 800) vs pré-classificação da invoice (S4-03) — a exigência de NCM existe no CE, não na fatura; divergência antecipa exigência na DUIMP',
    tooltip_conferencia: 'Cruza o NCM do CE com a pré-classificação da invoice',
    base_normativa: 'IN 800/2007, Anexo IV; Manual RFB',
  },
  {
    id: 'BL7-02',
    secao: 'dados_ce_mercante',
    item: 'Consignatário do CE',
    motor: 'cross_doc',
    severidade: 'bloq',
    gate_condicional: true,
    descricao:
      'CNPJ do consignatário no CE = importador da DUIMP (ou endosso regular) — carga não vinculável impede o registro',
    tooltip_conferencia:
      'Confere o CNPJ do consignatário no CE contra o importador da declaração',
    base_normativa: 'IN 680/06 arts. 15, VI e 44; IN 800/2007',
  },
  {
    id: 'BL7-03',
    secao: 'dados_ce_mercante',
    item: 'Validação pré-DUIMP',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Checklist antes de submeter a DUIMP: NCM, frete, RUC e consignatário do CE conferidos — após a submissão o CE fica bloqueado para alteração',
    tooltip_conferencia:
      'Alerta a conferência do CE (NCM, frete, RUC, consignatário) antes da DUIMP',
    base_normativa: 'Portal Único/DUIMP; IN 680/06 art. 4º-A',
  },
  {
    id: 'BL7-04',
    secao: 'dados_ce_mercante',
    item: 'Carta de correção — janela',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Correção com efeitos fiscais: só antes do registro da DI e dentro de 30 dias; fora disso, retificação formal (com risco de multa se extemporânea)',
    tooltip_conferencia: 'Alerta a janela legal para carta de correção do conhecimento',
    base_normativa: 'IN 680/06 art. 20; DL 37/66 art. 107, IV, "e"',
  },
  {
    id: 'BL7-05',
    secao: 'dados_ce_mercante',
    item: 'Desconsolidação completa',
    motor: 'cross_doc',
    severidade: 'cond',
    descricao:
      'Consolidada: todo HBL com MBL correspondente e vice-versa; DTA/DI sobre CE genérico só após desconsolidação prestada',
    tooltip_conferencia: 'Verifica o par master/house e a conclusão da desconsolidação',
    base_normativa: 'IN 800/2007, arts. 18–19 e 22, III',
  },

  // ── Seção 8 — Regulatório, anuências e cláusulas de carga ───────────────────
  {
    id: 'BL8-01',
    secao: 'regulatorio_clausulas_carga',
    item: 'Madeira declarada',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'O BL deve informar presença/ausência de embalagens/suportes de madeira e se tratada/certificada (consolida com P8-01/S7-03)',
    tooltip_conferencia: 'Verifica declaração de madeira no conhecimento',
    base_normativa: 'Portaria MAPA 514/2022; NIMF 15',
  },
  {
    id: 'BL8-02',
    secao: 'regulatorio_clausulas_carga',
    item: 'Carga perigosa IMDG — dados',
    motor: 'rag',
    severidade: 'bloq',
    gate_condicional: true,
    descricao:
      'DG detectada: UN number, proper shipping name, classe, packing group, EmS e flashpoint obrigatórios; "shipper\'s declaration" (DGD) referenciada',
    tooltip_conferencia: 'Exige UN, classe e packing group no BL quando a carga é perigosa',
    base_normativa:
      'IMDG Code (declaração no B/L); Res. ANTT 5.998/2022 (pré/pós-porto); NBR 7500',
  },
  {
    id: 'BL8-03',
    secao: 'regulatorio_clausulas_carga',
    item: 'Carga refrigerada / temperatura',
    motor: 'llm',
    severidade: 'cond',
    descricao:
      'Reefer (type code R): set point de temperatura, ventilação e umidade declarados; coerente com produto (ANVISA/MAPA)',
    tooltip_conferencia: 'Confere temperatura declarada em reefer e coerência com o produto',
    base_normativa: 'Praxe reefer; RDC 81/2008; Vigiagro',
  },
  {
    id: 'BL8-04',
    secao: 'regulatorio_clausulas_carga',
    item: 'OOG / project cargo',
    motor: 'codigo',
    severidade: 'cond',
    descricao: 'Flat rack/open top com excesso (OOG): dimensões de excesso declaradas',
    tooltip_conferencia: 'Verifica dimensões excedentes em carga OOG',
    base_normativa: 'Praxe portuária; peação',
  },
  {
    id: 'BL8-05',
    secao: 'regulatorio_clausulas_carga',
    item: 'Anuências por NCM',
    motor: 'cross_doc_rag',
    severidade: 'cond',
    descricao:
      'NCM do CE/invoice sujeito a anuente (ANVISA, MAPA, ANATEL, INMETRO, Exército, IBAMA, CNEN, PF): sinalizar LPCO e contradições no BL',
    tooltip_conferencia: 'Sinaliza anuências pelo NCM e contradições no conhecimento',
    base_normativa: 'Tratamento administrativo Portal Único; mesma tabela RAG das matrizes S/P',
  },
  {
    id: 'BL8-06',
    secao: 'regulatorio_clausulas_carga',
    item: 'Cláusulas restritivas',
    motor: 'llm',
    severidade: 'info',
    descricao:
      '"Clean on board" × cláusulas de ressalva (claused/foul — avaria, embalagem insuficiente): ressalvas afetam seguro/valoração',
    tooltip_conferencia: 'Detecta ressalvas no BL — indício de avaria ou embalagem insuficiente',
    base_normativa: 'UCP 600 art. 27; RA art. 71 (avaria/falta na descarga)',
  },

  // ── Seção 9 — Legitimidade e risco aduaneiro ────────────────────────────────
  {
    id: 'BL9-01',
    secao: 'legitimidade_risco',
    item: 'Assinatura do transportador/agente',
    motor: 'llm',
    severidade: 'alerta',
    descricao:
      'Assinado pelo transportador, comandante ou agente ("as carrier" / "as agent for the carrier")',
    tooltip_conferencia: 'Verifica assinatura do transportador ou agente no BL',
    base_normativa: 'RA art. 553, I; praxe marítima',
  },
  {
    id: 'BL9-02',
    secao: 'legitimidade_risco',
    item: 'Legibilidade e integridade',
    motor: 'llm',
    severidade: 'alerta',
    descricao: 'Legível, sem rasuras não chanceladas ou sinais de adulteração',
    tooltip_conferencia: 'Avalia legibilidade e sinais de adulteração no BL',
    base_normativa: 'DL 1.455/76 art. 23 (falsidade → perdimento)',
  },
  {
    id: 'BL9-03',
    secao: 'legitimidade_risco',
    item: 'Coerência global do trio',
    motor: 'cross_doc',
    severidade: 'alerta',
    descricao:
      'Parecer único consolidando invoice × PL × BL: partes, volumes, pesos, rota, frete/Incoterm, madeira e DG',
    tooltip_conferencia: 'Consolida a coerência entre invoice, packing list e conhecimento',
    base_normativa: 'RA art. 553; IN 680/06 arts. 18 e 29',
  },
  {
    id: 'BL9-04',
    secao: 'legitimidade_risco',
    item: 'Risco de penalidade e bloqueio',
    motor: 'codigo',
    severidade: 'alerta',
    descricao:
      'Consolidar exposições: informação/retificação fora do prazo (R$ 5.000 por ocorrência), bloqueio automático, inexatidão (art. 725), demurrage/armazenagem',
    tooltip_conferencia: 'Consolida risco de multa de R$ 5.000, bloqueio e custos decorrentes',
    base_normativa: 'DL 37/66 art. 107, IV, "e"; IN 800/2007 arts. 22 e 44; Súmula CARF 126',
  },
  {
    id: 'BL9-05',
    secao: 'legitimidade_risco',
    item: 'Score documental',
    motor: 'codigo',
    severidade: null,
    descricao:
      'Score 0–100 sobre regras ALERTA/INFO aplicáveis (COND não disparadas = N/A, fora do score)',
    tooltip_conferencia: 'Pontuação de qualidade documental do BL',
    base_normativa: 'Metodologia interna',
  },
  {
    id: 'BL9-06',
    secao: 'legitimidade_risco',
    item: 'Classificação de risco (gates + score)',
    motor: 'codigo',
    severidade: null,
    descricao:
      'Pior entre score e gates. Qualquer BLOQ falho ⇒ mínimo "Alto risco". Gates: BL1-05, BL2-02, BL2-05b, BL3-04, BL5-03, BL5-04, BL5-05, BL7-02, BL8-02',
    tooltip_conferencia: 'Classificação final combinando gates e pontuação',
    base_normativa: 'Metodologia interna',
  },
]

/** IDs das regras BLOQ que atuam como gate na classificação final (BL9-06). */
export const GATES_MATRIZ_BL: readonly string[] = MATRIZ_VALIDACAO_BL.filter(
  (regra) => regra.severidade === 'bloq',
).map((regra) => regra.id)

/**
 * Gates cuja falha isolada já classifica o documento como Crítico (BL9-06):
 * BL7-02 (consignatário do CE não vinculável), BL2-05b (estabelecimento matriz/filial
 * divergente) e BL5-03 (divergência de peso > 5%).
 */
export const GATES_CRITICOS_MATRIZ_BL: readonly string[] = ['BL7-02', 'BL2-05b', 'BL5-03']

export type ClassificacaoRiscoBl = 'baixo_risco' | 'atencao' | 'alto_risco' | 'critico'

export const ROTULO_CLASSIFICACAO_RISCO_BL: Record<ClassificacaoRiscoBl, string> = {
  baixo_risco: 'Baixo risco',
  atencao: 'Atenção',
  alto_risco: 'Alto risco',
  critico: 'Crítico',
}

/** Faixas do score — aplicáveis somente quando nenhum gate falhou. */
export function classificacaoPorFaixaScoreBl(score: number): ClassificacaoRiscoBl {
  if (score >= 95) return 'baixo_risco'
  if (score >= 80) return 'atencao'
  if (score >= 60) return 'alto_risco'
  return 'critico'
}

/**
 * Regra de rebaixamento (BL9-06): 1 gate falho ⇒ mínimo "Alto risco";
 * 2+ gates falhos ou gate BL7-02/BL2-05b/BL5-03 ⇒ "Crítico". O score nunca
 * eleva a classificação acima do teto imposto pelos gates.
 */
export function classificacaoRiscoBl(
  score: number,
  gatesFalhos: readonly string[],
): ClassificacaoRiscoBl {
  const porScore = classificacaoPorFaixaScoreBl(score)
  if (gatesFalhos.length === 0) return porScore

  const temGateCritico = gatesFalhos.some((id) => GATES_CRITICOS_MATRIZ_BL.includes(id))
  if (gatesFalhos.length >= 2 || temGateCritico) return 'critico'

  return porScore === 'critico' ? 'critico' : 'alto_risco'
}

export function regraMatrizBlPorId(id: string): RegraMatrizBl | undefined {
  return MATRIZ_VALIDACAO_BL.find((r) => r.id === id)
}
