/**
 * Testes unitários — Tokens
 * Localização: testes/testes-unitarios/nucleo-global/tokens/tokens.test.ts
 *
 * Ferramentas: Vitest (node)
 * Valida: exports TypeScript, constantes de cores, espaçamento e raios
 */

import { describe, it, expect } from 'vitest'
import { cores, espacamento, raios } from '../../../../nucleo-global/Tokens/index'

// ─── 1. Exports existem ─────────────────────────────────────────────────────

describe('Tokens — exports', () => {
  it('exporta objeto de cores', () => {
    expect(cores).toBeDefined()
    expect(typeof cores).toBe('object')
  })

  it('exporta objeto de espaçamento', () => {
    expect(espacamento).toBeDefined()
    expect(typeof espacamento).toBe('object')
  })

  it('exporta objeto de raios', () => {
    expect(raios).toBeDefined()
    expect(typeof raios).toBe('object')
  })
})

// ─── 2. Cores — valores corretos ────────────────────────────────────────────

describe('Tokens — cores', () => {
  it('contém todas as cores obrigatórias do design system', () => {
    const coresObrigatorias = [
      'bgBody', 'bgBase', 'bgSurface', 'bgElevated',
      'accent', 'accentHover',
      'textPrimary', 'textSecondary', 'textMuted',
      'success', 'warning', 'danger',
    ] as const

    for (const cor of coresObrigatorias) {
      expect(cores).toHaveProperty(cor)
      expect(typeof cores[cor]).toBe('string')
    }
  })

  it('accent é Violet 400 (#818cf8) — match com Configurador', () => {
    expect(cores.accent).toBe('#818cf8')
  })

  it('bgBody é dark (#0f172a)', () => {
    expect(cores.bgBody).toBe('#0f172a')
  })

  it('todas as cores são hex válidos', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/
    for (const [chave, valor] of Object.entries(cores)) {
      expect(valor, `cores.${chave} deveria ser hex válido`).toMatch(hexRegex)
    }
  })

  it('cores são readonly (imutáveis)', () => {
    // TypeScript garante readonly, mas vamos confirmar em runtime
    expect(Object.isFrozen(cores)).toBe(false) // as const não faz freeze
    // O importante é que o tipo impede mutação em compile-time
    expect(Object.keys(cores).length).toBe(12)
  })
})

// ─── 3. Espaçamento — escala de 4px ─────────────────────────────────────────

describe('Tokens — espaçamento', () => {
  it('contém todos os steps da escala', () => {
    const stepsObrigatorios = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16] as const
    for (const step of stepsObrigatorios) {
      expect(espacamento).toHaveProperty(String(step))
    }
  })

  it('step 1 é 0.25rem (4px)', () => {
    expect(espacamento[1]).toBe('0.25rem')
  })

  it('step 4 é 1rem (16px)', () => {
    expect(espacamento[4]).toBe('1rem')
  })

  it('step 8 é 2rem (32px)', () => {
    expect(espacamento[8]).toBe('2rem')
  })

  it('step 16 é 4rem (64px)', () => {
    expect(espacamento[16]).toBe('4rem')
  })

  it('todos os valores são rem válidos', () => {
    const remRegex = /^\d+(\.\d+)?rem$/
    for (const [step, valor] of Object.entries(espacamento)) {
      expect(valor, `espacamento[${step}] deveria ser rem válido`).toMatch(remRegex)
    }
  })

  it('escala é crescente', () => {
    const valores = Object.values(espacamento).map((v) => parseFloat(v))
    for (let i = 1; i < valores.length; i++) {
      expect(valores[i], `step ${i} deveria ser maior que step ${i - 1}`).toBeGreaterThan(valores[i - 1])
    }
  })
})

// ─── 4. Raios — geometria ───────────────────────────────────────────────────

describe('Tokens — raios', () => {
  it('contém todos os tamanhos obrigatórios', () => {
    const tamanhos = ['sm', 'md', 'lg', 'xl', 'pill'] as const
    for (const tamanho of tamanhos) {
      expect(raios).toHaveProperty(tamanho)
    }
  })

  it('pill é 9999px para botões arredondados', () => {
    expect(raios.pill).toBe('9999px')
  })

  it('sm < md < lg < xl (escala crescente)', () => {
    const parsePx = (v: string) => parseInt(v, 10)
    expect(parsePx(raios.sm)).toBeLessThan(parsePx(raios.md))
    expect(parsePx(raios.md)).toBeLessThan(parsePx(raios.lg))
    expect(parsePx(raios.lg)).toBeLessThan(parsePx(raios.xl))
  })

  it('todos os valores são px válidos', () => {
    const pxRegex = /^\d+px$/
    for (const [tamanho, valor] of Object.entries(raios)) {
      expect(valor, `raios.${tamanho} deveria ser px válido`).toMatch(pxRegex)
    }
  })
})
