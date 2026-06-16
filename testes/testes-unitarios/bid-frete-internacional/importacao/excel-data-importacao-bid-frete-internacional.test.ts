/// <reference types="vitest/globals" />

import {
  CAMPOS_DATA_IMPORTACAO_BID,
  formatarDataPlanilhaImportacaoBid,
  parseDataTextoPlanilhaImportacaoBid,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/excel-data-importacao-bid-frete-internacional'

describe('excel-data-importacao-bid-frete-internacional', () => {
  it('identifica os três campos de data do template', () => {
    expect(CAMPOS_DATA_IMPORTACAO_BID.size).toBe(3)
    expect(CAMPOS_DATA_IMPORTACAO_BID.has('data_limite_resposta_cotacao_bid_frete_internacional')).toBe(true)
    expect(CAMPOS_DATA_IMPORTACAO_BID.has('data_aprovacao_cotacao_bid_frete_internacional')).toBe(true)
    expect(CAMPOS_DATA_IMPORTACAO_BID.has('data_cancelamento_cotacao_bid_frete_internacional')).toBe(true)
  })

  it('parseia dd/mm/aaaa e yyyy-mm-dd', () => {
    expect(formatarDataPlanilhaImportacaoBid(parseDataTextoPlanilhaImportacaoBid('15/06/2026')!)).toBe('15/06/2026')
    expect(formatarDataPlanilhaImportacaoBid(parseDataTextoPlanilhaImportacaoBid('2026-06-15')!)).toBe('15/06/2026')
  })
})
