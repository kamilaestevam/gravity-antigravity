/**
 * E2E — BID Cambio: Cat.11 Fluxo Especifico — Gestao de Parcelas
 * Fluxo: agendar → pagar → retornar pendente + regras de negocio
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo, waitForLoadingToFinish, screenshotStep,
  apiGet, apiPost, API_URL, INTERNAL_KEY, TENANT_ID, USER_ID,
} from './helpers'

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': INTERNAL_KEY,
    'x-tenant-id': TENANT_ID,
    'x-user-id': USER_ID,
  }
}

test.describe('Cat.11 — Gestao de Parcelas (Pilar 1)', () => {
  let parcelaPendenteId: string

  test('1. Listar parcelas pendentes (seed data)', async ({ page }) => {
    const result = await apiGet<{ data: Array<{ id: string; status: string }> }>(
      page,
      '/api/v1/bid-cambio/cambios?status=PENDENTE',
    )
    expect(result.data.length).toBeGreaterThanOrEqual(1)
    parcelaPendenteId = result.data[0].id
  })

  test('2. Agendar parcela (PENDENTE → AGENDADO)', async ({ page }) => {
    const result = await apiPost<{ agendadas: number }>(
      page,
      '/api/v1/bid-cambio/cambios/agendar',
      { parcela_ids: [parcelaPendenteId], data_agendamento: '2026-04-25' },
    )
    expect(result.agendadas).toBe(1)

    // Confirmar status
    const parcela = await apiGet<{ id: string; status: string }>(
      page,
      `/api/v1/bid-cambio/cambios/${parcelaPendenteId}`,
    )
    expect(parcela.status).toBe('AGENDADO')
  })

  test('3. Pagar parcela (AGENDADO → PAGO)', async ({ page }) => {
    const result = await apiPost<{ parcela_id: string; status: string; valor_pago: number; valor_pago_brl: number; taxa: number }>(
      page,
      '/api/v1/bid-cambio/cambios/pagar',
      {
        parcela_id: parcelaPendenteId,
        valor_pago: 36000,
        taxa_fechamento: 5.2100,
        banco_corretora: 'Cambio Express',
      },
    )
    expect(result.status).toBe('PAGO')
    expect(result.valor_pago).toBe(36000)
    expect(result.valor_pago_brl).toBeGreaterThan(0)
    expect(result.taxa).toBe(5.21)
  })

  test('4. Retornar parcela para pendente (PAGO → PENDENTE)', async ({ page }) => {
    const result = await apiPost<{ parcela_id: string; status: string }>(
      page,
      '/api/v1/bid-cambio/cambios/retornar-pendente',
      { parcela_id: parcelaPendenteId },
    )
    expect(result.status).toBe('PENDENTE')
  })

  test('5. RN: rejeitar pagamento que excede cambio_total', async ({ page }) => {
    const response = await page.request.post(`${API_URL}/api/v1/bid-cambio/cambios/pagar`, {
      data: {
        parcela_id: parcelaPendenteId,
        valor_pago: 999999, // excede cambio_total
        taxa_fechamento: 5.20,
        banco_corretora: 'Test',
      },
      headers: headers(),
    })
    expect(response.ok()).toBe(false)
    const body = await response.json()
    expect(body.error.code).toBe('EXCEEDS_LIMIT')
  })

  test('6. Dashboard reflete dados apos operacoes', async ({ page }) => {
    const dashboard = await apiGet<{
      parcelas: { total: number; pendentes: number; agendadas: number }
    }>(page, '/api/v1/bid-cambio/dashboard')

    expect(dashboard.parcelas.total).toBeGreaterThanOrEqual(5)
  })

  test('7. Exportar parcelas CSV via API', async ({ page }) => {
    const response = await page.request.post(`${API_URL}/api/v1/bid-cambio/cambios/exportar`, {
      data: { formato: 'csv' },
      headers: headers(),
    })
    expect(response.ok()).toBe(true)
    const contentType = response.headers()['content-type']
    expect(contentType).toContain('text/csv')
    const body = await response.text()
    expect(body).toContain('Referencia')
    expect(body).toContain('USD')
  })

  test('8. Navegar para pagina de cambios no frontend', async ({ page }) => {
    await navigateTo(page, '/cambios')
    await waitForLoadingToFinish(page)
    await screenshotStep(page, 'cambios-apos-operacoes')
  })
})
