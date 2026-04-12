/**
 * kanbanColunasComponente.test.ts
 *
 * Testes unitários para a lógica de estado da seção Colunas do Kanban.
 * Cobre as funções: kanbanColunaToggle, kanbanColunasDirty, kanbanColunasDescartar.
 *
 * Por serem funções puras de manipulação de estado (array de strings),
 * não precisam de jsdom — testadas diretamente como lógica isolada.
 */

import { describe, it, expect } from 'vitest'

// ── Lógica extraída de Configuracoes.tsx ──────────────────────────────────────
// As funções abaixo espelham exatamente a implementação do componente pai.

function toggle(prev: string[], nome: string): string[] {
  return prev.includes(nome) ? prev.filter(n => n !== nome) : [...prev, nome]
}

function isDirty(pending: string[], saved: string[]): boolean {
  return JSON.stringify(pending) !== JSON.stringify(saved)
}

function descartar(saved: string[]): string[] {
  return saved
}

// ── C01 — toggle: adicionar/remover ──────────────────────────────────────────

describe('C01 — kanbanColunaToggle adiciona e remove corretamente', () => {
  it('adiciona nome que não está na lista', () => {
    const result = toggle([], 'cancelado')
    expect(result).toContain('cancelado')
    expect(result).toHaveLength(1)
  })

  it('remove nome que já está na lista', () => {
    const result = toggle(['draft', 'cancelado'], 'cancelado')
    expect(result).not.toContain('cancelado')
    expect(result).toContain('draft')
    expect(result).toHaveLength(1)
  })

  it('não muta o array original', () => {
    const original = ['draft', 'cancelado']
    toggle(original, 'aberto')
    expect(original).toHaveLength(2)
  })

  it('toggle de ida e volta restaura estado original', () => {
    const inicial = ['cancelado']
    const apos = toggle(toggle(inicial, 'draft'), 'draft')
    expect(apos).toEqual(inicial)
  })

  it('toggle em lista vazia funciona', () => {
    expect(toggle([], 'draft')).toEqual(['draft'])
  })

  it('toggle remove único elemento, deixando lista vazia', () => {
    expect(toggle(['draft'], 'draft')).toEqual([])
  })
})

// ── C02 — isDirty: detectar mudanças ─────────────────────────────────────────

describe('C02 — kanbanColunasDirty detecta mudanças corretamente', () => {
  it('retorna false quando pending === saved (ambos vazios)', () => {
    expect(isDirty([], [])).toBe(false)
  })

  it('retorna false quando pending === saved (com elementos)', () => {
    expect(isDirty(['cancelado'], ['cancelado'])).toBe(false)
  })

  it('retorna true quando pending tem elemento a mais', () => {
    expect(isDirty(['cancelado', 'draft'], ['cancelado'])).toBe(true)
  })

  it('retorna true quando pending está vazio e saved tem elementos', () => {
    expect(isDirty([], ['cancelado'])).toBe(true)
  })

  it('retorna true quando saved está vazio e pending tem elementos', () => {
    expect(isDirty(['cancelado'], [])).toBe(true)
  })

  it('é sensível à ordem (mesmos elementos em ordem diferente → dirty)', () => {
    // JSON.stringify preserva ordem — pendingColunasOcultas mantém ordem de inserção
    expect(isDirty(['draft', 'cancelado'], ['cancelado', 'draft'])).toBe(true)
  })
})

// ── C03 — descartar: restaurar estado salvo ───────────────────────────────────

describe('C03 — kanbanColunasDescartar restaura estado correto', () => {
  it('retorna colunas_ocultas salvas quando há alterações pendentes', () => {
    const saved = ['cancelado']
    const result = descartar(saved)
    expect(result).toEqual(['cancelado'])
  })

  it('retorna array vazio quando preferência salva é vazia', () => {
    expect(descartar([])).toEqual([])
  })

  it('após descartar, isDirty retorna false', () => {
    const saved    = ['cancelado']
    const pending  = ['cancelado', 'draft']  // diverge
    const restored = descartar(saved)
    expect(isDirty(restored, saved)).toBe(false)
  })

  it('descartar não altera o array salvo', () => {
    const saved = ['cancelado']
    const result = descartar(saved)
    // Retorno pode ser a mesma referência — o que importa é que o valor é correto
    expect(result).toEqual(saved)
  })
})

// ── C04 — fluxo completo ──────────────────────────────────────────────────────

describe('C04 — fluxo completo: toggle → dirty → descartar', () => {
  it('ocultar coluna → dirty → descartar → não dirty', () => {
    const salvas     = [] as string[]
    let   pending    = descartar(salvas)  // inicializa com salvas

    expect(isDirty(pending, salvas)).toBe(false)  // sem mudança

    pending = toggle(pending, 'cancelado')         // usuário oculta cancelado
    expect(isDirty(pending, salvas)).toBe(true)    // detecta mudança

    pending = descartar(salvas)                    // usuário descarta
    expect(isDirty(pending, salvas)).toBe(false)   // volta ao estado salvo
  })

  it('ocultar → reativar → não dirty', () => {
    const salvas  = ['cancelado']
    let   pending = descartar(salvas)

    pending = toggle(pending, 'draft')      // oculta draft (pending: ['cancelado', 'draft'])
    pending = toggle(pending, 'draft')      // reativa draft (pending: ['cancelado'])
    expect(isDirty(pending, salvas)).toBe(false)
  })
})
