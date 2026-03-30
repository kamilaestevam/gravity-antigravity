/**
 * E2E — BID Cambio: Cat.11 Portal da Corretora (publico + autenticado)
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo, waitForLoadingToFinish, screenshotStep,
  seedCotacao, seedCorretora, seedDisparo, apiGet,
  API_URL, INTERNAL_KEY, TENANT_ID, USER_ID,
} from './helpers'

function headers(corretoraId?: string) {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': INTERNAL_KEY,
    'x-tenant-id': TENANT_ID,
    'x-user-id': USER_ID,
    ...(corretoraId ? { 'x-corretora-id': corretoraId } : {}),
  }
}

test.describe('Cat.11 — Portal Publico da Corretora (Token)', () => {
  test('fluxo completo: ver cotacao → responder → bloquear re-resposta', async ({ page }) => {
    // Setup
    const cotacao = await seedCotacao(page, { moeda: 'EUR', valor: 75000 })
    const corretora = await seedCorretora(page, { razao_social: `Portal E2E ${Date.now()}` })
    const disparo = await seedDisparo(page, cotacao.id, [corretora.id])
    const token = disparo.bid_requests[0].token_publico

    // GET cotacao via token
    const getResp = await page.request.get(
      `${API_URL}/api/v1/bid-cambio/portal/public/cotacao/${token}`,
    )
    expect(getResp.ok()).toBe(true)
    const data = await getResp.json()
    expect(data.cotacao.moeda).toBe('EUR')
    expect(data.ja_respondida).toBe(false)

    // Responder via token
    const postResp = await page.request.post(
      `${API_URL}/api/v1/bid-cambio/portal/public/responder/${token}`,
      {
        data: {
          taxa_oferecida: 5.7500,
          spread: 0.0200,
          validade_minutos: 30,
          liquidacao_proposta: 'D1',
        },
        headers: { 'Content-Type': 'application/json' },
      },
    )
    expect(postResp.ok()).toBe(true)
    const result = await postResp.json()
    expect(result.sucesso).toBe(true)

    // Re-resposta bloqueada
    const reResp = await page.request.post(
      `${API_URL}/api/v1/bid-cambio/portal/public/responder/${token}`,
      {
        data: { taxa_oferecida: 5.80, spread: 0.01, validade_minutos: 60, liquidacao_proposta: 'D2' },
        headers: { 'Content-Type': 'application/json' },
      },
    )
    expect(reResp.ok()).toBe(false)
    expect(reResp.status()).toBe(400)
  })

  test('token invalido retorna 404', async ({ page }) => {
    const response = await page.request.get(
      `${API_URL}/api/v1/bid-cambio/portal/public/cotacao/token-que-nao-existe`,
    )
    expect(response.status()).toBe(404)
  })
})

test.describe('Cat.11 — Portal Autenticado da Corretora', () => {
  let corretoraId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    const list = await apiGet<{ data: Array<{ id: string; status: string }> }>(
      page,
      '/api/v1/bid-cambio/corretoras?status=ATIVA',
    )
    corretoraId = list.data[0].id
    await page.close()
  })

  test('dashboard da corretora retorna metricas', async ({ page }) => {
    const response = await page.request.get(
      `${API_URL}/api/v1/bid-cambio/portal/dashboard`,
      { headers: headers(corretoraId) },
    )
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.metricas).toBeDefined()
    expect(data.metricas.cotacoes_pendentes).toBeGreaterThanOrEqual(0)
  })

  test('cotacoes pendentes da corretora', async ({ page }) => {
    const response = await page.request.get(
      `${API_URL}/api/v1/bid-cambio/portal/cotacoes-pendentes`,
      { headers: headers(corretoraId) },
    )
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.pagination).toBeDefined()
  })

  test('minhas respostas da corretora', async ({ page }) => {
    const response = await page.request.get(
      `${API_URL}/api/v1/bid-cambio/portal/minhas-respostas`,
      { headers: headers(corretoraId) },
    )
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.pagination).toBeDefined()
  })

  test('meu desempenho da corretora', async ({ page }) => {
    const response = await page.request.get(
      `${API_URL}/api/v1/bid-cambio/portal/meu-desempenho`,
      { headers: headers(corretoraId) },
    )
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.desempenho).toBeDefined()
    expect(data.desempenho.taxa_aprovacao).toBeDefined()
  })

  test('requer header x-corretora-id', async ({ page }) => {
    const response = await page.request.get(
      `${API_URL}/api/v1/bid-cambio/portal/dashboard`,
      { headers: headers() }, // sem corretora-id
    )
    expect(response.ok()).toBe(false)
    expect(response.status()).toBe(400)
  })

  test('navegar portal no frontend', async ({ page }) => {
    await navigateTo(page, '/portal/dashboard')
    await waitForLoadingToFinish(page)
    await screenshotStep(page, 'portal-corretora-dashboard')
  })
})
