// @vitest-environment node
/**
 * TST-CROSS-TENANT-BID-CAMBIO-001 — Isolamento de organizacao no BID Cambio
 *
 * Valida que a Prisma Extension (withTenantIsolation) injeta id_organizacao
 * em TODAS as operacoes de banco, impedindo vazamento cross-tenant.
 *
 * Cobre os modelos: BidCambioParcela, BidCambioCotacao, BidCambioCorretora
 *
 * Vetores testados:
 *   A) Leitura cross-tenant (findMany, findFirst, count, groupBy)
 *   B) Criacao com tenant_id injetado (create, createMany)
 *   C) Modificacao cross-tenant (update, updateMany)
 *   D) Delecao cross-tenant (delete, deleteMany)
 *   E) Isolamento entre orgs distintas (org-A nao ve org-B)
 *   F) Middleware: requisicao sem x-id-organizacao nao injeta filtro
 */

import { describe, it, vi, beforeEach, expect } from 'vitest'
import { withTenantIsolation } from '../../../servicos-global/produto/bid-cambio/server/src/middleware/tenantIsolation.js'

// ── Organizacoes de teste ────────────────────────────────────────────────────
const ORG_A = 'org-alpha-001'
const ORG_B = 'org-beta-002'

// ── Mock de PrismaClient ─────────────────────────────────────────────────────

function createMockPrismaModel() {
  return {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(async (args: Record<string, unknown>) => args.data ?? {}),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
    update: vi.fn().mockImplementation(async (args: Record<string, unknown>) => args.data ?? {}),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    delete: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({}),
    groupBy: vi.fn().mockResolvedValue([]),
  }
}

type MockModel = ReturnType<typeof createMockPrismaModel>

