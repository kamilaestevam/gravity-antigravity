import { describe, expect, it } from 'vitest'
import { formatarFeedbackDisparoBidFrete } from '../../../../servicos-global/produto/bid-frete-internacional/shared/formatar-resultado-disparo-bid-frete-internacional.js'
import {
  aguardarConfirmacaoDisparoCotacao,
  montarResumoDisparoFromCotacao,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/aguardar-confirmacao-disparo-bid-frete-internacional.js'
import type { Cotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types.js'

describe('formatarFeedbackDisparoBidFrete', () => {
  it('aguardando não afirma que e-mail foi enviado', () => {
    const feedback = formatarFeedbackDisparoBidFrete(null, { aguardandoConfirmacao: true })
    expect(feedback.tipo).toBe('aguardando')
    expect(feedback.detalhe).toContain('Aguardando confirmação')
    expect(feedback.detalhe).not.toContain('entregue')
  })

  it('nao_confirmado quando ainda há PENDENTE no resumo', () => {
    const feedback = formatarFeedbackDisparoBidFrete({
      disparos: 2,
      enviados_ok: 0,
      erros_envio: 0,
      results: [
        { status_disparo_cotacao_bid_frete_internacional: 'PENDENTE' },
        { status_disparo_cotacao_bid_frete_internacional: 'PENDENTE' },
      ],
    }, { naoConfirmado: true })
    expect(feedback.tipo).toBe('nao_confirmado')
    expect(feedback.titulo).toContain('não confirmado')
  })

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
    expect(feedback.detalhe).toContain('entregue')
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

  it('retorna erro quando todos falharam com ERRO_ENVIO', () => {
    const feedback = formatarFeedbackDisparoBidFrete({
      disparos: 1,
      enviados_ok: 0,
      erros_envio: 1,
      results: [
        {
          nome_fornecedor_bid_frete_internacional: 'DHL',
          status_disparo_cotacao_bid_frete_internacional: 'ERRO_ENVIO',
          erro_envio_disparo_cotacao_bid_frete_internacional: 'RESEND_API_KEY não configurado',
        },
      ],
    })
    expect(feedback.tipo).toBe('erro')
    expect(feedback.detalhe).toContain('RESEND_API_KEY')
  })
})

describe('aguardarConfirmacaoDisparoCotacao', () => {
  const cotacaoBase = {
    id_cotacao_bid_frete_internacional: 'cot-1',
    disparo_cotacao_bid_frete_internacional: [
      {
        id_disparo_cotacao_bid_frete_internacional: 'd1',
        id_fornecedor_bid_frete_internacional: 'f1',
        status_disparo_cotacao_bid_frete_internacional: 'PENDENTE',
        canal_disparo_cotacao_bid_frete_internacional: 'EMAIL',
      },
    ],
  } as unknown as Cotacao

  it('monta resumo a partir dos disparos da cotação', () => {
    const resumo = montarResumoDisparoFromCotacao({
      ...cotacaoBase,
      disparo_cotacao_bid_frete_internacional: [
        {
          ...(cotacaoBase.disparo_cotacao_bid_frete_internacional![0]),
          status_disparo_cotacao_bid_frete_internacional: 'ENVIADO',
          fornecedor: { nome_fornecedor_bid_frete_internacional: 'DHL' },
        },
      ],
    } as Cotacao)
    expect(resumo.enviados_ok).toBe(1)
  })

  it('poll até disparos saírem de PENDENTE', async () => {
    let chamadas = 0
    const resultado = await aguardarConfirmacaoDisparoCotacao(
      'cot-1',
      async () => {
        chamadas += 1
        if (chamadas < 2) return cotacaoBase
        return {
          ...cotacaoBase,
          disparo_cotacao_bid_frete_internacional: [
            {
              ...(cotacaoBase.disparo_cotacao_bid_frete_internacional![0]),
              status_disparo_cotacao_bid_frete_internacional: 'ENVIADO',
            },
          ],
        } as Cotacao
      },
      { intervaloMs: 1, esperaMaximaMs: 50 },
    )
    expect(resultado.confirmado).toBe(true)
    expect(resultado.resumo.enviados_ok).toBe(1)
    expect(chamadas).toBeGreaterThanOrEqual(2)
  })
})
