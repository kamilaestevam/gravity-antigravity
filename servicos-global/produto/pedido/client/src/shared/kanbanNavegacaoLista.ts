/**
 * Mapeia campos clicáveis no modal Kanban para o destino correto na Lista.
 *
 * SSOT de navegação Kanban → Lista. Espelha `buildMapaColunasFilho` em Pedidos.tsx:
 * agregados do pedido editam no item; operacionais/saldo só visualizam.
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
 * Agregados do Kanban → coluna pai + campo editável no item.
 * Manter sincronizado com `buildMapaColunasFilho` (Pedidos.tsx).
 */
export const CAMPOS_AGREGADOS_PARA_ITEM: Record<string, { colunaPai: string; campoItem: string }> = {
  quantidade_total_pedido: {
    colunaPai: 'quantidade_total_pedido',
    campoItem: 'quantidade_inicial_pedido',
  },
  quantidade_pronta_itens_pedido_total: {
    colunaPai: 'quantidade_pronta_itens_pedido_total',
    campoItem: 'quantidade_pronta_total_item_pedido',
  },
  valor_total_pedido: {
    colunaPai: 'valor_total_pedido',
    campoItem: 'valor_total_item',
  },
  peso_liquido_total_pedido: {
    colunaPai: 'peso_liquido_total_pedido',
    campoItem: 'peso_liquido_unitario',
  },
  peso_bruto_total_pedido: {
    colunaPai: 'peso_bruto_total_pedido',
    campoItem: 'peso_bruto_unitario',
  },
  cubagem_total_pedido: {
    colunaPai: 'cubagem_total_pedido',
    campoItem: 'cubagem_unitaria',
  },
  unidade_comercializada_pedido: {
    colunaPai: 'unidade_comercializada_pedido',
    campoItem: 'unidade_comercializada_item',
  },
}

/**
 * Campos que só mudam via operação de negócio ou são derivados — expande e rola,
 * sem abrir popover de edição.
 */
export const CAMPOS_SOMENTE_VISUALIZAR = new Set([
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
  const agregado = CAMPOS_AGREGADOS_PARA_ITEM[editCampo]
  if (agregado) {
    return {
      nivel: 'item',
      idPedido,
      colunaPai: agregado.colunaPai,
      campoItem: agregado.campoItem,
    }
  }
  if (CAMPOS_SOMENTE_VISUALIZAR.has(editCampo)) {
    return { nivel: 'visualizar', idPedido, colunaPai: editCampo }
  }
  // Calculados/saldo não mapeados explicitamente → visualizar (fail-safe)
  const tipo = getTipoCampo(editCampo)
  if (tipo === 'calculado' || tipo === 'saldo') {
    return { nivel: 'visualizar', idPedido, colunaPai: editCampo }
  }
  return { nivel: 'pai', campo: editCampo }
}

/** Indica se o campo usa edição no primeiro item quando há múltiplos itens */
export function kanbanEdicaoItemUsaPrimeiroItem(campo: string): boolean {
  return campo in CAMPOS_AGREGADOS_PARA_ITEM
}
