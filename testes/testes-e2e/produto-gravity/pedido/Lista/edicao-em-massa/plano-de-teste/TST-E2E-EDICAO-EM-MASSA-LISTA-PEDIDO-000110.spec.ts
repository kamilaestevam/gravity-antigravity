/**
 * TST-E2E-EDICAO-EM-MASSA-LISTA-PEDIDO-000110 — Edição em Massa (smoke)
 */
import { test, expect } from '../../../../../../playwright.fixtures.js'

const LISTA_URL = `${process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'}/pedido/pedidos/lista`

test.describe('TST-E2E-EDICAO-EM-MASSA-LISTA-PEDIDO-000110', () => {
  test.skip(!process.env.E2E_CLERK_USER_EMAIL, 'Requer E2E_CLERK_USER_EMAIL')

  test('E02: abre modal Edição em Massa com 1 pedido selecionado', async ({ page }) => {
    await page.goto(LISTA_URL, { waitUntil: 'networkidle' })
    const row = page.locator('[data-testid="tabela-pedido-row"]').first()
    await row.locator('[data-testid="checkbox-selecao"]').click()
    await page.getByRole('button', { name: /edição em massa|editar em massa/i }).click()
    await expect(page.getByRole('dialog')).toContainText(/editar em massa/i)
  })
})
