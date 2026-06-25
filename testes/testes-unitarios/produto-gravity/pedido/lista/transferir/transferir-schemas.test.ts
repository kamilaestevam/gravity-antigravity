// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

/**
 * Testes Unitários — Zod Schemas de Transferência
 *
 * Cobre: U-TZD-01 a U-TZD-31
 * Replica os schemas locais do router (não exportados) para validação isolada.
 */

// ── Réplica dos schemas (espelha transferencias-pedido.ts) ───────────────────

const DestinoSchema = z.object({
  tipo: z.enum(['novo', 'existente', 'mesmo']),
  pedido_id: z.string().min(1).optional(),
  quantidade: z.number().positive('Quantidade deve ser maior que zero'),
  part_number: z.string().min(1).optional(),
  data_embarque: z.string().optional(),
  porto_destino: z.string().optional(),
  company_id: z.string().optional(),
})

const CenarioSchema = z.enum([
  'reducao_simples',
  'split_novo_pedido',
  'split_pedido_existente',
  'multi_split',
  'substituicao_pura',
  'split_substituicao',
  'split_data',
  'split_destino_logistico',
  'transfer_intercompany',
  'reversao',
  'agrupamento_inverso',
])

const PreviewSchema = z.object({
  cenario: CenarioSchema,
  pedido_id: z.string().min(1),
  item_id: z.string().min(1),
  quantidade_origem: z.number().positive('Quantidade de origem deve ser maior que zero'),
  destinos: z.array(DestinoSchema).default([]),
})

const ConfirmarSchema = PreviewSchema.extend({
  numero_pedido_novo: z.string().min(1).optional(),
  reverter_transfer_id: z.string().optional(),
  confirmar_tipos_divergentes: z.boolean().optional(),
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const PAYLOAD_VALIDO = {
  cenario: 'split_novo_pedido' as const,
  pedido_id: 'ped-001',
  item_id: 'itm-001',
  quantidade_origem: 30,
  destinos: [{ tipo: 'novo' as const, quantidade: 30 }],
}

const TODOS_CENARIOS = [
  'reducao_simples',
  'split_novo_pedido',
  'split_pedido_existente',
  'multi_split',
  'substituicao_pura',
  'split_substituicao',
  'split_data',
  'split_destino_logistico',
  'transfer_intercompany',
  'reversao',
  'agrupamento_inverso',
]

// ── PreviewSchema ────────────────────────────────────────────────────────────

describe('PreviewSchema', () => {
  it('U-TZD-01: Payload válido completo → success', () => {
    const result = PreviewSchema.safeParse(PAYLOAD_VALIDO)
    expect(result.success).toBe(true)
  })

  it('U-TZD-02: Sem cenário → falha', () => {
    const { cenario: _, ...semCenario } = PAYLOAD_VALIDO
    const result = PreviewSchema.safeParse(semCenario)
    expect(result.success).toBe(false)
  })

  it('U-TZD-03: Cenário inválido → falha', () => {
    const result = PreviewSchema.safeParse({ ...PAYLOAD_VALIDO, cenario: 'invalido' })
    expect(result.success).toBe(false)
  })

  it('U-TZD-04: pedido_id vazio → falha', () => {
    const result = PreviewSchema.safeParse({ ...PAYLOAD_VALIDO, pedido_id: '' })
    expect(result.success).toBe(false)
  })

  it('U-TZD-05: item_id vazio → falha', () => {
    const result = PreviewSchema.safeParse({ ...PAYLOAD_VALIDO, item_id: '' })
    expect(result.success).toBe(false)
  })

  it('U-TZD-06: quantidade_origem zero → falha', () => {
    const result = PreviewSchema.safeParse({ ...PAYLOAD_VALIDO, quantidade_origem: 0 })
    expect(result.success).toBe(false)
  })

  it('U-TZD-07: quantidade_origem negativa → falha', () => {
    const result = PreviewSchema.safeParse({ ...PAYLOAD_VALIDO, quantidade_origem: -10 })
    expect(result.success).toBe(false)
  })

  it('U-TZD-08: Destinos omitido → default vazio', () => {
    const { destinos: _, ...semDestinos } = PAYLOAD_VALIDO
    const result = PreviewSchema.safeParse(semDestinos)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.destinos).toEqual([])
    }
  })
})

// ── ConfirmarSchema ──────────────────────────────────────────────────────────

describe('ConfirmarSchema', () => {
  it('U-TZD-10: Extends PreviewSchema com campos extras → success', () => {
    const result = ConfirmarSchema.safeParse({
      ...PAYLOAD_VALIDO,
      numero_pedido_novo: 'PO-TRANS-001',
      confirmar_tipos_divergentes: true,
    })
    expect(result.success).toBe(true)
  })

  it('U-TZD-11: numero_pedido_novo vazio → falha', () => {
    const result = ConfirmarSchema.safeParse({
      ...PAYLOAD_VALIDO,
      numero_pedido_novo: '',
    })
    expect(result.success).toBe(false)
  })

  it('U-TZD-12: confirmar_tipos_divergentes boolean → success', () => {
    const result = ConfirmarSchema.safeParse({
      ...PAYLOAD_VALIDO,
      confirmar_tipos_divergentes: false,
    })
    expect(result.success).toBe(true)
  })
})

// ── DestinoSchema ────────────────────────────────────────────────────────────

describe('DestinoSchema', () => {
  it('U-TZD-20: Destino tipo=novo válido', () => {
    const result = DestinoSchema.safeParse({ tipo: 'novo', quantidade: 30 })
    expect(result.success).toBe(true)
  })

  it('U-TZD-21: Destino tipo=existente com pedido_id', () => {
    const result = DestinoSchema.safeParse({
      tipo: 'existente',
      pedido_id: 'ped-002',
      quantidade: 20,
    })
    expect(result.success).toBe(true)
  })

  it('U-TZD-22: Destino tipo inválido → falha', () => {
    const result = DestinoSchema.safeParse({ tipo: 'outro', quantidade: 10 })
    expect(result.success).toBe(false)
  })

  it('U-TZD-23: Destino quantidade zero → falha', () => {
    const result = DestinoSchema.safeParse({ tipo: 'novo', quantidade: 0 })
    expect(result.success).toBe(false)
  })

  it('U-TZD-24: Destino quantidade negativa → falha', () => {
    const result = DestinoSchema.safeParse({ tipo: 'novo', quantidade: -5 })
    expect(result.success).toBe(false)
  })
})

// ── CenarioSchema ────────────────────────────────────────────────────────────

describe('CenarioSchema', () => {
  it('U-TZD-30: Cada cenário válido (11 valores)', () => {
    for (const cenario of TODOS_CENARIOS) {
      const result = CenarioSchema.safeParse(cenario)
      expect(result.success, `Cenário "${cenario}" deveria ser válido`).toBe(true)
    }
  })

  it('U-TZD-31: Cenário inválido → falha', () => {
    const result = CenarioSchema.safeParse('nao_existe')
    expect(result.success).toBe(false)
  })
})
