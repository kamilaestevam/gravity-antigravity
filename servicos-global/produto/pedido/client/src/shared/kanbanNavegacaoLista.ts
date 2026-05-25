/**
 * Mapeia campos clicáveis no modal Kanban para o destino correto na Lista.
 *
 * Regra: Kanban leva ao local correto — se editável abre popover; se não, só expande/rola.
 * Agregados calculados (valor total, peso, saldo…) nunca abrem edição via atalho Kanban.
 * Exceção explícita: quantidades inicial/pronta editam no item (coluna alinhada ao pai).
 */

import { getTipoCampo } from './columnBehaviorConfig'

export type DestinoEdicaoListaPai = {
  nivel: 'pai'
  campo: string
}

export type DestinoEdicaoListaItem = {
  nivel: 'item'
  idPedido: string
  /** Chave da coluna pai (alinhamento visual na tabela) */
  colunaPai: string
  /** Campo real persistido no PedidoItem */
  campoItem: string
}

export type DestinoVisualizarLista = {
  nivel: 'visualizar'
  idPedido: string
  colunaPai: string
}

export type DestinoEdicaoKanbanLista =
  | DestinoEdicaoListaPai
  | DestinoEdicaoListaItem
  | DestinoVisualizarLista

/**
 * Únicos agregados cujo clique no Kanban abre edição inline no item.
 * Demais calculados/saldos → visualizar (sem popover).
 */
export const CAMPOS_AGREGADOS_EDITAVEIS_NO_ITEM: Record<string, { colunaPai: string; campoItem: string }> = {
  quantidade_total_pedido: {
    colunaPai: 'quantidade_total_pedido',
    campoItem: 'quantidade_inicial_pedido',
  },
  quantidade_pronta_itens_pedido_total: {
    colunaPai: 'quantidade_pronta_itens_pedido_total',
    campoItem: 'quantidade_pronta_total_item_pedido',
  },
}

/** @deprecated Use CAMPOS_AGREGADOS_EDITAVEIS_NO_ITEM */
export const CAMPOS_AGREGADOS_PARA_ITEM = CAMPOS_AGREGADOS_EDITAVEIS_NO_ITEM

/**
 * Campos que só mudam via operação de negócio ou são totais não editáveis pelo atalho —
 * expande, rola até a coluna, sem popover.
 */
export const CAMPOS_SOMENTE_VISUALIZAR = new Set([
  'valor_total_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'saldo_itens_do_pedido',
])

/** Campos ghost: coluna aparece no pai, gravação ocorre nos itens via handleEditar */
export const CAMPOS_GHOST_PAI = new Set([
  'ncm',
  'descricao_item',
  'cobertura_cambial',
])

export function resolverEdicaoKanbanParaLista(
  editCampo: string,
  idPedido: string,
): DestinoEdicaoKanbanLista {
  const agregadoEditavel = CAMPOS_AGREGADOS_EDITAVEIS_NO_ITEM[editCampo]
  if (agregadoEditavel) {
    return {
      nivel: 'item',
      idPedido,
      colunaPai: agregadoEditavel.colunaPai,
      campoItem: agregadoEditavel.campoItem,
    }
  }
  if (CAMPOS_SOMENTE_VISUALIZAR.has(editCampo)) {
    return { nivel: 'visualizar', idPedido, colunaPai: editCampo }
  }
  const tipo = getTipoCampo(editCampo)
  if (tipo === 'calculado' || tipo === 'saldo') {
    return { nivel: 'visualizar', idPedido, colunaPai: editCampo }
  }
  return { nivel: 'pai', campo: editCampo }
}

/** Indica se o campo abre edição no primeiro item quando há múltiplos itens */
export function kanbanEdicaoItemUsaPrimeiroItem(campo: string): boolean {
  return campo in CAMPOS_AGREGADOS_EDITAVEIS_NO_ITEM
}
