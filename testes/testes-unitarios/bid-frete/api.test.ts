/**
 * Testes unitarios — BID Frete / api.ts
 * Testa funcoes de chamada da API: endpoints, headers, query params, error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock import.meta.env antes dos imports
vi.stubGlobal('import', { meta: { env: { VITE_INTERNAL_SERVICE_KEY: 'test-key-123' } } })

// Precisamos mockar o fetch global
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Helper para criar Response mock
function mockResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
    headers: new Headers(),
    redirected: false,
    statusText: ok ? 'OK' : 'Error',
    type: 'basic',
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    text: vi.fn(),
    bytes: vi.fn(),
  } as unknown as Response
}

// Import api functions — usamos importacao dinamica para que os mocks se apliquem
// Como import.meta.env precisa existir no contexto do modulo, importamos diretamente
// e testamos o comportamento via fetch mock
let api: typeof import('../../../produto/bid-frete/client/src/shared/api')

beforeEach(async () => {
  vi.clearAllMocks()
  mockFetch.mockReset()
  // Re-import to get fresh module
  api = await import('../../../produto/bid-frete/client/src/shared/api')
})

describe('getDashboardKpis', () => {
  it('deve chamar GET no endpoint correto', async () => {
    const kpisData = { cotacoes_andamento: 5, cotacoes_passadas: 10 }
    mockFetch.mockResolvedValue(mockResponse(kpisData))

    await api.getDashboardKpis()

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/dashboard/kpis')
    expect(options.headers).toBeDefined()
    expect(options.headers['Content-Type']).toBe('application/json')
  })

  it('deve retornar dados do dashboard', async () => {
    const kpisData = { cotacoes_andamento: 5 }
    mockFetch.mockResolvedValue(mockResponse(kpisData))

    const result = await api.getDashboardKpis()
    expect(result).toEqual(kpisData)
  })

  it('deve lancar erro quando resposta nao e ok', async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: { message: 'Unauthorized' } }, false, 401))

    await expect(api.getDashboardKpis()).rejects.toThrow('Unauthorized')
  })
})

describe('getDashboardCalendario', () => {
  it('deve chamar GET no endpoint correto', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))

    await api.getDashboardCalendario()

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/dashboard/calendario')
  })
})

describe('getCotacoes', () => {
  it('deve chamar GET sem query params quando nenhum filtro e passado', async () => {
    mockFetch.mockResolvedValue(mockResponse({ cotacoes: [], pagination: {} }))

    await api.getCotacoes()

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/v1/bid-frete/cotacoes')
  })

  it('deve construir query params corretamente com status', async () => {
    mockFetch.mockResolvedValue(mockResponse({ cotacoes: [], pagination: {} }))

    await api.getCotacoes({ status: 'APROVADA' })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('status=APROVADA')
  })

  it('deve construir query params corretamente com page e limit', async () => {
    mockFetch.mockResolvedValue(mockResponse({ cotacoes: [], pagination: {} }))

    await api.getCotacoes({ page: 2, limit: 25 })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('page=2')
    expect(url).toContain('limit=25')
  })

  it('deve construir query params corretamente com busca', async () => {
    mockFetch.mockResolvedValue(mockResponse({ cotacoes: [], pagination: {} }))

    await api.getCotacoes({ busca: 'BID-2026' })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('busca=BID-2026')
  })

  it('deve combinar multiplos filtros', async () => {
    mockFetch.mockResolvedValue(mockResponse({ cotacoes: [], pagination: {} }))

    await api.getCotacoes({ status: 'RASCUNHO', page: 1, limit: 10, busca: 'test' })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('status=RASCUNHO')
    expect(url).toContain('page=1')
    expect(url).toContain('limit=10')
    expect(url).toContain('busca=test')
  })
})

describe('getCotacao', () => {
  it('deve chamar GET com ID na URL', async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 'cot-1' }))

    await api.getCotacao('cot-1')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/cotacoes/cot-1')
  })
})

describe('criarCotacao', () => {
  it('deve enviar POST com body', async () => {
    const input = { tipo_operacao: 'IMPORTACAO', modal: 'MARITIMO' }
    mockFetch.mockResolvedValue(mockResponse({ id: 'cot-new' }))

    await api.criarCotacao(input as Parameters<typeof api.criarCotacao>[0])

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/cotacoes')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual(input)
  })

  it('deve incluir Content-Type e x-internal-key nos headers', async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 'cot-new' }))

    await api.criarCotacao({} as Parameters<typeof api.criarCotacao>[0])

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.headers['x-internal-key']).toBeDefined()
  })
})

describe('atualizarCotacao', () => {
  it('deve enviar PATCH com ID na URL e body', async () => {
    const input = { status: 'RASCUNHO' as const }
    mockFetch.mockResolvedValue(mockResponse({ id: 'cot-1' }))

    await api.atualizarCotacao('cot-1', input as Parameters<typeof api.atualizarCotacao>[1])

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/cotacoes/cot-1')
    expect(options.method).toBe('PATCH')
  })
})

describe('mudarStatusCotacao', () => {
  it('deve enviar PATCH para endpoint de status', async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 'cot-1' }))

    await api.mudarStatusCotacao('cot-1', 'CANCELADA')

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/cotacoes/cot-1/status')
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body)).toEqual({ status: 'CANCELADA' })
  })
})

describe('excluirCotacao', () => {
  it('deve enviar DELETE com ID', async () => {
    mockFetch.mockResolvedValue(mockResponse(null, true, 204))

    await api.excluirCotacao('cot-1')

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/cotacoes/cot-1')
    expect(options.method).toBe('DELETE')
  })

  it('deve lancar erro quando DELETE falha', async () => {
    mockFetch.mockResolvedValue(mockResponse(null, false, 500))

    await expect(api.excluirCotacao('cot-1')).rejects.toThrow('Erro 500 ao excluir cotação')
  })
})

describe('dispararBids', () => {
  it('deve enviar POST com cotacao_id, fornecedor_ids e canais', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))

    await api.dispararBids('cot-1', ['f1', 'f2'], ['EMAIL'])

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/bids/disparar')
    expect(options.method).toBe('POST')
    const body = JSON.parse(options.body)
    expect(body.cotacao_id).toBe('cot-1')
    expect(body.fornecedor_ids).toEqual(['f1', 'f2'])
    expect(body.canais).toEqual(['EMAIL'])
  })
})

describe('getBidsPorCotacao', () => {
  it('deve chamar GET com cotacao ID na URL', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))

    await api.getBidsPorCotacao('cot-1')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/bids/cotacao/cot-1')
  })
})

describe('getRanking', () => {
  it('deve chamar GET no endpoint de ranking', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))

    await api.getRanking('cot-1')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/comparativo/cot-1/ranking')
  })
})

describe('aprovarResposta', () => {
  it('deve enviar POST com response_id', async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 'cot-1' }))

    await api.aprovarResposta('cot-1', 'resp-1')

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/comparativo/cot-1/aprovar')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ response_id: 'resp-1' })
  })
})

describe('reprovarTodas', () => {
  it('deve enviar POST com motivo', async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 'cot-1' }))

    await api.reprovarTodas('cot-1', 'Precos acima do budget')

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/comparativo/cot-1/reprovar')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ motivo: 'Precos acima do budget' })
  })
})

describe('getFornecedores', () => {
  it('deve construir query params corretamente', async () => {
    mockFetch.mockResolvedValue(mockResponse({ fornecedores: [], pagination: {} }))

    await api.getFornecedores({ tipo: 'ARMADOR', status: 'ATIVO', busca: 'MSC', page: 1, limit: 20 })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('tipo=ARMADOR')
    expect(url).toContain('status=ATIVO')
    expect(url).toContain('busca=MSC')
    expect(url).toContain('page=1')
    expect(url).toContain('limit=20')
  })

  it('deve chamar sem query params quando nenhum filtro e passado', async () => {
    mockFetch.mockResolvedValue(mockResponse({ fornecedores: [], pagination: {} }))

    await api.getFornecedores()

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/v1/bid-frete/fornecedores')
  })
})

describe('getTabelaPrecos', () => {
  it('deve chamar GET com fornecedor ID na URL', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))

    await api.getTabelaPrecos('f1')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/fornecedores/f1/tabela')
  })
})

describe('getAvaliacoes', () => {
  it('deve chamar GET com fornecedor ID na URL', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))

    await api.getAvaliacoes('f1')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/avaliacoes/fornecedor/f1')
  })
})

describe('Portal do Fornecedor', () => {
  it('getPortalDashboard deve chamar endpoint correto', async () => {
    mockFetch.mockResolvedValue(mockResponse({}))
    await api.getPortalDashboard()
    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/portal/dashboard')
  })

  it('getPortalPendentes deve chamar endpoint correto', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))
    await api.getPortalPendentes()
    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/portal/pendentes')
  })

  it('responderBid deve enviar POST com dados de resposta', async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 'resp-1' }))

    await api.responderBid('br-1', { valor_frete: 2000, valor_total: 2500 } as Parameters<typeof api.responderBid>[1])

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/portal/responder/br-1')
    expect(options.method).toBe('POST')
  })

  it('getPortalRespostas deve chamar endpoint correto', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))
    await api.getPortalRespostas()
    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/portal/respostas')
  })

  it('getPortalDesempenho deve chamar endpoint correto', async () => {
    mockFetch.mockResolvedValue(mockResponse({}))
    await api.getPortalDesempenho()
    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/portal/desempenho')
  })
})

describe('Portal Publico (sem login)', () => {
  it('getPublicCotacao deve chamar endpoint com token e sem x-internal-key', async () => {
    mockFetch.mockResolvedValue(mockResponse({}))

    await api.getPublicCotacao('abc-token-123')

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/portal/public/abc-token-123')
    // Portal publico nao envia headers de autenticacao
    expect(options).toBeUndefined()
  })

  it('responderPublico deve enviar POST com dados e sem x-internal-key', async () => {
    mockFetch.mockResolvedValue(mockResponse({ id: 'resp-1' }))

    await api.responderPublico('abc-token', { valor_total: 3000 } as Parameters<typeof api.responderPublico>[1])

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/portal/public/abc-token/responder')
    expect(options.method).toBe('POST')
    // Endpoint publico usa apenas Content-Type, sem x-internal-key
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.headers['x-internal-key']).toBeUndefined()
  })
})

describe('Master Data', () => {
  it('getPortos deve chamar endpoint sem filtro', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))

    await api.getPortos()

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/master-data/portos')
  })

  it('getPortos deve incluir filtro de tipo quando informado', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))

    await api.getPortos('maritimo')

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/master-data/portos?tipo=maritimo')
  })

  it('getMoedas deve chamar endpoint correto', async () => {
    mockFetch.mockResolvedValue(mockResponse([]))

    await api.getMoedas()

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/v1/bid-frete/master-data/moedas')
  })
})

describe('handleResponse — tratamento de erro', () => {
  it('deve extrair mensagem de erro do corpo da resposta', async () => {
    mockFetch.mockResolvedValue(mockResponse(
      { error: { message: 'Cotacao nao encontrada' } },
      false,
      404,
    ))

    await expect(api.getCotacao('invalid-id')).rejects.toThrow('Cotacao nao encontrada')
  })

  it('deve usar status code como fallback quando corpo nao tem mensagem', async () => {
    const resp = {
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      headers: new Headers(),
    } as unknown as Response
    mockFetch.mockResolvedValue(resp)

    await expect(api.getCotacao('id')).rejects.toThrow('Erro 500')
  })
})
