// @vitest-environment node
// TST-UNI-PEDIDO-000001 — dashboard-pedido-dados Zod schemas
// Plano: testes/testes-unitarios/pedido/_planos/dashboard-pedido-dados.plan.json
//
// Cobre os 4 schemas Zod que validam as respostas da API de dashboard
// (Mandamentos 06 + 09 — contrato bilateral). Inclui casos de regressão
// para os Mandamentos 03 (DDD) e 06 (sem fallback silencioso).
/// <reference types="vitest/globals" />

import {
  dashboardKpisSchema,
  dashboardTrendResponseSchema,
  dashboardDistributionResponseSchema,
  dashboardInsightsResponseSchema,
} from '../../../../servicos-global/produto/pedido/client/src/shared/dashboard-schemas.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** Payload completo de /kpis exatamente como o backend serializa hoje. */
const kpisValidoCompleto = {
  period: '30d',
  total_pedidos: 3209,
  pedidos_abertos: 805,
  pedidos_em_andamento: 274,
  pedidos_consolidados: 160,
  pedidos_cancelados: 12,
  pedidos_rascunho: 5,
  pedidos_atrasados: 0,
  pedidos_sem_exportador: 7,
  pedidos_importacao: 1500,
  pedidos_exportacao: 1709,
  valor_total: 809094890,
  valor_total_brl: 4_500_000,
  moedas_sem_taxa: [],
  cobertura_pendente: 0,
  qtd_total: 90255,
  ticket_medio: 252_134.12,
  itens_prontos: 12000,
  qtd_inicial_total: 90255,
  qtd_atual_total: 78255,
  qtd_transferida_total: 12000,
  valor_itens_total: 805_000_000,
  taxa_atraso: 0,
  taxa_conclusao_itens: 13.3,
  exposicao_financeira: 0,
  taxa_transferencia: 13.3,
  pedidos_sem_incoterm: 2,
  pedidos_sem_fabricante: 4,
  pedidos_sem_proforma: 1,
  pedidos_sem_invoice: 0,
  pedidos_sem_ref_imp: 3,
  moedas_distintas: 3,
  peso_bruto_total: 250_000,
  cubagem_total: 1234.5,
  itens_sem_cobertura: 8,
  qtd_cancelada_total: 50,
}

const trendValido = {
  period: '12m',
  granularity: 'month',
  value: [
    { month: '2026-01', label: 'jan/26', total_pedidos: 250, valor_total: 1_000_000, cobertura_pendente: 0, valor_itens_total: 950_000 },
    { month: '2026-02', label: 'fev/26', total_pedidos: 312, valor_total: 1_500_000, cobertura_pendente: 0, valor_itens_total: 1_400_000 },
  ],
}

const distribuicaoValida = {
  period: '30d',
  value: [
    { status: 'aberto',       count: 805, valor_total: 200_000_000 },
    { status: 'transferencia',count: 274, valor_total: 150_000_000 },
    { status: 'consolidado',  count: 160, valor_total: 350_000_000 },
    { status: 'cancelado',    count: 12,  valor_total: 5_000_000 },
    { status: 'rascunho',     count: 5,   valor_total: 1_000_000 },
  ],
}

const insightsValido = {
  period: '30d',
  role: 'analyst',
  insights: [
    { id: 'i1', variante: 'default', tag: 'INFO',  texto: 'Carteira do periodo totaliza R$ 4M.' },
    { id: 'i2', variante: 'warn',    tag: 'ALERTA',texto: '5 pedidos em rascunho ainda nao enviados.', stat: { label: 'Em rascunho', valor: '5' } },
    { id: 'i3', variante: 'default', tag: 'TENDENCIA', texto: 'Pedidos cresceram 12% vs periodo anterior.', textoLink: 'Ver detalhes', rota: '/pedidos/lista' },
  ],
}

// ─── Categoria: HAPPY ─────────────────────────────────────────────────────────

describe('TST-UNI-PEDIDO-000001 — happy path', () => {
  it('001 — dashboardKpisSchema aceita payload completo do backend (35 campos DDD)', () => {
    expect(() => dashboardKpisSchema.parse(kpisValidoCompleto)).not.toThrow()
    const parsed = dashboardKpisSchema.parse(kpisValidoCompleto)
    expect(parsed.pedidos_abertos).toBe(805)
    expect(parsed.pedidos_rascunho).toBe(5)
    expect(parsed.valor_total_brl).toBe(4_500_000)
  })

  it('002 — dashboardTrendResponseSchema aceita resposta com 2 buckets mensais', () => {
    const parsed = dashboardTrendResponseSchema.parse(trendValido)
    expect(parsed.value).toHaveLength(2)
    expect(parsed.granularity).toBe('month')
    expect(parsed.value[0]?.month).toBe('2026-01')
  })

  it('003 — dashboardDistributionResponseSchema aceita resposta com 5 grupos de status', () => {
    const parsed = dashboardDistributionResponseSchema.parse(distribuicaoValida)
    expect(parsed.value).toHaveLength(5)
    expect(parsed.value.find(g => g.status === 'aberto')?.count).toBe(805)
  })

  it('004 — dashboardInsightsResponseSchema aceita 3 insights com variantes default e warn', () => {
    const parsed = dashboardInsightsResponseSchema.parse(insightsValido)
    expect(parsed.insights).toHaveLength(3)
    expect(parsed.insights[1]?.variante).toBe('warn')
    expect(parsed.insights[1]?.stat?.valor).toBe('5')
  })
})

