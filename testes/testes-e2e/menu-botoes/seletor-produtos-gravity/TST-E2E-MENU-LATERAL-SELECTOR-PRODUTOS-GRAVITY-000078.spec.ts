/**
 * TST-E2E-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000078 — Processos exibe seletor de produtos (chevron)
 */
import { test, expect } from '../../../../playwright.fixtures'

const BASE = process.env.PLAYWRIGHT_BASE_URL
const REQUER_AUTH = process.env.PLAYWRIGHT_PROCESSO_AUTH === '1'

const URL_PROCESSO_LISTA = '/acesso-processos/lista'

test.describe('TST-E2E-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000078 — Seletor produtos em Processos', () => {
  test.skip(!BASE || !REQUER_AUTH, 'Defina PLAYWRIGHT_BASE_URL e PLAYWRIGHT_PROCESSO_AUTH=1')

  test('botão trocar produto visível na lista de processos', async ({ page }) => {
    await page.goto(`${BASE}${URL_PROCESSO_LISTA}`)
    const btn = page.getByRole('button', { name: /Produto: Processos\. Trocar produto/i })
    await expect(btn).toBeVisible({ timeout: 15_000 })
    await expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  test('dropdown abre e lista Processos marcado', async ({ page }) => {
    await page.goto(`${BASE}${URL_PROCESSO_LISTA}`)
    const btn = page.getByRole('button', { name: /Produto: Processos\. Trocar produto/i })
    await btn.click()
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()
    const processos = listbox.getByRole('option', { name: /^Processos$/i })
    await expect(processos).toHaveAttribute('aria-selected', 'true')
  })
})
