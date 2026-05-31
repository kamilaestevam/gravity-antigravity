import { describe, expect, it } from 'vitest'
import { calcularEixosColocacaoCombate } from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/grade-colocacao-eixos-combate-bid-frete-internacional'
import type { PropostaRankingBidFreteInternacional } from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

const t = ((_key: string, defaultValue?: string, opts?: Record<string, unknown>) => {
  if (opts == null) return defaultValue ?? ''
  return (defaultValue ?? '').replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(opts[k] ?? ''))
}) as never

function proposta(
  partial: Partial<PropostaRankingBidFreteInternacional> & Pick<PropostaRankingBidFreteInternacional, 'id_proposta_bid_frete_internacional'>,
): PropostaRankingBidFreteInternacional {
  return {
    id_cotacao_bid_frete_internacional: 'cot-1',
    id_organizacao: 'org-1',
    moeda_proposta_bid_frete_internacional: 'EUR',
    valor_frete_proposta_bid_frete_internacional: 100,
    taxas_origem_proposta_bid_frete_internacional: 10,
    taxas_destino_proposta_bid_frete_internacional: 10,
    valor_total_proposta_bid_frete_internacional: 120,
    dias_transito_proposta_bid_frete_internacional: 10,
    dias_free_time_proposta_bid_frete_internacional: 5,
    quantidade_transbordo_proposta_bid_frete_internacional: 0,
    quantidade_escala_proposta_bid_frete_internacional: 0,
    validade_proposta_bid_frete_internacional: '2026-06-01',
    status_proposta_bid_frete_internacional: 'ENVIADA',
    ...partial,
  } as PropostaRankingBidFreteInternacional
}

describe('calcularEixosColocacaoCombate', () => {
  const propostas = [
    proposta({
      id_proposta_bid_frete_internacional: 'p1',
      fornecedor_nome: 'TRANSCAPRI',
      valor_total_proposta_bid_frete_internacional: 120,
      dias_transito_proposta_bid_frete_internacional: 10,
      dias_prazo_pagamento_proposta_bid_frete_internacional: 30,
    }),
    proposta({
      id_proposta_bid_frete_internacional: 'p2',
      fornecedor_nome: 'OUTRO',
      valor_total_proposta_bid_frete_internacional: 150,
      dias_transito_proposta_bid_frete_internacional: 15,
      quantidade_escala_proposta_bid_frete_internacional: 2,
      dias_prazo_pagamento_proposta_bid_frete_internacional: 15,
    }),
  ]

  it('líder em frete e trânsito exibe Melhor nos eixos correspondentes', () => {
    const eixos = calcularEixosColocacaoCombate(propostas[0], propostas, t)
    const frete = eixos.find((e) => e.id === 'frete_total')
    const transit = eixos.find((e) => e.id === 'transit_time')
    expect(frete?.rank).toBe(1)
    expect(transit?.rank).toBe(1)
  })

  it('rota direta ranqueia melhor que múltiplas escalas', () => {
    const eixos = calcularEixosColocacaoCombate(propostas[0], propostas, t)
    const rota = eixos.find((e) => e.id === 'rota')
    expect(rota?.rank).toBe(1)
    expect(rota?.valorExibicao).toBe('Direto')
  })

  it('prazo maior ranqueia 1º (melhor para comprador)', () => {
    const eixos = calcularEixosColocacaoCombate(propostas[0], propostas, t)
    const prazo = eixos.find((e) => e.id === 'prazo_pagamento')
    expect(prazo?.rank).toBe(1)
    expect(prazo?.disponivel).toBe(true)
  })
})
