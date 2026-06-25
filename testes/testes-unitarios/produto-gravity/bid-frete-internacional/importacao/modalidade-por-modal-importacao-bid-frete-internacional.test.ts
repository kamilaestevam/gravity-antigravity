/// <reference types="vitest/globals" />

import { normalizarLinhaImportacaoBid } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/normalizar-valor-importacao-bid-frete-internacional'
import { LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/parsear-planilha-importacao-bid-frete-internacional'
import {
  modalidadePermitidaParaModalImportacaoBid,
} from '../../../../../servicos-global/produto/bid-frete-internacional/shared/resolver-modalidade-importacao-bid-frete-internacional'
import { validarLinhaImportacaoBidFreteInternacional } from '../../../../../servicos-global/produto/bid-frete-internacional/shared/validar-linha-importacao-bid-frete-internacional'

describe('modalidade por modal — importação BID', () => {
  it('FCL/LCL só são válidos com modal Marítimo', () => {
    expect(modalidadePermitidaParaModalImportacaoBid('MARITIMO', 'FCL')).toBe(true)
    expect(modalidadePermitidaParaModalImportacaoBid('MARITIMO', 'LCL')).toBe(true)
    expect(modalidadePermitidaParaModalImportacaoBid('AEREO', 'FCL')).toBe(false)
    expect(modalidadePermitidaParaModalImportacaoBid('RODOVIARIO', 'FCL')).toBe(false)
  })

  it('rejeita FCL com modal Aéreo na validação de linha', () => {
    const linha = normalizarLinhaImportacaoBid({
      ...LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID,
      modal_cotacao_bid_frete_internacional: 'Aéreo',
      modalidade_cotacao_bid_frete_internacional: 'FCL',
    })
    const erros = validarLinhaImportacaoBidFreteInternacional(linha, {})
    expect(erros).toContain('modalidade invalida')
  })

  it('aceita FCL com modal Marítimo (rótulos da planilha)', () => {
    const linha = normalizarLinhaImportacaoBid(LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID)
    const erros = validarLinhaImportacaoBidFreteInternacional(linha, {})
    expect(erros).not.toContain('modalidade invalida')
  })
})
