export type PeriodoPresetSimulador = 7 | 30 | 60 | 90

export type PontoChartDiaSimulador = {
  date: string
  val: number
  documentos: number
  acertos: number
  erros: number
}

export type TipoParticipanteSimulador =
  | 'exportador'
  | 'agente_carga'
  | 'transportadora_rodoviaria'
  | 'armazem_alfandegado'
  | 'despachante_aduaneiro'

export type MetricasPeriodoSimulador = {
  amostraLeituras: number
  totalDocumentos: number
  totalCampos: number
  camposCorretos: number
  camposErrados: number
  taxaAcerto: number
  tiposDocumento: number
  savingDigitaçãoMinutos: number
  savingErrosMinutos: number
}

export type TipoDocumentoSimulador = {
  label: string
  val: number
  pct: number
  w: string
}

export type RankingFornecedorSimulador = {
  name: string
  stats: string
  pct: string
}

export type RankingErroSimulador = {
  name: string
  stats: string
  err: string
}

export type LeituraListaSimulador = {
  id: string
  nome: string
  status: 'Conferido' | 'Processando' | 'Rascunho'
  docs: number
  data: string
  camposExtraidos: number
  camposConferidos: number
}

export type PerfilEmpresaSimulador = {
  id: string
  nome: string
  plano: string
  mesesUso: number
  leiturasPorMes: number
  metricasPorPeriodo: Record<PeriodoPresetSimulador, MetricasPeriodoSimulador>
  chartPorPeriodo: Record<PeriodoPresetSimulador, PontoChartDiaSimulador[]>
  tiposDocumentoPorPeriodo: Record<PeriodoPresetSimulador, TipoDocumentoSimulador[]>
  rankingsPorTipo: Record<
    TipoParticipanteSimulador,
    { acertos: RankingFornecedorSimulador[]; erros: RankingErroSimulador[] }
  >
  listaLeituras: LeituraListaSimulador[]
}

function pontoChart(
  date: string,
  campos: number,
  documentos: number,
  taxaAcertoPct: number,
): PontoChartDiaSimulador {
  const acertos = Math.round(campos * (taxaAcertoPct / 100))
  const erros = Math.max(0, campos - acertos)
  return { date, val: campos, documentos, acertos, erros }
}

function metricasDePontos(
  pontos: PontoChartDiaSimulador[],
  leituras: number,
  tiposDocumento: number,
  savingDigitaçãoMinutos: number,
  savingErrosMinutos: number,
): MetricasPeriodoSimulador {
  const totalCampos = pontos.reduce((acc, p) => acc + p.val, 0)
  const camposCorretos = pontos.reduce((acc, p) => acc + p.acertos, 0)
  const camposErrados = pontos.reduce((acc, p) => acc + p.erros, 0)
  const totalDocumentos = pontos.reduce((acc, p) => acc + p.documentos, 0)
  const taxaAcerto = totalCampos > 0 ? (camposCorretos / totalCampos) * 100 : 0

  return {
    amostraLeituras: leituras,
    totalDocumentos,
    totalCampos,
    camposCorretos,
    camposErrados,
    taxaAcerto,
    tiposDocumento,
    savingDigitaçãoMinutos,
    savingErrosMinutos,
  }
}

function tiposDocumentoDeVolume(
  totalDocumentos: number,
  distribuicao: { label: string; pct: number }[],
): TipoDocumentoSimulador[] {
  const itens = distribuicao.map((item) => {
    const val = Math.round(totalDocumentos * (item.pct / 100))
    return { label: item.label, val, pct: item.pct, w: `${item.pct}%` }
  })
  const maior = Math.max(...itens.map((i) => i.val), 1)
  return itens.map((item) => ({
    ...item,
    w: `${Math.max(12, Math.round((item.val / maior) * 100))}%`,
  }))
}

const DISTRIBUICAO_TIPOS = [
  { label: 'Invoice', pct: 44 },
  { label: 'Packing List', pct: 30 },
  { label: 'Bill of Lading', pct: 17 },
  { label: 'AWB', pct: 9 },
]

/** Cliente maduro: ~1.000 leituras/mês, 12 meses de uso, acerto médio 89–93% com variação. */
const CHART_FILIAL_SC_7D: PontoChartDiaSimulador[] = [
  pontoChart('30/06', 2840, 52, 90.2),
  pontoChart('01/07', 2180, 40, 91.5),
  pontoChart('02/07', 3120, 58, 92.8),
  pontoChart('03/07', 1650, 31, 89.1),
  pontoChart('04/07', 2980, 55, 91.0),
  pontoChart('05/07', 1120, 21, 93.2),
  pontoChart('06/07', 1240, 23, 90.6),
]

