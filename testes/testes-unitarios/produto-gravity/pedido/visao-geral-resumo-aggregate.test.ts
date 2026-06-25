import { describe, expect, it } from 'vitest'
import { agregarVisaoGeralResumo } from '../../../../servicos-global/produto/pedido/shared/visaoGeralResumoAggregate.js'

describe('agregarVisaoGeralResumo', () => {
  it('retorna zeros para lista vazia', () => {
    const r = agregarVisaoGeralResumo([])
    expect(r.total).toBe(0)
    expect(r.kpis.valor_total).toBe(0)
    expect(r.funil).toEqual([])
  })

  it('agrega KPIs e funil por status', () => {
    const r = agregarVisaoGeralResumo([
      {
        status: 'aberto',
        valor_total_pedido: 100,
        tipo_operacao: 'importacao',
        incoterm: 'fob',
        moeda_pedido: 'USD',
        data_emissao_pedido: new Date().toISOString(),
        numero_pedido: 'P-1',
      },
      {
        status: 'consolidado',
        valor_total_pedido: 200,
        tipo_operacao: 'exportacao',
        incoterm: 'cif',
        moeda_pedido: 'BRL',
        data_emissao_pedido: new Date().toISOString(),
        numero_pedido: 'P-2',
      },
    ])
    expect(r.total).toBe(2)
    expect(r.kpis.valor_total).toBe(300)
    expect(r.kpis.concluido_count).toBe(1)
    expect(r.kpis.andamento_count).toBe(1)
    expect(r.funil.length).toBeGreaterThan(0)
    expect(r.maiorPedido?.numero).toBe('P-2')
  })
})
