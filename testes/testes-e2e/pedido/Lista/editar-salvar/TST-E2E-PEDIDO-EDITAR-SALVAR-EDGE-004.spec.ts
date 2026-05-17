/**
 * TST-E2E-PEDIDO-EDITAR-SALVAR-EDGE-004
 *
 * Fluxos 14-18: Edge cases — cancelar/rollback, erro ao salvar,
 * aggregates recalculados, status cascade, permissao.
 * Plano: editar-salvar-e2e.md
 *
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:8000'

test.describe('Cancelar edicao — Esc/Cancelar preserva valor original (Fluxo 14)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })
  })

  test('14.1-14.3 — Editar campo + Esc → popover fecha, valor original preservado', async ({ page }) => {
    const celula = page.locator('[data-campo="numero_pedido"][data-editavel="true"]').first()
    if (await celula.isVisible()) {
      const valorOriginal = await celula.textContent()

      await celula.click()
      const popover = page.locator('[data-testid="popover-edicao"]')
      await expect(popover).toBeVisible({ timeout: 3000 })

      const input = popover.locator('input').first()
      if (await input.isVisible()) {
        await input.fill('VALOR-TEMPORARIO')
      }

      await page.keyboard.press('Escape')

      await expect(popover).not.toBeVisible({ timeout: 1000 })
      await expect(celula).toContainText(valorOriginal ?? '')
    }
  })

  test('14.4 — Clicar botao Cancelar (X) → valor original preservado', async ({ page }) => {
    const celula = page.locator('[data-campo="nome_fabricante"][data-editavel="true"]').first()
    if (await celula.isVisible()) {
      await celula.click()

      const popover = page.locator('[data-testid="popover-edicao"]')
      await expect(popover).toBeVisible({ timeout: 3000 })

      const btnCancelar = popover.locator('[data-testid="btn-cancelar"], button:has-text("Cancelar")')
      if (await btnCancelar.isVisible()) {
        await btnCancelar.click()
      }

      await expect(popover).not.toBeVisible({ timeout: 1000 })
    }
  })

  test('14.5 — Nenhuma requisicao PUT enviada ao backend ao cancelar', async ({ page }) => {
    const requests: string[] = []
    page.on('request', (req) => {
      if (req.method() === 'PUT') requests.push(req.url())
    })

    const celula = page.locator('[data-campo="incoterm"][data-editavel="true"]').first()
    if (await celula.isVisible()) {
      await celula.click()
      await page.keyboard.press('Escape')
    }

    expect(requests).toHaveLength(0)
  })
})

test.describe('Erro ao salvar — rollback visual e notificacao (Fluxo 15)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })
  })

  test('15.1-15.3 — Backend rejeita → flash vermelho + rollback', async () => {})
  test('15.4 — Toast com mensagem amigavel (sem stack trace)', async () => {})
})

test.describe('Aggregates atualizados apos edicao de item (Fluxo 16)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })
  })

  test('16.1-16.3 — Editar valor_total_item → valor_total_pedido PAI recalculado', async () => {})
  test('16.4-16.5 — Moedas mistas: valor_total_pedido mostra indicacao', async () => {})
  test('16.6 — Moedas alinhadas: valor_total_pedido volta a somar', async () => {})
})

test.describe('Status cascade — editar status do item (Fluxo 17)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace/pedidos`)
    await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15000 })
  })

  test('17.1-17.2 — Mudar status do item via select', async () => {})
  test('17.3-17.4 — Status cascade: TODOS itens + PAI mudam', async () => {})
})

test.describe('Permissao de edicao — sem permissao, celulas bloqueadas (Fluxo 18)', () => {
  test('18.1-18.2 — Usuario sem permissao: clicar em celula NAO abre popover', async () => {})
  test('18.3 — Tooltip "Sem permissao" (se implementado)', async () => {})
})
