// FiltrosColuna/__tests__/detectarTipoColuna.test.ts
//
// Testes do helper `detectarTipoColuna` — refactor D9 (2026-05-13).
// Cobertura: regras default por `col.tipo` + overrides do consumer.

import { describe, it, expect } from 'vitest'
import { detectarTipoColuna } from '../detectarTipoColuna'
import type { GTColuna } from '../../tipos'

// Helper: cria uma coluna mínima válida para teste
function mkCol(key: string, tipo?: GTColuna['tipo']): GTColuna {
  return { key, label: key, tipo } as GTColuna
}

describe('detectarTipoColuna — regras default', () => {
  it('col.tipo="numero" → "numero"', () => {
    const col = mkCol('valor_total', 'numero')
    expect(detectarTipoColuna(col)).toBe('numero')
  })

  it('col.tipo="badge" → "enum" (badges sempre discretos)', () => {
    const col = mkCol('status', 'badge')
    expect(detectarTipoColuna(col)).toBe('enum')
  })

  it('col.tipo="texto" → "texto"', () => {
    const col = mkCol('nome', 'texto')
    expect(detectarTipoColuna(col)).toBe('texto')
  })

  it('col.tipo ausente → "texto" (default)', () => {
    const col = mkCol('campo_qualquer')
    expect(detectarTipoColuna(col)).toBe('texto')
  })

  it('col.tipo="moeda" → "texto" (sem regra específica)', () => {
    const col = mkCol('preco', 'moeda')
    expect(detectarTipoColuna(col)).toBe('texto')
  })

  it('col.tipo="unidade" → "texto"', () => {
    const col = mkCol('peso', 'unidade')
    expect(detectarTipoColuna(col)).toBe('texto')
  })

  it('col.tipo="periodo" → "texto"', () => {
    const col = mkCol('data_criacao', 'periodo')
    expect(detectarTipoColuna(col)).toBe('texto')
  })
})

describe('detectarTipoColuna — overrides', () => {
  it('override força "enum" mesmo com col.tipo="texto"', () => {
    const col = mkCol('id_workspace', 'texto')
    const result = detectarTipoColuna(col, { id_workspace: 'enum' })
    expect(result).toBe('enum')
  })

  it('override força "numero" mesmo com col.tipo="texto"', () => {
    const col = mkCol('quantidade', 'texto')
    const result = detectarTipoColuna(col, { quantidade: 'numero' })
    expect(result).toBe('numero')
  })

  it('override em coluna NÃO listada → fallback para regras default', () => {
    const col = mkCol('outra_coluna', 'badge')
    const result = detectarTipoColuna(col, { id_workspace: 'enum' })
    expect(result).toBe('enum') // pela regra default de badge
  })

  it('overrides vazios → mesmo comportamento das regras default', () => {
    const col = mkCol('status', 'badge')
    expect(detectarTipoColuna(col, {})).toBe('enum')
  })

  it('override pode FORÇAR "texto" sobrepondo badge', () => {
    const col = mkCol('campo_especial', 'badge')
    const result = detectarTipoColuna(col, { campo_especial: 'texto' })
    expect(result).toBe('texto')
  })

  it('Pedido — exemplo real: forçar enum em colunas específicas', () => {
    const pedidoOverrides = {
      status: 'enum',
      tipo_operacao: 'enum',
      incoterm: 'enum',
      id_workspace: 'enum',
    } as const

    expect(detectarTipoColuna(mkCol('status', 'texto'), pedidoOverrides)).toBe('enum')
    expect(detectarTipoColuna(mkCol('tipo_operacao'), pedidoOverrides)).toBe('enum')
    expect(detectarTipoColuna(mkCol('incoterm'), pedidoOverrides)).toBe('enum')
    expect(detectarTipoColuna(mkCol('id_workspace'), pedidoOverrides)).toBe('enum')

    // Colunas não listadas usam default
    expect(detectarTipoColuna(mkCol('valor_total', 'numero'), pedidoOverrides)).toBe('numero')
    expect(detectarTipoColuna(mkCol('numero_pedido', 'texto'), pedidoOverrides)).toBe('texto')
  })
})
