/**
 * ncmSyncEngine.test.ts — Testes unitários do motor de sincronização NCM
 *
 * Cobre:
 *  - diff correto (adicionados / alterados / removidos)
 *  - buscarNcm por código parcial e por descrição
 *  - obterStatusSync quando há e quando não há syncs anteriores
 *  - falha no download → log com status ERROR
 */

import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest'
import { executarSync, buscarNcm, obterStatusSync } from '../../../servicos-global/tenant/ncm-sync/server/services/ncmSyncEngine.js'
import * as connector from '../../../servicos-global/tenant/ncm-sync/server/connectors/portalUnicoNcm.js'

// ── Mock do connector ─────────────────────────────────────────────────────────

vi.mock('../../../servicos-global/tenant/ncm-sync/server/connectors/portalUnicoNcm.js', () => ({
  baixarTabelaNcm: vi.fn(),
  validarNcm:      vi.fn(),
}))

const baixarTabelaNcm = connector.baixarTabelaNcm as MockedFunction<typeof connector.baixarTabelaNcm>

// ── Mock do Prisma ────────────────────────────────────────────────────────────

function makePrismaMock(existentes: Array<{ codigo: string; descricao: string; ativo: boolean }> = []) {
  const syncLogCreate = vi.fn().mockResolvedValue({ id: 'sync-test-001' })
  const syncLogUpdate = vi.fn().mockResolvedValue({})
  const ncmItemFindMany = vi.fn().mockResolvedValue(existentes)
  const ncmItemUpsert   = vi.fn().mockResolvedValue({})
  const ncmItemUpdateMany = vi.fn().mockResolvedValue({ count: 0 })
  const ncmSyncLogFindFirst = vi.fn().mockResolvedValue(null)
  const ncmItemCount = vi.fn().mockResolvedValue(0)

  return {
    ncmSyncLog: {
      create:    syncLogCreate,
      update:    syncLogUpdate,
      findFirst: ncmSyncLogFindFirst,
    },
    ncmItem: {
      findMany:   ncmItemFindMany,
      upsert:     ncmItemUpsert,
      updateMany: ncmItemUpdateMany,
      findUnique: vi.fn().mockResolvedValue(null),
      count:      ncmItemCount,
    },
    _mocks: { syncLogCreate, syncLogUpdate, ncmItemFindMany, ncmItemUpsert, ncmItemUpdateMany, ncmSyncLogFindFirst, ncmItemCount },
  } as unknown as Parameters<typeof executarSync>[0] & { _mocks: Record<string, ReturnType<typeof vi.fn>> }
}

const TENANT = 'tenant-test-001'

// ── Testes ────────────────────────────────────────────────────────────────────

