/**
 * kanbanColunas.test.ts
 *
 * Testes unitários para computarColunasKanban — lógica de colunas do Kanban de Pedidos.
 * Valida que ordem, label, cor e isReadOnly vêm 100% do statusConfig (API).
 */

import { describe, it, expect } from 'vitest'
import {
  computarColunasKanban,
  IS_READ_ONLY_MAP,
} from '../../../../produto/pedido/client/src/shared/kanbanUtils'
import type { PedidoStatusConfig } from '../../../../produto/pedido/client/src/shared/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeStatus(overrides: Partial<PedidoStatusConfig> & { nome: string; rotulo: string; cor: string; ordem: number }): PedidoStatusConfig {
  return {
    id: `id-${overrides.nome}`,
    is_padrao: false,
    is_sistema: true,
    ...overrides,
  }
}

const STATUS_BASE: PedidoStatusConfig[] = [
  makeStatus({ nome: 'draft',         rotulo: 'Rascunho API',    cor: '#aaaaaa', ordem: 1 }),
  makeStatus({ nome: 'aberto',        rotulo: 'Aberto API',      cor: '#bbbbbb', ordem: 2 }),
  makeStatus({ nome: 'transferencia', rotulo: 'Andamento API',   cor: '#cccccc', ordem: 3 }),
  makeStatus({ nome: 'consolidado',   rotulo: 'Consolidado API', cor: '#dddddd', ordem: 4 }),
  makeStatus({ nome: 'cancelado',     rotulo: 'Cancelado API',   cor: '#eeeeee', ordem: 5 }),
]

// ── U01 — statusConfig vazio → fallback com 5 colunas base ───────────────────

describe('U01 — statusConfig vazio usa COLUNAS_FALLBACK', () => {
  it('retorna 5 colunas quando statusConfig está vazio', () => {
    const resultado = computarColunasKanban([])
    expect(resultado).toHaveLength(5)
  })

  it('primeira coluna é draft', () => {
    const [primeira] = computarColunasKanban([])
    expect(primeira.key).toBe('draft')
    expect(primeira.label).toBe('Rascunho')
  })

  it('cancelado no fallback tem isReadOnly: true', () => {
    const resultado = computarColunasKanban([])
    const cancelado = resultado.find(c => c.key === 'cancelado')
    expect(cancelado?.isReadOnly).toBe(true)
  })

  it('demais colunas no fallback não têm isReadOnly', () => {
    const resultado = computarColunasKanban([])
    const semReadOnly = resultado.filter(c => c.key !== 'cancelado')
    semReadOnly.forEach(c => {
      expect(c.isReadOnly).toBeUndefined()
    })
  })
})

// ── U02 — ordem vem da API (campo `ordem`) ────────────────────────────────────

describe('U02 — ordem respeita campo `ordem` da API', () => {
  it('retorna colunas na ordem crescente de `ordem`', () => {
    const embaralhado: PedidoStatusConfig[] = [
      makeStatus({ nome: 'consolidado', rotulo: 'C', cor: '#1', ordem: 4 }),
      makeStatus({ nome: 'draft',       rotulo: 'D', cor: '#2', ordem: 1 }),
      makeStatus({ nome: 'aberto',      rotulo: 'A', cor: '#3', ordem: 2 }),
    ]
    const resultado = computarColunasKanban(embaralhado)
    expect(resultado.map(c => c.key)).toEqual(['draft', 'aberto', 'consolidado'])
  })

  it('não muta o array de entrada ao ordenar', () => {
    const entrada = [
      makeStatus({ nome: 'b', rotulo: 'B', cor: '#1', ordem: 2 }),
      makeStatus({ nome: 'a', rotulo: 'A', cor: '#2', ordem: 1 }),
    ]
    const copiaAntes = entrada.map(e => e.nome)
    computarColunasKanban(entrada)
    expect(entrada.map(e => e.nome)).toEqual(copiaAntes)
  })
})

// ── U03 — label e cor vêm da API ─────────────────────────────────────────────

describe('U03 — label e cor vêm 100% da API', () => {
  it('label usa `rotulo` do statusConfig, não valor hardcoded', () => {
    const config = [makeStatus({ nome: 'draft', rotulo: 'Meu Rascunho Customizado', cor: '#fff', ordem: 1 })]
    const [col] = computarColunasKanban(config)
    expect(col.label).toBe('Meu Rascunho Customizado')
  })

  it('cor usa `cor` do statusConfig, não valor hardcoded', () => {
    const config = [makeStatus({ nome: 'aberto', rotulo: 'Aberto', cor: '#ff00ff', ordem: 1 })]
    const [col] = computarColunasKanban(config)
    expect(col.color).toBe('#ff00ff')
  })

  it('retorna todos os status fornecidos pela API', () => {
    const resultado = computarColunasKanban(STATUS_BASE)
    expect(resultado).toHaveLength(5)
    expect(resultado.map(c => c.key)).toEqual(['draft', 'aberto', 'transferencia', 'consolidado', 'cancelado'])
  })
})