// ─── Categoria: SAD ───────────────────────────────────────────────────────────

describe('TST-UNI-PEDIDO-000001 — sad path', () => {
  it('005 — dashboardKpisSchema rejeita quando total_pedidos ausente', () => {
    const payload = { ...kpisValidoCompleto } as Record<string, unknown>
    delete payload.total_pedidos
    const result = dashboardKpisSchema.safeParse(payload)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('total_pedidos'))).toBe(true)
    }
  })

  it('006 — dashboardKpisSchema rejeita valor_total_brl como string', () => {
    const payload = { ...kpisValidoCompleto, valor_total_brl: '4500000' }
    const result = dashboardKpisSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it('007 — dashboardTrendResponseSchema rejeita value como objeto (deve ser array)', () => {
    const payload = { ...trendValido, value: { foo: 'bar' } }
    const result = dashboardTrendResponseSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it('008 — dashboardInsightsResponseSchema rejeita variante fora do enum', () => {
    const payload = {
      ...insightsValido,
      insights: [{ ...insightsValido.insights[0], variante: 'success' }],
    }
    const result = dashboardInsightsResponseSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it('009 — dashboardDistributionResponseSchema rejeita count como string', () => {
    const payload = {
      ...distribuicaoValida,
      value: [{ status: 'aberto', count: '805', valor_total: 0 }],
    }
    const result = dashboardDistributionResponseSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })
})

// ─── Categoria: EDGE ──────────────────────────────────────────────────────────

describe('TST-UNI-PEDIDO-000001 — edge cases', () => {
  it('010 — dashboardKpisSchema aceita campos extras via passthrough (métricas derivadas futuras)', () => {
    const payload = {
      ...kpisValidoCompleto,
      taxa_aprovacao_futura: 99.5,
      campo_inventado: 'qualquer-coisa',
    }
    expect(() => dashboardKpisSchema.parse(payload)).not.toThrow()
    const parsed = dashboardKpisSchema.parse(payload) as Record<string, unknown>
    expect(parsed.taxa_aprovacao_futura).toBe(99.5)
  })

  it('011 — dashboardTrendResponseSchema aceita value: [] (período sem dados)', () => {
    const payload = { period: '30d', granularity: 'month', value: [] }
    expect(() => dashboardTrendResponseSchema.parse(payload)).not.toThrow()
  })

  it('012 — dashboardInsightsResponseSchema aceita campos opcionais ausentes (stat, textoLink, rota)', () => {
    const payload = {
      period: '30d',
      role: 'analyst',
      insights: [{ id: 'i', variante: 'default', tag: 'X', texto: 'Y' }],
    }
    expect(() => dashboardInsightsResponseSchema.parse(payload)).not.toThrow()
  })
})

// ─── Categoria: REGRESSION_DDD (Mandamentos 03 / 06 / 09) ─────────────────────

describe('TST-UNI-PEDIDO-000001 — regressões DDD/Mandamentos', () => {
  it('013 — REGRESSÃO Mandamento 03: backend que devolva campo legado "status" + falte "pedidos_rascunho" deve falhar (forçar uso de status_pedido já agregado)', () => {
    // Simula bug do schema drift: backend devolve "status" cru + sem agregar "pedidos_rascunho"
    const payload = { ...kpisValidoCompleto, status: 'aberto' } as Record<string, unknown>
    delete payload.pedidos_rascunho
    const result = dashboardKpisSchema.safeParse(payload)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('pedidos_rascunho'))).toBe(true)
    }
  })

  it('014 — REGRESSÃO Mandamento 03: backend que devolve "pedidos_draft" (legado) sem "pedidos_rascunho" (DDD) é rejeitado', () => {
    const payload = { ...kpisValidoCompleto, pedidos_draft: 5 } as Record<string, unknown>
    delete payload.pedidos_rascunho
    const result = dashboardKpisSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it('015 — REGRESSÃO Mandamento 09: schema falha alto se backend remover valor_total_brl (sem fallback silencioso)', () => {
    const payload = { ...kpisValidoCompleto } as Record<string, unknown>
    delete payload.valor_total_brl
    const result = dashboardKpisSchema.safeParse(payload)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('valor_total_brl'))).toBe(true)
    }
  })

  it('016 — REGRESSÃO Mandamento 06: schema rejeita parse de null/undefined (toda resposta tem que ser objeto)', () => {
    expect(dashboardKpisSchema.safeParse(null).success).toBe(false)
    expect(dashboardKpisSchema.safeParse(undefined).success).toBe(false)
    expect(dashboardTrendResponseSchema.safeParse(null).success).toBe(false)
    expect(dashboardDistributionResponseSchema.safeParse(null).success).toBe(false)
    expect(dashboardInsightsResponseSchema.safeParse(null).success).toBe(false)
  })
})
