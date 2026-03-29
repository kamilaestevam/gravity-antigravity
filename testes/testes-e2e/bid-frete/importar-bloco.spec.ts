/**
 * E2E — BID Frete v2: Importar em Bloco
 * Tests drag-drop zone, expected columns, file upload, validation, and creation.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  waitForLoadingToFinish,
  waitForToast,
  screenshotStep,
} from './helpers'

test.describe('Importar em Bloco', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/importar-bloco')
    await waitForLoadingToFinish(page)
  })

  test('drag-drop zone is visible', async ({ page }) => {
    const dropZone = page.getByTestId('drop-zone').or(
      page.locator('[data-testid="upload-area"], .dropzone'),
    )
    await expect(dropZone).toBeVisible()
    await screenshotStep(page, 'importar-dropzone')
  })

  test('expected columns are listed', async ({ page }) => {
    const columnsInfo = page.getByTestId('expected-columns').or(
      page.getByText(/colunas.*esperadas|formato|campos/i),
    )
    await expect(columnsInfo).toBeVisible()

    // Verify key columns are mentioned
    const expectedFields = ['modal', 'origem', 'destino', 'incoterm']
    for (const field of expectedFields) {
      await expect(
        page.getByText(new RegExp(field, 'i')),
      ).toBeVisible()
    }
  })

  test('file upload triggers preview', async ({ page }) => {
    // Create a valid CSV buffer
    const csvContent = [
      'tipo_operacao,modal,modalidade,incoterm,origem_porto,destino_porto,peso_kg,volume_m3',
      'IMPORTACAO,MARITIMO,FCL,FOB,Santos,Shanghai,15000,33',
      'IMPORTACAO,AEREO,AEREO_GERAL,CIF,Santos,Miami,500,2',
    ].join('\n')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'cotacoes-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    // Preview should appear
    await waitForLoadingToFinish(page)
    const preview = page.getByTestId('import-preview').or(
      page.locator('table, [data-testid="preview-table"]'),
    )
    await expect(preview).toBeVisible()
    await screenshotStep(page, 'importar-preview')
  })

  test('validation shows OK/Erro badges', async ({ page }) => {
    // CSV with one valid and one invalid row
    const csvContent = [
      'tipo_operacao,modal,modalidade,incoterm,origem_porto,destino_porto,peso_kg,volume_m3',
      'IMPORTACAO,MARITIMO,FCL,FOB,Santos,Shanghai,15000,33',
      'INVALIDO,,,,,,,',
    ].join('\n')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'mixed-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    await waitForLoadingToFinish(page)

    // Should show validation badges (OK for valid, Erro for invalid)
    const okBadge = page.locator(
      '[data-testid="validation-ok"], [data-testid="badge-ok"]',
    ).or(page.getByText(/^OK$/i))
    const erroBadge = page.locator(
      '[data-testid="validation-erro"], [data-testid="badge-erro"]',
    ).or(page.getByText(/erro|inv.lid/i))

    await expect(okBadge.first()).toBeVisible()
    await expect(erroBadge.first()).toBeVisible()
    await screenshotStep(page, 'importar-validation-badges')
  })

  test('create button creates valid rows', async ({ page }) => {
    const csvContent = [
      'tipo_operacao,modal,modalidade,incoterm,origem_porto,destino_porto,peso_kg,volume_m3',
      'IMPORTACAO,MARITIMO,FCL,FOB,Santos,Shanghai,15000,33',
    ].join('\n')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'valid-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    await waitForLoadingToFinish(page)

    // Click create/import button
    const createBtn = page.getByRole('button', { name: /criar|importar|confirmar/i })
    await expect(createBtn).toBeEnabled()
    await createBtn.click()

    await waitForToast(page, /importad|criad|sucesso/i)
    await screenshotStep(page, 'importar-success')
  })

  test('success shows results summary', async ({ page }) => {
    const csvContent = [
      'tipo_operacao,modal,modalidade,incoterm,origem_porto,destino_porto,peso_kg,volume_m3',
      'IMPORTACAO,MARITIMO,FCL,FOB,Santos,Shanghai,15000,33',
      'IMPORTACAO,AEREO,AEREO_GERAL,CIF,Santos,Miami,500,2',
    ].join('\n')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'multi-import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    })

    await waitForLoadingToFinish(page)

    const createBtn = page.getByRole('button', { name: /criar|importar|confirmar/i })
    await createBtn.click()

    // Results summary should show count
    await expect(
      page.getByText(/2.*importad|importad.*2|resultado/i),
    ).toBeVisible()
    await screenshotStep(page, 'importar-results-summary')
  })

  test('invalid file format shows error', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('this is not a valid import file'),
    })

    await expect(
      page.getByText(/formato.*inv.lid|tipo.*arquivo|n.o suportad/i),
    ).toBeVisible()
    await screenshotStep(page, 'importar-invalid-format')
  })

  test('download template button works', async ({ page }) => {
    const downloadBtn = page.getByRole('button', {
      name: /baixar modelo|download template/i,
    })

    if (await downloadBtn.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadBtn.click(),
      ])
      expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|xls)$/i)
    }
  })
})
