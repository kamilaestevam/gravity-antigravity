import type { LeituraListaSimulador, PerfilEmpresaSimulador } from './dados-cliente-maduro-simulador-smart-doc'
import { gerarValoresColunasDocumentoSimulador } from './gerar-valores-colunas-documento-simulador-smart-doc'
import { CATALOGO_COLUNAS_DOCUMENTO_SMART_READ } from './catalogo-colunas-documento-simulador-smart-doc'

export type StatusLeituraSimulador = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type SegmentoListaLeituraSimulador = 'envios' | 'transacoes-api'

export type TransacaoLeituraSimulador = {
  id_leitura: string
  nome_leitura: string | null
  nome_arquivo: string | null
  status_leitura: StatusLeituraSimulador
  total_arquivos: number
  total_documentos: number
  total_campos_extraidos: number
  total_campos_corretos: number
  total_campos_errados: number
  media_acertos: number | null
  tempo_extracao_ia_ms: number | null
  tempo_processo_total_ms: number | null
  saving_total_minutos: number | null
  saving_total_brl: number | null
  data_envio: string | null
  tipos_documento: string | null
  segmento: SegmentoListaLeituraSimulador
  id_empresa: string
  nome_empresa: string
}

export type DocumentoLeituraListaSimulador = {
  id_documento_leitura: string
  id_leitura: string
  nome_documento: string
  status_documento: StatusLeituraSimulador
  media_acertos: number | null
  data_envio: string | null
  tipo_documento: string | null
  numero_documento: string | null
  valores_colunas: Record<string, string>
}

export const COLUNAS_PADRAO_VISIVEIS_LISTA_SMART_DOC_SIMULADOR = [
  'nome_leitura',
  'tipos_documento',
  'numeros_documento',
  'status_leitura',
  'total_arquivos',
  'total_documentos',
  'total_campos_extraidos',
  'total_campos_corretos',
  'total_campos_errados',
  'media_acertos',
  'tempo_extracao_ia_ms',
  'tempo_processo_total_ms',
  'saving_total_minutos',
  'saving_total_brl',
  'data_envio',
] as const

/** Padrão do simulador marketing: todas as colunas (leitura + catálogo) visíveis ao abrir. */
export const CHAVES_TODAS_COLUNAS_LISTA_SMART_DOC_SIMULADOR: string[] = [
  ...COLUNAS_PADRAO_VISIVEIS_LISTA_SMART_DOC_SIMULADOR,
  ...CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.map((col) => col.key),
]

const TRANSACOES_API_MOCK: Omit<TransacaoLeituraSimulador, 'id_empresa' | 'nome_empresa'>[] = [
  {
    id_leitura: 'api-001',
    nome_leitura: 'Webhook ERP · lote 8821',
    nome_arquivo: null,
    status_leitura: 'COMPLETED',
    total_arquivos: 1,
    total_documentos: 12,
    total_campos_extraidos: 420,
    total_campos_corretos: 398,
    total_campos_errados: 22,
    media_acertos: 94.8,
    tempo_extracao_ia_ms: 18_400,
    tempo_processo_total_ms: 42_000,
    saving_total_minutos: 186,
    saving_total_brl: 930,
    data_envio: '2026-07-06T14:22:00.000Z',
    tipos_documento: 'INVOICE',
    segmento: 'transacoes-api',
  },
  {
    id_leitura: 'api-002',
    nome_leitura: 'Integração SAP · PO batch',
    nome_arquivo: null,
    status_leitura: 'PROCESSING',
    total_arquivos: 1,
    total_documentos: 4,
    total_campos_extraidos: 96,
    total_campos_corretos: 72,
    total_campos_errados: 24,
    media_acertos: 75,
    tempo_extracao_ia_ms: 9_200,
    tempo_processo_total_ms: null,
    saving_total_minutos: null,
    saving_total_brl: null,
    data_envio: '2026-07-06T11:05:00.000Z',
    tipos_documento: 'PACKING_LIST',
    segmento: 'transacoes-api',
  },
  {
    id_leitura: 'api-003',
    nome_leitura: 'Callback falhou · retry 3',
    nome_arquivo: null,
    status_leitura: 'FAILED',
    total_arquivos: 1,
    total_documentos: 0,
    total_campos_extraidos: 0,
    total_campos_corretos: 0,
    total_campos_errados: 0,
    media_acertos: null,
    tempo_extracao_ia_ms: null,
    tempo_processo_total_ms: 8_100,
    saving_total_minutos: null,
    saving_total_brl: null,
    data_envio: '2026-07-05T09:18:00.000Z',
    tipos_documento: null,
    segmento: 'transacoes-api',
  },
]

