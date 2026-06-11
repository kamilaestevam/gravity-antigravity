import { describe, expect, it } from 'vitest'
import type { Request } from 'express'
import {
  clausulaFiltroWorkspaceBidFrete,
  parseIdsWorkspacesQuery,
} from '../../../servicos-global/produto/bid-frete-internacional/server/src/shared/workspace-filtro-bid-frete-internacional'

function reqComQuery(query: Record<string, string | undefined>, headers: Record<string, string> = {}): Request {
  return {
    query,
    headers,
  } as unknown as Request
}

describe('workspace-filtro-bid-frete-internacional', () => {
  it('parseia ids_workspaces CSV', () => {
    const req = reqComQuery({ ids_workspaces: 'ws-a, ws-b' })
    expect(parseIdsWorkspacesQuery(req)).toEqual(['ws-a', 'ws-b'])
  })

  it('prioriza ids_workspaces sobre x-id-workspace', () => {
    const req = reqComQuery(
      { ids_workspaces: 'ws-a,ws-b' },
      { 'x-id-workspace': 'ws-outro' },
    )
    expect(clausulaFiltroWorkspaceBidFrete(req)).toEqual({ id_workspace: { in: ['ws-a', 'ws-b'] } })
  })

  it('usa header x-id-workspace quando query ausente', () => {
    const req = reqComQuery({}, { 'x-id-workspace': 'ws-unico' })
    expect(clausulaFiltroWorkspaceBidFrete(req)).toEqual({ id_workspace: 'ws-unico' })
  })

  it('retorna vazio sem filtro explícito', () => {
    const req = reqComQuery({}, {})
    expect(clausulaFiltroWorkspaceBidFrete(req)).toEqual({})
  })
})
