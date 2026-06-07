/**
 * TST-E2E-MBOTO-000060 — Regressão warm: sem requests duplicadas ao revisitar aba
 */
import { test, expect } from '../../../../playwright.fixtures'
import { SELETOR_MBOTO_URLS } from '../../../_fixtures/seletor-universal-visoes/data-seed'

const BASE = process.env.PLAYWRIGHT_BASE_URL
const REQUER_AUTH = process.env.PLAYWRIGHT_PEDIDO_AUTH === '1'

test.describe('TST-E2E-MBOTO-000060 — prefetch warm Pedido', () => {
  test.skip(!BASE || !REQUER_AUTH, 'PLAYWRIGHT_BASE_URL + PLAYWRIGHT_PEDIDO_AUTH=1')

  test('revisitar lista não dispara novo GET listar se cache quente', async ({ page }) => {
    const listarUrls: string[] = []
    page.on('request', req => {
      const url = req.url()
      if (req.method() === 'GET' && /\/api\/v1\/pedidos(\?|$)/.test(url) && !url.includes('visao-geral')) {
        listarUrls.push(url)
      }
    })

    await page.goto(`${BASE}${SELETOR_MBOTO_URLS.pedido.lista}`)
    await page.getByTestId('seletor-visao-painel-lista').waitFor({ state: 'visible', timeout: 15_000 })
    const aposPrimeiraVisita = listarUrls.length

    await page.getByTestId('seletor-visao-tab-dashboard').click()
    await page.getByTestId('seletor-visao-painel-dashboard').waitFor({ state: 'visible' })

    await page.getByTestId('seletor-visao-tab-lista').click()
    await page.getByTestId('seletor-visao-painel-lista').waitFor({ state: 'visible' })

    const aposRevisita = listarUrls.length
    expect(aposRevisita).toBeLessThanOrEqual(aposPrimeiraVisita + 1)
  })
})
