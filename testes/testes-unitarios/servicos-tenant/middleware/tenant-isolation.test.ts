// testes/testes-unitarios/servicos-tenant/middleware/tenant-isolation.test.ts
// Agente 0B — Banco de Dados
// Testes de isolamento de tenant — Camada 1 (Prisma Client Extension)
//
// Verifica os 4 contratos críticos do withTenantIsolation:
//   1. Erro imediato ao instanciar sem tenant_id
//   2. findMany injeta tenant_id automaticamente
//   3. Acesso cross-tenant bloqueado
//   4. create injeta tenant_id sem requerer do corpo da requisição

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withTenantIsolation } from '@tenant/middleware/withTenantIsolation'
import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Helpers para montar um PrismaClient mock com $extends
// ---------------------------------------------------------------------------

type QueryHandler = (args: Record<string, unknown>) => Promise<unknown>

/**
 * Cria um mock de PrismaClient que permite inspecionar os `args`
 * que chegam após a extensão injetar o tenant_id.
 */
function buildMockPrisma() {
  // Armazenaremos aqui os args recebidos pelo query handler final
  const capturedArgs: Record<string, unknown>[] = []

  // Mock do modelo que captura os args
  const modelProxy = new Proxy({} as Record<string, QueryHandler>, {
    get(_target, op: string) {
      return async (args: Record<string, unknown>) => {
        capturedArgs.push({ op, ...args })
        return capturedArgs // retorna o acumulado para inspeções
      }
    },
  })

  // PrismaClient mock que expõe $extends e modelos
  const prismaMock = {
    $extends: vi.fn().mockImplementation((extension: {
      query: {
        $allModels: Record<string, (opts: { args: Record<string, unknown>; query: QueryHandler }) => Promise<unknown>>
      }
    }) => {
      // Retorna um proxy que, ao acessar qualquer model, chama o handler da extensão
      return new Proxy({} as Record<string, Record<string, QueryHandler>>, {
        get(_target, modelName: string) {
          return new Proxy({} as Record<string, QueryHandler>, {
            get(_t, op: string) {
              const handler = extension.query.$allModels[op]
              if (!handler) return async (args: Record<string, unknown>) => ({ op, args })
              return async (args: Record<string, unknown>) => {
                return handler({
                  args,
                  query: async (finalArgs: Record<string, unknown>) => {
                    capturedArgs.push({ 
                      model: String(modelName), 
                      op, 
                      ...(finalArgs.where as any || {}),
                      ...(finalArgs.data as any || {}),
                      ...finalArgs 
                    })
                    return capturedArgs
                  },
                })
              }
            },
          })
        },
      })
    }),
    capturedArgs,
  }

  return prismaMock
}

// ---------------------------------------------------------------------------
// Suite 1 — Instanciação com tenant_id inválido
// ---------------------------------------------------------------------------