const CHART_FILIAL_SC_30D: PontoChartDiaSimulador[] = [
  pontoChart('09/06', 14280, 248, 90.4),
  pontoChart('16/06', 15840, 276, 91.1),
  pontoChart('23/06', 17120, 298, 92.0),
  pontoChart('30/06', 14960, 261, 89.8),
  pontoChart('06/07', 15130, 280, 91.2),
]

const CHART_FILIAL_SC_60D: PontoChartDiaSimulador[] = [
  pontoChart('Mai', 61200, 1068, 89.6),
  pontoChart('Jun', 68400, 1192, 90.8),
  pontoChart('Jul', 71780, 1248, 91.2),
]

const CHART_FILIAL_SC_90D: PontoChartDiaSimulador[] = [
  pontoChart('Abr', 52800, 920, 89.2),
  pontoChart('Mai', 61200, 1068, 89.6),
  pontoChart('Jun', 68400, 1192, 90.8),
  pontoChart('Jul', 47850, 832, 91.4),
]

const RANKINGS_FILIAL_SC: PerfilEmpresaSimulador['rankingsPorTipo'] = {
  exportador: {
    acertos: [
      { name: 'LUEN TAI P.C.B. FACTORY CO., LTD.', stats: '142 doc. · 6120 ✓ · 420 ✗', pct: '93.6%' },
      { name: 'Guangzhou Textiles Import Co.', stats: '98 doc. · 4010 ✓ · 310 ✗', pct: '92.8%' },
      { name: 'Shenzhen Electronics Ltd.', stats: '186 doc. · 7820 ✓ · 890 ✗', pct: '89.8%' },
      { name: 'Ningbo Precision Parts SA', stats: '76 doc. · 3180 ✓ · 360 ✗', pct: '89.8%' },
    ],
    erros: [
      { name: 'Shenzhen Electronics Ltd.', stats: '186 doc. · 7820 ✓ · 890 ✗', err: '890 err.' },
      { name: 'Ningbo Precision Parts SA', stats: '76 doc. · 3180 ✓ · 360 ✗', err: '360 err.' },
      { name: 'LUEN TAI P.C.B. FACTORY CO., LTD.', stats: '142 doc. · 6120 ✓ · 420 ✗', err: '420 err.' },
      { name: 'Guangzhou Textiles Import Co.', stats: '98 doc. · 4010 ✓ · 310 ✗', err: '310 err.' },
    ],
  },
  agente_carga: {
    acertos: [
      { name: 'Maersk Logistics Asia', stats: '84 doc. · 4820 ✓ · 280 ✗', pct: '93.1%' },
      { name: 'DHL Global Forwarding', stats: '62 doc. · 3540 ✓ · 310 ✗', pct: '91.9%' },
      { name: 'MSC Agency Brazil', stats: '58 doc. · 3180 ✓ · 290 ✗', pct: '91.6%' },
      { name: 'CMA CGM São Paulo', stats: '44 doc. · 2280 ✓ · 260 ✗', pct: '89.8%' },
    ],
    erros: [
      { name: 'DHL Global Forwarding', stats: '62 doc. · 3540 ✓ · 310 ✗', err: '310 err.' },
      { name: 'MSC Agency Brazil', stats: '58 doc. · 3180 ✓ · 290 ✗', err: '290 err.' },
      { name: 'CMA CGM São Paulo', stats: '44 doc. · 2280 ✓ · 260 ✗', err: '260 err.' },
      { name: 'Maersk Logistics Asia', stats: '84 doc. · 4820 ✓ · 280 ✗', err: '280 err.' },
    ],
  },
  transportadora_rodoviaria: {
    acertos: [
      { name: 'Transcargo Rodoviário SP', stats: '28 doc. · 1240 ✓ · 110 ✗', pct: '91.9%' },
      { name: 'Rodolog Brasil Transportes', stats: '19 doc. · 820 ✓ · 95 ✗', pct: '89.6%' },
    ],
    erros: [
      { name: 'Rodolog Brasil Transportes', stats: '19 doc. · 820 ✓ · 95 ✗', err: '95 err.' },
      { name: 'Transcargo Rodoviário SP', stats: '28 doc. · 1240 ✓ · 110 ✗', err: '110 err.' },
    ],
  },
  armazem_alfandegado: {
    acertos: [
      { name: 'Terminal Santos Bonded', stats: '36 doc. · 1680 ✓ · 140 ✗', pct: '92.3%' },
      { name: 'Recinto Itajaí Logística', stats: '22 doc. · 980 ✓ · 118 ✗', pct: '89.3%' },
    ],
    erros: [
      { name: 'Recinto Itajaí Logística', stats: '22 doc. · 980 ✓ · 118 ✗', err: '118 err.' },
      { name: 'Terminal Santos Bonded', stats: '36 doc. · 1680 ✓ · 140 ✗', err: '140 err.' },
    ],
  },
  despachante_aduaneiro: {
    acertos: [
      { name: 'Despachante Alfa COMEX', stats: '18 doc. · 740 ✓ · 82 ✗', pct: '90.0%' },
      { name: 'Aduaneira Costa Sul', stats: '14 doc. · 610 ✓ · 74 ✗', pct: '89.2%' },
    ],
    erros: [
      { name: 'Aduaneira Costa Sul', stats: '14 doc. · 610 ✓ · 74 ✗', err: '74 err.' },
      { name: 'Despachante Alfa COMEX', stats: '18 doc. · 740 ✓ · 82 ✗', err: '82 err.' },
    ],
  },
}

