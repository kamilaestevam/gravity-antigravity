/**
 * Testes unitários — FlexGlobal
 * Localização: testes/testes-unitarios/nucleo-global/composicao/FlexGlobal.test.tsx
 *
 * Ferramentas: Vitest (node)
 * Valida: exports, props, defaults, mapeamento de gap, alinhamento e justificação
 */

// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { FlexGlobal } from '../../../../nucleo-global/Composicao/flex-global/src/FlexGlobal'
import type { FlexProps } from '../../../../nucleo-global/Composicao/flex-global/src/tipos'

// ─── 1. Exports ──────────────────────────────────────────────────────────────

describe('FlexGlobal — exports', () => {
  it('exporta o componente FlexGlobal como função', () => {
    expect(FlexGlobal).toBeDefined()
    expect(typeof FlexGlobal).toBe('function')
  })
})

// ─── 2. Defaults ─────────────────────────────────────────────────────────────

describe('FlexGlobal — defaults', () => {
  it('gap padrão é 4 (1rem)', () => {
    const result = FlexGlobal({ children: null })
    expect(result.props.style.gap).toBe('1rem')
  })

  it('alinhar padrão é center', () => {
    const result = FlexGlobal({ children: null })
    expect(result.props.style.alignItems).toBe('center')
  })

  it('justificar padrão é start', () => {
    const result = FlexGlobal({ children: null })
    expect(result.props.style.justifyContent).toBe('flex-start')
  })

  it('wrap padrão é false (nowrap)', () => {
    const result = FlexGlobal({ children: null })
    expect(result.props.style.flexWrap).toBe('nowrap')
  })

  it('tag padrão é div', () => {
    const result = FlexGlobal({ children: null })
    expect(result.type).toBe('div')
  })

  it('flexDirection é sempre row', () => {
    const result = FlexGlobal({ children: null })
    expect(result.props.style.flexDirection).toBe('row')
  })
})

// ─── 3. Mapeamento de justificar ─────────────────────────────────────────────

describe('FlexGlobal — mapeamento de justificar', () => {
  const justifyMap: Record<string, string> = {
    start:   'flex-start',
    center:  'center',
    end:     'flex-end',
    between: 'space-between',
    around:  'space-around',
    evenly:  'space-evenly',
  }

  for (const [prop, cssValue] of Object.entries(justifyMap)) {
    it(`justificar="${prop}" → justifyContent: ${cssValue}`, () => {
      const result = FlexGlobal({
        justificar: prop as FlexProps['justificar'],
        children: null,
      })
      expect(result.props.style.justifyContent).toBe(cssValue)
    })
  }
})

// ─── 4. Mapeamento de alinhar ────────────────────────────────────────────────

describe('FlexGlobal — mapeamento de alinhar', () => {
  const alignMap: Record<string, string> = {
    start:    'flex-start',
    center:   'center',
    end:      'flex-end',
    stretch:  'stretch',
    baseline: 'baseline',
  }

  for (const [prop, cssValue] of Object.entries(alignMap)) {
    it(`alinhar="${prop}" → alignItems: ${cssValue}`, () => {
      const result = FlexGlobal({
        alinhar: prop as FlexProps['alinhar'],
        children: null,
      })
      expect(result.props.style.alignItems).toBe(cssValue)
    })
  }
})

// ─── 5. Wrap ─────────────────────────────────────────────────────────────────

describe('FlexGlobal — wrap', () => {
  it('wrap=true → flexWrap: wrap', () => {
    const result = FlexGlobal({ wrap: true, children: null })
    expect(result.props.style.flexWrap).toBe('wrap')
  })

  it('wrap=false → flexWrap: nowrap', () => {
    const result = FlexGlobal({ wrap: false, children: null })
    expect(result.props.style.flexWrap).toBe('nowrap')
  })
})

// ─── 6. Tags customizadas ───────────────────────────────────────────────────

describe('FlexGlobal — tags', () => {
  const tags = ['div', 'section', 'header', 'footer', 'nav'] as const

  for (const tag of tags) {
    it(`as="${tag}" → renderiza como <${tag}>`, () => {
      const result = FlexGlobal({ as: tag, children: null })
      expect(result.type).toBe(tag)
    })
  }
})

// ─── 7. Customização ────────────────────────────────────────────────────────

describe('FlexGlobal — customização', () => {
  it('className extra é concatenada com gb-flex', () => {
    const result = FlexGlobal({ className: 'extra', children: null })
    expect(result.props.className).toBe('gb-flex extra')
  })

  it('style extra é mergeada', () => {
    const result = FlexGlobal({
      style: { border: '1px solid red' },
      children: null,
    })
    expect(result.props.style.border).toBe('1px solid red')
    expect(result.props.style.display).toBe('flex')
  })
})
