// testes/testes-unitarios/servicos-tenant/middleware/withTenantIsolation.test.ts
// Agente 0B — Banco de Dados
// Testes unitários do middleware withTenantIsolation — todas as operações Prisma
//
// Cobre cada uma das 9 operações interceptadas:
//   findMany, findFirst, findUnique, create, createMany,
//   update, updateMany, delete, deleteMany

import { describe, it, expect } from 'vitest'
import { withTenantIsolation } from '@tenant/middleware/withTenantIsolation'
import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Tipos auxiliares
// ---------------------------------------------------------------------------

/** Mapa de campos capturados após a extensão ser aplicada */
interface CapturedCall {
  model: string
  op: string
  tenant_id?: string
  [field: string]: unknown
}

// ---------------------------------------------------------------------------
// Factory de mock do PrismaClient
// Captura todos os args que chegam ao query handler final,
// após withTenantIsolation ter processado e injetado o tenant_id.
// ---------------------------------------------------------------------------

function buildCapturingPrisma() {
  const captured: CapturedCall[] = []

  const prismaMock = {
    $extends: (extension: {
      query: {
        $allModels: Record<
          string,
          (opts: {
            args: Record<string, unknown>
            query: (args: Record<string, unknown>) => Promise<CapturedCall[]>
          }) => Promise<unknown>
        >
      }
    }) => {
      const allModels = extension.query.$allModels

      const makeModel = (modelName: string) =>
        new Proxy({} as Record<string, (args: Record<string, unknown>) => Promise<CapturedCall[]>>, {
          get(_t, op: string) {
            const handler = allModels[op as string]
            return async (args: Record<string, unknown>): Promise<CapturedCall[]> => {
              if (!handler) {
                captured.push({ model: modelName, op: String(op), ...args })
                return captured
              }
              return handler({
                args,
                query: async (finalArgs: Record<string, unknown>) => {
                  captured.push({ 
                    model: modelName, 
                    op: String(op), 
                    ...(finalArgs.where as any || {}),
                    ...(finalArgs.data as any || {}),
                    ...finalArgs 
                  })
                  return captured
                },
              }) as Promise<CapturedCall[]>
            }
          },
        })

      return new Proxy(
        {} as Record<string, ReturnType<typeof makeModel>>,
        {
          get(_t, modelName: string) {
            return makeModel(String(modelName))
          },
        }
      )
    },
  }

  /** Retorna o último call capturado — helper de conveniência nos testes */
  function last(): CapturedCall {
    return captured[captured.length - 1]
  }

  return { prismaMock, captured, last }
}

// ---------------------------------------------------------------------------
// Constante de tenant para todos os testes
// ---------------------------------------------------------------------------

const TENANT_ID = 'test-tenant-id-001'

// ---------------------------------------------------------------------------
// findMany
// ---------------------------------------------------------------------------

describe('withTenantIsolation — findMany', () => {
  it('injeta tenant_id no where quando nenhum where é fornecido', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { findMany: (a: object) => Promise<void> } }).activity.findMany({})
    expect(last().tenant_id).toBe(TENANT_ID)
  })

  it('preserva filtros existentes e adiciona tenant_id', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { findMany: (a: object) => Promise<void> } }).activity.findMany({ where: { status: 'DONE' } })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect(last().status).toBe('DONE')
  })

  it('sobrescreve tentativa de forjar tenant_id no where', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { findMany: (a: object) => Promise<void> } }).activity.findMany({
      where: { tenant_id: 'tenant-invasor', status: 'DONE' },
    })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect(last().tenant_id).not.toBe('tenant-invasor')
  })
})

// ---------------------------------------------------------------------------
// findFirst
// ---------------------------------------------------------------------------

describe('withTenantIsolation — findFirst', () => {
  it('injeta tenant_id no where', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { findFirst: (a: object) => Promise<void> } }).activity.findFirst({ where: { id: 'item-1' } })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect(last().id).toBe('item-1')
  })
})

// ---------------------------------------------------------------------------
// findUnique
// ---------------------------------------------------------------------------

describe('withTenantIsolation — findUnique', () => {
  it('injeta tenant_id no where para evitar bypass via findUnique', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { findUnique: (a: object) => Promise<void> } }).activity.findUnique({ where: { id: 'item-abc' } })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect(last().id).toBe('item-abc')
  })
})

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------

describe('withTenantIsolation — create', () => {
  it('injeta tenant_id nos dados sem que o caller precise fornecer', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { create: (a: object) => Promise<void> } }).activity.create({
      data: { title: 'Nova atividade', status: 'PENDING' },
    })
    expect(last().tenant_id).toBe(TENANT_ID)
  })

  it('sobrescreve tenant_id forjado no data', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { create: (a: object) => Promise<void> } }).activity.create({
      data: { title: 'Hacker', tenant_id: 'tenant-invasor' },
    })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect(last().tenant_id).not.toBe('tenant-invasor')
  })
})

