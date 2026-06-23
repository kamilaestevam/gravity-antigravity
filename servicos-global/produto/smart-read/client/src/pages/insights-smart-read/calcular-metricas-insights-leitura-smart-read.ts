import type { Leitura, TransacaoLeitura } from '../../shared/schemas'
import {
  PARAMETROS_FINANCEIROS_SMART_READ,
  resolverParametrosTempoDocumentoSmartRead,
  type TipoDocumentoBaseSmartRead,
} from './dados-base-produto-tempo-smart-read'
import {
  extrairDocumentosInsightsDeLeituras,
  type DocumentoInsightsSmartRead,
} from './extrair-dados-documento-leitura-smart-read'
import {
  PARTICIPANTES_RANKING_INSIGHTS_SMART_READ,
  type TipoParticipanteInsightsSmartRead,
} from './mapear-participante-insights-smart-read'

export type TipoParticipanteRankingInsightsSmartRead = Exclude<
  TipoParticipanteInsightsSmartRead,
  'importador'
>

export type RankingsPorParticipanteInsightsSmartRead = Record<
  TipoParticipanteRankingInsightsSmartRead,
  { acertos: RankingEntidadeInsightsSmartRead[]; erros: RankingEntidadeInsightsSmartRead[] }
>

export type RankingEntidadeInsightsSmartRead = {
  nome: string
  documentos: number
  media_acertos: number | null
  campos_corretos: number
  campos_errados: number
}

export type MetricasInsightsLeituraSmartRead = {
  totalDocumentos: number
  totalCampos: number
  camposCorretos: number
  camposErrados: number
  taxaAcertoCampos: number | null
  savingDigitaçãoMinutos: number
  savingErrosMinutos: number
  savingDigitaçãoCustoBrl: number
  savingErrosCustoBrl: number
  porTipoDocumento: { tipo: TipoDocumentoBaseSmartRead; rotulo: string; quantidade: number }[]
  rankingsExportador: RankingEntidadeInsightsSmartRead[]
  rankingsImportador: RankingEntidadeInsightsSmartRead[]
  rankingsExportadorAcerto: RankingEntidadeInsightsSmartRead[]
  rankingsImportadorAcerto: RankingEntidadeInsightsSmartRead[]
  rankingsPorParticipante: RankingsPorParticipanteInsightsSmartRead
  blAwb: {
    bl: { documentos: number; mediaAcertos: number | null; camposCorretos: number; camposErrados: number }
    awb: { documentos: number; mediaAcertos: number | null; camposCorretos: number; camposErrados: number }
  }
  documentos: DocumentoInsightsSmartRead[]
  amostraLeituras: number
}

