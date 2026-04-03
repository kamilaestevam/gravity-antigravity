// testes/historico-global/schemas.test.ts
// Testes unitários dos schemas Zod do serviço historico-global.

import { describe, it, expect } from 'vitest'
import {
  IngestHistorySchema,
  ListHistoryQuerySchema,
  ExportHistoryQuerySchema,
  AlertRuleSchema,
  AlertEventUpdateSchema,
} from '../../servicos-global/tenant/historico-global/server/schemas/history.schema.js'

// ── IngestHistorySchema ───────────────────────────────────────────

describe('IngestHistorySchema', () => {
  const base = {
    actor_type: 'USER',
    actor_id: 'user-123',
    actor_name: 'João Silva',
    module: 'pedido',
    resource_type: 'Pedido',
    action: 'CREATE',
    action_detail: 'Criou o pedido #42',
  }

  it('aceita payload mínimo válido', () => {
    const result = IngestHistorySchema.safeParse(base)
    expect(result.success).toBe(true)
  })

  it('aceita todos os actor_types válidos', () => {
    const tipos = ['USER', 'API', 'AI', 'JOB', 'INTEGRATION'] as const
    for (const actor_type of tipos) {
      const result = IngestHistorySchema.safeParse({ ...base, actor_type })
      expect(result.success, `actor_type=${actor_type} falhou`).toBe(true)
    }
  })

  it('rejeita actor_type inválido', () => {
    const result = IngestHistorySchema.safeParse({ ...base, actor_type: 'GABI_IA' })
    expect(result.success).toBe(false)
  })

  it('rejeita actor_id vazio', () => {
    const result = IngestHistorySchema.safeParse({ ...base, actor_id: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita actor_name vazio', () => {
    const result = IngestHistorySchema.safeParse({ ...base, actor_name: '' })
    expect(result.success).toBe(false)
  })

  it('aceita campos opcionais', () => {
    const result = IngestHistorySchema.safeParse({
      ...base,
      actor_ip: '192.168.1.1',
      actor_metadata: { key: 'value' },
      resource_id: 'res-999',
      before: { status: 'RASCUNHO' },
      after: { status: 'CONFIRMADO' },
      status: 'SUCCESS',
      error_message: undefined,
      product_id: 'prod-abc',
      user_id: 'user-xyz',
    })
    expect(result.success).toBe(true)
  })

  it('aceita status FAILURE e PARTIAL', () => {
    expect(IngestHistorySchema.safeParse({ ...base, status: 'FAILURE' }).success).toBe(true)
    expect(IngestHistorySchema.safeParse({ ...base, status: 'PARTIAL' }).success).toBe(true)
  })

  it('rejeita status inválido', () => {
    const result = IngestHistorySchema.safeParse({ ...base, status: 'UNKNOWN' })
    expect(result.success).toBe(false)
  })
})

// ── ListHistoryQuerySchema ────────────────────────────────────────

describe('ListHistoryQuerySchema', () => {
  it('aceita query vazia (todos os parâmetros opcionais)', () => {
    const result = ListHistoryQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.limit).toBe(50)
  })

  it('aplica limite padrão de 50', () => {
    const result = ListHistoryQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.limit).toBe(50)
  })

  it('coerce limit para número', () => {
    const result = ListHistoryQuerySchema.safeParse({ limit: '25' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.limit).toBe(25)
  })

  it('rejeita limit acima de 100', () => {
    const result = ListHistoryQuerySchema.safeParse({ limit: '200' })
    expect(result.success).toBe(false)
  })

  it('rejeita limit abaixo de 1', () => {
    const result = ListHistoryQuerySchema.safeParse({ limit: '0' })
    expect(result.success).toBe(false)
  })

  it('aceita filtros opcionais válidos', () => {
    const result = ListHistoryQuerySchema.safeParse({
      actor_type: 'AI',
      module: 'pedido',
      status: 'FAILURE',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.999Z',
      search: 'João',
      cursor: '2026-03-01T12:00:00.000Z',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita datas não ISO', () => {
    const result = ListHistoryQuerySchema.safeParse({ startDate: '01/01/2026' })
    expect(result.success).toBe(false)
  })
})

// ── ExportHistoryQuerySchema ──────────────────────────────────────

describe('ExportHistoryQuerySchema', () => {
  it('usa format csv por padrão', () => {
    const result = ExportHistoryQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.format).toBe('csv')
  })

  it('aceita format json', () => {
    const result = ExportHistoryQuerySchema.safeParse({ format: 'json' })
    expect(result.success).toBe(true)
  })

  it('rejeita format inválido', () => {
    const result = ExportHistoryQuerySchema.safeParse({ format: 'xlsx' })
    expect(result.success).toBe(false)
  })
})

// ── AlertRuleSchema ───────────────────────────────────────────────

describe('AlertRuleSchema', () => {
  const base = { name: 'Regra de teste' }

  it('aceita regra mínima', () => {
    const result = AlertRuleSchema.safeParse(base)
    expect(result.success).toBe(true)
  })

  it('rejeita name vazio', () => {
    const result = AlertRuleSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('aceita regra com threshold', () => {
    const result = AlertRuleSchema.safeParse({
      ...base,
      actor_type: 'USER',
      action: 'DELETE',
      threshold_count: 10,
      threshold_window_seconds: 60,
      channel_email: true,
      recipients_email: ['admin@empresa.com'],
    })
    expect(result.success).toBe(true)
  })

  it('rejeita email inválido em recipients_email', () => {
    const result = AlertRuleSchema.safeParse({
      ...base,
      recipients_email: ['nao-e-um-email'],
    })
    expect(result.success).toBe(false)
  })

  it('rejeita threshold_count negativo', () => {
    const result = AlertRuleSchema.safeParse({
      ...base,
      threshold_count: -5,
    })
    expect(result.success).toBe(false)
  })

  it('aplica defaults: enabled=true, channels=false exceto inapp', () => {
    const result = AlertRuleSchema.safeParse(base)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.enabled).toBe(true)
      expect(result.data.channel_inapp).toBe(true)
      expect(result.data.channel_email).toBe(false)
      expect(result.data.channel_whatsapp).toBe(false)
      expect(result.data.recipients_email).toEqual([])
      expect(result.data.recipients_whatsapp).toEqual([])
      expect(result.data.recipients_user_ids).toEqual([])
    }
  })
})

// ── AlertEventUpdateSchema ────────────────────────────────────────

describe('AlertEventUpdateSchema', () => {
  it('aceita status REVIEWED', () => {
    expect(AlertEventUpdateSchema.safeParse({ status: 'REVIEWED' }).success).toBe(true)
  })

  it('aceita status ESCALATED', () => {
    expect(AlertEventUpdateSchema.safeParse({ status: 'ESCALATED' }).success).toBe(true)
  })

  it('rejeita status PENDING (não permitido em update)', () => {
    expect(AlertEventUpdateSchema.safeParse({ status: 'PENDING' }).success).toBe(false)
  })

  it('aceita notes opcional', () => {
    const result = AlertEventUpdateSchema.safeParse({
      status: 'REVIEWED',
      notes: 'Verificado e normal.',
    })
    expect(result.success).toBe(true)
  })
})
