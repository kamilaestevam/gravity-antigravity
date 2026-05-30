import { describe, expect, it } from 'vitest'
import {
  buildSerieTermometro,
  calcularPainelSmartInsights,
  calcularInfograficosFluxoCotacao,
} from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional'
import type { PropostaRankingBidFreteInternacional } from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

function propostaMock(
  total: number,
  id: string,
): PropostaRankingBidFreteInternacional {
  return {
    id_proposta_bid_frete_internacional: id,
    id_cotacao_bid_frete_internacional: 'cot-1',
    id_organizacao: 'org-1',
    moeda_proposta_bid_frete_internacional: 'USD',
    valor_frete_proposta_bid_frete_internacional: total * 0.7,
    taxas_origem_proposta_bid_frete_internacional: total * 0.1,
    taxas_destino_proposta_bid_frete_internacional: total * 0.1,
    valor_total_proposta_bid_frete_internacional: total,
    dias_transito_proposta_bid_frete_internacional: 20,
    dias_free_time_proposta_bid_frete_internacional: 30,
    quantidade_transbordo_proposta_bid_frete_internacional: 0,
    quantidade_escala_proposta_bid_frete_internacional: 0,
    status_proposta_bid_frete_internacional: 'PENDENTE',
    fornecedor_nome: `Fornecedor ${id}`,
  } as PropostaRankingBidFreteInternacional
}

describe('termômetro histórico — mesmas condições', () => {
  it('usa série demonstrativa quando não há histórico aprovado', () => {
    const propostas = [propostaMock(797, 'p1'), propostaMock(920, 'p2')]
    const termometro = buildSerieTermometro(propostas)

    expect(termometro.termometroDadosDemonstracao).toBe(true)
    expect(termometro.termometroMedia6Meses).not.toBeNull()
    expect(termometro.quantidadeHistoricoMesmasCondicoes).toBe(0)
    expect(termometro.serieHistorico6Meses.some((p) => p.valor > 0)).toBe(true)
  })

  it('calcula média e savings a partir de cotações aprovadas no período', () => {
    const propostas = [propostaMock(797, 'p1')]
    const agora = new Date()
    const dataDoisMesesAtras = new Date(agora.getFullYear(), agora.getMonth() - 2, 15).toISOString()

    const historico = [
      {
        id_cotacao_bid_frete_internacional: 'cot-prev-1',
        numero_cotacao_bid_frete_internacional: 'BID-20260330-0001',
        data_aprovacao_cotacao_bid_frete_internacional: dataDoisMesesAtras,
        propostas: [
          {
            valor_total_proposta_bid_frete_internacional: 1000,
            moeda_proposta_bid_frete_internacional: 'USD',
          },
        ],
      },
    ]

    const termometro = buildSerieTermometro(propostas, historico)

    expect(termometro.serieHistorico6Meses).toHaveLength(6)
    expect(termometro.termometroMedia6Meses).toBe(1000)
    expect(termometro.termometroSavingsValor).toBe(203)
    expect(termometro.quantidadeHistoricoMesmasCondicoes).toBe(1)
    expect(termometro.termometroDadosDemonstracao).toBe(false)
  })

  it('calcularPainelSmartInsights expõe dados do termômetro', () => {
    const propostas = [propostaMock(797, 'p1')]
    const info = calcularInfograficosFluxoCotacao([], propostas)
    const smart = calcularPainelSmartInsights([], propostas, info)

    expect(smart.serieHistorico6Meses).toHaveLength(6)
    expect(smart.termometroMoeda).toBe(info.melhorValorMoeda)
  })
})
