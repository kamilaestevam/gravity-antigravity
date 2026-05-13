/**
 * use-unidades-pedido.test.ts — testes das funções puras do helper.
 *
 * Cobre:
 *  - filtra apenas categoria='peso' (KG/G/TON)
 *  - filtra ['comprimento','area','volume'] para cubagem (CM/M/CM2/M2/ML/LT/M3)
 *  - formata como "SIGLA — Nome" (decisão UX 2026-05-12)
 *
 * Decisão de design: testamos funções puras (filtrarUnidadesPorCategorias /
 * formatarRotuloUnidade), não o hook React, pra evitar dependência de DOM
 * neste teste-unitário. O comportamento React (cache singleton, useEffect)
 * já é coberto pelos testes do nucleo-global/modal-tabela-unidades.
 */
import { describe, it, expect, vi } from 'vitest'

// O hook React não é usado neste teste, mas o módulo importa `useUnidades`
// do nucleo-global. Stub vazio é suficiente — vitest não resolve o alias.
vi.mock('@nucleo/modal-tabela-unidades', () => ({
  useUnidades: () => ({ unidades: [], loading: false, erro: null }),
}))

import {
  filtrarUnidadesPorCategorias,
  formatarRotuloUnidade,
} from '../../../servicos-global/produto/pedido/client/src/shared/useUnidadesPedido'

const UNIDADES_FAKE = [
  { codigo_unidade: 'KG',  nome_unidade: 'Quilograma',          tipo_unidade: 'peso' as const,        ativo_unidade: true },
  { codigo_unidade: 'G',   nome_unidade: 'Grama',               tipo_unidade: 'peso' as const,        ativo_unidade: true },
  { codigo_unidade: 'TON', nome_unidade: 'Tonelada',            tipo_unidade: 'peso' as const,        ativo_unidade: true },
  { codigo_unidade: 'CM',  nome_unidade: 'Centímetro',          tipo_unidade: 'comprimento' as const, ativo_unidade: true },
  { codigo_unidade: 'M',   nome_unidade: 'Metro',               tipo_unidade: 'comprimento' as const, ativo_unidade: true },
  { codigo_unidade: 'CM2', nome_unidade: 'Centímetro quadrado', tipo_unidade: 'area' as const,        ativo_unidade: true },
  { codigo_unidade: 'M2',  nome_unidade: 'Metro quadrado',      tipo_unidade: 'area' as const,        ativo_unidade: true },
  { codigo_unidade: 'ML',  nome_unidade: 'Mililitro',           tipo_unidade: 'volume' as const,      ativo_unidade: true },
  { codigo_unidade: 'LT',  nome_unidade: 'Litro',               tipo_unidade: 'volume' as const,      ativo_unidade: true },
  { codigo_unidade: 'M3',  nome_unidade: 'Metro cúbico',        tipo_unidade: 'volume' as const,      ativo_unidade: true },
  { codigo_unidade: 'UN',  nome_unidade: 'Unidade',             tipo_unidade: 'contagem' as const,    ativo_unidade: true },
  { codigo_unidade: 'PC',  nome_unidade: 'Peça',                tipo_unidade: 'contagem' as const,    ativo_unidade: true },
]

describe('formatarRotuloUnidade', () => {
  it('produz formato "SIGLA — Nome"', () => {
    expect(formatarRotuloUnidade({ codigo_unidade: 'KG', nome_unidade: 'Quilograma', tipo_unidade: 'peso', ativo_unidade: true }))
      .toBe('KG — Quilograma')
  })
})

describe('filtrarUnidadesPorCategorias', () => {
  it('peso: retorna apenas categoria=peso, ordem mantida', () => {
    const r = filtrarUnidadesPorCategorias(UNIDADES_FAKE, ['peso'])
    expect(r).toEqual([
      { sigla: 'KG',  rotulo: 'KG — Quilograma' },
      { sigla: 'G',   rotulo: 'G — Grama' },
      { sigla: 'TON', rotulo: 'TON — Tonelada' },
    ])
  })

  it('cubagem: retorna comprimento + area + volume (decisão UX 2026-05-12)', () => {
    const r = filtrarUnidadesPorCategorias(UNIDADES_FAKE, ['comprimento', 'area', 'volume'])
    const siglas = r.map((u) => u.sigla)
    expect(siglas).toEqual(['CM', 'M', 'CM2', 'M2', 'ML', 'LT', 'M3'])
    expect(r[0]).toEqual({ sigla: 'CM', rotulo: 'CM — Centímetro' })
  })

  it('NÃO inclui peso quando pediu cubagem', () => {
    const r = filtrarUnidadesPorCategorias(UNIDADES_FAKE, ['comprimento', 'area', 'volume'])
    const siglas = r.map((u) => u.sigla)
    expect(siglas).not.toContain('KG')
    expect(siglas).not.toContain('G')
    expect(siglas).not.toContain('TON')
  })

  it('NÃO inclui contagem em peso nem em cubagem', () => {
    const peso = filtrarUnidadesPorCategorias(UNIDADES_FAKE, ['peso']).map((u) => u.sigla)
    const cubagem = filtrarUnidadesPorCategorias(UNIDADES_FAKE, ['comprimento', 'area', 'volume']).map((u) => u.sigla)
    expect(peso).not.toContain('UN')
    expect(peso).not.toContain('PC')
    expect(cubagem).not.toContain('UN')
    expect(cubagem).not.toContain('PC')
  })

  it('categoria inexistente retorna lista vazia', () => {
    const r = filtrarUnidadesPorCategorias(UNIDADES_FAKE, ['gemas'])
    expect(r).toEqual([])
  })

  it('múltiplas categorias podem ser combinadas', () => {
    const r = filtrarUnidadesPorCategorias(UNIDADES_FAKE, ['peso', 'contagem'])
    expect(r).toHaveLength(5)
    expect(r.map((u) => u.sigla).sort()).toEqual(['G', 'KG', 'PC', 'TON', 'UN'])
  })
})
