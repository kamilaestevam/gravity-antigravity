import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  extrairMensagemErroDisparo,
  montarAssuntoEmailDisparo,
  montarHtmlEmailDisparo,
  montarLinkRespostaDisparo,
  montarTextoPlanoEmailDisparo,
  resolverUrlServicoEmailDisparoBidFrete,
} from '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/motor-bid-disparo-utils'
import {
  formatarModalExibicaoEmailDisparoBidFrete,
  rotuloCampoVolumeEmailDisparoBidFrete,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/formatar-email-disparo-bid-frete-internacional'

const PARAMETROS_BASE = {
  nomeFornecedor: 'Maersk',
  numeroCotacao: 'BID-001',
  modal: 'MARITIMO',
  modalidade: 'FCL',
  origemNome: 'Santos',
  origemPais: 'BR',
  destinoNome: 'Shanghai',
  destinoPais: 'CN',
  mercadoria: 'Peças',
  incoterm: 'FOB',
  tipoContainer: "20' DRY",
  quantidade: 2,
  pesoKg: 1200,
  dataExpiracaoToken: '2026-07-10T12:00:00.000Z',
  nomeClienteOperacao: 'Acme Import',
  linkResposta: 'http://localhost:8000/bid-frete/visao-fornecedor-bid-frete-internacional/publico/tok',
} as const

describe('motor-bid-disparo-utils', () => {
  const envSnapshot = {
    EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL,
    TENANT_EMAIL_SERVICE_URL: process.env.TENANT_EMAIL_SERVICE_URL,
  }

  beforeEach(() => {
    delete process.env.EMAIL_SERVICE_URL
    delete process.env.TENANT_EMAIL_SERVICE_URL
  })

  afterEach(() => {
    if (envSnapshot.EMAIL_SERVICE_URL === undefined) delete process.env.EMAIL_SERVICE_URL
    else process.env.EMAIL_SERVICE_URL = envSnapshot.EMAIL_SERVICE_URL
    if (envSnapshot.TENANT_EMAIL_SERVICE_URL === undefined) delete process.env.TENANT_EMAIL_SERVICE_URL
    else process.env.TENANT_EMAIL_SERVICE_URL = envSnapshot.TENANT_EMAIL_SERVICE_URL
  })

  it('resolve URL do serviço de e-mail — TENANT_EMAIL → EMAIL → :8008', () => {
    expect(resolverUrlServicoEmailDisparoBidFrete()).toBe('http://127.0.0.1:8008')

    process.env.EMAIL_SERVICE_URL = 'http://localhost:3001'
    expect(resolverUrlServicoEmailDisparoBidFrete()).toBe('http://localhost:3001')

    process.env.TENANT_EMAIL_SERVICE_URL = 'http://127.0.0.1:8008'
    expect(resolverUrlServicoEmailDisparoBidFrete()).toBe('http://127.0.0.1:8008')

    delete process.env.TENANT_EMAIL_SERVICE_URL
    process.env.EMAIL_SERVICE_URL = 'http://email.test'
    expect(resolverUrlServicoEmailDisparoBidFrete()).toBe('http://email.test')
  })

  it('monta link público na rota da visão fornecedor', () => {
    const link = montarLinkRespostaDisparo('http://localhost:8000', 'token-abc')
    expect(link).toBe('http://localhost:8000/bid-frete/visao-fornecedor-bid-frete-internacional/publico/token-abc')
  })

  it('monta assunto com rota e modal traduzidos', () => {
    const assunto = montarAssuntoEmailDisparo({ ...PARAMETROS_BASE })
    expect(assunto).toContain('BID-001')
    expect(assunto).toContain('Santos (BR) → Shanghai (CN)')
    expect(assunto).toContain('Marítimo · FCL')
  })

  it('monta assunto legado só com número', () => {
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

  it('traduz modal rodoviário e label embalagem', () => {
    expect(formatarModalExibicaoEmailDisparoBidFrete('RODOVIARIO', 'RODOVIARIO_LTL')).toBe('Rodoviário · LTL')
    expect(rotuloCampoVolumeEmailDisparoBidFrete('RODOVIARIO')).toBe('Embalagem')
    expect(rotuloCampoVolumeEmailDisparoBidFrete('MARITIMO')).toBe('Container')
  })

  it('monta HTML com layout, cliente e link de resposta', () => {
    const html = montarHtmlEmailDisparo({ ...PARAMETROS_BASE })
    expect(html).toContain('Maersk')
    expect(html).toContain('BID-001')
    expect(html).toContain('Acme Import')
    expect(html).toContain('Marítimo · FCL')
    expect(html).toContain('Responder cotação')
    expect(html).not.toContain('RODOVIARIO')
    expect(html).toContain('http://localhost:8000/bid-frete/visao-fornecedor-bid-frete-internacional/publico/tok')
  })

  it('monta texto plano espelhando resumo e link', () => {
    const texto = montarTextoPlanoEmailDisparo({
      ...PARAMETROS_BASE,
      modal: 'RODOVIARIO',
      modalidade: 'RODOVIARIO_LTL',
      tipoContainer: 'CAIXA',
      quantidade: 10001,
    })
    expect(texto).toContain('Rodoviário · LTL')
    expect(texto).toContain('10.001× Caixa')
    expect(texto).toContain('Responder cotação:')
    expect(texto).toContain(PARAMETROS_BASE.linkResposta)
    expect(texto).toContain('Não responda este e-mail')
  })

  it('oculta nome do cliente quando cotação anônima', () => {
    const html = montarHtmlEmailDisparo({
      ...PARAMETROS_BASE,
      anonimaCotacao: true,
    })
    expect(html).toContain('Um cliente')
    expect(html).not.toContain('Acme Import')
  })
})
