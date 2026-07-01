/**
 * montar-documentos-leitura-smart-read.ts — segunda camada da lista (documentos lidos)
 */
import { extrairValoresColunasDocumento } from './extrair-valores-colunas-documento-smart-read.js'
import { normalizarTipoDocumentoBaseSmartRead } from './dados-base-produto-tempo-smart-read.js'
import { extrairNumeroDocumentoLeituraSmartRead } from './metricas-transacao-leitura-smart-read.js'

export type StatusLeituraDocumentoLista =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'

export type LeituraParaMontarDocumentosLista = {
  id_leitura: string
  arquivos: Array<{
    id_arquivo: string
    nome_arquivo: string | null
    status_arquivo: StatusLeituraDocumentoLista
    resultado_extracao?: Array<{
      tipo_documento: string | null
      dados: Record<string, unknown>
    }> | null
  }>
}

export type DocumentoLeituraLista = {
  id_documento_leitura: string
  id_leitura: string
  id_arquivo: string
  nome_documento: string
  status_documento: StatusLeituraDocumentoLista
  media_acertos: number | null
  data_envio: string | null
  tipo_documento: string | null
  numero_documento: string | null
  valores_colunas: Record<string, string>
}

function extrairMediaAcertosDocumento(dados: Record<string, unknown>): number | null {
  for (const chave of ['accuracy', 'averageAccuracy', 'score', 'confidence']) {
    const valor = dados[chave]
    if (typeof valor === 'number' && Number.isFinite(valor)) return valor
  }
  return null
}

function rotuloComSufixo(base: string, indice: number, total: number): string {
  if (total <= 1) return base
  return `${base} ${String.fromCharCode(64 + indice)}`
}

export function montarDocumentosLeituraLista(leitura: LeituraParaMontarDocumentosLista): DocumentoLeituraLista[] {
  const entradas: {
    chaveTipo: string
    base: string
    tipoDocumento: string | null
    arquivo: LeituraParaMontarDocumentosLista['arquivos'][number]
    indiceExtracao: number | null
  }[] = []

  for (const arquivo of leitura.arquivos) {
    const extracao = arquivo.resultado_extracao
    if (extracao && extracao.length > 0) {
      extracao.forEach((item, indice) => {
        const tipoDocumento = item.tipo_documento?.trim() || null
        const base = tipoDocumento || arquivo.nome_arquivo || 'Documento'
        entradas.push({
          chaveTipo: base.toLowerCase(),
          base,
          tipoDocumento,
          arquivo,
          indiceExtracao: indice,
        })
      })
    } else {
      const base = arquivo.nome_arquivo || 'Arquivo'
      entradas.push({
        chaveTipo: base.toLowerCase(),
        base,
        tipoDocumento: null,
        arquivo,
        indiceExtracao: null,
      })
    }
  }

  const totalPorTipo = new Map<string, number>()
  for (const entrada of entradas) {
    totalPorTipo.set(entrada.chaveTipo, (totalPorTipo.get(entrada.chaveTipo) ?? 0) + 1)
  }

  const indicePorTipo = new Map<string, number>()

  return entradas.map((entrada) => {
    const indice = (indicePorTipo.get(entrada.chaveTipo) ?? 0) + 1
    indicePorTipo.set(entrada.chaveTipo, indice)
    const total = totalPorTipo.get(entrada.chaveTipo) ?? 1
    const nome = rotuloComSufixo(entrada.base, indice, total)
    const sufixoId =
      entrada.indiceExtracao != null ? String(entrada.indiceExtracao) : 'arquivo'

    const dadosExtracao =
      entrada.indiceExtracao != null
        ? entrada.arquivo.resultado_extracao?.[entrada.indiceExtracao]?.dados
        : undefined
    const tipoNormalizado = normalizarTipoDocumentoBaseSmartRead(entrada.tipoDocumento)

    return {
      id_documento_leitura: `${leitura.id_leitura}:${entrada.arquivo.id_arquivo}:${sufixoId}`,
      id_leitura: leitura.id_leitura,
      id_arquivo: entrada.arquivo.id_arquivo,
      nome_documento: nome,
      status_documento: entrada.arquivo.status_arquivo,
      media_acertos: dadosExtracao ? extrairMediaAcertosDocumento(dadosExtracao) : null,
      data_envio: null,
      tipo_documento: entrada.tipoDocumento,
      numero_documento: dadosExtracao
        ? extrairNumeroDocumentoLeituraSmartRead(dadosExtracao, tipoNormalizado)
        : null,
      valores_colunas: dadosExtracao ? extrairValoresColunasDocumento(dadosExtracao) : {},
    }
  })
}
