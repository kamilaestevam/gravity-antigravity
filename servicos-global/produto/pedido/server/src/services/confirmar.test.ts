/**
 * confirmar.test.ts — Testes unitários do SmartImportService.confirmar()
 *
 * Usa payload.linhas (fallback stateless) para evitar dependência do previewCache.
 * Mocka o Prisma client via objeto simples.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SmartImportService } from './smartImportService.js'
import type { SmartImportConfirmar, SmartImportLinha } from './smartImportService.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

const TENANT = 'tenant-test'
const USER   = 'user-001'
const PREVIEW_ID = `${TENANT}-abc123hash-1700000000000`

function criarLinha(overrides: Partial<SmartImportLinha> = {}): SmartImportLinha {
  return {
    linha_arquivo: 2,
    numero_pedido: 'PO-TEST-001',
    status: 'ok',
    alertas: [],
    dados: {
      numero_pedido: 'PO-TEST-001',
      exportador: 'Supplier Ltd.',
      moeda_pedido: 'USD',
      part_number: 'PART-001',
      descricao_item: 'Test product',
      quantidade_inicial_pedido: 100,
      valor_por_unidade_item: 10.50,
    },
    ...overrides,
  }
}

function criarPayload(overrides: Partial<SmartImportConfirmar> = {}): SmartImportConfirmar {
  return {
    preview_id: PREVIEW_ID,
    mapeamento_confirmado: [],
    decisoes_duplicatas: {},
    linhas_incluidas: [2],
    salvar_mapeamento: false,
    linhas: [criarLinha()],
    ...overrides,
  }
}

// ── Mock DB ────────────────────────────────────────────────────────────────────

function criarMockDb(overrides: Record<string, unknown> = {}) {
  const txBase = {
    pedido: {
      create: vi.fn().mockResolvedValue({ id: 'pedi_id_0000001/26' }),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({ id: 'pedi_id_0000001/26' }),
    },
    pedidoItem: {
      create: vi.fn().mockResolvedValue({ id: 'pite_id_0000001/26' }),
    },
  }

  const db = {
    $transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      await fn(txBase)
    }),
    mapeamentoColunaPedido: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    ...overrides,
  }

  return { db, txBase }
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('SmartImportService.confirmar', () => {
  it('rejeita preview_id de outro tenant', async () => {
    const { db } = criarMockDb()
    const service = new SmartImportService(db)
    const payload = criarPayload({ preview_id: 'outro-tenant-abc-123' })

    await expect(service.confirmar(TENANT, USER, payload)).rejects.toThrow('Preview nao pertence')
  })

  it('cria pedido e retorna criados=1', async () => {
    const { db, txBase } = criarMockDb()
    const service = new SmartImportService(db)
    const payload = criarPayload()

    const resultado = await service.confirmar(TENANT, USER, payload)

    expect(resultado.criados).toBe(1)
    expect(resultado.atualizados).toBe(0)
    expect(resultado.pulados).toBe(0)
    expect(resultado.erros).toHaveLength(0)
    expect(txBase.pedido.create).toHaveBeenCalledOnce()
  })

  it('pula linha quando decisao e "pular"', async () => {
    const { db, txBase } = criarMockDb()
    const service = new SmartImportService(db)
    const payload = criarPayload({
      decisoes_duplicatas: { 'PO-TEST-001': 'pular' },
    })

    const resultado = await service.confirmar(TENANT, USER, payload)

    expect(resultado.pulados).toBe(1)
    expect(resultado.criados).toBe(0)
    expect(txBase.pedido.create).not.toHaveBeenCalled()
  })

  it('atualiza pedido existente quando decisao e "sobrescrever"', async () => {
    const { db, txBase } = criarMockDb()
    txBase.pedido.findFirst.mockResolvedValueOnce({ id: 'pedi_existente' })

    const service = new SmartImportService(db)
    const payload = criarPayload({
      decisoes_duplicatas: { 'PO-TEST-001': 'sobrescrever' },
    })

    const resultado = await service.confirmar(TENANT, USER, payload)

    expect(resultado.atualizados).toBe(1)
    expect(resultado.criados).toBe(0)
    expect(txBase.pedido.update).toHaveBeenCalledOnce()
  })

  it('registra erro para linha com valor_por_unidade_item negativo', async () => {
    const { db } = criarMockDb()
    const service = new SmartImportService(db)
    const linhaComValorNegativo = criarLinha({
      dados: {
        numero_pedido: 'PO-TEST-NEG',
        part_number: 'PART-001',
        quantidade_inicial_pedido: 10,
        valor_por_unidade_item: -5.00,
      },
      numero_pedido: 'PO-TEST-NEG',
    })

    const payload = criarPayload({
      linhas: [linhaComValorNegativo],
    })

    const resultado = await service.confirmar(TENANT, USER, payload)

    expect(resultado.erros).toHaveLength(1)
    expect(resultado.erros[0].motivo).toMatch(/negativo/i)
    expect(resultado.criados).toBe(0)
  })

  it('exclui linhas nao incluidas no linhas_incluidas', async () => {
    const { db, txBase } = criarMockDb()
    const service = new SmartImportService(db)

    const linhas = [
      criarLinha({ linha_arquivo: 2, numero_pedido: 'PO-001', dados: { numero_pedido: 'PO-001', part_number: 'P1', quantidade_inicial_pedido: 1 } }),
      criarLinha({ linha_arquivo: 3, numero_pedido: 'PO-002', dados: { numero_pedido: 'PO-002', part_number: 'P2', quantidade_inicial_pedido: 1 } }),
    ]

    const payload = criarPayload({
      linhas,
      linhas_incluidas: [2], // Apenas linha 2
    })

    const resultado = await service.confirmar(TENANT, USER, payload)

    // Linha 3 foi excluída da seleção — não deve aparecer nos erros nem criados
    expect(resultado.criados).toBe(1)
    expect(resultado.erros).toHaveLength(0)
    expect(txBase.pedido.create).toHaveBeenCalledOnce()
  })

  it('retorna ids_criados com os IDs gerados', async () => {
    const { db } = criarMockDb()
    const service = new SmartImportService(db)
    const payload = criarPayload()

    const resultado = await service.confirmar(TENANT, USER, payload)

    expect(resultado.ids_criados).toHaveLength(1)
    expect(typeof resultado.ids_criados[0]).toBe('string')
    expect(resultado.ids_criados[0]).toMatch(/^pedi_/)
  })

  it('captura erros do banco e registra na linha', async () => {
    const { db } = criarMockDb()
    // Forçar o $transaction a lançar erro no create
    db.$transaction.mockImplementationOnce(async (fn: (tx: unknown) => Promise<void>) => {
      const tx = {
        pedido: {
          create: vi.fn().mockRejectedValue(new Error('Unique constraint violation')),
          findFirst: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
        pedidoItem: { create: vi.fn() },
      }
      await fn(tx)
    })

    const service = new SmartImportService(db)
    const payload = criarPayload()

    const resultado = await service.confirmar(TENANT, USER, payload)

    expect(resultado.erros).toHaveLength(1)
    expect(resultado.erros[0].motivo).toContain('Unique constraint')
  })
})
