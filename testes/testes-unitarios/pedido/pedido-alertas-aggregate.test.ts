import { describe, expect, it } from 'vitest'
import {
  aggregateAlertasKpis,
  contarAlertasPedidoEItens,
  REGRAS_ALERTAS_DEFAULT,
} from '../../../servicos-global/produto/pedido/shared/pedidoAlertasAggregate'

describe('pedidoAlertasAggregate', () => {
  it('conta Part Number duplicado como alerta de item e resumo no pedido', () => {
    const pedido = { id_pedido: 'p1', numero_pedido: 'PED-001' }
    const itens = [
      { part_number: 'ABC' },
      { part_number: 'ABC' },
      { part_number: 'XYZ' },
    ]

    const { alertasPedido, alertasItem } = contarAlertasPedidoEItens(
      pedido,
      itens,
      REGRAS_ALERTAS_DEFAULT,
      false,
    )

    expect(alertasItem).toBe(2)
    expect(alertasPedido).toBeGreaterThanOrEqual(1)
  })

  it('conta número de pedido duplicado quando regra habilitada', () => {
    const pedido = { id_pedido: 'p1', numero_pedido: 'DUP' }
    const { alertasPedido } = contarAlertasPedidoEItens(
      pedido,
      [],
      REGRAS_ALERTAS_DEFAULT,
      true,
    )
    expect(alertasPedido).toBe(1)
  })

  it('conta divergência de valor total pedido vs soma itens', () => {
    const pedido = { id_pedido: 'p1', valor_total_pedido: 100 }
    const itens = [
      { valor_total_item: 40 },
      { valor_total_item: 50 },
    ]

    const { alertasPedido, alertasItem } = contarAlertasPedidoEItens(
      pedido,
      itens,
      REGRAS_ALERTAS_DEFAULT,
      false,
    )

    expect(alertasItem).toBe(0)
    expect(alertasPedido).toBe(1)
  })

  it('agrega alertas_total como soma pedido + item', () => {
    const pedidos = [
      { id_pedido: 'p1', numero_pedido: 'A', valor_total_pedido: 10 },
      { id_pedido: 'p2', numero_pedido: 'B', valor_total_pedido: 20 },
    ]
    const itensByPedido = new Map<string, Record<string, unknown>[]>([
      ['p1', [{ valor_total_item: 5 }, { valor_total_item: 5 }, { part_number: 'X' }, { part_number: 'X' }]],
      ['p2', [{ valor_total_item: 20 }]],
    ])

    const result = aggregateAlertasKpis(pedidos, itensByPedido, REGRAS_ALERTAS_DEFAULT)

    expect(result.alertas_item).toBe(2)
    expect(result.alertas_total).toBe(result.alertas_pedido + result.alertas_item)
    expect(result.alertas_breakdown.part_number_duplicado_item).toBe(2)
    expect(result.alertas_breakdown.valor_total_divergente).toBeGreaterThanOrEqual(0)
  })

  it('retorna breakdown detalhado por tipo de alerta', () => {
    const pedido = { id_pedido: 'p1', numero_pedido: 'DUP', valor_total_pedido: 100 }
    const itens = [
      { valor_total_item: 40 },
      { valor_total_item: 50, part_number: 'ABC' },
      { part_number: 'ABC' },
    ]

    const { breakdown } = contarAlertasPedidoEItens(
      pedido,
      itens,
      REGRAS_ALERTAS_DEFAULT,
      true,
    )

    expect(breakdown.valor_total_divergente).toBe(1)
    expect(breakdown.numero_pedido_duplicado).toBe(1)
    expect(breakdown.part_number_duplicado_item).toBe(2)
    expect(breakdown.part_number_duplicado_resumo).toBe(1)
  })

  it('ignora alerta de valor quando regra desabilitada', () => {
    const pedido = { id_pedido: 'p1', valor_total_pedido: 100 }
    const itens = [{ valor_total_item: 50 }]

    const { alertasPedido, breakdown } = contarAlertasPedidoEItens(
      pedido,
      itens,
      { ...REGRAS_ALERTAS_DEFAULT, alerta_valor_total_divergente: false },
      false,
    )

    expect(alertasPedido).toBe(0)
    expect(breakdown.valor_total_divergente).toBe(0)
  })
})
