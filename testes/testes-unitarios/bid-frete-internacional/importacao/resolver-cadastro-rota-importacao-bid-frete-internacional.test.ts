/// <reference types="vitest/globals" />

import {
  resolverPortoNoCatalogoImportacao,
  sugerirPortosNoCatalogoImportacao,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/resolver-cadastro-rota-importacao-bid-frete-internacional'
import type { CatalogoPortoRota } from '../../../../servicos-global/produto/bid-frete-internacional/shared/rota-cotacao-bid-frete-internacional'

const PORTOS: readonly CatalogoPortoRota[] = [
  {
    codigo_unlocode_porto: 'ARBUE',
    nome_porto: 'Buenos Aires',
    codigo_pais_porto: 'AR',
  },
  {
    codigo_unlocode_porto: 'BRSSZ',
    nome_porto: 'Santos',
    codigo_pais_porto: 'BR',
  },
]

describe('resolver-cadastro-rota-importacao-bid-frete-internacional', () => {
  it('resolve porto por UNLOCODE mesmo com busca curta', () => {
    const { porto, ambiguo } = resolverPortoNoCatalogoImportacao('ARBUE', PORTOS)
    expect(porto?.codigo_unlocode_porto).toBe('ARBUE')
    expect(ambiguo).toBe(false)
  })

  it('não faz partial match com abreviação curta (ex.: "bue" → Buenos Aires)', () => {
    const { porto, ambiguo } = resolverPortoNoCatalogoImportacao('bue', PORTOS)
    expect(porto).toBeNull()
    expect(ambiguo).toBe(false)
  })

  it('não resolve nome parcial — exige opção exata do catálogo (ex.: "buenos")', () => {
    const { porto, ambiguo } = resolverPortoNoCatalogoImportacao('buenos', PORTOS)
    expect(porto).toBeNull()
    expect(ambiguo).toBe(false)
  })

  it('sugere Buenos Aires para abreviação "bue"', () => {
    const sugestoes = sugerirPortosNoCatalogoImportacao('bue', PORTOS)
    expect(sugestoes).toHaveLength(1)
    expect(sugestoes[0]?.codigo_unlocode_porto).toBe('ARBUE')
  })

  it('resolve rótulo template "SIGLA — Nome"', () => {
    const { porto } = resolverPortoNoCatalogoImportacao('BRSSZ — Santos', PORTOS)
    expect(porto?.codigo_unlocode_porto).toBe('BRSSZ')
  })
})