const LISTA_FILIAL_SC: LeituraListaSimulador[] = [
  { id: '1', nome: 'Invoice #INV-2026-4482 — PO 9821', status: 'Conferido', docs: 3, data: '06/07/2026', camposExtraidos: 128, camposConferidos: 117 },
  { id: '2', nome: 'Packing List — Master Trade Asia', status: 'Processando', docs: 2, data: '06/07/2026', camposExtraidos: 94, camposConferidos: 86 },
  { id: '3', nome: 'BL SUDU198276-2 · MSC', status: 'Conferido', docs: 1, data: '05/07/2026', camposExtraidos: 86, camposConferidos: 79 },
  { id: '4', nome: 'AWB 176-48291044', status: 'Conferido', docs: 1, data: '05/07/2026', camposExtraidos: 54, camposConferidos: 50 },
  { id: '5', nome: 'Invoice + PL — LUEN TAI lote 44', status: 'Conferido', docs: 2, data: '04/07/2026', camposExtraidos: 88, camposConferidos: 81 },
  { id: '6', nome: 'Proforma — Shenzhen Electronics', status: 'Rascunho', docs: 1, data: '04/07/2026', camposExtraidos: 36, camposConferidos: 0 },
  { id: '7', nome: 'BL + Invoice — DHL booking 7712', status: 'Conferido', docs: 2, data: '03/07/2026', camposExtraidos: 112, camposConferidos: 102 },
  { id: '8', nome: 'Packing List — Ningbo Precision', status: 'Conferido', docs: 1, data: '02/07/2026', camposExtraidos: 46, camposConferidos: 41 },
  { id: '9', nome: 'Invoice #INV-2026-4410', status: 'Conferido', docs: 1, data: '01/07/2026', camposExtraidos: 42, camposConferidos: 39 },
  { id: '10', nome: 'BL HLCU9822110 — Maersk', status: 'Processando', docs: 1, data: '30/06/2026', camposExtraidos: 86, camposConferidos: 78 },
]

export const PERFIL_FILIAL_SC_IMPORTADOR: PerfilEmpresaSimulador = {
  id: 'filial-sc-importador',
  nome: 'Filial SC Importador',
  plano: 'Pro',
  mesesUso: 12,
  leiturasPorMes: 1000,
  chartPorPeriodo: {
    7: CHART_FILIAL_SC_7D,
    30: CHART_FILIAL_SC_30D,
    60: CHART_FILIAL_SC_60D,
    90: CHART_FILIAL_SC_90D,
  },
  metricasPorPeriodo: {
    7: metricasDePontos(CHART_FILIAL_SC_7D, 233, 4, 3180, 486),
    30: metricasDePontos(CHART_FILIAL_SC_30D, 1000, 4, 13152, 2084),
    60: metricasDePontos(CHART_FILIAL_SC_60D, 1980, 4, 25840, 4120),
    90: metricasDePontos(CHART_FILIAL_SC_90D, 2940, 4, 38420, 6180),
  },
  tiposDocumentoPorPeriodo: {
    7: tiposDocumentoDeVolume(280, DISTRIBUICAO_TIPOS),
    30: tiposDocumentoDeVolume(1248, DISTRIBUICAO_TIPOS),
    60: tiposDocumentoDeVolume(3508, DISTRIBUICAO_TIPOS),
    90: tiposDocumentoDeVolume(4012, DISTRIBUICAO_TIPOS),
  },
  rankingsPorTipo: RANKINGS_FILIAL_SC,
  listaLeituras: LISTA_FILIAL_SC,
}