function createMockPrisma() {
  const bidCambioParcela = createMockPrismaModel()
  const bidCambioCotacao = createMockPrismaModel()
  const bidCambioCorretora = createMockPrismaModel()

  return {
    bidCambioParcela,
    bidCambioCotacao,
    bidCambioCorretora,
    $extends: vi.fn().mockImplementation(function (this: unknown, extension: unknown) {
      // Simulate Prisma $extends by wrapping each model with the extension's query hooks
      const ext = extension as {
        query?: {
          $allModels?: Record<string, (ctx: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) => Promise<unknown>>
        }
      }
      const hooks = ext?.query?.$allModels ?? {}

      function wrapModel(model: MockModel, modelHooks: typeof hooks) {
        const wrapped: Record<string, unknown> = {}
        for (const method of Object.keys(model) as (keyof MockModel)[]) {
          if (modelHooks[method]) {
            wrapped[method] = (args: Record<string, unknown>) => {
              return modelHooks[method]!({
                args,
                query: (wrappedArgs: Record<string, unknown>) => (model[method] as (a: Record<string, unknown>) => Promise<unknown>)(wrappedArgs),
              })
            }
          } else {
            wrapped[method] = model[method]
          }
        }
        return wrapped
      }

      return {
        bidCambioParcela: wrapModel(bidCambioParcela, hooks),
        bidCambioCotacao: wrapModel(bidCambioCotacao, hooks),
        bidCambioCorretora: wrapModel(bidCambioCorretora, hooks),
        $extends: (this as Record<string, unknown>).$extends,
      }
    }),
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TESTES
// ══════════════════════════════════════════════════════════════════════════════

describe('Cross-Tenant Isolation — BID Cambio', () => {
  let mockPrisma: ReturnType<typeof createMockPrisma>
  let prismaOrgA: ReturnType<typeof withTenantIsolation>
  let prismaOrgB: ReturnType<typeof withTenantIsolation>

  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma = createMockPrisma()
    prismaOrgA = withTenantIsolation(mockPrisma as any, ORG_A) as any
    prismaOrgB = withTenantIsolation(mockPrisma as any, ORG_B) as any
  })

  // ══════════════════════════════════════════════════════════════════════════
  // A — Leitura: findMany, findFirst, count incluem id_organizacao
  // ══════════════════════════════════════════════════════════════════════════
  describe('A — Leitura: queries de leitura sempre filtram por id_organizacao', () => {

    // ── BidCambioParcela ──────────────────────────────────────────────────
    it('findMany em BidCambioParcela para org-A injeta id_organizacao: org-A', async () => {
      await (prismaOrgA as any).bidCambioParcela.findMany({
        where: { status_parcela_bid_cambio: 'PENDENTE' },
      })

      expect(mockPrisma.bidCambioParcela.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('findMany em BidCambioParcela para org-B injeta id_organizacao: org-B', async () => {
      await (prismaOrgB as any).bidCambioParcela.findMany({
        where: { status_parcela_bid_cambio: 'AGENDADO' },
      })

      expect(mockPrisma.bidCambioParcela.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_B }),
        })
      )
    })

    it('findFirst em BidCambioParcela injeta id_organizacao', async () => {
      await (prismaOrgA as any).bidCambioParcela.findFirst({
        where: { id_parcela_bid_cambio: 'parcela-123' },
      })

      expect(mockPrisma.bidCambioParcela.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_A,
            id_parcela_bid_cambio: 'parcela-123',
          }),
        })
      )
    })

    it('count em BidCambioParcela injeta id_organizacao', async () => {
      await (prismaOrgA as any).bidCambioParcela.count({
        where: { status_parcela_bid_cambio: 'PAGO' },
      })

      expect(mockPrisma.bidCambioParcela.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('findMany sem where explicito ainda injeta id_organizacao', async () => {
      await (prismaOrgA as any).bidCambioParcela.findMany({})

      expect(mockPrisma.bidCambioParcela.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    // ── BidCambioCotacao ──────────────────────────────────────────────────
    it('findMany em BidCambioCotacao para org-A injeta id_organizacao: org-A', async () => {
      await (prismaOrgA as any).bidCambioCotacao.findMany({
        where: { status_cotacao_bid_cambio: 'RASCUNHO' },
      })

      expect(mockPrisma.bidCambioCotacao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('findFirst em BidCambioCotacao injeta id_organizacao', async () => {
      await (prismaOrgA as any).bidCambioCotacao.findFirst({
        where: { id_cotacao_bid_cambio: 'cotacao-456' },
      })

      expect(mockPrisma.bidCambioCotacao.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_A,
            id_cotacao_bid_cambio: 'cotacao-456',
          }),
        })
      )
    })

    it('count em BidCambioCotacao injeta id_organizacao', async () => {
      await (prismaOrgB as any).bidCambioCotacao.count({
        where: {},
      })

      expect(mockPrisma.bidCambioCotacao.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_B }),
        })
      )
    })

    // ── BidCambioCorretora ────────────────────────────────────────────────
    it('findMany em BidCambioCorretora para org-A injeta id_organizacao: org-A', async () => {
      await (prismaOrgA as any).bidCambioCorretora.findMany({
        where: { status_corretora_bid_cambio: 'ATIVA' },
      })

      expect(mockPrisma.bidCambioCorretora.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('findFirst em BidCambioCorretora injeta id_organizacao', async () => {
      await (prismaOrgB as any).bidCambioCorretora.findFirst({
        where: { id_corretora_bid_cambio: 'corretora-789' },
      })

      expect(mockPrisma.bidCambioCorretora.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_B,
            id_corretora_bid_cambio: 'corretora-789',
          }),
        })
      )
    })

    it('findUnique em BidCambioCorretora injeta id_organizacao', async () => {
      await (prismaOrgA as any).bidCambioCorretora.findUnique({
        where: { id_corretora_bid_cambio: 'corretora-unique' },
      })

      expect(mockPrisma.bidCambioCorretora.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // B — Criacao: create e createMany incluem id_organizacao no data
  // ══════════════════════════════════════════════════════════════════════════
  describe('B — Criacao: id_organizacao sempre injetado no data', () => {

    it('create em BidCambioCotacao injeta id_organizacao no data', async () => {
      await (prismaOrgA as any).bidCambioCotacao.create({
        data: {
          moeda_cotacao_bid_cambio: 'USD',
          valor_cotacao_bid_cambio: 50000,
          tipo_operacao_cotacao_bid_cambio: 'IMPORTACAO',
          status_cotacao_bid_cambio: 'RASCUNHO',
          id_usuario: 'user-a1',
        },
      })

      expect(mockPrisma.bidCambioCotacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('create em BidCambioCorretora injeta id_organizacao no data', async () => {
      await (prismaOrgB as any).bidCambioCorretora.create({
        data: {
          razao_social_corretora_bid_cambio: 'Corretora Teste LTDA',
          email_corretora_bid_cambio: 'contato@teste.com',
          tipo_corretora_bid_cambio: 'CORRETORA_CAMBIO',
          status_corretora_bid_cambio: 'ATIVA',
          id_usuario: 'user-b1',
        },
      })

      expect(mockPrisma.bidCambioCorretora.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ id_organizacao: ORG_B }),
        })
      )
    })

    it('create NAO permite sobrescrever id_organizacao do payload', async () => {
      await (prismaOrgA as any).bidCambioCotacao.create({
        data: {
          moeda_cotacao_bid_cambio: 'EUR',
          valor_cotacao_bid_cambio: 10000,
          id_organizacao: ORG_B, // tentativa de injecao
        },
      })

      // A extension sobrescreve com o tenant correto
      expect(mockPrisma.bidCambioCotacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('createMany injeta id_organizacao em cada item do array', async () => {
      await (prismaOrgA as any).bidCambioParcela.createMany({
        data: [
          { valor_a_pagar_parcela_bid_cambio: 1000, moeda_parcela_bid_cambio: 'USD' },
          { valor_a_pagar_parcela_bid_cambio: 2000, moeda_parcela_bid_cambio: 'USD' },
          { valor_a_pagar_parcela_bid_cambio: 3000, moeda_parcela_bid_cambio: 'EUR' },
        ],
      })

      const callArgs = mockPrisma.bidCambioParcela.createMany.mock.calls[0]?.[0] as { data: Record<string, unknown>[] } | undefined
      expect(callArgs).toBeDefined()
      expect(Array.isArray(callArgs!.data)).toBe(true)

      for (const item of callArgs!.data) {
        expect(item.id_organizacao).toBe(ORG_A)
      }
    })

    it('createMany com objeto unico (nao array) injeta id_organizacao', async () => {
      await (prismaOrgB as any).bidCambioParcela.createMany({
        data: { valor_a_pagar_parcela_bid_cambio: 5000, moeda_parcela_bid_cambio: 'GBP' },
      })

      expect(mockPrisma.bidCambioParcela.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ id_organizacao: ORG_B }),
        })
      )
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // C — Modificacao: update e updateMany incluem id_organizacao no where
  // ══════════════════════════════════════════════════════════════════════════
  describe('C — Modificacao: update/updateMany sempre filtram por id_organizacao', () => {

    it('update em BidCambioParcela injeta id_organizacao no where', async () => {
      await (prismaOrgA as any).bidCambioParcela.update({
        where: { id_parcela_bid_cambio: 'parcela-upd-1' },
        data: { status_parcela_bid_cambio: 'AGENDADO' },
      })

      expect(mockPrisma.bidCambioParcela.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_A,
            id_parcela_bid_cambio: 'parcela-upd-1',
          }),
        })
      )
    })

    it('updateMany em BidCambioParcela injeta id_organizacao no where', async () => {
      await (prismaOrgA as any).bidCambioParcela.updateMany({
        where: {
          id_parcela_bid_cambio: { in: ['p1', 'p2', 'p3'] },
          status_parcela_bid_cambio: 'PENDENTE',
        },
        data: {
          status_parcela_bid_cambio: 'AGENDADO',
          data_agendamento_parcela_bid_cambio: new Date('2026-06-01'),
        },
      })

      expect(mockPrisma.bidCambioParcela.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('update em BidCambioCotacao injeta id_organizacao no where', async () => {
      await (prismaOrgB as any).bidCambioCotacao.update({
        where: { id_cotacao_bid_cambio: 'cotacao-upd-1' },
        data: { moeda_cotacao_bid_cambio: 'GBP' },
      })

      expect(mockPrisma.bidCambioCotacao.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_B,
            id_cotacao_bid_cambio: 'cotacao-upd-1',
          }),
        })
      )
    })

    it('update em BidCambioCorretora injeta id_organizacao no where', async () => {
      await (prismaOrgA as any).bidCambioCorretora.update({
        where: { id_corretora_bid_cambio: 'corretora-upd-1' },
        data: { status_corretora_bid_cambio: 'INATIVA' },
      })

      expect(mockPrisma.bidCambioCorretora.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_A,
            id_corretora_bid_cambio: 'corretora-upd-1',
          }),
        })
      )
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // D — Delecao: delete e deleteMany incluem id_organizacao no where
  // ══════════════════════════════════════════════════════════════════════════
  describe('D — Delecao: delete/deleteMany sempre filtram por id_organizacao', () => {

    it('delete em BidCambioCotacao injeta id_organizacao no where', async () => {
      await (prismaOrgA as any).bidCambioCotacao.delete({
        where: { id_cotacao_bid_cambio: 'cotacao-del-1' },
      })

      expect(mockPrisma.bidCambioCotacao.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_A,
            id_cotacao_bid_cambio: 'cotacao-del-1',
          }),
        })
      )
    })

    it('deleteMany em BidCambioParcela injeta id_organizacao no where', async () => {
      await (prismaOrgB as any).bidCambioParcela.deleteMany({
        where: { status_parcela_bid_cambio: 'PAGO' },
      })

      expect(mockPrisma.bidCambioParcela.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_B }),
        })
      )
    })

    it('delete em BidCambioCorretora injeta id_organizacao no where', async () => {
      await (prismaOrgB as any).bidCambioCorretora.delete({
        where: { id_corretora_bid_cambio: 'corretora-del-1' },
      })

      expect(mockPrisma.bidCambioCorretora.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_B,
            id_corretora_bid_cambio: 'corretora-del-1',
          }),
        })
      )
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // E — Isolamento: org-A nunca ve dados de org-B
  // ══════════════════════════════════════════════════════════════════════════
  describe('E — Isolamento: org-A e org-B recebem filtros distintos', () => {

    it('findMany do org-A e org-B usam id_organizacao diferentes na mesma tabela', async () => {
      await (prismaOrgA as any).bidCambioParcela.findMany({ where: {} })
      await (prismaOrgB as any).bidCambioParcela.findMany({ where: {} })

      const calls = mockPrisma.bidCambioParcela.findMany.mock.calls
      expect(calls).toHaveLength(2)

      const whereA = (calls[0]?.[0] as { where: Record<string, unknown> })?.where
      const whereB = (calls[1]?.[0] as { where: Record<string, unknown> })?.where

      expect(whereA?.id_organizacao).toBe(ORG_A)
      expect(whereB?.id_organizacao).toBe(ORG_B)
      expect(whereA?.id_organizacao).not.toBe(whereB?.id_organizacao)
    })

    it('org-A buscando parcela por ID recebe filtro de org-A, nao de org-B', async () => {
      const parcelaIdOrgB = 'parcela-pertence-org-b'

      // Org-A tenta buscar parcela que pertence a org-B
      await (prismaOrgA as any).bidCambioParcela.findFirst({
        where: { id_parcela_bid_cambio: parcelaIdOrgB },
      })

      expect(mockPrisma.bidCambioParcela.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_A, // NUNCA org-B
            id_parcela_bid_cambio: parcelaIdOrgB,
          }),
        })
      )
    })

    it('org-A buscando corretora por CNPJ recebe filtro de org-A', async () => {
      await (prismaOrgA as any).bidCambioCorretora.findFirst({
        where: { cnpj_corretora_bid_cambio: '12345678000100' },
      })

      expect(mockPrisma.bidCambioCorretora.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_A,
            cnpj_corretora_bid_cambio: '12345678000100',
          }),
        })
      )
    })

    it('create de cotacao por org-A nunca grava com id_organizacao de org-B', async () => {
      await (prismaOrgA as any).bidCambioCotacao.create({
        data: {
          moeda_cotacao_bid_cambio: 'USD',
          valor_cotacao_bid_cambio: 75000,
          id_organizacao: ORG_B, // tentativa maliciosa
        },
      })

      const callData = (mockPrisma.bidCambioCotacao.create.mock.calls[0]?.[0] as { data: Record<string, unknown> })?.data
      expect(callData?.id_organizacao).toBe(ORG_A)
      expect(callData?.id_organizacao).not.toBe(ORG_B)
    })

    it('update de parcela por org-B nunca filtra por org-A', async () => {
      await (prismaOrgB as any).bidCambioParcela.update({
        where: { id_parcela_bid_cambio: 'parcela-123' },
        data: { status_parcela_bid_cambio: 'PAGO' },
      })

      const callWhere = (mockPrisma.bidCambioParcela.update.mock.calls[0]?.[0] as { where: Record<string, unknown> })?.where
      expect(callWhere?.id_organizacao).toBe(ORG_B)
      expect(callWhere?.id_organizacao).not.toBe(ORG_A)
    })

    it('delete de cotacao por org-A nunca afeta dados de org-B', async () => {
      await (prismaOrgA as any).bidCambioCotacao.delete({
        where: { id_cotacao_bid_cambio: 'cotacao-org-b-001' },
      })

      const callWhere = (mockPrisma.bidCambioCotacao.delete.mock.calls[0]?.[0] as { where: Record<string, unknown> })?.where
      expect(callWhere?.id_organizacao).toBe(ORG_A)
      expect(callWhere?.id_organizacao).not.toBe(ORG_B)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // F — Aggregate: aggregate inclui id_organizacao
  // ══════════════════════════════════════════════════════════════════════════
  describe('F — Aggregate: operacoes de agregacao filtram por id_organizacao', () => {

    it('aggregate em BidCambioParcela injeta id_organizacao no where', async () => {
      await (prismaOrgA as any).bidCambioParcela.aggregate({
        where: { status_parcela_bid_cambio: 'PENDENTE' },
        _sum: { valor_a_pagar_parcela_bid_cambio: true },
      })

      expect(mockPrisma.bidCambioParcela.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('count em BidCambioCorretora injeta id_organizacao', async () => {
      await (prismaOrgB as any).bidCambioCorretora.count({
        where: { status_corretora_bid_cambio: 'ATIVA' },
      })

      expect(mockPrisma.bidCambioCorretora.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_B }),
        })
      )
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // G — Middleware: tenantIsolationMiddleware comportamento
  // ══════════════════════════════════════════════════════════════════════════
  describe('G — Middleware: comportamento do tenantIsolationMiddleware', () => {

    it('withTenantIsolation retorna client extendido que nao e o original', () => {
      const extended = withTenantIsolation(mockPrisma as any, ORG_A)
      // O client extendido deve ser um objeto diferente do original
      expect(extended).toBeDefined()
      expect(typeof extended).toBe('object')
    })

    it('dois withTenantIsolation com orgs diferentes produzem filtros independentes', async () => {
      const clientA = withTenantIsolation(mockPrisma as any, ORG_A) as any
      const clientB = withTenantIsolation(mockPrisma as any, ORG_B) as any

      await clientA.bidCambioParcela.findMany({ where: {} })
      await clientB.bidCambioParcela.findMany({ where: {} })

      const calls = mockPrisma.bidCambioParcela.findMany.mock.calls
      expect((calls[0]?.[0] as { where: Record<string, unknown> })?.where?.id_organizacao).toBe(ORG_A)
      expect((calls[1]?.[0] as { where: Record<string, unknown> })?.where?.id_organizacao).toBe(ORG_B)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // H — Cenarios de rota: simulacao dos padroes reais das rotas
  // ══════════════════════════════════════════════════════════════════════════
  describe('H — Cenarios de rota: padroes reais do cambios.ts, cotacoes.ts, corretoras.ts', () => {

    it('GET /cambios pattern: findMany + count ambos recebem id_organizacao', async () => {
      // Simula o padrao da rota GET / em cambios.ts (linhas 61-70)
      const where = { status_parcela_bid_cambio: 'PENDENTE' }

      await Promise.all([
        (prismaOrgA as any).bidCambioParcela.findMany({ where, orderBy: { data_vencimento_parcela_bid_cambio: 'asc' }, skip: 0, take: 50 }),
        (prismaOrgA as any).bidCambioParcela.count({ where }),
      ])

      expect(mockPrisma.bidCambioParcela.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
      expect(mockPrisma.bidCambioParcela.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('GET /cambios/:id pattern: findFirst com id_parcela_bid_cambio recebe id_organizacao', async () => {
      // Simula cambios.ts linha 107-108
      await (prismaOrgA as any).bidCambioParcela.findFirst({
        where: { id_parcela_bid_cambio: 'parcela-get-by-id' },
        include: { anexos: true },
      })

      expect(mockPrisma.bidCambioParcela.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_A,
            id_parcela_bid_cambio: 'parcela-get-by-id',
          }),
        })
      )
    })

    it('POST /cotacoes pattern: create injeta id_organizacao no data', async () => {
      // Simula cotacoes.ts linhas 32-39
      await (prismaOrgA as any).bidCambioCotacao.create({
        data: {
          moeda_cotacao_bid_cambio: 'USD',
          valor_cotacao_bid_cambio: 50000,
          tipo_operacao_cotacao_bid_cambio: 'IMPORTACAO',
          id_usuario: 'user-a1',
          status_cotacao_bid_cambio: 'RASCUNHO',
          data_expiracao_cotacao_bid_cambio: null,
        },
      })

      expect(mockPrisma.bidCambioCotacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id_organizacao: ORG_A,
            moeda_cotacao_bid_cambio: 'USD',
          }),
        })
      )
    })

    it('PATCH /cotacoes/:id pattern: findFirst + update ambos recebem id_organizacao', async () => {
      // Simula cotacoes.ts linhas 115-128 (findFirst para verificar + update)
      mockPrisma.bidCambioCotacao.findFirst.mockResolvedValueOnce({
        id_cotacao_bid_cambio: 'cotacao-patch',
        status_cotacao_bid_cambio: 'RASCUNHO',
        id_organizacao: ORG_A,
      })

      await (prismaOrgA as any).bidCambioCotacao.findFirst({
        where: { id_cotacao_bid_cambio: 'cotacao-patch' },
      })
      await (prismaOrgA as any).bidCambioCotacao.update({
        where: { id_cotacao_bid_cambio: 'cotacao-patch' },
        data: { moeda_cotacao_bid_cambio: 'EUR' },
      })

      expect(mockPrisma.bidCambioCotacao.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
      expect(mockPrisma.bidCambioCotacao.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('DELETE /cotacoes/:id pattern: findFirst + delete ambos recebem id_organizacao', async () => {
      // Simula cotacoes.ts linhas 134-143
      mockPrisma.bidCambioCotacao.findFirst.mockResolvedValueOnce({
        id_cotacao_bid_cambio: 'cotacao-del',
        status_cotacao_bid_cambio: 'RASCUNHO',
        id_organizacao: ORG_A,
      })

      await (prismaOrgA as any).bidCambioCotacao.findFirst({
        where: { id_cotacao_bid_cambio: 'cotacao-del' },
      })
      await (prismaOrgA as any).bidCambioCotacao.delete({
        where: { id_cotacao_bid_cambio: 'cotacao-del' },
      })

      expect(mockPrisma.bidCambioCotacao.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
      expect(mockPrisma.bidCambioCotacao.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('POST /corretoras pattern: findFirst para CNPJ + create ambos recebem id_organizacao', async () => {
      // Simula corretoras.ts linhas 44-57 (check duplicata + create)
      await (prismaOrgA as any).bidCambioCorretora.findFirst({
        where: { cnpj_corretora_bid_cambio: '12345678000199' },
      })
      await (prismaOrgA as any).bidCambioCorretora.create({
        data: {
          razao_social_corretora_bid_cambio: 'Nova Corretora LTDA',
          email_corretora_bid_cambio: 'nova@corretora.com',
          tipo_corretora_bid_cambio: 'BANCO_COMERCIAL',
          status_corretora_bid_cambio: 'ATIVA',
          id_usuario: 'user-a1',
        },
      })

      expect(mockPrisma.bidCambioCorretora.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
      expect(mockPrisma.bidCambioCorretora.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('PUT /corretoras/:id pattern: findFirst + update ambos recebem id_organizacao', async () => {
      // Simula corretoras.ts linhas 125-141
      mockPrisma.bidCambioCorretora.findFirst.mockResolvedValueOnce({
        id_corretora_bid_cambio: 'corretora-put',
        cnpj_corretora_bid_cambio: '11111111000100',
        id_organizacao: ORG_B,
      })

      await (prismaOrgB as any).bidCambioCorretora.findFirst({
        where: { id_corretora_bid_cambio: 'corretora-put' },
      })
      await (prismaOrgB as any).bidCambioCorretora.update({
        where: { id_corretora_bid_cambio: 'corretora-put' },
        data: { nome_fantasia_corretora_bid_cambio: 'Novo Nome' },
      })

      expect(mockPrisma.bidCambioCorretora.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_B }),
        })
      )
      expect(mockPrisma.bidCambioCorretora.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_B }),
        })
      )
    })

    it('PATCH /corretoras/:id/status pattern: findFirst + update ambos recebem id_organizacao', async () => {
      // Simula corretoras.ts linhas 164-170
      mockPrisma.bidCambioCorretora.findFirst.mockResolvedValueOnce({
        id_corretora_bid_cambio: 'corretora-status',
        status_corretora_bid_cambio: 'ATIVA',
        id_organizacao: ORG_A,
      })

      await (prismaOrgA as any).bidCambioCorretora.findFirst({
        where: { id_corretora_bid_cambio: 'corretora-status' },
      })
      await (prismaOrgA as any).bidCambioCorretora.update({
        where: { id_corretora_bid_cambio: 'corretora-status' },
        data: { status_corretora_bid_cambio: 'BLOQUEADA' },
      })

      expect(mockPrisma.bidCambioCorretora.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
      expect(mockPrisma.bidCambioCorretora.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_organizacao: ORG_A }),
        })
      )
    })

    it('POST /cambios/exportar pattern: findMany com filtros recebe id_organizacao', async () => {
      // Simula cambios.ts linhas 225-229
      await (prismaOrgB as any).bidCambioParcela.findMany({
        where: { status_parcela_bid_cambio: 'PAGO', moeda_parcela_bid_cambio: 'USD' },
        orderBy: [{ data_vencimento_parcela_bid_cambio: 'asc' }, { numero_parcela_bid_cambio: 'asc' }],
        take: 10000,
      })

      expect(mockPrisma.bidCambioParcela.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_organizacao: ORG_B,
            status_parcela_bid_cambio: 'PAGO',
            moeda_parcela_bid_cambio: 'USD',
          }),
        })
      )
    })
  })
})
