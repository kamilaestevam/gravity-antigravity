import { describe, it, expect } from 'vitest'
import { IngestHistorySchema, ListHistoryQuerySchema, TipoAtorHistoricoLogEnum } from '../history.schema.js'

// ── TipoAtorHistoricoLogEnum ──────────────────────────────────────────────────

describe('TipoAtorHistoricoLogEnum', () => {
  const VALID = ['USUARIO', 'API', 'IA', 'JOB', 'INTEGRACAO'] as const

  VALID.forEach((tipo) => {
    it(`aceita tipo válido: ${tipo}`, () => {
      expect(TipoAtorHistoricoLogEnum.safeParse(tipo).success).toBe(true)
    })
  })

  it('rejeita tipo inválido: GABI_IA', () => {
    expect(TipoAtorHistoricoLogEnum.safeParse('GABI_IA').success).toBe(false)
  })

  it('rejeita tipo inválido: usuario (minúsculo)', () => {
    expect(TipoAtorHistoricoLogEnum.safeParse('usuario').success).toBe(false)
  })

  it('rejeita tipo inválido: string vazia', () => {
    expect(TipoAtorHistoricoLogEnum.safeParse('').success).toBe(false)
  })
})

// ── IngestHistorySchema ────────────────────────────────────────────────────────

const VALID_PAYLOAD = {
  tipo_ator_historico_log: 'USUARIO',
  id_ator_historico_log: 'user-123',
  nome_ator_historico_log: 'Daniel',
  modulo_historico_log: 'pedido',
  tipo_recurso_historico_log: 'Pedido',
  acao_historico_log: 'CREATE',
  detalhe_acao_historico_log: 'Criou o pedido #001',
}

describe('IngestHistorySchema', () => {
  it('aceita payload mínimo válido', () => {
    const result = IngestHistorySchema.safeParse(VALID_PAYLOAD)
    expect(result.success).toBe(true)
  })

  it('aceita payload completo com campos opcionais', () => {
    const full = {
      ...VALID_PAYLOAD,
      ip_ator_historico_log: '192.168.1.1',
      metadata_ator_historico_log: { browser: 'Chrome' },
      id_recurso_historico_log: 'pedido-456',
      estado_anterior_historico_log: { status: 'RASCUNHO' },
      estado_posterior_historico_log: { status: 'CONFIRMADO' },
      status_historico_log: 'SUCESSO',
      mensagem_erro_historico_log: undefined,
      id_produto_historico_log: 'prod-001',
      id_usuario: 'user-123',
    }
    expect(IngestHistorySchema.safeParse(full).success).toBe(true)
  })

  it('rejeita tipo_ator_historico_log inválido', () => {
    const result = IngestHistorySchema.safeParse({ ...VALID_PAYLOAD, tipo_ator_historico_log: 'GABI_IA' })
    expect(result.success).toBe(false)
  })

  it('rejeita id_ator_historico_log vazio', () => {
    const result = IngestHistorySchema.safeParse({ ...VALID_PAYLOAD, id_ator_historico_log: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita nome_ator_historico_log vazio', () => {
    const result = IngestHistorySchema.safeParse({ ...VALID_PAYLOAD, nome_ator_historico_log: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita modulo_historico_log ausente', () => {
    const { modulo_historico_log: _m, ...sem } = VALID_PAYLOAD
    expect(IngestHistorySchema.safeParse(sem).success).toBe(false)
  })

  it('rejeita detalhe_acao_historico_log ausente', () => {
    const { detalhe_acao_historico_log: _a, ...sem } = VALID_PAYLOAD
    expect(IngestHistorySchema.safeParse(sem).success).toBe(false)
  })

  it('status_historico_log inválido é rejeitado', () => {
    const result = IngestHistorySchema.safeParse({ ...VALID_PAYLOAD, status_historico_log: 'OK' })
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