/** Perfis menores para contraste no dropdown de workspace. */
const CHART_MATRIZ_SP_7D: PontoChartDiaSimulador[] = [
  pontoChart('30/06', 6420, 118, 91.8),
  pontoChart('01/07', 5180, 95, 92.4),
  pontoChart('02/07', 7120, 131, 93.1),
  pontoChart('03/07', 4890, 90, 90.6),
  pontoChart('04/07', 6840, 126, 91.5),
  pontoChart('05/07', 2940, 54, 92.8),
  pontoChart('06/07', 3180, 58, 91.2),
]

const CHART_MATRIZ_SP_30D: PontoChartDiaSimulador[] = [
  pontoChart('09/06', 32800, 602, 91.0),
  pontoChart('16/06', 35200, 646, 91.8),
  pontoChart('23/06', 36800, 676, 92.2),
  pontoChart('30/06', 34100, 626, 90.9),
  pontoChart('06/07', 36570, 672, 91.6),
]

const CHART_MATRIZ_SP_60D: PontoChartDiaSimulador[] = [
  pontoChart('Mai', 148200, 2580, 90.8),
  pontoChart('Jun', 162400, 2828, 91.4),
  pontoChart('Jul', 172280, 3000, 92.0),
]

const CHART_MATRIZ_SP_90D: PontoChartDiaSimulador[] = [
  pontoChart('Abr', 132600, 2310, 90.2),
  pontoChart('Mai', 148200, 2580, 90.8),
  pontoChart('Jun', 162400, 2828, 91.4),
  pontoChart('Jul', 114840, 2000, 91.8),
]

export const PERFIL_MATRIZ_SP: PerfilEmpresaSimulador = {
  id: 'matriz-sp-importador',
  nome: 'Matriz SP Importador',
  plano: 'Enterprise',
  mesesUso: 18,
  leiturasPorMes: 2400,
  chartPorPeriodo: {
    7: CHART_MATRIZ_SP_7D,
    30: CHART_MATRIZ_SP_30D,
    60: CHART_MATRIZ_SP_60D,
    90: CHART_MATRIZ_SP_90D,
  },
  metricasPorPeriodo: {
    7: metricasDePontos(CHART_MATRIZ_SP_7D, 560, 5, 7620, 1180),
    30: metricasDePontos(CHART_MATRIZ_SP_30D, 2400, 5, 31540, 4980),
    60: metricasDePontos(CHART_MATRIZ_SP_60D, 4760, 5, 62480, 9860),
    90: metricasDePontos(CHART_MATRIZ_SP_90D, 7080, 5, 92840, 14620),
  },
  tiposDocumentoPorPeriodo: {
    7: tiposDocumentoDeVolume(672, DISTRIBUICAO_TIPOS),
    30: tiposDocumentoDeVolume(3000, DISTRIBUICAO_TIPOS),
    60: tiposDocumentoDeVolume(8408, DISTRIBUICAO_TIPOS),
    90: tiposDocumentoDeVolume(9718, DISTRIBUICAO_TIPOS),
  },
  rankingsPorTipo: RANKINGS_FILIAL_SC,
  listaLeituras: LISTA_FILIAL_SC.slice(0, 6),
}

const CHART_FILIAL_PR_7D: PontoChartDiaSimulador[] = [
  pontoChart('30/06', 820, 15, 90.5),
  pontoChart('01/07', 640, 12, 91.2),
  pontoChart('02/07', 940, 17, 92.0),
  pontoChart('03/07', 510, 9, 89.4),
  pontoChart('04/07', 780, 14, 90.8),
  pontoChart('05/07', 320, 6, 93.0),
  pontoChart('06/07', 380, 7, 90.1),
]

