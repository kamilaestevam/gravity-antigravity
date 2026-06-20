/**
 * extrair-dados-documento-leitura-smart-read.ts — agrega documentos/campos/entidades das leituras
 */

import type { Leitura } from '../../shared/schemas'
import {
  normalizarTipoDocumentoBaseSmartRead,
  resolverParametrosTempoDocumentoSmartRead,
  type TipoDocumentoBaseSmartRead,
} from './dados-base-produto-tempo-smart-read'

const CHAVES_METADADO = new Set([
  'accuracy',
  'averageaccuracy',
  'score',
  'confidence',
  'id',
  '_id',
])

const CHAVES_EXPORTADOR = [
  'exportador',
  'exporter',
  'shipper',
  'exportador_nome',
  'nome_exportador',
  'shipper_name',
]

const CHAVES_IMPORTADOR = [
  'importador',
  'importer',
  'consignee',
  'importador_nome',
  'nome_importador',
  'consignee_name',
  'notify_party',
]

export type DocumentoInsightsSmartRead = {
  id_documento: string
  id_leitura: string
  tipo_rotulo: string
  tipo_normalizado: TipoDocumentoBaseSmartRead
  total_campos: number
  campos_corretos: number
  campos_errados: number
  accuracy: number | null
  exportador: string | null
  importador: string | null
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

function extrairTextoEntidade(dados: Record<string, unknown>, chaves: string[]): string | null {
  for (const chave of chaves) {
    const valor = dados[chave]
    if (typeof valor === 'string' && valor.trim()) return valor.trim()
    if (valor && typeof valor === 'object' && 'nome' in valor) {
      const nome = (valor as { nome?: unknown }).nome
      if (typeof nome === 'string' && nome.trim()) return nome.trim()
    }
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
): { total: number; corretos: number; errados: number; accuracy: number | null } {
  const base = resolverParametrosTempoDocumentoSmartRead(tipo)
  const contadosExtracao = dados ? contarCamposDados(dados) : 0
  // Acerto do documento aplica-se ao volume médio de campos do tipo (DOCS BASE PRODUTO),
  // não só metadados pontuais (exportador/importador) presentes na extração parcial.
  const total = Math.max(contadosExtracao, base.campos_medio)
  const accuracy = dados ? extrairAccuracy(dados) : null

  if (accuracy == null) {
    return { total, corretos: 0, errados: 0, accuracy: null }
  }

  const corretos = Math.round(total * accuracy)
  const errados = Math.max(0, total - corretos)
  return { total, corretos, errados, accuracy }
}

export function extrairDocumentosInsightsLeituraSmartRead(
  leitura: Leitura,
): DocumentoInsightsSmartRead[] {
  const documentos: DocumentoInsightsSmartRead[] = []

  for (const arquivo of leitura.arquivos) {
    const extracao = arquivo.resultado_extracao
    if (extracao && extracao.length > 0) {
      extracao.forEach((item, indice) => {
        const tipoRotulo = item.tipo_documento?.trim() || arquivo.nome_arquivo || 'Documento'
        const tipoNormalizado = normalizarTipoDocumentoBaseSmartRead(tipoRotulo)
        const dados = item.dados ?? {}
        const contagem = resolverContagemCampos(dados, tipoNormalizado)

        documentos.push({
          id_documento: `${leitura.id_leitura}:${arquivo.id_arquivo}:${indice}`,
          id_leitura: leitura.id_leitura,
          tipo_rotulo: tipoRotulo,
          tipo_normalizado: tipoNormalizado,
          total_campos: contagem.total,
          campos_corretos: contagem.corretos,
          campos_errados: contagem.errados,
          accuracy: contagem.accuracy,
          exportador: extrairTextoEntidade(dados, CHAVES_EXPORTADOR),
          importador: extrairTextoEntidade(dados, CHAVES_IMPORTADOR),
        })
      })
    }
  }

  return documentos
}

export function extrairDocumentosInsightsDeLeituras(
  leituras: Leitura[],
): DocumentoInsightsSmartRead[] {
  return leituras.flatMap(extrairDocumentosInsightsLeituraSmartRead)
}
