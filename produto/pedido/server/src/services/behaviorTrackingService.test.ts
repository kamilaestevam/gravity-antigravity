/**
 * behaviorTrackingService.test.ts — Testes unitários
 *
 * Cobre:
 *   - BehaviorEventSchema: validação Zod de inputs
 *   - trackBehaviorEvent: chama db.create com dados corretos, falha silenciosa
 *   - getUserBehaviorScores: multiplicadores corretos por frequência, isolamento por tenant
 *   - resolveInsightId: mapeamento evento → insightId (via eventos de comportamento)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BehaviorEventSchema, trackBehaviorEvent, getUserBehaviorScores } from './behaviorTrackingService.js'

// ── Mocks ─────────────────────────────────────────────────────────────────────

function criarDbMock(eventos: Array<{ event: string; payload: Record<string, unknown> }> = []) {
  return {
    userBehaviorEvent: {
      create:   vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue(eventos),
    },
  }
}

// ── BehaviorEventSchema ───────────────────────────────────────────────────────

describe('BehaviorEventSchema — validação Zod', () => {
  it('aceita evento válido route_visited', () => {
    const input = { event: 'route_visited', payload: { route: '/pedidos/lista' } }
    expect(() => BehaviorEventSchema.parse(input)).not.toThrow()
  })

  it('aceita evento válido filter_applied', () => {
    const input = { event: 'filter_applied', payload: { filter_field: 'status', filter_value: 'atrasado' } }
    expect(() => BehaviorEventSchema.parse(input)).not.toThrow()
  })

  it('aceita evento válido insight_clicked', () => {
    const input = { event: 'insight_clicked', payload: { insight_id: 'atrasados' } }
    expect(() => BehaviorEventSchema.parse(input)).not.toThrow()
  })

  it('aceita payload vazio (objeto sem campos)', () => {
    const input = { event: 'widget_clicked', payload: {} }
    expect(() => BehaviorEventSchema.parse(input)).not.toThrow()
  })

  it('rejeita event inválido', () => {
    const input = { event: 'evento_invalido', payload: {} }
    expect(() => BehaviorEventSchema.parse(input)).toThrow()
  })

  it('rejeita payload sem campo payload', () => {
    const input = { event: 'route_visited' }
    expect(() => BehaviorEventSchema.parse(input)).toThrow()
  })

  it('rejeita route com mais de 200 caracteres', () => {
    const input = { event: 'route_visited', payload: { route: 'a'.repeat(201) } }
    expect(() => BehaviorEventSchema.parse(input)).toThrow()
  })
})

// ── trackBehaviorEvent ────────────────────────────────────────────────────────

describe('trackBehaviorEvent', () => {
  it('chama db.create com tenant_id, user_id, event e payload corretos', async () => {
    const db = criarDbMock()
    await trackBehaviorEvent(db, 'tenant-001', 'user-001', {
      event: 'filter_applied',
      payload: { filter_field: 'status', filter_value: 'atrasado' },
    })
    expect(db.userBehaviorEvent.create).toHaveBeenCalledWith({
      data: {
        tenant_id:  'tenant-001',
        product_id: 'pedido',
        user_id:    'user-001',
        event:      'filter_applied',
        payload:    { filter_field: 'status', filter_value: 'atrasado' },
      },
    })
  })

  it('não lança erro quando db.create falha (falha silenciosa)', async () => {
    const db = {
      userBehaviorEvent: {
        create: vi.fn().mockRejectedValue(new Error('DB offline')),
      },
    }
    await expect(
      trackBehaviorEvent(db, 'tenant-001', 'user-001', {
        event: 'route_visited',
        payload: { route: '/pedidos' },
      }),
    ).resolves.toBeUndefined()
  })
})

// ── getUserBehaviorScores ─────────────────────────────────────────────────────

describe('getUserBehaviorScores — multiplicadores por frequência', () => {
  it('retorna 1.2× para 1-2 eventos do mesmo insight', async () => {
    const db = criarDbMock([
      { event: 'filter_applied', payload: { filter_field: 'status', filter_value: 'atrasado' } },
      { event: 'filter_applied', payload: { filter_field: 'status', filter_value: 'atrasado' } },
    ])
    const scores = await getUserBehaviorScores(db, 'tenant-001', 'user-001')
    expect(scores['atrasados']).toBe(1.2)
  })

  it('retorna 1.5× para 3-5 eventos', async () => {
    const eventos = Array.from({ length: 4 }, () => ({
      event: 'route_visited',
      payload: { route: '/pedidos/lista?status=atrasado' },
    }))
    const db = criarDbMock(eventos)
    const scores = await getUserBehaviorScores(db, 'tenant-001', 'user-001')
    expect(scores['atrasados']).toBe(1.5)
  })

  it('retorna 2.0× para 6-10 eventos', async () => {
    const eventos = Array.from({ length: 8 }, () => ({
      event: 'route_visited',
      payload: { route: '/pedidos/lista?status=atrasado' },
    }))
    const db = criarDbMock(eventos)
    const scores = await getUserBehaviorScores(db, 'tenant-001', 'user-001')
    expect(scores['atrasados']).toBe(2.0)
  })

  it('retorna 2.5× para 11+ eventos', async () => {
    const eventos = Array.from({ length: 15 }, () => ({
      event: 'insight_clicked',
      payload: { insight_id: 'financeiro' },
    }))
    const db = criarDbMock(eventos)
    const scores = await getUserBehaviorScores(db, 'tenant-001', 'user-001')
    expect(scores['financeiro']).toBe(2.5)
  })

  it('retorna {} quando db falha (tabela inexistente)', async () => {
    const db = {
      userBehaviorEvent: {
        findMany: vi.fn().mockRejectedValue(new Error('relation does not exist')),
      },
    }
    const scores = await getUserBehaviorScores(db, 'tenant-001', 'user-001')
    expect(scores).toEqual({})
  })

  it('consulta com filtro por tenant_id e user_id', async () => {
    const db = criarDbMock([])
    await getUserBehaviorScores(db, 'tenant-xyz', 'user-abc')
    expect(db.userBehaviorEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenant_id: 'tenant-xyz',
          user_id:   'user-abc',
        }),
      }),
    )
  })

  it('retorna scores vazios quando não há eventos', async () => {
    const db = criarDbMock([])
    const scores = await getUserBehaviorScores(db, 'tenant-001', 'user-001')
    expect(scores).toEqual({})
  })

  it('computa scores independentes para diferentes insightIds', async () => {
    const db = criarDbMock([
      { event: 'filter_applied', payload: { filter_field: 'status', filter_value: 'atrasado' } },
      { event: 'filter_applied', payload: { filter_field: 'status', filter_value: 'atrasado' } },
      { event: 'filter_applied', payload: { filter_field: 'valor_total', filter_value: '' } },
      { event: 'filter_applied', payload: { filter_field: 'valor_total', filter_value: '' } },
      { event: 'filter_applied', payload: { filter_field: 'valor_total', filter_value: '' } },
      { event: 'filter_applied', payload: { filter_field: 'valor_total', filter_value: '' } },
    ])
    const scores = await getUserBehaviorScores(db, 'tenant-001', 'user-001')
    expect(scores['atrasados']).toBe(1.2)  // 2 eventos → 1.2×
    expect(scores['financeiro']).toBe(1.5) // 4 eventos → 1.5×
  })
})
