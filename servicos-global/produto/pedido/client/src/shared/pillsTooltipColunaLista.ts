/**
 * pillsTooltipColunaLista.ts — Vocabulário e matriz de pílulas para tooltips da lista.
 *
 * SSOT de pills — espelha:
 * - `documentos-tecnicos/produtos-gravity/pedido/LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md` §0
 * - `/tooltip-pedido` (ETAPA 3 — ordem canônica pedido/item)
 * - `LISTA-EDITAR-SALVAR-TECNICO.md` §6
 *
 * ## Tipos de tooltip (UX lista Pedido)
 *
 * **Linha pedido** (cabeçalho + célula do pedido)
 * - Título: `{Coluna} do Pedido` (ex.: Moeda do Pedido)
 * - Pills na ordem canônica (apenas as que a regra do campo exigir):
 *   1. Bloqueado para edição
 *   2. Total do xxx / somatória / sem somatória
 *   3. Editável no pedido
 *   4. Aplicar em todos os itens
 *   5. Editável no item
 *   6. Alerta se XX divergirem
 *   7. Depende de importação ou exportação
 * - Aviso amarelo opcional abaixo das pills (impacto em outras colunas)
 *
 * **Linha item** (célula do item expandido)
 * - Título: `{Coluna} do Item` (ex.: Moeda do item)
 * - Pills na ordem canônica:
 *   1. Bloqueado para edição
 *   2. Editável no item
 *   3. Alerta se XX divergirem
 * - Aviso amarelo opcional abaixo das pills
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
  | 'alerta_moeda_divergente'
  | 'alerta_moeda_divergente_entre_itens'
  | 'alerta_unidade_comercializada_divergente'
  | 'alerta_unidade_peso_divergente'
  | 'bloqueado_valor_item'
  | 'bloqueado_edicao'
  | 'calculado_pedido'
  | 'calculado_pedido_qtd_inicial'
  | 'calculado_pedido_qtd_pronta'
  | 'calculado_pedido_qtd_transferida'
  | 'calculado_pedido_qtd_cancelada'
  | 'calculado_pedido_saldo'
  | 'calculado_pedido_volumes'
  | 'calculado_pedido_peso_liquido'
  | 'calculado_pedido_peso_bruto'
  | 'soma_mesma_unidade'
  | 'formula_config'
  | 'so_operacao'
  | 'cond_import_export'
  | 'espelhado_workspace'
  | 'espelhado_importador'
  | 'espelhado_logistica_pedido'
  | 'espelhado_logistica_item'
  | 'espelhado_logistica_bidirecional'
  | 'editavel_atualiza_pedido'
  | 'itens_bloqueados_pedido'
  | 'anexo'
  | 'coluna_personalizada'
  | 'casas_decimais_config'
  | 'valor_unitario_sem_somatoria'
  | 'valor_total_soma_mesma_moeda'
  | 'valor_total_item_formula'
  | 'editavel_nos_itens'

/** Máximo de pills visíveis por bloco (pedido ou item). */
export const MAX_PILLS_POR_BLOCO = 7

/**
 * Ordem canônica — linha pedido. Pills ausentes na regra do campo são omitidas;
 * as presentes são reordenadas conforme esta lista.
 */
