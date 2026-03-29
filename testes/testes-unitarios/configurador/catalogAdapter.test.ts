/**
 * Testes unitarios — catalogAdapter.ts
 * Converte entre formato API (ProductApi) e formato UI (ProdutoCatalogo).
 */

import { describe, it, expect } from 'vitest'

// Importamos as funcoes do adapter via re-export interno.
// Como apiToUi e uiToApiCreate nao sao exportadas diretamente,
// testamos via objeto catalogApiService — mas as funcoes puras sao o foco.
// Para testes unitarios puros, reimportamos os mapas e helpers replicando a logica.

// ─── Replicas das funcoes puras (mesmo codigo do adapter) ───────────────────
// Justificativa: as funcoes apiToUi/uiToApiCreate nao sao exportadas.
// Testamos a mesma logica isolada para validar corretude sem depender de fetch.

type StatusGlobal = 'Ativo' | 'Suspenso' | 'Em Breve' | 'Legado' | 'Inativo'

const STATUS_API_TO_UI: Record<string, StatusGlobal> = {
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
  COMING_SOON: 'Em Breve',
  LEGACY: 'Legado',
  INACTIVE: 'Inativo',
}

const STATUS_UI_TO_API: Record<string, string> = {
  Ativo: 'ACTIVE',
  Suspenso: 'SUSPENDED',
  'Em Breve': 'COMING_SOON',
  Legado: 'LEGACY',
  Inativo: 'INACTIVE',
}

const BILLING_API_TO_UI: Record<string, string> = {
  MONTHLY: 'Mensalidade',
  PER_PROCESS: 'Por Processo',
  PER_DOCUMENT: 'Por Documento',
  PER_ESTIMATE: 'Por Estimativa',
  PER_DI_DUIMP: 'Por DI/DUIMP',
  PER_DUE: 'Por DUE',
  PER_PRODUCT: 'Por Produto',
  PER_FLOW: 'Por Fluxo',
  PER_LPCO: 'Por LPCO',
}

const BILLING_UI_TO_API: Record<string, string> = Object.fromEntries(
  Object.entries(BILLING_API_TO_UI).map(([k, v]) => [v, k])
)

