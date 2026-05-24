import { describe, expect, it } from 'vitest'
import { resolverIdsWorkspacesParaApi } from '../../../servicos-global/produto/pedido/client/src/shared/useEscopoWorkspacesPedido'

describe('useEscopoWorkspacesPedido', () => {
  it('omite ids_workspaces quando escopo = workspace ativo único', () => {
    expect(resolverIdsWorkspacesParaApi(['ws-fides'], 'ws-fides')).toBeUndefined()
  })

  it('envia ids quando escopo multi-workspace', () => {
    expect(resolverIdsWorkspacesParaApi(['ws-fides', 'ws-cde'], 'ws-fides')).toEqual(['ws-fides', 'ws-cde'])
  })
})
