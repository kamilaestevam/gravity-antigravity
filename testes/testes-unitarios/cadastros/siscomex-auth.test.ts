// @vitest-environment node
/**
 * Testes unitários — siscomex-auth.ts
 *
 * Tipo de módulo: Serviço (autenticação mTLS + cache de token)
 * Cobertura: obterTokenSiscomex, invalidarCacheToken, obterAgentMtlsSiscomex
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mocks (vi.hoisted) ─────────────────────────────────────────────────────

const { mockFindFirst, mockDecryptToBuffer } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockDecryptToBuffer: vi.fn(),
}))

vi.mock('../../../servicos-global/cadastros/server/src/lib/prisma.js', () => ({
  prisma: {
    certificadoDigitalSiscomex: {
      findFirst: mockFindFirst,
    },
  },
}))

vi.mock('../../../servicos-global/cadastros/server/src/lib/certificado-crypto.js', () => ({
  decryptToBuffer: mockDecryptToBuffer,
}))

// Mock node:https para evitar conexões reais
const { mockRequest } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
}))

vi.mock('node:https', () => {
  class FakeAgent {
    constructor() {}
  }
  return {
    default: {
      Agent: FakeAgent,
      request: mockRequest,
    },
    Agent: FakeAgent,
    request: mockRequest,
  }
})

// Mock certificado-parser — extrairPemDoP12 retorna PEM fake
const { mockExtrairPem } = vi.hoisted(() => ({
  mockExtrairPem: vi.fn(() => ({
    certPem: '-----BEGIN CERTIFICATE-----\nfake\n-----END CERTIFICATE-----',
    keyPem: '-----BEGIN RSA PRIVATE KEY-----\nfake\n-----END RSA PRIVATE KEY-----',
  })),
}))

vi.mock('../../../servicos-global/cadastros/server/src/services/certificado-parser.js', () => ({
  extrairPemDoP12: mockExtrairPem,
}))

// ── Import sob teste ────────────────────────────────────────────────────────

import { obterTokenSiscomex, invalidarCacheToken, obterAgentMtlsSiscomex } from '../../../servicos-global/cadastros/server/src/services/siscomex-auth.js'

// ── Setup ────────────────────────────────────────────────────────────────────

const CERT_ROW = {
  pfx_criptografado_certificado_digital_siscomex: 'encrypted_pfx_data',
  senha_hash_certificado_digital_siscomex: 'encrypted_password',
  cnpj_certificado_digital_siscomex: '12345678000199',
}

beforeEach(() => {
  vi.clearAllMocks()
  invalidarCacheToken()
  process.env.SISCOMEX_AUTH_URL = 'https://portalunico.siscomex.gov.br/portal/api/autenticar'
  mockDecryptToBuffer.mockImplementation((input: string) => {
    if (input === 'encrypted_pfx_data') return Buffer.from('fake-pfx-binary')
    if (input === 'encrypted_password') return Buffer.from('senha123')
    return Buffer.from('')
  })
})

afterEach(() => {
  delete process.env.SISCOMEX_AUTH_URL
})

// ── Helpers ─────────────────────────────────────────────────────────────────

function mockHttpResponse(statusCode: number, body: string, headers: Record<string, string> = {}) {
  mockRequest.mockImplementation((_opts: unknown, callback: (res: unknown) => void) => {
    const res = {
      statusCode,
      headers,
      on: vi.fn((event: string, handler: (chunk?: Buffer) => void) => {
        if (event === 'data') handler(Buffer.from(body))
        if (event === 'end') handler()
      }),
    }
    callback(res)
    return {
      on: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
      destroy: vi.fn(),
    }
  })
}

// ── obterTokenSiscomex ──────────────────────────────────────────────────────

describe('obterTokenSiscomex', () => {
  it('lança erro quando nenhum certificado ativo existe', async () => {
    mockFindFirst.mockResolvedValue(null)

    await expect(obterTokenSiscomex()).rejects.toThrow('Nenhum certificado digital Siscomex ativo configurado')
  })

  it('retorna JWT do campo token na resposta JSON 200', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockHttpResponse(200, JSON.stringify({ token: 'jwt-siscomex-valido' }))

    const token = await obterTokenSiscomex()
    expect(token).toBe('jwt-siscomex-valido')
  })

  it('retorna JWT do campo access_token na resposta JSON 200', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockHttpResponse(200, JSON.stringify({ access_token: 'jwt-access-token' }))

    const token = await obterTokenSiscomex()
    expect(token).toBe('jwt-access-token')
  })

  it('retorna JWT do campo set_token na resposta JSON 200', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockHttpResponse(200, JSON.stringify({ set_token: 'jwt-set-token' }))

    const token = await obterTokenSiscomex()
    expect(token).toBe('jwt-set-token')
  })

  it('retorna JWT do header set-token quando body não tem token', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockHttpResponse(200, JSON.stringify({ other: 'data' }), { 'set-token': 'jwt-header-token' })

    const token = await obterTokenSiscomex()
    expect(token).toBe('jwt-header-token')
  })

  it('retorna body diretamente como JWT quando é string longa sem JSON válido', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    const rawJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature'
    mockHttpResponse(200, rawJwt)

    const token = await obterTokenSiscomex()
    expect(token).toBe(rawJwt)
  })

  it('lança erro SISCOMEX_AUTH_NO_TOKEN quando resposta 200 não contém token', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockHttpResponse(200, JSON.stringify({ data: {} }))

    await expect(obterTokenSiscomex()).rejects.toThrow('Resposta de autenticação Siscomex sem token')
  })

  it('lança erro SISCOMEX_AUTH_REJECTED quando Portal retorna 401', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockHttpResponse(401, 'Unauthorized')

    await expect(obterTokenSiscomex()).rejects.toThrow('Certificado rejeitado pelo Portal Único')
  })

  it('lança erro SISCOMEX_AUTH_REJECTED quando Portal retorna 403', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockHttpResponse(403, 'Forbidden')

    await expect(obterTokenSiscomex()).rejects.toThrow('Certificado rejeitado pelo Portal Único')
  })

  it('lança erro SISCOMEX_AUTH_ERROR para status HTTP inesperado (500)', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockHttpResponse(500, 'Internal Server Error')

    await expect(obterTokenSiscomex()).rejects.toThrow('Erro na autenticação Siscomex')
  })

  it('lança erro SISCOMEX_AUTH_CONNECT_ERROR em falha de rede', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockRequest.mockImplementation((_opts: unknown, _callback: unknown) => {
      const req = {
        on: vi.fn((event: string, handler: (err?: Error) => void) => {
          if (event === 'error') {
            setTimeout(() => handler(new Error('ECONNREFUSED')), 0)
          }
        }),
        write: vi.fn(),
        end: vi.fn(),
        destroy: vi.fn(),
      }
      return req
    })

    await expect(obterTokenSiscomex()).rejects.toThrow('Falha na conexão com Portal Único')
  })

  it('usa cache: segunda chamada não consulta banco nem faz HTTP', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockHttpResponse(200, JSON.stringify({ token: 'jwt-cached' }))

    const token1 = await obterTokenSiscomex()
    const token2 = await obterTokenSiscomex()

    expect(token1).toBe('jwt-cached')
    expect(token2).toBe('jwt-cached')
    expect(mockFindFirst).toHaveBeenCalledTimes(1)
    expect(mockRequest).toHaveBeenCalledTimes(1)
  })
})

// ── invalidarCacheToken ─────────────────────────────────────────────────────

describe('invalidarCacheToken', () => {
  it('força nova consulta ao banco após invalidação', async () => {
    mockFindFirst.mockResolvedValue(CERT_ROW)
    mockHttpResponse(200, JSON.stringify({ token: 'jwt-1' }))

    await obterTokenSiscomex()
    expect(mockFindFirst).toHaveBeenCalledTimes(1)

    invalidarCacheToken()

    mockHttpResponse(200, JSON.stringify({ token: 'jwt-2' }))
    const token = await obterTokenSiscomex()

    expect(token).toBe('jwt-2')
    expect(mockFindFirst).toHaveBeenCalledTimes(2)
  })
})

// ── obterAgentMtlsSiscomex ──────────────────────────────────────────────────

describe('obterAgentMtlsSiscomex', () => {
  it('retorna objeto Agent sem lançar erro', () => {
    const agent = obterAgentMtlsSiscomex(Buffer.from('pfx'), 'senha')
    expect(agent).toBeDefined()
  })
})
