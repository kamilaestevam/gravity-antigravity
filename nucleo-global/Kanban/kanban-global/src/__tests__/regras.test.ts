import { describe, it, expect } from 'vitest'
import { avaliarRegras, OPERADORES_POR_TIPO } from '../regras'
import type { RegraKanban } from '../tipos'

// ── helpers ───────────────────────────────────────────────────────────────────

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
})

// ── avaliarRegras — casos básicos ─────────────────────────────────────────────

describe('avaliarRegras', () => {
  it('retorna null quando não há regras', () => {
    const item = { status: 'aprovado' }
    expect(avaliarRegras(item, [], get)).toBeNull()
  })

  it('retorna null quando regra está inativa', () => {
    const item  = { status: 'aprovado' }
    const regras = [regra({ ativo: false })]
    expect(avaliarRegras(item, regras, get)).toBeNull()
  })

  it('retorna null quando coluna destino = coluna atual', () => {
    const item  = { status: 'aprovado' }
    const regras = [regra({ colunaDestino: 'col-atual' })]
    expect(avaliarRegras(item, regras, get, 'col-atual')).toBeNull()
  })

  it('retorna coluna destino quando regra bate', () => {
    const item  = { status: 'aprovado' }
    const regras = [regra()]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })

  it('retorna null quando regra não bate', () => {
    const item  = { status: 'pendente' }
    const regras = [regra()]
    expect(avaliarRegras(item, regras, get)).toBeNull()
  })

  it('usa prioridade: menor número vence', () => {
    const item  = { status: 'aprovado' }
    const regras: RegraKanban[] = [
      regra({ id: 'r2', prioridade: 1, colunaDestino: 'col-baixa-prio' }),
      regra({ id: 'r1', prioridade: 0, colunaDestino: 'col-alta-prio' }),
    ]
    expect(avaliarRegras(item, regras, get)).toBe('col-alta-prio')
  })
})

// ── Operadores: preenchido / vazio ────────────────────────────────────────────

describe('operadores preenchido / vazio', () => {
  it('preenchido → true quando campo tem valor', () => {
    const item  = { nome: 'Alice' }
    const regras = [regra({ campoKey: 'nome', operador: 'preenchido', valor: undefined })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })

  it('preenchido → false quando campo é vazio', () => {
    const item  = { nome: '' }
    const regras = [regra({ campoKey: 'nome', operador: 'preenchido', valor: undefined })]
    expect(avaliarRegras(item, regras, get)).toBeNull()
  })

  it('vazio → true quando campo é undefined', () => {
    const item  = { nome: undefined }
    const regras = [regra({ campoKey: 'nome', operador: 'vazio', valor: undefined })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })

  it('vazio → false quando campo tem valor', () => {
    const item  = { nome: 'Alice' }
    const regras = [regra({ campoKey: 'nome', operador: 'vazio', valor: undefined })]
    expect(avaliarRegras(item, regras, get)).toBeNull()
  })
})

// ── Operadores: texto ─────────────────────────────────────────────────────────

describe('operadores de texto', () => {
  it('contem — case insensitive', () => {
    const item  = { titulo: 'Projeto Alpha' }
    const regras = [regra({ campoKey: 'titulo', operador: 'contem', valor: 'alpha' })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })

  it('nao_contem — retorna coluna quando não contém', () => {
    const item  = { titulo: 'Projeto Beta' }
    const regras = [regra({ campoKey: 'titulo', operador: 'nao_contem', valor: 'alpha' })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })

  it('diferente — bate quando valores diferentes', () => {
    const item  = { status: 'pendente' }
    const regras = [regra({ campoKey: 'status', operador: 'diferente', valor: 'aprovado' })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })
})

// ── Operadores: numérico ──────────────────────────────────────────────────────

describe('operadores numéricos', () => {
  it('maior — 200 > 100', () => {
    const item  = { valor: 200 }
    const regras = [regra({ campoKey: 'valor', operador: 'maior', valor: '100' })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })

  it('menor — 50 < 100', () => {
    const item  = { valor: 50 }
    const regras = [regra({ campoKey: 'valor', operador: 'menor', valor: '100' })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })

  it('maior_igual — 100 >= 100', () => {
    const item  = { valor: 100 }
    const regras = [regra({ campoKey: 'valor', operador: 'maior_igual', valor: '100' })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })

  it('menor_igual — 99 <= 100', () => {
    const item  = { valor: 99 }
    const regras = [regra({ campoKey: 'valor', operador: 'menor_igual', valor: '100' })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })

  it('maior — null não bate', () => {
    const item  = { valor: null }
    const regras = [regra({ campoKey: 'valor', operador: 'maior', valor: '0' })]
    expect(avaliarRegras(item, regras, get)).toBeNull()
  })
})

// ── Operadores: data ──────────────────────────────────────────────────────────

describe('operadores de data', () => {
  it('maior — data posterior bate', () => {
    const item  = { entrega: '2026-06-01' }
    const regras = [regra({ campoKey: 'entrega', operador: 'maior', valor: '2026-01-01' })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })

  it('menor — data anterior bate', () => {
    const item  = { entrega: '2025-01-01' }
    const regras = [regra({ campoKey: 'entrega', operador: 'menor', valor: '2026-01-01' })]
    expect(avaliarRegras(item, regras, get)).toBe('col-aprovado')
  })
})

// ── Múltiplas regras — só a primeira com prioridade maior bate ────────────────

describe('múltiplas regras', () => {
  it('primeira regra ativa que bate vence', () => {
    const item = { status: 'aprovado', valor: 500 }
    const regras: RegraKanban[] = [
      regra({ id: 'r1', prioridade: 0, campoKey: 'status', operador: 'igual', valor: 'aprovado', colunaDestino: 'col-1' }),
      regra({ id: 'r2', prioridade: 1, campoKey: 'valor',  operador: 'maior', valor: '100',      colunaDestino: 'col-2' }),
    ]
    expect(avaliarRegras(item, regras, get)).toBe('col-1')
  })

  it('pula regras inativas e usa a próxima ativa', () => {
    const item = { status: 'aprovado' }
    const regras: RegraKanban[] = [
      regra({ id: 'r1', prioridade: 0, ativo: false, colunaDestino: 'col-inativa' }),
      regra({ id: 'r2', prioridade: 1, ativo: true,  colunaDestino: 'col-ativa'   }),
    ]
    expect(avaliarRegras(item, regras, get)).toBe('col-ativa')
  })
})
