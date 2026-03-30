/**
 * E2E — BID Cambio: Cat.1 CRUD Cotacoes + Cat.6 Modais/Formularios
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo, waitForLoadingToFinish, screenshotStep,
  seedCotacao, apiGet, apiDelete, apiPatch,
} from './helpers'

test.describe('Cat.1 — Cotacoes CRUD', () => {
  test('pagina de cotacoes carrega', async ({ page }) => {
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)
    await expect(
      page.getByRole('heading', { name: /cota..o|cotacao/i })
        .or(page.getByText(/cota..o|cotacao/i).first())
    ).toBeVisible()
    await screenshotStep(page, 'cotacoes-list')
  })

  test('criar cotacao via API (caminho feliz)', async ({ page }) => {
    const cotacao = await seedCotacao(page)
    expect(cotacao.id).toBeTruthy()
    expect(cotacao.status).toBe('RASCUNHO')
    expect(cotacao.moeda).toBe('USD')
  })

  test('criar multiplas cotacoes em sequencia', async ({ page }) => {
    const c1 = await seedCotacao(page, { moeda: 'USD', valor: 10000 })
    const c2 = await seedCotacao(page, { moeda: 'EUR', valor: 20000 })
    const c3 = await seedCotacao(page, { moeda: 'GBP', valor: 30000 })
    expect(c1.id).not.toBe(c2.id)
    expect(c2.id).not.toBe(c3.id)
  })

  test('visualizar detalhes de uma cotacao via API', async ({ page }) => {
    const cotacao = await seedCotacao(page)
    const detalhe = await apiGet<{ id: string; bid_requests: unknown[]; bid_responses: unknown[] }>(
      page,
      `/api/v1/bid-cambio/cotacoes/${cotacao.id}`,
    )
    expect(detalhe.id).toBe(cotacao.id)
    expect(detalhe.bid_requests).toBeDefined()
    expect(detalhe.bid_responses).toBeDefined()
  })

  test('editar cotacao em RASCUNHO via API', async ({ page }) => {
    const cotacao = await seedCotacao(page)
    const updated = await apiPatch<{ id: string; valor: string }>(
      page,
      `/api/v1/bid-cambio/cotacoes/${cotacao.id}`,
      { valor: 75000 },
    )
    expect(Number(updated.valor)).toBe(75000)
  })

  test('deletar cotacao em RASCUNHO via API', async ({ page }) => {
    const cotacao = await seedCotacao(page)
    await apiDelete(page, `/api/v1/bid-cambio/cotacoes/${cotacao.id}`)
    // Confirmar que nao existe mais
    const response = await page.request.get(`http://localhost:8025/api/v1/bid-cambio/cotacoes/${cotacao.id}`, {
      headers: {
        'x-internal-key': 'gravity-dev-internal-key-2026',
        'x-tenant-id': 'tenant-demo-001',
        'x-user-id': 'user-demo-001',
      },
    })
    expect(response.status()).toBe(404)
  })

  test('criar cotacao com dados invalidos retorna erro', async ({ page }) => {
    const response = await page.request.post('http://localhost:8025/api/v1/bid-cambio/cotacoes', {
      data: { moeda: 'INVALIDA', valor: -100 },
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': 'gravity-dev-internal-key-2026',
        'x-tenant-id': 'tenant-demo-001',
        'x-user-id': 'user-demo-001',
      },
    })
    expect(response.ok()).toBe(false)
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })
})

test.describe('Cat.6 — Formulario Nova Cotacao', () => {
  test('pagina nova cotacao carrega', async ({ page }) => {
    await navigateTo(page, '/cotacoes/nova')
    await waitForLoadingToFinish(page)
    await screenshotStep(page, 'nova-cotacao-form')
  })

  test('formulario tem campos obrigatorios', async ({ page }) => {
    await navigateTo(page, '/cotacoes/nova')
    await waitForLoadingToFinish(page)

    // Verificar presenca de campos do formulario
    const moedaField = page.getByText(/moeda/i).first()
    const valorField = page.getByText(/valor/i).first()
    const tipoField = page.getByText(/tipo|opera..o/i).first()

    await expect(moedaField).toBeVisible()
    await screenshotStep(page, 'nova-cotacao-campos')
  })
})
