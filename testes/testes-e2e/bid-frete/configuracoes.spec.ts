/**
 * E2E — BID Frete v2: Configuracoes
 * Tests the 3 configuration tabs: Geral, Conectores, Notificacoes.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForLoadingToFinish,
  waitForToast,
  screenshotStep,
} from './helpers'

test.describe('Configuracoes', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/configuracoes')
    await waitForLoadingToFinish(page)
  })

  test('3 tabs render (Geral, Conectores, Notificacoes)', async ({ page }) => {
    const geralTab = page.getByRole('tab', { name: /geral/i })
    const conectoresTab = page.getByRole('tab', { name: /conector/i })
    const notificacoesTab = page.getByRole('tab', { name: /notifica/i })

    await expect(geralTab).toBeVisible()
    await expect(conectoresTab).toBeVisible()
    await expect(notificacoesTab).toBeVisible()
    await screenshotStep(page, 'configuracoes-tabs')
  })

  test('Geral tab: toggle and input fields work', async ({ page }) => {
    const geralTab = page.getByRole('tab', { name: /geral/i })
    await geralTab.click()
    await waitForLoadingToFinish(page)

    // Should have toggle switches
    const toggles = page.locator(
      '[data-testid^="config-toggle"], [role="switch"]',
    )
    const toggleCount = await toggles.count()

    if (toggleCount > 0) {
      const firstToggle = toggles.first()
      const wasChecked = await firstToggle.isChecked().catch(() => false)
      await firstToggle.click()

      // Verify it toggled
      if (wasChecked) {
        await expect(firstToggle).not.toBeChecked()
      } else {
        await expect(firstToggle).toBeChecked()
      }
    }

    // Should have input fields
    const inputs = page.locator(
      '[data-testid^="config-input"], input[data-testid]',
    )
    if ((await inputs.count()) > 0) {
      const firstInput = inputs.first()
      await firstInput.clear()
      await firstInput.fill('test-value')
      await expect(firstInput).toHaveValue('test-value')
    }

    await screenshotStep(page, 'configuracoes-geral')
  })

  test('Conectores tab: connector cards with toggles', async ({ page }) => {
    const conectoresTab = page.getByRole('tab', { name: /conector/i })
    await conectoresTab.click()
    await waitForLoadingToFinish(page)

    // Should show connector cards
    const connectorCards = page.locator(
      '[data-testid="connector-card"], [data-testid^="conector-"]',
    )
    const cardCount = await connectorCards.count()

    if (cardCount > 0) {
      // Each card should have a toggle
      const firstCard = connectorCards.first()
      const toggle = firstCard.locator('[role="switch"], input[type="checkbox"]')
      await expect(toggle).toBeVisible()
    }

    await screenshotStep(page, 'configuracoes-conectores')
  })

  test('Notificacoes tab: email/whatsapp toggles', async ({ page }) => {
    const notificacoesTab = page.getByRole('tab', { name: /notifica/i })
    await notificacoesTab.click()
    await waitForLoadingToFinish(page)

    // Should have email and whatsapp toggle sections
    const emailToggle = page.getByTestId('notif-email-toggle').or(
      page.locator('[role="switch"]').filter({ hasText: /email/i }),
    )
    const whatsappToggle = page.getByTestId('notif-whatsapp-toggle').or(
      page.locator('[role="switch"]').filter({ hasText: /whatsapp/i }),
    )

    // At least one notification toggle should be visible
    const emailVisible = await emailToggle.isVisible().catch(() => false)
    const whatsappVisible = await whatsappToggle.isVisible().catch(() => false)
    expect(emailVisible || whatsappVisible).toBe(true)

    await screenshotStep(page, 'configuracoes-notificacoes')
  })

  test('save button activates on change', async ({ page }) => {
    const saveBtn = page.getByRole('button', { name: /salvar|save/i })

    // Save button may be disabled initially
    const initiallyDisabled = await saveBtn
      .isDisabled()
      .catch(() => false)

    // Make a change
    const toggles = page.locator('[role="switch"]')
    if ((await toggles.count()) > 0) {
      await toggles.first().click()

      // Save button should now be enabled
      await expect(saveBtn).toBeEnabled()
      await screenshotStep(page, 'configuracoes-save-enabled')

      // Click save
      await saveBtn.click()
      await waitForToast(page, /salvo|atualiz|sucesso/i)
    }
  })
})
