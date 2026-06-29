// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GABI_UNAVAILABLE_CODE, proxyGabi } from '../../../servicos-global/configurador/server/proxy/proxy-gabi.js'
import type { Request, Response } from 'express'

function mockRes(): Response & { statusCode: number; body: string } {
  const res = {
    statusCode: 200,
    body: '',
    headersSent: false,
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(payload: unknown) {
      res.body = JSON.stringify(payload)
      res.headersSent = true
      return res
    },
    writeHead() {
      res.headersSent = true
      return res
    },
    pipe() {
      return res
    },
  }
  return res as unknown as Response & { statusCode: number; body: string }
}

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    method: 'POST',
    originalUrl: '/api/v1/gabi/agente/chat',
    headers: {},
    body: {},
    auth: {
      id_organizacao: 'org-test',
      id_usuario: 'usr-test',
      tipo_usuario: 'PADRAO',
    },
    pipe: vi.fn(),
    ...overrides,
  } as unknown as Request
}

describe('proxyGabi — degradação 503', () => {
  const envOriginal = { ...process.env }

  afterEach(() => {
    process.env = { ...envOriginal }
    vi.restoreAllMocks()
  })

  it('retorna GABI_UNAVAILABLE quando GABI_PROXY_ENABLED=false', () => {
    process.env.GABI_PROXY_ENABLED = 'false'
    process.env.CHAVE_INTERNA_SERVICO = 'test-key'

    const res = mockRes()
    proxyGabi(mockReq(), res)

    expect(res.statusCode).toBe(503)
    const payload = JSON.parse(res.body) as { error: { code: string } }
    expect(payload.error.code).toBe(GABI_UNAVAILABLE_CODE)
  })

  it('retorna 503 quando CHAVE_INTERNA_SERVICO ausente', () => {
    delete process.env.GABI_PROXY_ENABLED
    delete process.env.CHAVE_INTERNA_SERVICO

    const res = mockRes()
    proxyGabi(mockReq(), res)

    expect(res.statusCode).toBe(503)
    expect(JSON.parse(res.body).error.code).toBe(GABI_UNAVAILABLE_CODE)
  })
})
