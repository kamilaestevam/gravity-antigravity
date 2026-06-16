import { describe, expect, it } from 'vitest'
import { formatarFeedbackDisparoBidFrete } from '../../../servicos-global/produto/bid-frete-internacional/shared/formatar-resultado-disparo-bid-frete-internacional.js'

describe('formatarFeedbackDisparoBidFrete', () => {
  it('retorna sucesso quando todos os disparos foram entregues', () => {
    const feedback = formatarFeedbackDisparoBidFrete({
      disparos: 2,
      enviados: true,
      enviados_ok: 2,
      erros_envio: 0,
      results: [
        {
          nome_fornecedor_bid_frete_internacional: 'DHL',
          status_disparo_cotacao_bid_frete_internacional: 'ENVIADO',
        },
        {
          nome_fornecedor_bid_frete_internacional: 'KN',
          status_disparo_cotacao_bid_frete_internacional: 'ENVIADO',
        },
      ],
    })
    expect(feedback.tipo).toBe('sucesso')
  })

  it('retorna parcial quando há enviados e erros', () => {
    const feedback = formatarFeedbackDisparoBidFrete({
      disparos: 2,
      enviados: true,
      enviados_ok: 1,
      erros_envio: 1,
      results: [
        {
          nome_fornecedor_bid_frete_internacional: 'DHL',
          status_disparo_cotacao_bid_frete_internacional: 'ENVIADO',
        },
        {
          nome_fornecedor_bid_frete_internacional: 'Asia',
          status_disparo_cotacao_bid_frete_internacional: 'ERRO_ENVIO',
          erro_envio_disparo_cotacao_bid_frete_internacional: 'sem e-mail',
        },
      ],
    })
    expect(feedback.tipo).toBe('parcial')
    expect(feedback.detalhe).toContain('Asia')
  })
})
