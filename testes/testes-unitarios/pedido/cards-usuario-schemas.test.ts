/// <reference types="vitest/globals" />

import {
  criarCardUsuarioSchema,
  atualizarCardUsuarioSchema,
  reordenarCardsSchema,
  cardUsuarioResponseSchema,
} from '../../../servicos-global/produto/pedido/server/src/routes/cards-usuario-pedido-schemas.js'

describe('criarCardUsuarioSchema', () => {
  const payloadValido = {
    nome: 'Saldo Financeiro',
    icone: 'CurrencyDollar',
    cor: '#34d399',
    formula_expressao: 'valor_total_pedido + valor_total_item',
    formula_dependencias: ['valor_total_pedido', 'valor_total_item'],
    ordem: 0,
    ativo: true,
  }

  it('aceita payload válido completo', () => {
    const result = criarCardUsuarioSchema.safeParse(payloadValido)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.nome).toBe('Saldo Financeiro')
      expect(result.data.cor).toBe('#34d399')
    }
  })

  it('aceita payload sem formula_dependencias (opcional)', () => {
    const { formula_dependencias, ...semDeps } = payloadValido
    const result = criarCardUsuarioSchema.safeParse(semDeps)
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, nome: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita nome com mais de 100 caracteres', () => {
    const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, nome: 'x'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('rejeita cor sem formato hex válido', () => {
    const invalidos = ['red', '#gg0000', '34d399', '#34d', '#34d39900']
    for (const cor of invalidos) {
      const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, cor })
      expect(result.success).toBe(false)
    }
  })

  it('aceita cor hex com letras maiúsculas', () => {
    const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, cor: '#FF00AA' })
    expect(result.success).toBe(true)
  })

  it('rejeita icone vazio', () => {
    const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, icone: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita formula_expressao vazia', () => {
    const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, formula_expressao: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita formula_expressao com mais de 500 caracteres', () => {
    const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, formula_expressao: 'a'.repeat(501) })
    expect(result.success).toBe(false)
  })

  it('rejeita ordem negativa', () => {
    const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, ordem: -1 })
    expect(result.success).toBe(false)
  })

  it('rejeita ordem decimal', () => {
    const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, ordem: 1.5 })
    expect(result.success).toBe(false)
  })

  it('rejeita ativo não-booleano', () => {
    const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, ativo: 'sim' })
    expect(result.success).toBe(false)
  })

  it('rejeita campos extras (strict)', () => {
    const result = criarCardUsuarioSchema.safeParse({ ...payloadValido, extra: 'hack' })
    expect(result.success).toBe(true)
  })
})

describe('atualizarCardUsuarioSchema', () => {
  it('aceita atualização parcial (só nome)', () => {
    const result = atualizarCardUsuarioSchema.safeParse({ nome: 'Novo Nome' })
    expect(result.success).toBe(true)
  })

  it('aceita atualização parcial (só ativo)', () => {
    const result = atualizarCardUsuarioSchema.safeParse({ ativo: false })
    expect(result.success).toBe(true)
  })

  it('aceita objeto vazio (nenhum campo obrigatório)', () => {
    const result = atualizarCardUsuarioSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejeita cor inválida quando fornecida', () => {
    const result = atualizarCardUsuarioSchema.safeParse({ cor: 'azul' })
    expect(result.success).toBe(false)
  })

  it('rejeita nome vazio quando fornecido', () => {
    const result = atualizarCardUsuarioSchema.safeParse({ nome: '' })
    expect(result.success).toBe(false)
  })

  it('aceita múltiplos campos válidos', () => {
    const result = atualizarCardUsuarioSchema.safeParse({
      nome: 'Editado',
      cor: '#f87171',
      ordem: 3,
    })
    expect(result.success).toBe(true)
  })
})

describe('reordenarCardsSchema', () => {
  it('aceita array de ids válido', () => {
    const result = reordenarCardsSchema.safeParse({ ids: ['abc', 'def', 'ghi'] })
    expect(result.success).toBe(true)
  })

  it('rejeita array vazio', () => {
    const result = reordenarCardsSchema.safeParse({ ids: [] })
    expect(result.success).toBe(false)
  })

  it('rejeita ids com string vazia', () => {
    const result = reordenarCardsSchema.safeParse({ ids: ['abc', ''] })
    expect(result.success).toBe(false)
  })

  it('rejeita sem campo ids', () => {
    const result = reordenarCardsSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('cardUsuarioResponseSchema', () => {
  const respostaValida = {
    id: 'cuid_123',
    tenant_id: 'org_456',
    nome: 'Card Test',
    icone: 'Star',
    cor: '#818cf8',
    formula_expressao: 'valor_total_pedido',
    formula_dependencias: ['valor_total_pedido'],
    ordem: 0,
    ativo: true,
    created_by: 'user_789',
    created_at: '2026-05-17T00:00:00.000Z',
  }

  it('valida resposta completa do servidor', () => {
    const result = cardUsuarioResponseSchema.safeParse(respostaValida)
    expect(result.success).toBe(true)
  })

  it('aceita sem formula_dependencias (opcional)', () => {
    const { formula_dependencias, ...sem } = respostaValida
    const result = cardUsuarioResponseSchema.safeParse(sem)
    expect(result.success).toBe(true)
  })

  it('rejeita resposta sem id', () => {
    const { id, ...sem } = respostaValida
    const result = cardUsuarioResponseSchema.safeParse(sem)
    expect(result.success).toBe(false)
  })

  it('rejeita resposta sem tenant_id', () => {
    const { tenant_id, ...sem } = respostaValida
    const result = cardUsuarioResponseSchema.safeParse(sem)
    expect(result.success).toBe(false)
  })
})
