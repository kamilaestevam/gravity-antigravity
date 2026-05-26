// @vitest-environment node
/**
 * Testes Funcionais — POST /importacoes-inteligentes/confirmar
 * Cobre: F-CNF-01 a F-CNF-21
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

const {
  mockConfirmar,
  mockResolverParceiros,
  mockPrepararLinhas,
  callOrder,
} = vi.hoisted(() => ({
  mockConfirmar: vi.fn(),
  mockResolverParceiros: vi.fn(),
  mockPrepararLinhas: vi.fn(),
  callOrder: [] as string[],
}))

vi.mock('@gravity/resolver-organizacao', () => ({
  withOrganizacao: vi.fn(async (req: Request, cb: (db: unknown) => Promise<void>) => {
    callOrder.push('withOrganizacao')
    ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
      idOrganizacao: 'org-001',
      idUsuario: 'usr-001',
    }
    await cb({})
  }),
}))

vi.mock('../../../../../../servicos-global/produto/pedido/server/src/services/smartImportParceirosService.js', () => ({
  resolverParceirosSmartImport: (...args: unknown[]) => {
    callOrder.push('resolverParceirosSmartImport')
    return mockResolverParceiros(...args)
  },
}))

vi.mock('../../../../../../servicos-global/produto/pedido/server/src/services/smartImportService.js', () => ({
  criarSmartImportService: vi.fn(() => ({
    confirmar: (...args: unknown[]) => {
      callOrder.push('service.confirmar')
      return mockConfirmar(...args)
    },
  })),
  prepararLinhasFiltradasConfirmacao: (...args: unknown[]) => mockPrepararLinhas(...args),
}))

vi.mock('../../../../../../servicos-global/produto/pedido/server/src/permissoes.js', () => ({
  exigirPermissao: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}))

import { smartImportRouter } from '../../../../../../servicos-global/produto/pedido/server/src/routes/importacoes-inteligentes-pedido.js'
import { AppError } from '../../../../../../servicos-global/produto/pedido/server/src/errors/AppError.js'

let app: express.Application

function injetarOrganizacao(req: Request, _res: Response, next: NextFunction) {
  ;(req as unknown as { organizacao: { idOrganizacao: string; idUsuario: string } }).organizacao = {
    idOrganizacao: 'org-001',
    idUsuario: 'usr-001',
  }
  next()
}

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } })
}

const payloadValido = {
  preview_id: 'org-001-hash-123',
  mapeamento_confirmado: [],
  decisoes_duplicatas: {},
  linhas_incluidas: [1],
  salvar_mapeamento: false,
  linhas: [{
    linha_arquivo: 1,
    numero_pedido: 'D-1382',
    status: 'ok',
    alertas: [],
    dados: {
      numero_pedido: 'D-1382',
      part_number_item: 'PN-1',
      descricao_item: 'Item',
      quantidade_inicial_item: 1,
      nome_fabricante: 'KONGSBERG',
    },
  }],
}

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use(injetarOrganizacao)
  app.use('/api/v1/pedidos/importacoes-inteligentes', smartImportRouter)
  app.use(errorHandler)
})

beforeEach(() => {
  vi.clearAllMocks()
  callOrder.length = 0
  mockPrepararLinhas.mockReturnValue([{
    linha_arquivo: 1,
    numero_pedido: 'D-1382',
    status: 'ok',
    alertas: [],
    dados: payloadValido.linhas[0].dados,
  }])
  mockResolverParceiros.mockResolvedValue(new Map([
    ['D-1382', {
      tipo_operacao: 'importacao',
      suid_exportador: 'suid_exp',
      suid_importador: 'suid_imp',
      suid_fabricante: 'suid_fab',
      snapshots: [],
      nomesItem: { nome_exportador_item: 'DETROIT', nome_importador_item: null, nome_fabricante_item: null },
    }],
  ]))
  mockConfirmar.mockResolvedValue({
    criados: 1,
    atualizados: 0,
    pulados: 0,
    erros: [],
    ids_criados: ['pedi_new'],
  })
})

describe('POST /importacoes-inteligentes/confirmar — Happy path', () => {
  it('F-CNF-01: payload válido retorna 200 com shape esperado', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/importacoes-inteligentes/confirmar')
      .send(payloadValido)

    expect(res.status).toBe(200)
    expect(res.body.criados).toBe(1)
    expect(res.body.erros).toEqual([])
  })

  it('F-CNF-02: resolve parceiros antes de withOrganizacao', async () => {
    await request(app)
      .post('/api/v1/pedidos/importacoes-inteligentes/confirmar')
      .send(payloadValido)

    expect(callOrder.indexOf('resolverParceirosSmartImport')).toBeLessThan(
      callOrder.indexOf('withOrganizacao'),
    )
  })

  it('F-CNF-03: repassa parceirosPorNumero ao service.confirmar', async () => {
    await request(app)
      .post('/api/v1/pedidos/importacoes-inteligentes/confirmar')
      .send(payloadValido)

    expect(mockConfirmar).toHaveBeenCalledTimes(1)
    const parceirosArg = mockConfirmar.mock.calls[0][4] as Map<string, unknown>
    expect(parceirosArg.get('D-1382')).toBeDefined()
  })
})

describe('POST /importacoes-inteligentes/confirmar — Validação Zod', () => {
  it('F-CNF-10: body vazio retorna 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/importacoes-inteligentes/confirmar')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('F-CNF-11: preview_id ausente retorna 400', async () => {
    const { preview_id: _p, ...semPreview } = payloadValido
    const res = await request(app)
      .post('/api/v1/pedidos/importacoes-inteligentes/confirmar')
      .send(semPreview)

    expect(res.status).toBe(400)
  })
})

describe('POST /importacoes-inteligentes/confirmar — Segurança', () => {
  it('F-CNF-20: preview_id de outro tenant retorna 403', async () => {
    const res = await request(app)
      .post('/api/v1/pedidos/importacoes-inteligentes/confirmar')
      .send({ ...payloadValido, preview_id: 'org-OUTRO-hash-123' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('UNAUTHORIZED_PREVIEW')
  })

  it('F-CNF-21: falha Cadastros propaga erro', async () => {
    mockResolverParceiros.mockRejectedValueOnce(
      new AppError('Serviço Cadastros indisponível', 503, 'SERVICE_UNAVAILABLE'),
    )

    const res = await request(app)
      .post('/api/v1/pedidos/importacoes-inteligentes/confirmar')
      .send(payloadValido)

    expect(res.status).toBe(503)
  })
})