export const ORDEM_PILLS_PEDIDO: RegraPillId[] = [
  'bloqueado_edicao',
  'bloqueado_valor_item',
  'somente_leitura',
  'itens_bloqueados_pedido',
  'so_operacao',
  'calculado_pedido',
  'calculado_pedido_qtd_inicial',
  'calculado_pedido_qtd_pronta',
  'calculado_pedido_qtd_transferida',
  'calculado_pedido_qtd_cancelada',
  'calculado_pedido_saldo',
  'calculado_pedido_volumes',
  'calculado_pedido_peso_liquido',
  'calculado_pedido_peso_bruto',
  'valor_total_soma_mesma_moeda',
  'valor_unitario_sem_somatoria',
  'soma_mesma_unidade',
  'valor_total_item_formula',
  'editavel_pedido',
  'editavel_pedido_numero',
  'editavel_atualiza_pedido',
  'replica_itens',
  'replica_itens_auto',
  'editavel_item',
  'editavel_nos_itens',
  'alerta_divergencia',
  'alerta_moeda_divergente',
  'alerta_moeda_divergente_entre_itens',
  'alerta_unidade_comercializada_divergente',
  'alerta_unidade_peso_divergente',
  'cond_import_export',
  'formula_config',
  'casas_decimais_config',
  'coluna_personalizada',
  'anexo',
  'espelhado_workspace',
  'espelhado_importador',
  'espelhado_logistica_pedido',
  'espelhado_logistica_item',
  'espelhado_logistica_bidirecional',
]

/** Ordem canônica — linha item. */
export const ORDEM_PILLS_ITEM: RegraPillId[] = [
  'bloqueado_edicao',
  'bloqueado_valor_item',
  'somente_leitura',
  'itens_bloqueados_pedido',
  'so_operacao',
  'editavel_item',
  'editavel_nos_itens',
  'alerta_divergencia',
  'alerta_moeda_divergente',
  'alerta_unidade_peso_divergente',
  'valor_total_item_formula',
  'formula_config',
  'cond_import_export',
  'coluna_personalizada',
  'anexo',
]

export function ordenarPillsCanonico(
  pills: RegraPillId[],
  nivel: NivelColunaLista,
): RegraPillId[] {
  const ordem = nivel === 'item' ? ORDEM_PILLS_ITEM : ORDEM_PILLS_PEDIDO
  const rank = new Map(ordem.map((id, index) => [id, index]))
  return [...pills].sort((a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999))
}

/** Valor Total do Pedido/Item — linha do pedido (soma na mesma moeda). */
export const PILLS_PEDIDO_VALOR_TOTAL: RegraPillId[] = [
  'bloqueado_edicao',
  'valor_total_soma_mesma_moeda',
  'editavel_nos_itens',
  'alerta_moeda_divergente_entre_itens',
]

/** Valor Total do Pedido/Item — linha do item. */
export const PILLS_ITEM_VALOR_TOTAL: RegraPillId[] = ['editavel_nos_itens', 'valor_total_item_formula']

/** Valor Total do Pedido/Item — cabeçalho sem itens expandidos (4 pills em sequência). */
export const PILLS_COLUNA_VALOR_TOTAL: RegraPillId[] = [
  'bloqueado_edicao',
  'valor_total_soma_mesma_moeda',
  'alerta_moeda_divergente_entre_itens',
  'editavel_nos_itens',
]

/** Valor Unitário do Item — linha do pedido (sem somatória). */
export const PILLS_PEDIDO_VALOR_UNITARIO_ITEM: RegraPillId[] = [
  'bloqueado_edicao',
  'valor_unitario_sem_somatoria',
  'alerta_moeda_divergente',
]

/** Valor Unitário do Item — linha do item. */
export const PILLS_ITEM_VALOR_UNITARIO: RegraPillId[] = ['editavel_nos_itens']

/** Valor Unitário do Item — cabeçalho sem itens expandidos (4 pills em sequência). */
export const PILLS_COLUNA_VALOR_UNITARIO: RegraPillId[] = [
  'bloqueado_edicao',
  'valor_unitario_sem_somatoria',
  'alerta_moeda_divergente',
  'editavel_nos_itens',
]

/** Linha do pedido — coluna valor do item: bloqueado, sem soma do pedido. */
export const PILLS_PEDIDO_VALOR_ITEM: RegraPillId[] = ['bloqueado_valor_item', 'alerta_divergencia']

/** Linha do pedido — Qtd. Pronta: total, bloqueado (2º), soma mesma unidade, alerta. */
export const PILLS_PEDIDO_QTD_PRONTA: RegraPillId[] = [
  'calculado_pedido_qtd_pronta',
  'bloqueado_edicao',
  'soma_mesma_unidade',
  'alerta_divergencia',
]

