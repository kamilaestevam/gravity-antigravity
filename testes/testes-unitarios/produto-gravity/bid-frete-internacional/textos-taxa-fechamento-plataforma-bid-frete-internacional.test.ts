import { describe, it, expect } from 'vitest'
import {
  montarTextoAceiteCondicoesPortalRespostaBidFrete,
  montarTextoAvisoTaxaEmailDisparoBidFrete,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/textos-taxa-fechamento-plataforma-bid-frete-internacional'

describe('textos taxa fechamento plataforma BID', () => {
  it('fornecedor — texto do e-mail cobra da conta Gravity', () => {
    const texto = montarTextoAvisoTaxaEmailDisparoBidFrete({
      pagador: 'FORNECEDOR',
      urlCondicoes: 'https://exemplo/condicoes',
    })
    expect(texto).toContain('da sua conta na Gravity')
    expect(texto).not.toContain('contratante Gravity')
  })

  it('contratante Gravity — texto do e-mail isenta o fornecedor', () => {
    const texto = montarTextoAvisoTaxaEmailDisparoBidFrete({
      pagador: 'CONTRATANTE_GRAVITY',
      urlCondicoes: 'https://exemplo/condicoes',
    })
    expect(texto).toContain('contratante Gravity')
    expect(texto).toContain('você não será cobrado')
  })

  it('contratante Gravity — texto de aceite no portal', () => {
    const texto = montarTextoAceiteCondicoesPortalRespostaBidFrete('CONTRATANTE_GRAVITY')
    expect(texto).toContain('contratante Gravity')
    expect(texto).not.toContain('boleto mensal')
  })
})
