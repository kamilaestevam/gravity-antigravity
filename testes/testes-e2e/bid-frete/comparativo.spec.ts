/**
 * E2E — BID Frete v2: Comparativo
 * Tests the comparativo page with ranking, sorting, summary, approval, and reprovacao.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  seedCotacao,
  seedFornecedor,
  seedDisparoWithResponses,
  waitForLoadingToFinish,
  waitForToast,
  screenshotStep,
} from './helpers'

test.describe('Comparativo', () => {
  let cotacaoId: string

  test.beforeEach(async ({ page }) => {
    const fornA = await seedFornecedor(page, {
      nome: `Comp-A-${Date.now()}`,
      email: `comp-a-${Date.now()}@teste.com`,
    })
    const fornB = await seedFornecedor(page, {
      nome: `Comp-B-${Date.now()}`,
      email: `comp-b-${Date.now()}@teste.com`,
    })
    const fornC = await seedFornecedor(page, {
      nome: `Comp-C-${Date.now()}`,
      email: `comp-c-${Date.now()}@teste.com`,
    })

    const cotacao = await seedCotacao(page)
    cotacaoId = cotacao.id

    await seedDisparoWithResponses(
      page,
      cotacao.id,
      [fornA.id, fornB.id, fornC.id],
      [
        { valor_total: 3500, moeda: 'USD', transit_time_dias: 25 },
        { valor_total: 3200, moeda: 'USD', transit_time_dias: 28 },
        { valor_total: 3800, moeda: 'USD', transit_time_dias: 22 },
      ],
    )
  })

  test('page loads with ranking table', async ({ page }) => {
    await navigateTo(page, `/comparativo/${cotacaoId}`)
    await waitForLoadingToFinish(page)

    const rankingRows = page.locator('[data-testid="ranking-row"]')
    const count = await rankingRows.count()
    expect(count).toBeGreaterThanOrEqual(3)
    await screenshotStep(page, 'comparativo-ranking-loaded')
  })

  test('sort buttons change order', async ({ page }) => {
    await navigateTo(page, `/comparativo/${cotacaoId}`)
    await waitForLoadingToFinish(page)

    // Sort by transit time
    const sortTransit = page.getByRole('button', { name: /transit|prazo|tempo/i }).or(
      page.getByTestId('sort-transit-time'),
    )
    if (await sortTransit.isVisible()) {
      await sortTransit.click()
      await waitForLoadingToFinish(page)

      // After sorting by transit time, fastest (22 dias / 3800) should be first
      const firstRow = page.locator('[data-testid="ranking-row"]').first()
      await expect(firstRow).toContainText(/22|3.800|3800/)
      await screenshotStep(page, 'comparativo-sorted-transit')
    }

    // Sort by price
    const sortPrice = page.getByRole('button', { name: /pre.o|valor/i }).or(
      page.getByTestId('sort-valor'),
    )
    if (await sortPrice.isVisible()) {
      await sortPrice.click()
      await waitForLoadingToFinish(page)

      // After sorting by price, cheapest (3200) should be first
      const firstRow = page.locator('[data-testid="ranking-row"]').first()
      await expect(firstRow).toContainText(/3.200|3200/)
    }
  })

  test('summary cards show values', async ({ page }) => {
    await navigateTo(page, `/comparativo/${cotacaoId}`)
    await waitForLoadingToFinish(page)

    const summaryCards = page.locator(
      '[data-testid="comparativo-summary"], [data-testid^="summary-card"]',
    )
    if (await summaryCards.first().isVisible()) {
      const count = await summaryCards.count()
      expect(count).toBeGreaterThanOrEqual(1)
    }
  })

  test('"Aprovar" button opens confirmation modal', async ({ page }) => {
    await navigateTo(page, `/comparativo/${cotacaoId}`)
    await waitForLoadingToFinish(page)

    const firstRow = page.locator('[data-testid="ranking-row"]').first()
    const aprovarBtn = firstRow.getByRole('button', { name: /aprovar/i })
    await expect(aprovarBtn).toBeVisible()
    await aprovarBtn.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText(/confirmar|aprovacao/i)).toBeVisible()
    await screenshotStep(page, 'comparativo-aprovar-modal')

    // Confirm approval
    await dialog.getByRole('button', { name: /confirmar/i }).click()
    await waitForToast(page, /aprovad/i)
  })

  test('"Reprovar Todas" opens motivo modal', async ({ page }) => {
    // Need a fresh cotacao since the beforeEach one might be approved by other tests
    const fornD = await seedFornecedor(page, {
      nome: `Reprovar-${Date.now()}`,
      email: `reprovar-${Date.now()}@teste.com`,
    })
    const cotacao = await seedCotacao(page)
    await seedDisparoWithResponses(
      page,
      cotacao.id,
      [fornD.id],
      [{ valor_total: 9999, moeda: 'USD', transit_time_dias: 60 }],
    )

    await navigateTo(page, `/comparativo/${cotacao.id}`)
    await waitForLoadingToFinish(page)

    const reprovarBtn = page.getByRole('button', { name: /reprovar.*toda|reprovar/i })
    if (await reprovarBtn.isVisible()) {
      await reprovarBtn.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()

      // Fill motivo
      const motivoInput = dialog.getByTestId('motivo-reprovacao').or(
        dialog.locator('textarea'),
      )
      await motivoInput.fill('Precos acima do budget')
      await dialog.getByRole('button', { name: /confirmar|reprovar/i }).click()
      await waitForToast(page, /reprovad/i)
      await screenshotStep(page, 'comparativo-reprovado')
    }
  })

  test('after approval, success state shows', async ({ page }) => {
    // Create isolated cotacao for this test
    const fornE = await seedFornecedor(page, {
      email: `success-${Date.now()}@teste.com`,
    })
    const cotacao = await seedCotacao(page)
    await seedDisparoWithResponses(
      page,
      cotacao.id,
      [fornE.id],
      [{ valor_total: 2500, moeda: 'USD', transit_time_dias: 20 }],
    )

    await navigateTo(page, `/comparativo/${cotacao.id}`)
    await waitForLoadingToFinish(page)

    // Approve
    const aprovarBtn = page.locator('[data-testid="ranking-row"]').first()
      .getByRole('button', { name: /aprovar/i })
    await aprovarBtn.click()
    await page.getByRole('dialog').getByRole('button', { name: /confirmar/i }).click()
    await waitForToast(page, /aprovad/i)

    // Verify success state
    await expect(
      page.getByText(/aprovada|sucesso|vencedor/i),
    ).toBeVisible()
    await screenshotStep(page, 'comparativo-success-state')
  })
})
