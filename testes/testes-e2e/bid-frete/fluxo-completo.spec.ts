/**
 * E2E — BID Frete v2: Fluxo Completo
 * Full flow: Create cotacao -> View detail -> Disparo -> Receive responses ->
 * Comparativo -> Approve -> Verify saving
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  apiPost,
  apiGet,
  seedCotacao,
  seedFornecedor,
  seedDisparoWithResponses,
  waitForToast,
  waitForLoadingToFinish,
  screenshotStep,
  type DisparoResult,
} from './helpers'

test.describe('Fluxo Completo — Ciclo de Cotacao', () => {
  test('happy path: criar -> disparar -> responder -> comparar -> aprovar', async ({
    page,
  }) => {
    // 1. Setup: create fornecedores
    const fornA = await seedFornecedor(page, {
      nome: 'Fornecedor Alpha',
      email: `alpha-${Date.now()}@teste.com`,
    })
    const fornB = await seedFornecedor(page, {
      nome: 'Fornecedor Beta',
      email: `beta-${Date.now()}@teste.com`,
    })
    const fornC = await seedFornecedor(page, {
      nome: 'Fornecedor Gamma',
      email: `gamma-${Date.now()}@teste.com`,
    })

    // 2. Create cotacao via API seed
    const cotacao = await seedCotacao(page)
    await screenshotStep(page, 'fluxo-cotacao-created')

    // 3. Disparo BID with responses
    const disparo = await seedDisparoWithResponses(
      page,
      cotacao.id,
      [fornA.id, fornB.id, fornC.id],
      [
        { valor_total: 3500, moeda: 'USD', transit_time_dias: 25 },
        { valor_total: 3200, moeda: 'USD', transit_time_dias: 28 },
        { valor_total: 3800, moeda: 'USD', transit_time_dias: 22 },
      ],
    )
    expect(disparo.bidRequests).toHaveLength(3)

    // 4. View detail page — should show status EM_COTACAO or similar
    await navigateTo(page, `/cotacoes/${cotacao.id}`)
    await waitForLoadingToFinish(page)
    await expect(page.getByText(/Santos/i)).toBeVisible()
    await expect(page.getByText(/Shanghai/i)).toBeVisible()
    await screenshotStep(page, 'fluxo-cotacao-detail-after-disparo')

    // 5. Navigate to comparativo
    await navigateTo(page, `/comparativo/${cotacao.id}`)
    await waitForLoadingToFinish(page)

    // Verify ranking exists (B should be cheapest at 3200)
    const ranking = page.locator('[data-testid="ranking-row"]')
    const rankingCount = await ranking.count()
    expect(rankingCount).toBeGreaterThanOrEqual(3)
    await expect(ranking.first()).toContainText(/3.200|3200|Beta/i)
    await screenshotStep(page, 'fluxo-comparativo-ranking')

    // 6. Approve the best response (first in ranking)
    await ranking.first().getByRole('button', { name: /aprovar/i }).click()

    // Confirmation dialog
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: /confirmar/i }).click()
    await waitForToast(page, /aprovad/i)
    await screenshotStep(page, 'fluxo-approved')

    // 7. Verify cotacao status is APROVADA
    await navigateTo(page, `/cotacoes/${cotacao.id}`)
    await waitForLoadingToFinish(page)
    await expect(page.getByText(/aprovada/i)).toBeVisible()

    // 8. Verify saving calculation via API
    const dashboardData = await apiGet<{ savings_total: number }>(
      page,
      '/api/v1/bid-frete/dashboard',
    )
    expect(dashboardData.savings_total).toBeGreaterThanOrEqual(0)
  })

  test('each step transitions correctly in the status pipeline', async ({ page }) => {
    const forn = await seedFornecedor(page, {
      email: `pipeline-${Date.now()}@teste.com`,
    })
    const cotacao = await seedCotacao(page)

    // Step 1: RASCUNHO
    const detail1 = await apiGet<{ status: string }>(
      page,
      `/api/v1/bid-frete/cotacoes/${cotacao.id}`,
    )
    expect(detail1.status).toBe('RASCUNHO')

    // Step 2: Disparo -> EM_COTACAO
    await apiPost(page, '/api/v1/bid-frete/bids/disparar', {
      cotacao_id: cotacao.id,
      fornecedor_ids: [forn.id],
      canal: 'EMAIL',
    })

    const detail2 = await apiGet<{ status: string }>(
      page,
      `/api/v1/bid-frete/cotacoes/${cotacao.id}`,
    )
    expect(['EM_COTACAO', 'ENVIADA_FORNECEDORES']).toContain(detail2.status)

    // Step 3: Response -> verify bids exist
    const bids = await apiGet<Array<{ status: string; token: string }>>(
      page,
      `/api/v1/bid-frete/bids/cotacao/${cotacao.id}`,
    )
    expect(bids.length).toBeGreaterThan(0)

    // Respond via token
    await apiPost(page, `/api/v1/bid-frete/portal/public/responder/${bids[0].token}`, {
      valor_total: 4000,
      moeda: 'USD',
      transit_time_dias: 20,
      validade: new Date(Date.now() + 14 * 86_400_000).toISOString(),
    })

    // Step 4: Approve
    await apiPost(page, `/api/v1/bid-frete/comparativo/${cotacao.id}/aprovar`, {
      response_id: 'auto',
    })

    const detail3 = await apiGet<{ status: string }>(
      page,
      `/api/v1/bid-frete/cotacoes/${cotacao.id}`,
    )
    expect(detail3.status).toBe('APROVADA')
  })

  test('reprovacao changes status and records motivo', async ({ page }) => {
    const forn = await seedFornecedor(page, {
      email: `reprovar-${Date.now()}@teste.com`,
    })
    const cotacao = await seedCotacao(page)

    // Disparo + response
    const disparo = await apiPost<DisparoResult>(
      page,
      '/api/v1/bid-frete/bids/disparar',
      { cotacao_id: cotacao.id, fornecedor_ids: [forn.id], canal: 'EMAIL' },
    )

    await apiPost(
      page,
      `/api/v1/bid-frete/portal/public/responder/${disparo.bidRequests[0].token}`,
      {
        valor_total: 9999,
        moeda: 'USD',
        transit_time_dias: 60,
        validade: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      },
    )

    // Reprovar
    await apiPost(page, `/api/v1/bid-frete/comparativo/${cotacao.id}/reprovar`, {
      motivo: 'Precos acima do budget',
    })

    // Verify in UI
    await navigateTo(page, `/cotacoes/${cotacao.id}`)
    await waitForLoadingToFinish(page)
    await expect(page.getByText(/reprovada/i)).toBeVisible()
    await screenshotStep(page, 'fluxo-reprovada')
  })

  test('auto-response via tabela de precos', async ({ page }) => {
    const forn = await seedFornecedor(page, {
      nome: 'Auto Responder',
      email: `auto-${Date.now()}@teste.com`,
    })

    // Create price table
    await apiPost(page, `/api/v1/bid-frete/fornecedores/${forn.id}/tabela-preco`, {
      origem: 'Santos',
      destino: 'Shanghai',
      modal: 'MARITIMO',
      modalidade: 'FCL',
      valor: 2900,
      moeda: 'USD',
      transit_time_dias: 30,
      validade_inicio: new Date().toISOString(),
      validade_fim: new Date(Date.now() + 90 * 86_400_000).toISOString(),
    })

    // Create matching cotacao
    const cotacao = await seedCotacao(page, {
      modal: 'MARITIMO',
      modalidade: 'FCL',
      origem_porto: 'Santos',
      destino_porto: 'Shanghai',
    })

    // Disparo
    await apiPost(page, '/api/v1/bid-frete/bids/disparar', {
      cotacao_id: cotacao.id,
      fornecedor_ids: [forn.id],
      canal: 'EMAIL',
    })

    // Verify auto-response
    const bids = await apiGet<Array<{ status: string; auto_response: boolean }>>(
      page,
      `/api/v1/bid-frete/bids/cotacao/${cotacao.id}`,
    )
    const autoResponded = bids.find((b) => b.auto_response)
    expect(autoResponded).toBeDefined()
    expect(autoResponded?.status).toBe('RESPONDIDO')

    // Verify in comparativo UI
    await navigateTo(page, `/comparativo/${cotacao.id}`)
    await waitForLoadingToFinish(page)
    await expect(page.getByText(/2.900|2900/)).toBeVisible()
  })
})
