import { describe, it, expect } from 'vitest'
import {
  montarAssuntoEmailAceiteRecebidoCompradorBidFreteInternacional,
  montarTextoPlanoEmailAceiteRecebidoCompradorBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/formatar-email-aceite-recebido-comprador-bid-frete-internacional.js'

describe('formatar-email-aceite-recebido-comprador-bid-frete-internacional', () => {
  const params = {
    numeroCotacao: 'COT07001',
    nomeFornecedor: 'DHL Agente',
    nomeComprador: 'Daniel',
    dataAceite: new Date('2026-07-06T15:30:00.000Z'),
    linkComparativo: 'https://app/bid-frete/cotacoes/x/comparativo',
  }

  it('monta assunto com número da cotação', () => {
    expect(montarAssuntoEmailAceiteRecebidoCompradorBidFreteInternacional('COT07001')).toBe(
      'Aceite confirmado — cotação COT07001',
    )
  })

  it('texto plano menciona fornecedor e fechamento', () => {
    const texto = montarTextoPlanoEmailAceiteRecebidoCompradorBidFreteInternacional(params)
    expect(texto).toContain('DHL Agente')
    expect(texto).toContain('COT07001')
    expect(texto).toContain('fechamento')
  })
})
