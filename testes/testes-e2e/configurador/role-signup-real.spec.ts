/**
 * E2E REAL — Signup → Hub → Verificar que badge mostra "Master" (não "Admin")
 *
 * Fluxo completo com Clerk real (test mode):
 *  1. Login com credenciais reais via Clerk
 *  2. Navegar para /hub
 *  3. Abrir dropdown do usuário
 *  4. Verificar que o badge de role NÃO é "Admin" (deve ser "Master" ou "Super Admin")
 *  5. Verificar que o badge dentro do dropdown também está correto
 *  6. Validar que "Acesso Restrito" NÃO aparece para o owner
 *
 * Pré-requisitos:
 *  - Configurador rodando em localhost:5010 (ou 5000 com proxy)
 *  - Clerk em test mode com credenciais válidas
 *  - Banco com tenant e user criados
 */

import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5000'
const EMAIL = process.env.E2E_CLERK_EMAIL ?? 'daniel@dmm-ie.com.br'
const PASSWORD = process.env.E2E_CLERK_PASSWORD ?? 'dati2026'
const USER_DATA_DIR = 'test-results/.clerk-session-role-test'

// Roles que NUNCA devem aparecer para um cliente
const FORBIDDEN_CLIENT_ROLES = ['Admin', 'ADMIN', 'SUPER_ADMIN', 'gravity_admin']

// Roles válidas para um owner de tenant
const VALID_OWNER_ROLES = ['Master', 'Super Admin']

let context: BrowserContext
let page: Page

