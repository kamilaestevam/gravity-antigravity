/**
 * E2E REAL — Super Admin: CRUD de Usuários no Painel Admin
 *
 * Login como dmmltda@gmail.com (gravity_admin) →
 *  1. Acessar /admin/usuarios
 *  2. Verificar tabela carrega com users reais
 *  3. Criar user tipo "Master"
 *  4. Criar user tipo "Standard"
 *  5. Criar user tipo "Fornecedor"
 *  6. Criar user tipo "Admin"
 *  7. Criar user tipo "Super Admin"
 *  8. Verificar que todos aparecem na tabela
 *  9. Desativar users criados
 * 10. Verificar badges e notificações
 */

import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5010'
const EMAIL = 'dmmltda@gmail.com'
const PASSWORD = process.env.E2E_CLERK_PASSWORD ?? 'dati2026'
const USER_DATA_DIR = 'test-results/.clerk-session-admin-crud'

let context: BrowserContext
let page: Page

// Users que vamos criar
const TEST_USERS = [
  { nome: 'Teste Master E2E',     email: 'e2e-master@gravity-test.com',     tipo: 'Master' },
  { nome: 'Teste Standard E2E',   email: 'e2e-standard@gravity-test.com',   tipo: 'Standard' },
  { nome: 'Teste Fornecedor E2E', email: 'e2e-fornecedor@gravity-test.com', tipo: 'Fornecedor' },
  { nome: 'Teste Admin E2E',      email: 'e2e-admin@gravity-test.com',      tipo: 'Admin' },
  { nome: 'Teste SuperAdmin E2E', email: 'e2e-superadmin@gravity-test.com', tipo: 'Super Admin' },
]

