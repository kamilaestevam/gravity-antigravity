import { describe, expect, it } from 'vitest'
import {
  CAMPOS_AGREGADOS_PARA_ITEM,
  CAMPOS_SOMENTE_VISUALIZAR,
  kanbanEdicaoItemUsaPrimeiroItem,
  resolverEdicaoKanbanParaLista,
} from '../../../servicos-global/produto/pedido/client/src/shared/kanbanNavegacaoLista'
import { KANBAN_CAMPOS_DISPONIVEIS } from '../../../servicos-global/produto/pedido/client/src/shared/types'

describe('resolverEdicaoKanbanParaLista', () => {
  const idPedido = 'pedido-abc'

  it('mapeia quantidade_total_pedido para edição no item', () => {
    expect(resolverEdicaoKanbanParaLista('quantidade_total_pedido', idPedido)).toEqual({
      nivel: 'item',
      idPedido,
      colunaPai: 'quantidade_total_pedido',
      campoItem: 'quantidade_inicial_pedido',
    })
  })

  it('mapeia valor e pesos agregados para campos do item', () => {
    expect(resolverEdicaoKanbanParaLista('valor_total_pedido', idPedido)).toMatchObject({
      nivel: 'item',
      campoItem: 'valor_total_item',
    })
    expect(resolverEdicaoKanbanParaLista('peso_liquido_total_pedido', idPedido)).toMatchObject({
      nivel: 'item',
      campoItem: 'peso_liquido_unitario',
    })
    expect(resolverEdicaoKanbanParaLista('unidade_comercializada_pedido', idPedido)).toMatchObject({
      nivel: 'item',
      campoItem: 'unidade_comercializada_item',
    })
  })

  it('campos operacionais/saldo navegam sem edição', () => {
    for (const campo of CAMPOS_SOMENTE_VISUALIZAR) {
      expect(resolverEdicaoKanbanParaLista(campo, idPedido)).toEqual({
        nivel: 'visualizar',
        idPedido,
        colunaPai: campo,
      })
    }
  })

  it('campos editáveis do pedido permanecem no nível pai', () => {
    const camposPai = [
      'numero_pedido',
      'tipo_operacao',
      'nome_exportador',
      'moeda_pedido',
      'incoterm',
      'numero_invoice',
      'numero_proforma',
      'referencia_exportador',
      'referencia_importador',
      'condicao_pagamento',
      'cobertura_cambial',
      'data_emissao_pedido',
      'data_prevista_coleta_pedido',
    ]
    for (const campo of camposPai) {
      expect(resolverEdicaoKanbanParaLista(campo, idPedido)).toEqual({ nivel: 'pai', campo })
    }
  })

  it('cobre todos os campos configuráveis do Kanban sem lançar exceção', () => {
    for (const { campo } of KANBAN_CAMPOS_DISPONIVEIS) {
      const destino = resolverEdicaoKanbanParaLista(campo, idPedido)
      expect(['pai', 'item', 'visualizar']).toContain(destino.nivel)
    }
  })

  it('todo agregado editável no item está registrado', () => {
    expect(Object.keys(CAMPOS_AGREGADOS_PARA_ITEM).length).toBeGreaterThanOrEqual(7)
    expect(kanbanEdicaoItemUsaPrimeiroItem('quantidade_total_pedido')).toBe(true)
    expect(kanbanEdicaoItemUsaPrimeiroItem('numero_pedido')).toBe(false)
  })
})
