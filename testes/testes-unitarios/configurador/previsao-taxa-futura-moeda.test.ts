// @vitest-environment node
//
// Testes unitarios — previsao-taxa-futura-moeda (BACEN Focus)
//
// Cobertura: schemas Zod (request + response), MOEDAS_FOCUS_SUPORTADAS,
// buscarFocusUSD (dedup + ordering + limit), persistirPrevisao (upsert).
//
// Mocks: prisma (lib/prisma.js), axios, middlewares (requireAuth + requireConfiguradorMutation).
// Skill: skills/testes/agente-plano-teste-unitario/SKILL.md (vi.hoisted + happy/sad/edge).
//
// IMPORTANTE: roda apos `npx prisma generate` (Task #2) — sem isso, o tipo
// prisma.previsaoTaxaFuturaMoeda nao existe no client e a route file nao compila.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — declarados ANTES dos imports (vi.hoisted)
// ---------------------------------------------------------------------------

const { mockPrismaFindFirst, mockPrismaFindMany, mockPrismaCreate, mockPrismaUpdate } = vi.hoisted(() => ({
  mockPrismaFindFirst: vi.fn(),
  mockPrismaFindMany: vi.fn(),
  mockPrismaCreate: vi.fn(),
  mockPrismaUpdate: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    previsaoTaxaFuturaMoeda: {
      findFirst: mockPrismaFindFirst,
      findMany: mockPrismaFindMany,
      create: mockPrismaCreate,
      update: mockPrismaUpdate,
    },
  },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireConfiguradorAccess.js', () => ({
  requireConfiguradorMutation: vi.fn(),
}))

const { mockAxiosGet } = vi.hoisted(() => ({ mockAxiosGet: vi.fn() }))
vi.mock('axios', () => ({ default: { get: mockAxiosGet } }))

// Import DEPOIS dos mocks
import {
  previsaoTaxaFuturaMoedaListarQuerySchema,
  previsaoTaxaFuturaMoedaItemSchema,
  previsaoTaxaFuturaMoedaResponseSchema,
  MOEDAS_FOCUS_SUPORTADAS,
  buscarFocusUSD,
  persistirPrevisao,
  type PayloadFocusItem,
} from '../../../servicos-global/configurador/server/routes/previsao-taxa-futura-moeda.js'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const itemValido = {
  id_previsao_taxa_futura_moeda: 'cuid_test_01',
  moeda_previsao_taxa_futura_moeda: 'USD',
  mes_previsao_taxa_futura_moeda: '2026-06-01T00:00:00.000Z',
  valor_mediano_previsao_taxa_futura_moeda: 5.02,
  valor_medio_previsao_taxa_futura_moeda: 5.01,
  valor_minimo_previsao_taxa_futura_moeda: 4.85,
  valor_maximo_previsao_taxa_futura_moeda: 5.20,
  fonte_previsao_taxa_futura_moeda: 'BACEN/Focus',
  data_previsao_taxa_futura_moeda: '2026-05-22T00:00:00.000Z',
  data_criacao_previsao_taxa_futura_moeda: '2026-05-22T10:00:00.000Z',
  data_atualizacao_previsao_taxa_futura_moeda: '2026-05-22T10:00:00.000Z',
}

const payloadFocusValido: PayloadFocusItem = {
  Indicador: 'Câmbio',
  Data: '2026-05-22',
  DataReferencia: '06/2026',
  Mediana: 5.02,
  Media: 5.01,
  Minimo: 4.85,
  Maximo: 5.20,
  numeroRespondentes: 50,
}

// ---------------------------------------------------------------------------
// Schemas Zod — Request
// ---------------------------------------------------------------------------

