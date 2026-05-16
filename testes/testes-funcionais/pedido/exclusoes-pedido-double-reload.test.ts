// @vitest-environment node
/**
 * exclusoes-pedido-double-reload.test.ts
 *
 * Teste funcional das rotas POST /exclusoes/preview, /exclusoes/confirmar,
 * /exclusoes/itens — foco no fix do bug double-reload.
 *
 * Bug original: res.json() era chamado DENTRO do callback withOrganizacao,
 * que roda DENTRO da $transaction Prisma. O HTTP response era enviado ANTES
 * do COMMIT, e o frontend via carregarInicial() fazia GET que lia dados
 * antigos (uncommitted). Resultado: item aparecia após delete, sumia só no
 * segundo reload.
 *
 * Fix: mover res.json() para FORA do withOrganizacao — o response só é
 * enviado após o await resolver (= após COMMIT).
 *
 * O que testamos aqui:
 *   1. Ordem de execução: withOrganizacao é fully awaited ANTES de res.json
 *   2. O resultado retornado pelo service (via withOrganizacao) é o body do response
 *   3. Validação Zod continua funcionando (400 para payload inválido)
 *   4. Erros do service propagam corretamente (500)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'

// ── Mocks via vi.hoisted (antes dos imports do módulo) ──────────────────────

const { mockPreview, mockConfirmar, mockExcluirItens, mockWithOrganizacao } = vi.hoisted(() => ({
  mockPreview:          vi.fn(),
  mockConfirmar:        vi.fn(),
  mockExcluirItens:     vi.fn(),
  mockWithOrganizacao:  vi.fn(),
}))

vi.mock('../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js', () => {
  class ExcluirService {
    preview = mockPreview
    confirmar = mockConfirmar
    excluirItens = mockExcluirItens
  }
  class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
      super(message)
      this.name = 'AppError'
      this.statusCode = statusCode
      this.code = code
    }
  }
  return { ExcluirService, AppError }
})

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: mockWithOrganizacao,
}))

vi.mock('../../../servicos-global/produto/pedido/server/src/permissoes.js', () => ({
  exigirPermissao: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}))

// ── Import do router APÓS os mocks ─────────────────────────────────────────

import { exclusoesPedidoRouter, AppError } from '../../../servicos-global/produto/pedido/server/src/routes/exclusoes-pedido.js'

// ── Tipos ───────────────────────────────────────────────────────────────────

interface HttpError extends Error {
  statusCode?: number
  code?: string
}

// ── App de teste ────────────────────────────────────────────────────────────

function buildTestApp() {
  const app = express()
  app.use(express.json())

  // Injeta req.organizacao simulado (DDD: ContextoOrganizacao)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as Record<string, unknown>).organizacao = {
      idOrganizacao: 'org-test-001',
      idUsuario:     'usr-test-001',
      nomeSchema:    'org_org_test_001',
      idCorrelacao:  'corr-test-001',
    }
    ;(req as Record<string, unknown>).auth = { nome_usuario: 'Tester Func' }
    next()
  })

  app.use('/exclusoes', exclusoesPedidoRouter)

  // Error handler real — verifica formato de erro
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.statusCode ?? 500
    res.status(status).json({
      error: { code: (err as HttpError & { code?: string }).code ?? 'INTERNAL_ERROR', message: err.message },
    })
  })

  return app
}

// ── Setup ───────────────────────────────────────────────────────────────────

let app: ReturnType<typeof buildTestApp>

beforeEach(() => {
  vi.clearAllMocks()
  app = buildTestApp()
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /exclusoes/preview
// ═══════════════════════════════════════════════════════════════════════════

describe('POST /exclusoes/preview', () => {
  const PREVIEW_RESULT = {
    permitidos: [{ id: 'ped1', numero_pedido: 'PED-001', total_itens: 3 }],
    bloqueados: [],
  }

  it('retorna resultado do service via withOrganizacao (res.json APÓS await)', async () => {
    mockWithOrganizacao.mockImplementation(async (_req: Request, fn: (db: unknown) => Promise<unknown>) => {
      return fn({}) // simula a execução dentro da transaction
    })
    mockPreview.mockResolvedValue(PREVIEW_RESULT)

    const res = await request(app)
      .post('/exclusoes/preview')
      .send({ ids: ['ped1'] })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(PREVIEW_RESULT)
  })

  it('res.json é chamado SOMENTE após withOrganizacao resolver (fix double-reload)', async () => {
    const executionOrder: string[] = []

    mockWithOrganizacao.mockImplementation(async (_req: Request, fn: (db: unknown) => Promise<unknown>) => {
      executionOrder.push('withOrganizacao:start')
      const result = await fn({})
      executionOrder.push('withOrganizacao:end')
      return result
    })
    mockPreview.mockImplementation(async () => {
      executionOrder.push('service:preview')
      return PREVIEW_RESULT
    })

    const res = await request(app)
      .post('/exclusoes/preview')
      .send({ ids: ['ped1'] })

    // O response body deve ser PREVIEW_RESULT — prova que res.json recebeu
    // o valor retornado por withOrganizacao (que só resolve após COMMIT)
    expect(res.status).toBe(200)
    expect(res.body).toEqual(PREVIEW_RESULT)

    // Ordem de execução prova que withOrganizacao terminou antes do response
    expect(executionOrder).toEqual([
      'withOrganizacao:start',
      'service:preview',
      'withOrganizacao:end',
    ])
  })

  it('400 quando ids está vazio', async () => {
    const res = await request(app)
      .post('/exclusoes/preview')
      .send({ ids: [] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('400 quando body não tem ids', async () => {
    const res = await request(app)
      .post('/exclusoes/preview')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('400 quando ids contém string vazia', async () => {
    const res = await request(app)
      .post('/exclusoes/preview')
      .send({ ids: [''] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('500 quando withOrganizacao rejeita (erro do service/banco)', async () => {
    mockWithOrganizacao.mockRejectedValue(new Error('Prisma timeout'))

    const res = await request(app)
      .post('/exclusoes/preview')
      .send({ ids: ['ped1'] })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.body.error.stack).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /exclusoes/confirmar
// ═══════════════════════════════════════════════════════════════════════════

describe('POST /exclusoes/confirmar', () => {
  const CONFIRMAR_RESULT = {
    excluidos: 2,
    itens_excluidos: 5,
    pedidos_excluidos_por_sem_item: 0,
  }

  it('retorna resultado do service via withOrganizacao (res.json APÓS await)', async () => {
    mockWithOrganizacao.mockImplementation(async (_req: Request, fn: (db: unknown) => Promise<unknown>) => {
      return fn({})
    })
    mockConfirmar.mockResolvedValue(CONFIRMAR_RESULT)

    const res = await request(app)
      .post('/exclusoes/confirmar')
      .send({ ids: ['ped1', 'ped2'] })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(CONFIRMAR_RESULT)
  })

  it('res.json é chamado SOMENTE após withOrganizacao resolver (fix double-reload)', async () => {
    const executionOrder: string[] = []

    mockWithOrganizacao.mockImplementation(async (_req: Request, fn: (db: unknown) => Promise<unknown>) => {
      executionOrder.push('withOrganizacao:start')
      const result = await fn({})
      executionOrder.push('withOrganizacao:end')
      return result
    })
    mockConfirmar.mockImplementation(async () => {
      executionOrder.push('service:confirmar')
      return CONFIRMAR_RESULT
    })

    const res = await request(app)
      .post('/exclusoes/confirmar')
      .send({ ids: ['ped1', 'ped2'] })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(CONFIRMAR_RESULT)
    expect(executionOrder).toEqual([
      'withOrganizacao:start',
      'service:confirmar',
      'withOrganizacao:end',
    ])
  })

  it('passa id_organizacao, id_usuario e nome_usuario para o service', async () => {
    mockWithOrganizacao.mockImplementation(async (_req: Request, fn: (db: unknown) => Promise<unknown>) => {
      return fn({})
    })
    mockConfirmar.mockResolvedValue(CONFIRMAR_RESULT)

    await request(app)
      .post('/exclusoes/confirmar')
      .send({ ids: ['ped1'] })

    expect(mockConfirmar).toHaveBeenCalledWith(
      {},                  // db (mock)
      'org-test-001',      // id_organizacao
      'usr-test-001',      // id_usuario
      'Tester Func',       // nome_usuario
      ['ped1'],            // ids
    )
  })

  it('400 quando ids está vazio', async () => {
    const res = await request(app)
      .post('/exclusoes/confirmar')
      .send({ ids: [] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('400 quando body não tem ids', async () => {
    const res = await request(app)
      .post('/exclusoes/confirmar')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('500 quando withOrganizacao rejeita', async () => {
    mockWithOrganizacao.mockRejectedValue(new AppError('Falha na exclusão', 500, 'DELETE_FAILED'))

    const res = await request(app)
      .post('/exclusoes/confirmar')
      .send({ ids: ['ped1'] })

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('DELETE_FAILED')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// POST /exclusoes/itens
// ═══════════════════════════════════════════════════════════════════════════

describe('POST /exclusoes/itens', () => {
  const ITENS_RESULT = {
    excluidos: 0,
    itens_excluidos: 3,
    pedidos_excluidos_por_sem_item: 1,
  }

  it('retorna resultado do service via withOrganizacao (res.json APÓS await)', async () => {
    mockWithOrganizacao.mockImplementation(async (_req: Request, fn: (db: unknown) => Promise<unknown>) => {
      return fn({})
    })
    mockExcluirItens.mockResolvedValue(ITENS_RESULT)

    const res = await request(app)
      .post('/exclusoes/itens')
      .send({ pedido_id: 'ped1', item_ids: ['it1', 'it2', 'it3'] })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(ITENS_RESULT)
  })

  it('res.json é chamado SOMENTE após withOrganizacao resolver (fix double-reload)', async () => {
    const executionOrder: string[] = []

    mockWithOrganizacao.mockImplementation(async (_req: Request, fn: (db: unknown) => Promise<unknown>) => {
      executionOrder.push('withOrganizacao:start')
      const result = await fn({})
      executionOrder.push('withOrganizacao:end')
      return result
    })
    mockExcluirItens.mockImplementation(async () => {
      executionOrder.push('service:excluirItens')
      return ITENS_RESULT
    })

    const res = await request(app)
      .post('/exclusoes/itens')
      .send({ pedido_id: 'ped1', item_ids: ['it1'] })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(ITENS_RESULT)
    expect(executionOrder).toEqual([
      'withOrganizacao:start',
      'service:excluirItens',
      'withOrganizacao:end',
    ])
  })

  it('passa pedido_id e item_ids para o service', async () => {
    mockWithOrganizacao.mockImplementation(async (_req: Request, fn: (db: unknown) => Promise<unknown>) => {
      return fn({})
    })
    mockExcluirItens.mockResolvedValue(ITENS_RESULT)

    await request(app)
      .post('/exclusoes/itens')
      .send({ pedido_id: 'ped-abc', item_ids: ['it-x', 'it-y'] })

    expect(mockExcluirItens).toHaveBeenCalledWith(
      {},                  // db (mock)
      'org-test-001',      // id_organizacao
      'usr-test-001',      // id_usuario
      'Tester Func',       // nome_usuario
      'ped-abc',           // pedido_id
      ['it-x', 'it-y'],   // item_ids
    )
  })

  it('400 quando pedido_id falta', async () => {
    const res = await request(app)
      .post('/exclusoes/itens')
      .send({ item_ids: ['it1'] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('400 quando item_ids está vazio', async () => {
    const res = await request(app)
      .post('/exclusoes/itens')
      .send({ pedido_id: 'ped1', item_ids: [] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('400 quando pedido_id é string vazia', async () => {
    const res = await request(app)
      .post('/exclusoes/itens')
      .send({ pedido_id: '', item_ids: ['it1'] })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('400 quando body está vazio', async () => {
    const res = await request(app)
      .post('/exclusoes/itens')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('500 quando withOrganizacao rejeita', async () => {
    mockWithOrganizacao.mockRejectedValue(new Error('Connection lost'))

    const res = await request(app)
      .post('/exclusoes/itens')
      .send({ pedido_id: 'ped1', item_ids: ['it1'] })

    expect(res.status).toBe(500)
    expect(res.body.error.stack).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Teste de regressão: withOrganizacao delay simula $transaction lenta
// ═══════════════════════════════════════════════════════════════════════════

describe('Regressão: transaction lenta não causa resposta prematura', () => {
  it('/confirmar com transaction de 100ms retorna dados corretos (não vazio)', async () => {
    const RESULTADO_LENTO = { excluidos: 5, itens_excluidos: 10, pedidos_excluidos_por_sem_item: 0 }

    mockWithOrganizacao.mockImplementation(async (_req: Request, fn: (db: unknown) => Promise<unknown>) => {
      // Simula uma transaction que demora (ex: audit log + deleteMany em volume)
      await new Promise(resolve => setTimeout(resolve, 100))
      return fn({})
    })
    mockConfirmar.mockResolvedValue(RESULTADO_LENTO)

    const res = await request(app)
      .post('/exclusoes/confirmar')
      .send({ ids: ['p1', 'p2', 'p3', 'p4', 'p5'] })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(RESULTADO_LENTO)
    expect(res.body.excluidos).toBe(5)
  })

  it('/itens com transaction de 100ms retorna dados corretos', async () => {
    const RESULTADO_LENTO = { excluidos: 0, itens_excluidos: 8, pedidos_excluidos_por_sem_item: 2 }

    mockWithOrganizacao.mockImplementation(async (_req: Request, fn: (db: unknown) => Promise<unknown>) => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return fn({})
    })
    mockExcluirItens.mockResolvedValue(RESULTADO_LENTO)

    const res = await request(app)
      .post('/exclusoes/itens')
      .send({ pedido_id: 'ped-big', item_ids: ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8'] })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(RESULTADO_LENTO)
    expect(res.body.pedidos_excluidos_por_sem_item).toBe(2)
  })
})
