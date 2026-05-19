// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

/**
 * Testes unitários dos Schemas Zod de duplicação de pedidos.
 *
 * Cobre:
 *   - OpcoesDuplicacaoSchema (10 casos: U-ZOD-01 a U-ZOD-10)
 *   - DuplicarPreviewSchema (6 casos: U-ZOD-11 a U-ZOD-16)
 *   - DuplicarConfirmarSchema (10 casos: U-ZOD-17 a U-ZOD-26)
 *   - DuplicarItensSchema (6 casos: U-ZOD-27 a U-ZOD-32)
 *
 * Fonte: servicos-global/produto/pedido/server/src/routes/duplicacoes-pedido.ts
 */

// ── Réplica dos schemas (teste puro sem dependência de runtime do app) ────────

const OpcoesDuplicacaoSchema = z.object({
  copiar_datas: z.boolean(),
  copiar_valores_precos: z.boolean(),
  copiar_referencias_externas: z.boolean(),
  copiar_pesos_cubagem: z.boolean(),
  copiar_descricoes_complementares: z.boolean(),
})

const DuplicarPreviewSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Selecione ao menos 1 pedido para duplicar'),
})

const DuplicarConfirmarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  numeros: z.record(z.string()).optional(),
  opcoes: OpcoesDuplicacaoSchema.optional(),
})

const DuplicarItensSchema = z.object({
  pedido_id: z.string().min(1),
  item_ids: z.array(z.string().min(1)).min(1),
  opcoes: OpcoesDuplicacaoSchema.optional(),
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const OPCOES_ALL_TRUE = {
  copiar_datas: true,
  copiar_valores_precos: true,
  copiar_referencias_externas: true,
  copiar_pesos_cubagem: true,
  copiar_descricoes_complementares: true,
}

const OPCOES_ALL_FALSE = {
  copiar_datas: false,
  copiar_valores_precos: false,
  copiar_referencias_externas: false,
  copiar_pesos_cubagem: false,
  copiar_descricoes_complementares: false,
}

// ── OpcoesDuplicacaoSchema ────────────────────────────────────────────────────

describe('OpcoesDuplicacaoSchema', () => {
  it('U-ZOD-01: aceita objeto completo com todos true', () => {
    const result = OpcoesDuplicacaoSchema.safeParse(OPCOES_ALL_TRUE)
    expect(result.success).toBe(true)
  })

  it('U-ZOD-02: aceita objeto completo com todos false', () => {
    const result = OpcoesDuplicacaoSchema.safeParse(OPCOES_ALL_FALSE)
    expect(result.success).toBe(true)
  })

  it('U-ZOD-03: rejeita copiar_datas ausente', () => {
    const { copiar_datas: _, ...sem } = OPCOES_ALL_TRUE
    const result = OpcoesDuplicacaoSchema.safeParse(sem)
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields).toHaveProperty('copiar_datas')
    }
  })

  it('U-ZOD-04: rejeita copiar_valores_precos ausente', () => {
    const { copiar_valores_precos: _, ...sem } = OPCOES_ALL_TRUE
    const result = OpcoesDuplicacaoSchema.safeParse(sem)
    expect(result.success).toBe(false)
  })

  it('U-ZOD-05: rejeita copiar_referencias_externas ausente', () => {
    const { copiar_referencias_externas: _, ...sem } = OPCOES_ALL_TRUE
    const result = OpcoesDuplicacaoSchema.safeParse(sem)
    expect(result.success).toBe(false)
  })

  it('U-ZOD-06: rejeita copiar_pesos_cubagem ausente', () => {
    const { copiar_pesos_cubagem: _, ...sem } = OPCOES_ALL_TRUE
    const result = OpcoesDuplicacaoSchema.safeParse(sem)
    expect(result.success).toBe(false)
  })

  it('U-ZOD-07: rejeita copiar_descricoes_complementares ausente', () => {
    const { copiar_descricoes_complementares: _, ...sem } = OPCOES_ALL_TRUE
    const result = OpcoesDuplicacaoSchema.safeParse(sem)
    expect(result.success).toBe(false)
  })

  it('U-ZOD-08: rejeita string em vez de boolean', () => {
    const result = OpcoesDuplicacaoSchema.safeParse({
      ...OPCOES_ALL_TRUE,
      copiar_datas: 'true',
    })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-09: rejeita objeto vazio com 5 fieldErrors', () => {
    const result = OpcoesDuplicacaoSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(Object.keys(fields)).toHaveLength(5)
    }
  })

  it('U-ZOD-10: aceita campo extra (Zod strip por default)', () => {
    const result = OpcoesDuplicacaoSchema.safeParse({
      ...OPCOES_ALL_TRUE,
      copiar_xyz: true,
    })
    expect(result.success).toBe(true)
  })
})

