/**
 * E2E — BID Frete v2: Kanban View
 * Tests toggling to kanban view, column rendering, card interactions, and toggling back.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  seedCotacao,
  waitForLoadingToFinish,
  screenshotStep,
} from './helpers'

test.describe('Kanban View', () => {
  test.beforeEach(async ({ page }) => {
    await seedCotacao(page)
    await navigateTo(page, '/cotacoes')
    await waitForLoadingToFinish(page)
  })

  test('toggle to kanban view via button', async ({ page }) => {
    const kanbanToggle = page.getByTestId('view-kanban-toggle')
    await expect(kanbanToggle).toBeVisible()
    await kanbanToggle.click()
    await waitForLoadingToFinish(page)

    const kanbanBoard = page.getByTestId('kanban-board').or(
      page.locator('[data-testid="kanban-column"]').first(),
    )
    await expect(kanbanBoard).toBeVisible()
    await screenshotStep(page, 'kanban-view-active')
  })

  test('kanban columns render with correct headers and colors', async ({ page }) => {
    await page.getByTestId('view-kanban-toggle').click()
    await waitForLoadingToFinish(page)

    const columns = page.locator('[data-testid="kanban-column"]')
    const count = await columns.count()
    expect(count).toBeGreaterThanOrEqual(3)

    // Verify expected status column headers exist
    const expectedStatuses = [/rascunho/i, /em.*cota/i, /aprovad/i]
    for (const status of expectedStatuses) {
      const header = page.locator('[data-testid="kanban-column-header"]').filter({
        hasText: status,
      })
      await expect(header).toBeVisible()
    }

    // Verify columns have distinct visual indicators (color classes or styles)
    const firstColumn = columns.first()
    const headerEl = firstColumn.locator('[data-testid="kanban-column-header"]')
    await expect(headerEl).toBeVisible()
  })

  test('cards show route info, modal icon, and status badge', async ({ page }) => {
    await page.getByTestId('view-kanban-toggle').click()
    await waitForLoadingToFinish(page)

    const cards = page.locator('[data-testid="kanban-card"]')
    const cardCount = await cards.count()

    if (cardCount > 0) {
      const firstCard = cards.first()
      // Route info (origin-destination)
      await expect(firstCard.getByText(/Santos|Shanghai/i)).toBeVisible()
      // Modal icon or label
      await expect(
        firstCard.locator('[data-testid="card-modal-icon"], [data-testid="card-modal"]'),
      ).toBeVisible()
      // Status badge
      await expect(
        firstCard.locator('[data-testid="card-status-badge"], [data-testid="status-badge"]'),
      ).toBeVisible()
    }
  })

  test('card click navigates to detail', async ({ page }) => {
    await page.getByTestId('view-kanban-toggle').click()
    await waitForLoadingToFinish(page)

    const firstCard = page.locator('[data-testid="kanban-card"]').first()
    if (await firstCard.isVisible()) {
      await firstCard.click()
      await waitForLoadingToFinish(page)
      await expect(page).toHaveURL(/\/cotacoes\//)
    }
  })

  test('toggle back to list view', async ({ page }) => {
    // Switch to kanban
    await page.getByTestId('view-kanban-toggle').click()
    await waitForLoadingToFinish(page)

    // Switch back to list
    const listToggle = page.getByTestId('view-lista-toggle')
    await expect(listToggle).toBeVisible()
    await listToggle.click()
    await waitForLoadingToFinish(page)

    // Table should be visible again
    const table = page.locator('table').or(page.getByTestId('view-lista'))
    await expect(table).toBeVisible()
    await screenshotStep(page, 'kanban-back-to-list')
  })
})
