// @vitest-environment node
// TST-FUN-AGENDAMENTO-NCM-ADMIN-000097 — PUT/GET agendamento NCM (proxy Configurador + Cadastros)
/// <reference types="vitest/globals" />

import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

vi.mock('../../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = (globalThis as Record<string, unknown>)['__testAuth']
    next()
  },
}))

vi.mock('../../../../../servicos-global/servicos-plataforma/historico-global/server/services/audit.service.js', () => ({
  AuditService: { log: vi.fn().mockResolvedValue(undefined) },
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { adminNcmIntegracaoRouter } from '../../../../../servicos-global/configurador/server/routes/admin-ncm-integracao.js'
import { AppError } from '../../../../../servicos-global/configurador/server/lib/appError.js'

const appProxy = express()
appProxy.use(express.json())
appProxy.use('/api/v1/admin/integracao-ncm', adminNcmIntegracaoRouter)
appProxy.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  res.status(500).json({ error: { message: 'Erro interno' } })
})

type AuthShape = {
  id_usuario: string
  id_organizacao: string
  tipo_usuario: string
  nome_usuario: string
  clerkUserId: string
}
function setAuth(auth: AuthShape) {
  ;(globalThis as Record<string, unknown>)['__testAuth'] = auth
}

const SUPER_ADMIN: AuthShape = {
  id_usuario: 'usr_sa',
  id_organizacao: 'org_gravity',
  tipo_usuario: 'SUPER_ADMIN',
  nome_usuario: 'Super Admin',
  clerkUserId: 'clerk_sa',
}
const ADMIN_GRAVITY: AuthShape = {
  id_usuario: 'usr_ad',
  id_organizacao: 'org_gravity',
  tipo_usuario: 'ADMIN',
  nome_usuario: 'Admin Gravity',
  clerkUserId: 'clerk_ad',
}

const PAYLOAD_VALIDO = {
  ativo: true,
  cron_expressao: '00 02 * * *',
  notificadores: [] as unknown[],
}

type AgendamentoState = {
  ativo: boolean
  cron_expressao: string
  notificadores: unknown[]
  atualizado_em: string | null
}

const proxyState: { current: AgendamentoState } = {
  current: { ativo: false, cron_expressao: '0 2 * * *', notificadores: [], atualizado_em: null },
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.CHAVE_INTERNA_SERVICO = 'test-key'
  process.env.CADASTROS_SERVICE_URL = 'http://cadastros.test'
  proxyState.current = { ativo: false, cron_expressao: '0 2 * * *', notificadores: [], atualizado_em: null }

  mockFetch.mockImplementation(async (_url: string, opts?: RequestInit) => {
    const method = opts?.method ?? 'GET'
    if (method === 'PUT' && opts?.body) {
      const body = JSON.parse(String(opts.body)) as AgendamentoState
      proxyState.current = {
        ativo: body.ativo,
        cron_expressao: body.cron_expressao,
        notificadores: body.notificadores ?? [],
        atualizado_em: '2026-06-11T18:00:00.000Z',
      }
      return {
        status: 200,
        json: async () => ({ sucesso: true, ...proxyState.current }),
      }
    }
    return {
      status: 200,
      json: async () => ({ ...proxyState.current, proxima_execucao: null }),
    }
  })
})

