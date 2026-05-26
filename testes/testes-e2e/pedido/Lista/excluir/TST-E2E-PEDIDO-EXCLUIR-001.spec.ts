/**
 * SCAFFOLD — TST-E2E-PEDIDO-EXCLUIR-001
 *
 * E2E para exclusão de pedidos (blacklist de status + timeout 30s).
 * describe.skip até staging + plano aprovado.
 * Plano: testes/testes-e2e/pedido/Lista/excluir/excluir-e2e.md
 */

import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5180'
const ROTA_LISTA = '/produto/pedido/pedidos/lista'

async function navegarParaLista(page: Page) {
  await page.goto(`${BASE_URL}${ROTA_LISTA}`)
  await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15_000 })
}

test.describe.skip('Excluir pedidos — blacklist de status (2026-05 hotfix)', () => {
  test('E1-01: pedido em status não bloqueado pode ir para preview de exclusão', async ({ page }) => {
    await navegarParaLista(page)
    await page.click('[data-testid="checkbox-pedido-ped-aberto"]')
    await page.click('[data-testid="btn-excluir-pedidos"]')
    await expect(page.locator('[data-testid="modal-excluir-preview"]')).toBeVisible()
  })

  test('E1-02: pedido em status bloqueado na config mostra erro', async ({ page }) => {
    await navegarParaLista(page)
    await page.click('[data-testid="checkbox-pedido-ped-liquidado"]')
    await page.click('[data-testid="btn-excluir-pedidos"]')
    await expect(page.locator('[data-testid="banner-erro-exclusao-status"]')).toBeVisible()
  })
})

test.describe.skip('Excluir itens — renumeração sem timeout', () => {
  test('E2-01: excluir muitos itens completa em até 30s', async ({ page }) => {
    await navegarParaLista(page)
    await page.click('[data-testid="row-ped-grande"]')
    await page.click('[data-testid="btn-selecionar-todos-itens"]')
    await page.click('[data-testid="btn-excluir-itens"]')
    await page.click('[data-testid="btn-confirmar-excluir-itens"]')
    await expect(page.locator('[data-testid="banner-sucesso"]')).toBeVisible({ timeout: 30_000 })
  })
})