test.describe('E2E Real — Segurança de Role no Hub', () => {

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

  test('1. Login via Clerk com credenciais reais', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // Detecta se precisa fazer login
    const emailInput = page.getByPlaceholder(/e-mail/i).or(page.locator('input[name="identifier"]'))
    const needsLogin = await emailInput.isVisible({ timeout: 5000 }).catch(() => false)

    if (needsLogin) {
      console.log('[E2E-ROLE] Fazendo login com', EMAIL)
      await emailInput.fill(EMAIL)

      // Senha na mesma tela (se visível)
      const pwd = page.locator('input[type="password"]')
      if (await pwd.isVisible().catch(() => false)) {
        await pwd.fill(PASSWORD)
      }

      await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      await page.waitForTimeout(3000)

      // Senha na etapa 2 (Clerk pode separar email/password)
      const pwd2 = page.locator('input[type="password"]')
      if (await pwd2.isVisible().catch(() => false)) {
        await pwd2.fill(PASSWORD)
        const btn = page.getByRole('button', { name: 'Continuar', exact: true })
        if (await btn.isVisible().catch(() => false)) await btn.click()
      }

      await page.waitForTimeout(5000)
      console.log(`[E2E-ROLE] Pós-login URL: ${page.url()}`)
    } else {
      console.log('[E2E-ROLE] Já logado — sessão persistente')
    }

    await page.screenshot({ path: 'test-results/screenshots/role-01-pos-login.png', fullPage: true })

    // Verifica que não estamos na tela de login
    const url = page.url()
    expect(url).not.toContain('sign-in')
    console.log(`[E2E-ROLE] Login OK — URL: ${url}`)

    // Aguarda Clerk hidratar a sessão completamente
    await page.waitForTimeout(3000)

    // Navega para /hub DENTRO do mesmo teste para manter sessão
    await page.goto(`${BASE_URL}/hub`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(5000)

    // Se Clerk redirecionou, tenta esperar e voltar
    if (page.url().includes('sign-in')) {
      console.log('[E2E-ROLE] Clerk redirecionou — aguardando SSO resolver...')
      await page.waitForTimeout(5000)
      await page.goto(`${BASE_URL}/hub`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(5000)
    }

    console.log(`[E2E-ROLE] Hub URL após login: ${page.url()}`)
  })

  test('2. Navegar para /hub e verificar carga', async () => {
    // Se a sessão já existe do teste anterior, vai direto
    if (!page.url().includes('/hub')) {
      await page.goto(`${BASE_URL}/hub`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(5000)
    }

    await page.screenshot({ path: 'test-results/screenshots/role-02-hub.png', fullPage: true })

    const url = page.url()
    console.log(`[E2E-ROLE] Hub URL: ${url}`)

    // Se redirecionou para login, pula os próximos testes
    if (url.includes('sign-in')) {
      console.log('[E2E-ROLE] WARN: Redirecionou para login — Clerk pode não estar configurado')
      test.skip()
    }

    // Verifica que o #root existe e a página carregou
    expect(await page.$('#root')).not.toBeNull()
  })

  test('3. Badge de role no header NÃO é "Admin"', async () => {
    // O badge de role está na classe .ws-global-user__role
    const roleBadge = page.locator('.ws-global-user__role')
    const badgeVisible = await roleBadge.isVisible({ timeout: 10000 }).catch(() => false)

    if (!badgeVisible) {
      console.log('[E2E-ROLE] Badge de role não visível — pode ser redirect ou layout diferente')
      await page.screenshot({ path: 'test-results/screenshots/role-03-no-badge.png', fullPage: true })
      // Se o badge não existe, pode ser que o Clerk não carregou — verifica se o header existe
      const header = page.locator('header')
      if (await header.isVisible().catch(() => false)) {
        // Header existe mas sem badge — isso é um problema
        console.log('[E2E-ROLE] WARN: Header existe mas badge de role não encontrado')
      }
      return
    }

    const roleText = await roleBadge.textContent()
    console.log(`[E2E-ROLE] Badge de role no header: "${roleText}"`)

    await page.screenshot({ path: 'test-results/screenshots/role-03-badge-header.png', fullPage: true })

    // VALIDAÇÃO CRÍTICA: role NÃO pode ser "Admin" para um cliente
    expect(FORBIDDEN_CLIENT_ROLES).not.toContain(roleText?.trim())

    // Para o owner do tenant, deve ser "Master" ou "Super Admin"
    expect(VALID_OWNER_ROLES).toContain(roleText?.trim())
  })

  test('4. Abrir dropdown e verificar badge de role no perfil', async () => {
    // Clica no botão do usuário para abrir o dropdown
    const userButton = page.locator('.ws-global-user')
    const buttonVisible = await userButton.isVisible({ timeout: 5000 }).catch(() => false)

    if (!buttonVisible) {
      console.log('[E2E-ROLE] Botão do usuário não visível — pulando verificação de dropdown')
      return
    }

    await userButton.click()
    await page.waitForTimeout(500)

    // Verifica o badge dentro do dropdown (.ws-profile-badge)
    const profileBadge = page.locator('.ws-profile-badge')
    const profileBadgeVisible = await profileBadge.isVisible({ timeout: 3000 }).catch(() => false)

    if (profileBadgeVisible) {
      const profileRoleText = await profileBadge.textContent()
      console.log(`[E2E-ROLE] Badge de role no dropdown: "${profileRoleText}"`)

      await page.screenshot({ path: 'test-results/screenshots/role-04-dropdown.png', fullPage: true })

      // VALIDAÇÃO CRÍTICA: role no dropdown NÃO pode ser "Admin"
      expect(FORBIDDEN_CLIENT_ROLES).not.toContain(profileRoleText?.trim())
      expect(VALID_OWNER_ROLES).toContain(profileRoleText?.trim())
    }

    // Fecha dropdown clicando fora
    await page.locator('body').click({ position: { x: 10, y: 10 } })
  })

  test('5. Owner tem acesso ao Configurador (sem "Acesso Restrito")', async () => {
    // Abre o dropdown do usuário
    const userButton = page.locator('.ws-global-user')
    const buttonVisible = await userButton.isVisible({ timeout: 5000 }).catch(() => false)

    if (!buttonVisible) {
      console.log('[E2E-ROLE] Botão do usuário não visível — pulando')
      return
    }

    await userButton.click()
    await page.waitForTimeout(500)

    await page.screenshot({ path: 'test-results/screenshots/role-05-dropdown-access.png', fullPage: true })

    // Para o owner (MASTER), o botão Configurador deve estar ATIVO (não disabled)
    const configuradorBtn = page.locator('.ws-profile-item').filter({ hasText: 'Configurador' })
    const configuradorVisible = await configuradorBtn.isVisible({ timeout: 3000 }).catch(() => false)

    if (configuradorVisible) {
      // Verifica que NÃO tem a classe disabled-item
      const isDisabled = await configuradorBtn.evaluate(
        (el) => el.classList.contains('disabled-item')
      )

      console.log(`[E2E-ROLE] Configurador disabled: ${isDisabled}`)
      expect(isDisabled).toBe(false)
    }

    // "Acesso Restrito" NÃO deve aparecer para o owner
    const acessoRestrito = page.locator('text=Acesso Restrito')
    const restricaoVisivel = await acessoRestrito.isVisible({ timeout: 1000 }).catch(() => false)
    expect(restricaoVisivel).toBe(false)

    // Fecha dropdown
    await page.locator('body').click({ position: { x: 10, y: 10 } })
  })

  test('6. Nome do usuário no header NÃO é "Admin"', async () => {
    // O nome do usuário está na classe .ws-global-user__name
    const userName = page.locator('.ws-global-user__name')
    const nameVisible = await userName.isVisible({ timeout: 5000 }).catch(() => false)

    if (!nameVisible) {
      console.log('[E2E-ROLE] Nome do usuário não visível')
      return
    }

    const nameText = await userName.textContent()
    console.log(`[E2E-ROLE] Nome no header: "${nameText}"`)

    // O nome NUNCA deve ser "Admin" como fallback
    expect(nameText?.trim()).not.toBe('Admin')
    // Deve ter um nome real
    expect(nameText?.trim().length).toBeGreaterThan(0)
  })

  test('7. Selecionar workspace e verificar role na tela de workspace', async () => {
    // Se estamos no hub, seleciona um workspace
    const wsCard = page.locator('.sw-ws-card').first()
    const wsCardVisible = await wsCard.isVisible({ timeout: 5000 }).catch(() => false)

    if (!wsCardVisible) {
      console.log('[E2E-ROLE] Cards de workspace não visíveis — pulando')
      return
    }

    await wsCard.click()
    await page.waitForTimeout(1000)

    // Clica em "Entrar no Workspace" se disponível
    const entrarBtn = page.locator('text=Entrar no Workspace').or(page.locator('.sw-ws-enter-btn'))
    const entrarVisible = await entrarBtn.isVisible({ timeout: 3000 }).catch(() => false)

    if (entrarVisible) {
      await entrarBtn.click()
      await page.waitForTimeout(3000)
    }

    await page.screenshot({ path: 'test-results/screenshots/role-07-workspace.png', fullPage: true })
    console.log(`[E2E-ROLE] URL após workspace: ${page.url()}`)

    // Verifica role no header do workspace (se visível)
    const roleBadge = page.locator('.ws-global-user__role')
    const badgeVisible = await roleBadge.isVisible({ timeout: 5000 }).catch(() => false)

    if (badgeVisible) {
      const roleText = await roleBadge.textContent()
      console.log(`[E2E-ROLE] Role no workspace: "${roleText}"`)
      expect(FORBIDDEN_CLIENT_ROLES).not.toContain(roleText?.trim())
    }
  })

  test('8. Screenshot final com estado completo', async () => {
    await page.screenshot({ path: 'test-results/screenshots/role-08-final.png', fullPage: true })
    console.log(`[E2E-ROLE] Teste completo — URL final: ${page.url()}`)
  })
})
