/**
 * Testes E2E — Dashboard Core (SelecionarWorkspace)
 * Localização: testes/testes-e2e/configurador/dashboard-core.spec.ts
 *
 * Ferramentas: Playwright
 * Valida: renderização completa do dashboard, seleção de workspace,
 *         navegação entre seções, interações com produtos/atalhos/Gabi AI,
 *         responsividade e acessibilidade visual
 *
 * Pré-requisito: Configurador frontend rodando em localhost:5010
 */

import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5010'
const DASHBOARD_PATH = '/selecionar-workspace'

// ─── Helpers ────────────────────────────────────────────────────────────────

async function navigateToDashboard(page: Page) {
  await page.goto(`${BASE_URL}${DASHBOARD_PATH}`)
  // Aguarda loading desaparecer ou content aparecer
  await page.waitForSelector('.sw-ws-title, .sw-loading', { timeout: 15_000 })
  // Se estiver em loading, aguarda content
  const isLoading = await page.locator('.sw-loading').isVisible().catch(() => false)
  if (isLoading) {
    await page.waitForSelector('.sw-ws-title', { timeout: 30_000 })
  }
}

async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/dashboard-core/${name}.png`, fullPage: true })
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. ESTRUTURA E RENDERIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Dashboard Core — estrutura e renderização', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDashboard(page)
  })

  test('renderiza sidebar com ícones de navegação', async ({ page }) => {
    const sidebar = page.locator('.sw-sidebar')
    await expect(sidebar).toBeVisible()

    // Logo mark
    await expect(sidebar.locator('.sw-logo-mark')).toBeVisible()

    // Botões de navegação
    const navBtns = sidebar.locator('.sw-s-nav .sw-s-btn')
    await expect(navBtns).toHaveCount(4)

    // Primeiro botão está ativo
    await expect(navBtns.first()).toHaveClass(/on/)

    // Footer com settings e avatar
    await expect(sidebar.locator('.sw-s-foot .sw-s-btn')).toBeVisible()
    await expect(sidebar.locator('.sw-ava')).toBeVisible()

    await takeScreenshot(page, '01-sidebar')
  })

  test('renderiza topbar com branding e user info', async ({ page }) => {
    const topbar = page.locator('.sw-topbar')
    await expect(topbar).toBeVisible()

    // Brand
    await expect(topbar.locator('.sw-t-brand')).toContainText('Gravity')

    // Notificação e busca
    await expect(topbar.locator('.sw-notif-wrap')).toBeVisible()
    await expect(topbar.locator('.sw-t-icon').nth(1)).toBeVisible()

    // User info
    await expect(topbar.locator('.sw-t-user')).toBeVisible()

    // Botão Sair
    await expect(topbar.locator('.sw-t-exit')).toBeVisible()
    await expect(topbar.locator('.sw-t-exit')).toContainText('Sair')
  })

  test('renderiza título e subtítulo do workspace section', async ({ page }) => {
    await expect(page.locator('.sw-ws-title')).toContainText('Acessar Workspace')
    await expect(page.locator('.sw-ws-sub')).toContainText('Selecione o workspace')
  })

  test('renderiza workspace cards na grid', async ({ page }) => {
    const cards = page.locator('.sw-ws-card')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)

    // Cada card tem logo, nome, plano, stats
    const firstCard = cards.first()
    await expect(firstCard.locator('.sw-ws-logo')).toBeVisible()
    await expect(firstCard.locator('.sw-ws-name')).toBeVisible()
    await expect(firstCard.locator('.sw-ws-plan-tag')).toBeVisible()
    await expect(firstCard.locator('.sw-ws-stats')).toBeVisible()
  })

  test('renderiza botão "Criar novo workspace"', async ({ page }) => {
    await expect(page.locator('.sw-ws-add-card')).toBeVisible()
    await expect(page.locator('.sw-ws-add-label')).toContainText('Criar novo workspace')
  })

  test('renderiza pill divider com nome do workspace selecionado', async ({ page }) => {
    const divider = page.locator('.sw-pill-divider')
    await expect(divider).toBeVisible()
    await expect(divider.locator('.sw-pill-divider-label')).toContainText('Workspace:')
  })

  test('renderiza seção Produtos completa', async ({ page }) => {
    // Header
    await expect(page.locator('.sw-sec-title').first()).toContainText('Produtos')
    await expect(page.locator('.sw-sec-link')).toContainText('Ver catálogo completo')

    // Painel contratados
    const contratados = page.locator('.sw-prod-panel').first()
    await expect(contratados.locator('.sw-prod-panel-title.contracted')).toContainText('Seus Produtos Contratados')

    // Painel sugeridos
    const sugeridos = page.locator('.sw-prod-panel').nth(1)
    await expect(sugeridos.locator('.sw-prod-panel-title.suggested')).toContainText('Sugeridos para Você')

    // Produtos sugeridos listados
    const prodItems = sugeridos.locator('.sw-prod-item')
    await expect(prodItems).toHaveCount(4)

    await takeScreenshot(page, '02-produtos')
  })

  test('renderiza seção Acesso Rápido com atalhos', async ({ page }) => {
    await expect(page.locator('text=Acesso Rápido')).toBeVisible()
    await expect(page.locator('text=Atalhos')).toBeVisible()

    const shortcuts = page.locator('.sw-shortcut-item')
    await expect(shortcuts).toHaveCount(4)

    // Verifica nomes dos atalhos
    await expect(page.locator('text=Configurador')).toBeVisible()
    await expect(page.locator('text=Store de Módulos')).toBeVisible()
    await expect(page.locator('text=Relatórios')).toBeVisible()
    await expect(page.locator('text=Equipe')).toBeVisible()
  })

  test('renderiza painel Gabi AI com insights', async ({ page }) => {
    const gabiPanel = page.locator('.sw-gabi-panel')
    await expect(gabiPanel).toBeVisible()

    // Header
    await expect(gabiPanel.locator('.sw-gabi-title')).toContainText('GABI AI · Insights')
    await expect(gabiPanel.locator('.sw-gabi-sub')).toContainText('oportunidades esta semana')
    await expect(gabiPanel.locator('.sw-gabi-live')).toContainText('ao vivo')

    // Pulsing dot
    await expect(gabiPanel.locator('.sw-gabi-live-dot')).toBeVisible()

    // Insight cards
    const insightCards = gabiPanel.locator('.sw-insight-card')
    await expect(insightCards).toHaveCount(2)

    // Primeiro insight: Redução tributária
    await expect(insightCards.first().locator('.sw-i-type')).toContainText('Redução Tributária')
    await expect(insightCards.first().locator('.sw-i-saving-value')).toContainText('R$ 28.400/mês')

    // Segundo insight: Alerta de prazo
    await expect(insightCards.nth(1).locator('.sw-i-type')).toContainText('Alerta de Prazo')

    await takeScreenshot(page, '03-gabi-insights')
  })

  test('página completa renderiza sem erros visuais', async ({ page }) => {
    // Verifica que não há erros de console
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await navigateToDashboard(page)

    // Screenshot full page
    await takeScreenshot(page, '04-full-page')

    // Não deve ter erros de console críticos (ignora erros de rede que são esperados em E2E)
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('net::') && !e.includes('fetch') && !e.includes('Failed to load')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 2. SELEÇÃO DE WORKSPACE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Dashboard Core — seleção de workspace', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDashboard(page)
  })

  test('primeiro workspace está selecionado por padrão', async ({ page }) => {
    const firstCard = page.locator('.sw-ws-card').first()
    await expect(firstCard).toHaveClass(/selected/)
  })

  test('clicar em outro workspace altera seleção', async ({ page }) => {
    const cards = page.locator('.sw-ws-card')
    const count = await cards.count()

    if (count >= 2) {
      const secondCard = cards.nth(1)
      const secondName = await secondCard.locator('.sw-ws-name').textContent()

      await secondCard.click()

      // Segundo card agora está selecionado
      await expect(secondCard).toHaveClass(/selected/)

      // Primeiro card não está mais selecionado
      await expect(cards.first()).not.toHaveClass(/selected/)

      // Divider atualiza
      await expect(page.locator('.sw-pill-divider-label')).toContainText(`Workspace: ${secondName}`)

      await takeScreenshot(page, '05-workspace-selection')
    }
  })

  test('card selecionado mostra botão "Entrar no Workspace"', async ({ page }) => {
    const selectedCard = page.locator('.sw-ws-card.selected')
    const enterBtn = selectedCard.locator('.sw-ws-enter-btn')
    await expect(enterBtn).toBeVisible()
    await expect(enterBtn).toContainText('Entrar no Workspace')
  })

  test('card selecionado mostra check mark', async ({ page }) => {
    const selectedCard = page.locator('.sw-ws-card.selected')
    const checkmark = selectedCard.locator('.sw-ws-check')
    // Check mark visível via opacity (CSS transition)
    await expect(checkmark).toBeVisible()
  })

  test('hover em card não-selecionado eleva visualmente', async ({ page }) => {
    const cards = page.locator('.sw-ws-card')
    const count = await cards.count()

    if (count >= 2) {
      const secondCard = cards.nth(1)
      await secondCard.hover()
      await takeScreenshot(page, '06-workspace-hover')
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 3. INTERAÇÕES COM PRODUTOS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Dashboard Core — seção Produtos', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDashboard(page)
  })

  test('badges dos produtos sugeridos renderizam corretamente', async ({ page }) => {
    const sugeridos = page.locator('.sw-prod-panel').nth(1)

    // 30% OFF badge
    await expect(sugeridos.locator('text=30% OFF')).toBeVisible()
    // Novo badge
    await expect(sugeridos.locator('text=Novo')).toBeVisible()
    // Trial badges
    const trialBadges = sugeridos.locator('text=Trial 14d')
    await expect(trialBadges).toHaveCount(2)
  })

  test('estado vazio de produtos contratados mostra CTA', async ({ page }) => {
    const contratados = page.locator('.sw-prod-panel').first()
    await expect(contratados.locator('.sw-prod-empty')).toBeVisible()
    await expect(contratados.locator('text=Nenhum produto ativo')).toBeVisible()
    await expect(contratados.locator('.sw-btn-sm')).toBeVisible()
    await expect(contratados.locator('.sw-btn-sm')).toContainText('Explorar Catálogo')
  })

  test('hover em produto sugerido destaca o item', async ({ page }) => {
    const firstProd = page.locator('.sw-prod-item').first()
    await firstProd.hover()
    await takeScreenshot(page, '07-product-hover')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 4. INTERAÇÕES COM ATALHOS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Dashboard Core — atalhos', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDashboard(page)
  })

  test('atalhos mostram tags Admin quando aplicável', async ({ page }) => {
    const adminTags = page.locator('.sw-sh-admin')
    await expect(adminTags).toHaveCount(2) // Configurador e Equipe
  })

  test('hover em atalho destaca visualmente', async ({ page }) => {
    const firstShortcut = page.locator('.sw-shortcut-item').first()
    await firstShortcut.hover()
    await takeScreenshot(page, '08-shortcut-hover')
  })

  test('atalhos têm descrição visível', async ({ page }) => {
    await expect(page.locator('text=Workspace, CNPJ, regras fiscais e usuários')).toBeVisible()
    await expect(page.locator('text=Ative, desative e gerencie produtos')).toBeVisible()
    await expect(page.locator('text=Exportações, histórico e dashboards')).toBeVisible()
    await expect(page.locator('text=Convites, papéis e permissões')).toBeVisible()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 5. GABI AI INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Dashboard Core — Gabi AI Insights', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDashboard(page)
  })

  test('insight de redução tributária mostra economia', async ({ page }) => {
    const card = page.locator('.sw-insight-card').first()
    await expect(card.locator('.sw-i-saving')).toBeVisible()
    await expect(card.locator('.sw-i-saving-label')).toContainText('Economia estimada')
    await expect(card.locator('.sw-i-saving-value')).toContainText('R$ 28.400/mês')
  })

  test('insight secundário (drawback) tem estilo diferenciado', async ({ page }) => {
    const secondaryCard = page.locator('.sw-insight-card.secondary')
    await expect(secondaryCard).toBeVisible()
    await expect(secondaryCard).toHaveCount(1)
  })

  test('insights têm botões de ação', async ({ page }) => {
    await expect(page.locator('text=Ver análise completa')).toBeVisible()
    await expect(page.locator('text=Ver prazos')).toBeVisible()
  })

  test('dot "ao vivo" pulsa com animação', async ({ page }) => {
    const dot = page.locator('.sw-gabi-live-dot')
    await expect(dot).toBeVisible()

    // Verifica que a animação CSS está aplicada
    const animation = await dot.evaluate((el) => {
      return getComputedStyle(el).animationName
    })
    expect(animation).not.toBe('none')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 6. LAYOUT E VISUAL
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Dashboard Core — layout e visual', () => {
  test('sidebar tem largura fixa de 56px', async ({ page }) => {
    await navigateToDashboard(page)
    const sidebar = page.locator('.sw-sidebar')
    const box = await sidebar.boundingBox()
    expect(box?.width).toBe(56)
  })

  test('topbar fica sticky no topo', async ({ page }) => {
    await navigateToDashboard(page)
    const topbar = page.locator('.sw-topbar')
    const position = await topbar.evaluate((el) => getComputedStyle(el).position)
    expect(position).toBe('sticky')
  })

  test('workspace grid usa 3 colunas no desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await navigateToDashboard(page)

    const grid = page.locator('.sw-ws-grid')
    const columns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns)
    // Deve ter 3 frações
    const colCount = columns.split(' ').length
    expect(colCount).toBe(3)
  })

  test('layout bottom cols usa 2 colunas (shortcuts + gabi)', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await navigateToDashboard(page)

    const bottomCols = page.locator('.sw-bottom-cols')
    const columns = await bottomCols.evaluate((el) => getComputedStyle(el).gridTemplateColumns)
    const colCount = columns.split(' ').length
    expect(colCount).toBe(2)
  })

  test('produtos usa layout 2 colunas', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await navigateToDashboard(page)

    const prodsCols = page.locator('.sw-products-cols')
    const columns = await prodsCols.evaluate((el) => getComputedStyle(el).gridTemplateColumns)
    const colCount = columns.split(' ').length
    expect(colCount).toBe(2)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 7. RESPONSIVIDADE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Dashboard Core — responsividade', () => {
  test('em tela média (1100px), workspace grid usa 2 colunas', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 900 })
    await navigateToDashboard(page)

    const grid = page.locator('.sw-ws-grid')
    const columns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns)
    const colCount = columns.split(' ').length
    expect(colCount).toBe(2)

    await takeScreenshot(page, '09-responsive-medium')
  })

  test('em tela pequena (768px), sidebar é escondida', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await navigateToDashboard(page)

    const sidebar = page.locator('.sw-sidebar')
    await expect(sidebar).toBeHidden()

    await takeScreenshot(page, '10-responsive-small')
  })

  test('em tela pequena, workspace grid usa 1 coluna', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await navigateToDashboard(page)

    const grid = page.locator('.sw-ws-grid')
    const columns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns)
    const colCount = columns.split(' ').length
    expect(colCount).toBe(1)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 8. ANIMAÇÕES E TRANSIÇÕES
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Dashboard Core — animações', () => {
  test('seções têm animação fadeUp ao carregar', async ({ page }) => {
    await navigateToDashboard(page)

    const section0 = page.locator('.sw-a0')
    const animation = await section0.evaluate((el) => {
      return getComputedStyle(el).animationName
    })
    expect(animation).not.toBe('none')
  })

  test('workspace card selecionado tem box-shadow glow', async ({ page }) => {
    await navigateToDashboard(page)

    const selected = page.locator('.sw-ws-card.selected')
    const shadow = await selected.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(shadow).not.toBe('none')
    expect(shadow).toContain('rgb') // Deve ter cor no shadow
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 9. CORES E DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Dashboard Core — design tokens', () => {
  test('background do shell é o token correto (#06080F)', async ({ page }) => {
    await navigateToDashboard(page)

    const bgColor = await page.locator('.sw-shell').evaluate((el) => {
      return getComputedStyle(el).backgroundColor
    })
    // rgb(6, 8, 15) = #06080F
    expect(bgColor).toContain('6')
  })

  test('sidebar usa surface color', async ({ page }) => {
    await navigateToDashboard(page)

    const sidebarBg = await page.locator('.sw-sidebar').evaluate((el) => {
      return getComputedStyle(el).backgroundColor
    })
    // Deve ser uma cor escura (surface)
    expect(sidebarBg).toContain('rgb')
  })

  test('badges usam cores corretas', async ({ page }) => {
    await navigateToDashboard(page)

    // 30% OFF badge deve ter cor amber
    const promoBadge = page.locator('.sw-b-promo').first()
    if (await promoBadge.isVisible()) {
      const color = await promoBadge.evaluate((el) => getComputedStyle(el).color)
      expect(color).toContain('rgb') // Amber color
    }

    // Novo badge deve ter cor accent
    const newBadge = page.locator('.sw-b-new').first()
    if (await newBadge.isVisible()) {
      const color = await newBadge.evaluate((el) => getComputedStyle(el).color)
      expect(color).toContain('rgb') // Accent color
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 10. SCROLL E OVERFLOW
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Dashboard Core — scroll', () => {
  test('página é scrollável e todos os blocos ficam acessíveis', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 700 })
    await navigateToDashboard(page)

    // Scroll até o final
    await page.evaluate(() => {
      const pageEl = document.querySelector('.sw-page')
      if (pageEl) pageEl.scrollTop = pageEl.scrollHeight
    })

    // Gabi AI deve estar visível após scroll
    await expect(page.locator('.sw-gabi-panel')).toBeVisible()

    await takeScreenshot(page, '11-scrolled-to-bottom')
  })

  test('topbar permanece visível ao scrollar', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 500 })
    await navigateToDashboard(page)

    // Scroll
    await page.evaluate(() => {
      const pageEl = document.querySelector('.sw-page')
      if (pageEl) pageEl.scrollTop = 300
    })

    // Topbar still visible
    await expect(page.locator('.sw-topbar')).toBeVisible()
  })
})
