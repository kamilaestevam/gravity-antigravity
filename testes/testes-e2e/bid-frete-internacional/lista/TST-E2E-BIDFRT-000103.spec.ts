/**
 * SCAFFOLD — TST-E2E-BIDFRT-000103
 *
 * E2E modal excluir lista com preview (BID Frete Internacional).
 * Plano: testes/testes-e2e/bid-frete-internacional/lista/plano-teste/TST-E2E-BIDFRT-000103.md
 *
 * describe.skip até aprovação do plano pelo dono (skill QA / multi-agente).
 */

import { test, expect } from '../../../playwright.fixtures'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const ROTA_LISTA = '/bid-frete/lista'

test.describe.skip('BID Frete Internacional — Modal excluir lista', () => {
  test('TST-E2E-BIDFRT-000103: preview bloqueados e confirmar exclusão permitida', async ({ page }) => {
    await page.goto(`${BASE_URL}${ROTA_LISTA}`)
    await page.waitForSelector('[aria-label="Lista de Cotações"]', { timeout: 15_000 })

    const checkbox = page.locator('tbody tr input[type="checkbox"]').first()
    if (await checkbox.count() === 0) {
      test.skip(true, 'Sem linhas selecionáveis no ambiente')
    }
    await checkbox.check()

    await page.getByRole('button', { name: /Excluir/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/irreversível/i)).toBeVisible()
  })
})
