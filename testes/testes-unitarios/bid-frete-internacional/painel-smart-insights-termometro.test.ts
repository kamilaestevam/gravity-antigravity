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

describe('painel smart insights — termômetro', () => {
  it('gera série de 6 meses com valores numéricos quando há propostas', () => {
    const propostas = [
      propostaMock(797, 'p1'),
      propostaMock(920, 'p2'),
    ]
    const { serieHistorico6Meses, termometroMedia6Meses } = buildSerieTermometro(propostas)

    expect(serieHistorico6Meses).toHaveLength(6)
    expect(termometroMedia6Meses).toBe(859)
    for (const ponto of serieHistorico6Meses) {
      expect(ponto.mes.length).toBeGreaterThan(0)
      expect(Number.isFinite(ponto.valor)).toBe(true)
      expect(ponto.valor).toBeGreaterThan(0)
    }
  })

  it('calcularPainelSmartInsights expõe série para o gráfico', () => {
    const propostas = [propostaMock(797, 'p1'), propostaMock(864, 'p2')]
    const info = calcularInfograficosFluxoCotacao([], propostas)
    const smart = calcularPainelSmartInsights([], propostas, info)

    expect(smart.serieHistorico6Meses.length).toBe(6)
    expect(smart.termometroMedia6Meses).not.toBeNull()
  })

  it('gera série e métricas corretas baseadas no histórico real de cotações aprovadas', () => {
    const propostas = [propostaMock(797, 'p1')]
    const agora = new Date()
    // Data de 2 meses atrás
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
          }
        ]
      }
    ]

    const { serieHistorico6Meses, termometroMedia6Meses, termometroSavingsValor } = buildSerieTermometro(propostas, historico)

    expect(serieHistorico6Meses).toHaveLength(6)
    expect(termometroMedia6Meses).toBe(1000)
    expect(termometroSavingsValor).toBe(203) // 1000 - 797 = 203
    
    // Todos os slots devem ter valor interpolado/propagado igual a 1000
    for (const ponto of serieHistorico6Meses) {
      expect(ponto.valor).toBe(1000)
    }
  })
})
