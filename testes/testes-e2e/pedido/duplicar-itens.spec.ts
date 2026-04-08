import { test, expect } from '@playwright/test'

/**
 * Testes E2E — Modal Duplicar Pedidos (produto Pedido)
 * Porta: 5179
 *
 * Cobertura:
 *  - Botão Duplicar desabilitado sem seleção de pedido pai
 *  - Botão habilita ao selecionar um pedido pai
 *  - Modal abre ao clicar Duplicar com pedido selecionado
 *  - Modal exibe estrutura correta (info, tabela, botões)
 *  - confirm() nativo nunca aparece
 *  - Cancelar fecha o modal
 *
 * Nota: sem backend, o app carrega mock data em DEV (mockData.ts).
 * Os testes funcionam offline graças a esse fallback.
 */

test.describe('Duplicar Itens — Modal padrão @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos')
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.locator('.mtg-left__page-title').or(page.locator('.gtv-table'))
    ).toBeVisible({ timeout: 15000 })
    // Aguarda linhas pai para garantir que dados carregaram do backend
    await expect(page.locator('.gtv-linha--pai').first()).toBeVisible({ timeout: 15000 })
  })

  test('botão Duplicar está desabilitado sem seleção', async ({ page }) => {
    const btnDuplicar = page.getByRole('button', { name: 'Duplicar' })
    await expect(btnDuplicar).toBeVisible({ timeout: 10000 })
    await expect(btnDuplicar).toBeDisabled()
  })

  test('confirm() nativo NÃO aparece ao duplicar item', async ({ page }) => {
    let dialogNativoApareceu = false
    page.on('dialog', () => { dialogNativoApareceu = true })

    // Selecionar primeiro pedido pai via checkbox
    const paiCheckbox = page.locator('.gtv-linha--pai input[type="checkbox"]').first()
    await expect(paiCheckbox).toBeVisible({ timeout: 10000 })
    await paiCheckbox.evaluate(el => (el as HTMLInputElement).click())
    await page.waitForTimeout(200)

    // Clicar Duplicar (agora habilitado)
    const btnDuplicar = page.getByRole('button', { name: 'Duplicar' })
    await expect(btnDuplicar).toBeEnabled({ timeout: 5000 })
    await btnDuplicar.click()
    await page.waitForTimeout(500)

    expect(dialogNativoApareceu).toBe(false)

    // Fechar modal se abriu
    const fechar = page.locator('[role="dialog"] button[aria-label="Fechar modal"]')
    if (await fechar.count() > 0) await fechar.click()
  })

  test('modal de duplicar itens abre e tem estrutura correta', async ({ page }) => {
    // Selecionar primeiro pedido pai
    const paiCheckbox = page.locator('.gtv-linha--pai input[type="checkbox"]').first()
    await expect(paiCheckbox).toBeVisible({ timeout: 10000 })
    await paiCheckbox.evaluate(el => (el as HTMLInputElement).click())

    // Confirmar que o botão Duplicar ficou habilitado
    const btnDuplicar = page.getByRole('button', { name: 'Duplicar' })
    await expect(btnDuplicar).toBeEnabled({ timeout: 5000 })

    // Clicar Duplicar
    await btnDuplicar.click()
    await page.waitForTimeout(300)

    // Modal deve aparecer
    const modal = page.locator('[role="dialog"]').filter({ hasText: /[Dd]uplic/ })
    await expect(modal).toBeVisible({ timeout: 8000 })

    // Estrutura obrigatória
    await expect(modal.locator('.modal-duplicar__info')).toBeVisible()
    await expect(modal.locator('.modal-duplicar__info-texto')).toBeVisible()
    await expect(modal.locator('button').filter({ hasText: /Cancelar/i })).toBeVisible()

    // Fechar pelo Cancelar
    await modal.locator('button').filter({ hasText: /Cancelar/i }).click()
    await expect(modal).not.toBeVisible({ timeout: 3000 })
  })
})
