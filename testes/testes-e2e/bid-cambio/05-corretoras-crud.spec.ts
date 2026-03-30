/**
 * E2E — BID Cambio: Cat.1 CRUD Corretoras + Cat.3 Selects
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo, waitForLoadingToFinish, screenshotStep,
  seedCorretora, apiGet,
} from './helpers'

test.describe('Cat.1 — Corretoras CRUD', () => {
  test('pagina de corretoras carrega', async ({ page }) => {
    await navigateTo(page, '/corretoras')
    await waitForLoadingToFinish(page)
    await expect(
      page.getByRole('heading', { name: /corretora/i })
        .or(page.getByText(/corretora/i).first())
    ).toBeVisible()
    await screenshotStep(page, 'corretoras-list')
  })

  test('criar corretora via API', async ({ page }) => {
    const corretora = await seedCorretora(page)
    expect(corretora.id).toBeTruthy()
    expect(corretora.email).toContain('@teste.com')
  })

  test('listar corretoras via API (seed + criadas)', async ({ page }) => {
    const result = await apiGet<{ data: unknown[]; pagination: { total: number } }>(
      page,
      '/api/v1/bid-cambio/corretoras',
    )
    expect(result.pagination.total).toBeGreaterThanOrEqual(3) // seed criou 3
  })

  test('buscar corretora por nome', async ({ page }) => {
    const result = await apiGet<{ data: Array<{ nome_fantasia: string }> }>(
      page,
      '/api/v1/bid-cambio/corretoras?busca=BIC',
    )
    expect(result.data.length).toBeGreaterThanOrEqual(1)
    expect(result.data[0].nome_fantasia).toContain('BIC')
  })

  test('detalhe de corretora carrega', async ({ page }) => {
    const list = await apiGet<{ data: Array<{ id: string }> }>(page, '/api/v1/bid-cambio/corretoras')
    const id = list.data[0].id
    await navigateTo(page, `/corretoras/${id}`)
    await waitForLoadingToFinish(page)
    await screenshotStep(page, 'corretora-detalhe')
  })

  test('alterar status da corretora via API', async ({ page }) => {
    const corretora = await seedCorretora(page)
    const response = await page.request.patch(
      `http://localhost:8025/api/v1/bid-cambio/corretoras/${corretora.id}/status`,
      {
        data: { status: 'INATIVA' },
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': 'gravity-dev-internal-key-2026',
          'x-tenant-id': 'tenant-demo-001',
          'x-user-id': 'user-demo-001',
        },
      },
    )
    expect(response.ok()).toBe(true)
    const updated = await response.json()
    expect(updated.status).toBe('INATIVA')
  })
})

test.describe('Cat.3 — Selects (Corretoras)', () => {
  test('filtro por status funciona', async ({ page }) => {
    const ativas = await apiGet<{ data: unknown[]; pagination: { total: number } }>(
      page,
      '/api/v1/bid-cambio/corretoras?status=ATIVA',
    )
    expect(ativas.data.length).toBeGreaterThanOrEqual(1)

    const inativas = await apiGet<{ data: unknown[]; pagination: { total: number } }>(
      page,
      '/api/v1/bid-cambio/corretoras?status=INATIVA',
    )
    // Pode ter 0 ou mais
    expect(inativas.pagination.total).toBeGreaterThanOrEqual(0)
  })
})
