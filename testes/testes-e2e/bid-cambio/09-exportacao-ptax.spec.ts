/**
 * E2E — BID Cambio: Cat.4 Exportacao + Master Data (PTAX BCB)
 */
import { test, expect } from '@playwright/test'
import { API_URL, INTERNAL_KEY, TENANT_ID, USER_ID } from './helpers'

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': INTERNAL_KEY,
    'x-tenant-id': TENANT_ID,
    'x-user-id': USER_ID,
  }
}

test.describe('Cat.4 — Exportacao', () => {
  test('exportar parcelas como CSV', async ({ page }) => {
    const response = await page.request.post(`${API_URL}/api/v1/bid-cambio/cambios/exportar`, {
      data: { formato: 'csv' },
      headers: headers(),
    })
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/csv')

    const csv = await response.text()
    expect(csv).toContain('Referencia')
    expect(csv).toContain('Status')
    expect(csv).toContain('Moeda')
    // Deve ter BOM UTF-8
    expect(csv.charCodeAt(0)).toBe(0xFEFF)
    // Separador e ponto-e-virgula (PT-BR)
    expect(csv).toContain(';')
  })

  test('exportar parcelas como XLSX (JSON estruturado)', async ({ page }) => {
    const response = await page.request.post(`${API_URL}/api/v1/bid-cambio/cambios/exportar`, {
      data: { formato: 'xlsx' },
      headers: headers(),
    })
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.formato).toBe('xlsx')
    expect(data.headers).toContain('Referencia')
    expect(data.rows.length).toBeGreaterThanOrEqual(1)
  })

  test('exportar com filtro por status', async ({ page }) => {
    const response = await page.request.post(`${API_URL}/api/v1/bid-cambio/cambios/exportar`, {
      data: { formato: 'csv', status: 'PENDENTE' },
      headers: headers(),
    })
    expect(response.ok()).toBe(true)
    const csv = await response.text()
    expect(csv).toContain('PENDENTE')
    expect(csv).not.toContain('"PAGO"')
  })

  test('exportar com filtro por moeda', async ({ page }) => {
    const response = await page.request.post(`${API_URL}/api/v1/bid-cambio/cambios/exportar`, {
      data: { formato: 'csv', moeda: 'EUR' },
      headers: headers(),
    })
    expect(response.ok()).toBe(true)
    const csv = await response.text()
    expect(csv).toContain('EUR')
  })
})

test.describe('Master Data — PTAX BCB', () => {
  test('GET /master-data/moedas retorna 7 moedas', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/v1/master-data/moedas`)
    expect(response.ok()).toBe(true)
    const moedas = await response.json()
    expect(moedas).toHaveLength(7)
    expect(moedas[0].codigo).toBe('USD')
  })

  test('GET /master-data/liquidacoes retorna 3 opcoes', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/v1/master-data/liquidacoes`)
    expect(response.ok()).toBe(true)
    const liq = await response.json()
    expect(liq).toHaveLength(3)
  })

  test('GET /master-data/metodos-vencimento retorna 7 metodos', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/v1/master-data/metodos-vencimento`)
    expect(response.ok()).toBe(true)
    const metodos = await response.json()
    expect(metodos).toHaveLength(7)
  })

  test('GET /master-data/ptax retorna cotacao do USD (BCB real)', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/v1/master-data/ptax?moeda=USD`)
    expect(response.ok()).toBe(true)
    const ptax = await response.json()
    expect(ptax.moeda).toBe('USD')
    expect(ptax.fonte).toBe('BCB/PTAX')

    if (ptax.compra !== null) {
      // PTAX disponivel — validar range razoavel
      expect(ptax.compra).toBeGreaterThan(3)
      expect(ptax.compra).toBeLessThan(10)
      expect(ptax.venda).toBeGreaterThan(ptax.compra)
    }
  })

  test('GET /master-data/ptax para EUR', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/v1/master-data/ptax?moeda=EUR`)
    expect(response.ok()).toBe(true)
    const ptax = await response.json()
    expect(ptax.moeda).toBe('EUR')
  })

  test('GET /master-data/ptax/historico retorna serie temporal', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/v1/master-data/ptax/historico?moeda=USD&dias=7`)
    expect(response.ok()).toBe(true)
    const hist = await response.json()
    expect(hist.moeda).toBe('USD')
    expect(hist.fonte).toBe('BCB/PTAX')

    if (hist.dados.length > 0) {
      expect(hist.dados[0].compra).toBeGreaterThan(0)
      expect(hist.dados[0].venda).toBeGreaterThan(0)
      expect(hist.dados[0].data).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
