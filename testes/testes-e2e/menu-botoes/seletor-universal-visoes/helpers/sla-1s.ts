import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export const SLA_MS = 1000

export type AbaSeletor = 'insights' | 'lista' | 'dashboard' | 'kanban'

export async function clicarAbaEMedir(
  page: Page,
  aba: AbaSeletor,
): Promise<number> {
  const t0 = await page.evaluate(() => performance.now())
  await page.getByTestId(`seletor-visao-tab-${aba}`).click()
  await page.getByTestId(`seletor-visao-painel-${aba}`).waitFor({ state: 'visible', timeout: SLA_MS })
  await expect(page.getByTestId('seletor-visao-painel-pronto')).toBeVisible({ timeout: SLA_MS })
  const t1 = await page.evaluate(() => performance.now())
  return t1 - t0
}

export function assertSla1s(elapsed: number, contexto: string): void {
  expect(elapsed, `${contexto} deve ser <= ${SLA_MS}ms`).toBeLessThanOrEqual(SLA_MS)
}

/** Ciclo frio: 4 abas em ordem (Pedido/BID com 4 pills). */
export const CICLO_ABAS_4: AbaSeletor[] = ['insights', 'lista', 'dashboard', 'kanban']

export const CICLO_ABAS_PROCESSO: AbaSeletor[] = ['lista', 'kanban']
