/**
 * Métricas agregadas por leitura para a lista (paridade com Insights).
 */
import { compararCamposEdicaoLeituraSmartRead } from './comparar-campos-edicao-leitura-smart-read.js'
import {
  PARAMETROS_FINANCEIROS_SMART_READ,
  normalizarTipoDocumentoBaseSmartRead,
  resolverContagemAcertoErroEstudoSmartRead,
  resolverParametrosTempoDocumentoSmartRead,
  type TipoDocumentoBaseSmartRead,
} from './dados-base-produto-tempo-smart-read.js'

export type LeituraMetricasEntrada = {
  id_leitura: string
  arquivos: Array<{
    tempo_extracao_ia_ms?: number | null
    resultado_extracao: Array<{
      tipo_documento: string | null
      dados: Record<string, unknown>
      dados_original?: Record<string, unknown>
    }> | null
  }>
}

export type MetricasTransacaoLeituraSmartRead = {
  total_documentos: number
  total_campos_extraidos: number
  total_campos_corretos: number
  total_campos_errados: number
  tipos_documento: string | null
  numeros_documento: string | null
  tempo_extracao_ia_ms: number | null
  tempo_processo_total_ms: number | null
  saving_total_minutos: number | null
  saving_total_brl: number | null
}

export type ContextoTempoLeituraSmartRead = {
  created_at: string | null
  completed_at: string | null
}

const CHAVES_METADADO = new Set([
  'accuracy',
  'averageaccuracy',
  'score',
  'confidence',
  'id',
  '_id',
])

const ROTULO_TIPO: Record<TipoDocumentoBaseSmartRead, string> = {
  bl: 'Bill of Lading',
  awb: 'AWB',
  invoice: 'Invoice',
  packing_list: 'Packing List',
  proforma: 'Proforma',
  pedido: 'Pedido',
  outros: 'Outros',
}

function contarCamposDados(dados: Record<string, unknown>, profundidade = 0): number {
  if (profundidade > 4) return 0
  let total = 0
  for (const [chave, valor] of Object.entries(dados)) {
    if (CHAVES_METADADO.has(chave.toLowerCase())) continue
    if (valor == null) continue
    if (typeof valor === 'object' && !Array.isArray(valor)) {
      total += contarCamposDados(valor as Record<string, unknown>, profundidade + 1)
    } else {
      total += 1
    }
  }
  return total
}

function resolverContagemCampos(
  item: { dados: Record<string, unknown>; dados_original?: Record<string, unknown> },
  tipo: TipoDocumentoBaseSmartRead,
): { total: number; corretos: number; errados: number } {
  if (item.dados_original != null) {
    const comparacao = compararCamposEdicaoLeituraSmartRead(item.dados_original, item.dados)
    return {
      total: comparacao.total,
      corretos: comparacao.corretos,
      errados: comparacao.errados,
    }
  }
  const base = resolverParametrosTempoDocumentoSmartRead(tipo)
  const contadosExtracao = contarCamposDados(item.dados)
  const total = Math.max(contadosExtracao, base.campos_medio)
  const contagem = resolverContagemAcertoErroEstudoSmartRead(total)
  return {
    total: contagem.total,
    corretos: contagem.corretos,
    errados: contagem.errados,
  }
}

export function resolverMediaAcertosTransacaoLeituraSmartRead(
  transacao: Pick<
    MetricasTransacaoLeituraSmartRead,
    'total_campos_extraidos' | 'total_campos_corretos'
  > & { media_acertos?: number | null },
): number | null {
  if (transacao.media_acertos != null && Number.isFinite(transacao.media_acertos)) {
    return transacao.media_acertos <= 1 ? transacao.media_acertos : transacao.media_acertos / 100
  }
  if (transacao.total_campos_extraidos > 0) {
    return transacao.total_campos_corretos / transacao.total_campos_extraidos
  }
  return null
}

const CHAVES_TEMPO_EXTRACAO_IA = [
  'processingTimeMs',
  'processing_time_ms',
  'extractionTimeMs',
  'extraction_time_ms',
  'tempo_extracao_ia_ms',
  'aiProcessingTimeMs',
] as const