/** Linha item — Qtd. Pronta: editável + alerta de moeda divergente entre itens. */
export const PILLS_ITEM_QTD_PRONTA: RegraPillId[] = ['editavel_item', 'alerta_moeda_divergente']

/** Linha do pedido — Qtd. Transferida: calculado, bloqueado, soma mesma unidade, alerta. */
export const PILLS_PEDIDO_QTD_TRANSFERIDA: RegraPillId[] = [
  'calculado_pedido_qtd_transferida',
  'bloqueado_edicao',
  'soma_mesma_unidade',
  'alerta_unidade_comercializada_divergente',
  'casas_decimais_config',
]

/** Linha do item — Qtd. Transferida: somente leitura + operação Transferir. */
export const PILLS_ITEM_QTD_TRANSFERIDA: RegraPillId[] = ['somente_leitura', 'so_operacao']

/** Linha do item — Qtd. Cancelada: somente leitura + operação cancelamento. */
export const PILLS_ITEM_QTD_CANCELADA: RegraPillId[] = ['somente_leitura', 'so_operacao']

/** Linha do pedido — Qtd. Cancelada: calculado, bloqueado, soma mesma unidade, alerta unidade. */
export const PILLS_PEDIDO_QTD_CANCELADA: RegraPillId[] = [
  'calculado_pedido_qtd_cancelada',
  'bloqueado_edicao',
  'soma_mesma_unidade',
  'alerta_unidade_comercializada_divergente',
  'casas_decimais_config',
]

/** Linha do item — Saldo: somente leitura + fórmula (inicial − transferida − cancelada). */
export const PILLS_ITEM_SALDO: RegraPillId[] = ['somente_leitura', 'formula_config']

/** Linha do pedido — Saldo: soma na mesma unidade, bloqueado, fórmula, alerta unidade. */
export const PILLS_PEDIDO_SALDO: RegraPillId[] = [
  'calculado_pedido_saldo',
  'bloqueado_edicao',
  'formula_config',
  'alerta_unidade_comercializada_divergente',
  'casas_decimais_config',
]

/** Moeda — linha do pedido. */
export const PILLS_PEDIDO_MOEDA: RegraPillId[] = [
  'editavel_pedido',
  'replica_itens',
  'editavel_item',
]

/** Moeda — linha do item. */
export const PILLS_ITEM_MOEDA: RegraPillId[] = ['editavel_item']

/** Unidade Comercializada — linha do pedido. */
export const PILLS_PEDIDO_UNIDADE: RegraPillId[] = [
  'editavel_pedido',
  'replica_itens',
  'editavel_item',
  'alerta_divergencia',
]

/** Unidade Comercializada — linha do item (espelha pedido: 4 pills + aviso impacto). */
export const PILLS_ITEM_UNIDADE: RegraPillId[] = [
  'editavel_pedido',
  'replica_itens',
  'editavel_item',
  'alerta_divergencia',
]

/** Linha do pedido — Qtd. Inicial: soma, bloqueado, editável no item, alerta, casas decimais. */
export const PILLS_PEDIDO_QTD_INICIAL: RegraPillId[] = [
  'calculado_pedido_qtd_inicial',
  'bloqueado_edicao',
  'editavel_item',
  'alerta_divergencia',
  'casas_decimais_config',
]

/** Linha item — Qtd. Inicial: editável no item. */
export const PILLS_ITEM_QTD_INICIAL: RegraPillId[] = ['editavel_item']

/** Linha do pedido — Peso/Cubagem total: calculado, bloqueado, alerta divergência. */
export const PILLS_PEDIDO_PESO_CUBAGEM: RegraPillId[] = [
  'calculado_pedido',
  'bloqueado_edicao',
  'alerta_divergencia',
]

