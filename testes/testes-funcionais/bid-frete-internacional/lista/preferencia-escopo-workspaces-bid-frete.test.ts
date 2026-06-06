/// <reference types="vitest/globals" />
// @vitest-environment node

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

const metaStore: {
  config_json_lista_painel_usuario_global: string
} | null = { config_json_lista_painel_usuario_global: '{}' }

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: async (req: Request, fn: (db: unknown) => Promise<void>) => {
    const db = {
      listaPainelUsuarioGlobal: {
        findFirst: vi.fn(async () => metaStore),
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
          if (metaStore) {
            metaStore.config_json_lista_painel_usuario_global =
              data.config_json_lista_painel_usuario_global as string
          }
          return { id_lista_painel_usuario_global: 'meta-1', ...data }
        }),
        update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
          if (metaStore) {
            metaStore.config_json_lista_painel_usuario_global =
              data.config_json_lista_painel_usuario_global as string
          }
          return { id_lista_painel_usuario_global: 'meta-1', ...data }
        }),
      },
    }
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: 'org_test',
      idUsuario: 'user_test',
    }
    await fn(db)
  },
}))

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/shared/validar-multi-workspace-bid-frete-internacional.js',
  () => ({
    assertIdsWorkspacesEscopoAutorizados: vi.fn().mockResolvedValue(undefined),
  }),
)

import { preferenciaEscopoWorkspacesBidFreteRouter } from '../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/preferencia-escopo-workspaces-bid-frete-internacional'
import { parsearEscopoWorkspacesBidFrete } from '../../../../servicos-global/produto/bid-frete-internacional/shared/preferenciasEscopoWorkspacesBidFreteInternacional'

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/bid-frete-internacional/config', preferenciaEscopoWorkspacesBidFreteRouter)
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } })
  })
  return app
}

describe('GET/PUT /config/escopo-workspaces', () => {
  const app = criarApp()

  beforeEach(() => {
    if (metaStore) metaStore.config_json_lista_painel_usuario_global = '{}'
  })

  it('persiste ids_workspaces_escopo e relê via GET', async () => {
    const ids = ['ws-sp', 'ws-rj']

    const putRes = await request(app)
      .put('/api/v1/bid-frete-internacional/config/escopo-workspaces')
      .send({ ids_workspaces_escopo: ids })

    expect(putRes.status).toBe(200)
    expect(putRes.body.data.ids_workspaces_escopo).toEqual(ids)

    const getRes = await request(app)
      .get('/api/v1/bid-frete-internacional/config/escopo-workspaces')

    expect(getRes.status).toBe(200)
    expect(getRes.body.data.ids_workspaces_escopo).toEqual(ids)
    expect(parsearEscopoWorkspacesBidFrete(metaStore!.config_json_lista_painel_usuario_global)).toEqual(ids)
  })
})
