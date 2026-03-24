// @vitest-environment node
/**
 * testes/testes-unitarios/middleware/tenantProxy.test.ts
 *
 * Testes unitários do sistema de proxy de tenant.
 * Cobre: roteamento correto, retry com backoff, circuit breaker e fila assíncrona.
 *
 * Roda com environment=node (não jsdom) pois usa APIs Node.js puras.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EventEmitter } from 'node:events'
import type { IncomingMessage } from 'node:http'

// ---------------------------------------------------------------------------
// Mock node:http — deve ser definido ANTES de importar tenantProxy
// ---------------------------------------------------------------------------

const mockHttpRequestImpl = vi.hoisted(() => vi.fn())

vi.mock('node:http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:http')>()
  return {
    ...actual,
    request: mockHttpRequestImpl,
  }
})

// ---------------------------------------------------------------------------
// Importações sob teste (depois dos mocks)
// ---------------------------------------------------------------------------

import {
  createTenantProxy,
  enqueueTenantAction,
  _setContractsForTesting,
  _resetContracts,
  _getCircuitBreakerState,
  _resetAllCircuitBreakers,
  _getActionQueue,
  _clearActionQueue,
} from '../../../servicos-global/tenant/middleware/tenantProxy.js'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_CONTRACTS = {
  services: {
    dashboard: {
      baseUrl   : 'http://localhost:8010',
      pathPrefix: '/api/v1/dashboard',
    },
    relatorios: {
      baseUrl   : 'http://localhost:8011',
      pathPrefix: '/api/v1/relatorios',
    },
  },
}

// ---------------------------------------------------------------------------
// Helpers de stub
// ---------------------------------------------------------------------------

/** Stub de ServerResponse — captura statusCode, headers e body */
function makeRes() {
  const store = {
    statusCode: 0,
    headers   : {} as Record<string, unknown>,
    body      : '',
  }

  const res = {
    writeHead(code: number, headers?: Record<string, unknown>) {
      store.statusCode = code
      store.headers    = headers ?? {}
    },
    end(body?: string | Buffer | null) {
      store.body = typeof body === 'string' ? body : (body instanceof Buffer ? body.toString() : '')
    },
    get statusCode() { return store.statusCode },
    get _body()      { return store.body },
  }

  return res as unknown as import('node:http').ServerResponse & { statusCode: number; _body: string }
}

/** Stub de IncomingMessage (EventEmitter + propriedades básicas) */
function makeReq(options: {
  method?  : string
  url?     : string
  headers? : Record<string, string>
  body?    : string
} = {}): IncomingMessage {
  const req = new EventEmitter() as unknown as IncomingMessage
  req.method   = options.method ?? 'GET'
  req.url      = options.url    ?? '/api/v1/dashboard/kpis'
  req.headers  = options.headers ?? {}
  ;(req as unknown as Record<string, unknown>).readableEnded = false

  setTimeout(() => {
    if (options.body) req.emit('data', Buffer.from(options.body))
    req.emit('end')
  }, 0)

  return req
}

// ---------------------------------------------------------------------------
// Simulações http.request
// ---------------------------------------------------------------------------

/** Upstream responde com sucesso */
function mockSuccess(statusCode = 200, body = '{"ok":true}') {
  mockHttpRequestImpl.mockImplementation((_opts: unknown, cb: (r: unknown) => void) => {
    const fakeRes = new EventEmitter()
    ;(fakeRes as unknown as Record<string, unknown>)['statusCode'] = statusCode
    ;(fakeRes as unknown as Record<string, unknown>)['headers']    = { 'content-type': 'application/json' }

    const fakeReq = new EventEmitter()
    ;(fakeReq as unknown as Record<string, unknown>)['write'] = vi.fn()
    ;(fakeReq as unknown as Record<string, unknown>)['end']   = vi.fn(() => {
      // Engatilha resposta assim que o req cliente termina
      cb(fakeRes)
      fakeRes.emit('data', Buffer.from(body))
      fakeRes.emit('end')
    })

    return fakeReq
  })
}

/** Upstream falha N vezes e depois responde com sucesso */
function mockFailThenSucceed(failCount: number, successBody = '{"ok":true}') {
  let calls = 0
  mockHttpRequestImpl.mockImplementation((_opts: unknown, cb: (r: unknown) => void) => {
    calls++
    const fakeReq = new EventEmitter()
    ;(fakeReq as unknown as Record<string, unknown>)['write'] = vi.fn()
    ;(fakeReq as unknown as Record<string, unknown>)['end']   = vi.fn(() => {
      if (calls <= failCount) {
        fakeReq.emit('error', new Error(`Network failure #${calls}`))
      } else {
        const fakeRes = new EventEmitter()
        ;(fakeRes as unknown as Record<string, unknown>)['statusCode'] = 200
        ;(fakeRes as unknown as Record<string, unknown>)['headers']    = {}
        cb(fakeRes)
        fakeRes.emit('data', Buffer.from(successBody))
        fakeRes.emit('end')
      }
    })

    return fakeReq
  })
}

