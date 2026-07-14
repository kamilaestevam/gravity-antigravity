/**
 * tipo-arquivo-nova-leitura-smart-read.ts — estado local dos arquivos no wizard
 */

import type { Leitura, StatusLeitura } from './schemas'
import { corrigirEncodingNomeArquivoSmartRead } from '../../../shared/corrigir-encoding-nome-arquivo-smart-read'
import { passoInicialLeituraSmartRead as passoInicialLeituraSmartReadShared } from '../../../shared/resolver-passo-retomar-leitura-smart-read'

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

/** Blob local ainda disponível (upload na sessão atual). Leituras retomadas usam File vazio. */
export function arquivoLocalTemBlobVisualizavel(arquivo: File): boolean {
  return arquivo.size > 0
}

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

/**
 * Passo inicial ao retomar uma leitura existente, derivado do status:
 * COMPLETED → 4 (Resultado); PROCESSING/PENDING/FAILED → 2 (Análise).
 */
export function passoInicialLeituraSmartRead(status: StatusLeitura): number {
  return passoInicialLeituraSmartReadShared(status)
}

function statusArquivoLocalDeStatusLeitura(status: StatusLeitura): StatusArquivoLocalNovaLeitura {
  if (status === 'COMPLETED') return 'completo'
  if (status === 'FAILED') return 'erro'
  return 'analisando'
}

/**
 * Hidrata os arquivos locais do wizard a partir de uma leitura já existente
 * (modo "retomar"). O blob original não está disponível na API, então usamos
 * um File vazio apenas para preservar o nome — os dados extraídos vêm de `leitura`.
 */
export function criarArquivosLocaisDeLeitura(leitura: Leitura): ArquivoLocalNovaLeitura[] {
  return leitura.arquivos.map((arquivo) => ({
    id_arquivo_local: crypto.randomUUID(),
    arquivo: new File(
      [],
      corrigirEncodingNomeArquivoSmartRead(arquivo.nome_arquivo) ?? arquivo.nome_arquivo ?? 'documento',
    ),
    status_arquivo_local: statusArquivoLocalDeStatusLeitura(arquivo.status_arquivo),
    id_leitura: leitura.id_leitura,
    id_arquivo: arquivo.id_arquivo,
    leitura,
    mensagem_erro: null,
    expandido: true,
  }))
}

/**
 * Consolida a leitura editada a partir dos arquivos locais. As edições de
 * Conferência ficam espalhadas em cada `item.leitura`, então reunimos o arquivo
 * resolvido de cada item numa única Leitura — pronta para persistir/restaurar.
 */
export function consolidarLeituraDeArquivosLocais(itens: ArquivoLocalNovaLeitura[]): Leitura | null {
  const base = itens.find((item) => item.leitura)?.leitura
  if (!base) return null
  const arquivos = itens
    .map((item) => resolverArquivoApiLeitura(item))
    .filter((arquivo): arquivo is Leitura['arquivos'][number] => arquivo !== null)
  return { ...base, arquivos: arquivos.length > 0 ? arquivos : base.arquivos }
}

function statusArquivoApiDeLocal(
  status: StatusArquivoLocalNovaLeitura,
): Leitura['arquivos'][number]['status_arquivo'] {
  if (status === 'completo') return 'COMPLETED'
  if (status === 'erro') return 'FAILED'
  return 'PROCESSING'
}

/**
 * Leitura mínima para persistir passo 2 com análise em andamento (antes de todos completos).
 */
export function montarLeituraMinimaProcessamentoDeArquivosLocais(
  idLeitura: string,
  nomeLeitura: string,
  itens: ArquivoLocalNovaLeitura[],
): Leitura | null {
  const consolidada = consolidarLeituraDeArquivosLocais(itens)
  if (consolidada && consolidada.arquivos.length > 0) {
    return {
      ...consolidada,
      id_leitura: idLeitura,
      nome_leitura: nomeLeitura,
      status_leitura: consolidada.status_leitura ?? 'PROCESSING',
    }
  }

  const enviados = itens.filter((item) => item.id_leitura && item.id_arquivo)
  if (enviados.length === 0) return null

  const arquivosApi = enviados.map((item) => {
    const resolvido = resolverArquivoApiLeitura(item)
    if (resolvido) return resolvido
    return {
      id_arquivo: item.id_arquivo!,
      nome_arquivo: item.arquivo.name,
      status_arquivo: statusArquivoApiDeLocal(item.status_arquivo_local),
      resultado_extracao: null,
    }
  })

  return {
    id_leitura: idLeitura,
    nome_leitura: nomeLeitura,
    status_leitura: 'PROCESSING',
    total_arquivos: itens.length,
    arquivos_processados: itens.filter((item) => item.status_arquivo_local === 'completo').length,
    arquivos: arquivosApi,
  }
}

