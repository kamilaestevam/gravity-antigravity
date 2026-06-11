/**
 * TST-E2E-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000079 — Troca Pedido ↔ Processos via seletor
 */
import { test, expect } from '../../../../playwright.fixtures'

const BASE = process.env.PLAYWRIGHT_BASE_URL
const REQUER_AUTH = process.env.PLAYWRIGHT_PEDIDO_AUTH === '1'

test.describe('TST-E2E-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-000079 — Navegação seletor produtos', () => {
  test.skip(!BASE || !REQUER_AUTH, 'Defina PLAYWRIGHT_BASE_URL e PLAYWRIGHT_PEDIDO_AUTH=1')

  test('Pedido → Processos via atalho no dropdown', async ({ page }) => {
    await page.goto(`${BASE}/pedido/pedidos/lista`)
    const btn = page.getByRole('button', { name: /Produto: Pedido\. Trocar produto/i })
    await btn.waitFor({ state: 'visible', timeout: 15_000 })
    await btn.click()
    await page.getByRole('option', { name: /^Processos$/i }).click()
    await page.waitForURL(/\/acesso-processos\/lista/, { timeout: 20_000 })
    await expect(page.getByRole('button', { name: /Produto: Processos\. Trocar produto/i })).toBeVisible()
  })

  test('clicar Processos já selecionado não recarrega a página', async ({ page }) => {
    await page.goto(`${BASE}/acesso-processos/lista`)
    const btn = page.getByRole('button', { name: /Produto: Processos\. Trocar produto/i })
    await btn.waitFor({ state: 'visible', timeout: 15_000 })
    await btn.click()
    const processos = page.getByRole('option', { name: /^Processos$/i })
    await expect(processos).toHaveAttribute('aria-selected', 'true')
    const navPromise = page.waitForEvent('framenavigated', { timeout: 2_000 }).catch(() => null)
    await processos.click()
    const nav = await navPromise
    expect(nav).toBeNull()
  })
})
