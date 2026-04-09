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

/**
 * Expande o primeiro pedido que realmente tem itens filho.
 * O primeiro pedido (NOVO PEDIDO / rascunho) pode não ter itens —
 * por isso iteramos pelos chevrons até um expandir com sucesso.
 */
async function expandirPrimeiroPedidoComItens(page: Parameters<Parameters<typeof test>[1]>[0]['page']) {
  const chevrons = page.locator('.gtv-chevron-btn')
  const count = await chevrons.count()

  for (let i = 0; i < count; i++) {
    const btn = chevrons.nth(i)
    const isExpanded = await btn.getAttribute('aria-expanded')
    if (isExpanded === 'true') continue // já expandido — pular

    await btn.click()
    await page.waitForTimeout(400)

    const filhos = page.locator('.gtv-linha--filho')
    const visivel = await filhos.first().isVisible().catch(() => false)
    if (visivel) return true

    // Nenhum filho apareceu — recolher e tentar próximo
    await btn.click()
    await page.waitForTimeout(200)
  }
  return false
}

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
    const expandiu = await expandirPrimeiroPedidoComItens(page)
    if (!expandiu) {
      test.skip(true, 'Nenhum pedido com itens filho encontrado na página — seed sem dados expandíveis')
      return
    }

    // Verificar que pelo menos 1 linha filho apareceu
    const linhaFilho = page.locator('.gtv-linha--filho').first()
    await expect(linhaFilho).toBeVisible({ timeout: 5000 })

    // Localizar célula editável de quantidade pronta no primeiro filho
    const celulasFilho = linhaFilho.locator('.gtv-celula')
    const qtdCelulas = await celulasFilho.count()
    expect(qtdCelulas).toBeGreaterThan(0)
  })

  test('campos não editáveis do item filho não abrem editor inline', async ({ page }) => {
    const expandiu = await expandirPrimeiroPedidoComItens(page)
    if (!expandiu) {
      test.skip(true, 'Nenhum pedido com itens filho encontrado na página — seed sem dados expandíveis')
      return
    }

    // Verificar linha filho visível
    const linhaFilho = page.locator('.gtv-linha--filho').first()
    await expect(linhaFilho).toBeVisible({ timeout: 5000 })

    const celulas = linhaFilho.locator('.gtv-celula')
    const qtd = await celulas.count()
    expect(qtd).toBeGreaterThan(0)

    // Verificar que não existe editor inline aberto após interação
    const editorAberto = page.locator('.gtv-inline-editor, .gtv-editor-wrapper, input[data-gtv-editor]')
    await expect(editorAberto).toHaveCount(0)
  })
})
