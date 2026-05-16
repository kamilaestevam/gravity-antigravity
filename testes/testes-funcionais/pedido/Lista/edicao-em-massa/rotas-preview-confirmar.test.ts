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

describe('Edição em Massa — Validação Zod (rotas /preview e /confirmar)', () => {
  it('F01: payload válido com 1 pedido e 1 campo texto → parse aceita', () => {
    const payload = {
      pedido_ids: ['ped_001'],
      campos: [
        { campo: 'observacao', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'Nota atualizada' },
      ],
      nivel: 'pedido',
    }

    const resultado = EdicaoMassaSchema.safeParse(payload)
    expect(resultado.success).toBe(true)
  })

  it('F02: array de campos vazio → parse rejeita com "Selecione ao menos 1 campo"', () => {
    const payload = {
      pedido_ids: ['ped_001'],
      campos: [],
      nivel: 'pedido',
    }

    const resultado = EdicaoMassaSchema.safeParse(payload)
    expect(resultado.success).toBe(false)

    if (!resultado.success) {
      const mensagens = resultado.error.issues.map(i => i.message)
      expect(mensagens).toContain('Selecione ao menos 1 campo para editar')
    }
  })

  it('F03: array de pedido_ids vazio → parse rejeita com "Selecione ao menos 1 pedido"', () => {
    const payload = {
      pedido_ids: [],
      campos: [
        { campo: 'observacao', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'x' },
      ],
      nivel: 'pedido',
    }

    const resultado = EdicaoMassaSchema.safeParse(payload)
    expect(resultado.success).toBe(false)

    if (!resultado.success) {
      const mensagens = resultado.error.issues.map(i => i.message)
      expect(mensagens).toContain('Selecione ao menos 1 pedido para editar')
    }
  })

  it('F04: payload válido com 3 pedidos e campo numero com operação somar → parse aceita', () => {
    const payload = {
      pedido_ids: ['ped_001', 'ped_002', 'ped_003'],
      campos: [
        { campo: 'qtd_comercial', tipo: 'numero', nivel: 'item', operacao: 'somar', valor: 10 },
      ],
      nivel: 'item',
    }

    const resultado = EdicaoMassaSchema.safeParse(payload)
    expect(resultado.success).toBe(true)
  })

  it('F05: tipo inválido "invalido" → parse rejeita', () => {
    const payload = {
      pedido_ids: ['ped_001'],
      campos: [
        { campo: 'observacao', tipo: 'invalido', nivel: 'pedido', operacao: 'substituir', valor: 'x' },
      ],
      nivel: 'pedido',
    }

    const resultado = EdicaoMassaSchema.safeParse(payload)
    expect(resultado.success).toBe(false)
  })

  it('F06: operação inválida "deletar" → parse rejeita', () => {
    const payload = {
      pedido_ids: ['ped_001'],
      campos: [
        { campo: 'observacao', tipo: 'texto', nivel: 'pedido', operacao: 'deletar', valor: 'x' },
      ],
      nivel: 'pedido',
    }

    const resultado = EdicaoMassaSchema.safeParse(payload)
    expect(resultado.success).toBe(false)
  })

  it('F07: numero_pedido + substituir + 2 pedidos → superRefine rejeita', () => {
    const payload = {
      pedido_ids: ['ped_001', 'ped_002'],
      campos: [
        { campo: 'numero_pedido', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'PED-999' },
      ],
      nivel: 'pedido',
    }

    const resultado = EdicaoMassaSchema.safeParse(payload)
    expect(resultado.success).toBe(false)

    if (!resultado.success) {
      const mensagens = resultado.error.issues.map(i => i.message)
      expect(mensagens.some(m => m.includes('Número do Pedido'))).toBe(true)
      expect(mensagens.some(m => m.includes('2 pedidos'))).toBe(true)
    }
  })

  it('F08: numero_pedido + substituir + 1 pedido → parse aceita (único pedido permite)', () => {
    const payload = {
      pedido_ids: ['ped_001'],
      campos: [
        { campo: 'numero_pedido', tipo: 'texto', nivel: 'pedido', operacao: 'substituir', valor: 'PED-999' },
      ],
      nivel: 'pedido',
    }

    const resultado = EdicaoMassaSchema.safeParse(payload)
    expect(resultado.success).toBe(true)
  })

  it('F09: numero_pedido + somar + 3 pedidos → parse aceita (operação não é substituir)', () => {
    const payload = {
      pedido_ids: ['ped_001', 'ped_002', 'ped_003'],
      campos: [
        { campo: 'numero_pedido', tipo: 'numero', nivel: 'pedido', operacao: 'somar', valor: 1 },
      ],
      nivel: 'pedido',
    }

    const resultado = EdicaoMassaSchema.safeParse(payload)
    expect(resultado.success).toBe(true)
  })

  it('F10: nível combinado com pedido_ids_completo → parse aceita', () => {
    const payload = {
      pedido_ids: ['ped_001', 'ped_002', 'ped_003'],
      pedido_ids_completo: ['ped_001'],
      item_ids: ['item_005', 'item_006'],
      campos: [
        { campo: 'preco_unitario', tipo: 'numero', nivel: 'item', operacao: 'percentual', valor: 15 },
      ],
      nivel: 'combinado',
    }

    const resultado = EdicaoMassaSchema.safeParse(payload)
    expect(resultado.success).toBe(true)
  })
})
