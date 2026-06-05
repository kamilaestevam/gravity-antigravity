import { describe, expect, it } from 'vitest'
import {
  escopoPadraoTodosWorkspaces,
  filtrarIdsEscopoHubValidos,
  resolverEscopoHubProduto,
} from '../../../servicos-global/configurador/src/utils/escopo-workspaces-produto-hub'

describe('escopoPadraoTodosWorkspaces', () => {
  it('retorna cópia de todos os ids disponíveis', () => {
    const ids = ['ws-a', 'ws-b']
    expect(escopoPadraoTodosWorkspaces(ids)).toEqual(['ws-a', 'ws-b'])
    expect(escopoPadraoTodosWorkspaces(ids)).not.toBe(ids)
  })
})

describe('resolverEscopoHubProduto', () => {
  const disponiveis = ['ws-a', 'ws-b', 'ws-c']

  it('usa preferência válida quando existir', () => {
    expect(resolverEscopoHubProduto(['ws-a', 'ws-b'], disponiveis)).toEqual(['ws-a', 'ws-b'])
  })

  it('cai no default todos quando preferência vazia', () => {
    expect(resolverEscopoHubProduto([], disponiveis)).toEqual(disponiveis)
    expect(resolverEscopoHubProduto(null, disponiveis)).toEqual(disponiveis)
  })

  it('filtrarIdsEscopoHubValidos remove ids stale', () => {
    expect(filtrarIdsEscopoHubValidos(['ws-a', 'stale'], disponiveis)).toEqual(['ws-a'])
  })
})
