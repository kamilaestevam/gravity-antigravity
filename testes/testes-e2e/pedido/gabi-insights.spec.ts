import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const PRINTS_DIR = path.join(
  process.cwd(),
  'testes/testes-em-tela/produto/pedido/2026-04-09-gabi-insights',
)

test.beforeAll(() => {
  fs.mkdirSync(PRINTS_DIR, { recursive: true })
})

test.describe('GABI Insights — Dashboard Pedido @critico', () => {
  test('widget GABI renderiza na página sem erros de JS', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
    page.on('pageerror',  err => consoleErrors.push(err.message))

    await page.goto('/pedidos/dashboard')
    await page.waitForTimeout(4000)

    await page.screenshot({ path: path.join(PRINTS_DIR, '01-dashboard-carregado.png'), fullPage: true })

    // Sem erros críticos de JS
    const criticalErrors = consoleErrors.filter(e =>
      e.includes('does not provide an export') ||
      e.includes('SyntaxError') ||
      e.includes('is not a function'),
    )
    expect(criticalErrors, `Erros JS: ${criticalErrors.join('\n')}`).toHaveLength(0)

    // Widget GABI existe na página (outer container = dp-gabi-card)
    const gabiWidget = page.locator('.dp-gabi-card').first()
    await expect(gabiWidget).toBeVisible({ timeout: 10_000 })

    await page.screenshot({ path: path.join(PRINTS_DIR, '02-gabi-widget-visivel.png'), fullPage: true })
  })

  test('carrossel de insights tem ao menos 2 cards', async ({ page }) => {
    await page.goto('/pedidos/dashboard')
    await page.waitForTimeout(4000)

    // Scroll até o widget GABI para garantir que está no viewport
    const gabiWidget = page.locator('.dp-gabi-card').first()
    await gabiWidget.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)

    await page.screenshot({ path: path.join(PRINTS_DIR, '03-gabi-scroll.png'), fullPage: false })

    // Track (trilho do carrossel)
    const track = gabiWidget.locator('.dp-gabi-track')
    await expect(track).toBeVisible()

    // Cards de insight dentro do track
    const cards = track.locator('.dp-gabi-insight-card')
    const count = await cards.count()
    expect(count, 'Carrossel deve ter ao menos 2 cards').toBeGreaterThanOrEqual(2)

    await page.screenshot({ path: path.join(PRINTS_DIR, '04-cards-renderizados.png'), fullPage: false })
  })

  test('botões de navegação (dp-gabi-nav-btn) existem e são clicáveis', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })

    await page.goto('/pedidos/dashboard')
    await page.waitForTimeout(4000)

    const gabiWidget = page.locator('.dp-gabi-card').first()
    await gabiWidget.scrollIntoViewIfNeeded()

    const navBtns = gabiWidget.locator('.dp-gabi-nav-btn')
    const btnCount = await navBtns.count()
    expect(btnCount, 'Deve haver 2 botões de navegação (prev e next)').toBe(2)

    await page.screenshot({ path: path.join(PRINTS_DIR, '05-nav-btns-visiveis.png'), fullPage: false })

    // Clicar no botão "next" (segundo)
    await navBtns.nth(1).click()
    await page.waitForTimeout(500)

    await page.screenshot({ path: path.join(PRINTS_DIR, '06-apos-clicar-next.png'), fullPage: false })

    // Nenhum erro de runtime JS após clique (ignora erros de rede/500 — frontend tem fallback)
    const erros = consoleErrors.filter(e =>
      (e.includes('SyntaxError') || e.includes('TypeError') || e.includes('is not a function')) &&
      !e.includes('Failed to load resource'),
    )
    expect(erros, `Erros de runtime JS após clique: ${erros.join('\n')}`).toHaveLength(0)
  })

  test('cada insight card tem tag e texto não-vazios', async ({ page }) => {
    await page.goto('/pedidos/dashboard')
    await page.waitForTimeout(4000)

    const gabiWidget = page.locator('.dp-gabi-card').first()
    await gabiWidget.scrollIntoViewIfNeeded()

    const cards = gabiWidget.locator('.dp-gabi-track .dp-gabi-insight-card')
    const count = await cards.count()

    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = cards.nth(i)
      const tag  = card.locator('.dp-gabi-insight-tag')
      const text = card.locator('.dp-gabi-insight-text')

      await expect(tag).toBeVisible()
      await expect(text).toBeVisible()

      const tagContent  = await tag.textContent()
      const textContent = await text.textContent()

      expect(tagContent?.trim().length,  `Card ${i}: tag vazia`).toBeGreaterThan(0)
      expect(textContent?.trim().length, `Card ${i}: texto vazio`).toBeGreaterThan(0)
    }

    await page.screenshot({ path: path.join(PRINTS_DIR, '07-conteudo-cards.png'), fullPage: false })
  })
})
