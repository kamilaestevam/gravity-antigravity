/**
 * E2E — Fluxo completo: Login → Workspace → Hub → SimulaCusto
 * Sem verificação de dispositivo (desativada no Clerk Dashboard).
 */
import { test, expect, chromium } from '@playwright/test'

const BASE_URL = 'http://localhost:5000'
const EMAIL = 'daniel@godati.com.br'
const PASSWORD = process.env.E2E_CLERK_PASSWORD ?? 'dati2026'
const USER_DATA_DIR = 'test-results/.clerk-session'

test.describe('Fluxo Completo — Login → Hub → SimulaCusto', () => {
  test('login automático, workspace, hub e SimulaCusto', async () => {
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      viewport: { width: 1920, height: 1080 },
    })
    const page = context.pages()[0] || await context.newPage()

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // === LOGIN ===
    const emailInput = page.getByPlaceholder(/e-mail/i).or(page.locator('input[name="identifier"]'))
    const needsLogin = await emailInput.isVisible({ timeout: 3000 }).catch(() => false)

    if (needsLogin) {
      console.log('[FLOW] Fazendo login...')
      await emailInput.fill(EMAIL)

      // Senha na mesma tela
      const pwd = page.locator('input[type="password"]')
      if (await pwd.isVisible().catch(() => false)) {
        await pwd.fill(PASSWORD)
      }

      await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      await page.waitForTimeout(3000)

      // Senha em etapa 2 (se Clerk separar)
      const pwd2 = page.locator('input[type="password"]')
      if (await pwd2.isVisible().catch(() => false)) {
        await pwd2.fill(PASSWORD)
        const btn = page.getByRole('button', { name: 'Continuar', exact: true })
        if (await btn.isVisible().catch(() => false)) await btn.click()
      }

      await page.waitForTimeout(5000)
      console.log(`[FLOW] Pós-login URL: ${page.url()}`)
    } else {
      console.log('[FLOW] Já logado!')
    }

    await page.screenshot({ path: 'test-results/screenshots/flow-01-pos-login.png', fullPage: true })

    // === WORKSPACE ===
    const isOnWorkspace = await page.getByText(/selecionar workspace/i).isVisible({ timeout: 5000 }).catch(() => false)
    if (isOnWorkspace) {
      console.log('[FLOW] Selecionando Acme Corporation...')
      await page.getByText('Acme Corporation').click()
      await page.waitForTimeout(3000)
    }

    await page.screenshot({ path: 'test-results/screenshots/flow-02-workspace.png', fullPage: true })
    console.log(`[FLOW] URL: ${page.url()}`)

    // === WORKSPACE ===
    await page.screenshot({ path: 'test-results/screenshots/flow-03-workspace.png', fullPage: true })
    console.log(`[FLOW] ✅ Workspace carregado: ${page.url()}`)

    // === SIMULA CUSTO (frontend separado na porta 5180) ===
    console.log('[FLOW] Navegando para SimulaCusto (localhost:5180)...')
    await page.goto('http://localhost:5180/estimativas', { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'test-results/screenshots/flow-04-simula-custo.png', fullPage: true })
    console.log(`[FLOW] SimulaCusto URL: ${page.url()}`)

    await page.screenshot({ path: 'test-results/screenshots/flow-final.png', fullPage: true })
    await context.close()
  })
})
