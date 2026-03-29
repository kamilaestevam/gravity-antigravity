/**
 * E2E — SimulaCusto: Store e Catalogo Publico
 * Cobre fluxos 6.1–6.3 do plano de testes (fluxo-produto-e2e.md)
 *
 * Valida que o Marketplace/Store exibe produtos do catalogo corretamente,
 * respeita status (Ativo/Suspenso) e mostra precos formatados.
 */
import { test, expect } from '@playwright/test'
import {
  navigateToStore,
  apiGet,
  apiPost,
  waitForLoadingToFinish,
  CONFIGURADOR_BASE_URL,
  STORE_BASE_URL,
  type TestProdutoCatalogo,
} from './helpers'

// ─── Categoria 6 — Store e Catalogo Publico ─────────────────────────────────

test.describe('Store — Catalogo de Produtos', () => {
  test('6.1 — Store: produtos do catalogo carregam da API', async ({ page }) => {
    await navigateToStore(page)
    await waitForLoadingToFinish(page)

    // Verificar que os cards de produtos estao presentes
    // O catalogo deve conter pelo menos SimulaCusto, Smart Read e BID Frete
    await expect(page.getByText(/SimulaCusto/i)).toBeVisible()
    await expect(page.getByText(/Smart Read/i)).toBeVisible()
    await expect(page.getByText(/BID Frete/i)).toBeVisible()

    // Verificar descricoes dos produtos
    await expect(page.getByText(/custos estimados/i)).toBeVisible()
    await expect(page.getByText(/leitura inteligente/i)).toBeVisible()
    await expect(page.getByText(/licita..o inteligente/i)).toBeVisible()

    // Verificar categorias por produto
    await expect(page.getByText(/Com.rcio Exterior/i)).toBeVisible()
    await expect(page.getByText(/Intelig.ncia Documental/i)).toBeVisible()
    await expect(page.getByText(/Log.stica/i)).toBeVisible()
  })

  test('6.2 — Store: produto suspenso nao aparece', async ({ page }) => {
    // Passo 1: Verificar que SimulaCusto esta visivel antes de suspender
    await navigateToStore(page)
    await waitForLoadingToFinish(page)
    await expect(page.getByText(/SimulaCusto/i)).toBeVisible()

    // Passo 2: Suspender SimulaCusto via API
    await apiPost(
      page,
      '/api/v1/configurador/catalog/products/simula-custo/toggle-status',
      {},
      CONFIGURADOR_BASE_URL
    )

    // Passo 3: Recarregar Store e verificar que SimulaCusto nao aparece
    await navigateToStore(page)
    await waitForLoadingToFinish(page)

    // SimulaCusto deve estar oculto (suspenso)
    const simulaCustoCard = page.getByText(/SimulaCusto/i)
    await expect(simulaCustoCard).toBeHidden()

    // Outros produtos devem continuar visiveis
    await expect(page.getByText(/Smart Read/i)).toBeVisible()
    await expect(page.getByText(/BID Frete/i)).toBeVisible()

    // Passo 4: Reativar SimulaCusto (cleanup)
    await apiPost(
      page,
      '/api/v1/configurador/catalog/products/simula-custo/toggle-status',
      {},
      CONFIGURADOR_BASE_URL
    )

    // Passo 5: Verificar que voltou a aparecer
    await navigateToStore(page)
    await waitForLoadingToFinish(page)
    await expect(page.getByText(/SimulaCusto/i)).toBeVisible()
  })

  test('6.3 — Store: precos e tipo de cobranca exibidos corretamente', async ({ page }) => {
    await navigateToStore(page)
    await waitForLoadingToFinish(page)

    // SimulaCusto: R$ 10,99 /estimativa
    const simulaCustoSection = page.locator('[class*="card"], [data-testid*="product"]')
      .filter({ hasText: /SimulaCusto/i })

    // Verificar preco do SimulaCusto
    // O preco pode estar em formatos como "R$ 10,99" ou "10,99"
    await expect(
      page.getByText(/10,99/).first()
    ).toBeVisible()

    // Verificar tipo de cobranca — "/estimativa"
    await expect(
      page.getByText(/estimativa/i).first()
    ).toBeVisible()

    // Smart Read: R$ 5,99 /documento
    await expect(
      page.getByText(/5,99/).first()
    ).toBeVisible()
    await expect(
      page.getByText(/documento/i).first()
    ).toBeVisible()

    // BID Frete: R$ 1,99 /processo
    await expect(
      page.getByText(/1,99/).first()
    ).toBeVisible()
    await expect(
      page.getByText(/processo/i).first()
    ).toBeVisible()

    // Verificar que a moeda exibida e BRL (R$)
    const precosComR = page.locator('text=/R\\$/')
    const countPrecos = await precosComR.count()
    expect(countPrecos).toBeGreaterThanOrEqual(3)
  })
})