/** Tempo de extração IA (ms) em metadados do documento legado, quando disponível. */
export function extrairTempoExtracaoIaMsDeDados(
  dados: Record<string, unknown> | undefined,
): number | null {
  if (!dados) return null
  for (const chave of CHAVES_TEMPO_EXTRACAO_IA) {
    const valor = dados[chave]
    if (typeof valor === 'number' && Number.isFinite(valor) && valor >= 0) {
      return Math.round(valor)
    }
  }
  return null
}

/** Tempo Smart Read por documento a partir do total medido da leitura. */
export function resolverTempoSmartReadMinutosPorDocumento(
  tempoExtracaoIaMs: number | null | undefined,
  totalDocumentos: number,
): number | null {
  if (tempoExtracaoIaMs == null || tempoExtracaoIaMs <= 0 || totalDocumentos <= 0) return null
  return tempoExtracaoIaMs / 60000 / totalDocumentos
}

export type EntradaAgregacaoTempoExtracaoIaSmartRead = Pick<
  MetricasTransacaoLeituraSmartRead,
  'total_documentos' | 'tempo_extracao_ia_ms' | 'tipos_documento'
>

export type TempoExtracaoIaAgregadoTipoSmartRead = {
  tempo_medio_segundos: number
  documentos_amostra: number
}

export type AgregadoTempoExtracaoIaLeituraSmartRead = {
  por_tipo: Partial<Record<TipoDocumentoBaseSmartRead, TempoExtracaoIaAgregadoTipoSmartRead>>
  media_ponderada_segundos: number | null
  documentos_amostra: number
}

/** Média de tempo real de extração IA (segundos) por tipo, a partir das leituras visíveis. */
export function agregarTempoExtracaoIaMedioPorTipoLeituraSmartRead(
  transacoes: EntradaAgregacaoTempoExtracaoIaSmartRead[],
): AgregadoTempoExtracaoIaLeituraSmartRead {
  const acumulado = new Map<TipoDocumentoBaseSmartRead, { totalMs: number; documentos: number }>()
  let totalMsGlobal = 0
  let documentosGlobal = 0

  for (const transacao of transacoes) {
    const { total_documentos, tempo_extracao_ia_ms, tipos_documento } = transacao
    if (total_documentos <= 0 || tempo_extracao_ia_ms == null || tempo_extracao_ia_ms <= 0) {
      continue
    }

    const partes = (tipos_documento ?? '')
      .split('·')
      .map((parte) => parte.trim())
      .filter(Boolean)
    const tipos =
      partes.length > 0
        ? partes.map((parte) => normalizarTipoDocumentoBaseSmartRead(parte))
        : [normalizarTipoDocumentoBaseSmartRead(null)]

    const msPorTipo = tempo_extracao_ia_ms / tipos.length
    const documentosPorTipo = total_documentos / tipos.length

    for (const tipo of tipos) {
      const anterior = acumulado.get(tipo) ?? { totalMs: 0, documentos: 0 }
      acumulado.set(tipo, {
        totalMs: anterior.totalMs + msPorTipo,
        documentos: anterior.documentos + documentosPorTipo,
      })
      totalMsGlobal += msPorTipo
      documentosGlobal += documentosPorTipo
    }
  }

  const por_tipo: AgregadoTempoExtracaoIaLeituraSmartRead['por_tipo'] = {}
  for (const [tipo, { totalMs, documentos }] of acumulado) {
    if (documentos <= 0) continue
    por_tipo[tipo] = {
      tempo_medio_segundos: totalMs / documentos / 1000,
      documentos_amostra: documentos,
    }
  }

  return {
    por_tipo,
    media_ponderada_segundos:
      documentosGlobal > 0 ? totalMsGlobal / documentosGlobal / 1000 : null,
    documentos_amostra: documentosGlobal,
  }
}

/** Tempo de leitura (s) — cronômetro do processo; fallback para extração IA quando ausente. */
export function resolverTempoLeituraSegundosSmartRead(
  tempoProcessoTotalMs: number | null | undefined,
  tempoExtracaoIaMs: number | null | undefined,
): number | null {
  if (tempoProcessoTotalMs != null && tempoProcessoTotalMs > 0) {
    return Math.round(tempoProcessoTotalMs / 1000)
  }
  if (tempoExtracaoIaMs != null && tempoExtracaoIaMs > 0) {
    return Math.round(tempoExtracaoIaMs / 1000)
  }
  return null
}

