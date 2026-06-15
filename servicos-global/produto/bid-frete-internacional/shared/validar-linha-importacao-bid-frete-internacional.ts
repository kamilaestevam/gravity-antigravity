/**
 * Validação de linha importada — paridade com lista + rota por modal.
 */
import {
  resolverCodigoDestinoImportacao,
  resolverCodigoOrigemImportacao,
} from './campos-importacao-bid-frete-internacional'
import { linhaImportacaoParaCamposRotaModal } from './montar-payload-criacao-cotacao-importacao-bid-frete-internacional'
import {
  resolverAeroportoNoCatalogoImportacao,
  resolverPortoNoCatalogoImportacao,
} from './resolver-cadastro-rota-importacao-bid-frete-internacional'
import {
  prepararCamposRotaCotacaoPersistencia,
  type ContextoCatalogoRota,
} from './rota-cotacao-bid-frete-internacional'
import type { LinhaImportacaoBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'

const VALID_TIPOS = ['IMPORTACAO', 'EXPORTACAO'] as const
const VALID_MODAIS = ['MARITIMO', 'AEREO', 'RODOVIARIO'] as const
const INCOTERMS = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP', 'DPU', 'FAS', 'CFR'] as const

function validarLocaisImportacao(
  row: LinhaImportacaoBidFreteInternacional,
  ctx: ContextoCatalogoRota,
): string[] {
  const erros: string[] = []
  const modal = row.modal_cotacao_bid_frete_internacional?.trim().toUpperCase() ?? ''
  const portos = ctx.portos ?? []
  const aeroportos = ctx.aeroportos ?? []

  if (modal === 'MARITIMO') {
    const origem = row.porto_origem_cotacao_bid_frete_internacional?.trim()
    if (origem && portos.length > 0) {
      const res = resolverPortoNoCatalogoImportacao(origem, portos)
      if (res.ambiguo) erros.push('porto_origem ambiguo')
      else if (!res.porto) erros.push('porto_origem invalido')
    }

    const destino = row.porto_destino_cotacao_bid_frete_internacional?.trim()
    if (destino && portos.length > 0) {
      const res = resolverPortoNoCatalogoImportacao(destino, portos)
      if (res.ambiguo) erros.push('porto_destino ambiguo')
      else if (!res.porto) erros.push('porto_destino invalido')
    }
  }

  if (modal === 'AEREO') {
    const origem = row.aeroporto_origem_cotacao_bid_frete_internacional?.trim()
    if (origem && aeroportos.length > 0) {
      const res = resolverAeroportoNoCatalogoImportacao(origem, aeroportos)
      if (res.ambiguo) erros.push('aeroporto_origem ambiguo')
      else if (!res.aeroporto) erros.push('aeroporto_origem invalido')
    }

    const destino = row.aeroporto_destino_cotacao_bid_frete_internacional?.trim()
    if (destino && aeroportos.length > 0) {
      const res = resolverAeroportoNoCatalogoImportacao(destino, aeroportos)
      if (res.ambiguo) erros.push('aeroporto_destino ambiguo')
      else if (!res.aeroporto) erros.push('aeroporto_destino invalido')
    }
  }

  return erros
}

export function validarLinhaImportacaoBidFreteInternacional(
  row: LinhaImportacaoBidFreteInternacional,
  ctx: ContextoCatalogoRota = {},
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

  erros.push(...validarLocaisImportacao(row, ctx))

  const rota = prepararCamposRotaCotacaoPersistencia(linhaImportacaoParaCamposRotaModal(row), ctx)
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
