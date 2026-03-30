/**
 * E2E — BID Cambio: Cat.6 Formularios — Preferencias + Avaliacoes
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo, waitForLoadingToFinish, screenshotStep,
  apiGet, apiPost, seedCorretora,
  API_URL, INTERNAL_KEY, TENANT_ID, USER_ID,
} from './helpers'

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-internal-key': INTERNAL_KEY,
    'x-tenant-id': TENANT_ID,
    'x-user-id': USER_ID,
  }
}

test.describe('Preferencias do Tenant', () => {
  test('GET preferencias retorna config (seed ou defaults)', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/v1/bid-cambio/preferencias`, {
      headers: headers(),
    })
    expect(response.ok()).toBe(true)
    const prefs = await response.json()
    expect(prefs.alerta_email_vencimento).toBeDefined()
  })

  test('PUT atualizar preferencias', async ({ page }) => {
    const response = await page.request.put(`${API_URL}/api/v1/bid-cambio/preferencias`, {
      data: {
        alerta_email_vencimento: true,
        dias_antecedencia_alerta: 5,
        enviar_email_fim_de_semana: false,
      },
      headers: headers(),
    })
    expect(response.ok()).toBe(true)
    const prefs = await response.json()
    expect(prefs.dias_antecedencia_alerta).toBe(5)
    expect(prefs.enviar_email_fim_de_semana).toBe(false)
  })

  test('pagina de configuracoes carrega no frontend', async ({ page }) => {
    await navigateTo(page, '/configuracoes')
    await waitForLoadingToFinish(page)
    await screenshotStep(page, 'configuracoes-page')
  })
})

test.describe('Avaliacoes de Corretoras', () => {
  let corretoraId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    const list = await apiGet<{ data: Array<{ id: string }> }>(page, '/api/v1/bid-cambio/corretoras')
    corretoraId = list.data[0].id
    await page.close()
  })

  test('criar avaliacao com notas 1-5', async ({ page }) => {
    const result = await apiPost<{ id: string; nota_taxa: number }>(
      page,
      '/api/v1/bid-cambio/avaliacoes',
      {
        corretora_id: corretoraId,
        nota_taxa: 5,
        nota_agilidade: 4,
        nota_atendimento: 5,
        nota_confiabilidade: 4,
        comentario: 'Excelente servico, taxa competitiva',
      },
    )
    expect(result.id).toBeTruthy()
    expect(result.nota_taxa).toBe(5)
  })

  test('consultar avaliacoes da corretora', async ({ page }) => {
    const response = await page.request.get(
      `${API_URL}/api/v1/bid-cambio/avaliacoes/corretora/${corretoraId}`,
      { headers: headers() },
    )
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.corretora).toBeDefined()
    expect(data.medias).toBeDefined()
    expect(data.avaliacoes.data.length).toBeGreaterThanOrEqual(1)
  })

  test('ranking de corretoras', async ({ page }) => {
    const response = await page.request.get(
      `${API_URL}/api/v1/bid-cambio/avaliacoes/ranking`,
      { headers: headers() },
    )
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.ranking.length).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Health Check & Seguranca', () => {
  test('health check retorna ok', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/health`)
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.service).toBe('bid-cambio')
    expect(data.db).toBe('connected')
  })

  test('rota protegida sem x-internal-key retorna 401', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/v1/bid-cambio/cambios`, {
      headers: { 'x-tenant-id': TENANT_ID },
    })
    expect(response.status()).toBe(401)
  })

  test('rota protegida com chave errada retorna 401', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/v1/bid-cambio/cambios`, {
      headers: {
        'x-internal-key': 'chave-errada',
        'x-tenant-id': TENANT_ID,
      },
    })
    expect(response.status()).toBe(401)
  })

  test('master-data nao requer auth', async ({ page }) => {
    const response = await page.request.get(`${API_URL}/api/v1/master-data/moedas`)
    expect(response.ok()).toBe(true)
  })
})