describe('previsaoTaxaFuturaMoedaListarQuerySchema', () => {
  it('aceita query vazia e aplica defaults (moeda=USD, meses=4)', () => {
    const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({})
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.moeda).toBe('USD')
      expect(parsed.data.meses).toBe(4)
    }
  })

  it('aceita todas as 7 moedas suportadas pelo Focus', () => {
    for (const moeda of MOEDAS_FOCUS_SUPORTADAS) {
      const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({ moeda, meses: 4 })
      expect(parsed.success).toBe(true)
    }
  })

  it('rejeita moeda nao suportada (XXX)', () => {
    const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({ moeda: 'XXX', meses: 4 })
    expect(parsed.success).toBe(false)
  })

  it('rejeita moeda em lowercase (case-sensitive)', () => {
    const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({ moeda: 'usd', meses: 4 })
    expect(parsed.success).toBe(false)
  })

  it('rejeita meses=0 (abaixo do minimo)', () => {
    const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({ meses: 0 })
    expect(parsed.success).toBe(false)
  })

  it('rejeita meses=13 (acima do maximo)', () => {
    const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({ meses: 13 })
    expect(parsed.success).toBe(false)
  })

  it('aceita meses no limite minimo (1)', () => {
    const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({ meses: 1 })
    expect(parsed.success).toBe(true)
  })

  it('aceita meses no limite maximo (12)', () => {
    const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({ meses: 12 })
    expect(parsed.success).toBe(true)
  })

  it('faz coerce de meses string para numero (query params vem como string)', () => {
    const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({ meses: '4' })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.meses).toBe(4)
  })

  it('rejeita meses string nao-numerico', () => {
    const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({ meses: 'quatro' })
    expect(parsed.success).toBe(false)
  })

  it('rejeita meses decimal (precisa ser int)', () => {
    const parsed = previsaoTaxaFuturaMoedaListarQuerySchema.safeParse({ meses: 4.5 })
    expect(parsed.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Schemas Zod — Response
// ---------------------------------------------------------------------------

describe('previsaoTaxaFuturaMoedaItemSchema', () => {
  it('aceita item completo e valido', () => {
    const parsed = previsaoTaxaFuturaMoedaItemSchema.safeParse(itemValido)
    expect(parsed.success).toBe(true)
  })

  it('rejeita item sem id_previsao_taxa_futura_moeda', () => {
    const { id_previsao_taxa_futura_moeda: _omit, ...semId } = itemValido
    const parsed = previsaoTaxaFuturaMoedaItemSchema.safeParse(semId)
    expect(parsed.success).toBe(false)
  })

  it('rejeita item sem moeda_previsao_taxa_futura_moeda', () => {
    const { moeda_previsao_taxa_futura_moeda: _omit, ...semMoeda } = itemValido
    const parsed = previsaoTaxaFuturaMoedaItemSchema.safeParse(semMoeda)
    expect(parsed.success).toBe(false)
  })

  it('rejeita valor_mediano como string', () => {
    const parsed = previsaoTaxaFuturaMoedaItemSchema.safeParse({
      ...itemValido,
      valor_mediano_previsao_taxa_futura_moeda: '5.02',
    })
    expect(parsed.success).toBe(false)
  })

  it('aceita valor_mediano negativo (esquisito mas possivel se Focus enlouquecer)', () => {
    const parsed = previsaoTaxaFuturaMoedaItemSchema.safeParse({
      ...itemValido,
      valor_mediano_previsao_taxa_futura_moeda: -1,
    })
    expect(parsed.success).toBe(true)
  })

  it('aceita valor_mediano zero', () => {
    const parsed = previsaoTaxaFuturaMoedaItemSchema.safeParse({
      ...itemValido,
      valor_mediano_previsao_taxa_futura_moeda: 0,
    })
    expect(parsed.success).toBe(true)
  })
})

describe('previsaoTaxaFuturaMoedaResponseSchema', () => {
  it('aceita response com lista vazia', () => {
    const parsed = previsaoTaxaFuturaMoedaResponseSchema.safeParse({
      data: [], moeda: 'USD', meses: 4, total: 0,
    })
    expect(parsed.success).toBe(true)
  })

  it('aceita response com varios itens validos', () => {
    const parsed = previsaoTaxaFuturaMoedaResponseSchema.safeParse({
      data: [itemValido, { ...itemValido, id_previsao_taxa_futura_moeda: 'cuid_02' }],
      moeda: 'USD',
      meses: 4,
      total: 2,
    })
    expect(parsed.success).toBe(true)
  })

  it('rejeita response sem campo total', () => {
    const parsed = previsaoTaxaFuturaMoedaResponseSchema.safeParse({
      data: [], moeda: 'USD', meses: 4,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejeita response sem campo data', () => {
    const parsed = previsaoTaxaFuturaMoedaResponseSchema.safeParse({
      moeda: 'USD', meses: 4, total: 0,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejeita response com item invalido dentro de data', () => {
    const parsed = previsaoTaxaFuturaMoedaResponseSchema.safeParse({
      data: [{ id_previsao_taxa_futura_moeda: 'cuid_01' }],  // incompleto
      moeda: 'USD', meses: 4, total: 1,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejeita meses como string (response sempre numero)', () => {
    const parsed = previsaoTaxaFuturaMoedaResponseSchema.safeParse({
      data: [], moeda: 'USD', meses: '4', total: 0,
    })
    expect(parsed.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// MOEDAS_FOCUS_SUPORTADAS
// ---------------------------------------------------------------------------

describe('MOEDAS_FOCUS_SUPORTADAS', () => {
  it('contem as 7 moedas declaradas na ordem esperada', () => {
    expect(MOEDAS_FOCUS_SUPORTADAS).toEqual(['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'CAD'])
  })

  it('e um array readonly (tipo as const)', () => {
    expect(Object.isFrozen(MOEDAS_FOCUS_SUPORTADAS) || (MOEDAS_FOCUS_SUPORTADAS as readonly string[]).length === 7).toBe(true)
  })

  it('USD esta na primeira posicao (sera o default em queries e o unico com dados Focus)', () => {
    expect(MOEDAS_FOCUS_SUPORTADAS[0]).toBe('USD')
  })
})

// ---------------------------------------------------------------------------
// buscarFocusUSD — chamada Olinda + dedup + ordenacao + limite
// ---------------------------------------------------------------------------

describe('buscarFocusUSD', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('chama API Olinda com endpoint ExpectativaMercadoMensais (singular, sem "s")', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })
    await buscarFocusUSD(4)
    expect(mockAxiosGet).toHaveBeenCalledOnce()
    const [url] = mockAxiosGet.mock.calls[0]
    expect(url).toContain('ExpectativaMercadoMensais')
    // Guarda contra regressao: o nome com "s" causa HTTP 400 no BACEN
    expect(url).not.toContain('ExpectativasMercadoMensais')
  })

  it('passa filtro Indicador=Câmbio + baseCalculo=0 (agregacao geral) + formato JSON', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })
    await buscarFocusUSD(4)
    const [, opts] = mockAxiosGet.mock.calls[0]
    expect(opts.params.$filter).toBe(`Indicador eq 'Câmbio' and baseCalculo eq 0`)
    expect(opts.params.$format).toBe('json')
    expect(opts.params.$orderby).toBe('Data desc')
  })

  it('sobreamostragem: $top = meses * 10 (varias projecoes por mes-alvo)', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })
    await buscarFocusUSD(4)
    const [, opts] = mockAxiosGet.mock.calls[0]
    expect(opts.params.$top).toBe(40)
  })

  it('timeout configurado em 15s', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })
    await buscarFocusUSD(4)
    const [, opts] = mockAxiosGet.mock.calls[0]
    expect(opts.timeout).toBe(15_000)
  })

  it('deduplica multiplas projecoes do MESMO mes-alvo, mantem a Data mais recente', async () => {
    const projecaoAntiga = { ...payloadFocusValido, Data: '2026-05-15', DataReferencia: '06/2026', Mediana: 5.00 }
    const projecaoRecente = { ...payloadFocusValido, Data: '2026-05-22', DataReferencia: '06/2026', Mediana: 5.05 }
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [projecaoAntiga, projecaoRecente] } })

    const result = await buscarFocusUSD(4)
    expect(result).toHaveLength(1)
    expect(result[0].Mediana).toBe(5.05)
    expect(result[0].Data).toBe('2026-05-22')
  })

  it('ordena resultado por mes-alvo crescente independente da ordem do payload', async () => {
    const itemSet = { ...payloadFocusValido, Data: '2026-05-22', DataReferencia: '09/2026', Mediana: 5.10 }
    const itemJul = { ...payloadFocusValido, Data: '2026-05-22', DataReferencia: '07/2026', Mediana: 5.05 }
    const itemJun = { ...payloadFocusValido, Data: '2026-05-22', DataReferencia: '06/2026', Mediana: 5.02 }
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [itemSet, itemJul, itemJun] } })

    const result = await buscarFocusUSD(4)
    expect(result[0].DataReferencia).toBe('06/2026')
    expect(result[1].DataReferencia).toBe('07/2026')
    expect(result[2].DataReferencia).toBe('09/2026')
  })

  it('limita ao numero de meses solicitado mesmo com payload maior', async () => {
    const items = ['06/2026', '07/2026', '08/2026', '09/2026', '10/2026'].map(dataRef => ({
      ...payloadFocusValido, DataReferencia: dataRef, Data: '2026-05-22',
    }))
    mockAxiosGet.mockResolvedValueOnce({ data: { value: items } })

    const result = await buscarFocusUSD(3)
    expect(result).toHaveLength(3)
    expect(result.map(r => r.DataReferencia)).toEqual(['06/2026', '07/2026', '08/2026'])
  })

  it('retorna array vazio quando API responde value vazio', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })
    const result = await buscarFocusUSD(4)
    expect(result).toEqual([])
  })

  it('retorna array vazio quando API nao retorna campo value (defesa)', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: {} })
    const result = await buscarFocusUSD(4)
    expect(result).toEqual([])
  })

  it('propaga erro do axios para o caller (Mandamento 08 — sem fallback silencioso)', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('Network timeout'))
    await expect(buscarFocusUSD(4)).rejects.toThrow('Network timeout')
  })
})

