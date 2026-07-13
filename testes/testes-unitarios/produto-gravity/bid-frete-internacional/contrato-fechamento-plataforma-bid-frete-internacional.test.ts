import { describe, expect, it } from 'vitest'
import {
  DOCUMENTO_CONTRATO_FECHAMENTO_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL,
  DOCUMENTO_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL,
  IDENTIFICACAO_LEGAL_OPERADORA_GRAVITY_DATI,
  ROTA_CONTRATO_FECHAMENTO_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL,
  ROTA_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL,
  resolverDocumentoContratoFechamentoPlataformaBidFreteInternacional,
  resolverDocumentoContratoFechamentoPorSlug,
  resolverRotaContratoFechamentoPlataformaBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/contrato-fechamento-plataforma-bid-frete-internacional'

describe('contrato-fechamento-plataforma-bid-frete-internacional', () => {
  it('inclui qualificação DATI na seção 1', () => {
    const doc = DOCUMENTO_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL
    expect(doc.secoes[0]?.paragrafos[0]).toContain(IDENTIFICACAO_LEGAL_OPERADORA_GRAVITY_DATI)
    expect(IDENTIFICACAO_LEGAL_OPERADORA_GRAVITY_DATI).toContain('32.964.709/0001-01')
  })

  it('resolve documento por pagador', () => {
    expect(
      resolverDocumentoContratoFechamentoPlataformaBidFreteInternacional('FORNECEDOR').slug,
    ).toBe('pagamento-fornecedor')
    expect(
      resolverDocumentoContratoFechamentoPlataformaBidFreteInternacional('CONTRATANTE_GRAVITY').slug,
    ).toBe('pagamento-contratante-gravity')
  })

  it('resolve rota absoluta a partir de link de referência', () => {
    const rota = resolverRotaContratoFechamentoPlataformaBidFreteInternacional(
      'FORNECEDOR',
      'http://localhost:8000/bid-frete/aceite/publico/token',
      { token_aceite: 'aceite-token' },
    )
    expect(rota).toBe(
      `http://localhost:8000${ROTA_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL}?token_aceite=aceite-token`,
    )
  })

  it('qualificação do fornecedor usa identificação eletrônica quando há contexto', () => {
    const doc = resolverDocumentoContratoFechamentoPlataformaBidFreteInternacional('FORNECEDOR', {
      nome_empresa_fornecedor: 'Transportes Globais SA',
      numero_cotacao: 'COT-99',
      email_contato_fornecedor: 'ops@globais.com',
    })
    expect(doc.secoes[0]?.paragrafos[1]).toContain('Transportes Globais SA')
    expect(doc.secoes[0]?.paragrafos[1]).toContain('ops@globais.com')
    expect(doc.secoes[0]?.paragrafos[1]).not.toContain('[qualificação')
  })

  it('resolve documento por slug público', () => {
    expect(
      resolverDocumentoContratoFechamentoPorSlug('pagamento-contratante-gravity')?.rota,
    ).toBe(ROTA_CONTRATO_FECHAMENTO_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL)
    expect(resolverDocumentoContratoFechamentoPorSlug('invalido')).toBeNull()
  })

  it('variantes têm cláusulas distintas de taxa', () => {
    const fornecedor = DOCUMENTO_CONTRATO_FECHAMENTO_PAGAMENTO_FORNECEDOR_BID_FRETE_INTERNACIONAL
    const contratante = DOCUMENTO_CONTRATO_FECHAMENTO_PAGAMENTO_CONTRATANTE_GRAVITY_BID_FRETE_INTERNACIONAL
    expect(fornecedor.secoes[3]?.paragrafos[0]).toContain('FORNECEDOR (você) pagará')
    expect(contratante.secoes[3]?.paragrafos[0]).toContain('Contratante Gravity')
  })
})
