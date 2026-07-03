import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  extrairMensagemErroDisparo,
  montarAssuntoEmailDisparo,
  montarHtmlEmailDisparo,
  montarLinkRespostaDisparo,
  resolverUrlServicoEmailDisparoBidFrete,
} from '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-bid-disparo-utils'

describe('motor-bid-disparo-utils', () => {
  const envSnapshot = {
    EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL,
    TENANT_EMAIL_SERVICE_URL: process.env.TENANT_EMAIL_SERVICE_URL,
    SERVIDOR_PLATAFORMA_URL: process.env.SERVIDOR_PLATAFORMA_URL,
  }

  beforeEach(() => {
    delete process.env.EMAIL_SERVICE_URL
    delete process.env.TENANT_EMAIL_SERVICE_URL
    delete process.env.SERVIDOR_PLATAFORMA_URL
  })

  afterEach(() => {
    if (envSnapshot.EMAIL_SERVICE_URL === undefined) delete process.env.EMAIL_SERVICE_URL
    else process.env.EMAIL_SERVICE_URL = envSnapshot.EMAIL_SERVICE_URL
    if (envSnapshot.TENANT_EMAIL_SERVICE_URL === undefined) delete process.env.TENANT_EMAIL_SERVICE_URL
    else process.env.TENANT_EMAIL_SERVICE_URL = envSnapshot.TENANT_EMAIL_SERVICE_URL
    if (envSnapshot.SERVIDOR_PLATAFORMA_URL === undefined) delete process.env.SERVIDOR_PLATAFORMA_URL
    else process.env.SERVIDOR_PLATAFORMA_URL = envSnapshot.SERVIDOR_PLATAFORMA_URL
  })

  it('resolve URL do serviço de e-mail — paridade Hub (EMAIL → TENANT → plataforma → :8008)', () => {
    expect(resolverUrlServicoEmailDisparoBidFrete()).toBe('http://127.0.0.1:8008')

    process.env.SERVIDOR_PLATAFORMA_URL = 'http://plataforma.test'
    expect(resolverUrlServicoEmailDisparoBidFrete()).toBe('http://plataforma.test')

    process.env.TENANT_EMAIL_SERVICE_URL = 'http://tenant-email.test'
    expect(resolverUrlServicoEmailDisparoBidFrete()).toBe('http://tenant-email.test')

    process.env.EMAIL_SERVICE_URL = 'http://email.test'
    expect(resolverUrlServicoEmailDisparoBidFrete()).toBe('http://email.test')
  })

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
