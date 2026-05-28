import { describe, expect, it } from 'vitest'
import {
  ehParceiroFreteInternacional,
  inferirTipoFornecedorBidFrete,
  mapCadastrosParaBidFornecedor,
  resolverEmailFornecedorBidFrete,
  type FornecedorCadastrosFrete,
} from '../../../servicos-global/produto/bid-frete-internacional/server/src/services/sincronizar-fornecedores-cadastros'

function parceiroBase(overrides: Partial<FornecedorCadastrosFrete> = {}): FornecedorCadastrosFrete {
  return {
    id_fornecedor: 'BR-ACME-00001',
    nome_fornecedor: 'ACME Logística',
    pais_fornecedor: 'BR',
    pode_ser_agente_fornecedor: false,
    pode_ser_armador_fornecedor: false,
    pode_ser_cia_aerea_fornecedor: false,
    pode_ser_transportadora_rodoviaria_nacional_fornecedor: false,
    pode_ser_transportadora_rodoviaria_internacional_fornecedor: false,
    ativo_fornecedor: true,
    ...overrides,
  }
}

describe('sincronizar-fornecedores-cadastros', () => {
  it('identifica parceiro de frete internacional pelas flags pode_ser_*', () => {
    expect(ehParceiroFreteInternacional(parceiroBase())).toBe(false)
    expect(ehParceiroFreteInternacional(parceiroBase({ pode_ser_agente_fornecedor: true }))).toBe(true)
    expect(ehParceiroFreteInternacional(parceiroBase({ pode_ser_armador_fornecedor: true }))).toBe(true)
  })

  it('mapeia tipo BID a partir das flags de frete', () => {
    expect(inferirTipoFornecedorBidFrete(parceiroBase({ pode_ser_agente_fornecedor: true }))).toBe('AGENTE_CARGA')
    expect(inferirTipoFornecedorBidFrete(parceiroBase({ pode_ser_armador_fornecedor: true }))).toBe('ARMADOR')
    expect(inferirTipoFornecedorBidFrete(parceiroBase({ pode_ser_cia_aerea_fornecedor: true }))).toBe('CIA_AEREA')
    expect(
      inferirTipoFornecedorBidFrete(parceiroBase({ pode_ser_transportadora_rodoviaria_internacional_fornecedor: true })),
    ).toBe('TRANSPORTADORA')
  })

  it('usa email interno quando parceiro não tem email no Cadastros', () => {
    expect(resolverEmailFornecedorBidFrete(parceiroBase())).toBe('cadastros+BR-ACME-00001@interno.gravity.local')
    expect(
      resolverEmailFornecedorBidFrete(parceiroBase({ email_principal_fornecedor: 'Contato@Exemplo.com' })),
    ).toBe('contato@exemplo.com')
  })

  it('materializa id_fornecedor do Cadastros como PK do BID', () => {
    const mapeado = mapCadastrosParaBidFornecedor(parceiroBase({ pode_ser_agente_fornecedor: true }))
    expect(mapeado.id_fornecedor_bid_frete_internacional).toBe('BR-ACME-00001')
    expect(mapeado.tipo_fornecedor_bid_frete_internacional).toBe('AGENTE_CARGA')
    expect(mapeado.status_fornecedor_bid_frete_internacional).toBe('ATIVO')
  })
})
