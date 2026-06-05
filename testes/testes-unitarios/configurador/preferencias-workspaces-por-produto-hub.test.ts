import { describe, expect, it } from 'vitest'
import { escopoContemTodosWorkspaces } from '../../../servicos-global/configurador/src/utils/pedido-escopo-hub'

const idsDisponiveis = ['ws-a', 'ws-b']

describe('escopoContemTodosWorkspaces', () => {
  it('retorna true quando todos os IDs estão no escopo', () => {
    expect(escopoContemTodosWorkspaces(['ws-a', 'ws-b'], idsDisponiveis)).toBe(true)
  })

  it('retorna false com subconjunto', () => {
    expect(escopoContemTodosWorkspaces(['ws-a'], idsDisponiveis)).toBe(false)
  })

  it('retorna false com contagem igual mas ID divergente', () => {
    expect(escopoContemTodosWorkspaces(['ws-a', 'ws-x'], idsDisponiveis)).toBe(false)
  })
})
