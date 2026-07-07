import { describe, it, expect } from 'vitest'
import {
  montarAssuntoEmailAlteracaoProposta,
  montarHtmlEmailAlteracaoProposta,
  montarTextoPlanoEmailAlteracaoProposta,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/formatar-email-alteracao-proposta-bid-frete-internacional'

const baseParams = {
  numeroCotacao: 'COT-20260706-0001',
  nomeFornecedor: 'Maersk',
  moeda: 'USD',
  linkResposta: 'http://localhost:8001/bid-frete/publico/token-abc',
  alteracoes: [
    {
      campo: 'valor_frete_proposta_bid_frete_internacional' as const,
      rotulo: 'Frete base',
      valor_antes: 1000,
      valor_depois: 1100,
    },
  ],
}

describe('montarAssuntoEmailAlteracaoProposta', () => {
  it('diferencia criação e atualização', () => {
    expect(montarAssuntoEmailAlteracaoProposta({ ...baseParams, tipo: 'criar' })).toContain('Proposta enviada')
    expect(montarAssuntoEmailAlteracaoProposta({ ...baseParams, tipo: 'atualizar' })).toContain('Proposta atualizada')
  })
})

describe('montarTextoPlanoEmailAlteracaoProposta', () => {
  it('inclui diff e link na alteração', () => {
    const texto = montarTextoPlanoEmailAlteracaoProposta({ ...baseParams, tipo: 'atualizar' })
    expect(texto).toContain('Você alterou sua proposta')
    expect(texto).toContain('Frete base')
    expect(texto).toContain(baseParams.linkResposta)
  })

  it('confirma envio na primeira resposta', () => {
    const texto = montarTextoPlanoEmailAlteracaoProposta({ ...baseParams, tipo: 'criar', alteracoes: [] })
    expect(texto).toContain('foi registrada com sucesso')
  })
})

describe('montarHtmlEmailAlteracaoProposta', () => {
  it('renderiza lista de alterações', () => {
    const html = montarHtmlEmailAlteracaoProposta({ ...baseParams, tipo: 'atualizar' })
    expect(html).toContain('Proposta atualizada')
    expect(html).toContain('Frete base')
    expect(html).toContain(baseParams.linkResposta)
  })
})
