/**
 * TST-E2E-BIDFRT-NOVA-COTACAO-001
 * Cria cotação avulsa (visibilidade Aberta) pelo wizard Nova Cotação.
 * Evidência: screenshot automático via playwright.fixtures (PASS).
 */

import { test, expect, type Page } from '../../../playwright.fixtures'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8000'
const ROTA_NOVA = '/bid-frete/cotacoes/nova'

async function clicarProximo(page: Page) {
  const btn = page.getByRole('button', { name: /^Próximo$|^Proximo$/i })
  await expect(btn).toBeEnabled({ timeout: 15_000 })
  await btn.click()
}

async function selecionarComboboxPorCampo(page: Page, rotuloCampo: RegExp, busca: string, opcao: RegExp) {
  const campo = page.locator('.nc-field').filter({ has: page.locator('.nc-field-label', { hasText: rotuloCampo }) })
  await campo.getByRole('combobox').click()
  const search = page.locator('.sg-busca-input').last()
  if (await search.count()) {
    await search.fill(busca)
  } else {
    await page.keyboard.type(busca)
  }
  await page.getByRole('option', { name: opcao }).first().click()
}

test.describe('TST-E2E-BIDFRT-NOVA-COTACAO-001 — Nova Cotação', () => {
  test('NC-E01-01: wizard Importação Aéreo Aberta cria cotação sem erro 500', async ({ page, failedRequests }) => {
    page.on('dialog', async (dialog) => {
      throw new Error(`Alert inesperado: ${dialog.message()}`)
    })

    await page.goto(`${BASE_URL}${ROTA_NOVA}`)
    await expect(page.getByRole('dialog', { name: /Nova Cotação/i })).toBeVisible({ timeout: 20_000 })

    const dialog = page.getByRole('dialog', { name: /Nova Cotação/i })

    // Step 1 — Modal e Operação
    await dialog.getByRole('button', { name: /Importação/i }).click()
    await dialog.locator('.nc-options-grid-3 .nc-option-btn').nth(1).click()
    await dialog.getByRole('button', { name: /Aéreo Geral/i }).click()
    await clicarProximo(page)

    // Step 2 — Origem e Destino
    await selecionarComboboxPorCampo(page, /AEROPORTO DE EMBARQUE/i, 'EZE', /EZE|Buenos Aires/i)
    await selecionarComboboxPorCampo(page, /AEROPORTO DE DESTINO/i, 'DXB', /DXB|Dubai/i)
    await clicarProximo(page)

    // Step 3 — Carga
    await page.getByPlaceholder(/Peças automotivas|eletrônicos/i).fill('a')
    await clicarProximo(page)

    // Step 4 — Incoterm
    await page.getByRole('button', { name: 'DAP', exact: true }).click()
    await clicarProximo(page)

    // Step 5 — Fornecedores (Aberta)
    await page.getByRole('button', { name: /Aberta — Todos os fornecedores/i }).click()
    await clicarProximo(page)

    // Step 6 — Resumo → Criar
    await expect(page.getByText(/Resumo da Cotação/i)).toBeVisible()
    const criar = page.getByRole('button', { name: /Criar Cotação/i })
    await expect(criar).toBeEnabled()

    const postResponse = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/bid-frete-internacional/cotacoes') &&
        res.request().method() === 'POST',
      { timeout: 30_000 },
    )
    await criar.click()
    const response = await postResponse
    expect(response.status(), 'POST criar cotação deve retornar 201').toBe(201)

    await expect(page.getByText('Cotação criada com sucesso!')).toBeVisible({ timeout: 20_000 })

    const postCotacoes = failedRequests.filter((r) => r.url.includes('/cotacoes') && r.method === 'POST')
    expect(postCotacoes, 'Nenhum POST /cotacoes deve falhar').toHaveLength(0)
  })
})
