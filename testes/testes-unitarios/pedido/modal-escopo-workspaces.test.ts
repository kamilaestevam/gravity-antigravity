import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolverIdsWorkspacesParaApi } from '../../../servicos-global/produto/pedido/client/src/shared/useEscopoWorkspacesPedido'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const raizPedidoClient = path.resolve(
  __dirname,
  '../../../servicos-global/produto/pedido/client/src',
)

const modalNovoItemSource = readFileSync(
  path.join(raizPedidoClient, 'components/ModalItemNovo.tsx'),
  'utf8',
)
const modalTransferirSource = readFileSync(
  path.join(raizPedidoClient, 'components/ModalPedidoTransferir.tsx'),
  'utf8',
)

describe('Modais Pedido — escopo multi-workspace (SSOT Lista)', () => {
  it('ModalNovoItem usa pedidoVirtualApi.listar com idsWorkspacesFiltro', () => {
    expect(modalNovoItemSource).toContain('pedidoVirtualApi.listar')
    expect(modalNovoItemSource).toContain('useEscopoWorkspacesPedido')
    expect(modalNovoItemSource).toContain('resolverIdsWorkspacesParaApi')
    expect(modalNovoItemSource).toContain('idsWorkspacesFiltro')
    expect(modalNovoItemSource).toContain('escopoHidratado')
    expect(modalNovoItemSource).not.toMatch(/pedidoApi\.listar\(\{ status/)
  })

  it('ModalNovoItem envia idWorkspace do pedido selecionado ao adicionar item', () => {
    expect(modalNovoItemSource).toContain('pedidoWorkspaceSelecionadoId')
    expect(modalNovoItemSource).toContain('company_id')
    expect(modalNovoItemSource).toContain('idWorkspace: idWorkspaceAlvo')
  })

  it('ModalTransferir usa pedidoVirtualApi.listar com idsWorkspacesFiltro no passo destino', () => {
    expect(modalTransferirSource).toContain('pedidoVirtualApi.listar')
    expect(modalTransferirSource).toContain('useEscopoWorkspacesPedido')
    expect(modalTransferirSource).toContain('resolverIdsWorkspacesParaApi')
    expect(modalTransferirSource).toContain('idsWorkspacesFiltro')
    expect(modalTransferirSource).not.toMatch(/pedidoApi\.listar\(\{ tipo_operacao/)
  })

  it('resolverIdsWorkspacesParaApi envia CSV quando escopo ≠ workspace ativo único', () => {
    const ids = ['ws-1', 'ws-6', 'ws-7']
    expect(resolverIdsWorkspacesParaApi(ids, 'ws-1')).toEqual(ids)
  })
})