function parseDataBrParaIso(data: string): string {
  const partes = data.split('/')
  if (partes.length !== 3) return data
  const [dia, mes, ano] = partes
  const parsed = new Date(Number(ano), Number(mes) - 1, Number(dia), 10, 30, 0)
  return Number.isNaN(parsed.getTime()) ? data : parsed.toISOString()
}

function mapStatusLeituraSimulador(status: LeituraListaSimulador['status']): StatusLeituraSimulador {
  if (status === 'Conferido') return 'COMPLETED'
  if (status === 'Processando') return 'PROCESSING'
  return 'PENDING'
}

function inferirTiposDocumento(nome: string): string {
  const texto = nome.toLowerCase()
  if (texto.includes('invoice') || texto.includes('inv-')) return 'INVOICE'
  if (texto.includes('packing')) return 'PACKING_LIST'
  if (texto.includes('bl ') || texto.startsWith('bl')) return 'BL'
  if (texto.includes('awb')) return 'AWB'
  if (texto.includes('proforma')) return 'PROFORMA'
  return 'DOCUMENTO'
}

function inferirNumeroDocumento(nome: string): string | null {
  const match = nome.match(/(?:#|INV-|BL |AWB )([A-Z0-9\-]+)/i)
  return match?.[1] ?? null
}

function materializarTransacao(
  leitura: LeituraListaSimulador,
  empresa: PerfilEmpresaSimulador,
): TransacaoLeituraSimulador {
  const errados = Math.max(0, leitura.camposExtraidos - leitura.camposConferidos)
  const media =
    leitura.camposExtraidos > 0
      ? (leitura.camposConferidos / leitura.camposExtraidos) * 100
      : null
  const status = mapStatusLeituraSimulador(leitura.status)
  const savingMinutos = errados > 0 ? errados * 2.4 : null
  const savingBrl = savingMinutos != null ? savingMinutos * 4.8 : null

  return {
    id_leitura: `${empresa.id}-${leitura.id}`,
    nome_leitura: leitura.nome,
    nome_arquivo: null,
    status_leitura: status,
    total_arquivos: leitura.docs,
    total_documentos: leitura.docs,
    total_campos_extraidos: leitura.camposExtraidos,
    total_campos_corretos: leitura.camposConferidos,
    total_campos_errados: errados,
    media_acertos: media,
    tempo_extracao_ia_ms: status === 'PENDING' ? null : 12_000 + leitura.camposExtraidos * 42,
    tempo_processo_total_ms: status === 'PENDING' ? null : 28_000 + leitura.camposExtraidos * 95,
    saving_total_minutos: savingMinutos,
    saving_total_brl: savingBrl,
    data_envio: parseDataBrParaIso(leitura.data),
    tipos_documento: inferirTiposDocumento(leitura.nome),
    segmento: 'envios',
    id_empresa: empresa.id,
    nome_empresa: empresa.nome,
  }
}

export function materializarTransacoesListaSimulador(
  empresas: PerfilEmpresaSimulador[],
): TransacaoLeituraSimulador[] {
  const envios = empresas.flatMap((empresa) =>
    empresa.listaLeituras.map((leitura) => materializarTransacao(leitura, empresa)),
  )
  const empresaRef = empresas[0]
  const api = TRANSACOES_API_MOCK.map((item) => ({
    ...item,
    id_empresa: empresaRef?.id ?? 'demo',
    nome_empresa: empresaRef?.nome ?? 'Demo',
  }))
  return [...envios, ...api]
}

export function filtrarTransacoesPorSegmento(
  transacoes: TransacaoLeituraSimulador[],
  segmento: SegmentoListaLeituraSimulador,
): TransacaoLeituraSimulador[] {
  return transacoes.filter((item) => item.segmento === segmento)
}

export function montarDocumentosLeituraListaSimulador(
  leitura: TransacaoLeituraSimulador,
): DocumentoLeituraListaSimulador[] {
  const total = Math.max(1, leitura.total_documentos)
  const tipoBase = leitura.tipos_documento ?? 'DOCUMENTO'
  const numeroBase = inferirNumeroDocumento(leitura.nome_leitura ?? '') ?? '—'

  return Array.from({ length: total }, (_, indice) => {
    const sufixo = total > 1 ? ` ${String.fromCharCode(65 + indice)}` : ''
    const nome =
      total === 1
        ? (leitura.nome_leitura ?? `Documento ${indice + 1}`)
        : `${tipoBase.replace('_', ' ')}${sufixo}`
    return {
      id_documento_leitura: `${leitura.id_leitura}-doc-${indice + 1}`,
      id_leitura: leitura.id_leitura,
      nome_documento: nome,
      status_documento: leitura.status_leitura,
      media_acertos: leitura.media_acertos,
      data_envio: leitura.data_envio,
      tipo_documento: tipoBase,
      numero_documento: indice === 0 ? numeroBase : `${numeroBase}-${indice + 1}`,
      valores_colunas: gerarValoresColunasDocumentoSimulador(
        tipoBase,
        `${leitura.id_leitura}-doc-${indice + 1}`,
      ),
    }
  })
}

export type ResumoKpiListaSimuladorSmartDoc = {
  totalLeituras: number
  mediaAcertos: number | null
  savingMinutos: number | null
  savingBrl: number | null
  camposErrados: number
}

export function calcularResumoKpiListaSimulador(
  transacoes: TransacaoLeituraSimulador[],
): ResumoKpiListaSimuladorSmartDoc {
  let savingMinutos = 0
  let savingBrl = 0
  let leiturasComSaving = 0
  let camposErrados = 0
  const medias: number[] = []

  for (const item of transacoes) {
    camposErrados += item.total_campos_errados
    if (item.media_acertos != null) medias.push(item.media_acertos)
    if (item.saving_total_minutos != null && item.saving_total_minutos > 0) {
      savingMinutos += item.saving_total_minutos
      savingBrl += item.saving_total_brl ?? 0
      leiturasComSaving += 1
    }
  }

  return {
    totalLeituras: transacoes.length,
    mediaAcertos: medias.length > 0 ? medias.reduce((a, b) => a + b, 0) / medias.length : null,
    savingMinutos: leiturasComSaving > 0 ? savingMinutos : null,
    savingBrl: leiturasComSaving > 0 ? savingBrl : null,
    camposErrados,
  }
}

export const STATUS_FILTRO_LISTA_SMART_DOC_SIMULADOR: Array<{
  id: string
  label: string
  cor: string
  valor?: StatusLeituraSimulador
}> = [
  { id: 'todas', label: 'Todos', cor: '#a78bfa' },
  { id: 'PENDING', label: 'Pendente', cor: '#94a3b8', valor: 'PENDING' },
  { id: 'PROCESSING', label: 'Processando', cor: '#60a5fa', valor: 'PROCESSING' },
  { id: 'COMPLETED', label: 'Concluída', cor: '#34d399', valor: 'COMPLETED' },
  { id: 'FAILED', label: 'Falhou', cor: '#f87171', valor: 'FAILED' },
]
