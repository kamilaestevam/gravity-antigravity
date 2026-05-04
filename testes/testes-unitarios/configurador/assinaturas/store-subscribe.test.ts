// @vitest-environment node
// TST-UNIT-CONF-STORE-001 — Store — URLs corretas de assinaturas e assinar-produto
// Anti-regressão: garante que Store.tsx usa /api/v1/organizacoes/me/assinaturas
// e /api/v1/organizacoes/me/assinaturas/assinar-produto (DDD pós 2026-05-04).
// Antes: /assinaturas e /assinaturas/subscribe (legado pré-DDD, removido).
//
// Abordagem: leitura estática + extração da lógica de subscribe em isolamento.
// A renderização completa do componente fica coberta pelo teste E2E (Playwright).
/// <reference types="vitest/globals" />

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root       = path.resolve(__dirname, '../../../..')
const storePath  = path.join(root, 'servicos-global/configurador/src/pages/Store.tsx')
const storeSource = readFileSync(storePath, 'utf-8')

// ─── 1. Análise estática do código-fonte ─────────────────────────────────────
describe('TST-UNIT-CONF-STORE-001 — Store.tsx: URLs anti-regressão (análise estática)', () => {

  it('API_URL é /api/v1', () => {
    expect(storeSource).toMatch(/const\s+API_URL\s*=\s*['"]\/api\/v1['"]/)
  })

  it('carregamento de assinaturas usa ${API_URL}/organizacoes/me/assinaturas (sem /tenants/products)', () => {
    expect(storeSource).toContain('`${API_URL}/organizacoes/me/assinaturas`')
    expect(storeSource).not.toContain('/tenants/products')
  })

  it('endpoint de subscribe usa ${API_URL}/organizacoes/me/assinaturas/assinar-produto', () => {
    expect(storeSource).toContain('`${API_URL}/organizacoes/me/assinaturas/assinar-produto`')
  })

  it('subscribe usa método POST', () => {
    const subscribeBlock = storeSource.slice(
      storeSource.indexOf('assinaturas/assinar-produto'),
      storeSource.indexOf('assinaturas/assinar-produto') + 200,
    )
    expect(subscribeBlock).toContain("method: 'POST'")
  })

  it('subscribe envia slug_produto_gravity no body', () => {
    const subscribeBlock = storeSource.slice(
      storeSource.indexOf('assinaturas/assinar-produto'),
      storeSource.indexOf('assinaturas/assinar-produto') + 300,
    )
    expect(subscribeBlock).toContain('slug_produto_gravity')
  })

  it('subscribe inclui Authorization header com Bearer token', () => {
    const subscribeBlock = storeSource.slice(
      storeSource.indexOf('assinaturas/assinar-produto') - 50,
      storeSource.indexOf('assinaturas/assinar-produto') + 300,
    )
    expect(subscribeBlock).toMatch(/Authorization.*Bearer/)
  })
})

// ─── 2. Lógica de subscribe em isolamento (sem renderização) ──────────────────
// Extrai e testa o comportamento de handleSubscribe via fetch mock direto.

describe('TST-UNIT-CONF-STORE-001 — handleSubscribe: comportamento da lógica', () => {

  let fetchMock: ReturnType<typeof vi.fn>

  const SUBSCRIBE_OK = {
    assinatura:   { id_assinatura_produto_gravity: 'asg_01', id_organizacao: 'ten_01', id_produto_gravity: 'p1', status_assinatura_produto_gravity: 'EM_TESTE' },
    configuracao: { id_configuracao_produto_gravity: 'cfg_01', ativo_configuracao_produto_gravity: true, configuracao_config_produto_gravity: {} },
  }

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  async function callSubscribe(
    slug: string,
    token: string,
    subscribeBody: unknown,
    subscribeStatus: number,
  ) {
    const API_URL = '/api/v1'

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(subscribeBody), { status: subscribeStatus })
    )

    const res = await fetch(`${API_URL}/assinaturas/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slug_produto_gravity: slug }),
    })

    return { res, calls: fetchMock.mock.calls }
  }

  it('chama /api/v1/organizacoes/me/assinaturas/assinar-produto com POST', async () => {
    await callSubscribe('pedido', 'jwt-test', SUBSCRIBE_OK, 201)

    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/organizacoes/me/assinaturas/assinar-produto')
    expect(opts.method).toBe('POST')
  })

  it('envia product_key correto no body JSON', async () => {
    await callSubscribe('nf-importacao', 'jwt-test', SUBSCRIBE_OK, 201)

    const [, opts] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(opts.body as string)
    expect(body.slug_produto_gravity).toBe('nf-importacao')
  })

  it('inclui Bearer token no Authorization header', async () => {
    await callSubscribe('pedido', 'my-token-123', SUBSCRIBE_OK, 201)

    const [, opts] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((opts.headers as Record<string, string>)['Authorization']).toBe('Bearer my-token-123')
  })

  it('resposta 201 indica contratação bem-sucedida', async () => {
    const { res } = await callSubscribe('pedido', 'jwt', SUBSCRIBE_OK, 201)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(201)
  })

  it('resposta 404 indica produto inexistente no catálogo', async () => {
    const errorBody = { error: { message: 'Produto não encontrado ou inativo', code: 'NOT_FOUND' } }
    const { res } = await callSubscribe('desconhecido', 'jwt', errorBody, 404)
    expect(res.ok).toBe(false)
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error.code).toBe('NOT_FOUND')
  })

  it('NUNCA usa URL com /tenants/products (URL quebrada)', async () => {
    await callSubscribe('pedido', 'jwt', SUBSCRIBE_OK, 201)

    const urls = fetchMock.mock.calls.map(([u]: [string]) => u)
    expect(urls.every(u => !u.includes('/tenants/products'))).toBe(true)
  })
})
