/**
 * SSOT — edição inline na lista Smart Docs com espelhamento por grupo (sufixo A, B…).
 */
import { definirValorPorCaminhoDadosLeituraSmartRead } from './definir-valor-por-caminho-dados-leitura-smart-read.js'
import { normalizarTipoDocumentoBaseSmartRead } from './dados-base-produto-tempo-smart-read.js'

export type ColunaCatalogoListaEdicao = {
  key: string
  tipos: string[]
  caminhos: string[]
  status: 'mapeado' | 'pendente'
}

export type DocumentoListaEdicaoAlvo = {
  id_arquivo: string
  indice_extracao: number
  nome_documento: string
  tipo_documento: string | null
}

export type ItemExtracaoListaEdicao = {
  tipo_documento?: string | null
  dados?: Record<string, unknown>
  dados_original?: Record<string, unknown> | null
}

export type ArquivoLeituraListaEdicao = {
  id_arquivo: string
  resultado_extracao?: ItemExtracaoListaEdicao[] | null
}

export type LeituraListaEdicao = {
  id_leitura: string
  arquivos: ArquivoLeituraListaEdicao[]
}

export class ListaEdicaoSmartReadErro extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = 'ListaEdicaoSmartReadErro'
    this.statusCode = statusCode
    this.code = code
  }
}

const SUFIXO_GRUPO_REGEX = / ([A-Z])$/

export function normalizarCampoColunaListaSmartRead(campo: string): string {
  if (campo === 'numeros_documento') return 'numero_documento'
  return campo
}

export function listarChavesColunaEditavelListaSmartRead(
  catalogo: ColunaCatalogoListaEdicao[],
): string[] {
  const chaves = new Set<string>(['numeros_documento'])
  for (const col of catalogo) {
    if (colunaEditavelListaSmartRead(col.key, catalogo)) {
      chaves.add(col.key)
    }
  }
  return [...chaves]
}

export function extrairGrupoEspelhoNomeDocumentoSmartRead(nomeDocumento: string): string | null {
  const match = nomeDocumento.trim().match(SUFIXO_GRUPO_REGEX)
  return match ? match[1] : null
}

export function parseIdDocumentoLeituraLista(idDocumento: string): {
  id_leitura: string
  id_arquivo: string
  indice_extracao: number | null
} | null {
  const partes = idDocumento.split(':')
  if (partes.length < 3) return null
  const [id_leitura, id_arquivo, sufixo] = partes
  if (sufixo === 'arquivo') {
    return { id_leitura, id_arquivo, indice_extracao: null }
  }
  const indice = Number.parseInt(sufixo, 10)
  if (!Number.isFinite(indice) || indice < 0) return null
  return { id_leitura, id_arquivo, indice_extracao: indice }
}

function rotuloComSufixo(base: string, indice: number, total: number): string {
  if (total <= 1) return base
  return `${base} ${String.fromCharCode(64 + indice)}`
}

export function montarAlvosDocumentoListaEdicao(leitura: LeituraListaEdicao): DocumentoListaEdicaoAlvo[] {
  const entradas: {
    base: string
    tipoDocumento: string | null
    arquivo: ArquivoLeituraListaEdicao
    indiceExtracao: number | null
  }[] = []

  for (const arquivo of leitura.arquivos) {
    const extracao = arquivo.resultado_extracao
    if (extracao && extracao.length > 0) {
      extracao.forEach((item, indice) => {
        const tipoDocumento = item.tipo_documento?.trim() || null
        const base = tipoDocumento || 'Documento'
        entradas.push({ base, tipoDocumento, arquivo, indiceExtracao: indice })
      })
    }
  }

  const totalPorTipo = new Map<string, number>()
  for (const entrada of entradas) {
    const chave = entrada.base.toLowerCase()
    totalPorTipo.set(chave, (totalPorTipo.get(chave) ?? 0) + 1)
  }

  const indicePorTipo = new Map<string, number>()

  return entradas.flatMap((entrada) => {
    if (entrada.indiceExtracao == null) return []
    const chave = entrada.base.toLowerCase()
    const indice = (indicePorTipo.get(chave) ?? 0) + 1
    indicePorTipo.set(chave, indice)
    const total = totalPorTipo.get(chave) ?? 1
    return [{
      id_arquivo: entrada.arquivo.id_arquivo,
      indice_extracao: entrada.indiceExtracao,
      nome_documento: rotuloComSufixo(entrada.base, indice, total),
      tipo_documento: entrada.tipoDocumento,
    }]
  })
}

export function campoEspelhaGrupoListaSmartRead(
  campoColuna: string,
  catalogo: ColunaCatalogoListaEdicao[],
): boolean {
  return colunaEditavelListaSmartRead(campoColuna, catalogo)
}