// ---------------------------------------------------------------------------
// createMany
// ---------------------------------------------------------------------------

describe('withTenantIsolation — createMany', () => {
  it('injeta tenant_id em cada registro do batch', async () => {
    const { prismaMock, captured } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { createMany: (a: object) => Promise<void> } }).activity.createMany({
      data: [
        { title: 'Item 1', status: 'PENDING' },
        { title: 'Item 2', status: 'DONE' },
      ],
    })
    // O captured recebe um array de items — verificamos tenant_id no payload
    const call = captured[captured.length - 1]
    // A extensão faz map e passa o array no campo `data`
    const dataField = call['data'] as Array<{ tenant_id?: string }> | undefined
    if (Array.isArray(dataField)) {
      expect(dataField[0]?.tenant_id).toBe(TENANT_ID)
      expect(dataField[1]?.tenant_id).toBe(TENANT_ID)
    } else {
      // Dependendo da implementação, pode vir flatten — tenant_id deve estar presente
      expect(call.tenant_id).toBe(TENANT_ID)
    }
  })
})

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------

describe('withTenantIsolation — update', () => {
  it('injeta tenant_id no where', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { update: (a: object) => Promise<void> } }).activity.update({
      where: { id: 'item-1' },
      data: { status: 'DONE' },
    })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect(last().id).toBe('item-1')
  })

  it('sobrescreve tenant_id forjado no where', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { update: (a: object) => Promise<void> } }).activity.update({
      where: { id: 'item-1', tenant_id: 'outro-tenant' },
      data: { status: 'DONE' },
    })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect(last().tenant_id).not.toBe('outro-tenant')
  })
})

// ---------------------------------------------------------------------------
// updateMany
// ---------------------------------------------------------------------------

describe('withTenantIsolation — updateMany', () => {
  it('injeta tenant_id no where para updates em massa', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { updateMany: (a: object) => Promise<void> } }).activity.updateMany({
      where: { status: 'PENDING' },
      data: { status: 'DONE' },
    })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect((last().where as any).status).toBe('PENDING')
  })
})

// ---------------------------------------------------------------------------
// delete
// ---------------------------------------------------------------------------

describe('withTenantIsolation — delete', () => {
  it('injeta tenant_id no where', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { delete: (a: object) => Promise<void> } }).activity.delete({ where: { id: 'del-1' } })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect(last().id).toBe('del-1')
  })

  it('impede delete cross-tenant: usa tenant_id do middleware, não do caller', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { delete: (a: object) => Promise<void> } }).activity.delete({
      where: { id: 'item-outro-tenant', tenant_id: 'tenant-invasor' },
    })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect(last().tenant_id).not.toBe('tenant-invasor')
  })
})

// ---------------------------------------------------------------------------
// deleteMany
// ---------------------------------------------------------------------------

describe('withTenantIsolation — deleteMany', () => {
  it('injeta tenant_id no where para deletes em massa', async () => {
    const { prismaMock, last } = buildCapturingPrisma()
    const db = withTenantIsolation(prismaMock as unknown as PrismaClient, TENANT_ID)
    await (db as unknown as { activity: { deleteMany: (a: object) => Promise<void> } }).activity.deleteMany({
      where: { status: 'CANCELLED' },
    })
    expect(last().tenant_id).toBe(TENANT_ID)
    expect(last().status).toBe('CANCELLED')
  })
})

// ---------------------------------------------------------------------------
// Casos de borda — instanciação inválida
// ---------------------------------------------------------------------------

describe('withTenantIsolation — tenantId inválido', () => {
  it('falha com string vazia', () => {
    const { prismaMock } = buildCapturingPrisma()
    expect(() => withTenantIsolation(prismaMock as unknown as PrismaClient, '')).toThrow(
      '[withTenantIsolation] tenantId é obrigatório e não pode ser vazio.'
    )
  })

  it('falha com apenas espaços em branco', () => {
    const { prismaMock } = buildCapturingPrisma()
    expect(() => withTenantIsolation(prismaMock as unknown as PrismaClient, '   ')).toThrow(
      '[withTenantIsolation] tenantId é obrigatório e não pode ser vazio.'
    )
  })

  it('não falha com tenant_id válido', () => {
    const { prismaMock } = buildCapturingPrisma()
    expect(() =>
      withTenantIsolation(prismaMock as unknown as PrismaClient, 'tenant-valido-001')
    ).not.toThrow()
  })
})
