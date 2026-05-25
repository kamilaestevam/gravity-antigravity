import { describe, expect, it } from 'vitest'
import {
  escopoPedidoDivergeDoWorkspace,
  formatarResumoWorkspacesEscopo,
} from '../../../servicos-global/configurador/src/utils/pedido-escopo-hub'

describe('escopoPedidoDivergeDoWorkspace', () => {
  it('não diverge quando escopo é exatamente o workspace alvo', () => {
    expect(escopoPedidoDivergeDoWorkspace('ws-a', ['ws-a'])).toBe(false)
  })

  it('diverge quando escopo inclui outros workspaces', () => {
    expect(escopoPedidoDivergeDoWorkspace('ws-a', ['ws-a', 'ws-b'])).toBe(true)
  })

  it('diverge quando escopo é outro workspace', () => {
    expect(escopoPedidoDivergeDoWorkspace('ws-a', ['ws-b'])).toBe(true)
  })

  it('não diverge com escopo vazio', () => {
    expect(escopoPedidoDivergeDoWorkspace('ws-a', [])).toBe(false)
  })
})

describe('formatarResumoWorkspacesEscopo', () => {
  const nomes: Record<string, string> = {
    'ws-a': 'ABC',
    'ws-b': 'CDE',
    'ws-c': 'FGH',
    'ws-d': 'IJK',
  }

  it('formata um único workspace', () => {
    expect(formatarResumoWorkspacesEscopo(['ws-a'], id => nomes[id] ?? id)).toBe('ABC')
  })

  it('trunca lista longa com contador', () => {
    const ids = ['ws-a', 'ws-b', 'ws-c', 'ws-d']
    expect(formatarResumoWorkspacesEscopo(ids, id => nomes[id] ?? id, 2)).toBe('ABC, CDE +2')
  })
})
