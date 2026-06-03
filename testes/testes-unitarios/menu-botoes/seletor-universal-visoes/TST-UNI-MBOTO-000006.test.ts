/**
 * TST-UNI-MBOTO-000006 — helper SLA 1s (assertSla1s / SLA_MS)
 */
import { describe, expect, it } from 'vitest'
import { SLA_MS, assertSla1s, CICLO_ABAS_4, CICLO_ABAS_PROCESSO } from '../../../testes-e2e/menu-botoes/seletor-universal-visoes/helpers/sla-1s-core.js'

describe('TST-UNI-MBOTO-000006 — SLA 1s helper', () => {
  it('SLA_MS é 1000', () => {
    expect(SLA_MS).toBe(1000)
  })

  it('assertSla1s aceita elapsed no limite', () => {
    expect(() => assertSla1s(1000, 'teste')).not.toThrow()
  })

  it('assertSla1s rejeita elapsed acima do SLA', () => {
    expect(() => assertSla1s(1001, 'teste')).toThrow(/<= 1000ms/)
  })

  it('ciclos de abas cobrem Pedido/BID (4) e Processo (2)', () => {
    expect(CICLO_ABAS_4).toEqual(['insights', 'lista', 'dashboard', 'kanban'])
    expect(CICLO_ABAS_PROCESSO).toEqual(['lista', 'kanban'])
  })
})
