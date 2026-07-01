/**
 * SSOT — paridade edição conferência (passo 3) × lista inline.
 * Mesmo campo_coluna, mesmos caminhos JSON e mesmo espelhamento por grupo A/B.
 */
import { CATALOGO_COLUNAS_DOCUMENTO_SMART_READ } from './catalogo-colunas-documento-smart-read.js'
import { normalizarTipoDocumentoBaseSmartRead } from './dados-base-produto-tempo-smart-read.js'
import {
  aplicarEdicaoCampoDocumentoListaSmartRead,
  colunaEditavelListaSmartRead,
  listarAlvosEspelhoGrupoListaSmartRead,
  montarAlvosDocumentoListaEdicao,
  resolverCaminhosEscritaColunaDocumentoSmartRead,
  type ColunaCatalogoListaEdicao,
  type LeituraListaEdicao,
  ListaEdicaoSmartReadErro,
} from './lista-edicao-espelhada-smart-read.js'

export const CATALOGO_PARIDADE_EDICAO_SMART_READ: ColunaCatalogoListaEdicao[] =
  CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.map((col) => ({
    key: col.key,
    tipos: col.tipos,
    caminhos: col.caminhos,
    status: col.status,
  }))

export function resolverCampoColunaPorCaminhoEdicaoSmartRead(
  caminho: string,
  tipoDocumento: string | null,
  catalogo: ColunaCatalogoListaEdicao[] = CATALOGO_PARIDADE_EDICAO_SMART_READ,
): string | null {
  if (caminho.includes('[')) return null

  const tipoNorm = tipoDocumento
    ? normalizarTipoDocumentoBaseSmartRead(tipoDocumento)
    : null

  for (const col of catalogo) {
    if (!colunaEditavelListaSmartRead(col.key, catalogo)) continue
    if (!col.caminhos.includes(caminho)) continue

    if (tipoNorm) {
      const tipoAplicavel = col.tipos.some(
        (tipo) => normalizarTipoDocumentoBaseSmartRead(tipo) === tipoNorm,
      )
      if (!tipoAplicavel) continue
    }

    return col.key
  }

  return null
}

export function caminhoEditavelParidadeConferenciaListaSmartRead(
  caminho: string,
  tipoDocumento: string | null | undefined,
  catalogo: ColunaCatalogoListaEdicao[] = CATALOGO_PARIDADE_EDICAO_SMART_READ,
): boolean {
  return (
    resolverCampoColunaPorCaminhoEdicaoSmartRead(caminho, tipoDocumento ?? null, catalogo) !== null
  )
}

export function aplicarEdicaoPorCaminhoConferenciaSmartRead(params: {
  leitura: LeituraListaEdicao
  id_arquivo: string
  indice_documento: number
  caminho: string
  valor: string
  catalogo?: ColunaCatalogoListaEdicao[]
}): LeituraListaEdicao {
  const catalogo = params.catalogo ?? CATALOGO_PARIDADE_EDICAO_SMART_READ
  const documentos = montarAlvosDocumentoListaEdicao(params.leitura)
  const origem = documentos.find(
    (d) =>
      d.id_arquivo === params.id_arquivo && d.indice_extracao === params.indice_documento,
  )
  if (!origem) {
    throw new ListaEdicaoSmartReadErro(
      'Documento nao encontrado na leitura',
      404,
      'DOCUMENTO_NAO_ENCONTRADO',
    )
  }

  const campoColuna = resolverCampoColunaPorCaminhoEdicaoSmartRead(
    params.caminho,
    origem.tipo_documento,
    catalogo,
  )
  if (!campoColuna) {
    throw new ListaEdicaoSmartReadErro(
      'Caminho nao editavel na paridade conferencia/lista',
      422,
      'CAMINHO_NAO_EDITAVEL',
    )
  }

  return aplicarEdicaoCampoDocumentoListaSmartRead({
    leitura: params.leitura,
    id_arquivo: params.id_arquivo,
    indice_documento: params.indice_documento,
    campo_coluna: campoColuna,
    valor: params.valor,
    catalogo,
  })
}

export type ChaveCampoEditadoEspelhoConferencia = {
  indice_documento: number
  caminho: string
}

/** Caminhos a marcar como alterados na UI após espelhamento (um caminho por doc alvo). */
export function listarChavesCampoEditadoEspelhoConferenciaSmartRead(params: {
  leitura: LeituraListaEdicao
  id_arquivo: string
  indice_documento: number
  caminho: string
  catalogo?: ColunaCatalogoListaEdicao[]
}): ChaveCampoEditadoEspelhoConferencia[] {
  const catalogo = params.catalogo ?? CATALOGO_PARIDADE_EDICAO_SMART_READ
  const documentos = montarAlvosDocumentoListaEdicao(params.leitura)
  const origem = documentos.find(
    (d) =>
      d.id_arquivo === params.id_arquivo && d.indice_extracao === params.indice_documento,
  )
  if (!origem) return []

  const campoColuna = resolverCampoColunaPorCaminhoEdicaoSmartRead(
    params.caminho,
    origem.tipo_documento,
    catalogo,
  )
  if (!campoColuna) return []

  const alvos = listarAlvosEspelhoGrupoListaSmartRead(
    documentos,
    origem,
    campoColuna,
    catalogo,
  )

  const saida: ChaveCampoEditadoEspelhoConferencia[] = []
  for (const alvo of alvos) {
    const caminhos = resolverCaminhosEscritaColunaDocumentoSmartRead(
      campoColuna,
      alvo.tipo_documento,
      catalogo,
    )
    const caminhoMarcar = caminhos.includes(params.caminho)
      ? params.caminho
      : caminhos[0]
    if (!caminhoMarcar) continue
    saida.push({ indice_documento: alvo.indice_extracao, caminho: caminhoMarcar })
  }
  return saida
}

export type RelatorioParidadeEdicaoConferenciaLista = {
  colunas_editaveis_lista: number
  caminhos_escalares_mapeados: number
  coerente: boolean
  caminhos_sem_resolucao: Array<{ caminho: string; tipo_documento: string; campo_coluna: string }>
}

/** Garante que todo caminho escalar mapeado resolve de volta à mesma coluna editável na lista. */
export function auditarParidadeEdicaoConferenciaListaSmartRead(
  catalogo: ColunaCatalogoListaEdicao[] = CATALOGO_PARIDADE_EDICAO_SMART_READ,
): RelatorioParidadeEdicaoConferenciaLista {
  const caminhos_sem_resolucao: RelatorioParidadeEdicaoConferenciaLista['caminhos_sem_resolucao'] =
    []
  let colunas_editaveis_lista = 0
  let caminhos_escalares_mapeados = 0

  for (const col of catalogo) {
    if (!colunaEditavelListaSmartRead(col.key, catalogo)) continue
    colunas_editaveis_lista++

    for (const tipo of col.tipos) {
      for (const caminho of col.caminhos) {
        if (caminho.includes('[')) continue
        caminhos_escalares_mapeados++
        const resolvido = resolverCampoColunaPorCaminhoEdicaoSmartRead(caminho, tipo, catalogo)
        if (resolvido !== col.key) {
          caminhos_sem_resolucao.push({
            caminho,
            tipo_documento: tipo,
            campo_coluna: col.key,
          })
        }
      }
    }
  }

  return {
    colunas_editaveis_lista,
    caminhos_escalares_mapeados,
    coerente: caminhos_sem_resolucao.length === 0,
    caminhos_sem_resolucao,
  }
}
