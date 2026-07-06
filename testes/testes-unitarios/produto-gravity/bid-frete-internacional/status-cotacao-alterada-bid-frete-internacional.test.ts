import { describe, expect, it } from 'vitest'
import {
  patchDeveMarcarCotacaoAlterada,
  statusCotacaoPermiteMarcarAlterada,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/status-cotacao-alterada-bid-frete-internacional.js'

describe('status-cotacao-alterada-bid-frete-internacional', () => {
  it('permite marcar alterada apos envio', () => {
    expect(statusCotacaoPermiteMarcarAlterada('EM_COTACAO')).toBe(true)
    expect(statusCotacaoPermiteMarcarAlterada('RASCUNHO')).toBe(false)
  })

  it('marca alterada quando patch muda conteudo do edital', () => {
    expect(
      patchDeveMarcarCotacaoAlterada('EM_COTACAO', {
        incoterm_cotacao_bid_frete_internacional: 'FOB',
      }),
    ).toBe(true)
  })

  it('nao marca alterada para metadados internos', () => {
    expect(
      patchDeveMarcarCotacaoAlterada('EM_COTACAO', {
        numero_cotacao_bid_frete_internacional: 'COT-1',
      }),
    ).toBe(false)
  })
})
