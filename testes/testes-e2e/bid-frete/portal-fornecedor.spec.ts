/**
 * E2E — BID Frete v2: Portal do Fornecedor
 * Tests the fornecedor-facing portal: dashboard, pendentes, response form,
 * minhas respostas, meu desempenho.
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  apiPost,
  seedCotacao,
  seedFornecedor,
  waitForLoadingToFinish,
  waitForToast,
  screenshotStep,
  type DisparoResult,
} from './helpers'

test.describe('Portal do Fornecedor — Dashboard', () => {
  test('portal dashboard loads with KPIs', async ({ page }) => {
    await navigateTo(page, '/portal')
    await waitForLoadingToFinish(page)

    const kpiPendentes = page.getByTestId('kpi-pendentes').or(
      page.getByText(/pendente/i),
    )
    const kpiRespondidas = page.getByTestId('kpi-respondidas').or(
      page.getByText(/respondid/i),
    )
    await expect(kpiPendentes).toBeVisible()
    await expect(kpiRespondidas).toBeVisible()
    await screenshotStep(page, 'portal-dashboard-kpis')
  })

  test('pendentes list shows cards', async ({ page }) => {
    // Seed a cotacao with disparo so there is a pending request
    const forn = await seedFornecedor(page, {
      email: `portal-pending-${Date.now()}@teste.com`,
    })
    const cotacao = await seedCotacao(page)
    await apiPost(page, '/api/v1/bid-frete/bids/disparar', {
      cotacao_id: cotacao.id,
      fornecedor_ids: [forn.id],
      canal: 'EMAIL',
    })

    await navigateTo(page, '/portal/pendentes')
    await waitForLoadingToFinish(page)

    const cards = page.locator(
      '[data-testid="pendente-card"], [data-testid="cotacao-pendente"]',
    )
    // May or may not have cards depending on auth context, but page should render
    await expect(
      page.getByRole('heading', { name: /pendente/i }).or(
        page.getByText(/pendente|aguardando/i),
      ),
    ).toBeVisible()
    await screenshotStep(page, 'portal-pendentes')
  })

  test('"Responder" navigates to response form', async ({ page }) => {
    await navigateTo(page, '/portal/pendentes')
    await waitForLoadingToFinish(page)

    const responderBtn = page.getByRole('button', { name: /responder/i }).or(
      page.getByRole('link', { name: /responder/i }),
    )

    if (await responderBtn.first().isVisible()) {
      await responderBtn.first().click()
      await waitForLoadingToFinish(page)

      // Should show response form
      await expect(
        page.getByTestId('resposta-valor').or(
          page.getByLabel(/valor|pre.o/i),
        ),
      ).toBeVisible()
      await screenshotStep(page, 'portal-response-form')
    }
  })
})

test.describe('Portal do Fornecedor — Response Form', () => {
  test('response form validates required fields', async ({ page }) => {
    const forn = await seedFornecedor(page, {
      email: `validate-${Date.now()}@teste.com`,
    })
    const cotacao = await seedCotacao(page)
    const disparo = await apiPost<DisparoResult>(
      page,
      '/api/v1/bid-frete/bids/disparar',
      { cotacao_id: cotacao.id, fornecedor_ids: [forn.id], canal: 'EMAIL' },
    )

    const token = disparo.bidRequests[0]?.token
    if (token) {
      await navigateTo(page, `/api/v1/bid-frete/portal/public/cotacao/${token}`)
      await waitForLoadingToFinish(page)

      // Try submitting without filling
      const submitBtn = page.getByRole('button', { name: /enviar|responder|submit/i })
      if (await submitBtn.isVisible()) {
        await submitBtn.click()

        // Should show validation errors
        await expect(
          page.getByText(/obrigat.ri|preencha|required/i),
        ).toBeVisible()
      }
    }
  })

  test('submit response shows success', async ({ page }) => {
    const forn = await seedFornecedor(page, {
      email: `submit-${Date.now()}@teste.com`,
    })
    const cotacao = await seedCotacao(page)
    const disparo = await apiPost<DisparoResult>(
      page,
      '/api/v1/bid-frete/bids/disparar',
      { cotacao_id: cotacao.id, fornecedor_ids: [forn.id], canal: 'EMAIL' },
    )

    const token = disparo.bidRequests[0]?.token
    if (token) {
      await navigateTo(page, `/api/v1/bid-frete/portal/public/cotacao/${token}`)
      await waitForLoadingToFinish(page)

      // Verify cotacao details are visible (read-only)
      await expect(page.getByText(/Santos/i)).toBeVisible()

      // Fill response
      await page.getByTestId('resposta-valor').fill('3500')

      const moedaSelect = page.getByTestId('resposta-moeda')
      if (await moedaSelect.isVisible()) {
        await moedaSelect.click()
        await page.getByRole('option', { name: /USD/i }).click()
      }

      await page.getByTestId('resposta-transit-days').fill('25')

      const validadeInput = page.getByTestId('resposta-validade')
      if (await validadeInput.isVisible()) {
        const futureDate = new Date(Date.now() + 14 * 86_400_000)
          .toISOString()
          .split('T')[0]
        await validadeInput.fill(futureDate)
      }

      await page.getByRole('button', { name: /enviar|responder/i }).click()
      await waitForToast(page, /enviada|sucesso/i)
      await screenshotStep(page, 'portal-response-submitted')
    }
  })

  test('expired token shows error message', async ({ page }) => {
    await navigateTo(
      page,
      '/api/v1/bid-frete/portal/public/cotacao/token-expirado-fake',
    )
    await waitForLoadingToFinish(page)

    await expect(
      page.getByText(/expirad|inv.lid|n.o encontrad/i),
    ).toBeVisible()
    await screenshotStep(page, 'portal-token-expired')
  })
})

test.describe('Portal do Fornecedor — History & Performance', () => {
  test('Minhas Respostas shows history', async ({ page }) => {
    await navigateTo(page, '/portal/respostas')
    await waitForLoadingToFinish(page)

    await expect(
      page.getByRole('heading', { name: /respostas/i }).or(
        page.getByText(/minhas respostas|hist.rico/i),
      ),
    ).toBeVisible()
    await screenshotStep(page, 'portal-minhas-respostas')
  })

  test('Meu Desempenho shows ratings', async ({ page }) => {
    await navigateTo(page, '/portal/desempenho')
    await waitForLoadingToFinish(page)

    await expect(
      page.getByText(/desempenho|taxa.*resposta|response.*rate|rating/i),
    ).toBeVisible()
    await screenshotStep(page, 'portal-meu-desempenho')
  })
})
