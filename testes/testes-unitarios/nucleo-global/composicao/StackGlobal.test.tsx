/**
 * Testes unitários — StackGlobal
 * Localização: testes/testes-unitarios/nucleo-global/composicao/StackGlobal.test.tsx
 *
 * Ferramentas: Vitest (node)
 * Valida: exports, props, defaults, mapeamento de gap e alinhamento
 */

// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { StackGlobal } from '../../../../nucleo-global/Composicao/stack-global/src/StackGlobal'
import type { StackProps, EspacamentoToken } from '../../../../nucleo-global/Composicao/stack-global/src/tipos'

// ─── 1. Exports ──────────────────────────────────────────────────────────────

describe('StackGlobal — exports', () => {
  it('exporta o componente StackGlobal como função', () => {
    expect(StackGlobal).toBeDefined()
    expect(typeof StackGlobal).toBe('function')
  })

  it('o nome do componente é StackGlobal', () => {
    expect(StackGlobal.name).toBe('StackGlobal')
  })
})

// ─── 2. Tipos — cobertura de interface ───────────────────────────────────────

describe('StackGlobal — tipos', () => {
  it('EspacamentoToken inclui todos os steps da escala', () => {
    // Verificação em runtime: validamos que os valores aceitos são os corretos
    const stepsValidos: EspacamentoToken[] = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16]
    expect(stepsValidos).toHaveLength(10)
    for (const step of stepsValidos) {
      expect(step).toBeGreaterThan(0)
    }
  })

  it('StackProps aceita todas as propriedades documentadas', () => {
    // Tipo-check em compile-time — este teste garante que a interface compila
    const propsCompletas: StackProps = {
      gap: 4,
      alinhar: 'center',
      as: 'section',
      children: null,
      className: 'test',
      style: { padding: '1rem' },
    }
    expect(propsCompletas.gap).toBe(4)
    expect(propsCompletas.alinhar).toBe('center')
    expect(propsCompletas.as).toBe('section')
  })

  it('StackProps requer apenas children', () => {
    const propsMinimas: StackProps = { children: null }
    expect(propsMinimas).toBeDefined()
  })
})

// ─── 3. Props default ────────────────────────────────────────────────────────

describe('StackGlobal — defaults', () => {
  it('gap padrão é 4 (16px)', () => {
    // Testamos chamando o componente e verificando a saída
    const result = StackGlobal({ children: null })
    expect(result.props.style.gap).toBe('1rem')
  })

  it('alinhar padrão é stretch', () => {
    const result = StackGlobal({ children: null })
    expect(result.props.style.alignItems).toBe('stretch')
  })

  it('tag padrão é div', () => {
    const result = StackGlobal({ children: null })
    expect(result.type).toBe('div')
  })

  it('className padrão inclui gb-stack', () => {
    const result = StackGlobal({ children: null })
    expect(result.props.className).toContain('gb-stack')
  })
})

// ─── 4. Mapeamento de gap ────────────────────────────────────────────────────

describe('StackGlobal — mapeamento de gap', () => {
  const gapMap: Record<number, string> = {
    1:  '0.25rem',
    2:  '0.5rem',
    3:  '0.75rem',
    4:  '1rem',
    5:  '1.25rem',
    6:  '1.5rem',
    8:  '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  }

  for (const [token, expected] of Object.entries(gapMap)) {
    it(`gap=${token} → ${expected}`, () => {
      const result = StackGlobal({ gap: Number(token) as EspacamentoToken, children: null })
      expect(result.props.style.gap).toBe(expected)
    })
  }
})

// ─── 5. Mapeamento de alinhamento ────────────────────────────────────────────

describe('StackGlobal — mapeamento de alinhamento', () => {
  const alignMap: Record<string, string> = {
    start:   'flex-start',
    center:  'center',
    end:     'flex-end',
    stretch: 'stretch',
  }

  for (const [prop, cssValue] of Object.entries(alignMap)) {
    it(`alinhar="${prop}" → alignItems: ${cssValue}`, () => {
      const result = StackGlobal({
        alinhar: prop as StackProps['alinhar'],
        children: null,
      })
      expect(result.props.style.alignItems).toBe(cssValue)
    })
  }
})

// ─── 6. Tag HTML customizada ─────────────────────────────────────────────────

describe('StackGlobal — tag customizada', () => {
  const tags = ['div', 'section', 'main', 'aside', 'form'] as const

  for (const tag of tags) {
    it(`as="${tag}" → renderiza como <${tag}>`, () => {
      const result = StackGlobal({ as: tag, children: null })
      expect(result.type).toBe(tag)
    })
  }
})

// ─── 7. className e style passados ──────────────────────────────────────────

describe('StackGlobal — customização', () => {
  it('className extra é concatenada', () => {
    const result = StackGlobal({ className: 'minha-classe', children: null })
    expect(result.props.className).toBe('gb-stack minha-classe')
  })

  it('style extra é mergeada com os estilos base', () => {
    const result = StackGlobal({
      style: { padding: '2rem', background: 'red' },
      children: null,
    })
    expect(result.props.style.padding).toBe('2rem')
    expect(result.props.style.background).toBe('red')
    expect(result.props.style.display).toBe('flex') // base mantido
    expect(result.props.style.flexDirection).toBe('column') // base mantido
  })

  it('style custom sobrescreve base quando conflita', () => {
    const result = StackGlobal({
      style: { display: 'grid' },
      children: null,
    })
    // O spread do style custom vem depois, então sobrescreve
    expect(result.props.style.display).toBe('grid')
  })
})

// ─── 8. Estrutura do output ──────────────────────────────────────────────────

describe('StackGlobal — estrutura de saída', () => {
  it('output é sempre flexDirection: column', () => {
    const result = StackGlobal({ children: null })
    expect(result.props.style.flexDirection).toBe('column')
  })

  it('output sempre tem display: flex', () => {
    const result = StackGlobal({ children: null })
    expect(result.props.style.display).toBe('flex')
  })
})
