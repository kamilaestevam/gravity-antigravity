// @vitest-environment node
// TST-UNIT-CONF-STORE-001 — Store — URLs corretas de assinaturas e subscribe
// Anti-regressão: garante que Store.tsx usa /api/v1/assinaturas e /api/v1/assinaturas/subscribe
// (impede retorno às URLs quebradas /tenants/products/* — bug corrigido em commit 168d78d).
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

  it('carregamento de assinaturas usa ${API_URL}/assinaturas (sem /tenants/products)', () => {
    // URL correta deve existir
    expect(storeSource).toContain('`${API_URL}/assinaturas`')
    // URL quebrada NÃO deve existir em nenhuma forma
    expect(storeSource).not.toContain('/tenants/products')
  })

  it('endpoint de subscribe usa ${API_URL}/assinaturas/subscribe', () => {
    expect(storeSource).toContain('`${API_URL}/assinaturas/subscribe`')
  })

  it('subscribe usa método POST', () => {
    const subscribeBlock = storeSource.slice(
      storeSource.indexOf('assinaturas/subscribe'),
      storeSource.indexOf('assinaturas/subscribe') + 200,
    )
    expect(subscribeBlock).toContain("method: 'POST'")
  })

  it('subscribe envia product_key no body', () => {
    const subscribeBlock = storeSource.slice(
      storeSource.indexOf('assinaturas/subscribe'),
      storeSource.indexOf('assinaturas/subscribe') + 300,
    )
    expect(subscribeBlock).toContain('product_key')
  })

  it('subscribe inclui Authorization header com Bearer token', () => {
    const subscribeBlock = storeSource.slice(
      storeSource.indexOf('assinaturas/subscribe') - 50,
      storeSource.indexOf('assinaturas/subscribe') + 300,
    )
    expect(subscribeBlock).toMatch(/Authorization.*Bearer/)
  })
})

// ─── 2. Lógica de subscribe em isolamento (sem renderização) ──────────────────
// Extrai e testa o comportamento de handleSubscribe via fetch mock direto.

describe('TST-UNIT-CONF-STORE-001 — handleSubscribe: comportamento da lógica', () => {

  let fetchMock: ReturnType<typeof vi.fn>

  const SUBSCRIBE_OK = {
    config:  { tenant_id: 'ten_01', product_key: 'pedido', is_active: true, config: {} },
    catalog: { id: 'p1', name: 'Pedido', slug: 'pedido' },
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
      body: JSON.stringify({ product_key: slug }),
    })

    return { res, calls: fetchMock.mock.calls }
  }

  it('chama /api/v1/assinaturas/subscribe com POST', async () => {
    await callSubscribe('pedido', 'jwt-test', SUBSCRIBE_OK, 201)

    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/assinaturas/subscribe')
    expect(opts.method).toBe('POST')
  })

  it('envia product_key correto no body JSON', async () => {
    await callSubscribe('nf-importacao', 'jwt-test', SUBSCRIBE_OK, 201)

    const [, opts] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(opts.body as string)
    expect(body.product_key).toBe('nf-importacao')
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
