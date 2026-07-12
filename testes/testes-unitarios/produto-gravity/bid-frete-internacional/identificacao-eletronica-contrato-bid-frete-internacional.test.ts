import { describe, expect, it } from 'vitest'
import {
  montarQualificacaoFornecedorContratoBidFreteInternacional,
  TEXTO_QUALIFICACAO_FORNECEDOR_SEM_CONTEXTO,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/identificacao-eletronica-contrato-bid-frete-internacional'
import {
  calcularHashDocumentoContratoFechamentoPlataformaBidFreteInternacional,
  calcularHashTextoContratoPlataformaBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/hash-contrato-plataforma-bid-frete-internacional'
import {
  montarDocumentoContratoFechamentoPlataformaBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/contrato-fechamento-plataforma-bid-frete-internacional'

describe('identificacao-eletronica-contrato-bid-frete-internacional', () => {
  it('monta qualificação eletrônica com empresa, cotação, e-mail e CNPJ', () => {
    const texto = montarQualificacaoFornecedorContratoBidFreteInternacional({
      nome_empresa_fornecedor: 'ACME Logística Ltda',
      numero_cotacao: 'BID-2026-001',
      email_contato_fornecedor: 'contato@acme.com',
      cnpj_fornecedor: '32964709000101',
    })

    expect(texto).toContain('ACME Logística Ltda')
    expect(texto).toContain('cotação nº BID-2026-001')
    expect(texto).toContain('contato@acme.com')
    expect(texto).toContain('32.964.709/0001-01')
    expect(texto).toContain('FORNECEDOR')
    expect(texto).not.toContain('[qualificação')
  })

  it('omite CNPJ quando ausente no cadastro', () => {
    const texto = montarQualificacaoFornecedorContratoBidFreteInternacional({
      nome_empresa_fornecedor: 'ACME Logística Ltda',
      numero_cotacao: 'BID-2026-001',
      email_contato_fornecedor: 'contato@acme.com',
    })

    expect(texto).not.toContain('CNPJ')
    expect(texto).toContain('identificada eletronicamente')
  })

  it('usa texto genérico sem contexto completo', () => {
    expect(montarQualificacaoFornecedorContratoBidFreteInternacional(null)).toBe(
      TEXTO_QUALIFICACAO_FORNECEDOR_SEM_CONTEXTO,
    )
  })

  it('hash do contrato muda com qualificação personalizada', () => {
    const contexto = {
      nome_empresa_fornecedor: 'ACME Logística Ltda',
      numero_cotacao: 'BID-2026-001',
      email_contato_fornecedor: 'contato@acme.com',
    }
    const hashComContexto = calcularHashDocumentoContratoFechamentoPlataformaBidFreteInternacional(
      'FORNECEDOR',
      contexto,
    )
    const hashSemContexto = calcularHashDocumentoContratoFechamentoPlataformaBidFreteInternacional('FORNECEDOR')
    expect(hashComContexto).not.toBe(hashSemContexto)
    expect(calcularHashTextoContratoPlataformaBidFreteInternacional('abc')).toHaveLength(64)
  })

  it('inclui cláusulas de identificação eletrônica no aceite', () => {
    const doc = montarDocumentoContratoFechamentoPlataformaBidFreteInternacional('FORNECEDOR', {
      nome_empresa_fornecedor: 'ACME',
      numero_cotacao: 'BID-1',
      email_contato_fornecedor: 'a@b.com',
    })
    const secaoAceite = doc.secoes.find(s => s.titulo.includes('Aceite'))
    const texto = secaoAceite?.paragrafos.join(' ') ?? ''
    expect(texto).toContain('art. 422')
    expect(texto).toContain('Medida Provisória nº 2.200-2/2001')
    expect(texto).toContain('teoria da aparência')
    expect(texto).toContain('vincular o FORNECEDOR')
    expect(texto).not.toContain('contratar em nome do FORNECEDOR')
  })
})