export function resolverArquivoApiLeitura(
  item: ArquivoLocalNovaLeitura,
): Leitura['arquivos'][number] | null {
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

function montarRotulosDocumentosSidebar(
  extracao: Array<{ tipo_documento: string | null | undefined }>,
): string[] {
  const bases = extracao.map((doc, indice) => rotuloTipoDocumento(doc.tipo_documento, indice))
  const totais = new Map<string, number>()
  for (const rotulo of bases) {
    totais.set(rotulo, (totais.get(rotulo) ?? 0) + 1)
  }
  const sequencia = new Map<string, number>()
  return bases.map((rotulo) => {
    if ((totais.get(rotulo) ?? 0) <= 1) return rotulo
    const n = (sequencia.get(rotulo) ?? 0) + 1
    sequencia.set(rotulo, n)
    return `${rotulo} ${n}`
  })
}

/** Evita re-render no polling quando status e quantidade de documentos não mudaram. */
export function pollAtualizacaoArquivoEquivalente(
  atual: ArquivoLocalNovaLeitura,
  patch: Partial<ArquivoLocalNovaLeitura>,
): boolean {
  const statusNovo = patch.status_arquivo_local ?? atual.status_arquivo_local
  if (statusNovo !== atual.status_arquivo_local) return false
  if (patch.mensagem_erro !== undefined && patch.mensagem_erro !== atual.mensagem_erro) return false
  if (patch.expandido !== undefined && patch.expandido !== atual.expandido) return false
  if (!patch.leitura) return true

  if (atual.leitura?.status_leitura !== patch.leitura.status_leitura) return false

  const extracaoAtual = resolverArquivoApiLeitura(atual)?.resultado_extracao?.length ?? 0
  const extracaoNova =
    resolverArquivoApiLeitura({ ...atual, leitura: patch.leitura })?.resultado_extracao?.length ?? 0
  return extracaoAtual === extracaoNova
}

export function extrairDocumentosArquivoLocal(item: ArquivoLocalNovaLeitura): DocumentoExtraidoArquivoLocal[] {
  const arquivoApi = resolverArquivoApiLeitura(item)
  const extracao = arquivoApi?.resultado_extracao
  if (!extracao?.length) return []

  const rotulos = montarRotulosDocumentosSidebar(extracao)

  return extracao.map((doc, indice) => ({
    id_documento: `${item.id_arquivo_local}:${indice}`,
    tipo_documento: rotulos[indice] ?? rotuloTipoDocumento(doc.tipo_documento, indice),
    indice,
  }))
}

/** Documentos extraídos de todos os arquivos locais (para métricas saving no passo 2). */
export function listarDocumentosExtracaoArquivosLocaisNovaLeitura(
  itens: ArquivoLocalNovaLeitura[],
): Array<{ tipo_documento: string | null; dados: Record<string, unknown> }> {
  return itens.flatMap((item) => {
    const arquivoApi = resolverArquivoApiLeitura(item)
    return arquivoApi?.resultado_extracao ?? []
  })
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

export function extrairDadosArquivoLocal(
  item: ArquivoLocalNovaLeitura,
  indiceDocumento = 0,
): Record<string, unknown> | null {
  const arquivoApi = resolverArquivoApiLeitura(item)
  return arquivoApi?.resultado_extracao?.[indiceDocumento]?.dados ?? null
}

export function extrairDadosLeitura(
  leitura: Leitura | null,
  indiceArquivo = 0,
  indiceDocumento = 0,
): Record<string, unknown> | null {
  const arquivo = leitura?.arquivos?.[indiceArquivo]
  return arquivo?.resultado_extracao?.[indiceDocumento]?.dados ?? null
}

export function tipoDocumentoLeitura(
  leitura: Leitura | null,
  indiceArquivo = 0,
  indiceDocumento = 0,
): string | null {
  const arquivo = leitura?.arquivos?.[indiceArquivo]
  return arquivo?.resultado_extracao?.[indiceDocumento]?.tipo_documento ?? null
}
