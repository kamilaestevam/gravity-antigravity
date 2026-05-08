/**
 * useMoedas.test.ts — testes unitários do hook canônico de moedas.
 *
 * Cobre:
 *   - Cache miss inicial: dispara fetch, popula state após resolver
 *   - Cache hit: segunda renderização não chama fetch novamente
 *   - Erro de rede: state.erro populado, state.moedas vazio
 *   - recarregar(): força novo fetch e atualiza
 *   - Validação Zod: rejeita resposta com shape inválido
 *   - Filtro `ativo_moeda=false` removido da lista
 *   - Contrato bilateral: schema do hook aceita o shape do backend
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import {
  useMoedas,
  invalidarCacheMoedas,
  moedaSchema,
  listaMoedasSchema,
  MOEDAS_PRIORITARIAS_UX,
} from '../../../../nucleo-global/Modais/modal-tabela-moeda/src/useMoedas.js'

const RESPOSTA_VALIDA = {
  itens: [
    { codigo_moeda: 'USD', nome_moeda: 'Dólar', simbolo_moeda: 'USD', ativo_moeda: true },
    { codigo_moeda: 'EUR', nome_moeda: 'Euro', simbolo_moeda: 'EUR', ativo_moeda: true },
    { codigo_moeda: 'XYZ', nome_moeda: 'Inativa', simbolo_moeda: 'XYZ', ativo_moeda: false },
  ],
  total: 3,
}

beforeEach(() => {
  invalidarCacheMoedas()
  vi.restoreAllMocks()
})

describe('useMoedas — fluxo de carga', () => {
  it('dispara fetch na primeira renderização, popula state com moedas ATIVAS apenas', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(RESPOSTA_VALIDA), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useMoedas())

    expect(result.current.loading).toBe(true)
    expect(result.current.moedas).toEqual([])

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.erro).toBeNull()
    expect(result.current.moedas).toHaveLength(2) // XYZ inativa filtrada
    expect(result.current.moedas.map((m) => m.codigo_moeda)).toEqual(['USD', 'EUR'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/cadastros/moedas?por_pagina=500')
  })

  it('não refaz fetch quando cache singleton já está populado (segunda renderização)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(RESPOSTA_VALIDA), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    // 1ª render — popula cache
    const r1 = renderHook(() => useMoedas())
    await waitFor(() => expect(r1.result.current.loading).toBe(false))
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // 2ª render — usa cache
    const r2 = renderHook(() => useMoedas())
    await waitFor(() => expect(r2.result.current.loading).toBe(false))
    expect(r2.result.current.moedas).toHaveLength(2)
    expect(fetchMock).toHaveBeenCalledTimes(1) // ainda 1 — cache hit
  })
})

describe('useMoedas — tratamento de erro (Mandamento 08)', () => {
  it('expõe erro explícito quando fetch retorna 500', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('Internal Server Error', { status: 500 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useMoedas())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.erro).toMatch(/500/)
    expect(result.current.moedas).toEqual([])
  })

  it('expõe erro quando fetch lança (rede caiu)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network down'))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useMoedas())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.erro).toBe('Network down')
    expect(result.current.moedas).toEqual([])
  })

  it('rejeita resposta com shape inválido (Mandamento 06 + 09)', async () => {
    const respostaQuebrada = { itens: [{ codigo_moeda: 'INVÁLIDO_minúsculo', nome_moeda: 'X', simbolo_moeda: '$', ativo_moeda: true }], total: 1 }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(respostaQuebrada), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useMoedas())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.erro).not.toBeNull()
    expect(result.current.moedas).toEqual([])
  })
})

describe('useMoedas — recarregar', () => {
  it('força novo fetch e atualiza lista', async () => {
    const respostaInicial = { itens: [{ codigo_moeda: 'BRL', nome_moeda: 'Real', simbolo_moeda: 'BRL', ativo_moeda: true }], total: 1 }
    const respostaNova = RESPOSTA_VALIDA
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(respostaInicial), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(respostaNova), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useMoedas())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.moedas.map((m) => m.codigo_moeda)).toEqual(['BRL'])

    await act(async () => {
      await result.current.recarregar()
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.current.moedas.map((m) => m.codigo_moeda)).toEqual(['USD', 'EUR'])
  })
})

describe('useMoedas — ordenação UX (prioritárias primeiro, demais alfabético)', () => {
  it('coloca USD/EUR/BRL no topo quando presentes na resposta', async () => {
    const respostaEmbaralhada = {
      itens: [
        { codigo_moeda: 'AED', nome_moeda: 'Dirham', simbolo_moeda: 'AED', ativo_moeda: true },
        { codigo_moeda: 'BRL', nome_moeda: 'Real', simbolo_moeda: 'BRL', ativo_moeda: true },
        { codigo_moeda: 'AFN', nome_moeda: 'Afegane', simbolo_moeda: 'AFN', ativo_moeda: true },
        { codigo_moeda: 'EUR', nome_moeda: 'Euro', simbolo_moeda: 'EUR', ativo_moeda: true },
        { codigo_moeda: 'USD', nome_moeda: 'Dólar', simbolo_moeda: 'USD', ativo_moeda: true },
        { codigo_moeda: 'JPY', nome_moeda: 'Iene', simbolo_moeda: 'JPY', ativo_moeda: true },
      ],
      total: 6,
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(respostaEmbaralhada), { status: 200 })))

    const { result } = renderHook(() => useMoedas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const ordem = result.current.moedas.map((m) => m.codigo_moeda)
    // USD, EUR, BRL primeiro (ordem da lista MOEDAS_PRIORITARIAS_UX)
    expect(ordem.slice(0, 4)).toEqual(['USD', 'EUR', 'BRL', 'JPY'])
    // Demais em alfabético: AED, AFN
    expect(ordem.slice(4)).toEqual(['AED', 'AFN'])
  })

  it('respeita a ordem da MOEDAS_PRIORITARIAS_UX (USD, EUR, BRL, CNY, GBP, JPY)', async () => {
    const todasPrioritarias = {
      itens: MOEDAS_PRIORITARIAS_UX.map((sigla) => ({
        codigo_moeda: sigla,
        nome_moeda: `Moeda ${sigla}`,
        simbolo_moeda: sigla,
        ativo_moeda: true,
      })).reverse(), // entram na resposta em ordem reversa
      total: MOEDAS_PRIORITARIAS_UX.length,
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(todasPrioritarias), { status: 200 })))

    const { result } = renderHook(() => useMoedas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.moedas.map((m) => m.codigo_moeda)).toEqual([...MOEDAS_PRIORITARIAS_UX])
  })

  it('quando nenhuma prioritária está presente, ordena tudo alfabeticamente', async () => {
    const semPrioridade = {
      itens: [
        { codigo_moeda: 'ZWL', nome_moeda: 'Zim', simbolo_moeda: 'ZWL', ativo_moeda: true },
        { codigo_moeda: 'AFN', nome_moeda: 'Afegane', simbolo_moeda: 'AFN', ativo_moeda: true },
        { codigo_moeda: 'KZT', nome_moeda: 'Tenge', simbolo_moeda: 'KZT', ativo_moeda: true },
      ],
      total: 3,
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(semPrioridade), { status: 200 })))

    const { result } = renderHook(() => useMoedas())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.moedas.map((m) => m.codigo_moeda)).toEqual(['AFN', 'KZT', 'ZWL'])
  })
})

describe('Schema bilateral — espelha cadastros/shared/schemas/moeda.schema.ts', () => {
  it('aceita Moeda válida com 3 letras maiúsculas', () => {
    const ok = moedaSchema.safeParse({ codigo_moeda: 'USD', nome_moeda: 'Dólar', simbolo_moeda: 'USD', ativo_moeda: true })
    expect(ok.success).toBe(true)
  })

  it('rejeita codigo_moeda fora do padrão ISO 4217', () => {
    expect(moedaSchema.safeParse({ codigo_moeda: 'us', nome_moeda: 'X', simbolo_moeda: '$', ativo_moeda: true }).success).toBe(false)
    expect(moedaSchema.safeParse({ codigo_moeda: 'USDX', nome_moeda: 'X', simbolo_moeda: '$', ativo_moeda: true }).success).toBe(false)
    expect(moedaSchema.safeParse({ codigo_moeda: '123', nome_moeda: 'X', simbolo_moeda: '$', ativo_moeda: true }).success).toBe(false)
  })

  it('rejeita nome_moeda vazio', () => {
    expect(moedaSchema.safeParse({ codigo_moeda: 'USD', nome_moeda: '', simbolo_moeda: '$', ativo_moeda: true }).success).toBe(false)
  })

  it('listaMoedasSchema valida envelope { itens, total }', () => {
    expect(listaMoedasSchema.safeParse(RESPOSTA_VALIDA).success).toBe(true)
    expect(listaMoedasSchema.safeParse({ itens: 'não-array', total: 1 }).success).toBe(false)
    expect(listaMoedasSchema.safeParse({ itens: [], total: 'não-numero' }).success).toBe(false)
  })
})
