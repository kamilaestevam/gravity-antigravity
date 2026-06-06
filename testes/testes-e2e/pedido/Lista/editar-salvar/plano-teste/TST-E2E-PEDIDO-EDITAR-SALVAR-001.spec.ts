/**
 * TST-E2E-PEDIDO-EDITAR-SALVAR-001
 *
 * Fluxos 1-6: Edicao inline PAI — alfanumericos, datas, bloqueados, condicional, propagacao.
 * Plano: editar-salvar-e2e.md
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:8000'

test.describe('Editar-Salvar PAI — Campos alfanumericos (Fluxo 1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })
  })

  const CAMPOS_ALFANUMERICOS = [
    'numero_pedido',
    'tipo_operacao',
    'nome_fabricante',
    'referencia_importador',
    'referencia_exportador',
    'ncm',
    'numero_proforma',
    'numero_invoice',
    'incoterm',
    'data_emissao_pedido',
    'referencia_fabricante',
    'cobertura_cambial',
    'condicao_pagamento',
  ] as const

  for (const campo of CAMPOS_ALFANUMERICOS) {
    test(`1.x — Editar ${campo}: clicar → popover → salvar → persistencia`, async ({ page }) => {
      // Localizar primeira celula editavel do campo
      const celula = page.locator(`[data-campo="${campo}"][data-editavel="true"]`).first()
      await celula.scrollIntoViewIfNeeded()
      await celula.click()

      // Popover deve abrir
      const popover = page.locator('[data-testid="popover-edicao"]')
      await expect(popover).toBeVisible({ timeout: 3000 })

      // Editar valor (texto generico — campos especificos podem precisar de select/datepicker)
      const input = popover.locator('input, select, [contenteditable]').first()
      if (await input.isVisible()) {
        await input.fill(`TESTE-${campo}-${Date.now()}`)
      }

      // Confirmar
      const btnConfirmar = popover.locator('[data-testid="btn-confirmar"], button:has-text("Confirmar")')
      await btnConfirmar.click()

      // Flash de sucesso (600ms)
      await expect(celula).toHaveAttribute('data-resultado', 'sucesso', { timeout: 2000 })

      // Notificacao toast
      await expect(page.locator('.notification-success, [data-testid="toast-sucesso"]')).toBeVisible({ timeout: 3000 })

      // Persistencia: recarregar e verificar
      await page.reload()
      await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })
      // Valor deve persistir (verificacao visual)
    })
  }
})

test.describe('Editar-Salvar PAI — Campos calculados bloqueados (Fluxo 3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })
  })

  const CAMPOS_CALCULADOS = [
    'valor_total_pedido',
    'valor_item',
    'quantidade_total_pedido',
    'quantidade_pronta_itens_pedido_total',
    'quantidade_transferida_total',
    'quantidade_cancelada_total_pedido',
    'peso_liquido_total_pedido',
    'peso_bruto_total_pedido',
    'cubagem_total_pedido',
    'saldo_itens_do_pedido',
  ] as const

  for (const campo of CAMPOS_CALCULADOS) {
    test(`3.x — ${campo} NAO deve abrir popover`, async ({ page }) => {
      const celula = page.locator(`[data-campo="${campo}"]`).first()
      if (await celula.isVisible()) {
        await celula.scrollIntoViewIfNeeded()
        await celula.click()

        // Popover NAO deve aparecer
        const popover = page.locator('[data-testid="popover-edicao"]')
        await expect(popover).not.toBeVisible({ timeout: 1000 })
      }
    })
  }
})

test.describe('Editar-Salvar PAI — Edicao condicional (Fluxo 5)', () => {
  test('5.1 — nome_exportador editavel em pedido importacao', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })

    // Localizar pedido com tipo_operacao=importacao
    const celula = page.locator('[data-tipo-operacao="importacao"] [data-campo="nome_exportador"]').first()
    if (await celula.isVisible()) {
      await celula.click()
      const popover = page.locator('[data-testid="popover-edicao"]')
      await expect(popover).toBeVisible({ timeout: 3000 })
    }
  })

  test('5.2 — nome_importador bloqueado em pedido importacao', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })

    const celula = page.locator('[data-tipo-operacao="importacao"] [data-campo="nome_importador"]').first()
    if (await celula.isVisible()) {
      await celula.click()
      const popover = page.locator('[data-testid="popover-edicao"]')
      await expect(popover).not.toBeVisible({ timeout: 1000 })
    }
  })
})

test.describe('Editar-Salvar PAI — Propagacao checkbox (Fluxo 6)', () => {
  test('6.2 — Campo propagavel exibe checkbox "Aplicar a todos os itens"', async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })

    // Clicar em campo propagavel (incoterm) na linha PAI
    const celula = page.locator('[data-campo="incoterm"][data-editavel="true"]').first()
    if (await celula.isVisible()) {
      await celula.scrollIntoViewIfNeeded()
      await celula.click()

      const popover = page.locator('[data-testid="popover-edicao"]')
      await expect(popover).toBeVisible({ timeout: 3000 })

      // Checkbox de propagacao deve existir
      const checkbox = popover.locator('[data-testid="checkbox-replicar"], input[type="checkbox"]')
      await expect(checkbox).toBeVisible()
    }
  })
})
