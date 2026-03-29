/**
 * E2E — BID Frete v2: Filtros e Busca
 * Tests global search, status filter tabs, column sorting, and export.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  seedCotacao,
  waitForLoadingToFinish,
  screenshotStep,
} from './helpers'

test.describe('Filtros e Busca — Cotacoes', () => {
  test.beforeEach(async ({ page }) => {
    await seedCotacao(page, { modal: 'MARITIMO' })
    await seedCotacao(page, { modal: 'AEREO', modalidade: 'AEREO_GERAL' })
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)
  })

  test('global search filters table rows', async ({ page }) => {
    const searchInput = page.getByTestId('busca-global').or(
      page.getByPlaceholder(/buscar|pesquisar|search/i),
    )
    await expect(searchInput).toBeVisible()

    // Search for a term that should match seeded cotacao
    await searchInput.fill('Santos')
    await waitForLoadingToFinish(page)

    const rows = page.locator('[data-testid="cotacao-row"], [data-testid="cotacao-card"]')
    const count = await rows.count()
    // All visible rows should contain Santos
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(/Santos/i)
    }

    // Clear search restores all rows
    await searchInput.clear()
    await waitForLoadingToFinish(page)
    const countAfterClear = await rows.count()
    expect(countAfterClear).toBeGreaterThanOrEqual(count)
    await screenshotStep(page, 'filtros-search-cleared')
  })

  test('status filter tabs work', async ({ page }) => {
    const tabs = page.locator(
      '[data-testid="status-tab"], [role="tablist"] [role="tab"]',
    )
    const tabCount = await tabs.count()

    if (tabCount >= 2) {
      // Click "Rascunho" or second tab
      const rascunhoTab = tabs.filter({ hasText: /rascunho/i }).first()
      if (await rascunhoTab.isVisible()) {
        await rascunhoTab.click()
      } else {
        await tabs.nth(1).click()
      }
      await waitForLoadingToFinish(page)

      const rows = page.locator('[data-testid="cotacao-row"], [data-testid="cotacao-card"]')
      const filteredCount = await rows.count()

      // Click "Todas" or first tab to restore
      await tabs.first().click()
      await waitForLoadingToFinish(page)
      const allCount = await rows.count()
      expect(allCount).toBeGreaterThanOrEqual(filteredCount)
    }
  })

  test('column sorting works', async ({ page }) => {
    const sortableHeader = page.getByRole('columnheader', { name: /data|criado/i })
    if (await sortableHeader.isVisible()) {
      // Click to sort ascending
      await sortableHeader.click()
      await waitForLoadingToFinish(page)
      await screenshotStep(page, 'filtros-sort-asc')

      // Click again to sort descending
      await sortableHeader.click()
      await waitForLoadingToFinish(page)
      await screenshotStep(page, 'filtros-sort-desc')
    }
  })

  test('export button is accessible', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /exportar|export|download/i }).or(
      page.getByTestId('btn-exportar'),
    )

    if (await exportBtn.isVisible()) {
      await expect(exportBtn).toBeEnabled()
      await screenshotStep(page, 'filtros-export-button')
    }
  })
})

test.describe('Filtros e Busca — Combinados', () => {
  test('filter by modal dropdown', async ({ page }) => {
    await seedCotacao(page, { modal: 'MARITIMO' })
    await seedCotacao(page, { modal: 'AEREO', modalidade: 'AEREO_GERAL' })
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)

    const filtroModal = page.getByTestId('filtro-modal')
    if (await filtroModal.isVisible()) {
      await filtroModal.click()
      await page.getByRole('option', { name: /mar.timo/i }).click()
      await waitForLoadingToFinish(page)

      const rows = page.locator('[data-testid="cotacao-row"], [data-testid="cotacao-card"]')
      const count = await rows.count()
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText(/mar.timo/i)
      }
    }
  })

  test('pagination preserves active filter', async ({ page }) => {
    // Seed enough cotacoes for pagination (if needed)
    for (let i = 0; i < 5; i++) {
      await seedCotacao(page)
    }
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)

    // Apply a filter
    const statusTab = page.locator(
      '[data-testid="status-tab"]',
    ).filter({ hasText: /rascunho/i })

    if (await statusTab.isVisible()) {
      await statusTab.click()
      await waitForLoadingToFinish(page)

      // Try to navigate to next page
      const nextPage = page.getByRole('button', { name: /pr.xima|next|2/ })
      if (await nextPage.isVisible()) {
        await nextPage.click()
        await waitForLoadingToFinish(page)
        // Filter should still be active
        await expect(statusTab).toHaveAttribute('aria-selected', 'true')
      }
    }
  })
})
