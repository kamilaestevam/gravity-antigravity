/**
 * SCAFFOLD — TST-E2E-BIDFRT-VISAO-FORNECEDOR-001
 *
 * E2E Visão Fornecedor — dashboard, pendentes, proposta, tabelas valor.
 * Plano: testes/testes-e2e/bid-frete-internacional/visao-fornecedor/plano-de-testes/visao-fornecedor-e2e.md
 *
 * describe.skip até aprovação do plano pelo dono (skill QA / multi-agente).
 */

import { test, expect } from '../../../playwright.fixtures'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const ROTA_DASHBOARD = '/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/visao-geral'
const ROTA_TABELAS = '/produto/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/tabelas-valor'

test.describe.skip('BID Frete Internacional — Visão Fornecedor', () => {
  test('VF-E01: dashboard exibe métricas do fornecedor', async ({ page }) => {
    await page.goto(`${BASE_URL}${ROTA_DASHBOARD}`)
    await expect(page.getByRole('heading', { name: /visão geral|dashboard/i })).toBeVisible({ timeout: 15_000 })
  })

  test('VF-E05: criar rota na tabela de valor', async ({ page }) => {
    await page.goto(`${BASE_URL}${ROTA_TABELAS}`)
    await page.getByRole('button', { name: /nova rota|adicionar/i }).click()
    await page.getByLabel(/origem/i).fill('Santos')
    await page.getByRole('button', { name: /salvar/i }).click()
    await expect(page.getByText(/Santos/i)).toBeVisible()
  })
})
