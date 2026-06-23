import { describe, it, expect } from 'vitest'
import {
  criarLinhaPeriodoArmazenagemVazia,
  linhasPeriodoArmazenagemParaPayload,
  parsePeriodosArmazenagemPropostaFromServer,
  periodosArmazenagemExibicaoFromProposta,
  periodosArmazenagemFormularioValidos,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/periodos-armazenagem-proposta-bid-frete-internacional'

describe('periodos-armazenagem-proposta-bid-frete-internacional', () => {
  it('aceita minimo vazio (opcional)', () => {
    const linhas = [{
      ...criarLinhaPeriodoArmazenagemVazia(),
      dias_periodo_armazenagem: '5',
      tipo_tarifa_periodo_armazenagem: 'REAIS' as const,
      valor_tarifa_periodo_armazenagem: '5',
      minimo_reais_periodo_armazenagem: '',
    }]
    expect(periodosArmazenagemFormularioValidos(linhas)).toBe(true)
  })

  it('envia minimo 0 no payload quando vazio', () => {
    const linhas = [{
      ...criarLinhaPeriodoArmazenagemVazia(),
      dias_periodo_armazenagem: '10',
      tipo_tarifa_periodo_armazenagem: 'PERCENTUAL_MERCADORIA' as const,
      valor_tarifa_periodo_armazenagem: '2.02',
      minimo_reais_periodo_armazenagem: '',
    }]
    const payload = linhasPeriodoArmazenagemParaPayload(linhas)
    expect(payload[0].minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional).toBe(0)
  })

  it('rejeita periodo sem dias ou valor', () => {
    const linhas = [{
      ...criarLinhaPeriodoArmazenagemVazia(),
      tipo_tarifa_periodo_armazenagem: 'REAIS' as const,
      valor_tarifa_periodo_armazenagem: '100',
    }]
    expect(periodosArmazenagemFormularioValidos(linhas)).toBe(false)
  })

  it('parsePeriodosArmazenagemPropostaFromServer valida array JSON', () => {
    const parsed = parsePeriodosArmazenagemPropostaFromServer([{
      ordem_periodo_armazenagem_proposta_bid_frete_internacional: 1,
      dias_periodo_armazenagem_proposta_bid_frete_internacional: 7,
      tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: 'REAIS',
      valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: 150,
      minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional: 0,
    }])
    expect(parsed).toHaveLength(1)
    expect(parsed?.[0].dias_periodo_armazenagem_proposta_bid_frete_internacional).toBe(7)
  })

  it('periodosArmazenagemExibicaoFromProposta usa legado quando JSON ausente', () => {
    const periodos = periodosArmazenagemExibicaoFromProposta({
      dias_periodo_armazenagem_proposta_bid_frete_internacional: 5,
      valor_armazenagem_reais_proposta_bid_frete_internacional: 80,
    })
    expect(periodos).toHaveLength(1)
    expect(periodos[0].tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional).toBe('REAIS')
  })
})
