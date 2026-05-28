import { describe, it, expect } from 'vitest'
import {
  montarAssuntoEmailDisparo,
  montarHtmlEmailDisparo,
  montarLinkRespostaDisparo,
} from '../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-bid-disparo-utils'

describe('motor-bid-disparo-utils', () => {
  it('monta link público na rota correta do portal', () => {
    const link = montarLinkRespostaDisparo('http://localhost:8000', 'token-abc')
    expect(link).toBe('http://localhost:8000/bid-frete/portal/public/responder/token-abc')
  })

  it('monta assunto com número da cotação', () => {
    expect(montarAssuntoEmailDisparo('BID-20260528-0594')).toContain('BID-20260528-0594')
  })

  it('monta HTML com link de resposta', () => {
    const html = montarHtmlEmailDisparo({
      nomeFornecedor: 'Maersk',
      numeroCotacao: 'BID-001',
      modal: 'MARITIMO',
      origemNome: 'Santos',
      origemPais: 'BR',
      destinoNome: 'Shanghai',
      destinoPais: 'CN',
      mercadoria: 'Peças',
      incoterm: 'FOB',
      linkResposta: 'http://localhost:8000/bid-frete/portal/public/responder/tok',
    })
    expect(html).toContain('Maersk')
    expect(html).toContain('BID-001')
    expect(html).toContain('http://localhost:8000/bid-frete/portal/public/responder/tok')
  })
})
