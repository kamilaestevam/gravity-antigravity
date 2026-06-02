/**
 * TST-FUN-MBOTO-000003 — BID Frete listagem/dashboard (baseline fase 1)
 */
import { describe, expect, it } from 'vitest'
import { rotaBidFreteInternacional } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/rotas-bid-frete-internacional.js'

describe('TST-FUN-MBOTO-000003 — rotas BID cliente', () => {
  it('expõe rotas das 4 abas do seletor', () => {
    expect(rotaBidFreteInternacional('visao-geral')).toContain('/visao-geral')
    expect(rotaBidFreteInternacional('lista')).toContain('/lista')
    expect(rotaBidFreteInternacional('dashboard')).toContain('/dashboard')
    expect(rotaBidFreteInternacional('kanban')).toContain('/kanban')
  })
})