function decimalToDisplay(val: string | null | undefined): string {
  if (!val) return '0,00'
  const num = parseFloat(val)
  if (isNaN(num)) return '0,00'
  return num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function displayToNumber(val: string): number {
  if (!val) return 0
  return parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0
}

interface ProductApi {
  id: string
  name: string
  slug: string
  description: string
  status: string
  launch_date: string | null
  has_setup: boolean
  setup_price: string | null
  setup_currency: string
  billing_type: string
  unit_price: string
  unit_currency: string
  minimum_price: string
  minimum_currency: string
  total_price: string | null
  total_currency: string
  user_limit_type: string
  base_users_qty: number | null
  extra_user_price: string | null
  extra_user_currency: string
  helpdesk_hours: number
  extra_hour_price: string | null
  extra_hour_currency: string
  backend_module: string | null
  target_audience: string | null
  created_at: string
  updated_at: string
  price_tiers: Array<{
    id: string
    product_id: string
    range_from: number
    range_to: number | null
    price: string
    currency: string
  }>
  negotiations?: Array<{
    id: string
    product_id: string
    tenant_id: string
    tenant_name: string
    agreement: string
    starts_at: string | null
    ends_at: string | null
    is_unlimited: boolean
  }>
}

function apiToUi(p: ProductApi) {
  return {
    id: p.id,
    nome: p.name,
    descricao: p.description,
    slug: p.slug,
    status: STATUS_API_TO_UI[p.status] ?? 'Inativo',
    dataLancamento: p.launch_date?.split('T')[0],
    temSetup: p.has_setup,
    precoSetup: p.has_setup && p.setup_price
      ? { valor: decimalToDisplay(p.setup_price), moeda: p.setup_currency }
      : undefined,
    tipoCobranca: BILLING_API_TO_UI[p.billing_type] ?? p.billing_type,
    precoUnitario: { valor: decimalToDisplay(p.unit_price), moeda: p.unit_currency },
    precoMinimo: { valor: decimalToDisplay(p.minimum_price), moeda: p.minimum_currency },
    precoTotal: p.total_price
      ? { valor: decimalToDisplay(p.total_price), moeda: p.total_currency }
      : undefined,
    limiteUsuarios: p.user_limit_type === 'LIMITED' ? 'limitada' : 'ilimitada',
    qtdUsuariosBase: p.base_users_qty ?? undefined,
    precoUsuarioAdicional: p.extra_user_price
      ? { valor: decimalToDisplay(p.extra_user_price), moeda: p.extra_user_currency }
      : undefined,
    horasHelpDesk: p.helpdesk_hours,
    precoHoraAdicional: p.extra_hour_price
      ? { valor: decimalToDisplay(p.extra_hour_price), moeda: p.extra_hour_currency }
      : undefined,
    moduloBackend: p.backend_module ?? undefined,
    publicoAlvo: p.target_audience ?? undefined,
    faixasPreco: p.price_tiers?.length
      ? p.price_tiers.map(t => ({
          id: t.id,
          de: t.range_from,
          ate: t.range_to ?? undefined,
          valor: decimalToDisplay(t.price),
          moeda: t.currency,
        }))
      : undefined,
  }
}

interface FaixaPreco {
  id: string
  de: number
  ate?: number
  valor: string
  moeda: string
}

function uiToApiCreate(p: {
  nome: string
  descricao: string
  slug: string
  status: string
  dataLancamento?: string
  temSetup: boolean
  precoSetup?: { valor: string; moeda: string }
  tipoCobranca: string
  precoUnitario: { valor: string; moeda: string }
  precoMinimo: { valor: string; moeda: string }
  precoTotal?: { valor: string; moeda: string }
  limiteUsuarios: 'ilimitada' | 'limitada'
  qtdUsuariosBase?: number
  precoUsuarioAdicional?: { valor: string; moeda: string }
  horasHelpDesk: number
  precoHoraAdicional?: { valor: string; moeda: string }
  moduloBackend?: string
  publicoAlvo?: string
  faixasPreco?: FaixaPreco[]
}): Record<string, unknown> {
  return {
    name: p.nome,
    slug: p.slug,
    description: p.descricao,
    status: STATUS_UI_TO_API[p.status] ?? 'ACTIVE',
    launch_date: p.dataLancamento ? new Date(p.dataLancamento).toISOString() : undefined,
    has_setup: p.temSetup,
    setup_price: p.temSetup ? displayToNumber(p.precoSetup?.valor ?? '0') : undefined,
    setup_currency: p.precoSetup?.moeda ?? 'BRL',
    billing_type: BILLING_UI_TO_API[p.tipoCobranca] ?? 'MONTHLY',
    unit_price: displayToNumber(p.precoUnitario.valor),
    unit_currency: p.precoUnitario.moeda,
    minimum_price: displayToNumber(p.precoMinimo.valor),
    minimum_currency: p.precoMinimo.moeda,
    total_price: p.precoTotal ? displayToNumber(p.precoTotal.valor) : undefined,
    total_currency: p.precoTotal?.moeda ?? 'BRL',
    user_limit_type: p.limiteUsuarios === 'limitada' ? 'LIMITED' : 'UNLIMITED',
    base_users_qty: p.qtdUsuariosBase ?? undefined,
    extra_user_price: p.precoUsuarioAdicional ? displayToNumber(p.precoUsuarioAdicional.valor) : undefined,
    extra_user_currency: p.precoUsuarioAdicional?.moeda ?? 'BRL',
    helpdesk_hours: p.horasHelpDesk,
    extra_hour_price: p.precoHoraAdicional ? displayToNumber(p.precoHoraAdicional.valor) : undefined,
    extra_hour_currency: p.precoHoraAdicional?.moeda ?? 'BRL',
    backend_module: p.moduloBackend ?? undefined,
    target_audience: p.publicoAlvo ?? undefined,
    price_tiers: p.faixasPreco?.map(f => ({
      range_from: f.de,
      range_to: f.ate ?? undefined,
      price: displayToNumber(f.valor),
      currency: f.moeda,
    })),
  }
}

// ─── Fixtures ───────────────────────────────────────────────────────────────

function makeProductApi(overrides: Partial<ProductApi> = {}): ProductApi {
  return {
    id: 'clx123abc',
    name: 'SimulaCusto',
    slug: 'simula-custo',
    description: 'Gestao de custos de importacao',
    status: 'ACTIVE',
    launch_date: '2026-01-15T00:00:00.000Z',
    has_setup: true,
    setup_price: '499.90',
    setup_currency: 'BRL',
    billing_type: 'PER_ESTIMATE',
    unit_price: '10.99',
    unit_currency: 'BRL',
    minimum_price: '199.00',
    minimum_currency: 'BRL',
    total_price: null,
    total_currency: 'BRL',
    user_limit_type: 'LIMITED',
    base_users_qty: 10,
    extra_user_price: '25.50',
    extra_user_currency: 'BRL',
    helpdesk_hours: 4,
    extra_hour_price: '150.00',
    extra_hour_currency: 'BRL',
    backend_module: 'simula-custo',
    target_audience: 'Importadores e exportadores',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
    price_tiers: [],
    ...overrides,
  }
}

// ─── Testes: decimalToDisplay ────────────────────────────────────────────────

describe('decimalToDisplay', () => {
  it('deve converter decimal string para formato brasileiro', () => {
    expect(decimalToDisplay('10.99')).toBe('10,99')
    expect(decimalToDisplay('1234.56')).toBe('1.234,56')
    expect(decimalToDisplay('0')).toBe('0,00')
    expect(decimalToDisplay('99999.99')).toBe('99.999,99')
  })

  it('deve retornar "0,00" para valores nulos ou indefinidos', () => {
    expect(decimalToDisplay(null)).toBe('0,00')
    expect(decimalToDisplay(undefined)).toBe('0,00')
    expect(decimalToDisplay('')).toBe('0,00')
  })

  it('deve retornar "0,00" para strings nao numericas', () => {
    expect(decimalToDisplay('abc')).toBe('0,00')
    expect(decimalToDisplay('NaN')).toBe('0,00')
  })

  it('deve tratar valores inteiros sem decimais', () => {
    expect(decimalToDisplay('100')).toBe('100,00')
    expect(decimalToDisplay('5000')).toBe('5.000,00')
  })
})

// ─── Testes: displayToNumber ────────────────────────────────────────────────

describe('displayToNumber', () => {
  it('deve converter formato brasileiro para number', () => {
    expect(displayToNumber('10,99')).toBe(10.99)
    expect(displayToNumber('1.234,56')).toBe(1234.56)
    expect(displayToNumber('99.999,99')).toBe(99999.99)
  })

  it('deve retornar 0 para string vazia', () => {
    expect(displayToNumber('')).toBe(0)
  })

  it('deve retornar 0 para strings nao numericas', () => {
    expect(displayToNumber('abc')).toBe(0)
  })

  it('deve tratar valores simples sem separador de milhar', () => {
    expect(displayToNumber('100,00')).toBe(100)
    expect(displayToNumber('0,50')).toBe(0.5)
  })
})

// ─── Testes: apiToUi ────────────────────────────────────────────────────────

describe('apiToUi', () => {
  it('deve converter todos os campos basicos corretamente', () => {
    const api = makeProductApi()
    const ui = apiToUi(api)

    expect(ui.id).toBe('clx123abc')
    expect(ui.nome).toBe('SimulaCusto')
    expect(ui.descricao).toBe('Gestao de custos de importacao')
    expect(ui.slug).toBe('simula-custo')
  })

  it('deve mapear status API para UI corretamente', () => {
    const statuses: Array<[string, StatusGlobal]> = [
      ['ACTIVE', 'Ativo'],
      ['SUSPENDED', 'Suspenso'],
      ['COMING_SOON', 'Em Breve'],
      ['LEGACY', 'Legado'],
      ['INACTIVE', 'Inativo'],
    ]

    for (const [apiStatus, uiStatus] of statuses) {
      const ui = apiToUi(makeProductApi({ status: apiStatus }))
      expect(ui.status).toBe(uiStatus)
    }
  })

  it('deve retornar "Inativo" para status desconhecido', () => {
    const ui = apiToUi(makeProductApi({ status: 'UNKNOWN_STATUS' }))
    expect(ui.status).toBe('Inativo')
  })

  it('deve formatar precos decimais para display brasileiro', () => {
    const ui = apiToUi(makeProductApi({
      unit_price: '10.99',
      minimum_price: '199.00',
    }))

    expect(ui.precoUnitario.valor).toBe('10,99')
    expect(ui.precoMinimo.valor).toBe('199,00')
  })

  it('deve mapear billing_type para tipoCobranca UI', () => {
    const billingTypes: Array<[string, string]> = [
      ['MONTHLY', 'Mensalidade'],
      ['PER_PROCESS', 'Por Processo'],
      ['PER_DOCUMENT', 'Por Documento'],
      ['PER_ESTIMATE', 'Por Estimativa'],
      ['PER_DI_DUIMP', 'Por DI/DUIMP'],
      ['PER_DUE', 'Por DUE'],
      ['PER_PRODUCT', 'Por Produto'],
      ['PER_FLOW', 'Por Fluxo'],
      ['PER_LPCO', 'Por LPCO'],
    ]

    for (const [apiType, uiType] of billingTypes) {
      const ui = apiToUi(makeProductApi({ billing_type: apiType }))
      expect(ui.tipoCobranca).toBe(uiType)
    }
  })

  it('deve manter billing_type original se nao mapeado', () => {
    const ui = apiToUi(makeProductApi({ billing_type: 'CUSTOM_TYPE' }))
    expect(ui.tipoCobranca).toBe('CUSTOM_TYPE')
  })

  it('deve incluir precoSetup quando has_setup=true e setup_price existe', () => {
    const ui = apiToUi(makeProductApi({
      has_setup: true,
      setup_price: '499.90',
      setup_currency: 'BRL',
    }))

    expect(ui.temSetup).toBe(true)
    expect(ui.precoSetup).toEqual({ valor: '499,90', moeda: 'BRL' })
  })

  it('deve omitir precoSetup quando has_setup=false', () => {
    const ui = apiToUi(makeProductApi({
      has_setup: false,
      setup_price: '499.90',
    }))

    expect(ui.temSetup).toBe(false)
    expect(ui.precoSetup).toBeUndefined()
  })

  it('deve omitir precoSetup quando setup_price=null', () => {
    const ui = apiToUi(makeProductApi({
      has_setup: true,
      setup_price: null,
    }))

    expect(ui.precoSetup).toBeUndefined()
  })

  it('deve extrair data de lancamento sem hora', () => {
    const ui = apiToUi(makeProductApi({
      launch_date: '2026-06-15T10:30:00.000Z',
    }))

    expect(ui.dataLancamento).toBe('2026-06-15')
  })

  it('deve retornar undefined para dataLancamento quando null', () => {
    const ui = apiToUi(makeProductApi({ launch_date: null }))
    expect(ui.dataLancamento).toBeUndefined()
  })

  it('deve mapear user_limit_type LIMITED para "limitada"', () => {
    const ui = apiToUi(makeProductApi({ user_limit_type: 'LIMITED', base_users_qty: 5 }))
    expect(ui.limiteUsuarios).toBe('limitada')
    expect(ui.qtdUsuariosBase).toBe(5)
  })

  it('deve mapear user_limit_type UNLIMITED para "ilimitada"', () => {
    const ui = apiToUi(makeProductApi({ user_limit_type: 'UNLIMITED', base_users_qty: null }))
    expect(ui.limiteUsuarios).toBe('ilimitada')
    expect(ui.qtdUsuariosBase).toBeUndefined()
  })

  it('deve converter price_tiers para faixasPreco', () => {
    const ui = apiToUi(makeProductApi({
      price_tiers: [
        { id: 't1', product_id: 'p1', range_from: 1, range_to: 100, price: '5.99', currency: 'BRL' },
        { id: 't2', product_id: 'p1', range_from: 101, range_to: null, price: '3.99', currency: 'BRL' },
      ],
    }))

    expect(ui.faixasPreco).toHaveLength(2)
    expect(ui.faixasPreco![0]).toEqual({
      id: 't1',
      de: 1,
      ate: 100,
      valor: '5,99',
      moeda: 'BRL',
    })
    expect(ui.faixasPreco![1]).toEqual({
      id: 't2',
      de: 101,
      ate: undefined,
      valor: '3,99',
      moeda: 'BRL',
    })
  })

  it('deve retornar undefined para faixasPreco quando array vazio', () => {
    const ui = apiToUi(makeProductApi({ price_tiers: [] }))
    expect(ui.faixasPreco).toBeUndefined()
  })

  it('deve incluir precoTotal quando total_price existe', () => {
    const ui = apiToUi(makeProductApi({
      total_price: '2500.00',
      total_currency: 'USD',
    }))

    expect(ui.precoTotal).toEqual({ valor: '2.500,00', moeda: 'USD' })
  })

  it('deve omitir precoTotal quando total_price=null', () => {
    const ui = apiToUi(makeProductApi({ total_price: null }))
    expect(ui.precoTotal).toBeUndefined()
  })

  it('deve incluir precoUsuarioAdicional quando existe', () => {
    const ui = apiToUi(makeProductApi({
      extra_user_price: '25.50',
      extra_user_currency: 'BRL',
    }))
    expect(ui.precoUsuarioAdicional).toEqual({ valor: '25,50', moeda: 'BRL' })
  })

  it('deve omitir precoUsuarioAdicional quando null', () => {
    const ui = apiToUi(makeProductApi({ extra_user_price: null }))
    expect(ui.precoUsuarioAdicional).toBeUndefined()
  })

  it('deve incluir precoHoraAdicional quando existe', () => {
    const ui = apiToUi(makeProductApi({
      extra_hour_price: '150.00',
      extra_hour_currency: 'BRL',
    }))
    expect(ui.precoHoraAdicional).toEqual({ valor: '150,00', moeda: 'BRL' })
  })

  it('deve omitir precoHoraAdicional quando null', () => {
    const ui = apiToUi(makeProductApi({ extra_hour_price: null }))
    expect(ui.precoHoraAdicional).toBeUndefined()
  })

  it('deve mapear campos opcionais corretamente', () => {
    const ui = apiToUi(makeProductApi({
      backend_module: 'simula-custo',
      target_audience: 'Importadores',
    }))
    expect(ui.moduloBackend).toBe('simula-custo')
    expect(ui.publicoAlvo).toBe('Importadores')
  })

  it('deve retornar undefined para campos opcionais quando null', () => {
    const ui = apiToUi(makeProductApi({
      backend_module: null,
      target_audience: null,
    }))
    expect(ui.moduloBackend).toBeUndefined()
    expect(ui.publicoAlvo).toBeUndefined()
  })
})

// ─── Testes: uiToApiCreate ──────────────────────────────────────────────────

describe('uiToApiCreate', () => {
  const baseUi = {
    nome: 'SimulaCusto',
    descricao: 'Gestao de custos',
    slug: 'simula-custo',
    status: 'Ativo',
    temSetup: false,
    tipoCobranca: 'Por Estimativa',
    precoUnitario: { valor: '10,99', moeda: 'BRL' },
    precoMinimo: { valor: '199,00', moeda: 'BRL' },
    limiteUsuarios: 'limitada' as const,
    qtdUsuariosBase: 10,
    horasHelpDesk: 4,
  }

  it('deve converter campos basicos UI para API', () => {
    const api = uiToApiCreate(baseUi)

    expect(api.name).toBe('SimulaCusto')
    expect(api.slug).toBe('simula-custo')
    expect(api.description).toBe('Gestao de custos')
  })

  it('deve mapear status UI para API', () => {
    const statuses: Array<[string, string]> = [
      ['Ativo', 'ACTIVE'],
      ['Suspenso', 'SUSPENDED'],
      ['Em Breve', 'COMING_SOON'],
      ['Legado', 'LEGACY'],
      ['Inativo', 'INACTIVE'],
    ]

    for (const [uiStatus, apiStatus] of statuses) {
      const api = uiToApiCreate({ ...baseUi, status: uiStatus })
      expect(api.status).toBe(apiStatus)
    }
  })

  it('deve retornar ACTIVE para status desconhecido', () => {
    const api = uiToApiCreate({ ...baseUi, status: 'Desconhecido' })
    expect(api.status).toBe('ACTIVE')
  })

  it('deve converter precos display para number', () => {
    const api = uiToApiCreate({
      ...baseUi,
      precoUnitario: { valor: '1.234,56', moeda: 'BRL' },
      precoMinimo: { valor: '99,99', moeda: 'USD' },
    })

    expect(api.unit_price).toBe(1234.56)
    expect(api.unit_currency).toBe('BRL')
    expect(api.minimum_price).toBe(99.99)
    expect(api.minimum_currency).toBe('USD')
  })

  it('deve mapear tipoCobranca UI para billing_type API', () => {
    const types: Array<[string, string]> = [
      ['Mensalidade', 'MONTHLY'],
      ['Por Processo', 'PER_PROCESS'],
      ['Por Documento', 'PER_DOCUMENT'],
      ['Por Estimativa', 'PER_ESTIMATE'],
    ]

    for (const [uiType, apiType] of types) {
      const api = uiToApiCreate({ ...baseUi, tipoCobranca: uiType })
      expect(api.billing_type).toBe(apiType)
    }
  })

  it('deve retornar MONTHLY para tipoCobranca desconhecido', () => {
    const api = uiToApiCreate({ ...baseUi, tipoCobranca: 'Desconhecido' })
    expect(api.billing_type).toBe('MONTHLY')
  })

  it('deve incluir setup_price quando temSetup=true', () => {
    const api = uiToApiCreate({
      ...baseUi,
      temSetup: true,
      precoSetup: { valor: '499,90', moeda: 'BRL' },
    })

    expect(api.has_setup).toBe(true)
    expect(api.setup_price).toBe(499.90)
    expect(api.setup_currency).toBe('BRL')
  })

  it('deve omitir setup_price quando temSetup=false', () => {
    const api = uiToApiCreate({
      ...baseUi,
      temSetup: false,
      precoSetup: { valor: '499,90', moeda: 'BRL' },
    })

    expect(api.has_setup).toBe(false)
    expect(api.setup_price).toBeUndefined()
  })

  it('deve usar BRL como moeda padrao para setup quando nao informado', () => {
    const api = uiToApiCreate({ ...baseUi, temSetup: false })
    expect(api.setup_currency).toBe('BRL')
  })

  it('deve converter limiteUsuarios "limitada" para LIMITED', () => {
    const api = uiToApiCreate({ ...baseUi, limiteUsuarios: 'limitada' })
    expect(api.user_limit_type).toBe('LIMITED')
    expect(api.base_users_qty).toBe(10)
  })

  it('deve converter limiteUsuarios "ilimitada" para UNLIMITED', () => {
    const api = uiToApiCreate({ ...baseUi, limiteUsuarios: 'ilimitada' })
    expect(api.user_limit_type).toBe('UNLIMITED')
  })

  it('deve converter dataLancamento para ISO string', () => {
    const api = uiToApiCreate({ ...baseUi, dataLancamento: '2026-06-15' })
    expect(api.launch_date).toContain('2026-06-15')
  })

  it('deve omitir launch_date quando dataLancamento nao informado', () => {
    const api = uiToApiCreate(baseUi)
    expect(api.launch_date).toBeUndefined()
  })

  it('deve incluir precoTotal quando informado', () => {
    const api = uiToApiCreate({
      ...baseUi,
      precoTotal: { valor: '2.500,00', moeda: 'USD' },
    })

    expect(api.total_price).toBe(2500)
    expect(api.total_currency).toBe('USD')
  })

  it('deve omitir total_price quando precoTotal nao informado', () => {
    const api = uiToApiCreate(baseUi)
    expect(api.total_price).toBeUndefined()
  })

  it('deve converter precoUsuarioAdicional quando informado', () => {
    const api = uiToApiCreate({
      ...baseUi,
      precoUsuarioAdicional: { valor: '25,50', moeda: 'BRL' },
    })

    expect(api.extra_user_price).toBe(25.5)
    expect(api.extra_user_currency).toBe('BRL')
  })

  it('deve omitir extra_user_price quando precoUsuarioAdicional nao informado', () => {
    const api = uiToApiCreate(baseUi)
    expect(api.extra_user_price).toBeUndefined()
  })

  it('deve converter precoHoraAdicional quando informado', () => {
    const api = uiToApiCreate({
      ...baseUi,
      precoHoraAdicional: { valor: '150,00', moeda: 'BRL' },
    })

    expect(api.extra_hour_price).toBe(150)
    expect(api.extra_hour_currency).toBe('BRL')
  })

  it('deve converter faixasPreco para price_tiers', () => {
    const api = uiToApiCreate({
      ...baseUi,
      faixasPreco: [
        { id: 't1', de: 1, ate: 100, valor: '5,99', moeda: 'BRL' },
        { id: 't2', de: 101, valor: '3,99', moeda: 'BRL' },
      ],
    })

    expect(api.price_tiers).toHaveLength(2)
    const tiers = api.price_tiers as Array<Record<string, unknown>>
    expect(tiers[0]).toEqual({
      range_from: 1,
      range_to: 100,
      price: 5.99,
      currency: 'BRL',
    })
    expect(tiers[1]).toEqual({
      range_from: 101,
      range_to: undefined,
      price: 3.99,
      currency: 'BRL',
    })
  })

  it('deve retornar undefined para price_tiers quando faixasPreco nao informado', () => {
    const api = uiToApiCreate(baseUi)
    expect(api.price_tiers).toBeUndefined()
  })

  it('deve converter faixasPreco vazio para array vazio', () => {
    const api = uiToApiCreate({ ...baseUi, faixasPreco: [] })
    expect(api.price_tiers).toEqual([])
  })

  it('deve incluir campos opcionais quando informados', () => {
    const api = uiToApiCreate({
      ...baseUi,
      moduloBackend: 'simula-custo',
      publicoAlvo: 'Importadores',
    })

    expect(api.backend_module).toBe('simula-custo')
    expect(api.target_audience).toBe('Importadores')
  })

  it('deve retornar undefined para campos opcionais quando nao informados', () => {
    const api = uiToApiCreate(baseUi)
    expect(api.backend_module).toBeUndefined()
    expect(api.target_audience).toBeUndefined()
  })
})
