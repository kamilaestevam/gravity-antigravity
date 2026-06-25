/**
 * SCAFFOLD — TST-E2E-BIDFRT-LISTA-001
 *
 * E2E Lista de Cotações — colunas legíveis, hierarquia BID, exportação.
 * Plano: testes/testes-e2e/produto-gravity/bid-frete-internacional/lista/plano-de-testes/lista-e2e.md
 *
 * describe.skip até aprovação do plano pelo dono (skill QA / multi-agente).
 */

import { test, expect } from '../../../../playwright.fixtures'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const ROTA_LISTA = '/bid-frete/lista'

test.describe.skip('BID Frete Internacional — Lista de Cotações', () => {
  test('LST-E01-01: coluna ID não visível; Organização/Usuário/Workspace legíveis', async ({ page }) => {
    await page.goto(`${BASE_URL}${ROTA_LISTA}`)
    await page.waitForSelector('[aria-label="Lista de Cotações"]', { timeout: 15_000 })

    await expect(page.getByRole('columnheader', { name: /^ID$/i })).toHaveCount(0)
    await expect(page.getByRole('columnheader', { name: /Organização/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Workspace/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Usuário/i })).toBeVisible()

    const celulaOrg = page.locator('tbody tr').first().getByRole('cell').filter({ hasText: /^cm[a-z0-9]+$/i })
    await expect(celulaOrg).toHaveCount(0)
  })

  test('LST-E01-02: alternar para Kanban e voltar preserva visão lista', async ({ page }) => {
    await page.goto(`${BASE_URL}${ROTA_LISTA}`)
    await page.getByRole('button', { name: /Kanban/i }).click()
    await page.getByRole('button', { name: /Lista/i }).click()
    await expect(page).toHaveURL(/\/bid-frete\/lista/)
  })

  test('LST-E02-01: linha BID expandível exibe filhas', async ({ page }) => {
    await page.goto(`${BASE_URL}${ROTA_LISTA}`)
    const linhaBid = page.locator('tbody tr').filter({ hasText: /BID ·/ }).first()
    if (await linhaBid.count() === 0) {
      test.skip(true, 'Sem grupo BID no ambiente — pré-condição não atendida')
    }
    await linhaBid.locator('[aria-label*="Expandir"], button').first().click()
    await expect(page.locator('tbody tr').filter({ hasText: /BID-/ })).not.toHaveCount(0)
  })
})
