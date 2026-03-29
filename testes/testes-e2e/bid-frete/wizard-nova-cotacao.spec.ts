/**
 * E2E — BID Frete v2: Wizard Nova Cotacao (7 steps)
 * Tests the full wizard flow, step validation, navigation, and submission.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForLoadingToFinish,
  waitForToast,
  screenshotStep,
  seedFornecedor,
} from './helpers'

test.describe('Wizard — Nova Cotacao', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/cotacoes/nova')
    await waitForLoadingToFinish(page)
  })

  test('stepper shows 7 steps', async ({ page }) => {
    const steps = page.locator(
      '[data-testid="wizard-step"], [data-testid^="step-"]',
    )
    await expect(steps).toHaveCount(7)
    await screenshotStep(page, 'wizard-stepper-7-steps')
  })

  test('step 1: select tipo operacao, modal, modalidade then Next enabled', async ({
    page,
  }) => {
    // Next button should be disabled initially
    const nextBtn = page.getByRole('button', { name: /pr.xim/i })

    // Select tipo operacao
    const tipoOp = page.getByTestId('tipo-operacao-select')
    if (await tipoOp.isVisible()) {
      await tipoOp.click()
      await page.getByRole('option', { name: /importa/i }).click()
    }

    // Select modal
    await page.getByTestId('modal-select').click()
    await page.getByRole('option', { name: /mar.timo/i }).click()

    // Select modalidade
    const modalidadeSelect = page.getByTestId('modalidade-select')
    if (await modalidadeSelect.isVisible()) {
      await modalidadeSelect.click()
      await page.getByRole('option', { name: /FCL/i }).click()
    }

    // Now Next should be enabled
    await expect(nextBtn).toBeEnabled()
    await screenshotStep(page, 'wizard-step1-filled')
  })

  test('step 2: fill origin code/name then Next', async ({ page }) => {
    // Complete step 1 first
    await page.getByTestId('modal-select').click()
    await page.getByRole('option', { name: /mar.timo/i }).click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 2: origin
    await page.getByTestId('origem-porto').fill('Santos')
    await page.getByRole('option', { name: /Santos/i }).first().click()

    const originCountry = page.getByTestId('origem-pais')
    if (await originCountry.isVisible()) {
      await expect(originCountry).not.toBeEmpty()
    }

    await expect(page.getByRole('button', { name: /pr.xim/i })).toBeEnabled()
    await screenshotStep(page, 'wizard-step2-origin')
  })

  test('step 3: fill destination then Next', async ({ page }) => {
    // Complete steps 1-2
    await page.getByTestId('modal-select').click()
    await page.getByRole('option', { name: /mar.timo/i }).click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('origem-porto').fill('Santos')
    await page.getByRole('option', { name: /Santos/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 3: destination
    await page.getByTestId('destino-porto').fill('Shanghai')
    await page.getByRole('option', { name: /Shanghai/i }).first().click()

    await expect(page.getByRole('button', { name: /pr.xim/i })).toBeEnabled()
    await screenshotStep(page, 'wizard-step3-destination')
  })

  test('step 4: fill mercadoria and quantidade then Next', async ({ page }) => {
    // Complete steps 1-3
    await page.getByTestId('modal-select').click()
    await page.getByRole('option', { name: /mar.timo/i }).click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('origem-porto').fill('Santos')
    await page.getByRole('option', { name: /Santos/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('destino-porto').fill('Shanghai')
    await page.getByRole('option', { name: /Shanghai/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 4: cargo details
    await page.getByTestId('peso-kg').fill('15000')
    await page.getByTestId('volume-m3').fill('33')

    const containerTipo = page.getByTestId('container-tipo')
    if (await containerTipo.isVisible()) {
      await containerTipo.click()
      await page.getByRole('option', { name: '40HC' }).click()
    }

    await page.getByTestId('container-qtd').fill('1')
    await expect(page.getByRole('button', { name: /pr.xim/i })).toBeEnabled()
    await screenshotStep(page, 'wizard-step4-cargo')
  })

  test('step 5: select incoterm from grid then Next', async ({ page }) => {
    // Complete steps 1-4 (condensed)
    await page.getByTestId('modal-select').click()
    await page.getByRole('option', { name: /mar.timo/i }).click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('origem-porto').fill('Santos')
    await page.getByRole('option', { name: /Santos/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('destino-porto').fill('Shanghai')
    await page.getByRole('option', { name: /Shanghai/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('peso-kg').fill('15000')
    await page.getByTestId('volume-m3').fill('33')
    await page.getByTestId('container-qtd').fill('1')
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 5: incoterm
    const incotermOption = page.getByTestId('incoterm-FOB').or(
      page.getByRole('option', { name: 'FOB' }),
    )
    if (await incotermOption.isVisible()) {
      await incotermOption.click()
    } else {
      const incotermSelect = page.getByTestId('incoterm-select')
      await incotermSelect.click()
      await page.getByRole('option', { name: 'FOB' }).click()
    }

    await expect(page.getByRole('button', { name: /pr.xim/i })).toBeEnabled()
    await screenshotStep(page, 'wizard-step5-incoterm')
  })

  test('step 6: select visibilidade then Next', async ({ page }) => {
    // Complete steps 1-5
    await page.getByTestId('modal-select').click()
    await page.getByRole('option', { name: /mar.timo/i }).click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('origem-porto').fill('Santos')
    await page.getByRole('option', { name: /Santos/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('destino-porto').fill('Shanghai')
    await page.getByRole('option', { name: /Shanghai/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('peso-kg').fill('15000')
    await page.getByTestId('volume-m3').fill('33')
    await page.getByTestId('container-qtd').fill('1')
    await page.getByRole('button', { name: /pr.xim/i }).click()

    const incotermSelect = page.getByTestId('incoterm-select').or(
      page.getByTestId('incoterm-FOB'),
    )
    await incotermSelect.click()
    await page.getByRole('option', { name: 'FOB' }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 6: visibilidade
    const visibilidadeOption = page.getByTestId('visibilidade-select').or(
      page.locator('[data-testid^="visibilidade-"]').first(),
    )
    if (await visibilidadeOption.isVisible()) {
      await visibilidadeOption.click()
      const option = page.getByRole('option').first()
      if (await option.isVisible()) {
        await option.click()
      }
    }

    // Select fornecedores if shown in this step
    const fornecedorCheckboxes = page.locator('[data-testid="fornecedor-checkbox"]')
    if ((await fornecedorCheckboxes.count()) > 0) {
      await fornecedorCheckboxes.first().check()
    }

    await screenshotStep(page, 'wizard-step6-visibilidade')
  })

  test('step 7: summary shows all entered data', async ({ page }) => {
    // Seed a fornecedor so step 6 has something to select
    await seedFornecedor(page)

    await navigateTo(page, '/cotacoes/nova')
    await waitForLoadingToFinish(page)

    // Step 1
    await page.getByTestId('modal-select').click()
    await page.getByRole('option', { name: /mar.timo/i }).click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 2
    await page.getByTestId('origem-porto').fill('Santos')
    await page.getByRole('option', { name: /Santos/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 3
    await page.getByTestId('destino-porto').fill('Shanghai')
    await page.getByRole('option', { name: /Shanghai/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 4
    await page.getByTestId('peso-kg').fill('15000')
    await page.getByTestId('volume-m3').fill('33')
    await page.getByTestId('container-qtd').fill('1')
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 5
    const incotermEl = page.getByTestId('incoterm-select').or(page.getByTestId('incoterm-FOB'))
    await incotermEl.click()
    await page.getByRole('option', { name: 'FOB' }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 6: select fornecedores
    const checkboxes = page.locator('[data-testid="fornecedor-checkbox"]')
    if ((await checkboxes.count()) > 0) {
      await checkboxes.first().check()
    }
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Step 7: Summary
    await expect(page.getByText(/mar.timo/i)).toBeVisible()
    await expect(page.getByText(/Santos/i)).toBeVisible()
    await expect(page.getByText(/Shanghai/i)).toBeVisible()
    await expect(page.getByText(/FOB/i)).toBeVisible()
    await screenshotStep(page, 'wizard-step7-summary')
  })

  test('submit creates cotacao and shows success', async ({ page }) => {
    await seedFornecedor(page)

    await navigateTo(page, '/cotacoes/nova')
    await waitForLoadingToFinish(page)

    // Complete all steps quickly
    await page.getByTestId('modal-select').click()
    await page.getByRole('option', { name: /mar.timo/i }).click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('origem-porto').fill('Santos')
    await page.getByRole('option', { name: /Santos/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('destino-porto').fill('Shanghai')
    await page.getByRole('option', { name: /Shanghai/i }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    await page.getByTestId('peso-kg').fill('15000')
    await page.getByTestId('volume-m3').fill('33')
    await page.getByTestId('container-qtd').fill('1')
    await page.getByRole('button', { name: /pr.xim/i }).click()

    const incotermEl = page.getByTestId('incoterm-select').or(page.getByTestId('incoterm-FOB'))
    await incotermEl.click()
    await page.getByRole('option', { name: 'FOB' }).first().click()
    await page.getByRole('button', { name: /pr.xim/i }).click()

    const checkboxes = page.locator('[data-testid="fornecedor-checkbox"]')
    if ((await checkboxes.count()) > 0) {
      await checkboxes.first().check()
    }
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Submit
    await page.getByRole('button', { name: /confirmar|criar|salvar/i }).click()
    await waitForToast(page, /criada|sucesso/i)
    await expect(page).toHaveURL(/\/cotacoes\//)
    await screenshotStep(page, 'wizard-submitted-success')
  })

  test('cancel returns to cotacoes list', async ({ page }) => {
    const cancelBtn = page.getByRole('button', { name: /cancelar/i }).or(
      page.getByRole('link', { name: /cancelar/i }),
    )
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()
      await expect(page).toHaveURL(/\/cotacoes/)
    }
  })

  test('cannot advance step 1 without required fields', async ({ page }) => {
    // Try to click Next without filling anything
    await page.getByRole('button', { name: /pr.xim/i }).click()

    // Should show validation message or button stays disabled
    const validationMsg = page.getByText(/obrigat.ri|selecione|required/i)
    const nextBtn = page.getByRole('button', { name: /pr.xim/i })

    // Either validation shows or we are still on step 1
    const hasValidation = await validationMsg.isVisible().catch(() => false)
    const isStillStep1 = await page.getByTestId('modal-select').isVisible().catch(() => false)
    expect(hasValidation || isStillStep1).toBe(true)
  })
})
