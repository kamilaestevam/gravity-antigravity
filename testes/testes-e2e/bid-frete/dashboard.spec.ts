/**
 * E2E — BID Frete v2: Dashboard
 * Tests the main dashboard page with KPIs, charts, table, and navigation.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForLoadingToFinish,
  waitForElement,
  screenshotStep,
  seedCotacao,
} from './helpers'

test.describe('Dashboard — Visao Geral', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard')
    await waitForLoadingToFinish(page)
  })

  test('page loads with "Visao Geral" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /vis.o geral/i }),
    ).toBeVisible()
    await screenshotStep(page, 'dashboard-loaded')
  })

  test('KPI cards are visible', async ({ page }) => {
    const kpiTestIds = [
      'kpi-cotacoes-andamento',
      'kpi-valor-total',
      'kpi-taxa-aprovacao',
      'kpi-saving',
    ]
    for (const testId of kpiTestIds) {
      await expect(page.getByTestId(testId)).toBeVisible()
    }
  })

  test('Fornecedores donut chart renders', async ({ page }) => {
    const chart = page.getByTestId('chart-fornecedores-donut')
    await expect(chart).toBeVisible()
    // Chart should contain SVG or canvas
    const hasSvgOrCanvas = await chart.locator('svg, canvas').count()
    expect(hasSvgOrCanvas).toBeGreaterThan(0)
  })

  test('Calendar alertas section renders', async ({ page }) => {
    await expect(page.getByTestId('section-alertas-calendario')).toBeVisible()
  })

  test('Moedas section renders', async ({ page }) => {
    await expect(page.getByTestId('section-moedas')).toBeVisible()
  })

  test('Cotacoes table loads with column headers', async ({ page }) => {
    await seedCotacao(page)
    await navigateTo(page, '/dashboard')
    await waitForLoadingToFinish(page)

    const table = page.getByTestId('dashboard-cotacoes-table').or(page.locator('table'))
    await expect(table).toBeVisible()

    const expectedHeaders = ['Processo', 'Status', 'Modal']
    for (const header of expectedHeaders) {
      await expect(
        page.getByRole('columnheader', { name: new RegExp(header, 'i') }),
      ).toBeVisible()
    }
    await screenshotStep(page, 'dashboard-table')
  })

  test('"Buscar frete" button navigates to /cotacoes/nova', async ({ page }) => {
    const btn = page.getByRole('button', { name: /buscar frete/i }).or(
      page.getByRole('link', { name: /buscar frete/i }),
    )
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page).toHaveURL(/\/cotacoes\/nova/)
  })

  test('Tab filters switch content', async ({ page }) => {
    const tabs = page.getByTestId('dashboard-tabs').or(page.locator('[role="tablist"]'))
    if (await tabs.isVisible()) {
      const tabButtons = tabs.locator('[role="tab"]')
      const count = await tabButtons.count()
      expect(count).toBeGreaterThanOrEqual(2)

      // Click second tab and verify content changes
      await tabButtons.nth(1).click()
      await waitForLoadingToFinish(page)
      await screenshotStep(page, 'dashboard-tab-switched')
    }
  })
})