/** Linha do pedido — Peso líquido total. */
export const PILLS_PEDIDO_PESO_LIQUIDO: RegraPillId[] = [
  'calculado_pedido_peso_liquido',
  'bloqueado_edicao',
  'alerta_divergencia',
]

/** Linha do pedido — Peso bruto total. */
export const PILLS_PEDIDO_PESO_BRUTO: RegraPillId[] = [
  'calculado_pedido_peso_bruto',
  'bloqueado_edicao',
  'alerta_divergencia',
]

/** Linha item — Peso líquido/bruto: editável + alerta de unidade de peso divergente. */
export const PILLS_ITEM_PESO: RegraPillId[] = [
  'editavel_item',
  'alerta_unidade_peso_divergente',
]

/** Linha do pedido — Câmbio (derivado): bloqueado + calculado. */
export const PILLS_PEDIDO_CAMBIO: RegraPillId[] = [
  'bloqueado_edicao',
  'calculado_pedido',
]

/** Linha do pedido — Qtd. Volumes: total do pedido, bloqueado, alerta divergência. */
export const PILLS_PEDIDO_VOLUMES: RegraPillId[] = [
  'bloqueado_edicao',
  'calculado_pedido_volumes',
  'alerta_divergencia',
]

/** Linha do item — Qtd. Volumes: editável no item. */
export const PILLS_ITEM_VOLUMES: RegraPillId[] = ['editavel_item']

const CHAVES_DUAL_SEMPRE = new Set([
  'numero_pedido',
  'tipo_volume_pedido',
  'quantidade_volumes_pedido',
])

