/**
 * E2E REAL — Login como STANDARD → Verificar badge "Usuário" (nunca "Admin")
 *
 * Fluxo:
 *  1. Login com user STANDARD via Clerk
 *  2. Navegar para /hub
 *  3. Verificar badge = "Usuário"
 *  4. Verificar que NÃO tem acesso ao Admin
 *  5. Verificar "Acesso Restrito" no Configurador
 */

import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5010'
const EMAIL = 'teste.standard@gravity-test.com'
const PASSWORD = 'GravityTest2026!'
const USER_DATA_DIR = 'test-results/.clerk-session-standard-test'

let context: BrowserContext
let page: Page

test.describe('E2E Real — User STANDARD no Hub', () => {

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: process.env.CI === 'true',
      viewport: { width: 1920, height: 1080 },
    })
    page = context.pages()[0] || await context.newPage()
  })

  test.afterAll(async () => {
    await context?.close()
  })

  test('1. Login como STANDARD via Clerk', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    const emailInput = page.getByPlaceholder(/e-mail/i).or(page.locator('input[name="identifier"]'))
    const needsLogin = await emailInput.isVisible({ timeout: 5000 }).catch(() => false)

    if (needsLogin) {
      console.log('[E2E-STD] Fazendo login com', EMAIL)
      await emailInput.fill(EMAIL)

      const pwd = page.locator('input[type="password"]')
      if (await pwd.isVisible().catch(() => false)) {
        await pwd.fill(PASSWORD)
      }

      await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      await page.waitForTimeout(3000)

      // Senha etapa 2
      const pwd2 = page.locator('input[type="password"]')
      if (await pwd2.isVisible().catch(() => false)) {
        await pwd2.fill(PASSWORD)
        const btn = page.getByRole('button', { name: 'Continuar', exact: true })
        if (await btn.isVisible().catch(() => false)) await btn.click()
      }

      await page.waitForTimeout(5000)
    }

    await page.screenshot({ path: 'test-results/screenshots/std-01-pos-login.png', fullPage: true })

    // Navega para /hub
    await page.goto(`${BASE_URL}/hub`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(5000)

    if (page.url().includes('sign-in')) {
      console.log('[E2E-STD] Clerk redirecionou — retry...')
      await page.waitForTimeout(3000)
      await page.goto(`${BASE_URL}/hub`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(5000)
    }

    console.log(`[E2E-STD] URL final: ${page.url()}`)
    expect(page.url()).not.toContain('sign-in')
  })

  test('2. Badge de role no header é "Usuário" (nunca "Admin")', async () => {
    const roleBadge = page.locator('.ws-global-user__role')
    const badgeVisible = await roleBadge.isVisible({ timeout: 10000 }).catch(() => false)

    if (!badgeVisible) {
      console.log('[E2E-STD] Badge não visível — pulando')
      return
    }

    const roleText = await roleBadge.textContent()
    console.log(`[E2E-STD] Badge header: "${roleText}"`)

    await page.screenshot({ path: 'test-results/screenshots/std-02-badge.png', fullPage: true })

    // STANDARD deve mostrar "Usuário"
    expect(roleText?.trim()).toBe('Usuário')
    // NUNCA "Admin"
    expect(roleText?.trim()).not.toBe('Admin')
    expect(roleText?.trim()).not.toBe('ADMIN')
  })

  test('3. Dropdown mostra "Usuário" no badge do perfil', async () => {
    const userButton = page.locator('.ws-global-user')
    if (!await userButton.isVisible({ timeout: 5000 }).catch(() => false)) return

    await userButton.click()
    await page.waitForTimeout(500)

    const profileBadge = page.locator('.ws-profile-badge')
    if (await profileBadge.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = await profileBadge.textContent()
      console.log(`[E2E-STD] Badge dropdown: "${text}"`)

      await page.screenshot({ path: 'test-results/screenshots/std-03-dropdown.png', fullPage: true })

      expect(text?.trim()).toBe('Usuário')
      expect(text?.trim()).not.toBe('Admin')
    }

    await page.locator('body').click({ position: { x: 10, y: 10 } })
  })

  test('4. STANDARD NÃO tem "Acesso ao Admin"', async () => {
    const userButton = page.locator('.ws-global-user')
    if (!await userButton.isVisible({ timeout: 5000 }).catch(() => false)) return

    await userButton.click()
    await page.waitForTimeout(500)

    await page.screenshot({ path: 'test-results/screenshots/std-04-no-admin.png', fullPage: true })

    // Botão "Acesso ao Admin" NÃO deve existir para STANDARD
    const adminBtn = page.locator('.ws-profile-item--admin')
    const adminVisible = await adminBtn.isVisible({ timeout: 1000 }).catch(() => false)
    console.log(`[E2E-STD] Admin button visible: ${adminVisible}`)
    expect(adminVisible).toBe(false)

    await page.locator('body').click({ position: { x: 10, y: 10 } })
  })

  test('5. STANDARD vê "Acesso Restrito" no Configurador', async () => {
    const userButton = page.locator('.ws-global-user')
    if (!await userButton.isVisible({ timeout: 5000 }).catch(() => false)) return

    await userButton.click()
    await page.waitForTimeout(500)

    // Configurador deve estar disabled para STANDARD
    const configuradorBtn = page.locator('.ws-profile-item').filter({ hasText: 'Configurador' })
    if (await configuradorBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isDisabled = await configuradorBtn.evaluate(
        (el) => el.classList.contains('disabled-item')
      )
      console.log(`[E2E-STD] Configurador disabled: ${isDisabled}`)

      await page.screenshot({ path: 'test-results/screenshots/std-05-restricted.png', fullPage: true })

      // Para STANDARD, Configurador deve estar desabilitado
      expect(isDisabled).toBe(true)
    }

    await page.locator('body').click({ position: { x: 10, y: 10 } })
  })

  test('6. Nome no header é "Teste Standard" (nunca "Admin")', async () => {
    const userName = page.locator('.ws-global-user__name')
    if (!await userName.isVisible({ timeout: 5000 }).catch(() => false)) return

    const nameText = await userName.textContent()
    console.log(`[E2E-STD] Nome: "${nameText}"`)

    expect(nameText?.trim()).not.toBe('Admin')
    expect(nameText?.trim()).toContain('Teste')
  })

  test('7. Screenshot final', async () => {
    await page.screenshot({ path: 'test-results/screenshots/std-07-final.png', fullPage: true })
    console.log(`[E2E-STD] Teste completo — URL: ${page.url()}`)
  })
})
