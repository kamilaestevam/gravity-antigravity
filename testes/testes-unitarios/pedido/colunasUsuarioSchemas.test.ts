/**
 * colunasUsuarioSchemas.test.ts — Testes unitários dos schemas Zod de colunas customizadas
 *
 * Cobre:
 *   - CriarColunaSchema: nome max 50, valor_padrao max 1000, tipo válido
 *   - AtualizarColunaSchema: bloqueia mudança de tipo
 *   - SalvarValoresSchema: valor max 1000 por campo, max 100 campos por requisição
 *   - ReordenarSchema: ids não vazio
 */

import { describe, it, expect } from 'vitest'
import {
  CriarColunaSchema,
  AtualizarColunaSchema,
  SalvarValoresSchema,
  ReordenarSchema,
} from '../../../produto/pedido/server/src/routes/colunasUsuarioSchemas.js'

// ── CriarColunaSchema ─────────────────────────────────────────────────────────

describe('CriarColunaSchema', () => {
  const base = {
    nome: 'Coluna Teste',
    tipo: 'texto',
    escopo: 'pedido',
    visibilidade: 'todos',
    obrigatorio: false,
  }

  it('aceita payload válido mínimo', () => {
    const result = CriarColunaSchema.safeParse(base)
    expect(result.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = CriarColunaSchema.safeParse({ ...base, nome: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita nome com 51 caracteres', () => {
    const result = CriarColunaSchema.safeParse({ ...base, nome: 'a'.repeat(51) })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msgs = result.error.flatten().fieldErrors.nome
      expect(msgs?.some(m => m.includes('50'))).toBe(true)
    }
  })

  it('aceita nome com exatamente 50 caracteres', () => {
    const result = CriarColunaSchema.safeParse({ ...base, nome: 'a'.repeat(50) })
    expect(result.success).toBe(true)
  })

  it('rejeita valor_padrao com 1001 caracteres', () => {
    const result = CriarColunaSchema.safeParse({ ...base, valor_padrao: 'x'.repeat(1001) })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msgs = result.error.flatten().fieldErrors.valor_padrao
      expect(msgs?.some(m => m.includes('1000'))).toBe(true)
    }
  })

  it('aceita valor_padrao com exatamente 1000 caracteres', () => {
    const result = CriarColunaSchema.safeParse({ ...base, valor_padrao: 'x'.repeat(1000) })
    expect(result.success).toBe(true)
  })

  it('rejeita tipo inválido', () => {
    const result = CriarColunaSchema.safeParse({ ...base, tipo: 'invalido' })
    expect(result.success).toBe(false)
  })

  it('aceita todos os tipos válidos', () => {
    const tipos = ['texto', 'numero', 'data', 'select', 'checkbox', 'percentual', 'tipo_documento', 'formula']
    for (const tipo of tipos) {
      const result = CriarColunaSchema.safeParse({ ...base, tipo })
      expect(result.success, `tipo ${tipo} deve ser aceito`).toBe(true)
    }
  })

  it('rejeita escopo inválido', () => {
    const result = CriarColunaSchema.safeParse({ ...base, escopo: 'global' })
    expect(result.success).toBe(false)
  })
})

// ── AtualizarColunaSchema ─────────────────────────────────────────────────────

describe('AtualizarColunaSchema', () => {
  it('aceita atualização de nome válido', () => {
    const result = AtualizarColunaSchema.safeParse({ nome: 'Novo Nome' })
    expect(result.success).toBe(true)
  })

  it('rejeita nome com 51 caracteres', () => {
    const result = AtualizarColunaSchema.safeParse({ nome: 'a'.repeat(51) })
    expect(result.success).toBe(false)
  })

  it('schema ignora campo "tipo" (stripped por Zod) — bloqueio real é no route handler', () => {
    // Zod remove campos desconhecidos antes do .refine(), então { tipo: 'texto' }
    // passa pelo schema. O route handler faz if ('tipo' in req.body) antes do safeParse.
    const result = AtualizarColunaSchema.safeParse({ tipo: 'texto' })
    expect(result.success).toBe(true)
    // E o dado parsed não contém 'tipo' (foi stripped)
    if (result.success) {
      expect('tipo' in result.data).toBe(false)
    }
  })

  it('aceita valor_padrao com exatamente 1000 caracteres', () => {
    const result = AtualizarColunaSchema.safeParse({ valor_padrao: 'x'.repeat(1000) })
    expect(result.success).toBe(true)
  })

  it('rejeita valor_padrao com 1001 caracteres', () => {
    const result = AtualizarColunaSchema.safeParse({ valor_padrao: 'x'.repeat(1001) })
    expect(result.success).toBe(false)
  })
})

// ── SalvarValoresSchema ───────────────────────────────────────────────────────

describe('SalvarValoresSchema', () => {
  const base = {
    vinculo: 'pedido',
    vinculo_id: 'pedido-001',
    valores: { 'col-1': 'valor normal' },
  }

  it('aceita payload válido', () => {
    const result = SalvarValoresSchema.safeParse(base)
    expect(result.success).toBe(true)
  })

  it('rejeita valor de campo com 1001 caracteres', () => {
    const result = SalvarValoresSchema.safeParse({
      ...base,
      valores: { 'col-1': 'x'.repeat(1001) },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msgs = result.error.flatten().fieldErrors
      // A mensagem pode aparecer em _errors ou na chave da propriedade
      const allMsgs = JSON.stringify(msgs)
      expect(allMsgs).toContain('1000')
    }
  })

  it('aceita valor de campo com exatamente 1000 caracteres', () => {
    const result = SalvarValoresSchema.safeParse({
      ...base,
      valores: { 'col-1': 'x'.repeat(1000) },
    })
    expect(result.success).toBe(true)
  })

  it('rejeita mais de 100 campos por requisição', () => {
    const muitosCampos: Record<string, string> = {}
    for (let i = 0; i <= 100; i++) {
      muitosCampos[`col-${i}`] = 'valor'
    }
    const result = SalvarValoresSchema.safeParse({ ...base, valores: muitosCampos })
    expect(result.success).toBe(false)
    if (!result.success) {
      const msgs = result.error.flatten()
      const allMsgs = JSON.stringify(msgs)
      expect(allMsgs).toContain('100')
    }
  })

  it('aceita exatamente 100 campos', () => {
    const cemCampos: Record<string, string> = {}
    for (let i = 1; i <= 100; i++) {
      cemCampos[`col-${i}`] = 'valor'
    }
    const result = SalvarValoresSchema.safeParse({ ...base, valores: cemCampos })
    expect(result.success).toBe(true)
  })

  it('rejeita vinculo_id vazio', () => {
    const result = SalvarValoresSchema.safeParse({ ...base, vinculo_id: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita vinculo inválido', () => {
    const result = SalvarValoresSchema.safeParse({ ...base, vinculo: 'outro' })
    expect(result.success).toBe(false)
  })
})

// ── ReordenarSchema ───────────────────────────────────────────────────────────

describe('ReordenarSchema', () => {
  it('aceita lista de ids válida', () => {
    const result = ReordenarSchema.safeParse({ ids: ['id-1', 'id-2', 'id-3'] })
    expect(result.success).toBe(true)
  })

  it('rejeita lista vazia', () => {
    const result = ReordenarSchema.safeParse({ ids: [] })
    expect(result.success).toBe(false)
  })

  it('rejeita id vazio dentro da lista', () => {
    const result = ReordenarSchema.safeParse({ ids: ['id-1', ''] })
    expect(result.success).toBe(false)
  })
})
