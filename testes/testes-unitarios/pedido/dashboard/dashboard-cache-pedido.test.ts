// @vitest-environment node
/// <reference types="vitest/globals" />

import {
  chaveCacheDashboardBundle,
  chaveCacheDashboardKpis,
  getCachedDashboardKpis,
  invalidateDashboardCachePedido,
  resetDashboardCachePedidoForTests,
  setCachedDashboardKpis,
} from '../../../../servicos-global/produto/pedido/server/src/shared/dashboard-cache-pedido.js'
import { resolverPeriodoAnterior } from '../../../../servicos-global/produto/pedido/server/src/shared/pedido-periodo-filtro.js'
import { dashboardBundleResponseSchema } from '../../../../servicos-global/produto/pedido/client/src/shared/dashboard-schemas.js'

const kpisMock = {
  period: '30d',
  total_pedidos: 10,
  pedidos_abertos: 1,
  pedidos_em_andamento: 2,
  pedidos_consolidados: 3,
  pedidos_cancelados: 0,
  pedidos_rascunho: 0,
  pedidos_atrasados: 0,
  pedidos_sem_exportador: 0,
  pedidos_importacao: 5,
  pedidos_exportacao: 5,
  valor_total: 1000,
  valor_total_brl: 5000,
  moedas_sem_taxa: [],
  cobertura_pendente: 0,
  qtd_total: 100,
  ticket_medio: 100,
  itens_prontos: 50,
  qtd_inicial_total: 100,
  qtd_atual_total: 80,
  qtd_transferida_total: 10,
  valor_itens_total: 900,
  taxa_atraso: 0,
  taxa_conclusao_itens: 50,
  exposicao_financeira: 0,
  taxa_transferencia: 10,
  pedidos_sem_incoterm: 0,
  pedidos_sem_fabricante: 0,
  pedidos_sem_proforma: 0,
  pedidos_sem_invoice: 0,
  pedidos_sem_ref_imp: 0,
  moedas_distintas: 1,
  peso_bruto_total: 0,
  cubagem_total: 0,
  itens_sem_cobertura: 0,
  qtd_cancelada_total: 0,
}

describe('dashboard-cache-pedido', () => {
  beforeEach(() => resetDashboardCachePedidoForTests())

  it('prefixa chaves com organizacao:', () => {
    expect(chaveCacheDashboardKpis('org1', 'ws-a', '30d')).toBe(
      'organizacao:org1:pedido:dashboard:kpis:ws-a:30d:atual',
    )
    expect(chaveCacheDashboardBundle('org1', 'org', '30d')).toBe(
      'organizacao:org1:pedido:dashboard:bundle:org:30d',
    )
  })

  it('armazena e recupera KPIs por TTL', async () => {
    const key = chaveCacheDashboardKpis('org1', 'org', '30d')
    await setCachedDashboardKpis(key, kpisMock)
    expect(await getCachedDashboardKpis(key)).toEqual(kpisMock)
  })

  it('invalida todo cache da organização', async () => {
    const key = chaveCacheDashboardKpis('org1', 'org', '30d')
    await setCachedDashboardKpis(key, kpisMock)
    await invalidateDashboardCachePedido('org1')
    expect(await getCachedDashboardKpis(key)).toBeNull()
  })
})

describe('resolverPeriodoAnterior', () => {
  it('retorna null para periodo tudo', () => {
    expect(resolverPeriodoAnterior('tudo')).toBeNull()
  })

  it('retorna intervalo anterior para 30d', () => {
    const r = resolverPeriodoAnterior('30d')
    expect(r).not.toBeNull()
    expect(r!.from.getTime()).toBeLessThan(r!.to.getTime())
  })
})

describe('dashboardBundleResponseSchema', () => {
  it('valida payload mínimo do bundle', () => {
    const payload = {
      period: '30d',
      kpis: kpisMock,
      prev_kpis: null,
      trend: {
        period: '12m',
        granularity: 'month',
        value: [{
          month: '2026-01',
          label: 'jan/26',
          total_pedidos: 1,
          valor_total: 100,
          cobertura_pendente: 0,
          valor_itens_total: 0,
        }],
      },
      cached: false,
      computed_at: new Date().toISOString(),
    }
    expect(() => dashboardBundleResponseSchema.parse(payload)).not.toThrow()
  })
})
