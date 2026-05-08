/**
 * fase4-pedidos.schema.test.ts — Testes unitários dos schemas Zod da Fase 4
 * + Regra empresa-da-org (lado-da-organização):
 *   - tipo_operacao=importacao  → suid_importador (empresa-da-org) E
 *                                  suid_exportador (contraparte) obrigatórios
 *   - tipo_operacao=exportacao  → suid_exportador (empresa-da-org) E
 *                                  suid_importador (contraparte) obrigatórios
 *   - suid_importador != suid_exportador (auto-referência bloqueada)
 *   - suid_fabricante sempre opcional
 */

import { describe, it, expect } from 'vitest'
import { criarPedidoSchema } from '../../../../../../servicos-global/produto/processos-core/src/routes/pedidos.js'
import { confirmarSchema } from '../../../../../../servicos-global/produto/processos-core/src/routes/importacao.js'

const pedidoBase = {
  numero_pedido: 'PO-001',
  itens: [],
}

// SUIDs de teste — empresa-da-org (BR-CDE) + contrapartes (CN/US)
const SUID_EMPRESA_DA_ORG = 'BR-CDE-00013'
const SUID_EXPORTADOR_ESTRANGEIRO = 'CN-ACME-00001'
const SUID_IMPORTADOR_ESTRANGEIRO = 'US-BUYER-00001'

describe('criarPedidoSchema — Fase 4 cross-field + lado-da-org', () => {
  it('aceita importacao com suid_importador (empresa-da-org) E suid_exportador', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'importacao',
      suid_importador: SUID_EMPRESA_DA_ORG,
      suid_exportador: SUID_EXPORTADOR_ESTRANGEIRO,
    })
    expect(parsed.success).toBe(true)
  })

  it('rejeita importacao sem suid_importador (empresa-da-org)', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'importacao',
      suid_exportador: SUID_EXPORTADOR_ESTRANGEIRO,
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('suid_importador'))
      expect(erro?.message).toMatch(/suid_importador.*empresa-da-org.*importacao/)
    }
  })

  it('rejeita importacao sem suid_exportador', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'importacao',
      suid_importador: SUID_EMPRESA_DA_ORG,
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('suid_exportador'))
      expect(erro?.message).toMatch(/suid_exportador e obrigatorio.*importacao/)
    }
  })

  it('aceita exportacao com suid_exportador (empresa-da-org) E suid_importador', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'exportacao',
      suid_exportador: SUID_EMPRESA_DA_ORG,
      suid_importador: SUID_IMPORTADOR_ESTRANGEIRO,
    })
    expect(parsed.success).toBe(true)
  })

  it('rejeita exportacao sem suid_exportador (empresa-da-org)', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'exportacao',
      suid_importador: SUID_IMPORTADOR_ESTRANGEIRO,
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('suid_exportador'))
      expect(erro?.message).toMatch(/suid_exportador.*empresa-da-org.*exportacao/)
    }
  })

  it('rejeita exportacao sem suid_importador', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'exportacao',
      suid_exportador: SUID_EMPRESA_DA_ORG,
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) => e.path.includes('suid_importador'))
      expect(erro?.message).toMatch(/suid_importador e obrigatorio.*exportacao/)
    }
  })

  it('rejeita auto-referência (suid_importador === suid_exportador)', () => {
    const parsed = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'importacao',
      suid_importador: SUID_EMPRESA_DA_ORG,
      suid_exportador: SUID_EMPRESA_DA_ORG, // mesmo SUID — proibido
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const erro = parsed.error.errors.find((e) =>
        /devem ser empresas diferentes/.test(e.message),
      )
      expect(erro).toBeDefined()
    }
  })

  it('aceita suid_fabricante opcional em qualquer tipo', () => {
    const importacao = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'importacao',
      suid_importador: SUID_EMPRESA_DA_ORG,
      suid_exportador: SUID_EXPORTADOR_ESTRANGEIRO,
      suid_fabricante: 'CN-FACTORY-00001',
    })
    expect(importacao.success).toBe(true)

    const exportacao = criarPedidoSchema.safeParse({
      ...pedidoBase,
      tipo_operacao: 'exportacao',
      suid_exportador: SUID_EMPRESA_DA_ORG,
      suid_importador: SUID_IMPORTADOR_ESTRANGEIRO,
      // sem suid_fabricante
    })
    expect(exportacao.success).toBe(true)
  })

  it('numero_pedido continua obrigatório', () => {
    const parsed = criarPedidoSchema.safeParse({
      tipo_operacao: 'importacao',
      suid_importador: SUID_EMPRESA_DA_ORG,
      suid_exportador: SUID_EXPORTADOR_ESTRANGEIRO,
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
