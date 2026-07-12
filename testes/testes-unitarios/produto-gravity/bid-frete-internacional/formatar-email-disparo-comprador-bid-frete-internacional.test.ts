import { describe, it, expect } from 'vitest'
import {
  formatarDataHoraEnvioEmailDisparoCompradorBidFreteInternacional,
  montarHtmlEmailDisparoCompradorBidFreteInternacional,
  montarTextoPlanoEmailDisparoCompradorBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/formatar-email-disparo-comprador-bid-frete-internacional.js'

describe('formatar-email-disparo-comprador-bid-frete-internacional', () => {
  const params = {
    numeroCotacao: 'COT-20260712-7178',
    nomeComprador: 'Daniel',
    modal: 'MARITIMO',
    modalidade: 'FCL',
    origemNome: 'DEHAM',
    origemPais: 'DE',
    destinoNome: 'BRNVT',
    destinoPais: 'BR',
    incoterm: 'FOB',
    mercadoria: 'Mercadoria',
    quantidadeFornecedores: 2,
    dataHoraDisparo: new Date('2026-07-12T15:43:58.339Z'),
    fornecedoresDisparo: [
      {
        nomeFornecedor: 'Agente Alpha',
        canal: 'EMAIL',
        dataHoraEnvio: new Date('2026-07-12T15:43:58.339Z'),
        status: 'ENVIADO' as const,
      },
      {
        nomeFornecedor: 'Agente Beta',
        canal: 'EMAIL',
        dataHoraEnvio: new Date('2026-07-12T15:43:58.400Z'),
        status: 'ENVIADO' as const,
      },
    ],
    linkDetalheCotacao: 'http://localhost:8000/bid-frete/cotacoes/abc',
  }

  it('formata data e hora no fuso de São Paulo', () => {
    const formatado = formatarDataHoraEnvioEmailDisparoCompradorBidFreteInternacional(
      '2026-07-12T15:43:58.339Z',
    )
    expect(formatado).toMatch(/12\/07\/2026/)
    expect(formatado).toMatch(/12:43/)
  })

  it('html inclui tabela de fornecedores com canal e status', () => {
    const html = montarHtmlEmailDisparoCompradorBidFreteInternacional(params)
    expect(html).toContain('Fornecedores contatados')
    expect(html).toContain('Agente Alpha')
    expect(html).toContain('Agente Beta')
    expect(html).toContain('E-mail')
    expect(html).toContain('Enviado')
    expect(html).toContain('Envio realizado em')
  })

  it('texto plano lista fornecedores com data e hora', () => {
    const texto = montarTextoPlanoEmailDisparoCompradorBidFreteInternacional(params)
    expect(texto).toContain('Fornecedores:')
    expect(texto).toContain('Agente Alpha')
    expect(texto).toContain('Agente Beta')
    expect(texto).toContain('Enviado')
  })
})
