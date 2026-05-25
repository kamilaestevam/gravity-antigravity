/**
 * pillsTooltipColunaLista.ts — Vocabulário e matriz de pílulas para tooltips da lista.
 */

import { CHAVES_COLUNA_DINAMICA_PEDIDO_ITEM } from './regrasTooltipColunaLista'
import {
  classificarRegraTooltipColuna,
  type NivelColunaLista,
  type RegraTooltipId,
} from './regrasTooltipColunaLista'

export type RegraPillId =
  | 'editavel_pedido'
  | 'editavel_pedido_numero'
  | 'editavel_item'
  | 'somente_leitura'
  | 'replica_itens'
  | 'replica_itens_auto'
  | 'alerta_divergencia'
  | 'calculado_pedido'
  | 'formula_config'
  | 'so_operacao'
  | 'cond_import_export'
  | 'anexo'
  | 'coluna_personalizada'

export const MAX_PILLS_POR_BLOCO = 4

const CHAVES_DUAL_SEMPRE = new Set(['numero_pedido'])

const MAPA_REGRA_PILLS: Record<RegraTooltipId, { pedido: RegraPillId[]; item: RegraPillId[] }> = {
  pai_editavel_replicar_alerta: {
    pedido: ['editavel_pedido', 'replica_itens', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_ghost_descricao: {
    pedido: ['editavel_pedido', 'replica_itens', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_ghost_ncm: {
    pedido: ['editavel_pedido', 'replica_itens', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_ghost_cobertura: {
    pedido: ['editavel_pedido', 'replica_itens', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_calculado_valor: {
    pedido: ['calculado_pedido', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_calculado_quantidade: {
    pedido: ['calculado_pedido', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_calculado_peso: {
    pedido: ['calculado_pedido', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_calculado_cubagem: {
    pedido: ['calculado_pedido', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_saldo_formula: {
    pedido: ['calculado_pedido', 'formula_config'],
    item: ['somente_leitura', 'formula_config'],
  },
  pai_somente_leitura: {
    pedido: ['somente_leitura'],
    item: ['somente_leitura'],
  },
  pai_moeda_cambio: {
    pedido: ['editavel_pedido', 'replica_itens'],
    item: ['editavel_item'],
  },
  pai_anexo: {
    pedido: ['anexo'],
    item: ['anexo'],
  },
  pai_coluna_personalizada: {
    pedido: ['coluna_personalizada', 'editavel_pedido'],
    item: ['coluna_personalizada', 'editavel_item'],
  },
  pai_cond_exportador: {
    pedido: ['editavel_pedido', 'cond_import_export', 'replica_itens', 'alerta_divergencia'],
    item: ['editavel_item', 'cond_import_export'],
  },
  pai_cond_importador: {
    pedido: ['editavel_pedido', 'cond_import_export', 'replica_itens', 'alerta_divergencia'],
    item: ['editavel_item', 'cond_import_export'],
  },
  pai_workspace: {
    pedido: ['editavel_pedido', 'replica_itens_auto'],
    item: ['somente_leitura'],
  },
  pai_status: {
    pedido: ['editavel_pedido', 'replica_itens'],
    item: ['editavel_item'],
  },
  pai_numero_pedido: {
    pedido: ['somente_leitura'],
    item: ['somente_leitura'],
  },
  pai_numero_pedido_item: {
    pedido: ['editavel_pedido_numero', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_tipo_operacao: {
    pedido: ['editavel_pedido', 'replica_itens', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  dinamico_valor_total: {
    pedido: ['calculado_pedido', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  dinamico_qtd_inicial: {
    pedido: ['calculado_pedido', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  dinamico_qtd_pronta: {
    pedido: ['calculado_pedido', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  dinamico_saldo: {
    pedido: ['calculado_pedido', 'formula_config'],
    item: ['somente_leitura', 'formula_config'],
  },
  dinamico_qtd_transferida: {
    pedido: ['calculado_pedido'],
    item: ['somente_leitura', 'so_operacao'],
  },
  dinamico_qtd_cancelada: {
    pedido: ['calculado_pedido'],
    item: ['somente_leitura', 'so_operacao'],
  },
  dinamico_peso_liquido: {
    pedido: ['calculado_pedido', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  dinamico_peso_bruto: {
    pedido: ['calculado_pedido', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  dinamico_cubagem: {
    pedido: ['calculado_pedido', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  item_editavel_padrao: {
    pedido: [],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  item_editavel_quantidade_inicial: {
    pedido: [],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  item_editavel_valor_total: {
    pedido: [],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  item_editavel_qtd_pronta: {
    pedido: [],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  item_editavel_ghost: {
    pedido: [],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  item_nao_editavel_saldo: {
    pedido: [],
    item: ['somente_leitura', 'formula_config'],
  },
  item_nao_editavel_transferencia: {
    pedido: [],
    item: ['somente_leitura', 'so_operacao'],
  },
  item_nao_editavel_cancelamento: {
    pedido: [],
    item: ['somente_leitura', 'so_operacao'],
  },
  item_nao_editavel_padrao: {
    pedido: [],
    item: ['somente_leitura'],
  },
  item_cond_exportador: {
    pedido: [],
    item: ['editavel_item', 'cond_import_export'],
  },
  item_cond_importador: {
    pedido: [],
    item: ['editavel_item', 'cond_import_export'],
  },
  item_part_number: {
    pedido: [],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  generico: {
    pedido: ['editavel_pedido'],
    item: ['editavel_item'],
  },
}

const GHOST_KEYS = new Set(['descricao_item', 'ncm', 'cobertura_cambial'])

export type ResolucaoPillsTooltip = {
  dual: boolean
  pedido: RegraPillId[]
  item: RegraPillId[]
  linkFormula: boolean
  ghostSemCheckbox: boolean
  numeroUnicoOrg: boolean
}

function limitarPills(pills: RegraPillId[]): RegraPillId[] {
  return pills.slice(0, MAX_PILLS_POR_BLOCO)
}

export function obterPillsTooltipColuna(
  key: string,
  opts?: { modoDinamicoPedidoItem?: boolean; colunaPersonalizada?: boolean },
): ResolucaoPillsTooltip {
  const dual =
    CHAVES_DUAL_SEMPRE.has(key)
    || Boolean(opts?.modoDinamicoPedidoItem && CHAVES_COLUNA_DINAMICA_PEDIDO_ITEM.has(key))

  const regraPai = classificarRegraTooltipColuna(key, 'pai', opts)
  const regraItem = classificarRegraTooltipColuna(key, 'item', opts)
  const idPai = opts?.colunaPersonalizada ? 'pai_coluna_personalizada' : regraPai
  const mapaPai = MAPA_REGRA_PILLS[idPai] ?? MAPA_REGRA_PILLS.generico
  const mapaItem = MAPA_REGRA_PILLS[regraItem] ?? MAPA_REGRA_PILLS.generico

  const linkFormula =
    idPai === 'pai_saldo_formula'
    || regraItem === 'item_nao_editavel_saldo'
    || regraPai.startsWith('dinamico_saldo')

  return {
    dual,
    pedido: limitarPills(mapaPai.pedido),
    item: limitarPills(mapaItem.item),
    linkFormula,
    ghostSemCheckbox: GHOST_KEYS.has(key),
    numeroUnicoOrg: key === 'numero_pedido',
  }
}

/** Pílulas para tooltip de uma única linha (célula pedido ou item). */
export function pillsParaNivelColuna(
  key: string,
  nivel: NivelColunaLista,
  opts?: { modoDinamicoPedidoItem?: boolean; colunaPersonalizada?: boolean },
): RegraPillId[] {
  const res = obterPillsTooltipColuna(key, opts)
  if (res.dual) return nivel === 'item' ? res.item : res.pedido
  const regraId = classificarRegraTooltipColuna(
    key,
    nivel,
    opts,
  )
  const id = nivel === 'pai' && opts?.colunaPersonalizada ? 'pai_coluna_personalizada' : regraId
  const mapa = MAPA_REGRA_PILLS[id] ?? MAPA_REGRA_PILLS.generico
  return limitarPills(nivel === 'item' ? mapa.item : mapa.pedido)
}

export function regraTemLinkFormula(pills: RegraPillId[]): boolean {
  return pills.includes('formula_config')
}