const MAPA_REGRA_PILLS: Record<RegraTooltipId, { pedido: RegraPillId[]; item: RegraPillId[] }> = {
  pai_editavel_replicar_alerta: {
    pedido: ['editavel_pedido', 'replica_itens', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_ghost_descricao: {
    pedido: ['editavel_pedido', 'editavel_item', 'replica_itens'],
    item: ['editavel_pedido', 'editavel_item', 'replica_itens'],
  },
  item_ghost_descricao: {
    pedido: ['editavel_pedido', 'editavel_item', 'replica_itens'],
    item: ['editavel_pedido', 'editavel_item', 'replica_itens'],
  },
  pai_ghost_ncm: {
    pedido: ['editavel_pedido', 'replica_itens', 'editavel_item'],
    item: ['editavel_pedido', 'replica_itens', 'editavel_item'],
  },
  item_ghost_ncm: {
    pedido: ['editavel_pedido', 'replica_itens', 'editavel_item'],
    item: ['editavel_pedido', 'replica_itens', 'editavel_item'],
  },
  pai_ghost_cobertura: {
    pedido: ['editavel_pedido', 'replica_itens', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_valor_item_bloqueado: {
    pedido: PILLS_PEDIDO_VALOR_ITEM,
    item: ['editavel_item'],
  },
  pai_moeda_pedido: {
    pedido: [...PILLS_PEDIDO_MOEDA],
    item: [...PILLS_ITEM_MOEDA],
  },
  pai_unidade_comercializada: {
    pedido: [...PILLS_PEDIDO_UNIDADE],
    item: [...PILLS_ITEM_UNIDADE],
  },
  pai_calculado_valor: {
    pedido: [...PILLS_PEDIDO_VALOR_TOTAL],
    item: [...PILLS_ITEM_VALOR_TOTAL],
  },
  pai_calculado_quantidade: {
    pedido: [...PILLS_PEDIDO_QTD_INICIAL],
    item: [...PILLS_ITEM_QTD_INICIAL],
  },
  pai_calculado_peso: {
    pedido: [...PILLS_PEDIDO_PESO_CUBAGEM],
    item: [...PILLS_ITEM_PESO],
  },
  pai_calculado_cubagem: {
    pedido: [...PILLS_PEDIDO_PESO_CUBAGEM],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  pai_calculado_volumes: {
    pedido: [...PILLS_PEDIDO_VOLUMES],
    item: [...PILLS_ITEM_VOLUMES],
  },
  pai_saldo_formula: {
    pedido: [...PILLS_PEDIDO_SALDO],
    item: [...PILLS_ITEM_SALDO],
  },
  pai_somente_leitura: {
    pedido: ['somente_leitura'],
    item: ['somente_leitura'],
  },
  pai_moeda_cambio: {
    pedido: [...PILLS_PEDIDO_CAMBIO],
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
  pai_importador: {
    pedido: ['editavel_pedido', 'replica_itens_auto', 'espelhado_workspace', 'itens_bloqueados_pedido'],
    item: ['somente_leitura'],
  },
  pai_workspace: {
    pedido: ['editavel_pedido', 'replica_itens_auto', 'espelhado_importador', 'itens_bloqueados_pedido'],
    item: ['somente_leitura'],
  },
  pai_status: {
    pedido: ['editavel_pedido', 'replica_itens', 'alerta_divergencia'],
    item: ['editavel_item', 'alerta_divergencia'],
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
    pedido: ['editavel_pedido', 'replica_itens_auto', 'itens_bloqueados_pedido'],
    item: ['somente_leitura'],
  },
  pai_logistica: {
    pedido: ['editavel_pedido', 'editavel_item', 'espelhado_logistica_bidirecional'],
    item: ['editavel_pedido', 'editavel_item', 'espelhado_logistica_bidirecional'],
  },
  item_logistica: {
    pedido: ['editavel_pedido', 'editavel_item', 'espelhado_logistica_bidirecional'],
    item: ['editavel_pedido', 'editavel_item', 'espelhado_logistica_bidirecional'],
  },
  dinamico_valor_unitario_item: {
    pedido: [...PILLS_PEDIDO_VALOR_UNITARIO_ITEM],
    item: [...PILLS_ITEM_VALOR_UNITARIO],
  },
  dinamico_valor_total: {
    pedido: [...PILLS_PEDIDO_VALOR_TOTAL],
    item: [...PILLS_ITEM_VALOR_TOTAL],
  },
  dinamico_qtd_inicial: {
    pedido: [...PILLS_PEDIDO_QTD_INICIAL],
    item: [...PILLS_ITEM_QTD_INICIAL],
  },
  dinamico_qtd_pronta: {
    pedido: [...PILLS_PEDIDO_QTD_PRONTA],
    item: [...PILLS_ITEM_QTD_PRONTA],
  },
  dinamico_saldo: {
    pedido: [...PILLS_PEDIDO_SALDO],
    item: [...PILLS_ITEM_SALDO],
  },
  dinamico_qtd_transferida: {
    pedido: [...PILLS_PEDIDO_QTD_TRANSFERIDA],
    item: [...PILLS_ITEM_QTD_TRANSFERIDA],
  },
  dinamico_qtd_cancelada: {
    pedido: [...PILLS_PEDIDO_QTD_CANCELADA],
    item: [...PILLS_ITEM_QTD_CANCELADA],
  },
  dinamico_peso_liquido: {
    pedido: [...PILLS_PEDIDO_PESO_LIQUIDO],
    item: [...PILLS_ITEM_PESO],
  },
  dinamico_peso_bruto: {
    pedido: [...PILLS_PEDIDO_PESO_BRUTO],
    item: [...PILLS_ITEM_PESO],
  },
  dinamico_cubagem: {
    pedido: [...PILLS_PEDIDO_PESO_CUBAGEM],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  item_editavel_padrao: {
    pedido: [],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  item_editavel_quantidade_inicial: {
    pedido: [],
    item: [...PILLS_ITEM_QTD_INICIAL],
  },
  item_editavel_valor_total: {
    pedido: [],
    item: [...PILLS_ITEM_VALOR_TOTAL],
  },
  item_editavel_qtd_pronta: {
    pedido: [],
    item: [...PILLS_ITEM_QTD_PRONTA],
  },
  item_editavel_ghost: {
    pedido: [],
    item: ['editavel_item', 'alerta_divergencia'],
  },
  item_nao_editavel_saldo: {
    pedido: [],
    item: [...PILLS_ITEM_SALDO],
  },
  item_nao_editavel_transferencia: {
    pedido: [],
    item: [...PILLS_ITEM_QTD_TRANSFERIDA],
  },
  item_nao_editavel_cancelamento: {
    pedido: [],
    item: [...PILLS_ITEM_QTD_CANCELADA],
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

// Sem subtexto «Sem checkbox» — NCM e descrição exibem checkbox no popover.
const GHOST_KEYS = new Set(['cobertura_cambial'])

export type ResolucaoPillsTooltip = {
  dual: boolean
  pedido: RegraPillId[]
  item: RegraPillId[]
  linkFormula: boolean
  ghostSemCheckbox: boolean
  numeroUnicoOrg: boolean
}

function limitarPills(pills: RegraPillId[], nivel: NivelColunaLista): RegraPillId[] {
  return ordenarPillsCanonico(pills, nivel).slice(0, MAX_PILLS_POR_BLOCO)
}

function pillsItemPorColuna(key: string, pills: RegraPillId[]): RegraPillId[] {
  if (key === 'valor_total_pedido') return PILLS_ITEM_VALOR_TOTAL
  if (key === 'valor_por_unidade_item') return PILLS_ITEM_VALOR_UNITARIO
  if (key === 'moeda_pedido') return PILLS_ITEM_MOEDA
  if (key === 'unidade_comercializada_pedido') return PILLS_ITEM_UNIDADE
  if (key === 'quantidade_pronta_itens_pedido_total') return PILLS_ITEM_QTD_PRONTA
  if (key === 'quantidade_total_pedido') return PILLS_ITEM_QTD_INICIAL
  if (key === 'quantidade_transferida_total') return PILLS_ITEM_QTD_TRANSFERIDA
  if (key === 'saldo_itens_do_pedido') return PILLS_ITEM_SALDO
  if (key === 'quantidade_cancelada_total_pedido') return PILLS_ITEM_QTD_CANCELADA
  if (key === 'quantidade_volumes_pedido') return PILLS_ITEM_VOLUMES
  if (key === 'peso_liquido_total_pedido' || key === 'peso_bruto_total_pedido') return PILLS_ITEM_PESO
  return pills
}

function pillsPedidoPorColuna(key: string, pills: RegraPillId[]): RegraPillId[] {
  if (key === 'valor_por_unidade_item') return PILLS_PEDIDO_VALOR_UNITARIO_ITEM
  if (key === 'moeda_pedido') return PILLS_PEDIDO_MOEDA
  if (key === 'unidade_comercializada_pedido') return PILLS_PEDIDO_UNIDADE
  if (key === 'valor_total_pedido') return PILLS_PEDIDO_VALOR_TOTAL
  if (key === 'quantidade_pronta_itens_pedido_total') return PILLS_PEDIDO_QTD_PRONTA
  if (key === 'quantidade_total_pedido') return PILLS_PEDIDO_QTD_INICIAL
  if (key === 'quantidade_transferida_total') return PILLS_PEDIDO_QTD_TRANSFERIDA
  if (key === 'quantidade_cancelada_total_pedido') return PILLS_PEDIDO_QTD_CANCELADA
  if (key === 'saldo_itens_do_pedido') return PILLS_PEDIDO_SALDO
  if (key === 'peso_liquido_total_pedido') return PILLS_PEDIDO_PESO_LIQUIDO
  if (key === 'peso_bruto_total_pedido') return PILLS_PEDIDO_PESO_BRUTO
  if (key === 'cubagem_total_pedido') return PILLS_PEDIDO_PESO_CUBAGEM
  if (
    key === 'moeda_cambio_pedido'
    || key === 'taxa_cambio_estimada'
    || key === 'valor_total_cambio_pedido'
  ) return PILLS_PEDIDO_CAMBIO
  if (key === 'quantidade_volumes_pedido') return PILLS_PEDIDO_VOLUMES
  return pills
}

export function obterPillsTooltipColuna(
  key: string,
  opts?: { modoDinamicoPedidoItem?: boolean; colunaPersonalizada?: boolean },
): ResolucaoPillsTooltip {
  const dual =
    CHAVES_DUAL_SEMPRE.has(key)
    || Boolean(opts?.modoDinamicoPedidoItem && CHAVES_COLUNA_DINAMICA_PEDIDO_ITEM.has(key))

  if (key === 'valor_por_unidade_item' && !dual) {
    return {
      dual: false,
      pedido: limitarPills([...PILLS_COLUNA_VALOR_UNITARIO], 'pai'),
      item: limitarPills([...PILLS_ITEM_VALOR_UNITARIO], 'item'),
      linkFormula: false,
      ghostSemCheckbox: false,
      numeroUnicoOrg: false,
    }
  }

  if (key === 'valor_total_pedido' && !dual) {
    return {
      dual: false,
      pedido: limitarPills([...PILLS_COLUNA_VALOR_TOTAL], 'pai'),
      item: limitarPills([...PILLS_ITEM_VALOR_TOTAL], 'item'),
      linkFormula: false,
      ghostSemCheckbox: false,
      numeroUnicoOrg: false,
    }
  }

  if (key === 'quantidade_transferida_total' && !dual) {
    return {
      dual: false,
      pedido: limitarPills([...PILLS_PEDIDO_QTD_TRANSFERIDA], 'pai'),
      item: limitarPills([...PILLS_ITEM_QTD_TRANSFERIDA], 'item'),
      linkFormula: false,
      ghostSemCheckbox: false,
      numeroUnicoOrg: false,
    }
  }

  if (key === 'saldo_itens_do_pedido' && !dual) {
    return {
      dual: false,
      pedido: limitarPills([...PILLS_PEDIDO_SALDO], 'pai'),
      item: limitarPills([...PILLS_ITEM_SALDO], 'item'),
      linkFormula: true,
      ghostSemCheckbox: false,
      numeroUnicoOrg: false,
    }
  }

  if (key === 'quantidade_cancelada_total_pedido' && !dual) {
    return {
      dual: false,
      pedido: limitarPills([...PILLS_PEDIDO_QTD_CANCELADA], 'pai'),
      item: limitarPills([...PILLS_ITEM_QTD_CANCELADA], 'item'),
      linkFormula: false,
      ghostSemCheckbox: false,
      numeroUnicoOrg: false,
    }
  }

  if (key === 'quantidade_volumes_pedido' && !dual) {
    return {
      dual: false,
      pedido: limitarPills([...PILLS_PEDIDO_VOLUMES], 'pai'),
      item: limitarPills([...PILLS_ITEM_VOLUMES], 'item'),
      linkFormula: false,
      ghostSemCheckbox: false,
      numeroUnicoOrg: false,
    }
  }

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
    pedido: limitarPills(pillsPedidoPorColuna(key, mapaPai.pedido), 'pai'),
    item: limitarPills(pillsItemPorColuna(key, mapaItem.item), 'item'),
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
  if (key === 'moeda_pedido') {
    return limitarPills(nivel === 'item' ? [...PILLS_ITEM_MOEDA] : [...PILLS_PEDIDO_MOEDA], nivel)
  }
  if (key === 'unidade_comercializada_pedido') {
    return limitarPills(nivel === 'item' ? [...PILLS_ITEM_UNIDADE] : [...PILLS_PEDIDO_UNIDADE], nivel)
  }
  if (key === 'valor_por_unidade_item' && nivel === 'pai') {
    return limitarPills([...PILLS_PEDIDO_VALOR_UNITARIO_ITEM], 'pai')
  }
  if (key === 'valor_por_unidade_item' && nivel === 'item') {
    return limitarPills([...PILLS_ITEM_VALOR_UNITARIO], 'item')
  }
  if (key === 'valor_total_pedido' && nivel === 'pai') {
    return limitarPills([...PILLS_PEDIDO_VALOR_TOTAL], 'pai')
  }
  if (key === 'valor_total_pedido' && nivel === 'item') {
    return limitarPills([...PILLS_ITEM_VALOR_TOTAL], 'item')
  }
  if (key === 'quantidade_pronta_itens_pedido_total' && nivel === 'pai') {
    return limitarPills(PILLS_PEDIDO_QTD_PRONTA, 'pai')
  }
  if (key === 'quantidade_pronta_itens_pedido_total' && nivel === 'item') {
    return limitarPills(PILLS_ITEM_QTD_PRONTA, 'item')
  }
  if (key === 'quantidade_total_pedido' && nivel === 'pai') {
    return limitarPills(PILLS_PEDIDO_QTD_INICIAL, 'pai')
  }
  if (key === 'quantidade_total_pedido' && nivel === 'item') {
    return limitarPills(PILLS_ITEM_QTD_INICIAL, 'item')
  }
  if (key === 'quantidade_transferida_total' && nivel === 'pai') {
    return limitarPills(PILLS_PEDIDO_QTD_TRANSFERIDA, 'pai')
  }
  if (key === 'quantidade_transferida_total' && nivel === 'item') {
    return limitarPills(PILLS_ITEM_QTD_TRANSFERIDA, 'item')
  }
  if (key === 'quantidade_cancelada_total_pedido' && nivel === 'pai') {
    return limitarPills(PILLS_PEDIDO_QTD_CANCELADA, 'pai')
  }
  if (key === 'quantidade_cancelada_total_pedido' && nivel === 'item') {
    return limitarPills(PILLS_ITEM_QTD_CANCELADA, 'item')
  }
  if (key === 'saldo_itens_do_pedido' && nivel === 'pai') {
    return limitarPills(PILLS_PEDIDO_SALDO, 'pai')
  }
  if (key === 'saldo_itens_do_pedido' && nivel === 'item') {
    return limitarPills(PILLS_ITEM_SALDO, 'item')
  }
  if (
    (key === 'peso_liquido_total_pedido' || key === 'peso_bruto_total_pedido' || key === 'cubagem_total_pedido')
    && nivel === 'pai'
  ) {
    if (key === 'peso_liquido_total_pedido') return limitarPills(PILLS_PEDIDO_PESO_LIQUIDO, 'pai')
    if (key === 'peso_bruto_total_pedido') return limitarPills(PILLS_PEDIDO_PESO_BRUTO, 'pai')
    return limitarPills(PILLS_PEDIDO_PESO_CUBAGEM, 'pai')
  }
  if ((key === 'peso_liquido_total_pedido' || key === 'peso_bruto_total_pedido') && nivel === 'item') {
    return limitarPills(PILLS_ITEM_PESO, 'item')
  }
  if (
    (key === 'moeda_cambio_pedido' || key === 'taxa_cambio_estimada' || key === 'valor_total_cambio_pedido')
    && nivel === 'pai'
  ) {
    return limitarPills(PILLS_PEDIDO_CAMBIO, 'pai')
  }
  if (key === 'quantidade_volumes_pedido' && nivel === 'pai') {
    return limitarPills(PILLS_PEDIDO_VOLUMES, 'pai')
  }
  if (key === 'quantidade_volumes_pedido' && nivel === 'item') {
    return limitarPills(PILLS_ITEM_VOLUMES, 'item')
  }
  return limitarPills(nivel === 'item' ? mapa.item : mapa.pedido, nivel)
}

export function regraTemLinkFormula(pills: RegraPillId[]): boolean {
  return pills.includes('formula_config')
}