// ── DuplicarPreviewSchema ─────────────────────────────────────────────────────

describe('DuplicarPreviewSchema', () => {
  it('U-ZOD-11: aceita array com 2 ids', () => {
    const result = DuplicarPreviewSchema.safeParse({ ids: ['id1', 'id2'] })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-12: rejeita array vazio com mensagem correta', () => {
    const result = DuplicarPreviewSchema.safeParse({ ids: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msg = result.error.flatten().fieldErrors.ids?.[0]
      expect(msg).toContain('Selecione ao menos 1')
    }
  })

  it('U-ZOD-13: rejeita string vazia dentro do array', () => {
    const result = DuplicarPreviewSchema.safeParse({ ids: [''] })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-14: rejeita body sem ids', () => {
    const result = DuplicarPreviewSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('U-ZOD-15: rejeita ids como string em vez de array', () => {
    const result = DuplicarPreviewSchema.safeParse({ ids: 'nao-array' })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-16: rejeita numero dentro do array', () => {
    const result = DuplicarPreviewSchema.safeParse({ ids: [123] })
    expect(result.success).toBe(false)
  })
})

// ── DuplicarConfirmarSchema ───────────────────────────────────────────────────

describe('DuplicarConfirmarSchema', () => {
  it('U-ZOD-17: aceita payload completo com numeros e opcoes', () => {
    const result = DuplicarConfirmarSchema.safeParse({
      ids: ['id1'],
      numeros: { id1: 'PED-001' },
      opcoes: OPCOES_ALL_TRUE,
    })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-18: aceita payload sem numeros (opcional)', () => {
    const result = DuplicarConfirmarSchema.safeParse({ ids: ['id1'] })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-19: aceita payload sem opcoes (opcional)', () => {
    const result = DuplicarConfirmarSchema.safeParse({
      ids: ['id1'],
      numeros: { id1: 'NUM-1' },
    })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-20: rejeita ids vazio', () => {
    const result = DuplicarConfirmarSchema.safeParse({ ids: [] })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-21: rejeita body vazio', () => {
    const result = DuplicarConfirmarSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('U-ZOD-22: rejeita ids com string vazia', () => {
    const result = DuplicarConfirmarSchema.safeParse({ ids: [''] })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-23: aceita numeros como record vazio', () => {
    const result = DuplicarConfirmarSchema.safeParse({
      ids: ['id1'],
      numeros: {},
    })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-24: rejeita opcoes incompleto (falta campo)', () => {
    const result = DuplicarConfirmarSchema.safeParse({
      ids: ['id1'],
      opcoes: { copiar_datas: true },
    })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-25: aceita ids com caractere adversarial <script>', () => {
    // Zod aceita qualquer string min(1) — não faz sanitização HTML
    const result = DuplicarConfirmarSchema.safeParse({ ids: ['<script>alert(1)</script>'] })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-26: aceita multiple ids válidos', () => {
    const result = DuplicarConfirmarSchema.safeParse({
      ids: ['ped-001', 'ped-002', 'ped-003'],
      numeros: { 'ped-001': 'A', 'ped-002': 'B', 'ped-003': 'C' },
      opcoes: OPCOES_ALL_FALSE,
    })
    expect(result.success).toBe(true)
  })
})

// ── DuplicarItensSchema ───────────────────────────────────────────────────────

describe('DuplicarItensSchema', () => {
  it('U-ZOD-27: aceita payload válido com pedido_id e item_ids', () => {
    const result = DuplicarItensSchema.safeParse({
      pedido_id: 'ped-001',
      item_ids: ['it-001', 'it-002'],
    })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-28: rejeita pedido_id vazio', () => {
    const result = DuplicarItensSchema.safeParse({
      pedido_id: '',
      item_ids: ['it-001'],
    })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-29: rejeita item_ids vazio', () => {
    const result = DuplicarItensSchema.safeParse({
      pedido_id: 'ped-001',
      item_ids: [],
    })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-30: rejeita body vazio', () => {
    const result = DuplicarItensSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('U-ZOD-31: rejeita pedido_id ausente', () => {
    const result = DuplicarItensSchema.safeParse({ item_ids: ['it-001'] })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-32: aceita com opcoes completas', () => {
    const result = DuplicarItensSchema.safeParse({
      pedido_id: 'ped-001',
      item_ids: ['it-001'],
      opcoes: OPCOES_ALL_FALSE,
    })
    expect(result.success).toBe(true)
  })
})
