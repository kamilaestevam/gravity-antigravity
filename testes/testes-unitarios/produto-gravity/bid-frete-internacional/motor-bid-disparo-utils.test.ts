import { describe, it, expect } from 'vitest'
import {
  extrairMensagemErroDisparo,
  montarAssuntoEmailDisparo,
  montarHtmlEmailDisparo,
  montarLinkRespostaDisparo,
} from '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-bid-disparo-utils'

describe('motor-bid-disparo-utils', () => {
  it('monta link público na rota da visão fornecedor', () => {
    const link = montarLinkRespostaDisparo('http://localhost:8000', 'token-abc')
    expect(link).toBe('http://localhost:8000/bid-frete/visao-fornecedor-bid-frete-internacional/publico/token-abc')
  })

  it('monta assunto com número da cotação', () => {
    expect(montarAssuntoEmailDisparo('BID-20260528-0594')).toContain('BID-20260528-0594')
  })

  it('extrai mensagem ECONNREFUSED do serviço de e-mail', () => {
    const err = Object.assign(new Error('connect ECONNREFUSED'), {
      isAxiosError: true,
      code: 'ECONNREFUSED',
      response: undefined,
    })
    expect(extrairMensagemErroDisparo(err, 'http://localhost:8008')).toContain('ECONNREFUSED')
    expect(extrairMensagemErroDisparo(err, 'http://localhost:8008')).toContain('8008')
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
      linkResposta: 'http://localhost:8000/bid-frete/visao-fornecedor-bid-frete-internacional/publico/tok',
    })
    expect(html).toContain('Maersk')
    expect(html).toContain('BID-001')
    expect(html).toContain('http://localhost:8000/bid-frete/visao-fornecedor-bid-frete-internacional/publico/tok')
  })
})
