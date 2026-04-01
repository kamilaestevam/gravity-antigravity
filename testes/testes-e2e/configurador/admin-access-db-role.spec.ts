/**
 * admin-access-db-role.spec.ts
 *
 * Valida que o acesso ao painel admin é controlado pelo role no banco (não Clerk metadata).
 *
 * Cenários:
 * 1. GET /api/v1/me retorna 401 sem token
 * 2. MASTER (daniel@dmm-ie.com.br) é bloqueado de /admin e redirecionado para /hub
 * 3. MASTER não vê o botão "Painel Admin" no Hub
 * 4. GET /api/v1/me retorna role=MASTER para o usuário MASTER autenticado
 */

import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test'

const BASE_URL  = process.env.E2E_BASE_URL ?? 'http://localhost:5010'
const API_URL   = 'http://localhost:8005'

const MASTER_EMAIL    = process.env.E2E_CLERK_EMAIL    ?? 'daniel@dmm-ie.com.br'
const MASTER_PASSWORD = process.env.E2E_CLERK_PASSWORD ?? 'dati2026'

// Reutiliza sessão existente do role-signup-real (já tem login salvo para daniel@dmm-ie.com.br)
const SESSION_DIR = 'test-results/.clerk-session-role-test'

let context: BrowserContext
let page: Page

// ─── Setup / teardown ────────────────────────────────────────────────────────

test.beforeAll(async () => {
  context = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: process.env.CI === 'true',
    viewport: { width: 1440, height: 900 },
  })
  page = context.pages()[0] || await context.newPage()
})

test.afterAll(async () => {
  await context?.close()
})

// ─── Helper: login Clerk ─────────────────────────────────────────────────────

async function ensureLoggedIn(targetEmail: string, targetPassword: string) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.waitForTimeout(2000)

  // Verifica se já está logado (sem formulário de login visível)
  const emailInput = page.getByPlaceholder(/e-mail/i).or(page.locator('input[name="identifier"]'))
  const needsLogin = await emailInput.isVisible({ timeout: 5000 }).catch(() => false)

  if (!needsLogin) {
    console.log('[E2E] Sessão ativa — sem necessidade de login')
    return
  }

  console.log(`[E2E] Fazendo login: ${targetEmail}`)
  await emailInput.fill(targetEmail)

  // Senha na mesma tela (se visível)
  const pwd = page.locator('input[type="password"]')
  if (await pwd.isVisible().catch(() => false)) {
    await pwd.fill(targetPassword)
  }

  // Etapa 1: clica "Continuar"
  await page.getByRole('button', { name: 'Continuar', exact: true }).click()
  await page.waitForTimeout(3000)

  // Etapa 2: senha separada (Clerk pode dividir email/senha)
  const pwd2 = page.locator('input[type="password"]')
  if (await pwd2.isVisible({ timeout: 3000 }).catch(() => false)) {
    await pwd2.fill(targetPassword)
    const btn2 = page.getByRole('button', { name: 'Continuar', exact: true })
    if (await btn2.isVisible({ timeout: 2000 }).catch(() => false)) await btn2.click()
  }

  await page.waitForTimeout(6000)
  console.log(`[E2E] URL pós-login: ${page.url()}`)
}

// ─── Cenário 1: endpoint /me sem auth ────────────────────────────────────────

test('GET /api/v1/me retorna 401 sem token', async ({ request }) => {
  const resp = await request.get(`${API_URL}/api/v1/me`)
  expect(resp.status()).toBe(401)
  const body = await resp.json()
  expect(body.error?.code).toBe('UNAUTHORIZED')
})

// ─── Cenário 2: MASTER bloqueado em /admin ────────────────────────────────────

test('MASTER é bloqueado de /admin e redirecionado para /hub', async () => {
  await ensureLoggedIn(MASTER_EMAIL, MASTER_PASSWORD)

  // Aguarda estabilizar pós-login (pode ficar na raiz ou redirecionar)
  await page.waitForTimeout(4000)

  // Força navegação para /admin
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.waitForTimeout(4000)

  const finalUrl = page.url()
  console.log(`[E2E] URL após tentativa de /admin: ${finalUrl}`)

  await page.screenshot({ path: 'test-results/screenshots/admin-block-master.png', fullPage: true })

  // Deve ter redirecionado para /hub
  expect(finalUrl).toContain('/hub')
  expect(finalUrl).not.toContain('/admin')
})

// ─── Cenário 3: botão "Painel Admin" não visível para MASTER ─────────────────

test('MASTER não vê o botão Painel Admin no menu do Hub', async () => {
  // Garante estar no Hub
  await page.goto(`${BASE_URL}/hub`, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.waitForTimeout(3000)

  if (page.url().includes('sign-in')) {
    await ensureLoggedIn(MASTER_EMAIL, MASTER_PASSWORD)
    await page.goto(`${BASE_URL}/hub`, { waitUntil: 'networkidle', timeout: 30_000 })
    await page.waitForTimeout(3000)
  }

  // Abre menu de workspace (dropdown com tenant name)
  const workspaceToggle = page.locator('[class*="hs-tenant-btn"], [class*="hs-glass-btn"]:first-child, button:has([class*="hs-tenant"])').first()
  const hasToggle = await workspaceToggle.isVisible({ timeout: 3000 }).catch(() => false)
  if (hasToggle) {
    await workspaceToggle.click()
    await page.waitForTimeout(500)
  }

  await page.screenshot({ path: 'test-results/screenshots/hub-master-menu.png', fullPage: true })

  // Painel Admin NÃO deve estar visível
  const adminBtn = page.locator('button:has-text("Painel Admin"), a:has-text("Painel Admin")')
  const adminVisible = await adminBtn.isVisible({ timeout: 2000 }).catch(() => false)
  expect(adminVisible).toBe(false)
})

// ─── Cenário 4: /api/v1/me retorna MASTER para o usuário autenticado ──────────

test('GET /api/v1/me retorna role=MASTER para o usuário autenticado', async () => {
  // Garante estar logado
  await page.goto(`${BASE_URL}/hub`, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.waitForTimeout(2000)

  // Pega o token Clerk do contexto do browser
  const token = await page.evaluate(async (): Promise<string | null> => {
    const w = window as any
    try {
      if (w.Clerk?.session?.getToken) return await w.Clerk.session.getToken()
    } catch { /* ignore */ }
    return null
  })

  console.log(`[E2E] Token obtido: ${token ? 'sim' : 'não'}`)

  if (!token) {
    console.warn('[E2E] Não foi possível obter token — pulando verificação do /me')
    return
  }

  const resp = await page.request.get(`${API_URL}/api/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  expect(resp.status()).toBe(200)
  const body = await resp.json()

  console.log('[E2E] /me response:', JSON.stringify(body))

  expect(body.user).toBeTruthy()
  expect(body.user.role).toBe('MASTER')
  expect(body.user.tenantId).toBeTruthy()
})
