/**
 * TST-E2E-LOGIN-000001 — Porteiro SSOT pós-autenticação
 * Plano: testes/testes-e2e/login/plano-teste/TST-E2E-LOGIN-000001.json
 *
 * STATUS: skeleton — executar após aprovação do dono (skill multi-agente Fase 6).
 * Requer: PLAYWRIGHT_BASE_URL, Clerk test user, e-mail descartável para signup.
 */
import { test, expect } from '@playwright/test'

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'

test.describe('TST-E2E-LOGIN-000001 — Porteiro SSOT', () => {
  test.skip(true, 'Aguardando aprovação dono + fixtures Clerk signup (ver plano JSON)')

  test('E2E-001: signup novo → /trial', async ({ page }) => {
    await page.goto(`${BASE}/cadastro`)
    // TODO: preencher SignUpFlow custom + OTP com e-mail fixture
    await expect(page).toHaveURL(/\/trial/)
  })

  test('E2E-003: login existente → /hub', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    // TODO: credenciais fixture cliente com org
    await expect(page).toHaveURL(/\/hub/)
    await expect(page.getByText('Acessar Workspace')).toBeVisible()
  })

  test('E2E-004: /hub sem org → /trial', async ({ page }) => {
    // TODO: sessao Clerk sem usuario Prisma
    await page.goto(`${BASE}/hub`)
    await expect(page).toHaveURL(/\/trial/)
  })
})
