/**
 * Validação de linha importada — paridade com lista + rota por modal.
 */
import {
  resolverCodigoDestinoImportacao,
  resolverCodigoOrigemImportacao,
} from './campos-importacao-bid-frete-internacional'
import { linhaImportacaoParaCamposRotaModal } from './montar-payload-criacao-cotacao-importacao-bid-frete-internacional'
import { prepararCamposRotaCotacaoPersistencia } from './rota-cotacao-bid-frete-internacional'
import type { LinhaImportacaoBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'

const VALID_TIPOS = ['IMPORTACAO', 'EXPORTACAO'] as const
const VALID_MODAIS = ['MARITIMO', 'AEREO', 'RODOVIARIO'] as const
const INCOTERMS = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP', 'DPU', 'FAS', 'CFR'] as const

export function validarLinhaImportacaoBidFreteInternacional(
  row: LinhaImportacaoBidFreteInternacional,
): string[] {
  const erros: string[] = []

  if (!row.tipo_operacao_cotacao_bid_frete_internacional?.trim()) {
    erros.push('tipo_operacao obrigatorio')
  } else if (!VALID_TIPOS.includes(row.tipo_operacao_cotacao_bid_frete_internacional.trim().toUpperCase() as typeof VALID_TIPOS[number])) {
    erros.push('tipo_operacao invalido')
  }

  const modalRaw = row.modal_cotacao_bid_frete_internacional?.trim().toUpperCase() ?? ''
  if (!modalRaw) {
    erros.push('modal obrigatorio')
  } else if (!VALID_MODAIS.includes(modalRaw as typeof VALID_MODAIS[number])) {
    erros.push('modal invalido')
  }

  if (!row.descricao_mercadoria_cotacao_bid_frete_internacional?.trim()) {
    erros.push('mercadoria obrigatoria')
  }

  if (!row.incoterm_cotacao_bid_frete_internacional?.trim()) {
    erros.push('incoterm obrigatorio')
  } else if (!INCOTERMS.includes(row.incoterm_cotacao_bid_frete_internacional.trim().toUpperCase() as typeof INCOTERMS[number])) {
    erros.push('incoterm invalido')
  }

  const qty = Number(row.quantidade_volume_cotacao_bid_frete_internacional)
  if (!row.quantidade_volume_cotacao_bid_frete_internacional?.trim() || Number.isNaN(qty) || qty <= 0) {
    erros.push('quantidade_volume invalida')
  }

  if (VALID_MODAIS.includes(modalRaw as typeof VALID_MODAIS[number])) {
    const modal = modalRaw as typeof VALID_MODAIS[number]
    const origem = resolverCodigoOrigemImportacao(row)
    const destino = resolverCodigoDestinoImportacao(row)

    if (modal === 'MARITIMO') {
      if (!origem) erros.push('porto_origem obrigatorio')
      if (!destino) erros.push('porto_destino obrigatorio')
    } else if (modal === 'AEREO') {
      if (!origem) erros.push('aeroporto_origem obrigatorio')
      if (!destino) erros.push('aeroporto_destino obrigatorio')
    } else {
      const temOrigem = origem || row.endereco_origem_cotacao_bid_frete_internacional?.trim()
      const temDestino = destino || row.endereco_destino_cotacao_bid_frete_internacional?.trim()
      if (!temOrigem) erros.push('origem rodoviaria obrigatoria')
      if (!temDestino) erros.push('destino rodoviario obrigatorio')
    }
  }

  const rota = prepararCamposRotaCotacaoPersistencia(linhaImportacaoParaCamposRotaModal(row))
  if (!rota.origem_codigo_cotacao_bid_frete_internacional) {
    erros.push('origem obrigatoria')
  }
  if (!rota.destino_codigo_cotacao_bid_frete_internacional) {
    erros.push('destino obrigatorio')
  }
  if (!rota.origem_pais_cotacao_bid_frete_internacional) {
    erros.push('origem_pais obrigatorio')
  }
  if (!rota.destino_pais_cotacao_bid_frete_internacional) {
    erros.push('destino_pais obrigatorio')
  }

  return erros
}
