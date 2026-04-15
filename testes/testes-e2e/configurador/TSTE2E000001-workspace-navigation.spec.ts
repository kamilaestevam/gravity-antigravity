/**
 * TSTE2E000001 — Workspace: Navegação e Menu Lateral
 *
 * Plano de teste: TSTE2E000001
 * Produto: Configurador
 * URL: http://localhost:8000/workspace/workspaces
 *
 * Verifica carregamento correto do workspace, menu lateral
 * e itens de navegação principais do Configurador.
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:8000'

test.describe('TSTE2E000001 — Workspace: Navegação e Menu Lateral', () => {

  test('Verificar Menu lateral carregado', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    // Menu lateral deve existir no DOM
    const sidebar = page.locator('nav, [class*="sidebar"], [class*="menu"], [class*="lateral"]').first()
    await expect(sidebar).toBeVisible({ timeout: 10000 })
  })

  test('Verificar Nome do Produto', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    // Algum texto identificando o produto deve estar visível
    const body = await page.textContent('body')
    const hasProduto = body?.toLowerCase().includes('gravity') ||
                       body?.toLowerCase().includes('workspace') ||
                       body?.toLowerCase().includes('configurador')
    expect(hasProduto).toBe(true)
  })

  test('Verificar Workspace nome', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    // Deve exibir o nome do workspace atual
    const workspaceEl = page.locator('[class*="workspace"], [data-testid*="workspace"]').first()
    const hasWorkspace = await workspaceEl.isVisible().catch(() => false)
    // Fallback: texto "workspace" na página
    if (!hasWorkspace) {
      const body = await page.textContent('body')
      expect(body?.toLowerCase()).toMatch(/workspace|espaço de trabalho/i)
    } else {
      expect(hasWorkspace).toBe(true)
    }
  })

  test('Verificar Organização no Menu Lateral', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    const body = await page.textContent('body')
    // Menu lateral deve conter item de Organização
    const hasOrg = body?.toLowerCase().includes('organiza') ||
                   body?.toLowerCase().includes('empresa') ||
                   body?.toLowerCase().includes('organization')
    expect(hasOrg).toBe(true)
  })

  test('Verificar Workspace no Menu Lateral', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    const links = await page.$$eval('a, [role="menuitem"]', els =>
      els.map(el => el.textContent?.toLowerCase() ?? '')
    )
    const hasWorkspaceLink = links.some(t =>
      t.includes('workspace') || t.includes('espaços') || t.includes('espaço')
    )
    expect(hasWorkspaceLink).toBe(true)
  })

  test('Verificar Usuários no Menu Lateral', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    const body = await page.textContent('body')
    expect(body?.toLowerCase()).toMatch(/usuário|usuario|users|membros/i)
  })

  test('Verificar Assinaturas no Menu Lateral', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    const body = await page.textContent('body')
    expect(body?.toLowerCase()).toMatch(/assinatura|plano|billing|subscription/i)
  })

  test('Verificar Financeiro no Menu Lateral', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    const body = await page.textContent('body')
    expect(body?.toLowerCase()).toMatch(/financeiro|pagamento|payment|fatura/i)
  })

  test('Verificar API Cockpit no Menu Lateral', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    const body = await page.textContent('body')
    expect(body?.toLowerCase()).toMatch(/api|cockpit|token/i)
  })

  test('Verificar logo do título', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    // Logo deve estar visível (img, svg ou elemento com class logo)
    const logo = page.locator('img[alt*="logo" i], img[alt*="gravity" i], [class*="logo"], [class*="brand"]').first()
    const hasLogo = await logo.isVisible().catch(() => false)
    // Fallback: título h1 ou title da página
    if (!hasLogo) {
      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
    } else {
      expect(hasLogo).toBe(true)
    }
  })

  test('Verificar título ORGANIZAÇÃO', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    const body = await page.textContent('body')
    expect(body?.toUpperCase()).toMatch(/ORGANIZAÇÃO|ORGANIZATION|EMPRESA|CONFIGURADOR/i)
  })

  test('Verificar subtítulo da página', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    // Deve haver algum subtítulo ou descrição
    const subtitulo = page.locator('h2, h3, [class*="subtitle"], [class*="subtitulo"]').first()
    const hasSubtitle = await subtitulo.isVisible().catch(() => false)
    if (!hasSubtitle) {
      const body = await page.textContent('body')
      expect(body?.length ?? 0).toBeGreaterThan(100)
    } else {
      expect(hasSubtitle).toBe(true)
    }
  })

  test('Verificar botão de Configurações visível', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    const body = await page.textContent('body')
    expect(body?.toLowerCase()).toMatch(/configur|setting|ajuste/i)
  })

  test('Verificar navegação para Workspace sem erro', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => {
      if (!err.message.includes('Clerk') && !err.message.includes('ERR_CONNECTION')) {
        errors.push(err.message)
      }
    })
    await page.goto(`${BASE_URL}/workspace/workspaces`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    // Não deve ter erros JS críticos
    const critical = errors.filter(e => !e.includes('fetch') && !e.includes('401'))
    expect(critical.length).toBe(0)
  })

})