const CHART_FILIAL_PR_30D: PontoChartDiaSimulador[] = [
  pontoChart('09/06', 4120, 76, 90.2),
  pontoChart('16/06', 4580, 84, 91.0),
  pontoChart('23/06', 4920, 90, 91.8),
  pontoChart('30/06', 4360, 80, 89.6),
  pontoChart('06/07', 4390, 80, 90.9),
]

const CHART_FILIAL_PR_60D: PontoChartDiaSimulador[] = [
  pontoChart('Mai', 18600, 342, 89.8),
  pontoChart('Jun', 19840, 366, 90.6),
  pontoChart('Jul', 20120, 372, 91.1),
]

const CHART_FILIAL_PR_90D: PontoChartDiaSimulador[] = [
  pontoChart('Abr', 16200, 298, 89.4),
  pontoChart('Mai', 18600, 342, 89.8),
  pontoChart('Jun', 19840, 366, 90.6),
  pontoChart('Jul', 13400, 248, 91.0),
]

export const PERFIL_FILIAL_PR: PerfilEmpresaSimulador = {
  id: 'filial-pr-exportador',
  nome: 'Exportador PR Exportador',
  plano: 'Pro',
  mesesUso: 6,
  leiturasPorMes: 320,
  chartPorPeriodo: {
    7: CHART_FILIAL_PR_7D,
    30: CHART_FILIAL_PR_30D,
    60: CHART_FILIAL_PR_60D,
    90: CHART_FILIAL_PR_90D,
  },
  metricasPorPeriodo: {
    7: metricasDePontos(CHART_FILIAL_PR_7D, 75, 3, 420, 68),
    30: metricasDePontos(CHART_FILIAL_PR_30D, 320, 3, 1780, 286),
    60: metricasDePontos(CHART_FILIAL_PR_60D, 632, 3, 3520, 564),
    90: metricasDePontos(CHART_FILIAL_PR_90D, 940, 3, 5240, 840),
  },
  tiposDocumentoPorPeriodo: {
    7: tiposDocumentoDeVolume(80, DISTRIBUICAO_TIPOS),
    30: tiposDocumentoDeVolume(372, DISTRIBUICAO_TIPOS),
    60: tiposDocumentoDeVolume(1080, DISTRIBUICAO_TIPOS),
    90: tiposDocumentoDeVolume(1284, DISTRIBUICAO_TIPOS),
  },
  rankingsPorTipo: {
    exportador: {
      acertos: [
        { name: 'Cliente Europa Foods GmbH', stats: '22 doc. · 980 ✓ · 88 ✗', pct: '91.8%' },
        { name: 'US Retail Partners Inc.', stats: '18 doc. · 760 ✓ · 74 ✗', pct: '91.1%' },
      ],
      erros: [
        { name: 'US Retail Partners Inc.', stats: '18 doc. · 760 ✓ · 74 ✗', err: '74 err.' },
        { name: 'Cliente Europa Foods GmbH', stats: '22 doc. · 980 ✓ · 88 ✗', err: '88 err.' },
      ],
    },
    agente_carga: RANKINGS_FILIAL_SC.agente_carga,
    transportadora_rodoviaria: RANKINGS_FILIAL_SC.transportadora_rodoviaria,
    armazem_alfandegado: RANKINGS_FILIAL_SC.armazem_alfandegado,
    despachante_aduaneiro: RANKINGS_FILIAL_SC.despachante_aduaneiro,
  },
  listaLeituras: LISTA_FILIAL_SC.slice(0, 4),
}

const CHART_IMPORTADOR_LTDA_7D: PontoChartDiaSimulador[] = [
  pontoChart('30/06', 1920, 35, 90.4),
  pontoChart('01/07', 1480, 27, 91.2),
  pontoChart('02/07', 2080, 39, 92.1),
  pontoChart('03/07', 1120, 21, 89.6),
  pontoChart('04/07', 1960, 36, 90.8),
  pontoChart('05/07', 760, 14, 92.6),
  pontoChart('06/07', 840, 16, 90.9),
]

const CHART_IMPORTADOR_LTDA_30D: PontoChartDiaSimulador[] = [
  pontoChart('09/06', 9280, 162, 90.2),
  pontoChart('16/06', 10240, 178, 91.0),
  pontoChart('23/06', 11080, 193, 91.6),
  pontoChart('30/06', 9680, 169, 89.9),
  pontoChart('06/07', 9840, 172, 91.1),
]

