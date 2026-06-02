/**
 * regrasTooltipColunaLista.ts — Classificação de regras UX para tooltips da lista Pedido.
 */

import {
  getEditavelItem,
  getTipoCampo,
  hasAlerta,
  isSomavel,
  type TipoCampo,
} from './columnBehaviorConfig'

export type NivelColunaLista = 'pai' | 'item'

export type RegraTooltipId =
  | 'pai_editavel_replicar_alerta'
  | 'pai_ghost_descricao'
  | 'pai_ghost_ncm'
  | 'pai_ghost_cobertura'
  | 'pai_calculado_valor'
  | 'pai_calculado_quantidade'
  | 'pai_calculado_peso'
  | 'pai_calculado_cubagem'
  | 'pai_saldo_formula'
  | 'pai_somente_leitura'
  | 'pai_moeda_cambio'
  | 'pai_anexo'
  | 'pai_coluna_personalizada'
  | 'pai_cond_exportador'
  | 'pai_cond_importador'
  | 'pai_workspace'
  | 'pai_status'
  | 'pai_numero_pedido'
  | 'pai_numero_pedido_item'
  | 'pai_tipo_operacao'
  | 'dinamico_valor_total'
  | 'dinamico_qtd_inicial'
  | 'dinamico_qtd_pronta'
  | 'dinamico_saldo'
  | 'dinamico_qtd_transferida'
  | 'dinamico_qtd_cancelada'
  | 'dinamico_peso_liquido'
  | 'dinamico_peso_bruto'
  | 'dinamico_cubagem'
  | 'item_editavel_padrao'
  | 'item_editavel_quantidade_inicial'
  | 'item_editavel_valor_total'
  | 'item_editavel_qtd_pronta'
  | 'item_editavel_ghost'
  | 'item_nao_editavel_saldo'
  | 'item_nao_editavel_transferencia'
  | 'item_nao_editavel_cancelamento'
  | 'item_nao_editavel_padrao'
  | 'item_cond_exportador'
  | 'item_cond_importador'
  | 'item_part_number'
  | 'generico'

const GHOST_DESCRICAO = new Set(['descricao_item'])
const GHOST_NCM = new Set(['ncm'])
const GHOST_COBERTURA = new Set(['cobertura_cambial'])

const CALCULADO_VALOR = new Set([
  'valor_total_pedido',
  'moeda_pedido',
  'moeda_item',
  'valor_por_unidade_item',
])
const CALCULADO_QTD = new Set([
  'quantidade_total_pedido',
  'quantidade_pronta_itens_pedido_total',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'unidade_comercializada_pedido',
  'quantidade_volumes_pedido',
])
const CALCULADO_PESO = new Set(['peso_liquido_total_pedido', 'peso_bruto_total_pedido'])
const CALCULADO_CUBAGEM = new Set(['cubagem_total_pedido'])

const MOEDA_CAMBIO = new Set([
  'moeda_cambio_pedido',
  'taxa_cambio_estimada',
  'valor_total_cambio_pedido',
  'contrato_cambio_id_pedido',
])

const ITEM_NAO_EDITAVEL = new Set([
  'quantidade_transferida_total',
  'quantidade_transferida_pedido',
  'quantidade_cancelada_total_pedido',
  'quantidade_cancelada_pedido',
])

/** Colunas com rótulo dinâmico Pedido/Item quando há itens expandidos. */
export const CHAVES_COLUNA_DINAMICA_PEDIDO_ITEM = new Set([
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_pronta_itens_pedido_total',
  'saldo_itens_do_pedido',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
])

const REGRA_DINAMICA_POR_CHAVE: Record<string, RegraTooltipId> = {
  valor_total_pedido: 'dinamico_valor_total',
  quantidade_total_pedido: 'dinamico_qtd_inicial',
  quantidade_pronta_itens_pedido_total: 'dinamico_qtd_pronta',
  saldo_itens_do_pedido: 'dinamico_saldo',
  quantidade_transferida_total: 'dinamico_qtd_transferida',
  quantidade_cancelada_total_pedido: 'dinamico_qtd_cancelada',
  peso_liquido_total_pedido: 'dinamico_peso_liquido',
  peso_bruto_total_pedido: 'dinamico_peso_bruto',
  cubagem_total_pedido: 'dinamico_cubagem',
}

function isCampoData(key: string): boolean {
  return key.startsWith('data_')
}

function isCampoAnexo(key: string): boolean {
  return key.startsWith('anexo_')
}

function isCampoSomenteLeituraCadastro(key: string): boolean {
  return (
    key.includes('cnpj')
    || key.startsWith('pais_')
    || key.startsWith('estado_')
    || key.startsWith('cidade_')
    || key.startsWith('endereco_')
    || key.startsWith('zip_code_')
    || key.endsWith('_ope')
    || key.includes('contato_')
    || key === 'exportador_ou_fabricante'
    || key === 'relacao_exportador_fabricante'
    || key === 'situacao_ope'
    || key === 'versao_ope'
    || key === 'codigo_ope'
    || key === 'cnpj_raiz_empresa_responsavel'
  )
}

