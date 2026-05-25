import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolverIdsWorkspacesParaApi } from '../../../servicos-global/produto/pedido/client/src/shared/useEscopoWorkspacesPedido'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const kanbanPath = path.resolve(
  __dirname,
  '../../../servicos-global/produto/pedido/client/src/pages/PedidosKanban.tsx',
)
const kanbanSource = readFileSync(kanbanPath, 'utf8')

describe('PedidosKanban — escopo multi-workspace', () => {
  it('usa pedidoVirtualApi.listar (mesmo contrato da Lista)', () => {
    expect(kanbanSource).toContain('pedidoVirtualApi.listar')
    expect(kanbanSource).not.toMatch(/pedidoApi\.listar\(\{ limit/)
  })

  it('consome useEscopoWorkspacesPedido e resolverIdsWorkspacesParaApi', () => {
    expect(kanbanSource).toContain('useEscopoWorkspacesPedido')
    expect(kanbanSource).toContain('resolverIdsWorkspacesParaApi')
    expect(kanbanSource).toContain('idsWorkspacesFiltro')
  })

  it('monta params iguais à Lista para escopo multi-workspace', () => {
    const ids = ['ws-a', 'ws-b', 'ws-c']
    expect(resolverIdsWorkspacesParaApi(ids, 'ws-a')).toEqual(ids)
  })

  it('omite ids_workspaces quando escopo = workspace ativo único', () => {
    expect(resolverIdsWorkspacesParaApi(['ws-fides'], 'ws-fides')).toBeUndefined()
  })
})
