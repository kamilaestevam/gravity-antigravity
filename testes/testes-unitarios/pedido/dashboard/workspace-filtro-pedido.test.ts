// @vitest-environment node
/// <reference types="vitest/globals" />

import type { Request } from 'express'
import {
  clausulaFiltroWorkspacePedido,
  parseIdsWorkspacesQuery,
} from '../../../../servicos-global/produto/pedido/server/src/shared/workspace-filtro-pedido.js'

function mockReq(query: Record<string, string> = {}, headers: Record<string, string> = {}): Request {
  return {
    query,
    headers,
  } as unknown as Request
}

describe('workspace-filtro-pedido', () => {
  it('parseIdsWorkspacesQuery — CSV com espaços', () => {
    expect(parseIdsWorkspacesQuery(mockReq({ ids_workspaces: ' ws-a , ws-b ' }))).toEqual(['ws-a', 'ws-b'])
  })

  it('parseIdsWorkspacesQuery — ausente retorna undefined', () => {
    expect(parseIdsWorkspacesQuery(mockReq())).toBeUndefined()
  })

  it('clausulaFiltroWorkspacePedido — query param tem prioridade sobre header', () => {
    const clausula = clausulaFiltroWorkspacePedido(
      mockReq({ ids_workspaces: 'ws-a,ws-b' }, { 'x-id-workspace': 'ws-header' }),
    )
    expect(clausula).toEqual({ id_workspace: { in: ['ws-a', 'ws-b'] } })
  })

  it('clausulaFiltroWorkspacePedido — fallback para header x-id-workspace', () => {
    const clausula = clausulaFiltroWorkspacePedido(
      mockReq({}, { 'x-id-workspace': 'ws-unico' }),
    )
    expect(clausula).toEqual({ id_workspace: 'ws-unico' })
  })

  it('clausulaFiltroWorkspacePedido — sem filtro explícito retorna org inteira', () => {
    expect(clausulaFiltroWorkspacePedido(mockReq())).toEqual({})
  })
})

describe('aggregateKpis + filtro workspace (regressão)', () => {
  it('030 — pedidos filtrados por workspace antes da agregação produzem total correto', async () => {
    const { aggregateKpis } = await import(
      '../../../../servicos-global/produto/pedido/server/src/routes/dashboard-pedido-dados.js'
    )

    const pedidos = [
      { status_pedido: 'aberto', valor_total_pedido: 100, moeda_pedido: 'BRL', id_workspace: 'ws-a' },
      { status_pedido: 'aberto', valor_total_pedido: 200, moeda_pedido: 'BRL', id_workspace: 'ws-b' },
    ]

    const filtroWs = { id_workspace: { in: ['ws-a'] } }
    const filtrados = pedidos.filter(p => {
      const inList = (filtroWs.id_workspace as { in: string[] }).in
      return inList.includes(String(p.id_workspace))
    })

    const result = aggregateKpis(filtrados, [], { BRL: 1 }, '30d')
    expect(result.total_pedidos).toBe(1)
    expect(result.valor_total_brl).toBe(100)
  })
})
