import { describe, expect, it } from 'vitest'
import {
  CAMPOS_AGREGADOS_EDITAVEIS_NO_ITEM,
  CAMPOS_SOMENTE_VISUALIZAR,
  kanbanEdicaoItemUsaPrimeiroItem,
  resolverEdicaoKanbanParaLista,
  type DestinoEdicaoKanbanLista,
} from '../../../servicos-global/produto/pedido/client/src/shared/kanbanNavegacaoLista'
import { KANBAN_CAMPOS_DISPONIVEIS } from '../../../servicos-global/produto/pedido/client/src/shared/types'

/**
 * Raio-X Kanban → Lista: destino esperado por campo clicável.
 * Regra: editável abre popover (pai ou item); não editável só expande/rola (visualizar).
 *
 * 32 campos de KANBAN_CAMPOS_DISPONIVEIS + status (header do modal) = 33 atalhos.
 */
type EsperadoRaioX =
  | { nivel: 'pai'; campo: string }
  | { nivel: 'item'; colunaPai: string; campoItem: string }
  | { nivel: 'visualizar'; colunaPai: string }

const KANBAN_RAIO_X_ESPERADO: Record<string, EsperadoRaioX> = {
  // ── Aba Pedido (15) ───────────────────────────────────────────────────────
  numero_pedido:              { nivel: 'pai', campo: 'numero_pedido' },
  tipo_operacao:              { nivel: 'pai', campo: 'tipo_operacao' },
  nome_exportador:            { nivel: 'pai', campo: 'nome_exportador' },
  nome_importador:            { nivel: 'pai', campo: 'nome_importador' },
  valor_total_pedido:         { nivel: 'visualizar', colunaPai: 'valor_total_pedido' },
  moeda_pedido:               { nivel: 'pai', campo: 'moeda_pedido' },
  incoterm:                   { nivel: 'pai', campo: 'incoterm' },
  numero_invoice:             { nivel: 'pai', campo: 'numero_invoice' },
  numero_proforma:            { nivel: 'pai', campo: 'numero_proforma' },
  referencia_exportador:      { nivel: 'pai', campo: 'referencia_exportador' },
  referencia_importador:      { nivel: 'pai', campo: 'referencia_importador' },
  condicao_pagamento:         { nivel: 'pai', campo: 'condicao_pagamento' },
  cobertura_cambial:          { nivel: 'pai', campo: 'cobertura_cambial' },
  peso_liquido_total_pedido:  { nivel: 'visualizar', colunaPai: 'peso_liquido_total_pedido' },
  peso_bruto_total_pedido:    { nivel: 'visualizar', colunaPai: 'peso_bruto_total_pedido' },

  // ── Aba Quantidades (6) ───────────────────────────────────────────────────
  quantidade_total_pedido: {
    nivel: 'item',
    colunaPai: 'quantidade_total_pedido',
    campoItem: 'quantidade_inicial_pedido',
  },
  quantidade_pronta_itens_pedido_total: {
    nivel: 'item',
    colunaPai: 'quantidade_pronta_itens_pedido_total',
    campoItem: 'quantidade_pronta_total_item_pedido',
  },
  quantidade_transferida_total:        { nivel: 'visualizar', colunaPai: 'quantidade_transferida_total' },
  quantidade_cancelada_total_pedido:   { nivel: 'visualizar', colunaPai: 'quantidade_cancelada_total_pedido' },
  saldo_itens_do_pedido:               { nivel: 'visualizar', colunaPai: 'saldo_itens_do_pedido' },
  unidade_comercializada_pedido:       { nivel: 'pai', campo: 'unidade_comercializada_pedido' },

  // ── Aba Datas (11) ────────────────────────────────────────────────────────
  data_emissao_pedido:             { nivel: 'pai', campo: 'data_emissao_pedido' },
  data_prevista_coleta_pedido:     { nivel: 'pai', campo: 'data_prevista_coleta_pedido' },
  data_confirmada_coleta_pedido:   { nivel: 'pai', campo: 'data_confirmada_coleta_pedido' },
  data_meta_coleta_pedido:         { nivel: 'pai', campo: 'data_meta_coleta_pedido' },
  data_prevista_pedido_pronto:     { nivel: 'pai', campo: 'data_prevista_pedido_pronto' },
  data_confirmada_pedido_pronto:   { nivel: 'pai', campo: 'data_confirmada_pedido_pronto' },
  data_meta_pedido_pronto:         { nivel: 'pai', campo: 'data_meta_pedido_pronto' },
  data_prevista_inspecao_pedido:   { nivel: 'pai', campo: 'data_prevista_inspecao_pedido' },
  data_confirmada_inspecao_pedido: { nivel: 'pai', campo: 'data_confirmada_inspecao_pedido' },
  data_meta_inspecao_pedido:       { nivel: 'pai', campo: 'data_meta_inspecao_pedido' },
  data_consolidacao_pedido:        { nivel: 'pai', campo: 'data_consolidacao_pedido' },

  // ── Header do modal Kanban (fora das abas configuráveis) ──────────────────
  status: { nivel: 'pai', campo: 'status' },
}

