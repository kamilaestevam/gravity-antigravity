/**
 * edicaoEmMassaService.test.ts — Testes unitários do EdicaoEmMassaService
 *
 * Refatoração DDD-puro (Líder Técnico, 2026-05-12):
 *   - Sem ACL: frontend envia nome exato da coluna do Prisma
 *   - 5 argumentos no confirmar(): id_organizacao, id_usuario, nome_usuario, db, payload
 *   - Bloqueios e detalhes_operacionais usam nomes DDD
 */

import { describe, it, expect, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { EdicaoEmMassaService, AppError } from './edicaoEmMassaService.js'

const ID_ORG     = 'org-test'
const ID_USER    = 'user-001'
const NOME_USER  = 'Usuario Teste'

// ── Helpers ────────────────────────────────────────────────────────────────────

function criarPedido(overrides: Record<string, unknown> = {}) {
  return {
    id_pedido: 'pedido-001',
    id_organizacao: ID_ORG,
    id_workspace: 'ws-001',
    tipo_operacao_pedido: 'importacao',
    numero_pedido: 'PO-001',
    detalhes_operacionais_pedido: null,
    incoterm_pedido: 'FOB',
    itens_pedido: [
      {
        id_item: 'item-001',
        id_organizacao: ID_ORG,
        id_workspace: 'ws-001',
        id_pedido: 'pedido-001',
        quantidade_inicial_item:    100,
        quantidade_transferida_item: 20,
        quantidade_pronta_item:      10,
        quantidade_cancelada_item:    5,
        quantidade_atual_item:       75,
        valor_por_unidade_item:    9.99,
      },
    ],
    ...overrides,
  }
}

interface TxMock {
  pedidoItem: { update: ReturnType<typeof vi.fn> }
  pedido:     { update: ReturnType<typeof vi.fn> }
}

function criarDbMock(pedido = criarPedido()) {
  const itemUpdateMock = vi.fn().mockResolvedValue({ id_item: 'item-001' })
  const pedidoUpdateMock = vi.fn().mockResolvedValue({ id_pedido: 'pedido-001' })

  const tx: TxMock = {
    pedidoItem: { update: itemUpdateMock },
    pedido:     { update: pedidoUpdateMock },
  }

  const updateManyMock = vi.fn().mockResolvedValue({ count: 1 })
  const dbBase = {
    pedido: {
      findMany: vi.fn().mockResolvedValue([pedido]),
      updateMany: updateManyMock,
    },
    $transaction: vi.fn().mockImplementation((fn: (tx: TxMock) => Promise<unknown>) => fn(tx)),
  }
  const db = dbBase as unknown as PrismaClient

  return { db, tx, itemUpdateMock, pedidoUpdateMock, updateManyMock }
}

// ── Testes ────────────────────────────────────────────────────────────────────

const service = new EdicaoEmMassaService()

describe('EdicaoEmMassaService — DDD-puro', () => {

  describe('confirmar() — fast path (updateMany)', () => {

    it('atualiza pedido com nome DDD via updateMany quando todos os campos são substituir e diretos', async () => {
      const { db, updateManyMock } = criarDbMock()

      const resultado = await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'incoterm_pedido', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'pedido',
      })

      expect(updateManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ incoterm_pedido: 'CIF' }),
        })
      )
      expect(resultado.pedidos_atualizados).toBe(1)
    })
  })

  describe('confirmar() — slow path (item por item)', () => {

    it('atualiza item com nome DDD direto, sem ACL', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_inicial_item', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 200 }],
        nivel: 'item',
      })

      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_item: 'item-001', id_organizacao: ID_ORG }),
          data: expect.objectContaining({ quantidade_inicial_item: 200 }),
        })
      )
    })

    it('aplica operação somar usando valor atual da coluna DDD', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_inicial_item', tipo: 'numero', nivel: 'item', operacao: 'somar', valor: 50 }],
        nivel: 'item',
      })

      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantidade_inicial_item: 150 }), // 100 + 50
        })
      )
    })
  })

  describe('detalhes_operacionais_pedido — merge JSON', () => {

    it('grava chave em detalhes_operacionais_pedido quando campo é JSON (ex: nome_exportador)', async () => {
      const pedido = criarPedido({ detalhes_operacionais_pedido: { existente: 'valor' } })
      const { db, pedidoUpdateMock } = criarDbMock(pedido)

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'nome_exportador', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'Acme Co.' }],
        nivel: 'pedido',
      })

      expect(pedidoUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            detalhes_operacionais_pedido: expect.objectContaining({
              existente: 'valor',
              nome_exportador: 'Acme Co.',
            }),
          }),
        })
      )
    })

    it('grava chave OPE em detalhes_operacionais_pedido', async () => {
      const { db, pedidoUpdateMock } = criarDbMock()

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'codigo_ope', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'OPE-123' }],
        nivel: 'pedido',
      })

      expect(pedidoUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            detalhes_operacionais_pedido: expect.objectContaining({ codigo_ope: 'OPE-123' }),
          }),
        })
      )
    })
  })

  describe('Campos bloqueados', () => {

    it('rejeita campo calculado de pedido (valor_total_pedido)', async () => {
      const { db } = criarDbMock()
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'valor_total_pedido', tipo: 'numero', nivel: 'pedido', operacao: 'substituir', valor: 1000 }],
          nivel: 'pedido',
        })
      ).rejects.toThrow(AppError)
    })

    it('rejeita campo de sistema do pedido (id_organizacao)', async () => {
      const { db } = criarDbMock()
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'id_organizacao', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'org-hacker' }],
          nivel: 'pedido',
        })
      ).rejects.toThrow(/calculado e não pode/i)
    })

    it('rejeita quantidade_transferida_item (saldoEngine)', async () => {
      const { db } = criarDbMock()
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'quantidade_transferida_item', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 99 }],
          nivel: 'item',
        })
      ).rejects.toThrow(AppError)
    })
  })

  describe('preview() — lê valores atuais com nomes DDD', () => {

    it('lê valor direto de coluna do pedido', async () => {
      const pedido = criarPedido({ incoterm_pedido: 'FOB' })
      const { db } = criarDbMock(pedido)

      const preview = await service.preview(ID_ORG, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'incoterm_pedido', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'pedido',
      })

      expect(preview.campos[0].valores_distintos).toContain('FOB')
    })

    it('lê valor de detalhes_operacionais_pedido para chaves JSON', async () => {
      const pedido = criarPedido({ detalhes_operacionais_pedido: { nome_exportador: 'Acme' } })
      const { db } = criarDbMock(pedido)

      const preview = await service.preview(ID_ORG, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'nome_exportador', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'Zeta' }],
        nivel: 'pedido',
      })

      expect(preview.campos[0].valores_distintos).toContain('Acme')
    })

    it('lê valor de coluna DDD do item (quantidade_inicial_item)', async () => {
      const { db } = criarDbMock()

      const preview = await service.preview(ID_ORG, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'quantidade_inicial_item', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 200 }],
        nivel: 'item',
      })

      expect(preview.campos[0].valores_distintos).toContain('100')
    })
  })

  // ── Cascade Pedido → Item (aba Combinado) ───────────────────────────────────

  describe('Cascade Pedido → Item (aba Combinado)', () => {

    it('NÃO faz cascade na aba Pedido (mesmo com campo cascadeável)', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'incoterm_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'pedido',
      })

      // updateMany usado (fast path) — sem update individual de item
      expect(itemUpdateMock).not.toHaveBeenCalled()
    })

    it('faz cascade na aba Combinado para campo na whitelist', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'incoterm_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'combinado',
      })

      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ incoterm_item: 'CIF' }),
        })
      )
    })

    it('NÃO faz cascade na aba Combinado para campo fora da whitelist', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'numero_pedido', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'PO-NEW' }],
        nivel: 'combinado',
      })

      // numero_pedido não está em PARES_CASCADE → sem update de item
      expect(itemUpdateMock).not.toHaveBeenCalled()
    })

    it('campo item explícito sobrescreve cascade do mesmo destino', async () => {
      const { db, itemUpdateMock } = criarDbMock()

      // incoterm_pedido cascadeia para incoterm_item, mas o usuário também
      // editou incoterm_item explicitamente — o explícito vence.
      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [
          { campo: 'incoterm_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' },
          { campo: 'incoterm_item',   tipo: 'select', nivel: 'item',   operacao: 'substituir', valor: 'FOB' },
        ],
        nivel: 'combinado',
      })

      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ incoterm_item: 'FOB' }), // explícito vence
        })
      )
    })

    it('preview Combinado retorna campos_pedido_alterados e campos_item_alterados', async () => {
      const { db } = criarDbMock()

      const preview = await service.preview(ID_ORG, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'incoterm_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'combinado',
      })

      expect(preview.pedidos_afetados).toBe(1)
      expect(preview.itens_afetados).toBe(1)             // mock tem 1 item
      expect(preview.campos_pedido_alterados).toBe(1)    // 1 pedido × 1 campo pedido
      expect(preview.campos_item_alterados).toBe(1)      // 1 item × 1 cascade
      expect(preview.campos[0].cascade_para).toBe('incoterm_item')
    })

    it('cascade Combinado para campo JSON (nome_exportador → nome_exportador_item)', async () => {
      const { db, itemUpdateMock, pedidoUpdateMock } = criarDbMock()

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'nome_exportador', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'Acme Co.' }],
        nivel: 'combinado',
      })

      // Pedido grava em detalhes_operacionais_pedido (JSON)
      expect(pedidoUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            detalhes_operacionais_pedido: expect.objectContaining({ nome_exportador: 'Acme Co.' }),
          }),
        })
      )

      // Item recebe cascade na coluna real
      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ nome_exportador_item: 'Acme Co.' }),
        })
      )
    })

    it('preview aba Pedido: itens_afetados=0, campos_item_alterados=0', async () => {
      const { db } = criarDbMock()

      const preview = await service.preview(ID_ORG, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'incoterm_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'pedido',
      })

      expect(preview.itens_afetados).toBe(0)
      expect(preview.campos_pedido_alterados).toBe(1)
      expect(preview.campos_item_alterados).toBe(0)
      expect(preview.campos[0].cascade_para).toBeUndefined()
    })
  })
})
