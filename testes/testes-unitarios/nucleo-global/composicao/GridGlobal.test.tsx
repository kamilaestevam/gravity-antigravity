/**
 * Testes unitários — GridGlobal
 * Localização: testes/testes-unitarios/nucleo-global/composicao/GridGlobal.test.tsx
 *
 * Ferramentas: Vitest (node)
 * Valida: exports, modo fixo vs auto, larguraMin, gap, tags
 */

// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { GridGlobal } from '../../../../nucleo-global/Composicao/grid-global/src/GridGlobal'
import type { GridProps } from '../../../../nucleo-global/Composicao/grid-global/src/tipos'

// ─── 1. Exports ──────────────────────────────────────────────────────────────

describe('GridGlobal — exports', () => {
  it('exporta o componente GridGlobal como função', () => {
    expect(GridGlobal).toBeDefined()
    expect(typeof GridGlobal).toBe('function')
  })
})

// ─── 2. Defaults ─────────────────────────────────────────────────────────────

describe('GridGlobal — defaults', () => {
  it('colunas padrão é auto', () => {
    const result = GridGlobal({ children: null })
    expect(result.props.style.gridTemplateColumns).toContain('auto-fill')
  })

  it('larguraMin padrão é 280px', () => {
    const result = GridGlobal({ children: null })
    expect(result.props.style.gridTemplateColumns).toContain('280px')
  })

  it('gap padrão é 4 (1rem)', () => {
    const result = GridGlobal({ children: null })
    expect(result.props.style.gap).toBe('1rem')
  })

  it('tag padrão é div', () => {
    const result = GridGlobal({ children: null })
    expect(result.type).toBe('div')
  })

  it('display é sempre grid', () => {
    const result = GridGlobal({ children: null })
    expect(result.props.style.display).toBe('grid')
  })
})

// ─── 3. Modo fixo — colunas numéricas ───────────────────────────────────────

describe('GridGlobal — modo fixo', () => {
  const colunasFixas = [1, 2, 3, 4, 5, 6, 12] as const

  for (const n of colunasFixas) {
    it(`colunas=${n} → repeat(${n}, 1fr)`, () => {
      const result = GridGlobal({ colunas: n, children: null })
      expect(result.props.style.gridTemplateColumns).toBe(`repeat(${n}, 1fr)`)
    })
  }
})

// ─── 4. Modo auto — responsivo ───────────────────────────────────────────────

describe('GridGlobal — modo auto', () => {
  it('colunas="auto" → auto-fill com minmax', () => {
    const result = GridGlobal({ colunas: 'auto', children: null })
    expect(result.props.style.gridTemplateColumns).toBe('repeat(auto-fill, minmax(280px, 1fr))')
  })

  it('larguraMin customizada é respeitada', () => {
    const result = GridGlobal({ colunas: 'auto', larguraMin: 350, children: null })
    expect(result.props.style.gridTemplateColumns).toBe('repeat(auto-fill, minmax(350px, 1fr))')
  })

  it('larguraMin=200 funciona corretamente', () => {
    const result = GridGlobal({ colunas: 'auto', larguraMin: 200, children: null })
    expect(result.props.style.gridTemplateColumns).toContain('200px')
  })
})

// ─── 5. Gap ──────────────────────────────────────────────────────────────────

describe('GridGlobal — gap', () => {
  it('gap=2 → 0.5rem', () => {
    const result = GridGlobal({ gap: 2, children: null })
    expect(result.props.style.gap).toBe('0.5rem')
  })

  it('gap=8 → 2rem', () => {
    const result = GridGlobal({ gap: 8, children: null })
    expect(result.props.style.gap).toBe('2rem')
  })
})

// ─── 6. Classes responsivas ───────────────────────────────────────────────────

describe('GridGlobal — classes responsivas', () => {
  it('colunas numéricas geram classe gb-grid--cols-N', () => {
    const result = GridGlobal({ colunas: 3, children: null })
    expect(result.props.className).toContain('gb-grid--cols-3')
  })

  it('colunas=4 gera gb-grid--cols-4', () => {
    const result = GridGlobal({ colunas: 4, children: null })
    expect(result.props.className).toContain('gb-grid--cols-4')
  })

  it('colunas="auto" não gera classe de colunas', () => {
    const result = GridGlobal({ colunas: 'auto', children: null })
    expect(result.props.className).not.toContain('gb-grid--cols-')
  })
})

// ─── 7. Tags ─────────────────────────────────────────────────────────────────

describe('GridGlobal — tags', () => {
  const tags = ['div', 'section', 'main'] as const

  for (const tag of tags) {
    it(`as="${tag}" → renderiza como <${tag}>`, () => {
      const result = GridGlobal({ as: tag, children: null })
      expect(result.type).toBe(tag)
    })
  }
})

// ─── 8. Customização ────────────────────────────────────────────────────────

describe('GridGlobal — customização', () => {
  it('className extra é concatenada com gb-grid', () => {
    const result = GridGlobal({ className: 'cards', children: null })
    expect(result.props.className).toContain('gb-grid')
    expect(result.props.className).toContain('cards')
  })

  it('style extra é mergeada', () => {
    const result = GridGlobal({
      style: { marginTop: '2rem' },
      children: null,
    })
    expect(result.props.style.marginTop).toBe('2rem')
    expect(result.props.style.display).toBe('grid')
  })
})
