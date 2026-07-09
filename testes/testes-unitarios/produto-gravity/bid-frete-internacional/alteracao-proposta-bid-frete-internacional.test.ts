import { describe, it, expect } from 'vitest'
import {
  calcularAlteracoesSnapshotProposta,
  extrairSnapshotPropostaAlteracao,
  formatarValorAlteracaoProposta,
  montarLinhasTextoAlteracaoProposta,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/alteracao-proposta-bid-frete-internacional'

describe('extrairSnapshotPropostaAlteracao', () => {
  it('normaliza moeda e totais numéricos', () => {
    const snapshot = extrairSnapshotPropostaAlteracao({
      moeda_proposta_bid_frete_internacional: 'EUR',
      valor_frete_proposta_bid_frete_internacional: 1000,
      taxas_origem_proposta_bid_frete_internacional: 50,
      taxas_destino_proposta_bid_frete_internacional: 25,
      valor_total_proposta_bid_frete_internacional: 1075,
      dias_transito_proposta_bid_frete_internacional: 18,
    })
    expect(snapshot.moeda_proposta_bid_frete_internacional).toBe('EUR')
    expect(snapshot.valor_total_proposta_bid_frete_internacional).toBe(1075)
  })
})

describe('calcularAlteracoesSnapshotProposta', () => {
  it('detecta alteração de frete base e transit time', () => {
    const antes = extrairSnapshotPropostaAlteracao({
      moeda_proposta_bid_frete_internacional: 'USD',
      valor_frete_proposta_bid_frete_internacional: 1000,
      taxas_origem_proposta_bid_frete_internacional: 0,
      taxas_destino_proposta_bid_frete_internacional: 0,
      valor_total_proposta_bid_frete_internacional: 1000,
      dias_transito_proposta_bid_frete_internacional: 20,
    })
    const depois = extrairSnapshotPropostaAlteracao({
      moeda_proposta_bid_frete_internacional: 'USD',
      valor_frete_proposta_bid_frete_internacional: 1100,
      taxas_origem_proposta_bid_frete_internacional: 0,
      taxas_destino_proposta_bid_frete_internacional: 0,
      valor_total_proposta_bid_frete_internacional: 1100,
      dias_transito_proposta_bid_frete_internacional: 18,
    })

    const alteracoes = calcularAlteracoesSnapshotProposta(antes, depois)
    const campos = alteracoes.map(a => a.campo)
    expect(campos).toContain('valor_frete_proposta_bid_frete_internacional')
    expect(campos).toContain('valor_total_proposta_bid_frete_internacional')
    expect(campos).toContain('dias_transito_proposta_bid_frete_internacional')
  })

  it('ignora diferenças abaixo de 0,0001 em valores numéricos', () => {
    const base = extrairSnapshotPropostaAlteracao({
      moeda_proposta_bid_frete_internacional: 'USD',
      valor_frete_proposta_bid_frete_internacional: 100,
      taxas_origem_proposta_bid_frete_internacional: 0,
      taxas_destino_proposta_bid_frete_internacional: 0,
      valor_total_proposta_bid_frete_internacional: 100,
      dias_transito_proposta_bid_frete_internacional: 10,
    })
    const quaseIgual = { ...base, valor_frete_proposta_bid_frete_internacional: 100.00005 }
    expect(calcularAlteracoesSnapshotProposta(base, quaseIgual)).toHaveLength(0)
  })
})

describe('montarLinhasTextoAlteracaoProposta', () => {
  it('formata linhas legíveis com moeda', () => {
    const alteracoes = calcularAlteracoesSnapshotProposta(
      extrairSnapshotPropostaAlteracao({
        moeda_proposta_bid_frete_internacional: 'USD',
        valor_frete_proposta_bid_frete_internacional: 900,
        taxas_origem_proposta_bid_frete_internacional: 0,
        taxas_destino_proposta_bid_frete_internacional: 0,
        valor_total_proposta_bid_frete_internacional: 900,
        dias_transito_proposta_bid_frete_internacional: 15,
      }),
      extrairSnapshotPropostaAlteracao({
        moeda_proposta_bid_frete_internacional: 'USD',
        valor_frete_proposta_bid_frete_internacional: 950,
        taxas_origem_proposta_bid_frete_internacional: 0,
        taxas_destino_proposta_bid_frete_internacional: 0,
        valor_total_proposta_bid_frete_internacional: 950,
        dias_transito_proposta_bid_frete_internacional: 15,
      }),
    )
    const linhas = montarLinhasTextoAlteracaoProposta(alteracoes, 'USD')
    expect(linhas[0]).toContain('Frete base')
    expect(linhas[0]).toContain('→')
    expect(formatarValorAlteracaoProposta('dias_transito_proposta_bid_frete_internacional', 12, 'USD')).toBe('12 dias')
  })
})
