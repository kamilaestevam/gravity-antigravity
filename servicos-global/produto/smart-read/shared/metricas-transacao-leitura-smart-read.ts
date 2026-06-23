/**
 * Métricas agregadas por leitura para a lista (paridade com Insights).
 */
import {
  PARAMETROS_FINANCEIROS_SMART_READ,
  normalizarTipoDocumentoBaseSmartRead,
  resolverParametrosTempoDocumentoSmartRead,
  type TipoDocumentoBaseSmartRead,
} from './dados-base-produto-tempo-smart-read.js'

export type LeituraMetricasEntrada = {
  id_leitura: string
  arquivos: Array<{
    resultado_extracao: Array<{
      tipo_documento: string | null
      dados: Record<string, unknown>
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

function normalizarAccuracy(valor: unknown): number | null {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return null
  return valor <= 1 ? valor : valor / 100
}

function extrairAccuracy(dados: Record<string, unknown>): number | null {
  for (const chave of ['accuracy', 'averageAccuracy', 'score', 'confidence']) {
    const normalizado = normalizarAccuracy(dados[chave])
    if (normalizado != null) return normalizado
  }
  return null
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
  dados: Record<string, unknown> | undefined,
  tipo: TipoDocumentoBaseSmartRead,
): { total: number; corretos: number; errados: number } {
  const base = resolverParametrosTempoDocumentoSmartRead(tipo)
  const contadosExtracao = dados ? contarCamposDados(dados) : 0
  const total = Math.max(contadosExtracao, base.campos_medio)
  const accuracy = dados ? extrairAccuracy(dados) : null

  if (accuracy == null) {
    return { total, corretos: total, errados: 0 }
  }

  const corretos = Math.round(total * accuracy)
  const errados = Math.max(0, total - corretos)
  return { total, corretos, errados }
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

/** Estimativa de saving quando só há totais agregados (snapshot denormalizado / lista legado). */
export function estimarSavingAgregadoLeituraSmartRead(
  totalDocumentos: number,
  camposErrados: number,
  tipo: TipoDocumentoBaseSmartRead = 'outros',
): Pick<MetricasTransacaoLeituraSmartRead, 'saving_total_minutos' | 'saving_total_brl'> {
  if (totalDocumentos <= 0) {
    return { saving_total_minutos: 0, saving_total_brl: 0 }
  }
  const saving = calcularSavingDocumento(tipo, camposErrados)
  const savingTotalMinutos = saving.digitação * totalDocumentos + saving.erros
  const custoHora =
    PARAMETROS_FINANCEIROS_SMART_READ.custo_hora_operador_brl *
    PARAMETROS_FINANCEIROS_SMART_READ.markup_venda
  return {
    saving_total_minutos: savingTotalMinutos,
    saving_total_brl: (savingTotalMinutos / 60) * custoHora,
  }
}

function calcularSavingDocumento(
  tipo: TipoDocumentoBaseSmartRead,
  camposErrados: number,
): { digitação: number; erros: number } {
  const params = resolverParametrosTempoDocumentoSmartRead(tipo)
  const savingDigitação =
    params.tempo_digitação_manual_minutos - params.tempo_digitação_smart_read_minutos
  const savingErros =
    camposErrados *
    (params.tempo_correcao_erro_manual_minutos_por_campo -
      params.tempo_correcao_erro_smart_read_minutos_por_campo)

  return {
    digitação: Math.max(0, savingDigitação),
    erros: Math.max(0, savingErros),
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

  for (const arquivo of leitura.arquivos) {
    for (const item of arquivo.resultado_extracao ?? []) {
      documentos += 1
      const tipoNormalizado = normalizarTipoDocumentoBaseSmartRead(item.tipo_documento)
      const dados = item.dados ?? {}
      const contagem = resolverContagemCampos(dados, tipoNormalizado)
      totalCampos += contagem.total
      camposCorretos += contagem.corretos
      camposErrados += contagem.errados

      const saving = calcularSavingDocumento(tipoNormalizado, contagem.errados)
      savingDigitaçãoMinutos += saving.digitação
      savingErrosMinutos += saving.erros

      const params = resolverParametrosTempoDocumentoSmartRead(tipoNormalizado)
      tempoExtracaoIaMs += Math.round(params.tempo_digitação_smart_read_minutos * 60 * 1000)

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
    tempo_extracao_ia_ms: tempoExtracaoIaMs,
    tempo_processo_total_ms: resolverTempoProcessoTotalMs(contexto),
    saving_total_minutos: savingTotalMinutos,
    saving_total_brl: (savingTotalMinutos / 60) * custoHora,
  }
}