function assertDestinoIgualEsperado(
  campo: string,
  destino: DestinoEdicaoKanbanLista,
  esperado: EsperadoRaioX,
  idPedido: string,
): void {
  expect(destino.nivel, `[${campo}] nivel`).toBe(esperado.nivel)

  if (esperado.nivel === 'pai') {
    expect(destino).toEqual({ nivel: 'pai', campo: esperado.campo })
    return
  }

  if (esperado.nivel === 'visualizar') {
    expect(destino).toEqual({
      nivel: 'visualizar',
      idPedido,
      colunaPai: esperado.colunaPai,
    })
    return
  }

  expect(destino).toEqual({
    nivel: 'item',
    idPedido,
    colunaPai: esperado.colunaPai,
    campoItem: esperado.campoItem,
  })
}

describe('resolverEdicaoKanbanParaLista', () => {
  const idPedido = 'pedido-abc'

  it('raio-x: 32 campos configuráveis + status batem com destino esperado na Lista', () => {
    const camposConfiguraveis = KANBAN_CAMPOS_DISPONIVEIS.map(c => c.campo)
    expect(camposConfiguraveis).toHaveLength(32)

    for (const campo of camposConfiguraveis) {
      const esperado = KANBAN_RAIO_X_ESPERADO[campo]
      expect(esperado, `campo ${campo} sem entrada no raio-x`).toBeDefined()
      assertDestinoIgualEsperado(
        campo,
        resolverEdicaoKanbanParaLista(campo, idPedido),
        esperado!,
        idPedido,
      )
    }

    assertDestinoIgualEsperado(
      'status',
      resolverEdicaoKanbanParaLista('status', idPedido),
      KANBAN_RAIO_X_ESPERADO.status,
      idPedido,
    )

    expect(Object.keys(KANBAN_RAIO_X_ESPERADO)).toHaveLength(33)
  })

  it('raio-x: contagem por nivel reflete a regra editável vs visualizar', () => {
    const niveis = Object.values(KANBAN_RAIO_X_ESPERADO).map(e => e.nivel)
    expect(niveis.filter(n => n === 'pai').length).toBe(25)
    expect(niveis.filter(n => n === 'item').length).toBe(2)
    expect(niveis.filter(n => n === 'visualizar').length).toBe(6)
  })

  it('campos visualizar do raio-x estão no set exportado (fail-safe inclui cubagem)', () => {
    const visualizarNoRaioX = Object.entries(KANBAN_RAIO_X_ESPERADO)
      .filter(([, e]) => e.nivel === 'visualizar')
      .map(([campo]) => campo)

    for (const campo of visualizarNoRaioX) {
      expect(CAMPOS_SOMENTE_VISUALIZAR.has(campo), campo).toBe(true)
    }
    expect(CAMPOS_SOMENTE_VISUALIZAR.has('cubagem_total_pedido')).toBe(true)
  })

  it('só quantidades inicial/pronta abrem edição no item', () => {
    expect(Object.keys(CAMPOS_AGREGADOS_EDITAVEIS_NO_ITEM)).toEqual([
      'quantidade_total_pedido',
      'quantidade_pronta_itens_pedido_total',
    ])
    expect(kanbanEdicaoItemUsaPrimeiroItem('quantidade_total_pedido')).toBe(true)
    expect(kanbanEdicaoItemUsaPrimeiroItem('valor_total_pedido')).toBe(false)
    expect(kanbanEdicaoItemUsaPrimeiroItem('numero_pedido')).toBe(false)
  })
})
