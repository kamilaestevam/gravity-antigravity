/**
 * useUnidades.test.ts — testes unitários do hook canônico de unidades.
 *
 * Cobre:
 *   - Cache miss inicial: dispara fetch, popula state após resolver
 *   - Cache hit: segunda renderização não chama fetch novamente
 *   - Erro de rede: state.erro populado, state.unidades vazio
 *   - recarregar(): força novo fetch e atualiza
 *   - Validação Zod: rejeita resposta com shape inválido
 *   - Filtro `ativo_unidade=false` removido da lista
 *   - Ordenação por categoria (peso primeiro, embalagem por último)
 *   - Schema bilateral: aceita o shape esperado do backend
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import {
  useUnidades,
  invalidarCacheUnidades,
  unidadeSchema,
  listaUnidadesSchema,
} from '../../../../nucleo-global/Modais/modal-tabela-unidades/src/useUnidades.js'

const RESPOSTA_VALIDA = {
  itens: [
    { codigo_unidade: 'CX10', nome_unidade: 'Caixa com 10', tipo_unidade: 'caixa', ativo_unidade: true },
    { codigo_unidade: 'KG',   nome_unidade: 'Quilograma',   tipo_unidade: 'peso',  ativo_unidade: true },
    { codigo_unidade: 'EMBAL', nome_unidade: 'Embalagem',   tipo_unidade: 'embalagem', ativo_unidade: true },
    { codigo_unidade: 'LT',   nome_unidade: 'Litro',        tipo_unidade: 'volume', ativo_unidade: true },
    { codigo_unidade: 'XXX',  nome_unidade: 'Inativa',      tipo_unidade: 'peso',  ativo_unidade: false },
  ],
  total: 5,
}

beforeEach(() => {
  invalidarCacheUnidades()
  vi.restoreAllMocks()
})

describe('useUnidades — fluxo de carga', () => {
  it('dispara fetch na primeira renderização, popula com ATIVAS apenas', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(RESPOSTA_VALIDA), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useUnidades())

    expect(result.current.loading).toBe(true)
    expect(result.current.unidades).toEqual([])

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.erro).toBeNull()
    expect(result.current.unidades).toHaveLength(4) // XXX inativa filtrada
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/cadastros/unidades?por_pagina=500')
  })

  it('não refaz fetch quando cache singleton já está populado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(RESPOSTA_VALIDA), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const r1 = renderHook(() => useUnidades())
    await waitFor(() => expect(r1.result.current.loading).toBe(false))
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const r2 = renderHook(() => useUnidades())
    await waitFor(() => expect(r2.result.current.loading).toBe(false))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('useUnidades — tratamento de erro (Mandamento 08)', () => {
  it('expõe erro quando fetch retorna 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })))

    const { result } = renderHook(() => useUnidades())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.erro).toMatch(/500/)
    expect(result.current.unidades).toEqual([])
  })

  it('expõe erro quando fetch lança', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Net down')))
    const { result } = renderHook(() => useUnidades())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.erro).toBe('Net down')
  })

  it('rejeita resposta com tipo_unidade fora do enum (Mand. 06+09)', async () => {
    const respostaQuebrada = {
      itens: [{ codigo_unidade: 'X', nome_unidade: 'Y', tipo_unidade: 'INEXISTENTE', ativo_unidade: true }],
      total: 1,
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(respostaQuebrada), { status: 200 })))

    const { result } = renderHook(() => useUnidades())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.erro).not.toBeNull()
    expect(result.current.unidades).toEqual([])
  })
})

describe('useUnidades — ordenação por categoria (UX)', () => {
  it('peso vem antes de volume, comprimento, embalagem, caixa', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(RESPOSTA_VALIDA), { status: 200 })))

    const { result } = renderHook(() => useUnidades())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const ordem = result.current.unidades.map((u) => `${u.tipo_unidade}:${u.codigo_unidade}`)
    expect(ordem).toEqual(['peso:KG', 'volume:LT', 'embalagem:EMBAL', 'caixa:CX10'])
  })
})

describe('useUnidades — recarregar', () => {
  it('força novo fetch e atualiza lista', async () => {
    const r1 = { itens: [{ codigo_unidade: 'KG', nome_unidade: 'KG', tipo_unidade: 'peso', ativo_unidade: true }], total: 1 }
    const r2 = RESPOSTA_VALIDA
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(r1), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(r2), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useUnidades())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.unidades).toHaveLength(1)

    await act(async () => { await result.current.recarregar() })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.current.unidades).toHaveLength(4)
  })
})

describe('Schema bilateral — espelha cadastros/shared/schemas/unidade.schema.ts', () => {
  it('aceita Unidade válida com tipo do enum', () => {
    expect(unidadeSchema.safeParse({ codigo_unidade: 'KG', nome_unidade: 'Quilograma', tipo_unidade: 'peso', ativo_unidade: true }).success).toBe(true)
  })

  it('rejeita codigo_unidade > 8 chars', () => {
    expect(unidadeSchema.safeParse({ codigo_unidade: 'CODIGOTAOLONGO', nome_unidade: 'X', tipo_unidade: 'peso', ativo_unidade: true }).success).toBe(false)
  })

  it('rejeita tipo_unidade fora do enum', () => {
    expect(unidadeSchema.safeParse({ codigo_unidade: 'X', nome_unidade: 'X', tipo_unidade: 'NAO_EXISTE', ativo_unidade: true }).success).toBe(false)
  })

  it('listaUnidadesSchema valida envelope { itens, total }', () => {
    expect(listaUnidadesSchema.safeParse(RESPOSTA_VALIDA).success).toBe(true)
    expect(listaUnidadesSchema.safeParse({ itens: 'naoarray', total: 1 }).success).toBe(false)
  })
})