const CHART_IMPORTADOR_LTDA_60D: PontoChartDiaSimulador[] = [
  pontoChart('Mai', 39800, 694, 89.8),
  pontoChart('Jun', 44480, 776, 90.6),
  pontoChart('Jul', 46680, 814, 91.0),
]

const CHART_IMPORTADOR_LTDA_90D: PontoChartDiaSimulador[] = [
  pontoChart('Abr', 34320, 598, 89.4),
  pontoChart('Mai', 39800, 694, 89.8),
  pontoChart('Jun', 44480, 776, 90.6),
  pontoChart('Jul', 31120, 542, 91.2),
]

export const PERFIL_IMPORTADOR_LTDA: PerfilEmpresaSimulador = {
  id: 'importador-ltda',
  nome: 'Importador Ltda',
  plano: 'Pro',
  mesesUso: 10,
  leiturasPorMes: 640,
  chartPorPeriodo: {
    7: CHART_IMPORTADOR_LTDA_7D,
    30: CHART_IMPORTADOR_LTDA_30D,
    60: CHART_IMPORTADOR_LTDA_60D,
    90: CHART_IMPORTADOR_LTDA_90D,
  },
  metricasPorPeriodo: {
    7: metricasDePontos(CHART_IMPORTADOR_LTDA_7D, 148, 4, 2040, 312),
    30: metricasDePontos(CHART_IMPORTADOR_LTDA_30D, 640, 4, 8420, 1334),
    60: metricasDePontos(CHART_IMPORTADOR_LTDA_60D, 1268, 4, 16680, 2640),
    90: metricasDePontos(CHART_IMPORTADOR_LTDA_90D, 1884, 4, 24760, 3910),
  },
  tiposDocumentoPorPeriodo: {
    7: tiposDocumentoDeVolume(188, DISTRIBUICAO_TIPOS),
    30: tiposDocumentoDeVolume(814, DISTRIBUICAO_TIPOS),
    60: tiposDocumentoDeVolume(2284, DISTRIBUICAO_TIPOS),
    90: tiposDocumentoDeVolume(2610, DISTRIBUICAO_TIPOS),
  },
  rankingsPorTipo: RANKINGS_FILIAL_SC,
  listaLeituras: LISTA_FILIAL_SC.slice(2, 8),
}

const CHART_EXPORTADOR_LTDA_7D: PontoChartDiaSimulador[] = [
  pontoChart('30/06', 1240, 23, 90.8),
  pontoChart('01/07', 980, 18, 91.4),
  pontoChart('02/07', 1420, 26, 92.2),
  pontoChart('03/07', 780, 14, 89.8),
  pontoChart('04/07', 1180, 22, 91.0),
  pontoChart('05/07', 480, 9, 92.4),
  pontoChart('06/07', 560, 10, 90.6),
]

const CHART_EXPORTADOR_LTDA_30D: PontoChartDiaSimulador[] = [
  pontoChart('09/06', 6180, 114, 90.4),
  pontoChart('16/06', 6880, 126, 91.2),
  pontoChart('23/06', 7380, 135, 91.8),
  pontoChart('30/06', 6540, 120, 90.0),
  pontoChart('06/07', 6580, 120, 91.0),
]

const CHART_EXPORTADOR_LTDA_60D: PontoChartDiaSimulador[] = [
  pontoChart('Mai', 27900, 513, 90.0),
  pontoChart('Jun', 29760, 548, 90.8),
  pontoChart('Jul', 30180, 556, 91.2),
]

const CHART_EXPORTADOR_LTDA_90D: PontoChartDiaSimulador[] = [
  pontoChart('Abr', 24300, 447, 89.6),
  pontoChart('Mai', 27900, 513, 90.0),
  pontoChart('Jun', 29760, 548, 90.8),
  pontoChart('Jul', 20100, 372, 91.0),
]

