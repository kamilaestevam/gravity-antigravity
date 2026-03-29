/**
 * E2E — BID Frete v2: Fornecedores
 * Tests the fornecedores list, search, type filter, detail page with 3 tabs.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  seedFornecedor,
  waitForToast,
  waitForLoadingToFinish,
  screenshotStep,
} from './helpers'

test.describe('Fornecedores — List Page', () => {
  test('list page loads with correct columns', async ({ page }) => {
    await seedFornecedor(page)
    await navigateTo(page, '/fornecedores')
    await waitForLoadingToFinish(page)

    await expect(
      page.getByRole('heading', { name: /fornecedores/i }),
    ).toBeVisible()

    const expectedColumns = [/nome/i, /tipo/i, /email/i, /status/i]
    for (const col of expectedColumns) {
      await expect(
        page.getByRole('columnheader', { name: col }),
      ).toBeVisible()
    }
    await screenshotStep(page, 'fornecedores-list')
  })

  test('search filters by name', async ({ page }) => {
    await seedFornecedor(page, { nome: 'Maersk Line E2E' })
    await seedFornecedor(page, { nome: 'DHL Logistics E2E' })

    await navigateTo(page, '/fornecedores')
    await waitForLoadingToFinish(page)

    const searchInput = page.getByTestId('busca-fornecedor').or(
      page.getByPlaceholder(/buscar|pesquisar|search/i),
    )
    await searchInput.fill('Maersk')
    await waitForLoadingToFinish(page)

    const rows = page.locator('[data-testid="fornecedor-row"]')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(/Maersk/i)
    }
    await screenshotStep(page, 'fornecedores-search-result')
  })

  test('type filter dropdown works', async ({ page }) => {
    await seedFornecedor(page, { nome: 'Armador Teste', tipo: 'ARMADOR' })
    await seedFornecedor(page, { nome: 'Agente Teste', tipo: 'AGENTE_CARGA' })

    await navigateTo(page, '/fornecedores')
    await waitForLoadingToFinish(page)

    const filtroTipo = page.getByTestId('filtro-tipo')
    if (await filtroTipo.isVisible()) {
      await filtroTipo.click()
      await page.getByRole('option', { name: /armador/i }).click()
      await waitForLoadingToFinish(page)

      const rows = page.locator('[data-testid="fornecedor-row"]')
      const count = await rows.count()
      expect(count).toBeGreaterThan(0)
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText(/armador/i)
      }
    }
  })

  test('row click navigates to detail', async ({ page }) => {
    const forn = await seedFornecedor(page, { nome: 'ClickTest Forn' })
    await navigateTo(page, '/fornecedores')
    await waitForLoadingToFinish(page)

    await page.getByText('ClickTest Forn').click()
    await waitForLoadingToFinish(page)
    await expect(page).toHaveURL(new RegExp(`fornecedores/${forn.id}`))
  })
})

test.describe('Fornecedores — Detail Page', () => {
  test('detail page shows 3 tabs (Info, Precos, Avaliacoes)', async ({ page }) => {
    const forn = await seedFornecedor(page, { nome: 'Tabs Fornecedor' })
    await navigateTo(page, `/fornecedores/${forn.id}`)
    await waitForLoadingToFinish(page)

    // Verify 3 tabs exist
    const infoTab = page.getByRole('tab', { name: /info|dados|geral/i })
    const precosTab = page.getByRole('tab', { name: /pre.o|tabela/i })
    const avaliacoesTab = page.getByRole('tab', { name: /avalia|rating/i })

    await expect(infoTab).toBeVisible()
    await expect(precosTab).toBeVisible()
    await expect(avaliacoesTab).toBeVisible()
    await screenshotStep(page, 'fornecedor-detail-tabs')
  })

  test('tab switching works', async ({ page }) => {
    const forn = await seedFornecedor(page, { nome: 'Tab Switch Forn' })
    await navigateTo(page, `/fornecedores/${forn.id}`)
    await waitForLoadingToFinish(page)

    // Click Precos tab
    const precosTab = page.getByRole('tab', { name: /pre.o|tabela/i })
    await precosTab.click()
    await waitForLoadingToFinish(page)

    // Should show price table content or empty state
    const priceContent = page.getByTestId('tabela-precos-content').or(
      page.getByText(/tabela.*pre.o|nenhuma.*rota/i),
    )
    await expect(priceContent).toBeVisible()
    await screenshotStep(page, 'fornecedor-tab-precos')

    // Click Avaliacoes tab
    const avaliacoesTab = page.getByRole('tab', { name: /avalia|rating/i })
    await avaliacoesTab.click()
    await waitForLoadingToFinish(page)

    const ratingContent = page.getByTestId('avaliacoes-content').or(
      page.getByText(/avalia|rating|nenhuma.*avalia/i),
    )
    await expect(ratingContent).toBeVisible()
    await screenshotStep(page, 'fornecedor-tab-avaliacoes')
  })
})

test.describe('Fornecedores — CRUD', () => {
  test('create, edit, inactivate, and delete a fornecedor', async ({ page }) => {
    await navigateTo(page, '/fornecedores')

    // Create
    await page.getByRole('button', { name: /novo fornecedor|adicionar/i }).click()
    await page.getByTestId('fornecedor-nome').fill('Fornecedor CRUD Test')
    await page.getByTestId('fornecedor-email').fill(`crud-${Date.now()}@teste.com`)
    await page.getByTestId('fornecedor-tipo').click()
    await page.getByRole('option', { name: /agente/i }).click()
    await page.getByTestId('fornecedor-telefone').fill('+5511999998888')
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    await waitForToast(page, /criad|sucesso/i)
    await screenshotStep(page, 'fornecedor-created')

    // Verify in list
    await navigateTo(page, '/fornecedores')
    await waitForLoadingToFinish(page)
    await expect(page.getByText('Fornecedor CRUD Test')).toBeVisible()

    // Navigate to detail and edit
    await page.getByText('Fornecedor CRUD Test').click()
    await waitForLoadingToFinish(page)
    await page.getByRole('button', { name: /editar/i }).click()
    await page.getByTestId('fornecedor-telefone').fill('+5511888887777')
    await page.getByRole('button', { name: /salvar/i }).click()
    await waitForToast(page, /atualiz|salvo/i)

    // Inactivate
    const statusBtn = page.getByRole('button', { name: /status|inativar/i })
    if (await statusBtn.isVisible()) {
      await statusBtn.click()
      await page.getByRole('option', { name: /inativo/i }).click()
      await waitForToast(page, /inativ|atualiz/i)
    }

    // Delete
    await page.getByRole('button', { name: /deletar|excluir/i }).click()
    await page.getByRole('dialog').getByRole('button', { name: /confirmar|sim/i }).click()
    await waitForToast(page, /deletad|removid/i)
    await screenshotStep(page, 'fornecedor-deleted')
  })

  test('creating fornecedor with duplicate email shows error', async ({ page }) => {
    const email = `dup-${Date.now()}@teste.com`
    await seedFornecedor(page, { email })

    await navigateTo(page, '/fornecedores')
    await page.getByRole('button', { name: /novo fornecedor|adicionar/i }).click()
    await page.getByTestId('fornecedor-nome').fill('Duplicado Test')
    await page.getByTestId('fornecedor-email').fill(email)
    await page.getByTestId('fornecedor-tipo').click()
    await page.getByRole('option', { name: /agente/i }).click()
    await page.getByRole('button', { name: /salvar|criar/i }).click()

    await waitForToast(page, /j. cadastrad|duplicad|conflict/i)
  })
})
