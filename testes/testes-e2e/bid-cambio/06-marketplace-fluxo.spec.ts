/**
 * E2E — BID Cambio: Cat.11 Fluxo Especifico — Marketplace de Cotacoes
 * Fluxo completo: criar cotacao → disparar → responder → comparar → aprovar
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo, waitForLoadingToFinish, screenshotStep,
  seedCotacao, seedCorretora, seedDisparo, respondViaPotalPublico,
  apiGet, apiPost,
} from './helpers'

test.describe('Cat.11 — Fluxo Marketplace (Cotacao → Disparo → Resposta → Aprovacao)', () => {
  test('Fluxo completo: criar → disparar → responder → comparar → aprovar', async ({ page }) => {
    // 1. Criar cotacao
    const cotacao = await seedCotacao(page, { moeda: 'USD', valor: 100000 })
    expect(cotacao.status).toBe('RASCUNHO')

    // 2. Cadastrar 2 corretoras
    const c1 = await seedCorretora(page, { razao_social: 'Alpha MKT E2E', email: `alpha-${Date.now()}@test.com` })
    const c2 = await seedCorretora(page, { razao_social: 'Beta MKT E2E', email: `beta-${Date.now()}@test.com` })

    // 3. Disparar
    const disparo = await seedDisparo(page, cotacao.id, [c1.id, c2.id])
    expect(disparo.bid_requests).toHaveLength(2)
    const token1 = disparo.bid_requests[0].token_publico
    const token2 = disparo.bid_requests[1].token_publico

    // 4. Corretora 1 responde (taxa 5.20)
    await respondViaPotalPublico(page, token1, 5.2000, 0.0150)

    // 5. Corretora 2 responde (taxa 5.18 — melhor)
    await respondViaPotalPublico(page, token2, 5.1800, 0.0120)

    // 6. Comparativo — ranking
    const comparativo = await apiGet<{
      ranking: Array<{ id: string; taxa_oferecida: string; tags: string[] }>
      total_respostas: number
      melhor_taxa: string
    }>(page, `/api/v1/bid-cambio/comparativo/${cotacao.id}`)

    expect(comparativo.total_respostas).toBe(2)
    expect(Number(comparativo.melhor_taxa)).toBeCloseTo(5.18, 1)
    expect(comparativo.ranking[0].tags).toContain('MELHOR_TAXA')

    // 7. Aprovar melhor taxa
    const melhorId = comparativo.ranking[0].id
    const aprovacao = await apiPost<{
      cotacao_id: string
      taxa_aprovada: string
      economia_brl: number
    }>(page, `/api/v1/bid-cambio/comparativo/${cotacao.id}/aprovar`, {
      bid_response_id: melhorId,
    })
    expect(Number(aprovacao.taxa_aprovada)).toBeCloseTo(5.18, 1)
    expect(aprovacao.economia_brl).toBeGreaterThanOrEqual(0)

    // 8. Confirmar APROVADA
    const final = await apiGet<{ status: string }>(page, `/api/v1/bid-cambio/cotacoes/${cotacao.id}`)
    expect(final.status).toBe('APROVADA')

    // 9. Navegar no frontend
    await navigateTo(page, `/cotacoes/${cotacao.id}/comparativo`)
    await waitForLoadingToFinish(page)
    await screenshotStep(page, 'marketplace-fluxo-completo')
  })
})
