import { describe, it, expect } from 'vitest'
import { IngestHistorySchema, ListHistoryQuerySchema, ActorTypeEnum } from '../history.schema.js'

// ── ActorTypeEnum ──────────────────────────────────────────────────────────────

describe('ActorTypeEnum', () => {
  const VALID = ['USER', 'API', 'AI', 'JOB', 'INTEGRATION'] as const

  VALID.forEach((tipo) => {
    it(`aceita tipo válido: ${tipo}`, () => {
      expect(ActorTypeEnum.safeParse(tipo).success).toBe(true)
    })
  })

  it('rejeita tipo inválido: GABI_IA', () => {
    expect(ActorTypeEnum.safeParse('GABI_IA').success).toBe(false)
  })

  it('rejeita tipo inválido: user (minúsculo)', () => {
    expect(ActorTypeEnum.safeParse('user').success).toBe(false)
  })

  it('rejeita tipo inválido: string vazia', () => {
    expect(ActorTypeEnum.safeParse('').success).toBe(false)
  })
})

// ── IngestHistorySchema ────────────────────────────────────────────────────────

const VALID_PAYLOAD = {
  actor_type: 'USER',
  actor_id: 'user-123',
  actor_name: 'Daniel',
  module: 'pedido',
  resource_type: 'Pedido',
  action: 'CREATE',
  action_detail: 'Criou o pedido #001',
}

describe('IngestHistorySchema', () => {
  it('aceita payload mínimo válido', () => {
    const result = IngestHistorySchema.safeParse(VALID_PAYLOAD)
    expect(result.success).toBe(true)
  })

  it('aceita payload completo com campos opcionais', () => {
    const full = {
      ...VALID_PAYLOAD,
      actor_ip: '192.168.1.1',
      actor_metadata: { browser: 'Chrome' },
      resource_id: 'pedido-456',
      before: { status: 'RASCUNHO' },
      after: { status: 'CONFIRMADO' },
      status: 'SUCCESS',
      error_message: undefined,
      product_id: 'prod-001',
      user_id: 'user-123',
    }
    expect(IngestHistorySchema.safeParse(full).success).toBe(true)
  })

  it('rejeita actor_type inválido', () => {
    const result = IngestHistorySchema.safeParse({ ...VALID_PAYLOAD, actor_type: 'GABI_IA' })
    expect(result.success).toBe(false)
  })

  it('rejeita actor_id vazio', () => {
    const result = IngestHistorySchema.safeParse({ ...VALID_PAYLOAD, actor_id: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita actor_name vazio', () => {
    const result = IngestHistorySchema.safeParse({ ...VALID_PAYLOAD, actor_name: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita module ausente', () => {
    const { module: _m, ...sem } = VALID_PAYLOAD
    expect(IngestHistorySchema.safeParse(sem).success).toBe(false)
  })

  it('rejeita action_detail ausente', () => {
    const { action_detail: _a, ...sem } = VALID_PAYLOAD
    expect(IngestHistorySchema.safeParse(sem).success).toBe(false)
  })

  it('status inválido é rejeitado', () => {
    const result = IngestHistorySchema.safeParse({ ...VALID_PAYLOAD, status: 'OK' })
    expect(result.success).toBe(false)
  })
})

// ── ListHistoryQuerySchema ─────────────────────────────────────────────────────

describe('ListHistoryQuerySchema', () => {
  it('aceita query vazia (usa defaults)', () => {
    const result = ListHistoryQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.limit).toBe(50)
  })

  it('limit é coercido de string para número', () => {
    const result = ListHistoryQuerySchema.safeParse({ limit: '20' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.limit).toBe(20)
  })

  it('limit máximo é 100', () => {
    const result = ListHistoryQuerySchema.safeParse({ limit: '200' })
    expect(result.success).toBe(false)
  })

  it('limit mínimo é 1', () => {
    const result = ListHistoryQuerySchema.safeParse({ limit: '0' })
    expect(result.success).toBe(false)
  })

  it('startDate inválido é rejeitado', () => {
    const result = ListHistoryQuerySchema.safeParse({ startDate: 'ontem' })
    expect(result.success).toBe(false)
  })

  it('startDate ISO válido é aceito', () => {
    const result = ListHistoryQuerySchema.safeParse({ startDate: '2026-01-01T00:00:00Z' })
    expect(result.success).toBe(true)
  })
})
