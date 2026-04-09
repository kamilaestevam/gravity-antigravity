import { test, expect } from '@playwright/test'
import path from 'path'

const PRINTS_DIR = path.join(
  process.cwd(),
  'testes/testes-em-tela/produto/pedido/2026-04-09-dashboard-exports'
)

test.describe('Dashboard Pedido — validar exports corrigidos', () => {
  test('dashboard abre sem SyntaxError de exports ausentes @critico', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    page.on('pageerror', err => {
      consoleErrors.push(err.message)
    })

    await page.goto('/pedidos/dashboard')
    await page.waitForTimeout(3000)

    await page.screenshot({
      path: path.join(PRINTS_DIR, '01-dashboard-carregado.png'),
      fullPage: true,
    })

    const exportErrors = consoleErrors.filter(e =>
      e.includes('does not provide an export') ||
      e.includes('SyntaxError') ||
      e.includes('is not a function')
    )

    if (exportErrors.length > 0) {
      await page.screenshot({
        path: path.join(PRINTS_DIR, 'FALHA-export-error.png'),
        fullPage: true,
      })
    }

    expect(exportErrors, `Erros de export encontrados:\n${exportErrors.join('\n')}`).toHaveLength(0)

    // Verificar que algo renderizou (não tela em branco)
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.trim().length, 'Página vazia — nada renderizou').toBeGreaterThan(10)

    await page.screenshot({
      path: path.join(PRINTS_DIR, '02-dashboard-renderizado.png'),
      fullPage: true,
    })
  })
})