export const PERFIL_EXPORTADOR_LTDA: PerfilEmpresaSimulador = {
  id: 'exportador-ltda',
  nome: 'Exportador Ltda',
  plano: 'Pro',
  mesesUso: 8,
  leiturasPorMes: 480,
  chartPorPeriodo: {
    7: CHART_EXPORTADOR_LTDA_7D,
    30: CHART_EXPORTADOR_LTDA_30D,
    60: CHART_EXPORTADOR_LTDA_60D,
    90: CHART_EXPORTADOR_LTDA_90D,
  },
  metricasPorPeriodo: {
    7: metricasDePontos(CHART_EXPORTADOR_LTDA_7D, 112, 3, 1540, 238),
    30: metricasDePontos(CHART_EXPORTADOR_LTDA_30D, 480, 3, 6320, 998),
    60: metricasDePontos(CHART_EXPORTADOR_LTDA_60D, 948, 3, 12480, 1970),
    90: metricasDePontos(CHART_EXPORTADOR_LTDA_90D, 1408, 3, 18520, 2920),
  },
  tiposDocumentoPorPeriodo: {
    7: tiposDocumentoDeVolume(120, DISTRIBUICAO_TIPOS),
    30: tiposDocumentoDeVolume(558, DISTRIBUICAO_TIPOS),
    60: tiposDocumentoDeVolume(1620, DISTRIBUICAO_TIPOS),
    90: tiposDocumentoDeVolume(1926, DISTRIBUICAO_TIPOS),
  },
  rankingsPorTipo: {
    exportador: {
      acertos: [
        { name: 'Distribuidora Norte Europa SA', stats: '28 doc. · 1180 ✓ · 102 ✗', pct: '92.0%' },
        { name: 'Pacific Trade Holdings', stats: '24 doc. · 980 ✓ · 94 ✗', pct: '91.2%' },
        { name: 'Mercado Andino Import', stats: '16 doc. · 640 ✓ · 68 ✗', pct: '90.4%' },
      ],
      erros: [
        { name: 'Pacific Trade Holdings', stats: '24 doc. · 980 ✓ · 94 ✗', err: '94 err.' },
        { name: 'Distribuidora Norte Europa SA', stats: '28 doc. · 1180 ✓ · 102 ✗', err: '102 err.' },
        { name: 'Mercado Andino Import', stats: '16 doc. · 640 ✓ · 68 ✗', err: '68 err.' },
      ],
    },
    agente_carga: RANKINGS_FILIAL_SC.agente_carga,
    transportadora_rodoviaria: RANKINGS_FILIAL_SC.transportadora_rodoviaria,
    armazem_alfandegado: RANKINGS_FILIAL_SC.armazem_alfandegado,
    despachante_aduaneiro: RANKINGS_FILIAL_SC.despachante_aduaneiro,
  },
  listaLeituras: LISTA_FILIAL_SC.slice(4, 10),
}

export const PERFIS_EMPRESA_SIMULADOR: Record<string, PerfilEmpresaSimulador> = {
  [PERFIL_FILIAL_SC_IMPORTADOR.id]: PERFIL_FILIAL_SC_IMPORTADOR,
  [PERFIL_MATRIZ_SP.id]: PERFIL_MATRIZ_SP,
  [PERFIL_FILIAL_PR.id]: PERFIL_FILIAL_PR,
  [PERFIL_IMPORTADOR_LTDA.id]: PERFIL_IMPORTADOR_LTDA,
  [PERFIL_EXPORTADOR_LTDA.id]: PERFIL_EXPORTADOR_LTDA,
}

export function formatarSavingSimulador(minutos: number): string {
  if (minutos <= 0) return '0 min'
  if (minutos < 60) return `${Math.round(minutos)} min`
  const horas = Math.floor(minutos / 60)
  const resto = Math.round(minutos % 60)
  return resto > 0 ? `${horas}h ${resto}min` : `${horas}h`
}

export function formatarErrosCorrecaoSimulador(camposErrados: number): string {
  if (camposErrados <= 0) return '0 campos'
  if (camposErrados === 1) return '1 campo'
  return `${camposErrados.toLocaleString('pt-BR')} campos`
}

export function resolverRotuloEscopoEmpresasSimulador(empresas: PerfilEmpresaSimulador[]) {
  if (empresas.length === 1) {
    return {
      nome: empresas[0].nome,
      plano: empresas[0].plano,
      avatarLetra: empresas[0].nome.charAt(0),
    }
  }
  return {
    nome: `${empresas.length} empresas`,
    plano: 'Escopo consolidado',
    avatarLetra: String(empresas.length),
  }
}

function parsePercentualRanking(valor: string): number {
  return Number.parseFloat(valor.replace('%', '').replace(',', '.')) || 0
}

