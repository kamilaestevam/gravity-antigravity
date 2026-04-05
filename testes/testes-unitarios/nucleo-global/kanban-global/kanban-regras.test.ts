/**
 * Testes unitários — KanbanGlobal: regras de automação + operadores
 * Localização: testes/testes-unitarios/nucleo-global/kanban-global/kanban-regras.test.ts
 *
 * Ferramentas: Vitest (node puro — sem DOM)
 * Cobre: avaliarRegras, OPERADORES_POR_TIPO, todos os operadores e prioridades
 */

// @vitest-environment node

import { describe, it, expect } from 'vitest'
import { avaliarRegras, OPERADORES_POR_TIPO } from '../../../../nucleo-global/Kanban/kanban-global/src/regras'
import type { RegraKanban } from '../../../../nucleo-global/Kanban/kanban-global/src/tipos'

// ── Helpers ───────────────────────────────────────────────────────────────────

function regra(patch: Partial<RegraKanban>): RegraKanban {
  return {
    id:            'r1',
    ativo:         true,
    campoKey:      'status',
    operador:      'igual',
    valor:         'aprovado',
    colunaDestino: 'col-aprovado',
    prioridade:    0,
    ...patch,
  }
}

function get(item: Record<string, unknown>, key: string): unknown {
  return item[key]
}

// ── OPERADORES_POR_TIPO ───────────────────────────────────────────────────────

describe('OPERADORES_POR_TIPO', () => {
  it('tem operadores para todos os tipos', () => {
    const tipos = ['texto', 'numero', 'data', 'booleano', 'selecao'] as const
    for (const tipo of tipos) {
      expect(OPERADORES_POR_TIPO[tipo].length).toBeGreaterThan(0)
    }
  })

  it('texto inclui contem e nao_contem', () => {
    const ops = OPERADORES_POR_TIPO.texto.map(o => o.value)
    expect(ops).toContain('contem')
    expect(ops).toContain('nao_contem')
  })

  it('numero inclui maior_igual e menor_igual', () => {
    const ops = OPERADORES_POR_TIPO.numero.map(o => o.value)
    expect(ops).toContain('maior_igual')
    expect(ops).toContain('menor_igual')
  })

  it('booleano tem apenas igual e diferente', () => {
    const ops = OPERADORES_POR_TIPO.booleano.map(o => o.value)
    expect(ops).toEqual(['igual', 'diferente'])
  })

  it('selecao inclui preenchido e vazio', () => {
    const ops = OPERADORES_POR_TIPO.selecao.map(o => o.value)
    expect(ops).toContain('preenchido')
    expect(ops).toContain('vazio')
  })

  it('data inclui maior e menor mas não contem', () => {
    const ops = OPERADORES_POR_TIPO.data.map(o => o.value)
    expect(ops).toContain('maior')
    expect(ops).toContain('menor')
    expect(ops).not.toContain('contem')
  })

  it('todos os operadores têm label não-vazio', () => {
    for (const tipo of Object.keys(OPERADORES_POR_TIPO) as (keyof typeof OPERADORES_POR_TIPO)[]) {
      for (const op of OPERADORES_POR_TIPO[tipo]) {
        expect(op.label.length).toBeGreaterThan(0)
      }
    }
  })
})

// ── avaliarRegras — casos básicos ─────────────────────────────────────────────

describe('avaliarRegras — casos básicos', () => {
  it('retorna null quando não há regras', () => {
    expect(avaliarRegras({ status: 'aprovado' }, [], get)).toBeNull()
  })

  it('retorna null quando regra está inativa', () => {
    expect(avaliarRegras({ status: 'aprovado' }, [regra({ ativo: false })], get)).toBeNull()
  })

  it('retorna null quando coluna destino = coluna atual', () => {
    expect(avaliarRegras({ status: 'aprovado' }, [regra({ colunaDestino: 'col-atual' })], get, 'col-atual')).toBeNull()
  })

  it('retorna coluna destino quando regra bate', () => {
    expect(avaliarRegras({ status: 'aprovado' }, [regra()], get)).toBe('col-aprovado')
  })

  it('retorna null quando regra não bate', () => {
    expect(avaliarRegras({ status: 'pendente' }, [regra()], get)).toBeNull()
  })

  it('ignora regra sem campoKey', () => {
    expect(avaliarRegras({ status: 'aprovado' }, [regra({ campoKey: '' })], get)).toBeNull()
  })

  it('ignora regra sem colunaDestino', () => {
    expect(avaliarRegras({ status: 'aprovado' }, [regra({ colunaDestino: '' })], get)).toBeNull()
  })
})

// ── Prioridade ────────────────────────────────────────────────────────────────

