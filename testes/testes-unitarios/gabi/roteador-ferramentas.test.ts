// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/lib/prisma.js', () => ({
  default: {
    gabiConfirmacaoAcao: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    gabiToolExecucao: { create: vi.fn() },
  },
}))

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/lib/errors.js', () => ({
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode: number, code: string) {
      super(message)
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

import { sanitizarResultado } from '../../../servicos-global/servicos-plataforma/gabi/server/services/roteador-ferramentas.js'

describe('sanitizarResultado', () => {
  it('retorna null/undefined sem alteracao', () => {
    expect(sanitizarResultado(null)).toBeNull()
    expect(sanitizarResultado(undefined)).toBeUndefined()
  })

  it('retorna primitivos sem alteracao', () => {
    expect(sanitizarResultado(42)).toBe(42)
    expect(sanitizarResultado('texto')).toBe('texto')
    expect(sanitizarResultado(true)).toBe(true)
  })

  it('redacta campos sensiveis', () => {
    const dados = {
      nome: 'Joao',
      email_usuario: 'joao@test.com',
      senha: 'secret123',
      token: 'abc-def',
      api_key: 'key-123',
      id_clerk_usuario: 'clerk_xxx',
    }
    const result = sanitizarResultado(dados) as Record<string, unknown>
    expect(result.nome).toBe('Joao')
    expect(result.email_usuario).toBe('[REDACTED]')
    expect(result.senha).toBe('[REDACTED]')
    expect(result.token).toBe('[REDACTED]')
    expect(result.api_key).toBe('[REDACTED]')
    expect(result.id_clerk_usuario).toBe('[REDACTED]')
  })

  it('redacta campos sensiveis em objetos aninhados', () => {
    const dados = {
      usuario: {
        nome: 'Maria',
        senha: 'pass',
      },
    }
    const result = sanitizarResultado(dados) as Record<string, Record<string, unknown>>
    expect(result.usuario.nome).toBe('Maria')
    expect(result.usuario.senha).toBe('[REDACTED]')
  })

  it('redacta campos sensiveis dentro de arrays', () => {
    const dados = [
      { nome: 'A', token: 'abc' },
      { nome: 'B', token: 'def' },
    ]
    const result = sanitizarResultado(dados) as Array<Record<string, unknown>>
    expect(result[0].nome).toBe('A')
    expect(result[0].token).toBe('[REDACTED]')
    expect(result[1].token).toBe('[REDACTED]')
  })

  it('trunca arrays com mais de 20 itens quando excede maxTokens', () => {
    const dados = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      descricao: 'x'.repeat(500),
    }))
    const result = sanitizarResultado(dados, 100) as Record<string, unknown>
    expect(result._truncado).toBe(true)
    expect(result.total).toBe(50)
    expect(result.exibidos).toBe(20)
  })
})
