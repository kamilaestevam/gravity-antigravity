/**
 * edicaoEmMassaService.test.ts — Testes unitários do EdicaoEmMassaService
 *
 * Refatoração DDD-puro (Líder Técnico, 2026-05-12):
 *   - Sem ACL: frontend envia nome exato da coluna do Prisma
 *   - 5 argumentos no confirmar(): id_organizacao, id_usuario, nome_usuario, db, payload
 *   - Bloqueios e detalhes_operacionais usam nomes DDD
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { EdicaoEmMassaService, AppError } from './edicaoEmMassaService.js'

// Mock @gravity/resolver-organizacao para controlar obterWorkspaces nos testes
vi.mock('@gravity/resolver-organizacao', () => ({
  obterWorkspaces: vi.fn(),
}))
import { obterWorkspaces } from '@gravity/resolver-organizacao'
const mockObterWorkspaces = obterWorkspaces as unknown as ReturnType<typeof vi.fn>

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

// Mock do db: o service recebe um TransactionClient (withOrganizacao já abriu
// a transação) e usa os delegates diretamente — sem $transaction aninhado.
function criarDbMock(pedido = criarPedido(), colunasUsuario: Record<string, unknown>[] = [], valoresColunaUsuario: Record<string, unknown>[] = []) {
  const itemUpdateMock = vi.fn().mockResolvedValue({ id_item: 'item-001' })
  const pedidoUpdateMock = vi.fn().mockResolvedValue({ id_pedido: 'pedido-001' })
  const updateManyMock = vi.fn().mockResolvedValue({ count: 1 })
  const valorUpsertMock = vi.fn().mockResolvedValue({})

  const dbBase = {
    pedido: {
      findMany: vi.fn().mockResolvedValue([pedido]),
      updateMany: updateManyMock,
      update: pedidoUpdateMock,
    },
    pedidoItem: { update: itemUpdateMock },
    pedidoListaColunaUsuario: { findMany: vi.fn().mockResolvedValue(colunasUsuario) },
    pedidoListaColunaUsuarioValor: {
      findMany: vi.fn().mockResolvedValue(valoresColunaUsuario),
      upsert: valorUpsertMock,
    },
  }
  const db = dbBase as unknown as PrismaClient

  return { db, itemUpdateMock, pedidoUpdateMock, updateManyMock, valorUpsertMock }
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

    // Cenário multi-pedido + cascade: edita JSON do Pedido + cascade Pedido→Item.
    // Garante que com 2+ pedidos cada um recebe 1 update no JSON, e cada item
    // recebe 1 update na coluna do item (caso do screenshot 2026-05-12).
    it('Combinado: JSON pedido + cascade item para 2 pedidos com múltiplos itens', async () => {
      const itemUpdateMock = vi.fn().mockResolvedValue({ id_item: 'item-X' })
      const pedidoUpdateMock = vi.fn().mockResolvedValue({ id_pedido: 'X' })

      const criarItens = (pedidoId: string, n: number) => Array.from({ length: n }, (_, i) => ({
        id_item: `${pedidoId}-item-${i+1}`,
        id_organizacao: ID_ORG,
        id_workspace: 'ws-001',
        id_pedido: pedidoId,
        quantidade_inicial_item: 100,
        quantidade_atual_item:   100,
      }))

      const pedido1 = {
        id_pedido: 'pedido-0047', id_organizacao: ID_ORG, id_workspace: 'ws-001',
        tipo_operacao_pedido: 'importacao', numero_pedido: 'CARGA-2026-0047',
        detalhes_operacionais_pedido: { algumOutro: 'valor' },
        itens_pedido: criarItens('pedido-0047', 5),
      }
      const pedido2 = {
        id_pedido: 'pedido-0061', id_organizacao: ID_ORG, id_workspace: 'ws-001',
        tipo_operacao_pedido: 'importacao', numero_pedido: 'CARGA-2026-0061',
        detalhes_operacionais_pedido: null,
        itens_pedido: criarItens('pedido-0061', 5),
      }

      const dbBase = {
        pedido: { findMany: vi.fn().mockResolvedValue([pedido1, pedido2]), updateMany: vi.fn(), update: pedidoUpdateMock },
        pedidoItem: { update: itemUpdateMock },
        pedidoListaColunaUsuario: { findMany: vi.fn().mockResolvedValue([]) },
        pedidoListaColunaUsuarioValor: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn() },
      }
      const db = dbBase as unknown as PrismaClient

      const resultado = await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-0047', 'pedido-0061'],
        campos: [{ campo: 'nome_exportador', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'EXPORTADOR ABC' }],
        nivel: 'combinado',
      })

      expect(pedidoUpdateMock).toHaveBeenCalledTimes(2)
      expect(itemUpdateMock).toHaveBeenCalledTimes(10)
      expect(resultado.pedidos_atualizados).toBe(2)
      expect(resultado.itens_atualizados).toBe(10)
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

    // Guard-rail Onda 4 — rejeição nos 3 níveis (pedido/item/combinado)

    it('rejeita campo bloqueado de pedido no nível combinado', async () => {
      const { db } = criarDbMock()
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'quantidade_total_pedido', tipo: 'numero', nivel: 'pedido', operacao: 'substituir', valor: 1 }],
          nivel: 'combinado',
        })
      ).rejects.toMatchObject({ code: 'CAMPO_BLOQUEADO' })
    })

    it('rejeita campo bloqueado de item no nível combinado', async () => {
      const { db } = criarDbMock()
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'valor_total_item', tipo: 'numero', nivel: 'item', operacao: 'substituir', valor: 1 }],
          nivel: 'combinado',
        })
      ).rejects.toMatchObject({ code: 'CAMPO_BLOQUEADO' })
    })

    it('preview() também rejeita campo bloqueado (não só confirmar)', async () => {
      const { db } = criarDbMock()
      await expect(
        service.preview(ID_ORG, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'valor_total_pedido', tipo: 'numero', nivel: 'pedido', operacao: 'substituir', valor: 1 }],
          nivel: 'pedido',
        })
      ).rejects.toMatchObject({ code: 'CAMPO_BLOQUEADO' })
    })

    it('preview() rejeita campo desconhecido', async () => {
      const { db } = criarDbMock()
      await expect(
        service.preview(ID_ORG, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'campo_inventado', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'x' }],
          nivel: 'pedido',
        })
      ).rejects.toMatchObject({ code: 'CAMPO_DESCONHECIDO' })
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

    it('converte P2002 (unique violation) do fast path em AppError 422', async () => {
      const { db } = criarDbMock()

      // Simula P2002 ao chamar updateMany (defesa em profundidade — caso
      // o Zod custom da rota não pegue um campo unique novo)
      const updateManyMock = (db as unknown as { pedido: { updateMany: ReturnType<typeof vi.fn> } }).pedido.updateMany
      updateManyMock.mockRejectedValueOnce(Object.assign(new Error('Unique constraint failed'), {
        code: 'P2002',
        meta: { target: ['id_organizacao', 'numero_pedido'] },
      }))

      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001', 'pedido-002'],
          campos: [{ campo: 'numero_pedido', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'PO-DUP' }],
          nivel: 'pedido',
        })
      ).rejects.toMatchObject({
        name: 'AppError',
        statusCode: 422,
        code: 'UNIQUE_VIOLATION',
      })
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

  // ── Auto-fill ao trocar tipo_operacao_pedido (v3 — 2026-05-12) ──────────────

  describe('Auto-fill ao trocar tipo_operacao_pedido', () => {
    beforeEach(() => {
      mockObterWorkspaces.mockReset()
    })

    function criarPedidoComJSON(detalhes: Record<string, unknown> | null = null, idWorkspace = 'ws-001') {
      return criarPedido({ detalhes_operacionais_pedido: detalhes, id_workspace: idWorkspace })
    }

    /** D1 caso 1 — IMP→EXP popula nome+cnpj exportador */
    it('IMP→EXP popula nome_exportador + cnpj_exportador no JSON', async () => {
      mockObterWorkspaces.mockResolvedValueOnce([
        { idWorkspace: 'ws-001', idOrganizacao: ID_ORG, nomeWorkspace: 'CDE EXPORTADOR', cnpjWorkspace: '08.973.387/0001-00' },
      ])
      const { db, pedidoUpdateMock } = criarDbMock(criarPedidoComJSON({ tipo_operacao_pedido: 'importacao' }))

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'tipo_operacao_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'exportacao' }],
        nivel: 'pedido',
      })

      expect(pedidoUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            detalhes_operacionais_pedido: expect.objectContaining({
              nome_exportador: 'CDE EXPORTADOR',
              cnpj_exportador: '08.973.387/0001-00',
              nome_importador: null,
              cnpj_importador: null,
            }),
          }),
        })
      )
    })

    /** D1 caso 2 — EXP→IMP popula nome+cnpj importador */
    it('EXP→IMP popula nome_importador + cnpj_importador no JSON', async () => {
      mockObterWorkspaces.mockResolvedValueOnce([
        { idWorkspace: 'ws-001', idOrganizacao: ID_ORG, nomeWorkspace: 'ABC IMPORTADOR', cnpjWorkspace: '12.345.678/0001-00' },
      ])
      const { db, pedidoUpdateMock } = criarDbMock(criarPedidoComJSON({ tipo_operacao_pedido: 'exportacao' }))

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'tipo_operacao_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'importacao' }],
        nivel: 'pedido',
      })

      expect(pedidoUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            detalhes_operacionais_pedido: expect.objectContaining({
              nome_importador: 'ABC IMPORTADOR',
              cnpj_importador: '12.345.678/0001-00',
              nome_exportador: null,
              cnpj_exportador: null,
            }),
          }),
        })
      )
    })

    /** D1 caso 3 — limpa lado anterior mesmo se já tinha valores */
    it('Limpa lado anterior (chave JSON do tipo antigo)', async () => {
      mockObterWorkspaces.mockResolvedValueOnce([
        { idWorkspace: 'ws-001', idOrganizacao: ID_ORG, nomeWorkspace: 'CDE EXPORTADOR', cnpjWorkspace: null },
      ])
      const pedido = criarPedidoComJSON({
        nome_exportador: 'Acme Exportador',
        cnpj_exportador: '99.999.999/9999-99',
      })
      const { db, pedidoUpdateMock } = criarDbMock(pedido)

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'tipo_operacao_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'importacao' }],
        nivel: 'pedido',
      })

      const dataCalled = pedidoUpdateMock.mock.calls[0][0].data.detalhes_operacionais_pedido
      expect(dataCalled.nome_exportador).toBeNull()
      expect(dataCalled.cnpj_exportador).toBeNull()
    })

    /** D1 caso 4 — Cascade auto-fill para itens (nome_*_item) */
    it('Cascade auto-fill — itens recebem nome do workspace na coluna correta', async () => {
      mockObterWorkspaces.mockResolvedValueOnce([
        { idWorkspace: 'ws-001', idOrganizacao: ID_ORG, nomeWorkspace: 'CDE EXPORTADOR', cnpjWorkspace: null },
      ])
      const { db, itemUpdateMock } = criarDbMock()

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'tipo_operacao_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'exportacao' }],
        nivel: 'pedido',
      })

      expect(itemUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nome_exportador_item: 'CDE EXPORTADOR',
            nome_importador_item: null,
          }),
        })
      )
    })

    /** D1 caso 5 — Workspace sem CNPJ → grava NULL + preview emite aviso */
    it('Workspace sem CNPJ — grava NULL e preview retorna aviso', async () => {
      mockObterWorkspaces.mockResolvedValue([
        { idWorkspace: 'ws-001', idOrganizacao: ID_ORG, nomeWorkspace: 'CDE EXPORTADOR', cnpjWorkspace: null },
      ])
      const { db } = criarDbMock()

      const preview = await service.preview(ID_ORG, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'tipo_operacao_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'exportacao' }],
        nivel: 'pedido',
      })

      expect(preview.aviso_workspace_sem_cnpj).toHaveLength(1)
      expect(preview.aviso_workspace_sem_cnpj?.[0].id_workspace).toBe('ws-001')
      expect(preview.workspaces_auto_fill).toContainEqual(
        expect.objectContaining({ id_workspace: 'ws-001', cnpj_workspace: null }),
      )
    })

    /** D1 caso 6 — tipo_operacao_pedido NÃO está no batch, auto-fill NÃO roda */
    it('Sem tipo_operacao_pedido no batch — auto-fill NÃO roda + obterWorkspaces NÃO é chamado', async () => {
      const { db, pedidoUpdateMock, updateManyMock } = criarDbMock()

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'incoterm_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'CIF' }],
        nivel: 'pedido',
      })

      expect(mockObterWorkspaces).not.toHaveBeenCalled()
      // Não modifica detalhes_operacionais_pedido (não está editando JSON)
      const dataPedido = (pedidoUpdateMock.mock.calls[0]?.[0]?.data ?? updateManyMock.mock.calls[0]?.[0]?.data) as Record<string, unknown>
      expect(dataPedido?.detalhes_operacionais_pedido).toBeUndefined()
    })

    /** D1 caso 7 — Edição manual vence sobre auto-fill (T1) */
    it('T1 — Edição manual de nome_exportador vence sobre auto-fill ao trocar para EXP', async () => {
      mockObterWorkspaces.mockResolvedValueOnce([
        { idWorkspace: 'ws-001', idOrganizacao: ID_ORG, nomeWorkspace: 'CDE EXPORTADOR', cnpjWorkspace: '08.973.387/0001-00' },
      ])
      const { db, pedidoUpdateMock } = criarDbMock()

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [
          { campo: 'tipo_operacao_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'exportacao' },
          { campo: 'nome_exportador',      tipo: 'texto',  nivel: 'pedido', operacao: 'substituir', valor: 'Manual Override Co.' },
        ],
        nivel: 'pedido',
      })

      const dataCalled = pedidoUpdateMock.mock.calls[0][0].data.detalhes_operacionais_pedido
      // Manual vence
      expect(dataCalled.nome_exportador).toBe('Manual Override Co.')
      // CNPJ não foi editado manualmente — vem do auto-fill
      expect(dataCalled.cnpj_exportador).toBe('08.973.387/0001-00')
    })

    /** D1 caso 8 — Múltiplos workspaces no batch — cada pedido usa o seu (T3) */
    it('T3 — Pedidos de workspaces diferentes — cada um usa seu próprio workspace', async () => {
      mockObterWorkspaces.mockResolvedValueOnce([
        { idWorkspace: 'ws-CDE',  idOrganizacao: ID_ORG, nomeWorkspace: 'CDE EXPORTADOR', cnpjWorkspace: null },
        { idWorkspace: 'ws-AMST', idOrganizacao: ID_ORG, nomeWorkspace: 'AMSTED LTDA',    cnpjWorkspace: '00.000.000/0001-00' },
      ])

      const p1 = criarPedido({ id_pedido: 'pedido-CDE',  id_workspace: 'ws-CDE',  tipo_operacao_pedido: 'importacao' })
      const p2 = criarPedido({ id_pedido: 'pedido-AMST', id_workspace: 'ws-AMST', tipo_operacao_pedido: 'importacao' })

      const itemUpdateMock = vi.fn().mockResolvedValue({ id_item: 'i' })
      const pedidoUpdateMock = vi.fn().mockResolvedValue({ id_pedido: 'X' })
      const dbBase = {
        pedido: { findMany: vi.fn().mockResolvedValue([p1, p2]), updateMany: vi.fn(), update: pedidoUpdateMock },
        pedidoItem: { update: itemUpdateMock },
        pedidoListaColunaUsuario: { findMany: vi.fn().mockResolvedValue([]) },
        pedidoListaColunaUsuarioValor: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn() },
      }
      const db = dbBase as unknown as PrismaClient

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-CDE', 'pedido-AMST'],
        campos: [{ campo: 'tipo_operacao_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'exportacao' }],
        nivel: 'pedido',
      })

      // pedido-CDE recebe CDE EXPORTADOR
      expect(pedidoUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_pedido: 'pedido-CDE' }),
          data: expect.objectContaining({
            detalhes_operacionais_pedido: expect.objectContaining({ nome_exportador: 'CDE EXPORTADOR' }),
          }),
        })
      )
      // pedido-AMST recebe AMSTED LTDA
      expect(pedidoUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_pedido: 'pedido-AMST' }),
          data: expect.objectContaining({
            detalhes_operacionais_pedido: expect.objectContaining({ nome_exportador: 'AMSTED LTDA', cnpj_exportador: '00.000.000/0001-00' }),
          }),
        })
      )
    })

    /** D1 caso 9 (LT2 ajustado) — Workspace órfão no Configurador → erros[] */
    it('LT2 — Workspace órfão (não retornado pelo Configurador) → entra em erros[]', async () => {
      mockObterWorkspaces.mockResolvedValueOnce([]) // batch vazio = ws órfão
      const { db } = criarDbMock()

      const resultado = await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'tipo_operacao_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'exportacao' }],
        nivel: 'pedido',
      })

      expect(resultado.erros).toHaveLength(1)
      expect(resultado.erros[0]).toMatchObject({
        pedido_id: 'pedido-001',
        motivo: expect.stringContaining('Workspace'),
      })
      expect(resultado.pedidos_atualizados).toBe(0)
    })

    /** D1 caso 10 — Configurador offline (mock 503) → service propaga AppError 503 */
    it('Configurador offline (S2S throws) → service propaga AppError 503', async () => {
      const err503 = new AppError('Configurador indisponível', 503, 'CONFIGURADOR_UNAVAILABLE')
      mockObterWorkspaces.mockRejectedValueOnce(err503)
      const { db } = criarDbMock()

      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'tipo_operacao_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'exportacao' }],
          nivel: 'pedido',
        })
      ).rejects.toMatchObject({ statusCode: 503 })
    })

    /** Onda 2 — campo fora do SSOT é rejeitado (falha ruidosa, Mand. 08) */
    it('rejeita campo desconhecido (fora do SSOT camposEdicaoMassa)', async () => {
      const { db } = criarDbMock()
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'campo_que_nao_existe', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'x' }],
          nivel: 'pedido',
        })
      ).rejects.toMatchObject({ code: 'CAMPO_DESCONHECIDO', statusCode: 400 })
    })

    /** Bonus QA1 — Preview retorna workspaces_auto_fill com nome real */
    it('QA1 — Preview retorna workspaces_auto_fill com nome real do workspace', async () => {
      mockObterWorkspaces.mockResolvedValueOnce([
        { idWorkspace: 'ws-001', idOrganizacao: ID_ORG, nomeWorkspace: 'CDE EXPORTADOR', cnpjWorkspace: null },
      ])
      const { db } = criarDbMock()

      const preview = await service.preview(ID_ORG, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'tipo_operacao_pedido', tipo: 'select', nivel: 'pedido', operacao: 'substituir', valor: 'exportacao' }],
        nivel: 'pedido',
      })

      expect(preview.workspaces_auto_fill).toEqual([
        { id_workspace: 'ws-001', nome_workspace: 'CDE EXPORTADOR', cnpj_workspace: null },
      ])
    })
  })

  // ── Colunas criadas pelo usuário (EAV) — Onda 2, 2026-06-11 ─────────────────

  describe('Colunas de usuário (coluna_usuario:<id>)', () => {

    const COLUNA_TEXTO = {
      id_coluna_usuario_pedido: 'col-001',
      nome_coluna_usuario_pedido: 'Ref. Interna',
      tipo_coluna_usuario_pedido: 'texto',
      escopo_coluna_usuario_pedido: 'ambos',
    }
    const COLUNA_NUMERO = {
      id_coluna_usuario_pedido: 'col-002',
      nome_coluna_usuario_pedido: 'Margem',
      tipo_coluna_usuario_pedido: 'numero',
      escopo_coluna_usuario_pedido: 'ambos',
    }

    it('grava coluna de usuário nível pedido via upsert EAV (vinculo pedido)', async () => {
      const { db, valorUpsertMock } = criarDbMock(criarPedido(), [COLUNA_TEXTO])

      const resultado = await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'coluna_usuario:col-001', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'REF-99' }],
        nivel: 'pedido',
      })

      expect(valorUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            id_organizacao: ID_ORG,
            id_coluna_usuario_pedido: 'col-001',
            vinculo_valor_coluna_usuario_pedido: 'pedido',
            id_vinculo_valor_coluna_usuario_pedido: 'pedido-001',
            valor_coluna_usuario_pedido: 'REF-99',
          }),
        })
      )
      expect(resultado.pedidos_atualizados).toBe(1)
      expect(resultado.campos_pedido_alterados).toBe(1)
    })

    it('grava coluna de usuário nível item via upsert EAV (vinculo item, por item)', async () => {
      const { db, valorUpsertMock } = criarDbMock(criarPedido(), [COLUNA_TEXTO])

      const resultado = await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'coluna_usuario:col-001', tipo: 'texto', nivel: 'item', operacao: 'substituir', valor: 'LOTE-A' }],
        nivel: 'item',
      })

      expect(valorUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            vinculo_valor_coluna_usuario_pedido: 'item',
            id_vinculo_valor_coluna_usuario_pedido: 'item-001',
            valor_coluna_usuario_pedido: 'LOTE-A',
          }),
        })
      )
      expect(resultado.itens_atualizados).toBe(1)
      expect(resultado.campos_item_alterados).toBe(1)
    })

    it('operação somar em coluna numero usa o valor atual do EAV', async () => {
      const valorAtual = {
        id_coluna_usuario_pedido: 'col-002',
        id_vinculo_valor_coluna_usuario_pedido: 'pedido-001',
        valor_coluna_usuario_pedido: '10',
      }
      const { db, valorUpsertMock } = criarDbMock(criarPedido(), [COLUNA_NUMERO], [valorAtual])

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'coluna_usuario:col-002', tipo: 'numero', nivel: 'pedido', operacao: 'somar', valor: 5 }],
        nivel: 'pedido',
      })

      expect(valorUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { valor_coluna_usuario_pedido: '15' }, // 10 + 5
        })
      )
    })

    it('rejeita coluna de usuário inexistente/inativa', async () => {
      const { db } = criarDbMock(criarPedido(), [])
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'coluna_usuario:col-fantasma', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'x' }],
          nivel: 'pedido',
        })
      ).rejects.toMatchObject({ code: 'COLUNA_USUARIO_NAO_ENCONTRADA', statusCode: 400 })
    })

    it('rejeita coluna de usuário tipo formula (calculada)', async () => {
      const colunaFormula = { ...COLUNA_TEXTO, tipo_coluna_usuario_pedido: 'formula' }
      const { db } = criarDbMock(criarPedido(), [colunaFormula])
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'coluna_usuario:col-001', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'x' }],
          nivel: 'pedido',
        })
      ).rejects.toMatchObject({ code: 'CAMPO_BLOQUEADO' })
    })

    it('rejeita escopo incompatível (coluna escopo item editada no nível pedido)', async () => {
      const colunaItem = { ...COLUNA_TEXTO, escopo_coluna_usuario_pedido: 'item' }
      const { db } = criarDbMock(criarPedido(), [colunaItem])
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'coluna_usuario:col-001', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'x' }],
          nivel: 'pedido',
        })
      ).rejects.toMatchObject({ code: 'ESCOPO_INCOMPATIVEL' })
    })

    it('rejeita operação incompatível (percentual em coluna texto)', async () => {
      const { db } = criarDbMock(criarPedido(), [COLUNA_TEXTO])
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'coluna_usuario:col-001', tipo: 'texto', nivel: 'pedido', operacao: 'percentual', valor: 10 }],
          nivel: 'pedido',
        })
      ).rejects.toMatchObject({ code: 'OPERACAO_INCOMPATIVEL' })
    })

    it('nível combinado: coluna escopo ambos grava no vínculo pedido e escopo item no vínculo item', async () => {
      const colunaItem = {
        id_coluna_usuario_pedido: 'col-003',
        nome_coluna_usuario_pedido: 'Lote',
        tipo_coluna_usuario_pedido: 'texto',
        escopo_coluna_usuario_pedido: 'item',
      }
      const { db, valorUpsertMock } = criarDbMock(criarPedido(), [COLUNA_TEXTO, colunaItem])

      await service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
        pedido_ids: ['pedido-001'],
        campos: [
          { campo: 'coluna_usuario:col-001', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'REF-X' },
          { campo: 'coluna_usuario:col-003', tipo: 'texto', nivel: 'item', operacao: 'substituir', valor: 'LOTE-1' },
        ],
        nivel: 'combinado',
      })

      expect(valorUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            id_coluna_usuario_pedido: 'col-001',
            vinculo_valor_coluna_usuario_pedido: 'pedido',
            id_vinculo_valor_coluna_usuario_pedido: 'pedido-001',
          }),
        })
      )
      expect(valorUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            id_coluna_usuario_pedido: 'col-003',
            vinculo_valor_coluna_usuario_pedido: 'item',
            id_vinculo_valor_coluna_usuario_pedido: 'item-001',
          }),
        })
      )
    })

    it('rejeita campo coluna_usuario malformado (sem id) como desconhecido', async () => {
      const { db } = criarDbMock(criarPedido(), [COLUNA_TEXTO])
      await expect(
        service.confirmar(ID_ORG, ID_USER, NOME_USER, db, {
          pedido_ids: ['pedido-001'],
          campos: [{ campo: 'coluna_usuario:', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'x' }],
          nivel: 'pedido',
        })
      ).rejects.toMatchObject({ code: 'CAMPO_DESCONHECIDO' })
    })

    it('preview lê valor atual da coluna de usuário no EAV', async () => {
      const valorAtual = {
        id_coluna_usuario_pedido: 'col-001',
        id_vinculo_valor_coluna_usuario_pedido: 'pedido-001',
        valor_coluna_usuario_pedido: 'REF-ANTIGA',
      }
      const { db } = criarDbMock(criarPedido(), [COLUNA_TEXTO], [valorAtual])

      const preview = await service.preview(ID_ORG, db, {
        pedido_ids: ['pedido-001'],
        campos: [{ campo: 'coluna_usuario:col-001', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'REF-NOVA' }],
        nivel: 'pedido',
      })

      expect(preview.campos[0].valores_distintos).toContain('REF-ANTIGA')
      expect(preview.campos_pedido_alterados).toBe(1)
    })
  })
})
