import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import {
  SLA_MS,
  assertSla1s,
  CICLO_ABAS_4,
  CICLO_ABAS_PROCESSO,
  type AbaSeletor,
} from './sla-1s-core.js'

export { SLA_MS, assertSla1s, CICLO_ABAS_4, CICLO_ABAS_PROCESSO, type AbaSeletor }

export async function clicarAbaEMedir(
  page: Page,
  aba: AbaSeletor,
): Promise<number> {
  const t0 = await page.evaluate(() => performance.now())
  await page.getByTestId(`seletor-visao-tab-${aba}`).click()
  const painel = page.getByTestId(`seletor-visao-painel-${aba}`)
  await painel.waitFor({ state: 'visible', timeout: SLA_MS })
  await expect(painel.getByTestId('seletor-visao-painel-pronto')).toBeVisible({ timeout: SLA_MS })
  const t1 = await page.evaluate(() => performance.now())
  return t1 - t0
}
