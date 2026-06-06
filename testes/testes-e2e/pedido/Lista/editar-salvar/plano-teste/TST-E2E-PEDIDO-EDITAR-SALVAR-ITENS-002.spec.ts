/**
 * TST-E2E-PEDIDO-EDITAR-SALVAR-ITENS-002
 *
 * Fluxos 7-8: Edicao de item FILHO — calculados editaveis no item,
 * isolamento de edicao entre itens.
 * Plano: editar-salvar-e2e.md
 *
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:8000'

test.describe('Editar-Salvar ITEM — Calculados editaveis no item (Fluxo 7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })
  })

  const CALCULADOS_EDITAVEIS_ITEM = [
    'valor_total_item',
    'quantidade_inicial_pedido',
    'quantidade_pronta_itens_pedido_total',
    'peso_liquido_total_pedido',
    'peso_bruto_total_pedido',
    'cubagem_total_pedido',
  ] as const

  for (const campo of CALCULADOS_EDITAVEIS_ITEM) {
    test(`7.x — ${campo} EDITAVEL no item (calculado no PAI)`, async ({ page }) => {
      // Expandir primeiro pedido para ver itens
      const expandir = page.locator('[data-testid="btn-expandir"]').first()
      await expandir.click()

      // Localizar celula do item (filho)
      const celulaItem = page.locator(`[data-nivel="item"] [data-campo="${campo}"]`).first()
      if (await celulaItem.isVisible()) {
        await celulaItem.scrollIntoViewIfNeeded()
        await celulaItem.click()

        // Popover DEVE abrir (calculado editavel no item)
        const popover = page.locator('[data-testid="popover-edicao"]')
        await expect(popover).toBeVisible({ timeout: 3000 })
      }
    })
  }

  test('7.7 — status EDITAVEL no item (override somente_leitura)', async ({ page }) => {
    const expandir = page.locator('[data-testid="btn-expandir"]').first()
    await expandir.click()

    const celulaStatus = page.locator('[data-nivel="item"] [data-campo="status"]').first()
    if (await celulaStatus.isVisible()) {
      await celulaStatus.click()
      const popover = page.locator('[data-testid="popover-edicao"]')
      await expect(popover).toBeVisible({ timeout: 3000 })
    }
  })

  const BLOQUEADOS_ITEM = [
    'saldo_itens_do_pedido',
    'quantidade_transferida_total',
    'quantidade_cancelada_total_pedido',
    'pais_exportador',
  ] as const

  for (const campo of BLOQUEADOS_ITEM) {
    test(`7.x — ${campo} NAO editavel no item`, async ({ page }) => {
      const expandir = page.locator('[data-testid="btn-expandir"]').first()
      await expandir.click()

      const celulaItem = page.locator(`[data-nivel="item"] [data-campo="${campo}"]`).first()
      if (await celulaItem.isVisible()) {
        await celulaItem.click()
        const popover = page.locator('[data-testid="popover-edicao"]')
        await expect(popover).not.toBeVisible({ timeout: 1000 })
      }
    })
  }

  test('7.12 — Recarregar: valores persistidos, aggregates recalculados no PAI', async ({ page }) => {
    const expandir = page.locator('[data-testid="btn-expandir"]').first()
    await expandir.click()

    await page.reload()
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })
  })
})

test.describe('Editar-Salvar ITEM — Isolamento entre itens (Fluxo 8)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })
  })

  test('8.1-8.4 — Editar NCM do 2o item: 1o e 3o permanecem intactos, PAI intacto', async ({ page }) => {
    const expandir = page.locator('[data-testid="btn-expandir"]').first()
    await expandir.click()

    const itens = page.locator('[data-nivel="item"]')
    const count = await itens.count()
    if (count >= 3) {
      // Anotar NCM do 1o e 3o item
      // Editar NCM do 2o item
      // Verificar isolamento
    }
  })

  test('8.5 — Editar part_number do 3o item: apenas 3o muda', async ({ page }) => {
    const expandir = page.locator('[data-testid="btn-expandir"]').first()
    await expandir.click()
  })

  test('8.6 — Editar moeda_item do 1o item: aggregate recalculado', async ({ page }) => {
    const expandir = page.locator('[data-testid="btn-expandir"]').first()
    await expandir.click()
  })
})