describe('TST-FUN-AGENDAMENTO-NCM-ADMIN-000097 — proxy Configurador', () => {
  it('F1 — GET /agendamento repassa resposta do Cadastros', async () => {
    setAuth(SUPER_ADMIN)
    const res = await request(appProxy).get('/api/v1/admin/integracao-ncm/agendamento')
    expect(res.status).toBe(200)
    expect(res.body.cron_expressao).toBe('0 2 * * *')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/cadastros/admin/ncm-sync/agendamento'),
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('F2 — PUT SUPER_ADMIN envia body ao Cadastros e retorna 200', async () => {
    setAuth(SUPER_ADMIN)
    const res = await request(appProxy)
      .put('/api/v1/admin/integracao-ncm/agendamento')
      .send(PAYLOAD_VALIDO)
    expect(res.status).toBe(200)
    expect(res.body.sucesso).toBe(true)
    expect(mockFetch.mock.calls[0][1]?.body).toContain('"cron_expressao":"00 02 * * *"')
  })

  it('F3 — PUT ADMIN (não SUPER_ADMIN) retorna 403 no proxy', async () => {
    setAuth(ADMIN_GRAVITY)
    const res = await request(appProxy)
      .put('/api/v1/admin/integracao-ncm/agendamento')
      .send(PAYLOAD_VALIDO)
    expect(res.status).toBe(403)
    expect(res.body.error.message).toMatch(/Super Admin/i)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('F9 — round-trip proxy PUT→GET retorna valores persistidos', async () => {
    setAuth(SUPER_ADMIN)
    await request(appProxy)
      .put('/api/v1/admin/integracao-ncm/agendamento')
      .send(PAYLOAD_VALIDO)

    const get = await request(appProxy).get('/api/v1/admin/integracao-ncm/agendamento')
    expect(get.status).toBe(200)
    expect(get.body.ativo).toBe(true)
    expect(get.body.cron_expressao).toBe('00 02 * * *')
  })
})

type AgendamentoRow = {
  id_ncm_sync_agendamento: string
  ativo_ncm_sync_agendamento: boolean
  cron_expressao_ncm_sync_agendamento: string
  notificadores_ncm_sync_agendamento: unknown[]
  data_atualizacao_ncm_sync_agendamento: Date
}

const { banco, mockUpsert, mockFindUnique } = vi.hoisted(() => {
  const banco: { row: AgendamentoRow | null } = { row: null }
  return {
    banco,
    mockFindUnique: vi.fn(() => Promise.resolve(banco.row)),
    mockUpsert: vi.fn((args: {
      create: Omit<AgendamentoRow, 'data_atualizacao_ncm_sync_agendamento'>
      update: Partial<AgendamentoRow>
    }) => {
      if (!banco.row) {
        banco.row = {
          ...args.create,
          data_atualizacao_ncm_sync_agendamento: new Date('2026-06-11T18:00:00.000Z'),
        }
      } else {
        banco.row = {
          ...banco.row,
          ...args.update,
          data_atualizacao_ncm_sync_agendamento: new Date('2026-06-11T19:00:00.000Z'),
        }
      }
      return Promise.resolve(banco.row)
    }),
  }
})

vi.mock('../../../../../servicos-global/cadastros/server/src/lib/prisma.js', () => ({
  prisma: {
    ncmSyncAgendamento: { upsert: mockUpsert, findUnique: mockFindUnique },
    ncmSyncLog: { findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn(), updateMany: vi.fn() },
    ncmSync: { count: vi.fn() },
  },
}))

vi.mock('../../../../../servicos-global/cadastros/server/src/initNcmSync.js', () => ({
  reagendarJob: vi.fn(),
}))

vi.mock('../../../../../servicos-global/cadastros/server/src/middleware/internal-key.js', () => ({
  requireInternalKey: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

import { adminNcmSyncRouter } from '../../../../../servicos-global/cadastros/server/src/routes/adminNcmSync.js'
import { AppError as CadastrosAppError } from '../../../../../servicos-global/cadastros/server/src/lib/app-error.js'

const appCadastros = express()
appCadastros.use(express.json())
appCadastros.use('/api/v1/cadastros/admin/ncm-sync', adminNcmSyncRouter)
appCadastros.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof CadastrosAppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  res.status(500).json({ error: { message: 'Erro interno' } })
})

describe('TST-FUN-AGENDAMENTO-NCM-ADMIN-000097 — Cadastros adminNcmSync', () => {
  beforeEach(() => {
    banco.row = null
    mockUpsert.mockClear()
    mockFindUnique.mockClear()
  })

  it('F4 — PUT body inválido (cron curto) → 400', async () => {
    const res = await request(appCadastros)
      .put('/api/v1/cadastros/admin/ncm-sync/agendamento')
      .send({ ativo: true, cron_expressao: 'bad', notificadores: [] })
    expect(res.status).toBe(400)
  })

  it('F5 — GET sem registro retorna defaults em memória', async () => {
    const res = await request(appCadastros).get('/api/v1/cadastros/admin/ncm-sync/agendamento')
    expect(res.status).toBe(200)
    expect(res.body.ativo).toBe(false)
    expect(res.body.cron_expressao).toBe('0 2 * * *')
  })

  it('F6 — PUT upsert persiste singleton default', async () => {
    const res = await request(appCadastros)
      .put('/api/v1/cadastros/admin/ncm-sync/agendamento')
      .send(PAYLOAD_VALIDO)
    expect(res.status).toBe(200)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_ncm_sync_agendamento: 'default' },
      }),
    )
  })

  it('F7 — GET após persistência retorna valores do banco', async () => {
    await request(appCadastros)
      .put('/api/v1/cadastros/admin/ncm-sync/agendamento')
      .send(PAYLOAD_VALIDO)

    const res = await request(appCadastros).get('/api/v1/cadastros/admin/ncm-sync/agendamento')
    expect(res.status).toBe(200)
    expect(res.body.ativo).toBe(true)
    expect(res.body.cron_expressao).toBe('00 02 * * *')
  })

  it('F8 — round-trip PUT→GET persiste cron Diário 02h (bug reportado)', async () => {
    const put = await request(appCadastros)
      .put('/api/v1/cadastros/admin/ncm-sync/agendamento')
      .send(PAYLOAD_VALIDO)
    expect(put.status).toBe(200)

    const get = await request(appCadastros).get('/api/v1/cadastros/admin/ncm-sync/agendamento')
    expect(get.status).toBe(200)
    expect(get.body).toMatchObject({
      ativo: true,
      cron_expressao: '00 02 * * *',
    })
    expect(banco.row?.id_ncm_sync_agendamento).toBe('default')
  })
})
