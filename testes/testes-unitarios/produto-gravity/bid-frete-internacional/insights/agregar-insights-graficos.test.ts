import { describe, expect, it } from 'vitest'
import {
  agregarInsightsGraficosBidFreteInternacional,
  classificarBucketStatusCotacaoInsights,
} from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/agregar-insights-graficos-bid-frete-internacional'

describe('classificarBucketStatusCotacaoInsights', () => {
  it('classifica rascunho como andamento', () => {
    expect(classificarBucketStatusCotacaoInsights('RASCUNHO')).toBe('andamento')
  })

  it('classifica aprovada', () => {
    expect(classificarBucketStatusCotacaoInsights('APROVADA')).toBe('aprovadas')
  })

  it('classifica reprovada como recusadas', () => {
    expect(classificarBucketStatusCotacaoInsights('REPROVADA')).toBe('recusadas')
  })
})

describe('agregarInsightsGraficosBidFreteInternacional', () => {
  const agora = new Date('2026-06-15T12:00:00.000Z')

  it('agrega totais e distribuições do escopo', () => {
    const resultado = agregarInsightsGraficosBidFreteInternacional(
      [
        {
          status_cotacao_bid_frete_internacional: 'RASCUNHO',
          modal_cotacao_bid_frete_internacional: 'MARITIMO',
          incoterm_cotacao_bid_frete_internacional: 'FOB',
          data_criacao_cotacao_bid_frete_internacional: new Date('2026-06-10'),
          data_aprovacao_cotacao_bid_frete_internacional: null,
          numero_cotacao_bid_frete_internacional: 'COT-1',
          origem_nome_cotacao_bid_frete_internacional: 'Shanghai',
          origem_codigo_cotacao_bid_frete_internacional: 'CNSHA',
          destino_nome_cotacao_bid_frete_internacional: 'Santos',
          destino_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
          ganho_valor_cotacao_bid_frete_internacional: null,
          ganho_percentual_cotacao_bid_frete_internacional: null,
          fornecedor_vencedor: null,
          proposta_aprovada: null,
        },
        {
          status_cotacao_bid_frete_internacional: 'APROVADA',
          modal_cotacao_bid_frete_internacional: 'AEREO',
          incoterm_cotacao_bid_frete_internacional: 'CIF',
          data_criacao_cotacao_bid_frete_internacional: new Date('2026-06-12'),
          data_aprovacao_cotacao_bid_frete_internacional: new Date('2026-06-14'),
          numero_cotacao_bid_frete_internacional: 'COT-2',
          origem_nome_cotacao_bid_frete_internacional: 'Miami',
          origem_codigo_cotacao_bid_frete_internacional: 'USMIA',
          destino_nome_cotacao_bid_frete_internacional: 'Guarulhos',
          destino_codigo_cotacao_bid_frete_internacional: 'BRGRU',
          ganho_valor_cotacao_bid_frete_internacional: 1200,
          ganho_percentual_cotacao_bid_frete_internacional: 12.5,
          fornecedor_vencedor: null,
          proposta_aprovada: {
            valor_total_proposta_bid_frete_internacional: 8000,
            dias_transito_proposta_bid_frete_internacional: 5,
            fornecedor: { nome_fornecedor_bid_frete_internacional: 'Carrier X' },
          },
        },
      ],
      agora,
    )

    expect(resultado.total_cotacoes).toBe(2)
    expect(resultado.distribuicao_modal).toHaveLength(2)
    expect(resultado.top_incoterms.map(i => i.incoterm_cotacao_bid_frete_internacional)).toEqual(['FOB', 'CIF'])
    expect(resultado.melhor_cotacao_mes?.numero_cotacao_bid_frete_internacional).toBe('COT-2')
    expect(resultado.melhor_cotacao_mes?.fornecedor).toBe('Carrier X')

    const mesJun = resultado.cotacoes_por_mes.find(m => m.chave_mes.endsWith('-06'))
    expect(mesJun?.andamento).toBe(1)
    expect(mesJun?.aprovadas).toBe(1)
  })
})
