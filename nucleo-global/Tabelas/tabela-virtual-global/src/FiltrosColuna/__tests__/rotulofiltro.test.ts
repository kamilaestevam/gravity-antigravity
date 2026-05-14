// FiltrosColuna/__tests__/rotulofiltro.test.ts
//
// Testes do helper híbrido `rotulofiltro` — refactor D9 (2026-05-13).
// Cobertura: 3 tipos de filtro × edge cases + threshold customizado + i18n override.

import { describe, it, expect } from 'vitest'
import { rotulofiltro } from '../rotulofiltro'
import type { FiltroAtivo } from '../tipos'

describe('rotulofiltro — texto', () => {
  it('retorna o valor de texto direto', () => {
    const filtro: FiltroAtivo = { tipo: 'texto', valor: 'João' }
    expect(rotulofiltro(filtro)).toBe('João')
  })

  it('retorna string vazia quando o valor é vazio', () => {
    const filtro: FiltroAtivo = { tipo: 'texto', valor: '' }
    expect(rotulofiltro(filtro)).toBe('')
  })
})

describe('rotulofiltro — enum (modo híbrido)', () => {
  it('0 valores → "(nenhum)"', () => {
    const filtro: FiltroAtivo = { tipo: 'enum', valor: new Set() }
    expect(rotulofiltro(filtro)).toBe('(nenhum)')
  })

  it('1 valor → nome direto', () => {
    const filtro: FiltroAtivo = { tipo: 'enum', valor: new Set(['Importação']) }
    expect(rotulofiltro(filtro)).toBe('Importação')
  })

  it('2 valores → nomes separados por vírgula', () => {
    const filtro: FiltroAtivo = { tipo: 'enum', valor: new Set(['Importação', 'Exportação']) }
    expect(rotulofiltro(filtro)).toBe('Importação, Exportação')
  })

  it('3 valores → "N selecionados" (consolidado)', () => {
    const filtro: FiltroAtivo = { tipo: 'enum', valor: new Set(['A', 'B', 'C']) }
    expect(rotulofiltro(filtro)).toBe('3 selecionados')
  })

  it('14 valores → "14 selecionados"', () => {
    const valores = new Set(Array.from({ length: 14 }, (_, i) => `WS-${i}`))
    const filtro: FiltroAtivo = { tipo: 'enum', valor: valores }
    expect(rotulofiltro(filtro)).toBe('14 selecionados')
  })

  it('threshold customizado=3 → 3 valores ainda mostra nomes', () => {
    const filtro: FiltroAtivo = { tipo: 'enum', valor: new Set(['A', 'B', 'C']) }
    expect(rotulofiltro(filtro, 3)).toBe('A, B, C')
  })

  it('threshold customizado=3 → 4 valores consolida', () => {
    const filtro: FiltroAtivo = { tipo: 'enum', valor: new Set(['A', 'B', 'C', 'D']) }
    expect(rotulofiltro(filtro, 3)).toBe('4 selecionados')
  })

  it('i18n override muda "N selecionados"', () => {
    const filtro: FiltroAtivo = { tipo: 'enum', valor: new Set(['A', 'B', 'C']) }
    const traducoes = {
      nSelecionados: (n: number) => `${n} selected`,
    }
    expect(rotulofiltro(filtro, 2, traducoes)).toBe('3 selected')
  })
})

describe('rotulofiltro — numero (range)', () => {
  it('min + max → "min — max"', () => {
    const filtro: FiltroAtivo = { tipo: 'numero', valor: { min: 10, max: 100 } }
    expect(rotulofiltro(filtro)).toBe('10 — 100')
  })

  it('só min → "≥ min"', () => {
    const filtro: FiltroAtivo = { tipo: 'numero', valor: { min: 50 } }
    expect(rotulofiltro(filtro)).toBe('≥ 50')
  })

  it('só max → "≤ max"', () => {
    const filtro: FiltroAtivo = { tipo: 'numero', valor: { max: 50 } }
    expect(rotulofiltro(filtro)).toBe('≤ 50')
  })

  it('nem min nem max → string vazia (filtro vazio)', () => {
    const filtro: FiltroAtivo = { tipo: 'numero', valor: {} }
    expect(rotulofiltro(filtro)).toBe('')
  })

  it('min=0 e max=0 → trata como definidos (não falso negativo)', () => {
    const filtro: FiltroAtivo = { tipo: 'numero', valor: { min: 0, max: 0 } }
    expect(rotulofiltro(filtro)).toBe('0 — 0')
  })
})
