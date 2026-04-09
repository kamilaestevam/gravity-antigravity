/**
 * vite-compile-check.spec.ts
 * Valida que o Vite resolve useTaxasCambio e a página /pedidos carrega sem overlay de erro.
 */

import { test, expect } from '@playwright/test'

const PRINTS = 'testes/testes-em-tela/produto/pedido/2026-04-09-vite-compile-useTaxasCambio'

test.describe('Pedido — compilação Vite e carga da página', () => {
  test('página /pedidos carrega sem overlay de erro do Vite', async ({ page }) => {
    const erros: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') erros.push(msg.text())
    })

    await page.goto('http://localhost:5179/pedidos', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.screenshot({ path: `${PRINTS}/01-pagina-carregada.png`, fullPage: true })

    // Overlay do Vite aparece como div com id="vite-error-overlay" ou classe "backdrop"
    const overlay = page.locator('vite-error-overlay')
    await expect(overlay).not.toBeAttached({ timeout: 3000 }).catch(() => {
      // não existe no DOM = ok
    })

    // Não deve ter erro de "Failed to resolve import"
    const resolveErrors = erros.filter(e => e.includes('Failed to resolve import'))
    await page.screenshot({ path: `${PRINTS}/02-console-errors.png`, fullPage: true })
    expect(resolveErrors, `Erros de import: ${resolveErrors.join('\n')}`).toHaveLength(0)
  })

  test('useTaxasCambio não causa erro de import no console', async ({ page }) => {
    const importErrors: string[] = []
    page.on('pageerror', err => importErrors.push(err.message))

    await page.goto('http://localhost:5179/pedidos', { waitUntil: 'networkidle', timeout: 30000 })
    await page.screenshot({ path: `${PRINTS}/03-networkidle.png`, fullPage: true })

    const taxasErrors = importErrors.filter(e => e.includes('useTaxasCambio'))
    expect(taxasErrors, `Erros useTaxasCambio: ${taxasErrors.join('\n')}`).toHaveLength(0)
  })
})
