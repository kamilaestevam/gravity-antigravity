/**
 * tipo-arquivo-nova-leitura-smart-read.ts — estado local dos arquivos no wizard
 */

import type { Leitura } from './schemas'

export type StatusArquivoLocalNovaLeitura =
  | 'anexado'
  | 'enviando'
  | 'analisando'
  | 'completo'
  | 'erro'

export type DocumentoExtraidoArquivoLocal = {
  id_documento: string
  tipo_documento: string
  indice: number
}

export type ArquivoLocalNovaLeitura = {
  id_arquivo_local: string
  arquivo: File
  status_arquivo_local: StatusArquivoLocalNovaLeitura
  id_leitura: string | null
  id_arquivo: string | null
  leitura: Leitura | null
  mensagem_erro: string | null
  expandido: boolean
}

export const LIMITE_DOCUMENTOS_NOVA_LEITURA = 100

export function criarArquivoLocalNovaLeitura(arquivo: File): ArquivoLocalNovaLeitura {
  return {
    id_arquivo_local: crypto.randomUUID(),
    arquivo,
    status_arquivo_local: 'anexado',
    id_leitura: null,
    id_arquivo: null,
    leitura: null,
    mensagem_erro: null,
    expandido: false,
  }
}

function resolverArquivoApiLeitura(item: ArquivoLocalNovaLeitura): Leitura['arquivos'][number] | null {
  const arquivos = item.leitura?.arquivos
  if (!arquivos?.length) return null

  if (item.id_arquivo) {
    const porId = arquivos.find((arq) => arq.id_arquivo === item.id_arquivo)
    if (porId) return porId
  }

  const porNome = arquivos.find((arq) => arq.nome_arquivo === item.arquivo.name)
  if (porNome) return porNome

  return arquivos.length === 1 ? arquivos[0] : null
}

function rotuloTipoDocumento(tipo: string | null | undefined, indice: number): string {
  const normalizado = tipo?.trim()
  if (normalizado) return normalizado
  return `Documento ${indice + 1}`
}

export function extrairDocumentosArquivoLocal(item: ArquivoLocalNovaLeitura): DocumentoExtraidoArquivoLocal[] {
  const arquivoApi = resolverArquivoApiLeitura(item)
  const extracao = arquivoApi?.resultado_extracao
  if (!extracao?.length) return []

  return extracao.map((doc, indice) => ({
    id_documento: `${item.id_arquivo_local}:${indice}`,
    tipo_documento: rotuloTipoDocumento(doc.tipo_documento, indice),
    indice,
  }))
}

export function contarDocumentosArquivoLocal(item: ArquivoLocalNovaLeitura): number {
  return extrairDocumentosArquivoLocal(item).length
}

export function tipoDocumentoPrincipalArquivoLocal(item: ArquivoLocalNovaLeitura): string | null {
  const docs = extrairDocumentosArquivoLocal(item)
  return docs[0]?.tipo_documento ?? null
}

export function todosArquivosAnaliseCompleta(itens: ArquivoLocalNovaLeitura[]): boolean {
  return itens.length > 0 && itens.every((item) => item.status_arquivo_local === 'completo')
}

export function todosArquivosProcessamentoFinalizado(itens: ArquivoLocalNovaLeitura[]): boolean {
  return (
    itens.length > 0 &&
    itens.every(
      (item) => item.status_arquivo_local === 'completo' || item.status_arquivo_local === 'erro',
    )
  )
}

export function algumArquivoEmAnalise(itens: ArquivoLocalNovaLeitura[]): boolean {
  return itens.some(
    (item) => item.status_arquivo_local === 'enviando' || item.status_arquivo_local === 'analisando',
  )
}

export function contarDocumentosIdentificadosLote(itens: ArquivoLocalNovaLeitura[]): number {
  return itens.reduce((acc, item) => acc + contarDocumentosArquivoLocal(item), 0)
}
