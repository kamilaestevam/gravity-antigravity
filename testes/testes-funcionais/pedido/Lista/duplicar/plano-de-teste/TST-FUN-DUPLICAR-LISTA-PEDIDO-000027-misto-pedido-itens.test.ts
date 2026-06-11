// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

/**
 * TST-FUN-DUPLICAR-LISTA-PEDIDO-000027 — Fluxo misto
 *
 * Cenário: 1 pedido inteiro (confirmar) + N itens avulsos de outro pedido (duplicarItens).
 * Espelha o handleConfirmar do ModalPedidosDuplicar (Promise.all dos 2 endpoints).
 *
 * Cobre: F-MST-01 a F-MST-04
 */

const { mockConfirmar, mockDuplicarItens } = vi.hoisted(() => ({
  mockConfirmar: vi.fn(),
  mockDuplicarItens: vi.fn(),
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: vi.fn(async (req: Request, cb: (db: unknown) => Promise<void>) => {
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: 'org-001',
      idUsuario: 'usr-001',
    }
    ;(req as unknown as { auth: { nome_usuario: string } }).auth = { nome_usuario: 'Test User' }
    await cb({})
  }),
}))

vi.mock('../../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js', () => ({
  DuplicarService: vi.fn().mockImplementation(() => ({
    preview: vi.fn(),
    confirmar: mockConfirmar,
    duplicarItens: mockDuplicarItens,
  })),
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
      super(message)
      this.name = 'AppError'
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

vi.mock('../../../../../../servicos-global/produto/pedido/server/src/permissoes.js', () => ({
  exigirPermissao: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}))

import { duplicacoesPedidoRouter } from '../../../../../../servicos-global/produto/pedido/server/src/routes/duplicacoes-pedido.js'

let app: express.Application

const OPCOES = {
  copiar_datas: true,
  copiar_valores_precos: true,
  copiar_referencias_externas: true,
  copiar_pesos_cubagem: true,
  copiar_descricoes_complementares: true,
}

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use('/api/v1/pedidos/duplicacoes', duplicacoesPedidoRouter)
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Fluxo misto — 1 pedido inteiro + itens avulsos de outro pedido', () => {
  it('F-MST-01: confirmar pedido A + duplicarItens no pedido B retorna 201 em ambos', async () => {
    mockConfirmar.mockResolvedValue({
      criados: [{ original_id: 'ped-a', novo_id: 'ped-a-copia', numero_pedido: 'COPIA-A' }],
      erros: [],
    })
    mockDuplicarItens.mockResolvedValue({
      criados: [
        { original_id: 'it-b1', novo_id: 'it-b1-copia', id_pedido: 'ped-b' },
        { original_id: 'it-b2', novo_id: 'it-b2-copia', id_pedido: 'ped-b' },
      ],
      erros: [],
    })

    const [resPedido, resItens] = await Promise.all([
      request(app)
        .post('/api/v1/pedidos/duplicacoes/confirmar')
        .set('x-id-workspace', 'ws-1')
        .send({ ids: ['ped-a'], opcoes: OPCOES }),
      request(app)
        .post('/api/v1/pedidos/duplicacoes/itens')
        .set('x-id-workspace', 'ws-1')
        .send({ pedido_id: 'ped-b', item_ids: ['it-b1', 'it-b2'], opcoes: OPCOES }),
    ])

    expect(resPedido.status).toBe(201)
    expect(resItens.status).toBe(201)
    expect(resPedido.body.criados).toHaveLength(1)
    expect(resItens.body.criados).toHaveLength(2)
    expect(resPedido.body.criados[0].novo_id).toBe('ped-a-copia')
  })

  it('F-MST-02: mesmas opcoes repassadas às duas rotas', async () => {
    mockConfirmar.mockResolvedValue({ criados: [{ original_id: 'ped-a', novo_id: 'x', numero_pedido: 'X' }], erros: [] })
    mockDuplicarItens.mockResolvedValue({ criados: [{ original_id: 'it-b1', novo_id: 'y', id_pedido: 'ped-b' }], erros: [] })

    await Promise.all([
      request(app)
        .post('/api/v1/pedidos/duplicacoes/confirmar')
        .send({ ids: ['ped-a'], opcoes: OPCOES }),
      request(app)
        .post('/api/v1/pedidos/duplicacoes/itens')
        .send({ pedido_id: 'ped-b', item_ids: ['it-b1'], opcoes: OPCOES }),
    ])

    expect(mockConfirmar).toHaveBeenCalledWith(
      expect.anything(), 'org-001', undefined, 'usr-001', expect.any(String),
      expect.objectContaining({ ids: ['ped-a'], opcoes: OPCOES }),
    )
    expect(mockDuplicarItens).toHaveBeenCalledWith(
      expect.anything(), 'org-001', undefined,
      expect.objectContaining({ pedido_id: 'ped-b', item_ids: ['it-b1'], opcoes: OPCOES }),
    )
  })

  it('F-MST-03: pedido A e itens de pedido B (outro workspace) — ambos 201 com x-id-workspace', async () => {
    mockConfirmar.mockResolvedValue({
      criados: [{ original_id: 'ped-ws1', novo_id: 'ped-ws1-copia', numero_pedido: 'COPIA-WS1' }],
      erros: [],
    })
    mockDuplicarItens.mockResolvedValue({
      criados: [{ original_id: 'it-ws2', novo_id: 'it-ws2-copia', id_pedido: 'ped-ws2' }],
      erros: [],
    })

    const [resPedido, resItens] = await Promise.all([
      request(app)
        .post('/api/v1/pedidos/duplicacoes/confirmar')
        .set('x-id-workspace', 'ws-1')
        .send({ ids: ['ped-ws1'], opcoes: OPCOES }),
      request(app)
        .post('/api/v1/pedidos/duplicacoes/itens')
        .set('x-id-workspace', 'ws-1')
        .send({ pedido_id: 'ped-ws2', item_ids: ['it-ws2'], opcoes: OPCOES }),
    ])

    expect(resPedido.status).toBe(201)
    expect(resItens.status).toBe(201)
    expect(mockConfirmar).toHaveBeenCalledWith(
      expect.anything(), 'org-001', 'ws-1', expect.any(String), expect.any(String),
      expect.objectContaining({ ids: ['ped-ws1'] }),
    )
    expect(mockDuplicarItens).toHaveBeenCalledWith(
      expect.anything(), 'org-001', 'ws-1',
      expect.objectContaining({ pedido_id: 'ped-ws2' }),
    )
  })

  it('F-MST-04: falha em duplicarItens não altera sucesso prévio de confirmar', async () => {
    mockConfirmar.mockResolvedValue({
      criados: [{ original_id: 'ped-a', novo_id: 'ped-a-copia', numero_pedido: 'COPIA-A' }],
      erros: [],
    })
    mockDuplicarItens.mockRejectedValue(new Error('Pedido não encontrado'))

    const resPedido = await request(app)
      .post('/api/v1/pedidos/duplicacoes/confirmar')
      .send({ ids: ['ped-a'], opcoes: OPCOES })

    const resItens = await request(app)
      .post('/api/v1/pedidos/duplicacoes/itens')
      .send({ pedido_id: 'ped-b', item_ids: ['it-b1'], opcoes: OPCOES })

    expect(resPedido.status).toBe(201)
    expect(resItens.status).toBe(500)
  })
})
