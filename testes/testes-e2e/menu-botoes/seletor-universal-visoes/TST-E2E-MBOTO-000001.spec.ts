/**
 * TST-E2E-MBOTO-000001 — Pedido ciclo frio 4 abas T0 (SLA 1s)
 */
import { test, expect } from '../../../../playwright.fixtures'
import {
  assertSla1s,
  clicarAbaEMedir,
  CICLO_ABAS_4,
} from './helpers/sla-1s'
import { SELETOR_MBOTO_URLS } from '../../../_fixtures/seletor-universal-visoes/data-seed'

const BASE = process.env.PLAYWRIGHT_BASE_URL
const REQUER_AUTH = process.env.PLAYWRIGHT_PEDIDO_AUTH === '1'

test.describe('TST-E2E-MBOTO-000001 — Pedido T0 SLA 1s', () => {
  test.skip(!BASE || !REQUER_AUTH, 'Defina PLAYWRIGHT_BASE_URL e PLAYWRIGHT_PEDIDO_AUTH=1')

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${SELETOR_MBOTO_URLS.pedido.insights}`)
    await page.getByTestId('seletor-visao-painel-insights').waitFor({ state: 'visible', timeout: 15_000 })
  })

  for (const aba of CICLO_ABAS_4) {
    test(`troca cold/warm para ${aba} <= 1000ms`, async ({ page }) => {
      const elapsed = await clicarAbaEMedir(page, aba)
      assertSla1s(elapsed, `Pedido T0 → ${aba}`)
    })
  }
})
