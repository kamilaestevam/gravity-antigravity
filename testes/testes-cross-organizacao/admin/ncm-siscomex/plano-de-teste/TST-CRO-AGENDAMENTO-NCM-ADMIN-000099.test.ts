// @vitest-environment node
// TST-CRO-AGENDAMENTO-NCM-ADMIN-000099 — singleton global ncm_sync_agendamento (sem id_organizacao)
/// <reference types="vitest/globals" />

import { vi, describe, it, expect, beforeEach } from 'vitest'

type AgendamentoRow = {
  id_ncm_sync_agendamento: string
  ativo_ncm_sync_agendamento: boolean
  cron_expressao_ncm_sync_agendamento: string
  notificadores_ncm_sync_agendamento: unknown[]
}

const { banco, mockUpsert, mockFindUnique } = vi.hoisted(() => {
  const banco: { row: AgendamentoRow | null } = { row: null }
  return {
    banco,
    mockFindUnique: vi.fn(() => Promise.resolve(banco.row)),
    mockUpsert: vi.fn((args: { create: AgendamentoRow; update: Partial<AgendamentoRow> }) => {
      if (!banco.row) {
        banco.row = { ...args.create }
      } else {
        banco.row = { ...banco.row, ...args.update }
      }
      return Promise.resolve({
        ...banco.row,
        data_atualizacao_ncm_sync_agendamento: new Date(),
      })
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

import express from 'express'
import request from 'supertest'
import { adminNcmSyncRouter } from '../../../../../servicos-global/cadastros/server/src/routes/adminNcmSync.js'

const app = express()
app.use(express.json())
app.use('/api/v1/cadastros/admin/ncm-sync', adminNcmSyncRouter)

beforeEach(() => {
  banco.row = null
  vi.clearAllMocks()
})

describe('TST-CRO-AGENDAMENTO-NCM-ADMIN-000099 — singleton global cross-org', () => {
  it('C1 — PUT de org A grava cron no singleton default', async () => {
    await request(app)
      .put('/api/v1/cadastros/admin/ncm-sync/agendamento')
      .send({ ativo: true, cron_expressao: '00 04 * * *', notificadores: [] })

    expect(banco.row?.id_ncm_sync_agendamento).toBe('default')
    expect(banco.row?.cron_expressao_ncm_sync_agendamento).toBe('00 04 * * *')
  })

  it('C2 — GET de org B lê a mesma config global', async () => {
    banco.row = {
      id_ncm_sync_agendamento: 'default',
      ativo_ncm_sync_agendamento: true,
      cron_expressao_ncm_sync_agendamento: '00 04 * * *',
      notificadores_ncm_sync_agendamento: [],
    }
    const res = await request(app).get('/api/v1/cadastros/admin/ncm-sync/agendamento')
    expect(res.status).toBe(200)
    expect(res.body.cron_expressao).toBe('00 04 * * *')
  })

  it('C3 — upsert nunca inclui id_organizacao (catálogo global)', async () => {
    await request(app)
      .put('/api/v1/cadastros/admin/ncm-sync/agendamento')
      .send({ ativo: false, cron_expressao: '00 02 * * *', notificadores: [] })

    const upsertArg = mockUpsert.mock.calls[0][0]
    expect(JSON.stringify(upsertArg)).not.toMatch(/id_organizacao/)
    expect(upsertArg.where).toEqual({ id_ncm_sync_agendamento: 'default' })
  })

  it('C4 — segundo PUT sobrescreve o singleton (último valor vence)', async () => {
    await request(app)
      .put('/api/v1/cadastros/admin/ncm-sync/agendamento')
      .send({ ativo: true, cron_expressao: '00 05 * * *', notificadores: [] })
    await request(app)
      .put('/api/v1/cadastros/admin/ncm-sync/agendamento')
      .send({ ativo: true, cron_expressao: '00 06 * * *', notificadores: [] })

    const res = await request(app).get('/api/v1/cadastros/admin/ncm-sync/agendamento')
    expect(res.body.cron_expressao).toBe('00 06 * * *')
    expect(mockUpsert).toHaveBeenCalledTimes(2)
  })
})
