/**
 * edicaoEmMassaService.test.ts — Testes unitários do EdicaoEmMassaService
 *
 * Cobre:
 *   - Tradução de aliases do frontend para campos Prisma reais
 *   - Persistência correta dos valores no banco (confirmar)
 *   - Preview exibindo valores corretos (lendo campo Prisma, não alias)
 *   - tenant_id obrigatório no where do UPDATE de item
 *   - Contadores refletem apenas operações bem-sucedidas
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { EdicaoEmMassaService } from './edicaoEmMassaService.js'

const TENANT = 'tenant-test'
const USER   = 'user-001'

// ── Helpers ────────────────────────────────────────────────────────────────────

function criarPedido(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pedido-001',
    tenant_id: TENANT,
    numero_pedido: 'PO-001',
    detalhes_operacionais: null,
    itens: [
      {
        id: 'item-001',
        tenant_id: TENANT,
        // Nomes reais do Prisma (não aliases do frontend)
        quantidade_inicial_pedido:    100,
        quantidade_transferida_pedido: 20,
        quantidade_pronta_pedido:      10,
        quantidade_cancelada_pedido:    5,
        quantidade_atual_pedido:       75,
        valor_por_unidade_item:       9.99,
      },
    ],
    ...overrides,
  }
}

interface TxMock {
  pedidoItem:      { update: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> }
  pedido:          { update: ReturnType<typeof vi.fn> }
  pedidoHistorico: { createMany: ReturnType<typeof vi.fn> }
}

function criarDbMock(pedido = criarPedido()) {
  const itemUpdateMock = vi.fn().mockResolvedValue({ id: 'item-001' })
  const pedidoUpdateMock = vi.fn().mockResolvedValue({ id: 'pedido-001' })
  const pedidoHistoricoCreateManyMock = vi.fn().mockResolvedValue({})
  const itemFindManyMock = vi.fn().mockResolvedValue(pedido.itens)

  const tx: TxMock = {
    pedidoItem: { update: itemUpdateMock, findMany: itemFindManyMock },
    pedido: { update: pedidoUpdateMock },
    pedidoHistorico: { createMany: pedidoHistoricoCreateManyMock },
  }

  const dbBase = {
    pedido: {
      findMany: vi.fn().mockResolvedValue([pedido]),
    },
    $transaction: vi.fn().mockImplementation((fn: (tx: TxMock) => Promise<unknown>) => fn(tx)),
  }
  const db = dbBase as unknown as PrismaClient

  return { db, tx, itemUpdateMock, pedidoUpdateMock, itemFindManyMock }
}

// ── Testes ────────────────────────────────────────────────────────────────────

const service = new EdicaoEmMassaService()

describe('EdicaoEmMassaService — tradução de aliases', () => {

  describe('confirmar()', () => {

    it('traduz alias "quantidade_inicial_pedido" para "quantidade_inicial_pedido" no UPDATE', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(TENANT, USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_inicial_pedido', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 200 }],
        nivel: 'item',
      })

      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantidade_inicial_pedido: 200 }),
        })
      )
    })

    it('traduz alias "quantidade_transferida_item" para "quantidade_transferida_pedido" no UPDATE', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(TENANT, USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_transferida_item', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 50 }],
        nivel: 'item',
      })

      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantidade_transferida_pedido: 50 }),
        })
      )
    })

    it('traduz alias "quantidade_pronta_total" para "quantidade_pronta_pedido" no UPDATE', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(TENANT, USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_pronta_total', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 30 }],
        nivel: 'item',
      })

      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantidade_pronta_pedido: 30 }),
        })
      )
    })

    it('traduz alias "quantidade_cancelada_pedido" para "quantidade_cancelada_pedido" no UPDATE', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(TENANT, USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_cancelada_pedido', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 0 }],
        nivel: 'item',
      })

      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantidade_cancelada_pedido: 0 }),
        })
      )
    })

    it('inclui tenant_id no where do UPDATE de item (tenant isolation)', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(TENANT, USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_inicial_pedido', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 200 }],
        nivel: 'item',
      })

      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenant_id: TENANT }),
        })
      )
    })

    it('retorna itensAtualizados = 1 quando o UPDATE retorna resultado', async () => {
      const { db } = criarDbMock()

      const resultado = await service.confirmar(TENANT, USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_inicial_pedido', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 200 }],
        nivel: 'item',
      })

      expect(resultado.itens_atualizados).toBe(1)
      expect(resultado.pedidos_atualizados).toBe(1)
    })

    it('aplica operação "somar" corretamente usando valor Prisma real', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(TENANT, USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_inicial_pedido', tipo: 'numero', nivel: 'item', operacao: 'somar', valor: 50 }],
        nivel: 'item',
      })

      // valor atual = 100 (de quantidade_inicial_pedido), soma 50 = 150
      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantidade_inicial_pedido: 150 }),
        })
      )
    })

  })

  describe('preview()', () => {

    it('lê o valor atual via campo Prisma real (não alias) para exibição', async () => {
      const pedido = criarPedido()
      const { db } = criarDbMock(pedido)

      const resultado = await service.preview(TENANT, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_inicial_pedido', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 200 }],
        nivel: 'item',
      })

      const campo = resultado.campos[0]
      // Deve exibir "100" (valor real do banco), não "" (alias inexistente)
      expect(campo.valores_distintos).toContain('100')
      expect(campo.valores_distintos).not.toContain('')
    })

  })

  describe('validarCamposEditaveis()', () => {

    it('rejeita campo bloqueado de item com AppError', async () => {
      const { db } = criarDbMock()

      await expect(
        service.confirmar(TENANT, USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'quantidade_atual_pedido', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 0 }],
          nivel: 'item',
        })
      ).rejects.toThrow()
    })

    it('rejeita campo bloqueado de pedido com AppError', async () => {
      const { db } = criarDbMock()

      await expect(
        service.confirmar(TENANT, USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'valor_total_pedido', tipo: 'numero', nivel: 'pedido', operacao: 'substituir', valor: 0 }],
          nivel: 'pedido',
        })
      ).rejects.toThrow()
    })

  })

})