/**
 * Tempo estimado (s) pela tabela DOCS BASE PRODUTO — apenas quando não há cronômetro nem IA medida.
 * Não substitui tempo medido quando este existir (ver resolverTempoLeituraSegundosComFallbackSmartRead).
 */
export function estimarTempoLeituraSegundosDocumentosSmartRead(
  documentos: Array<{ tipo_documento: string | null | undefined }>,
): number | null {
  if (documentos.length <= 0) return null
  let minutos = 0
  for (const documento of documentos) {
    const tipo = normalizarTipoDocumentoBaseSmartRead(documento.tipo_documento)
    minutos += resolverParametrosTempoDocumentoSmartRead(tipo).tempo_digitação_smart_read_minutos
  }
  return minutos > 0 ? Math.round(minutos * 60) : null
}

/** Medido (cronômetro/IA) com fallback estimado por tipo quando o legado não persiste tempo. */
export function resolverTempoLeituraSegundosComFallbackSmartRead(
  documentos: Array<{ tipo_documento: string | null | undefined }>,
  tempoProcessoTotalMs: number | null | undefined,
  tempoExtracaoIaMs: number | null | undefined,
): number | null {
  const medido = resolverTempoLeituraSegundosSmartRead(tempoProcessoTotalMs, tempoExtracaoIaMs)
  if (medido != null && medido > 0) return medido
  return estimarTempoLeituraSegundosDocumentosSmartRead(documentos)
}

export function somarBaseManualDocumentosSmartRead(
  documentos: Array<{ tipo_documento: string | null | undefined }>,
): number {
  let baseManualMinutos = 0
  for (const documento of documentos) {
    const tipo = normalizarTipoDocumentoBaseSmartRead(documento.tipo_documento)
    baseManualMinutos += resolverParametrosTempoDocumentoSmartRead(tipo).tempo_digitação_manual_minutos
  }
  return baseManualMinutos
}

/** Saving de erros por documento (correção manual − Smart Read por campo). */
export function calcularSavingErrosDocumentoSmartRead(
  tipo: TipoDocumentoBaseSmartRead,
  camposErrados: number,
): number {
  const params = resolverParametrosTempoDocumentoSmartRead(tipo)
  return Math.max(
    0,
    camposErrados *
      (params.tempo_correcao_erro_manual_minutos_por_campo -
        params.tempo_correcao_erro_smart_read_minutos_por_campo),
  )
}

/** Saving digitação = soma da base manual − tempo de leitura medido (cronômetro). */
export function calcularSavingDigitaçãoTransacaoLeituraSmartRead(
  documentos: Array<{ tipo_documento: string | null | undefined }>,
  tempoLeituraSegundos: number | null | undefined,
): number {
  if (documentos.length <= 0 || tempoLeituraSegundos == null) return 0
  const baseManualMinutos = somarBaseManualDocumentosSmartRead(documentos)
  return Math.max(0, baseManualMinutos - Math.max(0, tempoLeituraSegundos) / 60)
}

/** Saving de digitação + erros por documento (legado — digitação sempre 0; use funções de transação). */
export function calcularSavingDocumentoSmartRead(
  tipo: TipoDocumentoBaseSmartRead,
  camposErrados: number,
): { digitação: number; erros: number } {
  return {
    digitação: 0,
    erros: calcularSavingErrosDocumentoSmartRead(tipo, camposErrados),
  }
}

/** Recursos reduzidos = soma da base manual por documento − tempo de leitura medido (cronômetro). */
export function calcularRecursosReduzidosPorTempoLeituraSmartRead(
  documentos: Array<{ tipo_documento: string | null | undefined }>,
  tempoLeituraSegundos: number,
): Pick<MetricasTransacaoLeituraSmartRead, 'saving_total_minutos' | 'saving_total_brl'> | null {
  if (documentos.length <= 0) return null

  const savingDigitaçãoMinutos = calcularSavingDigitaçãoTransacaoLeituraSmartRead(
    documentos,
    tempoLeituraSegundos,
  )
  const custoHora =
    PARAMETROS_FINANCEIROS_SMART_READ.custo_hora_operador_brl *
    PARAMETROS_FINANCEIROS_SMART_READ.markup_venda

  return {
    saving_total_minutos: savingDigitaçãoMinutos,
    saving_total_brl: (savingDigitaçãoMinutos / 60) * custoHora,
  }
}

