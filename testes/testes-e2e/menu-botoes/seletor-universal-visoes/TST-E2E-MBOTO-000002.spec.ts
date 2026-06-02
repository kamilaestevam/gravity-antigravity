/**
 * TST-E2E-MBOTO-000002 — Pedido T2 (16 workspaces) stress SLA 1s
 */
import { test } from '../../../../playwright.fixtures'
import { assertSla1s, clicarAbaEMedir, CICLO_ABAS_4 } from './helpers/sla-1s'
import { SELETOR_MBOTO_URLS } from '../../../_fixtures/seletor-universal-visoes/data-seed'

const BASE = process.env.PLAYWRIGHT_BASE_URL
const REQUER_T2 = process.env.PLAYWRIGHT_PEDIDO_T2 === '1'

test.describe('TST-E2E-MBOTO-000002 — Pedido T2 stress', () => {
  test.skip(!BASE || !REQUER_T2, 'Nightly: PLAYWRIGHT_BASE_URL + PLAYWRIGHT_PEDIDO_T2=1 (seed 16 WS)')

  test('ciclo 4 abas com registro de elapsed (pode reprovar release)', async ({ page }) => {
    await page.goto(`${BASE}${SELETOR_MBOTO_URLS.pedido.insights}`)
    const resultados: Record<string, number> = {}
    for (const aba of CICLO_ABAS_4) {
      resultados[aba] = await clicarAbaEMedir(page, aba)
    }
    test.info().attach('elapsed_ms_T2', {
      body: JSON.stringify(resultados, null, 2),
      contentType: 'application/json',
    })
    for (const [aba, ms] of Object.entries(resultados)) {
      assertSla1s(ms, `Pedido T2 → ${aba}`)
    }
  })
})
