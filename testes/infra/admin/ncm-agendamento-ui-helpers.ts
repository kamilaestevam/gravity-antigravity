/**
 * Helpers Playwright — modal Agendamento NCM (EMT + E2E).
 */
import type { Locator, Page } from 'playwright'

export const CRON_DIARIO_02H = '00 02 * * *'
export const ROTA_NCM_INTEGRACAO = '/admin/ncm-integracao'

export async function selecionarOpcaoCombobox(combobox: Locator, opcao: RegExp): Promise<boolean> {
  await combobox.click()
  const opt = combobox.page().getByRole('option', { name: opcao }).first()
  if (!(await opt.isVisible({ timeout: 3000 }).catch(() => false))) return false
  await opt.click()
  return true
}

/** Comboboxes Configuração: 0=ativacao, 1=freq, 2=hora, 3=minuto */
export async function configurarAgendamentoDiario02h(page: Page): Promise<boolean> {
  const combos = page.getByRole('combobox')
  await combos.first().waitFor({ state: 'visible', timeout: 10000 })

  const okAtivo = await selecionarOpcaoCombobox(combos.nth(0), /^ativado$/i)
  const okDiario = await selecionarOpcaoCombobox(combos.nth(1), /^di[aá]rio$/i)
  const okHora = await selecionarOpcaoCombobox(combos.nth(2), /^02h$/i)
  const okMin = await selecionarOpcaoCombobox(combos.nth(3), /^00min$/i)

  return okAtivo && okDiario && okHora && okMin
}

export async function lerCronNoModal(page: Page): Promise<string | null> {
  const code = page.locator('code').filter({ hasText: /\d{2}\s+\d{2}\s+\*\s+\*\s+\*/ }).first()
  if (!(await code.isVisible({ timeout: 5000 }).catch(() => false))) return null
  return (await code.textContent())?.trim() ?? null
}

export async function abrirModalAgendamentoNcm(page: Page): Promise<void> {
  await page.goto(ROTA_NCM_INTEGRACAO, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /agendamento/i }).first().click()
  await page.getByText(/Agendamento NCM/i).first().waitFor({ state: 'visible', timeout: 15000 })
}

export async function salvarModalAgendamentoSeDirty(page: Page): Promise<boolean> {
  const btnSalvar = page.getByTestId('modal-abas-btn-salvar')
  const habilitado = await btnSalvar.isEnabled({ timeout: 5000 }).catch(() => false)
  if (!habilitado) return false

  await btnSalvar.click()
  return page.locator('[data-notification-type="success"], [role="alert"]')
    .filter({ hasText: /salv/i }).first()
    .isVisible({ timeout: 10000 }).catch(() => false)
}

export async function toolbarBadgeAgendamentoAtivo(page: Page): Promise<boolean> {
  const btn = page.getByRole('button', { name: /agendamento/i }).first()
  if (!(await btn.isVisible({ timeout: 5000 }).catch(() => false))) return false
  const texto = await btn.textContent()
  return /ativo/i.test(texto ?? '')
}

export async function validarAgendamentoAtivoDiario02h(page: Page): Promise<boolean> {
  const cron = await lerCronNoModal(page)
  if (cron !== CRON_DIARIO_02H) return false

  const ativoVisivel = await page.getByText(/^ATIVO$/).first().isVisible({ timeout: 3000 }).catch(() => false)
  const statusAtivado = await page.getByText(/status:\s*ativado/i).first().isVisible({ timeout: 3000 }).catch(() => false)
  const diarioVisivel = await page.getByText(/di[aá]rio/i).first().isVisible({ timeout: 3000 }).catch(() => false)
  return ativoVisivel && statusAtivado && diarioVisivel
}
