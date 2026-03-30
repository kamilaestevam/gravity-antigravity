/**
 * E2E — BID Cambio: Dashboard (Visao Geral)
 * Cat.7 Estados + Cat.10 Visual
 */
import { test, expect } from '@playwright/test'
import { navigateTo, waitForLoadingToFinish, screenshotStep } from './helpers'

test.describe('Dashboard — Visao Geral', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/visao-geral')
    await waitForLoadingToFinish(page)
  })

  test('pagina carrega com titulo', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /vis.o geral|dashboard/i })
        .or(page.getByText(/vis.o geral/i).first())
    ).toBeVisible()
    await screenshotStep(page, 'dashboard-loaded')
  })

  test('dashboard mostra conteudo apos carregamento', async ({ page }) => {
    // O dashboard carrega dados da API — verificar que algo renderizou
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(100) // pagina nao esta vazia
    await screenshotStep(page, 'dashboard-content')
  })

  test('dashboard API retorna KPIs corretos', async ({ page }) => {
    const response = await page.request.get('http://localhost:8025/api/v1/bid-cambio/dashboard', {
      headers: {
        'x-internal-key': 'gravity-dev-internal-key-2026',
        'x-tenant-id': 'tenant-demo-001',
      },
    })
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.parcelas).toBeDefined()
    expect(data.financeiro).toBeDefined()
    expect(data.marketplace).toBeDefined()
    expect(data.marketplace.corretoras_ativas).toBeGreaterThanOrEqual(1)
  })

  test('screenshot do dashboard completo', async ({ page }) => {
    await screenshotStep(page, 'dashboard-full')
  })
})
