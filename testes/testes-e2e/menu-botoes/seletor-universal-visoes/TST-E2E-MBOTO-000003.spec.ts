/**
 * TST-E2E-MBOTO-000003 — BID cliente ciclo frio SLA 1s
 */
import { test } from '../../../../playwright.fixtures'
import { assertSla1s, clicarAbaEMedir, CICLO_ABAS_4 } from './helpers/sla-1s'
import { SELETOR_MBOTO_URLS } from '../../../_fixtures/seletor-universal-visoes/data-seed'

const BASE = process.env.PLAYWRIGHT_BASE_URL
const REQUER_AUTH = process.env.PLAYWRIGHT_BID_AUTH === '1'

test.describe('TST-E2E-MBOTO-000003 — BID cliente', () => {
  test.skip(!BASE || !REQUER_AUTH, 'PLAYWRIGHT_BASE_URL + PLAYWRIGHT_BID_AUTH=1')

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${SELETOR_MBOTO_URLS.bidCliente.insights}`)
    await page.getByTestId('seletor-visao-painel-insights').waitFor({ state: 'visible', timeout: 15_000 })
  })

  for (const aba of CICLO_ABAS_4) {
    test(`BID cliente ${aba} <= 1s`, async ({ page }) => {
      assertSla1s(await clicarAbaEMedir(page, aba), `BID cliente → ${aba}`)
    })
  }
})