function regraPorTipo(tipo: TipoCampo, nivel: NivelColunaLista): RegraTooltipId {
  if (nivel === 'item') {
    if (tipo === 'calculado') return 'item_editavel_padrao'
    if (tipo === 'alfanumerico') return 'item_editavel_padrao'
    if (tipo === 'saldo') return 'item_nao_editavel_saldo'
    return 'item_nao_editavel_padrao'
  }
  if (tipo === 'alfanumerico') return 'pai_editavel_replicar_alerta'
  if (tipo === 'calculado') return 'pai_calculado_quantidade'
  if (tipo === 'saldo') return 'pai_saldo_formula'
  return 'pai_somente_leitura'
}

export function classificarRegraTooltipColuna(
  key: string,
  nivel: NivelColunaLista,
  opts?: { modoDinamicoPedidoItem?: boolean },
): RegraTooltipId {
  if (opts?.modoDinamicoPedidoItem && CHAVES_COLUNA_DINAMICA_PEDIDO_ITEM.has(key)) {
    return REGRA_DINAMICA_POR_CHAVE[key] ?? 'generico'
  }

  if (nivel === 'item') {
    if (key === 'numero_pedido') return 'item_part_number'
    if (key === 'saldo_itens_do_pedido') return 'item_nao_editavel_saldo'
    if (ITEM_NAO_EDITAVEL.has(key) || key.includes('transferida')) return 'item_nao_editavel_transferencia'
    if (key.includes('cancelada')) return 'item_nao_editavel_cancelamento'
    if (key === 'nome_exportador') return 'item_cond_exportador'
    if (key === 'nome_importador') return 'item_cond_importador'
    if (GHOST_DESCRICAO.has(key) || GHOST_NCM.has(key) || GHOST_COBERTURA.has(key)) return 'item_editavel_ghost'
    if (key === 'valor_total_pedido' || key === 'valor_item') return 'item_editavel_valor_total'
    if (key === 'quantidade_pronta_itens_pedido_total') return 'item_editavel_qtd_pronta'
    if (key === 'quantidade_total_pedido') return 'item_editavel_quantidade_inicial'
    if (isCampoData(key)) return 'pai_editavel_replicar_alerta'
    if (getEditavelItem(key)) return 'item_editavel_padrao'
    const tipoItem = getTipoCampo(key)
    if (tipoItem) return regraPorTipo(tipoItem, 'item')
    return 'item_nao_editavel_padrao'
  }

  if (key === 'saldo_itens_do_pedido') return 'pai_saldo_formula'
  if (key === 'numero_pedido') return 'pai_numero_pedido_item'
  if (key === 'tipo_operacao') return 'pai_tipo_operacao'
  if (key === 'status') return 'pai_status'
  if (key === 'id_workspace') return 'pai_workspace'
  if (key === 'nome_exportador') return 'pai_cond_exportador'
  if (key === 'nome_importador') return 'pai_cond_importador'
  if (GHOST_DESCRICAO.has(key)) return 'pai_ghost_descricao'
  if (GHOST_NCM.has(key)) return 'pai_ghost_ncm'
  if (GHOST_COBERTURA.has(key)) return 'pai_ghost_cobertura'
  if (CALCULADO_VALOR.has(key)) return 'pai_calculado_valor'
  if (CALCULADO_PESO.has(key)) return 'pai_calculado_peso'
  if (CALCULADO_CUBAGEM.has(key)) return 'pai_calculado_cubagem'
  if (MOEDA_CAMBIO.has(key)) return 'pai_moeda_cambio'
  if (isCampoAnexo(key)) return 'pai_anexo'
  if (isCampoSomenteLeituraCadastro(key)) return 'pai_somente_leitura'
  if (CALCULADO_QTD.has(key) || isSomavel(key)) return 'pai_calculado_quantidade'

  const tipo = getTipoCampo(key)
  if (tipo === 'somente_leitura') return 'pai_somente_leitura'
  if (tipo === 'saldo') return 'pai_saldo_formula'
  if (tipo === 'calculado') {
    if (CALCULADO_VALOR.has(key)) return 'pai_calculado_valor'
    if (CALCULADO_PESO.has(key)) return 'pai_calculado_peso'
    if (CALCULADO_CUBAGEM.has(key)) return 'pai_calculado_cubagem'
    return 'pai_calculado_quantidade'
  }
  if (isCampoData(key) || (tipo === 'alfanumerico' && hasAlerta(key))) {
    return 'pai_editavel_replicar_alerta'
  }
  if (tipo === 'alfanumerico') return 'pai_editavel_replicar_alerta'
  if (tipo) return regraPorTipo(tipo, 'pai')

  return 'generico'
}

export function regraTooltipEhInterativa(id: RegraTooltipId): boolean {
  return (
    id === 'pai_saldo_formula'
    || id === 'item_nao_editavel_saldo'
    || id === 'dinamico_saldo'
  )
}
