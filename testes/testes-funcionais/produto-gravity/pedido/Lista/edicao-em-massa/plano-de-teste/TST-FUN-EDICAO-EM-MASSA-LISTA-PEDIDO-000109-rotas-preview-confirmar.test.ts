// TST-FUN-EDICAO-EM-MASSA-LISTA-PEDIDO-000109 — rotas preview/confirmar (Zod)
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const CampoSchema = z.object({
  campo: z.string().min(1),
  tipo: z.enum(['texto', 'numero', 'data', 'select', 'usuario', 'ncm']),
  nivel: z.enum(['pedido', 'item']),
  operacao: z.enum(['substituir', 'somar', 'subtrair', 'percentual', 'avancar_dias', 'recuar_dias']),
  valor: z.union([z.string(), z.number()]),
})

const CAMPOS_UNIQUE_PEDIDO = new Set<string>(['numero_pedido'])

const EdicaoMassaSchema = z.object({
  pedido_ids: z.array(z.string().min(1)).min(1, 'Selecione ao menos 1 pedido para editar'),
  item_ids: z.array(z.string().min(1)).optional(),
  pedido_ids_completo: z.array(z.string().min(1)).optional(),
  campos: z.array(CampoSchema).min(1, 'Selecione ao menos 1 campo para editar'),
  nivel: z.enum(['pedido', 'item', 'combinado']),
}).superRefine((data, ctx) => {
  if (data.pedido_ids.length > 1) {
    for (const c of data.campos) {
      if (CAMPOS_UNIQUE_PEDIDO.has(c.campo) && c.operacao === 'substituir') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['campos'],
          message: `O campo "Número do Pedido" não pode receber o mesmo valor em ${data.pedido_ids.length} pedidos`,
        })
      }
    }
  }
})

describe('TST-FUN-EDICAO-EM-MASSA-LISTA-PEDIDO-000109 — Zod rotas', () => {
  it('F01: payload válido 1 pedido + 1 campo', () => {
    const r = EdicaoMassaSchema.safeParse({
      pedido_ids: ['ped_001'],
      campos: [{ campo: 'observacao', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'x' }],
      nivel: 'pedido',
    })
    expect(r.success).toBe(true)
  })

  it('F02: campos vazio → rejeita', () => {
    const r = EdicaoMassaSchema.safeParse({ pedido_ids: ['p1'], campos: [], nivel: 'pedido' })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues.map(i => i.message)).toContain('Selecione ao menos 1 campo para editar')
    }
  })

  it('F03: pedido_ids vazio → rejeita', () => {
    const r = EdicaoMassaSchema.safeParse({
      pedido_ids: [],
      campos: [{ campo: 'obs', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'x' }],
      nivel: 'pedido',
    })
    expect(r.success).toBe(false)
  })

  it('F04: 2 pedidos + substituir numero_pedido → unique', () => {
    const r = EdicaoMassaSchema.safeParse({
      pedido_ids: ['p1', 'p2'],
      campos: [{ campo: 'numero_pedido', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'X' }],
      nivel: 'pedido',
    })
    expect(r.success).toBe(false)
  })

  it('F05: campo data YYYY-MM-DD → aceita', () => {
    const r = EdicaoMassaSchema.safeParse({
      pedido_ids: ['p1'],
      campos: [{ campo: 'data_emissao_pedido', tipo: 'data', nivel: 'pedido', operacao: 'substituir', valor: '2026-07-15' }],
      nivel: 'pedido',
    })
    expect(r.success).toBe(true)
  })

  it('F08: seleção mista combinado → aceita', () => {
    const r = EdicaoMassaSchema.safeParse({
      pedido_ids: ['p1', 'p2'],
      pedido_ids_completo: ['p1'],
      item_ids: ['i5'],
      campos: [{ campo: 'preco_unitario', tipo: 'numero', nivel: 'item', operacao: 'percentual', valor: 10 }],
      nivel: 'combinado',
    })
    expect(r.success).toBe(true)
  })
})
