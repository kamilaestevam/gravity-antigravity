/**
 * TST-E2E-STORE-000070 — Gravity Store
 * Plano: testes/testes-e2e/gravity-store/plano-teste/TST-E2E-STORE-000070.json
 *
 * STATUS: skeleton — executar após aprovação do dono.
 */
import { test, expect } from '@playwright/test'

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'

test.describe('TST-E2E-STORE-000070 — Gravity Store', () => {
  test.skip(true, 'Aguardando aprovação dono + fixture Clerk MASTER (ver plano JSON)')

  test('E2E-STORE-001: /store carrega puzzle e faixas', async ({ page }) => {
    await page.goto(`${BASE}/store`)
    await expect(page.getByRole('tablist')).toBeVisible()
    await expect(page.locator('#store-linha-assinar')).toBeVisible()
    await expect(page.locator('#store-linha-todos')).toBeVisible()
  })

  test('E2E-STORE-002: segmento Assinar faz scroll para seção', async ({ page }) => {
    await page.goto(`${BASE}/store`)
    await page.getByRole('tab', { name: /Assinar/i }).click()
    await expect(page.locator('#store-linha-assinar')).toBeInViewport()
  })

  test('E2E-STORE-004: MASTER contrata produto disponível', async ({ page }) => {
    await page.goto(`${BASE}/store`)
    const btn = page.getByRole('button', { name: /Ativar/i }).first()
    await btn.click()
    await expect(page.getByText(/contratado|Contratado/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
