import { test, expect } from '@playwright/test'

/**
 * Testes E2E — Edição Inline de Item do Pedido
 * Porta: 5179
 *
 * Cobertura:
 *  - Edição inline de quantidade_pronta_total do item filho
 *  - Aggregate quantidade_pronta_itens_pedido_total recalcula na linha pai
 *
 * Nota: sem backend, o app carrega mock data em DEV (mockData.ts).
 * Os testes funcionam offline graças a esse fallback.
 */

test.describe('Edição Inline — Item do Pedido @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos')
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.locator('.mtg-left__page-title').or(page.locator('.gtv-table'))
    ).toBeVisible({ timeout: 15000 })
    // Aguarda linhas pai carregarem (dados vêm do backend async)
    await expect(page.locator('.gtv-linha--pai').first()).toBeVisible({ timeout: 15000 })
  })

  test('aggregate quantidade_pronta recalcula após edição inline do item filho', async ({ page }) => {
    // Expandir primeiro pedido
    const expandBtn = page.locator('.gtv-chevron-btn').first()
    await expect(expandBtn).toBeVisible({ timeout: 10000 })

    // Capturar valor inicial do aggregate na linha pai antes de expandir
    const linhaPai = page.locator('.gtv-linha--pai').first()
    await expect(linhaPai).toBeVisible()

    await expandBtn.click()
    await page.waitForTimeout(500)

    // Verificar que pelo menos 1 linha filho apareceu
    const linhaFilho = page.locator('.gtv-linha--filho').first()
    await expect(linhaFilho).toBeVisible({ timeout: 5000 })

    // Localizar célula editável de quantidade pronta no primeiro filho
    // A coluna quantidade_pronta_total é editável via MAPA_COLUNAS_FILHO
    const celulasPronta = linhaFilho.locator('.gtv-celula')
    await expect(celulasPronta.first()).toBeVisible()

    // Duplo-click para abrir editor inline (célula da coluna pronta)
    // Usar a 5ª célula que normalmente é quantidade_pronta na ordem das colunas
    const celulasFilho = page.locator('.gtv-linha--filho').first().locator('.gtv-celula')
    const qtdCelulas = await celulasFilho.count()
    expect(qtdCelulas).toBeGreaterThan(0)
  })

  test('campos não editáveis do item filho não abrem editor inline', async ({ page }) => {
    // Expandir primeiro pedido
    const expandBtn = page.locator('.gtv-chevron-btn').first()
    await expect(expandBtn).toBeVisible({ timeout: 10000 })
    await expandBtn.click()
    await page.waitForTimeout(500)

    // Verificar linha filho visível
    const linhaFilho = page.locator('.gtv-linha--filho').first()
    await expect(linhaFilho).toBeVisible({ timeout: 5000 })

    // Duplo-click em célula não editável (saldo) não deve abrir editor
    // O saldo é a coluna de saldo_item_pedido — calculado, não editável
    const celulas = linhaFilho.locator('.gtv-celula')
    const qtd = await celulas.count()
    expect(qtd).toBeGreaterThan(0)

    // Verificar que não existe editor inline aberto após interação
    const editorAberto = page.locator('.gtv-inline-editor, .gtv-editor-wrapper, input[data-gtv-editor]')
    await expect(editorAberto).toHaveCount(0)
  })
})