describe('NcmSyncEngine — executarSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve registrar adicionados quando banco está vazio', async () => {
    baixarTabelaNcm.mockResolvedValue([
      { codigo: '84713019', descricao: 'Processador A', dataInicio: null, dataFim: null },
      { codigo: '85171210', descricao: 'Celular B',     dataInicio: null, dataFim: null },
    ])

    const prisma = makePrismaMock([])  // banco vazio
    const result = await executarSync(prisma, TENANT)

    expect(result.total).toBe(2)
    expect(result.adicionados).toBe(2)
    expect(result.alterados).toBe(0)
    expect(result.removidos).toBe(0)
    expect(prisma.ncmItem.upsert).toHaveBeenCalledTimes(2)
  })

  it('deve registrar alterados quando descrição muda', async () => {
    baixarTabelaNcm.mockResolvedValue([
      { codigo: '84713019', descricao: 'Descrição Nova', dataInicio: null, dataFim: null },
    ])

    const prisma = makePrismaMock([
      { codigo: '84713019', descricao: 'Descrição Antiga', ativo: true },
    ])

    const result = await executarSync(prisma, TENANT)

    expect(result.adicionados).toBe(0)
    expect(result.alterados).toBe(1)
    expect(result.removidos).toBe(0)
  })

  it('deve marcar como removidos os NCMs ausentes no Portal', async () => {
    baixarTabelaNcm.mockResolvedValue([
      { codigo: '84713019', descricao: 'Processador', dataInicio: null, dataFim: null },
    ])

    const prisma = makePrismaMock([
      { codigo: '84713019', descricao: 'Processador', ativo: true },
      { codigo: '99999999', descricao: 'NCM antigo',  ativo: true },  // não está no Portal
    ])

    const result = await executarSync(prisma, TENANT)

    expect(result.removidos).toBe(1)
    expect(prisma.ncmItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ codigo: { in: ['99999999'] } }),
        data:  expect.objectContaining({ ativo: false }),
      })
    )
  })

  it('deve salvar status ERROR no log quando download falha', async () => {
    baixarTabelaNcm.mockRejectedValue(new Error('Timeout'))

    const prisma = makePrismaMock([])

    await expect(executarSync(prisma, TENANT)).rejects.toThrow()

    expect(prisma.ncmSyncLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ERROR' }),
      })
    )
  })

  it('deve usar origem MANUAL quando disparado manualmente', async () => {
    baixarTabelaNcm.mockResolvedValue([
      { codigo: '84713019', descricao: 'Processador', dataInicio: null, dataFim: null },
    ])

    const prisma = makePrismaMock([])
    await executarSync(prisma, TENANT, { origem: 'MANUAL', disparadoPor: 'user-abc' })

    expect(prisma.ncmSyncLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ origem: 'MANUAL', disparado_por: 'user-abc' }),
      })
    )
  })
})

describe('NcmSyncEngine — buscarNcm', () => {
  it('deve buscar por código parcial', async () => {
    const prisma = makePrismaMock()
    ;(prisma.ncmItem.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { codigo: '84713019', descricao: 'Processador' },
    ])

    const result = await buscarNcm(prisma, TENANT, '8471', 10)

    expect(prisma.ncmItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ codigo: { startsWith: '8471' } }),
      })
    )
    expect(result).toHaveLength(1)
  })

  it('deve buscar por descrição (texto não numérico)', async () => {
    const prisma = makePrismaMock()
    ;(prisma.ncmItem.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { codigo: '85171210', descricao: 'Celular' },
    ])

    const result = await buscarNcm(prisma, TENANT, 'celular', 10)

    expect(prisma.ncmItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ descricao: { contains: 'celular', mode: 'insensitive' } }),
      })
    )
    expect(result).toHaveLength(1)
  })

  it('deve retornar array vazio para query vazia', async () => {
    const prisma = makePrismaMock()
    const result = await buscarNcm(prisma, TENANT, '', 10)
    expect(result).toEqual([])
    expect(prisma.ncmItem.findMany).not.toHaveBeenCalled()
  })
})

describe('NcmSyncEngine — obterStatusSync', () => {
  it('deve retornar nulls quando não há sync anterior', async () => {
    const prisma = makePrismaMock()
    ;(prisma.ncmSyncLog.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.ncmItem.count as ReturnType<typeof vi.fn>).mockResolvedValue(0)

    const status = await obterStatusSync(prisma, TENANT)

    expect(status.ultima_sync).toBeNull()
    expect(status.status).toBeNull()
    expect(status.total_ncms_ativos).toBe(0)
  })

  it('deve retornar dados corretos após sync bem-sucedido', async () => {
    const agora = new Date()
    const prisma = makePrismaMock()
    ;(prisma.ncmSyncLog.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      concluido_em: agora,
      status: 'SUCCESS',
      iniciado_em: new Date(agora.getTime() - 5000),
    })
    ;(prisma.ncmItem.count as ReturnType<typeof vi.fn>).mockResolvedValue(12345)

    const status = await obterStatusSync(prisma, TENANT)

    expect(status.ultima_sync).toEqual(agora)
    expect(status.status).toBe('SUCCESS')
    expect(status.total_ncms_ativos).toBe(12345)
    expect(status.ultima_duracao_ms).toBe(5000)
  })
})