describe('withTenantIsolation — instanciação', () => {
  it('lança erro imediato se tenant_id for string vazia', () => {
    const prisma = buildMockPrisma()

    expect(() =>
      withTenantIsolation(prisma as unknown as PrismaClient, '')
    ).toThrowError('[withTenantIsolation] tenantId é obrigatório e não pode ser vazio.')
  })

  it('lança erro imediato se tenant_id for apenas espaços', () => {
    const prisma = buildMockPrisma()

    expect(() =>
      withTenantIsolation(prisma as unknown as PrismaClient, '   ')
    ).toThrowError('[withTenantIsolation] tenantId é obrigatório e não pode ser vazio.')
  })

  it('não lança erro com tenant_id válido', () => {
    const prisma = buildMockPrisma()

    expect(() =>
      withTenantIsolation(prisma as unknown as PrismaClient, 'tenant-abc-123')
    ).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — findMany injeta tenant_id automaticamente
// ---------------------------------------------------------------------------

describe('withTenantIsolation — findMany', () => {
  let mock: ReturnType<typeof buildMockPrisma>

  beforeEach(() => {
    mock = buildMockPrisma()
  })

  it('injeta tenant_id no where quando nenhum where é fornecido', async () => {
    const db = withTenantIsolation(mock as unknown as PrismaClient, 'tenant-abc')
    await (db as unknown as Record<string, Record<string, (args: Record<string, unknown>) => Promise<unknown>>>).activity.findMany({})

    const last = mock.capturedArgs[mock.capturedArgs.length - 1]
    expect(last).toMatchObject({ tenant_id: 'tenant-abc' })
  })

  it('preserva filtros existentes e adiciona tenant_id', async () => {
    const db = withTenantIsolation(mock as unknown as PrismaClient, 'tenant-abc')
    await (db as unknown as Record<string, Record<string, (args: Record<string, unknown>) => Promise<unknown>>>).activity.findMany({
      where: { status: 'DONE' },
    })

    const last = mock.capturedArgs[mock.capturedArgs.length - 1]
    expect(last).toMatchObject({ tenant_id: 'tenant-abc', status: 'DONE' })
  })

  it('sobrescreve tenant_id forjado no where', async () => {
    const db = withTenantIsolation(mock as unknown as PrismaClient, 'tenant-abc')
    await (db as unknown as Record<string, Record<string, (args: Record<string, unknown>) => Promise<unknown>>>).activity.findMany({
      where: { tenant_id: 'tenant-invasor', status: 'DONE' },
    })

    // O middleware deve sobrescrever com o tenant_id real
    const last = mock.capturedArgs[mock.capturedArgs.length - 1]
    expect(last.tenant_id).toBe('tenant-abc')
    expect(last.tenant_id).not.toBe('tenant-invasor')
  })
})

// ---------------------------------------------------------------------------
// Suite 3 — Bloqueio cross-tenant
// ---------------------------------------------------------------------------

describe('withTenantIsolation — bloqueio cross-tenant', () => {
  it('operações de um tenant não podem atingir dados de outro tenant', async () => {
    const mockA = buildMockPrisma()
    const mockB = buildMockPrisma()

    const dbTenantA = withTenantIsolation(mockA as unknown as PrismaClient, 'tenant-a')
    const dbTenantB = withTenantIsolation(mockB as unknown as PrismaClient, 'tenant-b')

    // Tenant A faz uma busca
    await (dbTenantA as unknown as Record<string, Record<string, (args: Record<string, unknown>) => Promise<unknown>>>).activity.findMany({})
    // Tenant B faz uma busca
    await (dbTenantB as unknown as Record<string, Record<string, (args: Record<string, unknown>) => Promise<unknown>>>).activity.findMany({})

    // A captura do mock A deve conter apenas tenant-a
    const capturedA = mockA.capturedArgs[mockA.capturedArgs.length - 1]
    expect(capturedA.tenant_id).toBe('tenant-a')

    // A captura do mock B deve conter apenas tenant-b
    const capturedB = mockB.capturedArgs[mockB.capturedArgs.length - 1]
    expect(capturedB.tenant_id).toBe('tenant-b')

    // Garantia: os dois clients nunca misturam
    expect(capturedA.tenant_id).not.toBe(capturedB.tenant_id)
  })

  it('update de tenant A não pode afetar registros de tenant B', async () => {
    const mock = buildMockPrisma()
    const dbTenantA = withTenantIsolation(mock as unknown as PrismaClient, 'tenant-a')

    await (dbTenantA as unknown as Record<string, Record<string, (args: Record<string, unknown>) => Promise<unknown>>>).activity.update({
      where: { id: 'registro-do-tenant-b' },
      data: { status: 'DONE' },
    })

    const last = mock.capturedArgs[mock.capturedArgs.length - 1]
    // O where deve ter sido sobrescrito com o tenant_id do cliente (tenant-a)
    expect(last.tenant_id).toBe('tenant-a')
  })

  it('delete de tenant A não pode remover registros de tenant B', async () => {
    const mock = buildMockPrisma()
    const dbTenantA = withTenantIsolation(mock as unknown as PrismaClient, 'tenant-a')

    await (dbTenantA as unknown as Record<string, Record<string, (args: Record<string, unknown>) => Promise<unknown>>>).activity.delete({
      where: { id: 'registro-do-tenant-b' },
    })

    const last = mock.capturedArgs[mock.capturedArgs.length - 1]
    expect(last.tenant_id).toBe('tenant-a')
  })
})

// ---------------------------------------------------------------------------
// Suite 4 — create injeta tenant_id sem requerer do body
// ---------------------------------------------------------------------------

describe('withTenantIsolation — create', () => {
  it('injeta tenant_id nos dados automaticamente sem que o corpo forneça', async () => {
    const mock = buildMockPrisma()
    const db = withTenantIsolation(mock as unknown as PrismaClient, 'tenant-xyz')

    await (db as unknown as Record<string, Record<string, (args: { data: Record<string, unknown> }) => Promise<unknown>>>).activity.create({
      data: {
        title: 'Nova atividade',
        status: 'PENDING',
        user_id: 'user-1',
        // tenant_id NÃO fornecido pelo caller — deve vir do middleware
      },
    })

    const last = mock.capturedArgs[mock.capturedArgs.length - 1]
    expect(last.tenant_id).toBe('tenant-xyz')
  })

  it('sobrescreve tenant_id forjado no corpo do create', async () => {
    const mock = buildMockPrisma()
    const db = withTenantIsolation(mock as unknown as PrismaClient, 'tenant-xyz')

    await (db as unknown as Record<string, Record<string, (args: { data: Record<string, unknown> }) => Promise<unknown>>>).activity.create({
      data: {
        title: 'Tentativa maliciosa',
        tenant_id: 'tenant-invasor', // forjado — deve ser sobrescrito
        user_id: 'user-hacker',
      },
    })

    const last = mock.capturedArgs[mock.capturedArgs.length - 1]
    expect(last.tenant_id).toBe('tenant-xyz')
    expect(last.tenant_id).not.toBe('tenant-invasor')
  })
})
