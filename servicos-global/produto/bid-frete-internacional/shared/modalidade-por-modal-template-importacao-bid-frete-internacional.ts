/**
 * Modalidade dependente do Modal no template Excel — paridade wizard Nova Cotação.
 */
import type ExcelJS from 'exceljs'
import type { CampoImportacaoBidMeta } from './campos-importacao-bid-frete-internacional'
import {
  MAPAS_ROTULO_ENUM_IMPORTACAO_BID,
} from './template-importacao-config-bid-frete-internacional'
import { MODALIDADES_POR_MODAL_IMPORTACAO_BID } from './resolver-modalidade-importacao-bid-frete-internacional'
import {
  PRIMEIRA_LINHA_DADOS_TEMPLATE_BID,
  ULTIMA_LINHA_DADOS_TEMPLATE_BID,
} from './template-importacao-limites-bid-frete-internacional'

export interface RangesModalidadePorModalTemplateBid {
  maritimo: string
  aereo: string
  rodoviario: string
  vazio: string
}

function rotuloModalidade(codigo: string): string {
  const mapa = MAPAS_ROTULO_ENUM_IMPORTACAO_BID.modalidade_cotacao_bid_frete_internacional
  return mapa?.[codigo] ?? codigo
}

function rotuloModal(codigo: string): string {
  const mapa = MAPAS_ROTULO_ENUM_IMPORTACAO_BID.modal_cotacao_bid_frete_internacional
  return mapa?.[codigo] ?? codigo
}

export function preencherListasModalidadePorModalTemplateBid(
  wb: ExcelJS.Workbook,
  colunaInicial = 1,
): { wsListas: ExcelJS.Worksheet; ranges: RangesModalidadePorModalTemplateBid; proximaColuna: number } {
  let wsListas = wb.getWorksheet('_Listas')
  if (!wsListas) {
    wsListas = wb.addWorksheet('_Listas', { state: 'veryHidden' })
  }

  const listasPorModal = {
    maritimo: MODALIDADES_POR_MODAL_IMPORTACAO_BID.MARITIMO.map(rotuloModalidade),
    aereo: MODALIDADES_POR_MODAL_IMPORTACAO_BID.AEREO.map(rotuloModalidade),
    rodoviario: MODALIDADES_POR_MODAL_IMPORTACAO_BID.RODOVIARIO.map(rotuloModalidade),
    vazio: [''],
  } as const

  const ranges: Partial<RangesModalidadePorModalTemplateBid> = {}
  let colAtual = colunaInicial

  for (const [chave, itens] of Object.entries(listasPorModal)) {
    itens.forEach((valor, i) => {
      wsListas!.getCell(i + 1, colAtual).value = valor
    })
    const colLetra = wsListas!.getColumn(colAtual).letter
    ranges[chave as keyof RangesModalidadePorModalTemplateBid] =
      `'_Listas'!$${colLetra}$1:$${colLetra}$${itens.length}`
    colAtual++
  }

  return {
    wsListas,
    ranges: ranges as RangesModalidadePorModalTemplateBid,
    proximaColuna: colAtual,
  }
}

export function aplicarValidacaoModalidadeDependenteModalTemplateBid(
  ws: ExcelJS.Worksheet,
  campos: readonly CampoImportacaoBidMeta[],
  ranges: RangesModalidadePorModalTemplateBid,
): void {
  const idxModal = campos.findIndex(c => c.campo === 'modal_cotacao_bid_frete_internacional')
  const idxModalidade = campos.findIndex(c => c.campo === 'modalidade_cotacao_bid_frete_internacional')
  if (idxModal < 0 || idxModalidade < 0) return

  const colModal = ws.getColumn(idxModal + 1).letter
  const colModalidade = ws.getColumn(idxModalidade + 1).letter
  const rotuloMaritimo = rotuloModal('MARITIMO')
  const rotuloAereo = rotuloModal('AEREO')
  const rotuloRodoviario = rotuloModal('RODOVIARIO')

  for (let row = PRIMEIRA_LINHA_DADOS_TEMPLATE_BID; row <= ULTIMA_LINHA_DADOS_TEMPLATE_BID; row++) {
    const refModal = `$${colModal}${row}`
    const formulaLista = [
      `IF(${refModal}="${rotuloMaritimo}",${ranges.maritimo},`,
      `IF(${refModal}="${rotuloAereo}",${ranges.aereo},`,
      `IF(${refModal}="${rotuloRodoviario}",${ranges.rodoviario},${ranges.vazio})))`,
    ].join('')

    ws.getCell(`${colModalidade}${row}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [formulaLista],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Modalidade inválida',
      error: 'FCL/LCL apenas para Marítimo; FTL/LTL apenas para Rodoviário; Aéreo Geral apenas para Aéreo.',
    }
  }
}