// ── U04 — cancelado mantém isReadOnly: true mesmo com label da API ───────────

describe('U04 — cancelado tem isReadOnly independente de label/cor', () => {
  it('cancelado com label customizado ainda tem isReadOnly: true', () => {
    const config = [makeStatus({ nome: 'cancelado', rotulo: 'Anulado', cor: '#123456', ordem: 1 })]
    const [col] = computarColunasKanban(config)
    expect(col.isReadOnly).toBe(true)
    expect(col.label).toBe('Anulado')
    expect(col.color).toBe('#123456')
  })
})

// ── U05 — statuses customizados (Aprovado, DANIEL) aparecem como colunas ─────

describe('U05 — statuses customizados da API aparecem como colunas', () => {
  it('inclui status customizados que não estão em COLUNAS_BASE', () => {
    const config = [
      makeStatus({ nome: 'draft',    rotulo: 'Rascunho', cor: '#aaa', ordem: 1 }),
      makeStatus({ nome: 'aprovado', rotulo: 'Aprovado', cor: '#0f0', ordem: 6, is_sistema: false }),
      makeStatus({ nome: 'DANIEL',   rotulo: 'Daniel',   cor: '#00f', ordem: 7, is_sistema: false }),
    ]
    const resultado = computarColunasKanban(config)
    expect(resultado).toHaveLength(3)
    expect(resultado[1].key).toBe('aprovado')
    expect(resultado[1].label).toBe('Aprovado')
    expect(resultado[2].key).toBe('DANIEL')
    expect(resultado[2].label).toBe('Daniel')
  })

  it('statuses customizados não têm isReadOnly', () => {
    const config = [
      makeStatus({ nome: 'aprovado', rotulo: 'Aprovado', cor: '#0f0', ordem: 1, is_sistema: false }),
    ]
    const [col] = computarColunasKanban(config)
    expect(col.isReadOnly).toBeUndefined()
  })
})

// ── U07 — filtro de colunas_ocultas (lógica de KanbanPedidos.tsx) ────────────

describe('U07 — colunas_ocultas filtra corretamente antes de computarColunasKanban', () => {
  it('exclui status cujo nome está em colunas_ocultas', () => {
    const ocultas = new Set(['cancelado'])
    const filtrado = STATUS_BASE.filter(s => !ocultas.has(s.nome))
    const resultado = computarColunasKanban(filtrado)
    expect(resultado.find(c => c.key === 'cancelado')).toBeUndefined()
    expect(resultado).toHaveLength(4)
  })

  it('array vazio de ocultas retorna todas as colunas', () => {
    const ocultas = new Set<string>([])
    const filtrado = STATUS_BASE.filter(s => !ocultas.has(s.nome))
    const resultado = computarColunasKanban(filtrado)
    expect(resultado).toHaveLength(5)
  })

  it('todas ocultas: filtrado é vazio, caller retorna [] em vez de chamar computarColunasKanban', () => {
    // KanbanPedidos.tsx faz: if (!configFiltrado.length) return []
    // computarColunasKanban([]) retorna FALLBACK por design — o caller é responsável pelo caso "vazio"
    const ocultas = new Set(STATUS_BASE.map(s => s.nome))
    const filtrado = STATUS_BASE.filter(s => !ocultas.has(s.nome))
    expect(filtrado).toHaveLength(0)  // a filtragem produz array vazio

    // Se o caller passa array vazio, computarColunasKanban retorna FALLBACK (comportamento esperado)
    const resultado = computarColunasKanban(filtrado)
    expect(resultado).toHaveLength(5)  // fallback, não vazio
    // Note: o caller (KanbanPedidos.tsx) intercepta o caso vazio antes de chamar esta função
  })
})

// ── U06 — IS_READ_ONLY_MAP contém apenas cancelado ───────────────────────────

describe('U06 — IS_READ_ONLY_MAP define exatamente os statuses somente-leitura', () => {
  it('cancelado está no mapa de isReadOnly', () => {
    expect(IS_READ_ONLY_MAP['cancelado']).toBe(true)
  })

  it('statuses base operacionais não estão no mapa de isReadOnly', () => {
    const operacionais = ['draft', 'aberto', 'transferencia', 'consolidado']
    operacionais.forEach(nome => {
      expect(IS_READ_ONLY_MAP[nome]).toBeUndefined()
    })
  })
})
