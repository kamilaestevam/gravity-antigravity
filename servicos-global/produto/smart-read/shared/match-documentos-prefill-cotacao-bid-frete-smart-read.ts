/**
 * SSOT — listagem e agrupamento de documentos da leitura para match → cotação BID Frete.
 */
import { normalizarTipoDocumentoBaseSmartRead } from './dados-base-produto-tempo-smart-read.js'
import type { LeituraParaConversaoCotacaoBidFrete } from './converter-leitura-para-cotacao-bid-frete-internacional-smart-read.js'

export type DocumentoMatchPrefillCotacaoBidFrete = {
  id_documento: string
  indice_arquivo: number
  indice_documento: number
  tipo_documento: string
  tipo_base: ReturnType<typeof normalizarTipoDocumentoBaseSmartRead>
  rotulo: string
  numero_referencia: string | null
  resumo: string
}

export type GrupoCotacaoMatchPrefillBidFrete = {
  id_grupo: string
  nome_grupo: string
  ids_documentos: string[]
}

function lerCaminho(obj: Record<string, unknown>, segmentos: string[]): unknown {
  let atual: unknown = obj
  for (const seg of segmentos) {
    if (atual == null || typeof atual !== 'object') return undefined
    atual = (atual as Record<string, unknown>)[seg]
  }
  return atual
}

function valorCampo(dados: Record<string, unknown>, caminhos: string[]): string | null {
  for (const caminho of caminhos) {
    const bruto = lerCaminho(dados, caminho.split('.'))
    if (bruto == null) continue
    const texto = String(bruto).trim()
    if (texto.length > 0) return texto
  }
  return null
}

function normalizarChaveReferencia(valor: string | null): string | null {
  if (!valor) return null
  const limpo = valor.trim().toUpperCase().replace(/\s+/g, '')
  return limpo.length > 0 ? limpo : null
}

export function idDocumentoMatchPrefill(indiceArquivo: number, indiceDocumento: number): string {
  return `${indiceArquivo}:${indiceDocumento}`
}

export function listarDocumentosMatchPrefillCotacaoBidFrete(
  leitura: LeituraParaConversaoCotacaoBidFrete,
): DocumentoMatchPrefillCotacaoBidFrete[] {
  const lista: DocumentoMatchPrefillCotacaoBidFrete[] = []
  const contagemPorTipo = new Map<string, number>()

  leitura.arquivos.forEach((arquivo, indiceArquivo) => {
    ;(arquivo.resultado_extracao ?? []).forEach((doc, indiceDocumento) => {
      const dados = (doc.dados ?? {}) as Record<string, unknown>
      const tipo = doc.tipo_documento?.trim() || 'DOCUMENTO'
      const tipoBase = normalizarTipoDocumentoBaseSmartRead(doc.tipo_documento)
      const seq = (contagemPorTipo.get(tipoBase) ?? 0) + 1
      contagemPorTipo.set(tipoBase, seq)
      const numero = normalizarChaveReferencia(
        valorCampo(dados, [
          'document.invoiceNumber',
          'invoiceNumber',
          'document.documentNumber',
          'document.number',
          'invoice.number',
        ]),
      )
      const letra = String.fromCharCode(64 + seq)
      const partesRotulo = [`${tipo.toUpperCase()} ${letra}`]
      if (numero) partesRotulo.push(numero)
      lista.push({
        id_documento: idDocumentoMatchPrefill(indiceArquivo, indiceDocumento),
        indice_arquivo: indiceArquivo,
        indice_documento: indiceDocumento,
        tipo_documento: tipo,
        tipo_base: tipoBase,
        rotulo: partesRotulo.join(' · '),
        numero_referencia: numero,
        resumo:
          valorCampo(dados, [
            'goods.description',
            'merchandise.description',
            'description',
            'exporter.name',
            'importer.name',
          ])?.slice(0, 80) ?? 'Sem resumo',
      })
    })
  })

  return lista
}

/** Agrupa invoice + packing (e afins) pela mesma referência; demais docs ficam sozinhos. */
export function sugerirGruposMatchPrefillCotacaoBidFrete(
  documentos: DocumentoMatchPrefillCotacaoBidFrete[],
): GrupoCotacaoMatchPrefillBidFrete[] {
  if (documentos.length === 0) return []
  if (documentos.length === 1) {
    return [{
      id_grupo: 'grupo-1',
      nome_grupo: 'Cotação 1',
      ids_documentos: [documentos[0].id_documento],
    }]
  }

  const porRef = new Map<string, DocumentoMatchPrefillCotacaoBidFrete[]>()
  const semRef: DocumentoMatchPrefillCotacaoBidFrete[] = []

  for (const doc of documentos) {
    if (doc.numero_referencia) {
      const lista = porRef.get(doc.numero_referencia) ?? []
      lista.push(doc)
      porRef.set(doc.numero_referencia, lista)
    } else {
      semRef.push(doc)
    }
  }

  const grupos: GrupoCotacaoMatchPrefillBidFrete[] = []
  let n = 1

  for (const [ref, docs] of porRef) {
    grupos.push({
      id_grupo: `grupo-${n}`,
      nome_grupo: docs.length > 1 ? `Cotação ${n} · ${ref}` : `Cotação ${n}`,
      ids_documentos: docs.map((d) => d.id_documento),
    })
    n += 1
  }

  for (const doc of semRef) {
    grupos.push({
      id_grupo: `grupo-${n}`,
      nome_grupo: `Cotação ${n}`,
      ids_documentos: [doc.id_documento],
    })
    n += 1
  }

  return grupos
}

export function filtrarLeituraPorDocumentosMatchPrefill(
  leitura: LeituraParaConversaoCotacaoBidFrete,
  idsDocumentos: string[],
): LeituraParaConversaoCotacaoBidFrete {
  const selecionados = new Set(idsDocumentos)
  return {
    id_leitura: leitura.id_leitura,
    arquivos: leitura.arquivos.map((arquivo, indiceArquivo) => ({
      resultado_extracao: (arquivo.resultado_extracao ?? []).filter((_doc, indiceDocumento) =>
        selecionados.has(idDocumentoMatchPrefill(indiceArquivo, indiceDocumento)),
      ),
    })),
  }
}

export function moverDocumentoEntreGruposMatchPrefill(
  grupos: GrupoCotacaoMatchPrefillBidFrete[],
  idDocumento: string,
  idGrupoDestino: string,
): GrupoCotacaoMatchPrefillBidFrete[] {
  const semDoc = grupos.map((g) => ({
    ...g,
    ids_documentos: g.ids_documentos.filter((id) => id !== idDocumento),
  }))
  return semDoc.map((g) =>
    g.id_grupo === idGrupoDestino
      ? { ...g, ids_documentos: [...g.ids_documentos, idDocumento] }
      : g,
  ).filter((g) => g.ids_documentos.length > 0)
}

export function criarGrupoVazioMatchPrefill(
  grupos: GrupoCotacaoMatchPrefillBidFrete[],
): GrupoCotacaoMatchPrefillBidFrete[] {
  const n = grupos.length + 1
  return [
    ...grupos,
    { id_grupo: `grupo-${n}-${Date.now()}`, nome_grupo: `Cotação ${n}`, ids_documentos: [] },
  ]
}
