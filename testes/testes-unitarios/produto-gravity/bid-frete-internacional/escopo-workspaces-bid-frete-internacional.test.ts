import { describe, expect, it } from 'vitest'
import { resolverIdsWorkspacesParaApi } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/useEscopoWorkspacesBidFreteInternacional'
import {
  parsearEscopoWorkspacesBidFrete,
  serializarEscopoWorkspacesBidFrete,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/preferenciasEscopoWorkspacesBidFreteInternacional'

describe('useEscopoWorkspacesBidFreteInternacional', () => {
  it('omite ids_workspaces quando escopo vazio (header x-id-workspace filtra)', () => {
    expect(resolverIdsWorkspacesParaApi([], 'ws-fides')).toBeUndefined()
  })

  it('omite ids_workspaces quando escopo = só workspace ativo (paridade Pedido)', () => {
    expect(resolverIdsWorkspacesParaApi(['ws-fides'], 'ws-fides')).toBeUndefined()
  })

  it('envia ids quando escopo multi-workspace', () => {
    expect(resolverIdsWorkspacesParaApi(['ws-fides', 'ws-cde'], 'ws-fides')).toEqual(['ws-fides', 'ws-cde'])
  })
})

describe('preferenciasEscopoWorkspacesBidFreteInternacional', () => {
  it('serializa e parseia ids_workspaces', () => {
    const raw = serializarEscopoWorkspacesBidFrete(['ws-a', 'ws-b'])
    expect(parsearEscopoWorkspacesBidFrete(raw)).toEqual(['ws-a', 'ws-b'])
  })

  it('rejeita JSON inválido no parse seguro', () => {
    expect(parsearEscopoWorkspacesBidFrete('{"_v":2}')).toBeUndefined()
  })
})
