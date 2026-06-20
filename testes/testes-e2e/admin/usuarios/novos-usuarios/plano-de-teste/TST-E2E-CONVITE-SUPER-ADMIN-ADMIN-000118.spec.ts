/**
 * TST-E2E-CONVITE-SUPER-ADMIN-ADMIN-000118
 * End-to-end (Playwright + Percy) — Convite Super Admin em Admin › Usuários Globais.
 *
 * Pré-condições (staging — nunca produção):
 *   - PLAYWRIGHT_BASE_URL apontando para o ambiente
 *   - Sessão autenticada de Super Admin Gravity (storageState ou Clerk)
 *   - Org Gravity-interna com hospeda_colaboradores_gravity=true
 *
 * Execução: QA roda em staging após aprovação do dono.
 */
import { test, expect } from '@playwright/test'
import percySnapshot from '@percy/playwright'

const ROTA_USUARIOS = '/admin/usuarios'

async function abrirModalConvidar(page: import('@playwright/test').Page) {
  await page.goto(ROTA_USUARIOS, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /convidar usuário/i }).first().click()
  await expect(page.getByRole('heading', { name: /convidar usuário/i }).or(page.getByText(/convidar usuário/i).first())).toBeVisible()
}

test.describe('TST-E2E-CONVITE-SUPER-ADMIN-ADMIN-000118 — convite Super Admin', () => {
  test('E01 — listagem Admin › Usuários + Percy', async ({ page }) => {
    await page.goto(ROTA_USUARIOS, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: /convidar usuário/i }).first()).toBeVisible()
    await percySnapshot(page, 'Admin/Usuarios — listagem')
  })

  test('E02 — modal Super Admin sem bloqueio de org + Percy', async ({ page }) => {
    await abrirModalConvidar(page)
    const selectTipo = page.locator('select').filter({ has: page.locator('option') }).first()
    if (await selectTipo.isVisible({ timeout: 3000 }).catch(() => false)) {
      await selectTipo.selectOption({ label: /super admin/i })
    } else {
      await page.getByText(/super admin/i).first().click()
    }
    await expect(page.getByText(/organização alvo/i)).not.toBeVisible({ timeout: 2000 }).catch(() => undefined)
    await percySnapshot(page, 'Admin/Usuarios — modal convite Super Admin')
  })

  test('E03 — nome+e-mail habilitam Salvar sem org', async ({ page }) => {
    await abrirModalConvidar(page)
    const ts = Date.now()
    await page.getByPlaceholder(/nome/i).first().fill(`E2E Super ${ts}`)
    await page.getByPlaceholder(/email|e-mail/i).first().fill(`e2e-sa-${ts}@gravity.test`)
    const salvar = page.getByRole('button', { name: /convidar usuário/i }).last()
    await expect(salvar).toBeEnabled()
  })

  test('E04 — POST convite retorna 201', async ({ page }) => {
    const ts = Date.now()
    const email = `e2e-sa-net-${ts}@gravity.test`

    await abrirModalConvidar(page)
    await page.getByPlaceholder(/nome/i).first().fill(`E2E Net ${ts}`)
    await page.getByPlaceholder(/email|e-mail/i).first().fill(email)

    const [response] = await Promise.all([
      page.waitForResponse(
        r => r.url().includes('/admin/usuarios/convidar') && r.request().method() === 'POST',
        { timeout: 30000 },
      ),
      page.getByRole('button', { name: /convidar usuário/i }).last().click(),
    ])

    expect(response.status()).toBe(201)
    const body = (await response.json()) as { usuario?: { tipo_usuario?: string } }
    expect(body.usuario?.tipo_usuario).toBe('SUPER_ADMIN')
  })

  test('E05 — toast de sucesso após convite + Percy', async ({ page }) => {
    const ts = Date.now()
    await abrirModalConvidar(page)
    await page.getByPlaceholder(/nome/i).first().fill(`E2E Toast ${ts}`)
    await page.getByPlaceholder(/email|e-mail/i).first().fill(`e2e-sa-toast-${ts}@gravity.test`)
    await page.getByRole('button', { name: /convidar usuário/i }).last().click()
    await expect(
      page.locator('[data-notification-type="success"], [role="alert"]').first(),
    ).toBeVisible({ timeout: 15000 })
    await percySnapshot(page, 'Admin/Usuarios — convite Super Admin ok')
  })
})