export function agregarInsightsEmpresasSimulador(
  empresas: PerfilEmpresaSimulador[],
  periodo: PeriodoPresetSimulador,
  tipoParticipante: TipoParticipanteSimulador,
) {
  const metricasBrutas = empresas.map((e) => e.metricasPorPeriodo[periodo])
  const camposCorretos = metricasBrutas.reduce((s, m) => s + m.camposCorretos, 0)
  const camposErrados = metricasBrutas.reduce((s, m) => s + m.camposErrados, 0)
  const totalCampos = camposCorretos + camposErrados

  const metricas: MetricasPeriodoSimulador = {
    amostraLeituras: metricasBrutas.reduce((s, m) => s + m.amostraLeituras, 0),
    totalDocumentos: metricasBrutas.reduce((s, m) => s + m.totalDocumentos, 0),
    totalCampos,
    camposCorretos,
    camposErrados,
    taxaAcerto: totalCampos > 0 ? (camposCorretos / totalCampos) * 100 : 0,
    tiposDocumento: metricasBrutas.reduce((s, m) => s + m.tiposDocumento, 0),
    savingDigitaçãoMinutos: metricasBrutas.reduce((s, m) => s + m.savingDigitaçãoMinutos, 0),
    savingErrosMinutos: metricasBrutas.reduce((s, m) => s + m.savingErrosMinutos, 0),
  }

  const chartMap = new Map<string, PontoChartDiaSimulador>()
  for (const empresa of empresas) {
    for (const ponto of empresa.chartPorPeriodo[periodo]) {
      const atual = chartMap.get(ponto.date)
      if (!atual) {
        chartMap.set(ponto.date, { ...ponto })
        continue
      }
      chartMap.set(ponto.date, {
        date: ponto.date,
        val: atual.val + ponto.val,
        documentos: atual.documentos + ponto.documentos,
        acertos: atual.acertos + ponto.acertos,
        erros: atual.erros + ponto.erros,
      })
    }
  }
  const chartBarras = [...chartMap.values()]

  const tiposMap = new Map<string, number>()
  for (const empresa of empresas) {
    for (const tipo of empresa.tiposDocumentoPorPeriodo[periodo]) {
      tiposMap.set(tipo.label, (tiposMap.get(tipo.label) ?? 0) + tipo.val)
    }
  }
  const totalTipos = [...tiposMap.values()].reduce((s, v) => s + v, 0)
  const tiposDocumento: TipoDocumentoSimulador[] =
    empresas.length === 1
      ? empresas[0].tiposDocumentoPorPeriodo[periodo]
      : [...tiposMap.entries()]
          .map(([label, val]) => {
            const pctBruto = totalTipos > 0 ? (val / totalTipos) * 100 : 0
            const pct = Math.round(pctBruto * 10) / 10
            return {
              label,
              val,
              pct,
              w: `${Math.max(4, pct)}%`,
            }
          })
          .sort((a, b) => b.val - a.val)

  const rankingAcertosMap = new Map<string, RankingFornecedorSimulador>()
  const rankingErrosMap = new Map<string, RankingErroSimulador>()
  for (const empresa of empresas) {
    const ranking = empresa.rankingsPorTipo[tipoParticipante]
    for (const item of ranking.acertos) {
      const atual = rankingAcertosMap.get(item.name)
      if (!atual || parsePercentualRanking(item.pct) > parsePercentualRanking(atual.pct)) {
        rankingAcertosMap.set(item.name, item)
      }
    }
    for (const item of ranking.erros) {
      const atual = rankingErrosMap.get(item.name)
      if (!atual || parsePercentualRanking(item.err) > parsePercentualRanking(atual.err)) {
        rankingErrosMap.set(item.name, item)
      }
    }
  }

  const rankings = {
    acertos: [...rankingAcertosMap.values()]
      .sort((a, b) => parsePercentualRanking(b.pct) - parsePercentualRanking(a.pct))
      .slice(0, 4),
    erros: [...rankingErrosMap.values()]
      .sort((a, b) => parsePercentualRanking(b.err) - parsePercentualRanking(a.err))
      .slice(0, 4),
  }

  const listaLeituras = empresas.flatMap((empresa) =>
    empresa.listaLeituras.map((leitura) => ({
      ...leitura,
      id: `${empresa.id}-${leitura.id}`,
      nome: `${leitura.nome}`,
    })),
  )

  const mesesUso = Math.max(...empresas.map((e) => e.mesesUso))
  const leiturasPorMes = empresas.reduce((s, e) => s + e.leiturasPorMes, 0)

  return {
    metricas,
    chartBarras,
    tiposDocumento,
    rankings,
    listaLeituras,
    mesesUso,
    leiturasPorMes,
  }
}
