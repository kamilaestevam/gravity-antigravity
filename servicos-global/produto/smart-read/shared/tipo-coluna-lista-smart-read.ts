/**
 * SSOT — tipo GTV (periodo / select-moeda / numero / texto) por coluna do catálogo Smart Docs.
 * Paridade Pedido: data → periodo, moeda ISO → select cadastro, valores → numero.
 */
import type { ColunaDocumentoCatalogoSmartRead } from './catalogo-colunas-documento-smart-read.js'

export type TipoColunaListaSmartRead = 'periodo' | 'select_moeda' | 'numero' | 'texto'

const CHAVES_DATA = new Set([
  'data_documento',
  'data_embarque_documento',
  'campo_adicional_data_de_vencimento',
])

const CHAVES_MOEDA_SELECT = new Set(['moeda_moeda'])

function caminhoIndicaData(caminhos: string[]): boolean {
  return caminhos.some(
    (c) =>
      /date/i.test(c) ||
      /shippedOnBoard/i.test(c) ||
      /Vencimento/i.test(c),
  )
}

function caminhoIndicaMoedaIso(caminhos: string[]): boolean {
  return caminhos.some((c) => c === 'currency.type' || c.endsWith('.currency'))
}

function chaveIndicaNumero(key: string): boolean {
  if (key === 'numero_documento' || key === 'numeros_documento') return false
  return (
    key.startsWith('valor_') ||
    key.startsWith('peso_') ||
    key.startsWith('quantidade_') ||
    key === 'taxa_cambio_moeda' ||
    key.includes('_total_') ||
    key.includes('volume_')
  )
}

export function resolverTipoColunaListaSmartRead(
  col: Pick<ColunaDocumentoCatalogoSmartRead, 'key' | 'caminhos'>,
): TipoColunaListaSmartRead {
  if (CHAVES_MOEDA_SELECT.has(col.key) || caminhoIndicaMoedaIso(col.caminhos)) {
    return 'select_moeda'
  }
  if (CHAVES_DATA.has(col.key) || caminhoIndicaData(col.caminhos)) {
    return 'periodo'
  }
  if (chaveIndicaNumero(col.key)) {
    return 'numero'
  }
  return 'texto'
}

export function resolverCasasDecimaisColunaListaSmartRead(key: string): number {
  if (key.startsWith('quantidade_')) return 0
  if (chaveIndicaNumero(key)) return 2
  return 0
}