export type SavingDetalhadoTransacaoLeituraSmartRead = {
  digitação: number
  erros: number
  saving_total_minutos: number
  saving_total_brl: number
}

/** Estimativa de saving quando só há totais agregados (snapshot denormalizado / lista legado). */
export function estimarSavingAgregadoLeituraSmartRead(
  totalDocumentos: number,
  camposErrados: number,
  tipo: TipoDocumentoBaseSmartRead = 'outros',
  tempoLeituraSegundos: number | null = null,
): Pick<MetricasTransacaoLeituraSmartRead, 'saving_total_minutos' | 'saving_total_brl'> {
  if (totalDocumentos <= 0) {
    return { saving_total_minutos: 0, saving_total_brl: 0 }
  }

  const params = resolverParametrosTempoDocumentoSmartRead(tipo)
  const baseManualMinutos = params.tempo_digitação_manual_minutos * totalDocumentos
  const savingDigitação =
    tempoLeituraSegundos != null
      ? Math.max(0, baseManualMinutos - Math.max(0, tempoLeituraSegundos) / 60)
      : 0
  const savingErros = calcularSavingErrosDocumentoSmartRead(tipo, camposErrados)
  const savingTotalMinutos = savingDigitação + savingErros
  const custoHora =
    PARAMETROS_FINANCEIROS_SMART_READ.custo_hora_operador_brl *
    PARAMETROS_FINANCEIROS_SMART_READ.markup_venda
  return {
    saving_total_minutos: savingTotalMinutos,
    saving_total_brl: (savingTotalMinutos / 60) * custoHora,
  }
}

export function resolverSavingDetalhadoTransacaoLeituraSmartRead(
  transacao: Pick<
    MetricasTransacaoLeituraSmartRead,
    | 'total_documentos'
    | 'total_campos_extraidos'
    | 'tipos_documento'
    | 'tempo_extracao_ia_ms'
    | 'tempo_processo_total_ms'
  >,
): SavingDetalhadoTransacaoLeituraSmartRead | null {
  if (transacao.total_documentos <= 0) return null

  const tempoLeituraSegundos = resolverTempoLeituraSegundosSmartRead(
    transacao.tempo_processo_total_ms,
    transacao.tempo_extracao_ia_ms,
  )
  const tipo = inferirTipoDocumentoSavingLista(transacao.tipos_documento)
  const params = resolverParametrosTempoDocumentoSmartRead(tipo)
  const baseManualMinutos = params.tempo_digitação_manual_minutos * transacao.total_documentos
  const digitação =
    tempoLeituraSegundos != null
      ? Math.max(0, baseManualMinutos - Math.max(0, tempoLeituraSegundos) / 60)
      : 0
  const camposErrados = resolverContagemAcertoErroEstudoSmartRead(
    transacao.total_campos_extraidos ?? 0,
  ).errados
  const erros = calcularSavingErrosDocumentoSmartRead(tipo, camposErrados)
  const savingTotalMinutos = digitação + erros
  const custoHora =
    PARAMETROS_FINANCEIROS_SMART_READ.custo_hora_operador_brl *
    PARAMETROS_FINANCEIROS_SMART_READ.markup_venda

  if (savingTotalMinutos <= 0) return null

  return {
    digitação,
    erros,
    saving_total_minutos: savingTotalMinutos,
    saving_total_brl: (savingTotalMinutos / 60) * custoHora,
  }
}

function inferirTipoDocumentoSavingLista(
  tiposDocumento: string | null | undefined,
): TipoDocumentoBaseSmartRead {
  const rotulo = (tiposDocumento ?? '').split('·')[0]?.trim()
  return normalizarTipoDocumentoBaseSmartRead(rotulo)
}

