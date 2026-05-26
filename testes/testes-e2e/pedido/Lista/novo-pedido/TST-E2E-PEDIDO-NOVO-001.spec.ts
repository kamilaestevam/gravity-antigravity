/**
 * SCAFFOLD — TST-E2E-PEDIDO-NOVO-001
 *
 * E2E Novo Pedido — carrega empresa da org via Cadastros.
 * Plano: testes/testes-e2e/pedido/Lista/novo-pedido/novo-pedido-e2e.md
 */

import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5180'
const ROTA_LISTA = '/produto/pedido/pedidos/lista'

async function abrirModalNovoPedido(page: Page) {
  await page.goto(`${BASE_URL}${ROTA_LISTA}`)
  await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 15_000 })
  await page.click('[data-testid="btn-novo-pedido"]')
  await page.waitForSelector('[data-testid="modal-novo-pedido"]', { timeout: 10_000 })
}

test.describe.skip('Novo Pedido — empresa da organização', () => {
  test('N1-01: modal abre com importador pré-preenchido quando org tem empresa', async ({ page }) => {
    await abrirModalNovoPedido(page)
    await expect(page.locator('[data-testid="campo-importador"]')).not.toContainText(
      'Não foi possível carregar',
    )
  })

  test('N1-02: org sem onboarding mostra mensagem específica (não 500 genérico)', async ({ page }) => {
    await abrirModalNovoPedido(page)
    await expect(page.locator('[data-testid="erro-empresa-org"]')).toContainText(/onboarding|cadastro/i)
  })

  test('N1-03: Cadastros indisponível mostra mensagem de serviço off', async ({ page }) => {
    await abrirModalNovoPedido(page)
    await expect(page.locator('[data-testid="erro-empresa-org"]')).toContainText(/indisponível|tente novamente/i)
  })
})