function mediaAccuracy(valores: (number | null)[]): number | null {
  const nums = valores.filter((v): v is number => v != null && Number.isFinite(v))
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function montarRankingEntidade(
  documentos: DocumentoInsightsSmartRead[],
  campo: 'exportador' | 'importador',
  ordem: 'acerto' | 'erro',
): RankingEntidadeInsightsSmartRead[] {
  const mapa = new Map<string, DocumentoInsightsSmartRead[]>()

  for (const doc of documentos) {
    const nome = doc[campo]
    if (!nome) continue
    const lista = mapa.get(nome) ?? []
    lista.push(doc)
    mapa.set(nome, lista)
  }

  const rankings = [...mapa.entries()].map(([nome, docs]) => ({
    nome,
    documentos: docs.length,
    media_acertos: mediaAccuracy(docs.map((d) => d.accuracy)),
    campos_corretos: docs.reduce((acc, d) => acc + d.campos_corretos, 0),
    campos_errados: docs.reduce((acc, d) => acc + d.campos_errados, 0),
  }))

  rankings.sort((a, b) => {
    if (ordem === 'acerto') {
      return (b.media_acertos ?? 0) - (a.media_acertos ?? 0)
    }
    return b.campos_errados - a.campos_errados
  })

  return rankings.slice(0, 5)
}

function montarRankingResponsavelEmissor(
  documentos: DocumentoInsightsSmartRead[],
  tipoParticipante: TipoParticipanteInsightsSmartRead,
  ordem: 'acerto' | 'erro',
): RankingEntidadeInsightsSmartRead[] {
  const mapa = new Map<string, DocumentoInsightsSmartRead[]>()

  for (const doc of documentos) {
    const responsavel = doc.responsavel_emissor
    if (!responsavel || responsavel.tipo !== tipoParticipante) continue
    const lista = mapa.get(responsavel.nome) ?? []
    lista.push(doc)
    mapa.set(responsavel.nome, lista)
  }

  const rankings = [...mapa.entries()].map(([nome, docs]) => ({
    nome,
    documentos: docs.length,
    media_acertos: mediaAccuracy(docs.map((d) => d.accuracy)),
    campos_corretos: docs.reduce((acc, d) => acc + d.campos_corretos, 0),
    campos_errados: docs.reduce((acc, d) => acc + d.campos_errados, 0),
  }))

  rankings.sort((a, b) => {
    if (ordem === 'acerto') {
      return (b.media_acertos ?? 0) - (a.media_acertos ?? 0)
    }
    return b.campos_errados - a.campos_errados
  })

  return rankings.slice(0, 5)
}

function montarRankingsPorParticipante(
  documentos: DocumentoInsightsSmartRead[],
): RankingsPorParticipanteInsightsSmartRead {
  const saida = {} as RankingsPorParticipanteInsightsSmartRead
  for (const participante of PARTICIPANTES_RANKING_INSIGHTS_SMART_READ) {
    saida[participante.tipo] = {
      acertos: montarRankingResponsavelEmissor(documentos, participante.tipo, 'acerto'),
      erros: montarRankingResponsavelEmissor(documentos, participante.tipo, 'erro'),
    }
  }
  return saida
}

const RANKINGS_PARTICIPANTE_VAZIO: RankingsPorParticipanteInsightsSmartRead =
  montarRankingsPorParticipante([])

/** Resolve rankings por emissor — tolera metricas legadas sem rankingsPorParticipante. */
export function resolverRankingsParticipanteInsights(
  metricas: MetricasInsightsLeituraSmartRead,
  tipo: TipoParticipanteRankingInsightsSmartRead,
): { acertos: RankingEntidadeInsightsSmartRead[]; erros: RankingEntidadeInsightsSmartRead[] } {
  const porTipo = metricas.rankingsPorParticipante?.[tipo]
  if (porTipo) return porTipo

  if (tipo === 'exportador') {
    console.warn(
      '[InsightsSmartRead] rankingsPorParticipante ausente — usando rankingsExportador legado',
    )
    return {
      acertos: metricas.rankingsExportadorAcerto ?? [],
      erros: metricas.rankingsExportador ?? [],
    }
  }

  console.warn(
    '[InsightsSmartRead] rankingsPorParticipante ausente — lista vazia para participante',
    tipo,
  )
  return RANKINGS_PARTICIPANTE_VAZIO[tipo]
}

function calcularSavingDocumento(doc: DocumentoInsightsSmartRead): {
  digitação: number
  erros: number
} {
  const params = resolverParametrosTempoDocumentoSmartRead(doc.tipo_normalizado)
  const savingDigitação =
    params.tempo_digitação_manual_minutos - params.tempo_digitação_smart_read_minutos

  const errados = doc.campos_errados
  const savingErros =
    errados *
    (params.tempo_correcao_erro_manual_minutos_por_campo -
      params.tempo_correcao_erro_smart_read_minutos_por_campo)

  return {
    digitação: Math.max(0, savingDigitação),
    erros: Math.max(0, savingErros),
  }
}

function resumoBlAwb(documentos: DocumentoInsightsSmartRead[], tipo: 'bl' | 'awb') {
  const filtrados = documentos.filter((d) => d.tipo_normalizado === tipo)
  return {
    documentos: filtrados.length,
    mediaAcertos: mediaAccuracy(filtrados.map((d) => d.accuracy)),
    camposCorretos: filtrados.reduce((acc, d) => acc + d.campos_corretos, 0),
    camposErrados: filtrados.reduce((acc, d) => acc + d.campos_errados, 0),
  }
}

const ROTULO_TIPO: Record<TipoDocumentoBaseSmartRead, string> = {
  bl: 'Bill of Lading',
  awb: 'AWB',
  invoice: 'Invoice',
  packing_list: 'Packing List',
  proforma: 'Proforma',
  pedido: 'Pedido',
  outros: 'Outros',
}

const METRICAS_INSIGHTS_VAZIAS: Omit<MetricasInsightsLeituraSmartRead, 'amostraLeituras'> = {
  totalDocumentos: 0,
  totalCampos: 0,
  camposCorretos: 0,
  camposErrados: 0,
  taxaAcertoCampos: null,
  savingDigitaçãoMinutos: 0,
  savingErrosMinutos: 0,
  savingDigitaçãoCustoBrl: 0,
  savingErrosCustoBrl: 0,
  porTipoDocumento: [],
  rankingsExportador: [],
  rankingsImportador: [],
  rankingsExportadorAcerto: [],
  rankingsImportadorAcerto: [],
  rankingsPorParticipante: Object.fromEntries(
    PARTICIPANTES_RANKING_INSIGHTS_SMART_READ.filter((p) => p !== 'importador').map((p) => [
      p,
      { acertos: [], erros: [] },
    ]),
  ) as RankingsPorParticipanteInsightsSmartRead,
  blAwb: {
    bl: { documentos: 0, mediaAcertos: null, camposCorretos: 0, camposErrados: 0 },
    awb: { documentos: 0, mediaAcertos: null, camposCorretos: 0, camposErrados: 0 },
  },
  documentos: [],
}

function porTipoDocumentoDeTransacoes(
  transacoes: TransacaoLeitura[],
): { tipo: TipoDocumentoBaseSmartRead; rotulo: string; quantidade: number }[] {
  const mapa = new Map<string, number>()
  for (const transacao of transacoes) {
    if (transacao.total_documentos <= 0) continue
    const partes = (transacao.tipos_documento ?? 'Outros')
      .split('·')
      .map((parte) => parte.trim())
      .filter(Boolean)
    if (partes.length === 0) {
      mapa.set('Outros', (mapa.get('Outros') ?? 0) + transacao.total_documentos)
      continue
    }
    const porParte = Math.max(1, Math.round(transacao.total_documentos / partes.length))
    for (const parte of partes) {
      mapa.set(parte, (mapa.get(parte) ?? 0) + porParte)
    }
  }
  return [...mapa.entries()]
    .map(([rotulo, quantidade]) => ({
      tipo: 'outros' as const,
      rotulo,
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
}

function calcularMetricasInsightsDeTransacoes(
  transacoes: TransacaoLeitura[],
): MetricasInsightsLeituraSmartRead {
  const elegiveis = transacoes.filter(
    (t) =>
      (t.status_leitura === 'COMPLETED' || t.status_leitura === 'PROCESSING') &&
      t.total_campos_extraidos > 0,
  )

  if (elegiveis.length === 0) {
    return { ...METRICAS_INSIGHTS_VAZIAS, amostraLeituras: transacoes.length }
  }

  const totalDocumentos = elegiveis.reduce((acc, t) => acc + t.total_documentos, 0)
  const totalCampos = elegiveis.reduce((acc, t) => acc + t.total_campos_extraidos, 0)
  const camposCorretos = elegiveis.reduce((acc, t) => acc + t.total_campos_corretos, 0)
  const camposErrados = elegiveis.reduce((acc, t) => acc + t.total_campos_errados, 0)
  const taxaAcertoCampos =
    camposCorretos + camposErrados > 0
      ? camposCorretos / (camposCorretos + camposErrados)
      : null

  const savingDigitaçãoMinutos = elegiveis.reduce((acc, t) => acc + (t.saving_total_minutos ?? 0), 0)
  const savingDigitaçãoCustoBrl = elegiveis.reduce((acc, t) => acc + (t.saving_total_brl ?? 0), 0)

  return {
    ...METRICAS_INSIGHTS_VAZIAS,
    totalDocumentos,
    totalCampos,
    camposCorretos,
    camposErrados,
    taxaAcertoCampos,
    savingDigitaçãoMinutos,
    savingDigitaçãoCustoBrl,
    porTipoDocumento: porTipoDocumentoDeTransacoes(elegiveis),
    amostraLeituras: transacoes.length,
  }
}

export function calcularMetricasInsightsLeituraSmartRead(
  leituras: Leitura[],
  transacoes: TransacaoLeitura[],
): MetricasInsightsLeituraSmartRead {
  const documentos = extrairDocumentosInsightsDeLeituras(leituras)
  if (documentos.length === 0) {
    return calcularMetricasInsightsDeTransacoes(transacoes)
  }

  const totalCampos = documentos.reduce((acc, d) => acc + d.total_campos, 0)
  const camposCorretos = documentos.reduce((acc, d) => acc + d.campos_corretos, 0)
  const camposErrados = documentos.reduce((acc, d) => acc + d.campos_errados, 0)
  const taxaAcertoCampos =
    camposCorretos + camposErrados > 0
      ? camposCorretos / (camposCorretos + camposErrados)
      : null

  let savingDigitaçãoMinutos = 0
  let savingErrosMinutos = 0
  for (const doc of documentos) {
    const saving = calcularSavingDocumento(doc)
    savingDigitaçãoMinutos += saving.digitação
    savingErrosMinutos += saving.erros
  }

  const custoHora =
    PARAMETROS_FINANCEIROS_SMART_READ.custo_hora_operador_brl *
    PARAMETROS_FINANCEIROS_SMART_READ.markup_venda

  const porTipoMapa = new Map<TipoDocumentoBaseSmartRead, number>()
  for (const doc of documentos) {
    porTipoMapa.set(doc.tipo_normalizado, (porTipoMapa.get(doc.tipo_normalizado) ?? 0) + 1)
  }

  const porTipoDocumento = [...porTipoMapa.entries()]
    .map(([tipo, quantidade]) => ({
      tipo,
      rotulo: ROTULO_TIPO[tipo],
      quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade)

  return {
    totalDocumentos: documentos.length,
    totalCampos,
    camposCorretos,
    camposErrados,
    taxaAcertoCampos,
    savingDigitaçãoMinutos,
    savingErrosMinutos,
    savingDigitaçãoCustoBrl: (savingDigitaçãoMinutos / 60) * custoHora,
    savingErrosCustoBrl: (savingErrosMinutos / 60) * custoHora,
    porTipoDocumento,
    rankingsExportador: montarRankingEntidade(documentos, 'exportador', 'erro'),
    rankingsImportador: montarRankingEntidade(documentos, 'importador', 'erro'),
    rankingsExportadorAcerto: montarRankingEntidade(documentos, 'exportador', 'acerto'),
    rankingsImportadorAcerto: montarRankingEntidade(documentos, 'importador', 'acerto'),
    rankingsPorParticipante: montarRankingsPorParticipante(documentos),
    blAwb: {
      bl: resumoBlAwb(documentos, 'bl'),
      awb: resumoBlAwb(documentos, 'awb'),
    },
    documentos,
    amostraLeituras: transacoes.length,
  }
}

export function formatarMinutosInsightsSmartRead(minutos: number): string {
  if (minutos <= 0) return '0 min'
  if (minutos < 1) return '< 1 min'
  if (minutos < 60) return `${Math.round(minutos)} min`
  const horas = Math.floor(minutos / 60)
  const resto = Math.round(minutos % 60)
  return resto > 0 ? `${horas}h ${resto}min` : `${horas}h`
}

export function formatarMoedaInsightsSmartRead(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor)
}
