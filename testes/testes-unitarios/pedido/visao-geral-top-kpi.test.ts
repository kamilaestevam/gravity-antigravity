// @vitest-environment node
/// <reference types="vitest/globals" />

import { describe, it, expect } from 'vitest'
import { calcularTopKpiCardsVisaoGeral } from '../../../servicos-global/produto/pedido/client/src/shared/visaoGeralTopKpi'
import type { Pedido } from '../../../servicos-global/produto/pedido/client/src/shared/types'

const t = (key: string, opts?: { defaultValue?: string }) =>
  (opts?.defaultValue ?? key)

function pedido(status: string, valor: number): Pedido {
  return {
    id: `p-${status}`,
    status,
    valor_total_pedido: valor,
  } as Pedido
}

describe('calcularTopKpiCardsVisaoGeral', () => {
  it('conta pedidos pelo slug configurado em cada widget', () => {
    const pedidos = [
      pedido('rascunho', 100),
      pedido('rascunho', 200),
      pedido('aprovado', 50),
      pedido('consolidado', 300),
    ]
    const mapa = {
      kpi_total_pedidos: 'rascunho',
      kpi_pedidos_abertos: 'aprovado',
      kpi_saldo_total: 'consolidado',
      kpi_valor_total: 'transferido',
    }
    const rotulos = {
      rascunho: { label: 'Rascunho', cor: '#aaa' },
      aprovado: { label: 'Aprovado', cor: '#bbb' },
      consolidado: { label: 'Consolidado', cor: '#ccc' },
    }

    const cards = calcularTopKpiCardsVisaoGeral(pedidos, mapa, rotulos, t)

    expect(cards[0].titulo).toBe('Rascunho')
    expect(cards[0].count).toBe(2)
    expect(cards[0].valor).toBe(300)
    expect(cards[1].count).toBe(1)
    expect(cards[2].count).toBe(1)
    expect(cards[3].count).toBe(0)
  })
})
