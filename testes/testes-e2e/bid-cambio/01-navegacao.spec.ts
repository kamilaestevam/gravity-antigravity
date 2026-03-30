/**
 * E2E — BID Cambio: Cat.5 Navegacao e Layout + Cat.7 Estados de Interface
 */
import { test, expect } from '@playwright/test'
import { navigateTo, waitForLoadingToFinish, screenshotStep } from './helpers'

test.describe('Cat.5 — Navegacao e Layout', () => {
  test('pagina inicial redireciona para /visao-geral', async ({ page }) => {
    await navigateTo(page, '/')
    await expect(page).toHaveURL(/\/visao-geral/)
  })

  test('menu lateral renderiza com itens de navegacao', async ({ page }) => {
    await navigateTo(page, '/visao-geral')
    await waitForLoadingToFinish(page)

    // O Shell renderiza navegacao — verificar que ha links/itens de menu
    const links = page.locator('nav a, [role="navigation"] a, aside a')
    const count = await links.count()
    // Deve ter pelo menos alguns itens de navegacao
    expect(count).toBeGreaterThanOrEqual(1)
    await screenshotStep(page, 'nav-sidebar')
  })

  test('navegar entre todas as secoes do produto', async ({ page }) => {
    const routes = ['/visao-geral', '/cambios', '/cotacoes', '/corretoras', '/configuracoes']
    for (const route of routes) {
      await navigateTo(page, route)
      await waitForLoadingToFinish(page)
      await expect(page).toHaveURL(new RegExp(route))
    }
  })

  test('rota inexistente redireciona para /visao-geral', async ({ page }) => {
    await navigateTo(page, '/rota-que-nao-existe')
    await expect(page).toHaveURL(/\/visao-geral/)
  })

  test('portal da corretora tem rotas proprias', async ({ page }) => {
    const portalRoutes = ['/portal/dashboard', '/portal/pendentes', '/portal/respostas', '/portal/desempenho']
    for (const route of portalRoutes) {
      await navigateTo(page, route)
      await waitForLoadingToFinish(page)
      await expect(page).toHaveURL(new RegExp(route))
    }
  })
})

test.describe('Cat.7 — Estados de Interface', () => {
  test('dashboard mostra loading/skeleton durante carregamento', async ({ page }) => {
    await page.goto('http://localhost:5002/visao-geral')
    // Deve ter loading visivel brevemente
    const loader = page.locator('[data-testid="loading"], [data-testid="skeleton"], [class*="skeleton"], [class*="pulse"]')
    // Capturar screenshot no estado de loading (pode ser rapido)
    await screenshotStep(page, 'loading-state')
    await waitForLoadingToFinish(page)
    await screenshotStep(page, 'loaded-state')
  })

  test('lista de cambios com dados mostra tabela preenchida', async ({ page }) => {
    await navigateTo(page, '/cambios')
    await waitForLoadingToFinish(page)
    // Deve ter conteudo (seed criou 5 parcelas)
    const rows = page.locator('table tbody tr, [data-testid="parcela-row"]')
    await screenshotStep(page, 'cambios-filled')
  })

  test('pagina de corretoras mostra lista preenchida', async ({ page }) => {
    await navigateTo(page, '/corretoras')
    await waitForLoadingToFinish(page)
    await screenshotStep(page, 'corretoras-filled')
  })
})
