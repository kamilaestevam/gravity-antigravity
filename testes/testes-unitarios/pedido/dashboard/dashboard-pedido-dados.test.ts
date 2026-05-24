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

import {
  aggregateKpis,
  aggregateDistribution,
} from '../../../../servicos-global/produto/pedido/server/src/routes/dashboard-pedido-dados.js'

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

// ─── Categoria: AGGREGATION_LOGIC (funções puras extraídas dos handlers) ──────

describe('TST-UNI-PEDIDO-000001 — aggregateKpis (pure function)', () => {
  it('017 — count de pedidos_abertos via status_pedido === aberto (Mand. 03)', () => {
    const pedidos = [
      { status_pedido: 'aberto', valor_total_pedido: 100, moeda_pedido: 'BRL' },
      { status_pedido: 'aberto', valor_total_pedido: 200, moeda_pedido: 'BRL' },
      { status_pedido: 'consolidado', valor_total_pedido: 50, moeda_pedido: 'BRL' },
      { status_pedido: 'rascunho', valor_total_pedido: 10, moeda_pedido: 'BRL' },
    ]
    const result = aggregateKpis(pedidos, [], { BRL: 1 }, '30d')
    expect(result.total_pedidos).toBe(4)
    expect(result.pedidos_abertos).toBe(2)
    expect(result.pedidos_consolidados).toBe(1)
    expect(result.pedidos_rascunho).toBe(1)
    expect(result.pedidos_em_andamento).toBe(0)
  })

  it('018 — valor_total_brl converte cada pedido pela taxa PTAX correspondente à moeda', () => {
    const pedidos = [
      { status_pedido: 'aberto', valor_total_pedido: 100, moeda_pedido: 'USD' },
      { status_pedido: 'aberto', valor_total_pedido: 100, moeda_pedido: 'BRL' },
      { status_pedido: 'aberto', valor_total_pedido: 100, moeda_pedido: 'EUR' },
    ]
    const taxas = { USD: 5.0, BRL: 1, EUR: 5.5 }
    const result = aggregateKpis(pedidos, [], taxas, '30d')
    // 100*5 + 100*1 + 100*5.5 = 500 + 100 + 550 = 1150
    expect(result.valor_total_brl).toBe(1150)
    expect(result.valor_total).toBe(300) // soma bruta sem conversão (também retornada)
    expect(result.moedas_sem_taxa).toEqual([])
  })

  it('019 — moedas sem taxa caem em moedas_sem_taxa e somam sem conversão', () => {
    const pedidos = [
      { status_pedido: 'aberto', valor_total_pedido: 100, moeda_pedido: 'USD' },
      { status_pedido: 'aberto', valor_total_pedido: 50,  moeda_pedido: 'XYZ' },
    ]
    const result = aggregateKpis(pedidos, [], { USD: 5 }, '30d')
    // 100*5 + 50 (sem conversão) = 550
    expect(result.valor_total_brl).toBe(550)
    expect(result.moedas_sem_taxa).toContain('XYZ')
  })

  it('020 — pedidos_sem_exportador conta id_importacao_exportador_pedido falsy (Mand. 03)', () => {
    const pedidos = [
      { status_pedido: 'aberto', id_importacao_exportador_pedido: null,        moeda_pedido: 'BRL' },
      { status_pedido: 'aberto', id_importacao_exportador_pedido: undefined,   moeda_pedido: 'BRL' },
      { status_pedido: 'aberto', id_importacao_exportador_pedido: 'exp_xyz',   moeda_pedido: 'BRL' },
    ]
    const result = aggregateKpis(pedidos, [], { BRL: 1 }, '30d')
    expect(result.pedidos_sem_exportador).toBe(2)
  })

  it('021 — ticket_medio = valor_total / total_pedidos; zero quando total = 0', () => {
    const r1 = aggregateKpis([], [], {}, '30d')
    expect(r1.ticket_medio).toBe(0)
    expect(r1.total_pedidos).toBe(0)

    const r2 = aggregateKpis(
      [
        { status_pedido: 'aberto', valor_total_pedido: 100, moeda_pedido: 'BRL' },
        { status_pedido: 'aberto', valor_total_pedido: 300, moeda_pedido: 'BRL' },
      ],
      [], { BRL: 1 }, '30d',
    )
    expect(r2.ticket_medio).toBe(200)
  })

  it('022 — taxa_conclusao_itens = (itens_prontos / qtd_inicial_total) * 100', () => {
    const itens = [
      { quantidade_inicial_item: 100, quantidade_pronta_item: 25 },
      { quantidade_inicial_item: 100, quantidade_pronta_item: 75 },
    ]
    const result = aggregateKpis([], itens, {}, '30d')
    // 100 prontos de 200 inicial = 50%
    expect(result.taxa_conclusao_itens).toBe(50)
  })

  it('023 — REGRESSÃO Mand. 03: backend que use status (legado) não casa nenhum filter de status_pedido', () => {
    const pedidos = [
      { status: 'aberto', valor_total_pedido: 100, moeda_pedido: 'BRL' }, // campo legado
    ]
    const result = aggregateKpis(pedidos, [], { BRL: 1 }, '30d')
    expect(result.pedidos_abertos).toBe(0) // não conta — status_pedido é undefined
    expect(result.total_pedidos).toBe(1)   // ainda conta no total
  })

  it('027 — pedidos_em_andamento inclui transferencia e em_andamento', () => {
    const pedidos = [
      { status_pedido: 'transferencia', valor_total_pedido: 0, moeda_pedido: 'BRL' },
      { status_pedido: 'em_andamento', valor_total_pedido: 0, moeda_pedido: 'BRL' },
      { status_pedido: 'aberto', valor_total_pedido: 0, moeda_pedido: 'BRL' },
    ]
    const result = aggregateKpis(pedidos, [], { BRL: 1 }, '30d')
    expect(result.pedidos_em_andamento).toBe(2)
  })

  it('028 — pedidos_atrasados exclui consolidado com marco vencido', () => {
    const pedidos = [
      {
        status_pedido: 'aberto',
        valor_total_pedido: 0,
        moeda_pedido: 'BRL',
        data_prevista_pedido_pronto: '2026-01-01',
        data_confirmada_pedido_pronto: null,
      },
      {
        status_pedido: 'consolidado',
        valor_total_pedido: 0,
        moeda_pedido: 'BRL',
        data_prevista_pedido_pronto: '2026-01-01',
        data_confirmada_pedido_pronto: null,
      },
    ]
    const result = aggregateKpis(pedidos, [], { BRL: 1 }, '30d')
    expect(result.pedidos_atrasados).toBe(1)
  })

  it('029 — cobertura_pendente soma valor de pedidos com itens sem_cobertura', () => {
    const pedidos = [
      { id_pedido: 'p1', status_pedido: 'aberto', valor_total_pedido: 1000, moeda_pedido: 'BRL' },
      { id_pedido: 'p2', status_pedido: 'aberto', valor_total_pedido: 2000, moeda_pedido: 'BRL' },
    ]
    const itens = [
      { id_pedido: 'p1', cobertura_cambial_item: 'sem_cobertura' },
      { id_pedido: 'p2', cobertura_cambial_item: 'com_cobertura' },
    ]
    const result = aggregateKpis(pedidos, itens, { BRL: 1 }, '30d')
    expect(result.cobertura_pendente).toBe(1000)
  })
})