/** Saving efetivo da transação — sempre recalculado pela regra SSOT (base manual − tempo de leitura). */
export function resolverSavingTransacaoLeituraSmartRead(
  transacao: Pick<
    MetricasTransacaoLeituraSmartRead,
    | 'saving_total_minutos'
    | 'saving_total_brl'
    | 'total_documentos'
    | 'total_campos_extraidos'
    | 'tipos_documento'
    | 'tempo_extracao_ia_ms'
    | 'tempo_processo_total_ms'
  >,
): Pick<MetricasTransacaoLeituraSmartRead, 'saving_total_minutos' | 'saving_total_brl'> | null {
  const saving = resolverSavingDetalhadoTransacaoLeituraSmartRead(transacao)
  if (!saving) return null
  return {
    saving_total_minutos: saving.saving_total_minutos,
    saving_total_brl: saving.saving_total_brl,
  }
}

function textoCampo(valor: unknown): string | null {
  if (typeof valor !== 'string') return null
  const texto = valor.trim()
  return texto.length > 0 ? texto : null
}

function valorEmObjeto(objeto: Record<string, unknown>, chaves: string[]): string | null {
  for (const chave of chaves) {
    const texto = textoCampo(objeto[chave])
    if (texto) return texto
  }
  return null
}

/** Número do documento (BL, Invoice, AWB…) a partir do JSON extraído do legado. */
export function extrairNumeroDocumentoLeituraSmartRead(
  dados: Record<string, unknown>,
  tipo: TipoDocumentoBaseSmartRead,
): string | null {
  const documento =
    dados.document && typeof dados.document === 'object' && !Array.isArray(dados.document)
      ? (dados.document as Record<string, unknown>)
      : null
  const awbInfo =
    dados.awbInfo && typeof dados.awbInfo === 'object' && !Array.isArray(dados.awbInfo)
      ? (dados.awbInfo as Record<string, unknown>)
      : null

  if (tipo === 'bl') {
    return (
      valorEmObjeto(dados, ['billOfLadingNumber']) ??
      (documento ? valorEmObjeto(documento, ['billOfLadingNumber', 'documentNumber', 'number']) : null) ??
      buscarNumeroDocumentoProfundo(dados, ['billOfLadingNumber', 'masterBillOfLadingNumber', 'documentNumber', 'number'])
    )
  }

  if (tipo === 'awb') {
    return (
      (awbInfo ? valorEmObjeto(awbInfo, ['mawbNumber', 'hawbNumber']) : null) ??
      valorEmObjeto(dados, ['mawbNumber', 'hawbNumber']) ??
      buscarNumeroDocumentoProfundo(dados, ['mawbNumber', 'hawbNumber'])
    )
  }

  return (
    (documento ? valorEmObjeto(documento, ['documentNumber', 'number', 'billOfLadingNumber']) : null) ??
    valorEmObjeto(dados, ['documentNumber', 'number', 'billOfLadingNumber']) ??
    textoCampo(dados['Número do Documento']) ??
    buscarNumeroDocumentoProfundo(dados, [
      'billOfLadingNumber',
      'documentNumber',
      'number',
      'masterBillOfLadingNumber',
      'mawbNumber',
      'hawbNumber',
    ])
  )
}

function buscarNumeroDocumentoProfundo(
  valor: unknown,
  chaves: string[],
  profundidade = 0,
): string | null {
  if (profundidade > 5 || valor == null) return null
  if (Array.isArray(valor)) {
    for (const item of valor) {
      const encontrado = buscarNumeroDocumentoProfundo(item, chaves, profundidade + 1)
      if (encontrado) return encontrado
    }
    return null
  }
  if (typeof valor !== 'object') return null

  const objeto = valor as Record<string, unknown>
  const direto = valorEmObjeto(objeto, chaves)
  if (direto) return direto

  for (const filho of Object.values(objeto)) {
    const encontrado = buscarNumeroDocumentoProfundo(filho, chaves, profundidade + 1)
    if (encontrado) return encontrado
  }
  return null
}

function resolverTempoProcessoTotalMs(contexto: ContextoTempoLeituraSmartRead): number | null {
  if (!contexto.created_at || !contexto.completed_at) return null
  const inicio = Date.parse(contexto.created_at)
  const fim = Date.parse(contexto.completed_at)
  if (Number.isNaN(inicio) || Number.isNaN(fim) || fim < inicio) return null
  return fim - inicio
}

