// @vitest-environment node
/**
 * TST-UNI-PEDIDO-CONSOLIDAR — Schemas Zod
 *
 * Testa PreviewSchema e ConfirmarSchema isoladamente (sem HTTP).
 * Cobre: U-ZOD-01 a U-ZOD-18
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Schemas replicados do router (não exportados, então recriamos aqui identicamente)
const PreviewSchema = z.object({
  ids: z.array(z.string().min(1)).min(2, 'Selecione ao menos 2 pedidos para consolidar'),
})

const ConfirmarSchema = z.object({
  ids: z.array(z.string().min(1)).min(2, 'Selecione ao menos 2 pedidos para consolidar'),
  numero_pedido: z.string().min(1).max(100),
  campos_escolhidos: z.record(z.union([z.string(), z.number(), z.null()])),
  fundir_itens_mesmo_part_number: z.boolean(),
})

// ── PreviewSchema ────────────────────────────────────────────────────────────

describe('PreviewSchema — Validação Zod', () => {
  it('U-ZOD-01: ids com 2 strings válidas → aceita', () => {
    const result = PreviewSchema.safeParse({ ids: ['ped-001', 'ped-002'] })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-02: ids com 3+ strings → aceita', () => {
    const result = PreviewSchema.safeParse({ ids: ['a', 'b', 'c'] })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-03: ids vazio → rejeita com mensagem "ao menos 2"', () => {
    const result = PreviewSchema.safeParse({ ids: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.ids?.[0]).toContain('ao menos 2')
    }
  })

  it('U-ZOD-04: ids com 1 só → rejeita', () => {
    const result = PreviewSchema.safeParse({ ids: ['a'] })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-05: ids com string vazia → rejeita', () => {
    const result = PreviewSchema.safeParse({ ids: ['', 'b'] })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-06: ids com número → rejeita', () => {
    const result = PreviewSchema.safeParse({ ids: [1, 2] })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-07: body vazio → rejeita', () => {
    const result = PreviewSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('U-ZOD-08: ids com null → rejeita', () => {
    const result = PreviewSchema.safeParse({ ids: [null, 'b'] })
    expect(result.success).toBe(false)
  })
})

// ── ConfirmarSchema ──────────────────────────────────────────────────────────

describe('ConfirmarSchema — Validação Zod', () => {
  const BASE = {
    ids: ['ped-001', 'ped-002'],
    numero_pedido: 'PO-CONS-2026/001',
    campos_escolhidos: {},
    fundir_itens_mesmo_part_number: true,
  }

  it('U-ZOD-10: Payload completo válido → aceita', () => {
    const result = ConfirmarSchema.safeParse(BASE)
    expect(result.success).toBe(true)
  })

  it('U-ZOD-11: numero_pedido vazio → rejeita', () => {
    const result = ConfirmarSchema.safeParse({ ...BASE, numero_pedido: '' })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-12: numero_pedido > 100 chars → rejeita', () => {
    const result = ConfirmarSchema.safeParse({ ...BASE, numero_pedido: 'A'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('U-ZOD-13: Sem fundir_itens_mesmo_part_number → rejeita', () => {
    const { fundir_itens_mesmo_part_number: _, ...semFlag } = BASE
    const result = ConfirmarSchema.safeParse(semFlag)
    expect(result.success).toBe(false)
  })

  it('U-ZOD-14: campos_escolhidos com valor string → aceita', () => {
    const result = ConfirmarSchema.safeParse({ ...BASE, campos_escolhidos: { incoterm: 'CIF' } })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-15: campos_escolhidos com valor número → aceita', () => {
    const result = ConfirmarSchema.safeParse({ ...BASE, campos_escolhidos: { taxa: 42 } })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-16: campos_escolhidos com valor null → aceita', () => {
    const result = ConfirmarSchema.safeParse({ ...BASE, campos_escolhidos: { campo: null } })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-17: campos_escolhidos vazio {} → aceita', () => {
    const result = ConfirmarSchema.safeParse({ ...BASE, campos_escolhidos: {} })
    expect(result.success).toBe(true)
  })

  it('U-ZOD-18: ids com 1 só → rejeita (min 2)', () => {
    const result = ConfirmarSchema.safeParse({ ...BASE, ids: ['a'] })
    expect(result.success).toBe(false)
  })
})
