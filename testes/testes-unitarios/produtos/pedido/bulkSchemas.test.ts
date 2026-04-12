// @vitest-environment node
/**
 * bulkSchemas.test.ts — Testes unitários das funções de validação bulk
 *
 * Cobre:
 *   detectarTiposMistos — lógica síncrona de detecção de mix de tipos
 *   assertTiposHomogeneos — refinement assíncrono com prisma mockado
 *
 * Nota: prisma é mockado aqui porque este é um teste UNITÁRIO da lógica
 * de refinement, não do banco. O isolamento real de tenant é testado nos
 * testes funcionais de bulk-tipo-operacao.test.ts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import {
  detectarTiposMistos,
  assertTiposHomogeneos,
} from '../../../../produto/pedido/server/src/shared/bulkSchemas.js'

// ── detectarTiposMistos ───────────────────────────────────────────────────────

describe('detectarTiposMistos', () => {
  it('array vazio → false', () => {
    expect(detectarTiposMistos([])).toBe(false)
  })

  it('um único tipo importacao → false', () => {
    expect(detectarTiposMistos(['importacao'])).toBe(false)
  })

  it('todos exportacao → false', () => {
    expect(detectarTiposMistos(['exportacao', 'exportacao', 'exportacao'])).toBe(false)
  })

  it('mix de importacao e exportacao → true', () => {
    expect(detectarTiposMistos(['importacao', 'exportacao'])).toBe(true)
  })

  it('mix com duplicatas → true', () => {
    expect(detectarTiposMistos(['importacao', 'importacao', 'exportacao', 'exportacao'])).toBe(true)
  })

  it('todos importacao com duplicatas → false', () => {
    expect(detectarTiposMistos(['importacao', 'importacao', 'importacao'])).toBe(false)
  })

  it('um único tipo exportacao → false', () => {
    expect(detectarTiposMistos(['exportacao'])).toBe(false)
  })

  it('três tipos distintos → true', () => {
    // tipos inesperados mas a lógica deve funcionar igual
    expect(detectarTiposMistos(['importacao', 'exportacao', 'outro'])).toBe(true)
  })
})

// ── assertTiposHomogeneos ─────────────────────────────────────────────────────

/**
 * Cria um ctx mock que captura as issues adicionadas via ctx.addIssue()
 */
function criarCtxMock() {
  const issues: z.ZodIssue[] = []
  const ctx: z.RefinementCtx = {
    addIssue: (issue: z.ZodIssueOptionalMessage) => {
      issues.push(issue as z.ZodIssue)
    },
    path: [],
  }
  return { ctx, issues }
}

/**
 * Cria um prisma mock com pedido.findMany configurável.
 */
function criarPrismaMock(registros: Array<{ id: string; tipo_operacao: string | null }>) {
  return {
    pedido: {
      findMany: vi.fn().mockResolvedValue(registros),
    },
  }
}

describe('assertTiposHomogeneos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ids vazios → não consulta banco nem adiciona issue', async () => {
    const { ctx, issues } = criarCtxMock()
    const prisma = criarPrismaMock([])

    await assertTiposHomogeneos([], prisma as any, 'tenant-abc', ctx)

    expect(issues).toHaveLength(0)
    expect(prisma.pedido.findMany).not.toHaveBeenCalled()
  })

  it('todos importacao → não adiciona issue', async () => {
    const { ctx, issues } = criarCtxMock()
    const prisma = criarPrismaMock([
      { id: 'p1', tipo_operacao: 'importacao' },
      { id: 'p2', tipo_operacao: 'importacao' },
    ])

    await assertTiposHomogeneos(['p1', 'p2'], prisma as any, 'tenant-abc', ctx)

    expect(issues).toHaveLength(0)
  })

  it('todos exportacao → não adiciona issue', async () => {
    const { ctx, issues } = criarCtxMock()
    const prisma = criarPrismaMock([
      { id: 'p1', tipo_operacao: 'exportacao' },
      { id: 'p2', tipo_operacao: 'exportacao' },
      { id: 'p3', tipo_operacao: 'exportacao' },
    ])

    await assertTiposHomogeneos(['p1', 'p2', 'p3'], prisma as any, 'tenant-abc', ctx)

    expect(issues).toHaveLength(0)
  })

  it('mix de importacao e exportacao → adiciona issue com mensagem correta', async () => {
    const { ctx, issues } = criarCtxMock()
    const prisma = criarPrismaMock([
      { id: 'p1', tipo_operacao: 'importacao' },
      { id: 'p2', tipo_operacao: 'exportacao' },
    ])

    await assertTiposHomogeneos(['p1', 'p2'], prisma as any, 'tenant-abc', ctx)

    expect(issues).toHaveLength(1)
    expect(issues[0].code).toBe(z.ZodIssueCode.custom)
    expect(issues[0].message).toContain('importação e exportação')
  })

  it('banco retorna zero registros → não adiciona issue', async () => {
    const { ctx, issues } = criarCtxMock()
    const prisma = criarPrismaMock([])

    await assertTiposHomogeneos(['p1', 'p2'], prisma as any, 'tenant-abc', ctx)

    expect(issues).toHaveLength(0)
  })

  it('registros com tipo_operacao null são ignorados no mix', async () => {
    const { ctx, issues } = criarCtxMock()
    // Se todos os tipos não-nulos são iguais, não deve adicionar issue
    const prisma = criarPrismaMock([
      { id: 'p1', tipo_operacao: 'importacao' },
      { id: 'p2', tipo_operacao: null },
    ])

    await assertTiposHomogeneos(['p1', 'p2'], prisma as any, 'tenant-abc', ctx)

    expect(issues).toHaveLength(0)
  })

  it('tenant_id é sempre passado na query ao banco', async () => {
    const { ctx } = criarCtxMock()
    const prisma = criarPrismaMock([
      { id: 'p1', tipo_operacao: 'importacao' },
    ])
    const TENANT_ID = 'tenant-xpto-123'

    await assertTiposHomogeneos(['p1'], prisma as any, TENANT_ID, ctx)

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenant_id: TENANT_ID,
        }),
      })
    )
  })

  it('select mínimo: busca apenas id e tipo_operacao', async () => {
    const { ctx } = criarCtxMock()
    const prisma = criarPrismaMock([
      { id: 'p1', tipo_operacao: 'importacao' },
    ])

    await assertTiposHomogeneos(['p1'], prisma as any, 'tenant-abc', ctx)

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: { id: true, tipo_operacao: true },
      })
    )
  })

  it('ids filtrados corretamente no where.id.in', async () => {
    const { ctx } = criarCtxMock()
    const prisma = criarPrismaMock([
      { id: 'p1', tipo_operacao: 'importacao' },
      { id: 'p2', tipo_operacao: 'importacao' },
    ])
    const ids = ['p1', 'p2']

    await assertTiposHomogeneos(ids, prisma as any, 'tenant-abc', ctx)

    expect(prisma.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ids },
        }),
      })
    )
  })
})