export function metricasTransacaoLeituraVazias(): MetricasTransacaoLeituraSmartRead {
  return {
    total_documentos: 0,
    total_campos_extraidos: 0,
    total_campos_corretos: 0,
    total_campos_errados: 0,
    tipos_documento: null,
    numeros_documento: null,
    tempo_extracao_ia_ms: null,
    tempo_processo_total_ms: null,
    saving_total_minutos: null,
    saving_total_brl: null,
  }
}

export function calcularMetricasTransacaoLeituraSmartRead(
  leitura: LeituraMetricasEntrada,
  contexto: ContextoTempoLeituraSmartRead,
): MetricasTransacaoLeituraSmartRead {
  let totalCampos = 0
  let camposCorretos = 0
  let camposErrados = 0
  let savingDigitaçãoMinutos = 0
  let savingErrosMinutos = 0
  let tempoExtracaoIaMs = 0
  let documentos = 0

  const tiposVistos = new Map<TipoDocumentoBaseSmartRead, number>()
  const numerosVistos: string[] = []
  const documentosEntrada: Array<{ tipo_documento: string | null; campos_errados: number }> = []

  for (const arquivo of leitura.arquivos) {
    const documentosNoArquivo = arquivo.resultado_extracao?.length ?? 0
    const tempoArquivoMs = arquivo.tempo_extracao_ia_ms ?? null

    for (const item of arquivo.resultado_extracao ?? []) {
      documentos += 1
      const tipoNormalizado = normalizarTipoDocumentoBaseSmartRead(item.tipo_documento)
      const dados = item.dados ?? {}
      const contagem = resolverContagemCampos(item, tipoNormalizado)
      totalCampos += contagem.total
      camposCorretos += contagem.corretos
      camposErrados += contagem.errados
      documentosEntrada.push({
        tipo_documento: item.tipo_documento,
        campos_errados: contagem.errados,
      })

      const tempoDocMs =
        extrairTempoExtracaoIaMsDeDados(dados) ??
        (tempoArquivoMs != null && documentosNoArquivo > 0
          ? Math.round(tempoArquivoMs / documentosNoArquivo)
          : null)

      savingErrosMinutos += calcularSavingErrosDocumentoSmartRead(tipoNormalizado, contagem.errados)

      if (tempoDocMs != null) {
        tempoExtracaoIaMs += tempoDocMs
      }

      tiposVistos.set(tipoNormalizado, (tiposVistos.get(tipoNormalizado) ?? 0) + 1)

      const numero = extrairNumeroDocumentoLeituraSmartRead(dados, tipoNormalizado)
      if (numero && !numerosVistos.includes(numero)) numerosVistos.push(numero)
    }
  }

  if (documentos === 0) {
    return {
      ...metricasTransacaoLeituraVazias(),
      tempo_processo_total_ms: resolverTempoProcessoTotalMs(contexto),
    }
  }

  const tempoProcessoTotalMs = resolverTempoProcessoTotalMs(contexto)
  const tempoLeituraSegundos = resolverTempoLeituraSegundosSmartRead(
    tempoProcessoTotalMs,
    tempoExtracaoIaMs > 0 ? tempoExtracaoIaMs : null,
  )
  savingDigitaçãoMinutos = calcularSavingDigitaçãoTransacaoLeituraSmartRead(
    documentosEntrada,
    tempoLeituraSegundos,
  )

  const tiposDocumento = [...tiposVistos.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tipo]) => ROTULO_TIPO[tipo])
    .join(' · ')

  const savingTotalMinutos = savingDigitaçãoMinutos + savingErrosMinutos
  const custoHora =
    PARAMETROS_FINANCEIROS_SMART_READ.custo_hora_operador_brl *
    PARAMETROS_FINANCEIROS_SMART_READ.markup_venda

  return {
    total_documentos: documentos,
    total_campos_extraidos: totalCampos,
    total_campos_corretos: camposCorretos,
    total_campos_errados: camposErrados,
    tipos_documento: tiposDocumento || null,
    numeros_documento: numerosVistos.length > 0 ? numerosVistos.join(' · ') : null,
    tempo_extracao_ia_ms: tempoExtracaoIaMs > 0 ? tempoExtracaoIaMs : null,
    tempo_processo_total_ms: tempoProcessoTotalMs,
    saving_total_minutos: savingTotalMinutos,
    saving_total_brl: (savingTotalMinutos / 60) * custoHora,
  }
}