describe('avaliarRegras — prioridade', () => {
  it('menor número = maior prioridade', () => {
    const item = { status: 'aprovado' }
    const regras: RegraKanban[] = [
      regra({ id: 'r2', prioridade: 1, colunaDestino: 'col-baixa' }),
      regra({ id: 'r1', prioridade: 0, colunaDestino: 'col-alta'  }),
    ]
    expect(avaliarRegras(item, regras, get)).toBe('col-alta')
  })

  it('pula regra inativa e usa próxima ativa', () => {
    const item = { status: 'aprovado' }
    const regras: RegraKanban[] = [
      regra({ id: 'r1', prioridade: 0, ativo: false, colunaDestino: 'col-inativa' }),
      regra({ id: 'r2', prioridade: 1, ativo: true,  colunaDestino: 'col-ativa'   }),
    ]
    expect(avaliarRegras(item, regras, get)).toBe('col-ativa')
  })

  it('múltiplas regras batem — vence a de menor prioridade numérica', () => {
    const item = { status: 'aprovado', valor: 500 }
    const regras: RegraKanban[] = [
      regra({ id: 'r1', prioridade: 0, campoKey: 'status', operador: 'igual', valor: 'aprovado', colunaDestino: 'col-1' }),
      regra({ id: 'r2', prioridade: 1, campoKey: 'valor',  operador: 'maior', valor: '100',      colunaDestino: 'col-2' }),
    ]
    expect(avaliarRegras(item, regras, get)).toBe('col-1')
  })
})

// ── preenchido / vazio ────────────────────────────────────────────────────────

describe('operadores preenchido / vazio', () => {
  it('preenchido → true quando campo tem valor', () => {
    expect(avaliarRegras({ nome: 'Alice' }, [regra({ campoKey: 'nome', operador: 'preenchido', valor: undefined })], get)).toBe('col-aprovado')
  })

  it('preenchido → false quando campo é string vazia', () => {
    expect(avaliarRegras({ nome: '' }, [regra({ campoKey: 'nome', operador: 'preenchido', valor: undefined })], get)).toBeNull()
  })

  it('preenchido → false quando campo é null', () => {
    expect(avaliarRegras({ nome: null }, [regra({ campoKey: 'nome', operador: 'preenchido', valor: undefined })], get)).toBeNull()
  })

  it('vazio → true quando campo é undefined', () => {
    expect(avaliarRegras({ nome: undefined }, [regra({ campoKey: 'nome', operador: 'vazio', valor: undefined })], get)).toBe('col-aprovado')
  })

  it('vazio → true quando campo é null', () => {
    expect(avaliarRegras({ nome: null }, [regra({ campoKey: 'nome', operador: 'vazio', valor: undefined })], get)).toBe('col-aprovado')
  })

  it('vazio → false quando campo tem valor', () => {
    expect(avaliarRegras({ nome: 'Alice' }, [regra({ campoKey: 'nome', operador: 'vazio', valor: undefined })], get)).toBeNull()
  })
})

// ── Texto ─────────────────────────────────────────────────────────────────────

describe('operadores de texto', () => {
  it('igual — match exato', () => {
    expect(avaliarRegras({ status: 'aprovado' }, [regra()], get)).toBe('col-aprovado')
  })

  it('igual — não bate quando diferente', () => {
    expect(avaliarRegras({ status: 'pendente' }, [regra()], get)).toBeNull()
  })

  it('diferente — bate quando valores diferentes', () => {
    expect(avaliarRegras({ status: 'pendente' }, [regra({ operador: 'diferente' })], get)).toBe('col-aprovado')
  })

  it('diferente — não bate quando igual', () => {
    expect(avaliarRegras({ status: 'aprovado' }, [regra({ operador: 'diferente' })], get)).toBeNull()
  })

  it('contem — case insensitive', () => {
    expect(avaliarRegras(
      { titulo: 'Projeto Alpha' },
      [regra({ campoKey: 'titulo', operador: 'contem', valor: 'alpha' })],
      get,
    )).toBe('col-aprovado')
  })

  it('contem — não bate quando não contém', () => {
    expect(avaliarRegras(
      { titulo: 'Projeto Beta' },
      [regra({ campoKey: 'titulo', operador: 'contem', valor: 'alpha' })],
      get,
    )).toBeNull()
  })

  it('nao_contem — bate quando não contém', () => {
    expect(avaliarRegras(
      { titulo: 'Projeto Beta' },
      [regra({ campoKey: 'titulo', operador: 'nao_contem', valor: 'alpha' })],
      get,
    )).toBe('col-aprovado')
  })

  it('nao_contem — não bate quando contém', () => {
    expect(avaliarRegras(
      { titulo: 'Projeto Alpha' },
      [regra({ campoKey: 'titulo', operador: 'nao_contem', valor: 'alpha' })],
      get,
    )).toBeNull()
  })
})

