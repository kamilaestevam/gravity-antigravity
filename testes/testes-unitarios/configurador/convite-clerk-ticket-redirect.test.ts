// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { deveRedirecionarConviteClerkTicket } from '../../../servicos-global/configurador/src/routing/redirecionar-convite-clerk-ticket.js'

describe('deveRedirecionarConviteClerkTicket', () => {
  it('redireciona /login com ticket para fluxo de convite', () => {
    expect(deveRedirecionarConviteClerkTicket('/login', 'inv_abc')).toBe(true)
  })

  it('nao redireciona quando ja esta em /cadastro/continuar', () => {
    expect(
      deveRedirecionarConviteClerkTicket('/cadastro/continuar', 'inv_abc'),
    ).toBe(false)
  })

  it('nao redireciona sem ticket', () => {
    expect(deveRedirecionarConviteClerkTicket('/login', null)).toBe(false)
  })
})