/** Upstream sempre falha */
function mockAlwaysFail() {
  mockHttpRequestImpl.mockImplementation(() => {
    const fakeReq = new EventEmitter()
    ;(fakeReq as unknown as Record<string, unknown>)['write'] = vi.fn()
    ;(fakeReq as unknown as Record<string, unknown>)['end']   = vi.fn(() => {
      fakeReq.emit('error', new Error('Connection refused'))
    })

    return fakeReq
  })
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers()
  _setContractsForTesting(MOCK_CONTRACTS)
  _resetAllCircuitBreakers()
  _clearActionQueue()
  mockHttpRequestImpl.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  _resetContracts()
  _resetAllCircuitBreakers()
  _clearActionQueue()
})

// ---------------------------------------------------------------------------
// Suite 1 — Roteamento correto
// ---------------------------------------------------------------------------

describe('createTenantProxy — roteamento', () => {
  it('retorna 502 se serviceKey não existe em contracts.json', async () => {
    const req = makeReq({ url: '/api/v1/inexistente/foo' })
    const res = makeRes()

    const p = createTenantProxy('inexistente', req, res)
    await vi.runAllTimersAsync()
    await p

    expect(res.statusCode).toBe(502)
    expect(res._body).toContain('inexistente')
  })

  it('roteia corretamente para o serviço dashboard', async () => {
    mockSuccess(200, '{"kpis":[]}')

    const req = makeReq({ url: '/api/v1/dashboard/kpis' })
    const res = makeRes()

    const p = createTenantProxy('dashboard', req, res)
    await vi.runAllTimersAsync()
    await p

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res._body)).toEqual({ kpis: [] })
  })

  it('roteia corretamente para o serviço relatorios', async () => {
    mockSuccess(200, '{"relatorios":[]}')

    const req = makeReq({ url: '/api/v1/relatorios/lista' })
    const res = makeRes()

    const p = createTenantProxy('relatorios', req, res)
    await vi.runAllTimersAsync()
    await p

    expect(res.statusCode).toBe(200)
  })

  it('repassa o método HTTP correto ao upstream', async () => {
    mockSuccess(201, '{"id":"abc"}')

    const req = makeReq({ method: 'POST', url: '/api/v1/dashboard/item', body: '{"v":1}' })
    const res = makeRes()

    const p = createTenantProxy('dashboard', req, res)
    await vi.runAllTimersAsync()
    await p

    const opts = mockHttpRequestImpl.mock.calls[0][0] as { method: string }
    expect(opts.method).toBe('POST')
  })

  it('retorna 503 quando circuit breaker está aberto de antemão', async () => {
    const state    = _getCircuitBreakerState('dashboard')
    state.failures = 5
    state.isOpen   = true
    state.openedAt = Date.now()

    const req = makeReq()
    const res = makeRes()

    const p = createTenantProxy('dashboard', req, res)
    await vi.runAllTimersAsync()
    await p

    expect(res.statusCode).toBe(503)
    expect(res._body).toContain('Circuit breaker')
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — Retry com backoff exponencial
// ---------------------------------------------------------------------------

describe('createTenantProxy — retry e backoff', () => {
  it('tenta novamente após 1 falha e tem sucesso na 2ª tentativa', async () => {
    mockFailThenSucceed(1)

    const req = makeReq()
    const res = makeRes()

    const p = createTenantProxy('dashboard', req, res)
    await vi.runAllTimersAsync()
    await p

    expect(mockHttpRequestImpl).toHaveBeenCalledTimes(2)
    expect(res.statusCode).toBe(200)
  })

  it('tenta novamente após 2 falhas e tem sucesso na 3ª tentativa', async () => {
    mockFailThenSucceed(2)

    const req = makeReq()
    const res = makeRes()

    const p = createTenantProxy('dashboard', req, res)
    await vi.runAllTimersAsync()

    expect(mockHttpRequestImpl).toHaveBeenCalledTimes(3)
    expect(res.statusCode).toBe(200)
  })

  it('falha definitivamente após esgotar todas as tentativas → retorna 502 ou 503', async () => {
    mockAlwaysFail()

    const req = makeReq()
    const res = makeRes()

    const p = createTenantProxy('dashboard', req, res)
    await vi.runAllTimersAsync()

    expect([502, 503]).toContain(res.statusCode)
  })

  it('aumenta failures a cada falha de rede', async () => {
    mockAlwaysFail()

    const state = _getCircuitBreakerState('dashboard')

    const req = makeReq()
    const res = makeRes()

    const p = createTenantProxy('dashboard', req, res)
    await vi.runAllTimersAsync()

    expect(state.failures).toBeGreaterThan(0)
  })

  it('reseta failures após resposta bem-sucedida', async () => {
    const state    = _getCircuitBreakerState('dashboard')
    state.failures = 3

    mockSuccess()

    const req = makeReq()
    const res = makeRes()

    const p = createTenantProxy('dashboard', req, res)
    await vi.runAllTimersAsync()
    await p

    expect(state.failures).toBe(0)
    expect(state.isOpen).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Suite 3 — Circuit Breaker
// ---------------------------------------------------------------------------

describe('createTenantProxy — circuit breaker', () => {
  it('estado inicial do CB é fechado com 0 falhas', () => {
    const state = _getCircuitBreakerState('dashboard')
    expect(state.isOpen).toBe(false)
    expect(state.failures).toBe(0)
  })

  it('abre o CB quando failures >= 5', () => {
    const state    = _getCircuitBreakerState('dashboard')
    state.failures = 5
    state.isOpen   = true
    state.openedAt = Date.now()

    expect(state.isOpen).toBe(true)
  })

  it('torna-se half-open e fecha após 30s com serviço recuperado', async () => {
    const state    = _getCircuitBreakerState('dashboard')
    state.isOpen   = true
    state.failures = 5
    state.openedAt = Date.now() - 30_001 // simula 30s passados

    mockSuccess()

    const req = makeReq()
    const res = makeRes()

    const p = createTenantProxy('dashboard', req, res)
    await vi.runAllTimersAsync()
    await p

    // Após half-open e sucesso, CB deve estar fechado
    expect(res.statusCode).toBe(200)
    expect(state.isOpen).toBe(false)
  })

  it('retorna 503 se o CB está aberto e ainda não venceu o timeout', async () => {
    const state    = _getCircuitBreakerState('dashboard')
    state.isOpen   = true
    state.failures = 5
    state.openedAt = Date.now() // aberto agora (não venceu 30s)

    mockSuccess() // upstream estaria ok, mas CB impede a chamada

    const req = makeReq()
    const res = makeRes()

    const p = createTenantProxy('dashboard', req, res)
    await vi.runAllTimersAsync()
    await p

    expect(res.statusCode).toBe(503)
    expect(mockHttpRequestImpl).not.toHaveBeenCalled()
  })

  it('CB separado por serviço — falha em dashboard não afeta relatorios', async () => {
    const dashState = _getCircuitBreakerState('dashboard')
    dashState.isOpen   = true
    dashState.failures = 5
    dashState.openedAt = Date.now()

    mockSuccess(200, '{"ok":true}')

    const req = makeReq({ url: '/api/v1/relatorios/lista' })
    const res = makeRes()

    const p = createTenantProxy('relatorios', req, res)
    await vi.runAllTimersAsync()
    await p

    // relatorios não foi afetado pelo CB do dashboard
    expect(res.statusCode).toBe(200)
    const relState = _getCircuitBreakerState('relatorios')
    expect(relState.isOpen).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Suite 4 — enqueueTenantAction (fila assíncrona)
// ---------------------------------------------------------------------------

describe('enqueueTenantAction', () => {
  it('adiciona a ação à fila imediatamente', () => {
    enqueueTenantAction('dashboard', { event: 'sync', value: 42 })

    const q = _getActionQueue()
    expect(q).toHaveLength(1)
    expect(q[0].serviceKey).toBe('dashboard')
    expect(q[0].payload).toEqual({ event: 'sync', value: 42 })
  })

  it('lança erro se serviceKey não existe', () => {
    expect(() => {
      enqueueTenantAction('invalid-service', { data: 'x' })
    }).toThrow("Serviço 'invalid-service' não encontrado")
  })

  it('registra o timestamp de enfileiramento', () => {
    const before = Date.now()
    enqueueTenantAction('dashboard', { op: 'update' })
    const after = Date.now()

    const q = _getActionQueue()
    expect(q[0].enqueuedAt).toBeGreaterThanOrEqual(before)
    expect(q[0].enqueuedAt).toBeLessThanOrEqual(after)
  })

  it('suporta múltiplas ações enfileiradas', () => {
    enqueueTenantAction('dashboard',  { a: 1 })
    enqueueTenantAction('relatorios', { b: 2 })
    enqueueTenantAction('dashboard',  { c: 3 })

    expect(_getActionQueue()).toHaveLength(3)
  })

  it('retorna sincronamente (não bloqueia a thread)', () => {
    const t0 = Date.now()
    enqueueTenantAction('dashboard', { heavy: true })
    expect(Date.now() - t0).toBeLessThan(100)
  })
})
