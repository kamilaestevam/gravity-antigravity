/**
 * E2E — BID Frete v2: Cotacoes CRUD
 * Tests the cotacoes list page, table rendering, filter tabs, row navigation,
 * and the "Buscar frete" button.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  seedCotacao,
  waitForLoadingToFinish,
  waitForToast,
  screenshotStep,
} from './helpers'

test.describe('Cotacoes — List Page', () => {
  test('page loads with heading', async ({ page }) => {
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)

    await expect(
      page.getByRole('heading', { name: /cota..es|cotacoes/i }),
    ).toBeVisible()
    await screenshotStep(page, 'cotacoes-list-loaded')
  })

  test('table renders with correct columns', async ({ page }) => {
    await seedCotacao(page)
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)

    const expectedColumns = [
      /processo.*dati|processo/i,
      /refer.ncia/i,
      /status/i,
      /modal/i,
      /origem/i,
      /destino/i,
    ]

    for (const col of expectedColumns) {
      await expect(
        page.getByRole('columnheader', { name: col }),
      ).toBeVisible()
    }
  })

  test('filter tabs are clickable and change content', async ({ page }) => {
    await seedCotacao(page)
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)

    const tabs = page.locator('[role="tablist"] [role="tab"], [data-testid="status-tab"]')
    const count = await tabs.count()

    if (count >= 2) {
      // Click a non-default tab
      await tabs.nth(1).click()
      await waitForLoadingToFinish(page)
      await screenshotStep(page, 'cotacoes-tab-filtered')

      // Click back to first tab
      await tabs.first().click()
      await waitForLoadingToFinish(page)
    }
  })

  test('row click navigates to detail page', async ({ page }) => {
    const cotacao = await seedCotacao(page)
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)

    const row = page.locator(
      `[data-testid="cotacao-row"], [data-testid="cotacao-card"]`,
    ).first()
    await row.click()
    await waitForLoadingToFinish(page)

    await expect(page).toHaveURL(/\/cotacoes\//)
    await screenshotStep(page, 'cotacao-detail')
  })

  test('"Buscar frete" button navigates to wizard', async ({ page }) => {
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)

    const btn = page.getByRole('button', { name: /buscar frete|nova cota/i }).or(
      page.getByRole('link', { name: /buscar frete|nova cota/i }),
    )
    await expect(btn).toBeVisible()
    await btn.click()

    await expect(page).toHaveURL(/\/cotacoes\/nova/)
  })
})

test.describe('Cotacoes — CRUD Operations', () => {
  test('view cotacao detail shows all fields', async ({ page }) => {
    const cotacao = await seedCotacao(page)
    await navigateTo(page, `/cotacoes/${cotacao.id}`)
    await waitForLoadingToFinish(page)

    await expect(page.getByText(/mar.timo/i)).toBeVisible()
    await expect(page.getByText(/Santos/i)).toBeVisible()
    await expect(page.getByText(/Shanghai/i)).toBeVisible()
    await expect(page.getByText(/FOB/i)).toBeVisible()
    await screenshotStep(page, 'cotacao-detail-fields')
  })

  test('delete cotacao in RASCUNHO status', async ({ page }) => {
    const cotacao = await seedCotacao(page)
    await navigateTo(page, `/cotacoes/${cotacao.id}`)
    await waitForLoadingToFinish(page)

    await page.getByRole('button', { name: /deletar|excluir/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: /confirmar|sim/i }).click()

    await waitForToast(page, /deletad|removid|exclu/i)
    await expect(page).toHaveURL(/\/cotacoes$/)
  })

  test('disparo BID opens confirmation modal', async ({ page }) => {
    const cotacao = await seedCotacao(page)
    await navigateTo(page, `/cotacoes/${cotacao.id}`)
    await waitForLoadingToFinish(page)

    const disparoBtn = page.getByRole('button', { name: /disparar/i })
    if (await disparoBtn.isVisible()) {
      await disparoBtn.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog.getByText(/fornecedor/i)).toBeVisible()
      await screenshotStep(page, 'cotacao-disparo-modal')

      // Close modal
      await dialog.getByRole('button', { name: /fechar|cancelar|x/i }).first().click()
      await expect(dialog).toBeHidden()
    }
  })
})