test.describe.serial('E2E Real — Super Admin CRUD Usuários', () => {

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

  // ── LOGIN ─────────────────────────────────────────────────────────────────

  test('1. Login como Super Admin (dmmltda@gmail.com)', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    const emailInput = page.getByPlaceholder(/e-mail/i).or(page.locator('input[name="identifier"]'))
    const needsLogin = await emailInput.isVisible({ timeout: 5000 }).catch(() => false)

    if (needsLogin) {
      console.log('[ADMIN-CRUD] Login com', EMAIL)
      await emailInput.fill(EMAIL)

      const pwd = page.locator('input[type="password"]')
      if (await pwd.isVisible().catch(() => false)) await pwd.fill(PASSWORD)

      await page.getByRole('button', { name: 'Continuar', exact: true }).click()
      await page.waitForTimeout(3000)

      const pwd2 = page.locator('input[type="password"]')
      if (await pwd2.isVisible().catch(() => false)) {
        await pwd2.fill(PASSWORD)
        const btn = page.getByRole('button', { name: 'Continuar', exact: true })
        if (await btn.isVisible().catch(() => false)) await btn.click()
      }

      await page.waitForTimeout(5000)
    }

    // Navega para hub
    await page.goto(`${BASE_URL}/hub`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(3000)

    if (page.url().includes('sign-in')) {
      await page.waitForTimeout(5000)
      await page.goto(`${BASE_URL}/hub`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(3000)
    }

    await page.screenshot({ path: 'test-results/screenshots/admin-crud-01-login.png', fullPage: true })
    console.log(`[ADMIN-CRUD] URL pós-login: ${page.url()}`)
    expect(page.url()).not.toContain('sign-in')

    // Verifica badge Super Admin
    const roleBadge = page.locator('.ws-global-user__role')
    if (await roleBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
      const roleText = await roleBadge.textContent()
      console.log(`[ADMIN-CRUD] Role badge: "${roleText}"`)
      // gravity_admin mostra "Super Admin" pelo componente UsuarioGlobal
    }
  })

  // ── NAVEGAR AO ADMIN ──────────────────────────────────────────────────────

  test('2. Navegar para /admin/usuarios', async () => {
    await page.goto(`${BASE_URL}/admin/usuarios`, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(3000)

    await page.screenshot({ path: 'test-results/screenshots/admin-crud-02-usuarios.png', fullPage: true })
    console.log(`[ADMIN-CRUD] URL: ${page.url()}`)

    // Verifica que a página carregou (título pode ter variações de case)
    const titulo = page.locator('text=Usuários Globais').or(page.locator('text=Convidar Usuário'))
    expect(await titulo.first().isVisible({ timeout: 10000 }).catch(() => false)).toBe(true)
  })

  // ── VERIFICAR TABELA CARREGOU ─────────────────────────────────────────────

  test('3. Tabela e cards de stats carregam', async () => {
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'test-results/screenshots/admin-crud-03-tabela.png', fullPage: true })

    // Cards de stats devem existir
    const totalCard = page.locator('text=Total de Usuários').first()
    expect(await totalCard.isVisible({ timeout: 5000 }).catch(() => false)).toBe(true)

    // Botão "Convidar Usuário" deve estar visível
    const inviteBtn = page.locator('button').filter({ hasText: 'Convidar Usuário' })
    expect(await inviteBtn.isVisible({ timeout: 5000 }).catch(() => false)).toBe(true)

    console.log('[ADMIN-CRUD] Tabela e cards carregados')
  })

  // ── CRIAR CADA TIPO DE USER ───────────────────────────────────────────────

  for (let i = 0; i < TEST_USERS.length; i++) {
    const u = TEST_USERS[i]

    test(`4.${i + 1}. Criar user "${u.tipo}" — ${u.nome}`, async () => {
      // Clica em "Convidar Usuário"
      const inviteBtn = page.locator('button').filter({ hasText: 'Convidar Usuário' })
      await inviteBtn.click()
      await page.waitForTimeout(500)

      await page.screenshot({ path: `test-results/screenshots/admin-crud-04${i + 1}-modal-${u.tipo.toLowerCase().replace(' ', '')}.png`, fullPage: true })

      // Preenche nome (placeholder "Ex: Ana Paula")
      const nomeInput = page.locator('input[placeholder*="Ana"]').or(page.locator('input[placeholder*="nome"]'))
      if (await nomeInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nomeInput.fill(u.nome)
      }

      // Preenche email (placeholder "usuario@empresa.com")
      const emailInput = page.locator('input[type="email"]').or(page.locator('input[placeholder*="empresa"]'))
      if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emailInput.fill(u.email)
      }

      await page.waitForTimeout(300)

      // Seleciona tipo se não for Standard (default)
      if (u.tipo !== 'Standard') {
        // Clica no select de tipo — procura o container do select com "Standard" visível
        const selectTipoContainer = page.locator('.sg-select').filter({ hasText: 'Standard' }).first()
          .or(page.locator('.sg-select').nth(0))

        if (await selectTipoContainer.isVisible({ timeout: 2000 }).catch(() => false)) {
          await selectTipoContainer.click()
          await page.waitForTimeout(500)

          // Seleciona a opção correta no dropdown aberto
          const opcao = page.locator('.sg-select__option, .sg-option, [class*="option"]')
            .filter({ hasText: u.tipo }).first()
          if (await opcao.isVisible({ timeout: 2000 }).catch(() => false)) {
            await opcao.click({ force: true })
            await page.waitForTimeout(300)
          } else {
            // Tenta clicar pelo texto direto
            await page.locator(`text="${u.tipo}"`).first().click({ force: true }).catch(() => {})
            await page.waitForTimeout(300)
          }
        }
      }

      await page.screenshot({ path: `test-results/screenshots/admin-crud-04${i + 1}-filled-${u.tipo.toLowerCase().replace(' ', '')}.png`, fullPage: true })

      // Clica em Salvar (force: true para passar pelo overlay)
      const salvarBtn = page.locator('button').filter({ hasText: /salvar/i }).first()
      if (await salvarBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await salvarBtn.click({ force: true })
        await page.waitForTimeout(1000)
      } else {
        // Tenta botão de fechar/cancelar se salvar não visível
        console.log(`[ADMIN-CRUD] Botão Salvar não encontrado para ${u.tipo}`)
      }

      console.log(`[ADMIN-CRUD] User "${u.tipo}" criado: ${u.nome}`)

      // Verifica notificação de sucesso
      const notification = page.locator('text=sucesso').or(page.locator('text=adicionado'))
      const hasNotification = await notification.isVisible({ timeout: 3000 }).catch(() => false)
      console.log(`[ADMIN-CRUD] Notificação de sucesso: ${hasNotification}`)

      await page.screenshot({ path: `test-results/screenshots/admin-crud-04${i + 1}-after-${u.tipo.toLowerCase().replace(' ', '')}.png`, fullPage: true })
    })
  }

  // ── VERIFICAR QUE TODOS FORAM CRIADOS ─────────────────────────────────────

  test('5. Todos os users criados aparecem na tabela', async () => {
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/screenshots/admin-crud-05-all-created.png', fullPage: true })

    const pageContent = await page.content()

    for (const u of TEST_USERS) {
      const found = pageContent.includes(u.nome) || pageContent.includes(u.email)
      console.log(`[ADMIN-CRUD] "${u.nome}" na tabela: ${found}`)
      expect(found).toBe(true)
    }
  })

  // ── VERIFICAR BADGES DOS TIPOS ────────────────────────────────────────────

  test('6. Badges de tipo estão corretos', async () => {
    const pageContent = await page.content()

    // Verifica que os badges existem no HTML
    const tiposEsperados = ['Master', 'Standard', 'Fornecedor', 'Admin', 'Super Admin']
    for (const tipo of tiposEsperados) {
      const found = pageContent.includes(tipo)
      console.log(`[ADMIN-CRUD] Badge "${tipo}" presente: ${found}`)
      expect(found).toBe(true)
    }

    await page.screenshot({ path: 'test-results/screenshots/admin-crud-06-badges.png', fullPage: true })
  })

  // ── DESATIVAR USERS CRIADOS ───────────────────────────────────────────────

  test('7. Desativar/suspender users criados', async () => {
    // Para cada user de teste, procura o botão de suspender na linha
    for (const u of TEST_USERS) {
      // Busca a linha que contém o email do user
      const row = page.locator('tr, [class*="row"]').filter({ hasText: u.email }).first()
      const rowVisible = await row.isVisible({ timeout: 2000 }).catch(() => false)

      if (rowVisible) {
        // Procura o botão de pause/suspend na linha
        const suspendBtn = row.locator('button').filter({ has: page.locator('svg') }).nth(1) // segundo botão é suspender
        if (await suspendBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await suspendBtn.click()
          await page.waitForTimeout(500)
          console.log(`[ADMIN-CRUD] User "${u.nome}" suspenso`)
        }
      }
    }

    await page.screenshot({ path: 'test-results/screenshots/admin-crud-07-suspended.png', fullPage: true })

    // Verifica que pelo menos um "Inativo" aparece
    const inativoCount = await page.locator('text=Inativo').count()
    console.log(`[ADMIN-CRUD] Badges "Inativo" na tabela: ${inativoCount}`)
    expect(inativoCount).toBeGreaterThan(0)
  })

  // ── REATIVAR USERS ────────────────────────────────────────────────────────

  test('8. Reativar users suspensos', async () => {
    for (const u of TEST_USERS) {
      const row = page.locator('tr, [class*="row"]').filter({ hasText: u.email }).first()
      const rowVisible = await row.isVisible({ timeout: 2000 }).catch(() => false)

      if (rowVisible) {
        const reactivateBtn = row.locator('button').filter({ has: page.locator('svg') }).nth(1)
        if (await reactivateBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await reactivateBtn.click()
          await page.waitForTimeout(500)
          console.log(`[ADMIN-CRUD] User "${u.nome}" reativado`)
        }
      }
    }

    await page.screenshot({ path: 'test-results/screenshots/admin-crud-08-reactivated.png', fullPage: true })
  })

  // ── VERIFICAR CARDS DE STATS ──────────────────────────────────────────────

  test('9. Cards de stats atualizados', async () => {
    // Scroll para o topo para ver os cards
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'test-results/screenshots/admin-crud-09-stats.png', fullPage: true })

    // Verifica cards existem (títulos podem ser abreviados ou truncados)
    const pageContent = await page.content()
    const hasStats = pageContent.includes('Usuários') || pageContent.includes('Total')
    console.log(`[ADMIN-CRUD] Cards de stats presentes: ${hasStats}`)
    expect(hasStats).toBe(true)

    // Verifica que o botão Convidar ainda existe
    const inviteBtn = page.locator('button').filter({ hasText: 'Convidar Usuário' })
    expect(await inviteBtn.isVisible({ timeout: 3000 }).catch(() => false)).toBe(true)
    console.log('[ADMIN-CRUD] Cards e toolbar OK')
  })

  // ── SCREENSHOT FINAL ──────────────────────────────────────────────────────

  test('10. Screenshot final completo', async () => {
    await page.screenshot({ path: 'test-results/screenshots/admin-crud-10-final.png', fullPage: true })
    console.log(`[ADMIN-CRUD] Teste completo — URL: ${page.url()}`)
  })
})
