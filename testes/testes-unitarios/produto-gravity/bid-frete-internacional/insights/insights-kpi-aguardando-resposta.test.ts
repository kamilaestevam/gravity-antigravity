import { describe, expect, it } from 'vitest'
import {
  formatarDataEnvioTooltipAguardandoRespostaInsights,
  formatarLinhaDataTempoTooltipKpiInsights,
  formatarTempoAguardandoRespostaInsights,
  ordenarCotacoesAguardandoRespostaInsights,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/insights-kpi-aguardando-resposta-bid-frete-internacional'
import type { CotacaoInsightsDetalheCliente } from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/insights-detalhe-bid-frete-internacional'

function cotacaoMinima(
  partial: Partial<CotacaoInsightsDetalheCliente> & Pick<CotacaoInsightsDetalheCliente, 'id_cotacao_bid_frete_internacional' | 'numero_cotacao_bid_frete_internacional'>,
): CotacaoInsightsDetalheCliente {
  return {
    status_cotacao_bid_frete_internacional: 'ENVIADA_FORNECEDORES',
    origem_nome_cotacao_bid_frete_internacional: 'Shanghai',
    origem_codigo_cotacao_bid_frete_internacional: 'CNSHA',
    destino_nome_cotacao_bid_frete_internacional: 'Santos',
    destino_codigo_cotacao_bid_frete_internacional: 'BRSSZ',
    descricao_mercadoria_cotacao_bid_frete_internacional: 'Peças',
    ncm_cotacao_bid_frete_internacional: null,
    quantidade_volume_cotacao_bid_frete_internacional: 1,
    peso_kg_cotacao_bid_frete_internacional: null,
    cubagem_m3_cotacao_bid_frete_internacional: null,
    incoterm_cotacao_bid_frete_internacional: 'FOB',
    modal_cotacao_bid_frete_internacional: 'MARITIMO',
    modalidade_cotacao_bid_frete_internacional: 'FCL',
    valor_meta_cotacao_bid_frete_internacional: null,
    moeda_meta_cotacao_bid_frete_internacional: null,
    data_criacao_cotacao_bid_frete_internacional: '2026-06-01T10:00:00.000Z',
    data_limite_resposta_cotacao_bid_frete_internacional: null,
    data_aprovacao_cotacao_bid_frete_internacional: null,
    data_envio_disparo_cotacao_bid_frete_internacional: null,
    data_primeira_resposta_cotacao_bid_frete_internacional: null,
    propostas: [],
    historico: [],
    ...partial,
  }
}

describe('formatarTempoAguardandoRespostaInsights', () => {
  it('formata minutos, horas e dias', () => {
    const agora = new Date('2026-06-10T12:00:00Z').getTime()
    expect(formatarTempoAguardandoRespostaInsights('2026-06-10T11:30:00Z', agora)).toBe('30 min')
    expect(formatarTempoAguardandoRespostaInsights('2026-06-09T12:00:00Z', agora)).toBe('1 d')
    expect(formatarTempoAguardandoRespostaInsights(null, agora)).toBe('—')
  })
})

describe('ordenarCotacoesAguardandoRespostaInsights', () => {
  it('coloca a cotação com envio mais antigo primeiro', () => {
    const ordenadas = ordenarCotacoesAguardandoRespostaInsights([
      cotacaoMinima({
        id_cotacao_bid_frete_internacional: 'c2',
        numero_cotacao_bid_frete_internacional: 'COT-002',
        data_envio_disparo_cotacao_bid_frete_internacional: '2026-06-05T10:00:00.000Z',
      }),
      cotacaoMinima({
        id_cotacao_bid_frete_internacional: 'c1',
        numero_cotacao_bid_frete_internacional: 'COT-001',
        data_envio_disparo_cotacao_bid_frete_internacional: '2026-06-01T10:00:00.000Z',
      }),
    ])
    expect(ordenadas.map(c => c.numero_cotacao_bid_frete_internacional)).toEqual(['COT-001', 'COT-002'])
  })
})

describe('formatarDataEnvioTooltipAguardandoRespostaInsights', () => {
  it('formata data compacta dd/mm/aa', () => {
    const texto = formatarDataEnvioTooltipAguardandoRespostaInsights('2026-06-01T10:00:00.000Z')
    expect(texto).toMatch(/01\/06\/26/)
  })
})

describe('formatarLinhaDataTempoTooltipKpiInsights', () => {
  it('combina data compacta e tempo decorrido', () => {
    const agora = new Date('2026-06-10T12:00:00Z').getTime()
    expect(formatarLinhaDataTempoTooltipKpiInsights('2026-06-09T12:00:00Z', agora)).toBe('09/06/26 · 1 d')
  })
})