describe('TST-UNI-PEDIDO-000001 — aggregateDistribution (pure function)', () => {
  it('024 — agrupa pedidos por status_pedido somando valor_total_pedido', () => {
    const pedidos = [
      { status_pedido: 'aberto',       valor_total_pedido: 100 },
      { status_pedido: 'aberto',       valor_total_pedido: 200 },
      { status_pedido: 'consolidado',  valor_total_pedido: 500 },
    ]
    const result = aggregateDistribution(pedidos, '30d')
    expect(result.period).toBe('30d')
    expect(result.value).toHaveLength(2)
    const aberto = result.value.find(g => g.status === 'aberto')
    expect(aberto?.count).toBe(2)
    expect(aberto?.valor_total).toBe(300)
    const consolidado = result.value.find(g => g.status === 'consolidado')
    expect(consolidado?.count).toBe(1)
    expect(consolidado?.valor_total).toBe(500)
  })

  it('025 — payload de aggregateDistribution passa pelo dashboardDistributionResponseSchema (round-trip)', () => {
    const pedidos = [
      { status_pedido: 'aberto', valor_total_pedido: 100 },
    ]
    const result = aggregateDistribution(pedidos, '30d')
    expect(() => dashboardDistributionResponseSchema.parse(result)).not.toThrow()
  })

  it('026 — payload de aggregateKpis passa pelo dashboardKpisSchema (round-trip)', () => {
    const result = aggregateKpis([], [], {}, '30d')
    expect(() => dashboardKpisSchema.parse(result)).not.toThrow()
  })
})