// ── Numérico ──────────────────────────────────────────────────────────────────

describe('operadores numéricos', () => {
  it('maior — 200 > 100', () => {
    expect(avaliarRegras({ valor: 200 }, [regra({ campoKey: 'valor', operador: 'maior', valor: '100' })], get)).toBe('col-aprovado')
  })

  it('maior — 100 não é > 100', () => {
    expect(avaliarRegras({ valor: 100 }, [regra({ campoKey: 'valor', operador: 'maior', valor: '100' })], get)).toBeNull()
  })

  it('menor — 50 < 100', () => {
    expect(avaliarRegras({ valor: 50 }, [regra({ campoKey: 'valor', operador: 'menor', valor: '100' })], get)).toBe('col-aprovado')
  })

  it('maior_igual — 100 >= 100', () => {
    expect(avaliarRegras({ valor: 100 }, [regra({ campoKey: 'valor', operador: 'maior_igual', valor: '100' })], get)).toBe('col-aprovado')
  })

  it('maior_igual — 101 >= 100', () => {
    expect(avaliarRegras({ valor: 101 }, [regra({ campoKey: 'valor', operador: 'maior_igual', valor: '100' })], get)).toBe('col-aprovado')
  })

  it('menor_igual — 99 <= 100', () => {
    expect(avaliarRegras({ valor: 99 }, [regra({ campoKey: 'valor', operador: 'menor_igual', valor: '100' })], get)).toBe('col-aprovado')
  })

  it('maior — null não bate', () => {
    expect(avaliarRegras({ valor: null }, [regra({ campoKey: 'valor', operador: 'maior', valor: '0' })], get)).toBeNull()
  })

  it('igual numérico — string e número coincidem', () => {
    expect(avaliarRegras({ valor: 42 }, [regra({ campoKey: 'valor', operador: 'igual', valor: '42' })], get)).toBe('col-aprovado')
  })
})

// ── Data ──────────────────────────────────────────────────────────────────────

describe('operadores de data', () => {
  it('maior — data posterior bate', () => {
    expect(avaliarRegras(
      { entrega: '2026-06-01' },
      [regra({ campoKey: 'entrega', operador: 'maior', valor: '2026-01-01' })],
      get,
    )).toBe('col-aprovado')
  })

  it('maior — data anterior não bate', () => {
    expect(avaliarRegras(
      { entrega: '2025-12-01' },
      [regra({ campoKey: 'entrega', operador: 'maior', valor: '2026-01-01' })],
      get,
    )).toBeNull()
  })

  it('menor — data anterior bate', () => {
    expect(avaliarRegras(
      { entrega: '2025-01-01' },
      [regra({ campoKey: 'entrega', operador: 'menor', valor: '2026-01-01' })],
      get,
    )).toBe('col-aprovado')
  })

  it('igual — mesma data bate', () => {
    expect(avaliarRegras(
      { entrega: '2026-03-15' },
      [regra({ campoKey: 'entrega', operador: 'igual', valor: '2026-03-15' })],
      get,
    )).toBe('col-aprovado')
  })

  it('data inválida não causa erro — retorna null', () => {
    expect(avaliarRegras(
      { entrega: 'nao-e-data' },
      [regra({ campoKey: 'entrega', operador: 'maior', valor: '2026-01-01' })],
      get,
    )).toBeNull()
  })
})

// ── Booleano ──────────────────────────────────────────────────────────────────

describe('operadores booleanos', () => {
  it('igual — true bate com true', () => {
    expect(avaliarRegras({ ativo: true }, [regra({ campoKey: 'ativo', operador: 'igual', valor: 'true' })], get)).toBe('col-aprovado')
  })

  it('diferente — false bate com true (diferente)', () => {
    expect(avaliarRegras({ ativo: false }, [regra({ campoKey: 'ativo', operador: 'diferente', valor: 'true' })], get)).toBe('col-aprovado')
  })
})

// ── Barrel export (lógica pura) ───────────────────────────────────────────────
// Apenas funções puras exportadas — componentes React são validados nos testes funcionais

describe('barrel exports — lógica pura', () => {
  it('avaliarRegras é uma função', () => {
    expect(avaliarRegras).toBeTypeOf('function')
  })

  it('OPERADORES_POR_TIPO é um objeto com 5 tipos', () => {
    expect(OPERADORES_POR_TIPO).toBeTypeOf('object')
    expect(Object.keys(OPERADORES_POR_TIPO)).toHaveLength(5)
  })
})
