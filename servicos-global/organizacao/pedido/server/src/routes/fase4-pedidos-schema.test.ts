/**
 * fase4-pedidos.schema.test.ts — Testes unitários dos schemas Zod da Fase 4.
 *
 * Cobre a regra cross-field introduzida:
 *   - tipo_operacao=importacao  → suid_exportador obrigatório
 *   - tipo_operacao=exportacao  → suid_importador obrigatório
 *   - suid_fabricante sempre opcional
 */

import { describe, it, expect } from 'vitest'
import { criarPedidoSchema } from '../../../../../../servicos-global/organizacao/processos-core/src/routes/pedidos.js'
import { confirmarSchema } from '../../../../../../servicos-global/organizacao/processos-core/src/routes/importacao.js'

const pedidoBase = {
  numero_pedido: 'PO-001',
  itens: [],
}

describe('criarPedidoSchema — Fase 4 cross-field', () => {
  it('aceita importacao com suid_exportador', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'importacao',
      suid_exportador: 'CN-ACME-00001',
    })
    expect(parsed.success).toBe(true)
  })

  it('rejeita importacao sem suid_exportador', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'importacao',
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('suid_exportador'))
      expect(erro?.message).toMatch(/suid_exportador e obrigatorio.*importacao/)
    }
  })

  it('aceita exportacao com suid_importador', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'exportacao',
      suid_importador: 'US-BUYER-00001',
    })
    expect(parsed.success).toBe(true)
  })

  it('rejeita exportacao sem suid_importador', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'exportacao',
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('suid_importador'))
      expect(erro?.message).toMatch(/suid_importador e obrigatorio.*exportacao/)
    }
  })

  it('aceita suid_fabricante opcional em qualquer tipo', () => {
    const importacao = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'importacao',
      suid_exportador: 'CN-ACME-00001',
      suid_fabricante: 'CN-FACTORY-00001',
    })
    expect(importacao.success).toBe(true)

    const exportacao = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'exportacao',
      suid_importador: 'US-BUYER-00001',
      // sem suid_fabricante
    })
    expect(exportacao.success).toBe(true)
  })

  it('numero_pedido continua obrigatório', () => {
    const parsed = criarPedidoSchema.safeParse({
      tipo_operacao: 'importacao',
      suid_exportador: 'CN-ACME-00001',
    })
    expect(parsed.success).toBe(false)
  })
})

describe('confirmarSchema (importacao em batch) — Fase 4 cross-field', () => {
  const pedidoBatchValido = {
    numero_pedido: 'PO-001',
    tipo_operacao: 'importacao' as const,
    suid_exportador: 'CN-ACME-00001',
    itens: [
      {
        part_number: 'PN-1',
        ncm: '12345678',
        descricao_item: 'Item 1',
        quantidade_inicial_pedido: 10,
      },
    ],
  }

  it('aceita batch válido com SUIDs', () => {
    const parsed = confirmarSchema.safeParse({ pedidos: [pedidoBatchValido] })
    expect(parsed.success).toBe(true)
  })

  it('rejeita se algum pedido do batch viola cross-field', () => {
    const parsed = confirmarSchema.safeParse({
      pedidos: [
        pedidoBatchValido,
        { ...pedidoBatchValido, tipo_operacao: 'exportacao', suid_exportador: undefined },
      ],
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) =>
        e.path.includes('suid_importador'),
      )
      expect(erro?.message).toMatch(/suid_importador e obrigatorio.*exportacao/)
    }
  })

  it('rejeita batch vazio', () => {
    const parsed = confirmarSchema.safeParse({ pedidos: [] })
    expect(parsed.success).toBe(false)
  })
})
