import { describe, expect, it } from 'vitest'
import {
  montarWhereKpiInsightsAguardandoAprovacaoBidFreteInternacional,
  montarWhereKpiInsightsAguardandoRespostaBidFreteInternacional,
} from '../../../../../servicos-global/produto/bid-frete-internacional/shared/where-kpi-insights-operacionais-bid-frete-internacional'

describe('montarWhereKpiInsightsAguardandoAprovacaoBidFreteInternacional', () => {
  it('inclui AGUARDANDO_APROVACAO e cotações com proposta fora de terminal', () => {
    const where = montarWhereKpiInsightsAguardandoAprovacaoBidFreteInternacional({
      id_workspace: 'ws-1',
    })
    expect(where.id_workspace).toBe('ws-1')
    expect(where.OR).toEqual([
      { status_cotacao_bid_frete_internacional: 'AGUARDANDO_APROVACAO' },
      {
        status_cotacao_bid_frete_internacional: {
          notIn: ['APROVADA', 'REPROVADA', 'CANCELADA', 'EXPIRADA', 'RASCUNHO'],
        },
        propostas: { some: {} },
      },
    ])
  })
})

describe('montarWhereKpiInsightsAguardandoRespostaBidFreteInternacional', () => {
  it('inclui pipeline sem proposta e rascunho com disparo enviado', () => {
    const where = montarWhereKpiInsightsAguardandoRespostaBidFreteInternacional({})
    expect(where.OR).toHaveLength(2)
    expect(where.OR?.[0]).toMatchObject({
      status_cotacao_bid_frete_internacional: {
        in: ['ENVIADA_FORNECEDORES', 'EM_COTACAO', 'FALTA_INFORMACAO'],
      },
      propostas: { none: {} },
    })
    expect(where.OR?.[1]).toMatchObject({
      status_cotacao_bid_frete_internacional: 'RASCUNHO',
      propostas: { none: {} },
    })
  })
})
