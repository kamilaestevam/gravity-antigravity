/**
 * TST-E2E-MBOTO-000059 — Processo Lista | Kanban SLA 1s
 */
import { test } from '../../../../playwright.fixtures'
import { assertSla1s, clicarAbaEMedir, CICLO_ABAS_PROCESSO } from './helpers/sla-1s'
import { SELETOR_MBOTO_URLS } from '../../../_fixtures/seletor-universal-visoes/data-seed'

const BASE = process.env.PLAYWRIGHT_BASE_URL
const REQUER_AUTH = process.env.PLAYWRIGHT_PROCESSO_AUTH === '1'

test.describe('TST-E2E-MBOTO-000059 — Processo', () => {
  test.skip(!BASE || !REQUER_AUTH, 'PLAYWRIGHT_BASE_URL + PLAYWRIGHT_PROCESSO_AUTH=1')

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}${SELETOR_MBOTO_URLS.processo.lista}`)
    await page.getByTestId('seletor-visao-painel-lista').waitFor({ state: 'visible', timeout: 15_000 })
  })

  for (const aba of CICLO_ABAS_PROCESSO) {
    test(`Processo ${aba} <= 1s`, async ({ page }) => {
      assertSla1s(await clicarAbaEMedir(page, aba), `Processo → ${aba}`)
    })
  }
})
