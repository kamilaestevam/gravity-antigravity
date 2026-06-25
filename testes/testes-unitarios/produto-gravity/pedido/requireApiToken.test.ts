// @vitest-environment node
/**
 * Testa o middleware requireApiToken do produto pedido.
 *
 * Verifica: path correto (/api/v1/cockpit/api-tokens/validate),
 * header S2S (x-chave-interna-servico), prefixos DDD canônicos,
 * e comportamento de injeção no req.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const middlewarePath = path.resolve(
  __dirname,
  '../../../servicos-global/produto/pedido/server/src/middleware/requireApiToken.ts',
)
const content = readFileSync(middlewarePath, 'utf-8')

describe('requireApiToken — contrato estático (source analysis)', () => {
  it('chama path correto /api/v1/cockpit/api-tokens/validate (não /api/v1/api-tokens/validate)', () => {
    expect(content).toContain('/api/v1/cockpit/api-tokens/validate')
    expect(content).not.toContain("'/api/v1/api-tokens/validate'")
  })

  it('usa header S2S canônico x-chave-interna-servico (não x-internal-key)', () => {
    expect(content).toContain('x-chave-interna-servico')
    expect(content).not.toContain("'x-internal-key'")
  })

  it('usa prefixos DDD canônicos gravity_token_api_ (não gv_live_sk_/gv_test_sk_)', () => {
    expect(content).toContain('gravity_token_api_')
    expect(content).not.toContain('gv_live_sk_')
    expect(content).not.toContain('gv_test_sk_')
  })

  it('lê CHAVE_INTERNA_SERVICO como env primária', () => {
    expect(content).toContain('CHAVE_INTERNA_SERVICO')
  })

  it('resposta usa campo DDD id_organizacao (não tenant_id)', () => {
    expect(content).toContain('id_organizacao')
    expect(content).not.toMatch(/result\.tenant_id/)
  })
})

describe('requireApiToken — comportamento runtime', () => {
  let requireApiToken: () => (req: Record<string, unknown>, res: Record<string, unknown>, next: (err?: unknown) => void) => Promise<void>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    process.env.API_COCKPIT_URL = 'http://localhost:8016'
    process.env.CHAVE_INTERNA_SERVICO = 'test-key'
    const mod = await import('../../../servicos-global/produto/pedido/server/src/middleware/requireApiToken.js')
    requireApiToken = mod.requireApiToken
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('chama next com AppError 401 quando Authorization header está ausente', async () => {
    const req = { headers: {} }
    const res = {}
    const next = vi.fn()

    const middleware = requireApiToken()
    await middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    const err = next.mock.calls[0][0] as Error & { statusCode: number }
    expect(err.statusCode).toBe(401)
  })

  it('chama next com AppError 401 quando prefixo do token não é canônico', async () => {
    const req = { headers: { authorization: 'Bearer random_token_123' } }
    const res = {}
    const next = vi.fn()

    const middleware = requireApiToken()
    await middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    const err = next.mock.calls[0][0] as Error & { statusCode: number }
    expect(err.statusCode).toBe(401)
  })

  it('chama api-cockpit para validar token com prefixo canônico e injeta dados no req', async () => {
    const mockResponse = new Response(
      JSON.stringify({ valid: true, id_organizacao: 'org-test', scopes: ['LEITURA'] }),
      { status: 200 },
    )
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

    const req: Record<string, unknown> = {
      headers: { authorization: 'Bearer gravity_token_api_homologacao_abc123def456' },
    }
    const res = {}
    const next = vi.fn()

    const middleware = requireApiToken()
    await middleware(req, res, next)

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8016/api/v1/cockpit/api-tokens/validate',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-chave-interna-servico': 'test-key',
          Authorization: expect.stringContaining('Bearer gravity_token_api_homologacao_'),
        }),
      }),
    )
    expect(next).toHaveBeenCalledWith()
    expect(req.apiTenantId).toBe('org-test')
    expect(req.apiScopes).toEqual(['LEITURA'])
  })

  it('retorna 503 quando api-cockpit está indisponível', async () => {
    ;(fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('ECONNREFUSED'))

    const req: Record<string, unknown> = {
      headers: { authorization: 'Bearer gravity_token_api_producao_valido' },
    }
    const res = {}
    const next = vi.fn()

    const middleware = requireApiToken()
    await middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    const err = next.mock.calls[0][0] as Error & { statusCode: number }
    expect(err.statusCode).toBe(503)
  })
})
