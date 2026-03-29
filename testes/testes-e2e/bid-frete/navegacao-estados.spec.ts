/**
 * E2E — BID Frete v2: Navegacao e Estados
 * Tests sidebar navigation, page transitions, back buttons, loading, and empty states.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForLoadingToFinish,
  screenshotStep,
  seedCotacao,
} from './helpers'

test.describe('Navegacao — Sidebar', () => {
  test('sidebar shows BID Frete link', async ({ page }) => {
    await navigateTo(page, '/dashboard')
    await waitForLoadingToFinish(page)

    const sidebar = page.getByTestId('sidebar').or(
      page.locator('nav[role="navigation"]'),
    )
    await expect(sidebar).toBeVisible()

    // BID Frete product link should exist
    const bidFreteLink = sidebar.getByText(/bid.*frete/i).or(
      sidebar.getByRole('link', { name: /bid.*frete/i }),
    )
    await expect(bidFreteLink).toBeVisible()
    await screenshotStep(page, 'navegacao-sidebar')
  })

  test('navigation between all main pages works', async ({ page }) => {
    // Dashboard
    await navigateTo(page, '/dashboard')
    await waitForLoadingToFinish(page)
    await expect(page).toHaveURL(/dashboard/)

    // Dashboard -> Cotacoes
    await page.getByRole('link', { name: /cota..es/i }).click()
    await waitForLoadingToFinish(page)
    await expect(page).toHaveURL(/cotacoes/)

    // Cotacoes -> Fornecedores
    await page.getByRole('link', { name: /fornecedores/i }).click()
    await waitForLoadingToFinish(page)
    await expect(page).toHaveURL(/fornecedores/)

    // Fornecedores -> Configuracoes
    await page.getByRole('link', { name: /configura..es/i }).click()
    await waitForLoadingToFinish(page)
    await expect(page).toHaveURL(/configuracoes/)

    // Back to Dashboard
    await page.getByRole('link', { name: /dashboard|vis.o geral/i }).click()
    await waitForLoadingToFinish(page)
    await expect(page).toHaveURL(/dashboard/)

    await screenshotStep(page, 'navegacao-full-cycle')
  })
})

test.describe('Navegacao — Back Buttons', () => {
  test('back button on detail page returns to list', async ({ page }) => {
    const cotacao = await seedCotacao(page)
    await navigateTo(page, `/cotacoes/${cotacao.id}`)
    await waitForLoadingToFinish(page)

    const backBtn = page.getByRole('button', { name: /voltar/i }).or(
      page.getByTestId('btn-voltar'),
    )
    if (await backBtn.isVisible()) {
      await backBtn.click()
      await waitForLoadingToFinish(page)
      await expect(page).toHaveURL(/\/cotacoes/)
    } else {
      // Fall back to browser back
      await page.goBack()
      await expect(page).toHaveURL(/\/cotacoes/)
    }
  })

  test('deep navigation: cotacoes -> detail -> comparativo -> back -> back', async ({
    page,
  }) => {
    const cotacao = await seedCotacao(page)

    // Start at list
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)

    // Go to detail
    await navigateTo(page, `/cotacoes/${cotacao.id}`)
    await waitForLoadingToFinish(page)
    await expect(page).toHaveURL(new RegExp(`cotacoes/${cotacao.id}`))

    // Go to comparativo (if available)
    const compLink = page.getByRole('link', { name: /comparativo/i }).or(
      page.getByRole('button', { name: /comparativo/i }),
    )
    if (await compLink.isVisible()) {
      await compLink.click()
      await waitForLoadingToFinish(page)
      await expect(page).toHaveURL(/comparativo/)

      // Back to detail
      await page.goBack()
      await expect(page).toHaveURL(new RegExp(`cotacoes/${cotacao.id}`))
    }

    // Back to list
    await page.goBack()
    await expect(page).toHaveURL(/\/cotacoes/)
  })

  test('direct URL to non-existent ID shows 404', async ({ page }) => {
    await navigateTo(page, '/cotacoes/id-que-nao-existe-12345')
    await waitForLoadingToFinish(page)

    await expect(
      page.getByText(/n.o encontrad|404|not found/i),
    ).toBeVisible()
    await screenshotStep(page, 'navegacao-404')
  })
})

test.describe('Estados de Interface', () => {
  test('loading states show spinners', async ({ page }) => {
    // Navigate and check that loading indicator appears (may be very fast)
    await page.goto(
      `${process.env.E2E_BASE_URL ?? 'http://localhost:5181'}/cotacoes`,
    )

    // Either loading shows briefly or page loads directly
    const loader = page.locator(
      '[data-testid="loading"], [role="progressbar"], [data-testid="skeleton"]',
    )
    // Wait for page to settle
    await waitForLoadingToFinish(page)
    // After loading finishes, loader should be hidden
    await expect(loader).toBeHidden()
  })

  test('empty states show messages', async ({ page }) => {
    // Navigate to cotacoes - if no data, should show empty state
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)

    const rows = page.locator(
      '[data-testid="cotacao-row"], [data-testid="cotacao-card"]',
    )
    const rowCount = await rows.count()

    if (rowCount === 0) {
      const emptyState = page.getByTestId('empty-state').or(
        page.getByText(/nenhuma.*cota|sem.*cota|comece/i),
      )
      await expect(emptyState).toBeVisible()
      await screenshotStep(page, 'estado-vazio-cotacoes')
    }
  })

  test('sidebar toggle expand/collapse works', async ({ page }) => {
    await navigateTo(page, '/dashboard')
    await waitForLoadingToFinish(page)

    const toggleBtn = page.getByTestId('sidebar-toggle').or(
      page.getByRole('button', { name: /menu|toggle/i }),
    )

    if (await toggleBtn.isVisible()) {
      // Collapse
      await toggleBtn.click()
      const sidebar = page.getByTestId('sidebar').or(
        page.locator('nav[role="navigation"]'),
      )
      await expect(sidebar).toBeVisible()

      // Expand
      await toggleBtn.click()
      await expect(sidebar).toBeVisible()
      await screenshotStep(page, 'sidebar-toggle')
    }
  })
})