export function listarAlvosEspelhoGrupoListaSmartRead(
  documentos: DocumentoListaEdicaoAlvo[],
  origem: DocumentoListaEdicaoAlvo,
  campoColuna: string,
  catalogo: ColunaCatalogoListaEdicao[],
): DocumentoListaEdicaoAlvo[] {
  if (!campoEspelhaGrupoListaSmartRead(campoColuna, catalogo)) {
    return [origem]
  }

  const grupo = extrairGrupoEspelhoNomeDocumentoSmartRead(origem.nome_documento)
  if (!grupo) return [origem]

  return documentos.filter(
    (doc) => extrairGrupoEspelhoNomeDocumentoSmartRead(doc.nome_documento) === grupo,
  )
}

export function resolverCaminhosEscritaColunaDocumentoSmartRead(
  campoColuna: string,
  tipoDocumento: string | null,
  catalogo: ColunaCatalogoListaEdicao[],
): string[] {
  const campo = normalizarCampoColunaListaSmartRead(campoColuna)
  const coluna = catalogo.find((c) => c.key === campo)
  if (!coluna || coluna.status !== 'mapeado') return []

  const tipoNorm = tipoDocumento
    ? normalizarTipoDocumentoBaseSmartRead(tipoDocumento)
    : null

  if (!tipoNorm) {
    return coluna.caminhos.filter((caminho) => !caminho.includes('['))
  }

  const tipoAplicavel = coluna.tipos.some(
    (tipo) => normalizarTipoDocumentoBaseSmartRead(tipo) === tipoNorm,
  )
  if (!tipoAplicavel) return []

  return coluna.caminhos.filter((caminho) => !caminho.includes('['))
}

export function colunaEditavelListaSmartRead(
  campoColuna: string,
  catalogo: ColunaCatalogoListaEdicao[],
): boolean {
  const campo = normalizarCampoColunaListaSmartRead(campoColuna)
  if (campo === 'numero_documento') return true
  const coluna = catalogo.find((c) => c.key === campo)
  return coluna?.status === 'mapeado' && coluna.caminhos.some((c) => !c.includes('['))
}

function assegurarDadosOriginal(item: ItemExtracaoListaEdicao): void {
  if (item.dados_original != null || !item.dados) return
  item.dados_original = structuredClone(item.dados)
}

function aplicarValorEmItem(
  item: ItemExtracaoListaEdicao,
  caminhos: string[],
  valor: string,
): boolean {
  if (!item.dados || caminhos.length === 0) return false
  assegurarDadosOriginal(item)
  let alterou = false
  for (const caminho of caminhos) {
    if (definirValorPorCaminhoDadosLeituraSmartRead(item.dados, caminho, valor)) {
      alterou = true
    }
  }
  return alterou
}

export function aplicarEdicaoCampoDocumentoListaSmartRead(params: {
  leitura: LeituraListaEdicao
  id_arquivo: string
  indice_documento: number
  campo_coluna: string
  valor: string
  catalogo: ColunaCatalogoListaEdicao[]
}): LeituraListaEdicao {
  const { leitura, id_arquivo, indice_documento, campo_coluna, valor, catalogo } = params

  if (!colunaEditavelListaSmartRead(campo_coluna, catalogo)) {
    throw new ListaEdicaoSmartReadErro(
      'Coluna nao editavel na lista',
      422,
      'CAMPO_COLUNA_NAO_EDITAVEL',
    )
  }

  const documentos = montarAlvosDocumentoListaEdicao(leitura)
  const origem = documentos.find(
    (d) => d.id_arquivo === id_arquivo && d.indice_extracao === indice_documento,
  )
  if (!origem) {
    throw new ListaEdicaoSmartReadErro(
      'Documento nao encontrado na leitura',
      404,
      'DOCUMENTO_NAO_ENCONTRADO',
    )
  }

  const alvos = listarAlvosEspelhoGrupoListaSmartRead(documentos, origem, campo_coluna, catalogo)
  const leituraClone = structuredClone(leitura) as LeituraListaEdicao
  let algumAlterado = false

  for (const alvo of alvos) {
    const arquivo = leituraClone.arquivos.find((a) => a.id_arquivo === alvo.id_arquivo)
    const item = arquivo?.resultado_extracao?.[alvo.indice_extracao]
    if (!item) continue

    const caminhos = resolverCaminhosEscritaColunaDocumentoSmartRead(
      campo_coluna,
      alvo.tipo_documento,
      catalogo,
    )
    if (aplicarValorEmItem(item, caminhos, valor)) {
      algumAlterado = true
    }
  }

  if (!algumAlterado) {
    throw new ListaEdicaoSmartReadErro(
      'Nenhum caminho editavel encontrado para esta coluna e tipo de documento',
      422,
      'CAMINHO_CAMPO_INVALIDO',
    )
  }

  return leituraClone
}