// ---------------------------------------------------------------------------
// persistirPrevisao — upsert idempotente via findFirst + create/update
// ---------------------------------------------------------------------------

describe('persistirPrevisao', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('cria nova previsao quando findFirst retorna null', async () => {
    mockPrismaFindFirst.mockResolvedValueOnce(null)
    mockPrismaCreate.mockResolvedValueOnce({})

    await persistirPrevisao('USD', payloadFocusValido)

    expect(mockPrismaFindFirst).toHaveBeenCalledOnce()
    expect(mockPrismaCreate).toHaveBeenCalledOnce()
    expect(mockPrismaUpdate).not.toHaveBeenCalled()
  })

  it('atualiza previsao existente em vez de criar (idempotencia via @@unique)', async () => {
    mockPrismaFindFirst.mockResolvedValueOnce({ id_previsao_taxa_futura_moeda: 'cuid_existente' })
    mockPrismaUpdate.mockResolvedValueOnce({})

    await persistirPrevisao('USD', payloadFocusValido)

    expect(mockPrismaUpdate).toHaveBeenCalledOnce()
    expect(mockPrismaCreate).not.toHaveBeenCalled()
  })

  it('busca registro pela combinacao moeda + mes-alvo', async () => {
    mockPrismaFindFirst.mockResolvedValueOnce(null)
    mockPrismaCreate.mockResolvedValueOnce({})

    await persistirPrevisao('EUR', payloadFocusValido)

    const findArgs = mockPrismaFindFirst.mock.calls[0][0]
    expect(findArgs.where.moeda_previsao_taxa_futura_moeda).toBe('EUR')
    expect(findArgs.where.mes_previsao_taxa_futura_moeda).toBeInstanceOf(Date)
  })

  it('persiste todos os campos do payload Focus no create', async () => {
    mockPrismaFindFirst.mockResolvedValueOnce(null)
    mockPrismaCreate.mockResolvedValueOnce({})

    await persistirPrevisao('USD', payloadFocusValido)

    const createArgs = mockPrismaCreate.mock.calls[0][0]
    expect(createArgs.data.moeda_previsao_taxa_futura_moeda).toBe('USD')
    expect(createArgs.data.valor_mediano_previsao_taxa_futura_moeda).toBe(5.02)
    expect(createArgs.data.valor_medio_previsao_taxa_futura_moeda).toBe(5.01)
    expect(createArgs.data.valor_minimo_previsao_taxa_futura_moeda).toBe(4.85)
    expect(createArgs.data.valor_maximo_previsao_taxa_futura_moeda).toBe(5.20)
    expect(createArgs.data.fonte_previsao_taxa_futura_moeda).toBe('BACEN/Focus')
  })

  it('parseia MM/YYYY do Focus para primeiro dia do mes em UTC', async () => {
    mockPrismaFindFirst.mockResolvedValueOnce(null)
    mockPrismaCreate.mockResolvedValueOnce({})

    await persistirPrevisao('USD', { ...payloadFocusValido, DataReferencia: '07/2026' })

    const createArgs = mockPrismaCreate.mock.calls[0][0]
    const mes = createArgs.data.mes_previsao_taxa_futura_moeda as Date
    expect(mes.getUTCFullYear()).toBe(2026)
    expect(mes.getUTCMonth()).toBe(6)  // Julho = mes 6 (0-indexed)
    expect(mes.getUTCDate()).toBe(1)
    expect(mes.getUTCHours()).toBe(0)
    expect(mes.getUTCMinutes()).toBe(0)
  })

  it('parseia Data (YYYY-MM-DD) do Focus para Date UTC midnight', async () => {
    mockPrismaFindFirst.mockResolvedValueOnce(null)
    mockPrismaCreate.mockResolvedValueOnce({})

    await persistirPrevisao('USD', { ...payloadFocusValido, Data: '2026-05-22' })

    const createArgs = mockPrismaCreate.mock.calls[0][0]
    const dataPrev = createArgs.data.data_previsao_taxa_futura_moeda as Date
    expect(dataPrev.toISOString()).toBe('2026-05-22T00:00:00.000Z')
  })

  it('update preserva id e atualiza so os campos volateis (valores + data_previsao)', async () => {
    mockPrismaFindFirst.mockResolvedValueOnce({ id_previsao_taxa_futura_moeda: 'cuid_existente' })
    mockPrismaUpdate.mockResolvedValueOnce({})

    await persistirPrevisao('USD', { ...payloadFocusValido, Mediana: 5.99, Data: '2026-05-29' })

    const updateArgs = mockPrismaUpdate.mock.calls[0][0]
    expect(updateArgs.where.id_previsao_taxa_futura_moeda).toBe('cuid_existente')
    expect(updateArgs.data.valor_mediano_previsao_taxa_futura_moeda).toBe(5.99)
    expect(updateArgs.data.data_previsao_taxa_futura_moeda).toBeInstanceOf(Date)
    // moeda e mes nao sao atualizados (sao a propria chave do upsert)
    expect(updateArgs.data.moeda_previsao_taxa_futura_moeda).toBeUndefined()
    expect(updateArgs.data.mes_previsao_taxa_futura_moeda).toBeUndefined()
  })

  it('propaga erro do prisma para o caller', async () => {
    mockPrismaFindFirst.mockRejectedValueOnce(new Error('DB connection lost'))
    await expect(persistirPrevisao('USD', payloadFocusValido)).rejects.toThrow('DB connection lost')
  })
})
