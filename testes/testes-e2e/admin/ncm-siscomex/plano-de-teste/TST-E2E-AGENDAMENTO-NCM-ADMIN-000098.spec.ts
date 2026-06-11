/**
 * TST-E2E-AGENDAMENTO-NCM-ADMIN-000098
 * Playwright — Agendamento NCM + Sincronizar Agora.
 *
 * Pré-condições (staging):
 *   - PLAYWRIGHT_BASE_URL
 *   - storageState SUPER_ADMIN
 *   - ncm_sync_agendamento no Cadastros
 *
 * Paridade 403 ADMIN: TST-FUN-AGENDAMENTO-NCM-ADMIN-000097 F3
 */
import { test, expect } from '@playwright/test'
import percySnapshot from '@percy/playwright'
import {
  CRON_DIARIO_02H,
  ROTA_NCM_INTEGRACAO,
  abrirModalAgendamentoNcm,
  configurarAgendamentoDiario02h,
  lerCronNoModal,
  salvarModalAgendamentoSeDirty,
  validarAgendamentoAtivoDiario02h,
} from '../../../../infra/admin/ncm-agendamento-ui-helpers'

const SYNC_TIMEOUT_MS = 300_000

test.describe('TST-E2E-AGENDAMENTO-NCM-ADMIN-000098 — agendamento NCM admin', () => {
  test('E1 — página Integração NCM carrega cards e histórico', async ({ page }) => {
    await page.goto(ROTA_NCM_INTEGRACAO, { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Integração NCM|NCM Siscomex|Sincronização NCM/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /sincronizar agora/i }).first()).toBeVisible()
    await percySnapshot(page, 'Admin/NCM Integracao — pagina principal')
  })

  test('E2 — abrir modal Agendamento NCM exibe aba Configuração', async ({ page }) => {
    await abrirModalAgendamentoNcm(page)
    await expect(page.getByText(/Configuração|CONFIGURAÇÃO/i).first()).toBeVisible()
    await percySnapshot(page, 'Admin/NCM — modal agendamento aberto')
  })

  test('E3 — salvar agendamento Ativado Diário 02h00', async ({ page }) => {
    await abrirModalAgendamentoNcm(page)

    const configurou = await configurarAgendamentoDiario02h(page)
    expect(configurou).toBe(true)

    await expect(page.getByTestId('modal-abas-btn-salvar')).toBeEnabled({ timeout: 5000 })

    const cronAntesSave = await lerCronNoModal(page)
    expect(cronAntesSave).toBe(CRON_DIARIO_02H)

    const salvou = await salvarModalAgendamentoSeDirty(page)
    expect(salvou).toBe(true)

    await percySnapshot(page, 'Admin/NCM — agendamento salvo')
  })

  test('E4 — reabrir modal: cron persistido, sem Alterações pendentes', async ({ page }) => {
    await abrirModalAgendamentoNcm(page)

    await expect(page.getByText(/Alterações pendentes/i)).not.toBeVisible({ timeout: 5000 })

    const ok = await validarAgendamentoAtivoDiario02h(page)
    expect(ok).toBe(true)

    await page.keyboard.press('Escape')
    await abrirModalAgendamentoNcm(page)

    expect(await lerCronNoModal(page)).toBe(CRON_DIARIO_02H)
    await expect(page.getByText(/Alterações pendentes/i)).not.toBeVisible({ timeout: 5000 })

    await percySnapshot(page, 'Admin/NCM — agendamento persistido')
  })

  test('E5 — Sincronizar Agora com sucesso', async ({ page }) => {
    await page.goto(ROTA_NCM_INTEGRACAO, { waitUntil: 'domcontentloaded' })

    const btnSync = page.getByRole('button', { name: /sincronizar agora/i }).first()
    await expect(btnSync).toBeVisible()
    await btnSync.click()

    await expect(
      page.locator('[data-notification-type="success"], [role="alert"]')
        .filter({ hasText: /sincroniza/i }).first(),
    ).toBeVisible({ timeout: SYNC_TIMEOUT_MS })

    await expect(
      page.getByText(/^manual$/i).or(page.getByText(/conclu[ií]do|sucesso|em andamento/i)).first(),
    ).toBeVisible({ timeout: 30000 })

    await percySnapshot(page, 'Admin/NCM — sincronizar agora ok')
  })
})
